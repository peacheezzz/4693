var Object_Image,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Image = (function(superClass) {
  extend(Object_Image, superClass);


  /**
  * An UI image object to display an image on screen.
  *
  * @module ui
  * @class Object_Image
  * @extends ui.Object_UIElement
  * @memberof ui
  * @constructor
   */

  function Object_Image(imageName, imageHandling, imageFolder) {
    Object_Image.__super__.constructor.apply(this, arguments);

    /**
    * The UI object's source rectangle on screen.
    * @property srcRect
    * @type gs.Rect
     */
    this.srcRect = null;

    /**
    * The UI object's rotation-angle in degrees. The rotation center depends on the
    * anchor-point.
    * @property angle
    * @type number
     */
    this.angle = 0;

    /**
    * The UI object's visual-component to display the game object on screen.
    * @property visual
    * @type gs.Component_Sprite
     */
    this.visual = new gs.Component_Sprite();

    /**
    * The UI object's bitmap used for visual presentation.
    * @property bitmap
    * @type gs.Bitmap
     */
    if (imageName) {
      if (imageName[0] === "$") {
        this.bitmap = ResourceManager.getBitmap(imageName);
      } else {
        this.bitmap = ResourceManager.getBitmap((imageFolder || 'Graphics/Pictures') + "/" + imageName);
      }
    }
    if (this.bitmap != null) {
      if (imageHandling === 1) {
        this.srcRect = new Rect(0, this.bitmap.height / 2, this.bitmap.width, this.bitmap.height / 2);
      } else {
        this.srcRect = new Rect(0, 0, this.bitmap.width || 1, this.bitmap.height || 1);
      }
      this.dstRect.set(0, 0, this.srcRect.width || 1, this.srcRect.height || 1);
    } else {
      this.srcRect = new Rect(0, 0, 1, 1);
      this.dstRect.set(0, 0, 1, 1);
    }
    this.addComponent(this.visual);
  }

  return Object_Image;

})(ui.Object_UIElement);

