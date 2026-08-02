const { keyboard, Key, clipboard } = require('@nut-tree-fork/nut-js'); (async () => { await clipboard.copy('한글 클립보드 테스트'); await keyboard.type(Key.LeftControl, Key.V); })().catch(console.error);
