var Component_InputHandler,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_InputHandler = (function(superClass) {
  extend(Component_InputHandler, superClass);


  /**
  * The input-handler component is an interface between the input-system
  * of the basic-engine and the game's event-system. In regular this
  * component is used only by game scene to allow its game objects to
  * receive input-events.
  *
  * Those input-events are necessary to solve the problem which game-object
  * responds to a user-action first by building a responder-chain.
  *
  * @module gs
  * @class Component_InputHandler
  * @extends gs.Component
  * @memberof gs
   */

  function Component_InputHandler() {

    /**
    * Indicates if all input events, such as mouse and keyboard event, should be blocked.
    *
    * @property blockInput
    * @type boolean
    * @default false
     */
    this.blockInput = false;
  }


  /**
  * Sets up event handlers.
  *
  * @method setup
   */

  Component_InputHandler.prototype.setup = function() {
    Component_InputHandler.__super__.setup.apply(this, arguments);
    gs.GlobalEventManager.on("uiAnimationStart", ((function(_this) {
      return function(e) {
        return _this.blockInput = true;
      };
    })(this)), null, this.object);
    return gs.GlobalEventManager.on("uiAnimationFinish", ((function(_this) {
      return function(e) {
        return _this.blockInput = false;
      };
    })(this)), null, this.object);
  };


  /**
  * Disposes the component and removes event handlers.
  *
  * @method dispose
   */

  Component_InputHandler.prototype.dispose = function() {
    Component_InputHandler.__super__.dispose.apply(this, arguments);
    gs.GlobalEventManager.offByOwner("uiAnimationStart", this.object);
    return gs.GlobalEventManager.offByOwner("uiAnimationFinish", this.object);
  };


  /**
  * Updates the component by checking the input-system and firing
  * an input-event if necessary.
  *
  * @method update
   */

  Component_InputHandler.prototype.update = function() {
    if (this.blockInput) {
      return;
    }
    if (Input.Mouse.moved) {
      gs.GlobalEventManager.emit("mouseMoved");
    }
    if (Input.Mouse.buttonDown) {
      gs.GlobalEventManager.emit("mouseDown");
    }
    if (Input.Mouse.buttonUp) {
      gs.GlobalEventManager.emit("mouseUp");
    }
    if (Input.keyDown) {
      gs.GlobalEventManager.emit("keyDown");
    }
    if (Input.keyUp) {
      gs.GlobalEventManager.emit("keyUp");
    }
    if (Input.Mouse.wheelChanged) {
      return gs.GlobalEventManager.emit("mouseWheel");
    }
  };

  return Component_InputHandler;

})(gs.Component);

