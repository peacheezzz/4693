var Object_Video,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Video = (function(superClass) {
  extend(Object_Video, superClass);

  Object_Video.objectCodecBlackList = ["parent"];


  /**
  * A game object used for custom texts in a scene.
  *
  * @module gs
  * @class Object_Video
  * @extends gs.Object_Visual
  * @memberof gs
  * @constructor
   */

  function Object_Video(data) {
    Object_Video.__super__.constructor.apply(this, arguments);

    /**
    * The object's source rectangle. It controls which part of the object's image is used
    * for visual presentation.
    * @property srcRect
    * @type gs.Rect
     */
    this.srcRect = new Rect();

    /**
    * The object's mask to execute masking-effects on it.
    * @property mask
    * @type gs.Mask
     */
    this.mask = new gs.Mask();

    /**
    * Indicates if the object's visual presentation should be mirrored horizontally.
    * @property mirror
    * @type boolean
     */
    this.mirror = false;

    /**
    * The domain the object belongs to.
    * @property domain
    * @type string
     */
    this.domain = "com.degica.vnm.default";

    /**
    * The name of the video resource used for the visual presentation.
    * @property video
    * @type string
     */
    this.video = "";

    /**
    * Indicates if the video should be looped. The default is <b>false</b>
    * @property loop
    * @type boolean
     */
    this.loop = false;

    /**
    * The rotation-angle of the picture in degrees. The rotation center depends on the
    * anchor-point.
    * @property angle
    * @type number
     */
    this.angle = 0;

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
    this.visual = new gs.Component_Sprite();
    this.addComponent(this.visual);
    this.addComponent(this.animator);
    this.componentsFromDataBundle(data);
    this.update();
  }


  /**
  * Serializes the object into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Object_Video.prototype.toDataBundle = function() {
    var components, result;
    components = this.componentsToDataBundle(gs.Component_Animation);
    result = {
      components: components,
      visible: this.visible,
      dstRect: this.dstRect,
      srcRect: this.srcRect,
      opacity: this.opacity,
      origin: this.origin,
      zIndex: this.zIndex,
      mask: this.mask.toDataBundle(),
      motionBlur: this.motionBlur,
      zoom: this.zoom,
      angle: this.angle,
      anchor: this.anchor,
      offset: this.offset,
      mirror: this.mirror,
      video: this.video,
      loop: this.loop
    };
    return result;
  };

  return Object_Video;

})(gs.Object_Visual);

gs.Object_Video = Object_Video;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsWUFBQTtFQUFBOzs7QUFBTTs7O0VBQ0YsWUFBQyxDQUFBLG9CQUFELEdBQXdCLENBQUMsUUFBRDs7O0FBRXhCOzs7Ozs7Ozs7O0VBU2Esc0JBQUMsSUFBRDtJQUNULCtDQUFBLFNBQUE7O0FBRUE7Ozs7OztJQU1BLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxJQUFBLENBQUE7O0FBRWY7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQUE7O0FBRVo7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVOztBQUVWOzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBRVQ7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBUTs7QUFFUjs7Ozs7O0lBTUEsSUFBQyxDQUFBLEtBQUQsR0FBUzs7QUFFVDs7Ozs7SUFLQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsSUFBQSxDQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLENBQWQ7O0FBRVo7Ozs7O0lBS0EsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixDQUFyQjs7QUFFYjs7Ozs7SUFLQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEVBQUUsQ0FBQyxrQkFBSCxDQUFBOztBQUVoQjs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLGdCQUFILENBQUE7SUFFZCxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxNQUFmO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsUUFBZjtJQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixJQUExQjtJQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7RUFyRlM7OztBQXVGYjs7Ozs7Ozt5QkFNQSxZQUFBLEdBQWMsU0FBQTtBQUNWLFFBQUE7SUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLHNCQUFELENBQXdCLEVBQUUsQ0FBQyxtQkFBM0I7SUFFYixNQUFBLEdBQVM7TUFDTCxVQUFBLEVBQVksVUFEUDtNQUVMLE9BQUEsRUFBUyxJQUFDLENBQUEsT0FGTDtNQUdMLE9BQUEsRUFBUyxJQUFDLENBQUEsT0FITDtNQUlMLE9BQUEsRUFBUyxJQUFDLENBQUEsT0FKTDtNQUtMLE9BQUEsRUFBUyxJQUFDLENBQUEsT0FMTDtNQU1MLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFOSjtNQU9MLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFQSjtNQVFMLElBQUEsRUFBTSxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBQSxDQVJEO01BU0wsVUFBQSxFQUFZLElBQUMsQ0FBQSxVQVRSO01BVUwsSUFBQSxFQUFNLElBQUMsQ0FBQSxJQVZGO01BV0wsS0FBQSxFQUFPLElBQUMsQ0FBQSxLQVhIO01BWUwsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQVpKO01BYUwsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQWJKO01BY0wsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQWRKO01BZUwsS0FBQSxFQUFPLElBQUMsQ0FBQSxLQWZIO01BZ0JMLElBQUEsRUFBTSxJQUFDLENBQUEsSUFoQkY7O0FBbUJULFdBQU87RUF0Qkc7Ozs7R0F6R1MsRUFBRSxDQUFDOztBQWlJOUIsRUFBRSxDQUFDLFlBQUgsR0FBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9WaWRlb1xuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgT2JqZWN0X1ZpZGVvIGV4dGVuZHMgZ3MuT2JqZWN0X1Zpc3VhbFxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcInBhcmVudFwiXVxuICAgIFxuICAgICMjIypcbiAgICAqIEEgZ2FtZSBvYmplY3QgdXNlZCBmb3IgY3VzdG9tIHRleHRzIGluIGEgc2NlbmUuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIE9iamVjdF9WaWRlb1xuICAgICogQGV4dGVuZHMgZ3MuT2JqZWN0X1Zpc3VhbFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIHNvdXJjZSByZWN0YW5nbGUuIEl0IGNvbnRyb2xzIHdoaWNoIHBhcnQgb2YgdGhlIG9iamVjdCdzIGltYWdlIGlzIHVzZWRcbiAgICAgICAgKiBmb3IgdmlzdWFsIHByZXNlbnRhdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgc3JjUmVjdFxuICAgICAgICAqIEB0eXBlIGdzLlJlY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBzcmNSZWN0ID0gbmV3IFJlY3QoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBtYXNrIHRvIGV4ZWN1dGUgbWFza2luZy1lZmZlY3RzIG9uIGl0LlxuICAgICAgICAqIEBwcm9wZXJ0eSBtYXNrXG4gICAgICAgICogQHR5cGUgZ3MuTWFza1xuICAgICAgICAjIyNcbiAgICAgICAgQG1hc2sgPSBuZXcgZ3MuTWFzaygpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBvYmplY3QncyB2aXN1YWwgcHJlc2VudGF0aW9uIHNob3VsZCBiZSBtaXJyb3JlZCBob3Jpem9udGFsbHkuXG4gICAgICAgICogQHByb3BlcnR5IG1pcnJvclxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEBtaXJyb3IgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBkb21haW4gdGhlIG9iamVjdCBiZWxvbmdzIHRvLlxuICAgICAgICAqIEBwcm9wZXJ0eSBkb21haW5cbiAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgIyMjXG4gICAgICAgIEBkb21haW4gPSBcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIlxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBuYW1lIG9mIHRoZSB2aWRlbyByZXNvdXJjZSB1c2VkIGZvciB0aGUgdmlzdWFsIHByZXNlbnRhdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgdmlkZW9cbiAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgIyMjXG4gICAgICAgIEB2aWRlbyA9IFwiXCJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIHZpZGVvIHNob3VsZCBiZSBsb29wZWQuIFRoZSBkZWZhdWx0IGlzIDxiPmZhbHNlPC9iPlxuICAgICAgICAqIEBwcm9wZXJ0eSBsb29wXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQGxvb3AgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSByb3RhdGlvbi1hbmdsZSBvZiB0aGUgcGljdHVyZSBpbiBkZWdyZWVzLiBUaGUgcm90YXRpb24gY2VudGVyIGRlcGVuZHMgb24gdGhlXG4gICAgICAgICogYW5jaG9yLXBvaW50LlxuICAgICAgICAqIEBwcm9wZXJ0eSBhbmdsZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQGFuZ2xlID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjb2xvciB0b25lIG9mIHRoZSBvYmplY3QgdXNlZCBmb3IgdGhlIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IHRvbmVcbiAgICAgICAgKiBAdHlwZSBncy5Ub25lXG4gICAgICAgICMjI1xuICAgICAgICBAdG9uZSA9IG5ldyBUb25lKDAsIDAsIDAsIDApXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGNvbG9yIG9mIHRoZSBvYmplY3QgdXNlZCBmb3IgdGhlIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IGNvbG9yXG4gICAgICAgICogQHR5cGUgZ3MuQ29sb3JcbiAgICAgICAgIyMjXG4gICAgICAgIEBjb2xvciA9IG5ldyBDb2xvcigyNTUsIDI1NSwgMjU1LCAwKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgYW5pbWF0b3ItY29tcG9uZW50IHRvIGV4ZWN1dGUgZGlmZmVyZW50IGtpbmQgb2YgYW5pbWF0aW9ucyBsaWtlIG1vdmUsIHJvdGF0ZSwgZXRjLiBvbiBpdC5cbiAgICAgICAgKiBAcHJvcGVydHkgYW5pbWF0b3JcbiAgICAgICAgKiBAdHlwZSB2bi5Db21wb25lbnRfQW5pbWF0b3JcbiAgICAgICAgIyMjXG4gICAgICAgIEBhbmltYXRvciA9IG5ldyBncy5Db21wb25lbnRfQW5pbWF0b3IoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyB2aXN1YWwtY29tcG9uZW50IHRvIGRpc3BsYXkgdGhlIGdhbWUgb2JqZWN0IG9uIHNjcmVlbi5cbiAgICAgICAgKiBAcHJvcGVydHkgdmlzdWFsXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X1Nwcml0ZVxuICAgICAgICAjIyNcbiAgICAgICAgQHZpc3VhbCA9IG5ldyBncy5Db21wb25lbnRfU3ByaXRlKClcbiAgICAgICAgXG4gICAgICAgIEBhZGRDb21wb25lbnQoQHZpc3VhbClcbiAgICAgICAgQGFkZENvbXBvbmVudChAYW5pbWF0b3IpXG4gICAgICAgIEBjb21wb25lbnRzRnJvbURhdGFCdW5kbGUoZGF0YSlcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIFNlcmlhbGl6ZXMgdGhlIG9iamVjdCBpbnRvIGEgZGF0YS1idW5kbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB0b0RhdGFCdW5kbGVcbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjIyAgICAgXG4gICAgdG9EYXRhQnVuZGxlOiAtPlxuICAgICAgICBjb21wb25lbnRzID0gQGNvbXBvbmVudHNUb0RhdGFCdW5kbGUoZ3MuQ29tcG9uZW50X0FuaW1hdGlvbilcbiAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IGNvbXBvbmVudHMsXG4gICAgICAgICAgICB2aXNpYmxlOiBAdmlzaWJsZSxcbiAgICAgICAgICAgIGRzdFJlY3Q6IEBkc3RSZWN0LFxuICAgICAgICAgICAgc3JjUmVjdDogQHNyY1JlY3QsXG4gICAgICAgICAgICBvcGFjaXR5OiBAb3BhY2l0eSxcbiAgICAgICAgICAgIG9yaWdpbjogQG9yaWdpbixcbiAgICAgICAgICAgIHpJbmRleDogQHpJbmRleCxcbiAgICAgICAgICAgIG1hc2s6IEBtYXNrLnRvRGF0YUJ1bmRsZSgpLFxuICAgICAgICAgICAgbW90aW9uQmx1cjogQG1vdGlvbkJsdXIsXG4gICAgICAgICAgICB6b29tOiBAem9vbSxcbiAgICAgICAgICAgIGFuZ2xlOiBAYW5nbGUsXG4gICAgICAgICAgICBhbmNob3I6IEBhbmNob3IsXG4gICAgICAgICAgICBvZmZzZXQ6IEBvZmZzZXQsXG4gICAgICAgICAgICBtaXJyb3I6IEBtaXJyb3IsXG4gICAgICAgICAgICB2aWRlbzogQHZpZGVvLFxuICAgICAgICAgICAgbG9vcDogQGxvb3BcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgXG5ncy5PYmplY3RfVmlkZW8gPSBPYmplY3RfVmlkZW8iXX0=
//# sourceURL=Object_Video_65.js