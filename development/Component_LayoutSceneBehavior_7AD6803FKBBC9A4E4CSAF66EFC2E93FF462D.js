var Component_LayoutSceneBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_LayoutSceneBehavior = (function(superClass) {
  extend(Component_LayoutSceneBehavior, superClass);


  /**
  * The base class of all scene-behavior components. A scene-behavior component
  * define the logic of a single game scene.
  *
  * @module gs
  * @class Component_LayoutSceneBehavior
  * @extends gs.Component_SceneBehavior
  * @memberof gs
   */

  function Component_LayoutSceneBehavior() {
    Component_LayoutSceneBehavior.__super__.constructor.call(this);
    this.objectManager = SceneManager;
    this.layout = null;
    this.resourceContext = null;
  }


  /**
  * Initializes the scene.
  *
  * @method initialize
   */

  Component_LayoutSceneBehavior.prototype.initialize = function() {
    Component_LayoutSceneBehavior.__super__.initialize.apply(this, arguments);
    this.resourceContext = ResourceManager.createContext();
    ResourceManager.context = this.resourceContext;
    if (this.object.layoutData == null) {
      this.object.layoutData = {
        "type": "ui.FreeLayout",
        "controls": [],
        "frame": [0, 0, 1, 1]
      };
    }
    return LanguageManager.loadBundles();
  };


  /**
  * Disposes the scene.
  *
  * @method dispose
   */

  Component_LayoutSceneBehavior.prototype.dispose = function() {
    return Component_LayoutSceneBehavior.__super__.dispose.apply(this, arguments);
  };


  /**
  * Prepares all data for the scene and loads the necessary graphic and audio resources.
  *
  * @method prepareData
  * @abstract
   */

  Component_LayoutSceneBehavior.prototype.prepareData = function() {
    gs.ObjectManager.current = this.objectManager;
    if (!GameManager.initialized) {
      GameManager.initialize();
    }
    this.dataFields = ui.UiFactory.dataSources[this.object.layoutData.dataSource || "default"]();
    window.$dataFields = this.dataFields;
    this.music = ui.Component_FormulaHandler.fieldValue(this.object, this.object.layoutData.music);
    AudioManager.loadMusic(this.music);
    this.prepareTransition(RecordManager.system.menuTransition);
    ResourceLoader.loadUiTypesGraphics(ui.UiFactory.customTypes);
    ResourceLoader.loadUiLayoutGraphics(this.object.layoutData);
    if (this.dataFields != null) {
      return ResourceLoader.loadUiDataFieldsGraphics(this.dataFields);
    }
  };


  /**
  * Prepares all visual game object for the scene.
  *
  * @method prepareVisual
   */

  Component_LayoutSceneBehavior.prototype.prepareVisual = function() {
    var scale, vocab;
    scale = Graphics.scale;
    vocab = RecordManager.vocabulary;
    if (this.layout == null) {
      this.dataObject = {};
      this.layout = ui.UiFactory.createFromDescriptor(this.object.layoutData, this.object);
      if (this.music != null) {
        AudioManager.changeMusic(this.music, 30);
      }
    }
    this.layout.ui.prepare();
    this.layout.ui.appear();
    this.layout.update();
    this.transition();
    if (SceneManager.previousScenes.length === 0) {
      if (GameManager.tempFields.isExitingGame) {
        GameManager.tempFields.isExitingGame = false;
        return gs.GameNotifier.postResetSceneChange(this.object.layoutName);
      } else {
        return gs.GameNotifier.postSceneChange(this.object.layoutName);
      }
    }
  };


  /**
  * Updates the scene's content.
  *
  * @method updateContent
   */

  Component_LayoutSceneBehavior.prototype.updateContent = function() {
    GameManager.update();
    return Graphics.viewport.update();
  };


  /**
  * Shows/Hides the current scene. A hidden scene is no longer shown and executed
  * but all objects and data is still there and be shown again anytime.
  *
  * @method show
  * @param {boolean} visible - Indicates if the scene should be shown or hidden.
   */

  Component_LayoutSceneBehavior.prototype.show = function(visible) {
    if (visible) {
      ResourceManager.context = this.resourceContext;
    }
    this.layout.visible = visible;
    this.layout.update();
    this.objectManager.active = visible;
    if (visible) {
      return gs.ObjectManager.current = SceneManager;
    }
  };


  /**
  * Action method which triggers a full refresh on the object returned by the specified binding-expression.
  * The params must be a direct binding-expression string.
  *
  * @method fullRefreshObject
  * @param {gs.Object_Base} sender - The sender object.
  * @param {string} params -  The binding expression.
   */

  Component_LayoutSceneBehavior.prototype.fullRefreshObject = function(sender, object) {
    object = ui.Component_FormulaHandler.fieldValue(sender, object);
    return object != null ? object.fullRefresh() : void 0;
  };


  /**
  * Action method which triggers a refresh on the object returned by the specified binding-expression.
  * The params must be a direct binding-expression string.
  *
  * @method refreshObject
  * @param {gs.Object_Base} sender - The sender object.
  * @param {string} params -  The binding expression.
   */

  Component_LayoutSceneBehavior.prototype.refreshObject = function(sender, object) {
    object = ui.Component_FormulaHandler.fieldValue(sender, object);
    return object != null ? object.needsUpdate = true : void 0;
  };

  Component_LayoutSceneBehavior.prototype.addStyle = function(sender, style) {
    var styleObject;
    styleObject = ui.UIManager.styles[style];
    if (styleObject != null) {
      styleObject.apply(sender);
    }
    sender.needsUpdate = true;
    if (styleObject != null ? styleObject.font : void 0) {
      return sender.behavior.refresh();
    }
  };

  Component_LayoutSceneBehavior.prototype.removeStyle = function(sender, style) {
    var i, len, ref, ref1, s, styleObject;
    styleObject = ui.UIManager.styles[style];
    if (styleObject != null) {
      styleObject.revert(sender);
    }
    sender.descriptor.styles.remove(style);
    ref = sender.descriptor.styles;
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      if ((ref1 = ui.UIManager.styles[s]) != null) {
        ref1.apply(sender);
      }
    }
    sender.needsUpdate = true;
    if (styleObject != null ? styleObject.font : void 0) {
      return sender.behavior.refresh();
    }
  };


  /**
  * Action method which executes the specified bindings.
  *
  * @method executeBindings
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object[]} params -  An array of binding-definitions.
   */

  Component_LayoutSceneBehavior.prototype.executeBindings = function(sender, bindings) {
    var binding, i, len;
    for (i = 0, len = bindings.length; i < len; i++) {
      binding = bindings[i];
      ui.Component_FormulaHandler.executeBinding(sender, binding);
    }
    return null;
  };


  /**
  * Action method which executes the specified formulas.
  *
  * @method executeFormulas
  * @param {gs.Object_Base} sender - The sender object.
  * @param {ui.Formula[]} params -  An array of formula-definitions.
   */

  Component_LayoutSceneBehavior.prototype.executeFormulas = function(sender, formulas) {
    var formula, i, len, results;
    results = [];
    for (i = 0, len = formulas.length; i < len; i++) {
      formula = formulas[i];
      results.push(ui.Component_FormulaHandler.executeFormula(sender, formula));
    }
    return results;
  };


  /**
  * Action method which executes an animation on a specified target game object.
  *
  * @method executeAnimation
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params -  Contains target-id and animations: { target, animations }
   */

  Component_LayoutSceneBehavior.prototype.executeAnimation = function(sender, params) {
    var animation, object;
    object = ui.Component_FormulaHandler.fieldValue(sender, params.target);
    animation = object != null ? object.animations.first(function(a) {
      return a.event === params.event;
    }) : void 0;
    if (animation && object) {
      return object.animationExecutor.execute(animation);
    }
  };


  /**
  * Action method which emits the specified event.
  *
  * @method emitEvent
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains event name, source and data.
  * <ul>
  * <li>params.name - The name of the event to emit</li>
  * <li>params.source - A binding-expression to define the game object which should emit the event.</li>
  * <li>params.data - An object containing additional event specific data.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.emitEvent = function(sender, params) {
    var object;
    object = ui.Component_FormulaHandler.fieldValue(sender, params.source);
    return object != null ? object.events.emit(params.name, object, ui.Component_FormulaHandler.fieldValue(sender, params.data)) : void 0;
  };


  /**
  * Action method which changes the game's aspect ratio.
  *
  * @method executeBindings
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean} params -  If <b>true</b> the game screen will stretched so that it fills the entire screen
  * of the player without any black borders. Otherwise the game screen stretches but keeps its ratio
  * so black borders are possible if the game resolution's ratio and the target display's ratio are not match. It can also
  * be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.adjustAspectRatio = function(sender, adjust) {
    adjust = ui.Component_FormulaHandler.fieldValue(sender, adjust);
    GameManager.settings.adjustAspectRatio = adjust;
    Graphics.keepRatio = !adjust;
    return Graphics.onResize();
  };


  /**
  * Action method which enters fullscreen mode.
  *
  * @method enterFullScreen
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean} params - Can be <b>null</b>
   */

  Component_LayoutSceneBehavior.prototype.enterFullScreen = function(sender, params) {
    return gs.Graphics.enterFullscreen();
  };


  /**
  * Action method which leaves fullscreen mode.
  *
  * @method leaveFullScreen
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean} params - Can be <b>null</b>
   */

  Component_LayoutSceneBehavior.prototype.leaveFullScreen = function() {
    return gs.Graphics.leaveFullscreen();
  };


  /**
  * Action method which toggles between window and fullscreen mode.
  *
  * @method toggleFullScreen
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>
   */

  Component_LayoutSceneBehavior.prototype.toggleFullScreen = function(sender, params) {
    if (gs.Graphics.isFullscreen()) {
      gs.Graphics.leaveFullscreen();
    } else {
      gs.Graphics.enterFullscreen();
    }
    return GameManager.settings.fullScreen = gs.Graphics.isFullscreen();
  };


  /**
  * Action method which plays the specified sound.
  *
  * @method playSound
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - The sound to play.
   */

  Component_LayoutSceneBehavior.prototype.playSound = function(sender, params) {
    AudioManager.loadSound(params);
    return AudioManager.playSound(params);
  };


  /**
  * Action method which plays the specified voice.
  *
  * @method playVoice
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - The voice to play.
   */

  Component_LayoutSceneBehavior.prototype.playVoice = function(sender, params) {
    AudioManager.loadSound(params);
    return AudioManager.playVoice(params);
  };


  /**
  * Action method which turns voice on or off.
  *
  * @method turnOnOffVoice
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - If <b>true</b> voice will be turned on. Otherwise it will be turned off. Can also be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.turnOnOffVoice = function(sender, state) {
    if (ui.Component_FormulaHandler.fieldValue(sender, state)) {
      return this.turnOnVoice();
    } else {
      return this.turnOffVoice();
    }
  };


  /**
  * Action method which turns music on or off.
  *
  * @method turnOnOffMusic
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - If <b>true</b> music will be turned on. Otherwise it will be turned off. Can also be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.turnOnOffMusic = function(sender, state) {
    if (ui.Component_FormulaHandler.fieldValue(sender, state)) {
      return this.turnOnMusic();
    } else {
      return this.turnOffMusic();
    }
  };


  /**
  * Action method which turns sound on or off.
  *
  * @method turnOnOffSound
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - If <b>true</b> sound will be turned on. Otherwise it will be turned off. Can also be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.turnOnOffSound = function(sender, state) {
    if (ui.Component_FormulaHandler.fieldValue(sender, state)) {
      return this.turnOnSound();
    } else {
      return this.turnOffSound();
    }
  };


  /**
  * Action method which turns off voice.
  *
  * @method turnOffVoice
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOffVoice = function() {
    return AudioManager.stopAllVoices();
  };


  /**
  * Action method which turns off music.
  *
  * @method turnOffMusic
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOffMusic = function() {
    return AudioManager.stopMusic();
  };


  /**
  * Action method which turns off sound.
  *
  * @method turnOffSound
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOffSound = function() {
    return AudioManager.stopAllSounds();
  };


  /**
  * Action method which turns on voice.
  *
  * @method turnOnVoice
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOnVoice = function() {};


  /**
  * Action method which turns on sound.
  *
  * @method turnOnSound
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOnSound = function() {};


  /**
  * Action method which turns on music.
  *
  * @method turnOnMusic
  * @param {gs.Object_Base} sender - The sender object.
  * @param {boolean|string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.turnOnMusic = function() {
    return AudioManager.resumeMusic();
  };


  /**
  * Action method which selects the specified language.
  *
  * @method selectLanguage
  * @param {gs.Object_Base} sender - The sender object.
  * @param {number|string} params - Index of the language to set. Can be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.selectLanguage = function(sender, params) {
    var language;
    language = LanguageManager.languages[ui.Component_FormulaHandler.fieldValue(sender, params)];
    return LanguageManager.selectLanguage(language);
  };


  /**
  * Action method which resets global data storage.
  *
  * @method resetGlobalData
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.resetGlobalData = function(sender) {
    return GameManager.resetGlobalData();
  };


  /**
  * Action method which saves game settings.
  *
  * @method saveSettings
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.saveSettings = function(sender) {
    return GameManager.saveSettings();
  };


  /**
  * Action method which prepares the game for saving by taking a snapshot of the current game state
  * and storing it in GameManager.saveGame.
  *
  * @method prepareSaveGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.prepareSaveGame = function(sender, params) {
    return GameManager.prepareSaveGame(params != null ? params.snapshot : void 0);
  };


  /**
  * Action method which saves the current game at the specified save slot.
  *
  * @method saveGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains the slot-index where the game should be saved.
  * <ul>
  * <li>params.slot - The slot-index where the game should be saved. Can be a binding-expression.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.saveGame = function(sender, params) {
    return GameManager.save(ui.Component_FormulaHandler.fieldValue(sender, params.slot));
  };


  /**
  * Action method which loads the game from the specified save slot.
  *
  * @method loadGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains the slot-index where the game should be loaded from.
  * <ul>
  * <li>params.slot - The slot-index where the game should be loaded from. Can be a binding-expression.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.loadGame = function(sender, params) {
    GameManager.tempSettings.skip = false;
    return GameManager.load(ui.Component_FormulaHandler.fieldValue(sender, params.slot));
  };


  /**
  * Action method which starts a new game.
  *
  * @method newGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>
   */

  Component_LayoutSceneBehavior.prototype.newGame = function(sender, params) {
    var scene;
    AudioManager.stopAllMusic(30);
    GameManager.newGame();
    scene = new vn.Object_Scene();
    SceneManager.clear();
    return SceneManager.switchTo(scene);
  };


  /**
  * Action method which exists the current game. It doesn't change the scene and
  * should be called before switching back to the title screen or main menu.
  *
  * @method exitGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>
   */

  Component_LayoutSceneBehavior.prototype.exitGame = function(sender, params) {
    return GameManager.exitGame();
  };


  /**
  * Action method which switches to another scene.
  *
  * @method switchScene
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains the class name of the scene to switch to.
  * <ul>
  * <li>params.name - The class-name of the scene to switch to. The class must be defined in vn-namespace.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.switchScene = function(sender, params) {
    var f;
    f = (function(_this) {
      return function() {
        var scene;
        if (params.clear) {
          SceneManager.clear();
        }
        scene = new vn[params.name]();
        return SceneManager.switchTo(scene, params.savePrevious);
      };
    })(this);
    if (!params.savePrevious) {
      return this.layout.ui.disappear((function(_this) {
        return function(e) {
          return f();
        };
      })(this));
    } else {
      return f();
    }
  };


  /**
  * Action method which switches to another game scene.
  *
  * @method switchGameScene
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains the UID of the scene to switch to.
  * <ul>
  * <li>params.uid - The UID of the scene to switch to.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.switchGameScene = function(sender, params) {
    var f;
    f = (function(_this) {
      return function() {
        var newScene, sceneData, sceneDocument, sceneDocuments, uid;
        if (params.clear) {
          SceneManager.clear();
        }
        uid = params.uid;
        if (params.name) {
          sceneDocuments = DataManager.getDocumentsByType("vn.scene");
          sceneDocument = sceneDocuments.first(function(d) {
            return d.items.name === params.name;
          });
          if (sceneDocument) {
            uid = sceneDocument.uid;
          }
        }
        sceneData = {
          uid: uid,
          pictures: [],
          texts: []
        };
        GameManager.sceneData = sceneData;
        newScene = new vn.Object_Scene();
        newScene.sceneData = sceneData;
        return SceneManager.switchTo(newScene, params.savePrevious);
      };
    })(this);
    if (!params.savePrevious) {
      return (this.layout || this.object.layout).ui.disappear((function(_this) {
        return function(e) {
          return f();
        };
      })(this));
    } else {
      return f();
    }
  };


  /**
  * Action method which switches to another layout.
  *
  * @method switchLayout
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Contains the name of the layout to switch to.
  * <ul>
  * <li>params.name - The name of the layout to switch to.</li>
  * <li>params.savePrevious - Indicates if the current layout should not be erased but paused and hidden instead so
  * that it can be restored using <i>returnToPrevious</i> action.</li>
  * <li>params.dataFields - Defines the data of "$dataFields" binding-expression variable. Can be a binding-expression
  * or a direct object. Optional.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.switchLayout = function(sender, layout) {
    var f;
    f = (function(_this) {
      return function() {
        var dataFields, i, len, ref, scene, senderField;
        Graphics.freeze();
        if (layout.clear) {
          SceneManager.clear();
        }
        scene = new gs.Object_Layout(layout.name);
        dataFields = sender.dataFields;
        if (typeof layout.dataFields === "string") {
          dataFields = ui.Component_FormulaHandler.fieldValue(sender, layout.dataFields);
        } else if (layout.dataFields != null) {
          dataFields = layout.dataFields;
        }
        scene.dataFields = dataFields;
        scene.controllers = layout.controllers;
        if (layout.senderData != null) {
          ref = layout.senderData;
          for (i = 0, len = ref.length; i < len; i++) {
            senderField = ref[i];
            scene[senderField] = sender[senderField];
          }
        }
        return SceneManager.switchTo(scene, layout.savePrevious, layout.stack);
      };
    })(this);
    if (!layout.savePrevious) {
      return (this.layout || this.object.layout).ui.disappear((function(_this) {
        return function(e) {
          return f();
        };
      })(this));
    } else {
      return f();
    }
  };


  /**
  * Action method which returns to previous layout. (If savePrevious was set to <b>true</b> on switchLayout.).
  *
  * @method previousLayout
  * @param {gs.Object_Base} sender - The sender object.
  * @param {Object} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.previousLayout = function(sender) {
    return SceneManager.returnToPrevious();
  };


  /**
  * Action method which disposes the specified control.
  *
  * @method disposeControl
  * @param {gs.Object_Base} sender - The sender object.
  * @param {string} params - The ID of the control to dispose. Can be a binding-expression.
   */

  Component_LayoutSceneBehavior.prototype.disposeControl = function(sender, id) {
    var control;
    control = this.objectManager.objectById(ui.Component_FormulaHandler.fieldValue(sender, id));
    return control != null ? control.ui.disappear(function(sender) {
      return sender.dispose();
    }) : void 0;
  };


  /**
  * Action method which creates a new control from the specified descriptor.
  *
  * @method createControl
  * @param {gs.Object_Base} sender - The sender object.
  * @param {string} params - Contains the descriptor and other data needed to construct the control.
  * <ul>
  * <li>params.descriptor - The control' descriptor. Can be a direct descriptor definition or a template name</li>
  * <li>params.parent - A binding-expression which returns the control's parent.</li>
  * <li>params.senderData - An object containing additional data merged into the control object.</li>
  * </ul>
   */

  Component_LayoutSceneBehavior.prototype.createControl = function(sender, data) {
    var control, descriptor, fieldName, i, len, parent, ref;
    if (typeof data.descriptor === "string") {
      descriptor = ui.UIManager.customTypes[data.descriptor];
    } else {
      descriptor = data.descriptor;
    }
    parent = ui.Component_FormulaHandler.fieldValue(sender, data.parent);
    control = ui.UiFactory._createFromDescriptor(descriptor, parent != null ? parent : this.object.layout || this.object);
    if (data.senderData != null) {
      ref = data.senderData;
      for (i = 0, len = ref.length; i < len; i++) {
        fieldName = ref[i];
        control[fieldName] = sender[fieldName];
      }
    }
    control.ui.prepare();
    control.ui.appear();
    return control;
  };


  /**
  * Action method which quits the game.
  *
  * @method quitGame
  * @param {gs.Object_Base} sender - The sender object.
  * @param {string} params - Can be <b>null</b>.
   */

  Component_LayoutSceneBehavior.prototype.quitGame = function(sender, data) {
    return SceneManager.switchTo(null);
  };

  return Component_LayoutSceneBehavior;

})(gs.Component_SceneBehavior);

