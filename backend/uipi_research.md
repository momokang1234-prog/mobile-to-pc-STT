# Research Findings: Why Node.js `koffi` `SendInput` returns `ERROR_ACCESS_DENIED` (Error 5) while C# `.exe` Succeeds

## 1. Executive Summary (Bottom Line Up Front)
When calling Win32 `SendInput` via `koffi` in Node.js, `SendInput` fails and `GetLastError()` returns `ERROR_ACCESS_DENIED` (5), whereas a C# executable (`KeySim.exe`) spawned by the exact same Node.js process succeeds.

This occurs due to **two primary technical mechanisms** operating at the Windows Kernel (`win32k.sys`) and FFI boundary:

1. **Kernel Memory Probing & FFI Pointer Misalignment (Primary Technical Cause)**:
   In Windows kernel (`win32kbase!NtUserSendInput`), when `SendInput` is invoked, the kernel calls `ProbeForRead()` to validate the `pInputs` buffer pointer. When `koffi` passes a JS array of objects to a parameter declared as `INPUT *` (or with imprecise nested union packing), `koffi` fails to construct a contiguous, 8-byte aligned, 40-byte struct array in unmanaged memory. `ProbeForRead` fails with `STATUS_ACCESS_VIOLATION` (`0xC0000005`), which `NtUserSendInput` catches internally and maps to Win32 Error `ERROR_ACCESS_DENIED` (5). In contrast, C# P/Invoke allocates a pinned, contiguous unmanaged memory block (`Marshal.SizeOf(INPUT) == 40`).

2. **Thread Desktop & Window Station Context**:
   `SendInput` requires the calling thread to be attached to the active interactive desktop (`WinSta0\default`) with `DESKTOP_JOURNALPLAYBACK` privileges. A standalone C# process initializes its main thread with full interactive desktop association upon process startup. Node.js FFI calls executed on libuv background worker threads or non-GUI threads lack an active thread desktop handle (`GetThreadDesktop` returns null/uninitialized), causing `win32k.sys` to reject `SendInput` with Error 5.

---

## 2. Detailed Technical Breakdown

### A. Kernel Buffer Validation (`NtUserSendInput` & `ProbeForRead`)
When `SendInput(cInputs, pInputs, cbSize)` is called:
1. Kernel checks `cbSize`: On 64-bit Windows, `sizeof(INPUT)` must **strictly** be **40 bytes** (`0x28`).
2. Kernel executes `ProbeForRead(pInputs, cInputs * 40, sizeof(ULONG_PTR))`.
3. **Koffi Behavior**:
   - In `src/services/keyboardSimulator.js` and `test-raw.js`, `SendInput` is declared as:
     `user32.func('uint32_t __stdcall SendInput(uint32_t nInputs, INPUT *pInputs, int cbSize)')`
   - String prototype `INPUT *pInputs` tells Koffi to expect a pointer to a **single** struct, not a C array. Passing a JS array `[ { type: 1, union: ... } ]` causes Koffi to pass either an invalid memory pointer or an unaligned temporary buffer.
   - Furthermore, nested Koffi `union` structures (`INPUT_UNION` containing `KEYBDINPUT`) often produce incorrect struct padding unless explicitly declared using `koffi.array(INPUT)`.
   - When kernel `NtUserSendInput` attempts to read `cInputs` array elements from `pInputs`, it triggers a memory access violation (`0xC0000005`). `NtUserSendInput` catches this kernel exception and returns `ERROR_ACCESS_DENIED` (5).
4. **C# Behavior**:
   - C# uses `[StructLayout(LayoutKind.Explicit, Size = 40)]` or `LayoutKind.Sequential`.
   - C# P/Invoke automatically marshals `INPUT[]` into a single, contiguous, 8-byte aligned C-array buffer before calling `user32.dll`. The kernel's `ProbeForRead` check passes seamlessly.

### B. Thread Desktop & Window Station Access (`GetThreadDesktop`)
1. Win32 input injection (`SendInput`) is strictly scoped to threads that are assigned to the interactive desktop (`WinSta0\default`) and have input injection permissions.
2. **C# Process Lifecycle**:
   - `child_process.execSync('KeySim.exe')` spawns a standard Win32 console application.
   - The OS process startup routine binds `KeySim.exe`'s primary thread to the active user desktop session automatically.
3. **Node.js / Koffi Thread Lifecycle**:
   - Node.js main thread is an asynchronous event loop without a Win32 message queue.
   - Calls originating from libuv worker threads or background FFI threads in Koffi do not have an initialized thread desktop handle (`GetThreadDesktop(GetCurrentThreadId())`). `SendInput` invoked from such threads is denied by `win32k.sys` with Error 5.

### C. UIPI (User Interface Privilege Isolation)
- UIPI blocks lower-integrity processes from injecting inputs into higher-integrity (Admin/Elevated) windows.
- If the target window is elevated, standard-integrity processes calling `SendInput` will fail.
- While UIPI applies to both Node.js and C# if neither is elevated, C# binaries can be assigned UAC manifests or run cleanly within child process tokens, whereas Node.js process integrity determines the FFI call scope.

---

## 3. Comparison Matrix

| Feature | Node.js `koffi` FFI | C# Executable (`KeySim.exe`) |
| :--- | :--- | :--- |
| **Memory Allocation** | JS object array dynamically converted by FFI (prone to pointer/struct array mismatch) | Contiguous unmanaged array (`INPUT[]`) pinned by CLR P/Invoke |
| **Struct Size (`cbSize`)** | 40 bytes (if union correctly defined), but `INPUT *` declaration limits array passing | Explicitly forced to 40 bytes (`LayoutKind.Explicit, Size = 40`) |
| **Kernel Probing (`ProbeForRead`)** | Fails with `0xC0000005` (mapped to Win32 Error 5) due to pointer misalignment | Passes kernel read probe successfully |
| **Thread Desktop Context** | May run on worker thread without interactive desktop handle | Primary thread auto-bound to `WinSta0\default` by OS |
| **Reliability for SendInput** | Low / Fragile in FFI | High / Robust native Win32 execution |

---

## 4. Recommendations & Fixes

1. **Use `KeySim.exe` (C# Helper) as Production Solution**:
   - Spawning `KeySim.exe` via `child_process` (or building a lightweight native C++ node addon) completely bypasses Koffi FFI marshaling bugs and thread desktop issues.
   - This approach is clean, self-contained, and reliably simulates both Korean Unicode characters (`KEYEVENTF_UNICODE`) and Virtual Key backspaces (`VK_BACK`).

2. **If Fixing Koffi directly is required**:
   - Change `SendInput` signature in Koffi to use `koffi.array(INPUT)` instead of `INPUT *`.
   - Alternatively, construct raw Node `Buffer` with manual byte offsets (40 bytes per struct on x64) and pass `const void *` to ensure binary alignment.
   - Ensure the `SendInput` call executes on Node's main thread.
