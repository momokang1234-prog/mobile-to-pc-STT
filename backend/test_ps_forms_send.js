const { execSync } = require('child_process');
const b64 = Buffer.from('한글 폼스 샌드 테스트', 'utf16le').toString('base64');
try {
  execSync(`powershell -STA -command "Add-Type -AssemblyName System.Windows.Forms; $b=[Convert]::FromBase64String('${b64}'); $t=[Text.Encoding]::Unicode.GetString($b); [System.Windows.Forms.SendKeys]::Send($t);"`);
  console.log('Success Send');
} catch (err) {
  console.error(err.toString());
}
