var Object_Scene,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Scene = (function(superClass) {
  extend(Object_Scene, superClass);

  Object_Scene.accessors("visible", {
    set: function(v) {
      if (v !== this.visible_) {
        this.visible_ = v;
        this.needsUpdate = true;
        return this.fullRefresh();
      }
    },
    get: function() {
      return this.visible_ && (!this.parent || this.parent.visible);
    }
  });


  /**
  * A scene object manages a whole visual novel scene with backgrounds, characters,
  * messages, etc.
  *
  * @module vn
  * @class Object_Scene
  * @extends gs.Object_Base
  * @memberof vn
  * @constructor
   */

  function Object_Scene() {
    Object_Scene.__super__.constructor.call(this);

    /**
    * Indicates that the scene is still in prepare-state and not ready yet.
    * @property preparing
    * @type boolean
     */
    this.preparing = true;

    /**
    * The behavior-component for the VN scene specific behavior.
    * @property behavior
    * @type gs.Component_GameSceneBehavior
     */
    this.behavior = new vn.Component_GameSceneBehavior();

    /**
    * An interpreter to execute the commands of scene.
    * @property interpreter
    * @type gs.Component_CommandInterpreter
     */
    this.interpreter = new gs.Component_CommandInterpreter();

    /**
    * An event-emitter to emit events.
    * @property events
    * @type gs.Component_EventEmitter
     */
    this.events = new gs.Component_EventEmitter();

    /**
    * Contains all background objects of the scene.
    * @property backgroundContainer
    * @type gs.Object_Container
     */
    this.backgroundContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all character objects of the scene.
    * @property characterContainer
    * @type gs.Object_Container
     */
    this.characterContainer = new gs.Object_Container(gs.ContainerDisposeBehavior.REMOVE);

    /**
    * Contains all picture objects of the scene.
    * @property pictureContainer
    * @type gs.Object_Container
     */
    this.pictureContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all video objects of the scene.
    * @property videoContainer
    * @type gs.Object_Container
     */
    this.videoContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all text objects of the scene.
    * @property textContainer
    * @type gs.Object_Container
     */
    this.textContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all hotspot objects of the scene.
    * @property hotspotContainer
    * @type gs.Object_Container
     */
    this.hotspotContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all common events which are running parallel/auto to the scene.
    * @property commonEventContainer
    * @type gs.Object_Container
     */
    this.commonEventContainer = new gs.Object_Container(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all viewports which are used to create multi-layered screen effects.
    * @property viewportContainer
    * @type gs.Object_Container
     */
    this.viewportContainer = new gs.Object_Container(gs.ContainerDisposeBehavior.REMOVE);

    /**
    * Contains all interval timers.
    * @property timerContainer
    * @type gs.Object_Container
     */
    this.timerContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);

    /**
    * Contains all message areas of the scene.
    * @property messageAreaContainer
    * @type gs.Object_Container
     */
    this.messageAreaContainer = new gs.Object_DomainContainer(gs.ContainerDisposeBehavior.NULL);
    this.characterContainer.visible = true;

    /**
    * All picture objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property pictures
    * @type gs.Object_Picture[]
    * @readOnly
     */
    this.pictures = this.pictureContainer.subObjects;

    /**
    * All video objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property videos
    * @type gs.Object_Video[]
    * @readOnly
     */
    this.videos = this.videoContainer.subObjects;

    /**
    * All text objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property texts
    * @type gs.Object_Text[]
    * @readOnly
     */
    this.texts = this.textContainer.subObjects;

    /**
    * All character objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property characters
    * @type gs.Object_Character[]
    * @readOnly
     */
    this.characters = this.characterContainer.subObjects;

    /**
    * All backgrounds as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property backgrounds
    * @type gs.Object_Background[]
    * @readOnly
     */
    this.backgrounds = this.backgroundContainer.subObjects;

    /**
    * All hotspot objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property hotspots
    * @type gs.Object_Hotspot[]
    * @readOnly
     */
    this.hotspots = this.hotspotContainer.subObjects;

    /**
    * All interval timer objects as array. That is the same like accessing the <b>subObjects</b> of the
    * container object.
    * @property timers
    * @type gs.Object_IntervalTimer[]
    * @readOnly
     */
    this.timers = this.timerContainer.subObjects;

    /**
    * All message areas as array.
    * @property messageAreas
    * @type vn.MessageArea[]
    * @readOnly
     */
    this.messageAreas = this.messageAreaContainer.subObjects;

    /**
    * The current list of choices which should be displayed
    * on the screen. New choices are usually added using
    * Add Choice command in Scene Editor before all choices are
    * displayed via Show Choices command.
    * @property choices
    * @type vn.Choice[]
     */
    this.choices = [];

    /**
    * A timer object used for choices with time-limit.
    * @property choiceTimer
    * @type gs.Object_Timer
     */
    this.choiceTimer = new gs.Object_Timer();

    /**
    * Indicates if the UI layout is visible.
    * @property visible
    * @type boolean
     */
    this.visible = true;

    /**
    * @property visible_
    * @type boolean
    * @protected
     */
    this.visible_ = true;

    /**
    * The game settings.
    * @property settings
    * @type Object
     */
    this.settings = GameManager.settings;

    /**
    * Temporary settings like skip, etc.
    * @property tempSettings
    * @type Object
     */
    this.tempSettings = GameManager.tempSettings;

    /**
    * Contains all data necessary to construct the scene.
    * @property sceneData
    * @type Object
     */
    this.sceneData = GameManager.sceneData;
    this.addObject(this.backgroundContainer);
    this.addObject(this.characterContainer);
    this.addObject(this.pictureContainer);
    this.addObject(this.textContainer);
    this.addObject(this.videoContainer);
    this.addObject(this.hotspotContainer);
    this.addObject(this.viewportContainer);
    this.addObject(this.commonEventContainer);
    this.addObject(this.timerContainer);
    this.addObject(this.choiceTimer);
    this.addObject(this.messageAreaContainer);
    this.addComponent(new gs.Component_InputHandler());
    this.addComponent(this.behavior);
    this.addComponent(this.interpreter);
  }

  return Object_Scene;

})(gs.Object_Base);

