var Object_ImageMap,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_ImageMap = (function(superClass) {
  extend(Object_ImageMap, superClass);

  Object_ImageMap.objectCodecBlackList = ["parent", "subObjects"];


  /**
  * An image-map object to display an image-map on screen. 
  *
  * @module gs
  * @class Object_ImageMap
  * @extends gs.Object_Visual
  * @memberof gs
  * @constructor
   */

  function Object_ImageMap() {
    Object_ImageMap.__super__.constructor.apply(this, arguments);

    /**
    * The names of the images used for the different states of the image-map.<br>
    *
    * - 0 = Ground Image
    * - 1 = Hovered
    * - 2 = Unselected
    * - 3 = Selected
    * - 4 = Selected Hovered
    *
    * @property images
    * @type string[]
     */
    this.images = [];

    /**
    * The hotspot data of the image-map. Each entry is a single hotspot on the image-map.
    * @property hotspots
    * @type gs.ImageMapHotspot[]
     */
    this.hotspots = [];

    /**
    * The domain the object belongs to.
    * @property domain
    * @type string
     */
    this.domain = "com.degica.vnm.default";

    /**
    * The color tone of the object used for the visual presentation.
    * @property tone
    * @type gs.Tone
     */
    this.tone = new gs.Tone(0, 0, 0, 0);

    /**
    * The color of the object used for the visual presentation.
    * @property color
    * @type gs.Color
     */
    this.color = new gs.Color(255, 255, 255, 0);

    /**
    * An event-emitter to emit events.
    * @property events
    * @type gs.Component_EventEmitter
     */
    this.events = new gs.Component_EventEmitter();

    /**
    * The object's animator-component to execute different kind of animations like move, rotate, etc. on it.
    * @property animator
    * @type vn.Component_Animator
     */
    this.animator = new gs.Component_Animator();

    /**
    * The object's visual-component to display the game object on screen.
    * @property visual
    * @type gs.Component_ImageMap
     */
    this.visual = new gs.Component_ImageMap();
    this.addComponent(this.animator);
    this.addComponent(this.visual);
    this.addComponent(this.events);
  }


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  return Object_ImageMap;

})(gs.Object_Visual);

