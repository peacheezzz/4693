var Component_Viewport,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_Viewport = (function(superClass) {
  extend(Component_Viewport, superClass);


  /**
  * A viewport component can contain multiple graphic objects and will automatically 
  * clip them if they move out of the viewport-rectangle. The area of a viewport
  * can also be tinted or colored. So to tint the whole for example, it enough
  * to create a viewport taking the whole screen-space and then setting the
  * tone or color property.
  *
  * @module gs
  * @class Component_Viewport
  * @extends gs.Component_Visual
  * @memberof gs
  * @constructor
  * @param {Viewport} [viewport=null] - A native viewport object used by the component. If null, the component create a new one.
   */

  function Component_Viewport(viewport) {
    Component_Viewport.__super__.constructor.call(this);

    /**
    * The native viewport-object.
    * @property viewport
    * @type gs.Viewport
    * @protected
     */
    this.viewport = viewport;

    /**
    * The visibility. If <b>false</b> the viewport and associated graphic objects are not rendered.
    * @property viewport
    * @type gs.Viewport
    * @protected
     */
    this.visible = true;
    this.scroll = new gs.Point(0, 0);
  }


  /**
  * Sets up the viewport.
  * @method setup
   */

  Component_Viewport.prototype.setup = function() {
    if (!this.viewport) {
      this.viewport = new gs.Viewport(0, 0, Graphics.width, Graphics.height);
    }
    return this.isSetup = true;
  };


  /**
  * Disposes the viewport and all associated graphic objects.
  * @method dispose
   */

  Component_Viewport.prototype.dispose = function() {
    return this.viewport.dispose();
  };


  /**
  * Updates the origin-point of the game object.
  * @method updateOrigin
   */

  Component_Viewport.prototype.updateOrigin = function() {};


  /**
  * Updates the padding.
  * @method updatePadding
   */

  Component_Viewport.prototype.updatePadding = function() {
    if (this.object.padding != null) {
      this.viewport.rect.x += this.object.padding.left;
      this.viewport.rect.y += this.object.padding.top;
      this.viewport.rect.width -= this.object.padding.left + this.object.padding.right;
      return this.viewport.rect.height -= this.object.padding.bottom + this.object.padding.bottom;
    }
  };


  /**
  * Updates the sprite properties from the game object properties.
  * @method update
   */

  Component_Viewport.prototype.updateProperties = function() {
    this.viewport.rect.x = this.object.dstRect.x;
    this.viewport.rect.y = this.object.dstRect.y;
    this.viewport.rect.width = this.object.dstRect.width;
    this.viewport.rect.height = this.object.dstRect.height;
    this.viewport.ox = this.scroll.x + this.object.offset.x;
    this.viewport.oy = this.scroll.y + this.object.offset.y;
    this.viewport.anchor.x = this.object.anchor.x;
    this.viewport.anchor.y = this.object.anchor.y;
    this.viewport.zoomX = this.object.zoom.x;
    this.viewport.zoomY = this.object.zoom.y;
    this.viewport.angle = this.object.angle;
    return this.viewport.z = (this.object.zIndex || 0) + (!this.object.parent ? 0 : this.object.parent.zIndex || 0);
  };


  /**
  * Updates the optional sprite properties from the game object properties.
  * @method updateOptionalProperties
   */

  Component_Viewport.prototype.updateOptionalProperties = function() {
    var ref, ref1;
    if (this.object.tone != null) {
      this.viewport.tone = this.object.tone;
    }
    if (this.object.color != null) {
      this.viewport.color = this.object.color;
    }
    if (this.object.effects != null) {
      this.viewport.effects = this.object.effects;
    }
    if (((ref = this.object.parent) != null ? ref.visible_ : void 0) != null) {
      return this.viewport.visible = this.object.visible;
    } else if (((ref1 = this.object.parent) != null ? ref1.visible : void 0) != null) {
      return this.viewport.visible = this.object.visible;
    } else {
      return this.viewport.visible = this.object.visible;
    }
  };


  /**
  * Updates the viewport.
  * @method update
   */

  Component_Viewport.prototype.update = function() {
    Component_Viewport.__super__.update.apply(this, arguments);
    if (!this.isSetup) {
      this.setup();
    }
    this.viewport.update();
    this.updatePadding();
    this.updateProperties();
    return this.updateOptionalProperties();
  };

  return Component_Viewport;

})(gs.Component_Visual);

