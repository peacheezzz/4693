var Object_Base;

Object_Base = (function() {

  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */
  Object_Base.prototype.onDataBundleRestore = function(data, context) {
    if (this.id) {
      return window["$" + this.id] = this;
    }
  };

  Object_Base.accessors("group", {
    set: function(g) {
      var ref;
      this.group_ = g;
      return (ref = gs.ObjectManager.current) != null ? ref.addToGroup(this, g) : void 0;
    },
    get: function() {
      return this.group_;
    }
  });

  Object_Base.accessors("order", {
    set: function(o) {
      var ref;
      if (o !== this.order_) {
        this.order_ = o;
        return (ref = this.parent) != null ? ref.needsSort = true : void 0;
      }
    },
    get: function() {
      return this.order_;
    }
  });

  Object_Base.accessors("needsUpdate", {
    set: function(v) {
      var parent;
      this.needsUpdate_ = v;
      parent = this.parent;
      while (parent) {
        parent.needsUpdate_ = true;
        parent = parent.parent;
      }
      if (v) {
        return this.requestSubUpdate();
      }
    },
    get: function() {
      return this.needsUpdate_ || SceneManager.scene.preparing;
    }
  });

  Object_Base.prototype.requestSubUpdate = function() {
    var j, len, object, ref;
    ref = this.subObjects;
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      if (object) {
        object.needsUpdate_ = true;
        object.requestSubUpdate();
      }
    }
    return null;
  };

  Object_Base.accessors("needsFullUpdate", {
    set: function(v) {
      var j, len, object, ref, results;
      this.needsUpdate = v;
      if (v) {
        ref = this.subObjects;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          object = ref[j];
          results.push(object.needsFullUpdate = v);
        }
        return results;
      }
    },
    get: function() {
      return this.needsUpdate_;
    }
  });


  /**
  * The base class for all game objects. A game object itself doesn't implement
  * any game logic but uses components and sub-objects for that.
  *
  * @module gs
  * @class Object_Base
  * @memberof gs
  * @constructor
   */

  function Object_Base() {

    /**
    * @property subObjects
    * @type gs.Object_Base[]
    * @default []
    * A list of game-objects grouped under this game object.
     */
    var ref, ref1, ref2;
    this.subObjects = [];

    /**
    * @property components
    * @type gs.Component[]
    * @default []
    * A list of components defining the logic/behavior and appearance of the game object.
     */
    this.components = [];

    /**
    * @property componentsById
    * @type Object
    * @default []
    * All associated components by their ID.
     */
    this.componentsById = {};

    /**
    * @property disposed
    * @type boolean
    * @default false
    * Indicates if the game object id disposed. A disposed game object cannot be used anymore.
     */
    this.disposed = false;

    /**
    * @property active
    * @default true
    * Indicates if the game object is active. An inactive game object will not be updated.
     */
    this.active = true;
    this.inputSession = (ref = (ref1 = gs.ObjectManager.current) != null ? ref1.inputSession : void 0) != null ? ref : 0;
    this.input = false;

    /**
    * @property id
    * @type string
    * @default null
    * The game object's UID (Unique ID)
     */
    this.id = null;

    /**
    * @property group
    * @default null
    * @type string
    * The game object's group. To get all object's of a specific group the gs.ObjectManager.objectsByGroup property can be used.
     */
    this.group = null;

    /**
    * @property parent
    * @type gs.Object_Base
    * @default null
    * The parent object if the game object is a sub-object of another game object.
     */
    this.parent = null;

    /**
    * @property order
    * @type number
    * @default 0
    * Controls the update-order. The smaller the value the earlier the game object is updated before other game objects are updated.
     */
    this.order = 0;

    /**
    * @property rIndex
    * @type number
    * @default 0
    * Holds the render-index if the game object has a graphical representation on screen. The render-index is the
    * index of the game object's graphic-object(gs.GraphicObject) in the current list of graphic-objects. The render-index
    * is read-only. Setting the render-index to a certain value has no effect.
     */
    this.rIndex = 0;

    /**
    * @property needsSort
    * @type boolean
    * @default true
    * Indicates if the list of sub-objects needs to be sorted by order because of a change.
     */
    this.needsSort = true;

    /**
    * @property needsSort
    * @type boolean
    * @default true
    * Indicates if the UI object needs to be updated.
     */
    this.needsUpdate = true;

    /**
    * @property initialized
    * @type boolean
    * @default true
    * Indicates if the game object and its components have been initialized.
     */
    this.initialized = false;

    /**
    * @property customData
    * @type Object
    * @default {}
    * A custom data object which can be used to add any custom data/fields to the game
    * object. It is an empty object by default.
     */
    this.customData = {};
    this.manager = null;
    if ((ref2 = gs.ObjectManager.current) != null) {
      ref2.registerObject(this);
    }
  }

  Object_Base.prototype.canReceiveInput = function() {
    return this.inputSession >= gs.ObjectManager.current.inputSession;
  };


  /**
  * Disposes the object with all its components and sub-objects. A disposed object will be
  * removed from the parent automatically.
  *
  * @method dispose
   */

  Object_Base.prototype.dispose = function() {
    var ref;
    if (!this.disposed) {
      this.disposed = true;
      this.disposeComponents();
      this.disposeObjects();
      if ((ref = gs.ObjectManager.current) != null) {
        ref.unregisterObject(this);
      }
    }
    return null;
  };


  /**
  * Disposes all sub-objects.
  *
  * @method disposeObjects
  * @protected
   */

  Object_Base.prototype.disposeObjects = function() {
    var j, len, ref, results, subObject;
    ref = this.subObjects;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      subObject = ref[j];
      results.push(subObject != null ? typeof subObject.dispose === "function" ? subObject.dispose() : void 0 : void 0);
    }
    return results;
  };


  /**
  * Disposes all components
  *
  * @method disposeComponents
  * @protected
   */

  Object_Base.prototype.disposeComponents = function() {
    var component, j, len, ref, results;
    ref = this.components;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      component = ref[j];
      results.push(component != null ? typeof component.dispose === "function" ? component.dispose() : void 0 : void 0);
    }
    return results;
  };


  /**
  * Calls setup-routine on all components.
  *
  * @method setup
   */

  Object_Base.prototype.setup = function() {
    var component, j, len, ref;
    ref = this.components;
    for (j = 0, len = ref.length; j < len; j++) {
      component = ref[j];
      if (!(component != null ? component.isSetup : void 0)) {
        component.setup();
      }
    }
    this.initialized = true;
    return null;
  };


  /**
  * Deserializes components from a data-bundle object.
  * 
  * @method componentsFromDataBundle
  * @param {Object} data The data-bundle object.
   */

  Object_Base.prototype.componentsFromDataBundle = function(data) {
    var component, componentObject, j, len, ref;
    if (data != null ? data.components : void 0) {
      ref = data.components;
      for (j = 0, len = ref.length; j < len; j++) {
        component = ref[j];
        componentObject = new gs[component.className](component);
        this.addComponent(componentObject);
      }
      delete data.components;
    }
    return null;
  };


  /**
  * Serializes components of a specified type to a data-bundle. A component
  * needs to implement the toDataBundle method for correct serialization.
  *
  * @method componentsToDataBundle
  * @param {String} type - A component class name.
  * @return A data bundle.
   */

  Object_Base.prototype.componentsToDataBundle = function(type) {
    var bundle, component, components, j, len, ref;
    components = [];
    ref = this.components;
    for (j = 0, len = ref.length; j < len; j++) {
      component = ref[j];
      if (component instanceof type) {
        if (component.toDataBundle == null) {
          continue;
        }
        bundle = component.toDataBundle();
        bundle.className = component.constructor.name;
        components.push(bundle);
      }
    }
    return components;
  };


  /**
  * Starts a full-refresh on all sub-objects
  *
  * @method fullRefresh
   */

  Object_Base.prototype.fullRefresh = function() {
    var j, len, object, ref;
    ref = this.subObjects;
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      if (object) {
        object.needsUpdate = true;
        object.fullRefresh();
      }
    }
    return null;
  };


  /**
  * Updates the object with all parent- and sub-objects. 
  *
  * @method fullUpdate
   */

  Object_Base.prototype.fullUpdate = function() {
    var j, len, object, parent, ref, results;
    parent = this;
    while (parent !== null) {
      parent.update();
      parent = parent.parent;
    }
    ref = this.subObjects;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      results.push(object != null ? object.update() : void 0);
    }
    return results;
  };


  /**
  * Updates the object and all its components. This method is
  * called automatically by the parent or ObjectManager so in regular it is 
  * not necessary to call it manually.
  *
  * @method update
   */

  Object_Base.prototype.update = function() {
    var component, i;
    if (!this.active) {
      return;
    }
    i = 0;
    while (i < this.components.length) {
      component = this.components[i];
      component.object = this;
      if (!component.disposed) {
        component.update();
        i++;
      } else {
        this.components.splice(i, 1);
      }
    }
    if (this.input) {
      Input.clear();
    }
    this.input = false;
    return null;
  };


  /**
  * Searches for the first component with the specified class name.
  *
  * @method findComponent
  * @param {String} name The class name of the component.
  * @return {Component} The component or null if a component with the specified class name cannot be found.
   */

  Object_Base.prototype.findComponent = function(name) {
    return this.components.first(function(v) {
      return v.constructor.name === name;
    });
  };


  /**
  * Searches for all components with the specified class name.
  *
  * @method findComponents
  * @param {String} name The class name of the components.
  * @return {Array} The components or null if no component with the specified class name has been found.
   */

  Object_Base.prototype.findComponents = function(name) {
    return this.components.where(function(v) {
      return v.constructor.name === name;
    });
  };


  /**
  * Searches for the component with the specified ID.
  *
  * @method findComponentById
  * @param {String} id The unique identifier of the component.
  * @return {Component} The component or null if a component with the specified ID cannot be found.
   */

  Object_Base.prototype.findComponentById = function(id) {
    return this.componentsById[id];
  };


  /**
  * Searches for the component with the specified name. If multiple components have the
  * same name, it will return the first match.
  *
  * @method findComponentByName
  * @param {String} name The name of the component to find.
  * @return {Component} The component or null if a component with the specified name cannot be found.
   */

  Object_Base.prototype.findComponentByName = function(name) {
    return this.components.first(function(v) {
      return v.name === name;
    });
  };


  /**
  * Searches for components with the specified name.
  *
  * @method findComponentsByName
  * @param {String} name The name of the components to find.
  * @return {Component[]} An array of components matching the specified name or null if no components with the specified name exist.
   */

  Object_Base.prototype.findComponentsByName = function(name) {
    return this.components.where(function(v) {
      return v.name === name;
    });
  };


  /**
  * Adds an object to the list of sub-objects.
  *
  * @method addObject
  * @param {Object_Base} object The object which should be added.
   */

  Object_Base.prototype.addObject = function(object) {
    var ref, ref1;
    if ((ref = gs.ObjectManager.current) != null) {
      ref.remove(object);
    }
    if ((ref1 = object.parent) != null) {
      ref1.removeObject(object);
    }
    object.parent = this;
    this.subObjects.push(object);
    this.needsSort = true;
    this.needsUpdate = true;
    if (object.id != null) {
      return gs.ObjectManager.current.setObjectById(object, object.id);
    }
  };


  /**
  * Inserts an object into the list of sub-objects at the specified index.
  *
  * @method insertObject
  * @param {Object_Base} object The object which should be inserted.
  * @param {Number} index The index.
   */

  Object_Base.prototype.insertObject = function(object, index) {
    var ref;
    gs.ObjectManager.current.remove(object);
    if ((ref = object.parent) != null) {
      ref.removeObject(object);
    }
    object.parent = this;
    this.subObjects.splice(index, 0, object);
    if (object.id != null) {
      return gs.ObjectManager.current.setObjectById(object, object.id);
    }
  };


  /**
  * Sets sub-object at the specified index.
  *
  * @method setObject
  * @param {Object_Base} object The object.
  * @param {Number} index The index.
   */

  Object_Base.prototype.setObject = function(object, index) {
    var ref;
    if (object) {
      gs.ObjectManager.current.remove(object);
      if ((ref = object.parent) != null) {
        ref.removeObject(object);
      }
      object.parent = this;
    }
    this.subObjects[index] = object;
    if ((object != null ? object.id : void 0) != null) {
      return gs.ObjectManager.current.setObjectById(object, object.id);
    }
  };


  /**
  * Removes the specified object from the list of sub-objects.
  *
  * @method removeObject
  * @param {Object_Base} object The object which should be removed.
   */

  Object_Base.prototype.removeObject = function(object) {
    this.subObjects.remove(object);
    object.parent = null;
    return this.needsUpdate = true;
  };


  /**
  * Removes the object at the specified index from the list of sub-objects.
  *
  * @method removeObjectAt
  * @param {number} index The index of the objec to remove.
   */

  Object_Base.prototype.removeObjectAt = function(index) {
    var object;
    object = this.subObjects[index];
    this.subObjects.splice(index, 1);
    object.parent = null;
    return this.needsUpdate = true;
  };


  /**
  * Removes all sub-objects.
  *
  * @method removeAllObjects
   */

  Object_Base.prototype.removeAllObjects = function() {
    var results;
    results = [];
    while (this.subObjects.length > 0) {
      results.push(this.removeObjectAt(0));
    }
    return results;
  };


  /**
  * Erases the object at the specified index. The list size
  * will not be changed but the the value at the index will be set to null.
  *
  * @method eraseObject
  * @param {Number} object The object which should be erased.
   */

  Object_Base.prototype.eraseObject = function(index) {
    var object;
    object = this.subObjects[index];
    if (object != null) {
      object.parent = null;
    }
    return this.subObjects[index] = null;
  };


  /**
  * Adds the specified component to the object.
  *
  * @method addComponent
  * @param {Component} component The component
  * @param {String} id An optional unique identifier for the component.
   */

  Object_Base.prototype.addComponent = function(component, id) {
    if (!this.components.contains(component)) {
      component.object = this;
      this.components.push(component);
      if (id != null) {
        return this.componentsById[id] = component;
      }
    }
  };


  /**
  * Inserts a component at the specified index.
  *
  * @method insertComponent
  * @param {Component} component The component.
  * @param {Number} index The index.
  * @param {String} id An optional unique identifier for the component.
   */

  Object_Base.prototype.insertComponent = function(component, index, id) {
    this.components.remove(component);
    component.object = this;
    this.components.splice(index, 0, component);
    if (id != null) {
      return this.componentsById[id] = component;
    }
  };


  /**
  * Removes a component from the object.
  *
  * @method removeComponent
  * @param {Component} component The component to remove.
   */

  Object_Base.prototype.removeComponent = function(component) {
    this.components.remove(component);
    if (typeof id !== "undefined" && id !== null) {
      return delete this.componentsById[id];
    }
  };

  return Object_Base;

})();

