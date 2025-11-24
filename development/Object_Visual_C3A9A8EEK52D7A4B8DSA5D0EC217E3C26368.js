var Object_Visual,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Visual = (function(superClass) {
  extend(Object_Visual, superClass);


  /**
  * Indiciates if the game object is visible on screen. If the parent viewport
  * is invisible, it will be false.
  * @property visible
  * @type boolean
   */


  /**
  * The base class for all regular visual game objects. 
  *
  * @module 
  * @class Object_Visual
  * @extends gs.Object_Base
  * @memberof vn
  * @constructor
   */

  function Object_Visual(data) {
    Object_Visual.__super__.constructor.call(this);

    /**
    * Indiciates if the game object is visible on screen.
    * @property visible
    * @type boolean
     */
    this.visible = true;

    /**
    * The object's destination rectangle on screen.
    * @property dstRect
    * @type gs.Rect
     */
    this.dstRect = new Rect(data != null ? data.x : void 0, data != null ? data.y : void 0);

    /**
    * The object's origin.
    * @property origin
    * @type gs.Point
     */
    this.origin = new gs.Point(0, 0);

    /**
    * The object's offset.
    * @property offset
    * @type gs.Point
     */
    this.offset = new gs.Point(0, 0);

    /**
    * The object's anchor-point. For example: An anchor-point with 0,0 places the object with its top-left corner
    * at its position but with an 0.5, 0.5 anchor-point the object is placed with its center. An anchor-point of 1,1
    * places the object with its lower-right corner.
    * @property anchor
    * @type gs.Point
     */
    this.anchor = new gs.Point(0.0, 0.0);

    /**
    * The position anchor point. For example: An anchor-point with 0,0 places the object with its top-left corner
    * at its position but with an 0.5, 0.5 anchor-point the object will be placed with its center. An anchor-point of 1,1
    * will place the object with its lower-right corner. It has not effect on the object's rotation/zoom anchor. For that, take
    * a look at <b>anchor</b> property.
    *
    * @property positionAnchor
    * @type gs.Point
     */
    this.positionAnchor = new gs.Point(0, 0);

    /**
    * The object's zoom-setting for x and y axis. The default value is
    * { x: 1.0, y: 1.0 }
    * @property zoom
    * @type gs.Point
     */
    this.zoom = (data != null ? data.zoom : void 0) || new gs.Point(1.0, 1.0);

    /**
    * The object's z-index controls rendering-order/image-overlapping. An object with a smaller z-index is rendered
    * before an object with a larger index. For example: To make sure a game object is always on top of the screen, it
    * should have the largest z-index of all game objects.
    * @property zIndex
    * @type number
     */
    this.zIndex = 700;

    /**
    * The object's blend mode controls how the blending of the object's visual representation is calculated.
    * @property blendMode
    * @type number
    * @default gs.BlendMode.NORMAL
     */
    this.blendMode = gs.BlendMode.NORMAL;

    /**
    * The object's viewport.
    * @property viewport
    * @type gs.Viewport
     */
    this.viewport = Graphics.viewport;

    /**
    * The object's motion-blur settings.
    * @property motionBlur
    * @type gs.MotionBlur
     */
    this.motionBlur = new gs.MotionBlur();

    /**
    * Contains different kinds of shader effects which can be activated for the object.
    * @property effects
    * @type gs.EffectCollection
     */
    this.effects = new gs.EffectCollection();

    /**
    * The object's opacity to control transparency. For example: 0 = Transparent, 255 = Opaque, 128 = Semi-Transparent.
    * @property opacity
    * @type number
     */
    this.opacity = 255;
  }


  /**
  * Restores the game object from a data-bundle.
  *
  * @method restore
  * @param {Object} data - The data-bundle.
   */

  Object_Visual.prototype.restore = function(data) {
    if (data.components) {
      this.componentsFromDataBundle(data);
    }
    Object.mixin(this, data);
    this.dstRect = gs.Rect.fromObject(data.dstRect);
    return this.motionBlur = gs.MotionBlur.fromObject(data.motionBlur);
  };

  return Object_Visual;

})(gs.Object_Base);

