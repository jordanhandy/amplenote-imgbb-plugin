(() => {
  // lib/plugin.js
  var plugin = {
    // Settings
    constants: {
      settingAPIKey: "API Key",
      settingImageExpiration: 'Image Expiration ("true" or "false". Default: false)',
      settingExpirationTime: "Expiration Time"
    },
    // Actions
    imageOption: {
      "Upload Image to ImgBB": {
        run: async function(app, image) {
          try {
            const src = image.src;
            const noteContent = await app.getNoteContent({ uuid: app.context.noteUUID });
            const newContent = noteContent.replace(src, await this._uploadFile(app, src));
            const replacement = await app.replaceNoteContent({ uuid: app.context.noteUUID }, newContent);
            await app.alert("Content replaced successfully.");
          } catch (err) {
            await app.alert("Unable to replace image content " + err);
          }
        },
        // Check function whether to show the image option or not
        // If already uploaded to imgBB, don't show option
        check: async function(app, image) {
          const src = image.src;
          if (src.startsWith("https://i.ibb.co")) {
            return false;
          }
          return true;
        }
      }
    },
    // Append to form for upload
    async _uploadFile(app, src) {
      let formData = new FormData();
      formData.append("image", src);
      formData.append("key", app.settings[this.constants.settingAPIKey]);
      if (app.settings[this.constants.settingImageExpiration] == "true") {
        formData.append("expiration", app.settings["Expiration Time"]);
      }
      const options = {
        method: "POST",
        body: formData
      };
      let result = await fetch("https://api.imgbb.com/1/upload", options);
      let data = await result.json();
      return data.data.display_url;
    }
  };
  var plugin_default = plugin;
})();
