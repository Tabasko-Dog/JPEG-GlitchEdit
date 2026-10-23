const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    title: 'JPEG GlichEdit', backgroundColor: '#e8ebf0', frame: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile('index.html');
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(`
      body { padding-top: 40px !important; }
      #macbar { position: fixed; top:0;left:0;right:0;height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 12px 0 16px;z-index:9999;-webkit-app-region:drag;background:rgba(247,248,250,0.85);backdrop-filter:blur(12px);border-bottom:1px solid #cdd3dd;font-size:13px;color:#1b2433;user-select:none;}
      #macbar .dots { display:flex;gap:8px;-webkit-app-region:no-drag; }
      #macbar button.dot { width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,0.15);padding:0;cursor:pointer;-webkit-app-region:no-drag;display:grid;place-items:center;font-size:9px;line-height:1;}
      #macbar .close { background:#ff5f57; } #macbar .min { background:#ffbd2e; } #macbar .max { background:#28c840; }
      #macbar .close:hover::after{content:'×';color:#8a0000;} #macbar .min:hover::after{content:'−';color:#7a5a00;} #macbar .max:hover::after{content:'+';color:#0a5a10;}
      #macbar .title { font-weight:600;letter-spacing:.2px;}
    `);
    win.webContents.executeJavaScript(`
      const bar = document.createElement('div');
      bar.id = 'macbar';
      bar.innerHTML = '<div style="width:42px"></div><div class="title">JPEG GlichEdit</div><div class="dots"><button class="dot min" title="Minimize" data-a="min"></button><button class="dot max" title="Maximize" data-a="max"></button><button class="dot close" title="Close" data-a="close"></button></div>';
      document.body.prepend(bar);
      bar.addEventListener('click', async (e) => {
        const b = e.target.closest('button.dot'); if (!b) return;
        const a = b.dataset.a;
        if (a === 'close') window.electronAPI.close();
        if (a === 'min') window.electronAPI.minimize();
        if (a === 'max') { window.electronAPI.maximize(); const maxed=await window.electronAPI.isMaximized(); b.title=maxed?'Restore':'Maximize';}
      });
    `);
  });
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
ipcMain.on('win-minimize', () => win.minimize());
ipcMain.on('win-maximize', () => { if (win.isMaximized()) win.unmaximize(); else win.maximize(); });
ipcMain.handle('win-isMaximized', () => win.isMaximized());
ipcMain.on('win-close', () => win.close());
