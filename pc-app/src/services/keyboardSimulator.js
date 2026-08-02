const { spawn } = require('child_process');

class KeyboardSimulator {
  constructor() {
    this.enabled = true;
    this.ready = false;
    this._resolveCmd = null;
    this._buffer = '';
    this.queue = Promise.resolve();
    this._initPowerShell();
  }

  _initPowerShell() {
    this.ps = spawn('powershell', [
      '-NoProfile', '-NoLogo', '-NoExit', '-STA',
      '-ExecutionPolicy', 'Bypass',
      '-Command', '-'
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    this.ps.stdout.on('data', (data) => {
      this._buffer += data.toString();
      if (this._buffer.includes('##DONE##')) {
        this._buffer = '';
        if (this._resolveCmd) {
          const resolve = this._resolveCmd;
          this._resolveCmd = null;
          resolve();
        }
      }
    });

    this.ps.stderr.on('data', (data) => {
      console.error('[KeySim] PS Error:', data.toString().trim());
    });

    this.ps.on('close', (code) => {
      console.error('[KeySim] PowerShell exited with code', code);
      this.ready = false;
      setTimeout(() => this._initPowerShell(), 1000);
    });

    this._exec('Add-Type -AssemblyName System.Windows.Forms').then(() => {
      this.ready = true;
      console.log('[KeySim] Ready — PowerShell initialized (Direct Input Mode)');
    });
  }

  _exec(command) {
    return new Promise((resolve, reject) => {
      if (!this.ps || this.ps.killed) {
        return reject(new Error('PowerShell not running'));
      }
      this._resolveCmd = resolve;
      this.ps.stdin.write(`${command}; Write-Output '##DONE##'\n`);

      setTimeout(() => {
        if (this._resolveCmd === resolve) {
          this._resolveCmd = null;
          resolve(); 
        }
      }, 5000);
    });
  }

  _enqueue(task) {
    this.queue = this.queue.then(() => task().catch(err => console.error('[KeySim] Error:', err)));
    return this.queue;
  }

  async _typeTextTask(text) {
    if (!this.enabled || !this.ready || !text) return;
    try {
      // SendKeys 특수문자 이스케이프: +, ^, %, ~, (, ), {, }, [, ]
      const escaped = text.replace(/([+^%~(){}[\]])/g, '{$1}');
      const b64 = Buffer.from(escaped, 'utf16le').toString('base64');
      await this._exec(
        `$b=[Convert]::FromBase64String('${b64}');` +
        `$t=[Text.Encoding]::Unicode.GetString($b);` +
        `[System.Windows.Forms.SendKeys]::SendWait($t)`
      );
    } catch (err) {
      console.error('[KeySim] typeText error:', err.message);
    }
  }

  async _deleteCharsTask(count) {
    if (!this.enabled || !this.ready || count <= 0) return;
    try {
      let remaining = count;
      while (remaining > 0) {
        const batch = Math.min(remaining, 50);
        await this._exec(`[System.Windows.Forms.SendKeys]::SendWait('{BS ${batch}}')`);
        remaining -= batch;
      }
    } catch (err) {
      console.error('[KeySim] deleteChars error:', err.message);
    }
  }

  async typeText(text) {
    return this._enqueue(() => this._typeTextTask(text));
  }

  async deleteChars(count) {
    return this._enqueue(() => this._deleteCharsTask(count));
  }

  async replaceInterim(oldLen, newText) {
    return this._enqueue(async () => {
      if (!this.enabled || !this.ready) return;
      if (oldLen > 0) await this._deleteCharsTask(oldLen);
      if (newText) await this._typeTextTask(newText);
    });
  }

  async commitFinal(interimLen, finalText) {
    return this._enqueue(async () => {
      if (!this.enabled || !this.ready) return;
      if (interimLen > 0) await this._deleteCharsTask(interimLen);
      if (finalText) await this._typeTextTask(finalText);
    });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`[KeySim] ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  isEnabled() {
    return this.enabled;
  }

  destroy() {
    if (this.ps && !this.ps.killed) {
      this.ps.stdin.write('exit\n');
      this.ps.kill();
    }
  }
}

module.exports = KeyboardSimulator;
