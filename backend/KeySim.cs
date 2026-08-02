
using System;
using System.Runtime.InteropServices;
using System.Text;

public class KeySim {
    [StructLayout(LayoutKind.Sequential)]
    public struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }
    
    [StructLayout(LayoutKind.Explicit, Size = 40)]
    public struct INPUT {
        [FieldOffset(0)] public int type;
        [FieldOffset(8)] public KEYBDINPUT ki;
    }
    
    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    public static void Main(string[] args) {
        if (args.Length < 2) return;
        string command = args[0];
        
        if (command == "type") {
            string text = args[1];
            INPUT[] inputs = new INPUT[text.Length * 2];
            for (int i = 0; i < text.Length; i++) {
                inputs[i * 2] = new INPUT { type = 1, ki = new KEYBDINPUT { wScan = (ushort)text[i], dwFlags = 0x0004 } };
                inputs[i * 2 + 1] = new INPUT { type = 1, ki = new KEYBDINPUT { wScan = (ushort)text[i], dwFlags = 0x0006 } };
            }
            SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
        } 
        else if (command == "delete") {
            int count = int.Parse(args[1]);
            INPUT[] inputs = new INPUT[count * 2];
            for (int i = 0; i < count; i++) {
                inputs[i * 2] = new INPUT { type = 1, ki = new KEYBDINPUT { wVk = 0x08, dwFlags = 0x0000 } }; // VK_BACK = 0x08
                inputs[i * 2 + 1] = new INPUT { type = 1, ki = new KEYBDINPUT { wVk = 0x08, dwFlags = 0x0002 } };
            }
            SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
        }
    }
}
