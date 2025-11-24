var Object_Hotspot,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Hotspot = (function(superClass) {
  extend(Object_Hotspot, superClass);

  Object.defineProperty(Object_Hotspot.prototype, "selected", {
    set: function(v) {
      return this.behavior.selected = v;
    },
    get: function() {
      return this.behavior.selected;
    }
  });


  /**
  * A hotspot object to define an area on the screen which can respond
  * to user-actions like mouse/touch actions. A hotspot can have multiple
  * images for different states like hovered, selected, etc.
  *
  * @module ui
  * @class Object_Hotspot
  * @extends ui.Object_UIElement
  * @memberof ui
  * @constructor
   */

  function Object_Hotspot(imageName, imageHandling, flipX) {
    Object_Hotspot.__super__.constructor.apply(this, arguments);

    /**
    * The UI object's source rectangle on screen.
    * @property srcRect
    * @type gs.Rect
     */
    this.srcRect = null;

    /**
    * The UI object's visual-component to display the game object on screen.
    * @property visual
    * @type gs.Component_Frame
     */
    this.visual = new gs.Component_Sprite();

    /**
    * The object's image-handling.
    * @property imageHandling
    * @type gs.ImageHandling
     */
    this.imageHandling = imageHandling != null ? imageHandling : 1;

    /**
    * A behavior-component to hotspot-specific behavior to the object.
    * @property behavior
    * @type gs.Component_HotspotBehavior
     */
    this.behavior = new gs.Component_HotspotBehavior();
    this.behavior.imageHandling = this.imageHandling;

    /**
    * The UI object's bitmap used for visual presentation.
    * @property bitmap
    * @type gs.Bitmap
     */
    this.bitmap = ResourceManager.getBitmap("Graphics/Pictures/" + imageName);
    if (this.bitmap != null) {
      if (this.imageHandling === 1) {
        this.srcRect = new Rect(0, this.bitmap.height / 2, this.bitmap.width, this.bitmap.height / 2);
      } else {
        this.srcRect = new Rect(0, 0, this.bitmap.width || 1, this.bitmap.height || 1);
      }
      this.dstRect.set(0, 0, this.srcRect.width || 1, this.srcRect.height || 1);
    } else {
      this.srcRect = new Rect(0, 0, 1, 1);
      this.dstRect.set(0, 0, 1, 1);
    }
    if (flipX) {
      this.visual.mirror = true;
    }
    this.addComponent(this.behavior);
    this.addComponent(this.visual);
  }

  return Object_Hotspot;

})(ui.Object_UIElement);

