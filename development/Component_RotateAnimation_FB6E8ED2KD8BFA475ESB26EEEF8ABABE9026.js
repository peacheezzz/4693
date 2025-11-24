var Component_RotateAnimation,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_RotateAnimation = (function(superClass) {
  extend(Component_RotateAnimation, superClass);


  /**
  * Executes a rotate-animation on a game-object.
  *
  * @module gs
  * @class Component_RotateAnimation
  * @extends gs.Component_Animation
  * @memberof gs
  * @constructor
   */

  function Component_RotateAnimation(data) {
    Component_RotateAnimation.__super__.constructor.apply(this, arguments);
    this.easing = new gs.Easing(null, data != null ? data.easing : void 0);
    this.callback = null;
  }


  /**
  * Serializes the rotate-animation into a data-bundle.
  *
  * @method toDataBundle
   */

  Component_RotateAnimation.prototype.toDataBundle = function() {
    return {
      easing: this.easing
    };
  };


  /**
  * Updates the rotate-animation.
  *
  * @method update
   */

  Component_RotateAnimation.prototype.update = function() {
    Component_RotateAnimation.__super__.update.call(this);
    if (!this.easing.isRunning) {
      return;
    }
    this.easing.updateValue();
    this.object.angle = this.easing.value;
    if (!this.easing.isRunning && !this.easing.isEndless) {
      this.object.angle = Math.round(this.object.angle);
      return typeof this.callback === "function" ? this.callback(this.object, this) : void 0;
    }
  };


  /**
  * Starts the rotate-animation.
  *
  * @method rotateTo
  * @param {number} angle The target angle
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {function} [callback] An optional callback called if the animation is finished.
   */

  Component_RotateAnimation.prototype.rotateTo = function(angle, duration, easingType, callback) {
    this.easing.type = easingType || gs.Easings.EASE_LINEAR[gs.EasingTypes.EASE_IN];
    this.callback = callback;
    if (duration === 0 || GameManager.tempSettings.skip) {
      this.object.angle = angle;
      return typeof this.callback === "function" ? this.callback(this.object, this) : void 0;
    } else {
      return this.easing.startValue(this.object.angle, angle - this.object.angle, duration);
    }
  };


  /**
  * Starts the rotate-animation.
  *
  * @method start
  * @param {gs.RotationDirection} direction The rotation direction.
  * @param {number} speed The rotation speed in degrees per frame.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {function} [callback] An optional callback called if the animation is finished.
   */

  Component_RotateAnimation.prototype.rotate = function(direction, speed, duration, easingType, callback) {
    this.easing.type = easingType || gs.Easings.EASE_LINEAR[gs.EasingTypes.EASE_IN];
    this.callback = callback;
    this.speed = speed;
    this.orgAngle = this.object.angle;
    if (direction === 1) {
      speed = -speed;
    }
    if (duration === 0 || GameManager.tempSettings.skip) {
      this.object.angle += speed * duration;
      return typeof this.callback === "function" ? this.callback(this.object, this) : void 0;
    } else {
      return this.easing.startValue(this.object.angle, (this.object.angle + speed * duration) - this.object.angle, duration);
    }
  };


  /**
  * Skips the animation. That is used to skip an animation if the user
  * wants to skip very fast through a visual novel scene.
  *
  * @method skip
   */

  Component_RotateAnimation.prototype.skip = function() {
    var ref;
    if (((ref = this.easing) != null ? ref.duration : void 0) >= GameManager.tempSettings.skipTime) {
      this.object.angle = this.orgAngle + this.speed * this.easing.duration;
      return this.easing.isRunning = false;
    }
  };

  return Component_RotateAnimation;

})(gs.Component_Animation);

