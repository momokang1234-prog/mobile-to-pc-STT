const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const killPort = require('kill-port');
const ip = require('ip');

const setupSocketHandlers = require('./src/socket');
const KeyboardSimulator = require('./src/services/keyboardSimulator');

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let mainWindow;
let tray;
let expressServer;
let io;
let keyboardSimulator;

async function startServer() {
  const PORT = 5000;
  
  try {
    console.log(`Checking port ${PORT}...`);
    await killPort(PORT, 'tcp');
  } catch (err) {
    // Port might not be in use, ignore
  }

  const expressApp = express();
  expressApp.use(cors());

  // API for React frontend
  expressApp.get('/api/info', (req, res) => {
    res.json({
      ip: ip.address(),
      port: PORT
    });
  });

  // Serve static frontend files from 'public' folder
  expressApp.use(express.static(path.join(__dirname, 'public')));

  expressServer = http.createServer(expressApp);
  
  io = new Server(expressServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  keyboardSimulator = new KeyboardSimulator();
  setupSocketHandlers(io, keyboardSimulator);

  expressServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 750,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'build', 'icon.ico') // Optional icon
  });

  // Depending on whether we are in dev or prod:
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    // We will start vite at port 5173
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // Use a transparent or default icon if none exists
  tray = new Tray(path.join(__dirname, 'build', 'icon.png')); // Placeholder path, we will create a dummy icon or use a generic one if needed
  tray.setToolTip('Mobile to PC STT');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow.show());
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  await startServer();
  createWindow();
  
  try {
    createTray();
  } catch (e) {
    console.error('Tray icon missing or error:', e);
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
  if (keyboardSimulator) keyboardSimulator.destroy();
  if (io) io.close();
  if (expressServer) expressServer.close();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
