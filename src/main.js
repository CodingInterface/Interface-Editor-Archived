const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require('fs');
const rpc = require('discord-rpc');

const {app, BrowserWindow, Menu, File, dialog, ipc, remote, ipcRenderer, ipcMain} = electron;

const startURL = process.env.ELECTRON_START_URL || url.format({
  pathname: path.join(__dirname, "/../build/index.html"),
  protocol: "file:",
  slashes: true
});
const notesStartURL = process.env.ELECTRON_START_URL || url.format({
  pathname: path.join(__dirname, "/../build/notes.html"),
  protocol: "file:",
  slashes: true
});
//Volterco is Flying

let mainWindow;
let addWindow;
let notesWindow;


app.on("ready", function() {

  mainWindow = new BrowserWindow({});

  mainWindow.loadURL(startURL);

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  Menu.setApplicationMenu(mainMenu);
});

function createNotesWindow() {
  notesWindow = new BrowserWindow({});
  notesWindow.loadURL(notesStartURL);
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
}

function createFileImplementor() {
    let content = " ";

    dialog.showSaveDialog((filename) => {
      if(filename === undefined) {
        nameWindowFile = new BrowserWindow({
          width: 300,
          height: 0,
          title: "Please Name the File"
        });
      }
      fs.writeFile(filename, content, (err) => {
        if(err) {
          alert("Error:" + err.message);
          return;
        }
      });
    });

}

  function openFile() {

  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  })
  if (!files) return

  const file = files[0]
  const content = fs.readFileSync(file).toString()

  app.addRecentDocument(file)

  mainWindow.webContents.send('file-opened', file, content)
}

  function createAddWindow() {
    addWindow = new BrowserWindow({});

    addWindow.loadURL(startURL);

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
}

const mainMenuTemplate = [
  {
      label: "File",
      submenu: [

        {label: "New Window",
        accelerator: process.platform == "win32" ? "Ctrl+Shift+N" : "Command+Shift+N",
        click(){
          createAddWindow();
        }
        },

        {label: "New File",
        accelerator: process.platform == "win32" ? "Ctrl+N" : "Command+N",
        click() {
          createFileImplementor();
        }
        },

        {label: "Open File",
        accelerator: process.platform == "win32" ? "Ctrl+O" : "Command+O",
        click() {
          openFile();
        }
        },

        {label: "Open Folder"},

        {label: "Add Project"},

        {label: "Reopen Project"},

        {label: "Reopen Last Item"},

        {
          type: 'separator'
        },

        {
          label: "Notes",
          accelerator: process.platform == "win32" ? "CTRL+Shift+E" : "Command+Shift+E",
          click() {
            createNotesWindow();
          }
        },

        {
          type: 'separator'
        },

        {label: "Save File",
        accelerator: process.platform == "win32" ? "Ctrl+S" : "Command+S"
        },

        {
          type: 'separator'
        },

        {
          label: "Exit",
          accelerator: process.platform == "win32" ? "Ctrl+Q" : "Command+Q",
          click() {
            app.quit();
          }
        }

      ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: process.platform == "win32" ? "Ctrl+Z" : "Command+Z",
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: process.platform == "win32" ? "Ctrl+Y" : "Command+Y",
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: process.platform == "win32" ? "Ctrl+X" : "Command+X",
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: process.platform == "win32" ? "Ctrl+C" : "Command+C",
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: process.platform == "win32" ? "Ctrl+V" : "Command+V",
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: process.platform == "win32" ? "Ctrl+A" : "Command+A",
        role: 'selectall'
      }
    ]
  },
  {
    label: 'Developer',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform == "win32" ? "Ctrl+Shift+I" : "Alt+Shift+I",
        click() { mainWindow.webContents.toggleDevTools() }
      }
    ]
  }
];

//DISCORD RICH PRESENCE

const clientId = '470025336692932608';

const rpcMain = new rpc.Client({ transport: 'ipc' });
const startTimestamp = new Date();

async function setActivityForRPC() {
  if (!rpcMain || !mainWindow) {
    return;
  }

  const boops = await mainWindow.webContents.executeJavaScript('window.boops');

  rpcMain.setActivity({
    details: `Editing: Dev`,
    state: `Working on ProjDev`,
    startTimestamp,
    largeImageKey: 'ielogo2_png',
    largeImageText: 'Interface Editor',
    instance: false
  });
}


rpcMain.on('ready', () => {
  setActivityForRPC();

  // activity can only be set every 15 seconds
  setInterval(() => {
    setActivityForRPC();
  }, 15e3);
});

rpcMain.login({ clientId }).catch(console.error);


//Failed Discord-rich-PRESENCE npm package recommended by Discord

// const presenceWriterDiscord = require('discord-rpc')('470025336692932608');
//
// //Made a long name so it wont effect JS actual Functions ;)
//
// presenceWriterDiscord.on('join', (secret) => {
//   console.log('we should join with', secret);
// });
//
// presenceWriterDiscord.on('spectate', (secret) => {
//   console.log('we should spectate with', secret);
// });
//
// presenceWriterDiscord.on('joinRequest', (user) => {
//   if (user.discriminator === '1337') {
//     client.reply(user, 'YES');
//   } else {
//     client.reply(user, 'IGNORE');
//   }
// });
//
//
// presenceWriterDiscord.on('connected', () => {
//   console.log('connected!');
//
// presenceWriterDiscord.updatePresence({
//     details:
//     `Editing: ${file}
//     Working on ${projectName}`,
//     startTimestamp: Date.now(),
//     largeImageKey: 'Interface Editor',
//   });
// });
//
// process.on('unhandledRejection', console.error);
