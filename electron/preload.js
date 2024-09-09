const { contextBridge, ipcRenderer } = require("electron");

// Expose the necessary ipcRenderer method using contextBridge
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: () => true,
  onSignInLinkReceived: (callback) => {
    ipcRenderer.on("sign-in-link-received", (event, url) => {
      callback(url); // Only pass the URL to the callback function
    });
  },
  // Listen for logs sent from the main process
  onMainLog: (callback) => {
    ipcRenderer.on("main-log", (event, log) => {
      callback(log); // Send the log message to the renderer
    });
  },
});
