var Component_FrameAnimation,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_FrameAnimation = (function(superClass) {
  extend(Component_FrameAnimation, superClass);


  /**
  * Executes a classic image-frame animation defined in Database. The image in regular
  * contains multiple sub-images (frames) which are then animated
  * by modifying the <b>srcRect</b> property of the game object.
  *
  * @module gs
  * @class Component_FrameAnimation
  * @extends gs.Component_Animation
  * @memberof gs
  * @constructor
  * @param {Object} record - The animation database-record.
   */

  function Component_FrameAnimation(record) {
    Component_FrameAnimation.__super__.constructor.apply(this, arguments);

    /**
    * The database record.
    * @property record
    * @type Object
     */
    this.record = null;

    /**
    * The name of the animation defined in Database.
    * @property name
    * @type string
     */
    this.name = null;

    /**
    * The amount of frames on x-axis.
    * @property framesX
    * @type number
     */
    this.framesX = 1;

    /**
    * The amount of frames on y-axis.
    * @property framesY
    * @type number
     */
    this.framesY = 1;

    /**
    * The frame-range to animation like only Frame 4 - 6 for example.
    * @property frameRange
    * @type gs.Range
     */
    this.frameRange = {
      start: 0,
      end: 0
    };

    /**
    * The frame-range used if the animation gets repeated.
    * @property repetitionFrameRange
    * @type gs.Range
     */
    this.repetitionFrameRange = this.frameRange;

    /**
    * The amount of frames to animate.
    * @property frameCount
    * @type number
    * @protected
     */
    this.frameCount = 1;

    /**
    * The graphic used as image for the animation.
    * @property graphic
    * @type Object
     */
    this.graphic = null;

    /**
    * Indicates if the animation repeats.
    * @property repeat
    * @type boolean
     */
    this.repeat = false;

    /**
    * The position of the animation on the target-object.
    * @property framesY
    * @type gs.AnimationPosition
     */
    this.position = 0;

    /**
    * The duration of a single frame.
    * @property frameDuration
    * @type number
    * @protected
     */
    this.frameDuration = 10;

    /**
    * A frame-counter needed for animation-process.
    * @property frameDuration
    * @type number
    * @protected
     */
    this.frameCounter = 0;

    /**
    * The duration of the animation.
    * @property frameDuration
    * @type number
     */
    this.duration = 10;

    /**
    * Indicates if the animation is currently running.
    * @property isRunning
    * @type boolean
     */
    this.isRunning = false;

    /**
    * Stores frame/pattern-offset.
    * @property patternOffset
    * @type number
    * @protected
     */
    this.patternOffset = this.frameRange.start;

    /**
    * Stores current frame/pattern
    * @property patternOffset
    * @type number
    * @protected
     */
    this.pattern = this.patternOffset;

    /**
    * Indicates if its still the first run of the animation.
    * @property firstRun
    * @type boolean
    * @protected
     */
    this.firstRun = true;
    if (record != null) {
      this.refresh(record);
      this.start();
    }
  }


  /**
  * Serializes the frame-animation into a data-bundle.
  *
  * @method toDataBundle
   */

  Component_FrameAnimation.prototype.toDataBundle = function() {
    return {
      name: this.name,
      framesX: this.framesX,
      framesY: this.framesY,
      frameRange: this.frameRange,
      repetitionFrameRange: this.repetitionFrameRange,
      frameCount: this.frameCount,
      graphic: this.graphic,
      repeat: this.repeat,
      position: this.position,
      frameDuration: this.frameDuration,
      frameCounter: this.frameCounter,
      duration: this.duration,
      isRunning: this.isRunning,
      patternOffset: this.patternOffset,
      pattern: this.pattern,
      firstRun: this.firstRun
    };
  };


  /**
  * Refreshes the animation from the specified database-record.
  *
  * @method refresh
  * @param {Object} record - The animation database-record.
   */

  Component_FrameAnimation.prototype.refresh = function(record) {

    /**
    * The images to animate through.
    * @property images
    * @type string[]
     */
    this.name = record.name;
    this.framesX = record.framesX || 1;
    this.framesY = record.framesY || 1;
    this.frameRange = {
      start: Math.min(record.frameRange.start, record.frameRange.end),
      end: Math.max(record.frameRange.start, record.frameRange.end)
    };
    this.repetitionFrameRange = record.useRepetitionFrameRange && (record.repetitionFrameRange != null) ? record.repetitionFrameRange : this.frameRange;
    this.frameCount = (this.frameRange.end - this.frameRange.start) + 1;
    this.graphic = record.graphic;
    this.repeat = record.repeat || false;
    this.position = record.position;
    this.frameDuration = record.duration != null ? Math.round(record.duration / this.frameCount) : 10;
    this.frameCounter = 0;
    this.duration = record.duration || 10;
    this.isRunning = false;
    this.patternOffset = this.frameRange.start;
    this.pattern = this.patternOffset;
    return this.firstRun = true;
  };


  /**
  * Starts the frame-animation.
  *
  * @method start
   */

  Component_FrameAnimation.prototype.start = function(callback) {
    this.callback = callback;
    this.isRunning = true;
    this.firstRun = true;
    this.frameCounter = 0;
    this.frameCount = (this.frameRange.end - this.frameRange.start) + 1;
    this.frameDuration = Math.round(this.duration / this.frameCount);
    return this.patternOffset = this.frameRange.start - 1;
  };


  /**
  * Updates the frame-animation.
  *
  * @method update
   */

  Component_FrameAnimation.prototype.update = function() {
    var bitmap, column, frameHeight, frameWidth, row;
    Component_FrameAnimation.__super__.update.apply(this, arguments);
    if (!this.isRunning) {
      return;
    }
    if (this.frameCounter >= this.duration) {
      if (this.repeat) {
        this.firstRun = false;
        this.frameCounter = 0;
        this.frameCount = (this.repetitionFrameRange.end - this.repetitionFrameRange.start) + 1;
        this.frameDuration = Math.ceil(this.duration / this.frameCount);
        this.patternOffset = this.repetitionFrameRange.start - 1;
      } else {
        this.isRunning = false;
        if (typeof this.onFinish === "function") {
          this.onFinish(this);
        }
        if (typeof this.callback === "function") {
          this.callback(this.object, this);
        }
        return;
      }
    }
    this.pattern = this.patternOffset + Math.floor(this.frameCounter / this.frameDuration);
    this.frameCounter++;
    if (this.object != null) {
      bitmap = this.object.bitmap || ResourceManager.getBitmap((this.object.imageFolder || "Graphics/Pictures") + "/" + this.object.image);
      if (bitmap != null) {
        frameWidth = Math.floor(bitmap.width / this.framesX);
        frameHeight = Math.floor(bitmap.height / this.framesY);
        column = this.pattern % this.framesX;
        row = Math.floor(this.pattern / this.framesX);
        this.object.srcRect.set(column * frameWidth, row * frameHeight, frameWidth, frameHeight);
        this.object.dstRect.width = this.object.srcRect.width;
        return this.object.dstRect.height = this.object.srcRect.height;
      }
    }
  };

  return Component_FrameAnimation;

})(gs.Component_Animation);

