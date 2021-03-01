// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn, execFile } = require('child_process');

let childProcess;

function createMenu() {
  return new Menu();
}

async function startServer() {
  childProcess = await execFile();
}

async function createWindow() {
  // Instantiate express server
  childProcess = spawn('node', ['build/index.js'], { shell: true, detached: true });
  // childProcess.on('message', message => console.log('message', message));
  childProcess.stdout.on('data', message => console.log('' + message));
  childProcess.stderr.on('data', message => console.log('Error:' + message));
  childProcess.on('exit', message => console.log('Child process exited with code: ', message));

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // show: false,
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false
    }
  });

  // and load the index.html of the app.
  // await mainWindow.loadURL('http://localhost:8000');
  setTimeout(() => mainWindow.loadURL('http://localhost:8000'), 10000); // Server needs some time to start.
  // await mainWindow.loadURL(`file://client/dist/client/index.html`);
  // mainWindow.once('ready-to-show', () => {
  //   mainWindow.show();
  // });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  Menu.setApplicationMenu(createMenu());
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  console.log('app:', app.getAppPath());
  ipcMain.emit('path', app.getAppPath());

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
  if (childProcess) childProcess.kill('SIGINT');
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
