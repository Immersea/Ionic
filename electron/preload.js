const { contextBridge, ipcRenderer } = require("electron");

// Expose the necessary ipcRenderer method using contextBridge
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: () => true,

  // Existing methods
  onSignInLinkReceived: (callback) => {
    ipcRenderer.on("sign-in-link-received", (event, url) => {
      callback(url);
    });
  },

  onMainLog: (callback) => {
    ipcRenderer.on("main-log", (event, log) => {
      callback(log);
    });
  },

  // Update-related methods
  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update_available", (event, info) => {
      callback(info);
    });
  },

  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("update_downloaded", (event, info) => {
      callback(info);
    });
  },

  onUpdateError: (callback) => {
    ipcRenderer.on("update_error", (event, error) => {
      callback(error);
    });
  },

  onUpdateNotAvailable: (callback) => {
    ipcRenderer.on("update_not_available", (event, info) => {
      callback(info);
    });
  },

  // Expose a method to send the restart_app event
  restartApp: () => {
    ipcRenderer.send("restart_app");
  },
});
