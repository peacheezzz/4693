var Component_CommandInterpreter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_CommandInterpreter = (function(superClass) {
  extend(Component_CommandInterpreter, superClass);

  Component_CommandInterpreter.objectCodecBlackList = ["object", "command", "onMessageADVWaiting", "onMessageADVDisappear", "onMessageADVFinish"];


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  *
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_CommandInterpreter.prototype.onDataBundleRestore = function(data, context) {};


  /**
  * A component which allows a game object to process commands like for
  * scene-objects. For each command a command-function exists. To add
  * own custom commands to the interpreter just create a sub-class and
  * override the gs.Component_CommandInterpreter.assignCommand method
  * and assign the command-function for your custom-command.
  *
  * @module gs
  * @class Component_CommandInterpreter
  * @extends gs.Component
  * @memberof gs
   */

  function Component_CommandInterpreter() {
    Component_CommandInterpreter.__super__.constructor.call(this);

    /**
    * Wait-Counter in frames. If greater than 0, the interpreter will for that amount of frames before continue.
    * @property waitCounter
    * @type number
     */
    this.waitCounter = 0;

    /**
    * Index to the next command to execute.
    * @property pointer
    * @type number
     */
    this.pointer = 0;

    /**
    * Stores states of conditions.
    * @property conditions
    * @type number
    * @protected
     */
    this.conditions = [];

    /**
    * Stores states of loops.
    * @property loops
    * @type number
    * @protected
     */
    this.loops = [];
    this.timers = [];

    /**
    * Indicates if the interpreter is currently running.
    * @property isRunning
    * @type boolean
    * @readOnly
     */
    this.isRunning = false;

    /**
    * Indicates if the interpreter is currently waiting.
    * @property isWaiting
    * @type boolean
     */
    this.isWaiting = false;

    /**
    * Indicates if the interpreter is currently waiting until a message processed by another context like a Common Event
    * is finished.
    * FIXME: Conflict handling can be removed maybe.
    * @property isWaitingForMessage
    * @type boolean
     */
    this.isWaitingForMessage = false;

    /**
    * Stores internal preview-info if the game runs currently in Live-Preview.
    * <ul>
    * <li>previewInfo.timeout - Timer ID if a timeout for live-preview was configured to exit the game loop after a certain amount of time.</li>
    * <li>previewInfo.waiting - Indicates if Live-Preview is currently waiting for the next user-action. (Selecting another command, etc.)</li>
    * <li>previewInfo.executedCommands - Counts the amount of executed commands since the last
    * interpreter-pause(waiting, etc.). If its more than 500, the interpreter will automatically pause for 1 frame to
    * avoid that Live-Preview freezes the Editor in case of endless loops.</li>
    * </ul>
    * @property previewInfo
    * @type boolean
    * @protected
     */
    this.previewInfo = new gs.LivePreviewInfo();

    /**
    * Stores Live-Preview related info passed from the VN Maker editor like the command-index the player clicked on, etc.
    * @property previewData
    * @type Object
    * @protected
     */
    this.previewData = null;

    /**
    * Indicates if the interpreter automatically repeats execution after the last command was executed.
    * @property repeat
    * @type boolean
     */
    this.repeat = false;

    /**
    * The execution context of the interpreter.
    * @property context
    * @type gs.InterpreterContext
    * @protected
     */
    this.context = new gs.InterpreterContext(0, null);

    /**
    * Sub-Interpreter from a Common Event Call. The interpreter will wait until the sub-interpreter is done and set back to
    * <b>null</b>.
    * @property subInterpreter
    * @type gs.Component_CommandInterpreter
    * @protected
     */
    this.subInterpreter = null;

    /**
    * Current indent-level of execution
    * @property indent
    * @type number
    * @protected
     */
    this.indent = 0;

    /**
    * Stores information about for what the interpreter is currently waiting for like for a ADV message, etc. to
    * restore probably when loaded from a save-game.
    * @property waitingFor
    * @type Object
    * @protected
     */
    this.waitingFor = {};

    /**
    * Stores interpreter related settings like how to handle messages, etc.
    * @property settings
    * @type Object
    * @protected
     */
    this.settings = {
      message: {
        byId: {},
        autoErase: true,
        waitAtEnd: true,
        backlog: true
      },
      screen: {
        pan: new gs.Point(0, 0)
      }
    };

    /**
    * Mapping table to quickly get the anchor point for the an inserted anchor-point constant such as
    * Top-Left(0), Top(1), Top-Right(2) and so on.
    * @property graphicAnchorPointsByConstant
    * @type gs.Point[]
    * @protected
     */
    this.graphicAnchorPointsByConstant = [new gs.Point(0.0, 0.0), new gs.Point(0.5, 0.0), new gs.Point(1.0, 0.0), new gs.Point(1.0, 0.5), new gs.Point(1.0, 1.0), new gs.Point(0.5, 1.0), new gs.Point(0.0, 1.0), new gs.Point(0.0, 0.5), new gs.Point(0.5, 0.5)];
  }

  Component_CommandInterpreter.prototype.onHotspotClick = function(e, data) {
    return this.executeAction(data.params.actions.onClick, false, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotEnter = function(e, data) {
    return this.executeAction(data.params.actions.onEnter, true, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotLeave = function(e, data) {
    return this.executeAction(data.params.actions.onLeave, false, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotDragStart = function(e, data) {
    return this.executeAction(data.params.actions.onDrag, true, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotDrag = function(e, data) {
    return this.executeAction(data.params.actions.onDrag, true, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotDragEnd = function(e, data) {
    return this.executeAction(data.params.actions.onDrag, false, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotDrop = function(e, data) {
    this.executeAction(data.params.actions.onDrop, false, data.bindValue);
    return gs.GlobalEventManager.emit("hotspotDrop", e.sender);
  };

  Component_CommandInterpreter.prototype.onHotspotDropReceived = function(e, data) {
    return this.executeAction(data.params.actions.onDropReceive, true, data.bindValue);
  };

  Component_CommandInterpreter.prototype.onHotspotStateChanged = function(e, params) {
    if (e.sender.behavior.selected) {
      return this.executeAction(params.actions.onSelect, true);
    } else {
      return this.executeAction(params.actions.onDeselect, false);
    }
  };


  /**
  * Called when a ADV message finished rendering and is now waiting
  * for the user/autom-message timer to proceed.
  *
  * @method onMessageADVWaiting
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onMessageADVWaiting = function(e) {
    var messageObject;
    messageObject = e.sender.object;
    if (!this.messageSettings().waitAtEnd) {
      if (e.data.params.waitForCompletion) {
        this.isWaiting = false;
      }
      messageObject.textRenderer.isWaiting = false;
      messageObject.textRenderer.isRunning = false;
    }
    messageObject.events.off("waiting", e.handler);
    if (this.messageSettings().backlog && (messageObject.settings.autoErase || messageObject.settings.paragraphSpacing > 0)) {
      return GameManager.backlog.push({
        character: messageObject.character,
        message: messageObject.textRenderer.replacePlaceholderTokens(messageObject.behavior.message),
        choices: []
      });
    }
  };


  /**
  * Called when an ADV message finished fade-out.
  *
  * @method onMessageADVDisappear
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onMessageADVDisappear = function(messageObject, waitForCompletion) {
    SceneManager.scene.currentCharacter = {
      name: ""
    };
    messageObject.behavior.clear();
    messageObject.visible = false;
    if (messageObject.waitForCompletion) {
      this.isWaiting = false;
    }
    return this.waitingFor.messageADV = null;
  };


  /**
  * Called when an ADV message finished clear.
  *
  * @method onMessageADVClear
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onMessageADVClear = function(messageObject, waitForCompletion) {
    var ref;
    messageObject = this.targetMessage();
    if (this.messageSettings().backlog && ((ref = messageObject.behavior.message) != null ? ref.length : void 0)) {
      GameManager.backlog.push({
        character: messageObject.character,
        message: messageObject.behavior.message,
        choices: []
      });
    }
    return this.onMessageADVDisappear(messageObject, waitForCompletion);
  };


  /**
  * Called when a hotspot/image-map sends a "jumpTo" event to let the
  * interpreter jump to the position defined in the event object.
  *
  * @method onJumpTo
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onJumpTo = function(e) {
    this.jumpToLabel(e.label);
    return this.isWaiting = false;
  };


  /**
  * Called when a hotspot/image-map sends a "callCommonEvent" event to let the
  * interpreter call the common event defined in the event object.
  *
  * @method onJumpTo
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onCallCommonEvent = function(e) {
    var event, eventId, ref;
    eventId = e.commonEventId;
    event = RecordManager.commonEvents[eventId];
    if (!event) {
      event = RecordManager.commonEvents.first((function(_this) {
        return function(x) {
          return x.name === eventId;
        };
      })(this));
      if (event) {
        eventId = event.index;
      }
    }
    this.callCommonEvent(eventId, e.params || [], !e.finish);
    return this.isWaiting = (ref = e.waiting) != null ? ref : false;
  };


  /**
  * Called when a ADV message finishes.
  *
  * @method onMessageADVFinish
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onMessageADVFinish = function(e) {
    var commands, duration, fading, messageObject, pointer;
    messageObject = e.sender.object;
    if (!this.messageSettings().waitAtEnd) {
      return;
    }
    GameManager.globalData.messages[lcsm(e.data.params.message)] = {
      read: true
    };
    GameManager.saveGlobalData();
    if (e.data.params.waitForCompletion) {
      this.isWaiting = false;
    }
    this.waitingFor.messageADV = null;
    pointer = this.pointer;
    commands = this.object.commands;
    messageObject.events.off("finish", e.handler);
    if ((messageObject.voice != null) && GameManager.settings.skipVoiceOnAction) {
      AudioManager.stopSound(messageObject.voice.name);
    }
    if (!this.isMessageCommand(pointer, commands) && this.messageSettings().autoErase) {
      this.isWaiting = true;
      this.waitingFor.messageADV = e.data.params;
      fading = GameManager.tempSettings.messageFading;
      duration = GameManager.tempSettings.skip ? 0 : fading.duration;
      messageObject.waitForCompletion = e.data.params.waitForCompletion;
      return messageObject.animator.disappear(fading.animation, fading.easing, duration, gs.CallBack("onMessageADVDisappear", this, e.data.params.waitForCompletion));
    }
  };


  /**
  * Called when a common event finished execution. In most cases, the interpreter
  * will stop waiting and continue processing after this. But h
  *
  * @method onCommonEventFinish
  * @return {Object} Event Object containing additional data.
  * @protected
   */

  Component_CommandInterpreter.prototype.onCommonEventFinish = function(e) {
    var ref;
    SceneManager.scene.commonEventContainer.removeObject(e.sender.object);
    e.sender.object.events.off("finish");
    this.subInterpreter = null;
    return this.isWaiting = (ref = e.data.waiting) != null ? ref : false;
  };


  /**
  * Called when a scene call finished execution.
  *
  * @method onCallSceneFinish
  * @param {Object} sender - The sender of this event.
  * @protected
   */

  Component_CommandInterpreter.prototype.onCallSceneFinish = function(sender) {
    this.isWaiting = false;
    return this.subInterpreter = null;
  };


  /**
  * Serializes the interpreter into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Component_CommandInterpreter.prototype.toDataBundle = function() {
    if (this.isInputDataCommand(Math.max(this.pointer - 1, 0), this.object.commands)) {
      return {
        pointer: Math.max(this.pointer - 1, 0),
        choice: this.choice,
        conditions: this.conditions,
        loops: this.loops,
        labels: this.labels,
        isWaiting: false,
        isRunning: this.isRunning,
        waitCounter: this.waitCounter,
        waitingFor: this.waitingFor,
        indent: this.indent,
        settings: this.settings
      };
    } else {
      return {
        pointer: this.pointer,
        choice: this.choice,
        conditions: this.conditions,
        loops: this.loops,
        labels: this.labels,
        isWaiting: this.isWaiting,
        isRunning: this.isRunning,
        waitCounter: this.waitCounter,
        waitingFor: this.waitingFor,
        indent: this.indent,
        settings: this.settings
      };
    }
  };


  /**
   * Previews the current scene at the specified pointer. This method is called from the
   * VN Maker Scene-Editor if live-preview is enabled and the user clicked on a command.
   *
   * @method preview
   */

  Component_CommandInterpreter.prototype.preview = function() {
    var ex, scene;
    try {
      if (!$PARAMS.preview || !$PARAMS.preview.scene) {
        return;
      }
      AudioManager.stopAllSounds();
      AudioManager.stopAllMusic();
      AudioManager.stopAllVoices();
      SceneManager.scene.choices = [];
      GameManager.setupCursor();
      this.previewData = $PARAMS.preview;
      gs.GlobalEventManager.emit("previewRestart");
      if (this.previewInfo.timeout) {
        clearTimeout(this.previewInfo.timeout);
      }
      if (Graphics.stopped) {
        Graphics.stopped = false;
        Graphics.onEachFrame(gs.Main.frameCallback);
      }
      scene = new vn.Object_Scene();
      scene.sceneData.uid = this.previewData.scene.uid;
      return SceneManager.switchTo(scene);
    } catch (error) {
      ex = error;
      return console.warn(ex);
    }
  };


  /**
   * Sets up the interpreter.
   *
   * @method setup
   */

  Component_CommandInterpreter.prototype.setup = function() {
    Component_CommandInterpreter.__super__.setup.apply(this, arguments);
    this.previewData = $PARAMS.preview;
    if (this.previewData) {
      return gs.GlobalEventManager.on("mouseDown", ((function(_this) {
        return function() {
          if (_this.previewInfo.waiting) {
            if (_this.previewInfo.timeout) {
              clearTimeout(_this.previewInfo.timeout);
            }
            _this.previewInfo.waiting = false;
            GameManager.tempSettings.skip = false;
            _this.previewData = null;
            return gs.GlobalEventManager.emit("previewRestart");
          }
        };
      })(this)), null, this.object);
    }
  };


  /**
   * Disposes the interpreter.
   *
   * @method dispose
   */

  Component_CommandInterpreter.prototype.dispose = function() {
    if (this.previewData) {
      gs.GlobalEventManager.offByOwner("mouseDown", this.object);
    }
    return Component_CommandInterpreter.__super__.dispose.apply(this, arguments);
  };

  Component_CommandInterpreter.prototype.isInstantSkip = function() {
    return GameManager.tempSettings.skip && GameManager.tempSettings.skipTime === 0;
  };


  /**
  * Restores the interpreter from a data-bundle
  *
  * @method restore
  * @param {Object} bundle- The data-bundle.
   */

  Component_CommandInterpreter.prototype.restore = function() {};


  /**
  * Gets the default game message for novel-mode.
  *
  * @method messageObjectNVL
  * @return {ui.Object_Message} The NVL game message object.
   */

  Component_CommandInterpreter.prototype.messageObjectNVL = function() {
    return gs.ObjectManager.current.objectById("nvlGameMessage_message");
  };


  /**
  * Gets the default game message for adventure-mode.
  *
  * @method messageObjectADV
  * @return {ui.Object_Message} The ADV game message object.
   */

  Component_CommandInterpreter.prototype.messageObjectADV = function() {
    return gs.ObjectManager.current.objectById("gameMessage_message");
  };


  /**
  * Starts the interpreter
  *
  * @method start
   */

  Component_CommandInterpreter.prototype.start = function() {
    this.conditions = [];
    this.loops = [];
    this.indent = 0;
    this.pointer = 0;
    this.isRunning = true;
    this.isWaiting = false;
    this.subInterpreter = null;
    return this.waitCounter = 0;
  };


  /**
  * Stops the interpreter
  *
  * @method stop
   */

  Component_CommandInterpreter.prototype.stop = function() {
    return this.isRunning = false;
  };


  /**
  * Resumes the interpreter
  *
  * @method resume
   */

  Component_CommandInterpreter.prototype.resume = function() {
    return this.isRunning = true;
  };


  /**
  * Updates the interpreter and executes all commands until the next wait is
  * triggered by a command. So in the case of an endless-loop the method will
  * never return.
  *
  * @method update
   */

  Component_CommandInterpreter.prototype.update = function() {
    if (this.subInterpreter != null) {
      this.subInterpreter.update();
      return;
    }
    GameManager.variableStore.setupTempVariables(this.context);
    if (((this.object.commands == null) || this.pointer >= this.object.commands.length) && !this.isWaiting) {
      if (this.repeat) {
        this.start();
      } else if (this.isRunning) {
        this.isRunning = false;
        if (this.onFinish != null) {
          this.onFinish(this);
        }
        return;
      }
    }
    if (!this.isRunning) {
      return;
    }
    if (!this.object.commands.optimized) {
      DataOptimizer.optimizeEventCommands(this.object.commands);
    }
    if (this.waitCounter > 0) {
      this.waitCounter--;
      this.isWaiting = this.waitCounter > 0;
      return;
    }
    if (this.isWaitingForMessage) {
      this.isWaiting = true;
      if (!this.isProcessingMessageInOtherContext()) {
        this.isWaiting = false;
        this.isWaitingForMessage = false;
      } else {
        return;
      }
    }
    if (GameManager.inLivePreview) {
      while (!(this.isWaiting || this.previewInfo.waiting) && this.pointer < this.object.commands.length && this.isRunning) {
        this.executeCommand(this.pointer);
        this.previewInfo.executedCommands++;
        if (this.previewInfo.executedCommands > 500) {
          this.previewInfo.executedCommands = 0;
          this.isWaiting = true;
          this.waitCounter = 1;
        }
      }
    } else {
      while (!(this.isWaiting || this.previewInfo.waiting) && this.pointer < this.object.commands.length && this.isRunning) {
        this.executeCommand(this.pointer);
      }
    }
    if (this.pointer >= this.object.commands.length && !this.isWaiting) {
      if (this.repeat) {
        return this.start();
      } else if (this.isRunning) {
        this.isRunning = false;
        if (this.onFinish != null) {
          return this.onFinish(this);
        }
      }
    }
  };


  /**
  * Assigns the correct command-function to the specified command-object if
  * necessary.
  *
  * @method assignCommand
   */

  Component_CommandInterpreter.prototype.assignCommand = function(command) {
    switch (command.id) {
      case "gs.Idle":
        return command.execute = this.commandIdle;
      case "gs.StartTimer":
        return command.execute = this.commandStartTimer;
      case "gs.PauseTimer":
        return command.execute = this.commandPauseTimer;
      case "gs.ResumeTimer":
        return command.execute = this.commandResumeTimer;
      case "gs.StopTimer":
        return command.execute = this.commandStopTimer;
      case "gs.WaitCommand":
        return command.execute = this.commandWait;
      case "gs.LoopCommand":
        return command.execute = this.commandLoop;
      case "gs.LoopForInList":
        return command.execute = this.commandLoopForInList;
      case "gs.BreakLoopCommand":
        return command.execute = this.commandBreakLoop;
      case "gs.Comment":
        return command.execute = function() {
          return 0;
        };
      case "gs.EmptyCommand":
        return command.execute = function() {
          return 0;
        };
      case "gs.ListAdd":
        return command.execute = this.commandListAdd;
      case "gs.ListPop":
        return command.execute = this.commandListPop;
      case "gs.ListShift":
        return command.execute = this.commandListShift;
      case "gs.ListRemoveAt":
        return command.execute = this.commandListRemoveAt;
      case "gs.ListInsertAt":
        return command.execute = this.commandListInsertAt;
      case "gs.ListValueAt":
        return command.execute = this.commandListValueAt;
      case "gs.ListClear":
        return command.execute = this.commandListClear;
      case "gs.ListShuffle":
        return command.execute = this.commandListShuffle;
      case "gs.ListSort":
        return command.execute = this.commandListSort;
      case "gs.ListIndexOf":
        return command.execute = this.commandListIndexOf;
      case "gs.ListSet":
        return command.execute = this.commandListSet;
      case "gs.ListCopy":
        return command.execute = this.commandListCopy;
      case "gs.ListLength":
        return command.execute = this.commandListLength;
      case "gs.ListJoin":
        return command.execute = this.commandListJoin;
      case "gs.ListFromText":
        return command.execute = this.commandListFromText;
      case "gs.ResetVariables":
        return command.execute = this.commandResetVariables;
      case "gs.ChangeVariableDomain":
        return command.execute = this.commandChangeVariableDomain;
      case "gs.ChangeNumberVariables":
        return command.execute = this.commandChangeNumberVariables;
      case "gs.ChangeDecimalVariables":
        return command.execute = this.commandChangeDecimalVariables;
      case "gs.ChangeBooleanVariables":
        return command.execute = this.commandChangeBooleanVariables;
      case "gs.ChangeStringVariables":
        return command.execute = this.commandChangeStringVariables;
      case "gs.CheckSwitch":
        return command.execute = this.commandCheckSwitch;
      case "gs.CheckNumberVariable":
        return command.execute = this.commandCheckNumberVariable;
      case "gs.CheckTextVariable":
        return command.execute = this.commandCheckTextVariable;
      case "gs.Condition":
        return command.execute = this.commandCondition;
      case "gs.ConditionElse":
        return command.execute = this.commandConditionElse;
      case "gs.ConditionElseIf":
        return command.execute = this.commandConditionElseIf;
      case "gs.Label":
        return command.execute = this.commandLabel;
      case "gs.JumpToLabel":
        return command.execute = this.commandJumpToLabel;
      case "gs.SetMessageArea":
        return command.execute = this.commandSetMessageArea;
      case "gs.ShowMessage":
        return command.execute = this.commandShowMessage;
      case "gs.ShowPartialMessage":
        return command.execute = this.commandShowPartialMessage;
      case "gs.MessageFading":
        return command.execute = this.commandMessageFading;
      case "gs.MessageSettings":
        return command.execute = this.commandMessageSettings;
      case "gs.CreateMessageArea":
        return command.execute = this.commandCreateMessageArea;
      case "gs.EraseMessageArea":
        return command.execute = this.commandEraseMessageArea;
      case "gs.SetTargetMessage":
        return command.execute = this.commandSetTargetMessage;
      case "vn.MessageBoxDefaults":
        return command.execute = this.commandMessageBoxDefaults;
      case "vn.MessageBoxVisibility":
        return command.execute = this.commandMessageBoxVisibility;
      case "vn.MessageVisibility":
        return command.execute = this.commandMessageVisibility;
      case "vn.BacklogVisibility":
        return command.execute = this.commandBacklogVisibility;
      case "gs.ClearMessage":
        return command.execute = this.commandClearMessage;
      case "gs.ChangeWeather":
        return command.execute = this.commandChangeWeather;
      case "gs.FreezeScreen":
        return command.execute = this.commandFreezeScreen;
      case "gs.ScreenTransition":
        return command.execute = this.commandScreenTransition;
      case "gs.ShakeScreen":
        return command.execute = this.commandShakeScreen;
      case "gs.TintScreen":
        return command.execute = this.commandTintScreen;
      case "gs.FlashScreen":
        return command.execute = this.commandFlashScreen;
      case "gs.ZoomScreen":
        return command.execute = this.commandZoomScreen;
      case "gs.RotateScreen":
        return command.execute = this.commandRotateScreen;
      case "gs.PanScreen":
        return command.execute = this.commandPanScreen;
      case "gs.ScreenEffect":
        return command.execute = this.commandScreenEffect;
      case "gs.ShowVideo":
        return command.execute = this.commandShowVideo;
      case "gs.MoveVideo":
        return command.execute = this.commandMoveVideo;
      case "gs.MoveVideoPath":
        return command.execute = this.commandMoveVideoPath;
      case "gs.TintVideo":
        return command.execute = this.commandTintVideo;
      case "gs.FlashVideo":
        return command.execute = this.commandFlashVideo;
      case "gs.CropVideo":
        return command.execute = this.commandCropVideo;
      case "gs.RotateVideo":
        return command.execute = this.commandRotateVideo;
      case "gs.ZoomVideo":
        return command.execute = this.commandZoomVideo;
      case "gs.BlendVideo":
        return command.execute = this.commandBlendVideo;
      case "gs.MaskVideo":
        return command.execute = this.commandMaskVideo;
      case "gs.VideoEffect":
        return command.execute = this.commandVideoEffect;
      case "gs.VideoMotionBlur":
        return command.execute = this.commandVideoMotionBlur;
      case "gs.VideoDefaults":
        return command.execute = this.commandVideoDefaults;
      case "gs.EraseVideo":
        return command.execute = this.commandEraseVideo;
      case "gs.ShowImageMap":
        return command.execute = this.commandShowImageMap;
      case "gs.EraseImageMap":
        return command.execute = this.commandEraseImageMap;
      case "gs.AddHotspot":
        return command.execute = this.commandAddHotspot;
      case "gs.EraseHotspot":
        return command.execute = this.commandEraseHotspot;
      case "gs.ChangeHotspotState":
        return command.execute = this.commandChangeHotspotState;
      case "gs.ShowPicture":
        return command.execute = this.commandShowPicture;
      case "gs.MovePicture":
        return command.execute = this.commandMovePicture;
      case "gs.MovePicturePath":
        return command.execute = this.commandMovePicturePath;
      case "gs.TintPicture":
        return command.execute = this.commandTintPicture;
      case "gs.FlashPicture":
        return command.execute = this.commandFlashPicture;
      case "gs.CropPicture":
        return command.execute = this.commandCropPicture;
      case "gs.RotatePicture":
        return command.execute = this.commandRotatePicture;
      case "gs.ZoomPicture":
        return command.execute = this.commandZoomPicture;
      case "gs.BlendPicture":
        return command.execute = this.commandBlendPicture;
      case "gs.ShakePicture":
        return command.execute = this.commandShakePicture;
      case "gs.MaskPicture":
        return command.execute = this.commandMaskPicture;
      case "gs.PictureEffect":
        return command.execute = this.commandPictureEffect;
      case "gs.PictureMotionBlur":
        return command.execute = this.commandPictureMotionBlur;
      case "gs.PictureDefaults":
        return command.execute = this.commandPictureDefaults;
      case "gs.PlayPictureAnimation":
        return command.execute = this.commandPlayPictureAnimation;
      case "gs.ErasePicture":
        return command.execute = this.commandErasePicture;
      case "gs.InputNumber":
        return command.execute = this.commandInputNumber;
      case "gs.SetInputSession":
        return command.execute = this.commandSetInputSession;
      case "vn.Choice":
        return command.execute = this.commandShowChoice;
      case "vn.ChoiceTimer":
        return command.execute = this.commandChoiceTimer;
      case "vn.ShowChoices":
        return command.execute = this.commandShowChoices;
      case "vn.UnlockCG":
        return command.execute = this.commandUnlockCG;
      case "vn.L2DJoinScene":
        return command.execute = this.commandL2DJoinScene;
      case "vn.L2DExitScene":
        return command.execute = this.commandL2DExitScene;
      case "vn.L2DMotion":
        return command.execute = this.commandL2DMotion;
      case "vn.L2DMotionGroup":
        return command.execute = this.commandL2DMotionGroup;
      case "vn.L2DExpression":
        return command.execute = this.commandL2DExpression;
      case "vn.L2DMove":
        return command.execute = this.commandL2DMove;
      case "vn.L2DParameter":
        return command.execute = this.commandL2DParameter;
      case "vn.L2DSettings":
        return command.execute = this.commandL2DSettings;
      case "vn.L2DDefaults":
        return command.execute = this.commandL2DDefaults;
      case "vn.CharacterJoinScene":
        return command.execute = this.commandCharacterJoinScene;
      case "vn.CharacterExitScene":
        return command.execute = this.commandCharacterExitScene;
      case "vn.CharacterChangeExpression":
        return command.execute = this.commandCharacterChangeExpression;
      case "vn.CharacterSetParameter":
        return command.execute = this.commandCharacterSetParameter;
      case "vn.CharacterGetParameter":
        return command.execute = this.commandCharacterGetParameter;
      case "vn.CharacterDefaults":
        return command.execute = this.commandCharacterDefaults;
      case "vn.CharacterEffect":
        return command.execute = this.commandCharacterEffect;
      case "vn.ZoomCharacter":
        return command.execute = this.commandZoomCharacter;
      case "vn.RotateCharacter":
        return command.execute = this.commandRotateCharacter;
      case "vn.BlendCharacter":
        return command.execute = this.commandBlendCharacter;
      case "vn.ShakeCharacter":
        return command.execute = this.commandShakeCharacter;
      case "vn.MaskCharacter":
        return command.execute = this.commandMaskCharacter;
      case "vn.MoveCharacter":
        return command.execute = this.commandMoveCharacter;
      case "vn.MoveCharacterPath":
        return command.execute = this.commandMoveCharacterPath;
      case "vn.FlashCharacter":
        return command.execute = this.commandFlashCharacter;
      case "vn.TintCharacter":
        return command.execute = this.commandTintCharacter;
      case "vn.CharacterMotionBlur":
        return command.execute = this.commandCharacterMotionBlur;
      case "vn.ChangeBackground":
        return command.execute = this.commandChangeBackground;
      case "vn.ShakeBackground":
        return command.execute = this.commandShakeBackground;
      case "vn.ScrollBackground":
        return command.execute = this.commandScrollBackground;
      case "vn.ScrollBackgroundTo":
        return command.execute = this.commandScrollBackgroundTo;
      case "vn.ScrollBackgroundPath":
        return command.execute = this.commandScrollBackgroundPath;
      case "vn.ZoomBackground":
        return command.execute = this.commandZoomBackground;
      case "vn.RotateBackground":
        return command.execute = this.commandRotateBackground;
      case "vn.TintBackground":
        return command.execute = this.commandTintBackground;
      case "vn.BlendBackground":
        return command.execute = this.commandBlendBackground;
      case "vn.MaskBackground":
        return command.execute = this.commandMaskBackground;
      case "vn.BackgroundMotionBlur":
        return command.execute = this.commandBackgroundMotionBlur;
      case "vn.BackgroundEffect":
        return command.execute = this.commandBackgroundEffect;
      case "vn.BackgroundDefaults":
        return command.execute = this.commandBackgroundDefaults;
      case "vn.ChangeScene":
        return command.execute = this.commandChangeScene;
      case "vn.ReturnToPreviousScene":
        return command.execute = this.commandReturnToPreviousScene;
      case "vn.CallScene":
        return command.execute = this.commandCallScene;
      case "vn.SwitchToLayout":
        return command.execute = this.commandSwitchToLayout;
      case "gs.ChangeTransition":
        return command.execute = this.commandChangeTransition;
      case "gs.ChangeWindowSkin":
        return command.execute = this.commandChangeWindowSkin;
      case "gs.ChangeScreenTransitions":
        return command.execute = this.commandChangeScreenTransitions;
      case "vn.UIAccess":
        return command.execute = this.commandUIAccess;
      case "gs.PlayVideo":
        return command.execute = this.commandPlayVideo;
      case "gs.PlayMusic":
        return command.execute = this.commandPlayMusic;
      case "gs.StopMusic":
        return command.execute = this.commandStopMusic;
      case "gs.PlaySound":
        return command.execute = this.commandPlaySound;
      case "gs.StopSound":
        return command.execute = this.commandStopSound;
      case "gs.PauseMusic":
        return command.execute = this.commandPauseMusic;
      case "gs.ResumeMusic":
        return command.execute = this.commandResumeMusic;
      case "gs.AudioDefaults":
        return command.execute = this.commandAudioDefaults;
      case "gs.EndCommonEvent":
        return command.execute = this.commandEndCommonEvent;
      case "gs.ResumeCommonEvent":
        return command.execute = this.commandResumeCommonEvent;
      case "gs.CallCommonEvent":
        return command.execute = this.commandCallCommonEvent;
      case "gs.ChangeTimer":
        return command.execute = this.commandChangeTimer;
      case "gs.ShowText":
        return command.execute = this.commandShowText;
      case "gs.RefreshText":
        return command.execute = this.commandRefreshText;
      case "gs.TextMotionBlur":
        return command.execute = this.commandTextMotionBlur;
      case "gs.MoveText":
        return command.execute = this.commandMoveText;
      case "gs.MoveTextPath":
        return command.execute = this.commandMoveTextPath;
      case "gs.RotateText":
        return command.execute = this.commandRotateText;
      case "gs.ZoomText":
        return command.execute = this.commandZoomText;
      case "gs.BlendText":
        return command.execute = this.commandBlendText;
      case "gs.ColorText":
        return command.execute = this.commandColorText;
      case "gs.EraseText":
        return command.execute = this.commandEraseText;
      case "gs.TextEffect":
        return command.execute = this.commandTextEffect;
      case "gs.TextDefaults":
        return command.execute = this.commandTextDefaults;
      case "gs.ChangeTextSettings":
        return command.execute = this.commandChangeTextSettings;
      case "gs.InputText":
        return command.execute = this.commandInputText;
      case "gs.InputName":
        return command.execute = this.commandInputName;
      case "gs.SavePersistentData":
        return command.execute = this.commandSavePersistentData;
      case "gs.SaveSettings":
        return command.execute = this.commandSaveSettings;
      case "gs.PrepareSaveGame":
        return command.execute = this.commandPrepareSaveGame;
      case "gs.SaveGame":
        return command.execute = this.commandSaveGame;
      case "gs.LoadGame":
        return command.execute = this.commandLoadGame;
      case "gs.GetInputData":
        return command.execute = this.commandGetInputData;
      case "gs.WaitForInput":
        return command.execute = this.commandWaitForInput;
      case "gs.ChangeObjectDomain":
        return command.execute = this.commandChangeObjectDomain;
      case "vn.GetGameData":
        return command.execute = this.commandGetGameData;
      case "vn.SetGameData":
        return command.execute = this.commandSetGameData;
      case "vn.GetObjectData":
        return command.execute = this.commandGetObjectData;
      case "vn.SetObjectData":
        return command.execute = this.commandSetObjectData;
      case "vn.ChangeSounds":
        return command.execute = this.commandChangeSounds;
      case "vn.ChangeColors":
        return command.execute = this.commandChangeColors;
      case "gs.ChangeScreenCursor":
        return command.execute = this.commandChangeScreenCursor;
      case "gs.ResetGlobalData":
        return command.execute = this.commandResetGlobalData;
      case "gs.Script":
        return command.execute = this.commandScript;
    }
  };


  /**
  * Executes the command at the specified index and increases the command-pointer.
  *
  * @method executeCommand
   */

  Component_CommandInterpreter.prototype.executeCommand = function(index) {
    var indent, ref, ref1;
    this.command = this.object.commands[index];
    if (this.previewData) {
      if (this.previewData.uid && this.previewData.uid !== this.command.uid) {
        GameManager.tempSettings.skip = true;
        GameManager.tempSettings.skipTime = 0;
      } else if (this.pointer < this.previewData.pointer) {
        GameManager.tempSettings.skip = true;
        GameManager.tempSettings.skipTime = 0;
      } else {
        GameManager.tempSettings.skip = this.previewData.settings.animationDisabled;
        GameManager.tempSettings.skipTime = 0;
        this.previewInfo.waiting = true;
        gs.GlobalEventManager.emit("previewWaiting");
        if (this.previewData.settings.animationDisabled || this.previewData.settings.animationTime > 0) {
          this.previewInfo.timeout = setTimeout((function() {
            return Graphics.stopped = true;
          }), this.previewData.settings.animationTime * 1000);
        }
      }
    }
    if (this.command.execute != null) {
      this.command.interpreter = this;
      if (this.command.indent === this.indent) {
        this.command.execute();
      }
      this.pointer++;
      this.command = this.object.commands[this.pointer];
      if (this.command != null) {
        indent = this.command.indent;
      } else {
        indent = this.indent;
        while (indent > 0 && (this.loops[indent] == null)) {
          indent--;
        }
      }
      if (indent < this.indent) {
        this.indent = indent;
        if ((ref = this.loops[this.indent]) != null ? ref.condition() : void 0) {
          this.pointer = this.loops[this.indent].pointer;
          this.command = this.object.commands[this.pointer];
          return this.command.interpreter = this;
        } else {
          return this.loops[this.indent] = null;
        }
      }
    } else {
      this.assignCommand(this.command);
      if (this.command.execute != null) {
        this.command.interpreter = this;
        if (this.command.indent === this.indent) {
          this.command.execute();
        }
        this.pointer++;
        this.command = this.object.commands[this.pointer];
        if (this.command != null) {
          indent = this.command.indent;
        } else {
          indent = this.indent;
          while (indent > 0 && (this.loops[indent] == null)) {
            indent--;
          }
        }
        if (indent < this.indent) {
          this.indent = indent;
          if ((ref1 = this.loops[this.indent]) != null ? ref1.condition() : void 0) {
            this.pointer = this.loops[this.indent].pointer;
            this.command = this.object.commands[this.pointer];
            return this.command.interpreter = this;
          } else {
            return this.loops[this.indent] = null;
          }
        }
      } else {
        return this.pointer++;
      }
    }
  };


  /**
  * Skips all commands until a command with the specified indent-level is
  * found. So for example: To jump from a Condition-Command to the next
  * Else-Command just pass the indent-level of the Condition/Else command.
  *
  * @method skip
  * @param {number} indent - The indent-level.
  * @param {boolean} backward - If true the skip runs backward.
   */

  Component_CommandInterpreter.prototype.skip = function(indent, backward) {
    var results, results1;
    if (backward) {
      this.pointer--;
      results = [];
      while (this.pointer > 0 && this.object.commands[this.pointer].indent !== indent) {
        results.push(this.pointer--);
      }
      return results;
    } else {
      this.pointer++;
      results1 = [];
      while (this.pointer < this.object.commands.length && this.object.commands[this.pointer].indent !== indent) {
        results1.push(this.pointer++);
      }
      return results1;
    }
  };


  /**
  * Halts the interpreter for the specified amount of time. An optionally
  * callback function can be passed which is called when the time is up.
  *
  * @method wait
  * @param {number} time - The time to wait
  * @param {gs.Callback} callback - Called if the wait time is up.
   */

  Component_CommandInterpreter.prototype.wait = function(time, callback) {
    this.isWaiting = true;
    this.waitCounter = time;
    return this.waitCallback = callback;
  };


  /**
  * Checks if the command at the specified pointer-index is a game message
  * related command.
  *
  * @method isMessageCommand
  * @param {number} pointer - The pointer/index.
  * @param {Object[]} commands - The list of commands to check.
  * @return {boolean} <b>true</b> if its a game message related command. Otherwise <b>false</b>.
   */

  Component_CommandInterpreter.prototype.isMessageCommand = function(pointer, commands) {
    var result;
    result = true;
    if (pointer >= commands.length || (commands[pointer].id !== "gs.InputNumber" && commands[pointer].id !== "vn.Choice" && commands[pointer].id !== "gs.InputText" && commands[pointer].id !== "gs.InputName")) {
      result = false;
    }
    return result;
  };


  /**
  * Checks if the command at the specified pointer-index asks for user-input like
  * the Input Number or Input Text command.
  *
  * @method isInputDataCommand
  * @param {number} pointer - The pointer/index.
  * @param {Object[]} commands - The list of commands to check.
  * @return {boolean} <b>true</b> if its an input-data command. Otherwise <b>false</b>
   */

  Component_CommandInterpreter.prototype.isInputDataCommand = function(pointer, commands) {
    return pointer < commands.length && (commands[pointer].id === "gs.InputNumber" || commands[pointer].id === "gs.InputText" || commands[pointer].id === "vn.Choice" || commands[pointer].id === "vn.ShowChoices");
  };


  /**
  * Checks if a game message is currently running by another interpreter like a
  * common-event interpreter.
  *
  * @method isProcessingMessageInOtherContext
  * @return {boolean} <b>true</b> a game message is running in another context. Otherwise <b>false</b>
   */

  Component_CommandInterpreter.prototype.isProcessingMessageInOtherContext = function() {
    var gm, result, s;
    result = false;
    gm = GameManager;
    s = SceneManager.scene;
    result = ((s.inputNumberWindow != null) && s.inputNumberWindow.visible && s.inputNumberWindow.executionContext !== this.context) || ((s.inputTextWindow != null) && s.inputTextWindow.active && s.inputTextWindow.executionContext !== this.context);
    return result;
  };


  /**
  * If a game message is currently running by an other interpreter like a common-event
  * interpreter, this method trigger a wait until the other interpreter is finished
  * with the game message.
  *
  * @method waitForMessage
  * @return {boolean} <b>true</b> a game message is running in another context. Otherwise <b>false</b>
   */

  Component_CommandInterpreter.prototype.waitForMessage = function() {
    this.isWaitingForMessage = true;
    this.isWaiting = true;
    return this.pointer--;
  };


  /**
  * Gets the value the number variable at the specified index.
  *
  * @method numberValueAtIndex
  * @param {number} scope - The variable's scope.
  * @param {number} index - The index of the variable to get the value from.
  * @return {Number} The value of the variable.
   */

  Component_CommandInterpreter.prototype.numberValueAtIndex = function(scope, index, domain) {
    return GameManager.variableStore.numberValueAtIndex(scope, index, domain);
  };


  /**
  * Gets the value of a (possible) number variable. If a constant number value is specified, this method
  * does nothing an just returns that constant value. That's to make it more comfortable to just pass a value which
  * can be calculated by variable but also be just a constant value.
  *
  * @method numberValueOf
  * @param {number|Object} object - A number variable or constant number value.
  * @return {Number} The value of the variable.
   */

  Component_CommandInterpreter.prototype.numberValueOf = function(object) {
    return GameManager.variableStore.numberValueOf(object);
  };


  /**
  * It does the same like <b>numberValueOf</b> with one difference: If the specified object
  * is a variable, it's value is considered as a duration-value in milliseconds and automatically converted
  * into frames.
  *
  * @method durationValueOf
  * @param {number|Object} object - A number variable or constant number value.
  * @return {Number} The value of the variable.
   */

  Component_CommandInterpreter.prototype.durationValueOf = function(object) {
    if (object && (object.index != null)) {
      return Math.round(GameManager.variableStore.numberValueOf(object) / 1000 * Graphics.frameRate);
    } else {
      return Math.round(GameManager.variableStore.numberValueOf(object));
    }
  };


  /**
  * Gets a position ({x, y}) for the specified predefined object position configured in
  * Database - System.
  *
  * @method predefinedObjectPosition
  * @param {number} position - The index/ID of the predefined object position to set.
  * @param {gs.Object_Base} object - The game object to set the position for.
  * @param {Object} params - The params object of the scene command.
  * @return {Object} The position {x, y}.
   */

  Component_CommandInterpreter.prototype.predefinedObjectPosition = function(position, object, params) {
    var objectPosition;
    objectPosition = RecordManager.system.objectPositions[position];
    if (!objectPosition) {
      return {
        x: 0,
        y: 0
      };
    }
    return objectPosition.func.call(null, object, params) || {
      x: 0,
      y: 0
    };
  };


  /**
  * Sets the value of a variable.
  *
  * @method setValueToVariable
  * @param {number} variable - The variable to set.
  * @param {number} variableType - The type of the variable to set.
  * @param {number} value - The value to set the variable to. Depends on the variable type.
   */

  Component_CommandInterpreter.prototype.setValueToVariable = function(variable, variableType, value) {
    switch (variableType) {
      case 0:
        return GameManager.variableStore.setNumberValueTo(variable, value);
      case 1:
        return GameManager.variableStore.setBooleanValueTo(variable, value);
      case 2:
        return GameManager.variableStore.setStringValueTo(variable, value);
      case 3:
        return GameManager.variableStore.setListObjectTo(variable, value);
    }
  };


  /**
  * Sets the value of a number variable at the specified index.
  *
  * @method setNumberValueAtIndex
  * @param {number} scope - The variable's scope.
  * @param {number} index - The index of the variable to set.
  * @param {number} value - The number value to set the variable to.
   */

  Component_CommandInterpreter.prototype.setNumberValueAtIndex = function(scope, index, value, domain) {
    return GameManager.variableStore.setNumberValueAtIndex(scope, index, value, domain);
  };


  /**
  * Sets the value of a number variable.
  *
  * @method setNumberValueTo
  * @param {number} variable - The variable to set.
  * @param {number} value - The number value to set the variable to.
   */

  Component_CommandInterpreter.prototype.setNumberValueTo = function(variable, value) {
    return GameManager.variableStore.setNumberValueTo(variable, value);
  };


  /**
  * Sets the value of a list variable.
  *
  * @method setListObjectTo
  * @param {Object} variable - The variable to set.
  * @param {Object} value - The list object to set the variable to.
   */

  Component_CommandInterpreter.prototype.setListObjectTo = function(variable, value) {
    return GameManager.variableStore.setListObjectTo(variable, value);
  };


  /**
  * Sets the value of a boolean/switch variable.
  *
  * @method setBooleanValueTo
  * @param {Object} variable - The variable to set.
  * @param {boolean} value - The boolean value to set the variable to.
   */

  Component_CommandInterpreter.prototype.setBooleanValueTo = function(variable, value) {
    return GameManager.variableStore.setBooleanValueTo(variable, value);
  };


  /**
  * Sets the value of a number variable at the specified index.
  *
  * @method setBooleanValueAtIndex
  * @param {number} scope - The variable's scope.
  * @param {number} index - The index of the variable to set.
  * @param {boolean} value - The boolean value to set the variable to.
   */

  Component_CommandInterpreter.prototype.setBooleanValueAtIndex = function(scope, index, value, domain) {
    return GameManager.variableStore.setBooleanValueAtIndex(scope, index, value, domain);
  };


  /**
  * Sets the value of a string/text variable.
  *
  * @method setStringValueTo
  * @param {Object} variable - The variable to set.
  * @param {string} value - The string/text value to set the variable to.
   */

  Component_CommandInterpreter.prototype.setStringValueTo = function(variable, value) {
    return GameManager.variableStore.setStringValueTo(variable, value);
  };


  /**
  * Sets the value of the string variable at the specified index.
  *
  * @method setStringValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @param {string} value - The value to set.
   */

  Component_CommandInterpreter.prototype.setStringValueAtIndex = function(scope, index, value, domain) {
    return GameManager.variableStore.setStringValueAtIndex(scope, index, value, domain);
  };


  /**
  * Gets the value of a (possible) string variable. If a constant string value is specified, this method
  * does nothing an just returns that constant value. That's to make it more comfortable to just pass a value which
  * can be calculated by variable but also be just a constant value.
  *
  * @method stringValueOf
  * @param {string|Object} object - A string variable or constant string value.
  * @return {string} The value of the variable.
   */

  Component_CommandInterpreter.prototype.stringValueOf = function(object) {
    return GameManager.variableStore.stringValueOf(object);
  };


  /**
  * Gets the value of the string variable at the specified index.
  *
  * @method stringValueAtIndex
  * @param {number} scope - The variable's scope.
  * @param {number} index - The index of the variable to get the value from.
  * @return {string} The value of the variable.
   */

  Component_CommandInterpreter.prototype.stringValueAtIndex = function(scope, index, domain) {
    return GameManager.variableStore.stringValueAtIndex(scope, index, domain);
  };


  /**
  * Gets the value of a (possible) boolean variable. If a constant boolean value is specified, this method
  * does nothing an just returns that constant value. That's to make it more comfortable to just pass a value which
  * can be calculated by variable but also be just a constant value.
  *
  * @method booleanValueOf
  * @param {boolean|Object} object - A boolean variable or constant boolean value.
  * @return {boolean} The value of the variable.
   */

  Component_CommandInterpreter.prototype.booleanValueOf = function(object) {
    return GameManager.variableStore.booleanValueOf(object);
  };


  /**
  * Gets the value of the boolean variable at the specified index.
  *
  * @method booleanValueAtIndex
  * @param {number} scope - The variable's scope.
  * @param {number} index - The index of the variable to get the value from.
  * @return {string} The value of the variable.
   */

  Component_CommandInterpreter.prototype.booleanValueAtIndex = function(scope, index, domain) {
    return GameManager.variableStore.booleanValueAtIndex(scope, index, domain);
  };


  /**
  * Gets the value of a (possible) list variable.
  *
  * @method listObjectOf
  * @param {Object} object - A list variable.
  * @return {Object} The value of the list variable.
   */

  Component_CommandInterpreter.prototype.listObjectOf = function(object) {
    return GameManager.variableStore.listObjectOf(object);
  };


  /**
  * Compares two object using the specified operation and returns the result.
  *
  * @method compare
  * @param {Object} a - Object A.
  * @param {Object} b - Object B.
  * @param {number} operation - The compare-operation to compare Object A with Object B.
  * <ul>
  * <li>0 = Equal To</li>
  * <li>1 = Not Equal To</li>
  * <li>2 = Greater Than</li>
  * <li>3 = Greater or Equal To</li>
  * <li>4 = Less Than</li>
  * <li>5 = Less or Equal To</li>
  * </ul>
  * @return {boolean} The comparison result.
   */

  Component_CommandInterpreter.prototype.compare = function(a, b, operation) {
    switch (operation) {
      case 0:
        return a == b;
      case 1:
        return a != b;
      case 2:
        return a > b;
      case 3:
        return a >= b;
      case 4:
        return a < b;
      case 5:
        return a <= b;
    }
  };


  /**
  * Changes number variables and allows decimal values such as 0.5 too.
  *
  * @method changeDecimalVariables
  * @param {Object} params - Input params from the command
  * @param {Object} roundMethod - The result of the operation will be rounded using the specified method.
  * <ul>
  * <li>0 = None. The result will not be rounded.</li>
  * <li>1 = Commercially</li>
  * <li>2 = Round Up</li>
  * <li>3 = Round Down</li>
  * </ul>
   */

  Component_CommandInterpreter.prototype.changeDecimalVariables = function(params, roundMethod) {
    var diff, end, i, index, k, ref, ref1, roundFunc, scope, source, start;
    source = 0;
    roundFunc = null;
    switch (roundMethod) {
      case 0:
        roundFunc = function(value) {
          return value;
        };
        break;
      case 1:
        roundFunc = function(value) {
          return Math.round(value);
        };
        break;
      case 2:
        roundFunc = function(value) {
          return Math.ceil(value);
        };
        break;
      case 3:
        roundFunc = function(value) {
          return Math.floor(value);
        };
    }
    switch (params.source) {
      case 0:
        source = this.numberValueOf(params.sourceValue);
        break;
      case 1:
        start = this.numberValueOf(params.sourceRandom.start);
        end = this.numberValueOf(params.sourceRandom.end);
        diff = end - start;
        source = Math.floor(start + Math.random() * (diff + 1));
        break;
      case 2:
        source = this.numberValueAtIndex(params.sourceScope, this.numberValueOf(params.sourceReference) - 1, params.sourceReferenceDomain);
        break;
      case 3:
        source = this.numberValueOfGameData(params.sourceValue1);
        break;
      case 4:
        source = this.numberValueOfDatabaseData(params.sourceValue1);
    }
    switch (params.target) {
      case 0:
        switch (params.operation) {
          case 0:
            this.setNumberValueTo(params.targetVariable, roundFunc(source));
            break;
          case 1:
            this.setNumberValueTo(params.targetVariable, roundFunc(this.numberValueOf(params.targetVariable) + source));
            break;
          case 2:
            this.setNumberValueTo(params.targetVariable, roundFunc(this.numberValueOf(params.targetVariable) - source));
            break;
          case 3:
            this.setNumberValueTo(params.targetVariable, roundFunc(this.numberValueOf(params.targetVariable) * source));
            break;
          case 4:
            this.setNumberValueTo(params.targetVariable, roundFunc(this.numberValueOf(params.targetVariable) / source));
            break;
          case 5:
            this.setNumberValueTo(params.targetVariable, this.numberValueOf(params.targetVariable) % source);
        }
        break;
      case 1:
        scope = params.targetScope;
        start = params.targetRange.start - 1;
        end = params.targetRange.end - 1;
        for (i = k = ref = start, ref1 = end; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
          switch (params.operation) {
            case 0:
              this.setNumberValueAtIndex(scope, i, roundFunc(source));
              break;
            case 1:
              this.setNumberValueAtIndex(scope, i, roundFunc(this.numberValueAtIndex(scope, i) + source));
              break;
            case 2:
              this.setNumberValueAtIndex(scope, i, roundFunc(this.numberValueAtIndex(scope, i) - source));
              break;
            case 3:
              this.setNumberValueAtIndex(scope, i, roundFunc(this.numberValueAtIndex(scope, i) * source));
              break;
            case 4:
              this.setNumberValueAtIndex(scope, i, roundFunc(this.numberValueAtIndex(scope, i) / source));
              break;
            case 5:
              this.setNumberValueAtIndex(scope, i, this.numberValueAtIndex(scope, i) % source);
          }
        }
        break;
      case 2:
        index = this.numberValueOf(params.targetReference) - 1;
        switch (params.operation) {
          case 0:
            this.setNumberValueAtIndex(params.targetScope, index, roundFunc(source), params.targetReferenceDomain);
            break;
          case 1:
            this.setNumberValueAtIndex(params.targetScope, index, roundFunc(this.numberValueAtIndex(params.targetScope, index, params.targetReferenceDomain) + source), params.targetReferenceDomain);
            break;
          case 2:
            this.setNumberValueAtIndex(params.targetScope, index, roundFunc(this.numberValueAtIndex(params.targetScope, index, params.targetReferenceDomain) - source), params.targetReferenceDomain);
            break;
          case 3:
            this.setNumberValueAtIndex(params.targetScope, index, roundFunc(this.numberValueAtIndex(params.targetScope, index, params.targetReferenceDomain) * source), params.targetReferenceDomain);
            break;
          case 4:
            this.setNumberValueAtIndex(params.targetScope, index, roundFunc(this.numberValueAtIndex(params.targetScope, index, params.targetReferenceDomain) / source), params.targetReferenceDomain);
            break;
          case 5:
            this.setNumberValueAtIndex(params.targetScope, index, this.numberValueAtIndex(params.targetScope, index, params.targetReferenceDomain) % source, params.targetReferenceDomain);
        }
    }
    return null;
  };


  /**
  * Shakes a game object.
  *
  * @method shakeObject
  * @param {gs.Object_Base} object - The game object to shake.
  * @return {Object} A params object containing additional info about the shake-animation.
   */

  Component_CommandInterpreter.prototype.shakeObject = function(object, params) {
    var duration, easing;
    duration = Math.max(Math.round(this.durationValueOf(params.duration)), 2);
    easing = gs.Easings.fromObject(params.easing);
    object.animator.shake({
      x: this.numberValueOf(params.range.x),
      y: this.numberValueOf(params.range.y)
    }, this.numberValueOf(params.speed) / 100, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Lets the interpreter wait for the completion of a running operation like an animation, etc.
  *
  * @method waitForCompletion
  * @param {gs.Object_Base} object - The game object the operation is executed on. Can be <b>null</b>.
  * @return {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.waitForCompletion = function(object, params) {
    var duration;
    duration = this.durationValueOf(params.duration);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Erases a game object.
  *
  * @method eraseObject
  * @param {gs.Object_Base} object - The game object to erase.
  * @return {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.eraseObject = function(object, params, callback) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.disappear(params.animation, easing, duration, (function(_this) {
      return function(sender) {
        sender.dispose();
        return typeof callback === "function" ? callback(sender) : void 0;
      };
    })(this));
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Shows a game object on screen.
  *
  * @method showObject
  * @param {gs.Object_Base} object - The game object to show.
  * @param {gs.Point} position - The position where the game object should be shown.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.showObject = function(object, position, params) {
    var duration, easing, x, y;
    x = this.numberValueOf(position.x);
    y = this.numberValueOf(position.y);
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.appear(x, y, params.animation, easing, duration);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Moves a game object.
  *
  * @method moveObject
  * @param {gs.Object_Base} object - The game object to move.
  * @param {gs.Point} position - The position to move the game object to.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.moveObject = function(object, position, params) {
    var bitmap, duration, easing, p, x, y, zoom;
    if (params.positionType === 0) {
      p = this.predefinedObjectPosition(params.predefinedPositionId, object, params);
      x = p.x;
      y = p.y;
    } else {
      x = this.numberValueOf(position.x);
      y = this.numberValueOf(position.y);
    }
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    zoom = object.zoom;
    if (object.anchor.x !== 0 && object.anchor.y !== 0) {
      bitmap = object.bitmap;
      if (bitmap != null) {
        x += (bitmap.width * zoom.x - bitmap.width) * object.anchor.x;
        y += (bitmap.height * zoom.y - bitmap.height) * object.anchor.y;
      }
    }
    object.animator.moveTo(x, y, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Moves a game object along a path.
  *
  * @method moveObjectPath
  * @param {gs.Object_Base} object - The game object to move.
  * @param {Object} path - The path to move the game object along.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.moveObjectPath = function(object, path, params) {
    var duration, easing, ref;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.movePath(path.data, params.loopType, duration, easing, (ref = path.effects) != null ? ref.data : void 0);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Scrolls a scrollable game object along a path.
  *
  * @method scrollObjectPath
  * @param {gs.Object_Base} object - The game object to scroll.
  * @param {Object} path - The path to scroll the game object along.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.scrollObjectPath = function(object, path, params) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.scrollPath(path, params.loopType, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Zooms/Scales a game object.
  *
  * @method zoomObject
  * @param {gs.Object_Base} object - The game object to zoom.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.zoomObject = function(object, params) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.zoomTo(this.numberValueOf(params.zooming.x) / 100, this.numberValueOf(params.zooming.y) / 100, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Rotates a game object.
  *
  * @method rotateObject
  * @param {gs.Object_Base} object - The game object to rotate.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.rotateObject = function(object, params) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    easing = gs.Easings.fromObject(params.easing);
    object.animator.rotate(params.direction, this.numberValueOf(params.speed) / 100, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Blends a game object.
  *
  * @method blendObject
  * @param {gs.Object_Base} object - The game object to blend.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.blendObject = function(object, params) {
    var duration, easing;
    easing = gs.Easings.fromObject(params.easing);
    duration = this.durationValueOf(params.duration);
    object.animator.blendTo(this.numberValueOf(params.opacity), duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Executes a masking-effect on a game object..
  *
  * @method maskObject
  * @param {gs.Object_Base} object - The game object to execute a masking-effect on.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.maskObject = function(object, params) {
    var duration, easing, mask, ref;
    easing = gs.Easings.fromObject(params.easing);
    if (params.mask.type === 0) {
      object.mask.type = 0;
      object.mask.ox = this.numberValueOf(params.mask.ox);
      object.mask.oy = this.numberValueOf(params.mask.oy);
      if (((ref = object.mask.source) != null ? ref.videoElement : void 0) != null) {
        object.mask.source.pause();
      }
      if (params.mask.sourceType === 0) {
        object.mask.source = ResourceManager.getBitmap(ResourceManager.getPath(params.mask.graphic));
      } else {
        object.mask.source = ResourceManager.getVideo(ResourceManager.getPath(params.mask.video));
        if (object.mask.source) {
          object.mask.source.play();
          object.mask.source.loop = true;
        }
      }
    } else {
      duration = this.durationValueOf(params.duration);
      mask = Object.flatCopy(params.mask);
      mask.value = this.numberValueOf(mask.value);
      object.animator.maskTo(mask, duration, easing);
    }
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Tints a game object.
  *
  * @method tintObject
  * @param {gs.Object_Base} object - The game object to tint.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.tintObject = function(object, params) {
    var duration, easing;
    duration = this.durationValueOf(params.duration);
    easing = gs.Easings.fromObject(params.easing);
    object.animator.tintTo(params.tone, duration, easing);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Flashes a game object.
  *
  * @method flashObject
  * @param {gs.Object_Base} object - The game object to flash.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.flashObject = function(object, params) {
    var duration;
    duration = this.durationValueOf(params.duration);
    object.animator.flash(new Color(params.color), duration);
    if (params.waitForCompletion && !(duration === 0 || this.isInstantSkip())) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Cropes a game object.
  *
  * @method cropObject
  * @param {gs.Object_Base} object - The game object to crop.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.cropObject = function(object, params) {
    object.srcRect.x = this.numberValueOf(params.x);
    object.srcRect.y = this.numberValueOf(params.y);
    object.srcRect.width = this.numberValueOf(params.width);
    object.srcRect.height = this.numberValueOf(params.height);
    object.dstRect.width = this.numberValueOf(params.width);
    return object.dstRect.height = this.numberValueOf(params.height);
  };


  /**
  * Sets the motion blur settings of a game object.
  *
  * @method objectMotionBlur
  * @param {gs.Object_Base} object - The game object to set the motion blur settings for.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.objectMotionBlur = function(object, params) {
    return object.motionBlur.set(params.motionBlur);
  };


  /**
  * Enables an effect on a game object.
  *
  * @method objectEffect
  * @param {gs.Object_Base} object - The game object to execute a masking-effect on.
  * @param {Object} A params object containing additional info.
   */

  Component_CommandInterpreter.prototype.objectEffect = function(object, params) {
    var duration, easing, wobble;
    duration = this.durationValueOf(params.duration);
    easing = gs.Easings.fromObject(params.easing);
    switch (params.type) {
      case 0:
        object.animator.wobbleTo(params.wobble.power / 10000, params.wobble.speed / 100, duration, easing);
        wobble = object.effects.wobble;
        wobble.enabled = params.wobble.power > 0;
        wobble.vertical = params.wobble.orientation === 0 || params.wobble.orientation === 2;
        wobble.horizontal = params.wobble.orientation === 1 || params.wobble.orientation === 2;
        break;
      case 1:
        object.animator.blurTo(params.blur.power / 100, duration, easing);
        object.effects.blur.enabled = true;
        break;
      case 2:
        object.animator.pixelateTo(params.pixelate.size.width, params.pixelate.size.height, duration, easing);
        object.effects.pixelate.enabled = true;
    }
    if (params.waitForCompletion && duration !== 0) {
      this.isWaiting = true;
      return this.waitCounter = duration;
    }
  };


  /**
  * Executes an action for a choice.
  *
  * @method executeChoiceAction
  * @param {Object} action - Action-Data.
  * @param {boolean} stateValue - In case of switch-binding, the switch is set to this value.
   */

  Component_CommandInterpreter.prototype.executeChoiceAction = function(action, stateValue) {
    var newScene, scene, uid;
    switch (action.type) {
      case 4:
        scene = SceneManager.scene;
        GameManager.sceneData = GameManager.sceneData = {
          uid: uid = action.scene.uid,
          pictures: scene.pictureContainer.subObjectsByDomain,
          texts: scene.textContainer.subObjectsByDomain,
          videos: scene.videoContainer.subObjectsByDomain
        };
        newScene = new vn.Object_Scene();
        newScene.sceneData = {
          uid: action.scene.uid,
          pictures: scene.pictureContainer.subObjectsByDomain,
          texts: scene.textContainer.subObjectsByDomain,
          videos: scene.videoContainer.subObjectsByDomain
        };
        return SceneManager.switchTo(newScene, false, (function(_this) {
          return function() {
            return _this.isWaiting = false;
          };
        })(this));
      default:
        return this.executeAction(action, stateValue, 0);
    }
  };


  /**
  * Executes an action like for a hotspot.
  *
  * @method executeAction
  * @param {Object} action - Action-Data.
  * @param {boolean} stateValue - In case of switch-binding, the switch is set to this value.
  * @param {number} bindValue - A number value which be put into the action's bind-value variable.
   */

  Component_CommandInterpreter.prototype.executeAction = function(action, stateValue, bindValue) {
    var domain, ref;
    switch (action.type) {
      case 0:
        if (action.labelIndex) {
          return this.pointer = action.labelIndex;
        } else {
          return this.jumpToLabel(action.label);
        }
        break;
      case 1:
        return this.callCommonEvent(action.commonEventId, null, this.isWaiting);
      case 2:
        domain = GameManager.variableStore.domain;
        return this.setBooleanValueTo(action["switch"], stateValue);
      case 3:
        return this.callScene((ref = action.scene) != null ? ref.uid : void 0);
      case 4:
        domain = GameManager.variableStore.domain;
        this.setNumberValueTo(action.bindValueVariable, bindValue);
        if (action.labelIndex) {
          return this.pointer = action.labelIndex;
        } else {
          return this.jumpToLabel(action.label);
        }
    }
  };


  /**
  * Calls a common event and returns the sub-interpreter for it.
  *
  * @method callCommonEvent
  * @param {number} id - The ID of the common event to call.
  * @param {Object} parameters - Optional common event parameters.
  * @param {boolean} wait - Indicates if the interpreter should be stay in waiting-mode even if the sub-interpreter is finished.
   */

  Component_CommandInterpreter.prototype.callCommonEvent = function(id, parameters, wait) {
    var commonEvent, ref;
    commonEvent = GameManager.commonEvents[id];
    if (commonEvent != null) {
      if (SceneManager.scene.commonEventContainer.subObjects.indexOf(commonEvent) === -1) {
        SceneManager.scene.commonEventContainer.addObject(commonEvent);
      }
      if ((ref = commonEvent.events) != null) {
        ref.on("finish", gs.CallBack("onCommonEventFinish", this), {
          waiting: wait
        });
      }
      this.subInterpreter = commonEvent.behavior.call(parameters || [], this.settings, this.context);
      commonEvent.behavior.update();
      if (this.subInterpreter != null) {
        this.isWaiting = true;
        this.subInterpreter.settings = this.settings;
        this.subInterpreter.start();
        this.subInterpreter.update();
      }
      return GameManager.variableStore.setupTempVariables(this.context);
    }
  };


  /**
  * Calls a scene and returns the sub-interpreter for it.
  *
  * @method callScene
  * @param {String} uid - The UID of the scene to call.
   */

  Component_CommandInterpreter.prototype.callScene = function(uid) {
    var object, sceneDocument;
    sceneDocument = DataManager.getDocument(uid);
    if (sceneDocument != null) {
      this.isWaiting = true;
      this.subInterpreter = new vn.Component_CallSceneInterpreter();
      object = {
        commands: sceneDocument.items.commands
      };
      this.subInterpreter.repeat = false;
      this.subInterpreter.context.set(sceneDocument.uid, sceneDocument);
      this.subInterpreter.object = object;
      this.subInterpreter.onFinish = gs.CallBack("onCallSceneFinish", this);
      this.subInterpreter.start();
      this.subInterpreter.settings = this.settings;
      return this.subInterpreter.update();
    }
  };


  /**
  * Calls a common event and returns the sub-interpreter for it.
  *
  * @method storeListValue
  * @param {number} id - The ID of the common event to call.
  * @param {Object} parameters - Optional common event parameters.
  * @param {boolean} wait - Indicates if the interpreter should be stay in waiting-mode even if the sub-interpreter is finished.
   */

  Component_CommandInterpreter.prototype.storeListValue = function(variable, list, value, valueType) {
    switch (valueType) {
      case 0:
        return this.setNumberValueTo(variable, (!isNaN(value) ? parseInt(value) : 0));
      case 1:
        return this.setBooleanValueTo(variable, (value ? 1 : 0));
      case 2:
        return this.setStringValueTo(variable, value.toString());
      case 3:
        return this.setListObjectTo(variable, (value.length != null ? value : []));
    }
  };


  /**
  * @method jumpToLabel
   */

  Component_CommandInterpreter.prototype.jumpToLabel = function(label) {
    var found, i, k, ref;
    if (!label) {
      return;
    }
    found = false;
    for (i = k = 0, ref = this.object.commands.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      if (this.object.commands[i].id === "gs.Label" && this.object.commands[i].params.name === label) {
        this.pointer = i;
        this.indent = this.object.commands[i].indent;
        found = true;
        break;
      }
    }
    if (found) {
      this.waitCounter = 0;
      return this.isWaiting = false;
    }
  };


  /**
  * Gets the current message box object depending on game mode (ADV or NVL).
  *
  * @method messageBoxObject
  * @return {gs.Object_Base} The message box object.
  * @protected
   */

  Component_CommandInterpreter.prototype.messageBoxObject = function(id) {
    if (SceneManager.scene.layout.visible) {
      return gs.ObjectManager.current.objectById(id || "messageBox");
    } else {
      return gs.ObjectManager.current.objectById(id || "nvlMessageBox");
    }
  };


  /**
  * Gets the current message object depending on game mode (ADV or NVL).
  *
  * @method messageObject
  * @return {ui.Object_Message} The message object.
  * @protected
   */

  Component_CommandInterpreter.prototype.messageObject = function() {
    if (SceneManager.scene.layout.visible) {
      return gs.ObjectManager.current.objectById("gameMessage_message");
    } else {
      return gs.ObjectManager.current.objectById("nvlGameMessage_message");
    }
  };


  /**
  * Gets the current message ID depending on game mode (ADV or NVL).
  *
  * @method messageObjectId
  * @return {string} The message object ID.
  * @protected
   */

  Component_CommandInterpreter.prototype.messageObjectId = function() {
    if (SceneManager.scene.layout.visible) {
      return "gameMessage_message";
    } else {
      return "nvlGameMessage_message";
    }
  };


  /**
  * Gets the current message settings.
  *
  * @method messageSettings
  * @return {Object} The message settings
  * @protected
   */

  Component_CommandInterpreter.prototype.messageSettings = function() {
    var message;
    message = this.targetMessage();
    return message.settings;
  };


  /**
  * Gets the current target message object where all message commands are executed on.
  *
  * @method targetMessage
  * @return {ui.Object_Message} The target message object.
  * @protected
   */

  Component_CommandInterpreter.prototype.targetMessage = function() {
    var message, ref, ref1, ref2, target;
    message = this.messageObject();
    target = this.settings.message.target;
    if (target != null) {
      switch (target.type) {
        case 0:
          message = (ref = gs.ObjectManager.current.objectById(target.id)) != null ? ref : this.messageObject();
          break;
        case 1:
          message = (ref1 = (ref2 = SceneManager.scene.messageAreas[target.id]) != null ? ref2.message : void 0) != null ? ref1 : this.messageObject();
      }
    }
    return message;
  };


  /**
  * Gets the current target message box containing the current target message.
  *
  * @method targetMessageBox
  * @return {ui.Object_UIElement} The target message box.
  * @protected
   */

  Component_CommandInterpreter.prototype.targetMessageBox = function() {
    var messageBox, ref, ref1, target;
    messageBox = this.messageObject();
    target = this.settings.message.target;
    if (target != null) {
      switch (target.type) {
        case 0:
          messageBox = (ref = gs.ObjectManager.current.objectById(target.id)) != null ? ref : this.messageObject();
          break;
        case 1:
          messageBox = (ref1 = gs.ObjectManager.current.objectById("customGameMessage_" + target.id)) != null ? ref1 : this.messageObject();
      }
    }
    return messageBox;
  };


  /**
  * Called after an input number dialog was accepted by the user. It takes the user's input and puts
  * it in the configured number variable.
  *
  * @method onInputNumberFinish
  * @return {Object} Event Object containing additional data like the number, etc.
  * @protected
   */

  Component_CommandInterpreter.prototype.onInputNumberFinish = function(e) {
    this.messageObject().behavior.clear();
    this.setNumberValueTo(this.waitingFor.inputNumber.variable, parseInt(ui.Component_FormulaHandler.fieldValue(e.sender, e.number)));
    this.isWaiting = false;
    this.waitingFor.inputNumber = null;
    return SceneManager.scene.inputNumberBox.dispose();
  };


  /**
  * Called after an input text dialog was accepted by the user. It takes the user's text input and puts
  * it in the configured string variable.
  *
  * @method onInputTextFinish
  * @return {Object} Event Object containing additional data like the text, etc.
  * @protected
   */

  Component_CommandInterpreter.prototype.onInputTextFinish = function(e) {
    this.messageObject().behavior.clear();
    this.setStringValueTo(this.waitingFor.inputText.variable, ui.Component_FormulaHandler.fieldValue(e.sender, e.text).replace(/_/g, ""));
    this.isWaiting = false;
    this.waitingFor.inputText = null;
    return SceneManager.scene.inputTextBox.dispose();
  };


  /**
  * Called after a choice was selected by the user. It jumps to the corresponding label
  * and also puts the choice into backlog.
  *
  * @method onChoiceAccept
  * @return {Object} Event Object containing additional data like the label, etc.
  * @protected
   */

  Component_CommandInterpreter.prototype.onChoiceAccept = function(e) {
    var duration, fading, messageObject, scene;
    scene = SceneManager.scene;
    scene.choiceTimer.behavior.stop();
    e.isSelected = true;
    delete e.sender;
    GameManager.backlog.push({
      character: {
        name: ""
      },
      message: "",
      choice: e,
      choices: scene.choices,
      isChoice: true
    });
    scene.choices = [];
    messageObject = this.messageObject();
    if (messageObject != null ? messageObject.visible : void 0) {
      this.isWaiting = true;
      fading = GameManager.tempSettings.messageFading;
      duration = GameManager.tempSettings.skip ? 0 : fading.duration;
      messageObject.animator.disappear(fading.animation, fading.easing, duration, (function(_this) {
        return function() {
          messageObject.behavior.clear();
          messageObject.visible = false;
          _this.isWaiting = false;
          _this.waitingFor.choice = null;
          return _this.executeChoiceAction(e.action, true);
        };
      })(this));
    } else {
      this.isWaiting = false;
      this.executeChoiceAction(e.action, true);
    }
    return scene.choiceWindow.dispose();
  };


  /**
  * Idle
  * @method commandIdle
  * @protected
   */

  Component_CommandInterpreter.prototype.commandIdle = function() {
    return this.interpreter.isWaiting = !this.interpreter.isInstantSkip();
  };


  /**
  * Start Timer
  * @method commandStartTimer
  * @protected
   */

  Component_CommandInterpreter.prototype.commandStartTimer = function() {
    var number, scene, timer, timers;
    scene = SceneManager.scene;
    timers = scene.timers;
    number = this.interpreter.numberValueOf(this.params.number);
    timer = timers[number];
    if (timer == null) {
      timer = new gs.Object_IntervalTimer();
      timers[number] = timer;
    }
    timer.events.offByOwner("elapsed", this.object);
    timer.events.on("elapsed", (function(_this) {
      return function(e) {
        var params;
        params = e.data.params;
        switch (params.action.type) {
          case 0:
            if (params.labelIndex != null) {
              return SceneManager.scene.interpreter.pointer = params.labelIndex;
            } else {
              return SceneManager.scene.interpreter.jumpToLabel(params.action.data.label);
            }
            break;
          case 1:
            return SceneManager.scene.interpreter.callCommonEvent(params.action.data.commonEventId, null, _this.interpreter.isWaiting);
        }
      };
    })(this), {
      params: this.params
    }, this.object);
    timer.behavior.interval = this.interpreter.durationValueOf(this.params.interval);
    return timer.behavior.start();
  };


  /**
  * Resume Timer
  * @method commandResumeTimer
  * @protected
   */

  Component_CommandInterpreter.prototype.commandResumeTimer = function() {
    var number, ref, timers;
    timers = SceneManager.scene.timers;
    number = this.interpreter.numberValueOf(this.params.number);
    return (ref = timers[number]) != null ? ref.behavior.resume() : void 0;
  };


  /**
  * Pauses Timer
  * @method commandPauseTimer
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPauseTimer = function() {
    var number, ref, timers;
    timers = SceneManager.scene.timers;
    number = this.interpreter.numberValueOf(this.params.number);
    return (ref = timers[number]) != null ? ref.behavior.pause() : void 0;
  };


  /**
  * Stop Timer
  * @method commandStopTimer
  * @protected
   */

  Component_CommandInterpreter.prototype.commandStopTimer = function() {
    var number, ref, timers;
    timers = SceneManager.scene.timers;
    number = this.interpreter.numberValueOf(this.params.number);
    return (ref = timers[number]) != null ? ref.behavior.stop() : void 0;
  };


  /**
  * Wait
  * @method commandWait
  * @protected
   */

  Component_CommandInterpreter.prototype.commandWait = function() {
    var time;
    time = this.interpreter.durationValueOf(this.params.time);
    if ((time != null) && time > 0 && !this.interpreter.previewData) {
      this.interpreter.waitCounter = time;
      return this.interpreter.isWaiting = true;
    }
  };


  /**
  * Loop
  * @method commandLoop
  * @protected
   */

  Component_CommandInterpreter.prototype.commandLoop = function() {
    this.interpreter.loops[this.interpreter.indent] = {
      pointer: this.interpreter.pointer,
      condition: function() {
        return true;
      }
    };
    return this.interpreter.indent++;
  };


  /**
  * For-Loop over lists
  * @method commandLoopForInList
  * @protected
   */

  Component_CommandInterpreter.prototype.commandLoopForInList = function() {
    if (!this.interpreter.loops[this.interpreter.indent]) {
      this.interpreter.loops[this.interpreter.indent] = new gs.ForLoopCommand(this.params, this.interpreter);
      if (this.interpreter.loops[this.interpreter.indent].condition()) {
        return this.interpreter.indent++;
      }
    } else {
      return this.interpreter.indent++;
    }
  };


  /**
  * Break Loop
  * @method commandBreakLoop
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBreakLoop = function() {
    var indent;
    indent = this.indent;
    while ((this.interpreter.loops[indent] == null) && indent > 0) {
      indent--;
    }
    this.interpreter.loops[indent] = null;
    return this.interpreter.indent = indent;
  };


  /**
  * @method commandListAdd
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListAdd = function() {
    var list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    switch (this.params.valueType) {
      case 0:
        list.push(this.interpreter.numberValueOf(this.params.numberValue));
        break;
      case 1:
        list.push(this.interpreter.booleanValueOf(this.params.switchValue));
        break;
      case 2:
        list.push(this.interpreter.stringValueOf(this.params.stringValue));
        break;
      case 3:
        list.push(this.interpreter.listObjectOf(this.params.listValue));
    }
    return this.interpreter.setListObjectTo(this.params.listVariable, list);
  };


  /**
  * @method commandListPop
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListPop = function() {
    var list, ref, value;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    value = (ref = list.pop()) != null ? ref : 0;
    return this.interpreter.storeListValue(this.params.targetVariable, list, value, this.params.valueType);
  };


  /**
  * @method commandListShift
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListShift = function() {
    var list, ref, value;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    value = (ref = list.shift()) != null ? ref : 0;
    return this.interpreter.storeListValue(this.params.targetVariable, list, value, this.params.valueType);
  };


  /**
  * @method commandListIndexOf
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListIndexOf = function() {
    var list, value;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    value = -1;
    switch (this.params.valueType) {
      case 0:
        value = list.indexOf(this.interpreter.numberValueOf(this.params.numberValue));
        break;
      case 1:
        value = list.indexOf(this.interpreter.booleanValueOf(this.params.switchValue));
        break;
      case 2:
        value = list.indexOf(this.interpreter.stringValueOf(this.params.stringValue));
        break;
      case 3:
        value = list.indexOf(this.interpreter.listObjectOf(this.params.listValue));
    }
    return this.interpreter.setNumberValueTo(this.params.targetVariable, value);
  };


  /**
  * @method commandListClear
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListClear = function() {
    var list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    return list.length = 0;
  };


  /**
  * @method commandListValueAt
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListValueAt = function() {
    var index, list, ref, value;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    index = this.interpreter.numberValueOf(this.params.index);
    if (index >= 0 && index < list.length) {
      value = (ref = list[index]) != null ? ref : 0;
      return this.interpreter.storeListValue(this.params.targetVariable, list, value, this.params.valueType);
    }
  };


  /**
  * @method commandListRemoveAt
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListRemoveAt = function() {
    var index, list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    index = this.interpreter.numberValueOf(this.params.index);
    if (index >= 0 && index < list.length) {
      return list.splice(index, 1);
    }
  };


  /**
  * @method commandListInsertAt
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListInsertAt = function() {
    var index, list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    index = this.interpreter.numberValueOf(this.params.index);
    if (index >= 0 && index < list.length) {
      switch (this.params.valueType) {
        case 0:
          list.splice(index, 0, this.interpreter.numberValueOf(this.params.numberValue));
          break;
        case 1:
          list.splice(index, 0, this.interpreter.booleanValueOf(this.params.switchValue));
          break;
        case 2:
          list.splice(index, 0, this.interpreter.stringValueOf(this.params.stringValue));
          break;
        case 3:
          list.splice(index, 0, this.interpreter.listObjectOf(this.params.listValue));
      }
      return this.interpreter.setListObjectTo(this.params.listVariable, list);
    }
  };


  /**
  * @method commandListSet
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListSet = function() {
    var index, list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    index = this.interpreter.numberValueOf(this.params.index);
    if (index >= 0) {
      switch (this.params.valueType) {
        case 0:
          list[index] = this.interpreter.numberValueOf(this.params.numberValue);
          break;
        case 1:
          list[index] = this.interpreter.booleanValueOf(this.params.switchValue);
          break;
        case 2:
          list[index] = this.interpreter.stringValueOf(this.params.stringValue);
          break;
        case 3:
          list[index] = this.interpreter.listObjectOf(this.params.listValue);
      }
      return this.interpreter.setListObjectTo(this.params.listVariable, list);
    }
  };


  /**
  * @method commandListCopy
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListCopy = function() {
    var copy, list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    copy = Object.deepCopy(list);
    return this.interpreter.setListObjectTo(this.params.targetVariable, copy);
  };


  /**
  * @method commandListLength
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListLength = function() {
    var list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    return this.interpreter.setNumberValueTo(this.params.targetVariable, list.length);
  };


  /**
  * @method commandListJoin
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListJoin = function() {
    var list, value;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    value = this.params.order === 0 ? list.join(this.params.separator || "") : list.reverse().join(this.params.separator || "");
    return this.interpreter.setStringValueTo(this.params.targetVariable, value);
  };


  /**
  * @method commandListFromText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListFromText = function() {
    var list, separator, text;
    text = this.interpreter.stringValueOf(this.params.textVariable);
    separator = this.interpreter.stringValueOf(this.params.separator);
    list = text.split(separator);
    return this.interpreter.setListObjectTo(this.params.targetVariable, list);
  };


  /**
  * @method commandListShuffle
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListShuffle = function() {
    var i, j, k, list, ref, results, tempi, tempj;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    if (list.length <= 1) {
      return;
    }
    results = [];
    for (i = k = ref = list.length - 1; ref <= 1 ? k <= 1 : k >= 1; i = ref <= 1 ? ++k : --k) {
      j = Math.floor(Math.random() * (i + 1));
      tempi = list[i];
      tempj = list[j];
      list[i] = tempj;
      results.push(list[j] = tempi);
    }
    return results;
  };


  /**
  * @method commandListSort
  * @protected
   */

  Component_CommandInterpreter.prototype.commandListSort = function() {
    var list;
    list = this.interpreter.listObjectOf(this.params.listVariable);
    if (list.length === 0) {
      return;
    }
    switch (this.params.sortOrder) {
      case 0:
        return list.sort(function(a, b) {
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
      case 1:
        return list.sort(function(a, b) {
          if (a > b) {
            return -1;
          }
          if (a < b) {
            return 1;
          }
          return 0;
        });
    }
  };


  /**
  * @method commandResetVariables
  * @protected
   */

  Component_CommandInterpreter.prototype.commandResetVariables = function() {
    var range;
    switch (this.params.target) {
      case 0:
        range = null;
        break;
      case 1:
        range = this.params.range;
    }
    switch (this.params.scope) {
      case 0:
        if (this.params.scene) {
          return GameManager.variableStore.clearLocalVariables({
            id: this.params.scene.uid
          }, this.params.type, range);
        }
        break;
      case 1:
        return GameManager.variableStore.clearLocalVariables(null, this.params.type, range);
      case 2:
        return GameManager.variableStore.clearGlobalVariables(this.params.type, range);
      case 3:
        GameManager.variableStore.clearPersistentVariables(this.params.type, range);
        return GameManager.saveGlobalData();
    }
  };


  /**
  * @method commandChangeVariableDomain
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeVariableDomain = function() {
    return GameManager.variableStore.changeDomain(this.interpreter.stringValueOf(this.params.domain));
  };


  /**
  * @method commandChangeDecimalVariables
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeDecimalVariables = function() {
    return this.interpreter.changeDecimalVariables(this.params, this.params.roundMethod);
  };


  /**
  * @method commandChangeNumberVariables
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeNumberVariables = function() {
    var diff, end, i, index, k, ref, ref1, scope, source, start;
    source = 0;
    switch (this.params.source) {
      case 0:
        source = this.interpreter.numberValueOf(this.params.sourceValue);
        break;
      case 1:
        start = this.interpreter.numberValueOf(this.params.sourceRandom.start);
        end = this.interpreter.numberValueOf(this.params.sourceRandom.end);
        diff = end - start;
        source = Math.floor(start + Math.random() * (diff + 1));
        break;
      case 2:
        source = this.interpreter.numberValueAtIndex(this.params.sourceScope, this.interpreter.numberValueOf(this.params.sourceReference) - 1, this.params.sourceReferenceDomain);
        break;
      case 3:
        source = this.interpreter.numberValueOfGameData(this.params.sourceValue1);
        break;
      case 4:
        source = this.interpreter.numberValueOfDatabaseData(this.params.sourceValue1);
    }
    switch (this.params.target) {
      case 0:
        switch (this.params.operation) {
          case 0:
            this.interpreter.setNumberValueTo(this.params.targetVariable, source);
            break;
          case 1:
            this.interpreter.setNumberValueTo(this.params.targetVariable, this.interpreter.numberValueOf(this.params.targetVariable) + source);
            break;
          case 2:
            this.interpreter.setNumberValueTo(this.params.targetVariable, this.interpreter.numberValueOf(this.params.targetVariable) - source);
            break;
          case 3:
            this.interpreter.setNumberValueTo(this.params.targetVariable, this.interpreter.numberValueOf(this.params.targetVariable) * source);
            break;
          case 4:
            this.interpreter.setNumberValueTo(this.params.targetVariable, Math.floor(this.interpreter.numberValueOf(this.params.targetVariable) / source));
            break;
          case 5:
            this.interpreter.setNumberValueTo(this.params.targetVariable, this.interpreter.numberValueOf(this.params.targetVariable) % source);
        }
        break;
      case 1:
        scope = this.params.targetScope;
        start = this.params.targetRange.start - 1;
        end = this.params.targetRange.end - 1;
        for (i = k = ref = start, ref1 = end; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
          switch (this.params.operation) {
            case 0:
              this.interpreter.setNumberValueAtIndex(scope, i, source);
              break;
            case 1:
              this.interpreter.setNumberValueAtIndex(scope, i, this.interpreter.numberValueAtIndex(scope, i) + source);
              break;
            case 2:
              this.interpreter.setNumberValueAtIndex(scope, i, this.interpreter.numberValueAtIndex(scope, i) - source);
              break;
            case 3:
              this.interpreter.setNumberValueAtIndex(scope, i, this.interpreter.numberValueAtIndex(scope, i) * source);
              break;
            case 4:
              this.interpreter.setNumberValueAtIndex(scope, i, Math.floor(this.interpreter.numberValueAtIndex(scope, i) / source));
              break;
            case 5:
              this.interpreter.setNumberValueAtIndex(scope, i, this.interpreter.numberValueAtIndex(scope, i) % source);
          }
        }
        break;
      case 2:
        index = this.interpreter.numberValueOf(this.params.targetReference) - 1;
        switch (this.params.operation) {
          case 0:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, source, this.params.targetReferenceDomain);
            break;
          case 1:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, this.interpreter.numberValueAtIndex(this.params.targetScope, index, this.params.targetReferenceDomain) + source, this.params.targetReferenceDomain);
            break;
          case 2:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, this.interpreter.numberValueAtIndex(this.params.targetScope, index, this.params.targetReferenceDomain) - source, this.params.targetReferenceDomain);
            break;
          case 3:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, this.interpreter.numberValueAtIndex(this.params.targetScope, index, this.params.targetReferenceDomain) * source, this.params.targetReferenceDomain);
            break;
          case 4:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, Math.floor(this.interpreter.numberValueAtIndex(this.params.targetScope, index, this.params.targetReferenceDomain) / source), this.params.targetReferenceDomain);
            break;
          case 5:
            this.interpreter.setNumberValueAtIndex(this.params.targetScope, index, this.interpreter.numberValueAtIndex(this.params.targetScope, index, this.params.targetReferenceDomain) % source, this.params.targetReferenceDomain);
        }
    }
    return null;
  };


  /**
  * @method commandChangeBooleanVariables
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeBooleanVariables = function() {
    var i, index, k, ref, ref1, source, targetValue, variable;
    source = this.interpreter.booleanValueOf(this.params.value);
    switch (this.params.target) {
      case 0:
        if (this.params.value === 2) {
          targetValue = this.interpreter.booleanValueOf(this.params.targetVariable);
          this.interpreter.setBooleanValueTo(this.params.targetVariable, targetValue ? false : true);
        } else {
          this.interpreter.setBooleanValueTo(this.params.targetVariable, source);
        }
        break;
      case 1:
        variable = {
          index: 0,
          scope: this.params.targetRangeScope
        };
        for (i = k = ref = this.params.rangeStart - 1, ref1 = this.params.rangeEnd - 1; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
          variable.index = i;
          if (this.params.value === 2) {
            targetValue = this.interpreter.booleanValueOf(variable);
            this.interpreter.setBooleanValueTo(variable, targetValue ? false : true);
          } else {
            this.interpreter.setBooleanValueTo(variable, source);
          }
        }
        break;
      case 2:
        index = this.interpreter.numberValueOf(this.params.targetReference) - 1;
        this.interpreter.setBooleanValueAtIndex(this.params.targetRangeScope, index, source, this.params.targetReferenceDomain);
    }
    return null;
  };


  /**
  * @method commandChangeStringVariables
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeStringVariables = function() {
    var ex, i, index, k, ref, ref1, source, targetValue, variable;
    source = "";
    switch (this.params.source) {
      case 0:
        source = lcs(this.params.textValue);
        break;
      case 1:
        source = this.interpreter.stringValueOf(this.params.sourceVariable);
        break;
      case 2:
        source = this.interpreter.stringValueOfDatabaseData(this.params.databaseData);
        break;
      case 2:
        try {
          source = eval(this.params.script);
        } catch (error) {
          ex = error;
          source = "ERR: " + ex.message;
        }
        break;
      default:
        source = lcs(this.params.textValue);
    }
    switch (this.params.target) {
      case 0:
        switch (this.params.operation) {
          case 0:
            this.interpreter.setStringValueTo(this.params.targetVariable, source);
            break;
          case 1:
            this.interpreter.setStringValueTo(this.params.targetVariable, this.interpreter.stringValueOf(this.params.targetVariable) + source);
            break;
          case 2:
            this.interpreter.setStringValueTo(this.params.targetVariable, this.interpreter.stringValueOf(this.params.targetVariable).toUpperCase());
            break;
          case 3:
            this.interpreter.setStringValueTo(this.params.targetVariable, this.interpreter.stringValueOf(this.params.targetVariable).toLowerCase());
        }
        break;
      case 1:
        variable = {
          index: 0,
          scope: this.params.targetRangeScope
        };
        for (i = k = ref = this.params.rangeStart - 1, ref1 = this.params.rangeEnd - 1; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
          variable.index = i;
          switch (this.params.operation) {
            case 0:
              this.interpreter.setStringValueTo(variable, source);
              break;
            case 1:
              this.interpreter.setStringValueTo(variable, this.interpreter.stringValueOf(variable) + source);
              break;
            case 2:
              this.interpreter.setStringValueTo(variable, this.interpreter.stringValueOf(variable).toUpperCase());
              break;
            case 3:
              this.interpreter.setStringValueTo(variable, this.interpreter.stringValueOf(variable).toLowerCase());
          }
        }
        break;
      case 2:
        index = this.interpreter.numberValueOf(this.params.targetReference) - 1;
        switch (this.params.operation) {
          case 0:
            this.interpreter.setStringValueAtIndex(this.params.targetRangeScope, index, source, this.params.targetReferenceDomain);
            break;
          case 1:
            targetValue = this.interpreter.stringValueAtIndex(this.params.targetRangeScope, index, this.params.targetReferenceDomain);
            this.interpreter.setStringValueAtIndex(this.params.targetRangeScope, index, targetValue + source, this.params.targetReferenceDomain);
            break;
          case 2:
            targetValue = this.interpreter.stringValueAtIndex(this.params.targetRangeScope, index, this.params.targetReferenceDomain);
            this.interpreter.setStringValueAtIndex(this.params.targetRangeScope, index, targetValue.toUpperCase(), this.params.targetReferenceDomain);
            break;
          case 3:
            targetValue = this.interpreter.stringValueAtIndex(this.params.targetRangeScope, index, this.params.targetReferenceDomain);
            this.interpreter.setStringValueTo(this.params.targetRangeScope, index, targetValue.toLowerCase(), this.params.targetReferenceDomain);
        }
    }
    return null;
  };


  /**
  * @method commandCheckSwitch
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCheckSwitch = function() {
    var result;
    result = this.interpreter.booleanValueOf(this.params.targetVariable) && this.params.value;
    if (result) {
      return this.interpreter.pointer = this.params.labelIndex;
    }
  };


  /**
  * @method commandNumberCondition
  * @protected
   */

  Component_CommandInterpreter.prototype.commandNumberCondition = function() {
    var result;
    result = this.interpreter.compare(this.interpreter.numberValueOf(this.params.targetVariable), this.interpreter.numberValueOf(this.params.value), this.params.operation);
    this.interpreter.conditions[this.interpreter.indent] = result;
    if (result) {
      return this.interpreter.indent++;
    }
  };


  /**
  * @method commandCondition
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCondition = function() {
    var result;
    switch (this.params.valueType) {
      case 0:
        result = this.interpreter.compare(this.interpreter.numberValueOf(this.params.variable), this.interpreter.numberValueOf(this.params.numberValue), this.params.operation);
        break;
      case 1:
        result = this.interpreter.compare(this.interpreter.booleanValueOf(this.params.variable), this.interpreter.booleanValueOf(this.params.switchValue), this.params.operation);
        break;
      case 2:
        result = this.interpreter.compare(lcs(this.interpreter.stringValueOf(this.params.variable)), lcs(this.interpreter.stringValueOf(this.params.textValue)), this.params.operation);
    }
    this.interpreter.conditions[this.interpreter.indent] = result;
    if (result) {
      return this.interpreter.indent++;
    }
  };


  /**
  * @method commandConditionElse
  * @protected
   */

  Component_CommandInterpreter.prototype.commandConditionElse = function() {
    if (!this.interpreter.conditions[this.interpreter.indent]) {
      return this.interpreter.indent++;
    }
  };


  /**
  * @method commandConditionElseIf
  * @protected
   */

  Component_CommandInterpreter.prototype.commandConditionElseIf = function() {
    if (!this.interpreter.conditions[this.interpreter.indent]) {
      return this.interpreter.commandCondition.call(this);
    }
  };


  /**
  * @method commandCheckNumberVariable
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCheckNumberVariable = function() {
    var result;
    result = this.interpreter.compare(this.interpreter.numberValueOf(this.params.targetVariable), this.interpreter.numberValueOf(this.params.value), this.params.operation);
    if (result) {
      return this.interpreter.pointer = this.params.labelIndex;
    }
  };


  /**
  * @method commandCheckTextVariable
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCheckTextVariable = function() {
    var result, text1, text2;
    result = false;
    text1 = this.interpreter.stringValueOf(this.params.targetVariable);
    text2 = this.interpreter.stringValueOf(this.params.value);
    switch (this.params.operation) {
      case 0:
        result = text1 === text2;
        break;
      case 1:
        result = text1 !== text2;
        break;
      case 2:
        result = text1.length > text2.length;
        break;
      case 3:
        result = text1.length >= text2.length;
        break;
      case 4:
        result = text1.length < text2.length;
        break;
      case 5:
        result = text1.length <= text2.length;
    }
    if (result) {
      return this.interpreter.pointer = this.params.labelIndex;
    }
  };


  /**
  * @method commandLabel
  * @protected
   */

  Component_CommandInterpreter.prototype.commandLabel = function() {};


  /**
  * @method commandJumpToLabel
  * @protected
   */

  Component_CommandInterpreter.prototype.commandJumpToLabel = function() {
    var label;
    label = this.params.labelIndex;
    if (label != null) {
      this.interpreter.pointer = label;
      return this.interpreter.indent = this.interpreter.object.commands[label].indent;
    } else {
      switch (this.params.target) {
        case "activeContext":
          return this.interpreter.jumpToLabel(this.interpreter.stringValueOf(this.params.name));
        case "activeScene":
          return SceneManager.scene.interpreter.jumpToLabel(this.interpreter.stringValueOf(this.params.name));
        default:
          return this.interpreter.jumpToLabel(this.interpreter.stringValueOf(this.params.name));
      }
    }
  };


  /**
  * @method commandClearMessage
  * @protected
   */

  Component_CommandInterpreter.prototype.commandClearMessage = function() {
    var duration, fading, flags, isLocked, messageObject, scene;
    scene = SceneManager.scene;
    messageObject = this.interpreter.targetMessage();
    if (messageObject == null) {
      return;
    }
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    duration = 0;
    fading = GameManager.tempSettings.messageFading;
    if (!GameManager.tempSettings.skip) {
      duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : fading.duration;
    }
    messageObject.animator.disappear(fading.animation, fading.easing, duration, gs.CallBack("onMessageADVClear", this.interpreter));
    this.interpreter.waitForCompletion(messageObject, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMessageBoxDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMessageBoxDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.messageBox;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      return defaults.disappearAnimation = this.params.disappearAnimation;
    }
  };


  /**
  * @method commandShowMessage
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowMessage = function() {
    var animation, character, defaults, duration, easing, expression, ref, scene, showMessage;
    scene = SceneManager.scene;
    scene.messageMode = vn.MessageMode.ADV;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    showMessage = (function(_this) {
      return function() {
        var messageObject, ref, settings, voiceSettings;
        character = RecordManager.characters[_this.params.characterId];
        scene.layout.visible = true;
        messageObject = _this.interpreter.targetMessage();
        if (messageObject == null) {
          return;
        }
        scene.currentCharacter = character;
        messageObject.character = character;
        messageObject.opacity = 255;
        messageObject.events.offByOwner("callCommonEvent", _this.interpreter);
        messageObject.events.on("callCommonEvent", gs.CallBack("onCallCommonEvent", _this.interpreter), {
          params: _this.params
        }, _this.interpreter);
        messageObject.events.once("finish", gs.CallBack("onMessageADVFinish", _this.interpreter), {
          params: _this.params
        }, _this.interpreter);
        messageObject.events.once("waiting", gs.CallBack("onMessageADVWaiting", _this.interpreter), {
          params: _this.params
        }, _this.interpreter);
        if (messageObject.settings.useCharacterColor) {
          messageObject.message.showMessage(_this.interpreter, _this.params, character);
        } else {
          messageObject.message.showMessage(_this.interpreter, _this.params);
        }
        settings = GameManager.settings;
        voiceSettings = settings.voicesByCharacter[character.index];
        if ((_this.params.voice != null) && GameManager.settings.voiceEnabled && (!voiceSettings || voiceSettings > 0)) {
          if ((GameManager.settings.skipVoiceOnAction || !((ref = AudioManager.voice) != null ? ref.playing : void 0)) && !GameManager.tempSettings.skip) {
            messageObject.voice = _this.params.voice;
            return messageObject.behavior.voice = AudioManager.playVoice(_this.params.voice);
          }
        } else {
          AudioManager.voice = null;
          return messageObject.behavior.voice = null;
        }
      };
    })(this);
    if ((this.params.expressionId != null) && (character != null)) {
      expression = RecordManager.characterExpressions[this.params.expressionId || 0];
      defaults = GameManager.defaults.character;
      duration = !gs.CommandFieldFlags.isLocked(this.params.fieldFlags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.expressionDuration;
      easing = gs.Easings.fromObject(defaults.changeEasing);
      animation = defaults.changeAnimation;
      character.behavior.changeExpression(expression, animation, easing, duration, (function(_this) {
        return function() {
          return showMessage();
        };
      })(this));
    } else {
      showMessage();
    }
    this.interpreter.isWaiting = ((ref = this.params.waitForCompletion) != null ? ref : true) && !(GameManager.tempSettings.skip && GameManager.tempSettings.skipTime === 0);
    return this.interpreter.waitingFor.messageADV = this.params;
  };


  /**
  * @method commandSetMessageArea
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSetMessageArea = function() {
    var messageLayout, number, scene;
    scene = SceneManager.scene;
    number = this.interpreter.numberValueOf(this.params.number);
    if (scene.messageAreas[number]) {
      messageLayout = scene.messageAreas[number].layout;
      messageLayout.dstRect.x = this.params.box.x;
      messageLayout.dstRect.y = this.params.box.y;
      messageLayout.dstRect.width = this.params.box.size.width;
      messageLayout.dstRect.height = this.params.box.size.height;
      return messageLayout.needsUpdate = true;
    }
  };


  /**
  * @method commandMessageFading
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMessageFading = function() {
    return GameManager.tempSettings.messageFading = {
      duration: this.interpreter.durationValueOf(this.params.duration),
      animation: this.params.animation,
      easing: gs.Easings.fromObject(this.params.easing)
    };
  };


  /**
  * @method commandMessageSettings
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMessageSettings = function() {
    var flags, font, fontName, fontSize, isLocked, messageObject, messageSettings, ref, ref1, ref2, ref3, ref4, ref5;
    messageObject = this.interpreter.targetMessage();
    if (!messageObject) {
      return;
    }
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    messageSettings = this.interpreter.messageSettings();
    if (!isLocked(flags.autoErase)) {
      messageSettings.autoErase = this.params.autoErase;
    }
    if (!isLocked(flags.waitAtEnd)) {
      messageSettings.waitAtEnd = this.params.waitAtEnd;
    }
    if (!isLocked(flags.backlog)) {
      messageSettings.backlog = this.params.backlog;
    }
    if (!isLocked(flags.lineAlignment)) {
      messageSettings.lineAlignment = this.params.lineAlignment;
    }
    if (!isLocked(flags.lineHeight)) {
      messageSettings.lineHeight = this.params.lineHeight;
    }
    if (!isLocked(flags.lineSpacing)) {
      messageSettings.lineSpacing = this.params.lineSpacing;
    }
    if (!isLocked(flags.linePadding)) {
      messageSettings.linePadding = this.params.linePadding;
    }
    if (!isLocked(flags.paragraphSpacing)) {
      messageSettings.paragraphSpacing = this.params.paragraphSpacing;
    }
    if (!isLocked(flags.useCharacterColor)) {
      messageSettings.useCharacterColor = this.params.useCharacterColor;
    }
    messageObject.textRenderer.minLineHeight = (ref = messageSettings.lineHeight) != null ? ref : 0;
    messageObject.textRenderer.lineSpacing = (ref1 = messageSettings.lineSpacing) != null ? ref1 : messageObject.textRenderer.lineSpacing;
    messageObject.textRenderer.padding = (ref2 = messageSettings.linePadding) != null ? ref2 : messageObject.textRenderer.padding;
    fontName = !isLocked(flags.font) ? this.interpreter.stringValueOf(this.params.font) : messageObject.font.name;
    fontSize = !isLocked(flags.size) ? this.interpreter.numberValueOf(this.params.size) : messageObject.font.size;
    font = messageObject.font;
    if (!isLocked(flags.font) || !isLocked(flags.size)) {
      messageObject.font = new Font(fontName, fontSize);
    }
    if (!isLocked(flags.bold)) {
      messageObject.font.bold = this.params.bold;
    }
    if (!isLocked(flags.italic)) {
      messageObject.font.italic = this.params.italic;
    }
    if (!isLocked(flags.smallCaps)) {
      messageObject.font.smallCaps = this.params.smallCaps;
    }
    if (!isLocked(flags.underline)) {
      messageObject.font.underline = this.params.underline;
    }
    if (!isLocked(flags.strikeThrough)) {
      messageObject.font.strikeThrough = this.params.strikeThrough;
    }
    if (!isLocked(flags.color)) {
      messageObject.font.color = new Color(this.params.color);
    }
    messageObject.font.color = (flags.color != null) && !isLocked(flags.color) ? new Color(this.params.color) : font.color;
    messageObject.font.border = (flags.outline != null) && !isLocked(flags.outline) ? this.params.outline : font.border;
    messageObject.font.borderColor = (flags.outlineColor != null) && !isLocked(flags.outlineColor) ? new Color(this.params.outlineColor) : new Color(font.borderColor);
    messageObject.font.borderSize = (flags.outlineSize != null) && !isLocked(flags.outlineSize) ? (ref3 = this.params.outlineSize) != null ? ref3 : 4 : font.borderSize;
    messageObject.font.shadow = (flags.shadow != null) && !isLocked(flags.shadow) ? this.params.shadow : font.shadow;
    messageObject.font.shadowColor = (flags.shadowColor != null) && !isLocked(flags.shadowColor) ? new Color(this.params.shadowColor) : new Color(font.shadowColor);
    messageObject.font.shadowOffsetX = (flags.shadowOffsetX != null) && !isLocked(flags.shadowOffsetX) ? (ref4 = this.params.shadowOffsetX) != null ? ref4 : 1 : font.shadowOffsetX;
    messageObject.font.shadowOffsetY = (flags.shadowOffsetY != null) && !isLocked(flags.shadowOffsetY) ? (ref5 = this.params.shadowOffsetY) != null ? ref5 : 1 : font.shadowOffsetY;
    if (isLocked(flags.bold)) {
      messageObject.font.bold = font.bold;
    }
    if (isLocked(flags.italic)) {
      messageObject.font.italic = font.italic;
    }
    if (isLocked(flags.smallCaps)) {
      return messageObject.font.smallCaps = font.smallCaps;
    }
  };


  /**
  * @method commandCreateMessageArea
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCreateMessageArea = function() {
    var messageArea, number, scene;
    number = this.interpreter.numberValueOf(this.params.number);
    scene = SceneManager.scene;
    scene.behavior.changeMessageAreaDomain(this.params.numberDomain);
    if (!scene.messageAreas[number]) {
      messageArea = new gs.Object_MessageArea();
      messageArea.layout = ui.UIManager.createControlFromDescriptor({
        type: "ui.CustomGameMessage",
        id: "customGameMessage_" + number,
        params: {
          id: "customGameMessage_" + number
        }
      }, messageArea);
      messageArea.message = gs.ObjectManager.current.objectById("customGameMessage_" + number + "_message");
      messageArea.message.domain = this.params.numberDomain;
      messageArea.addObject(messageArea.layout);
      messageArea.layout.dstRect.x = this.params.box.x;
      messageArea.layout.dstRect.y = this.params.box.y;
      messageArea.layout.dstRect.width = this.params.box.size.width;
      messageArea.layout.dstRect.height = this.params.box.size.height;
      messageArea.layout.needsUpdate = true;
      return scene.messageAreas[number] = messageArea;
    }
  };


  /**
  * @method commandEraseMessageArea
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEraseMessageArea = function() {
    var area, number, scene;
    number = this.interpreter.numberValueOf(this.params.number);
    scene = SceneManager.scene;
    scene.behavior.changeMessageAreaDomain(this.params.numberDomain);
    area = scene.messageAreas[number];
    if (area != null) {
      area.layout.dispose();
    }
    return scene.messageAreas[number] = null;
  };


  /**
  * @method commandSetTargetMessage
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSetTargetMessage = function() {
    var message, ref, ref1, scene, target;
    message = this.interpreter.targetMessage();
    if (message != null) {
      message.textRenderer.isWaiting = false;
    }
    if (message != null) {
      message.behavior.isWaiting = false;
    }
    scene = SceneManager.scene;
    scene.behavior.changeMessageAreaDomain(this.params.numberDomain);
    target = {
      type: this.params.type,
      id: null
    };
    switch (this.params.type) {
      case 0:
        target.id = this.params.id;
        break;
      case 1:
        target.id = this.interpreter.numberValueOf(this.params.number);
    }
    this.interpreter.settings.message.target = target;
    if (this.params.clear) {
      if ((ref = this.interpreter.targetMessage()) != null) {
        ref.behavior.clear();
      }
    }
    return (ref1 = this.interpreter.targetMessage()) != null ? ref1.visible = true : void 0;
  };


  /**
  * @method commandBacklogVisibility
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBacklogVisibility = function() {
    var control;
    if (this.params.visible) {
      control = gs.ObjectManager.current.objectById("backlogBox");
      if (control == null) {
        control = gs.ObjectManager.current.objectById("backlog");
      }
      if (control != null) {
        control.dispose();
      }
      if (this.params.backgroundVisible) {
        return control = SceneManager.scene.behavior.createControl(this, {
          descriptor: "ui.MessageBacklogBox"
        });
      } else {
        return control = SceneManager.scene.behavior.createControl(this, {
          descriptor: "ui.MessageBacklog"
        });
      }
    } else {
      control = gs.ObjectManager.current.objectById("backlogBox");
      if (control == null) {
        control = gs.ObjectManager.current.objectById("backlog");
      }
      if (control == null) {
        control = gs.ObjectManager.current.objectById("backlogScrollView");
      }
      return control != null ? control.dispose() : void 0;
    }
  };


  /**
  * @method commandMessageVisibility
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMessageVisibility = function() {
    var animation, defaults, duration, easing, flags, isLocked, message;
    defaults = GameManager.defaults.messageBox;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    message = this.interpreter.targetMessage();
    if ((message == null) || this.params.visible === message.visible) {
      return;
    }
    if (this.params.visible) {
      duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
      easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.appearEasing);
      animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
      message.animator.appear(message.dstRect.x, message.dstRect.y, this.params.animation, easing, duration);
    } else {
      duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
      easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.disappearEasing);
      animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
      message.animator.disappear(animation, easing, duration, function() {
        return message.visible = false;
      });
    }
    message.update();
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMessageBoxVisibility
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMessageBoxVisibility = function() {
    var animation, defaults, duration, easing, flags, isLocked, messageBox, visible;
    defaults = GameManager.defaults.messageBox;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    messageBox = this.interpreter.messageBoxObject(this.interpreter.stringValueOf(this.params.id));
    visible = this.params.visible === 1;
    if ((messageBox == null) || visible === messageBox.visible) {
      return;
    }
    if (this.params.visible) {
      duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
      easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.appearEasing);
      animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
      messageBox.animator.appear(messageBox.dstRect.x, messageBox.dstRect.y, animation, easing, duration);
    } else {
      duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
      easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.disappearEasing);
      animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
      messageBox.animator.disappear(animation, easing, duration, function() {
        return messageBox.visible = false;
      });
    }
    messageBox.update();
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandUIAccess
  * @protected
   */

  Component_CommandInterpreter.prototype.commandUIAccess = function() {
    var flags, isLocked;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.generalMenu)) {
      GameManager.tempSettings.menuAccess = this.interpreter.booleanValueOf(this.params.generalMenu);
    }
    if (!isLocked(flags.saveMenu)) {
      GameManager.tempSettings.saveMenuAccess = this.interpreter.booleanValueOf(this.params.saveMenu);
    }
    if (!isLocked(flags.loadMenu)) {
      GameManager.tempSettings.loadMenuAccess = this.interpreter.booleanValueOf(this.params.loadMenu);
    }
    if (!isLocked(flags.backlog)) {
      return GameManager.tempSettings.backlogAccess = this.interpreter.booleanValueOf(this.params.backlog);
    }
  };


  /**
  * @method commandUnlockCG
  * @protected
   */

  Component_CommandInterpreter.prototype.commandUnlockCG = function() {
    var cg;
    cg = RecordManager.cgGallery[this.interpreter.stringValueOf(this.params.cgId)];
    if (cg != null) {
      GameManager.globalData.cgGallery[cg.index] = {
        unlocked: true
      };
      return GameManager.saveGlobalData();
    }
  };


  /**
  * @method commandSetInputSession
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSetInputSession = function() {
    var ref;
    return (ref = gs.ObjectManager.current) != null ? ref.setModalSession(this.interpreter.numberValueOf(this.params.inputSession)) : void 0;
  };


  /**
  * @method commandL2DMove
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DMove = function() {
    var character, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!(character instanceof vn.Object_Live2DCharacter)) {
      return;
    }
    this.interpreter.moveObject(character, this.params.position, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DMotionGroup
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DMotionGroup = function() {
    var character, motions, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!(character instanceof vn.Object_Live2DCharacter)) {
      return;
    }
    character.motionGroup = {
      name: this.params.data.motionGroup,
      loop: this.params.loop,
      playType: this.params.playType
    };
    if (this.params.waitForCompletion && !this.params.loop) {
      motions = character.model.motionsByGroup[character.motionGroup.name];
      if (motions != null) {
        this.interpreter.isWaiting = true;
        this.interpreter.waitCounter = motions.sum(function(m) {
          return m.getDurationMSec() / 16.6;
        });
      }
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DMotion
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DMotion = function() {
    var character, defaults, fadeInTime, flags, isLocked, motion, scene;
    defaults = GameManager.defaults.live2d;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!(character instanceof vn.Object_Live2DCharacter)) {
      return;
    }
    fadeInTime = !isLocked(flags.fadeInTime) ? this.params.fadeInTime : null;
    character.motion = {
      name: this.params.data.motion,
      fadeInTime: fadeInTime,
      loop: this.params.loop
    };
    character.motionGroup = null;
    if (this.params.waitForCompletion && !this.params.loop) {
      motion = character.model.motions[character.motion.name];
      if (motion != null) {
        this.interpreter.isWaiting = true;
        this.interpreter.waitCounter = motion.getDurationMSec() / 16.6;
      }
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DExpression
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DExpression = function() {
    var character, defaults, fadeInTime, flags, isLocked, scene;
    defaults = GameManager.defaults.live2d;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!(character instanceof vn.Object_Live2DCharacter)) {
      return;
    }
    fadeInTime = !isLocked(flags.fadeInTime) ? this.params.fadeInTime : defaults.expressionFadeInTime;
    character.expression = {
      name: this.params.data.expression,
      fadeInTime: fadeInTime
    };
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DExitScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DExitScene = function() {
    var defaults;
    defaults = GameManager.defaults.live2d;
    this.interpreter.commandCharacterExitScene.call(this, defaults);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DSettings
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DSettings = function() {
    var character, flags, isLocked, scene;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!(character != null ? character.visual.l2dObject : void 0)) {
      return;
    }
    if (!isLocked(flags.lipSyncSensitivity)) {
      character.visual.l2dObject.lipSyncSensitivity = this.interpreter.numberValueOf(this.params.lipSyncSensitivity);
    }
    if (!isLocked(flags.idleIntensity)) {
      character.visual.l2dObject.idleIntensity = this.interpreter.numberValueOf(this.params.idleIntensity);
    }
    if (!isLocked(flags.breathIntensity)) {
      character.visual.l2dObject.breathIntensity = this.interpreter.numberValueOf(this.params.breathIntensity);
    }
    if (!isLocked(flags["eyeBlink.enabled"])) {
      character.visual.l2dObject.setEyeBlinkEnabled(this.params.eyeBlink.enabled);
    }
    if (!isLocked(flags["eyeBlink.interval"])) {
      character.visual.l2dObject.setEyeBlinkInterval(this.interpreter.numberValueOf(this.params.eyeBlink.interval));
    }
    if (!isLocked(flags["eyeBlink.closedMotionTime"])) {
      character.visual.l2dObject.setEyeBlinkClosedMotionTime(this.interpreter.numberValueOf(this.params.eyeBlink.closedMotionTime));
    }
    if (!isLocked(flags["eyeBlink.closingMotionTime"])) {
      character.visual.l2dObject.setEyeBlinkClosingMotionTime(this.interpreter.numberValueOf(this.params.eyeBlink.closingMotionTime));
    }
    if (!isLocked(flags["eyeBlink.openingMotionTime"])) {
      character.visual.l2dObject.setEyeBlinkOpeningMotionTime(this.interpreter.numberValueOf(this.params.eyeBlink.openingMotionTime));
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DParameter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DParameter = function() {
    var character, duration, easing, scene;
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === _this.params.characterId;
      };
    })(this));
    if (!(character instanceof vn.Object_Live2DCharacter) || (character == null)) {
      return;
    }
    easing = gs.Easings.fromObject(this.params.easing);
    duration = this.interpreter.durationValueOf(this.params.duration);
    character.animator.l2dParameterTo(this.interpreter.stringValueOf(this.params.param.name), this.interpreter.numberValueOf(this.params.param.value), duration, easing);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.live2d;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags.motionFadeInTime)) {
      defaults.motionFadeInTime = this.interpreter.numberValueOf(this.params.motionFadeInTime);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      defaults.disappearAnimation = this.params.disappearAnimation;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandL2DJoinScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandL2DJoinScene = function() {
    var animation, character, defaults, duration, easing, flags, instant, isLocked, motionBlur, noAnim, origin, p, record, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, scene, x, y, zIndex;
    defaults = GameManager.defaults.live2d;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    record = RecordManager.characters[this.interpreter.stringValueOf(this.params.characterId)];
    if (!record || scene.characters.first(function(v) {
      return !v.disposed && v.rid === record.index;
    })) {
      return;
    }
    if (this.params.positionType === 1) {
      x = this.params.position.x;
      y = this.params.position.y;
    } else if (this.params.positionType === 2) {
      x = this.interpreter.numberValueOf(this.params.position.x);
      y = this.interpreter.numberValueOf(this.params.position.y);
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : defaults.zOrder;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    motionBlur = !isLocked(flags["motionBlur.enabled"]) ? this.params.motionBlur : defaults.motionBlur;
    origin = !isLocked(flags.origin) ? this.params.origin : defaults.origin;
    instant = duration === 0 || this.interpreter.isInstantSkip();
    noAnim = duration === 0 || GameManager.tempSettings.skip;
    if (this.params.waitForCompletion && !instant) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    if (!((ref = this.params.model) != null ? ref.name : void 0)) {
      return;
    }
    character = new vn.Object_Live2DCharacter(record);
    character.modelName = ((ref1 = this.params.model) != null ? ref1.name : void 0) || "";
    character.modelFolder = ((ref2 = this.params.model) != null ? ref2.folderPath : void 0) || "Live2D";
    character.model = ResourceManager.getLive2DModel(((ref3 = character.modelFolder) != null ? ref3 : "Live2D") + "/" + character.modelName);
    if (character.model.motions) {
      character.motion = {
        name: "",
        fadeInTime: 0,
        loop: true
      };
    }
    character.dstRect.x = x;
    character.dstRect.y = y;
    character.anchor.x = !origin ? 0 : 0.5;
    character.anchor.y = !origin ? 0 : 0.5;
    character.blendMode = this.interpreter.numberValueOf(this.params.blendMode);
    character.zoom.x = this.params.position.zoom.d;
    character.zoom.y = this.params.position.zoom.d;
    character.zIndex = zIndex || 200;
    if ((ref4 = character.model) != null) {
      ref4.reset();
    }
    character.setup();
    character.visual.l2dObject.idleIntensity = (ref5 = record.idleIntensity) != null ? ref5 : 1.0;
    character.visual.l2dObject.breathIntensity = (ref6 = record.breathIntensity) != null ? ref6 : 1.0;
    character.visual.l2dObject.lipSyncSensitivity = (ref7 = record.lipSyncSensitivity) != null ? ref7 : 1.0;
    character.update();
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, character, this.params);
      character.dstRect.x = p.x;
      character.dstRect.y = p.y;
    }
    scene.behavior.addCharacter(character, noAnim, {
      animation: animation,
      duration: duration,
      easing: easing,
      motionBlur: motionBlur
    });
    if (((ref8 = this.params.viewport) != null ? ref8.type : void 0) === "ui") {
      character.viewport = Graphics.viewport;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCharacterJoinScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterJoinScene = function() {
    var angle, animation, bitmap, character, characterId, defaults, duration, easing, expressionId, flags, instant, isLocked, mirror, motionBlur, noAnim, origin, p, record, ref, ref1, ref2, ref3, ref4, ref5, scene, x, y, zIndex, zoom;
    defaults = GameManager.defaults.character;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    expressionId = this.interpreter.stringValueOf(this.params.expressionId) || this.params.expressionId;
    record = RecordManager.characters[characterId];
    if (!record || scene.characters.first(function(v) {
      return !v.disposed && v.rid === record.index && !v.disposed;
    })) {
      return;
    }
    character = new vn.Object_Character(record, null, scene);
    character.expression = RecordManager.characterExpressions[(expressionId != null ? expressionId : record.defaultExpressionId) || 0];
    if ((ref = character.expression) != null ? (ref1 = ref.idle[0]) != null ? ref1.resource.name : void 0 : void 0) {
      bitmap = ResourceManager.getBitmap(ResourceManager.getPath(character.expression.idle[0].resource));
      character.imageFolder = character.expression.idle[0].resource.folderPath;
    }
    mirror = false;
    angle = 0;
    zoom = 1;
    if (this.params.positionType === 1) {
      x = this.interpreter.numberValueOf(this.params.position.x);
      y = this.interpreter.numberValueOf(this.params.position.y);
      mirror = this.params.position.horizontalFlip;
      angle = this.params.position.angle || 0;
      zoom = ((ref2 = this.params.position.data) != null ? ref2.zoom : void 0) || 1;
    } else if (this.params.positionType === 2) {
      x = this.interpreter.numberValueOf(this.params.position.x);
      y = this.interpreter.numberValueOf(this.params.position.y);
      mirror = false;
      angle = 0;
      zoom = 1;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    origin = !isLocked(flags.origin) ? this.params.origin : defaults.origin;
    zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : defaults.zOrder;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    motionBlur = !isLocked(flags["motionBlur.enabled"]) ? this.params.motionBlur : defaults.motionBlur;
    instant = duration === 0 || this.interpreter.isInstantSkip();
    noAnim = duration === 0 || GameManager.tempSettings.skip;
    if (this.params.waitForCompletion && !instant) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    if ((ref3 = character.expression) != null ? (ref4 = ref3.idle[0]) != null ? ref4.resource.name : void 0 : void 0) {
      bitmap = ResourceManager.getBitmap(ResourceManager.getPath(character.expression.idle[0].resource));
      if (origin === 1 && (bitmap != null)) {
        x += (bitmap.width * zoom - bitmap.width) / 2;
        y += (bitmap.height * zoom - bitmap.height) / 2;
      }
    }
    character.mirror = mirror;
    character.anchor.x = !origin ? 0 : 0.5;
    character.anchor.y = !origin ? 0 : 0.5;
    character.zoom.x = zoom;
    character.zoom.y = zoom;
    character.dstRect.x = x;
    character.dstRect.y = y;
    character.zIndex = zIndex || 200;
    character.blendMode = this.interpreter.numberValueOf(this.params.blendMode);
    character.angle = angle;
    character.setup();
    character.update();
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, character, this.params);
      character.dstRect.x = p.x;
      character.dstRect.y = p.y;
    }
    scene.behavior.addCharacter(character, noAnim, {
      animation: animation,
      duration: duration,
      easing: easing,
      motionBlur: motionBlur
    });
    if (((ref5 = this.params.viewport) != null ? ref5.type : void 0) === "ui") {
      character.viewport = Graphics.viewport;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCharacterExitScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterExitScene = function(defaults) {
    var animation, character, characterId, duration, easing, flags, instant, isLocked, noAnim, scene;
    defaults = defaults || GameManager.defaults.character;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    scene = SceneManager.scene;
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.disappearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
    instant = duration === 0 || this.interpreter.isInstantSkip();
    noAnim = duration === 0 || GameManager.tempSettings.skip;
    if (this.params.waitForCompletion && !instant) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    scene.behavior.removeCharacter(character, noAnim, {
      animation: animation,
      duration: duration,
      easing: easing
    });
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCharacterChangeExpression
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterChangeExpression = function() {
    var animation, character, characterId, defaults, duration, easing, expression, flags, isLocked, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    defaults = GameManager.defaults.character;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.expressionDuration;
    expression = RecordManager.characterExpressions[this.params.expressionId || 0];
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.changeEasing);
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.changeAnimation;
    character.behavior.changeExpression(expression, this.params.animation, easing, duration);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCharacterSetParameter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterSetParameter = function() {
    var params, value;
    params = GameManager.characterParams[this.interpreter.stringValueOf(this.params.characterId)];
    if ((params == null) || (this.params.param == null)) {
      return;
    }
    switch (this.params.valueType) {
      case 0:
        switch (this.params.param.type) {
          case 0:
            return params[this.params.param.name] = this.interpreter.numberValueOf(this.params.numberValue);
          case 1:
            return params[this.params.param.name] = this.interpreter.numberValueOf(this.params.numberValue) > 0;
          case 2:
            return params[this.params.param.name] = this.interpreter.numberValueOf(this.params.numberValue).toString();
        }
        break;
      case 1:
        switch (this.params.param.type) {
          case 0:
            value = this.interpreter.booleanValueOf(this.params.switchValue);
            return params[this.params.param.name] = value ? 1 : 0;
          case 1:
            return params[this.params.param.name] = this.interpreter.booleanValueOf(this.params.switchValue);
          case 2:
            value = this.interpreter.booleanValueOf(this.params.switchValue);
            return params[this.params.param.name] = value ? "ON" : "OFF";
        }
        break;
      case 2:
        switch (this.params.param.type) {
          case 0:
            value = this.interpreter.stringValueOf(this.params.textValue);
            return params[this.params.param.name] = value.length;
          case 1:
            return params[this.params.param.name] = this.interpreter.stringValueOf(this.params.textValue) === "ON";
          case 2:
            return params[this.params.param.name] = this.interpreter.stringValueOf(this.params.textValue);
        }
    }
  };


  /**
  * @method commandCharacterGetParameter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterGetParameter = function() {
    var params, value;
    params = GameManager.characterParams[this.interpreter.stringValueOf(this.params.characterId)];
    if ((params == null) || (this.params.param == null)) {
      return;
    }
    value = params[this.params.param.name];
    switch (this.params.valueType) {
      case 0:
        switch (this.params.param.type) {
          case 0:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, value);
          case 1:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, value ? 1 : 0);
          case 2:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, value != null ? value.length : 0);
        }
        break;
      case 1:
        switch (this.params.param.type) {
          case 0:
            return this.interpreter.setBooleanValueTo(this.params.targetVariable, value > 0);
          case 1:
            return this.interpreter.setBooleanValueTo(this.params.targetVariable, value);
          case 2:
            return this.interpreter.setBooleanValueTo(this.params.targetVariable, value === "ON");
        }
        break;
      case 2:
        switch (this.params.param.type) {
          case 0:
            return this.interpreter.setStringValueTo(this.params.targetVariable, value != null ? value.toString() : "");
          case 1:
            return this.interpreter.setStringValueTo(this.params.targetVariable, value ? "ON" : "OFF");
          case 2:
            return this.interpreter.setStringValueTo(this.params.targetVariable, value);
        }
    }
  };


  /**
  * @method commandCharacterMotionBlur
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterMotionBlur = function() {
    var character, characterId, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    return character.motionBlur.set(this.params.motionBlur);
  };


  /**
  * @method commandCharacterDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.character;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.expressionDuration)) {
      defaults.expressionDuration = this.interpreter.durationValueOf(this.params.expressionDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      defaults.disappearAnimation = this.params.disappearAnimation;
    }
    if (!isLocked(flags["motionBlur.enabled"])) {
      defaults.motionBlur = this.params.motionBlur;
    }
    if (!isLocked(flags.origin)) {
      return defaults.origin = this.params.origin;
    }
  };


  /**
  * @method commandCharacterEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCharacterEffect = function() {
    var character, characterId, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first(function(c) {
      return !c.disposed && c.rid === characterId;
    });
    if (character == null) {
      return;
    }
    this.interpreter.objectEffect(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandFlashCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandFlashCharacter = function() {
    var character, characterId, duration, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    if (!character) {
      return;
    }
    duration = this.interpreter.durationValueOf(this.params.duration);
    character.animator.flash(new Color(this.params.color), duration);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTintCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTintCharacter = function() {
    var character, characterId, duration, easing, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    easing = gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut);
    if (!character) {
      return;
    }
    duration = this.interpreter.durationValueOf(this.params.duration);
    character.animator.tintTo(this.params.tone, duration, easing);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomCharacter = function() {
    var character, characterId, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.zoomObject(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandRotateCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotateCharacter = function() {
    var character, characterId, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.rotateObject(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBlendCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBlendCharacter = function() {
    var character, characterId;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = SceneManager.scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.blendObject(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandShakeCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShakeCharacter = function() {
    var character, characterId;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = SceneManager.scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.shakeObject(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMaskCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMaskCharacter = function() {
    var character, characterId, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.maskObject(character, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMoveCharacter
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveCharacter = function() {
    var character, characterId, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.moveObject(character, this.params.position, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMoveCharacterPath
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveCharacterPath = function() {
    var character, characterId, scene;
    scene = SceneManager.scene;
    characterId = this.interpreter.stringValueOf(this.params.characterId);
    character = scene.characters.first((function(_this) {
      return function(v) {
        return !v.disposed && v.rid === characterId;
      };
    })(this));
    if (character == null) {
      return;
    }
    this.interpreter.moveObjectPath(character, this.params.path, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandShakeBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShakeBackground = function() {
    var background;
    background = SceneManager.scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
    if (background == null) {
      return;
    }
    this.interpreter.shakeObject(background, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandScrollBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScrollBackground = function() {
    var duration, easing, horizontalSpeed, layer, ref, scene, verticalSpeed;
    scene = SceneManager.scene;
    duration = this.interpreter.durationValueOf(this.params.duration);
    horizontalSpeed = this.interpreter.numberValueOf(this.params.horizontalSpeed);
    verticalSpeed = this.interpreter.numberValueOf(this.params.verticalSpeed);
    easing = gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut);
    layer = this.interpreter.numberValueOf(this.params.layer);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    if ((ref = scene.backgrounds[layer]) != null) {
      ref.animator.move(horizontalSpeed, verticalSpeed, duration, easing);
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandScrollBackgroundTo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScrollBackgroundTo = function() {
    var background, duration, easing, layer, p, scene, x, y;
    scene = SceneManager.scene;
    duration = this.interpreter.durationValueOf(this.params.duration);
    x = this.interpreter.numberValueOf(this.params.background.location.x);
    y = this.interpreter.numberValueOf(this.params.background.location.y);
    easing = gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut);
    layer = this.interpreter.numberValueOf(this.params.layer);
    background = scene.backgrounds[layer];
    if (!background) {
      return;
    }
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, background, this.params);
      x = p.x;
      y = p.y;
    }
    background.animator.moveTo(x, y, duration, easing);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandScrollBackgroundPath
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScrollBackgroundPath = function() {
    var background, scene;
    scene = SceneManager.scene;
    background = scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
    if (background == null) {
      return;
    }
    this.interpreter.moveObjectPath(background, this.params.path, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMaskBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMaskBackground = function() {
    var background, scene;
    scene = SceneManager.scene;
    background = scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
    if (background == null) {
      return;
    }
    this.interpreter.maskObject(background, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomBackground = function() {
    var duration, easing, layer, ref, scene, x, y;
    scene = SceneManager.scene;
    duration = this.interpreter.durationValueOf(this.params.duration);
    x = this.interpreter.numberValueOf(this.params.zooming.x);
    y = this.interpreter.numberValueOf(this.params.zooming.y);
    easing = gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut);
    layer = this.interpreter.numberValueOf(this.params.layer);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    if ((ref = scene.backgrounds[layer]) != null) {
      ref.animator.zoomTo(x / 100, y / 100, duration, easing);
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandRotateBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotateBackground = function() {
    var background, scene;
    scene = SceneManager.scene;
    background = scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
    if (background) {
      this.interpreter.rotateObject(background, this.params);
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTintBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTintBackground = function() {
    var background, duration, easing, layer, scene;
    scene = SceneManager.scene;
    layer = this.interpreter.numberValueOf(this.params.layer);
    background = scene.backgrounds[layer];
    if (background == null) {
      return;
    }
    duration = this.interpreter.durationValueOf(this.params.duration);
    easing = gs.Easings.fromObject(this.params.easing);
    background.animator.tintTo(this.params.tone, duration, easing);
    this.interpreter.waitForCompletion(background, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBlendBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBlendBackground = function() {
    var background, layer;
    layer = this.interpreter.numberValueOf(this.params.layer);
    background = SceneManager.scene.backgrounds[layer];
    if (background == null) {
      return;
    }
    this.interpreter.blendObject(background, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBackgroundEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBackgroundEffect = function() {
    var background, layer;
    layer = this.interpreter.numberValueOf(this.params.layer);
    background = SceneManager.scene.backgrounds[layer];
    if (background == null) {
      return;
    }
    this.interpreter.objectEffect(background, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBackgroundDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBackgroundDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.background;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.duration)) {
      defaults.duration = this.interpreter.durationValueOf(this.params.duration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["easing.type"])) {
      defaults.easing = this.params.easing;
    }
    if (!isLocked(flags["animation.type"])) {
      defaults.animation = this.params.animation;
    }
    if (!isLocked(flags.origin)) {
      defaults.origin = this.params.origin;
    }
    if (!isLocked(flags.loopHorizontal)) {
      defaults.loopHorizontal = this.params.loopHorizontal;
    }
    if (!isLocked(flags.loopVertical)) {
      return defaults.loopVertical = this.params.loopVertical;
    }
  };


  /**
  * @method commandBackgroundMotionBlur
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBackgroundMotionBlur = function() {
    var background, layer;
    layer = this.interpreter.numberValueOf(this.params.layer);
    background = SceneManager.scene.backgrounds[layer];
    if (background == null) {
      return;
    }
    return background.motionBlur.set(this.params.motionBlur);
  };


  /**
  * @method commandChangeBackground
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeBackground = function() {
    var animation, defaults, duration, easing, flags, isLocked, layer, loopH, loopV, origin, ref, scene, zIndex;
    defaults = GameManager.defaults.background;
    scene = SceneManager.scene;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.duration;
    loopH = !isLocked(flags.loopHorizontal) ? this.params.loopHorizontal : defaults.loopHorizontal;
    loopV = !isLocked(flags.loopVertical) ? this.params.loopVertical : defaults.loopVertical;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.animation;
    origin = !isLocked(flags.origin) ? this.params.origin : defaults.origin;
    zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : defaults.zOrder;
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromObject(this.params.easing) : gs.Easings.fromObject(defaults.easing);
    layer = this.interpreter.numberValueOf(this.params.layer);
    scene.behavior.changeBackground(this.params.graphic, false, animation, easing, duration, 0, 0, layer, loopH, loopV);
    if (scene.backgrounds[layer]) {
      if (((ref = this.params.viewport) != null ? ref.type : void 0) === "ui") {
        scene.backgrounds[layer].viewport = Graphics.viewport;
      }
      scene.backgrounds[layer].anchor.x = origin === 0 ? 0 : 0.5;
      scene.backgrounds[layer].anchor.y = origin === 0 ? 0 : 0.5;
      scene.backgrounds[layer].blendMode = this.interpreter.numberValueOf(this.params.blendMode);
      scene.backgrounds[layer].zIndex = zIndex + layer;
      if (origin === 1) {
        scene.backgrounds[layer].dstRect.x = scene.backgrounds[layer].dstRect.x;
        scene.backgrounds[layer].dstRect.y = scene.backgrounds[layer].dstRect.y;
      }
      scene.backgrounds[layer].setup();
      scene.backgrounds[layer].update();
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCallScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCallScene = function() {
    return this.interpreter.callScene(this.interpreter.stringValueOf(this.params.scene.uid || this.params.scene));
  };


  /**
  * @method commandChangeScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeScene = function() {
    var flags, isLocked, k, len, len1, n, newScene, paramScene, picture, ref, ref1, scene, uid, video;
    if (GameManager.inLivePreview) {
      return;
    }
    GameManager.tempSettings.skip = false;
    if (!this.params.savePrevious) {
      SceneManager.clear();
    }
    scene = SceneManager.scene;
    if (!this.params.erasePictures && !this.params.savePrevious) {
      scene.removeObject(scene.pictureContainer);
      ref = scene.pictures;
      for (k = 0, len = ref.length; k < len; k++) {
        picture = ref[k];
        if (picture) {
          ResourceManager.context.remove(picture.imageFolder + "/" + picture.image);
        }
      }
    }
    if (!this.params.eraseTexts && !this.params.savePrevious) {
      scene.removeObject(scene.textContainer);
    }
    if (!this.params.eraseVideos && !this.params.savePrevious) {
      scene.removeObject(scene.videoContainer);
      ref1 = scene.videos;
      for (n = 0, len1 = ref1.length; n < len1; n++) {
        video = ref1[n];
        if (video) {
          ResourceManager.context.remove(video.videoFolder + "/" + video.video);
        }
      }
    }
    if (this.params.scene) {
      paramScene = {
        uid: this.interpreter.stringValueOf(this.params.scene.uid || this.params.scene)
      };
      if (this.params.savePrevious) {
        GameManager.sceneData = {
          uid: uid = paramScene.uid,
          pictures: [],
          texts: [],
          videos: []
        };
      } else {
        GameManager.sceneData = {
          uid: uid = paramScene.uid,
          pictures: scene.pictureContainer.subObjectsByDomain,
          texts: scene.textContainer.subObjectsByDomain,
          videos: scene.videoContainer.subObjectsByDomain
        };
      }
      flags = this.params.fieldFlags || {};
      isLocked = gs.CommandFieldFlags.isLocked;
      newScene = new vn.Object_Scene();
      if (this.params.savePrevious) {
        newScene.sceneData = {
          uid: uid = paramScene.uid,
          pictures: [],
          texts: [],
          videos: [],
          backlog: GameManager.backlog
        };
      } else {
        newScene.sceneData = {
          uid: uid = paramScene.uid,
          pictures: scene.pictureContainer.subObjectsByDomain,
          texts: scene.textContainer.subObjectsByDomain,
          videos: scene.videoContainer.subObjectsByDomain
        };
      }
      SceneManager.switchTo(newScene, this.params.savePrevious, (function(_this) {
        return function() {
          return _this.interpreter.isWaiting = false;
        };
      })(this));
    } else {
      SceneManager.switchTo(null);
    }
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandReturnToPreviousScene
  * @protected
   */

  Component_CommandInterpreter.prototype.commandReturnToPreviousScene = function() {
    if (GameManager.inLivePreview) {
      return;
    }
    SceneManager.returnToPrevious((function(_this) {
      return function() {
        return _this.interpreter.isWaiting = false;
      };
    })(this));
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandSwitchToLayout
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSwitchToLayout = function() {
    var scene;
    if (GameManager.inLivePreview) {
      return;
    }
    if (ui.UIManager.layouts[this.params.layout.name] != null) {
      scene = new gs.Object_Layout(this.params.layout.name);
      SceneManager.switchTo(scene, this.params.savePrevious, (function(_this) {
        return function() {
          return _this.interpreter.isWaiting = false;
        };
      })(this));
      return this.interpreter.isWaiting = true;
    }
  };


  /**
  * @method commandChangeTransition
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeTransition = function() {
    var flags, isLocked;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.duration)) {
      SceneManager.transitionData.duration = this.interpreter.durationValueOf(this.params.duration);
    }
    if (!isLocked(flags.graphic)) {
      SceneManager.transitionData.graphic = this.params.graphic;
    }
    if (!isLocked(flags.vague)) {
      return SceneManager.transitionData.vague = this.params.vague;
    }
  };


  /**
  * @method commandFreezeScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandFreezeScreen = function() {
    return Graphics.freeze();
  };


  /**
  * @method commandScreenTransition
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScreenTransition = function() {
    var bitmap, defaults, duration, flags, graphic, isLocked, vague;
    defaults = GameManager.defaults.scene;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    graphic = !isLocked(flags.graphic) ? this.params.graphic : SceneManager.transitionData.graphic;
    if (graphic) {
      bitmap = ResourceManager.getBitmap(ResourceManager.getPath(graphic));
    }
    vague = !isLocked(flags.vague) ? this.interpreter.numberValueOf(this.params.vague) : SceneManager.transitionData.vague;
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : SceneManager.transitionData.duration;
    this.interpreter.isWaiting = !GameManager.inLivePreview;
    this.interpreter.waitCounter = duration;
    return Graphics.transition(duration, bitmap, vague);
  };


  /**
  * @method commandShakeScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShakeScreen = function() {
    if (SceneManager.scene.viewport == null) {
      return;
    }
    this.interpreter.shakeObject(SceneManager.scene.viewport, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTintScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTintScreen = function() {
    var duration;
    duration = this.interpreter.durationValueOf(this.params.duration);
    SceneManager.scene.viewport.animator.tintTo(new Tone(this.params.tone), duration, gs.Easings.EASE_LINEAR[0]);
    if (this.params.waitForCompletion && duration > 0) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomScreen = function() {
    var duration, easing, scene;
    easing = gs.Easings.fromObject(this.params.easing);
    duration = this.interpreter.durationValueOf(this.params.duration);
    scene = SceneManager.scene;
    SceneManager.scene.viewport.anchor.x = 0.5;
    SceneManager.scene.viewport.anchor.y = 0.5;
    SceneManager.scene.viewport.animator.zoomTo(this.interpreter.numberValueOf(this.params.zooming.x) / 100, this.interpreter.numberValueOf(this.params.zooming.y) / 100, duration, easing);
    this.interpreter.waitForCompletion(null, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPanScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPanScreen = function() {
    var duration, easing, scene, viewport;
    scene = SceneManager.scene;
    duration = this.interpreter.durationValueOf(this.params.duration);
    easing = gs.Easings.fromObject(this.params.easing);
    this.interpreter.settings.screen.pan.x -= this.params.position.x;
    this.interpreter.settings.screen.pan.y -= this.params.position.y;
    viewport = SceneManager.scene.viewport;
    viewport.animator.scrollTo(-this.params.position.x + viewport.dstRect.x, -this.params.position.y + viewport.dstRect.y, duration, easing);
    this.interpreter.waitForCompletion(null, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandRotateScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotateScreen = function() {
    var duration, easing, pan, scene;
    scene = SceneManager.scene;
    easing = gs.Easings.fromObject(this.params.easing);
    duration = this.interpreter.durationValueOf(this.params.duration);
    pan = this.interpreter.settings.screen.pan;
    SceneManager.scene.viewport.anchor.x = 0.5;
    SceneManager.scene.viewport.anchor.y = 0.5;
    SceneManager.scene.viewport.animator.rotate(this.params.direction, this.interpreter.numberValueOf(this.params.speed) / 100, duration, easing);
    this.interpreter.waitForCompletion(null, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandFlashScreen
  * @protected
   */

  Component_CommandInterpreter.prototype.commandFlashScreen = function() {
    var duration;
    duration = this.interpreter.durationValueOf(this.params.duration);
    SceneManager.scene.viewport.animator.flash(new Color(this.params.color), duration, gs.Easings.EASE_LINEAR[0]);
    if (this.params.waitForCompletion && duration !== 0) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandScreenEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScreenEffect = function() {
    var duration, easing, flags, isLocked, scene, viewport, wobble, zOrder;
    scene = SceneManager.scene;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    duration = this.interpreter.durationValueOf(this.params.duration);
    easing = gs.Easings.fromObject(this.params.easing);
    if (!gs.CommandFieldFlags.isLocked(flags.zOrder)) {
      zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    } else {
      zOrder = SceneManager.scene.viewport.zIndex;
    }
    viewport = scene.viewportContainer.subObjects.first(function(v) {
      return v.zIndex === zOrder;
    });
    if (!viewport) {
      viewport = new gs.Object_Viewport();
      viewport.zIndex = zOrder;
      scene.viewportContainer.addObject(viewport);
    }
    switch (this.params.type) {
      case 0:
        viewport.animator.wobbleTo(this.params.wobble.power / 10000, this.params.wobble.speed / 100, duration, easing);
        wobble = viewport.effects.wobble;
        wobble.enabled = this.params.wobble.power > 0;
        wobble.vertical = this.params.wobble.orientation === 0 || this.params.wobble.orientation === 2;
        wobble.horizontal = this.params.wobble.orientation === 1 || this.params.wobble.orientation === 2;
        break;
      case 1:
        viewport.animator.blurTo(this.params.blur.power / 100, duration, easing);
        viewport.effects.blur.enabled = true;
        break;
      case 2:
        viewport.animator.pixelateTo(this.params.pixelate.size.width, this.params.pixelate.size.height, duration, easing);
        viewport.effects.pixelate.enabled = true;
    }
    if (this.params.waitForCompletion && duration !== 0) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandVideoDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandVideoDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.video;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      defaults.disappearAnimation = this.params.disappearAnimation;
    }
    if (!isLocked(flags["motionBlur.enabled"])) {
      defaults.motionBlur = this.params.motionBlur;
    }
    if (!isLocked(flags.origin)) {
      return defaults.origin = this.params.origin;
    }
  };


  /**
  * @method commandShowVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowVideo = function() {
    var animation, defaults, duration, easing, flags, isLocked, number, origin, p, ref, ref1, ref2, ref3, scene, video, videos, x, y, zIndex;
    defaults = GameManager.defaults.video;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    videos = scene.videos;
    if (videos[number] == null) {
      videos[number] = new gs.Object_Video();
    }
    x = this.interpreter.numberValueOf(this.params.position.x);
    y = this.interpreter.numberValueOf(this.params.position.y);
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    origin = !isLocked(flags.origin) ? this.params.origin : defaults.origin;
    zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : defaults.zOrder;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    video = videos[number];
    video.domain = this.params.numberDomain;
    video.video = (ref = this.params.video) != null ? ref.name : void 0;
    video.videoFolder = (ref1 = this.params.video) != null ? ref1.folderPath : void 0;
    video.loop = (ref2 = this.params.loop) != null ? ref2 : true;
    video.dstRect.x = x;
    video.dstRect.y = y;
    video.blendMode = this.interpreter.numberValueOf(this.params.blendMode);
    video.anchor.x = origin === 0 ? 0 : 0.5;
    video.anchor.y = origin === 0 ? 0 : 0.5;
    video.zIndex = zIndex || (1000 + number);
    if (((ref3 = this.params.viewport) != null ? ref3.type : void 0) === "scene") {
      video.viewport = SceneManager.scene.behavior.viewport;
    }
    video.update();
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, video, this.params);
      video.dstRect.x = p.x;
      video.dstRect.y = p.y;
    }
    video.animator.appear(x, y, animation, easing, duration);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMoveVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.moveObject(video, this.params.picture.position, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMoveVideoPath
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveVideoPath = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.moveObjectPath(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandRotateVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotateVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.rotateObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.zoomObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBlendVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBlendVideo = function() {
    var video;
    SceneManager.scene.behavior.changeVideoDomain(this.params.numberDomain);
    video = SceneManager.scene.videos[this.interpreter.numberValueOf(this.params.number)];
    if (video == null) {
      return;
    }
    this.interpreter.blendObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTintVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTintVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.tintObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandFlashVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandFlashVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.flashObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCropVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCropVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    return this.interpreter.cropObject(video, this.params);
  };


  /**
  * @method commandVideoMotionBlur
  * @protected
   */

  Component_CommandInterpreter.prototype.commandVideoMotionBlur = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    return this.interpreter.objectMotionBlur(video, this.params);
  };


  /**
  * @method commandMaskVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMaskVideo = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.maskObject(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandVideoEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandVideoEffect = function() {
    var number, scene, video;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    this.interpreter.objectEffect(video, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandEraseVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEraseVideo = function() {
    var animation, defaults, duration, easing, flags, isLocked, number, scene, video;
    defaults = GameManager.defaults.video;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changeVideoDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    video = scene.videos[number];
    if (video == null) {
      return;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.disappearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
    video.animator.disappear(animation, easing, duration, (function(_this) {
      return function(sender) {
        sender.dispose();
        scene.behavior.changeTextDomain(sender.domain);
        return scene.videos[number] = null;
      };
    })(this));
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandShowImageMap
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowImageMap = function() {
    var bitmap, flags, imageMap, isLocked, number, p;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    SceneManager.scene.behavior.changePictureDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    imageMap = SceneManager.scene.pictures[number];
    if (imageMap) {
      imageMap.dispose();
    }
    imageMap = new gs.Object_ImageMap();
    imageMap.visual.variableContext = this.interpreter.context;
    SceneManager.scene.pictures[number] = imageMap;
    bitmap = ResourceManager.getBitmap(ResourceManager.getPath(this.params.ground));
    imageMap.dstRect.width = bitmap.width;
    imageMap.dstRect.height = bitmap.height;
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, imageMap, this.params);
      imageMap.dstRect.x = p.x;
      imageMap.dstRect.y = p.y;
    } else {
      imageMap.dstRect.x = this.interpreter.numberValueOf(this.params.position.x);
      imageMap.dstRect.y = this.interpreter.numberValueOf(this.params.position.y);
    }
    imageMap.anchor.x = this.params.origin === 1 ? 0.5 : 0;
    imageMap.anchor.y = this.params.origin === 1 ? 0.5 : 0;
    imageMap.zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : 700 + number;
    imageMap.blendMode = !isLocked(flags.blendMode) ? this.params.blendMode : 0;
    imageMap.hotspots = this.params.hotspots;
    imageMap.images = [this.params.ground, this.params.hover, this.params.unselected, this.params.selected, this.params.selectedHover];
    imageMap.events.on("jumpTo", gs.CallBack("onJumpTo", this.interpreter));
    imageMap.events.on("callCommonEvent", gs.CallBack("onCallCommonEvent", this.interpreter));
    imageMap.setup();
    imageMap.update();
    this.interpreter.showObject(imageMap, {
      x: 0,
      y: 0
    }, this.params);
    if (this.params.waitForCompletion) {
      this.interpreter.waitCounter = 0;
      this.interpreter.isWaiting = true;
    }
    imageMap.events.on("finish", (function(_this) {
      return function(sender) {
        return _this.interpreter.isWaiting = false;
      };
    })(this));
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandEraseImageMap
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEraseImageMap = function() {
    var imageMap, number, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    imageMap = scene.pictures[number];
    if (imageMap == null) {
      return;
    }
    imageMap.events.emit("finish", imageMap);
    imageMap.visual.active = false;
    this.interpreter.eraseObject(imageMap, this.params, (function(_this) {
      return function(sender) {
        scene.behavior.changePictureDomain(sender.domain);
        return scene.pictures[number] = null;
      };
    })(this));
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandAddHotspot
  * @protected
   */

  Component_CommandInterpreter.prototype.commandAddHotspot = function() {
    var dragging, hotspot, hotspots, makeHotspotImage, number, picture, ref, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeHotspotDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    hotspots = scene.hotspots;
    if (hotspots[number] == null) {
      hotspots[number] = new gs.Object_Hotspot();
    }
    hotspot = hotspots[number];
    hotspot.domain = this.params.numberDomain;
    hotspot.data = {
      params: this.params,
      bindValue: this.interpreter.numberValueOf(this.params.actions.onDrag.bindValue)
    };
    switch (this.params.positionType) {
      case 0:
        hotspot.dstRect.x = this.params.box.x;
        hotspot.dstRect.y = this.params.box.y;
        hotspot.dstRect.width = this.params.box.size.width;
        hotspot.dstRect.height = this.params.box.size.height;
        break;
      case 1:
        hotspot.dstRect.x = this.interpreter.numberValueOf(this.params.box.x);
        hotspot.dstRect.y = this.interpreter.numberValueOf(this.params.box.y);
        hotspot.dstRect.width = this.interpreter.numberValueOf(this.params.box.size.width);
        hotspot.dstRect.height = this.interpreter.numberValueOf(this.params.box.size.height);
        break;
      case 2:
        picture = scene.pictures[this.interpreter.numberValueOf(this.params.pictureNumber)];
        if (picture != null) {
          hotspot.target = picture;
        }
        break;
      case 3:
        text = scene.texts[this.interpreter.numberValueOf(this.params.textNumber)];
        if (text != null) {
          hotspot.target = text;
        }
    }
    hotspot.behavior.shape = (ref = this.params.shape) != null ? ref : gs.HotspotShape.RECTANGLE;
    makeHotspotImage = (function(_this) {
      return function(graphic) {
        var folder, name, path;
        if (graphic != null ? graphic.name : void 0) {
          return graphic;
        } else if (graphic != null) {
          path = _this.interpreter.stringValueOf(graphic);
          name = path.split("/").last() || "";
          folder = path.split("/").slice(0, -1).join("/") || "";
          return {
            name: name,
            folderPath: folder
          };
        } else {
          return null;
        }
      };
    })(this);
    if (text != null) {
      hotspot.images = null;
    } else {
      hotspot.images = [
        makeHotspotImage(this.params.baseGraphic) || ((picture != null ? picture.image : void 0) ? {
          name: picture.image,
          folderPath: picture.imageFolder
        } : null), makeHotspotImage(this.params.hoverGraphic), makeHotspotImage(this.params.selectedGraphic), makeHotspotImage(this.params.selectedHoverGraphic), makeHotspotImage(this.params.unselectedGraphic)
      ];
    }
    if (this.params.actions.onClick.type !== 0 || this.params.actions.onClick.label) {
      hotspot.events.on("click", gs.CallBack("onHotspotClick", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onClick.bindValue)
      }));
    }
    if (this.params.actions.onEnter.type !== 0 || this.params.actions.onEnter.label) {
      hotspot.events.on("enter", gs.CallBack("onHotspotEnter", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onEnter.bindValue)
      }));
    }
    if (this.params.actions.onLeave.type !== 0 || this.params.actions.onLeave.label) {
      hotspot.events.on("leave", gs.CallBack("onHotspotLeave", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onLeave.bindValue)
      }));
    }
    if (this.params.actions.onDrag.type !== 0 || this.params.actions.onDrag.label) {
      hotspot.events.on("dragStart", gs.CallBack("onHotspotDragStart", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onDrag.bindValue)
      }));
      hotspot.events.on("drag", gs.CallBack("onHotspotDrag", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onDrag.bindValue)
      }));
      hotspot.events.on("dragEnd", gs.CallBack("onHotspotDragEnd", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onDrag.bindValue)
      }));
    }
    if (this.params.actions.onSelect.type !== 0 || this.params.actions.onSelect.label || this.params.actions.onDeselect.type !== 0 || this.params.actions.onDeselect.label) {
      hotspot.events.on("stateChanged", gs.CallBack("onHotspotStateChanged", this.interpreter, this.params));
    }
    if (this.params.dragging.enabled) {
      hotspot.events.on("dragEnd", gs.CallBack("onHotspotDrop", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onDrop.bindValue)
      }));
    }
    if (this.params.actions.onDropReceive.type !== 0 || this.params.actions.onDropReceive.label) {
      hotspot.events.on("dropReceived", gs.CallBack("onHotspotDropReceived", this.interpreter, {
        params: this.params,
        bindValue: this.interpreter.numberValueOf(this.params.actions.onDropReceive.bindValue)
      }));
    }
    hotspot.selectable = true;
    if (this.params.dragging.enabled) {
      dragging = this.params.dragging;
      hotspot.draggable = {
        rect: new Rect(dragging.rect.x, dragging.rect.y, dragging.rect.size.width, dragging.rect.size.height),
        axisX: dragging.horizontal,
        axisY: dragging.vertical
      };
      hotspot.addComponent(new ui.Component_Draggable());
      hotspot.events.on("drag", (function(_this) {
        return function(e) {
          var drag;
          drag = e.sender.draggable;
          GameManager.variableStore.setupTempVariables(_this.interpreter.context);
          if (_this.params.dragging.horizontal) {
            return _this.interpreter.setNumberValueTo(_this.params.dragging.variable, Math.round((e.sender.dstRect.x - drag.rect.x) / (drag.rect.width - e.sender.dstRect.width) * 100));
          } else {
            return _this.interpreter.setNumberValueTo(_this.params.dragging.variable, Math.round((e.sender.dstRect.y - drag.rect.y) / (drag.rect.height - e.sender.dstRect.height) * 100));
          }
        };
      })(this));
    }
    return hotspot.setup();
  };


  /**
  * @method commandChangeHotspotState
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeHotspotState = function() {
    var flags, hotspot, isLocked, number, scene;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changeHotspotDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    hotspot = scene.hotspots[number];
    if (!hotspot) {
      return;
    }
    if (!isLocked(flags.selected)) {
      hotspot.behavior.selected = this.interpreter.booleanValueOf(this.params.selected);
    }
    if (!isLocked(flags.enabled)) {
      hotspot.behavior.enabled = this.interpreter.booleanValueOf(this.params.enabled);
    }
    hotspot.behavior.updateInput();
    return hotspot.behavior.updateImage();
  };


  /**
  * @method commandEraseHotspot
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEraseHotspot = function() {
    var number, scene;
    scene = SceneManager.scene;
    scene.behavior.changeHotspotDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    if (scene.hotspots[number] != null) {
      scene.hotspots[number].dispose();
      return scene.hotspotContainer.eraseObject(number);
    }
  };


  /**
  * @method commandChangeObjectDomain
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeObjectDomain = function() {
    return SceneManager.scene.behavior.changeObjectDomain(this.interpreter.stringValueOf(this.params.domain));
  };


  /**
  * @method commandPictureDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPictureDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.picture;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      defaults.disappearAnimation = this.params.disappearAnimation;
    }
    if (!isLocked(flags["motionBlur.enabled"])) {
      defaults.motionBlur = this.params.motionBlur;
    }
    if (!isLocked(flags.origin)) {
      return defaults.origin = this.params.origin;
    }
  };

  Component_CommandInterpreter.prototype.createPicture = function(graphic, params) {
    var animation, bitmap, defaults, duration, easing, flags, graphicName, isLocked, number, origin, picture, pictures, ref, ref1, ref2, ref3, ref4, ref5, ref6, scene, snapshot, x, y, zIndex;
    graphic = this.stringValueOf(graphic);
    graphic = typeof graphic === "string" ? {
      name: gs.Path.basename(graphic),
      folderPath: gs.Path.dirname(graphic)
    } : graphic;
    graphicName = (graphic != null ? graphic.name : void 0) != null ? graphic.name : graphic;
    bitmap = ResourceManager.getBitmap(ResourceManager.getPath(graphic));
    if (bitmap && !bitmap.loaded) {
      return null;
    }
    defaults = GameManager.defaults.picture;
    flags = params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    number = this.numberValueOf(params.number);
    pictures = scene.pictures;
    picture = pictures[number];
    if (picture == null) {
      picture = new gs.Object_Picture(null, null, (ref = params.visual) != null ? ref.type : void 0);
      picture.domain = params.numberDomain;
      pictures[number] = picture;
      switch ((ref1 = params.visual) != null ? ref1.type : void 0) {
        case 1:
          picture.visual.looping.vertical = true;
          picture.visual.looping.horizontal = true;
          break;
        case 2:
          picture.frameThickness = params.visual.frame.thickness;
          picture.frameCornerSize = params.visual.frame.cornerSize;
          break;
        case 3:
          picture.visual.orientation = params.visual.threePartImage.orientation;
          break;
        case 4:
          picture.color = gs.Color.fromObject(params.visual.quad.color);
          break;
        case 5:
          snapshot = Graphics.snapshot();
          picture.bitmap = snapshot;
          picture.dstRect.width = snapshot.width;
          picture.dstRect.height = snapshot.height;
          picture.srcRect.set(0, 0, snapshot.width, snapshot.height);
      }
    } else {
      picture.bitmap = null;
    }
    x = this.numberValueOf(params.position.x);
    y = this.numberValueOf(params.position.y);
    picture = pictures[number];
    if (!picture.bitmap) {
      picture.image = graphicName;
      picture.imageFolder = (graphic != null ? graphic.folderPath : void 0) || "Graphics/Pictures";
    } else {
      picture.image = null;
    }
    bitmap = (ref2 = picture.bitmap) != null ? ref2 : ResourceManager.getBitmap(ResourceManager.getPath(graphic));
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.numberValueOf(params.easing.type), params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.durationValueOf(params.duration) : defaults.appearDuration;
    origin = !isLocked(flags.origin) ? params.origin : defaults.origin;
    zIndex = !isLocked(flags.zOrder) ? this.numberValueOf(params.zOrder) : defaults.zOrder;
    animation = !isLocked(flags["animation.type"]) ? params.animation : defaults.appearAnimation;
    picture.mirror = params.position.horizontalFlip;
    picture.angle = params.position.angle || 0;
    picture.zoom.x = ((ref3 = params.position.data) != null ? ref3.zoom : void 0) || 1;
    picture.zoom.y = ((ref4 = params.position.data) != null ? ref4.zoom : void 0) || 1;
    picture.blendMode = this.numberValueOf(params.blendMode);
    if (params.origin === 1 && (bitmap != null)) {
      x += (bitmap.width * picture.zoom.x - bitmap.width) / 2;
      y += (bitmap.height * picture.zoom.y - bitmap.height) / 2;
    }
    picture.dstRect.x = x;
    picture.dstRect.y = y;
    picture.anchor.x = origin === 1 ? 0.5 : 0;
    picture.anchor.y = origin === 1 ? 0.5 : 0;
    picture.zIndex = zIndex || (700 + number);
    if (((ref5 = params.viewport) != null ? ref5.type : void 0) === "scene") {
      picture.viewport = SceneManager.scene.behavior.viewport;
    }
    if (((ref6 = params.size) != null ? ref6.type : void 0) === 1) {
      picture.dstRect.width = this.numberValueOf(params.size.width);
      picture.dstRect.height = this.numberValueOf(params.size.height);
    }
    picture.update();
    return picture;
  };


  /**
  * @method commandShowPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowPicture = function() {
    var animation, defaults, duration, easing, flags, isLocked, p, picture;
    SceneManager.scene.behavior.changePictureDomain(this.params.numberDomain || "");
    defaults = GameManager.defaults.picture;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    picture = this.interpreter.createPicture(this.params.graphic, this.params);
    if (!picture) {
      this.interpreter.pointer--;
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = 1;
      return;
    }
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, picture, this.params);
      picture.dstRect.x = p.x;
      picture.dstRect.y = p.y;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    picture.animator.appear(picture.dstRect.x, picture.dstRect.y, animation, easing, duration);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPlayPictureAnimation
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPlayPictureAnimation = function() {
    var animation, bitmap, component, defaults, duration, easing, flags, isLocked, p, picture, record;
    SceneManager.scene.behavior.changePictureDomain(this.params.numberDomain || "");
    defaults = GameManager.defaults.picture;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    picture = null;
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    if (this.params.animationId != null) {
      record = RecordManager.animations[this.params.animationId];
      if (record != null) {
        picture = this.interpreter.createPicture(record.graphic, this.params);
        component = picture.findComponent("Component_FrameAnimation");
        if (component != null) {
          component.refresh(record);
          component.start();
        } else {
          component = new gs.Component_FrameAnimation(record);
          picture.addComponent(component);
        }
        component.update();
        if (this.params.positionType === 0) {
          p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, picture, this.params);
          picture.dstRect.x = p.x;
          picture.dstRect.y = p.y;
        }
        picture.animator.appear(picture.dstRect.x, picture.dstRect.y, animation, easing, duration);
      }
    } else {
      picture = SceneManager.scene.pictures[this.interpreter.numberValueOf(this.params.number)];
      animation = picture != null ? picture.findComponent("Component_FrameAnimation") : void 0;
      if (animation != null) {
        picture.removeComponent(animation);
        bitmap = ResourceManager.getBitmap("Graphics/Animations/" + picture.image);
        if (bitmap != null) {
          picture.srcRect.set(0, 0, bitmap.width, bitmap.height);
          picture.dstRect.width = picture.srcRect.width;
          picture.dstRect.height = picture.srcRect.height;
        }
      }
    }
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMovePicturePath
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMovePicturePath = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.moveObjectPath(picture, this.params.path, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMovePicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMovePicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.moveObject(picture, this.params.picture.position, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTintPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTintPicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.tintObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandFlashPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandFlashPicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.flashObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandCropPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCropPicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    return this.interpreter.cropObject(picture, this.params);
  };


  /**
  * @method commandRotatePicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotatePicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.rotateObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomPicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.zoomObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBlendPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBlendPicture = function() {
    var picture;
    SceneManager.scene.behavior.changePictureDomain(this.params.numberDomain || "");
    picture = SceneManager.scene.pictures[this.interpreter.numberValueOf(this.params.number)];
    if (picture == null) {
      return;
    }
    this.interpreter.blendObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandShakePicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShakePicture = function() {
    var picture;
    picture = SceneManager.scene.pictures[this.interpreter.numberValueOf(this.params.number)];
    if (picture == null) {
      return;
    }
    this.interpreter.shakeObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMaskPicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMaskPicture = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.maskObject(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPictureMotionBlur
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPictureMotionBlur = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.objectMotionBlur(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPictureEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPictureEffect = function() {
    var number, picture, scene;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    this.interpreter.objectEffect(picture, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandErasePicture
  * @protected
   */

  Component_CommandInterpreter.prototype.commandErasePicture = function() {
    var animation, defaults, duration, easing, flags, isLocked, number, picture, scene;
    defaults = GameManager.defaults.picture;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changePictureDomain(this.params.numberDomain || "");
    number = this.interpreter.numberValueOf(this.params.number);
    picture = scene.pictures[number];
    if (picture == null) {
      return;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.disappearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
    picture.animator.disappear(animation, easing, duration, (function(_this) {
      return function(sender) {
        sender.dispose();
        scene.behavior.changePictureDomain(sender.domain);
        return scene.pictures[number] = null;
      };
    })(this));
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandInputNumber
  * @protected
   */

  Component_CommandInterpreter.prototype.commandInputNumber = function() {
    var scene;
    scene = SceneManager.scene;
    this.interpreter.isWaiting = true;
    if (this.interpreter.isProcessingMessageInOtherContext()) {
      this.interpreter.waitForMessage();
      return;
    }
    if ((GameManager.settings.allowChoiceSkip || this.interpreter.preview) && GameManager.tempSettings.skip) {
      this.interpreter.isWaiting = false;
      this.interpreter.messageObject().behavior.clear();
      this.interpreter.setNumberValueTo(this.params.variable, 0);
      return;
    }
    $tempFields.digits = this.params.digits;
    scene.behavior.showInputNumber(this.params.digits, gs.CallBack("onInputNumberFinish", this.interpreter, this.params));
    this.interpreter.waitingFor.inputNumber = this.params;
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandChoiceTimer
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChoiceTimer = function() {
    var scene;
    scene = SceneManager.scene;
    if (this.params.enabled) {
      return scene.behavior.showChoiceTimer(this.interpreter.numberValueOf(this.params.seconds), this.interpreter.numberValueOf(this.params.minutes));
    } else {
      return scene.choiceTimer.stop();
    }
  };


  /**
  * @method commandShowChoices
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowChoices = function() {
    var choices, defaultChoice, messageObject, pointer, scene;
    scene = SceneManager.scene;
    pointer = this.interpreter.pointer;
    choices = scene.choices || [];
    if ((GameManager.settings.allowChoiceSkip || this.interpreter.previewData) && GameManager.tempSettings.skip) {
      messageObject = this.interpreter.messageObject();
      if (messageObject != null ? messageObject.visible : void 0) {
        messageObject.behavior.clear();
      }
      defaultChoice = (choices.first(function(c) {
        return c.isDefault;
      })) || choices[0];
      if (defaultChoice.action.labelIndex != null) {
        this.interpreter.pointer = defaultChoice.action.labelIndex;
      } else {
        this.interpreter.jumpToLabel(defaultChoice.action.label);
      }
      scene.choices = [];
    } else {
      if (choices.length > 0) {
        this.interpreter.isWaiting = true;
        scene.behavior.showChoices(gs.CallBack("onChoiceAccept", this.interpreter, {
          pointer: pointer,
          params: this.params
        }));
      }
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandShowChoice
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowChoice = function() {
    var choices, command, commands, dstRect, index, pointer, scene;
    scene = SceneManager.scene;
    commands = this.interpreter.object.commands;
    command = null;
    index = 0;
    pointer = this.interpreter.pointer;
    choices = null;
    dstRect = null;
    switch (this.params.positionType) {
      case 0:
        dstRect = null;
        break;
      case 1:
        dstRect = new Rect(this.params.box.x, this.params.box.y, this.params.box.size.width, this.params.box.size.height);
    }
    if (!scene.choices) {
      scene.choices = [];
    }
    choices = scene.choices;
    return choices.push({
      dstRect: dstRect,
      interpreter: this.interpreter,
      text: this.interpreter.stringValueOf(this.params.text),
      index: index,
      action: this.params.action,
      isSelected: false,
      isDefault: this.params.defaultChoice,
      isEnabled: this.interpreter.booleanValueOf(this.params.enabled)
    });
  };


  /**
  * @method commandOpenMenu
  * @protected
   */

  Component_CommandInterpreter.prototype.commandOpenMenu = function() {
    SceneManager.switchTo(new gs.Object_Layout("menuLayout"), true);
    this.interpreter.waitCounter = 1;
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandOpenLoadMenu
  * @protected
   */

  Component_CommandInterpreter.prototype.commandOpenLoadMenu = function() {
    SceneManager.switchTo(new gs.Object_Layout("loadMenuLayout"), true);
    this.interpreter.waitCounter = 1;
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandOpenSaveMenu
  * @protected
   */

  Component_CommandInterpreter.prototype.commandOpenSaveMenu = function() {
    SceneManager.switchTo(new gs.Object_Layout("saveMenuLayout"), true);
    this.interpreter.waitCounter = 1;
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandReturnToTitle
  * @protected
   */

  Component_CommandInterpreter.prototype.commandReturnToTitle = function() {
    SceneManager.clear();
    SceneManager.switchTo(new gs.Object_Layout("titleLayout"));
    this.interpreter.waitCounter = 1;
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandPlayVideo
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPlayVideo = function() {
    var ref, scene;
    if ((GameManager.inLivePreview || GameManager.settings.allowVideoSkip) && GameManager.tempSettings.skip) {
      return;
    }
    GameManager.tempSettings.skip = false;
    scene = SceneManager.scene;
    if (((ref = this.params.video) != null ? ref.name : void 0) != null) {
      scene.video = ResourceManager.getVideo(ResourceManager.getPath(this.params.video));
      this.videoSprite = new Sprite(Graphics.viewport);
      this.videoSprite.srcRect = new Rect(0, 0, scene.video.width, scene.video.height);
      this.videoSprite.video = scene.video;
      this.videoSprite.zoomX = Graphics.width / scene.video.width;
      this.videoSprite.zoomY = Graphics.height / scene.video.height;
      this.videoSprite.z = 99999999;
      scene.video.onEnded = (function(_this) {
        return function() {
          _this.interpreter.isWaiting = false;
          _this.videoSprite.dispose();
          return scene.video = null;
        };
      })(this);
      scene.video.volume = this.params.volume / 100;
      scene.video.playbackRate = this.params.playbackRate / 100;
      this.interpreter.isWaiting = true;
      scene.video.play();
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandAudioDefaults
  * @protected
   */

  Component_CommandInterpreter.prototype.commandAudioDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.musicFadeInDuration)) {
      defaults.musicFadeInDuration = this.params.musicFadeInDuration;
    }
    if (!isLocked(flags.musicFadeOutDuration)) {
      defaults.musicFadeOutDuration = this.params.musicFadeOutDuration;
    }
    if (!isLocked(flags.musicVolume)) {
      defaults.musicVolume = this.params.musicVolume;
    }
    if (!isLocked(flags.musicPlaybackRate)) {
      defaults.musicPlaybackRate = this.params.musicPlaybackRate;
    }
    if (!isLocked(flags.soundVolume)) {
      defaults.soundVolume = this.params.soundVolume;
    }
    if (!isLocked(flags.soundPlaybackRate)) {
      defaults.soundPlaybackRate = this.params.soundPlaybackRate;
    }
    if (!isLocked(flags.voiceVolume)) {
      defaults.voiceVolume = this.params.voiceVolume;
    }
    if (!isLocked(flags.voicePlaybackRate)) {
      return defaults.voicePlaybackRate = this.params.voicePlaybackRate;
    }
  };


  /**
  * @method commandPlayMusic
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPlayMusic = function() {
    var defaults, fadeDuration, flags, isLocked, music, playRange, playTime, playbackRate, volume;
    if (this.params.music == null) {
      return;
    }
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    music = null;
    if (GameManager.settings.bgmEnabled) {
      fadeDuration = !isLocked(flags.fadeInDuration) ? this.params.fadeInDuration : defaults.musicFadeInDuration;
      volume = !isLocked(flags["music.volume"]) ? this.params.music.volume : defaults.musicVolume;
      playbackRate = !isLocked(flags["music.playbackRate"]) ? this.params.music.playbackRate : defaults.musicPlaybackRate;
      music = {
        name: this.params.music.name,
        folderPath: this.params.music.folderPath,
        volume: volume,
        playbackRate: playbackRate
      };
      if (this.params.playType === 1) {
        playTime = {
          min: this.params.playTime.min * 60,
          max: this.params.playTime.max * 60
        };
        playRange = {
          start: this.params.playRange.start * 60,
          end: this.params.playRange.end * 60
        };
        AudioManager.playMusicRandom(music, fadeDuration, this.params.layer || 0, playTime, playRange);
      } else {
        music = AudioManager.playMusic(this.params.music, volume, playbackRate, fadeDuration, this.params.layer || 0, this.params.loop);
      }
    }
    if (music && this.params.waitForCompletion && !this.params.loop) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = Math.round(music.duration * Graphics.frameRate);
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandStopMusic
  * @protected
   */

  Component_CommandInterpreter.prototype.commandStopMusic = function() {
    var defaults, fadeDuration, flags, isLocked;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    fadeDuration = !isLocked(flags.fadeOutDuration) ? this.params.fadeOutDuration : defaults.musicFadeOutDuration;
    AudioManager.stopMusic(fadeDuration, this.interpreter.numberValueOf(this.params.layer));
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPauseMusic
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPauseMusic = function() {
    var defaults, fadeDuration, flags, isLocked;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    fadeDuration = !isLocked(flags.fadeOutDuration) ? this.params.fadeOutDuration : defaults.musicFadeOutDuration;
    return AudioManager.stopMusic(fadeDuration, this.interpreter.numberValueOf(this.params.layer));
  };


  /**
  * @method commandResumeMusic
  * @protected
   */

  Component_CommandInterpreter.prototype.commandResumeMusic = function() {
    var defaults, fadeDuration, flags, isLocked;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    fadeDuration = !isLocked(flags.fadeInDuration) ? this.params.fadeInDuration : defaults.musicFadeInDuration;
    AudioManager.resumeMusic(fadeDuration, this.interpreter.numberValueOf(this.params.layer));
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandPlaySound
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPlaySound = function() {
    var defaults, flags, isLocked, playbackRate, sound, volume;
    defaults = GameManager.defaults.audio;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    sound = null;
    if (GameManager.settings.soundEnabled && !GameManager.tempSettings.skip) {
      volume = !isLocked(flags["sound.volume"]) ? this.params.sound.volume : defaults.soundVolume;
      playbackRate = !isLocked(flags["sound.playbackRate"]) ? this.params.sound.playbackRate : defaults.soundPlaybackRate;
      sound = AudioManager.playSound(this.params.sound, volume, playbackRate, this.params.musicEffect, null, this.params.loop);
    }
    gs.GameNotifier.postMinorChange();
    if (sound && this.params.waitForCompletion && !this.params.loop) {
      this.interpreter.isWaiting = true;
      return this.interpreter.waitCounter = Math.round(sound.duration * Graphics.frameRate);
    }
  };


  /**
  * @method commandStopSound
  * @protected
   */

  Component_CommandInterpreter.prototype.commandStopSound = function() {
    AudioManager.stopSound(this.params.sound.name);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandEndCommonEvent
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEndCommonEvent = function() {
    var event, eventId;
    eventId = this.interpreter.stringValueOf(this.params.commonEventId);
    event = GameManager.commonEvents[eventId];
    return event != null ? event.behavior.stop() : void 0;
  };


  /**
  * @method commandResumeCommonEvent
  * @protected
   */

  Component_CommandInterpreter.prototype.commandResumeCommonEvent = function() {
    var event, eventId;
    eventId = this.interpreter.stringValueOf(this.params.commonEventId);
    event = GameManager.commonEvents[eventId];
    return event != null ? event.behavior.resume() : void 0;
  };


  /**
  * @method commandCallCommonEvent
  * @protected
   */

  Component_CommandInterpreter.prototype.commandCallCommonEvent = function() {
    var eventId, list, params, scene;
    scene = SceneManager.scene;
    eventId = null;
    if (this.params.commonEventId.index != null) {
      eventId = this.interpreter.stringValueOf(this.params.commonEventId);
      list = this.interpreter.listObjectOf(this.params.parameters.values[0]);
      params = {
        values: list
      };
    } else {
      params = this.params.parameters;
      eventId = this.params.commonEventId;
    }
    return this.interpreter.callCommonEvent(eventId, params);
  };


  /**
  * @method commandChangeTextSettings
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeTextSettings = function() {
    var flags, font, fontName, fontSize, isLocked, number, padding, ref, ref1, ref2, ref3, ref4, scene, textSprite, texts;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    texts = scene.texts;
    if (texts[number] == null) {
      texts[number] = new gs.Object_Text();
      texts[number].visible = false;
    }
    textSprite = texts[number];
    padding = textSprite.behavior.padding;
    font = textSprite.font;
    fontName = this.interpreter.stringValueOf(textSprite.font.name);
    fontSize = this.interpreter.numberValueOf(textSprite.font.size);
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.lineSpacing)) {
      textSprite.textRenderer.lineSpacing = (ref = this.params.lineSpacing) != null ? ref : textSprite.textRenderer.lineSpacing;
    }
    if (!isLocked(flags.font)) {
      fontName = this.interpreter.stringValueOf(this.params.font);
    }
    if (!isLocked(flags.size)) {
      fontSize = this.interpreter.numberValueOf(this.params.size);
    }
    if (!isLocked(flags.font) || !isLocked(flags.size)) {
      textSprite.font = new Font(fontName, fontSize);
    }
    padding.left = !isLocked(flags["padding.0"]) ? (ref1 = this.params.padding) != null ? ref1[0] : void 0 : padding.left;
    padding.top = !isLocked(flags["padding.1"]) ? (ref2 = this.params.padding) != null ? ref2[1] : void 0 : padding.top;
    padding.right = !isLocked(flags["padding.2"]) ? (ref3 = this.params.padding) != null ? ref3[2] : void 0 : padding.right;
    padding.bottom = !isLocked(flags["padding.3"]) ? (ref4 = this.params.padding) != null ? ref4[3] : void 0 : padding.bottom;
    if (!isLocked(flags.bold)) {
      textSprite.font.bold = this.params.bold;
    }
    if (!isLocked(flags.italic)) {
      textSprite.font.italic = this.params.italic;
    }
    if (!isLocked(flags.smallCaps)) {
      textSprite.font.smallCaps = this.params.smallCaps;
    }
    if (!isLocked(flags.underline)) {
      textSprite.font.underline = this.params.underline;
    }
    if (!isLocked(flags.strikeThrough)) {
      textSprite.font.strikeThrough = this.params.strikeThrough;
    }
    textSprite.font.color = !isLocked(flags.color) ? new Color(this.params.color) : font.color;
    textSprite.font.border = !isLocked(flags.outline) ? this.params.outline : font.border;
    textSprite.font.borderColor = !isLocked(flags.outlineColor) ? new Color(this.params.outlineColor) : new Color(font.borderColor);
    textSprite.font.borderSize = !isLocked(flags.outlineSize) ? this.params.outlineSize : font.borderSize;
    textSprite.font.shadow = !isLocked(flags.shadow) ? this.params.shadow : font.shadow;
    textSprite.font.shadowColor = !isLocked(flags.shadowColor) ? new Color(this.params.shadowColor) : new Color(font.shadowColor);
    textSprite.font.shadowOffsetX = !isLocked(flags.shadowOffsetX) ? this.params.shadowOffsetX : font.shadowOffsetX;
    textSprite.font.shadowOffsetY = !isLocked(flags.shadowOffsetY) ? this.params.shadowOffsetY : font.shadowOffsetY;
    textSprite.behavior.refresh();
    return textSprite.update();
  };


  /**
  * @method commandChangeTextSettings
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTextDefaults = function() {
    var defaults, flags, isLocked;
    defaults = GameManager.defaults.text;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    if (!isLocked(flags.appearDuration)) {
      defaults.appearDuration = this.interpreter.durationValueOf(this.params.appearDuration);
    }
    if (!isLocked(flags.disappearDuration)) {
      defaults.disappearDuration = this.interpreter.durationValueOf(this.params.disappearDuration);
    }
    if (!isLocked(flags.zOrder)) {
      defaults.zOrder = this.interpreter.numberValueOf(this.params.zOrder);
    }
    if (!isLocked(flags["appearEasing.type"])) {
      defaults.appearEasing = this.params.appearEasing;
    }
    if (!isLocked(flags["appearAnimation.type"])) {
      defaults.appearAnimation = this.params.appearAnimation;
    }
    if (!isLocked(flags["disappearEasing.type"])) {
      defaults.disappearEasing = this.params.disappearEasing;
    }
    if (!isLocked(flags["disappearAnimation.type"])) {
      defaults.disappearAnimation = this.params.disappearAnimation;
    }
    if (!isLocked(flags["motionBlur.enabled"])) {
      defaults.motionBlur = this.params.motionBlur;
    }
    if (!isLocked(flags.origin)) {
      return defaults.origin = this.params.origin;
    }
  };


  /**
  * @method commandShowText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandShowText = function() {
    var animation, defaults, duration, easing, flags, isLocked, number, origin, p, positionAnchor, ref, scene, text, textObject, texts, x, y, zIndex;
    defaults = GameManager.defaults.text;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = this.params.text;
    texts = scene.texts;
    if (texts[number] == null) {
      texts[number] = new gs.Object_Text();
    }
    x = this.interpreter.numberValueOf(this.params.position.x);
    y = this.interpreter.numberValueOf(this.params.position.y);
    textObject = texts[number];
    textObject.domain = this.params.numberDomain;
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.appearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.appearDuration;
    origin = !isLocked(flags.origin) ? this.params.origin : defaults.origin;
    zIndex = !isLocked(flags.zOrder) ? this.interpreter.numberValueOf(this.params.zOrder) : defaults.zOrder;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.appearAnimation;
    positionAnchor = !isLocked(flags.positionOrigin) ? this.interpreter.graphicAnchorPointsByConstant[this.params.positionOrigin] || new gs.Point(0, 0) : this.interpreter.graphicAnchorPointsByConstant[defaults.positionOrigin];
    textObject.text = text;
    textObject.dstRect.x = x;
    textObject.dstRect.y = y;
    textObject.blendMode = this.interpreter.numberValueOf(this.params.blendMode);
    textObject.anchor.x = origin === 0 ? 0 : 0.5;
    textObject.anchor.y = origin === 0 ? 0 : 0.5;
    textObject.positionAnchor.x = positionAnchor.x;
    textObject.positionAnchor.y = positionAnchor.y;
    textObject.zIndex = zIndex || (700 + number);
    textObject.sizeToFit = true;
    textObject.formatting = true;
    if (((ref = this.params.viewport) != null ? ref.type : void 0) === "scene") {
      textObject.viewport = SceneManager.scene.behavior.viewport;
    }
    textObject.update();
    if (this.params.positionType === 0) {
      p = this.interpreter.predefinedObjectPosition(this.params.predefinedPositionId, textObject, this.params);
      textObject.dstRect.x = p.x;
      textObject.dstRect.y = p.y;
    }
    textObject.animator.appear(x, y, animation, easing, duration);
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTextMotionBlur
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTextMotionBlur = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    return text.motionBlur.set(this.params.motionBlur);
  };


  /**
  * @method commandRefreshText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRefreshText = function() {
    var number, scene, texts;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    texts = scene.texts;
    if (texts[number] == null) {
      return;
    }
    return texts[number].behavior.refresh(true);
  };


  /**
  * @method commandMoveText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveText = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    this.interpreter.moveObject(text, this.params.picture.position, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandMoveTextPath
  * @protected
   */

  Component_CommandInterpreter.prototype.commandMoveTextPath = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    this.interpreter.moveObjectPath(text, this.params.path, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandRotateText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandRotateText = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    this.interpreter.rotateObject(text, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandZoomText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandZoomText = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    this.interpreter.zoomObject(text, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandBlendText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandBlendText = function() {
    var text;
    SceneManager.scene.behavior.changeTextDomain(this.params.numberDomain);
    text = SceneManager.scene.texts[this.interpreter.numberValueOf(this.params.number)];
    if (text == null) {
      return;
    }
    this.interpreter.blendObject(text, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandColorText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandColorText = function() {
    var duration, easing, number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    duration = this.interpreter.durationValueOf(this.params.duration);
    easing = gs.Easings.fromObject(this.params.easing);
    if (text != null) {
      text.animator.colorTo(new Color(this.params.color), duration, easing);
      if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
        this.interpreter.isWaiting = true;
        this.interpreter.waitCounter = duration;
      }
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandEraseText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandEraseText = function() {
    var animation, defaults, duration, easing, flags, isLocked, number, scene, text;
    defaults = GameManager.defaults.text;
    flags = this.params.fieldFlags || {};
    isLocked = gs.CommandFieldFlags.isLocked;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    easing = !isLocked(flags["easing.type"]) ? gs.Easings.fromValues(this.interpreter.numberValueOf(this.params.easing.type), this.params.easing.inOut) : gs.Easings.fromObject(defaults.disappearEasing);
    duration = !isLocked(flags.duration) ? this.interpreter.durationValueOf(this.params.duration) : defaults.disappearDuration;
    animation = !isLocked(flags["animation.type"]) ? this.params.animation : defaults.disappearAnimation;
    text.animator.disappear(animation, easing, duration, (function(_this) {
      return function(sender) {
        sender.dispose();
        scene.behavior.changeTextDomain(sender.domain);
        return scene.texts[number] = null;
      };
    })(this));
    if (this.params.waitForCompletion && !(duration === 0 || this.interpreter.isInstantSkip())) {
      this.interpreter.isWaiting = true;
      this.interpreter.waitCounter = duration;
    }
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandTextEffect
  * @protected
   */

  Component_CommandInterpreter.prototype.commandTextEffect = function() {
    var number, scene, text;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    number = this.interpreter.numberValueOf(this.params.number);
    text = scene.texts[number];
    if (text == null) {
      return;
    }
    this.interpreter.objectEffect(text, this.params);
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandInputText
  * @protected
   */

  Component_CommandInterpreter.prototype.commandInputText = function() {
    var scene;
    scene = SceneManager.scene;
    scene.behavior.changeTextDomain(this.params.numberDomain);
    if ((GameManager.settings.allowChoiceSkip || this.interpreter.preview) && GameManager.tempSettings.skip) {
      this.interpreter.messageObject().behavior.clear();
      this.interpreter.setStringValueTo(this.params.variable, "");
      return;
    }
    this.interpreter.isWaiting = true;
    if (this.interpreter.isProcessingMessageInOtherContext()) {
      this.interpreter.waitForMessage();
      return;
    }
    $tempFields.letters = this.params.letters;
    scene.behavior.showInputText(this.params.letters, gs.CallBack("onInputTextFinish", this.interpreter, this.interpreter));
    this.interpreter.waitingFor.inputText = this.params;
    return gs.GameNotifier.postMinorChange();
  };


  /**
  * @method commandSavePersistentData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSavePersistentData = function() {
    return GameManager.saveGlobalData();
  };


  /**
  * @method commandSaveSettings
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSaveSettings = function() {
    return GameManager.saveSettings();
  };


  /**
  * @method commandPrepareSaveGame
  * @protected
   */

  Component_CommandInterpreter.prototype.commandPrepareSaveGame = function() {
    if (this.interpreter.previewData != null) {
      return;
    }
    this.interpreter.pointer++;
    GameManager.prepareSaveGame(this.params.snapshot);
    return this.interpreter.pointer--;
  };


  /**
  * @method commandSaveGame
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSaveGame = function() {
    var thumbHeight, thumbWidth;
    if (this.interpreter.previewData != null) {
      return;
    }
    thumbWidth = this.interpreter.numberValueOf(this.params.thumbWidth);
    thumbHeight = this.interpreter.numberValueOf(this.params.thumbHeight);
    return GameManager.save(this.interpreter.numberValueOf(this.params.slot) - 1, thumbWidth, thumbHeight);
  };


  /**
  * @method commandLoadGame
  * @protected
   */

  Component_CommandInterpreter.prototype.commandLoadGame = function() {
    if (this.interpreter.previewData != null) {
      return;
    }
    return GameManager.load(this.interpreter.numberValueOf(this.params.slot) - 1);
  };


  /**
  * @method commandWaitForInput
  * @protected
   */

  Component_CommandInterpreter.prototype.commandWaitForInput = function() {
    var f;
    if (this.interpreter.isInstantSkip()) {
      return;
    }
    gs.GlobalEventManager.offByOwner("mouseDown", this.interpreter.object);
    gs.GlobalEventManager.offByOwner("mouseUp", this.interpreter.object);
    gs.GlobalEventManager.offByOwner("keyDown", this.interpreter.object);
    gs.GlobalEventManager.offByOwner("keyUp", this.interpreter.object);
    f = (function(_this) {
      return function() {
        var executeAction, key, ref;
        if ((((ref = ObjectManager.current) != null ? ref.inputSession : void 0) || 0) !== _this.interpreter.numberValueOf(_this.params.inputSession || 0)) {
          return;
        }
        key = _this.interpreter.numberValueOf(_this.params.key);
        executeAction = false;
        if (Input.Mouse.isButton(_this.params.key)) {
          executeAction = Input.Mouse.buttons[_this.params.key] === _this.params.state;
        } else if (_this.params.key === 100) {
          if (Input.keyDown && _this.params.state === 1) {
            executeAction = true;
          }
          if (Input.keyUp && _this.params.state === 2) {
            executeAction = true;
          }
        } else if (_this.params.key === 101) {
          if (Input.Mouse.buttonDown && _this.params.state === 1) {
            executeAction = true;
          }
          if (Input.Mouse.buttonUp && _this.params.state === 2) {
            executeAction = true;
          }
        } else if (_this.params.key === 102) {
          if ((Input.keyDown || Input.Mouse.buttonDown) && _this.params.state === 1) {
            executeAction = true;
          }
          if ((Input.keyUp || Input.Mouse.buttonUp) && _this.params.state === 2) {
            executeAction = true;
          }
        } else {
          key = key > 100 ? key - 100 : key;
          executeAction = Input.keys[key] === _this.params.state;
        }
        if (executeAction) {
          _this.interpreter.isWaiting = false;
          gs.GlobalEventManager.offByOwner("mouseDown", _this.interpreter.object);
          gs.GlobalEventManager.offByOwner("mouseUp", _this.interpreter.object);
          gs.GlobalEventManager.offByOwner("keyDown", _this.interpreter.object);
          return gs.GlobalEventManager.offByOwner("keyUp", _this.interpreter.object);
        }
      };
    })(this);
    gs.GlobalEventManager.on("mouseDown", f, null, this.interpreter.object);
    gs.GlobalEventManager.on("mouseUp", f, null, this.interpreter.object);
    gs.GlobalEventManager.on("keyDown", f, null, this.interpreter.object);
    gs.GlobalEventManager.on("keyUp", f, null, this.interpreter.object);
    return this.interpreter.isWaiting = true;
  };


  /**
  * @method commandGetInputData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandGetInputData = function() {
    var anyButton, anyInput, anyKey, code, ref;
    if (((ref = gs.ObjectManager.current) != null ? ref.inputSession : void 0) !== this.interpreter.numberValueOf(this.params.inputSession || 0)) {
      return this.interpreter.setNumberValueTo(this.params.targetVariable, 0);
    }
    switch (this.params.field) {
      case 0:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.A]);
      case 1:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.B]);
      case 2:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.X]);
      case 3:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.Y]);
      case 4:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.L]);
      case 5:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.R]);
      case 6:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.START]);
      case 7:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[Input.SELECT]);
      case 8:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.x);
      case 9:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.y);
      case 10:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.wheel);
      case 11:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.buttons[Input.Mouse.LEFT]);
      case 12:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.buttons[Input.Mouse.RIGHT]);
      case 13:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.Mouse.buttons[Input.Mouse.MIDDLE]);
      case 100:
        anyKey = 0;
        if (Input.keyDown) {
          anyKey = 1;
        }
        if (Input.keyUp) {
          anyKey = 2;
        }
        return this.interpreter.setNumberValueTo(this.params.targetVariable, anyKey);
      case 101:
        anyButton = 0;
        if (Input.Mouse.buttonDown) {
          anyButton = 1;
        }
        if (Input.Mouse.buttonUp) {
          anyButton = 2;
        }
        return this.interpreter.setNumberValueTo(this.params.targetVariable, anyButton);
      case 102:
        anyInput = 0;
        if (Input.Mouse.buttonDown || Input.keyDown) {
          anyInput = 1;
        }
        if (Input.Mouse.buttonUp || Input.keyUp) {
          anyInput = 2;
        }
        return this.interpreter.setNumberValueTo(this.params.targetVariable, anyInput);
      default:
        code = this.params.field - 100;
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Input.keys[code]);
    }
  };


  /**
  * @method commandGetGameData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandGetGameData = function() {
    var ref, ref1, settings, tempSettings;
    tempSettings = GameManager.tempSettings;
    settings = GameManager.settings;
    switch (this.params.field) {
      case 0:
        return this.interpreter.setStringValueTo(this.params.targetVariable, SceneManager.scene.sceneDocument.uid);
      case 1:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(Graphics.frameCount / 60));
      case 2:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(Graphics.frameCount / 60 / 60));
      case 3:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(Graphics.frameCount / 60 / 60 / 60));
      case 4:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, new Date().getDate());
      case 5:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, new Date().getDay());
      case 6:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, new Date().getMonth());
      case 7:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, new Date().getFullYear());
      case 8:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.allowSkip);
      case 9:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.allowSkipUnreadMessages);
      case 10:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, settings.messageSpeed);
      case 11:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.autoMessage.enabled);
      case 12:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, settings.autoMessage.time);
      case 13:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.autoMessage.waitForVoice);
      case 14:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.autoMessage.stopOnAction);
      case 15:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.timeMessageToVoice);
      case 16:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.allowVideoSkip);
      case 17:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.allowChoiceSkip);
      case 18:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.skipVoiceOnAction);
      case 19:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.fullScreen);
      case 20:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.adjustAspectRatio);
      case 21:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.confirmation);
      case 22:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, settings.bgmVolume);
      case 23:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, settings.voiceVolume);
      case 24:
        return this.interpreter.setNumberValueTo(this.params.targetVariable, settings.seVolume);
      case 25:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.bgmEnabled);
      case 26:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.voiceEnabled);
      case 27:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, settings.seEnabled);
      case 28:
        return this.interpreter.setStringValueTo(this.params.targetVariable, ((ref = LanguageManager.language) != null ? ref.code : void 0) || "");
      case 29:
        return this.interpreter.setStringValueTo(this.params.targetVariable, ((ref1 = LanguageManager.language) != null ? ref1.name : void 0) || "");
      case 30:
        return this.interpreter.setBooleanValueTo(this.params.targetVariable, GameManager.tempSettings.skip);
    }
  };


  /**
  * @method commandSetGameData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSetGameData = function() {
    var code, language, settings, tempSettings;
    tempSettings = GameManager.tempSettings;
    settings = GameManager.settings;
    switch (this.params.field) {
      case 0:
        return settings.allowSkip = this.interpreter.booleanValueOf(this.params.switchValue);
      case 1:
        return settings.allowSkipUnreadMessages = this.interpreter.booleanValueOf(this.params.switchValue);
      case 2:
        return settings.messageSpeed = this.interpreter.numberValueOf(this.params.decimalValue);
      case 3:
        return settings.autoMessage.enabled = this.interpreter.booleanValueOf(this.params.switchValue);
      case 4:
        return settings.autoMessage.time = this.interpreter.numberValueOf(this.params.numberValue);
      case 5:
        return settings.autoMessage.waitForVoice = this.interpreter.booleanValueOf(this.params.switchValue);
      case 6:
        return settings.autoMessage.stopOnAction = this.interpreter.booleanValueOf(this.params.switchValue);
      case 7:
        return settings.timeMessageToVoice = this.interpreter.booleanValueOf(this.params.switchValue);
      case 8:
        return settings.allowVideoSkip = this.interpreter.booleanValueOf(this.params.switchValue);
      case 9:
        return settings.allowChoiceSkip = this.interpreter.booleanValueOf(this.params.switchValue);
      case 10:
        return settings.skipVoiceOnAction = this.interpreter.booleanValueOf(this.params.switchValue);
      case 11:
        settings.fullScreen = this.interpreter.booleanValueOf(this.params.switchValue);
        if (settings.fullScreen) {
          return SceneManager.scene.behavior.enterFullScreen();
        } else {
          return SceneManager.scene.behavior.leaveFullScreen();
        }
        break;
      case 12:
        settings.adjustAspectRatio = this.interpreter.booleanValueOf(this.params.switchValue);
        Graphics.keepRatio = !settings.adjustAspectRatio;
        return Graphics.onResize();
      case 13:
        return settings.confirmation = this.interpreter.booleanValueOf(this.params.switchValue);
      case 14:
        return settings.bgmVolume = this.interpreter.numberValueOf(this.params.numberValue);
      case 15:
        return settings.voiceVolume = this.interpreter.numberValueOf(this.params.numberValue);
      case 16:
        return settings.seVolume = this.interpreter.numberValueOf(this.params.numberValue);
      case 17:
        return settings.bgmEnabled = this.interpreter.booleanValueOf(this.params.switchValue);
      case 18:
        return settings.voiceEnabled = this.interpreter.booleanValueOf(this.params.switchValue);
      case 19:
        return settings.seEnabled = this.interpreter.booleanValueOf(this.params.switchValue);
      case 20:
        code = this.interpreter.stringValueOf(this.params.textValue);
        language = LanguageManager.languages.first((function(_this) {
          return function(l) {
            return l.code === code;
          };
        })(this));
        if (language) {
          return LanguageManager.selectLanguage(language);
        }
        break;
      case 21:
        return GameManager.tempSettings.skip = this.interpreter.booleanValueOf(this.params.switchValue);
    }
  };


  /**
  * @method commandGetObjectData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandGetObjectData = function() {
    var area, characterId, field, object, ref, ref1, scene;
    scene = SceneManager.scene;
    switch (this.params.objectType) {
      case 0:
        scene.behavior.changePictureDomain(this.params.numberDomain);
        object = SceneManager.scene.pictures[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 1:
        object = SceneManager.scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
        break;
      case 2:
        scene.behavior.changeTextDomain(this.params.numberDomain);
        object = SceneManager.scene.texts[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 3:
        scene.behavior.changeVideoDomain(this.params.numberDomain);
        object = SceneManager.scene.videos[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 4:
        characterId = this.interpreter.stringValueOf(this.params.characterId);
        object = SceneManager.scene.characters.first((function(_this) {
          return function(v) {
            return !v.disposed && v.rid === characterId;
          };
        })(this));
        break;
      case 5:
        object = gs.ObjectManager.current.objectById("messageBox");
        break;
      case 6:
        scene.behavior.changeMessageAreaDomain(this.params.numberDomain);
        area = SceneManager.scene.messageAreas[this.interpreter.numberValueOf(this.params.number)];
        object = area != null ? area.layout : void 0;
        break;
      case 7:
        scene.behavior.changeHotspotDomain(this.params.numberDomain);
        object = SceneManager.scene.hotspots[this.interpreter.numberValueOf(this.params.number)];
    }
    field = this.params.field;
    if (this.params.objectType === 4) {
      switch (this.params.field) {
        case 0:
          this.interpreter.setStringValueTo(this.params.targetVariable, ((ref = RecordManager.characters[characterId]) != null ? ref.index : void 0) || "");
          break;
        case 1:
          this.interpreter.setStringValueTo(this.params.targetVariable, lcs((ref1 = RecordManager.characters[characterId]) != null ? ref1.name : void 0) || "");
      }
      field -= 2;
    }
    if ((object != null) && this.params.objectType === 6) {
      switch (field) {
        case 0:
          return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.x);
        case 1:
          return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.y);
        case 2:
          return this.interpreter.setNumberValueTo(this.params.targetVariable, object.zIndex);
        case 3:
          return this.interpreter.setNumberValueTo(this.params.targetVariable, object.opacity);
        case 4:
          return this.interpreter.setBooleanValueTo(this.params.targetVariable, object.visible);
        case 5:
          return this.interpreter.setNumberValueTo(this.params.targetVariable, object.inputSession);
      }
    } else if (object != null) {
      if (field >= 0) {
        switch (field) {
          case 0:
            switch (this.params.objectType) {
              case 2:
                return this.interpreter.setStringValueTo(this.params.targetVariable, object.text || "");
              case 3:
                return this.interpreter.setStringValueTo(this.params.targetVariable, object.video || "");
              default:
                return this.interpreter.setStringValueTo(this.params.targetVariable, object.image ? (object.imageFolder || "") + "/" + (object.image || "") : "");
            }
            break;
          case 1:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.x);
          case 2:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.y);
          case 3:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(object.anchor.x * 100));
          case 4:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(object.anchor.y * 100));
          case 5:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(object.zoom.x * 100));
          case 6:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, Math.round(object.zoom.y * 100));
          case 7:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.width);
          case 8:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.dstRect.height);
          case 9:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.zIndex);
          case 10:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.opacity);
          case 11:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.angle);
          case 12:
            return this.interpreter.setBooleanValueTo(this.params.targetVariable, object.visible);
          case 13:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.blendMode);
          case 14:
            return this.interpreter.setBooleanValueTo(this.params.targetVariable, object.mirror);
          case 15:
            return this.interpreter.setNumberValueTo(this.params.targetVariable, object.inputSession);
        }
      }
    }
  };


  /**
  * @method commandSetObjectData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandSetObjectData = function() {
    var area, characterId, field, name, object, path, ref, scene;
    scene = SceneManager.scene;
    switch (this.params.objectType) {
      case 0:
        scene.behavior.changePictureDomain(this.params.numberDomain);
        object = SceneManager.scene.pictures[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 1:
        object = SceneManager.scene.backgrounds[this.interpreter.numberValueOf(this.params.layer)];
        break;
      case 2:
        scene.behavior.changeTextDomain(this.params.numberDomain);
        object = SceneManager.scene.texts[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 3:
        scene.behavior.changeVideoDomain(this.params.numberDomain);
        object = SceneManager.scene.videos[this.interpreter.numberValueOf(this.params.number)];
        break;
      case 4:
        characterId = this.interpreter.stringValueOf(this.params.characterId);
        object = SceneManager.scene.characters.first((function(_this) {
          return function(v) {
            return !v.disposed && v.rid === characterId;
          };
        })(this));
        break;
      case 5:
        object = gs.ObjectManager.current.objectById("messageBox");
        break;
      case 6:
        scene.behavior.changeMessageAreaDomain(this.params.numberDomain);
        area = SceneManager.scene.messageAreas[this.interpreter.numberValueOf(this.params.number)];
        object = area != null ? area.layout : void 0;
        break;
      case 7:
        scene.behavior.changeHotspotDomain(this.params.numberDomain);
        object = SceneManager.scene.hotspots[this.interpreter.numberValueOf(this.params.number)];
    }
    field = this.params.field;
    if (this.params.objectType === 4) {
      switch (field) {
        case 0:
          name = this.interpreter.stringValueOf(this.params.textValue);
          if (object != null) {
            object.name = name;
          }
          if ((ref = RecordManager.characters[characterId]) != null) {
            ref.name = name;
          }
      }
      field--;
    }
    if ((object != null) && this.params.objectType === 6) {
      switch (field) {
        case 0:
          return object.dstRect.x = this.interpreter.numberValueOf(this.params.numberValue);
        case 1:
          return object.dstRect.y = this.interpreter.numberValueOf(this.params.numberValue);
        case 2:
          return object.zIndex = this.interpreter.numberValueOf(this.params.numberValue);
        case 3:
          return object.opacity = this.interpreter.numberValueOf(this.params.numberValue);
        case 4:
          return object.visible = this.interpreter.booleanValueOf(this.params.switchValue);
        case 5:
          return object.inputSession = this.interpreter.numberValueOf(this.params.numberValue);
      }
    } else if (object != null) {
      if (field >= 0) {
        switch (field) {
          case 0:
            switch (this.params.objectType) {
              case 2:
                return object.text = this.interpreter.stringValueOf(this.params.textValue);
              case 3:
                return object.video = this.interpreter.stringValueOf(this.params.textValue);
              default:
                path = this.interpreter.stringValueOf(this.params.textValue);
                if (path) {
                  object.image = path.split("/").last() || "";
                  return object.imageFolder = path.split("/").slice(0, -1).join("/") || "";
                } else {
                  return object.image = "";
                }
            }
            break;
          case 1:
            return object.dstRect.x = this.interpreter.numberValueOf(this.params.numberValue);
          case 2:
            return object.dstRect.y = this.interpreter.numberValueOf(this.params.numberValue);
          case 3:
            return object.anchor.x = this.interpreter.numberValueOf(this.params.numberValue) / 100;
          case 4:
            return object.anchor.y = this.interpreter.numberValueOf(this.params.numberValue) / 100;
          case 5:
            return object.zoom.x = this.interpreter.numberValueOf(this.params.numberValue) / 100;
          case 6:
            return object.zoom.y = this.interpreter.numberValueOf(this.params.numberValue) / 100;
          case 7:
            return object.zIndex = this.interpreter.numberValueOf(this.params.numberValue);
          case 8:
            return object.opacity = this.interpreter.numberValueOf(this.params.numberValue);
          case 9:
            return object.angle = this.interpreter.numberValueOf(this.params.numberValue);
          case 10:
            return object.visible = this.interpreter.booleanValueOf(this.params.switchValue);
          case 11:
            return object.blendMode = this.interpreter.numberValueOf(this.params.numberValue);
          case 12:
            return object.mirror = this.interpreter.booleanValueOf(this.params.switchValue);
          case 13:
            return object.inputSession = this.interpreter.numberValueOf(this.params.numberValue);
        }
      }
    }
  };


  /**
  * @method commandChangeSounds
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeSounds = function() {
    var fieldFlags, i, k, len, ref, results, sound, sounds;
    sounds = RecordManager.system.sounds;
    fieldFlags = this.params.fieldFlags || {};
    ref = this.params.sounds;
    results = [];
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      sound = ref[i];
      if (!gs.CommandFieldFlags.isLocked(fieldFlags["sounds." + i])) {
        results.push(sounds[i] = this.params.sounds[i]);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * @method commandChangeColors
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeColors = function() {
    var color, colors, fieldFlags, i, k, len, ref, results;
    colors = RecordManager.system.colors;
    fieldFlags = this.params.fieldFlags || {};
    ref = this.params.colors;
    results = [];
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      color = ref[i];
      if (!gs.CommandFieldFlags.isLocked(fieldFlags["colors." + i])) {
        results.push(colors[i] = new gs.Color(this.params.colors[i]));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * @method commandChangeScreenCursor
  * @protected
   */

  Component_CommandInterpreter.prototype.commandChangeScreenCursor = function() {
    var bitmap, ref, ref1, ref2;
    if (((ref = this.params.graphic) != null ? ref.name : void 0) != null) {
      bitmap = ResourceManager.getBitmap(((ref1 = (ref2 = this.params.graphic) != null ? ref2.folderPath : void 0) != null ? ref1 : "Graphics/Pictures") + "/" + this.params.graphic.name);
      return Graphics.setCursorBitmap(bitmap, this.params.hx, this.params.hy);
    } else {
      return Graphics.setCursorBitmap(null, 0, 0);
    }
  };


  /**
  * @method commandResetGlobalData
  * @protected
   */

  Component_CommandInterpreter.prototype.commandResetGlobalData = function() {
    return GameManager.resetGlobalData();
  };


  /**
  * @method commandScript
  * @protected
   */

  Component_CommandInterpreter.prototype.commandScript = function() {
    var ex;
    try {
      if (!this.params.scriptFunc) {
        this.params.scriptFunc = eval("(function(){" + this.params.script + "})");
      }
      return this.params.scriptFunc();
    } catch (error) {
      ex = error;
      return console.log(ex);
    }
  };

  return Component_CommandInterpreter;

})(gs.Component);

window.CommandInterpreter = Component_CommandInterpreter;

gs.Component_CommandInterpreter = Component_CommandInterpreter;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsNEJBQUE7RUFBQTs7O0FBQU07OztFQUNGLDRCQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxRQUFELEVBQVcsU0FBWCxFQUFzQixxQkFBdEIsRUFBNkMsdUJBQTdDLEVBQXNFLG9CQUF0RTs7O0FBRXhCOzs7Ozs7Ozs7eUNBUUEsbUJBQUEsR0FBcUIsU0FBQyxJQUFELEVBQU8sT0FBUCxHQUFBOzs7QUFHckI7Ozs7Ozs7Ozs7Ozs7RUFZYSxzQ0FBQTtJQUNULDREQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBRWY7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7O0lBTUEsSUFBQyxDQUFBLFVBQUQsR0FBYzs7QUFFZDs7Ozs7O0lBTUEsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUdULElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7OztJQU1BLElBQUMsQ0FBQSxTQUFELEdBQWE7O0FBRWI7Ozs7O0lBS0EsSUFBQyxDQUFBLFNBQUQsR0FBYTs7QUFFYjs7Ozs7OztJQU9BLElBQUMsQ0FBQSxtQkFBRCxHQUF1Qjs7QUFFdkI7Ozs7Ozs7Ozs7Ozs7SUFhQSxJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLEVBQUUsQ0FBQyxlQUFILENBQUE7O0FBRW5COzs7Ozs7SUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7OztJQU1BLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxFQUFFLENBQUMsa0JBQUgsQ0FBc0IsQ0FBdEIsRUFBeUIsSUFBekI7O0FBRWY7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsY0FBRCxHQUFrQjs7QUFFbEI7Ozs7OztJQU1BLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsVUFBRCxHQUFjOztBQUVkOzs7Ozs7SUFNQSxJQUFDLENBQUEsUUFBRCxHQUFZO01BQUUsT0FBQSxFQUFTO1FBQUUsSUFBQSxFQUFNLEVBQVI7UUFBWSxTQUFBLEVBQVcsSUFBdkI7UUFBNEIsU0FBQSxFQUFXLElBQXZDO1FBQTRDLE9BQUEsRUFBUyxJQUFyRDtPQUFYO01BQXVFLE1BQUEsRUFBUTtRQUFFLEdBQUEsRUFBUyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsQ0FBVCxFQUFZLENBQVosQ0FBWDtPQUEvRTs7O0FBRVo7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsNkJBQUQsR0FBaUMsQ0FDekIsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLEdBQVQsRUFBYyxHQUFkLENBRHlCLEVBRXpCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxHQUFULEVBQWMsR0FBZCxDQUZ5QixFQUd6QixJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsR0FBVCxFQUFjLEdBQWQsQ0FIeUIsRUFJekIsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLEdBQVQsRUFBYyxHQUFkLENBSnlCLEVBS3pCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxHQUFULEVBQWMsR0FBZCxDQUx5QixFQU16QixJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsR0FBVCxFQUFjLEdBQWQsQ0FOeUIsRUFPekIsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLEdBQVQsRUFBYyxHQUFkLENBUHlCLEVBUXpCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxHQUFULEVBQWMsR0FBZCxDQVJ5QixFQVN6QixJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsR0FBVCxFQUFjLEdBQWQsQ0FUeUI7RUEzSXhCOzt5Q0F1SmIsY0FBQSxHQUFnQixTQUFDLENBQUQsRUFBSSxJQUFKO1dBQ1osSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFuQyxFQUE0QyxLQUE1QyxFQUFnRCxJQUFJLENBQUMsU0FBckQ7RUFEWTs7eUNBRWhCLGNBQUEsR0FBZ0IsU0FBQyxDQUFELEVBQUksSUFBSjtXQUNaLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBbkMsRUFBNEMsSUFBNUMsRUFBaUQsSUFBSSxDQUFDLFNBQXREO0VBRFk7O3lDQUVoQixjQUFBLEdBQWdCLFNBQUMsQ0FBRCxFQUFJLElBQUo7V0FDWixJQUFDLENBQUEsYUFBRCxDQUFlLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQW5DLEVBQTRDLEtBQTVDLEVBQWdELElBQUksQ0FBQyxTQUFyRDtFQURZOzt5Q0FFaEIsa0JBQUEsR0FBb0IsU0FBQyxDQUFELEVBQUksSUFBSjtXQUNoQixJQUFDLENBQUEsYUFBRCxDQUFlLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQW5DLEVBQTJDLElBQTNDLEVBQWdELElBQUksQ0FBQyxTQUFyRDtFQURnQjs7eUNBRXBCLGFBQUEsR0FBZSxTQUFDLENBQUQsRUFBSSxJQUFKO1dBQ1gsSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFuQyxFQUEyQyxJQUEzQyxFQUFnRCxJQUFJLENBQUMsU0FBckQ7RUFEVzs7eUNBRWYsZ0JBQUEsR0FBa0IsU0FBQyxDQUFELEVBQUksSUFBSjtXQUNkLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBbkMsRUFBMkMsS0FBM0MsRUFBK0MsSUFBSSxDQUFDLFNBQXBEO0VBRGM7O3lDQUVsQixhQUFBLEdBQWUsU0FBQyxDQUFELEVBQUksSUFBSjtJQUNYLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBbkMsRUFBMkMsS0FBM0MsRUFBK0MsSUFBSSxDQUFDLFNBQXBEO1dBQ0EsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQXRCLENBQTJCLGFBQTNCLEVBQTBDLENBQUMsQ0FBQyxNQUE1QztFQUZXOzt5Q0FHZixxQkFBQSxHQUF1QixTQUFDLENBQUQsRUFBSSxJQUFKO1dBQ25CLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBbkMsRUFBa0QsSUFBbEQsRUFBdUQsSUFBSSxDQUFDLFNBQTVEO0VBRG1COzt5Q0FFdkIscUJBQUEsR0FBdUIsU0FBQyxDQUFELEVBQUksTUFBSjtJQUNuQixJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQXJCO2FBQ0ksSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQTlCLEVBQXdDLElBQXhDLEVBREo7S0FBQSxNQUFBO2FBR0ksSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQTlCLEVBQTBDLEtBQTFDLEVBSEo7O0VBRG1COzs7QUFNdkI7Ozs7Ozs7Ozt5Q0FRQSxtQkFBQSxHQUFxQixTQUFDLENBQUQ7QUFDakIsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN6QixJQUFHLENBQUMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFrQixDQUFDLFNBQXZCO01BQ0ksSUFBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBakI7UUFDSSxJQUFDLENBQUEsU0FBRCxHQUFhLE1BRGpCOztNQUVBLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBM0IsR0FBdUM7TUFDdkMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUEzQixHQUF1QyxNQUozQzs7SUFLQSxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQXJCLENBQXlCLFNBQXpCLEVBQW9DLENBQUMsQ0FBQyxPQUF0QztJQUVBLElBQUcsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFrQixDQUFDLE9BQW5CLElBQStCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxTQUF2QixJQUFvQyxhQUFhLENBQUMsUUFBUSxDQUFDLGdCQUF2QixHQUEwQyxDQUEvRSxDQUFsQzthQUNJLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBcEIsQ0FBeUI7UUFBRSxTQUFBLEVBQVcsYUFBYSxDQUFDLFNBQTNCO1FBQXNDLE9BQUEsRUFBUyxhQUFhLENBQUMsWUFBWSxDQUFDLHdCQUEzQixDQUFvRCxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQTNFLENBQS9DO1FBQW9JLE9BQUEsRUFBUyxFQUE3STtPQUF6QixFQURKOztFQVRpQjs7O0FBWXJCOzs7Ozs7Ozt5Q0FPQSxxQkFBQSxHQUF1QixTQUFDLGFBQUQsRUFBZ0IsaUJBQWhCO0lBQ25CLFlBQVksQ0FBQyxLQUFLLENBQUMsZ0JBQW5CLEdBQXNDO01BQUUsSUFBQSxFQUFNLEVBQVI7O0lBQ3RDLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBdkIsQ0FBQTtJQUNBLGFBQWEsQ0FBQyxPQUFkLEdBQXdCO0lBRXhCLElBQUcsYUFBYSxDQUFDLGlCQUFqQjtNQUNJLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFEakI7O1dBRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFaLEdBQXlCO0VBUE47OztBQVN2Qjs7Ozs7Ozs7eUNBT0EsaUJBQUEsR0FBbUIsU0FBQyxhQUFELEVBQWdCLGlCQUFoQjtBQUNmLFFBQUE7SUFBQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxhQUFELENBQUE7SUFDaEIsSUFBRyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQWtCLENBQUMsT0FBbkIseURBQTRELENBQUUsZ0JBQWpFO01BQ0ksV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFwQixDQUF5QjtRQUFFLFNBQUEsRUFBVyxhQUFhLENBQUMsU0FBM0I7UUFBc0MsT0FBQSxFQUFTLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBdEU7UUFBK0UsT0FBQSxFQUFTLEVBQXhGO09BQXpCLEVBREo7O1dBRUEsSUFBQyxDQUFBLHFCQUFELENBQXVCLGFBQXZCLEVBQXNDLGlCQUF0QztFQUplOzs7QUFRbkI7Ozs7Ozs7Ozt5Q0FRQSxRQUFBLEdBQVUsU0FBQyxDQUFEO0lBQ04sSUFBQyxDQUFBLFdBQUQsQ0FBYSxDQUFDLENBQUMsS0FBZjtXQUNBLElBQUMsQ0FBQSxTQUFELEdBQWE7RUFGUDs7O0FBSVY7Ozs7Ozs7Ozt5Q0FRQSxpQkFBQSxHQUFtQixTQUFDLENBQUQ7QUFDZixRQUFBO0lBQUEsT0FBQSxHQUFVLENBQUMsQ0FBQztJQUNaLEtBQUEsR0FBUSxhQUFhLENBQUMsWUFBYSxDQUFBLE9BQUE7SUFDbkMsSUFBRyxDQUFDLEtBQUo7TUFDSSxLQUFBLEdBQVEsYUFBYSxDQUFDLFlBQVksQ0FBQyxLQUEzQixDQUFpQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtpQkFBTyxDQUFDLENBQUMsSUFBRixLQUFVO1FBQWpCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQztNQUNSLElBQXlCLEtBQXpCO1FBQUEsT0FBQSxHQUFVLEtBQUssQ0FBQyxNQUFoQjtPQUZKOztJQUdBLElBQUMsQ0FBQSxlQUFELENBQWlCLE9BQWpCLEVBQTBCLENBQUMsQ0FBQyxNQUFGLElBQVksRUFBdEMsRUFBMEMsQ0FBQyxDQUFDLENBQUMsTUFBN0M7V0FDQSxJQUFDLENBQUEsU0FBRCxxQ0FBeUI7RUFQVjs7O0FBU25COzs7Ozs7Ozt5Q0FPQSxrQkFBQSxHQUFvQixTQUFDLENBQUQ7QUFDaEIsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUV6QixJQUFHLENBQUksSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFrQixDQUFDLFNBQTFCO0FBQXlDLGFBQXpDOztJQUVBLFdBQVcsQ0FBQyxVQUFVLENBQUMsUUFBUyxDQUFBLElBQUEsQ0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFuQixDQUFBLENBQWhDLEdBQStEO01BQUUsSUFBQSxFQUFNLElBQVI7O0lBQy9ELFdBQVcsQ0FBQyxjQUFaLENBQUE7SUFDQSxJQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFqQjtNQUNJLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFEakI7O0lBRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFaLEdBQXlCO0lBQ3pCLE9BQUEsR0FBVSxJQUFDLENBQUE7SUFDWCxRQUFBLEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUVuQixhQUFhLENBQUMsTUFBTSxDQUFDLEdBQXJCLENBQXlCLFFBQXpCLEVBQW1DLENBQUMsQ0FBQyxPQUFyQztJQUdBLElBQUcsNkJBQUEsSUFBeUIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxpQkFBakQ7TUFDSSxZQUFZLENBQUMsU0FBYixDQUF1QixhQUFhLENBQUMsS0FBSyxDQUFDLElBQTNDLEVBREo7O0lBR0EsSUFBRyxDQUFJLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixPQUFsQixFQUEyQixRQUEzQixDQUFKLElBQTZDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBa0IsQ0FBQyxTQUFuRTtNQUNJLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFDYixJQUFDLENBQUEsVUFBVSxDQUFDLFVBQVosR0FBeUIsQ0FBQyxDQUFDLElBQUksQ0FBQztNQUVoQyxNQUFBLEdBQVMsV0FBVyxDQUFDLFlBQVksQ0FBQztNQUNsQyxRQUFBLEdBQWMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUE1QixHQUFzQyxDQUF0QyxHQUE2QyxNQUFNLENBQUM7TUFFL0QsYUFBYSxDQUFDLGlCQUFkLEdBQWtDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ2hELGFBQWEsQ0FBQyxRQUFRLENBQUMsU0FBdkIsQ0FBaUMsTUFBTSxDQUFDLFNBQXhDLEVBQW1ELE1BQU0sQ0FBQyxNQUExRCxFQUFrRSxRQUFsRSxFQUE0RSxFQUFFLENBQUMsUUFBSCxDQUFZLHVCQUFaLEVBQXFDLElBQXJDLEVBQTJDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUF6RCxDQUE1RSxFQVJKOztFQW5CZ0I7OztBQTZCcEI7Ozs7Ozs7Ozt5Q0FRQSxtQkFBQSxHQUFxQixTQUFDLENBQUQ7QUFDakIsUUFBQTtJQUFBLFlBQVksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsWUFBeEMsQ0FBcUQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUE5RDtJQUNBLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUF2QixDQUEyQixRQUEzQjtJQUNBLElBQUMsQ0FBQSxjQUFELEdBQWtCO1dBQ2xCLElBQUMsQ0FBQSxTQUFELDBDQUE4QjtFQUpiOzs7QUFNckI7Ozs7Ozs7O3lDQU9BLGlCQUFBLEdBQW1CLFNBQUMsTUFBRDtJQUNmLElBQUMsQ0FBQSxTQUFELEdBQWE7V0FDYixJQUFDLENBQUEsY0FBRCxHQUFrQjtFQUZIOzs7QUFJbkI7Ozs7Ozs7eUNBTUEsWUFBQSxHQUFjLFNBQUE7SUFDVixJQUFHLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBcEIsRUFBdUIsQ0FBdkIsQ0FBcEIsRUFBK0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUF2RCxDQUFIO2FBQ0k7UUFBQSxPQUFBLEVBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsT0FBRCxHQUFXLENBQXBCLEVBQXdCLENBQXhCLENBQVQ7UUFDQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BRFQ7UUFFQSxVQUFBLEVBQVksSUFBQyxDQUFBLFVBRmI7UUFHQSxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBSFI7UUFJQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BSlQ7UUFLQSxTQUFBLEVBQVcsS0FMWDtRQU1BLFNBQUEsRUFBVyxJQUFDLENBQUEsU0FOWjtRQU9BLFdBQUEsRUFBYSxJQUFDLENBQUEsV0FQZDtRQVFBLFVBQUEsRUFBWSxJQUFDLENBQUEsVUFSYjtRQVNBLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFUVDtRQVVBLFFBQUEsRUFBVSxJQUFDLENBQUEsUUFWWDtRQURKO0tBQUEsTUFBQTthQWFJO1FBQUEsT0FBQSxFQUFTLElBQUMsQ0FBQSxPQUFWO1FBQ0EsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQURUO1FBRUEsVUFBQSxFQUFZLElBQUMsQ0FBQSxVQUZiO1FBR0EsS0FBQSxFQUFPLElBQUMsQ0FBQSxLQUhSO1FBSUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUpUO1FBS0EsU0FBQSxFQUFXLElBQUMsQ0FBQSxTQUxaO1FBTUEsU0FBQSxFQUFXLElBQUMsQ0FBQSxTQU5aO1FBT0EsV0FBQSxFQUFhLElBQUMsQ0FBQSxXQVBkO1FBUUEsVUFBQSxFQUFZLElBQUMsQ0FBQSxVQVJiO1FBU0EsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQVRUO1FBVUEsUUFBQSxFQUFVLElBQUMsQ0FBQSxRQVZYO1FBYko7O0VBRFU7OztBQTBCZDs7Ozs7Ozt5Q0FNQSxPQUFBLEdBQVMsU0FBQTtBQUNMLFFBQUE7QUFBQTtNQUNJLElBQVUsQ0FBQyxPQUFPLENBQUMsT0FBVCxJQUFvQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBL0M7QUFBQSxlQUFBOztNQUNBLFlBQVksQ0FBQyxhQUFiLENBQUE7TUFDQSxZQUFZLENBQUMsWUFBYixDQUFBO01BQ0EsWUFBWSxDQUFDLGFBQWIsQ0FBQTtNQUNBLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBbkIsR0FBNkI7TUFDN0IsV0FBVyxDQUFDLFdBQVosQ0FBQTtNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsT0FBTyxDQUFDO01BQ3ZCLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUF0QixDQUEyQixnQkFBM0I7TUFDQSxJQUFHLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBaEI7UUFDSSxZQUFBLENBQWEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUExQixFQURKOztNQUdBLElBQUcsUUFBUSxDQUFDLE9BQVo7UUFDSSxRQUFRLENBQUMsT0FBVCxHQUFtQjtRQUNuQixRQUFRLENBQUMsV0FBVCxDQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDLGFBQTdCLEVBRko7O01BSUEsS0FBQSxHQUFZLElBQUEsRUFBRSxDQUFDLFlBQUgsQ0FBQTtNQUVaLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBaEIsR0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFLLENBQUM7YUFDekMsWUFBWSxDQUFDLFFBQWIsQ0FBc0IsS0FBdEIsRUFuQko7S0FBQSxhQUFBO01Bb0JNO2FBQ0YsT0FBTyxDQUFDLElBQVIsQ0FBYSxFQUFiLEVBckJKOztFQURLOzs7QUF3QlQ7Ozs7Ozt5Q0FLQSxLQUFBLEdBQU8sU0FBQTtJQUNILHlEQUFBLFNBQUE7SUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLE9BQU8sQ0FBQztJQUN2QixJQUFHLElBQUMsQ0FBQSxXQUFKO2FBQ0ksRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQXRCLENBQXlCLFdBQXpCLEVBQXNDLENBQUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ25DLElBQUcsS0FBQyxDQUFBLFdBQVcsQ0FBQyxPQUFoQjtZQUNJLElBQUcsS0FBQyxDQUFBLFdBQVcsQ0FBQyxPQUFoQjtjQUNJLFlBQUEsQ0FBYSxLQUFDLENBQUEsV0FBVyxDQUFDLE9BQTFCLEVBREo7O1lBRUEsS0FBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLEdBQXVCO1lBRXZCLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBekIsR0FBZ0M7WUFDaEMsS0FBQyxDQUFBLFdBQUQsR0FBZTttQkFDZixFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBdEIsQ0FBMkIsZ0JBQTNCLEVBUEo7O1FBRG1DO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFELENBQXRDLEVBU08sSUFUUCxFQVNhLElBQUMsQ0FBQSxNQVRkLEVBREo7O0VBSkc7OztBQWdCUDs7Ozs7O3lDQUtBLE9BQUEsR0FBUyxTQUFBO0lBQ0wsSUFBRyxJQUFDLENBQUEsV0FBSjtNQUNJLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUF0QixDQUFpQyxXQUFqQyxFQUE4QyxJQUFDLENBQUEsTUFBL0MsRUFESjs7V0FJQSwyREFBQSxTQUFBO0VBTEs7O3lDQVFULGFBQUEsR0FBZSxTQUFBO1dBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUF6QixJQUFrQyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQXpCLEtBQXFDO0VBQTFFOzs7QUFFZjs7Ozs7Ozt5Q0FNQSxPQUFBLEdBQVMsU0FBQSxHQUFBOzs7QUFFVDs7Ozs7Ozt5Q0FNQSxnQkFBQSxHQUFrQixTQUFBO1dBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBekIsQ0FBb0Msd0JBQXBDO0VBQUg7OztBQUVsQjs7Ozs7Ozt5Q0FNQSxnQkFBQSxHQUFrQixTQUFBO1dBQ2QsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBekIsQ0FBb0MscUJBQXBDO0VBRGM7OztBQUdsQjs7Ozs7O3lDQUtBLEtBQUEsR0FBTyxTQUFBO0lBQ0gsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUNkLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDVCxJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUNYLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDYixJQUFDLENBQUEsU0FBRCxHQUFhO0lBQ2IsSUFBQyxDQUFBLGNBQUQsR0FBa0I7V0FDbEIsSUFBQyxDQUFBLFdBQUQsR0FBZTtFQVJaOzs7QUFVUDs7Ozs7O3lDQUtBLElBQUEsR0FBTSxTQUFBO1dBQ0YsSUFBQyxDQUFBLFNBQUQsR0FBYTtFQURYOzs7QUFHTjs7Ozs7O3lDQUtBLE1BQUEsR0FBUSxTQUFBO1dBQ0osSUFBQyxDQUFBLFNBQUQsR0FBYTtFQURUOzs7QUFHUjs7Ozs7Ozs7eUNBT0EsTUFBQSxHQUFRLFNBQUE7SUFDSixJQUFHLDJCQUFIO01BQ0ksSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixDQUFBO0FBQ0EsYUFGSjs7SUFJQSxXQUFXLENBQUMsYUFBYSxDQUFDLGtCQUExQixDQUE2QyxJQUFDLENBQUEsT0FBOUM7SUFFQSxJQUFHLENBQUssOEJBQUosSUFBeUIsSUFBQyxDQUFBLE9BQUQsSUFBWSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUF2RCxDQUFBLElBQW1FLENBQUksSUFBQyxDQUFBLFNBQTNFO01BQ0ksSUFBRyxJQUFDLENBQUEsTUFBSjtRQUNJLElBQUMsQ0FBQSxLQUFELENBQUEsRUFESjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsU0FBSjtRQUNELElBQUMsQ0FBQSxTQUFELEdBQWE7UUFDYixJQUFHLHFCQUFIO1VBQW1CLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBVixFQUFuQjs7QUFDQSxlQUhDO09BSFQ7O0lBUUEsSUFBRyxDQUFJLElBQUMsQ0FBQSxTQUFSO0FBQXVCLGFBQXZCOztJQUVBLElBQUcsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUF4QjtNQUNJLGFBQWEsQ0FBQyxxQkFBZCxDQUFvQyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQTVDLEVBREo7O0lBR0EsSUFBRyxJQUFDLENBQUEsV0FBRCxHQUFlLENBQWxCO01BQ0ksSUFBQyxDQUFBLFdBQUQ7TUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxXQUFELEdBQWU7QUFDNUIsYUFISjs7SUFLQSxJQUFHLElBQUMsQ0FBQSxtQkFBSjtNQUNJLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFDYixJQUFHLENBQUksSUFBQyxDQUFBLGlDQUFELENBQUEsQ0FBUDtRQUNJLElBQUMsQ0FBQSxTQUFELEdBQWE7UUFDYixJQUFDLENBQUEsbUJBQUQsR0FBdUIsTUFGM0I7T0FBQSxNQUFBO0FBSUksZUFKSjtPQUZKOztJQVFBLElBQUcsV0FBVyxDQUFDLGFBQWY7QUFDSSxhQUFNLENBQUksQ0FBQyxJQUFDLENBQUEsU0FBRCxJQUFjLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBNUIsQ0FBSixJQUE2QyxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQXpFLElBQW9GLElBQUMsQ0FBQSxTQUEzRjtRQUNJLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQUMsQ0FBQSxPQUFqQjtRQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWI7UUFFQSxJQUFHLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsR0FBZ0MsR0FBbkM7VUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLEdBQWdDO1VBQ2hDLElBQUMsQ0FBQSxTQUFELEdBQWE7VUFDYixJQUFDLENBQUEsV0FBRCxHQUFlLEVBSG5COztNQUxKLENBREo7S0FBQSxNQUFBO0FBV0ksYUFBTSxDQUFJLENBQUMsSUFBQyxDQUFBLFNBQUQsSUFBYyxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQTVCLENBQUosSUFBNkMsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUF6RSxJQUFvRixJQUFDLENBQUEsU0FBM0Y7UUFDSSxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFDLENBQUEsT0FBakI7TUFESixDQVhKOztJQWVBLElBQUcsSUFBQyxDQUFBLE9BQUQsSUFBWSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUE3QixJQUF3QyxDQUFJLElBQUMsQ0FBQSxTQUFoRDtNQUNJLElBQUcsSUFBQyxDQUFBLE1BQUo7ZUFDSSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBREo7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLFNBQUo7UUFDRCxJQUFDLENBQUEsU0FBRCxHQUFhO1FBQ2IsSUFBRyxxQkFBSDtpQkFBbUIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBQW5CO1NBRkM7T0FIVDs7RUFoREk7OztBQTBEUjs7Ozs7Ozt5Q0FNQSxhQUFBLEdBQWUsU0FBQyxPQUFEO0FBQ1gsWUFBTyxPQUFPLENBQUMsRUFBZjtBQUFBLFdBQ1MsU0FEVDtlQUN3QixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFEM0MsV0FFUyxlQUZUO2VBRThCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQUZqRCxXQUdTLGVBSFQ7ZUFHOEIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBSGpELFdBSVMsZ0JBSlQ7ZUFJK0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBSmxELFdBS1MsY0FMVDtlQUs2QixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFMaEQsV0FNUyxnQkFOVDtlQU0rQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFObEQsV0FPUyxnQkFQVDtlQU8rQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFQbEQsV0FRUyxrQkFSVDtlQVFpQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFScEQsV0FTUyxxQkFUVDtlQVNvQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFUdkQsV0FVUyxZQVZUO2VBVTJCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFNBQUE7aUJBQUc7UUFBSDtBQVY3QyxXQVdTLGlCQVhUO2VBV2dDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFNBQUE7aUJBQUc7UUFBSDtBQVhsRCxXQVlTLFlBWlQ7ZUFZMkIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBWjlDLFdBYVMsWUFiVDtlQWEyQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFiOUMsV0FjUyxjQWRUO2VBYzZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWRoRCxXQWVTLGlCQWZUO2VBZWdDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWZuRCxXQWdCUyxpQkFoQlQ7ZUFnQmdDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWhCbkQsV0FpQlMsZ0JBakJUO2VBaUIrQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFqQmxELFdBa0JTLGNBbEJUO2VBa0I2QixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFsQmhELFdBbUJTLGdCQW5CVDtlQW1CK0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBbkJsRCxXQW9CUyxhQXBCVDtlQW9CNEIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBcEIvQyxXQXFCUyxnQkFyQlQ7ZUFxQitCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXJCbEQsV0FzQlMsWUF0QlQ7ZUFzQjJCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXRCOUMsV0F1QlMsYUF2QlQ7ZUF1QjRCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXZCL0MsV0F3QlMsZUF4QlQ7ZUF3QjhCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXhCakQsV0F5QlMsYUF6QlQ7ZUF5QjRCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXpCL0MsV0EwQlMsaUJBMUJUO2VBMEJnQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUExQm5ELFdBMkJTLG1CQTNCVDtlQTJCa0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBM0JyRCxXQTRCUyx5QkE1QlQ7ZUE0QndDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTVCM0QsV0E2QlMsMEJBN0JUO2VBNkJ5QyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUE3QjVELFdBOEJTLDJCQTlCVDtlQThCMEMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBOUI3RCxXQStCUywyQkEvQlQ7ZUErQjBDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQS9CN0QsV0FnQ1MsMEJBaENUO2VBZ0N5QyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFoQzVELFdBaUNTLGdCQWpDVDtlQWlDK0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBakNsRCxXQWtDUyx3QkFsQ1Q7ZUFrQ3VDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWxDMUQsV0FtQ1Msc0JBbkNUO2VBbUNxQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFuQ3hELFdBb0NTLGNBcENUO2VBb0M2QixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFwQ2hELFdBcUNTLGtCQXJDVDtlQXFDaUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBckNwRCxXQXNDUyxvQkF0Q1Q7ZUFzQ21DLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXRDdEQsV0F1Q1MsVUF2Q1Q7ZUF1Q3lCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXZDNUMsV0F3Q1MsZ0JBeENUO2VBd0MrQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUF4Q2xELFdBeUNTLG1CQXpDVDtlQXlDa0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBekNyRCxXQTBDUyxnQkExQ1Q7ZUEwQytCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTFDbEQsV0EyQ1MsdUJBM0NUO2VBMkNzQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUEzQ3pELFdBNENTLGtCQTVDVDtlQTRDaUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBNUNwRCxXQTZDUyxvQkE3Q1Q7ZUE2Q21DLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTdDdEQsV0E4Q1Msc0JBOUNUO2VBOENxQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUE5Q3hELFdBK0NTLHFCQS9DVDtlQStDb0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBL0N2RCxXQWdEUyxxQkFoRFQ7ZUFnRG9DLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWhEdkQsV0FpRFMsdUJBakRUO2VBaURzQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFqRHpELFdBa0RTLHlCQWxEVDtlQWtEd0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBbEQzRCxXQW1EUyxzQkFuRFQ7ZUFtRHFDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQW5EeEQsV0FvRFMsc0JBcERUO2VBb0RxQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFwRHhELFdBcURTLGlCQXJEVDtlQXFEZ0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBckRuRCxXQXNEUyxrQkF0RFQ7ZUFzRGlDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXREcEQsV0F1RFMsaUJBdkRUO2VBdURnQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUF2RG5ELFdBd0RTLHFCQXhEVDtlQXdEb0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBeER2RCxXQXlEUyxnQkF6RFQ7ZUF5RCtCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXpEbEQsV0EwRFMsZUExRFQ7ZUEwRDhCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTFEakQsV0EyRFMsZ0JBM0RUO2VBMkQrQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUEzRGxELFdBNERTLGVBNURUO2VBNEQ4QixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUE1RGpELFdBNkRTLGlCQTdEVDtlQTZEZ0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBN0RuRCxXQThEUyxjQTlEVDtlQThENkIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBOURoRCxXQStEUyxpQkEvRFQ7ZUErRGdDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQS9EbkQsV0FnRVMsY0FoRVQ7ZUFnRTZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWhFaEQsV0FpRVMsY0FqRVQ7ZUFpRTZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWpFaEQsV0FrRVMsa0JBbEVUO2VBa0VpQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFsRXBELFdBbUVTLGNBbkVUO2VBbUU2QixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFuRWhELFdBb0VTLGVBcEVUO2VBb0U4QixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFwRWpELFdBcUVTLGNBckVUO2VBcUU2QixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFyRWhELFdBc0VTLGdCQXRFVDtlQXNFK0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBdEVsRCxXQXVFUyxjQXZFVDtlQXVFNkIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBdkVoRCxXQXdFUyxlQXhFVDtlQXdFOEIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBeEVqRCxXQXlFUyxjQXpFVDtlQXlFNkIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBekVoRCxXQTBFUyxnQkExRVQ7ZUEwRStCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTFFbEQsV0EyRVMsb0JBM0VUO2VBMkVtQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUEzRXRELFdBNEVTLGtCQTVFVDtlQTRFaUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBNUVwRCxXQTZFUyxlQTdFVDtlQTZFOEIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBN0VqRCxXQThFUyxpQkE5RVQ7ZUE4RWdDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTlFbkQsV0ErRVMsa0JBL0VUO2VBK0VpQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUEvRXBELFdBZ0ZTLGVBaEZUO2VBZ0Y4QixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFoRmpELFdBaUZTLGlCQWpGVDtlQWlGZ0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBakZuRCxXQWtGUyx1QkFsRlQ7ZUFrRnNDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWxGekQsV0FtRlMsZ0JBbkZUO2VBbUYrQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFuRmxELFdBb0ZTLGdCQXBGVDtlQW9GK0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBcEZsRCxXQXFGUyxvQkFyRlQ7ZUFxRm1DLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXJGdEQsV0FzRlMsZ0JBdEZUO2VBc0YrQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUF0RmxELFdBdUZTLGlCQXZGVDtlQXVGZ0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBdkZuRCxXQXdGUyxnQkF4RlQ7ZUF3RitCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXhGbEQsV0F5RlMsa0JBekZUO2VBeUZpQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUF6RnBELFdBMEZTLGdCQTFGVDtlQTBGK0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBMUZsRCxXQTJGUyxpQkEzRlQ7ZUEyRmdDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTNGbkQsV0E0RlMsaUJBNUZUO2VBNEZnQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUE1Rm5ELFdBNkZTLGdCQTdGVDtlQTZGK0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBN0ZsRCxXQThGUyxrQkE5RlQ7ZUE4RmlDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTlGcEQsV0ErRlMsc0JBL0ZUO2VBK0ZxQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUEvRnhELFdBZ0dTLG9CQWhHVDtlQWdHbUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBaEd0RCxXQWlHUyx5QkFqR1Q7ZUFpR3dDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWpHM0QsV0FrR1MsaUJBbEdUO2VBa0dnQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFsR25ELFdBbUdTLGdCQW5HVDtlQW1HK0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBbkdsRCxXQW9HUyxvQkFwR1Q7ZUFvR21DLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXBHdEQsV0FxR1MsV0FyR1Q7ZUFxRzBCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXJHN0MsV0FzR1MsZ0JBdEdUO2VBc0crQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUF0R2xELFdBdUdTLGdCQXZHVDtlQXVHK0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBdkdsRCxXQXdHUyxhQXhHVDtlQXdHNEIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBeEcvQyxXQXlHUyxpQkF6R1Q7ZUF5R2dDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXpHbkQsV0EwR1MsaUJBMUdUO2VBMEdnQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUExR25ELFdBMkdTLGNBM0dUO2VBMkc2QixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUEzR2hELFdBNEdTLG1CQTVHVDtlQTRHa0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBNUdyRCxXQTZHUyxrQkE3R1Q7ZUE2R2lDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTdHcEQsV0E4R1MsWUE5R1Q7ZUE4RzJCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTlHOUMsV0ErR1MsaUJBL0dUO2VBK0dnQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUEvR25ELFdBZ0hTLGdCQWhIVDtlQWdIK0IsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBaEhsRCxXQWlIUyxnQkFqSFQ7ZUFpSCtCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWpIbEQsV0FrSFMsdUJBbEhUO2VBa0hzQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFsSHpELFdBbUhTLHVCQW5IVDtlQW1Ic0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBbkh6RCxXQW9IUyw4QkFwSFQ7ZUFvSDZDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXBIaEUsV0FxSFMsMEJBckhUO2VBcUh5QyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFySDVELFdBc0hTLDBCQXRIVDtlQXNIeUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBdEg1RCxXQXVIUyxzQkF2SFQ7ZUF1SHFDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXZIeEQsV0F3SFMsb0JBeEhUO2VBd0htQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUF4SHRELFdBeUhTLGtCQXpIVDtlQXlIaUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBekhwRCxXQTBIUyxvQkExSFQ7ZUEwSG1DLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTFIdEQsV0EySFMsbUJBM0hUO2VBMkhrQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUEzSHJELFdBNEhTLG1CQTVIVDtlQTRIa0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBNUhyRCxXQTZIUyxrQkE3SFQ7ZUE2SGlDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTdIcEQsV0E4SFMsa0JBOUhUO2VBOEhpQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUE5SHBELFdBK0hTLHNCQS9IVDtlQStIcUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBL0h4RCxXQWdJUyxtQkFoSVQ7ZUFnSWtDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWhJckQsV0FpSVMsa0JBaklUO2VBaUlpQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFqSXBELFdBa0lTLHdCQWxJVDtlQWtJdUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBbEkxRCxXQW1JUyxxQkFuSVQ7ZUFtSW9DLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQW5JdkQsV0FvSVMsb0JBcElUO2VBb0ltQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFwSXRELFdBcUlTLHFCQXJJVDtlQXFJb0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBckl2RCxXQXNJUyx1QkF0SVQ7ZUFzSXNDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXRJekQsV0F1SVMseUJBdklUO2VBdUl3QyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUF2STNELFdBd0lTLG1CQXhJVDtlQXdJa0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBeElyRCxXQXlJUyxxQkF6SVQ7ZUF5SW9DLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXpJdkQsV0EwSVMsbUJBMUlUO2VBMElrQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUExSXJELFdBMklTLG9CQTNJVDtlQTJJbUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBM0l0RCxXQTRJUyxtQkE1SVQ7ZUE0SWtDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTVJckQsV0E2SVMseUJBN0lUO2VBNkl3QyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUE3STNELFdBOElTLHFCQTlJVDtlQThJb0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBOUl2RCxXQStJUyx1QkEvSVQ7ZUErSXNDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQS9JekQsV0FnSlMsZ0JBaEpUO2VBZ0orQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFoSmxELFdBaUpTLDBCQWpKVDtlQWlKeUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBako1RCxXQWtKUyxjQWxKVDtlQWtKNkIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBbEpoRCxXQW1KUyxtQkFuSlQ7ZUFtSmtDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQW5KckQsV0FvSlMscUJBcEpUO2VBb0pvQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFwSnZELFdBcUpTLHFCQXJKVDtlQXFKb0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBckp2RCxXQXNKUyw0QkF0SlQ7ZUFzSjJDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXRKOUQsV0F1SlMsYUF2SlQ7ZUF1SjRCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXZKL0MsV0F3SlMsY0F4SlQ7ZUF3SjZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXhKaEQsV0F5SlMsY0F6SlQ7ZUF5SjZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXpKaEQsV0EwSlMsY0ExSlQ7ZUEwSjZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTFKaEQsV0EySlMsY0EzSlQ7ZUEySjZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTNKaEQsV0E0SlMsY0E1SlQ7ZUE0SjZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTVKaEQsV0E2SlMsZUE3SlQ7ZUE2SjhCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTdKakQsV0E4SlMsZ0JBOUpUO2VBOEorQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUE5SmxELFdBK0pTLGtCQS9KVDtlQStKaUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBL0pwRCxXQWdLUyxtQkFoS1Q7ZUFnS2tDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWhLckQsV0FpS1Msc0JBaktUO2VBaUtxQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFqS3hELFdBa0tTLG9CQWxLVDtlQWtLbUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBbEt0RCxXQW1LUyxnQkFuS1Q7ZUFtSytCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQW5LbEQsV0FvS1MsYUFwS1Q7ZUFvSzRCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXBLL0MsV0FxS1MsZ0JBcktUO2VBcUsrQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFyS2xELFdBc0tTLG1CQXRLVDtlQXNLa0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBdEtyRCxXQXVLUyxhQXZLVDtlQXVLNEIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBdksvQyxXQXdLUyxpQkF4S1Q7ZUF3S2dDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXhLbkQsV0F5S1MsZUF6S1Q7ZUF5SzhCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXpLakQsV0EwS1MsYUExS1Q7ZUEwSzRCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTFLL0MsV0EyS1MsY0EzS1Q7ZUEySzZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTNLaEQsV0E0S1MsY0E1S1Q7ZUE0SzZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTVLaEQsV0E2S1MsY0E3S1Q7ZUE2SzZCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTdLaEQsV0E4S1MsZUE5S1Q7ZUE4SzhCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTlLakQsV0ErS1MsaUJBL0tUO2VBK0tnQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUEvS25ELFdBZ0xTLHVCQWhMVDtlQWdMc0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBaEx6RCxXQWlMUyxjQWpMVDtlQWlMNkIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBakxoRCxXQWtMUyxjQWxMVDtlQWtMNkIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBbExoRCxXQW1MUyx1QkFuTFQ7ZUFtTHNDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQW5MekQsV0FvTFMsaUJBcExUO2VBb0xnQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFwTG5ELFdBcUxTLG9CQXJMVDtlQXFMbUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBckx0RCxXQXNMUyxhQXRMVDtlQXNMNEIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBdEwvQyxXQXVMUyxhQXZMVDtlQXVMNEIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBdkwvQyxXQXdMUyxpQkF4TFQ7ZUF3TGdDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQXhMbkQsV0F5TFMsaUJBekxUO2VBeUxnQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUF6TG5ELFdBMExTLHVCQTFMVDtlQTBMc0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBMUx6RCxXQTJMUyxnQkEzTFQ7ZUEyTCtCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTNMbEQsV0E0TFMsZ0JBNUxUO2VBNEwrQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUE1TGxELFdBNkxTLGtCQTdMVDtlQTZMaUMsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBN0xwRCxXQThMUyxrQkE5TFQ7ZUE4TGlDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQTlMcEQsV0ErTFMsaUJBL0xUO2VBK0xnQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUEvTG5ELFdBZ01TLGlCQWhNVDtlQWdNZ0MsT0FBTyxDQUFDLE9BQVIsR0FBa0IsSUFBQyxDQUFBO0FBaE1uRCxXQWlNUyx1QkFqTVQ7ZUFpTXNDLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLElBQUMsQ0FBQTtBQWpNekQsV0FrTVMsb0JBbE1UO2VBa01tQyxPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFsTXRELFdBbU1TLFdBbk1UO2VBbU0wQixPQUFPLENBQUMsT0FBUixHQUFrQixJQUFDLENBQUE7QUFuTTdDO0VBRFc7OztBQXNNZjs7Ozs7O3lDQUtBLGNBQUEsR0FBZ0IsU0FBQyxLQUFEO0FBQ1osUUFBQTtJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFTLENBQUEsS0FBQTtJQUU1QixJQUFHLElBQUMsQ0FBQSxXQUFKO01BQ0ksSUFBRyxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsSUFBcUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLEtBQW9CLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBckQ7UUFDSSxXQUFXLENBQUMsWUFBWSxDQUFDLElBQXpCLEdBQWdDO1FBQ2hDLFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBekIsR0FBb0MsRUFGeEM7T0FBQSxNQUdLLElBQUcsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQTNCO1FBQ0QsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUF6QixHQUFnQztRQUNoQyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQXpCLEdBQW9DLEVBRm5DO09BQUEsTUFBQTtRQUlELFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBekIsR0FBZ0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDdEQsV0FBVyxDQUFDLFlBQVksQ0FBQyxRQUF6QixHQUFvQztRQUNwQyxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsR0FBdUI7UUFFdkIsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQXRCLENBQTJCLGdCQUEzQjtRQUNBLElBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsaUJBQXRCLElBQTJDLElBQUMsQ0FBQSxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQXRCLEdBQXNDLENBQXBGO1VBQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLEdBQXVCLFVBQUEsQ0FBVyxDQUFDLFNBQUE7bUJBQUcsUUFBUSxDQUFDLE9BQVQsR0FBbUI7VUFBdEIsQ0FBRCxDQUFYLEVBQXlDLElBQUMsQ0FBQSxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQXZCLEdBQXNDLElBQTlFLEVBRDNCO1NBVEM7T0FKVDs7SUFnQkEsSUFBRyw0QkFBSDtNQUNJLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxHQUF1QjtNQUN2QixJQUFzQixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsS0FBbUIsSUFBQyxDQUFBLE1BQTFDO1FBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUEsRUFBQTs7TUFDQSxJQUFDLENBQUEsT0FBRDtNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFTLENBQUEsSUFBQyxDQUFBLE9BQUQ7TUFDNUIsSUFBRyxvQkFBSDtRQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BRHRCO09BQUEsTUFBQTtRQUdJLE1BQUEsR0FBUyxJQUFDLENBQUE7QUFDVixlQUFNLE1BQUEsR0FBUyxDQUFULElBQWUsQ0FBSywwQkFBTCxDQUFyQjtVQUNJLE1BQUE7UUFESixDQUpKOztNQU9BLElBQUcsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFiO1FBQ0ksSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUNWLGlEQUFrQixDQUFFLFNBQWpCLENBQUEsVUFBSDtVQUNJLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFDLENBQUEsTUFBRCxDQUFRLENBQUM7VUFDM0IsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVMsQ0FBQSxJQUFDLENBQUEsT0FBRDtpQkFDNUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULEdBQXVCLEtBSDNCO1NBQUEsTUFBQTtpQkFLSSxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUMsQ0FBQSxNQUFELENBQVAsR0FBa0IsS0FMdEI7U0FGSjtPQWJKO0tBQUEsTUFBQTtNQXNCSSxJQUFDLENBQUEsYUFBRCxDQUFlLElBQUMsQ0FBQSxPQUFoQjtNQUVBLElBQUcsNEJBQUg7UUFDSSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsR0FBdUI7UUFDdkIsSUFBc0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULEtBQW1CLElBQUMsQ0FBQSxNQUExQztVQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFBLEVBQUE7O1FBQ0EsSUFBQyxDQUFBLE9BQUQ7UUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUyxDQUFBLElBQUMsQ0FBQSxPQUFEO1FBQzVCLElBQUcsb0JBQUg7VUFDSSxNQUFBLEdBQVMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUR0QjtTQUFBLE1BQUE7VUFHSSxNQUFBLEdBQVMsSUFBQyxDQUFBO0FBQ1YsaUJBQU0sTUFBQSxHQUFTLENBQVQsSUFBZSxDQUFLLDBCQUFMLENBQXJCO1lBQ0ksTUFBQTtVQURKLENBSko7O1FBT0EsSUFBRyxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQWI7VUFDSSxJQUFDLENBQUEsTUFBRCxHQUFVO1VBQ1YsbURBQWtCLENBQUUsU0FBakIsQ0FBQSxVQUFIO1lBQ0ksSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsQ0FBQztZQUMzQixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUyxDQUFBLElBQUMsQ0FBQSxPQUFEO21CQUM1QixJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsR0FBdUIsS0FIM0I7V0FBQSxNQUFBO21CQUtJLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBUCxHQUFrQixLQUx0QjtXQUZKO1NBWko7T0FBQSxNQUFBO2VBcUJJLElBQUMsQ0FBQSxPQUFELEdBckJKO09BeEJKOztFQW5CWTs7O0FBaUVoQjs7Ozs7Ozs7Ozt5Q0FTQSxJQUFBLEdBQU0sU0FBQyxNQUFELEVBQVMsUUFBVDtBQUNGLFFBQUE7SUFBQSxJQUFHLFFBQUg7TUFDSSxJQUFDLENBQUEsT0FBRDtBQUNBO2FBQU0sSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFYLElBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUyxDQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsQ0FBQyxNQUEzQixLQUFxQyxNQUE1RDtxQkFDSSxJQUFDLENBQUEsT0FBRDtNQURKLENBQUE7cUJBRko7S0FBQSxNQUFBO01BS0ksSUFBQyxDQUFBLE9BQUQ7QUFDQTthQUFNLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBNUIsSUFBdUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFTLENBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxDQUFDLE1BQTNCLEtBQXFDLE1BQWxGO3NCQUNJLElBQUMsQ0FBQSxPQUFEO01BREosQ0FBQTtzQkFOSjs7RUFERTs7O0FBVU47Ozs7Ozs7Ozt5Q0FRQSxJQUFBLEdBQU0sU0FBQyxJQUFELEVBQU8sUUFBUDtJQUNGLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDYixJQUFDLENBQUEsV0FBRCxHQUFlO1dBQ2YsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7RUFIZDs7O0FBS047Ozs7Ozs7Ozs7eUNBU0EsZ0JBQUEsR0FBa0IsU0FBQyxPQUFELEVBQVUsUUFBVjtBQUNkLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxJQUFHLE9BQUEsSUFBVyxRQUFRLENBQUMsTUFBcEIsSUFBOEIsQ0FBQyxRQUFTLENBQUEsT0FBQSxDQUFRLENBQUMsRUFBbEIsS0FBd0IsZ0JBQXhCLElBQ00sUUFBUyxDQUFBLE9BQUEsQ0FBUSxDQUFDLEVBQWxCLEtBQXdCLFdBRDlCLElBRU0sUUFBUyxDQUFBLE9BQUEsQ0FBUSxDQUFDLEVBQWxCLEtBQXdCLGNBRjlCLElBR00sUUFBUyxDQUFBLE9BQUEsQ0FBUSxDQUFDLEVBQWxCLEtBQXdCLGNBSC9CLENBQWpDO01BSVEsTUFBQSxHQUFTLE1BSmpCOztBQUtBLFdBQU87RUFQTzs7O0FBU2xCOzs7Ozs7Ozs7O3lDQVNBLGtCQUFBLEdBQW9CLFNBQUMsT0FBRCxFQUFVLFFBQVY7V0FDaEIsT0FBQSxHQUFVLFFBQVEsQ0FBQyxNQUFuQixJQUE4QixDQUMxQixRQUFTLENBQUEsT0FBQSxDQUFRLENBQUMsRUFBbEIsS0FBd0IsZ0JBQXhCLElBQ0EsUUFBUyxDQUFBLE9BQUEsQ0FBUSxDQUFDLEVBQWxCLEtBQXdCLGNBRHhCLElBRUEsUUFBUyxDQUFBLE9BQUEsQ0FBUSxDQUFDLEVBQWxCLEtBQXdCLFdBRnhCLElBR0EsUUFBUyxDQUFBLE9BQUEsQ0FBUSxDQUFDLEVBQWxCLEtBQXdCLGdCQUpFO0VBRGQ7OztBQVFwQjs7Ozs7Ozs7eUNBT0EsaUNBQUEsR0FBbUMsU0FBQTtBQUMvQixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsRUFBQSxHQUFLO0lBQ0wsQ0FBQSxHQUFJLFlBQVksQ0FBQztJQUVqQixNQUFBLEdBQ1MsQ0FBQyw2QkFBQSxJQUF5QixDQUFDLENBQUMsaUJBQWlCLENBQUMsT0FBN0MsSUFBeUQsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGdCQUFwQixLQUF3QyxJQUFDLENBQUEsT0FBbkcsQ0FBQSxJQUNBLENBQUMsMkJBQUEsSUFBdUIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxNQUF6QyxJQUFvRCxDQUFDLENBQUMsZUFBZSxDQUFDLGdCQUFsQixLQUFzQyxJQUFDLENBQUEsT0FBNUY7QUFFVCxXQUFPO0VBVHdCOzs7QUFXbkM7Ozs7Ozs7Ozt5Q0FRQSxjQUFBLEdBQWdCLFNBQUE7SUFDWixJQUFDLENBQUEsbUJBQUQsR0FBdUI7SUFDdkIsSUFBQyxDQUFBLFNBQUQsR0FBYTtXQUNiLElBQUMsQ0FBQSxPQUFEO0VBSFk7OztBQU1oQjs7Ozs7Ozs7O3lDQVFBLGtCQUFBLEdBQW9CLFNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxNQUFmO1dBQTBCLFdBQVcsQ0FBQyxhQUFhLENBQUMsa0JBQTFCLENBQTZDLEtBQTdDLEVBQW9ELEtBQXBELEVBQTJELE1BQTNEO0VBQTFCOzs7QUFFcEI7Ozs7Ozs7Ozs7eUNBU0EsYUFBQSxHQUFlLFNBQUMsTUFBRDtXQUFZLFdBQVcsQ0FBQyxhQUFhLENBQUMsYUFBMUIsQ0FBd0MsTUFBeEM7RUFBWjs7O0FBRWY7Ozs7Ozs7Ozs7eUNBU0EsZUFBQSxHQUFpQixTQUFDLE1BQUQ7SUFDYixJQUFHLE1BQUEsSUFBVyxzQkFBZDthQUNJLElBQUksQ0FBQyxLQUFMLENBQVcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxhQUExQixDQUF3QyxNQUF4QyxDQUFBLEdBQWtELElBQWxELEdBQXlELFFBQVEsQ0FBQyxTQUE3RSxFQURKO0tBQUEsTUFBQTthQUdJLElBQUksQ0FBQyxLQUFMLENBQVcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxhQUExQixDQUF3QyxNQUF4QyxDQUFYLEVBSEo7O0VBRGE7OztBQU1qQjs7Ozs7Ozs7Ozs7eUNBVUEsd0JBQUEsR0FBMEIsU0FBQyxRQUFELEVBQVcsTUFBWCxFQUFtQixNQUFuQjtBQUN0QixRQUFBO0lBQUEsY0FBQSxHQUFpQixhQUFhLENBQUMsTUFBTSxDQUFDLGVBQWdCLENBQUEsUUFBQTtJQUN0RCxJQUFHLENBQUMsY0FBSjtBQUF3QixhQUFPO1FBQUUsQ0FBQSxFQUFHLENBQUw7UUFBUSxDQUFBLEVBQUcsQ0FBWDtRQUEvQjs7QUFFQSxXQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBcEIsQ0FBeUIsSUFBekIsRUFBK0IsTUFBL0IsRUFBdUMsTUFBdkMsQ0FBQSxJQUFrRDtNQUFFLENBQUEsRUFBRyxDQUFMO01BQVEsQ0FBQSxFQUFHLENBQVg7O0VBSm5DOzs7QUFNMUI7Ozs7Ozs7Ozt5Q0FRQSxrQkFBQSxHQUFvQixTQUFDLFFBQUQsRUFBVyxZQUFYLEVBQXlCLEtBQXpCO0FBQ2hCLFlBQU8sWUFBUDtBQUFBLFdBQ1MsQ0FEVDtlQUVRLFdBQVcsQ0FBQyxhQUFhLENBQUMsZ0JBQTFCLENBQTJDLFFBQTNDLEVBQXFELEtBQXJEO0FBRlIsV0FHUyxDQUhUO2VBSVEsV0FBVyxDQUFDLGFBQWEsQ0FBQyxpQkFBMUIsQ0FBNEMsUUFBNUMsRUFBc0QsS0FBdEQ7QUFKUixXQUtTLENBTFQ7ZUFNUSxXQUFXLENBQUMsYUFBYSxDQUFDLGdCQUExQixDQUEyQyxRQUEzQyxFQUFxRCxLQUFyRDtBQU5SLFdBT1MsQ0FQVDtlQVFRLFdBQVcsQ0FBQyxhQUFhLENBQUMsZUFBMUIsQ0FBMEMsUUFBMUMsRUFBb0QsS0FBcEQ7QUFSUjtFQURnQjs7O0FBV3BCOzs7Ozs7Ozs7eUNBUUEscUJBQUEsR0FBdUIsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsTUFBdEI7V0FBaUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxxQkFBMUIsQ0FBZ0QsS0FBaEQsRUFBdUQsS0FBdkQsRUFBOEQsS0FBOUQsRUFBcUUsTUFBckU7RUFBakM7OztBQUV2Qjs7Ozs7Ozs7eUNBT0EsZ0JBQUEsR0FBa0IsU0FBQyxRQUFELEVBQVcsS0FBWDtXQUFxQixXQUFXLENBQUMsYUFBYSxDQUFDLGdCQUExQixDQUEyQyxRQUEzQyxFQUFxRCxLQUFyRDtFQUFyQjs7O0FBRWxCOzs7Ozs7Ozt5Q0FPQSxlQUFBLEdBQWlCLFNBQUMsUUFBRCxFQUFXLEtBQVg7V0FBcUIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxlQUExQixDQUEwQyxRQUExQyxFQUFvRCxLQUFwRDtFQUFyQjs7O0FBRWpCOzs7Ozs7Ozt5Q0FPQSxpQkFBQSxHQUFtQixTQUFDLFFBQUQsRUFBVyxLQUFYO1dBQXFCLFdBQVcsQ0FBQyxhQUFhLENBQUMsaUJBQTFCLENBQTRDLFFBQTVDLEVBQXNELEtBQXREO0VBQXJCOzs7QUFFbkI7Ozs7Ozs7Ozt5Q0FRQSxzQkFBQSxHQUF3QixTQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixNQUF0QjtXQUFpQyxXQUFXLENBQUMsYUFBYSxDQUFDLHNCQUExQixDQUFpRCxLQUFqRCxFQUF3RCxLQUF4RCxFQUErRCxLQUEvRCxFQUFzRSxNQUF0RTtFQUFqQzs7O0FBRXhCOzs7Ozs7Ozt5Q0FPQSxnQkFBQSxHQUFrQixTQUFDLFFBQUQsRUFBVyxLQUFYO1dBQXFCLFdBQVcsQ0FBQyxhQUFhLENBQUMsZ0JBQTFCLENBQTJDLFFBQTNDLEVBQXFELEtBQXJEO0VBQXJCOzs7QUFFbEI7Ozs7Ozs7Ozt5Q0FRQSxxQkFBQSxHQUF1QixTQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixNQUF0QjtXQUFpQyxXQUFXLENBQUMsYUFBYSxDQUFDLHFCQUExQixDQUFnRCxLQUFoRCxFQUF1RCxLQUF2RCxFQUE4RCxLQUE5RCxFQUFxRSxNQUFyRTtFQUFqQzs7O0FBRXZCOzs7Ozs7Ozs7O3lDQVNBLGFBQUEsR0FBZSxTQUFDLE1BQUQ7V0FBWSxXQUFXLENBQUMsYUFBYSxDQUFDLGFBQTFCLENBQXdDLE1BQXhDO0VBQVo7OztBQUVmOzs7Ozs7Ozs7eUNBUUEsa0JBQUEsR0FBb0IsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLE1BQWY7V0FBMEIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxrQkFBMUIsQ0FBNkMsS0FBN0MsRUFBb0QsS0FBcEQsRUFBMkQsTUFBM0Q7RUFBMUI7OztBQUVwQjs7Ozs7Ozs7Ozt5Q0FTQSxjQUFBLEdBQWdCLFNBQUMsTUFBRDtXQUFZLFdBQVcsQ0FBQyxhQUFhLENBQUMsY0FBMUIsQ0FBeUMsTUFBekM7RUFBWjs7O0FBRWhCOzs7Ozs7Ozs7eUNBUUEsbUJBQUEsR0FBcUIsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLE1BQWY7V0FBMEIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxtQkFBMUIsQ0FBOEMsS0FBOUMsRUFBcUQsS0FBckQsRUFBNEQsTUFBNUQ7RUFBMUI7OztBQUVyQjs7Ozs7Ozs7eUNBT0EsWUFBQSxHQUFjLFNBQUMsTUFBRDtXQUFZLFdBQVcsQ0FBQyxhQUFhLENBQUMsWUFBMUIsQ0FBdUMsTUFBdkM7RUFBWjs7O0FBRWQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt5Q0FpQkEsT0FBQSxHQUFTLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxTQUFQO0FBQ0wsWUFBTyxTQUFQO0FBQUEsV0FDUyxDQURUO0FBQ2dCLGVBQU87QUFEdkIsV0FFUyxDQUZUO0FBRWdCLGVBQU87QUFGdkIsV0FHUyxDQUhUO0FBR2dCLGVBQU8sQ0FBQSxHQUFJO0FBSDNCLFdBSVMsQ0FKVDtBQUlnQixlQUFPLENBQUEsSUFBSztBQUo1QixXQUtTLENBTFQ7QUFLZ0IsZUFBTyxDQUFBLEdBQUk7QUFMM0IsV0FNUyxDQU5UO0FBTWdCLGVBQU8sQ0FBQSxJQUFLO0FBTjVCO0VBREs7OztBQVNUOzs7Ozs7Ozs7Ozs7Ozt5Q0FhQSxzQkFBQSxHQUF3QixTQUFDLE1BQUQsRUFBUyxXQUFUO0FBQ3BCLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxTQUFBLEdBQVk7QUFFWixZQUFPLFdBQVA7QUFBQSxXQUNTLENBRFQ7UUFDZ0IsU0FBQSxHQUFZLFNBQUMsS0FBRDtpQkFBVztRQUFYO0FBQW5CO0FBRFQsV0FFUyxDQUZUO1FBRWdCLFNBQUEsR0FBWSxTQUFDLEtBQUQ7aUJBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYO1FBQVg7QUFBbkI7QUFGVCxXQUdTLENBSFQ7UUFHZ0IsU0FBQSxHQUFZLFNBQUMsS0FBRDtpQkFBVyxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVY7UUFBWDtBQUFuQjtBQUhULFdBSVMsQ0FKVDtRQUlnQixTQUFBLEdBQVksU0FBQyxLQUFEO2lCQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBWDtRQUFYO0FBSjVCO0FBTUEsWUFBTyxNQUFNLENBQUMsTUFBZDtBQUFBLFdBQ1MsQ0FEVDtRQUVRLE1BQUEsR0FBUyxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQU0sQ0FBQyxXQUF0QjtBQURSO0FBRFQsV0FHUyxDQUhUO1FBSVEsS0FBQSxHQUFRLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFuQztRQUNSLEdBQUEsR0FBTSxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBbkM7UUFDTixJQUFBLEdBQU8sR0FBQSxHQUFNO1FBQ2IsTUFBQSxHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLElBQUEsR0FBSyxDQUFOLENBQW5DO0FBSlI7QUFIVCxXQVFTLENBUlQ7UUFTUSxNQUFBLEdBQVMsSUFBQyxDQUFBLGtCQUFELENBQW9CLE1BQU0sQ0FBQyxXQUEzQixFQUF3QyxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQU0sQ0FBQyxlQUF0QixDQUFBLEdBQXVDLENBQS9FLEVBQWtGLE1BQU0sQ0FBQyxxQkFBekY7QUFEUjtBQVJULFdBVVMsQ0FWVDtRQVdRLE1BQUEsR0FBUyxJQUFDLENBQUEscUJBQUQsQ0FBdUIsTUFBTSxDQUFDLFlBQTlCO0FBRFI7QUFWVCxXQVlTLENBWlQ7UUFhUSxNQUFBLEdBQVMsSUFBQyxDQUFBLHlCQUFELENBQTJCLE1BQU0sQ0FBQyxZQUFsQztBQWJqQjtBQWVBLFlBQU8sTUFBTSxDQUFDLE1BQWQ7QUFBQSxXQUNTLENBRFQ7QUFFUSxnQkFBTyxNQUFNLENBQUMsU0FBZDtBQUFBLGVBQ1MsQ0FEVDtZQUVRLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFNLENBQUMsY0FBekIsRUFBeUMsU0FBQSxDQUFVLE1BQVYsQ0FBekM7QUFEQztBQURULGVBR1MsQ0FIVDtZQUlRLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFNLENBQUMsY0FBekIsRUFBeUMsU0FBQSxDQUFVLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLGNBQXRCLENBQUEsR0FBd0MsTUFBbEQsQ0FBekM7QUFEQztBQUhULGVBS1MsQ0FMVDtZQU1RLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFNLENBQUMsY0FBekIsRUFBeUMsU0FBQSxDQUFVLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLGNBQXRCLENBQUEsR0FBd0MsTUFBbEQsQ0FBekM7QUFEQztBQUxULGVBT1MsQ0FQVDtZQVFRLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFNLENBQUMsY0FBekIsRUFBeUMsU0FBQSxDQUFVLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLGNBQXRCLENBQUEsR0FBd0MsTUFBbEQsQ0FBekM7QUFEQztBQVBULGVBU1MsQ0FUVDtZQVVRLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFNLENBQUMsY0FBekIsRUFBeUMsU0FBQSxDQUFVLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLGNBQXRCLENBQUEsR0FBd0MsTUFBbEQsQ0FBekM7QUFEQztBQVRULGVBV1MsQ0FYVDtZQVlRLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFNLENBQUMsY0FBekIsRUFBeUMsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsY0FBdEIsQ0FBQSxHQUF3QyxNQUFqRjtBQVpSO0FBREM7QUFEVCxXQWVTLENBZlQ7UUFnQlEsS0FBQSxHQUFRLE1BQU0sQ0FBQztRQUNmLEtBQUEsR0FBUSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQW5CLEdBQXlCO1FBQ2pDLEdBQUEsR0FBTSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQW5CLEdBQXVCO0FBQzdCLGFBQVMsaUdBQVQ7QUFDSSxrQkFBTyxNQUFNLENBQUMsU0FBZDtBQUFBLGlCQUNTLENBRFQ7Y0FFUSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsS0FBdkIsRUFBOEIsQ0FBOUIsRUFBaUMsU0FBQSxDQUFVLE1BQVYsQ0FBakM7QUFEQztBQURULGlCQUdTLENBSFQ7Y0FJUSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsS0FBdkIsRUFBOEIsQ0FBOUIsRUFBaUMsU0FBQSxDQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixLQUFwQixFQUEyQixDQUEzQixDQUFBLEdBQWdDLE1BQTFDLENBQWpDO0FBREM7QUFIVCxpQkFLUyxDQUxUO2NBTVEsSUFBQyxDQUFBLHFCQUFELENBQXVCLEtBQXZCLEVBQThCLENBQTlCLEVBQWlDLFNBQUEsQ0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsS0FBcEIsRUFBMkIsQ0FBM0IsQ0FBQSxHQUFnQyxNQUExQyxDQUFqQztBQURDO0FBTFQsaUJBT1MsQ0FQVDtjQVFRLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixLQUF2QixFQUE4QixDQUE5QixFQUFpQyxTQUFBLENBQVUsSUFBQyxDQUFBLGtCQUFELENBQW9CLEtBQXBCLEVBQTJCLENBQTNCLENBQUEsR0FBZ0MsTUFBMUMsQ0FBakM7QUFEQztBQVBULGlCQVNTLENBVFQ7Y0FVUSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsS0FBdkIsRUFBOEIsQ0FBOUIsRUFBaUMsU0FBQSxDQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixLQUFwQixFQUEyQixDQUEzQixDQUFBLEdBQWdDLE1BQTFDLENBQWpDO0FBREM7QUFUVCxpQkFXUyxDQVhUO2NBWVEsSUFBQyxDQUFBLHFCQUFELENBQXVCLEtBQXZCLEVBQThCLENBQTlCLEVBQWlDLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixLQUFwQixFQUEyQixDQUEzQixDQUFBLEdBQWdDLE1BQWpFO0FBWlI7QUFESjtBQUpDO0FBZlQsV0FpQ1MsQ0FqQ1Q7UUFrQ1EsS0FBQSxHQUFRLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLGVBQXRCLENBQUEsR0FBeUM7QUFDakQsZ0JBQU8sTUFBTSxDQUFDLFNBQWQ7QUFBQSxlQUNTLENBRFQ7WUFFUSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsTUFBTSxDQUFDLFdBQTlCLEVBQTJDLEtBQTNDLEVBQWtELFNBQUEsQ0FBVSxNQUFWLENBQWxELEVBQXFFLE1BQU0sQ0FBQyxxQkFBNUU7QUFEQztBQURULGVBR1MsQ0FIVDtZQUlRLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixNQUFNLENBQUMsV0FBOUIsRUFBMkMsS0FBM0MsRUFBa0QsU0FBQSxDQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixNQUFNLENBQUMsV0FBM0IsRUFBd0MsS0FBeEMsRUFBK0MsTUFBTSxDQUFDLHFCQUF0RCxDQUFBLEdBQStFLE1BQXpGLENBQWxELEVBQW9KLE1BQU0sQ0FBQyxxQkFBM0o7QUFEQztBQUhULGVBS1MsQ0FMVDtZQU1RLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixNQUFNLENBQUMsV0FBOUIsRUFBMkMsS0FBM0MsRUFBa0QsU0FBQSxDQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixNQUFNLENBQUMsV0FBM0IsRUFBd0MsS0FBeEMsRUFBK0MsTUFBTSxDQUFDLHFCQUF0RCxDQUFBLEdBQStFLE1BQXpGLENBQWxELEVBQW9KLE1BQU0sQ0FBQyxxQkFBM0o7QUFEQztBQUxULGVBT1MsQ0FQVDtZQVFRLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixNQUFNLENBQUMsV0FBOUIsRUFBMkMsS0FBM0MsRUFBa0QsU0FBQSxDQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixNQUFNLENBQUMsV0FBM0IsRUFBd0MsS0FBeEMsRUFBK0MsTUFBTSxDQUFDLHFCQUF0RCxDQUFBLEdBQStFLE1BQXpGLENBQWxELEVBQW9KLE1BQU0sQ0FBQyxxQkFBM0o7QUFEQztBQVBULGVBU1MsQ0FUVDtZQVVRLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixNQUFNLENBQUMsV0FBOUIsRUFBMkMsS0FBM0MsRUFBa0QsU0FBQSxDQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixNQUFNLENBQUMsV0FBM0IsRUFBd0MsS0FBeEMsRUFBK0MsTUFBTSxDQUFDLHFCQUF0RCxDQUFBLEdBQStFLE1BQXpGLENBQWxELEVBQW9KLE1BQU0sQ0FBQyxxQkFBM0o7QUFEQztBQVRULGVBV1MsQ0FYVDtZQVlRLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixNQUFNLENBQUMsV0FBOUIsRUFBMkMsS0FBM0MsRUFBa0QsSUFBQyxDQUFBLGtCQUFELENBQW9CLE1BQU0sQ0FBQyxXQUEzQixFQUF3QyxLQUF4QyxFQUErQyxNQUFNLENBQUMscUJBQXRELENBQUEsR0FBK0UsTUFBakksRUFBeUksTUFBTSxDQUFDLHFCQUFoSjtBQVpSO0FBbkNSO0FBaURBLFdBQU87RUExRWE7OztBQTRFeEI7Ozs7Ozs7O3lDQU9BLFdBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxNQUFUO0FBQ1QsUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBTSxDQUFDLFFBQXhCLENBQVgsQ0FBVCxFQUF3RCxDQUF4RDtJQUNYLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsTUFBTSxDQUFDLE1BQTdCO0lBRVQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFoQixDQUFzQjtNQUFFLENBQUEsRUFBRyxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBNUIsQ0FBTDtNQUFxQyxDQUFBLEVBQUcsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQTVCLENBQXhDO0tBQXRCLEVBQWdHLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLEtBQXRCLENBQUEsR0FBK0IsR0FBL0gsRUFBb0ksUUFBcEksRUFBOEksTUFBOUk7SUFFQSxJQUFHLE1BQU0sQ0FBQyxpQkFBUCxJQUE2QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFsQixDQUFwQztNQUNJLElBQUMsQ0FBQSxTQUFELEdBQWE7YUFDYixJQUFDLENBQUEsV0FBRCxHQUFlLFNBRm5COztFQU5TOzs7QUFVYjs7Ozs7Ozs7eUNBT0EsaUJBQUEsR0FBbUIsU0FBQyxNQUFELEVBQVMsTUFBVDtBQUNmLFFBQUE7SUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBTSxDQUFDLFFBQXhCO0lBQ1gsSUFBRyxNQUFNLENBQUMsaUJBQVAsSUFBNkIsQ0FBSSxDQUFDLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBbEIsQ0FBcEM7TUFDSSxJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLFdBQUQsR0FBZSxTQUZuQjs7RUFGZTs7O0FBTW5COzs7Ozs7Ozt5Q0FPQSxXQUFBLEdBQWEsU0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixRQUFqQjtBQUNULFFBQUE7SUFBQSxNQUFBLEdBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLE1BQU0sQ0FBQyxNQUE3QjtJQUNULFFBQUEsR0FBVyxJQUFDLENBQUEsZUFBRCxDQUFpQixNQUFNLENBQUMsUUFBeEI7SUFDWCxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQWhCLENBQTBCLE1BQU0sQ0FBQyxTQUFqQyxFQUE0QyxNQUE1QyxFQUFvRCxRQUFwRCxFQUE4RCxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsTUFBRDtRQUMxRCxNQUFNLENBQUMsT0FBUCxDQUFBO2dEQUNBLFNBQVU7TUFGZ0Q7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlEO0lBS0EsSUFBRyxNQUFNLENBQUMsaUJBQVAsSUFBNkIsQ0FBSSxDQUFDLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBbEIsQ0FBcEM7TUFDSSxJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLFdBQUQsR0FBZSxTQUZuQjs7RUFSUzs7O0FBWWI7Ozs7Ozs7Ozt5Q0FRQSxVQUFBLEdBQVksU0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixNQUFuQjtBQUNSLFFBQUE7SUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLGFBQUQsQ0FBZSxRQUFRLENBQUMsQ0FBeEI7SUFDSixDQUFBLEdBQUksSUFBQyxDQUFBLGFBQUQsQ0FBZSxRQUFRLENBQUMsQ0FBeEI7SUFDSixNQUFBLEdBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLE1BQU0sQ0FBQyxNQUE3QjtJQUNULFFBQUEsR0FBVyxJQUFDLENBQUEsZUFBRCxDQUFpQixNQUFNLENBQUMsUUFBeEI7SUFFWCxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQWhCLENBQXVCLENBQXZCLEVBQTBCLENBQTFCLEVBQTZCLE1BQU0sQ0FBQyxTQUFwQyxFQUErQyxNQUEvQyxFQUF1RCxRQUF2RDtJQUVBLElBQUcsTUFBTSxDQUFDLGlCQUFQLElBQTZCLENBQUksQ0FBQyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsYUFBRCxDQUFBLENBQWxCLENBQXBDO01BQ0ksSUFBQyxDQUFBLFNBQUQsR0FBYTthQUNiLElBQUMsQ0FBQSxXQUFELEdBQWUsU0FGbkI7O0VBUlE7OztBQWFaOzs7Ozs7Ozs7eUNBUUEsVUFBQSxHQUFZLFNBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsTUFBbkI7QUFDUixRQUFBO0lBQUEsSUFBRyxNQUFNLENBQUMsWUFBUCxLQUF1QixDQUExQjtNQUNJLENBQUEsR0FBSSxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsTUFBTSxDQUFDLG9CQUFqQyxFQUF1RCxNQUF2RCxFQUErRCxNQUEvRDtNQUNKLENBQUEsR0FBSSxDQUFDLENBQUM7TUFDTixDQUFBLEdBQUksQ0FBQyxDQUFDLEVBSFY7S0FBQSxNQUFBO01BS0ksQ0FBQSxHQUFJLElBQUMsQ0FBQSxhQUFELENBQWUsUUFBUSxDQUFDLENBQXhCO01BQ0osQ0FBQSxHQUFJLElBQUMsQ0FBQSxhQUFELENBQWUsUUFBUSxDQUFDLENBQXhCLEVBTlI7O0lBUUEsTUFBQSxHQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixNQUFNLENBQUMsTUFBN0I7SUFDVCxRQUFBLEdBQVcsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBTSxDQUFDLFFBQXhCO0lBRVgsSUFBQSxHQUFPLE1BQU0sQ0FBQztJQUNkLElBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFkLEtBQW1CLENBQW5CLElBQXlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBZCxLQUFtQixDQUEvQztNQUNJLE1BQUEsR0FBUyxNQUFNLENBQUM7TUFDaEIsSUFBRyxjQUFIO1FBQ0ksQ0FBQSxJQUFLLENBQUMsTUFBTSxDQUFDLEtBQVAsR0FBYSxJQUFJLENBQUMsQ0FBbEIsR0FBb0IsTUFBTSxDQUFDLEtBQTVCLENBQUEsR0FBcUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN4RCxDQUFBLElBQUssQ0FBQyxNQUFNLENBQUMsTUFBUCxHQUFjLElBQUksQ0FBQyxDQUFuQixHQUFxQixNQUFNLENBQUMsTUFBN0IsQ0FBQSxHQUF1QyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBRjlEO09BRko7O0lBTUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUF1QixDQUF2QixFQUEwQixDQUExQixFQUE2QixRQUE3QixFQUF1QyxNQUF2QztJQUVBLElBQUcsTUFBTSxDQUFDLGlCQUFQLElBQTZCLENBQUksQ0FBQyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsYUFBRCxDQUFBLENBQWxCLENBQXBDO01BQ0ksSUFBQyxDQUFBLFNBQUQsR0FBYTthQUNiLElBQUMsQ0FBQSxXQUFELEdBQWUsU0FGbkI7O0VBckJROzs7QUF5Qlo7Ozs7Ozs7Ozt5Q0FRQSxjQUFBLEdBQWdCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxNQUFmO0FBQ1osUUFBQTtJQUFBLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsTUFBTSxDQUFDLE1BQTdCO0lBQ1QsUUFBQSxHQUFXLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxRQUF4QjtJQUNYLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBaEIsQ0FBeUIsSUFBSSxDQUFDLElBQTlCLEVBQW9DLE1BQU0sQ0FBQyxRQUEzQyxFQUFxRCxRQUFyRCxFQUErRCxNQUEvRCxvQ0FBbUYsQ0FBRSxhQUFyRjtJQUVBLElBQUcsTUFBTSxDQUFDLGlCQUFQLElBQTZCLENBQUksQ0FBQyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsYUFBRCxDQUFBLENBQWxCLENBQXBDO01BQ0ksSUFBQyxDQUFBLFNBQUQsR0FBYTthQUNiLElBQUMsQ0FBQSxXQUFELEdBQWUsU0FGbkI7O0VBTFk7OztBQVNoQjs7Ozs7Ozs7O3lDQVFBLGdCQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxNQUFmO0FBQ2QsUUFBQTtJQUFBLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsTUFBTSxDQUFDLE1BQTdCO0lBQ1QsUUFBQSxHQUFXLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxRQUF4QjtJQUNYLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBaEIsQ0FBMkIsSUFBM0IsRUFBaUMsTUFBTSxDQUFDLFFBQXhDLEVBQWtELFFBQWxELEVBQTRELE1BQTVEO0lBRUEsSUFBRyxNQUFNLENBQUMsaUJBQVAsSUFBNkIsQ0FBSSxDQUFDLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBbEIsQ0FBcEM7TUFDSSxJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLFdBQUQsR0FBZSxTQUZuQjs7RUFMYzs7O0FBU2xCOzs7Ozs7Ozt5Q0FPQSxVQUFBLEdBQVksU0FBQyxNQUFELEVBQVMsTUFBVDtBQUNSLFFBQUE7SUFBQSxNQUFBLEdBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLE1BQU0sQ0FBQyxNQUE3QjtJQUNULFFBQUEsR0FBVyxJQUFDLENBQUEsZUFBRCxDQUFpQixNQUFNLENBQUMsUUFBeEI7SUFDWCxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQWhCLENBQXVCLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUE5QixDQUFBLEdBQW1DLEdBQTFELEVBQStELElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUE5QixDQUFBLEdBQW1DLEdBQWxHLEVBQXVHLFFBQXZHLEVBQWlILE1BQWpIO0lBRUEsSUFBRyxNQUFNLENBQUMsaUJBQVAsSUFBNkIsQ0FBSSxDQUFDLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBbEIsQ0FBcEM7TUFDSSxJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLFdBQUQsR0FBZSxTQUZuQjs7RUFMUTs7O0FBU1o7Ozs7Ozs7O3lDQU9BLFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxNQUFUO0FBQ1YsUUFBQTtJQUFBLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsTUFBTSxDQUFDLE1BQTdCO0lBQ1QsUUFBQSxHQUFXLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxRQUF4QjtJQUdYLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsTUFBTSxDQUFDLE1BQTdCO0lBYVQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUF1QixNQUFNLENBQUMsU0FBOUIsRUFBeUMsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsS0FBdEIsQ0FBQSxHQUErQixHQUF4RSxFQUE2RSxRQUE3RSxFQUF1RixNQUF2RjtJQUVBLElBQUcsTUFBTSxDQUFDLGlCQUFQLElBQTZCLENBQUksQ0FBQyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsYUFBRCxDQUFBLENBQWxCLENBQXBDO01BQ0ksSUFBQyxDQUFBLFNBQUQsR0FBYTthQUNiLElBQUMsQ0FBQSxXQUFELEdBQWUsU0FGbkI7O0VBcEJVOzs7QUF3QmQ7Ozs7Ozs7O3lDQU9BLFdBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxNQUFUO0FBQ1QsUUFBQTtJQUFBLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsTUFBTSxDQUFDLE1BQTdCO0lBQ1QsUUFBQSxHQUFXLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxRQUF4QjtJQUNYLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBaEIsQ0FBd0IsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsT0FBdEIsQ0FBeEIsRUFBd0QsUUFBeEQsRUFBa0UsTUFBbEU7SUFFQSxJQUFHLE1BQU0sQ0FBQyxpQkFBUCxJQUE2QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFsQixDQUFwQztNQUNJLElBQUMsQ0FBQSxTQUFELEdBQWE7YUFDYixJQUFDLENBQUEsV0FBRCxHQUFlLFNBRm5COztFQUxTOzs7QUFTYjs7Ozs7Ozs7eUNBT0EsVUFBQSxHQUFZLFNBQUMsTUFBRCxFQUFTLE1BQVQ7QUFDUixRQUFBO0lBQUEsTUFBQSxHQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixNQUFNLENBQUMsTUFBN0I7SUFFVCxJQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBWixLQUFvQixDQUF2QjtNQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBWixHQUFtQjtNQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQVosR0FBaUIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQTNCO01BQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBWixHQUFpQixJQUFDLENBQUEsYUFBRCxDQUFlLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBM0I7TUFDakIsSUFBRyx3RUFBSDtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQW5CLENBQUEsRUFESjs7TUFHQSxJQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBWixLQUEwQixDQUE3QjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBWixHQUFxQixlQUFlLENBQUMsU0FBaEIsQ0FBMEIsZUFBZSxDQUFDLE9BQWhCLENBQXdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBcEMsQ0FBMUIsRUFEekI7T0FBQSxNQUFBO1FBR0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFaLEdBQXFCLGVBQWUsQ0FBQyxRQUFoQixDQUF5QixlQUFlLENBQUMsT0FBaEIsQ0FBd0IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFwQyxDQUF6QjtRQUNyQixJQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBZjtVQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQW5CLENBQUE7VUFDQSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFuQixHQUEwQixLQUY5QjtTQUpKO09BUEo7S0FBQSxNQUFBO01BZUksUUFBQSxHQUFXLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxRQUF4QjtNQUNYLElBQUEsR0FBTyxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFNLENBQUMsSUFBdkI7TUFDUCxJQUFJLENBQUMsS0FBTCxHQUFhLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBSSxDQUFDLEtBQXBCO01BQ2IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUF1QixJQUF2QixFQUE2QixRQUE3QixFQUF1QyxNQUF2QyxFQWxCSjs7SUFvQkEsSUFBRyxNQUFNLENBQUMsaUJBQVAsSUFBNkIsQ0FBSSxDQUFDLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBbEIsQ0FBcEM7TUFDSSxJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLFdBQUQsR0FBZSxTQUZuQjs7RUF2QlE7OztBQTJCWjs7Ozs7Ozs7eUNBT0EsVUFBQSxHQUFZLFNBQUMsTUFBRCxFQUFTLE1BQVQ7QUFDUixRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxRQUF4QjtJQUNYLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsTUFBTSxDQUFDLE1BQTdCO0lBQ1QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUF1QixNQUFNLENBQUMsSUFBOUIsRUFBb0MsUUFBcEMsRUFBOEMsTUFBOUM7SUFFQSxJQUFHLE1BQU0sQ0FBQyxpQkFBUCxJQUE2QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFsQixDQUFwQztNQUNJLElBQUMsQ0FBQSxTQUFELEdBQWE7YUFDYixJQUFDLENBQUEsV0FBRCxHQUFlLFNBRm5COztFQUxROzs7QUFTWjs7Ozs7Ozs7eUNBT0EsV0FBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLE1BQVQ7QUFDVCxRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQU0sQ0FBQyxRQUF4QjtJQUNYLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBaEIsQ0FBMEIsSUFBQSxLQUFBLENBQU0sTUFBTSxDQUFDLEtBQWIsQ0FBMUIsRUFBK0MsUUFBL0M7SUFFQSxJQUFHLE1BQU0sQ0FBQyxpQkFBUCxJQUE2QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFsQixDQUFwQztNQUNJLElBQUMsQ0FBQSxTQUFELEdBQWE7YUFDYixJQUFDLENBQUEsV0FBRCxHQUFlLFNBRm5COztFQUpTOzs7QUFRYjs7Ozs7Ozs7eUNBT0EsVUFBQSxHQUFZLFNBQUMsTUFBRCxFQUFTLE1BQVQ7SUFDUixNQUFNLENBQUMsT0FBTyxDQUFDLENBQWYsR0FBbUIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsQ0FBdEI7SUFDbkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFmLEdBQW1CLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLENBQXRCO0lBQ25CLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBZixHQUF1QixJQUFDLENBQUEsYUFBRCxDQUFlLE1BQU0sQ0FBQyxLQUF0QjtJQUN2QixNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWYsR0FBd0IsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsTUFBdEI7SUFFeEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFmLEdBQXVCLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLEtBQXRCO1dBQ3ZCLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBZixHQUF3QixJQUFDLENBQUEsYUFBRCxDQUFlLE1BQU0sQ0FBQyxNQUF0QjtFQVBoQjs7O0FBU1o7Ozs7Ozs7O3lDQU9BLGdCQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLE1BQVQ7V0FDZCxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQWxCLENBQXNCLE1BQU0sQ0FBQyxVQUE3QjtFQURjOzs7QUFHbEI7Ozs7Ozs7O3lDQU9BLFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxNQUFUO0FBQ1YsUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsZUFBRCxDQUFpQixNQUFNLENBQUMsUUFBeEI7SUFDWCxNQUFBLEdBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLE1BQU0sQ0FBQyxNQUE3QjtBQUVULFlBQU8sTUFBTSxDQUFDLElBQWQ7QUFBQSxXQUNTLENBRFQ7UUFFUSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQWhCLENBQXlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBZCxHQUFzQixLQUEvQyxFQUFzRCxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWQsR0FBc0IsR0FBNUUsRUFBaUYsUUFBakYsRUFBMkYsTUFBM0Y7UUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUN4QixNQUFNLENBQUMsT0FBUCxHQUFpQixNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWQsR0FBc0I7UUFDdkMsTUFBTSxDQUFDLFFBQVAsR0FBa0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFkLEtBQTZCLENBQTdCLElBQWtDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBZCxLQUE2QjtRQUNqRixNQUFNLENBQUMsVUFBUCxHQUFvQixNQUFNLENBQUMsTUFBTSxDQUFDLFdBQWQsS0FBNkIsQ0FBN0IsSUFBa0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFkLEtBQTZCO0FBTGxGO0FBRFQsV0FPUyxDQVBUO1FBUVEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUF1QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQVosR0FBb0IsR0FBM0MsRUFBZ0QsUUFBaEQsRUFBMEQsTUFBMUQ7UUFDQSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFwQixHQUE4QjtBQUY3QjtBQVBULFdBVVMsQ0FWVDtRQVdRLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBaEIsQ0FBMkIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBaEQsRUFBdUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBNUUsRUFBb0YsUUFBcEYsRUFBOEYsTUFBOUY7UUFDQSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUF4QixHQUFrQztBQVoxQztJQWNBLElBQUcsTUFBTSxDQUFDLGlCQUFQLElBQTZCLFFBQUEsS0FBWSxDQUE1QztNQUNJLElBQUMsQ0FBQSxTQUFELEdBQWE7YUFDYixJQUFDLENBQUEsV0FBRCxHQUFlLFNBRm5COztFQWxCVTs7O0FBc0JkOzs7Ozs7Ozt5Q0FPQSxtQkFBQSxHQUFxQixTQUFDLE1BQUQsRUFBUyxVQUFUO0FBQ2pCLFFBQUE7QUFBQSxZQUFPLE1BQU0sQ0FBQyxJQUFkO0FBQUEsV0FDUyxDQURUO1FBRVEsS0FBQSxHQUFRLFlBQVksQ0FBQztRQUNyQixXQUFXLENBQUMsU0FBWixHQUF3QixXQUFXLENBQUMsU0FBWixHQUF3QjtVQUM1QyxHQUFBLEVBQUssR0FBQSxHQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FEb0I7VUFFNUMsUUFBQSxFQUFVLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFGVztVQUc1QyxLQUFBLEVBQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxrQkFIaUI7VUFJNUMsTUFBQSxFQUFRLEtBQUssQ0FBQyxjQUFjLENBQUMsa0JBSmU7O1FBTWhELFFBQUEsR0FBZSxJQUFBLEVBQUUsQ0FBQyxZQUFILENBQUE7UUFDZixRQUFRLENBQUMsU0FBVCxHQUFxQjtVQUFBLEdBQUEsRUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQWxCO1VBQXVCLFFBQUEsRUFBVSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQXhEO1VBQTRFLEtBQUEsRUFBTyxLQUFLLENBQUMsYUFBYSxDQUFDLGtCQUF2RztVQUEySCxNQUFBLEVBQVEsS0FBSyxDQUFDLGNBQWMsQ0FBQyxrQkFBeEo7O2VBQ3JCLFlBQVksQ0FBQyxRQUFiLENBQXNCLFFBQXRCLEVBQWdDLEtBQWhDLEVBQW9DLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFNBQUQsR0FBYTtVQUFoQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEM7QUFYUjtlQWFRLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBZixFQUF1QixVQUF2QixFQUFtQyxDQUFuQztBQWJSO0VBRGlCOzs7QUFnQnJCOzs7Ozs7Ozs7eUNBUUEsYUFBQSxHQUFlLFNBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUIsU0FBckI7QUFDWCxRQUFBO0FBQUEsWUFBTyxNQUFNLENBQUMsSUFBZDtBQUFBLFdBQ1MsQ0FEVDtRQUVRLElBQUcsTUFBTSxDQUFDLFVBQVY7aUJBQ0ksSUFBQyxDQUFBLE9BQUQsR0FBVyxNQUFNLENBQUMsV0FEdEI7U0FBQSxNQUFBO2lCQUdJLElBQUMsQ0FBQSxXQUFELENBQWEsTUFBTSxDQUFDLEtBQXBCLEVBSEo7O0FBREM7QUFEVCxXQU1TLENBTlQ7ZUFPUSxJQUFDLENBQUEsZUFBRCxDQUFpQixNQUFNLENBQUMsYUFBeEIsRUFBdUMsSUFBdkMsRUFBNkMsSUFBQyxDQUFBLFNBQTlDO0FBUFIsV0FRUyxDQVJUO1FBU1EsTUFBQSxHQUFTLFdBQVcsQ0FBQyxhQUFhLENBQUM7ZUFDbkMsSUFBQyxDQUFBLGlCQUFELENBQW1CLE1BQU0sRUFBQyxNQUFELEVBQXpCLEVBQWtDLFVBQWxDO0FBVlIsV0FXUyxDQVhUO2VBWVEsSUFBQyxDQUFBLFNBQUQsbUNBQXVCLENBQUUsWUFBekI7QUFaUixXQWFTLENBYlQ7UUFjUSxNQUFBLEdBQVMsV0FBVyxDQUFDLGFBQWEsQ0FBQztRQUNuQyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsTUFBTSxDQUFDLGlCQUF6QixFQUE0QyxTQUE1QztRQUNBLElBQUcsTUFBTSxDQUFDLFVBQVY7aUJBQ0ksSUFBQyxDQUFBLE9BQUQsR0FBVyxNQUFNLENBQUMsV0FEdEI7U0FBQSxNQUFBO2lCQUdJLElBQUMsQ0FBQSxXQUFELENBQWEsTUFBTSxDQUFDLEtBQXBCLEVBSEo7O0FBaEJSO0VBRFc7OztBQXNCZjs7Ozs7Ozs7O3lDQVFBLGVBQUEsR0FBaUIsU0FBQyxFQUFELEVBQUssVUFBTCxFQUFpQixJQUFqQjtBQUNiLFFBQUE7SUFBQSxXQUFBLEdBQWMsV0FBVyxDQUFDLFlBQWEsQ0FBQSxFQUFBO0lBRXZDLElBQUcsbUJBQUg7TUFDSSxJQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLE9BQW5ELENBQTJELFdBQTNELENBQUEsS0FBMkUsQ0FBQyxDQUEvRTtRQUNJLFlBQVksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsU0FBeEMsQ0FBa0QsV0FBbEQsRUFESjs7O1dBRWtCLENBQUUsRUFBcEIsQ0FBdUIsUUFBdkIsRUFBaUMsRUFBRSxDQUFDLFFBQUgsQ0FBWSxxQkFBWixFQUFtQyxJQUFuQyxDQUFqQyxFQUEyRTtVQUFFLE9BQUEsRUFBUyxJQUFYO1NBQTNFOztNQUVBLElBQUMsQ0FBQSxjQUFELEdBQWtCLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBckIsQ0FBMEIsVUFBQSxJQUFjLEVBQXhDLEVBQTRDLElBQUMsQ0FBQSxRQUE3QyxFQUF1RCxJQUFDLENBQUEsT0FBeEQ7TUFHbEIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFyQixDQUFBO01BRUEsSUFBRywyQkFBSDtRQUNJLElBQUMsQ0FBQSxTQUFELEdBQWE7UUFDYixJQUFDLENBQUEsY0FBYyxDQUFDLFFBQWhCLEdBQTJCLElBQUMsQ0FBQTtRQUM1QixJQUFDLENBQUEsY0FBYyxDQUFDLEtBQWhCLENBQUE7UUFDQSxJQUFDLENBQUEsY0FBYyxDQUFDLE1BQWhCLENBQUEsRUFKSjs7YUFNQSxXQUFXLENBQUMsYUFBYSxDQUFDLGtCQUExQixDQUE2QyxJQUFDLENBQUEsT0FBOUMsRUFoQko7O0VBSGE7OztBQXFCakI7Ozs7Ozs7eUNBTUEsU0FBQSxHQUFXLFNBQUMsR0FBRDtBQUNQLFFBQUE7SUFBQSxhQUFBLEdBQWdCLFdBQVcsQ0FBQyxXQUFaLENBQXdCLEdBQXhCO0lBRWhCLElBQUcscUJBQUg7TUFDSSxJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsSUFBQyxDQUFBLGNBQUQsR0FBc0IsSUFBQSxFQUFFLENBQUMsOEJBQUgsQ0FBQTtNQUN0QixNQUFBLEdBQVM7UUFBRSxRQUFBLEVBQVUsYUFBYSxDQUFDLEtBQUssQ0FBQyxRQUFoQzs7TUFDVCxJQUFDLENBQUEsY0FBYyxDQUFDLE1BQWhCLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQXhCLENBQTRCLGFBQWEsQ0FBQyxHQUExQyxFQUErQyxhQUEvQztNQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsR0FBeUI7TUFDekIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxRQUFoQixHQUEyQixFQUFFLENBQUMsUUFBSCxDQUFZLG1CQUFaLEVBQWlDLElBQWpDO01BQzNCLElBQUMsQ0FBQSxjQUFjLENBQUMsS0FBaEIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsUUFBaEIsR0FBMkIsSUFBQyxDQUFBO2FBQzVCLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsQ0FBQSxFQVZKOztFQUhPOzs7QUFpQlg7Ozs7Ozs7Ozt5Q0FRQSxjQUFBLEdBQWdCLFNBQUMsUUFBRCxFQUFXLElBQVgsRUFBaUIsS0FBakIsRUFBd0IsU0FBeEI7QUFDWixZQUFPLFNBQVA7QUFBQSxXQUNTLENBRFQ7ZUFFUSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsUUFBbEIsRUFBNEIsQ0FBSSxDQUFDLEtBQUEsQ0FBTSxLQUFOLENBQUosR0FBc0IsUUFBQSxDQUFTLEtBQVQsQ0FBdEIsR0FBMkMsQ0FBNUMsQ0FBNUI7QUFGUixXQUdTLENBSFQ7ZUFJUSxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsUUFBbkIsRUFBNkIsQ0FBSSxLQUFILEdBQWMsQ0FBZCxHQUFxQixDQUF0QixDQUE3QjtBQUpSLFdBS1MsQ0FMVDtlQU1RLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixRQUFsQixFQUE0QixLQUFLLENBQUMsUUFBTixDQUFBLENBQTVCO0FBTlIsV0FPUyxDQVBUO2VBUVEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsUUFBakIsRUFBMkIsQ0FBSSxvQkFBSCxHQUFzQixLQUF0QixHQUFpQyxFQUFsQyxDQUEzQjtBQVJSO0VBRFk7OztBQVdoQjs7Ozt5Q0FHQSxXQUFBLEdBQWEsU0FBQyxLQUFEO0FBQ1QsUUFBQTtJQUFBLElBQVUsQ0FBSSxLQUFkO0FBQUEsYUFBQTs7SUFDQSxLQUFBLEdBQVE7QUFFUixTQUFTLG9HQUFUO01BQ0ksSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxFQUFwQixLQUEwQixVQUExQixJQUF5QyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsSUFBM0IsS0FBbUMsS0FBL0U7UUFDSSxJQUFDLENBQUEsT0FBRCxHQUFXO1FBQ1gsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQztRQUM5QixLQUFBLEdBQVE7QUFDUixjQUpKOztBQURKO0lBT0EsSUFBRyxLQUFIO01BQ0ksSUFBQyxDQUFBLFdBQUQsR0FBZTthQUNmLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFGakI7O0VBWFM7OztBQWViOzs7Ozs7Ozt5Q0FPQSxnQkFBQSxHQUFrQixTQUFDLEVBQUQ7SUFDZCxJQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQTdCO0FBQ0ksYUFBTyxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUF6QixDQUFvQyxFQUFBLElBQU0sWUFBMUMsRUFEWDtLQUFBLE1BQUE7QUFHSSxhQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQXpCLENBQW9DLEVBQUEsSUFBTSxlQUExQyxFQUhYOztFQURjOzs7QUFNbEI7Ozs7Ozs7O3lDQU9BLGFBQUEsR0FBZSxTQUFBO0lBQ1gsSUFBRyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUE3QjtBQUNJLGFBQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBekIsQ0FBb0MscUJBQXBDLEVBRFg7S0FBQSxNQUFBO0FBR0ksYUFBTyxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUF6QixDQUFvQyx3QkFBcEMsRUFIWDs7RUFEVzs7O0FBS2Y7Ozs7Ozs7O3lDQU9BLGVBQUEsR0FBaUIsU0FBQTtJQUNiLElBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBN0I7QUFDSSxhQUFPLHNCQURYO0tBQUEsTUFBQTtBQUdJLGFBQU8seUJBSFg7O0VBRGE7OztBQU1qQjs7Ozs7Ozs7eUNBT0EsZUFBQSxHQUFpQixTQUFBO0FBQ2IsUUFBQTtJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsYUFBRCxDQUFBO0FBRVYsV0FBTyxPQUFPLENBQUM7RUFIRjs7O0FBS2pCOzs7Ozs7Ozt5Q0FPQSxhQUFBLEdBQWUsU0FBQTtBQUNYLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGFBQUQsQ0FBQTtJQUNWLE1BQUEsR0FBUyxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQztJQUMzQixJQUFHLGNBQUg7QUFDSSxjQUFPLE1BQU0sQ0FBQyxJQUFkO0FBQUEsYUFDUyxDQURUO1VBRVEsT0FBQSwwRUFBMkQsSUFBQyxDQUFBLGFBQUQsQ0FBQTtBQUQxRDtBQURULGFBR1MsQ0FIVDtVQUlRLE9BQUEsaUhBQWdFLElBQUMsQ0FBQSxhQUFELENBQUE7QUFKeEUsT0FESjs7QUFPQSxXQUFPO0VBVkk7OztBQVlmOzs7Ozs7Ozt5Q0FPQSxnQkFBQSxHQUFrQixTQUFBO0FBQ2QsUUFBQTtJQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsYUFBRCxDQUFBO0lBQ2IsTUFBQSxHQUFTLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDO0lBQzNCLElBQUcsY0FBSDtBQUNJLGNBQU8sTUFBTSxDQUFDLElBQWQ7QUFBQSxhQUNTLENBRFQ7VUFFUSxVQUFBLDBFQUE4RCxJQUFDLENBQUEsYUFBRCxDQUFBO0FBRDdEO0FBRFQsYUFHUyxDQUhUO1VBSVEsVUFBQSxtR0FBbUYsSUFBQyxDQUFBLGFBQUQsQ0FBQTtBQUozRixPQURKOztBQU9BLFdBQU87RUFWTzs7O0FBWWxCOzs7Ozs7Ozs7eUNBUUEsbUJBQUEsR0FBcUIsU0FBQyxDQUFEO0lBQ2pCLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBMUIsQ0FBQTtJQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFDLENBQUEsVUFBVSxDQUFDLFdBQVcsQ0FBQyxRQUExQyxFQUFvRCxRQUFBLENBQVMsRUFBRSxDQUFDLHdCQUF3QixDQUFDLFVBQTVCLENBQXVDLENBQUMsQ0FBQyxNQUF6QyxFQUFpRCxDQUFDLENBQUMsTUFBbkQsQ0FBVCxDQUFwRDtJQUNBLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDYixJQUFDLENBQUEsVUFBVSxDQUFDLFdBQVosR0FBMEI7V0FDMUIsWUFBWSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBbEMsQ0FBQTtFQUxpQjs7O0FBT3JCOzs7Ozs7Ozs7eUNBUUEsaUJBQUEsR0FBbUIsU0FBQyxDQUFEO0lBQ2YsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUExQixDQUFBO0lBQ0EsSUFBQyxDQUFBLGdCQUFELENBQWtCLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQXhDLEVBQWtELEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxVQUE1QixDQUF1QyxDQUFDLENBQUMsTUFBekMsRUFBaUQsQ0FBQyxDQUFDLElBQW5ELENBQXdELENBQUMsT0FBekQsQ0FBaUUsSUFBakUsRUFBdUUsRUFBdkUsQ0FBbEQ7SUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhO0lBQ2IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLEdBQXdCO1dBQ3hCLFlBQVksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQWhDLENBQUE7RUFMZTs7O0FBT25COzs7Ozs7Ozs7eUNBUUEsY0FBQSxHQUFnQixTQUFDLENBQUQ7QUFDWixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUEzQixDQUFBO0lBRUEsQ0FBQyxDQUFDLFVBQUYsR0FBZTtJQUNmLE9BQU8sQ0FBQyxDQUFDO0lBRVQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFwQixDQUF5QjtNQUFFLFNBQUEsRUFBVztRQUFFLElBQUEsRUFBTSxFQUFSO09BQWI7TUFBMkIsT0FBQSxFQUFTLEVBQXBDO01BQXdDLE1BQUEsRUFBUSxDQUFoRDtNQUFtRCxPQUFBLEVBQVMsS0FBSyxDQUFDLE9BQWxFO01BQTJFLFFBQUEsRUFBVSxJQUFyRjtLQUF6QjtJQUNBLEtBQUssQ0FBQyxPQUFOLEdBQWdCO0lBQ2hCLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGFBQUQsQ0FBQTtJQUNoQiw0QkFBRyxhQUFhLENBQUUsZ0JBQWxCO01BQ0ksSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUNiLE1BQUEsR0FBUyxXQUFXLENBQUMsWUFBWSxDQUFDO01BQ2xDLFFBQUEsR0FBYyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQTVCLEdBQXNDLENBQXRDLEdBQTZDLE1BQU0sQ0FBQztNQUMvRCxhQUFhLENBQUMsUUFBUSxDQUFDLFNBQXZCLENBQWlDLE1BQU0sQ0FBQyxTQUF4QyxFQUFtRCxNQUFNLENBQUMsTUFBMUQsRUFBa0UsUUFBbEUsRUFBNEUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3hFLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBdkIsQ0FBQTtVQUNBLGFBQWEsQ0FBQyxPQUFkLEdBQXdCO1VBQ3hCLEtBQUMsQ0FBQSxTQUFELEdBQWE7VUFDYixLQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosR0FBcUI7aUJBQ3JCLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixDQUFDLENBQUMsTUFBdkIsRUFBK0IsSUFBL0I7UUFMd0U7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVFLEVBSko7S0FBQSxNQUFBO01BWUksSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUNiLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixDQUFDLENBQUMsTUFBdkIsRUFBK0IsSUFBL0IsRUFiSjs7V0FjQSxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQW5CLENBQUE7RUF4Qlk7OztBQTBCaEI7Ozs7Ozt5Q0FLQSxXQUFBLEdBQWEsU0FBQTtXQUNULElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QixDQUFDLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBO0VBRGpCOzs7QUFJYjs7Ozs7O3lDQUtBLGlCQUFBLEdBQW1CLFNBQUE7QUFDZixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixNQUFBLEdBQVMsS0FBSyxDQUFDO0lBQ2YsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsS0FBQSxHQUFRLE1BQU8sQ0FBQSxNQUFBO0lBQ2YsSUFBTyxhQUFQO01BQ0ksS0FBQSxHQUFZLElBQUEsRUFBRSxDQUFDLG9CQUFILENBQUE7TUFDWixNQUFPLENBQUEsTUFBQSxDQUFQLEdBQWlCLE1BRnJCOztJQUlBLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBYixDQUF3QixTQUF4QixFQUFtQyxJQUFDLENBQUEsTUFBcEM7SUFDQSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQWIsQ0FBZ0IsU0FBaEIsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7QUFDdkIsWUFBQTtRQUFBLE1BQUEsR0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ2hCLGdCQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBckI7QUFBQSxlQUNTLENBRFQ7WUFFUSxJQUFHLHlCQUFIO3FCQUNJLFlBQVksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQS9CLEdBQXlDLE1BQU0sQ0FBQyxXQURwRDthQUFBLE1BQUE7cUJBR0ksWUFBWSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBL0IsQ0FBMkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBOUQsRUFISjs7QUFEQztBQURULGVBTVMsQ0FOVDttQkFPUSxZQUFZLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxlQUEvQixDQUErQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFsRSxFQUFpRixJQUFqRixFQUF1RixLQUFDLENBQUEsV0FBVyxDQUFDLFNBQXBHO0FBUFI7TUFGdUI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCLEVBVUE7TUFBRSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BQVg7S0FWQSxFQVVxQixJQUFDLENBQUEsTUFWdEI7SUFZQSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQWYsR0FBMEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckM7V0FDMUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFmLENBQUE7RUF2QmU7OztBQTBCbkI7Ozs7Ozt5Q0FLQSxrQkFBQSxHQUFvQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxNQUFBLEdBQVMsWUFBWSxDQUFDLEtBQUssQ0FBQztJQUM1QixNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7K0NBQ0ssQ0FBRSxRQUFRLENBQUMsTUFBekIsQ0FBQTtFQUhnQjs7O0FBS3BCOzs7Ozs7eUNBS0EsaUJBQUEsR0FBbUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxNQUFBLEdBQVMsWUFBWSxDQUFDLEtBQUssQ0FBQztJQUM1QixNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7K0NBQ0ssQ0FBRSxRQUFRLENBQUMsS0FBekIsQ0FBQTtFQUhlOzs7QUFLbkI7Ozs7Ozt5Q0FLQSxnQkFBQSxHQUFrQixTQUFBO0FBQ2QsUUFBQTtJQUFBLE1BQUEsR0FBUyxZQUFZLENBQUMsS0FBSyxDQUFDO0lBQzVCLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQzsrQ0FDSyxDQUFFLFFBQVEsQ0FBQyxJQUF6QixDQUFBO0VBSGM7OztBQUtsQjs7Ozs7O3lDQUtBLFdBQUEsR0FBYSxTQUFBO0FBQ1QsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFyQztJQUVQLElBQUcsY0FBQSxJQUFVLElBQUEsR0FBTyxDQUFqQixJQUF1QixDQUFDLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBeEM7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkI7YUFDM0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCLEtBRjdCOztFQUhTOzs7QUFPYjs7Ozs7O3lDQUtBLFdBQUEsR0FBYSxTQUFBO0lBQ1QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFNLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLENBQW5CLEdBQTBDO01BQUUsT0FBQSxFQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBeEI7TUFBaUMsU0FBQSxFQUFXLFNBQUE7ZUFBRztNQUFILENBQTVDOztXQUMxQyxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWI7RUFGUzs7O0FBSWI7Ozs7Ozt5Q0FLQSxvQkFBQSxHQUFzQixTQUFBO0lBQ2xCLElBQUcsQ0FBQyxJQUFDLENBQUEsV0FBVyxDQUFDLEtBQU0sQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsQ0FBdkI7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLEtBQU0sQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsQ0FBbkIsR0FBOEMsSUFBQSxFQUFFLENBQUMsY0FBSCxDQUFrQixJQUFDLENBQUEsTUFBbkIsRUFBMkIsSUFBQyxDQUFBLFdBQTVCO01BQzlDLElBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFNLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLENBQW9CLENBQUMsU0FBeEMsQ0FBQSxDQUFIO2VBQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLEdBREo7T0FGSjtLQUFBLE1BQUE7YUFLSSxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsR0FMSjs7RUFEa0I7OztBQVF0Qjs7Ozs7O3lDQUtBLGdCQUFBLEdBQWtCLFNBQUE7QUFDZCxRQUFBO0lBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQTtBQUNWLFdBQVUsd0NBQUosSUFBb0MsTUFBQSxHQUFTLENBQW5EO01BQ0ksTUFBQTtJQURKO0lBR0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFNLENBQUEsTUFBQSxDQUFuQixHQUE2QjtXQUM3QixJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsR0FBc0I7RUFOUjs7O0FBUWxCOzs7Ozt5Q0FJQSxjQUFBLEdBQWdCLFNBQUE7QUFDWixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFBYixDQUEwQixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQWxDO0FBRVAsWUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQWY7QUFBQSxXQUNTLENBRFQ7UUFFUSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DLENBQVY7QUFEQztBQURULFdBR1MsQ0FIVDtRQUlRLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBcEMsQ0FBVjtBQURDO0FBSFQsV0FLUyxDQUxUO1FBTVEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQyxDQUFWO0FBREM7QUFMVCxXQU9TLENBUFQ7UUFRUSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFBYixDQUEwQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQWxDLENBQVY7QUFSUjtXQVVBLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXJDLEVBQW1ELElBQW5EO0VBYlk7OztBQWVoQjs7Ozs7eUNBSUEsY0FBQSxHQUFnQixTQUFBO0FBQ1osUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFsQztJQUNQLEtBQUEsc0NBQXFCO1dBRXJCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXBDLEVBQW9ELElBQXBELEVBQTBELEtBQTFELEVBQWlFLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBekU7RUFKWTs7O0FBTWhCOzs7Ozt5Q0FJQSxnQkFBQSxHQUFrQixTQUFBO0FBQ2QsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFsQztJQUNQLEtBQUEsd0NBQXVCO1dBRXZCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXBDLEVBQW9ELElBQXBELEVBQTBELEtBQTFELEVBQWlFLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBekU7RUFKYzs7O0FBTWxCOzs7Ozt5Q0FJQSxrQkFBQSxHQUFvQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBbEM7SUFDUCxLQUFBLEdBQVEsQ0FBQztBQUVULFlBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFmO0FBQUEsV0FDUyxDQURUO1FBRVEsS0FBQSxHQUFRLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkMsQ0FBYjtBQURQO0FBRFQsV0FHUyxDQUhUO1FBSVEsS0FBQSxHQUFRLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBcEMsQ0FBYjtBQURQO0FBSFQsV0FLUyxDQUxUO1FBTVEsS0FBQSxHQUFRLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkMsQ0FBYjtBQURQO0FBTFQsV0FPUyxDQVBUO1FBUVEsS0FBQSxHQUFRLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbEMsQ0FBYjtBQVJoQjtXQVVBLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxLQUF0RDtFQWRnQjs7O0FBZ0JwQjs7Ozs7eUNBSUEsZ0JBQUEsR0FBa0IsU0FBQTtBQUNkLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBbEM7V0FDUCxJQUFJLENBQUMsTUFBTCxHQUFjO0VBRkE7OztBQUlsQjs7Ozs7eUNBSUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFBYixDQUEwQixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQWxDO0lBQ1AsS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DO0lBRVIsSUFBRyxLQUFBLElBQVMsQ0FBVCxJQUFlLEtBQUEsR0FBUSxJQUFJLENBQUMsTUFBL0I7TUFDSSxLQUFBLHVDQUFzQjthQUN0QixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFwQyxFQUFvRCxJQUFwRCxFQUEwRCxLQUExRCxFQUFpRSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQXpFLEVBRko7O0VBSmdCOzs7QUFRcEI7Ozs7O3lDQUlBLG1CQUFBLEdBQXFCLFNBQUE7QUFDakIsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFsQztJQUNQLEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQztJQUVSLElBQUcsS0FBQSxJQUFTLENBQVQsSUFBZSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQS9CO2FBQ0ksSUFBSSxDQUFDLE1BQUwsQ0FBWSxLQUFaLEVBQW1CLENBQW5CLEVBREo7O0VBSmlCOzs7QUFPckI7Ozs7O3lDQUlBLG1CQUFBLEdBQXFCLFNBQUE7QUFDakIsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFsQztJQUNQLEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQztJQUVSLElBQUcsS0FBQSxJQUFTLENBQVQsSUFBZSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQS9CO0FBQ0ksY0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQWY7QUFBQSxhQUNTLENBRFQ7VUFFUSxJQUFJLENBQUMsTUFBTCxDQUFZLEtBQVosRUFBbUIsQ0FBbkIsRUFBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkMsQ0FBdEI7QUFEQztBQURULGFBR1MsQ0FIVDtVQUlRLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixFQUFtQixDQUFuQixFQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQyxDQUF0QjtBQURDO0FBSFQsYUFLUyxDQUxUO1VBTVEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxLQUFaLEVBQW1CLENBQW5CLEVBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DLENBQXRCO0FBREM7QUFMVCxhQU9TLENBUFQ7VUFRUSxJQUFJLENBQUMsTUFBTCxDQUFZLEtBQVosRUFBbUIsQ0FBbkIsRUFBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbEMsQ0FBdEI7QUFSUjthQVVBLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXJDLEVBQW1ELElBQW5ELEVBWEo7O0VBSmlCOzs7QUFpQnJCOzs7Ozt5Q0FJQSxjQUFBLEdBQWdCLFNBQUE7QUFDWixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFBYixDQUEwQixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQWxDO0lBQ1AsS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DO0lBRVIsSUFBRyxLQUFBLElBQVMsQ0FBWjtBQUNJLGNBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFmO0FBQUEsYUFDUyxDQURUO1VBRVEsSUFBSyxDQUFBLEtBQUEsQ0FBTCxHQUFjLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO0FBRGI7QUFEVCxhQUdTLENBSFQ7VUFJUSxJQUFLLENBQUEsS0FBQSxDQUFMLEdBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBcEM7QUFEYjtBQUhULGFBS1MsQ0FMVDtVQU1RLElBQUssQ0FBQSxLQUFBLENBQUwsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztBQURiO0FBTFQsYUFPUyxDQVBUO1VBUVEsSUFBSyxDQUFBLEtBQUEsQ0FBTCxHQUFjLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFBYixDQUEwQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQWxDO0FBUnRCO2FBVUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBckMsRUFBbUQsSUFBbkQsRUFYSjs7RUFKWTs7O0FBaUJoQjs7Ozs7eUNBSUEsZUFBQSxHQUFpQixTQUFBO0FBQ2IsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFsQztJQUNQLElBQUEsR0FBTyxNQUFNLENBQUMsUUFBUCxDQUFnQixJQUFoQjtXQUVQLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXJDLEVBQXFELElBQXJEO0VBSmE7OztBQU1qQjs7Ozs7eUNBSUEsaUJBQUEsR0FBbUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBbEM7V0FFUCxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsSUFBSSxDQUFDLE1BQTNEO0VBSGU7OztBQUtuQjs7Ozs7eUNBSUEsZUFBQSxHQUFpQixTQUFBO0FBQ2IsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFsQztJQUNQLEtBQUEsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsS0FBaUIsQ0FBcEIsR0FBMkIsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsSUFBbUIsRUFBN0IsQ0FBM0IsR0FBaUUsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFjLENBQUMsSUFBZixDQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsSUFBbUIsRUFBdkM7V0FFekUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELEtBQXREO0VBSmE7OztBQU1qQjs7Ozs7eUNBSUEsbUJBQUEsR0FBcUIsU0FBQTtBQUNqQixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQW5DO0lBQ1AsU0FBQSxHQUFZLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5DO0lBQ1osSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBWDtXQUVQLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXJDLEVBQXFELElBQXJEO0VBTGlCOzs7QUFPckI7Ozs7O3lDQUlBLGtCQUFBLEdBQW9CLFNBQUE7QUFDaEIsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFsQztJQUNQLElBQUcsSUFBSSxDQUFDLE1BQUwsSUFBZSxDQUFsQjtBQUF5QixhQUF6Qjs7QUFFQTtTQUFTLG1GQUFUO01BQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBM0I7TUFDSixLQUFBLEdBQVEsSUFBSyxDQUFBLENBQUE7TUFDYixLQUFBLEdBQVEsSUFBSyxDQUFBLENBQUE7TUFDYixJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVU7bUJBQ1YsSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVO0FBTGQ7O0VBSmdCOzs7QUFXcEI7Ozs7O3lDQUlBLGVBQUEsR0FBaUIsU0FBQTtBQUNiLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBbEM7SUFDUCxJQUFHLElBQUksQ0FBQyxNQUFMLEtBQWUsQ0FBbEI7QUFBeUIsYUFBekI7O0FBRUEsWUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQWY7QUFBQSxXQUNTLENBRFQ7ZUFFUSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQUMsQ0FBRCxFQUFJLENBQUo7VUFDTixJQUFHLENBQUEsR0FBSSxDQUFQO0FBQWMsbUJBQU8sQ0FBQyxFQUF0Qjs7VUFDQSxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQWMsbUJBQU8sRUFBckI7O0FBQ0EsaUJBQU87UUFIRCxDQUFWO0FBRlIsV0FNUyxDQU5UO2VBT1EsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFDLENBQUQsRUFBSSxDQUFKO1VBQ04sSUFBRyxDQUFBLEdBQUksQ0FBUDtBQUFjLG1CQUFPLENBQUMsRUFBdEI7O1VBQ0EsSUFBRyxDQUFBLEdBQUksQ0FBUDtBQUFjLG1CQUFPLEVBQXJCOztBQUNBLGlCQUFPO1FBSEQsQ0FBVjtBQVBSO0VBSmE7OztBQWlCakI7Ozs7O3lDQUlBLHFCQUFBLEdBQXVCLFNBQUE7QUFDbkIsUUFBQTtBQUFBLFlBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFmO0FBQUEsV0FDUyxDQURUO1FBRVEsS0FBQSxHQUFRO0FBRFA7QUFEVCxXQUdTLENBSFQ7UUFJUSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQztBQUp4QjtBQU1BLFlBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFmO0FBQUEsV0FDUyxDQURUO1FBRVEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVg7aUJBQ0ksV0FBVyxDQUFDLGFBQWEsQ0FBQyxtQkFBMUIsQ0FBOEM7WUFBRSxFQUFBLEVBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBcEI7V0FBOUMsRUFBeUUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFqRixFQUF1RixLQUF2RixFQURKOztBQURDO0FBRFQsV0FJUyxDQUpUO2VBS1EsV0FBVyxDQUFDLGFBQWEsQ0FBQyxtQkFBMUIsQ0FBOEMsSUFBOUMsRUFBb0QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUE1RCxFQUFrRSxLQUFsRTtBQUxSLFdBTVMsQ0FOVDtlQU9RLFdBQVcsQ0FBQyxhQUFhLENBQUMsb0JBQTFCLENBQStDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBdkQsRUFBNkQsS0FBN0Q7QUFQUixXQVFTLENBUlQ7UUFTUSxXQUFXLENBQUMsYUFBYSxDQUFDLHdCQUExQixDQUFtRCxJQUFDLENBQUEsTUFBTSxDQUFDLElBQTNELEVBQWlFLEtBQWpFO2VBQ0EsV0FBVyxDQUFDLGNBQVosQ0FBQTtBQVZSO0VBUG1COzs7QUFvQnZCOzs7Ozt5Q0FJQSwyQkFBQSxHQUE2QixTQUFBO1dBQ3pCLFdBQVcsQ0FBQyxhQUFhLENBQUMsWUFBMUIsQ0FBdUMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsQ0FBdkM7RUFEeUI7OztBQUc3Qjs7Ozs7eUNBSUEsNkJBQUEsR0FBK0IsU0FBQTtXQUFHLElBQUMsQ0FBQSxXQUFXLENBQUMsc0JBQWIsQ0FBb0MsSUFBQyxDQUFBLE1BQXJDLEVBQTZDLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBckQ7RUFBSDs7O0FBRS9COzs7Ozt5Q0FJQSw0QkFBQSxHQUE4QixTQUFBO0FBQzFCLFFBQUE7SUFBQSxNQUFBLEdBQVM7QUFFVCxZQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBZjtBQUFBLFdBQ1MsQ0FEVDtRQUVRLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztBQURSO0FBRFQsV0FHUyxDQUhUO1FBSVEsS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFoRDtRQUNSLEdBQUEsR0FBTSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBaEQ7UUFDTixJQUFBLEdBQU8sR0FBQSxHQUFNO1FBQ2IsTUFBQSxHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLElBQUEsR0FBSyxDQUFOLENBQW5DO0FBSlI7QUFIVCxXQVFTLENBUlQ7UUFTUSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxrQkFBYixDQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXhDLEVBQXFELElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGVBQW5DLENBQUEsR0FBb0QsQ0FBekcsRUFBNEcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBcEg7QUFEUjtBQVJULFdBVVMsQ0FWVDtRQVdRLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLHFCQUFiLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBM0M7QUFEUjtBQVZULFdBWVMsQ0FaVDtRQWFRLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLHlCQUFiLENBQXVDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBL0M7QUFiakI7QUFlQSxZQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBZjtBQUFBLFdBQ1MsQ0FEVDtBQUVRLGdCQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBZjtBQUFBLGVBQ1MsQ0FEVDtZQUVRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUF0RDtBQURDO0FBRFQsZUFHUyxDQUhUO1lBSVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQW5DLENBQUEsR0FBcUQsTUFBM0c7QUFEQztBQUhULGVBS1MsQ0FMVDtZQU1RLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFuQyxDQUFBLEdBQXFELE1BQTNHO0FBREM7QUFMVCxlQU9TLENBUFQ7WUFRUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBbkMsQ0FBQSxHQUFxRCxNQUEzRztBQURDO0FBUFQsZUFTUyxDQVRUO1lBVVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBbkMsQ0FBQSxHQUFxRCxNQUFoRSxDQUF0RDtBQURDO0FBVFQsZUFXUyxDQVhUO1lBWVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQW5DLENBQUEsR0FBcUQsTUFBM0c7QUFaUjtBQURDO0FBRFQsV0FlUyxDQWZUO1FBZ0JRLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDO1FBQ2hCLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFwQixHQUEwQjtRQUNsQyxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBcEIsR0FBd0I7QUFDOUIsYUFBUyxpR0FBVDtBQUNJLGtCQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBZjtBQUFBLGlCQUNTLENBRFQ7Y0FFUSxJQUFDLENBQUEsV0FBVyxDQUFDLHFCQUFiLENBQW1DLEtBQW5DLEVBQTBDLENBQTFDLEVBQTZDLE1BQTdDO0FBREM7QUFEVCxpQkFHUyxDQUhUO2NBSVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxxQkFBYixDQUFtQyxLQUFuQyxFQUEwQyxDQUExQyxFQUE2QyxJQUFDLENBQUEsV0FBVyxDQUFDLGtCQUFiLENBQWdDLEtBQWhDLEVBQXVDLENBQXZDLENBQUEsR0FBNEMsTUFBekY7QUFEQztBQUhULGlCQUtTLENBTFQ7Y0FNUSxJQUFDLENBQUEsV0FBVyxDQUFDLHFCQUFiLENBQW1DLEtBQW5DLEVBQTBDLENBQTFDLEVBQTZDLElBQUMsQ0FBQSxXQUFXLENBQUMsa0JBQWIsQ0FBZ0MsS0FBaEMsRUFBdUMsQ0FBdkMsQ0FBQSxHQUE0QyxNQUF6RjtBQURDO0FBTFQsaUJBT1MsQ0FQVDtjQVFRLElBQUMsQ0FBQSxXQUFXLENBQUMscUJBQWIsQ0FBbUMsS0FBbkMsRUFBMEMsQ0FBMUMsRUFBNkMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxrQkFBYixDQUFnQyxLQUFoQyxFQUF1QyxDQUF2QyxDQUFBLEdBQTRDLE1BQXpGO0FBREM7QUFQVCxpQkFTUyxDQVRUO2NBVVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxxQkFBYixDQUFtQyxLQUFuQyxFQUEwQyxDQUExQyxFQUE2QyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsa0JBQWIsQ0FBZ0MsS0FBaEMsRUFBdUMsQ0FBdkMsQ0FBQSxHQUE0QyxNQUF2RCxDQUE3QztBQURDO0FBVFQsaUJBV1MsQ0FYVDtjQVlRLElBQUMsQ0FBQSxXQUFXLENBQUMscUJBQWIsQ0FBbUMsS0FBbkMsRUFBMEMsQ0FBMUMsRUFBNkMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxrQkFBYixDQUFnQyxLQUFoQyxFQUF1QyxDQUF2QyxDQUFBLEdBQTRDLE1BQXpGO0FBWlI7QUFESjtBQUpDO0FBZlQsV0FpQ1MsQ0FqQ1Q7UUFrQ1EsS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGVBQW5DLENBQUEsR0FBc0Q7QUFDOUQsZ0JBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFmO0FBQUEsZUFDUyxDQURUO1lBRVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxxQkFBYixDQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQTNDLEVBQXdELEtBQXhELEVBQStELE1BQS9ELEVBQXVFLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQS9FO0FBREM7QUFEVCxlQUdTLENBSFQ7WUFJUSxJQUFDLENBQUEsV0FBVyxDQUFDLHFCQUFiLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBM0MsRUFBd0QsS0FBeEQsRUFBK0QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxrQkFBYixDQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXhDLEVBQXFELEtBQXJELEVBQTRELElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQXBFLENBQUEsR0FBNkYsTUFBNUosRUFBb0ssSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBNUs7QUFEQztBQUhULGVBS1MsQ0FMVDtZQU1RLElBQUMsQ0FBQSxXQUFXLENBQUMscUJBQWIsQ0FBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUEzQyxFQUF3RCxLQUF4RCxFQUErRCxJQUFDLENBQUEsV0FBVyxDQUFDLGtCQUFiLENBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBeEMsRUFBcUQsS0FBckQsRUFBNEQsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBcEUsQ0FBQSxHQUE2RixNQUE1SixFQUFvSyxJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUE1SztBQURDO0FBTFQsZUFPUyxDQVBUO1lBUVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxxQkFBYixDQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQTNDLEVBQXdELEtBQXhELEVBQStELElBQUMsQ0FBQSxXQUFXLENBQUMsa0JBQWIsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUF4QyxFQUFxRCxLQUFyRCxFQUE0RCxJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUFwRSxDQUFBLEdBQTZGLE1BQTVKLEVBQW9LLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQTVLO0FBREM7QUFQVCxlQVNTLENBVFQ7WUFVUSxJQUFDLENBQUEsV0FBVyxDQUFDLHFCQUFiLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBM0MsRUFBd0QsS0FBeEQsRUFBK0QsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGtCQUFiLENBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBeEMsRUFBcUQsS0FBckQsRUFBNEQsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBcEUsQ0FBQSxHQUE2RixNQUF4RyxDQUEvRCxFQUFnTCxJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUF4TDtBQURDO0FBVFQsZUFXUyxDQVhUO1lBWVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxxQkFBYixDQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQTNDLEVBQXdELEtBQXhELEVBQStELElBQUMsQ0FBQSxXQUFXLENBQUMsa0JBQWIsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUF4QyxFQUFxRCxLQUFyRCxFQUE0RCxJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUFwRSxDQUFBLEdBQTZGLE1BQTVKLEVBQW9LLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQTVLO0FBWlI7QUFuQ1I7QUFpREEsV0FBTztFQW5FbUI7OztBQXFFOUI7Ozs7O3lDQUlBLDZCQUFBLEdBQStCLFNBQUE7QUFDM0IsUUFBQTtJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFwQztBQUVULFlBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFmO0FBQUEsV0FDUyxDQURUO1FBRVEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsS0FBaUIsQ0FBcEI7VUFDSSxXQUFBLEdBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBcEM7VUFDZCxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBMEQsV0FBSCxHQUFvQixLQUFwQixHQUErQixJQUF0RixFQUZKO1NBQUEsTUFBQTtVQUlJLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF2QyxFQUF1RCxNQUF2RCxFQUpKOztBQURDO0FBRFQsV0FPUyxDQVBUO1FBUVEsUUFBQSxHQUFXO1VBQUUsS0FBQSxFQUFPLENBQVQ7VUFBWSxLQUFBLEVBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBM0I7O0FBQ1gsYUFBUywySUFBVDtVQUNJLFFBQVEsQ0FBQyxLQUFULEdBQWlCO1VBQ2pCLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLEtBQWlCLENBQXBCO1lBQ0ksV0FBQSxHQUFjLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixRQUE1QjtZQUNkLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsUUFBL0IsRUFBNEMsV0FBSCxHQUFvQixLQUFwQixHQUErQixJQUF4RSxFQUZKO1dBQUEsTUFBQTtZQUlJLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsUUFBL0IsRUFBeUMsTUFBekMsRUFKSjs7QUFGSjtBQUZDO0FBUFQsV0FnQlMsQ0FoQlQ7UUFpQlEsS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGVBQW5DLENBQUEsR0FBc0Q7UUFDOUQsSUFBQyxDQUFBLFdBQVcsQ0FBQyxzQkFBYixDQUFvQyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUE1QyxFQUE4RCxLQUE5RCxFQUFxRSxNQUFyRSxFQUE2RSxJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUFyRjtBQWxCUjtBQW9CQSxXQUFPO0VBdkJvQjs7O0FBeUIvQjs7Ozs7eUNBSUEsNEJBQUEsR0FBOEIsU0FBQTtBQUMxQixRQUFBO0lBQUEsTUFBQSxHQUFTO0FBQ1QsWUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQWY7QUFBQSxXQUNTLENBRFQ7UUFFUSxNQUFBLEdBQVMsR0FBQSxDQUFJLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBWjtBQURSO0FBRFQsV0FHUyxDQUhUO1FBSVEsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQW5DO0FBRFI7QUFIVCxXQUtTLENBTFQ7UUFNUSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyx5QkFBYixDQUF1QyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQS9DO0FBRFI7QUFMVCxXQU9TLENBUFQ7QUFRUTtVQUNJLE1BQUEsR0FBUyxJQUFBLENBQUssSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFiLEVBRGI7U0FBQSxhQUFBO1VBRU07VUFDRixNQUFBLEdBQVMsT0FBQSxHQUFVLEVBQUUsQ0FBQyxRQUgxQjs7QUFEQztBQVBUO1FBYVEsTUFBQSxHQUFTLEdBQUEsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVo7QUFiakI7QUFlQSxZQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBZjtBQUFBLFdBQ1MsQ0FEVDtBQUVRLGdCQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBZjtBQUFBLGVBQ1MsQ0FEVDtZQUVRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUF0RDtBQURDO0FBRFQsZUFHUyxDQUhUO1lBSVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQW5DLENBQUEsR0FBcUQsTUFBM0c7QUFEQztBQUhULGVBS1MsQ0FMVDtZQU1RLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFuQyxDQUFrRCxDQUFDLFdBQW5ELENBQUEsQ0FBdEQ7QUFEQztBQUxULGVBT1MsQ0FQVDtZQVFRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFuQyxDQUFrRCxDQUFDLFdBQW5ELENBQUEsQ0FBdEQ7QUFSUjtBQURDO0FBRFQsV0FZUyxDQVpUO1FBYVEsUUFBQSxHQUFXO1VBQUUsS0FBQSxFQUFPLENBQVQ7VUFBWSxLQUFBLEVBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBM0I7O0FBQ1gsYUFBUywySUFBVDtVQUNJLFFBQVEsQ0FBQyxLQUFULEdBQWlCO0FBQ2pCLGtCQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBZjtBQUFBLGlCQUNTLENBRFQ7Y0FFUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLFFBQTlCLEVBQXdDLE1BQXhDO0FBREM7QUFEVCxpQkFHUyxDQUhUO2NBSVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixRQUE5QixFQUF3QyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsUUFBM0IsQ0FBQSxHQUF1QyxNQUEvRTtBQURDO0FBSFQsaUJBS1MsQ0FMVDtjQU1RLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsUUFBOUIsRUFBd0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLFFBQTNCLENBQW9DLENBQUMsV0FBckMsQ0FBQSxDQUF4QztBQURDO0FBTFQsaUJBT1MsQ0FQVDtjQVFRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsUUFBOUIsRUFBd0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLFFBQTNCLENBQW9DLENBQUMsV0FBckMsQ0FBQSxDQUF4QztBQVJSO0FBRko7QUFGQztBQVpULFdBMEJTLENBMUJUO1FBMkJRLEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFuQyxDQUFBLEdBQXNEO0FBQzlELGdCQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBZjtBQUFBLGVBQ1MsQ0FEVDtZQUVRLElBQUMsQ0FBQSxXQUFXLENBQUMscUJBQWIsQ0FBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBM0MsRUFBNkQsS0FBN0QsRUFBb0UsTUFBcEUsRUFBNEUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBcEY7QUFEQztBQURULGVBR1MsQ0FIVDtZQUlRLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGtCQUFiLENBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQXhDLEVBQTBELEtBQTFELEVBQWlFLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQXpFO1lBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxxQkFBYixDQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUEzQyxFQUE2RCxLQUE3RCxFQUFvRSxXQUFBLEdBQWMsTUFBbEYsRUFBMEYsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBbEc7QUFGQztBQUhULGVBTVMsQ0FOVDtZQU9RLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGtCQUFiLENBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQXhDLEVBQTBELEtBQTFELEVBQWlFLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQXpFO1lBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxxQkFBYixDQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUEzQyxFQUE2RCxLQUE3RCxFQUFvRSxXQUFXLENBQUMsV0FBWixDQUFBLENBQXBFLEVBQStGLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQXZHO0FBRkM7QUFOVCxlQVNTLENBVFQ7WUFVUSxXQUFBLEdBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxrQkFBYixDQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUF4QyxFQUEwRCxLQUExRCxFQUFpRSxJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUF6RTtZQUNkLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBdEMsRUFBd0QsS0FBeEQsRUFBK0QsV0FBVyxDQUFDLFdBQVosQ0FBQSxDQUEvRCxFQUEwRixJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUFsRztBQVhSO0FBNUJSO0FBd0NBLFdBQU87RUF6RG1COzs7QUEyRDlCOzs7Ozt5Q0FJQSxrQkFBQSxHQUFvQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBcEMsQ0FBQSxJQUF1RCxJQUFDLENBQUEsTUFBTSxDQUFDO0lBQ3hFLElBQUcsTUFBSDthQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBRG5DOztFQUZnQjs7O0FBTXBCOzs7Ozt5Q0FJQSxzQkFBQSxHQUF3QixTQUFBO0FBQ3BCLFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQXFCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQW5DLENBQXJCLEVBQXlFLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DLENBQXpFLEVBQW9ILElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBNUg7SUFDVCxJQUFDLENBQUEsV0FBVyxDQUFDLFVBQVcsQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsQ0FBeEIsR0FBK0M7SUFFL0MsSUFBRyxNQUFIO2FBQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLEdBREo7O0VBSm9COzs7QUFPeEI7Ozs7O3lDQUlBLGdCQUFBLEdBQWtCLFNBQUE7QUFDZCxRQUFBO0FBQUEsWUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQWY7QUFBQSxXQUNTLENBRFQ7UUFFUSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQXFCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQW5DLENBQXJCLEVBQW1FLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DLENBQW5FLEVBQW9ILElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBNUg7QUFEUjtBQURULFdBR1MsQ0FIVDtRQUlRLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBcUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBcEMsQ0FBckIsRUFBb0UsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBcEMsQ0FBcEUsRUFBc0gsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUE5SDtBQURSO0FBSFQsV0FLUyxDQUxUO1FBTVEsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFxQixHQUFBLENBQUksSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBbkMsQ0FBSixDQUFyQixFQUF3RSxHQUFBLENBQUksSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbkMsQ0FBSixDQUF4RSxFQUE0SCxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQXBJO0FBTmpCO0lBUUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFXLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLENBQXhCLEdBQStDO0lBQy9DLElBQUcsTUFBSDthQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBYixHQURKOztFQVZjOzs7QUFhbEI7Ozs7O3lDQUlBLG9CQUFBLEdBQXNCLFNBQUE7SUFDbEIsSUFBRyxDQUFJLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBVyxDQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBYixDQUEvQjthQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBYixHQURKOztFQURrQjs7O0FBSXRCOzs7Ozt5Q0FJQSxzQkFBQSxHQUF3QixTQUFBO0lBQ3BCLElBQUcsQ0FBSSxJQUFDLENBQUEsV0FBVyxDQUFDLFVBQVcsQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsQ0FBL0I7YUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQTlCLENBQW1DLElBQW5DLEVBREo7O0VBRG9COzs7QUFJeEI7Ozs7O3lDQUlBLDBCQUFBLEdBQTRCLFNBQUE7QUFDeEIsUUFBQTtJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBcUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBbkMsQ0FBckIsRUFBeUUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBbkMsQ0FBekUsRUFBb0gsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUE1SDtJQUNULElBQUcsTUFBSDthQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBRG5DOztFQUZ3Qjs7O0FBSzVCOzs7Ozt5Q0FJQSx3QkFBQSxHQUEwQixTQUFBO0FBRXRCLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxLQUFBLEdBQVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBbkM7SUFDUixLQUFBLEdBQVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBbkM7QUFDUixZQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBZjtBQUFBLFdBQ1MsQ0FEVDtRQUNnQixNQUFBLEdBQVMsS0FBQSxLQUFTO0FBQXpCO0FBRFQsV0FFUyxDQUZUO1FBRWdCLE1BQUEsR0FBUyxLQUFBLEtBQVM7QUFBekI7QUFGVCxXQUdTLENBSFQ7UUFHZ0IsTUFBQSxHQUFTLEtBQUssQ0FBQyxNQUFOLEdBQWUsS0FBSyxDQUFDO0FBQXJDO0FBSFQsV0FJUyxDQUpUO1FBSWdCLE1BQUEsR0FBUyxLQUFLLENBQUMsTUFBTixJQUFnQixLQUFLLENBQUM7QUFBdEM7QUFKVCxXQUtTLENBTFQ7UUFLZ0IsTUFBQSxHQUFTLEtBQUssQ0FBQyxNQUFOLEdBQWUsS0FBSyxDQUFDO0FBQXJDO0FBTFQsV0FNUyxDQU5UO1FBTWdCLE1BQUEsR0FBUyxLQUFLLENBQUMsTUFBTixJQUFnQixLQUFLLENBQUM7QUFOL0M7SUFRQSxJQUFHLE1BQUg7YUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsR0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQURuQzs7RUFic0I7OztBQWdCMUI7Ozs7O3lDQUlBLFlBQUEsR0FBYyxTQUFBLEdBQUE7OztBQUdkOzs7Ozt5Q0FJQSxrQkFBQSxHQUFvQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUNoQixJQUFHLGFBQUg7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsR0FBdUI7YUFDdkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLEdBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVMsQ0FBQSxLQUFBLENBQU0sQ0FBQyxPQUY5RDtLQUFBLE1BQUE7QUFJSSxjQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBZjtBQUFBLGFBQ1MsZUFEVDtpQkFFUSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBbkMsQ0FBekI7QUFGUixhQUdTLGFBSFQ7aUJBSVEsWUFBWSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBL0IsQ0FBMkMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBbkMsQ0FBM0M7QUFKUjtpQkFNUSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBbkMsQ0FBekI7QUFOUixPQUpKOztFQUZnQjs7O0FBY3BCOzs7Ozt5Q0FJQSxtQkFBQSxHQUFxQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUE7SUFDaEIsSUFBTyxxQkFBUDtBQUEyQixhQUEzQjs7SUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsUUFBQSxHQUFXO0lBQ1gsTUFBQSxHQUFTLFdBQVcsQ0FBQyxZQUFZLENBQUM7SUFDbEMsSUFBRyxDQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBaEM7TUFDSSxRQUFBLEdBQWMsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFFBQWYsQ0FBSixHQUFrQyxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFyQyxDQUFsQyxHQUFzRixNQUFNLENBQUMsU0FENUc7O0lBRUEsYUFBYSxDQUFDLFFBQVEsQ0FBQyxTQUF2QixDQUFpQyxNQUFNLENBQUMsU0FBeEMsRUFBbUQsTUFBTSxDQUFDLE1BQTFELEVBQWtFLFFBQWxFLEVBQTRFLEVBQUUsQ0FBQyxRQUFILENBQVksbUJBQVosRUFBaUMsSUFBQyxDQUFBLFdBQWxDLENBQTVFO0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxpQkFBYixDQUErQixhQUEvQixFQUE4QyxJQUFDLENBQUEsTUFBL0M7V0FDQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFkaUI7OztBQWdCckI7Ozs7O3lDQUlBLHlCQUFBLEdBQTJCLFNBQUE7QUFDdkIsUUFBQTtJQUFBLFFBQUEsR0FBVyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ2hDLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsSUFBc0I7SUFDOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUVoQyxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxjQUFmLENBQUo7TUFBd0MsUUFBUSxDQUFDLGNBQVQsR0FBMEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBckMsRUFBbEU7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsaUJBQWYsQ0FBSjtNQUEyQyxRQUFRLENBQUMsaUJBQVQsR0FBNkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQXJDLEVBQXhFOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSjtNQUFnQyxRQUFRLENBQUMsTUFBVCxHQUFrQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxFQUFsRDs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxtQkFBQSxDQUFmLENBQUo7TUFBOEMsUUFBUSxDQUFDLFlBQVQsR0FBd0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUE5RTs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxzQkFBQSxDQUFmLENBQUo7TUFBaUQsUUFBUSxDQUFDLGVBQVQsR0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBcEY7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsc0JBQUEsQ0FBZixDQUFKO01BQWlELFFBQVEsQ0FBQyxlQUFULEdBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQXBGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLHlCQUFBLENBQWYsQ0FBSjthQUFvRCxRQUFRLENBQUMsa0JBQVQsR0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBMUY7O0VBWHVCOzs7QUFjM0I7Ozs7O3lDQUlBLGtCQUFBLEdBQW9CLFNBQUE7QUFDaEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFdBQU4sR0FBb0IsRUFBRSxDQUFDLFdBQVcsQ0FBQztJQUNuQyxTQUFBLEdBQVksS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFqQixDQUF1QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxDQUFDLFFBQUgsSUFBZ0IsQ0FBQyxDQUFDLEdBQUYsS0FBUyxLQUFDLENBQUEsTUFBTSxDQUFDO01BQXhDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQUVaLFdBQUEsR0FBYyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7QUFDVixZQUFBO1FBQUEsU0FBQSxHQUFZLGFBQWEsQ0FBQyxVQUFXLENBQUEsS0FBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSO1FBRXJDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBYixHQUF1QjtRQUN2QixhQUFBLEdBQWdCLEtBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBO1FBRWhCLElBQU8scUJBQVA7QUFBMkIsaUJBQTNCOztRQUVBLEtBQUssQ0FBQyxnQkFBTixHQUF5QjtRQUN6QixhQUFhLENBQUMsU0FBZCxHQUEwQjtRQUUxQixhQUFhLENBQUMsT0FBZCxHQUF3QjtRQUN4QixhQUFhLENBQUMsTUFBTSxDQUFDLFVBQXJCLENBQWdDLGlCQUFoQyxFQUFtRCxLQUFDLENBQUEsV0FBcEQ7UUFDQSxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQXJCLENBQXdCLGlCQUF4QixFQUEyQyxFQUFFLENBQUMsUUFBSCxDQUFZLG1CQUFaLEVBQWlDLEtBQUMsQ0FBQSxXQUFsQyxDQUEzQyxFQUEyRjtVQUFBLE1BQUEsRUFBUSxLQUFDLENBQUEsTUFBVDtTQUEzRixFQUE0RyxLQUFDLENBQUEsV0FBN0c7UUFDQSxhQUFhLENBQUMsTUFBTSxDQUFDLElBQXJCLENBQTBCLFFBQTFCLEVBQW9DLEVBQUUsQ0FBQyxRQUFILENBQVksb0JBQVosRUFBa0MsS0FBQyxDQUFBLFdBQW5DLENBQXBDLEVBQXFGO1VBQUEsTUFBQSxFQUFRLEtBQUMsQ0FBQSxNQUFUO1NBQXJGLEVBQXNHLEtBQUMsQ0FBQSxXQUF2RztRQUNBLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBckIsQ0FBMEIsU0FBMUIsRUFBcUMsRUFBRSxDQUFDLFFBQUgsQ0FBWSxxQkFBWixFQUFtQyxLQUFDLENBQUEsV0FBcEMsQ0FBckMsRUFBdUY7VUFBQSxNQUFBLEVBQVEsS0FBQyxDQUFBLE1BQVQ7U0FBdkYsRUFBd0csS0FBQyxDQUFBLFdBQXpHO1FBQ0EsSUFBRyxhQUFhLENBQUMsUUFBUSxDQUFDLGlCQUExQjtVQUNJLGFBQWEsQ0FBQyxPQUFPLENBQUMsV0FBdEIsQ0FBa0MsS0FBQyxDQUFBLFdBQW5DLEVBQWdELEtBQUMsQ0FBQSxNQUFqRCxFQUF5RCxTQUF6RCxFQURKO1NBQUEsTUFBQTtVQUdJLGFBQWEsQ0FBQyxPQUFPLENBQUMsV0FBdEIsQ0FBa0MsS0FBQyxDQUFBLFdBQW5DLEVBQWdELEtBQUMsQ0FBQSxNQUFqRCxFQUhKOztRQUtBLFFBQUEsR0FBVyxXQUFXLENBQUM7UUFDdkIsYUFBQSxHQUFnQixRQUFRLENBQUMsaUJBQWtCLENBQUEsU0FBUyxDQUFDLEtBQVY7UUFFM0MsSUFBRyw0QkFBQSxJQUFtQixXQUFXLENBQUMsUUFBUSxDQUFDLFlBQXhDLElBQXlELENBQUMsQ0FBQyxhQUFELElBQWtCLGFBQUEsR0FBZ0IsQ0FBbkMsQ0FBNUQ7VUFDSSxJQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxpQkFBckIsSUFBMEMsMENBQW1CLENBQUUsaUJBQWhFLENBQUEsSUFBNkUsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQTFHO1lBQ0ksYUFBYSxDQUFDLEtBQWQsR0FBc0IsS0FBQyxDQUFBLE1BQU0sQ0FBQzttQkFDOUIsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUF2QixHQUErQixZQUFZLENBQUMsU0FBYixDQUF1QixLQUFDLENBQUEsTUFBTSxDQUFDLEtBQS9CLEVBRm5DO1dBREo7U0FBQSxNQUFBO1VBS0ksWUFBWSxDQUFDLEtBQWIsR0FBcUI7aUJBQ3JCLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBdkIsR0FBK0IsS0FObkM7O01BeEJVO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQWdDZCxJQUFHLGtDQUFBLElBQTBCLG1CQUE3QjtNQUNJLFVBQUEsR0FBYSxhQUFhLENBQUMsb0JBQXFCLENBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLElBQXdCLENBQXhCO01BQ2hELFFBQUEsR0FBVyxXQUFXLENBQUMsUUFBUSxDQUFDO01BQ2hDLFFBQUEsR0FBYyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFyQixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFqRCxDQUFKLEdBQW9FLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDLENBQXBFLEdBQXdILFFBQVEsQ0FBQztNQUM1SSxNQUFBLEdBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLFFBQVEsQ0FBQyxZQUEvQjtNQUNULFNBQUEsR0FBWSxRQUFRLENBQUM7TUFFckIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxnQkFBbkIsQ0FBb0MsVUFBcEMsRUFBZ0QsU0FBaEQsRUFBMkQsTUFBM0QsRUFBbUUsUUFBbkUsRUFBNkUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUN6RSxXQUFBLENBQUE7UUFEeUU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdFLEVBUEo7S0FBQSxNQUFBO01BV0ksV0FBQSxDQUFBLEVBWEo7O0lBYUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCLHVEQUE2QixJQUE3QixDQUFBLElBQXNDLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQXpCLElBQWtDLFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBekIsS0FBcUMsQ0FBeEU7V0FDaEUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFVLENBQUMsVUFBeEIsR0FBcUMsSUFBQyxDQUFBO0VBbkR0Qjs7O0FBcURwQjs7Ozs7eUNBSUEscUJBQUEsR0FBdUIsU0FBQTtBQUNuQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFFVCxJQUFHLEtBQUssQ0FBQyxZQUFhLENBQUEsTUFBQSxDQUF0QjtNQUNJLGFBQUEsR0FBZ0IsS0FBSyxDQUFDLFlBQWEsQ0FBQSxNQUFBLENBQU8sQ0FBQztNQUMzQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQXRCLEdBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDO01BQ3RDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBdEIsR0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUM7TUFDdEMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUF0QixHQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7TUFDL0MsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUF0QixHQUErQixJQUFDLENBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7YUFDaEQsYUFBYSxDQUFDLFdBQWQsR0FBNEIsS0FOaEM7O0VBSm1COzs7QUFZdkI7Ozs7O3lDQUlBLG9CQUFBLEdBQXNCLFNBQUE7V0FDbEIsV0FBVyxDQUFDLFlBQVksQ0FBQyxhQUF6QixHQUF5QztNQUFBLFFBQUEsRUFBVSxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFyQyxDQUFWO01BQTBELFNBQUEsRUFBVyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQTdFO01BQXdGLE1BQUEsRUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUE5QixDQUFoRzs7RUFEdkI7OztBQUd0Qjs7Ozs7eUNBSUEsc0JBQUEsR0FBd0IsU0FBQTtBQUNwQixRQUFBO0lBQUEsYUFBQSxHQUFnQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBQTtJQUNoQixJQUFHLENBQUMsYUFBSjtBQUF1QixhQUF2Qjs7SUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsZUFBQSxHQUFrQixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBQTtJQUVsQixJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxTQUFmLENBQUo7TUFDSSxlQUFlLENBQUMsU0FBaEIsR0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUR4Qzs7SUFHQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxTQUFmLENBQUo7TUFDSSxlQUFlLENBQUMsU0FBaEIsR0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUR4Qzs7SUFHQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxPQUFmLENBQUo7TUFDSSxlQUFlLENBQUMsT0FBaEIsR0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUR0Qzs7SUFHQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxhQUFmLENBQUo7TUFDSSxlQUFlLENBQUMsYUFBaEIsR0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUQ1Qzs7SUFHQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxVQUFmLENBQUo7TUFDSSxlQUFlLENBQUMsVUFBaEIsR0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUR6Qzs7SUFHQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxXQUFmLENBQUo7TUFDSSxlQUFlLENBQUMsV0FBaEIsR0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUQxQzs7SUFHQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxXQUFmLENBQUo7TUFDSSxlQUFlLENBQUMsV0FBaEIsR0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUQxQzs7SUFHQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxnQkFBZixDQUFKO01BQ0ksZUFBZSxDQUFDLGdCQUFoQixHQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUQvQzs7SUFHQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxpQkFBZixDQUFKO01BQ0ksZUFBZSxDQUFDLGlCQUFoQixHQUFvQyxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQURoRDs7SUFHQSxhQUFhLENBQUMsWUFBWSxDQUFDLGFBQTNCLHNEQUF3RTtJQUN4RSxhQUFhLENBQUMsWUFBWSxDQUFDLFdBQTNCLHlEQUF1RSxhQUFhLENBQUMsWUFBWSxDQUFDO0lBQ2xHLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBM0IseURBQW1FLGFBQWEsQ0FBQyxZQUFZLENBQUM7SUFFOUYsUUFBQSxHQUFjLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxJQUFmLENBQUosR0FBOEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBbkMsQ0FBOUIsR0FBNEUsYUFBYSxDQUFDLElBQUksQ0FBQztJQUMxRyxRQUFBLEdBQWMsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLElBQWYsQ0FBSixHQUE4QixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFuQyxDQUE5QixHQUE0RSxhQUFhLENBQUMsSUFBSSxDQUFDO0lBQzFHLElBQUEsR0FBTyxhQUFhLENBQUM7SUFFckIsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsSUFBZixDQUFELElBQXlCLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxJQUFmLENBQTdCO01BQ0ksYUFBYSxDQUFDLElBQWQsR0FBeUIsSUFBQSxJQUFBLENBQUssUUFBTCxFQUFlLFFBQWYsRUFEN0I7O0lBR0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsSUFBZixDQUFKO01BQ0ksYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFuQixHQUEwQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBRHRDOztJQUVBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSjtNQUNJLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBbkIsR0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUR4Qzs7SUFFQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxTQUFmLENBQUo7TUFDSSxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQW5CLEdBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFEM0M7O0lBRUEsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsU0FBZixDQUFKO01BQ0ksYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFuQixHQUErQixJQUFDLENBQUEsTUFBTSxDQUFDLFVBRDNDOztJQUVBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGFBQWYsQ0FBSjtNQUNJLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBbkIsR0FBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUQvQzs7SUFFQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxLQUFmLENBQUo7TUFDSSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQW5CLEdBQStCLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBZCxFQURuQzs7SUFHQSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQW5CLEdBQThCLHFCQUFBLElBQWlCLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxLQUFmLENBQXJCLEdBQW9ELElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBZCxDQUFwRCxHQUE4RSxJQUFJLENBQUM7SUFDOUcsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFuQixHQUErQix1QkFBQSxJQUFtQixDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsT0FBZixDQUF2QixHQUFvRCxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQTVELEdBQXlFLElBQUksQ0FBQztJQUMxRyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQW5CLEdBQW9DLDRCQUFBLElBQXdCLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxZQUFmLENBQTVCLEdBQWtFLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBZCxDQUFsRSxHQUF1RyxJQUFBLEtBQUEsQ0FBTSxJQUFJLENBQUMsV0FBWDtJQUN4SSxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQW5CLEdBQW1DLDJCQUFBLElBQXVCLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxXQUFmLENBQTNCLHFEQUFtRixDQUFuRixHQUEyRixJQUFJLENBQUM7SUFDaEksYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFuQixHQUErQixzQkFBQSxJQUFrQixDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUF0QixHQUFpRCxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQXpELEdBQXFFLElBQUksQ0FBQztJQUN0RyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQW5CLEdBQW9DLDJCQUFBLElBQXVCLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxXQUFmLENBQTNCLEdBQWdFLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBZCxDQUFoRSxHQUFvRyxJQUFBLEtBQUEsQ0FBTSxJQUFJLENBQUMsV0FBWDtJQUNySSxhQUFhLENBQUMsSUFBSSxDQUFDLGFBQW5CLEdBQXNDLDZCQUFBLElBQXlCLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxhQUFmLENBQTdCLHVEQUF5RixDQUF6RixHQUFpRyxJQUFJLENBQUM7SUFDekksYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFuQixHQUFzQyw2QkFBQSxJQUF5QixDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsYUFBZixDQUE3Qix1REFBeUYsQ0FBekYsR0FBaUcsSUFBSSxDQUFDO0lBRXpJLElBQUcsUUFBQSxDQUFTLEtBQUssQ0FBQyxJQUFmLENBQUg7TUFBNkIsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFuQixHQUEwQixJQUFJLENBQUMsS0FBNUQ7O0lBQ0EsSUFBRyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSDtNQUErQixhQUFhLENBQUMsSUFBSSxDQUFDLE1BQW5CLEdBQTRCLElBQUksQ0FBQyxPQUFoRTs7SUFDQSxJQUFHLFFBQUEsQ0FBUyxLQUFLLENBQUMsU0FBZixDQUFIO2FBQWtDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBbkIsR0FBK0IsSUFBSSxDQUFDLFVBQXRFOztFQXRFb0I7OztBQXdFeEI7Ozs7O3lDQUlBLHdCQUFBLEdBQTBCLFNBQUE7QUFDdEIsUUFBQTtJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyx1QkFBZixDQUF1QyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQS9DO0lBQ0EsSUFBRyxDQUFDLEtBQUssQ0FBQyxZQUFhLENBQUEsTUFBQSxDQUF2QjtNQUNJLFdBQUEsR0FBa0IsSUFBQSxFQUFFLENBQUMsa0JBQUgsQ0FBQTtNQUNsQixXQUFXLENBQUMsTUFBWixHQUFxQixFQUFFLENBQUMsU0FBUyxDQUFDLDJCQUFiLENBQXlDO1FBQUEsSUFBQSxFQUFNLHNCQUFOO1FBQThCLEVBQUEsRUFBSSxvQkFBQSxHQUFxQixNQUF2RDtRQUErRCxNQUFBLEVBQVE7VUFBRSxFQUFBLEVBQUksb0JBQUEsR0FBcUIsTUFBM0I7U0FBdkU7T0FBekMsRUFBcUosV0FBcko7TUFDckIsV0FBVyxDQUFDLE9BQVosR0FBc0IsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBekIsQ0FBb0Msb0JBQUEsR0FBcUIsTUFBckIsR0FBNEIsVUFBaEU7TUFDdEIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFwQixHQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDO01BQ3JDLFdBQVcsQ0FBQyxTQUFaLENBQXNCLFdBQVcsQ0FBQyxNQUFsQztNQUNBLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQTNCLEdBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDO01BQzNDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQTNCLEdBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDO01BQzNDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQTNCLEdBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztNQUNwRCxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUEzQixHQUFvQyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7TUFDckQsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFuQixHQUFpQzthQUNqQyxLQUFLLENBQUMsWUFBYSxDQUFBLE1BQUEsQ0FBbkIsR0FBNkIsWUFYakM7O0VBSnNCOzs7QUFpQjFCOzs7Ozt5Q0FJQSx1QkFBQSxHQUF5QixTQUFBO0FBQ3JCLFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsdUJBQWYsQ0FBdUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUEvQztJQUNBLElBQUEsR0FBTyxLQUFLLENBQUMsWUFBYSxDQUFBLE1BQUE7O01BQzFCLElBQUksQ0FBRSxNQUFNLENBQUMsT0FBYixDQUFBOztXQUNBLEtBQUssQ0FBQyxZQUFhLENBQUEsTUFBQSxDQUFuQixHQUE2QjtFQU5SOzs7QUFRekI7Ozs7O3lDQUlBLHVCQUFBLEdBQXlCLFNBQUE7QUFDckIsUUFBQTtJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBQTs7TUFDVixPQUFPLENBQUUsWUFBWSxDQUFDLFNBQXRCLEdBQWtDOzs7TUFDbEMsT0FBTyxDQUFFLFFBQVEsQ0FBQyxTQUFsQixHQUE4Qjs7SUFFOUIsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLHVCQUFmLENBQXVDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBL0M7SUFDQSxNQUFBLEdBQVM7TUFBRSxJQUFBLEVBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFoQjtNQUFzQixFQUFBLEVBQUksSUFBMUI7O0FBRVQsWUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQWY7QUFBQSxXQUNTLENBRFQ7UUFFUSxNQUFNLENBQUMsRUFBUCxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUM7QUFEbkI7QUFEVCxXQUdTLENBSFQ7UUFJUSxNQUFNLENBQUMsRUFBUCxHQUFZLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0FBSnBCO0lBTUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQTlCLEdBQXVDO0lBRXZDLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFYOztXQUNnQyxDQUFFLFFBQVEsQ0FBQyxLQUF2QyxDQUFBO09BREo7O21FQUU0QixDQUFFLE9BQTlCLEdBQXdDO0VBbkJuQjs7O0FBcUJ6Qjs7Ozs7eUNBSUEsd0JBQUEsR0FBMEIsU0FBQTtBQUN0QixRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVg7TUFDSSxPQUFBLEdBQVUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBekIsQ0FBb0MsWUFBcEM7TUFDVixJQUFPLGVBQVA7UUFBcUIsT0FBQSxHQUFVLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQXpCLENBQW9DLFNBQXBDLEVBQS9COztNQUVBLElBQUcsZUFBSDtRQUNJLE9BQU8sQ0FBQyxPQUFSLENBQUEsRUFESjs7TUFHQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVg7ZUFDSSxPQUFBLEdBQVUsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsYUFBNUIsQ0FBMEMsSUFBMUMsRUFBZ0Q7VUFBRSxVQUFBLEVBQVksc0JBQWQ7U0FBaEQsRUFEZDtPQUFBLE1BQUE7ZUFHSSxPQUFBLEdBQVUsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsYUFBNUIsQ0FBMEMsSUFBMUMsRUFBZ0Q7VUFBRSxVQUFBLEVBQVksbUJBQWQ7U0FBaEQsRUFIZDtPQVBKO0tBQUEsTUFBQTtNQVlJLE9BQUEsR0FBVSxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUF6QixDQUFvQyxZQUFwQztNQUNWLElBQU8sZUFBUDtRQUFxQixPQUFBLEdBQVUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBekIsQ0FBb0MsU0FBcEMsRUFBL0I7O01BQ0EsSUFBTyxlQUFQO1FBQXFCLE9BQUEsR0FBVSxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUF6QixDQUFvQyxtQkFBcEMsRUFBL0I7OytCQUVBLE9BQU8sQ0FBRSxPQUFULENBQUEsV0FoQko7O0VBRHNCOzs7QUFtQjFCOzs7Ozt5Q0FJQSx3QkFBQSxHQUEwQixTQUFBO0FBQ3RCLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFFaEMsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBO0lBQ1YsSUFBTyxpQkFBSixJQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsS0FBbUIsT0FBTyxDQUFDLE9BQTlDO0FBQTJELGFBQTNEOztJQUVBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFYO01BQ0ksUUFBQSxHQUFjLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxRQUFmLENBQUosR0FBa0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckMsQ0FBbEMsR0FBc0YsUUFBUSxDQUFDO01BQzFHLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsYUFBQSxDQUFmLENBQUosR0FBd0MsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBOUIsQ0FBeEMsR0FBbUYsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLFFBQVEsQ0FBQyxZQUEvQjtNQUM1RixTQUFBLEdBQWUsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGdCQUFBLENBQWYsQ0FBSixHQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5ELEdBQWtFLFFBQVEsQ0FBQztNQUN2RixPQUFPLENBQUMsUUFBUSxDQUFDLE1BQWpCLENBQXdCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBeEMsRUFBMkMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUEzRCxFQUE4RCxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQXRFLEVBQWlGLE1BQWpGLEVBQXlGLFFBQXpGLEVBSko7S0FBQSxNQUFBO01BTUksUUFBQSxHQUFjLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxRQUFmLENBQUosR0FBa0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckMsQ0FBbEMsR0FBc0YsUUFBUSxDQUFDO01BQzFHLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsYUFBQSxDQUFmLENBQUosR0FBd0MsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBOUIsQ0FBeEMsR0FBbUYsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLFFBQVEsQ0FBQyxlQUEvQjtNQUM1RixTQUFBLEdBQWUsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGdCQUFBLENBQWYsQ0FBSixHQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5ELEdBQWtFLFFBQVEsQ0FBQztNQUN2RixPQUFPLENBQUMsUUFBUSxDQUFDLFNBQWpCLENBQTJCLFNBQTNCLEVBQXNDLE1BQXRDLEVBQThDLFFBQTlDLEVBQXdELFNBQUE7ZUFBRyxPQUFPLENBQUMsT0FBUixHQUFrQjtNQUFyQixDQUF4RCxFQVRKOztJQVVBLE9BQU8sQ0FBQyxNQUFSLENBQUE7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsSUFBOEIsQ0FBSSxDQUFDLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBLENBQWxCLENBQXJDO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixTQUYvQjs7V0FHQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUF2QnNCOzs7QUF3QjFCOzs7Ozt5Q0FJQSwyQkFBQSxHQUE2QixTQUFBO0FBQ3pCLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsVUFBQSxHQUFhLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFBbkMsQ0FBOUI7SUFDYixPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLEtBQW1CO0lBQzdCLElBQU8sb0JBQUosSUFBbUIsT0FBQSxLQUFXLFVBQVUsQ0FBQyxPQUE1QztBQUF5RCxhQUF6RDs7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBWDtNQUNJLFFBQUEsR0FBYyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsUUFBZixDQUFKLEdBQWtDLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDLENBQWxDLEdBQXNGLFFBQVEsQ0FBQztNQUMxRyxNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGFBQUEsQ0FBZixDQUFKLEdBQXdDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQTlCLENBQXhDLEdBQW1GLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixRQUFRLENBQUMsWUFBL0I7TUFDNUYsU0FBQSxHQUFlLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxnQkFBQSxDQUFmLENBQUosR0FBMkMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFuRCxHQUFrRSxRQUFRLENBQUM7TUFDdkYsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFwQixDQUEyQixVQUFVLENBQUMsT0FBTyxDQUFDLENBQTlDLEVBQWlELFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBcEUsRUFBdUUsU0FBdkUsRUFBa0YsTUFBbEYsRUFBMEYsUUFBMUYsRUFKSjtLQUFBLE1BQUE7TUFNSSxRQUFBLEdBQWMsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFFBQWYsQ0FBSixHQUFrQyxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFyQyxDQUFsQyxHQUFzRixRQUFRLENBQUM7TUFDMUcsTUFBQSxHQUFZLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxhQUFBLENBQWYsQ0FBSixHQUF3QyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUE5QixDQUF4QyxHQUFtRixFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsUUFBUSxDQUFDLGVBQS9CO01BQzVGLFNBQUEsR0FBZSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsZ0JBQUEsQ0FBZixDQUFKLEdBQTJDLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbkQsR0FBa0UsUUFBUSxDQUFDO01BQ3ZGLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBcEIsQ0FBOEIsU0FBOUIsRUFBeUMsTUFBekMsRUFBaUQsUUFBakQsRUFBMkQsU0FBQTtlQUFHLFVBQVUsQ0FBQyxPQUFYLEdBQXFCO01BQXhCLENBQTNELEVBVEo7O0lBVUEsVUFBVSxDQUFDLE1BQVgsQ0FBQTtJQUVBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixJQUE4QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUEsQ0FBbEIsQ0FBckM7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7TUFDekIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLEdBQTJCLFNBRi9COztXQUdBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQXZCeUI7OztBQXlCN0I7Ozs7O3lDQUlBLGVBQUEsR0FBaUIsU0FBQTtBQUNiLFFBQUE7SUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFFaEMsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsV0FBZixDQUFKO01BQ0ksV0FBVyxDQUFDLFlBQVksQ0FBQyxVQUF6QixHQUFzQyxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQyxFQUQxQzs7SUFFQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxRQUFmLENBQUo7TUFDSSxXQUFXLENBQUMsWUFBWSxDQUFDLGNBQXpCLEdBQTBDLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXBDLEVBRDlDOztJQUVBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFFBQWYsQ0FBSjtNQUNJLFdBQVcsQ0FBQyxZQUFZLENBQUMsY0FBekIsR0FBMEMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBcEMsRUFEOUM7O0lBRUEsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsT0FBZixDQUFKO2FBQ0ksV0FBVyxDQUFDLFlBQVksQ0FBQyxhQUF6QixHQUF5QyxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFwQyxFQUQ3Qzs7RUFWYTs7O0FBYWpCOzs7Ozt5Q0FJQSxlQUFBLEdBQWlCLFNBQUE7QUFDYixRQUFBO0lBQUEsRUFBQSxHQUFLLGFBQWEsQ0FBQyxTQUFVLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBbkMsQ0FBQTtJQUU3QixJQUFHLFVBQUg7TUFDSSxXQUFXLENBQUMsVUFBVSxDQUFDLFNBQVUsQ0FBQSxFQUFFLENBQUMsS0FBSCxDQUFqQyxHQUE2QztRQUFFLFFBQUEsRUFBVSxJQUFaOzthQUM3QyxXQUFXLENBQUMsY0FBWixDQUFBLEVBRko7O0VBSGE7OztBQU9qQjs7Ozs7eUNBSUEsc0JBQUEsR0FBd0IsU0FBQTtBQUFHLFFBQUE7eURBQXdCLENBQUUsZUFBMUIsQ0FBMEMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBbkMsQ0FBMUM7RUFBSDs7O0FBRXhCOzs7Ozt5Q0FJQSxjQUFBLEdBQWdCLFNBQUE7QUFDWixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixTQUFBLEdBQVksS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFqQixDQUF1QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxDQUFDLFFBQUgsSUFBZ0IsQ0FBQyxDQUFDLEdBQUYsS0FBUyxLQUFDLENBQUEsTUFBTSxDQUFDO01BQXhDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQUNaLElBQUcsQ0FBQyxDQUFDLFNBQUEsWUFBcUIsRUFBRSxDQUFDLHNCQUF6QixDQUFKO0FBQTBELGFBQTFEOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixTQUF4QixFQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQTNDLEVBQXFELElBQUMsQ0FBQSxNQUF0RDtXQUNBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQU5ZOzs7QUFRaEI7Ozs7O3lDQUlBLHFCQUFBLEdBQXVCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsU0FBQSxHQUFZLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBakIsQ0FBdUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsQ0FBQyxRQUFILElBQWdCLENBQUMsQ0FBQyxHQUFGLEtBQVMsS0FBQyxDQUFBLE1BQU0sQ0FBQztNQUF4QztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7SUFDWixJQUFHLENBQUMsQ0FBQyxTQUFBLFlBQXFCLEVBQUUsQ0FBQyxzQkFBekIsQ0FBSjtBQUEwRCxhQUExRDs7SUFFQSxTQUFTLENBQUMsV0FBVixHQUF3QjtNQUFFLElBQUEsRUFBTSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFyQjtNQUFrQyxJQUFBLEVBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFoRDtNQUFzRCxRQUFBLEVBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUF4RTs7SUFDeEIsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLElBQThCLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUE3QztNQUNJLE9BQUEsR0FBVSxTQUFTLENBQUMsS0FBSyxDQUFDLGNBQWUsQ0FBQSxTQUFTLENBQUMsV0FBVyxDQUFDLElBQXRCO01BQ3pDLElBQUcsZUFBSDtRQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtRQUN6QixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFDLENBQUQ7aUJBQU8sQ0FBQyxDQUFDLGVBQUYsQ0FBQSxDQUFBLEdBQXNCO1FBQTdCLENBQVosRUFGL0I7T0FGSjs7V0FLQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFYbUI7OztBQWF2Qjs7Ozs7eUNBSUEsZ0JBQUEsR0FBa0IsU0FBQTtBQUNkLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixTQUFBLEdBQVksS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFqQixDQUF1QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxDQUFDLFFBQUgsSUFBZ0IsQ0FBQyxDQUFDLEdBQUYsS0FBUyxLQUFDLENBQUEsTUFBTSxDQUFDO01BQXhDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQUNaLElBQUcsQ0FBQyxDQUFDLFNBQUEsWUFBcUIsRUFBRSxDQUFDLHNCQUF6QixDQUFKO0FBQTBELGFBQTFEOztJQUNBLFVBQUEsR0FBZ0IsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFVBQWYsQ0FBSixHQUFvQyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQTVDLEdBQTREO0lBRXpFLFNBQVMsQ0FBQyxNQUFWLEdBQW1CO01BQUUsSUFBQSxFQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQXJCO01BQTZCLFVBQUEsRUFBWSxVQUF6QztNQUFxRCxJQUFBLEVBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFuRTs7SUFDbkIsU0FBUyxDQUFDLFdBQVYsR0FBd0I7SUFFeEIsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLElBQThCLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUE3QztNQUNJLE1BQUEsR0FBUyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQWpCO01BQ2pDLElBQUcsY0FBSDtRQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtRQUN6QixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkIsTUFBTSxDQUFDLGVBQVAsQ0FBQSxDQUFBLEdBQTJCLEtBRjFEO09BRko7O1dBS0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBakJjOzs7QUFtQmxCOzs7Ozt5Q0FJQSxvQkFBQSxHQUFzQixTQUFBO0FBQ2xCLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixTQUFBLEdBQVksS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFqQixDQUF1QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxDQUFDLFFBQUgsSUFBZ0IsQ0FBQyxDQUFDLEdBQUYsS0FBUyxLQUFDLENBQUEsTUFBTSxDQUFDO01BQXhDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQUNaLElBQUcsQ0FBQyxDQUFDLFNBQUEsWUFBcUIsRUFBRSxDQUFDLHNCQUF6QixDQUFKO0FBQTBELGFBQTFEOztJQUNBLFVBQUEsR0FBZ0IsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFVBQWYsQ0FBSixHQUFvQyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQTVDLEdBQTRELFFBQVEsQ0FBQztJQUVsRixTQUFTLENBQUMsVUFBVixHQUF1QjtNQUFFLElBQUEsRUFBTSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFyQjtNQUFpQyxVQUFBLEVBQVksVUFBN0M7O1dBQ3ZCLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVZrQjs7O0FBWXRCOzs7Ozt5Q0FJQSxtQkFBQSxHQUFxQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxJQUFDLENBQUEsV0FBVyxDQUFDLHlCQUF5QixDQUFDLElBQXZDLENBQTRDLElBQTVDLEVBQWtELFFBQWxEO1dBQ0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBSGlCOzs7QUFLckI7Ozs7O3lDQUlBLGtCQUFBLEdBQW9CLFNBQUE7QUFDaEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsSUFBc0I7SUFDOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUVoQyxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFNBQUEsR0FBWSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWpCLENBQXVCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLENBQUMsUUFBSCxJQUFnQixDQUFDLENBQUMsR0FBRixLQUFTLEtBQUMsQ0FBQSxNQUFNLENBQUM7TUFBeEM7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO0lBQ1osSUFBRyxzQkFBSSxTQUFTLENBQUUsTUFBTSxDQUFDLG1CQUF6QjtBQUF3QyxhQUF4Qzs7SUFHQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxrQkFBZixDQUFKO01BQ0ksU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQTNCLEdBQWdELElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFuQyxFQURwRDs7SUFFQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxhQUFmLENBQUo7TUFDSSxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUEzQixHQUEyQyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFuQyxFQUQvQzs7SUFFQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxlQUFmLENBQUo7TUFDSSxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUEzQixHQUE2QyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFuQyxFQURqRDs7SUFJQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxrQkFBQSxDQUFmLENBQUo7TUFDSSxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxrQkFBM0IsQ0FBOEMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBL0QsRUFESjs7SUFFQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxtQkFBQSxDQUFmLENBQUo7TUFDSSxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxtQkFBM0IsQ0FBK0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQTVDLENBQS9DLEVBREo7O0lBRUEsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsMkJBQUEsQ0FBZixDQUFKO01BQ0ksU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsMkJBQTNCLENBQXVELElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBNUMsQ0FBdkQsRUFESjs7SUFFQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSw0QkFBQSxDQUFmLENBQUo7TUFDSSxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyw0QkFBM0IsQ0FBd0QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUE1QyxDQUF4RCxFQURKOztJQUVBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLDRCQUFBLENBQWYsQ0FBSjtNQUNJLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLDRCQUEzQixDQUF3RCxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUJBQTVDLENBQXhELEVBREo7O1dBR0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBNUJnQjs7O0FBNkJwQjs7Ozs7eUNBSUEsbUJBQUEsR0FBcUIsU0FBQTtBQUNqQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixTQUFBLEdBQVksS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFqQixDQUF1QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxDQUFDLFFBQUgsSUFBZ0IsQ0FBQyxDQUFDLEdBQUYsS0FBUyxLQUFDLENBQUEsTUFBTSxDQUFDO01BQXhDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQUNaLElBQUcsQ0FBQyxDQUFDLFNBQUEsWUFBcUIsRUFBRSxDQUFDLHNCQUF6QixDQUFELElBQXNELG1CQUF6RDtBQUF5RSxhQUF6RTs7SUFFQSxNQUFBLEdBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBOUI7SUFDVCxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckM7SUFDWCxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQW5CLENBQWtDLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUF6QyxDQUFsQyxFQUFrRixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBekMsQ0FBbEYsRUFBbUksUUFBbkksRUFBNkksTUFBN0k7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsSUFBOEIsQ0FBSSxDQUFDLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBLENBQWxCLENBQXJDO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixTQUYvQjs7V0FHQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFaaUI7OztBQWFyQjs7Ozs7eUNBSUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsUUFBQSxHQUFXLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDaEMsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBRWhDLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGNBQWYsQ0FBSjtNQUF3QyxRQUFRLENBQUMsY0FBVCxHQUEwQixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFyQyxFQUFsRTs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxpQkFBZixDQUFKO01BQTJDLFFBQVEsQ0FBQyxpQkFBVCxHQUE2QixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBckMsRUFBeEU7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKO01BQWdDLFFBQVEsQ0FBQyxNQUFULEdBQWtCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DLEVBQWxEOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGdCQUFmLENBQUo7TUFBMEMsUUFBUSxDQUFDLGdCQUFULEdBQTRCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFuQyxFQUF0RTs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxtQkFBQSxDQUFmLENBQUo7TUFBOEMsUUFBUSxDQUFDLFlBQVQsR0FBd0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUE5RTs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxzQkFBQSxDQUFmLENBQUo7TUFBaUQsUUFBUSxDQUFDLGVBQVQsR0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBcEY7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsc0JBQUEsQ0FBZixDQUFKO01BQWlELFFBQVEsQ0FBQyxlQUFULEdBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQXBGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLHlCQUFBLENBQWYsQ0FBSjtNQUFvRCxRQUFRLENBQUMsa0JBQVQsR0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBMUY7O1dBRUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBZGdCOzs7QUFlcEI7Ozs7O3lDQUlBLG1CQUFBLEdBQXFCLFNBQUE7QUFDakIsUUFBQTtJQUFBLFFBQUEsR0FBVyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ2hDLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsSUFBc0I7SUFDOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUNoQyxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLE1BQUEsR0FBUyxhQUFhLENBQUMsVUFBVyxDQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DLENBQUE7SUFDbEMsSUFBVSxDQUFDLE1BQUQsSUFBVyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWpCLENBQXVCLFNBQUMsQ0FBRDthQUFPLENBQUMsQ0FBQyxDQUFDLFFBQUgsSUFBZ0IsQ0FBQyxDQUFDLEdBQUYsS0FBUyxNQUFNLENBQUM7SUFBdkMsQ0FBdkIsQ0FBckI7QUFBQSxhQUFBOztJQUVBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLEtBQXdCLENBQTNCO01BQ0ksQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDO01BQ3JCLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUZ6QjtLQUFBLE1BR0ssSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsS0FBd0IsQ0FBM0I7TUFDRCxDQUFBLEdBQUksSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQTVDO01BQ0osQ0FBQSxHQUFJLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUE1QyxFQUZIOztJQUlMLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsYUFBQSxDQUFmLENBQUosR0FBd0MsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUExQyxDQUF0QixFQUF1RSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUF0RixDQUF4QyxHQUEwSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsUUFBUSxDQUFDLFlBQS9CO0lBQ25KLFFBQUEsR0FBYyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsUUFBZixDQUFKLEdBQWtDLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDLENBQWxDLEdBQXNGLFFBQVEsQ0FBQztJQUMxRyxNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSixHQUFnQyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFoQyxHQUFnRixRQUFRLENBQUM7SUFDbEcsU0FBQSxHQUFlLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxnQkFBQSxDQUFmLENBQUosR0FBMkMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFuRCxHQUFrRSxRQUFRLENBQUM7SUFDdkYsVUFBQSxHQUFnQixDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsb0JBQUEsQ0FBZixDQUFKLEdBQStDLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBdkQsR0FBdUUsUUFBUSxDQUFDO0lBQzdGLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKLEdBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBeEMsR0FBb0QsUUFBUSxDQUFDO0lBQ3RFLE9BQUEsR0FBVSxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBQTtJQUMzQixNQUFBLEdBQVMsUUFBQSxLQUFZLENBQVosSUFBaUIsV0FBVyxDQUFDLFlBQVksQ0FBQztJQUVuRCxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsSUFBOEIsQ0FBSSxPQUFyQztNQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtNQUN6QixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkIsU0FGL0I7O0lBSUEsSUFBQSx5Q0FBMkIsQ0FBRSxjQUE3QjtBQUFBLGFBQUE7O0lBQ0EsU0FBQSxHQUFnQixJQUFBLEVBQUUsQ0FBQyxzQkFBSCxDQUEwQixNQUExQjtJQUNoQixTQUFTLENBQUMsU0FBViw2Q0FBbUMsQ0FBRSxjQUFmLElBQXVCO0lBQzdDLFNBQVMsQ0FBQyxXQUFWLDZDQUFxQyxDQUFFLG9CQUFmLElBQTZCO0lBQ3JELFNBQVMsQ0FBQyxLQUFWLEdBQWtCLGVBQWUsQ0FBQyxjQUFoQixDQUFpQyxpREFBeUIsUUFBekIsQ0FBQSxHQUFrQyxHQUFsQyxHQUFxQyxTQUFTLENBQUMsU0FBaEY7SUFDbEIsSUFBOEQsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUE5RTtNQUFBLFNBQVMsQ0FBQyxNQUFWLEdBQW1CO1FBQUUsSUFBQSxFQUFNLEVBQVI7UUFBWSxVQUFBLEVBQVksQ0FBeEI7UUFBMkIsSUFBQSxFQUFNLElBQWpDO1FBQW5COztJQUVBLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBbEIsR0FBc0I7SUFDdEIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFsQixHQUFzQjtJQUN0QixTQUFTLENBQUMsTUFBTSxDQUFDLENBQWpCLEdBQXdCLENBQUMsTUFBSixHQUFnQixDQUFoQixHQUF1QjtJQUM1QyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQWpCLEdBQXdCLENBQUMsTUFBSixHQUFnQixDQUFoQixHQUF1QjtJQUM1QyxTQUFTLENBQUMsU0FBVixHQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFuQztJQUN0QixTQUFTLENBQUMsSUFBSSxDQUFDLENBQWYsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQ3pDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBZixHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDekMsU0FBUyxDQUFDLE1BQVYsR0FBbUIsTUFBQSxJQUFVOztVQUNkLENBQUUsS0FBakIsQ0FBQTs7SUFDQSxTQUFTLENBQUMsS0FBVixDQUFBO0lBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBM0Isa0RBQWtFO0lBQ2xFLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQTNCLG9EQUFzRTtJQUN0RSxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxrQkFBM0IsdURBQTRFO0lBRTVFLFNBQVMsQ0FBQyxNQUFWLENBQUE7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixLQUF3QixDQUEzQjtNQUNJLENBQUEsR0FBSSxJQUFDLENBQUEsV0FBVyxDQUFDLHdCQUFiLENBQXNDLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQTlDLEVBQW9FLFNBQXBFLEVBQStFLElBQUMsQ0FBQSxNQUFoRjtNQUNKLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBbEIsR0FBc0IsQ0FBQyxDQUFDO01BQ3hCLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBbEIsR0FBc0IsQ0FBQyxDQUFDLEVBSDVCOztJQUtBLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBZixDQUE0QixTQUE1QixFQUF1QyxNQUF2QyxFQUErQztNQUFFLFNBQUEsRUFBVyxTQUFiO01BQXdCLFFBQUEsRUFBVSxRQUFsQztNQUE0QyxNQUFBLEVBQVEsTUFBcEQ7TUFBNEQsVUFBQSxFQUFZLFVBQXhFO0tBQS9DO0lBRUEsaURBQW1CLENBQUUsY0FBbEIsS0FBMEIsSUFBN0I7TUFDSSxTQUFTLENBQUMsUUFBVixHQUFxQixRQUFRLENBQUMsU0FEbEM7O1dBR0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBN0RpQjs7O0FBOERyQjs7Ozs7eUNBSUEseUJBQUEsR0FBMkIsU0FBQTtBQUN2QixRQUFBO0lBQUEsUUFBQSxHQUFXLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDaEMsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsV0FBQSxHQUFjLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO0lBQ2QsWUFBQSxHQUFlLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQW5DLENBQUEsSUFBb0QsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUMzRSxNQUFBLEdBQVMsYUFBYSxDQUFDLFVBQVcsQ0FBQSxXQUFBO0lBRWxDLElBQVUsQ0FBQyxNQUFELElBQVcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFqQixDQUF1QixTQUFDLENBQUQ7YUFBTyxDQUFDLENBQUMsQ0FBQyxRQUFILElBQWdCLENBQUMsQ0FBQyxHQUFGLEtBQVMsTUFBTSxDQUFDLEtBQWhDLElBQTBDLENBQUMsQ0FBQyxDQUFDO0lBQXBELENBQXZCLENBQXJCO0FBQUEsYUFBQTs7SUFFQSxTQUFBLEdBQWdCLElBQUEsRUFBRSxDQUFDLGdCQUFILENBQW9CLE1BQXBCLEVBQTRCLElBQTVCLEVBQWtDLEtBQWxDO0lBQ2hCLFNBQVMsQ0FBQyxVQUFWLEdBQXVCLGFBQWEsQ0FBQyxvQkFBcUIseUJBQUEsZUFBZSxNQUFNLENBQUMsb0JBQXRCLElBQTJDLENBQTNDO0lBQzFELDhFQUFnQyxDQUFFLFFBQVEsQ0FBQyxzQkFBM0M7TUFDSSxNQUFBLEdBQVMsZUFBZSxDQUFDLFNBQWhCLENBQTBCLGVBQWUsQ0FBQyxPQUFoQixDQUF3QixTQUFTLENBQUMsVUFBVSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFyRCxDQUExQjtNQUNULFNBQVMsQ0FBQyxXQUFWLEdBQXdCLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVEsQ0FBQyxXQUZsRTs7SUFHQSxNQUFBLEdBQVM7SUFDVCxLQUFBLEdBQVE7SUFDUixJQUFBLEdBQU87SUFFUCxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixLQUF3QixDQUEzQjtNQUNJLENBQUEsR0FBSSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBNUM7TUFDSixDQUFBLEdBQUksSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQTVDO01BQ0osTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDO01BQzFCLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFqQixJQUF3QjtNQUNoQyxJQUFBLHFEQUE0QixDQUFFLGNBQXZCLElBQStCLEVBTDFDO0tBQUEsTUFNSyxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixLQUF3QixDQUEzQjtNQUNELENBQUEsR0FBSSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBNUM7TUFDSixDQUFBLEdBQUksSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQTVDO01BQ0osTUFBQSxHQUFTO01BQ1QsS0FBQSxHQUFRO01BQ1IsSUFBQSxHQUFPLEVBTE47O0lBT0wsTUFBQSxHQUFZLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxhQUFBLENBQWYsQ0FBSixHQUF3QyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQTFDLENBQXRCLEVBQXVFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQXRGLENBQXhDLEdBQTBJLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixRQUFRLENBQUMsWUFBL0I7SUFDbkosUUFBQSxHQUFjLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxRQUFmLENBQUosR0FBa0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckMsQ0FBbEMsR0FBc0YsUUFBUSxDQUFDO0lBQzFHLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKLEdBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBeEMsR0FBb0QsUUFBUSxDQUFDO0lBQ3RFLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKLEdBQWdDLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DLENBQWhDLEdBQWdGLFFBQVEsQ0FBQztJQUNsRyxTQUFBLEdBQWUsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGdCQUFBLENBQWYsQ0FBSixHQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5ELEdBQWtFLFFBQVEsQ0FBQztJQUN2RixVQUFBLEdBQWdCLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxvQkFBQSxDQUFmLENBQUosR0FBK0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUF2RCxHQUF1RSxRQUFRLENBQUM7SUFDN0YsT0FBQSxHQUFVLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBO0lBQzNCLE1BQUEsR0FBUyxRQUFBLEtBQVksQ0FBWixJQUFpQixXQUFXLENBQUMsWUFBWSxDQUFDO0lBRW5ELElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixJQUE4QixDQUFJLE9BQXJDO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixTQUYvQjs7SUFJQSxnRkFBZ0MsQ0FBRSxRQUFRLENBQUMsc0JBQTNDO01BQ0ksTUFBQSxHQUFTLGVBQWUsQ0FBQyxTQUFoQixDQUEwQixlQUFlLENBQUMsT0FBaEIsQ0FBd0IsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBckQsQ0FBMUI7TUFDVCxJQUFHLE1BQUEsS0FBVSxDQUFWLElBQWdCLGdCQUFuQjtRQUNJLENBQUEsSUFBSyxDQUFDLE1BQU0sQ0FBQyxLQUFQLEdBQWEsSUFBYixHQUFrQixNQUFNLENBQUMsS0FBMUIsQ0FBQSxHQUFpQztRQUN0QyxDQUFBLElBQUssQ0FBQyxNQUFNLENBQUMsTUFBUCxHQUFjLElBQWQsR0FBbUIsTUFBTSxDQUFDLE1BQTNCLENBQUEsR0FBbUMsRUFGNUM7T0FGSjs7SUFNQSxTQUFTLENBQUMsTUFBVixHQUFtQjtJQUNuQixTQUFTLENBQUMsTUFBTSxDQUFDLENBQWpCLEdBQXdCLENBQUMsTUFBSixHQUFnQixDQUFoQixHQUF1QjtJQUM1QyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQWpCLEdBQXdCLENBQUMsTUFBSixHQUFnQixDQUFoQixHQUF1QjtJQUM1QyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQWYsR0FBbUI7SUFDbkIsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFmLEdBQW1CO0lBQ25CLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBbEIsR0FBc0I7SUFDdEIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFsQixHQUFzQjtJQUN0QixTQUFTLENBQUMsTUFBVixHQUFtQixNQUFBLElBQVc7SUFDOUIsU0FBUyxDQUFDLFNBQVYsR0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbkM7SUFDdEIsU0FBUyxDQUFDLEtBQVYsR0FBa0I7SUFDbEIsU0FBUyxDQUFDLEtBQVYsQ0FBQTtJQUNBLFNBQVMsQ0FBQyxNQUFWLENBQUE7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixLQUF3QixDQUEzQjtNQUNJLENBQUEsR0FBSSxJQUFDLENBQUEsV0FBVyxDQUFDLHdCQUFiLENBQXNDLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQTlDLEVBQW9FLFNBQXBFLEVBQStFLElBQUMsQ0FBQSxNQUFoRjtNQUNKLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBbEIsR0FBc0IsQ0FBQyxDQUFDO01BQ3hCLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBbEIsR0FBc0IsQ0FBQyxDQUFDLEVBSDVCOztJQUtBLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBZixDQUE0QixTQUE1QixFQUF1QyxNQUF2QyxFQUErQztNQUFFLFNBQUEsRUFBVyxTQUFiO01BQXdCLFFBQUEsRUFBVSxRQUFsQztNQUE0QyxNQUFBLEVBQVEsTUFBcEQ7TUFBNEQsVUFBQSxFQUFZLFVBQXhFO0tBQS9DO0lBRUEsaURBQW1CLENBQUUsY0FBbEIsS0FBMEIsSUFBN0I7TUFDSSxTQUFTLENBQUMsUUFBVixHQUFxQixRQUFRLENBQUMsU0FEbEM7O1dBR0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBM0V1Qjs7O0FBNkUzQjs7Ozs7eUNBSUEseUJBQUEsR0FBMkIsU0FBQyxRQUFEO0FBQ3ZCLFFBQUE7SUFBQSxRQUFBLEdBQVcsUUFBQSxJQUFZLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDNUMsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztJQUVkLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsU0FBQSxHQUFZLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBakIsQ0FBdUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsQ0FBQyxRQUFILElBQWdCLENBQUMsQ0FBQyxHQUFGLEtBQVM7TUFBaEM7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO0lBRVosTUFBQSxHQUFZLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxhQUFBLENBQWYsQ0FBSixHQUF3QyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQTFDLENBQXRCLEVBQXVFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQXRGLENBQXhDLEdBQTBJLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixRQUFRLENBQUMsZUFBL0I7SUFDbkosUUFBQSxHQUFjLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxRQUFmLENBQUosR0FBa0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckMsQ0FBbEMsR0FBc0YsUUFBUSxDQUFDO0lBQzFHLFNBQUEsR0FBZSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsZ0JBQUEsQ0FBZixDQUFKLEdBQTJDLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbkQsR0FBa0UsUUFBUSxDQUFDO0lBQ3ZGLE9BQUEsR0FBVSxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBQTtJQUMzQixNQUFBLEdBQVMsUUFBQSxLQUFZLENBQVosSUFBaUIsV0FBVyxDQUFDLFlBQVksQ0FBQztJQUVuRCxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsSUFBOEIsQ0FBSSxPQUFyQztNQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtNQUN6QixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkIsU0FGL0I7O0lBSUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxlQUFmLENBQStCLFNBQS9CLEVBQTBDLE1BQTFDLEVBQWtEO01BQUUsU0FBQSxFQUFXLFNBQWI7TUFBd0IsUUFBQSxFQUFVLFFBQWxDO01BQTRDLE1BQUEsRUFBUSxNQUFwRDtLQUFsRDtXQUNBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQXBCdUI7OztBQXNCM0I7Ozs7O3lDQUlBLGdDQUFBLEdBQWtDLFNBQUE7QUFDOUIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsV0FBQSxHQUFjLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO0lBQ2QsU0FBQSxHQUFZLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBakIsQ0FBdUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsQ0FBQyxRQUFILElBQWdCLENBQUMsQ0FBQyxHQUFGLEtBQVM7TUFBaEM7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO0lBQ1osSUFBTyxpQkFBUDtBQUF1QixhQUF2Qjs7SUFDQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFFaEMsUUFBQSxHQUFjLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxRQUFmLENBQUosR0FBa0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckMsQ0FBbEMsR0FBc0YsUUFBUSxDQUFDO0lBQzFHLFVBQUEsR0FBYSxhQUFhLENBQUMsb0JBQXFCLENBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLElBQXdCLENBQXhCO0lBQ2hELE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsYUFBQSxDQUFmLENBQUosR0FBd0MsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBOUIsQ0FBeEMsR0FBbUYsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLFFBQVEsQ0FBQyxZQUEvQjtJQUM1RixTQUFBLEdBQWUsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGdCQUFBLENBQWYsQ0FBSixHQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5ELEdBQWtFLFFBQVEsQ0FBQztJQUV2RixTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFuQixDQUFvQyxVQUFwQyxFQUFnRCxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQXhELEVBQW1FLE1BQW5FLEVBQTJFLFFBQTNFO0lBRUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLElBQThCLENBQUksQ0FBQyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBQSxDQUFsQixDQUFyQztNQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtNQUN6QixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkIsU0FGL0I7O1dBSUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBcEI4Qjs7O0FBc0JsQzs7Ozs7eUNBSUEsNEJBQUEsR0FBOEIsU0FBQTtBQUMxQixRQUFBO0lBQUEsTUFBQSxHQUFTLFdBQVcsQ0FBQyxlQUFnQixDQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DLENBQUE7SUFDckMsSUFBTyxnQkFBSixJQUFtQiwyQkFBdEI7QUFBMEMsYUFBMUM7O0FBRUEsWUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQWY7QUFBQSxXQUNTLENBRFQ7QUFFUSxnQkFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFyQjtBQUFBLGVBQ1MsQ0FEVDttQkFFUSxNQUFPLENBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBZCxDQUFQLEdBQTZCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO0FBRnJDLGVBR1MsQ0FIVDttQkFJUSxNQUFPLENBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBZCxDQUFQLEdBQTZCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DLENBQUEsR0FBa0Q7QUFKdkYsZUFLUyxDQUxUO21CQU1RLE1BQU8sQ0FBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFkLENBQVAsR0FBNkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkMsQ0FBK0MsQ0FBQyxRQUFoRCxDQUFBO0FBTnJDO0FBREM7QUFEVCxXQVNTLENBVFQ7QUFVUSxnQkFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFyQjtBQUFBLGVBQ1MsQ0FEVDtZQUVRLEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQzttQkFDUixNQUFPLENBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBZCxDQUFQLEdBQWdDLEtBQUgsR0FBYyxDQUFkLEdBQXFCO0FBSDFELGVBSVMsQ0FKVDttQkFLUSxNQUFPLENBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBZCxDQUFQLEdBQTZCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBTHJDLGVBTVMsQ0FOVDtZQU9RLEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQzttQkFDUixNQUFPLENBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBZCxDQUFQLEdBQWdDLEtBQUgsR0FBYyxJQUFkLEdBQXdCO0FBUjdEO0FBREM7QUFUVCxXQW1CUyxDQW5CVDtBQW9CUSxnQkFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFyQjtBQUFBLGVBQ1MsQ0FEVDtZQUVRLEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFuQzttQkFDUixNQUFPLENBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBZCxDQUFQLEdBQTZCLEtBQUssQ0FBQztBQUgzQyxlQUlTLENBSlQ7bUJBS1EsTUFBTyxDQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQWQsQ0FBUCxHQUE2QixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFuQyxDQUFBLEtBQWlEO0FBTHRGLGVBTVMsQ0FOVDttQkFPUSxNQUFPLENBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBZCxDQUFQLEdBQTZCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5DO0FBUHJDO0FBcEJSO0VBSjBCOzs7QUFvQzlCOzs7Ozt5Q0FJQSw0QkFBQSxHQUE4QixTQUFBO0FBQzFCLFFBQUE7SUFBQSxNQUFBLEdBQVMsV0FBVyxDQUFDLGVBQWdCLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkMsQ0FBQTtJQUNyQyxJQUFPLGdCQUFKLElBQW1CLDJCQUF0QjtBQUEwQyxhQUExQzs7SUFFQSxLQUFBLEdBQVEsTUFBTyxDQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQWQ7QUFFZixZQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBZjtBQUFBLFdBQ1MsQ0FEVDtBQUVRLGdCQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQXJCO0FBQUEsZUFDUyxDQURUO21CQUVRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxLQUF0RDtBQUZSLGVBR1MsQ0FIVDttQkFJUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBeUQsS0FBSCxHQUFjLENBQWQsR0FBcUIsQ0FBM0U7QUFKUixlQUtTLENBTFQ7bUJBTVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXlELGFBQUgsR0FBZSxLQUFLLENBQUMsTUFBckIsR0FBaUMsQ0FBdkY7QUFOUjtBQURDO0FBRFQsV0FTUyxDQVRUO0FBVVEsZ0JBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBckI7QUFBQSxlQUNTLENBRFQ7bUJBRVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxpQkFBYixDQUErQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXZDLEVBQXVELEtBQUEsR0FBUSxDQUEvRDtBQUZSLGVBR1MsQ0FIVDttQkFJUSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBdUQsS0FBdkQ7QUFKUixlQUtTLENBTFQ7bUJBTVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxpQkFBYixDQUErQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXZDLEVBQXVELEtBQUEsS0FBUyxJQUFoRTtBQU5SO0FBREM7QUFUVCxXQWtCUyxDQWxCVDtBQW1CUSxnQkFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFyQjtBQUFBLGVBQ1MsQ0FEVDttQkFFUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBeUQsYUFBSCxHQUFlLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBZixHQUFxQyxFQUEzRjtBQUZSLGVBR1MsQ0FIVDttQkFJUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBeUQsS0FBSCxHQUFjLElBQWQsR0FBd0IsS0FBOUU7QUFKUixlQUtTLENBTFQ7bUJBTVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELEtBQXREO0FBTlI7QUFuQlI7RUFOMEI7OztBQW1DOUI7Ozs7O3lDQUlBLDBCQUFBLEdBQTRCLFNBQUE7QUFDeEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsV0FBQSxHQUFjLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO0lBQ2QsU0FBQSxHQUFZLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBakIsQ0FBdUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsQ0FBQyxRQUFILElBQWdCLENBQUMsQ0FBQyxHQUFGLEtBQVM7TUFBaEM7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO0lBQ1osSUFBTyxpQkFBUDtBQUF1QixhQUF2Qjs7V0FFQSxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQXJCLENBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBakM7RUFOd0I7OztBQVE1Qjs7Ozs7eUNBSUEsd0JBQUEsR0FBMEIsU0FBQTtBQUN0QixRQUFBO0lBQUEsUUFBQSxHQUFXLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDaEMsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBRWhDLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGNBQWYsQ0FBSjtNQUF3QyxRQUFRLENBQUMsY0FBVCxHQUEwQixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFyQyxFQUFsRTs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxpQkFBZixDQUFKO01BQTJDLFFBQVEsQ0FBQyxpQkFBVCxHQUE2QixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBckMsRUFBeEU7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsa0JBQWYsQ0FBSjtNQUE0QyxRQUFRLENBQUMsa0JBQVQsR0FBOEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQXJDLEVBQTFFOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSjtNQUFnQyxRQUFRLENBQUMsTUFBVCxHQUFrQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxFQUFsRDs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxtQkFBQSxDQUFmLENBQUo7TUFBOEMsUUFBUSxDQUFDLFlBQVQsR0FBd0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUE5RTs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxzQkFBQSxDQUFmLENBQUo7TUFBaUQsUUFBUSxDQUFDLGVBQVQsR0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBcEY7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsc0JBQUEsQ0FBZixDQUFKO01BQWlELFFBQVEsQ0FBQyxlQUFULEdBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQXBGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLHlCQUFBLENBQWYsQ0FBSjtNQUFvRCxRQUFRLENBQUMsa0JBQVQsR0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBMUY7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsb0JBQUEsQ0FBZixDQUFKO01BQStDLFFBQVEsQ0FBQyxVQUFULEdBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBN0U7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKO2FBQWdDLFFBQVEsQ0FBQyxNQUFULEdBQWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBMUQ7O0VBZHNCOzs7QUFnQjFCOzs7Ozt5Q0FJQSxzQkFBQSxHQUF3QixTQUFBO0FBQ3BCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztJQUNkLFNBQUEsR0FBWSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWpCLENBQXVCLFNBQUMsQ0FBRDthQUFPLENBQUMsQ0FBQyxDQUFDLFFBQUgsSUFBZ0IsQ0FBQyxDQUFDLEdBQUYsS0FBUztJQUFoQyxDQUF2QjtJQUNaLElBQU8saUJBQVA7QUFBdUIsYUFBdkI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLFNBQTFCLEVBQXFDLElBQUMsQ0FBQSxNQUF0QztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVJvQjs7O0FBVXhCOzs7Ozt5Q0FJQSxxQkFBQSxHQUF1QixTQUFBO0FBQ25CLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztJQUNkLFNBQUEsR0FBWSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWpCLENBQXVCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLENBQUMsUUFBSCxJQUFnQixDQUFDLENBQUMsR0FBRixLQUFTO01BQWhDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQUNaLElBQVUsQ0FBSSxTQUFkO0FBQUEsYUFBQTs7SUFFQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckM7SUFDWCxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQW5CLENBQTZCLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBZCxDQUE3QixFQUFtRCxRQUFuRDtJQUNBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixJQUE4QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUEsQ0FBbEIsQ0FBckM7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7TUFDekIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLEdBQTJCLFNBRi9COztXQUlBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVptQjs7O0FBY3ZCOzs7Ozt5Q0FJQSxvQkFBQSxHQUFzQixTQUFBO0FBQ2xCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztJQUNkLFNBQUEsR0FBWSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWpCLENBQXVCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLENBQUMsUUFBSCxJQUFnQixDQUFDLENBQUMsR0FBRixLQUFTO01BQWhDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQUNaLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQTFDLENBQXRCLEVBQXVFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQXRGO0lBQ1QsSUFBVSxDQUFJLFNBQWQ7QUFBQSxhQUFBOztJQUVBLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFyQztJQUNYLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBbkIsQ0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFsQyxFQUF3QyxRQUF4QyxFQUFrRCxNQUFsRDtJQUNBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixJQUE4QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUEsQ0FBbEIsQ0FBckM7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7TUFDekIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLEdBQTJCLFNBRi9COztXQUlBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQWJrQjs7O0FBZXRCOzs7Ozt5Q0FJQSxvQkFBQSxHQUFzQixTQUFBO0FBQ2xCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztJQUNkLFNBQUEsR0FBWSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWpCLENBQXVCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLENBQUMsUUFBSCxJQUFnQixDQUFDLENBQUMsR0FBRixLQUFTO01BQWhDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQUNaLElBQU8saUJBQVA7QUFBdUIsYUFBdkI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQXdCLFNBQXhCLEVBQW1DLElBQUMsQ0FBQSxNQUFwQztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVJrQjs7O0FBVXRCOzs7Ozt5Q0FJQSxzQkFBQSxHQUF3QixTQUFBO0FBQ3BCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztJQUNkLFNBQUEsR0FBWSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWpCLENBQXVCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLENBQUMsUUFBSCxJQUFnQixDQUFDLENBQUMsR0FBRixLQUFTO01BQWhDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQUNaLElBQU8saUJBQVA7QUFBdUIsYUFBdkI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLFNBQTFCLEVBQXFDLElBQUMsQ0FBQSxNQUF0QztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVJvQjs7O0FBVXhCOzs7Ozt5Q0FJQSxxQkFBQSxHQUF1QixTQUFBO0FBQ25CLFFBQUE7SUFBQSxXQUFBLEdBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkM7SUFDZCxTQUFBLEdBQVksWUFBWSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBOUIsQ0FBb0MsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsQ0FBQyxRQUFILElBQWdCLENBQUMsQ0FBQyxHQUFGLEtBQVM7TUFBaEM7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDO0lBQ1osSUFBTyxpQkFBUDtBQUF1QixhQUF2Qjs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsU0FBekIsRUFBb0MsSUFBQyxDQUFBLE1BQXJDO1dBRUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBUG1COzs7QUFTdkI7Ozs7O3lDQUlBLHFCQUFBLEdBQXVCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztJQUNkLFNBQUEsR0FBWSxZQUFZLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUE5QixDQUFvQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxDQUFDLFFBQUgsSUFBaUIsQ0FBQyxDQUFDLEdBQUYsS0FBUztNQUFqQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEM7SUFDWixJQUFPLGlCQUFQO0FBQXVCLGFBQXZCOztJQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixTQUF6QixFQUFvQyxJQUFDLENBQUEsTUFBckM7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFObUI7OztBQVF2Qjs7Ozs7eUNBSUEsb0JBQUEsR0FBc0IsU0FBQTtBQUNsQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixXQUFBLEdBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkM7SUFDZCxTQUFBLEdBQVksS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFqQixDQUF1QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxDQUFDLFFBQUgsSUFBZ0IsQ0FBQyxDQUFDLEdBQUYsS0FBUztNQUFoQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7SUFDWixJQUFPLGlCQUFQO0FBQXVCLGFBQXZCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixTQUF4QixFQUFtQyxJQUFDLENBQUEsTUFBcEM7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFSa0I7OztBQVV0Qjs7Ozs7eUNBSUEsb0JBQUEsR0FBc0IsU0FBQTtBQUNsQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixXQUFBLEdBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkM7SUFDZCxTQUFBLEdBQVksS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFqQixDQUF1QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxDQUFDLFFBQUgsSUFBZ0IsQ0FBQyxDQUFDLEdBQUYsS0FBUztNQUFoQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7SUFDWixJQUFPLGlCQUFQO0FBQXVCLGFBQXZCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixTQUF4QixFQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQTNDLEVBQXFELElBQUMsQ0FBQSxNQUF0RDtXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVJrQjs7O0FBVXRCOzs7Ozt5Q0FJQSx3QkFBQSxHQUEwQixTQUFBO0FBQ3RCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztJQUNkLFNBQUEsR0FBWSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWpCLENBQXVCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLENBQUMsUUFBSCxJQUFnQixDQUFDLENBQUMsR0FBRixLQUFTO01BQWhDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQUNaLElBQU8saUJBQVA7QUFBdUIsYUFBdkI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLFNBQTVCLEVBQXVDLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBL0MsRUFBcUQsSUFBQyxDQUFBLE1BQXREO1dBRUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBUnNCOzs7QUFVMUI7Ozs7O3lDQUlBLHNCQUFBLEdBQXdCLFNBQUE7QUFDcEIsUUFBQTtJQUFBLFVBQUEsR0FBYSxZQUFZLENBQUMsS0FBSyxDQUFDLFdBQVksQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQyxDQUFBO0lBQzVDLElBQU8sa0JBQVA7QUFBd0IsYUFBeEI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCLFVBQXpCLEVBQXFDLElBQUMsQ0FBQSxNQUF0QztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQU5vQjs7O0FBUXhCOzs7Ozt5Q0FJQSx1QkFBQSxHQUF5QixTQUFBO0FBQ3JCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFyQztJQUNYLGVBQUEsR0FBa0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBbkM7SUFDbEIsYUFBQSxHQUFnQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFuQztJQUNoQixNQUFBLEdBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUExQyxDQUF0QixFQUF1RSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUF0RjtJQUNULEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQztJQUNSLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixJQUE4QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUEsQ0FBbEIsQ0FBckM7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7TUFDekIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLEdBQTJCLFNBRi9COzs7U0FJd0IsQ0FBRSxRQUFRLENBQUMsSUFBbkMsQ0FBd0MsZUFBeEMsRUFBeUQsYUFBekQsRUFBd0UsUUFBeEUsRUFBa0YsTUFBbEY7O1dBRUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBYnFCOzs7QUFlekI7Ozs7O3lDQUlBLHlCQUFBLEdBQTJCLFNBQUE7QUFDdkIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDO0lBQ1gsQ0FBQSxHQUFJLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBdkQ7SUFDSixDQUFBLEdBQUksSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUF2RDtJQUNKLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQTFDLENBQXRCLEVBQXVFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQXRGO0lBQ1QsS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DO0lBQ1IsVUFBQSxHQUFhLEtBQUssQ0FBQyxXQUFZLENBQUEsS0FBQTtJQUMvQixJQUFHLENBQUMsVUFBSjtBQUFvQixhQUFwQjs7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsSUFBOEIsQ0FBSSxDQUFDLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBLENBQWxCLENBQXJDO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixTQUYvQjs7SUFJQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixLQUF3QixDQUEzQjtNQUNJLENBQUEsR0FBSSxJQUFDLENBQUEsV0FBVyxDQUFDLHdCQUFiLENBQXNDLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQTlDLEVBQW9FLFVBQXBFLEVBQWdGLElBQUMsQ0FBQSxNQUFqRjtNQUNKLENBQUEsR0FBSSxDQUFDLENBQUM7TUFDTixDQUFBLEdBQUksQ0FBQyxDQUFDLEVBSFY7O0lBS0EsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFwQixDQUEyQixDQUEzQixFQUE4QixDQUE5QixFQUFpQyxRQUFqQyxFQUEyQyxNQUEzQztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQXJCdUI7OztBQXVCM0I7Ozs7O3lDQUlBLDJCQUFBLEdBQTZCLFNBQUE7QUFDekIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsVUFBQSxHQUFhLEtBQUssQ0FBQyxXQUFZLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBbkMsQ0FBQTtJQUMvQixJQUFjLGtCQUFkO0FBQUEsYUFBQTs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsVUFBNUIsRUFBd0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFoRCxFQUFzRCxJQUFDLENBQUEsTUFBdkQ7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFQeUI7OztBQVM3Qjs7Ozs7eUNBSUEscUJBQUEsR0FBdUIsU0FBQTtBQUNuQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixVQUFBLEdBQWEsS0FBSyxDQUFDLFdBQVksQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQyxDQUFBO0lBQy9CLElBQWMsa0JBQWQ7QUFBQSxhQUFBOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixVQUF4QixFQUFvQyxJQUFDLENBQUEsTUFBckM7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFQbUI7OztBQVN2Qjs7Ozs7eUNBSUEscUJBQUEsR0FBdUIsU0FBQTtBQUNuQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckM7SUFDWCxDQUFBLEdBQUksSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQTNDO0lBQ0osQ0FBQSxHQUFJLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUEzQztJQUNKLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQTFDLENBQXRCLEVBQXVFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQXRGO0lBQ1QsS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DO0lBQ1IsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLElBQThCLENBQUksQ0FBQyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBQSxDQUFsQixDQUFyQztNQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtNQUN6QixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkIsU0FGL0I7OztTQUl3QixDQUFFLFFBQVEsQ0FBQyxNQUFuQyxDQUEwQyxDQUFBLEdBQUksR0FBOUMsRUFBbUQsQ0FBQSxHQUFJLEdBQXZELEVBQTRELFFBQTVELEVBQXNFLE1BQXRFOztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQWJtQjs7O0FBZXZCOzs7Ozt5Q0FJQSx1QkFBQSxHQUF5QixTQUFBO0FBQ3JCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFVBQUEsR0FBYSxLQUFLLENBQUMsV0FBWSxDQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DLENBQUE7SUFFL0IsSUFBRyxVQUFIO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLFVBQTFCLEVBQXNDLElBQUMsQ0FBQSxNQUF2QyxFQURKOztXQUdBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVBxQjs7O0FBU3pCOzs7Ozt5Q0FJQSxxQkFBQSxHQUF1QixTQUFBO0FBQ25CLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQztJQUNSLFVBQUEsR0FBYSxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUE7SUFDL0IsSUFBTyxrQkFBUDtBQUF3QixhQUF4Qjs7SUFFQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckM7SUFDWCxNQUFBLEdBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBOUI7SUFDVCxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQXBCLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBbkMsRUFBeUMsUUFBekMsRUFBbUQsTUFBbkQ7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLFVBQS9CLEVBQTJDLElBQUMsQ0FBQSxNQUE1QztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVptQjs7O0FBY3ZCOzs7Ozt5Q0FJQSxzQkFBQSxHQUF3QixTQUFBO0FBQ3BCLFFBQUE7SUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBbkM7SUFDUixVQUFBLEdBQWEsWUFBWSxDQUFDLEtBQUssQ0FBQyxXQUFZLENBQUEsS0FBQTtJQUM1QyxJQUFPLGtCQUFQO0FBQXdCLGFBQXhCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixVQUF6QixFQUFxQyxJQUFDLENBQUEsTUFBdEM7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFQb0I7OztBQVN4Qjs7Ozs7eUNBSUEsdUJBQUEsR0FBeUIsU0FBQTtBQUNyQixRQUFBO0lBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DO0lBQ1IsVUFBQSxHQUFhLFlBQVksQ0FBQyxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUE7SUFDNUMsSUFBTyxrQkFBUDtBQUF3QixhQUF4Qjs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsVUFBMUIsRUFBc0MsSUFBQyxDQUFBLE1BQXZDO1dBRUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBUHFCOzs7QUFTekI7Ozs7O3lDQUlBLHlCQUFBLEdBQTJCLFNBQUE7QUFDdkIsUUFBQTtJQUFBLFFBQUEsR0FBVyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ2hDLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsSUFBc0I7SUFDOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUVoQyxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxRQUFmLENBQUo7TUFBa0MsUUFBUSxDQUFDLFFBQVQsR0FBb0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckMsRUFBdEQ7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKO01BQWdDLFFBQVEsQ0FBQyxNQUFULEdBQWtCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DLEVBQWxEOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGFBQUEsQ0FBZixDQUFKO01BQXdDLFFBQVEsQ0FBQyxNQUFULEdBQWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBbEU7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsZ0JBQUEsQ0FBZixDQUFKO01BQTJDLFFBQVEsQ0FBQyxTQUFULEdBQXFCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBeEU7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKO01BQWdDLFFBQVEsQ0FBQyxNQUFULEdBQWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBMUQ7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsY0FBZixDQUFKO01BQXdDLFFBQVEsQ0FBQyxjQUFULEdBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBMUU7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsWUFBZixDQUFKO2FBQXNDLFFBQVEsQ0FBQyxZQUFULEdBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBdEU7O0VBWHVCOzs7QUFhM0I7Ozs7O3lDQUlBLDJCQUFBLEdBQTZCLFNBQUE7QUFDekIsUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQztJQUNSLFVBQUEsR0FBYSxZQUFZLENBQUMsS0FBSyxDQUFDLFdBQVksQ0FBQSxLQUFBO0lBQzVDLElBQU8sa0JBQVA7QUFBd0IsYUFBeEI7O1dBRUEsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUF0QixDQUEwQixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQWxDO0VBTHlCOzs7QUFPN0I7Ozs7O3lDQUlBLHVCQUFBLEdBQXlCLFNBQUE7QUFDckIsUUFBQTtJQUFBLFFBQUEsR0FBVyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ2hDLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLFFBQUEsR0FBYyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsUUFBZixDQUFKLEdBQWtDLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDLENBQWxDLEdBQXNGLFFBQVEsQ0FBQztJQUMxRyxLQUFBLEdBQVcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGNBQWYsQ0FBSixHQUF3QyxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQWhELEdBQW9FLFFBQVEsQ0FBQztJQUNyRixLQUFBLEdBQVcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFlBQWYsQ0FBSixHQUFzQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQTlDLEdBQWdFLFFBQVEsQ0FBQztJQUNqRixTQUFBLEdBQWUsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGdCQUFBLENBQWYsQ0FBSixHQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5ELEdBQWtFLFFBQVEsQ0FBQztJQUN2RixNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSixHQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQXhDLEdBQW9ELFFBQVEsQ0FBQztJQUN0RSxNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSixHQUFnQyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFoQyxHQUFnRixRQUFRLENBQUM7SUFFbEcsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLElBQThCLENBQUksQ0FBQyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBQSxDQUFsQixDQUFyQztNQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtNQUN6QixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkIsU0FGL0I7O0lBSUEsTUFBQSxHQUFZLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxhQUFBLENBQWYsQ0FBSixHQUF5QyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUE5QixDQUF6QyxHQUFvRixFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsUUFBUSxDQUFDLE1BQS9CO0lBQzdGLEtBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQztJQUNSLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUF4QyxFQUFpRCxLQUFqRCxFQUFxRCxTQUFyRCxFQUFnRSxNQUFoRSxFQUF3RSxRQUF4RSxFQUFrRixDQUFsRixFQUFxRixDQUFyRixFQUF3RixLQUF4RixFQUErRixLQUEvRixFQUFzRyxLQUF0RztJQUVBLElBQUcsS0FBSyxDQUFDLFdBQVksQ0FBQSxLQUFBLENBQXJCO01BQ0ksK0NBQW1CLENBQUUsY0FBbEIsS0FBMEIsSUFBN0I7UUFDSSxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLFFBQXpCLEdBQW9DLFFBQVEsQ0FBQyxTQURqRDs7TUFFQSxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLE1BQU0sQ0FBQyxDQUFoQyxHQUF1QyxNQUFBLEtBQVUsQ0FBYixHQUFvQixDQUFwQixHQUEyQjtNQUMvRCxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLE1BQU0sQ0FBQyxDQUFoQyxHQUF1QyxNQUFBLEtBQVUsQ0FBYixHQUFvQixDQUFwQixHQUEyQjtNQUMvRCxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLFNBQXpCLEdBQXFDLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5DO01BQ3JDLEtBQUssQ0FBQyxXQUFZLENBQUEsS0FBQSxDQUFNLENBQUMsTUFBekIsR0FBa0MsTUFBQSxHQUFTO01BRTNDLElBQUcsTUFBQSxLQUFVLENBQWI7UUFDSSxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFqQyxHQUFxQyxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLE9BQU8sQ0FBQztRQUN0RSxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFqQyxHQUFxQyxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLE9BQU8sQ0FBQyxFQUYxRTs7TUFHQSxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLEtBQXpCLENBQUE7TUFDQSxLQUFLLENBQUMsV0FBWSxDQUFBLEtBQUEsQ0FBTSxDQUFDLE1BQXpCLENBQUEsRUFaSjs7V0FjQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFsQ3FCOzs7QUFvQ3pCOzs7Ozt5Q0FJQSxnQkFBQSxHQUFrQixTQUFBO1dBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLENBQXVCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFkLElBQXFCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBeEQsQ0FBdkI7RUFEYzs7O0FBR2xCOzs7Ozt5Q0FJQSxrQkFBQSxHQUFvQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxJQUFHLFdBQVcsQ0FBQyxhQUFmO0FBQWtDLGFBQWxDOztJQUNBLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBekIsR0FBZ0M7SUFFaEMsSUFBRyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBWjtNQUNJLFlBQVksQ0FBQyxLQUFiLENBQUEsRUFESjs7SUFHQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLElBQUcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVQsSUFBMkIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXZDO01BQ0ksS0FBSyxDQUFDLFlBQU4sQ0FBbUIsS0FBSyxDQUFDLGdCQUF6QjtBQUNBO0FBQUEsV0FBQSxxQ0FBQTs7UUFDSSxJQUE2RSxPQUE3RTtVQUFBLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBeEIsQ0FBa0MsT0FBTyxDQUFDLFdBQVQsR0FBcUIsR0FBckIsR0FBd0IsT0FBTyxDQUFDLEtBQWpFLEVBQUE7O0FBREosT0FGSjs7SUFJQSxJQUFHLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFULElBQXdCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFwQztNQUNJLEtBQUssQ0FBQyxZQUFOLENBQW1CLEtBQUssQ0FBQyxhQUF6QixFQURKOztJQUVBLElBQUcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVQsSUFBeUIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXJDO01BQ0ksS0FBSyxDQUFDLFlBQU4sQ0FBbUIsS0FBSyxDQUFDLGNBQXpCO0FBQ0E7QUFBQSxXQUFBLHdDQUFBOztRQUNJLElBQXlFLEtBQXpFO1VBQUEsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUF4QixDQUFrQyxLQUFLLENBQUMsV0FBUCxHQUFtQixHQUFuQixHQUFzQixLQUFLLENBQUMsS0FBN0QsRUFBQTs7QUFESixPQUZKOztJQUtBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFYO01BQ0ksVUFBQSxHQUFhO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFkLElBQXFCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBeEQsQ0FBTDs7TUFDYixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBWDtRQUNJLFdBQVcsQ0FBQyxTQUFaLEdBQXdCO1VBQUEsR0FBQSxFQUFLLEdBQUEsR0FBTSxVQUFVLENBQUMsR0FBdEI7VUFBMkIsUUFBQSxFQUFVLEVBQXJDO1VBQXlDLEtBQUEsRUFBTyxFQUFoRDtVQUFvRCxNQUFBLEVBQVEsRUFBNUQ7VUFENUI7T0FBQSxNQUFBO1FBR0ksV0FBVyxDQUFDLFNBQVosR0FBd0I7VUFDckIsR0FBQSxFQUFLLEdBQUEsR0FBTSxVQUFVLENBQUMsR0FERDtVQUVyQixRQUFBLEVBQVUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUZaO1VBR3JCLEtBQUEsRUFBTyxLQUFLLENBQUMsYUFBYSxDQUFDLGtCQUhOO1VBSXJCLE1BQUEsRUFBUSxLQUFLLENBQUMsY0FBYyxDQUFDLGtCQUpSO1VBSDVCOztNQVVBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsSUFBc0I7TUFDOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztNQUNoQyxRQUFBLEdBQWUsSUFBQSxFQUFFLENBQUMsWUFBSCxDQUFBO01BQ2YsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVg7UUFDSSxRQUFRLENBQUMsU0FBVCxHQUFxQjtVQUFBLEdBQUEsRUFBSyxHQUFBLEdBQU0sVUFBVSxDQUFDLEdBQXRCO1VBQTJCLFFBQUEsRUFBVSxFQUFyQztVQUF5QyxLQUFBLEVBQU8sRUFBaEQ7VUFBb0QsTUFBQSxFQUFRLEVBQTVEO1VBQWdFLE9BQUEsRUFBUyxXQUFXLENBQUMsT0FBckY7VUFEekI7T0FBQSxNQUFBO1FBR0ksUUFBUSxDQUFDLFNBQVQsR0FBcUI7VUFBQSxHQUFBLEVBQUssR0FBQSxHQUFNLFVBQVUsQ0FBQyxHQUF0QjtVQUEyQixRQUFBLEVBQVUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUE1RDtVQUFnRixLQUFBLEVBQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxrQkFBM0c7VUFBK0gsTUFBQSxFQUFRLEtBQUssQ0FBQyxjQUFjLENBQUMsa0JBQTVKO1VBSHpCOztNQUtBLFlBQVksQ0FBQyxRQUFiLENBQXNCLFFBQXRCLEVBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBeEMsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtRQUE1QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEQsRUFwQko7S0FBQSxNQUFBO01Bc0JJLFlBQVksQ0FBQyxRQUFiLENBQXNCLElBQXRCLEVBdEJKOztXQXdCQSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7RUEzQ1Q7OztBQTZDcEI7Ozs7O3lDQUlBLDRCQUFBLEdBQThCLFNBQUE7SUFDMUIsSUFBRyxXQUFXLENBQUMsYUFBZjtBQUFrQyxhQUFsQzs7SUFDQSxZQUFZLENBQUMsZ0JBQWIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQUcsS0FBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQTVCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtXQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtFQUpDOzs7QUFPOUI7Ozs7O3lDQUlBLHFCQUFBLEdBQXVCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLElBQUcsV0FBVyxDQUFDLGFBQWY7QUFBa0MsYUFBbEM7O0lBQ0EsSUFBRyxxREFBSDtNQUNJLEtBQUEsR0FBWSxJQUFBLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQWhDO01BQ1osWUFBWSxDQUFDLFFBQWIsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFyQyxFQUFtRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO1FBQTVCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRDthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QixLQUg3Qjs7RUFGbUI7OztBQU92Qjs7Ozs7eUNBSUEsdUJBQUEsR0FBeUIsU0FBQTtBQUNyQixRQUFBO0lBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBRWhDLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFFBQWYsQ0FBSjtNQUNJLFlBQVksQ0FBQyxjQUFjLENBQUMsUUFBNUIsR0FBdUMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckMsRUFEM0M7O0lBRUEsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsT0FBZixDQUFKO01BQ0ksWUFBWSxDQUFDLGNBQWMsQ0FBQyxPQUE1QixHQUFzQyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBRGxEOztJQUVBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLEtBQWYsQ0FBSjthQUNJLFlBQVksQ0FBQyxjQUFjLENBQUMsS0FBNUIsR0FBb0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQURoRDs7RUFScUI7OztBQVd6Qjs7Ozs7eUNBSUEsbUJBQUEsR0FBcUIsU0FBQTtXQUNqQixRQUFRLENBQUMsTUFBVCxDQUFBO0VBRGlCOzs7QUFHckI7Ozs7O3lDQUlBLHVCQUFBLEdBQXlCLFNBQUE7QUFDckIsUUFBQTtJQUFBLFFBQUEsR0FBVyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ2hDLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsSUFBc0I7SUFDOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUNoQyxPQUFBLEdBQWEsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE9BQWYsQ0FBSixHQUFpQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQXpDLEdBQXNELFlBQVksQ0FBQyxjQUFjLENBQUM7SUFFNUYsSUFBRyxPQUFIO01BQ0ksTUFBQSxHQUFTLGVBQWUsQ0FBQyxTQUFoQixDQUEwQixlQUFlLENBQUMsT0FBaEIsQ0FBd0IsT0FBeEIsQ0FBMUIsRUFEYjs7SUFFQSxLQUFBLEdBQVcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLEtBQWYsQ0FBSixHQUErQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQyxDQUEvQixHQUE4RSxZQUFZLENBQUMsY0FBYyxDQUFDO0lBQ2xILFFBQUEsR0FBYyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsUUFBZixDQUFKLEdBQWtDLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDLENBQWxDLEdBQXNGLFlBQVksQ0FBQyxjQUFjLENBQUM7SUFFN0gsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCLENBQUMsV0FBVyxDQUFDO0lBQ3RDLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQjtXQUczQixRQUFRLENBQUMsVUFBVCxDQUFvQixRQUFwQixFQUE4QixNQUE5QixFQUFzQyxLQUF0QztFQWZxQjs7O0FBaUJ6Qjs7Ozs7eUNBSUEsa0JBQUEsR0FBb0IsU0FBQTtJQUNoQixJQUFPLG1DQUFQO0FBQXlDLGFBQXpDOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixZQUFZLENBQUMsS0FBSyxDQUFDLFFBQTVDLEVBQXNELElBQUMsQ0FBQSxNQUF2RDtXQUNBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQUpnQjs7O0FBT3BCOzs7Ozt5Q0FJQSxpQkFBQSxHQUFtQixTQUFBO0FBQ2YsUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFyQztJQUNYLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFyQyxDQUFnRCxJQUFBLElBQUEsQ0FBSyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQWIsQ0FBaEQsRUFBb0UsUUFBcEUsRUFBOEUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFyRztJQUVBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixJQUE4QixRQUFBLEdBQVcsQ0FBNUM7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7TUFDekIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLEdBQTJCLFNBRi9COztXQUdBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVBlOzs7QUFTbkI7Ozs7O3lDQUlBLGlCQUFBLEdBQW1CLFNBQUE7QUFDZixRQUFBO0lBQUEsTUFBQSxHQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQTlCO0lBQ1QsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDO0lBQ1gsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUVyQixZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBbkMsR0FBdUM7SUFDdkMsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQW5DLEdBQXVDO0lBQ3ZDLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFyQyxDQUE0QyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBM0MsQ0FBQSxHQUFnRCxHQUE1RixFQUFpRyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBM0MsQ0FBQSxHQUFnRCxHQUFqSixFQUFzSixRQUF0SixFQUFnSyxNQUFoSztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsSUFBL0IsRUFBcUMsSUFBQyxDQUFBLE1BQXRDO1dBQ0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBVmU7OztBQVluQjs7Ozs7eUNBSUEsZ0JBQUEsR0FBa0IsU0FBQTtBQUNkLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFyQztJQUNYLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUE5QjtJQUNULElBQUMsQ0FBQSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBakMsSUFBc0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDdkQsSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFqQyxJQUFzQyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUN2RCxRQUFBLEdBQVcsWUFBWSxDQUFDLEtBQUssQ0FBQztJQUU5QixRQUFRLENBQUMsUUFBUSxDQUFDLFFBQWxCLENBQTJCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBbEIsR0FBc0IsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFsRSxFQUFxRSxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQWxCLEdBQXNCLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBNUcsRUFBK0csUUFBL0csRUFBeUgsTUFBekg7SUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQS9CLEVBQXFDLElBQUMsQ0FBQSxNQUF0QztXQUNBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVZjOzs7QUFZbEI7Ozs7O3lDQUlBLG1CQUFBLEdBQXFCLFNBQUE7QUFDakIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFFckIsTUFBQSxHQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQTlCO0lBQ1QsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDO0lBQ1gsR0FBQSxHQUFNLElBQUMsQ0FBQSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztJQUVuQyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBbkMsR0FBdUM7SUFDdkMsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQW5DLEdBQXVDO0lBQ3ZDLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFyQyxDQUE0QyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQXBELEVBQStELElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DLENBQUEsR0FBNEMsR0FBM0csRUFBZ0gsUUFBaEgsRUFBMEgsTUFBMUg7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQS9CLEVBQXFDLElBQUMsQ0FBQSxNQUF0QztXQUNBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVppQjs7O0FBY3JCOzs7Ozt5Q0FJQSxrQkFBQSxHQUFvQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckM7SUFDWCxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBckMsQ0FBK0MsSUFBQSxLQUFBLENBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFkLENBQS9DLEVBQXFFLFFBQXJFLEVBQStFLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBdEc7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsSUFBOEIsUUFBQSxLQUFZLENBQTdDO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixTQUYvQjs7V0FHQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFQZ0I7OztBQVVwQjs7Ozs7eUNBSUEsbUJBQUEsR0FBcUIsU0FBQTtBQUNqQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDO0lBQ1gsTUFBQSxHQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQTlCO0lBRVQsSUFBRyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFyQixDQUE4QixLQUFLLENBQUMsTUFBcEMsQ0FBSjtNQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxFQURiO0tBQUEsTUFBQTtNQUdJLE1BQUEsR0FBUyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUh6Qzs7SUFLQSxRQUFBLEdBQVcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxLQUFuQyxDQUF5QyxTQUFDLENBQUQ7YUFBTyxDQUFDLENBQUMsTUFBRixLQUFZO0lBQW5CLENBQXpDO0lBRVgsSUFBRyxDQUFDLFFBQUo7TUFDSSxRQUFBLEdBQWUsSUFBQSxFQUFFLENBQUMsZUFBSCxDQUFBO01BQ2YsUUFBUSxDQUFDLE1BQVQsR0FBa0I7TUFDbEIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFNBQXhCLENBQWtDLFFBQWxDLEVBSEo7O0FBS0EsWUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQWY7QUFBQSxXQUNTLENBRFQ7UUFFUSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQWxCLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWYsR0FBdUIsS0FBbEQsRUFBeUQsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBZixHQUF1QixHQUFoRixFQUFxRixRQUFyRixFQUErRixNQUEvRjtRQUNBLE1BQUEsR0FBUyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWYsR0FBdUI7UUFDeEMsTUFBTSxDQUFDLFFBQVAsR0FBa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBZixLQUE4QixDQUE5QixJQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFmLEtBQThCO1FBQ25GLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQWYsS0FBOEIsQ0FBOUIsSUFBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBZixLQUE4QjtBQUxwRjtBQURULFdBT1MsQ0FQVDtRQVFRLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBbEIsQ0FBeUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixHQUFxQixHQUE5QyxFQUFtRCxRQUFuRCxFQUE2RCxNQUE3RDtRQUNBLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQXRCLEdBQWdDO0FBRi9CO0FBUFQsV0FVUyxDQVZUO1FBV1EsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFsQixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBbkQsRUFBMEQsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQWhGLEVBQXdGLFFBQXhGLEVBQWtHLE1BQWxHO1FBQ0EsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBMUIsR0FBb0M7QUFaNUM7SUFjQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsSUFBOEIsUUFBQSxLQUFZLENBQTdDO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixTQUYvQjs7V0FHQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFwQ2lCOzs7QUFzQ3JCOzs7Ozt5Q0FJQSxvQkFBQSxHQUFzQixTQUFBO0FBQ2xCLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFFaEMsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsY0FBZixDQUFKO01BQXdDLFFBQVEsQ0FBQyxjQUFULEdBQTBCLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXJDLEVBQWxFOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGlCQUFmLENBQUo7TUFBMkMsUUFBUSxDQUFDLGlCQUFULEdBQTZCLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFyQyxFQUF4RTs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxNQUFmLENBQUo7TUFBZ0MsUUFBUSxDQUFDLE1BQVQsR0FBa0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsRUFBbEQ7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsbUJBQUEsQ0FBZixDQUFKO01BQThDLFFBQVEsQ0FBQyxZQUFULEdBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBOUU7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsc0JBQUEsQ0FBZixDQUFKO01BQWlELFFBQVEsQ0FBQyxlQUFULEdBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQXBGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLHNCQUFBLENBQWYsQ0FBSjtNQUFpRCxRQUFRLENBQUMsZUFBVCxHQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFwRjs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSx5QkFBQSxDQUFmLENBQUo7TUFBb0QsUUFBUSxDQUFDLGtCQUFULEdBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQTFGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLG9CQUFBLENBQWYsQ0FBSjtNQUErQyxRQUFRLENBQUMsVUFBVCxHQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQTdFOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSjthQUFnQyxRQUFRLENBQUMsTUFBVCxHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQTFEOztFQWJrQjs7O0FBZ0J0Qjs7Ozs7eUNBSUEsZ0JBQUEsR0FBa0IsU0FBQTtBQUNkLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFmLENBQWlDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBekM7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxNQUFBLEdBQVMsS0FBSyxDQUFDO0lBQ2YsSUFBTyxzQkFBUDtNQUE0QixNQUFPLENBQUEsTUFBQSxDQUFQLEdBQXFCLElBQUEsRUFBRSxDQUFDLFlBQUgsQ0FBQSxFQUFqRDs7SUFFQSxDQUFBLEdBQUksSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQTVDO0lBQ0osQ0FBQSxHQUFJLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUE1QztJQUVKLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsYUFBQSxDQUFmLENBQUosR0FBd0MsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUExQyxDQUF0QixFQUF1RSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUF0RixDQUF4QyxHQUEwSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsUUFBUSxDQUFDLFlBQS9CO0lBQ25KLFFBQUEsR0FBYyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsUUFBZixDQUFKLEdBQWtDLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDLENBQWxDLEdBQXNGLFFBQVEsQ0FBQztJQUMxRyxNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSixHQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQXhDLEdBQW9ELFFBQVEsQ0FBQztJQUN0RSxNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSixHQUFnQyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFoQyxHQUFnRixRQUFRLENBQUM7SUFDbEcsU0FBQSxHQUFlLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxnQkFBQSxDQUFmLENBQUosR0FBMkMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFuRCxHQUFrRSxRQUFRLENBQUM7SUFFdkYsS0FBQSxHQUFRLE1BQU8sQ0FBQSxNQUFBO0lBQ2YsS0FBSyxDQUFDLE1BQU4sR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDO0lBQ3ZCLEtBQUssQ0FBQyxLQUFOLDBDQUEyQixDQUFFO0lBQzdCLEtBQUssQ0FBQyxXQUFOLDRDQUFpQyxDQUFFO0lBQ25DLEtBQUssQ0FBQyxJQUFOLDhDQUE0QjtJQUM1QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQWQsR0FBa0I7SUFDbEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFkLEdBQWtCO0lBQ2xCLEtBQUssQ0FBQyxTQUFOLEdBQWtCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5DO0lBQ2xCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBYixHQUFvQixNQUFBLEtBQVUsQ0FBYixHQUFvQixDQUFwQixHQUEyQjtJQUM1QyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQWIsR0FBb0IsTUFBQSxLQUFVLENBQWIsR0FBb0IsQ0FBcEIsR0FBMkI7SUFDNUMsS0FBSyxDQUFDLE1BQU4sR0FBZSxNQUFBLElBQVcsQ0FBQyxJQUFBLEdBQU8sTUFBUjtJQUMxQixpREFBbUIsQ0FBRSxjQUFsQixLQUEwQixPQUE3QjtNQUNJLEtBQUssQ0FBQyxRQUFOLEdBQWlCLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBRGpEOztJQUVBLEtBQUssQ0FBQyxNQUFOLENBQUE7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixLQUF3QixDQUEzQjtNQUNJLENBQUEsR0FBSSxJQUFDLENBQUEsV0FBVyxDQUFDLHdCQUFiLENBQXNDLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQTlDLEVBQW9FLEtBQXBFLEVBQTJFLElBQUMsQ0FBQSxNQUE1RTtNQUNKLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBZCxHQUFrQixDQUFDLENBQUM7TUFDcEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFkLEdBQWtCLENBQUMsQ0FBQyxFQUh4Qjs7SUFLQSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQWYsQ0FBc0IsQ0FBdEIsRUFBeUIsQ0FBekIsRUFBNEIsU0FBNUIsRUFBdUMsTUFBdkMsRUFBK0MsUUFBL0M7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsSUFBOEIsQ0FBSSxDQUFDLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBLENBQWxCLENBQXJDO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixTQUYvQjs7V0FHQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUE1Q2M7OztBQThDbEI7Ozs7O3lDQUlBLGdCQUFBLEdBQWtCLFNBQUE7QUFDZCxRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFmLENBQWlDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBekM7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU8sQ0FBQSxNQUFBO0lBQ3JCLElBQU8sYUFBUDtBQUFtQixhQUFuQjs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBd0IsS0FBeEIsRUFBK0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBL0MsRUFBeUQsSUFBQyxDQUFBLE1BQTFEO1dBRUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBVGM7OztBQVdsQjs7Ozs7eUNBSUEsb0JBQUEsR0FBc0IsU0FBQTtBQUNsQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFmLENBQWlDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBekM7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU8sQ0FBQSxNQUFBO0lBQ3JCLElBQU8sYUFBUDtBQUFtQixhQUFuQjs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsS0FBNUIsRUFBbUMsSUFBQyxDQUFBLE1BQXBDO1dBRUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBVGtCOzs7QUFXdEI7Ozs7O3lDQUlBLGtCQUFBLEdBQW9CLFNBQUE7QUFDaEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBZixDQUFpQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXpDO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFPLENBQUEsTUFBQTtJQUNyQixJQUFPLGFBQVA7QUFBbUIsYUFBbkI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLEtBQTFCLEVBQWlDLElBQUMsQ0FBQSxNQUFsQztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVRnQjs7O0FBV3BCOzs7Ozt5Q0FJQSxnQkFBQSxHQUFrQixTQUFBO0FBQ2QsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBZixDQUFpQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXpDO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFPLENBQUEsTUFBQTtJQUNyQixJQUFPLGFBQVA7QUFBbUIsYUFBbkI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQXdCLEtBQXhCLEVBQStCLElBQUMsQ0FBQSxNQUFoQztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVRjOzs7QUFXbEI7Ozs7O3lDQUlBLGlCQUFBLEdBQW1CLFNBQUE7QUFDZixRQUFBO0lBQUEsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQTVCLENBQThDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBdEQ7SUFDQSxLQUFBLEdBQVEsWUFBWSxDQUFDLEtBQUssQ0FBQyxNQUFPLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsQ0FBQTtJQUNsQyxJQUFPLGFBQVA7QUFBbUIsYUFBbkI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCLEtBQXpCLEVBQWdDLElBQUMsQ0FBQSxNQUFqQztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVBlOzs7QUFTbkI7Ozs7O3lDQUlBLGdCQUFBLEdBQWtCLFNBQUE7QUFDZCxRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFmLENBQWlDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBekM7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU8sQ0FBQSxNQUFBO0lBQ3JCLElBQU8sYUFBUDtBQUFtQixhQUFuQjs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBd0IsS0FBeEIsRUFBK0IsSUFBQyxDQUFBLE1BQWhDO1dBRUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBVGM7OztBQVdsQjs7Ozs7eUNBSUEsaUJBQUEsR0FBbUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWYsQ0FBaUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF6QztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTyxDQUFBLE1BQUE7SUFDckIsSUFBTyxhQUFQO0FBQW1CLGFBQW5COztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixLQUF6QixFQUFnQyxJQUFDLENBQUEsTUFBakM7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFUZTs7O0FBV25COzs7Ozt5Q0FJQSxnQkFBQSxHQUFrQixTQUFBO0FBQ2QsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBZixDQUFpQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXpDO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFPLENBQUEsTUFBQTtJQUNyQixJQUFPLGFBQVA7QUFBbUIsYUFBbkI7O1dBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQXdCLEtBQXhCLEVBQStCLElBQUMsQ0FBQSxNQUFoQztFQVBjOzs7QUFVbEI7Ozs7O3lDQUlBLHNCQUFBLEdBQXdCLFNBQUE7QUFDcEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBZixDQUFpQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXpDO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFPLENBQUEsTUFBQTtJQUNyQixJQUFPLGFBQVA7QUFBbUIsYUFBbkI7O1dBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixLQUE5QixFQUFxQyxJQUFDLENBQUEsTUFBdEM7RUFQb0I7OztBQVN4Qjs7Ozs7eUNBSUEsZ0JBQUEsR0FBa0IsU0FBQTtBQUNkLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWYsQ0FBaUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF6QztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTyxDQUFBLE1BQUE7SUFDckIsSUFBTyxhQUFQO0FBQW1CLGFBQW5COztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixLQUF4QixFQUErQixJQUFDLENBQUEsTUFBaEM7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFUYzs7O0FBV2xCOzs7Ozt5Q0FJQSxrQkFBQSxHQUFvQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWYsQ0FBaUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF6QztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTyxDQUFBLE1BQUE7SUFDckIsSUFBTyxhQUFQO0FBQW1CLGFBQW5COztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFBYixDQUEwQixLQUExQixFQUFpQyxJQUFDLENBQUEsTUFBbEM7V0FDQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFSZ0I7OztBQVVwQjs7Ozs7eUNBSUEsaUJBQUEsR0FBbUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFmLENBQWlDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBekM7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU8sQ0FBQSxNQUFBO0lBQ3JCLElBQU8sYUFBUDtBQUFtQixhQUFuQjs7SUFFQSxNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGFBQUEsQ0FBZixDQUFKLEdBQXdDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBMUMsQ0FBdEIsRUFBdUUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBdEYsQ0FBeEMsR0FBMEksRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLFFBQVEsQ0FBQyxlQUEvQjtJQUNuSixRQUFBLEdBQWMsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFFBQWYsQ0FBSixHQUFrQyxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFyQyxDQUFsQyxHQUFzRixRQUFRLENBQUM7SUFDMUcsU0FBQSxHQUFlLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxnQkFBQSxDQUFmLENBQUosR0FBMkMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFuRCxHQUFrRSxRQUFRLENBQUM7SUFFdkYsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFmLENBQXlCLFNBQXpCLEVBQW9DLE1BQXBDLEVBQTRDLFFBQTVDLEVBQXNELENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxNQUFEO1FBQ2xELE1BQU0sQ0FBQyxPQUFQLENBQUE7UUFDQSxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFmLENBQWdDLE1BQU0sQ0FBQyxNQUF2QztlQUNBLEtBQUssQ0FBQyxNQUFPLENBQUEsTUFBQSxDQUFiLEdBQXVCO01BSDJCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RDtJQU9BLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixJQUE4QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUEsQ0FBbEIsQ0FBckM7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7TUFDekIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLEdBQTJCLFNBRi9COztXQUdBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQXhCZTs7O0FBMEJuQjs7Ozs7eUNBSUEsbUJBQUEsR0FBcUIsU0FBQTtBQUNqQixRQUFBO0lBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUE1QixDQUFnRCxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXhEO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsUUFBQSxHQUFXLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUyxDQUFBLE1BQUE7SUFDdkMsSUFBRyxRQUFIO01BQ0ksUUFBUSxDQUFDLE9BQVQsQ0FBQSxFQURKOztJQUVBLFFBQUEsR0FBZSxJQUFBLEVBQUUsQ0FBQyxlQUFILENBQUE7SUFDZixRQUFRLENBQUMsTUFBTSxDQUFDLGVBQWhCLEdBQWtDLElBQUMsQ0FBQSxXQUFXLENBQUM7SUFDL0MsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFTLENBQUEsTUFBQSxDQUE1QixHQUFzQztJQUN0QyxNQUFBLEdBQVMsZUFBZSxDQUFDLFNBQWhCLENBQTBCLGVBQWUsQ0FBQyxPQUFoQixDQUF3QixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQWhDLENBQTFCO0lBRVQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFqQixHQUF5QixNQUFNLENBQUM7SUFDaEMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFqQixHQUEwQixNQUFNLENBQUM7SUFFakMsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsS0FBd0IsQ0FBM0I7TUFDSSxDQUFBLEdBQUksSUFBQyxDQUFBLFdBQVcsQ0FBQyx3QkFBYixDQUFzQyxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUE5QyxFQUFvRSxRQUFwRSxFQUE4RSxJQUFDLENBQUEsTUFBL0U7TUFDSixRQUFRLENBQUMsT0FBTyxDQUFDLENBQWpCLEdBQXFCLENBQUMsQ0FBQztNQUN2QixRQUFRLENBQUMsT0FBTyxDQUFDLENBQWpCLEdBQXFCLENBQUMsQ0FBQyxFQUgzQjtLQUFBLE1BQUE7TUFLSSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQWpCLEdBQXFCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUE1QztNQUNyQixRQUFRLENBQUMsT0FBTyxDQUFDLENBQWpCLEdBQXFCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUE1QyxFQU56Qjs7SUFRQSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQWhCLEdBQXVCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixLQUFrQixDQUFyQixHQUE0QixHQUE1QixHQUFxQztJQUN6RCxRQUFRLENBQUMsTUFBTSxDQUFDLENBQWhCLEdBQXVCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixLQUFrQixDQUFyQixHQUE0QixHQUE1QixHQUFxQztJQUN6RCxRQUFRLENBQUMsTUFBVCxHQUFxQixDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKLEdBQWdDLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DLENBQWhDLEdBQWlGLEdBQUEsR0FBTTtJQUN6RyxRQUFRLENBQUMsU0FBVCxHQUF3QixDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsU0FBZixDQUFKLEdBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBM0MsR0FBMEQ7SUFDL0UsUUFBUSxDQUFDLFFBQVQsR0FBb0IsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUM1QixRQUFRLENBQUMsTUFBVCxHQUFrQixDQUNkLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFETSxFQUVkLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FGTSxFQUdkLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFITSxFQUlkLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFKTSxFQUtkLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFMTTtJQVFsQixRQUFRLENBQUMsTUFBTSxDQUFDLEVBQWhCLENBQW1CLFFBQW5CLEVBQTZCLEVBQUUsQ0FBQyxRQUFILENBQVksVUFBWixFQUF3QixJQUFDLENBQUEsV0FBekIsQ0FBN0I7SUFDQSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQWhCLENBQW1CLGlCQUFuQixFQUFzQyxFQUFFLENBQUMsUUFBSCxDQUFZLG1CQUFaLEVBQWlDLElBQUMsQ0FBQSxXQUFsQyxDQUF0QztJQUVBLFFBQVEsQ0FBQyxLQUFULENBQUE7SUFDQSxRQUFRLENBQUMsTUFBVCxDQUFBO0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQXdCLFFBQXhCLEVBQWtDO01BQUMsQ0FBQSxFQUFFLENBQUg7TUFBTSxDQUFBLEVBQUUsQ0FBUjtLQUFsQyxFQUE4QyxJQUFDLENBQUEsTUFBL0M7SUFFQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVg7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkI7TUFDM0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCLEtBRjdCOztJQUlBLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBaEIsQ0FBbUIsUUFBbkIsRUFBNkIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLE1BQUQ7ZUFDekIsS0FBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BREE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCO1dBR0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBcERpQjs7O0FBc0RyQjs7Ozs7eUNBSUEsb0JBQUEsR0FBc0IsU0FBQTtBQUNsQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFmLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBM0M7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxRQUFBLEdBQVcsS0FBSyxDQUFDLFFBQVMsQ0FBQSxNQUFBO0lBQzFCLElBQU8sZ0JBQVA7QUFBc0IsYUFBdEI7O0lBRUEsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFoQixDQUFxQixRQUFyQixFQUErQixRQUEvQjtJQUNBLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBaEIsR0FBeUI7SUFDekIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQXlCLFFBQXpCLEVBQW1DLElBQUMsQ0FBQSxNQUFwQyxFQUE0QyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsTUFBRDtRQUNwQyxLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFmLENBQW1DLE1BQU0sQ0FBQyxNQUExQztlQUNBLEtBQUssQ0FBQyxRQUFTLENBQUEsTUFBQSxDQUFmLEdBQXlCO01BRlc7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVDO1dBSUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBYmtCOzs7QUFldEI7Ozs7O3lDQUlBLGlCQUFBLEdBQW1CLFNBQUE7QUFDZixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFmLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBM0M7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxRQUFBLEdBQVcsS0FBSyxDQUFDO0lBRWpCLElBQU8sd0JBQVA7TUFDSSxRQUFTLENBQUEsTUFBQSxDQUFULEdBQXVCLElBQUEsRUFBRSxDQUFDLGNBQUgsQ0FBQSxFQUQzQjs7SUFHQSxPQUFBLEdBQVUsUUFBUyxDQUFBLE1BQUE7SUFDbkIsT0FBTyxDQUFDLE1BQVIsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUN6QixPQUFPLENBQUMsSUFBUixHQUFlO01BQUUsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUFYO01BQW1CLFNBQUEsRUFBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQWxELENBQTlCOztBQUVmLFlBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFmO0FBQUEsV0FDUyxDQURUO1FBRVEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFoQixHQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNoQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBaEIsR0FBd0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBaEIsR0FBeUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO0FBSnpDO0FBRFQsV0FNUyxDQU5UO1FBT1EsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFoQixHQUFvQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBdkM7UUFDcEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFoQixHQUFvQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBdkM7UUFDcEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFoQixHQUF3QixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQTVDO1FBQ3hCLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBaEIsR0FBeUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUE1QztBQUp4QjtBQU5ULFdBV1MsQ0FYVDtRQVlRLE9BQUEsR0FBVSxLQUFLLENBQUMsUUFBUyxDQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQW5DLENBQUE7UUFDekIsSUFBRyxlQUFIO1VBQ0ksT0FBTyxDQUFDLE1BQVIsR0FBaUIsUUFEckI7O0FBRkM7QUFYVCxXQWVTLENBZlQ7UUFnQlEsSUFBQSxHQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBbkMsQ0FBQTtRQUNuQixJQUFHLFlBQUg7VUFDSSxPQUFPLENBQUMsTUFBUixHQUFpQixLQURyQjs7QUFqQlI7SUFvQkEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFqQiw2Q0FBeUMsRUFBRSxDQUFDLFlBQVksQ0FBQztJQUV6RCxnQkFBQSxHQUFtQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsT0FBRDtBQUNmLFlBQUE7UUFBQSxzQkFBRyxPQUFPLENBQUUsYUFBWjtBQUNJLGlCQUFPLFFBRFg7U0FBQSxNQUVLLElBQUcsZUFBSDtVQUNELElBQUEsR0FBTyxLQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsT0FBM0I7VUFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBQWUsQ0FBQyxJQUFoQixDQUFBLENBQUEsSUFBMEI7VUFDakMsTUFBQSxHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBWCxDQUFlLENBQUMsS0FBaEIsQ0FBc0IsQ0FBdEIsRUFBeUIsQ0FBQyxDQUExQixDQUE0QixDQUFDLElBQTdCLENBQWtDLEdBQWxDLENBQUEsSUFBMEM7QUFDbkQsaUJBQU87WUFBRSxJQUFBLEVBQU0sSUFBUjtZQUFjLFVBQUEsRUFBWSxNQUExQjtZQUpOO1NBQUEsTUFBQTtBQU1ELGlCQUFPLEtBTk47O01BSFU7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBV25CLElBQUcsWUFBSDtNQUNJLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLEtBRHJCO0tBQUEsTUFBQTtNQUdJLE9BQU8sQ0FBQyxNQUFSLEdBQWlCO1FBQ2IsZ0JBQUEsQ0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUF6QixDQUFBLElBQXlDLG9CQUFJLE9BQU8sQ0FBRSxlQUFaLEdBQXVCO1VBQUUsSUFBQSxFQUFNLE9BQU8sQ0FBQyxLQUFoQjtVQUF1QixVQUFBLEVBQVksT0FBTyxDQUFDLFdBQTNDO1NBQXZCLEdBQXFGLElBQXRGLENBRDVCLEVBRWIsZ0JBQUEsQ0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF6QixDQUZhLEVBR2IsZ0JBQUEsQ0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUF6QixDQUhhLEVBSWIsZ0JBQUEsQ0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBekIsQ0FKYSxFQUtiLGdCQUFBLENBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQXpCLENBTGE7UUFIckI7O0lBWUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBeEIsS0FBZ0MsQ0FBaEMsSUFBcUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQWhFO01BQ0ksT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFmLENBQWtCLE9BQWxCLEVBQTJCLEVBQUUsQ0FBQyxRQUFILENBQVksZ0JBQVosRUFBOEIsSUFBQyxDQUFBLFdBQS9CLEVBQTRDO1FBQUUsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUFYO1FBQW1CLFNBQUEsRUFBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQW5ELENBQTlCO09BQTVDLENBQTNCLEVBREo7O0lBRUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBeEIsS0FBZ0MsQ0FBaEMsSUFBcUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQWhFO01BQ0ksT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFmLENBQWtCLE9BQWxCLEVBQTJCLEVBQUUsQ0FBQyxRQUFILENBQVksZ0JBQVosRUFBOEIsSUFBQyxDQUFBLFdBQS9CLEVBQTRDO1FBQUUsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUFYO1FBQW1CLFNBQUEsRUFBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQW5ELENBQTlCO09BQTVDLENBQTNCLEVBREo7O0lBRUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBeEIsS0FBZ0MsQ0FBaEMsSUFBcUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQWhFO01BQ0ksT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFmLENBQWtCLE9BQWxCLEVBQTJCLEVBQUUsQ0FBQyxRQUFILENBQVksZ0JBQVosRUFBOEIsSUFBQyxDQUFBLFdBQS9CLEVBQTRDO1FBQUUsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUFYO1FBQW1CLFNBQUEsRUFBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQW5ELENBQTlCO09BQTVDLENBQTNCLEVBREo7O0lBRUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBdkIsS0FBK0IsQ0FBL0IsSUFBb0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQTlEO01BQ0ksT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFmLENBQWtCLFdBQWxCLEVBQStCLEVBQUUsQ0FBQyxRQUFILENBQVksb0JBQVosRUFBa0MsSUFBQyxDQUFBLFdBQW5DLEVBQWdEO1FBQUUsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUFYO1FBQW1CLFNBQUEsRUFBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQWxELENBQTlCO09BQWhELENBQS9CO01BQ0EsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFmLENBQWtCLE1BQWxCLEVBQTBCLEVBQUUsQ0FBQyxRQUFILENBQVksZUFBWixFQUE2QixJQUFDLENBQUEsV0FBOUIsRUFBMkM7UUFBRSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BQVg7UUFBbUIsU0FBQSxFQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBbEQsQ0FBOUI7T0FBM0MsQ0FBMUI7TUFDQSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQWYsQ0FBa0IsU0FBbEIsRUFBNkIsRUFBRSxDQUFDLFFBQUgsQ0FBWSxrQkFBWixFQUFnQyxJQUFDLENBQUEsV0FBakMsRUFBOEM7UUFBRSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BQVg7UUFBbUIsU0FBQSxFQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBbEQsQ0FBOUI7T0FBOUMsQ0FBN0IsRUFISjs7SUFJQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUF6QixLQUFpQyxDQUFqQyxJQUFzQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBL0QsSUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBM0IsS0FBbUMsQ0FEbkMsSUFDd0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBRHRFO01BRUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFmLENBQWtCLGNBQWxCLEVBQWtDLEVBQUUsQ0FBQyxRQUFILENBQVksdUJBQVosRUFBcUMsSUFBQyxDQUFBLFdBQXRDLEVBQW1ELElBQUMsQ0FBQSxNQUFwRCxDQUFsQyxFQUZKOztJQUdBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBcEI7TUFDSSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQWYsQ0FBa0IsU0FBbEIsRUFBNkIsRUFBRSxDQUFDLFFBQUgsQ0FBWSxlQUFaLEVBQTZCLElBQUMsQ0FBQSxXQUE5QixFQUEyQztRQUFFLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFBWDtRQUFtQixTQUFBLEVBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFsRCxDQUE5QjtPQUEzQyxDQUE3QixFQURKOztJQUVBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQTlCLEtBQXNDLENBQXRDLElBQTJDLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUE1RTtNQUNJLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBZixDQUFrQixjQUFsQixFQUFrQyxFQUFFLENBQUMsUUFBSCxDQUFZLHVCQUFaLEVBQXFDLElBQUMsQ0FBQSxXQUF0QyxFQUFtRDtRQUFFLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFBWDtRQUFtQixTQUFBLEVBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxTQUF6RCxDQUE5QjtPQUFuRCxDQUFsQyxFQURKOztJQUdBLE9BQU8sQ0FBQyxVQUFSLEdBQXFCO0lBR3JCLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBcEI7TUFDSSxRQUFBLEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQztNQUNuQixPQUFPLENBQUMsU0FBUixHQUFvQjtRQUNoQixJQUFBLEVBQVUsSUFBQSxJQUFBLENBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFuQixFQUFzQixRQUFRLENBQUMsSUFBSSxDQUFDLENBQXBDLEVBQXVDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQTFELEVBQWlFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQXBGLENBRE07UUFFaEIsS0FBQSxFQUFPLFFBQVEsQ0FBQyxVQUZBO1FBR2hCLEtBQUEsRUFBTyxRQUFRLENBQUMsUUFIQTs7TUFLcEIsT0FBTyxDQUFDLFlBQVIsQ0FBeUIsSUFBQSxFQUFFLENBQUMsbUJBQUgsQ0FBQSxDQUF6QjtNQUNBLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBZixDQUFrQixNQUFsQixFQUEwQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtBQUN0QixjQUFBO1VBQUEsSUFBQSxHQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7VUFDaEIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxrQkFBMUIsQ0FBNkMsS0FBQyxDQUFBLFdBQVcsQ0FBQyxPQUExRDtVQUNBLElBQUcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBcEI7bUJBQ0ksS0FBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixLQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUEvQyxFQUF5RCxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBakIsR0FBbUIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUE5QixDQUFBLEdBQW1DLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFWLEdBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWxDLENBQW5DLEdBQThFLEdBQXpGLENBQXpELEVBREo7V0FBQSxNQUFBO21CQUdJLEtBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBL0MsRUFBeUQsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQWpCLEdBQW1CLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBOUIsQ0FBQSxHQUFtQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBVixHQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFuQyxDQUFuQyxHQUFnRixHQUEzRixDQUF6RCxFQUhKOztRQUhzQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUIsRUFSSjs7V0FnQkEsT0FBTyxDQUFDLEtBQVIsQ0FBQTtFQS9GZTs7O0FBZ0duQjs7Ozs7eUNBSUEseUJBQUEsR0FBMkIsU0FBQTtBQUN2QixRQUFBO0lBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQkFBZixDQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQTNDO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsT0FBQSxHQUFVLEtBQUssQ0FBQyxRQUFTLENBQUEsTUFBQTtJQUN6QixJQUFVLENBQUMsT0FBWDtBQUFBLGFBQUE7O0lBRUEsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsUUFBZixDQUFKO01BQWtDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBakIsR0FBNEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBcEMsRUFBOUQ7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsT0FBZixDQUFKO01BQWlDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBakIsR0FBMkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBcEMsRUFBNUQ7O0lBRUEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFqQixDQUFBO1dBQ0EsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFqQixDQUFBO0VBYnVCOzs7QUFlM0I7Ozs7O3lDQUlBLG1CQUFBLEdBQXFCLFNBQUE7QUFDakIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQkFBZixDQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQTNDO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBRVQsSUFBRyw4QkFBSDtNQUNJLEtBQUssQ0FBQyxRQUFTLENBQUEsTUFBQSxDQUFPLENBQUMsT0FBdkIsQ0FBQTthQUNBLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxXQUF2QixDQUFtQyxNQUFuQyxFQUZKOztFQUxpQjs7O0FBU3JCOzs7Ozt5Q0FJQSx5QkFBQSxHQUEyQixTQUFBO1dBQ3ZCLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGtCQUE1QixDQUErQyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUEvQztFQUR1Qjs7O0FBRzNCOzs7Ozt5Q0FJQSxzQkFBQSxHQUF3QixTQUFBO0FBQ3BCLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFFaEMsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsY0FBZixDQUFKO01BQXdDLFFBQVEsQ0FBQyxjQUFULEdBQTBCLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXJDLEVBQWxFOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGlCQUFmLENBQUo7TUFBMkMsUUFBUSxDQUFDLGlCQUFULEdBQTZCLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFyQyxFQUF4RTs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxNQUFmLENBQUo7TUFBZ0MsUUFBUSxDQUFDLE1BQVQsR0FBa0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsRUFBbEQ7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsbUJBQUEsQ0FBZixDQUFKO01BQThDLFFBQVEsQ0FBQyxZQUFULEdBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBOUU7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsc0JBQUEsQ0FBZixDQUFKO01BQWlELFFBQVEsQ0FBQyxlQUFULEdBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQXBGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLHNCQUFBLENBQWYsQ0FBSjtNQUFpRCxRQUFRLENBQUMsZUFBVCxHQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFwRjs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSx5QkFBQSxDQUFmLENBQUo7TUFBb0QsUUFBUSxDQUFDLGtCQUFULEdBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQTFGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLG9CQUFBLENBQWYsQ0FBSjtNQUErQyxRQUFRLENBQUMsVUFBVCxHQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQTdFOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSjthQUFnQyxRQUFRLENBQUMsTUFBVCxHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQTFEOztFQWJvQjs7eUNBZ0J4QixhQUFBLEdBQWUsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNYLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGFBQUQsQ0FBZSxPQUFmO0lBQ1YsT0FBQSxHQUFhLE9BQU8sT0FBUCxLQUFrQixRQUFyQixHQUFtQztNQUFFLElBQUEsRUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVIsQ0FBaUIsT0FBakIsQ0FBUjtNQUFtQyxVQUFBLEVBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFSLENBQWdCLE9BQWhCLENBQS9DO0tBQW5DLEdBQWtIO0lBQzVILFdBQUEsR0FBaUIsaURBQUgsR0FBdUIsT0FBTyxDQUFDLElBQS9CLEdBQXlDO0lBQ3ZELE1BQUEsR0FBUyxlQUFlLENBQUMsU0FBaEIsQ0FBMEIsZUFBZSxDQUFDLE9BQWhCLENBQXdCLE9BQXhCLENBQTFCO0lBQ1QsSUFBZSxNQUFBLElBQVUsQ0FBQyxNQUFNLENBQUMsTUFBakM7QUFBQSxhQUFPLEtBQVA7O0lBRUEsUUFBQSxHQUFXLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDaEMsS0FBQSxHQUFRLE1BQU0sQ0FBQyxVQUFQLElBQXFCO0lBQzdCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixNQUFBLEdBQVMsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsTUFBdEI7SUFDVCxRQUFBLEdBQVcsS0FBSyxDQUFDO0lBQ2pCLE9BQUEsR0FBVSxRQUFTLENBQUEsTUFBQTtJQUVuQixJQUFPLGVBQVA7TUFDSSxPQUFBLEdBQWMsSUFBQSxFQUFFLENBQUMsY0FBSCxDQUFrQixJQUFsQixFQUF3QixJQUF4QixxQ0FBMkMsQ0FBRSxhQUE3QztNQUNkLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLE1BQU0sQ0FBQztNQUN4QixRQUFTLENBQUEsTUFBQSxDQUFULEdBQW1CO0FBQ25CLG1EQUFvQixDQUFFLGFBQXRCO0FBQUEsYUFDUyxDQURUO1VBRVEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBdkIsR0FBa0M7VUFDbEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBdkIsR0FBb0M7QUFGbkM7QUFEVCxhQUlTLENBSlQ7VUFLUSxPQUFPLENBQUMsY0FBUixHQUF5QixNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztVQUM3QyxPQUFPLENBQUMsZUFBUixHQUEwQixNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUY3QztBQUpULGFBT1MsQ0FQVDtVQVFRLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBZixHQUE2QixNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUR6RDtBQVBULGFBU1MsQ0FUVDtVQVVRLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVCxDQUFvQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUF2QztBQURmO0FBVFQsYUFXUyxDQVhUO1VBWVEsUUFBQSxHQUFXLFFBQVEsQ0FBQyxRQUFULENBQUE7VUFFWCxPQUFPLENBQUMsTUFBUixHQUFpQjtVQUNqQixPQUFPLENBQUMsT0FBTyxDQUFDLEtBQWhCLEdBQXdCLFFBQVEsQ0FBQztVQUNqQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQWhCLEdBQXlCLFFBQVEsQ0FBQztVQUNsQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQWhCLENBQW9CLENBQXBCLEVBQXVCLENBQXZCLEVBQTBCLFFBQVEsQ0FBQyxLQUFuQyxFQUEwQyxRQUFRLENBQUMsTUFBbkQ7QUFqQlIsT0FKSjtLQUFBLE1BQUE7TUF1QkksT0FBTyxDQUFDLE1BQVIsR0FBaUIsS0F2QnJCOztJQTBCQSxDQUFBLEdBQUksSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQS9CO0lBQ0osQ0FBQSxHQUFJLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUEvQjtJQUNKLE9BQUEsR0FBVSxRQUFTLENBQUEsTUFBQTtJQUVuQixJQUFHLENBQUMsT0FBTyxDQUFDLE1BQVo7TUFDSSxPQUFPLENBQUMsS0FBUixHQUFnQjtNQUNoQixPQUFPLENBQUMsV0FBUixzQkFBc0IsT0FBTyxDQUFFLG9CQUFULElBQXVCLG9CQUZqRDtLQUFBLE1BQUE7TUFJSSxPQUFPLENBQUMsS0FBUixHQUFnQixLQUpwQjs7SUFNQSxNQUFBLDRDQUEwQixlQUFlLENBQUMsU0FBaEIsQ0FBMEIsZUFBZSxDQUFDLE9BQWhCLENBQXdCLE9BQXhCLENBQTFCO0lBQzFCLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsYUFBQSxDQUFmLENBQUosR0FBd0MsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUE3QixDQUF0QixFQUEwRCxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQXhFLENBQXhDLEdBQTRILEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixRQUFRLENBQUMsWUFBL0I7SUFDckksUUFBQSxHQUFjLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxRQUFmLENBQUosR0FBa0MsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBTSxDQUFDLFFBQXhCLENBQWxDLEdBQXlFLFFBQVEsQ0FBQztJQUM3RixNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSixHQUFnQyxNQUFNLENBQUMsTUFBdkMsR0FBbUQsUUFBUSxDQUFDO0lBQ3JFLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKLEdBQWdDLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLE1BQXRCLENBQWhDLEdBQW1FLFFBQVEsQ0FBQztJQUNyRixTQUFBLEdBQWUsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGdCQUFBLENBQWYsQ0FBSixHQUEyQyxNQUFNLENBQUMsU0FBbEQsR0FBaUUsUUFBUSxDQUFDO0lBRXRGLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDakMsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFoQixJQUF5QjtJQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQWIsZ0RBQXNDLENBQUUsY0FBdEIsSUFBNEI7SUFDOUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFiLGdEQUFzQyxDQUFFLGNBQXRCLElBQTRCO0lBQzlDLE9BQU8sQ0FBQyxTQUFSLEdBQW9CLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBTSxDQUFDLFNBQXRCO0lBRXBCLElBQUcsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBakIsSUFBdUIsZ0JBQTFCO01BQ0ksQ0FBQSxJQUFLLENBQUMsTUFBTSxDQUFDLEtBQVAsR0FBYSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQTFCLEdBQTRCLE1BQU0sQ0FBQyxLQUFwQyxDQUFBLEdBQTJDO01BQ2hELENBQUEsSUFBSyxDQUFDLE1BQU0sQ0FBQyxNQUFQLEdBQWMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUEzQixHQUE2QixNQUFNLENBQUMsTUFBckMsQ0FBQSxHQUE2QyxFQUZ0RDs7SUFJQSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CO0lBQ3BCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBaEIsR0FBb0I7SUFDcEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFmLEdBQXNCLE1BQUEsS0FBVSxDQUFiLEdBQW9CLEdBQXBCLEdBQTZCO0lBQ2hELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBZixHQUFzQixNQUFBLEtBQVUsQ0FBYixHQUFvQixHQUFwQixHQUE2QjtJQUNoRCxPQUFPLENBQUMsTUFBUixHQUFpQixNQUFBLElBQVcsQ0FBQyxHQUFBLEdBQU0sTUFBUDtJQUU1Qiw0Q0FBa0IsQ0FBRSxjQUFqQixLQUF5QixPQUE1QjtNQUNJLE9BQU8sQ0FBQyxRQUFSLEdBQW1CLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBRG5EOztJQUdBLHdDQUFjLENBQUUsY0FBYixLQUFxQixDQUF4QjtNQUNJLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBaEIsR0FBd0IsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQTNCO01BQ3hCLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBaEIsR0FBeUIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQTNCLEVBRjdCOztJQUlBLE9BQU8sQ0FBQyxNQUFSLENBQUE7QUFFQSxXQUFPO0VBbkZJOzs7QUFvRmY7Ozs7O3lDQUlBLGtCQUFBLEdBQW9CLFNBQUE7QUFDaEIsUUFBQTtJQUFBLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUE1QixDQUFnRCxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsSUFBd0IsRUFBeEU7SUFDQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQW5DLEVBQTRDLElBQUMsQ0FBQSxNQUE3QztJQUNWLElBQUcsQ0FBQyxPQUFKO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQjtBQUMzQixhQUpKOztJQU1BLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLEtBQXdCLENBQTNCO01BQ0ksQ0FBQSxHQUFJLElBQUMsQ0FBQSxXQUFXLENBQUMsd0JBQWIsQ0FBc0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBOUMsRUFBb0UsT0FBcEUsRUFBNkUsSUFBQyxDQUFBLE1BQTlFO01BQ0osT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFoQixHQUFvQixDQUFDLENBQUM7TUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFoQixHQUFvQixDQUFDLENBQUMsRUFIMUI7O0lBS0EsTUFBQSxHQUFZLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxhQUFBLENBQWYsQ0FBSixHQUF3QyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQTFDLENBQXRCLEVBQXVFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQXRGLENBQXhDLEdBQTBJLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixRQUFRLENBQUMsWUFBL0I7SUFDbkosUUFBQSxHQUFjLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxRQUFmLENBQUosR0FBa0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckMsQ0FBbEMsR0FBc0YsUUFBUSxDQUFDO0lBQzFHLFNBQUEsR0FBZSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsZ0JBQUEsQ0FBZixDQUFKLEdBQTJDLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbkQsR0FBa0UsUUFBUSxDQUFDO0lBRXZGLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBakIsQ0FBd0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUF4QyxFQUEyQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQTNELEVBQThELFNBQTlELEVBQXlFLE1BQXpFLEVBQWlGLFFBQWpGO0lBRUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLElBQThCLENBQUksQ0FBQyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBQSxDQUFsQixDQUFyQztNQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtNQUN6QixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkIsU0FGL0I7O1dBSUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBM0JnQjs7O0FBNkJwQjs7Ozs7eUNBSUEsMkJBQUEsR0FBNkIsU0FBQTtBQUN6QixRQUFBO0lBQUEsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQTVCLENBQWdELElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixJQUF3QixFQUF4RTtJQUVBLFFBQUEsR0FBVyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ2hDLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsSUFBc0I7SUFDOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUNoQyxPQUFBLEdBQVU7SUFFVixNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGFBQUEsQ0FBZixDQUFKLEdBQXdDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBMUMsQ0FBdEIsRUFBdUUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBdEYsQ0FBeEMsR0FBMEksRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLFFBQVEsQ0FBQyxZQUEvQjtJQUNuSixRQUFBLEdBQWMsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFFBQWYsQ0FBSixHQUFrQyxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFyQyxDQUFsQyxHQUFzRixRQUFRLENBQUM7SUFDMUcsU0FBQSxHQUFlLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxnQkFBQSxDQUFmLENBQUosR0FBMkMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFuRCxHQUFrRSxRQUFRLENBQUM7SUFFdkYsSUFBRywrQkFBSDtNQUNJLE1BQUEsR0FBUyxhQUFhLENBQUMsVUFBVyxDQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUjtNQUNsQyxJQUFHLGNBQUg7UUFDSSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLE1BQU0sQ0FBQyxPQUFsQyxFQUEyQyxJQUFDLENBQUEsTUFBNUM7UUFFVixTQUFBLEdBQVksT0FBTyxDQUFDLGFBQVIsQ0FBc0IsMEJBQXRCO1FBQ1osSUFBRyxpQkFBSDtVQUNJLFNBQVMsQ0FBQyxPQUFWLENBQWtCLE1BQWxCO1VBQ0EsU0FBUyxDQUFDLEtBQVYsQ0FBQSxFQUZKO1NBQUEsTUFBQTtVQUlJLFNBQUEsR0FBZ0IsSUFBQSxFQUFFLENBQUMsd0JBQUgsQ0FBNEIsTUFBNUI7VUFDaEIsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsU0FBckIsRUFMSjs7UUFPQSxTQUFTLENBQUMsTUFBVixDQUFBO1FBRUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsS0FBd0IsQ0FBM0I7VUFDSSxDQUFBLEdBQUksSUFBQyxDQUFBLFdBQVcsQ0FBQyx3QkFBYixDQUFzQyxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUE5QyxFQUFvRSxPQUFwRSxFQUE2RSxJQUFDLENBQUEsTUFBOUU7VUFDSixPQUFPLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CLENBQUMsQ0FBQztVQUN0QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CLENBQUMsQ0FBQyxFQUgxQjs7UUFLQSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQWpCLENBQXdCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBeEMsRUFBMkMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUEzRCxFQUE4RCxTQUE5RCxFQUF5RSxNQUF6RSxFQUFpRixRQUFqRixFQWxCSjtPQUZKO0tBQUEsTUFBQTtNQXVCSSxPQUFBLEdBQVUsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFTLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsQ0FBQTtNQUN0QyxTQUFBLHFCQUFZLE9BQU8sQ0FBRSxhQUFULENBQXVCLDBCQUF2QjtNQUVaLElBQUcsaUJBQUg7UUFDSSxPQUFPLENBQUMsZUFBUixDQUF3QixTQUF4QjtRQUNBLE1BQUEsR0FBUyxlQUFlLENBQUMsU0FBaEIsQ0FBMEIsc0JBQUEsR0FBdUIsT0FBTyxDQUFDLEtBQXpEO1FBQ1QsSUFBRyxjQUFIO1VBQ0ksT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFoQixDQUFvQixDQUFwQixFQUF1QixDQUF2QixFQUEwQixNQUFNLENBQUMsS0FBakMsRUFBd0MsTUFBTSxDQUFDLE1BQS9DO1VBQ0EsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFoQixHQUF3QixPQUFPLENBQUMsT0FBTyxDQUFDO1VBQ3hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBaEIsR0FBeUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUg3QztTQUhKO09BMUJKOztJQWtDQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsSUFBOEIsQ0FBSSxDQUFDLFFBQUEsS0FBWSxDQUFaLElBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBLENBQWxCLENBQXJDO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixTQUYvQjs7V0FJQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFsRHlCOzs7QUFvRDdCOzs7Ozt5Q0FJQSxzQkFBQSxHQUF3QixTQUFBO0FBQ3BCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQWYsQ0FBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUEzQztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULE9BQUEsR0FBVSxLQUFLLENBQUMsUUFBUyxDQUFBLE1BQUE7SUFDekIsSUFBTyxlQUFQO0FBQXFCLGFBQXJCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixPQUE1QixFQUFxQyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQTdDLEVBQW1ELElBQUMsQ0FBQSxNQUFwRDtXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVRvQjs7O0FBV3hCOzs7Ozt5Q0FJQSxrQkFBQSxHQUFvQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQWYsQ0FBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUEzQztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULE9BQUEsR0FBVSxLQUFLLENBQUMsUUFBUyxDQUFBLE1BQUE7SUFDekIsSUFBTyxlQUFQO0FBQXFCLGFBQXJCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixPQUF4QixFQUFpQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFqRCxFQUEyRCxJQUFDLENBQUEsTUFBNUQ7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFUZ0I7OztBQVlwQjs7Ozs7eUNBSUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFmLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixJQUF3QixFQUEzRDtJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULE9BQUEsR0FBVSxLQUFLLENBQUMsUUFBUyxDQUFBLE1BQUE7SUFDekIsSUFBTyxlQUFQO0FBQXFCLGFBQXJCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixPQUF4QixFQUFpQyxJQUFDLENBQUEsTUFBbEM7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFUZ0I7OztBQVdwQjs7Ozs7eUNBSUEsbUJBQUEsR0FBcUIsU0FBQTtBQUNqQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFmLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixJQUF3QixFQUEzRDtJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULE9BQUEsR0FBVSxLQUFLLENBQUMsUUFBUyxDQUFBLE1BQUE7SUFDekIsSUFBTyxlQUFQO0FBQXFCLGFBQXJCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixPQUF6QixFQUFrQyxJQUFDLENBQUEsTUFBbkM7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFUaUI7OztBQVdyQjs7Ozs7eUNBSUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFmLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixJQUF3QixFQUEzRDtJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULE9BQUEsR0FBVSxLQUFLLENBQUMsUUFBUyxDQUFBLE1BQUE7SUFDekIsSUFBTyxlQUFQO0FBQXFCLGFBQXJCOztXQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixPQUF4QixFQUFpQyxJQUFDLENBQUEsTUFBbEM7RUFQZ0I7OztBQVNwQjs7Ozs7eUNBSUEsb0JBQUEsR0FBc0IsU0FBQTtBQUNsQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFmLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixJQUF3QixFQUEzRDtJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULE9BQUEsR0FBVSxLQUFLLENBQUMsUUFBUyxDQUFBLE1BQUE7SUFDekIsSUFBTyxlQUFQO0FBQXFCLGFBQXJCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFBYixDQUEwQixPQUExQixFQUFtQyxJQUFDLENBQUEsTUFBcEM7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFUa0I7OztBQVd0Qjs7Ozs7eUNBSUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFmLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixJQUF3QixFQUEzRDtJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULE9BQUEsR0FBVSxLQUFLLENBQUMsUUFBUyxDQUFBLE1BQUE7SUFDekIsSUFBTyxlQUFQO0FBQXFCLGFBQXJCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixPQUF4QixFQUFpQyxJQUFDLENBQUEsTUFBbEM7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFUZ0I7OztBQVdwQjs7Ozs7eUNBSUEsbUJBQUEsR0FBcUIsU0FBQTtBQUNqQixRQUFBO0lBQUEsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQTVCLENBQWdELElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixJQUF3QixFQUF4RTtJQUNBLE9BQUEsR0FBVSxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVMsQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFBO0lBQ3RDLElBQU8sZUFBUDtBQUFxQixhQUFyQjs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsT0FBekIsRUFBa0MsSUFBQyxDQUFBLE1BQW5DO1dBQ0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBTmlCOzs7QUFRckI7Ozs7O3lDQUlBLG1CQUFBLEdBQXFCLFNBQUE7QUFDakIsUUFBQTtJQUFBLE9BQUEsR0FBVSxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVMsQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFBO0lBQ3RDLElBQU8sZUFBUDtBQUFxQixhQUFyQjs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsT0FBekIsRUFBa0MsSUFBQyxDQUFBLE1BQW5DO1dBQ0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBTGlCOzs7QUFPckI7Ozs7O3lDQUlBLGtCQUFBLEdBQW9CLFNBQUE7QUFDaEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQkFBZixDQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsSUFBd0IsRUFBM0Q7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxPQUFBLEdBQVUsS0FBSyxDQUFDLFFBQVMsQ0FBQSxNQUFBO0lBQ3pCLElBQU8sZUFBUDtBQUFxQixhQUFyQjs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBd0IsT0FBeEIsRUFBaUMsSUFBQyxDQUFBLE1BQWxDO1dBQ0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBUmdCOzs7QUFXcEI7Ozs7O3lDQUlBLHdCQUFBLEdBQTBCLFNBQUE7QUFDdEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQkFBZixDQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsSUFBd0IsRUFBM0Q7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxPQUFBLEdBQVUsS0FBSyxDQUFDLFFBQVMsQ0FBQSxNQUFBO0lBQ3pCLElBQU8sZUFBUDtBQUFxQixhQUFyQjs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLE9BQTlCLEVBQXVDLElBQUMsQ0FBQSxNQUF4QztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVRzQjs7O0FBVzFCOzs7Ozt5Q0FJQSxvQkFBQSxHQUFzQixTQUFBO0FBQ2xCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQWYsQ0FBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLElBQXdCLEVBQTNEO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsT0FBQSxHQUFVLEtBQUssQ0FBQyxRQUFTLENBQUEsTUFBQTtJQUN6QixJQUFPLGVBQVA7QUFBcUIsYUFBckI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLE9BQTFCLEVBQW1DLElBQUMsQ0FBQSxNQUFwQztXQUNBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVJrQjs7O0FBVXRCOzs7Ozt5Q0FJQSxtQkFBQSxHQUFxQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFFaEMsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFmLENBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixJQUF3QixFQUEzRDtJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULE9BQUEsR0FBVSxLQUFLLENBQUMsUUFBUyxDQUFBLE1BQUE7SUFDekIsSUFBTyxlQUFQO0FBQXFCLGFBQXJCOztJQUVBLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsYUFBQSxDQUFmLENBQUosR0FBd0MsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUExQyxDQUF0QixFQUF1RSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUF0RixDQUF4QyxHQUEwSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsUUFBUSxDQUFDLGVBQS9CO0lBQ25KLFFBQUEsR0FBYyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsUUFBZixDQUFKLEdBQWtDLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDLENBQWxDLEdBQXNGLFFBQVEsQ0FBQztJQUMxRyxTQUFBLEdBQWUsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGdCQUFBLENBQWYsQ0FBSixHQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5ELEdBQWtFLFFBQVEsQ0FBQztJQUV2RixPQUFPLENBQUMsUUFBUSxDQUFDLFNBQWpCLENBQTJCLFNBQTNCLEVBQXNDLE1BQXRDLEVBQThDLFFBQTlDLEVBQ0ksQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLE1BQUQ7UUFDSSxNQUFNLENBQUMsT0FBUCxDQUFBO1FBQ0EsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQkFBZixDQUFtQyxNQUFNLENBQUMsTUFBMUM7ZUFDQSxLQUFLLENBQUMsUUFBUyxDQUFBLE1BQUEsQ0FBZixHQUF5QjtNQUg3QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FESjtJQU9BLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixJQUE4QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUEsQ0FBbEIsQ0FBckM7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7TUFDekIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLEdBQTJCLFNBRi9COztXQUlBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQTFCaUI7OztBQTZCckI7Ozs7O3lDQUlBLGtCQUFBLEdBQW9CLFNBQUE7QUFDaEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO0lBQ3pCLElBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxpQ0FBYixDQUFBLENBQUg7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQTtBQUNBLGFBRko7O0lBSUEsSUFBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsZUFBckIsSUFBc0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFwRCxDQUFBLElBQWlFLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBN0Y7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7TUFDekIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUEsQ0FBNEIsQ0FBQyxRQUFRLENBQUMsS0FBdEMsQ0FBQTtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUF0QyxFQUFnRCxDQUFoRDtBQUNBLGFBSko7O0lBTUEsV0FBVyxDQUFDLE1BQVosR0FBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUM3QixLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWYsQ0FBK0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUF2QyxFQUErQyxFQUFFLENBQUMsUUFBSCxDQUFZLHFCQUFaLEVBQW1DLElBQUMsQ0FBQSxXQUFwQyxFQUFpRCxJQUFDLENBQUEsTUFBbEQsQ0FBL0M7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLFVBQVUsQ0FBQyxXQUF4QixHQUFzQyxJQUFDLENBQUE7V0FDdkMsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBakJnQjs7O0FBbUJwQjs7Ozs7eUNBSUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUVyQixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBWDthQUNJLEtBQUssQ0FBQyxRQUFRLENBQUMsZUFBZixDQUErQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFuQyxDQUEvQixFQUE0RSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFuQyxDQUE1RSxFQURKO0tBQUEsTUFBQTthQUdJLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBbEIsQ0FBQSxFQUhKOztFQUhnQjs7O0FBUXBCOzs7Ozt5Q0FJQSxrQkFBQSxHQUFvQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDO0lBQ3ZCLE9BQUEsR0FBVSxLQUFLLENBQUMsT0FBTixJQUFpQjtJQUUzQixJQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxlQUFyQixJQUFzQyxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQXBELENBQUEsSUFBcUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFqRztNQUNJLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUE7TUFDaEIsNEJBQUcsYUFBYSxDQUFFLGdCQUFsQjtRQUNJLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBdkIsQ0FBQSxFQURKOztNQUVBLGFBQUEsR0FBZ0IsQ0FBQyxPQUFPLENBQUMsS0FBUixDQUFjLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQztNQUFULENBQWQsQ0FBRCxDQUFBLElBQXVDLE9BQVEsQ0FBQSxDQUFBO01BQy9ELElBQUcsdUNBQUg7UUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsR0FBdUIsYUFBYSxDQUFDLE1BQU0sQ0FBQyxXQURoRDtPQUFBLE1BQUE7UUFHSSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUIsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUE5QyxFQUhKOztNQUlBLEtBQUssQ0FBQyxPQUFOLEdBQWdCLEdBVHBCO0tBQUEsTUFBQTtNQVdJLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7UUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7UUFDekIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFmLENBQTJCLEVBQUUsQ0FBQyxRQUFILENBQVksZ0JBQVosRUFBOEIsSUFBQyxDQUFBLFdBQS9CLEVBQTRDO1VBQUUsT0FBQSxFQUFTLE9BQVg7VUFBb0IsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUE3QjtTQUE1QyxDQUEzQixFQUZKO09BWEo7O1dBZUEsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBcEJnQjs7O0FBc0JwQjs7Ozs7eUNBSUEsaUJBQUEsR0FBbUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQztJQUMvQixPQUFBLEdBQVU7SUFDVixLQUFBLEdBQVE7SUFDUixPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQztJQUN2QixPQUFBLEdBQVU7SUFDVixPQUFBLEdBQVU7QUFFVixZQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBZjtBQUFBLFdBQ1MsQ0FEVDtRQUVRLE9BQUEsR0FBVTtBQURUO0FBRFQsV0FHUyxDQUhUO1FBSVEsT0FBQSxHQUFjLElBQUEsSUFBQSxDQUFLLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQWpCLEVBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQWhDLEVBQW1DLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFwRCxFQUEyRCxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBNUU7QUFKdEI7SUFNQSxJQUFHLENBQUMsS0FBSyxDQUFDLE9BQVY7TUFDSSxLQUFLLENBQUMsT0FBTixHQUFnQixHQURwQjs7SUFFQSxPQUFBLEdBQVUsS0FBSyxDQUFDO1dBQ2hCLE9BQU8sQ0FBQyxJQUFSLENBQWE7TUFDVCxPQUFBLEVBQVMsT0FEQTtNQUdULFdBQUEsRUFBYSxJQUFDLENBQUEsV0FITDtNQUlULElBQUEsRUFBTSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFuQyxDQUpHO01BS1QsS0FBQSxFQUFPLEtBTEU7TUFNVCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQU5QO01BT1QsVUFBQSxFQUFZLEtBUEg7TUFRVCxTQUFBLEVBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQVJWO01BU1QsU0FBQSxFQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQXBDLENBVEY7S0FBYjtFQWxCZTs7O0FBNkJuQjs7Ozs7eUNBSUEsZUFBQSxHQUFpQixTQUFBO0lBQ2IsWUFBWSxDQUFDLFFBQWIsQ0FBMEIsSUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixZQUFqQixDQUExQixFQUEwRCxJQUExRDtJQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQjtXQUMzQixJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7RUFIWjs7O0FBS2pCOzs7Ozt5Q0FJQSxtQkFBQSxHQUFxQixTQUFBO0lBQ2pCLFlBQVksQ0FBQyxRQUFiLENBQTBCLElBQUEsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsZ0JBQWpCLENBQTFCLEVBQThELElBQTlEO0lBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLEdBQTJCO1dBQzNCLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtFQUhSOzs7QUFLckI7Ozs7O3lDQUlBLG1CQUFBLEdBQXFCLFNBQUE7SUFDakIsWUFBWSxDQUFDLFFBQWIsQ0FBMEIsSUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixnQkFBakIsQ0FBMUIsRUFBOEQsSUFBOUQ7SUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkI7V0FDM0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO0VBSFI7OztBQUtyQjs7Ozs7eUNBSUEsb0JBQUEsR0FBc0IsU0FBQTtJQUNsQixZQUFZLENBQUMsS0FBYixDQUFBO0lBQ0EsWUFBWSxDQUFDLFFBQWIsQ0FBMEIsSUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixhQUFqQixDQUExQjtJQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQjtXQUMzQixJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7RUFKUDs7O0FBT3RCOzs7Ozt5Q0FJQSxnQkFBQSxHQUFrQixTQUFBO0FBQ2QsUUFBQTtJQUFBLElBQUcsQ0FBQyxXQUFXLENBQUMsYUFBWixJQUE2QixXQUFXLENBQUMsUUFBUSxDQUFDLGNBQW5ELENBQUEsSUFBdUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFuRztBQUE2RyxhQUE3Rzs7SUFFQSxXQUFXLENBQUMsWUFBWSxDQUFDLElBQXpCLEdBQWdDO0lBQ2hDLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFFckIsSUFBRywrREFBSDtNQUNJLEtBQUssQ0FBQyxLQUFOLEdBQWMsZUFBZSxDQUFDLFFBQWhCLENBQXlCLGVBQWUsQ0FBQyxPQUFoQixDQUF3QixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQWhDLENBQXpCO01BRWQsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxNQUFBLENBQU8sUUFBUSxDQUFDLFFBQWhCO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUEyQixJQUFBLElBQUEsQ0FBSyxDQUFMLEVBQVEsQ0FBUixFQUFXLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBdkIsRUFBOEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUExQztNQUMzQixJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsR0FBcUIsS0FBSyxDQUFDO01BQzNCLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixHQUFxQixRQUFRLENBQUMsS0FBVCxHQUFpQixLQUFLLENBQUMsS0FBSyxDQUFDO01BQ2xELElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixHQUFxQixRQUFRLENBQUMsTUFBVCxHQUFrQixLQUFLLENBQUMsS0FBSyxDQUFDO01BQ25ELElBQUMsQ0FBQSxXQUFXLENBQUMsQ0FBYixHQUFpQjtNQUNqQixLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVosR0FBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2xCLEtBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtVQUN6QixLQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtpQkFDQSxLQUFLLENBQUMsS0FBTixHQUFjO1FBSEk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BSXRCLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBWixHQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUI7TUFDdEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFaLEdBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixHQUF1QjtNQUNsRCxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7TUFDekIsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFaLENBQUEsRUFoQko7O1dBaUJBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQXZCYzs7O0FBd0JsQjs7Ozs7eUNBSUEsb0JBQUEsR0FBc0IsU0FBQTtBQUNsQixRQUFBO0lBQUEsUUFBQSxHQUFXLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDaEMsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBRWhDLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLG1CQUFmLENBQUo7TUFBNkMsUUFBUSxDQUFDLG1CQUFULEdBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQXBGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLG9CQUFmLENBQUo7TUFBOEMsUUFBUSxDQUFDLG9CQUFULEdBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQXRGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFdBQWYsQ0FBSjtNQUFxQyxRQUFRLENBQUMsV0FBVCxHQUF1QixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXBFOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGlCQUFmLENBQUo7TUFBMkMsUUFBUSxDQUFDLGlCQUFULEdBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQWhGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFdBQWYsQ0FBSjtNQUFxQyxRQUFRLENBQUMsV0FBVCxHQUF1QixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXBFOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGlCQUFmLENBQUo7TUFBMkMsUUFBUSxDQUFDLGlCQUFULEdBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQWhGOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFdBQWYsQ0FBSjtNQUFxQyxRQUFRLENBQUMsV0FBVCxHQUF1QixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXBFOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGlCQUFmLENBQUo7YUFBMkMsUUFBUSxDQUFDLGlCQUFULEdBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQWhGOztFQVprQjs7O0FBY3RCOzs7Ozt5Q0FJQSxnQkFBQSxHQUFrQixTQUFBO0FBQ2QsUUFBQTtJQUFBLElBQU8seUJBQVA7QUFBMkIsYUFBM0I7O0lBQ0EsUUFBQSxHQUFXLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDaEMsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLEtBQUEsR0FBUTtJQUVSLElBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUF4QjtNQUNJLFlBQUEsR0FBa0IsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGNBQWYsQ0FBSixHQUF3QyxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQWhELEdBQW9FLFFBQVEsQ0FBQztNQUM1RixNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGNBQUEsQ0FBZixDQUFKLEdBQXlDLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQXZELEdBQW1FLFFBQVEsQ0FBQztNQUNyRixZQUFBLEdBQWtCLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxvQkFBQSxDQUFmLENBQUosR0FBK0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBN0QsR0FBK0UsUUFBUSxDQUFDO01BQ3ZHLEtBQUEsR0FBUTtRQUFFLElBQUEsRUFBTSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUF0QjtRQUE0QixVQUFBLEVBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBdEQ7UUFBa0UsTUFBQSxFQUFRLE1BQTFFO1FBQWtGLFlBQUEsRUFBYyxZQUFoRzs7TUFDUixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixLQUFvQixDQUF2QjtRQUNJLFFBQUEsR0FBVztVQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFqQixHQUF1QixFQUE1QjtVQUFnQyxHQUFBLEVBQUssSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBakIsR0FBdUIsRUFBNUQ7O1FBQ1gsU0FBQSxHQUFZO1VBQUEsS0FBQSxFQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQWxCLEdBQTBCLEVBQWpDO1VBQXFDLEdBQUEsRUFBSyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFsQixHQUF3QixFQUFsRTs7UUFDWixZQUFZLENBQUMsZUFBYixDQUE2QixLQUE3QixFQUFvQyxZQUFwQyxFQUFrRCxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsSUFBaUIsQ0FBbkUsRUFBc0UsUUFBdEUsRUFBZ0YsU0FBaEYsRUFISjtPQUFBLE1BQUE7UUFLSSxLQUFBLEdBQVEsWUFBWSxDQUFDLFNBQWIsQ0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUEvQixFQUFzQyxNQUF0QyxFQUE4QyxZQUE5QyxFQUE0RCxZQUE1RCxFQUEwRSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsSUFBaUIsQ0FBM0YsRUFBOEYsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUF0RyxFQUxaO09BTEo7O0lBWUEsSUFBRyxLQUFBLElBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBbEIsSUFBd0MsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQXBEO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO01BQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUssQ0FBQyxRQUFOLEdBQWlCLFFBQVEsQ0FBQyxTQUFyQyxFQUYvQjs7V0FJQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUF2QmM7OztBQXdCbEI7Ozs7O3lDQUlBLGdCQUFBLEdBQWtCLFNBQUE7QUFDZCxRQUFBO0lBQUEsUUFBQSxHQUFXLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDaEMsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLFlBQUEsR0FBa0IsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGVBQWYsQ0FBSixHQUF5QyxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQWpELEdBQXNFLFFBQVEsQ0FBQztJQUU5RixZQUFZLENBQUMsU0FBYixDQUF1QixZQUF2QixFQUFxQyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQyxDQUFyQztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVJjOzs7QUFTbEI7Ozs7O3lDQUlBLGlCQUFBLEdBQW1CLFNBQUE7QUFDZixRQUFBO0lBQUEsUUFBQSxHQUFXLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDaEMsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLFlBQUEsR0FBa0IsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGVBQWYsQ0FBSixHQUF5QyxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQWpELEdBQXNFLFFBQVEsQ0FBQztXQUU5RixZQUFZLENBQUMsU0FBYixDQUF1QixZQUF2QixFQUFxQyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQyxDQUFyQztFQU5lOzs7QUFRbkI7Ozs7O3lDQUlBLGtCQUFBLEdBQW9CLFNBQUE7QUFDaEIsUUFBQTtJQUFBLFFBQUEsR0FBVyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ2hDLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsSUFBc0I7SUFDOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUNoQyxZQUFBLEdBQWtCLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxjQUFmLENBQUosR0FBd0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFoRCxHQUFvRSxRQUFRLENBQUM7SUFFNUYsWUFBWSxDQUFDLFdBQWIsQ0FBeUIsWUFBekIsRUFBdUMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBbkMsQ0FBdkM7V0FDQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFQZ0I7OztBQVFwQjs7Ozs7eUNBSUEsZ0JBQUEsR0FBa0IsU0FBQTtBQUNkLFFBQUE7SUFBQSxRQUFBLEdBQVcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0lBQzlCLFFBQUEsR0FBVyxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDaEMsS0FBQSxHQUFRO0lBQ1IsSUFBRyxXQUFXLENBQUMsUUFBUSxDQUFDLFlBQXJCLElBQXNDLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFuRTtNQUNJLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsY0FBQSxDQUFmLENBQUosR0FBeUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBdkQsR0FBbUUsUUFBUSxDQUFDO01BQ3JGLFlBQUEsR0FBa0IsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLG9CQUFBLENBQWYsQ0FBSixHQUErQyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUE3RCxHQUErRSxRQUFRLENBQUM7TUFFdkcsS0FBQSxHQUFRLFlBQVksQ0FBQyxTQUFiLENBQXVCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBL0IsRUFBc0MsTUFBdEMsRUFBOEMsWUFBOUMsRUFBNEQsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwRSxFQUFpRixJQUFqRixFQUF1RixJQUFDLENBQUEsTUFBTSxDQUFDLElBQS9GLEVBSlo7O0lBS0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0lBQ0EsSUFBRyxLQUFBLElBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBbEIsSUFBd0MsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQXBEO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO2FBQ3pCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixHQUEyQixJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUssQ0FBQyxRQUFOLEdBQWlCLFFBQVEsQ0FBQyxTQUFyQyxFQUYvQjs7RUFYYzs7O0FBY2xCOzs7Ozt5Q0FJQSxnQkFBQSxHQUFrQixTQUFBO0lBQ2QsWUFBWSxDQUFDLFNBQWIsQ0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBckM7V0FDQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFGYzs7O0FBR2xCOzs7Ozt5Q0FJQSxxQkFBQSxHQUF1QixTQUFBO0FBQ25CLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBbkM7SUFDVixLQUFBLEdBQVEsV0FBVyxDQUFDLFlBQWEsQ0FBQSxPQUFBOzJCQUNqQyxLQUFLLENBQUUsUUFBUSxDQUFDLElBQWhCLENBQUE7RUFIbUI7OztBQUt2Qjs7Ozs7eUNBSUEsd0JBQUEsR0FBMEIsU0FBQTtBQUN0QixRQUFBO0lBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQW5DO0lBQ1YsS0FBQSxHQUFRLFdBQVcsQ0FBQyxZQUFhLENBQUEsT0FBQTsyQkFDakMsS0FBSyxDQUFFLFFBQVEsQ0FBQyxNQUFoQixDQUFBO0VBSHNCOzs7QUFLMUI7Ozs7O3lDQUlBLHNCQUFBLEdBQXdCLFNBQUE7QUFDcEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsT0FBQSxHQUFVO0lBRVYsSUFBRyx1Q0FBSDtNQUNJLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFuQztNQUNWLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBcEQ7TUFDUCxNQUFBLEdBQVM7UUFBRSxNQUFBLEVBQVEsSUFBVjtRQUhiO0tBQUEsTUFBQTtNQUtJLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDO01BQ2pCLE9BQUEsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBTnRCOztXQVFBLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixPQUE3QixFQUFzQyxNQUF0QztFQVpvQjs7O0FBZXhCOzs7Ozt5Q0FJQSx5QkFBQSxHQUEyQixTQUFBO0FBQ3ZCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF4QztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULEtBQUEsR0FBUSxLQUFLLENBQUM7SUFDZCxJQUFPLHFCQUFQO01BQ0ksS0FBTSxDQUFBLE1BQUEsQ0FBTixHQUFvQixJQUFBLEVBQUUsQ0FBQyxXQUFILENBQUE7TUFDcEIsS0FBTSxDQUFBLE1BQUEsQ0FBTyxDQUFDLE9BQWQsR0FBd0IsTUFGNUI7O0lBS0EsVUFBQSxHQUFhLEtBQU0sQ0FBQSxNQUFBO0lBQ25CLE9BQUEsR0FBVSxVQUFVLENBQUMsUUFBUSxDQUFDO0lBQzlCLElBQUEsR0FBTyxVQUFVLENBQUM7SUFDbEIsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQTNDO0lBQ1gsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQTNDO0lBQ1gsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFdBQWYsQ0FBSjtNQUFxQyxVQUFVLENBQUMsWUFBWSxDQUFDLFdBQXhCLG1EQUE0RCxVQUFVLENBQUMsWUFBWSxDQUFDLFlBQXpIOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLElBQWYsQ0FBSjtNQUE4QixRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBbkMsRUFBekM7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsSUFBZixDQUFKO01BQThCLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFuQyxFQUF6Qzs7SUFFQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxJQUFmLENBQUQsSUFBeUIsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLElBQWYsQ0FBN0I7TUFDSSxVQUFVLENBQUMsSUFBWCxHQUFzQixJQUFBLElBQUEsQ0FBSyxRQUFMLEVBQWUsUUFBZixFQUQxQjs7SUFHQSxPQUFPLENBQUMsSUFBUixHQUFrQixDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsV0FBQSxDQUFmLENBQUosOENBQXVELENBQUEsQ0FBQSxVQUF2RCxHQUErRCxPQUFPLENBQUM7SUFDdEYsT0FBTyxDQUFDLEdBQVIsR0FBaUIsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLFdBQUEsQ0FBZixDQUFKLDhDQUF1RCxDQUFBLENBQUEsVUFBdkQsR0FBK0QsT0FBTyxDQUFDO0lBQ3JGLE9BQU8sQ0FBQyxLQUFSLEdBQW1CLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxXQUFBLENBQWYsQ0FBSiw4Q0FBdUQsQ0FBQSxDQUFBLFVBQXZELEdBQStELE9BQU8sQ0FBQztJQUN2RixPQUFPLENBQUMsTUFBUixHQUFvQixDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsV0FBQSxDQUFmLENBQUosOENBQXVELENBQUEsQ0FBQSxVQUF2RCxHQUErRCxPQUFPLENBQUM7SUFFeEYsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsSUFBZixDQUFKO01BQ0ksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFoQixHQUF1QixJQUFDLENBQUEsTUFBTSxDQUFDLEtBRG5DOztJQUVBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBSjtNQUNJLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBaEIsR0FBeUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQURyQzs7SUFFQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxTQUFmLENBQUo7TUFDSSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQWhCLEdBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFEeEM7O0lBRUEsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsU0FBZixDQUFKO01BQ0ksVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFoQixHQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFVBRHhDOztJQUVBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGFBQWYsQ0FBSjtNQUNJLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBaEIsR0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUQ1Qzs7SUFHQSxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQWhCLEdBQTJCLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxLQUFmLENBQUosR0FBbUMsSUFBQSxLQUFBLENBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFkLENBQW5DLEdBQTZELElBQUksQ0FBQztJQUMxRixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQWhCLEdBQTRCLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxPQUFmLENBQUosR0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUF4QyxHQUFxRCxJQUFJLENBQUM7SUFDbkYsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFoQixHQUFpQyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsWUFBZixDQUFKLEdBQTBDLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBZCxDQUExQyxHQUErRSxJQUFBLEtBQUEsQ0FBTSxJQUFJLENBQUMsV0FBWDtJQUM3RyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQWhCLEdBQWdDLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxXQUFmLENBQUosR0FBcUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUE3QyxHQUE4RCxJQUFJLENBQUM7SUFDaEcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFoQixHQUE0QixDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKLEdBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBdkMsR0FBbUQsSUFBSSxDQUFDO0lBQ2pGLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBaEIsR0FBaUMsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFdBQWYsQ0FBSixHQUF5QyxJQUFBLEtBQUEsQ0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQWQsQ0FBekMsR0FBNkUsSUFBQSxLQUFBLENBQU0sSUFBSSxDQUFDLFdBQVg7SUFDM0csVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFoQixHQUFtQyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsYUFBZixDQUFKLEdBQXVDLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBL0MsR0FBa0UsSUFBSSxDQUFDO0lBQ3ZHLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBaEIsR0FBbUMsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGFBQWYsQ0FBSixHQUF1QyxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQS9DLEdBQWtFLElBQUksQ0FBQztJQUN2RyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQXBCLENBQUE7V0FDQSxVQUFVLENBQUMsTUFBWCxDQUFBO0VBakR1Qjs7O0FBbUQzQjs7Ozs7eUNBSUEsbUJBQUEsR0FBcUIsU0FBQTtBQUNqQixRQUFBO0lBQUEsUUFBQSxHQUFXLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDaEMsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtJQUM5QixRQUFBLEdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBRWhDLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGNBQWYsQ0FBSjtNQUF3QyxRQUFRLENBQUMsY0FBVCxHQUEwQixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFyQyxFQUFsRTs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxpQkFBZixDQUFKO01BQTJDLFFBQVEsQ0FBQyxpQkFBVCxHQUE2QixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBckMsRUFBeEU7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFKO01BQWdDLFFBQVEsQ0FBQyxNQUFULEdBQWtCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DLEVBQWxEOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLG1CQUFBLENBQWYsQ0FBSjtNQUE4QyxRQUFRLENBQUMsWUFBVCxHQUF3QixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQTlFOztJQUNBLElBQUcsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLHNCQUFBLENBQWYsQ0FBSjtNQUFpRCxRQUFRLENBQUMsZUFBVCxHQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFwRjs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxzQkFBQSxDQUFmLENBQUo7TUFBaUQsUUFBUSxDQUFDLGVBQVQsR0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBcEY7O0lBQ0EsSUFBRyxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEseUJBQUEsQ0FBZixDQUFKO01BQW9ELFFBQVEsQ0FBQyxrQkFBVCxHQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUExRjs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQU0sQ0FBQSxvQkFBQSxDQUFmLENBQUo7TUFBK0MsUUFBUSxDQUFDLFVBQVQsR0FBc0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUE3RTs7SUFDQSxJQUFHLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxNQUFmLENBQUo7YUFBZ0MsUUFBUSxDQUFDLE1BQVQsR0FBa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUExRDs7RUFiaUI7OztBQWVyQjs7Ozs7eUNBSUEsZUFBQSxHQUFpQixTQUFBO0FBQ2IsUUFBQTtJQUFBLFFBQUEsR0FBVyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ2hDLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsSUFBc0I7SUFDOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUNoQyxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF4QztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDO0lBQ2YsS0FBQSxHQUFRLEtBQUssQ0FBQztJQUNkLElBQU8scUJBQVA7TUFBMkIsS0FBTSxDQUFBLE1BQUEsQ0FBTixHQUFvQixJQUFBLEVBQUUsQ0FBQyxXQUFILENBQUEsRUFBL0M7O0lBRUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUE1QztJQUNKLENBQUEsR0FBSSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBNUM7SUFDSixVQUFBLEdBQWEsS0FBTSxDQUFBLE1BQUE7SUFDbkIsVUFBVSxDQUFDLE1BQVgsR0FBb0IsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUU1QixNQUFBLEdBQVksQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGFBQUEsQ0FBZixDQUFKLEdBQXdDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBWCxDQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBMUMsQ0FBdEIsRUFBdUUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBdEYsQ0FBeEMsR0FBMEksRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLFFBQVEsQ0FBQyxZQUEvQjtJQUNuSixRQUFBLEdBQWMsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLFFBQWYsQ0FBSixHQUFrQyxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFyQyxDQUFsQyxHQUFzRixRQUFRLENBQUM7SUFDMUcsTUFBQSxHQUFZLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxNQUFmLENBQUosR0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUF4QyxHQUFvRCxRQUFRLENBQUM7SUFDdEUsTUFBQSxHQUFZLENBQUMsUUFBQSxDQUFTLEtBQUssQ0FBQyxNQUFmLENBQUosR0FBZ0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsQ0FBaEMsR0FBZ0YsUUFBUSxDQUFDO0lBQ2xHLFNBQUEsR0FBZSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsZ0JBQUEsQ0FBZixDQUFKLEdBQTJDLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbkQsR0FBa0UsUUFBUSxDQUFDO0lBQ3ZGLGNBQUEsR0FBb0IsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLGNBQWYsQ0FBSixHQUF3QyxJQUFDLENBQUEsV0FBVyxDQUFDLDZCQUE4QixDQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUEzQyxJQUEwRSxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsQ0FBVCxFQUFZLENBQVosQ0FBbEgsR0FBc0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyw2QkFBOEIsQ0FBQSxRQUFRLENBQUMsY0FBVDtJQUVsTSxVQUFVLENBQUMsSUFBWCxHQUFrQjtJQUNsQixVQUFVLENBQUMsT0FBTyxDQUFDLENBQW5CLEdBQXVCO0lBQ3ZCLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBbkIsR0FBdUI7SUFDdkIsVUFBVSxDQUFDLFNBQVgsR0FBdUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbkM7SUFDdkIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFsQixHQUF5QixNQUFBLEtBQVUsQ0FBYixHQUFvQixDQUFwQixHQUEyQjtJQUNqRCxVQUFVLENBQUMsTUFBTSxDQUFDLENBQWxCLEdBQXlCLE1BQUEsS0FBVSxDQUFiLEdBQW9CLENBQXBCLEdBQTJCO0lBQ2pELFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBMUIsR0FBOEIsY0FBYyxDQUFDO0lBQzdDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBMUIsR0FBOEIsY0FBYyxDQUFDO0lBQzdDLFVBQVUsQ0FBQyxNQUFYLEdBQW9CLE1BQUEsSUFBVyxDQUFDLEdBQUEsR0FBTSxNQUFQO0lBQy9CLFVBQVUsQ0FBQyxTQUFYLEdBQXVCO0lBQ3ZCLFVBQVUsQ0FBQyxVQUFYLEdBQXdCO0lBQ3hCLCtDQUFtQixDQUFFLGNBQWxCLEtBQTBCLE9BQTdCO01BQ0ksVUFBVSxDQUFDLFFBQVgsR0FBc0IsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FEdEQ7O0lBRUEsVUFBVSxDQUFDLE1BQVgsQ0FBQTtJQUVBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLEtBQXdCLENBQTNCO01BQ0ksQ0FBQSxHQUFJLElBQUMsQ0FBQSxXQUFXLENBQUMsd0JBQWIsQ0FBc0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBOUMsRUFBb0UsVUFBcEUsRUFBZ0YsSUFBQyxDQUFBLE1BQWpGO01BQ0osVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFuQixHQUF1QixDQUFDLENBQUM7TUFDekIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFuQixHQUF1QixDQUFDLENBQUMsRUFIN0I7O0lBS0EsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFwQixDQUEyQixDQUEzQixFQUE4QixDQUE5QixFQUFpQyxTQUFqQyxFQUE0QyxNQUE1QyxFQUFvRCxRQUFwRDtJQUVBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixJQUE4QixDQUFJLENBQUMsUUFBQSxLQUFZLENBQVosSUFBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQUEsQ0FBbEIsQ0FBckM7TUFDSSxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsR0FBeUI7TUFDekIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLEdBQTJCLFNBRi9COztXQUlBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQWpEYTs7O0FBa0RqQjs7Ozs7eUNBSUEscUJBQUEsR0FBdUIsU0FBQTtBQUNuQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFmLENBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBeEM7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxJQUFBLEdBQU8sS0FBSyxDQUFDLEtBQU0sQ0FBQSxNQUFBO0lBQ25CLElBQU8sWUFBUDtBQUFrQixhQUFsQjs7V0FFQSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQWhCLENBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBNUI7RUFQbUI7OztBQVN2Qjs7Ozs7eUNBSUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFmLENBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBeEM7SUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkM7SUFDVCxLQUFBLEdBQVEsS0FBSyxDQUFDO0lBQ2QsSUFBTyxxQkFBUDtBQUEyQixhQUEzQjs7V0FFQSxLQUFNLENBQUEsTUFBQSxDQUFPLENBQUMsUUFBUSxDQUFDLE9BQXZCLENBQStCLElBQS9CO0VBUGdCOzs7QUFTcEI7Ozs7O3lDQUlBLGVBQUEsR0FBaUIsU0FBQTtBQUNiLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF4QztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULElBQUEsR0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLE1BQUE7SUFDbkIsSUFBTyxZQUFQO0FBQWtCLGFBQWxCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixJQUF4QixFQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUE5QyxFQUF3RCxJQUFDLENBQUEsTUFBekQ7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFUYTs7O0FBVWpCOzs7Ozt5Q0FJQSxtQkFBQSxHQUFxQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF4QztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULElBQUEsR0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLE1BQUE7SUFDbkIsSUFBTyxZQUFQO0FBQWtCLGFBQWxCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUE1QixFQUFrQyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQTFDLEVBQWdELElBQUMsQ0FBQSxNQUFqRDtXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVRpQjs7O0FBVXJCOzs7Ozt5Q0FJQSxpQkFBQSxHQUFtQixTQUFBO0FBQ2YsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZixDQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXhDO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsSUFBQSxHQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsTUFBQTtJQUNuQixJQUFPLFlBQVA7QUFBa0IsYUFBbEI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLElBQTFCLEVBQWdDLElBQUMsQ0FBQSxNQUFqQztXQUVBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVRlOzs7QUFVbkI7Ozs7O3lDQUlBLGVBQUEsR0FBaUIsU0FBQTtBQUNiLFFBQUE7SUFBQSxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF4QztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULElBQUEsR0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLE1BQUE7SUFDbkIsSUFBTyxZQUFQO0FBQWtCLGFBQWxCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUF3QixJQUF4QixFQUE4QixJQUFDLENBQUEsTUFBL0I7V0FFQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFUYTs7O0FBV2pCOzs7Ozt5Q0FJQSxnQkFBQSxHQUFrQixTQUFBO0FBQ2QsUUFBQTtJQUFBLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUE1QixDQUE2QyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXJEO0lBQ0EsSUFBQSxHQUFPLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBTSxDQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DLENBQUE7SUFDaEMsSUFBTyxZQUFQO0FBQWtCLGFBQWxCOztJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixJQUF6QixFQUErQixJQUFDLENBQUEsTUFBaEM7V0FDQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFOYzs7O0FBT2xCOzs7Ozt5Q0FJQSxnQkFBQSxHQUFrQixTQUFBO0FBQ2QsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZixDQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXhDO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsSUFBQSxHQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsTUFBQTtJQUNuQixRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckM7SUFDWCxNQUFBLEdBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBOUI7SUFFVCxJQUFHLFlBQUg7TUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQWQsQ0FBMEIsSUFBQSxLQUFBLENBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFkLENBQTFCLEVBQWdELFFBQWhELEVBQTBELE1BQTFEO01BQ0EsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLElBQThCLENBQUksQ0FBQyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBQSxDQUFsQixDQUFyQztRQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtRQUN6QixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkIsU0FGL0I7T0FGSjs7V0FLQSxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWhCLENBQUE7RUFiYzs7O0FBY2xCOzs7Ozt5Q0FJQSxnQkFBQSxHQUFrQixTQUFBO0FBQ2QsUUFBQTtJQUFBLFFBQUEsR0FBVyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ2hDLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsSUFBc0I7SUFDOUIsUUFBQSxHQUFXLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUNoQyxLQUFBLEdBQVEsWUFBWSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF4QztJQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQztJQUNULElBQUEsR0FBTyxLQUFLLENBQUMsS0FBTSxDQUFBLE1BQUE7SUFDbkIsSUFBTyxZQUFQO0FBQWtCLGFBQWxCOztJQUVBLE1BQUEsR0FBWSxDQUFDLFFBQUEsQ0FBUyxLQUFNLENBQUEsYUFBQSxDQUFmLENBQUosR0FBd0MsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFYLENBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUExQyxDQUF0QixFQUF1RSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUF0RixDQUF4QyxHQUEwSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsUUFBUSxDQUFDLGVBQS9CO0lBQ25KLFFBQUEsR0FBYyxDQUFDLFFBQUEsQ0FBUyxLQUFLLENBQUMsUUFBZixDQUFKLEdBQWtDLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXJDLENBQWxDLEdBQXNGLFFBQVEsQ0FBQztJQUMxRyxTQUFBLEdBQWUsQ0FBQyxRQUFBLENBQVMsS0FBTSxDQUFBLGdCQUFBLENBQWYsQ0FBSixHQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5ELEdBQWtFLFFBQVEsQ0FBQztJQUd2RixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQWQsQ0FBd0IsU0FBeEIsRUFBbUMsTUFBbkMsRUFBMkMsUUFBM0MsRUFBcUQsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLE1BQUQ7UUFDakQsTUFBTSxDQUFDLE9BQVAsQ0FBQTtRQUNBLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWYsQ0FBZ0MsTUFBTSxDQUFDLE1BQXZDO2VBQ0EsS0FBSyxDQUFDLEtBQU0sQ0FBQSxNQUFBLENBQVosR0FBc0I7TUFIMkI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJEO0lBTUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLElBQThCLENBQUksQ0FBQyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBQSxDQUFsQixDQUFyQztNQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtNQUN6QixJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsR0FBMkIsU0FGL0I7O1dBR0EsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFoQixDQUFBO0VBeEJjOzs7QUF5QmxCOzs7Ozt5Q0FJQSxpQkFBQSxHQUFtQixTQUFBO0FBQ2YsUUFBQTtJQUFBLEtBQUEsR0FBUSxZQUFZLENBQUM7SUFDckIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZixDQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQXhDO0lBQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQW5DO0lBQ1QsSUFBQSxHQUFPLEtBQUssQ0FBQyxLQUFNLENBQUEsTUFBQTtJQUNuQixJQUFPLFlBQVA7QUFBa0IsYUFBbEI7O0lBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFiLENBQTBCLElBQTFCLEVBQWdDLElBQUMsQ0FBQSxNQUFqQztXQUNBLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQVJlOzs7QUFTbkI7Ozs7O3lDQUlBLGdCQUFBLEdBQWtCLFNBQUE7QUFDZCxRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFmLENBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBeEM7SUFDQSxJQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxlQUFyQixJQUFzQyxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQXBELENBQUEsSUFBaUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUE3RjtNQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBLENBQTRCLENBQUMsUUFBUSxDQUFDLEtBQXRDLENBQUE7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBdEMsRUFBZ0QsRUFBaEQ7QUFDQSxhQUhKOztJQUtBLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtJQUN6QixJQUFHLElBQUMsQ0FBQSxXQUFXLENBQUMsaUNBQWIsQ0FBQSxDQUFIO01BQ0ksSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUE7QUFDQSxhQUZKOztJQUlBLFdBQVcsQ0FBQyxPQUFaLEdBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUM7SUFDOUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxhQUFmLENBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBckMsRUFBOEMsRUFBRSxDQUFDLFFBQUgsQ0FBWSxtQkFBWixFQUFpQyxJQUFDLENBQUEsV0FBbEMsRUFBK0MsSUFBQyxDQUFBLFdBQWhELENBQTlDO0lBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFVLENBQUMsU0FBeEIsR0FBb0MsSUFBQyxDQUFBO1dBQ3JDLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBaEIsQ0FBQTtFQWhCYzs7O0FBaUJsQjs7Ozs7eUNBSUEseUJBQUEsR0FBMkIsU0FBQTtXQUFHLFdBQVcsQ0FBQyxjQUFaLENBQUE7RUFBSDs7O0FBRTNCOzs7Ozt5Q0FJQSxtQkFBQSxHQUFxQixTQUFBO1dBQUcsV0FBVyxDQUFDLFlBQVosQ0FBQTtFQUFIOzs7QUFFckI7Ozs7O3lDQUlBLHNCQUFBLEdBQXdCLFNBQUE7SUFDcEIsSUFBRyxvQ0FBSDtBQUFrQyxhQUFsQzs7SUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWI7SUFDQSxXQUFXLENBQUMsZUFBWixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXBDO1dBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiO0VBTG9COzs7QUFPeEI7Ozs7O3lDQUlBLGVBQUEsR0FBaUIsU0FBQTtBQUNiLFFBQUE7SUFBQSxJQUFHLG9DQUFIO0FBQWtDLGFBQWxDOztJQUVBLFVBQUEsR0FBYSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFuQztJQUNiLFdBQUEsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztXQUVkLFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQW5DLENBQUEsR0FBMkMsQ0FBNUQsRUFBK0QsVUFBL0QsRUFBMkUsV0FBM0U7RUFOYTs7O0FBUWpCOzs7Ozt5Q0FJQSxlQUFBLEdBQWlCLFNBQUE7SUFDYixJQUFHLG9DQUFIO0FBQWtDLGFBQWxDOztXQUVBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQW5DLENBQUEsR0FBMkMsQ0FBNUQ7RUFIYTs7O0FBS2pCOzs7Ozt5Q0FJQSxtQkFBQSxHQUFxQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxJQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUFBLENBQVY7QUFBQSxhQUFBOztJQUVBLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUF0QixDQUFpQyxXQUFqQyxFQUE4QyxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQTNEO0lBQ0EsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFVBQXRCLENBQWlDLFNBQWpDLEVBQTRDLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBekQ7SUFDQSxFQUFFLENBQUMsa0JBQWtCLENBQUMsVUFBdEIsQ0FBaUMsU0FBakMsRUFBNEMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUF6RDtJQUNBLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUF0QixDQUFpQyxPQUFqQyxFQUEwQyxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQXZEO0lBRUEsQ0FBQSxHQUFJLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtBQUNBLFlBQUE7UUFBQSxJQUFVLDZDQUFzQixDQUFFLHNCQUF2QixJQUF1QyxDQUF4QyxDQUFBLEtBQThDLEtBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixLQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsSUFBd0IsQ0FBbkQsQ0FBeEQ7QUFBQSxpQkFBQTs7UUFDQSxHQUFBLEdBQU0sS0FBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLEtBQUMsQ0FBQSxNQUFNLENBQUMsR0FBbkM7UUFDTixhQUFBLEdBQWdCO1FBQ2hCLElBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFaLENBQXFCLEtBQUMsQ0FBQSxNQUFNLENBQUMsR0FBN0IsQ0FBSDtVQUNJLGFBQUEsR0FBZ0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUEsS0FBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQXBCLEtBQW9DLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFEaEU7U0FBQSxNQUVLLElBQUcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLEtBQWUsR0FBbEI7VUFDRCxJQUF1QixLQUFLLENBQUMsT0FBTixJQUFrQixLQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsS0FBaUIsQ0FBMUQ7WUFBQSxhQUFBLEdBQWdCLEtBQWhCOztVQUNBLElBQXVCLEtBQUssQ0FBQyxLQUFOLElBQWdCLEtBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixLQUFpQixDQUF4RDtZQUFBLGFBQUEsR0FBZ0IsS0FBaEI7V0FGQztTQUFBLE1BR0EsSUFBRyxLQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsS0FBZSxHQUFsQjtVQUNELElBQXVCLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBWixJQUEyQixLQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsS0FBaUIsQ0FBbkU7WUFBQSxhQUFBLEdBQWdCLEtBQWhCOztVQUNBLElBQXVCLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBWixJQUF5QixLQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsS0FBaUIsQ0FBakU7WUFBQSxhQUFBLEdBQWdCLEtBQWhCO1dBRkM7U0FBQSxNQUdBLElBQUcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLEtBQWUsR0FBbEI7VUFDRCxJQUF1QixDQUFDLEtBQUssQ0FBQyxPQUFOLElBQWlCLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBOUIsQ0FBQSxJQUE4QyxLQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsS0FBaUIsQ0FBdEY7WUFBQSxhQUFBLEdBQWdCLEtBQWhCOztVQUNBLElBQXVCLENBQUMsS0FBSyxDQUFDLEtBQU4sSUFBZSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQTVCLENBQUEsSUFBMEMsS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLEtBQWlCLENBQWxGO1lBQUEsYUFBQSxHQUFnQixLQUFoQjtXQUZDO1NBQUEsTUFBQTtVQUlELEdBQUEsR0FBUyxHQUFBLEdBQU0sR0FBVCxHQUFrQixHQUFBLEdBQU0sR0FBeEIsR0FBaUM7VUFDdkMsYUFBQSxHQUFnQixLQUFLLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBWCxLQUFtQixLQUFDLENBQUEsTUFBTSxDQUFDLE1BTDFDOztRQVFMLElBQUcsYUFBSDtVQUNJLEtBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QjtVQUV6QixFQUFFLENBQUMsa0JBQWtCLENBQUMsVUFBdEIsQ0FBaUMsV0FBakMsRUFBOEMsS0FBQyxDQUFBLFdBQVcsQ0FBQyxNQUEzRDtVQUNBLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUF0QixDQUFpQyxTQUFqQyxFQUE0QyxLQUFDLENBQUEsV0FBVyxDQUFDLE1BQXpEO1VBQ0EsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFVBQXRCLENBQWlDLFNBQWpDLEVBQTRDLEtBQUMsQ0FBQSxXQUFXLENBQUMsTUFBekQ7aUJBQ0EsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFVBQXRCLENBQWlDLE9BQWpDLEVBQTBDLEtBQUMsQ0FBQSxXQUFXLENBQUMsTUFBdkQsRUFOSjs7TUFwQkE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBNEJKLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUF0QixDQUF5QixXQUF6QixFQUFzQyxDQUF0QyxFQUF5QyxJQUF6QyxFQUErQyxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQTVEO0lBQ0EsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQXRCLENBQXlCLFNBQXpCLEVBQW9DLENBQXBDLEVBQXVDLElBQXZDLEVBQTZDLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBMUQ7SUFDQSxFQUFFLENBQUMsa0JBQWtCLENBQUMsRUFBdEIsQ0FBeUIsU0FBekIsRUFBb0MsQ0FBcEMsRUFBdUMsSUFBdkMsRUFBNkMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUExRDtJQUNBLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUF0QixDQUF5QixPQUF6QixFQUFrQyxDQUFsQyxFQUFxQyxJQUFyQyxFQUEyQyxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQXhEO1dBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxTQUFiLEdBQXlCO0VBekNSOzs7QUEyQ3JCOzs7Ozt5Q0FJQSxtQkFBQSxHQUFxQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxtREFBMkIsQ0FBRSxzQkFBMUIsS0FBMEMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixJQUF3QixDQUFuRCxDQUE3QztBQUNJLGFBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELENBQXRELEVBRFg7O0FBRUEsWUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQWY7QUFBQSxXQUNTLENBRFQ7ZUFFUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsS0FBSyxDQUFDLElBQUssQ0FBQSxLQUFLLENBQUMsQ0FBTixDQUFqRTtBQUZSLFdBR1MsQ0FIVDtlQUlRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxLQUFLLENBQUMsSUFBSyxDQUFBLEtBQUssQ0FBQyxDQUFOLENBQWpFO0FBSlIsV0FLUyxDQUxUO2VBTVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELEtBQUssQ0FBQyxJQUFLLENBQUEsS0FBSyxDQUFDLENBQU4sQ0FBakU7QUFOUixXQU9TLENBUFQ7ZUFRUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsS0FBSyxDQUFDLElBQUssQ0FBQSxLQUFLLENBQUMsQ0FBTixDQUFqRTtBQVJSLFdBU1MsQ0FUVDtlQVVRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxLQUFLLENBQUMsSUFBSyxDQUFBLEtBQUssQ0FBQyxDQUFOLENBQWpFO0FBVlIsV0FXUyxDQVhUO2VBWVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELEtBQUssQ0FBQyxJQUFLLENBQUEsS0FBSyxDQUFDLENBQU4sQ0FBakU7QUFaUixXQWFTLENBYlQ7ZUFjUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsS0FBSyxDQUFDLElBQUssQ0FBQSxLQUFLLENBQUMsS0FBTixDQUFqRTtBQWRSLFdBZVMsQ0FmVDtlQWdCUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsS0FBSyxDQUFDLElBQUssQ0FBQSxLQUFLLENBQUMsTUFBTixDQUFqRTtBQWhCUixXQWlCUyxDQWpCVDtlQWtCUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFsRTtBQWxCUixXQW1CUyxDQW5CVDtlQW9CUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFsRTtBQXBCUixXQXFCUyxFQXJCVDtlQXNCUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFsRTtBQXRCUixXQXVCUyxFQXZCVDtlQXdCUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFaLENBQTFFO0FBeEJSLFdBeUJTLEVBekJUO2VBMEJRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQVosQ0FBMUU7QUExQlIsV0EyQlMsRUEzQlQ7ZUE0QlEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBUSxDQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBWixDQUExRTtBQTVCUixXQTZCUyxHQTdCVDtRQThCUSxNQUFBLEdBQVM7UUFDVCxJQUFjLEtBQUssQ0FBQyxPQUFwQjtVQUFBLE1BQUEsR0FBUyxFQUFUOztRQUNBLElBQWMsS0FBSyxDQUFDLEtBQXBCO1VBQUEsTUFBQSxHQUFTLEVBQVQ7O2VBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELE1BQXREO0FBakNSLFdBa0NTLEdBbENUO1FBbUNRLFNBQUEsR0FBWTtRQUNaLElBQWlCLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBN0I7VUFBQSxTQUFBLEdBQVksRUFBWjs7UUFDQSxJQUFpQixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQTdCO1VBQUEsU0FBQSxHQUFZLEVBQVo7O2VBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELFNBQXREO0FBdENSLFdBdUNTLEdBdkNUO1FBd0NRLFFBQUEsR0FBVztRQUNYLElBQWdCLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBWixJQUEwQixLQUFLLENBQUMsT0FBaEQ7VUFBQSxRQUFBLEdBQVcsRUFBWDs7UUFDQSxJQUFnQixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVosSUFBd0IsS0FBSyxDQUFDLEtBQTlDO1VBQUEsUUFBQSxHQUFXLEVBQVg7O2VBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELFFBQXREO0FBM0NSO1FBNkNRLElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsR0FBZ0I7ZUFDdkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELEtBQUssQ0FBQyxJQUFLLENBQUEsSUFBQSxDQUFqRTtBQTlDUjtFQUhpQjs7O0FBa0RyQjs7Ozs7eUNBSUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsWUFBQSxHQUFlLFdBQVcsQ0FBQztJQUMzQixRQUFBLEdBQVcsV0FBVyxDQUFDO0FBRXZCLFlBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFmO0FBQUEsV0FDUyxDQURUO2VBRVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELFlBQVksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQXZGO0FBRlIsV0FHUyxDQUhUO2VBSVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELElBQUksQ0FBQyxLQUFMLENBQVcsUUFBUSxDQUFDLFVBQVQsR0FBc0IsRUFBakMsQ0FBdEQ7QUFKUixXQUtTLENBTFQ7ZUFNUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFRLENBQUMsVUFBVCxHQUFzQixFQUF0QixHQUEyQixFQUF0QyxDQUF0RDtBQU5SLFdBT1MsQ0FQVDtlQVFRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVEsQ0FBQyxVQUFULEdBQXNCLEVBQXRCLEdBQTJCLEVBQTNCLEdBQWdDLEVBQTNDLENBQXREO0FBUlIsV0FTUyxDQVRUO2VBVVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQTBELElBQUEsSUFBQSxDQUFBLENBQU0sQ0FBQyxPQUFQLENBQUEsQ0FBMUQ7QUFWUixXQVdTLENBWFQ7ZUFZUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBMEQsSUFBQSxJQUFBLENBQUEsQ0FBTSxDQUFDLE1BQVAsQ0FBQSxDQUExRDtBQVpSLFdBYVMsQ0FiVDtlQWNRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUEwRCxJQUFBLElBQUEsQ0FBQSxDQUFNLENBQUMsUUFBUCxDQUFBLENBQTFEO0FBZFIsV0FlUyxDQWZUO2VBZ0JRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUEwRCxJQUFBLElBQUEsQ0FBQSxDQUFNLENBQUMsV0FBUCxDQUFBLENBQTFEO0FBaEJSLFdBaUJTLENBakJUO2VBa0JRLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF2QyxFQUF1RCxRQUFRLENBQUMsU0FBaEU7QUFsQlIsV0FtQlMsQ0FuQlQ7ZUFvQlEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxpQkFBYixDQUErQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXZDLEVBQXVELFFBQVEsQ0FBQyx1QkFBaEU7QUFwQlIsV0FxQlMsRUFyQlQ7ZUFzQlEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELFFBQVEsQ0FBQyxZQUEvRDtBQXRCUixXQXVCUyxFQXZCVDtlQXdCUSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBdUQsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUE1RTtBQXhCUixXQXlCUyxFQXpCVDtlQTBCUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUEzRTtBQTFCUixXQTJCUyxFQTNCVDtlQTRCUSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBdUQsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUE1RTtBQTVCUixXQTZCUyxFQTdCVDtlQThCUSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBdUQsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUE1RTtBQTlCUixXQStCUyxFQS9CVDtlQWdDUSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBdUQsUUFBUSxDQUFDLGtCQUFoRTtBQWhDUixXQWlDUyxFQWpDVDtlQWtDUSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBdUQsUUFBUSxDQUFDLGNBQWhFO0FBbENSLFdBbUNTLEVBbkNUO2VBb0NRLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF2QyxFQUF1RCxRQUFRLENBQUMsZUFBaEU7QUFwQ1IsV0FxQ1MsRUFyQ1Q7ZUFzQ1EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxpQkFBYixDQUErQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXZDLEVBQXVELFFBQVEsQ0FBQyxpQkFBaEU7QUF0Q1IsV0F1Q1MsRUF2Q1Q7ZUF3Q1EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxpQkFBYixDQUErQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXZDLEVBQXVELFFBQVEsQ0FBQyxVQUFoRTtBQXhDUixXQXlDUyxFQXpDVDtlQTBDUSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBdUQsUUFBUSxDQUFDLGlCQUFoRTtBQTFDUixXQTJDUyxFQTNDVDtlQTRDUSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBdUQsUUFBUSxDQUFDLFlBQWhFO0FBNUNSLFdBNkNTLEVBN0NUO2VBOENRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxRQUFRLENBQUMsU0FBL0Q7QUE5Q1IsV0ErQ1MsRUEvQ1Q7ZUFnRFEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELFFBQVEsQ0FBQyxXQUEvRDtBQWhEUixXQWlEUyxFQWpEVDtlQWtEUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsUUFBUSxDQUFDLFFBQS9EO0FBbERSLFdBbURTLEVBbkRUO2VBb0RRLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF2QyxFQUF1RCxRQUFRLENBQUMsVUFBaEU7QUFwRFIsV0FxRFMsRUFyRFQ7ZUFzRFEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxpQkFBYixDQUErQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXZDLEVBQXVELFFBQVEsQ0FBQyxZQUFoRTtBQXREUixXQXVEUyxFQXZEVDtlQXdEUSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBdUQsUUFBUSxDQUFDLFNBQWhFO0FBeERSLFdBeURTLEVBekRUO2VBMERRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxpREFBOEUsQ0FBRSxjQUExQixJQUFrQyxFQUF4RjtBQTFEUixXQTJEUyxFQTNEVDtlQTREUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsbURBQThFLENBQUUsY0FBMUIsSUFBa0MsRUFBeEY7QUE1RFIsV0E2RFMsRUE3RFQ7ZUE4RFEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxpQkFBYixDQUErQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXZDLEVBQXVELFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBaEY7QUE5RFI7RUFKZ0I7OztBQW9FcEI7Ozs7O3lDQUlBLGtCQUFBLEdBQW9CLFNBQUE7QUFDaEIsUUFBQTtJQUFBLFlBQUEsR0FBZSxXQUFXLENBQUM7SUFDM0IsUUFBQSxHQUFXLFdBQVcsQ0FBQztBQUV2QixZQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBZjtBQUFBLFdBQ1MsQ0FEVDtlQUVRLFFBQVEsQ0FBQyxTQUFULEdBQXFCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBRjdCLFdBR1MsQ0FIVDtlQUlRLFFBQVEsQ0FBQyx1QkFBVCxHQUFtQyxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQztBQUozQyxXQUtTLENBTFQ7ZUFNUSxRQUFRLENBQUMsWUFBVCxHQUF3QixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFuQztBQU5oQyxXQU9TLENBUFQ7ZUFRUSxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQXJCLEdBQStCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBUnZDLFdBU1MsQ0FUVDtlQVVRLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBckIsR0FBNEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkM7QUFWcEMsV0FXUyxDQVhUO2VBWVEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFyQixHQUFvQyxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQztBQVo1QyxXQWFTLENBYlQ7ZUFjUSxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQXJCLEdBQW9DLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBZDVDLFdBZVMsQ0FmVDtlQWdCUSxRQUFRLENBQUMsa0JBQVQsR0FBOEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBcEM7QUFoQnRDLFdBaUJTLENBakJUO2VBa0JRLFFBQVEsQ0FBQyxjQUFULEdBQTBCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBbEJsQyxXQW1CUyxDQW5CVDtlQW9CUSxRQUFRLENBQUMsZUFBVCxHQUEyQixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQztBQXBCbkMsV0FxQlMsRUFyQlQ7ZUFzQlEsUUFBUSxDQUFDLGlCQUFULEdBQTZCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBdEJyQyxXQXVCUyxFQXZCVDtRQXdCUSxRQUFRLENBQUMsVUFBVCxHQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQztRQUN0QixJQUFHLFFBQVEsQ0FBQyxVQUFaO2lCQUNJLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQTVCLENBQUEsRUFESjtTQUFBLE1BQUE7aUJBR0ksWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZUFBNUIsQ0FBQSxFQUhKOztBQUZDO0FBdkJULFdBNkJTLEVBN0JUO1FBOEJRLFFBQVEsQ0FBQyxpQkFBVCxHQUE2QixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQztRQUM3QixRQUFRLENBQUMsU0FBVCxHQUFxQixDQUFDLFFBQVEsQ0FBQztlQUMvQixRQUFRLENBQUMsUUFBVCxDQUFBO0FBaENSLFdBaUNTLEVBakNUO2VBa0NRLFFBQVEsQ0FBQyxZQUFULEdBQXdCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBbENoQyxXQW1DUyxFQW5DVDtlQW9DUSxRQUFRLENBQUMsU0FBVCxHQUFxQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztBQXBDN0IsV0FxQ1MsRUFyQ1Q7ZUFzQ1EsUUFBUSxDQUFDLFdBQVQsR0FBdUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkM7QUF0Qy9CLFdBdUNTLEVBdkNUO2VBd0NRLFFBQVEsQ0FBQyxRQUFULEdBQW9CLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO0FBeEM1QixXQXlDUyxFQXpDVDtlQTBDUSxRQUFRLENBQUMsVUFBVCxHQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQztBQTFDOUIsV0EyQ1MsRUEzQ1Q7ZUE0Q1EsUUFBUSxDQUFDLFlBQVQsR0FBd0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBcEM7QUE1Q2hDLFdBNkNTLEVBN0NUO2VBOENRLFFBQVEsQ0FBQyxTQUFULEdBQXFCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBOUM3QixXQStDUyxFQS9DVDtRQWdEUSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbkM7UUFDUCxRQUFBLEdBQVcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUExQixDQUFnQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDLElBQUYsS0FBVTtVQUFqQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEM7UUFDWCxJQUE0QyxRQUE1QztpQkFBQSxlQUFlLENBQUMsY0FBaEIsQ0FBK0IsUUFBL0IsRUFBQTs7QUFIQztBQS9DVCxXQW1EUyxFQW5EVDtlQW9EUSxXQUFXLENBQUMsWUFBWSxDQUFDLElBQXpCLEdBQWdDLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBcER4QztFQUpnQjs7O0FBMERwQjs7Ozs7eUNBSUEsb0JBQUEsR0FBc0IsU0FBQTtBQUNsQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztBQUNyQixZQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBZjtBQUFBLFdBQ1MsQ0FEVDtRQUVRLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQWYsQ0FBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUEzQztRQUNBLE1BQUEsR0FBUyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVMsQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFBO0FBRnBDO0FBRFQsV0FJUyxDQUpUO1FBS1EsTUFBQSxHQUFTLFlBQVksQ0FBQyxLQUFLLENBQUMsV0FBWSxDQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DLENBQUE7QUFEdkM7QUFKVCxXQU1TLENBTlQ7UUFPUSxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFmLENBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBeEM7UUFDQSxNQUFBLEdBQVMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFNLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsQ0FBQTtBQUZqQztBQU5ULFdBU1MsQ0FUVDtRQVVRLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWYsQ0FBaUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF6QztRQUNBLE1BQUEsR0FBUyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU8sQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFBO0FBRmxDO0FBVFQsV0FZUyxDQVpUO1FBYVEsV0FBQSxHQUFjLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO1FBQ2QsTUFBQSxHQUFTLFlBQVksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQTlCLENBQW9DLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsQ0FBRDttQkFBTyxDQUFDLENBQUMsQ0FBQyxRQUFILElBQWdCLENBQUMsQ0FBQyxHQUFGLEtBQVM7VUFBaEM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDO0FBRlI7QUFaVCxXQWVTLENBZlQ7UUFnQlEsTUFBQSxHQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQXpCLENBQW9DLFlBQXBDO0FBRFI7QUFmVCxXQWlCUyxDQWpCVDtRQWtCUSxLQUFLLENBQUMsUUFBUSxDQUFDLHVCQUFmLENBQXVDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBL0M7UUFDQSxJQUFBLEdBQU8sWUFBWSxDQUFDLEtBQUssQ0FBQyxZQUFhLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsQ0FBQTtRQUN2QyxNQUFBLGtCQUFTLElBQUksQ0FBRTtBQUhkO0FBakJULFdBcUJTLENBckJUO1FBc0JRLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQWYsQ0FBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUEzQztRQUNBLE1BQUEsR0FBUyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVMsQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFBO0FBdkI3QztJQXlCQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUNoQixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixLQUFzQixDQUF6QjtBQUNJLGNBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFmO0FBQUEsYUFDUyxDQURUO1VBRVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLDhEQUEyRixDQUFFLGVBQXZDLElBQWdELEVBQXRHO0FBREM7QUFEVCxhQUdTLENBSFQ7VUFJUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsR0FBQSw4REFBeUMsQ0FBRSxhQUEzQyxDQUFBLElBQW9ELEVBQTFHO0FBSlI7TUFLQSxLQUFBLElBQVMsRUFOYjs7SUFRQSxJQUFHLGdCQUFBLElBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLEtBQXNCLENBQXJDO0FBQ0ksY0FBTyxLQUFQO0FBQUEsYUFDUyxDQURUO2lCQUVRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQXJFO0FBRlIsYUFHUyxDQUhUO2lCQUlRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQXJFO0FBSlIsYUFLUyxDQUxUO2lCQU1RLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUFNLENBQUMsTUFBN0Q7QUFOUixhQU9TLENBUFQ7aUJBUVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELE1BQU0sQ0FBQyxPQUE3RDtBQVJSLGFBU1MsQ0FUVDtpQkFVUSxJQUFDLENBQUEsV0FBVyxDQUFDLGlCQUFiLENBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdkMsRUFBdUQsTUFBTSxDQUFDLE9BQTlEO0FBVlIsYUFXUyxDQVhUO2lCQVlRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUFNLENBQUMsWUFBN0Q7QUFaUixPQURKO0tBQUEsTUFlSyxJQUFHLGNBQUg7TUFDRCxJQUFHLEtBQUEsSUFBUyxDQUFaO0FBQ0ksZ0JBQU8sS0FBUDtBQUFBLGVBQ1MsQ0FEVDtBQUVRLG9CQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBZjtBQUFBLG1CQUNTLENBRFQ7dUJBRVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELE1BQU0sQ0FBQyxJQUFQLElBQWUsRUFBckU7QUFGUixtQkFHUyxDQUhUO3VCQUlRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUFNLENBQUMsS0FBUCxJQUFnQixFQUF0RTtBQUpSO3VCQU1RLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUF5RCxNQUFNLENBQUMsS0FBVixHQUF1QixDQUFDLE1BQU0sQ0FBQyxXQUFQLElBQW9CLEVBQXJCLENBQUEsR0FBd0IsR0FBeEIsR0FBMEIsQ0FBQyxNQUFNLENBQUMsS0FBUCxJQUFnQixFQUFqQixDQUFqRCxHQUE0RSxFQUFsSTtBQU5SO0FBREM7QUFEVCxlQVNTLENBVFQ7bUJBVVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBckU7QUFWUixlQVdTLENBWFQ7bUJBWVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBckU7QUFaUixlQWFTLENBYlQ7bUJBY1EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFkLEdBQWtCLEdBQTdCLENBQXREO0FBZFIsZUFlUyxDQWZUO21CQWdCUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQWQsR0FBa0IsR0FBN0IsQ0FBdEQ7QUFoQlIsZUFpQlMsQ0FqQlQ7bUJBa0JRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBWixHQUFnQixHQUEzQixDQUF0RDtBQWxCUixlQW1CUyxDQW5CVDttQkFvQlEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFaLEdBQWdCLEdBQTNCLENBQXREO0FBcEJSLGVBcUJTLENBckJUO21CQXNCUSxJQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBdEMsRUFBc0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFyRTtBQXRCUixlQXVCUyxDQXZCVDttQkF3QlEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQXRDLEVBQXNELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBckU7QUF4QlIsZUF5QlMsQ0F6QlQ7bUJBMEJRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUFNLENBQUMsTUFBN0Q7QUExQlIsZUEyQlMsRUEzQlQ7bUJBNEJRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUFNLENBQUMsT0FBN0Q7QUE1QlIsZUE2QlMsRUE3QlQ7bUJBOEJRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUFNLENBQUMsS0FBN0Q7QUE5QlIsZUErQlMsRUEvQlQ7bUJBZ0NRLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF2QyxFQUF1RCxNQUFNLENBQUMsT0FBOUQ7QUFoQ1IsZUFpQ1MsRUFqQ1Q7bUJBa0NRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUFNLENBQUMsU0FBN0Q7QUFsQ1IsZUFtQ1MsRUFuQ1Q7bUJBb0NRLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF2QyxFQUF1RCxNQUFNLENBQUMsTUFBOUQ7QUFwQ1IsZUFxQ1MsRUFyQ1Q7bUJBc0NRLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUF0QyxFQUFzRCxNQUFNLENBQUMsWUFBN0Q7QUF0Q1IsU0FESjtPQURDOztFQW5EYTs7O0FBNkZ0Qjs7Ozs7eUNBSUEsb0JBQUEsR0FBc0IsU0FBQTtBQUNsQixRQUFBO0lBQUEsS0FBQSxHQUFRLFlBQVksQ0FBQztBQUVyQixZQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBZjtBQUFBLFdBQ1MsQ0FEVDtRQUVRLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQWYsQ0FBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUEzQztRQUNBLE1BQUEsR0FBUyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVMsQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFBO0FBRnBDO0FBRFQsV0FJUyxDQUpUO1FBS1EsTUFBQSxHQUFTLFlBQVksQ0FBQyxLQUFLLENBQUMsV0FBWSxDQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DLENBQUE7QUFEdkM7QUFKVCxXQU1TLENBTlQ7UUFPUSxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFmLENBQWdDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBeEM7UUFDQSxNQUFBLEdBQVMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFNLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsQ0FBQTtBQUZqQztBQU5ULFdBU1MsQ0FUVDtRQVVRLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWYsQ0FBaUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUF6QztRQUNBLE1BQUEsR0FBUyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU8sQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFBO0FBRmxDO0FBVFQsV0FZUyxDQVpUO1FBYVEsV0FBQSxHQUFjLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO1FBQ2QsTUFBQSxHQUFTLFlBQVksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQTlCLENBQW9DLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsQ0FBRDttQkFBTyxDQUFDLENBQUMsQ0FBQyxRQUFILElBQWdCLENBQUMsQ0FBQyxHQUFGLEtBQVM7VUFBaEM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDO0FBRlI7QUFaVCxXQWVTLENBZlQ7UUFnQlEsTUFBQSxHQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQXpCLENBQW9DLFlBQXBDO0FBRFI7QUFmVCxXQWlCUyxDQWpCVDtRQWtCUSxLQUFLLENBQUMsUUFBUSxDQUFDLHVCQUFmLENBQXVDLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBL0M7UUFDQSxJQUFBLEdBQU8sWUFBWSxDQUFDLEtBQUssQ0FBQyxZQUFhLENBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsQ0FBQTtRQUN2QyxNQUFBLGtCQUFTLElBQUksQ0FBRTtBQUhkO0FBakJULFdBcUJTLENBckJUO1FBc0JRLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQWYsQ0FBbUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUEzQztRQUNBLE1BQUEsR0FBUyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVMsQ0FBQSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFuQyxDQUFBO0FBdkI3QztJQTBCQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUNoQixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixLQUFzQixDQUF6QjtBQUNJLGNBQU8sS0FBUDtBQUFBLGFBQ1MsQ0FEVDtVQUVRLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFuQztVQUNQLElBQUcsY0FBSDtZQUNJLE1BQU0sQ0FBQyxJQUFQLEdBQWMsS0FEbEI7OztlQUVxQyxDQUFFLElBQXZDLEdBQThDOztBQUx0RDtNQU1BLEtBQUEsR0FQSjs7SUFTQSxJQUFHLGdCQUFBLElBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLEtBQXNCLENBQXJDO0FBQ0ksY0FBTyxLQUFQO0FBQUEsYUFDUyxDQURUO2lCQUVRLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBZixHQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztBQUYzQixhQUdTLENBSFQ7aUJBSVEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFmLEdBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO0FBSjNCLGFBS1MsQ0FMVDtpQkFNUSxNQUFNLENBQUMsTUFBUCxHQUFnQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztBQU54QixhQU9TLENBUFQ7aUJBUVEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkM7QUFSekIsYUFTUyxDQVRUO2lCQVVRLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBVnpCLGFBV1MsQ0FYVDtpQkFZUSxNQUFNLENBQUMsWUFBUCxHQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztBQVo5QixPQURKO0tBQUEsTUFlSyxJQUFHLGNBQUg7TUFDRCxJQUFHLEtBQUEsSUFBUyxDQUFaO0FBQ0ksZ0JBQU8sS0FBUDtBQUFBLGVBQ1MsQ0FEVDtBQUVRLG9CQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBZjtBQUFBLG1CQUNTLENBRFQ7dUJBRVEsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFuQztBQUZ0QixtQkFHUyxDQUhUO3VCQUlRLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBbkM7QUFKdkI7Z0JBTVEsSUFBQSxHQUFPLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQW5DO2dCQUNQLElBQUcsSUFBSDtrQkFDSSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBWCxDQUFlLENBQUMsSUFBaEIsQ0FBQSxDQUFBLElBQTBCO3lCQUN6QyxNQUFNLENBQUMsV0FBUCxHQUFxQixJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVgsQ0FBZSxDQUFDLEtBQWhCLENBQXNCLENBQXRCLEVBQXlCLENBQUMsQ0FBMUIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxHQUFsQyxDQUFBLElBQTBDLEdBRm5FO2lCQUFBLE1BQUE7eUJBSUksTUFBTSxDQUFDLEtBQVAsR0FBZSxHQUpuQjs7QUFQUjtBQURDO0FBRFQsZUFjUyxDQWRUO21CQWVRLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBZixHQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztBQWYzQixlQWdCUyxDQWhCVDttQkFpQlEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFmLEdBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO0FBakIzQixlQWtCUyxDQWxCVDttQkFtQlEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFkLEdBQWtCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DLENBQUEsR0FBa0Q7QUFuQjVFLGVBb0JTLENBcEJUO21CQXFCUSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQWQsR0FBa0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkMsQ0FBQSxHQUFrRDtBQXJCNUUsZUFzQlMsQ0F0QlQ7bUJBdUJRLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBWixHQUFnQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQyxDQUFBLEdBQWtEO0FBdkIxRSxlQXdCUyxDQXhCVDttQkF5QlEsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFaLEdBQWdCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DLENBQUEsR0FBa0Q7QUF6QjFFLGVBMEJTLENBMUJUO21CQTJCUSxNQUFNLENBQUMsTUFBUCxHQUFnQixJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztBQTNCeEIsZUE0QlMsQ0E1QlQ7bUJBNkJRLE1BQU0sQ0FBQyxPQUFQLEdBQWdCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO0FBN0J4QixlQThCUyxDQTlCVDttQkErQlEsTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFDLENBQUEsV0FBVyxDQUFDLGFBQWIsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFuQztBQS9CdkIsZUFnQ1MsRUFoQ1Q7bUJBaUNRLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBDO0FBakN6QixlQWtDUyxFQWxDVDttQkFtQ1EsTUFBTSxDQUFDLFNBQVAsR0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxhQUFiLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBbkM7QUFuQzNCLGVBb0NTLEVBcENUO21CQXFDUSxNQUFNLENBQUMsTUFBUCxHQUFnQixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQztBQXJDeEIsZUFzQ1MsRUF0Q1Q7bUJBdUNRLE1BQU0sQ0FBQyxZQUFQLEdBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsYUFBYixDQUEyQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQW5DO0FBdkM5QixTQURKO09BREM7O0VBdERhOzs7QUFpR3RCOzs7Ozt5Q0FJQSxtQkFBQSxHQUFxQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxNQUFBLEdBQVMsYUFBYSxDQUFDLE1BQU0sQ0FBQztJQUM5QixVQUFBLEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLElBQXNCO0FBRW5DO0FBQUE7U0FBQSw2Q0FBQTs7TUFDSSxJQUFHLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQXJCLENBQThCLFVBQVcsQ0FBQSxTQUFBLEdBQVUsQ0FBVixDQUF6QyxDQUFKO3FCQUNJLE1BQU8sQ0FBQSxDQUFBLENBQVAsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxDQUFBLEdBRC9CO09BQUEsTUFBQTs2QkFBQTs7QUFESjs7RUFKaUI7OztBQVFyQjs7Ozs7eUNBSUEsbUJBQUEsR0FBcUIsU0FBQTtBQUNqQixRQUFBO0lBQUEsTUFBQSxHQUFTLGFBQWEsQ0FBQyxNQUFNLENBQUM7SUFDOUIsVUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixJQUFzQjtBQUVuQztBQUFBO1NBQUEsNkNBQUE7O01BQ0ksSUFBRyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFyQixDQUE4QixVQUFXLENBQUEsU0FBQSxHQUFVLENBQVYsQ0FBekMsQ0FBSjtxQkFDSSxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQWdCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQXhCLEdBRHBCO09BQUEsTUFBQTs2QkFBQTs7QUFESjs7RUFKaUI7OztBQVFyQjs7Ozs7eUNBSUEseUJBQUEsR0FBMkIsU0FBQTtBQUN2QixRQUFBO0lBQUEsSUFBRyxpRUFBSDtNQUNJLE1BQUEsR0FBUyxlQUFlLENBQUMsU0FBaEIsQ0FBNEIsMkZBQStCLG1CQUEvQixDQUFBLEdBQW1ELEdBQW5ELEdBQXNELElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQWxHO2FBQ1QsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsTUFBekIsRUFBaUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUF6QyxFQUE2QyxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQXJELEVBRko7S0FBQSxNQUFBO2FBSUksUUFBUSxDQUFDLGVBQVQsQ0FBeUIsSUFBekIsRUFBK0IsQ0FBL0IsRUFBa0MsQ0FBbEMsRUFKSjs7RUFEdUI7OztBQU8zQjs7Ozs7eUNBSUEsc0JBQUEsR0FBd0IsU0FBQTtXQUNwQixXQUFXLENBQUMsZUFBWixDQUFBO0VBRG9COzs7QUFHeEI7Ozs7O3lDQUlBLGFBQUEsR0FBZSxTQUFBO0FBQ1gsUUFBQTtBQUFBO01BQ0ksSUFBRyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBWjtRQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixHQUFxQixJQUFBLENBQUssY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQXpCLEdBQWtDLElBQXZDLEVBRHpCOzthQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLEVBSko7S0FBQSxhQUFBO01BS007YUFDRixPQUFPLENBQUMsR0FBUixDQUFZLEVBQVosRUFOSjs7RUFEVzs7OztHQS95THdCLEVBQUUsQ0FBQzs7QUF3ekw5QyxNQUFNLENBQUMsa0JBQVAsR0FBNEI7O0FBQzVCLEVBQUUsQ0FBQyw0QkFBSCxHQUFrQyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlciBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcIm9iamVjdFwiLCBcImNvbW1hbmRcIiwgXCJvbk1lc3NhZ2VBRFZXYWl0aW5nXCIsIFwib25NZXNzYWdlQURWRGlzYXBwZWFyXCIsIFwib25NZXNzYWdlQURWRmluaXNoXCJdXG5cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uRGF0YUJ1bmRsZVJlc3RvcmUuXG4gICAgKiBAcGFyYW0gT2JqZWN0IGRhdGEgLSBUaGUgZGF0YS1idW5kbGVcbiAgICAqIEBwYXJhbSBncy5PYmplY3RDb2RlY0NvbnRleHQgY29udGV4dCAtIFRoZSBjb2RlYy1jb250ZXh0LlxuICAgICMjI1xuICAgIG9uRGF0YUJ1bmRsZVJlc3RvcmU6IChkYXRhLCBjb250ZXh0KSAtPlxuXG5cbiAgICAjIyMqXG4gICAgKiBBIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgYSBnYW1lIG9iamVjdCB0byBwcm9jZXNzIGNvbW1hbmRzIGxpa2UgZm9yXG4gICAgKiBzY2VuZS1vYmplY3RzLiBGb3IgZWFjaCBjb21tYW5kIGEgY29tbWFuZC1mdW5jdGlvbiBleGlzdHMuIFRvIGFkZFxuICAgICogb3duIGN1c3RvbSBjb21tYW5kcyB0byB0aGUgaW50ZXJwcmV0ZXIganVzdCBjcmVhdGUgYSBzdWItY2xhc3MgYW5kXG4gICAgKiBvdmVycmlkZSB0aGUgZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlci5hc3NpZ25Db21tYW5kIG1ldGhvZFxuICAgICogYW5kIGFzc2lnbiB0aGUgY29tbWFuZC1mdW5jdGlvbiBmb3IgeW91ciBjdXN0b20tY29tbWFuZC5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlclxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBXYWl0LUNvdW50ZXIgaW4gZnJhbWVzLiBJZiBncmVhdGVyIHRoYW4gMCwgdGhlIGludGVycHJldGVyIHdpbGwgZm9yIHRoYXQgYW1vdW50IG9mIGZyYW1lcyBiZWZvcmUgY29udGludWUuXG4gICAgICAgICogQHByb3BlcnR5IHdhaXRDb3VudGVyXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAd2FpdENvdW50ZXIgPSAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGV4IHRvIHRoZSBuZXh0IGNvbW1hbmQgdG8gZXhlY3V0ZS5cbiAgICAgICAgKiBAcHJvcGVydHkgcG9pbnRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHBvaW50ZXIgPSAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBzdGF0ZXMgb2YgY29uZGl0aW9ucy5cbiAgICAgICAgKiBAcHJvcGVydHkgY29uZGl0aW9uc1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBjb25kaXRpb25zID0gW11cblxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIHN0YXRlcyBvZiBsb29wcy5cbiAgICAgICAgKiBAcHJvcGVydHkgbG9vcHNcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAbG9vcHMgPSBbXVxuXG4gICAgICAgICMgRklYTUU6IFNob3VsZCBub3QgYmUgc3RvcmVkIGluIHRoZSBpbnRlcnByZXRlci5cbiAgICAgICAgQHRpbWVycyA9IFtdXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgaW50ZXJwcmV0ZXIgaXMgY3VycmVudGx5IHJ1bm5pbmcuXG4gICAgICAgICogQHByb3BlcnR5IGlzUnVubmluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1J1bm5pbmcgPSBub1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIGludGVycHJldGVyIGlzIGN1cnJlbnRseSB3YWl0aW5nLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpc1dhaXRpbmdcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAaXNXYWl0aW5nID0gbm9cblxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBpbnRlcnByZXRlciBpcyBjdXJyZW50bHkgd2FpdGluZyB1bnRpbCBhIG1lc3NhZ2UgcHJvY2Vzc2VkIGJ5IGFub3RoZXIgY29udGV4dCBsaWtlIGEgQ29tbW9uIEV2ZW50XG4gICAgICAgICogaXMgZmluaXNoZWQuXG4gICAgICAgICogRklYTUU6IENvbmZsaWN0IGhhbmRsaW5nIGNhbiBiZSByZW1vdmVkIG1heWJlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpc1dhaXRpbmdGb3JNZXNzYWdlXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQGlzV2FpdGluZ0Zvck1lc3NhZ2UgPSBub1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgaW50ZXJuYWwgcHJldmlldy1pbmZvIGlmIHRoZSBnYW1lIHJ1bnMgY3VycmVudGx5IGluIExpdmUtUHJldmlldy5cbiAgICAgICAgKiA8dWw+XG4gICAgICAgICogPGxpPnByZXZpZXdJbmZvLnRpbWVvdXQgLSBUaW1lciBJRCBpZiBhIHRpbWVvdXQgZm9yIGxpdmUtcHJldmlldyB3YXMgY29uZmlndXJlZCB0byBleGl0IHRoZSBnYW1lIGxvb3AgYWZ0ZXIgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lLjwvbGk+XG4gICAgICAgICogPGxpPnByZXZpZXdJbmZvLndhaXRpbmcgLSBJbmRpY2F0ZXMgaWYgTGl2ZS1QcmV2aWV3IGlzIGN1cnJlbnRseSB3YWl0aW5nIGZvciB0aGUgbmV4dCB1c2VyLWFjdGlvbi4gKFNlbGVjdGluZyBhbm90aGVyIGNvbW1hbmQsIGV0Yy4pPC9saT5cbiAgICAgICAgKiA8bGk+cHJldmlld0luZm8uZXhlY3V0ZWRDb21tYW5kcyAtIENvdW50cyB0aGUgYW1vdW50IG9mIGV4ZWN1dGVkIGNvbW1hbmRzIHNpbmNlIHRoZSBsYXN0XG4gICAgICAgICogaW50ZXJwcmV0ZXItcGF1c2Uod2FpdGluZywgZXRjLikuIElmIGl0cyBtb3JlIHRoYW4gNTAwLCB0aGUgaW50ZXJwcmV0ZXIgd2lsbCBhdXRvbWF0aWNhbGx5IHBhdXNlIGZvciAxIGZyYW1lIHRvXG4gICAgICAgICogYXZvaWQgdGhhdCBMaXZlLVByZXZpZXcgZnJlZXplcyB0aGUgRWRpdG9yIGluIGNhc2Ugb2YgZW5kbGVzcyBsb29wcy48L2xpPlxuICAgICAgICAqIDwvdWw+XG4gICAgICAgICogQHByb3BlcnR5IHByZXZpZXdJbmZvXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBwcmV2aWV3SW5mbyA9IG5ldyBncy5MaXZlUHJldmlld0luZm8oKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgTGl2ZS1QcmV2aWV3IHJlbGF0ZWQgaW5mbyBwYXNzZWQgZnJvbSB0aGUgVk4gTWFrZXIgZWRpdG9yIGxpa2UgdGhlIGNvbW1hbmQtaW5kZXggdGhlIHBsYXllciBjbGlja2VkIG9uLCBldGMuXG4gICAgICAgICogQHByb3BlcnR5IHByZXZpZXdEYXRhXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHByZXZpZXdEYXRhID0gbnVsbFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIGludGVycHJldGVyIGF1dG9tYXRpY2FsbHkgcmVwZWF0cyBleGVjdXRpb24gYWZ0ZXIgdGhlIGxhc3QgY29tbWFuZCB3YXMgZXhlY3V0ZWQuXG4gICAgICAgICogQHByb3BlcnR5IHJlcGVhdFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEByZXBlYXQgPSBub1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZXhlY3V0aW9uIGNvbnRleHQgb2YgdGhlIGludGVycHJldGVyLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb250ZXh0XG4gICAgICAgICogQHR5cGUgZ3MuSW50ZXJwcmV0ZXJDb250ZXh0XG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGNvbnRleHQgPSBuZXcgZ3MuSW50ZXJwcmV0ZXJDb250ZXh0KDAsIG51bGwpXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN1Yi1JbnRlcnByZXRlciBmcm9tIGEgQ29tbW9uIEV2ZW50IENhbGwuIFRoZSBpbnRlcnByZXRlciB3aWxsIHdhaXQgdW50aWwgdGhlIHN1Yi1pbnRlcnByZXRlciBpcyBkb25lIGFuZCBzZXQgYmFjayB0b1xuICAgICAgICAqIDxiPm51bGw8L2I+LlxuICAgICAgICAqIEBwcm9wZXJ0eSBzdWJJbnRlcnByZXRlclxuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAc3ViSW50ZXJwcmV0ZXIgPSBudWxsXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEN1cnJlbnQgaW5kZW50LWxldmVsIG9mIGV4ZWN1dGlvblxuICAgICAgICAqIEBwcm9wZXJ0eSBpbmRlbnRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAaW5kZW50ID0gMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgaW5mb3JtYXRpb24gYWJvdXQgZm9yIHdoYXQgdGhlIGludGVycHJldGVyIGlzIGN1cnJlbnRseSB3YWl0aW5nIGZvciBsaWtlIGZvciBhIEFEViBtZXNzYWdlLCBldGMuIHRvXG4gICAgICAgICogcmVzdG9yZSBwcm9iYWJseSB3aGVuIGxvYWRlZCBmcm9tIGEgc2F2ZS1nYW1lLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0aW5nRm9yXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRpbmdGb3IgPSB7fVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgaW50ZXJwcmV0ZXIgcmVsYXRlZCBzZXR0aW5ncyBsaWtlIGhvdyB0byBoYW5kbGUgbWVzc2FnZXMsIGV0Yy5cbiAgICAgICAgKiBAcHJvcGVydHkgc2V0dGluZ3NcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAc2V0dGluZ3MgPSB7IG1lc3NhZ2U6IHsgYnlJZDoge30sIGF1dG9FcmFzZTogeWVzLCB3YWl0QXRFbmQ6IHllcywgYmFja2xvZzogeWVzIH0sIHNjcmVlbjogeyBwYW46IG5ldyBncy5Qb2ludCgwLCAwKSB9IH1cblxuICAgICAgICAjIyMqXG4gICAgICAgICogTWFwcGluZyB0YWJsZSB0byBxdWlja2x5IGdldCB0aGUgYW5jaG9yIHBvaW50IGZvciB0aGUgYW4gaW5zZXJ0ZWQgYW5jaG9yLXBvaW50IGNvbnN0YW50IHN1Y2ggYXNcbiAgICAgICAgKiBUb3AtTGVmdCgwKSwgVG9wKDEpLCBUb3AtUmlnaHQoMikgYW5kIHNvIG9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSBncmFwaGljQW5jaG9yUG9pbnRzQnlDb25zdGFudFxuICAgICAgICAqIEB0eXBlIGdzLlBvaW50W11cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAZ3JhcGhpY0FuY2hvclBvaW50c0J5Q29uc3RhbnQgPSBbXG4gICAgICAgICAgICBuZXcgZ3MuUG9pbnQoMC4wLCAwLjApLFxuICAgICAgICAgICAgbmV3IGdzLlBvaW50KDAuNSwgMC4wKSxcbiAgICAgICAgICAgIG5ldyBncy5Qb2ludCgxLjAsIDAuMCksXG4gICAgICAgICAgICBuZXcgZ3MuUG9pbnQoMS4wLCAwLjUpLFxuICAgICAgICAgICAgbmV3IGdzLlBvaW50KDEuMCwgMS4wKSxcbiAgICAgICAgICAgIG5ldyBncy5Qb2ludCgwLjUsIDEuMCksXG4gICAgICAgICAgICBuZXcgZ3MuUG9pbnQoMC4wLCAxLjApLFxuICAgICAgICAgICAgbmV3IGdzLlBvaW50KDAuMCwgMC41KSxcbiAgICAgICAgICAgIG5ldyBncy5Qb2ludCgwLjUsIDAuNSlcbiAgICAgICAgXVxuXG4gICAgb25Ib3RzcG90Q2xpY2s6IChlLCBkYXRhKSAtPlxuICAgICAgICBAZXhlY3V0ZUFjdGlvbihkYXRhLnBhcmFtcy5hY3Rpb25zLm9uQ2xpY2ssIG5vLCBkYXRhLmJpbmRWYWx1ZSlcbiAgICBvbkhvdHNwb3RFbnRlcjogKGUsIGRhdGEpIC0+XG4gICAgICAgIEBleGVjdXRlQWN0aW9uKGRhdGEucGFyYW1zLmFjdGlvbnMub25FbnRlciwgeWVzLCBkYXRhLmJpbmRWYWx1ZSlcbiAgICBvbkhvdHNwb3RMZWF2ZTogKGUsIGRhdGEpIC0+XG4gICAgICAgIEBleGVjdXRlQWN0aW9uKGRhdGEucGFyYW1zLmFjdGlvbnMub25MZWF2ZSwgbm8sIGRhdGEuYmluZFZhbHVlKVxuICAgIG9uSG90c3BvdERyYWdTdGFydDogKGUsIGRhdGEpIC0+XG4gICAgICAgIEBleGVjdXRlQWN0aW9uKGRhdGEucGFyYW1zLmFjdGlvbnMub25EcmFnLCB5ZXMsIGRhdGEuYmluZFZhbHVlKVxuICAgIG9uSG90c3BvdERyYWc6IChlLCBkYXRhKSAtPlxuICAgICAgICBAZXhlY3V0ZUFjdGlvbihkYXRhLnBhcmFtcy5hY3Rpb25zLm9uRHJhZywgeWVzLCBkYXRhLmJpbmRWYWx1ZSlcbiAgICBvbkhvdHNwb3REcmFnRW5kOiAoZSwgZGF0YSkgLT5cbiAgICAgICAgQGV4ZWN1dGVBY3Rpb24oZGF0YS5wYXJhbXMuYWN0aW9ucy5vbkRyYWcsIG5vLCBkYXRhLmJpbmRWYWx1ZSlcbiAgICBvbkhvdHNwb3REcm9wOiAoZSwgZGF0YSkgLT5cbiAgICAgICAgQGV4ZWN1dGVBY3Rpb24oZGF0YS5wYXJhbXMuYWN0aW9ucy5vbkRyb3AsIG5vLCBkYXRhLmJpbmRWYWx1ZSlcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoXCJob3RzcG90RHJvcFwiLCBlLnNlbmRlcilcbiAgICBvbkhvdHNwb3REcm9wUmVjZWl2ZWQ6IChlLCBkYXRhKSAtPlxuICAgICAgICBAZXhlY3V0ZUFjdGlvbihkYXRhLnBhcmFtcy5hY3Rpb25zLm9uRHJvcFJlY2VpdmUsIHllcywgZGF0YS5iaW5kVmFsdWUpXG4gICAgb25Ib3RzcG90U3RhdGVDaGFuZ2VkOiAoZSwgcGFyYW1zKSAtPlxuICAgICAgICBpZiBlLnNlbmRlci5iZWhhdmlvci5zZWxlY3RlZFxuICAgICAgICAgICAgQGV4ZWN1dGVBY3Rpb24ocGFyYW1zLmFjdGlvbnMub25TZWxlY3QsIHllcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGV4ZWN1dGVBY3Rpb24ocGFyYW1zLmFjdGlvbnMub25EZXNlbGVjdCwgbm8pXG5cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgd2hlbiBhIEFEViBtZXNzYWdlIGZpbmlzaGVkIHJlbmRlcmluZyBhbmQgaXMgbm93IHdhaXRpbmdcbiAgICAqIGZvciB0aGUgdXNlci9hdXRvbS1tZXNzYWdlIHRpbWVyIHRvIHByb2NlZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbk1lc3NhZ2VBRFZXYWl0aW5nXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBvbk1lc3NhZ2VBRFZXYWl0aW5nOiAoZSkgLT5cbiAgICAgICAgbWVzc2FnZU9iamVjdCA9IGUuc2VuZGVyLm9iamVjdFxuICAgICAgICBpZiAhQG1lc3NhZ2VTZXR0aW5ncygpLndhaXRBdEVuZFxuICAgICAgICAgICAgaWYgZS5kYXRhLnBhcmFtcy53YWl0Rm9yQ29tcGxldGlvblxuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC50ZXh0UmVuZGVyZXIuaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QudGV4dFJlbmRlcmVyLmlzUnVubmluZyA9IG5vXG4gICAgICAgIG1lc3NhZ2VPYmplY3QuZXZlbnRzLm9mZiBcIndhaXRpbmdcIiwgZS5oYW5kbGVyXG5cbiAgICAgICAgaWYgQG1lc3NhZ2VTZXR0aW5ncygpLmJhY2tsb2cgYW5kIChtZXNzYWdlT2JqZWN0LnNldHRpbmdzLmF1dG9FcmFzZSBvciBtZXNzYWdlT2JqZWN0LnNldHRpbmdzLnBhcmFncmFwaFNwYWNpbmcgPiAwKVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuYmFja2xvZy5wdXNoKHsgY2hhcmFjdGVyOiBtZXNzYWdlT2JqZWN0LmNoYXJhY3RlciwgbWVzc2FnZTogbWVzc2FnZU9iamVjdC50ZXh0UmVuZGVyZXIucmVwbGFjZVBsYWNlaG9sZGVyVG9rZW5zKG1lc3NhZ2VPYmplY3QuYmVoYXZpb3IubWVzc2FnZSksIGNob2ljZXM6IFtdIH0pXG5cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgd2hlbiBhbiBBRFYgbWVzc2FnZSBmaW5pc2hlZCBmYWRlLW91dC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uTWVzc2FnZUFEVkRpc2FwcGVhclxuICAgICogQHJldHVybiB7T2JqZWN0fSBFdmVudCBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgb25NZXNzYWdlQURWRGlzYXBwZWFyOiAobWVzc2FnZU9iamVjdCwgd2FpdEZvckNvbXBsZXRpb24pIC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5jdXJyZW50Q2hhcmFjdGVyID0geyBuYW1lOiBcIlwiIH1cbiAgICAgICAgbWVzc2FnZU9iamVjdC5iZWhhdmlvci5jbGVhcigpXG4gICAgICAgIG1lc3NhZ2VPYmplY3QudmlzaWJsZSA9IG5vXG5cbiAgICAgICAgaWYgbWVzc2FnZU9iamVjdC53YWl0Rm9yQ29tcGxldGlvblxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgIEB3YWl0aW5nRm9yLm1lc3NhZ2VBRFYgPSBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgd2hlbiBhbiBBRFYgbWVzc2FnZSBmaW5pc2hlZCBjbGVhci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uTWVzc2FnZUFEVkNsZWFyXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBvbk1lc3NhZ2VBRFZDbGVhcjogKG1lc3NhZ2VPYmplY3QsIHdhaXRGb3JDb21wbGV0aW9uKSAtPlxuICAgICAgICBtZXNzYWdlT2JqZWN0ID0gQHRhcmdldE1lc3NhZ2UoKVxuICAgICAgICBpZiBAbWVzc2FnZVNldHRpbmdzKCkuYmFja2xvZyAmJiBtZXNzYWdlT2JqZWN0LmJlaGF2aW9yLm1lc3NhZ2U/Lmxlbmd0aFxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuYmFja2xvZy5wdXNoKHsgY2hhcmFjdGVyOiBtZXNzYWdlT2JqZWN0LmNoYXJhY3RlciwgbWVzc2FnZTogbWVzc2FnZU9iamVjdC5iZWhhdmlvci5tZXNzYWdlLCBjaG9pY2VzOiBbXSB9KVxuICAgICAgICBAb25NZXNzYWdlQURWRGlzYXBwZWFyKG1lc3NhZ2VPYmplY3QsIHdhaXRGb3JDb21wbGV0aW9uKVxuXG5cblxuICAgICMjIypcbiAgICAqIENhbGxlZCB3aGVuIGEgaG90c3BvdC9pbWFnZS1tYXAgc2VuZHMgYSBcImp1bXBUb1wiIGV2ZW50IHRvIGxldCB0aGVcbiAgICAqIGludGVycHJldGVyIGp1bXAgdG8gdGhlIHBvc2l0aW9uIGRlZmluZWQgaW4gdGhlIGV2ZW50IG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uSnVtcFRvXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBvbkp1bXBUbzogKGUpIC0+XG4gICAgICAgIEBqdW1wVG9MYWJlbChlLmxhYmVsKVxuICAgICAgICBAaXNXYWl0aW5nID0gbm9cblxuICAgICMjIypcbiAgICAqIENhbGxlZCB3aGVuIGEgaG90c3BvdC9pbWFnZS1tYXAgc2VuZHMgYSBcImNhbGxDb21tb25FdmVudFwiIGV2ZW50IHRvIGxldCB0aGVcbiAgICAqIGludGVycHJldGVyIGNhbGwgdGhlIGNvbW1vbiBldmVudCBkZWZpbmVkIGluIHRoZSBldmVudCBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbkp1bXBUb1xuICAgICogQHJldHVybiB7T2JqZWN0fSBFdmVudCBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgb25DYWxsQ29tbW9uRXZlbnQ6IChlKSAtPlxuICAgICAgICBldmVudElkID0gZS5jb21tb25FdmVudElkXG4gICAgICAgIGV2ZW50ID0gUmVjb3JkTWFuYWdlci5jb21tb25FdmVudHNbZXZlbnRJZF1cbiAgICAgICAgaWYgIWV2ZW50XG4gICAgICAgICAgICBldmVudCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzLmZpcnN0ICh4KSA9PiB4Lm5hbWUgPT0gZXZlbnRJZFxuICAgICAgICAgICAgZXZlbnRJZCA9IGV2ZW50LmluZGV4IGlmIGV2ZW50XG4gICAgICAgIEBjYWxsQ29tbW9uRXZlbnQoZXZlbnRJZCwgZS5wYXJhbXMgfHwgW10sICFlLmZpbmlzaClcbiAgICAgICAgQGlzV2FpdGluZyA9IGUud2FpdGluZyA/IG5vXG5cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgd2hlbiBhIEFEViBtZXNzYWdlIGZpbmlzaGVzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb25NZXNzYWdlQURWRmluaXNoXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBvbk1lc3NhZ2VBRFZGaW5pc2g6IChlKSAtPlxuICAgICAgICBtZXNzYWdlT2JqZWN0ID0gZS5zZW5kZXIub2JqZWN0XG5cbiAgICAgICAgaWYgbm90IEBtZXNzYWdlU2V0dGluZ3MoKS53YWl0QXRFbmQgdGhlbiByZXR1cm5cblxuICAgICAgICBHYW1lTWFuYWdlci5nbG9iYWxEYXRhLm1lc3NhZ2VzW2xjc20oZS5kYXRhLnBhcmFtcy5tZXNzYWdlKV0gPSB7IHJlYWQ6IHllcyB9XG4gICAgICAgIEdhbWVNYW5hZ2VyLnNhdmVHbG9iYWxEYXRhKClcbiAgICAgICAgaWYgZS5kYXRhLnBhcmFtcy53YWl0Rm9yQ29tcGxldGlvblxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgIEB3YWl0aW5nRm9yLm1lc3NhZ2VBRFYgPSBudWxsXG4gICAgICAgIHBvaW50ZXIgPSBAcG9pbnRlclxuICAgICAgICBjb21tYW5kcyA9IEBvYmplY3QuY29tbWFuZHNcblxuICAgICAgICBtZXNzYWdlT2JqZWN0LmV2ZW50cy5vZmYgXCJmaW5pc2hcIiwgZS5oYW5kbGVyXG4gICAgICAgICNtZXNzYWdlT2JqZWN0LmNoYXJhY3RlciA9IG51bGxcblxuICAgICAgICBpZiBtZXNzYWdlT2JqZWN0LnZvaWNlPyBhbmQgR2FtZU1hbmFnZXIuc2V0dGluZ3Muc2tpcFZvaWNlT25BY3Rpb25cbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wU291bmQobWVzc2FnZU9iamVjdC52b2ljZS5uYW1lKVxuXG4gICAgICAgIGlmIG5vdCBAaXNNZXNzYWdlQ29tbWFuZChwb2ludGVyLCBjb21tYW5kcykgYW5kIEBtZXNzYWdlU2V0dGluZ3MoKS5hdXRvRXJhc2VcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0aW5nRm9yLm1lc3NhZ2VBRFYgPSBlLmRhdGEucGFyYW1zXG5cbiAgICAgICAgICAgIGZhZGluZyA9IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5tZXNzYWdlRmFkaW5nXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGlmIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwIHRoZW4gMCBlbHNlIGZhZGluZy5kdXJhdGlvblxuXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LndhaXRGb3JDb21wbGV0aW9uID0gZS5kYXRhLnBhcmFtcy53YWl0Rm9yQ29tcGxldGlvblxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5hbmltYXRvci5kaXNhcHBlYXIoZmFkaW5nLmFuaW1hdGlvbiwgZmFkaW5nLmVhc2luZywgZHVyYXRpb24sIGdzLkNhbGxCYWNrKFwib25NZXNzYWdlQURWRGlzYXBwZWFyXCIsIHRoaXMsIGUuZGF0YS5wYXJhbXMud2FpdEZvckNvbXBsZXRpb24pKVxuXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIHdoZW4gYSBjb21tb24gZXZlbnQgZmluaXNoZWQgZXhlY3V0aW9uLiBJbiBtb3N0IGNhc2VzLCB0aGUgaW50ZXJwcmV0ZXJcbiAgICAqIHdpbGwgc3RvcCB3YWl0aW5nIGFuZCBjb250aW51ZSBwcm9jZXNzaW5nIGFmdGVyIHRoaXMuIEJ1dCBoXG4gICAgKlxuICAgICogQG1ldGhvZCBvbkNvbW1vbkV2ZW50RmluaXNoXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBvbkNvbW1vbkV2ZW50RmluaXNoOiAoZSkgLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmNvbW1vbkV2ZW50Q29udGFpbmVyLnJlbW92ZU9iamVjdChlLnNlbmRlci5vYmplY3QpXG4gICAgICAgIGUuc2VuZGVyLm9iamVjdC5ldmVudHMub2ZmIFwiZmluaXNoXCJcbiAgICAgICAgQHN1YkludGVycHJldGVyID0gbnVsbFxuICAgICAgICBAaXNXYWl0aW5nID0gZS5kYXRhLndhaXRpbmcgPyBub1xuXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIHdoZW4gYSBzY2VuZSBjYWxsIGZpbmlzaGVkIGV4ZWN1dGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uQ2FsbFNjZW5lRmluaXNoXG4gICAgKiBAcGFyYW0ge09iamVjdH0gc2VuZGVyIC0gVGhlIHNlbmRlciBvZiB0aGlzIGV2ZW50LlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIG9uQ2FsbFNjZW5lRmluaXNoOiAoc2VuZGVyKSAtPlxuICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgQHN1YkludGVycHJldGVyID0gbnVsbFxuXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyB0aGUgaW50ZXJwcmV0ZXIgaW50byBhIGRhdGEtYnVuZGxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdG9EYXRhQnVuZGxlXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBkYXRhLWJ1bmRsZS5cbiAgICAjIyNcbiAgICB0b0RhdGFCdW5kbGU6IC0+XG4gICAgICAgIGlmIEBpc0lucHV0RGF0YUNvbW1hbmQoTWF0aC5tYXgoQHBvaW50ZXIgLSAxLCAwKSwgQG9iamVjdC5jb21tYW5kcylcbiAgICAgICAgICAgIHBvaW50ZXI6IE1hdGgubWF4KEBwb2ludGVyIC0gMSAsIDApLFxuICAgICAgICAgICAgY2hvaWNlOiBAY2hvaWNlLFxuICAgICAgICAgICAgY29uZGl0aW9uczogQGNvbmRpdGlvbnMsXG4gICAgICAgICAgICBsb29wczogQGxvb3BzLFxuICAgICAgICAgICAgbGFiZWxzOiBAbGFiZWxzLFxuICAgICAgICAgICAgaXNXYWl0aW5nOiBubyxcbiAgICAgICAgICAgIGlzUnVubmluZzogQGlzUnVubmluZyxcbiAgICAgICAgICAgIHdhaXRDb3VudGVyOiBAd2FpdENvdW50ZXIsXG4gICAgICAgICAgICB3YWl0aW5nRm9yOiBAd2FpdGluZ0ZvcixcbiAgICAgICAgICAgIGluZGVudDogQGluZGVudCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBAc2V0dGluZ3NcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG9pbnRlcjogQHBvaW50ZXIsXG4gICAgICAgICAgICBjaG9pY2U6IEBjaG9pY2UsXG4gICAgICAgICAgICBjb25kaXRpb25zOiBAY29uZGl0aW9ucyxcbiAgICAgICAgICAgIGxvb3BzOiBAbG9vcHMsXG4gICAgICAgICAgICBsYWJlbHM6IEBsYWJlbHMsXG4gICAgICAgICAgICBpc1dhaXRpbmc6IEBpc1dhaXRpbmcsXG4gICAgICAgICAgICBpc1J1bm5pbmc6IEBpc1J1bm5pbmcsXG4gICAgICAgICAgICB3YWl0Q291bnRlcjogQHdhaXRDb3VudGVyLFxuICAgICAgICAgICAgd2FpdGluZ0ZvcjogQHdhaXRpbmdGb3IsXG4gICAgICAgICAgICBpbmRlbnQ6IEBpbmRlbnQsXG4gICAgICAgICAgICBzZXR0aW5nczogQHNldHRpbmdzXG5cbiAgICAjIyMqXG4gICAgIyBQcmV2aWV3cyB0aGUgY3VycmVudCBzY2VuZSBhdCB0aGUgc3BlY2lmaWVkIHBvaW50ZXIuIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmcm9tIHRoZVxuICAgICMgVk4gTWFrZXIgU2NlbmUtRWRpdG9yIGlmIGxpdmUtcHJldmlldyBpcyBlbmFibGVkIGFuZCB0aGUgdXNlciBjbGlja2VkIG9uIGEgY29tbWFuZC5cbiAgICAjXG4gICAgIyBAbWV0aG9kIHByZXZpZXdcbiAgICAjIyNcbiAgICBwcmV2aWV3OiAtPlxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHJldHVybiBpZiAhJFBBUkFNUy5wcmV2aWV3IG9yICEkUEFSQU1TLnByZXZpZXcuc2NlbmVcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wQWxsU291bmRzKClcbiAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wQWxsTXVzaWMoKVxuICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnN0b3BBbGxWb2ljZXMoKVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmNob2ljZXMgPSBbXVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2V0dXBDdXJzb3IoKVxuICAgICAgICAgICAgQHByZXZpZXdEYXRhID0gJFBBUkFNUy5wcmV2aWV3XG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcInByZXZpZXdSZXN0YXJ0XCIpXG4gICAgICAgICAgICBpZiBAcHJldmlld0luZm8udGltZW91dFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChAcHJldmlld0luZm8udGltZW91dClcblxuICAgICAgICAgICAgaWYgR3JhcGhpY3Muc3RvcHBlZFxuICAgICAgICAgICAgICAgIEdyYXBoaWNzLnN0b3BwZWQgPSBub1xuICAgICAgICAgICAgICAgIEdyYXBoaWNzLm9uRWFjaEZyYW1lKGdzLk1haW4uZnJhbWVDYWxsYmFjaylcblxuICAgICAgICAgICAgc2NlbmUgPSBuZXcgdm4uT2JqZWN0X1NjZW5lKClcblxuICAgICAgICAgICAgc2NlbmUuc2NlbmVEYXRhLnVpZCA9IEBwcmV2aWV3RGF0YS5zY2VuZS51aWRcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhzY2VuZSlcbiAgICAgICAgY2F0Y2ggZXhcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihleClcblxuICAgICMjIypcbiAgICAjIFNldHMgdXAgdGhlIGludGVycHJldGVyLlxuICAgICNcbiAgICAjIEBtZXRob2Qgc2V0dXBcbiAgICAjIyNcbiAgICBzZXR1cDogLT5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICBAcHJldmlld0RhdGEgPSAkUEFSQU1TLnByZXZpZXdcbiAgICAgICAgaWYgQHByZXZpZXdEYXRhXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJtb3VzZURvd25cIiwgKD0+XG4gICAgICAgICAgICAgICAgaWYgQHByZXZpZXdJbmZvLndhaXRpbmdcbiAgICAgICAgICAgICAgICAgICAgaWYgQHByZXZpZXdJbmZvLnRpbWVvdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChAcHJldmlld0luZm8udGltZW91dClcbiAgICAgICAgICAgICAgICAgICAgQHByZXZpZXdJbmZvLndhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgICAgICAjQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwID0gbm9cbiAgICAgICAgICAgICAgICAgICAgQHByZXZpZXdEYXRhID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcInByZXZpZXdSZXN0YXJ0XCIpXG4gICAgICAgICAgICAgICAgKSwgbnVsbCwgQG9iamVjdFxuXG4gICAgIyMjKlxuICAgICMgRGlzcG9zZXMgdGhlIGludGVycHJldGVyLlxuICAgICNcbiAgICAjIEBtZXRob2QgZGlzcG9zZVxuICAgICMjI1xuICAgIGRpc3Bvc2U6IC0+XG4gICAgICAgIGlmIEBwcmV2aWV3RGF0YVxuICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZURvd25cIiwgQG9iamVjdClcblxuXG4gICAgICAgIHN1cGVyXG5cblxuICAgIGlzSW5zdGFudFNraXA6IC0+IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwIGFuZCBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWUgPT0gMFxuXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgdGhlIGludGVycHJldGVyIGZyb20gYSBkYXRhLWJ1bmRsZVxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGJ1bmRsZS0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjI1xuICAgIHJlc3RvcmU6IC0+XG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSBkZWZhdWx0IGdhbWUgbWVzc2FnZSBmb3Igbm92ZWwtbW9kZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1lc3NhZ2VPYmplY3ROVkxcbiAgICAqIEByZXR1cm4ge3VpLk9iamVjdF9NZXNzYWdlfSBUaGUgTlZMIGdhbWUgbWVzc2FnZSBvYmplY3QuXG4gICAgIyMjXG4gICAgbWVzc2FnZU9iamVjdE5WTDogLT4gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJudmxHYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSBkZWZhdWx0IGdhbWUgbWVzc2FnZSBmb3IgYWR2ZW50dXJlLW1vZGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBtZXNzYWdlT2JqZWN0QURWXG4gICAgKiBAcmV0dXJuIHt1aS5PYmplY3RfTWVzc2FnZX0gVGhlIEFEViBnYW1lIG1lc3NhZ2Ugb2JqZWN0LlxuICAgICMjI1xuICAgIG1lc3NhZ2VPYmplY3RBRFY6IC0+XG4gICAgICAgIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiZ2FtZU1lc3NhZ2VfbWVzc2FnZVwiKVxuXG4gICAgIyMjKlxuICAgICogU3RhcnRzIHRoZSBpbnRlcnByZXRlclxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RhcnRcbiAgICAjIyNcbiAgICBzdGFydDogLT5cbiAgICAgICAgQGNvbmRpdGlvbnMgPSBbXVxuICAgICAgICBAbG9vcHMgPSBbXVxuICAgICAgICBAaW5kZW50ID0gMFxuICAgICAgICBAcG9pbnRlciA9IDBcbiAgICAgICAgQGlzUnVubmluZyA9IHllc1xuICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgQHN1YkludGVycHJldGVyID0gbnVsbFxuICAgICAgICBAd2FpdENvdW50ZXIgPSAwXG5cbiAgICAjIyMqXG4gICAgKiBTdG9wcyB0aGUgaW50ZXJwcmV0ZXJcbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0b3BcbiAgICAjIyNcbiAgICBzdG9wOiAtPlxuICAgICAgICBAaXNSdW5uaW5nID0gbm9cblxuICAgICMjIypcbiAgICAqIFJlc3VtZXMgdGhlIGludGVycHJldGVyXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN1bWVcbiAgICAjIyNcbiAgICByZXN1bWU6IC0+XG4gICAgICAgIEBpc1J1bm5pbmcgPSB5ZXNcblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGludGVycHJldGVyIGFuZCBleGVjdXRlcyBhbGwgY29tbWFuZHMgdW50aWwgdGhlIG5leHQgd2FpdCBpc1xuICAgICogdHJpZ2dlcmVkIGJ5IGEgY29tbWFuZC4gU28gaW4gdGhlIGNhc2Ugb2YgYW4gZW5kbGVzcy1sb29wIHRoZSBtZXRob2Qgd2lsbFxuICAgICogbmV2ZXIgcmV0dXJuLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBpZiBAc3ViSW50ZXJwcmV0ZXI/XG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIudXBkYXRlKClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXBUZW1wVmFyaWFibGVzKEBjb250ZXh0KVxuXG4gICAgICAgIGlmIChub3QgQG9iamVjdC5jb21tYW5kcz8gb3IgQHBvaW50ZXIgPj0gQG9iamVjdC5jb21tYW5kcy5sZW5ndGgpIGFuZCBub3QgQGlzV2FpdGluZ1xuICAgICAgICAgICAgaWYgQHJlcGVhdFxuICAgICAgICAgICAgICAgIEBzdGFydCgpXG4gICAgICAgICAgICBlbHNlIGlmIEBpc1J1bm5pbmdcbiAgICAgICAgICAgICAgICBAaXNSdW5uaW5nID0gbm9cbiAgICAgICAgICAgICAgICBpZiBAb25GaW5pc2g/IHRoZW4gQG9uRmluaXNoKHRoaXMpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgaWYgbm90IEBpc1J1bm5pbmcgdGhlbiByZXR1cm5cblxuICAgICAgICBpZiBub3QgQG9iamVjdC5jb21tYW5kcy5vcHRpbWl6ZWRcbiAgICAgICAgICAgIERhdGFPcHRpbWl6ZXIub3B0aW1pemVFdmVudENvbW1hbmRzKEBvYmplY3QuY29tbWFuZHMpXG5cbiAgICAgICAgaWYgQHdhaXRDb3VudGVyID4gMFxuICAgICAgICAgICAgQHdhaXRDb3VudGVyLS1cbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBAd2FpdENvdW50ZXIgPiAwXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBpZiBAaXNXYWl0aW5nRm9yTWVzc2FnZVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgaWYgbm90IEBpc1Byb2Nlc3NpbmdNZXNzYWdlSW5PdGhlckNvbnRleHQoKVxuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmdGb3JNZXNzYWdlID0gbm9cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBpZiBHYW1lTWFuYWdlci5pbkxpdmVQcmV2aWV3XG4gICAgICAgICAgICB3aGlsZSBub3QgKEBpc1dhaXRpbmcgb3IgQHByZXZpZXdJbmZvLndhaXRpbmcpIGFuZCBAcG9pbnRlciA8IEBvYmplY3QuY29tbWFuZHMubGVuZ3RoIGFuZCBAaXNSdW5uaW5nXG4gICAgICAgICAgICAgICAgQGV4ZWN1dGVDb21tYW5kKEBwb2ludGVyKVxuXG4gICAgICAgICAgICAgICAgQHByZXZpZXdJbmZvLmV4ZWN1dGVkQ29tbWFuZHMrK1xuXG4gICAgICAgICAgICAgICAgaWYgQHByZXZpZXdJbmZvLmV4ZWN1dGVkQ29tbWFuZHMgPiA1MDBcbiAgICAgICAgICAgICAgICAgICAgQHByZXZpZXdJbmZvLmV4ZWN1dGVkQ29tbWFuZHMgPSAwXG4gICAgICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3aGlsZSBub3QgKEBpc1dhaXRpbmcgb3IgQHByZXZpZXdJbmZvLndhaXRpbmcpIGFuZCBAcG9pbnRlciA8IEBvYmplY3QuY29tbWFuZHMubGVuZ3RoIGFuZCBAaXNSdW5uaW5nXG4gICAgICAgICAgICAgICAgQGV4ZWN1dGVDb21tYW5kKEBwb2ludGVyKVxuXG5cbiAgICAgICAgaWYgQHBvaW50ZXIgPj0gQG9iamVjdC5jb21tYW5kcy5sZW5ndGggYW5kIG5vdCBAaXNXYWl0aW5nXG4gICAgICAgICAgICBpZiBAcmVwZWF0XG4gICAgICAgICAgICAgICAgQHN0YXJ0KClcbiAgICAgICAgICAgIGVsc2UgaWYgQGlzUnVubmluZ1xuICAgICAgICAgICAgICAgIEBpc1J1bm5pbmcgPSBub1xuICAgICAgICAgICAgICAgIGlmIEBvbkZpbmlzaD8gdGhlbiBAb25GaW5pc2godGhpcylcblxuXG5cblxuICAgICMjIypcbiAgICAqIEFzc2lnbnMgdGhlIGNvcnJlY3QgY29tbWFuZC1mdW5jdGlvbiB0byB0aGUgc3BlY2lmaWVkIGNvbW1hbmQtb2JqZWN0IGlmXG4gICAgKiBuZWNlc3NhcnkuXG4gICAgKlxuICAgICogQG1ldGhvZCBhc3NpZ25Db21tYW5kXG4gICAgIyMjXG4gICAgYXNzaWduQ29tbWFuZDogKGNvbW1hbmQpIC0+XG4gICAgICAgIHN3aXRjaCBjb21tYW5kLmlkXG4gICAgICAgICAgICB3aGVuIFwiZ3MuSWRsZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRJZGxlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU3RhcnRUaW1lclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTdGFydFRpbWVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUGF1c2VUaW1lclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQYXVzZVRpbWVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUmVzdW1lVGltZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUmVzdW1lVGltZXJcbiAgICAgICAgICAgIHdoZW4gXCJncy5TdG9wVGltZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU3RvcFRpbWVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuV2FpdENvbW1hbmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kV2FpdFxuICAgICAgICAgICAgd2hlbiBcImdzLkxvb3BDb21tYW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExvb3BcbiAgICAgICAgICAgIHdoZW4gXCJncy5Mb29wRm9ySW5MaXN0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExvb3BGb3JJbkxpc3RcbiAgICAgICAgICAgIHdoZW4gXCJncy5CcmVha0xvb3BDb21tYW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEJyZWFrTG9vcFxuICAgICAgICAgICAgd2hlbiBcImdzLkNvbW1lbnRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IC0+IDBcbiAgICAgICAgICAgIHdoZW4gXCJncy5FbXB0eUNvbW1hbmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IC0+IDBcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0QWRkXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RBZGRcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0UG9wXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RQb3BcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0U2hpZnRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdFNoaWZ0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdFJlbW92ZUF0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RSZW1vdmVBdFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RJbnNlcnRBdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0SW5zZXJ0QXRcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0VmFsdWVBdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0VmFsdWVBdFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RDbGVhclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0Q2xlYXJcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0U2h1ZmZsZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0U2h1ZmZsZVxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RTb3J0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RTb3J0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdEluZGV4T2ZcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdEluZGV4T2ZcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0U2V0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RTZXRcbiAgICAgICAgICAgIHdoZW4gXCJncy5MaXN0Q29weVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMaXN0Q29weVxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RMZW5ndGhcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTGlzdExlbmd0aFxuICAgICAgICAgICAgd2hlbiBcImdzLkxpc3RKb2luXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RKb2luXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTGlzdEZyb21UZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExpc3RGcm9tVGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLlJlc2V0VmFyaWFibGVzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJlc2V0VmFyaWFibGVzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlVmFyaWFibGVEb21haW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlVmFyaWFibGVEb21haW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VOdW1iZXJWYXJpYWJsZXNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlTnVtYmVyVmFyaWFibGVzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlRGVjaW1hbFZhcmlhYmxlc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VEZWNpbWFsVmFyaWFibGVzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlQm9vbGVhblZhcmlhYmxlc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VCb29sZWFuVmFyaWFibGVzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlU3RyaW5nVmFyaWFibGVzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVN0cmluZ1ZhcmlhYmxlc1xuICAgICAgICAgICAgd2hlbiBcImdzLkNoZWNrU3dpdGNoXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoZWNrU3dpdGNoXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hlY2tOdW1iZXJWYXJpYWJsZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGVja051bWJlclZhcmlhYmxlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hlY2tUZXh0VmFyaWFibGVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hlY2tUZXh0VmFyaWFibGVcbiAgICAgICAgICAgIHdoZW4gXCJncy5Db25kaXRpb25cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ29uZGl0aW9uXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ29uZGl0aW9uRWxzZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDb25kaXRpb25FbHNlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ29uZGl0aW9uRWxzZUlmXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENvbmRpdGlvbkVsc2VJZlxuICAgICAgICAgICAgd2hlbiBcImdzLkxhYmVsXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExhYmVsXG4gICAgICAgICAgICB3aGVuIFwiZ3MuSnVtcFRvTGFiZWxcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kSnVtcFRvTGFiZWxcbiAgICAgICAgICAgIHdoZW4gXCJncy5TZXRNZXNzYWdlQXJlYVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTZXRNZXNzYWdlQXJlYVxuICAgICAgICAgICAgd2hlbiBcImdzLlNob3dNZXNzYWdlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNob3dNZXNzYWdlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2hvd1BhcnRpYWxNZXNzYWdlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNob3dQYXJ0aWFsTWVzc2FnZVxuICAgICAgICAgICAgd2hlbiBcImdzLk1lc3NhZ2VGYWRpbmdcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTWVzc2FnZUZhZGluZ1xuICAgICAgICAgICAgd2hlbiBcImdzLk1lc3NhZ2VTZXR0aW5nc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNZXNzYWdlU2V0dGluZ3NcbiAgICAgICAgICAgIHdoZW4gXCJncy5DcmVhdGVNZXNzYWdlQXJlYVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDcmVhdGVNZXNzYWdlQXJlYVxuICAgICAgICAgICAgd2hlbiBcImdzLkVyYXNlTWVzc2FnZUFyZWFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRXJhc2VNZXNzYWdlQXJlYVxuICAgICAgICAgICAgd2hlbiBcImdzLlNldFRhcmdldE1lc3NhZ2VcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2V0VGFyZ2V0TWVzc2FnZVxuICAgICAgICAgICAgd2hlbiBcInZuLk1lc3NhZ2VCb3hEZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNZXNzYWdlQm94RGVmYXVsdHNcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5NZXNzYWdlQm94VmlzaWJpbGl0eVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNZXNzYWdlQm94VmlzaWJpbGl0eVxuICAgICAgICAgICAgd2hlbiBcInZuLk1lc3NhZ2VWaXNpYmlsaXR5XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1lc3NhZ2VWaXNpYmlsaXR5XG4gICAgICAgICAgICB3aGVuIFwidm4uQmFja2xvZ1Zpc2liaWxpdHlcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQmFja2xvZ1Zpc2liaWxpdHlcbiAgICAgICAgICAgIHdoZW4gXCJncy5DbGVhck1lc3NhZ2VcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2xlYXJNZXNzYWdlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlV2VhdGhlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VXZWF0aGVyXG4gICAgICAgICAgICB3aGVuIFwiZ3MuRnJlZXplU2NyZWVuXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEZyZWV6ZVNjcmVlblxuICAgICAgICAgICAgd2hlbiBcImdzLlNjcmVlblRyYW5zaXRpb25cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2NyZWVuVHJhbnNpdGlvblxuICAgICAgICAgICAgd2hlbiBcImdzLlNoYWtlU2NyZWVuXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNoYWtlU2NyZWVuXG4gICAgICAgICAgICB3aGVuIFwiZ3MuVGludFNjcmVlblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUaW50U2NyZWVuXG4gICAgICAgICAgICB3aGVuIFwiZ3MuRmxhc2hTY3JlZW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRmxhc2hTY3JlZW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5ab29tU2NyZWVuXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFpvb21TY3JlZW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5Sb3RhdGVTY3JlZW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUm90YXRlU2NyZWVuXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUGFuU2NyZWVuXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBhblNjcmVlblxuICAgICAgICAgICAgd2hlbiBcImdzLlNjcmVlbkVmZmVjdFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTY3JlZW5FZmZlY3RcbiAgICAgICAgICAgIHdoZW4gXCJncy5TaG93VmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hvd1ZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTW92ZVZpZGVvXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1vdmVWaWRlb1xuICAgICAgICAgICAgd2hlbiBcImdzLk1vdmVWaWRlb1BhdGhcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZVZpZGVvUGF0aFxuICAgICAgICAgICAgd2hlbiBcImdzLlRpbnRWaWRlb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUaW50VmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5GbGFzaFZpZGVvXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEZsYXNoVmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5Dcm9wVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ3JvcFZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUm90YXRlVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUm90YXRlVmlkZW9cbiAgICAgICAgICAgIHdoZW4gXCJncy5ab29tVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kWm9vbVZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQmxlbmRWaWRlb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCbGVuZFZpZGVvXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTWFza1ZpZGVvXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1hc2tWaWRlb1xuICAgICAgICAgICAgd2hlbiBcImdzLlZpZGVvRWZmZWN0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFZpZGVvRWZmZWN0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuVmlkZW9Nb3Rpb25CbHVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFZpZGVvTW90aW9uQmx1clxuICAgICAgICAgICAgd2hlbiBcImdzLlZpZGVvRGVmYXVsdHNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVmlkZW9EZWZhdWx0c1xuICAgICAgICAgICAgd2hlbiBcImdzLkVyYXNlVmlkZW9cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRXJhc2VWaWRlb1xuICAgICAgICAgICAgd2hlbiBcImdzLlNob3dJbWFnZU1hcFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTaG93SW1hZ2VNYXBcbiAgICAgICAgICAgIHdoZW4gXCJncy5FcmFzZUltYWdlTWFwXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEVyYXNlSW1hZ2VNYXBcbiAgICAgICAgICAgIHdoZW4gXCJncy5BZGRIb3RzcG90XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEFkZEhvdHNwb3RcbiAgICAgICAgICAgIHdoZW4gXCJncy5FcmFzZUhvdHNwb3RcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRXJhc2VIb3RzcG90XG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlSG90c3BvdFN0YXRlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZUhvdHNwb3RTdGF0ZVxuICAgICAgICAgICAgd2hlbiBcImdzLlNob3dQaWN0dXJlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNob3dQaWN0dXJlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTW92ZVBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZVBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5Nb3ZlUGljdHVyZVBhdGhcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTW92ZVBpY3R1cmVQYXRoXG4gICAgICAgICAgICB3aGVuIFwiZ3MuVGludFBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVGludFBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5GbGFzaFBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kRmxhc2hQaWN0dXJlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ3JvcFBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ3JvcFBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5Sb3RhdGVQaWN0dXJlXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJvdGF0ZVBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5ab29tUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRab29tUGljdHVyZVxuICAgICAgICAgICAgd2hlbiBcImdzLkJsZW5kUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCbGVuZFBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5TaGFrZVBpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hha2VQaWN0dXJlXG4gICAgICAgICAgICB3aGVuIFwiZ3MuTWFza1BpY3R1cmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTWFza1BpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5QaWN0dXJlRWZmZWN0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBpY3R1cmVFZmZlY3RcbiAgICAgICAgICAgIHdoZW4gXCJncy5QaWN0dXJlTW90aW9uQmx1clwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQaWN0dXJlTW90aW9uQmx1clxuICAgICAgICAgICAgd2hlbiBcImdzLlBpY3R1cmVEZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQaWN0dXJlRGVmYXVsdHNcbiAgICAgICAgICAgIHdoZW4gXCJncy5QbGF5UGljdHVyZUFuaW1hdGlvblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQbGF5UGljdHVyZUFuaW1hdGlvblxuICAgICAgICAgICAgd2hlbiBcImdzLkVyYXNlUGljdHVyZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRFcmFzZVBpY3R1cmVcbiAgICAgICAgICAgIHdoZW4gXCJncy5JbnB1dE51bWJlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRJbnB1dE51bWJlclxuICAgICAgICAgICAgd2hlbiBcImdzLlNldElucHV0U2Vzc2lvblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTZXRJbnB1dFNlc3Npb25cbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaG9pY2VcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hvd0Nob2ljZVxuICAgICAgICAgICAgd2hlbiBcInZuLkNob2ljZVRpbWVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENob2ljZVRpbWVyXG4gICAgICAgICAgICB3aGVuIFwidm4uU2hvd0Nob2ljZXNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hvd0Nob2ljZXNcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5VbmxvY2tDR1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRVbmxvY2tDR1xuICAgICAgICAgICAgd2hlbiBcInZuLkwyREpvaW5TY2VuZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMMkRKb2luU2NlbmVcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5MMkRFeGl0U2NlbmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTDJERXhpdFNjZW5lXG4gICAgICAgICAgICB3aGVuIFwidm4uTDJETW90aW9uXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEwyRE1vdGlvblxuICAgICAgICAgICAgd2hlbiBcInZuLkwyRE1vdGlvbkdyb3VwXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEwyRE1vdGlvbkdyb3VwXG4gICAgICAgICAgICB3aGVuIFwidm4uTDJERXhwcmVzc2lvblwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMMkRFeHByZXNzaW9uXG4gICAgICAgICAgICB3aGVuIFwidm4uTDJETW92ZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRMMkRNb3ZlXG4gICAgICAgICAgICB3aGVuIFwidm4uTDJEUGFyYW1ldGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEwyRFBhcmFtZXRlclxuICAgICAgICAgICAgd2hlbiBcInZuLkwyRFNldHRpbmdzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEwyRFNldHRpbmdzXG4gICAgICAgICAgICB3aGVuIFwidm4uTDJERGVmYXVsdHNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTDJERGVmYXVsdHNcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFyYWN0ZXJKb2luU2NlbmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhcmFjdGVySm9pblNjZW5lXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVyRXhpdFNjZW5lXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYXJhY3RlckV4aXRTY2VuZVxuICAgICAgICAgICAgd2hlbiBcInZuLkNoYXJhY3RlckNoYW5nZUV4cHJlc3Npb25cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhcmFjdGVyQ2hhbmdlRXhwcmVzc2lvblxuICAgICAgICAgICAgd2hlbiBcInZuLkNoYXJhY3RlclNldFBhcmFtZXRlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFyYWN0ZXJTZXRQYXJhbWV0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFyYWN0ZXJHZXRQYXJhbWV0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhcmFjdGVyR2V0UGFyYW1ldGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVyRGVmYXVsdHNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhcmFjdGVyRGVmYXVsdHNcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFyYWN0ZXJFZmZlY3RcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhcmFjdGVyRWZmZWN0XG4gICAgICAgICAgICB3aGVuIFwidm4uWm9vbUNoYXJhY3RlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRab29tQ2hhcmFjdGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uUm90YXRlQ2hhcmFjdGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJvdGF0ZUNoYXJhY3RlclxuICAgICAgICAgICAgd2hlbiBcInZuLkJsZW5kQ2hhcmFjdGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEJsZW5kQ2hhcmFjdGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uU2hha2VDaGFyYWN0ZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2hha2VDaGFyYWN0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5NYXNrQ2hhcmFjdGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1hc2tDaGFyYWN0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5Nb3ZlQ2hhcmFjdGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZE1vdmVDaGFyYWN0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5Nb3ZlQ2hhcmFjdGVyUGF0aFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNb3ZlQ2hhcmFjdGVyUGF0aFxuICAgICAgICAgICAgd2hlbiBcInZuLkZsYXNoQ2hhcmFjdGVyXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEZsYXNoQ2hhcmFjdGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uVGludENoYXJhY3RlclwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUaW50Q2hhcmFjdGVyXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhcmFjdGVyTW90aW9uQmx1clwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFyYWN0ZXJNb3Rpb25CbHVyXG4gICAgICAgICAgICB3aGVuIFwidm4uQ2hhbmdlQmFja2dyb3VuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VCYWNrZ3JvdW5kXG4gICAgICAgICAgICB3aGVuIFwidm4uU2hha2VCYWNrZ3JvdW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNoYWtlQmFja2dyb3VuZFxuICAgICAgICAgICAgd2hlbiBcInZuLlNjcm9sbEJhY2tncm91bmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZFxuICAgICAgICAgICAgd2hlbiBcInZuLlNjcm9sbEJhY2tncm91bmRUb1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kVG9cbiAgICAgICAgICAgIHdoZW4gXCJ2bi5TY3JvbGxCYWNrZ3JvdW5kUGF0aFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kUGF0aFxuICAgICAgICAgICAgd2hlbiBcInZuLlpvb21CYWNrZ3JvdW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFpvb21CYWNrZ3JvdW5kXG4gICAgICAgICAgICB3aGVuIFwidm4uUm90YXRlQmFja2dyb3VuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSb3RhdGVCYWNrZ3JvdW5kXG4gICAgICAgICAgICB3aGVuIFwidm4uVGludEJhY2tncm91bmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVGludEJhY2tncm91bmRcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5CbGVuZEJhY2tncm91bmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQmxlbmRCYWNrZ3JvdW5kXG4gICAgICAgICAgICB3aGVuIFwidm4uTWFza0JhY2tncm91bmRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kTWFza0JhY2tncm91bmRcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5CYWNrZ3JvdW5kTW90aW9uQmx1clwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCYWNrZ3JvdW5kTW90aW9uQmx1clxuICAgICAgICAgICAgd2hlbiBcInZuLkJhY2tncm91bmRFZmZlY3RcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQmFja2dyb3VuZEVmZmVjdFxuICAgICAgICAgICAgd2hlbiBcInZuLkJhY2tncm91bmREZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCYWNrZ3JvdW5kRGVmYXVsdHNcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFuZ2VTY2VuZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VTY2VuZVxuICAgICAgICAgICAgd2hlbiBcInZuLlJldHVyblRvUHJldmlvdXNTY2VuZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSZXR1cm5Ub1ByZXZpb3VzU2NlbmVcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DYWxsU2NlbmVcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2FsbFNjZW5lXG4gICAgICAgICAgICB3aGVuIFwidm4uU3dpdGNoVG9MYXlvdXRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU3dpdGNoVG9MYXlvdXRcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VUcmFuc2l0aW9uXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVRyYW5zaXRpb25cbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VXaW5kb3dTa2luXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVdpbmRvd1NraW5cbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VTY3JlZW5UcmFuc2l0aW9uc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VTY3JlZW5UcmFuc2l0aW9uc1xuICAgICAgICAgICAgd2hlbiBcInZuLlVJQWNjZXNzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFVJQWNjZXNzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUGxheVZpZGVvXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBsYXlWaWRlb1xuICAgICAgICAgICAgd2hlbiBcImdzLlBsYXlNdXNpY1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQbGF5TXVzaWNcbiAgICAgICAgICAgIHdoZW4gXCJncy5TdG9wTXVzaWNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU3RvcE11c2ljXG4gICAgICAgICAgICB3aGVuIFwiZ3MuUGxheVNvdW5kXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBsYXlTb3VuZFxuICAgICAgICAgICAgd2hlbiBcImdzLlN0b3BTb3VuZFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTdG9wU291bmRcbiAgICAgICAgICAgIHdoZW4gXCJncy5QYXVzZU11c2ljXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFBhdXNlTXVzaWNcbiAgICAgICAgICAgIHdoZW4gXCJncy5SZXN1bWVNdXNpY1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSZXN1bWVNdXNpY1xuICAgICAgICAgICAgd2hlbiBcImdzLkF1ZGlvRGVmYXVsdHNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQXVkaW9EZWZhdWx0c1xuICAgICAgICAgICAgd2hlbiBcImdzLkVuZENvbW1vbkV2ZW50XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEVuZENvbW1vbkV2ZW50XG4gICAgICAgICAgICB3aGVuIFwiZ3MuUmVzdW1lQ29tbW9uRXZlbnRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kUmVzdW1lQ29tbW9uRXZlbnRcbiAgICAgICAgICAgIHdoZW4gXCJncy5DYWxsQ29tbW9uRXZlbnRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2FsbENvbW1vbkV2ZW50XG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlVGltZXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlVGltZXJcbiAgICAgICAgICAgIHdoZW4gXCJncy5TaG93VGV4dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTaG93VGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLlJlZnJlc2hUZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJlZnJlc2hUZXh0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuVGV4dE1vdGlvbkJsdXJcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVGV4dE1vdGlvbkJsdXJcbiAgICAgICAgICAgIHdoZW4gXCJncy5Nb3ZlVGV4dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNb3ZlVGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLk1vdmVUZXh0UGF0aFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRNb3ZlVGV4dFBhdGhcbiAgICAgICAgICAgIHdoZW4gXCJncy5Sb3RhdGVUZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFJvdGF0ZVRleHRcbiAgICAgICAgICAgIHdoZW4gXCJncy5ab29tVGV4dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRab29tVGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLkJsZW5kVGV4dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRCbGVuZFRleHRcbiAgICAgICAgICAgIHdoZW4gXCJncy5Db2xvclRleHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ29sb3JUZXh0XG4gICAgICAgICAgICB3aGVuIFwiZ3MuRXJhc2VUZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEVyYXNlVGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLlRleHRFZmZlY3RcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kVGV4dEVmZmVjdFxuICAgICAgICAgICAgd2hlbiBcImdzLlRleHREZWZhdWx0c1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRUZXh0RGVmYXVsdHNcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VUZXh0U2V0dGluZ3NcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlVGV4dFNldHRpbmdzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuSW5wdXRUZXh0XCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZElucHV0VGV4dFxuICAgICAgICAgICAgd2hlbiBcImdzLklucHV0TmFtZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRJbnB1dE5hbWVcbiAgICAgICAgICAgIHdoZW4gXCJncy5TYXZlUGVyc2lzdGVudERhdGFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2F2ZVBlcnNpc3RlbnREYXRhXG4gICAgICAgICAgICB3aGVuIFwiZ3MuU2F2ZVNldHRpbmdzXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZFNhdmVTZXR0aW5nc1xuICAgICAgICAgICAgd2hlbiBcImdzLlByZXBhcmVTYXZlR2FtZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRQcmVwYXJlU2F2ZUdhbWVcbiAgICAgICAgICAgIHdoZW4gXCJncy5TYXZlR2FtZVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTYXZlR2FtZVxuICAgICAgICAgICAgd2hlbiBcImdzLkxvYWRHYW1lXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZExvYWRHYW1lXG4gICAgICAgICAgICB3aGVuIFwiZ3MuR2V0SW5wdXREYXRhXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZEdldElucHV0RGF0YVxuICAgICAgICAgICAgd2hlbiBcImdzLldhaXRGb3JJbnB1dFwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRXYWl0Rm9ySW5wdXRcbiAgICAgICAgICAgIHdoZW4gXCJncy5DaGFuZ2VPYmplY3REb21haW5cIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlT2JqZWN0RG9tYWluXG4gICAgICAgICAgICB3aGVuIFwidm4uR2V0R2FtZURhdGFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kR2V0R2FtZURhdGFcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5TZXRHYW1lRGF0YVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRTZXRHYW1lRGF0YVxuICAgICAgICAgICAgd2hlbiBcInZuLkdldE9iamVjdERhdGFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kR2V0T2JqZWN0RGF0YVxuICAgICAgICAgICAgd2hlbiBcInZuLlNldE9iamVjdERhdGFcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2V0T2JqZWN0RGF0YVxuICAgICAgICAgICAgd2hlbiBcInZuLkNoYW5nZVNvdW5kc1wiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRDaGFuZ2VTb3VuZHNcbiAgICAgICAgICAgIHdoZW4gXCJ2bi5DaGFuZ2VDb2xvcnNcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kQ2hhbmdlQ29sb3JzXG4gICAgICAgICAgICB3aGVuIFwiZ3MuQ2hhbmdlU2NyZWVuQ3Vyc29yXCIgdGhlbiBjb21tYW5kLmV4ZWN1dGUgPSBAY29tbWFuZENoYW5nZVNjcmVlbkN1cnNvclxuICAgICAgICAgICAgd2hlbiBcImdzLlJlc2V0R2xvYmFsRGF0YVwiIHRoZW4gY29tbWFuZC5leGVjdXRlID0gQGNvbW1hbmRSZXNldEdsb2JhbERhdGFcbiAgICAgICAgICAgIHdoZW4gXCJncy5TY3JpcHRcIiB0aGVuIGNvbW1hbmQuZXhlY3V0ZSA9IEBjb21tYW5kU2NyaXB0XG5cbiAgICAjIyMqXG4gICAgKiBFeGVjdXRlcyB0aGUgY29tbWFuZCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4IGFuZCBpbmNyZWFzZXMgdGhlIGNvbW1hbmQtcG9pbnRlci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVDb21tYW5kXG4gICAgIyMjXG4gICAgZXhlY3V0ZUNvbW1hbmQ6IChpbmRleCkgLT5cbiAgICAgICAgQGNvbW1hbmQgPSBAb2JqZWN0LmNvbW1hbmRzW2luZGV4XVxuXG4gICAgICAgIGlmIEBwcmV2aWV3RGF0YVxuICAgICAgICAgICAgaWYgQHByZXZpZXdEYXRhLnVpZCBhbmQgQHByZXZpZXdEYXRhLnVpZCAhPSBAY29tbWFuZC51aWRcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCA9IHllc1xuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwVGltZSA9IDBcbiAgICAgICAgICAgIGVsc2UgaWYgQHBvaW50ZXIgPCBAcHJldmlld0RhdGEucG9pbnRlclxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwID0geWVzXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lID0gMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwID0gQHByZXZpZXdEYXRhLnNldHRpbmdzLmFuaW1hdGlvbkRpc2FibGVkXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lID0gMFxuICAgICAgICAgICAgICAgIEBwcmV2aWV3SW5mby53YWl0aW5nID0geWVzXG5cbiAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcInByZXZpZXdXYWl0aW5nXCIpXG4gICAgICAgICAgICAgICAgaWYgQHByZXZpZXdEYXRhLnNldHRpbmdzLmFuaW1hdGlvbkRpc2FibGVkIG9yIEBwcmV2aWV3RGF0YS5zZXR0aW5ncy5hbmltYXRpb25UaW1lID4gMFxuICAgICAgICAgICAgICAgICAgICBAcHJldmlld0luZm8udGltZW91dCA9IHNldFRpbWVvdXQgKC0+IEdyYXBoaWNzLnN0b3BwZWQgPSB5ZXMpLCAoQHByZXZpZXdEYXRhLnNldHRpbmdzLmFuaW1hdGlvblRpbWUpKjEwMDBcblxuICAgICAgICBpZiBAY29tbWFuZC5leGVjdXRlP1xuICAgICAgICAgICAgQGNvbW1hbmQuaW50ZXJwcmV0ZXIgPSB0aGlzXG4gICAgICAgICAgICBAY29tbWFuZC5leGVjdXRlKCkgaWYgQGNvbW1hbmQuaW5kZW50ID09IEBpbmRlbnRcbiAgICAgICAgICAgIEBwb2ludGVyKytcblxuICAgICAgICAgICAgQGNvbW1hbmQgPSBAb2JqZWN0LmNvbW1hbmRzW0Bwb2ludGVyXVxuICAgICAgICAgICAgaWYgQGNvbW1hbmQ/XG4gICAgICAgICAgICAgICAgaW5kZW50ID0gQGNvbW1hbmQuaW5kZW50XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaW5kZW50ID0gQGluZGVudFxuICAgICAgICAgICAgICAgIHdoaWxlIGluZGVudCA+IDAgYW5kIChub3QgQGxvb3BzW2luZGVudF0/KVxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQtLVxuXG4gICAgICAgICAgICBpZiBpbmRlbnQgPCBAaW5kZW50XG4gICAgICAgICAgICAgICAgQGluZGVudCA9IGluZGVudFxuICAgICAgICAgICAgICAgIGlmIEBsb29wc1tAaW5kZW50XT8uY29uZGl0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgQHBvaW50ZXIgPSBAbG9vcHNbQGluZGVudF0ucG9pbnRlclxuICAgICAgICAgICAgICAgICAgICBAY29tbWFuZCA9IEBvYmplY3QuY29tbWFuZHNbQHBvaW50ZXJdXG4gICAgICAgICAgICAgICAgICAgIEBjb21tYW5kLmludGVycHJldGVyID0gdGhpc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGxvb3BzW0BpbmRlbnRdID0gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAYXNzaWduQ29tbWFuZChAY29tbWFuZClcblxuICAgICAgICAgICAgaWYgQGNvbW1hbmQuZXhlY3V0ZT9cbiAgICAgICAgICAgICAgICBAY29tbWFuZC5pbnRlcnByZXRlciA9IHRoaXNcbiAgICAgICAgICAgICAgICBAY29tbWFuZC5leGVjdXRlKCkgaWYgQGNvbW1hbmQuaW5kZW50ID09IEBpbmRlbnRcbiAgICAgICAgICAgICAgICBAcG9pbnRlcisrXG4gICAgICAgICAgICAgICAgQGNvbW1hbmQgPSBAb2JqZWN0LmNvbW1hbmRzW0Bwb2ludGVyXVxuICAgICAgICAgICAgICAgIGlmIEBjb21tYW5kP1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSBAY29tbWFuZC5pbmRlbnRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGluZGVudCA9IEBpbmRlbnRcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgaW5kZW50ID4gMCBhbmQgKG5vdCBAbG9vcHNbaW5kZW50XT8pXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQtLVxuXG4gICAgICAgICAgICAgICAgaWYgaW5kZW50IDwgQGluZGVudFxuICAgICAgICAgICAgICAgICAgICBAaW5kZW50ID0gaW5kZW50XG4gICAgICAgICAgICAgICAgICAgIGlmIEBsb29wc1tAaW5kZW50XT8uY29uZGl0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIEBwb2ludGVyID0gQGxvb3BzW0BpbmRlbnRdLnBvaW50ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjb21tYW5kID0gQG9iamVjdC5jb21tYW5kc1tAcG9pbnRlcl1cbiAgICAgICAgICAgICAgICAgICAgICAgIEBjb21tYW5kLmludGVycHJldGVyID0gdGhpc1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAbG9vcHNbQGluZGVudF0gPSBudWxsXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHBvaW50ZXIrK1xuICAgICMjIypcbiAgICAqIFNraXBzIGFsbCBjb21tYW5kcyB1bnRpbCBhIGNvbW1hbmQgd2l0aCB0aGUgc3BlY2lmaWVkIGluZGVudC1sZXZlbCBpc1xuICAgICogZm91bmQuIFNvIGZvciBleGFtcGxlOiBUbyBqdW1wIGZyb20gYSBDb25kaXRpb24tQ29tbWFuZCB0byB0aGUgbmV4dFxuICAgICogRWxzZS1Db21tYW5kIGp1c3QgcGFzcyB0aGUgaW5kZW50LWxldmVsIG9mIHRoZSBDb25kaXRpb24vRWxzZSBjb21tYW5kLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2tpcFxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGVudCAtIFRoZSBpbmRlbnQtbGV2ZWwuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IGJhY2t3YXJkIC0gSWYgdHJ1ZSB0aGUgc2tpcCBydW5zIGJhY2t3YXJkLlxuICAgICMjI1xuICAgIHNraXA6IChpbmRlbnQsIGJhY2t3YXJkKSAtPlxuICAgICAgICBpZiBiYWNrd2FyZFxuICAgICAgICAgICAgQHBvaW50ZXItLVxuICAgICAgICAgICAgd2hpbGUgQHBvaW50ZXIgPiAwIGFuZCBAb2JqZWN0LmNvbW1hbmRzW0Bwb2ludGVyXS5pbmRlbnQgIT0gaW5kZW50XG4gICAgICAgICAgICAgICAgQHBvaW50ZXItLVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAcG9pbnRlcisrXG4gICAgICAgICAgICB3aGlsZSBAcG9pbnRlciA8IEBvYmplY3QuY29tbWFuZHMubGVuZ3RoIGFuZCBAb2JqZWN0LmNvbW1hbmRzW0Bwb2ludGVyXS5pbmRlbnQgIT0gaW5kZW50XG4gICAgICAgICAgICAgICAgQHBvaW50ZXIrK1xuXG4gICAgIyMjKlxuICAgICogSGFsdHMgdGhlIGludGVycHJldGVyIGZvciB0aGUgc3BlY2lmaWVkIGFtb3VudCBvZiB0aW1lLiBBbiBvcHRpb25hbGx5XG4gICAgKiBjYWxsYmFjayBmdW5jdGlvbiBjYW4gYmUgcGFzc2VkIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSB0aW1lIGlzIHVwLlxuICAgICpcbiAgICAqIEBtZXRob2Qgd2FpdFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgLSBUaGUgdGltZSB0byB3YWl0XG4gICAgKiBAcGFyYW0ge2dzLkNhbGxiYWNrfSBjYWxsYmFjayAtIENhbGxlZCBpZiB0aGUgd2FpdCB0aW1lIGlzIHVwLlxuICAgICMjI1xuICAgIHdhaXQ6ICh0aW1lLCBjYWxsYmFjaykgLT5cbiAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICBAd2FpdENvdW50ZXIgPSB0aW1lXG4gICAgICAgIEB3YWl0Q2FsbGJhY2sgPSBjYWxsYmFja1xuXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGlmIHRoZSBjb21tYW5kIGF0IHRoZSBzcGVjaWZpZWQgcG9pbnRlci1pbmRleCBpcyBhIGdhbWUgbWVzc2FnZVxuICAgICogcmVsYXRlZCBjb21tYW5kLlxuICAgICpcbiAgICAqIEBtZXRob2QgaXNNZXNzYWdlQ29tbWFuZFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHBvaW50ZXIgLSBUaGUgcG9pbnRlci9pbmRleC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0W119IGNvbW1hbmRzIC0gVGhlIGxpc3Qgb2YgY29tbWFuZHMgdG8gY2hlY2suXG4gICAgKiBAcmV0dXJuIHtib29sZWFufSA8Yj50cnVlPC9iPiBpZiBpdHMgYSBnYW1lIG1lc3NhZ2UgcmVsYXRlZCBjb21tYW5kLiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+LlxuICAgICMjI1xuICAgIGlzTWVzc2FnZUNvbW1hbmQ6IChwb2ludGVyLCBjb21tYW5kcykgLT5cbiAgICAgICAgcmVzdWx0ID0geWVzXG4gICAgICAgIGlmIHBvaW50ZXIgPj0gY29tbWFuZHMubGVuZ3RoIG9yIChjb21tYW5kc1twb2ludGVyXS5pZCAhPSBcImdzLklucHV0TnVtYmVyXCIgYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kc1twb2ludGVyXS5pZCAhPSBcInZuLkNob2ljZVwiIGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZHNbcG9pbnRlcl0uaWQgIT0gXCJncy5JbnB1dFRleHRcIiBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRzW3BvaW50ZXJdLmlkICE9IFwiZ3MuSW5wdXROYW1lXCIpXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGlmIHRoZSBjb21tYW5kIGF0IHRoZSBzcGVjaWZpZWQgcG9pbnRlci1pbmRleCBhc2tzIGZvciB1c2VyLWlucHV0IGxpa2VcbiAgICAqIHRoZSBJbnB1dCBOdW1iZXIgb3IgSW5wdXQgVGV4dCBjb21tYW5kLlxuICAgICpcbiAgICAqIEBtZXRob2QgaXNJbnB1dERhdGFDb21tYW5kXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcG9pbnRlciAtIFRoZSBwb2ludGVyL2luZGV4LlxuICAgICogQHBhcmFtIHtPYmplY3RbXX0gY29tbWFuZHMgLSBUaGUgbGlzdCBvZiBjb21tYW5kcyB0byBjaGVjay5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IDxiPnRydWU8L2I+IGlmIGl0cyBhbiBpbnB1dC1kYXRhIGNvbW1hbmQuIE90aGVyd2lzZSA8Yj5mYWxzZTwvYj5cbiAgICAjIyNcbiAgICBpc0lucHV0RGF0YUNvbW1hbmQ6IChwb2ludGVyLCBjb21tYW5kcykgLT5cbiAgICAgICAgcG9pbnRlciA8IGNvbW1hbmRzLmxlbmd0aCBhbmQgKFxuICAgICAgICAgICAgY29tbWFuZHNbcG9pbnRlcl0uaWQgPT0gXCJncy5JbnB1dE51bWJlclwiIG9yXG4gICAgICAgICAgICBjb21tYW5kc1twb2ludGVyXS5pZCA9PSBcImdzLklucHV0VGV4dFwiIG9yXG4gICAgICAgICAgICBjb21tYW5kc1twb2ludGVyXS5pZCA9PSBcInZuLkNob2ljZVwiIG9yXG4gICAgICAgICAgICBjb21tYW5kc1twb2ludGVyXS5pZCA9PSBcInZuLlNob3dDaG9pY2VzXCJcbiAgICAgICAgKVxuXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGlmIGEgZ2FtZSBtZXNzYWdlIGlzIGN1cnJlbnRseSBydW5uaW5nIGJ5IGFub3RoZXIgaW50ZXJwcmV0ZXIgbGlrZSBhXG4gICAgKiBjb21tb24tZXZlbnQgaW50ZXJwcmV0ZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBpc1Byb2Nlc3NpbmdNZXNzYWdlSW5PdGhlckNvbnRleHRcbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IDxiPnRydWU8L2I+IGEgZ2FtZSBtZXNzYWdlIGlzIHJ1bm5pbmcgaW4gYW5vdGhlciBjb250ZXh0LiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+XG4gICAgIyMjXG4gICAgaXNQcm9jZXNzaW5nTWVzc2FnZUluT3RoZXJDb250ZXh0OiAtPlxuICAgICAgICByZXN1bHQgPSBub1xuICAgICAgICBnbSA9IEdhbWVNYW5hZ2VyXG4gICAgICAgIHMgPSBTY2VuZU1hbmFnZXIuc2NlbmVcblxuICAgICAgICByZXN1bHQgPVxuICAgICAgICAgICAgICAgICAocy5pbnB1dE51bWJlcldpbmRvdz8gYW5kIHMuaW5wdXROdW1iZXJXaW5kb3cudmlzaWJsZSBhbmQgcy5pbnB1dE51bWJlcldpbmRvdy5leGVjdXRpb25Db250ZXh0ICE9IEBjb250ZXh0KSBvclxuICAgICAgICAgICAgICAgICAocy5pbnB1dFRleHRXaW5kb3c/IGFuZCBzLmlucHV0VGV4dFdpbmRvdy5hY3RpdmUgYW5kIHMuaW5wdXRUZXh0V2luZG93LmV4ZWN1dGlvbkNvbnRleHQgIT0gQGNvbnRleHQpXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuXG4gICAgIyMjKlxuICAgICogSWYgYSBnYW1lIG1lc3NhZ2UgaXMgY3VycmVudGx5IHJ1bm5pbmcgYnkgYW4gb3RoZXIgaW50ZXJwcmV0ZXIgbGlrZSBhIGNvbW1vbi1ldmVudFxuICAgICogaW50ZXJwcmV0ZXIsIHRoaXMgbWV0aG9kIHRyaWdnZXIgYSB3YWl0IHVudGlsIHRoZSBvdGhlciBpbnRlcnByZXRlciBpcyBmaW5pc2hlZFxuICAgICogd2l0aCB0aGUgZ2FtZSBtZXNzYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgd2FpdEZvck1lc3NhZ2VcbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IDxiPnRydWU8L2I+IGEgZ2FtZSBtZXNzYWdlIGlzIHJ1bm5pbmcgaW4gYW5vdGhlciBjb250ZXh0LiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+XG4gICAgIyMjXG4gICAgd2FpdEZvck1lc3NhZ2U6IC0+XG4gICAgICAgIEBpc1dhaXRpbmdGb3JNZXNzYWdlID0geWVzXG4gICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgQHBvaW50ZXItLVxuXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSB0aGUgbnVtYmVyIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBudW1iZXJWYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSdzIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB2YXJpYWJsZSB0byBnZXQgdGhlIHZhbHVlIGZyb20uXG4gICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjXG4gICAgbnVtYmVyVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCBkb21haW4pIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpbmRleCwgZG9tYWluKVxuXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSAocG9zc2libGUpIG51bWJlciB2YXJpYWJsZS4gSWYgYSBjb25zdGFudCBudW1iZXIgdmFsdWUgaXMgc3BlY2lmaWVkLCB0aGlzIG1ldGhvZFxuICAgICogZG9lcyBub3RoaW5nIGFuIGp1c3QgcmV0dXJucyB0aGF0IGNvbnN0YW50IHZhbHVlLiBUaGF0J3MgdG8gbWFrZSBpdCBtb3JlIGNvbWZvcnRhYmxlIHRvIGp1c3QgcGFzcyBhIHZhbHVlIHdoaWNoXG4gICAgKiBjYW4gYmUgY2FsY3VsYXRlZCBieSB2YXJpYWJsZSBidXQgYWxzbyBiZSBqdXN0IGEgY29uc3RhbnQgdmFsdWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBudW1iZXJWYWx1ZU9mXG4gICAgKiBAcGFyYW0ge251bWJlcnxPYmplY3R9IG9iamVjdCAtIEEgbnVtYmVyIHZhcmlhYmxlIG9yIGNvbnN0YW50IG51bWJlciB2YWx1ZS5cbiAgICAqIEByZXR1cm4ge051bWJlcn0gVGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyNcbiAgICBudW1iZXJWYWx1ZU9mOiAob2JqZWN0KSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLm51bWJlclZhbHVlT2Yob2JqZWN0KVxuXG4gICAgIyMjKlxuICAgICogSXQgZG9lcyB0aGUgc2FtZSBsaWtlIDxiPm51bWJlclZhbHVlT2Y8L2I+IHdpdGggb25lIGRpZmZlcmVuY2U6IElmIHRoZSBzcGVjaWZpZWQgb2JqZWN0XG4gICAgKiBpcyBhIHZhcmlhYmxlLCBpdCdzIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXMgYSBkdXJhdGlvbi12YWx1ZSBpbiBtaWxsaXNlY29uZHMgYW5kIGF1dG9tYXRpY2FsbHkgY29udmVydGVkXG4gICAgKiBpbnRvIGZyYW1lcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGR1cmF0aW9uVmFsdWVPZlxuICAgICogQHBhcmFtIHtudW1iZXJ8T2JqZWN0fSBvYmplY3QgLSBBIG51bWJlciB2YXJpYWJsZSBvciBjb25zdGFudCBudW1iZXIgdmFsdWUuXG4gICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjXG4gICAgZHVyYXRpb25WYWx1ZU9mOiAob2JqZWN0KSAtPlxuICAgICAgICBpZiBvYmplY3QgYW5kIG9iamVjdC5pbmRleD9cbiAgICAgICAgICAgIE1hdGgucm91bmQoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJWYWx1ZU9mKG9iamVjdCkgLyAxMDAwICogR3JhcGhpY3MuZnJhbWVSYXRlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBNYXRoLnJvdW5kKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubnVtYmVyVmFsdWVPZihvYmplY3QpKVxuXG4gICAgIyMjKlxuICAgICogR2V0cyBhIHBvc2l0aW9uICh7eCwgeX0pIGZvciB0aGUgc3BlY2lmaWVkIHByZWRlZmluZWQgb2JqZWN0IHBvc2l0aW9uIGNvbmZpZ3VyZWQgaW5cbiAgICAqIERhdGFiYXNlIC0gU3lzdGVtLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcG9zaXRpb24gLSBUaGUgaW5kZXgvSUQgb2YgdGhlIHByZWRlZmluZWQgb2JqZWN0IHBvc2l0aW9uIHRvIHNldC5cbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBzZXQgdGhlIHBvc2l0aW9uIGZvci5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBUaGUgcGFyYW1zIG9iamVjdCBvZiB0aGUgc2NlbmUgY29tbWFuZC5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIHBvc2l0aW9uIHt4LCB5fS5cbiAgICAjIyNcbiAgICBwcmVkZWZpbmVkT2JqZWN0UG9zaXRpb246IChwb3NpdGlvbiwgb2JqZWN0LCBwYXJhbXMpIC0+XG4gICAgICAgIG9iamVjdFBvc2l0aW9uID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0ub2JqZWN0UG9zaXRpb25zW3Bvc2l0aW9uXVxuICAgICAgICBpZiAhb2JqZWN0UG9zaXRpb24gdGhlbiByZXR1cm4geyB4OiAwLCB5OiAwIH1cblxuICAgICAgICByZXR1cm4gb2JqZWN0UG9zaXRpb24uZnVuYy5jYWxsKG51bGwsIG9iamVjdCwgcGFyYW1zKSB8fCB7IHg6IDAsIHk6IDAgfVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldFZhbHVlVG9WYXJpYWJsZVxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZhcmlhYmxlIC0gVGhlIHZhcmlhYmxlIHRvIHNldC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YXJpYWJsZVR5cGUgLSBUaGUgdHlwZSBvZiB0aGUgdmFyaWFibGUgdG8gc2V0LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldCB0aGUgdmFyaWFibGUgdG8uIERlcGVuZHMgb24gdGhlIHZhcmlhYmxlIHR5cGUuXG4gICAgIyMjXG4gICAgc2V0VmFsdWVUb1ZhcmlhYmxlOiAodmFyaWFibGUsIHZhcmlhYmxlVHlwZSwgdmFsdWUpIC0+XG4gICAgICAgIHN3aXRjaCB2YXJpYWJsZVR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlclxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0TnVtYmVyVmFsdWVUbyh2YXJpYWJsZSwgdmFsdWUpXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldEJvb2xlYW5WYWx1ZVRvKHZhcmlhYmxlLCB2YWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIHZhbHVlKVxuICAgICAgICAgICAgd2hlbiAzICMgTGlzdFxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0TGlzdE9iamVjdFRvKHZhcmlhYmxlLCB2YWx1ZSlcblxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgbnVtYmVyIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXROdW1iZXJWYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSdzIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBUaGUgbnVtYmVyIHZhbHVlIHRvIHNldCB0aGUgdmFyaWFibGUgdG8uXG4gICAgIyMjXG4gICAgc2V0TnVtYmVyVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIG51bWJlciB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldE51bWJlclZhbHVlVG9cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YXJpYWJsZSAtIFRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBUaGUgbnVtYmVyIHZhbHVlIHRvIHNldCB0aGUgdmFyaWFibGUgdG8uXG4gICAgIyMjXG4gICAgc2V0TnVtYmVyVmFsdWVUbzogKHZhcmlhYmxlLCB2YWx1ZSkgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXROdW1iZXJWYWx1ZVRvKHZhcmlhYmxlLCB2YWx1ZSlcblxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgbGlzdCB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldExpc3RPYmplY3RUb1xuICAgICogQHBhcmFtIHtPYmplY3R9IHZhcmlhYmxlIC0gVGhlIHZhcmlhYmxlIHRvIHNldC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSAtIFRoZSBsaXN0IG9iamVjdCB0byBzZXQgdGhlIHZhcmlhYmxlIHRvLlxuICAgICMjI1xuICAgIHNldExpc3RPYmplY3RUbzogKHZhcmlhYmxlLCB2YWx1ZSkgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXRMaXN0T2JqZWN0VG8odmFyaWFibGUsIHZhbHVlKVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBib29sZWFuL3N3aXRjaCB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldEJvb2xlYW5WYWx1ZVRvXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdmFyaWFibGUgLSBUaGUgdmFyaWFibGUgdG8gc2V0LlxuICAgICogQHBhcmFtIHtib29sZWFufSB2YWx1ZSAtIFRoZSBib29sZWFuIHZhbHVlIHRvIHNldCB0aGUgdmFyaWFibGUgdG8uXG4gICAgIyMjXG4gICAgc2V0Qm9vbGVhblZhbHVlVG86ICh2YXJpYWJsZSwgdmFsdWUpIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0Qm9vbGVhblZhbHVlVG8odmFyaWFibGUsIHZhbHVlKVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBudW1iZXIgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldEJvb2xlYW5WYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSdzIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlIC0gVGhlIGJvb2xlYW4gdmFsdWUgdG8gc2V0IHRoZSB2YXJpYWJsZSB0by5cbiAgICAjIyNcbiAgICBzZXRCb29sZWFuVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldEJvb2xlYW5WYWx1ZUF0SW5kZXgoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBzdHJpbmcvdGV4dCB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldFN0cmluZ1ZhbHVlVG9cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YXJpYWJsZSAtIFRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBUaGUgc3RyaW5nL3RleHQgdmFsdWUgdG8gc2V0IHRoZSB2YXJpYWJsZSB0by5cbiAgICAjIyNcbiAgICBzZXRTdHJpbmdWYWx1ZVRvOiAodmFyaWFibGUsIHZhbHVlKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIHZhbHVlKVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhlIHN0cmluZyB2YXJpYWJsZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0U3RyaW5nVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgIyMjXG4gICAgc2V0U3RyaW5nVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldFN0cmluZ1ZhbHVlQXRJbmRleChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIChwb3NzaWJsZSkgc3RyaW5nIHZhcmlhYmxlLiBJZiBhIGNvbnN0YW50IHN0cmluZyB2YWx1ZSBpcyBzcGVjaWZpZWQsIHRoaXMgbWV0aG9kXG4gICAgKiBkb2VzIG5vdGhpbmcgYW4ganVzdCByZXR1cm5zIHRoYXQgY29uc3RhbnQgdmFsdWUuIFRoYXQncyB0byBtYWtlIGl0IG1vcmUgY29tZm9ydGFibGUgdG8ganVzdCBwYXNzIGEgdmFsdWUgd2hpY2hcbiAgICAqIGNhbiBiZSBjYWxjdWxhdGVkIGJ5IHZhcmlhYmxlIGJ1dCBhbHNvIGJlIGp1c3QgYSBjb25zdGFudCB2YWx1ZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0cmluZ1ZhbHVlT2ZcbiAgICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdH0gb2JqZWN0IC0gQSBzdHJpbmcgdmFyaWFibGUgb3IgY29uc3RhbnQgc3RyaW5nIHZhbHVlLlxuICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjI1xuICAgIHN0cmluZ1ZhbHVlT2Y6IChvYmplY3QpIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc3RyaW5nVmFsdWVPZihvYmplY3QpXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiB0aGUgc3RyaW5nIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBzdHJpbmdWYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSdzIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB2YXJpYWJsZSB0byBnZXQgdGhlIHZhbHVlIGZyb20uXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjXG4gICAgc3RyaW5nVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCBkb21haW4pIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc3RyaW5nVmFsdWVBdEluZGV4KHNjb3BlLCBpbmRleCwgZG9tYWluKVxuXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSAocG9zc2libGUpIGJvb2xlYW4gdmFyaWFibGUuIElmIGEgY29uc3RhbnQgYm9vbGVhbiB2YWx1ZSBpcyBzcGVjaWZpZWQsIHRoaXMgbWV0aG9kXG4gICAgKiBkb2VzIG5vdGhpbmcgYW4ganVzdCByZXR1cm5zIHRoYXQgY29uc3RhbnQgdmFsdWUuIFRoYXQncyB0byBtYWtlIGl0IG1vcmUgY29tZm9ydGFibGUgdG8ganVzdCBwYXNzIGEgdmFsdWUgd2hpY2hcbiAgICAqIGNhbiBiZSBjYWxjdWxhdGVkIGJ5IHZhcmlhYmxlIGJ1dCBhbHNvIGJlIGp1c3QgYSBjb25zdGFudCB2YWx1ZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGJvb2xlYW5WYWx1ZU9mXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW58T2JqZWN0fSBvYmplY3QgLSBBIGJvb2xlYW4gdmFyaWFibGUgb3IgY29uc3RhbnQgYm9vbGVhbiB2YWx1ZS5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjXG4gICAgYm9vbGVhblZhbHVlT2Y6IChvYmplY3QpIC0+IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuYm9vbGVhblZhbHVlT2Yob2JqZWN0KVxuXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgdGhlIGJvb2xlYW4gdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGJvb2xlYW5WYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSdzIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB2YXJpYWJsZSB0byBnZXQgdGhlIHZhbHVlIGZyb20uXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjXG4gICAgYm9vbGVhblZhbHVlQXRJbmRleDogKHNjb3BlLCBpbmRleCwgZG9tYWluKSAtPiBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmJvb2xlYW5WYWx1ZUF0SW5kZXgoc2NvcGUsIGluZGV4LCBkb21haW4pXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIChwb3NzaWJsZSkgbGlzdCB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxpc3RPYmplY3RPZlxuICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAtIEEgbGlzdCB2YXJpYWJsZS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIHZhbHVlIG9mIHRoZSBsaXN0IHZhcmlhYmxlLlxuICAgICMjI1xuICAgIGxpc3RPYmplY3RPZjogKG9iamVjdCkgLT4gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5saXN0T2JqZWN0T2Yob2JqZWN0KVxuXG4gICAgIyMjKlxuICAgICogQ29tcGFyZXMgdHdvIG9iamVjdCB1c2luZyB0aGUgc3BlY2lmaWVkIG9wZXJhdGlvbiBhbmQgcmV0dXJucyB0aGUgcmVzdWx0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY29tcGFyZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGEgLSBPYmplY3QgQS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBiIC0gT2JqZWN0IEIuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gb3BlcmF0aW9uIC0gVGhlIGNvbXBhcmUtb3BlcmF0aW9uIHRvIGNvbXBhcmUgT2JqZWN0IEEgd2l0aCBPYmplY3QgQi5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT4wID0gRXF1YWwgVG88L2xpPlxuICAgICogPGxpPjEgPSBOb3QgRXF1YWwgVG88L2xpPlxuICAgICogPGxpPjIgPSBHcmVhdGVyIFRoYW48L2xpPlxuICAgICogPGxpPjMgPSBHcmVhdGVyIG9yIEVxdWFsIFRvPC9saT5cbiAgICAqIDxsaT40ID0gTGVzcyBUaGFuPC9saT5cbiAgICAqIDxsaT41ID0gTGVzcyBvciBFcXVhbCBUbzwvbGk+XG4gICAgKiA8L3VsPlxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gVGhlIGNvbXBhcmlzb24gcmVzdWx0LlxuICAgICMjI1xuICAgIGNvbXBhcmU6IChhLCBiLCBvcGVyYXRpb24pIC0+XG4gICAgICAgIHN3aXRjaCBvcGVyYXRpb25cbiAgICAgICAgICAgIHdoZW4gMCB0aGVuIHJldHVybiBgYSA9PSBiYFxuICAgICAgICAgICAgd2hlbiAxIHRoZW4gcmV0dXJuIGBhICE9IGJgXG4gICAgICAgICAgICB3aGVuIDIgdGhlbiByZXR1cm4gYSA+IGJcbiAgICAgICAgICAgIHdoZW4gMyB0aGVuIHJldHVybiBhID49IGJcbiAgICAgICAgICAgIHdoZW4gNCB0aGVuIHJldHVybiBhIDwgYlxuICAgICAgICAgICAgd2hlbiA1IHRoZW4gcmV0dXJuIGEgPD0gYlxuXG4gICAgIyMjKlxuICAgICogQ2hhbmdlcyBudW1iZXIgdmFyaWFibGVzIGFuZCBhbGxvd3MgZGVjaW1hbCB2YWx1ZXMgc3VjaCBhcyAwLjUgdG9vLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2hhbmdlRGVjaW1hbFZhcmlhYmxlc1xuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIElucHV0IHBhcmFtcyBmcm9tIHRoZSBjb21tYW5kXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcm91bmRNZXRob2QgLSBUaGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb24gd2lsbCBiZSByb3VuZGVkIHVzaW5nIHRoZSBzcGVjaWZpZWQgbWV0aG9kLlxuICAgICogPHVsPlxuICAgICogPGxpPjAgPSBOb25lLiBUaGUgcmVzdWx0IHdpbGwgbm90IGJlIHJvdW5kZWQuPC9saT5cbiAgICAqIDxsaT4xID0gQ29tbWVyY2lhbGx5PC9saT5cbiAgICAqIDxsaT4yID0gUm91bmQgVXA8L2xpPlxuICAgICogPGxpPjMgPSBSb3VuZCBEb3duPC9saT5cbiAgICAqIDwvdWw+XG4gICAgIyMjXG4gICAgY2hhbmdlRGVjaW1hbFZhcmlhYmxlczogKHBhcmFtcywgcm91bmRNZXRob2QpIC0+XG4gICAgICAgIHNvdXJjZSA9IDBcbiAgICAgICAgcm91bmRGdW5jID0gbnVsbFxuXG4gICAgICAgIHN3aXRjaCByb3VuZE1ldGhvZFxuICAgICAgICAgICAgd2hlbiAwIHRoZW4gcm91bmRGdW5jID0gKHZhbHVlKSAtPiB2YWx1ZVxuICAgICAgICAgICAgd2hlbiAxIHRoZW4gcm91bmRGdW5jID0gKHZhbHVlKSAtPiBNYXRoLnJvdW5kKHZhbHVlKVxuICAgICAgICAgICAgd2hlbiAyIHRoZW4gcm91bmRGdW5jID0gKHZhbHVlKSAtPiBNYXRoLmNlaWwodmFsdWUpXG4gICAgICAgICAgICB3aGVuIDMgdGhlbiByb3VuZEZ1bmMgPSAodmFsdWUpIC0+IE1hdGguZmxvb3IodmFsdWUpXG5cbiAgICAgICAgc3dpdGNoIHBhcmFtcy5zb3VyY2VcbiAgICAgICAgICAgIHdoZW4gMCAjIENvbnN0YW50IFZhbHVlIC8gVmFyaWFibGUgVmFsdWVcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMuc291cmNlVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDEgIyBSYW5kb21cbiAgICAgICAgICAgICAgICBzdGFydCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5zb3VyY2VSYW5kb20uc3RhcnQpXG4gICAgICAgICAgICAgICAgZW5kID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnNvdXJjZVJhbmRvbS5lbmQpXG4gICAgICAgICAgICAgICAgZGlmZiA9IGVuZCAtIHN0YXJ0XG4gICAgICAgICAgICAgICAgc291cmNlID0gTWF0aC5mbG9vcihzdGFydCArIE1hdGgucmFuZG9tKCkgKiAoZGlmZisxKSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFBvaW50ZXJcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAbnVtYmVyVmFsdWVBdEluZGV4KHBhcmFtcy5zb3VyY2VTY29wZSwgQG51bWJlclZhbHVlT2YocGFyYW1zLnNvdXJjZVJlZmVyZW5jZSktMSwgcGFyYW1zLnNvdXJjZVJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgIHdoZW4gMyAjIEdhbWUgRGF0YVxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IEBudW1iZXJWYWx1ZU9mR2FtZURhdGEocGFyYW1zLnNvdXJjZVZhbHVlMSlcbiAgICAgICAgICAgIHdoZW4gNCAjIERhdGFiYXNlIERhdGFcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAbnVtYmVyVmFsdWVPZkRhdGFiYXNlRGF0YShwYXJhbXMuc291cmNlVmFsdWUxKVxuXG4gICAgICAgIHN3aXRjaCBwYXJhbXMudGFyZ2V0XG4gICAgICAgICAgICB3aGVuIDAgIyBWYXJpYWJsZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIFNldFxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlVG8ocGFyYW1zLnRhcmdldFZhcmlhYmxlLCByb3VuZEZ1bmMoc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVUbyhwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHJvdW5kRnVuYyhAbnVtYmVyVmFsdWVPZihwYXJhbXMudGFyZ2V0VmFyaWFibGUpICsgc291cmNlKSApXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFN1YlxuICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlVG8ocGFyYW1zLnRhcmdldFZhcmlhYmxlLCByb3VuZEZ1bmMoQG51bWJlclZhbHVlT2YocGFyYW1zLnRhcmdldFZhcmlhYmxlKSAtIHNvdXJjZSkgKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBNdWxcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZVRvKHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZU9mKHBhcmFtcy50YXJnZXRWYXJpYWJsZSkgKiBzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDQgIyBEaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZVRvKHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZU9mKHBhcmFtcy50YXJnZXRWYXJpYWJsZSkgLyBzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBNb2RcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZVRvKHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgQG51bWJlclZhbHVlT2YocGFyYW1zLnRhcmdldFZhcmlhYmxlKSAlIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFJhbmdlXG4gICAgICAgICAgICAgICAgc2NvcGUgPSBwYXJhbXMudGFyZ2V0U2NvcGVcbiAgICAgICAgICAgICAgICBzdGFydCA9IHBhcmFtcy50YXJnZXRSYW5nZS5zdGFydC0xXG4gICAgICAgICAgICAgICAgZW5kID0gcGFyYW1zLnRhcmdldFJhbmdlLmVuZC0xXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW3N0YXJ0Li5lbmRdXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCByb3VuZEZ1bmMoc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIEFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIHJvdW5kRnVuYyhAbnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSArIHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBTdWJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCByb3VuZEZ1bmMoQG51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSkgLSBzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAzICMgTXVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGkpICogc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gNCAjIERpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIHJvdW5kRnVuYyhAbnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAvIHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBNb2RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCBAbnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSAlIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGluZGV4ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnRhcmdldFJlZmVyZW5jZSkgLSAxXG4gICAgICAgICAgICAgICAgc3dpdGNoIHBhcmFtcy5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgU2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVBdEluZGV4KHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIHJvdW5kRnVuYyhzb3VyY2UpLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBBZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgKyBzb3VyY2UpLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBTdWJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgLSBzb3VyY2UpLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBNdWxcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgKiBzb3VyY2UpLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDQgIyBEaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcm91bmRGdW5jKEBudW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgLyBzb3VyY2UpLCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBNb2RcbiAgICAgICAgICAgICAgICAgICAgICAgIEBzZXROdW1iZXJWYWx1ZUF0SW5kZXgocGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgQG51bWJlclZhbHVlQXRJbmRleChwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSAlIHNvdXJjZSwgcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcblxuICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgIyMjKlxuICAgICogU2hha2VzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBzaGFrZU9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHNoYWtlLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8gYWJvdXQgdGhlIHNoYWtlLWFuaW1hdGlvbi5cbiAgICAjIyNcbiAgICBzaGFrZU9iamVjdDogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBkdXJhdGlvbiA9IE1hdGgubWF4KE1hdGgucm91bmQoQGR1cmF0aW9uVmFsdWVPZihwYXJhbXMuZHVyYXRpb24pKSwgMilcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KHBhcmFtcy5lYXNpbmcpXG5cbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLnNoYWtlKHsgeDogQG51bWJlclZhbHVlT2YocGFyYW1zLnJhbmdlLngpLCB5OiBAbnVtYmVyVmFsdWVPZihwYXJhbXMucmFuZ2UueSkgfSwgQG51bWJlclZhbHVlT2YocGFyYW1zLnNwZWVkKSAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcblxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICMjIypcbiAgICAqIExldHMgdGhlIGludGVycHJldGVyIHdhaXQgZm9yIHRoZSBjb21wbGV0aW9uIG9mIGEgcnVubmluZyBvcGVyYXRpb24gbGlrZSBhbiBhbmltYXRpb24sIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHdhaXRGb3JDb21wbGV0aW9uXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdGhlIG9wZXJhdGlvbiBpcyBleGVjdXRlZCBvbi4gQ2FuIGJlIDxiPm51bGw8L2I+LlxuICAgICogQHJldHVybiB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8uXG4gICAgIyMjXG4gICAgd2FpdEZvckNvbXBsZXRpb246IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uXG5cbiAgICAjIyMqXG4gICAgKiBFcmFzZXMgYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGVyYXNlT2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gZXJhc2UuXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyNcbiAgICBlcmFzZU9iamVjdDogKG9iamVjdCwgcGFyYW1zLCBjYWxsYmFjaykgLT5cbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gQGR1cmF0aW9uVmFsdWVPZihwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIG9iamVjdC5hbmltYXRvci5kaXNhcHBlYXIocGFyYW1zLmFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiwgKHNlbmRlcikgPT5cbiAgICAgICAgICAgIHNlbmRlci5kaXNwb3NlKClcbiAgICAgICAgICAgIGNhbGxiYWNrPyhzZW5kZXIpXG4gICAgICAgIClcblxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICMjIypcbiAgICAqIFNob3dzIGEgZ2FtZSBvYmplY3Qgb24gc2NyZWVuLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2hvd09iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHNob3cuXG4gICAgKiBAcGFyYW0ge2dzLlBvaW50fSBwb3NpdGlvbiAtIFRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgZ2FtZSBvYmplY3Qgc2hvdWxkIGJlIHNob3duLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyNcbiAgICBzaG93T2JqZWN0OiAob2JqZWN0LCBwb3NpdGlvbiwgcGFyYW1zKSAtPlxuICAgICAgICB4ID0gQG51bWJlclZhbHVlT2YocG9zaXRpb24ueClcbiAgICAgICAgeSA9IEBudW1iZXJWYWx1ZU9mKHBvc2l0aW9uLnkpXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuXG4gICAgICAgIG9iamVjdC5hbmltYXRvci5hcHBlYXIoeCwgeSwgcGFyYW1zLmFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbilcblxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cblxuXG4gICAgIyMjKlxuICAgICogTW92ZXMgYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1vdmVPYmplY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBtb3ZlLlxuICAgICogQHBhcmFtIHtncy5Qb2ludH0gcG9zaXRpb24gLSBUaGUgcG9zaXRpb24gdG8gbW92ZSB0aGUgZ2FtZSBvYmplY3QgdG8uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjI1xuICAgIG1vdmVPYmplY3Q6IChvYmplY3QsIHBvc2l0aW9uLCBwYXJhbXMpIC0+XG4gICAgICAgIGlmIHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMFxuICAgICAgICAgICAgcCA9IEBwcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24ocGFyYW1zLnByZWRlZmluZWRQb3NpdGlvbklkLCBvYmplY3QsIHBhcmFtcylcbiAgICAgICAgICAgIHggPSBwLnhcbiAgICAgICAgICAgIHkgPSBwLnlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgeCA9IEBudW1iZXJWYWx1ZU9mKHBvc2l0aW9uLngpXG4gICAgICAgICAgICB5ID0gQG51bWJlclZhbHVlT2YocG9zaXRpb24ueSlcblxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcblxuICAgICAgICB6b29tID0gb2JqZWN0Lnpvb21cbiAgICAgICAgaWYgb2JqZWN0LmFuY2hvci54ICE9IDAgYW5kIG9iamVjdC5hbmNob3IueSAhPSAwXG4gICAgICAgICAgICBiaXRtYXAgPSBvYmplY3QuYml0bWFwXG4gICAgICAgICAgICBpZiBiaXRtYXA/XG4gICAgICAgICAgICAgICAgeCArPSAoYml0bWFwLndpZHRoKnpvb20ueC1iaXRtYXAud2lkdGgpICogb2JqZWN0LmFuY2hvci54XG4gICAgICAgICAgICAgICAgeSArPSAoYml0bWFwLmhlaWdodCp6b29tLnktYml0bWFwLmhlaWdodCkgKiBvYmplY3QuYW5jaG9yLnlcblxuICAgICAgICBvYmplY3QuYW5pbWF0b3IubW92ZVRvKHgsIHksIGR1cmF0aW9uLCBlYXNpbmcpXG5cbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uXG5cbiAgICAjIyMqXG4gICAgKiBNb3ZlcyBhIGdhbWUgb2JqZWN0IGFsb25nIGEgcGF0aC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1vdmVPYmplY3RQYXRoXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gbW92ZS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXRoIC0gVGhlIHBhdGggdG8gbW92ZSB0aGUgZ2FtZSBvYmplY3QgYWxvbmcuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjI1xuICAgIG1vdmVPYmplY3RQYXRoOiAob2JqZWN0LCBwYXRoLCBwYXJhbXMpIC0+XG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBvYmplY3QuYW5pbWF0b3IubW92ZVBhdGgocGF0aC5kYXRhLCBwYXJhbXMubG9vcFR5cGUsIGR1cmF0aW9uLCBlYXNpbmcsIHBhdGguZWZmZWN0cz8uZGF0YSlcblxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICMjIypcbiAgICAqIFNjcm9sbHMgYSBzY3JvbGxhYmxlIGdhbWUgb2JqZWN0IGFsb25nIGEgcGF0aC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNjcm9sbE9iamVjdFBhdGhcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBzY3JvbGwuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGF0aCAtIFRoZSBwYXRoIHRvIHNjcm9sbCB0aGUgZ2FtZSBvYmplY3QgYWxvbmcuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjI1xuICAgIHNjcm9sbE9iamVjdFBhdGg6IChvYmplY3QsIHBhdGgsIHBhcmFtcykgLT5cbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gQGR1cmF0aW9uVmFsdWVPZihwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIG9iamVjdC5hbmltYXRvci5zY3JvbGxQYXRoKHBhdGgsIHBhcmFtcy5sb29wVHlwZSwgZHVyYXRpb24sIGVhc2luZylcblxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICMjIypcbiAgICAqIFpvb21zL1NjYWxlcyBhIGdhbWUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgem9vbU9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHpvb20uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjI1xuICAgIHpvb21PYmplY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gQGR1cmF0aW9uVmFsdWVPZihwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIG9iamVjdC5hbmltYXRvci56b29tVG8oQG51bWJlclZhbHVlT2YocGFyYW1zLnpvb21pbmcueCkgLyAxMDAsIEBudW1iZXJWYWx1ZU9mKHBhcmFtcy56b29taW5nLnkpIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuXG4gICAgIyMjKlxuICAgICogUm90YXRlcyBhIGdhbWUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgcm90YXRlT2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gcm90YXRlLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyNcbiAgICByb3RhdGVPYmplY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gQGR1cmF0aW9uVmFsdWVPZihwYXJhbXMuZHVyYXRpb24pXG5cblxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcblxuICAgICAgICAjaWYgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcbiAgICAgICAgIyAgICBhY3R1YWxEdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgIyAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YoQGR1cmF0aW9uKVxuICAgICAgICAjICAgIHNwZWVkID0gQG51bWJlclZhbHVlT2YoQHBhcmFtcy5zcGVlZCkgLyAxMDBcbiAgICAgICAgIyAgICBzcGVlZCA9IE1hdGgucm91bmQoZHVyYXRpb24gLyAoYWN0dWFsRHVyYXRpb258fDEpICogc3BlZWQpXG4gICAgICAgICMgICAgcGljdHVyZS5hbmltYXRvci5yb3RhdGUoQHBhcmFtcy5kaXJlY3Rpb24sIHNwZWVkLCBhY3R1YWxEdXJhdGlvbnx8MSwgZWFzaW5nKVxuICAgICAgICAjICAgIGR1cmF0aW9uID0gYWN0dWFsRHVyYXRpb25cbiAgICAgICAgI2Vsc2VcbiAgICAgICAgIyAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICAjICAgIG9iamVjdC5hbmltYXRvci5yb3RhdGUocGFyYW1zLmRpcmVjdGlvbiwgQG51bWJlclZhbHVlT2YoQHBhcmFtcy5zcGVlZCkgLyAxMDAsIGR1cmF0aW9uLCBlYXNpbmcpXG5cbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLnJvdGF0ZShwYXJhbXMuZGlyZWN0aW9uLCBAbnVtYmVyVmFsdWVPZihwYXJhbXMuc3BlZWQpIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuXG4gICAgIyMjKlxuICAgICogQmxlbmRzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBibGVuZE9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGJsZW5kLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyNcbiAgICBibGVuZE9iamVjdDogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLmJsZW5kVG8oQG51bWJlclZhbHVlT2YocGFyYW1zLm9wYWNpdHkpLCBkdXJhdGlvbiwgZWFzaW5nKVxuXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBkdXJhdGlvblxuXG4gICAgIyMjKlxuICAgICogRXhlY3V0ZXMgYSBtYXNraW5nLWVmZmVjdCBvbiBhIGdhbWUgb2JqZWN0Li5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1hc2tPYmplY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBleGVjdXRlIGEgbWFza2luZy1lZmZlY3Qgb24uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjI1xuICAgIG1hc2tPYmplY3Q6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KHBhcmFtcy5lYXNpbmcpXG5cbiAgICAgICAgaWYgcGFyYW1zLm1hc2sudHlwZSA9PSAwXG4gICAgICAgICAgICBvYmplY3QubWFzay50eXBlID0gMFxuICAgICAgICAgICAgb2JqZWN0Lm1hc2sub3ggPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMubWFzay5veClcbiAgICAgICAgICAgIG9iamVjdC5tYXNrLm95ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLm1hc2sub3kpXG4gICAgICAgICAgICBpZiBvYmplY3QubWFzay5zb3VyY2U/LnZpZGVvRWxlbWVudD9cbiAgICAgICAgICAgICAgICBvYmplY3QubWFzay5zb3VyY2UucGF1c2UoKVxuXG4gICAgICAgICAgICBpZiBwYXJhbXMubWFzay5zb3VyY2VUeXBlID09IDBcbiAgICAgICAgICAgICAgICBvYmplY3QubWFzay5zb3VyY2UgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKHBhcmFtcy5tYXNrLmdyYXBoaWMpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9iamVjdC5tYXNrLnNvdXJjZSA9IFJlc291cmNlTWFuYWdlci5nZXRWaWRlbyhSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChwYXJhbXMubWFzay52aWRlbykpXG4gICAgICAgICAgICAgICAgaWYgb2JqZWN0Lm1hc2suc291cmNlXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5tYXNrLnNvdXJjZS5wbGF5KClcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0Lm1hc2suc291cmNlLmxvb3AgPSB5ZXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZHVyYXRpb24gPSBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgICAgIG1hc2sgPSBPYmplY3QuZmxhdENvcHkocGFyYW1zLm1hc2spXG4gICAgICAgICAgICBtYXNrLnZhbHVlID0gQG51bWJlclZhbHVlT2YobWFzay52YWx1ZSlcbiAgICAgICAgICAgIG9iamVjdC5hbmltYXRvci5tYXNrVG8obWFzaywgZHVyYXRpb24sIGVhc2luZylcblxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICMjIypcbiAgICAqIFRpbnRzIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCB0aW50T2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gdGludC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8uXG4gICAgIyMjXG4gICAgdGludE9iamVjdDogKG9iamVjdCwgcGFyYW1zKSAtPlxuICAgICAgICBkdXJhdGlvbiA9IEBkdXJhdGlvblZhbHVlT2YocGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QocGFyYW1zLmVhc2luZylcbiAgICAgICAgb2JqZWN0LmFuaW1hdG9yLnRpbnRUbyhwYXJhbXMudG9uZSwgZHVyYXRpb24sIGVhc2luZylcblxuICAgICAgICBpZiBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICMjIypcbiAgICAqIEZsYXNoZXMgYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGZsYXNoT2JqZWN0XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gZmxhc2guXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjI1xuICAgIGZsYXNoT2JqZWN0OiAob2JqZWN0LCBwYXJhbXMpIC0+XG4gICAgICAgIGR1cmF0aW9uID0gQGR1cmF0aW9uVmFsdWVPZihwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIG9iamVjdC5hbmltYXRvci5mbGFzaChuZXcgQ29sb3IocGFyYW1zLmNvbG9yKSwgZHVyYXRpb24pXG5cbiAgICAgICAgaWYgcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGR1cmF0aW9uXG5cbiAgICAjIyMqXG4gICAgKiBDcm9wZXMgYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyb3BPYmplY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBjcm9wLlxuICAgICogQHBhcmFtIHtPYmplY3R9IEEgcGFyYW1zIG9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mby5cbiAgICAjIyNcbiAgICBjcm9wT2JqZWN0OiAob2JqZWN0LCBwYXJhbXMpIC0+XG4gICAgICAgIG9iamVjdC5zcmNSZWN0LnggPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMueClcbiAgICAgICAgb2JqZWN0LnNyY1JlY3QueSA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy55KVxuICAgICAgICBvYmplY3Quc3JjUmVjdC53aWR0aCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy53aWR0aClcbiAgICAgICAgb2JqZWN0LnNyY1JlY3QuaGVpZ2h0ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLmhlaWdodClcblxuICAgICAgICBvYmplY3QuZHN0UmVjdC53aWR0aCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy53aWR0aClcbiAgICAgICAgb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLmhlaWdodClcblxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIG1vdGlvbiBibHVyIHNldHRpbmdzIG9mIGEgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBvYmplY3RNb3Rpb25CbHVyXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gc2V0IHRoZSBtb3Rpb24gYmx1ciBzZXR0aW5ncyBmb3IuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gQSBwYXJhbXMgb2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvLlxuICAgICMjI1xuICAgIG9iamVjdE1vdGlvbkJsdXI6IChvYmplY3QsIHBhcmFtcykgLT5cbiAgICAgICAgb2JqZWN0Lm1vdGlvbkJsdXIuc2V0KHBhcmFtcy5tb3Rpb25CbHVyKVxuXG4gICAgIyMjKlxuICAgICogRW5hYmxlcyBhbiBlZmZlY3Qgb24gYSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9iamVjdEVmZmVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGV4ZWN1dGUgYSBtYXNraW5nLWVmZmVjdCBvbi5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBBIHBhcmFtcyBvYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGluZm8uXG4gICAgIyMjXG4gICAgb2JqZWN0RWZmZWN0OiAob2JqZWN0LCBwYXJhbXMpIC0+XG4gICAgICAgIGR1cmF0aW9uID0gQGR1cmF0aW9uVmFsdWVPZihwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChwYXJhbXMuZWFzaW5nKVxuXG4gICAgICAgIHN3aXRjaCBwYXJhbXMudHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgV29iYmxlXG4gICAgICAgICAgICAgICAgb2JqZWN0LmFuaW1hdG9yLndvYmJsZVRvKHBhcmFtcy53b2JibGUucG93ZXIgLyAxMDAwMCwgcGFyYW1zLndvYmJsZS5zcGVlZCAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgICAgICAgICB3b2JibGUgPSBvYmplY3QuZWZmZWN0cy53b2JibGVcbiAgICAgICAgICAgICAgICB3b2JibGUuZW5hYmxlZCA9IHBhcmFtcy53b2JibGUucG93ZXIgPiAwXG4gICAgICAgICAgICAgICAgd29iYmxlLnZlcnRpY2FsID0gcGFyYW1zLndvYmJsZS5vcmllbnRhdGlvbiA9PSAwIG9yIHBhcmFtcy53b2JibGUub3JpZW50YXRpb24gPT0gMlxuICAgICAgICAgICAgICAgIHdvYmJsZS5ob3Jpem9udGFsID0gcGFyYW1zLndvYmJsZS5vcmllbnRhdGlvbiA9PSAxIG9yIHBhcmFtcy53b2JibGUub3JpZW50YXRpb24gPT0gMlxuICAgICAgICAgICAgd2hlbiAxICMgQmx1clxuICAgICAgICAgICAgICAgIG9iamVjdC5hbmltYXRvci5ibHVyVG8ocGFyYW1zLmJsdXIucG93ZXIgLyAxMDAsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICAgICAgb2JqZWN0LmVmZmVjdHMuYmx1ci5lbmFibGVkID0geWVzXG4gICAgICAgICAgICB3aGVuIDIgIyBQaXhlbGF0ZVxuICAgICAgICAgICAgICAgIG9iamVjdC5hbmltYXRvci5waXhlbGF0ZVRvKHBhcmFtcy5waXhlbGF0ZS5zaXplLndpZHRoLCBwYXJhbXMucGl4ZWxhdGUuc2l6ZS5oZWlnaHQsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICAgICAgb2JqZWN0LmVmZmVjdHMucGl4ZWxhdGUuZW5hYmxlZCA9IHllc1xuXG4gICAgICAgIGlmIHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgZHVyYXRpb24gIT0gMFxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIGFuIGFjdGlvbiBmb3IgYSBjaG9pY2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBleGVjdXRlQ2hvaWNlQWN0aW9uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uIC0gQWN0aW9uLURhdGEuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXRlVmFsdWUgLSBJbiBjYXNlIG9mIHN3aXRjaC1iaW5kaW5nLCB0aGUgc3dpdGNoIGlzIHNldCB0byB0aGlzIHZhbHVlLlxuICAgICMjI1xuICAgIGV4ZWN1dGVDaG9pY2VBY3Rpb246IChhY3Rpb24sIHN0YXRlVmFsdWUpIC0+XG4gICAgICAgIHN3aXRjaCBhY3Rpb24udHlwZVxuICAgICAgICAgICAgd2hlbiA0XG4gICAgICAgICAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci5zY2VuZURhdGEgPSBHYW1lTWFuYWdlci5zY2VuZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVpZDogdWlkID0gYWN0aW9uLnNjZW5lLnVpZCxcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZXM6IHNjZW5lLnBpY3R1cmVDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0czogc2NlbmUudGV4dENvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW4sXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvczogc2NlbmUudmlkZW9Db250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1NjZW5lID0gbmV3IHZuLk9iamVjdF9TY2VuZSgpXG4gICAgICAgICAgICAgICAgbmV3U2NlbmUuc2NlbmVEYXRhID0gdWlkOiBhY3Rpb24uc2NlbmUudWlkLCBwaWN0dXJlczogc2NlbmUucGljdHVyZUNvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW4sIHRleHRzOiBzY2VuZS50ZXh0Q29udGFpbmVyLnN1Yk9iamVjdHNCeURvbWFpbiwgdmlkZW9zOiBzY2VuZS52aWRlb0NvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW5cbiAgICAgICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8obmV3U2NlbmUsIG5vLCA9PiBAaXNXYWl0aW5nID0gbm8pXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGV4ZWN1dGVBY3Rpb24oYWN0aW9uLCBzdGF0ZVZhbHVlLCAwKVxuXG4gICAgIyMjKlxuICAgICogRXhlY3V0ZXMgYW4gYWN0aW9uIGxpa2UgZm9yIGEgaG90c3BvdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVBY3Rpb25cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gLSBBY3Rpb24tRGF0YS5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc3RhdGVWYWx1ZSAtIEluIGNhc2Ugb2Ygc3dpdGNoLWJpbmRpbmcsIHRoZSBzd2l0Y2ggaXMgc2V0IHRvIHRoaXMgdmFsdWUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYmluZFZhbHVlIC0gQSBudW1iZXIgdmFsdWUgd2hpY2ggYmUgcHV0IGludG8gdGhlIGFjdGlvbidzIGJpbmQtdmFsdWUgdmFyaWFibGUuXG4gICAgIyMjXG4gICAgZXhlY3V0ZUFjdGlvbjogKGFjdGlvbiwgc3RhdGVWYWx1ZSwgYmluZFZhbHVlKSAtPlxuICAgICAgICBzd2l0Y2ggYWN0aW9uLnR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIEp1bXAgVG8gTGFiZWxcbiAgICAgICAgICAgICAgICBpZiBhY3Rpb24ubGFiZWxJbmRleFxuICAgICAgICAgICAgICAgICAgICBAcG9pbnRlciA9IGFjdGlvbi5sYWJlbEluZGV4XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAanVtcFRvTGFiZWwoYWN0aW9uLmxhYmVsKVxuICAgICAgICAgICAgd2hlbiAxICMgQ2FsbCBDb21tb24gRXZlbnRcbiAgICAgICAgICAgICAgICBAY2FsbENvbW1vbkV2ZW50KGFjdGlvbi5jb21tb25FdmVudElkLCBudWxsLCBAaXNXYWl0aW5nKVxuICAgICAgICAgICAgd2hlbiAyICMgQmluZCBUbyBTd2l0Y2hcbiAgICAgICAgICAgICAgICBkb21haW4gPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmRvbWFpblxuICAgICAgICAgICAgICAgIEBzZXRCb29sZWFuVmFsdWVUbyhhY3Rpb24uc3dpdGNoLCBzdGF0ZVZhbHVlKVxuICAgICAgICAgICAgd2hlbiAzICMgQ2FsbCBTY2VuZVxuICAgICAgICAgICAgICAgIEBjYWxsU2NlbmUoYWN0aW9uLnNjZW5lPy51aWQpXG4gICAgICAgICAgICB3aGVuIDQgIyBCaW5kIFZhbHVlIHRvIFZhcmlhYmxlXG4gICAgICAgICAgICAgICAgZG9tYWluID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5kb21haW5cbiAgICAgICAgICAgICAgICBAc2V0TnVtYmVyVmFsdWVUbyhhY3Rpb24uYmluZFZhbHVlVmFyaWFibGUsIGJpbmRWYWx1ZSlcbiAgICAgICAgICAgICAgICBpZiBhY3Rpb24ubGFiZWxJbmRleFxuICAgICAgICAgICAgICAgICAgICBAcG9pbnRlciA9IGFjdGlvbi5sYWJlbEluZGV4XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAanVtcFRvTGFiZWwoYWN0aW9uLmxhYmVsKVxuXG4gICAgIyMjKlxuICAgICogQ2FsbHMgYSBjb21tb24gZXZlbnQgYW5kIHJldHVybnMgdGhlIHN1Yi1pbnRlcnByZXRlciBmb3IgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxsQ29tbW9uRXZlbnRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpZCAtIFRoZSBJRCBvZiB0aGUgY29tbW9uIGV2ZW50IHRvIGNhbGwuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1ldGVycyAtIE9wdGlvbmFsIGNvbW1vbiBldmVudCBwYXJhbWV0ZXJzLlxuICAgICogQHBhcmFtIHtib29sZWFufSB3YWl0IC0gSW5kaWNhdGVzIGlmIHRoZSBpbnRlcnByZXRlciBzaG91bGQgYmUgc3RheSBpbiB3YWl0aW5nLW1vZGUgZXZlbiBpZiB0aGUgc3ViLWludGVycHJldGVyIGlzIGZpbmlzaGVkLlxuICAgICMjI1xuICAgIGNhbGxDb21tb25FdmVudDogKGlkLCBwYXJhbWV0ZXJzLCB3YWl0KSAtPlxuICAgICAgICBjb21tb25FdmVudCA9IEdhbWVNYW5hZ2VyLmNvbW1vbkV2ZW50c1tpZF1cblxuICAgICAgICBpZiBjb21tb25FdmVudD9cbiAgICAgICAgICAgIGlmIFNjZW5lTWFuYWdlci5zY2VuZS5jb21tb25FdmVudENvbnRhaW5lci5zdWJPYmplY3RzLmluZGV4T2YoY29tbW9uRXZlbnQpID09IC0xXG4gICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmNvbW1vbkV2ZW50Q29udGFpbmVyLmFkZE9iamVjdChjb21tb25FdmVudClcbiAgICAgICAgICAgIGNvbW1vbkV2ZW50LmV2ZW50cz8ub24gXCJmaW5pc2hcIiwgZ3MuQ2FsbEJhY2soXCJvbkNvbW1vbkV2ZW50RmluaXNoXCIsIHRoaXMpLCB7IHdhaXRpbmc6IHdhaXQgfVxuXG4gICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIgPSBjb21tb25FdmVudC5iZWhhdmlvci5jYWxsKHBhcmFtZXRlcnMgfHwgW10sIEBzZXR0aW5ncywgQGNvbnRleHQpXG4gICAgICAgICAgICAjR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cExvY2FsVmFyaWFibGVzKEBzdWJJbnRlcnByZXRlci5jb250ZXh0KVxuICAgICAgICAgICAgI0dhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXBUZW1wVmFyaWFibGVzKEBzdWJJbnRlcnByZXRlci5jb250ZXh0KVxuICAgICAgICAgICAgY29tbW9uRXZlbnQuYmVoYXZpb3IudXBkYXRlKClcblxuICAgICAgICAgICAgaWYgQHN1YkludGVycHJldGVyP1xuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIuc2V0dGluZ3MgPSBAc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBAc3ViSW50ZXJwcmV0ZXIuc3RhcnQoKVxuICAgICAgICAgICAgICAgIEBzdWJJbnRlcnByZXRlci51cGRhdGUoKVxuXG4gICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAY29udGV4dClcblxuICAgICMjIypcbiAgICAqIENhbGxzIGEgc2NlbmUgYW5kIHJldHVybnMgdGhlIHN1Yi1pbnRlcnByZXRlciBmb3IgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxsU2NlbmVcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1aWQgLSBUaGUgVUlEIG9mIHRoZSBzY2VuZSB0byBjYWxsLlxuICAgICMjI1xuICAgIGNhbGxTY2VuZTogKHVpZCkgLT5cbiAgICAgICAgc2NlbmVEb2N1bWVudCA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50KHVpZClcblxuICAgICAgICBpZiBzY2VuZURvY3VtZW50P1xuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQHN1YkludGVycHJldGVyID0gbmV3IHZuLkNvbXBvbmVudF9DYWxsU2NlbmVJbnRlcnByZXRlcigpXG4gICAgICAgICAgICBvYmplY3QgPSB7IGNvbW1hbmRzOiBzY2VuZURvY3VtZW50Lml0ZW1zLmNvbW1hbmRzIH1cbiAgICAgICAgICAgIEBzdWJJbnRlcnByZXRlci5yZXBlYXQgPSBub1xuICAgICAgICAgICAgQHN1YkludGVycHJldGVyLmNvbnRleHQuc2V0KHNjZW5lRG9jdW1lbnQudWlkLCBzY2VuZURvY3VtZW50KVxuICAgICAgICAgICAgQHN1YkludGVycHJldGVyLm9iamVjdCA9IG9iamVjdFxuICAgICAgICAgICAgQHN1YkludGVycHJldGVyLm9uRmluaXNoID0gZ3MuQ2FsbEJhY2soXCJvbkNhbGxTY2VuZUZpbmlzaFwiLCB0aGlzKVxuICAgICAgICAgICAgQHN1YkludGVycHJldGVyLnN0YXJ0KClcbiAgICAgICAgICAgIEBzdWJJbnRlcnByZXRlci5zZXR0aW5ncyA9IEBzZXR0aW5nc1xuICAgICAgICAgICAgQHN1YkludGVycHJldGVyLnVwZGF0ZSgpXG5cblxuXG4gICAgIyMjKlxuICAgICogQ2FsbHMgYSBjb21tb24gZXZlbnQgYW5kIHJldHVybnMgdGhlIHN1Yi1pbnRlcnByZXRlciBmb3IgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdG9yZUxpc3RWYWx1ZVxuICAgICogQHBhcmFtIHtudW1iZXJ9IGlkIC0gVGhlIElEIG9mIHRoZSBjb21tb24gZXZlbnQgdG8gY2FsbC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbWV0ZXJzIC0gT3B0aW9uYWwgY29tbW9uIGV2ZW50IHBhcmFtZXRlcnMuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHdhaXQgLSBJbmRpY2F0ZXMgaWYgdGhlIGludGVycHJldGVyIHNob3VsZCBiZSBzdGF5IGluIHdhaXRpbmctbW9kZSBldmVuIGlmIHRoZSBzdWItaW50ZXJwcmV0ZXIgaXMgZmluaXNoZWQuXG4gICAgIyMjXG4gICAgc3RvcmVMaXN0VmFsdWU6ICh2YXJpYWJsZSwgbGlzdCwgdmFsdWUsIHZhbHVlVHlwZSkgLT5cbiAgICAgICAgc3dpdGNoIHZhbHVlVHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyIFZhbHVlXG4gICAgICAgICAgICAgICAgQHNldE51bWJlclZhbHVlVG8odmFyaWFibGUsIChpZiAhaXNOYU4odmFsdWUpIHRoZW4gcGFyc2VJbnQodmFsdWUpIGVsc2UgMCkpXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2ggVmFsdWVcbiAgICAgICAgICAgICAgICBAc2V0Qm9vbGVhblZhbHVlVG8odmFyaWFibGUsIChpZiB2YWx1ZSB0aGVuIDEgZWxzZSAwKSlcbiAgICAgICAgICAgIHdoZW4gMiAjIFRleHQgVmFsdWVcbiAgICAgICAgICAgICAgICBAc2V0U3RyaW5nVmFsdWVUbyh2YXJpYWJsZSwgdmFsdWUudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIHdoZW4gMyAjIExpc3QgVmFsdWVcbiAgICAgICAgICAgICAgICBAc2V0TGlzdE9iamVjdFRvKHZhcmlhYmxlLCAoaWYgdmFsdWUubGVuZ3RoPyB0aGVuIHZhbHVlIGVsc2UgW10pKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBqdW1wVG9MYWJlbFxuICAgICMjI1xuICAgIGp1bXBUb0xhYmVsOiAobGFiZWwpIC0+XG4gICAgICAgIHJldHVybiBpZiBub3QgbGFiZWxcbiAgICAgICAgZm91bmQgPSBub1xuXG4gICAgICAgIGZvciBpIGluIFswLi4uQG9iamVjdC5jb21tYW5kcy5sZW5ndGhdXG4gICAgICAgICAgICBpZiBAb2JqZWN0LmNvbW1hbmRzW2ldLmlkID09IFwiZ3MuTGFiZWxcIiBhbmQgQG9iamVjdC5jb21tYW5kc1tpXS5wYXJhbXMubmFtZSA9PSBsYWJlbFxuICAgICAgICAgICAgICAgIEBwb2ludGVyID0gaVxuICAgICAgICAgICAgICAgIEBpbmRlbnQgPSBAb2JqZWN0LmNvbW1hbmRzW2ldLmluZGVudFxuICAgICAgICAgICAgICAgIGZvdW5kID0geWVzXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBpZiBmb3VuZFxuICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gMFxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSBjdXJyZW50IG1lc3NhZ2UgYm94IG9iamVjdCBkZXBlbmRpbmcgb24gZ2FtZSBtb2RlIChBRFYgb3IgTlZMKS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1lc3NhZ2VCb3hPYmplY3RcbiAgICAqIEByZXR1cm4ge2dzLk9iamVjdF9CYXNlfSBUaGUgbWVzc2FnZSBib3ggb2JqZWN0LlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIG1lc3NhZ2VCb3hPYmplY3Q6IChpZCkgLT5cbiAgICAgICAgaWYgU2NlbmVNYW5hZ2VyLnNjZW5lLmxheW91dC52aXNpYmxlXG4gICAgICAgICAgICByZXR1cm4gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoaWQgfHwgXCJtZXNzYWdlQm94XCIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChpZCB8fCBcIm52bE1lc3NhZ2VCb3hcIilcblxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGN1cnJlbnQgbWVzc2FnZSBvYmplY3QgZGVwZW5kaW5nIG9uIGdhbWUgbW9kZSAoQURWIG9yIE5WTCkuXG4gICAgKlxuICAgICogQG1ldGhvZCBtZXNzYWdlT2JqZWN0XG4gICAgKiBAcmV0dXJuIHt1aS5PYmplY3RfTWVzc2FnZX0gVGhlIG1lc3NhZ2Ugb2JqZWN0LlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIG1lc3NhZ2VPYmplY3Q6IC0+XG4gICAgICAgIGlmIFNjZW5lTWFuYWdlci5zY2VuZS5sYXlvdXQudmlzaWJsZVxuICAgICAgICAgICAgcmV0dXJuIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwiZ2FtZU1lc3NhZ2VfbWVzc2FnZVwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJudmxHYW1lTWVzc2FnZV9tZXNzYWdlXCIpXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgY3VycmVudCBtZXNzYWdlIElEIGRlcGVuZGluZyBvbiBnYW1lIG1vZGUgKEFEViBvciBOVkwpLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVzc2FnZU9iamVjdElkXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBtZXNzYWdlIG9iamVjdCBJRC5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBtZXNzYWdlT2JqZWN0SWQ6IC0+XG4gICAgICAgIGlmIFNjZW5lTWFuYWdlci5zY2VuZS5sYXlvdXQudmlzaWJsZVxuICAgICAgICAgICAgcmV0dXJuIFwiZ2FtZU1lc3NhZ2VfbWVzc2FnZVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBcIm52bEdhbWVNZXNzYWdlX21lc3NhZ2VcIlxuXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgY3VycmVudCBtZXNzYWdlIHNldHRpbmdzLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVzc2FnZVNldHRpbmdzXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBtZXNzYWdlIHNldHRpbmdzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgbWVzc2FnZVNldHRpbmdzOiAtPlxuICAgICAgICBtZXNzYWdlID0gQHRhcmdldE1lc3NhZ2UoKVxuXG4gICAgICAgIHJldHVybiBtZXNzYWdlLnNldHRpbmdzXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSBjdXJyZW50IHRhcmdldCBtZXNzYWdlIG9iamVjdCB3aGVyZSBhbGwgbWVzc2FnZSBjb21tYW5kcyBhcmUgZXhlY3V0ZWQgb24uXG4gICAgKlxuICAgICogQG1ldGhvZCB0YXJnZXRNZXNzYWdlXG4gICAgKiBAcmV0dXJuIHt1aS5PYmplY3RfTWVzc2FnZX0gVGhlIHRhcmdldCBtZXNzYWdlIG9iamVjdC5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICB0YXJnZXRNZXNzYWdlOiAtPlxuICAgICAgICBtZXNzYWdlID0gQG1lc3NhZ2VPYmplY3QoKVxuICAgICAgICB0YXJnZXQgPSBAc2V0dGluZ3MubWVzc2FnZS50YXJnZXRcbiAgICAgICAgaWYgdGFyZ2V0P1xuICAgICAgICAgICAgc3dpdGNoIHRhcmdldC50eXBlXG4gICAgICAgICAgICAgICAgd2hlbiAwICMgTGF5b3V0LUJhc2VkXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZCh0YXJnZXQuaWQpID8gQG1lc3NhZ2VPYmplY3QoKVxuICAgICAgICAgICAgICAgIHdoZW4gMSAjIEN1c3RvbVxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gU2NlbmVNYW5hZ2VyLnNjZW5lLm1lc3NhZ2VBcmVhc1t0YXJnZXQuaWRdPy5tZXNzYWdlID8gQG1lc3NhZ2VPYmplY3QoKVxuXG4gICAgICAgIHJldHVybiBtZXNzYWdlXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSBjdXJyZW50IHRhcmdldCBtZXNzYWdlIGJveCBjb250YWluaW5nIHRoZSBjdXJyZW50IHRhcmdldCBtZXNzYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdGFyZ2V0TWVzc2FnZUJveFxuICAgICogQHJldHVybiB7dWkuT2JqZWN0X1VJRWxlbWVudH0gVGhlIHRhcmdldCBtZXNzYWdlIGJveC5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICB0YXJnZXRNZXNzYWdlQm94OiAtPlxuICAgICAgICBtZXNzYWdlQm94ID0gQG1lc3NhZ2VPYmplY3QoKVxuICAgICAgICB0YXJnZXQgPSBAc2V0dGluZ3MubWVzc2FnZS50YXJnZXRcbiAgICAgICAgaWYgdGFyZ2V0P1xuICAgICAgICAgICAgc3dpdGNoIHRhcmdldC50eXBlXG4gICAgICAgICAgICAgICAgd2hlbiAwICMgTGF5b3V0LUJhc2VkXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VCb3ggPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZCh0YXJnZXQuaWQpID8gQG1lc3NhZ2VPYmplY3QoKVxuICAgICAgICAgICAgICAgIHdoZW4gMSAjIEN1c3RvbVxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQm94ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJjdXN0b21HYW1lTWVzc2FnZV9cIit0YXJnZXQuaWQpID8gQG1lc3NhZ2VPYmplY3QoKVxuXG4gICAgICAgIHJldHVybiBtZXNzYWdlQm94XG5cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgYWZ0ZXIgYW4gaW5wdXQgbnVtYmVyIGRpYWxvZyB3YXMgYWNjZXB0ZWQgYnkgdGhlIHVzZXIuIEl0IHRha2VzIHRoZSB1c2VyJ3MgaW5wdXQgYW5kIHB1dHNcbiAgICAqIGl0IGluIHRoZSBjb25maWd1cmVkIG51bWJlciB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uSW5wdXROdW1iZXJGaW5pc2hcbiAgICAqIEByZXR1cm4ge09iamVjdH0gRXZlbnQgT2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBkYXRhIGxpa2UgdGhlIG51bWJlciwgZXRjLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIG9uSW5wdXROdW1iZXJGaW5pc2g6IChlKSAtPlxuICAgICAgICBAbWVzc2FnZU9iamVjdCgpLmJlaGF2aW9yLmNsZWFyKClcbiAgICAgICAgQHNldE51bWJlclZhbHVlVG8oQHdhaXRpbmdGb3IuaW5wdXROdW1iZXIudmFyaWFibGUsIHBhcnNlSW50KHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKGUuc2VuZGVyLCBlLm51bWJlcikpKVxuICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgQHdhaXRpbmdGb3IuaW5wdXROdW1iZXIgPSBudWxsXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5pbnB1dE51bWJlckJveC5kaXNwb3NlKClcblxuICAgICMjIypcbiAgICAqIENhbGxlZCBhZnRlciBhbiBpbnB1dCB0ZXh0IGRpYWxvZyB3YXMgYWNjZXB0ZWQgYnkgdGhlIHVzZXIuIEl0IHRha2VzIHRoZSB1c2VyJ3MgdGV4dCBpbnB1dCBhbmQgcHV0c1xuICAgICogaXQgaW4gdGhlIGNvbmZpZ3VyZWQgc3RyaW5nIHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb25JbnB1dFRleHRGaW5pc2hcbiAgICAqIEByZXR1cm4ge09iamVjdH0gRXZlbnQgT2JqZWN0IGNvbnRhaW5pbmcgYWRkaXRpb25hbCBkYXRhIGxpa2UgdGhlIHRleHQsIGV0Yy5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBvbklucHV0VGV4dEZpbmlzaDogKGUpIC0+XG4gICAgICAgIEBtZXNzYWdlT2JqZWN0KCkuYmVoYXZpb3IuY2xlYXIoKVxuICAgICAgICBAc2V0U3RyaW5nVmFsdWVUbyhAd2FpdGluZ0Zvci5pbnB1dFRleHQudmFyaWFibGUsIHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKGUuc2VuZGVyLCBlLnRleHQpLnJlcGxhY2UoL18vZywgXCJcIikpXG4gICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICBAd2FpdGluZ0Zvci5pbnB1dFRleHQgPSBudWxsXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5pbnB1dFRleHRCb3guZGlzcG9zZSgpXG5cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgYWZ0ZXIgYSBjaG9pY2Ugd2FzIHNlbGVjdGVkIGJ5IHRoZSB1c2VyLiBJdCBqdW1wcyB0byB0aGUgY29ycmVzcG9uZGluZyBsYWJlbFxuICAgICogYW5kIGFsc28gcHV0cyB0aGUgY2hvaWNlIGludG8gYmFja2xvZy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uQ2hvaWNlQWNjZXB0XG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IEV2ZW50IE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YSBsaWtlIHRoZSBsYWJlbCwgZXRjLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIG9uQ2hvaWNlQWNjZXB0OiAoZSkgLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuY2hvaWNlVGltZXIuYmVoYXZpb3Iuc3RvcCgpXG5cbiAgICAgICAgZS5pc1NlbGVjdGVkID0geWVzXG4gICAgICAgIGRlbGV0ZSBlLnNlbmRlclxuXG4gICAgICAgIEdhbWVNYW5hZ2VyLmJhY2tsb2cucHVzaCh7IGNoYXJhY3RlcjogeyBuYW1lOiBcIlwiIH0sIG1lc3NhZ2U6IFwiXCIsIGNob2ljZTogZSwgY2hvaWNlczogc2NlbmUuY2hvaWNlcywgaXNDaG9pY2U6IHllcyB9KVxuICAgICAgICBzY2VuZS5jaG9pY2VzID0gW11cbiAgICAgICAgbWVzc2FnZU9iamVjdCA9IEBtZXNzYWdlT2JqZWN0KClcbiAgICAgICAgaWYgbWVzc2FnZU9iamVjdD8udmlzaWJsZVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgZmFkaW5nID0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLm1lc3NhZ2VGYWRpbmdcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgdGhlbiAwIGVsc2UgZmFkaW5nLmR1cmF0aW9uXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmFuaW1hdG9yLmRpc2FwcGVhcihmYWRpbmcuYW5pbWF0aW9uLCBmYWRpbmcuZWFzaW5nLCBkdXJhdGlvbiwgPT5cbiAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmJlaGF2aW9yLmNsZWFyKClcbiAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0LnZpc2libGUgPSBub1xuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgIEB3YWl0aW5nRm9yLmNob2ljZSA9IG51bGxcbiAgICAgICAgICAgICAgICBAZXhlY3V0ZUNob2ljZUFjdGlvbihlLmFjdGlvbiwgdHJ1ZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICBAZXhlY3V0ZUNob2ljZUFjdGlvbihlLmFjdGlvbiwgdHJ1ZSlcbiAgICAgICAgc2NlbmUuY2hvaWNlV2luZG93LmRpc3Bvc2UoKVxuXG4gICAgIyMjKlxuICAgICogSWRsZVxuICAgICogQG1ldGhvZCBjb21tYW5kSWRsZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRJZGxlOiAtPlxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gIUBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKClcblxuXG4gICAgIyMjKlxuICAgICogU3RhcnQgVGltZXJcbiAgICAqIEBtZXRob2QgY29tbWFuZFN0YXJ0VGltZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU3RhcnRUaW1lcjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgdGltZXJzID0gc2NlbmUudGltZXJzXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0aW1lciA9IHRpbWVyc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB0aW1lcj9cbiAgICAgICAgICAgIHRpbWVyID0gbmV3IGdzLk9iamVjdF9JbnRlcnZhbFRpbWVyKClcbiAgICAgICAgICAgIHRpbWVyc1tudW1iZXJdID0gdGltZXJcblxuICAgICAgICB0aW1lci5ldmVudHMub2ZmQnlPd25lcihcImVsYXBzZWRcIiwgQG9iamVjdClcbiAgICAgICAgdGltZXIuZXZlbnRzLm9uKFwiZWxhcHNlZFwiLCAoZSkgPT5cbiAgICAgICAgICAgIHBhcmFtcyA9IGUuZGF0YS5wYXJhbXNcbiAgICAgICAgICAgIHN3aXRjaCBwYXJhbXMuYWN0aW9uLnR5cGVcbiAgICAgICAgICAgICAgICB3aGVuIDAgIyBKdW1wIFRvIExhYmVsXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhcmFtcy5sYWJlbEluZGV4P1xuICAgICAgICAgICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmludGVycHJldGVyLnBvaW50ZXIgPSBwYXJhbXMubGFiZWxJbmRleFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuaW50ZXJwcmV0ZXIuanVtcFRvTGFiZWwocGFyYW1zLmFjdGlvbi5kYXRhLmxhYmVsKVxuICAgICAgICAgICAgICAgIHdoZW4gMSAjIENhbGwgQ29tbW9uIEV2ZW50XG4gICAgICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5pbnRlcnByZXRlci5jYWxsQ29tbW9uRXZlbnQocGFyYW1zLmFjdGlvbi5kYXRhLmNvbW1vbkV2ZW50SWQsIG51bGwsIEBpbnRlcnByZXRlci5pc1dhaXRpbmcpXG4gICAgICAgIHsgcGFyYW1zOiBAcGFyYW1zIH0sIEBvYmplY3QpXG5cbiAgICAgICAgdGltZXIuYmVoYXZpb3IuaW50ZXJ2YWwgPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuaW50ZXJ2YWwpXG4gICAgICAgIHRpbWVyLmJlaGF2aW9yLnN0YXJ0KClcblxuXG4gICAgIyMjKlxuICAgICogUmVzdW1lIFRpbWVyXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSZXN1bWVUaW1lclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRSZXN1bWVUaW1lcjogLT5cbiAgICAgICAgdGltZXJzID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnRpbWVyc1xuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGltZXJzW251bWJlcl0/LmJlaGF2aW9yLnJlc3VtZSgpXG5cbiAgICAjIyMqXG4gICAgKiBQYXVzZXMgVGltZXJcbiAgICAqIEBtZXRob2QgY29tbWFuZFBhdXNlVGltZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUGF1c2VUaW1lcjogLT5cbiAgICAgICAgdGltZXJzID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnRpbWVyc1xuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGltZXJzW251bWJlcl0/LmJlaGF2aW9yLnBhdXNlKClcblxuICAgICMjIypcbiAgICAqIFN0b3AgVGltZXJcbiAgICAqIEBtZXRob2QgY29tbWFuZFN0b3BUaW1lclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTdG9wVGltZXI6IC0+XG4gICAgICAgIHRpbWVycyA9IFNjZW5lTWFuYWdlci5zY2VuZS50aW1lcnNcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRpbWVyc1tudW1iZXJdPy5iZWhhdmlvci5zdG9wKClcblxuICAgICMjIypcbiAgICAqIFdhaXRcbiAgICAqIEBtZXRob2QgY29tbWFuZFdhaXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kV2FpdDogLT5cbiAgICAgICAgdGltZSA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy50aW1lKVxuXG4gICAgICAgIGlmIHRpbWU/IGFuZCB0aW1lID4gMCBhbmQgIUBpbnRlcnByZXRlci5wcmV2aWV3RGF0YVxuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gdGltZVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuXG4gICAgIyMjKlxuICAgICogTG9vcFxuICAgICogQG1ldGhvZCBjb21tYW5kTG9vcFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMb29wOiAtPlxuICAgICAgICBAaW50ZXJwcmV0ZXIubG9vcHNbQGludGVycHJldGVyLmluZGVudF0gPSB7IHBvaW50ZXI6IEBpbnRlcnByZXRlci5wb2ludGVyLCBjb25kaXRpb246IC0+IHRydWUgfVxuICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50KytcblxuICAgICMjIypcbiAgICAqIEZvci1Mb29wIG92ZXIgbGlzdHNcbiAgICAqIEBtZXRob2QgY29tbWFuZExvb3BGb3JJbkxpc3RcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTG9vcEZvckluTGlzdDogLT5cbiAgICAgICAgaWYgIUBpbnRlcnByZXRlci5sb29wc1tAaW50ZXJwcmV0ZXIuaW5kZW50XVxuICAgICAgICAgICAgQGludGVycHJldGVyLmxvb3BzW0BpbnRlcnByZXRlci5pbmRlbnRdID0gbmV3IGdzLkZvckxvb3BDb21tYW5kKEBwYXJhbXMsIEBpbnRlcnByZXRlcilcbiAgICAgICAgICAgIGlmIEBpbnRlcnByZXRlci5sb29wc1tAaW50ZXJwcmV0ZXIuaW5kZW50XS5jb25kaXRpb24oKVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5pbmRlbnQrK1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50KytcblxuICAgICMjIypcbiAgICAqIEJyZWFrIExvb3BcbiAgICAqIEBtZXRob2QgY29tbWFuZEJyZWFrTG9vcFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRCcmVha0xvb3A6IC0+XG4gICAgICAgIGluZGVudCA9IEBpbmRlbnRcbiAgICAgICAgd2hpbGUgbm90IEBpbnRlcnByZXRlci5sb29wc1tpbmRlbnRdPyBhbmQgaW5kZW50ID4gMFxuICAgICAgICAgICAgaW5kZW50LS1cblxuICAgICAgICBAaW50ZXJwcmV0ZXIubG9vcHNbaW5kZW50XSA9IG51bGxcbiAgICAgICAgQGludGVycHJldGVyLmluZGVudCA9IGluZGVudFxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdEFkZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMaXN0QWRkOiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcblxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy52YWx1ZVR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlciBWYWx1ZVxuICAgICAgICAgICAgICAgIGxpc3QucHVzaChAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFN3aXRjaCBWYWx1ZVxuICAgICAgICAgICAgICAgIGxpc3QucHVzaChAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSkpXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0IFZhbHVlXG4gICAgICAgICAgICAgICAgbGlzdC5wdXNoKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuc3RyaW5nVmFsdWUpKVxuICAgICAgICAgICAgd2hlbiAzICMgTGlzdCBWYWx1ZVxuICAgICAgICAgICAgICAgIGxpc3QucHVzaChAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhbHVlKSlcblxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TGlzdE9iamVjdFRvKEBwYXJhbXMubGlzdFZhcmlhYmxlLCBsaXN0KVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdFBvcFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMaXN0UG9wOiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgdmFsdWUgPSBsaXN0LnBvcCgpID8gMFxuXG4gICAgICAgIEBpbnRlcnByZXRlci5zdG9yZUxpc3RWYWx1ZShAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBsaXN0LCB2YWx1ZSwgQHBhcmFtcy52YWx1ZVR5cGUpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0U2hpZnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTGlzdFNoaWZ0OiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgdmFsdWUgPSBsaXN0LnNoaWZ0KCkgPyAwXG5cbiAgICAgICAgQGludGVycHJldGVyLnN0b3JlTGlzdFZhbHVlKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGxpc3QsIHZhbHVlLCBAcGFyYW1zLnZhbHVlVHlwZSlcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RJbmRleE9mXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZExpc3RJbmRleE9mOiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgdmFsdWUgPSAtMVxuXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnZhbHVlVHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyIFZhbHVlXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBsaXN0LmluZGV4T2YoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkpXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2ggVmFsdWVcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGxpc3QuaW5kZXhPZihAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSkpXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0IFZhbHVlXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBsaXN0LmluZGV4T2YoQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5zdHJpbmdWYWx1ZSkpXG4gICAgICAgICAgICB3aGVuIDMgIyBMaXN0IFZhbHVlXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBsaXN0LmluZGV4T2YoQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYWx1ZSkpXG5cbiAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgdmFsdWUpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0Q2xlYXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTGlzdENsZWFyOiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgbGlzdC5sZW5ndGggPSAwXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0VmFsdWVBdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMaXN0VmFsdWVBdDogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIGluZGV4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5pbmRleClcblxuICAgICAgICBpZiBpbmRleCA+PSAwIGFuZCBpbmRleCA8IGxpc3QubGVuZ3RoXG4gICAgICAgICAgICB2YWx1ZSA9IGxpc3RbaW5kZXhdID8gMFxuICAgICAgICAgICAgQGludGVycHJldGVyLnN0b3JlTGlzdFZhbHVlKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGxpc3QsIHZhbHVlLCBAcGFyYW1zLnZhbHVlVHlwZSlcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RSZW1vdmVBdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMaXN0UmVtb3ZlQXQ6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBpbmRleCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuaW5kZXgpXG5cbiAgICAgICAgaWYgaW5kZXggPj0gMCBhbmQgaW5kZXggPCBsaXN0Lmxlbmd0aFxuICAgICAgICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0SW5zZXJ0QXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTGlzdEluc2VydEF0OiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgaW5kZXggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmluZGV4KVxuXG4gICAgICAgIGlmIGluZGV4ID49IDAgYW5kIGluZGV4IDwgbGlzdC5sZW5ndGhcbiAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnZhbHVlVHlwZVxuICAgICAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlciBWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMCwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkpXG4gICAgICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoIFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAwLCBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSkpXG4gICAgICAgICAgICAgICAgd2hlbiAyICMgVGV4dCBWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMCwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5zdHJpbmdWYWx1ZSkpXG4gICAgICAgICAgICAgICAgd2hlbiAzICMgTGlzdCBWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMCwgQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYWx1ZSkpXG5cbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRMaXN0T2JqZWN0VG8oQHBhcmFtcy5saXN0VmFyaWFibGUsIGxpc3QpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0U2V0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZExpc3RTZXQ6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBpbmRleCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuaW5kZXgpXG5cbiAgICAgICAgaWYgaW5kZXggPj0gMFxuICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMudmFsdWVUeXBlXG4gICAgICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyIFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3RbaW5kZXhdID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2ggVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgbGlzdFtpbmRleF0gPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgICAgICB3aGVuIDIgIyBUZXh0IFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3RbaW5kZXhdID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5zdHJpbmdWYWx1ZSlcbiAgICAgICAgICAgICAgICB3aGVuIDMgIyBMaXN0IFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGxpc3RbaW5kZXhdID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYWx1ZSlcblxuICAgICAgICAgICAgQGludGVycHJldGVyLnNldExpc3RPYmplY3RUbyhAcGFyYW1zLmxpc3RWYXJpYWJsZSwgbGlzdClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RDb3B5XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZExpc3RDb3B5OiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgY29weSA9IE9iamVjdC5kZWVwQ29weShsaXN0KVxuXG4gICAgICAgIEBpbnRlcnByZXRlci5zZXRMaXN0T2JqZWN0VG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgY29weSlcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RMZW5ndGhcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTGlzdExlbmd0aDogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG5cbiAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbGlzdC5sZW5ndGgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0Sm9pblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMaXN0Sm9pbjogLT5cbiAgICAgICAgbGlzdCA9IEBpbnRlcnByZXRlci5saXN0T2JqZWN0T2YoQHBhcmFtcy5saXN0VmFyaWFibGUpXG4gICAgICAgIHZhbHVlID0gaWYgQHBhcmFtcy5vcmRlciA9PSAwIHRoZW4gbGlzdC5qb2luKEBwYXJhbXMuc2VwYXJhdG9yfHxcIlwiKSBlbHNlIGxpc3QucmV2ZXJzZSgpLmpvaW4oQHBhcmFtcy5zZXBhcmF0b3J8fFwiXCIpXG5cbiAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgdmFsdWUpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMaXN0RnJvbVRleHRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTGlzdEZyb21UZXh0OiAtPlxuICAgICAgICB0ZXh0ID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50ZXh0VmFyaWFibGUpXG4gICAgICAgIHNlcGFyYXRvciA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuc2VwYXJhdG9yKVxuICAgICAgICBsaXN0ID0gdGV4dC5zcGxpdChzZXBhcmF0b3IpXG5cbiAgICAgICAgQGludGVycHJldGVyLnNldExpc3RPYmplY3RUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBsaXN0KVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTGlzdFNodWZmbGVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTGlzdFNodWZmbGU6IC0+XG4gICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMubGlzdFZhcmlhYmxlKVxuICAgICAgICBpZiBsaXN0Lmxlbmd0aCA8PSAxIHRoZW4gcmV0dXJuXG5cbiAgICAgICAgZm9yIGkgaW4gW2xpc3QubGVuZ3RoLTEuLjFdXG4gICAgICAgICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkrMSkpXG4gICAgICAgICAgICB0ZW1waSA9IGxpc3RbaV1cbiAgICAgICAgICAgIHRlbXBqID0gbGlzdFtqXVxuICAgICAgICAgICAgbGlzdFtpXSA9IHRlbXBqXG4gICAgICAgICAgICBsaXN0W2pdID0gdGVtcGlcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZExpc3RTb3J0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZExpc3RTb3J0OiAtPlxuICAgICAgICBsaXN0ID0gQGludGVycHJldGVyLmxpc3RPYmplY3RPZihAcGFyYW1zLmxpc3RWYXJpYWJsZSlcbiAgICAgICAgaWYgbGlzdC5sZW5ndGggPT0gMCB0aGVuIHJldHVyblxuXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnNvcnRPcmRlclxuICAgICAgICAgICAgd2hlbiAwICMgQXNjZW5kaW5nXG4gICAgICAgICAgICAgICAgbGlzdC5zb3J0IChhLCBiKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBhIDwgYiB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgICAgICAgICBpZiBhID4gYiB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgICB3aGVuIDEgIyBEZXNjZW5kaW5nXG4gICAgICAgICAgICAgICAgbGlzdC5zb3J0IChhLCBiKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBhID4gYiB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgICAgICAgICBpZiBhIDwgYiB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwXG5cblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJlc2V0VmFyaWFibGVzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFJlc2V0VmFyaWFibGVzOiAtPlxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy50YXJnZXRcbiAgICAgICAgICAgIHdoZW4gMCAjIEFsbFxuICAgICAgICAgICAgICAgIHJhbmdlID0gbnVsbFxuICAgICAgICAgICAgd2hlbiAxICMgUmFuZ2VcbiAgICAgICAgICAgICAgICByYW5nZSA9IEBwYXJhbXMucmFuZ2VcblxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5zY29wZVxuICAgICAgICAgICAgd2hlbiAwICMgTG9jYWxcbiAgICAgICAgICAgICAgICBpZiBAcGFyYW1zLnNjZW5lXG4gICAgICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuY2xlYXJMb2NhbFZhcmlhYmxlcyh7IGlkOiBAcGFyYW1zLnNjZW5lLnVpZCB9LCBAcGFyYW1zLnR5cGUsIHJhbmdlKVxuICAgICAgICAgICAgd2hlbiAxICMgQWxsIExvY2Fsc1xuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuY2xlYXJMb2NhbFZhcmlhYmxlcyhudWxsLCBAcGFyYW1zLnR5cGUsIHJhbmdlKVxuICAgICAgICAgICAgd2hlbiAyICMgR2xvYmFsXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5jbGVhckdsb2JhbFZhcmlhYmxlcyhAcGFyYW1zLnR5cGUsIHJhbmdlKVxuICAgICAgICAgICAgd2hlbiAzICMgUGVyc2lzdGVudFxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuY2xlYXJQZXJzaXN0ZW50VmFyaWFibGVzKEBwYXJhbXMudHlwZSwgcmFuZ2UpXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2F2ZUdsb2JhbERhdGEoKVxuXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VWYXJpYWJsZURvbWFpblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDaGFuZ2VWYXJpYWJsZURvbWFpbjogLT5cbiAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5jaGFuZ2VEb21haW4oQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5kb21haW4pKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlRGVjaW1hbFZhcmlhYmxlc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDaGFuZ2VEZWNpbWFsVmFyaWFibGVzOiAtPiBAaW50ZXJwcmV0ZXIuY2hhbmdlRGVjaW1hbFZhcmlhYmxlcyhAcGFyYW1zLCBAcGFyYW1zLnJvdW5kTWV0aG9kKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlTnVtYmVyVmFyaWFibGVzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYW5nZU51bWJlclZhcmlhYmxlczogLT5cbiAgICAgICAgc291cmNlID0gMFxuXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnNvdXJjZVxuICAgICAgICAgICAgd2hlbiAwICMgQ29uc3RhbnQgVmFsdWUgLyBWYXJpYWJsZSBWYWx1ZVxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc291cmNlVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDEgIyBSYW5kb21cbiAgICAgICAgICAgICAgICBzdGFydCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc291cmNlUmFuZG9tLnN0YXJ0KVxuICAgICAgICAgICAgICAgIGVuZCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc291cmNlUmFuZG9tLmVuZClcbiAgICAgICAgICAgICAgICBkaWZmID0gZW5kIC0gc3RhcnRcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBNYXRoLmZsb29yKHN0YXJ0ICsgTWF0aC5yYW5kb20oKSAqIChkaWZmKzEpKVxuICAgICAgICAgICAgd2hlbiAyICMgUG9pbnRlclxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy5zb3VyY2VTY29wZSwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5zb3VyY2VSZWZlcmVuY2UpLTEsIEBwYXJhbXMuc291cmNlUmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgd2hlbiAzICMgR2FtZSBEYXRhXG4gICAgICAgICAgICAgICAgc291cmNlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2ZHYW1lRGF0YShAcGFyYW1zLnNvdXJjZVZhbHVlMSlcbiAgICAgICAgICAgIHdoZW4gNCAjIERhdGFiYXNlIERhdGFcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZkRhdGFiYXNlRGF0YShAcGFyYW1zLnNvdXJjZVZhbHVlMSlcblxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy50YXJnZXRcbiAgICAgICAgICAgIHdoZW4gMCAjIFZhcmlhYmxlXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIFNldFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc291cmNlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBBZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpICsgc291cmNlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBTdWJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpIC0gc291cmNlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBNdWxcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpICogc291cmNlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDQgIyBEaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIE1hdGguZmxvb3IoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSkgLyBzb3VyY2UpKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBNb2RcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpICUgc291cmNlKVxuICAgICAgICAgICAgd2hlbiAxICMgUmFuZ2VcbiAgICAgICAgICAgICAgICBzY29wZSA9IEBwYXJhbXMudGFyZ2V0U2NvcGVcbiAgICAgICAgICAgICAgICBzdGFydCA9IEBwYXJhbXMudGFyZ2V0UmFuZ2Uuc3RhcnQtMVxuICAgICAgICAgICAgICAgIGVuZCA9IEBwYXJhbXMudGFyZ2V0UmFuZ2UuZW5kLTFcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbc3RhcnQuLmVuZF1cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBTZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCBzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBBZGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpKSArIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFN1YlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGkpIC0gc291cmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAzICMgTXVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSwgQGludGVycHJldGVyLm51bWJlclZhbHVlQXRJbmRleChzY29wZSwgaSkgKiBzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDQgIyBEaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KHNjb3BlLCBpLCBNYXRoLmZsb29yKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGkpIC8gc291cmNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gNSAjIE1vZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGksIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoc2NvcGUsIGkpICUgc291cmNlKVxuICAgICAgICAgICAgd2hlbiAyICMgUmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgaW5kZXggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFJlZmVyZW5jZSkgLSAxXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIFNldFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgc291cmNlLCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgQWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbikgKyBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBTdWJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSAtIHNvdXJjZSwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMyAjIE11bFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgQGludGVycHJldGVyLm51bWJlclZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFNjb3BlLCBpbmRleCwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pICogc291cmNlLCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA0ICMgRGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0U2NvcGUsIGluZGV4LCBNYXRoLmZsb29yKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSAvIHNvdXJjZSksIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBNb2RcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRTY29wZSwgaW5kZXgsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKSAlIHNvdXJjZSwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG5cbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZUJvb2xlYW5WYXJpYWJsZXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQ2hhbmdlQm9vbGVhblZhcmlhYmxlczogLT5cbiAgICAgICAgc291cmNlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMudmFsdWUpXG5cbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudGFyZ2V0XG4gICAgICAgICAgICB3aGVuIDAgIyBWYXJpYWJsZVxuICAgICAgICAgICAgICAgIGlmIEBwYXJhbXMudmFsdWUgPT0gMiAjIFRyaWdnZXJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VmFsdWUgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSlcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGlmIHRhcmdldFZhbHVlIHRoZW4gZmFsc2UgZWxzZSB0cnVlKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNvdXJjZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIFJhbmdlXG4gICAgICAgICAgICAgICAgdmFyaWFibGUgPSB7IGluZGV4OiAwLCBzY29wZTogQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlIH1cbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbKEBwYXJhbXMucmFuZ2VTdGFydC0xKS4uKEBwYXJhbXMucmFuZ2VFbmQtMSldXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlLmluZGV4ID0gaVxuICAgICAgICAgICAgICAgICAgICBpZiBAcGFyYW1zLnZhbHVlID09IDIgIyBUcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYWx1ZSA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZih2YXJpYWJsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyh2YXJpYWJsZSwgaWYgdGFyZ2V0VmFsdWUgdGhlbiBmYWxzZSBlbHNlIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyh2YXJpYWJsZSwgc291cmNlKVxuICAgICAgICAgICAgd2hlbiAyICMgUmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgaW5kZXggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFJlZmVyZW5jZSkgLSAxXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlLCBpbmRleCwgc291cmNlLCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcblxuICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlU3RyaW5nVmFyaWFibGVzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYW5nZVN0cmluZ1ZhcmlhYmxlczogLT5cbiAgICAgICAgc291cmNlID0gXCJcIlxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5zb3VyY2VcbiAgICAgICAgICAgIHdoZW4gMCAjIENvbnN0YW50IFRleHRcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBsY3MoQHBhcmFtcy50ZXh0VmFsdWUpXG4gICAgICAgICAgICB3aGVuIDEgIyBWYXJpYWJsZVxuICAgICAgICAgICAgICAgIHNvdXJjZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuc291cmNlVmFyaWFibGUpXG4gICAgICAgICAgICB3aGVuIDIgIyBEYXRhYmFzZSBEYXRhXG4gICAgICAgICAgICAgICAgc291cmNlID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2ZEYXRhYmFzZURhdGEoQHBhcmFtcy5kYXRhYmFzZURhdGEpXG4gICAgICAgICAgICB3aGVuIDIgIyBTY3JpcHRcbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgc291cmNlID0gZXZhbChAcGFyYW1zLnNjcmlwdClcbiAgICAgICAgICAgICAgICBjYXRjaCBleFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBcIkVSUjogXCIgKyBleC5tZXNzYWdlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc291cmNlID0gbGNzKEBwYXJhbXMudGV4dFZhbHVlKVxuXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnRhcmdldFxuICAgICAgICAgICAgd2hlbiAwICMgVmFyaWFibGVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggQHBhcmFtcy5vcGVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgU2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIEFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSkgKyBzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRvIFVwcGVyLUNhc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpLnRvVXBwZXJDYXNlKCkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMyAjIFRvIExvd2VyLUNhc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpLnRvTG93ZXJDYXNlKCkpXG5cbiAgICAgICAgICAgIHdoZW4gMSAjIFJhbmdlXG4gICAgICAgICAgICAgICAgdmFyaWFibGUgPSB7IGluZGV4OiAwLCBzY29wZTogQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlIH1cbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbQHBhcmFtcy5yYW5nZVN0YXJ0LTEuLkBwYXJhbXMucmFuZ2VFbmQtMV1cbiAgICAgICAgICAgICAgICAgICAgdmFyaWFibGUuaW5kZXggPSBpXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLm9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgU2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIEFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKHZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZih2YXJpYWJsZSkgKyBzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBUbyBVcHBlci1DYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8odmFyaWFibGUsIEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKHZhcmlhYmxlKS50b1VwcGVyQ2FzZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAzICMgVG8gTG93ZXItQ2FzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKHZhcmlhYmxlLCBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZih2YXJpYWJsZSkudG9Mb3dlckNhc2UoKSlcblxuICAgICAgICAgICAgd2hlbiAyICMgUmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgaW5kZXggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFJlZmVyZW5jZSkgLSAxXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMub3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIFNldFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUsIGluZGV4LCBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBBZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhbHVlID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlQXRJbmRleChAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUsIGluZGV4LCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlLCBpbmRleCwgdGFyZ2V0VmFsdWUgKyBzb3VyY2UsIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBUbyBVcHBlci1DYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYWx1ZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlLCBpbmRleCwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVBdEluZGV4KEBwYXJhbXMudGFyZ2V0UmFuZ2VTY29wZSwgaW5kZXgsIHRhcmdldFZhbHVlLnRvVXBwZXJDYXNlKCksIEBwYXJhbXMudGFyZ2V0UmVmZXJlbmNlRG9tYWluKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBUbyBMb3dlci1DYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYWx1ZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZUF0SW5kZXgoQHBhcmFtcy50YXJnZXRSYW5nZVNjb3BlLCBpbmRleCwgQHBhcmFtcy50YXJnZXRSZWZlcmVuY2VEb21haW4pXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFJhbmdlU2NvcGUsIGluZGV4LCB0YXJnZXRWYWx1ZS50b0xvd2VyQ2FzZSgpLCBAcGFyYW1zLnRhcmdldFJlZmVyZW5jZURvbWFpbilcbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoZWNrU3dpdGNoXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoZWNrU3dpdGNoOiAtPlxuICAgICAgICByZXN1bHQgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSkgJiYgQHBhcmFtcy52YWx1ZVxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5wb2ludGVyID0gQHBhcmFtcy5sYWJlbEluZGV4XG5cblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE51bWJlckNvbmRpdGlvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmROdW1iZXJDb25kaXRpb246IC0+XG4gICAgICAgIHJlc3VsdCA9IEBpbnRlcnByZXRlci5jb21wYXJlKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUpLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnZhbHVlKSwgQHBhcmFtcy5vcGVyYXRpb24pXG4gICAgICAgIEBpbnRlcnByZXRlci5jb25kaXRpb25zW0BpbnRlcnByZXRlci5pbmRlbnRdID0gcmVzdWx0XG5cbiAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50KytcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENvbmRpdGlvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDb25kaXRpb246IC0+XG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnZhbHVlVHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQGludGVycHJldGVyLmNvbXBhcmUoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy52YXJpYWJsZSksIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpLCBAcGFyYW1zLm9wZXJhdGlvbilcbiAgICAgICAgICAgIHdoZW4gMSAjIFN3aXRjaFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBpbnRlcnByZXRlci5jb21wYXJlKEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnZhcmlhYmxlKSwgQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpLCBAcGFyYW1zLm9wZXJhdGlvbilcbiAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAaW50ZXJwcmV0ZXIuY29tcGFyZShsY3MoQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy52YXJpYWJsZSkpLCBsY3MoQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50ZXh0VmFsdWUpKSwgQHBhcmFtcy5vcGVyYXRpb24pXG5cbiAgICAgICAgQGludGVycHJldGVyLmNvbmRpdGlvbnNbQGludGVycHJldGVyLmluZGVudF0gPSByZXN1bHRcbiAgICAgICAgaWYgcmVzdWx0XG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50KytcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENvbmRpdGlvbkVsc2VcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQ29uZGl0aW9uRWxzZTogLT5cbiAgICAgICAgaWYgbm90IEBpbnRlcnByZXRlci5jb25kaXRpb25zW0BpbnRlcnByZXRlci5pbmRlbnRdXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50KytcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENvbmRpdGlvbkVsc2VJZlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDb25kaXRpb25FbHNlSWY6IC0+XG4gICAgICAgIGlmIG5vdCBAaW50ZXJwcmV0ZXIuY29uZGl0aW9uc1tAaW50ZXJwcmV0ZXIuaW5kZW50XVxuICAgICAgICAgICAgQGludGVycHJldGVyLmNvbW1hbmRDb25kaXRpb24uY2FsbCh0aGlzKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hlY2tOdW1iZXJWYXJpYWJsZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDaGVja051bWJlclZhcmlhYmxlOiAtPlxuICAgICAgICByZXN1bHQgPSBAaW50ZXJwcmV0ZXIuY29tcGFyZShAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnRhcmdldFZhcmlhYmxlKSwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy52YWx1ZSksIEBwYXJhbXMub3BlcmF0aW9uKVxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5wb2ludGVyID0gQHBhcmFtcy5sYWJlbEluZGV4XG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGVja1RleHRWYXJpYWJsZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDaGVja1RleHRWYXJpYWJsZTogLT5cbiAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9IG5vXG4gICAgICAgIHRleHQxID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50YXJnZXRWYXJpYWJsZSlcbiAgICAgICAgdGV4dDIgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnZhbHVlKVxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5vcGVyYXRpb25cbiAgICAgICAgICAgIHdoZW4gMCB0aGVuIHJlc3VsdCA9IHRleHQxID09IHRleHQyXG4gICAgICAgICAgICB3aGVuIDEgdGhlbiByZXN1bHQgPSB0ZXh0MSAhPSB0ZXh0MlxuICAgICAgICAgICAgd2hlbiAyIHRoZW4gcmVzdWx0ID0gdGV4dDEubGVuZ3RoID4gdGV4dDIubGVuZ3RoXG4gICAgICAgICAgICB3aGVuIDMgdGhlbiByZXN1bHQgPSB0ZXh0MS5sZW5ndGggPj0gdGV4dDIubGVuZ3RoXG4gICAgICAgICAgICB3aGVuIDQgdGhlbiByZXN1bHQgPSB0ZXh0MS5sZW5ndGggPCB0ZXh0Mi5sZW5ndGhcbiAgICAgICAgICAgIHdoZW4gNSB0aGVuIHJlc3VsdCA9IHRleHQxLmxlbmd0aCA8PSB0ZXh0Mi5sZW5ndGhcblxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5wb2ludGVyID0gQHBhcmFtcy5sYWJlbEluZGV4XG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMYWJlbFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMYWJlbDogLT4gIyBEb2VzIE5vdGhpbmdcblxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kSnVtcFRvTGFiZWxcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kSnVtcFRvTGFiZWw6IC0+XG4gICAgICAgIGxhYmVsID0gQHBhcmFtcy5sYWJlbEluZGV4ICNAaW50ZXJwcmV0ZXIubGFiZWxzW0BwYXJhbXMubmFtZV1cbiAgICAgICAgaWYgbGFiZWw/XG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIucG9pbnRlciA9IGxhYmVsXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaW5kZW50ID0gQGludGVycHJldGVyLm9iamVjdC5jb21tYW5kc1tsYWJlbF0uaW5kZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnRhcmdldFxuICAgICAgICAgICAgICAgIHdoZW4gXCJhY3RpdmVDb250ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLmp1bXBUb0xhYmVsKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMubmFtZSkpXG4gICAgICAgICAgICAgICAgd2hlbiBcImFjdGl2ZVNjZW5lXCJcbiAgICAgICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmludGVycHJldGVyLmp1bXBUb0xhYmVsKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMubmFtZSkpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuanVtcFRvTGFiZWwoQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5uYW1lKSlcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENsZWFyTWVzc2FnZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDbGVhck1lc3NhZ2U6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIG1lc3NhZ2VPYmplY3QgPSBAaW50ZXJwcmV0ZXIudGFyZ2V0TWVzc2FnZSgpXG4gICAgICAgIGlmIG5vdCBtZXNzYWdlT2JqZWN0PyB0aGVuIHJldHVyblxuXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgZHVyYXRpb24gPSAwXG4gICAgICAgIGZhZGluZyA9IEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5tZXNzYWdlRmFkaW5nXG4gICAgICAgIGlmIG5vdCBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGZhZGluZy5kdXJhdGlvblxuICAgICAgICBtZXNzYWdlT2JqZWN0LmFuaW1hdG9yLmRpc2FwcGVhcihmYWRpbmcuYW5pbWF0aW9uLCBmYWRpbmcuZWFzaW5nLCBkdXJhdGlvbiwgZ3MuQ2FsbEJhY2soXCJvbk1lc3NhZ2VBRFZDbGVhclwiLCBAaW50ZXJwcmV0ZXIpKVxuXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yQ29tcGxldGlvbihtZXNzYWdlT2JqZWN0LCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1lc3NhZ2VCb3hEZWZhdWx0c1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRNZXNzYWdlQm94RGVmYXVsdHM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMubWVzc2FnZUJveFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmFwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmFwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZGlzYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZGlzYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gZGVmYXVsdHMuek9yZGVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFwcGVhckVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFwcGVhckVhc2luZyA9IEBwYXJhbXMuYXBwZWFyRWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFwcGVhckFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvbiA9IEBwYXJhbXMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImRpc2FwcGVhckVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckVhc2luZyA9IEBwYXJhbXMuZGlzYXBwZWFyRWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImRpc2FwcGVhckFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvbiA9IEBwYXJhbXMuZGlzYXBwZWFyQW5pbWF0aW9uXG5cblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNob3dNZXNzYWdlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFNob3dNZXNzYWdlOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5tZXNzYWdlTW9kZSA9IHZuLk1lc3NhZ2VNb2RlLkFEVlxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZFxuXG4gICAgICAgIHNob3dNZXNzYWdlID0gPT5cbiAgICAgICAgICAgIGNoYXJhY3RlciA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1tAcGFyYW1zLmNoYXJhY3RlcklkXVxuXG4gICAgICAgICAgICBzY2VuZS5sYXlvdXQudmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgbWVzc2FnZU9iamVjdCA9IEBpbnRlcnByZXRlci50YXJnZXRNZXNzYWdlKClcblxuICAgICAgICAgICAgaWYgbm90IG1lc3NhZ2VPYmplY3Q/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgICAgIHNjZW5lLmN1cnJlbnRDaGFyYWN0ZXIgPSBjaGFyYWN0ZXJcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuY2hhcmFjdGVyID0gY2hhcmFjdGVyXG5cbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3Qub3BhY2l0eSA9IDI1NVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5ldmVudHMub2ZmQnlPd25lcihcImNhbGxDb21tb25FdmVudFwiLCBAaW50ZXJwcmV0ZXIpXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmV2ZW50cy5vbihcImNhbGxDb21tb25FdmVudFwiLCBncy5DYWxsQmFjayhcIm9uQ2FsbENvbW1vbkV2ZW50XCIsIEBpbnRlcnByZXRlciksIHBhcmFtczogQHBhcmFtcywgQGludGVycHJldGVyKVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5ldmVudHMub25jZShcImZpbmlzaFwiLCBncy5DYWxsQmFjayhcIm9uTWVzc2FnZUFEVkZpbmlzaFwiLCBAaW50ZXJwcmV0ZXIpLCBwYXJhbXM6IEBwYXJhbXMsIEBpbnRlcnByZXRlcilcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZXZlbnRzLm9uY2UoXCJ3YWl0aW5nXCIsIGdzLkNhbGxCYWNrKFwib25NZXNzYWdlQURWV2FpdGluZ1wiLCBAaW50ZXJwcmV0ZXIpLCBwYXJhbXM6IEBwYXJhbXMsIEBpbnRlcnByZXRlcilcbiAgICAgICAgICAgIGlmIG1lc3NhZ2VPYmplY3Quc2V0dGluZ3MudXNlQ2hhcmFjdGVyQ29sb3JcbiAgICAgICAgICAgICAgICBtZXNzYWdlT2JqZWN0Lm1lc3NhZ2Uuc2hvd01lc3NhZ2UoQGludGVycHJldGVyLCBAcGFyYW1zLCBjaGFyYWN0ZXIpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5tZXNzYWdlLnNob3dNZXNzYWdlKEBpbnRlcnByZXRlciwgQHBhcmFtcylcblxuICAgICAgICAgICAgc2V0dGluZ3MgPSBHYW1lTWFuYWdlci5zZXR0aW5nc1xuICAgICAgICAgICAgdm9pY2VTZXR0aW5ncyA9IHNldHRpbmdzLnZvaWNlc0J5Q2hhcmFjdGVyW2NoYXJhY3Rlci5pbmRleF1cblxuICAgICAgICAgICAgaWYgQHBhcmFtcy52b2ljZT8gYW5kIEdhbWVNYW5hZ2VyLnNldHRpbmdzLnZvaWNlRW5hYmxlZCBhbmQgKCF2b2ljZVNldHRpbmdzIG9yIHZvaWNlU2V0dGluZ3MgPiAwKVxuICAgICAgICAgICAgICAgIGlmIChHYW1lTWFuYWdlci5zZXR0aW5ncy5za2lwVm9pY2VPbkFjdGlvbiBvciAhQXVkaW9NYW5hZ2VyLnZvaWNlPy5wbGF5aW5nKSBhbmQgIUdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3Qudm9pY2UgPSBAcGFyYW1zLnZvaWNlXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuYmVoYXZpb3Iudm9pY2UgPSBBdWRpb01hbmFnZXIucGxheVZvaWNlKEBwYXJhbXMudm9pY2UpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnZvaWNlID0gbnVsbFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuYmVoYXZpb3Iudm9pY2UgPSBudWxsXG5cbiAgICAgICAgaWYgQHBhcmFtcy5leHByZXNzaW9uSWQ/IGFuZCBjaGFyYWN0ZXI/XG4gICAgICAgICAgICBleHByZXNzaW9uID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJFeHByZXNzaW9uc1tAcGFyYW1zLmV4cHJlc3Npb25JZCB8fCAwXVxuICAgICAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5jaGFyYWN0ZXJcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgIWdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkKEBwYXJhbXMuZmllbGRGbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuZXhwcmVzc2lvbkR1cmF0aW9uXG4gICAgICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuY2hhbmdlRWFzaW5nKVxuICAgICAgICAgICAgYW5pbWF0aW9uID0gZGVmYXVsdHMuY2hhbmdlQW5pbWF0aW9uXG5cbiAgICAgICAgICAgIGNoYXJhY3Rlci5iZWhhdmlvci5jaGFuZ2VFeHByZXNzaW9uKGV4cHJlc3Npb24sIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiwgPT5cbiAgICAgICAgICAgICAgICBzaG93TWVzc2FnZSgpXG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNob3dNZXNzYWdlKClcblxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gKEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gPyB5ZXMpIGFuZCAhKEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwIGFuZCBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFRpbWUgPT0gMClcbiAgICAgICAgQGludGVycHJldGVyLndhaXRpbmdGb3IubWVzc2FnZUFEViA9IEBwYXJhbXNcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNldE1lc3NhZ2VBcmVhXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFNldE1lc3NhZ2VBcmVhOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcblxuICAgICAgICBpZiBzY2VuZS5tZXNzYWdlQXJlYXNbbnVtYmVyXVxuICAgICAgICAgICAgbWVzc2FnZUxheW91dCA9IHNjZW5lLm1lc3NhZ2VBcmVhc1tudW1iZXJdLmxheW91dFxuICAgICAgICAgICAgbWVzc2FnZUxheW91dC5kc3RSZWN0LnggPSBAcGFyYW1zLmJveC54XG4gICAgICAgICAgICBtZXNzYWdlTGF5b3V0LmRzdFJlY3QueSA9IEBwYXJhbXMuYm94LnlcbiAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQuZHN0UmVjdC53aWR0aCA9IEBwYXJhbXMuYm94LnNpemUud2lkdGhcbiAgICAgICAgICAgIG1lc3NhZ2VMYXlvdXQuZHN0UmVjdC5oZWlnaHQgPSBAcGFyYW1zLmJveC5zaXplLmhlaWdodFxuICAgICAgICAgICAgbWVzc2FnZUxheW91dC5uZWVkc1VwZGF0ZSA9IHllc1xuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTWVzc2FnZUZhZGluZ1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRNZXNzYWdlRmFkaW5nOiAtPlxuICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MubWVzc2FnZUZhZGluZyA9IGR1cmF0aW9uOiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pLCBhbmltYXRpb246IEBwYXJhbXMuYW5pbWF0aW9uLCBlYXNpbmc6IGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZylcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1lc3NhZ2VTZXR0aW5nc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRNZXNzYWdlU2V0dGluZ3M6IC0+XG4gICAgICAgIG1lc3NhZ2VPYmplY3QgPSBAaW50ZXJwcmV0ZXIudGFyZ2V0TWVzc2FnZSgpXG4gICAgICAgIGlmICFtZXNzYWdlT2JqZWN0IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBtZXNzYWdlU2V0dGluZ3MgPSBAaW50ZXJwcmV0ZXIubWVzc2FnZVNldHRpbmdzKClcblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYXV0b0VyYXNlKVxuICAgICAgICAgICAgbWVzc2FnZVNldHRpbmdzLmF1dG9FcmFzZSA9IEBwYXJhbXMuYXV0b0VyYXNlXG5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLndhaXRBdEVuZClcbiAgICAgICAgICAgIG1lc3NhZ2VTZXR0aW5ncy53YWl0QXRFbmQgPSBAcGFyYW1zLndhaXRBdEVuZFxuXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5iYWNrbG9nKVxuICAgICAgICAgICAgbWVzc2FnZVNldHRpbmdzLmJhY2tsb2cgPSBAcGFyYW1zLmJhY2tsb2dcblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubGluZUFsaWdubWVudClcbiAgICAgICAgICAgIG1lc3NhZ2VTZXR0aW5ncy5saW5lQWxpZ25tZW50ID0gQHBhcmFtcy5saW5lQWxpZ25tZW50XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmxpbmVIZWlnaHQpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3MubGluZUhlaWdodCA9IEBwYXJhbXMubGluZUhlaWdodFxuXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5saW5lU3BhY2luZylcbiAgICAgICAgICAgIG1lc3NhZ2VTZXR0aW5ncy5saW5lU3BhY2luZyA9IEBwYXJhbXMubGluZVNwYWNpbmdcblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubGluZVBhZGRpbmcpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3MubGluZVBhZGRpbmcgPSBAcGFyYW1zLmxpbmVQYWRkaW5nXG5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnBhcmFncmFwaFNwYWNpbmcpXG4gICAgICAgICAgICBtZXNzYWdlU2V0dGluZ3MucGFyYWdyYXBoU3BhY2luZyA9IEBwYXJhbXMucGFyYWdyYXBoU3BhY2luZ1xuXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy51c2VDaGFyYWN0ZXJDb2xvcilcbiAgICAgICAgICAgIG1lc3NhZ2VTZXR0aW5ncy51c2VDaGFyYWN0ZXJDb2xvciA9IEBwYXJhbXMudXNlQ2hhcmFjdGVyQ29sb3JcblxuICAgICAgICBtZXNzYWdlT2JqZWN0LnRleHRSZW5kZXJlci5taW5MaW5lSGVpZ2h0ID0gbWVzc2FnZVNldHRpbmdzLmxpbmVIZWlnaHQgPyAwXG4gICAgICAgIG1lc3NhZ2VPYmplY3QudGV4dFJlbmRlcmVyLmxpbmVTcGFjaW5nID0gbWVzc2FnZVNldHRpbmdzLmxpbmVTcGFjaW5nID8gbWVzc2FnZU9iamVjdC50ZXh0UmVuZGVyZXIubGluZVNwYWNpbmdcbiAgICAgICAgbWVzc2FnZU9iamVjdC50ZXh0UmVuZGVyZXIucGFkZGluZyA9IG1lc3NhZ2VTZXR0aW5ncy5saW5lUGFkZGluZyA/IG1lc3NhZ2VPYmplY3QudGV4dFJlbmRlcmVyLnBhZGRpbmdcblxuICAgICAgICBmb250TmFtZSA9IGlmICFpc0xvY2tlZChmbGFncy5mb250KSB0aGVuIEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuZm9udCkgZWxzZSBtZXNzYWdlT2JqZWN0LmZvbnQubmFtZVxuICAgICAgICBmb250U2l6ZSA9IGlmICFpc0xvY2tlZChmbGFncy5zaXplKSB0aGVuIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc2l6ZSkgZWxzZSBtZXNzYWdlT2JqZWN0LmZvbnQuc2l6ZVxuICAgICAgICBmb250ID0gbWVzc2FnZU9iamVjdC5mb250XG5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmZvbnQpIG9yICFpc0xvY2tlZChmbGFncy5zaXplKVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5mb250ID0gbmV3IEZvbnQoZm9udE5hbWUsIGZvbnRTaXplKVxuXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5ib2xkKVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LmJvbGQgPSBAcGFyYW1zLmJvbGRcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLml0YWxpYylcbiAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5pdGFsaWMgPSBAcGFyYW1zLml0YWxpY1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muc21hbGxDYXBzKVxuICAgICAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LnNtYWxsQ2FwcyA9IEBwYXJhbXMuc21hbGxDYXBzXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy51bmRlcmxpbmUpXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQudW5kZXJsaW5lID0gQHBhcmFtcy51bmRlcmxpbmVcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnN0cmlrZVRocm91Z2gpXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuc3RyaWtlVGhyb3VnaCA9IEBwYXJhbXMuc3RyaWtlVGhyb3VnaFxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuY29sb3IpXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuY29sb3IgPSBuZXcgQ29sb3IoQHBhcmFtcy5jb2xvcilcblxuICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuY29sb3IgPSBpZiBmbGFncy5jb2xvcj8gYW5kICFpc0xvY2tlZChmbGFncy5jb2xvcikgdGhlbiBuZXcgQ29sb3IoQHBhcmFtcy5jb2xvcikgZWxzZSBmb250LmNvbG9yXG4gICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5ib3JkZXIgPSBpZiBmbGFncy5vdXRsaW5lPyBhbmQgIWlzTG9ja2VkKGZsYWdzLm91dGxpbmUpIHRoZW4gQHBhcmFtcy5vdXRsaW5lIGVsc2UgZm9udC5ib3JkZXJcbiAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LmJvcmRlckNvbG9yID0gaWYgZmxhZ3Mub3V0bGluZUNvbG9yPyBhbmQgIWlzTG9ja2VkKGZsYWdzLm91dGxpbmVDb2xvcikgdGhlbiBuZXcgQ29sb3IoQHBhcmFtcy5vdXRsaW5lQ29sb3IpIGVsc2UgbmV3IENvbG9yKGZvbnQuYm9yZGVyQ29sb3IpXG4gICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5ib3JkZXJTaXplID0gaWYgZmxhZ3Mub3V0bGluZVNpemU/IGFuZCAhaXNMb2NrZWQoZmxhZ3Mub3V0bGluZVNpemUpIHRoZW4gKEBwYXJhbXMub3V0bGluZVNpemUgPyA0KSBlbHNlIGZvbnQuYm9yZGVyU2l6ZVxuICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuc2hhZG93ID0gaWYgZmxhZ3Muc2hhZG93PyBhbmQgIWlzTG9ja2VkKGZsYWdzLnNoYWRvdyl0aGVuIEBwYXJhbXMuc2hhZG93IGVsc2UgZm9udC5zaGFkb3dcbiAgICAgICAgbWVzc2FnZU9iamVjdC5mb250LnNoYWRvd0NvbG9yID0gaWYgZmxhZ3Muc2hhZG93Q29sb3I/IGFuZCAhaXNMb2NrZWQoZmxhZ3Muc2hhZG93Q29sb3IpIHRoZW4gbmV3IENvbG9yKEBwYXJhbXMuc2hhZG93Q29sb3IpIGVsc2UgbmV3IENvbG9yKGZvbnQuc2hhZG93Q29sb3IpXG4gICAgICAgIG1lc3NhZ2VPYmplY3QuZm9udC5zaGFkb3dPZmZzZXRYID0gaWYgZmxhZ3Muc2hhZG93T2Zmc2V0WD8gYW5kICFpc0xvY2tlZChmbGFncy5zaGFkb3dPZmZzZXRYKSB0aGVuIChAcGFyYW1zLnNoYWRvd09mZnNldFggPyAxKSBlbHNlIGZvbnQuc2hhZG93T2Zmc2V0WFxuICAgICAgICBtZXNzYWdlT2JqZWN0LmZvbnQuc2hhZG93T2Zmc2V0WSA9IGlmIGZsYWdzLnNoYWRvd09mZnNldFk/IGFuZCAhaXNMb2NrZWQoZmxhZ3Muc2hhZG93T2Zmc2V0WSkgdGhlbiAoQHBhcmFtcy5zaGFkb3dPZmZzZXRZID8gMSkgZWxzZSBmb250LnNoYWRvd09mZnNldFlcblxuICAgICAgICBpZiBpc0xvY2tlZChmbGFncy5ib2xkKSB0aGVuIG1lc3NhZ2VPYmplY3QuZm9udC5ib2xkID0gZm9udC5ib2xkXG4gICAgICAgIGlmIGlzTG9ja2VkKGZsYWdzLml0YWxpYykgdGhlbiBtZXNzYWdlT2JqZWN0LmZvbnQuaXRhbGljID0gZm9udC5pdGFsaWNcbiAgICAgICAgaWYgaXNMb2NrZWQoZmxhZ3Muc21hbGxDYXBzKSB0aGVuIG1lc3NhZ2VPYmplY3QuZm9udC5zbWFsbENhcHMgPSBmb250LnNtYWxsQ2Fwc1xuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ3JlYXRlTWVzc2FnZUFyZWFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQ3JlYXRlTWVzc2FnZUFyZWE6IC0+XG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VNZXNzYWdlQXJlYURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgaWYgIXNjZW5lLm1lc3NhZ2VBcmVhc1tudW1iZXJdXG4gICAgICAgICAgICBtZXNzYWdlQXJlYSA9IG5ldyBncy5PYmplY3RfTWVzc2FnZUFyZWEoKVxuICAgICAgICAgICAgbWVzc2FnZUFyZWEubGF5b3V0ID0gdWkuVUlNYW5hZ2VyLmNyZWF0ZUNvbnRyb2xGcm9tRGVzY3JpcHRvcih0eXBlOiBcInVpLkN1c3RvbUdhbWVNZXNzYWdlXCIsIGlkOiBcImN1c3RvbUdhbWVNZXNzYWdlX1wiK251bWJlciwgcGFyYW1zOiB7IGlkOiBcImN1c3RvbUdhbWVNZXNzYWdlX1wiK251bWJlciB9LCBtZXNzYWdlQXJlYSlcbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhLm1lc3NhZ2UgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZChcImN1c3RvbUdhbWVNZXNzYWdlX1wiK251bWJlcitcIl9tZXNzYWdlXCIpXG4gICAgICAgICAgICBtZXNzYWdlQXJlYS5tZXNzYWdlLmRvbWFpbiA9IEBwYXJhbXMubnVtYmVyRG9tYWluXG4gICAgICAgICAgICBtZXNzYWdlQXJlYS5hZGRPYmplY3QobWVzc2FnZUFyZWEubGF5b3V0KVxuICAgICAgICAgICAgbWVzc2FnZUFyZWEubGF5b3V0LmRzdFJlY3QueCA9IEBwYXJhbXMuYm94LnhcbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhLmxheW91dC5kc3RSZWN0LnkgPSBAcGFyYW1zLmJveC55XG4gICAgICAgICAgICBtZXNzYWdlQXJlYS5sYXlvdXQuZHN0UmVjdC53aWR0aCA9IEBwYXJhbXMuYm94LnNpemUud2lkdGhcbiAgICAgICAgICAgIG1lc3NhZ2VBcmVhLmxheW91dC5kc3RSZWN0LmhlaWdodCA9IEBwYXJhbXMuYm94LnNpemUuaGVpZ2h0XG4gICAgICAgICAgICBtZXNzYWdlQXJlYS5sYXlvdXQubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgICAgIHNjZW5lLm1lc3NhZ2VBcmVhc1tudW1iZXJdID0gbWVzc2FnZUFyZWFcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEVyYXNlTWVzc2FnZUFyZWFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kRXJhc2VNZXNzYWdlQXJlYTogLT5cbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZU1lc3NhZ2VBcmVhRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBhcmVhID0gc2NlbmUubWVzc2FnZUFyZWFzW251bWJlcl1cbiAgICAgICAgYXJlYT8ubGF5b3V0LmRpc3Bvc2UoKVxuICAgICAgICBzY2VuZS5tZXNzYWdlQXJlYXNbbnVtYmVyXSA9IG51bGxcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNldFRhcmdldE1lc3NhZ2VcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2V0VGFyZ2V0TWVzc2FnZTogLT5cbiAgICAgICAgbWVzc2FnZSA9IEBpbnRlcnByZXRlci50YXJnZXRNZXNzYWdlKClcbiAgICAgICAgbWVzc2FnZT8udGV4dFJlbmRlcmVyLmlzV2FpdGluZyA9IGZhbHNlXG4gICAgICAgIG1lc3NhZ2U/LmJlaGF2aW9yLmlzV2FpdGluZyA9IGZhbHNlXG5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlTWVzc2FnZUFyZWFEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIHRhcmdldCA9IHsgdHlwZTogQHBhcmFtcy50eXBlLCBpZDogbnVsbCB9XG5cbiAgICAgICAgc3dpdGNoIEBwYXJhbXMudHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgTGF5b3V0LWJhc2VkXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmlkID0gQHBhcmFtcy5pZFxuICAgICAgICAgICAgd2hlbiAxICMgQ3VzdG9tXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmlkID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG5cbiAgICAgICAgQGludGVycHJldGVyLnNldHRpbmdzLm1lc3NhZ2UudGFyZ2V0ID0gdGFyZ2V0XG5cbiAgICAgICAgaWYgQHBhcmFtcy5jbGVhclxuICAgICAgICAgICAgQGludGVycHJldGVyLnRhcmdldE1lc3NhZ2UoKT8uYmVoYXZpb3IuY2xlYXIoKVxuICAgICAgICBAaW50ZXJwcmV0ZXIudGFyZ2V0TWVzc2FnZSgpPy52aXNpYmxlID0geWVzXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCYWNrbG9nVmlzaWJpbGl0eVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRCYWNrbG9nVmlzaWJpbGl0eTogLT5cbiAgICAgICAgaWYgQHBhcmFtcy52aXNpYmxlXG4gICAgICAgICAgICBjb250cm9sID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJiYWNrbG9nQm94XCIpXG4gICAgICAgICAgICBpZiBub3QgY29udHJvbD8gdGhlbiBjb250cm9sID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJiYWNrbG9nXCIpXG5cbiAgICAgICAgICAgIGlmIGNvbnRyb2w/XG4gICAgICAgICAgICAgICAgY29udHJvbC5kaXNwb3NlKClcblxuICAgICAgICAgICAgaWYgQHBhcmFtcy5iYWNrZ3JvdW5kVmlzaWJsZVxuICAgICAgICAgICAgICAgIGNvbnRyb2wgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3IuY3JlYXRlQ29udHJvbCh0aGlzLCB7IGRlc2NyaXB0b3I6IFwidWkuTWVzc2FnZUJhY2tsb2dCb3hcIiB9KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbnRyb2wgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3IuY3JlYXRlQ29udHJvbCh0aGlzLCB7IGRlc2NyaXB0b3I6IFwidWkuTWVzc2FnZUJhY2tsb2dcIiB9KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb250cm9sID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJiYWNrbG9nQm94XCIpXG4gICAgICAgICAgICBpZiBub3QgY29udHJvbD8gdGhlbiBjb250cm9sID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJiYWNrbG9nXCIpXG4gICAgICAgICAgICBpZiBub3QgY29udHJvbD8gdGhlbiBjb250cm9sID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJiYWNrbG9nU2Nyb2xsVmlld1wiKVxuXG4gICAgICAgICAgICBjb250cm9sPy5kaXNwb3NlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1lc3NhZ2VWaXNpYmlsaXR5XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZE1lc3NhZ2VWaXNpYmlsaXR5OiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLm1lc3NhZ2VCb3hcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuXG4gICAgICAgIG1lc3NhZ2UgPSBAaW50ZXJwcmV0ZXIudGFyZ2V0TWVzc2FnZSgpXG4gICAgICAgIGlmIG5vdCBtZXNzYWdlPyBvciBAcGFyYW1zLnZpc2libGUgPT0gbWVzc2FnZS52aXNpYmxlIHRoZW4gcmV0dXJuXG5cbiAgICAgICAgaWYgQHBhcmFtcy52aXNpYmxlXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuYXBwZWFyRHVyYXRpb25cbiAgICAgICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZykgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuYXBwZWFyRWFzaW5nKVxuICAgICAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgICAgIG1lc3NhZ2UuYW5pbWF0b3IuYXBwZWFyKG1lc3NhZ2UuZHN0UmVjdC54LCBtZXNzYWdlLmRzdFJlY3QueSwgQHBhcmFtcy5hbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvblxuICAgICAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcpXG4gICAgICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICAgICAgbWVzc2FnZS5hbmltYXRvci5kaXNhcHBlYXIoYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAtPiBtZXNzYWdlLnZpc2libGUgPSBubylcbiAgICAgICAgbWVzc2FnZS51cGRhdGUoKVxuXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTWVzc2FnZUJveFZpc2liaWxpdHlcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTWVzc2FnZUJveFZpc2liaWxpdHk6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMubWVzc2FnZUJveFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIG1lc3NhZ2VCb3ggPSBAaW50ZXJwcmV0ZXIubWVzc2FnZUJveE9iamVjdChAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmlkKSlcbiAgICAgICAgdmlzaWJsZSA9IEBwYXJhbXMudmlzaWJsZSA9PSAxXG4gICAgICAgIGlmIG5vdCBtZXNzYWdlQm94PyBvciB2aXNpYmxlID09IG1lc3NhZ2VCb3gudmlzaWJsZSB0aGVuIHJldHVyblxuXG4gICAgICAgIGlmIEBwYXJhbXMudmlzaWJsZVxuICAgICAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uXG4gICAgICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmFwcGVhckVhc2luZylcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgICAgICBtZXNzYWdlQm94LmFuaW1hdG9yLmFwcGVhcihtZXNzYWdlQm94LmRzdFJlY3QueCwgbWVzc2FnZUJveC5kc3RSZWN0LnksIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckR1cmF0aW9uXG4gICAgICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmRpc2FwcGVhckVhc2luZylcbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgICAgICBtZXNzYWdlQm94LmFuaW1hdG9yLmRpc2FwcGVhcihhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sIC0+IG1lc3NhZ2VCb3gudmlzaWJsZSA9IG5vKVxuICAgICAgICBtZXNzYWdlQm94LnVwZGF0ZSgpXG5cbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFVJQWNjZXNzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFVJQWNjZXNzOiAtPlxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmdlbmVyYWxNZW51KVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLm1lbnVBY2Nlc3MgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5nZW5lcmFsTWVudSlcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnNhdmVNZW51KVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNhdmVNZW51QWNjZXNzID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc2F2ZU1lbnUpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5sb2FkTWVudSlcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5sb2FkTWVudUFjY2VzcyA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLmxvYWRNZW51KVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYmFja2xvZylcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5iYWNrbG9nQWNjZXNzID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuYmFja2xvZylcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFVubG9ja0NHXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFVubG9ja0NHOiAtPlxuICAgICAgICBjZyA9IFJlY29yZE1hbmFnZXIuY2dHYWxsZXJ5W0BpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2dJZCldXG5cbiAgICAgICAgaWYgY2c/XG4gICAgICAgICAgICBHYW1lTWFuYWdlci5nbG9iYWxEYXRhLmNnR2FsbGVyeVtjZy5pbmRleF0gPSB7IHVubG9ja2VkOiB5ZXMgfVxuICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2F2ZUdsb2JhbERhdGEoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2V0SW5wdXRTZXNzaW9uXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFNldElucHV0U2Vzc2lvbjogLT4gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Py5zZXRNb2RhbFNlc3Npb24oQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5pbnB1dFNlc3Npb24pKVxuICAgIFxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEwyRE1vdmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTDJETW92ZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWRcbiAgICAgICAgaWYgIShjaGFyYWN0ZXIgaW5zdGFuY2VvZiB2bi5PYmplY3RfTGl2ZTJEQ2hhcmFjdGVyKSB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0KGNoYXJhY3RlciwgQHBhcmFtcy5wb3NpdGlvbiwgQHBhcmFtcylcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRNb3Rpb25Hcm91cFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMMkRNb3Rpb25Hcm91cDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWRcbiAgICAgICAgaWYgIShjaGFyYWN0ZXIgaW5zdGFuY2VvZiB2bi5PYmplY3RfTGl2ZTJEQ2hhcmFjdGVyKSB0aGVuIHJldHVyblxuXG4gICAgICAgIGNoYXJhY3Rlci5tb3Rpb25Hcm91cCA9IHsgbmFtZTogQHBhcmFtcy5kYXRhLm1vdGlvbkdyb3VwLCBsb29wOiBAcGFyYW1zLmxvb3AsIHBsYXlUeXBlOiBAcGFyYW1zLnBsYXlUeXBlIH1cbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IEBwYXJhbXMubG9vcFxuICAgICAgICAgICAgbW90aW9ucyA9IGNoYXJhY3Rlci5tb2RlbC5tb3Rpb25zQnlHcm91cFtjaGFyYWN0ZXIubW90aW9uR3JvdXAubmFtZV1cbiAgICAgICAgICAgIGlmIG1vdGlvbnM/XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IG1vdGlvbnMuc3VtIChtKSAtPiBtLmdldER1cmF0aW9uTVNlYygpIC8gMTYuNlxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEwyRE1vdGlvblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMMkRNb3Rpb246IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMubGl2ZTJkXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IEBwYXJhbXMuY2hhcmFjdGVySWRcbiAgICAgICAgaWYgIShjaGFyYWN0ZXIgaW5zdGFuY2VvZiB2bi5PYmplY3RfTGl2ZTJEQ2hhcmFjdGVyKSB0aGVuIHJldHVyblxuICAgICAgICBmYWRlSW5UaW1lID0gaWYgIWlzTG9ja2VkKGZsYWdzLmZhZGVJblRpbWUpIHRoZW4gQHBhcmFtcy5mYWRlSW5UaW1lIGVsc2UgbnVsbCAjZGVmYXVsdHMubW90aW9uRmFkZUluVGltZVxuICAgICAgICBcbiAgICAgICAgY2hhcmFjdGVyLm1vdGlvbiA9IHsgbmFtZTogQHBhcmFtcy5kYXRhLm1vdGlvbiwgZmFkZUluVGltZTogZmFkZUluVGltZSwgbG9vcDogQHBhcmFtcy5sb29wIH1cbiAgICAgICAgY2hhcmFjdGVyLm1vdGlvbkdyb3VwID0gbnVsbFxuXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCBAcGFyYW1zLmxvb3BcbiAgICAgICAgICAgIG1vdGlvbiA9IGNoYXJhY3Rlci5tb2RlbC5tb3Rpb25zW2NoYXJhY3Rlci5tb3Rpb24ubmFtZV1cbiAgICAgICAgICAgIGlmIG1vdGlvbj9cbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gbW90aW9uLmdldER1cmF0aW9uTVNlYygpIC8gMTYuNlxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEwyREV4cHJlc3Npb25cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTDJERXhwcmVzc2lvbjogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5saXZlMmRcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZFxuICAgICAgICBpZiAhKGNoYXJhY3RlciBpbnN0YW5jZW9mIHZuLk9iamVjdF9MaXZlMkRDaGFyYWN0ZXIpIHRoZW4gcmV0dXJuXG4gICAgICAgIGZhZGVJblRpbWUgPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZmFkZUluVGltZSkgdGhlbiBAcGFyYW1zLmZhZGVJblRpbWUgZWxzZSBkZWZhdWx0cy5leHByZXNzaW9uRmFkZUluVGltZVxuXG4gICAgICAgIGNoYXJhY3Rlci5leHByZXNzaW9uID0geyBuYW1lOiBAcGFyYW1zLmRhdGEuZXhwcmVzc2lvbiwgZmFkZUluVGltZTogZmFkZUluVGltZSB9XG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTDJERXhpdFNjZW5lXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEwyREV4aXRTY2VuZTogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5saXZlMmRcbiAgICAgICAgQGludGVycHJldGVyLmNvbW1hbmRDaGFyYWN0ZXJFeGl0U2NlbmUuY2FsbCh0aGlzLCBkZWZhdWx0cylcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRTZXR0aW5nc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMMkRTZXR0aW5nczogLT5cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBAcGFyYW1zLmNoYXJhY3RlcklkXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/LnZpc3VhbC5sMmRPYmplY3QgdGhlbiByZXR1cm5cblxuXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5saXBTeW5jU2Vuc2l0aXZpdHkpXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5saXBTeW5jU2Vuc2l0aXZpdHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxpcFN5bmNTZW5zaXRpdml0eSlcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmlkbGVJbnRlbnNpdHkpXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5pZGxlSW50ZW5zaXR5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5pZGxlSW50ZW5zaXR5KVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYnJlYXRoSW50ZW5zaXR5KVxuICAgICAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3QuYnJlYXRoSW50ZW5zaXR5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5icmVhdGhJbnRlbnNpdHkpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZXllQmxpbmsuZW5hYmxlZFwiXSlcbiAgICAgICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LnNldEV5ZUJsaW5rRW5hYmxlZChAcGFyYW1zLmV5ZUJsaW5rLmVuYWJsZWQpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImV5ZUJsaW5rLmludGVydmFsXCJdKVxuICAgICAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3Quc2V0RXllQmxpbmtJbnRlcnZhbChAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmV5ZUJsaW5rLmludGVydmFsKSlcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZXllQmxpbmsuY2xvc2VkTW90aW9uVGltZVwiXSlcbiAgICAgICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LnNldEV5ZUJsaW5rQ2xvc2VkTW90aW9uVGltZShAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmV5ZUJsaW5rLmNsb3NlZE1vdGlvblRpbWUpKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJleWVCbGluay5jbG9zaW5nTW90aW9uVGltZVwiXSlcbiAgICAgICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LnNldEV5ZUJsaW5rQ2xvc2luZ01vdGlvblRpbWUoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5leWVCbGluay5jbG9zaW5nTW90aW9uVGltZSkpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImV5ZUJsaW5rLm9wZW5pbmdNb3Rpb25UaW1lXCJdKVxuICAgICAgICAgICAgY2hhcmFjdGVyLnZpc3VhbC5sMmRPYmplY3Quc2V0RXllQmxpbmtPcGVuaW5nTW90aW9uVGltZShAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmV5ZUJsaW5rLm9wZW5pbmdNb3Rpb25UaW1lKSlcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRQYXJhbWV0ZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTDJEUGFyYW1ldGVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gQHBhcmFtcy5jaGFyYWN0ZXJJZFxuICAgICAgICBpZiAhKGNoYXJhY3RlciBpbnN0YW5jZW9mIHZuLk9iamVjdF9MaXZlMkRDaGFyYWN0ZXIpIHx8ICFjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgY2hhcmFjdGVyLmFuaW1hdG9yLmwyZFBhcmFtZXRlclRvKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMucGFyYW0ubmFtZSksIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucGFyYW0udmFsdWUpLCBkdXJhdGlvbiwgZWFzaW5nKVxuXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTDJERGVmYXVsdHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTDJERGVmYXVsdHM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMubGl2ZTJkXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5kaXNhcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kaXNhcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBkZWZhdWx0cy56T3JkZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm1vdGlvbkZhZGVJblRpbWUpIHRoZW4gZGVmYXVsdHMubW90aW9uRmFkZUluVGltZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubW90aW9uRmFkZUluVGltZSlcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5hcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5kaXNhcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5kaXNhcHBlYXJBbmltYXRpb25cblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMMkRKb2luU2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTDJESm9pblNjZW5lOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmxpdmUyZFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHJlY29yZCA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1tAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNoYXJhY3RlcklkKV1cbiAgICAgICAgcmV0dXJuIGlmICFyZWNvcmQgb3Igc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgLT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IHJlY29yZC5pbmRleFxuXG4gICAgICAgIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDFcbiAgICAgICAgICAgIHggPSBAcGFyYW1zLnBvc2l0aW9uLnhcbiAgICAgICAgICAgIHkgPSBAcGFyYW1zLnBvc2l0aW9uLnlcbiAgICAgICAgZWxzZSBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAyXG4gICAgICAgICAgICB4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi54KVxuICAgICAgICAgICAgeSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueSlcblxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICB6SW5kZXggPSBpZiAhaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSB0aGVuIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuek9yZGVyKSBlbHNlIGRlZmF1bHRzLnpPcmRlclxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvblxuICAgICAgICBtb3Rpb25CbHVyID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wibW90aW9uQmx1ci5lbmFibGVkXCJdKSB0aGVuIEBwYXJhbXMubW90aW9uQmx1ciBlbHNlIGRlZmF1bHRzLm1vdGlvbkJsdXJcbiAgICAgICAgb3JpZ2luID0gaWYgIWlzTG9ja2VkKGZsYWdzLm9yaWdpbikgdGhlbiBAcGFyYW1zLm9yaWdpbiBlbHNlIGRlZmF1bHRzLm9yaWdpblxuICAgICAgICBpbnN0YW50ID0gZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpXG4gICAgICAgIG5vQW5pbSA9IGR1cmF0aW9uID09IDAgb3IgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcblxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgaW5zdGFudFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICAgICByZXR1cm4gdW5sZXNzIEBwYXJhbXMubW9kZWw/Lm5hbWVcbiAgICAgICAgY2hhcmFjdGVyID0gbmV3IHZuLk9iamVjdF9MaXZlMkRDaGFyYWN0ZXIocmVjb3JkKVxuICAgICAgICBjaGFyYWN0ZXIubW9kZWxOYW1lID0gQHBhcmFtcy5tb2RlbD8ubmFtZSB8fCBcIlwiXG4gICAgICAgIGNoYXJhY3Rlci5tb2RlbEZvbGRlciA9IEBwYXJhbXMubW9kZWw/LmZvbGRlclBhdGggfHwgXCJMaXZlMkRcIlxuICAgICAgICBjaGFyYWN0ZXIubW9kZWwgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0TGl2ZTJETW9kZWwoXCIje2NoYXJhY3Rlci5tb2RlbEZvbGRlciA/IFwiTGl2ZTJEXCJ9LyN7Y2hhcmFjdGVyLm1vZGVsTmFtZX1cIilcbiAgICAgICAgY2hhcmFjdGVyLm1vdGlvbiA9IHsgbmFtZTogXCJcIiwgZmFkZUluVGltZTogMCwgbG9vcDogdHJ1ZSB9IGlmIGNoYXJhY3Rlci5tb2RlbC5tb3Rpb25zXG4gICAgICAgICNjaGFyYWN0ZXIuZXhwcmVzc2lvbiA9IHsgbmFtZTogT2JqZWN0LmtleXMoY2hhcmFjdGVyLm1vZGVsLmV4cHJlc3Npb25zKVswXSwgZmFkZUluVGltZTogMCB9IGlmIGNoYXJhY3Rlci5tb2RlbC5leHByZXNzaW9uc1xuICAgICAgICBjaGFyYWN0ZXIuZHN0UmVjdC54ID0geFxuICAgICAgICBjaGFyYWN0ZXIuZHN0UmVjdC55ID0geVxuICAgICAgICBjaGFyYWN0ZXIuYW5jaG9yLnggPSBpZiAhb3JpZ2luIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgICBjaGFyYWN0ZXIuYW5jaG9yLnkgPSBpZiAhb3JpZ2luIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgICBjaGFyYWN0ZXIuYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgIGNoYXJhY3Rlci56b29tLnggPSBAcGFyYW1zLnBvc2l0aW9uLnpvb20uZFxuICAgICAgICBjaGFyYWN0ZXIuem9vbS55ID0gQHBhcmFtcy5wb3NpdGlvbi56b29tLmRcbiAgICAgICAgY2hhcmFjdGVyLnpJbmRleCA9IHpJbmRleCB8fCAyMDBcbiAgICAgICAgY2hhcmFjdGVyLm1vZGVsPy5yZXNldCgpXG4gICAgICAgIGNoYXJhY3Rlci5zZXR1cCgpXG4gICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LmlkbGVJbnRlbnNpdHkgPSByZWNvcmQuaWRsZUludGVuc2l0eSA/IDEuMFxuICAgICAgICBjaGFyYWN0ZXIudmlzdWFsLmwyZE9iamVjdC5icmVhdGhJbnRlbnNpdHkgPSByZWNvcmQuYnJlYXRoSW50ZW5zaXR5ID8gMS4wXG4gICAgICAgIGNoYXJhY3Rlci52aXN1YWwubDJkT2JqZWN0LmxpcFN5bmNTZW5zaXRpdml0eSA9IHJlY29yZC5saXBTeW5jU2Vuc2l0aXZpdHkgPyAxLjBcblxuICAgICAgICBjaGFyYWN0ZXIudXBkYXRlKClcbiAgICAgICAgXG4gICAgICAgIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDBcbiAgICAgICAgICAgIHAgPSBAaW50ZXJwcmV0ZXIucHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uKEBwYXJhbXMucHJlZGVmaW5lZFBvc2l0aW9uSWQsIGNoYXJhY3RlciwgQHBhcmFtcylcbiAgICAgICAgICAgIGNoYXJhY3Rlci5kc3RSZWN0LnggPSBwLnhcbiAgICAgICAgICAgIGNoYXJhY3Rlci5kc3RSZWN0LnkgPSBwLnlcblxuICAgICAgICBzY2VuZS5iZWhhdmlvci5hZGRDaGFyYWN0ZXIoY2hhcmFjdGVyLCBub0FuaW0sIHsgYW5pbWF0aW9uOiBhbmltYXRpb24sIGR1cmF0aW9uOiBkdXJhdGlvbiwgZWFzaW5nOiBlYXNpbmcsIG1vdGlvbkJsdXI6IG1vdGlvbkJsdXJ9KVxuXG4gICAgICAgIGlmIEBwYXJhbXMudmlld3BvcnQ/LnR5cGUgPT0gXCJ1aVwiXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlld3BvcnQgPSBHcmFwaGljcy52aWV3cG9ydFxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYXJhY3RlckpvaW5TY2VuZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDaGFyYWN0ZXJKb2luU2NlbmU6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuY2hhcmFjdGVyXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVySWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNoYXJhY3RlcklkKVxuICAgICAgICBleHByZXNzaW9uSWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmV4cHJlc3Npb25JZCkgfHwgQHBhcmFtcy5leHByZXNzaW9uSWRcbiAgICAgICAgcmVjb3JkID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJzW2NoYXJhY3RlcklkXVxuXG4gICAgICAgIHJldHVybiBpZiAhcmVjb3JkIG9yIHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpIC0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSByZWNvcmQuaW5kZXggYW5kICF2LmRpc3Bvc2VkXG5cbiAgICAgICAgY2hhcmFjdGVyID0gbmV3IHZuLk9iamVjdF9DaGFyYWN0ZXIocmVjb3JkLCBudWxsLCBzY2VuZSlcbiAgICAgICAgY2hhcmFjdGVyLmV4cHJlc3Npb24gPSBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlckV4cHJlc3Npb25zW2V4cHJlc3Npb25JZCA/IHJlY29yZC5kZWZhdWx0RXhwcmVzc2lvbklkfHwwXSAjY2hhcmFjdGVyLmV4cHJlc3Npb25cbiAgICAgICAgaWYgY2hhcmFjdGVyLmV4cHJlc3Npb24/LmlkbGVbMF0/LnJlc291cmNlLm5hbWVcbiAgICAgICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoY2hhcmFjdGVyLmV4cHJlc3Npb24uaWRsZVswXS5yZXNvdXJjZSkpXG4gICAgICAgICAgICBjaGFyYWN0ZXIuaW1hZ2VGb2xkZXIgPSBjaGFyYWN0ZXIuZXhwcmVzc2lvbi5pZGxlWzBdLnJlc291cmNlLmZvbGRlclBhdGhcbiAgICAgICAgbWlycm9yID0gbm9cbiAgICAgICAgYW5nbGUgPSAwXG4gICAgICAgIHpvb20gPSAxXG5cbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMVxuICAgICAgICAgICAgeCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucG9zaXRpb24ueClcbiAgICAgICAgICAgIHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLnkpXG4gICAgICAgICAgICBtaXJyb3IgPSBAcGFyYW1zLnBvc2l0aW9uLmhvcml6b250YWxGbGlwXG4gICAgICAgICAgICBhbmdsZSA9IEBwYXJhbXMucG9zaXRpb24uYW5nbGV8fDBcbiAgICAgICAgICAgIHpvb20gPSBAcGFyYW1zLnBvc2l0aW9uLmRhdGE/Lnpvb20gfHwgMVxuICAgICAgICBlbHNlIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDJcbiAgICAgICAgICAgIHggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLngpXG4gICAgICAgICAgICB5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi55KVxuICAgICAgICAgICAgbWlycm9yID0gbm9cbiAgICAgICAgICAgIGFuZ2xlID0gMFxuICAgICAgICAgICAgem9vbSA9IDFcblxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICBvcmlnaW4gPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIEBwYXJhbXMub3JpZ2luIGVsc2UgZGVmYXVsdHMub3JpZ2luXG4gICAgICAgIHpJbmRleCA9IGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpIGVsc2UgZGVmYXVsdHMuek9yZGVyXG4gICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIG1vdGlvbkJsdXIgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJtb3Rpb25CbHVyLmVuYWJsZWRcIl0pIHRoZW4gQHBhcmFtcy5tb3Rpb25CbHVyIGVsc2UgZGVmYXVsdHMubW90aW9uQmx1clxuICAgICAgICBpbnN0YW50ID0gZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpXG4gICAgICAgIG5vQW5pbSA9IGR1cmF0aW9uID09IDAgb3IgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcblxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgaW5zdGFudFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICAgICBpZiBjaGFyYWN0ZXIuZXhwcmVzc2lvbj8uaWRsZVswXT8ucmVzb3VyY2UubmFtZVxuICAgICAgICAgICAgYml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChjaGFyYWN0ZXIuZXhwcmVzc2lvbi5pZGxlWzBdLnJlc291cmNlKSlcbiAgICAgICAgICAgIGlmIG9yaWdpbiA9PSAxIGFuZCBiaXRtYXA/XG4gICAgICAgICAgICAgICAgeCArPSAoYml0bWFwLndpZHRoKnpvb20tYml0bWFwLndpZHRoKS8yXG4gICAgICAgICAgICAgICAgeSArPSAoYml0bWFwLmhlaWdodCp6b29tLWJpdG1hcC5oZWlnaHQpLzJcblxuICAgICAgICBjaGFyYWN0ZXIubWlycm9yID0gbWlycm9yXG4gICAgICAgIGNoYXJhY3Rlci5hbmNob3IueCA9IGlmICFvcmlnaW4gdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIGNoYXJhY3Rlci5hbmNob3IueSA9IGlmICFvcmlnaW4gdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIGNoYXJhY3Rlci56b29tLnggPSB6b29tXG4gICAgICAgIGNoYXJhY3Rlci56b29tLnkgPSB6b29tXG4gICAgICAgIGNoYXJhY3Rlci5kc3RSZWN0LnggPSB4XG4gICAgICAgIGNoYXJhY3Rlci5kc3RSZWN0LnkgPSB5XG4gICAgICAgIGNoYXJhY3Rlci56SW5kZXggPSB6SW5kZXggfHwgIDIwMFxuICAgICAgICBjaGFyYWN0ZXIuYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgIGNoYXJhY3Rlci5hbmdsZSA9IGFuZ2xlXG4gICAgICAgIGNoYXJhY3Rlci5zZXR1cCgpXG4gICAgICAgIGNoYXJhY3Rlci51cGRhdGUoKVxuXG4gICAgICAgIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDBcbiAgICAgICAgICAgIHAgPSBAaW50ZXJwcmV0ZXIucHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uKEBwYXJhbXMucHJlZGVmaW5lZFBvc2l0aW9uSWQsIGNoYXJhY3RlciwgQHBhcmFtcylcbiAgICAgICAgICAgIGNoYXJhY3Rlci5kc3RSZWN0LnggPSBwLnhcbiAgICAgICAgICAgIGNoYXJhY3Rlci5kc3RSZWN0LnkgPSBwLnlcblxuICAgICAgICBzY2VuZS5iZWhhdmlvci5hZGRDaGFyYWN0ZXIoY2hhcmFjdGVyLCBub0FuaW0sIHsgYW5pbWF0aW9uOiBhbmltYXRpb24sIGR1cmF0aW9uOiBkdXJhdGlvbiwgZWFzaW5nOiBlYXNpbmcsIG1vdGlvbkJsdXI6IG1vdGlvbkJsdXJ9KVxuXG4gICAgICAgIGlmIEBwYXJhbXMudmlld3BvcnQ/LnR5cGUgPT0gXCJ1aVwiXG4gICAgICAgICAgICBjaGFyYWN0ZXIudmlld3BvcnQgPSBHcmFwaGljcy52aWV3cG9ydFxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhcmFjdGVyRXhpdFNjZW5lXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYXJhY3RlckV4aXRTY2VuZTogKGRlZmF1bHRzKSAtPlxuICAgICAgICBkZWZhdWx0cyA9IGRlZmF1bHRzIHx8IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3RlclxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGNoYXJhY3RlcklkID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jaGFyYWN0ZXJJZClcblxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gY2hhcmFjdGVySWRcblxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvblxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICBpbnN0YW50ID0gZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpXG4gICAgICAgIG5vQW5pbSA9IGR1cmF0aW9uID09IDAgb3IgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBcblxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgaW5zdGFudFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICAgICBzY2VuZS5iZWhhdmlvci5yZW1vdmVDaGFyYWN0ZXIoY2hhcmFjdGVyLCBub0FuaW0sIHsgYW5pbWF0aW9uOiBhbmltYXRpb24sIGR1cmF0aW9uOiBkdXJhdGlvbiwgZWFzaW5nOiBlYXNpbmd9KVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYXJhY3RlckNoYW5nZUV4cHJlc3Npb25cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQ2hhcmFjdGVyQ2hhbmdlRXhwcmVzc2lvbjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVySWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNoYXJhY3RlcklkKVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gY2hhcmFjdGVySWRcbiAgICAgICAgaWYgbm90IGNoYXJhY3Rlcj8gdGhlbiByZXR1cm5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5jaGFyYWN0ZXJcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5leHByZXNzaW9uRHVyYXRpb25cbiAgICAgICAgZXhwcmVzc2lvbiA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyRXhwcmVzc2lvbnNbQHBhcmFtcy5leHByZXNzaW9uSWQgfHwgMF1cbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5jaGFuZ2VFYXNpbmcpXG4gICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuY2hhbmdlQW5pbWF0aW9uXG5cbiAgICAgICAgY2hhcmFjdGVyLmJlaGF2aW9yLmNoYW5nZUV4cHJlc3Npb24oZXhwcmVzc2lvbiwgQHBhcmFtcy5hbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG5cbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhcmFjdGVyU2V0UGFyYW1ldGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYXJhY3RlclNldFBhcmFtZXRlcjogLT5cbiAgICAgICAgcGFyYW1zID0gR2FtZU1hbmFnZXIuY2hhcmFjdGVyUGFyYW1zW0BpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXVxuICAgICAgICBpZiBub3QgcGFyYW1zPyBvciBub3QgQHBhcmFtcy5wYXJhbT8gdGhlbiByZXR1cm5cblxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy52YWx1ZVR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlciBWYWx1ZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnBhcmFtLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIFN3aXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW0BwYXJhbXMucGFyYW0ubmFtZV0gPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSA+IDBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgVGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW0BwYXJhbXMucGFyYW0ubmFtZV0gPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKS50b1N0cmluZygpXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2ggVmFsdWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggQHBhcmFtcy5wYXJhbS50eXBlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tAcGFyYW1zLnBhcmFtLm5hbWVdID0gaWYgdmFsdWUgdGhlbiAxIGVsc2UgMFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tAcGFyYW1zLnBhcmFtLm5hbWVdID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IGlmIHZhbHVlIHRoZW4gXCJPTlwiIGVsc2UgXCJPRkZcIlxuICAgICAgICAgICAgd2hlbiAyICMgVGV4dCBWYWx1ZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLnBhcmFtLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW0BwYXJhbXMucGFyYW0ubmFtZV0gPSB2YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKSA9PSBcIk9OXCJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAyICMgVGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW0BwYXJhbXMucGFyYW0ubmFtZV0gPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnRleHRWYWx1ZSlcblxuXG5cblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYXJhY3RlckdldFBhcmFtZXRlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDaGFyYWN0ZXJHZXRQYXJhbWV0ZXI6IC0+XG4gICAgICAgIHBhcmFtcyA9IEdhbWVNYW5hZ2VyLmNoYXJhY3RlclBhcmFtc1tAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNoYXJhY3RlcklkKV1cbiAgICAgICAgaWYgbm90IHBhcmFtcz8gb3Igbm90IEBwYXJhbXMucGFyYW0/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgdmFsdWUgPSBwYXJhbXNbQHBhcmFtcy5wYXJhbS5uYW1lXVxuXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnZhbHVlVHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgTnVtYmVyIFZhbHVlXG4gICAgICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMucGFyYW0udHlwZVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDAgIyBOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGlmIHZhbHVlIHRoZW4gMSBlbHNlIDApXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGlmIHZhbHVlPyB0aGVuIHZhbHVlLmxlbmd0aCBlbHNlIDApXG4gICAgICAgICAgICB3aGVuIDEgIyBTd2l0Y2ggVmFsdWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggQHBhcmFtcy5wYXJhbS50eXBlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHZhbHVlID4gMClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCB2YWx1ZSA9PSBcIk9OXCIpXG5cbiAgICAgICAgICAgIHdoZW4gMiAjIFRleHQgVmFsdWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggQHBhcmFtcy5wYXJhbS50eXBlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIE51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgaWYgdmFsdWU/IHRoZW4gdmFsdWUudG9TdHJpbmcoKSBlbHNlIFwiXCIpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMSAjIFN3aXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgaWYgdmFsdWUgdGhlbiBcIk9OXCIgZWxzZSBcIk9GRlwiKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBUZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCB2YWx1ZSlcblxuXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFyYWN0ZXJNb3Rpb25CbHVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYXJhY3Rlck1vdGlvbkJsdXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlcklkID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jaGFyYWN0ZXJJZClcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IGNoYXJhY3RlcklkXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgY2hhcmFjdGVyLm1vdGlvbkJsdXIuc2V0KEBwYXJhbXMubW90aW9uQmx1cilcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYXJhY3RlckRlZmF1bHRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYXJhY3RlckRlZmF1bHRzOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3RlclxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmFwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmFwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZGlzYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZGlzYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5leHByZXNzaW9uRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuZXhwcmVzc2lvbkR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmV4cHJlc3Npb25EdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBkZWZhdWx0cy56T3JkZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5hcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5hcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyRWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nID0gQHBhcmFtcy5kaXNhcHBlYXJFYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZGlzYXBwZWFyQW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyQW5pbWF0aW9uID0gQHBhcmFtcy5kaXNhcHBlYXJBbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wibW90aW9uQmx1ci5lbmFibGVkXCJdKSB0aGVuIGRlZmF1bHRzLm1vdGlvbkJsdXIgPSBAcGFyYW1zLm1vdGlvbkJsdXJcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm9yaWdpbikgdGhlbiBkZWZhdWx0cy5vcmlnaW4gPSBAcGFyYW1zLm9yaWdpblxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhcmFjdGVyRWZmZWN0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYXJhY3RlckVmZmVjdDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgY2hhcmFjdGVySWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNoYXJhY3RlcklkKVxuICAgICAgICBjaGFyYWN0ZXIgPSBzY2VuZS5jaGFyYWN0ZXJzLmZpcnN0IChjKSAtPiAhYy5kaXNwb3NlZCBhbmQgYy5yaWQgPT0gY2hhcmFjdGVySWRcbiAgICAgICAgaWYgbm90IGNoYXJhY3Rlcj8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIub2JqZWN0RWZmZWN0KGNoYXJhY3RlciwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEZsYXNoQ2hhcmFjdGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEZsYXNoQ2hhcmFjdGVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXJJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBjaGFyYWN0ZXJJZFxuICAgICAgICByZXR1cm4gaWYgbm90IGNoYXJhY3RlclxuXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBjaGFyYWN0ZXIuYW5pbWF0b3IuZmxhc2gobmV3IENvbG9yKEBwYXJhbXMuY29sb3IpLCBkdXJhdGlvbilcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVGludENoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRUaW50Q2hhcmFjdGVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXJJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBjaGFyYWN0ZXJJZFxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KVxuICAgICAgICByZXR1cm4gaWYgbm90IGNoYXJhY3RlclxuXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBjaGFyYWN0ZXIuYW5pbWF0b3IudGludFRvKEBwYXJhbXMudG9uZSwgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kWm9vbUNoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRab29tQ2hhcmFjdGVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXJJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBjaGFyYWN0ZXJJZFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci56b29tT2JqZWN0KGNoYXJhY3RlciwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJvdGF0ZUNoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRSb3RhdGVDaGFyYWN0ZXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlcklkID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jaGFyYWN0ZXJJZClcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IGNoYXJhY3RlcklkXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLnJvdGF0ZU9iamVjdChjaGFyYWN0ZXIsIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCbGVuZENoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRCbGVuZENoYXJhY3RlcjogLT5cbiAgICAgICAgY2hhcmFjdGVySWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNoYXJhY3RlcklkKVxuICAgICAgICBjaGFyYWN0ZXIgPSBTY2VuZU1hbmFnZXIuc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IGNoYXJhY3RlcklkXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLmJsZW5kT2JqZWN0KGNoYXJhY3RlciwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNoYWtlQ2hhcmFjdGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFNoYWtlQ2hhcmFjdGVyOiAtPlxuICAgICAgICBjaGFyYWN0ZXJJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXG4gICAgICAgIGNoYXJhY3RlciA9IFNjZW5lTWFuYWdlci5zY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgIHYucmlkID09IGNoYXJhY3RlcklkXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG4gICAgICAgIEBpbnRlcnByZXRlci5zaGFrZU9iamVjdChjaGFyYWN0ZXIsIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNYXNrQ2hhcmFjdGVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZE1hc2tDaGFyYWN0ZXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNoYXJhY3RlcklkID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jaGFyYWN0ZXJJZClcbiAgICAgICAgY2hhcmFjdGVyID0gc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IGNoYXJhY3RlcklkXG4gICAgICAgIGlmIG5vdCBjaGFyYWN0ZXI/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLm1hc2tPYmplY3QoY2hhcmFjdGVyLCBAcGFyYW1zKVxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTW92ZUNoYXJhY3RlclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRNb3ZlQ2hhcmFjdGVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXJJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBjaGFyYWN0ZXJJZFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0KGNoYXJhY3RlciwgQHBhcmFtcy5wb3NpdGlvbiwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1vdmVDaGFyYWN0ZXJQYXRoXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZE1vdmVDaGFyYWN0ZXJQYXRoOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBjaGFyYWN0ZXJJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY2hhcmFjdGVySWQpXG4gICAgICAgIGNoYXJhY3RlciA9IHNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKHYpID0+ICF2LmRpc3Bvc2VkIGFuZCB2LnJpZCA9PSBjaGFyYWN0ZXJJZFxuICAgICAgICBpZiBub3QgY2hhcmFjdGVyPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0UGF0aChjaGFyYWN0ZXIsIEBwYXJhbXMucGF0aCwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNoYWtlQmFja2dyb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTaGFrZUJhY2tncm91bmQ6IC0+XG4gICAgICAgIGJhY2tncm91bmQgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmFja2dyb3VuZHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcildXG4gICAgICAgIGlmIG5vdCBiYWNrZ3JvdW5kPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci5zaGFrZU9iamVjdChiYWNrZ3JvdW5kLCBAcGFyYW1zKVxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgaG9yaXpvbnRhbFNwZWVkID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ob3Jpem9udGFsU3BlZWQpXG4gICAgICAgIHZlcnRpY2FsU3BlZWQgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnZlcnRpY2FsU3BlZWQpXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpXG4gICAgICAgIGxheWVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcilcbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuXG4gICAgICAgIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXT8uYW5pbWF0b3IubW92ZShob3Jpem9udGFsU3BlZWQsIHZlcnRpY2FsU3BlZWQsIGR1cmF0aW9uLCBlYXNpbmcpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kVG9cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2Nyb2xsQmFja2dyb3VuZFRvOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgeCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYmFja2dyb3VuZC5sb2NhdGlvbi54KVxuICAgICAgICB5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5iYWNrZ3JvdW5kLmxvY2F0aW9uLnkpXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpXG4gICAgICAgIGxheWVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcilcbiAgICAgICAgYmFja2dyb3VuZCA9IHNjZW5lLmJhY2tncm91bmRzW2xheWVyXVxuICAgICAgICBpZiAhYmFja2dyb3VuZCB0aGVuIHJldHVyblxuXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICAgICBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAwXG4gICAgICAgICAgICBwID0gQGludGVycHJldGVyLnByZWRlZmluZWRPYmplY3RQb3NpdGlvbihAcGFyYW1zLnByZWRlZmluZWRQb3NpdGlvbklkLCBiYWNrZ3JvdW5kLCBAcGFyYW1zKVxuICAgICAgICAgICAgeCA9IHAueFxuICAgICAgICAgICAgeSA9IHAueVxuXG4gICAgICAgIGJhY2tncm91bmQuYW5pbWF0b3IubW92ZVRvKHgsIHksIGR1cmF0aW9uLCBlYXNpbmcpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kUGF0aFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTY3JvbGxCYWNrZ3JvdW5kUGF0aDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgYmFja2dyb3VuZCA9IHNjZW5lLmJhY2tncm91bmRzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXVxuICAgICAgICByZXR1cm4gdW5sZXNzIGJhY2tncm91bmQ/XG5cbiAgICAgICAgQGludGVycHJldGVyLm1vdmVPYmplY3RQYXRoKGJhY2tncm91bmQsIEBwYXJhbXMucGF0aCwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1hc2tCYWNrZ3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZE1hc2tCYWNrZ3JvdW5kOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBiYWNrZ3JvdW5kID0gc2NlbmUuYmFja2dyb3VuZHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcildXG4gICAgICAgIHJldHVybiB1bmxlc3MgYmFja2dyb3VuZD9cblxuICAgICAgICBAaW50ZXJwcmV0ZXIubWFza09iamVjdChiYWNrZ3JvdW5kLCBAcGFyYW1zKVxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kWm9vbUJhY2tncm91bmRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kWm9vbUJhY2tncm91bmQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICB4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56b29taW5nLngpXG4gICAgICAgIHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpvb21pbmcueSlcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dClcbiAgICAgICAgbGF5ZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKVxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG5cbiAgICAgICAgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdPy5hbmltYXRvci56b29tVG8oeCAvIDEwMCwgeSAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJvdGF0ZUJhY2tncm91bmRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUm90YXRlQmFja2dyb3VuZDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgYmFja2dyb3VuZCA9IHNjZW5lLmJhY2tncm91bmRzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXVxuXG4gICAgICAgIGlmIGJhY2tncm91bmRcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5yb3RhdGVPYmplY3QoYmFja2dyb3VuZCwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFRpbnRCYWNrZ3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFRpbnRCYWNrZ3JvdW5kOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBsYXllciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXG4gICAgICAgIGJhY2tncm91bmQgPSBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl1cbiAgICAgICAgaWYgbm90IGJhY2tncm91bmQ/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZylcbiAgICAgICAgYmFja2dyb3VuZC5hbmltYXRvci50aW50VG8oQHBhcmFtcy50b25lLCBkdXJhdGlvbiwgZWFzaW5nKVxuXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yQ29tcGxldGlvbihiYWNrZ3JvdW5kLCBAcGFyYW1zKVxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQmxlbmRCYWNrZ3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEJsZW5kQmFja2dyb3VuZDogLT5cbiAgICAgICAgbGF5ZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKVxuICAgICAgICBiYWNrZ3JvdW5kID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmJhY2tncm91bmRzW2xheWVyXVxuICAgICAgICBpZiBub3QgYmFja2dyb3VuZD8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIuYmxlbmRPYmplY3QoYmFja2dyb3VuZCwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEJhY2tncm91bmRFZmZlY3RcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQmFja2dyb3VuZEVmZmVjdDogLT5cbiAgICAgICAgbGF5ZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKVxuICAgICAgICBiYWNrZ3JvdW5kID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmJhY2tncm91bmRzW2xheWVyXVxuICAgICAgICBpZiBub3QgYmFja2dyb3VuZD8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIub2JqZWN0RWZmZWN0KGJhY2tncm91bmQsIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCYWNrZ3JvdW5kRGVmYXVsdHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQmFja2dyb3VuZERlZmF1bHRzOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmJhY2tncm91bmRcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5kdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBkZWZhdWx0cy56T3JkZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuZWFzaW5nID0gQHBhcmFtcy5lYXNpbmdcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gZGVmYXVsdHMuYW5pbWF0aW9uID0gQHBhcmFtcy5hbmltYXRpb25cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm9yaWdpbikgdGhlbiBkZWZhdWx0cy5vcmlnaW4gPSBAcGFyYW1zLm9yaWdpblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubG9vcEhvcml6b250YWwpIHRoZW4gZGVmYXVsdHMubG9vcEhvcml6b250YWwgPSBAcGFyYW1zLmxvb3BIb3Jpem9udGFsXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5sb29wVmVydGljYWwpIHRoZW4gZGVmYXVsdHMubG9vcFZlcnRpY2FsID0gQHBhcmFtcy5sb29wVmVydGljYWxcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEJhY2tncm91bmRNb3Rpb25CbHVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEJhY2tncm91bmRNb3Rpb25CbHVyOiAtPlxuICAgICAgICBsYXllciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpXG4gICAgICAgIGJhY2tncm91bmQgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdXG4gICAgICAgIGlmIG5vdCBiYWNrZ3JvdW5kPyB0aGVuIHJldHVyblxuXG4gICAgICAgIGJhY2tncm91bmQubW90aW9uQmx1ci5zZXQoQHBhcmFtcy5tb3Rpb25CbHVyKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlQmFja2dyb3VuZFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDaGFuZ2VCYWNrZ3JvdW5kOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmJhY2tncm91bmRcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuZHVyYXRpb25cbiAgICAgICAgbG9vcEggPSBpZiAhaXNMb2NrZWQoZmxhZ3MubG9vcEhvcml6b250YWwpIHRoZW4gQHBhcmFtcy5sb29wSG9yaXpvbnRhbCBlbHNlIGRlZmF1bHRzLmxvb3BIb3Jpem9udGFsXG4gICAgICAgIGxvb3BWID0gaWYgIWlzTG9ja2VkKGZsYWdzLmxvb3BWZXJ0aWNhbCkgdGhlbiBAcGFyYW1zLmxvb3BWZXJ0aWNhbCBlbHNlIGRlZmF1bHRzLmxvb3BWZXJ0aWNhbFxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmFuaW1hdGlvblxuICAgICAgICBvcmlnaW4gPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIEBwYXJhbXMub3JpZ2luIGVsc2UgZGVmYXVsdHMub3JpZ2luXG4gICAgICAgIHpJbmRleCA9IGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpIGVsc2UgZGVmYXVsdHMuek9yZGVyXG5cbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuXG4gICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuICBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmVhc2luZylcbiAgICAgICAgbGF5ZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VCYWNrZ3JvdW5kKEBwYXJhbXMuZ3JhcGhpYywgbm8sIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbiwgMCwgMCwgbGF5ZXIsIGxvb3BILCBsb29wVilcblxuICAgICAgICBpZiBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl1cbiAgICAgICAgICAgIGlmIEBwYXJhbXMudmlld3BvcnQ/LnR5cGUgPT0gXCJ1aVwiXG4gICAgICAgICAgICAgICAgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLnZpZXdwb3J0ID0gR3JhcGhpY3Mudmlld3BvcnRcbiAgICAgICAgICAgIHNjZW5lLmJhY2tncm91bmRzW2xheWVyXS5hbmNob3IueCA9IGlmIG9yaWdpbiA9PSAwIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgICAgICAgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLmFuY2hvci55ID0gaWYgb3JpZ2luID09IDAgdGhlbiAwIGVsc2UgMC41XG4gICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uekluZGV4ID0gekluZGV4ICsgbGF5ZXJcblxuICAgICAgICAgICAgaWYgb3JpZ2luID09IDFcbiAgICAgICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uZHN0UmVjdC54ID0gc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLmRzdFJlY3QueCMgKyBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uYml0bWFwLndpZHRoLzJcbiAgICAgICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uZHN0UmVjdC55ID0gc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLmRzdFJlY3QueSMgKyBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uYml0bWFwLmhlaWdodC8yXG4gICAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kc1tsYXllcl0uc2V0dXAoKVxuICAgICAgICAgICAgc2NlbmUuYmFja2dyb3VuZHNbbGF5ZXJdLnVwZGF0ZSgpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDYWxsU2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQ2FsbFNjZW5lOiAtPlxuICAgICAgICBAaW50ZXJwcmV0ZXIuY2FsbFNjZW5lKEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuc2NlbmUudWlkIHx8IEBwYXJhbXMuc2NlbmUpKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlU2NlbmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQ2hhbmdlU2NlbmU6IC0+XG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXcgdGhlbiByZXR1cm5cbiAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBub1xuXG4gICAgICAgIGlmICFAcGFyYW1zLnNhdmVQcmV2aW91c1xuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcblxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBpZiAhQHBhcmFtcy5lcmFzZVBpY3R1cmVzIGFuZCAhQHBhcmFtcy5zYXZlUHJldmlvdXNcbiAgICAgICAgICAgIHNjZW5lLnJlbW92ZU9iamVjdChzY2VuZS5waWN0dXJlQ29udGFpbmVyKVxuICAgICAgICAgICAgZm9yIHBpY3R1cmUgaW4gc2NlbmUucGljdHVyZXNcbiAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuY29udGV4dC5yZW1vdmUoXCIje3BpY3R1cmUuaW1hZ2VGb2xkZXJ9LyN7cGljdHVyZS5pbWFnZX1cIikgaWYgcGljdHVyZVxuICAgICAgICBpZiAhQHBhcmFtcy5lcmFzZVRleHRzIGFuZCAhQHBhcmFtcy5zYXZlUHJldmlvdXNcbiAgICAgICAgICAgIHNjZW5lLnJlbW92ZU9iamVjdChzY2VuZS50ZXh0Q29udGFpbmVyKVxuICAgICAgICBpZiAhQHBhcmFtcy5lcmFzZVZpZGVvcyBhbmQgIUBwYXJhbXMuc2F2ZVByZXZpb3VzXG4gICAgICAgICAgICBzY2VuZS5yZW1vdmVPYmplY3Qoc2NlbmUudmlkZW9Db250YWluZXIpXG4gICAgICAgICAgICBmb3IgdmlkZW8gaW4gc2NlbmUudmlkZW9zXG4gICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmNvbnRleHQucmVtb3ZlKFwiI3t2aWRlby52aWRlb0ZvbGRlcn0vI3t2aWRlby52aWRlb31cIikgaWYgdmlkZW9cblxuICAgICAgICBpZiBAcGFyYW1zLnNjZW5lXG4gICAgICAgICAgICBwYXJhbVNjZW5lID0gdWlkOiBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnNjZW5lLnVpZCB8fCBAcGFyYW1zLnNjZW5lKVxuICAgICAgICAgICAgaWYgQHBhcmFtcy5zYXZlUHJldmlvdXNcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci5zY2VuZURhdGEgPSB1aWQ6IHVpZCA9IHBhcmFtU2NlbmUudWlkLCBwaWN0dXJlczogW10sIHRleHRzOiBbXSwgdmlkZW9zOiBbXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnNjZW5lRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICB1aWQ6IHVpZCA9IHBhcmFtU2NlbmUudWlkLFxuICAgICAgICAgICAgICAgICAgIHBpY3R1cmVzOiBzY2VuZS5waWN0dXJlQ29udGFpbmVyLnN1Yk9iamVjdHNCeURvbWFpbixcbiAgICAgICAgICAgICAgICAgICB0ZXh0czogc2NlbmUudGV4dENvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW4sXG4gICAgICAgICAgICAgICAgICAgdmlkZW9zOiBzY2VuZS52aWRlb0NvbnRhaW5lci5zdWJPYmplY3RzQnlEb21haW5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgICAgICBuZXdTY2VuZSA9IG5ldyB2bi5PYmplY3RfU2NlbmUoKVxuICAgICAgICAgICAgaWYgQHBhcmFtcy5zYXZlUHJldmlvdXNcbiAgICAgICAgICAgICAgICBuZXdTY2VuZS5zY2VuZURhdGEgPSB1aWQ6IHVpZCA9IHBhcmFtU2NlbmUudWlkLCBwaWN0dXJlczogW10sIHRleHRzOiBbXSwgdmlkZW9zOiBbXSwgYmFja2xvZzogR2FtZU1hbmFnZXIuYmFja2xvZ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG5ld1NjZW5lLnNjZW5lRGF0YSA9IHVpZDogdWlkID0gcGFyYW1TY2VuZS51aWQsIHBpY3R1cmVzOiBzY2VuZS5waWN0dXJlQ29udGFpbmVyLnN1Yk9iamVjdHNCeURvbWFpbiwgdGV4dHM6IHNjZW5lLnRleHRDb250YWluZXIuc3ViT2JqZWN0c0J5RG9tYWluLCB2aWRlb3M6IHNjZW5lLnZpZGVvQ29udGFpbmVyLnN1Yk9iamVjdHNCeURvbWFpblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8obmV3U2NlbmUsIEBwYXJhbXMuc2F2ZVByZXZpb3VzLCA9PiBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gbm8pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhudWxsKVxuXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJldHVyblRvUHJldmlvdXNTY2VuZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRSZXR1cm5Ub1ByZXZpb3VzU2NlbmU6IC0+XG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXcgdGhlbiByZXR1cm5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnJldHVyblRvUHJldmlvdXMoPT4gQGludGVycHJldGVyLmlzV2FpdGluZyA9IG5vKVxuXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcblxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU3dpdGNoVG9MYXlvdXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU3dpdGNoVG9MYXlvdXQ6IC0+XG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXcgdGhlbiByZXR1cm5cbiAgICAgICAgaWYgdWkuVUlNYW5hZ2VyLmxheW91dHNbQHBhcmFtcy5sYXlvdXQubmFtZV0/XG4gICAgICAgICAgICBzY2VuZSA9IG5ldyBncy5PYmplY3RfTGF5b3V0KEBwYXJhbXMubGF5b3V0Lm5hbWUpXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8oc2NlbmUsIEBwYXJhbXMuc2F2ZVByZXZpb3VzLCA9PiBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gbm8pXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VUcmFuc2l0aW9uXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYW5nZVRyYW5zaXRpb246IC0+XG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pXG4gICAgICAgICAgICBTY2VuZU1hbmFnZXIudHJhbnNpdGlvbkRhdGEuZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5ncmFwaGljKVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhLmdyYXBoaWMgPSBAcGFyYW1zLmdyYXBoaWNcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnZhZ3VlKVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhLnZhZ3VlID0gQHBhcmFtcy52YWd1ZVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRnJlZXplU2NyZWVuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEZyZWV6ZVNjcmVlbjogLT5cbiAgICAgICAgR3JhcGhpY3MuZnJlZXplKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNjcmVlblRyYW5zaXRpb25cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2NyZWVuVHJhbnNpdGlvbjogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5zY2VuZVxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGdyYXBoaWMgPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZ3JhcGhpYykgdGhlbiBAcGFyYW1zLmdyYXBoaWMgZWxzZSBTY2VuZU1hbmFnZXIudHJhbnNpdGlvbkRhdGEuZ3JhcGhpY1xuXG4gICAgICAgIGlmIGdyYXBoaWNcbiAgICAgICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoZ3JhcGhpYykpXG4gICAgICAgIHZhZ3VlID0gaWYgIWlzTG9ja2VkKGZsYWdzLnZhZ3VlKSB0aGVuIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudmFndWUpIGVsc2UgU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhLnZhZ3VlXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBTY2VuZU1hbmFnZXIudHJhbnNpdGlvbkRhdGEuZHVyYXRpb25cblxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gIUdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXdcbiAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cblxuXG4gICAgICAgIEdyYXBoaWNzLnRyYW5zaXRpb24oZHVyYXRpb24sIGJpdG1hcCwgdmFndWUpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaGFrZVNjcmVlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTaGFrZVNjcmVlbjogLT5cbiAgICAgICAgaWYgbm90IFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydD8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2hha2VPYmplY3QoU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVGludFNjcmVlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRUaW50U2NyZWVuOiAtPlxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LmFuaW1hdG9yLnRpbnRUbyhuZXcgVG9uZShAcGFyYW1zLnRvbmUpLCBkdXJhdGlvbiwgZ3MuRWFzaW5ncy5FQVNFX0xJTkVBUlswXSlcblxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBkdXJhdGlvbiA+IDBcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kWm9vbVNjcmVlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRab29tU2NyZWVuOiAtPlxuICAgICAgICBlYXNpbmcgPSBncy5FYXNpbmdzLmZyb21PYmplY3QoQHBhcmFtcy5lYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKVxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydC5hbmNob3IueCA9IDAuNVxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQuYW5jaG9yLnkgPSAwLjVcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LmFuaW1hdG9yLnpvb21UbyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpvb21pbmcueCkgLyAxMDAsIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuem9vbWluZy55KSAvIDEwMCwgZHVyYXRpb24sIGVhc2luZylcblxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdEZvckNvbXBsZXRpb24obnVsbCwgQHBhcmFtcylcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQYW5TY3JlZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUGFuU2NyZWVuOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKVxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0dGluZ3Muc2NyZWVuLnBhbi54IC09IEBwYXJhbXMucG9zaXRpb24ueFxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0dGluZ3Muc2NyZWVuLnBhbi55IC09IEBwYXJhbXMucG9zaXRpb24ueVxuICAgICAgICB2aWV3cG9ydCA9IFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydFxuXG4gICAgICAgIHZpZXdwb3J0LmFuaW1hdG9yLnNjcm9sbFRvKC1AcGFyYW1zLnBvc2l0aW9uLnggKyB2aWV3cG9ydC5kc3RSZWN0LngsIC1AcGFyYW1zLnBvc2l0aW9uLnkgKyB2aWV3cG9ydC5kc3RSZWN0LnksIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yQ29tcGxldGlvbihudWxsLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJvdGF0ZVNjcmVlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRSb3RhdGVTY3JlZW46IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG5cbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgcGFuID0gQGludGVycHJldGVyLnNldHRpbmdzLnNjcmVlbi5wYW5cblxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUudmlld3BvcnQuYW5jaG9yLnggPSAwLjVcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LmFuY2hvci55ID0gMC41XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydC5hbmltYXRvci5yb3RhdGUoQHBhcmFtcy5kaXJlY3Rpb24sIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc3BlZWQpIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Rm9yQ29tcGxldGlvbihudWxsLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEZsYXNoU2NyZWVuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEZsYXNoU2NyZWVuOiAtPlxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnZpZXdwb3J0LmFuaW1hdG9yLmZsYXNoKG5ldyBDb2xvcihAcGFyYW1zLmNvbG9yKSwgZHVyYXRpb24sIGdzLkVhc2luZ3MuRUFTRV9MSU5FQVJbMF0pXG5cbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgZHVyYXRpb24gIT0gMFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNjcmVlbkVmZmVjdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTY3JlZW5FZmZlY3Q6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgZHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pXG4gICAgICAgIGVhc2luZyA9IGdzLkVhc2luZ3MuZnJvbU9iamVjdChAcGFyYW1zLmVhc2luZylcblxuICAgICAgICBpZiAhZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWQoZmxhZ3Muek9yZGVyKVxuICAgICAgICAgICAgek9yZGVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHpPcmRlciA9IFNjZW5lTWFuYWdlci5zY2VuZS52aWV3cG9ydC56SW5kZXhcblxuICAgICAgICB2aWV3cG9ydCA9IHNjZW5lLnZpZXdwb3J0Q29udGFpbmVyLnN1Yk9iamVjdHMuZmlyc3QgKHYpIC0+IHYuekluZGV4ID09IHpPcmRlclxuXG4gICAgICAgIGlmICF2aWV3cG9ydFxuICAgICAgICAgICAgdmlld3BvcnQgPSBuZXcgZ3MuT2JqZWN0X1ZpZXdwb3J0KClcbiAgICAgICAgICAgIHZpZXdwb3J0LnpJbmRleCA9IHpPcmRlclxuICAgICAgICAgICAgc2NlbmUudmlld3BvcnRDb250YWluZXIuYWRkT2JqZWN0KHZpZXdwb3J0KVxuXG4gICAgICAgIHN3aXRjaCBAcGFyYW1zLnR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIFdvYmJsZVxuICAgICAgICAgICAgICAgIHZpZXdwb3J0LmFuaW1hdG9yLndvYmJsZVRvKEBwYXJhbXMud29iYmxlLnBvd2VyIC8gMTAwMDAsIEBwYXJhbXMud29iYmxlLnNwZWVkIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgICAgIHdvYmJsZSA9IHZpZXdwb3J0LmVmZmVjdHMud29iYmxlXG4gICAgICAgICAgICAgICAgd29iYmxlLmVuYWJsZWQgPSBAcGFyYW1zLndvYmJsZS5wb3dlciA+IDBcbiAgICAgICAgICAgICAgICB3b2JibGUudmVydGljYWwgPSBAcGFyYW1zLndvYmJsZS5vcmllbnRhdGlvbiA9PSAwIG9yIEBwYXJhbXMud29iYmxlLm9yaWVudGF0aW9uID09IDJcbiAgICAgICAgICAgICAgICB3b2JibGUuaG9yaXpvbnRhbCA9IEBwYXJhbXMud29iYmxlLm9yaWVudGF0aW9uID09IDEgb3IgQHBhcmFtcy53b2JibGUub3JpZW50YXRpb24gPT0gMlxuICAgICAgICAgICAgd2hlbiAxICMgQmx1clxuICAgICAgICAgICAgICAgIHZpZXdwb3J0LmFuaW1hdG9yLmJsdXJUbyhAcGFyYW1zLmJsdXIucG93ZXIgLyAxMDAsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICAgICAgdmlld3BvcnQuZWZmZWN0cy5ibHVyLmVuYWJsZWQgPSB5ZXNcbiAgICAgICAgICAgIHdoZW4gMiAjIFBpeGVsYXRlXG4gICAgICAgICAgICAgICAgdmlld3BvcnQuYW5pbWF0b3IucGl4ZWxhdGVUbyhAcGFyYW1zLnBpeGVsYXRlLnNpemUud2lkdGgsIEBwYXJhbXMucGl4ZWxhdGUuc2l6ZS5oZWlnaHQsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICAgICAgdmlld3BvcnQuZWZmZWN0cy5waXhlbGF0ZS5lbmFibGVkID0geWVzXG5cbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgZHVyYXRpb24gIT0gMFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRWaWRlb0RlZmF1bHRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFZpZGVvRGVmYXVsdHM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMudmlkZW9cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5hcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5hcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmRpc2FwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmRpc2FwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSB0aGVuIGRlZmF1bHRzLnpPcmRlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuek9yZGVyKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhcHBlYXJFYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hcHBlYXJFYXNpbmcgPSBAcGFyYW1zLmFwcGVhckVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhcHBlYXJBbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb24gPSBAcGFyYW1zLmFwcGVhckFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJkaXNhcHBlYXJFYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcgPSBAcGFyYW1zLmRpc2FwcGVhckVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJkaXNhcHBlYXJBbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb24gPSBAcGFyYW1zLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJtb3Rpb25CbHVyLmVuYWJsZWRcIl0pIHRoZW4gZGVmYXVsdHMubW90aW9uQmx1ciA9IEBwYXJhbXMubW90aW9uQmx1clxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIGRlZmF1bHRzLm9yaWdpbiA9IEBwYXJhbXMub3JpZ2luXG5cblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNob3dWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTaG93VmlkZW86IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMudmlkZW9cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvcyA9IHNjZW5lLnZpZGVvc1xuICAgICAgICBpZiBub3QgdmlkZW9zW251bWJlcl0/IHRoZW4gdmlkZW9zW251bWJlcl0gPSBuZXcgZ3MuT2JqZWN0X1ZpZGVvKClcblxuICAgICAgICB4ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi54KVxuICAgICAgICB5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5wb3NpdGlvbi55KVxuXG4gICAgICAgIGVhc2luZyA9IGlmICFpc0xvY2tlZChmbGFnc1tcImVhc2luZy50eXBlXCJdKSB0aGVuIGdzLkVhc2luZ3MuZnJvbVZhbHVlcyhAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmVhc2luZy50eXBlKSwgQHBhcmFtcy5lYXNpbmcuaW5PdXQpIGVsc2UgZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KGRlZmF1bHRzLmFwcGVhckVhc2luZylcbiAgICAgICAgZHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZHVyYXRpb24pIHRoZW4gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmR1cmF0aW9uKSBlbHNlIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uXG4gICAgICAgIG9yaWdpbiA9IGlmICFpc0xvY2tlZChmbGFncy5vcmlnaW4pIHRoZW4gQHBhcmFtcy5vcmlnaW4gZWxzZSBkZWZhdWx0cy5vcmlnaW5cbiAgICAgICAgekluZGV4ID0gaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnpPcmRlcikgZWxzZSBkZWZhdWx0cy56T3JkZXJcbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cblxuICAgICAgICB2aWRlbyA9IHZpZGVvc1tudW1iZXJdXG4gICAgICAgIHZpZGVvLmRvbWFpbiA9IEBwYXJhbXMubnVtYmVyRG9tYWluXG4gICAgICAgIHZpZGVvLnZpZGVvID0gQHBhcmFtcy52aWRlbz8ubmFtZVxuICAgICAgICB2aWRlby52aWRlb0ZvbGRlciA9IEBwYXJhbXMudmlkZW8/LmZvbGRlclBhdGhcbiAgICAgICAgdmlkZW8ubG9vcCA9IEBwYXJhbXMubG9vcCA/IHllc1xuICAgICAgICB2aWRlby5kc3RSZWN0LnggPSB4XG4gICAgICAgIHZpZGVvLmRzdFJlY3QueSA9IHlcbiAgICAgICAgdmlkZW8uYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgIHZpZGVvLmFuY2hvci54ID0gaWYgb3JpZ2luID09IDAgdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIHZpZGVvLmFuY2hvci55ID0gaWYgb3JpZ2luID09IDAgdGhlbiAwIGVsc2UgMC41XG4gICAgICAgIHZpZGVvLnpJbmRleCA9IHpJbmRleCB8fCAgKDEwMDAgKyBudW1iZXIpXG4gICAgICAgIGlmIEBwYXJhbXMudmlld3BvcnQ/LnR5cGUgPT0gXCJzY2VuZVwiXG4gICAgICAgICAgICB2aWRlby52aWV3cG9ydCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci52aWV3cG9ydFxuICAgICAgICB2aWRlby51cGRhdGUoKVxuXG4gICAgICAgIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDBcbiAgICAgICAgICAgIHAgPSBAaW50ZXJwcmV0ZXIucHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uKEBwYXJhbXMucHJlZGVmaW5lZFBvc2l0aW9uSWQsIHZpZGVvLCBAcGFyYW1zKVxuICAgICAgICAgICAgdmlkZW8uZHN0UmVjdC54ID0gcC54XG4gICAgICAgICAgICB2aWRlby5kc3RSZWN0LnkgPSBwLnlcblxuICAgICAgICB2aWRlby5hbmltYXRvci5hcHBlYXIoeCwgeSwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uKVxuXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNb3ZlVmlkZW9cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTW92ZVZpZGVvOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHZpZGVvID0gc2NlbmUudmlkZW9zW251bWJlcl1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0KHZpZGVvLCBAcGFyYW1zLnBpY3R1cmUucG9zaXRpb24sIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNb3ZlVmlkZW9QYXRoXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZE1vdmVWaWRlb1BhdGg6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLm1vdmVPYmplY3RQYXRoKHZpZGVvLCBAcGFyYW1zKVxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUm90YXRlVmlkZW9cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUm90YXRlVmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLnJvdGF0ZU9iamVjdCh2aWRlbywgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFpvb21WaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRab29tVmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLnpvb21PYmplY3QodmlkZW8sIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRCbGVuZFZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEJsZW5kVmlkZW86IC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgdmlkZW8gPSBTY2VuZU1hbmFnZXIuc2NlbmUudmlkZW9zW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgaWYgbm90IHZpZGVvPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci5ibGVuZE9iamVjdCh2aWRlbywgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFRpbnRWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRUaW50VmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLnRpbnRPYmplY3QodmlkZW8sIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRGbGFzaFZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEZsYXNoVmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLmZsYXNoT2JqZWN0KHZpZGVvLCBAcGFyYW1zKVxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ3JvcFZpZGVvXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENyb3BWaWRlbzogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVmlkZW9Eb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB2aWRlbyA9IHNjZW5lLnZpZGVvc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB2aWRlbz8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIuY3JvcE9iamVjdCh2aWRlbywgQHBhcmFtcylcblxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVmlkZW9Nb3Rpb25CbHVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFZpZGVvTW90aW9uQmx1cjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVmlkZW9Eb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB2aWRlbyA9IHNjZW5lLnZpZGVvc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB2aWRlbz8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIub2JqZWN0TW90aW9uQmx1cih2aWRlbywgQHBhcmFtcylcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE1hc2tWaWRlb1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRNYXNrVmlkZW86IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLm1hc2tPYmplY3QodmlkZW8sIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRWaWRlb0VmZmVjdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRWaWRlb0VmZmVjdDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVmlkZW9Eb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB2aWRlbyA9IHNjZW5lLnZpZGVvc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB2aWRlbz8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIub2JqZWN0RWZmZWN0KHZpZGVvLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEVyYXNlVmlkZW9cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kRXJhc2VWaWRlbzogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy52aWRlb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdmlkZW8gPSBzY2VuZS52aWRlb3NbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdmlkZW8/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb25cbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb25cblxuICAgICAgICB2aWRlby5hbmltYXRvci5kaXNhcHBlYXIoYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAoc2VuZGVyKSA9PlxuICAgICAgICAgICAgc2VuZGVyLmRpc3Bvc2UoKVxuICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihzZW5kZXIuZG9tYWluKVxuICAgICAgICAgICAgc2NlbmUudmlkZW9zW251bWJlcl0gPSBudWxsXG4gICAgICAgICAgIyAgc2VuZGVyLnZpZGVvLnBhdXNlKClcbiAgICAgICAgKVxuXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaG93SW1hZ2VNYXBcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2hvd0ltYWdlTWFwOiAtPlxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgaW1hZ2VNYXAgPSBTY2VuZU1hbmFnZXIuc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBpbWFnZU1hcFxuICAgICAgICAgICAgaW1hZ2VNYXAuZGlzcG9zZSgpXG4gICAgICAgIGltYWdlTWFwID0gbmV3IGdzLk9iamVjdF9JbWFnZU1hcCgpXG4gICAgICAgIGltYWdlTWFwLnZpc3VhbC52YXJpYWJsZUNvbnRleHQgPSBAaW50ZXJwcmV0ZXIuY29udGV4dFxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUucGljdHVyZXNbbnVtYmVyXSA9IGltYWdlTWFwXG4gICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoQHBhcmFtcy5ncm91bmQpKVxuXG4gICAgICAgIGltYWdlTWFwLmRzdFJlY3Qud2lkdGggPSBiaXRtYXAud2lkdGhcbiAgICAgICAgaW1hZ2VNYXAuZHN0UmVjdC5oZWlnaHQgPSBiaXRtYXAuaGVpZ2h0XG5cbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMFxuICAgICAgICAgICAgcCA9IEBpbnRlcnByZXRlci5wcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24oQHBhcmFtcy5wcmVkZWZpbmVkUG9zaXRpb25JZCwgaW1hZ2VNYXAsIEBwYXJhbXMpXG4gICAgICAgICAgICBpbWFnZU1hcC5kc3RSZWN0LnggPSBwLnhcbiAgICAgICAgICAgIGltYWdlTWFwLmRzdFJlY3QueSA9IHAueVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpbWFnZU1hcC5kc3RSZWN0LnggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLngpXG4gICAgICAgICAgICBpbWFnZU1hcC5kc3RSZWN0LnkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLnkpXG5cbiAgICAgICAgaW1hZ2VNYXAuYW5jaG9yLnggPSBpZiBAcGFyYW1zLm9yaWdpbiA9PSAxIHRoZW4gMC41IGVsc2UgMFxuICAgICAgICBpbWFnZU1hcC5hbmNob3IueSA9IGlmIEBwYXJhbXMub3JpZ2luID09IDEgdGhlbiAwLjUgZWxzZSAwXG4gICAgICAgIGltYWdlTWFwLnpJbmRleCA9IGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpIGVsc2UgKDcwMCArIG51bWJlcilcbiAgICAgICAgaW1hZ2VNYXAuYmxlbmRNb2RlID0gaWYgIWlzTG9ja2VkKGZsYWdzLmJsZW5kTW9kZSkgdGhlbiBAcGFyYW1zLmJsZW5kTW9kZSBlbHNlIDBcbiAgICAgICAgaW1hZ2VNYXAuaG90c3BvdHMgPSBAcGFyYW1zLmhvdHNwb3RzXG4gICAgICAgIGltYWdlTWFwLmltYWdlcyA9IFtcbiAgICAgICAgICAgIEBwYXJhbXMuZ3JvdW5kLFxuICAgICAgICAgICAgQHBhcmFtcy5ob3ZlcixcbiAgICAgICAgICAgIEBwYXJhbXMudW5zZWxlY3RlZCxcbiAgICAgICAgICAgIEBwYXJhbXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICBAcGFyYW1zLnNlbGVjdGVkSG92ZXJcbiAgICAgICAgXVxuXG4gICAgICAgIGltYWdlTWFwLmV2ZW50cy5vbiBcImp1bXBUb1wiLCBncy5DYWxsQmFjayhcIm9uSnVtcFRvXCIsIEBpbnRlcnByZXRlcilcbiAgICAgICAgaW1hZ2VNYXAuZXZlbnRzLm9uIFwiY2FsbENvbW1vbkV2ZW50XCIsIGdzLkNhbGxCYWNrKFwib25DYWxsQ29tbW9uRXZlbnRcIiwgQGludGVycHJldGVyKVxuXG4gICAgICAgIGltYWdlTWFwLnNldHVwKClcbiAgICAgICAgaW1hZ2VNYXAudXBkYXRlKClcblxuICAgICAgICBAaW50ZXJwcmV0ZXIuc2hvd09iamVjdChpbWFnZU1hcCwge3g6MCwgeTowfSwgQHBhcmFtcylcblxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSAwXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG5cbiAgICAgICAgaW1hZ2VNYXAuZXZlbnRzLm9uIFwiZmluaXNoXCIsIChzZW5kZXIpID0+XG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgIyBAaW50ZXJwcmV0ZXIuZXJhc2VPYmplY3Qoc2NlbmUuaW1hZ2VNYXAsIEBwYXJhbXMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRXJhc2VJbWFnZU1hcFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRFcmFzZUltYWdlTWFwOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgaW1hZ2VNYXAgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBpbWFnZU1hcD8gdGhlbiByZXR1cm5cblxuICAgICAgICBpbWFnZU1hcC5ldmVudHMuZW1pdChcImZpbmlzaFwiLCBpbWFnZU1hcClcbiAgICAgICAgaW1hZ2VNYXAudmlzdWFsLmFjdGl2ZSA9IG5vXG4gICAgICAgIEBpbnRlcnByZXRlci5lcmFzZU9iamVjdChpbWFnZU1hcCwgQHBhcmFtcywgKHNlbmRlcikgPT5cbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKHNlbmRlci5kb21haW4pXG4gICAgICAgICAgICAgICAgc2NlbmUucGljdHVyZXNbbnVtYmVyXSA9IG51bGxcbiAgICAgICAgKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEFkZEhvdHNwb3RcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQWRkSG90c3BvdDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlSG90c3BvdERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIGhvdHNwb3RzID0gc2NlbmUuaG90c3BvdHNcblxuICAgICAgICBpZiBub3QgaG90c3BvdHNbbnVtYmVyXT9cbiAgICAgICAgICAgIGhvdHNwb3RzW251bWJlcl0gPSBuZXcgZ3MuT2JqZWN0X0hvdHNwb3QoKVxuXG4gICAgICAgIGhvdHNwb3QgPSBob3RzcG90c1tudW1iZXJdXG4gICAgICAgIGhvdHNwb3QuZG9tYWluID0gQHBhcmFtcy5udW1iZXJEb21haW5cbiAgICAgICAgaG90c3BvdC5kYXRhID0geyBwYXJhbXM6IEBwYXJhbXMsIGJpbmRWYWx1ZTogQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5hY3Rpb25zLm9uRHJhZy5iaW5kVmFsdWUpIH1cblxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5wb3NpdGlvblR5cGVcbiAgICAgICAgICAgIHdoZW4gMCAjIERpcmVjdFxuICAgICAgICAgICAgICAgIGhvdHNwb3QuZHN0UmVjdC54ID0gQHBhcmFtcy5ib3gueFxuICAgICAgICAgICAgICAgIGhvdHNwb3QuZHN0UmVjdC55ID0gQHBhcmFtcy5ib3gueVxuICAgICAgICAgICAgICAgIGhvdHNwb3QuZHN0UmVjdC53aWR0aCA9IEBwYXJhbXMuYm94LnNpemUud2lkdGhcbiAgICAgICAgICAgICAgICBob3RzcG90LmRzdFJlY3QuaGVpZ2h0ID0gQHBhcmFtcy5ib3guc2l6ZS5oZWlnaHRcbiAgICAgICAgICAgIHdoZW4gMSAjIENhbGN1bGF0ZWRcbiAgICAgICAgICAgICAgICBob3RzcG90LmRzdFJlY3QueCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYm94LngpXG4gICAgICAgICAgICAgICAgaG90c3BvdC5kc3RSZWN0LnkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmJveC55KVxuICAgICAgICAgICAgICAgIGhvdHNwb3QuZHN0UmVjdC53aWR0aCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYm94LnNpemUud2lkdGgpXG4gICAgICAgICAgICAgICAgaG90c3BvdC5kc3RSZWN0LmhlaWdodCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYm94LnNpemUuaGVpZ2h0KVxuICAgICAgICAgICAgd2hlbiAyICMgQmluZCB0byBQaWN0dXJlXG4gICAgICAgICAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMucGljdHVyZU51bWJlcildXG4gICAgICAgICAgICAgICAgaWYgcGljdHVyZT9cbiAgICAgICAgICAgICAgICAgICAgaG90c3BvdC50YXJnZXQgPSBwaWN0dXJlXG4gICAgICAgICAgICB3aGVuIDMgIyBCaW5kIHRvIFRleHRcbiAgICAgICAgICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy50ZXh0TnVtYmVyKV1cbiAgICAgICAgICAgICAgICBpZiB0ZXh0P1xuICAgICAgICAgICAgICAgICAgICBob3RzcG90LnRhcmdldCA9IHRleHRcblxuICAgICAgICBob3RzcG90LmJlaGF2aW9yLnNoYXBlID0gQHBhcmFtcy5zaGFwZSA/IGdzLkhvdHNwb3RTaGFwZS5SRUNUQU5HTEVcblxuICAgICAgICBtYWtlSG90c3BvdEltYWdlID0gKGdyYXBoaWMpID0+XG4gICAgICAgICAgICBpZiBncmFwaGljPy5uYW1lXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdyYXBoaWNcbiAgICAgICAgICAgIGVsc2UgaWYgZ3JhcGhpYz9cbiAgICAgICAgICAgICAgICBwYXRoID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoZ3JhcGhpYylcbiAgICAgICAgICAgICAgICBuYW1lID0gcGF0aC5zcGxpdChcIi9cIikubGFzdCgpIHx8IFwiXCJcbiAgICAgICAgICAgICAgICBmb2xkZXIgPSBwYXRoLnNwbGl0KFwiL1wiKS5zbGljZSgwLCAtMSkuam9pbihcIi9cIikgfHwgXCJcIlxuICAgICAgICAgICAgICAgIHJldHVybiB7IG5hbWU6IG5hbWUsIGZvbGRlclBhdGg6IGZvbGRlciB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgdGV4dD9cbiAgICAgICAgICAgIGhvdHNwb3QuaW1hZ2VzID0gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBob3RzcG90LmltYWdlcyA9IFtcbiAgICAgICAgICAgICAgICBtYWtlSG90c3BvdEltYWdlKEBwYXJhbXMuYmFzZUdyYXBoaWMpIHx8IChpZiBwaWN0dXJlPy5pbWFnZSB0aGVuIHsgbmFtZTogcGljdHVyZS5pbWFnZSwgZm9sZGVyUGF0aDogcGljdHVyZS5pbWFnZUZvbGRlciB9IGVsc2UgbnVsbCksXG4gICAgICAgICAgICAgICAgbWFrZUhvdHNwb3RJbWFnZShAcGFyYW1zLmhvdmVyR3JhcGhpYyksXG4gICAgICAgICAgICAgICAgbWFrZUhvdHNwb3RJbWFnZShAcGFyYW1zLnNlbGVjdGVkR3JhcGhpYyksXG4gICAgICAgICAgICAgICAgbWFrZUhvdHNwb3RJbWFnZShAcGFyYW1zLnNlbGVjdGVkSG92ZXJHcmFwaGljKSxcbiAgICAgICAgICAgICAgICBtYWtlSG90c3BvdEltYWdlKEBwYXJhbXMudW5zZWxlY3RlZEdyYXBoaWMpXG4gICAgICAgICAgICBdXG5cblxuICAgICAgICBpZiBAcGFyYW1zLmFjdGlvbnMub25DbGljay50eXBlICE9IDAgb3IgQHBhcmFtcy5hY3Rpb25zLm9uQ2xpY2subGFiZWxcbiAgICAgICAgICAgIGhvdHNwb3QuZXZlbnRzLm9uIFwiY2xpY2tcIiwgZ3MuQ2FsbEJhY2soXCJvbkhvdHNwb3RDbGlja1wiLCBAaW50ZXJwcmV0ZXIsIHsgcGFyYW1zOiBAcGFyYW1zLCBiaW5kVmFsdWU6IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYWN0aW9ucy5vbkNsaWNrLmJpbmRWYWx1ZSkgfSlcbiAgICAgICAgaWYgQHBhcmFtcy5hY3Rpb25zLm9uRW50ZXIudHlwZSAhPSAwIG9yIEBwYXJhbXMuYWN0aW9ucy5vbkVudGVyLmxhYmVsXG4gICAgICAgICAgICBob3RzcG90LmV2ZW50cy5vbiBcImVudGVyXCIsIGdzLkNhbGxCYWNrKFwib25Ib3RzcG90RW50ZXJcIiwgQGludGVycHJldGVyLCB7IHBhcmFtczogQHBhcmFtcywgYmluZFZhbHVlOiBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmFjdGlvbnMub25FbnRlci5iaW5kVmFsdWUpIH0pXG4gICAgICAgIGlmIEBwYXJhbXMuYWN0aW9ucy5vbkxlYXZlLnR5cGUgIT0gMCBvciBAcGFyYW1zLmFjdGlvbnMub25MZWF2ZS5sYWJlbFxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJsZWF2ZVwiLCBncy5DYWxsQmFjayhcIm9uSG90c3BvdExlYXZlXCIsIEBpbnRlcnByZXRlciwgeyBwYXJhbXM6IEBwYXJhbXMsIGJpbmRWYWx1ZTogQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5hY3Rpb25zLm9uTGVhdmUuYmluZFZhbHVlKSB9KVxuICAgICAgICBpZiBAcGFyYW1zLmFjdGlvbnMub25EcmFnLnR5cGUgIT0gMCBvciBAcGFyYW1zLmFjdGlvbnMub25EcmFnLmxhYmVsXG4gICAgICAgICAgICBob3RzcG90LmV2ZW50cy5vbiBcImRyYWdTdGFydFwiLCBncy5DYWxsQmFjayhcIm9uSG90c3BvdERyYWdTdGFydFwiLCBAaW50ZXJwcmV0ZXIsIHsgcGFyYW1zOiBAcGFyYW1zLCBiaW5kVmFsdWU6IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYWN0aW9ucy5vbkRyYWcuYmluZFZhbHVlKSB9KVxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJkcmFnXCIsIGdzLkNhbGxCYWNrKFwib25Ib3RzcG90RHJhZ1wiLCBAaW50ZXJwcmV0ZXIsIHsgcGFyYW1zOiBAcGFyYW1zLCBiaW5kVmFsdWU6IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYWN0aW9ucy5vbkRyYWcuYmluZFZhbHVlKSB9KVxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJkcmFnRW5kXCIsIGdzLkNhbGxCYWNrKFwib25Ib3RzcG90RHJhZ0VuZFwiLCBAaW50ZXJwcmV0ZXIsIHsgcGFyYW1zOiBAcGFyYW1zLCBiaW5kVmFsdWU6IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuYWN0aW9ucy5vbkRyYWcuYmluZFZhbHVlKSB9KVxuICAgICAgICBpZiBAcGFyYW1zLmFjdGlvbnMub25TZWxlY3QudHlwZSAhPSAwIG9yIEBwYXJhbXMuYWN0aW9ucy5vblNlbGVjdC5sYWJlbCBvclxuICAgICAgICAgICBAcGFyYW1zLmFjdGlvbnMub25EZXNlbGVjdC50eXBlICE9IDAgb3IgQHBhcmFtcy5hY3Rpb25zLm9uRGVzZWxlY3QubGFiZWxcbiAgICAgICAgICAgIGhvdHNwb3QuZXZlbnRzLm9uIFwic3RhdGVDaGFuZ2VkXCIsIGdzLkNhbGxCYWNrKFwib25Ib3RzcG90U3RhdGVDaGFuZ2VkXCIsIEBpbnRlcnByZXRlciwgQHBhcmFtcylcbiAgICAgICAgaWYgQHBhcmFtcy5kcmFnZ2luZy5lbmFibGVkXG4gICAgICAgICAgICBob3RzcG90LmV2ZW50cy5vbiBcImRyYWdFbmRcIiwgZ3MuQ2FsbEJhY2soXCJvbkhvdHNwb3REcm9wXCIsIEBpbnRlcnByZXRlciwgeyBwYXJhbXM6IEBwYXJhbXMsIGJpbmRWYWx1ZTogQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5hY3Rpb25zLm9uRHJvcC5iaW5kVmFsdWUpIH0pXG4gICAgICAgIGlmIEBwYXJhbXMuYWN0aW9ucy5vbkRyb3BSZWNlaXZlLnR5cGUgIT0gMCBvciBAcGFyYW1zLmFjdGlvbnMub25Ecm9wUmVjZWl2ZS5sYWJlbFxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJkcm9wUmVjZWl2ZWRcIiwgZ3MuQ2FsbEJhY2soXCJvbkhvdHNwb3REcm9wUmVjZWl2ZWRcIiwgQGludGVycHJldGVyLCB7IHBhcmFtczogQHBhcmFtcywgYmluZFZhbHVlOiBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmFjdGlvbnMub25Ecm9wUmVjZWl2ZS5iaW5kVmFsdWUpIH0pXG5cbiAgICAgICAgaG90c3BvdC5zZWxlY3RhYmxlID0geWVzXG5cblxuICAgICAgICBpZiBAcGFyYW1zLmRyYWdnaW5nLmVuYWJsZWRcbiAgICAgICAgICAgIGRyYWdnaW5nID0gQHBhcmFtcy5kcmFnZ2luZ1xuICAgICAgICAgICAgaG90c3BvdC5kcmFnZ2FibGUgPSB7XG4gICAgICAgICAgICAgICAgcmVjdDogbmV3IFJlY3QoZHJhZ2dpbmcucmVjdC54LCBkcmFnZ2luZy5yZWN0LnksIGRyYWdnaW5nLnJlY3Quc2l6ZS53aWR0aCwgZHJhZ2dpbmcucmVjdC5zaXplLmhlaWdodCksXG4gICAgICAgICAgICAgICAgYXhpc1g6IGRyYWdnaW5nLmhvcml6b250YWwsXG4gICAgICAgICAgICAgICAgYXhpc1k6IGRyYWdnaW5nLnZlcnRpY2FsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBob3RzcG90LmFkZENvbXBvbmVudChuZXcgdWkuQ29tcG9uZW50X0RyYWdnYWJsZSgpKVxuICAgICAgICAgICAgaG90c3BvdC5ldmVudHMub24gXCJkcmFnXCIsIChlKSA9PlxuICAgICAgICAgICAgICAgIGRyYWcgPSBlLnNlbmRlci5kcmFnZ2FibGVcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAaW50ZXJwcmV0ZXIuY29udGV4dClcbiAgICAgICAgICAgICAgICBpZiBAcGFyYW1zLmRyYWdnaW5nLmhvcml6b250YWxcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy5kcmFnZ2luZy52YXJpYWJsZSwgTWF0aC5yb3VuZCgoZS5zZW5kZXIuZHN0UmVjdC54LWRyYWcucmVjdC54KSAvIChkcmFnLnJlY3Qud2lkdGgtZS5zZW5kZXIuZHN0UmVjdC53aWR0aCkgKiAxMDApKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy5kcmFnZ2luZy52YXJpYWJsZSwgTWF0aC5yb3VuZCgoZS5zZW5kZXIuZHN0UmVjdC55LWRyYWcucmVjdC55KSAvIChkcmFnLnJlY3QuaGVpZ2h0LWUuc2VuZGVyLmRzdFJlY3QuaGVpZ2h0KSAqIDEwMCkpXG5cbiAgICAgICAgaG90c3BvdC5zZXR1cCgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlSG90c3BvdFN0YXRlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYW5nZUhvdHNwb3RTdGF0ZTogLT5cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VIb3RzcG90RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgaG90c3BvdCA9IHNjZW5lLmhvdHNwb3RzW251bWJlcl1cbiAgICAgICAgcmV0dXJuIGlmICFob3RzcG90XG5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnNlbGVjdGVkKSB0aGVuIGhvdHNwb3QuYmVoYXZpb3Iuc2VsZWN0ZWQgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zZWxlY3RlZClcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmVuYWJsZWQpIHRoZW4gaG90c3BvdC5iZWhhdmlvci5lbmFibGVkID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuZW5hYmxlZClcblxuICAgICAgICBob3RzcG90LmJlaGF2aW9yLnVwZGF0ZUlucHV0KClcbiAgICAgICAgaG90c3BvdC5iZWhhdmlvci51cGRhdGVJbWFnZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRFcmFzZUhvdHNwb3RcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kRXJhc2VIb3RzcG90OiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VIb3RzcG90RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcblxuICAgICAgICBpZiBzY2VuZS5ob3RzcG90c1tudW1iZXJdP1xuICAgICAgICAgICAgc2NlbmUuaG90c3BvdHNbbnVtYmVyXS5kaXNwb3NlKClcbiAgICAgICAgICAgIHNjZW5lLmhvdHNwb3RDb250YWluZXIuZXJhc2VPYmplY3QobnVtYmVyKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlT2JqZWN0RG9tYWluXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYW5nZU9iamVjdERvbWFpbjogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmNoYW5nZU9iamVjdERvbWFpbihAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmRvbWFpbikpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQaWN0dXJlRGVmYXVsdHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUGljdHVyZURlZmF1bHRzOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLnBpY3R1cmVcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5hcHBlYXJEdXJhdGlvbikgdGhlbiBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5hcHBlYXJEdXJhdGlvbilcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmRpc2FwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmRpc2FwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muek9yZGVyKSB0aGVuIGRlZmF1bHRzLnpPcmRlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuek9yZGVyKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhcHBlYXJFYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hcHBlYXJFYXNpbmcgPSBAcGFyYW1zLmFwcGVhckVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhcHBlYXJBbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb24gPSBAcGFyYW1zLmFwcGVhckFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJkaXNhcHBlYXJFYXNpbmcudHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcgPSBAcGFyYW1zLmRpc2FwcGVhckVhc2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJkaXNhcHBlYXJBbmltYXRpb24udHlwZVwiXSkgdGhlbiBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb24gPSBAcGFyYW1zLmRpc2FwcGVhckFuaW1hdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJtb3Rpb25CbHVyLmVuYWJsZWRcIl0pIHRoZW4gZGVmYXVsdHMubW90aW9uQmx1ciA9IEBwYXJhbXMubW90aW9uQmx1clxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIGRlZmF1bHRzLm9yaWdpbiA9IEBwYXJhbXMub3JpZ2luXG5cblxuICAgIGNyZWF0ZVBpY3R1cmU6IChncmFwaGljLCBwYXJhbXMpIC0+XG4gICAgICAgIGdyYXBoaWMgPSBAc3RyaW5nVmFsdWVPZihncmFwaGljKVxuICAgICAgICBncmFwaGljID0gaWYgdHlwZW9mIGdyYXBoaWMgPT0gXCJzdHJpbmdcIiB0aGVuIHsgbmFtZTogZ3MuUGF0aC5iYXNlbmFtZShncmFwaGljKSwgZm9sZGVyUGF0aDogZ3MuUGF0aC5kaXJuYW1lKGdyYXBoaWMpIH0gZWxzZSBncmFwaGljXG4gICAgICAgIGdyYXBoaWNOYW1lID0gaWYgZ3JhcGhpYz8ubmFtZT8gdGhlbiBncmFwaGljLm5hbWUgZWxzZSBncmFwaGljXG4gICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoZ3JhcGhpYykpXG4gICAgICAgIHJldHVybiBudWxsIGlmIGJpdG1hcCAmJiAhYml0bWFwLmxvYWRlZFxuXG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMucGljdHVyZVxuICAgICAgICBmbGFncyA9IHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgbnVtYmVyID0gQG51bWJlclZhbHVlT2YocGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZXMgPSBzY2VuZS5waWN0dXJlc1xuICAgICAgICBwaWN0dXJlID0gcGljdHVyZXNbbnVtYmVyXVxuXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlP1xuICAgICAgICAgICAgcGljdHVyZSA9IG5ldyBncy5PYmplY3RfUGljdHVyZShudWxsLCBudWxsLCBwYXJhbXMudmlzdWFsPy50eXBlKVxuICAgICAgICAgICAgcGljdHVyZS5kb21haW4gPSBwYXJhbXMubnVtYmVyRG9tYWluXG4gICAgICAgICAgICBwaWN0dXJlc1tudW1iZXJdID0gcGljdHVyZVxuICAgICAgICAgICAgc3dpdGNoIHBhcmFtcy52aXN1YWw/LnR5cGVcbiAgICAgICAgICAgICAgICB3aGVuIDFcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS52aXN1YWwubG9vcGluZy52ZXJ0aWNhbCA9IHllc1xuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLnZpc3VhbC5sb29waW5nLmhvcml6b250YWwgPSB5ZXNcbiAgICAgICAgICAgICAgICB3aGVuIDJcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5mcmFtZVRoaWNrbmVzcyA9IHBhcmFtcy52aXN1YWwuZnJhbWUudGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuZnJhbWVDb3JuZXJTaXplID0gcGFyYW1zLnZpc3VhbC5mcmFtZS5jb3JuZXJTaXplXG4gICAgICAgICAgICAgICAgd2hlbiAzXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUudmlzdWFsLm9yaWVudGF0aW9uID0gcGFyYW1zLnZpc3VhbC50aHJlZVBhcnRJbWFnZS5vcmllbnRhdGlvblxuICAgICAgICAgICAgICAgIHdoZW4gNFxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLmNvbG9yID0gZ3MuQ29sb3IuZnJvbU9iamVjdChwYXJhbXMudmlzdWFsLnF1YWQuY29sb3IpXG4gICAgICAgICAgICAgICAgd2hlbiA1XG4gICAgICAgICAgICAgICAgICAgIHNuYXBzaG90ID0gR3JhcGhpY3Muc25hcHNob3QoKVxuICAgICAgICAgICAgICAgICAgICAjUmVzb3VyY2VNYW5hZ2VyLmFkZEN1c3RvbUJpdG1hcChzbmFwc2hvdClcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5iaXRtYXAgPSBzbmFwc2hvdFxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLmRzdFJlY3Qud2lkdGggPSBzbmFwc2hvdC53aWR0aFxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLmRzdFJlY3QuaGVpZ2h0ID0gc25hcHNob3QuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuc3JjUmVjdC5zZXQoMCwgMCwgc25hcHNob3Qud2lkdGgsIHNuYXBzaG90LmhlaWdodClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGljdHVyZS5iaXRtYXAgPSBudWxsXG5cblxuICAgICAgICB4ID0gQG51bWJlclZhbHVlT2YocGFyYW1zLnBvc2l0aW9uLngpXG4gICAgICAgIHkgPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMucG9zaXRpb24ueSlcbiAgICAgICAgcGljdHVyZSA9IHBpY3R1cmVzW251bWJlcl1cblxuICAgICAgICBpZiAhcGljdHVyZS5iaXRtYXBcbiAgICAgICAgICAgIHBpY3R1cmUuaW1hZ2UgPSBncmFwaGljTmFtZVxuICAgICAgICAgICAgcGljdHVyZS5pbWFnZUZvbGRlciA9IGdyYXBoaWM/LmZvbGRlclBhdGggfHwgXCJHcmFwaGljcy9QaWN0dXJlc1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBpY3R1cmUuaW1hZ2UgPSBudWxsXG5cbiAgICAgICAgYml0bWFwID0gcGljdHVyZS5iaXRtYXAgPyBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGdyYXBoaWMpKVxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQG51bWJlclZhbHVlT2YocGFyYW1zLmVhc2luZy50eXBlKSwgcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAZHVyYXRpb25WYWx1ZU9mKHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICBvcmlnaW4gPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIHBhcmFtcy5vcmlnaW4gZWxzZSBkZWZhdWx0cy5vcmlnaW5cbiAgICAgICAgekluZGV4ID0gaWYgIWlzTG9ja2VkKGZsYWdzLnpPcmRlcikgdGhlbiBAbnVtYmVyVmFsdWVPZihwYXJhbXMuek9yZGVyKSBlbHNlIGRlZmF1bHRzLnpPcmRlclxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uXG5cbiAgICAgICAgcGljdHVyZS5taXJyb3IgPSBwYXJhbXMucG9zaXRpb24uaG9yaXpvbnRhbEZsaXBcbiAgICAgICAgcGljdHVyZS5hbmdsZSA9IHBhcmFtcy5wb3NpdGlvbi5hbmdsZSB8fCAwXG4gICAgICAgIHBpY3R1cmUuem9vbS54ID0gKHBhcmFtcy5wb3NpdGlvbi5kYXRhPy56b29tfHwxKVxuICAgICAgICBwaWN0dXJlLnpvb20ueSA9IChwYXJhbXMucG9zaXRpb24uZGF0YT8uem9vbXx8MSlcbiAgICAgICAgcGljdHVyZS5ibGVuZE1vZGUgPSBAbnVtYmVyVmFsdWVPZihwYXJhbXMuYmxlbmRNb2RlKVxuXG4gICAgICAgIGlmIHBhcmFtcy5vcmlnaW4gPT0gMSBhbmQgYml0bWFwP1xuICAgICAgICAgICAgeCArPSAoYml0bWFwLndpZHRoKnBpY3R1cmUuem9vbS54LWJpdG1hcC53aWR0aCkvMlxuICAgICAgICAgICAgeSArPSAoYml0bWFwLmhlaWdodCpwaWN0dXJlLnpvb20ueS1iaXRtYXAuaGVpZ2h0KS8yXG5cbiAgICAgICAgcGljdHVyZS5kc3RSZWN0LnggPSB4XG4gICAgICAgIHBpY3R1cmUuZHN0UmVjdC55ID0geVxuICAgICAgICBwaWN0dXJlLmFuY2hvci54ID0gaWYgb3JpZ2luID09IDEgdGhlbiAwLjUgZWxzZSAwXG4gICAgICAgIHBpY3R1cmUuYW5jaG9yLnkgPSBpZiBvcmlnaW4gPT0gMSB0aGVuIDAuNSBlbHNlIDBcbiAgICAgICAgcGljdHVyZS56SW5kZXggPSB6SW5kZXggfHwgICg3MDAgKyBudW1iZXIpXG5cbiAgICAgICAgaWYgcGFyYW1zLnZpZXdwb3J0Py50eXBlID09IFwic2NlbmVcIlxuICAgICAgICAgICAgcGljdHVyZS52aWV3cG9ydCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci52aWV3cG9ydFxuXG4gICAgICAgIGlmIHBhcmFtcy5zaXplPy50eXBlID09IDFcbiAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC53aWR0aCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5zaXplLndpZHRoKVxuICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LmhlaWdodCA9IEBudW1iZXJWYWx1ZU9mKHBhcmFtcy5zaXplLmhlaWdodClcblxuICAgICAgICBwaWN0dXJlLnVwZGF0ZSgpXG5cbiAgICAgICAgcmV0dXJuIHBpY3R1cmVcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaG93UGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTaG93UGljdHVyZTogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5waWN0dXJlXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgcGljdHVyZSA9IEBpbnRlcnByZXRlci5jcmVhdGVQaWN0dXJlKEBwYXJhbXMuZ3JhcGhpYywgQHBhcmFtcylcbiAgICAgICAgaWYgIXBpY3R1cmVcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5wb2ludGVyLS1cbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IDFcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGlmIEBwYXJhbXMucG9zaXRpb25UeXBlID09IDBcbiAgICAgICAgICAgIHAgPSBAaW50ZXJwcmV0ZXIucHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uKEBwYXJhbXMucHJlZGVmaW5lZFBvc2l0aW9uSWQsIHBpY3R1cmUsIEBwYXJhbXMpXG4gICAgICAgICAgICBwaWN0dXJlLmRzdFJlY3QueCA9IHAueFxuICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LnkgPSBwLnlcblxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvblxuXG4gICAgICAgIHBpY3R1cmUuYW5pbWF0b3IuYXBwZWFyKHBpY3R1cmUuZHN0UmVjdC54LCBwaWN0dXJlLmRzdFJlY3QueSwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uKVxuXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFBsYXlQaWN0dXJlQW5pbWF0aW9uXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFBsYXlQaWN0dXJlQW5pbWF0aW9uOiAtPlxuICAgICAgICBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuXG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMucGljdHVyZVxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHBpY3R1cmUgPSBudWxsXG5cbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuYXBwZWFyRHVyYXRpb25cbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5hcHBlYXJBbmltYXRpb25cblxuICAgICAgICBpZiBAcGFyYW1zLmFuaW1hdGlvbklkP1xuICAgICAgICAgICAgcmVjb3JkID0gUmVjb3JkTWFuYWdlci5hbmltYXRpb25zW0BwYXJhbXMuYW5pbWF0aW9uSWRdXG4gICAgICAgICAgICBpZiByZWNvcmQ/XG4gICAgICAgICAgICAgICAgcGljdHVyZSA9IEBpbnRlcnByZXRlci5jcmVhdGVQaWN0dXJlKHJlY29yZC5ncmFwaGljLCBAcGFyYW1zKVxuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50ID0gcGljdHVyZS5maW5kQ29tcG9uZW50KFwiQ29tcG9uZW50X0ZyYW1lQW5pbWF0aW9uXCIpXG4gICAgICAgICAgICAgICAgaWYgY29tcG9uZW50P1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQucmVmcmVzaChyZWNvcmQpXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGFydCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBuZXcgZ3MuQ29tcG9uZW50X0ZyYW1lQW5pbWF0aW9uKHJlY29yZClcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5hZGRDb21wb25lbnQoY29tcG9uZW50KVxuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnVwZGF0ZSgpXG5cbiAgICAgICAgICAgICAgICBpZiBAcGFyYW1zLnBvc2l0aW9uVHlwZSA9PSAwXG4gICAgICAgICAgICAgICAgICAgIHAgPSBAaW50ZXJwcmV0ZXIucHJlZGVmaW5lZE9iamVjdFBvc2l0aW9uKEBwYXJhbXMucHJlZGVmaW5lZFBvc2l0aW9uSWQsIHBpY3R1cmUsIEBwYXJhbXMpXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC54ID0gcC54XG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC55ID0gcC55XG5cbiAgICAgICAgICAgICAgICBwaWN0dXJlLmFuaW1hdG9yLmFwcGVhcihwaWN0dXJlLmRzdFJlY3QueCwgcGljdHVyZS5kc3RSZWN0LnksIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbilcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwaWN0dXJlID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnBpY3R1cmVzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgIGFuaW1hdGlvbiA9IHBpY3R1cmU/LmZpbmRDb21wb25lbnQoXCJDb21wb25lbnRfRnJhbWVBbmltYXRpb25cIilcblxuICAgICAgICAgICAgaWYgYW5pbWF0aW9uP1xuICAgICAgICAgICAgICAgIHBpY3R1cmUucmVtb3ZlQ29tcG9uZW50KGFuaW1hdGlvbilcbiAgICAgICAgICAgICAgICBiaXRtYXAgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFwiR3JhcGhpY3MvQW5pbWF0aW9ucy8je3BpY3R1cmUuaW1hZ2V9XCIpXG4gICAgICAgICAgICAgICAgaWYgYml0bWFwP1xuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlLnNyY1JlY3Quc2V0KDAsIDAsIGJpdG1hcC53aWR0aCwgYml0bWFwLmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0LndpZHRoID0gcGljdHVyZS5zcmNSZWN0LndpZHRoXG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC5oZWlnaHQgPSBwaWN0dXJlLnNyY1JlY3QuaGVpZ2h0XG5cbiAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSBkdXJhdGlvblxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTW92ZVBpY3R1cmVQYXRoXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZE1vdmVQaWN0dXJlUGF0aDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0UGF0aChwaWN0dXJlLCBAcGFyYW1zLnBhdGgsIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRNb3ZlUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRNb3ZlUGljdHVyZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0KHBpY3R1cmUsIEBwYXJhbXMucGljdHVyZS5wb3NpdGlvbiwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVGludFBpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kVGludFBpY3R1cmU6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci50aW50T2JqZWN0KHBpY3R1cmUsIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRGbGFzaFBpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kRmxhc2hQaWN0dXJlOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBwaWN0dXJlID0gc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIuZmxhc2hPYmplY3QocGljdHVyZSwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENyb3BQaWN0dXJlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENyb3BQaWN0dXJlOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBwaWN0dXJlID0gc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIuY3JvcE9iamVjdChwaWN0dXJlLCBAcGFyYW1zKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUm90YXRlUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRSb3RhdGVQaWN0dXJlOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICBwaWN0dXJlID0gc2NlbmUucGljdHVyZXNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIucm90YXRlT2JqZWN0KHBpY3R1cmUsIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRab29tUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRab29tUGljdHVyZTogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLnpvb21PYmplY3QocGljdHVyZSwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEJsZW5kUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRCbGVuZFBpY3R1cmU6IC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluIHx8IFwiXCIpXG4gICAgICAgIHBpY3R1cmUgPSBTY2VuZU1hbmFnZXIuc2NlbmUucGljdHVyZXNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICBpZiBub3QgcGljdHVyZT8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIuYmxlbmRPYmplY3QocGljdHVyZSwgQHBhcmFtcylcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaGFrZVBpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2hha2VQaWN0dXJlOiAtPlxuICAgICAgICBwaWN0dXJlID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnBpY3R1cmVzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLnNoYWtlT2JqZWN0KHBpY3R1cmUsIEBwYXJhbXMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTWFza1BpY3R1cmVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTWFza1BpY3R1cmU6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4gfHwgXCJcIilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHBpY3R1cmUgPSBzY2VuZS5waWN0dXJlc1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCBwaWN0dXJlPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci5tYXNrT2JqZWN0KHBpY3R1cmUsIEBwYXJhbXMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQaWN0dXJlTW90aW9uQmx1clxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRQaWN0dXJlTW90aW9uQmx1cjogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLm9iamVjdE1vdGlvbkJsdXIocGljdHVyZSwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFBpY3R1cmVFZmZlY3RcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUGljdHVyZUVmZmVjdDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLm9iamVjdEVmZmVjdChwaWN0dXJlLCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEVyYXNlUGljdHVyZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRFcmFzZVBpY3R1cmU6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMucGljdHVyZVxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbiB8fCBcIlwiKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgcGljdHVyZSA9IHNjZW5lLnBpY3R1cmVzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHBpY3R1cmU/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgZWFzaW5nID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiZWFzaW5nLnR5cGVcIl0pIHRoZW4gZ3MuRWFzaW5ncy5mcm9tVmFsdWVzKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuZWFzaW5nLnR5cGUpLCBAcGFyYW1zLmVhc2luZy5pbk91dCkgZWxzZSBncy5FYXNpbmdzLmZyb21PYmplY3QoZGVmYXVsdHMuZGlzYXBwZWFyRWFzaW5nKVxuICAgICAgICBkdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5kdXJhdGlvbikgdGhlbiBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZHVyYXRpb24pIGVsc2UgZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb25cbiAgICAgICAgYW5pbWF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wiYW5pbWF0aW9uLnR5cGVcIl0pIHRoZW4gQHBhcmFtcy5hbmltYXRpb24gZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJBbmltYXRpb25cblxuICAgICAgICBwaWN0dXJlLmFuaW1hdG9yLmRpc2FwcGVhcihhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sXG4gICAgICAgICAgICAoc2VuZGVyKSA9PlxuICAgICAgICAgICAgICAgIHNlbmRlci5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VQaWN0dXJlRG9tYWluKHNlbmRlci5kb21haW4pXG4gICAgICAgICAgICAgICAgc2NlbmUucGljdHVyZXNbbnVtYmVyXSA9IG51bGxcbiAgICAgICAgKVxuXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kSW5wdXROdW1iZXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kSW5wdXROdW1iZXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgaWYgQGludGVycHJldGVyLmlzUHJvY2Vzc2luZ01lc3NhZ2VJbk90aGVyQ29udGV4dCgpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdEZvck1lc3NhZ2UoKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgaWYgKEdhbWVNYW5hZ2VyLnNldHRpbmdzLmFsbG93Q2hvaWNlU2tpcHx8QGludGVycHJldGVyLnByZXZpZXcpIGFuZCBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IG5vXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIubWVzc2FnZU9iamVjdCgpLmJlaGF2aW9yLmNsZWFyKClcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudmFyaWFibGUsIDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAkdGVtcEZpZWxkcy5kaWdpdHMgPSBAcGFyYW1zLmRpZ2l0c1xuICAgICAgICBzY2VuZS5iZWhhdmlvci5zaG93SW5wdXROdW1iZXIoQHBhcmFtcy5kaWdpdHMsIGdzLkNhbGxCYWNrKFwib25JbnB1dE51bWJlckZpbmlzaFwiLCBAaW50ZXJwcmV0ZXIsIEBwYXJhbXMpKVxuXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0aW5nRm9yLmlucHV0TnVtYmVyID0gQHBhcmFtc1xuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENob2ljZVRpbWVyXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENob2ljZVRpbWVyOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuXG4gICAgICAgIGlmIEBwYXJhbXMuZW5hYmxlZFxuICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3Iuc2hvd0Nob2ljZVRpbWVyKEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMuc2Vjb25kcyksIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubWludXRlcykpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNjZW5lLmNob2ljZVRpbWVyLnN0b3AoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2hvd0Nob2ljZXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2hvd0Nob2ljZXM6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHBvaW50ZXIgPSBAaW50ZXJwcmV0ZXIucG9pbnRlclxuICAgICAgICBjaG9pY2VzID0gc2NlbmUuY2hvaWNlcyB8fCBbXVxuXG4gICAgICAgIGlmIChHYW1lTWFuYWdlci5zZXR0aW5ncy5hbGxvd0Nob2ljZVNraXB8fEBpbnRlcnByZXRlci5wcmV2aWV3RGF0YSkgYW5kIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICBtZXNzYWdlT2JqZWN0ID0gQGludGVycHJldGVyLm1lc3NhZ2VPYmplY3QoKVxuICAgICAgICAgICAgaWYgbWVzc2FnZU9iamVjdD8udmlzaWJsZVxuICAgICAgICAgICAgICAgIG1lc3NhZ2VPYmplY3QuYmVoYXZpb3IuY2xlYXIoKVxuICAgICAgICAgICAgZGVmYXVsdENob2ljZSA9IChjaG9pY2VzLmZpcnN0KChjKSAtPiBjLmlzRGVmYXVsdCkpIHx8IGNob2ljZXNbMF1cbiAgICAgICAgICAgIGlmIGRlZmF1bHRDaG9pY2UuYWN0aW9uLmxhYmVsSW5kZXg/XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnBvaW50ZXIgPSBkZWZhdWx0Q2hvaWNlLmFjdGlvbi5sYWJlbEluZGV4XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLmp1bXBUb0xhYmVsKGRlZmF1bHRDaG9pY2UuYWN0aW9uLmxhYmVsKVxuICAgICAgICAgICAgc2NlbmUuY2hvaWNlcyA9IFtdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIGNob2ljZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5zaG93Q2hvaWNlcyhncy5DYWxsQmFjayhcIm9uQ2hvaWNlQWNjZXB0XCIsIEBpbnRlcnByZXRlciwgeyBwb2ludGVyOiBwb2ludGVyLCBwYXJhbXM6IEBwYXJhbXMgfSkpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTaG93Q2hvaWNlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFNob3dDaG9pY2U6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGNvbW1hbmRzID0gQGludGVycHJldGVyLm9iamVjdC5jb21tYW5kc1xuICAgICAgICBjb21tYW5kID0gbnVsbFxuICAgICAgICBpbmRleCA9IDBcbiAgICAgICAgcG9pbnRlciA9IEBpbnRlcnByZXRlci5wb2ludGVyXG4gICAgICAgIGNob2ljZXMgPSBudWxsXG4gICAgICAgIGRzdFJlY3QgPSBudWxsXG5cbiAgICAgICAgc3dpdGNoIEBwYXJhbXMucG9zaXRpb25UeXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBBdXRvXG4gICAgICAgICAgICAgICAgZHN0UmVjdCA9IG51bGxcbiAgICAgICAgICAgIHdoZW4gMSAjIERpcmVjdFxuICAgICAgICAgICAgICAgIGRzdFJlY3QgPSBuZXcgUmVjdChAcGFyYW1zLmJveC54LCBAcGFyYW1zLmJveC55LCBAcGFyYW1zLmJveC5zaXplLndpZHRoLCBAcGFyYW1zLmJveC5zaXplLmhlaWdodClcblxuICAgICAgICBpZiAhc2NlbmUuY2hvaWNlc1xuICAgICAgICAgICAgc2NlbmUuY2hvaWNlcyA9IFtdXG4gICAgICAgIGNob2ljZXMgPSBzY2VuZS5jaG9pY2VzXG4gICAgICAgIGNob2ljZXMucHVzaCh7XG4gICAgICAgICAgICBkc3RSZWN0OiBkc3RSZWN0LFxuICAgICAgICAgICAgI3RleHQ6IGxjcyhAcGFyYW1zLnRleHQpLFxuICAgICAgICAgICAgaW50ZXJwcmV0ZXI6IEBpbnRlcnByZXRlcixcbiAgICAgICAgICAgIHRleHQ6IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dCksXG4gICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICBhY3Rpb246IEBwYXJhbXMuYWN0aW9uLFxuICAgICAgICAgICAgaXNTZWxlY3RlZDogbm8sXG4gICAgICAgICAgICBpc0RlZmF1bHQ6IEBwYXJhbXMuZGVmYXVsdENob2ljZSxcbiAgICAgICAgICAgIGlzRW5hYmxlZDogQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuZW5hYmxlZCkgfSlcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE9wZW5NZW51XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZE9wZW5NZW51OiAtPlxuICAgICAgICBTY2VuZU1hbmFnZXIuc3dpdGNoVG8obmV3IGdzLk9iamVjdF9MYXlvdXQoXCJtZW51TGF5b3V0XCIpLCB0cnVlKVxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSAxXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE9wZW5Mb2FkTWVudVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRPcGVuTG9hZE1lbnU6IC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXcgZ3MuT2JqZWN0X0xheW91dChcImxvYWRNZW51TGF5b3V0XCIpLCB0cnVlKVxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSAxXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZE9wZW5TYXZlTWVudVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRPcGVuU2F2ZU1lbnU6IC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXcgZ3MuT2JqZWN0X0xheW91dChcInNhdmVNZW51TGF5b3V0XCIpLCB0cnVlKVxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdENvdW50ZXIgPSAxXG4gICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJldHVyblRvVGl0bGVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUmV0dXJuVG9UaXRsZTogLT5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLmNsZWFyKClcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG5ldyBncy5PYmplY3RfTGF5b3V0KFwidGl0bGVMYXlvdXRcIikpXG4gICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IDFcbiAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQbGF5VmlkZW9cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUGxheVZpZGVvOiAtPlxuICAgICAgICBpZiAoR2FtZU1hbmFnZXIuaW5MaXZlUHJldmlldyBvciBHYW1lTWFuYWdlci5zZXR0aW5ncy5hbGxvd1ZpZGVvU2tpcCkgYW5kIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwIHRoZW4gcmV0dXJuXG5cbiAgICAgICAgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgPSBub1xuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuXG4gICAgICAgIGlmIEBwYXJhbXMudmlkZW8/Lm5hbWU/XG4gICAgICAgICAgICBzY2VuZS52aWRlbyA9IFJlc291cmNlTWFuYWdlci5nZXRWaWRlbyhSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChAcGFyYW1zLnZpZGVvKSlcblxuICAgICAgICAgICAgQHZpZGVvU3ByaXRlID0gbmV3IFNwcml0ZShHcmFwaGljcy52aWV3cG9ydClcbiAgICAgICAgICAgIEB2aWRlb1Nwcml0ZS5zcmNSZWN0ID0gbmV3IFJlY3QoMCwgMCwgc2NlbmUudmlkZW8ud2lkdGgsIHNjZW5lLnZpZGVvLmhlaWdodClcbiAgICAgICAgICAgIEB2aWRlb1Nwcml0ZS52aWRlbyA9IHNjZW5lLnZpZGVvXG4gICAgICAgICAgICBAdmlkZW9TcHJpdGUuem9vbVggPSBHcmFwaGljcy53aWR0aCAvIHNjZW5lLnZpZGVvLndpZHRoXG4gICAgICAgICAgICBAdmlkZW9TcHJpdGUuem9vbVkgPSBHcmFwaGljcy5oZWlnaHQgLyBzY2VuZS52aWRlby5oZWlnaHRcbiAgICAgICAgICAgIEB2aWRlb1Nwcml0ZS56ID0gOTk5OTk5OTlcbiAgICAgICAgICAgIHNjZW5lLnZpZGVvLm9uRW5kZWQgPSA9PlxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgIEB2aWRlb1Nwcml0ZS5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICBzY2VuZS52aWRlbyA9IG51bGxcbiAgICAgICAgICAgIHNjZW5lLnZpZGVvLnZvbHVtZSA9IEBwYXJhbXMudm9sdW1lIC8gMTAwXG4gICAgICAgICAgICBzY2VuZS52aWRlby5wbGF5YmFja1JhdGUgPSBAcGFyYW1zLnBsYXliYWNrUmF0ZSAvIDEwMFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgc2NlbmUudmlkZW8ucGxheSgpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEF1ZGlvRGVmYXVsdHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQXVkaW9EZWZhdWx0czogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5hdWRpb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm11c2ljRmFkZUluRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMubXVzaWNGYWRlSW5EdXJhdGlvbiA9IEBwYXJhbXMubXVzaWNGYWRlSW5EdXJhdGlvblxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MubXVzaWNGYWRlT3V0RHVyYXRpb24pIHRoZW4gZGVmYXVsdHMubXVzaWNGYWRlT3V0RHVyYXRpb24gPSBAcGFyYW1zLm11c2ljRmFkZU91dER1cmF0aW9uXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5tdXNpY1ZvbHVtZSkgdGhlbiBkZWZhdWx0cy5tdXNpY1ZvbHVtZSA9IEBwYXJhbXMubXVzaWNWb2x1bWVcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLm11c2ljUGxheWJhY2tSYXRlKSB0aGVuIGRlZmF1bHRzLm11c2ljUGxheWJhY2tSYXRlID0gQHBhcmFtcy5tdXNpY1BsYXliYWNrUmF0ZVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muc291bmRWb2x1bWUpIHRoZW4gZGVmYXVsdHMuc291bmRWb2x1bWUgPSBAcGFyYW1zLnNvdW5kVm9sdW1lXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5zb3VuZFBsYXliYWNrUmF0ZSkgdGhlbiBkZWZhdWx0cy5zb3VuZFBsYXliYWNrUmF0ZSA9IEBwYXJhbXMuc291bmRQbGF5YmFja1JhdGVcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnZvaWNlVm9sdW1lKSB0aGVuIGRlZmF1bHRzLnZvaWNlVm9sdW1lID0gQHBhcmFtcy52b2ljZVZvbHVtZVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Mudm9pY2VQbGF5YmFja1JhdGUpIHRoZW4gZGVmYXVsdHMudm9pY2VQbGF5YmFja1JhdGUgPSBAcGFyYW1zLnZvaWNlUGxheWJhY2tSYXRlXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQbGF5TXVzaWNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUGxheU11c2ljOiAtPlxuICAgICAgICBpZiBub3QgQHBhcmFtcy5tdXNpYz8gdGhlbiByZXR1cm5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5hdWRpb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIG11c2ljID0gbnVsbFxuXG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmJnbUVuYWJsZWRcbiAgICAgICAgICAgIGZhZGVEdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5mYWRlSW5EdXJhdGlvbikgdGhlbiBAcGFyYW1zLmZhZGVJbkR1cmF0aW9uIGVsc2UgZGVmYXVsdHMubXVzaWNGYWRlSW5EdXJhdGlvblxuICAgICAgICAgICAgdm9sdW1lID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wibXVzaWMudm9sdW1lXCJdKSB0aGVuIEBwYXJhbXMubXVzaWMudm9sdW1lIGVsc2UgZGVmYXVsdHMubXVzaWNWb2x1bWVcbiAgICAgICAgICAgIHBsYXliYWNrUmF0ZSA9IGlmICFpc0xvY2tlZChmbGFnc1tcIm11c2ljLnBsYXliYWNrUmF0ZVwiXSkgdGhlbiBAcGFyYW1zLm11c2ljLnBsYXliYWNrUmF0ZSBlbHNlIGRlZmF1bHRzLm11c2ljUGxheWJhY2tSYXRlXG4gICAgICAgICAgICBtdXNpYyA9IHsgbmFtZTogQHBhcmFtcy5tdXNpYy5uYW1lLCBmb2xkZXJQYXRoOiBAcGFyYW1zLm11c2ljLmZvbGRlclBhdGgsIHZvbHVtZTogdm9sdW1lLCBwbGF5YmFja1JhdGU6IHBsYXliYWNrUmF0ZSB9XG4gICAgICAgICAgICBpZiBAcGFyYW1zLnBsYXlUeXBlID09IDFcbiAgICAgICAgICAgICAgICBwbGF5VGltZSA9IG1pbjogQHBhcmFtcy5wbGF5VGltZS5taW4gKiA2MCwgbWF4OiBAcGFyYW1zLnBsYXlUaW1lLm1heCAqIDYwXG4gICAgICAgICAgICAgICAgcGxheVJhbmdlID0gc3RhcnQ6IEBwYXJhbXMucGxheVJhbmdlLnN0YXJ0ICogNjAsIGVuZDogQHBhcmFtcy5wbGF5UmFuZ2UuZW5kICogNjBcbiAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIucGxheU11c2ljUmFuZG9tKG11c2ljLCBmYWRlRHVyYXRpb24sIEBwYXJhbXMubGF5ZXIgfHwgMCwgcGxheVRpbWUsIHBsYXlSYW5nZSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtdXNpYyA9IEF1ZGlvTWFuYWdlci5wbGF5TXVzaWMoQHBhcmFtcy5tdXNpYywgdm9sdW1lLCBwbGF5YmFja1JhdGUsIGZhZGVEdXJhdGlvbiwgQHBhcmFtcy5sYXllciB8fCAwLCBAcGFyYW1zLmxvb3ApXG5cbiAgICAgICAgaWYgbXVzaWMgYW5kIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kICFAcGFyYW1zLmxvb3BcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IE1hdGgucm91bmQobXVzaWMuZHVyYXRpb24gKiBHcmFwaGljcy5mcmFtZVJhdGUpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU3RvcE11c2ljXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFN0b3BNdXNpYzogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5hdWRpb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGZhZGVEdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5mYWRlT3V0RHVyYXRpb24pIHRoZW4gQHBhcmFtcy5mYWRlT3V0RHVyYXRpb24gZWxzZSBkZWZhdWx0cy5tdXNpY0ZhZGVPdXREdXJhdGlvblxuXG4gICAgICAgIEF1ZGlvTWFuYWdlci5zdG9wTXVzaWMoZmFkZUR1cmF0aW9uLCBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKSlcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQYXVzZU11c2ljXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFBhdXNlTXVzaWM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMuYXVkaW9cbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBmYWRlRHVyYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3MuZmFkZU91dER1cmF0aW9uKSB0aGVuIEBwYXJhbXMuZmFkZU91dER1cmF0aW9uIGVsc2UgZGVmYXVsdHMubXVzaWNGYWRlT3V0RHVyYXRpb25cblxuICAgICAgICBBdWRpb01hbmFnZXIuc3RvcE11c2ljKGZhZGVEdXJhdGlvbiwgQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcikpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSZXN1bWVNdXNpY1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRSZXN1bWVNdXNpYzogLT5cbiAgICAgICAgZGVmYXVsdHMgPSBHYW1lTWFuYWdlci5kZWZhdWx0cy5hdWRpb1xuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGZhZGVEdXJhdGlvbiA9IGlmICFpc0xvY2tlZChmbGFncy5mYWRlSW5EdXJhdGlvbikgdGhlbiBAcGFyYW1zLmZhZGVJbkR1cmF0aW9uIGVsc2UgZGVmYXVsdHMubXVzaWNGYWRlSW5EdXJhdGlvblxuXG4gICAgICAgIEF1ZGlvTWFuYWdlci5yZXN1bWVNdXNpYyhmYWRlRHVyYXRpb24sIEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubGF5ZXIpKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQbGF5U291bmRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUGxheVNvdW5kOiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmF1ZGlvXG4gICAgICAgIGZsYWdzID0gQHBhcmFtcy5maWVsZEZsYWdzIHx8IHt9XG4gICAgICAgIGlzTG9ja2VkID0gZ3MuQ29tbWFuZEZpZWxkRmxhZ3MuaXNMb2NrZWRcbiAgICAgICAgc291bmQgPSBudWxsXG4gICAgICAgIGlmIEdhbWVNYW5hZ2VyLnNldHRpbmdzLnNvdW5kRW5hYmxlZCBhbmQgIUdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICB2b2x1bWUgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJzb3VuZC52b2x1bWVcIl0pIHRoZW4gQHBhcmFtcy5zb3VuZC52b2x1bWUgZWxzZSBkZWZhdWx0cy5zb3VuZFZvbHVtZVxuICAgICAgICAgICAgcGxheWJhY2tSYXRlID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wic291bmQucGxheWJhY2tSYXRlXCJdKSB0aGVuIEBwYXJhbXMuc291bmQucGxheWJhY2tSYXRlIGVsc2UgZGVmYXVsdHMuc291bmRQbGF5YmFja1JhdGVcblxuICAgICAgICAgICAgc291bmQgPSBBdWRpb01hbmFnZXIucGxheVNvdW5kKEBwYXJhbXMuc291bmQsIHZvbHVtZSwgcGxheWJhY2tSYXRlLCBAcGFyYW1zLm11c2ljRWZmZWN0LCBudWxsLCBAcGFyYW1zLmxvb3ApXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICAgICBpZiBzb3VuZCBhbmQgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgIUBwYXJhbXMubG9vcFxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gTWF0aC5yb3VuZChzb3VuZC5kdXJhdGlvbiAqIEdyYXBoaWNzLmZyYW1lUmF0ZSlcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTdG9wU291bmRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU3RvcFNvdW5kOiAtPlxuICAgICAgICBBdWRpb01hbmFnZXIuc3RvcFNvdW5kKEBwYXJhbXMuc291bmQubmFtZSlcbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kRW5kQ29tbW9uRXZlbnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kRW5kQ29tbW9uRXZlbnQ6IC0+XG4gICAgICAgIGV2ZW50SWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNvbW1vbkV2ZW50SWQpXG4gICAgICAgIGV2ZW50ID0gR2FtZU1hbmFnZXIuY29tbW9uRXZlbnRzW2V2ZW50SWRdXG4gICAgICAgIGV2ZW50Py5iZWhhdmlvci5zdG9wKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJlc3VtZUNvbW1vbkV2ZW50XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFJlc3VtZUNvbW1vbkV2ZW50OiAtPlxuICAgICAgICBldmVudElkID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jb21tb25FdmVudElkKVxuICAgICAgICBldmVudCA9IEdhbWVNYW5hZ2VyLmNvbW1vbkV2ZW50c1tldmVudElkXVxuICAgICAgICBldmVudD8uYmVoYXZpb3IucmVzdW1lKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENhbGxDb21tb25FdmVudFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDYWxsQ29tbW9uRXZlbnQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIGV2ZW50SWQgPSBudWxsXG5cbiAgICAgICAgaWYgQHBhcmFtcy5jb21tb25FdmVudElkLmluZGV4P1xuICAgICAgICAgICAgZXZlbnRJZCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuY29tbW9uRXZlbnRJZClcbiAgICAgICAgICAgIGxpc3QgPSBAaW50ZXJwcmV0ZXIubGlzdE9iamVjdE9mKEBwYXJhbXMucGFyYW1ldGVycy52YWx1ZXNbMF0pXG4gICAgICAgICAgICBwYXJhbXMgPSB7IHZhbHVlczogbGlzdCB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBhcmFtcyA9IEBwYXJhbXMucGFyYW1ldGVyc1xuICAgICAgICAgICAgZXZlbnRJZCA9IEBwYXJhbXMuY29tbW9uRXZlbnRJZFxuXG4gICAgICAgIEBpbnRlcnByZXRlci5jYWxsQ29tbW9uRXZlbnQoZXZlbnRJZCwgcGFyYW1zKVxuXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VUZXh0U2V0dGluZ3NcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQ2hhbmdlVGV4dFNldHRpbmdzOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dHMgPSBzY2VuZS50ZXh0c1xuICAgICAgICBpZiBub3QgdGV4dHNbbnVtYmVyXT9cbiAgICAgICAgICAgIHRleHRzW251bWJlcl0gPSBuZXcgZ3MuT2JqZWN0X1RleHQoKVxuICAgICAgICAgICAgdGV4dHNbbnVtYmVyXS52aXNpYmxlID0gbm9cblxuXG4gICAgICAgIHRleHRTcHJpdGUgPSB0ZXh0c1tudW1iZXJdXG4gICAgICAgIHBhZGRpbmcgPSB0ZXh0U3ByaXRlLmJlaGF2aW9yLnBhZGRpbmdcbiAgICAgICAgZm9udCA9IHRleHRTcHJpdGUuZm9udFxuICAgICAgICBmb250TmFtZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKHRleHRTcHJpdGUuZm9udC5uYW1lKVxuICAgICAgICBmb250U2l6ZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKHRleHRTcHJpdGUuZm9udC5zaXplKVxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5saW5lU3BhY2luZykgdGhlbiB0ZXh0U3ByaXRlLnRleHRSZW5kZXJlci5saW5lU3BhY2luZyA9IEBwYXJhbXMubGluZVNwYWNpbmcgPyB0ZXh0U3ByaXRlLnRleHRSZW5kZXJlci5saW5lU3BhY2luZ1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZm9udCkgdGhlbiBmb250TmFtZSA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMuZm9udClcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnNpemUpIHRoZW4gZm9udFNpemUgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnNpemUpXG5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmZvbnQpIG9yICFpc0xvY2tlZChmbGFncy5zaXplKVxuICAgICAgICAgICAgdGV4dFNwcml0ZS5mb250ID0gbmV3IEZvbnQoZm9udE5hbWUsIGZvbnRTaXplKVxuXG4gICAgICAgIHBhZGRpbmcubGVmdCA9IGlmICFpc0xvY2tlZChmbGFnc1tcInBhZGRpbmcuMFwiXSkgdGhlbiBAcGFyYW1zLnBhZGRpbmc/WzBdIGVsc2UgcGFkZGluZy5sZWZ0XG4gICAgICAgIHBhZGRpbmcudG9wID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wicGFkZGluZy4xXCJdKSB0aGVuIEBwYXJhbXMucGFkZGluZz9bMV0gZWxzZSBwYWRkaW5nLnRvcFxuICAgICAgICBwYWRkaW5nLnJpZ2h0ID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wicGFkZGluZy4yXCJdKSB0aGVuIEBwYXJhbXMucGFkZGluZz9bMl0gZWxzZSBwYWRkaW5nLnJpZ2h0XG4gICAgICAgIHBhZGRpbmcuYm90dG9tID0gaWYgIWlzTG9ja2VkKGZsYWdzW1wicGFkZGluZy4zXCJdKSB0aGVuIEBwYXJhbXMucGFkZGluZz9bM10gZWxzZSBwYWRkaW5nLmJvdHRvbVxuXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5ib2xkKVxuICAgICAgICAgICAgdGV4dFNwcml0ZS5mb250LmJvbGQgPSBAcGFyYW1zLmJvbGRcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLml0YWxpYylcbiAgICAgICAgICAgIHRleHRTcHJpdGUuZm9udC5pdGFsaWMgPSBAcGFyYW1zLml0YWxpY1xuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3Muc21hbGxDYXBzKVxuICAgICAgICAgICAgdGV4dFNwcml0ZS5mb250LnNtYWxsQ2FwcyA9IEBwYXJhbXMuc21hbGxDYXBzXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy51bmRlcmxpbmUpXG4gICAgICAgICAgICB0ZXh0U3ByaXRlLmZvbnQudW5kZXJsaW5lID0gQHBhcmFtcy51bmRlcmxpbmVcbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLnN0cmlrZVRocm91Z2gpXG4gICAgICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuc3RyaWtlVGhyb3VnaCA9IEBwYXJhbXMuc3RyaWtlVGhyb3VnaFxuXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5jb2xvciA9IGlmICFpc0xvY2tlZChmbGFncy5jb2xvcikgdGhlbiBuZXcgQ29sb3IoQHBhcmFtcy5jb2xvcikgZWxzZSBmb250LmNvbG9yXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5ib3JkZXIgPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3V0bGluZSl0aGVuIEBwYXJhbXMub3V0bGluZSBlbHNlIGZvbnQuYm9yZGVyXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5ib3JkZXJDb2xvciA9IGlmICFpc0xvY2tlZChmbGFncy5vdXRsaW5lQ29sb3IpIHRoZW4gbmV3IENvbG9yKEBwYXJhbXMub3V0bGluZUNvbG9yKSBlbHNlIG5ldyBDb2xvcihmb250LmJvcmRlckNvbG9yKVxuICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuYm9yZGVyU2l6ZSA9IGlmICFpc0xvY2tlZChmbGFncy5vdXRsaW5lU2l6ZSkgdGhlbiBAcGFyYW1zLm91dGxpbmVTaXplIGVsc2UgZm9udC5ib3JkZXJTaXplXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5zaGFkb3cgPSBpZiAhaXNMb2NrZWQoZmxhZ3Muc2hhZG93KXRoZW4gQHBhcmFtcy5zaGFkb3cgZWxzZSBmb250LnNoYWRvd1xuICAgICAgICB0ZXh0U3ByaXRlLmZvbnQuc2hhZG93Q29sb3IgPSBpZiAhaXNMb2NrZWQoZmxhZ3Muc2hhZG93Q29sb3IpIHRoZW4gbmV3IENvbG9yKEBwYXJhbXMuc2hhZG93Q29sb3IpIGVsc2UgbmV3IENvbG9yKGZvbnQuc2hhZG93Q29sb3IpXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5zaGFkb3dPZmZzZXRYID0gaWYgIWlzTG9ja2VkKGZsYWdzLnNoYWRvd09mZnNldFgpIHRoZW4gQHBhcmFtcy5zaGFkb3dPZmZzZXRYIGVsc2UgZm9udC5zaGFkb3dPZmZzZXRYXG4gICAgICAgIHRleHRTcHJpdGUuZm9udC5zaGFkb3dPZmZzZXRZID0gaWYgIWlzTG9ja2VkKGZsYWdzLnNoYWRvd09mZnNldFkpIHRoZW4gQHBhcmFtcy5zaGFkb3dPZmZzZXRZIGVsc2UgZm9udC5zaGFkb3dPZmZzZXRZXG4gICAgICAgIHRleHRTcHJpdGUuYmVoYXZpb3IucmVmcmVzaCgpXG4gICAgICAgIHRleHRTcHJpdGUudXBkYXRlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENoYW5nZVRleHRTZXR0aW5nc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRUZXh0RGVmYXVsdHM6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMudGV4dFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG5cbiAgICAgICAgaWYgIWlzTG9ja2VkKGZsYWdzLmFwcGVhckR1cmF0aW9uKSB0aGVuIGRlZmF1bHRzLmFwcGVhckR1cmF0aW9uID0gQGludGVycHJldGVyLmR1cmF0aW9uVmFsdWVPZihAcGFyYW1zLmFwcGVhckR1cmF0aW9uKVxuICAgICAgICBpZiAhaXNMb2NrZWQoZmxhZ3MuZGlzYXBwZWFyRHVyYXRpb24pIHRoZW4gZGVmYXVsdHMuZGlzYXBwZWFyRHVyYXRpb24gPSBAaW50ZXJwcmV0ZXIuZHVyYXRpb25WYWx1ZU9mKEBwYXJhbXMuZGlzYXBwZWFyRHVyYXRpb24pXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gZGVmYXVsdHMuek9yZGVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFwcGVhckVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFwcGVhckVhc2luZyA9IEBwYXJhbXMuYXBwZWFyRWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImFwcGVhckFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmFwcGVhckFuaW1hdGlvbiA9IEBwYXJhbXMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImRpc2FwcGVhckVhc2luZy50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckVhc2luZyA9IEBwYXJhbXMuZGlzYXBwZWFyRWFzaW5nXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcImRpc2FwcGVhckFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvbiA9IEBwYXJhbXMuZGlzYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFnc1tcIm1vdGlvbkJsdXIuZW5hYmxlZFwiXSkgdGhlbiBkZWZhdWx0cy5tb3Rpb25CbHVyID0gQHBhcmFtcy5tb3Rpb25CbHVyXG4gICAgICAgIGlmICFpc0xvY2tlZChmbGFncy5vcmlnaW4pIHRoZW4gZGVmYXVsdHMub3JpZ2luID0gQHBhcmFtcy5vcmlnaW5cblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNob3dUZXh0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFNob3dUZXh0OiAtPlxuICAgICAgICBkZWZhdWx0cyA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLnRleHRcbiAgICAgICAgZmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cbiAgICAgICAgaXNMb2NrZWQgPSBncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZFxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dCA9IEBwYXJhbXMudGV4dFxuICAgICAgICB0ZXh0cyA9IHNjZW5lLnRleHRzXG4gICAgICAgIGlmIG5vdCB0ZXh0c1tudW1iZXJdPyB0aGVuIHRleHRzW251bWJlcl0gPSBuZXcgZ3MuT2JqZWN0X1RleHQoKVxuXG4gICAgICAgIHggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLngpXG4gICAgICAgIHkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnBvc2l0aW9uLnkpXG4gICAgICAgIHRleHRPYmplY3QgPSB0ZXh0c1tudW1iZXJdXG4gICAgICAgIHRleHRPYmplY3QuZG9tYWluID0gQHBhcmFtcy5udW1iZXJEb21haW5cblxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5hcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5hcHBlYXJEdXJhdGlvblxuICAgICAgICBvcmlnaW4gPSBpZiAhaXNMb2NrZWQoZmxhZ3Mub3JpZ2luKSB0aGVuIEBwYXJhbXMub3JpZ2luIGVsc2UgZGVmYXVsdHMub3JpZ2luXG4gICAgICAgIHpJbmRleCA9IGlmICFpc0xvY2tlZChmbGFncy56T3JkZXIpIHRoZW4gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy56T3JkZXIpIGVsc2UgZGVmYXVsdHMuek9yZGVyXG4gICAgICAgIGFuaW1hdGlvbiA9IGlmICFpc0xvY2tlZChmbGFnc1tcImFuaW1hdGlvbi50eXBlXCJdKSB0aGVuIEBwYXJhbXMuYW5pbWF0aW9uIGVsc2UgZGVmYXVsdHMuYXBwZWFyQW5pbWF0aW9uXG4gICAgICAgIHBvc2l0aW9uQW5jaG9yID0gaWYgIWlzTG9ja2VkKGZsYWdzLnBvc2l0aW9uT3JpZ2luKSB0aGVuIEBpbnRlcnByZXRlci5ncmFwaGljQW5jaG9yUG9pbnRzQnlDb25zdGFudFtAcGFyYW1zLnBvc2l0aW9uT3JpZ2luXSB8fCBuZXcgZ3MuUG9pbnQoMCwgMCkgZWxzZSBAaW50ZXJwcmV0ZXIuZ3JhcGhpY0FuY2hvclBvaW50c0J5Q29uc3RhbnRbZGVmYXVsdHMucG9zaXRpb25PcmlnaW5dXG5cbiAgICAgICAgdGV4dE9iamVjdC50ZXh0ID0gdGV4dFxuICAgICAgICB0ZXh0T2JqZWN0LmRzdFJlY3QueCA9IHhcbiAgICAgICAgdGV4dE9iamVjdC5kc3RSZWN0LnkgPSB5XG4gICAgICAgIHRleHRPYmplY3QuYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5ibGVuZE1vZGUpXG4gICAgICAgIHRleHRPYmplY3QuYW5jaG9yLnggPSBpZiBvcmlnaW4gPT0gMCB0aGVuIDAgZWxzZSAwLjVcbiAgICAgICAgdGV4dE9iamVjdC5hbmNob3IueSA9IGlmIG9yaWdpbiA9PSAwIHRoZW4gMCBlbHNlIDAuNVxuICAgICAgICB0ZXh0T2JqZWN0LnBvc2l0aW9uQW5jaG9yLnggPSBwb3NpdGlvbkFuY2hvci54XG4gICAgICAgIHRleHRPYmplY3QucG9zaXRpb25BbmNob3IueSA9IHBvc2l0aW9uQW5jaG9yLnlcbiAgICAgICAgdGV4dE9iamVjdC56SW5kZXggPSB6SW5kZXggfHwgICg3MDAgKyBudW1iZXIpXG4gICAgICAgIHRleHRPYmplY3Quc2l6ZVRvRml0ID0geWVzXG4gICAgICAgIHRleHRPYmplY3QuZm9ybWF0dGluZyA9IHllc1xuICAgICAgICBpZiBAcGFyYW1zLnZpZXdwb3J0Py50eXBlID09IFwic2NlbmVcIlxuICAgICAgICAgICAgdGV4dE9iamVjdC52aWV3cG9ydCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci52aWV3cG9ydFxuICAgICAgICB0ZXh0T2JqZWN0LnVwZGF0ZSgpXG5cbiAgICAgICAgaWYgQHBhcmFtcy5wb3NpdGlvblR5cGUgPT0gMFxuICAgICAgICAgICAgcCA9IEBpbnRlcnByZXRlci5wcmVkZWZpbmVkT2JqZWN0UG9zaXRpb24oQHBhcmFtcy5wcmVkZWZpbmVkUG9zaXRpb25JZCwgdGV4dE9iamVjdCwgQHBhcmFtcylcbiAgICAgICAgICAgIHRleHRPYmplY3QuZHN0UmVjdC54ID0gcC54XG4gICAgICAgICAgICB0ZXh0T2JqZWN0LmRzdFJlY3QueSA9IHAueVxuXG4gICAgICAgIHRleHRPYmplY3QuYW5pbWF0b3IuYXBwZWFyKHgsIHksIGFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbilcblxuICAgICAgICBpZiBAcGFyYW1zLndhaXRGb3JDb21wbGV0aW9uIGFuZCBub3QgKGR1cmF0aW9uID09IDAgb3IgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKSlcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVGV4dE1vdGlvbkJsdXJcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kVGV4dE1vdGlvbkJsdXI6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdGV4dD8gdGhlbiByZXR1cm5cblxuICAgICAgICB0ZXh0Lm1vdGlvbkJsdXIuc2V0KEBwYXJhbXMubW90aW9uQmx1cilcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFJlZnJlc2hUZXh0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFJlZnJlc2hUZXh0OiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dHMgPSBzY2VuZS50ZXh0c1xuICAgICAgICBpZiBub3QgdGV4dHNbbnVtYmVyXT8gdGhlbiByZXR1cm5cblxuICAgICAgICB0ZXh0c1tudW1iZXJdLmJlaGF2aW9yLnJlZnJlc2goeWVzKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTW92ZVRleHRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kTW92ZVRleHQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdGV4dD8gdGhlbiByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIubW92ZU9iamVjdCh0ZXh0LCBAcGFyYW1zLnBpY3R1cmUucG9zaXRpb24sIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kTW92ZVRleHRQYXRoXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZE1vdmVUZXh0UGF0aDogLT5cbiAgICAgICAgc2NlbmUgPSBTY2VuZU1hbmFnZXIuc2NlbmVcbiAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgbnVtYmVyID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXG4gICAgICAgIHRleHQgPSBzY2VuZS50ZXh0c1tudW1iZXJdXG4gICAgICAgIGlmIG5vdCB0ZXh0PyB0aGVuIHJldHVyblxuXG4gICAgICAgIEBpbnRlcnByZXRlci5tb3ZlT2JqZWN0UGF0aCh0ZXh0LCBAcGFyYW1zLnBhdGgsIEBwYXJhbXMpXG5cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kUm90YXRlVGV4dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRSb3RhdGVUZXh0OiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dCA9IHNjZW5lLnRleHRzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHRleHQ/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLnJvdGF0ZU9iamVjdCh0ZXh0LCBAcGFyYW1zKVxuXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFpvb21UZXh0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFpvb21UZXh0OiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dCA9IHNjZW5lLnRleHRzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHRleHQ/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLnpvb21PYmplY3QodGV4dCwgQHBhcmFtcylcblxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEJsZW5kVGV4dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRCbGVuZFRleHQ6IC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICB0ZXh0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnRleHRzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgaWYgbm90IHRleHQ/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLmJsZW5kT2JqZWN0KHRleHQsIEBwYXJhbXMpXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZENvbG9yVGV4dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRDb2xvclRleHQ6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbbnVtYmVyXVxuICAgICAgICBkdXJhdGlvbiA9IEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbilcbiAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEBwYXJhbXMuZWFzaW5nKVxuXG4gICAgICAgIGlmIHRleHQ/XG4gICAgICAgICAgICB0ZXh0LmFuaW1hdG9yLmNvbG9yVG8obmV3IENvbG9yKEBwYXJhbXMuY29sb3IpLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgaWYgQHBhcmFtcy53YWl0Rm9yQ29tcGxldGlvbiBhbmQgbm90IChkdXJhdGlvbiA9PSAwIG9yIEBpbnRlcnByZXRlci5pc0luc3RhbnRTa2lwKCkpXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci53YWl0Q291bnRlciA9IGR1cmF0aW9uXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZEVyYXNlVGV4dFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRFcmFzZVRleHQ6IC0+XG4gICAgICAgIGRlZmF1bHRzID0gR2FtZU1hbmFnZXIuZGVmYXVsdHMudGV4dFxuICAgICAgICBmbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuICAgICAgICBpc0xvY2tlZCA9IGdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkXG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVRleHREb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgIG51bWJlciA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKVxuICAgICAgICB0ZXh0ID0gc2NlbmUudGV4dHNbbnVtYmVyXVxuICAgICAgICBpZiBub3QgdGV4dD8gdGhlbiByZXR1cm5cblxuICAgICAgICBlYXNpbmcgPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJlYXNpbmcudHlwZVwiXSkgdGhlbiBncy5FYXNpbmdzLmZyb21WYWx1ZXMoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5lYXNpbmcudHlwZSksIEBwYXJhbXMuZWFzaW5nLmluT3V0KSBlbHNlIGdzLkVhc2luZ3MuZnJvbU9iamVjdChkZWZhdWx0cy5kaXNhcHBlYXJFYXNpbmcpXG4gICAgICAgIGR1cmF0aW9uID0gaWYgIWlzTG9ja2VkKGZsYWdzLmR1cmF0aW9uKSB0aGVuIEBpbnRlcnByZXRlci5kdXJhdGlvblZhbHVlT2YoQHBhcmFtcy5kdXJhdGlvbikgZWxzZSBkZWZhdWx0cy5kaXNhcHBlYXJEdXJhdGlvblxuICAgICAgICBhbmltYXRpb24gPSBpZiAhaXNMb2NrZWQoZmxhZ3NbXCJhbmltYXRpb24udHlwZVwiXSkgdGhlbiBAcGFyYW1zLmFuaW1hdGlvbiBlbHNlIGRlZmF1bHRzLmRpc2FwcGVhckFuaW1hdGlvblxuXG5cbiAgICAgICAgdGV4dC5hbmltYXRvci5kaXNhcHBlYXIoYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAoc2VuZGVyKSA9PlxuICAgICAgICAgICAgc2VuZGVyLmRpc3Bvc2UoKVxuICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihzZW5kZXIuZG9tYWluKVxuICAgICAgICAgICAgc2NlbmUudGV4dHNbbnVtYmVyXSA9IG51bGxcbiAgICAgICAgKVxuXG4gICAgICAgIGlmIEBwYXJhbXMud2FpdEZvckNvbXBsZXRpb24gYW5kIG5vdCAoZHVyYXRpb24gPT0gMCBvciBAaW50ZXJwcmV0ZXIuaXNJbnN0YW50U2tpcCgpKVxuICAgICAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgZ3MuR2FtZU5vdGlmaWVyLnBvc3RNaW5vckNoYW5nZSgpXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kVGV4dEVmZmVjdFxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRUZXh0RWZmZWN0OiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBudW1iZXIgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcilcbiAgICAgICAgdGV4dCA9IHNjZW5lLnRleHRzW251bWJlcl1cbiAgICAgICAgaWYgbm90IHRleHQ/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLm9iamVjdEVmZmVjdCh0ZXh0LCBAcGFyYW1zKVxuICAgICAgICBncy5HYW1lTm90aWZpZXIucG9zdE1pbm9yQ2hhbmdlKClcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRJbnB1dFRleHRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kSW5wdXRUZXh0OiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICBpZiAoR2FtZU1hbmFnZXIuc2V0dGluZ3MuYWxsb3dDaG9pY2VTa2lwfHxAaW50ZXJwcmV0ZXIucHJldmlldykgYW5kIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIubWVzc2FnZU9iamVjdCgpLmJlaGF2aW9yLmNsZWFyKClcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRTdHJpbmdWYWx1ZVRvKEBwYXJhbXMudmFyaWFibGUsIFwiXCIpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBAaW50ZXJwcmV0ZXIuaXNXYWl0aW5nID0geWVzXG4gICAgICAgIGlmIEBpbnRlcnByZXRlci5pc1Byb2Nlc3NpbmdNZXNzYWdlSW5PdGhlckNvbnRleHQoKVxuICAgICAgICAgICAgQGludGVycHJldGVyLndhaXRGb3JNZXNzYWdlKClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICR0ZW1wRmllbGRzLmxldHRlcnMgPSBAcGFyYW1zLmxldHRlcnNcbiAgICAgICAgc2NlbmUuYmVoYXZpb3Iuc2hvd0lucHV0VGV4dChAcGFyYW1zLmxldHRlcnMsIGdzLkNhbGxCYWNrKFwib25JbnB1dFRleHRGaW5pc2hcIiwgQGludGVycHJldGVyLCBAaW50ZXJwcmV0ZXIpKVxuICAgICAgICBAaW50ZXJwcmV0ZXIud2FpdGluZ0Zvci5pbnB1dFRleHQgPSBAcGFyYW1zXG4gICAgICAgIGdzLkdhbWVOb3RpZmllci5wb3N0TWlub3JDaGFuZ2UoKVxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNhdmVQZXJzaXN0ZW50RGF0YVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTYXZlUGVyc2lzdGVudERhdGE6IC0+IEdhbWVNYW5hZ2VyLnNhdmVHbG9iYWxEYXRhKClcblxuICAgICMjIypcbiAgICAqIEBtZXRob2QgY29tbWFuZFNhdmVTZXR0aW5nc1xuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTYXZlU2V0dGluZ3M6IC0+IEdhbWVNYW5hZ2VyLnNhdmVTZXR0aW5ncygpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRQcmVwYXJlU2F2ZUdhbWVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUHJlcGFyZVNhdmVHYW1lOiAtPlxuICAgICAgICBpZiBAaW50ZXJwcmV0ZXIucHJldmlld0RhdGE/IHRoZW4gcmV0dXJuXG5cbiAgICAgICAgQGludGVycHJldGVyLnBvaW50ZXIrK1xuICAgICAgICBHYW1lTWFuYWdlci5wcmVwYXJlU2F2ZUdhbWUoQHBhcmFtcy5zbmFwc2hvdClcbiAgICAgICAgQGludGVycHJldGVyLnBvaW50ZXItLVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2F2ZUdhbWVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kU2F2ZUdhbWU6IC0+XG4gICAgICAgIGlmIEBpbnRlcnByZXRlci5wcmV2aWV3RGF0YT8gdGhlbiByZXR1cm5cblxuICAgICAgICB0aHVtYldpZHRoID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy50aHVtYldpZHRoKVxuICAgICAgICB0aHVtYkhlaWdodCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMudGh1bWJIZWlnaHQpXG5cbiAgICAgICAgR2FtZU1hbmFnZXIuc2F2ZShAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLnNsb3QpIC0gMSwgdGh1bWJXaWR0aCwgdGh1bWJIZWlnaHQpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRMb2FkR2FtZVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRMb2FkR2FtZTogLT5cbiAgICAgICAgaWYgQGludGVycHJldGVyLnByZXZpZXdEYXRhPyB0aGVuIHJldHVyblxuXG4gICAgICAgIEdhbWVNYW5hZ2VyLmxvYWQoQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5zbG90KSAtIDEpXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRXYWl0Rm9ySW5wdXRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kV2FpdEZvcklucHV0OiAtPlxuICAgICAgICByZXR1cm4gaWYgQGludGVycHJldGVyLmlzSW5zdGFudFNraXAoKVxuXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VEb3duXCIsIEBpbnRlcnByZXRlci5vYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCBAaW50ZXJwcmV0ZXIub2JqZWN0KVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleURvd25cIiwgQGludGVycHJldGVyLm9iamVjdClcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJrZXlVcFwiLCBAaW50ZXJwcmV0ZXIub2JqZWN0KVxuXG4gICAgICAgIGYgPSA9PlxuICAgICAgICAgICAgcmV0dXJuIGlmIChPYmplY3RNYW5hZ2VyLmN1cnJlbnQ/LmlucHV0U2Vzc2lvbiB8fCAwKSAhPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmlucHV0U2Vzc2lvbiB8fCAwKVxuICAgICAgICAgICAga2V5ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5rZXkpXG4gICAgICAgICAgICBleGVjdXRlQWN0aW9uID0gbm9cbiAgICAgICAgICAgIGlmIElucHV0Lk1vdXNlLmlzQnV0dG9uKEBwYXJhbXMua2V5KVxuICAgICAgICAgICAgICAgIGV4ZWN1dGVBY3Rpb24gPSBJbnB1dC5Nb3VzZS5idXR0b25zW0BwYXJhbXMua2V5XSA9PSBAcGFyYW1zLnN0YXRlXG4gICAgICAgICAgICBlbHNlIGlmIEBwYXJhbXMua2V5ID09IDEwMFxuICAgICAgICAgICAgICAgIGV4ZWN1dGVBY3Rpb24gPSB5ZXMgaWYgSW5wdXQua2V5RG93biBhbmQgQHBhcmFtcy5zdGF0ZSA9PSAxXG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFjdGlvbiA9IHllcyBpZiBJbnB1dC5rZXlVcCBhbmQgQHBhcmFtcy5zdGF0ZSA9PSAyXG4gICAgICAgICAgICBlbHNlIGlmIEBwYXJhbXMua2V5ID09IDEwMVxuICAgICAgICAgICAgICAgIGV4ZWN1dGVBY3Rpb24gPSB5ZXMgaWYgSW5wdXQuTW91c2UuYnV0dG9uRG93biBhbmQgQHBhcmFtcy5zdGF0ZSA9PSAxXG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFjdGlvbiA9IHllcyBpZiBJbnB1dC5Nb3VzZS5idXR0b25VcCBhbmQgQHBhcmFtcy5zdGF0ZSA9PSAyXG4gICAgICAgICAgICBlbHNlIGlmIEBwYXJhbXMua2V5ID09IDEwMlxuICAgICAgICAgICAgICAgIGV4ZWN1dGVBY3Rpb24gPSB5ZXMgaWYgKElucHV0LmtleURvd24gb3IgSW5wdXQuTW91c2UuYnV0dG9uRG93bikgYW5kIEBwYXJhbXMuc3RhdGUgPT0gMVxuICAgICAgICAgICAgICAgIGV4ZWN1dGVBY3Rpb24gPSB5ZXMgaWYgKElucHV0LmtleVVwIG9yIElucHV0Lk1vdXNlLmJ1dHRvblVwKSBhbmQgQHBhcmFtcy5zdGF0ZSA9PSAyXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAga2V5ID0gaWYga2V5ID4gMTAwIHRoZW4ga2V5IC0gMTAwIGVsc2Uga2V5XG4gICAgICAgICAgICAgICAgZXhlY3V0ZUFjdGlvbiA9IElucHV0LmtleXNba2V5XSA9PSBAcGFyYW1zLnN0YXRlXG5cblxuICAgICAgICAgICAgaWYgZXhlY3V0ZUFjdGlvblxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5pc1dhaXRpbmcgPSBub1xuXG4gICAgICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZURvd25cIiwgQGludGVycHJldGVyLm9iamVjdClcbiAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlVXBcIiwgQGludGVycHJldGVyLm9iamVjdClcbiAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleURvd25cIiwgQGludGVycHJldGVyLm9iamVjdClcbiAgICAgICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleVVwXCIsIEBpbnRlcnByZXRlci5vYmplY3QpXG5cbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VEb3duXCIsIGYsIG51bGwsIEBpbnRlcnByZXRlci5vYmplY3RcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VVcFwiLCBmLCBudWxsLCBAaW50ZXJwcmV0ZXIub2JqZWN0XG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vbiBcImtleURvd25cIiwgZiwgbnVsbCwgQGludGVycHJldGVyLm9iamVjdFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJrZXlVcFwiLCBmLCBudWxsLCBAaW50ZXJwcmV0ZXIub2JqZWN0XG5cbiAgICAgICAgQGludGVycHJldGVyLmlzV2FpdGluZyA9IHllc1xuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kR2V0SW5wdXREYXRhXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZEdldElucHV0RGF0YTogLT5cbiAgICAgICAgaWYgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Py5pbnB1dFNlc3Npb24gIT0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5pbnB1dFNlc3Npb24gfHwgMClcbiAgICAgICAgICAgIHJldHVybiBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCAwKVxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5maWVsZFxuICAgICAgICAgICAgd2hlbiAwICMgQnV0dG9uIEFcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LkFdKVxuICAgICAgICAgICAgd2hlbiAxICMgQnV0dG9uIEJcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LkJdKVxuICAgICAgICAgICAgd2hlbiAyICMgQnV0dG9uIFhcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LlhdKVxuICAgICAgICAgICAgd2hlbiAzICMgQnV0dG9uIFlcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LlldKVxuICAgICAgICAgICAgd2hlbiA0ICMgQnV0dG9uIExcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LkxdKVxuICAgICAgICAgICAgd2hlbiA1ICMgQnV0dG9uIFJcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5rZXlzW0lucHV0LlJdKVxuICAgICAgICAgICAgd2hlbiA2ICMgQnV0dG9uIFNUQVJUXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tJbnB1dC5TVEFSVF0pXG4gICAgICAgICAgICB3aGVuIDcgIyBCdXR0b24gU0VMRUNUXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tJbnB1dC5TRUxFQ1RdKVxuICAgICAgICAgICAgd2hlbiA4ICMgTW91c2UgWFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIElucHV0Lk1vdXNlLngpXG4gICAgICAgICAgICB3aGVuIDkgIyBNb3VzZSBZXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQuTW91c2UueSlcbiAgICAgICAgICAgIHdoZW4gMTAgIyBNb3VzZSBXaGVlbFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIElucHV0Lk1vdXNlLndoZWVsKVxuICAgICAgICAgICAgd2hlbiAxMSAjIE1vdXNlIExlZnRcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBJbnB1dC5Nb3VzZS5idXR0b25zW0lucHV0Lk1vdXNlLkxFRlRdKVxuICAgICAgICAgICAgd2hlbiAxMiAjIE1vdXNlIFJpZ2h0XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQuTW91c2UuYnV0dG9uc1tJbnB1dC5Nb3VzZS5SSUdIVF0pXG4gICAgICAgICAgICB3aGVuIDEzICMgTW91c2UgTWlkZGxlXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQuTW91c2UuYnV0dG9uc1tJbnB1dC5Nb3VzZS5NSURETEVdKVxuICAgICAgICAgICAgd2hlbiAxMDAgIyBBbnkgS2V5XG4gICAgICAgICAgICAgICAgYW55S2V5ID0gMFxuICAgICAgICAgICAgICAgIGFueUtleSA9IDEgaWYgSW5wdXQua2V5RG93blxuICAgICAgICAgICAgICAgIGFueUtleSA9IDIgaWYgSW5wdXQua2V5VXBcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBhbnlLZXkpXG4gICAgICAgICAgICB3aGVuIDEwMSAjIEFueSBCdXR0b25cbiAgICAgICAgICAgICAgICBhbnlCdXR0b24gPSAwXG4gICAgICAgICAgICAgICAgYW55QnV0dG9uID0gMSBpZiBJbnB1dC5Nb3VzZS5idXR0b25Eb3duXG4gICAgICAgICAgICAgICAgYW55QnV0dG9uID0gMiBpZiBJbnB1dC5Nb3VzZS5idXR0b25VcFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGFueUJ1dHRvbilcbiAgICAgICAgICAgIHdoZW4gMTAyICMgQW55IElucHV0XG4gICAgICAgICAgICAgICAgYW55SW5wdXQgPSAwXG4gICAgICAgICAgICAgICAgYW55SW5wdXQgPSAxIGlmIElucHV0Lk1vdXNlLmJ1dHRvbkRvd24gb3IgSW5wdXQua2V5RG93blxuICAgICAgICAgICAgICAgIGFueUlucHV0ID0gMiBpZiBJbnB1dC5Nb3VzZS5idXR0b25VcCBvciBJbnB1dC5rZXlVcFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIGFueUlucHV0KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvZGUgPSBAcGFyYW1zLmZpZWxkIC0gMTAwXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgSW5wdXQua2V5c1tjb2RlXSlcbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRHZXRHYW1lRGF0YVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRHZXRHYW1lRGF0YTogLT5cbiAgICAgICAgdGVtcFNldHRpbmdzID0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzXG4gICAgICAgIHNldHRpbmdzID0gR2FtZU1hbmFnZXIuc2V0dGluZ3NcblxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5maWVsZFxuICAgICAgICAgICAgd2hlbiAwICMgU2NlbmUgSURcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBTY2VuZU1hbmFnZXIuc2NlbmUuc2NlbmVEb2N1bWVudC51aWQpXG4gICAgICAgICAgICB3aGVuIDEgIyBHYW1lIFRpbWUgLSBTZWNvbmRzXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgTWF0aC5yb3VuZChHcmFwaGljcy5mcmFtZUNvdW50IC8gNjApKVxuICAgICAgICAgICAgd2hlbiAyICMgR2FtZSBUaW1lIC0gTWludXRlc1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIE1hdGgucm91bmQoR3JhcGhpY3MuZnJhbWVDb3VudCAvIDYwIC8gNjApKVxuICAgICAgICAgICAgd2hlbiAzICMgR2FtZSBUaW1lIC0gSG91cnNcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBNYXRoLnJvdW5kKEdyYXBoaWNzLmZyYW1lQ291bnQgLyA2MCAvIDYwIC8gNjApKVxuICAgICAgICAgICAgd2hlbiA0ICMgRGF0ZSAtIERheSBvZiBNb250aFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG5ldyBEYXRlKCkuZ2V0RGF0ZSgpKVxuICAgICAgICAgICAgd2hlbiA1ICMgRGF0ZSAtIERheSBvZiBXZWVrXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbmV3IERhdGUoKS5nZXREYXkoKSlcbiAgICAgICAgICAgIHdoZW4gNiAjIERhdGUgLSBNb250aFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG5ldyBEYXRlKCkuZ2V0TW9udGgoKSlcbiAgICAgICAgICAgIHdoZW4gNyAjIERhdGUgLSBZZWFyXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpKVxuICAgICAgICAgICAgd2hlbiA4XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmFsbG93U2tpcClcbiAgICAgICAgICAgIHdoZW4gOVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5hbGxvd1NraXBVbnJlYWRNZXNzYWdlcylcbiAgICAgICAgICAgIHdoZW4gMTBcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5tZXNzYWdlU3BlZWQpXG4gICAgICAgICAgICB3aGVuIDExXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmF1dG9NZXNzYWdlLmVuYWJsZWQpXG4gICAgICAgICAgICB3aGVuIDEyXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYXV0b01lc3NhZ2UudGltZSlcbiAgICAgICAgICAgIHdoZW4gMTNcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYXV0b01lc3NhZ2Uud2FpdEZvclZvaWNlKVxuICAgICAgICAgICAgd2hlbiAxNFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5hdXRvTWVzc2FnZS5zdG9wT25BY3Rpb24pXG4gICAgICAgICAgICB3aGVuIDE1XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLnRpbWVNZXNzYWdlVG9Wb2ljZSlcbiAgICAgICAgICAgIHdoZW4gMTZcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYWxsb3dWaWRlb1NraXApXG4gICAgICAgICAgICB3aGVuIDE3XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmFsbG93Q2hvaWNlU2tpcClcbiAgICAgICAgICAgIHdoZW4gMThcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3Muc2tpcFZvaWNlT25BY3Rpb24pXG4gICAgICAgICAgICB3aGVuIDE5XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmZ1bGxTY3JlZW4pXG4gICAgICAgICAgICB3aGVuIDIwXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLmFkanVzdEFzcGVjdFJhdGlvKVxuICAgICAgICAgICAgd2hlbiAyMVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5jb25maXJtYXRpb24pXG4gICAgICAgICAgICB3aGVuIDIyXG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgc2V0dGluZ3MuYmdtVm9sdW1lKVxuICAgICAgICAgICAgd2hlbiAyM1xuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLnZvaWNlVm9sdW1lKVxuICAgICAgICAgICAgd2hlbiAyNFxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLnNlVm9sdW1lKVxuICAgICAgICAgICAgd2hlbiAyNVxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy5iZ21FbmFibGVkKVxuICAgICAgICAgICAgd2hlbiAyNlxuICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBzZXR0aW5ncy52b2ljZUVuYWJsZWQpXG4gICAgICAgICAgICB3aGVuIDI3XG4gICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldEJvb2xlYW5WYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIHNldHRpbmdzLnNlRW5hYmxlZClcbiAgICAgICAgICAgIHdoZW4gMjggIyBMYW5ndWFnZSAtIENvZGVcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBMYW5ndWFnZU1hbmFnZXIubGFuZ3VhZ2U/LmNvZGUgfHwgXCJcIilcbiAgICAgICAgICAgIHdoZW4gMjkgIyBMYW5ndWFnZSAtIE5hbWVcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBMYW5ndWFnZU1hbmFnZXIubGFuZ3VhZ2U/Lm5hbWUgfHwgXCJcIilcbiAgICAgICAgICAgIHdoZW4gMzBcbiAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXApXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTZXRHYW1lRGF0YVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRTZXRHYW1lRGF0YTogLT5cbiAgICAgICAgdGVtcFNldHRpbmdzID0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzXG4gICAgICAgIHNldHRpbmdzID0gR2FtZU1hbmFnZXIuc2V0dGluZ3NcblxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5maWVsZFxuICAgICAgICAgICAgd2hlbiAwXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYWxsb3dTa2lwID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDFcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hbGxvd1NraXBVbnJlYWRNZXNzYWdlcyA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiAyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MubWVzc2FnZVNwZWVkID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5kZWNpbWFsVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDNcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hdXRvTWVzc2FnZS5lbmFibGVkID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDRcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hdXRvTWVzc2FnZS50aW1lID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gNVxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmF1dG9NZXNzYWdlLndhaXRGb3JWb2ljZSA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiA2XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYXV0b01lc3NhZ2Uuc3RvcE9uQWN0aW9uID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDdcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy50aW1lTWVzc2FnZVRvVm9pY2UgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gOFxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmFsbG93VmlkZW9Ta2lwID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDlcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5hbGxvd0Nob2ljZVNraXAgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMTBcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5za2lwVm9pY2VPbkFjdGlvbiA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgd2hlbiAxMVxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmZ1bGxTY3JlZW4gPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgICAgICBpZiBzZXR0aW5ncy5mdWxsU2NyZWVuXG4gICAgICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5iZWhhdmlvci5lbnRlckZ1bGxTY3JlZW4oKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yLmxlYXZlRnVsbFNjcmVlbigpXG4gICAgICAgICAgICB3aGVuIDEyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYWRqdXN0QXNwZWN0UmF0aW8gPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgICAgICBHcmFwaGljcy5rZWVwUmF0aW8gPSAhc2V0dGluZ3MuYWRqdXN0QXNwZWN0UmF0aW9cbiAgICAgICAgICAgICAgICBHcmFwaGljcy5vblJlc2l6ZSgpXG4gICAgICAgICAgICB3aGVuIDEzXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuY29uZmlybWF0aW9uID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDE0XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MuYmdtVm9sdW1lID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMTVcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy52b2ljZVZvbHVtZSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICB3aGVuIDE2XG4gICAgICAgICAgICAgICAgc2V0dGluZ3Muc2VWb2x1bWUgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgd2hlbiAxN1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLmJnbUVuYWJsZWQgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMThcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy52b2ljZUVuYWJsZWQgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMTlcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5zZUVuYWJsZWQgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgIHdoZW4gMjBcbiAgICAgICAgICAgICAgICBjb2RlID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50ZXh0VmFsdWUpXG4gICAgICAgICAgICAgICAgbGFuZ3VhZ2UgPSBMYW5ndWFnZU1hbmFnZXIubGFuZ3VhZ2VzLmZpcnN0IChsKSA9PiBsLmNvZGUgPT0gY29kZVxuICAgICAgICAgICAgICAgIExhbmd1YWdlTWFuYWdlci5zZWxlY3RMYW5ndWFnZShsYW5ndWFnZSkgaWYgbGFuZ3VhZ2VcbiAgICAgICAgICAgIHdoZW4gMjFcbiAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kR2V0T2JqZWN0RGF0YVxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNvbW1hbmRHZXRPYmplY3REYXRhOiAtPlxuICAgICAgICBzY2VuZSA9IFNjZW5lTWFuYWdlci5zY2VuZVxuICAgICAgICBzd2l0Y2ggQHBhcmFtcy5vYmplY3RUeXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBQaWN0dXJlXG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlUGljdHVyZURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUucGljdHVyZXNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICAgICAgd2hlbiAxICMgQmFja2dyb3VuZFxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS5iYWNrZ3JvdW5kc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLmxheWVyKV1cbiAgICAgICAgICAgIHdoZW4gMiAjIFRleHRcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VUZXh0RG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS50ZXh0c1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgICAgICB3aGVuIDMgIyBNb3ZpZVxuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVZpZGVvRG9tYWluKEBwYXJhbXMubnVtYmVyRG9tYWluKVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS52aWRlb3NbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICAgICAgd2hlbiA0ICMgQ2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgY2hhcmFjdGVySWQgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLmNoYXJhY3RlcklkKVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IFNjZW5lTWFuYWdlci5zY2VuZS5jaGFyYWN0ZXJzLmZpcnN0ICh2KSA9PiAhdi5kaXNwb3NlZCBhbmQgdi5yaWQgPT0gY2hhcmFjdGVySWRcbiAgICAgICAgICAgIHdoZW4gNSAjIE1lc3NhZ2UgQm94XG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQoXCJtZXNzYWdlQm94XCIpXG4gICAgICAgICAgICB3aGVuIDYgIyBNZXNzYWdlIEFyZWFcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VNZXNzYWdlQXJlYURvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgICAgICAgICBhcmVhID0gU2NlbmVNYW5hZ2VyLnNjZW5lLm1lc3NhZ2VBcmVhc1tAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlcildXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gYXJlYT8ubGF5b3V0XG4gICAgICAgICAgICB3aGVuIDcgIyBIb3RzcG90XG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlSG90c3BvdERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUuaG90c3BvdHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuXG4gICAgICAgIGZpZWxkID0gQHBhcmFtcy5maWVsZFxuICAgICAgICBpZiBAcGFyYW1zLm9iamVjdFR5cGUgPT0gNCAjIENoYXJhY3RlclxuICAgICAgICAgICAgc3dpdGNoIEBwYXJhbXMuZmllbGRcbiAgICAgICAgICAgICAgICB3aGVuIDAgIyBJRFxuICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNbY2hhcmFjdGVySWRdPy5pbmRleCB8fCBcIlwiKVxuICAgICAgICAgICAgICAgIHdoZW4gMSAjIE5hbWVcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgbGNzKFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1tjaGFyYWN0ZXJJZF0/Lm5hbWUpIHx8IFwiXCIpXG4gICAgICAgICAgICBmaWVsZCAtPSAyXG5cbiAgICAgICAgaWYgb2JqZWN0PyBhbmQgQHBhcmFtcy5vYmplY3RUeXBlID09IDYgIyBNZXNzYWdlXG4gICAgICAgICAgICBzd2l0Y2ggZmllbGRcbiAgICAgICAgICAgICAgICB3aGVuIDAgIyBQb3NpdGlvbiAtIFhcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LmRzdFJlY3QueClcbiAgICAgICAgICAgICAgICB3aGVuIDEgIyBQb3NpdGlvbiAtIFlcbiAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LmRzdFJlY3QueSlcbiAgICAgICAgICAgICAgICB3aGVuIDIgIyBaLUluZGV4XG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC56SW5kZXgpXG4gICAgICAgICAgICAgICAgd2hlbiAzICMgT3BhY2l0eVxuICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3Qub3BhY2l0eSlcbiAgICAgICAgICAgICAgICB3aGVuIDQgIyBWaXNpYmxlXG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QudmlzaWJsZSlcbiAgICAgICAgICAgICAgICB3aGVuIDUgIyBJbnB1dCBTZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5pbnB1dFNlc3Npb24pXG5cbiAgICAgICAgZWxzZSBpZiBvYmplY3Q/XG4gICAgICAgICAgICBpZiBmaWVsZCA+PSAwXG4gICAgICAgICAgICAgICAgc3dpdGNoIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIFJlc291cmNlIE5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCBAcGFyYW1zLm9iamVjdFR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LnRleHQgfHwgXCJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldFN0cmluZ1ZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LnZpZGVvIHx8IFwiXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0U3RyaW5nVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBpZiBvYmplY3QuaW1hZ2UgdGhlbiBcIiN7b2JqZWN0LmltYWdlRm9sZGVyfHxcIlwifS8je29iamVjdC5pbWFnZSB8fCBcIlwifVwiIGVsc2UgXCJcIilcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxICMgUG9zaXRpb24gLSBYXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0TnVtYmVyVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QuZHN0UmVjdC54KVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBQb3NpdGlvbiAtIFlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5kc3RSZWN0LnkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMyAjIEFuY2hvciAtIFhcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIE1hdGgucm91bmQob2JqZWN0LmFuY2hvci54ICogMTAwKSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA0ICMgQW5jaG9yIC0gWVxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgTWF0aC5yb3VuZChvYmplY3QuYW5jaG9yLnkgKiAxMDApKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBab29tIC0gWFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgTWF0aC5yb3VuZChvYmplY3Quem9vbS54ICogMTAwKSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA2ICMgWm9vbSAtIFlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIE1hdGgucm91bmQob2JqZWN0Lnpvb20ueSAqIDEwMCkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNyAjIFNpemUgLSBXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LmRzdFJlY3Qud2lkdGgpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gOCAjIFNpemUgLSBIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5kc3RSZWN0LmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA5ICMgWi1JbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgQGludGVycHJldGVyLnNldE51bWJlclZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0LnpJbmRleClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxMCAjIE9wYWNpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5vcGFjaXR5KVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDExICMgQW5nbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5hbmdsZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxMiAjIFZpc2libGVcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXRCb29sZWFuVmFsdWVUbyhAcGFyYW1zLnRhcmdldFZhcmlhYmxlLCBvYmplY3QudmlzaWJsZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxMyAjIEJsZW5kIE1vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5ibGVuZE1vZGUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTQgIyBGbGlwcGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW50ZXJwcmV0ZXIuc2V0Qm9vbGVhblZhbHVlVG8oQHBhcmFtcy50YXJnZXRWYXJpYWJsZSwgb2JqZWN0Lm1pcnJvcilcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxNSAjIElucHV0IFNlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgICAgIEBpbnRlcnByZXRlci5zZXROdW1iZXJWYWx1ZVRvKEBwYXJhbXMudGFyZ2V0VmFyaWFibGUsIG9iamVjdC5pbnB1dFNlc3Npb24pXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRTZXRPYmplY3REYXRhXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFNldE9iamVjdERhdGE6IC0+XG4gICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG5cbiAgICAgICAgc3dpdGNoIEBwYXJhbXMub2JqZWN0VHlwZVxuICAgICAgICAgICAgd2hlbiAwICMgUGljdHVyZVxuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZVBpY3R1cmVEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLnBpY3R1cmVzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgIHdoZW4gMSAjIEJhY2tncm91bmRcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmFja2dyb3VuZHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5sYXllcildXG4gICAgICAgICAgICB3aGVuIDIgIyBUZXh0XG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlVGV4dERvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUudGV4dHNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICAgICAgd2hlbiAzICMgTW92aWVcbiAgICAgICAgICAgICAgICBzY2VuZS5iZWhhdmlvci5jaGFuZ2VWaWRlb0RvbWFpbihAcGFyYW1zLm51bWJlckRvbWFpbilcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUudmlkZW9zW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cbiAgICAgICAgICAgIHdoZW4gNCAjIENoYXJhY3RlclxuICAgICAgICAgICAgICAgIGNoYXJhY3RlcklkID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy5jaGFyYWN0ZXJJZClcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBTY2VuZU1hbmFnZXIuc2NlbmUuY2hhcmFjdGVycy5maXJzdCAodikgPT4gIXYuZGlzcG9zZWQgYW5kIHYucmlkID09IGNoYXJhY3RlcklkXG4gICAgICAgICAgICB3aGVuIDUgIyBNZXNzYWdlIEJveFxuICAgICAgICAgICAgICAgIG9iamVjdCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RCeUlkKFwibWVzc2FnZUJveFwiKVxuICAgICAgICAgICAgd2hlbiA2ICMgTWVzc2FnZSBBcmVhXG4gICAgICAgICAgICAgICAgc2NlbmUuYmVoYXZpb3IuY2hhbmdlTWVzc2FnZUFyZWFEb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgICAgICAgICAgYXJlYSA9IFNjZW5lTWFuYWdlci5zY2VuZS5tZXNzYWdlQXJlYXNbQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXIpXVxuICAgICAgICAgICAgICAgIG9iamVjdCA9IGFyZWE/LmxheW91dFxuICAgICAgICAgICAgd2hlbiA3ICMgSG90c3BvdFxuICAgICAgICAgICAgICAgIHNjZW5lLmJlaGF2aW9yLmNoYW5nZUhvdHNwb3REb21haW4oQHBhcmFtcy5udW1iZXJEb21haW4pXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmhvdHNwb3RzW0BpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyKV1cblxuICAgICAgICBcbiAgICAgICAgZmllbGQgPSBAcGFyYW1zLmZpZWxkXG4gICAgICAgIGlmIEBwYXJhbXMub2JqZWN0VHlwZSA9PSA0ICMgQ2hhcmFjdGVyXG4gICAgICAgICAgICBzd2l0Y2ggZmllbGRcbiAgICAgICAgICAgICAgICB3aGVuIDAgIyBOYW1lXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBAaW50ZXJwcmV0ZXIuc3RyaW5nVmFsdWVPZihAcGFyYW1zLnRleHRWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqZWN0P1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0Lm5hbWUgPSBuYW1lXG4gICAgICAgICAgICAgICAgICAgIFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1tjaGFyYWN0ZXJJZF0/Lm5hbWUgPSBuYW1lXG4gICAgICAgICAgICBmaWVsZC0tXG5cbiAgICAgICAgaWYgb2JqZWN0PyBhbmQgQHBhcmFtcy5vYmplY3RUeXBlID09IDYgIyBNZXNzYWdlXG4gICAgICAgICAgICBzd2l0Y2ggZmllbGRcbiAgICAgICAgICAgICAgICB3aGVuIDAgIyBQb3NpdGlvbiAtIFhcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRzdFJlY3QueCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICAgICAgd2hlbiAxICMgUG9zaXRpb24gLSBZXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgIHdoZW4gMiAjIFotSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnpJbmRleCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICAgICAgd2hlbiAzICMgT3BhY2l0eVxuICAgICAgICAgICAgICAgICAgICBvYmplY3Qub3BhY2l0eSA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICAgICAgd2hlbiA0ICMgVmlzaWJsZVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QudmlzaWJsZSA9IEBpbnRlcnByZXRlci5ib29sZWFuVmFsdWVPZihAcGFyYW1zLnN3aXRjaFZhbHVlKVxuICAgICAgICAgICAgICAgIHdoZW4gNSAjIElucHV0IFNlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmlucHV0U2Vzc2lvbiA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG5cbiAgICAgICAgZWxzZSBpZiBvYmplY3Q/XG4gICAgICAgICAgICBpZiBmaWVsZCA+PSAwXG4gICAgICAgICAgICAgICAgc3dpdGNoIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMCAjIFJlc291cmNlIE5hbWUgLyBUZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggQHBhcmFtcy5vYmplY3RUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC50ZXh0ID0gQGludGVycHJldGVyLnN0cmluZ1ZhbHVlT2YoQHBhcmFtcy50ZXh0VmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC52aWRlbyA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IEBpbnRlcnByZXRlci5zdHJpbmdWYWx1ZU9mKEBwYXJhbXMudGV4dFZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuaW1hZ2UgPSBwYXRoLnNwbGl0KFwiL1wiKS5sYXN0KCkgfHwgXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmltYWdlRm9sZGVyID0gcGF0aC5zcGxpdChcIi9cIikuc2xpY2UoMCwgLTEpLmpvaW4oXCIvXCIpIHx8IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmltYWdlID0gXCJcIlxuICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBQb3NpdGlvbiAtIFhcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBQb3NpdGlvbiAtIFlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDMgIyBBbmNob3IgLSBYXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuYW5jaG9yLnggPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDQgIyBBbmNob3IgLSBZXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuYW5jaG9yLnkgPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICB3aGVuIDUgIyBab29tIC0gWFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0Lnpvb20ueCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpIC8gMTAwXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gNiAjIFpvb20gLSBZXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Quem9vbS55ID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSkgLyAxMDBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiA3ICMgWi1JbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnpJbmRleCA9IEBpbnRlcnByZXRlci5udW1iZXJWYWx1ZU9mKEBwYXJhbXMubnVtYmVyVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gOCAjIE9wYWNpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5vcGFjaXR5PSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB3aGVuIDkgIyBBbmdsZVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmFuZ2xlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxMCAjIFZpc2libGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC52aXNpYmxlID0gQGludGVycHJldGVyLmJvb2xlYW5WYWx1ZU9mKEBwYXJhbXMuc3dpdGNoVmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gMTEgIyBCbGVuZCBNb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuYmxlbmRNb2RlID0gQGludGVycHJldGVyLm51bWJlclZhbHVlT2YoQHBhcmFtcy5udW1iZXJWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxMiAjIEZsaXBwZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5taXJyb3IgPSBAaW50ZXJwcmV0ZXIuYm9vbGVhblZhbHVlT2YoQHBhcmFtcy5zd2l0Y2hWYWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAxMyAjIElucHV0IFNlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5pbnB1dFNlc3Npb24gPSBAaW50ZXJwcmV0ZXIubnVtYmVyVmFsdWVPZihAcGFyYW1zLm51bWJlclZhbHVlKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlU291bmRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYW5nZVNvdW5kczogLT5cbiAgICAgICAgc291bmRzID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0uc291bmRzXG4gICAgICAgIGZpZWxkRmxhZ3MgPSBAcGFyYW1zLmZpZWxkRmxhZ3MgfHwge31cblxuICAgICAgICBmb3Igc291bmQsIGkgaW4gQHBhcmFtcy5zb3VuZHNcbiAgICAgICAgICAgIGlmICFncy5Db21tYW5kRmllbGRGbGFncy5pc0xvY2tlZChmaWVsZEZsYWdzW1wic291bmRzLlwiK2ldKVxuICAgICAgICAgICAgICAgIHNvdW5kc1tpXSA9IEBwYXJhbXMuc291bmRzW2ldXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRDaGFuZ2VDb2xvcnNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kQ2hhbmdlQ29sb3JzOiAtPlxuICAgICAgICBjb2xvcnMgPSBSZWNvcmRNYW5hZ2VyLnN5c3RlbS5jb2xvcnNcbiAgICAgICAgZmllbGRGbGFncyA9IEBwYXJhbXMuZmllbGRGbGFncyB8fCB7fVxuXG4gICAgICAgIGZvciBjb2xvciwgaSBpbiBAcGFyYW1zLmNvbG9yc1xuICAgICAgICAgICAgaWYgIWdzLkNvbW1hbmRGaWVsZEZsYWdzLmlzTG9ja2VkKGZpZWxkRmxhZ3NbXCJjb2xvcnMuXCIraV0pXG4gICAgICAgICAgICAgICAgY29sb3JzW2ldID0gbmV3IGdzLkNvbG9yKEBwYXJhbXMuY29sb3JzW2ldKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kQ2hhbmdlU2NyZWVuQ3Vyc29yXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZENoYW5nZVNjcmVlbkN1cnNvcjogLT5cbiAgICAgICAgaWYgQHBhcmFtcy5ncmFwaGljPy5uYW1lP1xuICAgICAgICAgICAgYml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIiN7QHBhcmFtcy5ncmFwaGljPy5mb2xkZXJQYXRoID8gXCJHcmFwaGljcy9QaWN0dXJlc1wifS8je0BwYXJhbXMuZ3JhcGhpYy5uYW1lfVwiKVxuICAgICAgICAgICAgR3JhcGhpY3Muc2V0Q3Vyc29yQml0bWFwKGJpdG1hcCwgQHBhcmFtcy5oeCwgQHBhcmFtcy5oeSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgR3JhcGhpY3Muc2V0Q3Vyc29yQml0bWFwKG51bGwsIDAsIDApXG5cbiAgICAjIyMqXG4gICAgKiBAbWV0aG9kIGNvbW1hbmRSZXNldEdsb2JhbERhdGFcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBjb21tYW5kUmVzZXRHbG9iYWxEYXRhOiAtPlxuICAgICAgICBHYW1lTWFuYWdlci5yZXNldEdsb2JhbERhdGEoKVxuXG4gICAgIyMjKlxuICAgICogQG1ldGhvZCBjb21tYW5kU2NyaXB0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgY29tbWFuZFNjcmlwdDogLT5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBpZiAhQHBhcmFtcy5zY3JpcHRGdW5jXG4gICAgICAgICAgICAgICAgQHBhcmFtcy5zY3JpcHRGdW5jID0gZXZhbChcIihmdW5jdGlvbigpe1wiICsgQHBhcmFtcy5zY3JpcHQgKyBcIn0pXCIpXG5cbiAgICAgICAgICAgIEBwYXJhbXMuc2NyaXB0RnVuYygpXG4gICAgICAgIGNhdGNoIGV4XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhleClcblxud2luZG93LkNvbW1hbmRJbnRlcnByZXRlciA9IENvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXJcbmdzLkNvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXIgPSBDb21wb25lbnRfQ29tbWFuZEludGVycHJldGVyXG5cblxuIl19
//# sourceURL=Component_CommandInterpreter_1.js