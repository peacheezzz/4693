var Component_AnimationExecutor,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_AnimationExecutor = (function(superClass) {
  extend(Component_AnimationExecutor, superClass);


  /**
  * An animation-handler component allows a UI game object to execute
  * a flow of animations. For more information about UI animations, see help-file.
  * 
  * @module ui
  * @class Component_AnimationExecutor
  * @extends gs.Component
  * @memberof ui
  * @constructor
   */

  function Component_AnimationExecutor() {
    Component_AnimationExecutor.__super__.constructor.apply(this, arguments);

    /**
    * @property initialized
    * @type boolean
    * @protected
     */
    this.initialized = false;

    /**
    * @property waitCounter
    * @type number
    * @protected
     */
    this.waitCounter = 0;

    /**
    * @property pointer
    * @type number
    * @protected
     */
    this.pointer = 0;
    this.repeat = false;
  }


  /**
  * Initializes the animation-handler.
  * 
  * @method setup
   */

  Component_AnimationExecutor.prototype.setup = function() {
    this.initialized = true;
    return null;
  };

  Component_AnimationExecutor.prototype.execute = function(animation, callback) {
    this.animation = animation;
    this.callback = callback;
    this.pointer = 0;
    return this.waitCounter = 0;
  };

  Component_AnimationExecutor.prototype.stop = function() {
    return this.animation = null;
  };


  /**
  * Starts the specified animation.
  * 
  * @method startAnimation
  * @param {Object} animation - The animation to start.
  * @param {gs.Object_Base} target - The target object of the animation.
  * @protected
   */

  Component_AnimationExecutor.prototype.startAnimation = function(animation, duration, target, animator) {
    var easing, mask, record, value;
    switch (animation.type) {
      case "sound":
        AudioManager.playSound(animation.sound);
        break;
      case "maskTo":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        mask = {
          value: animation.value,
          graphic: {
            name: animation.mask
          },
          vague: animation.vague,
          sourceType: 0
        };
        animator.maskTo(mask, duration, easing);
        break;
      case "changeImages":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.changeImages(animation.images, duration, easing);
        break;
      case "playAnimation":
        record = RecordManager.animations[animation.animationId];
        if (record != null) {
          animator.playAnimation(record);
        }
        break;
      case "changeTo":
        value = ui.Component_BindingHandler.fieldValue(target, animation.value);
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.change(value, animation.field, duration, easing);
        break;
      case "blendTo":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.blendTo(animation.opacity, duration, easing);
        break;
      case "colorTo":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.colorTo(Color.fromArray(animation.color), duration, easing);
        break;
      case "tintTo":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.tintTo(Tone.fromArray(animation.tone), duration, easing);
        break;
      case "moveTo":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.moveTo(animation.position[0], animation.position[1], duration, easing);
        break;
      case "rotate":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.rotate(0, animation.speed, duration, easing);
        break;
      case "rotateTo":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.rotateTo(animation.angle, duration, easing);
        break;
      case "moveBy":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.moveBy(this.object.dstRect.x + animation.position[0], this.object.dstRect.y + animation.position[1], duration, easing);
        break;
      case "zoomTo":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.zoomTo(animation.zoom[0] / 100, animation.zoom[1] / 100, duration, easing);
        break;
      case "scroll":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.scroll(animation.speed[0], animation.speed[1], 0, easing);
        break;
      case "move":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.move(animation.speed[0], animation.speed[1], duration, easing);
        break;
      case "shake":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        return animator.shake({
          x: animation.range[0],
          y: animation.range[1]
        }, animation.speed, duration, easing);
      case "appear":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.appear(target.dstRect.x, target.dstRect.y, animation.animation, easing, duration);
        break;
      case "disappear":
        easing = animation.easing ? gs.Easings.fromString(animation.easing) : null;
        animator.disappear(animation.animation, easing, duration);
    }
    if (this.object.visual) {
      if (duration === 0) {
        return this.object.visual.update();
      }
    } else if (this.object.behavior) {
      if (duration === 0) {
        return this.object.behavior.update();
      }
    }
  };


  /**
  * Processes the animation flow.
  * 
  * @method processAnimation
  * @param {Object} descriptor - The animation-descriptor containing the animation-flow.
  * @protected
   */

  Component_AnimationExecutor.prototype.processAnimation = function() {
    var animation, duration;
    while (this.animation && this.pointer < this.animation.flow.length) {
      animation = this.animation.flow[this.pointer];
      this.pointer++;
      if (animation.executed) {
        continue;
      }
      if (!this.object.animator) {
        this.object.animator = new gs.Component_Animator();
        this.object.addComponent(this.object.animator);
      }
      duration = ui.Component_FormulaHandler.fieldValue(this.object, animation.duration || 0, true);
      this.startAnimation(animation, duration, this.object, this.object.animator);
      animation.executed = true;
      if (animation.wait) {
        if (animation.type != null) {
          this.waitCounter = duration;
        } else {
          this.waitCounter = animation.wait;
        }
        break;
      }
    }
    return null;
  };


  /**
  * Updates the animations.
  * 
  * @method updateAnimations
   */

  Component_AnimationExecutor.prototype.updateAnimation = function() {
    if (this.waitCounter > 0) {
      this.waitCounter--;
      return;
    }
    if (this.pointer >= this.animation.flow.length) {
      this.pointer = 0;
      if (typeof this.callback === "function") {
        this.callback(this.object);
      }
      if (!this.repeat) {
        this.animation = null;
      }
    }
    if (this.animation) {
      this.processAnimation(this.animation);
    }
    return null;
  };


  /**
  * Updates the animation-handler.
  * 
  * @method update
   */

  Component_AnimationExecutor.prototype.update = function() {
    this.object.needsUpdate = true;
    if (this.animation) {
      return this.updateAnimation();
    }
  };

  return Component_AnimationExecutor;

})(gs.Component);

