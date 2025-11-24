var Component_Live2D,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_Live2D = (function(superClass) {
  extend(Component_Live2D, superClass);


  /**
  * A Live2D component which allows a game-object to become a animated
  * Live2D character.
  *
  * @module vn
  * @class Component_Live2D
  * @extends gs.Component
  * @memberof vn
  * @constructor
   */

  function Component_Live2D() {
    Component_Live2D.__super__.constructor.apply(this, arguments);

    /**
    * The Live2D graphics object.
    * @property l2dObject
    * @type gs.Live2DObject
    * @readOnly
     */
    this.l2dObject = null;

    /**
    * The character's Live2D motion. Set name-property to an empty string
    * to disable motion and use a generated default idle-motion.
    * @property motion
    * @type gs.Live2DMotion
    * @default { name: "", loop: yes }
     */
    this.motion = {
      name: "",
      loop: true

      /**
      * The character's Live2D motion-group. Can be null
      * @property motionGroup
      * @type gs.Live2DMotionGroup
      * @default null
       */
    };
    this.motionGroup = null;

    /**
    * The character's Live2D expression. Set name-property to an empty string
    * to use default expression.
    * @property expression
    * @type gs.Live2DExpression
    * @default { name: "" }
     */
    this.expression = {
      name: ""

      /**
      * @property talkingDuration
      * @type number
      * @protected
       */
    };
    this.talkingDuration = 1;

    /**
    * @property talkingStep
    * @type number
    * @protected
     */
    this.talkingStep = 0;

    /**
    * @property talkingStep
    * @type number[]
    * @protected
     */
    this.talkingSteps = [0, 0.5, 1];
  }


  /**
  * Disposes the component and Live2D object.
  *
  * @method dispose
   */

  Component_Live2D.prototype.dispose = function() {
    Component_Live2D.__super__.dispose.apply(this, arguments);
    return this.l2dObject.dispose();
  };


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_Live2D.prototype.onDataBundleRestore = function(data, context) {
    this.expression = {
      name: ""
    };
    this.motion = {
      name: "",
      loop: true
    };
    this.motionGroup = null;
    this.updateMotion();
    this.updateExpression();
    return this.updateMotionGroup();
  };


  /**
  * Setup the Live2D component. This method is automatically called by the
  * system.
  * @method setup
   */

  Component_Live2D.prototype.setup = function() {
    return this.l2dObject = gs.Live2DObject.create(this.object.model);
  };


  /**
  * Updates the character's Live2D motion.
  *
  * @method updateMotion
   */

  Component_Live2D.prototype.updateMotion = function() {
    if (this.motion !== this.object.motion) {
      this.motion = this.object.motion;
      if (this.motion.name) {
        this.l2dObject.loopMotion = this.motion.loop;
        return this.l2dObject.playMotion(this.motion.name, this.motion.fadeInTime);
      }
    }
  };


  /**
  * Updates the character's Live2D motion-group.
  *
  * @method updateMotionGroup
   */

  Component_Live2D.prototype.updateMotionGroup = function() {
    var ref;
    if (this.motionGroup !== this.object.motionGroup) {
      this.motionGroup = this.object.motionGroup;
      if ((ref = this.motionGroup) != null ? ref.name : void 0) {
        this.l2dObject.loopMotion = this.motionGroup.loop;
        return this.l2dObject.playMotionGroup(this.motionGroup.name, this.motionGroup.playType);
      }
    }
  };


  /**
  * Updates the character's Live2D expression.
  *
  * @method updateExpression
   */

  Component_Live2D.prototype.updateExpression = function() {
    if (this.expression.name !== this.object.expression.name) {
      this.expression = this.object.expression;
      return this.l2dObject.setExpression(this.expression.name, this.expression.fadeInTime);
    }
  };


  /**
  * Updates the Live2D object properties from the game object properties.
  *
  * @method updateProperties
   */

  Component_Live2D.prototype.updateProperties = function() {
    if (this.l2dObject == null) {
      this.l2dObject = gs.Live2DObject.create(this.object.model);
    }
    this.l2dObject.model = this.object.model;
    this.object.dstRect.width = this.l2dObject.width;
    this.object.dstRect.height = this.l2dObject.height;
    this.l2dObject.x = this.object.dstRect.x + this.object.offset.x;
    this.l2dObject.y = this.object.dstRect.y + this.object.offset.y;
    this.l2dObject.z = this.object.zIndex;
    this.l2dObject.visible = this.object.visible;
    this.l2dObject.opacity = this.object.opacity;
    this.l2dObject.blendingMode = this.object.blendMode || 0;
    this.l2dObject.zoomX = this.object.zoom.x;
    this.l2dObject.zoomY = this.object.zoom.y;
    this.l2dObject.anchor.x = this.object.anchor.x;
    this.l2dObject.anchor.y = this.object.anchor.y;
    this.l2dObject.angle = this.object.angle;
    this.l2dObject.tone = this.object.tone;
    return this.l2dObject.color = this.object.color;
  };


  /**
  * Updates the optional Live2D object properties from the game object properties.
  *
  * @method updateOptionalProperties
   */

  Component_Live2D.prototype.updateOptionalProperties = function() {
    if (this.object.viewport != null) {
      this.l2dObject.viewport = this.object.viewport;
    }
    if (this.object.effects != null) {
      return this.l2dObject.effects = this.object.effects;
    }
  };


  /**
  * Updates the Live2D object and its talking-animation.
  *
  * @method update
   */

  Component_Live2D.prototype.update = function() {
    if ((this.object.model != null) && !this.object.model.initialized) {
      this.object.model.initialize();
    }
    this.updateProperties();
    this.updateMotion();
    this.updateMotionGroup();
    this.updateExpression();
    this.updateOptionalProperties();
    return this.updateTalking();
  };


  /**
  * Updates the Live2D character's talking-animation.
  *
  * @method update
   */

  Component_Live2D.prototype.updateTalking = function() {
    var step;
    step = 0;
    if (this.object.talking) {
      this.l2dObject.talking = true;
      if (AudioManager.voice != null) {
        return this.l2dObject.talkingVolume = (AudioManager.voice.averageVolume || 0) / 100;
      } else {
        this.talkingDuration--;
        if (this.talkingDuration <= 0) {
          while (this.talkingStep === step) {
            step = Math.round(Math.random() * 2);
          }
          this.talkingDuration = 5;
          this.talkingStep = step;
          return this.l2dObject.talkingVolume = this.talkingSteps[step];
        }
      }
    } else {
      return this.l2dObject.talking = false;
    }
  };

  return Component_Live2D;

})(gs.Component);

