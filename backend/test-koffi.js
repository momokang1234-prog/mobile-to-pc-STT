const KeyboardSimulator = require('./src/services/keyboardSimulator');

async function runTest() {
  console.log('[Test] Initializing KeyboardSimulator...');
  const keySim = new KeyboardSimulator();

  // Give the user 3 seconds to focus a text editor
  console.log('[Test] Please focus Notepad or a text field NOW...');
  console.log('[Test] Typing will start in 3 seconds.');
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('[Test] Typing: "안녕하세요. 한글 입력 테스트입니다."');
  await keySim.typeText("안녕하세요. 한글 입력 테스트입니다.");
  
  // Wait a bit to ensure async operations complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('[Test] Typing complete. Cleaning up...');
  keySim.destroy();
  process.exit(0);
}

runTest();
