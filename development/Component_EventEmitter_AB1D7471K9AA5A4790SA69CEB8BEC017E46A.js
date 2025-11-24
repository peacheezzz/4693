var Component_EventEmitter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_EventEmitter = (function(superClass) {
  extend(Component_EventEmitter, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  *
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_EventEmitter.prototype.onDataBundleRestore = function(data, context) {
    var handler, handlers, i, j, k, l, list, ref;
    for (k in this.handlers) {
      list = this.handlers[k];
      for (i = l = 0, ref = list.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        handlers = list[i];
        j = 0;
        while (j < handlers.length) {
          handler = handlers[j];
          if (!handler.handler || !handler.handler.$vnm_cb) {
            handlers.splice(j, 1);
          } else {
            j++;
          }
        }
      }
    }
    return null;
  };


  /**
  * A component which allow a game object to fire events and manage a list
  * of observers.
  *
  * @module gs
  * @class Component_EventEmitter
  * @extends gs.Component
  * @memberof gs
   */

  function Component_EventEmitter() {
    Component_EventEmitter.__super__.constructor.apply(this, arguments);

    /**
    * List of registered observers.
    *
    * @property handlers
    * @type Object
    * @private
     */
    this.handlers = {};

    /**
    * @property defaultData
    * @type Object
    * @private
     */
    this.defaultData = {};

    /**
    * @property chainInfo
    * @type Object
    * @private
     */
    this.chainInfo = {};

    /**
    * @property needsSort
    * @type boolean
    * @private
     */
    this.needsSort = {};

    /**
    * @property markedForRemove
    * @type Object[]
    * @private
     */
    this.markedForRemove = [];

    /**
    * @property isEmitting
    * @type number
    * @private
     */
    this.isEmitting = 0;
  }


  /**
  * Clears the event emitter by removing all handlers/listeners.
  *
  * @method clear
   */

  Component_EventEmitter.prototype.clear = function() {
    this.needsSort = {};
    this.handlers = {};
    return this.defaultData = {};
  };


  /**
  * Clears the event emitter by removing all handlers/listeners except those
  * which are associated with an owner in the specified owners array.
  *
  * @method clearExcept
  * @param {Object[]} owners - An array of owner objects. Only handlers/listeners which are not
  * associated with that owners are removed.
   */

  Component_EventEmitter.prototype.clearExcept = function(owners) {
    var event, events, handlerList, handlers, i, l, len, results;
    this.needsSort = {};
    this.defaultData = {};
    events = Object.keys(this.handlers);
    results = [];
    for (l = 0, len = events.length; l < len; l++) {
      event = events[l];
      handlers = this.handlers[event];
      results.push((function() {
        var len1, m, results1;
        results1 = [];
        for (i = m = 0, len1 = handlers.length; m < len1; i = ++m) {
          handlerList = handlers[i];
          handlerList = handlerList.filter(function(h) {
            return owners.indexOf(h.owner) !== 1;
          });
          results1.push(handlers[i] = handlerList);
        }
        return results1;
      })());
    }
    return results;
  };


  /**
  * Adds a new observer/listener for a specified event.
  *
  * @method on
  * @param {string} eventName - The event name.
  * @param {function} handler - The handler-function called when the event is fired.
  * @param {Object} [data={}] - An optional info-object passed to the handler-function.
  * @param {Object} [owner=null] - An optional owner-object associated with the observer/listener.
  * @param {number} priority - An optional priority level. An observer/listener with a higher level will receive the event before observers/listeners with a lower level.
  * @return {gs.EventObserver} - The added observer-object.
   */

  Component_EventEmitter.prototype.on = function(eventName, handler, data, owner, priority) {
    var handlerObject;
    priority = priority || 0;
    this.needsSort[eventName] = true;
    if (this.handlers[eventName] == null) {
      this.handlers[eventName] = [];
    }
    if (!this.handlers[eventName][priority]) {
      this.handlers[eventName][priority] = [];
    }
    handlerObject = {
      handler: handler,
      once: false,
      data: data,
      owner: owner,
      eventName: eventName,
      priority: priority
    };
    this.handlers[eventName][priority].push(handlerObject);
    return handlerObject;
  };


  /**
  * Adds a new observer/listener for a specified event and removes it
  * after the even has been emitted once.
  *
  * @method once
  * @param {string} eventName - The event name.
  * @param {function} handler - The handler-function called when the event is fired.
  * @param {Object} [data={}] - An optional info-object passed to the handler-function.
  * @param {Object} [owner=null] - An optional owner-object associated with the observer/listener.
  * @param {number} priority - An optional priority level. An observer/listener with a higher level will receive the event before observers/listeners with a lower level.
  * @return {gs.EventObserver} - The added observer-object.
   */

  Component_EventEmitter.prototype.once = function(eventName, handler, data, owner, priority) {
    var handlerObject;
    handlerObject = this.on(eventName, handler, data, owner, priority);
    handlerObject.once = true;
    return handlerObject;
  };


  /**
  * Removes an observer/listener from a specified event. If handler parameter
  * is null, all observers for the specified event are removed.
  *
  * @method off
  * @param {string} eventName - The event name.
  * @param {gs.EventObserver} [handler=null] - The observer-object to remove.
  * If null, all observers for the specified event are removed.
   */

  Component_EventEmitter.prototype.off = function(eventName, handler) {
    var ref, ref1;
    if (this.isEmitting > 0 && handler) {
      return this.markedForRemove.push(handler);
    } else if (handler != null) {
      return (ref = this.handlers[eventName]) != null ? (ref1 = ref[handler.priority]) != null ? ref1.remove(handler) : void 0 : void 0;
    } else {
      return this.handlers[eventName] = [];
    }
  };


  /**
  * Removes all observers/listeners from an event which are belonging to the specified
  * owner.
  *
  * @method offByOwner
  * @param {string} eventName - The event name.
  * @param {Object} owner - The owner.
  * @return {number} Count of removed observers/listeners.
   */

  Component_EventEmitter.prototype.offByOwner = function(eventName, owner) {
    var handler, handlerList, handlers, l, len, len1, m, ref, ref1, results, results1;
    if (this.handlers[eventName]) {
      if (this.isEmitting > 0) {
        ref = this.handlers[eventName];
        results = [];
        for (l = 0, len = ref.length; l < len; l++) {
          handlerList = ref[l];
          handlers = handlerList != null ? handlerList.where(function(x) {
            return x.owner === owner;
          }) : void 0;
          results.push((function() {
            var len1, m, results1;
            results1 = [];
            for (m = 0, len1 = handlers.length; m < len1; m++) {
              handler = handlers[m];
              results1.push(this.markedForRemove.push(handler));
            }
            return results1;
          }).call(this));
        }
        return results;
      } else {
        ref1 = this.handlers[eventName];
        results1 = [];
        for (m = 0, len1 = ref1.length; m < len1; m++) {
          handlerList = ref1[m];
          results1.push(handlerList.removeAll(function(x) {
            return x.owner === owner;
          }));
        }
        return results1;
      }
    }
  };


  /**
  * Emits the specified event. All observers/listeners registered for the
  * specified event are informed.
  *
  * @method emit
  * @param {string} eventName - The name of the event to fire.
  * @param {Object} [sender=null] - The sender of the event.
  * @param {Object} [data={}] - An optional object passed to each handler-function.
   */

  Component_EventEmitter.prototype.emit = function(eventName, sender, data) {
    var breakOwner, count, handler, handlerList, handlerLists, i, l, len, len1, m, n, ref;
    handlerLists = this.handlers[eventName];
    data = data != null ? data : {};
    if (handlerLists && this.needsSort[eventName]) {
      this.needsSort[eventName] = false;
      for (l = 0, len = handlerLists.length; l < len; l++) {
        handlerList = handlerLists[l];
        handlerList.sort(function(a, b) {
          if (a.owner && b.owner) {
            if (a.owner.rIndex > b.owner.rIndex) {
              return -1;
            } else if (a.owner.rIndex < b.owner.rIndex) {
              return 1;
            } else {
              return 0;
            }
          } else {
            return -1;
          }
        });
      }
    }
    if (handlerLists != null) {
      breakOwner = null;
      for (m = handlerLists.length - 1; m >= 0; m += -1) {
        handlerList = handlerLists[m];
        if (!handlerList) {
          continue;
        }
        i = 0;
        count = handlerList.length;
        this.isEmitting++;
        while (i < count) {
          handler = handlerList[i];
          data.handler = handler;
          data.sender = sender;
          data.data = handler.data;
          if ((!breakOwner && (!handler.owner || (handler.owner.visible == null) || handler.owner.visible)) || breakOwner === handler.owner) {
            handler.handler(data);
          }
          if (handler.once) {
            this.markedForRemove.push(handler);
          }
          if (data.breakChain) {
            breakOwner = handler.owner;
          }
          i++;
        }
        this.isEmitting--;
        if (data.breakChain) {
          data.breakChain = false;
          break;
        }
      }
      if (!this.isEmitting && this.markedForRemove.length > 0) {
        ref = this.markedForRemove;
        for (n = 0, len1 = ref.length; n < len1; n++) {
          handler = ref[n];
          this.handlers[handler.eventName][handler.priority].remove(handler);
        }
        this.markedForRemove = [];
      }
    }
    return null;
  };


  /**
  * Checks if an event-handler with a specified owner exists for the
  * given event.
  *
  * @method checkForOwner
  * @param {string} eventName - The event name.
  * @param {function} owner - The owner to search for.
  * @return {boolean} If <b>true</b>, an event-handler with the specified owner
  * exists for the given event. Otherwise <b>false</b>.
   */

  Component_EventEmitter.prototype.checkForOwner = function(eventName, owner) {
    var handler, l, len, ref, result;
    result = false;
    ref = this.handlers[eventName];
    for (l = 0, len = ref.length; l < len; l++) {
      handler = ref[l];
      if (handler.owner === owner) {
        result = true;
        break;
      }
    }
    return result;
  };


  /**
  * Checks if an event-handler with a specified handler-function exists for the
  * given event.
  *
  * @method checkForHandlerFunction
  * @param {string} eventName - The event name.
  * @param {function} handlerFunction - The handler-function to search for.
  * @return {boolean} If true, an observer witht he specified handler-function
  * exists for the given event. Otherwise false.
   */

  Component_EventEmitter.prototype.checkForHandlerFunction = function(eventName, handlerFunction) {
    var handler, l, len, ref, result;
    result = false;
    if (handlerFunction != null) {
      ref = this.handlers[eventName];
      for (l = 0, len = ref.length; l < len; l++) {
        handler = ref[l];
        if (handler.handler === handlerFunction) {
          result = true;
          break;
        }
      }
    }
    return result;
  };


  /**
  * Not implemented yet.
  * @method update
   */

  Component_EventEmitter.prototype.update = function() {
    return this.object.active = this.object.active && (!this.object.parent || this.object.parent.active);
  };

  return Component_EventEmitter;

})(gs.Component);

gs.Component_EventEmitter = Component_EventEmitter;

gs.EventEmitter = Component_EventEmitter;

gs.GlobalEventManager = new Component_EventEmitter();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsc0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFFRjs7Ozs7Ozs7O21DQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDakIsUUFBQTtBQUFBLFNBQUEsa0JBQUE7TUFDSSxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBO0FBQ2pCLFdBQVMsb0ZBQVQ7UUFDSSxRQUFBLEdBQVcsSUFBSyxDQUFBLENBQUE7UUFDaEIsQ0FBQSxHQUFJO0FBQ0osZUFBTSxDQUFBLEdBQUksUUFBUSxDQUFDLE1BQW5CO1VBQ0ksT0FBQSxHQUFVLFFBQVMsQ0FBQSxDQUFBO1VBRW5CLElBQUcsQ0FBQyxPQUFPLENBQUMsT0FBVCxJQUFvQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBeEM7WUFDSSxRQUFRLENBQUMsTUFBVCxDQUFnQixDQUFoQixFQUFtQixDQUFuQixFQURKO1dBQUEsTUFBQTtZQUdJLENBQUEsR0FISjs7UUFISjtBQUhKO0FBRko7QUFjQSxXQUFPO0VBZlU7OztBQWdCckI7Ozs7Ozs7Ozs7RUFTYSxnQ0FBQTtJQUNULHlEQUFBLFNBQUE7O0FBRUE7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBRWY7Ozs7O0lBS0EsSUFBQyxDQUFBLFNBQUQsR0FBYTs7QUFFYjs7Ozs7SUFLQSxJQUFDLENBQUEsU0FBRCxHQUFhOztBQUViOzs7OztJQUtBLElBQUMsQ0FBQSxlQUFELEdBQW1COztBQUVuQjs7Ozs7SUFLQSxJQUFDLENBQUEsVUFBRCxHQUFjO0VBN0NMOzs7QUErQ2I7Ozs7OzttQ0FLQSxLQUFBLEdBQU8sU0FBQTtJQUNILElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDYixJQUFDLENBQUEsUUFBRCxHQUFZO1dBQ1osSUFBQyxDQUFBLFdBQUQsR0FB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QUFBLHFDQUFBOztNQUNJLElBQUcsT0FBTyxDQUFDLEtBQVIsS0FBaUIsS0FBcEI7UUFDSSxNQUFBLEdBQVM7QUFDVCxjQUZKOztBQURKO0FBS0EsV0FBTztFQVJJOzs7QUFVZjs7Ozs7Ozs7Ozs7bUNBVUEsdUJBQUEsR0FBeUIsU0FBQyxTQUFELEVBQVksZUFBWjtBQUNyQixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBRVQsSUFBRyx1QkFBSDtBQUNJO0FBQUEsV0FBQSxxQ0FBQTs7UUFDSSxJQUFHLE9BQU8sQ0FBQyxPQUFSLEtBQW1CLGVBQXRCO1VBQ0ksTUFBQSxHQUFTO0FBQ1QsZ0JBRko7O0FBREosT0FESjs7QUFNQSxXQUFPO0VBVGM7OztBQVd6Qjs7Ozs7bUNBS0EsTUFBQSxHQUFRLFNBQUE7V0FDSixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLElBQW1CLENBQUMsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVQsSUFBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBbkM7RUFEaEM7Ozs7R0EvU3lCLEVBQUUsQ0FBQzs7QUFrVHhDLEVBQUUsQ0FBQyxzQkFBSCxHQUE0Qjs7QUFDNUIsRUFBRSxDQUFDLFlBQUgsR0FBa0I7O0FBQ2xCLEVBQUUsQ0FBQyxrQkFBSCxHQUE0QixJQUFBLHNCQUFBLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9FdmVudEVtaXR0ZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9FdmVudEVtaXR0ZXIgZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAjQG9iamVjdENvZGVjQmxhY2tMaXN0ID0gW1wiaGFuZGxlcnNcIl1cbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uRGF0YUJ1bmRsZVJlc3RvcmUuXG4gICAgKiBAcGFyYW0gT2JqZWN0IGRhdGEgLSBUaGUgZGF0YS1idW5kbGVcbiAgICAqIEBwYXJhbSBncy5PYmplY3RDb2RlY0NvbnRleHQgY29udGV4dCAtIFRoZSBjb2RlYy1jb250ZXh0LlxuICAgICMjI1xuICAgIG9uRGF0YUJ1bmRsZVJlc3RvcmU6IChkYXRhLCBjb250ZXh0KSAtPlxuICAgICAgICBmb3IgayBvZiBAaGFuZGxlcnNcbiAgICAgICAgICAgIGxpc3QgPSBAaGFuZGxlcnNba11cbiAgICAgICAgICAgIGZvciBpIGluIFswLi4ubGlzdC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBsaXN0W2ldXG4gICAgICAgICAgICAgICAgaiA9IDBcbiAgICAgICAgICAgICAgICB3aGlsZSBqIDwgaGFuZGxlcnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tqXVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICFoYW5kbGVyLmhhbmRsZXIgb3IgIWhhbmRsZXIuaGFuZGxlci4kdm5tX2NiXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVycy5zcGxpY2UoaiwgMSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaisrXG5cbiAgICAgICAgI0BoYW5kbGVycyA9IHt9XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgIyMjKlxuICAgICogQSBjb21wb25lbnQgd2hpY2ggYWxsb3cgYSBnYW1lIG9iamVjdCB0byBmaXJlIGV2ZW50cyBhbmQgbWFuYWdlIGEgbGlzdFxuICAgICogb2Ygb2JzZXJ2ZXJzLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfRXZlbnRFbWl0dGVyXG4gICAgKiBAZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlclxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBMaXN0IG9mIHJlZ2lzdGVyZWQgb2JzZXJ2ZXJzLlxuICAgICAgICAqXG4gICAgICAgICogQHByb3BlcnR5IGhhbmRsZXJzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEBoYW5kbGVycyA9IHt9XG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBkZWZhdWx0RGF0YVxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAZGVmYXVsdERhdGEgPSB7fVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgY2hhaW5JbmZvXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEBjaGFpbkluZm8gPSB7fVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgbmVlZHNTb3J0XG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAbmVlZHNTb3J0ID0ge31cblxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IG1hcmtlZEZvclJlbW92ZVxuICAgICAgICAqIEB0eXBlIE9iamVjdFtdXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEBtYXJrZWRGb3JSZW1vdmUgPSBbXVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgaXNFbWl0dGluZ1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAaXNFbWl0dGluZyA9IDBcblxuICAgICMjIypcbiAgICAqIENsZWFycyB0aGUgZXZlbnQgZW1pdHRlciBieSByZW1vdmluZyBhbGwgaGFuZGxlcnMvbGlzdGVuZXJzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAjIyNcbiAgICBjbGVhcjogLT5cbiAgICAgICAgQG5lZWRzU29ydCA9IHt9XG4gICAgICAgIEBoYW5kbGVycyA9IHt9XG4gICAgICAgIEBkZWZhdWx0RGF0YSA9IHt9XG5cbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgdGhlIGV2ZW50IGVtaXR0ZXIgYnkgcmVtb3ZpbmcgYWxsIGhhbmRsZXJzL2xpc3RlbmVycyBleGNlcHQgdGhvc2VcbiAgICAqIHdoaWNoIGFyZSBhc3NvY2lhdGVkIHdpdGggYW4gb3duZXIgaW4gdGhlIHNwZWNpZmllZCBvd25lcnMgYXJyYXkuXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhckV4Y2VwdFxuICAgICogQHBhcmFtIHtPYmplY3RbXX0gb3duZXJzIC0gQW4gYXJyYXkgb2Ygb3duZXIgb2JqZWN0cy4gT25seSBoYW5kbGVycy9saXN0ZW5lcnMgd2hpY2ggYXJlIG5vdFxuICAgICogYXNzb2NpYXRlZCB3aXRoIHRoYXQgb3duZXJzIGFyZSByZW1vdmVkLlxuICAgICMjI1xuICAgIGNsZWFyRXhjZXB0OiAob3duZXJzKSAtPlxuICAgICAgICBAbmVlZHNTb3J0ID0ge31cbiAgICAgICAgQGRlZmF1bHREYXRhID0ge31cblxuICAgICAgICBldmVudHMgPSBPYmplY3Qua2V5cyhAaGFuZGxlcnMpXG4gICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICAgIGhhbmRsZXJzID0gQGhhbmRsZXJzW2V2ZW50XVxuICAgICAgICAgICAgZm9yIGhhbmRsZXJMaXN0LCBpIGluIGhhbmRsZXJzXG4gICAgICAgICAgICAgICAgaGFuZGxlckxpc3QgPSBoYW5kbGVyTGlzdC5maWx0ZXIgKGgpIC0+IG93bmVycy5pbmRleE9mKGgub3duZXIpICE9IDFcbiAgICAgICAgICAgICAgICBoYW5kbGVyc1tpXSA9IGhhbmRsZXJMaXN0XG5cbiAgICAjIyMqXG4gICAgKiBBZGRzIGEgbmV3IG9ic2VydmVyL2xpc3RlbmVyIGZvciBhIHNwZWNpZmllZCBldmVudC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIGV2ZW50IG5hbWUuXG4gICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYW5kbGVyIC0gVGhlIGhhbmRsZXItZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIGZpcmVkLlxuICAgICogQHBhcmFtIHtPYmplY3R9IFtkYXRhPXt9XSAtIEFuIG9wdGlvbmFsIGluZm8tb2JqZWN0IHBhc3NlZCB0byB0aGUgaGFuZGxlci1mdW5jdGlvbi5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3duZXI9bnVsbF0gLSBBbiBvcHRpb25hbCBvd25lci1vYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBvYnNlcnZlci9saXN0ZW5lci5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBwcmlvcml0eSAtIEFuIG9wdGlvbmFsIHByaW9yaXR5IGxldmVsLiBBbiBvYnNlcnZlci9saXN0ZW5lciB3aXRoIGEgaGlnaGVyIGxldmVsIHdpbGwgcmVjZWl2ZSB0aGUgZXZlbnQgYmVmb3JlIG9ic2VydmVycy9saXN0ZW5lcnMgd2l0aCBhIGxvd2VyIGxldmVsLlxuICAgICogQHJldHVybiB7Z3MuRXZlbnRPYnNlcnZlcn0gLSBUaGUgYWRkZWQgb2JzZXJ2ZXItb2JqZWN0LlxuICAgICMjI1xuICAgIG9uOiAoZXZlbnROYW1lLCBoYW5kbGVyLCBkYXRhLCBvd25lciwgcHJpb3JpdHkpIC0+XG4gICAgICAgIHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMFxuICAgICAgICBAbmVlZHNTb3J0W2V2ZW50TmFtZV0gPSB0cnVlXG4gICAgICAgIGlmIG5vdCBAaGFuZGxlcnNbZXZlbnROYW1lXT9cbiAgICAgICAgICAgIEBoYW5kbGVyc1tldmVudE5hbWVdID0gW11cbiAgICAgICAgaWYgbm90IEBoYW5kbGVyc1tldmVudE5hbWVdW3ByaW9yaXR5XVxuICAgICAgICAgICAgQGhhbmRsZXJzW2V2ZW50TmFtZV1bcHJpb3JpdHldID0gW11cblxuICAgICAgICBoYW5kbGVyT2JqZWN0ID0geyBoYW5kbGVyOiBoYW5kbGVyLCBvbmNlOiBubywgZGF0YTogZGF0YSwgb3duZXI6IG93bmVyLCBldmVudE5hbWU6IGV2ZW50TmFtZSwgcHJpb3JpdHk6IHByaW9yaXR5IH1cbiAgICAgICAgQGhhbmRsZXJzW2V2ZW50TmFtZV1bcHJpb3JpdHldLnB1c2goaGFuZGxlck9iamVjdClcblxuICAgICAgICByZXR1cm4gaGFuZGxlck9iamVjdFxuXG4gICAgIyMjKlxuICAgICogQWRkcyBhIG5ldyBvYnNlcnZlci9saXN0ZW5lciBmb3IgYSBzcGVjaWZpZWQgZXZlbnQgYW5kIHJlbW92ZXMgaXRcbiAgICAqIGFmdGVyIHRoZSBldmVuIGhhcyBiZWVuIGVtaXR0ZWQgb25jZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9uY2VcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgZXZlbnQgbmFtZS5cbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGhhbmRsZXIgLSBUaGUgaGFuZGxlci1mdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgZmlyZWQuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gW2RhdGE9e31dIC0gQW4gb3B0aW9uYWwgaW5mby1vYmplY3QgcGFzc2VkIHRvIHRoZSBoYW5kbGVyLWZ1bmN0aW9uLlxuICAgICogQHBhcmFtIHtPYmplY3R9IFtvd25lcj1udWxsXSAtIEFuIG9wdGlvbmFsIG93bmVyLW9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIG9ic2VydmVyL2xpc3RlbmVyLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHByaW9yaXR5IC0gQW4gb3B0aW9uYWwgcHJpb3JpdHkgbGV2ZWwuIEFuIG9ic2VydmVyL2xpc3RlbmVyIHdpdGggYSBoaWdoZXIgbGV2ZWwgd2lsbCByZWNlaXZlIHRoZSBldmVudCBiZWZvcmUgb2JzZXJ2ZXJzL2xpc3RlbmVycyB3aXRoIGEgbG93ZXIgbGV2ZWwuXG4gICAgKiBAcmV0dXJuIHtncy5FdmVudE9ic2VydmVyfSAtIFRoZSBhZGRlZCBvYnNlcnZlci1vYmplY3QuXG4gICAgIyMjXG4gICAgb25jZTogKGV2ZW50TmFtZSwgaGFuZGxlciwgZGF0YSwgb3duZXIsIHByaW9yaXR5KSAtPlxuICAgICAgICBoYW5kbGVyT2JqZWN0ID0gQG9uKGV2ZW50TmFtZSwgaGFuZGxlciwgZGF0YSwgb3duZXIsIHByaW9yaXR5KVxuICAgICAgICBoYW5kbGVyT2JqZWN0Lm9uY2UgPSB5ZXNcblxuICAgICAgICByZXR1cm4gaGFuZGxlck9iamVjdFxuXG4gICAgIyMjKlxuICAgICogUmVtb3ZlcyBhbiBvYnNlcnZlci9saXN0ZW5lciBmcm9tIGEgc3BlY2lmaWVkIGV2ZW50LiBJZiBoYW5kbGVyIHBhcmFtZXRlclxuICAgICogaXMgbnVsbCwgYWxsIG9ic2VydmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBhcmUgcmVtb3ZlZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG9mZlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBldmVudCBuYW1lLlxuICAgICogQHBhcmFtIHtncy5FdmVudE9ic2VydmVyfSBbaGFuZGxlcj1udWxsXSAtIFRoZSBvYnNlcnZlci1vYmplY3QgdG8gcmVtb3ZlLlxuICAgICogSWYgbnVsbCwgYWxsIG9ic2VydmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBhcmUgcmVtb3ZlZC5cbiAgICAjIyNcbiAgICBvZmY6IChldmVudE5hbWUsIGhhbmRsZXIpIC0+XG4gICAgICAgIGlmIEBpc0VtaXR0aW5nID4gMCBhbmQgaGFuZGxlclxuICAgICAgICAgICAgQG1hcmtlZEZvclJlbW92ZS5wdXNoKGhhbmRsZXIpXG4gICAgICAgIGVsc2UgaWYgaGFuZGxlcj9cbiAgICAgICAgICAgIEBoYW5kbGVyc1tldmVudE5hbWVdP1toYW5kbGVyLnByaW9yaXR5XT8ucmVtb3ZlKGhhbmRsZXIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBoYW5kbGVyc1tldmVudE5hbWVdID0gW11cblxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgYWxsIG9ic2VydmVycy9saXN0ZW5lcnMgZnJvbSBhbiBldmVudCB3aGljaCBhcmUgYmVsb25naW5nIHRvIHRoZSBzcGVjaWZpZWRcbiAgICAqIG93bmVyLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb2ZmQnlPd25lclxuICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBldmVudCBuYW1lLlxuICAgICogQHBhcmFtIHtPYmplY3R9IG93bmVyIC0gVGhlIG93bmVyLlxuICAgICogQHJldHVybiB7bnVtYmVyfSBDb3VudCBvZiByZW1vdmVkIG9ic2VydmVycy9saXN0ZW5lcnMuXG4gICAgIyMjXG4gICAgb2ZmQnlPd25lcjogKGV2ZW50TmFtZSwgb3duZXIpIC0+XG4gICAgICAgIGlmIEBoYW5kbGVyc1tldmVudE5hbWVdXG4gICAgICAgICAgICBpZiBAaXNFbWl0dGluZyA+IDBcbiAgICAgICAgICAgICAgICBmb3IgaGFuZGxlckxpc3QgaW4gQGhhbmRsZXJzW2V2ZW50TmFtZV1cbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMgPSBoYW5kbGVyTGlzdD8ud2hlcmUgKHgpIC0+IHgub3duZXIgPT0gb3duZXJcbiAgICAgICAgICAgICAgICAgICAgZm9yIGhhbmRsZXIgaW4gaGFuZGxlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIEBtYXJrZWRGb3JSZW1vdmUucHVzaChoYW5kbGVyKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciBoYW5kbGVyTGlzdCBpbiBAaGFuZGxlcnNbZXZlbnROYW1lXVxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTGlzdC5yZW1vdmVBbGwoKHgpIC0+IHgub3duZXIgPT0gb3duZXIpXG5cbiAgICAjIyMqXG4gICAgKiBFbWl0cyB0aGUgc3BlY2lmaWVkIGV2ZW50LiBBbGwgb2JzZXJ2ZXJzL2xpc3RlbmVycyByZWdpc3RlcmVkIGZvciB0aGVcbiAgICAqIHNwZWNpZmllZCBldmVudCBhcmUgaW5mb3JtZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBlbWl0XG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGZpcmUuXG4gICAgKiBAcGFyYW0ge09iamVjdH0gW3NlbmRlcj1udWxsXSAtIFRoZSBzZW5kZXIgb2YgdGhlIGV2ZW50LlxuICAgICogQHBhcmFtIHtPYmplY3R9IFtkYXRhPXt9XSAtIEFuIG9wdGlvbmFsIG9iamVjdCBwYXNzZWQgdG8gZWFjaCBoYW5kbGVyLWZ1bmN0aW9uLlxuICAgICMjI1xuICAgIGVtaXQ6IChldmVudE5hbWUsIHNlbmRlciwgZGF0YSkgLT5cbiAgICAgICAgaGFuZGxlckxpc3RzID0gQGhhbmRsZXJzW2V2ZW50TmFtZV1cbiAgICAgICAgZGF0YSA9IGRhdGEgPyB7fSAjQGRlZmF1bHREYXRhXG5cbiAgICAgICAgaWYgaGFuZGxlckxpc3RzIGFuZCBAbmVlZHNTb3J0W2V2ZW50TmFtZV1cbiAgICAgICAgICAgIEBuZWVkc1NvcnRbZXZlbnROYW1lXSA9IG5vXG4gICAgICAgICAgICBmb3IgaGFuZGxlckxpc3QgaW4gaGFuZGxlckxpc3RzXG4gICAgICAgICAgICAgICAgaGFuZGxlckxpc3Quc29ydCAoYSwgYikgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgYS5vd25lciBhbmQgYi5vd25lclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYS5vd25lci5ySW5kZXggPiBiLm93bmVyLnJJbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgYS5vd25lci5ySW5kZXggPCBiLm93bmVyLnJJbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTFcblxuICAgICAgICBpZiBoYW5kbGVyTGlzdHM/XG4gICAgICAgICAgICBicmVha093bmVyID0gbnVsbFxuICAgICAgICAgICAgZm9yIGhhbmRsZXJMaXN0IGluIGhhbmRsZXJMaXN0cyBieSAtMVxuICAgICAgICAgICAgICAgIGlmICFoYW5kbGVyTGlzdCB0aGVuIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgaSA9IDBcbiAgICAgICAgICAgICAgICBjb3VudCA9IGhhbmRsZXJMaXN0Lmxlbmd0aFxuICAgICAgICAgICAgICAgIEBpc0VtaXR0aW5nKytcbiAgICAgICAgICAgICAgICB3aGlsZSBpIDwgY291bnRcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXJMaXN0W2ldXG5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5oYW5kbGVyID0gaGFuZGxlclxuICAgICAgICAgICAgICAgICAgICBkYXRhLnNlbmRlciA9IHNlbmRlclxuICAgICAgICAgICAgICAgICAgICBkYXRhLmRhdGEgPSBoYW5kbGVyLmRhdGFcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWJyZWFrT3duZXIgYW5kICghaGFuZGxlci5vd25lciBvciAhaGFuZGxlci5vd25lci52aXNpYmxlPyBvciBoYW5kbGVyLm93bmVyLnZpc2libGUpKSBvciBicmVha093bmVyID09IGhhbmRsZXIub3duZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuaGFuZGxlcihkYXRhKVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIGhhbmRsZXIub25jZVxuICAgICAgICAgICAgICAgICAgICAgICAgQG1hcmtlZEZvclJlbW92ZS5wdXNoKGhhbmRsZXIpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgZGF0YS5icmVha0NoYWluXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha093bmVyID0gaGFuZGxlci5vd25lclxuICAgICAgICAgICAgICAgICAgICAgICAgI2JyZWFrXG5cbiAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgQGlzRW1pdHRpbmctLVxuICAgICAgICAgICAgICAgIGlmIGRhdGEuYnJlYWtDaGFpblxuICAgICAgICAgICAgICAgICAgICBkYXRhLmJyZWFrQ2hhaW4gPSBub1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBpZiAhQGlzRW1pdHRpbmcgYW5kIEBtYXJrZWRGb3JSZW1vdmUubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIGZvciBoYW5kbGVyIGluIEBtYXJrZWRGb3JSZW1vdmVcbiAgICAgICAgICAgICAgICAgICAgQGhhbmRsZXJzW2hhbmRsZXIuZXZlbnROYW1lXVtoYW5kbGVyLnByaW9yaXR5XS5yZW1vdmUoaGFuZGxlcilcbiAgICAgICAgICAgICAgICBAbWFya2VkRm9yUmVtb3ZlID0gW11cblxuXG4gICAgICAgIHJldHVybiBudWxsXG5cblxuXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGlmIGFuIGV2ZW50LWhhbmRsZXIgd2l0aCBhIHNwZWNpZmllZCBvd25lciBleGlzdHMgZm9yIHRoZVxuICAgICogZ2l2ZW4gZXZlbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjaGVja0Zvck93bmVyXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIGV2ZW50IG5hbWUuXG4gICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvd25lciAtIFRoZSBvd25lciB0byBzZWFyY2ggZm9yLlxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gSWYgPGI+dHJ1ZTwvYj4sIGFuIGV2ZW50LWhhbmRsZXIgd2l0aCB0aGUgc3BlY2lmaWVkIG93bmVyXG4gICAgKiBleGlzdHMgZm9yIHRoZSBnaXZlbiBldmVudC4gT3RoZXJ3aXNlIDxiPmZhbHNlPC9iPi5cbiAgICAjIyNcbiAgICBjaGVja0Zvck93bmVyOiAoZXZlbnROYW1lLCBvd25lcikgLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cblxuICAgICAgICBmb3IgaGFuZGxlciBpbiBAaGFuZGxlcnNbZXZlbnROYW1lXVxuICAgICAgICAgICAgaWYgaGFuZGxlci5vd25lciA9PSBvd25lclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHllc1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuXG4gICAgIyMjKlxuICAgICogQ2hlY2tzIGlmIGFuIGV2ZW50LWhhbmRsZXIgd2l0aCBhIHNwZWNpZmllZCBoYW5kbGVyLWZ1bmN0aW9uIGV4aXN0cyBmb3IgdGhlXG4gICAgKiBnaXZlbiBldmVudC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNoZWNrRm9ySGFuZGxlckZ1bmN0aW9uXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIGV2ZW50IG5hbWUuXG4gICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYW5kbGVyRnVuY3Rpb24gLSBUaGUgaGFuZGxlci1mdW5jdGlvbiB0byBzZWFyY2ggZm9yLlxuICAgICogQHJldHVybiB7Ym9vbGVhbn0gSWYgdHJ1ZSwgYW4gb2JzZXJ2ZXIgd2l0aHQgaGUgc3BlY2lmaWVkIGhhbmRsZXItZnVuY3Rpb25cbiAgICAqIGV4aXN0cyBmb3IgdGhlIGdpdmVuIGV2ZW50LiBPdGhlcndpc2UgZmFsc2UuXG4gICAgIyMjXG4gICAgY2hlY2tGb3JIYW5kbGVyRnVuY3Rpb246IChldmVudE5hbWUsIGhhbmRsZXJGdW5jdGlvbikgLT5cbiAgICAgICAgcmVzdWx0ID0gbm9cblxuICAgICAgICBpZiBoYW5kbGVyRnVuY3Rpb24/XG4gICAgICAgICAgICBmb3IgaGFuZGxlciBpbiBAaGFuZGxlcnNbZXZlbnROYW1lXVxuICAgICAgICAgICAgICAgIGlmIGhhbmRsZXIuaGFuZGxlciA9PSBoYW5kbGVyRnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0geWVzXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuXG4gICAgIyMjKlxuICAgICogTm90IGltcGxlbWVudGVkIHlldC5cbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgIyBGSVhNRTogV2h5IHNob3VsZCBldmVudC1lbWl0dGVyIGluZmx1ZW5jZSB0aGUgYWN0aXZlLXByb3BlcnR5P1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgQG9iamVjdC5hY3RpdmUgPSBAb2JqZWN0LmFjdGl2ZSBhbmQgKCFAb2JqZWN0LnBhcmVudCBvciBAb2JqZWN0LnBhcmVudC5hY3RpdmUpXG5cbmdzLkNvbXBvbmVudF9FdmVudEVtaXR0ZXIgPSBDb21wb25lbnRfRXZlbnRFbWl0dGVyXG5ncy5FdmVudEVtaXR0ZXIgPSBDb21wb25lbnRfRXZlbnRFbWl0dGVyXG5ncy5HbG9iYWxFdmVudE1hbmFnZXIgPSBuZXcgQ29tcG9uZW50X0V2ZW50RW1pdHRlcigpIl19
//# sourceURL=Component_EventEmitter_155.js