gs.Component_RotateAnimation = Component_RotateAnimation;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEseUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OztFQVNhLG1DQUFDLElBQUQ7SUFDVCw0REFBQSxTQUFBO0lBRUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxNQUFILENBQVUsSUFBVixpQkFBZ0IsSUFBSSxDQUFFLGVBQXRCO0lBQ2QsSUFBQyxDQUFBLFFBQUQsR0FBWTtFQUpIOzs7QUFNYjs7Ozs7O3NDQUtBLFlBQUEsR0FBYyxTQUFBO1dBQ1Y7TUFBQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BQVQ7O0VBRFU7OztBQUdkOzs7Ozs7c0NBS0EsTUFBQSxHQUFRLFNBQUE7SUFDSixvREFBQTtJQUNBLElBQUcsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQWY7QUFBOEIsYUFBOUI7O0lBRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUE7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsR0FBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUV4QixJQUFHLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFaLElBQTBCLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUF6QztNQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixHQUFnQixJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBbkI7bURBQ2hCLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxRQUFRLGVBRnhCOztFQVBJOzs7QUFZUjs7Ozs7Ozs7OztzQ0FTQSxRQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixVQUFsQixFQUE4QixRQUE5QjtJQUNOLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixHQUFlLFVBQUEsSUFBYyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVksQ0FBQSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQWY7SUFDcEQsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUVaLElBQUcsUUFBQSxLQUFZLENBQVosSUFBaUIsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUE3QztNQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixHQUFnQjttREFDaEIsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFFBQVEsZUFGeEI7S0FBQSxNQUFBO2FBSUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBM0IsRUFBa0MsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBbEQsRUFBeUQsUUFBekQsRUFKSjs7RUFKTTs7O0FBVVY7Ozs7Ozs7Ozs7O3NDQVVBLE1BQUEsR0FBUSxTQUFDLFNBQUQsRUFBWSxLQUFaLEVBQW1CLFFBQW5CLEVBQTZCLFVBQTdCLEVBQXlDLFFBQXpDO0lBQ0osSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLEdBQWUsVUFBQSxJQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBWSxDQUFBLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBZjtJQUNwRCxJQUFDLENBQUEsUUFBRCxHQUFZO0lBQ1osSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUNwQixJQUFHLFNBQUEsS0FBYSxDQUFoQjtNQUNJLEtBQUEsR0FBUSxDQUFDLE1BRGI7O0lBR0EsSUFBRyxRQUFBLEtBQVksQ0FBWixJQUFpQixXQUFXLENBQUMsWUFBWSxDQUFDLElBQTdDO01BQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLElBQWlCLEtBQUEsR0FBUTttREFDekIsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFFBQVEsZUFGeEI7S0FBQSxNQUFBO2FBSUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBM0IsRUFBa0MsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsR0FBZ0IsS0FBQSxHQUFRLFFBQXpCLENBQUEsR0FBcUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUEvRSxFQUFzRixRQUF0RixFQUpKOztFQVJJOzs7QUFjUjs7Ozs7OztzQ0FNQSxJQUFBLEdBQU0sU0FBQTtBQUNGLFFBQUE7SUFBQSxzQ0FBVSxDQUFFLGtCQUFULElBQXFCLFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBakQ7TUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsR0FBZ0IsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUM7YUFDN0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLEdBQW9CLE1BRnhCOztFQURFOzs7O0dBMUY4QixFQUFFLENBQUM7O0FBK0YzQyxFQUFFLENBQUMseUJBQUgsR0FBK0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9Sb3RhdGVBbmltYXRpb25cbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9Sb3RhdGVBbmltYXRpb24gZXh0ZW5kcyBncy5Db21wb25lbnRfQW5pbWF0aW9uXG4gICAgIyMjKlxuICAgICogRXhlY3V0ZXMgYSByb3RhdGUtYW5pbWF0aW9uIG9uIGEgZ2FtZS1vYmplY3QuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9Sb3RhdGVBbmltYXRpb25cbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudF9BbmltYXRpb25cbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChkYXRhKSAtPlxuICAgICAgICBzdXBlclxuXG4gICAgICAgIEBlYXNpbmcgPSBuZXcgZ3MuRWFzaW5nKG51bGwsIGRhdGE/LmVhc2luZylcbiAgICAgICAgQGNhbGxiYWNrID0gbnVsbFxuXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyB0aGUgcm90YXRlLWFuaW1hdGlvbiBpbnRvIGEgZGF0YS1idW5kbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB0b0RhdGFCdW5kbGVcbiAgICAjIyNcbiAgICB0b0RhdGFCdW5kbGU6IC0+XG4gICAgICAgIGVhc2luZzogQGVhc2luZ1xuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgcm90YXRlLWFuaW1hdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBpZiBub3QgQGVhc2luZy5pc1J1bm5pbmcgdGhlbiByZXR1cm5cblxuICAgICAgICBAZWFzaW5nLnVwZGF0ZVZhbHVlKClcbiAgICAgICAgQG9iamVjdC5hbmdsZSA9IEBlYXNpbmcudmFsdWVcblxuICAgICAgICBpZiBub3QgQGVhc2luZy5pc1J1bm5pbmcgYW5kIG5vdCBAZWFzaW5nLmlzRW5kbGVzc1xuICAgICAgICAgICAgQG9iamVjdC5hbmdsZSA9IE1hdGgucm91bmQoQG9iamVjdC5hbmdsZSlcbiAgICAgICAgICAgIEBjYWxsYmFjaz8oQG9iamVjdCwgdGhpcylcblxuXG4gICAgIyMjKlxuICAgICogU3RhcnRzIHRoZSByb3RhdGUtYW5pbWF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2Qgcm90YXRlVG9cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSBUaGUgdGFyZ2V0IGFuZ2xlXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmdUeXBlIFRoZSBlYXNpbmctdHlwZS5cbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWxsYmFja10gQW4gb3B0aW9uYWwgY2FsbGJhY2sgY2FsbGVkIGlmIHRoZSBhbmltYXRpb24gaXMgZmluaXNoZWQuXG4gICAgIyMjXG4gICAgcm90YXRlVG86IChhbmdsZSwgZHVyYXRpb24sIGVhc2luZ1R5cGUsIGNhbGxiYWNrKSAtPlxuICAgICAgICBAZWFzaW5nLnR5cGUgPSBlYXNpbmdUeXBlIHx8IGdzLkVhc2luZ3MuRUFTRV9MSU5FQVJbZ3MuRWFzaW5nVHlwZXMuRUFTRV9JTl1cbiAgICAgICAgQGNhbGxiYWNrID0gY2FsbGJhY2tcblxuICAgICAgICBpZiBkdXJhdGlvbiA9PSAwIG9yIEdhbWVNYW5hZ2VyLnRlbXBTZXR0aW5ncy5za2lwXG4gICAgICAgICAgICBAb2JqZWN0LmFuZ2xlID0gYW5nbGVcbiAgICAgICAgICAgIEBjYWxsYmFjaz8oQG9iamVjdCwgdGhpcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGVhc2luZy5zdGFydFZhbHVlKEBvYmplY3QuYW5nbGUsIGFuZ2xlIC0gQG9iamVjdC5hbmdsZSwgZHVyYXRpb24pXG5cbiAgICAjIyMqXG4gICAgKiBTdGFydHMgdGhlIHJvdGF0ZS1hbmltYXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCBzdGFydFxuICAgICogQHBhcmFtIHtncy5Sb3RhdGlvbkRpcmVjdGlvbn0gZGlyZWN0aW9uIFRoZSByb3RhdGlvbiBkaXJlY3Rpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gc3BlZWQgVGhlIHJvdGF0aW9uIHNwZWVkIGluIGRlZ3JlZXMgcGVyIGZyYW1lLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIFRoZSBkdXJhdGlvbiBpbiBmcmFtZXMuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZWFzaW5nVHlwZSBUaGUgZWFzaW5nLXR5cGUuXG4gICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbY2FsbGJhY2tdIEFuIG9wdGlvbmFsIGNhbGxiYWNrIGNhbGxlZCBpZiB0aGUgYW5pbWF0aW9uIGlzIGZpbmlzaGVkLlxuICAgICMjI1xuICAgIHJvdGF0ZTogKGRpcmVjdGlvbiwgc3BlZWQsIGR1cmF0aW9uLCBlYXNpbmdUeXBlLCBjYWxsYmFjaykgLT5cbiAgICAgICAgQGVhc2luZy50eXBlID0gZWFzaW5nVHlwZSB8fCBncy5FYXNpbmdzLkVBU0VfTElORUFSW2dzLkVhc2luZ1R5cGVzLkVBU0VfSU5dXG4gICAgICAgIEBjYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgICAgIEBzcGVlZCA9IHNwZWVkXG4gICAgICAgIEBvcmdBbmdsZSA9IEBvYmplY3QuYW5nbGVcbiAgICAgICAgaWYgZGlyZWN0aW9uID09IDFcbiAgICAgICAgICAgIHNwZWVkID0gLXNwZWVkXG5cbiAgICAgICAgaWYgZHVyYXRpb24gPT0gMCBvciBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3Muc2tpcFxuICAgICAgICAgICAgQG9iamVjdC5hbmdsZSArPSBzcGVlZCAqIGR1cmF0aW9uXG4gICAgICAgICAgICBAY2FsbGJhY2s/KEBvYmplY3QsIHRoaXMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBlYXNpbmcuc3RhcnRWYWx1ZShAb2JqZWN0LmFuZ2xlLCAoQG9iamVjdC5hbmdsZSArIHNwZWVkICogZHVyYXRpb24pIC0gQG9iamVjdC5hbmdsZSwgZHVyYXRpb24pXG5cbiAgICAjIyMqXG4gICAgKiBTa2lwcyB0aGUgYW5pbWF0aW9uLiBUaGF0IGlzIHVzZWQgdG8gc2tpcCBhbiBhbmltYXRpb24gaWYgdGhlIHVzZXJcbiAgICAqIHdhbnRzIHRvIHNraXAgdmVyeSBmYXN0IHRocm91Z2ggYSB2aXN1YWwgbm92ZWwgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBza2lwXG4gICAgIyMjXG4gICAgc2tpcDogLT5cbiAgICAgICAgaWYgQGVhc2luZz8uZHVyYXRpb24gPj0gR2FtZU1hbmFnZXIudGVtcFNldHRpbmdzLnNraXBUaW1lXG4gICAgICAgICAgICBAb2JqZWN0LmFuZ2xlID0gQG9yZ0FuZ2xlICsgQHNwZWVkICogQGVhc2luZy5kdXJhdGlvblxuICAgICAgICAgICAgQGVhc2luZy5pc1J1bm5pbmcgPSBub1xuXG5ncy5Db21wb25lbnRfUm90YXRlQW5pbWF0aW9uID0gQ29tcG9uZW50X1JvdGF0ZUFuaW1hdGlvbiJdfQ==
//# sourceURL=Component_RotateAnimation_99.js