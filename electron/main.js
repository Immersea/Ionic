const {
  app,
  BrowserWindow,
  protocol,
  ipcMain,
  shell,
  dialog,
  Menu,
  globalShortcut,
} = require("electron");
const path = require("path");
const httpServer = require("http-server");

let mainWindow;
let server;
const port = 8091;
const host = "localhost";
const AppProtocols = {
  udive: "udiveapp",
  decoplanner: "decoplannerapp",
  trasteel: "trasteelapp",
};
const AppNames = {
  udive: "UDive",
  decoplanner: "Decoplanner",
  trasteel: "Trasteel",
};
const appName = "Trasteel";

const menuTemplate = [
  {
    label: appName,
    submenu: [{ role: "about" }, { type: "separator" }, { role: "quit" }],
  },
];

/*
REGISTER App Protocol
*/

function getProtocolString() {
  switch (appName) {
    case AppNames.trasteel:
      return AppProtocols.trasteel;
    case AppNames.udive:
      return AppProtocols.udive;
    case AppNames.decoplanner:
      return AppProtocols.decoplanner;
  }
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(getProtocolString(), process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(getProtocolString());
}

//WINDOWS
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
//MAC-UNIX
app.on("open-url", (event, url) => {
  dialog.showErrorBox("Welcome Back", `You arrived from: ${url}`);
});

/*
START APP
*/

function createWindow() {
  // Start the local server
  server = httpServer.createServer({
    root: path.join(__dirname, "../www"),
  });

  server.listen(port, host, () => {
    console.log("Server running at http://" + host + ":" + port + "/");
  });
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false, // Important for security
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the local server URL
  mainWindow.loadURL("http://" + host + ":" + port + "");

  // Open the DevTools if in development mode
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
  // Register a keyboard shortcut to toggle DevTools (for production debugging)
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });
}

function appWhenReady() {
  app.whenReady().then(() => {
    // Set the application name
    app.setName(appName);
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    protocol.handle(getProtocolString(), (request, callback) => {
      const url = request.url.splice(getProtocolString().length + 3); // Remove 'protocol://' from the URL
      const parsedUrl = new URL(url);

      // This is where you would handle the URL and pass the parameters to your app
      if (mainWindow) {
        console.log("Electron check-location-href", parsedUrl);
        mainWindow.webContents.send("check-location-href", parsedUrl);
      }

      callback({ path: path.normalize(`${__dirname}/index.html`) });
    });

    createWindow();
  });
}

// Create mainWindow, load the rest of the app, etc...
appWhenReady();

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (server) {
    server.close(() => {
      dialog.showErrorBox("Server closed");
    });
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle window controls via IPC
ipcMain.on("shell:open", () => {
  const pageDirectory = __dirname.replace("app.asar", "app.asar.unpacked");
  const pagePath = path.join("file://", pageDirectory, "index.html");
  shell.openExternal(pagePath);
});
