const { execSync } = require('child_process');
const b64 = Buffer.from('테스트', 'utf16le').toString('base64');
try {
  execSync(`powershell -STA -command "$b=[Convert]::FromBase64String('${b64}'); $t=[Text.Encoding]::Unicode.GetString($b); $wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys($t);"`);
  console.log('Success');
} catch (err) {
  console.error(err.toString());
}
