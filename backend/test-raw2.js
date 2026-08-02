const koffi = require('koffi');

const user32 = koffi.load('user32.dll');

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

const SendInput = user32.func('uint32_t __stdcall SendInput(uint32_t cInputs, INPUT *pInputs, int cbSize)');

const inputs = [
    { type: 1, union: { ki: { wVk: 0, wScan: 0xAC00, dwFlags: 0x0004, time: 0, dwExtraInfo: 0 } } },
    { type: 1, union: { ki: { wVk: 0, wScan: 0xAC00, dwFlags: 0x0004 | 0x0002, time: 0, dwExtraInfo: 0 } } }
];

try {
    const cbSize = koffi.sizeof(INPUT);
    
    // Method 1: Just pass the array
    console.log("Method 1");
    const sent = SendInput(inputs.length, inputs, cbSize);
    console.log("Sent:", sent);
} catch (err) {
    console.error("Method 1 Error:", err.message);
}

try {
    const cbSize = koffi.sizeof(INPUT);
    
    // Method 2: pointer alloc
    console.log("Method 2");
    const ArrayType = koffi.array(INPUT, inputs.length);
    const buf = koffi.alloc(ArrayType);
    console.log("Buf allocated");
    // Maybe koffi.encode is the one throwing the error?
    koffi.encode(buf, ArrayType, inputs);
    console.log("Buf encoded");
    const sent = SendInput(inputs.length, buf, cbSize);
    console.log("Sent:", sent);
} catch (err) {
    console.error("Method 2 Error:", err.message);
}