gs.Component_LayoutSceneBehavior = Component_LayoutSceneBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsNkJBQUE7RUFBQTs7O0FBQU07Ozs7QUFFRjs7Ozs7Ozs7OztFQVNhLHVDQUFBO0lBQ1QsNkRBQUE7SUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsSUFBQyxDQUFBLGVBQUQsR0FBbUI7RUFMVjs7O0FBT2I7Ozs7OzswQ0FLQSxVQUFBLEdBQVksU0FBQTtJQUNSLCtEQUFBLFNBQUE7SUFFQSxJQUFDLENBQUEsZUFBRCxHQUFtQixlQUFlLENBQUMsYUFBaEIsQ0FBQTtJQUNuQixlQUFlLENBQUMsT0FBaEIsR0FBMEIsSUFBQyxDQUFBO0lBRTNCLElBQU8sOEJBQVA7TUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsR0FBcUI7UUFBRSxNQUFBLEVBQVEsZUFBVjtRQUEyQixVQUFBLEVBQVksRUFBdkM7UUFBMkMsT0FBQSxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFwRDtRQUR6Qjs7V0FHQSxlQUFlLENBQUMsV0FBaEIsQ0FBQTtFQVRROzs7QUFXWjs7Ozs7OzBDQUtBLE9BQUEsR0FBUyxTQUFBO1dBQ0wsNERBQUEsU0FBQTtFQURLOzs7QUFHVDs7Ozs7OzswQ0FNQSxXQUFBLEdBQWEsU0FBQTtJQUNULEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBakIsR0FBMkIsSUFBQyxDQUFBO0lBRTVCLElBQUcsQ0FBSSxXQUFXLENBQUMsV0FBbkI7TUFDSSxXQUFXLENBQUMsVUFBWixDQUFBLEVBREo7O0lBR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVksQ0FBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFuQixJQUFpQyxTQUFqQyxDQUF6QixDQUFBO0lBQ2QsTUFBTSxDQUFDLFdBQVAsR0FBcUIsSUFBQyxD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TUFBRCxFQUFTLElBQVQ7QUFDWCxRQUFBO0lBQUEsSUFBRyxPQUFPLElBQUksQ0FBQyxVQUFaLEtBQTBCLFFBQTdCO01BQ0ksVUFBQSxHQUFhLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBWSxDQUFBLElBQUksQ0FBQyxVQUFMLEVBRDFDO0tBQUEsTUFBQTtNQUdJLFVBQUEsR0FBYSxJQUFJLENBQUMsV0FIdEI7O0lBS0EsTUFBQSxHQUFTLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxVQUE1QixDQUF1QyxNQUF2QyxFQUErQyxJQUFJLENBQUMsTUFBcEQ7SUFDVCxPQUFBLEdBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxxQkFBYixDQUFtQyxVQUFuQyxtQkFBK0MsU0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsSUFBZ0IsSUFBQyxDQUFBLE1BQTFFO0lBRVYsSUFBRyx1QkFBSDtBQUNJO0FBQUEsV0FBQSxxQ0FBQTs7UUFDSSxPQUFRLENBQUEsU0FBQSxDQUFSLEdBQXFCLE1BQU8sQ0FBQSxTQUFBO0FBRGhDLE9BREo7O0lBR0EsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFYLENBQUE7SUFDQSxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQVgsQ0FBQTtBQUVBLFdBQU87RUFmSTs7O0FBaUJmOzs7Ozs7OzswQ0FPQSxRQUFBLEdBQVUsU0FBQyxNQUFELEVBQVMsSUFBVDtXQUNOLFlBQVksQ0FBQyxRQUFiLENBQXNCLElBQXRCO0VBRE07Ozs7R0ExbkI4QixFQUFFLENBQUM7O0FBK25CL0MsRUFBRSxDQUFDLDZCQUFILEdBQW1DIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfTGF5b3V0U2NlbmVCZWhhdmlvcuOAgFxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X0xheW91dFNjZW5lQmVoYXZpb3IgZXh0ZW5kcyBncy5Db21wb25lbnRfU2NlbmVCZWhhdmlvclxuICAjICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJvYmplY3RNYW5hZ2VyXCJdXG4gICAgIyMjKlxuICAgICogVGhlIGJhc2UgY2xhc3Mgb2YgYWxsIHNjZW5lLWJlaGF2aW9yIGNvbXBvbmVudHMuIEEgc2NlbmUtYmVoYXZpb3IgY29tcG9uZW50XG4gICAgKiBkZWZpbmUgdGhlIGxvZ2ljIG9mIGEgc2luZ2xlIGdhbWUgc2NlbmUuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9MYXlvdXRTY2VuZUJlaGF2aW9yXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRfU2NlbmVCZWhhdmlvclxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIHN1cGVyKClcblxuICAgICAgICBAb2JqZWN0TWFuYWdlciA9IFNjZW5lTWFuYWdlclxuICAgICAgICBAbGF5b3V0ID0gbnVsbFxuICAgICAgICBAcmVzb3VyY2VDb250ZXh0ID0gbnVsbFxuXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICMjI1xuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgQHJlc291cmNlQ29udGV4dCA9IFJlc291cmNlTWFuYWdlci5jcmVhdGVDb250ZXh0KClcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmNvbnRleHQgPSBAcmVzb3VyY2VDb250ZXh0XG5cbiAgICAgICAgaWYgbm90IEBvYmplY3QubGF5b3V0RGF0YT9cbiAgICAgICAgICAgIEBvYmplY3QubGF5b3V0RGF0YSA9IHsgXCJ0eXBlXCI6IFwidWkuRnJlZUxheW91dFwiLCBcImNvbnRyb2xzXCI6IFtdLCBcImZyYW1lXCI6IFswLCAwLCAxLCAxXSB9XG5cbiAgICAgICAgTGFuZ3VhZ2VNYW5hZ2VyLmxvYWRCdW5kbGVzKClcblxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyNcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBzdXBlclxuXG4gICAgIyMjKlxuICAgICogUHJlcGFyZXMgYWxsIGRhdGEgZm9yIHRoZSBzY2VuZSBhbmQgbG9hZHMgdGhlIG5lY2Vzc2FyeSBncmFwaGljIGFuZCBhdWRpbyByZXNvdXJjZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBwcmVwYXJlRGF0YVxuICAgICogQGFic3RyYWN0XG4gICAgIyMjXG4gICAgcHJlcGFyZURhdGE6IC0+XG4gICAgICAgIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudCA9IEBvYmplY3RNYW5hZ2VyXG5cbiAgICAgICAgaWYgbm90IEdhbWVNYW5hZ2VyLmluaXRpYWxpemVkXG4gICAgICAgICAgICBHYW1lTWFuYWdlci5pbml0aWFsaXplKClcblxuICAgICAgICBAZGF0YUZpZWxkcyA9IHVpLlVpRmFjdG9yeS5kYXRhU291cmNlc1tAb2JqZWN0LmxheW91dERhdGEuZGF0YVNvdXJjZSB8fCBcImRlZmF1bHRcIl0oKVxuICAgICAgICB3aW5kb3cuJGRhdGFGaWVsZHMgPSBAZGF0YUZpZWxkc1xuICAgICAgICBAbXVzaWMgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShAb2JqZWN0LCBAb2JqZWN0LmxheW91dERhdGEubXVzaWMpXG4gICAgICAgIEF1ZGlvTWFuYWdlci5sb2FkTXVzaWMoQG11c2ljKVxuICAgICAgICBAcHJlcGFyZVRyYW5zaXRpb24oUmVjb3JkTWFuYWdlci5zeXN0ZW0ubWVudVRyYW5zaXRpb24pXG5cbiAgICAgICAgUmVzb3VyY2VMb2FkZXIubG9hZFVpVHlwZXNHcmFwaGljcyh1aS5VaUZhY3RvcnkuY3VzdG9tVHlwZXMpXG4gICAgICAgIFJlc291cmNlTG9hZGVyLmxvYWRVaUxheW91dEdyYXBoaWNzKEBvYmplY3QubGF5b3V0RGF0YSlcblxuICAgICAgICBpZiBAZGF0YUZpZWxkcz9cbiAgICAgICAgICAgIFJlc291cmNlTG9hZGVyLmxvYWRVaURhdGFGaWVsZHNHcmFwaGljcyhAZGF0YUZpZWxkcylcblxuICAgICMjIypcbiAgICAqIFByZXBhcmVzIGFsbCB2aXN1YWwgZ2FtZSBvYmplY3QgZm9yIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXBhcmVWaXN1YWxcbiAgICAjIyNcbiAgICBwcmVwYXJlVmlzdWFsOiAtPlxuICAgICAgICBzY2FsZSA9IEdyYXBoaWNzLnNjYWxlXG4gICAgICAgIHZvY2FiID0gUmVjb3JkTWFuYWdlci52b2NhYnVsYXJ5XG5cbiAgICAgICAgaWYgbm90IEBsYXlvdXQ/XG4gICAgICAgICAgICBAZGF0YU9iamVjdCA9IHt9XG4gICAgICAgICAgICBAbGF5b3V0ID0gdWkuVWlGYWN0b3J5LmNyZWF0ZUZyb21EZXNjcmlwdG9yKEBvYmplY3QubGF5b3V0RGF0YSwgQG9iamVjdClcblxuICAgICAgICAgICAgaWYgQG11c2ljP1xuICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5jaGFuZ2VNdXNpYyhAbXVzaWMsIDMwKVxuXG5cbiAgICAgICAgQGxheW91dC51aS5wcmVwYXJlKClcbiAgICAgICAgQGxheW91dC51aS5hcHBlYXIoKVxuICAgICAgICBAbGF5b3V0LnVwZGF0ZSgpXG5cbiAgICAgICAgQHRyYW5zaXRpb24oKVxuXG4gICAgICAgIGlmIFNjZW5lTWFuYWdlci5wcmV2aW91c1NjZW5lcy5sZW5ndGggPT0gMFxuICAgICAgICAgICAgaWYgR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5pc0V4aXRpbmdHYW1lXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcEZpZWxkcy5pc0V4aXRpbmdHYW1lID0gbm9cbiAgICAgICAgICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdFJlc2V0U2NlbmVDaGFuZ2UoQG9iamVjdC5sYXlvdXROYW1lKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0U2NlbmVDaGFuZ2UoQG9iamVjdC5sYXlvdXROYW1lKVxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgc2NlbmUncyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29udGVudFxuICAgICMjI1xuICAgIHVwZGF0ZUNvbnRlbnQ6IC0+XG4gICAgICAgIEdhbWVNYW5hZ2VyLnVwZGF0ZSgpXG4gICAgICAgIEdyYXBoaWNzLnZpZXdwb3J0LnVwZGF0ZSgpXG5cbiAgICAjIyMqXG4gICAgKiBTaG93cy9IaWRlcyB0aGUgY3VycmVudCBzY2VuZS4gQSBoaWRkZW4gc2NlbmUgaXMgbm8gbG9uZ2VyIHNob3duIGFuZCBleGVjdXRlZFxuICAgICogYnV0IGFsbCBvYmplY3RzIGFuZCBkYXRhIGlzIHN0aWxsIHRoZXJlIGFuZCBiZSBzaG93biBhZ2FpbiBhbnl0aW1lLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2hvd1xuICAgICogQHBhcmFtIHtib29sZWFufSB2aXNpYmxlIC0gSW5kaWNhdGVzIGlmIHRoZSBzY2VuZSBzaG91bGQgYmUgc2hvd24gb3IgaGlkZGVuLlxuICAgICMjI1xuICAgIHNob3c6ICh2aXNpYmxlKSAtPlxuICAgICAgICBpZiB2aXNpYmxlXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuY29udGV4dCA9IEByZXNvdXJjZUNvbnRleHRcbiAgICAgICAgQGxheW91dC52aXNpYmxlID0gdmlzaWJsZVxuICAgICAgICBAbGF5b3V0LnVwZGF0ZSgpXG4gICAgICAgIEBvYmplY3RNYW5hZ2VyLmFjdGl2ZSA9IHZpc2libGVcbiAgICAgICAgaWYgdmlzaWJsZVxuICAgICAgICAgICAgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50ID0gU2NlbmVNYW5hZ2VyICNAb2JqZWN0TWFuYWdlclxuICAgICAgICAjQG9iamVjdE1hbmFnZXIudXBkYXRlKClcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdHJpZ2dlcnMgYSBmdWxsIHJlZnJlc2ggb24gdGhlIG9iamVjdCByZXR1cm5lZCBieSB0aGUgc3BlY2lmaWVkIGJpbmRpbmctZXhwcmVzc2lvbi5cbiAgICAqIFRoZSBwYXJhbXMgbXVzdCBiZSBhIGRpcmVjdCBiaW5kaW5nLWV4cHJlc3Npb24gc3RyaW5nLlxuICAgICpcbiAgICAqIEBtZXRob2QgZnVsbFJlZnJlc2hPYmplY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtcyAtICBUaGUgYmluZGluZyBleHByZXNzaW9uLlxuICAgICMjI1xuICAgIGZ1bGxSZWZyZXNoT2JqZWN0OiAoc2VuZGVyLCBvYmplY3QpIC0+XG4gICAgICAgIG9iamVjdCA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgb2JqZWN0KVxuICAgICAgICBvYmplY3Q/LmZ1bGxSZWZyZXNoKClcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdHJpZ2dlcnMgYSByZWZyZXNoIG9uIHRoZSBvYmplY3QgcmV0dXJuZWQgYnkgdGhlIHNwZWNpZmllZCBiaW5kaW5nLWV4cHJlc3Npb24uXG4gICAgKiBUaGUgcGFyYW1zIG11c3QgYmUgYSBkaXJlY3QgYmluZGluZy1leHByZXNzaW9uIHN0cmluZy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlZnJlc2hPYmplY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtcyAtICBUaGUgYmluZGluZyBleHByZXNzaW9uLlxuICAgICMjI1xuICAgIHJlZnJlc2hPYmplY3Q6IChzZW5kZXIsIG9iamVjdCkgLT5cbiAgICAgICAgb2JqZWN0ID0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc2VuZGVyLCBvYmplY3QpXG4gICAgICAgIG9iamVjdD8ubmVlZHNVcGRhdGUgPSB0cnVlXG5cbiAgICBhZGRTdHlsZTogKHNlbmRlciwgc3R5bGUpIC0+XG4gICAgICAgIHN0eWxlT2JqZWN0ID0gdWkuVUlNYW5hZ2VyLnN0eWxlc1tzdHlsZV1cbiAgICAgICAgc3R5bGVPYmplY3Q/LmFwcGx5KHNlbmRlcilcbiAgICAgICAgc2VuZGVyLm5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgIGlmIHN0eWxlT2JqZWN0Py5mb250XG4gICAgICAgICAgICBzZW5kZXIuYmVoYXZpb3IucmVmcmVzaCgpXG5cbiAgICByZW1vdmVTdHlsZTogKHNlbmRlciwgc3R5bGUpIC0+XG4gICAgICAgIHN0eWxlT2JqZWN0ID0gdWkuVUlNYW5hZ2VyLnN0eWxlc1tzdHlsZV1cbiAgICAgICAgc3R5bGVPYmplY3Q/LnJldmVydChzZW5kZXIpXG4gICAgICAgIHNlbmRlci5kZXNjcmlwdG9yLnN0eWxlcy5yZW1vdmUoc3R5bGUpXG5cbiAgICAgICAgZm9yIHMgaW4gc2VuZGVyLmRlc2NyaXB0b3Iuc3R5bGVzXG4gICAgICAgICAgICB1aS5VSU1hbmFnZXIuc3R5bGVzW3NdPy5hcHBseShzZW5kZXIpXG4gICAgICAgIHNlbmRlci5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICBpZiBzdHlsZU9iamVjdD8uZm9udFxuICAgICAgICAgICAgc2VuZGVyLmJlaGF2aW9yLnJlZnJlc2goKVxuXG5cblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggZXhlY3V0ZXMgdGhlIHNwZWNpZmllZCBiaW5kaW5ncy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVCaW5kaW5nc1xuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdFtdfSBwYXJhbXMgLSAgQW4gYXJyYXkgb2YgYmluZGluZy1kZWZpbml0aW9ucy5cbiAgICAjIyNcbiAgICBleGVjdXRlQmluZGluZ3M6IChzZW5kZXIsIGJpbmRpbmdzKSAtPlxuICAgICAgICBmb3IgYmluZGluZyBpbiBiaW5kaW5nc1xuICAgICAgICAgICAgdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmV4ZWN1dGVCaW5kaW5nKHNlbmRlciwgYmluZGluZylcblxuICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBleGVjdXRlcyB0aGUgc3BlY2lmaWVkIGZvcm11bGFzLlxuICAgICpcbiAgICAqIEBtZXRob2QgZXhlY3V0ZUZvcm11bGFzXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7dWkuRm9ybXVsYVtdfSBwYXJhbXMgLSAgQW4gYXJyYXkgb2YgZm9ybXVsYS1kZWZpbml0aW9ucy5cbiAgICAjIyNcbiAgICBleGVjdXRlRm9ybXVsYXM6IChzZW5kZXIsIGZvcm11bGFzKSAtPlxuICAgICAgICBmb3IgZm9ybXVsYSBpbiBmb3JtdWxhc1xuICAgICAgICAgICAgdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmV4ZWN1dGVGb3JtdWxhKHNlbmRlciwgZm9ybXVsYSlcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggZXhlY3V0ZXMgYW4gYW5pbWF0aW9uIG9uIGEgc3BlY2lmaWVkIHRhcmdldCBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVBbmltYXRpb25cbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtICBDb250YWlucyB0YXJnZXQtaWQgYW5kIGFuaW1hdGlvbnM6IHsgdGFyZ2V0LCBhbmltYXRpb25zIH1cbiAgICAjIyNcbiAgICBleGVjdXRlQW5pbWF0aW9uOiAoc2VuZGVyLCBwYXJhbXMpIC0+XG4gICAgICAgIG9iamVjdCA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgcGFyYW1zLnRhcmdldClcbiAgICAgICAgYW5pbWF0aW9uID0gb2JqZWN0Py5hbmltYXRpb25zLmZpcnN0IChhKSAtPiBhLmV2ZW50ID09IHBhcmFtcy5ldmVudFxuXG4gICAgICAgIGlmIGFuaW1hdGlvbiBhbmQgb2JqZWN0XG4gICAgICAgICAgICBvYmplY3QuYW5pbWF0aW9uRXhlY3V0b3IuZXhlY3V0ZShhbmltYXRpb24pXG5cbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIGVtaXRzIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCBlbWl0RXZlbnRcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIENvbnRhaW5zIGV2ZW50IG5hbWUsIHNvdXJjZSBhbmQgZGF0YS5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT5wYXJhbXMubmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byBlbWl0PC9saT5cbiAgICAqIDxsaT5wYXJhbXMuc291cmNlIC0gQSBiaW5kaW5nLWV4cHJlc3Npb24gdG8gZGVmaW5lIHRoZSBnYW1lIG9iamVjdCB3aGljaCBzaG91bGQgZW1pdCB0aGUgZXZlbnQuPC9saT5cbiAgICAqIDxsaT5wYXJhbXMuZGF0YSAtIEFuIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZXZlbnQgc3BlY2lmaWMgZGF0YS48L2xpPlxuICAgICogPC91bD5cbiAgICAjIyNcbiAgICBlbWl0RXZlbnQ6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgb2JqZWN0ID0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc2VuZGVyLCBwYXJhbXMuc291cmNlKVxuICAgICAgICBvYmplY3Q/LmV2ZW50cy5lbWl0KHBhcmFtcy5uYW1lLCBvYmplY3QsIHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgcGFyYW1zLmRhdGEpKVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBjaGFuZ2VzIHRoZSBnYW1lJ3MgYXNwZWN0IHJhdGlvLlxuICAgICpcbiAgICAqIEBtZXRob2QgZXhlY3V0ZUJpbmRpbmdzXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zIC0gIElmIDxiPnRydWU8L2I+IHRoZSBnYW1lIHNjcmVlbiB3aWxsIHN0cmV0Y2hlZCBzbyB0aGF0IGl0IGZpbGxzIHRoZSBlbnRpcmUgc2NyZWVuXG4gICAgKiBvZiB0aGUgcGxheWVyIHdpdGhvdXQgYW55IGJsYWNrIGJvcmRlcnMuIE90aGVyd2lzZSB0aGUgZ2FtZSBzY3JlZW4gc3RyZXRjaGVzIGJ1dCBrZWVwcyBpdHMgcmF0aW9cbiAgICAqIHNvIGJsYWNrIGJvcmRlcnMgYXJlIHBvc3NpYmxlIGlmIHRoZSBnYW1lIHJlc29sdXRpb24ncyByYXRpbyBhbmQgdGhlIHRhcmdldCBkaXNwbGF5J3MgcmF0aW8gYXJlIG5vdCBtYXRjaC4gSXQgY2FuIGFsc29cbiAgICAqIGJlIGEgYmluZGluZy1leHByZXNzaW9uLlxuICAgICMjI1xuICAgIGFkanVzdEFzcGVjdFJhdGlvOiAoc2VuZGVyLCBhZGp1c3QpIC0+XG4gICAgICAgIGFkanVzdCA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgYWRqdXN0KVxuXG4gICAgICAgIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmFkanVzdEFzcGVjdFJhdGlvID0gYWRqdXN0XG4gICAgICAgIEdyYXBoaWNzLmtlZXBSYXRpbyA9ICFhZGp1c3RcbiAgICAgICAgR3JhcGhpY3Mub25SZXNpemUoKVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBlbnRlcnMgZnVsbHNjcmVlbiBtb2RlLlxuICAgICpcbiAgICAqIEBtZXRob2QgZW50ZXJGdWxsU2NyZWVuXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+XG4gICAgIyMjXG4gICAgZW50ZXJGdWxsU2NyZWVuOiAoc2VuZGVyLCBwYXJhbXMpIC0+XG4gICAgICAgIGdzLkdyYXBoaWNzLmVudGVyRnVsbHNjcmVlbigpXG5cblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggbGVhdmVzIGZ1bGxzY3JlZW4gbW9kZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxlYXZlRnVsbFNjcmVlblxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcyAtIENhbiBiZSA8Yj5udWxsPC9iPlxuICAgICMjI1xuICAgIGxlYXZlRnVsbFNjcmVlbjogLT5cbiAgICAgICAgZ3MuR3JhcGhpY3MubGVhdmVGdWxsc2NyZWVuKClcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdG9nZ2xlcyBiZXR3ZWVuIHdpbmRvdyBhbmQgZnVsbHNjcmVlbiBtb2RlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdG9nZ2xlRnVsbFNjcmVlblxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj5cbiAgICAjIyNcbiAgICB0b2dnbGVGdWxsU2NyZWVuOiAoc2VuZGVyLCBwYXJhbXMpIC0+XG4gICAgICAgIGlmIGdzLkdyYXBoaWNzLmlzRnVsbHNjcmVlbigpXG4gICAgICAgICAgICBncy5HcmFwaGljcy5sZWF2ZUZ1bGxzY3JlZW4oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBncy5HcmFwaGljcy5lbnRlckZ1bGxzY3JlZW4oKVxuXG4gICAgICAgIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmZ1bGxTY3JlZW4gPSBncy5HcmFwaGljcy5pc0Z1bGxzY3JlZW4oKVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBwbGF5cyB0aGUgc3BlY2lmaWVkIHNvdW5kLlxuICAgICpcbiAgICAqIEBtZXRob2QgcGxheVNvdW5kXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBUaGUgc291bmQgdG8gcGxheS5cbiAgICAjIyNcbiAgICBwbGF5U291bmQ6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChwYXJhbXMpXG4gICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5U291bmQocGFyYW1zKVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBwbGF5cyB0aGUgc3BlY2lmaWVkIHZvaWNlLlxuICAgICpcbiAgICAqIEBtZXRob2QgcGxheVZvaWNlXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBUaGUgdm9pY2UgdG8gcGxheS5cbiAgICAjIyNcbiAgICBwbGF5Vm9pY2U6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChwYXJhbXMpXG4gICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5Vm9pY2UocGFyYW1zKVxuXG5cbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHR1cm5zIHZvaWNlIG9uIG9yIG9mZi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHR1cm5Pbk9mZlZvaWNlXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IHBhcmFtcyAtIElmIDxiPnRydWU8L2I+IHZvaWNlIHdpbGwgYmUgdHVybmVkIG9uLiBPdGhlcndpc2UgaXQgd2lsbCBiZSB0dXJuZWQgb2ZmLiBDYW4gYWxzbyBiZSBhIGJpbmRpbmctZXhwcmVzc2lvbi5cbiAgICAjIyNcbiAgICB0dXJuT25PZmZWb2ljZTogKHNlbmRlciwgc3RhdGUpIC0+XG4gICAgICAgIGlmIHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgc3RhdGUpIHRoZW4gQHR1cm5PblZvaWNlKCkgZWxzZSBAdHVybk9mZlZvaWNlKClcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdHVybnMgbXVzaWMgb24gb3Igb2ZmLlxuICAgICpcbiAgICAqIEBtZXRob2QgdHVybk9uT2ZmTXVzaWNcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gcGFyYW1zIC0gSWYgPGI+dHJ1ZTwvYj4gbXVzaWMgd2lsbCBiZSB0dXJuZWQgb24uIE90aGVyd2lzZSBpdCB3aWxsIGJlIHR1cm5lZCBvZmYuIENhbiBhbHNvIGJlIGEgYmluZGluZy1leHByZXNzaW9uLlxuICAgICMjI1xuICAgIHR1cm5Pbk9mZk11c2ljOiAoc2VuZGVyLCBzdGF0ZSkgLT5cbiAgICAgICAgaWYgdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc2VuZGVyLCBzdGF0ZSkgdGhlbiBAdHVybk9uTXVzaWMoKSBlbHNlIEB0dXJuT2ZmTXVzaWMoKVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCB0dXJucyBzb3VuZCBvbiBvciBvZmYuXG4gICAgKlxuICAgICogQG1ldGhvZCB0dXJuT25PZmZTb3VuZFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBwYXJhbXMgLSBJZiA8Yj50cnVlPC9iPiBzb3VuZCB3aWxsIGJlIHR1cm5lZCBvbi4gT3RoZXJ3aXNlIGl0IHdpbGwgYmUgdHVybmVkIG9mZi4gQ2FuIGFsc28gYmUgYSBiaW5kaW5nLWV4cHJlc3Npb24uXG4gICAgIyMjXG4gICAgdHVybk9uT2ZmU291bmQ6IChzZW5kZXIsIHN0YXRlKSAtPlxuICAgICAgICBpZiB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzZW5kZXIsIHN0YXRlKSB0aGVuIEB0dXJuT25Tb3VuZCgpIGVsc2UgQHR1cm5PZmZTb3VuZCgpXG5cbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHR1cm5zIG9mZiB2b2ljZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHR1cm5PZmZWb2ljZVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjXG4gICAgdHVybk9mZlZvaWNlOiAtPlxuICAgICAgICBBdWRpb01hbmFnZXIuc3RvcEFsbFZvaWNlcygpXG5cbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHR1cm5zIG9mZiBtdXNpYy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHR1cm5PZmZNdXNpY1xuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjXG4gICAgdHVybk9mZk11c2ljOiAtPlxuICAgICAgICBBdWRpb01hbmFnZXIuc3RvcE11c2ljKClcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdHVybnMgb2ZmIHNvdW5kLlxuICAgICpcbiAgICAqIEBtZXRob2QgdHVybk9mZlNvdW5kXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IHBhcmFtcyAtIENhbiBiZSA8Yj5udWxsPC9iPi5cbiAgICAjIyNcbiAgICB0dXJuT2ZmU291bmQ6IC0+XG4gICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wQWxsU291bmRzKClcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggdHVybnMgb24gdm9pY2UuXG4gICAgKlxuICAgICogQG1ldGhvZCB0dXJuT25Wb2ljZVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjXG4gICAgdHVybk9uVm9pY2U6IC0+XG5cbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHR1cm5zIG9uIHNvdW5kLlxuICAgICpcbiAgICAqIEBtZXRob2QgdHVybk9uU291bmRcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+LlxuICAgICMjI1xuICAgIHR1cm5PblNvdW5kOiAtPlxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCB0dXJucyBvbiBtdXNpYy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHR1cm5Pbk11c2ljXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IHBhcmFtcyAtIENhbiBiZSA8Yj5udWxsPC9iPi5cbiAgICAjIyNcbiAgICB0dXJuT25NdXNpYzogLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLnJlc3VtZU11c2ljKClcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggc2VsZWN0cyB0aGUgc3BlY2lmaWVkIGxhbmd1YWdlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2VsZWN0TGFuZ3VhZ2VcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfSBwYXJhbXMgLSBJbmRleCBvZiB0aGUgbGFuZ3VhZ2UgdG8gc2V0LiBDYW4gYmUgYSBiaW5kaW5nLWV4cHJlc3Npb24uXG4gICAgIyMjXG4gICAgc2VsZWN0TGFuZ3VhZ2U6IChzZW5kZXIsIHBhcmFtcyktPlxuICAgICAgICBsYW5ndWFnZSA9IExhbmd1YWdlTWFuYWdlci5sYW5ndWFnZXNbdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc2VuZGVyLCBwYXJhbXMpXVxuICAgICAgICBMYW5ndWFnZU1hbmFnZXIuc2VsZWN0TGFuZ3VhZ2UobGFuZ3VhZ2UpXG5cbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHJlc2V0cyBnbG9iYWwgZGF0YSBzdG9yYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzZXRHbG9iYWxEYXRhXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjXG4gICAgcmVzZXRHbG9iYWxEYXRhOiAoc2VuZGVyKSAtPlxuICAgICAgICBHYW1lTWFuYWdlci5yZXNldEdsb2JhbERhdGEoKVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBzYXZlcyBnYW1lIHNldHRpbmdzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2F2ZVNldHRpbmdzXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjXG4gICAgc2F2ZVNldHRpbmdzOiAoc2VuZGVyKSAtPiBHYW1lTWFuYWdlci5zYXZlU2V0dGluZ3MoKVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBwcmVwYXJlcyB0aGUgZ2FtZSBmb3Igc2F2aW5nIGJ5IHRha2luZyBhIHNuYXBzaG90IG9mIHRoZSBjdXJyZW50IGdhbWUgc3RhdGVcbiAgICAqIGFuZCBzdG9yaW5nIGl0IGluIEdhbWVNYW5hZ2VyLnNhdmVHYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZVNhdmVHYW1lXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjXG4gICAgcHJlcGFyZVNhdmVHYW1lOiAoc2VuZGVyLCBwYXJhbXMpIC0+XG4gICAgICAgIEdhbWVNYW5hZ2VyLnByZXBhcmVTYXZlR2FtZShwYXJhbXM/LnNuYXBzaG90KVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBzYXZlcyB0aGUgY3VycmVudCBnYW1lIGF0IHRoZSBzcGVjaWZpZWQgc2F2ZSBzbG90LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2F2ZUdhbWVcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIENvbnRhaW5zIHRoZSBzbG90LWluZGV4IHdoZXJlIHRoZSBnYW1lIHNob3VsZCBiZSBzYXZlZC5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT5wYXJhbXMuc2xvdCAtIFRoZSBzbG90LWluZGV4IHdoZXJlIHRoZSBnYW1lIHNob3VsZCBiZSBzYXZlZC4gQ2FuIGJlIGEgYmluZGluZy1leHByZXNzaW9uLjwvbGk+XG4gICAgKiA8L3VsPlxuICAgICMjI1xuICAgIHNhdmVHYW1lOiAoc2VuZGVyLCBwYXJhbXMpIC0+IEdhbWVNYW5hZ2VyLnNhdmUodWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc2VuZGVyLCBwYXJhbXMuc2xvdCkpXG5cbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIGxvYWRzIHRoZSBnYW1lIGZyb20gdGhlIHNwZWNpZmllZCBzYXZlIHNsb3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkR2FtZVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gQ29udGFpbnMgdGhlIHNsb3QtaW5kZXggd2hlcmUgdGhlIGdhbWUgc2hvdWxkIGJlIGxvYWRlZCBmcm9tLlxuICAgICogPHVsPlxuICAgICogPGxpPnBhcmFtcy5zbG90IC0gVGhlIHNsb3QtaW5kZXggd2hlcmUgdGhlIGdhbWUgc2hvdWxkIGJlIGxvYWRlZCBmcm9tLiBDYW4gYmUgYSBiaW5kaW5nLWV4cHJlc3Npb24uPC9saT5cbiAgICAqIDwvdWw+XG4gICAgIyMjXG4gICAgbG9hZEdhbWU6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBub1xuICAgICAgICBHYW1lTWFuYWdlci5sb2FkKHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKHNlbmRlciwgcGFyYW1zLnNsb3QpKVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBzdGFydHMgYSBuZXcgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG5ld0dhbWVcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIENhbiBiZSA8Yj5udWxsPC9iPlxuICAgICMjI1xuICAgIG5ld0dhbWU6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgQXVkaW9NYW5hZ2VyLnN0b3BBbGxNdXNpYygzMClcbiAgICAgICAgR2FtZU1hbmFnZXIubmV3R2FtZSgpXG5cbiAgICAgICAgc2NlbmUgPSBuZXcgdm4uT2JqZWN0X1NjZW5lKClcbiAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKHNjZW5lKVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBleGlzdHMgdGhlIGN1cnJlbnQgZ2FtZS4gSXQgZG9lc24ndCBjaGFuZ2UgdGhlIHNjZW5lIGFuZFxuICAgICogc2hvdWxkIGJlIGNhbGxlZCBiZWZvcmUgc3dpdGNoaW5nIGJhY2sgdG8gdGhlIHRpdGxlIHNjcmVlbiBvciBtYWluIG1lbnUuXG4gICAgKlxuICAgICogQG1ldGhvZCBleGl0R2FtZVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gQ2FuIGJlIDxiPm51bGw8L2I+XG4gICAgIyMjXG4gICAgZXhpdEdhbWU6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgR2FtZU1hbmFnZXIuZXhpdEdhbWUoKVxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBzd2l0Y2hlcyB0byBhbm90aGVyIHNjZW5lLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3dpdGNoU2NlbmVcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIENvbnRhaW5zIHRoZSBjbGFzcyBuYW1lIG9mIHRoZSBzY2VuZSB0byBzd2l0Y2ggdG8uXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+cGFyYW1zLm5hbWUgLSBUaGUgY2xhc3MtbmFtZSBvZiB0aGUgc2NlbmUgdG8gc3dpdGNoIHRvLiBUaGUgY2xhc3MgbXVzdCBiZSBkZWZpbmVkIGluIHZuLW5hbWVzcGFjZS48L2xpPlxuICAgICogPC91bD5cbiAgICAjIyNcbiAgICBzd2l0Y2hTY2VuZTogKHNlbmRlciwgcGFyYW1zKSAtPlxuICAgICAgICBmID0gPT5cbiAgICAgICAgICAgIGlmIHBhcmFtcy5jbGVhclxuICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5jbGVhcigpXG5cbiAgICAgICAgICAgIHNjZW5lID0gbmV3IHZuW3BhcmFtcy5uYW1lXSgpXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8oc2NlbmUsIHBhcmFtcy5zYXZlUHJldmlvdXMpXG5cbiAgICAgICAgaWYgIXBhcmFtcy5zYXZlUHJldmlvdXNcbiAgICAgICAgICAgIEBsYXlvdXQudWkuZGlzYXBwZWFyIChlKSA9PiBmKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZigpXG5cbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIHN3aXRjaGVzIHRvIGFub3RoZXIgZ2FtZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN3aXRjaEdhbWVTY2VuZVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIC0gVGhlIHNlbmRlciBvYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gQ29udGFpbnMgdGhlIFVJRCBvZiB0aGUgc2NlbmUgdG8gc3dpdGNoIHRvLlxuICAgICogPHVsPlxuICAgICogPGxpPnBhcmFtcy51aWQgLSBUaGUgVUlEIG9mIHRoZSBzY2VuZSB0byBzd2l0Y2ggdG8uPC9saT5cbiAgICAqIDwvdWw+XG4gICAgIyMjXG4gICAgc3dpdGNoR2FtZVNjZW5lOiAoc2VuZGVyLCBwYXJhbXMpIC0+XG4gICAgICAgIGYgPSA9PlxuICAgICAgICAgICAgaWYgcGFyYW1zLmNsZWFyXG4gICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcblxuICAgICAgICAgICAgdWlkID0gcGFyYW1zLnVpZFxuICAgICAgICAgICAgaWYgcGFyYW1zLm5hbWVcbiAgICAgICAgICAgICAgICBzY2VuZURvY3VtZW50cyA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcInZuLnNjZW5lXCIpXG4gICAgICAgICAgICAgICAgc2NlbmVEb2N1bWVudCA9IHNjZW5lRG9jdW1lbnRzLmZpcnN0IChkKSAtPiBkLml0ZW1zLm5hbWUgPT0gcGFyYW1zLm5hbWVcbiAgICAgICAgICAgICAgICBpZiBzY2VuZURvY3VtZW50XG4gICAgICAgICAgICAgICAgICAgIHVpZCA9IHNjZW5lRG9jdW1lbnQudWlkXG5cbiAgICAgICAgICAgIHNjZW5lRGF0YSA9IHVpZDogdWlkLCBwaWN0dXJlczogW10sIHRleHRzOiBbXVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2NlbmVEYXRhID0gc2NlbmVEYXRhXG4gICAgICAgICAgICBuZXdTY2VuZSA9IG5ldyB2bi5PYmplY3RfU2NlbmUoKVxuICAgICAgICAgICAgbmV3U2NlbmUuc2NlbmVEYXRhID0gc2NlbmVEYXRhXG5cbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXdTY2VuZSwgcGFyYW1zLnNhdmVQcmV2aW91cylcblxuICAgICAgICBpZiAhcGFyYW1zLnNhdmVQcmV2aW91c1xuICAgICAgICAgICAgKEBsYXlvdXR8fEBvYmplY3QubGF5b3V0KS51aS5kaXNhcHBlYXIgKGUpID0+IGYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmKClcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggc3dpdGNoZXMgdG8gYW5vdGhlciBsYXlvdXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzd2l0Y2hMYXlvdXRcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIENvbnRhaW5zIHRoZSBuYW1lIG9mIHRoZSBsYXlvdXQgdG8gc3dpdGNoIHRvLlxuICAgICogPHVsPlxuICAgICogPGxpPnBhcmFtcy5uYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGxheW91dCB0byBzd2l0Y2ggdG8uPC9saT5cbiAgICAqIDxsaT5wYXJhbXMuc2F2ZVByZXZpb3VzIC0gSW5kaWNhdGVzIGlmIHRoZSBjdXJyZW50IGxheW91dCBzaG91bGQgbm90IGJlIGVyYXNlZCBidXQgcGF1c2VkIGFuZCBoaWRkZW4gaW5zdGVhZCBzb1xuICAgICogdGhhdCBpdCBjYW4gYmUgcmVzdG9yZWQgdXNpbmcgPGk+cmV0dXJuVG9QcmV2aW91czwvaT4gYWN0aW9uLjwvbGk+XG4gICAgKiA8bGk+cGFyYW1zLmRhdGFGaWVsZHMgLSBEZWZpbmVzIHRoZSBkYXRhIG9mIFwiJGRhdGFGaWVsZHNcIiBiaW5kaW5nLWV4cHJlc3Npb24gdmFyaWFibGUuIENhbiBiZSBhIGJpbmRpbmctZXhwcmVzc2lvblxuICAgICogb3IgYSBkaXJlY3Qgb2JqZWN0LiBPcHRpb25hbC48L2xpPlxuICAgICogPC91bD5cbiAgICAjIyNcbiAgICBzd2l0Y2hMYXlvdXQ6IChzZW5kZXIsIGxheW91dCkgLT5cbiAgICAgICAgZiA9ID0+XG4gICAgICAgICAgICBHcmFwaGljcy5mcmVlemUoKVxuICAgICAgICAgICAgaWYgbGF5b3V0LmNsZWFyXG4gICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcblxuICAgICAgICAgICAgc2NlbmUgPSBuZXcgZ3MuT2JqZWN0X0xheW91dChsYXlvdXQubmFtZSlcblxuICAgICAgICAgICAgZGF0YUZpZWxkcyA9IHNlbmRlci5kYXRhRmllbGRzXG4gICAgICAgICAgICBpZiB0eXBlb2YgbGF5b3V0LmRhdGFGaWVsZHMgPT0gXCJzdHJpbmdcIlxuICAgICAgICAgICAgICAgIGRhdGFGaWVsZHMgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzZW5kZXIsIGxheW91dC5kYXRhRmllbGRzKVxuICAgICAgICAgICAgZWxzZSBpZiBsYXlvdXQuZGF0YUZpZWxkcz9cbiAgICAgICAgICAgICAgICBkYXRhRmllbGRzID0gbGF5b3V0LmRhdGFGaWVsZHNcblxuICAgICAgICAgICAgc2NlbmUuZGF0YUZpZWxkcyA9IGRhdGFGaWVsZHNcbiAgICAgICAgICAgIHNjZW5lLmNvbnRyb2xsZXJzID0gbGF5b3V0LmNvbnRyb2xsZXJzXG5cbiAgICAgICAgICAgIGlmIGxheW91dC5zZW5kZXJEYXRhP1xuICAgICAgICAgICAgICAgIGZvciBzZW5kZXJGaWVsZCBpbiBsYXlvdXQuc2VuZGVyRGF0YVxuICAgICAgICAgICAgICAgICAgICBzY2VuZVtzZW5kZXJGaWVsZF0gPSBzZW5kZXJbc2VuZGVyRmllbGRdXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8oc2NlbmUsIGxheW91dC5zYXZlUHJldmlvdXMsIGxheW91dC5zdGFjaylcblxuICAgICAgICBpZiAhbGF5b3V0LnNhdmVQcmV2aW91c1xuICAgICAgICAgICAgKEBsYXlvdXR8fEBvYmplY3QubGF5b3V0KS51aS5kaXNhcHBlYXIgKGUpID0+IGYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmKClcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggcmV0dXJucyB0byBwcmV2aW91cyBsYXlvdXQuIChJZiBzYXZlUHJldmlvdXMgd2FzIHNldCB0byA8Yj50cnVlPC9iPiBvbiBzd2l0Y2hMYXlvdXQuKS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXZpb3VzTGF5b3V0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjXG4gICAgcHJldmlvdXNMYXlvdXQ6IChzZW5kZXIpIC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5yZXR1cm5Ub1ByZXZpb3VzKClcblxuICAgICMjIypcbiAgICAqIEFjdGlvbiBtZXRob2Qgd2hpY2ggZGlzcG9zZXMgdGhlIHNwZWNpZmllZCBjb250cm9sLlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZUNvbnRyb2xcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtcyAtIFRoZSBJRCBvZiB0aGUgY29udHJvbCB0byBkaXNwb3NlLiBDYW4gYmUgYSBiaW5kaW5nLWV4cHJlc3Npb24uXG4gICAgIyMjXG4gICAgZGlzcG9zZUNvbnRyb2w6IChzZW5kZXIsIGlkKSAtPlxuICAgICAgICBjb250cm9sID0gQG9iamVjdE1hbmFnZXIub2JqZWN0QnlJZCh1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzZW5kZXIsIGlkKSlcblxuXG4gICAgICAgIGNvbnRyb2w/LnVpLmRpc2FwcGVhciAoc2VuZGVyKSAtPiBzZW5kZXIuZGlzcG9zZSgpXG5cbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gbWV0aG9kIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29udHJvbCBmcm9tIHRoZSBzcGVjaWZpZWQgZGVzY3JpcHRvci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZUNvbnRyb2xcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IHNlbmRlciAtIFRoZSBzZW5kZXIgb2JqZWN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtcyAtIENvbnRhaW5zIHRoZSBkZXNjcmlwdG9yIGFuZCBvdGhlciBkYXRhIG5lZWRlZCB0byBjb25zdHJ1Y3QgdGhlIGNvbnRyb2wuXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+cGFyYW1zLmRlc2NyaXB0b3IgLSBUaGUgY29udHJvbCcgZGVzY3JpcHRvci4gQ2FuIGJlIGEgZGlyZWN0IGRlc2NyaXB0b3IgZGVmaW5pdGlvbiBvciBhIHRlbXBsYXRlIG5hbWU8L2xpPlxuICAgICogPGxpPnBhcmFtcy5wYXJlbnQgLSBBIGJpbmRpbmctZXhwcmVzc2lvbiB3aGljaCByZXR1cm5zIHRoZSBjb250cm9sJ3MgcGFyZW50LjwvbGk+XG4gICAgKiA8bGk+cGFyYW1zLnNlbmRlckRhdGEgLSBBbiBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEgbWVyZ2VkIGludG8gdGhlIGNvbnRyb2wgb2JqZWN0LjwvbGk+XG4gICAgKiA8L3VsPlxuICAgICMjI1xuICAgIGNyZWF0ZUNvbnRyb2w6IChzZW5kZXIsIGRhdGEpIC0+XG4gICAgICAgIGlmIHR5cGVvZiBkYXRhLmRlc2NyaXB0b3IgPT0gXCJzdHJpbmdcIlxuICAgICAgICAgICAgZGVzY3JpcHRvciA9IHVpLlVJTWFuYWdlci5jdXN0b21UeXBlc1tkYXRhLmRlc2NyaXB0b3JdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlc2NyaXB0b3IgPSBkYXRhLmRlc2NyaXB0b3JcblxuICAgICAgICBwYXJlbnQgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzZW5kZXIsIGRhdGEucGFyZW50KVxuICAgICAgICBjb250cm9sID0gdWkuVWlGYWN0b3J5Ll9jcmVhdGVGcm9tRGVzY3JpcHRvcihkZXNjcmlwdG9yLCBwYXJlbnQgPyAoQG9iamVjdC5sYXlvdXR8fEBvYmplY3QpIClcblxuICAgICAgICBpZiBkYXRhLnNlbmRlckRhdGE/XG4gICAgICAgICAgICBmb3IgZmllbGROYW1lIGluIGRhdGEuc2VuZGVyRGF0YVxuICAgICAgICAgICAgICAgIGNvbnRyb2xbZmllbGROYW1lXSA9IHNlbmRlcltmaWVsZE5hbWVdXG4gICAgICAgIGNvbnRyb2wudWkucHJlcGFyZSgpXG4gICAgICAgIGNvbnRyb2wudWkuYXBwZWFyKClcblxuICAgICAgICByZXR1cm4gY29udHJvbFxuXG4gICAgIyMjKlxuICAgICogQWN0aW9uIG1ldGhvZCB3aGljaCBxdWl0cyB0aGUgZ2FtZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHF1aXRHYW1lXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgLSBUaGUgc2VuZGVyIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMgLSBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjXG4gICAgcXVpdEdhbWU6IChzZW5kZXIsIGRhdGEpIC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhudWxsKVxuXG5cblxuZ3MuQ29tcG9uZW50X0xheW91dFNjZW5lQmVoYXZpb3IgPSBDb21wb25lbnRfTGF5b3V0U2NlbmVCZWhhdmlvciJdfQ==
//# sourceURL=Component_LayoutSceneBehavior_26.js