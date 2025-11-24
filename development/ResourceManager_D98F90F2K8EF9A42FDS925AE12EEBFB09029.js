var ResourceManager, ResourceManagerContext;

ResourceManagerContext = (function() {

  /**
  * If associated to a gs.ResourceManager, a resource context registers all loaded resources
  * resources. If gs.ResourceManager needs to dispose resources, it will only dispose
  * resource associated if the current context.
  *
  * By default, each game scene creates it's own resource context to only dispose resources
  * created by itself.
  *
  * @module gs
  * @class ResourceManager
  * @memberof gs
  * @constructor
   */
  function ResourceManagerContext() {

    /**
    * All resources associated with this context.
    * @property resources
    * @type Object[]
    * @readOnly
     */
    this.resources = [];
  }


  /**
  * Converts the resource context into a data-bundle for serialization. The data-bundle will only contain
  * the names of the resources associated with this context but not the resource-data itself.
  * @method toDataBundle
  * @return {string[]} An array of resource names associated with this context.
   */

  ResourceManagerContext.prototype.toDataBundle = function() {
    return this.resources.select(function(r) {
      return r.name;
    });
  };


  /**
  * Initializes the resource context from a data-bundle. Any already existing resource associations
  * with this context will be deleted.
  * @method fromDataBundle
   */

  ResourceManagerContext.prototype.fromDataBundle = function(data, resourcesByPath) {
    return this.resources = data.select(function(n) {
      return {
        name: n,
        data: resourcesByPath[n]
      };
    });
  };


  /**
  * Adds the specified resource to the context.
  * @method add
  * @param {string} name - A unique name for the resource like the file-path for example.
  * @param {gs.Bitmap|gs.AudioBuffer|gs.Video|gs.Live2DModel} data - The resource data like a gs.Bitmap object for example.
   */

  ResourceManagerContext.prototype.add = function(name, resource) {
    return this.resources.push({
      name: name,
      data: resource
    });
  };


  /**
  * Removes the resource with the specified name from the context.
  * @method remove
  * @param {string} name - The name of the resource to remove. For Example: The file name.
   */

  ResourceManagerContext.prototype.remove = function(name) {
    return this.resources.remove(this.resources.first(function(r) {
      return r.name === name;
    }));
  };

  return ResourceManagerContext;

})();

gs.ResourceManagerContext = ResourceManagerContext;

