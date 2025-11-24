var Component_CharacterBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_CharacterBehavior = (function(superClass) {
  extend(Component_CharacterBehavior, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  *
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_CharacterBehavior.prototype.onDataBundleRestore = function(data, context) {
    return this.setupEventHandlers();
  };


  /**
  * A behavior-component which handles the character-specific behavior like
  * talking and idle.
  *
  * @module vn
  * @class Component_CharacterBehavior
  * @extends gs.Component
  * @memberof vn
  * @constructor
   */

  function Component_CharacterBehavior() {
    Component_CharacterBehavior.__super__.constructor.apply(this, arguments);

    /**
    * @property imageIndex
    * @type number
    * @private
     */
    this.imageIndex = 0;

    /**
    * @property imageDuration
    * @type number
    * @private
     */
    this.imageDuration = 30;

    /**
    * @property idleTime
    * @type number
    * @private
     */
    this.idleTime = 120 + 120 * Math.random();

    /**
    * Indicates if the character is currently talking.
    * @property talking
    * @type boolean
     */
    this.talking = false;

    /**
    * @property initialized
    * @type boolean
    * @private
     */
    this.initialized = false;

    /**
    * Temporary game settings used by this character.
    * @property imageIndex
    * @type number
     */
    this.tempSettings = GameManager.tempSettings;
  }


  /**
  * Adds event-handlers
  *
  * @method setupEventHandlers
   */

  Component_CharacterBehavior.prototype.setupEventHandlers = function() {
    gs.GlobalEventManager.on("talkingStarted", (function(_this) {
      return function(e) {
        var ref;
        if (((ref = e.character) != null ? ref.index : void 0) === _this.object.rid) {
          _this.object.talking = true;
          return _this.imageIndex = 0;
        }
      };
    })(this));
    return gs.GlobalEventManager.on("talkingEnded", (function(_this) {
      return function(e) {
        var ref;
        if (((ref = e.character) != null ? ref.index : void 0) === _this.object.rid) {
          _this.object.talking = false;
          return _this.imageIndex = 0;
        }
      };
    })(this));
  };


  /**
  * Initializes the component. Adds event-handlers.
  *
  * @method setup
   */

  Component_CharacterBehavior.prototype.setup = function() {
    this.initialized = true;
    this.setupEventHandlers();
    return this.update();
  };


  /**
  * Changes the characters expression using blending. If the duration is set
  * to 0 the expression change is executed immediately without animation.
  *
  * @method changeExpression
  * @param {vn.CharacterExpression} expression - The character expression database-record.
  * @param {number} duration - The animation-duration in frames. Pass 0 to skip animation.
  * @param {function} [callback] An optional callback-function called when the change is finished.
   */

  Component_CharacterBehavior.prototype.changeExpression = function(expression, animation, easing, duration, callback) {
    var picture, prevExpression, ref, ref1;
    prevExpression = this.object.expression;
    this.object.expression = expression;
    if ((prevExpression != null ? (ref = prevExpression.idle) != null ? ref.length : void 0 : void 0) > 0 && (this.object.expression != null) && prevExpression !== this.object.expression) {
      this.imageIndex = 0;
      picture = new gs.Object_Picture();
      picture.imageFolder = (ref1 = prevExpression.idle[0].resource.folderPath) != null ? ref1 : "Graphics/Characters";
      picture.image = prevExpression.idle[0].resource.name;
      picture.update();
      picture.anchor.x = this.object.anchor.x;
      picture.anchor.y = this.object.anchor.y;
      picture.dstRect.x = this.object.dstRect.x + Math.round((this.object.dstRect.width - picture.dstRect.width) / 2);
      picture.dstRect.y = this.object.dstRect.y + Math.round((this.object.dstRect.height - picture.dstRect.height) / 2);
      picture.zIndex = this.object.zIndex - 1;
      picture.zoom.x = this.object.zoom.x;
      picture.zoom.y = this.object.zoom.y;
      picture.update();
      this.object.parent.addObject(picture);
      switch (animation.fading) {
        case 0:
          this.object.animator.appear(this.object.dstRect.x, this.object.dstRect.y, animation, easing, duration, function() {
            picture.dispose();
            return typeof callback === "function" ? callback() : void 0;
          });
          return this.object.update();
        case 1:
          picture.animator.disappear(animation, easing, duration, function(object) {
            return object.dispose();
          });
          picture.update();
          this.object.animator.appear(this.object.dstRect.x, this.object.dstRect.y, animation, easing, duration, function(object) {
            return typeof callback === "function" ? callback() : void 0;
          });
          return this.object.update();
      }
    } else {
      return typeof callback === "function" ? callback() : void 0;
    }
  };


  /**
  * Lets the character start talking.
  *
  * @method startTalking
   */

  Component_CharacterBehavior.prototype.startTalking = function() {
    return this.object.talking = true;
  };


  /**
  * Lets the character stop with talking.
  *
  * @method stopTalking
   */

  Component_CharacterBehavior.prototype.stopTalking = function() {
    return this.object.talking = false;
  };


  /**
  * Updates character's talking-animation.
  *
  * @method updateTalking
  * @protected
   */

  Component_CharacterBehavior.prototype.updateTalking = function() {
    var imageIndex, ref, ref1, speed;
    if (this.tempSettings.skip && ((ref = this.object.expression.talking) != null ? ref.length : void 0) > 0) {
      this.object.talking = false;
      this.imageIndex = 0;
      this.object.imageFolder = this.object.expression.talking[this.imageIndex].resource.folderPath;
      return this.object.image = this.object.expression.talking[this.imageIndex].resource.name;
    } else if (this.object.expression != null) {
      if (((ref1 = this.object.expression.talking) != null ? ref1.length : void 0) > 0) {
        this.imageDuration--;
        if (this.imageDuration <= 0) {
          imageIndex = this.imageIndex;
          while (imageIndex === this.imageIndex && this.object.expression.talking.length > 1) {
            this.imageIndex = Math.round(Math.random() * (this.object.expression.talking.length - 1));
          }
          speed = this.object.expression.talkingSpeed / 100 * 5;
          this.imageDuration = speed + Math.round(speed * Math.random());
        }
        this.object.imageFolder = this.object.expression.talking[this.imageIndex].resource.folderPath;
        return this.object.image = this.object.expression.talking[this.imageIndex].resource.name;
      } else {
        return this.updateIdle();
      }
    }
  };


  /**
  * Updates character's idle-animation.
  *
  * @method updateIdle
  * @protected
   */

  Component_CharacterBehavior.prototype.updateIdle = function() {
    var ref;
    if ((this.object.expression != null) && ((ref = this.object.expression.idle) != null ? ref.length : void 0) > 0) {
      if (this.imageDuration <= 0) {
        this.idleTime--;
        if (this.idleTime <= 0) {
          this.idleTime = this.object.expression.idleTime.start + (this.object.expression.idleTime.end - this.object.expression.idleTime.start) * Math.random();
          this.imageDuration = this.object.expression.idleSpeed / 100 * 5;
        }
      }
      if (this.imageDuration > 0) {
        this.imageDuration--;
        if (this.imageDuration <= 0) {
          this.imageIndex++;
          if (this.imageIndex >= this.object.expression.idle.length) {
            this.imageIndex = 0;
            this.imageDuration = 0;
          } else {
            this.imageDuration = this.object.expression.idleSpeed / 100 * 5;
          }
        }
      }
      this.object.imageFolder = this.object.expression.idle[this.imageIndex].resource.folderPath;
      return this.object.image = this.object.expression.idle[this.imageIndex].resource.name;
    }
  };


  /**
  * Updates character logic & animation-handling.
  *
  * @method update
   */

  Component_CharacterBehavior.prototype.update = function() {
    Component_CharacterBehavior.__super__.update.apply(this, arguments);
    if (!this.initialized) {
      this.setup();
    }
    if (this.object.talking) {
      return this.updateTalking();
    } else {
      return this.updateIdle();
    }
  };

  return Component_CharacterBehavior;

})(gs.Component);

vn.Component_CharacterBehavior = Component_CharacterBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsMkJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7O3dDQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7V0FDakIsSUFBQyxDQUFBLGtCQUFELENBQUE7RUFEaUI7OztBQUdyQjs7Ozs7Ozs7Ozs7RUFVYSxxQ0FBQTtJQUNULDhEQUFBLFNBQUE7O0FBRUE7Ozs7O0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYzs7QUFFZDs7Ozs7SUFLQSxJQUFDLENBQUEsYUFBRCxHQUFpQjs7QUFFakI7Ozs7O0lBTUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxHQUFBLEdBQU0sR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFMLENBQUE7O0FBQ3hCOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7O0lBS0EsSUFBQyxDQUFBLFdBQUQsR0FBZTs7QUFFZjs7Ozs7SUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQixXQUFXLENBQUM7RUEzQ25COzs7QUE2Q2I7Ozs7Ozt3Q0FLQSxrQkFBQSxHQUFvQixTQUFBO0lBQ2hCLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUF0QixDQUF5QixnQkFBekIsRUFBMkMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7QUFDdkMsWUFBQTtRQUFBLHNDQUFjLENBQUUsZUFBYixLQUFzQixLQUFDLENBQUEsTUFBTSxDQUFDLEdBQWpDO1VBQ0ksS0FBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLEdBQWtCO2lCQUNsQixLQUFDLENBQUEsVUFBRCxHQUFjLEVBRmxCOztNQUR1QztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0M7V0FJQSxFQUFFLENBQUMsa0JBQWtCLENBQUMsRUFBdEIsQ0FBeUIsY0FBekIsRUFBeUMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7QUFDckMsWUFBQTtRQUFBLHNDQUFjLENBQUUsZUFBYixLQUFzQixLQUFDLENBQUEsTUFBTSxDQUFDLEdBQWpDO1VBQ0ksS0FBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLEdBQWtCO2lCQUNsQixLQUFDLENBQUEsVUFBRCxHQUFjLEVBRmxCOztNQURxQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekM7RUFMZ0I7OztBQVVwQjs7Ozs7O3dDQUtBLEtBQUEsR0FBTyxTQUFBO0lBQ0gsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUNmLElBQUMsQ0FBQSxrQkFBRCxDQUFBO1dBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtFQUhHOzs7QUFLUDs7Ozs7Ozs7Ozt3Q0FTQSxnQkFBQSxHQUFrQixTQUFDLFVBQUQsRUFBYSxTQUFiLEVBQXdCLE1BQXhCLEVBQWdDLFFBQWhDLEVBQTBDLFFBQTFDO0FBQ2QsUUFBQTtJQUFBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUN6QixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsR0FBcUI7SUFFckIsdUVBQXVCLENBQUUseUJBQXRCLEdBQStCLENBQS9CLElBQXFDLGdDQUFyQyxJQUE2RCxjQUFBLEtBQWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBMUY7TUFDSSxJQUFDLENBQUEsVUFBRCxHQUFjO01BRWQsT0FBQSxHQUFjLElBQUEsRUFBRSxDQUFDLGNBQUgsQ0FBQTtNQUNkLE9BQU8sQ0FBQyxXQUFSLHdFQUFtRTtNQUNuRSxPQUFPLENBQUMsS0FBUixHQUFnQixjQUFjLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVEsQ0FBQztNQUNoRCxPQUFPLENBQUMsTUFBUixDQUFBO01BQ0EsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFmLEdBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDO01BQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBZixHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQztNQUNsQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFoQixHQUF3QixPQUFPLENBQUMsT0FBTyxDQUFDLEtBQXpDLENBQUEsR0FBa0QsQ0FBN0Q7TUFDeEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFoQixHQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFoQixHQUFvQixJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBaEIsR0FBeUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUExQyxDQUFBLEdBQW9ELENBQS9EO01BQ3hDLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFpQjtNQUNsQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQWIsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUM7TUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFiLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDO01BQzlCLE9BQU8sQ0FBQyxNQUFSLENBQUE7TUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFmLENBQXlCLE9BQXpCO0FBRUEsY0FBTyxTQUFTLENBQUMsTUFBakI7QUFBQSxhQUNTLENBRFQ7VUFFUSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFqQixDQUF3QixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUF4QyxFQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUEzRCxFQUE4RCxTQUE5RCxFQUF5RSxNQUF6RSxFQUFpRixRQUFqRixFQUEyRixTQUFBO1lBQ3ZGLE9BQU8sQ0FBQyxPQUFSLENBQUE7b0RBQ0E7VUFGdUYsQ0FBM0Y7aUJBSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQUE7QUFOUixhQU9TLENBUFQ7VUFRUSxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQWpCLENBQTJCLFNBQTNCLEVBQXNDLE1BQXRDLEVBQThDLFFBQTlDLEVBQXdELFNBQUMsTUFBRDttQkFDcEQsTUFBTSxDQUFDLE9BQVAsQ0FBQTtVQURvRCxDQUF4RDtVQUVBLE9BQU8sQ0FBQyxNQUFSLENBQUE7VUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFqQixDQUF3QixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUF4QyxFQUEyQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUEzRCxFQUE4RCxTQUE5RCxFQUF5RSxNQUF6RSxFQUFpRixRQUFqRixFQUEyRixTQUFDLE1BQUQ7b0RBQ3ZGO1VBRHVGLENBQTNGO2lCQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO0FBZFIsT0FuQko7S0FBQSxNQUFBOzhDQW1DSSxvQkFuQ0o7O0VBSmM7OztBQTBDbEI7Ozs7Ozt3Q0FLQSxZQUFBLEdBQWMsU0FBQTtXQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixHQUFrQjtFQUFyQjs7O0FBRWQ7Ozs7Ozt3Q0FLQSxXQUFBLEdBQWEsU0FBQTtXQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixHQUFrQjtFQUFyQjs7O0FBRWI7Ozs7Ozs7d0NBTUEsYUFBQSxHQUFlLFNBQUE7QUFDWCxRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQseURBQWlELENBQUUsZ0JBQTVCLEdBQXFDLENBQS9EO01BQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLEdBQWtCO01BQ2xCLElBQUMsQ0FBQSxVQUFELEdBQWM7TUFDZCxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsR0FBc0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBUSxDQUFBLElBQUMsQ0FBQSxVQUFELENBQVksQ0FBQyxRQUFRLENBQUM7YUFDdkUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQVEsQ0FBQSxJQUFDLENBQUEsVUFBRCxDQUFZLENBQUMsUUFBUSxDQUFDLEtBSnJFO0tBQUEsTUFLSyxJQUFHLDhCQUFIO01BQ0QsMkRBQTZCLENBQUUsZ0JBQTVCLEdBQXFDLENBQXhDO1FBQ0ksSUFBQyxDQUFBLGFBQUQ7UUFDQSxJQUFHLElBQUMsQ0FBQSxhQUFELElBQWtCLENBQXJCO1VBQ0ksVUFBQSxHQUFhLElBQUMsQ0FBQTtBQUNkLGlCQUFNLFVBQUEsS0FBYyxJQUFDLENBQUEsVUFBZixJQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBM0IsR0FBb0MsQ0FBeEU7WUFDSSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQTNCLEdBQWtDLENBQW5DLENBQTNCO1VBRGxCO1VBRUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQW5CLEdBQWtDLEdBQWxDLEdBQXdDO1VBQ2hELElBQUMsQ0FBQSxhQUFELEdBQWlCLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUEsR0FBUSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQW5CLEVBTDdCOztRQU1BLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixHQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFRLENBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxDQUFDLFFBQVEsQ0FBQztlQUN2RSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsR0FBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBUSxDQUFBLElBQUMsQ0FBQSxVQUFELENBQVksQ0FBQyxRQUFRLENBQUMsS0FUckU7T0FBQSxNQUFBO2VBV0ksSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQVhKO09BREM7O0VBTk07OztBQW9CZjs7Ozs7Ozt3Q0FNQSxVQUFBLEdBQVksU0FBQTtBQUNSLFFBQUE7SUFBQSxJQUFHLGdDQUFBLHNEQUErQyxDQUFFLGdCQUF6QixHQUFrQyxDQUE3RDtNQUNJLElBQUcsSUFBQyxDQUFBLGFBQUQsSUFBa0IsQ0FBckI7UUFDSSxJQUFDLENBQUEsUUFBRDtRQUNBLElBQUcsSUFBQyxDQUFBLFFBQUQsSUFBYSxDQUFoQjtVQUNJLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQTVCLEdBQW9DLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQTVCLEdBQWtDLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUEvRCxDQUFBLEdBQXdFLElBQUksQ0FBQyxNQUFMLENBQUE7VUFDeEgsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBbkIsR0FBK0IsR0FBL0IsR0FBcUMsRUFGMUQ7U0FGSjs7TUFNQSxJQUFHLElBQUMsQ0FBQSxhQUFELEdBQWlCLENBQXBCO1FBQ0ksSUFBQyxDQUFBLGFBQUQ7UUFDQSxJQUFHLElBQUMsQ0FBQSxhQUFELElBQWtCLENBQXJCO1VBQ0ksSUFBQyxDQUFBLFVBQUQ7VUFDQSxJQUFHLElBQUMsQ0FBQSxVQUFELElBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQTFDO1lBQ0ksSUFBQyxDQUFBLFVBQUQsR0FBYztZQUNkLElBQUMsQ0FBQSxhQUFELEdBQWlCLEVBRnJCO1dBQUEsTUFBQTtZQUlJLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQW5CLEdBQStCLEdBQS9CLEdBQXFDLEVBSjFEO1dBRko7U0FGSjs7TUFTQSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsR0FBc0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSyxDQUFBLElBQUMsQ0FBQSxVQUFELENBQVksQ0FBQyxRQUFRLENBQUM7YUFDcEUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUssQ0FBQSxJQUFDLENBQUEsVUFBRCxDQUFZLENBQUMsUUFBUSxDQUFDLEtBakJsRTs7RUFEUTs7O0FBb0JaOzs7Ozs7d0NBS0EsTUFBQSxHQUFRLFNBQUE7SUFDSix5REFBQSxTQUFBO0lBQ0EsSUFBRyxDQUFJLElBQUMsQ0FBQSxXQUFSO01BQXlCLElBQUMsQ0FBQSxLQUFELENBQUEsRUFBekI7O0lBRUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVg7YUFDSSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBREo7S0FBQSxNQUFBO2FBR0ksSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQUhKOztFQUpJOzs7O0dBdE44QixFQUFFLENBQUM7O0FBaU83QyxFQUFFLENBQUMsMkJBQUgsR0FBaUMiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9DaGFyYWN0ZXJCZWhhdmlvclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X0NoYXJhY3RlckJlaGF2aW9yIGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG5cbiAgICAjIyMqXG4gICAgKiBBIGJlaGF2aW9yLWNvbXBvbmVudCB3aGljaCBoYW5kbGVzIHRoZSBjaGFyYWN0ZXItc3BlY2lmaWMgYmVoYXZpb3IgbGlrZVxuICAgICogdGFsa2luZyBhbmQgaWRsZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIHZuXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0NoYXJhY3RlckJlaGF2aW9yXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAqIEBtZW1iZXJvZiB2blxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBpbWFnZUluZGV4XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbWFnZUluZGV4ID0gMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgaW1hZ2VEdXJhdGlvblxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAaW1hZ2VEdXJhdGlvbiA9IDMwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBpZGxlVGltZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuXG4gICAgICAgIEBpZGxlVGltZSA9IDEyMCArIDEyMCAqIE1hdGgucmFuZG9tKClcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgY2hhcmFjdGVyIGlzIGN1cnJlbnRseSB0YWxraW5nLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0YWxraW5nXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHRhbGtpbmcgPSBub1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgaW5pdGlhbGl6ZWRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbml0aWFsaXplZCA9IG5vXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRlbXBvcmFyeSBnYW1lIHNldHRpbmdzIHVzZWQgYnkgdGhpcyBjaGFyYWN0ZXIuXG4gICAgICAgICogQHByb3BlcnR5IGltYWdlSW5kZXhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZW1wU2V0dGluZ3MgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3NcblxuICAgICMjIypcbiAgICAqIEFkZHMgZXZlbnQtaGFuZGxlcnNcbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwRXZlbnRIYW5kbGVyc1xuICAgICMjI1xuICAgIHNldHVwRXZlbnRIYW5kbGVyczogLT5cbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwidGFsa2luZ1N0YXJ0ZWRcIiwgKGUpID0+XG4gICAgICAgICAgICBpZiBlLmNoYXJhY3Rlcj8uaW5kZXggPT0gQG9iamVjdC5yaWRcbiAgICAgICAgICAgICAgICBAb2JqZWN0LnRhbGtpbmcgPSB5ZXNcbiAgICAgICAgICAgICAgICBAaW1hZ2VJbmRleCA9IDBcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwidGFsa2luZ0VuZGVkXCIsIChlKSA9PlxuICAgICAgICAgICAgaWYgZS5jaGFyYWN0ZXI/LmluZGV4ID09IEBvYmplY3QucmlkXG4gICAgICAgICAgICAgICAgQG9iamVjdC50YWxraW5nID0gbm9cbiAgICAgICAgICAgICAgICBAaW1hZ2VJbmRleCA9IDBcblxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSBjb21wb25lbnQuIEFkZHMgZXZlbnQtaGFuZGxlcnMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFxuICAgICMjI1xuICAgIHNldHVwOiAtPlxuICAgICAgICBAaW5pdGlhbGl6ZWQgPSB5ZXNcbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIEB1cGRhdGUoKVxuXG4gICAgIyMjKlxuICAgICogQ2hhbmdlcyB0aGUgY2hhcmFjdGVycyBleHByZXNzaW9uIHVzaW5nIGJsZW5kaW5nLiBJZiB0aGUgZHVyYXRpb24gaXMgc2V0XG4gICAgKiB0byAwIHRoZSBleHByZXNzaW9uIGNoYW5nZSBpcyBleGVjdXRlZCBpbW1lZGlhdGVseSB3aXRob3V0IGFuaW1hdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNoYW5nZUV4cHJlc3Npb25cbiAgICAqIEBwYXJhbSB7dm4uQ2hhcmFjdGVyRXhwcmVzc2lvbn0gZXhwcmVzc2lvbiAtIFRoZSBjaGFyYWN0ZXIgZXhwcmVzc2lvbiBkYXRhYmFzZS1yZWNvcmQuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gLSBUaGUgYW5pbWF0aW9uLWR1cmF0aW9uIGluIGZyYW1lcy4gUGFzcyAwIHRvIHNraXAgYW5pbWF0aW9uLlxuICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2NhbGxiYWNrXSBBbiBvcHRpb25hbCBjYWxsYmFjay1mdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgY2hhbmdlIGlzIGZpbmlzaGVkLlxuICAgICMjI1xuICAgIGNoYW5nZUV4cHJlc3Npb246IChleHByZXNzaW9uLCBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sIGNhbGxiYWNrKSAtPlxuICAgICAgICBwcmV2RXhwcmVzc2lvbiA9IEBvYmplY3QuZXhwcmVzc2lvblxuICAgICAgICBAb2JqZWN0LmV4cHJlc3Npb24gPSBleHByZXNzaW9uXG5cbiAgICAgICAgaWYgcHJldkV4cHJlc3Npb24/LmlkbGU/Lmxlbmd0aCA+IDAgYW5kIEBvYmplY3QuZXhwcmVzc2lvbj8gYW5kIHByZXZFeHByZXNzaW9uICE9IEBvYmplY3QuZXhwcmVzc2lvblxuICAgICAgICAgICAgQGltYWdlSW5kZXggPSAwXG5cbiAgICAgICAgICAgIHBpY3R1cmUgPSBuZXcgZ3MuT2JqZWN0X1BpY3R1cmUoKVxuICAgICAgICAgICAgcGljdHVyZS5pbWFnZUZvbGRlciA9IHByZXZFeHByZXNzaW9uLmlkbGVbMF0ucmVzb3VyY2UuZm9sZGVyUGF0aCA/IFwiR3JhcGhpY3MvQ2hhcmFjdGVyc1wiXG4gICAgICAgICAgICBwaWN0dXJlLmltYWdlID0gcHJldkV4cHJlc3Npb24uaWRsZVswXS5yZXNvdXJjZS5uYW1lXG4gICAgICAgICAgICBwaWN0dXJlLnVwZGF0ZSgpXG4gICAgICAgICAgICBwaWN0dXJlLmFuY2hvci54ID0gQG9iamVjdC5hbmNob3IueFxuICAgICAgICAgICAgcGljdHVyZS5hbmNob3IueSA9IEBvYmplY3QuYW5jaG9yLnlcbiAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC54ID0gQG9iamVjdC5kc3RSZWN0LnggKyBNYXRoLnJvdW5kKChAb2JqZWN0LmRzdFJlY3Qud2lkdGggLSBwaWN0dXJlLmRzdFJlY3Qud2lkdGgpIC8gMilcbiAgICAgICAgICAgIHBpY3R1cmUuZHN0UmVjdC55ID0gQG9iamVjdC5kc3RSZWN0LnkgKyBNYXRoLnJvdW5kKChAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0IC0gcGljdHVyZS5kc3RSZWN0LmhlaWdodCkgLyAyKVxuICAgICAgICAgICAgcGljdHVyZS56SW5kZXggPSBAb2JqZWN0LnpJbmRleCAtIDFcbiAgICAgICAgICAgIHBpY3R1cmUuem9vbS54ID0gQG9iamVjdC56b29tLnhcbiAgICAgICAgICAgIHBpY3R1cmUuem9vbS55ID0gQG9iamVjdC56b29tLnlcbiAgICAgICAgICAgIHBpY3R1cmUudXBkYXRlKClcblxuXG4gICAgICAgICAgICBAb2JqZWN0LnBhcmVudC5hZGRPYmplY3QocGljdHVyZSlcblxuICAgICAgICAgICAgc3dpdGNoIGFuaW1hdGlvbi5mYWRpbmdcbiAgICAgICAgICAgICAgICB3aGVuIDAgIyBPdmVybGF5XG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QuYW5pbWF0b3IuYXBwZWFyKEBvYmplY3QuZHN0UmVjdC54LCBAb2JqZWN0LmRzdFJlY3QueSwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAoKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrPygpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC51cGRhdGUoKVxuICAgICAgICAgICAgICAgIHdoZW4gMSAjIENyb3NzIEZhZGVcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS5hbmltYXRvci5kaXNhcHBlYXIoYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAob2JqZWN0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRpc3Bvc2UoKSlcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZS51cGRhdGUoKVxuXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QuYW5pbWF0b3IuYXBwZWFyKEBvYmplY3QuZHN0UmVjdC54LCBAb2JqZWN0LmRzdFJlY3QueSwgYW5pbWF0aW9uLCBlYXNpbmcsIGR1cmF0aW9uLCAob2JqZWN0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s/KCkpXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QudXBkYXRlKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2FsbGJhY2s/KClcblxuXG4gICAgIyMjKlxuICAgICogTGV0cyB0aGUgY2hhcmFjdGVyIHN0YXJ0IHRhbGtpbmcuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdGFydFRhbGtpbmdcbiAgICAjIyNcbiAgICBzdGFydFRhbGtpbmc6IC0+IEBvYmplY3QudGFsa2luZyA9IHllc1xuXG4gICAgIyMjKlxuICAgICogTGV0cyB0aGUgY2hhcmFjdGVyIHN0b3Agd2l0aCB0YWxraW5nLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RvcFRhbGtpbmdcbiAgICAjIyNcbiAgICBzdG9wVGFsa2luZzogLT4gQG9iamVjdC50YWxraW5nID0gbm9cblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgY2hhcmFjdGVyJ3MgdGFsa2luZy1hbmltYXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVUYWxraW5nXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgdXBkYXRlVGFsa2luZzogLT5cbiAgICAgICAgaWYgQHRlbXBTZXR0aW5ncy5za2lwIGFuZCBAb2JqZWN0LmV4cHJlc3Npb24udGFsa2luZz8ubGVuZ3RoID4gMFxuICAgICAgICAgICAgQG9iamVjdC50YWxraW5nID0gbm9cbiAgICAgICAgICAgIEBpbWFnZUluZGV4ID0gMFxuICAgICAgICAgICAgQG9iamVjdC5pbWFnZUZvbGRlciA9IEBvYmplY3QuZXhwcmVzc2lvbi50YWxraW5nW0BpbWFnZUluZGV4XS5yZXNvdXJjZS5mb2xkZXJQYXRoXG4gICAgICAgICAgICBAb2JqZWN0LmltYWdlID0gQG9iamVjdC5leHByZXNzaW9uLnRhbGtpbmdbQGltYWdlSW5kZXhdLnJlc291cmNlLm5hbWVcbiAgICAgICAgZWxzZSBpZiBAb2JqZWN0LmV4cHJlc3Npb24/XG4gICAgICAgICAgICBpZiBAb2JqZWN0LmV4cHJlc3Npb24udGFsa2luZz8ubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIEBpbWFnZUR1cmF0aW9uLS1cbiAgICAgICAgICAgICAgICBpZiBAaW1hZ2VEdXJhdGlvbiA8PSAwXG4gICAgICAgICAgICAgICAgICAgIGltYWdlSW5kZXggPSBAaW1hZ2VJbmRleFxuICAgICAgICAgICAgICAgICAgICB3aGlsZSBpbWFnZUluZGV4ID09IEBpbWFnZUluZGV4IGFuZCBAb2JqZWN0LmV4cHJlc3Npb24udGFsa2luZy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW1hZ2VJbmRleCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIChAb2JqZWN0LmV4cHJlc3Npb24udGFsa2luZy5sZW5ndGgtMSkpXG4gICAgICAgICAgICAgICAgICAgIHNwZWVkID0gQG9iamVjdC5leHByZXNzaW9uLnRhbGtpbmdTcGVlZCAvIDEwMCAqIDVcbiAgICAgICAgICAgICAgICAgICAgQGltYWdlRHVyYXRpb24gPSBzcGVlZCArIE1hdGgucm91bmQoc3BlZWQgKiBNYXRoLnJhbmRvbSgpKVxuICAgICAgICAgICAgICAgIEBvYmplY3QuaW1hZ2VGb2xkZXIgPSBAb2JqZWN0LmV4cHJlc3Npb24udGFsa2luZ1tAaW1hZ2VJbmRleF0ucmVzb3VyY2UuZm9sZGVyUGF0aFxuICAgICAgICAgICAgICAgIEBvYmplY3QuaW1hZ2UgPSBAb2JqZWN0LmV4cHJlc3Npb24udGFsa2luZ1tAaW1hZ2VJbmRleF0ucmVzb3VyY2UubmFtZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEB1cGRhdGVJZGxlKClcblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgY2hhcmFjdGVyJ3MgaWRsZS1hbmltYXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVJZGxlXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgdXBkYXRlSWRsZTogLT5cbiAgICAgICAgaWYgQG9iamVjdC5leHByZXNzaW9uPyBhbmQgQG9iamVjdC5leHByZXNzaW9uLmlkbGU/Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGlmIEBpbWFnZUR1cmF0aW9uIDw9IDBcbiAgICAgICAgICAgICAgICBAaWRsZVRpbWUtLVxuICAgICAgICAgICAgICAgIGlmIEBpZGxlVGltZSA8PSAwXG4gICAgICAgICAgICAgICAgICAgIEBpZGxlVGltZSA9IEBvYmplY3QuZXhwcmVzc2lvbi5pZGxlVGltZS5zdGFydCArIChAb2JqZWN0LmV4cHJlc3Npb24uaWRsZVRpbWUuZW5kIC0gQG9iamVjdC5leHByZXNzaW9uLmlkbGVUaW1lLnN0YXJ0KSAqIE1hdGgucmFuZG9tKClcbiAgICAgICAgICAgICAgICAgICAgQGltYWdlRHVyYXRpb24gPSBAb2JqZWN0LmV4cHJlc3Npb24uaWRsZVNwZWVkIC8gMTAwICogNVxuXG4gICAgICAgICAgICBpZiBAaW1hZ2VEdXJhdGlvbiA+IDBcbiAgICAgICAgICAgICAgICBAaW1hZ2VEdXJhdGlvbi0tXG4gICAgICAgICAgICAgICAgaWYgQGltYWdlRHVyYXRpb24gPD0gMFxuICAgICAgICAgICAgICAgICAgICBAaW1hZ2VJbmRleCsrXG4gICAgICAgICAgICAgICAgICAgIGlmIEBpbWFnZUluZGV4ID49IEBvYmplY3QuZXhwcmVzc2lvbi5pZGxlLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgQGltYWdlSW5kZXggPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICBAaW1hZ2VEdXJhdGlvbiA9IDBcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGltYWdlRHVyYXRpb24gPSBAb2JqZWN0LmV4cHJlc3Npb24uaWRsZVNwZWVkIC8gMTAwICogNVxuICAgICAgICAgICAgQG9iamVjdC5pbWFnZUZvbGRlciA9IEBvYmplY3QuZXhwcmVzc2lvbi5pZGxlW0BpbWFnZUluZGV4XS5yZXNvdXJjZS5mb2xkZXJQYXRoXG4gICAgICAgICAgICBAb2JqZWN0LmltYWdlID0gQG9iamVjdC5leHByZXNzaW9uLmlkbGVbQGltYWdlSW5kZXhdLnJlc291cmNlLm5hbWVcblxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgY2hhcmFjdGVyIGxvZ2ljICYgYW5pbWF0aW9uLWhhbmRsaW5nLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBpZiBub3QgQGluaXRpYWxpemVkIHRoZW4gQHNldHVwKClcblxuICAgICAgICBpZiBAb2JqZWN0LnRhbGtpbmdcbiAgICAgICAgICAgIEB1cGRhdGVUYWxraW5nKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHVwZGF0ZUlkbGUoKVxuXG5cblxudm4uQ29tcG9uZW50X0NoYXJhY3RlckJlaGF2aW9yID0gQ29tcG9uZW50X0NoYXJhY3RlckJlaGF2aW9yIl19
//# sourceURL=Component_CharacterBehavior_166.js