ui.Component_AnimationExecutor = Component_AnimationExecutor;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsMkJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7RUFVYSxxQ0FBQTtJQUNULDhEQUFBLFNBQUE7O0FBRUE7Ozs7O0lBS0EsSUFBQyxDQUFBLFdBQUQsR0FBZTs7QUFFZjs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFFWCxJQUFDLENBQUEsTUFBRCxHQUFVO0VBeEJEOzs7QUEwQmI7Ozs7Ozt3Q0FLQSxLQUFBLEdBQU8sU0FBQTtJQUNILElBQUMsQ0FBQSxXQUFELEdBQWU7QUFFZixXQUFPO0VBSEo7O3dDQUtQLE9BQUEsR0FBUyxTQUFDLFNBQUQsRUFBWSxRQUFaO0lBQ0wsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQUNiLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFDWixJQUFDLENBQUEsT0FBRCxHQUFXO1dBQ1gsSUFBQyxDQUFBLFdBQUQsR0FBZTtFQUpWOzt3Q0FNVCxJQUFBLEdBQU0sU0FBQTtXQUNGLElBQUMsQ0FBQSxTQUFELEdBQWE7RUFEWDs7O0FBR047Ozs7Ozs7Ozt3Q0FRQSxjQUFBLEdBQWdCLFNBQUMsU0FBRCxFQUFZLFFBQVosRUFBc0IsTUFBdEIsRUFBOEIsUUFBOUI7QUFDWixRQUFBO0FBQUEsWUFBTyxTQUFTLENBQUMsSUFBakI7QUFBQSxXQUNTLE9BRFQ7UUFFUSxZQUFZLENBQUMsU0FBYixDQUF1QixTQUFTLENBQUMsS0FBakM7QUFEQztBQURULFdBR1MsUUFIVDtRQUlRLE1BQUEsR0FBWSxTQUFTLENBQUMsTUFBYixHQUF5QixFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVgsQ0FBc0IsU0FBUyxDQUFDLE1BQWhDLENBQXpCLEdBQXNFO1FBQy9FLElBQUEsR0FBTztVQUFFLEtBQUEsRUFBTyxTQUFTLENBQUMsS0FBbkI7VUFBMEIsT0FBQSxFQUFT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IyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfQW5pbWF0aW9uRXhlY3V0b3JcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9BbmltYXRpb25FeGVjdXRvciBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICMjIypcbiAgICAqIEFuIGFuaW1hdGlvbi1oYW5kbGVyIGNvbXBvbmVudCBhbGxvd3MgYSBVSSBnYW1lIG9iamVjdCB0byBleGVjdXRlXG4gICAgKiBhIGZsb3cgb2YgYW5pbWF0aW9ucy4gRm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgVUkgYW5pbWF0aW9ucywgc2VlIGhlbHAtZmlsZS5cbiAgICAqIFxuICAgICogQG1vZHVsZSB1aVxuICAgICogQGNsYXNzIENvbXBvbmVudF9BbmltYXRpb25FeGVjdXRvclxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2YgdWlcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBpbml0aWFsaXplZFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAaW5pdGlhbGl6ZWQgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0Q291bnRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEB3YWl0Q291bnRlciA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgcG9pbnRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBwb2ludGVyID0gMFxuICAgICAgICBcbiAgICAgICAgQHJlcGVhdCA9IG5vXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSBhbmltYXRpb24taGFuZGxlci5cbiAgICAqIFxuICAgICogQG1ldGhvZCBzZXR1cFxuICAgICMjI1xuICAgIHNldHVwOiAtPlxuICAgICAgICBAaW5pdGlhbGl6ZWQgPSB5ZXNcbiAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIFxuICAgIGV4ZWN1dGU6IChhbmltYXRpb24sIGNhbGxiYWNrKSAtPlxuICAgICAgICBAYW5pbWF0aW9uID0gYW5pbWF0aW9uXG4gICAgICAgIEBjYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgICAgIEBwb2ludGVyID0gMFxuICAgICAgICBAd2FpdENvdW50ZXIgPSAwXG4gICAgICAgIFxuICAgIHN0b3A6IC0+XG4gICAgICAgIEBhbmltYXRpb24gPSBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFN0YXJ0cyB0aGUgc3BlY2lmaWVkIGFuaW1hdGlvbi5cbiAgICAqIFxuICAgICogQG1ldGhvZCBzdGFydEFuaW1hdGlvblxuICAgICogQHBhcmFtIHtPYmplY3R9IGFuaW1hdGlvbiAtIFRoZSBhbmltYXRpb24gdG8gc3RhcnQuXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSB0YXJnZXQgLSBUaGUgdGFyZ2V0IG9iamVjdCBvZiB0aGUgYW5pbWF0aW9uLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyAgICBcbiAgICBzdGFydEFuaW1hdGlvbjogKGFuaW1hdGlvbiwgZHVyYXRpb24sIHRhcmdldCwgYW5pbWF0b3IpIC0+XG4gICAgICAgIHN3aXRjaCBhbmltYXRpb24udHlwZVxuICAgICAgICAgICAgd2hlbiBcInNvdW5kXCJcbiAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIucGxheVNvdW5kKGFuaW1hdGlvbi5zb3VuZClcbiAgICAgICAgICAgIHdoZW4gXCJtYXNrVG9cIlxuICAgICAgICAgICAgICAgIGVhc2luZyA9IGlmIGFuaW1hdGlvbi5lYXNpbmcgdGhlbiBncy5FYXNpbmdzLmZyb21TdHJpbmcoYW5pbWF0aW9uLmVhc2luZykgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgbWFzayA9IHsgdmFsdWU6IGFuaW1hdGlvbi52YWx1ZSwgZ3JhcGhpYzogeyBuYW1lOiBhbmltYXRpb24ubWFzayB9LCB2YWd1ZTogYW5pbWF0aW9uLnZhZ3VlLCBzb3VyY2VUeXBlOiAwIH1cbiAgICAgICAgICAgICAgICBhbmltYXRvci5tYXNrVG8obWFzaywgZHVyYXRpb24sIGVhc2luZylcbiAgICAgICAgICAgIHdoZW4gXCJjaGFuZ2VJbWFnZXNcIlxuICAgICAgICAgICAgICAgIGVhc2luZyA9IGlmIGFuaW1hdGlvbi5lYXNpbmcgdGhlbiBncy5FYXNpbmdzLmZyb21TdHJpbmcoYW5pbWF0aW9uLmVhc2luZykgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgYW5pbWF0b3IuY2hhbmdlSW1hZ2VzKGFuaW1hdGlvbi5pbWFnZXMsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICB3aGVuIFwicGxheUFuaW1hdGlvblwiXG4gICAgICAgICAgICAgICAgcmVjb3JkID0gUmVjb3JkTWFuYWdlci5hbmltYXRpb25zW2FuaW1hdGlvbi5hbmltYXRpb25JZF1cbiAgICAgICAgICAgICAgICBpZiByZWNvcmQ/XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdG9yLnBsYXlBbmltYXRpb24ocmVjb3JkKVxuICAgICAgICAgICAgd2hlbiBcImNoYW5nZVRvXCJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHVpLkNvbXBvbmVudF9CaW5kaW5nSGFuZGxlci5maWVsZFZhbHVlKHRhcmdldCwgYW5pbWF0aW9uLnZhbHVlKVxuICAgICAgICAgICAgICAgIGVhc2luZyA9IGlmIGFuaW1hdGlvbi5lYXNpbmcgdGhlbiBncy5FYXNpbmdzLmZyb21TdHJpbmcoYW5pbWF0aW9uLmVhc2luZykgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYW5pbWF0b3IuY2hhbmdlKHZhbHVlLCBhbmltYXRpb24uZmllbGQsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICB3aGVuIFwiYmxlbmRUb1wiXG4gICAgICAgICAgICAgICAgZWFzaW5nID0gaWYgYW5pbWF0aW9uLmVhc2luZyB0aGVuIGdzLkVhc2luZ3MuZnJvbVN0cmluZyhhbmltYXRpb24uZWFzaW5nKSBlbHNlIG51bGxcbiAgICAgICAgICAgICAgICBhbmltYXRvci5ibGVuZFRvKGFuaW1hdGlvbi5vcGFjaXR5LCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgd2hlbiBcImNvbG9yVG9cIlxuICAgICAgICAgICAgICAgIGVhc2luZyA9IGlmIGFuaW1hdGlvbi5lYXNpbmcgdGhlbiBncy5FYXNpbmdzLmZyb21TdHJpbmcoYW5pbWF0aW9uLmVhc2luZykgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgYW5pbWF0b3IuY29sb3JUbyhDb2xvci5mcm9tQXJyYXkoYW5pbWF0aW9uLmNvbG9yKSwgZHVyYXRpb24sIGVhc2luZykgXG4gICAgICAgICAgICB3aGVuIFwidGludFRvXCJcbiAgICAgICAgICAgICAgICBlYXNpbmcgPSBpZiBhbmltYXRpb24uZWFzaW5nIHRoZW4gZ3MuRWFzaW5ncy5mcm9tU3RyaW5nKGFuaW1hdGlvbi5lYXNpbmcpIGVsc2UgbnVsbFxuICAgICAgICAgICAgICAgIGFuaW1hdG9yLnRpbnRUbyhUb25lLmZyb21BcnJheShhbmltYXRpb24udG9uZSksIGR1cmF0aW9uLCBlYXNpbmcpIFxuICAgICAgICAgICAgd2hlbiBcIm1vdmVUb1wiXG4gICAgICAgICAgICAgICAgZWFzaW5nID0gaWYgYW5pbWF0aW9uLmVhc2luZyB0aGVuIGdzLkVhc2luZ3MuZnJvbVN0cmluZyhhbmltYXRpb24uZWFzaW5nKSBlbHNlIG51bGxcbiAgICAgICAgICAgICAgICBhbmltYXRvci5tb3ZlVG8oYW5pbWF0aW9uLnBvc2l0aW9uWzBdLCBhbmltYXRpb24ucG9zaXRpb25bMV0sIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICB3aGVuIFwicm90YXRlXCJcbiAgICAgICAgICAgICAgICBlYXNpbmcgPSBpZiBhbmltYXRpb24uZWFzaW5nIHRoZW4gZ3MuRWFzaW5ncy5mcm9tU3RyaW5nKGFuaW1hdGlvbi5lYXNpbmcpIGVsc2UgbnVsbFxuICAgICAgICAgICAgICAgIGFuaW1hdG9yLnJvdGF0ZSgwLCBhbmltYXRpb24uc3BlZWQsIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICB3aGVuIFwicm90YXRlVG9cIlxuICAgICAgICAgICAgICAgIGVhc2luZyA9IGlmIGFuaW1hdGlvbi5lYXNpbmcgdGhlbiBncy5FYXNpbmdzLmZyb21TdHJpbmcoYW5pbWF0aW9uLmVhc2luZykgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgYW5pbWF0b3Iucm90YXRlVG8oYW5pbWF0aW9uLmFuZ2xlLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgd2hlbiBcIm1vdmVCeVwiXG4gICAgICAgICAgICAgICAgZWFzaW5nID0gaWYgYW5pbWF0aW9uLmVhc2luZyB0aGVuIGdzLkVhc2luZ3MuZnJvbVN0cmluZyhhbmltYXRpb24uZWFzaW5nKSBlbHNlIG51bGxcbiAgICAgICAgICAgICAgICBhbmltYXRvci5tb3ZlQnkoQG9iamVjdC5kc3RSZWN0LnggKyBhbmltYXRpb24ucG9zaXRpb25bMF0sIEBvYmplY3QuZHN0UmVjdC55ICsgYW5pbWF0aW9uLnBvc2l0aW9uWzFdLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgd2hlbiBcInpvb21Ub1wiXG4gICAgICAgICAgICAgICAgZWFzaW5nID0gaWYgYW5pbWF0aW9uLmVhc2luZyB0aGVuIGdzLkVhc2luZ3MuZnJvbVN0cmluZyhhbmltYXRpb24uZWFzaW5nKSBlbHNlIG51bGxcbiAgICAgICAgICAgICAgICBhbmltYXRvci56b29tVG8oYW5pbWF0aW9uLnpvb21bMF0gLyAxMDAsIGFuaW1hdGlvbi56b29tWzFdIC8gMTAwLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgd2hlbiBcInNjcm9sbFwiXG4gICAgICAgICAgICAgICAgZWFzaW5nID0gaWYgYW5pbWF0aW9uLmVhc2luZyB0aGVuIGdzLkVhc2luZ3MuZnJvbVN0cmluZyhhbmltYXRpb24uZWFzaW5nKSBlbHNlIG51bGxcbiAgICAgICAgICAgICAgICBhbmltYXRvci5zY3JvbGwoYW5pbWF0aW9uLnNwZWVkWzBdLCBhbmltYXRpb24uc3BlZWRbMV0sIDAsIGVhc2luZylcbiAgICAgICAgICAgIHdoZW4gXCJtb3ZlXCJcbiAgICAgICAgICAgICAgICBlYXNpbmcgPSBpZiBhbmltYXRpb24uZWFzaW5nIHRoZW4gZ3MuRWFzaW5ncy5mcm9tU3RyaW5nKGFuaW1hdGlvbi5lYXNpbmcpIGVsc2UgbnVsbFxuICAgICAgICAgICAgICAgIGFuaW1hdG9yLm1vdmUoYW5pbWF0aW9uLnNwZWVkWzBdLCBhbmltYXRpb24uc3BlZWRbMV0sIGR1cmF0aW9uLCBlYXNpbmcpXG4gICAgICAgICAgICB3aGVuIFwic2hha2VcIlxuICAgICAgICAgICAgICAgIGVhc2luZyA9IGlmIGFuaW1hdGlvbi5lYXNpbmcgdGhlbiBncy5FYXNpbmdzLmZyb21TdHJpbmcoYW5pbWF0aW9uLmVhc2luZykgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFuaW1hdG9yLnNoYWtlKHsgeDogYW5pbWF0aW9uLnJhbmdlWzBdLCB5OiBhbmltYXRpb24ucmFuZ2VbMV0gfSwgYW5pbWF0aW9uLnNwZWVkLCBkdXJhdGlvbiwgZWFzaW5nKVxuICAgICAgICAgICAgd2hlbiBcImFwcGVhclwiXG4gICAgICAgICAgICAgICAgZWFzaW5nID0gaWYgYW5pbWF0aW9uLmVhc2luZyB0aGVuIGdzLkVhc2luZ3MuZnJvbVN0cmluZyhhbmltYXRpb24uZWFzaW5nKSBlbHNlIG51bGxcbiAgICAgICAgICAgICAgICBhbmltYXRvci5hcHBlYXIodGFyZ2V0LmRzdFJlY3QueCwgdGFyZ2V0LmRzdFJlY3QueSwgYW5pbWF0aW9uLmFuaW1hdGlvbiwgZWFzaW5nLCBkdXJhdGlvbilcbiAgICAgICAgICAgIHdoZW4gXCJkaXNhcHBlYXJcIlxuICAgICAgICAgICAgICAgIGVhc2luZyA9IGlmIGFuaW1hdGlvbi5lYXNpbmcgdGhlbiBncy5FYXNpbmdzLmZyb21TdHJpbmcoYW5pbWF0aW9uLmVhc2luZykgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgYW5pbWF0b3IuZGlzYXBwZWFyKGFuaW1hdGlvbi5hbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24pXG4gICAgICAgIFxuICAgICAgICBpZiBAb2JqZWN0LnZpc3VhbFxuICAgICAgICAgICAgQG9iamVjdC52aXN1YWwudXBkYXRlKCkgaWYgZHVyYXRpb24gPT0gMFxuICAgICAgICBlbHNlIGlmIEBvYmplY3QuYmVoYXZpb3JcbiAgICAgICAgICAgIEBvYmplY3QuYmVoYXZpb3IudXBkYXRlKCkgaWYgZHVyYXRpb24gPT0gMFxuXG4gICAgIyMjKlxuICAgICogUHJvY2Vzc2VzIHRoZSBhbmltYXRpb24gZmxvdy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBwcm9jZXNzQW5pbWF0aW9uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBhbmltYXRpb24tZGVzY3JpcHRvciBjb250YWluaW5nIHRoZSBhbmltYXRpb24tZmxvdy5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgcHJvY2Vzc0FuaW1hdGlvbjogLT5cbiAgICAgICAgd2hpbGUgQGFuaW1hdGlvbiBhbmQgQHBvaW50ZXIgPCBAYW5pbWF0aW9uLmZsb3cubGVuZ3RoXG4gICAgICAgICAgICBhbmltYXRpb24gPSBAYW5pbWF0aW9uLmZsb3dbQHBvaW50ZXJdXG4gICAgICAgICAgICBAcG9pbnRlcisrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGFuaW1hdGlvbi5leGVjdXRlZCB0aGVuIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCFAb2JqZWN0LmFuaW1hdG9yKVxuICAgICAgICAgICAgICAgIEBvYmplY3QuYW5pbWF0b3IgPSBuZXcgZ3MuQ29tcG9uZW50X0FuaW1hdG9yKClcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAb2JqZWN0LmFuaW1hdG9yKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZHVyYXRpb24gPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShAb2JqZWN0LCBhbmltYXRpb24uZHVyYXRpb24gfHwgMCwgeWVzKVxuICAgICAgICAgICAgQHN0YXJ0QW5pbWF0aW9uKGFuaW1hdGlvbiwgZHVyYXRpb24sIEBvYmplY3QsIEBvYmplY3QuYW5pbWF0b3IpXG4gICAgICAgICAgICBhbmltYXRpb24uZXhlY3V0ZWQgPSB5ZXNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYW5pbWF0aW9uLndhaXRcbiAgICAgICAgICAgICAgICBpZiBhbmltYXRpb24udHlwZT9cbiAgICAgICAgICAgICAgICAgICAgQHdhaXRDb3VudGVyID0gZHVyYXRpb25cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEB3YWl0Q291bnRlciA9IGFuaW1hdGlvbi53YWl0ICN1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShAb2JqZWN0LCBhbmltYXRpb24ud2FpdCB8fCAwLCB5ZXMpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBhbmltYXRpb25zLlxuICAgICogXG4gICAgKiBAbWV0aG9kIHVwZGF0ZUFuaW1hdGlvbnNcbiAgICAjIyNcbiAgICB1cGRhdGVBbmltYXRpb246IC0+XG4gICAgICAgIGlmIEB3YWl0Q291bnRlciA+IDBcbiAgICAgICAgICAgIEB3YWl0Q291bnRlci0tXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGlmIEBwb2ludGVyID49IEBhbmltYXRpb24uZmxvdy5sZW5ndGhcbiAgICAgICAgICAgIEBwb2ludGVyID0gMFxuICAgICAgICAgICAgQGNhbGxiYWNrPyhAb2JqZWN0KVxuICAgICAgICAgICAgaWYgIUByZXBlYXRcbiAgICAgICAgICAgICAgICBAYW5pbWF0aW9uID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgIEBwcm9jZXNzQW5pbWF0aW9uKEBhbmltYXRpb24pIGlmIEBhbmltYXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBhbmltYXRpb24taGFuZGxlci5cbiAgICAqIFxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgICBcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIEBvYmplY3QubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgQHVwZGF0ZUFuaW1hdGlvbigpIGlmIEBhbmltYXRpb25cbiAgICAgICAgXG51aS5Db21wb25lbnRfQW5pbWF0aW9uRXhlY3V0b3IgPSBDb21wb25lbnRfQW5pbWF0aW9uRXhlY3V0b3IiXX0=
//# sourceURL=Component_AnimationExecutor_149.js