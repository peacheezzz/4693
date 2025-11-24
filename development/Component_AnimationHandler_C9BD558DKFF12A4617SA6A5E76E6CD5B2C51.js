var Component_AnimationHandler,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_AnimationHandler = (function(superClass) {
  extend(Component_AnimationHandler, superClass);


  /**
  * An animation-handler component allows a UI game object to execute
  * a flow of animations. For more information about UI animations, see help-file.
  * 
  * @module ui
  * @class Component_AnimationHandler
  * @extends ui.Component_Handler
  * @memberof ui
  * @constructor
   */

  function Component_AnimationHandler() {
    Component_AnimationHandler.__super__.constructor.apply(this, arguments);

    /**
    * @property initialized
    * @type boolean
    * @protected
     */
    this.initialized = false;

    /**
    * @property waitCounter
    * @type number
    * @protected
     */
    this.waitCounter = 0;

    /**
    * @property pointer
    * @type number
    * @protected
     */
    this.pointer = 0;
  }


  /**
  * Initializes the animation-handler.
  * 
  * @method setup
   */

  Component_AnimationHandler.prototype.setup = function() {
    this.initialized = true;
    return null;
  };


  /**
  * Processes the animation targets and starts the animation on each
  * target object if possible.
  * 
  * @method processTargets
  * @param {Object} animation - The animation to start.
  * @param {gs.Object_Base[]} targets - An array of target objects.
  * @protected
   */

  Component_AnimationHandler.prototype.processTargets = function(animation, targets) {
    var j, len, ref, ref1, target;
    for (j = 0, len = targets.length; j < len; j++) {
      target = targets[j];
      if (animation.type != null) {
        target.visible = true;
        if (animation.components == null) {
          animation.components = [];
        }
        if (!this.object.animator) {
          this.object.animator = new gs.Component_Animator();
          this.object.addComponent(this.object.animator);
        }
        animation.components.push(this.object.animationExecutor.startAnimation(animation, animation.duration, target, this.object.animator));
        target.visible = true;
        animation.executed = !((ref = animation.repeat) != null ? ref : true);
      } else {
        animation.executed = !((ref1 = animation.repeat) != null ? ref1 : true);
      }
    }
    return null;
  };


  /**
  * Clears/Resets the specified animation if necessary.
  * 
  * @method clear
  * @param {Object} descriptor - The animation descriptor
  * @protected
   */

  Component_AnimationHandler.prototype.clear = function(descriptor) {
    var animation, component, j, k, len, len1, ref, ref1, target;
    descriptor.cleared = true;
    descriptor.pointer = 0;
    descriptor.waitCounter = 0;
    ref = descriptor.flow;
    for (j = 0, len = ref.length; j < len; j++) {
      animation = ref[j];
      if (animation.components) {
        ref1 = animation.components;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          component = ref1[k];
          target = this.object;
          target.visible = true;
          animation.executed = false;
          if ((animation.field != null) && (animation.reset != null)) {
            ui.BindingHandler.resolveFieldPath(target, animation.field).set(target, ui.BindingHandler.fieldValue(target, animation.reset || 0));
          }
        }
        animation.components = [];
      }
    }
    this.object.needsFullUpdate = true;
    return null;
  };


  /**
  * Processes the animation flow.
  * 
  * @method processAnimations
  * @param {Object} descriptor - The animation-descriptor containing the animation-flow.
  * @protected
   */

  Component_AnimationHandler.prototype.processAnimations = function(descriptor) {
    var animation, targets;
    while (descriptor.pointer < descriptor.flow.length) {
      animation = descriptor.flow[descriptor.pointer];
      descriptor.pointer++;
      if (!animation.wait && animation.executed) {
        continue;
      }
      targets = animation.target != null ? ui.Component_FormulaHandler.fieldValue(this.object, animation.target) : this.object;
      targets = targets.length != null ? targets : [targets];
      descriptor.cleared = false;
      this.processTargets(animation, targets);
      if (animation.wait) {
        if (animation.type != null) {
          descriptor.waitCounter = animation.duration;
        } else {
          descriptor.waitCounter = animation.wait;
        }
        break;
      }
    }
    return null;
  };


  /**
  * Updates the animations.
  * 
  * @method updateAnimations
   */

  Component_AnimationHandler.prototype.updateAnimations = function() {
    var descriptor, i, j, len, ref, ref1;
    ref = this.object.animations;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      descriptor = ref[i];
      if (this.checkObject(descriptor)) {
        if (descriptor.waitCounter > 0) {
          descriptor.waitCounter--;
          continue;
        }
        if ((descriptor.pointer == null) || descriptor.pointer >= descriptor.flow.length) {
          descriptor.pointer = 0;
        }
        this.processAnimations(descriptor);
      } else if (!descriptor.cleared && ((ref1 = descriptor.clear) != null ? ref1 : true)) {
        this.clear(descriptor);
      }
    }
    return null;
  };


  /**
  * Updates the animation-handler.
  * 
  * @method update
   */

  Component_AnimationHandler.prototype.update = function() {
    this.object.needsUpdate = true;
    return this.updateAnimations();
  };

  return Component_AnimationHandler;

})(ui.Component_Handler);

