var Object_Text,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Text = (function(superClass) {
  extend(Object_Text, superClass);

  Object_Text.objectCodecBlackList = ["parent"];


  /**
  * A game object used for custom texts in a scene.
  *
  * @module gs
  * @class Object_Text
  * @extends gs.Object_Visual
  * @memberof gs
  * @constructor
   */

  function Object_Text(data) {
    Object_Text.__super__.constructor.apply(this, arguments);

    /**
    * The object's bitmap used for visual presentation.
    * @property bitmap
    * @type gs.Bitmap
     */
    this.bitmap = null;

    /**
    * The font used for the text.
    * @property font
    * @type gs.Font
     */
    this.font = new Font(gs.Fonts.TEXT);

    /**
    * Indicates if word-wrap is enabled. If <b>true</b> line-breaks are automatically added.
    * @property wordWrap
    * @type boolean
     */
    this.wordWrap = false;

    /**
    * The domain the object belongs to.
    * @property domain
    * @type string
     */
    this.domain = "com.degica.vnm.default";

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
    * The text to display.
    * @property text
    * @type string
     */
    this.text = "";

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
    * The text-renderer used to render the text.
    * @property textRenderer
    * @type gs.Component_TextRenderer
     */
    this.textRenderer = new gs.Component_TextRenderer();
    this.textRenderer.object = this;

    /**
    * The object's animator-component to execute different kind of animations like move, rotate, etc. on it.
    * @property animator
    * @type gs.Component_Animator
     */
    this.animator = new gs.Component_Animator();

    /**
    * The object's visual-component to display the game object on screen.
    * @property visual
    * @type gs.Component_Sprite
     */
    this.visual = new gs.Component_Sprite(false);

    /**
    * The object's behavior component for the text-specific behavior.
    * @property behavior
    * @type gs.Component_TextBehavior
     */
    this.behavior = new gs.Component_TextBehavior();
    this.addComponent(this.visual);
    this.addComponent(this.behavior);
    this.addComponent(this.animator);
    this.componentsFromDataBundle(data);
  }


  /**
  * Restores the game object from a data-bundle.
  *
  * @method restore
  * @param {Object} data - The data-bundle.
   */

  Object_Text.prototype.restore = function(data) {
    Object_Text.__super__.restore.call(this, data);
    this.srcRect = gs.Rect.fromObject(data.srcRect);
    return this.mask = gs.Mask.fromObject(data.mask);
  };


  /**
  * Serializes the object into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Object_Text.prototype.toDataBundle = function() {
    var components, result;
    components = this.componentsToDataBundle(gs.Component_Animation);
    result = {
      components: components,
      dstRect: this.dstRect,
      srcRect: this.srcRect,
      opacity: this.opacity,
      origin: this.origin,
      offset: this.offset,
      anchor: this.anchor,
      zIndex: this.zIndex,
      mask: this.mask.toDataBundle(),
      motionBlur: this.motionBlur,
      zoom: this.zoom,
      angle: this.angle,
      mirror: this.mirror,
      text: this.text,
      formatting: this.formatting
    };
    return result;
  };

  return Object_Text;

})(gs.Object_Visual);

gs.Object_Text = Object_Text;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsV0FBQTtFQUFBOzs7QUFBTTs7O0VBQ0YsV0FBQyxDQUFBLG9CQUFELEdBQXdCLENBQUMsUUFBRDs7O0FBRXhCOzs7Ozs7Ozs7O0VBU2EscUJBQUMsSUFBRDtJQUNULDhDQUFBLFNBQUE7O0FBRUE7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsSUFBQSxDQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBZDs7QUFFWjs7Ozs7SUFLQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7OztJQU1BLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxJQUFBLENBQUE7O0FBRWY7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQUE7O0FBRVo7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsSUFBRCxHQUFROztBQUVSOzs7Ozs7SUFNQSxJQUFDLENBQUEsS0FBRCxHQUFTOztBQUVUOzs7OztJQUtBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxJQUFBLENBQUssQ0FBTCxFQUFRLENBQVIsRUFBVyxDQUFYLEVBQWMsQ0FBZDs7QUFFWjs7Ozs7SUFLQSxJQUFDLENBQUEsS0FBRCxHQUFhLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLENBQXJCOztBQUViOzs7OztJQUtBLElBQUMsQ0FBQSxZQUFELEdBQW9CLElBQUEsRUFBRSxDQUFDLHNCQUFILENBQUE7SUFDcEIsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLEdBQXVCOztBQUV2Qjs7Ozs7SUFLQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEVBQUUsQ0FBQyxrQkFBSCxDQUFBOztBQUVoQjs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLGdCQUFILENBQW9CLEtBQXBCOztBQUVkOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsRUFBRSxDQUFDLHNCQUFILENBQUE7SUFFaEIsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsTUFBZjtJQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLFFBQWY7SUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxRQUFmO0lBRUEsSUFBQyxDQUFBLHdCQUFELENBQTBCLElBQTFCO0VBbkhTOzs7QUF1SGI7Ozs7Ozs7d0JBTUEsT0FBQSxHQUFTLFNBQUMsSUFBRDtJQUNMLHlDQUFNLElBQU47SUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBUixDQUFtQixJQUFJLENBQUMsT0FBeEI7V0FDWCxJQUFDLENBQUEsSUFBRCxHQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBUixDQUFtQixJQUFJLENBQUMsSUFBeEI7RUFKSDs7O0FBTVQ7Ozs7Ozs7d0JBTUEsWUFBQSxHQUFjLFNBQUE7QUFDVixRQUFBO0lBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixFQUFFLENBQUMsbUJBQTNCO0lBRWIsTUFBQSxHQUFTO01BQ0wsVUFBQSxFQUFZLFVBRFA7TUFFTCxPQUFBLEVBQVMsSUFBQyxDQUFBLE9BRkw7TUFHTCxPQUFBLEVBQVMsSUFBQyxDQUFBLE9BSEw7TUFJTCxPQUFBLEVBQVMsSUFBQyxDQUFBLE9BSkw7TUFLTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BTEo7TUFNTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BTko7TUFPTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BUEo7TUFRTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BUko7TUFTTCxJQUFBLEVBQU0sSUFBQyxDQUFBLElBQUksQ0FBQyxZQUFOLENBQUEsQ0FURDtNQVVMLFVBQUEsRUFBWSxJQUFDLENBQUEsVUFWUjtNQVdMLElBQUEsRUFBTSxJQUFDLENBQUEsSUFYRjtNQVlMLEtBQUEsRUFBTyxJQUFDLENBQUEsS0FaSDtNQWFMLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFiSjtNQWNMLElBQUEsRUFBTSxJQUFDLENBQUEsSUFkRjtNQWVMLFVBQUEsRUFBWSxJQUFDLENBQUEsVUFmUjs7QUFrQlQsV0FBTztFQXJCRzs7OztHQXJKUSxFQUFFLENBQUM7O0FBNEs3QixFQUFFLENBQUMsV0FBSCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogT2JqZWN0X1RleHRcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdF9UZXh0IGV4dGVuZHMgZ3MuT2JqZWN0X1Zpc3VhbFxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcInBhcmVudFwiXVxuICAgIFxuICAgICMjIypcbiAgICAqIEEgZ2FtZSBvYmplY3QgdXNlZCBmb3IgY3VzdG9tIHRleHRzIGluIGEgc2NlbmUuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIE9iamVjdF9UZXh0XG4gICAgKiBAZXh0ZW5kcyBncy5PYmplY3RfVmlzdWFsXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgYml0bWFwIHVzZWQgZm9yIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IGJpdG1hcFxuICAgICAgICAqIEB0eXBlIGdzLkJpdG1hcFxuICAgICAgICAjIyNcbiAgICAgICAgQGJpdG1hcCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZm9udCB1c2VkIGZvciB0aGUgdGV4dC5cbiAgICAgICAgKiBAcHJvcGVydHkgZm9udFxuICAgICAgICAqIEB0eXBlIGdzLkZvbnRcbiAgICAgICAgIyMjXG4gICAgICAgIEBmb250ID0gbmV3IEZvbnQoZ3MuRm9udHMuVEVYVClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgd29yZC13cmFwIGlzIGVuYWJsZWQuIElmIDxiPnRydWU8L2I+IGxpbmUtYnJlYWtzIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3b3JkV3JhcFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEB3b3JkV3JhcCA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGRvbWFpbiB0aGUgb2JqZWN0IGJlbG9uZ3MgdG8uXG4gICAgICAgICogQHByb3BlcnR5IGRvbWFpblxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAjIyNcbiAgICAgICAgQGRvbWFpbiA9IFwiY29tLmRlZ2ljYS52bm0uZGVmYXVsdFwiXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIHNvdXJjZSByZWN0YW5nbGUuIEl0IGNvbnRyb2xzIHdoaWNoIHBhcnQgb2YgdGhlIG9iamVjdCdzIGltYWdlIGlzIHVzZWRcbiAgICAgICAgKiBmb3IgdmlzdWFsIHByZXNlbnRhdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgc3JjUmVjdFxuICAgICAgICAqIEB0eXBlIGdzLlJlY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBzcmNSZWN0ID0gbmV3IFJlY3QoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBtYXNrIHRvIGV4ZWN1dGUgbWFza2luZy1lZmZlY3RzIG9uIGl0LlxuICAgICAgICAqIEBwcm9wZXJ0eSBtYXNrXG4gICAgICAgICogQHR5cGUgZ3MuTWFza1xuICAgICAgICAjIyNcbiAgICAgICAgQG1hc2sgPSBuZXcgZ3MuTWFzaygpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBvYmplY3QncyB2aXN1YWwgcHJlc2VudGF0aW9uIHNob3VsZCBiZSBtaXJyb3JlZCBob3Jpem9udGFsbHkuXG4gICAgICAgICogQHByb3BlcnR5IG1pcnJvclxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEBtaXJyb3IgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSB0ZXh0IHRvIGRpc3BsYXkuXG4gICAgICAgICogQHByb3BlcnR5IHRleHRcbiAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZXh0ID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSByb3RhdGlvbi1hbmdsZSBvZiB0aGUgcGljdHVyZSBpbiBkZWdyZWVzLiBUaGUgcm90YXRpb24gY2VudGVyIGRlcGVuZHMgb24gdGhlXG4gICAgICAgICogYW5jaG9yLXBvaW50LlxuICAgICAgICAqIEBwcm9wZXJ0eSBhbmdsZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQGFuZ2xlID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjb2xvciB0b25lIG9mIHRoZSBvYmplY3QgdXNlZCBmb3IgdGhlIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IHRvbmVcbiAgICAgICAgKiBAdHlwZSBncy5Ub25lXG4gICAgICAgICMjI1xuICAgICAgICBAdG9uZSA9IG5ldyBUb25lKDAsIDAsIDAsIDApXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGNvbG9yIG9mIHRoZSBvYmplY3QgdXNlZCBmb3IgdGhlIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IGNvbG9yXG4gICAgICAgICogQHR5cGUgZ3MuQ29sb3JcbiAgICAgICAgIyMjXG4gICAgICAgIEBjb2xvciA9IG5ldyBDb2xvcigyNTUsIDI1NSwgMjU1LCAwKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSB0ZXh0LXJlbmRlcmVyIHVzZWQgdG8gcmVuZGVyIHRoZSB0ZXh0LlxuICAgICAgICAqIEBwcm9wZXJ0eSB0ZXh0UmVuZGVyZXJcbiAgICAgICAgKiBAdHlwZSBncy5Db21wb25lbnRfVGV4dFJlbmRlcmVyXG4gICAgICAgICMjI1xuICAgICAgICBAdGV4dFJlbmRlcmVyID0gbmV3IGdzLkNvbXBvbmVudF9UZXh0UmVuZGVyZXIoKVxuICAgICAgICBAdGV4dFJlbmRlcmVyLm9iamVjdCA9IHRoaXNcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIGFuaW1hdG9yLWNvbXBvbmVudCB0byBleGVjdXRlIGRpZmZlcmVudCBraW5kIG9mIGFuaW1hdGlvbnMgbGlrZSBtb3ZlLCByb3RhdGUsIGV0Yy4gb24gaXQuXG4gICAgICAgICogQHByb3BlcnR5IGFuaW1hdG9yXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X0FuaW1hdG9yXG4gICAgICAgICMjI1xuICAgICAgICBAYW5pbWF0b3IgPSBuZXcgZ3MuQ29tcG9uZW50X0FuaW1hdG9yKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgdmlzdWFsLWNvbXBvbmVudCB0byBkaXNwbGF5IHRoZSBnYW1lIG9iamVjdCBvbiBzY3JlZW4uXG4gICAgICAgICogQHByb3BlcnR5IHZpc3VhbFxuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudF9TcHJpdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEB2aXN1YWwgPSBuZXcgZ3MuQ29tcG9uZW50X1Nwcml0ZShubylcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgYmVoYXZpb3IgY29tcG9uZW50IGZvciB0aGUgdGV4dC1zcGVjaWZpYyBiZWhhdmlvci5cbiAgICAgICAgKiBAcHJvcGVydHkgYmVoYXZpb3JcbiAgICAgICAgKiBAdHlwZSBncy5Db21wb25lbnRfVGV4dEJlaGF2aW9yXG4gICAgICAgICMjI1xuICAgICAgICBAYmVoYXZpb3IgPSBuZXcgZ3MuQ29tcG9uZW50X1RleHRCZWhhdmlvcigpXG5cbiAgICAgICAgQGFkZENvbXBvbmVudChAdmlzdWFsKVxuICAgICAgICBAYWRkQ29tcG9uZW50KEBiZWhhdmlvcilcbiAgICAgICAgQGFkZENvbXBvbmVudChAYW5pbWF0b3IpXG4gICAgICAgIFxuICAgICAgICBAY29tcG9uZW50c0Zyb21EYXRhQnVuZGxlKGRhdGEpXG4gICAgICAgIFxuICAgICAgICAjQHVwZGF0ZSgpXG4gICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIHRoZSBnYW1lIG9iamVjdCBmcm9tIGEgZGF0YS1idW5kbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN0b3JlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZS5cbiAgICAjIyMgICAgXG4gICAgcmVzdG9yZTogKGRhdGEpIC0+XG4gICAgICAgIHN1cGVyKGRhdGEpXG4gICAgICAgIFxuICAgICAgICBAc3JjUmVjdCA9IGdzLlJlY3QuZnJvbU9iamVjdChkYXRhLnNyY1JlY3QpXG4gICAgICAgIEBtYXNrID0gZ3MuTWFzay5mcm9tT2JqZWN0KGRhdGEubWFzaylcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyB0aGUgb2JqZWN0IGludG8gYSBkYXRhLWJ1bmRsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRvRGF0YUJ1bmRsZVxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgZGF0YS1idW5kbGUuXG4gICAgIyMjICAgIFxuICAgIHRvRGF0YUJ1bmRsZTogLT5cbiAgICAgICAgY29tcG9uZW50cyA9IEBjb21wb25lbnRzVG9EYXRhQnVuZGxlKGdzLkNvbXBvbmVudF9BbmltYXRpb24pXG4gICAgICAgIFxuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICBjb21wb25lbnRzOiBjb21wb25lbnRzLFxuICAgICAgICAgICAgZHN0UmVjdDogQGRzdFJlY3QsXG4gICAgICAgICAgICBzcmNSZWN0OiBAc3JjUmVjdCxcbiAgICAgICAgICAgIG9wYWNpdHk6IEBvcGFjaXR5LFxuICAgICAgICAgICAgb3JpZ2luOiBAb3JpZ2luLFxuICAgICAgICAgICAgb2Zmc2V0OiBAb2Zmc2V0LFxuICAgICAgICAgICAgYW5jaG9yOiBAYW5jaG9yLFxuICAgICAgICAgICAgekluZGV4OiBAekluZGV4LFxuICAgICAgICAgICAgbWFzazogQG1hc2sudG9EYXRhQnVuZGxlKCksXG4gICAgICAgICAgICBtb3Rpb25CbHVyOiBAbW90aW9uQmx1cixcbiAgICAgICAgICAgIHpvb206IEB6b29tLFxuICAgICAgICAgICAgYW5nbGU6IEBhbmdsZSxcbiAgICAgICAgICAgIG1pcnJvcjogQG1pcnJvcixcbiAgICAgICAgICAgIHRleHQ6IEB0ZXh0LFxuICAgICAgICAgICAgZm9ybWF0dGluZzogQGZvcm1hdHRpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgXG5ncy5PYmplY3RfVGV4dCA9IE9iamVjdF9UZXh0Il19
//# sourceURL=Object_Text_130.js