vn.Object_Scene = Object_Scene;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsWUFBQTtFQUFBOzs7QUFBTTs7O0VBS0YsWUFBQyxDQUFBLFNBQUQsQ0FBVyxTQUFYLEVBQ0k7SUFBQSxHQUFBLEVBQUssU0FBQyxDQUFEO01BQ0QsSUFBRyxDQUFBLEtBQUssSUFBQyxDQUFBLFFBQVQ7UUFDSSxJQUFDLENBQUEsUUFBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLFdBQUQsR0FBZTtlQUNmLElBQUMsQ0FBQSxXQUFELENBQUEsRUFISjs7SUFEQyxDQUFMO0lBTUEsR0FBQSxFQUFLLFNBQUE7YUFBRyxJQUFDLENBQUEsUUFBRCxJQUFjLENBQUMsQ0FBQyxJQUFDLENBQUEsTUFBRixJQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBckI7SUFBakIsQ0FOTDtHQURKOzs7QUFTQTs7Ozs7Ozs7Ozs7RUFVYSxzQkFBQTtJQUNULDRDQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELEdBQWE7O0FBRWI7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxFQUFFLENBQUMsMkJBQUgsQ0FBQTs7QUFFaEI7Ozs7O0lBS0EsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxFQUFFLENBQUMsNEJBQUgsQ0FBQTs7QUFFbkI7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxzQkFBSCxDQUFBOztBQUVkOzs7OztJQUtBLElBQUMsQ0FBQSxtQkFBRCxHQUEyQixJQUFBLEVBQUUsQ0FBQyxzQkFBSCxDQUEwQixFQUFFLENBQUMsd0JBQXdCLENBQUMsSUFBdEQ7O0FBRTNCOzs7OztJQUtBLElBQUMsQ0FBQSxrQkFBRCxHQUEwQixJQUFBLEVBQUUsQ0FBQyxnQkFBSCxDQUFvQixFQUFFLENBQUMsd0JBQXdCLENBQUMsTUFBaEQ7O0FBRTFCOzs7OztJQUtBLElBQUMsQ0FBQSxnQkFBRCxHQUF3QixJQUFBLEVBQUUsQ0FBQyxzQkFBSCxDQUEwQixFQUFFLENBQUMsd0JBQXdCLENBQUMsSUFBdEQ7O0FBRXhCOzs7OztJQUtBLElBQUMsQ0FBQSxjQUFELEdBQXNCLElBQUEsRUFBRSxDQUFDLHNCQUFILENBQTBCLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxJQUF0RDs7QUFFdEI7Ozs7O0lBS0EsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxFQUFFLENBQUMsc0JBQUgsQ0FBMEIsRUFBRSxDQUFDLHdCQUF3QixDQUFDLElBQXREOztBQUVyQjs7Ozs7SUFLQSxJQUFDLENBQUEsZ0JBQUQsR0FBd0IsSUFBQSxFQUFFLENBQUMsc0JBQUgsQ0FBMEIsRUFBRSxDQUFDLHdCQUF3QixDQUFDLElBQXREOztBQUV4Qjs7Ozs7SUFLQSxJQUFDLENBQUEsb0JBQUQsR0FBNEIsSUFBQSxFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsRUFBRSxDQUFDLHdCQUF3QixDQUFDLElBQWhEOztBQUU1Qjs7Ozs7SUFLQSxJQUFDLENBQUEsaUJBQUQsR0FBeUIsSUFBQSxFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsRUFBRSxDQUFDLHdCQUF3QixDQUFDLE1BQWhEOztBQUV6Qjs7Ozs7SUFLQSxJQUFDLENBQUEsY0FBRCxHQUFzQixJQUFBLEVBQUUsQ0FBQyxzQkFBSCxDQUEwQixFQUFFLENBQUMsd0JBQXdCLENBQUMsSUFBdEQ7O0FBRXRCOzs7OztJQUtBLElBQUMsQ0FBQSxvQkFBRCxHQUE0QixJQUFBLEVBQUUsQ0FBQyxzQkFBSCxDQUEwQixFQUFFLENBQUMsd0JBQXdCLENBQUMsSUFBdEQ7SUFFNUIsSUFBQyxDQUFBLGtCQUFrQixDQUFDLE9BQXBCLEdBQThCOztBQUU5Qjs7Ozs7OztJQU9BLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLGdCQUFnQixDQUFDOztBQUU5Qjs7Ozs7OztJQU9BLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLGNBQWMsQ0FBQzs7QUFFMUI7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxhQUFhLENBQUM7O0FBRXhCOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsa0JBQWtCLENBQUM7O0FBRWxDOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsbUJBQW1CLENBQUM7O0FBRXBDOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsZ0JBQWdCLENBQUM7O0FBRTlCOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsY0FBYyxDQUFDOztBQUUxQjs7Ozs7O0lBTUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLG9CQUFvQixDQUFDOztBQUV0Qzs7Ozs7Ozs7SUFRQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUVYOzs7OztJQUtBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsRUFBRSxDQUFDLFlBQUgsQ0FBQTs7QUFFbkI7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQVksV0FBVyxDQUFDOztBQUV4Qjs7Ozs7SUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQixXQUFXLENBQUM7O0FBRTVCOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELEdBQWEsV0FBVyxDQUFDO0lBRXpCLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLG1CQUFaO0lBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsa0JBQVo7SUFDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxnQkFBWjtJQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLGFBQVo7SUFDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxjQUFaO0lBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsZ0JBQVo7SUFDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxpQkFBWjtJQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLG9CQUFaO0lBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsY0FBWjtJQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLFdBQVo7SUFDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxvQkFBWjtJQUdBLElBQUMsQ0FBQSxZQUFELENBQWtCLElBQUEsRUFBRSxDQUFDLHNCQUFILENBQUEsQ0FBbEI7SUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxRQUFmO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsV0FBZjtFQWpQUzs7OztHQXhCVSxFQUFFLENBQUM7O0FBNFE5QixFQUFFLENBQUMsWUFBSCxHQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogT2JqZWN0X1NjZW5lXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBPYmplY3RfU2NlbmUgZXh0ZW5kcyBncy5PYmplY3RfQmFzZVxuICAjICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJwYXJlbnRcIiwgXCJzdWJPYmplY3RzXCIsIFwicHJlcGFyaW5nXCIsIFwiYmVoYXZpb3JcIiwgXCJpbnRlcnByZXRlclwiLCBcImV2ZW50c1wiLCBcInNjZW5lRGF0YVwiLFxuICAjICBcImNoYXJhY3RlckNvbnRhaW5lclwiLCBcInBpY3R1cmVDb250YWluZXJcIiwgXCJ0ZXh0Q29udGFpbmVyXCIsIFwidmlkZW9Db250YWluZXJcIiwgXCJtZXNzYWdlQXJlYXNcIiwgXCJob3RzcG90Q29udGFpbmVyXCIsIFwiY29tbW9uRXZlbnRDb250YWluZXJcIixcbiAgIyAgXCJwaWN0dXJlc1wiLCBcInRleHRzXCIsIFwidmlkZW9zXCIsIFwibWVzc2FnZUFyZWFzXCIsIFwiaG90c3BvdHNcIiwgXCJjb21tb25FdmVudHNcIiwgXCJsYXlvdXRcIiwgXCJsYXlvdXROVkxcIl1cbiAgICBcbiAgICBAYWNjZXNzb3JzIFwidmlzaWJsZVwiLCBcbiAgICAgICAgc2V0OiAodikgLT4gXG4gICAgICAgICAgICBpZiB2ICE9IEB2aXNpYmxlX1xuICAgICAgICAgICAgICAgIEB2aXNpYmxlXyA9IHZcbiAgICAgICAgICAgICAgICBAbmVlZHNVcGRhdGUgPSB5ZXNcbiAgICAgICAgICAgICAgICBAZnVsbFJlZnJlc2goKVxuICAgICAgICAgICAgXG4gICAgICAgIGdldDogLT4gQHZpc2libGVfIGFuZCAoIUBwYXJlbnQgb3IgQHBhcmVudC52aXNpYmxlKVxuICAgIFxuICAgICMjIypcbiAgICAqIEEgc2NlbmUgb2JqZWN0IG1hbmFnZXMgYSB3aG9sZSB2aXN1YWwgbm92ZWwgc2NlbmUgd2l0aCBiYWNrZ3JvdW5kcywgY2hhcmFjdGVycyxcbiAgICAqIG1lc3NhZ2VzLCBldGMuXG4gICAgKlxuICAgICogQG1vZHVsZSB2blxuICAgICogQGNsYXNzIE9iamVjdF9TY2VuZVxuICAgICogQGV4dGVuZHMgZ3MuT2JqZWN0X0Jhc2VcbiAgICAqIEBtZW1iZXJvZiB2blxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjICAgIFxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIHRoYXQgdGhlIHNjZW5lIGlzIHN0aWxsIGluIHByZXBhcmUtc3RhdGUgYW5kIG5vdCByZWFkeSB5ZXQuXG4gICAgICAgICogQHByb3BlcnR5IHByZXBhcmluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEBwcmVwYXJpbmcgPSB5ZXNcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgYmVoYXZpb3ItY29tcG9uZW50IGZvciB0aGUgVk4gc2NlbmUgc3BlY2lmaWMgYmVoYXZpb3IuXG4gICAgICAgICogQHByb3BlcnR5IGJlaGF2aW9yXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yXG4gICAgICAgICMjI1xuICAgICAgICBAYmVoYXZpb3IgPSBuZXcgdm4uQ29tcG9uZW50X0dhbWVTY2VuZUJlaGF2aW9yKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbiBpbnRlcnByZXRlciB0byBleGVjdXRlIHRoZSBjb21tYW5kcyBvZiBzY2VuZS5cbiAgICAgICAgKiBAcHJvcGVydHkgaW50ZXJwcmV0ZXJcbiAgICAgICAgKiBAdHlwZSBncy5Db21wb25lbnRfQ29tbWFuZEludGVycHJldGVyXG4gICAgICAgICMjI1xuICAgICAgICBAaW50ZXJwcmV0ZXIgPSBuZXcgZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlcigpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQW4gZXZlbnQtZW1pdHRlciB0byBlbWl0IGV2ZW50cy5cbiAgICAgICAgKiBAcHJvcGVydHkgZXZlbnRzXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X0V2ZW50RW1pdHRlclxuICAgICAgICAjIyNcbiAgICAgICAgQGV2ZW50cyA9IG5ldyBncy5Db21wb25lbnRfRXZlbnRFbWl0dGVyKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250YWlucyBhbGwgYmFja2dyb3VuZCBvYmplY3RzIG9mIHRoZSBzY2VuZS5cbiAgICAgICAgKiBAcHJvcGVydHkgYmFja2dyb3VuZENvbnRhaW5lclxuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9Db250YWluZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBiYWNrZ3JvdW5kQ29udGFpbmVyID0gbmV3IGdzLk9iamVjdF9Eb21haW5Db250YWluZXIoZ3MuQ29udGFpbmVyRGlzcG9zZUJlaGF2aW9yLk5VTEwpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ29udGFpbnMgYWxsIGNoYXJhY3RlciBvYmplY3RzIG9mIHRoZSBzY2VuZS5cbiAgICAgICAgKiBAcHJvcGVydHkgY2hhcmFjdGVyQ29udGFpbmVyXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0NvbnRhaW5lclxuICAgICAgICAjIyNcbiAgICAgICAgQGNoYXJhY3RlckNvbnRhaW5lciA9IG5ldyBncy5PYmplY3RfQ29udGFpbmVyKGdzLkNvbnRhaW5lckRpc3Bvc2VCZWhhdmlvci5SRU1PVkUpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ29udGFpbnMgYWxsIHBpY3R1cmUgb2JqZWN0cyBvZiB0aGUgc2NlbmUuXG4gICAgICAgICogQHByb3BlcnR5IHBpY3R1cmVDb250YWluZXJcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29udGFpbmVyXG4gICAgICAgICMjI1xuICAgICAgICBAcGljdHVyZUNvbnRhaW5lciA9IG5ldyBncy5PYmplY3RfRG9tYWluQ29udGFpbmVyKGdzLkNvbnRhaW5lckRpc3Bvc2VCZWhhdmlvci5OVUxMKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENvbnRhaW5zIGFsbCB2aWRlbyBvYmplY3RzIG9mIHRoZSBzY2VuZS5cbiAgICAgICAgKiBAcHJvcGVydHkgdmlkZW9Db250YWluZXJcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29udGFpbmVyXG4gICAgICAgICMjI1xuICAgICAgICBAdmlkZW9Db250YWluZXIgPSBuZXcgZ3MuT2JqZWN0X0RvbWFpbkNvbnRhaW5lcihncy5Db250YWluZXJEaXNwb3NlQmVoYXZpb3IuTlVMTClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250YWlucyBhbGwgdGV4dCBvYmplY3RzIG9mIHRoZSBzY2VuZS5cbiAgICAgICAgKiBAcHJvcGVydHkgdGV4dENvbnRhaW5lclxuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9Db250YWluZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZXh0Q29udGFpbmVyID0gbmV3IGdzLk9iamVjdF9Eb21haW5Db250YWluZXIoZ3MuQ29udGFpbmVyRGlzcG9zZUJlaGF2aW9yLk5VTEwpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ29udGFpbnMgYWxsIGhvdHNwb3Qgb2JqZWN0cyBvZiB0aGUgc2NlbmUuXG4gICAgICAgICogQHByb3BlcnR5IGhvdHNwb3RDb250YWluZXJcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29udGFpbmVyXG4gICAgICAgICMjI1xuICAgICAgICBAaG90c3BvdENvbnRhaW5lciA9IG5ldyBncy5PYmplY3RfRG9tYWluQ29udGFpbmVyKGdzLkNvbnRhaW5lckRpc3Bvc2VCZWhhdmlvci5OVUxMKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENvbnRhaW5zIGFsbCBjb21tb24gZXZlbnRzIHdoaWNoIGFyZSBydW5uaW5nIHBhcmFsbGVsL2F1dG8gdG8gdGhlIHNjZW5lLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb21tb25FdmVudENvbnRhaW5lclxuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9Db250YWluZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBjb21tb25FdmVudENvbnRhaW5lciA9IG5ldyBncy5PYmplY3RfQ29udGFpbmVyKGdzLkNvbnRhaW5lckRpc3Bvc2VCZWhhdmlvci5OVUxMKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENvbnRhaW5zIGFsbCB2aWV3cG9ydHMgd2hpY2ggYXJlIHVzZWQgdG8gY3JlYXRlIG11bHRpLWxheWVyZWQgc2NyZWVuIGVmZmVjdHMuXG4gICAgICAgICogQHByb3BlcnR5IHZpZXdwb3J0Q29udGFpbmVyXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0NvbnRhaW5lclxuICAgICAgICAjIyNcbiAgICAgICAgQHZpZXdwb3J0Q29udGFpbmVyID0gbmV3IGdzLk9iamVjdF9Db250YWluZXIoZ3MuQ29udGFpbmVyRGlzcG9zZUJlaGF2aW9yLlJFTU9WRSlcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250YWlucyBhbGwgaW50ZXJ2YWwgdGltZXJzLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0aW1lckNvbnRhaW5lclxuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9Db250YWluZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEB0aW1lckNvbnRhaW5lciA9IG5ldyBncy5PYmplY3RfRG9tYWluQ29udGFpbmVyKGdzLkNvbnRhaW5lckRpc3Bvc2VCZWhhdmlvci5OVUxMKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIENvbnRhaW5zIGFsbCBtZXNzYWdlIGFyZWFzIG9mIHRoZSBzY2VuZS5cbiAgICAgICAgKiBAcHJvcGVydHkgbWVzc2FnZUFyZWFDb250YWluZXJcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQ29udGFpbmVyXG4gICAgICAgICMjI1xuICAgICAgICBAbWVzc2FnZUFyZWFDb250YWluZXIgPSBuZXcgZ3MuT2JqZWN0X0RvbWFpbkNvbnRhaW5lcihncy5Db250YWluZXJEaXNwb3NlQmVoYXZpb3IuTlVMTClcbiAgICAgICAgXG4gICAgICAgIEBjaGFyYWN0ZXJDb250YWluZXIudmlzaWJsZSA9IHllc1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCBwaWN0dXJlIG9iamVjdHMgYXMgYXJyYXkuIFRoYXQgaXMgdGhlIHNhbWUgbGlrZSBhY2Nlc3NpbmcgdGhlIDxiPnN1Yk9iamVjdHM8L2I+IG9mIHRoZVxuICAgICAgICAqIGNvbnRhaW5lciBvYmplY3QuXG4gICAgICAgICogQHByb3BlcnR5IHBpY3R1cmVzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X1BpY3R1cmVbXVxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQHBpY3R1cmVzID0gQHBpY3R1cmVDb250YWluZXIuc3ViT2JqZWN0c1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCB2aWRlbyBvYmplY3RzIGFzIGFycmF5LiBUaGF0IGlzIHRoZSBzYW1lIGxpa2UgYWNjZXNzaW5nIHRoZSA8Yj5zdWJPYmplY3RzPC9iPiBvZiB0aGVcbiAgICAgICAgKiBjb250YWluZXIgb2JqZWN0LlxuICAgICAgICAqIEBwcm9wZXJ0eSB2aWRlb3NcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfVmlkZW9bXVxuICAgICAgICAqIEByZWFkT25seVxuICAgICAgICAjIyNcbiAgICAgICAgQHZpZGVvcyA9IEB2aWRlb0NvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQWxsIHRleHQgb2JqZWN0cyBhcyBhcnJheS4gVGhhdCBpcyB0aGUgc2FtZSBsaWtlIGFjY2Vzc2luZyB0aGUgPGI+c3ViT2JqZWN0czwvYj4gb2YgdGhlXG4gICAgICAgICogY29udGFpbmVyIG9iamVjdC5cbiAgICAgICAgKiBAcHJvcGVydHkgdGV4dHNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfVGV4dFtdXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAdGV4dHMgPSBAdGV4dENvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQWxsIGNoYXJhY3RlciBvYmplY3RzIGFzIGFycmF5LiBUaGF0IGlzIHRoZSBzYW1lIGxpa2UgYWNjZXNzaW5nIHRoZSA8Yj5zdWJPYmplY3RzPC9iPiBvZiB0aGVcbiAgICAgICAgKiBjb250YWluZXIgb2JqZWN0LlxuICAgICAgICAqIEBwcm9wZXJ0eSBjaGFyYWN0ZXJzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0NoYXJhY3RlcltdXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAY2hhcmFjdGVycyA9IEBjaGFyYWN0ZXJDb250YWluZXIuc3ViT2JqZWN0c1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCBiYWNrZ3JvdW5kcyBhcyBhcnJheS4gVGhhdCBpcyB0aGUgc2FtZSBsaWtlIGFjY2Vzc2luZyB0aGUgPGI+c3ViT2JqZWN0czwvYj4gb2YgdGhlXG4gICAgICAgICogY29udGFpbmVyIG9iamVjdC5cbiAgICAgICAgKiBAcHJvcGVydHkgYmFja2dyb3VuZHNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQmFja2dyb3VuZFtdXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAYmFja2dyb3VuZHMgPSBAYmFja2dyb3VuZENvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQWxsIGhvdHNwb3Qgb2JqZWN0cyBhcyBhcnJheS4gVGhhdCBpcyB0aGUgc2FtZSBsaWtlIGFjY2Vzc2luZyB0aGUgPGI+c3ViT2JqZWN0czwvYj4gb2YgdGhlXG4gICAgICAgICogY29udGFpbmVyIG9iamVjdC5cbiAgICAgICAgKiBAcHJvcGVydHkgaG90c3BvdHNcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfSG90c3BvdFtdXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAaG90c3BvdHMgPSBAaG90c3BvdENvbnRhaW5lci5zdWJPYmplY3RzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQWxsIGludGVydmFsIHRpbWVyIG9iamVjdHMgYXMgYXJyYXkuIFRoYXQgaXMgdGhlIHNhbWUgbGlrZSBhY2Nlc3NpbmcgdGhlIDxiPnN1Yk9iamVjdHM8L2I+IG9mIHRoZVxuICAgICAgICAqIGNvbnRhaW5lciBvYmplY3QuXG4gICAgICAgICogQHByb3BlcnR5IHRpbWVyc1xuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9JbnRlcnZhbFRpbWVyW11cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEB0aW1lcnMgPSBAdGltZXJDb250YWluZXIuc3ViT2JqZWN0c1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFsbCBtZXNzYWdlIGFyZWFzIGFzIGFycmF5LlxuICAgICAgICAqIEBwcm9wZXJ0eSBtZXNzYWdlQXJlYXNcbiAgICAgICAgKiBAdHlwZSB2bi5NZXNzYWdlQXJlYVtdXG4gICAgICAgICogQHJlYWRPbmx5XG4gICAgICAgICMjI1xuICAgICAgICBAbWVzc2FnZUFyZWFzID0gQG1lc3NhZ2VBcmVhQ29udGFpbmVyLnN1Yk9iamVjdHNcbiAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjdXJyZW50IGxpc3Qgb2YgY2hvaWNlcyB3aGljaCBzaG91bGQgYmUgZGlzcGxheWVkXG4gICAgICAgICogb24gdGhlIHNjcmVlbi4gTmV3IGNob2ljZXMgYXJlIHVzdWFsbHkgYWRkZWQgdXNpbmdcbiAgICAgICAgKiBBZGQgQ2hvaWNlIGNvbW1hbmQgaW4gU2NlbmUgRWRpdG9yIGJlZm9yZSBhbGwgY2hvaWNlcyBhcmVcbiAgICAgICAgKiBkaXNwbGF5ZWQgdmlhIFNob3cgQ2hvaWNlcyBjb21tYW5kLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjaG9pY2VzXG4gICAgICAgICogQHR5cGUgdm4uQ2hvaWNlW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBjaG9pY2VzID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBIHRpbWVyIG9iamVjdCB1c2VkIGZvciBjaG9pY2VzIHdpdGggdGltZS1saW1pdC5cbiAgICAgICAgKiBAcHJvcGVydHkgY2hvaWNlVGltZXJcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfVGltZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBjaG9pY2VUaW1lciA9IG5ldyBncy5PYmplY3RfVGltZXIoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgVUkgbGF5b3V0IGlzIHZpc2libGUuXG4gICAgICAgICogQHByb3BlcnR5IHZpc2libGVcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAdmlzaWJsZSA9IHllc1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSB2aXNpYmxlX1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAdmlzaWJsZV8gPSB5ZXNcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZ2FtZSBzZXR0aW5ncy5cbiAgICAgICAgKiBAcHJvcGVydHkgc2V0dGluZ3NcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBzZXR0aW5ncyA9IEdhbWVNYW5hZ2VyLnNldHRpbmdzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGVtcG9yYXJ5IHNldHRpbmdzIGxpa2Ugc2tpcCwgZXRjLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0ZW1wU2V0dGluZ3NcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZW1wU2V0dGluZ3MgPSBHYW1lTWFuYWdlci50ZW1wU2V0dGluZ3NcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDb250YWlucyBhbGwgZGF0YSBuZWNlc3NhcnkgdG8gY29uc3RydWN0IHRoZSBzY2VuZS5cbiAgICAgICAgKiBAcHJvcGVydHkgc2NlbmVEYXRhXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAc2NlbmVEYXRhID0gR2FtZU1hbmFnZXIuc2NlbmVEYXRhXG4gICAgICAgIFxuICAgICAgICBAYWRkT2JqZWN0KEBiYWNrZ3JvdW5kQ29udGFpbmVyKVxuICAgICAgICBAYWRkT2JqZWN0KEBjaGFyYWN0ZXJDb250YWluZXIpXG4gICAgICAgIEBhZGRPYmplY3QoQHBpY3R1cmVDb250YWluZXIpXG4gICAgICAgIEBhZGRPYmplY3QoQHRleHRDb250YWluZXIpXG4gICAgICAgIEBhZGRPYmplY3QoQHZpZGVvQ29udGFpbmVyKVxuICAgICAgICBAYWRkT2JqZWN0KEBob3RzcG90Q29udGFpbmVyKVxuICAgICAgICBAYWRkT2JqZWN0KEB2aWV3cG9ydENvbnRhaW5lcilcbiAgICAgICAgQGFkZE9iamVjdChAY29tbW9uRXZlbnRDb250YWluZXIpXG4gICAgICAgIEBhZGRPYmplY3QoQHRpbWVyQ29udGFpbmVyKVxuICAgICAgICBAYWRkT2JqZWN0KEBjaG9pY2VUaW1lcilcbiAgICAgICAgQGFkZE9iamVjdChAbWVzc2FnZUFyZWFDb250YWluZXIpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgQGFkZENvbXBvbmVudChuZXcgZ3MuQ29tcG9uZW50X0lucHV0SGFuZGxlcigpKVxuICAgICAgICBAYWRkQ29tcG9uZW50KEBiZWhhdmlvcilcbiAgICAgICAgQGFkZENvbXBvbmVudChAaW50ZXJwcmV0ZXIpXG4gICAgICAgIFxuICAgICAgICBcbnZuLk9iamVjdF9TY2VuZSA9IE9iamVjdF9TY2VuZSJdfQ==
//# sourceURL=Object_Scene_164.js