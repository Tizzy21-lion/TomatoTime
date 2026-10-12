/* 番茄钟 Electron 主进程 */
const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

const MARGIN = 16;                                 // 距桌面工作区右下角的边距
const SIZE_COLLAPSED = { w: 120, h: 120 };         // 收起态：仅番茄图标
const SIZE_EXPANDED = { w: 440, h: 430 };          // 展开态（无设置）：内容紧凑
const SIZE_EXPANDED_SETTINGS = { w: 440, h: 680 }; // 展开态（设置面板打开）

let win = null;
let alarmWin = null;
let quitWin = null;

/* 工作区右下角锚点（避开任务栏） */
function anchor() {
  const wa = screen.getPrimaryDisplay().workArea;
  return { ax: wa.x + wa.width - MARGIN, ay: wa.y + wa.height - MARGIN };
}

/* 以右下角为锚重新放置窗口 */
function place(size) {
  if (!win) return;
  const { ax, ay } = anchor();
  win.setBounds({ x: ax - size.w, y: ay - size.h, width: size.w, height: size.h });
  console.log('[tomato] resize ->', JSON.stringify(win.getBounds()));
  /* 强制重绘：避免透明窗口 resize 时 GPU 复用旧帧产生"番茄闪现左上角" */
  if (win.webContents && !win.webContents.isDestroyed()) win.webContents.invalidate();
  notifyResized();
}

/* 仅调整窗口高度（保持 440 宽、右下角锚定） */
function placeHeight(h) {
  if (!win) return;
  const { ax, ay } = anchor();
  win.setBounds({ x: ax - SIZE_EXPANDED.w, y: ay - h, width: SIZE_EXPANDED.w, height: h });
  notifyResized();
}

/* setBounds 生效后通知渲染进程（展开时再显示卡片，杜绝 resize 残影） */
function notifyResized() {
  setTimeout(function () {
    if (win && !win.isDestroyed()) win.webContents.send('win:resized');
  }, 24);
}

function createWindow() {
  const { ax, ay } = anchor();
  win = new BrowserWindow({
    width: SIZE_COLLAPSED.w,
    height: SIZE_COLLAPSED.h,
    x: ax - SIZE_COLLAPSED.w,
    y: ay - SIZE_COLLAPSED.h,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile('index.html');
  win.once('ready-to-show', function () { win.show(); });
  win.on('closed', function () { win = null; });
}

/* ---- IPC ---- */
function showAlarm(msg, poem) {
  const wa = screen.getPrimaryDisplay().workArea;
  const w = 420, h = 240;
  const x = Math.round(wa.x + (wa.width - w) / 2);
  const y = Math.round(wa.y + (wa.height - h) / 2);
  if (alarmWin && !alarmWin.isDestroyed()) {
    try { alarmWin.close(); } catch (e) {}
  }
  alarmWin = new BrowserWindow({
    width: w, height: h, x, y,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  alarmWin.setAlwaysOnTop(true, 'screen-saver');
  const q = new URLSearchParams({ view: 'alarm', msg: msg || '', poem: poem || '' });
  alarmWin.loadFile('index.html', { search: q.toString() });
  alarmWin.once('ready-to-show', function () { alarmWin.show(); });
  alarmWin.on('closed', function () { alarmWin = null; });
}

/* 退出确认窗口（屏幕居中） */
function showQuitConfirm() {
  const wa = screen.getPrimaryDisplay().workArea;
  const w = 300, h = 180;
  const x = Math.round(wa.x + (wa.width - w) / 2);
  const y = Math.round(wa.y + (wa.height - h) / 2);
  if (quitWin && !quitWin.isDestroyed()) {
    try { quitWin.close(); } catch (e) {}
  }
  quitWin = new BrowserWindow({
    width: w, height: h, x, y,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  quitWin.setAlwaysOnTop(true, 'screen-saver');
  quitWin.loadFile('index.html', { query: { view: 'quit' } });
  quitWin.once('ready-to-show', function () { quitWin.show(); });
  quitWin.on('closed', function () { quitWin = null; });
}

/* ---- IPC ---- */
ipcMain.on('win:expand', function () { place(SIZE_EXPANDED); });
ipcMain.on('win:collapse', function () { place(SIZE_COLLAPSED); });
ipcMain.on('win:height', function (_e, h) {
  if (h === 'settings') placeHeight(SIZE_EXPANDED_SETTINGS.h);
  else placeHeight(SIZE_EXPANDED.h);
});
ipcMain.on('win:drag-move', function (_e, dx, dy) {
  if (!win) return;
  const b = win.getBounds();
  win.setBounds({ x: b.x + dx, y: b.y + dy, width: b.width, height: b.height });
});
ipcMain.on('app:alarm', function (_e, msg, poem) { showAlarm(msg, poem); });
ipcMain.on('app:quit-menu', function () { showQuitConfirm(); });
ipcMain.on('app:quit', function () { app.quit(); });

app.whenReady().then(function () {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', function () { app.quit(); });
