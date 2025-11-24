var GameManager;

GameManager = (function() {

  /**
  * Manages all general things around the game like holding the game settings,
  * manages the save/load of a game, etc.
  *
  * @module gs
  * @class GameManager
  * @memberof gs
  * @constructor
   */
  function GameManager() {

    /**
    * The current scene data.
    * @property sceneData
    * @type Object
     */
    this.sceneData = {};

    /**
    * The scene viewport containing all visual objects which are part of the scene and influenced
    * by the in-game camera.
    * @property sceneViewport
    * @type gs.Object_Viewport
     */
    this.sceneViewport = null;

    /**
    * The list of common events.
    * @property commonEvents
    * @type gs.Object_CommonEvent[]
     */
    this.commonEvents = [];

    /**
    * Indicates if the GameManager is initialized.
    * @property commonEvents
    * @type gs.Object_CommonEvent[]
     */
    this.initialized = false;

    /**
    * Temporary game settings.
    * @property tempSettings
    * @type Object
     */
    this.tempSettings = {
      skip: false,
      skipTime: 5,
      loadMenuAccess: true,
      menuAccess: true,
      backlogAccess: true,
      saveMenuAccess: true,
      messageFading: {
        animation: {
          type: 1
        },
        duration: 15,
        easing: null
      }

      /**
      * Temporary game fields.
      * @property tempFields
      * @type Object
       */
    };
    this.tempFields = null;

    /**
    * Stores default values for backgrounds, pictures, etc.
    * @property defaults
    * @type Object
     */
    this.defaults = {
      background: {
        "duration": 30,
        "origin": 0,
        "zOrder": 0,
        "loopVertical": 0,
        "loopHorizontal": 0,
        "easing": {
          "type": 0,
          "inOut": 1
        },
        "animation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "motionBlur": {
          "enabled": 0,
          "delay": 2,
          "opacity": 100,
          "dissolveSpeed": 3
        }
      },
      picture: {
        "appearDuration": 30,
        "disappearDuration": 30,
        "origin": 1,
        "zOrder": 0,
        "appearEasing": {
          "type": 0,
          "inOut": 1
        },
        "disappearEasing": {
          "type": 0,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "motionBlur": {
          "enabled": 0,
          "delay": 2,
          "opacity": 100,
          "dissolveSpeed": 3
        }
      },
      character: {
        "expressionDuration": 0,
        "appearDuration": 40,
        "disappearDuration": 40,
        "origin": 1,
        "zOrder": 0,
        "appearEasing": {
          "type": 2,
          "inOut": 2
        },
        "disappearEasing": {
          "type": 1,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "motionBlur": {
          "enabled": 0,
          "delay": 2,
          "opacity": 100,
          "dissolveSpeed": 3
        },
        "changeAnimation": {
          "type": 1,
          "movement": 0,
          "fading": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "changeEasing": {
          "type": 2,
          "inOut": 2
        }
      },
      text: {
        "appearDuration": 30,
        "disappearDuration": 30,
        "positionOrigin": 0,
        "origin": 0,
        "zOrder": 0,
        "appearEasing": {
          "type": 0,
          "inOut": 1
        },
        "disappearEasing": {
          "type": 0,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "motionBlur": {
          "enabled": 0,
          "delay": 2,
          "opacity": 100,
          "dissolveSpeed": 3
        }
      },
      video: {
        "appearDuration": 30,
        "disappearDuration": 30,
        "origin": 0,
        "zOrder": 0,
        "appearEasing": {
          "type": 0,
          "inOut": 1
        },
        "disappearEasing": {
          "type": 0,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "motionBlur": {
          "enabled": 0,
          "delay": 2,
          "opacity": 100,
          "dissolveSpeed": 3
        }
      },
      live2d: {
        "motionFadeInTime": 1000,
        "appearDuration": 30,
        "disappearDuration": 30,
        "zOrder": 0,
        "appearEasing": {
          "type": 0,
          "inOut": 1
        },
        "disappearEasing": {
          "type": 0,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 1,
          "movement": 0,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        }
      },
      messageBox: {
        "appearDuration": 30,
        "disappearDuration": 30,
        "zOrder": 0,
        "appearEasing": {
          "type": 0,
          "inOut": 1
        },
        "disappearEasing": {
          "type": 0,
          "inOut": 1
        },
        "appearAnimation": {
          "type": 0,
          "movement": 3,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        },
        "disappearAnimation": {
          "type": 0,
          "movement": 3,
          "mask": {
            "graphic": null,
            "vague": 30
          }
        }
      },
      audio: {
        "musicFadeInDuration": 0,
        "musicFadeOutDuration": 0,
        "musicVolume": 100,
        "musicPlaybackRate": 100,
        "soundVolume": 100,
        "soundPlaybackRate": 100,
        "voiceVolume": 100,
        "voicePlaybackRate": 100
      }
    };

    /**
    * The game's backlog.
    * @property backlog
    * @type Object[]
     */
    this.backlog = [];

    /**
    * Character parameters by character ID.
    * @property characterParams
    * @type Object[]
     */
    this.characterParams = {};

    /**
    * The game's chapter
    * @property chapters
    * @type gs.Document[]
     */
    this.chapters = [];

    /**
    * The game's current displayed messages. Especially in NVL mode the messages
    * of the current page are stored here.
    * @property messages
    * @type Object[]
     */
    this.messages = [];

    /**
    * Count of save slots. Default is 100.
    * @property saveSlotCount
    * @type number
     */
    this.saveSlotCount = 100;

    /**
    * The index of save games. Contains the header-info for each save game slot.
    * @property saveGameSlots
    * @type Object[]
     */
    this.saveGameSlots = [];

    /**
    * Stores global data like the state of persistent game variables.
    * @property globalData
    * @type Object
     */
    this.globalData = null;

    /**
    * Indicates if the game runs in editor's live-preview.
    * @property inLivePreview
    * @type Object
     */
    this.inLivePreview = false;
  }


  /**
  * Initializes the GameManager, should be called before the actual game starts.
  *
  * @method initialize
   */

  GameManager.prototype.initialize = function() {
    var character, i, j, k, l, len, len1, param, ref, ref1, ref2, ref3, ref4, ref5, ref6;
    this.initialized = true;
    this.inLivePreview = $PARAMS.preview != null;
    this.saveSlotCount = RecordManager.system.saveSlotCount || 100;
    this.tempFields = new gs.GameTemp();
    window.$tempFields = this.tempFields;
    this.createSaveGameIndex();
    this.variableStore = new gs.VariableStore();
    DataManager.getDocumentsByType("persistent_variables");
    this.variableStore.setupDomains(DataManager.getDocumentsByType("global_variables").select(function(v) {
      return v.items.domain || "";
    }));
    this.variableStore.persistentNumbersByDomain = (ref = this.globalData.persistentNumbers) != null ? ref : this.variableStore.persistentNumbersByDomain;
    this.variableStore.persistentBooleansByDomain = (ref1 = this.globalData.persistentBooleans) != null ? ref1 : this.variableStore.persistentBooleansByDomain;
    this.variableStore.persistentStringsByDomain = (ref2 = this.globalData.persistentStrings) != null ? ref2 : this.variableStore.persistentStringsByDomain;
    this.variableStore.persistentListsByDomain = (ref3 = this.globalData.persistentLists) != null ? ref3 : this.variableStore.persistentListsByDomain;
    this.sceneViewport = new gs.Object_Viewport(new Viewport(0, 0, Graphics.width, Graphics.height, Graphics.viewport));
    ref4 = RecordManager.charactersArray;
    for (j = 0, len = ref4.length; j < len; j++) {
      character = ref4[j];
      if (character != null) {
        this.characterParams[character.index] = {};
        if (character.params != null) {
          ref5 = character.params;
          for (k = 0, len1 = ref5.length; k < len1; k++) {
            param = ref5[k];
            this.characterParams[character.index][param.name] = param.value;
          }
        }
      }
    }
    this.setupCommonEvents();
    for (i = l = 0, ref6 = RecordManager.characters; 0 <= ref6 ? l < ref6 : l > ref6; i = 0 <= ref6 ? ++l : --l) {
      this.settings.voicesPerCharacter[i] = 100;
    }
    this.chapters = DataManager.getDocumentsByType("vn.chapter");
    return this.chapters.sort(function(a, b) {
      if (a.items.order > b.items.order) {
        return 1;
      } else if (a.items.order < b.items.order) {
        return -1;
      } else {
        return 0;
      }
    });
  };


  /**
  * Sets up common events.
  *
  * @method setupCommonEvents
   */

  GameManager.prototype.setupCommonEvents = function() {
    var event, j, k, len, len1, object, ref, ref1, results;
    ref = this.commonEvents;
    for (j = 0, len = ref.length; j < len; j++) {
      event = ref[j];
      if (event != null) {
        event.dispose();
      }
    }
    this.commonEvents = [];
    ref1 = RecordManager.commonEvents;
    results = [];
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      event = ref1[k];
      object = new gs.Object_CommonEvent();
      object.record = Object.deepCopy(event);
      object.rid = event.index;
      this.commonEvents[event.index] = object;
      results.push(this.commonEvents.push(object));
    }
    return results;
  };


  /**
  * Preloads resources for common events with auto-preload option enabled.
  *
  * @method preloadCommonEvents
   */

  GameManager.prototype.preloadCommonEvents = function() {
    var event, j, len, ref, results;
    ref = RecordManager.commonEvents;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      event = ref[j];
      if (!event) {
        continue;
      }
      if (event.startCondition === 1 && event.autoPreload) {
        results.push(gs.ResourceLoader.loadEventCommandsGraphics(event.commands));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up cursor depending on system settings.
  *
  * @method setupCursor
   */

  GameManager.prototype.setupCursor = function() {
    var bitmap, ref;
    if ((ref = RecordManager.system.cursor) != null ? ref.name : void 0) {
      bitmap = ResourceManager.getBitmap(ResourceManager.getPath(RecordManager.system.cursor));
      return Graphics.setCursorBitmap(bitmap, RecordManager.system.cursor.hx, RecordManager.system.cursor.hy);
    } else {
      return Graphics.setCursorBitmap(null);
    }
  };


  /**
  * Disposes the GameManager. Should be called before quit the game.
  *
  * @method dispose
   */

  GameManager.prototype.dispose = function() {};


  /**
  * Quits the game. The implementation depends on the platform. So for example on mobile
  * devices this method has no effect.
  *
  * @method exit
   */

  GameManager.prototype.exit = function() {
    return Application.exit();
  };


  /**
  * Resets the GameManager by disposing and re-initializing it.
  *
  * @method reset
   */

  GameManager.prototype.reset = function() {
    this.initialized = false;
    this.interpreter = null;
    this.dispose();
    return this.initialize();
  };


  /**
  * Starts a new game.
  *
  * @method newGame
   */

  GameManager.prototype.newGame = function() {
    var ref;
    this.messages = [];
    this.variableStore.clearAllGlobalVariables();
    this.variableStore.clearAllLocalVariables();
    this.tempSettings.skip = false;
    this.tempFields.clear();
    this.tempFields.inGame = true;
    this.setupCommonEvents();
    this.tempSettings.menuAccess = true;
    this.tempSettings.saveMenuAccess = true;
    this.tempSettings.loadMenuAccess = true;
    this.tempSettings.backlogAccess = true;
    return (ref = gs.ObjectManager.current) != null ? ref.inputSession = 0 : void 0;
  };


  /**
  * Exists the game and resets the GameManager which is important before going back to
  * the main menu or title screen.
  *
  * @method exitGame
   */

  GameManager.prototype.exitGame = function() {
    this.tempFields.inGame = false;
    return this.tempFields.isExitingGame = true;
  };


  /**
  * Updates the GameManager. Should be called once per frame.
  *
  * @method update
   */

  GameManager.prototype.update = function() {};


  /**
  * Creates the index of all save-games. Should be called whenever a new save game
  * is created.
  *
  * @method createSaveGameIndex
  * @protected
   */

  GameManager.prototype.createSaveGameIndex = function() {
    var chaper, chapter, header, i, image, j, ref, scene;
    this.saveGameSlots = [];
    for (i = j = 0, ref = this.saveSlotCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (GameStorage.exists("SaveGame_" + i + "_Header")) {
        header = GameStorage.getObject("SaveGame_" + i + "_Header");
        chapter = DataManager.getDocument(header.chapterUid);
        scene = DataManager.getDocumentSummary(header.sceneUid);
        image = header.image;
      } else {
        header = null;
        chaper = null;
        scene = null;
      }
      if ((chapter != null) && (scene != null) && !this.inLivePreview) {
        this.saveGameSlots.push({
          date: header.date,
          chapter: chapter.items.name || "DELETED",
          scene: scene.items.name || "DELETED",
          image: image
        });
      } else {
        this.saveGameSlots.push({
          "date": "",
          "chapter": "",
          "scene": "",
          "image": null
        });
      }
    }
    return this.saveGameSlots;
  };


  /**
  * Resets the game's settings to its default values.
  *
  * @method resetSettings
   */

  GameManager.prototype.resetSettings = function() {
    var i, j, ref;
    this.settings = {
      version: 342,
      renderer: 0,
      filter: 1,
      confirmation: true,
      adjustAspectRatio: false,
      allowSkip: true,
      allowSkipUnreadMessages: true,
      allowVideoSkip: true,
      skipVoiceOnAction: true,
      allowChoiceSkip: false,
      voicesByCharacter: [],
      timeMessageToVoice: true,
      "autoMessage": {
        enabled: false,
        time: 0,
        waitForVoice: true,
        stopOnAction: false
      },
      "voiceEnabled": true,
      "bgmEnabled": true,
      "soundEnabled": true,
      "voiceVolume": 100,
      "bgmVolume": 100,
      "seVolume": 100,
      "messageSpeed": 4,
      "fullScreen": false,
      "aspectRatio": 0
    };
    this.saveGameSlots = [];
    for (i = j = 0, ref = this.saveSlotCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      GameStorage.remove("SaveGame_" + i + "_Header");
      GameStorage.remove("SaveGame_" + i);
      this.saveGameSlots.push({
        "date": "",
        "chapter": "",
        "scene": "",
        "thumb": ""
      });
    }
    return GameStorage.setObject("settings", this.settings);
  };


  /**
  * Saves current game settings.
  *
  * @method saveSettings
   */

  GameManager.prototype.saveSettings = function() {
    return GameStorage.setObject("settings", this.settings);
  };


  /**
  * Saves current global data.
  *
  * @method saveGlobalData
   */

  GameManager.prototype.saveGlobalData = function() {
    this.globalData.persistentNumbers = this.variableStore.persistentNumbersByDomain;
    this.globalData.persistentLists = this.variableStore.persistentListsByDomain;
    this.globalData.persistentBooleans = this.variableStore.persistentBooleansByDomain;
    this.globalData.persistentStrings = this.variableStore.persistentStringsByDomain;
    return GameStorage.setObject("globalData", this.globalData);
  };


  /**
  * Resets current global data. All stored data about read messages, persistent variables and
  * CG gallery will be deleted.
  *
  * @method resetGlobalData
   */

  GameManager.prototype.resetGlobalData = function() {
    var cg, data, i, j, len, ref, ref1, version;
    version = (ref = this.globalData) != null ? ref.version : void 0;
    data = this.globalData;
    this.globalData = {
      messages: {},
      cgGallery: {},
      version: 342,
      persistentNumbers: {
        "0": [],
        "com.degica.vnm.default": []
      },
      persistentStrings: {
        "0": [],
        "com.degica.vnm.default": []
      },
      persistentBooleans: {
        "0": [],
        "com.degica.vnm.default": []
      },
      persistentLists: {
        "0": [],
        "com.degica.vnm.default": []
      }
    };
    ref1 = RecordManager.cgGalleryArray;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      cg = ref1[i];
      if (cg != null) {
        this.globalData.cgGallery[cg.index] = {
          unlocked: false
        };
      }
    }
    GameStorage.setObject("globalData", this.globalData);
    return this.migrateGlobalData(data, version + 1, this.globalData.version);
  };

  GameManager.prototype.migrateGlobalData = function(data, from, to) {
    var i, j, ref, ref1, results;
    results = [];
    for (i = j = ref = from, ref1 = to; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
      if (this["migrateGlobalData" + i] != null) {
        results.push(this["migrateGlobalData" + i](data));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  GameManager.prototype.migrateGlobalData342 = function(data) {
    if (data != null) {
      this.globalData.persistentNumbers[0] = data.persistentNumbers[0] || [];
      this.globalData.persistentStrings[0] = data.persistentStrings[0] || [];
      this.globalData.persistentBooleans[0] = data.persistentBooleans[0] || [];
      this.globalData.persistentLists[0] = data.persistentLists[0] || [];
      this.globalData.persistentNumbers["com.degica.vnm.default"] = data.persistentNumbers[0] || [];
      this.globalData.persistentStrings["com.degica.vnm.default"] = data.persistentStrings[0] || [];
      this.globalData.persistentBooleans["com.degica.vnm.default"] = data.persistentBooleans[0] || [];
      return this.globalData.persistentLists["com.degica.vnm.default"] = data.persistentLists[0] || [];
    }
  };

  GameManager.prototype.readSaveGame = function(saveGame) {};

  GameManager.prototype.writeSaveGame = function(saveGame) {};

  GameManager.prototype.prepareSaveGame = function(snapshot) {
    var context, messageBoxIds, messageBoxes, messageIds, messages, ref, ref1, saveGame, sceneData;
    if (snapshot) {
      snapshot = ResourceManager.getCustomBitmap("$snapshot");
      if (snapshot != null) {
        snapshot.dispose();
      }
      ResourceManager.setCustomBitmap("$snapshot", Graphics.snapshot());
    }
    context = new gs.ObjectCodecContext();
    context.decodedObjectStore.push(Graphics.viewport);
    context.decodedObjectStore.push(this.scene);
    context.decodedObjectStore.push(this.scene.behavior);
    messageBoxIds = ["messageBox", "nvlMessageBox", "messageMenu"];
    messageIds = ["gameMessage_message", "nvlGameMessage_message"];
    messageBoxes = messageBoxIds.select((function(_this) {
      return function(id) {
        return _this.scene.behavior.objectManager.objectById(id);
      };
    })(this));
    messages = messageIds.select((function(_this) {
      return function(id) {
        return _this.scene.behavior.objectManager.objectById(id);
      };
    })(this));
    sceneData = {};
    saveGame = {};
    saveGame.encodedObjectStore = null;
    saveGame.sceneUid = this.scene.sceneDocument.uid;
    saveGame.data = {
      resourceContext: this.scene.behavior.resourceContext.toDataBundle(),
      currentCharacter: this.scene.currentCharacter,
      currentInputSession: (ref = (ref1 = gs.ObjectManager.current) != null ? ref1.inputSession : void 0) != null ? ref : 0,
      characterParams: this.characterParams,
      frameCount: Graphics.frameCount,
      tempFields: this.tempFields,
      viewport: this.scene.viewport,
      characters: this.scene.characters,
      characterNames: RecordManager.charactersArray.select(function(c) {
        return {
          name: c.name,
          index: c.index
        };
      }),
      backgrounds: this.scene.backgrounds,
      pictures: this.scene.pictureContainer.subObjectsByDomain,
      texts: this.scene.textContainer.subObjectsByDomain,
      videos: this.scene.videoContainer.subObjectsByDomain,
      viewports: this.scene.viewportContainer.subObjects,
      commonEvents: this.scene.commonEventContainer.subObjects,
      hotspots: this.scene.hotspotContainer.subObjectsByDomain,
      interpreter: this.scene.interpreter,
      choices: this.scene.choices,
      messageBoxes: messageBoxes.select((function(_this) {
        return function(mb, i) {
          return {
            visible: mb.visible,
            id: mb.id,
            message: messages[i]
          };
        };
      })(this)),
      backlog: this.backlog,
      variableStore: this.variableStore,
      defaults: this.defaults,
      transitionData: SceneManager.transitionData,
      audio: {
        audioBuffers: AudioManager.audioBuffers,
        audioBuffersByLayer: AudioManager.audioBuffersByLayer,
        audioLayers: AudioManager.audioLayers,
        soundReferences: AudioManager.soundReferences
      },
      messageAreas: this.scene.messageAreaContainer.subObjectsByDomain
    };
    saveGame.data = gs.ObjectCodec.encode(saveGame.data, context);
    saveGame.encodedObjectStore = context.encodedObjectStore;
    return this.saveGame = saveGame;
  };

  GameManager.prototype.createSaveGameSlot = function(header) {
    var slot;
    slot = {
      "date": new Date().toDateString(),
      "chapter": this.scene.chapter.items.name,
      "scene": this.scene.sceneDocument.items.name,
      "image": header.image
    };
    return slot;
  };

  GameManager.prototype.createSaveGameHeader = function(thumbWidth, thumbHeight) {
    var header, thumbImage;
    thumbImage = this.createSaveGameThumbImage(thumbWidth, thumbHeight);
    header = {
      "date": new Date().toDateString(),
      "chapterUid": this.scene.chapter.uid,
      "sceneUid": this.scene.sceneDocument.uid,
      "image": thumbImage != null ? thumbImage.image.toDataURL() : void 0
    };
    if (thumbImage != null) {
      thumbImage.dispose();
    }
    return header;
  };

  GameManager.prototype.createSaveGameThumbImage = function(width, height) {
    var snapshot, thumbImage;
    snapshot = ResourceManager.getCustomBitmap("$snapshot");
    thumbImage = null;
    if (snapshot && snapshot.loaded) {
      if (width && height) {
        thumbImage = new Bitmap(width, height);
      } else {
        thumbImage = new Bitmap(Graphics.width / 8, Graphics.height / 8);
      }
      thumbImage.stretchBlt(new Rect(0, 0, thumbImage.width, thumbImage.height), snapshot, new Rect(0, 0, snapshot.width, snapshot.height));
    }
    return thumbImage;
  };

  GameManager.prototype.storeSaveGame = function(name, saveGame, header) {
    if (header) {
      GameStorage.setData(name + "_Header", JSON.stringify(header));
    }
    return GameStorage.setData(name, JSON.stringify(saveGame));
  };


  /**
  * Saves the current game at the specified slot.
  *
  * @method save
  * @param {number} slot - The slot where the game should be saved at.
  * @param {number} thumbWidth - The width for the snapshot-thumb. You can specify <b>null</b> or 0 to use an auto calculated width.
  * @param {number} thumbHeight - The height for the snapshot-thumb. You can specify <b>null</b> or 0 to use an auto calculated height.
   */

  GameManager.prototype.save = function(slot, thumbWidth, thumbHeight) {
    var header;
    if (this.saveGame) {
      header = this.createSaveGameHeader(thumbWidth, thumbHeight);
      this.saveGameSlots[slot] = this.createSaveGameSlot(header);
      this.storeSaveGame("SaveGame_" + slot, this.saveGame, header);
      this.sceneData = {};
      return this.saveGame;
    }
  };

  GameManager.prototype.restore = function(saveGame) {
    var ref;
    this.backlog = saveGame.data.backlog;
    this.defaults = saveGame.data.defaults;
    this.variableStore.restore(saveGame.data.variableStore);
    this.sceneData = saveGame.data;
    this.saveGame = null;
    this.loadedSaveGame = null;
    this.tempFields = saveGame.data.tempFields;
    this.characterParams = saveGame.data.characterParams;
    window.$tempFields = this.tempFields;
    window.$dataFields.backlog = this.backlog;
    return (ref = gs.ObjectManager.current) != null ? ref.inputSession = saveGame.data.currentInputSession || 0 : void 0;
  };

  GameManager.prototype.prepareLoadGame = function() {
    return AudioManager.stopAllMusic(30);
  };


  /**
  * Loads the game from the specified save game slot. This method triggers
  * a automatic scene change.
  *
  * @method load
  * @param {number} slot - The slot where the game should be loaded from.
   */

  GameManager.prototype.load = function(slot) {
    if (!this.saveGameSlots[slot] || this.saveGameSlots[slot].date.trim().length === 0) {
      return;
    }
    this.prepareLoadGame();
    this.loadedSaveGame = this.loadSaveGame("SaveGame_" + slot);
    gs.Audio.reset();
    gs.GlobalEventManager.clear();
    SceneManager.switchTo(new vn.Object_Scene());
    return SceneManager.clear();
  };

  GameManager.prototype.loadSaveGame = function(name) {
    return JSON.parse(GameStorage.getData(name));
  };


  /**
  * Gets the save game data for a specified slot.
  *
  * @method getSaveGame
  * @param {number} slot - The slot to get the save data from.
  * @return {Object} The save game data.
   */

  GameManager.prototype.getSaveGame = function(slot) {
    return JSON.parse(GameStorage.getData("SaveGame_" + slot));
  };

  return GameManager;

})();

window.GameManager = new GameManager();

gs.GameManager = window.GameManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7OztFQVNhLHFCQUFBOztBQUNUOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELEdBQWE7O0FBRWI7Ozs7OztJQU1BLElBQUMsQ0FBQSxhQUFELEdBQWlCOztBQUVqQjs7Ozs7SUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQjs7QUFFaEI7Ozs7O0lBS0EsSUFBQyxDQUFBLFdBQUQsR0FBZTs7QUFFZjs7Ozs7SUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtNQUFBLElBQUEsRUFBTSxLQUFOO01BQWEsUUFBQSxFQUFVLENBQXZCO01BQTBCLGNBQUEsRUFBZ0IsSUFBMUM7TUFBZ0QsVUFBQSxFQUFZLElBQTVEO01BQWtFLGFBQUEsRUFBZSxJQUFqRjtNQUF1RixjQUFBLEVBQWdCLElBQXZHO01BQTZHLGFBQUEsRUFBZTtRQUFFLFNBQUEsRUFBVztVQUFFLElBQUEsRUFBTSxDQUFSO1NBQWI7UUFBMEIsUUFBQSxFQUFVLEVBQXBDO1FBQXdDLE1BQUEsRUFBUSxJQUFoRDs7O0FBRTVJOzs7O1NBRmdCOztJQU9oQixJQUFDLENBQUEsVUFBRCxHQUFjOztBQUVkOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDUixVQUFBLEVBQVk7UUFBRSxVQUFBLEVBQVksRUFBZDtRQUFrQixRQUFBLEVBQVUsQ0FBNUI7UUFBK0IsUUFBQSxFQUFVLENBQXpDO1FBQTRDLGNBQUEsRUFBZ0IsQ0FBNUQ7UUFBK0QsZ0JBQUEsRUFBa0IsQ0FBakY7UUFBb0YsUUFBQSxFQUFVO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxPQUFBLEVBQVMsQ0FBdEI7U0FBOUY7UUFBeUgsV0FBQSxFQUFhO1VBQUUsTUFBQSxFQUFRLENBQVY7VUFBYSxVQUFBLEVBQVksQ0FBekI7VUFBNEIsTUFBQSxFQUFRO1lBQUUsU0FBQSxFQUFXLElBQWI7WUFBbUIsT0FB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QyxJQUFEO1dBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFXLENBQUMsT0FBWixDQUFvQixJQUFwQixDQUFYO0VBQVY7OztBQUdkOzs7Ozs7Ozt3QkFPQSxXQUFBLEdBQWEsU0FBQyxJQUFEO1dBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFXLENBQUMsT0FBWixDQUFvQixXQUFBLEdBQVksSUFBaEMsQ0FBWDtFQUFWOzs7Ozs7QUFFakIsTUFBTSxDQUFDLFdBQVAsR0FBeUIsSUFBQSxXQUFBLENBQUE7O0FBQ3pCLEVBQUUsQ0FBQyxXQUFILEdBQWlCLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogR2FtZU1hbmFnZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEdhbWVNYW5hZ2VyXG4gICAgIyMjKlxuICAgICogTWFuYWdlcyBhbGwgZ2VuZXJhbCB0aGluZ3MgYXJvdW5kIHRoZSBnYW1lIGxpa2UgaG9sZGluZyB0aGUgZ2FtZSBzZXR0aW5ncyxcbiAgICAqIG1hbmFnZXMgdGhlIHNhdmUvbG9hZCBvZiBhIGdhbWUsIGV0Yy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgR2FtZU1hbmFnZXJcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCBzY2VuZSBkYXRhLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzY2VuZURhdGFcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBzY2VuZURhdGEgPSB7fVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgc2NlbmUgdmlld3BvcnQgY29udGFpbmluZyBhbGwgdmlzdWFsIG9iamVjdHMgd2hpY2ggYXJlIHBhcnQgb2YgdGhlIHNjZW5lIGFuZCBpbmZsdWVuY2VkXG4gICAgICAgICogYnkgdGhlIGluLWdhbWUgY2FtZXJhLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzY2VuZVZpZXdwb3J0XG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X1ZpZXdwb3J0XG4gICAgICAgICMjI1xuICAgICAgICBAc2NlbmVWaWV3cG9ydCA9IG51bGxcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxpc3Qgb2YgY29tbW9uIGV2ZW50cy5cbiAgICAgICAgKiBAcHJvcGVydHkgY29tbW9uRXZlbnRzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0NvbW1vbkV2ZW50W11cbiAgICAgICAgIyMjXG4gICAgICAgIEBjb21tb25FdmVudHMgPSBbXVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIEdhbWVNYW5hZ2VyIGlzIGluaXRpYWxpemVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb21tb25FdmVudHNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29tbW9uRXZlbnRbXVxuICAgICAgICAjIyNcbiAgICAgICAgQGluaXRpYWxpemVkID0gbm9cblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGVtcG9yYXJ5IGdhbWUgc2V0dGluZ3MuXG4gICAgICAgICogQHByb3BlcnR5IHRlbXBTZXR0aW5nc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQHRlbXBTZXR0aW5ncyA9IHNraXA6IGZhbHNlLCBza2lwVGltZTogNSwgbG9hZE1lbnVBY2Nlc3M6IHRydWUsIG1lbnVBY2Nlc3M6IHRydWUsIGJhY2tsb2dBY2Nlc3M6IHRydWUsIHNhdmVNZW51QWNjZXNzOiB0cnVlLCBtZXNzYWdlRmFkaW5nOiB7IGFuaW1hdGlvbjogeyB0eXBlOiAxIH0sIGR1cmF0aW9uOiAxNSwgZWFzaW5nOiBudWxsIH1cblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGVtcG9yYXJ5IGdhbWUgZmllbGRzLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0ZW1wRmllbGRzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAdGVtcEZpZWxkcyA9IG51bGxcblxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGRlZmF1bHQgdmFsdWVzIGZvciBiYWNrZ3JvdW5kcywgcGljdHVyZXMsIGV0Yy5cbiAgICAgICAgKiBAcHJvcGVydHkgZGVmYXVsdHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IHsgXCJkdXJhdGlvblwiOiAzMCwgXCJvcmlnaW5cIjogMCwgXCJ6T3JkZXJcIjogMCwgXCJsb29wVmVydGljYWxcIjogMCwgXCJsb29wSG9yaXpvbnRhbFwiOiAwLCBcImVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwibW90aW9uQmx1clwiOiB7IFwiZW5hYmxlZFwiOiAwLCBcImRlbGF5XCI6IDIsIFwib3BhY2l0eVwiOiAxMDAsIFwiZGlzc29sdmVTcGVlZFwiOiAzIH0gfSxcbiAgICAgICAgICAgIHBpY3R1cmU6IHsgXCJhcHBlYXJEdXJhdGlvblwiOiAzMCwgXCJkaXNhcHBlYXJEdXJhdGlvblwiOiAzMCwgXCJvcmlnaW5cIjogMSwgXCJ6T3JkZXJcIjogMCwgXCJhcHBlYXJFYXNpbmdcIjogeyBcInR5cGVcIjogMCwgXCJpbk91dFwiOiAxIH0sIFwiZGlzYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImFwcGVhckFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxLCBcIm1vdmVtZW50XCI6IDAsIFwibWFza1wiOiB7IFwiZ3JhcGhpY1wiOiBudWxsLCBcInZhZ3VlXCI6IDMwIH0gfSwgXCJkaXNhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwibW90aW9uQmx1clwiOiB7IFwiZW5hYmxlZFwiOiAwLCBcImRlbGF5XCI6IDIsIFwib3BhY2l0eVwiOiAxMDAsIFwiZGlzc29sdmVTcGVlZFwiOiAzIH0gfSxcbiAgICAgICAgICAgIGNoYXJhY3RlcjogeyBcImV4cHJlc3Npb25EdXJhdGlvblwiOiAwLCBcImFwcGVhckR1cmF0aW9uXCI6IDQwLCBcImRpc2FwcGVhckR1cmF0aW9uXCI6IDQwLCBcIm9yaWdpblwiOiAxLCBcInpPcmRlclwiOiAwLCBcImFwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAyLCBcImluT3V0XCI6IDIgfSwgXCJkaXNhcHBlYXJFYXNpbmdcIjogeyBcInR5cGVcIjogMSwgXCJpbk91dFwiOiAxIH0sIFwiYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDEsIFwibW92ZW1lbnRcIjogMCwgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9LCBcImRpc2FwcGVhckFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxLCBcIm1vdmVtZW50XCI6IDAsIFwibWFza1wiOiB7IFwiZ3JhcGhpY1wiOiBudWxsLCBcInZhZ3VlXCI6IDMwIH0gfSwgXCJtb3Rpb25CbHVyXCI6IHsgXCJlbmFibGVkXCI6IDAsIFwiZGVsYXlcIjogMiwgXCJvcGFjaXR5XCI6IDEwMCwgXCJkaXNzb2x2ZVNwZWVkXCI6IDMgfSwgXCJjaGFuZ2VBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcImZhZGluZ1wiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiY2hhbmdlRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDIsIFwiaW5PdXRcIjogMiB9IH0sXG4gICAgICAgICAgICB0ZXh0OiB7IFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwicG9zaXRpb25PcmlnaW5cIjogMCwgXCJvcmlnaW5cIjogMCwgXCJ6T3JkZXJcIjogMCwgXCJhcHBlYXJFYXNpbmdcIjogeyBcInR5cGVcIjogMCwgXCJpbk91dFwiOiAxIH0sIFwiZGlzYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImFwcGVhckFuaW1hdGlvblwiOiB7IFwidHlwZVwiOiAxLCBcIm1vdmVtZW50XCI6IDAsIFwibWFza1wiOiB7IFwiZ3JhcGhpY1wiOiBudWxsLCBcInZhZ3VlXCI6IDMwIH0gfSwgXCJkaXNhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwibW90aW9uQmx1clwiOiB7IFwiZW5hYmxlZFwiOiAwLCBcImRlbGF5XCI6IDIsIFwib3BhY2l0eVwiOiAxMDAsIFwiZGlzc29sdmVTcGVlZFwiOiAzIH0gfSxcbiAgICAgICAgICAgIHZpZGVvOiB7IFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwib3JpZ2luXCI6IDAsIFwiek9yZGVyXCI6IDAsIFwiYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImRpc2FwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiZGlzYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDEsIFwibW92ZW1lbnRcIjogMCwgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9LCBcIm1vdGlvbkJsdXJcIjogeyBcImVuYWJsZWRcIjogMCwgXCJkZWxheVwiOiAyLCBcIm9wYWNpdHlcIjogMTAwLCBcImRpc3NvbHZlU3BlZWRcIjogMyB9IH0sXG4gICAgICAgICAgICBsaXZlMmQ6IHsgXCJtb3Rpb25GYWRlSW5UaW1lXCI6IDEwMDAsIFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiek9yZGVyXCI6IDAsIFwiYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImRpc2FwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMSwgXCJtb3ZlbWVudFwiOiAwLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiZGlzYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDEsIFwibW92ZW1lbnRcIjogMCwgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9IH0sXG4gICAgICAgICAgICBtZXNzYWdlQm94OiB7IFwiYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiZGlzYXBwZWFyRHVyYXRpb25cIjogMzAsIFwiek9yZGVyXCI6IDAsIFwiYXBwZWFyRWFzaW5nXCI6IHsgXCJ0eXBlXCI6IDAsIFwiaW5PdXRcIjogMSB9LCBcImRpc2FwcGVhckVhc2luZ1wiOiB7IFwidHlwZVwiOiAwLCBcImluT3V0XCI6IDEgfSwgXCJhcHBlYXJBbmltYXRpb25cIjogeyBcInR5cGVcIjogMCwgXCJtb3ZlbWVudFwiOiAzLCBcIm1hc2tcIjogeyBcImdyYXBoaWNcIjogbnVsbCwgXCJ2YWd1ZVwiOiAzMCB9IH0sIFwiZGlzYXBwZWFyQW5pbWF0aW9uXCI6IHsgXCJ0eXBlXCI6IDAsIFwibW92ZW1lbnRcIjogMywgXCJtYXNrXCI6IHsgXCJncmFwaGljXCI6IG51bGwsIFwidmFndWVcIjogMzAgfSB9IH0sXG4gICAgICAgICAgICBhdWRpbzogeyBcIm11c2ljRmFkZUluRHVyYXRpb25cIjogMCwgXCJtdXNpY0ZhZGVPdXREdXJhdGlvblwiOiAwLCBcIm11c2ljVm9sdW1lXCI6IDEwMCwgXCJtdXNpY1BsYXliYWNrUmF0ZVwiOiAxMDAsIFwic291bmRWb2x1bWVcIjogMTAwLCBcInNvdW5kUGxheWJhY2tSYXRlXCI6IDEwMCwgXCJ2b2ljZVZvbHVtZVwiOiAxMDAsIFwidm9pY2VQbGF5YmFja1JhdGVcIjogMTAwIH1cbiAgICAgICAgfVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZ2FtZSdzIGJhY2tsb2cuXG4gICAgICAgICogQHByb3BlcnR5IGJhY2tsb2dcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICAgICAjIyNcbiAgICAgICAgQGJhY2tsb2cgPSBbXVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDaGFyYWN0ZXIgcGFyYW1ldGVycyBieSBjaGFyYWN0ZXIgSUQuXG4gICAgICAgICogQHByb3BlcnR5IGNoYXJhY3RlclBhcmFtc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFtdXG4gICAgICAgICMjI1xuICAgICAgICBAY2hhcmFjdGVyUGFyYW1zID0ge31cblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdhbWUncyBjaGFwdGVyXG4gICAgICAgICogQHByb3BlcnR5IGNoYXB0ZXJzXG4gICAgICAgICogQHR5cGUgZ3MuRG9jdW1lbnRbXVxuICAgICAgICAjIyNcbiAgICAgICAgQGNoYXB0ZXJzID0gW11cblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdhbWUncyBjdXJyZW50IGRpc3BsYXllZCBtZXNzYWdlcy4gRXNwZWNpYWxseSBpbiBOVkwgbW9kZSB0aGUgbWVzc2FnZXNcbiAgICAgICAgKiBvZiB0aGUgY3VycmVudCBwYWdlIGFyZSBzdG9yZWQgaGVyZS5cbiAgICAgICAgKiBAcHJvcGVydHkgbWVzc2FnZXNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICAgICAjIyNcbiAgICAgICAgQG1lc3NhZ2VzID0gW11cblxuICAgICAgICAjIyMqXG4gICAgICAgICogQ291bnQgb2Ygc2F2ZSBzbG90cy4gRGVmYXVsdCBpcyAxMDAuXG4gICAgICAgICogQHByb3BlcnR5IHNhdmVTbG90Q291bnRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBzYXZlU2xvdENvdW50ID0gMTAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBpbmRleCBvZiBzYXZlIGdhbWVzLiBDb250YWlucyB0aGUgaGVhZGVyLWluZm8gZm9yIGVhY2ggc2F2ZSBnYW1lIHNsb3QuXG4gICAgICAgICogQHByb3BlcnR5IHNhdmVHYW1lU2xvdHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICAgICAjIyNcbiAgICAgICAgQHNhdmVHYW1lU2xvdHMgPSBbXVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgZ2xvYmFsIGRhdGEgbGlrZSB0aGUgc3RhdGUgb2YgcGVyc2lzdGVudCBnYW1lIHZhcmlhYmxlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgZ2xvYmFsRGF0YVxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGdsb2JhbERhdGEgPSBudWxsXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgZ2FtZSBydW5zIGluIGVkaXRvcidzIGxpdmUtcHJldmlldy5cbiAgICAgICAgKiBAcHJvcGVydHkgaW5MaXZlUHJldmlld1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGluTGl2ZVByZXZpZXcgPSBub1xuXG5cbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgR2FtZU1hbmFnZXIsIHNob3VsZCBiZSBjYWxsZWQgYmVmb3JlIHRoZSBhY3R1YWwgZ2FtZSBzdGFydHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgIyMjXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgQGluaXRpYWxpemVkID0geWVzXG4gICAgICAgIEBpbkxpdmVQcmV2aWV3ID0gJFBBUkFNUy5wcmV2aWV3P1xuICAgICAgICBAc2F2ZVNsb3RDb3VudCA9IFJlY29yZE1hbmFnZXIuc3lzdGVtLnNhdmVTbG90Q291bnQgfHwgMTAwXG4gICAgICAgIEB0ZW1wRmllbGRzID0gbmV3IGdzLkdhbWVUZW1wKClcbiAgICAgICAgd2luZG93LiR0ZW1wRmllbGRzID0gQHRlbXBGaWVsZHNcblxuICAgICAgICBAY3JlYXRlU2F2ZUdhbWVJbmRleCgpXG4gICAgICAgIEB2YXJpYWJsZVN0b3JlID0gbmV3IGdzLlZhcmlhYmxlU3RvcmUoKVxuICAgICAgICBEYXRhTWFuYWdlci5nZXREb2N1bWVudHNCeVR5cGUoXCJwZXJzaXN0ZW50X3ZhcmlhYmxlc1wiKVxuICAgICAgICBAdmFyaWFibGVTdG9yZS5zZXR1cERvbWFpbnMoRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRzQnlUeXBlKFwiZ2xvYmFsX3ZhcmlhYmxlc1wiKS5zZWxlY3QgKHYpIC0+IHYuaXRlbXMuZG9tYWlufHxcIlwiKVxuICAgICAgICBAdmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50TnVtYmVyc0J5RG9tYWluID0gQGdsb2JhbERhdGEucGVyc2lzdGVudE51bWJlcnMgPyBAdmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50TnVtYmVyc0J5RG9tYWluXG4gICAgICAgIEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRCb29sZWFuc0J5RG9tYWluID0gQGdsb2JhbERhdGEucGVyc2lzdGVudEJvb2xlYW5zID8gQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudEJvb2xlYW5zQnlEb21haW5cbiAgICAgICAgQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudFN0cmluZ3NCeURvbWFpbiA9IEBnbG9iYWxEYXRhLnBlcnNpc3RlbnRTdHJpbmdzID8gQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudFN0cmluZ3NCeURvbWFpblxuICAgICAgICBAdmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50TGlzdHNCeURvbWFpbiA9IEBnbG9iYWxEYXRhLnBlcnNpc3RlbnRMaXN0cyA/IEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRMaXN0c0J5RG9tYWluXG5cbiAgICAgICAgQHNjZW5lVmlld3BvcnQgPSBuZXcgZ3MuT2JqZWN0X1ZpZXdwb3J0KG5ldyBWaWV3cG9ydCgwLCAwLCBHcmFwaGljcy53aWR0aCwgR3JhcGhpY3MuaGVpZ2h0LCBHcmFwaGljcy52aWV3cG9ydCkpXG4gICAgICAgIGZvciBjaGFyYWN0ZXIgaW4gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzQXJyYXlcbiAgICAgICAgICAgIGlmIGNoYXJhY3Rlcj9cbiAgICAgICAgICAgICAgICBAY2hhcmFjdGVyUGFyYW1zW2NoYXJhY3Rlci5pbmRleF0gPSB7fVxuICAgICAgICAgICAgICAgIGlmIGNoYXJhY3Rlci5wYXJhbXM/XG4gICAgICAgICAgICAgICAgICAgIGZvciBwYXJhbSBpbiBjaGFyYWN0ZXIucGFyYW1zXG4gICAgICAgICAgICAgICAgICAgICAgICBAY2hhcmFjdGVyUGFyYW1zW2NoYXJhY3Rlci5pbmRleF1bcGFyYW0ubmFtZV0gPSBwYXJhbS52YWx1ZVxuXG5cbiAgICAgICAgQHNldHVwQ29tbW9uRXZlbnRzKClcblxuICAgICAgICBmb3IgaSBpbiBbMC4uLlJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc11cbiAgICAgICAgICAgIEBzZXR0aW5ncy52b2ljZXNQZXJDaGFyYWN0ZXJbaV0gPSAxMDBcblxuICAgICAgICBAY2hhcHRlcnMgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudHNCeVR5cGUoXCJ2bi5jaGFwdGVyXCIpXG4gICAgICAgIEBjaGFwdGVycy5zb3J0IChhLCBiKSAtPlxuICAgICAgICAgICAgaWYgYS5pdGVtcy5vcmRlciA+IGIuaXRlbXMub3JkZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgZWxzZSBpZiBhLml0ZW1zLm9yZGVyIDwgYi5pdGVtcy5vcmRlclxuICAgICAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAwXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIGNvbW1vbiBldmVudHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cENvbW1vbkV2ZW50c1xuICAgICMjI1xuICAgIHNldHVwQ29tbW9uRXZlbnRzOiAtPlxuICAgICAgICBmb3IgZXZlbnQgaW4gQGNvbW1vbkV2ZW50c1xuICAgICAgICAgICAgZXZlbnQ/LmRpc3Bvc2UoKVxuXG4gICAgICAgIEBjb21tb25FdmVudHMgPSBbXVxuICAgICAgICBmb3IgZXZlbnQgaW4gUmVjb3JkTWFuYWdlci5jb21tb25FdmVudHNcbiAgICAgICAgICAgIG9iamVjdCA9IG5ldyBncy5PYmplY3RfQ29tbW9uRXZlbnQoKVxuICAgICAgICAgICAgb2JqZWN0LnJlY29yZCA9IE9iamVjdC5kZWVwQ29weShldmVudClcbiAgICAgICAgICAgIG9iamVjdC5yaWQgPSBldmVudC5pbmRleFxuICAgICAgICAgICAgQGNvbW1vbkV2ZW50c1tldmVudC5pbmRleF0gPSBvYmplY3RcbiAgICAgICAgICAgIEBjb21tb25FdmVudHMucHVzaChvYmplY3QpXG5cbiAgICAjIyMqXG4gICAgKiBQcmVsb2FkcyByZXNvdXJjZXMgZm9yIGNvbW1vbiBldmVudHMgd2l0aCBhdXRvLXByZWxvYWQgb3B0aW9uIGVuYWJsZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBwcmVsb2FkQ29tbW9uRXZlbnRzXG4gICAgIyMjXG4gICAgcHJlbG9hZENvbW1vbkV2ZW50czogLT5cbiAgICAgICAgZm9yIGV2ZW50IGluIFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzXG4gICAgICAgICAgICBjb250aW51ZSBpZiBub3QgZXZlbnRcbiAgICAgICAgICAgIGlmIGV2ZW50LnN0YXJ0Q29uZGl0aW9uID09IDEgYW5kIGV2ZW50LmF1dG9QcmVsb2FkXG4gICAgICAgICAgICAgICAgZ3MuUmVzb3VyY2VMb2FkZXIubG9hZEV2ZW50Q29tbWFuZHNHcmFwaGljcyhldmVudC5jb21tYW5kcylcblxuICAgICMjIypcbiAgICAqIFNldHMgdXAgY3Vyc29yIGRlcGVuZGluZyBvbiBzeXN0ZW0gc2V0dGluZ3MuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEN1cnNvclxuICAgICMjI1xuICAgIHNldHVwQ3Vyc29yOiAtPlxuICAgICAgICBpZiBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5jdXJzb3I/Lm5hbWVcbiAgICAgICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoUmVjb3JkTWFuYWdlci5zeXN0ZW0uY3Vyc29yKSlcbiAgICAgICAgICAgIEdyYXBoaWNzLnNldEN1cnNvckJpdG1hcChiaXRtYXAsIFJlY29yZE1hbmFnZXIuc3lzdGVtLmN1cnNvci5oeCwgUmVjb3JkTWFuYWdlci5zeXN0ZW0uY3Vyc29yLmh5KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBHcmFwaGljcy5zZXRDdXJzb3JCaXRtYXAobnVsbClcblxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBHYW1lTWFuYWdlci4gU2hvdWxkIGJlIGNhbGxlZCBiZWZvcmUgcXVpdCB0aGUgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyNcbiAgICBkaXNwb3NlOiAtPlxuXG4gICAgIyMjKlxuICAgICogUXVpdHMgdGhlIGdhbWUuIFRoZSBpbXBsZW1lbnRhdGlvbiBkZXBlbmRzIG9uIHRoZSBwbGF0Zm9ybS4gU28gZm9yIGV4YW1wbGUgb24gbW9iaWxlXG4gICAgKiBkZXZpY2VzIHRoaXMgbWV0aG9kIGhhcyBubyBlZmZlY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBleGl0XG4gICAgIyMjXG4gICAgZXhpdDogLT4gQXBwbGljYXRpb24uZXhpdCgpXG5cbiAgICAjIyMqXG4gICAgKiBSZXNldHMgdGhlIEdhbWVNYW5hZ2VyIGJ5IGRpc3Bvc2luZyBhbmQgcmUtaW5pdGlhbGl6aW5nIGl0LlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzZXRcbiAgICAjIyNcbiAgICByZXNldDogLT5cbiAgICAgICAgQGluaXRpYWxpemVkID0gbm9cbiAgICAgICAgQGludGVycHJldGVyID0gbnVsbFxuICAgICAgICBAZGlzcG9zZSgpXG4gICAgICAgIEBpbml0aWFsaXplKClcblxuICAgICMjIypcbiAgICAqIFN0YXJ0cyBhIG5ldyBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgbmV3R2FtZVxuICAgICMjI1xuICAgIG5ld0dhbWU6IC0+XG4gICAgICAgIEBtZXNzYWdlcyA9IFtdXG4gICAgICAgIEB2YXJpYWJsZVN0b3JlLmNsZWFyQWxsR2xvYmFsVmFyaWFibGVzKClcbiAgICAgICAgQHZhcmlhYmxlU3RvcmUuY2xlYXJBbGxMb2NhbFZhcmlhYmxlcygpXG4gICAgICAgIEB0ZW1wU2V0dGluZ3Muc2tpcCA9IG5vXG4gICAgICAgIEB0ZW1wRmllbGRzLmNsZWFyKClcbiAgICAgICAgQHRlbXBGaWVsZHMuaW5HYW1lID0geWVzXG4gICAgICAgIEBzZXR1cENvbW1vbkV2ZW50cygpXG4gICAgICAgIEB0ZW1wU2V0dGluZ3MubWVudUFjY2VzcyA9IHllc1xuICAgICAgICBAdGVtcFNldHRpbmdzLnNhdmVNZW51QWNjZXNzID0geWVzXG4gICAgICAgIEB0ZW1wU2V0dGluZ3MubG9hZE1lbnVBY2Nlc3MgPSB5ZXNcbiAgICAgICAgQHRlbXBTZXR0aW5ncy5iYWNrbG9nQWNjZXNzID0geWVzXG4gICAgICAgIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudD8uaW5wdXRTZXNzaW9uID0gMFxuXG5cbiAgICAjIyMqXG4gICAgKiBFeGlzdHMgdGhlIGdhbWUgYW5kIHJlc2V0cyB0aGUgR2FtZU1hbmFnZXIgd2hpY2ggaXMgaW1wb3J0YW50IGJlZm9yZSBnb2luZyBiYWNrIHRvXG4gICAgKiB0aGUgbWFpbiBtZW51IG9yIHRpdGxlIHNjcmVlbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4aXRHYW1lXG4gICAgIyMjXG4gICAgZXhpdEdhbWU6IC0+XG4gICAgICAgIEB0ZW1wRmllbGRzLmluR2FtZSA9IG5vXG4gICAgICAgIEB0ZW1wRmllbGRzLmlzRXhpdGluZ0dhbWUgPSB5ZXNcblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIEdhbWVNYW5hZ2VyLiBTaG91bGQgYmUgY2FsbGVkIG9uY2UgcGVyIGZyYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyB0aGUgaW5kZXggb2YgYWxsIHNhdmUtZ2FtZXMuIFNob3VsZCBiZSBjYWxsZWQgd2hlbmV2ZXIgYSBuZXcgc2F2ZSBnYW1lXG4gICAgKiBpcyBjcmVhdGVkLlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlU2F2ZUdhbWVJbmRleFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNyZWF0ZVNhdmVHYW1lSW5kZXg6IC0+XG4gICAgICAgIEBzYXZlR2FtZVNsb3RzID0gW11cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5Ac2F2ZVNsb3RDb3VudF1cbiAgICAgICAgICAgIGlmIEdhbWVTdG9yYWdlLmV4aXN0cyhcIlNhdmVHYW1lXyN7aX1fSGVhZGVyXCIpXG4gICAgICAgICAgICAgICAgaGVhZGVyID0gR2FtZVN0b3JhZ2UuZ2V0T2JqZWN0KFwiU2F2ZUdhbWVfI3tpfV9IZWFkZXJcIilcbiAgICAgICAgICAgICAgICBjaGFwdGVyID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoaGVhZGVyLmNoYXB0ZXJVaWQpXG4gICAgICAgICAgICAgICAgc2NlbmUgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudFN1bW1hcnkoaGVhZGVyLnNjZW5lVWlkKVxuICAgICAgICAgICAgICAgIGltYWdlID0gaGVhZGVyLmltYWdlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaGVhZGVyID0gbnVsbFxuICAgICAgICAgICAgICAgIGNoYXBlciA9IG51bGxcbiAgICAgICAgICAgICAgICBzY2VuZSA9IG51bGxcblxuICAgICAgICAgICAgaWYgY2hhcHRlcj8gYW5kIHNjZW5lPyBhbmQgIUBpbkxpdmVQcmV2aWV3XG4gICAgICAgICAgICAgICAgQHNhdmVHYW1lU2xvdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGhlYWRlci5kYXRlLFxuICAgICAgICAgICAgICAgICAgICBjaGFwdGVyOiBjaGFwdGVyLml0ZW1zLm5hbWUgfHwgXCJERUxFVEVEXCJcbiAgICAgICAgICAgICAgICAgICAgc2NlbmU6IHNjZW5lLml0ZW1zLm5hbWUgfHwgXCJERUxFVEVEXCIsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlOiBpbWFnZSAjY2hhcHRlci5pdGVtcy5jb21tYW5kc1swXS5wYXJhbXMuc2F2ZUdhbWVHcmFwaGljPy5uYW1lXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2F2ZUdhbWVTbG90cy5wdXNoKHsgXCJkYXRlXCI6IFwiXCIsIFwiY2hhcHRlclwiOiBcIlwiLCBcInNjZW5lXCI6IFwiXCIsIFwiaW1hZ2VcIjogbnVsbCB9KVxuXG4gICAgICAgIHJldHVybiBAc2F2ZUdhbWVTbG90c1xuXG4gICAgIyMjKlxuICAgICogUmVzZXRzIHRoZSBnYW1lJ3Mgc2V0dGluZ3MgdG8gaXRzIGRlZmF1bHQgdmFsdWVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzZXRTZXR0aW5nc1xuICAgICMjI1xuICAgIHJlc2V0U2V0dGluZ3M6IC0+XG4gICAgICAgIEBzZXR0aW5ncyA9IHsgdmVyc2lvbjogMzQyLCByZW5kZXJlcjogMCwgZmlsdGVyOiAxLCBjb25maXJtYXRpb246IHllcywgYWRqdXN0QXNwZWN0UmF0aW86IG5vLCBhbGxvd1NraXA6IHllcywgYWxsb3dTa2lwVW5yZWFkTWVzc2FnZXM6IHllcywgIGFsbG93VmlkZW9Ta2lwOiB5ZXMsIHNraXBWb2ljZU9uQWN0aW9uOiB5ZXMsIGFsbG93Q2hvaWNlU2tpcDogbm8sIHZvaWNlc0J5Q2hhcmFjdGVyOiBbXSwgdGltZU1lc3NhZ2VUb1ZvaWNlOiB0cnVlLCAgXCJhdXRvTWVzc2FnZVwiOiB7IGVuYWJsZWQ6IGZhbHNlLCB0aW1lOiAwLCB3YWl0Rm9yVm9pY2U6IHllcywgc3RvcE9uQWN0aW9uOiBubyB9LCAgXCJ2b2ljZUVuYWJsZWRcIjogdHJ1ZSwgXCJiZ21FbmFibGVkXCI6IHRydWUsIFwic291bmRFbmFibGVkXCI6IHRydWUsIFwidm9pY2VWb2x1bWVcIjogMTAwLCBcImJnbVZvbHVtZVwiOiAxMDAsIFwic2VWb2x1bWVcIjogMTAwLCBcIm1lc3NhZ2VTcGVlZFwiOiA0LCBcImZ1bGxTY3JlZW5cIjogbm8sIFwiYXNwZWN0UmF0aW9cIjogMCB9XG4gICAgICAgIEBzYXZlR2FtZVNsb3RzID0gW11cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5Ac2F2ZVNsb3RDb3VudF1cbiAgICAgICAgICAgIEdhbWVTdG9yYWdlLnJlbW92ZShcIlNhdmVHYW1lXyN7aX1fSGVhZGVyXCIpXG4gICAgICAgICAgICBHYW1lU3RvcmFnZS5yZW1vdmUoXCJTYXZlR2FtZV8je2l9XCIpXG5cbiAgICAgICAgICAgIEBzYXZlR2FtZVNsb3RzLnB1c2goeyBcImRhdGVcIjogXCJcIiwgXCJjaGFwdGVyXCI6IFwiXCIsIFwic2NlbmVcIjogXCJcIiwgXCJ0aHVtYlwiOiBcIlwiIH0pXG5cbiAgICAgICAgR2FtZVN0b3JhZ2Uuc2V0T2JqZWN0KFwic2V0dGluZ3NcIiwgQHNldHRpbmdzKVxuXG5cblxuICAgICMjIypcbiAgICAqIFNhdmVzIGN1cnJlbnQgZ2FtZSBzZXR0aW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNhdmVTZXR0aW5nc1xuICAgICMjI1xuICAgIHNhdmVTZXR0aW5nczogLT5cbiAgICAgICAgR2FtZVN0b3JhZ2Uuc2V0T2JqZWN0KFwic2V0dGluZ3NcIiwgQHNldHRpbmdzKVxuXG4gICAgIyMjKlxuICAgICogU2F2ZXMgY3VycmVudCBnbG9iYWwgZGF0YS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNhdmVHbG9iYWxEYXRhXG4gICAgIyMjXG4gICAgc2F2ZUdsb2JhbERhdGE6IC0+XG4gICAgICAgIEBnbG9iYWxEYXRhLnBlcnNpc3RlbnROdW1iZXJzID0gQHZhcmlhYmxlU3RvcmUucGVyc2lzdGVudE51bWJlcnNCeURvbWFpblxuICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50TGlzdHMgPSBAdmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50TGlzdHNCeURvbWFpblxuICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50Qm9vbGVhbnMgPSBAdmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50Qm9vbGVhbnNCeURvbWFpblxuICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50U3RyaW5ncyA9IEB2YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRTdHJpbmdzQnlEb21haW5cbiAgICAgICAgR2FtZVN0b3JhZ2Uuc2V0T2JqZWN0KFwiZ2xvYmFsRGF0YVwiLCBAZ2xvYmFsRGF0YSlcblxuICAgICMjIypcbiAgICAqIFJlc2V0cyBjdXJyZW50IGdsb2JhbCBkYXRhLiBBbGwgc3RvcmVkIGRhdGEgYWJvdXQgcmVhZCBtZXNzYWdlcywgcGVyc2lzdGVudCB2YXJpYWJsZXMgYW5kXG4gICAgKiBDRyBnYWxsZXJ5IHdpbGwgYmUgZGVsZXRlZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc2V0R2xvYmFsRGF0YVxuICAgICMjI1xuICAgIHJlc2V0R2xvYmFsRGF0YTogLT5cbiAgICAgICAgdmVyc2lvbiA9IEBnbG9iYWxEYXRhPy52ZXJzaW9uXG4gICAgICAgIGRhdGEgPSBAZ2xvYmFsRGF0YVxuXG4gICAgICAgIEBnbG9iYWxEYXRhID0ge1xuICAgICAgICAgICAgbWVzc2FnZXM6IHt9LCBjZ0dhbGxlcnk6IHt9LCB2ZXJzaW9uOiAzNDIsXG4gICAgICAgICAgICBwZXJzaXN0ZW50TnVtYmVyczogeyBcIjBcIjogW10sIFwiY29tLmRlZ2ljYS52bm0uZGVmYXVsdFwiOiBbXSB9LFxuICAgICAgICAgICAgcGVyc2lzdGVudFN0cmluZ3M6IHsgXCIwXCI6IFtdLCBcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIjogW10gfSxcbiAgICAgICAgICAgIHBlcnNpc3RlbnRCb29sZWFuczogeyBcIjBcIjogW10sIFwiY29tLmRlZ2ljYS52bm0uZGVmYXVsdFwiOiBbXSB9LFxuICAgICAgICAgICAgcGVyc2lzdGVudExpc3RzOiB7IFwiMFwiOiBbXSwgXCJjb20uZGVnaWNhLnZubS5kZWZhdWx0XCI6IFtdIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciBjZywgaSBpbiBSZWNvcmRNYW5hZ2VyLmNnR2FsbGVyeUFycmF5XG4gICAgICAgICAgICBpZiBjZz9cbiAgICAgICAgICAgICAgICBAZ2xvYmFsRGF0YS5jZ0dhbGxlcnlbY2cuaW5kZXhdID0geyB1bmxvY2tlZDogbm8gfVxuXG4gICAgICAgIEdhbWVTdG9yYWdlLnNldE9iamVjdChcImdsb2JhbERhdGFcIiwgQGdsb2JhbERhdGEpXG5cbiAgICAgICAgQG1pZ3JhdGVHbG9iYWxEYXRhKGRhdGEsIHZlcnNpb24rMSwgQGdsb2JhbERhdGEudmVyc2lvbilcblxuICAgIG1pZ3JhdGVHbG9iYWxEYXRhOiAoZGF0YSwgZnJvbSwgdG8pIC0+XG4gICAgICAgIGZvciBpIGluIFtmcm9tLi50b11cbiAgICAgICAgICAgIGlmIHRoaXNbXCJtaWdyYXRlR2xvYmFsRGF0YSN7aX1cIl0/XG4gICAgICAgICAgICAgICAgdGhpc1tcIm1pZ3JhdGVHbG9iYWxEYXRhI3tpfVwiXShkYXRhKVxuXG4gICAgbWlncmF0ZUdsb2JhbERhdGEzNDI6IChkYXRhKSAtPlxuICAgICAgICBpZiBkYXRhP1xuICAgICAgICAgICAgQGdsb2JhbERhdGEucGVyc2lzdGVudE51bWJlcnNbMF0gPSBkYXRhLnBlcnNpc3RlbnROdW1iZXJzWzBdIHx8IFtdXG4gICAgICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50U3RyaW5nc1swXSA9IGRhdGEucGVyc2lzdGVudFN0cmluZ3NbMF0gfHwgW11cbiAgICAgICAgICAgIEBnbG9iYWxEYXRhLnBlcnNpc3RlbnRCb29sZWFuc1swXSA9IGRhdGEucGVyc2lzdGVudEJvb2xlYW5zWzBdIHx8IFtdXG4gICAgICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50TGlzdHNbMF0gPSBkYXRhLnBlcnNpc3RlbnRMaXN0c1swXSB8fCBbXVxuICAgICAgICAgICAgQGdsb2JhbERhdGEucGVyc2lzdGVudE51bWJlcnNbXCJjb20uZGVnaWNhLnZubS5kZWZhdWx0XCJdID0gZGF0YS5wZXJzaXN0ZW50TnVtYmVyc1swXSB8fCBbXVxuICAgICAgICAgICAgQGdsb2JhbERhdGEucGVyc2lzdGVudFN0cmluZ3NbXCJjb20uZGVnaWNhLnZubS5kZWZhdWx0XCJdID0gZGF0YS5wZXJzaXN0ZW50U3RyaW5nc1swXSB8fCBbXVxuICAgICAgICAgICAgQGdsb2JhbERhdGEucGVyc2lzdGVudEJvb2xlYW5zW1wiY29tLmRlZ2ljYS52bm0uZGVmYXVsdFwiXSA9IGRhdGEucGVyc2lzdGVudEJvb2xlYW5zWzBdIHx8IFtdXG4gICAgICAgICAgICBAZ2xvYmFsRGF0YS5wZXJzaXN0ZW50TGlzdHNbXCJjb20uZGVnaWNhLnZubS5kZWZhdWx0XCJdID0gZGF0YS5wZXJzaXN0ZW50TGlzdHNbMF0gfHwgW11cblxuICAgIHJlYWRTYXZlR2FtZTogKHNhdmVHYW1lKSAtPlxuICAgIHdyaXRlU2F2ZUdhbWU6IChzYXZlR2FtZSkgLT5cblxuICAgIHByZXBhcmVTYXZlR2FtZTogKHNuYXBzaG90KSAtPlxuICAgICAgICBpZiBzbmFwc2hvdFxuICAgICAgICAgICAgc25hcHNob3QgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Q3VzdG9tQml0bWFwKFwiJHNuYXBzaG90XCIpXG4gICAgICAgICAgICBzbmFwc2hvdD8uZGlzcG9zZSgpXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuc2V0Q3VzdG9tQml0bWFwKFwiJHNuYXBzaG90XCIsIEdyYXBoaWNzLnNuYXBzaG90KCkpXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBncy5PYmplY3RDb2RlY0NvbnRleHQoKVxuICAgICAgICBjb250ZXh0LmRlY29kZWRPYmplY3RTdG9yZS5wdXNoKEdyYXBoaWNzLnZpZXdwb3J0KVxuICAgICAgICBjb250ZXh0LmRlY29kZWRPYmplY3RTdG9yZS5wdXNoKEBzY2VuZSlcbiAgICAgICAgY29udGV4dC5kZWNvZGVkT2JqZWN0U3RvcmUucHVzaChAc2NlbmUuYmVoYXZpb3IpXG5cbiAgICAgICAgbWVzc2FnZUJveElkcyA9IFtcIm1lc3NhZ2VCb3hcIiwgXCJudmxNZXNzYWdlQm94XCIsIFwibWVzc2FnZU1lbnVcIl07XG4gICAgICAgIG1lc3NhZ2VJZHMgPSBbXCJnYW1lTWVzc2FnZV9tZXNzYWdlXCIsIFwibnZsR2FtZU1lc3NhZ2VfbWVzc2FnZVwiXTtcbiAgICAgICAgbWVzc2FnZUJveGVzID0gbWVzc2FnZUJveElkcy5zZWxlY3QgKGlkKSA9PiBAc2NlbmUuYmVoYXZpb3Iub2JqZWN0TWFuYWdlci5vYmplY3RCeUlkKGlkKVxuICAgICAgICBtZXNzYWdlcyA9IG1lc3NhZ2VJZHMuc2VsZWN0IChpZCkgPT4gQHNjZW5lLmJlaGF2aW9yLm9iamVjdE1hbmFnZXIub2JqZWN0QnlJZChpZClcblxuICAgICAgICBzY2VuZURhdGEgPSB7fVxuICAgICAgICBzYXZlR2FtZSA9IHt9XG4gICAgICAgIHNhdmVHYW1lLmVuY29kZWRPYmplY3RTdG9yZSA9IG51bGxcbiAgICAgICAgc2F2ZUdhbWUuc2NlbmVVaWQgPSBAc2NlbmUuc2NlbmVEb2N1bWVudC51aWRcbiAgICAgICAgc2F2ZUdhbWUuZGF0YSA9IHtcbiAgICAgICAgICAgIHJlc291cmNlQ29udGV4dDogQHNjZW5lLmJlaGF2aW9yLnJlc291cmNlQ29udGV4dC50b0RhdGFCdW5kbGUoKSxcbiAgICAgICAgICAgIGN1cnJlbnRDaGFyYWN0ZXI6IEBzY2VuZS5jdXJyZW50Q2hhcmFjdGVyLFxuICAgICAgICAgICAgY3VycmVudElucHV0U2Vzc2lvbjogZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Py5pbnB1dFNlc3Npb24gPyAwLFxuICAgICAgICAgICAgY2hhcmFjdGVyUGFyYW1zOiBAY2hhcmFjdGVyUGFyYW1zLFxuICAgICAgICAgICAgZnJhbWVDb3VudDogR3JhcGhpY3MuZnJhbWVDb3VudCxcbiAgICAgICAgICAgIHRlbXBGaWVsZHM6IEB0ZW1wRmllbGRzLFxuICAgICAgICAgICAgdmlld3BvcnQ6IEBzY2VuZS52aWV3cG9ydCxcbiAgICAgICAgICAgIGNoYXJhY3RlcnM6IEBzY2VuZS5jaGFyYWN0ZXJzLFxuICAgICAgICAgICAgY2hhcmFjdGVyTmFtZXM6IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc0FycmF5LnNlbGVjdCgoYykgLT4geyBuYW1lOiBjLm5hbWUsIGluZGV4OiBjLmluZGV4IH0pLFxuICAgICAgICAgICAgYmFja2dyb3VuZHM6IEBzY2VuZS5iYWNrZ3JvdW5kcyxcbiAgICAgICAgICAgIHBpY3R1cmVzOiBAc2NlbmUucGljdHVyZUNvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW4sXG4gICAgICAgICAgICB0ZXh0czogQHNjZW5lLnRleHRDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLFxuICAgICAgICAgICAgdmlkZW9zOiBAc2NlbmUudmlkZW9Db250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLFxuICAgICAgICAgICAgdmlld3BvcnRzOiBAc2NlbmUudmlld3BvcnRDb250YWluZXIuc3ViT2JqZWN0cyxcbiAgICAgICAgICAgIGNvbW1vbkV2ZW50czogQHNjZW5lLmNvbW1vbkV2ZW50Q29udGFpbmVyLnN1Yk9iamVjdHMsXG4gICAgICAgICAgICBob3RzcG90czogQHNjZW5lLmhvdHNwb3RDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLFxuICAgICAgICAgICAgaW50ZXJwcmV0ZXI6IEBzY2VuZS5pbnRlcnByZXRlcixcbiAgICAgICAgICAgIGNob2ljZXM6IEBzY2VuZS5jaG9pY2VzLFxuICAgICAgICAgICAgbWVzc2FnZUJveGVzOiBtZXNzYWdlQm94ZXMuc2VsZWN0KChtYiwgaSkgPT4geyB2aXNpYmxlOiBtYi52aXNpYmxlLCBpZDogbWIuaWQsIG1lc3NhZ2U6IG1lc3NhZ2VzW2ldIH0pLFxuICAgICAgICAgICAgYmFja2xvZzogQGJhY2tsb2csXG4gICAgICAgICAgICB2YXJpYWJsZVN0b3JlOiBAdmFyaWFibGVTdG9yZSxcbiAgICAgICAgICAgIGRlZmF1bHRzOiBAZGVmYXVsdHMsXG4gICAgICAgICAgICB0cmFuc2l0aW9uRGF0YTogU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhLFxuICAgICAgICAgICAgYXVkaW86IHsgYXVkaW9CdWZmZXJzOiBBdWRpb01hbmFnZXIuYXVkaW9CdWZmZXJzLCBhdWRpb0J1ZmZlcnNCeUxheWVyOiBBdWRpb01hbmFnZXIuYXVkaW9CdWZmZXJzQnlMYXllciwgYXVkaW9MYXllcnM6IEF1ZGlvTWFuYWdlci5hdWRpb0xheWVycywgc291bmRSZWZlcmVuY2VzOiBBdWRpb01hbmFnZXIuc291bmRSZWZlcmVuY2VzIH0sXG4gICAgICAgICAgICBtZXNzYWdlQXJlYXM6IEBzY2VuZS5tZXNzYWdlQXJlYUNvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW5cbiAgICAgICAgfVxuXG4gICAgICAgIHNhdmVHYW1lLmRhdGEgPSBncy5PYmplY3RDb2RlYy5lbmNvZGUoc2F2ZUdhbWUuZGF0YSwgY29udGV4dClcbiAgICAgICAgc2F2ZUdhbWUuZW5jb2RlZE9iamVjdFN0b3JlID0gY29udGV4dC5lbmNvZGVkT2JqZWN0U3RvcmVcblxuICAgICAgICBAc2F2ZUdhbWUgPSBzYXZlR2FtZVxuXG4gICAgY3JlYXRlU2F2ZUdhbWVTbG90OiAoaGVhZGVyKSAtPlxuICAgICAgICBzbG90ID0ge1xuICAgICAgICAgICAgXCJkYXRlXCI6IG5ldyBEYXRlKCkudG9EYXRlU3RyaW5nKCksXG4gICAgICAgICAgICBcImNoYXB0ZXJcIjogQHNjZW5lLmNoYXB0ZXIuaXRlbXMubmFtZSxcbiAgICAgICAgICAgIFwic2NlbmVcIjogQHNjZW5lLnNjZW5lRG9jdW1lbnQuaXRlbXMubmFtZSxcbiAgICAgICAgICAgIFwiaW1hZ2VcIjogaGVhZGVyLmltYWdlXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2xvdDtcblxuICAgIGNyZWF0ZVNhdmVHYW1lSGVhZGVyOiAodGh1bWJXaWR0aCwgdGh1bWJIZWlnaHQpIC0+XG4gICAgICAgIHRodW1iSW1hZ2UgPSBAY3JlYXRlU2F2ZUdhbWVUaHVtYkltYWdlKHRodW1iV2lkdGgsIHRodW1iSGVpZ2h0KVxuXG4gICAgICAgIGhlYWRlciA9IHtcbiAgICAgICAgICAgIFwiZGF0ZVwiOiBuZXcgRGF0ZSgpLnRvRGF0ZVN0cmluZygpLFxuICAgICAgICAgICAgXCJjaGFwdGVyVWlkXCI6IEBzY2VuZS5jaGFwdGVyLnVpZCxcbiAgICAgICAgICAgIFwic2NlbmVVaWRcIjogQHNjZW5lLnNjZW5lRG9jdW1lbnQudWlkLFxuICAgICAgICAgICAgXCJpbWFnZVwiOiB0aHVtYkltYWdlPy5pbWFnZS50b0RhdGFVUkwoKVxuICAgICAgICB9XG5cbiAgICAgICAgdGh1bWJJbWFnZT8uZGlzcG9zZSgpXG5cbiAgICAgICAgcmV0dXJuIGhlYWRlclxuXG4gICAgY3JlYXRlU2F2ZUdhbWVUaHVtYkltYWdlOiAod2lkdGgsIGhlaWdodCkgLT5cbiAgICAgICAgc25hcHNob3QgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Q3VzdG9tQml0bWFwKFwiJHNuYXBzaG90XCIpXG4gICAgICAgIHRodW1iSW1hZ2UgPSBudWxsXG5cbiAgICAgICAgaWYgc25hcHNob3QgYW5kIHNuYXBzaG90LmxvYWRlZFxuICAgICAgICAgICAgaWYgd2lkdGggYW5kIGhlaWdodFxuICAgICAgICAgICAgICAgIHRodW1iSW1hZ2UgPSBuZXcgQml0bWFwKHdpZHRoLCBoZWlnaHQpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGh1bWJJbWFnZSA9IG5ldyBCaXRtYXAoR3JhcGhpY3Mud2lkdGggLyA4LCBHcmFwaGljcy5oZWlnaHQgLyA4KVxuICAgICAgICAgICAgdGh1bWJJbWFnZS5zdHJldGNoQmx0KG5ldyBSZWN0KDAsIDAsIHRodW1iSW1hZ2Uud2lkdGgsIHRodW1iSW1hZ2UuaGVpZ2h0KSwgc25hcHNob3QsIG5ldyBSZWN0KDAsIDAsIHNuYXBzaG90LndpZHRoLCBzbmFwc2hvdC5oZWlnaHQpKVxuXG4gICAgICAgIHJldHVybiB0aHVtYkltYWdlXG5cbiAgICBzdG9yZVNhdmVHYW1lOiAobmFtZSwgc2F2ZUdhbWUsIGhlYWRlcikgLT5cbiAgICAgICAgaWYgaGVhZGVyXG4gICAgICAgICAgICBHYW1lU3RvcmFnZS5zZXREYXRhKFwiI3tuYW1lfV9IZWFkZXJcIiwgSlNPTi5zdHJpbmdpZnkoaGVhZGVyKSlcblxuICAgICAgICBHYW1lU3RvcmFnZS5zZXREYXRhKG5hbWUsIEpTT04uc3RyaW5naWZ5KHNhdmVHYW1lKSlcblxuICAgICMjIypcbiAgICAqIFNhdmVzIHRoZSBjdXJyZW50IGdhbWUgYXQgdGhlIHNwZWNpZmllZCBzbG90LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2F2ZVxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNsb3QgLSBUaGUgc2xvdCB3aGVyZSB0aGUgZ2FtZSBzaG91bGQgYmUgc2F2ZWQgYXQuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdGh1bWJXaWR0aCAtIFRoZSB3aWR0aCBmb3IgdGhlIHNuYXBzaG90LXRodW1iLiBZb3UgY2FuIHNwZWNpZnkgPGI+bnVsbDwvYj4gb3IgMCB0byB1c2UgYW4gYXV0byBjYWxjdWxhdGVkIHdpZHRoLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHRodW1iSGVpZ2h0IC0gVGhlIGhlaWdodCBmb3IgdGhlIHNuYXBzaG90LXRodW1iLiBZb3UgY2FuIHNwZWNpZnkgPGI+bnVsbDwvYj4gb3IgMCB0byB1c2UgYW4gYXV0byBjYWxjdWxhdGVkIGhlaWdodC5cbiAgICAjIyNcbiAgICBzYXZlOiAoc2xvdCwgdGh1bWJXaWR0aCwgdGh1bWJIZWlnaHQpIC0+XG4gICAgICAgIGlmIEBzYXZlR2FtZVxuICAgICAgICAgICAgaGVhZGVyID0gQGNyZWF0ZVNhdmVHYW1lSGVhZGVyKHRodW1iV2lkdGgsIHRodW1iSGVpZ2h0KVxuICAgICAgICAgICAgQHNhdmVHYW1lU2xvdHNbc2xvdF0gPSBAY3JlYXRlU2F2ZUdhbWVTbG90KGhlYWRlcilcbiAgICAgICAgICAgIEBzdG9yZVNhdmVHYW1lKFwiU2F2ZUdhbWVfI3tzbG90fVwiLCBAc2F2ZUdhbWUsIGhlYWRlcilcbiAgICAgICAgICAgIEBzY2VuZURhdGEgPSB7fVxuXG4gICAgICAgICAgICByZXR1cm4gQHNhdmVHYW1lXG5cbiAgICByZXN0b3JlOiAoc2F2ZUdhbWUpIC0+XG4gICAgICAgIEBiYWNrbG9nID0gc2F2ZUdhbWUuZGF0YS5iYWNrbG9nXG4gICAgICAgIEBkZWZhdWx0cyA9IHNhdmVHYW1lLmRhdGEuZGVmYXVsdHNcbiAgICAgICAgQHZhcmlhYmxlU3RvcmUucmVzdG9yZShzYXZlR2FtZS5kYXRhLnZhcmlhYmxlU3RvcmUpXG4gICAgICAgIEBzY2VuZURhdGEgPSBzYXZlR2FtZS5kYXRhXG4gICAgICAgIEBzYXZlR2FtZSA9IG51bGxcbiAgICAgICAgQGxvYWRlZFNhdmVHYW1lID0gbnVsbFxuICAgICAgICBAdGVtcEZpZWxkcyA9IHNhdmVHYW1lLmRhdGEudGVtcEZpZWxkc1xuICAgICAgICBAY2hhcmFjdGVyUGFyYW1zID0gc2F2ZUdhbWUuZGF0YS5jaGFyYWN0ZXJQYXJhbXNcbiAgICAgICAgd2luZG93LiR0ZW1wRmllbGRzID0gQHRlbXBGaWVsZHNcbiAgICAgICAgd2luZG93LiRkYXRhRmllbGRzLmJhY2tsb2cgPSBAYmFja2xvZ1xuICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQ/LmlucHV0U2Vzc2lvbiA9IHNhdmVHYW1lLmRhdGEuY3VycmVudElucHV0U2Vzc2lvbiB8fCAwXG5cblxuICAgIHByZXBhcmVMb2FkR2FtZTogLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLnN0b3BBbGxNdXNpYygzMClcblxuICAgICMjIypcbiAgICAqIExvYWRzIHRoZSBnYW1lIGZyb20gdGhlIHNwZWNpZmllZCBzYXZlIGdhbWUgc2xvdC4gVGhpcyBtZXRob2QgdHJpZ2dlcnNcbiAgICAqIGEgYXV0b21hdGljIHNjZW5lIGNoYW5nZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzbG90IC0gVGhlIHNsb3Qgd2hlcmUgdGhlIGdhbWUgc2hvdWxkIGJlIGxvYWRlZCBmcm9tLlxuICAgICMjI1xuICAgIGxvYWQ6IChzbG90KSAtPlxuICAgICAgICByZXR1cm4gaWYgIUBzYXZlR2FtZVNsb3RzW3Nsb3RdIG9yIEBzYXZlR2FtZVNsb3RzW3Nsb3RdLmRhdGUudHJpbSgpLmxlbmd0aCA9PSAwXG5cbiAgICAgICAgQHByZXBhcmVMb2FkR2FtZSgpXG4gICAgICAgIEBsb2FkZWRTYXZlR2FtZSA9IEBsb2FkU2F2ZUdhbWUoXCJTYXZlR2FtZV8je3Nsb3R9XCIpXG5cblxuICAgICAgICBncy5BdWRpby5yZXNldCgpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5jbGVhcigpXG4gICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXcgdm4uT2JqZWN0X1NjZW5lKCkpXG4gICAgICAgIFNjZW5lTWFuYWdlci5jbGVhcigpXG5cblxuICAgIGxvYWRTYXZlR2FtZTogKG5hbWUpIC0+IEpTT04ucGFyc2UoR2FtZVN0b3JhZ2UuZ2V0RGF0YShuYW1lKSlcblxuXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgc2F2ZSBnYW1lIGRhdGEgZm9yIGEgc3BlY2lmaWVkIHNsb3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBnZXRTYXZlR2FtZVxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNsb3QgLSBUaGUgc2xvdCB0byBnZXQgdGhlIHNhdmUgZGF0YSBmcm9tLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgc2F2ZSBnYW1lIGRhdGEuXG4gICAgIyMjXG4gICAgZ2V0U2F2ZUdhbWU6IChzbG90KSAtPiBKU09OLnBhcnNlKEdhbWVTdG9yYWdlLmdldERhdGEoXCJTYXZlR2FtZV8je3Nsb3R9XCIpKVxuXG53aW5kb3cuR2FtZU1hbmFnZXIgPSBuZXcgR2FtZU1hbmFnZXIoKVxuZ3MuR2FtZU1hbmFnZXIgPSB3aW5kb3cuR2FtZU1hbmFnZXIiXX0=
//# sourceURL=GameManager_21.js