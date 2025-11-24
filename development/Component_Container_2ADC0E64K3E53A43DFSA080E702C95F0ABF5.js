var Component_Container,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_Container = (function(superClass) {
  extend(Component_Container, superClass);


  /**
  * A container component allows an object to have sub-objects.
  * @module gs
  * @class Component_Container
  * @memberof gs
  * @constructor
   */

  function Component_Container(disposeBehavior) {
    Component_Container.__super__.constructor.apply(this, arguments);

    /**
    * The behavior how the container deals with disposed game objects.
    * @property disposeBehavior
    * @default gs.ContainerDisposeBehavior.REMOVE
     */
    this.disposeBehavior = disposeBehavior != null ? disposeBehavior : gs.ContainerDisposeBehavior.REMOVE;
    this.prev_visibilities_ = [];
  }


  /**
  * Sorts the sub-objects by order-index.
  * @method sort_
  * @param {gs.Object_Base} a Object A
  * @param {gs.Object_Base} b Object B
   */

  Component_Container.prototype.sort_ = function(a, b) {
    if (a.order > b.order) {
      return -1;
    } else if (a.order < b.order) {
      return 1;
    } else {
      return 0;
    }
  };


  /**
  * Sets the visibility of all sub objects.
  * @method setVisible
  * @param {boolean} visible - The new visibility.
   */

  Component_Container.prototype.setVisible = function(visible) {
    var i, j, len, ref, results, subObject;
    if (this.object.visible === visible) {
      return;
    }
    this.object.visible = visible;
    ref = this.object.subObjects;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      subObject = ref[i];
      if (subObject) {
        if (!this.visible) {
          this.prev_visibilities_[i] = subObject.visible;
        }
        subObject.visible = visible;
        if (this.visible) {
          subObject.visible = this.prev_visibilities_[i];
        }
        results.push(subObject.update());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Updates all sub-objects and sorts them if necessary. It also removes
  * disposed objects from the list of sub-objects.
  * @method update
   */

  Component_Container.prototype.update = function() {
    var i, results, subObject, subObjects;
    Component_Container.__super__.update.apply(this, arguments);
    subObjects = this.object.subObjects;
    if (this.object.needsSort) {
      subObjects.sort(this.sort_);
      this.object.needsSort = false;
    }
    i = 0;
    results = [];
    while (i < subObjects.length) {
      subObject = subObjects[i];
      if (subObject != null ? subObject.active : void 0) {
        if (subObject.disposed) {
          if (this.disposeBehavior === gs.ContainerDisposeBehavior.REMOVE) {
            subObjects.remove(subObject);
            i--;
          } else {
            subObjects[i] = null;
          }
        } else {
          subObject.update();
        }
      }
      results.push(i++);
    }
    return results;
  };

  return Component_Container;

})(gs.Component);

gs.Component_Container = Component_Container;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsbUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7RUFPYSw2QkFBQyxlQUFEO0lBQ1Qsc0RBQUEsU0FBQTs7QUFFQTs7Ozs7SUFLQSxJQUFDLENBQUEsZUFBRCw2QkFBbUIsa0JBQWtCLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQztJQUVqRSxJQUFDLENBQUEsa0JBQUQsR0FBc0I7RUFWYjs7O0FBYWI7Ozs7Ozs7Z0NBTUEsS0FBQSxHQUFPLFNBQUMsQ0FBRCxFQUFJLENBQUo7SUFDSCxJQUFHLENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBQyxDQUFDLEtBQWY7QUFDRSxhQUFPLENBQUMsRUFEVjtLQUFBLE1BRUssSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxLQUFmO0FBQ0gsYUFBTyxFQURKO0tBQUEsTUFBQTtBQUdILGFBQU8sRUFISjs7RUFIRjs7O0FBUVA7Ozs7OztnQ0FLQSxVQUFBLEdBQVksU0FBQyxPQUFEO0FBQ1IsUUFBQTtJQUFBLElBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLEtBQW1CLE9BQTdCO0FBQUEsYUFBQTs7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsR0FBa0I7QUFDbEI7QUFBQTtTQUFBLDZDQUFBOztNQUNJLElBQUcsU0FBSDtRQUNJLElBQThDLENBQUMsSUFBQyxDQUFBLE9BQWhEO1VBQUEsSUFBQyxDQUFBLGtCQUFtQixDQUFBLENBQUEsQ0FBcEIsR0FBeUIsU0FBUyxDQUFDLFFBQW5DOztRQUNBLFNBQVMsQ0FBQyxPQUFWLEdBQW9CO1FBQ3BCLElBQThDLElBQUMsQ0FBQSxPQUEvQztVQUFBLFNBQVMsQ0FBQyxPQUFWLEdBQW9CLElBQUMsQ0FBQSxrQkFBbUIsQ0FBQSxDQUFBLEVBQXhDOztxQkFDQSxTQUFTLENBQUMsTUFBVixDQUFBLEdBSko7T0FBQSxNQUFBOzZCQUFBOztBQURKOztFQUhROzs7QUFVWjs7Ozs7O2dDQUtBLE1BQUEsR0FBUSxTQUFBO0FBQ0osUUFBQTtJQUFBLGlEQUFBLFNBQUE7SUFFQSxVQUFBLEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUNyQixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBWDtNQUNJLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQUMsQ0FBQSxLQUFqQjtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixHQUFvQixNQUZ4Qjs7SUFJQSxDQUFBLEdBQUk7QUFDSjtXQUFNLENBQUEsR0FBSSxVQUFVLENBQUMsTUFBckI7TUFDSSxTQUFBLEdBQVksVUFBVyxDQUFBLENBQUE7TUFDdkIsd0JBQUcsU0FBUyxDQUFFLGVBQWQ7UUFDSSxJQUFHLFNBQVMsQ0FBQyxRQUFiO1VBQ0ksSUFBRyxJQUFDLENBQUEsZUFBRCxLQUFvQixFQUFFLENBQUMsd0JBQXdCLENBQUMsTUFBbkQ7WUFDSSxVQUFVLENBQUMsTUFBWCxDQUFrQixTQUFsQjtZQUNBLENBQUEsR0FGSjtXQUFBLE1BQUE7WUFJSSxVQUFXLENBQUEsQ0FBQSxDQUFYLEdBQWdCLEtBSnBCO1dBREo7U0FBQSxNQUFBO1VBT0ksU0FBUyxDQUFDLE1BQVYsQ0FBQSxFQVBKO1NBREo7O21CQVNBLENBQUE7SUFYSixDQUFBOztFQVRJOzs7O0dBdkRzQixFQUFFLENBQUM7O0FBOEVyQyxFQUFFLENBQUMsbUJBQUgsR0FBeUIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9Db250YWluZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9Db250YWluZXIgZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAjIyMqXG4gICAgKiBBIGNvbnRhaW5lciBjb21wb25lbnQgYWxsb3dzIGFuIG9iamVjdCB0byBoYXZlIHN1Yi1vYmplY3RzLlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9Db250YWluZXJcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChkaXNwb3NlQmVoYXZpb3IpIC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGJlaGF2aW9yIGhvdyB0aGUgY29udGFpbmVyIGRlYWxzIHdpdGggZGlzcG9zZWQgZ2FtZSBvYmplY3RzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBkaXNwb3NlQmVoYXZpb3JcbiAgICAgICAgKiBAZGVmYXVsdCBncy5Db250YWluZXJEaXNwb3NlQmVoYXZpb3IuUkVNT1ZFXG4gICAgICAgICMjI1xuICAgICAgICBAZGlzcG9zZUJlaGF2aW9yID0gZGlzcG9zZUJlaGF2aW9yID8gZ3MuQ29udGFpbmVyRGlzcG9zZUJlaGF2aW9yLlJFTU9WRVxuICAgICAgICBcbiAgICAgICAgQHByZXZfdmlzaWJpbGl0aWVzXyA9IFtdXG4gICAgICAgIFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTb3J0cyB0aGUgc3ViLW9iamVjdHMgYnkgb3JkZXItaW5kZXguXG4gICAgKiBAbWV0aG9kIHNvcnRfXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBhIE9iamVjdCBBXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBiIE9iamVjdCBCXG4gICAgIyMjXG4gICAgc29ydF86IChhLCBiKSAtPlxuICAgICAgICBpZiBhLm9yZGVyID4gYi5vcmRlclxuICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICBlbHNlIGlmIGEub3JkZXIgPCBiLm9yZGVyXG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmlzaWJpbGl0eSBvZiBhbGwgc3ViIG9iamVjdHMuXG4gICAgKiBAbWV0aG9kIHNldFZpc2libGVcbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmlzaWJsZSAtIFRoZSBuZXcgdmlzaWJpbGl0eS5cbiAgICAjIyNcbiAgICBzZXRWaXNpYmxlOiAodmlzaWJsZSkgLT5cbiAgICAgICAgcmV0dXJuIGlmIEBvYmplY3QudmlzaWJsZSA9PSB2aXNpYmxlXG4gICAgICAgIEBvYmplY3QudmlzaWJsZSA9IHZpc2libGVcbiAgICAgICAgZm9yIHN1Yk9iamVjdCwgaSBpbiBAb2JqZWN0LnN1Yk9iamVjdHNcbiAgICAgICAgICAgIGlmIHN1Yk9iamVjdFxuICAgICAgICAgICAgICAgIEBwcmV2X3Zpc2liaWxpdGllc19baV0gPSBzdWJPYmplY3QudmlzaWJsZSBpZiAhQHZpc2libGVcbiAgICAgICAgICAgICAgICBzdWJPYmplY3QudmlzaWJsZSA9IHZpc2libGVcbiAgICAgICAgICAgICAgICBzdWJPYmplY3QudmlzaWJsZSA9IEBwcmV2X3Zpc2liaWxpdGllc19baV0gaWYgQHZpc2libGVcbiAgICAgICAgICAgICAgICBzdWJPYmplY3QudXBkYXRlKClcbiAgICAgICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIGFsbCBzdWItb2JqZWN0cyBhbmQgc29ydHMgdGhlbSBpZiBuZWNlc3NhcnkuIEl0IGFsc28gcmVtb3Zlc1xuICAgICogZGlzcG9zZWQgb2JqZWN0cyBmcm9tIHRoZSBsaXN0IG9mIHN1Yi1vYmplY3RzLlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyNcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBzdWJPYmplY3RzID0gQG9iamVjdC5zdWJPYmplY3RzXG4gICAgICAgIGlmIEBvYmplY3QubmVlZHNTb3J0XG4gICAgICAgICAgICBzdWJPYmplY3RzLnNvcnQoQHNvcnRfKVxuICAgICAgICAgICAgQG9iamVjdC5uZWVkc1NvcnQgPSBub1xuICAgICAgICAgIFxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgc3ViT2JqZWN0cy5sZW5ndGhcbiAgICAgICAgICAgIHN1Yk9iamVjdCA9IHN1Yk9iamVjdHNbaV1cbiAgICAgICAgICAgIGlmIHN1Yk9iamVjdD8uYWN0aXZlXG4gICAgICAgICAgICAgICAgaWYgc3ViT2JqZWN0LmRpc3Bvc2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIEBkaXNwb3NlQmVoYXZpb3IgPT0gZ3MuQ29udGFpbmVyRGlzcG9zZUJlaGF2aW9yLlJFTU9WRVxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViT2JqZWN0cy5yZW1vdmUoc3ViT2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgaS0tXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Yk9iamVjdHNbaV0gPSBudWxsXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdWJPYmplY3QudXBkYXRlKClcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgXG4gICAgICAgIFxuZ3MuQ29tcG9uZW50X0NvbnRhaW5lciA9IENvbXBvbmVudF9Db250YWluZXIiXX0=
//# sourceURL=Component_Container_27.js