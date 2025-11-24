var Object_Character,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_Character = (function(superClass) {
  extend(Object_Character, superClass);

  Object_Character.objectCodecBlackList = ["parent"];


  /**
  * A game object for a visual novel character. 
  *
  * @module vn
  * @class Object_Character
  * @extends gs.Object_Visual
  * @memberof vn
  * @constructor
   */

  function Object_Character(record, data) {
    var ref, ref1;
    Object_Character.__super__.constructor.call(this, data);

    /**
    * The object's source rectangle on screen.
    * @property srcRect
    * @type gs.Rect
     */
    this.srcRect = new Rect();

    /**
    * The object's z-index.
    * @property zIndex
    * @type number
     */
    this.zIndex = 200;

    /**
    * The object's mask.
    * @property mask
    * @type gs.Mask
     */
    this.mask = new gs.Mask();

    /**
    * The color tone of the object used for the visual presentation.
    * @property tone
    * @type gs.Tone
     */
    this.tone = new Tone(0, 0, 0, 0);

    /**
    * Indicates if the object's visual presentation should be mirrored horizontally.
    * @property mirror
    * @type boolean
     */
    this.mirror = (ref = data != null ? data.mirror : void 0) != null ? ref : false;

    /**
    * The object's image used for visual presentation.
    * @property image
    * @type string
     */
    this.image = "";

    /**
    * The ID of the character-record used.
    * @property rid
    * @type number
     */
    this.rid = (data != null ? data.id : void 0) || ((ref1 = record != null ? record.index : void 0) != null ? ref1 : -1);

    /**
    * The character's expression(database-record)
    * @property expression
    * @type Object
     */
    this.expression = RecordManager.characterExpressions[(data != null ? data.expressionId : void 0) || 0];

    /**
    * The character's behavior component which contains the character-specific logic.
    * @property behavior
    * @type vn.Component_CharacterBehavior
     */
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
    this.visual = new gs.Component_Sprite();
    this.visual.imageFolder = "Graphics/Characters";
    this.addComponent(this.logic);
    this.addComponent(this.visual);
    this.addComponent(this.animator);
    this.componentsFromDataBundle(data);
  }


  /**
  * Restores the game object from a data-bundle.
  *
  * @method restore
  * @param {Object} data - The data-bundle.
   */

  Object_Character.prototype.restore = function(data) {
    Object_Character.__super__.restore.call(this, data);
    this.srcRect = gs.Rect.fromObject(data.srcRect);
    this.mask = gs.Mask.fromObject(data.mask);
    this.motionBlur = gs.MotionBlur.fromObject(data.motionBlur);
    return this.expression = RecordManager.characterExpressions[(data != null ? data.expressionId : void 0) || 0];
  };


  /**
  * Serializes the object into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Object_Character.prototype.toDataBundle = function() {
    var components;
    components = this.componentsToDataBundle(gs.Component_Animation);
    return {
      rid: this.rid,
      dstRect: this.dstRect,
      srcRect: this.srcRect,
      opacity: this.opacity,
      zoom: this.zoom,
      angle: this.angle,
      anchor: this.anchor,
      zIndex: this.zIndex,
      offset: this.offset,
      motionBlur: this.motionBlur,
      mask: this.mask.toDataBundle(),
      mirror: this.mirror,
      expressionId: this.expression.index,
      components: components
    };
  };

  return Object_Character;

})(gs.Object_Visual);

vn.Object_Character = Object_Character;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsZ0JBQUE7RUFBQTs7O0FBQU07OztFQUNGLGdCQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxRQUFEOzs7QUFDeEI7Ozs7Ozs7Ozs7RUFTYSwwQkFBQyxNQUFELEVBQVMsSUFBVDtBQUNULFFBQUE7SUFBQSxrREFBTSxJQUFOOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxJQUFBLENBQUE7O0FBRWY7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBQTs7QUFFWjs7Ozs7SUFLQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsSUFBQSxDQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLENBQWQ7O0FBRVo7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsK0RBQXlCOztBQUV6Qjs7Ozs7SUFLQSxJQUFDLENBQUEsS0FBRCxHQUFTOztBQUVUOzs7OztJQUtBLElBQUMsQ0FBQSxHQUFELG1CQUFPLElBQUksQ0FBRSxZQUFOLElBQVksa0VBQWlCLENBQUMsQ0FBbEI7O0FBRW5COzs7OztJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsYUFBYSxDQUFDLG9CQUFxQixpQkFBQSxJQUFJLENBQUUsc0JBQU4sSUFBc0IsQ0FBdEI7O0FBRWpEOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsRUFBRSxDQUFDLDJCQUFILENBQUE7SUFDaEIsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUE7O0FBRVY7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxFQUFFLENBQUMsa0JBQUgsQ0FBQTs7QUFFaEI7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxnQkFBSCxDQUFBO0lBQ2QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLEdBQXNCO0lBRXRCLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLEtBQWY7SUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxNQUFmO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsUUFBZjtJQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixJQUExQjtFQXJGUzs7O0FBMEZiOzs7Ozs7OzZCQU1BLE9BQUEsR0FBUyxTQUFDLElBQUQ7SUFDTCw4Q0FBTSxJQUFOO0lBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVIsQ0FBbUIsSUFBSSxDQUFDLE9BQXhCO0lBQ1gsSUFBQyxDQUFBLElBQUQsR0FBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVIsQ0FBbUIsSUFBSSxDQUFDLElBQXhCO0lBQ1IsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQWQsQ0FBeUIsSUFBSSxDQUFDLFVBQTlCO1dBQ2QsSUFBQyxDQUFBLFVBQUQsR0FBYyxhQUFhLENBQUMsb0JBQXFCLGlCQUFBLElBQUksQ0FBRSxzQkFBTixJQUFzQixDQUF0QjtFQU41Qzs7O0FBUVQ7Ozs7Ozs7NkJBTUEsWUFBQSxHQUFjLFNBQUE7QUFDVixRQUFBO0lBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixFQUFFLENBQUMsbUJBQTNCO0FBRWIsV0FBTztNQUNILEdBQUEsRUFBSyxJQUFDLENBQUEsR0FESDtNQUVILE9BQUEsRUFBUyxJQUFDLENBQUEsT0FGUDtNQUdILE9BQUEsRUFBUyxJQUFDLENBQUEsT0FIUDtNQUlILE9BQUEsRUFBUyxJQUFDLENBQUEsT0FKUDtNQUtILElBQUEsRUFBTSxJQUFDLENBQUEsSUFMSjtNQU1ILEtBQUEsRUFBTyxJQUFDLENBQUEsS0FOTDtNQU9ILE1BQUEsRUFBUSxJQUFDLENBQUEsTUFQTjtNQVFILE1BQUEsRUFBUSxJQUFDLENBQUEsTUFSTjtNQVNILE1BQUEsRUFBUSxJQUFDLENBQUEsTUFUTjtNQVVILFVBQUEsRUFBWSxJQUFDLENBQUEsVUFWVjtNQVdILElBQUEsRUFBTSxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBQSxDQVhIO01BWUgsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQVpOO01BYUgsWUFBQSxFQUFjLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FidkI7TUFjSCxVQUFBLEVBQVksVUFkVDs7RUFIRzs7OztHQXpIYSxFQUFFLENBQUM7O0FBOElsQyxFQUFFLENBQUMsZ0JBQUgsR0FBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IE9iamVjdF9DaGFyYWN0ZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdF9DaGFyYWN0ZXIgZXh0ZW5kcyBncy5PYmplY3RfVmlzdWFsXG4gICAgQG9iamVjdENvZGVjQmxhY2tMaXN0ID0gW1wicGFyZW50XCJdXG4gICAgIyMjKlxuICAgICogQSBnYW1lIG9iamVjdCBmb3IgYSB2aXN1YWwgbm92ZWwgY2hhcmFjdGVyLiBcbiAgICAqXG4gICAgKiBAbW9kdWxlIHZuXG4gICAgKiBAY2xhc3MgT2JqZWN0X0NoYXJhY3RlclxuICAgICogQGV4dGVuZHMgZ3MuT2JqZWN0X1Zpc3VhbFxuICAgICogQG1lbWJlcm9mIHZuXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKHJlY29yZCwgZGF0YSkgLT5cbiAgICAgICAgc3VwZXIoZGF0YSlcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3Mgc291cmNlIHJlY3RhbmdsZSBvbiBzY3JlZW4uXG4gICAgICAgICogQHByb3BlcnR5IHNyY1JlY3RcbiAgICAgICAgKiBAdHlwZSBncy5SZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAc3JjUmVjdCA9IG5ldyBSZWN0KClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3Mgei1pbmRleC5cbiAgICAgICAgKiBAcHJvcGVydHkgekluZGV4XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAekluZGV4ID0gMjAwXG4gICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgbWFzay5cbiAgICAgICAgKiBAcHJvcGVydHkgbWFza1xuICAgICAgICAqIEB0eXBlIGdzLk1hc2tcbiAgICAgICAgIyMjXG4gICAgICAgIEBtYXNrID0gbmV3IGdzLk1hc2soKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjb2xvciB0b25lIG9mIHRoZSBvYmplY3QgdXNlZCBmb3IgdGhlIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQHByb3BlcnR5IHRvbmVcbiAgICAgICAgKiBAdHlwZSBncy5Ub25lXG4gICAgICAgICMjI1xuICAgICAgICBAdG9uZSA9IG5ldyBUb25lKDAsIDAsIDAsIDApXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBvYmplY3QncyB2aXN1YWwgcHJlc2VudGF0aW9uIHNob3VsZCBiZSBtaXJyb3JlZCBob3Jpem9udGFsbHkuXG4gICAgICAgICogQHByb3BlcnR5IG1pcnJvclxuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgIyMjXG4gICAgICAgIEBtaXJyb3IgPSBkYXRhPy5taXJyb3IgPyBmYWxzZVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBpbWFnZSB1c2VkIGZvciB2aXN1YWwgcHJlc2VudGF0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpbWFnZVxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAjIyNcbiAgICAgICAgQGltYWdlID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBJRCBvZiB0aGUgY2hhcmFjdGVyLXJlY29yZCB1c2VkLlxuICAgICAgICAqIEBwcm9wZXJ0eSByaWRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEByaWQgPSBkYXRhPy5pZCB8fCAocmVjb3JkPy5pbmRleCA/IC0xKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjaGFyYWN0ZXIncyBleHByZXNzaW9uKGRhdGFiYXNlLXJlY29yZClcbiAgICAgICAgKiBAcHJvcGVydHkgZXhwcmVzc2lvblxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGV4cHJlc3Npb24gPSBSZWNvcmRNYW5hZ2VyLmNoYXJhY3RlckV4cHJlc3Npb25zW2RhdGE/LmV4cHJlc3Npb25JZCB8fCAwXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjaGFyYWN0ZXIncyBiZWhhdmlvciBjb21wb25lbnQgd2hpY2ggY29udGFpbnMgdGhlIGNoYXJhY3Rlci1zcGVjaWZpYyBsb2dpYy5cbiAgICAgICAgKiBAcHJvcGVydHkgYmVoYXZpb3JcbiAgICAgICAgKiBAdHlwZSB2bi5Db21wb25lbnRfQ2hhcmFjdGVyQmVoYXZpb3JcbiAgICAgICAgIyMjXG4gICAgICAgIEBiZWhhdmlvciA9IG5ldyB2bi5Db21wb25lbnRfQ2hhcmFjdGVyQmVoYXZpb3IoKVxuICAgICAgICBAbG9naWMgPSBAYmVoYXZpb3JcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgYW5pbWF0b3ItY29tcG9uZW50IHRvIGV4ZWN1dGUgZGlmZmVyZW50IGtpbmQgb2YgYW5pbWF0aW9ucyBsaWtlIG1vdmUsIHJvdGF0ZSwgZXRjLiBvbiBpdC5cbiAgICAgICAgKiBAcHJvcGVydHkgYW5pbWF0b3JcbiAgICAgICAgKiBAdHlwZSB2bi5Db21wb25lbnRfQW5pbWF0b3JcbiAgICAgICAgIyMjXG4gICAgICAgIEBhbmltYXRvciA9IG5ldyBncy5Db21wb25lbnRfQW5pbWF0b3IoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyB2aXN1YWwtY29tcG9uZW50IHRvIGRpc3BsYXkgdGhlIGdhbWUgb2JqZWN0IG9uIHNjcmVlbi5cbiAgICAgICAgKiBAcHJvcGVydHkgdmlzdWFsXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X1Nwcml0ZVxuICAgICAgICAjIyNcbiAgICAgICAgQHZpc3VhbCA9IG5ldyBncy5Db21wb25lbnRfU3ByaXRlKClcbiAgICAgICAgQHZpc3VhbC5pbWFnZUZvbGRlciA9IFwiR3JhcGhpY3MvQ2hhcmFjdGVyc1wiXG4gICAgICAgIFxuICAgICAgICBAYWRkQ29tcG9uZW50KEBsb2dpYylcbiAgICAgICAgQGFkZENvbXBvbmVudChAdmlzdWFsKVxuICAgICAgICBAYWRkQ29tcG9uZW50KEBhbmltYXRvcilcbiAgICAgICAgQGNvbXBvbmVudHNGcm9tRGF0YUJ1bmRsZShkYXRhKVxuICAgICAgICBcbiAgICAgICAgI0B1cGRhdGUoKVxuICAgICAgICBcbiAgICAgXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgdGhlIGdhbWUgb2JqZWN0IGZyb20gYSBkYXRhLWJ1bmRsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjIyAgICBcbiAgICByZXN0b3JlOiAoZGF0YSkgLT5cbiAgICAgICAgc3VwZXIoZGF0YSlcbiAgICAgICAgXG4gICAgICAgIEBzcmNSZWN0ID0gZ3MuUmVjdC5mcm9tT2JqZWN0KGRhdGEuc3JjUmVjdClcbiAgICAgICAgQG1hc2sgPSBncy5NYXNrLmZyb21PYmplY3QoZGF0YS5tYXNrKVxuICAgICAgICBAbW90aW9uQmx1ciA9IGdzLk1vdGlvbkJsdXIuZnJvbU9iamVjdChkYXRhLm1vdGlvbkJsdXIpXG4gICAgICAgIEBleHByZXNzaW9uID0gUmVjb3JkTWFuYWdlci5jaGFyYWN0ZXJFeHByZXNzaW9uc1tkYXRhPy5leHByZXNzaW9uSWQgfHwgMF1cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyB0aGUgb2JqZWN0IGludG8gYSBkYXRhLWJ1bmRsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRvRGF0YUJ1bmRsZVxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgZGF0YS1idW5kbGUuXG4gICAgIyMjICAgXG4gICAgdG9EYXRhQnVuZGxlOiAtPiBcbiAgICAgICAgY29tcG9uZW50cyA9IEBjb21wb25lbnRzVG9EYXRhQnVuZGxlKGdzLkNvbXBvbmVudF9BbmltYXRpb24pXG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmlkOiBAcmlkLCBcbiAgICAgICAgICAgIGRzdFJlY3Q6IEBkc3RSZWN0LCBcbiAgICAgICAgICAgIHNyY1JlY3Q6IEBzcmNSZWN0LFxuICAgICAgICAgICAgb3BhY2l0eTogQG9wYWNpdHksXG4gICAgICAgICAgICB6b29tOiBAem9vbSxcbiAgICAgICAgICAgIGFuZ2xlOiBAYW5nbGUsXG4gICAgICAgICAgICBhbmNob3I6IEBhbmNob3IsXG4gICAgICAgICAgICB6SW5kZXg6IEB6SW5kZXgsXG4gICAgICAgICAgICBvZmZzZXQ6IEBvZmZzZXQsXG4gICAgICAgICAgICBtb3Rpb25CbHVyOiBAbW90aW9uQmx1cixcbiAgICAgICAgICAgIG1hc2s6IEBtYXNrLnRvRGF0YUJ1bmRsZSgpLFxuICAgICAgICAgICAgbWlycm9yOiBAbWlycm9yLCBcbiAgICAgICAgICAgIGV4cHJlc3Npb25JZDogQGV4cHJlc3Npb24uaW5kZXgsXG4gICAgICAgICAgICBjb21wb25lbnRzOiBjb21wb25lbnRzXG4gICAgICAgIH1cbiAgICAgICAgXG5cbnZuLk9iamVjdF9DaGFyYWN0ZXIgPSBPYmplY3RfQ2hhcmFjdGVyIl19
//# sourceURL=Object_Character_180.js