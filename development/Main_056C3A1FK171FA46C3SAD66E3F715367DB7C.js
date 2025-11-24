var Main;

Main = (function() {

  /**
  * Controls the boot-process of the game.
  *
  * @module gs
  * @class Main
  * @memberof gs
  * @constructor
   */
  function Main() {
    window.$ = jQuery.noConflict();
    this.languagesLoaded = false;
    this.frameCallback = null;
  }


  /**
  * Updates the current frame.
  *
  * @method updateFrame
   */

  Main.prototype.updateFrame = function() {
    if ($PARAMS.showDebugInfo) {
      window.startTime = window.performance != null ? window.performance.now() : Date.now();
    }
    SceneManager.update();
    Graphics.frameCount++;
    if ($PARAMS.showDebugInfo) {
      if (this.debugSprite == null) {
        this.debugSprite = new Sprite_Debug();
      }
      window.endTime = window.performance != null ? window.performance.now() : Date.now();
      if (Graphics.frameCount % 30 === 0) {
        this.debugSprite.frameTime = endTime - startTime;
        return this.debugSprite.redraw();
      }
    }
  };


  /**
  * Loads game data.
  *
  * @method loadData
   */

  Main.prototype.loadData = function() {
    RecordManager.load();
    DataManager.getDocumentsByType("global_variables");
    DataManager.getDocumentsByType("language_profile");
    return DataManager.getDocumentsByType("vn.chapter");
  };


  /**
  * Loads system data.
  *
  * @method loadSystemData
   */

  Main.prototype.loadSystemData = function() {
    DataManager.getDocument("RESOURCES");
    return DataManager.getDocument("SUMMARIES");
  };


  /**
  * Loads system resources such as graphics, sounds, fonts, etc.
  *
  * @method loadSystemResources
   */

  Main.prototype.loadSystemResources = function() {
    var j, language, len, ref, ref1, ref2;
    ResourceManager.loadFonts();
    ResourceLoader.loadSystemSounds(RecordManager.system);
    ResourceLoader.loadSystemGraphics(RecordManager.system);
    ref = LanguageManager.languages;
    for (j = 0, len = ref.length; j < len; j++) {
      language = ref[j];
      if (((ref1 = language.icon) != null ? (ref2 = ref1.name) != null ? ref2.length : void 0 : void 0) > 0) {
        ResourceManager.getBitmap(ResourceManager.getPath(language.icon));
      }
    }
    return gs.Fonts.initialize();
  };


  /**
  * Gets game settings.
  *
  * @method getSettings
   */

  Main.prototype.getSettings = function() {
    var settings;
    settings = GameStorage.getObject("settings");
    if ((settings == null) || settings.version !== 342) {
      GameManager.resetSettings();
      settings = GameManager.settings;
      this.firstStartup = true;
    }
    return settings;
  };


  /**
  * Sets up the game's global data. If it is outdated, this method will
  * reset the global game data.
  *
  * @method setupGlobalData
   */

  Main.prototype.setupGlobalData = function() {
    var globalData;
    globalData = GameStorage.getObject("globalData");
    GameManager.globalData = globalData;
    if (!globalData || globalData.version !== 342) {
      return GameManager.resetGlobalData();
    }
  };


  /**
  * Sets up game settings.
  *
  * @method setupGameSettings
  * @param {Object} settings - Current game settings.
   */

  Main.prototype.setupGameSettings = function(settings) {
    var cg, character, i, j, l, len, len1, ref, ref1, results;
    GameManager.settings = settings;
    ref = RecordManager.charactersArray;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      character = ref[i];
      if (character && !GameManager.settings.voicesByCharacter[character.index]) {
        GameManager.settings.voicesByCharacter[character.index] = 100;
      }
    }
    ref1 = RecordManager.cgGalleryArray;
    results = [];
    for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
      cg = ref1[i];
      if ((cg != null) && !GameManager.globalData.cgGallery[cg.index]) {
        results.push(GameManager.globalData.cgGallery[cg.index] = {
          unlocked: false
        });
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Sets up audio settings.
  *
  * @method setupAudioSettings
  * @param {Object} settings - Current game settings.
   */

  Main.prototype.setupAudioSettings = function(settings) {
    AudioManager.generalSoundVolume = settings.seVolume;
    AudioManager.generalMusicVolume = settings.bgmVolume;
    return AudioManager.generalVoiceVolume = settings.voiceVolume;
  };


  /**
  * Sets up video settings.
  *
  * @method setupVideoSettings
  * @param {Object} settings - Current game settings.
   */

  Main.prototype.setupVideoSettings = function(settings) {
    var electron;
    settings.renderer = 1;
    Graphics.keepRatio = !settings.adjustAspectRatio;
    Graphics.onResize();
    if (!this.firstStartup) {
      if (settings.fullScreen) {
        Graphics.enterFullscreen();
      } else {
        Graphics.leaveFullscreen();
      }
    }
    if (gs.Platform.isElectron) {
      electron = require("electron");
      electron.ipcRenderer.on("fullscreen-entered", function() {
        return GameManager.settings.fullScreen = true;
      });
      return electron.ipcRenderer.on("fullscreen-left", function() {
        return GameManager.settings.fullScreen = false;
      });
    }
  };


  /**
  * Sets up settings.
  *
  * @method setupSettings
   */

  Main.prototype.setupSettings = function() {
    var settings;
    settings = this.getSettings();
    this.setupGlobalData();
    this.setupGameSettings(settings);
    this.setupAudioSettings(settings);
    this.setupVideoSettings(settings);
    return GameStorage.setObject("settings", settings);
  };


  /**
  * Loads all system resources needed to start the actual game.
  *
  * @method load
  * @param {Function} callback - Called when all system resources are loaded.
   */

  Main.prototype.load = function(callback) {
    this.loadSystemData();
    return DataManager.events.on("loaded", (function(_this) {
      return function() {
        GameManager.tempFields = new gs.GameTemp();
        window.$tempFields = GameManager.tempFields;
        if (_this.languagesLoaded) {
          RecordManager.initialize();
          LanguageManager.initialize();
          SceneManager.initialize();
          _this.setupSettings();
        } else {
          _this.loadData();
        }
        if (_this.languagesLoaded) {
          _this.loadSystemResources();
          DataManager.events.off("loaded");
          ResourceManager.events.on("loaded", function() {
            GameManager.setupCursor();
            ResourceManager.events.off("loaded");
            ui.UIManager.setup();
            return callback();
          });
        }
        return _this.languagesLoaded = true;
      };
    })(this));
  };


  /**
  * Sets up the application.
  *
  * @method setupApplication
   */

  Main.prototype.setupApplication = function() {
    $PARAMS.showDebugInfo = false;
    window.ResourceManager = new window.ResourceManager();
    window.DataManager = new window.DataManager();
    window.Graphics = new Graphics_OpenGL();
    window.gs.Graphics = window.Graphics;
    window.Renderer = window.Renderer_OpenGL;
    return Texture2D.filter = 1;
  };


  /**
  * Initializes the input system to enable support for keyboard, mouse, touch, etc.
  *
  * @method setupInput
   */

  Main.prototype.setupInput = function() {
    Input.initialize();
    return Input.Mouse.initialize();
  };


  /**
  * Initializes the video system with the game's resolution. It is necessary to
  * call this method before using graphic object such as bitmaps, sprites, etc.
  *
  * @method setupVideo
   */

  Main.prototype.setupVideo = function() {
    this.frameCallback = this.createFrameCallback();
    Graphics.initialize($PARAMS.resolution.width, $PARAMS.resolution.height);
    Graphics.onDispose = (function(_this) {
      return function() {
        return ResourceManager.dispose();
      };
    })(this);
    Graphics.formats = [320, 384, 427];
    Graphics.scale = 0.5 / 240 * Graphics.height;
    Font.defaultSize = Math.round(9 / 240 * Graphics.height);
    return Graphics.onEachFrame(this.frameCallback);
  };


  /**
  * Registers shader-based effects. It is important to register all effects
  * before the graphics system is initialized.
  *
  * @method setupEffects
   */

  Main.prototype.setupEffects = function() {
    gs.Effect.registerEffect(gs.Effect.fragmentShaderInfos.lod_blur);
    return gs.Effect.registerEffect(gs.Effect.fragmentShaderInfos.pixelate);
  };


  /**
  * Initializes the Live2D. If Live2D is not available, it does nothing. Needs to be
  * called before using Live2D.
  *
  * @method setupLive2D
   */

  Main.prototype.setupLive2D = function() {
    var cubismOption;
    if (window.live2dframework) {
      cubismOption = new Option();
      cubismOption.logFunction = function(msg) {
        return console.log(msg);
      };
      cubismOption.loggingLevel = live2dframework.cubismdebug.LogLevel_Verbose;
      live2dframework.framework.CubismFramework.startUp(cubismOption);
      live2dframework.framework.CubismFramework.initialize();
    }
    if (window.Live2D) {
      Live2D.init();
      Live2D.setGL($gl);
      return Live2DFramework.setPlatformManager(new L2DPlatformManager());
    }
  };


  /**
  * Creates the frame-callback function called once per frame to update and render
  * the game.
  *
  * @method setupLive2D
  * @return {Function} The frame-callback function.
   */

  Main.prototype.createFrameCallback = function() {
    var callback;
    callback = null;
    if (($PARAMS.preview != null) || ($PARAMS.testOffline && window.parent !== window)) {
      callback = (function(_this) {
        return function(time) {
          var ex;
          try {
            if ($PARAMS.preview && !$PARAMS.preview.error) {
              return _this.updateFrame();
            }
          } catch (error) {
            ex = error;
            if ($PARAMS.preview || GameManager.inLivePreview) {
              $PARAMS.preview = {
                error: ex
              };
            }
            return console.log(ex);
          }
        };
      })(this);
    } else {
      callback = (function(_this) {
        return function(time) {
          return _this.updateFrame();
        };
      })(this);
    }
    return callback;
  };


  /**
  * Creates the start scene object. If an intro-scene is set, this method returns the
  * intro-scene. If the game runs in Live-Preview, this method returns the selected
  * scene in editor.
  *
  * @method createStartScene
  * @return {gs.Object_Base} The start-scene.
   */

  Main.prototype.createStartScene = function() {
    var introScene, ref, ref1, ref2, ref3, ref4, scene;
    scene = null;
    introScene = null;
    if (RecordManager.system.useIntroScene) {
      introScene = DataManager.getDocumentSummary((ref = RecordManager.system.introInfo) != null ? (ref1 = ref.scene) != null ? ref1.uid : void 0 : void 0);
    }
    if ($PARAMS.preview || introScene) {
      scene = new vn.Object_Scene();
      scene.sceneData.uid = ((ref2 = $PARAMS.preview) != null ? ref2.scene.uid : void 0) || ((ref3 = RecordManager.system.introInfo) != null ? (ref4 = ref3.scene) != null ? ref4.uid : void 0 : void 0);
      scene.events.on("dispose", function(e) {
        return GameManager.sceneData.uid = null;
      });
    } else if (LanguageManager.languages.length > 1) {
      scene = new gs.Object_Layout("languageMenuLayout");
    } else {
      scene = new gs.Object_Layout("titleLayout");
    }
    return scene;
  };


  /**
  * Boots the game by setting up the application window as well as the video, audio and input system.
  *
  * @method start
   */

  Main.prototype.start = function() {
    this.setupApplication();
    this.setupEffects();
    this.setupVideo();
    this.setupLive2D();
    this.setupInput();
    return this.load((function(_this) {
      return function() {
        return SceneManager.switchTo(_this.createStartScene());
      };
    })(this));
  };

  return Main;

})();

gs.Main = new Main();

gs.Application.initialize();

gs.Application.onReady = function() {
  Object.keys(gs).forEach(function(k) {
    gs[k].$namespace = "gs";
    return gs[k].$name = k;
  });
  Object.keys(vn).forEach(function(k) {
    vn[k].$namespace = "vn";
    return vn[k].$name = k;
  });
  Object.keys(ui).forEach(function(k) {
    ui[k].$namespace = "ui";
    return ui[k].$name = k;
  });
  return gs.Main.start();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVdBLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7O0VBUWEsY0FBQTtJQUNULE1BQU0sQ0FBQyxDQUFQLEdBQVcsTUFBTSxDQUFDLFVBQVAsQ0FBQTtJQUVYLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBQ25CLElBQUMsQ0FBQSxhQUFELEdBQWlCO0VBSlI7OztBQU1iOzs7Ozs7aUJBS0EsV0FBQSxHQUFhLFNBQUE7SUFDVCxJQUFHLE9BQU8sQ0FBQyxhQUFYO01BQ0ksTUFBTSxDQUFDLFNBQVAsR0FBc0IsMEJBQUgsR0FBNEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFuQixDQUFBLENBQTVCLEdBQTBELElBQUksQ0FBQyxHQUFMLENBQUEsRUFEakY7O0lBR0EsWUFBWSxDQUFDLE1BQWIsQ0FBQTtJQUNBLFFBQVEsQ0FBQyxVQUFUO0lBRUEsSUFBRyxPQUFPLENBQUMsYUFBWDtNQUNJLElBQU8sd0JBQVA7UUFBMEIsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxZQUFBLENBQUEsRUFBN0M7O01BRUEsTUFBTSxDQUFDLE9BQVAsR0FBb0IsMEJBQUgsR0FBNEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFuQixDQUFBLENBQTVCLEdBQTBELElBQUksQ0FBQyxHQUFMLENBQUE7TUFDM0UsSUFBRyxRQUFRLENBQUMsVUFBVCxHQUFzQixFQUF0QixLQUE0QixDQUEvQjtRQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUEwQixPQUFBLEdBQVU7ZUFDcEMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLENBQUEsRUFGSjtPQUpKOztFQVBTOzs7QUFlYjs7Ozs7O2lCQUtBLFFBQUEsR0FBVSxTQUFBO0lBQ04sYUFBYSxDQUFDLElBQWQsQ0FBQTtJQUNBLFdBQVcsQ0FBQyxrQkFBWixDQUErQixrQkFBL0I7SUFDQSxXQUFXLENBQUMsa0JBQVosQ0FBK0Isa0JBQS9CO1dBQ0Es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QUFDZCxFQUFFLENBQUMsV0FBVyxDQUFDLFVBQWYsQ0FBQTs7QUFDQSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQWYsR0FBeUIsU0FBQTtFQUVyQixNQUFNLENBQUMsSUFBUCxDQUFZLEVBQVosQ0FBZSxDQUFDLE9BQWhCLENBQXdCLFNBQUMsQ0FBRDtJQUFPLEVBQUcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxVQUFOLEdBQW1CO1dBQU0sRUFBRyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQU4sR0FBYztFQUE5QyxDQUF4QjtFQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksRUFBWixDQUFlLENBQUMsT0FBaEIsQ0FBd0IsU0FBQyxDQUFEO0lBQU8sRUFBRyxDQUFBLENBQUEsQ0FBRSxDQUFDLFVBQU4sR0FBbUI7V0FBTSxFQUFHLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBTixHQUFjO0VBQTlDLENBQXhCO0VBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxFQUFaLENBQWUsQ0FBQyxPQUFoQixDQUF3QixTQUFDLENBQUQ7SUFBTyxFQUFHLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBTixHQUFtQjtXQUFNLEVBQUcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFOLEdBQWM7RUFBOUMsQ0FBeEI7U0FFQSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQVIsQ0FBQTtBQU5xQiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogTWFpblxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgRW50cnkgcG9pbnQgb2YgeW91ciBnYW1lLlxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cblxuY2xhc3MgTWFpblxuICAgICMjIypcbiAgICAqIENvbnRyb2xzIHRoZSBib290LXByb2Nlc3Mgb2YgdGhlIGdhbWUuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIE1haW5cbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIHdpbmRvdy4kID0galF1ZXJ5Lm5vQ29uZmxpY3QoKVxuXG4gICAgICAgIEBsYW5ndWFnZXNMb2FkZWQgPSBub1xuICAgICAgICBAZnJhbWVDYWxsYmFjayA9IG51bGxcblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGN1cnJlbnQgZnJhbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVGcmFtZVxuICAgICMjI1xuICAgIHVwZGF0ZUZyYW1lOiAtPlxuICAgICAgICBpZiAkUEFSQU1TLnNob3dEZWJ1Z0luZm9cbiAgICAgICAgICAgIHdpbmRvdy5zdGFydFRpbWUgPSBpZiB3aW5kb3cucGVyZm9ybWFuY2U/IHRoZW4gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIGVsc2UgRGF0ZS5ub3coKVxuXG4gICAgICAgIFNjZW5lTWFuYWdlci51cGRhdGUoKVxuICAgICAgICBHcmFwaGljcy5mcmFtZUNvdW50KytcblxuICAgICAgICBpZiAkUEFSQU1TLnNob3dEZWJ1Z0luZm9cbiAgICAgICAgICAgIGlmIG5vdCBAZGVidWdTcHJpdGU/IHRoZW4gQGRlYnVnU3ByaXRlID0gbmV3IFNwcml0ZV9EZWJ1ZygpXG5cbiAgICAgICAgICAgIHdpbmRvdy5lbmRUaW1lID0gaWYgd2luZG93LnBlcmZvcm1hbmNlPyB0aGVuIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSBlbHNlIERhdGUubm93KClcbiAgICAgICAgICAgIGlmIEdyYXBoaWNzLmZyYW1lQ291bnQgJSAzMCA9PSAwXG4gICAgICAgICAgICAgICAgQGRlYnVnU3ByaXRlLmZyYW1lVGltZSA9IChlbmRUaW1lIC0gc3RhcnRUaW1lKVxuICAgICAgICAgICAgICAgIEBkZWJ1Z1Nwcml0ZS5yZWRyYXcoKVxuXG4gICAgIyMjKlxuICAgICogTG9hZHMgZ2FtZSBkYXRhLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZERhdGFcbiAgICAjIyNcbiAgICBsb2FkRGF0YTogLT5cbiAgICAgICAgUmVjb3JkTWFuYWdlci5sb2FkKClcbiAgICAgICAgRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRzQnlUeXBlKFwiZ2xvYmFsX3ZhcmlhYmxlc1wiKVxuICAgICAgICBEYXRhTWFuYWdlci5nZXREb2N1bWVudHNCeVR5cGUoXCJsYW5ndWFnZV9wcm9maWxlXCIpXG4gICAgICAgIERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcInZuLmNoYXB0ZXJcIilcblxuICAgICMjIypcbiAgICAqIExvYWRzIHN5c3RlbSBkYXRhLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZFN5c3RlbURhdGFcbiAgICAjIyNcbiAgICBsb2FkU3lzdGVtRGF0YTogLT5cbiAgICAgICAgRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoXCJSRVNPVVJDRVNcIilcbiAgICAgICAgRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoXCJTVU1NQVJJRVNcIilcblxuICAgICMjIypcbiAgICAqIExvYWRzIHN5c3RlbSByZXNvdXJjZXMgc3VjaCBhcyBncmFwaGljcywgc291bmRzLCBmb250cywgZXRjLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZFN5c3RlbVJlc291cmNlc1xuICAgICMjI1xuICAgIGxvYWRTeXN0ZW1SZXNvdXJjZXM6IC0+XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5sb2FkRm9udHMoKVxuICAgICAgICBSZXNvdXJjZUxvYWRlci5sb2FkU3lzdGVtU291bmRzKFJlY29yZE1hbmFnZXIuc3lzdGVtKVxuICAgICAgICBSZXNvdXJjZUxvYWRlci5sb2FkU3lzdGVtR3JhcGhpY3MoUmVjb3JkTWFuYWdlci5zeXN0ZW0pXG5cbiAgICAgICAgZm9yIGxhbmd1YWdlIGluIExhbmd1YWdlTWFuYWdlci5sYW5ndWFnZXNcbiAgICAgICAgICAgIGlmIGxhbmd1YWdlLmljb24/Lm5hbWU/Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGxhbmd1YWdlLmljb24pKVxuXG4gICAgICAgIGdzLkZvbnRzLmluaXRpYWxpemUoKVxuXG4gICAgIyMjKlxuICAgICogR2V0cyBnYW1lIHNldHRpbmdzLlxuICAgICpcbiAgICAqIEBtZXRob2QgZ2V0U2V0dGluZ3NcbiAgICAjIyNcbiAgICBnZXRTZXR0aW5nczogLT5cbiAgICAgICAgc2V0dGluZ3MgPSBHYW1lU3RvcmFnZS5nZXRPYmplY3QoXCJzZXR0aW5nc1wiKVxuXG4gICAgICAgIGlmIG5vdCBzZXR0aW5ncz8gb3Igc2V0dGluZ3MudmVyc2lvbiAhPSAzNDJcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnJlc2V0U2V0dGluZ3MoKVxuICAgICAgICAgICAgc2V0dGluZ3MgPSBHYW1lTWFuYWdlci5zZXR0aW5nc1xuICAgICAgICAgICAgQGZpcnN0U3RhcnR1cCA9IHRydWVcblxuICAgICAgICByZXR1cm4gc2V0dGluZ3NcblxuICAgICMjIypcbiAgICAqIFNldHMgdXAgdGhlIGdhbWUncyBnbG9iYWwgZGF0YS4gSWYgaXQgaXMgb3V0ZGF0ZWQsIHRoaXMgbWV0aG9kIHdpbGxcbiAgICAqIHJlc2V0IHRoZSBnbG9iYWwgZ2FtZSBkYXRhLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBHbG9iYWxEYXRhXG4gICAgIyMjXG4gICAgc2V0dXBHbG9iYWxEYXRhOiAtPlxuICAgICAgICBnbG9iYWxEYXRhID0gR2FtZVN0b3JhZ2UuZ2V0T2JqZWN0KFwiZ2xvYmFsRGF0YVwiKVxuICAgICAgICBHYW1lTWFuYWdlci5nbG9iYWxEYXRhID0gZ2xvYmFsRGF0YVxuXG4gICAgICAgIGlmICFnbG9iYWxEYXRhIHx8IGdsb2JhbERhdGEudmVyc2lvbiAhPSAzNDJcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnJlc2V0R2xvYmFsRGF0YSgpXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIGdhbWUgc2V0dGluZ3MuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEdhbWVTZXR0aW5nc1xuICAgICogQHBhcmFtIHtPYmplY3R9IHNldHRpbmdzIC0gQ3VycmVudCBnYW1lIHNldHRpbmdzLlxuICAgICMjI1xuICAgIHNldHVwR2FtZVNldHRpbmdzOiAoc2V0dGluZ3MpIC0+XG4gICAgICAgIEdhbWVNYW5hZ2VyLnNldHRpbmdzID0gc2V0dGluZ3NcbiAgICAgICAgI0dhbWVNYW5hZ2VyLnNldHRpbmdzLmZ1bGxTY3JlZW4gPSBHcmFwaGljcy5pc0Z1bGxzY3JlZW4oKVxuXG4gICAgICAgIGZvciBjaGFyYWN0ZXIsIGkgaW4gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzQXJyYXlcbiAgICAgICAgICAgIGlmIGNoYXJhY3RlciBhbmQgIUdhbWVNYW5hZ2VyLnNldHRpbmdzLnZvaWNlc0J5Q2hhcmFjdGVyW2NoYXJhY3Rlci5pbmRleF1cbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci5zZXR0aW5ncy52b2ljZXNCeUNoYXJhY3RlcltjaGFyYWN0ZXIuaW5kZXhdID0gMTAwXG4gICAgICAgIGZvciBjZywgaSBpbiBSZWNvcmRNYW5hZ2VyLmNnR2FsbGVyeUFycmF5XG4gICAgICAgICAgICBpZiBjZz8gYW5kICFHYW1lTWFuYWdlci5nbG9iYWxEYXRhLmNnR2FsbGVyeVtjZy5pbmRleF1cbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci5nbG9iYWxEYXRhLmNnR2FsbGVyeVtjZy5pbmRleF0gPSB7IHVubG9ja2VkOiBubyB9XG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIGF1ZGlvIHNldHRpbmdzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBBdWRpb1NldHRpbmdzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3MgLSBDdXJyZW50IGdhbWUgc2V0dGluZ3MuXG4gICAgIyMjXG4gICAgc2V0dXBBdWRpb1NldHRpbmdzOiAoc2V0dGluZ3MpIC0+XG4gICAgICAgIEF1ZGlvTWFuYWdlci5nZW5lcmFsU291bmRWb2x1bWUgPSBzZXR0aW5ncy5zZVZvbHVtZVxuICAgICAgICBBdWRpb01hbmFnZXIuZ2VuZXJhbE11c2ljVm9sdW1lID0gc2V0dGluZ3MuYmdtVm9sdW1lXG4gICAgICAgIEF1ZGlvTWFuYWdlci5nZW5lcmFsVm9pY2VWb2x1bWUgPSBzZXR0aW5ncy52b2ljZVZvbHVtZVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCB2aWRlbyBzZXR0aW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwVmlkZW9TZXR0aW5nc1xuICAgICogQHBhcmFtIHtPYmplY3R9IHNldHRpbmdzIC0gQ3VycmVudCBnYW1lIHNldHRpbmdzLlxuICAgICMjI1xuICAgIHNldHVwVmlkZW9TZXR0aW5nczogKHNldHRpbmdzKSAtPlxuICAgICAgICBzZXR0aW5ncy5yZW5kZXJlciA9IDFcbiAgICAgICAgR3JhcGhpY3Mua2VlcFJhdGlvID0gIXNldHRpbmdzLmFkanVzdEFzcGVjdFJhdGlvXG4gICAgICAgIEdyYXBoaWNzLm9uUmVzaXplKClcbiAgICAgICAgdW5sZXNzIEBmaXJzdFN0YXJ0dXBcbiAgICAgICAgICAgIGlmIHNldHRpbmdzLmZ1bGxTY3JlZW5cbiAgICAgICAgICAgICAgICBHcmFwaGljcy5lbnRlckZ1bGxzY3JlZW4oKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEdyYXBoaWNzLmxlYXZlRnVsbHNjcmVlbigpXG4gICAgICAgIGlmIGdzLlBsYXRmb3JtLmlzRWxlY3Ryb25cbiAgICAgICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZShcImVsZWN0cm9uXCIpXG4gICAgICAgICAgICBlbGVjdHJvbi5pcGNSZW5kZXJlci5vbiBcImZ1bGxzY3JlZW4tZW50ZXJlZFwiLCAtPlxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmZ1bGxTY3JlZW4gPSB0cnVlXG4gICAgICAgICAgICBlbGVjdHJvbi5pcGNSZW5kZXJlci5vbiBcImZ1bGxzY3JlZW4tbGVmdFwiLCAtPlxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmZ1bGxTY3JlZW4gPSBmYWxzZVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBzZXR0aW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwU2V0dGluZ3NcbiAgICAjIyNcbiAgICBzZXR1cFNldHRpbmdzOiAtPlxuICAgICAgICBzZXR0aW5ncyA9IEBnZXRTZXR0aW5ncygpXG5cbiAgICAgICAgQHNldHVwR2xvYmFsRGF0YSgpXG4gICAgICAgIEBzZXR1cEdhbWVTZXR0aW5ncyhzZXR0aW5ncylcbiAgICAgICAgQHNldHVwQXVkaW9TZXR0aW5ncyhzZXR0aW5ncylcbiAgICAgICAgQHNldHVwVmlkZW9TZXR0aW5ncyhzZXR0aW5ncylcblxuXG4gICAgICAgIEdhbWVTdG9yYWdlLnNldE9iamVjdChcInNldHRpbmdzXCIsIHNldHRpbmdzKVxuXG4gICAgIyMjKlxuICAgICogTG9hZHMgYWxsIHN5c3RlbSByZXNvdXJjZXMgbmVlZGVkIHRvIHN0YXJ0IHRoZSBhY3R1YWwgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRcbiAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGVkIHdoZW4gYWxsIHN5c3RlbSByZXNvdXJjZXMgYXJlIGxvYWRlZC5cbiAgICAjIyNcbiAgICBsb2FkOiAoY2FsbGJhY2spIC0+XG4gICAgICAgIEBsb2FkU3lzdGVtRGF0YSgpXG5cbiAgICAgICAgRGF0YU1hbmFnZXIuZXZlbnRzLm9uIFwibG9hZGVkXCIsID0+XG4gICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wRmllbGRzID0gbmV3IGdzLkdhbWVUZW1wKClcbiAgICAgICAgICAgIHdpbmRvdy4kdGVtcEZpZWxkcyA9IEdhbWVNYW5hZ2VyLnRlbXBGaWVsZHNcblxuICAgICAgICAgICAgaWYgQGxhbmd1YWdlc0xvYWRlZFxuICAgICAgICAgICAgICAgIFJlY29yZE1hbmFnZXIuaW5pdGlhbGl6ZSgpXG4gICAgICAgICAgICAgICAgTGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoKVxuICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5pbml0aWFsaXplKClcbiAgICAgICAgICAgICAgICBAc2V0dXBTZXR0aW5ncygpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGxvYWREYXRhKClcblxuICAgICAgICAgICAgaWYgQGxhbmd1YWdlc0xvYWRlZFxuICAgICAgICAgICAgICAgIEBsb2FkU3lzdGVtUmVzb3VyY2VzKClcbiAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5ldmVudHMub2ZmIFwibG9hZGVkXCJcbiAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZXZlbnRzLm9uIFwibG9hZGVkXCIsID0+XG4gICAgICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNldHVwQ3Vyc29yKClcbiAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmV2ZW50cy5vZmYgXCJsb2FkZWRcIlxuICAgICAgICAgICAgICAgICAgICB1aS5VSU1hbmFnZXIuc2V0dXAoKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpXG5cbiAgICAgICAgICAgIEBsYW5ndWFnZXNMb2FkZWQgPSB5ZXNcblxuXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCB0aGUgYXBwbGljYXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEFwcGxpY2F0aW9uXG4gICAgIyMjXG4gICAgc2V0dXBBcHBsaWNhdGlvbjogLT5cbiAgICAgICAgJFBBUkFNUy5zaG93RGVidWdJbmZvID0gbm9cbiAgICAgICAgd2luZG93LlJlc291cmNlTWFuYWdlciA9IG5ldyB3aW5kb3cuUmVzb3VyY2VNYW5hZ2VyKClcbiAgICAgICAgd2luZG93LkRhdGFNYW5hZ2VyID0gbmV3IHdpbmRvdy5EYXRhTWFuYWdlcigpXG5cbiAgICAgICAgIyBGb3JjZSBPcGVuR0wgcmVuZGVyZXJcbiAgICAgICAgd2luZG93LkdyYXBoaWNzID0gbmV3IEdyYXBoaWNzX09wZW5HTCgpXG4gICAgICAgIHdpbmRvdy5ncy5HcmFwaGljcyA9IHdpbmRvdy5HcmFwaGljc1xuICAgICAgICB3aW5kb3cuUmVuZGVyZXIgPSB3aW5kb3cuUmVuZGVyZXJfT3BlbkdMXG5cbiAgICAgICAgIyBGb3JjZSBsaW5lYXIgZmlsdGVyaW5nXG4gICAgICAgIFRleHR1cmUyRC5maWx0ZXIgPSAxXG5cbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgaW5wdXQgc3lzdGVtIHRvIGVuYWJsZSBzdXBwb3J0IGZvciBrZXlib2FyZCwgbW91c2UsIHRvdWNoLCBldGMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cElucHV0XG4gICAgIyMjXG4gICAgc2V0dXBJbnB1dDogLT5cbiAgICAgICAgSW5wdXQuaW5pdGlhbGl6ZSgpXG4gICAgICAgIElucHV0Lk1vdXNlLmluaXRpYWxpemUoKVxuXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIHZpZGVvIHN5c3RlbSB3aXRoIHRoZSBnYW1lJ3MgcmVzb2x1dGlvbi4gSXQgaXMgbmVjZXNzYXJ5IHRvXG4gICAgKiBjYWxsIHRoaXMgbWV0aG9kIGJlZm9yZSB1c2luZyBncmFwaGljIG9iamVjdCBzdWNoIGFzIGJpdG1hcHMsIHNwcml0ZXMsIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwVmlkZW9cbiAgICAjIyNcbiAgICBzZXR1cFZpZGVvOiAtPlxuICAgICAgICBAZnJhbWVDYWxsYmFjayA9IEBjcmVhdGVGcmFtZUNhbGxiYWNrKClcblxuICAgICAgICBHcmFwaGljcy5pbml0aWFsaXplKCRQQVJBTVMucmVzb2x1dGlvbi53aWR0aCwgJFBBUkFNUy5yZXNvbHV0aW9uLmhlaWdodClcbiAgICAgICAgI0dyYXBoaWNzLm9uRm9jdXNSZWNlaXZlID0gPT4gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBub1xuICAgICAgICBHcmFwaGljcy5vbkRpc3Bvc2UgPSA9PiBSZXNvdXJjZU1hbmFnZXIuZGlzcG9zZSgpXG4gICAgICAgIEdyYXBoaWNzLmZvcm1hdHMgPSBbMzIwLCAzODQsIDQyN11cbiAgICAgICAgR3JhcGhpY3Muc2NhbGUgPSAwLjUgLyAyNDAgKiBHcmFwaGljcy5oZWlnaHRcbiAgICAgICAgRm9udC5kZWZhdWx0U2l6ZSA9IE1hdGgucm91bmQoOSAvIDI0MCAqIEdyYXBoaWNzLmhlaWdodClcblxuICAgICAgICBHcmFwaGljcy5vbkVhY2hGcmFtZShAZnJhbWVDYWxsYmFjaylcblxuICAgICMjIypcbiAgICAqIFJlZ2lzdGVycyBzaGFkZXItYmFzZWQgZWZmZWN0cy4gSXQgaXMgaW1wb3J0YW50IHRvIHJlZ2lzdGVyIGFsbCBlZmZlY3RzXG4gICAgKiBiZWZvcmUgdGhlIGdyYXBoaWNzIHN5c3RlbSBpcyBpbml0aWFsaXplZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwRWZmZWN0c1xuICAgICMjI1xuICAgIHNldHVwRWZmZWN0czogLT5cbiAgICAgICAgIyBSZWdpc3RlciBidWlsdC1pbiBMT0QvQm94IEJsdXIgZWZmZWN0XG4gICAgICAgIGdzLkVmZmVjdC5yZWdpc3RlckVmZmVjdChncy5FZmZlY3QuZnJhZ21lbnRTaGFkZXJJbmZvcy5sb2RfYmx1cilcbiAgICAgICAgIyBSZWdpc3RlciBidWlsdC1pbiBwaXhlbGF0ZSBlZmZlY3RcbiAgICAgICAgZ3MuRWZmZWN0LnJlZ2lzdGVyRWZmZWN0KGdzLkVmZmVjdC5mcmFnbWVudFNoYWRlckluZm9zLnBpeGVsYXRlKVxuXG4gICAgICAgICMgVGhpcyBpcyBhbiBleGFtcGxlIG9mIGhvdyB0byByZWdpc3RlciB5b3VyIG93biBzaGFkZXItZWZmZWN0LlxuICAgICAgICAjIFNlZSBFZmZlY3RzID4gQ2lyY3VsYXJEaXN0b3J0aW9uRWZmZWN0IHNjcmlwdCBmb3IgbW9yZSBpbmZvLlxuICAgICAgICAjIGdzLkNpcmN1bGFyRGlzdG9ydGlvbkVmZmVjdC5yZWdpc3RlcigpXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIExpdmUyRC4gSWYgTGl2ZTJEIGlzIG5vdCBhdmFpbGFibGUsIGl0IGRvZXMgbm90aGluZy4gTmVlZHMgdG8gYmVcbiAgICAqIGNhbGxlZCBiZWZvcmUgdXNpbmcgTGl2ZTJELlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBMaXZlMkRcbiAgICAjIyNcbiAgICBzZXR1cExpdmUyRDogLT5cbiAgICAgICAgaWYgd2luZG93LmxpdmUyZGZyYW1ld29ya1xuICAgICAgICAgICAgY3ViaXNtT3B0aW9uID0gbmV3IE9wdGlvbigpXG4gICAgICAgICAgICBjdWJpc21PcHRpb24ubG9nRnVuY3Rpb24gPSAobXNnKSAtPiBjb25zb2xlLmxvZyhtc2cpXG4gICAgICAgICAgICBjdWJpc21PcHRpb24ubG9nZ2luZ0xldmVsID0gbGl2ZTJkZnJhbWV3b3JrLmN1YmlzbWRlYnVnLkxvZ0xldmVsX1ZlcmJvc2VcbiAgICAgICAgICAgIGxpdmUyZGZyYW1ld29yay5mcmFtZXdvcmsuQ3ViaXNtRnJhbWV3b3JrLnN0YXJ0VXAoY3ViaXNtT3B0aW9uKVxuICAgICAgICAgICAgbGl2ZTJkZnJhbWV3b3JrLmZyYW1ld29yay5DdWJpc21GcmFtZXdvcmsuaW5pdGlhbGl6ZSgpXG4gICAgICAgIGlmIHdpbmRvdy5MaXZlMkRcbiAgICAgICAgICAgIExpdmUyRC5pbml0KClcbiAgICAgICAgICAgIExpdmUyRC5zZXRHTCgkZ2wpXG4gICAgICAgICAgICBMaXZlMkRGcmFtZXdvcmsuc2V0UGxhdGZvcm1NYW5hZ2VyKG5ldyBMMkRQbGF0Zm9ybU1hbmFnZXIoKSlcblxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgdGhlIGZyYW1lLWNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBvbmNlIHBlciBmcmFtZSB0byB1cGRhdGUgYW5kIHJlbmRlclxuICAgICogdGhlIGdhbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cExpdmUyRFxuICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBmcmFtZS1jYWxsYmFjayBmdW5jdGlvbi5cbiAgICAjIyNcbiAgICBjcmVhdGVGcmFtZUNhbGxiYWNrOiAtPlxuICAgICAgICBjYWxsYmFjayA9IG51bGxcblxuICAgICAgICBpZiAkUEFSQU1TLnByZXZpZXc/IG9yICgkUEFSQU1TLnRlc3RPZmZsaW5lICYmIHdpbmRvdy5wYXJlbnQgIT0gd2luZG93KVxuICAgICAgICAgICAgY2FsbGJhY2sgPSAodGltZSkgPT5cbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgaWYgJFBBUkFNUy5wcmV2aWV3ICYmICEkUEFSQU1TLnByZXZpZXcuZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGVGcmFtZSgpXG4gICAgICAgICAgICAgICAgY2F0Y2ggZXhcbiAgICAgICAgICAgICAgICAgICAgaWYgJFBBUkFNUy5wcmV2aWV3IG9yIEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICRQQVJBTVMucHJldmlldyA9IGVycm9yOiBleFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhleClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2FsbGJhY2sgPSAodGltZSkgPT4gQHVwZGF0ZUZyYW1lKClcblxuICAgICAgICByZXR1cm4gY2FsbGJhY2tcblxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgdGhlIHN0YXJ0IHNjZW5lIG9iamVjdC4gSWYgYW4gaW50cm8tc2NlbmUgaXMgc2V0LCB0aGlzIG1ldGhvZCByZXR1cm5zIHRoZVxuICAgICogaW50cm8tc2NlbmUuIElmIHRoZSBnYW1lIHJ1bnMgaW4gTGl2ZS1QcmV2aWV3LCB0aGlzIG1ldGhvZCByZXR1cm5zIHRoZSBzZWxlY3RlZFxuICAgICogc2NlbmUgaW4gZWRpdG9yLlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlU3RhcnRTY2VuZVxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X0Jhc2V9IFRoZSBzdGFydC1zY2VuZS5cbiAgICAjIyNcbiAgICBjcmVhdGVTdGFydFNjZW5lOiAtPlxuICAgICAgICBzY2VuZSA9IG51bGxcbiAgICAgICAgaW50cm9TY2VuZSA9IG51bGxcblxuICAgICAgICBpZiBSZWNvcmRNYW5hZ2VyLnN5c3RlbS51c2VJbnRyb1NjZW5lXG4gICAgICAgICAgICBpbnRyb1NjZW5lID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRTdW1tYXJ5KFJlY29yZE1hbmFnZXIuc3lzdGVtLmludHJvSW5mbz8uc2NlbmU/LnVpZClcblxuICAgICAgICBpZiAkUEFSQU1TLnByZXZpZXcgb3IgaW50cm9TY2VuZVxuICAgICAgICAgICAgc2NlbmUgPSBuZXcgdm4uT2JqZWN0X1NjZW5lKClcbiAgICAgICAgICAgIHNjZW5lLnNjZW5lRGF0YS51aWQgPSAkUEFSQU1TLnByZXZpZXc/LnNjZW5lLnVpZCB8fCBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5pbnRyb0luZm8/LnNjZW5lPy51aWRcbiAgICAgICAgICAgIHNjZW5lLmV2ZW50cy5vbiBcImRpc3Bvc2VcIiwgKGUpIC0+IEdhbWVNYW5hZ2VyLnNjZW5lRGF0YS51aWQgPSBudWxsXG4gICAgICAgIGVsc2UgaWYgTGFuZ3VhZ2VNYW5hZ2VyLmxhbmd1YWdlcy5sZW5ndGggPiAxXG4gICAgICAgICAgICBzY2VuZSA9IG5ldyBncy5PYmplY3RfTGF5b3V0KFwibGFuZ3VhZ2VNZW51TGF5b3V0XCIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNjZW5lID0gbmV3IGdzLk9iamVjdF9MYXlvdXQoXCJ0aXRsZUxheW91dFwiKVxuXG4gICAgICAgIHJldHVybiBzY2VuZVxuXG4gICAgIyMjKlxuICAgICogQm9vdHMgdGhlIGdhbWUgYnkgc2V0dGluZyB1cCB0aGUgYXBwbGljYXRpb24gd2luZG93IGFzIHdlbGwgYXMgdGhlIHZpZGVvLCBhdWRpbyBhbmQgaW5wdXQgc3lzdGVtLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RhcnRcbiAgICAjIyNcbiAgICBzdGFydDogLT5cbiAgICAgICAgQHNldHVwQXBwbGljYXRpb24oKVxuICAgICAgICBAc2V0dXBFZmZlY3RzKClcbiAgICAgICAgQHNldHVwVmlkZW8oKVxuICAgICAgICBAc2V0dXBMaXZlMkQoKVxuICAgICAgICBAc2V0dXBJbnB1dCgpXG5cbiAgICAgICAgQGxvYWQgPT4gU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKEBjcmVhdGVTdGFydFNjZW5lKCkpXG5cblxuIyBUaGUgZW50cnkgcG9pbnQgb2YgdGhlIGdhbWUuXG5ncy5NYWluID0gbmV3IE1haW4oKVxuZ3MuQXBwbGljYXRpb24uaW5pdGlhbGl6ZSgpXG5ncy5BcHBsaWNhdGlvbi5vblJlYWR5ID0gLT5cbiAgICAjIEFkZCBtZXRhIGRhdGEgdG8gYWxsIGNsYXNzIG9iamVjdHMgbmVjZXNzYXJ5IGZvciBvYmplY3Qgc2VyaWFsaXphdGlvbi5cbiAgICBPYmplY3Qua2V5cyhncykuZm9yRWFjaCAoaykgLT4gZ3Nba10uJG5hbWVzcGFjZSA9IFwiZ3NcIjsgZ3Nba10uJG5hbWUgPSBrXG4gICAgT2JqZWN0LmtleXModm4pLmZvckVhY2ggKGspIC0+IHZuW2tdLiRuYW1lc3BhY2UgPSBcInZuXCI7IHZuW2tdLiRuYW1lID0ga1xuICAgIE9iamVjdC5rZXlzKHVpKS5mb3JFYWNoIChrKSAtPiB1aVtrXS4kbmFtZXNwYWNlID0gXCJ1aVwiOyB1aVtrXS4kbmFtZSA9IGtcbiAgICBcbiAgICBncy5NYWluLnN0YXJ0KClcbiAgICBcblxuXG5cblxuXG4iXX0=
//# sourceURL=Main_106.js