gs.Object_Base = Object_Base;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7O3dCQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7SUFDakIsSUFBRyxJQUFDLENBQUEsRUFBSjthQUNJLE1BQU8sQ0FBQSxHQUFBLEdBQUksSUFBQyxDQUFBLEVBQUwsQ0FBUCxHQUFrQixLQUR0Qjs7RUFEaUI7O0VBV3JCLFdBQUMsQ0FBQSxTQUFELENBQVcsT0FBWCxFQUNJO0lBQUEsR0FBQSxFQUFLLFNBQUMsQ0FBRDtBQUNELFVBQUE7TUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVOzJEQUNjLENBQUUsVUFBMUIsQ0FBcUMsSUFBckMsRUFBMkMsQ0FBM0M7SUFGQyxDQUFMO0lBSUEsR0FBQSxFQUFLLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSixDQUpMO0dBREo7O0VBY0EsV0FBQyxDQUFBLFNBQUQsQ0FBVyxPQUFYLEVBQ0k7SUFBQSxHQUFBLEVBQUssU0FBQyxDQUFEO0FBQ0QsVUFBQTtNQUFBLElBQUcsQ0FBQSxLQUFLLElBQUMsQ0FBQSxNQUFUO1FBQ0ksSUFBQyxDQUFBLE1BQUQsR0FBVTtnREFDSCxDQUFFLFNBQVQsR0FBcUIsY0FGekI7O0lBREMsQ0FBTDtJQUlBLEdBQUEsRUFBSyxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0FKTDtHQURKOztFQWVBLFdBQUMsQ0FBQSxTQUFELENBQVcsYUFBWCxFQUNJO0lBQUEsR0FBQSxFQUFLLFNBQUMsQ0FBRDtBQUNELFVBQUE7TUFBQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtNQUVoQixNQUFBLEdBQVMsSUFBQyxDQUFBO0FBQ1YsYUFBTSxNQUFOO1FBQ0ksTUFBTSxDQUFDLFlBQVAsR0FBc0I7UUFDdEIsTUFBQSxHQUFTLE1BQU0sQ0FBQztNQUZwQjtNQVNBLElBQUcsQ0FBSDtlQUNJLElBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBREo7O0lBYkMs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LEdBQXFCO0VBSFo7OztBQUtiOzs7Ozs7Ozt3QkFPQSxZQUFBLEdBQWMsU0FBQyxTQUFELEVBQVksRUFBWjtJQUNWLElBQUcsQ0FBSSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBcUIsU0FBckIsQ0FBUDtNQUNJLFNBQVMsQ0FBQyxNQUFWLEdBQW1CO01BQ25CLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixTQUFqQjtNQUNBLElBQUcsVUFBSDtlQUNJLElBQUMsQ0FBQSxjQUFlLENBQUEsRUFBQSxDQUFoQixHQUFzQixVQUQxQjtPQUhKOztFQURVOzs7QUFNZDs7Ozs7Ozs7O3dCQVFBLGVBQUEsR0FBaUIsU0FBQyxTQUFELEVBQVksS0FBWixFQUFtQixFQUFuQjtJQUNiLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixTQUFuQjtJQUNBLFNBQVMsQ0FBQyxNQUFWLEdBQW1CO0lBQ25CLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixLQUFuQixFQUEwQixDQUExQixFQUE2QixTQUE3QjtJQUNBLElBQUcsVUFBSDthQUNJLElBQUMsQ0FBQSxjQUFlLENBQUEsRUFBQSxDQUFoQixHQUFzQixVQUQxQjs7RUFKYTs7O0FBT2pCOzs7Ozs7O3dCQU1BLGVBQUEsR0FBaUIsU0FBQyxTQUFEO0lBQ2IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLFNBQW5CO0lBQ0EsSUFBRyx3Q0FBSDthQUNJLE9BQU8sSUFBQyxDQUFBLGNBQWUsQ0FBQSxFQUFBLEVBRDNCOztFQUZhOzs7Ozs7QUFLckIsRUFBRSxDQUFDLFdBQUgsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9CYXNlXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBPYmplY3RfQmFzZVxuICAgICMjIypcbiAgICAqIENhbGxlZCBpZiB0aGlzIG9iamVjdCBpbnN0YW5jZSBpcyByZXN0b3JlZCBmcm9tIGEgZGF0YS1idW5kbGUuIEl0IGNhbiBiZSB1c2VkXG4gICAgKiByZS1hc3NpZ24gZXZlbnQtaGFuZGxlciwgYW5vbnltb3VzIGZ1bmN0aW9ucywgZXRjLlxuICAgICogXG4gICAgKiBAbWV0aG9kIG9uRGF0YUJ1bmRsZVJlc3RvcmUuXG4gICAgKiBAcGFyYW0gT2JqZWN0IGRhdGEgLSBUaGUgZGF0YS1idW5kbGVcbiAgICAqIEBwYXJhbSBncy5PYmplY3RDb2RlY0NvbnRleHQgY29udGV4dCAtIFRoZSBjb2RlYy1jb250ZXh0LlxuICAgICMjI1xuICAgIG9uRGF0YUJ1bmRsZVJlc3RvcmU6IChkYXRhLCBjb250ZXh0KSAtPlxuICAgICAgICBpZiBAaWRcbiAgICAgICAgICAgIHdpbmRvd1tcIiRcIitAaWRdID0gdGhpc1xuICAgICAgICAgICAgXG4gICAgXG4gICAgI1xuICAgICMgR2V0cyBvciBzZXRzIHRoZSBncm91cCB0aGUgb2JqZWN0IGJlbG9uZ3MgdG8uXG4gICAgI1xuICAgICMgQHByb3BlcnR5IGdyb3VwXG4gICAgIyBAdHlwZSBzdHJpbmdcbiAgICAjXG4gICAgQGFjY2Vzc29ycyBcImdyb3VwXCIsIFxuICAgICAgICBzZXQ6IChnKSAtPiBcbiAgICAgICAgICAgIEBncm91cF8gPSBnXG4gICAgICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQ/LmFkZFRvR3JvdXAodGhpcywgZylcbiAgICAgICAgICAgIFxuICAgICAgICBnZXQ6IC0+IEBncm91cF9cbiAgICAgICAgXG4gICAgI1xuICAgICMgR2V0cyBvciBzZXRzIHRoZSBvcmRlci1pbmRleCBvZiB0aGUgb2JqZWN0LiBUaGUgbG93ZXIgdGhlIGluZGV4LCB0aGVcbiAgICAjIGVhcmxpZXIgdGhlIG9iamVjdCB3aWxsIGJlIHVwZGF0ZWQgaW4gYSBsaXN0IG9mIHN1Yi1vYmplY3RzLlxuICAgICNcbiAgICAjIEBwcm9wZXJ0eSBvcmRlclxuICAgICMgQHR5cGUgbnVtYmVyXG4gICAgI1xuICAgIEBhY2Nlc3NvcnMgXCJvcmRlclwiLFxuICAgICAgICBzZXQ6IChvKSAtPlxuICAgICAgICAgICAgaWYgbyAhPSBAb3JkZXJfXG4gICAgICAgICAgICAgICAgQG9yZGVyXyA9IG9cbiAgICAgICAgICAgICAgICBAcGFyZW50Py5uZWVkc1NvcnQgPSB0cnVlXG4gICAgICAgIGdldDogLT4gQG9yZGVyX1xuICAgICAgICBcbiAgICAjXG4gICAgIyBHZXRzIG9yIHNldHMgaWYgYW4gb2JqZWN0cyBuZWVkcyBhbiB1cGRhdGUuIElmIHRydWUsIHRoZSBwYXJlbnQgd2lsbCB1cGRhdGVcbiAgICAjIHRoZSBvYmplY3QgaW4gdGhlIG5leHQgdXBkYXRlIGFuZCByZXNldHMgdGhlIG5lZWRzVXBkYXRlIHByb3BlcnR5IGJhY2tcbiAgICAjIHRvIGZhbHNlLlxuICAgICNcbiAgICAjIEBwcm9wZXJ0eSBuZWVkc1VwZGF0ZVxuICAgICMgQHR5cGUgYm9vbGVhblxuICAgICNcbiAgICBAYWNjZXNzb3JzIFwibmVlZHNVcGRhdGVcIiwgXG4gICAgICAgIHNldDogKHYpIC0+XG4gICAgICAgICAgICBAbmVlZHNVcGRhdGVfID0gdlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwYXJlbnQgPSBAcGFyZW50XG4gICAgICAgICAgICB3aGlsZSBwYXJlbnRcbiAgICAgICAgICAgICAgICBwYXJlbnQubmVlZHNVcGRhdGVfID0geWVzXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgI2lmIHZcbiAgICAgICAgICAgICMgICAgQHBhcmVudD8ubmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgICAgICNpZiB2XG4gICAgICAgICAgICAjICAgIGZvciBvYmplY3QgaW4gQHN1Yk9iamVjdHNcbiAgICAgICAgICAgICMgICAgICAgIG9iamVjdC5uZWVkc1VwZGF0ZV8gPSB2XG4gICAgICAgICAgICBpZiB2XG4gICAgICAgICAgICAgICAgQHJlcXVlc3RTdWJVcGRhdGUoKVxuICAgICAgICBnZXQ6IC0+IHJldHVybiBAbmVlZHNVcGRhdGVfIHx8IFNjZW5lTWFuYWdlci5zY2VuZS5wcmVwYXJpbmdcbiAgICAgICAgXG4gICAgcmVxdWVzdFN1YlVwZGF0ZTogLT5cbiAgICAgICAgZm9yIG9iamVjdCBpbiBAc3ViT2JqZWN0c1xuICAgICAgICAgICAgaWYgb2JqZWN0XG4gICAgICAgICAgICAgICAgb2JqZWN0Lm5lZWRzVXBkYXRlXyA9IHllc1xuICAgICAgICAgICAgICAgIG9iamVjdC5yZXF1ZXN0U3ViVXBkYXRlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAjXG4gICAgIyBHZXRzIG9yIHNldHMgaWYgYW4gb2JqZWN0IG5lZWRzIGEgZnVsbCB1cGRhdGUuIEEgZnVsbCB1cGRhdGUgdHJpZ2dlcnNcbiAgICAjIGFuIHVwZGF0ZSBmb3IgYWxsIHN1Yi1vYmplY3RzIHJlY3Vyc2l2ZWx5LiBcbiAgICAjXG4gICAgIyBAcHJvcGVydHkgbmVlZHNGdWxsVXBkYXRlXG4gICAgIyBAdHlwZSBib29sZWFuXG4gICAgI1xuICAgIEBhY2Nlc3NvcnMgXCJuZWVkc0Z1bGxVcGRhdGVcIiwgXG4gICAgICAgIHNldDogKHYpIC0+XG4gICAgICAgICAgICBAbmVlZHNVcGRhdGUgPSB2XG4gICAgICAgICAgICBpZiB2XG4gICAgICAgICAgICAgICAgZm9yIG9iamVjdCBpbiBAc3ViT2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICBvYmplY3QubmVlZHNGdWxsVXBkYXRlID0gdlxuICAgICAgICBnZXQ6IC0+IEBuZWVkc1VwZGF0ZV9cbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFRoZSBiYXNlIGNsYXNzIGZvciBhbGwgZ2FtZSBvYmplY3RzLiBBIGdhbWUgb2JqZWN0IGl0c2VsZiBkb2Vzbid0IGltcGxlbWVudFxuICAgICogYW55IGdhbWUgbG9naWMgYnV0IHVzZXMgY29tcG9uZW50cyBhbmQgc3ViLW9iamVjdHMgZm9yIHRoYXQuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIE9iamVjdF9CYXNlXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IHN1Yk9iamVjdHNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQmFzZVtdXG4gICAgICAgICogQGRlZmF1bHQgW11cbiAgICAgICAgKiBBIGxpc3Qgb2YgZ2FtZS1vYmplY3RzIGdyb3VwZWQgdW5kZXIgdGhpcyBnYW1lIG9iamVjdC5cbiAgICAgICAgIyMjXG4gICAgICAgIEBzdWJPYmplY3RzID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgY29tcG9uZW50c1xuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudFtdXG4gICAgICAgICogQGRlZmF1bHQgW11cbiAgICAgICAgKiBBIGxpc3Qgb2YgY29tcG9uZW50cyBkZWZpbmluZyB0aGUgbG9naWMvYmVoYXZpb3IgYW5kIGFwcGVhcmFuY2Ugb2YgdGhlIGdhbWUgb2JqZWN0LlxuICAgICAgICAjIyNcbiAgICAgICAgQGNvbXBvbmVudHMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb21wb25lbnRzQnlJZFxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBkZWZhdWx0IFtdXG4gICAgICAgICogQWxsIGFzc29jaWF0ZWQgY29tcG9uZW50cyBieSB0aGVpciBJRC5cbiAgICAgICAgIyMjXG4gICAgICAgIEBjb21wb25lbnRzQnlJZCA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGRpc3Bvc2VkXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBnYW1lIG9iamVjdCBpZCBkaXNwb3NlZC4gQSBkaXNwb3NlZCBnYW1lIG9iamVjdCBjYW5ub3QgYmUgdXNlZCBhbnltb3JlLlxuICAgICAgICAjIyNcbiAgICAgICAgQGRpc3Bvc2VkID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgYWN0aXZlXG4gICAgICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgZ2FtZSBvYmplY3QgaXMgYWN0aXZlLiBBbiBpbmFjdGl2ZSBnYW1lIG9iamVjdCB3aWxsIG5vdCBiZSB1cGRhdGVkLlxuICAgICAgICAjIyNcbiAgICAgICAgQGFjdGl2ZSA9IHllc1xuICAgICAgICBAaW5wdXRTZXNzaW9uID0gZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Py5pbnB1dFNlc3Npb24gPyAwXG4gICAgICAgIEBpbnB1dCA9IG5vXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGlkXG4gICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAgICAqIFRoZSBnYW1lIG9iamVjdCdzIFVJRCAoVW5pcXVlIElEKVxuICAgICAgICAjIyNcbiAgICAgICAgQGlkID0gbnVsbCBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgZ3JvdXBcbiAgICAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICogVGhlIGdhbWUgb2JqZWN0J3MgZ3JvdXAuIFRvIGdldCBhbGwgb2JqZWN0J3Mgb2YgYSBzcGVjaWZpYyBncm91cCB0aGUgZ3MuT2JqZWN0TWFuYWdlci5vYmplY3RzQnlHcm91cCBwcm9wZXJ0eSBjYW4gYmUgdXNlZC5cbiAgICAgICAgIyMjXG4gICAgICAgIEBncm91cCA9IG51bGwgXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IHBhcmVudFxuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9CYXNlXG4gICAgICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAgICAqIFRoZSBwYXJlbnQgb2JqZWN0IGlmIHRoZSBnYW1lIG9iamVjdCBpcyBhIHN1Yi1vYmplY3Qgb2YgYW5vdGhlciBnYW1lIG9iamVjdC5cbiAgICAgICAgIyMjXG4gICAgICAgIEBwYXJlbnQgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IG9yZGVyXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQGRlZmF1bHQgMFxuICAgICAgICAqIENvbnRyb2xzIHRoZSB1cGRhdGUtb3JkZXIuIFRoZSBzbWFsbGVyIHRoZSB2YWx1ZSB0aGUgZWFybGllciB0aGUgZ2FtZSBvYmplY3QgaXMgdXBkYXRlZCBiZWZvcmUgb3RoZXIgZ2FtZSBvYmplY3RzIGFyZSB1cGRhdGVkLlxuICAgICAgICAjIyNcbiAgICAgICAgQG9yZGVyID0gMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBySW5kZXhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAZGVmYXVsdCAwXG4gICAgICAgICogSG9sZHMgdGhlIHJlbmRlci1pbmRleCBpZiB0aGUgZ2FtZSBvYmplY3QgaGFzIGEgZ3JhcGhpY2FsIHJlcHJlc2VudGF0aW9uIG9uIHNjcmVlbi4gVGhlIHJlbmRlci1pbmRleCBpcyB0aGVcbiAgICAgICAgKiBpbmRleCBvZiB0aGUgZ2FtZSBvYmplY3QncyBncmFwaGljLW9iamVjdChncy5HcmFwaGljT2JqZWN0KSBpbiB0aGUgY3VycmVudCBsaXN0IG9mIGdyYXBoaWMtb2JqZWN0cy4gVGhlIHJlbmRlci1pbmRleFxuICAgICAgICAqIGlzIHJlYWQtb25seS4gU2V0dGluZyB0aGUgcmVuZGVyLWluZGV4IHRvIGEgY2VydGFpbiB2YWx1ZSBoYXMgbm8gZWZmZWN0LlxuICAgICAgICAjIyNcbiAgICAgICAgQHJJbmRleCA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgbmVlZHNTb3J0XG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIGxpc3Qgb2Ygc3ViLW9iamVjdHMgbmVlZHMgdG8gYmUgc29ydGVkIGJ5IG9yZGVyIGJlY2F1c2Ugb2YgYSBjaGFuZ2UuXG4gICAgICAgICMjI1xuICAgICAgICBAbmVlZHNTb3J0ID0geWVzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IG5lZWRzU29ydFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBVSSBvYmplY3QgbmVlZHMgdG8gYmUgdXBkYXRlZC5cbiAgICAgICAgIyMjXG4gICAgICAgIEBuZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBpbml0aWFsaXplZFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBnYW1lIG9iamVjdCBhbmQgaXRzIGNvbXBvbmVudHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkLlxuICAgICAgICAjIyNcbiAgICAgICAgQGluaXRpYWxpemVkID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgY3VzdG9tRGF0YVxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBkZWZhdWx0IHt9XG4gICAgICAgICogQSBjdXN0b20gZGF0YSBvYmplY3Qgd2hpY2ggY2FuIGJlIHVzZWQgdG8gYWRkIGFueSBjdXN0b20gZGF0YS9maWVsZHMgdG8gdGhlIGdhbWVcbiAgICAgICAgKiBvYmplY3QuIEl0IGlzIGFuIGVtcHR5IG9iamVjdCBieSBkZWZhdWx0LlxuICAgICAgICAjIyNcbiAgICAgICAgQGN1c3RvbURhdGEgPSB7fVxuICAgICAgICBcbiAgICAgICAgQG1hbmFnZXIgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Py5yZWdpc3Rlck9iamVjdCh0aGlzKVxuICAgIFxuICAgIGNhblJlY2VpdmVJbnB1dDogLT4gQGlucHV0U2Vzc2lvbiA+PSBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQuaW5wdXRTZXNzaW9uICAgIFxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBvYmplY3Qgd2l0aCBhbGwgaXRzIGNvbXBvbmVudHMgYW5kIHN1Yi1vYmplY3RzLiBBIGRpc3Bvc2VkIG9iamVjdCB3aWxsIGJlXG4gICAgKiByZW1vdmVkIGZyb20gdGhlIHBhcmVudCBhdXRvbWF0aWNhbGx5LlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjI1xuICAgIGRpc3Bvc2U6IC0+XG4gICAgICAgIGlmIG5vdCBAZGlzcG9zZWRcbiAgICAgICAgICAgIEBkaXNwb3NlZCA9IHllc1xuICAgICAgICAgICAgQGRpc3Bvc2VDb21wb25lbnRzKClcbiAgICAgICAgICAgIEBkaXNwb3NlT2JqZWN0cygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQ/LnVucmVnaXN0ZXJPYmplY3QodGhpcylcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIGFsbCBzdWItb2JqZWN0cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VPYmplY3RzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgZGlzcG9zZU9iamVjdHM6IC0+XG4gICAgICAgIGZvciBzdWJPYmplY3QgaW4gQHN1Yk9iamVjdHNcbiAgICAgICAgICAgIHN1Yk9iamVjdD8uZGlzcG9zZT8oKVxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgYWxsIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VDb21wb25lbnRzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjXG4gICAgZGlzcG9zZUNvbXBvbmVudHM6IC0+XG4gICAgICAgIGZvciBjb21wb25lbnQgaW4gQGNvbXBvbmVudHNcbiAgICAgICAgICAgIGNvbXBvbmVudD8uZGlzcG9zZT8oKVxuICAgICAgIFxuICAgICMjIypcbiAgICAqIENhbGxzIHNldHVwLXJvdXRpbmUgb24gYWxsIGNvbXBvbmVudHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFxuICAgICMjI1xuICAgIHNldHVwOiAtPlxuICAgICAgICBmb3IgY29tcG9uZW50IGluIEBjb21wb25lbnRzXG4gICAgICAgICAgICBjb21wb25lbnQuc2V0dXAoKSBpZiBub3QgY29tcG9uZW50Py5pc1NldHVwXG4gICAgICAgICAgICBcbiAgICAgICAgQGluaXRpYWxpemVkID0geWVzXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIERlc2VyaWFsaXplcyBjb21wb25lbnRzIGZyb20gYSBkYXRhLWJ1bmRsZSBvYmplY3QuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgY29tcG9uZW50c0Zyb21EYXRhQnVuZGxlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZGF0YS1idW5kbGUgb2JqZWN0LlxuICAgICMjI1xuICAgIGNvbXBvbmVudHNGcm9tRGF0YUJ1bmRsZTogKGRhdGEpIC0+XG4gICAgICAgIGlmIGRhdGE/LmNvbXBvbmVudHNcbiAgICAgICAgICAgIGZvciBjb21wb25lbnQgaW4gZGF0YS5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgY29tcG9uZW50T2JqZWN0ID0gbmV3IGdzW2NvbXBvbmVudC5jbGFzc05hbWVdKGNvbXBvbmVudClcbiAgICAgICAgICAgICAgICBAYWRkQ29tcG9uZW50KGNvbXBvbmVudE9iamVjdClcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyBjb21wb25lbnRzIG9mIGEgc3BlY2lmaWVkIHR5cGUgdG8gYSBkYXRhLWJ1bmRsZS4gQSBjb21wb25lbnRcbiAgICAqIG5lZWRzIHRvIGltcGxlbWVudCB0aGUgdG9EYXRhQnVuZGxlIG1ldGhvZCBmb3IgY29ycmVjdCBzZXJpYWxpemF0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgY29tcG9uZW50c1RvRGF0YUJ1bmRsZVxuICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgLSBBIGNvbXBvbmVudCBjbGFzcyBuYW1lLlxuICAgICogQHJldHVybiBBIGRhdGEgYnVuZGxlLlxuICAgICMjI1xuICAgIGNvbXBvbmVudHNUb0RhdGFCdW5kbGU6ICh0eXBlKSAtPlxuICAgICAgICBjb21wb25lbnRzID0gW11cbiAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBAY29tcG9uZW50c1xuICAgICAgICAgICAgaWYgY29tcG9uZW50IGluc3RhbmNlb2YgdHlwZVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBjb21wb25lbnQudG9EYXRhQnVuZGxlP1xuICAgICAgICAgICAgICAgIGJ1bmRsZSA9IGNvbXBvbmVudC50b0RhdGFCdW5kbGUoKVxuICAgICAgICAgICAgICAgIGJ1bmRsZS5jbGFzc05hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IubmFtZVxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaChidW5kbGUpXG4gICAgICAgIHJldHVybiBjb21wb25lbnRzXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFN0YXJ0cyBhIGZ1bGwtcmVmcmVzaCBvbiBhbGwgc3ViLW9iamVjdHNcbiAgICAqXG4gICAgKiBAbWV0aG9kIGZ1bGxSZWZyZXNoXG4gICAgIyMjXG4gICAgZnVsbFJlZnJlc2g6IC0+XG4gICAgICAgIGZvciBvYmplY3QgaW4gQHN1Yk9iamVjdHNcbiAgICAgICAgICAgIGlmIG9iamVjdFxuICAgICAgICAgICAgICAgIG9iamVjdC5uZWVkc1VwZGF0ZSA9IHllc1xuICAgICAgICAgICAgICAgIG9iamVjdC5mdWxsUmVmcmVzaCgpXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBvYmplY3Qgd2l0aCBhbGwgcGFyZW50LSBhbmQgc3ViLW9iamVjdHMuIFxuICAgICpcbiAgICAqIEBtZXRob2QgZnVsbFVwZGF0ZVxuICAgICMjI1xuICAgIGZ1bGxVcGRhdGU6IC0+XG4gICAgICAgIHBhcmVudCA9IHRoaXNcbiAgICAgICAgd2hpbGUgcGFyZW50ICE9IG51bGxcbiAgICAgICAgICAgIHBhcmVudC51cGRhdGUoKVxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudFxuICAgICAgICAgICAgXG4gICAgICAgIGZvciBvYmplY3QgaW4gQHN1Yk9iamVjdHNcbiAgICAgICAgICAgIG9iamVjdD8udXBkYXRlKClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgb2JqZWN0IGFuZCBhbGwgaXRzIGNvbXBvbmVudHMuIFRoaXMgbWV0aG9kIGlzXG4gICAgKiBjYWxsZWQgYXV0b21hdGljYWxseSBieSB0aGUgcGFyZW50IG9yIE9iamVjdE1hbmFnZXIgc28gaW4gcmVndWxhciBpdCBpcyBcbiAgICAqIG5vdCBuZWNlc3NhcnkgdG8gY2FsbCBpdCBtYW51YWxseS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgcmV0dXJuIGlmICFAYWN0aXZlXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCBAY29tcG9uZW50cy5sZW5ndGhcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IEBjb21wb25lbnRzW2ldXG4gICAgICAgICAgICBjb21wb25lbnQub2JqZWN0ID0gdGhpc1xuICAgICAgICAgICAgaWYgbm90IGNvbXBvbmVudC5kaXNwb3NlZFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudC51cGRhdGUoKVxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBjb21wb25lbnRzLnNwbGljZShpLCAxKVxuXG5cbiAgICAgICAgaWYgQGlucHV0IHRoZW4gSW5wdXQuY2xlYXIoKVxuICAgICAgICBAaW5wdXQgPSBub1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFNlYXJjaGVzIGZvciB0aGUgZmlyc3QgY29tcG9uZW50IHdpdGggdGhlIHNwZWNpZmllZCBjbGFzcyBuYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgZmluZENvbXBvbmVudFxuICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIGNsYXNzIG5hbWUgb2YgdGhlIGNvbXBvbmVudC5cbiAgICAqIEByZXR1cm4ge0NvbXBvbmVudH0gVGhlIGNvbXBvbmVudCBvciBudWxsIGlmIGEgY29tcG9uZW50IHdpdGggdGhlIHNwZWNpZmllZCBjbGFzcyBuYW1lIGNhbm5vdCBiZSBmb3VuZC5cbiAgICAjIyNcbiAgICBmaW5kQ29tcG9uZW50OiAobmFtZSkgLT4gQGNvbXBvbmVudHMuZmlyc3QgKHYpIC0+IHYuY29uc3RydWN0b3IubmFtZSA9PSBuYW1lXG4gICAgXG4gICAgIyMjKlxuICAgICogU2VhcmNoZXMgZm9yIGFsbCBjb21wb25lbnRzIHdpdGggdGhlIHNwZWNpZmllZCBjbGFzcyBuYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgZmluZENvbXBvbmVudHNcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBjbGFzcyBuYW1lIG9mIHRoZSBjb21wb25lbnRzLlxuICAgICogQHJldHVybiB7QXJyYXl9IFRoZSBjb21wb25lbnRzIG9yIG51bGwgaWYgbm8gY29tcG9uZW50IHdpdGggdGhlIHNwZWNpZmllZCBjbGFzcyBuYW1lIGhhcyBiZWVuIGZvdW5kLlxuICAgICMjI1xuICAgIGZpbmRDb21wb25lbnRzOiAobmFtZSkgLT4gQGNvbXBvbmVudHMud2hlcmUgKHYpIC0+IHYuY29uc3RydWN0b3IubmFtZSA9PSBuYW1lXG4gICAgXG4gICAgIyMjKlxuICAgICogU2VhcmNoZXMgZm9yIHRoZSBjb21wb25lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIElELlxuICAgICpcbiAgICAqIEBtZXRob2QgZmluZENvbXBvbmVudEJ5SWRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZCBUaGUgdW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGNvbXBvbmVudC5cbiAgICAqIEByZXR1cm4ge0NvbXBvbmVudH0gVGhlIGNvbXBvbmVudCBvciBudWxsIGlmIGEgY29tcG9uZW50IHdpdGggdGhlIHNwZWNpZmllZCBJRCBjYW5ub3QgYmUgZm91bmQuXG4gICAgIyMjXG4gICAgZmluZENvbXBvbmVudEJ5SWQ6IChpZCkgLT4gQGNvbXBvbmVudHNCeUlkW2lkXVxuICAgIFxuICAgICMjIypcbiAgICAqIFNlYXJjaGVzIGZvciB0aGUgY29tcG9uZW50IHdpdGggdGhlIHNwZWNpZmllZCBuYW1lLiBJZiBtdWx0aXBsZSBjb21wb25lbnRzIGhhdmUgdGhlXG4gICAgKiBzYW1lIG5hbWUsIGl0IHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBtYXRjaC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGZpbmRDb21wb25lbnRCeU5hbWVcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb21wb25lbnQgdG8gZmluZC5cbiAgICAqIEByZXR1cm4ge0NvbXBvbmVudH0gVGhlIGNvbXBvbmVudCBvciBudWxsIGlmIGEgY29tcG9uZW50IHdpdGggdGhlIHNwZWNpZmllZCBuYW1lIGNhbm5vdCBiZSBmb3VuZC5cbiAgICAjIyNcbiAgICBmaW5kQ29tcG9uZW50QnlOYW1lOiAobmFtZSkgLT4gQGNvbXBvbmVudHMuZmlyc3QgKHYpIC0+IHYubmFtZSA9PSBuYW1lXG4gICAgXG4gICAgIyMjKlxuICAgICogU2VhcmNoZXMgZm9yIGNvbXBvbmVudHMgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUuXG4gICAgKlxuICAgICogQG1ldGhvZCBmaW5kQ29tcG9uZW50c0J5TmFtZVxuICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNvbXBvbmVudHMgdG8gZmluZC5cbiAgICAqIEByZXR1cm4ge0NvbXBvbmVudFtdfSBBbiBhcnJheSBvZiBjb21wb25lbnRzIG1hdGNoaW5nIHRoZSBzcGVjaWZpZWQgbmFtZSBvciBudWxsIGlmIG5vIGNvbXBvbmVudHMgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUgZXhpc3QuXG4gICAgIyMjXG4gICAgZmluZENvbXBvbmVudHNCeU5hbWU6IChuYW1lKSAtPiBAY29tcG9uZW50cy53aGVyZSAodikgLT4gdi5uYW1lID09IG5hbWVcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBZGRzIGFuIG9iamVjdCB0byB0aGUgbGlzdCBvZiBzdWItb2JqZWN0cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGFkZE9iamVjdFxuICAgICogQHBhcmFtIHtPYmplY3RfQmFzZX0gb2JqZWN0IFRoZSBvYmplY3Qgd2hpY2ggc2hvdWxkIGJlIGFkZGVkLlxuICAgICMjI1xuICAgIGFkZE9iamVjdDogKG9iamVjdCkgLT5cbiAgICAgICAgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50Py5yZW1vdmUob2JqZWN0KVxuICAgICAgICBvYmplY3QucGFyZW50Py5yZW1vdmVPYmplY3Qob2JqZWN0KVxuICAgICAgICBvYmplY3QucGFyZW50ID0gdGhpc1xuICAgICAgICBAc3ViT2JqZWN0cy5wdXNoKG9iamVjdClcbiAgICAgICAgQG5lZWRzU29ydCA9IHllc1xuICAgICAgICBAbmVlZHNVcGRhdGUgPSB5ZXNcbiAgICBcbiAgICAgICAgaWYgb2JqZWN0LmlkP1xuICAgICAgICAgICAgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50LnNldE9iamVjdEJ5SWQob2JqZWN0LCBvYmplY3QuaWQpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIEluc2VydHMgYW4gb2JqZWN0IGludG8gdGhlIGxpc3Qgb2Ygc3ViLW9iamVjdHMgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluc2VydE9iamVjdFxuICAgICogQHBhcmFtIHtPYmplY3RfQmFzZX0gb2JqZWN0IFRoZSBvYmplY3Qgd2hpY2ggc2hvdWxkIGJlIGluc2VydGVkLlxuICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IFRoZSBpbmRleC5cbiAgICAjIyNcbiAgICBpbnNlcnRPYmplY3Q6KG9iamVjdCwgaW5kZXgpIC0+XG4gICAgICAgIGdzLk9iamVjdE1hbmFnZXIuY3VycmVudC5yZW1vdmUob2JqZWN0KVxuICAgICAgICBvYmplY3QucGFyZW50Py5yZW1vdmVPYmplY3Qob2JqZWN0KVxuICAgICAgICBvYmplY3QucGFyZW50ID0gdGhpc1xuICAgICAgICBAc3ViT2JqZWN0cy5zcGxpY2UoaW5kZXgsIDAsIG9iamVjdClcbiAgICAgIFxuICAgICAgICBpZiBvYmplY3QuaWQ/XG4gICAgICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQuc2V0T2JqZWN0QnlJZChvYmplY3QsIG9iamVjdC5pZClcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgc3ViLW9iamVjdCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0T2JqZWN0XG4gICAgKiBAcGFyYW0ge09iamVjdF9CYXNlfSBvYmplY3QgVGhlIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCBUaGUgaW5kZXguXG4gICAgIyMjXG4gICAgc2V0T2JqZWN0OiAob2JqZWN0LCBpbmRleCkgLT5cbiAgICAgICAgaWYgb2JqZWN0XG4gICAgICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQucmVtb3ZlKG9iamVjdClcbiAgICAgICAgICAgIG9iamVjdC5wYXJlbnQ/LnJlbW92ZU9iamVjdChvYmplY3QpXG4gICAgICAgICAgICBvYmplY3QucGFyZW50ID0gdGhpc1xuICAgICAgICAgICAgXG4gICAgICAgIEBzdWJPYmplY3RzW2luZGV4XSA9IG9iamVjdFxuICAgICAgXG4gICAgICAgIGlmIG9iamVjdD8uaWQ/XG4gICAgICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQuc2V0T2JqZWN0QnlJZChvYmplY3QsIG9iamVjdC5pZClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgb2JqZWN0IGZyb20gdGhlIGxpc3Qgb2Ygc3ViLW9iamVjdHMuXG4gICAgKlxuICAgICogQG1ldGhvZCByZW1vdmVPYmplY3RcbiAgICAqIEBwYXJhbSB7T2JqZWN0X0Jhc2V9IG9iamVjdCBUaGUgb2JqZWN0IHdoaWNoIHNob3VsZCBiZSByZW1vdmVkLlxuICAgICMjI1xuICAgIHJlbW92ZU9iamVjdDogKG9iamVjdCkgLT5cbiAgICAgICAgQHN1Yk9iamVjdHMucmVtb3ZlKG9iamVjdClcbiAgICAgICAgb2JqZWN0LnBhcmVudCA9IG51bGxcbiAgICAgICAgQG5lZWRzVXBkYXRlID0geWVzXG4gICAgIFxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgdGhlIG9iamVjdCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4IGZyb20gdGhlIGxpc3Qgb2Ygc3ViLW9iamVjdHMuXG4gICAgKlxuICAgICogQG1ldGhvZCByZW1vdmVPYmplY3RBdFxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSBpbmRleCBvZiB0aGUgb2JqZWMgdG8gcmVtb3ZlLlxuICAgICMjIyAgIFxuICAgIHJlbW92ZU9iamVjdEF0OiAoaW5kZXgpIC0+XG4gICAgICAgIG9iamVjdCA9IEBzdWJPYmplY3RzW2luZGV4XVxuICAgICAgICBAc3ViT2JqZWN0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgIG9iamVjdC5wYXJlbnQgPSBudWxsXG4gICAgICAgIEBuZWVkc1VwZGF0ZSA9IHllc1xuICAgIFxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgYWxsIHN1Yi1vYmplY3RzLlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVtb3ZlQWxsT2JqZWN0c1xuICAgICMjIyAgICAgXG4gICAgcmVtb3ZlQWxsT2JqZWN0czogLT5cbiAgICAgICAgd2hpbGUgQHN1Yk9iamVjdHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgQHJlbW92ZU9iamVjdEF0KDApXG4gICAgXG4gICAgIyMjKlxuICAgICogRXJhc2VzIHRoZSBvYmplY3QgYXQgdGhlIHNwZWNpZmllZCBpbmRleC4gVGhlIGxpc3Qgc2l6ZVxuICAgICogd2lsbCBub3QgYmUgY2hhbmdlZCBidXQgdGhlIHRoZSB2YWx1ZSBhdCB0aGUgaW5kZXggd2lsbCBiZSBzZXQgdG8gbnVsbC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGVyYXNlT2JqZWN0XG4gICAgKiBAcGFyYW0ge051bWJlcn0gb2JqZWN0IFRoZSBvYmplY3Qgd2hpY2ggc2hvdWxkIGJlIGVyYXNlZC5cbiAgICAjIyNcbiAgICBlcmFzZU9iamVjdDogKGluZGV4KSAtPlxuICAgICAgICBvYmplY3QgPSBAc3ViT2JqZWN0c1tpbmRleF1cbiAgICAgICAgb2JqZWN0Py5wYXJlbnQgPSBudWxsXG4gICAgICAgIEBzdWJPYmplY3RzW2luZGV4XSA9IG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBZGRzIHRoZSBzcGVjaWZpZWQgY29tcG9uZW50IHRvIHRoZSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBhZGRDb21wb25lbnRcbiAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgVGhlIGNvbXBvbmVudFxuICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIEFuIG9wdGlvbmFsIHVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgY29tcG9uZW50LlxuICAgICMjI1xuICAgIGFkZENvbXBvbmVudDogKGNvbXBvbmVudCwgaWQpIC0+XG4gICAgICAgIGlmIG5vdCBAY29tcG9uZW50cy5jb250YWlucyhjb21wb25lbnQpXG4gICAgICAgICAgICBjb21wb25lbnQub2JqZWN0ID0gdGhpc1xuICAgICAgICAgICAgQGNvbXBvbmVudHMucHVzaChjb21wb25lbnQpXG4gICAgICAgICAgICBpZiBpZD9cbiAgICAgICAgICAgICAgICBAY29tcG9uZW50c0J5SWRbaWRdID0gY29tcG9uZW50XG4gICAgIyMjKlxuICAgICogSW5zZXJ0cyBhIGNvbXBvbmVudCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2QgaW5zZXJ0Q29tcG9uZW50XG4gICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcG9uZW50IFRoZSBjb21wb25lbnQuXG4gICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggVGhlIGluZGV4LlxuICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIEFuIG9wdGlvbmFsIHVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgY29tcG9uZW50LlxuICAgICMjIyAgICBcbiAgICBpbnNlcnRDb21wb25lbnQ6IChjb21wb25lbnQsIGluZGV4LCBpZCkgLT5cbiAgICAgICAgQGNvbXBvbmVudHMucmVtb3ZlKGNvbXBvbmVudClcbiAgICAgICAgY29tcG9uZW50Lm9iamVjdCA9IHRoaXNcbiAgICAgICAgQGNvbXBvbmVudHMuc3BsaWNlKGluZGV4LCAwLCBjb21wb25lbnQpXG4gICAgICAgIGlmIGlkP1xuICAgICAgICAgICAgQGNvbXBvbmVudHNCeUlkW2lkXSA9IGNvbXBvbmVudFxuICAgIFxuICAgICMjIypcbiAgICAqIFJlbW92ZXMgYSBjb21wb25lbnQgZnJvbSB0aGUgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVtb3ZlQ29tcG9uZW50XG4gICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcG9uZW50IFRoZSBjb21wb25lbnQgdG8gcmVtb3ZlLlxuICAgICMjIyAgXG4gICAgcmVtb3ZlQ29tcG9uZW50OiAoY29tcG9uZW50KSAtPiBcbiAgICAgICAgQGNvbXBvbmVudHMucmVtb3ZlKGNvbXBvbmVudClcbiAgICAgICAgaWYgaWQ/XG4gICAgICAgICAgICBkZWxldGUgQGNvbXBvbmVudHNCeUlkW2lkXVxuXG5ncy5PYmplY3RfQmFzZSA9IE9iamVjdF9CYXNlIl19
//# sourceURL=Object_Base_6.js