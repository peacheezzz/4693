var Component_DomainContainer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_DomainContainer = (function(superClass) {
  extend(Component_DomainContainer, superClass);


  /**
  * A container component allows an object to have sub-objects.
  * @module gs
  * @class Component_DomainContainer
  * @memberof gs
  * @constructor
   */

  function Component_DomainContainer(disposeBehavior) {
    Component_DomainContainer.__super__.constructor.call(this, disposeBehavior);

    /**
    * The current domain. The default domain is an empty string. Please use
    * <b>changeDomain</b> to change the current domain.
    * @property domain
    * @readOnly
     */
    this.domain = "com.degica.vnm.default";
    this.domains = ["com.degica.vnm.default"];
    this.prev_visibilities_ = {};
  }


  /**
  * Changes the component and all sub-objects.
  * @method changeDomain
  * @param {string} domain - The domain to change to.
   */

  Component_DomainContainer.prototype.dispose = function() {
    var domain, j, len, ref;
    Component_DomainContainer.__super__.dispose.apply(this, arguments);
    ref = this.domains;
    for (j = 0, len = ref.length; j < len; j++) {
      domain = ref[j];
      if (domain !== this.domain) {
        this.object.subObjects = this.object.subObjectsByDomain[domain];
        this.object.disposeObjects();
      }
    }
    return this.object.subObjects = this.object.subObjectsByDomain[this.domain];
  };


  /**
  * Changes the current domain.
  * @method changeDomain
  * @param {string} domain - The domain to change to.
   */

  Component_DomainContainer.prototype.changeDomain = function(domain) {
    var objects;
    this.domain = domain;
    objects = this.object.subObjectsByDomain[domain];
    if (!objects) {
      objects = this.object.subObjectsByDomain[domain] = [];
      this.domains = Object.keys(this.object.subObjectsByDomain);
    }
    return this.object.subObjects = objects;
  };


  /**
  * Sets the visibility of all sub objects of all domains.
  * @method setVisible
  * @param {boolean} visible - The new visibility.
   */

  Component_DomainContainer.prototype.setVisible = function(visible) {
    var base, domain, i, j, len, prev_visibilities, ref, results, subObject, subObjects;
    if (this.object.visible === visible) {
      return;
    }
    this.object.visible = visible;
    ref = this.domains;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      domain = ref[j];
      subObjects = this.object.subObjectsByDomain[domain];
      (base = this.prev_visibilities_)[domain] || (base[domain] = []);
      prev_visibilities = this.prev_visibilities_[domain];
      if (subObjects) {
        results.push((function() {
          var k, len1, results1;
          results1 = [];
          for (i = k = 0, len1 = subObjects.length; k < len1; i = ++k) {
            subObject = subObjects[i];
            if (subObject) {
              if (!visible) {
                prev_visibilities[i] = subObject.visible;
              }
              subObject.visible = visible;
              if (visible) {
                subObject.visible = prev_visibilities[i];
              }
              results1.push(subObject.update());
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        })());
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

  Component_DomainContainer.prototype.update = function() {
    var domain, i, j, len, ref, subObject, subObjects;
    ref = this.domains;
    for (j = 0, len = ref.length; j < len; j++) {
      domain = ref[j];
      subObjects = this.object.subObjectsByDomain[domain];
      i = 0;
      while (i < subObjects.length) {
        subObject = subObjects[i];
        if (subObject != null ? subObject.active : void 0) {
          if (subObject.disposed) {
            subObjects[i] = null;
          } else {
            subObject.update();
          }
        }
        i++;
      }
    }
    return null;
  };

  return Component_DomainContainer;

})(gs.Component_Container);

gs.Component_DomainContainer = Component_DomainContainer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEseUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7RUFPYSxtQ0FBQyxlQUFEO0lBQ1QsMkRBQU0sZUFBTjs7QUFFQTs7Ozs7O0lBTUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBQyx3QkFBRDtJQUNYLElBQUMsQ0FBQSxrQkFBRCxHQUFzQjtFQVhiOzs7QUFhYjs7Ozs7O3NDQUtBLE9BQUEsR0FBUyxTQUFBO0FBQ0wsUUFBQTtJQUFBLHdEQUFBLFNBQUE7QUFFQTtBQUFBLFNBQUEscUNBQUE7O01BQ0ksSUFBRyxNQUFBLEtBQVUsSUFBQyxDQUFBLE1BQWQ7UUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsR0FBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBbUIsQ0FBQSxNQUFBO1FBQ2hELElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBLEVBRko7O0FBREo7V0FJQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsR0FBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBbUIsQ0FBQSxJQUFDLENBQUEsTUFBRDtFQVAzQzs7O0FBU1Q7Ozs7OztzQ0FLQSxZQUFBLEdBQWMsU0FBQyxNQUFEO0FBQ1YsUUFBQTtJQUFBLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBbUIsQ0FBQSxNQUFBO0lBQ3JDLElBQUcsQ0FBQyxPQUFKO01BQ0ksT0FBQSxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQW1CLENBQUEsTUFBQSxDQUEzQixHQUFxQztNQUMvQyxJQUFDLENBQUEsT0FBRCxHQUFXLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBcEIsRUFGZjs7V0FJQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsR0FBcUI7RUFQWDs7O0FBU2Q7Ozs7OztzQ0FLQSxVQUFBLEdBQVksU0FBQyxPQUFEO0FBQ1IsUUFBQTtJQUFBLElBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLEtBQW1CLE9BQTdCO0FBQUEsYUFBQTs7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsR0FBa0I7QUFDbEI7QUFBQTtTQUFBLHFDQUFBOztNQUNJLFVBQUEsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFtQixDQUFBLE1BQUE7Y0FDeEMsSUFBQyxDQUFBLG1CQUFtQixDQUFBLE1BQUEsVUFBQSxDQUFBLE1BQUEsSUFBWTtNQUNoQyxpQkFBQSxHQUFvQixJQUFDLENBQUEsa0JBQW1CLENBQUEsTUFBQTtNQUN4QyxJQUFHLFVBQUg7OztBQUFtQjtlQUFBLHNEQUFBOztZQUNmLElBQUcsU0FBSDtjQUNJLElBQTRDLENBQUMsT0FBN0M7Z0JBQUEsaUJBQWtCLENBQUEsQ0FBQSxDQUFsQixHQUF1QixTQUFTLENBQUMsUUFBakM7O2NBQ0EsU0FBUyxDQUFDLE9BQVYsR0FBb0I7Y0FDcEIsSUFBNEMsT0FBNUM7Z0JBQUEsU0FBUyxDQUFDLE9BQVYsR0FBb0IsaUJBQWtCLENBQUEsQ0FBQSxFQUF0Qzs7NEJBQ0EsU0FBUyxDQUFDLE1BQVYsQ0FBQSxHQUpKO2FBQUEsTUFBQTtvQ0FBQTs7QUFEZTs7Y0FBbkI7T0FBQSxNQUFBOzZCQUFBOztBQUpKOztFQUhROzs7QUFjWjs7Ozs7O3NDQUtBLE1BQUEsR0FBUSxTQUFBO0FBQ0osUUFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTs7TUFDSSxVQUFBLEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBbUIsQ0FBQSxNQUFBO01BRXhDLENBQUEsR0FBSTtBQUNKLGFBQU0sQ0FBQSxHQUFJLFVBQVUsQ0FBQyxNQUFyQjtRQUNJLFNBQUEsR0FBWSxVQUFXLENBQUEsQ0FBQTtRQUN2Qix3QkFBRyxTQUFTLENBQUUsZUFBZDtVQUNJLElBQUcsU0FBUyxDQUFDLFFBQWI7WUFDSSxVQUFXLENBQUEsQ0FBQSxDQUFYLEdBQWdCLEtBRHBCO1dBQUEsTUFBQTtZQUdJLFNBQVMsQ0FBQyxNQUFWLENBQUEsRUFISjtXQURKOztRQUtBLENBQUE7TUFQSjtBQUpKO0FBYUEsV0FBTztFQWRIOzs7O0dBekU0QixFQUFFLENBQUM7O0FBMkYzQyxFQUFFLENBQUMseUJBQUgsR0FBK0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9Db250YWluZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9Eb21haW5Db250YWluZXIgZXh0ZW5kcyBncy5Db21wb25lbnRfQ29udGFpbmVyXG4gICAgIyMjKlxuICAgICogQSBjb250YWluZXIgY29tcG9uZW50IGFsbG93cyBhbiBvYmplY3QgdG8gaGF2ZSBzdWItb2JqZWN0cy5cbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfRG9tYWluQ29udGFpbmVyXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoZGlzcG9zZUJlaGF2aW9yKSAtPlxuICAgICAgICBzdXBlcihkaXNwb3NlQmVoYXZpb3IpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGN1cnJlbnQgZG9tYWluLiBUaGUgZGVmYXVsdCBkb21haW4gaXMgYW4gZW1wdHkgc3RyaW5nLiBQbGVhc2UgdXNlXG4gICAgICAgICogPGI+Y2hhbmdlRG9tYWluPC9iPiB0byBjaGFuZ2UgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBkb21haW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBkb21haW4gPSBcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIlxuICAgICAgICBAZG9tYWlucyA9IFtcImNvbS5kZWdpY2Eudm5tLmRlZmF1bHRcIl1cbiAgICAgICAgQHByZXZfdmlzaWJpbGl0aWVzXyA9IHt9XG4gICAgIFxuICAgICMjIypcbiAgICAqIENoYW5nZXMgdGhlIGNvbXBvbmVudCBhbmQgYWxsIHN1Yi1vYmplY3RzLlxuICAgICogQG1ldGhvZCBjaGFuZ2VEb21haW5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW4gLSBUaGUgZG9tYWluIHRvIGNoYW5nZSB0by5cbiAgICAjIyMgICBcbiAgICBkaXNwb3NlOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgZm9yIGRvbWFpbiBpbiBAZG9tYWluc1xuICAgICAgICAgICAgaWYgZG9tYWluICE9IEBkb21haW5cbiAgICAgICAgICAgICAgICBAb2JqZWN0LnN1Yk9iamVjdHMgPSBAb2JqZWN0LnN1Yk9iamVjdHNCeURvbWFpbltkb21haW5dXG4gICAgICAgICAgICAgICAgQG9iamVjdC5kaXNwb3NlT2JqZWN0cygpXG4gICAgICAgIEBvYmplY3Quc3ViT2JqZWN0cyA9IEBvYmplY3Quc3ViT2JqZWN0c0J5RG9tYWluW0Bkb21haW5dXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIENoYW5nZXMgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICogQG1ldGhvZCBjaGFuZ2VEb21haW5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW4gLSBUaGUgZG9tYWluIHRvIGNoYW5nZSB0by5cbiAgICAjIyMgICBcbiAgICBjaGFuZ2VEb21haW46IChkb21haW4pIC0+XG4gICAgICAgIEBkb21haW4gPSBkb21haW5cbiAgICAgICAgb2JqZWN0cyA9IEBvYmplY3Quc3ViT2JqZWN0c0J5RG9tYWluW2RvbWFpbl1cbiAgICAgICAgaWYgIW9iamVjdHNcbiAgICAgICAgICAgIG9iamVjdHMgPSBAb2JqZWN0LnN1Yk9iamVjdHNCeURvbWFpbltkb21haW5dID0gW11cbiAgICAgICAgICAgIEBkb21haW5zID0gT2JqZWN0LmtleXMoQG9iamVjdC5zdWJPYmplY3RzQnlEb21haW4pXG4gICAgICAgICAgICBcbiAgICAgICAgQG9iamVjdC5zdWJPYmplY3RzID0gb2JqZWN0c1xuICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZpc2liaWxpdHkgb2YgYWxsIHN1YiBvYmplY3RzIG9mIGFsbCBkb21haW5zLlxuICAgICogQG1ldGhvZCBzZXRWaXNpYmxlXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZpc2libGUgLSBUaGUgbmV3IHZpc2liaWxpdHkuXG4gICAgIyMjXG4gICAgc2V0VmlzaWJsZTogKHZpc2libGUpIC0+XG4gICAgICAgIHJldHVybiBpZiBAb2JqZWN0LnZpc2libGUgPT0gdmlzaWJsZVxuICAgICAgICBAb2JqZWN0LnZpc2libGUgPSB2aXNpYmxlXG4gICAgICAgIGZvciBkb21haW4gaW4gQGRvbWFpbnNcbiAgICAgICAgICAgIHN1Yk9iamVjdHMgPSBAb2JqZWN0LnN1Yk9iamVjdHNCeURvbWFpbltkb21haW5dXG4gICAgICAgICAgICBAcHJldl92aXNpYmlsaXRpZXNfW2RvbWFpbl0gfHw9IFtdXG4gICAgICAgICAgICBwcmV2X3Zpc2liaWxpdGllcyA9IEBwcmV2X3Zpc2liaWxpdGllc19bZG9tYWluXVxuICAgICAgICAgICAgaWYgc3ViT2JqZWN0cyB0aGVuIGZvciBzdWJPYmplY3QsIGkgaW4gc3ViT2JqZWN0c1xuICAgICAgICAgICAgICAgIGlmIHN1Yk9iamVjdFxuICAgICAgICAgICAgICAgICAgICBwcmV2X3Zpc2liaWxpdGllc1tpXSA9IHN1Yk9iamVjdC52aXNpYmxlIGlmICF2aXNpYmxlXG4gICAgICAgICAgICAgICAgICAgIHN1Yk9iamVjdC52aXNpYmxlID0gdmlzaWJsZVxuICAgICAgICAgICAgICAgICAgICBzdWJPYmplY3QudmlzaWJsZSA9IHByZXZfdmlzaWJpbGl0aWVzW2ldIGlmIHZpc2libGVcbiAgICAgICAgICAgICAgICAgICAgc3ViT2JqZWN0LnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyBhbGwgc3ViLW9iamVjdHMgYW5kIHNvcnRzIHRoZW0gaWYgbmVjZXNzYXJ5LiBJdCBhbHNvIHJlbW92ZXNcbiAgICAqIGRpc3Bvc2VkIG9iamVjdHMgZnJvbSB0aGUgbGlzdCBvZiBzdWItb2JqZWN0cy5cbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBmb3IgZG9tYWluIGluIEBkb21haW5zXG4gICAgICAgICAgICBzdWJPYmplY3RzID0gQG9iamVjdC5zdWJPYmplY3RzQnlEb21haW5bZG9tYWluXVxuXG4gICAgICAgICAgICBpID0gMFxuICAgICAgICAgICAgd2hpbGUgaSA8IHN1Yk9iamVjdHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgc3ViT2JqZWN0ID0gc3ViT2JqZWN0c1tpXVxuICAgICAgICAgICAgICAgIGlmIHN1Yk9iamVjdD8uYWN0aXZlXG4gICAgICAgICAgICAgICAgICAgIGlmIHN1Yk9iamVjdC5kaXNwb3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViT2JqZWN0c1tpXSA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViT2JqZWN0LnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbmdzLkNvbXBvbmVudF9Eb21haW5Db250YWluZXIgPSBDb21wb25lbnRfRG9tYWluQ29udGFpbmVyXG4iXX0=
//# sourceURL=Component_DomainContainer_45.js