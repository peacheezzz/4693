var Component_ImageMap,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_ImageMap = (function(superClass) {
  extend(Component_ImageMap, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  *
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_ImageMap.prototype.onDataBundleRestore = function(data, context) {
    var bitmap, ground;
    this.setupEventHandlers();
    this.object.addObject(this.ground);
    bitmap = ResourceManager.getBitmap(ResourceManager.getPath(this.object.images[0]));
    ground = new gs.Bitmap(bitmap.width, bitmap.height);
    ground.blt(0, 0, bitmap, new Rect(0, 0, bitmap.width, bitmap.height));
    this.ground.bitmap = ground;
    return this.setupHotspots(this.hotspots);
  };


  /**
  * A component which turns a game object into an interactive image-map.
  *
  * @module gs
  * @class Component_ImageMap
  * @extends gs.Component_Visual
  * @memberof gs
   */

  function Component_ImageMap() {
    Component_ImageMap.__super__.constructor.apply(this, arguments);

    /**
    * The ground/base image.
    * @property ground
    * @type gs.Object_Picture
    * @default null
     */
    this.ground = null;

    /**
    * An array of different hotspots.
    * @property hotspots
    * @type gs.Object_Picture[]
    * @default null
     */
    this.hotspots = null;

    /**
    * The variable context used if a hotspot needs to deal with local variables.
    * @property variableContext
    * @type Object
    * @default null
     */
    this.variableContext = null;

    /**
    * Indicates if the image-map is active. An in-active image-map doesn't respond
    * to any input-event. Hover effects are still working.
    * @property active
    * @type boolean
    * @default yes
     */
    this.active = true;
  }


  /**
  * Adds event-handler for mouse/touch events to update the component only if
  * a user-action happened.
  *
  * @method setupEventHandlers
   */

  Component_ImageMap.prototype.setupEventHandlers = function() {
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    return gs.GlobalEventManager.on("mouseUp", ((function(_this) {
      return function(e) {
        var contains, hotspot, j, len, ref, results;
        if (!_this.object.canReceiveInput()) {
          return;
        }
        contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, Input.Mouse.x - _this.object.origin.x, Input.Mouse.y - _this.object.origin.y);
        if (contains && _this.active) {
          ref = _this.hotspots;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            hotspot = ref[j];
            if (_this.checkHotspotAction(hotspot)) {
              e.breakChain = true;
              if (hotspot.data.bindToSwitch) {
                hotspot.selected = !hotspot.selected;
              }
              results.push(_this.executeHotspotAction(hotspot));
            } else {
              results.push(void 0);
            }
          }
          return results;
        }
      };
    })(this)), null, this.object);
  };


  /**
  * Initializes the image-map. Creates the background and hotspots.
  *
  * @method setup
   */

  Component_ImageMap.prototype.setup = function() {
    var bitmap, ground;
    this.setupEventHandlers();
    if (this.object.images[0]) {
      bitmap = ResourceManager.getBitmap(ResourceManager.getPath(this.object.images[0]));
      if (bitmap.loaded) {
        bitmap.makeMutable();
        ground = new gs.Bitmap(bitmap.width, bitmap.height);
        ground.blt(0, 0, bitmap, new Rect(0, 0, bitmap.width, bitmap.height));
      }
    }
    this.ground = new gs.Object_Picture();
    this.ground.bitmap = ground;
    this.ground.image = null;
    this.ground.zIndex = this.object.zIndex;
    this.ground.imageHandling = gs.ImageHandling.CUSTOM_SIZE;
    this.object.addObject(this.ground);
    this.setupHotspots();
    if (ground != null) {
      this.ground.srcRect.set(0, 0, ground.width, ground.height);
      this.ground.dstRect.width = ground.width;
      this.ground.dstRect.height = ground.height;
    }
    this.ground.update();
    this.object.dstRect.width = this.ground.dstRect.width;
    return this.object.dstRect.height = this.ground.dstRect.height;
  };


  /**
  * Sets up the hotspots on the image-map. Each hotspot is a gs.Object_ImageMapHotspot
  * object.
  *
  * @method setupHotspots
   */

  Component_ImageMap.prototype.setupHotspots = function(hotspots) {
    return this.hotspots = this.object.hotspots.select((function(_this) {
      return function(v, i) {
        var picture, ref, ref1, ref2, ref3, ref4;
        if ((ref = _this.ground.bitmap) != null) {
          ref.clearRect(v.x, v.y, v.size.width, v.size.height);
        }
        picture = new gs.Object_ImageMapHotspot();
        picture.fixedSize = true;
        picture.srcRect = new Rect(v.x, v.y, v.size.width, v.size.height);
        picture.dstRect = new Rect(v.x, v.y, v.size.width, v.size.height);
        picture.imageHandling = gs.ImageHandling.CUSTOM_SIZE;
        picture.zIndex = _this.object.zIndex + 1;
        picture.selected = (ref1 = hotspots != null ? (ref2 = hotspots[i]) != null ? ref2.selected : void 0 : void 0) != null ? ref1 : false;
        picture.hovered = false;
        picture.enabled = (ref3 = hotspots != null ? (ref4 = hotspots[i]) != null ? ref4.enabled : void 0 : void 0) != null ? ref3 : true;
        picture.actions = v.data.actions;
        picture.data = v.data;
        picture.commonEventId = v.commonEventId;
        picture.anchor.set(0.5, 0.5);
        _this.object.addObject(picture);
        return picture;
      };
    })(this));
  };


  /**
  * Initializes the image-map. Frees ground image.
  *
  * @method dispose
   */

  Component_ImageMap.prototype.dispose = function() {
    var ref;
    Component_ImageMap.__super__.dispose.apply(this, arguments);
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    return (ref = this.ground.bitmap) != null ? ref.dispose() : void 0;
  };


  /**
  * Executes a hotspot's associated action. Depending on the configuration a hotspot
  * can trigger a common-event or turn on a switch for example.
  *
  * @method executeHotspotAction
  * @param {gs.Object_Picture} hotspot - The hotspot where the image should be updated.
  * @protected
   */

  Component_ImageMap.prototype.executeHotspotAction = function(hotspot) {
    var domain, ref, ref1, ref2, ref3;
    GameManager.variableStore.setupTempVariables(this.variableContext);
    if (hotspot.data.bindToSwitch) {
      domain = GameManager.variableStore.domain;
      GameManager.variableStore.setBooleanValueTo(hotspot.data["switch"], hotspot.selected);
    }
    if (hotspot.data.bindValueTo) {
      domain = GameManager.variableStore.domain;
      GameManager.variableStore.setNumberValueTo(hotspot.data.bindValueVariable, hotspot.data.bindValue);
    }
    AudioManager.playSound(hotspot.data.onClickSound);
    switch (hotspot.data.action) {
      case 1:
        if ((ref = this.object.events) != null) {
          ref.emit("jumpTo", this.object, {
            label: hotspot.data.label
          });
        }
        break;
      case 2:
        if ((ref1 = this.object.events) != null) {
          ref1.emit("callCommonEvent", this.object, {
            commonEventId: hotspot.data.commonEventId,
            finish: hotspot.data.finish
          });
        }
        break;
      case 3:
        if ((ref2 = this.object.events) != null) {
          ref2.emit("action", this.object, {
            actions: hotspot.data.actions
          });
        }
    }
    if (hotspot.data.finish) {
      return (ref3 = this.object.events) != null ? ref3.emit("finish", this.object) : void 0;
    }
  };


  /**
  * Checks if a hotspot's associated action needs to be executed. Depending on the configuration a hotspot
  * can trigger a common-event or turn on a switch for example.
  *
  * @method updateHotspotAction
  * @param {gs.Object_Picture} hotspot - The hotspot where the image should be updated.
  * @return {boolean} If <b>true</b> the hotspot's action needs to be executed. Otherwise <b>false</b>.
  * @protected
   */

  Component_ImageMap.prototype.checkHotspotAction = function(hotspot) {
    var hovered, result;
    result = false;
    hovered = hotspot.dstRect.contains(Input.Mouse.x - hotspot.origin.x, Input.Mouse.y - hotspot.origin.y);
    if (hovered && hotspot.enabled && Input.Mouse.buttons[Input.Mouse.LEFT] === 2) {
      result = true;
    }
    return result;
  };


  /**
  * Updates a hotspot's image. Depending on the state the image of a hotspot can
  * change for example if the mouse hovers over a hotspot.
  *
  * @method updateHotspotImage
  * @param {gs.Object_Picture} hotspot - The hotspot where the image should be updated.
  * @param {boolean} hovered - Indicates if the hotspot is hovered by mouse/touch cursor.
  * @protected
   */

  Component_ImageMap.prototype.updateHotspotImage = function(hotspot, hovered) {
    var baseImage, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
    baseImage = hotspot.enabled ? this.object.images[2] || this.object.images[0] : this.object.images[0];
    if (hovered && hotspot.enabled) {
      if (hotspot.selected) {
        hotspot.imageFolder = ((ref = this.object.images[4]) != null ? ref.folderPath : void 0) || ((ref1 = this.object.images[1]) != null ? ref1.folderPath : void 0) || (baseImage != null ? baseImage.folderPath : void 0);
        return hotspot.image = ((ref2 = this.object.images[4]) != null ? ref2.name : void 0) || ((ref3 = this.object.images[1]) != null ? ref3.name : void 0) || (baseImage != null ? baseImage.name : void 0);
      } else {
        hotspot.imageFolder = ((ref4 = this.object.images[1]) != null ? ref4.folderPath : void 0) || (baseImage != null ? baseImage.folderPath : void 0);
        return hotspot.image = ((ref5 = this.object.images[1]) != null ? ref5.name : void 0) || (baseImage != null ? baseImage.name : void 0);
      }
    } else {
      if (hotspot.selected) {
        hotspot.imageFolder = ((ref6 = this.object.images[3]) != null ? ref6.folderPath : void 0) || (baseImage != null ? baseImage.folderPath : void 0);
        return hotspot.image = ((ref7 = this.object.images[3]) != null ? ref7.name : void 0) || (baseImage != null ? baseImage.name : void 0);
      } else {
        hotspot.imageFolder = baseImage != null ? baseImage.folderPath : void 0;
        return hotspot.image = baseImage != null ? baseImage.name : void 0;
      }
    }
  };


  /**
  * Updates a hotspot.
  *
  * @method updateHotspot
  * @param {gs.Object_Picture} hotspot - The hotspot to update.
  * @protected
   */

  Component_ImageMap.prototype.updateHotspot = function(hotspot) {
    var hovered;
    hotspot.visible = this.object.visible;
    hotspot.opacity = this.object.opacity;
    hotspot.tone.setFromObject(this.object.tone);
    hotspot.color.setFromObject(this.object.color);
    if (hotspot.data.bindEnabledState) {
      GameManager.variableStore.setupTempVariables(this.variableContext);
      hotspot.enabled = GameManager.variableStore.booleanValueOf(hotspot.data.enabledSwitch);
    }
    if (hotspot.data.bindToSwitch) {
      GameManager.variableStore.setupTempVariables(this.variableContext);
      hotspot.selected = GameManager.variableStore.booleanValueOf(hotspot.data["switch"]);
    }
    hovered = hotspot.dstRect.contains(Input.Mouse.x - hotspot.origin.x, Input.Mouse.y - hotspot.origin.y);
    if (hovered !== hotspot.hovered) {
      hotspot.hovered = hovered;
      if (hovered) {
        AudioManager.playSound(hotspot.data.onHoverSound);
      }
    }
    this.updateHotspotImage(hotspot, hovered);
    return hotspot.update();
  };


  /**
  * Updates the ground-image.
  *
  * @method updateGround
  * @protected
   */

  Component_ImageMap.prototype.updateGround = function() {
    this.ground.visible = this.object.visible;
    this.ground.opacity = this.object.opacity;
    this.ground.anchor.x = 0.5;
    this.ground.anchor.y = 0.5;
    this.ground.tone.setFromObject(this.object.tone);
    this.ground.color.setFromObject(this.object.color);
    return this.ground.update();
  };


  /**
  * Updates the image-map's ground and all hotspots.
  *
  * @method update
   */

  Component_ImageMap.prototype.update = function() {
    var hotspot, j, len, ref;
    Component_ImageMap.__super__.update.call(this);
    this.object.rIndex = this.ground.rIndex;
    this.updateGround();
    ref = this.hotspots;
    for (j = 0, len = ref.length; j < len; j++) {
      hotspot = ref[j];
      this.updateHotspot(hotspot);
    }
    return null;
  };

  return Component_ImageMap;

})(gs.Component_Visual);

