var Component_GameSceneBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_GameSceneBehavior = (function(superClass) {
  extend(Component_GameSceneBehavior, superClass);


  /**
  * Defines the behavior of visual novel game scene.
  *
  * @module vn
  * @class Component_GameSceneBehavior
  * @extends gs.Component_LayoutSceneBehavior
  * @memberof vn
   */

  function Component_GameSceneBehavior() {
    Component_GameSceneBehavior.__super__.constructor.call(this);
    this.onAutoCommonEventStart = (function(_this) {
      return function() {
        _this.object.removeComponent(_this.object.interpreter);
        return _this.object.interpreter.stop();
      };
    })(this);
    this.onAutoCommonEventFinish = (function(_this) {
      return function() {
        if (!_this.object.components.contains(_this.object.interpreter)) {
          _this.object.addComponent(_this.object.interpreter);
        }
        return _this.object.interpreter.resume();
      };
    })(this);
    this.resourceContext = null;
    this.objectDomain = "";
  }


  /**
  * Initializes the scene.
  *
  * @method initialize
   */

  Component_GameSceneBehavior.prototype.initialize = function() {
    var ref, saveGame, sceneUid, sprite;
    if (SceneManager.previousScenes.length === 0) {
      gs.GlobalEventManager.clearExcept(this.object.commonEventContainer.subObjects);
    }
    this.resourceContext = ResourceManager.createContext();
    ResourceManager.context = this.resourceContext;
    Graphics.freeze();
    saveGame = GameManager.loadedSaveGame;
    sceneUid = null;
    if (saveGame) {
      sceneUid = saveGame.sceneUid;
      this.object.sceneData = saveGame.data;
    } else {
      sceneUid = ((ref = $PARAMS.preview) != null ? ref.scene.uid : void 0) || this.object.sceneData.uid || RecordManager.system.startInfo.scene.uid;
    }
    this.object.sceneDocument = DataManager.getDocument(sceneUid);
    if (this.object.sceneDocument && this.object.sceneDocument.items.type === "vn.scene") {
      this.object.chapter = DataManager.getDocument(this.object.sceneDocument.items.chapterUid);
      this.object.currentCharacter = {
        "name": ""
      };
      if (!GameManager.initialized) {
        GameManager.initialize();
      }
      GameManager.preloadCommonEvents();
      LanguageManager.loadBundles();
    } else {
      sprite = new gs.Sprite();
      sprite.bitmap = new gs.Bitmap(Graphics.width, 50);
      sprite.bitmap.drawText(0, 0, Graphics.width, 50, "No Start Scene selected", 1, 0);
      sprite.srcRect = new gs.Rect(0, 0, Graphics.width, 50);
      sprite.y = (Graphics.height - 50) / 2;
      sprite.z = 10000;
    }
    return this.setupScreen();
  };


  /**
  * Disposes the scene.
  *
  * @method dispose
   */

  Component_GameSceneBehavior.prototype.dispose = function() {
    var event, j, len, ref, ref1;
    ResourceManager.context = this.resourceContext;
    this.object.removeObject(this.object.commonEventContainer);
    this.show(false);
    if ((ref = this.object.viewport) != null) {
      ref.dispose();
    }
    ref1 = GameManager.commonEvents;
    for (j = 0, len = ref1.length; j < len; j++) {
      event = ref1[j];
      if (event) {
        event.events.offByOwner("start", this.object);
        event.events.offByOwner("finish", this.object);
      }
    }
    if (this.object.video) {
      this.object.video.dispose();
      this.object.video.onEnded();
    }
    return Component_GameSceneBehavior.__super__.dispose.call(this);
  };

  Component_GameSceneBehavior.prototype.changePictureDomain = function(domain) {
    this.object.pictureContainer.behavior.changeDomain(domain);
    return this.object.pictures = this.object.pictureContainer.subObjects;
  };

  Component_GameSceneBehavior.prototype.changeTextDomain = function(domain) {
    this.object.textContainer.behavior.changeDomain(domain);
    return this.object.texts = this.object.textContainer.subObjects;
  };

  Component_GameSceneBehavior.prototype.changeVideoDomain = function(domain) {
    this.object.videoContainer.behavior.changeDomain(domain);
    return this.object.videos = this.object.videoContainer.subObjects;
  };

  Component_GameSceneBehavior.prototype.changeHotspotDomain = function(domain) {
    this.object.hotspotContainer.behavior.changeDomain(domain);
    return this.object.hotspots = this.object.hotspotContainer.subObjects;
  };

  Component_GameSceneBehavior.prototype.changeMessageAreaDomain = function(domain) {
    this.object.messageAreaContainer.behavior.changeDomain(domain);
    return this.object.messageAreas = this.object.messageAreaContainer.subObjects;
  };


  /**
  * Shows/Hides the current scene. A hidden scene is no longer shown and executed
  * but all objects and data is still there and be shown again anytime.
  *
  * @method show
  * @param {boolean} visible - Indicates if the scene should be shown or hidden.
   */

  Component_GameSceneBehavior.prototype.show = function(visible) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
    if (visible) {
      GameManager.sceneViewport = this.object.viewport;
      GameManager.sceneViewport.tone = this.screenTone || GameManager.sceneViewport.tone;
      GameManager.sceneViewport.zoom = this.screenZoom || GameManager.sceneViewport.zoom;
      GameManager.sceneViewport.angle = this.screenAngle || GameManager.sceneViewport.angle;
      GameManager.sceneViewport.anchor = this.screenAnchor || GameManager.sceneViewport.anchor;
      if ((ref = SceneManager.scene.viewport) != null) {
        ref.visual.scroll = this.screenScroll || SceneManager.scene.viewport.visual.scroll;
      }
      GameManager.sceneViewport.update();
    } else {
      if (GameManager.sceneViewport) {
        this.screenTone = Object.copy(GameManager.sceneViewport.tone);
        this.screenZoom = Object.copy(GameManager.sceneViewport.zoom);
        this.screenAngle = Object.copy(GameManager.sceneViewport.angle);
        this.screenAnchor = Object.copy(GameManager.sceneViewport.anchor);
      }
      if (SceneManager.scene.viewport) {
        this.screenScroll = Object.copy(SceneManager.scene.viewport.visual.scroll);
      }
    }
    window.$dataFields = this.dataFields;
    this.object.visible = visible;
    if ((ref1 = this.object.layout) != null) {
      ref1.update();
    }
    this.object.pictureContainer.behavior.setVisible(visible);
    this.object.hotspotContainer.behavior.setVisible(visible);
    this.object.textContainer.behavior.setVisible(visible);
    this.object.videoContainer.behavior.setVisible(visible);
    this.object.messageAreaContainer.behavior.setVisible(visible);
    this.object.viewportContainer.behavior.setVisible(visible);
    this.object.characterContainer.behavior.setVisible(visible);
    this.object.backgroundContainer.behavior.setVisible(visible);
    if ((ref2 = this.viewport) != null) {
      ref2.visible = visible;
    }
    if ((ref3 = this.object.choiceWindow) != null) {
      ref3.visible = visible;
    }
    if ((ref4 = this.object.inputNumberBox) != null) {
      ref4.visible = visible;
    }
    if ((ref5 = this.object.inputTextBox) != null) {
      ref5.visible = visible;
    }
    if ((ref6 = this.object.inputTextBox) != null) {
      ref6.update();
    }
    if ((ref7 = this.object.inputNumberBox) != null) {
      ref7.update();
    }
    if ((ref8 = this.object.choiceWindow) != null) {
      ref8.update();
    }
    GameManager.tempSettings.skip = false;
    return this.setupCommonEvents();
  };


  /**
  * Sets up common event handling.
  *
  * @method setupCommonEvents
   */

  Component_GameSceneBehavior.prototype.setupCommonEvents = function() {
    var commonEvents, event, i, j, k, len, len1, ref, ref1, ref2, ref3;
    commonEvents = (ref = this.object.sceneData) != null ? ref.commonEvents : void 0;
    if (commonEvents) {
      for (i = j = 0, len = commonEvents.length; j < len; i = ++j) {
        event = commonEvents[i];
        if (event && !this.object.commonEventContainer.subObjects.first(function(e) {
          return (e != null ? e.rid : void 0) === event.rid;
        })) {
          this.object.commonEventContainer.setObject(event, i);
          event.behavior.setupEventHandlers();
          if ((ref1 = event.interpreter) != null ? ref1.isRunning : void 0) {
            event.events.emit("start", event);
          }
        }
      }
    } else {
      ref2 = GameManager.commonEvents;
      for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
        event = ref2[i];
        if (event && (event.record.startCondition === 1 || event.record.parallel) && !this.object.commonEventContainer.subObjects.first(function(e) {
          return (e != null ? e.rid : void 0) === event.rid;
        })) {
          this.object.commonEventContainer.setObject(event, i);
          event.events.offByOwner("start", this.object);
          event.events.offByOwner("finish", this.object);
          if (!event.record.parallel) {
            event.events.on("start", gs.CallBack("onAutoCommonEventStart", this), null, this.object);
            event.events.on("finish", gs.CallBack("onAutoCommonEventFinish", this), null, this.object);
          }
          if ((ref3 = event.interpreter) != null ? ref3.isRunning : void 0) {
            event.events.emit("start", event);
          }
        }
      }
    }
    return null;
  };


  /**
  * Sets up main interpreter.
  *
  * @method setupInterpreter
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupInterpreter = function() {
    this.object.commands = this.object.sceneDocument.items.commands;
    if (this.object.sceneData.interpreter) {
      this.object.removeComponent(this.object.interpreter);
      this.object.interpreter = this.object.sceneData.interpreter;
      this.object.addComponent(this.object.interpreter);
      this.object.interpreter.context.set(this.object.sceneDocument.uid, this.object);
      return this.object.interpreter.object = this.object;
    } else {
      this.object.interpreter.setup();
      this.object.interpreter.context.set(this.object.sceneDocument.uid, this.object);
      return this.object.interpreter.start();
    }
  };


  /**
  * Sets up characters and restores them from loaded save game if necessary.
  *
  * @method setupCharacters
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupCharacters = function() {
    var c, i, j, len, ref;
    if (this.object.sceneData.characters != null) {
      ref = this.object.sceneData.characters;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        c = ref[i];
        this.object.characterContainer.setObject(c, i);
      }
    }
    return this.object.currentCharacter = this.object.sceneData.currentCharacter || {
      name: ""
    };
  };


  /**
  * Sets up viewports and restores them from loaded save game if necessary.
  *
  * @method setupViewports
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupViewports = function() {
    var i, j, len, ref, ref1, results, viewport, viewports;
    viewports = (ref = (ref1 = this.object.sceneData) != null ? ref1.viewports : void 0) != null ? ref : [];
    results = [];
    for (i = j = 0, len = viewports.length; j < len; i = ++j) {
      viewport = viewports[i];
      if (viewport) {
        results.push(this.object.viewportContainer.setObject(viewport, i));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up backgrounds and restores them from loaded save game if necessary.
  *
  * @method setupBackgrounds
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupBackgrounds = function() {
    var b, backgrounds, i, j, len, ref, ref1, results;
    backgrounds = (ref = (ref1 = this.object.sceneData) != null ? ref1.backgrounds : void 0) != null ? ref : [];
    results = [];
    for (i = j = 0, len = backgrounds.length; j < len; i = ++j) {
      b = backgrounds[i];
      results.push(this.object.backgroundContainer.setObject(b, i));
    }
    return results;
  };


  /**
  * Sets up pictures and restores them from loaded save game if necessary.
  *
  * @method setupPictures
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupPictures = function() {
    var domain, i, path, picture, pictures, ref, ref1, results;
    pictures = (ref = (ref1 = this.object.sceneData) != null ? ref1.pictures : void 0) != null ? ref : {};
    results = [];
    for (domain in pictures) {
      this.object.pictureContainer.behavior.changeDomain(domain);
      if (pictures[domain]) {
        results.push((function() {
          var j, len, ref2, ref3, results1;
          ref2 = pictures[domain];
          results1 = [];
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            picture = ref2[i];
            this.object.pictureContainer.setObject(picture, i);
            if (picture != null ? picture.image : void 0) {
              path = ((ref3 = picture.imageFolder) != null ? ref3 : "Graphics/Pictures") + "/" + picture.image;
              results1.push(this.resourceContext.add(path, ResourceManager.resourcesByPath[path]));
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up texts and restores them from loaded save game if necessary.
  *
  * @method setupTexts
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupTexts = function() {
    var domain, i, ref, ref1, results, text, texts;
    texts = (ref = (ref1 = this.object.sceneData) != null ? ref1.texts : void 0) != null ? ref : {};
    results = [];
    for (domain in texts) {
      this.object.textContainer.behavior.changeDomain(domain);
      if (texts[domain]) {
        results.push((function() {
          var j, len, ref2, results1;
          ref2 = texts[domain];
          results1 = [];
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            text = ref2[i];
            results1.push(this.object.textContainer.setObject(text, i));
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up videos and restores them from loaded save game if necessary.
  *
  * @method setupVideos
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupVideos = function() {
    var domain, i, path, ref, ref1, results, video, videos;
    videos = (ref = (ref1 = this.object.sceneData) != null ? ref1.videos : void 0) != null ? ref : {};
    results = [];
    for (domain in videos) {
      this.object.videoContainer.behavior.changeDomain(domain);
      if (videos[domain]) {
        results.push((function() {
          var j, len, ref2, ref3, results1;
          ref2 = videos[domain];
          results1 = [];
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            video = ref2[i];
            if (video) {
              path = ((ref3 = video.videoFolder) != null ? ref3 : "Movies") + "/" + video.video;
              this.resourceContext.add(path, ResourceManager.resourcesByPath[path]);
              video.visible = true;
              video.update();
            }
            results1.push(this.object.videoContainer.setObject(video, i));
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up hotspots and restores them from loaded save game if necessary.
  *
  * @method setupHotspots
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupHotspots = function() {
    var domain, hotspot, hotspots, i, ref, ref1, results;
    hotspots = (ref = (ref1 = this.object.sceneData) != null ? ref1.hotspots : void 0) != null ? ref : {};
    results = [];
    for (domain in hotspots) {
      this.object.hotspotContainer.behavior.changeDomain(domain);
      if (hotspots[domain]) {
        results.push((function() {
          var j, len, ref2, results1;
          ref2 = hotspots[domain];
          results1 = [];
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            hotspot = ref2[i];
            results1.push(this.object.hotspotContainer.setObject(hotspot, i));
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up layout.
  *
  * @method setupLayout
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupLayout = function() {
    var advVisible, ref, ref1;
    this.dataFields = ui.UIManager.dataSources[ui.UiFactory.layouts.gameLayout.dataSource || "default"]();
    this.dataFields.scene = this.object;
    window.$dataFields = this.dataFields;
    advVisible = this.object.messageMode === vn.MessageMode.ADV;
    this.object.layout = ui.UiFactory.createFromDescriptor(ui.UiFactory.layouts.gameLayout, this.object);
    this.object.layout.visible = advVisible;
    $gameMessage_message.visible = advVisible;
    this.object.layout.ui.prepare();
    this.object.choices = ((ref = this.object.sceneData) != null ? ref.choices : void 0) || this.object.choices;
    if (((ref1 = this.object.choices) != null ? ref1.length : void 0) > 0) {
      this.showChoices(gs.CallBack("onChoiceAccept", this.object.choices[0].interpreter || this.object.interpreter, {
        pointer: this.object.interpreter.pointer,
        params: this.params
      }));
    }
    if (this.object.interpreter.waitingFor.inputNumber) {
      this.showInputNumber(GameManager.tempFields.digits, gs.CallBack("onInputNumberFinish", this.object.interpreter, this.object.interpreter));
    }
    if (this.object.interpreter.waitingFor.inputText) {
      return this.showInputText(GameManager.tempFields.letters, gs.CallBack("onInputTextFinish", this.object.interpreter, this.object.interpreter));
    }
  };


  /**
  * Sets up the main viewport / screen viewport.
  *
  * @method setupMainViewport
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupMainViewport = function() {
    if (!this.object.sceneData.viewport) {
      if (SceneManager.previousScenes.length === 0) {
        GameManager.sceneViewport.dispose();
      }
      GameManager.sceneViewport = new gs.Object_Viewport(new Viewport(0, 0, Graphics.width, Graphics.height, Graphics.viewport));
      this.viewport = GameManager.sceneViewport.visual.viewport;
      return this.object.viewport = GameManager.sceneViewport;
    } else {
      GameManager.sceneViewport.dispose();
      GameManager.sceneViewport = this.object.sceneData.viewport;
      this.object.viewport = this.object.sceneData.viewport;
      this.viewport = this.object.viewport.visual.viewport;
      return this.viewport.viewport = Graphics.viewport;
    }
  };


  /**
  * Sets up screen.
  *
  * @method setupScreen
  * @protected
   */

  Component_GameSceneBehavior.prototype.setupScreen = function() {
    if (this.object.sceneData.screen) {
      return this.object.viewport.restore(this.object.sceneData.screen);
    }
  };


  /**
  * Restores main interpreter from loaded save game.
  *
  * @method restoreInterpreter
  * @protected
   */

  Component_GameSceneBehavior.prototype.restoreInterpreter = function() {
    if (this.object.sceneData.interpreter) {
      return this.object.interpreter.restore();
    }
  };


  /**
  * Restores message box from loaded save game.
  *
  * @method restoreMessageBox
  * @protected
   */

  Component_GameSceneBehavior.prototype.restoreMessageBox = function() {
    var c, j, k, len, len1, message, messageBox, messageBoxes, messageObject, ref, ref1, results;
    messageBoxes = (ref = this.object.sceneData) != null ? ref.messageBoxes : void 0;
    if (messageBoxes) {
      results = [];
      for (j = 0, len = messageBoxes.length; j < len; j++) {
        messageBox = messageBoxes[j];
        messageObject = gs.ObjectManager.current.objectById(messageBox.id);
        messageObject.visible = messageBox.visible;
        if (messageBox.message) {
          messageBox.message.textRenderer.disposeEventHandlers();
          message = gs.ObjectManager.current.objectById(messageBox.message.id);
          message.textRenderer.dispose();
          Object.mixin(message, messageBox.message, ui.Object_Message.objectCodecBlackList.concat(["origin"]));
          ref1 = message.components;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            c = ref1[k];
            c.object = message;
          }
          results.push(message.textRenderer.setupEventHandlers());
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };


  /**
  * Restores message from loaded save game.
  *
  * @method restoreMessages
  * @protected
   */

  Component_GameSceneBehavior.prototype.restoreMessages = function() {
    var area, c, domain, i, message, messageArea, messageAreas, messageLayout, ref, results;
    if ((ref = this.object.sceneData) != null ? ref.messageAreas : void 0) {
      results = [];
      for (domain in this.object.sceneData.messageAreas) {
        this.object.messageAreaContainer.behavior.changeDomain(domain);
        messageAreas = this.object.sceneData.messageAreas;
        if (messageAreas[domain]) {
          results.push((function() {
            var j, k, len, len1, ref1, ref2, results1;
            ref1 = messageAreas[domain];
            results1 = [];
            for (i = j = 0, len = ref1.length; j < len; i = ++j) {
              area = ref1[i];
              if (area) {
                messageArea = new gs.Object_MessageArea();
                messageLayout = ui.UIManager.createControlFromDescriptor({
                  type: "ui.CustomGameMessage",
                  id: "customGameMessage_" + i,
                  params: {
                    id: "customGameMessage_" + i
                  }
                }, messageArea);
                message = gs.ObjectManager.current.objectById("customGameMessage_" + i + "_message");
                area.message.textRenderer.disposeEventHandlers();
                message.textRenderer.dispose();
                Object.mixin(message, area.message);
                ref2 = message.components;
                for (k = 0, len1 = ref2.length; k < len1; k++) {
                  c = ref2[k];
                  c.object = message;
                }
                messageLayout.dstRect.x = area.layout.dstRect.x;
                messageLayout.dstRect.y = area.layout.dstRect.y;
                messageLayout.dstRect.width = area.layout.dstRect.width;
                messageLayout.dstRect.height = area.layout.dstRect.height;
                messageLayout.needsUpdate = true;
                message.textRenderer.setupEventHandlers();
                messageLayout.update();
                messageArea.message = message;
                messageArea.layout = messageLayout;
                messageArea.addObject(messageLayout);
                results1.push(this.object.messageAreaContainer.setObject(messageArea, i));
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }).call(this));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };


  /**
  * Restores audio-playback from loaded save game.
  *
  * @method restoreAudioPlayback
  * @protected
   */

  Component_GameSceneBehavior.prototype.restoreAudioPlayback = function() {
    var b, j, len, ref;
    if (this.object.sceneData.audio) {
      ref = this.object.sceneData.audio.audioBuffers;
      for (j = 0, len = ref.length; j < len; j++) {
        b = ref[j];
        AudioManager.audioBuffers.push(b);
      }
      AudioManager.audioBuffersByLayer = this.object.sceneData.audio.audioBuffersByLayer;
      AudioManager.audioLayers = this.object.sceneData.audio.audioLayers;
      return AudioManager.soundReferences = this.object.sceneData.audio.soundReferences;
    }
  };


  /**
  * Restores the scene objects from the current loaded save-game. If no save-game is
  * present in GameManager.loadedSaveGame, nothing will happen.
  *
  * @method restoreScene
  * @protected
   */

  Component_GameSceneBehavior.prototype.restoreScene = function() {
    var c, context, j, len, ref, ref1, saveGame;
    saveGame = GameManager.loadedSaveGame;
    if (saveGame) {
      context = new gs.ObjectCodecContext([Graphics.viewport, this.object, this], saveGame.encodedObjectStore, null);
      saveGame.data = gs.ObjectCodec.decode(saveGame.data, context);
      ref = saveGame.data.characterNames;
      for (j = 0, len = ref.length; j < len; j++) {
        c = ref[j];
        if (c) {
          if ((ref1 = RecordManager.characters[c.index]) != null) {
            ref1.name = c.name;
          }
        }
      }
      GameManager.restore(saveGame);
      gs.ObjectCodec.onRestore(saveGame.data, context);
      this.resourceContext.fromDataBundle(saveGame.data.resourceContext, ResourceManager.resourcesByPath);
      this.object.sceneData = saveGame.data;
      return Graphics.frameCount = saveGame.data.frameCount;
    }
  };


  /**
  * Prepares all data for the scene and loads the necessary graphic and audio resources.
  *
  * @method prepareData
  * @abstract
   */

  Component_GameSceneBehavior.prototype.prepareData = function() {
    var ref;
    if (!((ref = this.object.sceneDocument) != null ? ref.uid : void 0)) {
      return;
    }
    GameManager.scene = this.object;
    gs.ObjectManager.current = this.objectManager;
    this.object.sceneData.uid = this.object.sceneDocument.uid;
    if (!ResourceLoader.loadEventCommandsData(this.object.sceneDocument.items.commands)) {
      ResourceLoader.loadEventCommandsGraphics(this.object.sceneDocument.items.commands);
      GameManager.backlog = this.object.sceneData.backlog || GameManager.sceneData.backlog || [];
      ResourceLoader.loadSystemSounds();
      ResourceLoader.loadSystemGraphics();
      ResourceLoader.loadUiTypesGraphics(ui.UiFactory.customTypes);
      ResourceLoader.loadUiLayoutGraphics(ui.UiFactory.layouts.gameLayout);
      if (this.dataFields != null) {
        ResourceLoader.loadUiDataFieldsGraphics(this.dataFields);
      }
      $tempFields.choiceTimer = this.object.choiceTimer;
      return GameManager.variableStore.setup({
        id: this.object.sceneDocument.uid
      });
    }
  };


  /**
  * Prepares all visual game object for the scene.
  *
  * @method prepareVisual
   */

  Component_GameSceneBehavior.prototype.prepareVisual = function() {
    var ref;
    if (this.object.layout || !this.object.sceneDocument) {
      this.transition({
        duration: 0
      });
      return;
    }
    if (GameManager.tempFields.isExitingGame) {
      GameManager.tempFields.isExitingGame = false;
      gs.GameNotifier.postResetSceneChange(this.object.sceneDocument.items.name);
    } else {
      gs.GameNotifier.postSceneChange(this.object.sceneDocument.items.name);
    }
    this.restoreScene();
    this.object.messageMode = (ref = this.object.sceneData.messageMode) != null ? ref : vn.MessageMode.ADV;
    this.setupMainViewport();
    this.setupViewports();
    this.setupCharacters();
    this.setupBackgrounds();
    this.setupPictures();
    this.setupTexts();
    this.setupVideos();
    this.setupHotspots();
    this.setupInterpreter();
    this.setupLayout();
    this.setupCommonEvents();
    this.restoreMessageBox();
    this.restoreInterpreter();
    this.restoreMessages();
    this.restoreAudioPlayback();
    this.show(true);
    this.object.sceneData = {};
    GameManager.sceneData = {};
    Graphics.update();
    return this.transition({
      duration: 0
    });
  };


  /**
  * Adds a new character to the scene.
  *
  * @method addCharacter
  * @param {vn.Object_Character} character - The character to add.
  * @param {boolean} noAnimation - Indicates if the character should be added immediately witout any appear-animation.
  * @param {Object} animationData - Contains the appear-animation data -> { animation, easing, duration }.
   */

  Component_GameSceneBehavior.prototype.addCharacter = function(character, noAnimation, animationData) {
    if (!noAnimation) {
      character.motionBlur.set(animationData.motionBlur);
      if (animationData.duration > 0) {
        if (!noAnimation) {
          character.animator.appear(character.dstRect.x, character.dstRect.y, animationData.animation, animationData.easing, animationData.duration);
        }
      }
    }
    character.viewport = this.viewport;
    character.visible = true;
    return this.object.characterContainer.addObject(character);
  };


  /**
  * Removes a character from the scene.
  *
  * @method removeCharacter
  * @param {vn.Object_Character} character - The character to remove.
  * @param {boolean} noAnimation - Indicates if the character should be disposed immediately witout any disapear-animation.
  * @param {Object} animationData - Contains the disappear-animation data -> { animation, easing, duration }.
   */

  Component_GameSceneBehavior.prototype.removeCharacter = function(character, noAnimation, animationData) {
    if (!noAnimation) {
      return character != null ? character.animator.disappear(animationData.animation, animationData.easing, animationData.duration, function(sender) {
        return sender.dispose();
      }) : void 0;
    } else {
      return character != null ? character.dispose() : void 0;
    }
  };


  /**
  * Resumes the current scene if it has been paused.
  *
  * @method resumeScene
   */

  Component_GameSceneBehavior.prototype.resumeScene = function() {
    var message;
    this.object.pictureContainer.active = true;
    this.object.characterContainer.active = true;
    this.object.backgroundContainer.active = true;
    this.object.textContainer.active = true;
    this.object.hotspotContainer.active = true;
    this.object.videoContainer.active = true;
    message = gs.ObjectManager.current.objectById("gameMessage_message");
    return message.active = true;
  };


  /**
  * Pauses the current scene. A paused scene will not continue, messages, pictures, etc. will
  * stop until the scene resumes.
  *
  * @method pauseScene
   */

  Component_GameSceneBehavior.prototype.pauseScene = function() {
    var message;
    this.object.pictureContainer.active = false;
    this.object.characterContainer.active = false;
    this.object.backgroundContainer.active = false;
    this.object.textContainer.active = false;
    this.object.hotspotContainer.active = false;
    this.object.videoContainer.active = false;
    message = gs.ObjectManager.current.objectById("gameMessage_message");
    return message.active = false;
  };


  /**
  * Changes the visibility of the entire game UI like the message boxes, etc. to allows
  * the player to see the entire scene. Useful for CGs, etc.
  *
  * @param {boolean} visible - If <b>true</b>, the game UI will be visible. Otherwise it will be hidden.
  * @method changeUIVisibility
   */

  Component_GameSceneBehavior.prototype.changeUIVisibility = function(visible) {
    this.uiVisible = visible;
    return this.object.layout.visible = visible;
  };


  /**
  * Shows input-text box to let the user enter a text.
  *
  * @param {number} letters - The max. number of letters the user can enter.
  * @param {gs.Callback} callback - A callback function called if the input-text box has been accepted by the user.
  * @method showInputText
   */

  Component_GameSceneBehavior.prototype.showInputText = function(letters, callback) {
    var ref;
    if ((ref = this.object.inputTextBox) != null) {
      ref.dispose();
    }
    this.object.inputTextBox = ui.UiFactory.createControlFromDescriptor(ui.UiFactory.customTypes["ui.InputTextBox"], this.object.layout);
    this.object.inputTextBox.ui.prepare();
    return this.object.inputTextBox.events.on("accept", callback);
  };


  /**
  * Shows input-number box to let the user enter a number.
  *
  * @param {number} digits - The max. number of digits the user can enter.
  * @param {gs.Callback} callback - A callback function called if the input-number box has been accepted by the user.
  * @method showInputNumber
   */

  Component_GameSceneBehavior.prototype.showInputNumber = function(digits, callback) {
    var ref;
    if ((ref = this.object.inputNumberBox) != null) {
      ref.dispose();
    }
    this.object.inputNumberBox = ui.UiFactory.createControlFromDescriptor(ui.UiFactory.customTypes["ui.InputNumberBox"], this.object.layout);
    this.object.inputNumberBox.ui.prepare();
    return this.object.inputNumberBox.events.on("accept", callback);
  };


  /**
  * Shows choices to let the user pick a choice.
  *
  * @param {Object[]} choices - An array of choices
  * @param {gs.Callback} callback - A callback function called if a choice has been picked by the user.
  * @method showChoices
   */

  Component_GameSceneBehavior.prototype.showChoices = function(callback) {
    var ref, useFreeLayout;
    useFreeLayout = this.object.choices.where(function(x) {
      return x.dstRect != null;
    }).length > 0;
    if ((ref = this.object.choiceWindow) != null) {
      ref.dispose();
    }
    if (useFreeLayout) {
      this.object.choiceWindow = ui.UiFactory.createControlFromDescriptor(ui.UiFactory.customTypes["ui.FreeChoiceBox"], this.object.layout);
    } else {
      this.object.choiceWindow = ui.UiFactory.createControlFromDescriptor(ui.UiFactory.customTypes["ui.ChoiceBox"], this.object.layout);
    }
    this.object.choiceWindow.events.on("selectionAccept", callback);
    return this.object.choiceWindow.ui.prepare();
  };


  /**
  * Changes the background of the scene.
  *
  * @method changeBackground
  * @param {Object} background - The background graphic object -> { name }
  * @param {boolean} noAnimation - Indicates if the background should be changed immediately witout any change-animation.
  * @param {Object} animation - The appear/disappear animation to use.
  * @param {Object} easing - The easing of the change animation.
  * @param {number} duration - The duration of the change in frames.
  * @param {number} ox - The x-origin of the background.
  * @param {number} oy - The y-origin of the background.
  * @param {number} layer - The background-layer to change.
  * @param {boolean} loopHorizontal - Indicates if the background should be looped horizontally.
  * @param {boolean} loopVertical - Indicates if the background should be looped vertically.
   */

  Component_GameSceneBehavior.prototype.changeBackground = function(background, noAnimation, animation, easing, duration, ox, oy, layer, loopHorizontal, loopVertical) {
    var object, otherObject, ref, ref1;
    if (background != null) {
      otherObject = this.object.backgrounds[layer];
      object = new vn.Object_Background();
      object.image = background.name;
      object.imageFolder = background.folderPath;
      object.origin.x = ox;
      object.origin.y = oy;
      object.viewport = this.viewport;
      object.visual.looping.vertical = false;
      object.visual.looping.horizontal = false;
      object.update();
      this.object.backgroundContainer.setObject(object, layer);
      duration = duration != null ? duration : 30;
      if (otherObject != null) {
        otherObject.zIndex = layer;
      }
      if (otherObject != null) {
        if ((ref = otherObject.animator.otherObject) != null) {
          ref.dispose();
        }
      }
      if (duration === 0) {
        if (otherObject != null) {
          otherObject.dispose();
        }
        object.visual.looping.vertical = loopVertical;
        return object.visual.looping.horizontal = loopHorizontal;
      } else {
        if (noAnimation) {
          object.visual.looping.vertical = loopVertical;
          return object.visual.looping.horizontal = loopHorizontal;
        } else {
          object.animator.otherObject = otherObject;
          return object.animator.appear(0, 0, animation, easing, duration, (function(_this) {
            return function(sender) {
              var ref1;
              sender.update();
              if ((ref1 = sender.animator.otherObject) != null) {
                ref1.dispose();
              }
              sender.animator.otherObject = null;
              sender.visual.looping.vertical = loopVertical;
              return sender.visual.looping.horizontal = loopHorizontal;
            };
          })(this));
        }
      }
    } else {
      return (ref1 = this.object.backgrounds[layer]) != null ? ref1.animator.hide(duration, easing, (function(_this) {
        return function() {
          _this.object.backgrounds[layer].dispose();
          return _this.object.backgrounds[layer] = null;
        };
      })(this)) : void 0;
    }
  };


  /**
  * Skips all viewport animations except the main viewport animation.
  *
  * @method skipViewports
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipViewports = function() {
    var component, j, k, len, len1, ref, viewport, viewports;
    viewports = this.object.viewportContainer.subObjects;
    for (j = 0, len = viewports.length; j < len; j++) {
      viewport = viewports[j];
      if (viewport) {
        ref = viewport.components;
        for (k = 0, len1 = ref.length; k < len1; k++) {
          component = ref[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all picture animations.
  *
  * @method skipPictures
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipPictures = function() {
    var component, j, k, len, len1, picture, ref, ref1;
    ref = this.object.pictures;
    for (j = 0, len = ref.length; j < len; j++) {
      picture = ref[j];
      if (picture) {
        ref1 = picture.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all text animations.
  *
  * @method skipTexts
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipTexts = function() {
    var component, j, k, len, len1, ref, ref1, text;
    ref = this.object.texts;
    for (j = 0, len = ref.length; j < len; j++) {
      text = ref[j];
      if (text) {
        ref1 = text.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all video animations but not the video-playback itself.
  *
  * @method skipVideos
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipVideos = function() {
    var component, j, k, len, len1, ref, ref1, video;
    ref = this.object.videos;
    for (j = 0, len = ref.length; j < len; j++) {
      video = ref[j];
      if (video) {
        ref1 = video.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all background animations.
  *
  * @method skipBackgrounds
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipBackgrounds = function() {
    var background, component, j, k, len, len1, ref, ref1;
    ref = this.object.backgrounds;
    for (j = 0, len = ref.length; j < len; j++) {
      background = ref[j];
      if (background) {
        ref1 = background.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all character animations
  *
  * @method skipCharacters
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipCharacters = function() {
    var character, component, j, k, len, len1, ref, ref1;
    ref = this.object.characters;
    for (j = 0, len = ref.length; j < len; j++) {
      character = ref[j];
      if (character) {
        ref1 = character.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips the main viewport animation.
  *
  * @method skipMainViewport
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipMainViewport = function() {
    var component, j, len, ref;
    ref = this.object.viewport.components;
    for (j = 0, len = ref.length; j < len; j++) {
      component = ref[j];
      if (typeof component.skip === "function") {
        component.skip();
      }
    }
    return null;
  };


  /**
  * Skips all animations of all message boxes defined in MESSAGE_BOX_IDS ui constant.
  *
  * @method skipMessageBoxes
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipMessageBoxes = function() {
    var component, j, k, len, len1, messageBox, messageBoxId, ref, ref1;
    ref = gs.UIConstants.MESSAGE_BOX_IDS || ["messageBox", "nvlMessageBox"];
    for (j = 0, len = ref.length; j < len; j++) {
      messageBoxId = ref[j];
      messageBox = gs.ObjectManager.current.objectById(messageBoxId);
      if (messageBox.components) {
        ref1 = messageBox.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    return null;
  };


  /**
  * Skips all animations of all message areas.
  *
  * @method skipMessageAreas
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipMessageAreas = function() {
    var component, j, k, l, len, len1, len2, len3, m, messageArea, msg, ref, ref1, ref2, ref3;
    ref = this.object.messageAreas;
    for (j = 0, len = ref.length; j < len; j++) {
      messageArea = ref[j];
      if (messageArea != null ? messageArea.message : void 0) {
        ref1 = messageArea.message.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          if (typeof component.skip === "function") {
            component.skip();
          }
        }
      }
    }
    msg = gs.ObjectManager.current.objectById("gameMessage_message");
    if (msg) {
      ref2 = msg.components;
      for (l = 0, len2 = ref2.length; l < len2; l++) {
        component = ref2[l];
        if (typeof component.skip === "function") {
          component.skip();
        }
      }
    }
    msg = gs.ObjectManager.current.objectById("nvlGameMessage_message");
    if (msg) {
      ref3 = msg.components;
      for (m = 0, len3 = ref3.length; m < len3; m++) {
        component = ref3[m];
        if (typeof component.skip === "function") {
          component.skip();
        }
      }
    }
    return null;
  };


  /**
  * Skips the scene interpreter timer.
  *
  * @method skipInterpreter
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipInterpreter = function() {
    if (this.object.interpreter.waitCounter > GameManager.tempSettings.skipTime) {
      this.object.interpreter.waitCounter = GameManager.tempSettings.skipTime;
      if (this.object.interpreter.waitCounter === 0) {
        return this.object.interpreter.isWaiting = false;
      }
    }
  };


  /**
  * Skips the interpreter timer of all common events.
  *
  * @method skipCommonEvents
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipCommonEvents = function() {
    var event, events, j, len, results;
    events = this.object.commonEventContainer.subObjects;
    results = [];
    for (j = 0, len = events.length; j < len; j++) {
      event = events[j];
      if ((event != null ? event.interpreter : void 0) && event.interpreter.waitCounter > GameManager.tempSettings.skipTime) {
        event.interpreter.waitCounter = GameManager.tempSettings.skipTime;
        if (event.interpreter.waitCounter === 0) {
          results.push(event.interpreter.isWaiting = false);
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
  * Skips the scene's content.
  *
  * @method skipContent
  * @protected
   */

  Component_GameSceneBehavior.prototype.skipContent = function() {
    this.skipPictures();
    this.skipTexts();
    this.skipVideos();
    this.skipBackgrounds();
    this.skipCharacters();
    this.skipMainViewport();
    this.skipViewports();
    this.skipMessageBoxes();
    this.skipMessageAreas();
    this.skipInterpreter();
    return this.skipCommonEvents();
  };


  /**
  * Checks for the shortcut to hide/show the game UI. By default, this is the space-key. You
  * can override this method to change the shortcut.
  *
  * @method updateUIVisibilityShortcut
  * @protected
   */

  Component_GameSceneBehavior.prototype.updateUIVisibilityShortcut = function() {
    if (!this.uiVisible && (Input.trigger(Input.C) || Input.Mouse.buttonDown)) {
      this.changeUIVisibility(!this.uiVisible);
    }
    if (Input.trigger(Input.KEY_SPACE)) {
      return this.changeUIVisibility(!this.uiVisible);
    }
  };


  /**
  * Checks for the shortcut to exit the game. By default, this is the escape-key. You
  * can override this method to change the shortcut.
  *
  * @method updateQuitShortcut
  * @protected
   */

  Component_GameSceneBehavior.prototype.updateQuitShortcut = function() {
    if (Input.trigger(Input.KEY_ESCAPE)) {
      return gs.Application.exit();
    }
  };


  /**
  * Checks for the shortcut to open the settings menu. By default, this is the s-key. You
  * can override this method to change the shortcut.
  *
  * @method updateSettingsShortcut
  * @protected
   */

  Component_GameSceneBehavior.prototype.updateSettingsShortcut = function() {
    if (GameManager.tempSettings.menuAccess && Input.trigger(Input.X)) {
      return SceneManager.switchTo(new gs.Object_Layout("settingsMenuLayout"), true);
    }
  };


  /**
  * Checks for the shortcut to open the settings menu. By default, this is the control-key. You
  * can override this method to change the shortcut.
  *
  * @method updateSkipShortcut
  * @protected
   */

  Component_GameSceneBehavior.prototype.updateSkipShortcut = function() {
    if (this.object.settings.allowSkip) {
      if (Input.keys[Input.KEY_CONTROL] === 1) {
        return GameManager.tempSettings.skip = true;
      } else if (Input.keys[Input.KEY_CONTROL] === 2) {
        return GameManager.tempSettings.skip = false;
      }
    }
  };


  /**
  * Checks for default keyboard shortcuts e.g space-key to hide the UI, etc.
  *
  * @method updateShortcuts
  * @protected
   */

  Component_GameSceneBehavior.prototype.updateShortcuts = function() {
    if (!this.object.canReceiveInput()) {
      return;
    }
    this.updateSettingsShortcut();
    this.updateQuitShortcut();
    this.updateUIVisibilityShortcut();
    return this.updateSkipShortcut();
  };


  /**
  * Updates the full screen video played via Play Movie command.
  *
  * @method updateVideo
   */

  Component_GameSceneBehavior.prototype.updateVideo = function() {
    if (this.object.video != null) {
      this.object.video.update();
      if (this.object.settings.allowVideoSkip && (Input.trigger(Input.C) || Input.Mouse.buttons[Input.Mouse.LEFT] === 2)) {
        this.object.video.stop();
      }
      return Input.clear();
    }
  };


  /**
  * Updates skipping if enabled.
  *
  * @method updateSkipping
   */

  Component_GameSceneBehavior.prototype.updateSkipping = function() {
    if (!this.object.settings.allowSkip) {
      this.object.tempSettings.skip = false;
    }
    if (GameManager.tempSettings.skip) {
      return this.skipContent();
    }
  };


  /**
  * Updates the scene's content.
  *
  * @method updateContent
   */

  Component_GameSceneBehavior.prototype.updateContent = function() {
    if (this.object.sceneDocument == null) {
      return;
    }
    GameManager.scene = this.object;
    Graphics.viewport.update();
    this.object.viewport.update();
    this.updateSkipping();
    this.updateVideo();
    this.updateShortcuts();
    return Component_GameSceneBehavior.__super__.updateContent.call(this);
  };

  return Component_GameSceneBehavior;

})(gs.Component_LayoutSceneBehavior);

vn.Component_GameSceneBehavior = Component_GameSceneBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsMkJBQUE7RUFBQTs7O0FBQU07Ozs7QUFFRjs7Ozs7Ozs7O0VBUWEscUNBQUE7SUFDVCwyREFBQTtJQUVBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDdEIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQXdCLEtBQUMsQ0FBQSxNQUFNLENBQUMsV0FBaEM7ZUFDQSxLQUFDLENBQUEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFwQixDQUFBO01BRnNCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQUcxQixJQUFDLENBQUEsdUJBQUQsR0FBMkIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO1FBQ3ZCLElBQUcsQ0FBQyxLQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFuQixDQUE0QixLQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDLENBQUo7VUFDSSxLQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxXQUE3QixFQURKOztlQUVBLEtBQUMsQ0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQXBCLENBQUE7TUFIdUI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBSzNCLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBQ25CLElBQUMsQ0FBQSxZQUFELEdBQWdCO0VBWlA7OztBQWNiOzs7Ozs7d0NBS0EsVUFBQSxHQUFZLFNBQUE7QUFDUixRQUFBO0lBQUEsSUFBRyxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQTVCLEtBQXNDLENBQXpDO01BQ0ksRUFBRSxDQUFDLGtCQUFrQixDQUFDLFdBQXRCLENBQWtDLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBL0QsRUFESjs7SUFHQSxJQUFDLENBQUEsZUFBRCxHQUFtQixlQUFlLENBQUMsYUFBaEIsQ0FB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RyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFqQixJQUFvQyxDQUFDLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLENBQXBCLENBQUEsSUFBMEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFaLENBQXBCLEtBQXlDLENBQXBFLENBQXZDO1FBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBZCxDQUFBLEVBREo7O2FBRUEsS0FBSyxDQUFDLEtBQU4sQ0FBQSxFQUpKOztFQURTOzs7QUFPYjs7Ozs7O3dDQUtBLGNBQUEsR0FBZ0IsU0FBQTtJQUNaLElBQUcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFyQjtNQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQXJCLEdBQTRCLE1BRGhDOztJQUdBLElBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUE1QjthQUNJLElBQUMsQ0FBQSxXQUFELENBQUEsRUFESjs7RUFKWTs7O0FBT2hCOzs7Ozs7d0NBS0EsYUFBQSxHQUFlLFNBQUE7SUFDWCxJQUFjLGlDQUFkO0FBQUEsYUFBQTs7SUFHQSxXQUFXLENBQUMsS0FBWixHQUFvQixJQUFDLENBQUE7SUFDckIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFsQixDQUFBO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBakIsQ0FBQTtJQUVBLElBQUMsQ0FBQSxjQUFELENBQUE7SUFDQSxJQUFDLENBQUEsV0FBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBQTtXQUVBLDZEQUFBO0VBWlc7Ozs7R0F4K0J1QixFQUFFLENBQUM7O0FBcy9CN0MsRUFBRSxDQUFDLDJCQUFILEdBQWlDIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfR2FtZVNjZW5lQmVoYXZpb3JcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9HYW1lU2NlbmVCZWhhdmlvciBleHRlbmRzIGdzLkNvbXBvbmVudF9MYXlvdXRTY2VuZUJlaGF2aW9yXG4gIyAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcIm9iamVjdE1hbmFnZXJcIl1cbiAgICAjIyMqXG4gICAgKiBEZWZpbmVzIHRoZSBiZWhhdmlvciBvZiB2aXN1YWwgbm92ZWwgZ2FtZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIHZuXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRfTGF5b3V0U2NlbmVCZWhhdmlvclxuICAgICogQG1lbWJlcm9mIHZuXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIHN1cGVyKClcblxuICAgICAgICBAb25BdXRvQ29tbW9uRXZlbnRTdGFydCA9ID0+XG4gICAgICAgICAgICBAb2JqZWN0LnJlbW92ZUNvbXBvbmVudChAb2JqZWN0LmludGVycHJldGVyKVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5zdG9wKClcbiAgICAgICAgQG9uQXV0b0NvbW1vbkV2ZW50RmluaXNoID0gPT5cbiAgICAgICAgICAgIGlmICFAb2JqZWN0LmNvbXBvbmVudHMuY29udGFpbnMoQG9iamVjdC5pbnRlcnByZXRlcilcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAb2JqZWN0LmludGVycHJldGVyKVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5yZXN1bWUoKVxuXG4gICAgICAgIEByZXNvdXJjZUNvbnRleHQgPSBudWxsXG4gICAgICAgIEBvYmplY3REb21haW4gPSBcIlwiXG5cbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBpbml0aWFsaXplXG4gICAgIyMjXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgaWYgU2NlbmVNYW5hZ2VyLnByZXZpb3VzU2NlbmVzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuY2xlYXJFeGNlcHQoQG9iamVjdC5jb21tb25FdmVudENvbnRhaW5lci5zdWJPYmplY3RzKVxuXG4gICAgICAgIEByZXNvdXJjZUNvbnRleHQgPSBSZXNvdXJjZU1hbmFnZXIuY3JlYXRlQ29udGV4dCgpXG4gICAgICAgIFJlc291cmNlTWFuYWdlci5jb250ZXh0ID0gQHJlc291cmNlQ29udGV4dFxuXG4gICAgICAgIEdyYXBoaWNzLmZyZWV6ZSgpXG4gICAgICAgIHNhdmVHYW1lID0gR2FtZU1hbmFnZXIubG9hZGVkU2F2ZUdhbWVcbiAgICAgICAgc2NlbmVVaWQgPSBudWxsXG5cbiAgICAgICAgaWYgc2F2ZUdhbWVcbiAgICAgICAgICAgIHNjZW5lVWlkID0gc2F2ZUdhbWUuc2NlbmVVaWRcbiAgICAgICAgICAgIEBvYmplY3Quc2NlbmVEYXRhID0gc2F2ZUdhbWUuZGF0YVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzY2VuZVVpZCA9ICRQQVJBTVMucHJldmlldz8uc2NlbmUudWlkIHx8IEBvYmplY3Quc2NlbmVEYXRhLnVpZCB8fCBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5zdGFydEluZm8uc2NlbmUudWlkXG5cbiAgICAgICAgQG9iamVjdC5zY2VuZURvY3VtZW50ID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoc2NlbmVVaWQpXG5cbiAgICAgICAgaWYgQG9iamVjdC5zY2VuZURvY3VtZW50IGFuZCBAb2JqZWN0LnNjZW5lRG9jdW1lbnQuaXRlbXMudHlwZSA9PSBcInZuLnNjZW5lXCJcbiAgICAgICAgICAgIEBvYmplY3QuY2hhcHRlciA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50KEBvYmplY3Quc2NlbmVEb2N1bWVudC5pdGVtcy5jaGFwdGVyVWlkKVxuICAgICAgICAgICAgQG9iamVjdC5jdXJyZW50Q2hhcmFjdGVyID0geyBcIm5hbWVcIjogXCJcIiB9ICNSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNbMF1cblxuICAgICAgICAgICAgaWYgbm90IEdhbWVNYW5hZ2VyLmluaXRpYWxpemVkXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuaW5pdGlhbGl6ZSgpXG4gICAgICAgICAgICBHYW1lTWFuYWdlci5wcmVsb2FkQ29tbW9uRXZlbnRzKClcblxuICAgICAgICAgICAgTGFuZ3VhZ2VNYW5hZ2VyLmxvYWRCdW5kbGVzKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3ByaXRlID0gbmV3IGdzLlNwcml0ZSgpXG4gICAgICAgICAgICBzcHJpdGUuYml0bWFwID0gbmV3IGdzLkJpdG1hcChHcmFwaGljcy53aWR0aCwgNTApXG4gICAgICAgICAgICBzcHJpdGUuYml0bWFwLmRyYXdUZXh0KDAsIDAsIEdyYXBoaWNzLndpZHRoLCA1MCwgXCJObyBTdGFydCBTY2VuZSBzZWxlY3RlZFwiLCAxLCAwKVxuICAgICAgICAgICAgc3ByaXRlLnNyY1JlY3QgPSBuZXcgZ3MuUmVjdCgwLCAwLCBHcmFwaGljcy53aWR0aCwgNTApXG4gICAgICAgICAgICBzcHJpdGUueSA9IChHcmFwaGljcy5oZWlnaHQgLSA1MCkgLyAyXG4gICAgICAgICAgICBzcHJpdGUueiA9IDEwMDAwXG5cbiAgICAgICAgQHNldHVwU2NyZWVuKClcblxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyNcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBSZXNvdXJjZU1hbmFnZXIuY29udGV4dCA9IEByZXNvdXJjZUNvbnRleHRcbiAgICAgICAgQG9iamVjdC5yZW1vdmVPYmplY3QoQG9iamVjdC5jb21tb25FdmVudENvbnRhaW5lcilcbiAgICAgICAgQHNob3cobm8pXG4gICAgICAgIEBvYmplY3Qudmlld3BvcnQ/LmRpc3Bvc2UoKVxuXG4gICAgICAgIGZvciBldmVudCBpbiBHYW1lTWFuYWdlci5jb21tb25FdmVudHNcbiAgICAgICAgICAgIGlmIGV2ZW50XG4gICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRzLm9mZkJ5T3duZXIoXCJzdGFydFwiLCBAb2JqZWN0KVxuICAgICAgICAgICAgICAgIGV2ZW50LmV2ZW50cy5vZmZCeU93bmVyKFwiZmluaXNoXCIsIEBvYmplY3QpXG5cbiAgICAgICAgaWYgQG9iamVjdC52aWRlb1xuICAgICAgICAgICAgQG9iamVjdC52aWRlby5kaXNwb3NlKClcbiAgICAgICAgICAgIEBvYmplY3QudmlkZW8ub25FbmRlZCgpXG5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgY2hhbmdlUGljdHVyZURvbWFpbjogKGRvbWFpbikgLT5cbiAgICAgICAgQG9iamVjdC5waWN0dXJlQ29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgIEBvYmplY3QucGljdHVyZXMgPSBAb2JqZWN0LnBpY3R1cmVDb250YWluZXIuc3ViT2JqZWN0c1xuICAgIGNoYW5nZVRleHREb21haW46IChkb21haW4pIC0+XG4gICAgICAgIEBvYmplY3QudGV4dENvbnRhaW5lci5iZWhhdmlvci5jaGFuZ2VEb21haW4oZG9tYWluKVxuICAgICAgICBAb2JqZWN0LnRleHRzID0gQG9iamVjdC50ZXh0Q29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICBjaGFuZ2VWaWRlb0RvbWFpbjogKGRvbWFpbikgLT5cbiAgICAgICAgQG9iamVjdC52aWRlb0NvbnRhaW5lci5iZWhhdmlvci5jaGFuZ2VEb21haW4oZG9tYWluKVxuICAgICAgICBAb2JqZWN0LnZpZGVvcyA9IEBvYmplY3QudmlkZW9Db250YWluZXIuc3ViT2JqZWN0c1xuICAgIGNoYW5nZUhvdHNwb3REb21haW46IChkb21haW4pIC0+XG4gICAgICAgIEBvYmplY3QuaG90c3BvdENvbnRhaW5lci5iZWhhdmlvci5jaGFuZ2VEb21haW4oZG9tYWluKVxuICAgICAgICBAb2JqZWN0LmhvdHNwb3RzID0gQG9iamVjdC5ob3RzcG90Q29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICBjaGFuZ2VNZXNzYWdlQXJlYURvbWFpbjogKGRvbWFpbikgLT5cbiAgICAgICAgQG9iamVjdC5tZXNzYWdlQXJlYUNvbnRhaW5lci5iZWhhdmlvci5jaGFuZ2VEb21haW4oZG9tYWluKVxuICAgICAgICBAb2JqZWN0Lm1lc3NhZ2VBcmVhcyA9IEBvYmplY3QubWVzc2FnZUFyZWFDb250YWluZXIuc3ViT2JqZWN0c1xuXG4gICAgIyMjKlxuICAgICogU2hvd3MvSGlkZXMgdGhlIGN1cnJlbnQgc2NlbmUuIEEgaGlkZGVuIHNjZW5lIGlzIG5vIGxvbmdlciBzaG93biBhbmQgZXhlY3V0ZWRcbiAgICAqIGJ1dCBhbGwgb2JqZWN0cyBhbmQgZGF0YSBpcyBzdGlsbCB0aGVyZSBhbmQgYmUgc2hvd24gYWdhaW4gYW55dGltZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNob3dcbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmlzaWJsZSAtIEluZGljYXRlcyBpZiB0aGUgc2NlbmUgc2hvdWxkIGJlIHNob3duIG9yIGhpZGRlbi5cbiAgICAjIyNcbiAgICBzaG93OiAodmlzaWJsZSkgLT5cbiAgICAgICAgaWYgdmlzaWJsZVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydCA9IEBvYmplY3Qudmlld3BvcnRcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQudG9uZSA9IEBzY3JlZW5Ub25lIHx8IEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQudG9uZVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC56b29tID0gQHNjcmVlblpvb20gfHwgR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC56b29tXG4gICAgICAgICAgICBHYW1lTWFuYWdlci5zY2VuZVZpZXdwb3J0LmFuZ2xlID0gQHNjcmVlbkFuZ2xlIHx8IEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQuYW5nbGVcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQuYW5jaG9yID0gQHNjcmVlbkFuY2hvciB8fCBHYW1lTWFuYWdlci5zY2VuZVZpZXdwb3J0LmFuY2hvclxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0Py52aXN1YWwuc2Nyb2xsID0gQHNjcmVlblNjcm9sbCB8fCBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQudmlzdWFsLnNjcm9sbFxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC51cGRhdGUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBHYW1lTWFuYWdlci5zY2VuZVZpZXdwb3J0XG4gICAgICAgICAgICAgICAgQHNjcmVlblRvbmUgPSBPYmplY3QuY29weShHYW1lTWFuYWdlci5zY2VuZVZpZXdwb3J0LnRvbmUpXG4gICAgICAgICAgICAgICAgQHNjcmVlblpvb20gPSBPYmplY3QuY29weShHYW1lTWFuYWdlci5zY2VuZVZpZXdwb3J0Lnpvb20pXG4gICAgICAgICAgICAgICAgQHNjcmVlbkFuZ2xlID0gT2JqZWN0LmNvcHkoR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC5hbmdsZSlcbiAgICAgICAgICAgICAgICBAc2NyZWVuQW5jaG9yID0gT2JqZWN0LmNvcHkoR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC5hbmNob3IpXG4gICAgICAgICAgICBpZiBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnRcbiAgICAgICAgICAgICAgICBAc2NyZWVuU2Nyb2xsID0gT2JqZWN0LmNvcHkoU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LnZpc3VhbC5zY3JvbGwpXG5cbiAgICAgICAgd2luZG93LiRkYXRhRmllbGRzID0gQGRhdGFGaWVsZHNcbiAgICAgICAgQG9iamVjdC52aXNpYmxlID0gdmlzaWJsZVxuXG4gICAgICAgIEBvYmplY3QubGF5b3V0Py51cGRhdGUoKVxuXG4gICAgICAgIEBvYmplY3QucGljdHVyZUNvbnRhaW5lci5iZWhhdmlvci5zZXRWaXNpYmxlKHZpc2libGUpXG4gICAgICAgIEBvYmplY3QuaG90c3BvdENvbnRhaW5lci5iZWhhdmlvci5zZXRWaXNpYmxlKHZpc2libGUpXG4gICAgICAgIEBvYmplY3QudGV4dENvbnRhaW5lci5iZWhhdmlvci5zZXRWaXNpYmxlKHZpc2libGUpXG4gICAgICAgIEBvYmplY3QudmlkZW9Db250YWluZXIuYmVoYXZpb3Iuc2V0VmlzaWJsZSh2aXNpYmxlKVxuICAgICAgICBAb2JqZWN0Lm1lc3NhZ2VBcmVhQ29udGFpbmVyLmJlaGF2aW9yLnNldFZpc2libGUodmlzaWJsZSlcbiAgICAgICAgQG9iamVjdC52aWV3cG9ydENvbnRhaW5lci5iZWhhdmlvci5zZXRWaXNpYmxlKHZpc2libGUpXG4gICAgICAgIEBvYmplY3QuY2hhcmFjdGVyQ29udGFpbmVyLmJlaGF2aW9yLnNldFZpc2libGUodmlzaWJsZSlcbiAgICAgICAgQG9iamVjdC5iYWNrZ3JvdW5kQ29udGFpbmVyLmJlaGF2aW9yLnNldFZpc2libGUodmlzaWJsZSlcblxuICAgICAgICBAdmlld3BvcnQ/LnZpc2libGUgPSB2aXNpYmxlXG4gICAgICAgIEBvYmplY3QuY2hvaWNlV2luZG93Py52aXNpYmxlID0gdmlzaWJsZVxuICAgICAgICBAb2JqZWN0LmlucHV0TnVtYmVyQm94Py52aXNpYmxlID0gdmlzaWJsZVxuICAgICAgICBAb2JqZWN0LmlucHV0VGV4dEJveD8udmlzaWJsZSA9IHZpc2libGVcbiAgICAgICAgQG9iamVjdC5pbnB1dFRleHRCb3g/LnVwZGF0ZSgpXG4gICAgICAgIEBvYmplY3QuaW5wdXROdW1iZXJCb3g/LnVwZGF0ZSgpXG4gICAgICAgIEBvYmplY3QuY2hvaWNlV2luZG93Py51cGRhdGUoKVxuXG4gICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwID0gbm9cblxuICAgICAgICAjaWYgdmlzaWJsZSBhbmQgQG9iamVjdC5jb21tb25FdmVudENvbnRhaW5lci5zdWJPYmplY3RzLmxlbmd0aCA9PSAwXG4gICAgICAgIEBzZXR1cENvbW1vbkV2ZW50cygpXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIGNvbW1vbiBldmVudCBoYW5kbGluZy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwQ29tbW9uRXZlbnRzXG4gICAgIyMjXG4gICAgc2V0dXBDb21tb25FdmVudHM6IC0+XG4gICAgICAgIGNvbW1vbkV2ZW50cyA9IEBvYmplY3Quc2NlbmVEYXRhPy5jb21tb25FdmVudHNcblxuICAgICAgICBpZiBjb21tb25FdmVudHNcbiAgICAgICAgICAgIGZvciBldmVudCwgaSBpbiBjb21tb25FdmVudHNcbiAgICAgICAgICAgICAgICBpZiBldmVudCBhbmQgIUBvYmplY3QuY29tbW9uRXZlbnRDb250YWluZXIuc3ViT2JqZWN0cy5maXJzdCgoZSkgLT4gZT8ucmlkID09IGV2ZW50LnJpZClcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5jb21tb25FdmVudENvbnRhaW5lci5zZXRPYmplY3QoZXZlbnQsIGkpXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmJlaGF2aW9yLnNldHVwRXZlbnRIYW5kbGVycygpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgZXZlbnQuaW50ZXJwcmV0ZXI/LmlzUnVubmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRzLmVtaXQoXCJzdGFydFwiLCBldmVudClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZm9yIGV2ZW50LCBpIGluIEdhbWVNYW5hZ2VyLmNvbW1vbkV2ZW50c1xuICAgICAgICAgICAgICAgIGlmIGV2ZW50IGFuZCAoZXZlbnQucmVjb3JkLnN0YXJ0Q29uZGl0aW9uID09IDEgb3IgZXZlbnQucmVjb3JkLnBhcmFsbGVsKSBhbmQgIUBvYmplY3QuY29tbW9uRXZlbnRDb250YWluZXIuc3ViT2JqZWN0cy5maXJzdCgoZSkgLT4gZT8ucmlkID09IGV2ZW50LnJpZClcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5jb21tb25FdmVudENvbnRhaW5lci5zZXRPYmplY3QoZXZlbnQsIGkpXG5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRzLm9mZkJ5T3duZXIoXCJzdGFydFwiLCBAb2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICBldmVudC5ldmVudHMub2ZmQnlPd25lcihcImZpbmlzaFwiLCBAb2JqZWN0KVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBldmVudC5yZWNvcmQucGFyYWxsZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmV2ZW50cy5vbiBcInN0YXJ0XCIsIGdzLkNhbGxCYWNrKFwib25BdXRvQ29tbW9uRXZlbnRTdGFydFwiLCB0aGlzKSwgbnVsbCwgQG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRzLm9uIFwiZmluaXNoXCIsIGdzLkNhbGxCYWNrKFwib25BdXRvQ29tbW9uRXZlbnRGaW5pc2hcIiwgdGhpcyksIG51bGwsIEBvYmplY3RcblxuICAgICAgICAgICAgICAgICAgICBpZiBldmVudC5pbnRlcnByZXRlcj8uaXNSdW5uaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5ldmVudHMuZW1pdChcInN0YXJ0XCIsIGV2ZW50KVxuXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIG1haW4gaW50ZXJwcmV0ZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEludGVycHJldGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgc2V0dXBJbnRlcnByZXRlcjogLT5cbiAgICAgICAgQG9iamVjdC5jb21tYW5kcyA9IEBvYmplY3Quc2NlbmVEb2N1bWVudC5pdGVtcy5jb21tYW5kc1xuXG4gICAgICAgIGlmIEBvYmplY3Quc2NlbmVEYXRhLmludGVycHJldGVyXG4gICAgICAgICAgICBAb2JqZWN0LnJlbW92ZUNvbXBvbmVudChAb2JqZWN0LmludGVycHJldGVyKVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlciA9IEBvYmplY3Quc2NlbmVEYXRhLmludGVycHJldGVyXG4gICAgICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAb2JqZWN0LmludGVycHJldGVyKVxuICAgICAgICAgICAgI09iamVjdC5taXhpbihAb2JqZWN0LmludGVycHJldGVyLCBAb2JqZWN0LnNjZW5lRGF0YS5pbnRlcnByZXRlciwgZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlci5vYmplY3RDb2RlY0JsYWNrTGlzdClcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuY29udGV4dC5zZXQoQG9iamVjdC5zY2VuZURvY3VtZW50LnVpZCwgQG9iamVjdClcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIub2JqZWN0ID0gQG9iamVjdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb2JqZWN0LmludGVycHJldGVyLnNldHVwKClcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuY29udGV4dC5zZXQoQG9iamVjdC5zY2VuZURvY3VtZW50LnVpZCwgQG9iamVjdClcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIuc3RhcnQoKVxuXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIGNoYXJhY3RlcnMgYW5kIHJlc3RvcmVzIHRoZW0gZnJvbSBsb2FkZWQgc2F2ZSBnYW1lIGlmIG5lY2Vzc2FyeS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwQ2hhcmFjdGVyc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIHNldHVwQ2hhcmFjdGVyczogLT5cbiAgICAgICAgaWYgQG9iamVjdC5zY2VuZURhdGEuY2hhcmFjdGVycz9cbiAgICAgICAgICAgIGZvciBjLCBpIGluIEBvYmplY3Quc2NlbmVEYXRhLmNoYXJhY3RlcnNcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmNoYXJhY3RlckNvbnRhaW5lci5zZXRPYmplY3QoYywgaSlcblxuICAgICAgICBAb2JqZWN0LmN1cnJlbnRDaGFyYWN0ZXIgPSBAb2JqZWN0LnNjZW5lRGF0YS5jdXJyZW50Q2hhcmFjdGVyIHx8IHsgbmFtZTogXCJcIiB9I1JlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1swXVxuXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHZpZXdwb3J0cyBhbmQgcmVzdG9yZXMgdGhlbSBmcm9tIGxvYWRlZCBzYXZlIGdhbWUgaWYgbmVjZXNzYXJ5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBWaWV3cG9ydHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBzZXR1cFZpZXdwb3J0czogLT5cbiAgICAgICAgdmlld3BvcnRzID0gQG9iamVjdC5zY2VuZURhdGE/LnZpZXdwb3J0cyA/IFtdXG4gICAgICAgIGZvciB2aWV3cG9ydCwgaSBpbiB2aWV3cG9ydHNcbiAgICAgICAgICAgIGlmIHZpZXdwb3J0XG4gICAgICAgICAgICAgICAgQG9iamVjdC52aWV3cG9ydENvbnRhaW5lci5zZXRPYmplY3Qodmlld3BvcnQsIGkpXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBiYWNrZ3JvdW5kcyBhbmQgcmVzdG9yZXMgdGhlbSBmcm9tIGxvYWRlZCBzYXZlIGdhbWUgaWYgbmVjZXNzYXJ5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBCYWNrZ3JvdW5kc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIHNldHVwQmFja2dyb3VuZHM6IC0+XG4gICAgICAgIGJhY2tncm91bmRzID0gQG9iamVjdC5zY2VuZURhdGE/LmJhY2tncm91bmRzID8gW11cbiAgICAgICAgZm9yIGIsIGkgaW4gYmFja2dyb3VuZHNcbiAgICAgICAgICAgIEBvYmplY3QuYmFja2dyb3VuZENvbnRhaW5lci5zZXRPYmplY3QoYiwgaSlcblxuICAgICMjIypcbiAgICAqIFNldHMgdXAgcGljdHVyZXMgYW5kIHJlc3RvcmVzIHRoZW0gZnJvbSBsb2FkZWQgc2F2ZSBnYW1lIGlmIG5lY2Vzc2FyeS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwUGljdHVyZXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBzZXR1cFBpY3R1cmVzOiAtPlxuICAgICAgICBwaWN0dXJlcyA9IEBvYmplY3Quc2NlbmVEYXRhPy5waWN0dXJlcyA/IHt9XG4gICAgICAgIGZvciBkb21haW4gb2YgcGljdHVyZXNcbiAgICAgICAgICAgIEBvYmplY3QucGljdHVyZUNvbnRhaW5lci5iZWhhdmlvci5jaGFuZ2VEb21haW4oZG9tYWluKVxuICAgICAgICAgICAgaWYgcGljdHVyZXNbZG9tYWluXSB0aGVuIGZvciBwaWN0dXJlLCBpIGluIHBpY3R1cmVzW2RvbWFpbl1cbiAgICAgICAgICAgICAgICBAb2JqZWN0LnBpY3R1cmVDb250YWluZXIuc2V0T2JqZWN0KHBpY3R1cmUsIGkpXG4gICAgICAgICAgICAgICAgaWYgcGljdHVyZT8uaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFwiI3twaWN0dXJlLmltYWdlRm9sZGVyID8gXCJHcmFwaGljcy9QaWN0dXJlc1wifS8je3BpY3R1cmUuaW1hZ2V9XCJcbiAgICAgICAgICAgICAgICAgICAgQHJlc291cmNlQ29udGV4dC5hZGQocGF0aCwgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc0J5UGF0aFtwYXRoXSlcblxuICAgICMjIypcbiAgICAqIFNldHMgdXAgdGV4dHMgYW5kIHJlc3RvcmVzIHRoZW0gZnJvbSBsb2FkZWQgc2F2ZSBnYW1lIGlmIG5lY2Vzc2FyeS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwVGV4dHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBzZXR1cFRleHRzOiAtPlxuICAgICAgICB0ZXh0cyA9IEBvYmplY3Quc2NlbmVEYXRhPy50ZXh0cyA/IHt9XG4gICAgICAgIGZvciBkb21haW4gb2YgdGV4dHNcbiAgICAgICAgICAgIEBvYmplY3QudGV4dENvbnRhaW5lci5iZWhhdmlvci5jaGFuZ2VEb21haW4oZG9tYWluKVxuICAgICAgICAgICAgaWYgdGV4dHNbZG9tYWluXSB0aGVuIGZvciB0ZXh0LCBpIGluIHRleHRzW2RvbWFpbl1cbiAgICAgICAgICAgICAgICBAb2JqZWN0LnRleHRDb250YWluZXIuc2V0T2JqZWN0KHRleHQsIGkpXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHZpZGVvcyBhbmQgcmVzdG9yZXMgdGhlbSBmcm9tIGxvYWRlZCBzYXZlIGdhbWUgaWYgbmVjZXNzYXJ5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBWaWRlb3NcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBzZXR1cFZpZGVvczogLT5cbiAgICAgICAgdmlkZW9zID0gQG9iamVjdC5zY2VuZURhdGE/LnZpZGVvcyA/IHt9XG4gICAgICAgIGZvciBkb21haW4gb2YgdmlkZW9zXG4gICAgICAgICAgICBAb2JqZWN0LnZpZGVvQ29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgICAgICBpZiB2aWRlb3NbZG9tYWluXSB0aGVuIGZvciB2aWRlbywgaSBpbiB2aWRlb3NbZG9tYWluXVxuICAgICAgICAgICAgICAgIGlmIHZpZGVvXG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBcIiN7dmlkZW8udmlkZW9Gb2xkZXIgPyBcIk1vdmllc1wifS8je3ZpZGVvLnZpZGVvfVwiXG4gICAgICAgICAgICAgICAgICAgIEByZXNvdXJjZUNvbnRleHQuYWRkKHBhdGgsIFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNCeVBhdGhbcGF0aF0pXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLnZpc2libGUgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgdmlkZW8udXBkYXRlKClcblxuICAgICAgICAgICAgICAgIEBvYmplY3QudmlkZW9Db250YWluZXIuc2V0T2JqZWN0KHZpZGVvLCBpKVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBob3RzcG90cyBhbmQgcmVzdG9yZXMgdGhlbSBmcm9tIGxvYWRlZCBzYXZlIGdhbWUgaWYgbmVjZXNzYXJ5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBIb3RzcG90c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIHNldHVwSG90c3BvdHM6IC0+XG4gICAgICAgIGhvdHNwb3RzID0gQG9iamVjdC5zY2VuZURhdGE/LmhvdHNwb3RzID8ge31cbiAgICAgICAgZm9yIGRvbWFpbiBvZiBob3RzcG90c1xuICAgICAgICAgICAgQG9iamVjdC5ob3RzcG90Q29udGFpbmVyLmJlaGF2aW9yLmNoYW5nZURvbWFpbihkb21haW4pXG4gICAgICAgICAgICBpZiBob3RzcG90c1tkb21haW5dIHRoZW4gZm9yIGhvdHNwb3QsIGkgaW4gaG90c3BvdHNbZG9tYWluXVxuICAgICAgICAgICAgICAgIEBvYmplY3QuaG90c3BvdENvbnRhaW5lci5zZXRPYmplY3QoaG90c3BvdCwgaSlcblxuICAgICMjIypcbiAgICAqIFNldHMgdXAgbGF5b3V0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBMYXlvdXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBzZXR1cExheW91dDogLT5cbiAgICAgICAgQGRhdGFGaWVsZHMgPSB1aS5VSU1hbmFnZXIuZGF0YVNvdXJjZXNbdWkuVWlGYWN0b3J5LmxheW91dHMuZ2FtZUxheW91dC5kYXRhU291cmNlIHx8IFwiZGVmYXVsdFwiXSgpXG4gICAgICAgIEBkYXRhRmllbGRzLnNjZW5lID0gQG9iamVjdFxuICAgICAgICB3aW5kb3cuJGRhdGFGaWVsZHMgPSBAZGF0YUZpZWxkc1xuICAgICAgICBhZHZWaXNpYmxlID0gQG9iamVjdC5tZXNzYWdlTW9kZSA9PSB2bi5NZXNzYWdlTW9kZS5BRFZcblxuICAgICAgICBAb2JqZWN0LmxheW91dCA9IHVpLlVpRmFjdG9yeS5jcmVhdGVGcm9tRGVzY3JpcHRvcih1aS5VaUZhY3RvcnkubGF5b3V0cy5nYW1lTGF5b3V0LCBAb2JqZWN0KVxuICAgICAgICBAb2JqZWN0LmxheW91dC52aXNpYmxlID0gYWR2VmlzaWJsZVxuICAgICAgICAkZ2FtZU1lc3NhZ2VfbWVzc2FnZS52aXNpYmxlID0gYWR2VmlzaWJsZVxuICAgICAgICBAb2JqZWN0LmxheW91dC51aS5wcmVwYXJlKClcblxuICAgICAgICBAb2JqZWN0LmNob2ljZXMgPSBAb2JqZWN0LnNjZW5lRGF0YT8uY2hvaWNlcyB8fCBAb2JqZWN0LmNob2ljZXNcbiAgICAgICAgaWYgQG9iamVjdC5jaG9pY2VzPy5sZW5ndGggPiAwXG4gICAgICAgICAgICBAc2hvd0Nob2ljZXMoZ3MuQ2FsbEJhY2soXCJvbkNob2ljZUFjY2VwdFwiLCBAb2JqZWN0LmNob2ljZXNbMF0uaW50ZXJwcmV0ZXIgfHwgQG9iamVjdC5pbnRlcnByZXRlciwgeyBwb2ludGVyOiBAb2JqZWN0LmludGVycHJldGVyLnBvaW50ZXIsIHBhcmFtczogQHBhcmFtcyB9KSlcblxuICAgICAgICBpZiBAb2JqZWN0LmludGVycHJldGVyLndhaXRpbmdGb3IuaW5wdXROdW1iZXJcbiAgICAgICAgICAgIEBzaG93SW5wdXROdW1iZXIoR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5kaWdpdHMsIGdzLkNhbGxCYWNrKFwib25JbnB1dE51bWJlckZpbmlzaFwiLCBAb2JqZWN0LmludGVycHJldGVyLCBAb2JqZWN0LmludGVycHJldGVyKSlcblxuICAgICAgICBpZiBAb2JqZWN0LmludGVycHJldGVyLndhaXRpbmdGb3IuaW5wdXRUZXh0XG4gICAgICAgICAgICBAc2hvd0lucHV0VGV4dChHYW1lTWFuYWdlci50ZW1wRmllbGRzLmxldHRlcnMsIGdzLkNhbGxCYWNrKFwib25JbnB1dFRleHRGaW5pc2hcIiwgQG9iamVjdC5pbnRlcnByZXRlciwgQG9iamVjdC5pbnRlcnByZXRlcikpXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHRoZSBtYWluIHZpZXdwb3J0IC8gc2NyZWVuIHZpZXdwb3J0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBNYWluVmlld3BvcnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBzZXR1cE1haW5WaWV3cG9ydDogLT5cbiAgICAgICAgaWYgIUBvYmplY3Quc2NlbmVEYXRhLnZpZXdwb3J0XG4gICAgICAgICAgICBpZiBTY2VuZU1hbmFnZXIucHJldmlvdXNTY2VuZXMubGVuZ3RoID09IDAgXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC5kaXNwb3NlKClcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQgPSBuZXcgZ3MuT2JqZWN0X1ZpZXdwb3J0KG5ldyBWaWV3cG9ydCgwLCAwLCBHcmFwaGljcy53aWR0aCwgR3JhcGhpY3MuaGVpZ2h0LCBHcmFwaGljcy52aWV3cG9ydCkpXG4gICAgICAgICAgICBAdmlld3BvcnQgPSBHYW1lTWFuYWdlci5zY2VuZVZpZXdwb3J0LnZpc3VhbC52aWV3cG9ydFxuICAgICAgICAgICAgQG9iamVjdC52aWV3cG9ydCA9IEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVWaWV3cG9ydC5kaXNwb3NlKClcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lVmlld3BvcnQgPSBAb2JqZWN0LnNjZW5lRGF0YS52aWV3cG9ydFxuICAgICAgICAgICAgQG9iamVjdC52aWV3cG9ydCA9IEBvYmplY3Quc2NlbmVEYXRhLnZpZXdwb3J0XG4gICAgICAgICAgICBAdmlld3BvcnQgPSBAb2JqZWN0LnZpZXdwb3J0LnZpc3VhbC52aWV3cG9ydFxuICAgICAgICAgICAgQHZpZXdwb3J0LnZpZXdwb3J0ID0gR3JhcGhpY3Mudmlld3BvcnRcblxuICAgICMjIypcbiAgICAqIFNldHMgdXAgc2NyZWVuLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBTY3JlZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBzZXR1cFNjcmVlbjogLT5cbiAgICAgICAgaWYgQG9iamVjdC5zY2VuZURhdGEuc2NyZWVuXG4gICAgICAgICAgICBAb2JqZWN0LnZpZXdwb3J0LnJlc3RvcmUoQG9iamVjdC5zY2VuZURhdGEuc2NyZWVuKVxuXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgbWFpbiBpbnRlcnByZXRlciBmcm9tIGxvYWRlZCBzYXZlIGdhbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN0b3JlSW50ZXJwcmV0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICByZXN0b3JlSW50ZXJwcmV0ZXI6IC0+XG4gICAgICAgIGlmIEBvYmplY3Quc2NlbmVEYXRhLmludGVycHJldGVyXG4gICAgICAgICAgICBAb2JqZWN0LmludGVycHJldGVyLnJlc3RvcmUoKVxuXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgbWVzc2FnZSBib3ggZnJvbSBsb2FkZWQgc2F2ZSBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZU1lc3NhZ2VCb3hcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICByZXN0b3JlTWVzc2FnZUJveDogLT5cbiAgICAgICAgbWVzc2FnZUJveGVzID0gQG9iamVjdC5zY2VuZURhdGE/Lm1lc3NhZ2VCb3hlc1xuICAgICAgICBpZiBtZXNzYWdlQm94ZXNcbiAgICAgICAgICAgIGZvciBtZXNzYWdlQm94IGluIG1lc3NhZ2VCb3hlc1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChtZXNzYWdlQm94LmlkKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QudmlzaWJsZSA9IG1lc3NhZ2VCb3gudmlzaWJsZVxuICAgICAgICAgICAgICAgIGlmIG1lc3NhZ2VCb3gubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQm94Lm1lc3NhZ2UudGV4dFJlbmRlcmVyLmRpc3Bvc2VFdmVudEhhbmRsZXJzKClcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKG1lc3NhZ2VCb3gubWVzc2FnZS5pZClcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS50ZXh0UmVuZGVyZXIuZGlzcG9zZSgpXG5cbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0Lm1peGluKG1lc3NhZ2UsIG1lc3NhZ2VCb3gubWVzc2FnZSwgdWkuT2JqZWN0X01lc3NhZ2Uub2JqZWN0Q29kZWNCbGFja0xpc3QuY29uY2F0KFtcIm9yaWdpblwiXSkpXG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIGMgaW4gbWVzc2FnZS5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBjLm9iamVjdCA9IG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS50ZXh0UmVuZGVyZXIuc2V0dXBFdmVudEhhbmRsZXJzKClcblxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIG1lc3NhZ2UgZnJvbSBsb2FkZWQgc2F2ZSBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZU1lc3NhZ2VzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgcmVzdG9yZU1lc3NhZ2VzOiAtPlxuICAgICAgICBpZiBAb2JqZWN0LnNjZW5lRGF0YT8ubWVzc2FnZUFyZWFzXG4gICAgICAgICAgICBmb3IgZG9tYWluIG9mIEBvYmplY3Quc2NlbmVEYXRhLm1lc3NhZ2VBcmVhc1xuICAgICAgICAgICAgICAgIEBvYmplY3QubWVzc2FnZUFyZWFDb250YWluZXIuYmVoYXZpb3IuY2hhbmdlRG9tYWluKGRvbWFpbilcbiAgICAgICAgICAgICAgICBtZXNzYWdlQXJlYXMgPSBAb2JqZWN0LnNjZW5lRGF0YS5tZXNzYWdlQXJlYXNcbiAgICAgICAgICAgICAgICBpZiBtZXNzYWdlQXJlYXNbZG9tYWluXSB0aGVuIGZvciBhcmVhLCBpIGluIG1lc3NhZ2VBcmVhc1tkb21haW5dXG4gICAgICAgICAgICAgICAgICAgIGlmIGFyZWFcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VBcmVhID0gbmV3IGdzLk9iamVjdF9NZXNzYWdlQXJlYSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGF5b3V0ID0gdWkuVUlNYW5hZ2VyLmNyZWF0ZUNvbnRyb2xGcm9tRGVzY3JpcHRvcih0eXBlOiBcInVpLkN1c3RvbUdhbWVNZXNzYWdlXCIsIGlkOiBcImN1c3RvbUdhbWVNZXNzYWdlX1wiK2ksIHBhcmFtczogeyBpZDogXCJjdXN0b21HYW1lTWVzc2FnZV9cIitpIH0sIG1lc3NhZ2VBcmVhKVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiY3VzdG9tR2FtZU1lc3NhZ2VfXCIraStcIl9tZXNzYWdlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhLm1lc3NhZ2UudGV4dFJlbmRlcmVyLmRpc3Bvc2VFdmVudEhhbmRsZXJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnRleHRSZW5kZXJlci5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5taXhpbihtZXNzYWdlLCBhcmVhLm1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgYyBpbiBtZXNzYWdlLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLm9iamVjdCA9IG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICNtZXNzYWdlLnJlc3RvcmUoZi5tZXNzYWdlKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGF5b3V0LmRzdFJlY3QueCA9IGFyZWEubGF5b3V0LmRzdFJlY3QueFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUxheW91dC5kc3RSZWN0LnkgPSBhcmVhLmxheW91dC5kc3RSZWN0LnlcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQuZHN0UmVjdC53aWR0aCA9IGFyZWEubGF5b3V0LmRzdFJlY3Qud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQuZHN0UmVjdC5oZWlnaHQgPSBhcmVhLmxheW91dC5kc3RSZWN0LmhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUxheW91dC5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS50ZXh0UmVuZGVyZXIuc2V0dXBFdmVudEhhbmRsZXJzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQudXBkYXRlKClcblxuICAgICAgICAgICAgICAgICAgICAgICAgI21lc3NhZ2UubWVzc2FnZS5yZXN0b3JlTWVzc2FnZXMoZi5tZXNzYWdlcylcbiAgICAgICAgICAgICAgICAgICAgICAgICNtZXNzYWdlLnRleHRSZW5kZXJlci5yZXN0b3JlKGYudGV4dFJlbmRlcmVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgI21lc3NhZ2UudmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUFyZWEubWVzc2FnZSA9IG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VBcmVhLmxheW91dCA9IG1lc3NhZ2VMYXlvdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VBcmVhLmFkZE9iamVjdChtZXNzYWdlTGF5b3V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5tZXNzYWdlQXJlYUNvbnRhaW5lci5zZXRPYmplY3QobWVzc2FnZUFyZWEsIGkpXG5cblxuXG5cblxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIGF1ZGlvLXBsYXliYWNrIGZyb20gbG9hZGVkIHNhdmUgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVBdWRpb1BsYXliYWNrXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgcmVzdG9yZUF1ZGlvUGxheWJhY2s6IC0+XG4gICAgICAgIGlmIEBvYmplY3Quc2NlbmVEYXRhLmF1ZGlvXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuYXVkaW9CdWZmZXJzLnB1c2goYikgZm9yIGIgaW4gQG9iamVjdC5zY2VuZURhdGEuYXVkaW8uYXVkaW9CdWZmZXJzXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuYXVkaW9CdWZmZXJzQnlMYXllciA9IEBvYmplY3Quc2NlbmVEYXRhLmF1ZGlvLmF1ZGlvQnVmZmVyc0J5TGF5ZXJcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5hdWRpb0xheWVycyA9IEBvYmplY3Quc2NlbmVEYXRhLmF1ZGlvLmF1ZGlvTGF5ZXJzXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuc291bmRSZWZlcmVuY2VzID0gQG9iamVjdC5zY2VuZURhdGEuYXVkaW8uc291bmRSZWZlcmVuY2VzXG5cblxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIHRoZSBzY2VuZSBvYmplY3RzIGZyb20gdGhlIGN1cnJlbnQgbG9hZGVkIHNhdmUtZ2FtZS4gSWYgbm8gc2F2ZS1nYW1lIGlzXG4gICAgKiBwcmVzZW50IGluIEdhbWVNYW5hZ2VyLmxvYWRlZFNhdmVHYW1lLCBub3RoaW5nIHdpbGwgaGFwcGVuLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZVNjZW5lXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgcmVzdG9yZVNjZW5lOiAtPlxuICAgICAgICBzYXZlR2FtZSA9IEdhbWVNYW5hZ2VyLmxvYWRlZFNhdmVHYW1lXG4gICAgICAgIGlmIHNhdmVHYW1lXG4gICAgICAgICAgICBjb250ZXh0ID0gbmV3IGdzLk9iamVjdENvZGVjQ29udGV4dChbR3JhcGhpY3Mudmlld3BvcnQsIEBvYmplY3QsIHRoaXNdLCBzYXZlR2FtZS5lbmNvZGVkT2JqZWN0U3RvcmUsIG51bGwpXG4gICAgICAgICAgICBzYXZlR2FtZS5kYXRhID0gZ3MuT2JqZWN0Q29kZWMuZGVjb2RlKHNhdmVHYW1lLmRhdGEsIGNvbnRleHQpXG4gICAgICAgICAgICBmb3IgYyBpbiBzYXZlR2FtZS5kYXRhLmNoYXJhY3Rlck5hbWVzXG4gICAgICAgICAgICAgICAgaWYgYyB0aGVuIFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1tjLmluZGV4XT8ubmFtZSA9IGMubmFtZVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIucmVzdG9yZShzYXZlR2FtZSlcbiAgICAgICAgICAgIGdzLk9iamVjdENvZGVjLm9uUmVzdG9yZShzYXZlR2FtZS5kYXRhLCBjb250ZXh0KVxuICAgICAgICAgICAgQHJlc291cmNlQ29udGV4dC5mcm9tRGF0YUJ1bmRsZShzYXZlR2FtZS5kYXRhLnJlc291cmNlQ29udGV4dCwgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc0J5UGF0aClcblxuICAgICAgICAgICAgQG9iamVjdC5zY2VuZURhdGEgPSBzYXZlR2FtZS5kYXRhXG4gICAgICAgICAgICBHcmFwaGljcy5mcmFtZUNvdW50ID0gc2F2ZUdhbWUuZGF0YS5mcmFtZUNvdW50XG5cbiAgICAjIyMqXG4gICAgKiBQcmVwYXJlcyBhbGwgZGF0YSBmb3IgdGhlIHNjZW5lIGFuZCBsb2FkcyB0aGUgbmVjZXNzYXJ5IGdyYXBoaWMgYW5kIGF1ZGlvIHJlc291cmNlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXBhcmVEYXRhXG4gICAgKiBAYWJzdHJhY3RcbiAgICAjIyNcbiAgICBwcmVwYXJlRGF0YTogLT5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBAb2JqZWN0LnNjZW5lRG9jdW1lbnQ/LnVpZFxuICAgICAgICAjUmVjb3JkTWFuYWdlci50cmFuc2xhdGUoKVxuXG4gICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lID0gQG9iamVjdFxuXG4gICAgICAgIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudCA9IEBvYmplY3RNYW5hZ2VyXG5cbiAgICAgICAgQG9iamVjdC5zY2VuZURhdGEudWlkID0gQG9iamVjdC5zY2VuZURvY3VtZW50LnVpZFxuXG4gICAgICAgIGlmICFSZXNvdXJjZUxvYWRlci5sb2FkRXZlbnRDb21tYW5kc0RhdGEoQG9iamVjdC5zY2VuZURvY3VtZW50Lml0ZW1zLmNvbW1hbmRzKVxuICAgICAgICAgICAgUmVzb3VyY2VMb2FkZXIubG9hZEV2ZW50Q29tbWFuZHNHcmFwaGljcyhAb2JqZWN0LnNjZW5lRG9jdW1lbnQuaXRlbXMuY29tbWFuZHMpXG4gICAgICAgICAgICBHYW1lTWFuYWdlci5iYWNrbG9nID0gQG9iamVjdC5zY2VuZURhdGEuYmFja2xvZyB8fCBHYW1lTWFuYWdlci5zY2VuZURhdGEuYmFja2xvZyB8fCBbXVxuXG4gICAgICAgICAgICBSZXNvdXJjZUxvYWRlci5sb2FkU3lzdGVtU291bmRzKClcbiAgICAgICAgICAgIFJlc291cmNlTG9hZGVyLmxvYWRTeXN0ZW1HcmFwaGljcygpXG4gICAgICAgICAgICBSZXNvdXJjZUxvYWRlci5sb2FkVWlUeXBlc0dyYXBoaWNzKHVpLlVpRmFjdG9yeS5jdXN0b21UeXBlcylcbiAgICAgICAgICAgIFJlc291cmNlTG9hZGVyLmxvYWRVaUxheW91dEdyYXBoaWNzKHVpLlVpRmFjdG9yeS5sYXlvdXRzLmdhbWVMYXlvdXQpXG5cbiAgICAgICAgICAgIGlmIEBkYXRhRmllbGRzP1xuICAgICAgICAgICAgICAgIFJlc291cmNlTG9hZGVyLmxvYWRVaURhdGFGaWVsZHNHcmFwaGljcyhAZGF0YUZpZWxkcylcblxuICAgICAgICAgICAgJHRlbXBGaWVsZHMuY2hvaWNlVGltZXIgPSBAb2JqZWN0LmNob2ljZVRpbWVyXG5cbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXAoeyBpZDogQG9iamVjdC5zY2VuZURvY3VtZW50LnVpZH0pXG5cbiAgICAjIyMqXG4gICAgKiBQcmVwYXJlcyBhbGwgdmlzdWFsIGdhbWUgb2JqZWN0IGZvciB0aGUgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBwcmVwYXJlVmlzdWFsXG4gICAgIyMjXG4gICAgcHJlcGFyZVZpc3VhbDogLT5cbiAgICAgICAgaWYgQG9iamVjdC5sYXlvdXQgb3IgIUBvYmplY3Quc2NlbmVEb2N1bWVudFxuICAgICAgICAgICAgQHRyYW5zaXRpb24oeyBkdXJhdGlvbjogMCB9KVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgaWYgR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5pc0V4aXRpbmdHYW1lXG4gICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wRmllbGRzLmlzRXhpdGluZ0dhbWUgPSBub1xuICAgICAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RSZXNldFNjZW5lQ2hhbmdlKEBvYmplY3Quc2NlbmVEb2N1bWVudC5pdGVtcy5uYW1lKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdFNjZW5lQ2hhbmdlKEBvYmplY3Quc2NlbmVEb2N1bWVudC5pdGVtcy5uYW1lKVxuXG4gICAgICAgIEByZXN0b3JlU2NlbmUoKVxuICAgICAgICBAb2JqZWN0Lm1lc3NhZ2VNb2RlID0gQG9iamVjdC5zY2VuZURhdGEubWVzc2FnZU1vZGUgPyB2bi5NZXNzYWdlTW9kZS5BRFZcbiAgICAgICAgQHNldHVwTWFpblZpZXdwb3J0KClcbiAgICAgICAgQHNldHVwVmlld3BvcnRzKClcbiAgICAgICAgQHNldHVwQ2hhcmFjdGVycygpXG4gICAgICAgIEBzZXR1cEJhY2tncm91bmRzKClcbiAgICAgICAgQHNldHVwUGljdHVyZXMoKVxuICAgICAgICBAc2V0dXBUZXh0cygpXG4gICAgICAgIEBzZXR1cFZpZGVvcygpXG4gICAgICAgIEBzZXR1cEhvdHNwb3RzKClcbiAgICAgICAgQHNldHVwSW50ZXJwcmV0ZXIoKVxuICAgICAgICBAc2V0dXBMYXlvdXQoKVxuICAgICAgICBAc2V0dXBDb21tb25FdmVudHMoKVxuXG4gICAgICAgIEByZXN0b3JlTWVzc2FnZUJveCgpXG4gICAgICAgIEByZXN0b3JlSW50ZXJwcmV0ZXIoKVxuICAgICAgICBAcmVzdG9yZU1lc3NhZ2VzKClcbiAgICAgICAgQHJlc3RvcmVBdWRpb1BsYXliYWNrKClcblxuICAgICAgICBAc2hvdyh0cnVlKVxuXG4gICAgICAgIEBvYmplY3Quc2NlbmVEYXRhID0ge31cbiAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVEYXRhID0ge31cblxuICAgICAgICBHcmFwaGljcy51cGRhdGUoKVxuICAgICAgICBAdHJhbnNpdGlvbih7IGR1cmF0aW9uOiAwIH0pXG5cblxuICAgICMjIypcbiAgICAqIEFkZHMgYSBuZXcgY2hhcmFjdGVyIHRvIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGFkZENoYXJhY3RlclxuICAgICogQHBhcmFtIHt2bi5PYmplY3RfQ2hhcmFjdGVyfSBjaGFyYWN0ZXIgLSBUaGUgY2hhcmFjdGVyIHRvIGFkZC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9BbmltYXRpb24gLSBJbmRpY2F0ZXMgaWYgdGhlIGNoYXJhY3RlciBzaG91bGQgYmUgYWRkZWQgaW1tZWRpYXRlbHkgd2l0b3V0IGFueSBhcHBlYXItYW5pbWF0aW9uLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGFuaW1hdGlvbkRhdGEgLSBDb250YWlucyB0aGUgYXBwZWFyLWFuaW1hdGlvbiBkYXRhIC0+IHsgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uIH0uXG4gICAgIyMjXG4gICAgYWRkQ2hhcmFjdGVyOiAoY2hhcmFjdGVyLCBub0FuaW1hdGlvbiwgYW5pbWF0aW9uRGF0YSkgLT5cbiAgICAgICAgdW5sZXNzIG5vQW5pbWF0aW9uXG4gICAgICAgICAgICBjaGFyYWN0ZXIubW90aW9uQmx1ci5zZXQoYW5pbWF0aW9uRGF0YS5tb3Rpb25CbHVyKVxuXG4gICAgICAgICAgICBpZiBhbmltYXRpb25EYXRhLmR1cmF0aW9uID4gMFxuICAgICAgICAgICAgICAgIGNoYXJhY3Rlci5hbmltYXRvci5hcHBlYXIoY2hhcmFjdGVyLmRzdFJlY3QueCwgY2hhcmFjdGVyLmRzdFJlY3QueSwgYW5pbWF0aW9uRGF0YS5hbmltYXRpb24sIGFuaW1hdGlvbkRhdGEuZWFzaW5nLCBhbmltYXRpb25EYXRhLmR1cmF0aW9uKSB1bmxlc3Mgbm9BbmltYXRpb25cblxuICAgICAgICBjaGFyYWN0ZXIudmlld3BvcnQgPSBAdmlld3BvcnRcbiAgICAgICAgY2hhcmFjdGVyLnZpc2libGUgPSB5ZXNcblxuICAgICAgICBAb2JqZWN0LmNoYXJhY3RlckNvbnRhaW5lci5hZGRPYmplY3QoY2hhcmFjdGVyKVxuXG4gICAgIyMjKlxuICAgICogUmVtb3ZlcyBhIGNoYXJhY3RlciBmcm9tIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlbW92ZUNoYXJhY3RlclxuICAgICogQHBhcmFtIHt2bi5PYmplY3RfQ2hhcmFjdGVyfSBjaGFyYWN0ZXIgLSBUaGUgY2hhcmFjdGVyIHRvIHJlbW92ZS5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9BbmltYXRpb24gLSBJbmRpY2F0ZXMgaWYgdGhlIGNoYXJhY3RlciBzaG91bGQgYmUgZGlzcG9zZWQgaW1tZWRpYXRlbHkgd2l0b3V0IGFueSBkaXNhcGVhci1hbmltYXRpb24uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYW5pbWF0aW9uRGF0YSAtIENvbnRhaW5zIHRoZSBkaXNhcHBlYXItYW5pbWF0aW9uIGRhdGEgLT4geyBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24gfS5cbiAgICAjIyNcbiAgICByZW1vdmVDaGFyYWN0ZXI6IChjaGFyYWN0ZXIsIG5vQW5pbWF0aW9uLCBhbmltYXRpb25EYXRhKSAtPlxuICAgICAgICB1bmxlc3Mgbm9BbmltYXRpb25cbiAgICAgICAgICAgIGNoYXJhY3Rlcj8uYW5pbWF0b3IuZGlzYXBwZWFyKGFuaW1hdGlvbkRhdGEuYW5pbWF0aW9uLCBhbmltYXRpb25EYXRhLmVhc2luZywgYW5pbWF0aW9uRGF0YS5kdXJhdGlvbiwgKHNlbmRlcikgLT4gc2VuZGVyLmRpc3Bvc2UoKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2hhcmFjdGVyPy5kaXNwb3NlKClcblxuICAgICMjIypcbiAgICAqIFJlc3VtZXMgdGhlIGN1cnJlbnQgc2NlbmUgaWYgaXQgaGFzIGJlZW4gcGF1c2VkLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdW1lU2NlbmVcbiAgICAjIyNcbiAgICByZXN1bWVTY2VuZTogLT5cbiAgICAgICAgQG9iamVjdC5waWN0dXJlQ29udGFpbmVyLmFjdGl2ZSA9IHllc1xuICAgICAgICBAb2JqZWN0LmNoYXJhY3RlckNvbnRhaW5lci5hY3RpdmUgPSB5ZXNcbiAgICAgICAgQG9iamVjdC5iYWNrZ3JvdW5kQ29udGFpbmVyLmFjdGl2ZSA9IHllc1xuICAgICAgICBAb2JqZWN0LnRleHRDb250YWluZXIuYWN0aXZlID0geWVzXG4gICAgICAgIEBvYmplY3QuaG90c3BvdENvbnRhaW5lci5hY3RpdmUgPSB5ZXNcbiAgICAgICAgQG9iamVjdC52aWRlb0NvbnRhaW5lci5hY3RpdmUgPSB5ZXNcblxuICAgICAgICBtZXNzYWdlID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJnYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgICAgIG1lc3NhZ2UuYWN0aXZlID0geWVzXG5cbiAgICAjIyMqXG4gICAgKiBQYXVzZXMgdGhlIGN1cnJlbnQgc2NlbmUuIEEgcGF1c2VkIHNjZW5lIHdpbGwgbm90IGNvbnRpbnVlLCBtZXNzYWdlcywgcGljdHVyZXMsIGV0Yy4gd2lsbFxuICAgICogc3RvcCB1bnRpbCB0aGUgc2NlbmUgcmVzdW1lcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHBhdXNlU2NlbmVcbiAgICAjIyNcbiAgICBwYXVzZVNjZW5lOiAtPlxuICAgICAgICBAb2JqZWN0LnBpY3R1cmVDb250YWluZXIuYWN0aXZlID0gbm9cbiAgICAgICAgQG9iamVjdC5jaGFyYWN0ZXJDb250YWluZXIuYWN0aXZlID0gbm9cbiAgICAgICAgQG9iamVjdC5iYWNrZ3JvdW5kQ29udGFpbmVyLmFjdGl2ZSA9IG5vXG4gICAgICAgIEBvYmplY3QudGV4dENvbnRhaW5lci5hY3RpdmUgPSBub1xuICAgICAgICBAb2JqZWN0LmhvdHNwb3RDb250YWluZXIuYWN0aXZlID0gbm9cbiAgICAgICAgQG9iamVjdC52aWRlb0NvbnRhaW5lci5hY3RpdmUgPSBub1xuXG4gICAgICAgIG1lc3NhZ2UgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcImdhbWVNZXNzYWdlX21lc3NhZ2VcIilcbiAgICAgICAgbWVzc2FnZS5hY3RpdmUgPSBub1xuXG4gICAgIyMjKlxuICAgICogQ2hhbmdlcyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZW50aXJlIGdhbWUgVUkgbGlrZSB0aGUgbWVzc2FnZSBib3hlcywgZXRjLiB0byBhbGxvd3NcbiAgICAqIHRoZSBwbGF5ZXIgdG8gc2VlIHRoZSBlbnRpcmUgc2NlbmUuIFVzZWZ1bCBmb3IgQ0dzLCBldGMuXG4gICAgKlxuICAgICogQHBhcmFtIHtib29sZWFufSB2aXNpYmxlIC0gSWYgPGI+dHJ1ZTwvYj4sIHRoZSBnYW1lIFVJIHdpbGwgYmUgdmlzaWJsZS4gT3RoZXJ3aXNlIGl0IHdpbGwgYmUgaGlkZGVuLlxuICAgICogQG1ldGhvZCBjaGFuZ2VVSVZpc2liaWxpdHlcbiAgICAjIyNcbiAgICBjaGFuZ2VVSVZpc2liaWxpdHk6ICh2aXNpYmxlKSAtPlxuICAgICAgICBAdWlWaXNpYmxlID0gdmlzaWJsZVxuICAgICAgICBAb2JqZWN0LmxheW91dC52aXNpYmxlID0gdmlzaWJsZVxuXG4gICAgIyMjKlxuICAgICogU2hvd3MgaW5wdXQtdGV4dCBib3ggdG8gbGV0IHRoZSB1c2VyIGVudGVyIGEgdGV4dC5cbiAgICAqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gbGV0dGVycyAtIFRoZSBtYXguIG51bWJlciBvZiBsZXR0ZXJzIHRoZSB1c2VyIGNhbiBlbnRlci5cbiAgICAqIEBwYXJhbSB7Z3MuQ2FsbGJhY2t9IGNhbGxiYWNrIC0gQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgaWYgdGhlIGlucHV0LXRleHQgYm94IGhhcyBiZWVuIGFjY2VwdGVkIGJ5IHRoZSB1c2VyLlxuICAgICogQG1ldGhvZCBzaG93SW5wdXRUZXh0XG4gICAgIyMjXG4gICAgc2hvd0lucHV0VGV4dDogKGxldHRlcnMsIGNhbGxiYWNrKSAtPlxuICAgICAgICBAb2JqZWN0LmlucHV0VGV4dEJveD8uZGlzcG9zZSgpXG4gICAgICAgIEBvYmplY3QuaW5wdXRUZXh0Qm94ID0gdWkuVWlGYWN0b3J5LmNyZWF0ZUNvbnRyb2xGcm9tRGVzY3JpcHRvcih1aS5VaUZhY3RvcnkuY3VzdG9tVHlwZXNbXCJ1aS5JbnB1dFRleHRCb3hcIl0sIEBvYmplY3QubGF5b3V0KVxuICAgICAgICBAb2JqZWN0LmlucHV0VGV4dEJveC51aS5wcmVwYXJlKClcbiAgICAgICAgQG9iamVjdC5pbnB1dFRleHRCb3guZXZlbnRzLm9uKFwiYWNjZXB0XCIsIGNhbGxiYWNrKVxuXG4gICAgIyMjKlxuICAgICogU2hvd3MgaW5wdXQtbnVtYmVyIGJveCB0byBsZXQgdGhlIHVzZXIgZW50ZXIgYSBudW1iZXIuXG4gICAgKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGRpZ2l0cyAtIFRoZSBtYXguIG51bWJlciBvZiBkaWdpdHMgdGhlIHVzZXIgY2FuIGVudGVyLlxuICAgICogQHBhcmFtIHtncy5DYWxsYmFja30gY2FsbGJhY2sgLSBBIGNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBpZiB0aGUgaW5wdXQtbnVtYmVyIGJveCBoYXMgYmVlbiBhY2NlcHRlZCBieSB0aGUgdXNlci5cbiAgICAqIEBtZXRob2Qgc2hvd0lucHV0TnVtYmVyXG4gICAgIyMjXG4gICAgc2hvd0lucHV0TnVtYmVyOiAoZGlnaXRzLCBjYWxsYmFjaykgLT5cbiAgICAgICAgQG9iamVjdC5pbnB1dE51bWJlckJveD8uZGlzcG9zZSgpXG4gICAgICAgIEBvYmplY3QuaW5wdXROdW1iZXJCb3ggPSB1aS5VaUZhY3RvcnkuY3JlYXRlQ29udHJvbEZyb21EZXNjcmlwdG9yKHVpLlVpRmFjdG9yeS5jdXN0b21UeXBlc1tcInVpLklucHV0TnVtYmVyQm94XCJdLCBAb2JqZWN0LmxheW91dClcbiAgICAgICAgQG9iamVjdC5pbnB1dE51bWJlckJveC51aS5wcmVwYXJlKClcbiAgICAgICAgQG9iamVjdC5pbnB1dE51bWJlckJveC5ldmVudHMub24oXCJhY2NlcHRcIiwgY2FsbGJhY2spXG5cbiAgICAjIyMqXG4gICAgKiBTaG93cyBjaG9pY2VzIHRvIGxldCB0aGUgdXNlciBwaWNrIGEgY2hvaWNlLlxuICAgICpcbiAgICAqIEBwYXJhbSB7T2JqZWN0W119IGNob2ljZXMgLSBBbiBhcnJheSBvZiBjaG9pY2VzXG4gICAgKiBAcGFyYW0ge2dzLkNhbGxiYWNrfSBjYWxsYmFjayAtIEEgY2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGlmIGEgY2hvaWNlIGhhcyBiZWVuIHBpY2tlZCBieSB0aGUgdXNlci5cbiAgICAqIEBtZXRob2Qgc2hvd0Nob2ljZXNcbiAgICAjIyNcbiAgICBzaG93Q2hvaWNlczogKGNhbGxiYWNrKSAtPlxuICAgICAgICB1c2VGcmVlTGF5b3V0ID0gQG9iamVjdC5jaG9pY2VzLndoZXJlKCh4KSAtPiB4LmRzdFJlY3Q/KS5sZW5ndGggPiAwXG5cbiAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3c/LmRpc3Bvc2UoKVxuXG4gICAgICAgIGlmIHVzZUZyZWVMYXlvdXRcbiAgICAgICAgICAgIEBvYmplY3QuY2hvaWNlV2luZG93ID0gdWkuVWlGYWN0b3J5LmNyZWF0ZUNvbnRyb2xGcm9tRGVzY3JpcHRvcih1aS5VaUZhY3RvcnkuY3VzdG9tVHlwZXNbXCJ1aS5GcmVlQ2hvaWNlQm94XCJdLCBAb2JqZWN0LmxheW91dClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3cgPSB1aS5VaUZhY3RvcnkuY3JlYXRlQ29udHJvbEZyb21EZXNjcmlwdG9yKHVpLlVpRmFjdG9yeS5jdXN0b21UeXBlc1tcInVpLkNob2ljZUJveFwiXSwgQG9iamVjdC5sYXlvdXQpXG5cbiAgICAgICAgQG9iamVjdC5jaG9pY2VXaW5kb3cuZXZlbnRzLm9uKFwic2VsZWN0aW9uQWNjZXB0XCIsIGNhbGxiYWNrKVxuICAgICAgICBAb2JqZWN0LmNob2ljZVdpbmRvdy51aS5wcmVwYXJlKClcblxuICAgICMjIypcbiAgICAqIENoYW5nZXMgdGhlIGJhY2tncm91bmQgb2YgdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2hhbmdlQmFja2dyb3VuZFxuICAgICogQHBhcmFtIHtPYmplY3R9IGJhY2tncm91bmQgLSBUaGUgYmFja2dyb3VuZCBncmFwaGljIG9iamVjdCAtPiB7IG5hbWUgfVxuICAgICogQHBhcmFtIHtib29sZWFufSBub0FuaW1hdGlvbiAtIEluZGljYXRlcyBpZiB0aGUgYmFja2dyb3VuZCBzaG91bGQgYmUgY2hhbmdlZCBpbW1lZGlhdGVseSB3aXRvdXQgYW55IGNoYW5nZS1hbmltYXRpb24uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYW5pbWF0aW9uIC0gVGhlIGFwcGVhci9kaXNhcHBlYXIgYW5pbWF0aW9uIHRvIHVzZS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmcgLSBUaGUgZWFzaW5nIG9mIHRoZSBjaGFuZ2UgYW5pbWF0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9mIHRoZSBjaGFuZ2UgaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IG94IC0gVGhlIHgtb3JpZ2luIG9mIHRoZSBiYWNrZ3JvdW5kLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IG95IC0gVGhlIHktb3JpZ2luIG9mIHRoZSBiYWNrZ3JvdW5kLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyIC0gVGhlIGJhY2tncm91bmQtbGF5ZXIgdG8gY2hhbmdlLlxuICAgICogQHBhcmFtIHtib29sZWFufSBsb29wSG9yaXpvbnRhbCAtIEluZGljYXRlcyBpZiB0aGUgYmFja2dyb3VuZCBzaG91bGQgYmUgbG9vcGVkIGhvcml6b250YWxseS5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbG9vcFZlcnRpY2FsIC0gSW5kaWNhdGVzIGlmIHRoZSBiYWNrZ3JvdW5kIHNob3VsZCBiZSBsb29wZWQgdmVydGljYWxseS5cbiAgICAjIyNcbiAgICBjaGFuZ2VCYWNrZ3JvdW5kOiAoYmFja2dyb3VuZCwgbm9BbmltYXRpb24sIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiwgb3gsIG95LCBsYXllciwgbG9vcEhvcml6b250YWwsIGxvb3BWZXJ0aWNhbCkgLT5cbiAgICAgICAgaWYgYmFja2dyb3VuZD9cbiAgICAgICAgICAgIG90aGVyT2JqZWN0ID0gQG9iamVjdC5iYWNrZ3JvdW5kc1tsYXllcl1cbiAgICAgICAgICAgIG9iamVjdCA9IG5ldyB2bi5PYmplY3RfQmFja2dyb3VuZCgpXG4gICAgICAgICAgICBvYmplY3QuaW1hZ2UgPSBiYWNrZ3JvdW5kLm5hbWVcbiAgICAgICAgICAgIG9iamVjdC5pbWFnZUZvbGRlciA9IGJhY2tncm91bmQuZm9sZGVyUGF0aFxuICAgICAgICAgICAgb2JqZWN0Lm9yaWdpbi54ID0gb3hcbiAgICAgICAgICAgIG9iamVjdC5vcmlnaW4ueSA9IG95XG4gICAgICAgICAgICBvYmplY3Qudmlld3BvcnQgPSBAdmlld3BvcnRcbiAgICAgICAgICAgIG9iamVjdC52aXN1YWwubG9vcGluZy52ZXJ0aWNhbCA9IG5vXG4gICAgICAgICAgICBvYmplY3QudmlzdWFsLmxvb3BpbmcuaG9yaXpvbnRhbCA9IG5vXG4gICAgICAgICAgICBvYmplY3QudXBkYXRlKClcblxuICAgICAgICAgICAgQG9iamVjdC5iYWNrZ3JvdW5kQ29udGFpbmVyLnNldE9iamVjdChvYmplY3QsIGxheWVyKVxuXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGR1cmF0aW9uID8gMzBcblxuICAgICAgICAgICAgb3RoZXJPYmplY3Q/LnpJbmRleCA9IGxheWVyXG4gICAgICAgICAgICBvdGhlck9iamVjdD8uYW5pbWF0b3Iub3RoZXJPYmplY3Q/LmRpc3Bvc2UoKVxuXG4gICAgICAgICAgICBpZiBkdXJhdGlvbiA9PSAwXG4gICAgICAgICAgICAgICAgb3RoZXJPYmplY3Q/LmRpc3Bvc2UoKVxuICAgICAgICAgICAgICAgIG9iamVjdC52aXN1YWwubG9vcGluZy52ZXJ0aWNhbCA9IGxvb3BWZXJ0aWNhbFxuICAgICAgICAgICAgICAgIG9iamVjdC52aXN1YWwubG9vcGluZy5ob3Jpem9udGFsID0gbG9vcEhvcml6b250YWxcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBub0FuaW1hdGlvblxuICAgICAgICAgICAgICAgICAgICBvYmplY3QudmlzdWFsLmxvb3BpbmcudmVydGljYWwgPSBsb29wVmVydGljYWxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnZpc3VhbC5sb29waW5nLmhvcml6b250YWwgPSBsb29wSG9yaXpvbnRhbFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmFuaW1hdG9yLm90aGVyT2JqZWN0ID0gb3RoZXJPYmplY3RcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmFuaW1hdG9yLmFwcGVhcigwLCAwLCBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sIChzZW5kZXIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXIudXBkYXRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlci5hbmltYXRvci5vdGhlck9iamVjdD8uZGlzcG9zZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXIuYW5pbWF0b3Iub3RoZXJPYmplY3QgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXIudmlzdWFsLmxvb3BpbmcudmVydGljYWwgPSBsb29wVmVydGljYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlci52aXN1YWwubG9vcGluZy5ob3Jpem9udGFsID0gbG9vcEhvcml6b250YWxcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb2JqZWN0LmJhY2tncm91bmRzW2xheWVyXT8uYW5pbWF0b3IuaGlkZSBkdXJhdGlvbiwgZWFzaW5nLCAgPT5cbiAgICAgICAgICAgICAgIEBvYmplY3QuYmFja2dyb3VuZHNbbGF5ZXJdLmRpc3Bvc2UoKVxuICAgICAgICAgICAgICAgQG9iamVjdC5iYWNrZ3JvdW5kc1tsYXllcl0gPSBudWxsXG5cblxuICAgICMjIypcbiAgICAqIFNraXBzIGFsbCB2aWV3cG9ydCBhbmltYXRpb25zIGV4Y2VwdCB0aGUgbWFpbiB2aWV3cG9ydCBhbmltYXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwVmlld3BvcnRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgc2tpcFZpZXdwb3J0czogLT5cbiAgICAgICAgdmlld3BvcnRzID0gQG9iamVjdC52aWV3cG9ydENvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgICAgIGZvciB2aWV3cG9ydCBpbiB2aWV3cG9ydHNcbiAgICAgICAgICAgIGlmIHZpZXdwb3J0XG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiB2aWV3cG9ydC5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgcGljdHVyZSBhbmltYXRpb25zLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcFBpY3R1cmVzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgc2tpcFBpY3R1cmVzOiAtPlxuICAgICAgICBmb3IgcGljdHVyZSBpbiBAb2JqZWN0LnBpY3R1cmVzXG4gICAgICAgICAgICBpZiBwaWN0dXJlXG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBwaWN0dXJlLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICMjIypcbiAgICAqIFNraXBzIGFsbCB0ZXh0IGFuaW1hdGlvbnMuXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwVGV4dHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBza2lwVGV4dHM6IC0+XG4gICAgICAgZm9yIHRleHQgaW4gQG9iamVjdC50ZXh0c1xuICAgICAgICAgICAgaWYgdGV4dFxuICAgICAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gdGV4dC5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgdmlkZW8gYW5pbWF0aW9ucyBidXQgbm90IHRoZSB2aWRlby1wbGF5YmFjayBpdHNlbGYuXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwVmlkZW9zXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgc2tpcFZpZGVvczogLT5cbiAgICAgICAgZm9yIHZpZGVvIGluIEBvYmplY3QudmlkZW9zXG4gICAgICAgICAgICBpZiB2aWRlb1xuICAgICAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gdmlkZW8uY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQuc2tpcD8oKVxuICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgIyMjKlxuICAgICogU2tpcHMgYWxsIGJhY2tncm91bmQgYW5pbWF0aW9ucy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBCYWNrZ3JvdW5kc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIHNraXBCYWNrZ3JvdW5kczogLT5cbiAgICAgICAgZm9yIGJhY2tncm91bmQgaW4gQG9iamVjdC5iYWNrZ3JvdW5kc1xuICAgICAgICAgICAgaWYgYmFja2dyb3VuZFxuICAgICAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gYmFja2dyb3VuZC5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgY2hhcmFjdGVyIGFuaW1hdGlvbnNcbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBDaGFyYWN0ZXJzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgc2tpcENoYXJhY3RlcnM6IC0+XG4gICAgICAgIGZvciBjaGFyYWN0ZXIgaW4gQG9iamVjdC5jaGFyYWN0ZXJzXG4gICAgICAgICAgICBpZiBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBmb3IgY29tcG9uZW50IGluIGNoYXJhY3Rlci5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBTa2lwcyB0aGUgbWFpbiB2aWV3cG9ydCBhbmltYXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwTWFpblZpZXdwb3J0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgc2tpcE1haW5WaWV3cG9ydDogLT5cbiAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBAb2JqZWN0LnZpZXdwb3J0LmNvbXBvbmVudHNcbiAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgYW5pbWF0aW9ucyBvZiBhbGwgbWVzc2FnZSBib3hlcyBkZWZpbmVkIGluIE1FU1NBR0VfQk9YX0lEUyB1aSBjb25zdGFudC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBNZXNzYWdlQm94ZXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBza2lwTWVzc2FnZUJveGVzOiAtPlxuICAgICAgICBmb3IgbWVzc2FnZUJveElkIGluIGdzLlVJQ29uc3RhbnRzLk1FU1NBR0VfQk9YX0lEUyB8fCBbXCJtZXNzYWdlQm94XCIsIFwibnZsTWVzc2FnZUJveFwiXVxuICAgICAgICAgICAgbWVzc2FnZUJveCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKG1lc3NhZ2VCb3hJZClcbiAgICAgICAgICAgIGlmIG1lc3NhZ2VCb3guY29tcG9uZW50c1xuICAgICAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gbWVzc2FnZUJveC5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBTa2lwcyBhbGwgYW5pbWF0aW9ucyBvZiBhbGwgbWVzc2FnZSBhcmVhcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBNZXNzYWdlQXJlYXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBza2lwTWVzc2FnZUFyZWFzOiAtPlxuICAgICAgICBmb3IgbWVzc2FnZUFyZWEgaW4gQG9iamVjdC5tZXNzYWdlQXJlYXNcbiAgICAgICAgICAgIGlmIG1lc3NhZ2VBcmVhPy5tZXNzYWdlXG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBtZXNzYWdlQXJlYS5tZXNzYWdlLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcblxuICAgICAgICBtc2cgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcImdhbWVNZXNzYWdlX21lc3NhZ2VcIilcbiAgICAgICAgaWYgbXNnXG4gICAgICAgICAgICBmb3IgY29tcG9uZW50IGluIG1zZy5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnNraXA/KClcbiAgICAgICAgbXNnID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJudmxHYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgICAgIGlmIG1zZ1xuICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBtc2cuY29tcG9uZW50c1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5za2lwPygpXG5cbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICMjIypcbiAgICAqIFNraXBzIHRoZSBzY2VuZSBpbnRlcnByZXRlciB0aW1lci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNraXBJbnRlcnByZXRlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIHNraXBJbnRlcnByZXRlcjogLT5cbiAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlci53YWl0Q291bnRlciA+IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwVGltZVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci53YWl0Q291bnRlciA9IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwVGltZVxuICAgICAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlci53YWl0Q291bnRlciA9PSAwXG4gICAgICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5pc1dhaXRpbmcgPSBub1xuXG4gICAgIyMjKlxuICAgICogU2tpcHMgdGhlIGludGVycHJldGVyIHRpbWVyIG9mIGFsbCBjb21tb24gZXZlbnRzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcENvbW1vbkV2ZW50c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIHNraXBDb21tb25FdmVudHM6IC0+XG4gICAgICAgIGV2ZW50cyA9IEBvYmplY3QuY29tbW9uRXZlbnRDb250YWluZXIuc3ViT2JqZWN0c1xuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgICBpZiBldmVudD8uaW50ZXJwcmV0ZXIgYW5kIGV2ZW50LmludGVycHJldGVyLndhaXRDb3VudGVyID4gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lXG4gICAgICAgICAgICAgICAgZXZlbnQuaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWVcbiAgICAgICAgICAgICAgICBpZiBldmVudC5pbnRlcnByZXRlci53YWl0Q291bnRlciA9PSAwXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmludGVycHJldGVyLmlzV2FpdGluZyA9IG5vXG5cbiAgICAjIyMqXG4gICAgKiBTa2lwcyB0aGUgc2NlbmUncyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcENvbnRlbnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBza2lwQ29udGVudDogLT5cbiAgICAgICAgQHNraXBQaWN0dXJlcygpXG4gICAgICAgIEBza2lwVGV4dHMoKVxuICAgICAgICBAc2tpcFZpZGVvcygpXG4gICAgICAgIEBza2lwQmFja2dyb3VuZHMoKVxuICAgICAgICBAc2tpcENoYXJhY3RlcnMoKVxuICAgICAgICBAc2tpcE1haW5WaWV3cG9ydCgpXG4gICAgICAgIEBza2lwVmlld3BvcnRzKClcbiAgICAgICAgQHNraXBNZXNzYWdlQm94ZXMoKVxuICAgICAgICBAc2tpcE1lc3NhZ2VBcmVhcygpXG4gICAgICAgIEBza2lwSW50ZXJwcmV0ZXIoKVxuICAgICAgICBAc2tpcENvbW1vbkV2ZW50cygpXG5cblxuICAgICMjIypcbiAgICAqIENoZWNrcyBmb3IgdGhlIHNob3J0Y3V0IHRvIGhpZGUvc2hvdyB0aGUgZ2FtZSBVSS4gQnkgZGVmYXVsdCwgdGhpcyBpcyB0aGUgc3BhY2Uta2V5LiBZb3VcbiAgICAqIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBjaGFuZ2UgdGhlIHNob3J0Y3V0LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlVUlWaXNpYmlsaXR5U2hvcnRjdXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICB1cGRhdGVVSVZpc2liaWxpdHlTaG9ydGN1dDogLT5cbiAgICAgICAgaWYgIUB1aVZpc2libGUgYW5kIChJbnB1dC50cmlnZ2VyKElucHV0LkMpIG9yIElucHV0Lk1vdXNlLmJ1dHRvbkRvd24pXG4gICAgICAgICAgICBAY2hhbmdlVUlWaXNpYmlsaXR5KCFAdWlWaXNpYmxlKVxuICAgICAgICBpZiBJbnB1dC50cmlnZ2VyKElucHV0LktFWV9TUEFDRSlcbiAgICAgICAgICAgIEBjaGFuZ2VVSVZpc2liaWxpdHkoIUB1aVZpc2libGUpXG5cbiAgICAjIyMqXG4gICAgKiBDaGVja3MgZm9yIHRoZSBzaG9ydGN1dCB0byBleGl0IHRoZSBnYW1lLiBCeSBkZWZhdWx0LCB0aGlzIGlzIHRoZSBlc2NhcGUta2V5LiBZb3VcbiAgICAqIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBjaGFuZ2UgdGhlIHNob3J0Y3V0LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlUXVpdFNob3J0Y3V0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgdXBkYXRlUXVpdFNob3J0Y3V0OiAtPlxuICAgICAgICBpZiBJbnB1dC50cmlnZ2VyKElucHV0LktFWV9FU0NBUEUpXG4gICAgICAgICAgICBncy5BcHBsaWNhdGlvbi5leGl0KClcblxuXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGZvciB0aGUgc2hvcnRjdXQgdG8gb3BlbiB0aGUgc2V0dGluZ3MgbWVudS4gQnkgZGVmYXVsdCwgdGhpcyBpcyB0aGUgcy1rZXkuIFlvdVxuICAgICogY2FuIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGNoYW5nZSB0aGUgc2hvcnRjdXQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVTZXR0aW5nc1Nob3J0Y3V0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgdXBkYXRlU2V0dGluZ3NTaG9ydGN1dDogLT5cbiAgICAgICAgaWYgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLm1lbnVBY2Nlc3MgYW5kIElucHV0LnRyaWdnZXIoSW5wdXQuWClcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXcgZ3MuT2JqZWN0X0xheW91dChcInNldHRpbmdzTWVudUxheW91dFwiKSwgdHJ1ZSlcblxuICAgICMjIypcbiAgICAqIENoZWNrcyBmb3IgdGhlIHNob3J0Y3V0IHRvIG9wZW4gdGhlIHNldHRpbmdzIG1lbnUuIEJ5IGRlZmF1bHQsIHRoaXMgaXMgdGhlIGNvbnRyb2wta2V5LiBZb3VcbiAgICAqIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBjaGFuZ2UgdGhlIHNob3J0Y3V0LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlU2tpcFNob3J0Y3V0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgdXBkYXRlU2tpcFNob3J0Y3V0OiAtPlxuICAgICAgICBpZiBAb2JqZWN0LnNldHRpbmdzLmFsbG93U2tpcFxuICAgICAgICAgICAgaWYgSW5wdXQua2V5c1tJbnB1dC5LRVlfQ09OVFJPTF0gPT0gMVxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwID0geWVzXG4gICAgICAgICAgICBlbHNlIGlmIElucHV0LmtleXNbSW5wdXQuS0VZX0NPTlRST0xdID09IDJcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCA9IG5vXG5cbiAgICAjIyMqXG4gICAgKiBDaGVja3MgZm9yIGRlZmF1bHQga2V5Ym9hcmQgc2hvcnRjdXRzIGUuZyBzcGFjZS1rZXkgdG8gaGlkZSB0aGUgVUksIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVNob3J0Y3V0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIHVwZGF0ZVNob3J0Y3V0czogLT5cbiAgICAgICAgcmV0dXJuIGlmICFAb2JqZWN0LmNhblJlY2VpdmVJbnB1dCgpXG4gICAgICAgIEB1cGRhdGVTZXR0aW5nc1Nob3J0Y3V0KClcbiAgICAgICAgQHVwZGF0ZVF1aXRTaG9ydGN1dCgpXG4gICAgICAgIEB1cGRhdGVVSVZpc2liaWxpdHlTaG9ydGN1dCgpXG4gICAgICAgIEB1cGRhdGVTa2lwU2hvcnRjdXQoKVxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgZnVsbCBzY3JlZW4gdmlkZW8gcGxheWVkIHZpYSBQbGF5IE1vdmllIGNvbW1hbmQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVWaWRlb1xuICAgICMjI1xuICAgIHVwZGF0ZVZpZGVvOiAtPlxuICAgICAgICBpZiBAb2JqZWN0LnZpZGVvP1xuICAgICAgICAgICAgQG9iamVjdC52aWRlby51cGRhdGUoKVxuICAgICAgICAgICAgaWYgQG9iamVjdC5zZXR0aW5ncy5hbGxvd1ZpZGVvU2tpcCBhbmQgKElucHV0LnRyaWdnZXIoSW5wdXQuQykgb3IgSW5wdXQuTW91c2UuYnV0dG9uc1tJbnB1dC5Nb3VzZS5MRUZUXSA9PSAyKVxuICAgICAgICAgICAgICAgIEBvYmplY3QudmlkZW8uc3RvcCgpXG4gICAgICAgICAgICBJbnB1dC5jbGVhcigpXG5cbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHNraXBwaW5nIGlmIGVuYWJsZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVTa2lwcGluZ1xuICAgICMjI1xuICAgIHVwZGF0ZVNraXBwaW5nOiAtPlxuICAgICAgICBpZiAhQG9iamVjdC5zZXR0aW5ncy5hbGxvd1NraXBcbiAgICAgICAgICAgIEBvYmplY3QudGVtcFNldHRpbmdzLnNraXAgPSBub1xuXG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICBAc2tpcENvbnRlbnQoKVxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgc2NlbmUncyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29udGVudFxuICAgICMjI1xuICAgIHVwZGF0ZUNvbnRlbnQ6IC0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgQG9iamVjdC5zY2VuZURvY3VtZW50P1xuICAgICAgICAjaWYgIUBvYmplY3QuaW50ZXJwcmV0ZXIuaXNSdW5uaW5nIGFuZCAhR3JhcGhpY3MuZnJvemVuXG4gICAgICAgICMgICAgQHNldHVwSW50ZXJwcmV0ZXIoKVxuICAgICAgICBHYW1lTWFuYWdlci5zY2VuZSA9IEBvYmplY3RcbiAgICAgICAgR3JhcGhpY3Mudmlld3BvcnQudXBkYXRlKClcbiAgICAgICAgQG9iamVjdC52aWV3cG9ydC51cGRhdGUoKVxuXG4gICAgICAgIEB1cGRhdGVTa2lwcGluZygpXG4gICAgICAgIEB1cGRhdGVWaWRlbygpXG4gICAgICAgIEB1cGRhdGVTaG9ydGN1dHMoKVxuXG4gICAgICAgIHN1cGVyKClcblxudm4uQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yID0gQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yIl19
//# sourceURL=Component_GameSceneBehavior_42.js