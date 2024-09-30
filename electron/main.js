const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  Menu,
  session,
  globalShortcut,
} = require("electron");
const path = require("path");
const httpServer = require("http-server");

const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
log.info("App starting...");

let mainWindow;
let server;
const port = 8080;
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

function logData(str) {
  log.info("logData: " + str);
  mainWindow.webContents.send("main-log", `Main process: ` + str);
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
  event.preventDefault();
  logData("open-url" + url);
  // Send the url to the renderer process through 'sign-in-link-received'
  if (mainWindow) {
    //SIGNIN
    const urlParams = new URL(url);
    const oobCode = urlParams.searchParams.get("oobCode");
    const apiKey = urlParams.searchParams.get("apiKey");
    const mode = urlParams.searchParams.get("mode");
    // Log when the window is created
    logData("oobCode " + oobCode);
    if (oobCode && apiKey && mode) {
      mainWindow.webContents.send("sign-in-link-received", url);
    }
  }
});

/*
START APP
*/

function createWindow() {
  // Start the local server in both development and production
  const rootPath =
    process.env.NODE_ENV === "development"
      ? path.join(__dirname, "../www") // Development path
      : path.join(__dirname, "www"); // Packaged path for production
  server = httpServer.createServer({ root: rootPath });

  server.listen(port, host);
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon:
      rootPath +
      "/assets/icon/" +
      appName.toLowerCase() +
      "/apple-touch-icon.png", // Use the path to your icon
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
  logData("createWindow: " + host + port);
}

function appWhenReady() {
  app.whenReady().then(() => {
    // Set the application name
    app.setName(appName);
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    getPermissions();
    createWindow();
  });
}

/*
GET GPS Permissions
*/

function getPermissions() {
  // Request location permissions (for example, macOS)
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "geolocation") {
        callback(true); // Allow geolocation
      } else {
        callback(false);
      }
    }
  );
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
    server.close();
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

/***
 * AUTOUPDATER
 */

// Log updates
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
process.env.GH_TOKEN = "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";

autoUpdater.setFeedURL({
  provider: "github",
  owner: "Immersea",
  repo: "trasteel-updates",
  private: true,
});

// Check for updates and notify
autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on("update-available", (info) => {
  log.info("Update available:", info);
  // Send message to renderer process
  mainWindow.webContents.send("update_available", info);
});

autoUpdater.on("update-downloaded", (info) => {
  log.info("Update downloaded:", info);
  // Send message to renderer process
  mainWindow.webContents.send("update_downloaded", info);
});

// Handle restart requests from the renderer process
ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});

// Optionally, handle errors and other update events
autoUpdater.on("error", (err) => {
  log.error("Update error:", err);
  mainWindow.webContents.send("update_error", err.message || err);
});

autoUpdater.on("update-not-available", (info) => {
  log.info("Update not available:", info);
  mainWindow.webContents.send("update_not_available", info);
});
