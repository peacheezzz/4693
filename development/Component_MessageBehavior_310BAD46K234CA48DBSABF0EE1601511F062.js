
/**
* An enumeration of game message modes.
*
* ADV - Adventure Mode
* NVL - Novel Mode
*
* @typedef MessageMode
* @memberof vn
 */
var Component_MessageBehavior, MessageMode,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MessageMode = (function() {
  function MessageMode() {}

  MessageMode.ADV = 0;

  MessageMode.NVL = 1;

  return MessageMode;

})();

vn.MessageMode = MessageMode;

Component_MessageBehavior = (function(superClass) {
  extend(Component_MessageBehavior, superClass);

  Component_MessageBehavior.objectCodecBlackList = ["onMessageWaiting", "onMessageFinish"];


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_MessageBehavior.prototype.onDataBundleRestore = function(data, context) {
    this.tempSettings = GameManager.tempSettings;
    return this.setupEventHandlers();
  };


  /**
  * A behavior-component to define the behavior of a game-message.
  *
  * @module vn
  * @class Component_MessageBehavior
  * @extends gs.Component
  * @memberof vn
  * @constructor
   */

  function Component_MessageBehavior() {

    /**
    * Reference to temporary game settings.
    * @property settings
    * @type Object
    * @protected
     */
    this.tempSettings = GameManager.tempSettings;

    /**
    * Indicates if the message is currently waiting.
    * @property isWaiting
    * @type boolean
    * @readOnly
     */
    this.isWaiting = false;

    /**
    * Indicates if the message is currently running.
    * @property isRunning
    * @type boolean
    * @readOnly
     */
    this.isRunning = false;

    /**
    * Indicates if a voice is currently playing together with the message.
    * @property isVoicePlaying
    * @type boolean
    * @readOnly
     */
    this.isVoicePlaying = false;

    /**
    * Current message caret/cursor position.
    * @property caretPosition
    * @type gs.Point
    * @readOnly
     */
    this.caretPosition = new gs.Point(0, 0);

    /**
    * Current raw message text.
    * @property message
    * @type string
    * @readOnly
     */
    this.message = "";

    /**
    * All currently displayed raw messages.
    * @property messages
    * @type string[]
    * @readOnly
     */
    this.messages = [];

    /**
    * Voice associated with the current message.
    * @property voice
    * @type gs.AudioBufferReference
     */
    this.voice = null;

    /**
    * Indicates if current message is partial. DEPRECATED. Please do not use.
    * @property partial
    * @deprecated
    * @type boolean
    * @readOnly
     */
    this.partial = false;

    /**
    * Indicates if the message is currently waiting in live-preview.
    * @property waitingPreview
    * @type boolean
    * @readOnly
     */
    this.waitingPreview = false;

    /**
    * Indicates if the auto-message is enabled.
    * @property autoMessageEnabled
    * @type boolean
    * @readOnly
     */
    this.autoMessageEnabled = false;
    this.onMessageFinish = (function(_this) {
      return function(sender) {
        _this.object.events.emit("finish", _this);
        if (_this.object.settings.autoErase || _this.object.settings.paragraphSpacing > 0) {
          return _this.message = "";
        }
      };
    })(this);
    this.onMessageWaiting = (function(_this) {
      return function(sender) {
        if (!_this.object.textRenderer.isBatched() || !_this.object.textRenderer.isBatchInProgress()) {
          _this.object.textRenderer.waitAtEnd = !_this.partial;
          return _this.object.events.emit("waiting", _this);
        }
      };
    })(this);
  }


  /**
  * Reference to game settings.
  * @property settings
  * @type Object
  * @protected
   */

  Component_MessageBehavior.accessors("settings", {
    get: function() {
      return GameManager.settings;
    }

    /**
    * Adds event-handlers
    *
    * @method setupEventHandlers
     */
  });

  Component_MessageBehavior.prototype.setupEventHandlers = function() {
    this.object.events.offByOwner("messageFinish", this);
    this.object.events.offByOwner("messageWaiting", this);
    this.object.events.on("messageFinish", gs.CallBack("onMessageFinish", this), null, this);
    this.object.events.on("messageWaiting", gs.CallBack("onMessageWaiting", this), null, this);
    gs.GlobalEventManager.offByOwner("previewWaiting", this);
    gs.GlobalEventManager.offByOwner("previewRestart", this);
    gs.GlobalEventManager.on("previewWaiting", ((function(_this) {
      return function(sender) {
        return _this.waitingPreview = true;
      };
    })(this)), null, this);
    return gs.GlobalEventManager.on("previewRestart", ((function(_this) {
      return function(sender) {
        return _this.waitingPreview = false;
      };
    })(this)), null, this);
  };


  /**
  * Setup the component. Adds event handlers.
  *
  * @method setup
   */

  Component_MessageBehavior.prototype.setup = function() {
    return this.setupEventHandlers();
  };


  /**
  * Disposes the component.
  *
  * @method toDataBundle
   */

  Component_MessageBehavior.prototype.dispose = function() {
    Component_MessageBehavior.__super__.dispose.apply(this, arguments);
    gs.GlobalEventManager.offByOwner("previewWaiting", this);
    return gs.GlobalEventManager.offByOwner("previewRestart", this);
  };


  /**
  * Not implemented yet.
  *
  * @method toDataBundle
   */

  Component_MessageBehavior.prototype.toDataBundle = function() {};


  /**
  * Not implemented yet.
  *
  * @method restore
  * @param {Object} bundle - A data bundle.
   */

  Component_MessageBehavior.prototype.restore = function(bundle) {};


  /**
  * Action to show a game message.
  *
  * @method showMessage
  * @param {Object} sender - The sender of this action.
  * @param {Object} params - An object containing the necessary parameters.
   */

  Component_MessageBehavior.prototype.showMessage = function(sender, params) {
    gs.GameNotifier.postContextChange(lcsm(params.message));
    this.partial = params.partial;
    this.message += lcsm(params.message);
    this.addMessage(params.message, RecordManager.characters[params.characterId], this.object.messages.length > 0 && this.object.settings.paragraphSpacing > 0, !this.partial);
    if (this.object.textRenderer.isBatched()) {
      return this.object.textRenderer.waitAtEnd = true;
    } else {
      return this.object.textRenderer.waitAtEnd = !this.partial;
    }
  };


  /**
  * Deprecated. Not longer used.
  *
  * @method updateBitmap
   */

  Component_MessageBehavior.prototype.updateBitmap = function() {
    var ref;
    if (!this.object.bitmap || this.object.bitmap.width !== this.object.dstRect.width || this.object.bitmap.height !== this.object.dstRect.height) {
      if ((ref = this.object.bitmap) != null) {
        ref.dispose();
      }
      this.object.bitmap = new Bitmap(this.object.dstRect.width, this.object.dstRect.height);
      return this.object.bitmap.font = this.object.font;
    }
  };


  /**
  * Restores a NVL game message of an array of message-objects. That is
  * necessary to restore a NVL game message from a save-game.
  *
  * @method restoreMessages
  * @param {Array} messages - An array of messages to restore.
   */

  Component_MessageBehavior.prototype.restoreMessages = function(messages) {
    var i, len, message, ref, ref1;
    this.updateBitmap();
    this.clear();
    this.object.opacity = 255;
    this.object.srcRect = new Rect(0, 0, this.object.dstRect.width, this.object.dstRect.height);
    for (i = 0, len = messages.length; i < len; i++) {
      message = messages[i];
      this.object.font.color = new Color(((ref = message.character) != null ? ref.textColor : void 0) || Color.WHITE);
      this.object.textRenderer.drawFormattedTextImmediately(0, 0, this.object.dstRect.width, this.object.dstRect.height, lcsm((ref1 = message.text) != null ? ref1 : message), true);
    }
    return null;
  };


  /**
  * Adds a new message.
  * 
  * @method addMessage
  * @param {string} message - The message.
  * @param {Object} character - Database-Record of a character.
  * @param {boolean} newLine - Indicates if the message should make a line break.
   */

  Component_MessageBehavior.prototype.addMessage = function(message, character, newLine, waitAtEnd) {
    this.object.textRenderer.partialMessage = null;
    this.object.offset = {
      x: 0,
      y: 0
    };
    this.object.visible = true;
    this.object.messages.push({
      text: message,
      character: character
    });
    this.object.textRenderer.waitAtEnd = waitAtEnd;
    if (!this.object.settings.autoErase) {
      this.object.textRenderer.currentY += this.object.settings.paragraphSpacing;
    }
    if (newLine) {
      this.object.textRenderer.newLine();
    }
    this.updateBitmap();
    if ((character != null) && this.object.settings.useCharacterColor) {
      this.object.font.color = new Color((character != null ? character.textColor : void 0) || Color.WHITE);
    }
    this.object.opacity = 255;
    this.object.srcRect = new Rect(0, 0, this.object.dstRect.width, this.object.dstRect.height);
    this.update();
    return this.object.textRenderer.drawFormattedText(0, 0, this.object.dstRect.width, this.object.dstRect.height, message, true);
  };


  /**
  * Clears the game message by deleting/clearing all messages.
  *
  * @method clear
   */

  Component_MessageBehavior.prototype.clear = function() {
    this.object.textRenderer.clear();
    this.object.messages = [];
    return this.message = "";
  };


  /**
  * Closes the game message by making it invisible.
  *
  * @method close
   */

  Component_MessageBehavior.prototype.close = function() {
    return this.object.visible = false;
  };


  /**
  * Gets the duration of an associated voice or 0 if no voice is associated.
  *
  * @method voiceDuration
  * @return {number} The duration in frames.
   */

  Component_MessageBehavior.prototype.voiceDuration = function() {
    var duration;
    duration = 0;
    if ((this.voice != null) && (this.settings.autoMessage.waitForVoice || this.settings.timeMessageToVoice)) {
      duration = Math.round((this.voice.source.buffer.duration * (1.0 / this.voice.source.playbackRate.value)) * 1000 / 16.6);
    } else {
      duration = 0;
    }
    if (this.tempSettings.skip) {
      return 1;
    } else {
      return duration;
    }
  };


  /**
  * Gets the duration of rendering the game-message.
  *
  * @method messageDuration
  * @return {number} The duration in frames.
   */

  Component_MessageBehavior.prototype.messageDuration = function() {
    var duration;
    duration = this.object.textRenderer.calculateDuration();
    if (this.tempSettings.skip) {
      return 1;
    } else {
      return duration;
    }
  };


  /**
  * Gets the time between two messages in auto-read mode.
  *
  * @method autoMessageTime
  * @return {number} The time in frames.
   */

  Component_MessageBehavior.prototype.autoMessageTime = function() {
    if (this.tempSettings.skip) {
      return 1;
    } else {
      return Math.max(Math.round(this.settings.autoMessage.time * Graphics.frameRate), this.voiceDuration() - this.messageDuration());
    }
  };


  /**
  * Gets the current message speed.
  *
  * @method messageSpeed
  * @return {number} The message speed.
   */

  Component_MessageBehavior.prototype.messageSpeed = function() {
    return Math.max(11 - Math.round(GameManager.settings.messageSpeed * 2.5), 0);
  };


  /**
  * Checks if a mouse-button or key was pressed to continue with the message-rendering.
  *
  * @method actionTrigger
  * @return {boolean} If true, the an action-button or action-key is pressed.
   */

  Component_MessageBehavior.prototype.actionTrigger = function() {
    return (gs.ObjectManager.current.input && this.object.visible && this.object.dstRect.contains(Input.Mouse.x - this.object.origin.x, Input.Mouse.y - this.object.origin.y) && Input.Mouse.buttons[Input.Mouse.LEFT] === 2) || Input.trigger(Input.C);
  };

  Component_MessageBehavior.prototype.finish = function() {
    if ((this.object.voice != null) && GameManager.settings.skipVoiceOnAction) {
      return AudioManager.stopSound(this.object.voice.name);
    }
  };

  Component_MessageBehavior.prototype.erase = function() {
    var duration, fading;
    fading = GameManager.tempSettings.messageFading;
    duration = GameManager.tempSettings.skip ? 0 : fading.duration;
    return this.object.animator.disappear(fading.animation, fading.easing, duration, (function(_this) {
      return function() {
        SceneManager.scene.currentCharacter = {
          name: ""
        };
        _this.clear();
        return _this.object.visible = false;
      };
    })(this));
  };


  /**
  * FIXME: Deprecated? It is also a re-definition of gs.Component_Visual.updateOrigin.
  *
  * @method updateOrigin
   */

  Component_MessageBehavior.prototype.updateOrigin = function() {
    var ox, oy, p;
    ox = 0;
    oy = 0;
    if ((this.object.parent != null) && (this.object.parent.dstRect != null)) {
      p = this.object.parent;
      while ((p != null) && (p.dstRect != null)) {
        ox += p.dstRect.x;
        oy += p.dstRect.y;
        p = p.parent;
      }
    }
    this.object.origin.x = ox;
    return this.object.origin.y = oy;
  };


  /**
  * Updates the object. 
  *
  * @method updateObject
  * @private
   */

  Component_MessageBehavior.prototype.updateObject = function() {
    this.updateOrigin();
    if (this.tempSettings.skip && !this.waitingPreview) {
      return this.object.textRenderer.isWaiting = false;
    }
  };


  /**
  * Updates the message.
  *
  * @method updateMessage
  * @private
   */

  Component_MessageBehavior.prototype.updateMessage = function() {
    var ref;
    this.caretPosition = this.object.textRenderer.caretPosition;
    if (this.tempSettings.skip && (this.settings.allowSkipUnreadMessages || ((ref = GameManager.globalData.messages[this.message]) != null ? ref.read : void 0))) {
      this.object.textRenderer.drawImmediately = true;
      this.object.textRenderer.waitAtEnd = this.waitingPreview;
      return this.object.textRenderer.waitAtEndTime = 0;
    } else {
      this.updateSpeed();
      return this.updateAutoMessage();
    }
  };


  /**
  * Updates the speed of the message. That depends on game-settings if a message
  * is timed to its voice or not.
  *
  * @method updateSpeed
  * @private
   */

  Component_MessageBehavior.prototype.updateSpeed = function() {
    var voiceDuration;
    voiceDuration = this.voiceDuration();
    if (voiceDuration > 0 && this.settings.timeMessageToVoice) {
      return this.object.textRenderer.speed = voiceDuration / this.message.length;
    } else {
      return this.object.textRenderer.speed = this.messageSpeed();
    }
  };


  /**
  * Update auto-read mode.
  *
  * @method updateAutoMessage
  * @private
   */

  Component_MessageBehavior.prototype.updateAutoMessage = function() {
    if (this.settings.autoMessage.stopOnAction && this.actionTrigger()) {
      this.settings.autoMessage.enabled = false;
    }
    if (this.settings.autoMessage.enabled && !this.partial) {
      if (this.object.textRenderer.waitAtEnd) {
        this.object.textRenderer.isWaiting = false;
      }
      this.object.textRenderer.waitAtEndTime = this.autoMessageTime();
      this.object.textRenderer.waitAtEnd = false;
    } else if (this.autoMessageEnabled !== this.settings.autoMessage.enabled) {
      this.object.textRenderer.waitAtEnd = true;
      this.object.textRenderer.waitAtEndTime = 0;
    }
    return this.autoMessageEnabled = this.settings.autoMessage.enabled;
  };


  /*
  * Updates the game message behavior
  *
  * @method update
   */

  Component_MessageBehavior.prototype.update = function() {
    var ref, ref1, ref2, ref3, ref4, ref5;
    this.object.needsUpdate = true;
    this.updateObject();
    this.updateMessage();
    if (this.character !== this.object.character) {
      gs.GlobalEventManager.emit("talkingEnded", this, {
        character: this.character
      });
      this.character = this.object.character;
    }
    if (this.object.textRenderer.isWaiting !== this.isWaiting || this.object.textRenderer.isRunning !== this.isRunning || (((ref = this.voice) != null ? ref.playing : void 0) && (!((ref1 = this.object.character) != null ? ref1.timeTalkingToVoiceVolume : void 0) || this.voice.averageVolume > this.object.character.talkingVolume)) !== this.isVoicePlaying) {
      this.isWaiting = this.object.textRenderer.isWaiting;
      this.isRunning = this.object.textRenderer.isRunning;
      this.isVoicePlaying = ((ref2 = this.voice) != null ? ref2.playing : void 0) && (!((ref3 = this.object.character) != null ? ref3.timeTalkingToVoiceVolume : void 0) || this.voice.averageVolume > this.object.character.talkingVolume);
      if (!this.tempSettings.skip) {
        if ((ref4 = this.voice) != null ? ref4.playing : void 0) {
          if (!this.isVoicePlaying) {
            gs.GlobalEventManager.emit("talkingEnded", this, {
              character: this.object.character
            });
          } else {
            gs.GlobalEventManager.emit("talkingStarted", this, {
              character: this.object.character
            });
          }
        } else {
          if (this.isWaiting) {
            gs.GlobalEventManager.emit("talkingEnded", this, {
              character: this.object.character
            });
          } else if (this.isRunning) {
            gs.GlobalEventManager.emit("talkingStarted", this, {
              character: this.object.character
            });
          }
        }
      }
    }
    if ((this.object.layoutRect != null) && (((ref5 = this.object.parent) != null ? ref5.dstRect : void 0) != null)) {
      if (this.object.layoutRect.x) {
        this.object.dstRect.x = this.object.layoutRect.x(this.object.parent.dstRect.width);
      }
      if (this.object.layoutRect.y) {
        this.object.dstRect.y = this.object.layoutRect.y(this.object.parent.dstRect.height);
      }
      if (this.object.layoutRect.width) {
        this.object.dstRect.width = this.object.layoutRect.width(this.object.parent.dstRect.width);
      }
      if (this.object.layoutRect.height) {
        return this.object.dstRect.height = this.object.layoutRect.height(this.object.parent.dstRect.height);
      }
    }
  };

  return Component_MessageBehavior;

})(gs.Component);

