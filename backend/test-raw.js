const koffi = require('koffi');

const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');

const KEYBDINPUT = koffi.struct('KEYBDINPUT', {
    wVk: 'uint16_t',
    wScan: 'uint16_t',
    dwFlags: 'uint32_t',
    time: 'uint32_t',
    dwExtraInfo: 'uintptr_t'
});

const MOUSEINPUT = koffi.struct('MOUSEINPUT', {
    dx: 'int32_t',
    dy: 'int32_t',
    mouseData: 'uint32_t',
    dwFlags: 'uint32_t',
    time: 'uint32_t',
    dwExtraInfo: 'uintptr_t'
});

const HARDWAREINPUT = koffi.struct('HARDWAREINPUT', {
    uMsg: 'uint32_t',
    wParamL: 'uint16_t',
    wParamH: 'uint16_t'
});

const INPUT_UNION = koffi.union('INPUT_UNION', {
    mi: MOUSEINPUT,
    ki: KEYBDINPUT,
    hi: HARDWAREINPUT
});

const INPUT = koffi.struct('INPUT', {
    type: 'uint32_t',
    union: INPUT_UNION
});

const SendInput = user32.func('uint32_t __stdcall SendInput(uint32_t nInputs, _In_reads_(nInputs) INPUT *pInputs, int cbSize)');
const GetLastError = kernel32.func('uint32_t __stdcall GetLastError()');

const text = "한글 테스트";
const inputs = [];
for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    inputs.push({
        type: 1,
        union: { ki: { wVk: 0, wScan: charCode, dwFlags: 0x0004, time: 0, dwExtraInfo: 0 } }
    });
    inputs.push({
        type: 1,
        union: { ki: { wVk: 0, wScan: charCode, dwFlags: 0x0004 | 0x0002, time: 0, dwExtraInfo: 0 } }
    });
}

const cbSize = koffi.sizeof(INPUT);
const sent = SendInput(inputs.length, inputs, cbSize);
const err = GetLastError();

console.log(`sent = ${sent}, error = ${err}`);
