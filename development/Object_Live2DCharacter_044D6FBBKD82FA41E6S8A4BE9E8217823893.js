var Object_Live2DCharacter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Live2DCharacter = (function(superClass) {
  extend(Object_Live2DCharacter, superClass);

  Object_Live2DCharacter.objectCodecBlackList = ["parent"];


  /**
  * A game object for an animated Live2D visual novel character.
  *
  * @module gs
  * @class Object_Live2DCharacter
  * @extends gs.Object_Visual
  * @memberof gs
  * @constructor
   */

  function Object_Live2DCharacter(record, data) {
    var ref, ref1;
    Object_Live2DCharacter.__super__.constructor.call(this, data);
    this.zIndex = 200;

    /**
    * The ID of the character-record used.
    * @property rid
    * @type number
     */
    this.rid = (data != null ? data.id : void 0) || ((ref = record != null ? record.index : void 0) != null ? ref : -1);

    /**
    * The rotation-angle of the character in degrees. The rotation center depends on the
    * anchor-point.
    * @property angle
    * @type number
     */
    this.angle = 0;

    /**
    * The color tone of the object used for the visual presentation.
    * @property tone
    * @type gs.Tone
     */
    this.tone = new Tone(0, 0, 0, 0);

    /**
    * The color of the object used for the visual presentation.
    * @property color
    * @type gs.Color
     */
    this.color = new Color(255, 255, 255, 0);

    /**
    * The Live2D model used for the visual presentation.
    * @property model
    * @type gs.Live2DModel
     */
    this.model = data != null ? ResourceManager.getLive2DModel(((ref1 = data.modelFolder) != null ? ref1 : "Live2D") + "/" + data.modelName) : null;

    /**
    * The resource name of a Live2D model used for the visual presentation.
    * @property modelName
    * @type string
     */
    this.modelName = data != null ? data.modelName : void 0;

    /**
    * The Live2D motion.
    * @property motion
    * @type gs.Live2DMotion
     */
    this.motion = (data != null ? data.motion : void 0) || {
      name: "",
      loop: true

      /**
      * The Live2D motion group.
      * @property motion
      * @type gs.Live2DMotionGroup
       */
    };
    this.motionGroup = data != null ? data.motionGroup : void 0;

    /**
    * The Live2D expression.
    * @property expression
    * @type gs.Live2DExpression
     */
    this.expression = (data != null ? data.expression : void 0) || {
      name: ""

      /**
      * The character's behavior component which contains the character-specific logic.
      * @property behavior
      * @type vn.Component_CharacterBehavior
       */
    };
    this.behavior = new vn.Component_CharacterBehavior();
    this.logic = this.behavior;

    /**
    * The object's animator-component to execute different kind of animations like move, rotate, etc. on it.
    * @property animator
    * @type vn.Component_Animator
     */
    this.animator = new gs.Component_Animator();

    /**
    * The object's visual-component to display the game object on screen.
    * @property visual
    * @type gs.Component_Sprite
     */
    this.visual = new gs.Component_Live2D();
    this.visual.modelFolder = "Live2D";
    this.addComponent(this.logic);
    this.addComponent(this.animator);
    this.addComponent(this.visual);
  }


  /**
  * Serializes the object into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Object_Live2DCharacter.prototype.toDataBundle = function() {
    return {
      rid: this.rid,
      x: this.dstRect.x,
      y: this.dstRect.y,
      opacity: this.opacity,
      offset: this.offset,
      zoom: this.zoom,
      origin: this.origin,
      mirror: this.mirror,
      expression: this.expression,
      modelName: this.modelName,
      motion: this.motion,
      motionGroup: this.motionGroup,
      expression: this.expression
    };
  };

  return Object_Live2DCharacter;

})(gs.Object_Visual);

vn.Object_Live2DCharacter = Object_Live2DCharacter;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsc0JBQUE7RUFBQTs7O0FBQU07OztFQUNGLHNCQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxRQUFEOzs7QUFFeEI7Ozs7Ozs7Ozs7RUFTYSxnQ0FBQyxNQUFELEVBQVMsSUFBVDtBQUNULFFBQUE7SUFBQSx3REFBTSxJQUFOO0lBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsR0FBRCxtQkFBTyxJQUFJLENBQUUsWUFBTixJQUFZLGdFQUFpQixDQUFDLENBQWxCOztBQUVuQjs7Ozs7O0lBTUEsSUFBQyxDQUFBLEtBQUQsR0FBUzs7QUFFVDs7Ozs7SUFLQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsSUFBQSxDQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLENBQWQ7O0FBRVo7Ozs7O0lBS0EsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixDQUFyQjs7QUFFYjs7Ozs7SUFLQSxJQUFDLENBQUEsS0FBRCxHQUFZLFlBQUgsR0FBYyxlQUFlLENBQUMsY0FBaEIsQ0FBaUMsNENBQW9CLFFBQXBCLENBQUEsR0FBNkIsR0FBN0IsR0FBZ0MsSUFBSSxDQUFDLFNBQXRFLENBQWQsR0FBc0c7O0FBRS9HOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELGtCQUFhLElBQUksQ0FBRTs7QUFFbkI7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsbUJBQVUsSUFBSSxDQUFFLGdCQUFOLElBQWdCO01BQUEsSUFBQSxFQUFNLEVBQU47TUFBVSxJQUFBLEVBQU07O0FBRTFDOzs7O1NBRjBCOztJQU8xQixJQUFDLENBQUEsV0FBRCxrQkFBZSxJQUFJLENBQUU7O0FBRXJCOzs7OztJQUtBLElBQUMsQ0FBQSxVQUFELG1CQUFjLElBQUksQ0FBRSxvQkFBTixJQUFvQjtNQUFBLElBQUEsRUFBTTs7QUFFeEM7Ozs7U0FGa0M7O0lBT2xDLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsRUFBRSxDQUFDLDJCQUFILENBQUE7SUFDaEIsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUE7O0FBRVY7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxFQUFFLENBQUMsa0JBQUgsQ0FBQTs7QUFFaEI7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxnQkFBSCxDQUFBO0lBQ2QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLEdBQXNCO0lBRXRCLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLEtBQWY7SUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxRQUFmO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsTUFBZjtFQTdGUzs7O0FBK0ZiOzs7Ozs7O21DQU1BLFlBQUEsR0FBYyxTQUFBO1dBQ1Y7TUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLEdBQU47TUFDQSxDQUFBLEVBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxDQURaO01BRUEsQ0FBQSxFQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsQ0FGWjtNQUdBLE9BQUEsRUFBUyxJQUFDLENBQUEsT0FIVjtNQUlBLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFKVDtNQUtBLElBQUEsRUFBTSxJQUFDLENBQUEsSUFMUDtNQU1BLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFOVDtNQU9BLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFQVDtNQVFBLFVBQUEsRUFBWSxJQUFDLENBQUEsVUFSYjtNQVNBLFNBQUEsRUFBVyxJQUFDLENBQUEsU0FUWjtNQVVBLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFWVDtNQVdBLFdBQUEsRUFBYSxJQUFDLENBQUEsV0FYZDtNQVlBLFVBQUEsRUFBWSxJQUFDLENBQUEsVUFaYjs7RUFEVTs7OztHQWpIbUIsRUFBRSxDQUFDOztBQWtJeEMsRUFBRSxDQUFDLHNCQUFILEdBQTRCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBPYmplY3RfTGl2ZTJEQ2hhcmFjdGVyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBPYmplY3RfTGl2ZTJEQ2hhcmFjdGVyIGV4dGVuZHMgZ3MuT2JqZWN0X1Zpc3VhbFxuICAgIEBvYmplY3RDb2RlY0JsYWNrTGlzdCA9IFtcInBhcmVudFwiXVxuXG4gICAgIyMjKlxuICAgICogQSBnYW1lIG9iamVjdCBmb3IgYW4gYW5pbWF0ZWQgTGl2ZTJEIHZpc3VhbCBub3ZlbCBjaGFyYWN0ZXIuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIE9iamVjdF9MaXZlMkRDaGFyYWN0ZXJcbiAgICAqIEBleHRlbmRzIGdzLk9iamVjdF9WaXN1YWxcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChyZWNvcmQsIGRhdGEpIC0+XG4gICAgICAgIHN1cGVyKGRhdGEpXG4gICAgICAgIEB6SW5kZXggPSAyMDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIElEIG9mIHRoZSBjaGFyYWN0ZXItcmVjb3JkIHVzZWQuXG4gICAgICAgICogQHByb3BlcnR5IHJpZFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHJpZCA9IGRhdGE/LmlkIHx8IChyZWNvcmQ/LmluZGV4ID8gLTEpXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSByb3RhdGlvbi1hbmdsZSBvZiB0aGUgY2hhcmFjdGVyIGluIGRlZ3JlZXMuIFRoZSByb3RhdGlvbiBjZW50ZXIgZGVwZW5kcyBvbiB0aGVcbiAgICAgICAgKiBhbmNob3ItcG9pbnQuXG4gICAgICAgICogQHByb3BlcnR5IGFuZ2xlXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAYW5nbGUgPSAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjb2xvciB0b25lIG9mIHRoZSBvYmplY3QgdXNlZCBmb3IgdGhlIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IHRvbmVcbiAgICAgICAgKiBAdHlwZSBncy5Ub25lXG4gICAgICAgICMjI1xuICAgICAgICBAdG9uZSA9IG5ldyBUb25lKDAsIDAsIDAsIDApXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjb2xvciBvZiB0aGUgb2JqZWN0IHVzZWQgZm9yIHRoZSB2aXN1YWwgcHJlc2VudGF0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb2xvclxuICAgICAgICAqIEB0eXBlIGdzLkNvbG9yXG4gICAgICAgICMjI1xuICAgICAgICBAY29sb3IgPSBuZXcgQ29sb3IoMjU1LCAyNTUsIDI1NSwgMClcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIExpdmUyRCBtb2RlbCB1c2VkIGZvciB0aGUgdmlzdWFsIHByZXNlbnRhdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgbW9kZWxcbiAgICAgICAgKiBAdHlwZSBncy5MaXZlMkRNb2RlbFxuICAgICAgICAjIyNcbiAgICAgICAgQG1vZGVsID0gaWYgZGF0YT8gdGhlbiBSZXNvdXJjZU1hbmFnZXIuZ2V0TGl2ZTJETW9kZWwoXCIje2RhdGEubW9kZWxGb2xkZXIgPyBcIkxpdmUyRFwifS8je2RhdGEubW9kZWxOYW1lfVwiKSBlbHNlIG51bGxcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHJlc291cmNlIG5hbWUgb2YgYSBMaXZlMkQgbW9kZWwgdXNlZCBmb3IgdGhlIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IG1vZGVsTmFtZVxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAjIyNcbiAgICAgICAgQG1vZGVsTmFtZSA9IGRhdGE/Lm1vZGVsTmFtZVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgTGl2ZTJEIG1vdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgbW90aW9uXG4gICAgICAgICogQHR5cGUgZ3MuTGl2ZTJETW90aW9uXG4gICAgICAgICMjI1xuICAgICAgICBAbW90aW9uID0gZGF0YT8ubW90aW9uIHx8IG5hbWU6IFwiXCIsIGxvb3A6IHllc1xuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgTGl2ZTJEIG1vdGlvbiBncm91cC5cbiAgICAgICAgKiBAcHJvcGVydHkgbW90aW9uXG4gICAgICAgICogQHR5cGUgZ3MuTGl2ZTJETW90aW9uR3JvdXBcbiAgICAgICAgIyMjXG4gICAgICAgIEBtb3Rpb25Hcm91cCA9IGRhdGE/Lm1vdGlvbkdyb3VwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBMaXZlMkQgZXhwcmVzc2lvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgZXhwcmVzc2lvblxuICAgICAgICAqIEB0eXBlIGdzLkxpdmUyREV4cHJlc3Npb25cbiAgICAgICAgIyMjXG4gICAgICAgIEBleHByZXNzaW9uID0gZGF0YT8uZXhwcmVzc2lvbiB8fCBuYW1lOiBcIlwiICNSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlckV4cHJlc3Npb25zW2RhdGE/LmV4cHJlc3Npb25JZCB8fCAwXVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY2hhcmFjdGVyJ3MgYmVoYXZpb3IgY29tcG9uZW50IHdoaWNoIGNvbnRhaW5zIHRoZSBjaGFyYWN0ZXItc3BlY2lmaWMgbG9naWMuXG4gICAgICAgICogQHByb3BlcnR5IGJlaGF2aW9yXG4gICAgICAgICogQHR5cGUgdm4uQ29tcG9uZW50X0NoYXJhY3RlckJlaGF2aW9yXG4gICAgICAgICMjI1xuICAgICAgICBAYmVoYXZpb3IgPSBuZXcgdm4uQ29tcG9uZW50X0NoYXJhY3RlckJlaGF2aW9yKClcbiAgICAgICAgQGxvZ2ljID0gQGJlaGF2aW9yXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBhbmltYXRvci1jb21wb25lbnQgdG8gZXhlY3V0ZSBkaWZmZXJlbnQga2luZCBvZiBhbmltYXRpb25zIGxpa2UgbW92ZSwgcm90YXRlLCBldGMuIG9uIGl0LlxuICAgICAgICAqIEBwcm9wZXJ0eSBhbmltYXRvclxuICAgICAgICAqIEB0eXBlIHZuLkNvbXBvbmVudF9BbmltYXRvclxuICAgICAgICAjIyNcbiAgICAgICAgQGFuaW1hdG9yID0gbmV3IGdzLkNvbXBvbmVudF9BbmltYXRvcigpXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyB2aXN1YWwtY29tcG9uZW50IHRvIGRpc3BsYXkgdGhlIGdhbWUgb2JqZWN0IG9uIHNjcmVlbi5cbiAgICAgICAgKiBAcHJvcGVydHkgdmlzdWFsXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X1Nwcml0ZVxuICAgICAgICAjIyNcbiAgICAgICAgQHZpc3VhbCA9IG5ldyBncy5Db21wb25lbnRfTGl2ZTJEKClcbiAgICAgICAgQHZpc3VhbC5tb2RlbEZvbGRlciA9IFwiTGl2ZTJEXCJcblxuICAgICAgICBAYWRkQ29tcG9uZW50KEBsb2dpYylcbiAgICAgICAgQGFkZENvbXBvbmVudChAYW5pbWF0b3IpXG4gICAgICAgIEBhZGRDb21wb25lbnQoQHZpc3VhbClcblxuICAgICMjIypcbiAgICAqIFNlcmlhbGl6ZXMgdGhlIG9iamVjdCBpbnRvIGEgZGF0YS1idW5kbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB0b0RhdGFCdW5kbGVcbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjI1xuICAgIHRvRGF0YUJ1bmRsZTogLT5cbiAgICAgICAgcmlkOiBAcmlkLFxuICAgICAgICB4OiBAZHN0UmVjdC54LFxuICAgICAgICB5OiBAZHN0UmVjdC55LFxuICAgICAgICBvcGFjaXR5OiBAb3BhY2l0eSxcbiAgICAgICAgb2Zmc2V0OiBAb2Zmc2V0LFxuICAgICAgICB6b29tOiBAem9vbSxcbiAgICAgICAgb3JpZ2luOiBAb3JpZ2luLFxuICAgICAgICBtaXJyb3I6IEBtaXJyb3IsXG4gICAgICAgIGV4cHJlc3Npb246IEBleHByZXNzaW9uLFxuICAgICAgICBtb2RlbE5hbWU6IEBtb2RlbE5hbWUsXG4gICAgICAgIG1vdGlvbjogQG1vdGlvbixcbiAgICAgICAgbW90aW9uR3JvdXA6IEBtb3Rpb25Hcm91cCxcbiAgICAgICAgZXhwcmVzc2lvbjogQGV4cHJlc3Npb25cblxuXG5cbnZuLk9iamVjdF9MaXZlMkRDaGFyYWN0ZXIgPSBPYmplY3RfTGl2ZTJEQ2hhcmFjdGVyIl19
//# sourceURL=Object_Live2DCharacter_74.js