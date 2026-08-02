const fs = require('fs');
const { execSync, exec } = require('child_process');

const csCode = `
using System;
using System.Runtime.InteropServices;

public class KeySim {
    [StructLayout(LayoutKind.Sequential)]
    public struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }
    
    // Force size to 40 bytes (64-bit Windows)
    [StructLayout(LayoutKind.Explicit, Size = 40)]
    public struct INPUT {
        [FieldOffset(0)] public int type;
        [FieldOffset(8)] public KEYBDINPUT ki;
    }
    
    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    public static void Main(string[] args) {
        if (args.Length == 0) return;
        string text = args[0];
        INPUT[] inputs = new INPUT[text.Length * 2];
        for (int i = 0; i < text.Length; i++) {
            inputs[i * 2] = new INPUT { type = 1, ki = new KEYBDINPUT { wScan = (ushort)text[i], dwFlags = 0x0004 } };
            inputs[i * 2 + 1] = new INPUT { type = 1, ki = new KEYBDINPUT { wScan = (ushort)text[i], dwFlags = 0x0006 } };
        }
        uint sent = SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
        if (sent == 0) {
            Console.WriteLine("Error: " + Marshal.GetLastWin32Error());
        } else {
            Console.WriteLine("Sent: " + sent);
        }
    }
}
`;

fs.writeFileSync('KeySim.cs', csCode);
console.log('Compiling C#...');
try {
    execSync('C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe /out:KeySim.exe KeySim.cs');
    console.log('Compiled KeySim.exe. Running...');
    
    // We don't spawn notepad so we can see if it types into the current focus
    const out = execSync('KeySim.exe "한글테스트2"');
    console.log(out.toString());
} catch(e) {
    console.error('Compilation failed', e.message);
}
