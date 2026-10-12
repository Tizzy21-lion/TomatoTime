/* 番茄钟 preload：安全地向渲染进程暴露窗口控制能力 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tomato', {
  isApp: true,
  expand: function () { ipcRenderer.send('win:expand'); },
  collapse: function () { ipcRenderer.send('win:collapse'); },
  resize: function (h) { ipcRenderer.send('win:height', h); },
  quit: function () { ipcRenderer.send('app:quit'); },
  quitConfirm: function () { ipcRenderer.send('app:quit-menu'); },
  alarm: function (msg, poem) { ipcRenderer.send('app:alarm', msg, poem); },
  dragMove: function (dx, dy) { ipcRenderer.send('win:drag-move', dx, dy); },
  onResized: function (cb) { ipcRenderer.on('win:resized', cb); }
});