ui.Object_Image = Object_Image;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsWUFBQTtFQUFBOzs7QUFBTTs7OztBQUNGOzs7Ozs7Ozs7O0VBU2Esc0JBQUMsU0FBRCxFQUFZLGFBQVosRUFBMkIsV0FBM0I7SUFDVCwrQ0FBQSxTQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7OztJQU1BLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBRVQ7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxnQkFBSCxDQUFBOztBQUVkOzs7OztJQUtBLElBQUcsU0FBSDtNQUNJLElBQUcsU0FBVSxDQUFBLENBQUEsQ0FBVixLQUFnQixHQUFuQjtRQUNJLElBQUMsQ0FBQSxNQUFELEdBQVUsZUFBZSxDQUFDLFNBQWhCLENBQTBCLFNBQTFCLEVBRGQ7T0FBQSxNQUFBO1FBR0ksSUFBQyxDQUFBLE1BQUQsR0FBVSxlQUFlLENBQUMsU0FBaEIsQ0FBNEIsQ0FBQyxXQUFBLElBQWEsbUJBQWQsQ0FBQSxHQUFrQyxHQUFsQyxHQUFxQyxTQUFqRSxFQUhkO09BREo7O0lBTUEsSUFBRyxtQkFBSDtNQUNJLElBQUcsYUFBQSxLQUFpQixDQUFwQjtRQUNJLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxJQUFBLENBQUssQ0FBTCxFQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFpQixDQUF6QixFQUE0QixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQXBDLEVBQTJDLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFpQixDQUE1RCxFQURuQjtPQUFBLE1BQUE7UUFHSSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsSUFBQSxDQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLElBQWlCLENBQTVCLEVBQStCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixJQUFrQixDQUFqRCxFQUhuQjs7TUFJQSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxJQUFrQixDQUFyQyxFQUF3QyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsSUFBbUIsQ0FBM0QsRUFMSjtLQUFBLE1BQUE7TUFPSSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsSUFBQSxDQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLENBQWQ7TUFDZixJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBUko7O0lBVUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsTUFBZjtFQTlDUzs7OztHQVZVLEVBQUUsQ0FBQzs7QUEwRDlCLEVBQUUsQ0FBQyxZQUFILEdBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBPYmplY3RfSW1hZ2VcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdF9JbWFnZSBleHRlbmRzIHVpLk9iamVjdF9VSUVsZW1lbnRcbiAgICAjIyMqXG4gICAgKiBBbiBVSSBpbWFnZSBvYmplY3QgdG8gZGlzcGxheSBhbiBpbWFnZSBvbiBzY3JlZW4uXG4gICAgKlxuICAgICogQG1vZHVsZSB1aVxuICAgICogQGNsYXNzIE9iamVjdF9JbWFnZVxuICAgICogQGV4dGVuZHMgdWkuT2JqZWN0X1VJRWxlbWVudFxuICAgICogQG1lbWJlcm9mIHVpXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKGltYWdlTmFtZSwgaW1hZ2VIYW5kbGluZywgaW1hZ2VGb2xkZXIpIC0+XG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBVSSBvYmplY3QncyBzb3VyY2UgcmVjdGFuZ2xlIG9uIHNjcmVlbi5cbiAgICAgICAgKiBAcHJvcGVydHkgc3JjUmVjdFxuICAgICAgICAqIEB0eXBlIGdzLlJlY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBzcmNSZWN0ID0gbnVsbFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgVUkgb2JqZWN0J3Mgcm90YXRpb24tYW5nbGUgaW4gZGVncmVlcy4gVGhlIHJvdGF0aW9uIGNlbnRlciBkZXBlbmRzIG9uIHRoZVxuICAgICAgICAqIGFuY2hvci1wb2ludC5cbiAgICAgICAgKiBAcHJvcGVydHkgYW5nbGVcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBhbmdsZSA9IDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIHZpc3VhbC1jb21wb25lbnQgdG8gZGlzcGxheSB0aGUgZ2FtZSBvYmplY3Qgb24gc2NyZWVuLlxuICAgICAgICAqIEBwcm9wZXJ0eSB2aXN1YWxcbiAgICAgICAgKiBAdHlwZSBncy5Db21wb25lbnRfU3ByaXRlXG4gICAgICAgICMjI1xuICAgICAgICBAdmlzdWFsID0gbmV3IGdzLkNvbXBvbmVudF9TcHJpdGUoKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgVUkgb2JqZWN0J3MgYml0bWFwIHVzZWQgZm9yIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IGJpdG1hcFxuICAgICAgICAqIEB0eXBlIGdzLkJpdG1hcFxuICAgICAgICAjIyNcbiAgICAgICAgaWYgaW1hZ2VOYW1lXG4gICAgICAgICAgICBpZiBpbWFnZU5hbWVbMF0gPT0gXCIkXCJcbiAgICAgICAgICAgICAgICBAYml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChpbWFnZU5hbWUpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGJpdG1hcCA9IFJlc291cmNlTWFuYWdlci5nZXRCaXRtYXAoXCIje2ltYWdlRm9sZGVyfHwnR3JhcGhpY3MvUGljdHVyZXMnfS8je2ltYWdlTmFtZX1cIilcblxuICAgICAgICBpZiBAYml0bWFwP1xuICAgICAgICAgICAgaWYgaW1hZ2VIYW5kbGluZyA9PSAxXG4gICAgICAgICAgICAgICAgQHNyY1JlY3QgPSBuZXcgUmVjdCgwLCBAYml0bWFwLmhlaWdodCAvIDIsIEBiaXRtYXAud2lkdGgsIEBiaXRtYXAuaGVpZ2h0IC8gMilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc3JjUmVjdCA9IG5ldyBSZWN0KDAsIDAsIEBiaXRtYXAud2lkdGggfHwgMSwgQGJpdG1hcC5oZWlnaHQgfHwgMSlcbiAgICAgICAgICAgIEBkc3RSZWN0LnNldCgwLCAwLCBAc3JjUmVjdC53aWR0aCB8fCAxLCBAc3JjUmVjdC5oZWlnaHQgfHwgMSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNyY1JlY3QgPSBuZXcgUmVjdCgwLCAwLCAxLCAxKVxuICAgICAgICAgICAgQGRzdFJlY3Quc2V0KDAsIDAsIDEsIDEpXG5cbiAgICAgICAgQGFkZENvbXBvbmVudChAdmlzdWFsKVxuXG51aS5PYmplY3RfSW1hZ2UgPSBPYmplY3RfSW1hZ2UiXX0=
//# sourceURL=Object_Image_51.js