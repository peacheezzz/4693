var Component_Visual,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_Visual = (function(superClass) {
  extend(Component_Visual, superClass);


  /**
  * The base class for all components displaying an object on screen.
  * @module gs
  * @class Component_Visual
  * @extends gs.Component
  * @memberof gs
  * @constructor
   */

  function Component_Visual() {
    Component_Visual.__super__.constructor.apply(this, arguments);
  }


  /**
  * Updates the origin-point of the game object.
  * @method updateOrigin
   */

  Component_Visual.prototype.updateOrigin = function() {
    var ox, oy, p;
    ox = 0;
    oy = 0;
    if (this.object.parent != null) {
      p = this.object.parent;
      while ((p != null) && (p.dstRect != null)) {
        ox += Math.round(p.dstRect.x + p.offset.x);
        oy += Math.round(p.dstRect.y + p.offset.y);
        p = p.parent;
      }
    }
    ox += this.object.offset.x;
    oy += this.object.offset.y;
    this.object.origin.x = ox;
    return this.object.origin.y = oy;
  };


  /**
  * Updates the origin and the destination-rectangle from a layout-rectangle if present.
  * @method update
   */

  Component_Visual.prototype.update = function() {
    var ref;
    Component_Visual.__super__.update.apply(this, arguments);
    this.updateOrigin();
    if ((this.object.layoutRect != null) && (((ref = this.object.parent) != null ? ref.dstRect : void 0) != null)) {
      if (this.object.layoutRect.x) {
        this.object.dstRect.x = this.object.layoutRect.x(this.object.parent.dstRect.width);
      }
      if (this.object.layoutRect.y) {
        this.object.dstRect.y = this.object.layoutRect.y(this.object.parent.dstRect.height);
      }
      if (this.object.layoutRect.width) {
        this.object.dstRect.width = this.object.layoutRect.width(this.object.parent.dstRect.width);
      }
      if (this.object.layoutRect.height) {
        return this.object.dstRect.height = this.object.layoutRect.height(this.object.parent.dstRect.height);
      }
    }
  };

  return Component_Visual;

})(gs.Component);

