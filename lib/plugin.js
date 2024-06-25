
// --------------------------------------------------------------------------------------
// API Reference: https://www.amplenote.com/help/developing_amplenote_plugins
// Tips on developing plugins: https://www.amplenote.com/help/guide_to_developing_amplenote_plugins
const plugin = {
    imageOption: {
      "Upload Image to ImgBB": {
        run: async function(app, image) {
          try {
            const src = image.src;
            const uploadToImgBB = await this._uploadFile(app,src);
            const sourceNoteHandle = await app.findNote({uuid: app.context.noteUUID});
            const fileURL = await app.attachNoteMedia(sourceNoteHandle, uploadToImgBB);
            if(fileURL != ''){
              await app.context.updateImage({src: fileURL});
            await app.alert("Image successfully uploaded.");
            }else{
              throw new Error();
            }
          } catch (err) {
              await app.alert('Unable to upload image '+err);
          }
        },
   
        check: async function(app, image) {
          const src = image.src;
          if (src.startsWith("https://i.ibb.co")) return false;
          return true;
        }
      }
    },
   
    _uploadFile(app,src) {
      const axios = require("axios");
      let formParams;
      if(app.settings["Image Expiration"]){
        formParams = {
          key: app.settings["API Key"],
          expiration: app.settings["Expiration Time"]
        };
      }else{
        formParams = {
          key: app.settings["API Key"]
        }
      }

      let formData = new FormData();
      formData.append('image',src);
      axios({
        url: 'https://api.imgbb.com/1/upload',
        method: 'POST',
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: formParams
      }).then((res)=>{
        return res.data.data.display_url;
      }).catch((err)=>{
        return '';
      })
    },
};
export default plugin;