gs.Component_InputHandler = Component_InputHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsc0JBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7Ozs7O0VBY2EsZ0NBQUE7O0FBQ1Q7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsVUFBRCxHQUFjO0VBUkw7OztBQVViOzs7Ozs7bUNBS0EsS0FBQSxHQUFPLFNBQUE7SUFDSCxtREFBQSxTQUFBO0lBRUEsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQXRCLENBQXlCLGtCQUF6QixFQUE2QyxDQUFDLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQzFDLEtBQUMsQ0FBQSxVQUFELEdBQWM7TUFENEI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUQsQ0FBN0MsRUFFRyxJQUZILEVBRVMsSUFBQyxDQUFBLE1BRlY7V0FHQSxFQUFFLENBQUMsa0JBQWtCLENBQUMsRUFBdEIsQ0FBeUIsbUJBQXpCLEVBQThDLENBQUMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFDM0MsS0FBQyxDQUFBLFVBQUQsR0FBYztNQUQ2QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBRCxDQUE5QyxFQUVHLElBRkgsRUFFUyxJQUFDLENBQUEsTUFGVjtFQU5HOzs7QUFVUDs7Ozs7O21DQUtBLE9BQUEsR0FBUyxTQUFBO0lBQ0wscURBQUEsU0FBQTtJQUNBLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUF0QixDQUFpQyxrQkFBakMsRUFBcUQsSUFBQyxDQUFBLE1BQXREO1dBQ0EsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFVBQXRCLENBQWlDLG1CQUFqQyxFQUFzRCxJQUFDLENBQUEsTUFBdkQ7RUFISzs7O0FBS1Q7Ozs7Ozs7bUNBTUEsTUFBQSxHQUFRLFNBQUE7SUFDSixJQUFVLElBQUMsQ0FBQSxVQUFYO0FBQUEsYUFBQTs7SUFFQSxJQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBZjtNQUNJLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUF0QixDQUEyQixZQUEzQixFQURKOztJQUVBLElBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFmO01BQ0ksRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQXRCLENBQTJCLFdBQTNCLEVBREo7O0lBRUEsSUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQWY7TUFDSSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBdEIsQ0FBMkIsU0FBM0IsRUFESjs7SUFFQSxJQUFHLEtBQUssQ0FBQyxPQUFUO01BQ0ksRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQXRCLENBQTJCLFNBQTNCLEVBREo7O0lBRUEsSUFBRyxLQUFLLENBQUMsS0FBVDtNQUNJLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUF0QixDQUEyQixPQUEzQixFQURKOztJQUVBLElBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFmO2FBQ0ksRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQXRCLENBQTJCLFlBQTNCLEVBREo7O0VBYkk7Ozs7R0F4RHlCLEVBQUUsQ0FBQzs7QUF3RXhDLEVBQUUsQ0FBQyxzQkFBSCxHQUE0QiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X0lucHV0SGFuZGxlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X0lucHV0SGFuZGxlciBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICMjIypcbiAgICAqIFRoZSBpbnB1dC1oYW5kbGVyIGNvbXBvbmVudCBpcyBhbiBpbnRlcmZhY2UgYmV0d2VlbiB0aGUgaW5wdXQtc3lzdGVtXG4gICAgKiBvZiB0aGUgYmFzaWMtZW5naW5lIGFuZCB0aGUgZ2FtZSdzIGV2ZW50LXN5c3RlbS4gSW4gcmVndWxhciB0aGlzXG4gICAgKiBjb21wb25lbnQgaXMgdXNlZCBvbmx5IGJ5IGdhbWUgc2NlbmUgdG8gYWxsb3cgaXRzIGdhbWUgb2JqZWN0cyB0b1xuICAgICogcmVjZWl2ZSBpbnB1dC1ldmVudHMuXG4gICAgKlxuICAgICogVGhvc2UgaW5wdXQtZXZlbnRzIGFyZSBuZWNlc3NhcnkgdG8gc29sdmUgdGhlIHByb2JsZW0gd2hpY2ggZ2FtZS1vYmplY3RcbiAgICAqIHJlc3BvbmRzIHRvIGEgdXNlci1hY3Rpb24gZmlyc3QgYnkgYnVpbGRpbmcgYSByZXNwb25kZXItY2hhaW4uXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9JbnB1dEhhbmRsZXJcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgYWxsIGlucHV0IGV2ZW50cywgc3VjaCBhcyBtb3VzZSBhbmQga2V5Ym9hcmQgZXZlbnQsIHNob3VsZCBiZSBibG9ja2VkLlxuICAgICAgICAqXG4gICAgICAgICogQHByb3BlcnR5IGJsb2NrSW5wdXRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgIyMjXG4gICAgICAgIEBibG9ja0lucHV0ID0gbm9cbiAgICAgXG4gICAgIyMjKlxuICAgICogU2V0cyB1cCBldmVudCBoYW5kbGVycy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgIyMjICAgXG4gICAgc2V0dXA6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIub24gXCJ1aUFuaW1hdGlvblN0YXJ0XCIsICgoZSkgPT5cbiAgICAgICAgICAgIEBibG9ja0lucHV0ID0geWVzXG4gICAgICAgICksIG51bGwsIEBvYmplY3RcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9uIFwidWlBbmltYXRpb25GaW5pc2hcIiwgKChlKSA9PlxuICAgICAgICAgICAgQGJsb2NrSW5wdXQgPSBub1xuICAgICAgICApLCBudWxsLCBAb2JqZWN0XG4gICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIGNvbXBvbmVudCBhbmQgcmVtb3ZlcyBldmVudCBoYW5kbGVycy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAjIyMgICAgXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLm9mZkJ5T3duZXIoXCJ1aUFuaW1hdGlvblN0YXJ0XCIsIEBvYmplY3QpXG4gICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5vZmZCeU93bmVyKFwidWlBbmltYXRpb25GaW5pc2hcIiwgQG9iamVjdClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgY29tcG9uZW50IGJ5IGNoZWNraW5nIHRoZSBpbnB1dC1zeXN0ZW0gYW5kIGZpcmluZ1xuICAgICogYW4gaW5wdXQtZXZlbnQgaWYgbmVjZXNzYXJ5LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICByZXR1cm4gaWYgQGJsb2NrSW5wdXRcbiAgICAgICAgXG4gICAgICAgIGlmIElucHV0Lk1vdXNlLm1vdmVkXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcIm1vdXNlTW92ZWRcIilcbiAgICAgICAgaWYgSW5wdXQuTW91c2UuYnV0dG9uRG93blxuICAgICAgICAgICAgZ3MuR2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoXCJtb3VzZURvd25cIilcbiAgICAgICAgaWYgSW5wdXQuTW91c2UuYnV0dG9uVXBcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KFwibW91c2VVcFwiKVxuICAgICAgICBpZiBJbnB1dC5rZXlEb3duXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcImtleURvd25cIilcbiAgICAgICAgaWYgSW5wdXQua2V5VXBcbiAgICAgICAgICAgIGdzLkdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KFwia2V5VXBcIilcbiAgICAgICAgaWYgSW5wdXQuTW91c2Uud2hlZWxDaGFuZ2VkXG4gICAgICAgICAgICBncy5HbG9iYWxFdmVudE1hbmFnZXIuZW1pdChcIm1vdXNlV2hlZWxcIilcbiAgICAgICAgICAgIFxuZ3MuQ29tcG9uZW50X0lucHV0SGFuZGxlciA9IENvbXBvbmVudF9JbnB1dEhhbmRsZXIiXX0=
//# sourceURL=Component_InputHandler_183.js