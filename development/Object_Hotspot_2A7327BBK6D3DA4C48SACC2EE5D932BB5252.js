var Object_Hotspot,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Hotspot = (function(superClass) {
  extend(Object_Hotspot, superClass);

  Object_Hotspot.objectCodecBlackList = ["parent"];


  /**
  * A hotspot object to define an area on the screen which can respond
  * to user-actions like mouse/touch actions. A hotspot can have multiple
  * images for different states like hovered, selected, etc.
  *
  * @module gs
  * @class Object_Hotspot
  * @extends gs.Object_Visual
  * @memberof gs
  * @constructor
   */

  function Object_Hotspot() {
    Object_Hotspot.__super__.constructor.apply(this, arguments);

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
    * The object's image used for visual presentation.
    * @property image
    * @type string
     */
    this.image = "";

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
    * Contains different kinds of effects which can be activated for the object.
    * @property effects
    * @type Object
     */
    this.effects = new gs.EffectCollection();

    /**
    * Indicates if the hotspot is selectable by mouse/touch.
    * @property selectable
    * @type boolean
     */
    this.selectable = true;

    /**
    * Indicates if the hotspot is enabled. A disabled hotspot will not fire any events/actions.
    * @property enabled.
    * @type boolean
     */
    this.enabled = true;

    /**
    * The object's visual-component to display the game object on screen.
    * @property visual
    * @type gs.Component_Sprite
     */
    this.visual = new gs.Component_Sprite();

    /**
    * The object's image-handling.
    * @property imageHandling
    * @type gs.ImageHandling
     */
    this.imageHandling = 0;

    /**
    * A behavior-component to hotspot-specific behavior to the object.
    * @property behavior
    * @type gs.Component_HotspotBehavior
     */
    this.behavior = new gs.Component_HotspotBehavior();
    this.behavior.imageHandling = this.imageHandling;

    /**
    * The hotspot's target. The target it optional but if set the hotspot follows
    * the target. For example: A hotspot could be follow moving picture.
    * @property target
    * @type gs.Object_Visual
     */
    this.target = null;

    /**
    * The names of the images for the different states of the hotspot. At least one image
    * needs to be set. The other ones are optional and used for the following:<br>
    *
    * - 0 = Base (Required)
    * - 1 = Hovered
    * - 2 = Unselected
    * - 3 = Selected
    * - 4 = Selected Hovered
    * @property images
    * @type string[]
     */
    this.images = [];

    /**
    * An event-emitter to emit events.
    * @property events
    * @type gs.Component_EventEmitter
     */
    this.events = new gs.EventEmitter();

    /**
    * The data associated with the hotspot coming from Add Hotspot command such
    * as the action and event configuration.
    * @property data
    * @type Object
    * @default null
     */
    this.data = null;
    this.addComponent(this.events);
    this.addComponent(this.behavior);
    this.addComponent(this.visual);
  }

  return Object_Hotspot;

})(gs.Object_Visual);

