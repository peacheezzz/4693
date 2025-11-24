var Object_Animation,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Animation = (function(superClass) {
  extend(Object_Animation, superClass);


  /**
  * A game object used for animations.
  *
  * @module gs
  * @class Object_Animation
  * @extends gs.Object_Picture
  * @memberof gs
  * @constructor
   */

  function Object_Animation(record) {
    var component;
    Object_Animation.__super__.constructor.call(this);
    this.image = record != null ? record.graphic.name : void 0;
    component = new gs.Component_FrameAnimation(record);
    this.addComponent(component);
  }

  return Object_Animation;

})(gs.Object_Picture);

gs.Object_Animation = Object_Animation;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsZ0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OztFQVNhLDBCQUFDLE1BQUQ7QUFDVCxRQUFBO0lBQUEsZ0RBQUE7SUFFQSxJQUFDLENBQUEsS0FBRCxvQkFBUyxNQUFNLENBQUUsT0FBTyxDQUFDO0lBRXpCLFNBQUEsR0FBZ0IsSUFBQSxFQUFFLENBQUMsd0JBQUgsQ0FBNEIsTUFBNUI7SUFDaEIsSUFBQyxDQUFBLFlBQUQsQ0FBYyxTQUFkO0VBTlM7Ozs7R0FWYyxFQUFFLENBQUM7O0FBbUJsQyxFQUFFLENBQUMsZ0JBQUgsR0FBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9BbmltYXRpb25cbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdF9BbmltYXRpb24gZXh0ZW5kcyBncy5PYmplY3RfUGljdHVyZVxuICAgICMjIypcbiAgICAqIEEgZ2FtZSBvYmplY3QgdXNlZCBmb3IgYW5pbWF0aW9ucy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgT2JqZWN0X0FuaW1hdGlvblxuICAgICogQGV4dGVuZHMgZ3MuT2JqZWN0X1BpY3R1cmVcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChyZWNvcmQpIC0+XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgIEBpbWFnZSA9IHJlY29yZD8uZ3JhcGhpYy5uYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgY29tcG9uZW50ID0gbmV3IGdzLkNvbXBvbmVudF9GcmFtZUFuaW1hdGlvbihyZWNvcmQpXG4gICAgICAgIEBhZGRDb21wb25lbnQoY29tcG9uZW50KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbmdzLk9iamVjdF9BbmltYXRpb24gPSBPYmplY3RfQW5pbWF0aW9uIl19
//# sourceURL=Object_Animation_178.js