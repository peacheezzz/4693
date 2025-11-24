var Component_MessageTextRenderer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_MessageTextRenderer = (function(superClass) {
  extend(Component_MessageTextRenderer, superClass);

  Component_MessageTextRenderer.objectCodecBlackList = ["onLinkClick", "onBatchDisappear"];


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  *
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_MessageTextRenderer.prototype.onDataBundleRestore = function(data, context) {
    var bitmap, customObject, j, l, lastLine, len, len1, len2, line, lineWidth, m, message, n, ref, ref1, ref2;
    this.setupEventHandlers();
    l = 0;
    lastLine = null;
    ref = this.object.messages;
    for (j = 0, len = ref.length; j < len; j++) {
      message = ref[j];
      if (this.object.settings.useCharacterColor) {
        this.object.font.color = new gs.Color(message.character.textColor);
      }
      lineWidth = this.isRunningInMultiPartMode() ? (lastLine != null ? lastLine.width : void 0) || 0 : 0;
      this.lines = this.calculateLines(lcsm(message.text), true, lineWidth);
      ref1 = this.lines;
      for (m = 0, len1 = ref1.length; m < len1; m++) {
        line = ref1[m];
        bitmap = this.createBitmap(line);
        if (line === this.line) {
          this.drawLineContent(line, bitmap, this.charIndex + 1);
        } else {
          this.drawLineContent(line, bitmap, -1);
        }
        this.allSprites[l].bitmap = bitmap;
        lastLine = line;
        l++;
      }
    }
    ref2 = this.customObjects;
    for (n = 0, len2 = ref2.length; n < len2; n++) {
      customObject = ref2[n];
      SceneManager.scene.addObject(customObject);
    }
    return null;
  };


  /**
  *  A text-renderer component to render an animated and interactive message text using
  *  dimensions of the game object's destination-rectangle. The message is displayed
  *  using a sprite for each line instead of drawing to the game object's bitmap object.
  *
  *  @module gs
  *  @class Component_MessageTextRenderer
  *  @extends gs.Component_TextRenderer
  *  @memberof gs
  *  @constructor
   */

  function Component_MessageTextRenderer() {
    Component_MessageTextRenderer.__super__.constructor.apply(this, arguments);

    /**
    * An array containing all sprites of the current message.
    * @property sprites
    * @type gs.Sprite[]
    * @protected
     */
    this.sprites = [];

    /**
    * An array containing all sprites of all messages. In NVL mode
    * a page can contain multiple messages.
    * @property allSprites
    * @type gs.Sprite[]
    * @protected
     */
    this.allSprites = [];

    /**
    * An array containing all line-objects of the current message.
    * @property lines
    * @type gs.TextRendererLine[]
    * @readOnly
     */
    this.lines = null;

    /**
    * The line currently rendered.
    * @property line
    * @type number
    * @readOnly
     */
    this.line = 0;

    /**
    * The left and right padding per line.
    * @property padding
    * @type number
     */
    this.padding = 6;

    /**
    * The minimum height of the line currently rendered. If 0, the measured
    * height of the line will be used.
    * @property minLineHeight
    * @type number
     */
    this.minLineHeight = 0;

    /**
    * The spacing between text lines in pixels.
    * @property lineSpacing
    * @type number
     */
    this.lineSpacing = 2;

    /**
    * The line currently rendered.
    * @property currentLine
    * @type number
    * @protected
     */
    this.currentLine = 0;

    /**
    * The height of the line currently rendered.
    * @property currentLineHeight
    * @type number
    * @protected
     */
    this.currentLineHeight = 0;

    /**
    * Index of the current character to draw.
    * @property charIndex
    * @type number
    * @readOnly
     */
    this.charIndex = 0;

    /**
    * Position of the message caret. The caret is like an invisible
    * cursor pointing to the x/y coordinates of the last rendered character of
    * the message. That position can be used to display a waiting- or processing-animation for example.
    * @property caretPosition
    * @type gs.Point
    * @readOnly
     */
    this.caretPosition = new gs.Point();

    /**
    * Indicates that the a message is currently in progress.
    * @property isRunning
    * @type boolean
    * @readOnly
     */
    this.isRunning = false;

    /**
    * The current x-coordinate of the caret/cursor.
    * @property currentX
    * @type number
    * @readOnly
     */
    this.currentX = 0;

    /**
    * The current y-coordinate of the caret/cursor.
    * @property currentY
    * @type number
    * @readOnly
     */
    this.currentY = 0;

    /**
    * The current sprites used to display the current text-line/part.
    * @property currentSprite
    * @type gs.Sprite
    * @readOnly
     */
    this.currentSprite = null;

    /**
    * Indicates if the message-renderer is currently waiting like for a user-action.
    * @property isWaiting
    * @type boolean
    * @readOnly
     */
    this.isWaiting = false;

    /**
    * Indicates if the message-renderer is currently waiting for a key-press or mouse/touch action.
    * @property waitForKey
    * @type boolean
    * @readOnly
     */
    this.waitForKey = false;

    /**
    * Number of frames the message-renderer should wait before continue.
    * @property waitCounter
    * @type number
     */
    this.waitCounter = 0;

    /**
    * Speed of the message-drawing. The smaller the value, the faster the message is displayed.
    * @property speed
    * @type number
     */
    this.speed = 1;

    /**
    * Indicates if the message should be rendered immedialtely without any animation or delay.
    * @property drawImmediately
    * @type boolean
     */
    this.drawImmediately = false;

    /**
    * Indicates if the message should wait for a user-action or a certain amount of time
    * before finishing.
    * @property waitAtEnd
    * @type boolean
     */
    this.waitAtEnd = true;

    /**
    * The number of frames to wait before finishing a message.
    * before finishing.
    * @property waitAtEndTime
    * @type number
     */
    this.waitAtEndTime = 0;

    /**
    * Indicates if auto word-wrap should be used. Default is <b>true</b>
    * @property wordWrap
    * @type boolean
     */
    this.wordWrap = true;

    /**
    * Custom game objects which are alive until the current message is erased. Can be used to display
    * animated icons, etc.
    * @property customObjects
    * @type gs.Object_Base[]
     */
    this.customObjects = [];

    /**
    * A hashtable/dictionary object to store custom-data useful like for token-processing. The data must be
    * serializable.
    * @property customObjects
    * @type Object
     */
    this.customData = {};

    /**
    * A callback function called if the player clicks on a non-stylable link (LK text-code) to trigger
    * the specified common event.
    * @property onLinkClick
    * @type Function
     */
    this.onLinkClick = function(e) {
      var event, eventId;
      eventId = e.data.linkData.commonEventId;
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
      if (!event) {
        return SceneManager.scene.interpreter.jumpToLabel(eventId);
      } else {
        return SceneManager.scene.interpreter.callCommonEvent(eventId, null, true);
      }
    };

    /**
    * A callback function called if a batched messsage has been faded out. It triggers the execution of
    * the next message.
    * @property onBatchDisappear
    * @type Function
     */
    this.onBatchDisappear = (function(_this) {
      return function(e) {
        _this.drawImmediately = false;
        _this.isWaiting = false;
        _this.object.opacity = 255;
        return _this.executeBatch();
      };
    })(this);
  }


  /**
  * Serializes the message text-renderer into a data-bundle.
  * @method toDataBundle
  * @return {Object} A data-bundle.
   */

  Component_MessageTextRenderer.prototype.toDataBundle = function() {
    var bundle, ignore, k;
    ignore = ["object", "font", "sprites", "allSprites", "currentSprite", "currentX"];
    bundle = {
      currentSpriteIndex: this.sprites.indexOf(this.currentSprite)
    };
    for (k in this) {
      if (ignore.indexOf(k) === -1) {
        bundle[k] = this[k];
      }
    }
    return bundle;
  };


  /**
  * Disposes the message text-renderer and all sprites used to display
  * the message.
  * @method dispose
   */

  Component_MessageTextRenderer.prototype.dispose = function() {
    var j, len, ref, ref1, results, sprite;
    Component_MessageTextRenderer.__super__.dispose.apply(this, arguments);
    this.disposeEventHandlers();
    ref = this.allSprites;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      sprite = ref[j];
      if ((ref1 = sprite.bitmap) != null) {
        ref1.dispose();
      }
      results.push(sprite.dispose());
    }
    return results;
  };


  /**
  * Removes all attached event handlers
  * the message.
  * @method disposeEventHandlers
   */

  Component_MessageTextRenderer.prototype.disposeEventHandlers = function() {
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    return gs.GlobalEventManager.offByOwner("keyUp", this.object);
  };


  /**
  * Adds event-handlers for mouse/touch events
  *
  * @method setupEventHandlers
   */

  Component_MessageTextRenderer.prototype.setupEventHandlers = function() {
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    gs.GlobalEventManager.offByOwner("keyUp", this.object);
    gs.GlobalEventManager.on("mouseUp", ((function(_this) {
      return function(e) {
        if (!_this.object.canReceiveInput()) {
          return;
        }
        if (_this.object.findComponentByName("animation") || (GameManager.settings.autoMessage.enabled && !GameManager.settings.autoMessage.stopOnAction)) {
          return;
        }
        if (Input.Mouse.buttons[Input.Mouse.LEFT] !== 2) {
          return;
        }
        if (_this.isWaiting && !(_this.waitCounter > 0 || _this.waitForKey)) {
          e.breakChain = true;
          _this["continue"]();
        } else {
          e.breakChain = _this.isRunning;
          _this.drawImmediately = !_this.waitForKey;
          _this.waitCounter = 0;
          _this.waitForKey = false;
          _this.isWaiting = false;
        }
        if (_this.waitForKey) {
          if (Input.Mouse.buttons[Input.Mouse.LEFT] === 2) {
            e.breakChain = true;
            Input.clear();
            _this.waitForKey = false;
            return _this.isWaiting = false;
          }
        }
      };
    })(this)), null, this.object);
    return gs.GlobalEventManager.on("keyUp", ((function(_this) {
      return function(e) {
        if (!_this.object.canReceiveInput()) {
          return;
        }
        if (Input.keys[Input.C] && (!_this.isWaiting || (_this.waitCounter > 0 || _this.waitForKey))) {
          _this.drawImmediately = !_this.waitForKey;
          _this.waitCounter = 0;
          _this.waitForKey = false;
          _this.isWaiting = false;
        }
        if (_this.isWaiting && !_this.waitForKey && !_this.waitCounter && Input.keys[Input.C]) {
          _this["continue"]();
        }
        if (_this.waitForKey) {
          if (Input.keys[Input.C]) {
            Input.clear();
            _this.waitForKey = false;
            return _this.isWaiting = false;
          }
        }
      };
    })(this)), null, this.object);
  };


  /**
  * Sets up the renderer. Registers necessary event handlers.
  * @method setup
   */

  Component_MessageTextRenderer.prototype.setup = function() {
    return this.setupEventHandlers();
  };


  /**
  * Restores the message text-renderer's state from a data-bundle.
  * @method restore
  * @param {Object} bundle - A data-bundle containing message text-renderer state.
   */

  Component_MessageTextRenderer.prototype.restore = function(bundle) {
    var k;
    for (k in bundle) {
      if (k === "currentSpriteIndex") {
        this.currentSprite = this.sprites[bundle.currentSpriteIndex];
      } else {
        this[k] = bundle[k];
      }
    }
    if (this.sprites.length > 0) {
      this.currentY = this.sprites.last().y - this.object.origin.y - this.object.dstRect.y;
      this.line = this.maxLines;
      this.isWaiting = this.isWaiting || this.isRunning;
    }
    return null;
  };


  /**
  * Continues message-processing if currently waiting.
  * @method continue
   */

  Component_MessageTextRenderer.prototype["continue"] = function() {
    var duration, fading, ref, ref1;
    this.isWaiting = false;
    if (this.line >= this.lines.length) {
      this.isRunning = false;
      return (ref = this.object.events) != null ? ref.emit("messageFinish", this) : void 0;
    } else {
      if ((ref1 = this.object.events) != null) {
        ref1.emit("messageBatch", this);
      }
      fading = GameManager.tempSettings.messageFading;
      duration = GameManager.tempSettings.skip ? 0 : fading.duration;
      return this.object.animator.disappear(fading.animation, fading.easing, duration, gs.CallBack("onBatchDisappear", this));
    }
  };


  /**
  * Updates the text-renderer.
  * @method update
   */

  Component_MessageTextRenderer.prototype.update = function() {
    var j, len, len1, m, object, ref, ref1, ref2, sprite;
    ref = this.allSprites;
    for (j = 0, len = ref.length; j < len; j++) {
      sprite = ref[j];
      sprite.opacity = this.object.opacity;
      sprite.visible = this.object.visible;
      sprite.ox = -this.object.offset.x;
      sprite.oy = -this.object.offset.y;
      sprite.mask.value = this.object.mask.value;
      sprite.mask.vague = this.object.mask.vague;
      sprite.mask.source = this.object.mask.source;
      sprite.mask.type = this.object.mask.type;
    }
    ref1 = this.customObjects;
    for (m = 0, len1 = ref1.length; m < len1; m++) {
      object = ref1[m];
      object.opacity = this.object.opacity;
      object.visible = this.object.visible;
    }
    if (!this.isRunning && this.waitCounter > 0) {
      this.waitCounter--;
      if (this.waitCounter === 0) {
        this["continue"]();
      }
      return;
    }
    if (this.object.visible && ((ref2 = this.lines) != null ? ref2.length : void 0) > 0) {
      this.updateLineWriting();
      this.updateWaitForKey();
      this.updateWaitCounter();
      return this.updateCaretPosition();
    }
  };


  /**
  * Alignment of the message's lines as it is defined by message settings.
  *
  * @method lineAlignment
  * @return "l" for Left, "m" for Middle/Centered, "r" for Right
   */

  Component_MessageTextRenderer.prototype.lineAlignment = function() {
    return this.object.settings.lineAlignment || "l";
  };


  /**
  * Indicates if its a batched messages.
  *
  * @method isBatched
  * @return If <b>true</b> it is a batched message. Otherwise <b>false</b>.
   */

  Component_MessageTextRenderer.prototype.isBatched = function() {
    return this.lines.length > this.maxLines;
  };


  /**
  * Indicates if the batch is still in progress and not done.
  *
  * @method isBatchInProgress
  * @return If <b>true</b> the batched message is still not done. Otherwise <b>false</b>
   */

  Component_MessageTextRenderer.prototype.isBatchInProgress = function() {
    return this.lines.length - this.line > this.maxLines;
  };


  /**
  * Indicates if the renderer runs in multi-part message mode which
  * means that a single message might be constructed from multiple drawFormattedText
  * calls.
  *
  * @method isRunningInMultiPartMode
  * @return If <b>true</b> the renderer runs in multi-part mode. Otherwise <b>false</b>.
   */

  Component_MessageTextRenderer.prototype.isRunningInMultiPartMode = function() {
    return !this.object.settings.autoErase && this.object.settings.paragraphSpacing <= 0;
  };


  /**
  * Starts displaying the next page of text if a message is too long to fit
  * into one message box.
  *
  * @method executeBatch
   */

  Component_MessageTextRenderer.prototype.executeBatch = function() {
    this.clearAllSprites();
    this.lines = this.lines.slice(this.line);
    this.line = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.currentLineHeight = 0;
    this.tokenIndex = 0;
    this.charIndex = 0;
    this.token = this.lines[this.line].content[this.tokenIndex] || new gs.RendererToken(null, "");
    this.maxLines = this.calculateMaxLines(this.lines);
    this.lineAnimationCount = this.speed;
    this.sprites = this.createSprites(this.lines);
    this.allSprites = this.allSprites.concat(this.sprites);
    this.currentSprite = this.sprites[this.line];
    this.currentSprite.x = this.currentX + this.object.origin.x + this.object.dstRect.x;
    return this.drawNext();
  };


  /**
  * Calculates the duration(in frames) the message-renderer needs to display
  * the message.
  *
  * @method calculateDuration
  * @return {number} The duration in frames.
   */

  Component_MessageTextRenderer.prototype.calculateDuration = function() {
    var duration, j, len, len1, line, m, ref, ref1, token;
    duration = 0;
    if (this.lines != null) {
      ref = this.lines;
      for (j = 0, len = ref.length; j < len; j++) {
        line = ref[j];
        ref1 = line.content;
        for (m = 0, len1 = ref1.length; m < len1; m++) {
          token = ref1[m];
          if (token != null) {
            duration += this.calculateDurationForToken(token);
          }
        }
      }
    }
    return duration;
  };


  /**
  * Calculates the duration(in frames) the message-renderer needs to display
  * the specified line.
  *
  * @method calculateDurationForLine
  * @param {gs.RendererTextLine} line The line to calculate the duration for.
  * @return {number} The duration in frames.
   */

  Component_MessageTextRenderer.prototype.calculateDurationForLine = function(line) {
    var duration, j, len, ref, token;
    duration = 0;
    if (line) {
      ref = line.content;
      for (j = 0, len = ref.length; j < len; j++) {
        token = ref[j];
        if (token != null) {
          duration += this.calculateDurationForToken(token);
        }
      }
    }
    return duration;
  };


  /**
  * Calculates the duration(in frames) the message-renderer needs to process
  * the specified token.
  *
  * @method calculateDurationForToken
  * @param {string|Object} token - The token.
  * @return {number} The duration in frames.
   */

  Component_MessageTextRenderer.prototype.calculateDurationForToken = function(token) {
    var duration;
    duration = 0;
    if (token.code != null) {
      switch (token.code) {
        case "W":
          if (token.value !== "A") {
            duration = token.value / 1000 * Graphics.frameRate;
          }
      }
    } else {
      duration = token.value.length * this.speed;
    }
    return duration;
  };


  /**
  * Calculates the maximum of lines which can be displayed in one message.
  *
  * @method calculateMaxLines
  * @param {Array} lines - An array of line-objects.
  * @return {number} The number of displayable lines.
   */

  Component_MessageTextRenderer.prototype.calculateMaxLines = function(lines) {
    var height, j, len, line, result;
    height = 0;
    result = 0;
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      height += line.height + this.lineSpacing;
      if (this.currentY + height > this.object.dstRect.height) {
        break;
      }
      result++;
    }
    return Math.min(lines.length, result || 1);
  };


  /**
  * Displays the character or processes the next control-token.
  *
  * @method drawNext
   */

  Component_MessageTextRenderer.prototype.drawNext = function() {
    var lineSpacing, size, token;
    token = this.processToken();
    if ((token != null ? token.value.length : void 0) > 0) {
      this.char = this.token.value.charAt(this.charIndex);
      size = this.font.measureTextPlain(this.char);
      lineSpacing = this.lineSpacing;
      if (this.currentLine !== this.line) {
        this.currentLine = this.line;
        this.currentLineHeight = 0;
      }
      this.currentSprite.y = this.object.origin.y + this.object.dstRect.y + this.currentY;
      this.currentSprite.visible = true;
      this.drawLineContent(this.lines[this.line], this.currentSprite.bitmap, this.charIndex + 1);
      this.currentSprite.srcRect.width = this.currentSprite.bitmap.width;
      switch (this.lineAlignment()) {
        case "m":
          this.currentSprite.x = this.object.origin.x + this.object.dstRect.x + (this.object.dstRect.width - this.lines[this.line].contentWidth) / 2;
          break;
        case "r":
          this.currentSprite.x = this.object.origin.x + this.object.dstRect.x + (this.object.dstRect.width - this.lines[this.line].contentWidth);
      }
      this.currentLineHeight = this.lines[this.line].height;
      return this.currentX = Math.min(this.lines[this.line].width, this.currentX + size.width);
    }
  };


  /**
  * Processes the next character/token of the message.
  * @method nextChar
  * @private
   */

  Component_MessageTextRenderer.prototype.nextChar = function() {
    var base, base1, results;
    results = [];
    while (true) {
      this.charIndex++;
      this.lineAnimationCount = this.speed;
      if ((this.token.code != null) || this.charIndex >= this.token.value.length) {
        if (typeof (base = this.token).onEnd === "function") {
          base.onEnd();
        }
        this.tokenIndex++;
        if (this.tokenIndex >= this.lines[this.line].content.length) {
          this.tokenIndex = 0;
          this.line++;
          this.currentSprite.srcRect.width = this.currentSprite.bitmap.width;
          this.currentSprite = this.sprites[this.line];
          if (this.currentSprite != null) {
            this.currentSprite.x = this.object.origin.x + this.object.dstRect.x;
          }
          if (this.line < this.maxLines) {
            this.currentY += (this.currentLineHeight || this.font.lineHeight) + this.lineSpacing * Graphics.scale;
            this.charIndex = 0;
            this.currentX = 0;
            this.token = this.lines[this.line].content[this.tokenIndex] || new gs.RendererToken(null, "");
          }
        } else {
          this.charIndex = 0;
          this.token = this.lines[this.line].content[this.tokenIndex] || new gs.RendererToken(null, "");
        }
        if (typeof (base1 = this.token).onStart === "function") {
          base1.onStart();
        }
      }
      if (!this.token || this.token.value !== "\n" || !this.lines[this.line]) {
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Finishes the message. Depending on the message configuration, the
  * message text-renderer will now wait for a user-action or a certain amount
  * of time.
  *
  * @method finish
   */

  Component_MessageTextRenderer.prototype.finish = function() {
    var ref, ref1, ref2;
    if (this.waitAtEnd) {
      this.isWaiting = true;
      return (ref = this.object.events) != null ? ref.emit("messageWaiting", this) : void 0;
    } else if (this.waitAtEndTime > 0) {
      this.waitCounter = this.waitAtEndTime;
      this.isWaiting = false;
      return (ref1 = this.object.events) != null ? ref1.emit("messageWaiting", this) : void 0;
    } else {
      if ((ref2 = this.object.events) != null) {
        ref2.emit("messageWaiting", this);
      }
      return this["continue"]();
    }
  };


  /**
  * Returns the position of the caret in pixels. The caret is like an invisible
  * cursor pointing to the x/y coordinates of the last rendered character of
  * the message. That position can be used to display a waiting- or processing-animation for example.
  *
  * @method updateCaretPosition
   */

  Component_MessageTextRenderer.prototype.updateCaretPosition = function() {
    var ref, ref1;
    switch (this.lineAlignment()) {
      case "l":
        this.caretPosition.x = this.currentX + this.padding;
        break;
      case "m":
        this.caretPosition.x = this.currentX + this.padding + (this.object.dstRect.width - ((ref = this.lines[Math.min(this.line, this.lines.length - 1)]) != null ? ref.contentWidth : void 0) || 0) / 2;
        break;
      case "r":
        this.caretPosition.x = this.currentX + this.padding + (this.object.dstRect.width - ((ref1 = this.lines[Math.min(this.line, this.lines.length - 1)]) != null ? ref1.contentWidth : void 0) || 0);
        break;
      default:
        this.caretPosition.x = this.currentX + this.padding;
    }
    return this.caretPosition.y = this.currentY + this.currentLineHeight / 2;
  };


  /**
  * Updates the line writing.
  *
  * @method updateLineWriting
  * @private
   */

  Component_MessageTextRenderer.prototype.updateLineWriting = function() {
    if (this.isRunning && !this.isWaiting && !this.waitForKey && this.waitCounter <= 0) {
      if (this.lineAnimationCount <= 0) {
        while (true) {
          if (this.line < this.maxLines) {
            this.nextChar();
          }
          if (this.line >= this.maxLines) {
            this.finish();
          } else {
            this.drawNext();
          }
          if (!((this.token.code || this.lineAnimationCount <= 0 || this.drawImmediately) && !this.waitForKey && this.waitCounter <= 0 && this.isRunning && this.line < this.maxLines)) {
            break;
          }
        }
      }
      if (GameManager.tempSettings.skip) {
        return this.lineAnimationCount = 0;
      } else {
        return this.lineAnimationCount--;
      }
    }
  };


  /**
  * Updates wait-for-key state. If skipping is enabled, the text renderer will
  * not wait for key press.
  *
  * @method updateWaitForKey
  * @private
   */

  Component_MessageTextRenderer.prototype.updateWaitForKey = function() {
    if (this.waitForKey) {
      this.isWaiting = !GameManager.tempSettings.skip;
      return this.waitForKey = this.isWaiting;
    }
  };


  /**
  * Updates wait counter if the text renderer is waiting for a certain amount of time to pass. If skipping is enabled, the text renderer will
  * not wait for the actual amount of time and sets the wait-counter to 1 frame instead.
  *
  * @method updateWaitForKey
  * @private
   */

  Component_MessageTextRenderer.prototype.updateWaitCounter = function() {
    if (this.waitCounter > 0) {
      if (GameManager.tempSettings.skip) {
        this.waitCounter = 1;
      }
      this.isWaiting = true;
      this.waitCounter--;
      if (this.waitCounter <= 0) {
        this.isWaiting = false;
        if (this.line >= this.maxLines) {
          return this["continue"]();
        }
      }
    }
  };


  /**
  * Creates a token-object for a specified text-code.
  *
  * @method createToken
  * @param {string} code - The code/type of the text-code.
  * @param {string} value - The value of the text-code.
  * @return {Object} The token-object.
   */

  Component_MessageTextRenderer.prototype.createToken = function(code, value) {
    var data, i, j, ref, tokenObject;
    tokenObject = null;
    switch (code) {
      case "CE":
        data = value.split("/");
        value = data.shift();
        value = isNaN(value) ? value : parseInt(value);
        for (i = j = 0, ref = data; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          if (data[i].startsWith('"') && data[i].endsWith('"')) {
            data[i] = data[i].substring(1, data[i].length - 1);
          } else {
            data[i] = isNaN(data[i]) ? data[i] : parseFloat(data[i]);
          }
        }
        tokenObject = {
          code: code,
          value: value,
          values: data
        };
        break;
      default:
        tokenObject = Component_MessageTextRenderer.__super__.createToken.call(this, code, value);
    }
    return tokenObject;
  };


  /**
  * <p>Measures a control-token. If a token produces a visual result like displaying an icon then it must return the size taken by
  * the visual result. If the token has no visual result, <b>null</b> must be returned. This method is called for every token when the message is initialized.</p>
  *
  * <p>This method is not called while the message is running. For that case, see <i>processControlToken</i> method which is called
  * for every token while the message is running.</p>
  *
  * @param {Object} token - A control-token.
  * @return {gs.Size} The size of the area taken by the visual result of the token or <b>null</b> if the token has no visual result.
  * @method analyzeControlToken
  * @protected
   */

  Component_MessageTextRenderer.prototype.measureControlToken = function(token) {
    return Component_MessageTextRenderer.__super__.measureControlToken.call(this, token);
  };


  /**
  * <p>Draws the visual result of a token, like an icon for example, to the specified bitmap. This method is called for every token when the message is initialized and the sprites for each
  * text-line are created.</p>
  *
  * <p>This method is not called while the message is running. For that case, see <i>processControlToken</i> method which is called
  * for every token while the message is running.</p>
  *
  * @param {Object} token - A control-token.
  * @param {gs.Bitmap} bitmap - The bitmap used for the current text-line. Can be used to draw something on it like an icon, etc.
  * @param {number} offset - An x-offset for the draw-routine.
  * @param {number} length - Determines how many characters of the token should be drawn. Can be ignored for tokens
  * not drawing any characters.
  * @method drawControlToken
  * @protected
   */

  Component_MessageTextRenderer.prototype.drawControlToken = function(token, bitmap, offset, length) {
    var data, j, len, linkData, results;
    switch (token.code) {
      case "RT":
        return Component_MessageTextRenderer.__super__.drawControlToken.call(this, token, bitmap, offset, length);
      case "SLK":
        if (token.customData.offsetX == null) {
          token.customData.offsetX = offset;
        }
        if (this.customData.linkData) {
          linkData = this.customData.linkData[this.line];
          if (linkData) {
            results = [];
            for (j = 0, len = linkData.length; j < len; j++) {
              data = linkData[j];
              results.push(this.sprites[this.line].bitmap.clearRect(data.cx, 0, data.width, data.height));
            }
            return results;
          }
        }
    }
  };


  /**
  * Processes a control-token. A control-token is a token which influences
  * the text-rendering like changing the fonts color, size or style. Changes
  * will be automatically applied to the game object's font.
  *
  * For message text-renderer, a few additional control-tokens like
  * speed-change, waiting, etc. needs to be processed here.
  *
  * This method is called for each token while the message is initialized and
  * also while the message is running. See <i>formattingOnly</i> parameter.
  *
  * @param {Object} token - A control-token.
  * @param {boolean} formattingOnly - If <b>true</b> the message is initializing right now and only
  * format-tokens should be processed which is necessary for the message to calculated sizes correctly.
  * @return {Object} A new token which is processed next or <b>null</b>.
  * @method processControlToken
  * @protected
   */

  Component_MessageTextRenderer.prototype.processControlToken = function(token, formattingOnly) {
    var animation, bitmap, character, duration, easing, expression, line, linkData, linkStart, object, params, ref, ref1, result, sound, textTokens, values;
    if (formattingOnly) {
      return Component_MessageTextRenderer.__super__.processControlToken.call(this, token);
    }
    result = null;
    switch (token.code) {
      case "CR":
        character = RecordManager.charactersArray.first(function(c) {
          var ref;
          return ((ref = c.name.defaultText) != null ? ref : c.name) === token.value;
        });
        if (character) {
          SceneManager.scene.currentCharacter = character;
        }
        break;
      case "CE":
        params = {
          "values": token.values
        };
        if ((ref = this.object.events) != null) {
          ref.emit("callCommonEvent", this.object, {
            commonEventId: token.value,
            params: params,
            finish: false,
            waiting: true
          });
        }
        break;
      case "X":
        if (typeof token.value === "function") {
          token.value(this.object);
        }
        break;
      case "ALGN":
        this.object.settings.lineAlignment = token.value.toLowerCase();
        break;
      case "A":
        animation = RecordManager.animationsArray.first(function(a) {
          return a.name === token.value;
        });
        if (!animation) {
          animation = RecordManager.animations[token.value];
        }
        if ((animation != null ? animation.graphic.name : void 0) != null) {
          bitmap = ResourceManager.getBitmap(ResourceManager.getPath(animation.graphic));
          object = new gs.Object_Animation(animation);
          this.addCustomObject(object);
          this.currentX += Math.round(bitmap.width / animation.framesX);
          this.currentSprite.srcRect.width += Math.round(bitmap.width / animation.framesX);
        }
        break;
      case "RT":
        if (token.rtSize.width > token.rbSize.width) {
          this.currentX += token.rtSize.width;
          this.font.set(this.getRubyTextFont(token));
        } else {
          this.currentX += token.rbSize.width;
        }
        break;
      case "LK":
        if (token.value === 'E') {
          object = new ui.Object_Hotspot();
          object.enabled = true;
          object.setup();
          this.addCustomObject(object);
          object.dstRect.x = this.object.dstRect.x + this.object.origin.x + this.customData.linkData.cx;
          object.dstRect.y = this.object.dstRect.y + this.object.origin.y + this.customData.linkData.cy;
          object.dstRect.width = this.currentX - this.customData.linkData.cx;
          object.dstRect.height = this.currentLineHeight;
          object.events.on("click", gs.CallBack("onLinkClick", this), {
            linkData: this.customData.linkData
          }, this);
        } else {
          this.customData.linkData = {
            cx: this.currentX,
            cy: this.currentY,
            commonEventId: token.value,
            tokenIndex: this.tokenIndex
          };
        }
        break;
      case "SLK":
        if (token.value === 'E') {
          linkData = this.customData.linkData[this.line].last();
          line = this.lines[this.line].content;
          linkStart = this.findToken(this.tokenIndex - 1, "SLK", -1, line);
          textTokens = this.findTokensBetween(linkData.tokenIndex, this.tokenIndex, null, line);
          linkData.cx = linkStart.customData.offsetX;
          linkData.width = this.currentX - linkData.cx + this.padding;
          linkData.height = this.currentSprite.bitmap.height;
          object = new ui.Object_Text();
          object.text = textTokens.select((function(_this) {
            return function(x) {
              return x.value;
            };
          })(this)).join("");
          object.formatting = false;
          object.wordWrap = false;
          object.ui = new ui.Component_UIBehavior();
          object.enabled = true;
          object.addComponent(object.ui);
          object.addComponent(new gs.Component_HotspotBehavior());
          object.behavior.padding.left = 0;
          object.behavior.padding.right = 0;
          object.dstRect.width = linkData.width;
          object.dstRect.height = linkData.height;
          if (linkData.styleIndex === -1) {
            ui.UIManager.addControlStyles(object, ["hyperlink"]);
          } else {
            ui.UIManager.addControlStyles(object, ["hyperlink-" + linkData.styleIndex]);
          }
          object.setup();
          this.addCustomObject(object);
          object.dstRect.x = this.currentSprite.x + linkData.cx;
          object.dstRect.y = this.object.dstRect.y + this.object.origin.y + linkData.cy;
          object.events.on("click", gs.CallBack("onLinkClick", this), {
            linkData: linkData
          }, this);
        } else {
          if (!this.customData.linkData) {
            this.customData.linkData = [];
          }
          if (!this.customData.linkData[this.line]) {
            this.customData.linkData[this.line] = [];
          }
          if ((ref1 = token.value) != null ? ref1.contains(",") : void 0) {
            values = token.value.split(",");
            this.customData.linkData[this.line].push({
              cx: this.currentX,
              cy: this.currentY,
              commonEventId: values[0],
              styleIndex: parseInt(values[1]),
              tokenIndex: this.tokenIndex
            });
          } else {
            this.customData.linkData[this.line].push({
              cx: this.currentY,
              cy: this.currentY,
              commonEventId: token.value,
              tokenIndex: this.tokenIndex,
              styleIndex: -1
            });
          }
        }
        break;
      case "E":
        expression = RecordManager.characterExpressionsArray.first(function(c) {
          var ref2;
          return ((ref2 = c.name.defaultText) != null ? ref2 : c.name) === token.value;
        });
        if (!expression) {
          expression = RecordManager.characterExpressions[token.value];
        }
        character = SceneManager.scene.currentCharacter;
        if ((expression != null) && ((character != null ? character.index : void 0) != null)) {
          duration = GameManager.defaults.character.expressionDuration;
          easing = gs.Easings.fromObject(GameManager.defaults.character.changeEasing);
          animation = GameManager.defaults.character.changeAnimation;
          object = SceneManager.scene.characters.first(function(c) {
            return c.rid === character.index;
          });
          if (object != null) {
            object.behavior.changeExpression(expression, animation, easing, duration);
          }
        }
        break;
      case "SP":
        sound = RecordManager.system.sounds[token.value - 1];
        AudioManager.playSound(sound);
        break;
      case "S":
        GameManager.settings.messageSpeed = token.value;
        break;
      case "W":
        this.drawImmediately = false;
        if (!GameManager.tempSettings.skip) {
          if (token.value === "A") {
            this.waitForKey = true;
          } else {
            this.waitCounter = Math.round(token.value / 1000 * Graphics.frameRate);
          }
        }
        break;
      case "WE":
        this.waitAtEnd = token.value === "Y";
        break;
      case "DI":
        this.drawImmediately = token.value === 1 || token.value === "Y";
        break;
      default:
        result = Component_MessageTextRenderer.__super__.processControlToken.call(this, token);
    }
    return result;
  };


  /**
  * Clears/Resets the text-renderer.
  *
  * @method clear
   */

  Component_MessageTextRenderer.prototype.clear = function() {
    var j, len, ref, ref1, ref2, sprite;
    this.charIndex = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.line = 0;
    this.lines = [];
    this.clearCustomObjects();
    if ((ref = this.object.bitmap) != null) {
      ref.clear();
    }
    ref1 = this.allSprites;
    for (j = 0, len = ref1.length; j < len; j++) {
      sprite = ref1[j];
      sprite.dispose();
      if ((ref2 = sprite.bitmap) != null) {
        ref2.dispose();
      }
    }
    this.allSprites = [];
    return null;
  };


  /**
  * Clears/Disposes all sprites used to display the text-lines/parts.
  *
  * @method clearAllSprites
   */

  Component_MessageTextRenderer.prototype.clearAllSprites = function() {
    var j, len, ref, ref1, sprite;
    ref = this.allSprites;
    for (j = 0, len = ref.length; j < len; j++) {
      sprite = ref[j];
      sprite.dispose();
      if ((ref1 = sprite.bitmap) != null) {
        ref1.dispose();
      }
    }
    return null;
  };


  /**
  * Clears/Disposes the sprites used to display the text-lines/parts of the current/last message.
  *
  * @method clearSprites
   */

  Component_MessageTextRenderer.prototype.clearSprites = function() {
    var j, len, ref, ref1, sprite;
    ref = this.sprites;
    for (j = 0, len = ref.length; j < len; j++) {
      sprite = ref[j];
      sprite.dispose();
      if ((ref1 = sprite.bitmap) != null) {
        ref1.dispose();
      }
    }
    return null;
  };


  /**
  * Removes a game object from the message.
  *
  * @method removeCustomObject
  * @param object {gs.Object_Base} The game object to remove.
   */

  Component_MessageTextRenderer.prototype.removeCustomObject = function(object) {
    SceneManager.scene.removeObject(object);
    object.dispose();
    return this.customObjects.remove(object);
  };


  /**
  * Adds a game object to the message which is alive until the message is
  * erased. Can be used to display animationed-icons, etc. in a message.
  *
  * @method addCustomObject
  * @param object {gs.Object_Base} The game object to add.
   */

  Component_MessageTextRenderer.prototype.addCustomObject = function(object) {
    object.dstRect.x = this.object.dstRect.x + this.object.origin.x + this.currentX;
    object.dstRect.y = this.object.dstRect.y + this.object.origin.y + this.currentY;
    object.zIndex = this.object.zIndex + 1;
    object.update();
    SceneManager.scene.addObject(object);
    return this.customObjects.push(object);
  };


  /**
  * Clears the list of custom game objects. All game objects are disposed and removed
  * from the scene.
  *
  * @method clearCustomObjects
  * @param object {Object} The game object to add.
   */

  Component_MessageTextRenderer.prototype.clearCustomObjects = function() {
    var j, len, object, ref;
    ref = this.customObjects;
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      object.dispose();
      SceneManager.scene.removeObject(object);
    }
    return this.customObjects = [];
  };


  /**
  * Creates the bitmap for a specified line-object.
  *
  * @method createBitmap
  * @private
  * @param {Object} line - A line-object.
  * @return {Bitmap} A newly created bitmap containing the line-text.
   */

  Component_MessageTextRenderer.prototype.createBitmap = function(line) {
    var bitmap;
    this.font = this.object.font;
    bitmap = new Bitmap(this.object.dstRect.width, Math.max(this.minLineHeight, line.height));
    bitmap.font = this.font;
    return bitmap;
  };


  /**
  * Draws the line's content on the specified bitmap.
  *
  * @method drawLineContent
  * @protected
  * @param {Object} line - A line-object which should be drawn on the bitmap.
  * @param {gs.Bitmap} bitmap - The bitmap to draw the line's content on.
  * @param {number} length - Determines how many characters of the specified line should be drawn. You can
  * specify -1 to draw all characters.
   */

  Component_MessageTextRenderer.prototype.drawLineContent = function(line, bitmap, length) {
    var currentX, drawAll, i, j, len, ref, size, token, value;
    bitmap.clear();
    currentX = this.padding;
    drawAll = length === -1;
    ref = line.content;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      token = ref[i];
      if (i > this.tokenIndex && !drawAll) {
        break;
      }
      if (token.code != null) {
        size = this.measureControlToken(token, bitmap);
        this.drawControlToken(token, bitmap, currentX);
        if (size) {
          currentX += size.width;
        }
        this.processControlToken(token, true, line);
      } else if (token.value.length > 0) {
        token.applyFormat(this.font);
        value = token.value;
        if (!drawAll && this.tokenIndex === i && value.length > length) {
          value = value.substring(0, length);
        }
        if (value !== "\n") {
          size = this.font.measureTextPlain(value);
          bitmap.drawText(currentX, line.height - (size.height - this.font.descent) - line.descent, size.width, bitmap.height, value, 0, 0);
          currentX += size.width;
        }
      }
    }
    return line.contentWidth = currentX + this.font.measureTextPlain(" ").width;
  };


  /**
  * Creates the sprite for a specified line-object.
  *
  * @method createSprite
  * @private
  * @param {Object} line - A line-object.
  * @return {Sprite} A newly created sprite object containing the line-text as bitmap.
   */

  Component_MessageTextRenderer.prototype.createSprite = function(line) {
    var bitmap, sprite;
    bitmap = this.createBitmap(line);
    this.currentX = 0;
    this.waitCounter = 0;
    this.waitForKey = false;
    sprite = new Sprite(Graphics.viewport);
    sprite.bitmap = bitmap;
    sprite.visible = true;
    sprite.z = this.object.zIndex + 1;
    sprite.srcRect = new Rect(0, 0, 0, bitmap.height);
    return sprite;
  };


  /**
  * Creates the sprites for a specified array of line-objects.
  *
  * @method createSprites
  * @private
  * @see gs.Component_MessageTextRenderer.createSprite.
  * @param {Array} lines - An array of line-objects.
  * @return {Array} An array of sprites.
   */

  Component_MessageTextRenderer.prototype.createSprites = function(lines) {
    var i, j, len, line, result, sprite;
    this.fontSize = this.object.font.size;
    result = [];
    for (i = j = 0, len = lines.length; j < len; i = ++j) {
      line = lines[i];
      sprite = this.createSprite(line);
      result.push(sprite);
    }
    return result;
  };


  /**
  * Starts a new line.
  *
  * @method newLine
   */

  Component_MessageTextRenderer.prototype.newLine = function() {
    this.currentX = 0;
    return this.currentY += this.currentLineHeight + this.lineSpacing;
  };


  /**
  * Displays a formatted text immediately without any delays or animations. The
  * Component_TextRenderer.drawFormattedText method from the base-class cannot
  * be used here because it would render to the game object's bitmap object while
  * this method is rendering to the sprites.
  *
  * @method drawFormattedTextImmediately
  * @param {number} x - The x-coordinate of the text's position.
  * @param {number} y - The y-coordinate of the text's position.
  * @param {number} width - Deprecated. Can be null.
  * @param {number} height - Deprecated. Can be null.
  * @param {string} text - The text to draw.
  * @param {boolean} wordWrap - If wordWrap is set to true, line-breaks are automatically created.
   */

  Component_MessageTextRenderer.prototype.drawFormattedTextImmediately = function(x, y, width, height, text, wordWrap) {
    this.drawFormattedText(x, y, width, height, text, wordWrap);
    while (true) {
      this.nextChar();
      if (this.line >= this.maxLines) {
        this.isRunning = false;
      } else {
        this.drawNext();
      }
      if (!this.isRunning) {
        break;
      }
    }
    this.currentY += this.currentLineHeight + this.lineSpacing;
    return null;
  };


  /**
  * Starts the rendering-process for the message.
  *
  * @method drawFormattedText
  * @param {number} x - The x-coordinate of the text's position.
  * @param {number} y - The y-coordinate of the text's position.
  * @param {number} width - Deprecated. Can be null.
  * @param {number} height - Deprecated. Can be null.
  * @param {string} text - The text to draw.
  * @param {boolean} wordWrap - If wordWrap is set to true, line-breaks are automatically created.
   */

  Component_MessageTextRenderer.prototype.drawFormattedText = function(x, y, width, height, text, wordWrap) {
    var currentX, ref;
    text = text || " ";
    this.font.set(this.object.font);
    this.speed = 11 - Math.round(GameManager.settings.messageSpeed * 2.5);
    this.isRunning = true;
    this.drawImmediately = false;
    this.lineAnimationCount = this.speed;
    this.currentLineHeight = 0;
    this.isWaiting = false;
    this.waitForKey = false;
    this.charIndex = 0;
    this.token = null;
    this.tokenIndex = 0;
    this.message = text;
    this.line = 0;
    this.currentLine = this.line;
    currentX = this.currentX;
    this.lines = this.calculateLines(lcsm(this.message), wordWrap, this.currentX);
    this.sprites = this.createSprites(this.lines);
    this.allSprites = this.allSprites.concat(this.sprites);
    this.currentX = currentX;
    this.currentSprite = this.sprites[this.line];
    this.currentSprite.x = this.currentX + this.object.origin.x + this.object.dstRect.x;
    this.maxLines = this.calculateMaxLines(this.lines);
    this.token = ((ref = this.lines[this.line]) != null ? ref.content[this.tokenIndex] : void 0) || new gs.RendererToken(null, "");
    return this.start();
  };


  /**
  * Starts the message-rendering process.
  *
  * @method start
  * @protected
   */

  Component_MessageTextRenderer.prototype.start = function() {
    var ref;
    if (GameManager.tempSettings.skip && GameManager.tempSettings.skipTime === 0) {
      return this.instantSkip();
    } else if (this.maxLines === 0) {
      if (((ref = this.lines[0]) != null ? ref.content : void 0) === "") {
        return this.finish();
      } else {
        this.maxLines = 1;
        return this.drawNext();
      }
    } else {
      return this.drawNext();
    }
  };


  /**
  * Skips the current message and finishes the message-processing immediately. The message
  * tokens are processed but not rendered.
  *
  * @method instantSkip
   */

  Component_MessageTextRenderer.prototype.instantSkip = function() {
    var ref;
    while (true) {
      if (this.line < this.maxLines) {
        this.nextChar();
      }
      if (this.line >= this.maxLines) {
        break;
      } else {
        this.processToken();
      }
      if (!(this.isRunning && this.line < this.maxLines)) {
        break;
      }
    }
    if ((ref = this.object.events) != null) {
      ref.emit("messageWaiting", this);
    }
    return this["continue"]();
  };


  /**
  * Processes the current token.
  *
  * @method processToken
   */

  Component_MessageTextRenderer.prototype.processToken = function() {
    var base, token;
    token = null;
    if (this.token.code != null) {
      token = this.processControlToken(this.token, false);
      if (token != null) {
        this.token = token;
        if (typeof (base = this.token).onStart === "function") {
          base.onStart();
        }
      }
    } else {
      token = this.token;
    }
    return token;
  };

  return Component_MessageTextRenderer;

})(gs.Component_TextRenderer);

