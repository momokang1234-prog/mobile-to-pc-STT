const { keyboard, Key, clipboard } = require('@nut-tree-fork/nut-js');

async function test() {
  keyboard.config.autoDelayMs = 50; // add delay
  
  console.log('Setting clipboard...');
  await clipboard.setContent('안녕하세요 자동입력 테스트');
  
  console.log('Please focus Notepad... (waiting 3s)');
  await new Promise(r => setTimeout(r, 3000));

  console.log('Pressing Ctrl+V using keyboard.type...');
  // Try keyboard.type which handles press and release
  await keyboard.type(Key.LeftControl, Key.V);
  
  console.log('Done.');
  process.exit(0);
}

test().catch(err => console.error(err));