gs.Object_ImageMap = Object_ImageMap;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsZUFBQTtFQUFBOzs7QUFBTTs7O0VBQ0YsZUFBQyxDQUFBLG9CQUFELEdBQXdCLENBQUMsUUFBRCxFQUFXLFlBQVg7OztBQUV4Qjs7Ozs7Ozs7OztFQVNhLHlCQUFBO0lBQ1Qsa0RBQUEsU0FBQTs7QUFFQTs7Ozs7Ozs7Ozs7O0lBWUEsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQVEsQ0FBUixFQUFXLENBQVgsRUFBYyxDQUFkLEVBQWlCLENBQWpCOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLEdBQVQsRUFBYyxHQUFkLEVBQW1CLEdBQW5CLEVBQXdCLENBQXhCOztBQUViOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxFQUFFLENBQUMsc0JBQUgsQ0FBQTs7QUFFZDs7Ozs7SUFLQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEVBQUUsQ0FBQyxrQkFBSCxDQUFBOztBQUVoQjs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLGtCQUFILENBQUE7SUFFZCxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxRQUFmO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsTUFBZjtJQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLE1BQWY7RUFwRVM7OztBQXNFYjs7Ozs7Ozs7Ozs7R0FsRjBCLEVBQUUsQ0FBQzs7QUE2RmpDLEVBQUUsQ0FBQyxlQUFILEdBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBPYmplY3RfSW1hZ2VNYXBcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdF9JbWFnZU1hcCBleHRlbmRzIGdzLk9iamVjdF9WaXN1YWxcbiAgICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJwYXJlbnRcIiwgXCJzdWJPYmplY3RzXCJdXG4gICAgXG4gICAgIyMjKlxuICAgICogQW4gaW1hZ2UtbWFwIG9iamVjdCB0byBkaXNwbGF5IGFuIGltYWdlLW1hcCBvbiBzY3JlZW4uIFxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBPYmplY3RfSW1hZ2VNYXBcbiAgICAqIEBleHRlbmRzIGdzLk9iamVjdF9WaXN1YWxcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBuYW1lcyBvZiB0aGUgaW1hZ2VzIHVzZWQgZm9yIHRoZSBkaWZmZXJlbnQgc3RhdGVzIG9mIHRoZSBpbWFnZS1tYXAuPGJyPlxuICAgICAgICAqXG4gICAgICAgICogLSAwID0gR3JvdW5kIEltYWdlXG4gICAgICAgICogLSAxID0gSG92ZXJlZFxuICAgICAgICAqIC0gMiA9IFVuc2VsZWN0ZWRcbiAgICAgICAgKiAtIDMgPSBTZWxlY3RlZFxuICAgICAgICAqIC0gNCA9IFNlbGVjdGVkIEhvdmVyZWRcbiAgICAgICAgKlxuICAgICAgICAqIEBwcm9wZXJ0eSBpbWFnZXNcbiAgICAgICAgKiBAdHlwZSBzdHJpbmdbXVxuICAgICAgICAjIyNcbiAgICAgICAgQGltYWdlcyA9IFtdXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGhvdHNwb3QgZGF0YSBvZiB0aGUgaW1hZ2UtbWFwLiBFYWNoIGVudHJ5IGlzIGEgc2luZ2xlIGhvdHNwb3Qgb24gdGhlIGltYWdlLW1hcC5cbiAgICAgICAgKiBAcHJvcGVydHkgaG90c3BvdHNcbiAgICAgICAgKiBAdHlwZSBncy5JbWFnZU1hcEhvdHNwb3RbXVxuICAgICAgICAjIyNcbiAgICAgICAgQGhvdHNwb3RzID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZG9tYWluIHRoZSBvYmplY3QgYmVsb25ncyB0by5cbiAgICAgICAgKiBAcHJvcGVydHkgZG9tYWluXG4gICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICMjI1xuICAgICAgICBAZG9tYWluID0gXCJjb20uZGVnaWNhLnZubS5kZWZhdWx0XCJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY29sb3IgdG9uZSBvZiB0aGUgb2JqZWN0IHVzZWQgZm9yIHRoZSB2aXN1YWwgcHJlc2VudGF0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0b25lXG4gICAgICAgICogQHR5cGUgZ3MuVG9uZVxuICAgICAgICAjIyNcbiAgICAgICAgQHRvbmUgPSBuZXcgZ3MuVG9uZSgwLCAwLCAwLCAwKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjb2xvciBvZiB0aGUgb2JqZWN0IHVzZWQgZm9yIHRoZSB2aXN1YWwgcHJlc2VudGF0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb2xvclxuICAgICAgICAqIEB0eXBlIGdzLkNvbG9yXG4gICAgICAgICMjI1xuICAgICAgICBAY29sb3IgPSBuZXcgZ3MuQ29sb3IoMjU1LCAyNTUsIDI1NSwgMClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbiBldmVudC1lbWl0dGVyIHRvIGVtaXQgZXZlbnRzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBldmVudHNcbiAgICAgICAgKiBAdHlwZSBncy5Db21wb25lbnRfRXZlbnRFbWl0dGVyXG4gICAgICAgICMjI1xuICAgICAgICBAZXZlbnRzID0gbmV3IGdzLkNvbXBvbmVudF9FdmVudEVtaXR0ZXIoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBhbmltYXRvci1jb21wb25lbnQgdG8gZXhlY3V0ZSBkaWZmZXJlbnQga2luZCBvZiBhbmltYXRpb25zIGxpa2UgbW92ZSwgcm90YXRlLCBldGMuIG9uIGl0LlxuICAgICAgICAqIEBwcm9wZXJ0eSBhbmltYXRvclxuICAgICAgICAqIEB0eXBlIHZuLkNvbXBvbmVudF9BbmltYXRvclxuICAgICAgICAjIyNcbiAgICAgICAgQGFuaW1hdG9yID0gbmV3IGdzLkNvbXBvbmVudF9BbmltYXRvcigpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIHZpc3VhbC1jb21wb25lbnQgdG8gZGlzcGxheSB0aGUgZ2FtZSBvYmplY3Qgb24gc2NyZWVuLlxuICAgICAgICAqIEBwcm9wZXJ0eSB2aXN1YWxcbiAgICAgICAgKiBAdHlwZSBncy5Db21wb25lbnRfSW1hZ2VNYXBcbiAgICAgICAgIyMjXG4gICAgICAgIEB2aXN1YWwgPSBuZXcgZ3MuQ29tcG9uZW50X0ltYWdlTWFwKClcbiAgICAgICAgXG4gICAgICAgIEBhZGRDb21wb25lbnQoQGFuaW1hdG9yKVxuICAgICAgICBAYWRkQ29tcG9uZW50KEB2aXN1YWwpXG4gICAgICAgIEBhZGRDb21wb25lbnQoQGV2ZW50cylcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKiBcbiAgICAqIEBtZXRob2Qgb25EYXRhQnVuZGxlUmVzdG9yZS5cbiAgICAqIEBwYXJhbSBPYmplY3QgZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZVxuICAgICogQHBhcmFtIGdzLk9iamVjdENvZGVjQ29udGV4dCBjb250ZXh0IC0gVGhlIGNvZGVjLWNvbnRleHQuXG4gICAgIyMjXG4gICAgI29uRGF0YUJ1bmRsZVJlc3RvcmU6IChkYXRhLCBjb250ZXh0KSAtPlxuICAgICMgICAgQHN1Yk9iamVjdHMgPSBbXVxuICAgICAgICBcbmdzLk9iamVjdF9JbWFnZU1hcCA9IE9iamVjdF9JbWFnZU1hcCJdfQ==
//# sourceURL=Object_ImageMap_116.js