window.Component_FrameAnimation = Component_FrameAnimation;

gs.Component_FrameAnimation = Component_FrameAnimation;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLElBQUEsd0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7OztFQVlhLGtDQUFDLE1BQUQ7SUFDVCwyREFBQSxTQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBUTs7QUFFUjs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUVYOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7O0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYztNQUFFLEtBQUEsRUFBTyxDQUFUO01BQVksR0FBQSxFQUFLLENBQWpCOzs7QUFFZDs7Ozs7SUFLQSxJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBQyxDQUFBOztBQUV6Qjs7Ozs7O0lBTUEsSUFBQyxDQUFBLFVBQUQsR0FBYzs7QUFFZDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUVYOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTs7QUFFWjs7Ozs7O0lBTUEsSUFBQyxDQUFBLGFBQUQsR0FBaUI7O0FBRWpCOzs7Ozs7SUFNQSxJQUFDLENBQUEsWUFBRCxHQUFnQjs7QUFFaEI7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTs7QUFFWjs7Ozs7SUFLQSxJQUFDLENBQUEsU0FBRCxHQUFhOztBQUViOzs7Ozs7SUFNQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUEsVUFBVSxDQUFDOztBQUU3Qjs7Ozs7O0lBTUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUE7O0FBRVo7Ozs7OztJQU1BLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFFWixJQUFHLGNBQUg7TUFDSSxJQUFDLENBQUEsT0FBRCxDQUFTLE1BQVQ7TUFDQSxJ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QUVBLElBQUcsbUJBQUg7TUFDSSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLElBQWtCLGVBQWUsQ0FBQyxTQUFoQixDQUE0QixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixJQUFxQixtQkFBdEIsQ0FBQSxHQUEwQyxHQUExQyxHQUE2QyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQWpGO01BRTNCLElBQUcsY0FBSDtRQUNJLFVBQUEsR0FBYSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBQyxDQUFBLE9BQTNCO1FBQ2IsV0FBQSxHQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBQyxDQUFBLE9BQTVCO1FBQ2QsTUFBQSxHQUFTLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBO1FBQ3JCLEdBQUEsR0FBTSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLE9BQXZCO1FBQ04sSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBaEIsQ0FBb0IsTUFBQSxHQUFTLFVBQTdCLEVBQXlDLEdBQUEsR0FBTSxXQUEvQyxFQUE0RCxVQUE1RCxFQUF3RSxXQUF4RTtRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWhCLEdBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDO2VBQ3hDLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWhCLEdBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BUDdDO09BSEo7O0VBcEJJOzs7O0dBMU4yQixFQUFFLENBQUM7O0FBMlAxQyxNQUFNLENBQUMsd0JBQVAsR0FBa0M7O0FBQ2xDLEVBQUUsQ0FBQyx3QkFBSCxHQUE4QiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X0ZyYW1lQW5pbWF0aW9uXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEZJWE1FOiBUaGlzIGNsYXNzIHN0aWxsIGZvbGxvd3MgZGVwcmVjYXRlZCBydWxlcywgc2hvdWxkIGJlIGZpeGVkLlxuY2xhc3MgQ29tcG9uZW50X0ZyYW1lQW5pbWF0aW9uIGV4dGVuZHMgZ3MuQ29tcG9uZW50X0FuaW1hdGlvblxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIGEgY2xhc3NpYyBpbWFnZS1mcmFtZSBhbmltYXRpb24gZGVmaW5lZCBpbiBEYXRhYmFzZS4gVGhlIGltYWdlIGluIHJlZ3VsYXJcbiAgICAqIGNvbnRhaW5zIG11bHRpcGxlIHN1Yi1pbWFnZXMgKGZyYW1lcykgd2hpY2ggYXJlIHRoZW4gYW5pbWF0ZWRcbiAgICAqIGJ5IG1vZGlmeWluZyB0aGUgPGI+c3JjUmVjdDwvYj4gcHJvcGVydHkgb2YgdGhlIGdhbWUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfRnJhbWVBbmltYXRpb25cbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudF9BbmltYXRpb25cbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcmVjb3JkIC0gVGhlIGFuaW1hdGlvbiBkYXRhYmFzZS1yZWNvcmQuXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChyZWNvcmQpIC0+XG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBkYXRhYmFzZSByZWNvcmQuXG4gICAgICAgICogQHByb3BlcnR5IHJlY29yZFxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQHJlY29yZCA9IG51bGxcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG5hbWUgb2YgdGhlIGFuaW1hdGlvbiBkZWZpbmVkIGluIERhdGFiYXNlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBuYW1lXG4gICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICMjI1xuICAgICAgICBAbmFtZSA9IG51bGxcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGFtb3VudCBvZiBmcmFtZXMgb24geC1heGlzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBmcmFtZXNYXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAZnJhbWVzWCA9IDFcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGFtb3VudCBvZiBmcmFtZXMgb24geS1heGlzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBmcmFtZXNZXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAZnJhbWVzWSA9IDFcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGZyYW1lLXJhbmdlIHRvIGFuaW1hdGlvbiBsaWtlIG9ubHkgRnJhbWUgNCAtIDYgZm9yIGV4YW1wbGUuXG4gICAgICAgICogQHByb3BlcnR5IGZyYW1lUmFuZ2VcbiAgICAgICAgKiBAdHlwZSBncy5SYW5nZVxuICAgICAgICAjIyNcbiAgICAgICAgQGZyYW1lUmFuZ2UgPSB7IHN0YXJ0OiAwLCBlbmQ6IDAgfVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZnJhbWUtcmFuZ2UgdXNlZCBpZiB0aGUgYW5pbWF0aW9uIGdldHMgcmVwZWF0ZWQuXG4gICAgICAgICogQHByb3BlcnR5IHJlcGV0aXRpb25GcmFtZVJhbmdlXG4gICAgICAgICogQHR5cGUgZ3MuUmFuZ2VcbiAgICAgICAgIyMjXG4gICAgICAgIEByZXBldGl0aW9uRnJhbWVSYW5nZSA9IEBmcmFtZVJhbmdlXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBhbW91bnQgb2YgZnJhbWVzIHRvIGFuaW1hdGUuXG4gICAgICAgICogQHByb3BlcnR5IGZyYW1lQ291bnRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAZnJhbWVDb3VudCA9IDFcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdyYXBoaWMgdXNlZCBhcyBpbWFnZSBmb3IgdGhlIGFuaW1hdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgZ3JhcGhpY1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGdyYXBoaWMgPSBudWxsXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgYW5pbWF0aW9uIHJlcGVhdHMuXG4gICAgICAgICogQHByb3BlcnR5IHJlcGVhdFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEByZXBlYXQgPSBub1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgcG9zaXRpb24gb2YgdGhlIGFuaW1hdGlvbiBvbiB0aGUgdGFyZ2V0LW9iamVjdC5cbiAgICAgICAgKiBAcHJvcGVydHkgZnJhbWVzWVxuICAgICAgICAqIEB0eXBlIGdzLkFuaW1hdGlvblBvc2l0aW9uXG4gICAgICAgICMjI1xuICAgICAgICBAcG9zaXRpb24gPSAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBkdXJhdGlvbiBvZiBhIHNpbmdsZSBmcmFtZS5cbiAgICAgICAgKiBAcHJvcGVydHkgZnJhbWVEdXJhdGlvblxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBmcmFtZUR1cmF0aW9uID0gMTBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogQSBmcmFtZS1jb3VudGVyIG5lZWRlZCBmb3IgYW5pbWF0aW9uLXByb2Nlc3MuXG4gICAgICAgICogQHByb3BlcnR5IGZyYW1lRHVyYXRpb25cbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAZnJhbWVDb3VudGVyID0gMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZHVyYXRpb24gb2YgdGhlIGFuaW1hdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgZnJhbWVEdXJhdGlvblxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQGR1cmF0aW9uID0gMTBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBhbmltYXRpb24gaXMgY3VycmVudGx5IHJ1bm5pbmcuXG4gICAgICAgICogQHByb3BlcnR5IGlzUnVubmluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1J1bm5pbmcgPSBub1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgZnJhbWUvcGF0dGVybi1vZmZzZXQuXG4gICAgICAgICogQHByb3BlcnR5IHBhdHRlcm5PZmZzZXRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAcGF0dGVybk9mZnNldCA9IEBmcmFtZVJhbmdlLnN0YXJ0XG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBjdXJyZW50IGZyYW1lL3BhdHRlcm5cbiAgICAgICAgKiBAcHJvcGVydHkgcGF0dGVybk9mZnNldFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBwYXR0ZXJuID0gQHBhdHRlcm5PZmZzZXRcblxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIGl0cyBzdGlsbCB0aGUgZmlyc3QgcnVuIG9mIHRoZSBhbmltYXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IGZpcnN0UnVuXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBmaXJzdFJ1biA9IHllc1xuXG4gICAgICAgIGlmIHJlY29yZD9cbiAgICAgICAgICAgIEByZWZyZXNoKHJlY29yZClcbiAgICAgICAgICAgIEBzdGFydCgpXG5cbiAgICAjIyMqXG4gICAgKiBTZXJpYWxpemVzIHRoZSBmcmFtZS1hbmltYXRpb24gaW50byBhIGRhdGEtYnVuZGxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdG9EYXRhQnVuZGxlXG4gICAgIyMjXG4gICAgdG9EYXRhQnVuZGxlOiAtPlxuICAgICAgICBuYW1lOiBAbmFtZSxcbiAgICAgICAgZnJhbWVzWDogQGZyYW1lc1gsXG4gICAgICAgIGZyYW1lc1k6IEBmcmFtZXNZLFxuICAgICAgICBmcmFtZVJhbmdlOiBAZnJhbWVSYW5nZSxcbiAgICAgICAgcmVwZXRpdGlvbkZyYW1lUmFuZ2U6IEByZXBldGl0aW9uRnJhbWVSYW5nZSxcbiAgICAgICAgZnJhbWVDb3VudDogQGZyYW1lQ291bnQsXG4gICAgICAgIGdyYXBoaWM6IEBncmFwaGljLFxuICAgICAgICByZXBlYXQ6IEByZXBlYXQsXG4gICAgICAgIHBvc2l0aW9uOiBAcG9zaXRpb24sXG4gICAgICAgIGZyYW1lRHVyYXRpb246IEBmcmFtZUR1cmF0aW9uLFxuICAgICAgICBmcmFtZUNvdW50ZXI6IEBmcmFtZUNvdW50ZXIsXG4gICAgICAgIGR1cmF0aW9uOiBAZHVyYXRpb24sXG4gICAgICAgIGlzUnVubmluZzogQGlzUnVubmluZyxcbiAgICAgICAgcGF0dGVybk9mZnNldDogQHBhdHRlcm5PZmZzZXQsXG4gICAgICAgIHBhdHRlcm46IEBwYXR0ZXJuLFxuICAgICAgICBmaXJzdFJ1bjogQGZpcnN0UnVuXG5cbiAgICAjIyMqXG4gICAgKiBSZWZyZXNoZXMgdGhlIGFuaW1hdGlvbiBmcm9tIHRoZSBzcGVjaWZpZWQgZGF0YWJhc2UtcmVjb3JkLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVmcmVzaFxuICAgICogQHBhcmFtIHtPYmplY3R9IHJlY29yZCAtIFRoZSBhbmltYXRpb24gZGF0YWJhc2UtcmVjb3JkLlxuICAgICMjI1xuICAgICMgRklYTUU6IElzIHRoYXQgbWV0aG9kIHN0aWxsIGluIHVzZT9cbiAgICByZWZyZXNoOiAocmVjb3JkKSAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGltYWdlcyB0byBhbmltYXRlIHRocm91Z2guXG4gICAgICAgICogQHByb3BlcnR5IGltYWdlc1xuICAgICAgICAqIEB0eXBlIHN0cmluZ1tdXG4gICAgICAgICMjI1xuICAgICAgICBAbmFtZSA9IHJlY29yZC5uYW1lXG4gICAgICAgIEBmcmFtZXNYID0gcmVjb3JkLmZyYW1lc1ggfHwgMVxuICAgICAgICBAZnJhbWVzWSA9IHJlY29yZC5mcmFtZXNZIHx8IDFcbiAgICAgICAgQGZyYW1lUmFuZ2UgPSB7IHN0YXJ0OiBNYXRoLm1pbihyZWNvcmQuZnJhbWVSYW5nZS5zdGFydCwgcmVjb3JkLmZyYW1lUmFuZ2UuZW5kKSwgZW5kOiBNYXRoLm1heChyZWNvcmQuZnJhbWVSYW5nZS5zdGFydCwgcmVjb3JkLmZyYW1lUmFuZ2UuZW5kKSB9XG4gICAgICAgIEByZXBldGl0aW9uRnJhbWVSYW5nZSA9IGlmIHJlY29yZC51c2VSZXBldGl0aW9uRnJhbWVSYW5nZSBhbmQgcmVjb3JkLnJlcGV0aXRpb25GcmFtZVJhbmdlPyB0aGVuIHJlY29yZC5yZXBldGl0aW9uRnJhbWVSYW5nZSBlbHNlIEBmcmFtZVJhbmdlXG4gICAgICAgIEBmcmFtZUNvdW50ID0gKEBmcmFtZVJhbmdlLmVuZCAtIEBmcmFtZVJhbmdlLnN0YXJ0KSArIDFcbiAgICAgICAgQGdyYXBoaWMgPSByZWNvcmQuZ3JhcGhpY1xuICAgICAgICBAcmVwZWF0ID0gcmVjb3JkLnJlcGVhdCB8fCBub1xuICAgICAgICBAcG9zaXRpb24gPSByZWNvcmQucG9zaXRpb25cblxuICAgICAgICBAZnJhbWVEdXJhdGlvbiA9IGlmIHJlY29yZC5kdXJhdGlvbj8gdGhlbiBNYXRoLnJvdW5kKHJlY29yZC5kdXJhdGlvbiAvIEBmcmFtZUNvdW50KSBlbHNlIDEwXG4gICAgICAgIEBmcmFtZUNvdW50ZXIgPSAwXG4gICAgICAgIEBkdXJhdGlvbiA9IHJlY29yZC5kdXJhdGlvbiB8fCAxMFxuICAgICAgICBAaXNSdW5uaW5nID0gbm9cbiAgICAgICAgQHBhdHRlcm5PZmZzZXQgPSBAZnJhbWVSYW5nZS5zdGFydFxuICAgICAgICBAcGF0dGVybiA9IEBwYXR0ZXJuT2Zmc2V0XG4gICAgICAgIEBmaXJzdFJ1biA9IHllc1xuXG4gICAgIyMjKlxuICAgICogU3RhcnRzIHRoZSBmcmFtZS1hbmltYXRpb24uXG4gICAgKlxuICAgICogQG1ldGhvZCBzdGFydFxuICAgICMjI1xuICAgIHN0YXJ0OiAoY2FsbGJhY2spIC0+XG4gICAgICAgIEBjYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgICAgIEBpc1J1bm5pbmcgPSB5ZXNcbiAgICAgICAgQGZpcnN0UnVuID0geWVzXG4gICAgICAgIEBmcmFtZUNvdW50ZXIgPSAwXG4gICAgICAgIEBmcmFtZUNvdW50ID0gKEBmcmFtZVJhbmdlLmVuZCAtIEBmcmFtZVJhbmdlLnN0YXJ0KSArIDFcbiAgICAgICAgQGZyYW1lRHVyYXRpb24gPSBNYXRoLnJvdW5kKEBkdXJhdGlvbiAvIEBmcmFtZUNvdW50KVxuICAgICAgICBAcGF0dGVybk9mZnNldCA9IEBmcmFtZVJhbmdlLnN0YXJ0IC0gMVxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgZnJhbWUtYW5pbWF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBpZiBub3QgQGlzUnVubmluZyB0aGVuIHJldHVyblxuXG4gICAgICAgIGlmIEBmcmFtZUNvdW50ZXIgPj0gQGR1cmF0aW9uXG4gICAgICAgICAgICBpZiBAcmVwZWF0XG4gICAgICAgICAgICAgICAgQGZpcnN0UnVuID0gbm9cbiAgICAgICAgICAgICAgICBAZnJhbWVDb3VudGVyID0gMFxuICAgICAgICAgICAgICAgIEBmcmFtZUNvdW50ID0gKEByZXBldGl0aW9uRnJhbWVSYW5nZS5lbmQgLSBAcmVwZXRpdGlvbkZyYW1lUmFuZ2Uuc3RhcnQpICsgMVxuICAgICAgICAgICAgICAgIEBmcmFtZUR1cmF0aW9uID0gTWF0aC5jZWlsKEBkdXJhdGlvbiAvIEBmcmFtZUNvdW50KVxuICAgICAgICAgICAgICAgIEBwYXR0ZXJuT2Zmc2V0ID0gQHJlcGV0aXRpb25GcmFtZVJhbmdlLnN0YXJ0IC0gMVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBpc1J1bm5pbmcgPSBub1xuICAgICAgICAgICAgICAgIEBvbkZpbmlzaD8odGhpcylcbiAgICAgICAgICAgICAgICBAY2FsbGJhY2s/KEBvYmplY3QsIHRoaXMpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgQHBhdHRlcm4gPSBAcGF0dGVybk9mZnNldCArIE1hdGguZmxvb3IoQGZyYW1lQ291bnRlciAvIEBmcmFtZUR1cmF0aW9uKVxuICAgICAgICBAZnJhbWVDb3VudGVyKytcblxuICAgICAgICBpZiBAb2JqZWN0P1xuICAgICAgICAgICAgYml0bWFwID0gQG9iamVjdC5iaXRtYXAgfHwgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIiN7QG9iamVjdC5pbWFnZUZvbGRlcnx8XCJHcmFwaGljcy9QaWN0dXJlc1wifS8je0BvYmplY3QuaW1hZ2V9XCIpXG5cbiAgICAgICAgICAgIGlmIGJpdG1hcD9cbiAgICAgICAgICAgICAgICBmcmFtZVdpZHRoID0gTWF0aC5mbG9vcihiaXRtYXAud2lkdGggLyBAZnJhbWVzWClcbiAgICAgICAgICAgICAgICBmcmFtZUhlaWdodCA9IE1hdGguZmxvb3IoYml0bWFwLmhlaWdodCAvIEBmcmFtZXNZKVxuICAgICAgICAgICAgICAgIGNvbHVtbiA9IEBwYXR0ZXJuICUgQGZyYW1lc1hcbiAgICAgICAgICAgICAgICByb3cgPSBNYXRoLmZsb29yKEBwYXR0ZXJuIC8gQGZyYW1lc1gpXG4gICAgICAgICAgICAgICAgQG9iamVjdC5zcmNSZWN0LnNldChjb2x1bW4gKiBmcmFtZVdpZHRoLCByb3cgKiBmcmFtZUhlaWdodCwgZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQpXG4gICAgICAgICAgICAgICAgQG9iamVjdC5kc3RSZWN0LndpZHRoID0gQG9iamVjdC5zcmNSZWN0LndpZHRoXG4gICAgICAgICAgICAgICAgQG9iamVjdC5kc3RSZWN0LmhlaWdodCA9IEBvYmplY3Quc3JjUmVjdC5oZWlnaHRcblxuXG53aW5kb3cuQ29tcG9uZW50X0ZyYW1lQW5pbWF0aW9uID0gQ29tcG9uZW50X0ZyYW1lQW5pbWF0aW9uXG5ncy5Db21wb25lbnRfRnJhbWVBbmltYXRpb24gPSBDb21wb25lbnRfRnJhbWVBbmltYXRpb24iXX0=
//# sourceURL=Component_FrameAnimation_111.js