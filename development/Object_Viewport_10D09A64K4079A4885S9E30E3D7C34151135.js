var Object_Viewport,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Viewport = (function(superClass) {
  extend(Object_Viewport, superClass);

  Object_Viewport.objectCodecBlackList = ["parent"];


  /**
  * A game object used for viewports.
  *
  * @module gs
  * @class Object_Viewport
  * @extends gs.Object_Visual
  * @memberof gs
  * @constructor
   */

  function Object_Viewport(viewport) {
    Object_Viewport.__super__.constructor.call(this);
    if (viewport) {
      this.dstRect = new Rect(viewport.rect.x, viewport.rect.y, viewport.rect.width, viewport.rect.height);
    } else {
      this.dstRect = new Rect(0, 0, Graphics.width, Graphics.height);
    }

    /**
    * The color tone of the object used for the visual presentation.
    * @property tone
    * @type gs.Tone
     */
    this.tone = new Tone(0, 0, 0, 0);

    /**
    * The color of the object used for the visual presentation.
    * @property color
    * @type gs.Color
     */
    this.color = new Color(255, 255, 255, 0);

    /**
    * The rotation-angle of the picture in degrees. The rotation center depends on the
    * anchor-point.
    * @property angle
    * @type number
     */
    this.angle = 0;

    /**
    * The object's animator-component to execute different kind of animations like move, rotate, etc. on it.
    * @property animator
    * @type vn.Component_Animator
     */
    this.animator = new gs.Component_Animator();

    /**
    * The object's visual-component to display the game object on screen.
    * @property visual
    * @type gs.Component_Sprite
     */
    this.visual = new gs.Component_Viewport(viewport);
    this.addComponent(this.visual);
    this.addComponent(this.animator);
  }


  /**
  * Serializes the object into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Object_Viewport.prototype.toDataBundle = function() {
    var components, result;
    components = this.componentsToDataBundle(gs.Component_Animation);
    result = {
      dstRect: this.dstRect,
      origin: this.origin,
      zIndex: this.zIndex,
      motionBlur: this.motionBlur,
      zoom: this.zoom,
      angle: this.angle,
      anchor: this.anchor,
      offset: this.offset,
      tone: this.tone,
      image: this.image,
      components: components
    };
    return result;
  };

  return Object_Viewport;

})(gs.Object_Visual);

gs.Object_Viewport = Object_Viewport;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsZUFBQTtFQUFBOzs7QUFBTTs7O0VBQ0YsZUFBQyxDQUFBLG9CQUFELEdBQXdCLENBQUMsUUFBRDs7O0FBRXhCOzs7Ozs7Ozs7O0VBU2EseUJBQUMsUUFBRDtJQUNULCtDQUFBO0lBRUEsSUFBRyxRQUFIO01BQ0ksSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLElBQUEsQ0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQW5CLEVBQXNCLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBcEMsRUFBdUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFyRCxFQUE0RCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQTFFLEVBRG5CO0tBQUEsTUFBQTtNQUdJLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxJQUFBLENBQUssQ0FBTCxFQUFRLENBQVIsRUFBVyxRQUFRLENBQUMsS0FBcEIsRUFBMkIsUUFBUSxDQUFDLE1BQXBDLEVBSG5COzs7QUFLQTs7Ozs7SUFLQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsSUFBQSxDQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLENBQWQ7O0FBRVo7Ozs7O0lBS0EsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixDQUFyQjs7QUFFYjs7Ozs7O0lBTUEsSUFBQyxDQUFBLEtBQUQsR0FBUzs7QUFFVDs7Ozs7SUFLQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEVBQUUsQ0FBQyxrQkFBSCxDQUFBOztBQUVoQjs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLGtCQUFILENBQXNCLFFBQXRCO0lBRWQsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsTUFBZjtJQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLFFBQWY7RUE3Q1M7OztBQWlEYjs7Ozs7Ozs0QkFNQSxZQUFBLEdBQWMsU0FBQTtBQUNWLFFBQUE7SUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLHNCQUFELENBQXdCLEVBQUUsQ0FBQyxtQkFBM0I7SUFFYixNQUFBLEdBQVM7TUFDTCxPQUFBLEVBQVMsSUFBQyxDQUFBLE9BREw7TUFFTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BRko7TUFHTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BSEo7TUFJTCxVQUFBLEVBQVksSUFBQyxDQUFBLFVBSlI7TUFLTCxJQUFBLEVBQU0sSUFBQyxDQUFBLElBTEY7TUFNTCxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBTkg7TUFPTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BUEo7TUFRTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BUko7TUFTTCxJQUFBLEVBQU0sSUFBQyxDQUFBLElBVEY7TUFVTCxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBVkg7TUFXTCxVQUFBLEVBQVksVUFYUDs7QUFjVCxXQUFPO0VBakJHOzs7O0dBbkVZLEVBQUUsQ0FBQzs7QUFzRmpDLEVBQUUsQ0FBQyxlQUFILEdBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBPYmplY3RfVmlld3BvcnRcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdF9WaWV3cG9ydCBleHRlbmRzIGdzLk9iamVjdF9WaXN1YWxcbiAgICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJwYXJlbnRcIl1cbiAgICBcbiAgICAjIyMqXG4gICAgKiBBIGdhbWUgb2JqZWN0IHVzZWQgZm9yIHZpZXdwb3J0cy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgT2JqZWN0X1ZpZXdwb3J0XG4gICAgKiBAZXh0ZW5kcyBncy5PYmplY3RfVmlzdWFsXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAodmlld3BvcnQpIC0+XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgIGlmIHZpZXdwb3J0XG4gICAgICAgICAgICBAZHN0UmVjdCA9IG5ldyBSZWN0KHZpZXdwb3J0LnJlY3QueCwgdmlld3BvcnQucmVjdC55LCB2aWV3cG9ydC5yZWN0LndpZHRoLCB2aWV3cG9ydC5yZWN0LmhlaWdodClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGRzdFJlY3QgPSBuZXcgUmVjdCgwLCAwLCBHcmFwaGljcy53aWR0aCwgR3JhcGhpY3MuaGVpZ2h0KVxuICAgICAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY29sb3IgdG9uZSBvZiB0aGUgb2JqZWN0IHVzZWQgZm9yIHRoZSB2aXN1YWwgcHJlc2VudGF0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0b25lXG4gICAgICAgICogQHR5cGUgZ3MuVG9uZVxuICAgICAgICAjIyNcbiAgICAgICAgQHRvbmUgPSBuZXcgVG9uZSgwLCAwLCAwLCAwKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjb2xvciBvZiB0aGUgb2JqZWN0IHVzZWQgZm9yIHRoZSB2aXN1YWwgcHJlc2VudGF0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb2xvclxuICAgICAgICAqIEB0eXBlIGdzLkNvbG9yXG4gICAgICAgICMjI1xuICAgICAgICBAY29sb3IgPSBuZXcgQ29sb3IoMjU1LCAyNTUsIDI1NSwgMClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgcm90YXRpb24tYW5nbGUgb2YgdGhlIHBpY3R1cmUgaW4gZGVncmVlcy4gVGhlIHJvdGF0aW9uIGNlbnRlciBkZXBlbmRzIG9uIHRoZVxuICAgICAgICAqIGFuY2hvci1wb2ludC5cbiAgICAgICAgKiBAcHJvcGVydHkgYW5nbGVcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBhbmdsZSA9IDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIGFuaW1hdG9yLWNvbXBvbmVudCB0byBleGVjdXRlIGRpZmZlcmVudCBraW5kIG9mIGFuaW1hdGlvbnMgbGlrZSBtb3ZlLCByb3RhdGUsIGV0Yy4gb24gaXQuXG4gICAgICAgICogQHByb3BlcnR5IGFuaW1hdG9yXG4gICAgICAgICogQHR5cGUgdm4uQ29tcG9uZW50X0FuaW1hdG9yXG4gICAgICAgICMjI1xuICAgICAgICBAYW5pbWF0b3IgPSBuZXcgZ3MuQ29tcG9uZW50X0FuaW1hdG9yKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgdmlzdWFsLWNvbXBvbmVudCB0byBkaXNwbGF5IHRoZSBnYW1lIG9iamVjdCBvbiBzY3JlZW4uXG4gICAgICAgICogQHByb3BlcnR5IHZpc3VhbFxuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudF9TcHJpdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEB2aXN1YWwgPSBuZXcgZ3MuQ29tcG9uZW50X1ZpZXdwb3J0KHZpZXdwb3J0KVxuICAgICAgICBcbiAgICAgICAgQGFkZENvbXBvbmVudChAdmlzdWFsKVxuICAgICAgICBAYWRkQ29tcG9uZW50KEBhbmltYXRvcilcbiAgICAgICAgXG4gICAgICAgICNAdXBkYXRlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyB0aGUgb2JqZWN0IGludG8gYSBkYXRhLWJ1bmRsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRvRGF0YUJ1bmRsZVxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgZGF0YS1idW5kbGUuXG4gICAgIyMjIFxuICAgIHRvRGF0YUJ1bmRsZTogLT5cbiAgICAgICAgY29tcG9uZW50cyA9IEBjb21wb25lbnRzVG9EYXRhQnVuZGxlKGdzLkNvbXBvbmVudF9BbmltYXRpb24pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIGRzdFJlY3Q6IEBkc3RSZWN0LFxuICAgICAgICAgICAgb3JpZ2luOiBAb3JpZ2luLFxuICAgICAgICAgICAgekluZGV4OiBAekluZGV4LFxuICAgICAgICAgICAgbW90aW9uQmx1cjogQG1vdGlvbkJsdXIsXG4gICAgICAgICAgICB6b29tOiBAem9vbSxcbiAgICAgICAgICAgIGFuZ2xlOiBAYW5nbGUsXG4gICAgICAgICAgICBhbmNob3I6IEBhbmNob3IsXG4gICAgICAgICAgICBvZmZzZXQ6IEBvZmZzZXQsXG4gICAgICAgICAgICB0b25lOiBAdG9uZSxcbiAgICAgICAgICAgIGltYWdlOiBAaW1hZ2UsXG4gICAgICAgICAgICBjb21wb25lbnRzOiBjb21wb25lbnRzXG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICBcbmdzLk9iamVjdF9WaWV3cG9ydCA9IE9iamVjdF9WaWV3cG9ydCJdfQ==
//# sourceURL=Object_Viewport_43.js