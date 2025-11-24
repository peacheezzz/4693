var Object_MessageArea,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_MessageArea = (function(superClass) {
  extend(Object_MessageArea, superClass);

  Object_MessageArea.objectCodecBlackList = ["parent", "layout", "message"];

  Object_MessageArea.toDataBundle = function(object, context) {
    return {
      message: gs.ObjectCodec.encode(object.message, context),
      layout: {
        dstRect: gs.Rect.fromObject(object.layout.dstRect)
      }
    };
  };


  /**
  * A game object used for message areas in a scene.
  *
  * @module gs
  * @class Object_MessageArea
  * @extends gs.Object_Visual
  * @memberof gs
  * @constructor
   */

  function Object_MessageArea(parent, data, type) {
    Object_MessageArea.__super__.constructor.call(this, data);
    this.layout = null;
    this.message = null;
    this.addComponent(new gs.Component_Container());
  }

  return Object_MessageArea;

})(gs.Object_Visual);

gs.Object_MessageArea = Object_MessageArea;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsa0JBQUE7RUFBQTs7O0FBQU07OztFQUNGLGtCQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxRQUFELEVBQVcsUUFBWCxFQUFxQixTQUFyQjs7RUFFeEIsa0JBQUMsQ0FBQSxZQUFELEdBQWUsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUNYLFdBQU87TUFBRSxPQUFBLEVBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFmLENBQXNCLE1BQU0sQ0FBQyxPQUE3QixFQUFzQyxPQUF0QyxDQUFYO01BQTJELE1BQUEsRUFBUTtRQUFFLE9BQUEsRUFBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVIsQ0FBbUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFqQyxDQUFYO09BQW5FOztFQURJOzs7QUFHZjs7Ozs7Ozs7OztFQVNhLDRCQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsSUFBZjtJQUNULG9EQUFNLElBQU47SUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUVYLElBQUMsQ0FBQSxZQUFELENBQWtCLElBQUEsRUFBRSxDQUFDLG1CQUFILENBQUEsQ0FBbEI7RUFOUzs7OztHQWZnQixFQUFFLENBQUM7O0FBd0JwQyxFQUFFLENBQUMsa0JBQUgsR0FBd0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9NZXNzYWdlQXJlYVxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgT2JqZWN0X01lc3NhZ2VBcmVhIGV4dGVuZHMgZ3MuT2JqZWN0X1Zpc3VhbFxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcInBhcmVudFwiLCBcImxheW91dFwiLCBcIm1lc3NhZ2VcIl1cbiAgICBcbiAgICBAdG9EYXRhQnVuZGxlOiAob2JqZWN0LCBjb250ZXh0KSAtPlxuICAgICAgICByZXR1cm4geyBtZXNzYWdlOiBncy5PYmplY3RDb2RlYy5lbmNvZGUob2JqZWN0Lm1lc3NhZ2UsIGNvbnRleHQpLCBsYXlvdXQ6IHsgZHN0UmVjdDogZ3MuUmVjdC5mcm9tT2JqZWN0KG9iamVjdC5sYXlvdXQuZHN0UmVjdCkgfSB9XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEEgZ2FtZSBvYmplY3QgdXNlZCBmb3IgbWVzc2FnZSBhcmVhcyBpbiBhIHNjZW5lLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBPYmplY3RfTWVzc2FnZUFyZWFcbiAgICAqIEBleHRlbmRzIGdzLk9iamVjdF9WaXN1YWxcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChwYXJlbnQsIGRhdGEsIHR5cGUpIC0+XG4gICAgICAgIHN1cGVyKGRhdGEpXG4gICAgICAgIFxuICAgICAgICBAbGF5b3V0ID0gbnVsbFxuICAgICAgICBAbWVzc2FnZSA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIEBhZGRDb21wb25lbnQobmV3IGdzLkNvbXBvbmVudF9Db250YWluZXIoKSlcbiAgICBcbiAgIFxuZ3MuT2JqZWN0X01lc3NhZ2VBcmVhID0gT2JqZWN0X01lc3NhZ2VBcmVhIl19
//# sourceURL=Object_MessageArea_185.js