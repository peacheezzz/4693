var Component_HotspotBehavior, HotspotShape,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

HotspotShape = (function() {
  function HotspotShape() {}

  HotspotShape.RECTANGLE = "rect";

  HotspotShape.PIXEL = "pixel";

  return HotspotShape;

})();

gs.HotspotShape = HotspotShape;

Component_HotspotBehavior = (function(superClass) {
  extend(Component_HotspotBehavior, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  *
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_HotspotBehavior.prototype.onDataBundleRestore = function(data, context) {
    return this.setupEventHandlers();
  };


  /**
  * Adds a hotspot-behavior to a game object. That allows a game object
  * to respond to mouse/touch actions by firing an action-event or changing
  * the game object's image.
  *
  * @module gs
  * @class Component_HotspotBehavior
  * @extends gs.Component
  * @memberof gs
  * @constructor
   */

  function Component_HotspotBehavior(params) {

    /**
    * The shape used to detect if a hotspot is clicked, hovered, etc.
    * @property shape
    * @type boolean
     */
    var ref;
    this.shape = gs.HotspotShape.RECTANGLE;

    /**
    * Indicates if the hotspot is selected.
    * @property selected
    * @type boolean
     */
    this.selected = false;

    /**
    * Indicates if the hotspot is enabled.
    * @property enabled
    * @type boolean
     */
    this.enabled = true;

    /**
    * @property imageHandling
    * @type number
    * @protected
     */
    this.imageHandling = 0;

    /**
    * Indicates if the mouse/touch pointer is inside the hotspot bounds.
    * @property contains
    * @type boolean
    * @protected
     */
    this.containsPointer = false;

    /**
    * Indicates if the action-button was pressed before.
    * @property buttonUp
    * @type boolean
    * @protected
     */
    this.buttonUp = false;

    /**
    * Indicates if the action-button is pressed.
    * @property buttonDown
    * @type boolean
    * @protected
     */
    this.buttonDown = false;

    /**
    * @property actionButtons
    * @type Object
    * @protected
     */
    this.actionButtons = {
      "left": Input.Mouse.BUTTON_LEFT,
      "right": Input.Mouse.BUTTON_RIGHT,
      "middle": Input.Mouse.BUTTON_MIDDLE
    };

    /**
    * The default action-button. By default the left-button is used.
    *
    * @property actionButton
    * @type number
     */
    this.actionButton = this.actionButtons[(ref = params != null ? params.actionButton : void 0) != null ? ref : "left"];

    /**
    * The sound played if the hotspot action is executed.
    * @property sound
    * @type Object
     */
    this.sound = params != null ? params.sound : void 0;

    /**
    * <p>The sounds played depending on the hotspot state.</p>
    * <ul>
    * <li>0 = Select Sound</li>
    * <li>1 = Unselect Sound</li>
    * </ul>
    * @property sounds
    * @type Object[]
     */
    this.sounds = (params != null ? params.sounds : void 0) || [];
  }


  /**
  * Gets the render-index of the object associated with the hotspot component. This
  * implementation is necessary to be able to act as an owner for gs.EventEmitter.on
  * event registration.
  *
  * @property rIndex
  * @type number
   */

  Component_HotspotBehavior.accessors("rIndex", {
    get: function() {
      var ref;
      return ((ref = this.object.target) != null ? ref.rIndex : void 0) || this.object.rIndex;
    }
  });


  /**
  * Sets up event handlers.
  *
  * @method setupEventHandlers
   */

  Component_HotspotBehavior.prototype.setupEventHandlers = function() {
    gs.GlobalEventManager.offByOwner("mouseUp", this);
    gs.GlobalEventManager.offByOwner("mouseMoved", this);
    gs.GlobalEventManager.on("hotspotDrop", ((function(_this) {
      return function(e) {
        var hotspot, j, len, rect, ref, results, scene;
        if (!_this.object.canReceiveInput()) {
          return;
        }
        scene = SceneManager.scene;
        ref = scene.hotspots;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          hotspot = ref[j];
          rect = e.sender.dstRect;
          if ((hotspot != null) && hotspot !== e.sender && hotspot.dstRect.contains(Input.Mouse.x, Input.Mouse.y)) {
            results.push(hotspot.events.emit("dropReceived", hotspot));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
    })(this)), null, this);
    gs.GlobalEventManager.on("mouseUp", ((function(_this) {
      return function(e) {
        var contains, mx, my;
        if (!_this.object.canReceiveInput()) {
          return;
        }
        if (!_this.object.visible) {
          return;
        }
        mx = Input.Mouse.x - _this.object.origin.x;
        my = Input.Mouse.y - _this.object.origin.y;
        contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, mx, my);
        if (contains) {
          contains = _this.checkShape(mx - _this.object.dstRect.x, my - _this.object.dstRect.y);
          if (contains) {
            _this.containsPointer = contains;
            _this.updateInput();
            _this.updateEvents();
            _this.object.needsUpdate = true;
            return e.breakChain = true;
          }
        }
      };
    })(this)), null, this);
    if (this.object.images || true) {
      return gs.GlobalEventManager.on("mouseMoved", ((function(_this) {
        return function(e) {
          var contains, mx, my;
          if (!_this.object.canReceiveInput()) {
            return;
          }
          if (!_this.object.visible) {
            return;
          }
          contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, Input.Mouse.x - _this.object.origin.x, Input.Mouse.y - _this.object.origin.y);
          if (contains) {
            mx = Input.Mouse.x - _this.object.origin.x;
            my = Input.Mouse.y - _this.object.origin.y;
            contains = _this.checkShape(mx - _this.object.dstRect.x, my - _this.object.dstRect.y);
          }
          if (_this.containsPointer !== contains) {
            _this.containsPointer = contains;
            _this.object.needsUpdate = true;
            if (contains) {
              _this.object.events.emit("enter", _this);
            } else {
              _this.object.events.emit("leave", _this);
            }
          }
          return _this.updateInput();
        };
      })(this)), null, this);
    }
  };


  /**
  * Initializes the hotspot component.
  *
  * @method setup
   */

  Component_HotspotBehavior.prototype.setup = function() {
    var i, j, len, ref, sound;
    Component_HotspotBehavior.__super__.setup.apply(this, arguments);
    this.sound = ui.Component_FormulaHandler.fieldValue(this.object, this.sound);
    if (this.sounds != null) {
      ref = this.sounds;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        sound = ref[i];
        this.sounds[i] = ui.Component_FormulaHandler.fieldValue(this.object, sound);
      }
    } else {
      this.sounds = [];
    }
    return this.setupEventHandlers();
  };


  /**
  * Disposes the component.
  *
  * @method dispose
   */

  Component_HotspotBehavior.prototype.dispose = function() {
    Component_HotspotBehavior.__super__.dispose.apply(this, arguments);
    gs.GlobalEventManager.offByOwner("mouseUp", this);
    return gs.GlobalEventManager.offByOwner("mouseMoved", this);
  };


  /**
  * Checks if the specified point is inside of the hotspot's shape.
  *
  * @method checkShape
  * @param x - The x-coordinate of the point.
  * @param y - The y-coordinate of the point.
  * @return If <b>true</b> the point is inside of the hotspot's shape. Otherwise <b>false</b>.
   */

  Component_HotspotBehavior.prototype.checkShape = function(x, y) {
    var ref, result;
    result = true;
    switch (this.shape) {
      case gs.HotspotShape.PIXEL:
        if (this.object.bitmap) {
          result = this.object.bitmap.isPixelSet(x, y);
        } else {
          result = (ref = this.object.target) != null ? ref.bitmap.isPixelSet(x, y) : void 0;
        }
    }
    return result;
  };


  /**
  * Updates the image depending on the hotspot state.
  *
  * @method updateImage
  * @protected
   */

  Component_HotspotBehavior.prototype.updateImage = function() {
    var baseImage, object, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
    object = this.object.target || this.object;
    if (this.object.images != null) {
      baseImage = this.enabled ? this.object.images[4] || this.object.images[0] : this.object.images[0];
      if (this.containsPointer) {
        if (this.object.selected || this.selected) {
          object.image = ((ref = this.object.images[3]) != null ? ref.name : void 0) || ((ref1 = this.object.images[2]) != null ? ref1.name : void 0) || (baseImage != null ? baseImage.name : void 0);
          object.imageFolder = ((ref2 = this.object.images[3]) != null ? ref2.folderPath : void 0) || ((ref3 = this.object.images[2]) != null ? ref3.folderPath : void 0) || (baseImage != null ? baseImage.folderPath : void 0);
        } else {
          object.image = ((ref4 = this.object.images[1]) != null ? ref4.name : void 0) || (baseImage != null ? baseImage.name : void 0);
          object.imageFolder = ((ref5 = this.object.images[1]) != null ? ref5.folderPath : void 0) || (baseImage != null ? baseImage.folderPath : void 0);
        }
      } else {
        if (this.object.selected || this.selected) {
          object.image = ((ref6 = this.object.images[2]) != null ? ref6.name : void 0) || ((ref7 = this.object.images[4]) != null ? ref7.name : void 0) || (baseImage != null ? baseImage.name : void 0);
          object.imageFolder = ((ref8 = this.object.images[2]) != null ? ref8.folderPath : void 0) || ((ref9 = this.object.images[4]) != null ? ref9.folderPath : void 0) || (baseImage != null ? baseImage.folderPath : void 0);
        } else {
          object.image = baseImage != null ? baseImage.name : void 0;
          object.imageFolder = baseImage != null ? baseImage.folderPath : void 0;
        }
      }
      if (!object.image) {
        return object.bitmap = null;
      }
    }
  };


  /**
  * Updates the hotspot position and size from an other target game object. For example,
  * that is useful for adding a hotspot to an other moving game object.
  *
  * @method updateFromTarget
  * @protected
   */

  Component_HotspotBehavior.prototype.updateFromTarget = function() {
    if (this.object.target != null) {
      this.object.rIndex = this.object.target.rIndex;
      this.object.dstRect.x = this.object.target.dstRect.x;
      this.object.dstRect.y = this.object.target.dstRect.y;
      this.object.dstRect.width = this.object.target.dstRect.width;
      this.object.dstRect.height = this.object.target.dstRect.height;
      this.object.offset.x = this.object.target.offset.x;
      this.object.offset.y = this.object.target.offset.y;
      this.object.origin.x = this.object.target.origin.x;
      return this.object.origin.y = this.object.target.origin.y;
    }
  };


  /**
  * Updates the event-handling and fires necessary events.
  *
  * @method updateEvents
  * @protected
   */

  Component_HotspotBehavior.prototype.updateEvents = function() {
    var group, j, len, object;
    if (this.buttonUp && this.object.enabled && this.enabled && this.object.visible) {
      if (this.object.selectable) {
        group = gs.ObjectManager.current.objectsByGroup(this.object.group);
        for (j = 0, len = group.length; j < len; j++) {
          object = group[j];
          if (object !== this.object) {
            object.selected = false;
          }
        }
        if (this.object.group) {
          this.selected = true;
        } else {
          this.selected = !this.selected;
        }
        if (this.selected) {
          AudioManager.playSound(this.sounds[0] || this.sound);
        } else {
          AudioManager.playSound(this.sounds[1] || this.sound);
        }
        this.object.events.emit("click", this);
        return this.object.events.emit("stateChanged", this.object);
      } else {
        AudioManager.playSound(this.sounds[0] || this.sound);
        this.object.events.emit("click", this);
        return this.object.events.emit("action", this);
      }
    }
  };


  /**
  * Updates the game object's color depending on the state of the hotspot.
  *
  * @method updateColor
  * @protected
   */

  Component_HotspotBehavior.prototype.updateColor = function() {
    if (!this.object.enabled) {
      return this.object.color.set(0, 0, 0, 100);
    } else {
      return this.object.color.set(0, 0, 0, 0);
    }
  };


  /**
  * Stores current states of mouse/touch pointer and buttons.
  *
  * @method updateInput
  * @protected
   */

  Component_HotspotBehavior.prototype.updateInput = function() {
    this.buttonUp = Input.Mouse.buttons[this.actionButton] === 2 && this.containsPointer;
    return this.buttonDown = Input.Mouse.buttons[this.actionButton] === 1 && this.containsPointer;
  };


  /**
  * Updates the hotspot component.
  *
  * @method update
   */

  Component_HotspotBehavior.prototype.update = function() {
    if (!this.object.visible) {
      return;
    }
    this.updateColor();
    this.updateFromTarget();
    return this.updateImage();
  };

  return Component_HotspotBehavior;

})(gs.Component);

