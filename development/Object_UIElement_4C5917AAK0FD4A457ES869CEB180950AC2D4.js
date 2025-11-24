var Object_UIElement,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_UIElement = (function(superClass) {
  extend(Object_UIElement, superClass);

  Object_UIElement.accessors("image", {
    set: function(image) {
      if (image !== this.image_) {
        this.image_ = image;
        return this.needsUpdate = true;
      }
    },
    get: function() {
      return this.image_;
    }
  });

  Object_UIElement.accessors("opacity", {
    set: function(opacity) {
      if (opacity !== this.opacity_) {
        this.opacity_ = opacity;
        return this.needsUpdate = true;
      }
    },
    get: function() {
      return this.opacity_;
    }
  });

  Object_UIElement.accessors("clipRect", {
    set: function(clipRect) {
      if (clipRect !== this.clipRect_) {
        this.clipRect_ = clipRect;
        return this.needsUpdate = true;
      }
    },
    get: function() {
      return this.clipRect_;
    }
  });

  Object_UIElement.accessors("visible", {
    set: function(v) {
      if (v !== this.visible_) {
        this.visible_ = v;
        this.needsUpdate = true;
        return this.fullRefresh();
      }
    },
    get: function() {
      return this.visible_ && (!this.parent || this.parent.visible);
    }
  });


  /**
  * The base class for all In-Game UI objects.
  *
  * @module ui
  * @class Object_UIElement
  * @extends gs.Object_Base
  * @memberof ui
  * @constructor
   */

  function Object_UIElement() {
    Object_UIElement.__super__.constructor.call(this);
    this.id = "";

    /**
    * Indicates if that UI object will break the binding-chain. If <b>true</b> the UI object
    * will not change any binding-targets for the current binding-execution period.
    * @property breakBindingChain
    * @type boolean
     */
    this.breakBindingChain = false;
    this.numbers = new Array(10);
    this.data = new Array(10);
    this.controlsByStyle = new Array(ui.UIManager.stylesById.length);
    this.parentsByStyle = new Array(ui.UIManager.stylesById.length);
    this.styles = [];
    this.activeStyles = [];
    this.focusable = false;

    /**
    * The UI object's destination rectangle on screen.
    * @property dstRect
    * @type ui.Component_UIElementRectangle
     */
    this.dstRect = new ui.UIElementRectangle(this);

    /**
    * The UI object's margin. The margin defines an extra space around the UI object. 
    * The default is { left: 0, top: 0, right: 0, bottom: 0 }.
    * @property margin
    * @type ui.Space
     */
    this.margin = new ui.Space(0, 0, 0, 0);

    /**
    * The UI object's padding. The default is { left: 0, top: 0, right: 0, bottom: 0 }.
    * @property padding
    * @type ui.Space
     */
    this.padding = new ui.Space(0, 0, 0, 0);

    /**
    * The UI object's alignment.
    * @property alignment
    * @type ui.Alignment
     */
    this.alignment = 0;

    /**
    * Indicates if the UI object is visible on screen.
    * @property visible
    * @type boolean
     */
    this.visible = true;

    /**
    * Indicates if the UI object is enabled and responds to user actions.
    * @property enabled
    * @type boolean
     */
    this.enabled = true;

    /**
    * The UI object's origin.
    * @property origin
    * @type gs.Vector2
     */
    this.origin = new ui.UIElementPoint(this);

    /**
    * The UI object's offset.
    * @property offset
    * @type gs.Vector2
     */
    this.offset = new ui.UIElementPoint(this);

    /**
    * The UI object's opacity to control transparency. For example: 0 = Transparent, 255 = Opaque, 128 = Semi-Transparent.
    * @property opacity
    * @type number
     */
    this.opacity = 255;

    /**
    * The UI object's resize behavior.
    * @property resizable
    * @type boolean
     */
    this.resizable = false;

    /**
    * The UI object's anchor-point. For example: An anchor-point with 0,0 places the object with its top-left corner
    * at its position but with an 0.5, 0.5 anchor-point the object is placed with its center. An anchor-point of 1,1
    * places the object with its lower-right corner.
    * @property anchor
    * @type gs.Point
     */
    this.anchor = new gs.Point(0.0, 0.0);

    /**
    * The UI object's zoom-setting for x and y axis. The default value is
    * { x: 1.0, y: 1.0 }
    * @property zoom
    * @type gs.Point
     */
    this.zoom = new gs.Point(1.0, 1.0);

    /**
    * The UI object's color.
    * @property color
    * @type gs.Color
     */
    this.color = new Color(255, 255, 255, 0);
    this.tone = new Tone(0, 0, 0, 0);

    /**
    * The UI object's rotation-angle in degrees. The rotation center depends on the
    * anchor-point.
    * @property angle
    * @type number
     */
    this.angle = 0;

    /**
    * The UI object's mask for masking-effects.
    * @property mask
    * @type gs.Mask
     */
    this.mask = new gs.Mask();

    /**
    * An event-emitter to emit events.
    * @property events
    * @type gs.Component_EventEmitter
     */
    this.events = new gs.EventEmitter();

    /**
    * The update-behavior of the UI object. The default is ui.UpdateBehavior.NORMAL.
    * @property updateBehavior
    * @type ui.UpdateBehavior
     */
    this.updateBehavior = ui.UpdateBehavior.NORMAL;

    /**
    * @property image_
    * @type string
    * @protected
     */
    this.image_ = null;

    /**
    * The object's clip-rect for visual presentation.
    * @property clipRect_
    * @type gs.Rect
    * @protected
     */
    this.clipRect_ = null;

    /**
    * @property visible_
    * @type boolean
    * @protected
     */
    this.visible_ = true;
    this.addComponent(this.events);
  }


  /**
  * Restores the object from a data-bundle.
  *
  * @method restore
  * @param {Object} data - The data-bundle.
   */

  Object_UIElement.prototype.restore = function(data) {
    this.anchor = new gs.Point(data.anchor.x, data.anchor.y);
    this.offset = new gs.Point(data.offset.x, data.offset.y);
    this.dstRect.x = data.x;
    this.dstRect.y = data.y;
    this.opacity = data.opacity;
    this.zoom = new gs.Point(data.zoom.x, data.zoom.y);
    this.angle = data.angle;
    this.zIndex = data.zIndex;
    this.visible_ = data.visible;
    return this.rid = data.rid;
  };


  /**
  * Serializes the object into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Object_UIElement.prototype.toDataBundle = function() {
    return {
      rid: this.rid,
      x: this.dstRect.x,
      y: this.dstRect.y,
      opacity: this.opacity,
      zoom: this.zoom,
      angle: this.angle,
      anchor: {
        x: this.anchor.x,
        y: this.anchor.y
      },
      zIndex: this.zIndex,
      offset: {
        x: this.offset.x,
        y: this.offset.y
      },
      visible: this.visible_
    };
  };

  return Object_UIElement;

})(gs.Object_Base);

ui.Object_UIElement = Object_UIElement;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsZ0JBQUE7RUFBQTs7O0FBQU07OztFQU1GLGdCQUFDLENBQUEsU0FBRCxDQUFXLE9BQVgsRUFDSTtJQUFBLEdBQUEsRUFBSyxTQUFDLEtBQUQ7TUFDRCxJQUFHLEtBQUEsS0FBUyxJQUFDLENBQUEsTUFBYjtRQUNJLElBQUMsQ0FBQSxNQUFELEdBQVU7ZUFDVixJQUFDLENBQUEsV0FBRCxHQUFlLEtBRm5COztJQURDLENBQUw7SUFJQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBSkw7R0FESjs7RUFZQSxnQkFBQyxDQUFBLFNBQUQsQ0FBVyxTQUFYLEVBQ0k7SUFBQSxHQUFBLEVBQUssU0FBQyxPQUFEO01BQ0QsSUFBRyxPQUFBLEtBQVcsSUFBQyxDQUFBLFFBQWY7UUFDSSxJQUFDLENBQUEsUUFBRCxHQUFZO2VBQ1osSUFBQyxDQUFBLFdBQUQsR0FBZSxLQUZuQjs7SUFEQyxDQUFMO0lBSUEsR0FBQSxFQUFLLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSixDQUpMO0dBREo7O0VBWUEsZ0JBQUMsQ0FBQSxTQUFELENBQVcsVUFBWCxFQUNJO0lBQUEsR0FBQSxFQUFLLFNBQUMsUUFBRDtNQUNELElBQUcsUUFBQSxLQUFZLElBQUMsQ0FBQSxTQUFoQjtRQUNJLElBQUMsQ0FBQSxTQUFELEdBQWE7ZUFDYixJQUFDLENBQUEsV0FBRCxHQUFlLEtBRm5COztJQURDLENBQUw7SUFJQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBSkw7R0FESjs7RUFRQSxnQkFBQyxDQUFBLFNBQUQsQ0FBVyxTQUFYLEVBQ0k7SUFBQSxHQUFBLEVBQUssU0FBQyxDQUFEO01BQ0QsSUFBRyxDQUFBLEtBQUssSUFBQyxDQUFBLFFBQVQ7UUFDSSxJQUFDLENBQUEsUUFBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLFdBQUQsR0FBZTtlQUNm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SUFBQyxDQUFBLEtBTkw7TUFPSCxNQUFBLEVBQVE7UUFBRSxDQUFBLEVBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxDQUFiO1FBQWdCLENBQUEsRUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLENBQTNCO09BUEw7TUFRSCxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BUk47TUFTSCxNQUFBLEVBQVE7UUFBRSxDQUFBLEVBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxDQUFiO1FBQWdCLENBQUEsRUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLENBQTNCO09BVEw7TUFVSCxPQUFBLEVBQVMsSUFBQyxDQUFBLFFBVlA7O0VBREc7Ozs7R0E1UGEsRUFBRSxDQUFDOztBQTBRbEMsRUFBRSxDQUFDLGdCQUFILEdBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBPYmplY3RfVUlFbGVtZW50XG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBPYmplY3RfVUlFbGVtZW50IGV4dGVuZHMgZ3MuT2JqZWN0X0Jhc2VcbiAgICAjXG4gICAgIyBUaGUgVUkgb2JqZWN0J3MgaW1hZ2UgdXNlZCBmb3IgdmlzdWFsIHByZXNlbnRhdGlvbi5cbiAgICAjIEBwcm9wZXJ0eSBpbWFnZVxuICAgICMgQHR5cGUgc3RyaW5nXG4gICAgI1xuICAgIEBhY2Nlc3NvcnMgXCJpbWFnZVwiLCBcbiAgICAgICAgc2V0OiAoaW1hZ2UpIC0+XG4gICAgICAgICAgICBpZiBpbWFnZSAhPSBAaW1hZ2VfXG4gICAgICAgICAgICAgICAgQGltYWdlXyA9IGltYWdlXG4gICAgICAgICAgICAgICAgQG5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgIGdldDogLT4gQGltYWdlX1xuICAgICAgICBcbiAgICAjXG4gICAgIyBUaGUgVUkgb2JqZWN0J3MgaW1hZ2UgdXNlZCBmb3IgdmlzdWFsIHByZXNlbnRhdGlvbi5cbiAgICAjIEBwcm9wZXJ0eSBpbWFnZVxuICAgICMgQHR5cGUgc3RyaW5nXG4gICAgI1xuICAgIEBhY2Nlc3NvcnMgXCJvcGFjaXR5XCIsIFxuICAgICAgICBzZXQ6IChvcGFjaXR5KSAtPlxuICAgICAgICAgICAgaWYgb3BhY2l0eSAhPSBAb3BhY2l0eV9cbiAgICAgICAgICAgICAgICBAb3BhY2l0eV8gPSBvcGFjaXR5XG4gICAgICAgICAgICAgICAgQG5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgIGdldDogLT4gQG9wYWNpdHlfXG4gICAgICAgIFxuICAgICNcbiAgICAjIFRoZSBVSSBvYmplY3QncyBpbWFnZSB1c2VkIGZvciB2aXN1YWwgcHJlc2VudGF0aW9uLlxuICAgICMgQHByb3BlcnR5IGltYWdlXG4gICAgIyBAdHlwZSBzdHJpbmdcbiAgICAjXG4gICAgQGFjY2Vzc29ycyBcImNsaXBSZWN0XCIsIFxuICAgICAgICBzZXQ6IChjbGlwUmVjdCkgLT5cbiAgICAgICAgICAgIGlmIGNsaXBSZWN0ICE9IEBjbGlwUmVjdF9cbiAgICAgICAgICAgICAgICBAY2xpcFJlY3RfID0gY2xpcFJlY3RcbiAgICAgICAgICAgICAgICBAbmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgZ2V0OiAtPiBAY2xpcFJlY3RfXG4gICAgIFxuIFxuICAgIEBhY2Nlc3NvcnMgXCJ2aXNpYmxlXCIsIFxuICAgICAgICBzZXQ6ICh2KSAtPiBcbiAgICAgICAgICAgIGlmIHYgIT0gQHZpc2libGVfXG4gICAgICAgICAgICAgICAgQHZpc2libGVfID0gdlxuICAgICAgICAgICAgICAgIEBuZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgICAgIEBmdWxsUmVmcmVzaCgpXG4gICAgICAgICAgICBcbiAgICAgICAgZ2V0OiAtPiBAdmlzaWJsZV8gYW5kICghQHBhcmVudCBvciBAcGFyZW50LnZpc2libGUpXG4gICAgICAgIFxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIFRoZSBiYXNlIGNsYXNzIGZvciBhbGwgSW4tR2FtZSBVSSBvYmplY3RzLlxuICAgICpcbiAgICAqIEBtb2R1bGUgdWlcbiAgICAqIEBjbGFzcyBPYmplY3RfVUlFbGVtZW50XG4gICAgKiBAZXh0ZW5kcyBncy5PYmplY3RfQmFzZVxuICAgICogQG1lbWJlcm9mIHVpXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyMgICAgICAgIFxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICBAaWQgPSBcIlwiXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoYXQgVUkgb2JqZWN0IHdpbGwgYnJlYWsgdGhlIGJpbmRpbmctY2hhaW4uIElmIDxiPnRydWU8L2I+IHRoZSBVSSBvYmplY3RcbiAgICAgICAgKiB3aWxsIG5vdCBjaGFuZ2UgYW55IGJpbmRpbmctdGFyZ2V0cyBmb3IgdGhlIGN1cnJlbnQgYmluZGluZy1leGVjdXRpb24gcGVyaW9kLlxuICAgICAgICAqIEBwcm9wZXJ0eSBicmVha0JpbmRpbmdDaGFpblxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEBicmVha0JpbmRpbmdDaGFpbiA9IG5vXG4gICAgICAgIEBudW1iZXJzID0gbmV3IEFycmF5KDEwKVxuICAgICAgICBAZGF0YSA9IG5ldyBBcnJheSgxMClcbiAgICAgICAgQGNvbnRyb2xzQnlTdHlsZSA9IG5ldyBBcnJheSh1aS5VSU1hbmFnZXIuc3R5bGVzQnlJZC5sZW5ndGgpXG4gICAgICAgIEBwYXJlbnRzQnlTdHlsZSA9IG5ldyBBcnJheSh1aS5VSU1hbmFnZXIuc3R5bGVzQnlJZC5sZW5ndGgpXG4gICAgICAgIEBzdHlsZXMgPSBbXVxuICAgICAgICBAYWN0aXZlU3R5bGVzID0gW11cbiAgICAgICAgQGZvY3VzYWJsZSA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIGRlc3RpbmF0aW9uIHJlY3RhbmdsZSBvbiBzY3JlZW4uXG4gICAgICAgICogQHByb3BlcnR5IGRzdFJlY3RcbiAgICAgICAgKiBAdHlwZSB1aS5Db21wb25lbnRfVUlFbGVtZW50UmVjdGFuZ2xlXG4gICAgICAgICMjI1xuICAgICAgICBAZHN0UmVjdCA9IG5ldyB1aS5VSUVsZW1lbnRSZWN0YW5nbGUodGhpcylcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgVUkgb2JqZWN0J3MgbWFyZ2luLiBUaGUgbWFyZ2luIGRlZmluZXMgYW4gZXh0cmEgc3BhY2UgYXJvdW5kIHRoZSBVSSBvYmplY3QuIFxuICAgICAgICAqIFRoZSBkZWZhdWx0IGlzIHsgbGVmdDogMCwgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwIH0uXG4gICAgICAgICogQHByb3BlcnR5IG1hcmdpblxuICAgICAgICAqIEB0eXBlIHVpLlNwYWNlXG4gICAgICAgICMjI1xuICAgICAgICBAbWFyZ2luID0gbmV3IHVpLlNwYWNlKDAsIDAsIDAsIDApXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIHBhZGRpbmcuIFRoZSBkZWZhdWx0IGlzIHsgbGVmdDogMCwgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwIH0uXG4gICAgICAgICogQHByb3BlcnR5IHBhZGRpbmdcbiAgICAgICAgKiBAdHlwZSB1aS5TcGFjZVxuICAgICAgICAjIyNcbiAgICAgICAgQHBhZGRpbmcgPSBuZXcgdWkuU3BhY2UoMCwgMCwgMCwgMClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgVUkgb2JqZWN0J3MgYWxpZ25tZW50LlxuICAgICAgICAqIEBwcm9wZXJ0eSBhbGlnbm1lbnRcbiAgICAgICAgKiBAdHlwZSB1aS5BbGlnbm1lbnRcbiAgICAgICAgIyMjXG4gICAgICAgIEBhbGlnbm1lbnQgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBVSSBvYmplY3QgaXMgdmlzaWJsZSBvbiBzY3JlZW4uXG4gICAgICAgICogQHByb3BlcnR5IHZpc2libGVcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAdmlzaWJsZSA9IHllc1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgVUkgb2JqZWN0IGlzIGVuYWJsZWQgYW5kIHJlc3BvbmRzIHRvIHVzZXIgYWN0aW9ucy5cbiAgICAgICAgKiBAcHJvcGVydHkgZW5hYmxlZFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEBlbmFibGVkID0geWVzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIG9yaWdpbi5cbiAgICAgICAgKiBAcHJvcGVydHkgb3JpZ2luXG4gICAgICAgICogQHR5cGUgZ3MuVmVjdG9yMlxuICAgICAgICAjIyNcbiAgICAgICAgQG9yaWdpbiA9IG5ldyB1aS5VSUVsZW1lbnRQb2ludCh0aGlzKSAjeDogMCwgeTogMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBVSSBvYmplY3QncyBvZmZzZXQuXG4gICAgICAgICogQHByb3BlcnR5IG9mZnNldFxuICAgICAgICAqIEB0eXBlIGdzLlZlY3RvcjJcbiAgICAgICAgIyMjXG4gICAgICAgIEBvZmZzZXQgPSBuZXcgdWkuVUlFbGVtZW50UG9pbnQodGhpcykgI3g6IDAsIHk6IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgVUkgb2JqZWN0J3Mgb3BhY2l0eSB0byBjb250cm9sIHRyYW5zcGFyZW5jeS4gRm9yIGV4YW1wbGU6IDAgPSBUcmFuc3BhcmVudCwgMjU1ID0gT3BhcXVlLCAxMjggPSBTZW1pLVRyYW5zcGFyZW50LlxuICAgICAgICAqIEBwcm9wZXJ0eSBvcGFjaXR5XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAb3BhY2l0eSA9IDI1NVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBVSSBvYmplY3QncyByZXNpemUgYmVoYXZpb3IuXG4gICAgICAgICogQHByb3BlcnR5IHJlc2l6YWJsZVxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEByZXNpemFibGUgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBVSSBvYmplY3QncyBhbmNob3ItcG9pbnQuIEZvciBleGFtcGxlOiBBbiBhbmNob3ItcG9pbnQgd2l0aCAwLDAgcGxhY2VzIHRoZSBvYmplY3Qgd2l0aCBpdHMgdG9wLWxlZnQgY29ybmVyXG4gICAgICAgICogYXQgaXRzIHBvc2l0aW9uIGJ1dCB3aXRoIGFuIDAuNSwgMC41IGFuY2hvci1wb2ludCB0aGUgb2JqZWN0IGlzIHBsYWNlZCB3aXRoIGl0cyBjZW50ZXIuIEFuIGFuY2hvci1wb2ludCBvZiAxLDFcbiAgICAgICAgKiBwbGFjZXMgdGhlIG9iamVjdCB3aXRoIGl0cyBsb3dlci1yaWdodCBjb3JuZXIuXG4gICAgICAgICogQHByb3BlcnR5IGFuY2hvclxuICAgICAgICAqIEB0eXBlIGdzLlBvaW50XG4gICAgICAgICMjI1xuICAgICAgICBAYW5jaG9yID0gbmV3IGdzLlBvaW50KDAuMCwgMC4wKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBVSSBvYmplY3QncyB6b29tLXNldHRpbmcgZm9yIHggYW5kIHkgYXhpcy4gVGhlIGRlZmF1bHQgdmFsdWUgaXNcbiAgICAgICAgKiB7IHg6IDEuMCwgeTogMS4wIH1cbiAgICAgICAgKiBAcHJvcGVydHkgem9vbVxuICAgICAgICAqIEB0eXBlIGdzLlBvaW50XG4gICAgICAgICMjI1xuICAgICAgICBAem9vbSA9IG5ldyBncy5Qb2ludCgxLjAsIDEuMClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgVUkgb2JqZWN0J3MgY29sb3IuXG4gICAgICAgICogQHByb3BlcnR5IGNvbG9yXG4gICAgICAgICogQHR5cGUgZ3MuQ29sb3JcbiAgICAgICAgIyMjXG4gICAgICAgIEBjb2xvciA9IG5ldyBDb2xvcigyNTUsIDI1NSwgMjU1LCAwKVxuICAgICAgICBAdG9uZSA9IG5ldyBUb25lKDAsIDAsIDAsIDApXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIHJvdGF0aW9uLWFuZ2xlIGluIGRlZ3JlZXMuIFRoZSByb3RhdGlvbiBjZW50ZXIgZGVwZW5kcyBvbiB0aGVcbiAgICAgICAgKiBhbmNob3ItcG9pbnQuXG4gICAgICAgICogQHByb3BlcnR5IGFuZ2xlXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAYW5nbGUgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIG1hc2sgZm9yIG1hc2tpbmctZWZmZWN0cy5cbiAgICAgICAgKiBAcHJvcGVydHkgbWFza1xuICAgICAgICAqIEB0eXBlIGdzLk1hc2tcbiAgICAgICAgIyMjXG4gICAgICAgIEBtYXNrID0gbmV3IGdzLk1hc2soKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIGV2ZW50LWVtaXR0ZXIgdG8gZW1pdCBldmVudHMuXG4gICAgICAgICogQHByb3BlcnR5IGV2ZW50c1xuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudF9FdmVudEVtaXR0ZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBldmVudHMgPSBuZXcgZ3MuRXZlbnRFbWl0dGVyKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgdXBkYXRlLWJlaGF2aW9yIG9mIHRoZSBVSSBvYmplY3QuIFRoZSBkZWZhdWx0IGlzIHVpLlVwZGF0ZUJlaGF2aW9yLk5PUk1BTC5cbiAgICAgICAgKiBAcHJvcGVydHkgdXBkYXRlQmVoYXZpb3JcbiAgICAgICAgKiBAdHlwZSB1aS5VcGRhdGVCZWhhdmlvclxuICAgICAgICAjIyNcbiAgICAgICAgQHVwZGF0ZUJlaGF2aW9yID0gdWkuVXBkYXRlQmVoYXZpb3IuTk9STUFMXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGltYWdlX1xuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbWFnZV8gPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIGNsaXAtcmVjdCBmb3IgdmlzdWFsIHByZXNlbnRhdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgY2xpcFJlY3RfXG4gICAgICAgICogQHR5cGUgZ3MuUmVjdFxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBjbGlwUmVjdF8gPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IHZpc2libGVfXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEB2aXNpYmxlXyA9IHllc1xuICAgICAgICBcbiAgICAgICAgQGFkZENvbXBvbmVudChAZXZlbnRzKVxuICAgICAgIFxuICAgICBcbiAgICAjIyMqXG4gICAgKiBSZXN0b3JlcyB0aGUgb2JqZWN0IGZyb20gYSBkYXRhLWJ1bmRsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjIyAgIFxuICAgIHJlc3RvcmU6IChkYXRhKSAtPlxuICAgICAgICBAYW5jaG9yID0gbmV3IGdzLlBvaW50KGRhdGEuYW5jaG9yLngsIGRhdGEuYW5jaG9yLnkpXG4gICAgICAgIEBvZmZzZXQgPSBuZXcgZ3MuUG9pbnQoZGF0YS5vZmZzZXQueCwgZGF0YS5vZmZzZXQueSlcbiAgICAgICAgQGRzdFJlY3QueCA9IGRhdGEueFxuICAgICAgICBAZHN0UmVjdC55ID0gZGF0YS55XG4gICAgICAgIEBvcGFjaXR5ID0gZGF0YS5vcGFjaXR5XG4gICAgICAgIEB6b29tID0gbmV3IGdzLlBvaW50KGRhdGEuem9vbS54LCBkYXRhLnpvb20ueSlcbiAgICAgICAgQGFuZ2xlID0gZGF0YS5hbmdsZVxuICAgICAgICBAekluZGV4ID0gZGF0YS56SW5kZXhcbiAgICAgICAgQHZpc2libGVfID0gZGF0YS52aXNpYmxlXG4gICAgICAgIEByaWQgPSBkYXRhLnJpZFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXJpYWxpemVzIHRoZSBvYmplY3QgaW50byBhIGRhdGEtYnVuZGxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgdG9EYXRhQnVuZGxlXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBkYXRhLWJ1bmRsZS5cbiAgICAjIyMgICBcbiAgICB0b0RhdGFCdW5kbGU6IC0+IFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmlkOiBAcmlkLCBcbiAgICAgICAgICAgIHg6IEBkc3RSZWN0LngsIFxuICAgICAgICAgICAgeTogQGRzdFJlY3QueSxcbiAgICAgICAgICAgIG9wYWNpdHk6IEBvcGFjaXR5LFxuICAgICAgICAgICAgem9vbTogQHpvb20sXG4gICAgICAgICAgICBhbmdsZTogQGFuZ2xlLFxuICAgICAgICAgICAgYW5jaG9yOiB7IHg6IEBhbmNob3IueCwgeTogQGFuY2hvci55IH0sXG4gICAgICAgICAgICB6SW5kZXg6IEB6SW5kZXgsXG4gICAgICAgICAgICBvZmZzZXQ6IHsgeDogQG9mZnNldC54LCB5OiBAb2Zmc2V0LnkgfSxcbiAgICAgICAgICAgIHZpc2libGU6IEB2aXNpYmxlX1xuICAgICAgICB9XG4gICAgICAgIFxudWkuT2JqZWN0X1VJRWxlbWVudCA9IE9iamVjdF9VSUVsZW1lbnQiXX0=
//# sourceURL=Object_UIElement_11.js