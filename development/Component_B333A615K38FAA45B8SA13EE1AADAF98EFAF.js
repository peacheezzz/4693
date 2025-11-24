var Component;

Component = (function() {

  /**
  * The base class of all components. A component defines a certain piece of
  * game logic. 
  *
  * @module gs
  * @class Component
  * @memberof gs
  * @constructor
   */
  function Component() {

    /**
    * The associated game object. A component only be part of one game object at the same time.
    * @property object
    * @type gs.Object_Base
    * @default null
     */
    this.object = null;

    /**
    * Indicates if the component is disposed. A disposed component cannot be used anymore.
    * @property disposed
    * @type boolean
    * @default false
     */
    this.disposed = false;

    /**
    * An optional unique id. The component can be accessed through this ID using the gs.Object_Base.findComponentById method.
    * @property id
    * @type string
    * @default null
     */
    this.id = null;

    /**
    * An optional name. The component can be found through its name using the gs.Object_Base.findComponentsByName method. Multiple
    * components can have the same name. So the name can also be used to categorize components.
    * @property name
    * @type string
    * @default ""
     */
    this.name = "";

    /**
    * Indicates if the component is setup.
    * @property isSetup
    * @type boolean
    * @default no
     */
    this.isSetup = false;
  }


  /**
  * Called when the component is added to a new object.
  * @method setup
   */

  Component.prototype.setup = function() {
    return this.isSetup = true;
  };


  /**
  * Disposes the component. The component will be removed from the game object
  * automatically.
  * @method dispose
   */

  Component.prototype.dispose = function() {
    return this.disposed = true;
  };


  /**
  * Updates the component. Needs to be implemented in derived class.
  * @method update
   */

  Component.prototype.update = function() {};

  return Component;

})();

gs.Component = Component;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7OztFQVNhLG1CQUFBOztBQUNUOzs7Ozs7SUFNQSxJQUFDLENBQUEsTUFBRCxHQUFVOztBQUVWOzs7Ozs7SUFNQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7Ozs7SUFNQSxJQUFDLENBQUEsRUFBRCxHQUFNOztBQUVOOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLElBQUQsR0FBUTs7QUFFUjs7Ozs7O0lBTUEsSUFBQyxDQUFBLE9BQUQsR0FBVztFQXhDRjs7O0FBMENiOzs7OztzQkFJQSxLQUFBLEdBQU8sU0FBQTtXQUNILElBQUMsQ0FBQSxPQUFELEdBQVc7RUFEUjs7O0FBR1A7Ozs7OztzQkFLQSxPQUFBLEdBQVMsU0FBQTtXQUFHLElBQUMsQ0FBQSxRQUFELEdBQVk7RUFBZjs7O0FBRVQ7Ozs7O3NCQUlBLE1BQUEsR0FBUSxTQUFBLEdBQUE7Ozs7OztBQUVaLEVBQUUsQ0FBQyxTQUFILEdBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudFxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50XG4gICAgIyMjKlxuICAgICogVGhlIGJhc2UgY2xhc3Mgb2YgYWxsIGNvbXBvbmVudHMuIEEgY29tcG9uZW50IGRlZmluZXMgYSBjZXJ0YWluIHBpZWNlIG9mXG4gICAgKiBnYW1lIGxvZ2ljLiBcbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGFzc29jaWF0ZWQgZ2FtZSBvYmplY3QuIEEgY29tcG9uZW50IG9ubHkgYmUgcGFydCBvZiBvbmUgZ2FtZSBvYmplY3QgYXQgdGhlIHNhbWUgdGltZS5cbiAgICAgICAgKiBAcHJvcGVydHkgb2JqZWN0XG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0Jhc2VcbiAgICAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICAgICMjI1xuICAgICAgICBAb2JqZWN0ID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgY29tcG9uZW50IGlzIGRpc3Bvc2VkLiBBIGRpc3Bvc2VkIGNvbXBvbmVudCBjYW5ub3QgYmUgdXNlZCBhbnltb3JlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBkaXNwb3NlZFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAjIyNcbiAgICAgICAgQGRpc3Bvc2VkID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbiBvcHRpb25hbCB1bmlxdWUgaWQuIFRoZSBjb21wb25lbnQgY2FuIGJlIGFjY2Vzc2VkIHRocm91Z2ggdGhpcyBJRCB1c2luZyB0aGUgZ3MuT2JqZWN0X0Jhc2UuZmluZENvbXBvbmVudEJ5SWQgbWV0aG9kLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgICAgIyMjXG4gICAgICAgIEBpZCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbiBvcHRpb25hbCBuYW1lLiBUaGUgY29tcG9uZW50IGNhbiBiZSBmb3VuZCB0aHJvdWdoIGl0cyBuYW1lIHVzaW5nIHRoZSBncy5PYmplY3RfQmFzZS5maW5kQ29tcG9uZW50c0J5TmFtZSBtZXRob2QuIE11bHRpcGxlXG4gICAgICAgICogY29tcG9uZW50cyBjYW4gaGF2ZSB0aGUgc2FtZSBuYW1lLiBTbyB0aGUgbmFtZSBjYW4gYWxzbyBiZSB1c2VkIHRvIGNhdGVnb3JpemUgY29tcG9uZW50cy5cbiAgICAgICAgKiBAcHJvcGVydHkgbmFtZVxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAqIEBkZWZhdWx0IFwiXCJcbiAgICAgICAgIyMjXG4gICAgICAgIEBuYW1lID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgY29tcG9uZW50IGlzIHNldHVwLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpc1NldHVwXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBkZWZhdWx0IG5vXG4gICAgICAgICMjI1xuICAgICAgICBAaXNTZXR1cCA9IG5vXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIENhbGxlZCB3aGVuIHRoZSBjb21wb25lbnQgaXMgYWRkZWQgdG8gYSBuZXcgb2JqZWN0LlxuICAgICogQG1ldGhvZCBzZXR1cFxuICAgICMjI1xuICAgIHNldHVwOiAtPiBcbiAgICAgICAgQGlzU2V0dXAgPSB5ZXNcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIGNvbXBvbmVudC4gVGhlIGNvbXBvbmVudCB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZ2FtZSBvYmplY3RcbiAgICAqIGF1dG9tYXRpY2FsbHkuXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyNcbiAgICBkaXNwb3NlOiAtPiBAZGlzcG9zZWQgPSB5ZXNcbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBjb21wb25lbnQuIE5lZWRzIHRvIGJlIGltcGxlbWVudGVkIGluIGRlcml2ZWQgY2xhc3MuXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgXG5ncy5Db21wb25lbnQgPSBDb21wb25lbnQiXX0=
//# sourceURL=Component_6.js