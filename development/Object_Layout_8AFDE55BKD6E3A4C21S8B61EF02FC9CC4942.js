var Object_Layout,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Layout = (function(superClass) {
  extend(Object_Layout, superClass);


  /**
  * A layout object defines a new UI layout game scene. A UI layout scene
  * displays in-game UI and let the user interact with it. For example: The
  * title screen, the game menu, etc. 
  *
  * @module gs
  * @class Object_Layout
  * @extends gs.Object_Base
  * @memberof gs
  * @constructor
   */

  function Object_Layout(layoutName) {
    var ref;
    Object_Layout.__super__.constructor.call(this);

    /**
    * Indicates that the UI layout is still in prepare-state and not ready.
    * @property preparing
    * @type boolean
     */
    this.preparing = true;

    /**
    * The layout descriptor.
    * @property layoutData
    * @type Object
     */
    this.layoutName = layoutName;
    this.layoutData = ui.UiFactory.layouts[layoutName];

    /**
    * The behavior-component for the UI layour specific behavior.
    * @property behavior
    * @type gs.Component_LayoutSceneBehavior
     */
    if ((ref = this.layoutData) != null ? ref.component : void 0) {
      this.behavior = new window[this.layoutData.component.ns || "gs"][this.layoutData.component.className];
    } else {
      this.behavior = new gs.Component_LayoutSceneBehavior();
    }

    /**
    * Indicates if the UI layout is visible.
    * @property visible
    * @type boolean
     */
    this.visible = true;

    /**
    * An event-emitter to emit events.
    * @property events
    * @type gs.Component_EventEmitter
     */
    this.events = new gs.Component_EventEmitter();
    this.addComponent(new gs.Component_InputHandler());
    this.addComponent(this.behavior);
  }

  return Object_Layout;

})(gs.Object_Base);

gs.Object_Layout = Object_Layout;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsYUFBQTtFQUFBOzs7QUFBTTs7OztBQUNGOzs7Ozs7Ozs7Ozs7RUFXYSx1QkFBQyxVQUFEO0FBQ1QsUUFBQTtJQUFBLDZDQUFBOztBQUdBOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELEdBQWE7O0FBRWI7Ozs7O0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUNkLElBQUMsQ0FBQSxVQUFELEdBQWMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFRLENBQUEsVUFBQTs7QUFFbkM7Ozs7O0lBS0EseUNBQWMsQ0FBRSxrQkFBaEI7TUFDSSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksTUFBTyxDQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQXRCLElBQTRCLElBQTVCLENBQWtDLENBQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBdEIsRUFEN0Q7S0FBQSxNQUFBO01BR0ksSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxFQUFFLENBQUMsNkJBQUgsQ0FBQSxFQUhwQjs7O0FBS0E7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsRUFBRSxDQUFDLHNCQUFILENBQUE7SUFFZCxJQUFDLENBQUEsWUFBRCxDQUFrQixJQUFBLEVBQUUsQ0FBQyxzQkFBSCxDQUFBLENBQWxCO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsUUFBZjtFQTVDUzs7OztHQVpXLEVBQUUsQ0FBQzs7QUE0RC9CLEVBQUUsQ0FBQyxhQUFILEdBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBPYmplY3RfTGF5b3V0XG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBPYmplY3RfTGF5b3V0IGV4dGVuZHMgZ3MuT2JqZWN0X0Jhc2VcbiAgICAjIyMqXG4gICAgKiBBIGxheW91dCBvYmplY3QgZGVmaW5lcyBhIG5ldyBVSSBsYXlvdXQgZ2FtZSBzY2VuZS4gQSBVSSBsYXlvdXQgc2NlbmVcbiAgICAqIGRpc3BsYXlzIGluLWdhbWUgVUkgYW5kIGxldCB0aGUgdXNlciBpbnRlcmFjdCB3aXRoIGl0LiBGb3IgZXhhbXBsZTogVGhlXG4gICAgKiB0aXRsZSBzY3JlZW4sIHRoZSBnYW1lIG1lbnUsIGV0Yy4gXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIE9iamVjdF9MYXlvdXRcbiAgICAqIEBleHRlbmRzIGdzLk9iamVjdF9CYXNlXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAobGF5b3V0TmFtZSkgLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICAjc3VwZXIobnVsbCwgbnVsbCwgZ3MuU2NlbmVNYW5hZ2VyKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyB0aGF0IHRoZSBVSSBsYXlvdXQgaXMgc3RpbGwgaW4gcHJlcGFyZS1zdGF0ZSBhbmQgbm90IHJlYWR5LlxuICAgICAgICAqIEBwcm9wZXJ0eSBwcmVwYXJpbmdcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAcHJlcGFyaW5nID0geWVzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxheW91dCBkZXNjcmlwdG9yLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsYXlvdXREYXRhXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAbGF5b3V0TmFtZSA9IGxheW91dE5hbWVcbiAgICAgICAgQGxheW91dERhdGEgPSB1aS5VaUZhY3RvcnkubGF5b3V0c1tsYXlvdXROYW1lXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBiZWhhdmlvci1jb21wb25lbnQgZm9yIHRoZSBVSSBsYXlvdXIgc3BlY2lmaWMgYmVoYXZpb3IuXG4gICAgICAgICogQHByb3BlcnR5IGJlaGF2aW9yXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X0xheW91dFNjZW5lQmVoYXZpb3JcbiAgICAgICAgIyMjXG4gICAgICAgIGlmIEBsYXlvdXREYXRhPy5jb21wb25lbnRcbiAgICAgICAgICAgIEBiZWhhdmlvciA9IG5ldyB3aW5kb3dbQGxheW91dERhdGEuY29tcG9uZW50Lm5zIHx8IFwiZ3NcIl1bQGxheW91dERhdGEuY29tcG9uZW50LmNsYXNzTmFtZV1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGJlaGF2aW9yID0gbmV3IGdzLkNvbXBvbmVudF9MYXlvdXRTY2VuZUJlaGF2aW9yKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIFVJIGxheW91dCBpcyB2aXNpYmxlLlxuICAgICAgICAqIEBwcm9wZXJ0eSB2aXNpYmxlXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyNcbiAgICAgICAgQHZpc2libGUgPSB5ZXNcbiBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIGV2ZW50LWVtaXR0ZXIgdG8gZW1pdCBldmVudHMuXG4gICAgICAgICogQHByb3BlcnR5IGV2ZW50c1xuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudF9FdmVudEVtaXR0ZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBldmVudHMgPSBuZXcgZ3MuQ29tcG9uZW50X0V2ZW50RW1pdHRlcigpXG4gICAgICAgIFxuICAgICAgICBAYWRkQ29tcG9uZW50KG5ldyBncy5Db21wb25lbnRfSW5wdXRIYW5kbGVyKCkpXG4gICAgICAgIEBhZGRDb21wb25lbnQoQGJlaGF2aW9yKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuZ3MuT2JqZWN0X0xheW91dCA9IE9iamVjdF9MYXlvdXQiXX0=
//# sourceURL=Object_Layout_153.js