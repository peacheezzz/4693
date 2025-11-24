var ResourceLoader;

ResourceLoader = (function() {

  /**
  * The resource helps to load a bunch of resources from different kind of
  * data structures.
  *
  * @module gs
  * @class ResourceLoader
  * @memberof gs
  * @constructor
  * @static
   */
  function ResourceLoader() {
    this.loadedScenesByUid = {};
    this.loadedCommonEventsById = [];
  }


  /**
  * Loads all graphics for the specified list of custom layout types/templates
  *
  * @method loadUiTypesGraphics
  * @param {Object[]} types - An array of custom layout types/templates
  * @static
   */

  ResourceLoader.prototype.loadUiTypesGraphics = function(types) {
    var k;
    for (k in types) {
      this.loadUiLayoutGraphics(types[k]);
    }
    return null;
  };


  /**
  * Loads all graphics for the specified layout-descriptor.
  *
  * @method loadUiGraphicsFromObject
  * @param {Object} layout - The layout descriptor.
  * @static
   */

  ResourceLoader.prototype.loadUiGraphicsFromObject = function(layout) {
    var k;
    for (k in layout) {
      if (k === "image" || k === "fullImage") {
        ResourceManager.getBitmap("Graphics/Pictures/" + layout[k]);
      } else if (k === "video") {
        ResourceManager.getVideo("Movies/" + layout[k]);
      }
    }
    return null;
  };


  /**
  * Loads all graphics for the specified layout-descriptor.
  *
  * @method loadUiDataFieldsGraphics
  * @param {Object} layout - The layout descriptor.
  * @static
   */

  ResourceLoader.prototype.loadUiDataFieldsGraphics = function(layout) {
    var image, j, k, l, len, o, ref;
    for (k in layout) {
      if (layout[k] instanceof Array) {
        ref = layout[k];
        for (l = 0, len = ref.length; l < len; l++) {
          o = ref[l];
          for (j in o) {
            if (j === "image" || j === "fullImage") {
              image = o[j];
              if (!image) {
                continue;
              }
              if (image.startsWith("data:")) {
                ResourceManager.getBitmap(o[j]);
              } else {
                ResourceManager.getBitmap("Graphics/Pictures/" + o[j]);
              }
            }
          }
        }
      }
    }
    return null;
  };


  /**
  * Loads all graphics for the specified layout-descriptor.
  *
  * @method loadUiDataFieldsGraphics
  * @param {Object} layout - The layout descriptor.
  * @static
   */

  ResourceLoader.prototype.loadUiLayoutGraphics = function(layout) {
    var action, actions, animation, control, descriptor, graphic, image, imageFolder, l, len, len1, len10, len11, len2, len3, len4, len5, len6, len7, len8, len9, m, music, musicFile, n, object, p, q, r, ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, results, s, sel, sound, soundFile, style, sub, t, u, v, video, w, x;
    if (layout.preload != null) {
      if (layout.preload.graphics != null) {
        ref = layout.preload.graphics;
        for (l = 0, len = ref.length; l < len; l++) {
          graphic = ref[l];
          if (graphic.name != null) {
            ResourceManager.getBitmap((ui.Component_FormulaHandler.fieldValue(null, graphic.folder) || 'Graphics/Pictures') + "/" + (ui.Component_FormulaHandler.fieldValue(null, graphic.name)));
          } else {
            object = ui.Component_FormulaHandler.fieldValue(null, graphic.path);
            for (m = 0, len1 = object.length; m < len1; m++) {
              sub = object[m];
              if (sub != null) {
                image = ui.Component_FormulaHandler.fieldValue(sub, graphic.image);
                if ((image != null ? image.name : void 0) != null) {
                  ResourceManager.getBitmap(ResourceManager.getPath(image));
                } else if (image != null) {
                  ResourceManager.getBitmap("Graphics/Pictures/" + image);
                }
              }
            }
          }
        }
      }
      if (layout.preload.videos != null) {
        ref1 = layout.preload.videos;
        for (n = 0, len2 = ref1.length; n < len2; n++) {
          video = ref1[n];
          if (video.name != null) {
            ResourceManager.getVideo((video.folder || 'Movies') + "/" + video.name);
          }
        }
      }
      if (layout.preload.music != null) {
        ref2 = layout.preload.music;
        for (p = 0, len3 = ref2.length; p < len3; p++) {
          music = ref2[p];
          if (music != null) {
            musicFile = ui.Component_FormulaHandler.fieldValue(layout, music.name || music);
            if (typeof musicFile === "object") {
              musicFile = musicFile.name;
            }
            if (musicFile) {
              ResourceManager.getAudioBuffer((music.folder || 'Audio/Music') + "/" + musicFile);
            }
          }
        }
      }
      if (layout.preload.sounds != null) {
        ref3 = layout.preload.sounds;
        for (q = 0, len4 = ref3.length; q < len4; q++) {
          sound = ref3[q];
          if (sound != null) {
            soundFile = ui.Component_FormulaHandler.fieldValue(layout, sound.name || sound);
            if (typeof soundFile === "object") {
              soundFile = soundFile.name;
            }
            if (soundFile) {
              ResourceManager.getAudioBuffer((sound.folder || 'Audio/Sounds') + "/" + soundFile);
            }
          }
        }
      }
    }
    if (layout.images != null) {
      ref4 = layout.images;
      for (r = 0, len5 = ref4.length; r < len5; r++) {
        image = ref4[r];
        image = ui.Component_FormulaHandler.fieldValue(layout, image);
        if (image != null ? image.name : void 0) {
          ResourceManager.getBitmap(ResourceManager.getPath(image));
        } else {
          ResourceManager.getBitmap("Graphics/Pictures/" + image);
        }
      }
    }
    if (layout.animations != null) {
      ref5 = layout.animations;
      for (s = 0, len6 = ref5.length; s < len6; s++) {
        descriptor = ref5[s];
        ref6 = descriptor.flow;
        for (t = 0, len7 = ref6.length; t < len7; t++) {
          animation = ref6[t];
          switch (animation.type) {
            case "sound":
              ResourceManager.getAudioBuffer(ResourceManager.getPath(animation.sound));
              break;
            case "changeImages":
              ref7 = animation.images;
              for (u = 0, len8 = ref7.length; u < len8; u++) {
                image = ref7[u];
                ResourceManager.getBitmap("Graphics/Pictures/" + image);
              }
              break;
            case "maskTo":
              ResourceManager.getBitmap(ResourceManager.getPath(animation.mask));
          }
          if (animation.sound != null) {
            ResourceManager.getAudioBuffer(ResourceManager.getPath(animation.sound));
          }
        }
      }
    }
    if (layout.image != null) {
      image = ui.Component_FormulaHandler.fieldValue(layout, layout.image);
      if (image != null ? image.name : void 0) {
        ResourceManager.getBitmap(ResourceManager.getPath(image));
      } else if (layout.imageFolder != null) {
        imageFolder = ui.Component_FormulaHandler.fieldValue(layout, layout.imageFolder);
        ResourceManager.getBitmap(imageFolder + "/" + image);
      } else {
        ResourceManager.getBitmap("Graphics/Pictures/" + image);
      }
    }
    if (layout.video != null) {
      ResourceManager.getVideo("Movies/" + layout.video);
    }
    if (layout.customFields != null) {
      this.loadUiGraphicsFromObject(layout.customFields);
    }
    if (((ref8 = layout.customFields) != null ? ref8.actions : void 0) != null) {
      ref9 = layout.customFields.actions;
      for (v = 0, len9 = ref9.length; v < len9; v++) {
        action = ref9[v];
        if (action.name === "playVoice" || action.name === "playSound") {
          AudioManager.loadSound(action.params.name);
        }
      }
    }
    if ((layout.actions != null) || (layout.action != null)) {
      actions = layout.action != null ? [layout.action] : layout.actions;
      for (w = 0, len10 = actions.length; w < len10; w++) {
        action = actions[w];
        if (action.name === "playVoice" || action.name === "playSound") {
          AudioManager.loadSound(action.params.name);
        }
      }
    }
    if (layout.params) {
      this.loadUiLayoutGraphics(layout.params);
    }
    if (layout.template != null) {
      this.loadUiLayoutGraphics(layout.template);
    }
    if ((layout.style != null) && (ui.UiFactory.styles[layout.style] != null)) {
      this.loadUiLayoutGraphics(ui.UiFactory.styles[layout.style]);
      for (sel in ui.UIManager.selectors) {
        style = ui.UIManager.styles[layout.style + ":" + sel];
        if (style) {
          this.loadUiLayoutGraphics(style);
        }
      }
    }
    if (ui.UiFactory.customTypes[layout.type] != null) {
      this.loadUiLayoutGraphics(ui.UiFactory.customTypes[layout.type]);
    }
    if (layout.controls != null) {
      ref10 = layout.controls;
      results = [];
      for (x = 0, len11 = ref10.length; x < len11; x++) {
        control = ref10[x];
        results.push(this.loadUiLayoutGraphics(control));
      }
      return results;
    }
  };


  /**
  * Loads all system sounds.
  *
  * @method loadSystemSounds
  * @static
   */

  ResourceLoader.prototype.loadSystemSounds = function() {
    var l, len, ref, results, sound;
    ref = RecordManager.system.sounds;
    results = [];
    for (l = 0, len = ref.length; l < len; l++) {
      sound = ref[l];
      results.push(AudioManager.loadSound(sound));
    }
    return results;
  };


  /**
  * Loads all system graphics.
  *
  * @method loadSystemGraphics
  * @static
   */

  ResourceLoader.prototype.loadSystemGraphics = function() {
    var l, len, ref, ref1, ref2, ref3, ref4, slot;
    ref = GameManager.saveGameSlots;
    for (l = 0, len = ref.length; l < len; l++) {
      slot = ref[l];
      if ((slot.thumb != null) && slot.thumb.length > 0) {
        ResourceManager.getBitmap(slot.thumb);
      }
    }
    if ((ref1 = RecordManager.system.cursor) != null ? ref1.name : void 0) {
      ResourceManager.getBitmap(ResourceManager.getPath(RecordManager.system.cursor));
    }
    if ((ref2 = RecordManager.system.titleScreen) != null ? ref2.name : void 0) {
      ResourceManager.getBitmap(ResourceManager.getPath(RecordManager.system.titleScreen));
    }
    if ((ref3 = RecordManager.system.languageScreen) != null ? ref3.name : void 0) {
      ResourceManager.getBitmap(ResourceManager.getPath(RecordManager.system.languageScreen));
    }
    if ((ref4 = RecordManager.system.menuBackground) != null ? ref4.name : void 0) {
      ResourceManager.getBitmap(ResourceManager.getPath(RecordManager.system.menuBackground));
    }
    return null;
  };


  /**
  * Loads all resources needed by the specified list of commands.
  *
  * @method loadEventCommandsGraphics
  * @param {Object[]} commands - The list of commands.
  * @return {boolean} Indicates if data needs to be loaded.
  * @static
   */

  ResourceLoader.prototype.loadEventCommandsData = function(commands) {
    this.loadedScenesByUid = {};
    return this._loadEventCommandsData(commands);
  };

  ResourceLoader.prototype._loadEventCommandsData = function(commands) {
    var command, l, len, result, sceneDocument;
    if (commands == null) {
      return false;
    }
    result = false;
    for (l = 0, len = commands.length; l < len; l++) {
      command = commands[l];
      switch (command.id) {
        case "vn.Choice":
          if (command.params.action.scene) {
            sceneDocument = DataManager.getDocument(command.params.action.scene.uid);
            if (sceneDocument) {
              if (!result) {
                result = !sceneDocument.loaded;
              }
              if (sceneDocument.loaded && !this.loadedScenesByUid[sceneDocument.uid]) {
                this.loadedScenesByUid[sceneDocument.uid] = true;
                if (!result) {
                  result = this._loadEventCommandsData(sceneDocument.items.commands);
                }
              }
            }
          }
          break;
        case "vn.CallScene":
          if (command.params.scene) {
            sceneDocument = DataManager.getDocument(command.params.scene.uid);
            if (sceneDocument) {
              if (!result) {
                result = !sceneDocument.loaded;
              }
              if (sceneDocument.loaded && !this.loadedScenesByUid[sceneDocument.uid]) {
                this.loadedScenesByUid[sceneDocument.uid] = true;
                if (!result) {
                  result = this._loadEventCommandsData(sceneDocument.items.commands);
                }
              }
            }
          }
      }
    }
    return result;
  };


  /**
  * Preloads all resources needed by the specified common event.
  *
  * @method loadCommonEventResources
  * @param {string} eventId - ID of the common event to preload the resources for.
  * @static
   */

  ResourceLoader.prototype.loadCommonEventResources = function(eventId) {
    var commonEvent;
    commonEvent = RecordManager.commonEvents[eventId];
    if ((commonEvent != null) && !this.loadedCommonEventsById[eventId]) {
      this.loadedCommonEventsById[eventId] = true;
      return this._loadEventCommandsGraphics(commonEvent.commands);
    }
  };


  /**
  * Loads all resources needed by the specified list of commands.
  *
  * @method loadEventCommandsGraphics
  * @param {Object[]} commands - The list of commands.
  * @static
   */

  ResourceLoader.prototype.loadEventCommandsGraphics = function(commands) {
    this.loadedScenesByUid = {};
    this.loadedCommonEventsById = [];
    return this._loadEventCommandsGraphics(commands);
  };

  ResourceLoader.prototype._loadEventCommandsGraphics = function(commands) {
    var actor, actorId, animation, animationId, character, command, commonEvent, effect, eid, enemy, expression, expressionId, hotspot, i, i1, image, j1, l, len, len1, len10, len11, len12, len13, len14, len15, len2, len3, len4, len5, len6, len7, len8, len9, m, moveCommand, n, p, param, q, r, record, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref28, ref29, ref3, ref30, ref31, ref32, ref33, ref34, ref35, ref36, ref37, ref38, ref39, ref4, ref40, ref41, ref42, ref43, ref44, ref5, ref6, ref7, ref8, ref9, s, sceneDocument, sound, t, u, v, w, x, y, z;
    if (commands == null) {
      return;
    }
    for (l = 0, len = commands.length; l < len; l++) {
      command = commands[l];
      switch (command.id) {
        case "gs.StartTimer":
          if (command.params.action.type === 1) {
            this.loadCommonEventResources(command.params.action.data.commonEventId);
          }
          break;
        case "gs.CallCommonEvent":
          commonEvent = RecordManager.commonEvents[command.params.commonEventId];
          if (commonEvent != null) {
            ref = commonEvent.parameters;
            for (i = m = 0, len1 = ref.length; m < len1; i = ++m) {
              param = ref[i];
              if (param.stringValueType === "sceneId" && ((ref1 = command.params.parameters) != null ? ref1.values[i] : void 0)) {
                sceneDocument = DataManager.getDocument(command.params.parameters.values[i]);
                if (sceneDocument && !this.loadedScenesByUid[sceneDocument.uid]) {
                  this.loadedScenesByUid[sceneDocument.uid] = true;
                  this._loadEventCommandsGraphics(sceneDocument.items.commands);
                }
              }
            }
            if (!this.loadedCommonEventsById[command.params.commonEventId]) {
              this.loadedCommonEventsById[command.params.commonEventId] = true;
              this._loadEventCommandsGraphics(commonEvent.commands);
            }
          }
          break;
        case "vn.CallScene":
          sceneDocument = DataManager.getDocument(command.params.scene.uid);
          if (sceneDocument && !this.loadedScenesByUid[sceneDocument.uid]) {
            this.loadedScenesByUid[sceneDocument.uid] = true;
            this._loadEventCommandsGraphics(sceneDocument.items.commands);
          }
          break;
        case "gs.ChangeTransition":
          if ((ref2 = command.params.graphic) != null ? ref2.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.graphic));
          }
          break;
        case "gs.ScreenTransition":
          if ((ref3 = command.params.graphic) != null ? ref3.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.graphic));
          }
          break;
        case "vn.ChangeBackground":
          if (command.params.graphic != null) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.graphic));
          }
          if (((ref4 = command.params.animation) != null ? ref4.type : void 0) === gs.AnimationTypes.MASKING && ((ref5 = command.params.animation.mask) != null ? ref5.graphic : void 0)) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.animation.mask.graphic));
          }
          break;
        case "vn.L2DJoinScene":
          if (command.params.model != null) {
            ResourceManager.getLive2DModel(ResourceManager.getPath(command.params.model));
          }
          break;
        case "vn.CharacterJoinScene":
          character = RecordManager.characters[command.params.characterId];
          if (character != null) {
            expressionId = (ref6 = command.params.expressionId) != null ? ref6 : character.defaultExpressionId;
            if (expressionId != null) {
              record = RecordManager.characterExpressions[expressionId];
              if (record != null) {
                if (record.idle) {
                  ref7 = record.idle;
                  for (n = 0, len2 = ref7.length; n < len2; n++) {
                    image = ref7[n];
                    ResourceManager.getBitmap(ResourceManager.getPath(image.resource));
                  }
                }
                if (record.talking) {
                  ref8 = record.talking;
                  for (p = 0, len3 = ref8.length; p < len3; p++) {
                    image = ref8[p];
                    ResourceManager.getBitmap(ResourceManager.getPath(image.resource));
                  }
                }
              }
            }
          }
          if (command.params.animation.type === gs.AnimationTypes.MASKING && (command.params.animation.mask.graphic != null)) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.animation.mask.graphic));
          }
          break;
        case "vn.CharacterChangeExpression":
          record = RecordManager.characterExpressions[command.params.expressionId];
          if (record != null) {
            ref9 = record.idle;
            for (q = 0, len4 = ref9.length; q < len4; q++) {
              image = ref9[q];
              ResourceManager.getBitmap(ResourceManager.getPath(image.resource));
            }
            ref10 = record.talking;
            for (r = 0, len5 = ref10.length; r < len5; r++) {
              image = ref10[r];
              ResourceManager.getBitmap(ResourceManager.getPath(image.resource));
            }
          }
          if (command.params.animation.type === gs.AnimationTypes.MASKING && (command.params.animation.mask.graphic != null)) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.animation.mask.graphic));
          }
          break;
        case "gs.ShowPartialMessage":
          if (command.params.voice != null) {
            AudioManager.loadSound(command.params.voice);
          }
          break;
        case "vn.Choice":
          if (command.params.action.scene) {
            sceneDocument = DataManager.getDocument(command.params.action.scene.uid);
            if (sceneDocument && !this.loadedScenesByUid[sceneDocument.uid]) {
              this.loadedScenesByUid[sceneDocument.uid] = true;
              this._loadEventCommandsGraphics(sceneDocument.items.commands);
            }
          }
          if (command.params.action.commonEventId) {
            this.loadCommonEventResources(command.params.action.commonEventId);
          }
          break;
        case "gs.ShowMessage":
        case "gs.ShowMessageNVL":
        case "gs.ShowText":
          if (command.params.animations != null) {
            ref11 = command.params.animations;
            for (s = 0, len6 = ref11.length; s < len6; s++) {
              eid = ref11[s];
              animation = RecordManager.animations[eid];
              if ((animation != null) && animation.graphic.name) {
                ResourceManager.getBitmap(ResourceManager.getPath(animation.graphic));
              }
            }
          }
          if (command.params.expressions != null) {
            ref12 = command.params.expressions;
            for (t = 0, len7 = ref12.length; t < len7; t++) {
              eid = ref12[t];
              expression = RecordManager.characterExpressions[eid];
              if (expression != null) {
                if (expression.idle) {
                  ref13 = expression.idle;
                  for (u = 0, len8 = ref13.length; u < len8; u++) {
                    image = ref13[u];
                    ResourceManager.getBitmap(ResourceManager.getPath(image.resource));
                  }
                }
                if (expression.talking) {
                  ref14 = expression.talking;
                  for (v = 0, len9 = ref14.length; v < len9; v++) {
                    image = ref14[v];
                    ResourceManager.getBitmap(ResourceManager.getPath(image.resource));
                  }
                }
              }
            }
          }
          if (command.params.voice != null) {
            AudioManager.loadSound(command.params.voice);
          }
          record = RecordManager.characterExpressions[command.params.expressionId];
          if (record != null) {
            if (record.idle) {
              ref15 = record.idle;
              for (w = 0, len10 = ref15.length; w < len10; w++) {
                image = ref15[w];
                ResourceManager.getBitmap(ResourceManager.getPath(image.resource));
              }
            }
            if (record.talking) {
              ref16 = record.talking;
              for (x = 0, len11 = ref16.length; x < len11; x++) {
                image = ref16[x];
                ResourceManager.getBitmap(ResourceManager.getPath(image.resource));
              }
            }
          }
          break;
        case "gs.AddHotspot":
          if ((ref17 = command.params.baseGraphic) != null ? ref17.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.baseGraphic));
          }
          if ((ref18 = command.params.hoverGraphic) != null ? ref18.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.hoverGraphic));
          }
          if ((ref19 = command.params.selectedGraphic) != null ? ref19.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.selectedGraphic));
          }
          if ((ref20 = command.params.selectedHoverGraphic) != null ? ref20.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.selectedHoverGraphic));
          }
          if ((ref21 = command.params.unselectedGraphic) != null ? ref21.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.unselectedGraphic));
          }
          if (command.params.actions != null) {
            if (command.params.actions.onClick.type === 1) {
              this.loadCommonEventResources(command.params.actions.onClick.commonEventId);
            }
            if (command.params.actions.onEnter.type === 1) {
              this.loadCommonEventResources(command.params.actions.onEnter.commonEventId);
            }
            if (command.params.actions.onLeave.type === 1) {
              this.loadCommonEventResources(command.params.actions.onLeave.commonEventId);
            }
            if (command.params.actions.onSelect.type === 1) {
              this.loadCommonEventResources(command.params.actions.onSelect.commonEventId);
            }
            if (command.params.actions.onDeselect.type === 1) {
              this.loadCommonEventResources(command.params.actions.onDeselect.commonEventId);
            }
            if (command.params.actions.onDrag.type === 1) {
              this.loadCommonEventResources(command.params.actions.onDrag.commonEventId);
            }
            if (command.params.actions.onDrop.type === 1) {
              this.loadCommonEventResources(command.params.actions.onDrop.commonEventId);
            }
            if (command.params.actions.onDropReceive.type === 1) {
              this.loadCommonEventResources(command.params.actions.onDropReceive.commonEventId);
            }
          }
          break;
        case "gs.ShowPicture":
          if (((ref22 = command.params.graphic) != null ? ref22.name : void 0) && (command.params.graphic.scope == null)) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.graphic));
          }
          if (((ref23 = command.params.animation) != null ? ref23.type : void 0) === gs.AnimationTypes.MASKING) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.animation.mask.graphic));
          }
          break;
        case "gs.ShowImageMap":
          if ((ref24 = command.params.ground) != null ? ref24.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.ground));
          }
          if ((ref25 = command.params.hover) != null ? ref25.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.hover));
          }
          if ((ref26 = command.params.unselected) != null ? ref26.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.unselected));
          }
          if ((ref27 = command.params.selected) != null ? ref27.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.selected));
          }
          if ((ref28 = command.params.selectedHover) != null ? ref28.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.selectedHover));
          }
          ref29 = command.params.hotspots;
          for (y = 0, len12 = ref29.length; y < len12; y++) {
            hotspot = ref29[y];
            AudioManager.loadSound(hotspot.data.onHoverSound);
            AudioManager.loadSound(hotspot.data.onClickSound);
            if (hotspot.data.action === 2) {
              commonEvent = RecordManager.commonEvents[hotspot.data.commonEventId];
              if ((commonEvent != null) && !this.loadedCommonEventsById[hotspot.data.commonEventId]) {
                this.loadedCommonEventsById[hotspot.data.commonEventId] = true;
                this._loadEventCommandsGraphics(commonEvent.commands);
              }
            }
          }
          break;
        case "gs.MovePicturePath":
        case "vn.MoveCharacterPath":
        case "vn.ScrollBackgroundPath":
        case "gs.MoveVideoPath":
          if (command.params.path.effects != null) {
            ref30 = command.params.path.effects.data;
            for (z = 0, len13 = ref30.length; z < len13; z++) {
              effect = ref30[z];
              AudioManager.loadSound(effect.sound);
            }
          }
          break;
        case "gs.MaskPicture":
        case "vn.MaskCharacter":
        case "vn.MaskBackground":
        case "gs.MaskVideo":
          if (command.params.mask.sourceType === 0 && ((ref31 = command.params.mask.graphic) != null ? ref31.name : void 0)) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.mask.graphic));
          }
          if (command.params.mask.sourceType === 1 && ((ref32 = command.params.mask.video) != null ? ref32.name : void 0)) {
            ResourceManager.getVideo(ResourceManager.getPath(command.params.mask.video));
          }
          break;
        case "gs.PlayPictureAnimation":
          animationId = command.params.animationId;
          if ((animationId != null) && (animationId.scope == null)) {
            animation = RecordManager.animations[animationId];
            if (animation && ((ref33 = animation.graphic) != null ? ref33.name : void 0)) {
              ResourceManager.getBitmap(ResourceManager.getPath(animation.graphic));
            }
          }
          break;
        case "gs.ShowBattleAnimation":
          animationId = command.params.animationId;
          if ((animationId != null) && (animationId.scope == null)) {
            animation = RecordManager.animations[animationId];
            this.loadComplexAnimation(animation);
          }
          break;
        case "gs.InputName":
          actorId = command.params.actorId;
          if ((actorId != null) && (actorId.scope == null)) {
            actor = RecordManager.actors[actorId];
            if (actor != null) {
              ResourceManager.getBitmap("Graphics/Faces/" + ((ref34 = actor.faceGraphic) != null ? ref34.name : void 0));
            }
          }
          break;
        case "gs.ChangeTileset":
          if ((ref35 = command.params.graphic) != null ? ref35.name : void 0) {
            ResourceManager.getBitmap("Graphics/Tilesets/" + command.params.graphic.name);
          }
          break;
        case "gs.ChangeMapParallaxBackground":
          if ((ref36 = command.params.parallaxBackground) != null ? ref36.name : void 0) {
            ResourceManager.getBitmap("Graphics/Pictures/" + command.params.parallaxBackground.name);
          }
          break;
        case "gs.ChangeActorGraphic":
          if (command.params.changeCharacter && ((ref37 = command.params.characterGraphic) != null ? ref37.name : void 0)) {
            ResourceManager.getBitmap("Graphics/Characters/" + command.params.characterGraphic.name);
          }
          if (command.params.changeFace && ((ref38 = command.params.faceGraphic) != null ? ref38.name : void 0)) {
            ResourceManager.getBitmap("Graphics/Faces/" + command.params.faceGraphic.name);
          }
          break;
        case "gs.MoveEvent":
          ref39 = command.params.commands;
          for (i1 = 0, len14 = ref39.length; i1 < len14; i1++) {
            moveCommand = ref39[i1];
            switch (moveCommand.id) {
              case 44:
                ResourceManager.getBitmap("Graphics/Characters/" + moveCommand.resource.name);
                break;
              case 47:
                AudioManager.loadSound(moveCommand.resource);
            }
          }
          break;
        case "gs.TransformEnemy":
          if (((ref40 = command.params) != null ? ref40.targetId.scope : void 0) == null) {
            enemy = RecordManager.enemies[command.params.targetId];
            this.loadActorBattleAnimations(enemy);
          }
          break;
        case "gs.PlayMusic":
          if (command.params.music != null) {
            AudioManager.loadMusic(command.params.music);
          }
          break;
        case "gs.PlayVideo":
        case "gs.ShowVideo":
          if ((ref41 = command.params.video) != null ? ref41.name : void 0) {
            ResourceManager.getVideo(ResourceManager.getPath(command.params.video));
          }
          if (((ref42 = command.params.animation) != null ? ref42.type : void 0) === gs.AnimationTypes.MASKING) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.animation.mask.graphic));
          }
          break;
        case "gs.PlaySound":
          if (command.params.sound != null) {
            AudioManager.loadSound(command.params.sound);
          }
          break;
        case "vn.ChangeSounds":
          ref43 = command.params.sounds;
          for (j1 = 0, len15 = ref43.length; j1 < len15; j1++) {
            sound = ref43[j1];
            if (sound != null) {
              AudioManager.loadSound(sound);
            }
          }
          break;
        case "gs.ChangeScreenCursor":
          if ((ref44 = command.params.graphic) != null ? ref44.name : void 0) {
            ResourceManager.getBitmap(ResourceManager.getPath(command.params.graphic));
          }
      }
    }
    return null;
  };


  /**
  * Loads all resources for the specified animation.
  *
  * @method loadAnimation
  * @param {Object} animation - The animation-record.
  * @static
   */

  ResourceLoader.prototype.loadAnimation = function(animation) {
    if ((animation != null) && (animation.graphic != null)) {
      return ResourceManager.getBitmap("Graphics/SimpleAnimations/" + animation.graphic.name);
    }
  };

  return ResourceLoader;

})();