gs.Component_ImageMap = Component_ImageMap;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsa0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OytCQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDakIsUUFBQTtJQUFBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLElBQUMsQ0FBQSxNQUFuQjtJQUVBLE1BQUEsR0FBUyxlQUFlLENBQUMsU0FBaEIsQ0FBMEIsZUFBZSxDQUFDLE9BQWhCLENBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBdkMsQ0FBMUI7SUFDVCxNQUFBLEdBQWEsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLE1BQU0sQ0FBQyxLQUFqQixFQUF3QixNQUFNLENBQUMsTUFBL0I7SUFDYixNQUFNLENBQUMsR0FBUCxDQUFXLENBQVgsRUFBYyxDQUFkLEVBQWlCLE1BQWpCLEVBQTZCLElBQUEsSUFBQSxDQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsTUFBTSxDQUFDLEtBQWxCLEVBQXlCLE1BQU0sQ0FBQyxNQUFoQyxDQUE3QjtJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFpQjtXQUVqQixJQUFDLENBQUEsYUFBRCxDQUFlLElBQUMsQ0FBQSxRQUFoQjtFQVRpQjs7O0FBV3JCOzs7Ozs7Ozs7RUFRYSw0QkFBQTtJQUNULHFEQUFBLFNBQUE7O0FBRUE7Ozs7OztJQU1BLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7OztJQU1BLElBQUMsQ0FBQSxRQUFELEdBQVk7O0FBRVo7Ozs7OztJQU1BLElBQUMsQ0FBQSxlQUFELEdBQW1COztBQUVuQjs7Ozs7OztJQU9BLElBQUMsQ0FBQSxNQUFELEdBQVU7RUFsQ0Q7OztBQW9DYjs7Ozs7OzsrQkFNQSxrQkFBQSxHQUFvQixTQUFBO0lBQ2hCLEVBQUUsQ0FB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QUEsNkNBQUE7SUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUN6QixJQUFDLENBQUEsWUFBRCxDQUFBO0FBRUE7QUFBQSxTQUFBLHFDQUFBOztNQUNJLElBQUMsQ0FBQSxhQUFELENBQWUsT0FBZjtBQURKO0FBR0EsV0FBTztFQVRIOzs7O0dBdFJxQixFQUFFLENBQUM7O0FBaVNwQyxFQUFFLENBQUMsa0JBQUgsR0FBd0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9JbWFnZU1hcFxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X0ltYWdlTWFwIGV4dGVuZHMgZ3MuQ29tcG9uZW50X1Zpc3VhbFxuICAgICMjIypcbiAgICAqIENhbGxlZCBpZiB0aGlzIG9iamVjdCBpbnN0YW5jZSBpcyByZXN0b3JlZCBmcm9tIGEgZGF0YS1idW5kbGUuIEl0IGNhbiBiZSB1c2VkXG4gICAgKiByZS1hc3NpZ24gZXZlbnQtaGFuZGxlciwgYW5vbnltb3VzIGZ1bmN0aW9ucywgZXRjLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb25EYXRhQnVuZGxlUmVzdG9yZS5cbiAgICAqIEBwYXJhbSBPYmplY3QgZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZVxuICAgICogQHBhcmFtIGdzLk9iamVjdENvZGVjQ29udGV4dCBjb250ZXh0IC0gVGhlIGNvZGVjLWNvbnRleHQuXG4gICAgIyMjXG4gICAgb25EYXRhQnVuZGxlUmVzdG9yZTogKGRhdGEsIGNvbnRleHQpIC0+XG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuICAgICAgICBAb2JqZWN0LmFkZE9iamVjdChAZ3JvdW5kKVxuXG4gICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoQG9iamVjdC5pbWFnZXNbMF0pKVxuICAgICAgICBncm91bmQgPSBuZXcgZ3MuQml0bWFwKGJpdG1hcC53aWR0aCwgYml0bWFwLmhlaWdodClcbiAgICAgICAgZ3JvdW5kLmJsdCgwLCAwLCBiaXRtYXAsIG5ldyBSZWN0KDAsIDAsIGJpdG1hcC53aWR0aCwgYml0bWFwLmhlaWdodCkpXG4gICAgICAgIEBncm91bmQuYml0bWFwID0gZ3JvdW5kXG5cbiAgICAgICAgQHNldHVwSG90c3BvdHMoQGhvdHNwb3RzKVxuXG4gICAgIyMjKlxuICAgICogQSBjb21wb25lbnQgd2hpY2ggdHVybnMgYSBnYW1lIG9iamVjdCBpbnRvIGFuIGludGVyYWN0aXZlIGltYWdlLW1hcC5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0ltYWdlTWFwXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRfVmlzdWFsXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdyb3VuZC9iYXNlIGltYWdlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBncm91bmRcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfUGljdHVyZVxuICAgICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgICAgIyMjXG4gICAgICAgIEBncm91bmQgPSBudWxsXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIGFycmF5IG9mIGRpZmZlcmVudCBob3RzcG90cy5cbiAgICAgICAgKiBAcHJvcGVydHkgaG90c3BvdHNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfUGljdHVyZVtdXG4gICAgICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAgICAjIyNcbiAgICAgICAgQGhvdHNwb3RzID0gbnVsbFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgdmFyaWFibGUgY29udGV4dCB1c2VkIGlmIGEgaG90c3BvdCBuZWVkcyB0byBkZWFsIHdpdGggbG9jYWwgdmFyaWFibGVzLlxuICAgICAgICAqIEBwcm9wZXJ0eSB2YXJpYWJsZUNvbnRleHRcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICAgICMjI1xuICAgICAgICBAdmFyaWFibGVDb250ZXh0ID0gbnVsbFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIGltYWdlLW1hcCBpcyBhY3RpdmUuIEFuIGluLWFjdGl2ZSBpbWFnZS1tYXAgZG9lc24ndCByZXNwb25kXG4gICAgICAgICogdG8gYW55IGlucHV0LWV2ZW50LiBIb3ZlciBlZmZlY3RzIGFyZSBzdGlsbCB3b3JraW5nLlxuICAgICAgICAqIEBwcm9wZXJ0eSBhY3RpdmVcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQGRlZmF1bHQgeWVzXG4gICAgICAgICMjI1xuICAgICAgICBAYWN0aXZlID0geWVzXG5cbiAgICAjIyMqXG4gICAgKiBBZGRzIGV2ZW50LWhhbmRsZXIgZm9yIG1vdXNlL3RvdWNoIGV2ZW50cyB0byB1cGRhdGUgdGhlIGNvbXBvbmVudCBvbmx5IGlmXG4gICAgKiBhIHVzZXItYWN0aW9uIGhhcHBlbmVkLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBFdmVudEhhbmRsZXJzXG4gICAgIyMjXG4gICAgc2V0dXBFdmVudEhhbmRsZXJzOiAtPlxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlVXBcIiwgQG9iamVjdClcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwibW91c2VVcFwiLCAoKGUpID0+XG4gICAgICAgICAgICByZXR1cm4gaWYgIUBvYmplY3QuY2FuUmVjZWl2ZUlucHV0KClcbiAgICAgICAgICAgIGNvbnRhaW5zID0gUmVjdC5jb250YWlucyhAb2JqZWN0LmRzdFJlY3QueCwgQG9iamVjdC5kc3RSZWN0LnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5kc3RSZWN0LndpZHRoLCBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgIElucHV0Lk1vdXNlLnggLSBAb2JqZWN0Lm9yaWdpbi54LCBJbnB1dC5Nb3VzZS55IC0gQG9iamVjdC5vcmlnaW4ueSlcblxuICAgICAgICAgICAgaWYgY29udGFpbnMgYW5kIEBhY3RpdmVcbiAgICAgICAgICAgICAgICBmb3IgaG90c3BvdCBpbiBAaG90c3BvdHNcbiAgICAgICAgICAgICAgICAgICAgaWYgQGNoZWNrSG90c3BvdEFjdGlvbihob3RzcG90KVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5icmVha0NoYWluID0geWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBob3RzcG90LmRhdGEuYmluZFRvU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG90c3BvdC5zZWxlY3RlZCA9ICFob3RzcG90LnNlbGVjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBAZXhlY3V0ZUhvdHNwb3RBY3Rpb24oaG90c3BvdClcblxuICAgICAgICApLCBudWxsLCBAb2JqZWN0XG5cblxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSBpbWFnZS1tYXAuIENyZWF0ZXMgdGhlIGJhY2tncm91bmQgYW5kIGhvdHNwb3RzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBcbiAgICAjIyNcbiAgICBzZXR1cDogLT5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG5cbiAgICAgICAgaWYgQG9iamVjdC5pbWFnZXNbMF1cbiAgICAgICAgICAgIGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoUmVzb3VyY2VNYW5hZ2VyLmdldFBhdGgoQG9iamVjdC5pbWFnZXNbMF0pKVxuICAgICAgICAgICAgaWYgYml0bWFwLmxvYWRlZFxuICAgICAgICAgICAgICAgIGJpdG1hcC5tYWtlTXV0YWJsZSgpXG4gICAgICAgICAgICAgICAgZ3JvdW5kID0gbmV3IGdzLkJpdG1hcChiaXRtYXAud2lkdGgsIGJpdG1hcC5oZWlnaHQpXG4gICAgICAgICAgICAgICAgZ3JvdW5kLmJsdCgwLCAwLCBiaXRtYXAsIG5ldyBSZWN0KDAsIDAsIGJpdG1hcC53aWR0aCwgYml0bWFwLmhlaWdodCkpXG5cbiAgICAgICAgQGdyb3VuZCA9IG5ldyBncy5PYmplY3RfUGljdHVyZSgpXG4gICAgICAgIEBncm91bmQuYml0bWFwID0gZ3JvdW5kXG4gICAgICAgIEBncm91bmQuaW1hZ2UgPSBudWxsXG4gICAgICAgIEBncm91bmQuekluZGV4ID0gQG9iamVjdC56SW5kZXhcbiAgICAgICAgQGdyb3VuZC5pbWFnZUhhbmRsaW5nID0gZ3MuSW1hZ2VIYW5kbGluZy5DVVNUT01fU0laRVxuICAgICAgICBAb2JqZWN0LmFkZE9iamVjdChAZ3JvdW5kKVxuXG4gICAgICAgIEBzZXR1cEhvdHNwb3RzKClcblxuICAgICAgICBpZiBncm91bmQ/XG4gICAgICAgICAgICBAZ3JvdW5kLnNyY1JlY3Quc2V0KDAsIDAsIGdyb3VuZC53aWR0aCwgZ3JvdW5kLmhlaWdodClcbiAgICAgICAgICAgIEBncm91bmQuZHN0UmVjdC53aWR0aCA9IGdyb3VuZC53aWR0aFxuICAgICAgICAgICAgQGdyb3VuZC5kc3RSZWN0LmhlaWdodCA9IGdyb3VuZC5oZWlnaHRcbiAgICAgICAgQGdyb3VuZC51cGRhdGUoKVxuXG4gICAgICAgIEBvYmplY3QuZHN0UmVjdC53aWR0aCA9IEBncm91bmQuZHN0UmVjdC53aWR0aFxuICAgICAgICBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gQGdyb3VuZC5kc3RSZWN0LmhlaWdodFxuXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCB0aGUgaG90c3BvdHMgb24gdGhlIGltYWdlLW1hcC4gRWFjaCBob3RzcG90IGlzIGEgZ3MuT2JqZWN0X0ltYWdlTWFwSG90c3BvdFxuICAgICogb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBIb3RzcG90c1xuICAgICMjI1xuICAgIHNldHVwSG90c3BvdHM6IChob3RzcG90cykgLT5cbiAgICAgICAgQGhvdHNwb3RzID0gQG9iamVjdC5ob3RzcG90cy5zZWxlY3QgKHYsIGkpID0+XG4gICAgICAgICAgICBAZ3JvdW5kLmJpdG1hcD8uY2xlYXJSZWN0KHYueCwgdi55LCB2LnNpemUud2lkdGgsIHYuc2l6ZS5oZWlnaHQpXG4gICAgICAgICAgICBwaWN0dXJlID0gbmV3IGdzLk9iamVjdF9JbWFnZU1hcEhvdHNwb3QoKVxuICAgICAgICAgICAgcGljdHVyZS5maXhlZFNpemUgPSB0cnVlXG4gICAgICAgICAgICBwaWN0dXJlLnNyY1JlY3QgPSBuZXcgUmVjdCh2LngsIHYueSwgdi5zaXplLndpZHRoLCB2LnNpemUuaGVpZ2h0KVxuICAgICAgICAgICAgcGljdHVyZS5kc3RSZWN0ID0gbmV3IFJlY3Qodi54LCB2LnksIHYuc2l6ZS53aWR0aCwgdi5zaXplLmhlaWdodClcbiAgICAgICAgICAgIHBpY3R1cmUuaW1hZ2VIYW5kbGluZyA9IGdzLkltYWdlSGFuZGxpbmcuQ1VTVE9NX1NJWkVcbiAgICAgICAgICAgIHBpY3R1cmUuekluZGV4ID0gQG9iamVjdC56SW5kZXggKyAxXG4gICAgICAgICAgICBwaWN0dXJlLnNlbGVjdGVkID0gaG90c3BvdHM/W2ldPy5zZWxlY3RlZCA/IG5vXG4gICAgICAgICAgICBwaWN0dXJlLmhvdmVyZWQgPSBub1xuICAgICAgICAgICAgcGljdHVyZS5lbmFibGVkID0gaG90c3BvdHM/W2ldPy5lbmFibGVkID8geWVzXG4gICAgICAgICAgICBwaWN0dXJlLmFjdGlvbnMgPSB2LmRhdGEuYWN0aW9uc1xuICAgICAgICAgICAgcGljdHVyZS5kYXRhID0gdi5kYXRhXG4gICAgICAgICAgICBwaWN0dXJlLmNvbW1vbkV2ZW50SWQgPSB2LmNvbW1vbkV2ZW50SWRcbiAgICAgICAgICAgIHBpY3R1cmUuYW5jaG9yLnNldCgwLjUsIDAuNSlcbiAgICAgICAgICAgIEBvYmplY3QuYWRkT2JqZWN0KHBpY3R1cmUpXG5cbiAgICAgICAgICAgIHJldHVybiBwaWN0dXJlXG5cbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgaW1hZ2UtbWFwLiBGcmVlcyBncm91bmQgaW1hZ2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBkaXNwb3NlXG4gICAgIyMjXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJtb3VzZVVwXCIsIEBvYmplY3QpXG4gICAgICAgIEBncm91bmQuYml0bWFwPy5kaXNwb3NlKClcblxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIGEgaG90c3BvdCdzIGFzc29jaWF0ZWQgYWN0aW9uLiBEZXBlbmRpbmcgb24gdGhlIGNvbmZpZ3VyYXRpb24gYSBob3RzcG90XG4gICAgKiBjYW4gdHJpZ2dlciBhIGNvbW1vbi1ldmVudCBvciB0dXJuIG9uIGEgc3dpdGNoIGZvciBleGFtcGxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgZXhlY3V0ZUhvdHNwb3RBY3Rpb25cbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X1BpY3R1cmV9IGhvdHNwb3QgLSBUaGUgaG90c3BvdCB3aGVyZSB0aGUgaW1hZ2Ugc2hvdWxkIGJlIHVwZGF0ZWQuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgZXhlY3V0ZUhvdHNwb3RBY3Rpb246IChob3RzcG90KSAtPlxuICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAdmFyaWFibGVDb250ZXh0KVxuICAgICAgICBpZiBob3RzcG90LmRhdGEuYmluZFRvU3dpdGNoXG4gICAgICAgICAgICBkb21haW4gPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmRvbWFpblxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXRCb29sZWFuVmFsdWVUbyhob3RzcG90LmRhdGEuc3dpdGNoLCBob3RzcG90LnNlbGVjdGVkKVxuICAgICAgICBpZiBob3RzcG90LmRhdGEuYmluZFZhbHVlVG9cbiAgICAgICAgICAgIGRvbWFpbiA9IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuZG9tYWluXG4gICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldE51bWJlclZhbHVlVG8oaG90c3BvdC5kYXRhLmJpbmRWYWx1ZVZhcmlhYmxlLCBob3RzcG90LmRhdGEuYmluZFZhbHVlKVxuXG4gICAgICAgIEF1ZGlvTWFuYWdlci5wbGF5U291bmQoaG90c3BvdC5kYXRhLm9uQ2xpY2tTb3VuZClcbiAgICAgICAgc3dpdGNoIGhvdHNwb3QuZGF0YS5hY3Rpb25cbiAgICAgICAgICAgIHdoZW4gMSAjIEp1bXAgVG9cbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImp1bXBUb1wiLCBAb2JqZWN0LCB7IGxhYmVsOiBob3RzcG90LmRhdGEubGFiZWwgfSlcbiAgICAgICAgICAgIHdoZW4gMiAjIENhbGwgQ29tbW9uIEV2ZW50XG4gICAgICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJjYWxsQ29tbW9uRXZlbnRcIiwgQG9iamVjdCwgeyBjb21tb25FdmVudElkOiBob3RzcG90LmRhdGEuY29tbW9uRXZlbnRJZCwgZmluaXNoOiBob3RzcG90LmRhdGEuZmluaXNoIH0pXG4gICAgICAgICAgICB3aGVuIDMgIyBVSSBBY3Rpb25cbiAgICAgICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcImFjdGlvblwiLCBAb2JqZWN0LCB7IGFjdGlvbnM6IGhvdHNwb3QuZGF0YS5hY3Rpb25zIH0pXG5cbiAgICAgICAgaWYgaG90c3BvdC5kYXRhLmZpbmlzaFxuICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJmaW5pc2hcIiwgQG9iamVjdClcblxuXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGlmIGEgaG90c3BvdCdzIGFzc29jaWF0ZWQgYWN0aW9uIG5lZWRzIHRvIGJlIGV4ZWN1dGVkLiBEZXBlbmRpbmcgb24gdGhlIGNvbmZpZ3VyYXRpb24gYSBob3RzcG90XG4gICAgKiBjYW4gdHJpZ2dlciBhIGNvbW1vbi1ldmVudCBvciB0dXJuIG9uIGEgc3dpdGNoIGZvciBleGFtcGxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlSG90c3BvdEFjdGlvblxuICAgICogQHBhcmFtIHtncy5PYmplY3RfUGljdHVyZX0gaG90c3BvdCAtIFRoZSBob3RzcG90IHdoZXJlIHRoZSBpbWFnZSBzaG91bGQgYmUgdXBkYXRlZC5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IElmIDxiPnRydWU8L2I+IHRoZSBob3RzcG90J3MgYWN0aW9uIG5lZWRzIHRvIGJlIGV4ZWN1dGVkLiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+LlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIGNoZWNrSG90c3BvdEFjdGlvbjogKGhvdHNwb3QpIC0+XG4gICAgICAgIHJlc3VsdCA9IG5vXG4gICAgICAgIGhvdmVyZWQgPSBob3RzcG90LmRzdFJlY3QuY29udGFpbnMoSW5wdXQuTW91c2UueCAtIGhvdHNwb3Qub3JpZ2luLngsIElucHV0Lk1vdXNlLnkgLSBob3RzcG90Lm9yaWdpbi55KVxuXG4gICAgICAgIGlmIGhvdmVyZWQgYW5kIGhvdHNwb3QuZW5hYmxlZCBhbmQgSW5wdXQuTW91c2UuYnV0dG9uc1tJbnB1dC5Nb3VzZS5MRUZUXSA9PSAyXG4gICAgICAgICAgICByZXN1bHQgPSB5ZXNcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIGEgaG90c3BvdCdzIGltYWdlLiBEZXBlbmRpbmcgb24gdGhlIHN0YXRlIHRoZSBpbWFnZSBvZiBhIGhvdHNwb3QgY2FuXG4gICAgKiBjaGFuZ2UgZm9yIGV4YW1wbGUgaWYgdGhlIG1vdXNlIGhvdmVycyBvdmVyIGEgaG90c3BvdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUhvdHNwb3RJbWFnZVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfUGljdHVyZX0gaG90c3BvdCAtIFRoZSBob3RzcG90IHdoZXJlIHRoZSBpbWFnZSBzaG91bGQgYmUgdXBkYXRlZC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaG92ZXJlZCAtIEluZGljYXRlcyBpZiB0aGUgaG90c3BvdCBpcyBob3ZlcmVkIGJ5IG1vdXNlL3RvdWNoIGN1cnNvci5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICB1cGRhdGVIb3RzcG90SW1hZ2U6IChob3RzcG90LCBob3ZlcmVkKSAtPlxuICAgICAgICBiYXNlSW1hZ2UgPSBpZiBob3RzcG90LmVuYWJsZWQgdGhlbiBAb2JqZWN0LmltYWdlc1syXSB8fCBAb2JqZWN0LmltYWdlc1swXSBlbHNlIEBvYmplY3QuaW1hZ2VzWzBdXG4gICAgICAgIGlmIGhvdmVyZWQgYW5kIGhvdHNwb3QuZW5hYmxlZFxuICAgICAgICAgICAgaWYgaG90c3BvdC5zZWxlY3RlZFxuICAgICAgICAgICAgICAgIGhvdHNwb3QuaW1hZ2VGb2xkZXIgPSAgQG9iamVjdC5pbWFnZXNbNF0/LmZvbGRlclBhdGggfHwgQG9iamVjdC5pbWFnZXNbMV0/LmZvbGRlclBhdGggfHwgYmFzZUltYWdlPy5mb2xkZXJQYXRoXG4gICAgICAgICAgICAgICAgaG90c3BvdC5pbWFnZSA9IEBvYmplY3QuaW1hZ2VzWzRdPy5uYW1lIHx8IEBvYmplY3QuaW1hZ2VzWzFdPy5uYW1lIHx8IGJhc2VJbWFnZT8ubmFtZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGhvdHNwb3QuaW1hZ2VGb2xkZXIgPSAgQG9iamVjdC5pbWFnZXNbMV0/LmZvbGRlclBhdGggfHwgYmFzZUltYWdlPy5mb2xkZXJQYXRoXG4gICAgICAgICAgICAgICAgaG90c3BvdC5pbWFnZSA9IEBvYmplY3QuaW1hZ2VzWzFdPy5uYW1lIHx8IGJhc2VJbWFnZT8ubmFtZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBob3RzcG90LnNlbGVjdGVkXG4gICAgICAgICAgICAgICAgaG90c3BvdC5pbWFnZUZvbGRlciA9ICBAb2JqZWN0LmltYWdlc1szXT8uZm9sZGVyUGF0aCB8fCBiYXNlSW1hZ2U/LmZvbGRlclBhdGhcbiAgICAgICAgICAgICAgICBob3RzcG90LmltYWdlID0gQG9iamVjdC5pbWFnZXNbM10/Lm5hbWUgfHwgYmFzZUltYWdlPy5uYW1lXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaG90c3BvdC5pbWFnZUZvbGRlciA9IGJhc2VJbWFnZT8uZm9sZGVyUGF0aFxuICAgICAgICAgICAgICAgIGhvdHNwb3QuaW1hZ2UgPSBiYXNlSW1hZ2U/Lm5hbWVcblxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyBhIGhvdHNwb3QuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVIb3RzcG90XG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9QaWN0dXJlfSBob3RzcG90IC0gVGhlIGhvdHNwb3QgdG8gdXBkYXRlLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIHVwZGF0ZUhvdHNwb3Q6IChob3RzcG90KSAtPlxuICAgICAgICBob3RzcG90LnZpc2libGUgPSBAb2JqZWN0LnZpc2libGVcbiAgICAgICAgaG90c3BvdC5vcGFjaXR5ID0gQG9iamVjdC5vcGFjaXR5XG4gICAgICAgIGhvdHNwb3QudG9uZS5zZXRGcm9tT2JqZWN0KEBvYmplY3QudG9uZSlcbiAgICAgICAgaG90c3BvdC5jb2xvci5zZXRGcm9tT2JqZWN0KEBvYmplY3QuY29sb3IpXG4gICAgICAgIGlmIGhvdHNwb3QuZGF0YS5iaW5kRW5hYmxlZFN0YXRlXG4gICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAdmFyaWFibGVDb250ZXh0KVxuICAgICAgICAgICAgaG90c3BvdC5lbmFibGVkID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5ib29sZWFuVmFsdWVPZihob3RzcG90LmRhdGEuZW5hYmxlZFN3aXRjaClcbiAgICAgICAgaWYgaG90c3BvdC5kYXRhLmJpbmRUb1N3aXRjaFxuICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cFRlbXBWYXJpYWJsZXMoQHZhcmlhYmxlQ29udGV4dClcbiAgICAgICAgICAgIGhvdHNwb3Quc2VsZWN0ZWQgPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmJvb2xlYW5WYWx1ZU9mKGhvdHNwb3QuZGF0YS5zd2l0Y2gpXG4gICAgICAgIGhvdmVyZWQgPSBob3RzcG90LmRzdFJlY3QuY29udGFpbnMoSW5wdXQuTW91c2UueCAtIGhvdHNwb3Qub3JpZ2luLngsIElucHV0Lk1vdXNlLnkgLSBob3RzcG90Lm9yaWdpbi55KVxuICAgICAgICBpZiBob3ZlcmVkICE9IGhvdHNwb3QuaG92ZXJlZFxuICAgICAgICAgICAgaG90c3BvdC5ob3ZlcmVkID0gaG92ZXJlZFxuICAgICAgICAgICAgQXVkaW9NYW5hZ2VyLnBsYXlTb3VuZChob3RzcG90LmRhdGEub25Ib3ZlclNvdW5kKSBpZiBob3ZlcmVkXG4gICAgICAgIEB1cGRhdGVIb3RzcG90SW1hZ2UoaG90c3BvdCwgaG92ZXJlZClcbiAgICAgICAgaG90c3BvdC51cGRhdGUoKVxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgZ3JvdW5kLWltYWdlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlR3JvdW5kXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgdXBkYXRlR3JvdW5kOiAtPlxuICAgICAgICBAZ3JvdW5kLnZpc2libGUgPSBAb2JqZWN0LnZpc2libGVcbiAgICAgICAgQGdyb3VuZC5vcGFjaXR5ID0gQG9iamVjdC5vcGFjaXR5XG4gICAgICAgIEBncm91bmQuYW5jaG9yLnggPSAwLjVcbiAgICAgICAgQGdyb3VuZC5hbmNob3IueSA9IDAuNVxuICAgICAgICBAZ3JvdW5kLnRvbmUuc2V0RnJvbU9iamVjdChAb2JqZWN0LnRvbmUpXG4gICAgICAgIEBncm91bmQuY29sb3Iuc2V0RnJvbU9iamVjdChAb2JqZWN0LmNvbG9yKVxuICAgICAgICBAZ3JvdW5kLnVwZGF0ZSgpXG5cbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBpbWFnZS1tYXAncyBncm91bmQgYW5kIGFsbCBob3RzcG90cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIEBvYmplY3QuckluZGV4ID0gQGdyb3VuZC5ySW5kZXhcbiAgICAgICAgQHVwZGF0ZUdyb3VuZCgpXG5cbiAgICAgICAgZm9yIGhvdHNwb3QgaW4gQGhvdHNwb3RzXG4gICAgICAgICAgICBAdXBkYXRlSG90c3BvdChob3RzcG90KVxuXG4gICAgICAgIHJldHVybiBudWxsXG5cbmdzLkNvbXBvbmVudF9JbWFnZU1hcCA9IENvbXBvbmVudF9JbWFnZU1hcCJdfQ==
//# sourceURL=Component_ImageMap_117.js