gs.Object_Visual = Object_Visual;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsYUFBQTtFQUFBOzs7QUFBTTs7OztBQUVGOzs7Ozs7OztBQVVBOzs7Ozs7Ozs7O0VBU2EsdUJBQUMsSUFBRDtJQUNULDZDQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBSVg7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLElBQUEsZ0JBQUssSUFBSSxDQUFFLFVBQVgsaUJBQWMsSUFBSSxDQUFFLFVBQXBCOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLENBQVQsRUFBWSxDQUFaOztBQUVkOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLENBQVQsRUFBWSxDQUFaOztBQUVkOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsR0FBVCxFQUFjLEdBQWQ7O0FBRWQ7Ozs7Ozs7OztJQVNBLElBQUMsQ0FBQSxjQUFELEdBQXNCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxDQUFULEVBQVksQ0FBWjs7QUFFdEI7Ozs7OztJQU1BLElBQUMsQ0FBQSxJQUFELG1CQUFRLElBQUksQ0FBRSxjQUFOLElBQWtCLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxHQUFULEVBQWMsR0FBZDs7QUFFMUI7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsTUFBRCxHQUFVOztBQUVWOzs7Ozs7SUFNQSxJQUFDLENBQUEsU0FBRCxHQUFhLEVBQUUsQ0FBQyxTQUFTLENBQUM7O0FBRTFCOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBUSxDQUFDOztBQUVyQjs7Ozs7SUFLQSxJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLEVBQUUsQ0FBQyxVQUFILENBQUE7O0FBRWxCOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxFQUFFLENBQUMsZ0JBQUgsQ0FBQTs7QUFFZjs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXO0VBeEdGOzs7QUEwR2I7Ozs7Ozs7MEJBTUEsT0FBQSxHQUFTLFNBQUMsSUFBRDtJQUNMLElBQUcsSUFBSSxDQUFDLFVBQVI7TUFDSSxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsSUFBMUIsRUFESjs7SUFHQSxNQUFNLENBQUMsS0FBUCxDQUFhLElBQWIsRUFBbUIsSUFBbkI7SUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBUixDQUFtQixJQUFJLENBQUMsT0FBeEI7V0FDWCxJQUFDLENBQUEsVUFBRCxHQUFjLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBZCxDQUF5QixJQUFJLENBQUMsVUFBOUI7RUFQVDs7OztHQXJJZSxFQUFFLENBQUM7O0FBOEkvQixFQUFFLENBQUMsYUFBSCxHQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogT2JqZWN0X1Zpc3VhbFxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgT2JqZWN0X1Zpc3VhbCBleHRlbmRzIGdzLk9iamVjdF9CYXNlXG5cbiAgICAjIyMqXG4gICAgKiBJbmRpY2lhdGVzIGlmIHRoZSBnYW1lIG9iamVjdCBpcyB2aXNpYmxlIG9uIHNjcmVlbi4gSWYgdGhlIHBhcmVudCB2aWV3cG9ydFxuICAgICogaXMgaW52aXNpYmxlLCBpdCB3aWxsIGJlIGZhbHNlLlxuICAgICogQHByb3BlcnR5IHZpc2libGVcbiAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAjIyNcbiAgICAjQGFjY2Vzc29ycyBcInZpc2libGVcIiwgXG4gICAgIyAgICBzZXQ6ICh2aXNpYmxlKSAtPiBAdmlzaWJsZV8gPSB2aXNpYmxlXG4gICAgIyAgICBnZXQ6IC0+IEB2aXNpYmxlXyAmJiBAdmlld3BvcnQudmlzaWJsZVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBUaGUgYmFzZSBjbGFzcyBmb3IgYWxsIHJlZ3VsYXIgdmlzdWFsIGdhbWUgb2JqZWN0cy4gXG4gICAgKlxuICAgICogQG1vZHVsZSBcbiAgICAqIEBjbGFzcyBPYmplY3RfVmlzdWFsXG4gICAgKiBAZXh0ZW5kcyBncy5PYmplY3RfQmFzZVxuICAgICogQG1lbWJlcm9mIHZuXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2lhdGVzIGlmIHRoZSBnYW1lIG9iamVjdCBpcyB2aXNpYmxlIG9uIHNjcmVlbi5cbiAgICAgICAgKiBAcHJvcGVydHkgdmlzaWJsZVxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEB2aXNpYmxlID0geWVzXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgZGVzdGluYXRpb24gcmVjdGFuZ2xlIG9uIHNjcmVlbi5cbiAgICAgICAgKiBAcHJvcGVydHkgZHN0UmVjdFxuICAgICAgICAqIEB0eXBlIGdzLlJlY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBkc3RSZWN0ID0gbmV3IFJlY3QoZGF0YT8ueCwgZGF0YT8ueSlcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3Mgb3JpZ2luLlxuICAgICAgICAqIEBwcm9wZXJ0eSBvcmlnaW5cbiAgICAgICAgKiBAdHlwZSBncy5Qb2ludFxuICAgICAgICAjIyNcbiAgICAgICAgQG9yaWdpbiA9IG5ldyBncy5Qb2ludCgwLCAwKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBvZmZzZXQuXG4gICAgICAgICogQHByb3BlcnR5IG9mZnNldFxuICAgICAgICAqIEB0eXBlIGdzLlBvaW50XG4gICAgICAgICMjI1xuICAgICAgICBAb2Zmc2V0ID0gbmV3IGdzLlBvaW50KDAsIDApXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIGFuY2hvci1wb2ludC4gRm9yIGV4YW1wbGU6IEFuIGFuY2hvci1wb2ludCB3aXRoIDAsMCBwbGFjZXMgdGhlIG9iamVjdCB3aXRoIGl0cyB0b3AtbGVmdCBjb3JuZXJcbiAgICAgICAgKiBhdCBpdHMgcG9zaXRpb24gYnV0IHdpdGggYW4gMC41LCAwLjUgYW5jaG9yLXBvaW50IHRoZSBvYmplY3QgaXMgcGxhY2VkIHdpdGggaXRzIGNlbnRlci4gQW4gYW5jaG9yLXBvaW50IG9mIDEsMVxuICAgICAgICAqIHBsYWNlcyB0aGUgb2JqZWN0IHdpdGggaXRzIGxvd2VyLXJpZ2h0IGNvcm5lci5cbiAgICAgICAgKiBAcHJvcGVydHkgYW5jaG9yXG4gICAgICAgICogQHR5cGUgZ3MuUG9pbnRcbiAgICAgICAgIyMjXG4gICAgICAgIEBhbmNob3IgPSBuZXcgZ3MuUG9pbnQoMC4wLCAwLjApXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHBvc2l0aW9uIGFuY2hvciBwb2ludC4gRm9yIGV4YW1wbGU6IEFuIGFuY2hvci1wb2ludCB3aXRoIDAsMCBwbGFjZXMgdGhlIG9iamVjdCB3aXRoIGl0cyB0b3AtbGVmdCBjb3JuZXJcbiAgICAgICAgKiBhdCBpdHMgcG9zaXRpb24gYnV0IHdpdGggYW4gMC41LCAwLjUgYW5jaG9yLXBvaW50IHRoZSBvYmplY3Qgd2lsbCBiZSBwbGFjZWQgd2l0aCBpdHMgY2VudGVyLiBBbiBhbmNob3ItcG9pbnQgb2YgMSwxXG4gICAgICAgICogd2lsbCBwbGFjZSB0aGUgb2JqZWN0IHdpdGggaXRzIGxvd2VyLXJpZ2h0IGNvcm5lci4gSXQgaGFzIG5vdCBlZmZlY3Qgb24gdGhlIG9iamVjdCdzIHJvdGF0aW9uL3pvb20gYW5jaG9yLiBGb3IgdGhhdCwgdGFrZVxuICAgICAgICAqIGEgbG9vayBhdCA8Yj5hbmNob3I8L2I+IHByb3BlcnR5LlxuICAgICAgICAqXG4gICAgICAgICogQHByb3BlcnR5IHBvc2l0aW9uQW5jaG9yXG4gICAgICAgICogQHR5cGUgZ3MuUG9pbnRcbiAgICAgICAgIyMjXG4gICAgICAgIEBwb3NpdGlvbkFuY2hvciA9IG5ldyBncy5Qb2ludCgwLCAwKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyB6b29tLXNldHRpbmcgZm9yIHggYW5kIHkgYXhpcy4gVGhlIGRlZmF1bHQgdmFsdWUgaXNcbiAgICAgICAgKiB7IHg6IDEuMCwgeTogMS4wIH1cbiAgICAgICAgKiBAcHJvcGVydHkgem9vbVxuICAgICAgICAqIEB0eXBlIGdzLlBvaW50XG4gICAgICAgICMjI1xuICAgICAgICBAem9vbSA9IGRhdGE/Lnpvb20gfHwgbmV3IGdzLlBvaW50KDEuMCwgMS4wKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyB6LWluZGV4IGNvbnRyb2xzIHJlbmRlcmluZy1vcmRlci9pbWFnZS1vdmVybGFwcGluZy4gQW4gb2JqZWN0IHdpdGggYSBzbWFsbGVyIHotaW5kZXggaXMgcmVuZGVyZWRcbiAgICAgICAgKiBiZWZvcmUgYW4gb2JqZWN0IHdpdGggYSBsYXJnZXIgaW5kZXguIEZvciBleGFtcGxlOiBUbyBtYWtlIHN1cmUgYSBnYW1lIG9iamVjdCBpcyBhbHdheXMgb24gdG9wIG9mIHRoZSBzY3JlZW4sIGl0XG4gICAgICAgICogc2hvdWxkIGhhdmUgdGhlIGxhcmdlc3Qgei1pbmRleCBvZiBhbGwgZ2FtZSBvYmplY3RzLlxuICAgICAgICAqIEBwcm9wZXJ0eSB6SW5kZXhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEB6SW5kZXggPSA3MDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgYmxlbmQgbW9kZSBjb250cm9scyBob3cgdGhlIGJsZW5kaW5nIG9mIHRoZSBvYmplY3QncyB2aXN1YWwgcmVwcmVzZW50YXRpb24gaXMgY2FsY3VsYXRlZC5cbiAgICAgICAgKiBAcHJvcGVydHkgYmxlbmRNb2RlXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQGRlZmF1bHQgZ3MuQmxlbmRNb2RlLk5PUk1BTFxuICAgICAgICAjIyNcbiAgICAgICAgQGJsZW5kTW9kZSA9IGdzLkJsZW5kTW9kZS5OT1JNQUxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3Mgdmlld3BvcnQuXG4gICAgICAgICogQHByb3BlcnR5IHZpZXdwb3J0XG4gICAgICAgICogQHR5cGUgZ3MuVmlld3BvcnRcbiAgICAgICAgIyMjXG4gICAgICAgIEB2aWV3cG9ydCA9IEdyYXBoaWNzLnZpZXdwb3J0XG4gICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgbW90aW9uLWJsdXIgc2V0dGluZ3MuXG4gICAgICAgICogQHByb3BlcnR5IG1vdGlvbkJsdXJcbiAgICAgICAgKiBAdHlwZSBncy5Nb3Rpb25CbHVyXG4gICAgICAgICMjI1xuICAgICAgICBAbW90aW9uQmx1ciA9IG5ldyBncy5Nb3Rpb25CbHVyKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250YWlucyBkaWZmZXJlbnQga2luZHMgb2Ygc2hhZGVyIGVmZmVjdHMgd2hpY2ggY2FuIGJlIGFjdGl2YXRlZCBmb3IgdGhlIG9iamVjdC5cbiAgICAgICAgKiBAcHJvcGVydHkgZWZmZWN0c1xuICAgICAgICAqIEB0eXBlIGdzLkVmZmVjdENvbGxlY3Rpb25cbiAgICAgICAgIyMjXG4gICAgICAgIEBlZmZlY3RzID0gbmV3IGdzLkVmZmVjdENvbGxlY3Rpb24oKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBvcGFjaXR5IHRvIGNvbnRyb2wgdHJhbnNwYXJlbmN5LiBGb3IgZXhhbXBsZTogMCA9IFRyYW5zcGFyZW50LCAyNTUgPSBPcGFxdWUsIDEyOCA9IFNlbWktVHJhbnNwYXJlbnQuXG4gICAgICAgICogQHByb3BlcnR5IG9wYWNpdHlcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBvcGFjaXR5ID0gMjU1XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlc3RvcmVzIHRoZSBnYW1lIG9iamVjdCBmcm9tIGEgZGF0YS1idW5kbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN0b3JlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZS5cbiAgICAjIyMgICAgXG4gICAgcmVzdG9yZTogKGRhdGEpIC0+XG4gICAgICAgIGlmIGRhdGEuY29tcG9uZW50c1xuICAgICAgICAgICAgQGNvbXBvbmVudHNGcm9tRGF0YUJ1bmRsZShkYXRhKVxuICAgICAgICAgICAgXG4gICAgICAgIE9iamVjdC5taXhpbih0aGlzLCBkYXRhKVxuICAgICAgICBcbiAgICAgICAgQGRzdFJlY3QgPSBncy5SZWN0LmZyb21PYmplY3QoZGF0YS5kc3RSZWN0KVxuICAgICAgICBAbW90aW9uQmx1ciA9IGdzLk1vdGlvbkJsdXIuZnJvbU9iamVjdChkYXRhLm1vdGlvbkJsdXIpXG4gICAgICAgIFxuZ3MuT2JqZWN0X1Zpc3VhbCA9IE9iamVjdF9WaXN1YWwiXX0=
//# sourceURL=Object_Visual_28.js