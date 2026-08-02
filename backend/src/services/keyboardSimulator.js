const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class KeyboardSimulator {
  constructor() {
    this.enabled = true;
    this.ready = false;
    this.queue = Promise.resolve();
    this.exePath = path.join(__dirname, 'KeySim.exe');
    this._initCSharp();
  }

  _initCSharp() {
    try {
      const csPath = path.join(__dirname, 'KeySim.cs');
      const csCode = `
using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

public class KeySim {
    [StructLayout(LayoutKind.Sequential)]
    public struct KEYBDINPUT
    {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MOUSEINPUT
    {
        public int dx;
        public int dy;
        public uint mouseData;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct HARDWAREINPUT
    {
        public uint uMsg;
        public ushort wParamL;
        public ushort wParamH;
    }

    [StructLayout(LayoutKind.Explicit)]
    public struct INPUT_UNION
    {
        [FieldOffset(0)] public MOUSEINPUT mi;
        [FieldOffset(0)] public KEYBDINPUT ki;
        [FieldOffset(0)] public HARDWAREINPUT hi;
    }

    [StructLayout(LayoutKind.Sequential, Size=40)]
    public struct INPUT
    {
        public uint type;
        public INPUT_UNION U;
    }

    [DllImport("user32.dll")]
    public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    const uint INPUT_KEYBOARD = 1;
    const uint KEYEVENTF_KEYDOWN = 0x0000;
    const uint KEYEVENTF_KEYUP = 0x0002;
    const uint KEYEVENTF_UNICODE = 0x0004;

    public static void Main(string[] args) {
        if (args.Length < 2) return;
        string cmd = args[0];
        string arg = args[1];

        if (cmd == "type") {
            char[] chars = arg.ToCharArray();
            INPUT[] inputs = new INPUT[chars.Length * 2];
            for (int i = 0; i < chars.Length; i++) {
                inputs[i*2] = new INPUT { type = INPUT_KEYBOARD, U = new INPUT_UNION { ki = new KEYBDINPUT { wVk = 0, wScan = chars[i], dwFlags = KEYEVENTF_UNICODE, time = 0, dwExtraInfo = IntPtr.Zero } } };
                inputs[i*2+1] = new INPUT { type = INPUT_KEYBOARD, U = new INPUT_UNION { ki = new KEYBDINPUT { wVk = 0, wScan = chars[i], dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP, time = 0, dwExtraInfo = IntPtr.Zero } } };
            }
            SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
        } else if (cmd == "delete") {
            int count;
            if (!int.TryParse(arg, out count)) return;
            for (int i = 0; i < count; i++) {
                INPUT[] inputs = new INPUT[2];
                inputs[0] = new INPUT { type = INPUT_KEYBOARD, U = new INPUT_UNION { ki = new KEYBDINPUT { wVk = 0x08, wScan = 0, dwFlags = KEYEVENTF_KEYDOWN, time = 0, dwExtraInfo = IntPtr.Zero } } };
                inputs[1] = new INPUT { type = INPUT_KEYBOARD, U = new INPUT_UNION { ki = new KEYBDINPUT { wVk = 0x08, wScan = 0, dwFlags = KEYEVENTF_KEYUP, time = 0, dwExtraInfo = IntPtr.Zero } } };
                SendInput(2, inputs, Marshal.SizeOf(typeof(INPUT)));
                Thread.Sleep(15);
            }
        } else if (cmd == "replace") {
            if (args.Length < 3) return;
            int count;
            if (int.TryParse(args[1], out count) && count > 0) {
                for (int i = 0; i < count; i++) {
                    INPUT[] delInputs = new INPUT[2];
                    delInputs[0] = new INPUT { type = INPUT_KEYBOARD, U = new INPUT_UNION { ki = new KEYBDINPUT { wVk = 0x08, wScan = 0, dwFlags = KEYEVENTF_KEYDOWN, time = 0, dwExtraInfo = IntPtr.Zero } } };
                    delInputs[1] = new INPUT { type = INPUT_KEYBOARD, U = new INPUT_UNION { ki = new KEYBDINPUT { wVk = 0x08, wScan = 0, dwFlags = KEYEVENTF_KEYUP, time = 0, dwExtraInfo = IntPtr.Zero } } };
                    SendInput(2, delInputs, Marshal.SizeOf(typeof(INPUT)));
                    Thread.Sleep(15);
                }
                Thread.Sleep(20);
            }
            
            string text = args[2];
            if (!string.IsNullOrEmpty(text)) {
                char[] chars = text.ToCharArray();
                INPUT[] typeInputs = new INPUT[chars.Length * 2];
                for (int i = 0; i < chars.Length; i++) {
                    typeInputs[i*2] = new INPUT { type = INPUT_KEYBOARD, U = new INPUT_UNION { ki = new KEYBDINPUT { wVk = 0, wScan = chars[i], dwFlags = KEYEVENTF_UNICODE, time = 0, dwExtraInfo = IntPtr.Zero } } };
                    typeInputs[i*2+1] = new INPUT { type = INPUT_KEYBOARD, U = new INPUT_UNION { ki = new KEYBDINPUT { wVk = 0, wScan = chars[i], dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP, time = 0, dwExtraInfo = IntPtr.Zero } } };
                }
                SendInput((uint)typeInputs.Length, typeInputs, Marshal.SizeOf(typeof(INPUT)));
            }
        }
    }
}
      `.trim();
      
      fs.writeFileSync(csPath, csCode, 'utf8');
      
      const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe';
      if (!fs.existsSync(this.exePath) || fs.statSync(csPath).mtime > fs.statSync(this.exePath).mtime) {
        console.log('[KeySim] Compiling KeySim.cs...');
        execSync(`"${cscPath}" /nologo /out:"${this.exePath}" "${csPath}"`, { stdio: 'inherit' });
      }

      this.ready = true;
      console.log('[KeySim] Ready — C# Executable initialized');
    } catch (error) {
      console.error('[KeySim] Failed to initialize C# component:', error);
    }
  }

  _enqueue(task) {
    this.queue = this.queue.then(() => task().catch(err => console.error('[KeySim] Error:', err)));
    return this.queue;
  }

  _runExe(args) {
    return new Promise((resolve, reject) => {
      const p = spawn(this.exePath, args);
      p.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`KeySim.exe exited with code ${code}`));
      });
      p.on('error', reject);
    });
  }

  async _typeTextTask(text) {
    if (!this.enabled || !this.ready || !text) return;
    try {
      await this._runExe(['type', text]);
      console.log(`[KeySim] typeText sent events for "${text}"`);
    } catch (err) {
      console.error('[KeySim] typeText error:', err.message);
    }
  }

  async _deleteCharsTask(count) {
    if (!this.enabled || !this.ready || count <= 0) return;
    try {
      await this._runExe(['delete', count.toString()]);
      console.log(`[KeySim] deleteChars sent events for count ${count}`);
    } catch (err) {
      console.error('[KeySim] deleteChars error:', err.message);
    }
  }

  async typeText(text) {
    return this._enqueue(() => this._typeTextTask(text));
  }

  async deleteChars(count) {
    return this._enqueue(() => this._deleteCharsTask(count));
  }

  async _replaceTask(oldLen, newText) {
    if (!this.enabled || !this.ready) return;
    try {
      await this._runExe(['replace', oldLen.toString(), newText || '']);
      console.log(`[KeySim] replace sent events for delete ${oldLen}, type "${newText}"`);
    } catch (err) {
      console.error('[KeySim] replace error:', err.message);
    }
  }

  async replaceInterim(oldLen, newText) {
    return this._enqueue(async () => {
      await this._replaceTask(oldLen, newText);
    });
  }

  async commitFinal(interimLen, finalText) {
    return this._enqueue(async () => {
      await this._replaceTask(interimLen, finalText);
    });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`[KeySim] ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  isEnabled() {
    return this.enabled;
  }

  destroy() {
    this.ready = false;
  }
}

module.exports = KeyboardSimulator;