vn.Component_Live2D = Component_Live2D;

gs.Component_Live2D = Component_Live2D;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsZ0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7RUFVYSwwQkFBQTtJQUNULG1EQUFBLFNBQUE7O0FBRUE7Ozs7OztJQU1BLElBQUMsQ0FBQSxTQUFELEdBQWE7O0FBRWI7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsTUFBRCxHQUFVO01BQUEsSUFBQSxFQUFNLEVBQU47TUFBVSxJQUFBLEVBQU07O0FBRTFCOzs7OztTQUZVOztJQVFWLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBRWY7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsVUFBRCxHQUFjO01BQUEsSUFBQSxFQUFNOztBQUVwQjs7OztTQUZjOztJQU9kLElBQUMsQ0FBQSxlQUFELEdBQW1COztBQUVuQjs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxDQUFUO0VBeERQOzs7QUEwRGI7Ozs7Ozs2QkFLQSxPQUFBLEdBQVMsU0FBQTtJQUNMLCtDQUFBLFNBQUE7V0FFQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBQTtFQUhLOzs7QUFLVDs7Ozs7Ozs7OzZCQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7SUFDakIsSUFBQyxDQUFBLFVBQUQsR0FBYztNQUFBLElBQUEsRUFBTSxFQUFOOztJQUNkLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFBQSxJQUFBLEVBQU0sRUFBTjtNQUFVLElBQUEsRUFBTSxJQUFoQjs7SUFDVixJQUFDLENBQUEsV0FBRCxHQUFlO0lBRWYsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFBO1dBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7RUFQaUI7OztBQVNyQjs7Ozs7OzZCQUtBLEtBQUEsR0FBTyxTQUFB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QUFELENBQUE7SUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBO1dBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBQTtFQVRJOzs7QUFXUjs7Ozs7OzZCQUtBLGFBQUEsR0FBZSxTQUFBO0FBQ1gsUUFBQTtJQUFBLElBQUEsR0FBTztJQUNQLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFYO01BQ0ksSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLEdBQXFCO01BQ3JCLElBQUcsMEJBQUg7ZUFDSSxJQUFDLENBQUEsU0FBUyxDQUFDLGFBQVgsR0FBMkIsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLGFBQW5CLElBQW9DLENBQXJDLENBQUEsR0FBMEMsSUFEekU7T0FBQSxNQUFBO1FBR0ksSUFBQyxDQUFBLGVBQUQ7UUFDQSxJQUFHLElBQUMsQ0FBQSxlQUFELElBQW9CLENBQXZCO0FBQ0ksaUJBQU0sSUFBQyxDQUFBLFdBQUQsS0FBZ0IsSUFBdEI7WUFDSSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsQ0FBM0I7VUFEWDtVQUVBLElBQUMsQ0FBQSxlQUFELEdBQW1CO1VBQ25CLElBQUMsQ0FBQSxXQUFELEdBQWU7aUJBQ2YsSUFBQyxDQUFBLFNBQVMsQ0FBQyxhQUFYLEdBQTJCLElBQUMsQ0FBQSxZQUFhLENBQUEsSUFBQSxFQUw3QztTQUpKO09BRko7S0FBQSxNQUFBO2FBYUksSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLEdBQXFCLE1BYnpCOztFQUZXOzs7O0dBcE1ZLEVBQUUsQ0FBQzs7QUFxTmxDLEVBQUUsQ0FBQyxnQkFBSCxHQUFzQjs7QUFDdEIsRUFBRSxDQUFDLGdCQUFILEdBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfTGl2ZTJEXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfTGl2ZTJEIGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgIyMjKlxuICAgICogQSBMaXZlMkQgY29tcG9uZW50IHdoaWNoIGFsbG93cyBhIGdhbWUtb2JqZWN0IHRvIGJlY29tZSBhIGFuaW1hdGVkXG4gICAgKiBMaXZlMkQgY2hhcmFjdGVyLlxuICAgICpcbiAgICAqIEBtb2R1bGUgdm5cbiAgICAqIEBjbGFzcyBDb21wb25lbnRfTGl2ZTJEXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAqIEBtZW1iZXJvZiB2blxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIExpdmUyRCBncmFwaGljcyBvYmplY3QuXG4gICAgICAgICogQHByb3BlcnR5IGwyZE9iamVjdFxuICAgICAgICAqIEB0eXBlIGdzLkxpdmUyRE9iamVjdFxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQGwyZE9iamVjdCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY2hhcmFjdGVyJ3MgTGl2ZTJEIG1vdGlvbi4gU2V0IG5hbWUtcHJvcGVydHkgdG8gYW4gZW1wdHkgc3RyaW5nXG4gICAgICAgICogdG8gZGlzYWJsZSBtb3Rpb24gYW5kIHVzZSBhIGdlbmVyYXRlZCBkZWZhdWx0IGlkbGUtbW90aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSBtb3Rpb25cbiAgICAgICAgKiBAdHlwZSBncy5MaXZlMkRNb3Rpb25cbiAgICAgICAgKiBAZGVmYXVsdCB7IG5hbWU6IFwiXCIsIGxvb3A6IHllcyB9XG4gICAgICAgICMjI1xuICAgICAgICBAbW90aW9uID0gbmFtZTogXCJcIiwgbG9vcDogeWVzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGNoYXJhY3RlcidzIExpdmUyRCBtb3Rpb24tZ3JvdXAuIENhbiBiZSBudWxsXG4gICAgICAgICogQHByb3BlcnR5IG1vdGlvbkdyb3VwXG4gICAgICAgICogQHR5cGUgZ3MuTGl2ZTJETW90aW9uR3JvdXBcbiAgICAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICAgICMjI1xuICAgICAgICBAbW90aW9uR3JvdXAgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGNoYXJhY3RlcidzIExpdmUyRCBleHByZXNzaW9uLiBTZXQgbmFtZS1wcm9wZXJ0eSB0byBhbiBlbXB0eSBzdHJpbmdcbiAgICAgICAgKiB0byB1c2UgZGVmYXVsdCBleHByZXNzaW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSBleHByZXNzaW9uXG4gICAgICAgICogQHR5cGUgZ3MuTGl2ZTJERXhwcmVzc2lvblxuICAgICAgICAqIEBkZWZhdWx0IHsgbmFtZTogXCJcIiB9XG4gICAgICAgICMjI1xuICAgICAgICBAZXhwcmVzc2lvbiA9IG5hbWU6IFwiXCJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgdGFsa2luZ0R1cmF0aW9uXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHRhbGtpbmdEdXJhdGlvbiA9IDFcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgdGFsa2luZ1N0ZXBcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAdGFsa2luZ1N0ZXAgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IHRhbGtpbmdTdGVwXG4gICAgICAgICogQHR5cGUgbnVtYmVyW11cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAdGFsa2luZ1N0ZXBzID0gWzAsIDAuNSwgMV1cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIGNvbXBvbmVudCBhbmQgTGl2ZTJEIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyNcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgQGwyZE9iamVjdC5kaXNwb3NlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKiBcbiAgICAqIEBtZXRob2Qgb25EYXRhQnVuZGxlUmVzdG9yZS5cbiAgICAqIEBwYXJhbSBPYmplY3QgZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZVxuICAgICogQHBhcmFtIGdzLk9iamVjdENvZGVjQ29udGV4dCBjb250ZXh0IC0gVGhlIGNvZGVjLWNvbnRleHQuXG4gICAgIyMjXG4gICAgb25EYXRhQnVuZGxlUmVzdG9yZTogKGRhdGEsIGNvbnRleHQpIC0+XG4gICAgICAgIEBleHByZXNzaW9uID0gbmFtZTogXCJcIlxuICAgICAgICBAbW90aW9uID0gbmFtZTogXCJcIiwgbG9vcDogeWVzXG4gICAgICAgIEBtb3Rpb25Hcm91cCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVNb3Rpb24oKVxuICAgICAgICBAdXBkYXRlRXhwcmVzc2lvbigpXG4gICAgICAgIEB1cGRhdGVNb3Rpb25Hcm91cCgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIFNldHVwIHRoZSBMaXZlMkQgY29tcG9uZW50LiBUaGlzIG1ldGhvZCBpcyBhdXRvbWF0aWNhbGx5IGNhbGxlZCBieSB0aGVcbiAgICAqIHN5c3RlbS5cbiAgICAqIEBtZXRob2Qgc2V0dXBcbiAgICAjIyNcbiAgICBzZXR1cDogLT5cbiAgICAgICAgQGwyZE9iamVjdCA9IGdzLkxpdmUyRE9iamVjdC5jcmVhdGUoQG9iamVjdC5tb2RlbCkgIFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBjaGFyYWN0ZXIncyBMaXZlMkQgbW90aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlTW90aW9uXG4gICAgIyMjICAgICAgICAgIFxuICAgIHVwZGF0ZU1vdGlvbjogLT5cbiAgICAgICAgaWYgQG1vdGlvbiAhPSBAb2JqZWN0Lm1vdGlvblxuICAgICAgICAgICAgQG1vdGlvbiA9IEBvYmplY3QubW90aW9uXG4gICAgICAgICAgICBpZiBAbW90aW9uLm5hbWVcbiAgICAgICAgICAgICAgICBAbDJkT2JqZWN0Lmxvb3BNb3Rpb24gPSBAbW90aW9uLmxvb3BcbiAgICAgICAgICAgICAgICBAbDJkT2JqZWN0LnBsYXlNb3Rpb24oQG1vdGlvbi5uYW1lLCBAbW90aW9uLmZhZGVJblRpbWUpXG4gICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgY2hhcmFjdGVyJ3MgTGl2ZTJEIG1vdGlvbi1ncm91cC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZU1vdGlvbkdyb3VwXG4gICAgIyMjICAgICAgICAgIFxuICAgIHVwZGF0ZU1vdGlvbkdyb3VwOiAtPlxuICAgICAgICBpZiBAbW90aW9uR3JvdXAgIT0gQG9iamVjdC5tb3Rpb25Hcm91cFxuICAgICAgICAgICAgQG1vdGlvbkdyb3VwID0gQG9iamVjdC5tb3Rpb25Hcm91cFxuICAgICAgICAgICAgaWYgQG1vdGlvbkdyb3VwPy5uYW1lXG4gICAgICAgICAgICAgICAgQGwyZE9iamVjdC5sb29wTW90aW9uID0gQG1vdGlvbkdyb3VwLmxvb3BcbiAgICAgICAgICAgICAgICBAbDJkT2JqZWN0LnBsYXlNb3Rpb25Hcm91cChAbW90aW9uR3JvdXAubmFtZSwgQG1vdGlvbkdyb3VwLnBsYXlUeXBlKVxuICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGNoYXJhY3RlcidzIExpdmUyRCBleHByZXNzaW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlRXhwcmVzc2lvblxuICAgICMjIyAgICAgICAgICAgICAgXG4gICAgdXBkYXRlRXhwcmVzc2lvbjogLT5cbiAgICAgICAgaWYgQGV4cHJlc3Npb24ubmFtZSAhPSBAb2JqZWN0LmV4cHJlc3Npb24ubmFtZVxuICAgICAgICAgICAgQGV4cHJlc3Npb24gPSBAb2JqZWN0LmV4cHJlc3Npb25cbiAgICAgICAgICAgIEBsMmRPYmplY3Quc2V0RXhwcmVzc2lvbihAZXhwcmVzc2lvbi5uYW1lLCBAZXhwcmVzc2lvbi5mYWRlSW5UaW1lKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgTGl2ZTJEIG9iamVjdCBwcm9wZXJ0aWVzIGZyb20gdGhlIGdhbWUgb2JqZWN0IHByb3BlcnRpZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVQcm9wZXJ0aWVzXG4gICAgIyMjICAgICAgICBcbiAgICB1cGRhdGVQcm9wZXJ0aWVzOiAtPlxuICAgICAgICB1bmxlc3MgQGwyZE9iamVjdD9cbiAgICAgICAgICAgIEBsMmRPYmplY3QgPSBncy5MaXZlMkRPYmplY3QuY3JlYXRlKEBvYmplY3QubW9kZWwpICAgICAgICAgICAgXG4gICAgICAgIEBsMmRPYmplY3QubW9kZWwgPSBAb2JqZWN0Lm1vZGVsXG4gICAgICAgIEBvYmplY3QuZHN0UmVjdC53aWR0aCA9IEBsMmRPYmplY3Qud2lkdGhcbiAgICAgICAgQG9iamVjdC5kc3RSZWN0LmhlaWdodCA9IEBsMmRPYmplY3QuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBAbDJkT2JqZWN0LnggPSBAb2JqZWN0LmRzdFJlY3QueCArIEBvYmplY3Qub2Zmc2V0LnhcbiAgICAgICAgQGwyZE9iamVjdC55ID0gQG9iamVjdC5kc3RSZWN0LnkgKyBAb2JqZWN0Lm9mZnNldC55XG4gICAgICAgIEBsMmRPYmplY3QueiA9IEBvYmplY3QuekluZGV4XG4gICAgICAgIEBsMmRPYmplY3QudmlzaWJsZSA9IEBvYmplY3QudmlzaWJsZVxuICAgICAgICBAbDJkT2JqZWN0Lm9wYWNpdHkgPSBAb2JqZWN0Lm9wYWNpdHlcbiAgICAgICAgQGwyZE9iamVjdC5ibGVuZGluZ01vZGUgPSBAb2JqZWN0LmJsZW5kTW9kZSB8fCAwXG4gICAgICAgIEBsMmRPYmplY3Quem9vbVggPSBAb2JqZWN0Lnpvb20ueFxuICAgICAgICBAbDJkT2JqZWN0Lnpvb21ZID0gQG9iamVjdC56b29tLnlcbiAgICAgICAgQGwyZE9iamVjdC5hbmNob3IueCA9IEBvYmplY3QuYW5jaG9yLnhcbiAgICAgICAgQGwyZE9iamVjdC5hbmNob3IueSA9IEBvYmplY3QuYW5jaG9yLnlcbiAgICAgICAgQGwyZE9iamVjdC5hbmdsZSA9IEBvYmplY3QuYW5nbGVcbiAgICAgICAgQGwyZE9iamVjdC50b25lID0gQG9iamVjdC50b25lXG4gICAgICAgIEBsMmRPYmplY3QuY29sb3IgPSBAb2JqZWN0LmNvbG9yXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIG9wdGlvbmFsIExpdmUyRCBvYmplY3QgcHJvcGVydGllcyBmcm9tIHRoZSBnYW1lIG9iamVjdCBwcm9wZXJ0aWVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlT3B0aW9uYWxQcm9wZXJ0aWVzXG4gICAgIyMjICAgIFxuICAgIHVwZGF0ZU9wdGlvbmFsUHJvcGVydGllczogLT5cbiAgICAgICAgaWYgQG9iamVjdC52aWV3cG9ydD9cbiAgICAgICAgICAgIEBsMmRPYmplY3Qudmlld3BvcnQgPSBAb2JqZWN0LnZpZXdwb3J0XG4gICAgICAgIGlmIEBvYmplY3QuZWZmZWN0cz9cbiAgICAgICAgICAgIEBsMmRPYmplY3QuZWZmZWN0cyA9IEBvYmplY3QuZWZmZWN0c1xuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgTGl2ZTJEIG9iamVjdCBhbmQgaXRzIHRhbGtpbmctYW5pbWF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjICAgXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBpZiBAb2JqZWN0Lm1vZGVsPyBhbmQgbm90IEBvYmplY3QubW9kZWwuaW5pdGlhbGl6ZWRcbiAgICAgICAgICAgIEBvYmplY3QubW9kZWwuaW5pdGlhbGl6ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgQHVwZGF0ZVByb3BlcnRpZXMoKVxuICAgICAgICBAdXBkYXRlTW90aW9uKClcbiAgICAgICAgQHVwZGF0ZU1vdGlvbkdyb3VwKClcbiAgICAgICAgQHVwZGF0ZUV4cHJlc3Npb24oKVxuICAgICAgICBAdXBkYXRlT3B0aW9uYWxQcm9wZXJ0aWVzKClcbiAgICAgICAgQHVwZGF0ZVRhbGtpbmcoKVxuICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIExpdmUyRCBjaGFyYWN0ZXIncyB0YWxraW5nLWFuaW1hdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjIyAgICAgICBcbiAgICB1cGRhdGVUYWxraW5nOiAtPlxuICAgICAgICBzdGVwID0gMFxuICAgICAgICBpZiBAb2JqZWN0LnRhbGtpbmdcbiAgICAgICAgICAgIEBsMmRPYmplY3QudGFsa2luZyA9IHllc1xuICAgICAgICAgICAgaWYgQXVkaW9NYW5hZ2VyLnZvaWNlP1xuICAgICAgICAgICAgICAgIEBsMmRPYmplY3QudGFsa2luZ1ZvbHVtZSA9IChBdWRpb01hbmFnZXIudm9pY2UuYXZlcmFnZVZvbHVtZSB8fCAwKSAvIDEwMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEB0YWxraW5nRHVyYXRpb24tLVxuICAgICAgICAgICAgICAgIGlmIEB0YWxraW5nRHVyYXRpb24gPD0gMFxuICAgICAgICAgICAgICAgICAgICB3aGlsZSBAdGFsa2luZ1N0ZXAgPT0gc3RlcFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RlcCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDIpXG4gICAgICAgICAgICAgICAgICAgIEB0YWxraW5nRHVyYXRpb24gPSA1XG4gICAgICAgICAgICAgICAgICAgIEB0YWxraW5nU3RlcCA9IHN0ZXBcbiAgICAgICAgICAgICAgICAgICAgQGwyZE9iamVjdC50YWxraW5nVm9sdW1lID0gQHRhbGtpbmdTdGVwc1tzdGVwXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAbDJkT2JqZWN0LnRhbGtpbmcgPSBub1xuIFxudm4uQ29tcG9uZW50X0xpdmUyRCA9IENvbXBvbmVudF9MaXZlMkQgICAgICAgXG5ncy5Db21wb25lbnRfTGl2ZTJEID0gQ29tcG9uZW50X0xpdmUyRCAjIERlcHJlY2F0ZWQiXX0=
//# sourceURL=Component_Live2D_152.js