ui.Component_AnimationHandler = Component_AnimationHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsMEJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7RUFVYSxvQ0FBQTtJQUNULDZEQUFBLFNBQUE7O0FBRUE7Ozs7O0lBS0EsSUFBQyxDQUFBLFdBQUQsR0FBZTs7QUFFZjs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7RUF0QkY7OztBQXdCYjs7Ozs7O3VDQUtBLEtBQUEsR0FBTyxTQUFBO0lBQ0gsSUFBQyxDQUFBLFdBQUQsR0FBZTtBQUVmLFdBQU87RUFISjs7O0FBS1A7Ozs7Ozs7Ozs7dUNBU0EsY0FBQSxHQUFnQixTQUFDLFNBQUQsRUFBWSxPQUFaO0FBQ1osUUFBQTtBQUFBLFNBQUEseUNBQUE7O01BQ0ksSUFBRyxzQkFBSDtRQUNJLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO1FBQ2pCLElBQUksNEJBQUo7VUFBK0IsU0FBUyxDQUFDLFVBQVYsR0FBdUIsR0FBdEQ7O1FBRUEsSUFBRyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBWjtVQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixHQUF1QixJQUFBLEVBQUUsQ0FBQyxrQkFBSCxDQUFBO1VBQ3ZCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQTdCLEVBRko7O1FBSUEsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFyQixDQUEwQixJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGNBQTFCLENBQXlDLFNBQXpDLEVBQW9ELFNBQVMsQ0FBQyxRQUE5RCxFQUF3RSxNQUF4RSxFQUFnRixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXhGLENBQTFCO1FBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7UUFDakIsU0FBUyxDQUFDLFFBQVYsR0FBcUIsQ0FBQywwQ0FB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Ozs7Ozt1Q0FLQSxNQUFBLEdBQVEsU0FBQTtJQUNKLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixHQUFzQjtXQUN0QixJQUFDLENBQUEsZ0JBQUQsQ0FBQTtFQUZJOzs7O0dBMUo2QixFQUFFLENBQUM7O0FBaUs1QyxFQUFFLENBQUMsMEJBQUgsR0FBZ0MiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9BbmltYXRpb25IYW5kbGVyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfQW5pbWF0aW9uSGFuZGxlciBleHRlbmRzIHVpLkNvbXBvbmVudF9IYW5kbGVyXG4gICAgIyMjKlxuICAgICogQW4gYW5pbWF0aW9uLWhhbmRsZXIgY29tcG9uZW50IGFsbG93cyBhIFVJIGdhbWUgb2JqZWN0IHRvIGV4ZWN1dGVcbiAgICAqIGEgZmxvdyBvZiBhbmltYXRpb25zLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBVSSBhbmltYXRpb25zLCBzZWUgaGVscC1maWxlLlxuICAgICogXG4gICAgKiBAbW9kdWxlIHVpXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X0FuaW1hdGlvbkhhbmRsZXJcbiAgICAqIEBleHRlbmRzIHVpLkNvbXBvbmVudF9IYW5kbGVyXG4gICAgKiBAbWVtYmVyb2YgdWlcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBpbml0aWFsaXplZFxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAaW5pdGlhbGl6ZWQgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSB3YWl0Q291bnRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEB3YWl0Q291bnRlciA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgcG9pbnRlclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBwb2ludGVyID0gMFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgYW5pbWF0aW9uLWhhbmRsZXIuXG4gICAgKiBcbiAgICAqIEBtZXRob2Qgc2V0dXBcbiAgICAjIyNcbiAgICBzZXR1cDogLT5cbiAgICAgICAgQGluaXRpYWxpemVkID0geWVzXG4gICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBQcm9jZXNzZXMgdGhlIGFuaW1hdGlvbiB0YXJnZXRzIGFuZCBzdGFydHMgdGhlIGFuaW1hdGlvbiBvbiBlYWNoXG4gICAgKiB0YXJnZXQgb2JqZWN0IGlmIHBvc3NpYmxlLlxuICAgICogXG4gICAgKiBAbWV0aG9kIHByb2Nlc3NUYXJnZXRzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gYW5pbWF0aW9uIC0gVGhlIGFuaW1hdGlvbiB0byBzdGFydC5cbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X0Jhc2VbXX0gdGFyZ2V0cyAtIEFuIGFycmF5IG9mIHRhcmdldCBvYmplY3RzLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBwcm9jZXNzVGFyZ2V0czogKGFuaW1hdGlvbiwgdGFyZ2V0cykgLT5cbiAgICAgICAgZm9yIHRhcmdldCBpbiB0YXJnZXRzXG4gICAgICAgICAgICBpZiBhbmltYXRpb24udHlwZT9cbiAgICAgICAgICAgICAgICB0YXJnZXQudmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgICAgIGlmICFhbmltYXRpb24uY29tcG9uZW50cz8gdGhlbiBhbmltYXRpb24uY29tcG9uZW50cyA9IFtdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIUBvYmplY3QuYW5pbWF0b3IpXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QuYW5pbWF0b3IgPSBuZXcgZ3MuQ29tcG9uZW50X0FuaW1hdG9yKClcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5hZGRDb21wb25lbnQoQG9iamVjdC5hbmltYXRvcilcblxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi5jb21wb25lbnRzLnB1c2goQG9iamVjdC5hbmltYXRpb25FeGVjdXRvci5zdGFydEFuaW1hdGlvbihhbmltYXRpb24sIGFuaW1hdGlvbi5kdXJhdGlvbiwgdGFyZ2V0LCBAb2JqZWN0LmFuaW1hdG9yKSlcblxuICAgICAgICAgICAgICAgIHRhcmdldC52aXNpYmxlID0geWVzXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uLmV4ZWN1dGVkID0gIShhbmltYXRpb24ucmVwZWF0ID8geWVzKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi5leGVjdXRlZCA9ICEoYW5pbWF0aW9uLnJlcGVhdCA/IHllcylcbiAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ2xlYXJzL1Jlc2V0cyB0aGUgc3BlY2lmaWVkIGFuaW1hdGlvbiBpZiBuZWNlc3NhcnkuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yIC0gVGhlIGFuaW1hdGlvbiBkZXNjcmlwdG9yXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICAgICAgIFxuICAgIGNsZWFyOiAoZGVzY3JpcHRvcikgLT5cbiAgICAgICAgZGVzY3JpcHRvci5jbGVhcmVkID0geWVzXG4gICAgICAgIGRlc2NyaXB0b3IucG9pbnRlciA9IDBcbiAgICAgICAgZGVzY3JpcHRvci53YWl0Q291bnRlciA9IDBcbiAgICAgICAgZm9yIGFuaW1hdGlvbiBpbiBkZXNjcmlwdG9yLmZsb3dcbiAgICAgICAgICAgIGlmIGFuaW1hdGlvbi5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgZm9yIGNvbXBvbmVudCBpbiBhbmltYXRpb24uY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICAjY29tcG9uZW50Py5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gQG9iamVjdFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQudmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24uZXhlY3V0ZWQgPSBub1xuICAgICAgICAgICAgICAgICAgICBpZiBhbmltYXRpb24uZmllbGQ/IGFuZCBhbmltYXRpb24ucmVzZXQ/XG4gICAgICAgICAgICAgICAgICAgICAgICB1aS5CaW5kaW5nSGFuZGxlci5yZXNvbHZlRmllbGRQYXRoKHRhcmdldCwgYW5pbWF0aW9uLmZpZWxkKS5zZXQodGFyZ2V0LCB1aS5CaW5kaW5nSGFuZGxlci5maWVsZFZhbHVlKHRhcmdldCwgYW5pbWF0aW9uLnJlc2V0IHx8IDApKVxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi5jb21wb25lbnRzID0gW10gIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAb2JqZWN0Lm5lZWRzRnVsbFVwZGF0ZSA9IHllc1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBQcm9jZXNzZXMgdGhlIGFuaW1hdGlvbiBmbG93LlxuICAgICogXG4gICAgKiBAbWV0aG9kIHByb2Nlc3NBbmltYXRpb25zXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBhbmltYXRpb24tZGVzY3JpcHRvciBjb250YWluaW5nIHRoZSBhbmltYXRpb24tZmxvdy5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgXG4gICAgcHJvY2Vzc0FuaW1hdGlvbnM6IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICB3aGlsZSBkZXNjcmlwdG9yLnBvaW50ZXIgPCBkZXNjcmlwdG9yLmZsb3cubGVuZ3RoXG4gICAgICAgICAgICBhbmltYXRpb24gPSBkZXNjcmlwdG9yLmZsb3dbZGVzY3JpcHRvci5wb2ludGVyXVxuICAgICAgICAgICAgZGVzY3JpcHRvci5wb2ludGVyKytcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgIWFuaW1hdGlvbi53YWl0IGFuZCBhbmltYXRpb24uZXhlY3V0ZWQgdGhlbiBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0YXJnZXRzID0gaWYgYW5pbWF0aW9uLnRhcmdldD8gdGhlbiB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShAb2JqZWN0LCBhbmltYXRpb24udGFyZ2V0KSBlbHNlIEBvYmplY3RcbiAgICAgICAgICAgIHRhcmdldHMgPSBpZiB0YXJnZXRzLmxlbmd0aD8gdGhlbiB0YXJnZXRzIGVsc2UgW3RhcmdldHNdXG4gICAgICAgICAgICBkZXNjcmlwdG9yLmNsZWFyZWQgPSBub1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBAcHJvY2Vzc1RhcmdldHMoYW5pbWF0aW9uLCB0YXJnZXRzKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBhbmltYXRpb24ud2FpdFxuICAgICAgICAgICAgICAgIGlmIGFuaW1hdGlvbi50eXBlP1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yLndhaXRDb3VudGVyID0gYW5pbWF0aW9uLmR1cmF0aW9uXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yLndhaXRDb3VudGVyID0gYW5pbWF0aW9uLndhaXQgI3VpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKEBvYmplY3QsIGFuaW1hdGlvbi53YWl0IHx8IDAsIHllcylcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIGFuaW1hdGlvbnMuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgdXBkYXRlQW5pbWF0aW9uc1xuICAgICMjI1xuICAgIHVwZGF0ZUFuaW1hdGlvbnM6IC0+XG4gICAgICAgIGZvciBkZXNjcmlwdG9yLCBpIGluIEBvYmplY3QuYW5pbWF0aW9uc1xuICAgICAgICAgICAgaWYgQGNoZWNrT2JqZWN0KGRlc2NyaXB0b3IpXG4gICAgICAgICAgICAgICAgaWYgZGVzY3JpcHRvci53YWl0Q291bnRlciA+IDBcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRvci53YWl0Q291bnRlci0tXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKG5vdCBkZXNjcmlwdG9yLnBvaW50ZXI/KSBvciBkZXNjcmlwdG9yLnBvaW50ZXIgPj0gZGVzY3JpcHRvci5mbG93Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yLnBvaW50ZXIgPSAwXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBwcm9jZXNzQW5pbWF0aW9ucyhkZXNjcmlwdG9yKVxuICAgICAgICAgICAgZWxzZSBpZiAhZGVzY3JpcHRvci5jbGVhcmVkIGFuZCAoZGVzY3JpcHRvci5jbGVhciA/IHllcylcbiAgICAgICAgICAgICAgICBAY2xlYXIoZGVzY3JpcHRvcilcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgYW5pbWF0aW9uLWhhbmRsZXIuXG4gICAgKiBcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjICAgXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBAb2JqZWN0Lm5lZWRzVXBkYXRlID0geWVzXG4gICAgICAgIEB1cGRhdGVBbmltYXRpb25zKClcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG51aS5Db21wb25lbnRfQW5pbWF0aW9uSGFuZGxlciA9IENvbXBvbmVudF9BbmltYXRpb25IYW5kbGVyIl19
//# sourceURL=Component_AnimationHandler_139.js