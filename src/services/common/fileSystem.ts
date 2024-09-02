import {Directory, Encoding, Filesystem} from "@capacitor/filesystem";
import {Environment} from "../../global/env";
import {slugify} from "../../helpers/utils";

const CACHE = Directory.Cache;
const DIR = slugify(Environment.getAppTitle() + "_images");

class FileSystemController {
  async writeFile(
    directory: Directory,
    path: string,
    data: string,
    encoding: Encoding = Encoding.UTF8
  ) {
    return await Filesystem.writeFile({
      path: path,
      data: data,
      directory: directory,
      encoding: encoding,
    });
  }

  async readFile(
    directory: Directory,
    path: string,
    encoding: Encoding = Encoding.UTF8
  ) {
    return await Filesystem.readFile({
      path: path,
      directory: directory,
      encoding: encoding,
    });
  }

  async deleteFile(directory: Directory, path: string) {
    return await Filesystem.deleteFile({
      path: path,
      directory: directory,
    });
  }

  async makeDir(directory: Directory, path: string, recursive = true) {
    return await Filesystem.mkdir({
      path: path,
      directory: directory,
      recursive: recursive,
    });
  }

  async removeDir(directory: Directory, path: string, recursive = true) {
    return await Filesystem.rmdir({
      path: path,
      directory: directory,
      recursive: recursive,
    });
  }

  async readDir(directory: Directory, path: string) {
    return await Filesystem.readdir({
      path: path,
      directory: directory,
    });
  }

  // helper function
  convertBlobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }

  //store local images and return image url or local base64
  async storeAndLoadImage(
    url,
    resetImageCache = false
  ): Promise<{ext: string; src: string}> {
    return new Promise(async (resolve, reject) => {
      let res = {ext: "jpeg", src: url};
      //check directory
      try {
        await this.readDir(CACHE, DIR);
      } catch (error) {
        //not existing
        await this.makeDir(CACHE, DIR);
      }
      const imageName = url.split("/").pop().split("?")[0]; //remove main url and URI tokens
      if (imageName.includes("%2Fimage%2F")) {
        //in case of firebase urls
        const imageNameArray = imageName.split("%2F");
        const index = imageNameArray.lastIndexOf("image");
        res.ext = imageNameArray[index + 1];
      } else {
        //url with image name
        const extension = imageName.split(".");
        if (extension.length > 1) {
          res.ext = extension.pop();
        }
      }
      const path = `${DIR}/${imageName}`;
      if (resetImageCache) {
        try {
          await this.deleteFile(CACHE, path);
        } catch (error) {
          Environment.log("file does not exist", error);
        }
      }
      try {
        res.src = await this.readImage(path);
        resolve(res);
      } catch (error) {
        //not existing
        try {
          await this.storeImage(url, path);
          try {
            res.src = await this.readImage(path);
            resolve(res);
          } catch (error) {
            Environment.log("This should not happen: ", [error]);
            reject(error);
          }
        } catch (error) {
          //not loaded
          Environment.log("loading image online", [error]);
          resolve(res);
        }
      }
    });
  }

  async readImage(path) {
    const readFile = await this.readFile(CACHE, path);
    return readFile.data;
  }

  async storeImage(url, path): Promise<string> {
    return new Promise(async (resolve, reject) => {
      /*if (document.baseURI.search("localhost") !== -1) {
      //allow cors for local development
      url = "https://api-cors-proxy-devdactic.herokuapp.com/" + url;
    }*/
      const response = await fetch(url, {
        headers: new Headers({
          Referer: Environment.getSiteUrl(),
        }),
        mode: "cors",
      });
      // convert to a Blob
      if (response.ok) {
        const blob = await response.blob();
        // convert to base64 data, which the Filesystem plugin requires
        const base64Data = (await this.convertBlobToBase64(blob)) as string;
        if (base64Data.search("data:image/") !== -1) {
          const savedFile = await this.writeFile(CACHE, path, base64Data);
          resolve(savedFile.uri);
        } else {
          reject("ERROR-no image file");
        }
      } else {
        reject("ERROR-fetch error");
      }
    });
  }
}

export const FileSystemService = new FileSystemController();