ResourceManager = (function() {

  /**
  * Manages the resources of the game like graphics, audio, fonts, etc. It
  * offers a lot of methods to easily access game resources and automatically
  * caches them. So if an image is requested a second time it will be taken
  * from the cache instead of loading it again.
  *
  * @module gs
  * @class ResourceManager
  * @memberof gs
  * @constructor
   */
  function ResourceManager() {

    /**
    * Current resource context. All loaded resources will be associated with it. If current context
    * is set to <b>null</b>, the <b>systemContext</b> is used instead.
    * @property context
    * @type gs.ResourceManagerContext
    * @protected
     */
    this.context_ = null;

    /**
    * System resource context. All loaded system resources are associated with this context. Resources
    * which are associated with the system context are not disposed until the game ends.
    * @property context
    * @type gs.ResourceManagerContext
     */
    this.systemContext = this.createContext();

    /**
    * Holds in-memory created bitmaps.
    * @property customBitmapsByKey
    * @type Object
    * @protected
     */
    this.customBitmapsByKey = {};

    /**
    * Caches resources by file path.
    * @property resourcesByPath
    * @type Object
    * @protected
     */
    this.resourcesByPath = {};

    /**
    * Caches resources by file path and HUE.
    * @property resourcesByPath
    * @type Object
    * @protected
     */
    this.resourcesByPathHue = {};

    /**
    * Stores all loaded resources.
    * @property resources
    * @type Object[]
     */
    this.resources = [];

    /**
    * Indicates if all requested resources are loaded.
    * @property resourcesLoaded
    * @type boolean
     */
    this.resourcesLoaded = true;

    /**
    * @property events
    * @type gs.EventEmitter
     */
    this.events = new gs.EventEmitter();
  }


  /**
  * Current resource context. All loaded resources will be associated with it. If current context
  * is set to <b>null</b>, the <b>systemContext</b> is used instead.
  * @property context
  * @type gs.ResourceManagerContext
   */

  ResourceManager.accessors("context", {
    set: function(v) {
      return this.context_ = v;
    },
    get: function() {
      var ref;
      return (ref = this.context_) != null ? ref : this.systemContext;
    }
  });


  /**
  * Creates a new resource context. Use <b>context</b> to set the new created context
  * as current context.
  *
  * @method createContext
   */

  ResourceManager.prototype.createContext = function() {
    return new gs.ResourceManagerContext();
  };


  /**
  * Disposes all bitmap resources associated with the current context.
  *
  * @method disposeBitmaps
   */

  ResourceManager.prototype.disposeBitmaps = function() {
    var j, len, ref, resource, results;
    ref = this.context.resources;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      resource = ref[j];
      if (resource.data instanceof gs.Bitmap) {
        resource.data.dispose();
        this.resources.remove(this.resources.first((function(r) {
          var result;
          result = r.filePath === resource.data.filePath;
          if (result) {
            r.dispose();
          }
          return result;
        })));
        this.resources.remove(resource.data);
        if (resource.name) {
          this.resourcesByPath[resource.name] = null;
          results.push(delete this.resourcesByPath[resource.name]);
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Disposes all video resources associated with the current context.
  *
  * @method disposeVideos
   */

  ResourceManager.prototype.disposeVideos = function() {
    var j, len, ref, resource, results;
    ref = this.context.resources;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      resource = ref[j];
      if (resource.data instanceof gs.Video) {
        resource.data.dispose();
        this.resources.remove(resource.data);
        this.resourcesByPath[resource.name] = null;
        results.push(delete this.resourcesByPath[resource.name]);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Disposes all audio resources associated with the current context.
  *
  * @method disposeAudio
   */

  ResourceManager.prototype.disposeAudio = function() {
    var j, len, ref, resource, results;
    AudioManager.dispose(this.context);
    ref = this.context.resources;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      resource = ref[j];
      if (resource.data instanceof GS.AudioBuffer || resource instanceof GS.AudioBufferStream) {
        resource.data.dispose();
        this.resources.remove(resource.data);
        this.resourcesByPath[resource.name] = null;
        results.push(delete this.resourcesByPath[resource.name]);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Disposes all Live2D resources associated with the current context.
  *
  * @method disposeLive2D
   */

  ResourceManager.prototype.disposeLive2D = function() {
    var j, len, ref, resource, results;
    ref = this.context.resources;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      resource = ref[j];
      if ((resource.data instanceof gs.Live2DModel_21) || (resource.data instanceof gs.Live2DModel_40)) {
        resource.data.dispose();
        this.resources.remove(resource.data);
        this.resourcesByPath[resource.name] = null;
        results.push(delete this.resourcesByPath[resource.name]);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Disposes all resources.
  *
  * @method dispose
   */

  ResourceManager.prototype.dispose = function() {
    this.disposeBitmaps();
    this.disposeVideos();
    this.disposeAudio();
    this.disposeLive2D();
    return this.context = this.systemContext;
  };


  /**
  * Loads all custom fonts in Graphics/Fonts folder.
  *
  * @method loadFonts
   */

  ResourceManager.prototype.loadFonts = function() {
    var resource;
    resource = {
      loaded: false
    };
    this.resources.push(resource);
    this.resourcesByPath["Graphics/Fonts"] = resource;
    return gs.Font.loadCustomFonts((function(_this) {
      return function(error) {
        _this.resourcesByPath["Graphics/Fonts"].loaded = true;
        if (error) {
          return _this.resourcesByPath["Graphics/Fonts"].error = true;
        }
      };
    })(this));
  };


  /**
  * Gets a custom created bitmap by key.
  *
  * @method getCustomBitmap
  * @param {String} key - The key for the bitmap to get.
  * @return {gs.Bitmap} The bitmap or <b>null</b> if no bitmap exists for the specified key.
   */

  ResourceManager.prototype.getCustomBitmap = function(key) {
    return this.customBitmapsByKey[key];
  };


  /**
  * Sets a custom created bitmap for a specified key.
  *
  * @method setCustomBitmap
  * @param {String} key - The key for the bitmap to set.
  * @param {gs.Bitmap} bitmap - The bitmap to set.
   */

  ResourceManager.prototype.setCustomBitmap = function(key, bitmap) {
    this.customBitmapsByKey[key] = bitmap;
    if (bitmap.loaded == null) {
      this.resources.push(bitmap);
      return this.resourcesLoaded = false;
    }
  };


  /**
  * Adds a custom created bitmap to the resource manager.
  *
  * @method addCustomBitmap
  * @param {gs.Bitmap} bitmap - The bitmap to add.
   */

  ResourceManager.prototype.addCustomBitmap = function(bitmap) {
    return this.context.resources.push({
      name: "",
      data: bitmap
    });
  };


  /**
  * Gets a Live2D model.
  *
  * @method getLive2DModel
  * @param {String} filePath - Path to the Live2D model file.
  * @return {gs.Live2DModel} The Live2D model or <b>null</b> if no model exists at the specified file path.
   */

  ResourceManager.prototype.getLive2DModel = function(filePath) {
    var profile, result;
    result = this.resourcesByPath[filePath];
    if ((result == null) || result.disposed) {
      profile = LanguageManager.profile;
      result = gs.Live2DModel.create(filePath, ((profile != null) && (profile.items != null) ? profile.items.code : null));
      this.resourcesByPath[filePath] = result;
      this.resources.push(result);
      this.resourcesLoaded = false;
      this.context.resources.push({
        name: filePath,
        data: result
      });
    }
    return result;
  };


  /**
  * Gets a font.
  *
  * @method getFont
  * @param {String} name - The name of the font to get.
  * @param {number} size - The size of the font to get.
  * @return {gs.Font} The font or <b>null</b> if no font with the specified name exists.
   */

  ResourceManager.prototype.getFont = function(name, size) {
    var result;
    result = new Font(name, size);
    this.resources.push(result);
    this.resourcesLoaded = false;
    return result;
  };


  /**
  * Gets a video.
  *
  * @method getVideo
  * @param {String} filePath - Path to the video file.
  * @return {gs.Video} The video or <b>null</b> if no video exists at the specified file path.
   */

  ResourceManager.prototype.getVideo = function(filePath) {
    var profile, result;
    if (filePath.endsWith("/")) {
      return null;
    }
    result = this.resourcesByPath[filePath];
    if ((result == null) || result.disposed) {
      profile = LanguageManager.profile;
      result = new gs.Video(filePath, ((profile != null) && (profile.items != null) ? profile.items.code : null));
      this.resourcesByPath[filePath] = result;
      this.resources.push(result);
      this.resourcesLoaded = false;
      this.context.resources.push({
        name: filePath,
        data: result
      });
    }
    return result;
  };


  /**
  * Gets the correct file path for the specified resource.
  *
  * @method getPath
  * @param {Object} resource - The resource object which is usually stored inside a command's params or in data records.
  * @return {String} The correct file path for the specified resource.
   */

  ResourceManager.prototype.getPath = function(resource) {
    if (resource != null) {
      return resource.folderPath + "/" + resource.name;
    } else {
      return "";
    }
  };


  /**
  * Gets a bitmap.
  *
  * @method getBitmap
  * @param {String|Object} filePath - Path to the bitmap file OR a graphic info object.
  * @param {number} hue - The bitmap's hue. The bitmap will be loaded and then recolored.
  * @return {gs.Bitmap} The bitmap or <b>null</b> if no bitmap exists at the specified file path.
   */

  ResourceManager.prototype.getBitmap = function(filePath, hue) {
    var hueBitmap, profile, result;
    if (filePath.endsWith("/")) {
      return null;
    }
    hue = hue || 0;
    result = this.resourcesByPath[filePath] || this.customBitmapsByKey[filePath];
    if (result == null) {
      profile = LanguageManager.profile;
      result = new Bitmap(filePath, ((profile != null) && (profile.items != null) ? profile.items.code : null), false);
      result.hue = hue;
      result.filePath = filePath;
      this.resourcesByPath[filePath] = result;
      this.resources.push(result);
      this.resourcesLoaded = false;
      this.context.resources.push({
        name: filePath,
        data: result
      });
    } else if (!result.loaded && result.hue !== hue) {
      profile = LanguageManager.profile;
      result = new Bitmap(filePath, ((profile != null) && (profile.items != null) ? profile.items.code : null));
      result.hue = hue;
      result.filePath = filePath;
      this.resources.push(result);
      this.resourcesLoaded = false;
    } else if (hue > 0) {
      hueBitmap = this.resourcesByPathHue[filePath + "@" + hue];
      if ((hueBitmap == null) && result.loaded) {
        hueBitmap = new Bitmap(result.image);
        hueBitmap.changeHue(hue);
        this.resourcesByPathHue[filePath + "@" + hue] = hueBitmap;
      }
      if (hueBitmap != null) {
        result = hueBitmap;
      }
    }
    return result;
  };


  /**
  * Gets an HTML image.
  *
  * @method getImage
  * @param {String} filePath - Path to the image file.
  * @return {HTMLImageElement} The image or <b>null</b> if no image exists at the specified file path.
   */

  ResourceManager.prototype.getImage = function(filePath) {
    var result;
    result = this.resourcesByPath[filePath];
    if (result == null) {
      result = new Bitmap("resources/" + filePath + ".png");
      this.resourcesByPath[filePath] = result;
      this.resources.push(result);
      this.resourcesLoaded = false;
    }
    return result;
  };


  /**
  * Gets an audio stream.
  *
  * @method getAudioStream
  * @param {String} filePath - Path to the audio file.
  * @return {gs.AudioBuffer} The audio buffer or <b>null</b> if no audio file exists at the specified file path.
   */

  ResourceManager.prototype.getAudioStream = function(filePath) {
    var languageCode, profile, result;
    result = this.resourcesByPath[filePath];
    profile = LanguageManager.profile;
    languageCode = (profile != null) && (profile.items != null) ? profile.items.code : null;
    if (result == null) {
      result = new GS.AudioBuffer(filePath);
      this.resourcesByPath[filePath] = result;
      this.resources.push(result);
      this.resourcesLoaded = false;
      this.context.resources.push({
        name: filePath,
        data: result
      });
    }
    return result;
  };


  /**
  * Gets an audio buffer. The audio data is fully loaded and decoded in memory. It is recommeneded
  * for sound effects but for a long background music, <b>getAudioStream</b> should be used instead. That is especially
  * the case on mobile devices.
  *
  * @method getAudioBuffer
  * @param {String} filePath - Path to the audio file.
  * @return {gs.AudioBuffer} The audio buffer or <b>null</b> if no audio file exists at the specified file path.
   */

  ResourceManager.prototype.getAudioBuffer = function(filePath) {
    var languageCode, profile, result;
    result = this.resourcesByPath[filePath];
    profile = LanguageManager.profile;
    languageCode = (profile != null) && (profile.items != null) ? profile.items.code : null;
    if (result == null) {
      result = new GS.AudioBuffer(filePath);
      this.resourcesByPath[filePath] = result;
      this.resources.push(result);
      this.resourcesLoaded = false;
      this.context.resources.push({
        name: filePath,
        data: result
      });
    }
    return result;
  };


  /**
  * Updates the loading process. Needs to be called once per frame to keep
  * the ResourceManager up to date.
  *
  * @method update
   */

  ResourceManager.prototype.update = function() {
    var bitmap, i, j, ref;
    if (this.events == null) {
      this.events = new gs.EventEmitter();
    }
    if (!this.resourcesLoaded) {
      this.resourcesLoaded = true;
      for (i = j = 0, ref = this.resources.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (!this.resources[i].loaded) {
          this.resourcesLoaded = false;
          break;
        } else if ((this.resources[i].hue != null) && this.resources[i].hue > 0) {
          bitmap = new Bitmap(this.resources[i].image);
          this.resourcesByPath[this.resources[i].filePath] = bitmap;
          this.resources[i].changeHue(this.resources[i].hue);
          this.resourcesByPathHue[this.resources[i].filePath + "@" + this.resources[i].hue] = this.resources[i];
          delete this.resources[i].filePath;
          delete this.resources[i].hue;
        }
      }
      if (this.resourcesLoaded) {
        this.events.emit("loaded", this);
      }
    }
    return null;
  };

  return ResourceManager;

})();

window.ResourceManager = ResourceManager;

gs.ResourceManager = ResourceManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7Ozs7Ozs7RUFhYSxnQ0FBQTs7QUFDVDs7Ozs7O0lBTUEsSUFBQyxDQUFBLFNBQUQsR0FBYTtFQVBKOzs7QUFVYjs7Ozs7OzttQ0FNQSxZQUFBLEdBQWMsU0FBQTtXQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixTQUFDLENBQUQ7YUFBTyxDQUFDLENBQUM7SUFBVCxDQUFsQjtFQUFIOzs7QUFFZDs7Ozs7O21DQUtBLGNBQUEsR0FBZ0IsU0FBQyxJQUFELEVBQU8sZUFBUDtXQUEyQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUksQ0FBQyxNQUFMLENBQVksU0FBQyxDQUFEO2FBQU87UUFBQSxJQUFBLEVBQU0sQ0FBTjtRQUFTLElBQUEsRUFBTSxlQUFnQixDQUFBLENBQUEsQ0FBL0I7O0lBQVAsQ0FBWjtFQUF4Qzs7O0FBRWhCOzs7Ozs7O21DQU1BLEdBQUEsR0FBSyxTQUFDLElBQUQsRUFBTyxRQUFQO1dBQW9CLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQjtNQUFFLElBQUEsRUFBTSxJQUFSO01BQWMsSUFBQSxFQUFNLFFBQXBCO0tBQWhCO0VBQXBCOzs7QUFFTDs7Ozs7O21DQUtBLE1BQUEsR0FBUSxTQUFDLElBQUQ7V0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFYLENBQWlCLFNBQUMsQ0FBRDthQUFPLENBQUMsQ0FBQyxJQUFGLEtBQVU7SUFBakIsQ0FBakIsQ0FBbEI7RUFBVjs7Ozs7O0FBRVosRUFBRSxDQUFDLHNCQUFILEdBQTRCOztBQUV0Qjs7QUFDRjs7Ozs7Ozs7Ozs7RUFXYSx5QkFBQTs7QUFDVDs7Ozs7OztJQU9BLElBQUMsQ0FBQSxRQUFELEdBQVk7O0FBRVo7Ozs7OztJQU1BLElBQUMsQ0FBQSxhQUFELEdBQWlC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QUNyQixPQUFPLElBQUMsQ0FBQSxTQUFVLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFQcEI7O0FBSlQ7TUFZQSxJQUFHLElBQUMsQ0FBQSxlQUFKO1FBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsUUFBYixFQUF1QixJQUF2QixFQURKO09BZEo7O0FBaUJBLFdBQU87RUFuQkg7Ozs7OztBQXFCWixNQUFNLENBQUMsZUFBUCxHQUF5Qjs7QUFDekIsRUFBRSxDQUFDLGVBQUgsR0FBcUIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IFJlc291cmNlTWFuYWdlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgUmVzb3VyY2VNYW5hZ2VyQ29udGV4dFxuICAgICMjIypcbiAgICAqIElmIGFzc29jaWF0ZWQgdG8gYSBncy5SZXNvdXJjZU1hbmFnZXIsIGEgcmVzb3VyY2UgY29udGV4dCByZWdpc3RlcnMgYWxsIGxvYWRlZCByZXNvdXJjZXNcbiAgICAqIHJlc291cmNlcy4gSWYgZ3MuUmVzb3VyY2VNYW5hZ2VyIG5lZWRzIHRvIGRpc3Bvc2UgcmVzb3VyY2VzLCBpdCB3aWxsIG9ubHkgZGlzcG9zZVxuICAgICogcmVzb3VyY2UgYXNzb2NpYXRlZCBpZiB0aGUgY3VycmVudCBjb250ZXh0LlxuICAgICpcbiAgICAqIEJ5IGRlZmF1bHQsIGVhY2ggZ2FtZSBzY2VuZSBjcmVhdGVzIGl0J3Mgb3duIHJlc291cmNlIGNvbnRleHQgdG8gb25seSBkaXNwb3NlIHJlc291cmNlc1xuICAgICogY3JlYXRlZCBieSBpdHNlbGYuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIFJlc291cmNlTWFuYWdlclxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCByZXNvdXJjZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29udGV4dC5cbiAgICAgICAgKiBAcHJvcGVydHkgcmVzb3VyY2VzXG4gICAgICAgICogQHR5cGUgT2JqZWN0W11cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEByZXNvdXJjZXMgPSBbXVxuXG5cbiAgICAjIyMqXG4gICAgKiBDb252ZXJ0cyB0aGUgcmVzb3VyY2UgY29udGV4dCBpbnRvIGEgZGF0YS1idW5kbGUgZm9yIHNlcmlhbGl6YXRpb24uIFRoZSBkYXRhLWJ1bmRsZSB3aWxsIG9ubHkgY29udGFpblxuICAgICogdGhlIG5hbWVzIG9mIHRoZSByZXNvdXJjZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29udGV4dCBidXQgbm90IHRoZSByZXNvdXJjZS1kYXRhIGl0c2VsZi5cbiAgICAqIEBtZXRob2QgdG9EYXRhQnVuZGxlXG4gICAgKiBAcmV0dXJuIHtzdHJpbmdbXX0gQW4gYXJyYXkgb2YgcmVzb3VyY2UgbmFtZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29udGV4dC5cbiAgICAjIyNcbiAgICB0b0RhdGFCdW5kbGU6IC0+IEByZXNvdXJjZXMuc2VsZWN0IChyKSAtPiByLm5hbWVcblxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSByZXNvdXJjZSBjb250ZXh0IGZyb20gYSBkYXRhLWJ1bmRsZS4gQW55IGFscmVhZHkgZXhpc3RpbmcgcmVzb3VyY2UgYXNzb2NpYXRpb25zXG4gICAgKiB3aXRoIHRoaXMgY29udGV4dCB3aWxsIGJlIGRlbGV0ZWQuXG4gICAgKiBAbWV0aG9kIGZyb21EYXRhQnVuZGxlXG4gICAgIyMjXG4gICAgZnJvbURhdGFCdW5kbGU6IChkYXRhLCByZXNvdXJjZXNCeVBhdGgpIC0+IEByZXNvdXJjZXMgPSBkYXRhLnNlbGVjdCAobikgLT4gbmFtZTogbiwgZGF0YTogcmVzb3VyY2VzQnlQYXRoW25dXG5cbiAgICAjIyMqXG4gICAgKiBBZGRzIHRoZSBzcGVjaWZpZWQgcmVzb3VyY2UgdG8gdGhlIGNvbnRleHQuXG4gICAgKiBAbWV0aG9kIGFkZFxuICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBBIHVuaXF1ZSBuYW1lIGZvciB0aGUgcmVzb3VyY2UgbGlrZSB0aGUgZmlsZS1wYXRoIGZvciBleGFtcGxlLlxuICAgICogQHBhcmFtIHtncy5CaXRtYXB8Z3MuQXVkaW9CdWZmZXJ8Z3MuVmlkZW98Z3MuTGl2ZTJETW9kZWx9IGRhdGEgLSBUaGUgcmVzb3VyY2UgZGF0YSBsaWtlIGEgZ3MuQml0bWFwIG9iamVjdCBmb3IgZXhhbXBsZS5cbiAgICAjIyNcbiAgICBhZGQ6IChuYW1lLCByZXNvdXJjZSkgLT4gQHJlc291cmNlcy5wdXNoKHsgbmFtZTogbmFtZSwgZGF0YTogcmVzb3VyY2UgfSlcblxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgdGhlIHJlc291cmNlIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lIGZyb20gdGhlIGNvbnRleHQuXG4gICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgcmVzb3VyY2UgdG8gcmVtb3ZlLiBGb3IgRXhhbXBsZTogVGhlIGZpbGUgbmFtZS5cbiAgICAjIyNcbiAgICByZW1vdmU6IChuYW1lKSAtPiBAcmVzb3VyY2VzLnJlbW92ZShAcmVzb3VyY2VzLmZpcnN0KChyKSAtPiByLm5hbWUgPT0gbmFtZSkpXG5cbmdzLlJlc291cmNlTWFuYWdlckNvbnRleHQgPSBSZXNvdXJjZU1hbmFnZXJDb250ZXh0XG5cbmNsYXNzIFJlc291cmNlTWFuYWdlclxuICAgICMjIypcbiAgICAqIE1hbmFnZXMgdGhlIHJlc291cmNlcyBvZiB0aGUgZ2FtZSBsaWtlIGdyYXBoaWNzLCBhdWRpbywgZm9udHMsIGV0Yy4gSXRcbiAgICAqIG9mZmVycyBhIGxvdCBvZiBtZXRob2RzIHRvIGVhc2lseSBhY2Nlc3MgZ2FtZSByZXNvdXJjZXMgYW5kIGF1dG9tYXRpY2FsbHlcbiAgICAqIGNhY2hlcyB0aGVtLiBTbyBpZiBhbiBpbWFnZSBpcyByZXF1ZXN0ZWQgYSBzZWNvbmQgdGltZSBpdCB3aWxsIGJlIHRha2VuXG4gICAgKiBmcm9tIHRoZSBjYWNoZSBpbnN0ZWFkIG9mIGxvYWRpbmcgaXQgYWdhaW4uXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIFJlc291cmNlTWFuYWdlclxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEN1cnJlbnQgcmVzb3VyY2UgY29udGV4dC4gQWxsIGxvYWRlZCByZXNvdXJjZXMgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggaXQuIElmIGN1cnJlbnQgY29udGV4dFxuICAgICAgICAqIGlzIHNldCB0byA8Yj5udWxsPC9iPiwgdGhlIDxiPnN5c3RlbUNvbnRleHQ8L2I+IGlzIHVzZWQgaW5zdGVhZC5cbiAgICAgICAgKiBAcHJvcGVydHkgY29udGV4dFxuICAgICAgICAqIEB0eXBlIGdzLlJlc291cmNlTWFuYWdlckNvbnRleHRcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAY29udGV4dF8gPSBudWxsXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN5c3RlbSByZXNvdXJjZSBjb250ZXh0LiBBbGwgbG9hZGVkIHN5c3RlbSByZXNvdXJjZXMgYXJlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbnRleHQuIFJlc291cmNlc1xuICAgICAgICAqIHdoaWNoIGFyZSBhc3NvY2lhdGVkIHdpdGggdGhlIHN5c3RlbSBjb250ZXh0IGFyZSBub3QgZGlzcG9zZWQgdW50aWwgdGhlIGdhbWUgZW5kcy5cbiAgICAgICAgKiBAcHJvcGVydHkgY29udGV4dFxuICAgICAgICAqIEB0eXBlIGdzLlJlc291cmNlTWFuYWdlckNvbnRleHRcbiAgICAgICAgIyMjXG4gICAgICAgIEBzeXN0ZW1Db250ZXh0ID0gQGNyZWF0ZUNvbnRleHQoKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBIb2xkcyBpbi1tZW1vcnkgY3JlYXRlZCBiaXRtYXBzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXN0b21CaXRtYXBzQnlLZXlcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAY3VzdG9tQml0bWFwc0J5S2V5ID0ge31cblxuICAgICAgICAjIyMqXG4gICAgICAgICogQ2FjaGVzIHJlc291cmNlcyBieSBmaWxlIHBhdGguXG4gICAgICAgICogQHByb3BlcnR5IHJlc291cmNlc0J5UGF0aFxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEByZXNvdXJjZXNCeVBhdGggPSB7fVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDYWNoZXMgcmVzb3VyY2VzIGJ5IGZpbGUgcGF0aCBhbmQgSFVFLlxuICAgICAgICAqIEBwcm9wZXJ0eSByZXNvdXJjZXNCeVBhdGhcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAcmVzb3VyY2VzQnlQYXRoSHVlID0ge31cblxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGFsbCBsb2FkZWQgcmVzb3VyY2VzLlxuICAgICAgICAqIEBwcm9wZXJ0eSByZXNvdXJjZXNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICAgICAjIyNcbiAgICAgICAgQHJlc291cmNlcyA9IFtdXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiBhbGwgcmVxdWVzdGVkIHJlc291cmNlcyBhcmUgbG9hZGVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSByZXNvdXJjZXNMb2FkZWRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAcmVzb3VyY2VzTG9hZGVkID0gdHJ1ZVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgZXZlbnRzXG4gICAgICAgICogQHR5cGUgZ3MuRXZlbnRFbWl0dGVyXG4gICAgICAgICMjI1xuICAgICAgICBAZXZlbnRzID0gbmV3IGdzLkV2ZW50RW1pdHRlcigpXG5cbiAgICAjIyMqXG4gICAgKiBDdXJyZW50IHJlc291cmNlIGNvbnRleHQuIEFsbCBsb2FkZWQgcmVzb3VyY2VzIHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIGl0LiBJZiBjdXJyZW50IGNvbnRleHRcbiAgICAqIGlzIHNldCB0byA8Yj5udWxsPC9iPiwgdGhlIDxiPnN5c3RlbUNvbnRleHQ8L2I+IGlzIHVzZWQgaW5zdGVhZC5cbiAgICAqIEBwcm9wZXJ0eSBjb250ZXh0XG4gICAgKiBAdHlwZSBncy5SZXNvdXJjZU1hbmFnZXJDb250ZXh0XG4gICAgIyMjXG4gICAgQGFjY2Vzc29ycyBcImNvbnRleHRcIixcbiAgICAgICAgc2V0OiAodikgLT4gQGNvbnRleHRfID0gdlxuICAgICAgICBnZXQ6IC0+IEBjb250ZXh0XyA/IEBzeXN0ZW1Db250ZXh0XG5cbiAgICAjIyMqXG4gICAgKiBDcmVhdGVzIGEgbmV3IHJlc291cmNlIGNvbnRleHQuIFVzZSA8Yj5jb250ZXh0PC9iPiB0byBzZXQgdGhlIG5ldyBjcmVhdGVkIGNvbnRleHRcbiAgICAqIGFzIGN1cnJlbnQgY29udGV4dC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZUNvbnRleHRcbiAgICAjIyNcbiAgICBjcmVhdGVDb250ZXh0OiAtPiBuZXcgZ3MuUmVzb3VyY2VNYW5hZ2VyQ29udGV4dCgpXG5cbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyBhbGwgYml0bWFwIHJlc291cmNlcyBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnQgY29udGV4dC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VCaXRtYXBzXG4gICAgIyMjXG4gICAgZGlzcG9zZUJpdG1hcHM6IC0+XG4gICAgICAgIGZvciByZXNvdXJjZSBpbiBAY29udGV4dC5yZXNvdXJjZXNcbiAgICAgICAgICAgIGlmIHJlc291cmNlLmRhdGEgaW5zdGFuY2VvZiBncy5CaXRtYXBcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLmRpc3Bvc2UoKVxuICAgICAgICAgICAgICAgIEByZXNvdXJjZXMucmVtb3ZlKEByZXNvdXJjZXMuZmlyc3QgKChyKSAtPlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByLmZpbGVQYXRoID09IHJlc291cmNlLmRhdGEuZmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgci5kaXNwb3NlKCkgaWYgcmVzdWx0XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgQHJlc291cmNlcy5yZW1vdmUocmVzb3VyY2UuZGF0YSlcbiAgICAgICAgICAgICAgICBpZiByZXNvdXJjZS5uYW1lXG4gICAgICAgICAgICAgICAgICAgIEByZXNvdXJjZXNCeVBhdGhbcmVzb3VyY2UubmFtZV0gPSBudWxsXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAcmVzb3VyY2VzQnlQYXRoW3Jlc291cmNlLm5hbWVdXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgYWxsIHZpZGVvIHJlc291cmNlcyBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnQgY29udGV4dC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VWaWRlb3NcbiAgICAjIyNcbiAgICBkaXNwb3NlVmlkZW9zOiAtPlxuICAgICAgICBmb3IgcmVzb3VyY2UgaW4gQGNvbnRleHQucmVzb3VyY2VzXG4gICAgICAgICAgICBpZiByZXNvdXJjZS5kYXRhIGluc3RhbmNlb2YgZ3MuVmlkZW9cbiAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLmRpc3Bvc2UoKVxuICAgICAgICAgICAgICAgIEByZXNvdXJjZXMucmVtb3ZlKHJlc291cmNlLmRhdGEpXG4gICAgICAgICAgICAgICAgQHJlc291cmNlc0J5UGF0aFtyZXNvdXJjZS5uYW1lXSA9IG51bGxcbiAgICAgICAgICAgICAgICBkZWxldGUgQHJlc291cmNlc0J5UGF0aFtyZXNvdXJjZS5uYW1lXVxuXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgYWxsIGF1ZGlvIHJlc291cmNlcyBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnQgY29udGV4dC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VBdWRpb1xuICAgICMjI1xuICAgIGRpc3Bvc2VBdWRpbzogLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLmRpc3Bvc2UoQGNvbnRleHQpXG5cbiAgICAgICAgZm9yIHJlc291cmNlIGluIEBjb250ZXh0LnJlc291cmNlc1xuICAgICAgICAgICAgaWYgcmVzb3VyY2UuZGF0YSBpbnN0YW5jZW9mIEdTLkF1ZGlvQnVmZmVyIG9yIHJlc291cmNlIGluc3RhbmNlb2YgR1MuQXVkaW9CdWZmZXJTdHJlYW1cbiAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLmRpc3Bvc2UoKVxuICAgICAgICAgICAgICAgIEByZXNvdXJjZXMucmVtb3ZlKHJlc291cmNlLmRhdGEpXG4gICAgICAgICAgICAgICAgQHJlc291cmNlc0J5UGF0aFtyZXNvdXJjZS5uYW1lXSA9IG51bGxcbiAgICAgICAgICAgICAgICBkZWxldGUgQHJlc291cmNlc0J5UGF0aFtyZXNvdXJjZS5uYW1lXVxuXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgYWxsIExpdmUyRCByZXNvdXJjZXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50IGNvbnRleHQuXG4gICAgKlxuICAgICogQG1ldGhvZCBkaXNwb3NlTGl2ZTJEXG4gICAgIyMjXG4gICAgZGlzcG9zZUxpdmUyRDogLT5cbiAgICAgICAgZm9yIHJlc291cmNlIGluIEBjb250ZXh0LnJlc291cmNlc1xuICAgICAgICAgICAgaWYgKHJlc291cmNlLmRhdGEgaW5zdGFuY2VvZiBncy5MaXZlMkRNb2RlbF8yMSkgfHwgKHJlc291cmNlLmRhdGEgaW5zdGFuY2VvZiBncy5MaXZlMkRNb2RlbF80MClcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLmRpc3Bvc2UoKVxuICAgICAgICAgICAgICAgIEByZXNvdXJjZXMucmVtb3ZlKHJlc291cmNlLmRhdGEpXG4gICAgICAgICAgICAgICAgQHJlc291cmNlc0J5UGF0aFtyZXNvdXJjZS5uYW1lXSA9IG51bGxcbiAgICAgICAgICAgICAgICBkZWxldGUgQHJlc291cmNlc0J5UGF0aFtyZXNvdXJjZS5uYW1lXVxuXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgYWxsIHJlc291cmNlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyNcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBAZGlzcG9zZUJpdG1hcHMoKVxuICAgICAgICBAZGlzcG9zZVZpZGVvcygpXG4gICAgICAgIEBkaXNwb3NlQXVkaW8oKVxuICAgICAgICBAZGlzcG9zZUxpdmUyRCgpXG5cbiAgICAgICAgQGNvbnRleHQgPSBAc3lzdGVtQ29udGV4dFxuXG4gICAgIyMjKlxuICAgICogTG9hZHMgYWxsIGN1c3RvbSBmb250cyBpbiBHcmFwaGljcy9Gb250cyBmb2xkZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkRm9udHNcbiAgICAjIyNcbiAgICBsb2FkRm9udHM6IC0+XG4gICAgICAgIHJlc291cmNlID0geyBsb2FkZWQ6IG5vIH1cbiAgICAgICAgQHJlc291cmNlcy5wdXNoKHJlc291cmNlKVxuICAgICAgICBAcmVzb3VyY2VzQnlQYXRoW1wiR3JhcGhpY3MvRm9udHNcIl0gPSByZXNvdXJjZVxuXG4gICAgICAgIGdzLkZvbnQubG9hZEN1c3RvbUZvbnRzKChlcnJvcikgPT5cbiAgICAgICAgICAgIEByZXNvdXJjZXNCeVBhdGhbXCJHcmFwaGljcy9Gb250c1wiXS5sb2FkZWQgPSB5ZXNcbiAgICAgICAgICAgIGlmIGVycm9yXG4gICAgICAgICAgICAgICAgQHJlc291cmNlc0J5UGF0aFtcIkdyYXBoaWNzL0ZvbnRzXCJdLmVycm9yID0geWVzXG4gICAgICAgIClcbiAgICAjIyMqXG4gICAgKiBHZXRzIGEgY3VzdG9tIGNyZWF0ZWQgYml0bWFwIGJ5IGtleS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGdldEN1c3RvbUJpdG1hcFxuICAgICogQHBhcmFtIHtTdHJpbmd9IGtleSAtIFRoZSBrZXkgZm9yIHRoZSBiaXRtYXAgdG8gZ2V0LlxuICAgICogQHJldHVybiB7Z3MuQml0bWFwfSBUaGUgYml0bWFwIG9yIDxiPm51bGw8L2I+IGlmIG5vIGJpdG1hcCBleGlzdHMgZm9yIHRoZSBzcGVjaWZpZWQga2V5LlxuICAgICMjI1xuICAgIGdldEN1c3RvbUJpdG1hcDogKGtleSkgLT5cbiAgICAgICAgcmV0dXJuIEBjdXN0b21CaXRtYXBzQnlLZXlba2V5XVxuXG4gICAgIyMjKlxuICAgICogU2V0cyBhIGN1c3RvbSBjcmVhdGVkIGJpdG1hcCBmb3IgYSBzcGVjaWZpZWQga2V5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0Q3VzdG9tQml0bWFwXG4gICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5IC0gVGhlIGtleSBmb3IgdGhlIGJpdG1hcCB0byBzZXQuXG4gICAgKiBAcGFyYW0ge2dzLkJpdG1hcH0gYml0bWFwIC0gVGhlIGJpdG1hcCB0byBzZXQuXG4gICAgIyMjXG4gICAgc2V0Q3VzdG9tQml0bWFwOiAoa2V5LCBiaXRtYXApIC0+XG4gICAgICAgIEBjdXN0b21CaXRtYXBzQnlLZXlba2V5XSA9IGJpdG1hcFxuICAgICAgICBpZiBub3QgYml0bWFwLmxvYWRlZD9cbiAgICAgICAgICAgIEByZXNvdXJjZXMucHVzaChiaXRtYXApXG4gICAgICAgICAgICBAcmVzb3VyY2VzTG9hZGVkID0gZmFsc2VcblxuICAgICMjIypcbiAgICAqIEFkZHMgYSBjdXN0b20gY3JlYXRlZCBiaXRtYXAgdG8gdGhlIHJlc291cmNlIG1hbmFnZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBhZGRDdXN0b21CaXRtYXBcbiAgICAqIEBwYXJhbSB7Z3MuQml0bWFwfSBiaXRtYXAgLSBUaGUgYml0bWFwIHRvIGFkZC5cbiAgICAjIyNcbiAgICBhZGRDdXN0b21CaXRtYXA6IChiaXRtYXApIC0+XG4gICAgICAgIEBjb250ZXh0LnJlc291cmNlcy5wdXNoKG5hbWU6IFwiXCIsIGRhdGE6IGJpdG1hcClcblxuICAgICMjIypcbiAgICAqIEdldHMgYSBMaXZlMkQgbW9kZWwuXG4gICAgKlxuICAgICogQG1ldGhvZCBnZXRMaXZlMkRNb2RlbFxuICAgICogQHBhcmFtIHtTdHJpbmd9IGZpbGVQYXRoIC0gUGF0aCB0byB0aGUgTGl2ZTJEIG1vZGVsIGZpbGUuXG4gICAgKiBAcmV0dXJuIHtncy5MaXZlMkRNb2RlbH0gVGhlIExpdmUyRCBtb2RlbCBvciA8Yj5udWxsPC9iPiBpZiBubyBtb2RlbCBleGlzdHMgYXQgdGhlIHNwZWNpZmllZCBmaWxlIHBhdGguXG4gICAgIyMjXG4gICAgZ2V0TGl2ZTJETW9kZWw6IChmaWxlUGF0aCkgLT5cbiAgICAgICAgcmVzdWx0ID0gQHJlc291cmNlc0J5UGF0aFtmaWxlUGF0aF1cblxuICAgICAgICBpZiBub3QgcmVzdWx0PyBvciByZXN1bHQuZGlzcG9zZWRcbiAgICAgICAgICAgIHByb2ZpbGUgPSBMYW5ndWFnZU1hbmFnZXIucHJvZmlsZVxuICAgICAgICAgICAgcmVzdWx0ID0gZ3MuTGl2ZTJETW9kZWwuY3JlYXRlKGZpbGVQYXRoLCAoaWYgcHJvZmlsZT8gYW5kIHByb2ZpbGUuaXRlbXM/IHRoZW4gcHJvZmlsZS5pdGVtcy5jb2RlIGVsc2UgbnVsbCkpXG4gICAgICAgICAgICBAcmVzb3VyY2VzQnlQYXRoW2ZpbGVQYXRoXSA9IHJlc3VsdFxuICAgICAgICAgICAgQHJlc291cmNlcy5wdXNoKHJlc3VsdClcbiAgICAgICAgICAgIEByZXNvdXJjZXNMb2FkZWQgPSBmYWxzZVxuICAgICAgICAgICAgQGNvbnRleHQucmVzb3VyY2VzLnB1c2gobmFtZTogZmlsZVBhdGgsIGRhdGE6IHJlc3VsdClcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIGEgZm9udC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGdldEZvbnRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGZvbnQgdG8gZ2V0LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgLSBUaGUgc2l6ZSBvZiB0aGUgZm9udCB0byBnZXQuXG4gICAgKiBAcmV0dXJuIHtncy5Gb250fSBUaGUgZm9udCBvciA8Yj5udWxsPC9iPiBpZiBubyBmb250IHdpdGggdGhlIHNwZWNpZmllZCBuYW1lIGV4aXN0cy5cbiAgICAjIyNcbiAgICBnZXRGb250OiAobmFtZSwgc2l6ZSkgLT5cbiAgICAgICAgcmVzdWx0ID0gbmV3IEZvbnQobmFtZSwgc2l6ZSlcblxuICAgICAgICBAcmVzb3VyY2VzLnB1c2gocmVzdWx0KVxuICAgICAgICBAcmVzb3VyY2VzTG9hZGVkID0gZmFsc2VcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIGEgdmlkZW8uXG4gICAgKlxuICAgICogQG1ldGhvZCBnZXRWaWRlb1xuICAgICogQHBhcmFtIHtTdHJpbmd9IGZpbGVQYXRoIC0gUGF0aCB0byB0aGUgdmlkZW8gZmlsZS5cbiAgICAqIEByZXR1cm4ge2dzLlZpZGVvfSBUaGUgdmlkZW8gb3IgPGI+bnVsbDwvYj4gaWYgbm8gdmlkZW8gZXhpc3RzIGF0IHRoZSBzcGVjaWZpZWQgZmlsZSBwYXRoLlxuICAgICMjI1xuICAgIGdldFZpZGVvOiAoZmlsZVBhdGgpIC0+XG4gICAgICAgIGlmIGZpbGVQYXRoLmVuZHNXaXRoKFwiL1wiKSB0aGVuIHJldHVybiBudWxsXG5cbiAgICAgICAgcmVzdWx0ID0gQHJlc291cmNlc0J5UGF0aFtmaWxlUGF0aF1cblxuICAgICAgICBpZiBub3QgcmVzdWx0PyBvciByZXN1bHQuZGlzcG9zZWRcbiAgICAgICAgICAgIHByb2ZpbGUgPSBMYW5ndWFnZU1hbmFnZXIucHJvZmlsZVxuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IGdzLlZpZGVvKGZpbGVQYXRoLCAoaWYgcHJvZmlsZT8gYW5kIHByb2ZpbGUuaXRlbXM/IHRoZW4gcHJvZmlsZS5pdGVtcy5jb2RlIGVsc2UgbnVsbCkpXG4gICAgICAgICAgICBAcmVzb3VyY2VzQnlQYXRoW2ZpbGVQYXRoXSA9IHJlc3VsdFxuICAgICAgICAgICAgQHJlc291cmNlcy5wdXNoKHJlc3VsdClcbiAgICAgICAgICAgIEByZXNvdXJjZXNMb2FkZWQgPSBmYWxzZVxuICAgICAgICAgICAgQGNvbnRleHQucmVzb3VyY2VzLnB1c2gobmFtZTogZmlsZVBhdGgsIGRhdGE6IHJlc3VsdClcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSBjb3JyZWN0IGZpbGUgcGF0aCBmb3IgdGhlIHNwZWNpZmllZCByZXNvdXJjZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGdldFBhdGhcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSByZXNvdXJjZSAtIFRoZSByZXNvdXJjZSBvYmplY3Qgd2hpY2ggaXMgdXN1YWxseSBzdG9yZWQgaW5zaWRlIGEgY29tbWFuZCdzIHBhcmFtcyBvciBpbiBkYXRhIHJlY29yZHMuXG4gICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBjb3JyZWN0IGZpbGUgcGF0aCBmb3IgdGhlIHNwZWNpZmllZCByZXNvdXJjZS5cbiAgICAjIyNcbiAgICBnZXRQYXRoOiAocmVzb3VyY2UpIC0+IGlmIHJlc291cmNlPyB0aGVuIFwiI3tyZXNvdXJjZS5mb2xkZXJQYXRofS8je3Jlc291cmNlLm5hbWV9XCIgZWxzZSBcIlwiXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIGEgYml0bWFwLlxuICAgICpcbiAgICAqIEBtZXRob2QgZ2V0Qml0bWFwXG4gICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpbGVQYXRoIC0gUGF0aCB0byB0aGUgYml0bWFwIGZpbGUgT1IgYSBncmFwaGljIGluZm8gb2JqZWN0LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGh1ZSAtIFRoZSBiaXRtYXAncyBodWUuIFRoZSBiaXRtYXAgd2lsbCBiZSBsb2FkZWQgYW5kIHRoZW4gcmVjb2xvcmVkLlxuICAgICogQHJldHVybiB7Z3MuQml0bWFwfSBUaGUgYml0bWFwIG9yIDxiPm51bGw8L2I+IGlmIG5vIGJpdG1hcCBleGlzdHMgYXQgdGhlIHNwZWNpZmllZCBmaWxlIHBhdGguXG4gICAgIyMjXG4gICAgZ2V0Qml0bWFwOiAoZmlsZVBhdGgsIGh1ZSkgLT5cbiAgICAgICAgaWYgZmlsZVBhdGguZW5kc1dpdGgoXCIvXCIpIHRoZW4gcmV0dXJuIG51bGxcblxuICAgICAgICBodWUgPSBodWUgfHwgMFxuICAgICAgICByZXN1bHQgPSBAcmVzb3VyY2VzQnlQYXRoW2ZpbGVQYXRoXSB8fCBAY3VzdG9tQml0bWFwc0J5S2V5W2ZpbGVQYXRoXVxuXG4gICAgICAgIGlmIG5vdCByZXN1bHQ/XG4gICAgICAgICAgICBwcm9maWxlID0gTGFuZ3VhZ2VNYW5hZ2VyLnByb2ZpbGVcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBCaXRtYXAoZmlsZVBhdGgsIChpZiBwcm9maWxlPyBhbmQgcHJvZmlsZS5pdGVtcz8gdGhlbiBwcm9maWxlLml0ZW1zLmNvZGUgZWxzZSBudWxsKSwgbm8pXG4gICAgICAgICAgICByZXN1bHQuaHVlID0gaHVlXG4gICAgICAgICAgICByZXN1bHQuZmlsZVBhdGggPSBmaWxlUGF0aFxuICAgICAgICAgICAgQHJlc291cmNlc0J5UGF0aFtmaWxlUGF0aF0gPSByZXN1bHRcbiAgICAgICAgICAgIEByZXNvdXJjZXMucHVzaChyZXN1bHQpXG4gICAgICAgICAgICBAcmVzb3VyY2VzTG9hZGVkID0gZmFsc2VcbiAgICAgICAgICAgIEBjb250ZXh0LnJlc291cmNlcy5wdXNoKG5hbWU6IGZpbGVQYXRoLCBkYXRhOiByZXN1bHQpXG4gICAgICAgIGVsc2UgaWYgbm90IHJlc3VsdC5sb2FkZWQgYW5kIHJlc3VsdC5odWUgIT0gaHVlXG4gICAgICAgICAgICBwcm9maWxlID0gTGFuZ3VhZ2VNYW5hZ2VyLnByb2ZpbGVcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBCaXRtYXAoZmlsZVBhdGgsIChpZiBwcm9maWxlPyBhbmQgcHJvZmlsZS5pdGVtcz8gdGhlbiBwcm9maWxlLml0ZW1zLmNvZGUgZWxzZSBudWxsKSlcbiAgICAgICAgICAgIHJlc3VsdC5odWUgPSBodWVcbiAgICAgICAgICAgIHJlc3VsdC5maWxlUGF0aCA9IGZpbGVQYXRoXG4gICAgICAgICAgICBAcmVzb3VyY2VzLnB1c2gocmVzdWx0KVxuICAgICAgICAgICAgQHJlc291cmNlc0xvYWRlZCA9IGZhbHNlXG4gICAgICAgIGVsc2UgaWYgaHVlID4gMFxuICAgICAgICAgICAgaHVlQml0bWFwID0gQHJlc291cmNlc0J5UGF0aEh1ZVtmaWxlUGF0aCtcIkBcIitodWVdXG4gICAgICAgICAgICBpZiBub3QgaHVlQml0bWFwPyBhbmQgcmVzdWx0LmxvYWRlZFxuICAgICAgICAgICAgICAgIGh1ZUJpdG1hcCA9IG5ldyBCaXRtYXAocmVzdWx0LmltYWdlKVxuICAgICAgICAgICAgICAgIGh1ZUJpdG1hcC5jaGFuZ2VIdWUoaHVlKVxuICAgICAgICAgICAgICAgIEByZXNvdXJjZXNCeVBhdGhIdWVbZmlsZVBhdGgrXCJAXCIraHVlXSA9IGh1ZUJpdG1hcFxuICAgICAgICAgICAgaWYgaHVlQml0bWFwPyB0aGVuIHJlc3VsdCA9IGh1ZUJpdG1hcFxuXG4gICAgICAgIHJldHVybiByZXN1bHRcblxuICAgICMjIypcbiAgICAqIEdldHMgYW4gSFRNTCBpbWFnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGdldEltYWdlXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZVBhdGggLSBQYXRoIHRvIHRoZSBpbWFnZSBmaWxlLlxuICAgICogQHJldHVybiB7SFRNTEltYWdlRWxlbWVudH0gVGhlIGltYWdlIG9yIDxiPm51bGw8L2I+IGlmIG5vIGltYWdlIGV4aXN0cyBhdCB0aGUgc3BlY2lmaWVkIGZpbGUgcGF0aC5cbiAgICAjIyNcbiAgICBnZXRJbWFnZTogKGZpbGVQYXRoKSAtPlxuICAgICAgICByZXN1bHQgPSBAcmVzb3VyY2VzQnlQYXRoW2ZpbGVQYXRoXVxuXG4gICAgICAgIGlmIG5vdCByZXN1bHQ/XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQml0bWFwKFwicmVzb3VyY2VzLyN7ZmlsZVBhdGh9LnBuZ1wiKTtcblxuICAgICAgICAgICAgQHJlc291cmNlc0J5UGF0aFtmaWxlUGF0aF0gPSByZXN1bHRcbiAgICAgICAgICAgIEByZXNvdXJjZXMucHVzaChyZXN1bHQpXG4gICAgICAgICAgICBAcmVzb3VyY2VzTG9hZGVkID0gZmFsc2VcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIGFuIGF1ZGlvIHN0cmVhbS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGdldEF1ZGlvU3RyZWFtXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZVBhdGggLSBQYXRoIHRvIHRoZSBhdWRpbyBmaWxlLlxuICAgICogQHJldHVybiB7Z3MuQXVkaW9CdWZmZXJ9IFRoZSBhdWRpbyBidWZmZXIgb3IgPGI+bnVsbDwvYj4gaWYgbm8gYXVkaW8gZmlsZSBleGlzdHMgYXQgdGhlIHNwZWNpZmllZCBmaWxlIHBhdGguXG4gICAgIyMjXG4gICAgZ2V0QXVkaW9TdHJlYW06IChmaWxlUGF0aCkgLT5cbiAgICAgICAgcmVzdWx0ID0gQHJlc291cmNlc0J5UGF0aFtmaWxlUGF0aF1cbiAgICAgICAgcHJvZmlsZSA9IExhbmd1YWdlTWFuYWdlci5wcm9maWxlXG4gICAgICAgIGxhbmd1YWdlQ29kZSA9IGlmIHByb2ZpbGU/IGFuZCBwcm9maWxlLml0ZW1zPyB0aGVuIHByb2ZpbGUuaXRlbXMuY29kZSBlbHNlIG51bGxcblxuICAgICAgICBpZiBub3QgcmVzdWx0P1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEdTLkF1ZGlvQnVmZmVyKGZpbGVQYXRoKVxuXG4gICAgICAgICAgICBAcmVzb3VyY2VzQnlQYXRoW2ZpbGVQYXRoXSA9IHJlc3VsdFxuICAgICAgICAgICAgQHJlc291cmNlcy5wdXNoKHJlc3VsdClcbiAgICAgICAgICAgIEByZXNvdXJjZXNMb2FkZWQgPSBmYWxzZVxuXG4gICAgICAgICAgICBAY29udGV4dC5yZXNvdXJjZXMucHVzaChuYW1lOiBmaWxlUGF0aCwgZGF0YTogcmVzdWx0KVxuXG5cblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIGFuIGF1ZGlvIGJ1ZmZlci4gVGhlIGF1ZGlvIGRhdGEgaXMgZnVsbHkgbG9hZGVkIGFuZCBkZWNvZGVkIGluIG1lbW9yeS4gSXQgaXMgcmVjb21tZW5lZGVkXG4gICAgKiBmb3Igc291bmQgZWZmZWN0cyBidXQgZm9yIGEgbG9uZyBiYWNrZ3JvdW5kIG11c2ljLCA8Yj5nZXRBdWRpb1N0cmVhbTwvYj4gc2hvdWxkIGJlIHVzZWQgaW5zdGVhZC4gVGhhdCBpcyBlc3BlY2lhbGx5XG4gICAgKiB0aGUgY2FzZSBvbiBtb2JpbGUgZGV2aWNlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGdldEF1ZGlvQnVmZmVyXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZVBhdGggLSBQYXRoIHRvIHRoZSBhdWRpbyBmaWxlLlxuICAgICogQHJldHVybiB7Z3MuQXVkaW9CdWZmZXJ9IFRoZSBhdWRpbyBidWZmZXIgb3IgPGI+bnVsbDwvYj4gaWYgbm8gYXVkaW8gZmlsZSBleGlzdHMgYXQgdGhlIHNwZWNpZmllZCBmaWxlIHBhdGguXG4gICAgIyMjXG4gICAgZ2V0QXVkaW9CdWZmZXI6IChmaWxlUGF0aCkgLT5cbiAgICAgICAgcmVzdWx0ID0gQHJlc291cmNlc0J5UGF0aFtmaWxlUGF0aF1cbiAgICAgICAgcHJvZmlsZSA9IExhbmd1YWdlTWFuYWdlci5wcm9maWxlXG4gICAgICAgIGxhbmd1YWdlQ29kZSA9IGlmIHByb2ZpbGU/IGFuZCBwcm9maWxlLml0ZW1zPyB0aGVuIHByb2ZpbGUuaXRlbXMuY29kZSBlbHNlIG51bGxcblxuICAgICAgICBpZiBub3QgcmVzdWx0P1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IEdTLkF1ZGlvQnVmZmVyKGZpbGVQYXRoKVxuXG4gICAgICAgICAgICBAcmVzb3VyY2VzQnlQYXRoW2ZpbGVQYXRoXSA9IHJlc3VsdFxuICAgICAgICAgICAgQHJlc291cmNlcy5wdXNoKHJlc3VsdClcbiAgICAgICAgICAgIEByZXNvdXJjZXNMb2FkZWQgPSBmYWxzZVxuXG4gICAgICAgICAgICBAY29udGV4dC5yZXNvdXJjZXMucHVzaChuYW1lOiBmaWxlUGF0aCwgZGF0YTogcmVzdWx0KVxuXG4gICAgICAgIHJldHVybiByZXN1bHRcblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGxvYWRpbmcgcHJvY2Vzcy4gTmVlZHMgdG8gYmUgY2FsbGVkIG9uY2UgcGVyIGZyYW1lIHRvIGtlZXBcbiAgICAqIHRoZSBSZXNvdXJjZU1hbmFnZXIgdXAgdG8gZGF0ZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgaWYgbm90IEBldmVudHM/IHRoZW4gQGV2ZW50cyA9IG5ldyBncy5FdmVudEVtaXR0ZXIoKVxuICAgICAgICBpZiBub3QgQHJlc291cmNlc0xvYWRlZFxuICAgICAgICAgICAgQHJlc291cmNlc0xvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIGZvciBpIGluIFswLi4uQHJlc291cmNlcy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgaWYgbm90IEByZXNvdXJjZXNbaV0ubG9hZGVkXG4gICAgICAgICAgICAgICAgICAgIEByZXNvdXJjZXNMb2FkZWQgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHJlc291cmNlc1tpXS5odWU/IGFuZCBAcmVzb3VyY2VzW2ldLmh1ZSA+IDBcbiAgICAgICAgICAgICAgICAgICAgYml0bWFwID0gbmV3IEJpdG1hcChAcmVzb3VyY2VzW2ldLmltYWdlKVxuXG4gICAgICAgICAgICAgICAgICAgIEByZXNvdXJjZXNCeVBhdGhbQHJlc291cmNlc1tpXS5maWxlUGF0aF0gPSBiaXRtYXBcbiAgICAgICAgICAgICAgICAgICAgQHJlc291cmNlc1tpXS5jaGFuZ2VIdWUoQHJlc291cmNlc1tpXS5odWUpXG4gICAgICAgICAgICAgICAgICAgIEByZXNvdXJjZXNCeVBhdGhIdWVbQHJlc291cmNlc1tpXS5maWxlUGF0aCtcIkBcIitAcmVzb3VyY2VzW2ldLmh1ZV0gPSBAcmVzb3VyY2VzW2ldXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAcmVzb3VyY2VzW2ldLmZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAcmVzb3VyY2VzW2ldLmh1ZVxuICAgICAgICAgICAgaWYgQHJlc291cmNlc0xvYWRlZFxuICAgICAgICAgICAgICAgIEBldmVudHMuZW1pdChcImxvYWRlZFwiLCB0aGlzKVxuXG4gICAgICAgIHJldHVybiBudWxsXG5cbndpbmRvdy5SZXNvdXJjZU1hbmFnZXIgPSBSZXNvdXJjZU1hbmFnZXJcbmdzLlJlc291cmNlTWFuYWdlciA9IFJlc291cmNlTWFuYWdlciJdfQ==
//# sourceURL=ResourceManager_60.js