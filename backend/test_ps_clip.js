const { keyboard, Key } = require('@nut-tree-fork/nut-js');
const { execSync } = require('child_process');
(async () => {
  try {
    execSync(`powershell -command "Set-Clipboard -Value '한글 클립보드 테스트'"`);
    await keyboard.pressKey(Key.LeftControl, Key.V);
    await keyboard.releaseKey(Key.LeftControl, Key.V);
    console.log('Success');
  } catch (err) {
    console.error(err);
  }
})();
