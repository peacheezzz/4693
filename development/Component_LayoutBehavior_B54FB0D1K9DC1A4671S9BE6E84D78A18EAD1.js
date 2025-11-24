var Component_LayoutBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_LayoutBehavior = (function(superClass) {
  extend(Component_LayoutBehavior, superClass);


  /**
  * The base class of all layout-components. A layout-component is used
  * to layout assigned sub-objects in a specific way depending on the layout-type.
  * For example: A grid-layout layouts its sub-objects like a grid using rows
  * and columns. The game object needs a container-component.<br><br>
  *
  * A layout can also be configured as scrollable. In that case, layout's content
  * can be larger than the layout-bounds and is automatically clipped. The content
  * can be scrolled using mouse-wheel or touch-gesture.
  *
  * @module gs
  * @class Component_LayoutBehavior
  * @extends gs.Component
  * @memberof gs
  * @constructor
   */

  function Component_LayoutBehavior() {

    /**
    * Content size of the layout.
    * @property contentSize
    * @type gs.Size
    * @readOnly
     */
    this.contentSize = {
      width: 0,
      height: 0
    };
  }


  /**
  * Disposes the layout and all its sub-objects.
  *
  * @method dispose
   */

  Component_LayoutBehavior.prototype.dispose = function() {
    var control, i, len, ref, results;
    ref = this.object.controls;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      control = ref[i];
      results.push(control != null ? control.dispose() : void 0);
    }
    return results;
  };


  /**
  * Initializes the layout.
  *
  * @method setup
   */

  Component_LayoutBehavior.prototype.setup = function() {};


  /**
  * Sizes the layout to fit its content.
  *
  * @method sizeToFit
  * @abstract
   */

  Component_LayoutBehavior.prototype.sizeToFit = function() {};


  /**
  * Sort-Function to sort sub-objects by order-index.
  *
  * @method sort_
  * @protected
  * @param {gs.Object_Base} a Object A
  * @param {gs.Object_Base} b Object B
   */

  Component_LayoutBehavior.prototype.sort_ = function(a, b) {
    if (a.order > b.order) {
      return -1;
    } else if (a.order < b.order) {
      return 1;
    } else {
      return 0;
    }
  };


  /**
  * Updates a specified control.
  *
  * @method updateControl
  * @protected
  * @param {gs.Object_Base} control The control to update
   */

  Component_LayoutBehavior.prototype.updateControl = function(control) {
    this.object.rIndex = Math.max(this.object.rIndex, control.rIndex);
    if (control.updateBehavior === ui.UpdateBehavior.CONTINUOUS) {
      control.needsUpdate = true;
    }
    if (control.inheritProperties) {
      control.ui.enabled = this.object.ui.enabled;
      control.opacity = this.object.opacity;
      control.zoom = this.object.zoom;
      control.color = this.object.color;
      control.tone = this.object.tone;
      control.angle = this.object.angle;
      control.anchor.x = this.object.anchor.x;
      control.anchor.y = this.object.anchor.y;
    }
    if (control.needsUpdate) {
      control.needsUpdate = false;
      control.update();
      control.parent = this.object;
    }
    if (this.object.clipRect != null) {
      return control.clipRect = this.object.clipRect;
    }
  };


  /**
  * Updates the content size of the layout. Only works if scrolling is
  * enabled.
  *
  * @method updateContentSize
  * @protected
   */

  Component_LayoutBehavior.prototype.updateContentSize = function() {
    var control, i, len, ref;
    if (this.object.scrollable) {
      this.contentSize.width = 0;
      this.contentSize.height = 0;
      ref = this.object.controls;
      for (i = 0, len = ref.length; i < len; i++) {
        control = ref[i];
        if (control) {
          this.contentSize.width += control.margin.left + control.dstRect.width + control.margin.right;
          this.contentSize.height += control.margin.top + control.dstRect.height + control.margin.bottom;
        }
      }
      this.object.contentHeight = this.contentSize.height;
      return this.object.contentWidth = this.contentSize.width;
    }
  };


  /**
  * Updates scrolling.
  *
  * @method updateScroll
   */

  Component_LayoutBehavior.prototype.updateScroll = function() {
    if (this.object.scrollable && this.object.canReceiveInput()) {
      this.object.scrollableHeight = Math.max(0, this.contentSize.height - this.object.dstRect.height);
      if (Input.Mouse.wheel <= -1) {
        this.object.scrollOffsetY = Math.max(this.object.scrollOffsetY - Input.Mouse.wheelSpeed * 0.1, 0);
      }
      if (Input.Mouse.wheel >= 1) {
        this.object.scrollOffsetY = Math.min(this.object.scrollOffsetY - Input.Mouse.wheelSpeed * 0.1, this.object.scrollableHeight);
      }
      return this.object.scrollOffsetY = Math.max(Math.min(this.object.scrollOffsetY, this.object.scrollableHeight), 0);
    }
  };


  /**
  * Updates the layout's content.
  *
  * @method updateContent
   */

  Component_LayoutBehavior.prototype.updateContent = function() {};


  /**
  * Updates the layout.
  *
  * @method update
   */

  Component_LayoutBehavior.prototype.update = function() {
    Component_LayoutBehavior.__super__.update.apply(this, arguments);
    this.updateContentSize();
    return this.updateScroll();
  };

  return Component_LayoutBehavior;

})(gs.Component_Visual);

