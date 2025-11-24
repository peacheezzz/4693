var Component_Live2DAnimation,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_Live2DAnimation = (function(superClass) {
  extend(Component_Live2DAnimation, superClass);


  /**
  * Executes an animation on specific Live2D model-parameter of the Live2D  game-object.
  *
  * @module gs
  * @class Component_Live2DAnimation
  * @extends gs.Component_Animation
  * @memberof gs
  * @constructor
   */

  function Component_Live2DAnimation(data) {
    Component_Live2DAnimation.__super__.constructor.apply(this, arguments);

    /**
    * The easing-object used for the animation.
    * @property easing
    * @type gs.Easing
     */
    this.easing = new gs.Easing(null, data != null ? data.easing : void 0);

    /**
    * The parameter name to animate.
    * @property param
    * @type string
     */
    this.param = "";
  }


  /**
  * Serializes the animation into a data-bundle.
  *
  * @method toDataBundle
   */

  Component_Live2DAnimation.prototype.toDataBundle = function() {
    return {
      easing: this.easing
    };
  };


  /**
  * Updates the animation.
  *
  * @method update
   */

  Component_Live2DAnimation.prototype.update = function() {
    Component_Live2DAnimation.__super__.update.apply(this, arguments);
    if (!this.easing.isRunning) {
      return;
    }
    this.easing.updateValue();
    this.object.visual.l2dObject.setParameter(this.param, this.easing.value);
    if (!this.easing.isRunning) {
      return typeof this.callback === "function" ? this.callback(this.object, this) : void 0;
    }
  };


  /**
  * Starts the animation.
  *
  * @method start
  * @param {string} param The name of the parameter to animate.
  * @param {number} value The target value.
  * @param {number} duration The duration in frames.
  * @param {Object} easingType The easing-type.
  * @param {function} [callback] An optional callback called if the animation has been finished.
   */

  Component_Live2DAnimation.prototype.start = function(param, value, duration, easingType, callback) {
    var currentValue;
    currentValue = this.object.visual.l2dObject.getParameter(param);
    this.param = param;
    this.callback = callback;
    this.easing.type = easingType || gs.Easings.EASE_LINEAR[gs.EasingTypes.EASE_IN];
    if (currentValue === value) {
      return typeof this.callback === "function" ? this.callback(this.object, this) : void 0;
    }
    if (duration === 0 || this.isInstantSkip()) {
      this.object.visual.l2dObject.setParameter(param, value);
      return typeof this.callback === "function" ? this.callback(this.object, this) : void 0;
    } else {
      return this.easing.startValue(currentValue, value - currentValue, duration);
    }
  };

  return Component_Live2DAnimation;

})(gs.Component_Animation);