gs.Object_Hotspot = Object_Hotspot;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsY0FBQTtFQUFBOzs7QUFBTTs7O0VBQ0YsY0FBQyxDQUFBLG9CQUFELEdBQXdCLENBQUMsUUFBRDs7O0FBRXhCOzs7Ozs7Ozs7Ozs7RUFXYSx3QkFBQTtJQUNULGlEQUFBLFNBQUE7O0FBRUE7Ozs7OztJQU1BLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxJQUFBLENBQUE7O0FBRWY7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLEVBQUUsQ0FBQyxJQUFILENBQUE7O0FBRVo7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVOztBQUVWOzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBRVQ7Ozs7OztJQU1BLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBRVQ7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLElBQUEsQ0FBSyxDQUFMLEVBQVEsQ0FBUixFQUFXLENBQVgsRUFBYyxDQUFkOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsQ0FBckI7O0FBRWI7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLEVBQUUsQ0FBQyxnQkFBSCxDQUFBOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWM7O0FBRWQ7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLGdCQUFILENBQUE7O0FBRWQ7Ozs7O0lBS0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7O0FBRWpCOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsRUFBRSxDQUFDLHlCQUFILENBQUE7SUFDaEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLEdBQTBCLElBQUMsQ0FBQTs7QUFFM0I7Ozs7OztJQU1BLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7Ozs7Ozs7OztJQVlBLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxZQUFILENBQUE7O0FBRWQ7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsSUFBRCxHQUFRO0lBRVIsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsTUFBZjtJQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLFFBQWY7SUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxNQUFmO0VBaEpTOzs7O0dBZFksRUFBRSxDQUFDOztBQWlLaEMsRUFBRSxDQUFDLGNBQUgsR0FBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9Ib3RzcG90XG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBPYmplY3RfSG90c3BvdCBleHRlbmRzIGdzLk9iamVjdF9WaXN1YWxcbiAgICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJwYXJlbnRcIl1cblxuICAgICMjIypcbiAgICAqIEEgaG90c3BvdCBvYmplY3QgdG8gZGVmaW5lIGFuIGFyZWEgb24gdGhlIHNjcmVlbiB3aGljaCBjYW4gcmVzcG9uZFxuICAgICogdG8gdXNlci1hY3Rpb25zIGxpa2UgbW91c2UvdG91Y2ggYWN0aW9ucy4gQSBob3RzcG90IGNhbiBoYXZlIG11bHRpcGxlXG4gICAgKiBpbWFnZXMgZm9yIGRpZmZlcmVudCBzdGF0ZXMgbGlrZSBob3ZlcmVkLCBzZWxlY3RlZCwgZXRjLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBPYmplY3RfSG90c3BvdFxuICAgICogQGV4dGVuZHMgZ3MuT2JqZWN0X1Zpc3VhbFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIHNvdXJjZSByZWN0YW5nbGUuIEl0IGNvbnRyb2xzIHdoaWNoIHBhcnQgb2YgdGhlIG9iamVjdCdzIGltYWdlIGlzIHVzZWRcbiAgICAgICAgKiBmb3IgdmlzdWFsIHByZXNlbnRhdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgc3JjUmVjdFxuICAgICAgICAqIEB0eXBlIGdzLlJlY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBzcmNSZWN0ID0gbmV3IFJlY3QoKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgbWFzayB0byBleGVjdXRlIG1hc2tpbmctZWZmZWN0cyBvbiBpdC5cbiAgICAgICAgKiBAcHJvcGVydHkgbWFza1xuICAgICAgICAqIEB0eXBlIGdzLk1hc2tcbiAgICAgICAgIyMjXG4gICAgICAgIEBtYXNrID0gbmV3IGdzLk1hc2soKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIG9iamVjdCdzIHZpc3VhbCBwcmVzZW50YXRpb24gc2hvdWxkIGJlIG1pcnJvcmVkIGhvcml6b250YWxseS5cbiAgICAgICAgKiBAcHJvcGVydHkgbWlycm9yXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQG1pcnJvciA9IGZhbHNlXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBkb21haW4gdGhlIG9iamVjdCBiZWxvbmdzIHRvLlxuICAgICAgICAqIEBwcm9wZXJ0eSBkb21haW5cbiAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgIyMjXG4gICAgICAgIEBkb21haW4gPSBcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIlxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgaW1hZ2UgdXNlZCBmb3IgdmlzdWFsIHByZXNlbnRhdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgaW1hZ2VcbiAgICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbWFnZSA9IFwiXCJcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHJvdGF0aW9uLWFuZ2xlIG9mIHRoZSBwaWN0dXJlIGluIGRlZ3JlZXMuIFRoZSByb3RhdGlvbiBjZW50ZXIgZGVwZW5kcyBvbiB0aGVcbiAgICAgICAgKiBhbmNob3ItcG9pbnQuXG4gICAgICAgICogQHByb3BlcnR5IGFuZ2xlXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAYW5nbGUgPSAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjb2xvciB0b25lIG9mIHRoZSBvYmplY3QgdXNlZCBmb3IgdGhlIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IHRvbmVcbiAgICAgICAgKiBAdHlwZSBncy5Ub25lXG4gICAgICAgICMjI1xuICAgICAgICBAdG9uZSA9IG5ldyBUb25lKDAsIDAsIDAsIDApXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjb2xvciBvZiB0aGUgb2JqZWN0IHVzZWQgZm9yIHRoZSB2aXN1YWwgcHJlc2VudGF0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb2xvclxuICAgICAgICAqIEB0eXBlIGdzLkNvbG9yXG4gICAgICAgICMjI1xuICAgICAgICBAY29sb3IgPSBuZXcgQ29sb3IoMjU1LCAyNTUsIDI1NSwgMClcblxuICAgICAgICAjIyMqXG4gICAgICAgICogQ29udGFpbnMgZGlmZmVyZW50IGtpbmRzIG9mIGVmZmVjdHMgd2hpY2ggY2FuIGJlIGFjdGl2YXRlZCBmb3IgdGhlIG9iamVjdC5cbiAgICAgICAgKiBAcHJvcGVydHkgZWZmZWN0c1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGVmZmVjdHMgPSBuZXcgZ3MuRWZmZWN0Q29sbGVjdGlvbigpXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgaG90c3BvdCBpcyBzZWxlY3RhYmxlIGJ5IG1vdXNlL3RvdWNoLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzZWxlY3RhYmxlXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHNlbGVjdGFibGUgPSB5ZXNcblxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBob3RzcG90IGlzIGVuYWJsZWQuIEEgZGlzYWJsZWQgaG90c3BvdCB3aWxsIG5vdCBmaXJlIGFueSBldmVudHMvYWN0aW9ucy5cbiAgICAgICAgKiBAcHJvcGVydHkgZW5hYmxlZC5cbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAZW5hYmxlZCA9IHllc1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgdmlzdWFsLWNvbXBvbmVudCB0byBkaXNwbGF5IHRoZSBnYW1lIG9iamVjdCBvbiBzY3JlZW4uXG4gICAgICAgICogQHByb3BlcnR5IHZpc3VhbFxuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudF9TcHJpdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEB2aXN1YWwgPSBuZXcgZ3MuQ29tcG9uZW50X1Nwcml0ZSgpXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBpbWFnZS1oYW5kbGluZy5cbiAgICAgICAgKiBAcHJvcGVydHkgaW1hZ2VIYW5kbGluZ1xuICAgICAgICAqIEB0eXBlIGdzLkltYWdlSGFuZGxpbmdcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbWFnZUhhbmRsaW5nID0gMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBIGJlaGF2aW9yLWNvbXBvbmVudCB0byBob3RzcG90LXNwZWNpZmljIGJlaGF2aW9yIHRvIHRoZSBvYmplY3QuXG4gICAgICAgICogQHByb3BlcnR5IGJlaGF2aW9yXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X0hvdHNwb3RCZWhhdmlvclxuICAgICAgICAjIyNcbiAgICAgICAgQGJlaGF2aW9yID0gbmV3IGdzLkNvbXBvbmVudF9Ib3RzcG90QmVoYXZpb3IoKVxuICAgICAgICBAYmVoYXZpb3IuaW1hZ2VIYW5kbGluZyA9IEBpbWFnZUhhbmRsaW5nXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBob3RzcG90J3MgdGFyZ2V0LiBUaGUgdGFyZ2V0IGl0IG9wdGlvbmFsIGJ1dCBpZiBzZXQgdGhlIGhvdHNwb3QgZm9sbG93c1xuICAgICAgICAqIHRoZSB0YXJnZXQuIEZvciBleGFtcGxlOiBBIGhvdHNwb3QgY291bGQgYmUgZm9sbG93IG1vdmluZyBwaWN0dXJlLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0YXJnZXRcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfVmlzdWFsXG4gICAgICAgICMjI1xuICAgICAgICBAdGFyZ2V0ID0gbnVsbFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbmFtZXMgb2YgdGhlIGltYWdlcyBmb3IgdGhlIGRpZmZlcmVudCBzdGF0ZXMgb2YgdGhlIGhvdHNwb3QuIEF0IGxlYXN0IG9uZSBpbWFnZVxuICAgICAgICAqIG5lZWRzIHRvIGJlIHNldC4gVGhlIG90aGVyIG9uZXMgYXJlIG9wdGlvbmFsIGFuZCB1c2VkIGZvciB0aGUgZm9sbG93aW5nOjxicj5cbiAgICAgICAgKlxuICAgICAgICAqIC0gMCA9IEJhc2UgKFJlcXVpcmVkKVxuICAgICAgICAqIC0gMSA9IEhvdmVyZWRcbiAgICAgICAgKiAtIDIgPSBVbnNlbGVjdGVkXG4gICAgICAgICogLSAzID0gU2VsZWN0ZWRcbiAgICAgICAgKiAtIDQgPSBTZWxlY3RlZCBIb3ZlcmVkXG4gICAgICAgICogQHByb3BlcnR5IGltYWdlc1xuICAgICAgICAqIEB0eXBlIHN0cmluZ1tdXG4gICAgICAgICMjI1xuICAgICAgICBAaW1hZ2VzID0gW11cblxuICAgICAgICAjIyMqXG4gICAgICAgICogQW4gZXZlbnQtZW1pdHRlciB0byBlbWl0IGV2ZW50cy5cbiAgICAgICAgKiBAcHJvcGVydHkgZXZlbnRzXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X0V2ZW50RW1pdHRlclxuICAgICAgICAjIyNcbiAgICAgICAgQGV2ZW50cyA9IG5ldyBncy5FdmVudEVtaXR0ZXIoKTtcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoZSBob3RzcG90IGNvbWluZyBmcm9tIEFkZCBIb3RzcG90IGNvbW1hbmQgc3VjaFxuICAgICAgICAqIGFzIHRoZSBhY3Rpb24gYW5kIGV2ZW50IGNvbmZpZ3VyYXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IGRhdGFcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICAgICMjI1xuICAgICAgICBAZGF0YSA9IG51bGxcblxuICAgICAgICBAYWRkQ29tcG9uZW50KEBldmVudHMpXG4gICAgICAgIEBhZGRDb21wb25lbnQoQGJlaGF2aW9yKVxuICAgICAgICBAYWRkQ29tcG9uZW50KEB2aXN1YWwpXG5cblxuZ3MuT2JqZWN0X0hvdHNwb3QgPSBPYmplY3RfSG90c3BvdCJdfQ==
//# sourceURL=Object_Hotspot_90.js