var Object_Background,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Background = (function(superClass) {
  extend(Object_Background, superClass);

  Object_Background.objectCodecBlackList = ["parent"];


  /**
  * A game object used for backgrounds in a scene.
  *
  * @module vn
  * @class Object_Background
  * @extends gs.Object_Visual
  * @memberof vn
  * @constructor
   */

  function Object_Background(parent, data) {
    Object_Background.__super__.constructor.call(this, data);
    this.zIndex = 0;

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
    * The rotation-angle of the background in degrees. The rotation center depends on the
    * anchor-point.
    * @property angle
    * @type number
     */
    this.angle = 0;

    /**
    * The object's image used for visual presentation.
    * @property image
    * @type string
     */
    this.image = "";

    /**
    * The color tone of the object used for the visual presentation.
    * @property tone
    * @type gs.Tone
     */
    this.tone = new Tone(0, 0, 0, 0);

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
    this.visual = new gs.Component_TilingPlane();
    this.visual.imageFolder = "Graphics/Backgrounds";
    this.addComponent(this.visual);
    this.addComponent(this.animator);
    this.componentsFromDataBundle(data);
  }


  /**
  * Restores the game object from a data-bundle.
  *
  * @method restore
  * @param {Object} data - The data-bundle.
   */

  Object_Background.prototype.restore = function(data) {
    Object_Background.__super__.restore.call(this, data);
    this.srcRect = gs.Rect.fromObject(data.srcRect);
    this.mask = gs.Mask.fromObject(data.mask);
    return this.visual.looping = data.looping;
  };


  /**
  * Serializes the object into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Object_Background.prototype.toDataBundle = function() {
    var components, result;
    components = this.componentsToDataBundle(gs.Component_Animation);
    result = {
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
      tone: this.tone,
      image: this.image,
      looping: this.visual.looping,
      components: components
    };
    return result;
  };

  return Object_Background;

})(gs.Object_Visual);

vn.Object_Background = Object_Background;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsaUJBQUE7RUFBQTs7O0FBQU07OztFQUNGLGlCQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxRQUFEOzs7QUFFeEI7Ozs7Ozs7Ozs7RUFTYSwyQkFBQyxNQUFELEVBQVMsSUFBVDtJQUNULG1EQUFNLElBQU47SUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVOztBQUVWOzs7Ozs7SUFNQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsSUFBQSxDQUFBOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxFQUFFLENBQUMsSUFBSCxDQUFBOztBQUVaOzs7Ozs7SUFNQSxJQUFDLENBQUEsS0FBRCxHQUFTOztBQUVUOzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBRVQ7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLElBQUEsQ0FBSyxDQUFMLEVBQVEsQ0FBUixFQUFXLENBQVgsRUFBYyxDQUFkOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsRUFBRSxDQUFDLGtCQUFILENBQUE7O0FBRWhCOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxFQUFFLENBQUMscUJBQUgsQ0FBQTtJQUNkLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixHQUFzQjtJQUV0QixJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxNQUFmO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsUUFBZjtJQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixJQUExQjtFQTFEUzs7O0FBOERiOzs7Ozs7OzhCQU1BLE9BQUEsR0FBUyxTQUFDLElBQUQ7SUFDTCwrQ0FBTSxJQUFOO0lBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVIsQ0FBbUIsSUFBSSxDQUFDLE9BQXhCO0lBQ1gsSUFBQyxDQUFBLElBQUQsR0FBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVIsQ0FBbUIsSUFBSSxDQUFDLElBQXhCO1dBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLEdBQWtCLElBQUksQ0FBQztFQUxsQjs7O0FBUVQ7Ozs7Ozs7OEJBTUEsWUFBQSxHQUFjLFNBQUE7QUFDVixRQUFBO0lBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixFQUFFLENBQUMsbUJBQTNCO0lBRWIsTUFBQSxHQUFTO01BQ0wsT0FBQSxFQUFTLElBQUMsQ0FBQSxPQURMO01BRUwsT0FBQSxFQUFTLElBQUMsQ0FBQSxPQUZMO01BR0wsT0FBQSxFQUFTLElBQUMsQ0FBQSxPQUhMO01BSUwsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUpKO01BS0wsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUxKO01BTUwsSUFBQSxFQUFNLElBQUMsQ0FBQSxJQUFJLENBQUMsWUFBTixDQUFBLENBTkQ7TUFPTCxVQUFBLEVBQVksSUFBQyxDQUFBLFVBUFI7TUFRTCxJQUFBLEVBQU0sSUFBQyxDQUFBLElBUkY7TUFTTCxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBVEg7TUFVTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BVko7TUFXTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BWEo7TUFZTCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BWko7TUFhTCxJQUFBLEVBQU0sSUFBQyxDQUFBLElBYkY7TUFjTCxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBZEg7TUFlTCxPQUFBLEVBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQWZaO01BZ0JMLFVBQUEsRUFBWSxVQWhCUDs7QUFtQlQsV0FBTztFQXRCRzs7OztHQTlGYyxFQUFFLENBQUM7O0FBdUhuQyxFQUFFLENBQUMsaUJBQUgsR0FBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9CYWNrZ3JvdW5kXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBPYmplY3RfQmFja2dyb3VuZCBleHRlbmRzIGdzLk9iamVjdF9WaXN1YWxcbiAgICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJwYXJlbnRcIl1cbiAgICBcbiAgICAjIyMqXG4gICAgKiBBIGdhbWUgb2JqZWN0IHVzZWQgZm9yIGJhY2tncm91bmRzIGluIGEgc2NlbmUuXG4gICAgKlxuICAgICogQG1vZHVsZSB2blxuICAgICogQGNsYXNzIE9iamVjdF9CYWNrZ3JvdW5kXG4gICAgKiBAZXh0ZW5kcyBncy5PYmplY3RfVmlzdWFsXG4gICAgKiBAbWVtYmVyb2Ygdm5cbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAocGFyZW50LCBkYXRhKSAtPlxuICAgICAgICBzdXBlcihkYXRhKVxuICAgICAgICBAekluZGV4ID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBzb3VyY2UgcmVjdGFuZ2xlLiBJdCBjb250cm9scyB3aGljaCBwYXJ0IG9mIHRoZSBvYmplY3QncyBpbWFnZSBpcyB1c2VkXG4gICAgICAgICogZm9yIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IHNyY1JlY3RcbiAgICAgICAgKiBAdHlwZSBncy5SZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAc3JjUmVjdCA9IG5ldyBSZWN0KClcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIG1hc2sgdG8gZXhlY3V0ZSBtYXNraW5nLWVmZmVjdHMgb24gaXQuXG4gICAgICAgICogQHByb3BlcnR5IG1hc2tcbiAgICAgICAgKiBAdHlwZSBncy5NYXNrXG4gICAgICAgICMjI1xuICAgICAgICBAbWFzayA9IG5ldyBncy5NYXNrKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgcm90YXRpb24tYW5nbGUgb2YgdGhlIGJhY2tncm91bmQgaW4gZGVncmVlcy4gVGhlIHJvdGF0aW9uIGNlbnRlciBkZXBlbmRzIG9uIHRoZVxuICAgICAgICAqIGFuY2hvci1wb2ludC5cbiAgICAgICAgKiBAcHJvcGVydHkgYW5nbGVcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBhbmdsZSA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgaW1hZ2UgdXNlZCBmb3IgdmlzdWFsIHByZXNlbnRhdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgaW1hZ2VcbiAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbWFnZSA9IFwiXCJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY29sb3IgdG9uZSBvZiB0aGUgb2JqZWN0IHVzZWQgZm9yIHRoZSB2aXN1YWwgcHJlc2VudGF0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0b25lXG4gICAgICAgICogQHR5cGUgZ3MuVG9uZVxuICAgICAgICAjIyNcbiAgICAgICAgQHRvbmUgPSBuZXcgVG9uZSgwLCAwLCAwLCAwKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgYW5pbWF0b3ItY29tcG9uZW50IHRvIGV4ZWN1dGUgZGlmZmVyZW50IGtpbmQgb2YgYW5pbWF0aW9ucyBsaWtlIG1vdmUsIHJvdGF0ZSwgZXRjLiBvbiBpdC5cbiAgICAgICAgKiBAcHJvcGVydHkgYW5pbWF0b3JcbiAgICAgICAgKiBAdHlwZSB2bi5Db21wb25lbnRfQW5pbWF0b3JcbiAgICAgICAgIyMjXG4gICAgICAgIEBhbmltYXRvciA9IG5ldyBncy5Db21wb25lbnRfQW5pbWF0b3IoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyB2aXN1YWwtY29tcG9uZW50IHRvIGRpc3BsYXkgdGhlIGdhbWUgb2JqZWN0IG9uIHNjcmVlbi5cbiAgICAgICAgKiBAcHJvcGVydHkgdmlzdWFsXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X1Nwcml0ZVxuICAgICAgICAjIyNcbiAgICAgICAgQHZpc3VhbCA9IG5ldyBncy5Db21wb25lbnRfVGlsaW5nUGxhbmUoKVxuICAgICAgICBAdmlzdWFsLmltYWdlRm9sZGVyID0gXCJHcmFwaGljcy9CYWNrZ3JvdW5kc1wiXG4gICAgICAgIFxuICAgICAgICBAYWRkQ29tcG9uZW50KEB2aXN1YWwpXG4gICAgICAgIEBhZGRDb21wb25lbnQoQGFuaW1hdG9yKVxuICAgICAgICBAY29tcG9uZW50c0Zyb21EYXRhQnVuZGxlKGRhdGEpXG4gICAgICAgIFxuICAgICAgICAjQHVwZGF0ZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgdGhlIGdhbWUgb2JqZWN0IGZyb20gYSBkYXRhLWJ1bmRsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjIyAgICBcbiAgICByZXN0b3JlOiAoZGF0YSkgLT5cbiAgICAgICAgc3VwZXIoZGF0YSlcbiAgICAgICAgXG4gICAgICAgIEBzcmNSZWN0ID0gZ3MuUmVjdC5mcm9tT2JqZWN0KGRhdGEuc3JjUmVjdClcbiAgICAgICAgQG1hc2sgPSBncy5NYXNrLmZyb21PYmplY3QoZGF0YS5tYXNrKVxuICAgICAgICBAdmlzdWFsLmxvb3BpbmcgPSBkYXRhLmxvb3BpbmdcbiAgICAgICAgXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNlcmlhbGl6ZXMgdGhlIG9iamVjdCBpbnRvIGEgZGF0YS1idW5kbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB0b0RhdGFCdW5kbGVcbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjIyBcbiAgICB0b0RhdGFCdW5kbGU6IC0+XG4gICAgICAgIGNvbXBvbmVudHMgPSBAY29tcG9uZW50c1RvRGF0YUJ1bmRsZShncy5Db21wb25lbnRfQW5pbWF0aW9uKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICBkc3RSZWN0OiBAZHN0UmVjdCxcbiAgICAgICAgICAgIHNyY1JlY3Q6IEBzcmNSZWN0LFxuICAgICAgICAgICAgb3BhY2l0eTogQG9wYWNpdHksXG4gICAgICAgICAgICBvcmlnaW46IEBvcmlnaW4sXG4gICAgICAgICAgICB6SW5kZXg6IEB6SW5kZXgsXG4gICAgICAgICAgICBtYXNrOiBAbWFzay50b0RhdGFCdW5kbGUoKSxcbiAgICAgICAgICAgIG1vdGlvbkJsdXI6IEBtb3Rpb25CbHVyLFxuICAgICAgICAgICAgem9vbTogQHpvb20sXG4gICAgICAgICAgICBhbmdsZTogQGFuZ2xlLFxuICAgICAgICAgICAgYW5jaG9yOiBAYW5jaG9yLFxuICAgICAgICAgICAgb2Zmc2V0OiBAb2Zmc2V0LFxuICAgICAgICAgICAgbWlycm9yOiBAbWlycm9yLFxuICAgICAgICAgICAgdG9uZTogQHRvbmUsXG4gICAgICAgICAgICBpbWFnZTogQGltYWdlLFxuICAgICAgICAgICAgbG9vcGluZzogQHZpc3VhbC5sb29waW5nLFxuICAgICAgICAgICAgY29tcG9uZW50czogY29tcG9uZW50c1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICBcbiAgICBcbnZuLk9iamVjdF9CYWNrZ3JvdW5kID0gT2JqZWN0X0JhY2tncm91bmQiXX0=
//# sourceURL=Object_Background_145.js