gs.Component_MessageTextRenderer = Component_MessageTextRenderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsNkJBQUE7RUFBQTs7O0FBQU07OztFQUNGLDZCQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxhQUFELEVBQWdCLGtCQUFoQjs7O0FBQ3hCOzs7Ozs7Ozs7MENBUUEsbUJBQUEsR0FBcUIsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNqQixRQUFBO0lBQUEsSUFBQyxDQUFBLGtCQUFELENBQUE7SUFDQSxDQUFBLEdBQUk7SUFDSixRQUFBLEdBQVc7QUFFWDtBQUFBLFNBQUEscUNBQUE7O01BQ0ksSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBcEI7UUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFiLEdBQXlCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxPQUFPLENBQUMsU0FBUyxDQUFDLFNBQTNCLEVBRDdCOztNQUdBLFNBQUEsR0FBZSxJQUFDLENBQUEsd0JBQUQsQ0FBQSxDQUFILHVCQUFvQyxRQUFRLENBQUUsZUFBVixJQUFtQixDQUF2RCxHQUE4RDtNQUMxRSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQUEsQ0FBSyxPQUFPLENBQUMsSUFBYixDQUFoQixFQUFvQyxJQUFwQyxFQUF5QyxTQUF6QztBQUNUO0FBQUEsV0FBQSx3Q0FBQTs7UUFDSSxNQUFBLEdBQVMsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkO1FBQ1QsSUFBRyxJQUFBLEtBQVEsSUFBQyxDQUFBLElBQVo7VUFDSSxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFqQixFQUF1QixNQUF2QixFQUErQixJQUFDLENBQUEsU0FBRCxHQUFXLENBQTFDLEVBREo7U0FBQSxNQUFBO1VBR0ksSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBakIsRUFBdUIsTUFBdkIsRUFBK0IsQ0FBQyxDQUFoQyxFQUhKOztRQUlBLElBQUMs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LElBQUcsYUFBSDtRQUNJLElBQUMsQ0FBQSxLQUFELEdBQVM7O2NBQ0gsQ0FBQztTQUZYO09BRko7S0FBQSxNQUFBO01BTUksS0FBQSxHQUFRLElBQUMsQ0FBQSxNQU5iOztBQVFBLFdBQU87RUFYRzs7OztHQWx2QzBCLEVBQUUsQ0FBQzs7QUFpd0MvQyxFQUFFLENBQUMsNkJBQUgsR0FBbUMiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9NZXNzYWdlVGV4dFJlbmRlcmVyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfTWVzc2FnZVRleHRSZW5kZXJlciBleHRlbmRzIGdzLkNvbXBvbmVudF9UZXh0UmVuZGVyZXJcbiAgICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJvbkxpbmtDbGlja1wiLCBcIm9uQmF0Y2hEaXNhcHBlYXJcIl1cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uRGF0YUJ1bmRsZVJlc3RvcmUuXG4gICAgKiBAcGFyYW0gT2JqZWN0IGRhdGEgLSBUaGUgZGF0YS1idW5kbGVcbiAgICAqIEBwYXJhbSBncy5PYmplY3RDb2RlY0NvbnRleHQgY29udGV4dCAtIFRoZSBjb2RlYy1jb250ZXh0LlxuICAgICMjI1xuICAgIG9uRGF0YUJ1bmRsZVJlc3RvcmU6IChkYXRhLCBjb250ZXh0KSAtPlxuICAgICAgICBAc2V0dXBFdmVudEhhbmRsZXJzKClcbiAgICAgICAgbCA9IDBcbiAgICAgICAgbGFzdExpbmUgPSBudWxsXG5cbiAgICAgICAgZm9yIG1lc3NhZ2UgaW4gQG9iamVjdC5tZXNzYWdlc1xuICAgICAgICAgICAgaWYgQG9iamVjdC5zZXR0aW5ncy51c2VDaGFyYWN0ZXJDb2xvclxuICAgICAgICAgICAgICAgIEBvYmplY3QuZm9udC5jb2xvciA9IG5ldyBncy5Db2xvcihtZXNzYWdlLmNoYXJhY3Rlci50ZXh0Q29sb3IpXG5cbiAgICAgICAgICAgIGxpbmVXaWR0aCA9IGlmIEBpc1J1bm5pbmdJbk11bHRpUGFydE1vZGUoKSB0aGVuIGxhc3RMaW5lPy53aWR0aCB8fCAwIGVsc2UgMFxuICAgICAgICAgICAgQGxpbmVzID0gQGNhbGN1bGF0ZUxpbmVzKGxjc20obWVzc2FnZS50ZXh0KSwgeWVzLCBsaW5lV2lkdGgpXG4gICAgICAgICAgICBmb3IgbGluZSBpbiBAbGluZXNcbiAgICAgICAgICAgICAgICBiaXRtYXAgPSBAY3JlYXRlQml0bWFwKGxpbmUpXG4gICAgICAgICAgICAgICAgaWYgbGluZSA9PSBAbGluZVxuICAgICAgICAgICAgICAgICAgICBAZHJhd0xpbmVDb250ZW50KGxpbmUsIGJpdG1hcCwgQGNoYXJJbmRleCsxKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGRyYXdMaW5lQ29udGVudChsaW5lLCBiaXRtYXAsIC0xKVxuICAgICAgICAgICAgICAgIEBhbGxTcHJpdGVzW2xdLmJpdG1hcCA9IGJpdG1hcFxuICAgICAgICAgICAgICAgIGxhc3RMaW5lID0gbGluZVxuICAgICAgICAgICAgICAgIGwrK1xuXG4gICAgICAgIGZvciBjdXN0b21PYmplY3QgaW4gQGN1c3RvbU9iamVjdHNcbiAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5hZGRPYmplY3QoY3VzdG9tT2JqZWN0KVxuXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiAgQSB0ZXh0LXJlbmRlcmVyIGNvbXBvbmVudCB0byByZW5kZXIgYW4gYW5pbWF0ZWQgYW5kIGludGVyYWN0aXZlIG1lc3NhZ2UgdGV4dCB1c2luZ1xuICAgICogIGRpbWVuc2lvbnMgb2YgdGhlIGdhbWUgb2JqZWN0J3MgZGVzdGluYXRpb24tcmVjdGFuZ2xlLiBUaGUgbWVzc2FnZSBpcyBkaXNwbGF5ZWRcbiAgICAqICB1c2luZyBhIHNwcml0ZSBmb3IgZWFjaCBsaW5lIGluc3RlYWQgb2YgZHJhd2luZyB0byB0aGUgZ2FtZSBvYmplY3QncyBiaXRtYXAgb2JqZWN0LlxuICAgICpcbiAgICAqICBAbW9kdWxlIGdzXG4gICAgKiAgQGNsYXNzIENvbXBvbmVudF9NZXNzYWdlVGV4dFJlbmRlcmVyXG4gICAgKiAgQGV4dGVuZHMgZ3MuQ29tcG9uZW50X1RleHRSZW5kZXJlclxuICAgICogIEBtZW1iZXJvZiBnc1xuICAgICogIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlclxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbiBhcnJheSBjb250YWluaW5nIGFsbCBzcHJpdGVzIG9mIHRoZSBjdXJyZW50IG1lc3NhZ2UuXG4gICAgICAgICogQHByb3BlcnR5IHNwcml0ZXNcbiAgICAgICAgKiBAdHlwZSBncy5TcHJpdGVbXVxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBzcHJpdGVzID0gW11cblxuICAgICAgICAjIyMqXG4gICAgICAgICogQW4gYXJyYXkgY29udGFpbmluZyBhbGwgc3ByaXRlcyBvZiBhbGwgbWVzc2FnZXMuIEluIE5WTCBtb2RlXG4gICAgICAgICogYSBwYWdlIGNhbiBjb250YWluIG11bHRpcGxlIG1lc3NhZ2VzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBhbGxTcHJpdGVzXG4gICAgICAgICogQHR5cGUgZ3MuU3ByaXRlW11cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAYWxsU3ByaXRlcyA9IFtdXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbiBhcnJheSBjb250YWluaW5nIGFsbCBsaW5lLW9iamVjdHMgb2YgdGhlIGN1cnJlbnQgbWVzc2FnZS5cbiAgICAgICAgKiBAcHJvcGVydHkgbGluZXNcbiAgICAgICAgKiBAdHlwZSBncy5UZXh0UmVuZGVyZXJMaW5lW11cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBsaW5lcyA9IG51bGxcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxpbmUgY3VycmVudGx5IHJlbmRlcmVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsaW5lXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAbGluZSA9IDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxlZnQgYW5kIHJpZ2h0IHBhZGRpbmcgcGVyIGxpbmUuXG4gICAgICAgICogQHByb3BlcnR5IHBhZGRpbmdcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBwYWRkaW5nID0gNlxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbWluaW11bSBoZWlnaHQgb2YgdGhlIGxpbmUgY3VycmVudGx5IHJlbmRlcmVkLiBJZiAwLCB0aGUgbWVhc3VyZWRcbiAgICAgICAgKiBoZWlnaHQgb2YgdGhlIGxpbmUgd2lsbCBiZSB1c2VkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBtaW5MaW5lSGVpZ2h0XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAbWluTGluZUhlaWdodCA9IDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHNwYWNpbmcgYmV0d2VlbiB0ZXh0IGxpbmVzIGluIHBpeGVscy5cbiAgICAgICAgKiBAcHJvcGVydHkgbGluZVNwYWNpbmdcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBsaW5lU3BhY2luZyA9IDJcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxpbmUgY3VycmVudGx5IHJlbmRlcmVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXJyZW50TGluZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50TGluZSA9IDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGhlaWdodCBvZiB0aGUgbGluZSBjdXJyZW50bHkgcmVuZGVyZWQuXG4gICAgICAgICogQHByb3BlcnR5IGN1cnJlbnRMaW5lSGVpZ2h0XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGN1cnJlbnRMaW5lSGVpZ2h0ID0gMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRleCBvZiB0aGUgY3VycmVudCBjaGFyYWN0ZXIgdG8gZHJhdy5cbiAgICAgICAgKiBAcHJvcGVydHkgY2hhckluZGV4XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAY2hhckluZGV4ID0gMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBQb3NpdGlvbiBvZiB0aGUgbWVzc2FnZSBjYXJldC4gVGhlIGNhcmV0IGlzIGxpa2UgYW4gaW52aXNpYmxlXG4gICAgICAgICogY3Vyc29yIHBvaW50aW5nIHRvIHRoZSB4L3kgY29vcmRpbmF0ZXMgb2YgdGhlIGxhc3QgcmVuZGVyZWQgY2hhcmFjdGVyIG9mXG4gICAgICAgICogdGhlIG1lc3NhZ2UuIFRoYXQgcG9zaXRpb24gY2FuIGJlIHVzZWQgdG8gZGlzcGxheSBhIHdhaXRpbmctIG9yIHByb2Nlc3NpbmctYW5pbWF0aW9uIGZvciBleGFtcGxlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjYXJldFBvc2l0aW9uXG4gICAgICAgICogQHR5cGUgZ3MuUG9pbnRcbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBjYXJldFBvc2l0aW9uID0gbmV3IGdzLlBvaW50KClcblxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIHRoYXQgdGhlIGEgbWVzc2FnZSBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MuXG4gICAgICAgICogQHByb3BlcnR5IGlzUnVubmluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1J1bm5pbmcgPSBub1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCB4LWNvb3JkaW5hdGUgb2YgdGhlIGNhcmV0L2N1cnNvci5cbiAgICAgICAgKiBAcHJvcGVydHkgY3VycmVudFhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50WCA9IDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGN1cnJlbnQgeS1jb29yZGluYXRlIG9mIHRoZSBjYXJldC9jdXJzb3IuXG4gICAgICAgICogQHByb3BlcnR5IGN1cnJlbnRZXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAY3VycmVudFkgPSAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjdXJyZW50IHNwcml0ZXMgdXNlZCB0byBkaXNwbGF5IHRoZSBjdXJyZW50IHRleHQtbGluZS9wYXJ0LlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXJyZW50U3ByaXRlXG4gICAgICAgICogQHR5cGUgZ3MuU3ByaXRlXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAY3VycmVudFNwcml0ZSA9IG51bGxcblxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBtZXNzYWdlLXJlbmRlcmVyIGlzIGN1cnJlbnRseSB3YWl0aW5nIGxpa2UgZm9yIGEgdXNlci1hY3Rpb24uXG4gICAgICAgICogQHByb3BlcnR5IGlzV2FpdGluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1dhaXRpbmcgPSBub1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIG1lc3NhZ2UtcmVuZGVyZXIgaXMgY3VycmVudGx5IHdhaXRpbmcgZm9yIGEga2V5LXByZXNzIG9yIG1vdXNlL3RvdWNoIGFjdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgd2FpdEZvcktleVxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEB3YWl0Rm9yS2V5ID0gbm9cblxuICAgICAgICAjIyMqXG4gICAgICAgICogTnVtYmVyIG9mIGZyYW1lcyB0aGUgbWVzc2FnZS1yZW5kZXJlciBzaG91bGQgd2FpdCBiZWZvcmUgY29udGludWUuXG4gICAgICAgICogQHByb3BlcnR5IHdhaXRDb3VudGVyXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAd2FpdENvdW50ZXIgPSAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFNwZWVkIG9mIHRoZSBtZXNzYWdlLWRyYXdpbmcuIFRoZSBzbWFsbGVyIHRoZSB2YWx1ZSwgdGhlIGZhc3RlciB0aGUgbWVzc2FnZSBpcyBkaXNwbGF5ZWQuXG4gICAgICAgICogQHByb3BlcnR5IHNwZWVkXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAc3BlZWQgPSAxXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgbWVzc2FnZSBzaG91bGQgYmUgcmVuZGVyZWQgaW1tZWRpYWx0ZWx5IHdpdGhvdXQgYW55IGFuaW1hdGlvbiBvciBkZWxheS5cbiAgICAgICAgKiBAcHJvcGVydHkgZHJhd0ltbWVkaWF0ZWx5XG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9IG5vXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgbWVzc2FnZSBzaG91bGQgd2FpdCBmb3IgYSB1c2VyLWFjdGlvbiBvciBhIGNlcnRhaW4gYW1vdW50IG9mIHRpbWVcbiAgICAgICAgKiBiZWZvcmUgZmluaXNoaW5nLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0QXRFbmRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAd2FpdEF0RW5kID0geWVzXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBudW1iZXIgb2YgZnJhbWVzIHRvIHdhaXQgYmVmb3JlIGZpbmlzaGluZyBhIG1lc3NhZ2UuXG4gICAgICAgICogYmVmb3JlIGZpbmlzaGluZy5cbiAgICAgICAgKiBAcHJvcGVydHkgd2FpdEF0RW5kVGltZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHdhaXRBdEVuZFRpbWUgPSAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiBhdXRvIHdvcmQtd3JhcCBzaG91bGQgYmUgdXNlZC4gRGVmYXVsdCBpcyA8Yj50cnVlPC9iPlxuICAgICAgICAqIEBwcm9wZXJ0eSB3b3JkV3JhcFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEB3b3JkV3JhcCA9IHllc1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDdXN0b20gZ2FtZSBvYmplY3RzIHdoaWNoIGFyZSBhbGl2ZSB1bnRpbCB0aGUgY3VycmVudCBtZXNzYWdlIGlzIGVyYXNlZC4gQ2FuIGJlIHVzZWQgdG8gZGlzcGxheVxuICAgICAgICAqIGFuaW1hdGVkIGljb25zLCBldGMuXG4gICAgICAgICogQHByb3BlcnR5IGN1c3RvbU9iamVjdHNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQmFzZVtdXG4gICAgICAgICMjI1xuICAgICAgICBAY3VzdG9tT2JqZWN0cyA9IFtdXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEEgaGFzaHRhYmxlL2RpY3Rpb25hcnkgb2JqZWN0IHRvIHN0b3JlIGN1c3RvbS1kYXRhIHVzZWZ1bCBsaWtlIGZvciB0b2tlbi1wcm9jZXNzaW5nLiBUaGUgZGF0YSBtdXN0IGJlXG4gICAgICAgICogc2VyaWFsaXphYmxlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXN0b21PYmplY3RzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAY3VzdG9tRGF0YSA9IHt9XG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEEgY2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGlmIHRoZSBwbGF5ZXIgY2xpY2tzIG9uIGEgbm9uLXN0eWxhYmxlIGxpbmsgKExLIHRleHQtY29kZSkgdG8gdHJpZ2dlclxuICAgICAgICAqIHRoZSBzcGVjaWZpZWQgY29tbW9uIGV2ZW50LlxuICAgICAgICAqIEBwcm9wZXJ0eSBvbkxpbmtDbGlja1xuICAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgICMjI1xuICAgICAgICBAb25MaW5rQ2xpY2sgPSAoZSkgLT5cbiAgICAgICAgICAgIGV2ZW50SWQgPSBlLmRhdGEubGlua0RhdGEuY29tbW9uRXZlbnRJZFxuICAgICAgICAgICAgZXZlbnQgPSBSZWNvcmRNYW5hZ2VyLmNvbW1vbkV2ZW50c1tldmVudElkXVxuICAgICAgICAgICAgaWYgIWV2ZW50XG4gICAgICAgICAgICAgICAgZXZlbnQgPSBSZWNvcmRNYW5hZ2VyLmNvbW1vbkV2ZW50cy5maXJzdCAoeCkgPT4geC5uYW1lID09IGV2ZW50SWRcbiAgICAgICAgICAgICAgICBldmVudElkID0gZXZlbnQuaW5kZXggaWYgZXZlbnRcbiAgICAgICAgICAgIGlmICFldmVudFxuICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5pbnRlcnByZXRlci5qdW1wVG9MYWJlbChldmVudElkKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5pbnRlcnByZXRlci5jYWxsQ29tbW9uRXZlbnQoZXZlbnRJZCwgbnVsbCwgeWVzKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBIGNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCBpZiBhIGJhdGNoZWQgbWVzc3NhZ2UgaGFzIGJlZW4gZmFkZWQgb3V0LiBJdCB0cmlnZ2VycyB0aGUgZXhlY3V0aW9uIG9mXG4gICAgICAgICogdGhlIG5leHQgbWVzc2FnZS5cbiAgICAgICAgKiBAcHJvcGVydHkgb25CYXRjaERpc2FwcGVhclxuICAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgICMjI1xuICAgICAgICBAb25CYXRjaERpc2FwcGVhciA9IChlKSA9PlxuICAgICAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9IG5vXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cbiAgICAgICAgICAgIEBvYmplY3Qub3BhY2l0eSA9IDI1NVxuICAgICAgICAgICAgQGV4ZWN1dGVCYXRjaCgpXG5cblxuICAgICMjIypcbiAgICAqIFNlcmlhbGl6ZXMgdGhlIG1lc3NhZ2UgdGV4dC1yZW5kZXJlciBpbnRvIGEgZGF0YS1idW5kbGUuXG4gICAgKiBAbWV0aG9kIHRvRGF0YUJ1bmRsZVxuICAgICogQHJldHVybiB7T2JqZWN0fSBBIGRhdGEtYnVuZGxlLlxuICAgICMjI1xuICAgIHRvRGF0YUJ1bmRsZTogLT5cbiAgICAgICAgaWdub3JlID0gW1wib2JqZWN0XCIsIFwiZm9udFwiLCBcInNwcml0ZXNcIiwgXCJhbGxTcHJpdGVzXCIsIFwiY3VycmVudFNwcml0ZVwiLCBcImN1cnJlbnRYXCJdXG4gICAgICAgIGJ1bmRsZSA9IHsgY3VycmVudFNwcml0ZUluZGV4OiBAc3ByaXRlcy5pbmRleE9mKEBjdXJyZW50U3ByaXRlKSB9XG5cbiAgICAgICAgZm9yIGsgb2YgdGhpc1xuICAgICAgICAgICAgaWYgaWdub3JlLmluZGV4T2YoaykgPT0gLTFcbiAgICAgICAgICAgICAgICBidW5kbGVba10gPSB0aGlzW2tdXG5cbiAgICAgICAgcmV0dXJuIGJ1bmRsZVxuXG5cblxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBtZXNzYWdlIHRleHQtcmVuZGVyZXIgYW5kIGFsbCBzcHJpdGVzIHVzZWQgdG8gZGlzcGxheVxuICAgICogdGhlIG1lc3NhZ2UuXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyNcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBzdXBlclxuXG4gICAgICAgIEBkaXNwb3NlRXZlbnRIYW5kbGVycygpXG5cbiAgICAgICAgZm9yIHNwcml0ZSBpbiBAYWxsU3ByaXRlc1xuICAgICAgICAgICAgc3ByaXRlLmJpdG1hcD8uZGlzcG9zZSgpXG4gICAgICAgICAgICBzcHJpdGUuZGlzcG9zZSgpXG5cbiAgICAjIyMqXG4gICAgKiBSZW1vdmVzIGFsbCBhdHRhY2hlZCBldmVudCBoYW5kbGVyc1xuICAgICogdGhlIG1lc3NhZ2UuXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VFdmVudEhhbmRsZXJzXG4gICAgIyMjXG4gICAgZGlzcG9zZUV2ZW50SGFuZGxlcnM6IC0+XG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCBAb2JqZWN0KVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleVVwXCIsIEBvYmplY3QpXG5cbiAgICAjIyMqXG4gICAgKiBBZGRzIGV2ZW50LWhhbmRsZXJzIGZvciBtb3VzZS90b3VjaCBldmVudHNcbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwRXZlbnRIYW5kbGVyc1xuICAgICMjI1xuICAgIHNldHVwRXZlbnRIYW5kbGVyczogLT5cbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZVVwXCIsIEBvYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwia2V5VXBcIiwgQG9iamVjdClcblxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJtb3VzZVVwXCIsICgoZSkgPT5cbiAgICAgICAgICAgIHJldHVybiBpZiAhQG9iamVjdC5jYW5SZWNlaXZlSW5wdXQoKVxuICAgICAgICAgICAgcmV0dXJuIGlmIEBvYmplY3QuZmluZENvbXBvbmVudEJ5TmFtZShcImFuaW1hdGlvblwiKSBvciAoR2FtZU1hbmFnZXIuc2V0dGluZ3MuYXV0b01lc3NhZ2UuZW5hYmxlZCBhbmQgIUdhbWVNYW5hZ2VyLnNldHRpbmdzLmF1dG9NZXNzYWdlLnN0b3BPbkFjdGlvbilcbiAgICAgICAgICAgIHJldHVybiBpZiBJbnB1dC5Nb3VzZS5idXR0b25zW0lucHV0Lk1vdXNlLkxFRlRdICE9IDJcbiAgICAgICAgICAgICNpZiBAb2JqZWN0LmRzdFJlY3QuY29udGFpbnMoSW5wdXQuTW91c2UueCAtIEBvYmplY3Qub3JpZ2luLngsIElucHV0Lk1vdXNlLnkgLSBAb2JqZWN0Lm9yaWdpbi55KVxuICAgICAgICAgICAgaWYgQGlzV2FpdGluZyBhbmQgbm90IChAd2FpdENvdW50ZXIgPiAwIG9yIEB3YWl0Rm9yS2V5KVxuICAgICAgICAgICAgICAgIGUuYnJlYWtDaGFpbiA9IHllc1xuICAgICAgICAgICAgICAgIEBjb250aW51ZSgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZS5icmVha0NoYWluID0gQGlzUnVubmluZ1xuICAgICAgICAgICAgICAgIEBkcmF3SW1tZWRpYXRlbHkgPSAhQHdhaXRGb3JLZXlcbiAgICAgICAgICAgICAgICBAd2FpdENvdW50ZXIgPSAwXG4gICAgICAgICAgICAgICAgQHdhaXRGb3JLZXkgPSBub1xuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuXG4gICAgICAgICAgICBpZiBAd2FpdEZvcktleVxuICAgICAgICAgICAgICAgIGlmIElucHV0Lk1vdXNlLmJ1dHRvbnNbSW5wdXQuTW91c2UuTEVGVF0gPT0gMlxuICAgICAgICAgICAgICAgICAgICBlLmJyZWFrQ2hhaW4gPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgSW5wdXQuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICBAd2FpdEZvcktleSA9IG5vXG4gICAgICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuXG5cblxuXG4gICAgICAgICksIG51bGwsIEBvYmplY3RcblxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJrZXlVcFwiLCAoKGUpID0+XG4gICAgICAgICAgICByZXR1cm4gaWYgIUBvYmplY3QuY2FuUmVjZWl2ZUlucHV0KClcbiAgICAgICAgICAgIGlmIElucHV0LmtleXNbSW5wdXQuQ10gYW5kICghQGlzV2FpdGluZyBvciAoQHdhaXRDb3VudGVyID4gMCBvciBAd2FpdEZvcktleSkpXG4gICAgICAgICAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9ICFAd2FpdEZvcktleVxuICAgICAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IDBcbiAgICAgICAgICAgICAgICBAd2FpdEZvcktleSA9IG5vXG4gICAgICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG5cbiAgICAgICAgICAgIGlmIEBpc1dhaXRpbmcgYW5kICFAd2FpdEZvcktleSBhbmQgIUB3YWl0Q291bnRlciBhbmQgSW5wdXQua2V5c1tJbnB1dC5DXVxuICAgICAgICAgICAgICAgIEBjb250aW51ZSgpXG5cbiAgICAgICAgICAgIGlmIEB3YWl0Rm9yS2V5XG4gICAgICAgICAgICAgICAgaWYgSW5wdXQua2V5c1tJbnB1dC5DXVxuICAgICAgICAgICAgICAgICAgICBJbnB1dC5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgIEB3YWl0Rm9yS2V5ID0gbm9cbiAgICAgICAgICAgICAgICAgICAgQGlzV2FpdGluZyA9IG5vXG5cbiAgICAgICAgKSwgbnVsbCwgQG9iamVjdFxuXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCB0aGUgcmVuZGVyZXIuIFJlZ2lzdGVycyBuZWNlc3NhcnkgZXZlbnQgaGFuZGxlcnMuXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgIyMjXG4gICAgc2V0dXA6IC0+XG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgdGhlIG1lc3NhZ2UgdGV4dC1yZW5kZXJlcidzIHN0YXRlIGZyb20gYSBkYXRhLWJ1bmRsZS5cbiAgICAqIEBtZXRob2QgcmVzdG9yZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGJ1bmRsZSAtIEEgZGF0YS1idW5kbGUgY29udGFpbmluZyBtZXNzYWdlIHRleHQtcmVuZGVyZXIgc3RhdGUuXG4gICAgIyMjXG4gICAgcmVzdG9yZTogKGJ1bmRsZSkgLT5cbiAgICAgICAgZm9yIGsgb2YgYnVuZGxlXG4gICAgICAgICAgICBpZiBrID09IFwiY3VycmVudFNwcml0ZUluZGV4XCJcbiAgICAgICAgICAgICAgICBAY3VycmVudFNwcml0ZSA9IEBzcHJpdGVzW2J1bmRsZS5jdXJyZW50U3ByaXRlSW5kZXhdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpc1trXSA9IGJ1bmRsZVtrXVxuXG4gICAgICAgIGlmIEBzcHJpdGVzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIEBjdXJyZW50WSA9IEBzcHJpdGVzLmxhc3QoKS55IC0gQG9iamVjdC5vcmlnaW4ueSAtIEBvYmplY3QuZHN0UmVjdC55XG4gICAgICAgICAgICBAbGluZSA9IEBtYXhMaW5lc1xuICAgICAgICAgICAgQGlzV2FpdGluZyA9IEBpc1dhaXRpbmcgfHwgQGlzUnVubmluZ1xuXG4gICAgICAgIHJldHVybiBudWxsXG5cblxuICAgICMjIypcbiAgICAqIENvbnRpbnVlcyBtZXNzYWdlLXByb2Nlc3NpbmcgaWYgY3VycmVudGx5IHdhaXRpbmcuXG4gICAgKiBAbWV0aG9kIGNvbnRpbnVlXG4gICAgIyMjXG4gICAgY29udGludWU6IC0+XG4gICAgICAgIEBpc1dhaXRpbmcgPSBub1xuXG4gICAgICAgIGlmIEBsaW5lID49IEBsaW5lcy5sZW5ndGhcbiAgICAgICAgICAgIEBpc1J1bm5pbmcgPSBub1xuICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJtZXNzYWdlRmluaXNoXCIsIHRoaXMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwibWVzc2FnZUJhdGNoXCIsIHRoaXMpXG4gICAgICAgICAgICBmYWRpbmcgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3MubWVzc2FnZUZhZGluZ1xuICAgICAgICAgICAgZHVyYXRpb24gPSBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcCB0aGVuIDAgZWxzZSBmYWRpbmcuZHVyYXRpb25cbiAgICAgICAgICAgIEBvYmplY3QuYW5pbWF0b3IuZGlzYXBwZWFyKGZhZGluZy5hbmltYXRpb24sIGZhZGluZy5lYXNpbmcsIGR1cmF0aW9uLCBncy5DYWxsQmFjayhcIm9uQmF0Y2hEaXNhcHBlYXJcIiwgdGhpcykpXG5cbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSB0ZXh0LXJlbmRlcmVyLlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyNcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIGZvciBzcHJpdGUgaW4gQGFsbFNwcml0ZXNcbiAgICAgICAgICAgIHNwcml0ZS5vcGFjaXR5ID0gQG9iamVjdC5vcGFjaXR5XG4gICAgICAgICAgICBzcHJpdGUudmlzaWJsZSA9IEBvYmplY3QudmlzaWJsZVxuICAgICAgICAgICAgc3ByaXRlLm94ID0gLUBvYmplY3Qub2Zmc2V0LnhcbiAgICAgICAgICAgIHNwcml0ZS5veSA9IC1Ab2JqZWN0Lm9mZnNldC55XG4gICAgICAgICAgICBzcHJpdGUubWFzay52YWx1ZSA9IEBvYmplY3QubWFzay52YWx1ZVxuICAgICAgICAgICAgc3ByaXRlLm1hc2sudmFndWUgPSBAb2JqZWN0Lm1hc2sudmFndWVcbiAgICAgICAgICAgIHNwcml0ZS5tYXNrLnNvdXJjZSA9IEBvYmplY3QubWFzay5zb3VyY2VcbiAgICAgICAgICAgIHNwcml0ZS5tYXNrLnR5cGUgPSBAb2JqZWN0Lm1hc2sudHlwZVxuXG4gICAgICAgIGZvciBvYmplY3QgaW4gQGN1c3RvbU9iamVjdHNcbiAgICAgICAgICAgIG9iamVjdC5vcGFjaXR5ID0gQG9iamVjdC5vcGFjaXR5XG4gICAgICAgICAgICBvYmplY3QudmlzaWJsZSA9IEBvYmplY3QudmlzaWJsZVxuXG4gICAgICAgIGlmIG5vdCBAaXNSdW5uaW5nIGFuZCBAd2FpdENvdW50ZXIgPiAwXG4gICAgICAgICAgICBAd2FpdENvdW50ZXItLVxuICAgICAgICAgICAgaWYgQHdhaXRDb3VudGVyID09IDBcbiAgICAgICAgICAgICAgICBAY29udGludWUoKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgaWYgQG9iamVjdC52aXNpYmxlIGFuZCBAbGluZXM/Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIEB1cGRhdGVMaW5lV3JpdGluZygpXG4gICAgICAgICAgICBAdXBkYXRlV2FpdEZvcktleSgpXG4gICAgICAgICAgICBAdXBkYXRlV2FpdENvdW50ZXIoKVxuICAgICAgICAgICAgQHVwZGF0ZUNhcmV0UG9zaXRpb24oKVxuXG5cblxuXG5cbiAgICAjIyMqXG4gICAgKiBBbGlnbm1lbnQgb2YgdGhlIG1lc3NhZ2UncyBsaW5lcyBhcyBpdCBpcyBkZWZpbmVkIGJ5IG1lc3NhZ2Ugc2V0dGluZ3MuXG4gICAgKlxuICAgICogQG1ldGhvZCBsaW5lQWxpZ25tZW50XG4gICAgKiBAcmV0dXJuIFwibFwiIGZvciBMZWZ0LCBcIm1cIiBmb3IgTWlkZGxlL0NlbnRlcmVkLCBcInJcIiBmb3IgUmlnaHRcbiAgICAjIyNcbiAgICBsaW5lQWxpZ25tZW50OiAtPiBAb2JqZWN0LnNldHRpbmdzLmxpbmVBbGlnbm1lbnQgfHwgXCJsXCJcbiAgICBcbiAgICAjIyMqXG4gICAgKiBJbmRpY2F0ZXMgaWYgaXRzIGEgYmF0Y2hlZCBtZXNzYWdlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGlzQmF0Y2hlZFxuICAgICogQHJldHVybiBJZiA8Yj50cnVlPC9iPiBpdCBpcyBhIGJhdGNoZWQgbWVzc2FnZS4gT3RoZXJ3aXNlIDxiPmZhbHNlPC9iPi5cbiAgICAjIyNcbiAgICBpc0JhdGNoZWQ6IC0+IEBsaW5lcy5sZW5ndGggPiBAbWF4TGluZXNcblxuICAgICMjIypcbiAgICAqIEluZGljYXRlcyBpZiB0aGUgYmF0Y2ggaXMgc3RpbGwgaW4gcHJvZ3Jlc3MgYW5kIG5vdCBkb25lLlxuICAgICpcbiAgICAqIEBtZXRob2QgaXNCYXRjaEluUHJvZ3Jlc3NcbiAgICAqIEByZXR1cm4gSWYgPGI+dHJ1ZTwvYj4gdGhlIGJhdGNoZWQgbWVzc2FnZSBpcyBzdGlsbCBub3QgZG9uZS4gT3RoZXJ3aXNlIDxiPmZhbHNlPC9iPlxuICAgICMjI1xuICAgIGlzQmF0Y2hJblByb2dyZXNzOiAtPiBAbGluZXMubGVuZ3RoIC0gQGxpbmUgPiBAbWF4TGluZXNcblxuICAgICMjIypcbiAgICAqIEluZGljYXRlcyBpZiB0aGUgcmVuZGVyZXIgcnVucyBpbiBtdWx0aS1wYXJ0IG1lc3NhZ2UgbW9kZSB3aGljaFxuICAgICogbWVhbnMgdGhhdCBhIHNpbmdsZSBtZXNzYWdlIG1pZ2h0IGJlIGNvbnN0cnVjdGVkIGZyb20gbXVsdGlwbGUgZHJhd0Zvcm1hdHRlZFRleHRcbiAgICAqIGNhbGxzLlxuICAgICpcbiAgICAqIEBtZXRob2QgaXNSdW5uaW5nSW5NdWx0aVBhcnRNb2RlXG4gICAgKiBAcmV0dXJuIElmIDxiPnRydWU8L2I+IHRoZSByZW5kZXJlciBydW5zIGluIG11bHRpLXBhcnQgbW9kZS4gT3RoZXJ3aXNlIDxiPmZhbHNlPC9iPi5cbiAgICAjIyNcbiAgICBpc1J1bm5pbmdJbk11bHRpUGFydE1vZGU6IC0+ICFAb2JqZWN0LnNldHRpbmdzLmF1dG9FcmFzZSBhbmQgQG9iamVjdC5zZXR0aW5ncy5wYXJhZ3JhcGhTcGFjaW5nIDw9IDBcblxuICAgICMjIypcbiAgICAqIFN0YXJ0cyBkaXNwbGF5aW5nIHRoZSBuZXh0IHBhZ2Ugb2YgdGV4dCBpZiBhIG1lc3NhZ2UgaXMgdG9vIGxvbmcgdG8gZml0XG4gICAgKiBpbnRvIG9uZSBtZXNzYWdlIGJveC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVCYXRjaFxuICAgICMjI1xuICAgIGV4ZWN1dGVCYXRjaDogLT5cbiAgICAgICAgQGNsZWFyQWxsU3ByaXRlcygpXG4gICAgICAgIEBsaW5lcyA9IEBsaW5lcy5zbGljZShAbGluZSlcbiAgICAgICAgQGxpbmUgPSAwXG4gICAgICAgIEBjdXJyZW50WCA9IDBcbiAgICAgICAgQGN1cnJlbnRZID0gMFxuICAgICAgICBAY3VycmVudExpbmVIZWlnaHQgPSAwXG4gICAgICAgIEB0b2tlbkluZGV4ID0gMFxuICAgICAgICBAY2hhckluZGV4ID0gMFxuICAgICAgICBAdG9rZW4gPSBAbGluZXNbQGxpbmVdLmNvbnRlbnRbQHRva2VuSW5kZXhdIHx8IG5ldyBncy5SZW5kZXJlclRva2VuKG51bGwsIFwiXCIpO1xuICAgICAgICBAbWF4TGluZXMgPSBAY2FsY3VsYXRlTWF4TGluZXMoQGxpbmVzKVxuICAgICAgICBAbGluZUFuaW1hdGlvbkNvdW50ID0gQHNwZWVkXG4gICAgICAgIEBzcHJpdGVzID0gQGNyZWF0ZVNwcml0ZXMoQGxpbmVzKVxuICAgICAgICBAYWxsU3ByaXRlcyA9IEBhbGxTcHJpdGVzLmNvbmNhdChAc3ByaXRlcylcbiAgICAgICAgQGN1cnJlbnRTcHJpdGUgPSBAc3ByaXRlc1tAbGluZV1cbiAgICAgICAgQGN1cnJlbnRTcHJpdGUueCA9IEBjdXJyZW50WCArIEBvYmplY3Qub3JpZ2luLnggKyBAb2JqZWN0LmRzdFJlY3QueFxuICAgICAgICBAZHJhd05leHQoKVxuXG4gICAgIyMjKlxuICAgICogQ2FsY3VsYXRlcyB0aGUgZHVyYXRpb24oaW4gZnJhbWVzKSB0aGUgbWVzc2FnZS1yZW5kZXJlciBuZWVkcyB0byBkaXNwbGF5XG4gICAgKiB0aGUgbWVzc2FnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNhbGN1bGF0ZUR1cmF0aW9uXG4gICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgIyMjXG4gICAgY2FsY3VsYXRlRHVyYXRpb246IC0+XG4gICAgICAgIGR1cmF0aW9uID0gMFxuXG4gICAgICAgIGlmIEBsaW5lcz9cbiAgICAgICAgICAgIGZvciBsaW5lIGluIEBsaW5lc1xuICAgICAgICAgICAgICAgIGZvciB0b2tlbiBpbiBsaW5lLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW4/XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiArPSBAY2FsY3VsYXRlRHVyYXRpb25Gb3JUb2tlbih0b2tlbilcbiAgICAgICAgcmV0dXJuIGR1cmF0aW9uXG5cbiAgICAjIyMqXG4gICAgKiBDYWxjdWxhdGVzIHRoZSBkdXJhdGlvbihpbiBmcmFtZXMpIHRoZSBtZXNzYWdlLXJlbmRlcmVyIG5lZWRzIHRvIGRpc3BsYXlcbiAgICAqIHRoZSBzcGVjaWZpZWQgbGluZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNhbGN1bGF0ZUR1cmF0aW9uRm9yTGluZVxuICAgICogQHBhcmFtIHtncy5SZW5kZXJlclRleHRMaW5lfSBsaW5lIFRoZSBsaW5lIHRvIGNhbGN1bGF0ZSB0aGUgZHVyYXRpb24gZm9yLlxuICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICMjI1xuICAgIGNhbGN1bGF0ZUR1cmF0aW9uRm9yTGluZTogKGxpbmUpIC0+XG4gICAgICAgIGR1cmF0aW9uID0gMFxuXG4gICAgICAgIGlmIGxpbmVcbiAgICAgICAgICAgIGZvciB0b2tlbiBpbiBsaW5lLmNvbnRlbnRcbiAgICAgICAgICAgICAgICBpZiB0b2tlbj9cbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gKz0gQGNhbGN1bGF0ZUR1cmF0aW9uRm9yVG9rZW4odG9rZW4pXG5cbiAgICAgICAgcmV0dXJuIGR1cmF0aW9uXG5cbiAgICAjIyMqXG4gICAgKiBDYWxjdWxhdGVzIHRoZSBkdXJhdGlvbihpbiBmcmFtZXMpIHRoZSBtZXNzYWdlLXJlbmRlcmVyIG5lZWRzIHRvIHByb2Nlc3NcbiAgICAqIHRoZSBzcGVjaWZpZWQgdG9rZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBjYWxjdWxhdGVEdXJhdGlvbkZvclRva2VuXG4gICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IHRva2VuIC0gVGhlIHRva2VuLlxuICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICMjI1xuICAgIGNhbGN1bGF0ZUR1cmF0aW9uRm9yVG9rZW46ICh0b2tlbikgLT5cbiAgICAgICAgZHVyYXRpb24gPSAwXG5cbiAgICAgICAgaWYgdG9rZW4uY29kZT9cbiAgICAgICAgICAgIHN3aXRjaCB0b2tlbi5jb2RlXG4gICAgICAgICAgICAgICAgd2hlbiBcIldcIlxuICAgICAgICAgICAgICAgICAgICBpZiB0b2tlbi52YWx1ZSAhPSBcIkFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gPSB0b2tlbi52YWx1ZSAvIDEwMDAgKiBHcmFwaGljcy5mcmFtZVJhdGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZHVyYXRpb24gPSB0b2tlbi52YWx1ZS5sZW5ndGggKiBAc3BlZWRcblxuICAgICAgICByZXR1cm4gZHVyYXRpb25cblxuICAgICMjIypcbiAgICAqIENhbGN1bGF0ZXMgdGhlIG1heGltdW0gb2YgbGluZXMgd2hpY2ggY2FuIGJlIGRpc3BsYXllZCBpbiBvbmUgbWVzc2FnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNhbGN1bGF0ZU1heExpbmVzXG4gICAgKiBAcGFyYW0ge0FycmF5fSBsaW5lcyAtIEFuIGFycmF5IG9mIGxpbmUtb2JqZWN0cy5cbiAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBkaXNwbGF5YWJsZSBsaW5lcy5cbiAgICAjIyNcbiAgICBjYWxjdWxhdGVNYXhMaW5lczogKGxpbmVzKSAtPlxuICAgICAgICBoZWlnaHQgPSAwXG4gICAgICAgIHJlc3VsdCA9IDBcblxuICAgICAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICAgICAgICAgIGhlaWdodCArPSBsaW5lLmhlaWdodCArIEBsaW5lU3BhY2luZ1xuICAgICAgICAgICAgICAgIGlmIEBjdXJyZW50WStoZWlnaHQgPiAoQG9iamVjdC5kc3RSZWN0LmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICByZXN1bHQrK1xuXG4gICAgICAgIHJldHVybiBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIHJlc3VsdCB8fCAxKVxuXG4gICAgIyMjKlxuICAgICogRGlzcGxheXMgdGhlIGNoYXJhY3RlciBvciBwcm9jZXNzZXMgdGhlIG5leHQgY29udHJvbC10b2tlbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRyYXdOZXh0XG4gICAgIyMjXG4gICAgZHJhd05leHQ6IC0+XG4gICAgICAgIHRva2VuID0gQHByb2Nlc3NUb2tlbigpXG5cbiAgICAgICAgaWYgdG9rZW4/LnZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIEBjaGFyID0gQHRva2VuLnZhbHVlLmNoYXJBdChAY2hhckluZGV4KVxuXG4gICAgICAgICAgICBzaXplID0gQGZvbnQubWVhc3VyZVRleHRQbGFpbihAY2hhcilcbiAgICAgICAgICAgIGxpbmVTcGFjaW5nID0gQGxpbmVTcGFjaW5nXG5cbiAgICAgICAgICAgIGlmIEBjdXJyZW50TGluZSAhPSBAbGluZVxuICAgICAgICAgICAgICAgIEBjdXJyZW50TGluZSA9IEBsaW5lXG4gICAgICAgICAgICAgICAjIEBjdXJyZW50WSArPSBAY3VycmVudExpbmVIZWlnaHQgKyBsaW5lU3BhY2luZyAqIEdyYXBoaWNzLnNjYWxlXG4gICAgICAgICAgICAgICAgQGN1cnJlbnRMaW5lSGVpZ2h0ID0gMFxuXG4gICAgICAgICAgICBAY3VycmVudFNwcml0ZS55ID0gQG9iamVjdC5vcmlnaW4ueSArIEBvYmplY3QuZHN0UmVjdC55ICsgQGN1cnJlbnRZXG4gICAgICAgICAgICBAY3VycmVudFNwcml0ZS52aXNpYmxlID0geWVzXG4gICAgICAgICAgICBAZHJhd0xpbmVDb250ZW50KEBsaW5lc1tAbGluZV0sIEBjdXJyZW50U3ByaXRlLmJpdG1hcCwgQGNoYXJJbmRleCsxKVxuICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUuc3JjUmVjdC53aWR0aCA9IEBjdXJyZW50U3ByaXRlLmJpdG1hcC53aWR0aCAjTWF0aC5taW4oQGN1cnJlbnRTcHJpdGUuc3JjUmVjdC53aWR0aCArIHNpemUud2lkdGgsIEBjdXJyZW50U3ByaXRlLmJpdG1hcC53aWR0aClcbiAgICAgICAgICAgICMgQ0VOVEVSIFRFWFRcbiAgICAgICAgICAgIHN3aXRjaCBAbGluZUFsaWdubWVudCgpXG4gICAgICAgICAgICAgICAgd2hlbiBcIm1cIlxuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFNwcml0ZS54ID0gQG9iamVjdC5vcmlnaW4ueCArIEBvYmplY3QuZHN0UmVjdC54ICsgKEBvYmplY3QuZHN0UmVjdC53aWR0aCAtIEBsaW5lc1tAbGluZV0uY29udGVudFdpZHRoKSAvIDJcbiAgICAgICAgICAgICAgICB3aGVuIFwiclwiXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50U3ByaXRlLnggPSBAb2JqZWN0Lm9yaWdpbi54ICsgQG9iamVjdC5kc3RSZWN0LnggKyAoQG9iamVjdC5kc3RSZWN0LndpZHRoIC0gQGxpbmVzW0BsaW5lXS5jb250ZW50V2lkdGgpXG4gICAgICAgICAgICBAY3VycmVudExpbmVIZWlnaHQgPSBAbGluZXNbQGxpbmVdLmhlaWdodFxuICAgICAgICAgICAgQGN1cnJlbnRYID0gTWF0aC5taW4oQGxpbmVzW0BsaW5lXS53aWR0aCwgQGN1cnJlbnRYICsgc2l6ZS53aWR0aClcblxuICAgICMjIypcbiAgICAqIFByb2Nlc3NlcyB0aGUgbmV4dCBjaGFyYWN0ZXIvdG9rZW4gb2YgdGhlIG1lc3NhZ2UuXG4gICAgKiBAbWV0aG9kIG5leHRDaGFyXG4gICAgKiBAcHJpdmF0ZVxuICAgICMjI1xuICAgIG5leHRDaGFyOiAtPlxuICAgICAgICBsb29wXG4gICAgICAgICAgICBAY2hhckluZGV4KytcbiAgICAgICAgICAgIEBsaW5lQW5pbWF0aW9uQ291bnQgPSBAc3BlZWRcblxuICAgICAgICAgICAgaWYgQHRva2VuLmNvZGU/IG9yIEBjaGFySW5kZXggPj0gQHRva2VuLnZhbHVlLmxlbmd0aFxuICAgICAgICAgICAgICAgIEB0b2tlbi5vbkVuZD8oKVxuICAgICAgICAgICAgICAgIEB0b2tlbkluZGV4KytcbiAgICAgICAgICAgICAgICBpZiBAdG9rZW5JbmRleCA+PSBAbGluZXNbQGxpbmVdLmNvbnRlbnQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIEB0b2tlbkluZGV4ID0gMFxuICAgICAgICAgICAgICAgICAgICBAbGluZSsrXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50U3ByaXRlLnNyY1JlY3Qud2lkdGggPSBAY3VycmVudFNwcml0ZS5iaXRtYXAud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRTcHJpdGUgPSBAc3ByaXRlc1tAbGluZV1cbiAgICAgICAgICAgICAgICAgICAgaWYgQGN1cnJlbnRTcHJpdGU/XG4gICAgICAgICAgICAgICAgICAgICAgICBAY3VycmVudFNwcml0ZS54ID0gQG9iamVjdC5vcmlnaW4ueCArIEBvYmplY3QuZHN0UmVjdC54XG4gICAgICAgICAgICAgICAgICAgIGlmIEBsaW5lIDwgQG1heExpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICBAY3VycmVudFkgKz0gKEBjdXJyZW50TGluZUhlaWdodCB8fCBAZm9udC5saW5lSGVpZ2h0KSArIEBsaW5lU3BhY2luZyAqIEdyYXBoaWNzLnNjYWxlXG4gICAgICAgICAgICAgICAgICAgICAgICBAY2hhckluZGV4ID0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRYID0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgQHRva2VuID0gQGxpbmVzW0BsaW5lXS5jb250ZW50W0B0b2tlbkluZGV4XSB8fCBuZXcgZ3MuUmVuZGVyZXJUb2tlbihudWxsLCBcIlwiKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGNoYXJJbmRleCA9IDBcbiAgICAgICAgICAgICAgICAgICAgQHRva2VuID0gQGxpbmVzW0BsaW5lXS5jb250ZW50W0B0b2tlbkluZGV4XSB8fCBuZXcgZ3MuUmVuZGVyZXJUb2tlbihudWxsLCBcIlwiKVxuICAgICAgICAgICAgICAgIEB0b2tlbi5vblN0YXJ0PygpXG5cblxuICAgICAgICAgICAgaWYgIUB0b2tlbiBvciBAdG9rZW4udmFsdWUgIT0gXCJcXG5cIiBvciAhQGxpbmVzW0BsaW5lXVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgIyMjKlxuICAgICogRmluaXNoZXMgdGhlIG1lc3NhZ2UuIERlcGVuZGluZyBvbiB0aGUgbWVzc2FnZSBjb25maWd1cmF0aW9uLCB0aGVcbiAgICAqIG1lc3NhZ2UgdGV4dC1yZW5kZXJlciB3aWxsIG5vdyB3YWl0IGZvciBhIHVzZXItYWN0aW9uIG9yIGEgY2VydGFpbiBhbW91bnRcbiAgICAqIG9mIHRpbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBmaW5pc2hcbiAgICAjIyNcbiAgICBmaW5pc2g6IC0+XG4gICAgICAgIGlmIEB3YWl0QXRFbmRcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwibWVzc2FnZVdhaXRpbmdcIiwgdGhpcylcbiAgICAgICAgZWxzZSBpZiBAd2FpdEF0RW5kVGltZSA+IDBcbiAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IEB3YWl0QXRFbmRUaW1lXG4gICAgICAgICAgICBAaXNXYWl0aW5nID0gbm9cblxuICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJtZXNzYWdlV2FpdGluZ1wiLCB0aGlzKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcIm1lc3NhZ2VXYWl0aW5nXCIsIHRoaXMpXG4gICAgICAgICAgICBAY29udGludWUoKVxuXG4gICAgIyMjKlxuICAgICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIGNhcmV0IGluIHBpeGVscy4gVGhlIGNhcmV0IGlzIGxpa2UgYW4gaW52aXNpYmxlXG4gICAgKiBjdXJzb3IgcG9pbnRpbmcgdG8gdGhlIHgveSBjb29yZGluYXRlcyBvZiB0aGUgbGFzdCByZW5kZXJlZCBjaGFyYWN0ZXIgb2ZcbiAgICAqIHRoZSBtZXNzYWdlLiBUaGF0IHBvc2l0aW9uIGNhbiBiZSB1c2VkIHRvIGRpc3BsYXkgYSB3YWl0aW5nLSBvciBwcm9jZXNzaW5nLWFuaW1hdGlvbiBmb3IgZXhhbXBsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUNhcmV0UG9zaXRpb25cbiAgICAjIyNcbiAgICB1cGRhdGVDYXJldFBvc2l0aW9uOiAtPlxuICAgICAgICBzd2l0Y2ggQGxpbmVBbGlnbm1lbnQoKVxuICAgICAgICAgICAgd2hlbiBcImxcIlxuICAgICAgICAgICAgICAgIEBjYXJldFBvc2l0aW9uLnggPSBAY3VycmVudFggKyBAcGFkZGluZ1xuICAgICAgICAgICAgd2hlbiBcIm1cIlxuICAgICAgICAgICAgICAgIEBjYXJldFBvc2l0aW9uLnggPSBAY3VycmVudFggKyBAcGFkZGluZyArIChAb2JqZWN0LmRzdFJlY3Qud2lkdGggLSBAbGluZXNbTWF0aC5taW4oQGxpbmUsIEBsaW5lcy5sZW5ndGggLSAxKV0/LmNvbnRlbnRXaWR0aCB8fCAwKSAvIDJcbiAgICAgICAgICAgIHdoZW4gXCJyXCJcbiAgICAgICAgICAgICAgICBAY2FyZXRQb3NpdGlvbi54ID0gQGN1cnJlbnRYICsgQHBhZGRpbmcgKyAoQG9iamVjdC5kc3RSZWN0LndpZHRoIC0gQGxpbmVzW01hdGgubWluKEBsaW5lLCBAbGluZXMubGVuZ3RoIC0gMSldPy5jb250ZW50V2lkdGggfHwgMClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAY2FyZXRQb3NpdGlvbi54ID0gQGN1cnJlbnRYICsgQHBhZGRpbmdcbiAgICAgICAgXG4gICAgICAgIEBjYXJldFBvc2l0aW9uLnkgPSBAY3VycmVudFkgKyBAY3VycmVudExpbmVIZWlnaHQvMlxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgbGluZSB3cml0aW5nLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlTGluZVdyaXRpbmdcbiAgICAqIEBwcml2YXRlXG4gICAgIyMjXG4gICAgdXBkYXRlTGluZVdyaXRpbmc6IC0+XG4gICAgICAgIGlmIEBpc1J1bm5pbmcgYW5kICFAaXNXYWl0aW5nIGFuZCAhQHdhaXRGb3JLZXkgYW5kIEB3YWl0Q291bnRlciA8PSAwXG4gICAgICAgICAgICBpZiBAbGluZUFuaW1hdGlvbkNvdW50IDw9IDBcbiAgICAgICAgICAgICAgICBsb29wXG4gICAgICAgICAgICAgICAgICAgIGlmIEBsaW5lIDwgQG1heExpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICBAbmV4dENoYXIoKVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIEBsaW5lID49IEBtYXhMaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgQGZpbmlzaCgpXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBkcmF3TmV4dCgpXG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgdW5sZXNzIChAdG9rZW4uY29kZSBvciBAbGluZUFuaW1hdGlvbkNvdW50IDw9IDAgb3IgQGRyYXdJbW1lZGlhdGVseSkgYW5kICFAd2FpdEZvcktleSBhbmQgQHdhaXRDb3VudGVyIDw9IDAgYW5kIEBpc1J1bm5pbmcgYW5kIEBsaW5lIDwgQG1heExpbmVzXG5cbiAgICAgICAgICAgIGlmIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICAgICAgQGxpbmVBbmltYXRpb25Db3VudCA9IDBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAbGluZUFuaW1hdGlvbkNvdW50LS1cblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgd2FpdC1mb3Ita2V5IHN0YXRlLiBJZiBza2lwcGluZyBpcyBlbmFibGVkLCB0aGUgdGV4dCByZW5kZXJlciB3aWxsXG4gICAgKiBub3Qgd2FpdCBmb3Iga2V5IHByZXNzLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlV2FpdEZvcktleVxuICAgICogQHByaXZhdGVcbiAgICAjIyNcbiAgICB1cGRhdGVXYWl0Rm9yS2V5OiAtPlxuICAgICAgICBpZiBAd2FpdEZvcktleVxuICAgICAgICAgICAgQGlzV2FpdGluZyA9ICFHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgQHdhaXRGb3JLZXkgPSBAaXNXYWl0aW5nXG5cbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHdhaXQgY291bnRlciBpZiB0aGUgdGV4dCByZW5kZXJlciBpcyB3YWl0aW5nIGZvciBhIGNlcnRhaW4gYW1vdW50IG9mIHRpbWUgdG8gcGFzcy4gSWYgc2tpcHBpbmcgaXMgZW5hYmxlZCwgdGhlIHRleHQgcmVuZGVyZXIgd2lsbFxuICAgICogbm90IHdhaXQgZm9yIHRoZSBhY3R1YWwgYW1vdW50IG9mIHRpbWUgYW5kIHNldHMgdGhlIHdhaXQtY291bnRlciB0byAxIGZyYW1lIGluc3RlYWQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVXYWl0Rm9yS2V5XG4gICAgKiBAcHJpdmF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZVdhaXRDb3VudGVyOiAtPlxuICAgICAgICBpZiBAd2FpdENvdW50ZXIgPiAwXG4gICAgICAgICAgICBpZiBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IDFcbiAgICAgICAgICAgIEBpc1dhaXRpbmcgPSB5ZXNcbiAgICAgICAgICAgIEB3YWl0Q291bnRlci0tXG4gICAgICAgICAgICBpZiBAd2FpdENvdW50ZXIgPD0gMFxuICAgICAgICAgICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICAgICAgICAgIEBjb250aW51ZSgpIGlmIEBsaW5lID49IEBtYXhMaW5lc1xuXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhIHRva2VuLW9iamVjdCBmb3IgYSBzcGVjaWZpZWQgdGV4dC1jb2RlLlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlVG9rZW5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlIC0gVGhlIGNvZGUvdHlwZSBvZiB0aGUgdGV4dC1jb2RlLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIHZhbHVlIG9mIHRoZSB0ZXh0LWNvZGUuXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB0b2tlbi1vYmplY3QuXG4gICAgIyMjXG4gICAgY3JlYXRlVG9rZW46IChjb2RlLCB2YWx1ZSkgLT5cbiAgICAgICAgdG9rZW5PYmplY3QgPSBudWxsXG5cbiAgICAgICAgc3dpdGNoIGNvZGVcbiAgICAgICAgICAgIHdoZW4gXCJDRVwiXG4gICAgICAgICAgICAgICAgZGF0YSA9IHZhbHVlLnNwbGl0KFwiL1wiKVxuICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YS5zaGlmdCgpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBpZiBpc05hTih2YWx1ZSkgdGhlbiB2YWx1ZSBlbHNlIHBhcnNlSW50KHZhbHVlKVxuICAgICAgICAgICAgICAgIGZvciBpIGluIFswLi4uZGF0YV1cbiAgICAgICAgICAgICAgICAgICAgaWYgZGF0YVtpXS5zdGFydHNXaXRoKCdcIicpIGFuZCBkYXRhW2ldLmVuZHNXaXRoKCdcIicpXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ldID0gZGF0YVtpXS5zdWJzdHJpbmcoMSwgZGF0YVtpXS5sZW5ndGgtMSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtpXSA9IGlmIGlzTmFOKGRhdGFbaV0pIHRoZW4gZGF0YVtpXSBlbHNlIHBhcnNlRmxvYXQoZGF0YVtpXSlcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHsgY29kZTogY29kZSwgdmFsdWU6IHZhbHVlLCB2YWx1ZXM6IGRhdGEgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHN1cGVyKGNvZGUsIHZhbHVlKVxuXG5cbiAgICAgICAgcmV0dXJuIHRva2VuT2JqZWN0XG4gICAgIyMjKlxuICAgICogPHA+TWVhc3VyZXMgYSBjb250cm9sLXRva2VuLiBJZiBhIHRva2VuIHByb2R1Y2VzIGEgdmlzdWFsIHJlc3VsdCBsaWtlIGRpc3BsYXlpbmcgYW4gaWNvbiB0aGVuIGl0IG11c3QgcmV0dXJuIHRoZSBzaXplIHRha2VuIGJ5XG4gICAgKiB0aGUgdmlzdWFsIHJlc3VsdC4gSWYgdGhlIHRva2VuIGhhcyBubyB2aXN1YWwgcmVzdWx0LCA8Yj5udWxsPC9iPiBtdXN0IGJlIHJldHVybmVkLiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgZm9yIGV2ZXJ5IHRva2VuIHdoZW4gdGhlIG1lc3NhZ2UgaXMgaW5pdGlhbGl6ZWQuPC9wPlxuICAgICpcbiAgICAqIDxwPlRoaXMgbWV0aG9kIGlzIG5vdCBjYWxsZWQgd2hpbGUgdGhlIG1lc3NhZ2UgaXMgcnVubmluZy4gRm9yIHRoYXQgY2FzZSwgc2VlIDxpPnByb2Nlc3NDb250cm9sVG9rZW48L2k+IG1ldGhvZCB3aGljaCBpcyBjYWxsZWRcbiAgICAqIGZvciBldmVyeSB0b2tlbiB3aGlsZSB0aGUgbWVzc2FnZSBpcyBydW5uaW5nLjwvcD5cbiAgICAqXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdG9rZW4gLSBBIGNvbnRyb2wtdG9rZW4uXG4gICAgKiBAcmV0dXJuIHtncy5TaXplfSBUaGUgc2l6ZSBvZiB0aGUgYXJlYSB0YWtlbiBieSB0aGUgdmlzdWFsIHJlc3VsdCBvZiB0aGUgdG9rZW4gb3IgPGI+bnVsbDwvYj4gaWYgdGhlIHRva2VuIGhhcyBubyB2aXN1YWwgcmVzdWx0LlxuICAgICogQG1ldGhvZCBhbmFseXplQ29udHJvbFRva2VuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgbWVhc3VyZUNvbnRyb2xUb2tlbjogKHRva2VuKSAtPiByZXR1cm4gc3VwZXIodG9rZW4pXG5cbiAgICAjIyMqXG4gICAgKiA8cD5EcmF3cyB0aGUgdmlzdWFsIHJlc3VsdCBvZiBhIHRva2VuLCBsaWtlIGFuIGljb24gZm9yIGV4YW1wbGUsIHRvIHRoZSBzcGVjaWZpZWQgYml0bWFwLiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgZm9yIGV2ZXJ5IHRva2VuIHdoZW4gdGhlIG1lc3NhZ2UgaXMgaW5pdGlhbGl6ZWQgYW5kIHRoZSBzcHJpdGVzIGZvciBlYWNoXG4gICAgKiB0ZXh0LWxpbmUgYXJlIGNyZWF0ZWQuPC9wPlxuICAgICpcbiAgICAqIDxwPlRoaXMgbWV0aG9kIGlzIG5vdCBjYWxsZWQgd2hpbGUgdGhlIG1lc3NhZ2UgaXMgcnVubmluZy4gRm9yIHRoYXQgY2FzZSwgc2VlIDxpPnByb2Nlc3NDb250cm9sVG9rZW48L2k+IG1ldGhvZCB3aGljaCBpcyBjYWxsZWRcbiAgICAqIGZvciBldmVyeSB0b2tlbiB3aGlsZSB0aGUgbWVzc2FnZSBpcyBydW5uaW5nLjwvcD5cbiAgICAqXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdG9rZW4gLSBBIGNvbnRyb2wtdG9rZW4uXG4gICAgKiBAcGFyYW0ge2dzLkJpdG1hcH0gYml0bWFwIC0gVGhlIGJpdG1hcCB1c2VkIGZvciB0aGUgY3VycmVudCB0ZXh0LWxpbmUuIENhbiBiZSB1c2VkIHRvIGRyYXcgc29tZXRoaW5nIG9uIGl0IGxpa2UgYW4gaWNvbiwgZXRjLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IG9mZnNldCAtIEFuIHgtb2Zmc2V0IGZvciB0aGUgZHJhdy1yb3V0aW5lLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCAtIERldGVybWluZXMgaG93IG1hbnkgY2hhcmFjdGVycyBvZiB0aGUgdG9rZW4gc2hvdWxkIGJlIGRyYXduLiBDYW4gYmUgaWdub3JlZCBmb3IgdG9rZW5zXG4gICAgKiBub3QgZHJhd2luZyBhbnkgY2hhcmFjdGVycy5cbiAgICAqIEBtZXRob2QgZHJhd0NvbnRyb2xUb2tlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGRyYXdDb250cm9sVG9rZW46ICh0b2tlbiwgYml0bWFwLCBvZmZzZXQsIGxlbmd0aCkgLT5cbiAgICAgICAgc3dpdGNoIHRva2VuLmNvZGVcbiAgICAgICAgICAgIHdoZW4gXCJSVFwiICMgUnVieSBUZXh0XG4gICAgICAgICAgICAgICAgc3VwZXIodG9rZW4sIGJpdG1hcCwgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICAgICAgICB3aGVuIFwiU0xLXCIgIyBTdHlsYWJsZSBMaW5rXG4gICAgICAgICAgICAgICAgaWYgIXRva2VuLmN1c3RvbURhdGEub2Zmc2V0WD9cbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uY3VzdG9tRGF0YS5vZmZzZXRYID0gb2Zmc2V0XG4gICAgICAgICAgICAgICAgaWYgQGN1c3RvbURhdGEubGlua0RhdGFcbiAgICAgICAgICAgICAgICAgICAgbGlua0RhdGEgPSBAY3VzdG9tRGF0YS5saW5rRGF0YVtAbGluZV1cbiAgICAgICAgICAgICAgICAgICAgaWYgbGlua0RhdGEgdGhlbiBmb3IgZGF0YSBpbiBsaW5rRGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgQHNwcml0ZXNbQGxpbmVdLmJpdG1hcC5jbGVhclJlY3QoZGF0YS5jeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5oZWlnaHQpXG5cblxuICAgICMjIypcbiAgICAqIFByb2Nlc3NlcyBhIGNvbnRyb2wtdG9rZW4uIEEgY29udHJvbC10b2tlbiBpcyBhIHRva2VuIHdoaWNoIGluZmx1ZW5jZXNcbiAgICAqIHRoZSB0ZXh0LXJlbmRlcmluZyBsaWtlIGNoYW5naW5nIHRoZSBmb250cyBjb2xvciwgc2l6ZSBvciBzdHlsZS4gQ2hhbmdlc1xuICAgICogd2lsbCBiZSBhdXRvbWF0aWNhbGx5IGFwcGxpZWQgdG8gdGhlIGdhbWUgb2JqZWN0J3MgZm9udC5cbiAgICAqXG4gICAgKiBGb3IgbWVzc2FnZSB0ZXh0LXJlbmRlcmVyLCBhIGZldyBhZGRpdGlvbmFsIGNvbnRyb2wtdG9rZW5zIGxpa2VcbiAgICAqIHNwZWVkLWNoYW5nZSwgd2FpdGluZywgZXRjLiBuZWVkcyB0byBiZSBwcm9jZXNzZWQgaGVyZS5cbiAgICAqXG4gICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgZm9yIGVhY2ggdG9rZW4gd2hpbGUgdGhlIG1lc3NhZ2UgaXMgaW5pdGlhbGl6ZWQgYW5kXG4gICAgKiBhbHNvIHdoaWxlIHRoZSBtZXNzYWdlIGlzIHJ1bm5pbmcuIFNlZSA8aT5mb3JtYXR0aW5nT25seTwvaT4gcGFyYW1ldGVyLlxuICAgICpcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b2tlbiAtIEEgY29udHJvbC10b2tlbi5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9ybWF0dGluZ09ubHkgLSBJZiA8Yj50cnVlPC9iPiB0aGUgbWVzc2FnZSBpcyBpbml0aWFsaXppbmcgcmlnaHQgbm93IGFuZCBvbmx5XG4gICAgKiBmb3JtYXQtdG9rZW5zIHNob3VsZCBiZSBwcm9jZXNzZWQgd2hpY2ggaXMgbmVjZXNzYXJ5IGZvciB0aGUgbWVzc2FnZSB0byBjYWxjdWxhdGVkIHNpemVzIGNvcnJlY3RseS5cbiAgICAqIEByZXR1cm4ge09iamVjdH0gQSBuZXcgdG9rZW4gd2hpY2ggaXMgcHJvY2Vzc2VkIG5leHQgb3IgPGI+bnVsbDwvYj4uXG4gICAgKiBAbWV0aG9kIHByb2Nlc3NDb250cm9sVG9rZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBwcm9jZXNzQ29udHJvbFRva2VuOiAodG9rZW4sIGZvcm1hdHRpbmdPbmx5KSAtPlxuICAgICAgICByZXR1cm4gc3VwZXIodG9rZW4pIGlmIGZvcm1hdHRpbmdPbmx5XG4gICAgICAgIHJlc3VsdCA9IG51bGxcblxuICAgICAgICBzd2l0Y2ggdG9rZW4uY29kZVxuICAgICAgICAgICAgd2hlbiBcIkNSXCIgIyBDaGFuZ2UgQ3VycmVudCBDaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXIgPSBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlcnNBcnJheS5maXJzdCAoYykgLT4gKGMubmFtZS5kZWZhdWx0VGV4dCA/IGMubmFtZSkgPT0gdG9rZW4udmFsdWVcbiAgICAgICAgICAgICAgICBpZiBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmN1cnJlbnRDaGFyYWN0ZXIgPSBjaGFyYWN0ZXJcbiAgICAgICAgICAgIHdoZW4gXCJDRVwiICMgQ2FsbCBDb21tb24gRXZlbnRcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSB7IFwidmFsdWVzXCI6IHRva2VuLnZhbHVlcyB9XG4gICAgICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJjYWxsQ29tbW9uRXZlbnRcIiwgQG9iamVjdCwgeyBjb21tb25FdmVudElkOiB0b2tlbi52YWx1ZSwgcGFyYW1zOiBwYXJhbXMsIGZpbmlzaDogbm8sIHdhaXRpbmc6IHllcyB9KVxuICAgICAgICAgICAgd2hlbiBcIlhcIiAjIFNjcmlwdFxuICAgICAgICAgICAgICAgIHRva2VuLnZhbHVlPyhAb2JqZWN0KVxuICAgICAgICAgICAgd2hlbiBcIkFMR05cIlxuICAgICAgICAgICAgICAgIEBvYmplY3Quc2V0dGluZ3MubGluZUFsaWdubWVudCA9IHRva2VuLnZhbHVlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIHdoZW4gXCJBXCIgIyBQbGF5IEFuaW1hdGlvblxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IFJlY29yZE1hbmFnZXIuYW5pbWF0aW9uc0FycmF5LmZpcnN0IChhKSAtPiBhLm5hbWUgPT0gdG9rZW4udmFsdWVcbiAgICAgICAgICAgICAgICBpZiAhYW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IFJlY29yZE1hbmFnZXIuYW5pbWF0aW9uc1t0b2tlbi52YWx1ZV1cbiAgICAgICAgICAgICAgICBpZiBhbmltYXRpb24/LmdyYXBoaWMubmFtZT9cbiAgICAgICAgICAgICAgICAgICAgYml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChhbmltYXRpb24uZ3JhcGhpYykpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdCA9IG5ldyBncy5PYmplY3RfQW5pbWF0aW9uKGFuaW1hdGlvbilcblxuICAgICAgICAgICAgICAgICAgICBAYWRkQ3VzdG9tT2JqZWN0KG9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRYICs9IE1hdGgucm91bmQoYml0bWFwLndpZHRoIC8gYW5pbWF0aW9uLmZyYW1lc1gpXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50U3ByaXRlLnNyY1JlY3Qud2lkdGggKz0gTWF0aC5yb3VuZChiaXRtYXAud2lkdGggLyBhbmltYXRpb24uZnJhbWVzWClcblxuICAgICAgICAgICAgd2hlbiBcIlJUXCIgIyBSdWJ5IFRleHRcbiAgICAgICAgICAgICAgICBpZiB0b2tlbi5ydFNpemUud2lkdGggPiB0b2tlbi5yYlNpemUud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRYICs9IHRva2VuLnJ0U2l6ZS53aWR0aFxuICAgICAgICAgICAgICAgICAgICBAZm9udC5zZXQoQGdldFJ1YnlUZXh0Rm9udCh0b2tlbikpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFggKz0gdG9rZW4ucmJTaXplLndpZHRoXG5cbiAgICAgICAgICAgIHdoZW4gXCJMS1wiICMgTGlua1xuICAgICAgICAgICAgICAgIGlmIHRva2VuLnZhbHVlID09ICdFJyAjIEVuZCBMaW5rXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdCA9IG5ldyB1aS5PYmplY3RfSG90c3BvdCgpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5lbmFibGVkID0geWVzXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5zZXR1cCgpXG5cbiAgICAgICAgICAgICAgICAgICAgQGFkZEN1c3RvbU9iamVjdChvYmplY3QpXG5cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRzdFJlY3QueCA9IEBvYmplY3QuZHN0UmVjdC54ICsgQG9iamVjdC5vcmlnaW4ueCArIEBjdXN0b21EYXRhLmxpbmtEYXRhLmN4XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnkgPSBAb2JqZWN0LmRzdFJlY3QueSArIEBvYmplY3Qub3JpZ2luLnkgKyBAY3VzdG9tRGF0YS5saW5rRGF0YS5jeVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuZHN0UmVjdC53aWR0aCA9IEBjdXJyZW50WCAtIEBjdXN0b21EYXRhLmxpbmtEYXRhLmN4XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LmhlaWdodCA9IEBjdXJyZW50TGluZUhlaWdodFxuXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5ldmVudHMub24oXCJjbGlja1wiLCBncy5DYWxsQmFjayhcIm9uTGlua0NsaWNrXCIsIHRoaXMpLCBsaW5rRGF0YTogQGN1c3RvbURhdGEubGlua0RhdGEsIHRoaXMpXG4gICAgICAgICAgICAgICAgZWxzZSAjIEJlZ2luIExpbmtcbiAgICAgICAgICAgICAgICAgICAgQGN1c3RvbURhdGEubGlua0RhdGEgPSB7IGN4OiBAY3VycmVudFgsIGN5OiBAY3VycmVudFksIGNvbW1vbkV2ZW50SWQ6IHRva2VuLnZhbHVlLCB0b2tlbkluZGV4OiBAdG9rZW5JbmRleCB9XG4gICAgICAgICAgICB3aGVuIFwiU0xLXCIgIyBTdHlsZWFibGUgTGlua1xuICAgICAgICAgICAgICAgIGlmIHRva2VuLnZhbHVlID09ICdFJyAjIEVuZCBMaW5rXG4gICAgICAgICAgICAgICAgICAgIGxpbmtEYXRhID0gQGN1c3RvbURhdGEubGlua0RhdGFbQGxpbmVdLmxhc3QoKVxuICAgICAgICAgICAgICAgICAgICBsaW5lID0gQGxpbmVzW0BsaW5lXS5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgIGxpbmtTdGFydCA9IEBmaW5kVG9rZW4oQHRva2VuSW5kZXgtMSwgXCJTTEtcIiwgLTEsIGxpbmUpXG4gICAgICAgICAgICAgICAgICAgIHRleHRUb2tlbnMgPSBAZmluZFRva2Vuc0JldHdlZW4obGlua0RhdGEudG9rZW5JbmRleCwgQHRva2VuSW5kZXgsIG51bGwsIGxpbmUpXG5cbiAgICAgICAgICAgICAgICAgICAgbGlua0RhdGEuY3ggPSBsaW5rU3RhcnQuY3VzdG9tRGF0YS5vZmZzZXRYXG4gICAgICAgICAgICAgICAgICAgIGxpbmtEYXRhLndpZHRoID0gQGN1cnJlbnRYIC0gbGlua0RhdGEuY3ggKyBAcGFkZGluZ1xuICAgICAgICAgICAgICAgICAgICBsaW5rRGF0YS5oZWlnaHQgPSBAY3VycmVudFNwcml0ZS5iaXRtYXAuaGVpZ2h0XG5cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0ID0gbmV3IHVpLk9iamVjdF9UZXh0KClcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnRleHQgPSB0ZXh0VG9rZW5zLnNlbGVjdCgoeCkgPT4geC52YWx1ZSkuam9pbihcIlwiKVxuICAgICAgICAgICAgICAgICAgICAjb2JqZWN0LnNpemVUb0ZpdCA9IHllc1xuICAgICAgICAgICAgICAgICAgICBvYmplY3QuZm9ybWF0dGluZyA9IG5vXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC53b3JkV3JhcCA9IG5vXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC51aSA9IG5ldyB1aS5Db21wb25lbnRfVUlCZWhhdmlvcigpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5lbmFibGVkID0geWVzXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5hZGRDb21wb25lbnQob2JqZWN0LnVpKVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuYWRkQ29tcG9uZW50KG5ldyBncy5Db21wb25lbnRfSG90c3BvdEJlaGF2aW9yKCkpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5iZWhhdmlvci5wYWRkaW5nLmxlZnQgPSAwXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5iZWhhdmlvci5wYWRkaW5nLnJpZ2h0ID0gMFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuZHN0UmVjdC53aWR0aCA9IGxpbmtEYXRhLndpZHRoXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LmhlaWdodCA9IGxpbmtEYXRhLmhlaWdodFxuXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmtEYXRhLnN0eWxlSW5kZXggPT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpLlVJTWFuYWdlci5hZGRDb250cm9sU3R5bGVzKG9iamVjdCwgW1wiaHlwZXJsaW5rXCJdKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB1aS5VSU1hbmFnZXIuYWRkQ29udHJvbFN0eWxlcyhvYmplY3QsIFtcImh5cGVybGluay1cIitsaW5rRGF0YS5zdHlsZUluZGV4XSlcblxuICAgICAgICAgICAgICAgICAgICBvYmplY3Quc2V0dXAoKVxuXG4gICAgICAgICAgICAgICAgICAgIEBhZGRDdXN0b21PYmplY3Qob2JqZWN0KVxuXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5kc3RSZWN0LnggPSBAY3VycmVudFNwcml0ZS54ICsgbGlua0RhdGEuY3hcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRzdFJlY3QueSA9IEBvYmplY3QuZHN0UmVjdC55ICsgQG9iamVjdC5vcmlnaW4ueSArIGxpbmtEYXRhLmN5XG5cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmV2ZW50cy5vbihcImNsaWNrXCIsIGdzLkNhbGxCYWNrKFwib25MaW5rQ2xpY2tcIiwgdGhpcyksIGxpbmtEYXRhOiBsaW5rRGF0YSwgdGhpcylcbiAgICAgICAgICAgICAgICBlbHNlICMgQmVnaW4gTGlua1xuICAgICAgICAgICAgICAgICAgICBpZiAhQGN1c3RvbURhdGEubGlua0RhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjdXN0b21EYXRhLmxpbmtEYXRhID0gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgIUBjdXN0b21EYXRhLmxpbmtEYXRhW0BsaW5lXVxuICAgICAgICAgICAgICAgICAgICAgICAgQGN1c3RvbURhdGEubGlua0RhdGFbQGxpbmVdID0gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW4udmFsdWU/LmNvbnRhaW5zKFwiLFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdG9rZW4udmFsdWUuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBAY3VzdG9tRGF0YS5saW5rRGF0YVtAbGluZV0ucHVzaCh7IGN4OiBAY3VycmVudFgsIGN5OiBAY3VycmVudFksIGNvbW1vbkV2ZW50SWQ6IHZhbHVlc1swXSwgc3R5bGVJbmRleDogcGFyc2VJbnQodmFsdWVzWzFdKSwgdG9rZW5JbmRleDogQHRva2VuSW5kZXggfSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGN1c3RvbURhdGEubGlua0RhdGFbQGxpbmVdLnB1c2goeyBjeDogQGN1cnJlbnRZLCBjeTogQGN1cnJlbnRZLCBjb21tb25FdmVudElkOiB0b2tlbi52YWx1ZSwgdG9rZW5JbmRleDogQHRva2VuSW5kZXgsIHN0eWxlSW5kZXg6IC0xIH0pXG5cbiAgICAgICAgICAgIHdoZW4gXCJFXCIgIyBDaGFuZ2UgRXhwcmVzc2lvblxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlckV4cHJlc3Npb25zQXJyYXkuZmlyc3QgKGMpIC0+IChjLm5hbWUuZGVmYXVsdFRleHQgPyBjLm5hbWUpID09IHRva2VuLnZhbHVlXG4gICAgICAgICAgICAgICAgaWYgIWV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyRXhwcmVzc2lvbnNbdG9rZW4udmFsdWVdXG5cbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXIgPSBTY2VuZU1hbmFnZXIuc2NlbmUuY3VycmVudENoYXJhY3RlclxuICAgICAgICAgICAgICAgIGlmIGV4cHJlc3Npb24/IGFuZCBjaGFyYWN0ZXI/LmluZGV4P1xuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3Rlci5leHByZXNzaW9uRHVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nID0gZ3MuRWFzaW5ncy5mcm9tT2JqZWN0KEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3Rlci5jaGFuZ2VFYXNpbmcpXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IEdhbWVNYW5hZ2VyLmRlZmF1bHRzLmNoYXJhY3Rlci5jaGFuZ2VBbmltYXRpb25cbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0ID0gU2NlbmVNYW5hZ2VyLnNjZW5lLmNoYXJhY3RlcnMuZmlyc3QgKGMpIC0+IGMucmlkID09IGNoYXJhY3Rlci5pbmRleFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q/LmJlaGF2aW9yLmNoYW5nZUV4cHJlc3Npb24oZXhwcmVzc2lvbiwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uKVxuXG4gICAgICAgICAgICB3aGVuIFwiU1BcIiAjIFBsYXkgU291bmRcbiAgICAgICAgICAgICAgICBzb3VuZCA9IFJlY29yZE1hbmFnZXIuc3lzdGVtLnNvdW5kc1t0b2tlbi52YWx1ZS0xXVxuICAgICAgICAgICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5U291bmQoc291bmQpXG4gICAgICAgICAgICB3aGVuIFwiU1wiICMgQ2hhbmdlIFNwZWVkXG4gICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIuc2V0dGluZ3MubWVzc2FnZVNwZWVkID0gdG9rZW4udmFsdWVcbiAgICAgICAgICAgIHdoZW4gXCJXXCIgIyBXYWl0XG4gICAgICAgICAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9IG5vXG4gICAgICAgICAgICAgICAgaWYgIUdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICAgICAgICAgIGlmIHRva2VuLnZhbHVlID09IFwiQVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBAd2FpdEZvcktleSA9IHllc1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBNYXRoLnJvdW5kKHRva2VuLnZhbHVlIC8gMTAwMCAqIEdyYXBoaWNzLmZyYW1lUmF0ZSlcbiAgICAgICAgICAgIHdoZW4gXCJXRVwiICMgV2FpdCBhdCBFbmRcbiAgICAgICAgICAgICAgICBAd2FpdEF0RW5kID0gdG9rZW4udmFsdWUgPT0gXCJZXCJcbiAgICAgICAgICAgIHdoZW4gXCJESVwiICMgRHJhdyBJbW1lZGlhbHR5XG4gICAgICAgICAgICAgICAgQGRyYXdJbW1lZGlhdGVseSA9IHRva2VuLnZhbHVlID09IDEgb3IgdG9rZW4udmFsdWUgPT0gXCJZXCIgIyBEcmF3IGltbWVkaWF0ZWx5XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gc3VwZXIodG9rZW4pXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICMjIypcbiAgICAqIENsZWFycy9SZXNldHMgdGhlIHRleHQtcmVuZGVyZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhclxuICAgICMjI1xuICAgIGNsZWFyOiAtPlxuICAgICAgICBAY2hhckluZGV4ID0gMFxuICAgICAgICBAY3VycmVudFggPSAwXG4gICAgICAgIEBjdXJyZW50WSA9IDBcbiAgICAgICAgQGxpbmUgPSAwXG4gICAgICAgIEBsaW5lcyA9IFtdXG4gICAgICAgIEBjbGVhckN1c3RvbU9iamVjdHMoKVxuICAgICAgICBAb2JqZWN0LmJpdG1hcD8uY2xlYXIoKVxuXG4gICAgICAgIGZvciBzcHJpdGUgaW4gQGFsbFNwcml0ZXNcbiAgICAgICAgICAgIHNwcml0ZS5kaXNwb3NlKClcbiAgICAgICAgICAgIHNwcml0ZS5iaXRtYXA/LmRpc3Bvc2UoKVxuICAgICAgICBAYWxsU3ByaXRlcyA9IFtdXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBDbGVhcnMvRGlzcG9zZXMgYWxsIHNwcml0ZXMgdXNlZCB0byBkaXNwbGF5IHRoZSB0ZXh0LWxpbmVzL3BhcnRzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJBbGxTcHJpdGVzXG4gICAgIyMjXG4gICAgY2xlYXJBbGxTcHJpdGVzOiAtPlxuICAgICAgICBmb3Igc3ByaXRlIGluIEBhbGxTcHJpdGVzXG4gICAgICAgICAgICBzcHJpdGUuZGlzcG9zZSgpXG4gICAgICAgICAgICBzcHJpdGUuYml0bWFwPy5kaXNwb3NlKClcblxuICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgIyMjKlxuICAgICogQ2xlYXJzL0Rpc3Bvc2VzIHRoZSBzcHJpdGVzIHVzZWQgdG8gZGlzcGxheSB0aGUgdGV4dC1saW5lcy9wYXJ0cyBvZiB0aGUgY3VycmVudC9sYXN0IG1lc3NhZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhclNwcml0ZXNcbiAgICAjIyNcbiAgICBjbGVhclNwcml0ZXM6IC0+XG4gICAgICAgIGZvciBzcHJpdGUgaW4gQHNwcml0ZXNcbiAgICAgICAgICAgIHNwcml0ZS5kaXNwb3NlKClcbiAgICAgICAgICAgIHNwcml0ZS5iaXRtYXA/LmRpc3Bvc2UoKVxuXG4gICAgICAgIHJldHVybiBudWxsXG5cblxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgYSBnYW1lIG9iamVjdCBmcm9tIHRoZSBtZXNzYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVtb3ZlQ3VzdG9tT2JqZWN0XG4gICAgKiBAcGFyYW0gb2JqZWN0IHtncy5PYmplY3RfQmFzZX0gVGhlIGdhbWUgb2JqZWN0IHRvIHJlbW92ZS5cbiAgICAjIyNcbiAgICByZW1vdmVDdXN0b21PYmplY3Q6IChvYmplY3QpIC0+XG4gICAgICAgIFNjZW5lTWFuYWdlci5zY2VuZS5yZW1vdmVPYmplY3Qob2JqZWN0KVxuICAgICAgICBvYmplY3QuZGlzcG9zZSgpXG4gICAgICAgIEBjdXN0b21PYmplY3RzLnJlbW92ZShvYmplY3QpXG5cbiAgICAjIyMqXG4gICAgKiBBZGRzIGEgZ2FtZSBvYmplY3QgdG8gdGhlIG1lc3NhZ2Ugd2hpY2ggaXMgYWxpdmUgdW50aWwgdGhlIG1lc3NhZ2UgaXNcbiAgICAqIGVyYXNlZC4gQ2FuIGJlIHVzZWQgdG8gZGlzcGxheSBhbmltYXRpb25lZC1pY29ucywgZXRjLiBpbiBhIG1lc3NhZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBhZGRDdXN0b21PYmplY3RcbiAgICAqIEBwYXJhbSBvYmplY3Qge2dzLk9iamVjdF9CYXNlfSBUaGUgZ2FtZSBvYmplY3QgdG8gYWRkLlxuICAgICMjI1xuICAgIGFkZEN1c3RvbU9iamVjdDogKG9iamVjdCkgLT5cbiAgICAgICAgb2JqZWN0LmRzdFJlY3QueCA9IEBvYmplY3QuZHN0UmVjdC54ICsgQG9iamVjdC5vcmlnaW4ueCArIEBjdXJyZW50WFxuICAgICAgICBvYmplY3QuZHN0UmVjdC55ID0gQG9iamVjdC5kc3RSZWN0LnkgKyBAb2JqZWN0Lm9yaWdpbi55ICsgQGN1cnJlbnRZXG4gICAgICAgIG9iamVjdC56SW5kZXggPSBAb2JqZWN0LnpJbmRleCArIDFcbiAgICAgICAgb2JqZWN0LnVwZGF0ZSgpXG5cbiAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLmFkZE9iamVjdChvYmplY3QpXG4gICAgICAgIEBjdXN0b21PYmplY3RzLnB1c2gob2JqZWN0KVxuXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIHRoZSBsaXN0IG9mIGN1c3RvbSBnYW1lIG9iamVjdHMuIEFsbCBnYW1lIG9iamVjdHMgYXJlIGRpc3Bvc2VkIGFuZCByZW1vdmVkXG4gICAgKiBmcm9tIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyQ3VzdG9tT2JqZWN0c1xuICAgICogQHBhcmFtIG9iamVjdCB7T2JqZWN0fSBUaGUgZ2FtZSBvYmplY3QgdG8gYWRkLlxuICAgICMjI1xuICAgIGNsZWFyQ3VzdG9tT2JqZWN0czogLT5cbiAgICAgICAgZm9yIG9iamVjdCBpbiBAY3VzdG9tT2JqZWN0c1xuICAgICAgICAgICAgb2JqZWN0LmRpc3Bvc2UoKVxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnNjZW5lLnJlbW92ZU9iamVjdChvYmplY3QpXG5cbiAgICAgICAgQGN1c3RvbU9iamVjdHMgPSBbXVxuXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyB0aGUgYml0bWFwIGZvciBhIHNwZWNpZmllZCBsaW5lLW9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZUJpdG1hcFxuICAgICogQHByaXZhdGVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBsaW5lIC0gQSBsaW5lLW9iamVjdC5cbiAgICAqIEByZXR1cm4ge0JpdG1hcH0gQSBuZXdseSBjcmVhdGVkIGJpdG1hcCBjb250YWluaW5nIHRoZSBsaW5lLXRleHQuXG4gICAgIyMjXG4gICAgY3JlYXRlQml0bWFwOiAobGluZSkgLT5cbiAgICAgICAgQGZvbnQgPSBAb2JqZWN0LmZvbnRcbiAgICAgICAgYml0bWFwID0gbmV3IEJpdG1hcChAb2JqZWN0LmRzdFJlY3Qud2lkdGgsIE1hdGgubWF4KEBtaW5MaW5lSGVpZ2h0LCBsaW5lLmhlaWdodCkpXG4gICAgICAgIGJpdG1hcC5mb250ID0gQGZvbnRcblxuICAgICAgICByZXR1cm4gYml0bWFwXG5cbiAgICAjIyMqXG4gICAgKiBEcmF3cyB0aGUgbGluZSdzIGNvbnRlbnQgb24gdGhlIHNwZWNpZmllZCBiaXRtYXAuXG4gICAgKlxuICAgICogQG1ldGhvZCBkcmF3TGluZUNvbnRlbnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBsaW5lIC0gQSBsaW5lLW9iamVjdCB3aGljaCBzaG91bGQgYmUgZHJhd24gb24gdGhlIGJpdG1hcC5cbiAgICAqIEBwYXJhbSB7Z3MuQml0bWFwfSBiaXRtYXAgLSBUaGUgYml0bWFwIHRvIGRyYXcgdGhlIGxpbmUncyBjb250ZW50IG9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCAtIERldGVybWluZXMgaG93IG1hbnkgY2hhcmFjdGVycyBvZiB0aGUgc3BlY2lmaWVkIGxpbmUgc2hvdWxkIGJlIGRyYXduLiBZb3UgY2FuXG4gICAgKiBzcGVjaWZ5IC0xIHRvIGRyYXcgYWxsIGNoYXJhY3RlcnMuXG4gICAgIyMjXG4gICAgZHJhd0xpbmVDb250ZW50OiAobGluZSwgYml0bWFwLCBsZW5ndGgpIC0+XG4gICAgICAgIGJpdG1hcC5jbGVhcigpXG4gICAgICAgIGN1cnJlbnRYID0gQHBhZGRpbmdcbiAgICAgICAgZHJhd0FsbCA9IGxlbmd0aCA9PSAtMVxuXG4gICAgICAgIGZvciB0b2tlbiwgaSBpbiBsaW5lLmNvbnRlbnRcbiAgICAgICAgICAgIGJyZWFrIGlmIGkgPiBAdG9rZW5JbmRleCBhbmQgIWRyYXdBbGxcbiAgICAgICAgICAgIGlmIHRva2VuLmNvZGU/XG4gICAgICAgICAgICAgICAgc2l6ZSA9IEBtZWFzdXJlQ29udHJvbFRva2VuKHRva2VuLCBiaXRtYXApXG4gICAgICAgICAgICAgICAgQGRyYXdDb250cm9sVG9rZW4odG9rZW4sIGJpdG1hcCwgY3VycmVudFgpXG4gICAgICAgICAgICAgICAgaWYgc2l6ZSB0aGVuIGN1cnJlbnRYICs9IHNpemUud2lkdGhcbiAgICAgICAgICAgICAgICBAcHJvY2Vzc0NvbnRyb2xUb2tlbih0b2tlbiwgeWVzLCBsaW5lKVxuICAgICAgICAgICAgZWxzZSBpZiB0b2tlbi52YWx1ZS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgdG9rZW4uYXBwbHlGb3JtYXQoQGZvbnQpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0b2tlbi52YWx1ZVxuICAgICAgICAgICAgICAgIGlmICFkcmF3QWxsIGFuZCBAdG9rZW5JbmRleCA9PSBpIGFuZCB2YWx1ZS5sZW5ndGggPiBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgbGVuZ3RoKVxuICAgICAgICAgICAgICAgIGlmIHZhbHVlICE9IFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IEBmb250Lm1lYXN1cmVUZXh0UGxhaW4odmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIGJpdG1hcC5kcmF3VGV4dChjdXJyZW50WCwgbGluZS5oZWlnaHQgLSAoc2l6ZS5oZWlnaHQgLSBAZm9udC5kZXNjZW50KSAtIGxpbmUuZGVzY2VudCwgc2l6ZS53aWR0aCwgYml0bWFwLmhlaWdodCwgdmFsdWUsIDAsIDApXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRYICs9IHNpemUud2lkdGhcblxuICAgICAgICBsaW5lLmNvbnRlbnRXaWR0aCA9IGN1cnJlbnRYICsgQGZvbnQubWVhc3VyZVRleHRQbGFpbihcIiBcIikud2lkdGhcblxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgdGhlIHNwcml0ZSBmb3IgYSBzcGVjaWZpZWQgbGluZS1vYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBjcmVhdGVTcHJpdGVcbiAgICAqIEBwcml2YXRlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gbGluZSAtIEEgbGluZS1vYmplY3QuXG4gICAgKiBAcmV0dXJuIHtTcHJpdGV9IEEgbmV3bHkgY3JlYXRlZCBzcHJpdGUgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGxpbmUtdGV4dCBhcyBiaXRtYXAuXG4gICAgIyMjXG4gICAgY3JlYXRlU3ByaXRlOiAobGluZSkgLT5cbiAgICAgICAgYml0bWFwID0gQGNyZWF0ZUJpdG1hcChsaW5lKVxuXG4gICAgICAgIEBjdXJyZW50WCA9IDBcbiAgICAgICAgQHdhaXRDb3VudGVyID0gMFxuICAgICAgICBAd2FpdEZvcktleSA9IG5vXG5cbiAgICAgICAgc3ByaXRlID0gbmV3IFNwcml0ZShHcmFwaGljcy52aWV3cG9ydClcbiAgICAgICAgc3ByaXRlLmJpdG1hcCA9IGJpdG1hcFxuICAgICAgICBzcHJpdGUudmlzaWJsZSA9IHllc1xuICAgICAgICBzcHJpdGUueiA9IEBvYmplY3QuekluZGV4ICsgMVxuXG4gICAgICAgIHNwcml0ZS5zcmNSZWN0ID0gbmV3IFJlY3QoMCwgMCwgMCwgYml0bWFwLmhlaWdodClcblxuICAgICAgICByZXR1cm4gc3ByaXRlXG5cbiAgICAjIyMqXG4gICAgKiBDcmVhdGVzIHRoZSBzcHJpdGVzIGZvciBhIHNwZWNpZmllZCBhcnJheSBvZiBsaW5lLW9iamVjdHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBjcmVhdGVTcHJpdGVzXG4gICAgKiBAcHJpdmF0ZVxuICAgICogQHNlZSBncy5Db21wb25lbnRfTWVzc2FnZVRleHRSZW5kZXJlci5jcmVhdGVTcHJpdGUuXG4gICAgKiBAcGFyYW0ge0FycmF5fSBsaW5lcyAtIEFuIGFycmF5IG9mIGxpbmUtb2JqZWN0cy5cbiAgICAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBvZiBzcHJpdGVzLlxuICAgICMjI1xuICAgIGNyZWF0ZVNwcml0ZXM6IChsaW5lcykgLT5cbiAgICAgICAgQGZvbnRTaXplID0gQG9iamVjdC5mb250LnNpemVcbiAgICAgICAgcmVzdWx0ID0gW11cbiAgICAgICAgZm9yIGxpbmUsIGkgaW4gbGluZXNcbiAgICAgICAgICAgIHNwcml0ZSA9IEBjcmVhdGVTcHJpdGUobGluZSlcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHNwcml0ZSlcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuXG4gICAgIyMjKlxuICAgICogU3RhcnRzIGEgbmV3IGxpbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBuZXdMaW5lXG4gICAgIyMjXG4gICAgbmV3TGluZTogLT5cbiAgICAgICAgQGN1cnJlbnRYID0gMFxuICAgICAgICBAY3VycmVudFkgKz0gQGN1cnJlbnRMaW5lSGVpZ2h0ICsgQGxpbmVTcGFjaW5nXG5cbiAgICAjIyMqXG4gICAgKiBEaXNwbGF5cyBhIGZvcm1hdHRlZCB0ZXh0IGltbWVkaWF0ZWx5IHdpdGhvdXQgYW55IGRlbGF5cyBvciBhbmltYXRpb25zLiBUaGVcbiAgICAqIENvbXBvbmVudF9UZXh0UmVuZGVyZXIuZHJhd0Zvcm1hdHRlZFRleHQgbWV0aG9kIGZyb20gdGhlIGJhc2UtY2xhc3MgY2Fubm90XG4gICAgKiBiZSB1c2VkIGhlcmUgYmVjYXVzZSBpdCB3b3VsZCByZW5kZXIgdG8gdGhlIGdhbWUgb2JqZWN0J3MgYml0bWFwIG9iamVjdCB3aGlsZVxuICAgICogdGhpcyBtZXRob2QgaXMgcmVuZGVyaW5nIHRvIHRoZSBzcHJpdGVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgZHJhd0Zvcm1hdHRlZFRleHRJbW1lZGlhdGVseVxuICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBUaGUgeC1jb29yZGluYXRlIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0geSAtIFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIHRleHQncyBwb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIERlcHJlY2F0ZWQuIENhbiBiZSBudWxsLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIERlcHJlY2F0ZWQuIENhbiBiZSBudWxsLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCB0byBkcmF3LlxuICAgICogQHBhcmFtIHtib29sZWFufSB3b3JkV3JhcCAtIElmIHdvcmRXcmFwIGlzIHNldCB0byB0cnVlLCBsaW5lLWJyZWFrcyBhcmUgYXV0b21hdGljYWxseSBjcmVhdGVkLlxuICAgICMjI1xuICAgIGRyYXdGb3JtYXR0ZWRUZXh0SW1tZWRpYXRlbHk6ICh4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0LCB3b3JkV3JhcCkgLT5cbiAgICAgICAgQGRyYXdGb3JtYXR0ZWRUZXh0KHgsIHksIHdpZHRoLCBoZWlnaHQsIHRleHQsIHdvcmRXcmFwKVxuXG4gICAgICAgIGxvb3BcbiAgICAgICAgICAgIEBuZXh0Q2hhcigpXG5cbiAgICAgICAgICAgIGlmIEBsaW5lID49IEBtYXhMaW5lc1xuICAgICAgICAgICAgICAgIEBpc1J1bm5pbmcgPSBub1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBkcmF3TmV4dCgpXG5cbiAgICAgICAgICAgIGJyZWFrIHVubGVzcyBAaXNSdW5uaW5nXG5cbiAgICAgICAgQGN1cnJlbnRZICs9IEBjdXJyZW50TGluZUhlaWdodCArIEBsaW5lU3BhY2luZ1xuXG4gICAgICAgIHJldHVybiBudWxsXG5cblxuICAgICMjIypcbiAgICAqIFN0YXJ0cyB0aGUgcmVuZGVyaW5nLXByb2Nlc3MgZm9yIHRoZSBtZXNzYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgZHJhd0Zvcm1hdHRlZFRleHRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gVGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBUaGUgeS1jb29yZGluYXRlIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBEZXByZWNhdGVkLiBDYW4gYmUgbnVsbC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBEZXByZWNhdGVkLiBDYW4gYmUgbnVsbC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgdG8gZHJhdy5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gd29yZFdyYXAgLSBJZiB3b3JkV3JhcCBpcyBzZXQgdG8gdHJ1ZSwgbGluZS1icmVha3MgYXJlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZC5cbiAgICAjIyNcbiAgICBkcmF3Rm9ybWF0dGVkVGV4dDogKHgsIHksIHdpZHRoLCBoZWlnaHQsIHRleHQsIHdvcmRXcmFwKSAtPlxuICAgICAgICB0ZXh0ID0gdGV4dCB8fCBcIiBcIiAjIFVzZSBhIHNwYWNlIGNoYXJhY3RlciBpZiBubyB0ZXh0IGlzIHNwZWNpZmllZC5cbiAgICAgICAgQGZvbnQuc2V0KEBvYmplY3QuZm9udClcbiAgICAgICAgQHNwZWVkID0gMTEgLSBNYXRoLnJvdW5kKEdhbWVNYW5hZ2VyLnNldHRpbmdzLm1lc3NhZ2VTcGVlZCAqIDIuNSlcbiAgICAgICAgQGlzUnVubmluZyA9IHllc1xuICAgICAgICBAZHJhd0ltbWVkaWF0ZWx5ID0gbm9cbiAgICAgICAgQGxpbmVBbmltYXRpb25Db3VudCA9IEBzcGVlZFxuICAgICAgICBAY3VycmVudExpbmVIZWlnaHQgPSAwXG4gICAgICAgIEBpc1dhaXRpbmcgPSBub1xuICAgICAgICBAd2FpdEZvcktleSA9IG5vXG4gICAgICAgIEBjaGFySW5kZXggPSAwXG4gICAgICAgIEB0b2tlbiA9IG51bGxcbiAgICAgICAgQHRva2VuSW5kZXggPSAwXG4gICAgICAgIEBtZXNzYWdlID0gdGV4dFxuICAgICAgICBAbGluZSA9IDBcbiAgICAgICAgQGN1cnJlbnRMaW5lID0gQGxpbmVcbiAgICAgICAgY3VycmVudFggPSBAY3VycmVudFggI01hdGgubWF4KEBjdXJyZW50WCwgQHBhZGRpbmcpXG4gICAgICAgIEBsaW5lcyA9IEBjYWxjdWxhdGVMaW5lcyhsY3NtKEBtZXNzYWdlKSwgd29yZFdyYXAsIEBjdXJyZW50WClcbiAgICAgICAgQHNwcml0ZXMgPSBAY3JlYXRlU3ByaXRlcyhAbGluZXMpXG4gICAgICAgIEBhbGxTcHJpdGVzID0gQGFsbFNwcml0ZXMuY29uY2F0KEBzcHJpdGVzKVxuICAgICAgICBAY3VycmVudFggPSBjdXJyZW50WFxuICAgICAgICBAY3VycmVudFNwcml0ZSA9IEBzcHJpdGVzW0BsaW5lXVxuICAgICAgICBAY3VycmVudFNwcml0ZS54ID0gQGN1cnJlbnRYICsgQG9iamVjdC5vcmlnaW4ueCArIEBvYmplY3QuZHN0UmVjdC54XG4gICAgICAgIEBtYXhMaW5lcyA9IEBjYWxjdWxhdGVNYXhMaW5lcyhAbGluZXMpXG4gICAgICAgIEB0b2tlbiA9IEBsaW5lc1tAbGluZV0/LmNvbnRlbnRbQHRva2VuSW5kZXhdIHx8IG5ldyBncy5SZW5kZXJlclRva2VuKG51bGwsIFwiXCIpXG5cblxuICAgICAgICBAc3RhcnQoKVxuXG4gICAgIyMjKlxuICAgICogU3RhcnRzIHRoZSBtZXNzYWdlLXJlbmRlcmluZyBwcm9jZXNzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RhcnRcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBzdGFydDogLT5cbiAgICAgICAgaWYgR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXAgYW5kIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwVGltZSA9PSAwXG4gICAgICAgICAgICBAaW5zdGFudFNraXAoKVxuICAgICAgICBlbHNlIGlmIEBtYXhMaW5lcyA9PSAwXG4gICAgICAgICAgICAjIElmIGZpcnN0IGxpbmUgaXMgZW1wdHkgdGhlbiBpdCBkb2Vzbid0IGZpdCBpbnRvIGN1cnJlbnQgbGluZSwgc28gZmluaXNoLlxuICAgICAgICAgICAgaWYgQGxpbmVzWzBdPy5jb250ZW50ID09IFwiXCJcbiAgICAgICAgICAgICAgICBAZmluaXNoKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAbWF4TGluZXMgPSAxXG4gICAgICAgICAgICAgICAgQGRyYXdOZXh0KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGRyYXdOZXh0KClcblxuICAgICMjIypcbiAgICAqIFNraXBzIHRoZSBjdXJyZW50IG1lc3NhZ2UgYW5kIGZpbmlzaGVzIHRoZSBtZXNzYWdlLXByb2Nlc3NpbmcgaW1tZWRpYXRlbHkuIFRoZSBtZXNzYWdlXG4gICAgKiB0b2tlbnMgYXJlIHByb2Nlc3NlZCBidXQgbm90IHJlbmRlcmVkLlxuICAgICpcbiAgICAqIEBtZXRob2QgaW5zdGFudFNraXBcbiAgICAjIyNcbiAgICBpbnN0YW50U2tpcDogLT5cbiAgICAgICAgbG9vcFxuICAgICAgICAgICAgaWYgQGxpbmUgPCBAbWF4TGluZXNcbiAgICAgICAgICAgICAgICBAbmV4dENoYXIoKVxuXG4gICAgICAgICAgICBpZiBAbGluZSA+PSBAbWF4TGluZXNcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBwcm9jZXNzVG9rZW4oKVxuXG4gICAgICAgICAgICBicmVhayB1bmxlc3MgQGlzUnVubmluZyBhbmQgQGxpbmUgPCBAbWF4TGluZXNcblxuICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcIm1lc3NhZ2VXYWl0aW5nXCIsIHRoaXMpXG4gICAgICAgIEBjb250aW51ZSgpXG5cbiAgICAjIyMqXG4gICAgKiBQcm9jZXNzZXMgdGhlIGN1cnJlbnQgdG9rZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBwcm9jZXNzVG9rZW5cbiAgICAjIyNcbiAgICBwcm9jZXNzVG9rZW46IC0+XG4gICAgICAgIHRva2VuID0gbnVsbFxuXG4gICAgICAgIGlmIEB0b2tlbi5jb2RlP1xuICAgICAgICAgICAgdG9rZW4gPSBAcHJvY2Vzc0NvbnRyb2xUb2tlbihAdG9rZW4sIG5vKVxuICAgICAgICAgICAgaWYgdG9rZW4/XG4gICAgICAgICAgICAgICAgQHRva2VuID0gdG9rZW5cbiAgICAgICAgICAgICAgICBAdG9rZW4ub25TdGFydD8oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b2tlbiA9IEB0b2tlblxuXG4gICAgICAgIHJldHVybiB0b2tlblxuXG5cblxuZ3MuQ29tcG9uZW50X01lc3NhZ2VUZXh0UmVuZGVyZXIgPSBDb21wb25lbnRfTWVzc2FnZVRleHRSZW5kZXJlciJdfQ==
//# sourceURL=Component_MessageTextRenderer_132.js