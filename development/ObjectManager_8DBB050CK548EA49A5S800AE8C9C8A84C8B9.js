var ObjectManager;

ObjectManager = (function() {

  /**
  * Stores the current default ObjectManager.
  * @property current
  * @type gs.ObjectManager
  * @static
   */
  ObjectManager.current = null;


  /**
  * Manages game objects by updating if necessary and offering
  * methods to add or remove game objects. All game objects are sorted by
  * the order-property to give control over the update-order.
  *
  * A game object can registered under a unique ID and then easily accessed using
  * that ID. If an object gets registered, a global variable $<ID> is created
  * as well. However, that global variable is only for the use in property-bindings
  * used for In-Game UI. See ui.Component_BindingHandler.
  *
  * In addition, a game object can be assigned to a group like for example
  * a set of UI toggle-buttons can be assigned to the same group and then
  * easily accessed later using gs.ObjectManager.objectsByGroup method.
  *
  * @module gs
  * @class ObjectManager
  * @memberof gs
  * @constructor
  * @see ui.Component_BindingHandler
   */

  function ObjectManager() {

    /**
    * All game objects to manage.
    * @property objects
    * @type gs.Object_Base[]
     */
    this.objects = [];

    /**
    * All game objects by ID.
    * @property objectsById
    * @type Object
     */
    this.objectsById = {};

    /**
    * All game objects by group.
    * @property objectsByGroup_
    * @type Object
     */
    this.objectsByGroup_ = {};

    /**
    * Indicates if the ObjectManager is active. If <b>false</b> the game objects are not updated.
    * @property active
    * @type boolean
     */
    this.active = true;
    this.inputSession = 0;

    /**
    * Indicates if the ObjectManager needs to sort the game objects.
    * @property active
    * @type boolean
     */
    this.needsSort = true;
  }


  /**
  * Disposes the manager and all assigned game objects.
  *
  * @method dispose
   */

  ObjectManager.prototype.dispose = function() {
    var j, len, object, ref, results;
    ref = this.objects;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      if (!object.disposed) {
        results.push(object.dispose());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Disposes all assigned game objects.
  *
  * @method disposeObjects
   */

  ObjectManager.prototype.disposeObjects = function() {
    var j, k, keys, len, object, results;
    keys = Object.keys(this.objectsById);
    results = [];
    for (j = 0, len = keys.length; j < len; j++) {
      k = keys[j];
      object = this.objectsById[k];
      if (object && !object.disposed) {
        results.push(object.dispose());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Registers an object.
  *
  * @method registerObject
   */

  ObjectManager.prototype.registerObject = function(object) {
    if (object.id != null) {
      if (!this.objectsById[object.id]) {
        this.objectsById[object.id] = [];
      }
      this.objectsById[object.id].push(object);
      window["$" + object.id] = object;
      return object.manager = this;
    }
  };


  /**
  * Unregisters an object.
  *
  * @method unregisterObject
   */

  ObjectManager.prototype.unregisterObject = function(object) {
    var objects;
    if ((object != null ? object.id : void 0) != null) {
      objects = this.objectsById[object.id];
      if (objects) {
        objects.remove(object);
        if (objects.length > 0) {
          window["$" + object.id] = objects.last();
        } else {
          delete window["$" + object.id];
        }
      }
      object.manager = null;
    }
    return null;
  };


  /**
  * Adds a game object to the manager. The game object is then automatically updated by the manager.
  *
  * @method addObject
  * @param {gs.Object_Base} object - The game object to add.
   */

  ObjectManager.prototype.addObject = function(object) {
    return this.add(object);
  };


  /**
  * Removes a game object to the manager. The game object is then no longer automatically updated or disposed by the manager.
  *
  * @method removeObject
  * @param {gs.Object_Base} object - The game object to remove.
   */

  ObjectManager.prototype.removeObject = function(object) {
    return this.remove(object);
  };


  /**
  * Adds a game object to the manager. The game object is then automatically updated by the manager.
  *
  * @method add
  * @param {gs.Object_Base} object - The game object to add.
   */

  ObjectManager.prototype.add = function(object) {
    this.objects.push(object);
    this.needsSort = true;
    this.registerObject(object);
    return this.addToGroup(object, object.group);
  };


  /**
  * Removes a game object to the manager. The game object is then no longer automatically updated or disposed by the manager.
  *
  * @method remove
  * @param {gs.Object_Base} object - The game object to remove.
   */

  ObjectManager.prototype.remove = function(object) {
    var ref;
    if (object) {
      this.objects.remove(object);
      this.unregisterObject(object);
      if (object.group != null) {
        return (ref = this.objectsByGroup[object.group]) != null ? ref.remove(object) : void 0;
      }
    }
  };


  /**
  * Gets an object by ID.
  *
  * @method objectById
  * @param {String} id - The ID of the game object to get. 
  * @return {gs.Object_Base} The game object or <b>null</b> if no game object is registered for the specified ID.
   */

  ObjectManager.prototype.objectById = function(id) {
    var ref;
    return (ref = this.objectsById[id]) != null ? ref.last() : void 0;
  };


  /**
  * Gets an object by ID.
  *
  * @method byId
  * @param {String} id - The ID of the game object to get. 
  * @return {gs.Object_Base} The game object or <b>null</b> if no game object is registered for the specified ID.
   */

  ObjectManager.prototype.byId = function(id) {
    var ref;
    return (ref = this.objectsById[id]) != null ? ref.last() : void 0;
  };


  /**
  * Sets the object for an ID.
  *
  * @method setObjectById
  * @param {gs.Object_Base} object - The game object to set.
  * @param {String} id - The ID for the game object.
   */

  ObjectManager.prototype.setObjectById = function(object, id) {
    if (!id) {
      return;
    }
    object.id = id;
    if (!this.objectsById[id]) {
      this.objectsById[id] = [object];
    } else {
      this.objectsById[id].push(object);
    }
    return window["$" + id] = object;
  };


  /**
  * Adds an object to a specified object-group.
  *
  * @method addToGroup
  * @param {gs.Object_Base} object - The game object to add.
  * @param {String} group - The group to assign game object to.
   */

  ObjectManager.prototype.addToGroup = function(object, group) {
    var ref;
    if (group != null) {
      if ((ref = this.objectsByGroup_[object.group]) != null) {
        ref.remove(object);
      }
      if (!this.objectsByGroup_[group]) {
        this.objectsByGroup_[group] = [];
      }
      return this.objectsByGroup_[group].push(object);
    }
  };


  /**
  * Gets all object of a specified object-group.
  *
  * @method objectsByGroup
  * @param {String} group - The object-group.
  * @return {gs.Object_Base[]} The game objects belonging to the specified group.
   */

  ObjectManager.prototype.objectsByGroup = function(group) {
    return this.objectsByGroup_[group] || [];
  };

  ObjectManager.prototype.pushModalSession = function() {
    return this.inputSession += 1;
  };

  ObjectManager.prototype.popModalSession = function() {
    return this.inputSession -= 1;
  };

  ObjectManager.prototype.setModalSession = function(id) {
    return this.inputSession = id;
  };


  /**
  * Updates the manager and all assigned game objects in the right order.
  *
  * @method update
   */

  ObjectManager.prototype.update = function() {
    var i, object;
    i = 0;
    if (this.needsSort) {
      this.objects.sort(function(a, b) {
        if (a.order < b.order) {
          return 1;
        } else if (a.order > b.order) {
          return -1;
        } else {
          return 0;
        }
      });
      this.needsSort = false;
    }
    while (i < this.objects.length) {
      object = this.objects[i];
      if (object.disposed) {
        this.removeObject(object);
      } else {
        if (object.active) {
          object.update();
        }
        i++;
      }
    }
    return null;
  };

  return ObjectManager;

})();

gs.ObjectManager = ObjectManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7OztFQU1BLGFBQUMsQ0FBQSxPQUFELEdBQVU7OztBQUVWOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFvQmEsdUJBQUE7O0FBQ1Q7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxlQUFELEdBQW1COztBQUVuQjs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVO0lBRVYsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7O0FBRWhCOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELEdBQWE7RUFwQ0o7OztBQXNDYjs7Ozs7OzBCQUtBLE9BQUEsR0FBUyxTQUFBO0FBQ0wsUUFBQTtBQUFBO0FBQUE7U0FBQSxxQ0FBQTs7TUFDSSxJQUFHLENBQUksTUFBTSxDQUFDLFFBQWQ7cUJBQ0ksTUFBTSxDQUFDLE9BQVAsQ0FBQSxHQURKO09BQUEsTUFBQTs2QkFBQTs7QUFESjs7RUFESzs7O0FBS1Q7Ozs7OzswQkFLQSxjQUFBLEdBQWdCLFNBQUE7QUFDWixRQUFBO0lBQUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLFdBQWI7QUFDUDtTQUFBLHNDQUFBOztNQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBWSxDQUFBLENBQUE7TUFDdEIsSUFBRyxNQUFBLElBQVcsQ0FBSSxNQUFNLENBQUMsUUFBekI7cUJBQ0ksTUFBTSxDQUFDLE9BQVAsQ0FBQSxHQURKO09BQUEsTUFBQTs2QkFBQTs7QUFGSjs7RUFGWTs7O0FBT2hCOzs7Ozs7MEJBS0EsY0FBQSxHQUFnQixTQUFDLE1BQUQ7SUFDWixJQUFHLGlCQUFIO01BQ0ksSUFBRyxDQUFDLElBQUMsQ0FBQSxXQUFZLENBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBakI7UUFD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QUFNLENBQUMsTUFBUCxDQUFBLEVBQUE7O1FBQ0EsQ0FBQSxHQUpKOztJQUZKO0FBUUEsV0FBTztFQXJCSDs7Ozs7O0FBdUJaLEVBQUUsQ0FBQyxhQUFILEdBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBPYmplY3RNYW5hZ2VyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBPYmplY3RNYW5hZ2VyXG4gICAgIyMjKlxuICAgICogU3RvcmVzIHRoZSBjdXJyZW50IGRlZmF1bHQgT2JqZWN0TWFuYWdlci5cbiAgICAqIEBwcm9wZXJ0eSBjdXJyZW50XG4gICAgKiBAdHlwZSBncy5PYmplY3RNYW5hZ2VyXG4gICAgKiBAc3RhdGljXG4gICAgIyMjIFxuICAgIEBjdXJyZW50OiBudWxsXG4gICAgXG4gICAgIyMjKlxuICAgICogTWFuYWdlcyBnYW1lIG9iamVjdHMgYnkgdXBkYXRpbmcgaWYgbmVjZXNzYXJ5IGFuZCBvZmZlcmluZ1xuICAgICogbWV0aG9kcyB0byBhZGQgb3IgcmVtb3ZlIGdhbWUgb2JqZWN0cy4gQWxsIGdhbWUgb2JqZWN0cyBhcmUgc29ydGVkIGJ5XG4gICAgKiB0aGUgb3JkZXItcHJvcGVydHkgdG8gZ2l2ZSBjb250cm9sIG92ZXIgdGhlIHVwZGF0ZS1vcmRlci5cbiAgICAqXG4gICAgKiBBIGdhbWUgb2JqZWN0IGNhbiByZWdpc3RlcmVkIHVuZGVyIGEgdW5pcXVlIElEIGFuZCB0aGVuIGVhc2lseSBhY2Nlc3NlZCB1c2luZ1xuICAgICogdGhhdCBJRC4gSWYgYW4gb2JqZWN0IGdldHMgcmVnaXN0ZXJlZCwgYSBnbG9iYWwgdmFyaWFibGUgJDxJRD4gaXMgY3JlYXRlZFxuICAgICogYXMgd2VsbC4gSG93ZXZlciwgdGhhdCBnbG9iYWwgdmFyaWFibGUgaXMgb25seSBmb3IgdGhlIHVzZSBpbiBwcm9wZXJ0eS1iaW5kaW5nc1xuICAgICogdXNlZCBmb3IgSW4tR2FtZSBVSS4gU2VlIHVpLkNvbXBvbmVudF9CaW5kaW5nSGFuZGxlci5cbiAgICAqXG4gICAgKiBJbiBhZGRpdGlvbiwgYSBnYW1lIG9iamVjdCBjYW4gYmUgYXNzaWduZWQgdG8gYSBncm91cCBsaWtlIGZvciBleGFtcGxlXG4gICAgKiBhIHNldCBvZiBVSSB0b2dnbGUtYnV0dG9ucyBjYW4gYmUgYXNzaWduZWQgdG8gdGhlIHNhbWUgZ3JvdXAgYW5kIHRoZW5cbiAgICAqIGVhc2lseSBhY2Nlc3NlZCBsYXRlciB1c2luZyBncy5PYmplY3RNYW5hZ2VyLm9iamVjdHNCeUdyb3VwIG1ldGhvZC5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgT2JqZWN0TWFuYWdlclxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAqIEBzZWUgdWkuQ29tcG9uZW50X0JpbmRpbmdIYW5kbGVyXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbGwgZ2FtZSBvYmplY3RzIHRvIG1hbmFnZS5cbiAgICAgICAgKiBAcHJvcGVydHkgb2JqZWN0c1xuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9CYXNlW11cbiAgICAgICAgIyMjIFxuICAgICAgICBAb2JqZWN0cyA9IFtdXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQWxsIGdhbWUgb2JqZWN0cyBieSBJRC5cbiAgICAgICAgKiBAcHJvcGVydHkgb2JqZWN0c0J5SWRcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjIFxuICAgICAgICBAb2JqZWN0c0J5SWQgPSB7fVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCBnYW1lIG9iamVjdHMgYnkgZ3JvdXAuXG4gICAgICAgICogQHByb3BlcnR5IG9iamVjdHNCeUdyb3VwX1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyMgXG4gICAgICAgIEBvYmplY3RzQnlHcm91cF8gPSB7fVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgT2JqZWN0TWFuYWdlciBpcyBhY3RpdmUuIElmIDxiPmZhbHNlPC9iPiB0aGUgZ2FtZSBvYmplY3RzIGFyZSBub3QgdXBkYXRlZC5cbiAgICAgICAgKiBAcHJvcGVydHkgYWN0aXZlXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyMgXG4gICAgICAgIEBhY3RpdmUgPSB5ZXNcbiAgICAgICAgXG4gICAgICAgIEBpbnB1dFNlc3Npb24gPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBPYmplY3RNYW5hZ2VyIG5lZWRzIHRvIHNvcnQgdGhlIGdhbWUgb2JqZWN0cy5cbiAgICAgICAgKiBAcHJvcGVydHkgYWN0aXZlXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyMgXG4gICAgICAgIEBuZWVkc1NvcnQgPSB5ZXNcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIG1hbmFnZXIgYW5kIGFsbCBhc3NpZ25lZCBnYW1lIG9iamVjdHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBkaXNwb3NlXG4gICAgIyMjXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgZm9yIG9iamVjdCBpbiBAb2JqZWN0c1xuICAgICAgICAgICAgaWYgbm90IG9iamVjdC5kaXNwb3NlZFxuICAgICAgICAgICAgICAgIG9iamVjdC5kaXNwb3NlKClcbiAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgYWxsIGFzc2lnbmVkIGdhbWUgb2JqZWN0cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VPYmplY3RzXG4gICAgIyMjICAgICAgICAgICBcbiAgICBkaXNwb3NlT2JqZWN0czogLT5cbiAgICAgICAga2V5cyA9IE9iamVjdC5rZXlzKEBvYmplY3RzQnlJZClcbiAgICAgICAgZm9yIGsgaW4ga2V5c1xuICAgICAgICAgICAgb2JqZWN0ID0gQG9iamVjdHNCeUlkW2tdXG4gICAgICAgICAgICBpZiBvYmplY3QgYW5kIG5vdCBvYmplY3QuZGlzcG9zZWRcbiAgICAgICAgICAgICAgICBvYmplY3QuZGlzcG9zZSgpXG4gICAgXG4gICAgIyMjKlxuICAgICogUmVnaXN0ZXJzIGFuIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlZ2lzdGVyT2JqZWN0XG4gICAgIyMjXG4gICAgcmVnaXN0ZXJPYmplY3Q6IChvYmplY3QpIC0+XG4gICAgICAgIGlmIG9iamVjdC5pZD9cbiAgICAgICAgICAgIGlmICFAb2JqZWN0c0J5SWRbb2JqZWN0LmlkXVxuICAgICAgICAgICAgICAgIEBvYmplY3RzQnlJZFtvYmplY3QuaWRdID0gW11cbiAgICAgICAgICAgIEBvYmplY3RzQnlJZFtvYmplY3QuaWRdLnB1c2gob2JqZWN0KVxuICAgICAgICAgICAgIyBGSVhNRTogU2hvdWxkIGJlIGhhbmRsZWQgYnkgVWlNYW5hZ2VyIHNpbmNlIGl0IGlzIFVJIHNwZWNpZmljLlxuICAgICAgICAgICAgd2luZG93W1wiJFwiK29iamVjdC5pZF0gPSBvYmplY3RcbiAgICAgICAgICAgIG9iamVjdC5tYW5hZ2VyID0gdGhpc1xuICAgIFxuICAgICMjIypcbiAgICAqIFVucmVnaXN0ZXJzIGFuIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVucmVnaXN0ZXJPYmplY3RcbiAgICAjIyMgICAgICAgIFxuICAgIHVucmVnaXN0ZXJPYmplY3Q6IChvYmplY3QpIC0+XG4gICAgICAgIGlmIG9iamVjdD8uaWQ/XG4gICAgICAgICAgICBvYmplY3RzID0gQG9iamVjdHNCeUlkW29iamVjdC5pZF1cbiAgICAgICAgICAgIGlmIG9iamVjdHNcbiAgICAgICAgICAgICAgICBvYmplY3RzLnJlbW92ZShvYmplY3QpXG4gICAgICAgICAgICAgICAgaWYgb2JqZWN0cy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvd1tcIiRcIitvYmplY3QuaWRdID0gb2JqZWN0cy5sYXN0KClcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3dbXCIkXCIrb2JqZWN0LmlkXVxuICAgICAgICAgICAgb2JqZWN0Lm1hbmFnZXIgPSBudWxsXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBhIGdhbWUgb2JqZWN0IHRvIHRoZSBtYW5hZ2VyLiBUaGUgZ2FtZSBvYmplY3QgaXMgdGhlbiBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgYnkgdGhlIG1hbmFnZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBhZGRPYmplY3RcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBhZGQuXG4gICAgIyMjICAgICAgICBcbiAgICBhZGRPYmplY3Q6IChvYmplY3QpIC0+IEBhZGQob2JqZWN0KVxuICAgIFxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgYSBnYW1lIG9iamVjdCB0byB0aGUgbWFuYWdlci4gVGhlIGdhbWUgb2JqZWN0IGlzIHRoZW4gbm8gbG9uZ2VyIGF1dG9tYXRpY2FsbHkgdXBkYXRlZCBvciBkaXNwb3NlZCBieSB0aGUgbWFuYWdlci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlbW92ZU9iamVjdFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHJlbW92ZS5cbiAgICAjIyMgICAgICAgIFxuICAgIHJlbW92ZU9iamVjdDogKG9iamVjdCkgLT4gQHJlbW92ZShvYmplY3QpXG4gICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBhIGdhbWUgb2JqZWN0IHRvIHRoZSBtYW5hZ2VyLiBUaGUgZ2FtZSBvYmplY3QgaXMgdGhlbiBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgYnkgdGhlIG1hbmFnZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCBhZGRcbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2V9IG9iamVjdCAtIFRoZSBnYW1lIG9iamVjdCB0byBhZGQuXG4gICAgIyMjIFxuICAgIGFkZDogKG9iamVjdCkgLT4gXG4gICAgICAgICNAb2JqZWN0cy5zcGxpY2UoMCwgMCwgb2JqZWN0KVxuICAgICAgICBAb2JqZWN0cy5wdXNoKG9iamVjdClcbiAgICAgICAgQG5lZWRzU29ydCA9IHllc1xuICAgICAgICBAcmVnaXN0ZXJPYmplY3Qob2JqZWN0KVxuICAgICAgICBAYWRkVG9Hcm91cChvYmplY3QsIG9iamVjdC5ncm91cClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogUmVtb3ZlcyBhIGdhbWUgb2JqZWN0IHRvIHRoZSBtYW5hZ2VyLiBUaGUgZ2FtZSBvYmplY3QgaXMgdGhlbiBubyBsb25nZXIgYXV0b21hdGljYWxseSB1cGRhdGVkIG9yIGRpc3Bvc2VkIGJ5IHRoZSBtYW5hZ2VyLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBvYmplY3QgLSBUaGUgZ2FtZSBvYmplY3QgdG8gcmVtb3ZlLlxuICAgICMjIyBcbiAgICByZW1vdmU6IChvYmplY3QpIC0+IFxuICAgICAgICBpZiBvYmplY3RcbiAgICAgICAgICAgIEBvYmplY3RzLnJlbW92ZShvYmplY3QpXG4gICAgICAgICAgICBAdW5yZWdpc3Rlck9iamVjdChvYmplY3QpXG4gICAgICAgICAgICBpZiBvYmplY3QuZ3JvdXA/XG4gICAgICAgICAgICAgICAgQG9iamVjdHNCeUdyb3VwW29iamVjdC5ncm91cF0/LnJlbW92ZShvYmplY3QpXG4gICAgXG4gICAgIyMjKlxuICAgICogR2V0cyBhbiBvYmplY3QgYnkgSUQuXG4gICAgKlxuICAgICogQG1ldGhvZCBvYmplY3RCeUlkXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgSUQgb2YgdGhlIGdhbWUgb2JqZWN0IHRvIGdldC4gXG4gICAgKiBAcmV0dXJuIHtncy5PYmplY3RfQmFzZX0gVGhlIGdhbWUgb2JqZWN0IG9yIDxiPm51bGw8L2I+IGlmIG5vIGdhbWUgb2JqZWN0IGlzIHJlZ2lzdGVyZWQgZm9yIHRoZSBzcGVjaWZpZWQgSUQuXG4gICAgIyMjICAgICAgICAgXG4gICAgb2JqZWN0QnlJZDogKGlkKSAtPiBAb2JqZWN0c0J5SWRbaWRdPy5sYXN0KClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIGFuIG9iamVjdCBieSBJRC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGJ5SWRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBJRCBvZiB0aGUgZ2FtZSBvYmplY3QgdG8gZ2V0LiBcbiAgICAqIEByZXR1cm4ge2dzLk9iamVjdF9CYXNlfSBUaGUgZ2FtZSBvYmplY3Qgb3IgPGI+bnVsbDwvYj4gaWYgbm8gZ2FtZSBvYmplY3QgaXMgcmVnaXN0ZXJlZCBmb3IgdGhlIHNwZWNpZmllZCBJRC5cbiAgICAjIyMgXG4gICAgYnlJZDogKGlkKSAtPiBAb2JqZWN0c0J5SWRbaWRdPy5sYXN0KClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSBvYmplY3QgZm9yIGFuIElELlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0T2JqZWN0QnlJZFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIHNldC5cbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBJRCBmb3IgdGhlIGdhbWUgb2JqZWN0LiBcbiAgICAjIyMgXG4gICAgc2V0T2JqZWN0QnlJZDogKG9iamVjdCwgaWQpIC0+IFxuICAgICAgICBpZiAhaWQgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIG9iamVjdC5pZCA9IGlkXG4gICAgICAgIGlmICFAb2JqZWN0c0J5SWRbaWRdXG4gICAgICAgICAgICBAb2JqZWN0c0J5SWRbaWRdID0gW29iamVjdF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG9iamVjdHNCeUlkW2lkXS5wdXNoKG9iamVjdClcbiAgICAgICAgICAgIFxuICAgICAgICB3aW5kb3dbXCIkXCIraWRdID0gb2JqZWN0XG4gICAgXG4gICAgIyMjKlxuICAgICogQWRkcyBhbiBvYmplY3QgdG8gYSBzcGVjaWZpZWQgb2JqZWN0LWdyb3VwLlxuICAgICpcbiAgICAqIEBtZXRob2QgYWRkVG9Hcm91cFxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gb2JqZWN0IC0gVGhlIGdhbWUgb2JqZWN0IHRvIGFkZC5cbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cCAtIFRoZSBncm91cCB0byBhc3NpZ24gZ2FtZSBvYmplY3QgdG8uIFxuICAgICMjIyBcbiAgICBhZGRUb0dyb3VwOiAob2JqZWN0LCBncm91cCkgLT5cbiAgICAgICAgaWYgZ3JvdXA/XG4gICAgICAgICAgICBAb2JqZWN0c0J5R3JvdXBfW29iamVjdC5ncm91cF0/LnJlbW92ZShvYmplY3QpXG4gICAgICAgICAgICBpZiAhQG9iamVjdHNCeUdyb3VwX1tncm91cF1cbiAgICAgICAgICAgICAgICBAb2JqZWN0c0J5R3JvdXBfW2dyb3VwXSA9IFtdXG4gICAgICAgICAgICBAb2JqZWN0c0J5R3JvdXBfW2dyb3VwXS5wdXNoKG9iamVjdClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBHZXRzIGFsbCBvYmplY3Qgb2YgYSBzcGVjaWZpZWQgb2JqZWN0LWdyb3VwLlxuICAgICpcbiAgICAqIEBtZXRob2Qgb2JqZWN0c0J5R3JvdXBcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cCAtIFRoZSBvYmplY3QtZ3JvdXAuXG4gICAgKiBAcmV0dXJuIHtncy5PYmplY3RfQmFzZVtdfSBUaGUgZ2FtZSBvYmplY3RzIGJlbG9uZ2luZyB0byB0aGUgc3BlY2lmaWVkIGdyb3VwLlxuICAgICMjIyAgICAgICAgIFxuICAgIG9iamVjdHNCeUdyb3VwOiAoZ3JvdXApIC0+IEBvYmplY3RzQnlHcm91cF9bZ3JvdXBdIHx8IFtdXG4gICAgXG4gICAgXG4gICAgcHVzaE1vZGFsU2Vzc2lvbjogLT4gQGlucHV0U2Vzc2lvbiArPSAxXG4gICAgcG9wTW9kYWxTZXNzaW9uOiAtPiBAaW5wdXRTZXNzaW9uIC09IDFcbiAgICBzZXRNb2RhbFNlc3Npb246IChpZCkgLT4gQGlucHV0U2Vzc2lvbiA9IGlkXG4gICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgbWFuYWdlciBhbmQgYWxsIGFzc2lnbmVkIGdhbWUgb2JqZWN0cyBpbiB0aGUgcmlnaHQgb3JkZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgIFxuICAgIHVwZGF0ZTogLT4gXG4gICAgICAgIGkgPSAwXG4gICAgICAgIFxuICAgICAgICBpZiBAbmVlZHNTb3J0XG4gICAgICAgICAgICBAb2JqZWN0cy5zb3J0IChhLCBiKSAtPlxuICAgICAgICAgICAgICAgIGlmIGEub3JkZXIgPCBiLm9yZGVyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBhLm9yZGVyID4gYi5vcmRlclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgICBAbmVlZHNTb3J0ID0gbm9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgd2hpbGUgaSA8IEBvYmplY3RzLmxlbmd0aFxuICAgICAgICAgICAgb2JqZWN0ID0gQG9iamVjdHNbaV1cbiAgICAgICAgICAgIGlmIG9iamVjdC5kaXNwb3NlZFxuICAgICAgICAgICAgICAgIEByZW1vdmVPYmplY3Qob2JqZWN0KVxuICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICBvYmplY3QudXBkYXRlKCkgaWYgb2JqZWN0LmFjdGl2ZVxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuZ3MuT2JqZWN0TWFuYWdlciA9IE9iamVjdE1hbmFnZXIgI25ldyBPYmplY3RNYW5hZ2VyKCkiXX0=
//# sourceURL=ObjectManager_8.js