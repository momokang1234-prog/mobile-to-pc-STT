const koffi = require('koffi');
const { exec } = require('child_process');

const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');

const SendInput = user32.func('uint32_t __stdcall SendInput(uint32_t cInputs, const void *pInputs, int cbSize)');
const GetLastError = kernel32.func('uint32_t __stdcall GetLastError()');

// Spawn notepad
console.log('Spawning notepad...');
exec('notepad.exe');

setTimeout(() => {
    const text = "한글테스트1";
    const INPUT_SIZE = 40;
    const buf = Buffer.alloc(text.length * 2 * INPUT_SIZE);

    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        let offset = (i * 2) * INPUT_SIZE;
        buf.writeUInt32LE(1, offset);
        buf.writeUInt16LE(0, offset + 8);
        buf.writeUInt16LE(charCode, offset + 10);
        buf.writeUInt32LE(0x0004, offset + 12);
        buf.writeUInt32LE(0, offset + 16);
        buf.writeBigUInt64LE(0n, offset + 24);

        offset = (i * 2 + 1) * INPUT_SIZE;
        buf.writeUInt32LE(1, offset);
        buf.writeUInt16LE(0, offset + 8);
        buf.writeUInt16LE(charCode, offset + 10);
        buf.writeUInt32LE(0x0006, offset + 12); // 4 | 2
        buf.writeUInt32LE(0, offset + 16);
        buf.writeBigUInt64LE(0n, offset + 24);
    }

    console.log("Typing into notepad...");
    const sent = SendInput(text.length * 2, buf, INPUT_SIZE);
    console.log("Sent:", sent);
    if (sent === 0) console.log("Error:", GetLastError());
}, 2000);