gs.Component_Viewport = Component_Viewport;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsa0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7Ozs7O0VBY2EsNEJBQUMsUUFBRDtJQUNULGtEQUFBOztBQUVBOzs7Ozs7SUFNQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7Ozs7SUFNQSxJQUFDLENBQUEsT0FBRCxHQUFXO0lBRVgsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsQ0FBVCxFQUFZLENBQVo7RUFuQkw7OztBQXFCYjs7Ozs7K0JBSUEsS0FBQSxHQUFPLFNBQUE7SUFDSCxJQUFHLENBQUMsSUFBQyxDQUFBLFFBQUw7TUFDSSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWixFQUFlLENBQWYsRUFBa0IsUUFBUSxDQUFDLEtBQTNCLEVBQWtDLFFBQVEsQ0FBQyxNQUEzQyxFQURwQjs7V0FFQSxJQUFDLENBQUEsT0FBRCxHQUFXO0VBSFI7OztBQUtQOzs7OzsrQkFJQSxPQUFBLEdBQVMsU0FBQTtXQUNMLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFBO0VBREs7OztBQUdUOzs7OzsrQkFJQSxZQUFBLEdBQWMsU0FBQSxHQUFBOzs7QUFFZDs7Ozs7K0JBSUEsYUFBQSxHQUFlLFNBQUE7SUFDWCxJQUFHLDJCQUFIO01BQ0ksSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBZixJQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQztNQUNwQyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFmLElBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDO01BQ3BDLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQWYsSUFBd0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBaEIs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Q0osZ0RBQUEsU0FBQTtJQUVBLElBQVksQ0FBSSxJQUFDLENBQUEsT0FBakI7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBQUE7O0lBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQUE7SUFDQSxJQUFDLENBQUEsYUFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLGdCQUFELENBQUE7V0FDQSxJQUFDLENBQUEsd0JBQUQsQ0FBQTtFQVBJOzs7O0dBOUdxQixFQUFFLENBQUM7O0FBMEhwQyxFQUFFLENBQUMsa0JBQUgsR0FBd0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9WaWV3cG9ydFxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X1ZpZXdwb3J0IGV4dGVuZHMgZ3MuQ29tcG9uZW50X1Zpc3VhbFxuICAgICMjIypcbiAgICAqIEEgdmlld3BvcnQgY29tcG9uZW50IGNhbiBjb250YWluIG11bHRpcGxlIGdyYXBoaWMgb2JqZWN0cyBhbmQgd2lsbCBhdXRvbWF0aWNhbGx5IFxuICAgICogY2xpcCB0aGVtIGlmIHRoZXkgbW92ZSBvdXQgb2YgdGhlIHZpZXdwb3J0LXJlY3RhbmdsZS4gVGhlIGFyZWEgb2YgYSB2aWV3cG9ydFxuICAgICogY2FuIGFsc28gYmUgdGludGVkIG9yIGNvbG9yZWQuIFNvIHRvIHRpbnQgdGhlIHdob2xlIGZvciBleGFtcGxlLCBpdCBlbm91Z2hcbiAgICAqIHRvIGNyZWF0ZSBhIHZpZXdwb3J0IHRha2luZyB0aGUgd2hvbGUgc2NyZWVuLXNwYWNlIGFuZCB0aGVuIHNldHRpbmcgdGhlXG4gICAgKiB0b25lIG9yIGNvbG9yIHByb3BlcnR5LlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfVmlld3BvcnRcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudF9WaXN1YWxcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBbdmlld3BvcnQ9bnVsbF0gLSBBIG5hdGl2ZSB2aWV3cG9ydCBvYmplY3QgdXNlZCBieSB0aGUgY29tcG9uZW50LiBJZiBudWxsLCB0aGUgY29tcG9uZW50IGNyZWF0ZSBhIG5ldyBvbmUuIFxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAodmlld3BvcnQpIC0+XG4gICAgICAgIHN1cGVyKClcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG5hdGl2ZSB2aWV3cG9ydC1vYmplY3QuXG4gICAgICAgICogQHByb3BlcnR5IHZpZXdwb3J0XG4gICAgICAgICogQHR5cGUgZ3MuVmlld3BvcnRcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAdmlld3BvcnQgPSB2aWV3cG9ydFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSB2aXNpYmlsaXR5LiBJZiA8Yj5mYWxzZTwvYj4gdGhlIHZpZXdwb3J0IGFuZCBhc3NvY2lhdGVkIGdyYXBoaWMgb2JqZWN0cyBhcmUgbm90IHJlbmRlcmVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSB2aWV3cG9ydFxuICAgICAgICAqIEB0eXBlIGdzLlZpZXdwb3J0XG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHZpc2libGUgPSB5ZXNcbiAgICAgICAgXG4gICAgICAgIEBzY3JvbGwgPSBuZXcgZ3MuUG9pbnQoMCwgMClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIHRoZSB2aWV3cG9ydC5cbiAgICAqIEBtZXRob2Qgc2V0dXBcbiAgICAjIyNcbiAgICBzZXR1cDogLT5cbiAgICAgICAgaWYgIUB2aWV3cG9ydFxuICAgICAgICAgICAgQHZpZXdwb3J0ID0gbmV3IGdzLlZpZXdwb3J0KDAsIDAsIEdyYXBoaWNzLndpZHRoLCBHcmFwaGljcy5oZWlnaHQpXG4gICAgICAgIEBpc1NldHVwID0geWVzXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSB2aWV3cG9ydCBhbmQgYWxsIGFzc29jaWF0ZWQgZ3JhcGhpYyBvYmplY3RzLlxuICAgICogQG1ldGhvZCBkaXNwb3NlXG4gICAgIyMjXG4gICAgZGlzcG9zZTogLT4gXG4gICAgICAgIEB2aWV3cG9ydC5kaXNwb3NlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgb3JpZ2luLXBvaW50IG9mIHRoZSBnYW1lIG9iamVjdC5cbiAgICAqIEBtZXRob2QgdXBkYXRlT3JpZ2luXG4gICAgIyMjXG4gICAgdXBkYXRlT3JpZ2luOiAtPlxuICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIHBhZGRpbmcuXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVBhZGRpbmdcbiAgICAjIyNcbiAgICB1cGRhdGVQYWRkaW5nOiAtPlxuICAgICAgICBpZiBAb2JqZWN0LnBhZGRpbmc/XG4gICAgICAgICAgICBAdmlld3BvcnQucmVjdC54ICs9IEBvYmplY3QucGFkZGluZy5sZWZ0XG4gICAgICAgICAgICBAdmlld3BvcnQucmVjdC55ICs9IEBvYmplY3QucGFkZGluZy50b3BcbiAgICAgICAgICAgIEB2aWV3cG9ydC5yZWN0LndpZHRoIC09IEBvYmplY3QucGFkZGluZy5sZWZ0K0BvYmplY3QucGFkZGluZy5yaWdodFxuICAgICAgICAgICAgQHZpZXdwb3J0LnJlY3QuaGVpZ2h0IC09IEBvYmplY3QucGFkZGluZy5ib3R0b20rQG9iamVjdC5wYWRkaW5nLmJvdHRvbVxuICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBzcHJpdGUgcHJvcGVydGllcyBmcm9tIHRoZSBnYW1lIG9iamVjdCBwcm9wZXJ0aWVzLlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyNcbiAgICB1cGRhdGVQcm9wZXJ0aWVzOiAtPlxuICAgICAgICBAdmlld3BvcnQucmVjdC54ID0gQG9iamVjdC5kc3RSZWN0LnhcbiAgICAgICAgQHZpZXdwb3J0LnJlY3QueSA9IEBvYmplY3QuZHN0UmVjdC55XG4gICAgICAgIEB2aWV3cG9ydC5yZWN0LndpZHRoID0gQG9iamVjdC5kc3RSZWN0LndpZHRoXG4gICAgICAgIEB2aWV3cG9ydC5yZWN0LmhlaWdodCA9IEBvYmplY3QuZHN0UmVjdC5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIEB2aWV3cG9ydC5veCA9IEBzY3JvbGwueCArIEBvYmplY3Qub2Zmc2V0LnhcbiAgICAgICAgQHZpZXdwb3J0Lm95ID0gQHNjcm9sbC55ICsgQG9iamVjdC5vZmZzZXQueVxuICAgICAgICBAdmlld3BvcnQuYW5jaG9yLnggPSBAb2JqZWN0LmFuY2hvci54XG4gICAgICAgIEB2aWV3cG9ydC5hbmNob3IueSA9IEBvYmplY3QuYW5jaG9yLnlcbiAgICAgICAgQHZpZXdwb3J0Lnpvb21YID0gQG9iamVjdC56b29tLnhcbiAgICAgICAgQHZpZXdwb3J0Lnpvb21ZID0gQG9iamVjdC56b29tLnlcbiAgICAgICAgQHZpZXdwb3J0LmFuZ2xlID0gQG9iamVjdC5hbmdsZVxuICAgICAgICBAdmlld3BvcnQueiA9IChAb2JqZWN0LnpJbmRleCB8fCAwKSArIChpZiAhQG9iamVjdC5wYXJlbnQgdGhlbiAwIGVsc2UgQG9iamVjdC5wYXJlbnQuekluZGV4IHx8IDApXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIG9wdGlvbmFsIHNwcml0ZSBwcm9wZXJ0aWVzIGZyb20gdGhlIGdhbWUgb2JqZWN0IHByb3BlcnRpZXMuXG4gICAgKiBAbWV0aG9kIHVwZGF0ZU9wdGlvbmFsUHJvcGVydGllc1xuICAgICMjI1xuICAgIHVwZGF0ZU9wdGlvbmFsUHJvcGVydGllczogLT5cbiAgICAgICAgaWYgQG9iamVjdC50b25lP1xuICAgICAgICAgICAgQHZpZXdwb3J0LnRvbmUgPSBAb2JqZWN0LnRvbmVcbiAgICAgICAgaWYgQG9iamVjdC5jb2xvcj9cbiAgICAgICAgICAgIEB2aWV3cG9ydC5jb2xvciA9IEBvYmplY3QuY29sb3JcbiAgICAgICAgaWYgQG9iamVjdC5lZmZlY3RzP1xuICAgICAgICAgICAgQHZpZXdwb3J0LmVmZmVjdHMgPSBAb2JqZWN0LmVmZmVjdHNcbiAgICAgICAgaWYgQG9iamVjdC5wYXJlbnQ/LnZpc2libGVfP1xuICAgICAgICAgICAgQHZpZXdwb3J0LnZpc2libGUgPSBAb2JqZWN0LnZpc2libGUgXG4gICAgICAgIGVsc2UgaWYgQG9iamVjdC5wYXJlbnQ/LnZpc2libGU/XG4gICAgICAgICAgICBAdmlld3BvcnQudmlzaWJsZSA9IEBvYmplY3QudmlzaWJsZSBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHZpZXdwb3J0LnZpc2libGUgPSBAb2JqZWN0LnZpc2libGVcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIHZpZXdwb3J0LlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyNcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBAc2V0dXAoKSBpZiBub3QgQGlzU2V0dXBcbiAgICAgICAgQHZpZXdwb3J0LnVwZGF0ZSgpXG4gICAgICAgIEB1cGRhdGVQYWRkaW5nKClcbiAgICAgICAgQHVwZGF0ZVByb3BlcnRpZXMoKVxuICAgICAgICBAdXBkYXRlT3B0aW9uYWxQcm9wZXJ0aWVzKClcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcblxuZ3MuQ29tcG9uZW50X1ZpZXdwb3J0ID0gQ29tcG9uZW50X1ZpZXdwb3J0XG4iXX0=
//# sourceURL=Component_Viewport_112.js