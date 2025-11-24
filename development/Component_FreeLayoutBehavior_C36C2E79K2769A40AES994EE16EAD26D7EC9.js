var Component_FreeLayoutBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_FreeLayoutBehavior = (function(superClass) {
  extend(Component_FreeLayoutBehavior, superClass);


  /**
  * Turns a game object into a free-layout and layouts all sub-objects
  * at their specified positions. So that kind of layout allows each sub-object
  * to be freely positioned.
  * <br>
  * In addition, each sub-object can have different alignment options.
  *
  * @module gs
  * @class Component_FreeLayoutBehavior
  * @extends gs.Component_LayoutBehavior
  * @memberof gs
  * @constructor
   */

  function Component_FreeLayoutBehavior() {
    Component_FreeLayoutBehavior.__super__.constructor.apply(this, arguments);
  }


  /**
  * Sizes the layout to fit its content.
  *
  * @method sizeToFit
   */

  Component_FreeLayoutBehavior.prototype.sizeToFit = function() {
    var control, j, len, rect, ref, results;
    rect = this.object.dstRect;
    if (this.object.sizeToFit) {
      ref = this.object.subObjects;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        control = ref[j];
        if (!control.alignmentX) {
          rect.width = Math.max(control.margin.left + control.dstRect.width + control.margin.right, rect.width || 1);
        }
        if (!control.alignmentY) {
          results.push(rect.height = Math.max(control.margin.top + control.dstRect.height + control.margin.bottom, rect.height || 1));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };


  /**
  * Updates a specified control.
  *
  * @method updateControl
  * @protected
  * @param {gs.Object_Base} control The control to update
   */

  Component_FreeLayoutBehavior.prototype.updateControl = function(control) {
    var margin, rect;
    Component_FreeLayoutBehavior.__super__.updateControl.apply(this, arguments);
    rect = this.object.dstRect;
    margin = control.margin;
    if (control.alignmentX === 1) {
      control.dstRect.x = (rect.width - (control.dstRect.width + margin.right + margin.left)) / 2;
    } else if (control.alignmentX === 2) {
      control.dstRect.x = rect.width * this.object.zoom.x - (control.dstRect.width + control.margin.right) * control.zoom.x;
    }
    if (control.alignmentY === 1) {
      return control.dstRect.y = (rect.height * this.object.zoom.y - (control.dstRect.height + margin.bottom + margin.top) * control.zoom.y) / 2;
    } else if (control.alignmentY === 2) {
      return control.dstRect.y = rect.height - (control.dstRect.height + control.margin.bottom);
    }
  };


  /**
  * Layouts the sub-objects.
  *
  * @method update
   */

  Component_FreeLayoutBehavior.prototype.update = function() {
    var control, i, j, len, ref;
    Component_FreeLayoutBehavior.__super__.update.apply(this, arguments);
    ref = this.object.subObjects;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      control = ref[i];
      this.updateControl(control);
    }
    this.sizeToFit();
    return null;
  };

  return Component_FreeLayoutBehavior;

})(gs.Component_LayoutBehavior);

gs.Component_FreeLayoutBehavior = Component_FreeLayoutBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsNEJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7Ozs7RUFhYSxzQ0FBQTtJQUNULCtEQUFBLFNBQUE7RUFEUzs7O0FBR2I7Ozs7Ozt5Q0FLQSxTQUFBLEdBQVcsU0FBQTtBQUNQLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUNmLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFYO0FBQ0k7QUFBQTtXQUFBLHFDQUFBOztRQUNJLElBQUcsQ0FBQyxPQUFPLENBQUMsVUFBWjtVQUNJLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQWYsR0FBc0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUF0QyxHQUE4QyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQXRFLEVBQTZFLElBQUksQ0FBQyxLQUFMLElBQWMsQ0FBM0YsRUFEakI7O1FBRUEsSUFBRyxDQUFDLE9BQU8sQ0FBQyxVQUFaO3VCQUNJLElBQUksQ0FBQyxNQUFMLEdBQWMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQWYsR0FBcUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFyQyxHQUE4QyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQXRFLEVBQThFLElBQUksQ0FBQyxNQUFMLElBQWUsQ0FBN0YsR0FEbEI7U0FBQSxNQUFBOytCQUFBOztBQUhKO3FCQURKOztFQUZPOzs7QUFTWDs7Ozs7Ozs7eUNBT0EsYUFBQSxHQUFlLFNBQUMsT0FBRDtBQUNYLFFBQUE7SUFBQSxpRUFBQSxTQUFBO0lBRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUM7SUFDZixNQUFBLEdBQVMsT0FBTyxDQUFDO0lBRWpCLElBQUcsT0FBTyxDQUFDLFVBQVIsS0FBc0IsQ0FBekI7TUFDSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUwsR0FBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBaEIsR0FBc0IsTUFBTSxDQUFDLEtBQTdCLEdBQW1DLE1BQU0sQ0FBQyxJQUEzQyxDQUFkLENBQUEsR0FBa0UsRUFEMUY7S0FBQSxNQUVLLElBQUcsT0FBTyxDQUFDLFVBQVIsS0FBc0IsQ0FBekI7TUFDRCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CLElBQUksQ0FBQyxLQUFMLEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBeEIsR0FBNEIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQWhCLEdBQXdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBeEMsQ0FBQSxHQUErQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBRDNHOztJQUdMLElBQUcsT0FBTyxDQUFDLFVBQVIsS0FBc0IsQ0FBekI7YUFDSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CLENBQUMsSUFBSSxDQUFDLE1BQUwsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUF6QixHQUE2QixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBaEIsR0FBdUIsTUFBTSxDQUFDLE1BQTlCLEdBQXFDLE1BQU0sQ0FBQyxHQUE3QyxDQUFBLEdBQWtELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBN0YsQ0FBQSxHQUFrRyxFQUQxSDtLQUFBLE1BRUssSUFBRyxPQUFPLENBQUMsVUFBUixLQUFzQixDQUF6QjthQUNELE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBaEIsR0FBb0IsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBaEIsR0FBeUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUF6QyxFQURqQzs7RUFiTTs7O0FBa0JmOzs7Ozs7eUNBS0EsTUFBQSxHQUFRLFNBQUE7QUFDSixRQUFBO0lBQUEsMERBQUEsU0FBQTtBQUVBO0FBQUEsU0FBQSw2Q0FBQTs7TUFDSSxJQUFDLENBQUEsYUFBRCxDQUFlLE9BQWY7QUFESjtJQUdBLElBQUMsQ0FBQSxTQUFELENBQUE7QUFHQSxXQUFPO0VBVEg7Ozs7R0E3RCtCLEVBQUUsQ0FBQzs7QUF3RTlDLEVBQUUsQ0FBQyw0QkFBSCxHQUFrQyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X0ZyZWVMYXlvdXRCZWhhdmlvclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X0ZyZWVMYXlvdXRCZWhhdmlvciBleHRlbmRzIGdzLkNvbXBvbmVudF9MYXlvdXRCZWhhdmlvclxuICAgICMjIypcbiAgICAqIFR1cm5zIGEgZ2FtZSBvYmplY3QgaW50byBhIGZyZWUtbGF5b3V0IGFuZCBsYXlvdXRzIGFsbCBzdWItb2JqZWN0c1xuICAgICogYXQgdGhlaXIgc3BlY2lmaWVkIHBvc2l0aW9ucy4gU28gdGhhdCBraW5kIG9mIGxheW91dCBhbGxvd3MgZWFjaCBzdWItb2JqZWN0XG4gICAgKiB0byBiZSBmcmVlbHkgcG9zaXRpb25lZC5cbiAgICAqIDxicj5cbiAgICAqIEluIGFkZGl0aW9uLCBlYWNoIHN1Yi1vYmplY3QgY2FuIGhhdmUgZGlmZmVyZW50IGFsaWdubWVudCBvcHRpb25zLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfRnJlZUxheW91dEJlaGF2aW9yXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRfTGF5b3V0QmVoYXZpb3JcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+IFxuICAgICAgICBzdXBlclxuXG4gICAgIyMjKlxuICAgICogU2l6ZXMgdGhlIGxheW91dCB0byBmaXQgaXRzIGNvbnRlbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzaXplVG9GaXRcbiAgICAjIyMgXG4gICAgc2l6ZVRvRml0OiAtPlxuICAgICAgICByZWN0ID0gQG9iamVjdC5kc3RSZWN0XG4gICAgICAgIGlmIEBvYmplY3Quc2l6ZVRvRml0XG4gICAgICAgICAgICBmb3IgY29udHJvbCBpbiBAb2JqZWN0LnN1Yk9iamVjdHNcbiAgICAgICAgICAgICAgICBpZiAhY29udHJvbC5hbGlnbm1lbnRYXG4gICAgICAgICAgICAgICAgICAgIHJlY3Qud2lkdGggPSBNYXRoLm1heChjb250cm9sLm1hcmdpbi5sZWZ0ICsgY29udHJvbC5kc3RSZWN0LndpZHRoICsgY29udHJvbC5tYXJnaW4ucmlnaHQsIHJlY3Qud2lkdGggfHwgMSlcbiAgICAgICAgICAgICAgICBpZiAhY29udHJvbC5hbGlnbm1lbnRZXG4gICAgICAgICAgICAgICAgICAgIHJlY3QuaGVpZ2h0ID0gTWF0aC5tYXgoY29udHJvbC5tYXJnaW4udG9wICsgY29udHJvbC5kc3RSZWN0LmhlaWdodCArIGNvbnRyb2wubWFyZ2luLmJvdHRvbSwgcmVjdC5oZWlnaHQgfHwgMSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIGEgc3BlY2lmaWVkIGNvbnRyb2wuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVDb250cm9sXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBjb250cm9sIFRoZSBjb250cm9sIHRvIHVwZGF0ZVxuICAgICMjIyAgICAgICAgIFxuICAgIHVwZGF0ZUNvbnRyb2w6IChjb250cm9sKSAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgcmVjdCA9IEBvYmplY3QuZHN0UmVjdFxuICAgICAgICBtYXJnaW4gPSBjb250cm9sLm1hcmdpblxuXG4gICAgICAgIGlmIGNvbnRyb2wuYWxpZ25tZW50WCA9PSAxXG4gICAgICAgICAgICBjb250cm9sLmRzdFJlY3QueCA9IChyZWN0LndpZHRoIC0gKGNvbnRyb2wuZHN0UmVjdC53aWR0aCttYXJnaW4ucmlnaHQrbWFyZ2luLmxlZnQpKSAvIDJcbiAgICAgICAgZWxzZSBpZiBjb250cm9sLmFsaWdubWVudFggPT0gMlxuICAgICAgICAgICAgY29udHJvbC5kc3RSZWN0LnggPSByZWN0LndpZHRoKkBvYmplY3Quem9vbS54IC0gKGNvbnRyb2wuZHN0UmVjdC53aWR0aCArIGNvbnRyb2wubWFyZ2luLnJpZ2h0KSpjb250cm9sLnpvb20ueCBcbiAgICAgXG4gICAgICAgIGlmIGNvbnRyb2wuYWxpZ25tZW50WSA9PSAxXG4gICAgICAgICAgICBjb250cm9sLmRzdFJlY3QueSA9IChyZWN0LmhlaWdodCpAb2JqZWN0Lnpvb20ueSAtIChjb250cm9sLmRzdFJlY3QuaGVpZ2h0K21hcmdpbi5ib3R0b20rbWFyZ2luLnRvcCkqY29udHJvbC56b29tLnkpIC8gMlxuICAgICAgICBlbHNlIGlmIGNvbnRyb2wuYWxpZ25tZW50WSA9PSAyXG4gICAgICAgICAgICBjb250cm9sLmRzdFJlY3QueSA9IHJlY3QuaGVpZ2h0IC0gKGNvbnRyb2wuZHN0UmVjdC5oZWlnaHQgKyBjb250cm9sLm1hcmdpbi5ib3R0b20pXG4gICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBMYXlvdXRzIHRoZSBzdWItb2JqZWN0cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIGZvciBjb250cm9sLCBpIGluIEBvYmplY3Quc3ViT2JqZWN0c1xuICAgICAgICAgICAgQHVwZGF0ZUNvbnRyb2woY29udHJvbClcbiAgICAgICAgICAgIFxuICAgICAgICBAc2l6ZVRvRml0KClcbiBcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbCAgICBcbiAgICAgICAgXG5ncy5Db21wb25lbnRfRnJlZUxheW91dEJlaGF2aW9yID0gQ29tcG9uZW50X0ZyZWVMYXlvdXRCZWhhdmlvciJdfQ==
//# sourceURL=Component_FreeLayoutBehavior_63.js