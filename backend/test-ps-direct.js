const { spawn } = require('child_process');

async function test() {
  console.log('Please focus Notepad... (waiting 3s)');
  await new Promise(r => setTimeout(r, 3000));

  console.log('Typing string directly using PowerShell...');
  
  // SendKeys requires special character escaping: +, ^, %, ~, (, ), {, }
  // But for simple Korean text, no escape is needed in this test.
  const text = "한글직접입력테스트";
  
  const psCommand = `
    Add-Type -AssemblyName System.Windows.Forms;
    Start-Sleep -Milliseconds 50;
    [System.Windows.Forms.SendKeys]::SendWait('${text}')
  `;

  const ps = spawn('powershell', ['-NoProfile', '-Command', psCommand]);
  
  ps.stdout.on('data', data => console.log(data.toString()));
  ps.stderr.on('data', data => console.error('PS Error:', data.toString()));
  
  ps.on('close', code => {
    console.log('Done with code:', code);
    process.exit(code);
  });
}

test().catch(err => console.error(err));
