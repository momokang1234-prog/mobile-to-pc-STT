const koffi = require('koffi');
const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');

const SendInput = user32.func('uint32_t __stdcall SendInput(uint32_t cInputs, const void *pInputs, int cbSize)');
const GetLastError = kernel32.func('uint32_t __stdcall GetLastError()');

const text = "한글";
const INPUT_SIZE = 40;
const buf = Buffer.alloc(text.length * 2 * INPUT_SIZE);

for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    
    // Key Down
    let offset = (i * 2) * INPUT_SIZE;
    buf.writeUInt32LE(1, offset); // type = INPUT_KEYBOARD
    buf.writeUInt16LE(0, offset + 8); // wVk
    buf.writeUInt16LE(charCode, offset + 10); // wScan
    buf.writeUInt32LE(0x0004, offset + 12); // dwFlags = KEYEVENTF_UNICODE
    buf.writeUInt32LE(0, offset + 16); // time
    buf.writeBigUInt64LE(0n, offset + 24); // dwExtraInfo

    // Key Up
    offset = (i * 2 + 1) * INPUT_SIZE;
    buf.writeUInt32LE(1, offset); // type = INPUT_KEYBOARD
    buf.writeUInt16LE(0, offset + 8); // wVk
    buf.writeUInt16LE(charCode, offset + 10); // wScan
    buf.writeUInt32LE(0x0004 | 0x0002, offset + 12); // dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP
    buf.writeUInt32LE(0, offset + 16); // time
    buf.writeBigUInt64LE(0n, offset + 24); // dwExtraInfo
}

setTimeout(() => {
    console.log("Typing...");
    const sent = SendInput(text.length * 2, buf, INPUT_SIZE);
    console.log("Sent:", sent);
    if (sent === 0) {
        console.log("Error:", GetLastError());
    }
}, 2000);
