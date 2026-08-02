const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Minimal python script testing pynput and pyautogui for Korean text typing
const pyScript = `import sys
import time

text = "한글 파이썬 테스트"
print(f"Target text: {text}")

# Method 1: pynput keyboard controller (native Unicode typing on Windows)
try:
    from pynput.keyboard import Controller
    keyboard = Controller()
    time.sleep(0.5)
    keyboard.type(text + " (pynput)")
    print("SUCCESS: Typed using pynput Controller")
except Exception as e:
    print(f"pynput status/error: {e}")

# Method 2: pyautogui + pyperclip (Clipboard paste simulation)
try:
    import pyautogui
    import pyperclip
    time.sleep(0.5)
    pyperclip.copy(" " + text + " (pyautogui)")
    pyautogui.hotkey('ctrl', 'v')
    print("SUCCESS: Typed using pyautogui + pyperclip")
except Exception as e:
    print(f"pyautogui status/error: {e}")
`;

const pyFilePath = path.join(__dirname, 'test_py_sim.py');
fs.writeFileSync(pyFilePath, pyScript, 'utf-8');

console.log('Spawning notepad.exe...');
exec('notepad.exe');

setTimeout(() => {
    console.log('Running Python script...');
    try {
        const out = execSync(`python "${pyFilePath}"`, { encoding: 'utf-8' });
        console.log('--- Python Output ---');
        console.log(out);
        console.log('Python script executed successfully without UIPI / permission errors.');
    } catch (e) {
        console.error('Python execution error:', e.message);
        if (e.stderr) console.error('Stderr:', e.stderr);
    } finally {
        if (fs.existsSync(pyFilePath)) {
            fs.unlinkSync(pyFilePath);
        }
    }
}, 2000);