ui.Object_Hotspot = Object_Hotspot;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsY0FBQTtFQUFBOzs7QUFBTTs7O0VBQ0YsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsY0FBYyxDQUFDLFNBQXJDLEVBQWdELFVBQWhELEVBQ0k7SUFBQSxHQUFBLEVBQUssU0FBQyxDQUFEO2FBQU8sSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLEdBQXFCO0lBQTVCLENBQUw7SUFDQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQSxRQUFRLENBQUM7SUFBYixDQURMO0dBREo7OztBQUtBOzs7Ozs7Ozs7Ozs7RUFXYSx3QkFBQyxTQUFELEVBQVksYUFBWixFQUEyQixLQUEzQjtJQUNULGlEQUFBLFNBQUE7O0FBRUE7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLGdCQUFILENBQUE7O0FBRWQ7Ozs7O0lBS0EsSUFBQyxDQUFBLGFBQUQsMkJBQWlCLGdCQUFnQjs7QUFFakM7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxFQUFFLENBQUMseUJBQUgsQ0FBQTtJQUNoQixJQUFDLENBQUEsUUFBUSxDQUFDLGFBQVYsR0FBMEIsSUFBQyxDQUFBOztBQUUzQjs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVLGVBQWUsQ0FBQyxTQUFoQixDQUEwQixvQkFBQSxHQUFxQixTQUEvQztJQUVWLElBQUcsbUJBQUg7TUFDSSxJQUFHLElBQUMsQ0FBQSxhQUFELEtBQWtCLENBQXJCO1FBQ0ksSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLElBQUEsQ0FBSyxDQUFMLEVBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCLENBQXpCLEVBQTRCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBcEMsRUFBMkMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCLENBQTVELEVBRG5CO09BQUEsTUFBQTtRQUdJLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxJQUFBLENBQUssQ0FBTCxFQUFRLENBQVIsRUFBVyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsSUFBaUIsQ0FBNUIsRUFBK0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLElBQWtCLENBQWpELEVBSG5COztNQUlBLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFULElBQWtCLENBQXJDLEVBQXdDLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxJQUFtQixDQUEzRCxFQUxKO0tBQUEsTUFBQTtNQU9JLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxJQUFBLENBQUssQ0FBTCxFQUFRLENBQVIsRUFBVyxDQUFYLEVBQWMsQ0FBZDtNQUNmLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBb0IsQ0FBcEIsRUFBd0IsQ0FBeEIsRUFSSjs7SUFVQSxJQUFHLEtBQUg7TUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsS0FEckI7O0lBR0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsUUFBZjtJQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLE1BQWY7RUFyRFM7Ozs7R0FqQlksRUFBRSxDQUFDOztBQXdFaEMsRUFBRSxDQUFDLGNBQUgsR0FBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9Ib3RzcG90XG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBPYmplY3RfSG90c3BvdCBleHRlbmRzIHVpLk9iamVjdF9VSUVsZW1lbnRcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0X0hvdHNwb3QucHJvdG90eXBlLCBcInNlbGVjdGVkXCIsXG4gICAgICAgIHNldDogKHYpIC0+IEBiZWhhdmlvci5zZWxlY3RlZCA9IHZcbiAgICAgICAgZ2V0OiAtPiBAYmVoYXZpb3Iuc2VsZWN0ZWRcbiAgICApXG4gICAgXG4gICAgIyMjKlxuICAgICogQSBob3RzcG90IG9iamVjdCB0byBkZWZpbmUgYW4gYXJlYSBvbiB0aGUgc2NyZWVuIHdoaWNoIGNhbiByZXNwb25kXG4gICAgKiB0byB1c2VyLWFjdGlvbnMgbGlrZSBtb3VzZS90b3VjaCBhY3Rpb25zLiBBIGhvdHNwb3QgY2FuIGhhdmUgbXVsdGlwbGVcbiAgICAqIGltYWdlcyBmb3IgZGlmZmVyZW50IHN0YXRlcyBsaWtlIGhvdmVyZWQsIHNlbGVjdGVkLCBldGMuXG4gICAgKlxuICAgICogQG1vZHVsZSB1aVxuICAgICogQGNsYXNzIE9iamVjdF9Ib3RzcG90XG4gICAgKiBAZXh0ZW5kcyB1aS5PYmplY3RfVUlFbGVtZW50XG4gICAgKiBAbWVtYmVyb2YgdWlcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjIyBcbiAgICBjb25zdHJ1Y3RvcjogKGltYWdlTmFtZSwgaW1hZ2VIYW5kbGluZywgZmxpcFgpIC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIHNvdXJjZSByZWN0YW5nbGUgb24gc2NyZWVuLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzcmNSZWN0XG4gICAgICAgICogQHR5cGUgZ3MuUmVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQHNyY1JlY3QgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIHZpc3VhbC1jb21wb25lbnQgdG8gZGlzcGxheSB0aGUgZ2FtZSBvYmplY3Qgb24gc2NyZWVuLlxuICAgICAgICAqIEBwcm9wZXJ0eSB2aXN1YWxcbiAgICAgICAgKiBAdHlwZSBncy5Db21wb25lbnRfRnJhbWVcbiAgICAgICAgIyMjXG4gICAgICAgIEB2aXN1YWwgPSBuZXcgZ3MuQ29tcG9uZW50X1Nwcml0ZSgpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIGltYWdlLWhhbmRsaW5nLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpbWFnZUhhbmRsaW5nXG4gICAgICAgICogQHR5cGUgZ3MuSW1hZ2VIYW5kbGluZ1xuICAgICAgICAjIyNcbiAgICAgICAgQGltYWdlSGFuZGxpbmcgPSBpbWFnZUhhbmRsaW5nID8gMVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEEgYmVoYXZpb3ItY29tcG9uZW50IHRvIGhvdHNwb3Qtc3BlY2lmaWMgYmVoYXZpb3IgdG8gdGhlIG9iamVjdC5cbiAgICAgICAgKiBAcHJvcGVydHkgYmVoYXZpb3JcbiAgICAgICAgKiBAdHlwZSBncy5Db21wb25lbnRfSG90c3BvdEJlaGF2aW9yXG4gICAgICAgICMjI1xuICAgICAgICBAYmVoYXZpb3IgPSBuZXcgZ3MuQ29tcG9uZW50X0hvdHNwb3RCZWhhdmlvcigpXG4gICAgICAgIEBiZWhhdmlvci5pbWFnZUhhbmRsaW5nID0gQGltYWdlSGFuZGxpbmdcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgVUkgb2JqZWN0J3MgYml0bWFwIHVzZWQgZm9yIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IGJpdG1hcFxuICAgICAgICAqIEB0eXBlIGdzLkJpdG1hcFxuICAgICAgICAjIyNcbiAgICAgICAgQGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCJHcmFwaGljcy9QaWN0dXJlcy8je2ltYWdlTmFtZX1cIilcbiAgICAgICAgXG4gICAgICAgIGlmIEBiaXRtYXA/XG4gICAgICAgICAgICBpZiBAaW1hZ2VIYW5kbGluZyA9PSAxXG4gICAgICAgICAgICAgICAgQHNyY1JlY3QgPSBuZXcgUmVjdCgwLCBAYml0bWFwLmhlaWdodCAvIDIsIEBiaXRtYXAud2lkdGgsIEBiaXRtYXAuaGVpZ2h0IC8gMilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc3JjUmVjdCA9IG5ldyBSZWN0KDAsIDAsIEBiaXRtYXAud2lkdGggfHwgMSwgQGJpdG1hcC5oZWlnaHQgfHwgMSlcbiAgICAgICAgICAgIEBkc3RSZWN0LnNldCgwLCAwLCBAc3JjUmVjdC53aWR0aCB8fCAxLCBAc3JjUmVjdC5oZWlnaHQgfHwgMSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNyY1JlY3QgPSBuZXcgUmVjdCgwLCAwLCAxLCAxKVxuICAgICAgICAgICAgQGRzdFJlY3Quc2V0KDAsIDAsICAxLCAgMSlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBmbGlwWFxuICAgICAgICAgICAgQHZpc3VhbC5taXJyb3IgPSB5ZXNcbiAgXG4gICAgICAgIEBhZGRDb21wb25lbnQoQGJlaGF2aW9yKVxuICAgICAgICBAYWRkQ29tcG9uZW50KEB2aXN1YWwpXG4gICAgICAgIFxudWkuT2JqZWN0X0hvdHNwb3QgPSBPYmplY3RfSG90c3BvdCJdfQ==
//# sourceURL=Object_Hotspot_41.js