gs.ResourceLoader = new ResourceLoader();

window.ResourceLoader = gs.ResourceLoader;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7Ozs7RUFVYSx3QkFBQTtJQUNULElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtJQUNyQixJQUFDLENBQUEsc0JBQUQsR0FBMEI7RUFGakI7OztBQUliOzs7Ozs7OzsyQkFPQSxtQkFBQSxHQUFxQixTQUFDLEtBQUQ7QUFDakIsUUFBQTtBQUFBLFNBQUEsVUFBQTtNQUNJLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixLQUFNLENBQUEsQ0FBQSxDQUE1QjtBQURKO0FBR0EsV0FBTztFQUpVOzs7QUFNckI7Ozs7Ozs7OzJCQU9BLHdCQUFBLEdBQTBCLFNBQUMsTUFBRDtBQUN0QixRQUFBO0FBQUEsU0FBQSxXQUFBO01BQ0ksSUFBRyxDQUFBLEtBQUssT0FBTCxJQUFnQixDQUFBLEtBQUssV0FBeEI7UUFDSSxlQUFlLENBQUMsU0FBaEIsQ0FBMEIsb0JBQUEsR0FBcUIsTUFBTyxDQUFBLENBQUEsQ0FBdEQsRUFESjtPQUFBLE1BRUssSUFBRyxDQUFBLEtBQUssT0FBUjtRQUNELGVBQWUsQ0FBQyxRQUFoQixDQUF5QixTQUFBLEdBQVUsTUFBTyxDQUFBLENBQUEsQ0FBMUMsRUFEQzs7QUFIVDtBQUtBLFdBQU87RUFOZTs7O0FBUTFCOzs7Ozs7OzsyQkFPQSx3QkFBQSxHQUEwQixTQUFDLE1BQUQ7QUFDdEIsUUFBQTtBQUFBLFNBQUEsV0FBQTtNQUNJLElBQUcsTUFBTyxDQUFBLENBQUEsQ0FBUCxZQUFxQixLQUF4QjtBQUNJO0FBQUEsYUFBQSxxQ0FBQTs7QUFDSSxlQUFBLE1BQUE7WUFDSSxJQUFHLENBQUEsS0FBSyxPQUFMLElBQWdCLENBQUEsS0FBSyxXQUF4QjtjQUNJLEtBQUEsR0FBUSxDQUFFLENBQUEsQ0FBQTtjQUVWLElBQUcsQ0FBSSxLQUFQO0FBQ0kseUJBREo7O2NBR0EsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixP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LFNBQWhCLENBQTBCLGVBQWUsQ0FBQyxPQUFoQixDQUF3QixPQUFPLENBQUMsTUFBTSxDQUFDLE9BQXZDLENBQTFCLEVBREo7O0FBcE9SO0FBREo7QUF1T0EsV0FBTztFQTFPaUI7OztBQTRPNUI7Ozs7Ozs7OzJCQU9BLGFBQUEsR0FBZSxTQUFDLFNBQUQ7SUFDWCxJQUFHLG1CQUFBLElBQWUsMkJBQWxCO2FBQ0ksZUFBZSxDQUFDLFNBQWhCLENBQTBCLDRCQUFBLEdBQTZCLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBekUsRUFESjs7RUFEVzs7Ozs7O0FBTW5CLEVBQUUsQ0FBQyxjQUFILEdBQXdCLElBQUEsY0FBQSxDQUFBOztBQUN4QixNQUFNLENBQUMsY0FBUCxHQUF3QixFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IFJlc291cmNlTG9hZGVyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBSZXNvdXJjZUxvYWRlclxuICAgICMjIypcbiAgICAqIFRoZSByZXNvdXJjZSBoZWxwcyB0byBsb2FkIGEgYnVuY2ggb2YgcmVzb3VyY2VzIGZyb20gZGlmZmVyZW50IGtpbmQgb2ZcbiAgICAqIGRhdGEgc3RydWN0dXJlcy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgUmVzb3VyY2VMb2FkZXJcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgKiBAc3RhdGljXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIEBsb2FkZWRTY2VuZXNCeVVpZCA9IHt9XG4gICAgICAgIEBsb2FkZWRDb21tb25FdmVudHNCeUlkID0gW11cblxuICAgICMjIypcbiAgICAqIExvYWRzIGFsbCBncmFwaGljcyBmb3IgdGhlIHNwZWNpZmllZCBsaXN0IG9mIGN1c3RvbSBsYXlvdXQgdHlwZXMvdGVtcGxhdGVzXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkVWlUeXBlc0dyYXBoaWNzXG4gICAgKiBAcGFyYW0ge09iamVjdFtdfSB0eXBlcyAtIEFuIGFycmF5IG9mIGN1c3RvbSBsYXlvdXQgdHlwZXMvdGVtcGxhdGVzXG4gICAgKiBAc3RhdGljXG4gICAgIyMjXG4gICAgbG9hZFVpVHlwZXNHcmFwaGljczogKHR5cGVzKSAtPlxuICAgICAgICBmb3IgayBvZiB0eXBlc1xuICAgICAgICAgICAgQGxvYWRVaUxheW91dEdyYXBoaWNzKHR5cGVzW2tdKVxuXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBMb2FkcyBhbGwgZ3JhcGhpY3MgZm9yIHRoZSBzcGVjaWZpZWQgbGF5b3V0LWRlc2NyaXB0b3IuXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkVWlHcmFwaGljc0Zyb21PYmplY3RcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBsYXlvdXQgLSBUaGUgbGF5b3V0IGRlc2NyaXB0b3IuXG4gICAgKiBAc3RhdGljXG4gICAgIyMjXG4gICAgbG9hZFVpR3JhcGhpY3NGcm9tT2JqZWN0OiAobGF5b3V0KSAtPlxuICAgICAgICBmb3IgayBvZiBsYXlvdXRcbiAgICAgICAgICAgIGlmIGsgPT0gXCJpbWFnZVwiIG9yIGsgPT0gXCJmdWxsSW1hZ2VcIlxuICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2xheW91dFtrXX1cIilcbiAgICAgICAgICAgIGVsc2UgaWYgayA9PSBcInZpZGVvXCJcbiAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0VmlkZW8oXCJNb3ZpZXMvI3tsYXlvdXRba119XCIpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBMb2FkcyBhbGwgZ3JhcGhpY3MgZm9yIHRoZSBzcGVjaWZpZWQgbGF5b3V0LWRlc2NyaXB0b3IuXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkVWlEYXRhRmllbGRzR3JhcGhpY3NcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBsYXlvdXQgLSBUaGUgbGF5b3V0IGRlc2NyaXB0b3IuXG4gICAgKiBAc3RhdGljXG4gICAgIyMjXG4gICAgbG9hZFVpRGF0YUZpZWxkc0dyYXBoaWNzOiAobGF5b3V0KSAtPlxuICAgICAgICBmb3IgayBvZiBsYXlvdXRcbiAgICAgICAgICAgIGlmIGxheW91dFtrXSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgZm9yIG8gaW4gbGF5b3V0W2tdXG4gICAgICAgICAgICAgICAgICAgIGZvciBqIG9mIG9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGogPT0gXCJpbWFnZVwiIG9yIGogPT0gXCJmdWxsSW1hZ2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlID0gb1tqXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBpbWFnZS5zdGFydHNXaXRoKFwiZGF0YTpcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChvW2pdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7b1tqXX1cIilcblxuICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgIyMjKlxuICAgICogTG9hZHMgYWxsIGdyYXBoaWNzIGZvciB0aGUgc3BlY2lmaWVkIGxheW91dC1kZXNjcmlwdG9yLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZFVpRGF0YUZpZWxkc0dyYXBoaWNzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gbGF5b3V0IC0gVGhlIGxheW91dCBkZXNjcmlwdG9yLlxuICAgICogQHN0YXRpY1xuICAgICMjI1xuICAgIGxvYWRVaUxheW91dEdyYXBoaWNzOiAobGF5b3V0KSAtPlxuICAgICAgICBpZiBsYXlvdXQucHJlbG9hZD9cbiAgICAgICAgICAgIGlmIGxheW91dC5wcmVsb2FkLmdyYXBoaWNzP1xuICAgICAgICAgICAgICAgIGZvciBncmFwaGljIGluIGxheW91dC5wcmVsb2FkLmdyYXBoaWNzXG4gICAgICAgICAgICAgICAgICAgIGlmIGdyYXBoaWMubmFtZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCIje3VpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKG51bGwsIGdyYXBoaWMuZm9sZGVyKXx8J0dyYXBoaWNzL1BpY3R1cmVzJ30vI3t1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShudWxsLCBncmFwaGljLm5hbWUpfVwiKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShudWxsLCBncmFwaGljLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3Igc3ViIGluIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHN1Yj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzdWIsIGdyYXBoaWMuaW1hZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGltYWdlPy5uYW1lP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChpbWFnZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgaW1hZ2U/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvUGljdHVyZXMvI3tpbWFnZX1cIilcbiAgICAgICAgICAgIGlmIGxheW91dC5wcmVsb2FkLnZpZGVvcz9cbiAgICAgICAgICAgICAgICBmb3IgdmlkZW8gaW4gbGF5b3V0LnByZWxvYWQudmlkZW9zXG4gICAgICAgICAgICAgICAgICAgIGlmIHZpZGVvLm5hbWU/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0VmlkZW8oXCIje3ZpZGVvLmZvbGRlcnx8J01vdmllcyd9LyN7dmlkZW8ubmFtZX1cIilcbiAgICAgICAgICAgIGlmIGxheW91dC5wcmVsb2FkLm11c2ljP1xuICAgICAgICAgICAgICAgIGZvciBtdXNpYyBpbiBsYXlvdXQucHJlbG9hZC5tdXNpY1xuICAgICAgICAgICAgICAgICAgICBpZiBtdXNpYz9cbiAgICAgICAgICAgICAgICAgICAgICAgIG11c2ljRmlsZSA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKGxheW91dCwgbXVzaWMubmFtZSB8fCBtdXNpYylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZihtdXNpY0ZpbGUpID09IFwib2JqZWN0XCIgdGhlbiBtdXNpY0ZpbGUgPSBtdXNpY0ZpbGUubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXVzaWNGaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEF1ZGlvQnVmZmVyKFwiI3ttdXNpYy5mb2xkZXJ8fCdBdWRpby9NdXNpYyd9LyN7bXVzaWNGaWxlfVwiKVxuICAgICAgICAgICAgaWYgbGF5b3V0LnByZWxvYWQuc291bmRzP1xuICAgICAgICAgICAgICAgIGZvciBzb3VuZCBpbiBsYXlvdXQucHJlbG9hZC5zb3VuZHNcbiAgICAgICAgICAgICAgICAgICAgaWYgc291bmQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VuZEZpbGUgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShsYXlvdXQsIHNvdW5kLm5hbWUgfHwgc291bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB0eXBlb2Yoc291bmRGaWxlKSA9PSBcIm9iamVjdFwiIHRoZW4gc291bmRGaWxlID0gc291bmRGaWxlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHNvdW5kRmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRBdWRpb0J1ZmZlcihcIiN7c291bmQuZm9sZGVyfHwnQXVkaW8vU291bmRzJ30vI3tzb3VuZEZpbGV9XCIpXG4gICAgICAgIGlmIGxheW91dC5pbWFnZXM/XG4gICAgICAgICAgICBmb3IgaW1hZ2UgaW4gbGF5b3V0LmltYWdlc1xuICAgICAgICAgICAgICAgIGltYWdlID0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUobGF5b3V0LCBpbWFnZSlcbiAgICAgICAgICAgICAgICBpZiBpbWFnZT8ubmFtZVxuICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGltYWdlKSlcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2ltYWdlfVwiKVxuICAgICAgICBpZiBsYXlvdXQuYW5pbWF0aW9ucz9cbiAgICAgICAgICAgIGZvciBkZXNjcmlwdG9yIGluIGxheW91dC5hbmltYXRpb25zXG4gICAgICAgICAgICAgICAgZm9yIGFuaW1hdGlvbiBpbiBkZXNjcmlwdG9yLmZsb3dcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIGFuaW1hdGlvbi50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIFwic291bmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRBdWRpb0J1ZmZlcihSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChhbmltYXRpb24uc291bmQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiBcImNoYW5nZUltYWdlc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGltYWdlIGluIGFuaW1hdGlvbi5pbWFnZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7aW1hZ2V9XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIFwibWFza1RvXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGFuaW1hdGlvbi5tYXNrKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgYW5pbWF0aW9uLnNvdW5kP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEF1ZGlvQnVmZmVyKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGFuaW1hdGlvbi5zb3VuZCkpXG5cbiAgICAgICAgaWYgbGF5b3V0LmltYWdlP1xuICAgICAgICAgICAgaW1hZ2UgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShsYXlvdXQsIGxheW91dC5pbWFnZSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgaW1hZ2U/Lm5hbWVcbiAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGltYWdlKSlcbiAgICAgICAgICAgIGVsc2UgaWYgbGF5b3V0LmltYWdlRm9sZGVyP1xuICAgICAgICAgICAgICAgIGltYWdlRm9sZGVyID0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUobGF5b3V0LCBsYXlvdXQuaW1hZ2VGb2xkZXIpXG4gICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIiN7aW1hZ2VGb2xkZXJ9LyN7aW1hZ2V9XCIpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7aW1hZ2V9XCIpXG4gICAgICAgIGlmIGxheW91dC52aWRlbz9cbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRWaWRlbyhcIk1vdmllcy8je2xheW91dC52aWRlb31cIilcbiAgICAgICAgaWYgbGF5b3V0LmN1c3RvbUZpZWxkcz9cbiAgICAgICAgICAgIEBsb2FkVWlHcmFwaGljc0Zyb21PYmplY3QobGF5b3V0LmN1c3RvbUZpZWxkcylcbiAgICAgICAgaWYgbGF5b3V0LmN1c3RvbUZpZWxkcz8uYWN0aW9ucz9cbiAgICAgICAgICAgIGZvciBhY3Rpb24gaW4gbGF5b3V0LmN1c3RvbUZpZWxkcy5hY3Rpb25zXG4gICAgICAgICAgICAgICAgaWYgYWN0aW9uLm5hbWUgPT0gXCJwbGF5Vm9pY2VcIiBvciBhY3Rpb24ubmFtZSA9PSBcInBsYXlTb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5sb2FkU291bmQoYWN0aW9uLnBhcmFtcy5uYW1lKVxuICAgICAgICBpZiBsYXlvdXQuYWN0aW9ucz8gb3IgbGF5b3V0LmFjdGlvbj9cbiAgICAgICAgICAgIGFjdGlvbnMgPSBpZiBsYXlvdXQuYWN0aW9uPyB0aGVuIFtsYXlvdXQuYWN0aW9uXSBlbHNlIGxheW91dC5hY3Rpb25zXG4gICAgICAgICAgICBmb3IgYWN0aW9uIGluIGFjdGlvbnNcbiAgICAgICAgICAgICAgICBpZiBhY3Rpb24ubmFtZSA9PSBcInBsYXlWb2ljZVwiIG9yIGFjdGlvbi5uYW1lID09IFwicGxheVNvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChhY3Rpb24ucGFyYW1zLm5hbWUpXG4gICAgICAgIGlmIGxheW91dC5wYXJhbXNcbiAgICAgICAgICAgIEBsb2FkVWlMYXlvdXRHcmFwaGljcyhsYXlvdXQucGFyYW1zKVxuICAgICAgICBpZiBsYXlvdXQudGVtcGxhdGU/XG4gICAgICAgICAgICBAbG9hZFVpTGF5b3V0R3JhcGhpY3MobGF5b3V0LnRlbXBsYXRlKVxuICAgICAgICBpZiBsYXlvdXQuc3R5bGU/IGFuZCB1aS5VaUZhY3Rvcnkuc3R5bGVzW2xheW91dC5zdHlsZV0/XG4gICAgICAgICAgICBAbG9hZFVpTGF5b3V0R3JhcGhpY3ModWkuVWlGYWN0b3J5LnN0eWxlc1tsYXlvdXQuc3R5bGVdKVxuICAgICAgICAgICAgZm9yIHNlbCBvZiB1aS5VSU1hbmFnZXIuc2VsZWN0b3JzXG4gICAgICAgICAgICAgICAgc3R5bGUgPSB1aS5VSU1hbmFnZXIuc3R5bGVzW2xheW91dC5zdHlsZSArIFwiOlwiK3NlbF1cbiAgICAgICAgICAgICAgICBpZiBzdHlsZSB0aGVuIEBsb2FkVWlMYXlvdXRHcmFwaGljcyhzdHlsZSlcbiAgICAgICAgaWYgdWkuVWlGYWN0b3J5LmN1c3RvbVR5cGVzW2xheW91dC50eXBlXT9cbiAgICAgICAgICAgIEBsb2FkVWlMYXlvdXRHcmFwaGljcyh1aS5VaUZhY3RvcnkuY3VzdG9tVHlwZXNbbGF5b3V0LnR5cGVdKVxuICAgICAgICBpZiBsYXlvdXQuY29udHJvbHM/XG4gICAgICAgICAgICBmb3IgY29udHJvbCBpbiBsYXlvdXQuY29udHJvbHNcbiAgICAgICAgICAgICAgICBAbG9hZFVpTGF5b3V0R3JhcGhpY3MoY29udHJvbClcblxuICAgICMjIypcbiAgICAqIExvYWRzIGFsbCBzeXN0ZW0gc291bmRzLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZFN5c3RlbVNvdW5kc1xuICAgICogQHN0YXRpY1xuICAgICMjI1xuICAgIGxvYWRTeXN0ZW1Tb3VuZHM6IC0+XG4gICAgICAgIGZvciBzb3VuZCBpbiBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5zb3VuZHNcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5sb2FkU291bmQoc291bmQpXG5cbiAgICAjIyMqXG4gICAgKiBMb2FkcyBhbGwgc3lzdGVtIGdyYXBoaWNzLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZFN5c3RlbUdyYXBoaWNzXG4gICAgKiBAc3RhdGljXG4gICAgIyMjXG4gICAgbG9hZFN5c3RlbUdyYXBoaWNzOiAtPlxuICAgICAgICBmb3Igc2xvdCBpbiBHYW1lTWFuYWdlci5zYXZlR2FtZVNsb3RzXG4gICAgICAgICAgICBpZiBzbG90LnRodW1iPyBhbmQgc2xvdC50aHVtYi5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChzbG90LnRodW1iKVxuICAgICAgICBpZiBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5jdXJzb3I/Lm5hbWVcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoUmVjb3JkTWFuYWdlci5zeXN0ZW0uY3Vyc29yKSlcbiAgICAgICAgaWYgUmVjb3JkTWFuYWdlci5zeXN0ZW0udGl0bGVTY3JlZW4/Lm5hbWVcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoUmVjb3JkTWFuYWdlci5zeXN0ZW0udGl0bGVTY3JlZW4pKVxuICAgICAgICBpZiBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5sYW5ndWFnZVNjcmVlbj8ubmFtZVxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChSZWNvcmRNYW5hZ2VyLnN5c3RlbS5sYW5ndWFnZVNjcmVlbikpXG4gICAgICAgIGlmIFJlY29yZE1hbmFnZXIuc3lzdGVtLm1lbnVCYWNrZ3JvdW5kPy5uYW1lXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKFJlY29yZE1hbmFnZXIuc3lzdGVtLm1lbnVCYWNrZ3JvdW5kKSlcbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICMjIypcbiAgICAqIExvYWRzIGFsbCByZXNvdXJjZXMgbmVlZGVkIGJ5IHRoZSBzcGVjaWZpZWQgbGlzdCBvZiBjb21tYW5kcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRFdmVudENvbW1hbmRzR3JhcGhpY3NcbiAgICAqIEBwYXJhbSB7T2JqZWN0W119IGNvbW1hbmRzIC0gVGhlIGxpc3Qgb2YgY29tbWFuZHMuXG4gICAgKiBAcmV0dXJuIHtib29sZWFufSBJbmRpY2F0ZXMgaWYgZGF0YSBuZWVkcyB0byBiZSBsb2FkZWQuXG4gICAgKiBAc3RhdGljXG4gICAgIyMjXG4gICAgbG9hZEV2ZW50Q29tbWFuZHNEYXRhOiAoY29tbWFuZHMpIC0+XG4gICAgICAgIEBsb2FkZWRTY2VuZXNCeVVpZCA9IHt9XG4gICAgICAgIHJldHVybiBAX2xvYWRFdmVudENvbW1hbmRzRGF0YShjb21tYW5kcylcblxuICAgIF9sb2FkRXZlbnRDb21tYW5kc0RhdGE6IChjb21tYW5kcykgLT5cbiAgICAgICAgcmV0dXJuIG5vIGlmIG5vdCBjb21tYW5kcz9cblxuICAgICAgICByZXN1bHQgPSBub1xuXG4gICAgICAgIGZvciBjb21tYW5kIGluIGNvbW1hbmRzXG4gICAgICAgICAgICBzd2l0Y2ggY29tbWFuZC5pZFxuICAgICAgICAgICAgICAgIHdoZW4gXCJ2bi5DaG9pY2VcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hY3Rpb24uc2NlbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjZW5lRG9jdW1lbnQgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudChjb21tYW5kLnBhcmFtcy5hY3Rpb24uc2NlbmUudWlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2NlbmVEb2N1bWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICFzY2VuZURvY3VtZW50LmxvYWRlZCBpZiAhcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2NlbmVEb2N1bWVudC5sb2FkZWQgYW5kICFAbG9hZGVkU2NlbmVzQnlVaWRbc2NlbmVEb2N1bWVudC51aWRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkZWRTY2VuZXNCeVVpZFtzY2VuZURvY3VtZW50LnVpZF0gPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gQF9sb2FkRXZlbnRDb21tYW5kc0RhdGEoc2NlbmVEb2N1bWVudC5pdGVtcy5jb21tYW5kcykgaWYgIXJlc3VsdFxuXG4gICAgICAgICAgICAgICAgd2hlbiBcInZuLkNhbGxTY2VuZVwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLnNjZW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2VuZURvY3VtZW50ID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoY29tbWFuZC5wYXJhbXMuc2NlbmUudWlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2NlbmVEb2N1bWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICFzY2VuZURvY3VtZW50LmxvYWRlZCBpZiAhcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2NlbmVEb2N1bWVudC5sb2FkZWQgYW5kICFAbG9hZGVkU2NlbmVzQnlVaWRbc2NlbmVEb2N1bWVudC51aWRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkZWRTY2VuZXNCeVVpZFtzY2VuZURvY3VtZW50LnVpZF0gPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gQF9sb2FkRXZlbnRDb21tYW5kc0RhdGEoc2NlbmVEb2N1bWVudC5pdGVtcy5jb21tYW5kcykgaWYgIXJlc3VsdFxuXG4gICAgICAgIHJldHVybiByZXN1bHRcblxuICAgICMjIypcbiAgICAqIFByZWxvYWRzIGFsbCByZXNvdXJjZXMgbmVlZGVkIGJ5IHRoZSBzcGVjaWZpZWQgY29tbW9uIGV2ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZENvbW1vbkV2ZW50UmVzb3VyY2VzXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRJZCAtIElEIG9mIHRoZSBjb21tb24gZXZlbnQgdG8gcHJlbG9hZCB0aGUgcmVzb3VyY2VzIGZvci5cbiAgICAqIEBzdGF0aWNcbiAgICAjIyNcbiAgICBsb2FkQ29tbW9uRXZlbnRSZXNvdXJjZXM6IChldmVudElkKSAtPlxuICAgICAgICBjb21tb25FdmVudCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzW2V2ZW50SWRdXG4gICAgICAgIGlmIGNvbW1vbkV2ZW50PyBhbmQgIUBsb2FkZWRDb21tb25FdmVudHNCeUlkW2V2ZW50SWRdXG4gICAgICAgICAgICBAbG9hZGVkQ29tbW9uRXZlbnRzQnlJZFtldmVudElkXSA9IHRydWVcbiAgICAgICAgICAgIEBfbG9hZEV2ZW50Q29tbWFuZHNHcmFwaGljcyhjb21tb25FdmVudC5jb21tYW5kcylcblxuICAgICMjIypcbiAgICAqIExvYWRzIGFsbCByZXNvdXJjZXMgbmVlZGVkIGJ5IHRoZSBzcGVjaWZpZWQgbGlzdCBvZiBjb21tYW5kcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRFdmVudENvbW1hbmRzR3JhcGhpY3NcbiAgICAqIEBwYXJhbSB7T2JqZWN0W119IGNvbW1hbmRzIC0gVGhlIGxpc3Qgb2YgY29tbWFuZHMuXG4gICAgKiBAc3RhdGljXG4gICAgIyMjXG4gICAgbG9hZEV2ZW50Q29tbWFuZHNHcmFwaGljczogKGNvbW1hbmRzKSAtPlxuICAgICAgICBAbG9hZGVkU2NlbmVzQnlVaWQgPSB7fVxuICAgICAgICBAbG9hZGVkQ29tbW9uRXZlbnRzQnlJZCA9IFtdXG4gICAgICAgIEBfbG9hZEV2ZW50Q29tbWFuZHNHcmFwaGljcyhjb21tYW5kcylcblxuICAgIF9sb2FkRXZlbnRDb21tYW5kc0dyYXBoaWNzOiAoY29tbWFuZHMpIC0+XG4gICAgICAgIHJldHVybiBpZiBub3QgY29tbWFuZHM/XG5cbiAgICAgICAgZm9yIGNvbW1hbmQgaW4gY29tbWFuZHNcbiAgICAgICAgICAgIHN3aXRjaCBjb21tYW5kLmlkXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLlN0YXJ0VGltZXJcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hY3Rpb24udHlwZSA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICBAbG9hZENvbW1vbkV2ZW50UmVzb3VyY2VzKGNvbW1hbmQucGFyYW1zLmFjdGlvbi5kYXRhLmNvbW1vbkV2ZW50SWQpXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLkNhbGxDb21tb25FdmVudFwiXG4gICAgICAgICAgICAgICAgICAgIGNvbW1vbkV2ZW50ID0gUmVjb3JkTWFuYWdlci5jb21tb25FdmVudHNbY29tbWFuZC5wYXJhbXMuY29tbW9uRXZlbnRJZF1cbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbW9uRXZlbnQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgcGFyYW0sIGkgaW4gY29tbW9uRXZlbnQucGFyYW1ldGVyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHBhcmFtLnN0cmluZ1ZhbHVlVHlwZSA9PSBcInNjZW5lSWRcIiBhbmQgY29tbWFuZC5wYXJhbXMucGFyYW1ldGVycz8udmFsdWVzW2ldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjZW5lRG9jdW1lbnQgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudChjb21tYW5kLnBhcmFtcy5wYXJhbWV0ZXJzLnZhbHVlc1tpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2NlbmVEb2N1bWVudCBhbmQgIUBsb2FkZWRTY2VuZXNCeVVpZFtzY2VuZURvY3VtZW50LnVpZF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkZWRTY2VuZXNCeVVpZFtzY2VuZURvY3VtZW50LnVpZF0gPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBfbG9hZEV2ZW50Q29tbWFuZHNHcmFwaGljcyhzY2VuZURvY3VtZW50Lml0ZW1zLmNvbW1hbmRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgIUBsb2FkZWRDb21tb25FdmVudHNCeUlkW2NvbW1hbmQucGFyYW1zLmNvbW1vbkV2ZW50SWRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRlZENvbW1vbkV2ZW50c0J5SWRbY29tbWFuZC5wYXJhbXMuY29tbW9uRXZlbnRJZF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQF9sb2FkRXZlbnRDb21tYW5kc0dyYXBoaWNzKGNvbW1vbkV2ZW50LmNvbW1hbmRzKVxuICAgICAgICAgICAgICAgIHdoZW4gXCJ2bi5DYWxsU2NlbmVcIlxuICAgICAgICAgICAgICAgICAgICBzY2VuZURvY3VtZW50ID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoY29tbWFuZC5wYXJhbXMuc2NlbmUudWlkKVxuICAgICAgICAgICAgICAgICAgICBpZiBzY2VuZURvY3VtZW50IGFuZCAhQGxvYWRlZFNjZW5lc0J5VWlkW3NjZW5lRG9jdW1lbnQudWlkXVxuICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRlZFNjZW5lc0J5VWlkW3NjZW5lRG9jdW1lbnQudWlkXSA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgQF9sb2FkRXZlbnRDb21tYW5kc0dyYXBoaWNzKHNjZW5lRG9jdW1lbnQuaXRlbXMuY29tbWFuZHMpXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZVRyYW5zaXRpb25cIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5ncmFwaGljPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLmdyYXBoaWMpKVxuICAgICAgICAgICAgICAgIHdoZW4gXCJncy5TY3JlZW5UcmFuc2l0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuZ3JhcGhpYz8ubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChjb21tYW5kLnBhcmFtcy5ncmFwaGljKSlcbiAgICAgICAgICAgICAgICB3aGVuIFwidm4uQ2hhbmdlQmFja2dyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmdyYXBoaWM/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLmdyYXBoaWMpKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hbmltYXRpb24/LnR5cGUgPT0gZ3MuQW5pbWF0aW9uVHlwZXMuTUFTS0lORyBhbmQgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLm1hc2s/LmdyYXBoaWNcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLm1hc2suZ3JhcGhpYykpXG4gICAgICAgICAgICAgICAgd2hlbiBcInZuLkwyREpvaW5TY2VuZVwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLm1vZGVsP1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldExpdmUyRE1vZGVsKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLm1vZGVsKSlcbiAgICAgICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVySm9pblNjZW5lXCJcbiAgICAgICAgICAgICAgICAgICAgY2hhcmFjdGVyID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzW2NvbW1hbmQucGFyYW1zLmNoYXJhY3RlcklkXVxuICAgICAgICAgICAgICAgICAgICBpZiBjaGFyYWN0ZXI/XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uSWQgPSBjb21tYW5kLnBhcmFtcy5leHByZXNzaW9uSWQgPyBjaGFyYWN0ZXIuZGVmYXVsdEV4cHJlc3Npb25JZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXhwcmVzc2lvbklkP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29yZCA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyRXhwcmVzc2lvbnNbZXhwcmVzc2lvbklkXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlY29yZD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmVjb3JkLmlkbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbWFnZSBpbiByZWNvcmQuaWRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoaW1hZ2UucmVzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiByZWNvcmQudGFsa2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGltYWdlIGluIHJlY29yZC50YWxraW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChpbWFnZS5yZXNvdXJjZSkpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLnR5cGUgPT0gZ3MuQW5pbWF0aW9uVHlwZXMuTUFTS0lORyBhbmQgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLm1hc2suZ3JhcGhpYz9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLm1hc2suZ3JhcGhpYykpXG4gICAgICAgICAgICAgICAgd2hlbiBcInZuLkNoYXJhY3RlckNoYW5nZUV4cHJlc3Npb25cIlxuICAgICAgICAgICAgICAgICAgICByZWNvcmQgPSBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlckV4cHJlc3Npb25zW2NvbW1hbmQucGFyYW1zLmV4cHJlc3Npb25JZF1cbiAgICAgICAgICAgICAgICAgICAgaWYgcmVjb3JkP1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGltYWdlIGluIHJlY29yZC5pZGxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChpbWFnZS5yZXNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW1hZ2UgaW4gcmVjb3JkLnRhbGtpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGltYWdlLnJlc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLnR5cGUgPT0gZ3MuQW5pbWF0aW9uVHlwZXMuTUFTS0lORyBhbmQgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLm1hc2suZ3JhcGhpYz9cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLm1hc2suZ3JhcGhpYykpXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLlNob3dQYXJ0aWFsTWVzc2FnZVwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLnZvaWNlP1xuICAgICAgICAgICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChjb21tYW5kLnBhcmFtcy52b2ljZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICNSZXNvdXJjZU1hbmFnZXIuZ2V0QXVkaW9CdWZmZXIoXCJBdWRpby9Tb3VuZC8je2NvbW1hbmQucGFyYW1zLnZvaWNlLm5hbWV9XCIpXG5cbiAgICAgICAgICAgICAgICB3aGVuIFwidm4uQ2hvaWNlXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYWN0aW9uLnNjZW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2VuZURvY3VtZW50ID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoY29tbWFuZC5wYXJhbXMuYWN0aW9uLnNjZW5lLnVpZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHNjZW5lRG9jdW1lbnQgYW5kICFAbG9hZGVkU2NlbmVzQnlVaWRbc2NlbmVEb2N1bWVudC51aWRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRlZFNjZW5lc0J5VWlkW3NjZW5lRG9jdW1lbnQudWlkXSA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBfbG9hZEV2ZW50Q29tbWFuZHNHcmFwaGljcyhzY2VuZURvY3VtZW50Lml0ZW1zLmNvbW1hbmRzKVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmFjdGlvbi5jb21tb25FdmVudElkXG4gICAgICAgICAgICAgICAgICAgICAgICBAbG9hZENvbW1vbkV2ZW50UmVzb3VyY2VzKGNvbW1hbmQucGFyYW1zLmFjdGlvbi5jb21tb25FdmVudElkKVxuXG5cbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd01lc3NhZ2VcIiwgXCJncy5TaG93TWVzc2FnZU5WTFwiLCBcImdzLlNob3dUZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9ucz9cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBlaWQgaW4gY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IFJlY29yZE1hbmFnZXIuYW5pbWF0aW9uc1tlaWRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgYW5pbWF0aW9uPyBhbmQgYW5pbWF0aW9uLmdyYXBoaWMubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGFuaW1hdGlvbi5ncmFwaGljKSlcblxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5leHByZXNzaW9ucz9cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBlaWQgaW4gY29tbWFuZC5wYXJhbXMuZXhwcmVzc2lvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJFeHByZXNzaW9uc1tlaWRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXhwcmVzc2lvbj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXhwcmVzc2lvbi5pZGxlIHRoZW4gZm9yIGltYWdlIGluIGV4cHJlc3Npb24uaWRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChpbWFnZS5yZXNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGV4cHJlc3Npb24udGFsa2luZyB0aGVuIGZvciBpbWFnZSBpbiBleHByZXNzaW9uLnRhbGtpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoaW1hZ2UucmVzb3VyY2UpKVxuXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMudm9pY2U/XG4gICAgICAgICAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIubG9hZFNvdW5kKGNvbW1hbmQucGFyYW1zLnZvaWNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgI1Jlc291cmNlTWFuYWdlci5nZXRBdWRpb0J1ZmZlcihcIkF1ZGlvL1NvdW5kLyN7Y29tbWFuZC5wYXJhbXMudm9pY2UubmFtZX1cIilcbiAgICAgICAgICAgICAgICAgICAgcmVjb3JkID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJFeHByZXNzaW9uc1tjb21tYW5kLnBhcmFtcy5leHByZXNzaW9uSWRdXG4gICAgICAgICAgICAgICAgICAgIGlmIHJlY29yZD9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlY29yZC5pZGxlIHRoZW4gZm9yIGltYWdlIGluIHJlY29yZC5pZGxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChpbWFnZS5yZXNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZWNvcmQudGFsa2luZyB0aGVuIGZvciBpbWFnZSBpbiByZWNvcmQudGFsa2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoaW1hZ2UucmVzb3VyY2UpKVxuXG5cbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuQWRkSG90c3BvdFwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmJhc2VHcmFwaGljPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLmJhc2VHcmFwaGljKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuaG92ZXJHcmFwaGljPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLmhvdmVyR3JhcGhpYykpXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLnNlbGVjdGVkR3JhcGhpYz8ubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChjb21tYW5kLnBhcmFtcy5zZWxlY3RlZEdyYXBoaWMpKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5zZWxlY3RlZEhvdmVyR3JhcGhpYz8ubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChjb21tYW5kLnBhcmFtcy5zZWxlY3RlZEhvdmVyR3JhcGhpYykpXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLnVuc2VsZWN0ZWRHcmFwaGljPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLnVuc2VsZWN0ZWRHcmFwaGljKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYWN0aW9ucz9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmFjdGlvbnMub25DbGljay50eXBlID09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAbG9hZENvbW1vbkV2ZW50UmVzb3VyY2VzKGNvbW1hbmQucGFyYW1zLmFjdGlvbnMub25DbGljay5jb21tb25FdmVudElkKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYWN0aW9ucy5vbkVudGVyLnR5cGUgPT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkQ29tbW9uRXZlbnRSZXNvdXJjZXMoY29tbWFuZC5wYXJhbXMuYWN0aW9ucy5vbkVudGVyLmNvbW1vbkV2ZW50SWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hY3Rpb25zLm9uTGVhdmUudHlwZSA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRDb21tb25FdmVudFJlc291cmNlcyhjb21tYW5kLnBhcmFtcy5hY3Rpb25zLm9uTGVhdmUuY29tbW9uRXZlbnRJZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmFjdGlvbnMub25TZWxlY3QudHlwZSA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRDb21tb25FdmVudFJlc291cmNlcyhjb21tYW5kLnBhcmFtcy5hY3Rpb25zLm9uU2VsZWN0LmNvbW1vbkV2ZW50SWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hY3Rpb25zLm9uRGVzZWxlY3QudHlwZSA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRDb21tb25FdmVudFJlc291cmNlcyhjb21tYW5kLnBhcmFtcy5hY3Rpb25zLm9uRGVzZWxlY3QuY29tbW9uRXZlbnRJZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmFjdGlvbnMub25EcmFnLnR5cGUgPT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkQ29tbW9uRXZlbnRSZXNvdXJjZXMoY29tbWFuZC5wYXJhbXMuYWN0aW9ucy5vbkRyYWcuY29tbW9uRXZlbnRJZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmFjdGlvbnMub25Ecm9wLnR5cGUgPT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkQ29tbW9uRXZlbnRSZXNvdXJjZXMoY29tbWFuZC5wYXJhbXMuYWN0aW9ucy5vbkRyb3AuY29tbW9uRXZlbnRJZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmFjdGlvbnMub25Ecm9wUmVjZWl2ZS50eXBlID09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAbG9hZENvbW1vbkV2ZW50UmVzb3VyY2VzKGNvbW1hbmQucGFyYW1zLmFjdGlvbnMub25Ecm9wUmVjZWl2ZS5jb21tb25FdmVudElkKVxuXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLlNob3dQaWN0dXJlXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuZ3JhcGhpYz8ubmFtZSBhbmQgIWNvbW1hbmQucGFyYW1zLmdyYXBoaWMuc2NvcGU/XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLmdyYXBoaWMpKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5hbmltYXRpb24/LnR5cGUgPT0gZ3MuQW5pbWF0aW9uVHlwZXMuTUFTS0lOR1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChjb21tYW5kLnBhcmFtcy5hbmltYXRpb24ubWFzay5ncmFwaGljKSlcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd0ltYWdlTWFwXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuZ3JvdW5kPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLmdyb3VuZCkpXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmhvdmVyPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLmhvdmVyKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMudW5zZWxlY3RlZD8ubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChjb21tYW5kLnBhcmFtcy51bnNlbGVjdGVkKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuc2VsZWN0ZWQ/Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoY29tbWFuZC5wYXJhbXMuc2VsZWN0ZWQpKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5zZWxlY3RlZEhvdmVyPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLnNlbGVjdGVkSG92ZXIpKVxuICAgICAgICAgICAgICAgICAgICBmb3IgaG90c3BvdCBpbiBjb21tYW5kLnBhcmFtcy5ob3RzcG90c1xuICAgICAgICAgICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChob3RzcG90LmRhdGEub25Ib3ZlclNvdW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChob3RzcG90LmRhdGEub25DbGlja1NvdW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgaG90c3BvdC5kYXRhLmFjdGlvbiA9PSAyICMgQ29tbW9uIEV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbW9uRXZlbnQgPSBSZWNvcmRNYW5hZ2VyLmNvbW1vbkV2ZW50c1tob3RzcG90LmRhdGEuY29tbW9uRXZlbnRJZF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBjb21tb25FdmVudD8gYW5kICFAbG9hZGVkQ29tbW9uRXZlbnRzQnlJZFtob3RzcG90LmRhdGEuY29tbW9uRXZlbnRJZF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRlZENvbW1vbkV2ZW50c0J5SWRbaG90c3BvdC5kYXRhLmNvbW1vbkV2ZW50SWRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAX2xvYWRFdmVudENvbW1hbmRzR3JhcGhpY3MoY29tbW9uRXZlbnQuY29tbWFuZHMpXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLk1vdmVQaWN0dXJlUGF0aFwiLCBcInZuLk1vdmVDaGFyYWN0ZXJQYXRoXCIsIFwidm4uU2Nyb2xsQmFja2dyb3VuZFBhdGhcIiwgXCJncy5Nb3ZlVmlkZW9QYXRoXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMucGF0aC5lZmZlY3RzP1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGVmZmVjdCBpbiBjb21tYW5kLnBhcmFtcy5wYXRoLmVmZmVjdHMuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5sb2FkU291bmQoZWZmZWN0LnNvdW5kKVxuXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLk1hc2tQaWN0dXJlXCIsIFwidm4uTWFza0NoYXJhY3RlclwiLCBcInZuLk1hc2tCYWNrZ3JvdW5kXCIsIFwiZ3MuTWFza1ZpZGVvXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMubWFzay5zb3VyY2VUeXBlID09IDAgYW5kIGNvbW1hbmQucGFyYW1zLm1hc2suZ3JhcGhpYz8ubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChjb21tYW5kLnBhcmFtcy5tYXNrLmdyYXBoaWMpKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5tYXNrLnNvdXJjZVR5cGUgPT0gMSBhbmQgY29tbWFuZC5wYXJhbXMubWFzay52aWRlbz8ubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldFZpZGVvKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLm1hc2sudmlkZW8pKVxuICAgICAgICAgICAgICAgIHdoZW4gXCJncy5QbGF5UGljdHVyZUFuaW1hdGlvblwiXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbklkID0gY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uSWRcbiAgICAgICAgICAgICAgICAgICAgaWYgYW5pbWF0aW9uSWQ/IGFuZCBub3QgYW5pbWF0aW9uSWQuc2NvcGU/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uID0gUmVjb3JkTWFuYWdlci5hbmltYXRpb25zW2FuaW1hdGlvbklkXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGFuaW1hdGlvbiBhbmQgYW5pbWF0aW9uLmdyYXBoaWM/Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChhbmltYXRpb24uZ3JhcGhpYykpXG5cbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd0JhdHRsZUFuaW1hdGlvblwiXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbklkID0gY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uSWRcbiAgICAgICAgICAgICAgICAgICAgaWYgYW5pbWF0aW9uSWQ/IGFuZCBub3QgYW5pbWF0aW9uSWQuc2NvcGU/XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24gPSBSZWNvcmRNYW5hZ2VyLmFuaW1hdGlvbnNbYW5pbWF0aW9uSWRdXG4gICAgICAgICAgICAgICAgICAgICAgICBAbG9hZENvbXBsZXhBbmltYXRpb24oYW5pbWF0aW9uKVxuXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLklucHV0TmFtZVwiXG4gICAgICAgICAgICAgICAgICAgIGFjdG9ySWQgPSBjb21tYW5kLnBhcmFtcy5hY3RvcklkXG4gICAgICAgICAgICAgICAgICAgIGlmIGFjdG9ySWQ/IGFuZCBub3QgYWN0b3JJZC5zY29wZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdG9yID0gUmVjb3JkTWFuYWdlci5hY3RvcnNbYWN0b3JJZF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGFjdG9yP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9GYWNlcy8je2FjdG9yLmZhY2VHcmFwaGljPy5uYW1lfVwiKVxuXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZVRpbGVzZXRcIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy5ncmFwaGljPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvVGlsZXNldHMvI3tjb21tYW5kLnBhcmFtcy5ncmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZU1hcFBhcmFsbGF4QmFja2dyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLnBhcmFsbGF4QmFja2dyb3VuZD8ubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL1BpY3R1cmVzLyN7Y29tbWFuZC5wYXJhbXMucGFyYWxsYXhCYWNrZ3JvdW5kLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZUFjdG9yR3JhcGhpY1wiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmNoYW5nZUNoYXJhY3RlciBhbmQgY29tbWFuZC5wYXJhbXMuY2hhcmFjdGVyR3JhcGhpYz8ubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL0NoYXJhY3RlcnMvI3tjb21tYW5kLnBhcmFtcy5jaGFyYWN0ZXJHcmFwaGljLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmNoYW5nZUZhY2UgYW5kIGNvbW1hbmQucGFyYW1zLmZhY2VHcmFwaGljPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvRmFjZXMvI3tjb21tYW5kLnBhcmFtcy5mYWNlR3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgICAgIHdoZW4gXCJncy5Nb3ZlRXZlbnRcIlxuICAgICAgICAgICAgICAgICAgICBmb3IgbW92ZUNvbW1hbmQgaW4gY29tbWFuZC5wYXJhbXMuY29tbWFuZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCBtb3ZlQ29tbWFuZC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gNDQgIyBDaGFuZ2UgR3JhcGhpY1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvQ2hhcmFjdGVycy8je21vdmVDb21tYW5kLnJlc291cmNlLm5hbWV9XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiA0NyAjIFBsYXkgU291bmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChtb3ZlQ29tbWFuZC5yZXNvdXJjZSlcbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuVHJhbnNmb3JtRW5lbXlcIlxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgY29tbWFuZC5wYXJhbXM/LnRhcmdldElkLnNjb3BlPyAjIEZJWE1FOiBNYXliZSBqdXN0IHVzZSB0aGUgY3VycmVudCB2YXJpYWJsZSB2YWx1ZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZW15ID0gUmVjb3JkTWFuYWdlci5lbmVtaWVzW2NvbW1hbmQucGFyYW1zLnRhcmdldElkXVxuICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRBY3RvckJhdHRsZUFuaW1hdGlvbnMoZW5lbXkpXG5cbiAgICAgICAgICAgICAgICB3aGVuIFwiZ3MuUGxheU11c2ljXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMubXVzaWM/XG4gICAgICAgICAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIubG9hZE11c2ljKGNvbW1hbmQucGFyYW1zLm11c2ljKVxuICAgICAgICAgICAgICAgIHdoZW4gXCJncy5QbGF5VmlkZW9cIiwgXCJncy5TaG93VmlkZW9cIlxuICAgICAgICAgICAgICAgICAgICBpZiBjb21tYW5kLnBhcmFtcy52aWRlbz8ubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldFZpZGVvKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGNvbW1hbmQucGFyYW1zLnZpZGVvKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uPy50eXBlID09IGdzLkFuaW1hdGlvblR5cGVzLk1BU0tJTkdcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoY29tbWFuZC5wYXJhbXMuYW5pbWF0aW9uLm1hc2suZ3JhcGhpYykpXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLlBsYXlTb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLnNvdW5kP1xuICAgICAgICAgICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLmxvYWRTb3VuZChjb21tYW5kLnBhcmFtcy5zb3VuZClcblxuICAgICAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFuZ2VTb3VuZHNcIlxuICAgICAgICAgICAgICAgICAgICBmb3Igc291bmQgaW4gY29tbWFuZC5wYXJhbXMuc291bmRzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBzb3VuZD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIubG9hZFNvdW5kKHNvdW5kKVxuXG4gICAgICAgICAgICAgICAgd2hlbiBcImdzLkNoYW5nZVNjcmVlbkN1cnNvclwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbW1hbmQucGFyYW1zLmdyYXBoaWM/Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoY29tbWFuZC5wYXJhbXMuZ3JhcGhpYykpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBMb2FkcyBhbGwgcmVzb3VyY2VzIGZvciB0aGUgc3BlY2lmaWVkIGFuaW1hdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRBbmltYXRpb25cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBhbmltYXRpb24gLSBUaGUgYW5pbWF0aW9uLXJlY29yZC5cbiAgICAqIEBzdGF0aWNcbiAgICAjIyNcbiAgICBsb2FkQW5pbWF0aW9uOiAoYW5pbWF0aW9uKSAtPlxuICAgICAgICBpZiBhbmltYXRpb24/IGFuZCBhbmltYXRpb24uZ3JhcGhpYz9cbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9TaW1wbGVBbmltYXRpb25zLyN7YW5pbWF0aW9uLmdyYXBoaWMubmFtZX1cIilcblxuXG5cbmdzLlJlc291cmNlTG9hZGVyID0gbmV3IFJlc291cmNlTG9hZGVyKClcbndpbmRvdy5SZXNvdXJjZUxvYWRlciA9IGdzLlJlc291cmNlTG9hZGVyIl19
//# sourceURL=ResourceLoader_20.js