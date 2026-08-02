
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class KeySimPS {
    [StructLayout(LayoutKind.Sequential)]
    public struct KEYBDINPUT {
        public ushort wVk; public ushort wScan; public uint dwFlags; public uint time; public IntPtr dwExtraInfo;
    }
    [StructLayout(LayoutKind.Explicit)]
    public struct INPUT {
        [FieldOffset(0)] public int type;
        [FieldOffset(8)] public KEYBDINPUT ki;
    }
    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    public static void Type(string text) {
        INPUT[] inputs = new INPUT[text.Length * 2];
        for (int i = 0; i < text.Length; i++) {
            inputs[i * 2] = new INPUT { type = 1, ki = new KEYBDINPUT { wScan = (ushort)text[i], dwFlags = 0x0004 } };
            inputs[i * 2 + 1] = new INPUT { type = 1, ki = new KEYBDINPUT { wScan = (ushort)text[i], dwFlags = 0x0006 } };
        }
        SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
    }
}
"@
[KeySimPS]::Type("한글테스트3")