gs.Component_Live2DAnimation = Component_Live2DAnimation;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEseUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OztFQVNhLG1DQUFDLElBQUQ7SUFDVCw0REFBQSxTQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxFQUFFLENBQUMsTUFBSCxDQUFVLElBQVYsaUJBQWdCLElBQUksQ0FBRSxlQUF0Qjs7QUFDZDs7Ozs7SUFLQSxJQUFDLENBQUEsS0FBRCxHQUFTO0VBZEE7OztBQWdCYjs7Ozs7O3NDQUtBLFlBQUEsR0FBYyxTQUFBO1dBQ1Y7TUFBQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BQVQ7O0VBRFU7OztBQUdkOzs7Ozs7c0NBS0EsTUFBQSxHQUFRLFNBQUE7SUFDSix1REFBQSxTQUFBO0lBQ0EsSUFBRyxDQUFJLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBZjtBQUE4QixhQUE5Qjs7SUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQTtJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUF6QixDQUFzQyxJQUFDLENBQUEsS0FBdkMsRUFBOEMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUF0RDtJQUVBLElBQUcsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQWY7bURBQ0ksSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFFBQVEsZUFEeEI7O0VBUEk7OztBQVVSOzs7Ozs7Ozs7OztzQ0FVQSxLQUFBLEdBQU8sU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLFFBQWYsRUFBeUIsVUFBekIsRUFBcUMsUUFBckM7QUFDSCxRQUFBO0lBQUEsWUFBQSxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUF6QixDQUFzQyxLQUF0QztJQUNmLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDVCxJQUFDLENBQUEsUUFBRCxHQUFZO0lBQ1osSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLEdBQWUsVUFBQSxJQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBWSxDQUFBLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBZjtJQUNwRCxJQUFHLFlBQUEsS0FBZ0IsS0FBbkI7QUFBOEIsbURBQU8sSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFFBQVEsZUFBekQ7O0lBRUEsSUFBRyxRQUFBLEtBQVksQ0FBWixJQUFpQixJQUFDLENBQUEsYUFBRCxDQUFBLENBQXBCO01BQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQXpCLENBQXNDLEtBQXRDLEVBQTZDLEtBQTdDO21EQUNBLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxRQUFRLGVBRnhCO0tBQUEsTUFBQTthQUlJLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixZQUFuQixFQUFpQyxLQUFBLEdBQVEsWUFBekMsRUFBdUQsUUFBdkQsRUFKSjs7RUFQRzs7OztHQTNENkIsRUFBRSxDQUFDOztBQXdFM0MsRUFBRSxDQUFDLHlCQUFILEdBQStCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfTGl2ZTJEQW5pbWF0aW9uXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfTGl2ZTJEQW5pbWF0aW9uIGV4dGVuZHMgZ3MuQ29tcG9uZW50X0FuaW1hdGlvblxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIGFuIGFuaW1hdGlvbiBvbiBzcGVjaWZpYyBMaXZlMkQgbW9kZWwtcGFyYW1ldGVyIG9mIHRoZSBMaXZlMkQgIGdhbWUtb2JqZWN0LlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfTGl2ZTJEQW5pbWF0aW9uXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRfQW5pbWF0aW9uXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGVhc2luZy1vYmplY3QgdXNlZCBmb3IgdGhlIGFuaW1hdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgZWFzaW5nXG4gICAgICAgICogQHR5cGUgZ3MuRWFzaW5nXG4gICAgICAgICMjI1xuICAgICAgICBAZWFzaW5nID0gbmV3IGdzLkVhc2luZyhudWxsLCBkYXRhPy5lYXNpbmcpXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgcGFyYW1ldGVyIG5hbWUgdG8gYW5pbWF0ZS5cbiAgICAgICAgKiBAcHJvcGVydHkgcGFyYW1cbiAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgIyMjXG4gICAgICAgIEBwYXJhbSA9IFwiXCJcblxuICAgICMjIypcbiAgICAqIFNlcmlhbGl6ZXMgdGhlIGFuaW1hdGlvbiBpbnRvIGEgZGF0YS1idW5kbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB0b0RhdGFCdW5kbGVcbiAgICAjIyNcbiAgICB0b0RhdGFCdW5kbGU6IC0+XG4gICAgICAgIGVhc2luZzogQGVhc2luZ1xuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgYW5pbWF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBpZiBub3QgQGVhc2luZy5pc1J1bm5pbmcgdGhlbiByZXR1cm5cblxuICAgICAgICBAZWFzaW5nLnVwZGF0ZVZhbHVlKClcbiAgICAgICAgQG9iamVjdC52aXN1YWwubDJkT2JqZWN0LnNldFBhcmFtZXRlcihAcGFyYW0sIEBlYXNpbmcudmFsdWUpXG5cbiAgICAgICAgaWYgbm90IEBlYXNpbmcuaXNSdW5uaW5nXG4gICAgICAgICAgICBAY2FsbGJhY2s/KEBvYmplY3QsIHRoaXMpXG5cbiAgICAjIyMqXG4gICAgKiBTdGFydHMgdGhlIGFuaW1hdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0YXJ0XG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyYW0gVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlciB0byBhbmltYXRlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFRoZSB0YXJnZXQgdmFsdWUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gVGhlIGR1cmF0aW9uIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBlYXNpbmdUeXBlIFRoZSBlYXNpbmctdHlwZS5cbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWxsYmFja10gQW4gb3B0aW9uYWwgY2FsbGJhY2sgY2FsbGVkIGlmIHRoZSBhbmltYXRpb24gaGFzIGJlZW4gZmluaXNoZWQuXG4gICAgIyMjXG4gICAgc3RhcnQ6IChwYXJhbSwgdmFsdWUsIGR1cmF0aW9uLCBlYXNpbmdUeXBlLCBjYWxsYmFjaykgLT5cbiAgICAgICAgY3VycmVudFZhbHVlID0gQG9iamVjdC52aXN1YWwubDJkT2JqZWN0LmdldFBhcmFtZXRlcihwYXJhbSlcbiAgICAgICAgQHBhcmFtID0gcGFyYW1cbiAgICAgICAgQGNhbGxiYWNrID0gY2FsbGJhY2tcbiAgICAgICAgQGVhc2luZy50eXBlID0gZWFzaW5nVHlwZSB8fCBncy5FYXNpbmdzLkVBU0VfTElORUFSW2dzLkVhc2luZ1R5cGVzLkVBU0VfSU5dXG4gICAgICAgIGlmIGN1cnJlbnRWYWx1ZSA9PSB2YWx1ZSB0aGVuIHJldHVybiBAY2FsbGJhY2s/KEBvYmplY3QsIHRoaXMpXG5cbiAgICAgICAgaWYgZHVyYXRpb24gPT0gMCBvciBAaXNJbnN0YW50U2tpcCgpXG4gICAgICAgICAgICBAb2JqZWN0LnZpc3VhbC5sMmRPYmplY3Quc2V0UGFyYW1ldGVyKHBhcmFtLCB2YWx1ZSlcbiAgICAgICAgICAgIEBjYWxsYmFjaz8oQG9iamVjdCwgdGhpcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGVhc2luZy5zdGFydFZhbHVlKGN1cnJlbnRWYWx1ZSwgdmFsdWUgLSBjdXJyZW50VmFsdWUsIGR1cmF0aW9uKVxuXG5ncy5Db21wb25lbnRfTGl2ZTJEQW5pbWF0aW9uID0gQ29tcG9uZW50X0xpdmUyREFuaW1hdGlvbiJdfQ==
//# sourceURL=Component_Live2DAnimation_164.js