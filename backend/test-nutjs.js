const { keyboard, Key, clipboard } = require('@nut-tree-fork/nut-js');

async function test() {
  console.log('Setting clipboard...');
  await clipboard.setContent('안녕하세요 테스트입니다');
  console.log('Clipboard set.');

  // Wait 3 seconds to let user focus a window
  console.log('Please focus Notepad... (waiting 3s)');
  await new Promise(r => setTimeout(r, 3000));

  console.log('Typing Ctrl+V...');
  await keyboard.pressKey(Key.LeftControl);
  await keyboard.pressKey(Key.V);
  await keyboard.releaseKey(Key.V);
  await keyboard.releaseKey(Key.LeftControl);
  
  console.log('Done typing Ctrl+V');
  process.exit(0);
}

test().catch(err => console.error(err));