vn.Component_MessageBehavior = Component_MessageBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFPQTs7Ozs7Ozs7O0FBQUEsSUFBQSxzQ0FBQTtFQUFBOzs7QUFTTTs7O0VBQ0YsV0FBQyxDQUFBLEdBQUQsR0FBTzs7RUFDUCxXQUFDLENBQUEsR0FBRCxHQUFPOzs7Ozs7QUFFWCxFQUFFLENBQUMsV0FBSCxHQUFpQjs7QUFHWDs7O0VBQ0YseUJBQUMsQ0FBQSxvQkFBRCxHQUF3QixDQUFDLGtCQUFELEVBQXFCLGlCQUFyQjs7O0FBRXhCOzs7Ozs7Ozs7c0NBUUEsbUJBQUEsR0FBcUIsU0FBQyxJQUFELEVBQU8sT0FBUDtJQUNqQixJQUFDLENBQUEsWUFBRCxHQUFnQixXQUFXLENBQUM7V0FDNUIsSUFBQyxDQUFBLGtCQUFELENBQUE7RUFGaUI7OztBQUlyQjs7Ozs7Ozs7OztFQVNhLG1DQUFBOztBQUNUOzs7Ozs7SUFNQSxJQUFDLENBQUEsWUFBRCxHQUFnQixXQUFXLENBQUM7O0FBRTVCOzs7Ozs7SUFNQSxJQUFDLENBQUEsU0FBRCxHQUFhOztBQUViOzs7Ozs7SUFNQSxJQUFDLENBQUEsU0FBRCxHQUFhOztBQUViOzs7Ozs7SUFNQSxJQUFDLENBQUEsY0FBRCxHQUFrQjs7QUFFbEI7Ozs7OztJQU1BLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxDQUFULEVBQVksQ0FBWjs7QUFFckI7Ozs7OztJQU1BLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7OztJQU1BLElBQUMsQ0FBQSxRQUFELEdBQVk7O0FBRVo7Ozs7O0lBS0EsSUFBQyxDQUFBLEtBQUQsR0FBUzs7QUFFVDs7Ozs7OztJQU9BLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7OztJQU1BLElBQUMsQ0FBQSxjQUFELEdBQWtCOztBQUVsQjs7Ozs7O0lBTUEsSUFBQyxDQUFBLGtCQUFELEdBQXNCO0lBRXRCLElBQUMsQ0FBQSxlQUFELEdBQW1CLENB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QUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUE1QyxFQUFqRDs7TUFDQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQXRCO1FBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQW5CLENBQXFCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUE1QyxFQUFqRDs7TUFDQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQXRCO1FBQWlDLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWhCLEdBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQW5CLENBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFoRCxFQUF6RDs7TUFDQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQXRCO2VBQWtDLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWhCLEdBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQW5CLENBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFqRCxFQUEzRDtPQUpKOztFQTFCSTs7OztHQS9iNEIsRUFBRSxDQUFDOztBQThkM0MsRUFBRSxDQUFDLHlCQUFILEdBQStCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfTWVzc2FnZUJlaGF2aW9yXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyMqXG4qIEFuIGVudW1lcmF0aW9uIG9mIGdhbWUgbWVzc2FnZSBtb2Rlcy5cbipcbiogQURWIC0gQWR2ZW50dXJlIE1vZGVcbiogTlZMIC0gTm92ZWwgTW9kZVxuKlxuKiBAdHlwZWRlZiBNZXNzYWdlTW9kZVxuKiBAbWVtYmVyb2Ygdm5cbiMjI1xuY2xhc3MgTWVzc2FnZU1vZGVcbiAgICBAQURWID0gMFxuICAgIEBOVkwgPSAxXG4gICAgXG52bi5NZXNzYWdlTW9kZSA9IE1lc3NhZ2VNb2RlXG5cblxuY2xhc3MgQ29tcG9uZW50X01lc3NhZ2VCZWhhdmlvciBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcIm9uTWVzc2FnZVdhaXRpbmdcIiwgXCJvbk1lc3NhZ2VGaW5pc2hcIl1cbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgQHRlbXBTZXR0aW5ncyA9IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5nc1xuICAgICAgICBAc2V0dXBFdmVudEhhbmRsZXJzKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQSBiZWhhdmlvci1jb21wb25lbnQgdG8gZGVmaW5lIHRoZSBiZWhhdmlvciBvZiBhIGdhbWUtbWVzc2FnZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIHZuXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X01lc3NhZ2VCZWhhdmlvclxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2Ygdm5cbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogUmVmZXJlbmNlIHRvIHRlbXBvcmFyeSBnYW1lIHNldHRpbmdzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzZXR0aW5nc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZW1wU2V0dGluZ3MgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3NcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIG1lc3NhZ2UgaXMgY3VycmVudGx5IHdhaXRpbmcuXG4gICAgICAgICogQHByb3BlcnR5IGlzV2FpdGluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgbWVzc2FnZSBpcyBjdXJyZW50bHkgcnVubmluZy5cbiAgICAgICAgKiBAcHJvcGVydHkgaXNSdW5uaW5nXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGlzUnVubmluZyA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIGEgdm9pY2UgaXMgY3VycmVudGx5IHBsYXlpbmcgdG9nZXRoZXIgd2l0aCB0aGUgbWVzc2FnZS5cbiAgICAgICAgKiBAcHJvcGVydHkgaXNWb2ljZVBsYXlpbmdcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAaXNWb2ljZVBsYXlpbmcgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEN1cnJlbnQgbWVzc2FnZSBjYXJldC9jdXJzb3IgcG9zaXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IGNhcmV0UG9zaXRpb25cbiAgICAgICAgKiBAdHlwZSBncy5Qb2ludFxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGNhcmV0UG9zaXRpb24gPSBuZXcgZ3MuUG9pbnQoMCwgMClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDdXJyZW50IHJhdyBtZXNzYWdlIHRleHQuXG4gICAgICAgICogQHByb3BlcnR5IG1lc3NhZ2VcbiAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBtZXNzYWdlID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCBjdXJyZW50bHkgZGlzcGxheWVkIHJhdyBtZXNzYWdlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgbWVzc2FnZXNcbiAgICAgICAgKiBAdHlwZSBzdHJpbmdbXVxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQG1lc3NhZ2VzID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBWb2ljZSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnQgbWVzc2FnZS5cbiAgICAgICAgKiBAcHJvcGVydHkgdm9pY2VcbiAgICAgICAgKiBAdHlwZSBncy5BdWRpb0J1ZmZlclJlZmVyZW5jZVxuICAgICAgICAjIyNcbiAgICAgICAgQHZvaWNlID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiBjdXJyZW50IG1lc3NhZ2UgaXMgcGFydGlhbC4gREVQUkVDQVRFRC4gUGxlYXNlIGRvIG5vdCB1c2UuXG4gICAgICAgICogQHByb3BlcnR5IHBhcnRpYWxcbiAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBwYXJ0aWFsID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIG1lc3NhZ2UgaXMgY3VycmVudGx5IHdhaXRpbmcgaW4gbGl2ZS1wcmV2aWV3LlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0aW5nUHJldmlld1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEB3YWl0aW5nUHJldmlldyA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBhdXRvLW1lc3NhZ2UgaXMgZW5hYmxlZC5cbiAgICAgICAgKiBAcHJvcGVydHkgYXV0b01lc3NhZ2VFbmFibGVkXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGF1dG9NZXNzYWdlRW5hYmxlZCA9IG5vXG4gICAgICBcbiAgICAgICAgQG9uTWVzc2FnZUZpbmlzaCA9IChzZW5kZXIpID0+XG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0IFwiZmluaXNoXCIsIHRoaXNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9iamVjdC5zZXR0aW5ncy5hdXRvRXJhc2Ugb3IgQG9iamVjdC5zZXR0aW5ncy5wYXJhZ3JhcGhTcGFjaW5nID4gMFxuICAgICAgICAgICAgICAgIEBtZXNzYWdlID0gXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIEBvbk1lc3NhZ2VXYWl0aW5nID0gKHNlbmRlcikgPT5cbiAgICAgICAgICAgIGlmICFAb2JqZWN0LnRleHRSZW5kZXJlci5pc0JhdGNoZWQoKSBvciAhQG9iamVjdC50ZXh0UmVuZGVyZXIuaXNCYXRjaEluUHJvZ3Jlc3MoKVxuICAgICAgICAgICAgICAgIEBvYmplY3QudGV4dFJlbmRlcmVyLndhaXRBdEVuZCA9ICFAcGFydGlhbFxuICAgICAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzLmVtaXQgXCJ3YWl0aW5nXCIsIHRoaXNcbiAgICAgICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBSZWZlcmVuY2UgdG8gZ2FtZSBzZXR0aW5ncy5cbiAgICAqIEBwcm9wZXJ0eSBzZXR0aW5nc1xuICAgICogQHR5cGUgT2JqZWN0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgQGFjY2Vzc29ycyBcInNldHRpbmdzXCIsIGdldDogLT4gR2FtZU1hbmFnZXIuc2V0dGluZ3NcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBZGRzIGV2ZW50LWhhbmRsZXJzXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEV2ZW50SGFuZGxlcnNcbiAgICAjIyMgXG4gICAgc2V0dXBFdmVudEhhbmRsZXJzOiAtPlxuICAgICAgICBAb2JqZWN0LmV2ZW50cy5vZmZCeU93bmVyKFwibWVzc2FnZUZpbmlzaFwiLCB0aGlzKVxuICAgICAgICBAb2JqZWN0LmV2ZW50cy5vZmZCeU93bmVyKFwibWVzc2FnZVdhaXRpbmdcIiwgdGhpcylcbiAgICAgICAgXG4gICAgICAgIEBvYmplY3QuZXZlbnRzLm9uIFwibWVzc2FnZUZpbmlzaFwiLCBncy5DYWxsQmFjayhcIm9uTWVzc2FnZUZpbmlzaFwiLCB0aGlzKSwgbnVsbCwgdGhpc1xuICAgICAgICBAb2JqZWN0LmV2ZW50cy5vbiBcIm1lc3NhZ2VXYWl0aW5nXCIsIGdzLkNhbGxCYWNrKFwib25NZXNzYWdlV2FpdGluZ1wiLCB0aGlzKSwgbnVsbCwgdGhpc1xuICAgICAgICAgICAgXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwicHJldmlld1dhaXRpbmdcIiwgdGhpcylcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJwcmV2aWV3UmVzdGFydFwiLCB0aGlzKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJwcmV2aWV3V2FpdGluZ1wiLCAoKHNlbmRlcikgPT5cbiAgICAgICAgICAgIEB3YWl0aW5nUHJldmlldyA9IHllc1xuICAgICAgICApLCBudWxsLCB0aGlzXG4gICAgICAgIFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJwcmV2aWV3UmVzdGFydFwiLCAoKHNlbmRlcikgPT5cbiAgICAgICAgICAgIEB3YWl0aW5nUHJldmlldyA9IG5vXG4gICAgICAgICksIG51bGwsIHRoaXNcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2V0dXAgdGhlIGNvbXBvbmVudC4gQWRkcyBldmVudCBoYW5kbGVycy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgIyMjXG4gICAgc2V0dXA6IC0+XG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyB0aGUgY29tcG9uZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgdG9EYXRhQnVuZGxlXG4gICAgIyMjICAgXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwicHJldmlld1dhaXRpbmdcIiwgdGhpcylcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJwcmV2aWV3UmVzdGFydFwiLCB0aGlzKVxuICAgICAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIE5vdCBpbXBsZW1lbnRlZCB5ZXQuXG4gICAgKlxuICAgICogQG1ldGhvZCB0b0RhdGFCdW5kbGVcbiAgICAjIyNcbiAgICB0b0RhdGFCdW5kbGU6IC0+XG4gICAgIyMjKlxuICAgICogTm90IGltcGxlbWVudGVkIHlldC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBidW5kbGUgLSBBIGRhdGEgYnVuZGxlLlxuICAgICMjIyAgICBcbiAgICByZXN0b3JlOiAoYnVuZGxlKSAtPlxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gdG8gc2hvdyBhIGdhbWUgbWVzc2FnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNob3dNZXNzYWdlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gc2VuZGVyIC0gVGhlIHNlbmRlciBvZiB0aGlzIGFjdGlvbi5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgbmVjZXNzYXJ5IHBhcmFtZXRlcnMuXG4gICAgIyMjXG4gICAgc2hvd01lc3NhZ2U6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RDb250ZXh0Q2hhbmdlKGxjc20ocGFyYW1zLm1lc3NhZ2UpKVxuICAgICAgICBcbiAgICAgICAgQHBhcnRpYWwgPSBwYXJhbXMucGFydGlhbFxuICAgICAgICBcbiAgICAgICAgQG1lc3NhZ2UgKz0gbGNzbShwYXJhbXMubWVzc2FnZSlcbiAgICAgICAgQGFkZE1lc3NhZ2UocGFyYW1zLm1lc3NhZ2UsIFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1twYXJhbXMuY2hhcmFjdGVySWRdLCBAb2JqZWN0Lm1lc3NhZ2VzLmxlbmd0aCA+IDAgYW5kIEBvYmplY3Quc2V0dGluZ3MucGFyYWdyYXBoU3BhY2luZyA+IDAsICFAcGFydGlhbClcbiAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QudGV4dFJlbmRlcmVyLmlzQmF0Y2hlZCgpXG4gICAgICAgICAgICBAb2JqZWN0LnRleHRSZW5kZXJlci53YWl0QXRFbmQgPSB5ZXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG9iamVjdC50ZXh0UmVuZGVyZXIud2FpdEF0RW5kID0gIUBwYXJ0aWFsXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGVwcmVjYXRlZC4gTm90IGxvbmdlciB1c2VkLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQml0bWFwXG4gICAgIyMjXG4gICAgdXBkYXRlQml0bWFwOiAtPlxuICAgICAgICBpZiAhQG9iamVjdC5iaXRtYXAgb3IgQG9iamVjdC5iaXRtYXAud2lkdGggIT0gQG9iamVjdC5kc3RSZWN0LndpZHRoIG9yIEBvYmplY3QuYml0bWFwLmhlaWdodCAhPSBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0XG4gICAgICAgICAgICBAb2JqZWN0LmJpdG1hcD8uZGlzcG9zZSgpXG4gICAgICAgICAgICBAb2JqZWN0LmJpdG1hcCA9IG5ldyBCaXRtYXAoQG9iamVjdC5kc3RSZWN0LndpZHRoLCBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0KVxuICAgICAgICAgICAgQG9iamVjdC5iaXRtYXAuZm9udCA9IEBvYmplY3QuZm9udFxuICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIGEgTlZMIGdhbWUgbWVzc2FnZSBvZiBhbiBhcnJheSBvZiBtZXNzYWdlLW9iamVjdHMuIFRoYXQgaXNcbiAgICAqIG5lY2Vzc2FyeSB0byByZXN0b3JlIGEgTlZMIGdhbWUgbWVzc2FnZSBmcm9tIGEgc2F2ZS1nYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZU1lc3NhZ2VzXG4gICAgKiBAcGFyYW0ge0FycmF5fSBtZXNzYWdlcyAtIEFuIGFycmF5IG9mIG1lc3NhZ2VzIHRvIHJlc3RvcmUuXG4gICAgIyMjXG4gICAgcmVzdG9yZU1lc3NhZ2VzOiAobWVzc2FnZXMpIC0+XG4gICAgICAgIEB1cGRhdGVCaXRtYXAoKVxuICAgICAgICBAY2xlYXIoKVxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5vcGFjaXR5ID0gMjU1XG4gICAgICAgIEBvYmplY3Quc3JjUmVjdCA9IG5ldyBSZWN0KDAsIDAsIEBvYmplY3QuZHN0UmVjdC53aWR0aCwgQG9iamVjdC5kc3RSZWN0LmhlaWdodClcbiAgICAgICAgXG4gICAgICAgIGZvciBtZXNzYWdlIGluIG1lc3NhZ2VzXG4gICAgICAgICAgICBAb2JqZWN0LmZvbnQuY29sb3IgPSBuZXcgQ29sb3IobWVzc2FnZS5jaGFyYWN0ZXI/LnRleHRDb2xvciB8fCBDb2xvci5XSElURSlcbiAgICAgICAgICAgIEBvYmplY3QudGV4dFJlbmRlcmVyLmRyYXdGb3JtYXR0ZWRUZXh0SW1tZWRpYXRlbHkoMCwgMCwgQG9iamVjdC5kc3RSZWN0LndpZHRoLCBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0LCBsY3NtKG1lc3NhZ2UudGV4dCA/IG1lc3NhZ2UpLCB5ZXMpXG5cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBhIG5ldyBtZXNzYWdlLlxuICAgICogXG4gICAgKiBAbWV0aG9kIGFkZE1lc3NhZ2VcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gY2hhcmFjdGVyIC0gRGF0YWJhc2UtUmVjb3JkIG9mIGEgY2hhcmFjdGVyLlxuICAgICogQHBhcmFtIHtib29sZWFufSBuZXdMaW5lIC0gSW5kaWNhdGVzIGlmIHRoZSBtZXNzYWdlIHNob3VsZCBtYWtlIGEgbGluZSBicmVhay5cbiAgICAjIyNcbiAgICBhZGRNZXNzYWdlOiAobWVzc2FnZSwgY2hhcmFjdGVyLCBuZXdMaW5lLCB3YWl0QXRFbmQpIC0+XG4gICAgICAgIEBvYmplY3QudGV4dFJlbmRlcmVyLnBhcnRpYWxNZXNzYWdlID0gbnVsbFxuICAgICAgICBAb2JqZWN0Lm9mZnNldCA9IHg6IDAsIHk6IDBcbiAgICAgICAgQG9iamVjdC52aXNpYmxlID0geWVzXG4gICAgICAgIFxuICAgICAgICBAb2JqZWN0Lm1lc3NhZ2VzLnB1c2goeyB0ZXh0OiBtZXNzYWdlLCBjaGFyYWN0ZXI6IGNoYXJhY3Rlcn0pXG4gICAgICAgIFxuICAgICAgICBAb2JqZWN0LnRleHRSZW5kZXJlci53YWl0QXRFbmQgPSB3YWl0QXRFbmRcbiAgICAgICAgaWYgbm90IEBvYmplY3Quc2V0dGluZ3MuYXV0b0VyYXNlXG4gICAgICAgICAgICBAb2JqZWN0LnRleHRSZW5kZXJlci5jdXJyZW50WSArPSBAb2JqZWN0LnNldHRpbmdzLnBhcmFncmFwaFNwYWNpbmdcbiAgICAgICAgaWYgbmV3TGluZVxuICAgICAgICAgICAgQG9iamVjdC50ZXh0UmVuZGVyZXIubmV3TGluZSgpXG4gICAgICAgIEB1cGRhdGVCaXRtYXAoKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNoYXJhY3Rlcj8gYW5kIEBvYmplY3Quc2V0dGluZ3MudXNlQ2hhcmFjdGVyQ29sb3JcbiAgICAgICAgICAgIEBvYmplY3QuZm9udC5jb2xvciA9IG5ldyBDb2xvcihjaGFyYWN0ZXI/LnRleHRDb2xvciB8fCBDb2xvci5XSElURSlcbiAgICAgICAgICAgIFxuICAgICAgICBAb2JqZWN0Lm9wYWNpdHkgPSAyNTVcbiAgICAgICAgQG9iamVjdC5zcmNSZWN0ID0gbmV3IFJlY3QoMCwgMCwgQG9iamVjdC5kc3RSZWN0LndpZHRoLCBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0KVxuICAgICBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIEBvYmplY3QudGV4dFJlbmRlcmVyLmRyYXdGb3JtYXR0ZWRUZXh0KDAsIDAsIEBvYmplY3QuZHN0UmVjdC53aWR0aCwgQG9iamVjdC5kc3RSZWN0LmhlaWdodCwgbWVzc2FnZSwgeWVzKVxuXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIHRoZSBnYW1lIG1lc3NhZ2UgYnkgZGVsZXRpbmcvY2xlYXJpbmcgYWxsIG1lc3NhZ2VzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAjIyNcbiAgICBjbGVhcjogLT4gXG4gICAgICAgIEBvYmplY3QudGV4dFJlbmRlcmVyLmNsZWFyKClcbiAgICAgICAgQG9iamVjdC5tZXNzYWdlcyA9IFtdXG4gICAgICAgIEBtZXNzYWdlID0gXCJcIlxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDbG9zZXMgdGhlIGdhbWUgbWVzc2FnZSBieSBtYWtpbmcgaXQgaW52aXNpYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xvc2VcbiAgICAjIyNcbiAgICBjbG9zZTogLT4gXG4gICAgICAgIEBvYmplY3QudmlzaWJsZSA9IG5vXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgZHVyYXRpb24gb2YgYW4gYXNzb2NpYXRlZCB2b2ljZSBvciAwIGlmIG5vIHZvaWNlIGlzIGFzc29jaWF0ZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCB2b2ljZUR1cmF0aW9uXG4gICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgIyMjXG4gICAgdm9pY2VEdXJhdGlvbjogLT5cbiAgICAgICAgZHVyYXRpb24gPSAwXG4gICAgICAgIGlmIEB2b2ljZT8gYW5kIChAc2V0dGluZ3MuYXV0b01lc3NhZ2Uud2FpdEZvclZvaWNlIG9yIEBzZXR0aW5ncy50aW1lTWVzc2FnZVRvVm9pY2UpXG4gICAgICAgICAgICBkdXJhdGlvbiA9IE1hdGgucm91bmQoKEB2b2ljZS5zb3VyY2UuYnVmZmVyLmR1cmF0aW9uICogKDEuMCAvIEB2b2ljZS5zb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlKSkgKiAxMDAwIC8gMTYuNilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZHVyYXRpb24gPSAwXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIEB0ZW1wU2V0dGluZ3Muc2tpcCB0aGVuIDEgZWxzZSBkdXJhdGlvblxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSBkdXJhdGlvbiBvZiByZW5kZXJpbmcgdGhlIGdhbWUtbWVzc2FnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1lc3NhZ2VEdXJhdGlvblxuICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICMjI1xuICAgIG1lc3NhZ2VEdXJhdGlvbjogLT4gXG4gICAgICAgIGR1cmF0aW9uID0gQG9iamVjdC50ZXh0UmVuZGVyZXIuY2FsY3VsYXRlRHVyYXRpb24oKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIEB0ZW1wU2V0dGluZ3Muc2tpcCB0aGVuIDEgZWxzZSBkdXJhdGlvblxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB0aW1lIGJldHdlZW4gdHdvIG1lc3NhZ2VzIGluIGF1dG8tcmVhZCBtb2RlLlxuICAgICpcbiAgICAqIEBtZXRob2QgYXV0b01lc3NhZ2VUaW1lXG4gICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSB0aW1lIGluIGZyYW1lcy5cbiAgICAjIyNcbiAgICBhdXRvTWVzc2FnZVRpbWU6IC0+IFxuICAgICAgICBpZiBAdGVtcFNldHRpbmdzLnNraXBcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1heChNYXRoLnJvdW5kKEBzZXR0aW5ncy5hdXRvTWVzc2FnZS50aW1lICogR3JhcGhpY3MuZnJhbWVSYXRlKSwgQHZvaWNlRHVyYXRpb24oKSAtIEBtZXNzYWdlRHVyYXRpb24oKSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSBjdXJyZW50IG1lc3NhZ2Ugc3BlZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBtZXNzYWdlU3BlZWRcbiAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIG1lc3NhZ2Ugc3BlZWQuXG4gICAgIyMjXG4gICAgbWVzc2FnZVNwZWVkOiAtPiBNYXRoLm1heCgxMSAtIE1hdGgucm91bmQoR2FtZU1hbmFnZXIuc2V0dGluZ3MubWVzc2FnZVNwZWVkICogMi41KSwgMClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDaGVja3MgaWYgYSBtb3VzZS1idXR0b24gb3Iga2V5IHdhcyBwcmVzc2VkIHRvIGNvbnRpbnVlIHdpdGggdGhlIG1lc3NhZ2UtcmVuZGVyaW5nLlxuICAgICpcbiAgICAqIEBtZXRob2QgYWN0aW9uVHJpZ2dlclxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gSWYgdHJ1ZSwgdGhlIGFuIGFjdGlvbi1idXR0b24gb3IgYWN0aW9uLWtleSBpcyBwcmVzc2VkLlxuICAgICMjI1xuICAgIGFjdGlvblRyaWdnZXI6IC0+IChncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQuaW5wdXQgYW5kIEBvYmplY3QudmlzaWJsZSBhbmQgQG9iamVjdC5kc3RSZWN0LmNvbnRhaW5zKElucHV0Lk1vdXNlLnggLSBAb2JqZWN0Lm9yaWdpbi54LCBJbnB1dC5Nb3VzZS55IC0gQG9iamVjdC5vcmlnaW4ueSkgYW5kIElucHV0Lk1vdXNlLmJ1dHRvbnNbSW5wdXQuTW91c2UuTEVGVF0gPT0gMikgb3IgSW5wdXQudHJpZ2dlcihJbnB1dC5DKVxuICAgIFxuICAgIGZpbmlzaDogLT5cbiAgICAgICAgI0BvYmplY3QuY2hhcmFjdGVyID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgQG9iamVjdC52b2ljZT8gYW5kIEdhbWVNYW5hZ2VyLnNldHRpbmdzLnNraXBWb2ljZU9uQWN0aW9uXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIuc3RvcFNvdW5kKEBvYmplY3Qudm9pY2UubmFtZSlcbiAgICBcbiAgICBlcmFzZTogLT5cbiAgICAgICAgZmFkaW5nID0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLm1lc3NhZ2VGYWRpbmdcbiAgICAgICAgZHVyYXRpb24gPSBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCB0aGVuIDAgZWxzZSBmYWRpbmcuZHVyYXRpb25cbiAgICAgICAgXG4gICAgICAgIEBvYmplY3QuYW5pbWF0b3IuZGlzYXBwZWFyKGZhZGluZy5hbmltYXRpb24sIGZhZGluZy5lYXNpbmcsIGR1cmF0aW9uLCA9PlxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmN1cnJlbnRDaGFyYWN0ZXIgPSB7IG5hbWU6IFwiXCIgfVxuICAgICAgICAgICAgQGNsZWFyKClcbiAgICAgICAgICAgIEBvYmplY3QudmlzaWJsZSA9IG5vXG4gICAgICAgIClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRklYTUU6IERlcHJlY2F0ZWQ/IEl0IGlzIGFsc28gYSByZS1kZWZpbml0aW9uIG9mIGdzLkNvbXBvbmVudF9WaXN1YWwudXBkYXRlT3JpZ2luLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlT3JpZ2luXG4gICAgIyMjXG4gICAgdXBkYXRlT3JpZ2luOiAtPlxuICAgICAgICBveCA9IDBcbiAgICAgICAgb3kgPSAwXG4gICAgICAgIGlmIEBvYmplY3QucGFyZW50PyBhbmQgQG9iamVjdC5wYXJlbnQuZHN0UmVjdD9cbiAgICAgICAgICAgIHAgPSBAb2JqZWN0LnBhcmVudFxuICAgICAgICAgICAgd2hpbGUgcD8gYW5kIHAuZHN0UmVjdD9cbiAgICAgICAgICAgICAgICBveCArPSBwLmRzdFJlY3QueFxuICAgICAgICAgICAgICAgIG95ICs9IHAuZHN0UmVjdC55XG4gICAgICAgICAgICAgICAgcCA9IHAucGFyZW50XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAb2JqZWN0Lm9yaWdpbi54ID0gb3hcbiAgICAgICAgQG9iamVjdC5vcmlnaW4ueSA9IG95XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIG9iamVjdC4gXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVPYmplY3RcbiAgICAqIEBwcml2YXRlXG4gICAgIyMjXG4gICAgdXBkYXRlT2JqZWN0OiAtPlxuICAgICAgICBAdXBkYXRlT3JpZ2luKClcbiAgICAgICAgXG4gICAgICAgIGlmIEB0ZW1wU2V0dGluZ3Muc2tpcCBhbmQgbm90IEB3YWl0aW5nUHJldmlld1xuICAgICAgICAgICAgQG9iamVjdC50ZXh0UmVuZGVyZXIuaXNXYWl0aW5nID0gbm9cbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBtZXNzYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlTWVzc2FnZVxuICAgICogQHByaXZhdGVcbiAgICAjIyNcbiAgICB1cGRhdGVNZXNzYWdlOiAtPlxuICAgICAgICBAY2FyZXRQb3NpdGlvbiA9IEBvYmplY3QudGV4dFJlbmRlcmVyLmNhcmV0UG9zaXRpb25cbiAgICAgICAgXG4gICAgICAgIGlmIEB0ZW1wU2V0dGluZ3Muc2tpcCBhbmQgKEBzZXR0aW5ncy5hbGxvd1NraXBVbnJlYWRNZXNzYWdlcyBvciBHYW1lTWFuYWdlci5nbG9iYWxEYXRhLm1lc3NhZ2VzW0BtZXNzYWdlXT8ucmVhZClcbiAgICAgICAgICAgIEBvYmplY3QudGV4dFJlbmRlcmVyLmRyYXdJbW1lZGlhdGVseSA9IHllc1xuICAgICAgICAgICAgQG9iamVjdC50ZXh0UmVuZGVyZXIud2FpdEF0RW5kID0gQHdhaXRpbmdQcmV2aWV3XG4gICAgICAgICAgICBAb2JqZWN0LnRleHRSZW5kZXJlci53YWl0QXRFbmRUaW1lID0gMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjQG9iamVjdC50ZXh0UmVuZGVyZXIuZHJhd0ltbWVkaWF0ZWx5ID0gbm9cbiAgICAgICAgICAgIEB1cGRhdGVTcGVlZCgpXG4gICAgICAgICAgICBAdXBkYXRlQXV0b01lc3NhZ2UoKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgc3BlZWQgb2YgdGhlIG1lc3NhZ2UuIFRoYXQgZGVwZW5kcyBvbiBnYW1lLXNldHRpbmdzIGlmIGEgbWVzc2FnZVxuICAgICogaXMgdGltZWQgdG8gaXRzIHZvaWNlIG9yIG5vdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVNwZWVkXG4gICAgKiBAcHJpdmF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZVNwZWVkOiAtPlxuICAgICAgICB2b2ljZUR1cmF0aW9uID0gQHZvaWNlRHVyYXRpb24oKVxuICAgICAgICBpZiB2b2ljZUR1cmF0aW9uID4gMCBhbmQgQHNldHRpbmdzLnRpbWVNZXNzYWdlVG9Wb2ljZVxuICAgICAgICAgICAgQG9iamVjdC50ZXh0UmVuZGVyZXIuc3BlZWQgPSB2b2ljZUR1cmF0aW9uIC8gQG1lc3NhZ2UubGVuZ3RoXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBvYmplY3QudGV4dFJlbmRlcmVyLnNwZWVkID0gQG1lc3NhZ2VTcGVlZCgpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGUgYXV0by1yZWFkIG1vZGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVBdXRvTWVzc2FnZVxuICAgICogQHByaXZhdGVcbiAgICAjIyNcbiAgICB1cGRhdGVBdXRvTWVzc2FnZTogLT5cbiAgICAgICAgaWYgQHNldHRpbmdzLmF1dG9NZXNzYWdlLnN0b3BPbkFjdGlvbiBhbmQgQGFjdGlvblRyaWdnZXIoKVxuICAgICAgICAgICAgQHNldHRpbmdzLmF1dG9NZXNzYWdlLmVuYWJsZWQgPSBub1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBzZXR0aW5ncy5hdXRvTWVzc2FnZS5lbmFibGVkIGFuZCBub3QgQHBhcnRpYWxcbiAgICAgICAgICAgIGlmIEBvYmplY3QudGV4dFJlbmRlcmVyLndhaXRBdEVuZFxuICAgICAgICAgICAgICAgIEBvYmplY3QudGV4dFJlbmRlcmVyLmlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICBAb2JqZWN0LnRleHRSZW5kZXJlci53YWl0QXRFbmRUaW1lID0gQGF1dG9NZXNzYWdlVGltZSgpXG4gICAgICAgICAgICBAb2JqZWN0LnRleHRSZW5kZXJlci53YWl0QXRFbmQgPSBub1xuICAgICAgICBlbHNlIGlmIEBhdXRvTWVzc2FnZUVuYWJsZWQgIT0gQHNldHRpbmdzLmF1dG9NZXNzYWdlLmVuYWJsZWRcbiAgICAgICAgICAgIEBvYmplY3QudGV4dFJlbmRlcmVyLndhaXRBdEVuZCA9IHllc1xuICAgICAgICAgICAgQG9iamVjdC50ZXh0UmVuZGVyZXIud2FpdEF0RW5kVGltZSA9IDBcbiAgICAgICAgICAgIFxuICAgICAgICBAYXV0b01lc3NhZ2VFbmFibGVkID0gQHNldHRpbmdzLmF1dG9NZXNzYWdlLmVuYWJsZWRcbiAgICAgICAgICAgIFxuICAgICMjI1xuICAgICogVXBkYXRlcyB0aGUgZ2FtZSBtZXNzYWdlIGJlaGF2aW9yXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyNcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIEBvYmplY3QubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgQHVwZGF0ZU9iamVjdCgpXG4gICAgICAgIEB1cGRhdGVNZXNzYWdlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBjaGFyYWN0ZXIgIT0gQG9iamVjdC5jaGFyYWN0ZXIgICBcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KFwidGFsa2luZ0VuZGVkXCIsIHRoaXMsIGNoYXJhY3RlcjogQGNoYXJhY3RlcilcbiAgICAgICAgICAgIEBjaGFyYWN0ZXIgPSBAb2JqZWN0LmNoYXJhY3RlclxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QudGV4dFJlbmRlcmVyLmlzV2FpdGluZyAhPSBAaXNXYWl0aW5nIG9yIEBvYmplY3QudGV4dFJlbmRlcmVyLmlzUnVubmluZyAhPSBAaXNSdW5uaW5nIG9yIChAdm9pY2U/LnBsYXlpbmcgJiYgKCFAb2JqZWN0LmNoYXJhY3Rlcj8udGltZVRhbGtpbmdUb1ZvaWNlVm9sdW1lIG9yIEB2b2ljZS5hdmVyYWdlVm9sdW1lID4gQG9iamVjdC5jaGFyYWN0ZXIudGFsa2luZ1ZvbHVtZSkpICE9IEBpc1ZvaWNlUGxheWluZ1xuICAgICAgICAgICAgQGlzV2FpdGluZyA9IEBvYmplY3QudGV4dFJlbmRlcmVyLmlzV2FpdGluZ1xuICAgICAgICAgICAgQGlzUnVubmluZyA9IEBvYmplY3QudGV4dFJlbmRlcmVyLmlzUnVubmluZ1xuICAgICAgICAgICAgQGlzVm9pY2VQbGF5aW5nID0gKEB2b2ljZT8ucGxheWluZyAmJiAoIUBvYmplY3QuY2hhcmFjdGVyPy50aW1lVGFsa2luZ1RvVm9pY2VWb2x1bWUgb3IgQHZvaWNlLmF2ZXJhZ2VWb2x1bWUgPiBAb2JqZWN0LmNoYXJhY3Rlci50YWxraW5nVm9sdW1lKSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbm90IEB0ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgICAgIGlmIEB2b2ljZT8ucGxheWluZ1xuICAgICAgICAgICAgICAgICAgICBpZiBub3QgQGlzVm9pY2VQbGF5aW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcInRhbGtpbmdFbmRlZFwiLCB0aGlzLCBjaGFyYWN0ZXI6IEBvYmplY3QuY2hhcmFjdGVyKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcInRhbGtpbmdTdGFydGVkXCIsIHRoaXMsIGNoYXJhY3RlcjogQG9iamVjdC5jaGFyYWN0ZXIpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBAaXNXYWl0aW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcInRhbGtpbmdFbmRlZFwiLCB0aGlzLCBjaGFyYWN0ZXI6IEBvYmplY3QuY2hhcmFjdGVyKVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBpc1J1bm5pbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KFwidGFsa2luZ1N0YXJ0ZWRcIiwgdGhpcywgY2hhcmFjdGVyOiBAb2JqZWN0LmNoYXJhY3RlcilcbiAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QubGF5b3V0UmVjdD8gYW5kIEBvYmplY3QucGFyZW50Py5kc3RSZWN0P1xuICAgICAgICAgICAgaWYgQG9iamVjdC5sYXlvdXRSZWN0LnggdGhlbiBAb2JqZWN0LmRzdFJlY3QueCA9IEBvYmplY3QubGF5b3V0UmVjdC54KEBvYmplY3QucGFyZW50LmRzdFJlY3Qud2lkdGgpXG4gICAgICAgICAgICBpZiBAb2JqZWN0LmxheW91dFJlY3QueSB0aGVuIEBvYmplY3QuZHN0UmVjdC55ID0gQG9iamVjdC5sYXlvdXRSZWN0LnkoQG9iamVjdC5wYXJlbnQuZHN0UmVjdC5oZWlnaHQpXG4gICAgICAgICAgICBpZiBAb2JqZWN0LmxheW91dFJlY3Qud2lkdGggdGhlbiBAb2JqZWN0LmRzdFJlY3Qud2lkdGggPSBAb2JqZWN0LmxheW91dFJlY3Qud2lkdGgoQG9iamVjdC5wYXJlbnQuZHN0UmVjdC53aWR0aClcbiAgICAgICAgICAgIGlmIEBvYmplY3QubGF5b3V0UmVjdC5oZWlnaHQgdGhlbiBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gQG9iamVjdC5sYXlvdXRSZWN0LmhlaWdodChAb2JqZWN0LnBhcmVudC5kc3RSZWN0LmhlaWdodClcbnZuLkNvbXBvbmVudF9NZXNzYWdlQmVoYXZpb3IgPSBDb21wb25lbnRfTWVzc2FnZUJlaGF2aW9yIl19
//# sourceURL=Component_MessageBehavior_139.js