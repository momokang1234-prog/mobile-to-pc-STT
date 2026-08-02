const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const psScriptPath = path.join(__dirname, 'test-ps-final.ps1');

const psScriptContent = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class KeySimPS {
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

    public static void Type(string text) {
        INPUT[] inputs = new INPUT[text.Length * 2];
        for (int i = 0; i < text.Length; i++) {
            inputs[i * 2] = new INPUT {
                type = 1,
                ki = new KEYBDINPUT { wScan = (ushort)text[i], dwFlags = 0x0004 } // KEYEVENTF_UNICODE = 0x0004
            };
            inputs[i * 2 + 1] = new INPUT {
                type = 1,
                ki = new KEYBDINPUT { wScan = (ushort)text[i], dwFlags = 0x0006 } // KEYEVENTF_UNICODE | KEYEVENTF_KEYUP = 0x0006
            };
        }
        SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static void Delete(int count) {
        INPUT[] inputs = new INPUT[count * 2];
        for (int i = 0; i < count; i++) {
            inputs[i * 2] = new INPUT {
                type = 1,
                ki = new KEYBDINPUT { wVk = 0x08, dwFlags = 0x0000 } // VK_BACK = 0x08
            };
            inputs[i * 2 + 1] = new INPUT {
                type = 1,
                ki = new KEYBDINPUT { wVk = 0x08, dwFlags = 0x0002 } // KEYEVENTF_KEYUP = 0x0002
            };
        }
        SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
    }
}
"@

param([string]$TextToType = "파워쉘 한글 입력 테스트 123!")

[KeySimPS]::Type($TextToType)
`;

// PowerShell 5.1 requires UTF-8 with BOM (\ufeff) to decode Korean characters in script files correctly.
fs.writeFileSync(psScriptPath, '\ufeff' + psScriptContent, 'utf8');
console.log('Created test-ps-final.ps1 with UTF-8 BOM.');

console.log('Spawning Notepad for test...');
exec('notepad.exe');

setTimeout(() => {
    console.log('Running PowerShell script test-ps-final.ps1...');
    try {
        const out = execSync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`, { encoding: 'utf8' });
        console.log('PS Output:', out);
        console.log('Successfully executed test-ps-final.ps1');
    } catch (e) {
        console.error('Failed to run PowerShell script:', e.message);
    }
}, 2000);
