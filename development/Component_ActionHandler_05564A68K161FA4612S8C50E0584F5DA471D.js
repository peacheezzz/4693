var Component_ActionHandler,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_ActionHandler = (function(superClass) {
  extend(Component_ActionHandler, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_ActionHandler.prototype.onDataBundleRestore = function(data, context) {
    return this.setupEventHandlers();
  };


  /**
  * An action-handler component allows a UI game object to execute
  * actions. An action can be a method-call of a component or of the scene which
  * always takes two parameters: Sender and Params. For more info about
  * UI actions, see help-file.
  * 
  * @module ui
  * @class Component_ActionHandler
  * @extends ui.Component_Handler
  * @memberof ui
  * @constructor
   */

  function Component_ActionHandler() {

    /**
    * @property initialized
    * @type boolean
    * @protected
     */
    this.initialized = false;

    /**
    * Counter for delayed/timed actions.
    * @property waitCounter
    * @type number
    * @protected
     */
    this.waitCounter = 0;

    /**
    * Indicates if the mouse/touch pointer is inside the UI object's bounds.
    * @property contains
    * @type boolean
    * @protected
     */
    this.containsPointer = false;
  }


  /**
  * Disposes the component.
  *
  * @method dispose
   */

  Component_ActionHandler.prototype.dispose = function() {
    Component_ActionHandler.__super__.dispose.apply(this, arguments);
    gs.GlobalEventManager.offByOwner("keyUp", this.object);
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    return gs.GlobalEventManager.offByOwner("mouseMoved", this.object);
  };


  /**
  * Adds event-handler for mouse/touch events to update the component only if 
  * a user-action happened.
  *
  * @method setupEventHandlers
   */

  Component_ActionHandler.prototype.setupEventHandlers = function() {
    var ref;
    gs.GlobalEventManager.offByOwner("keyUp", this.object);
    gs.GlobalEventManager.offByOwner("mouseUp", this.object);
    gs.GlobalEventManager.offByOwner("mouseMoved", this.object);
    if (this.object.focusable) {
      gs.GlobalEventManager.on("keyUp", ((function(_this) {
        return function(e) {
          if (!_this.object.canReceiveInput()) {
            return;
          }
          if (Input.release(Input.KEY_RETURN) && _this.object.ui.focused) {
            _this.object.needsUpdate = true;
            return _this.executeActions();
          }
        };
      })(this)), null, this.object);
    }
    gs.GlobalEventManager.on("mouseUp", ((function(_this) {
      return function(e) {
        var action, actions, contains, exec, i, len;
        if (!_this.object.canReceiveInput()) {
          return;
        }
        contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, Input.Mouse.x - _this.object.origin.x, Input.Mouse.y - _this.object.origin.y);
        if (contains) {
          exec = false;
          actions = actions || _this.object.actions;
          if (actions != null) {
            for (i = 0, len = actions.length; i < len; i++) {
              action = actions[i];
              exec = _this.checkAction(action) && !_this.checkActionWait(action);
              if (exec) {
                break;
              }
            }
          }
          if (exec) {
            e.breakChain = true;
            _this.executeActions();
          }
          return _this.object.needsUpdate = true;
        }
      };
    })(this)), null, this.object);
    if ((ref = this.object.actions) != null ? ref.first(function(a) {
      return a && (a.event === "onMouseEnter" || a.event === "onMouseLeave" || a.event === "onMouseHover");
    }) : void 0) {
      gs.GlobalEventManager.on("mouseMoved", ((function(_this) {
        return function(e) {
          var contains;
          if (!_this.object.canReceiveInput()) {
            return;
          }
          contains = Rect.contains(_this.object.dstRect.x, _this.object.dstRect.y, _this.object.dstRect.width, _this.object.dstRect.height, Input.Mouse.x - _this.object.origin.x, Input.Mouse.y - _this.object.origin.y);
          if (_this.containsPointer !== contains) {
            _this.containsPointer = contains;
            return _this.object.needsUpdate = true;
          }
        };
      })(this)), null, this.object);
    }
    return this.object.events.on("action", (function(_this) {
      return function(e) {
        if (e.actions || e.action) {
          return _this.executeActions(e.actions != null ? e.actions : [e.action]);
        }
      };
    })(this));
  };


  /**
  * Sets up associated actions. Each action is validated and specific default values for the action-target
  * and other options are set if not specified.
  *
  * @method setupActions
   */

  Component_ActionHandler.prototype.setupActions = function() {
    var action, component, i, len, ref, results, target, targets;
    if (this.object.actions != null) {
      ref = this.object.actions;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        action = ref[i];
        if (!action) {
          continue;
        }
        if (!action.event) {
          action.event = "onAction";
        }
        if (action.wait != null) {
          continue;
        }
        if (action.target == null) {
          action.target = this.object.controller;
        }
        if (typeof action.target === "string") {
          if (action.target.contains(".")) {
            action.target = ui.Component_FormulaHandler.fieldValue(this.object, action.target);
          }
          targets = action.target.split(".");
          target = gs.ObjectManager.current.objectById(targets[0]);
          if (target != null) {
            component = target.findComponentById(targets[1]);
            if (component == null) {
              target = target.components.where(function(v) {
                return typeof v[action.name] === "function";
              }).first();
            } else {
              target = component;
            }
          } else {
            target = this.object;
          }
          action.target = target;
        }
        if (action.condition != null) {
          action.conditions = [action.condition];
          results.push(delete action.condition);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };


  /**
  * Initializes the action-handler.
  * 
  * @method setup
   */

  Component_ActionHandler.prototype.setup = function() {
    this.initialized = true;
    this.setupEventHandlers();
    return this.setupActions();
  };


  /**
  * Updates the action-handler.
  * 
  * @method update
   */

  Component_ActionHandler.prototype.update = function() {};

  Component_ActionHandler.prototype.checkAction = function(action) {
    return ((action != null ? action.event : void 0) || (action != null ? action.events : void 0)) && this.checkObject(action);
  };

  Component_ActionHandler.prototype.checkActionWait = function(action) {
    var result;
    result = false;
    if ((action.wait != null) && action.wait > 0) {
      this.waitCounter = action.wait;
      action.wait = 0;
      result = true;
    }
    return result;
  };

  Component_ActionHandler.prototype.updateActionTarget = function(action) {
    var component, target, targets;
    if (action.target == null) {
      action.target = this.object.controller;
    }
    if (action.target.exec || typeof action.target === "string") {
      if (action.target.exec) {
        action.target = ui.Component_FormulaHandler.fieldValue(this.object, action.target);
      }
      targets = action.target.split(".");
      target = gs.ObjectManager.current.objectById(targets[0]);
      if (target != null) {
        component = target.findComponentById(targets[1]);
        if (component == null) {
          target = target.components.where(function(v) {
            return typeof v[action.name] === "function";
          }).first();
        } else {
          target = component;
        }
      } else {
        target = this.object;
      }
      return action.target = target;
    }
  };

  Component_ActionHandler.prototype.canExecuteActions = function() {
    return this.waitCounter <= 0 && this.object.ui.enabled && this.object.visible;
  };


  /**
  * Executes the specified actions. A single action is only executed if
  * all assigned events and conditions are true.
  * 
  * @method executeActions
  * @return If <b>true</b> there was at least one action executed. Otherwise <b>false</b>
   */

  Component_ActionHandler.prototype.executeActions = function(actions) {
    var action, i, len, result;
    if (!this.canExecuteActions()) {
      return;
    }
    result = false;
    actions = actions || this.object.actions;
    if (actions != null) {
      for (i = 0, len = actions.length; i < len; i++) {
        action = actions[i];
        if (!this.checkAction(action)) {
          continue;
        }
        if (this.checkActionWait(action)) {
          break;
        }
        this.updateActionTarget(action);
        this.executeAction(action);
        result = true;
      }
    }
    return result;
  };


  /**
  * Executes the specified action if all assigned events and conditions
  * are true.
  * 
  * @method executeAction
  * @param {Object} action The action to execute.
   */

  Component_ActionHandler.prototype.executeAction = function(action) {
    var name, target;
    target = action.target || this.object.target;
    if (target != null) {
      if (action.sound) {
        AudioManager.playSound(action.sound);
      }
      return typeof target[name = action.name] === "function" ? target[name](this.object, action.params) : void 0;
    }
  };

  return Component_ActionHandler;

})(ui.Component_Handler);

ui.Component_ActionHandler = Component_ActionHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsdUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7O29DQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7V0FDakIsSUFBQyxDQUFBLGtCQUFELENBQUE7RUFEaUI7OztBQUdyQjs7Ozs7Ozs7Ozs7OztFQVlhLGlDQUFBOztBQUNUOzs7OztJQUtBLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBRWY7Ozs7OztJQU1BLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBRWY7Ozs7OztJQU1BLElBQUMsQ0FBQSxlQUFELEdBQW1CO0VBdEJWOzs7QUF5QmI7Ozs7OztvQ0FLQSxPQUFBLEdBQVMsU0FBQTtJQUNMLHNEQUFBLFNBQUE7SUFFQSxFQUFFLENBQUMsa0JBQWtCLENBQUMsVUFBdEIsQ0FBaUMsT0FBakMsRUFBMEMsSUFBQyxDQUFBLE1BQTNDO0lBQ0EsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFVBQXRCLENBQWlDLFNBQWpDLEVBQTRDLElBQUMsQ0FBQSxNQUE3QztXQUNBLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUF0QixDQUFpQyxZQUFqQyxFQUErQyxJQUFDLENBQUEsTUFBaEQ7RUFMSzs7O0FBUVQ7Ozs7Ozs7b0NBTUEsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFVBQXRCLENBQWlDLE9BQWpDLEVBQTBDLElBQUMsQ0FBQSxNQUEzQztJQUNBLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUF0QixDQUFpQyxTQUFqQyxFQUE0QyxJQUFDLENBQUEsTUFBN0M7SUFDQSxFQUFFLENBQUMsa0JBQWtCLENBQUMsVUFBdEIsQ0FBaUMsWUFBakMsRUFBK0MsSUFBQyxDQUFBLE1BQWhEO0lBR0EsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVg7TUFDSSxFQUFFLENBQUMsa0JBQWtCLENB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TUFBTSxDQUFDO0lBRWxDLElBQUcsY0FBSDtNQUNJLElBQXdDLE1BQU0sQ0FBQyxLQUEvQztRQUFBLFlBQVksQ0FBQyxTQUFiLENBQXVCLE1BQU0sQ0FBQyxLQUE5QixFQUFBOztnRUFDQSxhQUFxQixJQUFDLENBQUEsUUFBUSxNQUFNLENBQUMsaUJBRnpDOztFQUhXOzs7O0dBdk9tQixFQUFFLENBQUM7O0FBOE96QyxFQUFFLENBQUMsdUJBQUgsR0FBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9BY3Rpb25IYW5kbGVyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfQWN0aW9uSGFuZGxlciBleHRlbmRzIHVpLkNvbXBvbmVudF9IYW5kbGVyXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKiBcbiAgICAqIEBtZXRob2Qgb25EYXRhQnVuZGxlUmVzdG9yZS5cbiAgICAqIEBwYXJhbSBPYmplY3QgZGF0YSAtIFRoZSBkYXRhLWJ1bmRsZVxuICAgICogQHBhcmFtIGdzLk9iamVjdENvZGVjQ29udGV4dCBjb250ZXh0IC0gVGhlIGNvZGVjLWNvbnRleHQuXG4gICAgIyMjXG4gICAgb25EYXRhQnVuZGxlUmVzdG9yZTogKGRhdGEsIGNvbnRleHQpIC0+XG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBbiBhY3Rpb24taGFuZGxlciBjb21wb25lbnQgYWxsb3dzIGEgVUkgZ2FtZSBvYmplY3QgdG8gZXhlY3V0ZVxuICAgICogYWN0aW9ucy4gQW4gYWN0aW9uIGNhbiBiZSBhIG1ldGhvZC1jYWxsIG9mIGEgY29tcG9uZW50IG9yIG9mIHRoZSBzY2VuZSB3aGljaFxuICAgICogYWx3YXlzIHRha2VzIHR3byBwYXJhbWV0ZXJzOiBTZW5kZXIgYW5kIFBhcmFtcy4gRm9yIG1vcmUgaW5mbyBhYm91dFxuICAgICogVUkgYWN0aW9ucywgc2VlIGhlbHAtZmlsZS5cbiAgICAqIFxuICAgICogQG1vZHVsZSB1aVxuICAgICogQGNsYXNzIENvbXBvbmVudF9BY3Rpb25IYW5kbGVyXG4gICAgKiBAZXh0ZW5kcyB1aS5Db21wb25lbnRfSGFuZGxlclxuICAgICogQG1lbWJlcm9mIHVpXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBpbml0aWFsaXplZFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAaW5pdGlhbGl6ZWQgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENvdW50ZXIgZm9yIGRlbGF5ZWQvdGltZWQgYWN0aW9ucy5cbiAgICAgICAgKiBAcHJvcGVydHkgd2FpdENvdW50ZXJcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAd2FpdENvdW50ZXIgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBtb3VzZS90b3VjaCBwb2ludGVyIGlzIGluc2lkZSB0aGUgVUkgb2JqZWN0J3MgYm91bmRzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb250YWluc1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAY29udGFpbnNQb2ludGVyID0gbm9cbiAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyB0aGUgY29tcG9uZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjI1xuICAgIGRpc3Bvc2U6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleVVwXCIsIEBvYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCBAb2JqZWN0KVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlTW92ZWRcIiwgQG9iamVjdClcbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBldmVudC1oYW5kbGVyIGZvciBtb3VzZS90b3VjaCBldmVudHMgdG8gdXBkYXRlIHRoZSBjb21wb25lbnQgb25seSBpZiBcbiAgICAqIGEgdXNlci1hY3Rpb24gaGFwcGVuZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEV2ZW50SGFuZGxlcnNcbiAgICAjIyMgXG4gICAgc2V0dXBFdmVudEhhbmRsZXJzOiAtPlxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcImtleVVwXCIsIEBvYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwibW91c2VVcFwiLCBAb2JqZWN0KVxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub2ZmQnlPd25lcihcIm1vdXNlTW92ZWRcIiwgQG9iamVjdClcbiAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QuZm9jdXNhYmxlXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJrZXlVcFwiLCAoKGUpID0+IFxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAhQG9iamVjdC5jYW5SZWNlaXZlSW5wdXQoKVxuICAgICAgICAgICAgICAgIGlmIElucHV0LnJlbGVhc2UoSW5wdXQuS0VZX1JFVFVSTikgYW5kIEBvYmplY3QudWkuZm9jdXNlZFxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0Lm5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgICAgICAgICAgICAgIEBleGVjdXRlQWN0aW9ucygpXG4gICAgICAgICAgICApLCBudWxsLCBAb2JqZWN0XG4gICAgICAgIFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJtb3VzZVVwXCIsICgoZSkgPT4gXG4gICAgICAgICAgICByZXR1cm4gaWYgIUBvYmplY3QuY2FuUmVjZWl2ZUlucHV0KClcbiAgICAgICAgICAgIGNvbnRhaW5zID0gUmVjdC5jb250YWlucyhAb2JqZWN0LmRzdFJlY3QueCwgQG9iamVjdC5kc3RSZWN0LnksIFxuICAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZHN0UmVjdC53aWR0aCwgQG9iamVjdC5kc3RSZWN0LmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICBJbnB1dC5Nb3VzZS54IC0gQG9iamVjdC5vcmlnaW4ueCwgSW5wdXQuTW91c2UueSAtIEBvYmplY3Qub3JpZ2luLnkpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNvbnRhaW5zXG4gICAgICAgICAgICAgICAgZXhlYyA9IG5vXG4gICAgICAgICAgICAgICAgYWN0aW9ucyA9IGFjdGlvbnMgfHwgQG9iamVjdC5hY3Rpb25zXG4gICAgICAgICAgICAgICAgaWYgYWN0aW9ucz9cbiAgICAgICAgICAgICAgICAgICAgZm9yIGFjdGlvbiBpbiBhY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjID0gQGNoZWNrQWN0aW9uKGFjdGlvbikgYW5kICFAY2hlY2tBY3Rpb25XYWl0KGFjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIGlmIGV4ZWNcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGV4ZWNcbiAgICAgICAgICAgICAgICAgICAgZS5icmVha0NoYWluID0geWVzXG4gICAgICAgICAgICAgICAgICAgIEBleGVjdXRlQWN0aW9ucygpXG4gICAgICAgICAgICAgICAgQG9iamVjdC5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICApLCBudWxsLCBAb2JqZWN0XG4gICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBvYmplY3QuYWN0aW9ucz8uZmlyc3QoKGEpIC0+IGEgYW5kIChhLmV2ZW50ID09IFwib25Nb3VzZUVudGVyXCIgb3IgYS5ldmVudCA9PSBcIm9uTW91c2VMZWF2ZVwiIG9yIGEuZXZlbnQgPT0gXCJvbk1vdXNlSG92ZXJcIikpXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJtb3VzZU1vdmVkXCIsICgoZSkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgIUBvYmplY3QuY2FuUmVjZWl2ZUlucHV0KClcbiAgICAgICAgICAgICAgICBjb250YWlucyA9IFJlY3QuY29udGFpbnMoQG9iamVjdC5kc3RSZWN0LngsIEBvYmplY3QuZHN0UmVjdC55LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3Qud2lkdGgsIEBvYmplY3QuZHN0UmVjdC5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgSW5wdXQuTW91c2UueCAtIEBvYmplY3Qub3JpZ2luLngsIElucHV0Lk1vdXNlLnkgLSBAb2JqZWN0Lm9yaWdpbi55KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgQGNvbnRhaW5zUG9pbnRlciAhPSBjb250YWluc1xuICAgICAgICAgICAgICAgICAgICBAY29udGFpbnNQb2ludGVyID0gY29udGFpbnNcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG51bGwsIEBvYmplY3RcbiAgICAgICAgICAgIFxuICAgICAgICBAb2JqZWN0LmV2ZW50cy5vbiBcImFjdGlvblwiLCAoZSkgPT5cbiAgICAgICAgICAgIGlmIGUuYWN0aW9ucyBvciBlLmFjdGlvblxuICAgICAgICAgICAgICAgIEBleGVjdXRlQWN0aW9ucyhpZiBlLmFjdGlvbnM/IHRoZW4gZS5hY3Rpb25zIGVsc2UgW2UuYWN0aW9uXSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBhc3NvY2lhdGVkIGFjdGlvbnMuIEVhY2ggYWN0aW9uIGlzIHZhbGlkYXRlZCBhbmQgc3BlY2lmaWMgZGVmYXVsdCB2YWx1ZXMgZm9yIHRoZSBhY3Rpb24tdGFyZ2V0XG4gICAgKiBhbmQgb3RoZXIgb3B0aW9ucyBhcmUgc2V0IGlmIG5vdCBzcGVjaWZpZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEFjdGlvbnNcbiAgICAjIyMgICAgICAgIFxuICAgIHNldHVwQWN0aW9uczogLT5cbiAgICAgICAgaWYgQG9iamVjdC5hY3Rpb25zP1xuICAgICAgICAgICAgZm9yIGFjdGlvbiBpbiBAb2JqZWN0LmFjdGlvbnNcbiAgICAgICAgICAgICAgICBjb250aW51ZSB1bmxlc3MgYWN0aW9uXG4gICAgICAgICAgICAgICAgaWYgbm90IGFjdGlvbi5ldmVudCB0aGVuIGFjdGlvbi5ldmVudCA9IFwib25BY3Rpb25cIlxuICAgICAgICAgICAgICAgIGlmIGFjdGlvbi53YWl0PyB0aGVuIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgaWYgbm90IGFjdGlvbi50YXJnZXQ/IHRoZW4gYWN0aW9uLnRhcmdldCA9IEBvYmplY3QuY29udHJvbGxlclxuICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBhY3Rpb24udGFyZ2V0ID09IFwic3RyaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgYWN0aW9uLnRhcmdldC5jb250YWlucyhcIi5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbi50YXJnZXQgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShAb2JqZWN0LCBhY3Rpb24udGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRzID0gYWN0aW9uLnRhcmdldC5zcGxpdChcIi5cIilcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Lm9iamVjdEJ5SWQodGFyZ2V0c1swXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgdGFyZ2V0P1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50ID0gdGFyZ2V0LmZpbmRDb21wb25lbnRCeUlkKHRhcmdldHNbMV0pXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgY29tcG9uZW50P1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5jb21wb25lbnRzLndoZXJlKCh2KSAtPiB0eXBlb2YgdlthY3Rpb24ubmFtZV0gPT0gXCJmdW5jdGlvblwiKS5maXJzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gY29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IEBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnRhcmdldCA9IHRhcmdldFxuICAgICAgICAgICAgICAgIGlmIGFjdGlvbi5jb25kaXRpb24/XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbi5jb25kaXRpb25zID0gW2FjdGlvbi5jb25kaXRpb25dXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhY3Rpb24uY29uZGl0aW9uXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIGFjdGlvbi1oYW5kbGVyLlxuICAgICogXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgIyMjXG4gICAgc2V0dXA6IC0+XG4gICAgICAgIEBpbml0aWFsaXplZCA9IHllc1xuICAgICAgICBcbiAgICAgICAgQHNldHVwRXZlbnRIYW5kbGVycygpXG4gICAgICAgIEBzZXR1cEFjdGlvbnMoKSAgICBcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgYWN0aW9uLWhhbmRsZXIuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuXG4gICAgICBcbiAgICBjaGVja0FjdGlvbjogKGFjdGlvbikgLT4gKGFjdGlvbj8uZXZlbnQgb3IgYWN0aW9uPy5ldmVudHMpIGFuZCBAY2hlY2tPYmplY3QoYWN0aW9uKVxuICAgIGNoZWNrQWN0aW9uV2FpdDogKGFjdGlvbikgLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cbiAgICAgICAgXG4gICAgICAgIGlmIGFjdGlvbi53YWl0PyBhbmQgYWN0aW9uLndhaXQgPiAwXG4gICAgICAgICAgICBAd2FpdENvdW50ZXIgPSBhY3Rpb24ud2FpdFxuICAgICAgICAgICAgYWN0aW9uLndhaXQgPSAwXG4gICAgICAgICAgICByZXN1bHQgPSB5ZXNcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgdXBkYXRlQWN0aW9uVGFyZ2V0OiAoYWN0aW9uKSAtPlxuICAgICAgICBpZiBub3QgYWN0aW9uLnRhcmdldD8gdGhlbiBhY3Rpb24udGFyZ2V0ID0gQG9iamVjdC5jb250cm9sbGVyXG4gICAgICAgIGlmIGFjdGlvbi50YXJnZXQuZXhlYyBvciB0eXBlb2YgYWN0aW9uLnRhcmdldCA9PSBcInN0cmluZ1wiXG4gICAgICAgICAgICBpZiBhY3Rpb24udGFyZ2V0LmV4ZWNcbiAgICAgICAgICAgICAgIGFjdGlvbi50YXJnZXQgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShAb2JqZWN0LCBhY3Rpb24udGFyZ2V0KVxuICAgICAgICAgICAgdGFyZ2V0cyA9IGFjdGlvbi50YXJnZXQuc3BsaXQoXCIuXCIpXG4gICAgICAgICAgICB0YXJnZXQgPSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQub2JqZWN0QnlJZCh0YXJnZXRzWzBdKVxuICAgICAgICAgICAgaWYgdGFyZ2V0P1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IHRhcmdldC5maW5kQ29tcG9uZW50QnlJZCh0YXJnZXRzWzFdKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBjb21wb25lbnQ/XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5jb21wb25lbnRzLndoZXJlKCh2KSAtPiB0eXBlb2YgdlthY3Rpb24ubmFtZV0gPT0gXCJmdW5jdGlvblwiKS5maXJzdCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBjb21wb25lbnRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBAb2JqZWN0XG4gICAgICAgICAgICBhY3Rpb24udGFyZ2V0ID0gdGFyZ2V0XG4gICAgXG4gICAgY2FuRXhlY3V0ZUFjdGlvbnM6IC0+IEB3YWl0Q291bnRlciA8PSAwIGFuZCBAb2JqZWN0LnVpLmVuYWJsZWQgYW5kIEBvYmplY3QudmlzaWJsZSAgICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIHRoZSBzcGVjaWZpZWQgYWN0aW9ucy4gQSBzaW5nbGUgYWN0aW9uIGlzIG9ubHkgZXhlY3V0ZWQgaWZcbiAgICAqIGFsbCBhc3NpZ25lZCBldmVudHMgYW5kIGNvbmRpdGlvbnMgYXJlIHRydWUuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgZXhlY3V0ZUFjdGlvbnNcbiAgICAqIEByZXR1cm4gSWYgPGI+dHJ1ZTwvYj4gdGhlcmUgd2FzIGF0IGxlYXN0IG9uZSBhY3Rpb24gZXhlY3V0ZWQuIE90aGVyd2lzZSA8Yj5mYWxzZTwvYj5cbiAgICAjIyNcbiAgICBleGVjdXRlQWN0aW9uczogKGFjdGlvbnMpIC0+XG4gICAgICAgIHJldHVybiBpZiBub3QgQGNhbkV4ZWN1dGVBY3Rpb25zKClcbiAgICAgICAgXG4gICAgICAgIHJlc3VsdCA9IG5vXG4gICAgICAgIGFjdGlvbnMgPSBhY3Rpb25zIHx8IEBvYmplY3QuYWN0aW9uc1xuICAgICAgICBpZiBhY3Rpb25zP1xuICAgICAgICAgICAgZm9yIGFjdGlvbiBpbiBhY3Rpb25zXG4gICAgICAgICAgICAgICAgY29udGludWUgaWYgbm90IEBjaGVja0FjdGlvbihhY3Rpb24pXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgQGNoZWNrQWN0aW9uV2FpdChhY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB1cGRhdGVBY3Rpb25UYXJnZXQoYWN0aW9uKVxuICAgICAgICAgICAgICAgIEBleGVjdXRlQWN0aW9uKGFjdGlvbilcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB5ZXNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIFxuICAgICMjIypcbiAgICAqIEV4ZWN1dGVzIHRoZSBzcGVjaWZpZWQgYWN0aW9uIGlmIGFsbCBhc3NpZ25lZCBldmVudHMgYW5kIGNvbmRpdGlvbnNcbiAgICAqIGFyZSB0cnVlLlxuICAgICogXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVBY3Rpb25cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gVGhlIGFjdGlvbiB0byBleGVjdXRlLlxuICAgICMjIyAgICAgICAgICAgIFxuICAgIGV4ZWN1dGVBY3Rpb246IChhY3Rpb24pIC0+XG4gICAgICAgIHRhcmdldCA9IGFjdGlvbi50YXJnZXQgfHwgQG9iamVjdC50YXJnZXRcbiAgICAgICAgXG4gICAgICAgIGlmIHRhcmdldD8gXG4gICAgICAgICAgICBBdWRpb01hbmFnZXIucGxheVNvdW5kKGFjdGlvbi5zb3VuZCkgaWYgYWN0aW9uLnNvdW5kXG4gICAgICAgICAgICB0YXJnZXRbYWN0aW9uLm5hbWVdPyhAb2JqZWN0LCBhY3Rpb24ucGFyYW1zKVxuICAgICAgICAgICAgXG51aS5Db21wb25lbnRfQWN0aW9uSGFuZGxlciA9IENvbXBvbmVudF9BY3Rpb25IYW5kbGVyIl19
//# sourceURL=Component_ActionHandler_129.js