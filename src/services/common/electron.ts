import { alertController } from "@ionic/core";
import { isElectron } from "../../helpers/utils";
import { AuthService } from "./auth";
import { SystemService } from "./system";
import { TranslationService } from "./translations";

export class ElectronController {
  windowElectron;

  constructor() {
    if (this.isElectron()) {
      this.windowElectron = window["electronAPI"];

      // Listen for logs from the main process
      this.windowElectron.onMainLog((log: string) => {
        console.log("Received main process log:", log);
      });

      // Listen for update available
      this.windowElectron.onUpdateAvailable((info) => {
        console.log("Update available:", info);
        this.notifyUpdateAvailable(info);
      });

      // Listen for update downloaded
      this.windowElectron.onUpdateDownloaded((info) => {
        console.log("Update downloaded:", info);
        this.promptRestartToUpdate();
      });

      // Listen for update errors
      this.windowElectron.onUpdateError((error) => {
        console.error("Update error:", error);
        this.notifyUpdateError(error);
      });

      // Listen for update not available
      this.windowElectron.onUpdateNotAvailable((info) => {
        console.log("Update not available:", info);
        this.notifyUpdateError(info);
        // Handle accordingly if needed
      });
    }
  }

  isElectron() {
    return isElectron();
  }

  signinInLinkWithElectron() {
    // Ensure that the electronAPI is available before calling
    if (this.isElectron()) {
      if (this.windowElectron.onSignInLinkReceived) {
        // Listen for the 'sign-in-link-received' event from Electron
        this.windowElectron.onSignInLinkReceived((url: string) => {
          console.log("Electron sign-in-link-received", url);
          // Call the AuthService's method
          AuthService.signInLinkReceived(url);
        });
      }
    }
  }

  notifyUpdateAvailable(info) {
    SystemService.presentAlert(
      TranslationService.getTransl("update", "Update"),
      TranslationService.getTransl("downloading-update", "Downloading update") +
        " :" +
        info.version
    );
  }

  async promptRestartToUpdate() {
    const alert = await alertController.create({
      header: TranslationService.getTransl("update", "Update"),
      message: TranslationService.getTransl(
        "update-available",
        "Update is available. Do you want to restart the app now?"
      ),
      buttons: [
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
          role: "cancel",
          handler: async () => {},
        },
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            this.restartApp();
          },
        },
      ],
    });
    alert.present();
  }

  notifyUpdateError(error) {
    SystemService.presentAlertError(
      TranslationService.getTransl("update-error", "Update Error") +
        " :" +
        error
    );
  }

  restartApp() {
    this.windowElectron.restartApp();
  }
}

export const ElectronService = new ElectronController();
