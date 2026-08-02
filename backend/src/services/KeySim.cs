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