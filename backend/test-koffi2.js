const KeyboardSimulator = require('./src/services/keyboardSimulator');

async function runTest() {
  const sim = new KeyboardSimulator();
  console.log('Simulator initialized. Waiting 2 seconds before typing...');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Typing: "한글 테스트 입니다."');
  await sim.typeText("한글 테스트 입니다.");
  
  console.log('Typing finished.');
}

runTest();
