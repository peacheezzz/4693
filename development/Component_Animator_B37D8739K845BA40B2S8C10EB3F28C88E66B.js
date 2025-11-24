var Component_Animator,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_Animator = (function(superClass) {
  extend(Component_Animator, superClass);


  /**
  * An animator-component allows to execute different kind of animations 
  * on a game object. The animations are using the game object's 
  * dstRect & offset-property to execute.
  *
  * @module gs
  * @class Component_Animator
  * @extends gs.Component
  * @memberof gs
  * @constructor
   */

  function Component_Animator() {
    Component_Animator.__super__.constructor.apply(this, arguments);
    this.moveAnimation = new gs.Component_MoveAnimation();
    this.pathAnimation = new gs.Component_PathAnimation();
    this.zoomAnimation = new gs.Component_ZoomAnimation();
    this.blendAnimation = new gs.Component_BlendAnimation();
    this.blurAnimation = new gs.Component_BlurAnimation();
    this.pixelateAnimation = new gs.Component_PixelateAnimation();
    this.wobbleAnimation = new gs.Component_WobbleAnimation();
    this.colorAnimation = new gs.Component_ColorAnimation();
    this.imageAnimation = new gs.Component_ImageAnimation();
    this.frameAnimation = new gs.Component_FrameAnimation();
    this.fieldAnimation = new gs.Component_FieldAnimation();
    this.shakeAnimation = new gs.Component_ShakeAnimation();
    this.tintAnimation = new gs.Component_TintAnimation();
    this.rotateAnimation = new gs.Component_RotateAnimation();
    this.maskAnimation = new gs.Component_MaskAnimation();
    this.l2dAnimation = new gs.Component_Live2DAnimation();

    /**
    * Standard Callback Routine
    * @property callback
    * @type function
    * @private
     */
    this.callback = function(object, animation) {
      return object.removeComponent(animation);
    };
    this.onBlendFinish = function(object, animation, callback) {
      object.removeComponent(animation);
      return typeof callback === "function" ? callback(object) : void 0;
    };
  }

  Component_Animator.accessors("isAnimating", {
    get: function() {
      return this.object;
    }

    /**
    * Updates the animator.
    *
    * @method update
     */
  });

  Component_Animator.prototype.update = function() {
    var ref, ref1;
    Component_Animator.__super__.update.apply(this, arguments);
    if (((ref = this.object.mask) != null ? (ref1 = ref.source) != null ? ref1.videoElement : void 0 : void 0) != null) {
      return this.object.mask.source.update();
    }
  };


  /**
  * Moves the game object with a specified speed.
  *
  * @method move
  * @param {number} speedX The speed on x-axis in pixels per frame.
  * @param {number} speedY The speed on y-axis in pixels per frame.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type used for the animation.
   */

  Component_Animator.prototype.move = function(speedX, speedY, duration, easingType) {
    this.object.addComponent(this.moveAnimation);
    this.moveAnimation.move(speedX, speedY, duration, easingType, this.callback);
    return this.moveAnimation;
  };


  /**
  * Moves the game object to a specified position.
  *
  * @method moveTo
  * @param {number} x The x-coordinate of the position.
  * @param {number} y The y-coordinate of the position.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.moveTo = function(x, y, duration, easingType) {
    this.object.addComponent(this.moveAnimation);
    this.moveAnimation.moveTo(x, y, duration, easingType, this.callback);
    return this.moveAnimation;
  };


  /**
  * Moves the game object along a path.
  *
  * @method movePath
  * @param {Object} path The path to follow.
  * @param {gs.AnimationLoopType} loopType The loop-Type.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {Object[]} effects Optional array of effects executed during the path-movement like playing a sound.
   */

  Component_Animator.prototype.movePath = function(path, loopType, duration, easingType, effects) {
    var c;
    c = this.object.findComponent("Component_PathAnimation");
    if (c != null) {
      c.loopType = loopType;
    } else {
      this.object.addComponent(this.pathAnimation);
      this.pathAnimation.start(path, loopType, duration, easingType, effects, this.callback);
    }
    return this.pathAnimation;
  };


  /**
  * Scrolls the game object with a specified speed.
  *
  * @method scroll
  * @param {number} speedX The speed on x-axis in pixels per frame.
  * @param {number} speedY The speed on y-axis in pixels per frame.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type used for the animation.
   */

  Component_Animator.prototype.scroll = function(speedX, speedY, duration, easingType) {
    this.object.addComponent(this.moveAnimation);
    this.moveAnimation.scroll(speedX, speedY, duration, easingType, this.callback);
    return this.moveAnimation;
  };


  /**
  * Scrolls the game object to a specified position.
  *
  * @method scrollTo
  * @param {number} x The x-coordinate of the position.
  * @param {number} y The y-coordinate of the position.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.scrollTo = function(x, y, duration, easingType) {
    this.object.addComponent(this.moveAnimation);
    this.moveAnimation.scrollTo(x, y, duration, easingType, this.callback);
    return this.moveAnimation;
  };


  /**
  * Scrolls the game object along a path.
  *
  * @method scrollPath
  * @param {Object} path The path to follow.
  * @param {gs.AnimationLoopType} loopType The loop-Type.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.scrollPath = function(path, loopType, duration, easingType) {
    this.object.addComponent(this.pathAnimation);
    this.pathAnimation.scroll(path, loopType, duration, easingType, this.callback);
    return this.pathAnimation;
  };


  /**
  * Zooms a game object to specified size.
  *
  * @method zoomTo
  * @param {number} x The x-axis zoom-factor.
  * @param {number} y The y-axis zoom-factor.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.zoomTo = function(x, y, duration, easingType) {
    this.object.addComponent(this.zoomAnimation);
    this.zoomAnimation.start(x, y, duration, easingType, this.callback);
    return this.zoomAnimation;
  };


  /**
  * Blends a game object to specified opacity.
  *
  * @method blendTo
  * @param {number} opacity The target opacity.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {function} [callback] An optional callback called if blending is finished.
   */

  Component_Animator.prototype.blendTo = function(opacity, duration, easingType, callback) {
    this.blendAnimation.stop();
    this.object.addComponent(this.blendAnimation);
    this.blendAnimation.start(opacity, duration, easingType, gs.CallBack("onBlendFinish", this, callback));
    return this.blendAnimation;
  };


  /**
  * Animates a Live2D model parameter of a Live2D game object to a specified value.
  *
  * @method blendTo
  * @param {string} param The name of the parameter to animate.
  * @param {number} value The target value.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {function} [callback] An optional callback called if blending is finished.
   */

  Component_Animator.prototype.l2dParameterTo = function(param, value, duration, easingType, callback) {
    this.object.addComponent(this.l2dAnimation);
    this.l2dAnimation.start(param, value, duration, easingType, gs.CallBack("onBlendFinish", this, callback));
    return this.l2dAnimation;
  };


  /**
  * Blurs a game object to specified blur-power.
  *
  * @method blurTo
  * @param {number} power The target blur-power.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.blurTo = function(power, duration, easingType) {
    this.object.addComponent(this.blurAnimation);
    this.blurAnimation.start(power, duration, easingType);
    return this.blurAnimation;
  };


  /**
  * Pixelates a game object to specified pixel-size/block-size
  *
  * @method pixelateTo
  * @param {number} width - The target block-width
  * @param {number} height - The target block-height
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.pixelateTo = function(width, height, duration, easingType) {
    this.object.addComponent(this.pixelateAnimation);
    this.pixelateAnimation.start(width, height, duration, easingType);
    return this.pixelateAnimation;
  };


  /**
  * Wobbles a game object to specified wobble-power and wobble-speed.
  *
  * @method wobbleTo
  * @param {number} power The target wobble-power.
  * @param {number} speed The target wobble-speed.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.wobbleTo = function(power, speed, duration, easingType) {
    this.object.addComponent(this.wobbleAnimation);
    this.wobbleAnimation.start(power, speed, duration, easingType);
    return this.wobbleAnimation;
  };


  /**
  * Colors a game object to a specified target color.
  *
  * @method colorTo
  * @param {Color} color The target color.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.colorTo = function(color, duration, easingType) {
    this.object.addComponent(this.colorAnimation);
    this.colorAnimation.start(color, duration, easingType, this.callback);
    return this.colorAnimation;
  };


  /**
  * An image animation runs from left to right using the game object's
  * image-property.
  *
  * @method changeImages
  * @param {Array} images An array of image names.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.changeImages = function(images, duration, easingType) {
    this.object.addComponent(this.imageAnimation);
    this.imageAnimation.start(images, duration, easingType, this.callback);
    return this.imageAnimation;
  };


  /**
  * A frame animation which modifies the game object's srcRect property
  * a play an animation.
  *
  * @method changeFrames
  * @param {gs.Rect[]} frames An array of source rectangles (frames).
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */


  /**
  * A frame animation which modifies the game object's srcRect property
  * a play an animation.
  *
  * @method playAnimation
  * @param {gs.Rect[]} frames An array of source rectangles (frames).
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.playAnimation = function(animationRecord) {
    this.frameAnimation.refresh(animationRecord);
    this.object.addComponent(this.frameAnimation);
    this.frameAnimation.start(this.callback);
    return this.frameAnimation;
  };


  /**
  * Changes a field of the game object to a specified value.
  *
  * @method change
  * @param {number} Value The target value.
  * @param {string} field The name of the field/property.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.change = function(value, field, duration, easingType) {
    this.object.addComponent(this.fieldAnimation);
    this.fieldAnimation.start(value, field, duration, easingType, this.callback);
    return this.fieldAnimation;
  };


  /**
  * Shakes the game object horizontally using the game object's offset-property.
  *
  * @method shake
  * @param {gs.Range} range The horizontal shake-range.
  * @param {number} speed The shake speed.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.shake = function(range, speed, duration, easing) {
    this.object.addComponent(this.shakeAnimation);
    this.shakeAnimation.start(range, speed, duration, easing, this.callback);
    return this.shakeAnimation;
  };


  /**
  * Tints the game object to a specified tone.
  *
  * @method tintTo
  * @param {Tone} tone The target tone.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.tintTo = function(tone, duration, easingType) {
    this.object.addComponent(this.tintAnimation);
    this.tintAnimation.start(tone, duration, easingType, this.callback);
    return this.tintAnimation;
  };


  /**
  * Rotates the game object around its anchor-point.
  *
  * @method rotate
  * @param {gs.RotationDirection} direction The rotation-direction.
  * @param {number} speed The rotation speed in degrees per frame.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.rotate = function(direction, speed, duration, easingType) {
    this.object.addComponent(this.rotateAnimation);
    this.rotateAnimation.rotate(direction, speed, duration, easingType, this.callback);
    return this.rotateAnimation;
  };


  /**
  * Rotates the game object around its anchor-point to a specified angle.
  *
  * @method rotateTo
  * @param {number} angle The target angle.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
   */

  Component_Animator.prototype.rotateTo = function(angle, duration, easingType) {
    this.object.addComponent(this.rotateAnimation);
    this.rotateAnimation.rotateTo(angle, duration, easingType, this.callback);
    return this.rotateAnimation;
  };


  /**
  * Lets a game object appear on screen using a masking-effect.
  *
  * @method maskIn
  * @param {gs.Mask} mask The mask used for the animation.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {function} [callback] An optional callback-function called when the animation is finished.
   */

  Component_Animator.prototype.maskIn = function(mask, duration, easing, callback) {
    this.object.addComponent(this.maskAnimation);
    this.maskAnimation.maskIn(mask, duration, easing, function(object, animation) {
      object.removeComponent(animation);
      return typeof callback === "function" ? callback(object) : void 0;
    });
    return this.maskAnimation;
  };


  /**
  * Description follows...
  *
  * @method maskTo
  * @param {gs.Mask} mask The mask used for the animation.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {function} [callback] An optional callback-function called when the animation is finished.
   */

  Component_Animator.prototype.maskTo = function(mask, duration, easing, callback) {
    this.object.addComponent(this.maskAnimation);
    this.maskAnimation.maskTo(mask, duration, easing, function(object, animation) {
      object.removeComponent(animation);
      return typeof callback === "function" ? callback(object) : void 0;
    });
    return this.maskAnimation;
  };


  /**
  * Lets a game object disappear from screen using a masking-effect.
  *
  * @method maskOut
  * @param {gs.Mask} mask The mask used for the animation.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {function} [callback] An optional callback-function called when the animation is finished.
   */

  Component_Animator.prototype.maskOut = function(mask, duration, easing, callback) {
    this.object.addComponent(this.maskAnimation);
    this.maskAnimation.maskOut(mask, duration, easing, function(object, animation) {
      object.removeComponent(animation);
      return typeof callback === "function" ? callback(object) : void 0;
    });
    return this.maskAnimation;
  };


  /**
  * Lets a game object appear on screen from left, top, right or bottom using 
  * a move-animation
  *
  * @method moveIn
  * @param {number} x The x-coordinate of the target-position.
  * @param {number} y The y-coordinate of the target-position.
  * @param {number} type The movement-direction from where the game object should move-in.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {function} [callback] An optional callback-function called when the animation is finished.
   */

  Component_Animator.prototype.moveIn = function(x, y, type, duration, easing, callback) {
    this.object.addComponent(this.moveAnimation);
    this.moveAnimation.moveIn(x, y, type, duration, easing, function(object, animation) {
      object.removeComponent(animation);
      return typeof callback === "function" ? callback(object) : void 0;
    });
    return this.moveAnimation;
  };


  /**
  * Lets a game object disappear from screen to the left, top, right or bottom using 
  * a move-animation
  *
  * @method moveOut
  * @param {number} type The movement-direction in which the game object should move-out.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {function} [callback] An optional callback-function called when the animation is finished.
   */

  Component_Animator.prototype.moveOut = function(type, duration, easing, callback) {
    this.object.addComponent(this.moveAnimation);
    this.moveAnimation.moveOut(type, duration, easing, function(object, animation) {
      object.removeComponent(animation);
      return typeof callback === "function" ? callback(object) : void 0;
    });
    return this.moveAnimation;
  };


  /**
  * Lets a game object appear on screen using blending.
  *
  * @method show
  * @param {number} duration The duration in frames.
  * @param {Object} easing The easing-type.
  * @param {function} [callback] An optional callback-function called when the animation is finished.
   */

  Component_Animator.prototype.show = function(duration, easing, callback) {
    var ref;
    this.object.opacity = 0;
    if (duration > 0) {
      if ((ref = this.object.visual) != null) {
        ref.update();
      }
    }
    return this.blendTo(255, duration, easing, callback);
  };


  /**
  * Lets a game object disappear from screen using blending.
  *
  * @method hide
  * @param {number} duration The duration in frames.
  * @param {Object} easing The easing-type.
  * @param {function} [callback] An optional callback-function called when the animation is finished.
   */

  Component_Animator.prototype.hide = function(duration, easing, callback) {
    return this.blendTo(0, duration, easing, callback);
  };


  /**
  * Changes visible-property to true. This method is deprecated.
  * 
  * @method open
  * @deprecated
   */

  Component_Animator.prototype.open = function() {
    return this.object.visible = true;
  };


  /**
  * Changes visible-property to false. This method is deprecated.
  * 
  * @method close
  * @deprecated
   */

  Component_Animator.prototype.close = function() {
    return this.object.visible = false;
  };


  /**
  * Flashes the game object.
  *
  * @method flash
  * @param {Color} color The flash-color.
  * @param {number} duration The duration in frames.
   */

  Component_Animator.prototype.flash = function(color, duration) {
    this.object.color = color;
    color = new Color(color);
    color.alpha = 0;
    return this.colorTo(color, duration, gs.Easings.EASE_LINEAR[gs.EasingTypes.EASE_IN]);
  };


  /**
  * Lets a game object appear on screen using a specified animation.
  *
  * @method appear
  * @param {number} x The x-coordinate of the target-position.
  * @param {number} y The y-coordinate of the target-position.
  * @param {gs.AppearAnimationInfo} animation The animation info-object.
  * @param {Object} easing The easing-type.
  * @param {number} duration The duration in frames.
  * @param {function} [callback] An optional callback-function called when the animation is finished.
   */

  Component_Animator.prototype.appear = function(x, y, animation, easing, duration, callback) {
    easing = easing || gs.Easings.EASE_LINEAR[gs.EasingTypes.EASE_IN];
    this.object.visible = true;
    if (animation.type === gs.AnimationTypes.MOVEMENT) {
      return this.moveIn(x, y, animation.movement, duration, easing, callback);
    } else if (animation.type === gs.AnimationTypes.MASKING) {
      return this.maskIn(animation.mask, duration, easing, callback);
    } else {
      return this.show(duration, easing, callback);
    }
  };


  /**
  * Lets a game object disappear from screen using a specified animation.
  *
  * @method disappear
  * @param {gs.AppearAnimationInfo} animation The animation info-object.
  * @param {Object} easing The easing-type.
  * @param {number} duration The duration in frames.
  * @param {function} [callback] An optional callback-function called when the animation is finished.
   */

  Component_Animator.prototype.disappear = function(animation, easing, duration, callback) {
    this.object.visible = true;
    if (animation.type === gs.AnimationTypes.MOVEMENT) {
      return this.moveOut(animation.movement, duration, easing, callback);
    } else if (animation.type === gs.AnimationTypes.MASKING) {
      return this.maskOut(animation.mask, duration, easing, callback);
    } else {
      return this.hide(duration, easing, callback);
    }
  };

  return Component_Animator;

})(gs.Component);

