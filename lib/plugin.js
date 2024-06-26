
// --------------------------------------------------------------------------------------
// API Reference: https://www.amplenote.com/help/developing_amplenote_plugins
// Tips on developing plugins: https://www.amplenote.com/help/guide_to_developing_amplenote_plugins
const plugin = {
  imageOption: {
    "Upload Image to ImgBB": {
      run: async function (app, image) {
        try {
          const src = image.src;
          const noteContent = await app.getNoteContent({ uuid: app.context.noteUUID });
          console.log(noteContent);
          //console.log('link  '+imgUrl);
          const newContent = noteContent.replace(src, await this._uploadFile(app, src));
          const replacement = await app.replaceNoteContent({ uuid: app.context.noteUUID }, newContent)
          await app.alert("Content replaced successfully.");

        } catch (err) {
          await app.alert('Unable to replace image content ' + err);
        }
      },

      check: async function (app, image) {
        const src = image.src;
        if (src.startsWith("https://i.ibb.co")) return false;
        return true;
      }
    }
  },

  async _uploadFile(app, src) {
    let formData = new FormData();
    formData.append('image', src);
    formData.append('key', app.settings["API Key"]);
    if (app.settings["Image Expiration"] == 'true') {
      formData.append("expiration", app.settings["Expiration Time"]);
    }
    const options = {
      method: "POST",
      body: formData
    };
    let result = await fetch('https://api.imgbb.com/1/upload', options);
    let data = await result.json();
    return data.data.display_url;
  },
};
export default plugin;
