var Component_CallSceneInterpreter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_CallSceneInterpreter = (function(superClass) {
  extend(Component_CallSceneInterpreter, superClass);

  Component_CallSceneInterpreter.objectCodecBlackList = gs.Component_CommandInterpreter.objectCodecBlackList;


  /**
  * A command interpreter used as a sub-interpreter to execute CallScene commands. See
  * gs.Component_CommandInterpreter for more information.
  *
  * @module gs
  * @class Component_CallSceneInterpreter
  * @extends gs.Component_CommandInterpreter
  * @memberof gs
   */

  function Component_CallSceneInterpreter() {
    Component_CallSceneInterpreter.__super__.constructor.apply(this, arguments);
  }


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_CallSceneInterpreter.prototype.onDataBundleRestore = function(data, context) {
    var sceneDocument;
    sceneDocument = DataManager.getDocument(this.context.id);
    this.context.set(sceneDocument.uid, sceneDocument);
    return this.object = {
      commands: sceneDocument.items.commands
    };
  };

  return Component_CallSceneInterpreter;

})(gs.Component_CommandInterpreter);

vn.Component_CallSceneInterpreter = Component_CallSceneInterpreter;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsOEJBQUE7RUFBQTs7O0FBQU07OztFQUNGLDhCQUFDLENBQUEsb0JBQUQsR0FBd0IsRUFBRSxDQUFDLDRCQUE0QixDQUFDOzs7QUFFeEQ7Ozs7Ozs7Ozs7RUFTYSx3Q0FBQTtJQUNULGlFQUFBLFNBQUE7RUFEUzs7O0FBRWI7Ozs7Ozs7OzsyQ0FRQSxtQkFBQSxHQUFxQixTQUFDLElBQUQsRUFBTyxPQUFQO0FBQ2pCLFFBQUE7SUFBQSxhQUFBLEdBQWdCLFdBQVcsQ0FBQyxXQUFaLENBQXdCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBakM7SUFDaEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsYUFBYSxDQUFDLEdBQTNCLEVBQWdDLGFBQWhDO1dBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUFFLFFBQUEsRUFBVSxhQUFhLENBQUMsS0FBSyxDQUFDLFFBQWhDOztFQUhPOzs7O0dBdEJvQixFQUFFLENBQUM7O0FBNEJoRCxFQUFFLENBQUMsOEJBQUgsR0FBb0MiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9DYWxsU2NlbmVJbnRlcnByZXRlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X0NhbGxTY2VuZUludGVycHJldGVyIGV4dGVuZHMgZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlclxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IGdzLkNvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXIub2JqZWN0Q29kZWNCbGFja0xpc3RcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBIGNvbW1hbmQgaW50ZXJwcmV0ZXIgdXNlZCBhcyBhIHN1Yi1pbnRlcnByZXRlciB0byBleGVjdXRlIENhbGxTY2VuZSBjb21tYW5kcy4gU2VlXG4gICAgKiBncy5Db21wb25lbnRfQ29tbWFuZEludGVycHJldGVyIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfQ2FsbFNjZW5lSW50ZXJwcmV0ZXJcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXJcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlclxuICAgICMjIypcbiAgICAqIENhbGxlZCBpZiB0aGlzIG9iamVjdCBpbnN0YW5jZSBpcyByZXN0b3JlZCBmcm9tIGEgZGF0YS1idW5kbGUuIEl0IGNhbiBiZSB1c2VkXG4gICAgKiByZS1hc3NpZ24gZXZlbnQtaGFuZGxlciwgYW5vbnltb3VzIGZ1bmN0aW9ucywgZXRjLlxuICAgICogXG4gICAgKiBAbWV0aG9kIG9uRGF0YUJ1bmRsZVJlc3RvcmUuXG4gICAgKiBAcGFyYW0gT2JqZWN0IGRhdGEgLSBUaGUgZGF0YS1idW5kbGVcbiAgICAqIEBwYXJhbSBncy5PYmplY3RDb2RlY0NvbnRleHQgY29udGV4dCAtIFRoZSBjb2RlYy1jb250ZXh0LlxuICAgICMjI1xuICAgIG9uRGF0YUJ1bmRsZVJlc3RvcmU6IChkYXRhLCBjb250ZXh0KSAtPlxuICAgICAgICBzY2VuZURvY3VtZW50ID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoQGNvbnRleHQuaWQpXG4gICAgICAgIEBjb250ZXh0LnNldChzY2VuZURvY3VtZW50LnVpZCwgc2NlbmVEb2N1bWVudClcbiAgICAgICAgQG9iamVjdCA9IHsgY29tbWFuZHM6IHNjZW5lRG9jdW1lbnQuaXRlbXMuY29tbWFuZHMgfVxuICAgICAgICAgICAgXG4gICAgXG52bi5Db21wb25lbnRfQ2FsbFNjZW5lSW50ZXJwcmV0ZXIgPSBDb21wb25lbnRfQ2FsbFNjZW5lSW50ZXJwcmV0ZXIiXX0=
//# sourceURL=Component_CallSceneInterpreter_33.js