const { contextBridge, ipcRenderer } = require("electron");

// Expose the necessary ipcRenderer method using contextBridge
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: () => true,
  onCheckLocationHref: (callback) => {
    ipcRenderer.on("check-location-href", (event, url) => {
      callback(url); // Only pass the URL to the callback function
    });
  },
});