gs.Component_LayoutBehavior = Component_LayoutBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsd0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQmEsa0NBQUE7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxXQUFELEdBQWU7TUFBQSxLQUFBLEVBQU8sQ0FBUDtNQUFVLE1BQUEsRUFBUSxDQUFsQjs7RUFQTjs7O0FBU2I7Ozs7OztxQ0FPQSxPQUFBLEdBQVMsU0FBQTtBQUNMLFFBQUE7QUFBQTtBQUFBO1NBQUEscUNBQUE7O3FDQUNJLE9BQU8sQ0FBRSxPQUFULENBQUE7QUFESjs7RUFESzs7O0FBSVQ7Ozs7OztxQ0FLQSxLQUFBLEdBQU8sU0FBQSxHQUFBOzs7QUFFUDs7Ozs7OztxQ0FNQSxTQUFBLEdBQVcsU0FBQSxHQUFBOzs7QUFFWDs7Ozs7Ozs7O3FDQVFBLEtBQUEsR0FBTyxTQUFDLENBQUQsRUFBSSxDQUFKO0lBQ0gsSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxLQUFmO0FBQ0UsYUFBTyxDQUFDLEVBRFY7S0FBQSxNQUVLLElBQUcsQ0FBQyxDQUFDLEtBQUYsR0FBVSxDQUFDLENBQUMsS0FBZjtBQUNILGFBQU8sRUFESjtLQUFBLE1BQUE7QUFHSCxhQUFPLEVBSEo7O0VBSEY7OztBQVFQOzs7Ozs7OztxQ0FPQSxhQUFBLEdBQWUsU0FBQyxPQUFEO0lBQ1gsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFqQixFQUF5QixPQUFPLENBQUMsTUFBakM7SUFFakIsSUFBRyxPQUFPLENBQUMsY0FBUixLQUEwQixFQUFFLENBQUMsY0FBYyxDQUFDLFVBQS9DO01BQ0ksT0FBTyxDQUFDLFdBQVIsR0FBc0IsS0FEMUI7O0lBR0EsSUFBRyxPQUFPLENBQUMsaUJBQVg7TUFDSSxPQUFPLENBQUMsRUFBRSxDQUFD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QUFDLENBQUEsTUFBTSxDQUFDLGdCQUF2RSxFQUQ1Qjs7YUFJQSxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsR0FBd0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBakIsRUFBZ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBeEMsQ0FBVCxFQUFvRSxDQUFwRSxFQVQ1Qjs7RUFEVTs7O0FBWWQ7Ozs7OztxQ0FLQSxhQUFBLEdBQWUsU0FBQSxHQUFBOzs7QUFFZjs7Ozs7O3FDQUtBLE1BQUEsR0FBUSxTQUFBO0lBQ0osc0RBQUEsU0FBQTtJQUVBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO1dBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTtFQUpJOzs7O0dBckoyQixFQUFFLENBQUM7O0FBaUsxQyxFQUFFLENBQUMsd0JBQUgsR0FBOEIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9MYXlvdXRCZWhhdmlvclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X0xheW91dEJlaGF2aW9yIGV4dGVuZHMgZ3MuQ29tcG9uZW50X1Zpc3VhbFxuICAgICMjIypcbiAgICAqIFRoZSBiYXNlIGNsYXNzIG9mIGFsbCBsYXlvdXQtY29tcG9uZW50cy4gQSBsYXlvdXQtY29tcG9uZW50IGlzIHVzZWRcbiAgICAqIHRvIGxheW91dCBhc3NpZ25lZCBzdWItb2JqZWN0cyBpbiBhIHNwZWNpZmljIHdheSBkZXBlbmRpbmcgb24gdGhlIGxheW91dC10eXBlLlxuICAgICogRm9yIGV4YW1wbGU6IEEgZ3JpZC1sYXlvdXQgbGF5b3V0cyBpdHMgc3ViLW9iamVjdHMgbGlrZSBhIGdyaWQgdXNpbmcgcm93c1xuICAgICogYW5kIGNvbHVtbnMuIFRoZSBnYW1lIG9iamVjdCBuZWVkcyBhIGNvbnRhaW5lci1jb21wb25lbnQuPGJyPjxicj5cbiAgICAqXG4gICAgKiBBIGxheW91dCBjYW4gYWxzbyBiZSBjb25maWd1cmVkIGFzIHNjcm9sbGFibGUuIEluIHRoYXQgY2FzZSwgbGF5b3V0J3MgY29udGVudFxuICAgICogY2FuIGJlIGxhcmdlciB0aGFuIHRoZSBsYXlvdXQtYm91bmRzIGFuZCBpcyBhdXRvbWF0aWNhbGx5IGNsaXBwZWQuIFRoZSBjb250ZW50XG4gICAgKiBjYW4gYmUgc2Nyb2xsZWQgdXNpbmcgbW91c2Utd2hlZWwgb3IgdG91Y2gtZ2VzdHVyZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0xheW91dEJlaGF2aW9yXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250ZW50IHNpemUgb2YgdGhlIGxheW91dC5cbiAgICAgICAgKiBAcHJvcGVydHkgY29udGVudFNpemVcbiAgICAgICAgKiBAdHlwZSBncy5TaXplXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAY29udGVudFNpemUgPSB3aWR0aDogMCwgaGVpZ2h0OiAwXG5cbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyB0aGUgbGF5b3V0IGFuZCBhbGwgaXRzIHN1Yi1vYmplY3RzLlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjIyAgXG4gICAgIyBGSVhNRTogSXMgdGhhdCBzdGlsbCBuZWNlc3Nhcnk/IElmIHRoZSBwYXJlbnQgZ2FtZSBvYmplY3QgaXMgZGlzcG9zZWRcbiAgICAjIGFsbCBzdWItb2JqZWN0cyBhcmUgZGlzcG9zZWQgYXMgd2VsbC5cbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBmb3IgY29udHJvbCBpbiBAb2JqZWN0LmNvbnRyb2xzXG4gICAgICAgICAgICBjb250cm9sPy5kaXNwb3NlKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgbGF5b3V0LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBcbiAgICAjIyMgXG4gICAgc2V0dXA6IC0+XG4gICAgIFxuICAgICMjIypcbiAgICAqIFNpemVzIHRoZSBsYXlvdXQgdG8gZml0IGl0cyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2l6ZVRvRml0XG4gICAgKiBAYWJzdHJhY3RcbiAgICAjIyMgXG4gICAgc2l6ZVRvRml0OiAtPlxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTb3J0LUZ1bmN0aW9uIHRvIHNvcnQgc3ViLW9iamVjdHMgYnkgb3JkZXItaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBzb3J0X1xuICAgICogQHByb3RlY3RlZFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gYSBPYmplY3QgQVxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gYiBPYmplY3QgQlxuICAgICMjIyAgICBcbiAgICBzb3J0XzogKGEsIGIpIC0+XG4gICAgICAgIGlmIGEub3JkZXIgPiBiLm9yZGVyXG4gICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIGVsc2UgaWYgYS5vcmRlciA8IGIub3JkZXJcbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIDBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIGEgc3BlY2lmaWVkIGNvbnRyb2wuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVDb250cm9sXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBjb250cm9sIFRoZSBjb250cm9sIHRvIHVwZGF0ZVxuICAgICMjIyBcbiAgICB1cGRhdGVDb250cm9sOiAoY29udHJvbCkgLT5cbiAgICAgICAgQG9iamVjdC5ySW5kZXggPSBNYXRoLm1heChAb2JqZWN0LnJJbmRleCwgY29udHJvbC5ySW5kZXgpXG4gICAgICAgIFxuICAgICAgICBpZiBjb250cm9sLnVwZGF0ZUJlaGF2aW9yID09IHVpLlVwZGF0ZUJlaGF2aW9yLkNPTlRJTlVPVVNcbiAgICAgICAgICAgIGNvbnRyb2wubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjb250cm9sLmluaGVyaXRQcm9wZXJ0aWVzXG4gICAgICAgICAgICBjb250cm9sLnVpLmVuYWJsZWQgPSBAb2JqZWN0LnVpLmVuYWJsZWRcbiAgICAgICAgICAgIGNvbnRyb2wub3BhY2l0eSA9IEBvYmplY3Qub3BhY2l0eVxuICAgICAgICAgICAgY29udHJvbC56b29tID0gQG9iamVjdC56b29tXG4gICAgICAgICAgICBjb250cm9sLmNvbG9yID0gQG9iamVjdC5jb2xvclxuICAgICAgICAgICAgY29udHJvbC50b25lID0gQG9iamVjdC50b25lXG4gICAgICAgICAgICBjb250cm9sLmFuZ2xlID0gQG9iamVjdC5hbmdsZVxuICAgICAgICAgICAgY29udHJvbC5hbmNob3IueCA9IEBvYmplY3QuYW5jaG9yLnhcbiAgICAgICAgICAgIGNvbnRyb2wuYW5jaG9yLnkgPSBAb2JqZWN0LmFuY2hvci55XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjb250cm9sLm5lZWRzVXBkYXRlXG4gICAgICAgICAgICBjb250cm9sLm5lZWRzVXBkYXRlID0gbm9cbiAgICAgICAgICAgIGNvbnRyb2wudXBkYXRlKClcbiAgICAgICAgICAgIGNvbnRyb2wucGFyZW50ID0gQG9iamVjdFxuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiBAb2JqZWN0LmNsaXBSZWN0P1xuICAgICAgICAgICAgY29udHJvbC5jbGlwUmVjdCA9IEBvYmplY3QuY2xpcFJlY3RcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgY29udGVudCBzaXplIG9mIHRoZSBsYXlvdXQuIE9ubHkgd29ya3MgaWYgc2Nyb2xsaW5nIGlzXG4gICAgKiBlbmFibGVkLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29udGVudFNpemVcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgdXBkYXRlQ29udGVudFNpemU6IC0+XG4gICAgICAgIGlmIEBvYmplY3Quc2Nyb2xsYWJsZVxuICAgICAgICAgICAgQGNvbnRlbnRTaXplLndpZHRoID0gMFxuICAgICAgICAgICAgQGNvbnRlbnRTaXplLmhlaWdodCA9IDBcbiAgICAgICAgICAgIGZvciBjb250cm9sIGluIEBvYmplY3QuY29udHJvbHNcbiAgICAgICAgICAgICAgICBpZiBjb250cm9sXG4gICAgICAgICAgICAgICAgICAgIEBjb250ZW50U2l6ZS53aWR0aCArPSBjb250cm9sLm1hcmdpbi5sZWZ0ICsgY29udHJvbC5kc3RSZWN0LndpZHRoICsgY29udHJvbC5tYXJnaW4ucmlnaHRcbiAgICAgICAgICAgICAgICAgICAgQGNvbnRlbnRTaXplLmhlaWdodCArPSBjb250cm9sLm1hcmdpbi50b3AgKyBjb250cm9sLmRzdFJlY3QuaGVpZ2h0ICsgY29udHJvbC5tYXJnaW4uYm90dG9tXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBvYmplY3QuY29udGVudEhlaWdodCA9IEBjb250ZW50U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgIEBvYmplY3QuY29udGVudFdpZHRoID0gQGNvbnRlbnRTaXplLndpZHRoXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgc2Nyb2xsaW5nLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlU2Nyb2xsXG4gICAgIyMjXG4gICAgdXBkYXRlU2Nyb2xsOiAtPlxuICAgICAgICBpZiBAb2JqZWN0LnNjcm9sbGFibGUgJiYgQG9iamVjdC5jYW5SZWNlaXZlSW5wdXQoKVxuICAgICAgICAgICAgQG9iamVjdC5zY3JvbGxhYmxlSGVpZ2h0ID0gTWF0aC5tYXgoMCwgQGNvbnRlbnRTaXplLmhlaWdodCAtIEBvYmplY3QuZHN0UmVjdC5oZWlnaHQpXG4gICAgICAgICAgICBpZiBJbnB1dC5Nb3VzZS53aGVlbCA8PSAtMVxuICAgICAgICAgICAgICAgIEBvYmplY3Quc2Nyb2xsT2Zmc2V0WSA9IE1hdGgubWF4KEBvYmplY3Quc2Nyb2xsT2Zmc2V0WSAtIElucHV0Lk1vdXNlLndoZWVsU3BlZWQgKiAwLjEsIDApXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIElucHV0Lk1vdXNlLndoZWVsID49IDFcbiAgICAgICAgICAgICAgICBAb2JqZWN0LnNjcm9sbE9mZnNldFkgPSBNYXRoLm1pbihAb2JqZWN0LnNjcm9sbE9mZnNldFkgLSBJbnB1dC5Nb3VzZS53aGVlbFNwZWVkICogMC4xLCBAb2JqZWN0LnNjcm9sbGFibGVIZWlnaHQpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgICAgQG9iamVjdC5zY3JvbGxPZmZzZXRZID0gTWF0aC5tYXgoTWF0aC5taW4oQG9iamVjdC5zY3JvbGxPZmZzZXRZLCBAb2JqZWN0LnNjcm9sbGFibGVIZWlnaHQpLCAwKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBsYXlvdXQncyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29udGVudFxuICAgICMjIyAgXG4gICAgdXBkYXRlQ29udGVudDogLT5cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgbGF5b3V0LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjICAgIFxuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVDb250ZW50U2l6ZSgpXG4gICAgICAgIEB1cGRhdGVTY3JvbGwoKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICNpZiBAb2JqZWN0Lm5lZWRzU29ydFxuICAgICAgICAjICAgIEBvYmplY3Quc3ViT2JqZWN0cy5zb3J0KEBzb3J0XylcbiAgICAgICAgIyAgICBAb2JqZWN0Lm5lZWRzU29ydCA9IG5vXG4gICAgXG4gICAgICAgIFxuZ3MuQ29tcG9uZW50X0xheW91dEJlaGF2aW9yID0gQ29tcG9uZW50X0xheW91dEJlaGF2aW9yIl19
//# sourceURL=Component_LayoutBehavior_50.js