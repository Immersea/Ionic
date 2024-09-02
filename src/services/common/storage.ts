import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTask,
  deleteObject,
  listAll,
} from "firebase/storage";
import {storage} from "../../helpers/firebase";
import {alertController} from "@ionic/core";
import {TranslationService} from "./translations";
import {Media} from "../../interfaces/common/media/media";
import {UploadProgressData} from "../../interfaces/interfaces";
import {SystemService} from "./system";
import {Environment} from "../../global/env";

export class StorageController {
  uploadTask: UploadTask;

  updatePhotoURL(
    collection: string,
    type: string,
    id: string,
    file: File,
    fileName?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const name =
        collection +
        "/" +
        id +
        "/" +
        type +
        "URL" +
        (fileName ? "_" + fileName : "");
      const uploadRef = ref(storage, name);
      const uploadThmb = uploadBytesResumable(uploadRef, file);
      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
      uploadThmb.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          Environment.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          this.showAlert(error);
          reject(undefined);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadThmb.snapshot.ref).then(
            (photoURL) => {
              Environment.log("photoURL", [photoURL]);
              resolve(photoURL);
            },
            (error) => {
              // Handle unsuccessful uploads
              this.showAlert(error);
              reject(undefined);
            }
          );
        }
      );
    });
  }

  uploadFile(collection: string, id: string, media: Media, file: File) {
    const name = this.getFilePath(collection, id, media);
    const storageRef = ref(storage, name);
    this.uploadTask = uploadBytesResumable(storageRef, file);
    // Listen for state changes, errors, and completion of the upload.
    Environment.log("uploadFile", [collection, id, media, file]);
    this.uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        switch (snapshot.state) {
          case "paused": // or 'paused'
            console.log("Upload is paused");
            break;
          case "running": // or 'running'
            console.log("Upload is running");
            break;
        }
        Environment.log("progress", [progress]);
        //send progress event to DOM
        this.emitUploadProgress({
          state: snapshot.state,
          progress: progress,
          error: null,
          url: null,
        });
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            SystemService.presentAlertError(
              "User doesn't have permission to access the object"
            );
            break;
          case "storage/canceled":
            // User canceled the upload
            SystemService.presentAlertError("User canceled the upload");
            break;
          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            SystemService.presentAlertError("Unknown error occurred");
            break;
        }
        this.emitUploadProgress({
          state: "error",
          progress: 0,
          error: error,
          url: null,
        });
        //this.showAlert(error);
        return undefined;
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(this.uploadTask.snapshot.ref).then(
          (downloadURL) => {
            Environment.log("downloadURL", [downloadURL]);
            this.emitUploadProgress({
              state: "completed",
              progress: 100,
              error: null,
              url: downloadURL,
            });
          },
          (error) => {
            // Handle unsuccessful uploads
            SystemService.presentAlertError(error);
            return undefined;
          }
        );
      }
    );
  }

  cancelUploading() {
    this.uploadTask.cancel;
  }

  emitUploadProgress(progress: UploadProgressData) {
    window.dispatchEvent(
      new CustomEvent("uploadProgress", {
        bubbles: true,
        detail: progress,
      })
    );
  }

  getFilePath(collection: string, id: string, media: Media) {
    return collection + "/" + id + "/" + media.type + "/" + media.id;
  }

  deleteFilePath(collection: string, id: string, media: Media) {
    return this.deleteFile(this.getFilePath(collection, id, media));
  }

  async deleteFile(filePath) {
    const storageRef = ref(storage, filePath);
    try {
      return await deleteObject(storageRef);
    } catch (error) {
      this.showAlert(error);
      return false;
    }
  }

  async deleteFolderRecursive(folderPath) {
    const storageRef = ref(storage, folderPath);
    const list = await listAll(storageRef);
    let filesDeleted = 0;

    for await (const fileRef of list.items) {
      await this.deleteFile(fileRef.fullPath);
      filesDeleted++;
    }
    for await (const folderRef of list.prefixes) {
      filesDeleted += await this.deleteFolderRecursive(folderRef.fullPath);
    }
    return filesDeleted;
  }

  async deletePhotoURLs(collection: string, id: string) {
    try {
      const storageRef = ref(storage, `${collection}/${id}`);
      if (storageRef && storageRef.fullPath) {
        return this.deleteFolderRecursive(storageRef.fullPath);
      } else {
        return true;
      }
    } catch (error) {
      this.showAlert(error);
      return undefined;
    }
  }

  async showAlert(error) {
    let header = TranslationService.getTransl("storage", "Storage");
    let message_error = TranslationService.getTransl(
      "storage-error",
      "There was an error in the storage process. Please try again later."
    );
    const alert = await alertController.create({
      header: header,
      message: message_error + "->" + error,
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
        },
      ],
    });
    alert.present();
  }

  async getUrl(refString): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, refString);
      getDownloadURL(storageRef).then(
        (downloadURL) => {
          resolve(downloadURL);
        },
        (error) => {
          console.log(error);
          reject(error);
        }
      );
    });
  }
}

export const StorageService = new StorageController();
