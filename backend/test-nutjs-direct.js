const { keyboard } = require('@nut-tree-fork/nut-js');

async function test() {
  keyboard.config.autoDelayMs = 50; 
  
  console.log('Please focus Notepad... (waiting 3s)');
  await new Promise(r => setTimeout(r, 3000));

  console.log('Typing string directly...');
  try {
    // try to type korean string directly
    await keyboard.type('한글직접입력테스트');
    console.log('Done.');
  } catch (err) {
    console.error('Error typing directly:', err.message);
  }
  process.exit(0);
}

test().catch(err => console.error(err));
