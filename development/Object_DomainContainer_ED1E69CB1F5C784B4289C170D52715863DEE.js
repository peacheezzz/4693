var Object_DomainContainer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_DomainContainer = (function(superClass) {
  extend(Object_DomainContainer, superClass);


  /**
  * A game object which can contain other game objects by domain.
  *
  * @module gs
  * @class Object_DomainContainer
  * @extends gs.Object_Base
  * @memberof gs
  * @constructor
   */

  function Object_DomainContainer(disposeBehavior) {
    Object_DomainContainer.__super__.constructor.apply(this, arguments);

    /**
    * Indiciates if the container and its sub objects are visible on screen.
    * @property visible
    * @type boolean
     */
    this.visible = true;

    /**
    * All sub-objects by domain. The default domain is an empty string.
    * @property subObjectsByDomain
    * @type Object
     */
    this.subObjectsByDomain = {
      "com.degica.vnm.default": this.subObjects
    };

    /**
    * The container's behavior component.
    * @property behavior
    * @type gs.Component_DomainContainer
     */
    this.behavior = new gs.Component_DomainContainer(disposeBehavior);
    this.addComponent(this.behavior);
  }

  return Object_DomainContainer;

})(gs.Object_Base);

gs.Object_DomainContainer = Object_DomainContainer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsc0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OztFQVNhLGdDQUFDLGVBQUQ7SUFDVCx5REFBQSxTQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7O0lBS0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCO01BQUUsd0JBQUEsRUFBMEIsSUFBQyxDQUFBLFVBQTdCOzs7QUFFdEI7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxFQUFFLENBQUMseUJBQUgsQ0FBNkIsZUFBN0I7SUFFaEIsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsUUFBZjtFQXhCUzs7OztHQVZvQixFQUFFLENBQUM7O0FBb0N4QyxFQUFFLENBQUMsc0JBQUgsR0FBNEIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9Eb21haW5Db250YWluZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdF9Eb21haW5Db250YWluZXIgZXh0ZW5kcyBncy5PYmplY3RfQmFzZVxuICAgICMjIypcbiAgICAqIEEgZ2FtZSBvYmplY3Qgd2hpY2ggY2FuIGNvbnRhaW4gb3RoZXIgZ2FtZSBvYmplY3RzIGJ5IGRvbWFpbi5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgT2JqZWN0X0RvbWFpbkNvbnRhaW5lclxuICAgICogQGV4dGVuZHMgZ3MuT2JqZWN0X0Jhc2VcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChkaXNwb3NlQmVoYXZpb3IpIC0+XG4gICAgICAgIHN1cGVyXG4gICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2lhdGVzIGlmIHRoZSBjb250YWluZXIgYW5kIGl0cyBzdWIgb2JqZWN0cyBhcmUgdmlzaWJsZSBvbiBzY3JlZW4uXG4gICAgICAgICogQHByb3BlcnR5IHZpc2libGVcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAdmlzaWJsZSA9IHllc1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCBzdWItb2JqZWN0cyBieSBkb21haW4uIFRoZSBkZWZhdWx0IGRvbWFpbiBpcyBhbiBlbXB0eSBzdHJpbmcuXG4gICAgICAgICogQHByb3BlcnR5IHN1Yk9iamVjdHNCeURvbWFpblxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQHN1Yk9iamVjdHNCeURvbWFpbiA9IHsgXCJjb20uZGVnaWNhLnZubS5kZWZhdWx0XCI6IEBzdWJPYmplY3RzIH1cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY29udGFpbmVyJ3MgYmVoYXZpb3IgY29tcG9uZW50LlxuICAgICAgICAqIEBwcm9wZXJ0eSBiZWhhdmlvclxuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudF9Eb21haW5Db250YWluZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBiZWhhdmlvciA9IG5ldyBncy5Db21wb25lbnRfRG9tYWluQ29udGFpbmVyKGRpc3Bvc2VCZWhhdmlvcilcbiAgICBcbiAgICAgICAgQGFkZENvbXBvbmVudChAYmVoYXZpb3IpXG4gICAgICAgIFxuZ3MuT2JqZWN0X0RvbWFpbkNvbnRhaW5lciA9IE9iamVjdF9Eb21haW5Db250YWluZXIiXX0=
//# sourceURL=Object_DomainContainer_114.js