gs.Component_HotspotBehavior = Component_HotspotBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLElBQUEsdUNBQUE7RUFBQTs7O0FBQU07OztFQUNGLFlBQUMsQ0FBQSxTQUFELEdBQWE7O0VBQ2IsWUFBQyxDQUFBLEtBQUQsR0FBUzs7Ozs7O0FBQ2IsRUFBRSxDQUFDLFlBQUgsR0FBa0I7O0FBRVo7Ozs7QUFDRjs7Ozs7Ozs7O3NDQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7V0FDakIsSUFBQyxDQUFBLGtCQUFELENBQUE7RUFEaUI7OztBQUdyQjs7Ozs7Ozs7Ozs7O0VBV2EsbUNBQUMsTUFBRDs7QUFDVDs7Ozs7QUFBQSxRQUFBO0lBS0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFFLENBQUMsWUFBWSxDQUFDOztBQUV6Qjs7Ozs7SUFLQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7O0lBS0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7O0FBRWpCOzs7Ozs7SUFNQSxJQUFDLENBQUEsZUFBRCxHQUFtQjs7QUFFbkI7Ozs7OztJQU1BLElBQUMsQ0FBQSxRQUFELEdBQVk7O0FBRVo7Ozs7OztJQU1BLElBQUMsQ0FBQSxVQUFELEdBQWM7O0FBRWQ7Ozs7O0lBS0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7TUFBRSxNQUFBLEVBQVEsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUF0QjtNQUFtQyxPQUFBLEVBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUF4RDtNQUFzRSxRQUFBLEVBQVUsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUE1Rjs7O0FBRWpCOzs7Ozs7SUFNQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsYUFBYyx1RUFBdUIsTUFBdkI7O0FBRS9COzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELG9CQUFTLE1BQU0sQ0FBRTs7QUFFakI7Ozs7Ozs7OztJQVNBLElBQUMs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QXJCLEVBQXdCLENBQXhCLEVBQTJCLENBQTNCLEVBSEo7O0VBRFM7OztBQU1iOzs7Ozs7O3NDQU1BLFdBQUEsR0FBYSxTQUFBO0lBQ1QsSUFBQyxDQUFBLFFBQUQsR0FBWSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQSxJQUFDLENBQUEsWUFBRCxDQUFwQixLQUFzQyxDQUF0QyxJQUE0QyxJQUFDLENBQUE7V0FDekQsSUFBQyxDQUFBLFVBQUQsR0FBYyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQSxJQUFDLENBQUEsWUFBRCxDQUFwQixLQUFzQyxDQUF0QyxJQUE0QyxJQUFDLENBQUE7RUFGbEQ7OztBQUliOzs7Ozs7c0NBS0EsTUFBQSxHQUFRLFNBQUE7SUFDSixJQUFHLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFmO0FBQTRCLGFBQTVCOztJQUVBLElBQUMsQ0FBQSxXQUFELENBQUE7SUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxXQUFELENBQUE7RUFMSTs7OztHQXZWNEIsRUFBRSxDQUFDOztBQThWM0MsRUFBRSxDQUFDLHlCQUFILEdBQStCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfSG90c3BvdEJlaGF2aW9yXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmNsYXNzIEhvdHNwb3RTaGFwZVxuICAgIEBSRUNUQU5HTEUgPSBcInJlY3RcIlxuICAgIEBQSVhFTCA9IFwicGl4ZWxcIlxuZ3MuSG90c3BvdFNoYXBlID0gSG90c3BvdFNoYXBlXG5cbmNsYXNzIENvbXBvbmVudF9Ib3RzcG90QmVoYXZpb3IgZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uRGF0YUJ1bmRsZVJlc3RvcmUuXG4gICAgKiBAcGFyYW0gT2JqZWN0IGRhdGEgLSBUaGUgZGF0YS1idW5kbGVcbiAgICAqIEBwYXJhbSBncy5PYmplY3RDb2RlY0NvbnRleHQgY29udGV4dCAtIFRoZSBjb2RlYy1jb250ZXh0LlxuICAgICMjI1xuICAgIG9uRGF0YUJ1bmRsZVJlc3RvcmU6IChkYXRhLCBjb250ZXh0KSAtPlxuICAgICAgICBAc2V0dXBFdmVudEhhbmRsZXJzKClcblxuICAgICMjIypcbiAgICAqIEFkZHMgYSBob3RzcG90LWJlaGF2aW9yIHRvIGEgZ2FtZSBvYmplY3QuIFRoYXQgYWxsb3dzIGEgZ2FtZSBvYmplY3RcbiAgICAqIHRvIHJlc3BvbmQgdG8gbW91c2UvdG91Y2ggYWN0aW9ucyBieSBmaXJpbmcgYW4gYWN0aW9uLWV2ZW50IG9yIGNoYW5naW5nXG4gICAgKiB0aGUgZ2FtZSBvYmplY3QncyBpbWFnZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0hvdHNwb3RCZWhhdmlvclxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAocGFyYW1zKSAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHNoYXBlIHVzZWQgdG8gZGV0ZWN0IGlmIGEgaG90c3BvdCBpcyBjbGlja2VkLCBob3ZlcmVkLCBldGMuXG4gICAgICAgICogQHByb3BlcnR5IHNoYXBlXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHNoYXBlID0gZ3MuSG90c3BvdFNoYXBlLlJFQ1RBTkdMRVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIGhvdHNwb3QgaXMgc2VsZWN0ZWQuXG4gICAgICAgICogQHByb3BlcnR5IHNlbGVjdGVkXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHNlbGVjdGVkID0gbm9cblxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBob3RzcG90IGlzIGVuYWJsZWQuXG4gICAgICAgICogQHByb3BlcnR5IGVuYWJsZWRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAZW5hYmxlZCA9IHllc1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgaW1hZ2VIYW5kbGluZ1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbWFnZUhhbmRsaW5nID0gMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIG1vdXNlL3RvdWNoIHBvaW50ZXIgaXMgaW5zaWRlIHRoZSBob3RzcG90IGJvdW5kcy5cbiAgICAgICAgKiBAcHJvcGVydHkgY29udGFpbnNcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGNvbnRhaW5zUG9pbnRlciA9IG5vXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgYWN0aW9uLWJ1dHRvbiB3YXMgcHJlc3NlZCBiZWZvcmUuXG4gICAgICAgICogQHByb3BlcnR5IGJ1dHRvblVwXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBidXR0b25VcCA9IG5vXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgYWN0aW9uLWJ1dHRvbiBpcyBwcmVzc2VkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBidXR0b25Eb3duXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBidXR0b25Eb3duID0gbm9cblxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGFjdGlvbkJ1dHRvbnNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAYWN0aW9uQnV0dG9ucyA9IHsgXCJsZWZ0XCI6IElucHV0Lk1vdXNlLkJVVFRPTl9MRUZULCBcInJpZ2h0XCI6IElucHV0Lk1vdXNlLkJVVFRPTl9SSUdIVCwgXCJtaWRkbGVcIjogSW5wdXQuTW91c2UuQlVUVE9OX01JRERMRSB9XG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBkZWZhdWx0IGFjdGlvbi1idXR0b24uIEJ5IGRlZmF1bHQgdGhlIGxlZnQtYnV0dG9uIGlzIHVzZWQuXG4gICAgICAgICpcbiAgICAgICAgKiBAcHJvcGVydHkgYWN0aW9uQnV0dG9uXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAYWN0aW9uQnV0dG9uID0gQGFjdGlvbkJ1dHRvbnNbcGFyYW1zPy5hY3Rpb25CdXR0b24gPyBcImxlZnRcIl1cblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHNvdW5kIHBsYXllZCBpZiB0aGUgaG90c3BvdCBhY3Rpb24gaXMgZXhlY3V0ZWQuXG4gICAgICAgICogQHByb3BlcnR5IHNvdW5kXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAc291bmQgPSBwYXJhbXM/LnNvdW5kXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIDxwPlRoZSBzb3VuZHMgcGxheWVkIGRlcGVuZGluZyBvbiB0aGUgaG90c3BvdCBzdGF0ZS48L3A+XG4gICAgICAgICogPHVsPlxuICAgICAgICAqIDxsaT4wID0gU2VsZWN0IFNvdW5kPC9saT5cbiAgICAgICAgKiA8bGk+MSA9IFVuc2VsZWN0IFNvdW5kPC9saT5cbiAgICAgICAgKiA8L3VsPlxuICAgICAgICAqIEBwcm9wZXJ0eSBzb3VuZHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVxuICAgICAgICAjIyNcbiAgICAgICAgQHNvdW5kcyA9IHBhcmFtcz8uc291bmRzIHx8IFtdXG5cblxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHJlbmRlci1pbmRleCBvZiB0aGUgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaG90c3BvdCBjb21wb25lbnQuIFRoaXNcbiAgICAqIGltcGxlbWVudGF0aW9uIGlzIG5lY2Vzc2FyeSB0byBiZSBhYmxlIHRvIGFjdCBhcyBhbiBvd25lciBmb3IgZ3MuRXZlbnRFbWl0dGVyLm9uXG4gICAgKiBldmVudCByZWdpc3RyYXRpb24uXG4gICAgKlxuICAgICogQHByb3BlcnR5IHJJbmRleFxuICAgICogQHR5cGUgbnVtYmVyXG4gICAgIyMjXG4gICAgQGFjY2Vzc29ycyBcInJJbmRleFwiLFxuICAgICAgICBnZXQ6IC0+IEBvYmplY3QudGFyZ2V0Py5ySW5kZXggfHwgQG9iamVjdC5ySW5kZXhcblxuICAgICMjIypcbiAgICAqIFNldHMgdXAgZXZlbnQgaGFuZGxlcnMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEV2ZW50SGFuZGxlcnNcbiAgICAjIyNcbiAgICBzZXR1cEV2ZW50SGFuZGxlcnM6IC0+XG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCB0aGlzKVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlTW92ZWRcIiwgdGhpcylcblxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJob3RzcG90RHJvcFwiLCAoKGUpID0+XG4gICAgICAgICAgICByZXR1cm4gaWYgIUBvYmplY3QuY2FuUmVjZWl2ZUlucHV0KClcbiAgICAgICAgICAgIHNjZW5lID0gU2NlbmVNYW5hZ2VyLnNjZW5lXG4gICAgICAgICAgICBmb3IgaG90c3BvdCBpbiBzY2VuZS5ob3RzcG90c1xuICAgICAgICAgICAgICAgIHJlY3QgPSBlLnNlbmRlci5kc3RSZWN0XG4gICAgICAgICAgICAgICAgaWYgaG90c3BvdD8gYW5kIGhvdHNwb3QgIT0gZS5zZW5kZXIgYW5kIGhvdHNwb3QuZHN0UmVjdC5jb250YWlucyhJbnB1dC5Nb3VzZS54LCBJbnB1dC5Nb3VzZS55KVxuICAgICAgICAgICAgICAgICAgICBob3RzcG90LmV2ZW50cy5lbWl0KFwiZHJvcFJlY2VpdmVkXCIsIGhvdHNwb3QpXG4gICAgICAgICAgICAgICAgICAgICNAZXhlY3V0ZUFjdGlvbihob3RzcG90LmRhdGEucGFyYW1zLmFjdGlvbnMub25Ecm9wUmVjZWl2ZSwgeWVzLCBob3RzcG90LmRhdGEuYmluZFZhbHVlKVxuICAgICAgICApLCBudWxsLCB0aGlzXG5cbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VVcFwiLCAoKGUpID0+XG4gICAgICAgICAgICByZXR1cm4gaWYgIUBvYmplY3QuY2FuUmVjZWl2ZUlucHV0KClcbiAgICAgICAgICAgIHJldHVybiBpZiBub3QgQG9iamVjdC52aXNpYmxlXG4gICAgICAgICAgICBteCA9IElucHV0Lk1vdXNlLnggLSBAb2JqZWN0Lm9yaWdpbi54XG4gICAgICAgICAgICBteSA9IElucHV0Lk1vdXNlLnkgLSBAb2JqZWN0Lm9yaWdpbi55XG4gICAgICAgICAgICBjb250YWlucyA9IFJlY3QuY29udGFpbnMoQG9iamVjdC5kc3RSZWN0LngsIEBvYmplY3QuZHN0UmVjdC55LFxuICAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZHN0UmVjdC53aWR0aCwgQG9iamVjdC5kc3RSZWN0LmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICBteCwgbXkpXG4gICAgICAgICAgICBpZiBjb250YWluc1xuICAgICAgICAgICAgICAgIGNvbnRhaW5zID0gQGNoZWNrU2hhcGUobXggLSBAb2JqZWN0LmRzdFJlY3QueCwgbXkgLSBAb2JqZWN0LmRzdFJlY3QueSlcbiAgICAgICAgICAgICAgICBpZiBjb250YWluc1xuICAgICAgICAgICAgICAgICAgICBAY29udGFpbnNQb2ludGVyID0gY29udGFpbnNcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUlucHV0KClcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUV2ZW50cygpXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgZS5icmVha0NoYWluID0geWVzXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbnVsbCwgdGhpc1xuXG4gICAgICAgIGlmIEBvYmplY3QuaW1hZ2VzIG9yIHllc1xuICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VNb3ZlZFwiLCAoKGUpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmICFAb2JqZWN0LmNhblJlY2VpdmVJbnB1dCgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIG5vdCBAb2JqZWN0LnZpc2libGVcblxuICAgICAgICAgICAgICAgIGNvbnRhaW5zID0gUmVjdC5jb250YWlucyhAb2JqZWN0LmRzdFJlY3QueCwgQG9iamVjdC5kc3RSZWN0LnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5kc3RSZWN0LndpZHRoLCBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgIElucHV0Lk1vdXNlLnggLSBAb2JqZWN0Lm9yaWdpbi54LCBJbnB1dC5Nb3VzZS55IC0gQG9iamVjdC5vcmlnaW4ueSlcblxuICAgICAgICAgICAgICAgIGlmIGNvbnRhaW5zXG4gICAgICAgICAgICAgICAgICAgIG14ID0gSW5wdXQuTW91c2UueCAtIEBvYmplY3Qub3JpZ2luLnhcbiAgICAgICAgICAgICAgICAgICAgbXkgPSBJbnB1dC5Nb3VzZS55IC0gQG9iamVjdC5vcmlnaW4ueVxuICAgICAgICAgICAgICAgICAgICBjb250YWlucyA9IEBjaGVja1NoYXBlKG14IC0gQG9iamVjdC5kc3RSZWN0LngsIG15IC0gQG9iamVjdC5kc3RSZWN0LnkpXG5cbiAgICAgICAgICAgICAgICBpZiBAY29udGFpbnNQb2ludGVyICE9IGNvbnRhaW5zXG4gICAgICAgICAgICAgICAgICAgIEBjb250YWluc1BvaW50ZXIgPSBjb250YWluc1xuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0Lm5lZWRzVXBkYXRlID0geWVzXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgY29udGFpbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzLmVtaXQoXCJlbnRlclwiLCB0aGlzKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0KFwibGVhdmVcIiwgdGhpcylcblxuICAgICAgICAgICAgICAgIEB1cGRhdGVJbnB1dCgpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbnVsbCwgdGhpc1xuXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIGhvdHNwb3QgY29tcG9uZW50LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBcbiAgICAjIyNcbiAgICBzZXR1cDogLT5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICBAc291bmQgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShAb2JqZWN0LCBAc291bmQpXG5cbiAgICAgICAgaWYgQHNvdW5kcz9cbiAgICAgICAgICAgIGZvciBzb3VuZCwgaSBpbiBAc291bmRzXG4gICAgICAgICAgICAgICAgQHNvdW5kc1tpXSA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKEBvYmplY3QsIHNvdW5kKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIEBzb3VuZHMgPSBbXVxuXG5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG5cblxuXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIGNvbXBvbmVudC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyNcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBzdXBlclxuXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCB0aGlzKVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlTW92ZWRcIiwgdGhpcylcblxuXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGlmIHRoZSBzcGVjaWZpZWQgcG9pbnQgaXMgaW5zaWRlIG9mIHRoZSBob3RzcG90J3Mgc2hhcGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBjaGVja1NoYXBlXG4gICAgKiBAcGFyYW0geCAtIFRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIHBvaW50LlxuICAgICogQHBhcmFtIHkgLSBUaGUgeS1jb29yZGluYXRlIG9mIHRoZSBwb2ludC5cbiAgICAqIEByZXR1cm4gSWYgPGI+dHJ1ZTwvYj4gdGhlIHBvaW50IGlzIGluc2lkZSBvZiB0aGUgaG90c3BvdCdzIHNoYXBlLiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+LlxuICAgICMjI1xuICAgIGNoZWNrU2hhcGU6ICh4LCB5KSAtPlxuICAgICAgICByZXN1bHQgPSB5ZXNcblxuICAgICAgICBzd2l0Y2ggQHNoYXBlXG4gICAgICAgICAgICB3aGVuIGdzLkhvdHNwb3RTaGFwZS5QSVhFTFxuICAgICAgICAgICAgICAgIGlmIEBvYmplY3QuYml0bWFwXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBvYmplY3QuYml0bWFwLmlzUGl4ZWxTZXQoeCwgeSlcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBvYmplY3QudGFyZ2V0Py5iaXRtYXAuaXNQaXhlbFNldCh4LCB5KVxuXG4gICAgICAgIHJldHVybiByZXN1bHRcblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGltYWdlIGRlcGVuZGluZyBvbiB0aGUgaG90c3BvdCBzdGF0ZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUltYWdlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgdXBkYXRlSW1hZ2U6IC0+XG4gICAgICAgIG9iamVjdCA9IEBvYmplY3QudGFyZ2V0IHx8IEBvYmplY3RcbiAgICAgICAgaWYgQG9iamVjdC5pbWFnZXM/XG4gICAgICAgICAgICBiYXNlSW1hZ2UgPSBpZiBAZW5hYmxlZCB0aGVuIEBvYmplY3QuaW1hZ2VzWzRdIHx8IEBvYmplY3QuaW1hZ2VzWzBdIGVsc2UgQG9iamVjdC5pbWFnZXNbMF1cbiAgICAgICAgICAgIGlmIEBjb250YWluc1BvaW50ZXJcbiAgICAgICAgICAgICAgICBpZiBAb2JqZWN0LnNlbGVjdGVkIG9yIEBzZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuaW1hZ2UgPSBAb2JqZWN0LmltYWdlc1szXT8ubmFtZSB8fCBAb2JqZWN0LmltYWdlc1syXT8ubmFtZSB8fCBiYXNlSW1hZ2U/Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmltYWdlRm9sZGVyID0gQG9iamVjdC5pbWFnZXNbM10/LmZvbGRlclBhdGggfHwgQG9iamVjdC5pbWFnZXNbMl0/LmZvbGRlclBhdGggfHwgYmFzZUltYWdlPy5mb2xkZXJQYXRoXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvYmplY3QuaW1hZ2UgPSBAb2JqZWN0LmltYWdlc1sxXT8ubmFtZSB8fCBiYXNlSW1hZ2U/Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmltYWdlRm9sZGVyID0gQG9iamVjdC5pbWFnZXNbMV0/LmZvbGRlclBhdGggfHwgYmFzZUltYWdlPy5mb2xkZXJQYXRoXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgQG9iamVjdC5zZWxlY3RlZCBvciBAc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmltYWdlID0gQG9iamVjdC5pbWFnZXNbMl0/Lm5hbWUgfHwgQG9iamVjdC5pbWFnZXNbNF0/Lm5hbWUgfHwgYmFzZUltYWdlPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5pbWFnZUZvbGRlciA9IEBvYmplY3QuaW1hZ2VzWzJdPy5mb2xkZXJQYXRoIHx8IEBvYmplY3QuaW1hZ2VzWzRdPy5mb2xkZXJQYXRoIHx8IGJhc2VJbWFnZT8uZm9sZGVyUGF0aFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmltYWdlID0gYmFzZUltYWdlPy5uYW1lXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5pbWFnZUZvbGRlciA9IGJhc2VJbWFnZT8uZm9sZGVyUGF0aFxuXG4gICAgICAgICAgICBpZiAhb2JqZWN0LmltYWdlXG4gICAgICAgICAgICAgICAgb2JqZWN0LmJpdG1hcCA9IG51bGxcblxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgaG90c3BvdCBwb3NpdGlvbiBhbmQgc2l6ZSBmcm9tIGFuIG90aGVyIHRhcmdldCBnYW1lIG9iamVjdC4gRm9yIGV4YW1wbGUsXG4gICAgKiB0aGF0IGlzIHVzZWZ1bCBmb3IgYWRkaW5nIGEgaG90c3BvdCB0byBhbiBvdGhlciBtb3ZpbmcgZ2FtZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVGcm9tVGFyZ2V0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgdXBkYXRlRnJvbVRhcmdldDogLT5cbiAgICAgICAgaWYgQG9iamVjdC50YXJnZXQ/XG4gICAgICAgICAgICBAb2JqZWN0LnJJbmRleCA9IEBvYmplY3QudGFyZ2V0LnJJbmRleFxuICAgICAgICAgICAgQG9iamVjdC5kc3RSZWN0LnggPSBAb2JqZWN0LnRhcmdldC5kc3RSZWN0LnhcbiAgICAgICAgICAgIEBvYmplY3QuZHN0UmVjdC55ID0gQG9iamVjdC50YXJnZXQuZHN0UmVjdC55XG4gICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3Qud2lkdGggPSBAb2JqZWN0LnRhcmdldC5kc3RSZWN0LndpZHRoXG4gICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gQG9iamVjdC50YXJnZXQuZHN0UmVjdC5oZWlnaHRcbiAgICAgICAgICAgIEBvYmplY3Qub2Zmc2V0LnggPSBAb2JqZWN0LnRhcmdldC5vZmZzZXQueFxuICAgICAgICAgICAgQG9iamVjdC5vZmZzZXQueSA9IEBvYmplY3QudGFyZ2V0Lm9mZnNldC55XG4gICAgICAgICAgICBAb2JqZWN0Lm9yaWdpbi54ID0gQG9iamVjdC50YXJnZXQub3JpZ2luLnhcbiAgICAgICAgICAgIEBvYmplY3Qub3JpZ2luLnkgPSBAb2JqZWN0LnRhcmdldC5vcmlnaW4ueVxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgZXZlbnQtaGFuZGxpbmcgYW5kIGZpcmVzIG5lY2Vzc2FyeSBldmVudHMuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVFdmVudHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICB1cGRhdGVFdmVudHM6IC0+XG4gICAgICAgIGlmIEBidXR0b25VcCBhbmQgQG9iamVjdC5lbmFibGVkIGFuZCBAZW5hYmxlZCBhbmQgQG9iamVjdC52aXNpYmxlXG4gICAgICAgICAgICBpZiBAb2JqZWN0LnNlbGVjdGFibGVcbiAgICAgICAgICAgICAgICBncm91cCA9IGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5vYmplY3RzQnlHcm91cChAb2JqZWN0Lmdyb3VwKVxuICAgICAgICAgICAgICAgIGZvciBvYmplY3QgaW4gZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqZWN0ICE9IEBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5zZWxlY3RlZCA9IG5vXG4gICAgICAgICAgICAgICAgaWYgQG9iamVjdC5ncm91cFxuICAgICAgICAgICAgICAgICAgICBAc2VsZWN0ZWQgPSB5ZXNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBzZWxlY3RlZCA9ICFAc2VsZWN0ZWRcblxuICAgICAgICAgICAgICAgIGlmIEBzZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIucGxheVNvdW5kKEBzb3VuZHNbMF0gfHwgQHNvdW5kKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnBsYXlTb3VuZChAc291bmRzWzFdIHx8IEBzb3VuZClcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0KFwiY2xpY2tcIiwgdGhpcylcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0KFwic3RhdGVDaGFuZ2VkXCIsIEBvYmplY3QpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnBsYXlTb3VuZChAc291bmRzWzBdIHx8IEBzb3VuZClcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0KFwiY2xpY2tcIiwgdGhpcylcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cy5lbWl0KFwiYWN0aW9uXCIsIHRoaXMpXG5cbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBnYW1lIG9iamVjdCdzIGNvbG9yIGRlcGVuZGluZyBvbiB0aGUgc3RhdGUgb2YgdGhlIGhvdHNwb3QuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVDb2xvclxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIHVwZGF0ZUNvbG9yOiAtPlxuICAgICAgICBpZiAhQG9iamVjdC5lbmFibGVkXG4gICAgICAgICAgICBAb2JqZWN0LmNvbG9yLnNldCgwLCAwLCAwLCAxMDApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBvYmplY3QuY29sb3Iuc2V0KDAsIDAsIDAsIDApXG5cbiAgICAjIyMqXG4gICAgKiBTdG9yZXMgY3VycmVudCBzdGF0ZXMgb2YgbW91c2UvdG91Y2ggcG9pbnRlciBhbmQgYnV0dG9ucy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUlucHV0XG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgdXBkYXRlSW5wdXQ6IC0+XG4gICAgICAgIEBidXR0b25VcCA9IElucHV0Lk1vdXNlLmJ1dHRvbnNbQGFjdGlvbkJ1dHRvbl0gPT0gMiBhbmQgQGNvbnRhaW5zUG9pbnRlclxuICAgICAgICBAYnV0dG9uRG93biA9IElucHV0Lk1vdXNlLmJ1dHRvbnNbQGFjdGlvbkJ1dHRvbl0gPT0gMSBhbmQgQGNvbnRhaW5zUG9pbnRlclxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgaG90c3BvdCBjb21wb25lbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyNcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIGlmIG5vdCBAb2JqZWN0LnZpc2libGUgdGhlbiByZXR1cm5cblxuICAgICAgICBAdXBkYXRlQ29sb3IoKVxuICAgICAgICBAdXBkYXRlRnJvbVRhcmdldCgpXG4gICAgICAgIEB1cGRhdGVJbWFnZSgpXG5cbmdzLkNvbXBvbmVudF9Ib3RzcG90QmVoYXZpb3IgPSBDb21wb25lbnRfSG90c3BvdEJlaGF2aW9yIl19
//# sourceURL=Component_HotspotBehavior_23.js