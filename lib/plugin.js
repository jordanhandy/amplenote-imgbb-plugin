const plugin =// Javascript updated 2024-06-26, 5:23:49 p.m. by Amplenote Plugin Builder from source code within "https://github.com/jordanhandy/amplenote-imgbb-plugin"
{
  // Settings
  constants:{
    settingAPIKey: "API Key",
    settingImageExpiration: "Image Expiration (true or false. Default: false)",
    settingExpirationTime: "Expiration Time"
  },

  // Actions
  noteOption:{
    "Upload all note images to ImgBB":{
      run: async function(app,noteUUID){
        if(app.settings[this.constants.settingAPIKey] == ''){
          await app.alert("No API key specified.  Uploads will fail.  Please specify a key");
          return;
        }
        try{
          // Get the note content
          let noteContent = await app.getNoteContent({ uuid: noteUUID });
          // Get all matches for (url) with RegEX
          const matches = [...noteContent.matchAll(/!\[[^\]]*\]\((.*?)\)/g)];
          if(matches && matches.length > 0){
            // For each match, get the first match group
            for(let match of matches){
              // For each match, the note content will be overwritten with the current content with all matches replaced
              // Continues until all matches done
              console.log('this is the match',match[1])
              noteContent = noteContent.replace(match[1], await this._uploadFile(app, match[1]));
            }
          }
          // Run replacement and notify user
          const replacement = await app.replaceNoteContent({ uuid: app.context.noteUUID }, noteContent);
          await app.alert("All note image content replaced successfully.");

        }catch(err){
          await app.alert('Unable to replace some image content.  Please validate your settings, or contact plugin developer for support');
          console.log('plugin error',err);
        }
      }
    }
  },
  
  imageOption: {
    "Upload Image to ImgBB": {
      run: async function (app, image) {
        if(app.settings[this.constants.settingAPIKey] == ''){
          await app.alert('No API key specified.  Uploads will fail.  Please specify a key');
          return;
        }
        try {
          const src = image.src;
          const noteContent = await app.getNoteContent({ uuid: app.context.noteUUID });
          // Replace src original URL with changed URL
          const newContent = noteContent.replace(src, await this._uploadFile(app, src));
          // Replace content with embed URL
          const replacement = await app.replaceNoteContent({ uuid: app.context.noteUUID }, newContent)
          await app.alert("Content replaced successfully.");

        } catch (err) {
          await app.alert('Unable to replace image content.  Please validate your settings, or contact plugin developer for support');
          console.log('plugin error',err);
        }
      },
      // Check function whether to show the image option or not
      // If already uploaded to imgBB, don't show option
      check: async function (app, image) {
        const src = image.src;
        if (src.startsWith("https://i.ibb.co")){
          return false;
        } 
        return true;
      }
    }
  },
  // Append to form for upload
  async _uploadFile(app, src) {
    let formData = new FormData();
    formData.append('image', src);
    formData.append('key', app.settings[this.constants.settingAPIKey]);
    // If expiration was specified
    if (app.settings[this.constants.settingImageExpiration] == 'true') {
      formData.append("expiration", app.settings[this.constants.settingExpirationTime]);
    }
    const options = {
      method: "POST",
      body: formData
    };
    let result = await fetch('https://api.imgbb.com/1/upload', options);
    let data = await result.json();
    // Return imgBB embed URL
    return data.data.display_url;
  },
};
export default plugin;