gs.Animator = Component_Animator;

gs.Component_Animator = Component_Animator;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsa0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7O0VBV2EsNEJBQUE7SUFDVCxxREFBQSxTQUFBO0lBRUEsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxFQUFFLENBQUMsdUJBQUgsQ0FBQTtJQUNyQixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLEVBQUUsQ0FBQyx1QkFBSCxDQUFBO0lBQ3JCLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsRUFBRSxDQUFDLHVCQUFILENBQUE7SUFDckIsSUFBQyxDQUFBLGNBQUQsR0FBc0IsSUFBQSxFQUFFLENBQUMsd0JBQUgsQ0FBQTtJQUN0QixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLEVBQUUsQ0FBQyx1QkFBSCxDQUFBO0lBQ3JCLElBQUMsQ0FBQSxpQkFBRCxHQUF5QixJQUFBLEVBQUUsQ0FBQywyQkFBSCxDQUFBO0lBQ3pCLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsRUFBRSxDQUFDLHlCQUFILENBQUE7SUFDdkIsSUFBQyxDQUFBLGNBQUQsR0FBc0IsSUFBQSxFQUFFLENBQUMsd0JBQUgsQ0FBQTtJQUN0QixJQUFDLENBQUEsY0FBRCxHQUFzQixJQUFBLEVBQUUsQ0FBQyx3QkFBSCxDQUFBO0lBQ3RCLElBQUMsQ0FBQSxjQUFELEdBQXNCLElBQUEsRUFBRSxDQUFDLHdCQUFILENBQUE7SUFDdEIsSUFBQyxDQUFBLGNBQUQsR0FBc0IsSUFBQSxFQUFFLENBQUMsd0JBQUgsQ0FBQTtJQUN0QixJQUFDLENBQUEsY0FBRCxHQUFzQixJQUFBLEVBQUUsQ0FBQyx3QkFBSCxDQUFBO0lBQ3RCLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsRUFBRSxDQUFDLHVCQUFILENBQUE7SUFDckIsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxFQUFFLENBQUMseUJBQUgsQ0FBQTtJQUN2QixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLEVBQUUsQ0FBQyx1QkFBSCxDQUFBO0lBQ3JCLElBQUMsQ0FBQSxZQUFELEdBQW9CLElBQUEsRUFBRSxDQUFDLHlCQUFILENBQUE7O0FBRXBCOzs7Ozs7SUFNQSxJQUFDLENBQUEsUUFBRCxHQUFZLFNBQUMsTUFBRCxFQUFTLFNBQVQ7YUFBdUIsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsU0FBdkI7SUFBdkI7SUFFWixJQUFDLENBQUEsYUFBRCxHQUFpQixTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLFFBQXBCO01BQ2IsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsU0FBdkI7OENBQ0EsU0FBVTtJQUZHO0VBNUJSOztFQWlDYixrQkFBQyxDQUFBLFNBQUQsQ0FBVyxhQUFYLEVBQTBCO0lBQUEsR0FBQSxFQUFLLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSjs7QUFDL0I7Ozs7T0FEMEI7R0FBMUI7OytCQU1BLE1BQUEsR0FBUSxTQUFBO0FBQ0osUUFBQTtJQUFBLGdEQUFBLFNBQUE7SUFFQSxJQUFHLDhHQUFIO2FBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQXBCLENBQUEsRUFESjs7RUFISTs7O0FBTVI7Ozs7Ozs7Ozs7K0JBU0EsSUFBQSxHQUFNLFNBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsUUFBakIsRUFBMkIsVUFBM0I7SUFDRixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsSUFBQyxDQUFBLGFBQXRCO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CLE1BQXBCLEVBQTRCLE1BQTVCLEVBQW9DLFFBQXBDLEVBQThDLFVBQTlDLEVBQTBELElBQUMsQ0FBQSxRQUEzRDtBQUVBLFdBQU8sSUFBQyxDQUFBO0VBSk47OztBQU1OOzs7Ozs7Ozs7OytCQVNBLE1BQUEsR0FBUSxTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sUUFBUCxFQUFpQixVQUFqQjtJQUNKLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixJQUFDLENBQUEsYUFBdEI7SUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsQ0FBdEIsRUFBeUIsQ0FBekIsRUFBNEIsUUFBNUIsRUFBc0MsVUFBdEMsRUFBa0QsSUFBQyxDQUFBLFFBQW5EO0FBRUEsV0FBTyxJQUFDLENBQUE7RUFKSjs7O0FBTVI7Ozs7Ozs7Ozs7OytCQVVBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLFFBQWpCLEVBQTJCLFVBQTNCLEVBQXVDLE9BQXZDO0FBQ04sUUFBQTtJQUFBLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBc0IseUJBQXRCO0lBRUosSUFBRyxTQUFIO01BQ0ksQ0FBQyxDQUFDLFFBQUYsR0FBYSxTQURqQjtLQUFBLE1BQUE7TUFHSSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsSUFBQyxDQUFBLGFBQXRCO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQXFCLElBQXJCLEVBQTJCLFFBQTNCLEVBQXFDLFFBQXJDLEVBQStDLFVBQS9DLEVBQTJELE9BQTNELEVBQW9FLElBQUMsQ0FBQSxRQUFyRSxFQUpKOztBQU1BLFdBQU8sSUFBQyxDQUFBO0VBVEY7OztBQVdWOzs7Ozs7Ozs7OytCQVNBLE1BQUEsR0FBUSxTQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLFFBQWpCLEVBQTJCLFVBQTNCO0lBQ0osSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxhQUF0QjtJQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixNQUF0QixFQUE4QixNQUE5QixFQUFzQyxRQUF0QyxFQUFnRCxVQUFoRCxFQUE0RCxJQUFDLENBQUEsUUFBN0Q7QUFFQSxXQUFPLElBQUMsQ0FBQTtFQUpKOzs7QUFNUjs7Ozs7Ozs7OzsrQkFTQSxRQUFBLEdBQVUsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLFFBQVAsRUFBaUIsVUFBakI7SUFDTixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsSUFBQyxDQUFBLGFBQXRCO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxRQUFmLENBQXdCLENBQXhCLEVBQTJCLENBQTNCLEVBQThCLFFBQTlCLEVBQXdDLFVBQXhDLEVBQW9ELElBQUMsQ0FBQSxRQUFyRDtBQUVBLFdBQU8sSUFBQyxDQUFBO0VBSkY7OztBQU1WOzs7Ozs7Ozs7OytCQVNBLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLFFBQWpCLEVBQTJCLFVBQTNCO0lBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxhQUF0QjtJQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixJQUF0QixFQUE0QixRQUE1QixFQUFzQyxRQUF0QyxFQUFnRCxVQUFoRCxFQUE0RCxJQUFDLENBQUEsUUFBN0Q7QUFFQSxXQUFPLElBQUMsQ0FBQTtFQUpBOzs7QUFPWjs7Ozs7Ozs7OzsrQkFTQSxNQUFBLEdBQVEsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLFFBQVAsRUFBaUIsVUFBakI7SUFDSixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsSUFBQyxDQUFBLGFBQXRCO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQXFCLENBQXJCLEVBQXdCLENBQXhCLEVBQTJCLFFBQTNCLEVBQXFDLFVBQXJDLEVBQWlELElBQUMsQ0FBQSxRQUFsRDtBQUVBLFdBQU8sSUFBQyxDQUFBO0VBSko7OztBQU9SOzs7Ozs7Ozs7OytCQVNBLE9BQUEsR0FBUyxTQUFDLE9BQUQsRUFBVSxRQUFWLEVBQW9CLFVBQXBCLEVBQWdDLFFBQWhDO0lBQ0wsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFBO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxjQUF0QjtJQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsS0FBaEIsQ0FBc0IsT0FBdEIsRUFBK0IsUUFBL0IsRUFBeUMsVUFBekMsRUFBcUQsRUFBRSxDQUFDLFFBQUgsQ0FBWSxlQUFaLEVBQTZCLElBQTdCLEVBQW1DLFFBQW5DLENBQXJEO0FBRUEsV0FBTyxJQUFDLENBQUE7RUFMSDs7O0FBT1Q7Ozs7Ozs7Ozs7OytCQVVBLGNBQUEsR0FBZ0IsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLFFBQWYsRUFBeUIsVUFBekIsRUFBcUMsUUFBckM7SUFDWixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsSUFBQyxDQUFBLFlBQXRCO0lBQ0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxLQUFkLENBQW9CLEtBQXBCLEVBQTJCLEtBQTNCLEVBQWtDLFFBQWxDLEVBQTRDLFVBQTVDLEVBQXdELEVBQUUsQ0FBQyxRQUFILENBQVksZUFBWixFQUE2QixJQUE3QixFQUFtQyxRQUFuQyxDQUF4RDtBQUVBLFdBQU8sSUFBQyxDQUFBO0VBSkk7OztBQU1oQjs7Ozs7Ozs7OytCQVFBLE1BQUEsR0FBUSxTQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLFVBQWxCO0lBQ0osSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxhQUF0QjtJQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUFxQixLQUFyQixFQUE0QixRQUE1QixFQUFzQyxVQUF0QztBQUVBLFdBQU8sSUFBQyxDQUFBO0VBSko7OztBQU1SOzs7Ozs7Ozs7OytCQVNBLFVBQUEsR0FBWSxTQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLFFBQWhCLEVBQTBCLFVBQTFCO0lBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxpQkFBdEI7SUFDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsS0FBbkIsQ0FBeUIsS0FBekIsRUFBZ0MsTUFBaEMsRUFBd0MsUUFBeEMsRUFBa0QsVUFBbEQ7QUFFQSxXQUFPLElBQUMsQ0FBQTtFQUpBOzs7QUFNWjs7Ozs7Ozs7OzsrQkFTQSxRQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLFFBQWYsRUFBeUIsVUFBekI7SUFDTixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsSUFBQyxDQUFBLGVBQXRCO0lBQ0EsSUFBQyxDQUFBLGVBQWUsQ0FBQyxLQUFqQixDQUF1QixLQUF2QixFQUE4QixLQUE5QixFQUFxQyxRQUFyQyxFQUErQyxVQUEvQztBQUVBLFdBQU8sSUFBQyxDQUFBO0VBSkY7OztBQU1WOzs7Ozs7Ozs7K0JBUUEsT0FBQSxHQUFTLFNBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsVUFBbEI7SUFDTCxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsSUFBQyxDQUFBLGNBQXRCO0lBQ0EsSUFBQyxDQUFBLGNBQWMsQ0FBQyxLQUFoQixDQUFzQixLQUF0QixFQUE2QixRQUE3QixFQUF1QyxVQUF2QyxFQUFtRCxJQUFDLENBQUEsUUFBcEQ7QUFFQSxXQUFPLElBQUMsQ0FBQTtFQUpIOzs7QUFNVDs7Ozs7Ozs7OzsrQkFTQSxZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixVQUFuQjtJQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixJQUFDLENBQUEsY0FBdEI7SUFDQSxJQUFDLENBQUEsY0FBYyxDQUFDLEtBQWhCLENBQXNCLE1BQXRCLEVBQThCLFFBQTlCLEVBQXdDLFVBQXhDLEVBQW9ELElBQUMsQ0FBQSxRQUFyRDtBQUVBLFdBQU8sSUFBQyxDQUFBO0VBSkU7OztBQU1kOzs7Ozs7Ozs7OztBQWNBOzs7Ozs7Ozs7OytCQVNBLGFBQUEsR0FBZSxTQUFDLGVBQUQ7SUFDWCxJQUFDLENBQUEsY0FBYyxDQUFDLE9BQWhCLENBQXdCLGVBQXhCO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxjQUF0QjtJQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsS0FBaEIsQ0FBc0IsSUFBQyxDQUFBLFFBQXZCO0FBRUEsV0FBTyxJQUFDLENBQUE7RUFMRzs7O0FBT2Y7Ozs7Ozs7Ozs7K0JBU0EsTUFBQSxHQUFRLFNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxRQUFmLEVBQXlCLFVBQXpCO0lBQ0osSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxjQUF0QjtJQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsS0FBaEIsQ0FBc0IsS0FBdEIsRUFBNkIsS0FBN0IsRUFBb0MsUUFBcEMsRUFBOEMsVUFBOUMsRUFBMEQsSUFBQyxDQUFBLFFBQTNEO0FBRUEsV0FBTyxJQUFDLENBQUE7RUFKSjs7O0FBTVI7Ozs7Ozs7Ozs7K0JBU0EsS0FBQSxHQUFPLFNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxRQUFmLEVBQXlCLE1BQXpCO0lBQ0gsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxjQUF0QjtJQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsS0FBaEIsQ0FBc0IsS0FBdEIsRUFBNkIsS0FBN0IsRUFBb0MsUUFBcEMsRUFBOEMsTUFBOUMsRUFBc0QsSUFBQyxDQUFBLFFBQXZEO0FBRUEsV0FBTyxJQUFDLENBQUE7RUFKTDs7O0FBTVA7Ozs7Ozs7OzsrQkFRQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixVQUFqQjtJQUNKLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixJQUFDLENBQUEsYUFBdEI7SUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsQ0FBcUIsSUFBckIsRUFBMkIsUUFBM0IsRUFBcUMsVUFBckMsRUFBaUQsSUFBQyxDQUFBLFFBQWxEO0FBRUEsV0FBTyxJQUFDLENBQUE7RUFKSjs7O0FBTVI7Ozs7Ozs7Ozs7K0JBU0EsTUFBQSxHQUFRLFNBQUMsU0FBRCxFQUFZLEtBQVosRUFBbUIsUUFBbkIsRUFBNkIsVUFBN0I7SUFDSixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsSUFBQyxDQUFBLGVBQXRCO0lBQ0EsSUFBQyxDQUFBLGVBQWUsQ0FBQyxNQUFqQixDQUF3QixTQUF4QixFQUFtQyxLQUFuQyxFQUEwQyxRQUExQyxFQUFvRCxVQUFwRCxFQUFnRSxJQUFDLENBQUEsUUFBakU7QUFFQSxXQUFPLElBQUMsQ0FBQTtFQUpKOzs7QUFNUjs7Ozs7Ozs7OytCQVFBLFFBQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLFVBQWxCO0lBQ04sSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxlQUF0QjtJQUNBLElBQUMsQ0FBQSxlQUFlLENBQUMsUUFBakIsQ0FBMEIsS0FBMUIsRUFBaUMsUUFBakMsRUFBMkMsVUFBM0MsRUFBdUQsSUFBQyxDQUFBLFFBQXhEO0FBRUEsV0FBTyxJQUFDLENBQUE7RUFKRjs7O0FBTVY7Ozs7Ozs7Ozs7K0JBU0EsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsTUFBakIsRUFBeUIsUUFBekI7SUFDSixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsSUFBQyxDQUFBLGFBQXRCO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQXNCLElBQXRCLEVBQTRCLFFBQTVCLEVBQXNDLE1BQXRDLEVBQThDLFNBQUMsTUFBRCxFQUFTLFNBQVQ7TUFBdUIsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsU0FBdkI7OENBQW1DLFNBQVU7SUFBcEUsQ0FBOUM7QUFFQSxXQUFPLElBQUMsQ0FBQTtFQUpKOzs7QUFNUjs7Ozs7Ozs7OzsrQkFTQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixNQUFqQixFQUF5QixRQUF6QjtJQUNKLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixJQUFDLENBQUEsYUFBdEI7SUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsSUFBdEIsRUFBNEIsUUFBNUIsRUFBc0MsTUFBdEMsRUFBOEMsU0FBQyxNQUFELEVBQVMsU0FBVDtNQUF1QixNQUFNLENBQUMsZUFBUCxDQUF1QixTQUF2Qjs4Q0FBbUMsU0FBVTtJQUFwRSxDQUE5QztBQUVBLFdBQU8sSUFBQyxDQUFBO0VBSko7OztBQU1SOzs7Ozs7Ozs7OytCQVNBLE9BQUEsR0FBUyxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE1BQWpCLEVBQXlCLFFBQXpCO0lBQ0wsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxhQUF0QjtJQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUF1QixJQUF2QixFQUE2QixRQUE3QixFQUF1QyxNQUF2QyxFQUErQyxTQUFDLE1BQUQsRUFBUyxTQUFUO01BQXVCLE1BQU0sQ0FBQyxlQUFQLENBQXVCLFNBQXZCOzhDQUFtQyxTQUFVO0lBQXBFLENBQS9DO0FBRUEsV0FBTyxJQUFDLENBQUE7RUFKSDs7O0FBTVQ7Ozs7Ozs7Ozs7Ozs7K0JBWUEsTUFBQSxHQUFRLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxJQUFQLEVBQWEsUUFBYixFQUF1QixNQUF2QixFQUErQixRQUEvQjtJQUNKLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixJQUFDLENBQUEsYUFBdEI7SUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsQ0FBdEIsRUFBeUIsQ0FBekIsRUFBNEIsSUFBNUIsRUFBa0MsUUFBbEMsRUFBNEMsTUFBNUMsRUFBb0QsU0FBQyxNQUFELEVBQVMsU0FBVDtNQUNoRCxNQUFNLENBQUMsZUFBUCxDQUF1QixTQUF2Qjs4Q0FDQSxTQUFVO0lBRnNDLENBQXBEO0FBSUEsV0FBTyxJQUFDLENBQUE7RUFOSjs7O0FBUVI7Ozs7Ozs7Ozs7OytCQVVBLE9BQUEsR0FBUyxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE1BQWpCLEVBQXlCLFFBQXpCO0lBQ0wsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLElBQUMsQ0FBQSxhQUF0QjtJQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUF1QixJQUF2QixFQUE2QixRQUE3QixFQUF1QyxNQUF2QyxFQUErQyxTQUFDLE1BQUQsRUFBUyxTQUFUO01BQzNDLE1BQU0sQ0FBQyxlQUFQLENBQXVCLFNBQXZCOzhDQUNBLFNBQVU7SUFGaUMsQ0FBL0M7QUFLQSxXQUFPLElBQUMsQ0FBQTtFQVBIOzs7QUFTVDs7Ozs7Ozs7OytCQVFBLElBQUEsR0FBTSxTQUFDLFFBQUQsRUFBVyxNQUFYLEVBQW1CLFFBQW5CO0FBQ0YsUUFBQTtJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixHQUFrQjtJQUNsQixJQUFHLFFBQUEsR0FBVyxDQUFkOztXQUNrQixDQUFFLE1BQWhCLENBQUE7T0FESjs7QUFHQSxXQUFPLElBQUMsQ0FBQSxPQUFELENBQVMsR0FBVCxFQUFjLFFBQWQsRUFBd0IsTUFBeEIsRUFBZ0MsUUFBaEM7RUFMTDs7O0FBT047Ozs7Ozs7OzsrQkFRQSxJQUFBLEdBQU0sU0FBQyxRQUFELEVBQVcsTUFBWCxFQUFtQixRQUFuQjtBQUNGLFdBQU8sSUFBQyxDQUFBLE9BQUQsQ0FBUyxDQUFULEVBQVksUUFBWixFQUFzQixNQUF0QixFQUE4QixRQUE5QjtFQURMOzs7QUFHTjs7Ozs7OzsrQkFNQSxJQUFBLEdBQU0sU0FBQTtXQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixHQUFrQjtFQUFyQjs7O0FBRU47Ozs7Ozs7K0JBTUEsS0FBQSxHQUFPLFNBQUE7V0FBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsR0FBa0I7RUFBckI7OztBQUVQOzs7Ozs7OzsrQkFPQSxLQUFBLEdBQU8sU0FBQyxLQUFELEVBQVEsUUFBUjtJQUNILElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixHQUFnQjtJQUNoQixLQUFBLEdBQVksSUFBQSxLQUFBLENBQU0sS0FBTjtJQUNaLEtBQUssQ0FBQyxLQUFOLEdBQWM7QUFDZCxXQUFPLElBQUMsQ0FBQSxPQUFELENBQVMsS0FBVCxFQUFnQixRQUFoQixFQUEwQixFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVksQ0FBQSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQWYsQ0FBakQ7RUFKSjs7O0FBTVA7Ozs7Ozs7Ozs7OzsrQkFXQSxNQUFBLEdBQVEsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLFNBQVAsRUFBa0IsTUFBbEIsRUFBMEIsUUFBMUIsRUFBb0MsUUFBcEM7SUFDSixNQUFBLEdBQVMsTUFBQSxJQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBWSxDQUFBLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBZjtJQUMxQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsR0FBa0I7SUFFbEIsSUFBRyxTQUFTLENBQUMsSUFBVixLQUFrQixFQUFFLENBQUMsY0FBYyxDQUFDLFFBQXZDO2FBQ0ksSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLFNBQVMsQ0FBQyxRQUF4QixFQUFrQyxRQUFsQyxFQUE0QyxNQUE1QyxFQUFvRCxRQUFwRCxFQURKO0tBQUEsTUFFSyxJQUFHLFNBQVMsQ0FBQyxJQUFWLEtBQWtCLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBdkM7YUFDRCxJQUFDLENBQUEsTUFBRCxDQUFRLFNBQVMsQ0FBQyxJQUFsQixFQUF3QixRQUF4QixFQUFrQyxNQUFsQyxFQUEwQyxRQUExQyxFQURDO0tBQUEsTUFBQTthQUdELElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUFnQixNQUFoQixFQUF3QixRQUF4QixFQUhDOztFQU5EOzs7QUFXUjs7Ozs7Ozs7OzsrQkFTQSxTQUFBLEdBQVcsU0FBQyxTQUFELEVBQVksTUFBWixFQUFvQixRQUFwQixFQUE4QixRQUE5QjtJQUNQLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixHQUFrQjtJQUNsQixJQUFHLFNBQVMsQ0FBQyxJQUFWLEtBQWtCLEVBQUUsQ0FBQyxjQUFjLENBQUMsUUFBdkM7YUFDSSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQVMsQ0FBQyxRQUFuQixFQUE2QixRQUE3QixFQUF1QyxNQUF2QyxFQUErQyxRQUEvQyxFQURKO0tBQUEsTUFFSyxJQUFHLFNBQVMsQ0FBQyxJQUFWLEtBQWtCLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBdkM7YUFDRCxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQVMsQ0FBQyxJQUFuQixFQUF5QixRQUF6QixFQUFtQyxNQUFuQyxFQUEyQyxRQUEzQyxFQURDO0tBQUEsTUFBQTthQUdELElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUFnQixNQUFoQixFQUF3QixRQUF4QixFQUhDOztFQUpFOzs7O0dBcGlCa0IsRUFBRSxDQUFDOztBQThpQnBDLEVBQUUsQ0FBQyxRQUFILEdBQWM7O0FBQ2QsRUFBRSxDQUFDLGtCQUFILEdBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfQW5pbWF0b3JcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9BbmltYXRvciBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICMjIypcbiAgICAqIEFuIGFuaW1hdG9yLWNvbXBvbmVudCBhbGxvd3MgdG8gZXhlY3V0ZSBkaWZmZXJlbnQga2luZCBvZiBhbmltYXRpb25zIFxuICAgICogb24gYSBnYW1lIG9iamVjdC4gVGhlIGFuaW1hdGlvbnMgYXJlIHVzaW5nIHRoZSBnYW1lIG9iamVjdCdzIFxuICAgICogZHN0UmVjdCAmIG9mZnNldC1wcm9wZXJ0eSB0byBleGVjdXRlLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfQW5pbWF0b3JcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIEBtb3ZlQW5pbWF0aW9uID0gbmV3IGdzLkNvbXBvbmVudF9Nb3ZlQW5pbWF0aW9uKClcbiAgICAgICAgQHBhdGhBbmltYXRpb24gPSBuZXcgZ3MuQ29tcG9uZW50X1BhdGhBbmltYXRpb24oKVxuICAgICAgICBAem9vbUFuaW1hdGlvbiA9IG5ldyBncy5Db21wb25lbnRfWm9vbUFuaW1hdGlvbigpXG4gICAgICAgIEBibGVuZEFuaW1hdGlvbiA9IG5ldyBncy5Db21wb25lbnRfQmxlbmRBbmltYXRpb24oKVxuICAgICAgICBAYmx1ckFuaW1hdGlvbiA9IG5ldyBncy5Db21wb25lbnRfQmx1ckFuaW1hdGlvbigpXG4gICAgICAgIEBwaXhlbGF0ZUFuaW1hdGlvbiA9IG5ldyBncy5Db21wb25lbnRfUGl4ZWxhdGVBbmltYXRpb24oKVxuICAgICAgICBAd29iYmxlQW5pbWF0aW9uID0gbmV3IGdzLkNvbXBvbmVudF9Xb2JibGVBbmltYXRpb24oKVxuICAgICAgICBAY29sb3JBbmltYXRpb24gPSBuZXcgZ3MuQ29tcG9uZW50X0NvbG9yQW5pbWF0aW9uKClcbiAgICAgICAgQGltYWdlQW5pbWF0aW9uID0gbmV3IGdzLkNvbXBvbmVudF9JbWFnZUFuaW1hdGlvbigpXG4gICAgICAgIEBmcmFtZUFuaW1hdGlvbiA9IG5ldyBncy5Db21wb25lbnRfRnJhbWVBbmltYXRpb24oKVxuICAgICAgICBAZmllbGRBbmltYXRpb24gPSBuZXcgZ3MuQ29tcG9uZW50X0ZpZWxkQW5pbWF0aW9uKClcbiAgICAgICAgQHNoYWtlQW5pbWF0aW9uID0gbmV3IGdzLkNvbXBvbmVudF9TaGFrZUFuaW1hdGlvbigpXG4gICAgICAgIEB0aW50QW5pbWF0aW9uID0gbmV3IGdzLkNvbXBvbmVudF9UaW50QW5pbWF0aW9uKClcbiAgICAgICAgQHJvdGF0ZUFuaW1hdGlvbiA9IG5ldyBncy5Db21wb25lbnRfUm90YXRlQW5pbWF0aW9uKClcbiAgICAgICAgQG1hc2tBbmltYXRpb24gPSBuZXcgZ3MuQ29tcG9uZW50X01hc2tBbmltYXRpb24oKVxuICAgICAgICBAbDJkQW5pbWF0aW9uID0gbmV3IGdzLkNvbXBvbmVudF9MaXZlMkRBbmltYXRpb24oKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0YW5kYXJkIENhbGxiYWNrIFJvdXRpbmVcbiAgICAgICAgKiBAcHJvcGVydHkgY2FsbGJhY2tcbiAgICAgICAgKiBAdHlwZSBmdW5jdGlvblxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAY2FsbGJhY2sgPSAob2JqZWN0LCBhbmltYXRpb24pIC0+IG9iamVjdC5yZW1vdmVDb21wb25lbnQoYW5pbWF0aW9uKVxuICAgICAgICBcbiAgICAgICAgQG9uQmxlbmRGaW5pc2ggPSAob2JqZWN0LCBhbmltYXRpb24sIGNhbGxiYWNrKSAtPiBcbiAgICAgICAgICAgIG9iamVjdC5yZW1vdmVDb21wb25lbnQoYW5pbWF0aW9uKVxuICAgICAgICAgICAgY2FsbGJhY2s/KG9iamVjdClcbiAgICAgICAgXG4gICAgICAgIFxuICAgIEBhY2Nlc3NvcnMgXCJpc0FuaW1hdGluZ1wiLCBnZXQ6IC0+IEBvYmplY3RcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBhbmltYXRvci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QubWFzaz8uc291cmNlPy52aWRlb0VsZW1lbnQ/XG4gICAgICAgICAgICBAb2JqZWN0Lm1hc2suc291cmNlLnVwZGF0ZSgpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIE1vdmVzIHRoZSBnYW1lIG9iamVjdCB3aXRoIGEgc3BlY2lmaWVkIHNwZWVkLlxuICAgICpcbiAgICAqIEBtZXRob2QgbW92ZVxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNwZWVkWCBUaGUgc3BlZWQgb24geC1heGlzIGluIHBpeGVscyBwZXIgZnJhbWUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gc3BlZWRZIFRoZSBzcGVlZCBvbiB5LWF4aXMgaW4gcGl4ZWxzIHBlciBmcmFtZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGVhc2luZ1R5cGUgVGhlIGVhc2luZy10eXBlIHVzZWQgZm9yIHRoZSBhbmltYXRpb24uXG4gICAgIyMjXG4gICAgbW92ZTogKHNwZWVkWCwgc3BlZWRZLCBkdXJhdGlvbiwgZWFzaW5nVHlwZSkgLT5cbiAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQG1vdmVBbmltYXRpb24pXG4gICAgICAgIEBtb3ZlQW5pbWF0aW9uLm1vdmUoc3BlZWRYLCBzcGVlZFksIGR1cmF0aW9uLCBlYXNpbmdUeXBlLCBAY2FsbGJhY2spXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQG1vdmVBbmltYXRpb25cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogTW92ZXMgdGhlIGdhbWUgb2JqZWN0IHRvIGEgc3BlY2lmaWVkIHBvc2l0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgbW92ZVRvXG4gICAgKiBAcGFyYW0ge251bWJlcn0geCBUaGUgeC1jb29yZGluYXRlIG9mIHRoZSBwb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgIyMjICBcbiAgICBtb3ZlVG86ICh4LCB5LCBkdXJhdGlvbiwgZWFzaW5nVHlwZSkgLT5cbiAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQG1vdmVBbmltYXRpb24pXG4gICAgICAgIEBtb3ZlQW5pbWF0aW9uLm1vdmVUbyh4LCB5LCBkdXJhdGlvbiwgZWFzaW5nVHlwZSwgQGNhbGxiYWNrKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEBtb3ZlQW5pbWF0aW9uXG4gICAgXG4gICAgIyMjKlxuICAgICogTW92ZXMgdGhlIGdhbWUgb2JqZWN0IGFsb25nIGEgcGF0aC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG1vdmVQYXRoXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGF0aCBUaGUgcGF0aCB0byBmb2xsb3cuXG4gICAgKiBAcGFyYW0ge2dzLkFuaW1hdGlvbkxvb3BUeXBlfSBsb29wVHlwZSBUaGUgbG9vcC1UeXBlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgKiBAcGFyYW0ge09iamVjdFtdfSBlZmZlY3RzIE9wdGlvbmFsIGFycmF5IG9mIGVmZmVjdHMgZXhlY3V0ZWQgZHVyaW5nIHRoZSBwYXRoLW1vdmVtZW50IGxpa2UgcGxheWluZyBhIHNvdW5kLlxuICAgICMjIyAgXG4gICAgbW92ZVBhdGg6IChwYXRoLCBsb29wVHlwZSwgZHVyYXRpb24sIGVhc2luZ1R5cGUsIGVmZmVjdHMpIC0+XG4gICAgICAgIGMgPSBAb2JqZWN0LmZpbmRDb21wb25lbnQoXCJDb21wb25lbnRfUGF0aEFuaW1hdGlvblwiKVxuICAgICAgICBcbiAgICAgICAgaWYgYz9cbiAgICAgICAgICAgIGMubG9vcFR5cGUgPSBsb29wVHlwZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAcGF0aEFuaW1hdGlvbilcbiAgICAgICAgICAgIEBwYXRoQW5pbWF0aW9uLnN0YXJ0KHBhdGgsIGxvb3BUeXBlLCBkdXJhdGlvbiwgZWFzaW5nVHlwZSwgZWZmZWN0cywgQGNhbGxiYWNrKVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBAcGF0aEFuaW1hdGlvblxuICAgIFxuICAgICMjIypcbiAgICAqIFNjcm9sbHMgdGhlIGdhbWUgb2JqZWN0IHdpdGggYSBzcGVjaWZpZWQgc3BlZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzY3JvbGxcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzcGVlZFggVGhlIHNwZWVkIG9uIHgtYXhpcyBpbiBwaXhlbHMgcGVyIGZyYW1lLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNwZWVkWSBUaGUgc3BlZWQgb24geS1heGlzIGluIHBpeGVscyBwZXIgZnJhbWUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmdUeXBlIFRoZSBlYXNpbmctdHlwZSB1c2VkIGZvciB0aGUgYW5pbWF0aW9uLlxuICAgICMjI1xuICAgIHNjcm9sbDogKHNwZWVkWCwgc3BlZWRZLCBkdXJhdGlvbiwgZWFzaW5nVHlwZSkgLT5cbiAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQG1vdmVBbmltYXRpb24pXG4gICAgICAgIEBtb3ZlQW5pbWF0aW9uLnNjcm9sbChzcGVlZFgsIHNwZWVkWSwgZHVyYXRpb24sIGVhc2luZ1R5cGUsIEBjYWxsYmFjaylcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBAbW92ZUFuaW1hdGlvblxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTY3JvbGxzIHRoZSBnYW1lIG9iamVjdCB0byBhIHNwZWNpZmllZCBwb3NpdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNjcm9sbFRvXG4gICAgKiBAcGFyYW0ge251bWJlcn0geCBUaGUgeC1jb29yZGluYXRlIG9mIHRoZSBwb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgIyMjICBcbiAgICBzY3JvbGxUbzogKHgsIHksIGR1cmF0aW9uLCBlYXNpbmdUeXBlKSAtPlxuICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAbW92ZUFuaW1hdGlvbilcbiAgICAgICAgQG1vdmVBbmltYXRpb24uc2Nyb2xsVG8oeCwgeSwgZHVyYXRpb24sIGVhc2luZ1R5cGUsIEBjYWxsYmFjaylcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBAbW92ZUFuaW1hdGlvblxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTY3JvbGxzIHRoZSBnYW1lIG9iamVjdCBhbG9uZyBhIHBhdGguXG4gICAgKlxuICAgICogQG1ldGhvZCBzY3JvbGxQYXRoXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGF0aCBUaGUgcGF0aCB0byBmb2xsb3cuXG4gICAgKiBAcGFyYW0ge2dzLkFuaW1hdGlvbkxvb3BUeXBlfSBsb29wVHlwZSBUaGUgbG9vcC1UeXBlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgIyMjICBcbiAgICBzY3JvbGxQYXRoOiAocGF0aCwgbG9vcFR5cGUsIGR1cmF0aW9uLCBlYXNpbmdUeXBlKSAtPlxuICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAcGF0aEFuaW1hdGlvbilcbiAgICAgICAgQHBhdGhBbmltYXRpb24uc2Nyb2xsKHBhdGgsIGxvb3BUeXBlLCBkdXJhdGlvbiwgZWFzaW5nVHlwZSwgQGNhbGxiYWNrKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEBwYXRoQW5pbWF0aW9uXG4gICAgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFpvb21zIGEgZ2FtZSBvYmplY3QgdG8gc3BlY2lmaWVkIHNpemUuXG4gICAgKlxuICAgICogQG1ldGhvZCB6b29tVG9cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IFRoZSB4LWF4aXMgem9vbS1mYWN0b3IuXG4gICAgKiBAcGFyYW0ge251bWJlcn0geSBUaGUgeS1heGlzIHpvb20tZmFjdG9yLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgIyMjICAgICAgXG4gICAgem9vbVRvOiAoeCwgeSwgZHVyYXRpb24sIGVhc2luZ1R5cGUpIC0+XG4gICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KEB6b29tQW5pbWF0aW9uKVxuICAgICAgICBAem9vbUFuaW1hdGlvbi5zdGFydCh4LCB5LCBkdXJhdGlvbiwgZWFzaW5nVHlwZSwgQGNhbGxiYWNrKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEB6b29tQW5pbWF0aW9uXG4gICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEJsZW5kcyBhIGdhbWUgb2JqZWN0IHRvIHNwZWNpZmllZCBvcGFjaXR5LlxuICAgICpcbiAgICAqIEBtZXRob2QgYmxlbmRUb1xuICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgVGhlIHRhcmdldCBvcGFjaXR5LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbY2FsbGJhY2tdIEFuIG9wdGlvbmFsIGNhbGxiYWNrIGNhbGxlZCBpZiBibGVuZGluZyBpcyBmaW5pc2hlZC4gXG4gICAgIyMjICAgIFxuICAgIGJsZW5kVG86IChvcGFjaXR5LCBkdXJhdGlvbiwgZWFzaW5nVHlwZSwgY2FsbGJhY2spIC0+XG4gICAgICAgIEBibGVuZEFuaW1hdGlvbi5zdG9wKClcbiAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQGJsZW5kQW5pbWF0aW9uKVxuICAgICAgICBAYmxlbmRBbmltYXRpb24uc3RhcnQob3BhY2l0eSwgZHVyYXRpb24sIGVhc2luZ1R5cGUsIGdzLkNhbGxCYWNrKFwib25CbGVuZEZpbmlzaFwiLCB0aGlzLCBjYWxsYmFjaykpIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEBibGVuZEFuaW1hdGlvblxuICAgICBcbiAgICAjIyMqXG4gICAgKiBBbmltYXRlcyBhIExpdmUyRCBtb2RlbCBwYXJhbWV0ZXIgb2YgYSBMaXZlMkQgZ2FtZSBvYmplY3QgdG8gYSBzcGVjaWZpZWQgdmFsdWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBibGVuZFRvXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyYW0gVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlciB0byBhbmltYXRlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFRoZSB0YXJnZXQgdmFsdWUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmdUeXBlIFRoZSBlYXNpbmctdHlwZS5cbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWxsYmFja10gQW4gb3B0aW9uYWwgY2FsbGJhY2sgY2FsbGVkIGlmIGJsZW5kaW5nIGlzIGZpbmlzaGVkLiBcbiAgICAjIyNcbiAgICBsMmRQYXJhbWV0ZXJUbzogKHBhcmFtLCB2YWx1ZSwgZHVyYXRpb24sIGVhc2luZ1R5cGUsIGNhbGxiYWNrKSAtPlxuICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAbDJkQW5pbWF0aW9uKVxuICAgICAgICBAbDJkQW5pbWF0aW9uLnN0YXJ0KHBhcmFtLCB2YWx1ZSwgZHVyYXRpb24sIGVhc2luZ1R5cGUsIGdzLkNhbGxCYWNrKFwib25CbGVuZEZpbmlzaFwiLCB0aGlzLCBjYWxsYmFjaykpIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEBsMmRBbmltYXRpb25cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQmx1cnMgYSBnYW1lIG9iamVjdCB0byBzcGVjaWZpZWQgYmx1ci1wb3dlci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGJsdXJUb1xuICAgICogQHBhcmFtIHtudW1iZXJ9IHBvd2VyIFRoZSB0YXJnZXQgYmx1ci1wb3dlci5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGVhc2luZ1R5cGUgVGhlIGVhc2luZy10eXBlLlxuICAgICMjIyAgICAgXG4gICAgYmx1clRvOiAocG93ZXIsIGR1cmF0aW9uLCBlYXNpbmdUeXBlKSAtPlxuICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAYmx1ckFuaW1hdGlvbilcbiAgICAgICAgQGJsdXJBbmltYXRpb24uc3RhcnQocG93ZXIsIGR1cmF0aW9uLCBlYXNpbmdUeXBlKSBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBAYmx1ckFuaW1hdGlvblxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBQaXhlbGF0ZXMgYSBnYW1lIG9iamVjdCB0byBzcGVjaWZpZWQgcGl4ZWwtc2l6ZS9ibG9jay1zaXplXG4gICAgKlxuICAgICogQG1ldGhvZCBwaXhlbGF0ZVRvXG4gICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBUaGUgdGFyZ2V0IGJsb2NrLXdpZHRoXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gVGhlIHRhcmdldCBibG9jay1oZWlnaHRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGVhc2luZ1R5cGUgVGhlIGVhc2luZy10eXBlLlxuICAgICMjIyAgICAgXG4gICAgcGl4ZWxhdGVUbzogKHdpZHRoLCBoZWlnaHQsIGR1cmF0aW9uLCBlYXNpbmdUeXBlKSAtPlxuICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAcGl4ZWxhdGVBbmltYXRpb24pXG4gICAgICAgIEBwaXhlbGF0ZUFuaW1hdGlvbi5zdGFydCh3aWR0aCwgaGVpZ2h0LCBkdXJhdGlvbiwgZWFzaW5nVHlwZSkgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQHBpeGVsYXRlQW5pbWF0aW9uXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFdvYmJsZXMgYSBnYW1lIG9iamVjdCB0byBzcGVjaWZpZWQgd29iYmxlLXBvd2VyIGFuZCB3b2JibGUtc3BlZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCB3b2JibGVUb1xuICAgICogQHBhcmFtIHtudW1iZXJ9IHBvd2VyIFRoZSB0YXJnZXQgd29iYmxlLXBvd2VyLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNwZWVkIFRoZSB0YXJnZXQgd29iYmxlLXNwZWVkLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgIyMjICAgICBcbiAgICB3b2JibGVUbzogKHBvd2VyLCBzcGVlZCwgZHVyYXRpb24sIGVhc2luZ1R5cGUpIC0+XG4gICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KEB3b2JibGVBbmltYXRpb24pXG4gICAgICAgIEB3b2JibGVBbmltYXRpb24uc3RhcnQocG93ZXIsIHNwZWVkLCBkdXJhdGlvbiwgZWFzaW5nVHlwZSkgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQHdvYmJsZUFuaW1hdGlvblxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDb2xvcnMgYSBnYW1lIG9iamVjdCB0byBhIHNwZWNpZmllZCB0YXJnZXQgY29sb3IuXG4gICAgKlxuICAgICogQG1ldGhvZCBjb2xvclRvXG4gICAgKiBAcGFyYW0ge0NvbG9yfSBjb2xvciBUaGUgdGFyZ2V0IGNvbG9yLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgIyMjICBcbiAgICBjb2xvclRvOiAoY29sb3IsIGR1cmF0aW9uLCBlYXNpbmdUeXBlKSAtPlxuICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAY29sb3JBbmltYXRpb24pXG4gICAgICAgIEBjb2xvckFuaW1hdGlvbi5zdGFydChjb2xvciwgZHVyYXRpb24sIGVhc2luZ1R5cGUsIEBjYWxsYmFjaylcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBAY29sb3JBbmltYXRpb25cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQW4gaW1hZ2UgYW5pbWF0aW9uIHJ1bnMgZnJvbSBsZWZ0IHRvIHJpZ2h0IHVzaW5nIHRoZSBnYW1lIG9iamVjdCdzXG4gICAgKiBpbWFnZS1wcm9wZXJ0eS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNoYW5nZUltYWdlc1xuICAgICogQHBhcmFtIHtBcnJheX0gaW1hZ2VzIEFuIGFycmF5IG9mIGltYWdlIG5hbWVzLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgIyMjICAgICAgXG4gICAgY2hhbmdlSW1hZ2VzOiAoaW1hZ2VzLCBkdXJhdGlvbiwgZWFzaW5nVHlwZSkgLT5cbiAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQGltYWdlQW5pbWF0aW9uKVxuICAgICAgICBAaW1hZ2VBbmltYXRpb24uc3RhcnQoaW1hZ2VzLCBkdXJhdGlvbiwgZWFzaW5nVHlwZSwgQGNhbGxiYWNrKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEBpbWFnZUFuaW1hdGlvblxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBIGZyYW1lIGFuaW1hdGlvbiB3aGljaCBtb2RpZmllcyB0aGUgZ2FtZSBvYmplY3QncyBzcmNSZWN0IHByb3BlcnR5XG4gICAgKiBhIHBsYXkgYW4gYW5pbWF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2hhbmdlRnJhbWVzXG4gICAgKiBAcGFyYW0ge2dzLlJlY3RbXX0gZnJhbWVzIEFuIGFycmF5IG9mIHNvdXJjZSByZWN0YW5nbGVzIChmcmFtZXMpLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgIyMjICAgICAgXG4gICAgI2NoYW5nZUZyYW1lczogKGZyYW1lcywgZHVyYXRpb24sIGVhc2luZ1R5cGUpIC0+XG4gICAgIyAgICBhbmltYXRpb24gPSBuZXcgZ3MuQ29tcG9uZW50X0ZyYW1lQW5pbWF0aW9uKClcbiAgICAjICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KGFuaW1hdGlvbilcbiAgICAjICAgIGFuaW1hdGlvbi5zdGFydChmcmFtZXMsIGR1cmF0aW9uLCBlYXNpbmdUeXBlLCBAY2FsbGJhY2spXG4gICAgICAgXG4gICAgIyMjKlxuICAgICogQSBmcmFtZSBhbmltYXRpb24gd2hpY2ggbW9kaWZpZXMgdGhlIGdhbWUgb2JqZWN0J3Mgc3JjUmVjdCBwcm9wZXJ0eVxuICAgICogYSBwbGF5IGFuIGFuaW1hdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHBsYXlBbmltYXRpb25cbiAgICAqIEBwYXJhbSB7Z3MuUmVjdFtdfSBmcmFtZXMgQW4gYXJyYXkgb2Ygc291cmNlIHJlY3RhbmdsZXMgKGZyYW1lcykuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmdUeXBlIFRoZSBlYXNpbmctdHlwZS5cbiAgICAjIyMgICAgIFxuICAgIHBsYXlBbmltYXRpb246IChhbmltYXRpb25SZWNvcmQpIC0+XG4gICAgICAgIEBmcmFtZUFuaW1hdGlvbi5yZWZyZXNoKGFuaW1hdGlvblJlY29yZClcbiAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQGZyYW1lQW5pbWF0aW9uKVxuICAgICAgICBAZnJhbWVBbmltYXRpb24uc3RhcnQoQGNhbGxiYWNrKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEBmcmFtZUFuaW1hdGlvblxuICAgICAgIFxuICAgICMjIypcbiAgICAqIENoYW5nZXMgYSBmaWVsZCBvZiB0aGUgZ2FtZSBvYmplY3QgdG8gYSBzcGVjaWZpZWQgdmFsdWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBjaGFuZ2VcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBWYWx1ZSBUaGUgdGFyZ2V0IHZhbHVlLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGZpZWxkIFRoZSBuYW1lIG9mIHRoZSBmaWVsZC9wcm9wZXJ0eS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGVhc2luZ1R5cGUgVGhlIGVhc2luZy10eXBlLlxuICAgICMjIyAgIFxuICAgIGNoYW5nZTogKHZhbHVlLCBmaWVsZCwgZHVyYXRpb24sIGVhc2luZ1R5cGUpIC0+XG4gICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KEBmaWVsZEFuaW1hdGlvbilcbiAgICAgICAgQGZpZWxkQW5pbWF0aW9uLnN0YXJ0KHZhbHVlLCBmaWVsZCwgZHVyYXRpb24sIGVhc2luZ1R5cGUsIEBjYWxsYmFjaylcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBAZmllbGRBbmltYXRpb25cbiAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTaGFrZXMgdGhlIGdhbWUgb2JqZWN0IGhvcml6b250YWxseSB1c2luZyB0aGUgZ2FtZSBvYmplY3QncyBvZmZzZXQtcHJvcGVydHkuXG4gICAgKlxuICAgICogQG1ldGhvZCBzaGFrZVxuICAgICogQHBhcmFtIHtncy5SYW5nZX0gcmFuZ2UgVGhlIGhvcml6b250YWwgc2hha2UtcmFuZ2UuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gc3BlZWQgVGhlIHNoYWtlIHNwZWVkLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgIyMjIFxuICAgIHNoYWtlOiAocmFuZ2UsIHNwZWVkLCBkdXJhdGlvbiwgZWFzaW5nKSAtPlxuICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAc2hha2VBbmltYXRpb24pXG4gICAgICAgIEBzaGFrZUFuaW1hdGlvbi5zdGFydChyYW5nZSwgc3BlZWQsIGR1cmF0aW9uLCBlYXNpbmcsIEBjYWxsYmFjaylcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBAc2hha2VBbmltYXRpb25cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVGludHMgdGhlIGdhbWUgb2JqZWN0IHRvIGEgc3BlY2lmaWVkIHRvbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCB0aW50VG9cbiAgICAqIEBwYXJhbSB7VG9uZX0gdG9uZSBUaGUgdGFyZ2V0IHRvbmUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmdUeXBlIFRoZSBlYXNpbmctdHlwZS5cbiAgICAjIyMgXG4gICAgdGludFRvOiAodG9uZSwgZHVyYXRpb24sIGVhc2luZ1R5cGUpIC0+XG4gICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KEB0aW50QW5pbWF0aW9uKVxuICAgICAgICBAdGludEFuaW1hdGlvbi5zdGFydCh0b25lLCBkdXJhdGlvbiwgZWFzaW5nVHlwZSwgQGNhbGxiYWNrKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEB0aW50QW5pbWF0aW9uXG4gICAgXG4gICAgIyMjKlxuICAgICogUm90YXRlcyB0aGUgZ2FtZSBvYmplY3QgYXJvdW5kIGl0cyBhbmNob3ItcG9pbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCByb3RhdGVcbiAgICAqIEBwYXJhbSB7Z3MuUm90YXRpb25EaXJlY3Rpb259IGRpcmVjdGlvbiBUaGUgcm90YXRpb24tZGlyZWN0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNwZWVkIFRoZSByb3RhdGlvbiBzcGVlZCBpbiBkZWdyZWVzIHBlciBmcmFtZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGVhc2luZ1R5cGUgVGhlIGVhc2luZy10eXBlLlxuICAgICMjIyBcbiAgICByb3RhdGU6IChkaXJlY3Rpb24sIHNwZWVkLCBkdXJhdGlvbiwgZWFzaW5nVHlwZSkgLT5cbiAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQHJvdGF0ZUFuaW1hdGlvbilcbiAgICAgICAgQHJvdGF0ZUFuaW1hdGlvbi5yb3RhdGUoZGlyZWN0aW9uLCBzcGVlZCwgZHVyYXRpb24sIGVhc2luZ1R5cGUsIEBjYWxsYmFjaylcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBAcm90YXRlQW5pbWF0aW9uXG4gICAgXG4gICAgIyMjKlxuICAgICogUm90YXRlcyB0aGUgZ2FtZSBvYmplY3QgYXJvdW5kIGl0cyBhbmNob3ItcG9pbnQgdG8gYSBzcGVjaWZpZWQgYW5nbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCByb3RhdGVUb1xuICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIFRoZSB0YXJnZXQgYW5nbGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmdUeXBlIFRoZSBlYXNpbmctdHlwZS5cbiAgICAjIyMgXG4gICAgcm90YXRlVG86IChhbmdsZSwgZHVyYXRpb24sIGVhc2luZ1R5cGUpIC0+XG4gICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KEByb3RhdGVBbmltYXRpb24pXG4gICAgICAgIEByb3RhdGVBbmltYXRpb24ucm90YXRlVG8oYW5nbGUsIGR1cmF0aW9uLCBlYXNpbmdUeXBlLCBAY2FsbGJhY2spXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQHJvdGF0ZUFuaW1hdGlvblxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBMZXRzIGEgZ2FtZSBvYmplY3QgYXBwZWFyIG9uIHNjcmVlbiB1c2luZyBhIG1hc2tpbmctZWZmZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgbWFza0luXG4gICAgKiBAcGFyYW0ge2dzLk1hc2t9IG1hc2sgVGhlIG1hc2sgdXNlZCBmb3IgdGhlIGFuaW1hdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGVhc2luZ1R5cGUgVGhlIGVhc2luZy10eXBlLlxuICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2NhbGxiYWNrXSBBbiBvcHRpb25hbCBjYWxsYmFjay1mdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgYW5pbWF0aW9uIGlzIGZpbmlzaGVkLiBcbiAgICAjIyMgICAgIFxuICAgIG1hc2tJbjogKG1hc2ssIGR1cmF0aW9uLCBlYXNpbmcsIGNhbGxiYWNrKSAtPlxuICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAbWFza0FuaW1hdGlvbilcbiAgICAgICAgQG1hc2tBbmltYXRpb24ubWFza0luKG1hc2ssIGR1cmF0aW9uLCBlYXNpbmcsIChvYmplY3QsIGFuaW1hdGlvbikgLT4gb2JqZWN0LnJlbW92ZUNvbXBvbmVudChhbmltYXRpb24pOyBjYWxsYmFjaz8ob2JqZWN0KTspXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQG1hc2tBbmltYXRpb25cbiAgICAgXG4gICAgIyMjKlxuICAgICogRGVzY3JpcHRpb24gZm9sbG93cy4uLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWFza1RvXG4gICAgKiBAcGFyYW0ge2dzLk1hc2t9IG1hc2sgVGhlIG1hc2sgdXNlZCBmb3IgdGhlIGFuaW1hdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGVhc2luZ1R5cGUgVGhlIGVhc2luZy10eXBlLlxuICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2NhbGxiYWNrXSBBbiBvcHRpb25hbCBjYWxsYmFjay1mdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgYW5pbWF0aW9uIGlzIGZpbmlzaGVkLiBcbiAgICAjIyMgICAgIFxuICAgIG1hc2tUbzogKG1hc2ssIGR1cmF0aW9uLCBlYXNpbmcsIGNhbGxiYWNrKSAtPlxuICAgICAgICBAb2JqZWN0LmFkZENvbXBvbmVudChAbWFza0FuaW1hdGlvbilcbiAgICAgICAgQG1hc2tBbmltYXRpb24ubWFza1RvKG1hc2ssIGR1cmF0aW9uLCBlYXNpbmcsIChvYmplY3QsIGFuaW1hdGlvbikgLT4gb2JqZWN0LnJlbW92ZUNvbXBvbmVudChhbmltYXRpb24pOyBjYWxsYmFjaz8ob2JqZWN0KTspXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQG1hc2tBbmltYXRpb25cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogTGV0cyBhIGdhbWUgb2JqZWN0IGRpc2FwcGVhciBmcm9tIHNjcmVlbiB1c2luZyBhIG1hc2tpbmctZWZmZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgbWFza091dFxuICAgICogQHBhcmFtIHtncy5NYXNrfSBtYXNrIFRoZSBtYXNrIHVzZWQgZm9yIHRoZSBhbmltYXRpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmdUeXBlIFRoZSBlYXNpbmctdHlwZS5cbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWxsYmFja10gQW4gb3B0aW9uYWwgY2FsbGJhY2stZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC4gXG4gICAgIyMjICBcbiAgICBtYXNrT3V0OiAobWFzaywgZHVyYXRpb24sIGVhc2luZywgY2FsbGJhY2spIC0+XG4gICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KEBtYXNrQW5pbWF0aW9uKVxuICAgICAgICBAbWFza0FuaW1hdGlvbi5tYXNrT3V0KG1hc2ssIGR1cmF0aW9uLCBlYXNpbmcsIChvYmplY3QsIGFuaW1hdGlvbikgLT4gb2JqZWN0LnJlbW92ZUNvbXBvbmVudChhbmltYXRpb24pOyBjYWxsYmFjaz8ob2JqZWN0KTspXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQG1hc2tBbmltYXRpb25cblxuICAgICMjIypcbiAgICAqIExldHMgYSBnYW1lIG9iamVjdCBhcHBlYXIgb24gc2NyZWVuIGZyb20gbGVmdCwgdG9wLCByaWdodCBvciBib3R0b20gdXNpbmcgXG4gICAgKiBhIG1vdmUtYW5pbWF0aW9uXG4gICAgKlxuICAgICogQG1ldGhvZCBtb3ZlSW5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IFRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIHRhcmdldC1wb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIHRhcmdldC1wb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB0eXBlIFRoZSBtb3ZlbWVudC1kaXJlY3Rpb24gZnJvbSB3aGVyZSB0aGUgZ2FtZSBvYmplY3Qgc2hvdWxkIG1vdmUtaW4uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmdUeXBlIFRoZSBlYXNpbmctdHlwZS5cbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWxsYmFja10gQW4gb3B0aW9uYWwgY2FsbGJhY2stZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC4gXG4gICAgIyMjICBcbiAgICBtb3ZlSW46ICh4LCB5LCB0eXBlLCBkdXJhdGlvbiwgZWFzaW5nLCBjYWxsYmFjaykgLT5cbiAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQG1vdmVBbmltYXRpb24pXG4gICAgICAgIEBtb3ZlQW5pbWF0aW9uLm1vdmVJbih4LCB5LCB0eXBlLCBkdXJhdGlvbiwgZWFzaW5nLCAob2JqZWN0LCBhbmltYXRpb24pIC0+IFxuICAgICAgICAgICAgb2JqZWN0LnJlbW92ZUNvbXBvbmVudChhbmltYXRpb24pXG4gICAgICAgICAgICBjYWxsYmFjaz8ob2JqZWN0KSlcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBAbW92ZUFuaW1hdGlvblxuICAgICAgXG4gICAgIyMjKlxuICAgICogTGV0cyBhIGdhbWUgb2JqZWN0IGRpc2FwcGVhciBmcm9tIHNjcmVlbiB0byB0aGUgbGVmdCwgdG9wLCByaWdodCBvciBib3R0b20gdXNpbmcgXG4gICAgKiBhIG1vdmUtYW5pbWF0aW9uXG4gICAgKlxuICAgICogQG1ldGhvZCBtb3ZlT3V0XG4gICAgKiBAcGFyYW0ge251bWJlcn0gdHlwZSBUaGUgbW92ZW1lbnQtZGlyZWN0aW9uIGluIHdoaWNoIHRoZSBnYW1lIG9iamVjdCBzaG91bGQgbW92ZS1vdXQuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmdUeXBlIFRoZSBlYXNpbmctdHlwZS5cbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWxsYmFja10gQW4gb3B0aW9uYWwgY2FsbGJhY2stZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC4gXG4gICAgIyMjICAgIFxuICAgIG1vdmVPdXQ6ICh0eXBlLCBkdXJhdGlvbiwgZWFzaW5nLCBjYWxsYmFjaykgLT5cbiAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQG1vdmVBbmltYXRpb24pXG4gICAgICAgIEBtb3ZlQW5pbWF0aW9uLm1vdmVPdXQodHlwZSwgZHVyYXRpb24sIGVhc2luZywgKG9iamVjdCwgYW5pbWF0aW9uKSAtPiBcbiAgICAgICAgICAgIG9iamVjdC5yZW1vdmVDb21wb25lbnQoYW5pbWF0aW9uKVxuICAgICAgICAgICAgY2FsbGJhY2s/KG9iamVjdClcbiAgICAgICAgKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEBtb3ZlQW5pbWF0aW9uXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIExldHMgYSBnYW1lIG9iamVjdCBhcHBlYXIgb24gc2NyZWVuIHVzaW5nIGJsZW5kaW5nLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2hvd1xuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nIFRoZSBlYXNpbmctdHlwZS5cbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWxsYmFja10gQW4gb3B0aW9uYWwgY2FsbGJhY2stZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC4gXG4gICAgIyMjICBcbiAgICBzaG93OiAoZHVyYXRpb24sIGVhc2luZywgY2FsbGJhY2spIC0+XG4gICAgICAgIEBvYmplY3Qub3BhY2l0eSA9IDBcbiAgICAgICAgaWYgZHVyYXRpb24gPiAwXG4gICAgICAgICAgICBAb2JqZWN0LnZpc3VhbD8udXBkYXRlKClcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBAYmxlbmRUbygyNTUsIGR1cmF0aW9uLCBlYXNpbmcsIGNhbGxiYWNrKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBMZXRzIGEgZ2FtZSBvYmplY3QgZGlzYXBwZWFyIGZyb20gc2NyZWVuIHVzaW5nIGJsZW5kaW5nLlxuICAgICpcbiAgICAqIEBtZXRob2QgaGlkZVxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nIFRoZSBlYXNpbmctdHlwZS5cbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWxsYmFja10gQW4gb3B0aW9uYWwgY2FsbGJhY2stZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC4gXG4gICAgIyMjICAgICBcbiAgICBoaWRlOiAoZHVyYXRpb24sIGVhc2luZywgY2FsbGJhY2spIC0+XG4gICAgICAgIHJldHVybiBAYmxlbmRUbygwLCBkdXJhdGlvbiwgZWFzaW5nLCBjYWxsYmFjaylcbiAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGFuZ2VzIHZpc2libGUtcHJvcGVydHkgdG8gdHJ1ZS4gVGhpcyBtZXRob2QgaXMgZGVwcmVjYXRlZC5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvcGVuXG4gICAgKiBAZGVwcmVjYXRlZFxuICAgICMjIyAgIFxuICAgIG9wZW46IC0+IEBvYmplY3QudmlzaWJsZSA9IHllc1xuICAgIFxuICAgICMjIypcbiAgICAqIENoYW5nZXMgdmlzaWJsZS1wcm9wZXJ0eSB0byBmYWxzZS4gVGhpcyBtZXRob2QgaXMgZGVwcmVjYXRlZC5cbiAgICAqIFxuICAgICogQG1ldGhvZCBjbG9zZVxuICAgICogQGRlcHJlY2F0ZWRcbiAgICAjIyMgICBcbiAgICBjbG9zZTogLT4gQG9iamVjdC52aXNpYmxlID0gbm9cbiAgICBcbiAgICAjIyMqXG4gICAgKiBGbGFzaGVzIHRoZSBnYW1lIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGZsYXNoXG4gICAgKiBAcGFyYW0ge0NvbG9yfSBjb2xvciBUaGUgZmxhc2gtY29sb3IuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAjIyNcbiAgICBmbGFzaDogKGNvbG9yLCBkdXJhdGlvbikgLT5cbiAgICAgICAgQG9iamVjdC5jb2xvciA9IGNvbG9yXG4gICAgICAgIGNvbG9yID0gbmV3IENvbG9yKGNvbG9yKVxuICAgICAgICBjb2xvci5hbHBoYSA9IDBcbiAgICAgICAgcmV0dXJuIEBjb2xvclRvKGNvbG9yLCBkdXJhdGlvbiwgZ3MuRWFzaW5ncy5FQVNFX0xJTkVBUltncy5FYXNpbmdUeXBlcy5FQVNFX0lOXSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBMZXRzIGEgZ2FtZSBvYmplY3QgYXBwZWFyIG9uIHNjcmVlbiB1c2luZyBhIHNwZWNpZmllZCBhbmltYXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCBhcHBlYXJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IFRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIHRhcmdldC1wb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIHRhcmdldC1wb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7Z3MuQXBwZWFyQW5pbWF0aW9uSW5mb30gYW5pbWF0aW9uIFRoZSBhbmltYXRpb24gaW5mby1vYmplY3QuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nIFRoZSBlYXNpbmctdHlwZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiBUaGUgZHVyYXRpb24gaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2NhbGxiYWNrXSBBbiBvcHRpb25hbCBjYWxsYmFjay1mdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgYW5pbWF0aW9uIGlzIGZpbmlzaGVkLiBcbiAgICAjIyMgICAgICBcbiAgICBhcHBlYXI6ICh4LCB5LCBhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sIGNhbGxiYWNrKSAtPlxuICAgICAgICBlYXNpbmcgPSBlYXNpbmcgfHwgZ3MuRWFzaW5ncy5FQVNFX0xJTkVBUltncy5FYXNpbmdUeXBlcy5FQVNFX0lOXVxuICAgICAgICBAb2JqZWN0LnZpc2libGUgPSB5ZXNcblxuICAgICAgICBpZiBhbmltYXRpb24udHlwZSA9PSBncy5BbmltYXRpb25UeXBlcy5NT1ZFTUVOVFxuICAgICAgICAgICAgQG1vdmVJbih4LCB5LCBhbmltYXRpb24ubW92ZW1lbnQsIGR1cmF0aW9uLCBlYXNpbmcsIGNhbGxiYWNrKVxuICAgICAgICBlbHNlIGlmIGFuaW1hdGlvbi50eXBlID09IGdzLkFuaW1hdGlvblR5cGVzLk1BU0tJTkdcbiAgICAgICAgICAgIEBtYXNrSW4oYW5pbWF0aW9uLm1hc2ssIGR1cmF0aW9uLCBlYXNpbmcsIGNhbGxiYWNrKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2hvdyhkdXJhdGlvbiwgZWFzaW5nLCBjYWxsYmFjaylcbiAgICBcbiAgICAjIyMqXG4gICAgKiBMZXRzIGEgZ2FtZSBvYmplY3QgZGlzYXBwZWFyIGZyb20gc2NyZWVuIHVzaW5nIGEgc3BlY2lmaWVkIGFuaW1hdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc2FwcGVhclxuICAgICogQHBhcmFtIHtncy5BcHBlYXJBbmltYXRpb25JbmZvfSBhbmltYXRpb24gVGhlIGFuaW1hdGlvbiBpbmZvLW9iamVjdC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmcgVGhlIGVhc2luZy10eXBlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbY2FsbGJhY2tdIEFuIG9wdGlvbmFsIGNhbGxiYWNrLWZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBhbmltYXRpb24gaXMgZmluaXNoZWQuIFxuICAgICMjIyAgICAgICBcbiAgICBkaXNhcHBlYXI6IChhbmltYXRpb24sIGVhc2luZywgZHVyYXRpb24sIGNhbGxiYWNrKSAtPlxuICAgICAgICBAb2JqZWN0LnZpc2libGUgPSB5ZXNcbiAgICAgICAgaWYgYW5pbWF0aW9uLnR5cGUgPT0gZ3MuQW5pbWF0aW9uVHlwZXMuTU9WRU1FTlRcbiAgICAgICAgICAgIEBtb3ZlT3V0KGFuaW1hdGlvbi5tb3ZlbWVudCwgZHVyYXRpb24sIGVhc2luZywgY2FsbGJhY2spXG4gICAgICAgIGVsc2UgaWYgYW5pbWF0aW9uLnR5cGUgPT0gZ3MuQW5pbWF0aW9uVHlwZXMuTUFTS0lOR1xuICAgICAgICAgICAgQG1hc2tPdXQoYW5pbWF0aW9uLm1hc2ssIGR1cmF0aW9uLCBlYXNpbmcsIGNhbGxiYWNrKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaGlkZShkdXJhdGlvbiwgZWFzaW5nLCBjYWxsYmFjaylcbiAgICAgICAgXG5cbmdzLkFuaW1hdG9yID0gQ29tcG9uZW50X0FuaW1hdG9yXG5ncy5Db21wb25lbnRfQW5pbWF0b3IgPSBDb21wb25lbnRfQW5pbWF0b3IiXX0=
//# sourceURL=Component_Animator_144.js