gs.Component_Visual = Component_Visual;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsZ0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7O0VBUWEsMEJBQUE7SUFDVCxtREFBQSxTQUFBO0VBRFM7OztBQUdiOzs7Ozs2QkFJQSxZQUFBLEdBQWMsU0FBQTtBQUNWLFFBQUE7SUFBQSxFQUFBLEdBQUs7SUFDTCxFQUFBLEdBQUs7SUFDTCxJQUFHLDBCQUFIO01BQ0ksQ0FBQSxHQUFJLElBQUMsQ0FBQSxNQUFNLENBQUM7QUFDWixhQUFNLFdBQUEsSUFBTyxtQkFBYjtRQUNJLEVBQUEsSUFBTSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBVixHQUFjLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBbEM7UUFDTixFQUFBLElBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQVYsR0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQWxDO1FBQ04sQ0FBQSxHQUFJLENBQUMsQ0FBQztNQUhWLENBRko7O0lBT0EsRUFBQSxJQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ3JCLEVBQUEsSUFBTSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUdyQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFmLEdBQW1CO1dBQ25CLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQWYsR0FBbUI7RUFmVDs7O0FBa0JkOzs7Ozs2QkFJQSxNQUFBLEdBQVEsU0FBQTtBQUNKLFFBQUE7SUFBQSw4Q0FBQSxTQUFBO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQUdBLElBQUcsZ0NBQUEsSUFBd0IscUVBQTNCO01BQ0ksSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUF0QjtRQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFoQixHQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFuQixDQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBNUMsRUFBakQ7O01BQ0EsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUF0QjtRQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFoQixHQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFuQixDQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBNUMsRUFBakQ7O01BQ0EsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUF0QjtRQUFpQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFoQixHQUF3QixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFuQixDQUF5QixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBaEQsRUFBekQ7O01BQ0EsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUF0QjtlQUFrQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFoQixHQUF5QixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFuQixDQUEwQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBakQsRUFBM0Q7T0FKSjs7RUFMSTs7OztHQXRDbUIsRUFBRSxDQUFDOztBQW1EbEMsRUFBRSxDQUFDLGdCQUFILEdBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfVmlzdWFsXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfVmlzdWFsIGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgIyMjKlxuICAgICogVGhlIGJhc2UgY2xhc3MgZm9yIGFsbCBjb21wb25lbnRzIGRpc3BsYXlpbmcgYW4gb2JqZWN0IG9uIHNjcmVlbi5cbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfVmlzdWFsXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgb3JpZ2luLXBvaW50IG9mIHRoZSBnYW1lIG9iamVjdC5cbiAgICAqIEBtZXRob2QgdXBkYXRlT3JpZ2luXG4gICAgIyMjXG4gICAgdXBkYXRlT3JpZ2luOiAtPlxuICAgICAgICBveCA9IDBcbiAgICAgICAgb3kgPSAwXG4gICAgICAgIGlmIEBvYmplY3QucGFyZW50P1xuICAgICAgICAgICAgcCA9IEBvYmplY3QucGFyZW50XG4gICAgICAgICAgICB3aGlsZSBwPyBhbmQgcC5kc3RSZWN0P1xuICAgICAgICAgICAgICAgIG94ICs9IE1hdGgucm91bmQocC5kc3RSZWN0LnggKyBwLm9mZnNldC54KVxuICAgICAgICAgICAgICAgIG95ICs9IE1hdGgucm91bmQocC5kc3RSZWN0LnkgKyBwLm9mZnNldC55KVxuICAgICAgICAgICAgICAgIHAgPSBwLnBhcmVudFxuICAgICAgICAgIFxuICAgICAgICBveCArPSBAb2JqZWN0Lm9mZnNldC54XG4gICAgICAgIG95ICs9IEBvYmplY3Qub2Zmc2V0LnlcblxuICAgICAgICBcbiAgICAgICAgQG9iamVjdC5vcmlnaW4ueCA9IG94XG4gICAgICAgIEBvYmplY3Qub3JpZ2luLnkgPSBveVxuICAgICAgICBcbiAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIG9yaWdpbiBhbmQgdGhlIGRlc3RpbmF0aW9uLXJlY3RhbmdsZSBmcm9tIGEgbGF5b3V0LXJlY3RhbmdsZSBpZiBwcmVzZW50LlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyNcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIEB1cGRhdGVPcmlnaW4oKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QubGF5b3V0UmVjdD8gYW5kIEBvYmplY3QucGFyZW50Py5kc3RSZWN0P1xuICAgICAgICAgICAgaWYgQG9iamVjdC5sYXlvdXRSZWN0LnggdGhlbiBAb2JqZWN0LmRzdFJlY3QueCA9IEBvYmplY3QubGF5b3V0UmVjdC54KEBvYmplY3QucGFyZW50LmRzdFJlY3Qud2lkdGgpXG4gICAgICAgICAgICBpZiBAb2JqZWN0LmxheW91dFJlY3QueSB0aGVuIEBvYmplY3QuZHN0UmVjdC55ID0gQG9iamVjdC5sYXlvdXRSZWN0LnkoQG9iamVjdC5wYXJlbnQuZHN0UmVjdC5oZWlnaHQpXG4gICAgICAgICAgICBpZiBAb2JqZWN0LmxheW91dFJlY3Qud2lkdGggdGhlbiBAb2JqZWN0LmRzdFJlY3Qud2lkdGggPSBAb2JqZWN0LmxheW91dFJlY3Qud2lkdGgoQG9iamVjdC5wYXJlbnQuZHN0UmVjdC53aWR0aClcbiAgICAgICAgICAgIGlmIEBvYmplY3QubGF5b3V0UmVjdC5oZWlnaHQgdGhlbiBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gQG9iamVjdC5sYXlvdXRSZWN0LmhlaWdodChAb2JqZWN0LnBhcmVudC5kc3RSZWN0LmhlaWdodClcblxuXG5cbmdzLkNvbXBvbmVudF9WaXN1YWwgPSBDb21wb25lbnRfVmlzdWFsIl19
//# sourceURL=Component_Visual_54.js