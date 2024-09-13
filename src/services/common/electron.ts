import { isElectron } from "../../helpers/utils";
import { AuthService } from "./auth";

export class ElectronController {
  constructor() {
    if (this.isElectron()) {
      /*window.electron.ipcRenderer.on('update-ready', () => {
                this.updateAvailable = true;
                alert('A new update is available. Please restart the app to apply the update.');
              });*/
    }
  }
  isElectron() {
    return isElectron();
  }

  signinInLinkWithElectron() {
    // Ensure that the electronAPI is available before calling
    if (window["electronAPI"]) {
      if (window["electronAPI"].onSignInLinkReceived) {
        // Listen for the 'sign-in-link-received' event from Electron
        window["electronAPI"].onSignInLinkReceived((url: string) => {
          console.log("Electron sign-in-link-received", url);
          // Call the AuthService's method
          AuthService.signInLinkReceived(url);
        });
      }
      if (window["electronAPI"].onMainLog) {
        // Listen for logs from the main process
        window["electronAPI"].onMainLog((log: string) => {
          console.log("Received main process log:", log);
        });
      }
    }
  }
}

export const ElectronService = new ElectronController();
