var Component_NumberInput,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_NumberInput = (function(superClass) {
  extend(Component_NumberInput, superClass);


  /**
  * The number-input component defines the logic for the number-input window
  * of the default In-Game UI. 
  *
  * @module gs
  * @class Component_NumberInput
  * @extends gs.Component
  * @memberof gs
  * @constructor
   */

  function Component_NumberInput(params) {

    /**
    * The max. number of digits of the number.
    * @property digits
    * @type number
     */
    this.digits = ui.Component_FormulaHandler.fieldValue(this, params.digits);

    /**
    * The number-cursor position.
    * @property digits
    * @type number
    * @protected
     */
    this.cursor = 0;

    /**
    * The current number as text.
    * @property number
    * @type string
     */
    this.number = "";
  }


  /**
  * Initializes the number-input component.
  *
  * @method setup
   */

  Component_NumberInput.prototype.setup = function() {
    var text;
    text = "".fill("0", this.digits);
    return null;
  };


  /**
  * An action-method to add a single number/digit.
  *
  * @method action_addNumber
  * @param {gs.Object_Base} sender The sender of the action.
  * @param {Object} params The params-object which need a number-property containing the digit/number to add.
   */

  Component_NumberInput.prototype.action_addNumber = function(sender, params) {
    var number;
    number = ui.Component_FormulaHandler.fieldValue(sender, params.number);
    if (this.number.length === 0 && number === 0) {
      return;
    }
    if (this.number.length < this.digits) {
      this.number += number.toString();
    } else {
      this.number = this.number.replaceAt(this.number.length - 1, number.toString());
    }
    return this.setNumber(this.number);
  };


  /**
  * An action-method to clear the number at the current cursor position.
  *
  * @method action_removeNumber
  * @param {gs.Object_Base} sender The sender of the action.
  * @param {Object} [params=null] The params-object. Can be <b>null</b>.
   */

  Component_NumberInput.prototype.action_removeNumber = function(sender, params) {
    if (this.number.length > 0) {
      this.number = this.number.substring(0, this.number.length - 1);
    }
    this.setNumber(this.number);
    return this.setNumber(this.number);
  };


  /**
  * Puts the specified number into the UI label-objects to make it visible
  * on screen.
  *
  * @method setNumber
  * @param {string} number The number to set.
   */

  Component_NumberInput.prototype.setNumber = function(number) {
    var c, i, j, len, text;
    text = number.lfill("0", this.digits);
    for (i = j = 0, len = text.length; j < len; i = ++j) {
      c = text[i];
      this.object.controls[i].controls[1].text = c;
      this.object.controls[i].controls[1].update();
    }
    return null;
  };

  return Component_NumberInput;

})(gs.Component);

gs.Component_NumberInput = Component_NumberInput;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEscUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7RUFVYSwrQkFBQyxNQUFEOztBQUNUOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQVUsRUFBRSxDQUFDLHdCQUF3QixDQUFDLFVBQTVCLENBQXVDLElBQXZDLEVBQTZDLE1BQU0sQ0FBQyxNQUFwRDs7QUFFVjs7Ozs7O0lBTUEsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVO0VBckJEOzs7QUF1QmI7Ozs7OztrQ0FLQSxLQUFBLEdBQU8sU0FBQTtBQUNILFFBQUE7SUFBQSxJQUFBLEdBQU8sRUFBRSxDQUFDLElBQUgsQ0FBUSxHQUFSLEVBQWEsSUFBQyxDQUFBLE1BQWQ7QUFFUCxXQUFPO0VBSEo7OztBQUtQOzs7Ozs7OztrQ0FPQSxnQkFBQSxHQUFrQixTQUFDLE1BQUQsRUFBUyxNQUFUO0FBQ2QsUUFBQTtJQUFBLE1BQUEsR0FBUyxFQUFFLENBQUMsd0JBQXdCLENBQUMsVUFBNUIsQ0FBdUMsTUFBdkMsRUFBK0MsTUFBTSxDQUFDLE1BQXREO0lBQ1QsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsS0FBa0IsQ0FBbEIsSUFBd0IsTUFBQSxLQUFVLENBQXJDO0FBQTRDLGFBQTVDOztJQUVBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCLElBQUMsQ0FBQSxNQUFyQjtNQUNJLElBQUMsQ0FBQSxNQUFELElBQVcsTUFBTSxDQUFDLFFBQVAsQ0FBQSxFQURmO0tBQUEsTUFBQTtNQUdJLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFlLENBQWpDLEVBQW9DLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBcEMsRUFIZDs7V0FJQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxNQUFaO0VBUmM7OztBQVVsQjs7Ozs7Ozs7a0NBT0EsbUJBQUEsR0FBcUIsU0FBQyxNQUFELEVBQVMsTUFBVDtJQUNqQixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFpQixDQUFwQjtNQUNJLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLENBQWxCLEVBQXFCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFlLENBQXBDLEVBRGQ7O0lBR0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsTUFBWjtXQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLE1BQVo7RUFMaUI7OztBQU9yQjs7Ozs7Ozs7a0NBT0EsU0FBQSxHQUFXLFNBQUMsTUFBRDtBQUNQLFFBQUE7SUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLEtBQVAsQ0FBYSxHQUFiLEVBQWtCLElBQUMsQ0FBQSxNQUFuQjtBQUNQLFNBQUEsOENBQUE7O01BQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQWhDLEdBQXVDO01BRXZDLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFoQyxDQUFBO0FBSEo7QUFLQSxXQUFPO0VBUEE7Ozs7R0FsRnFCLEVBQUUsQ0FBQzs7QUEyRnZDLEVBQUUsQ0FBQyxxQkFBSCxHQUEyQiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X051bWJlcklucHV0XG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfTnVtYmVySW5wdXQgZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAjIyMqXG4gICAgKiBUaGUgbnVtYmVyLWlucHV0IGNvbXBvbmVudCBkZWZpbmVzIHRoZSBsb2dpYyBmb3IgdGhlIG51bWJlci1pbnB1dCB3aW5kb3dcbiAgICAqIG9mIHRoZSBkZWZhdWx0IEluLUdhbWUgVUkuIFxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfTnVtYmVySW5wdXRcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKHBhcmFtcykgLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBtYXguIG51bWJlciBvZiBkaWdpdHMgb2YgdGhlIG51bWJlci5cbiAgICAgICAgKiBAcHJvcGVydHkgZGlnaXRzXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAZGlnaXRzID0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUodGhpcywgcGFyYW1zLmRpZ2l0cylcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbnVtYmVyLWN1cnNvciBwb3NpdGlvbi5cbiAgICAgICAgKiBAcHJvcGVydHkgZGlnaXRzXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGN1cnNvciA9IDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCBudW1iZXIgYXMgdGV4dC5cbiAgICAgICAgKiBAcHJvcGVydHkgbnVtYmVyXG4gICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICMjI1xuICAgICAgICBAbnVtYmVyID0gXCJcIlxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgbnVtYmVyLWlucHV0IGNvbXBvbmVudC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgIyMjXG4gICAgc2V0dXA6IC0+XG4gICAgICAgIHRleHQgPSBcIlwiLmZpbGwoXCIwXCIsIEBkaWdpdHMpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBbiBhY3Rpb24tbWV0aG9kIHRvIGFkZCBhIHNpbmdsZSBudW1iZXIvZGlnaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBhY3Rpb25fYWRkTnVtYmVyXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzZW5kZXIgVGhlIHNlbmRlciBvZiB0aGUgYWN0aW9uLlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyBUaGUgcGFyYW1zLW9iamVjdCB3aGljaCBuZWVkIGEgbnVtYmVyLXByb3BlcnR5IGNvbnRhaW5pbmcgdGhlIGRpZ2l0L251bWJlciB0byBhZGQuXG4gICAgIyMjXG4gICAgYWN0aW9uX2FkZE51bWJlcjogKHNlbmRlciwgcGFyYW1zKSAtPlxuICAgICAgICBudW1iZXIgPSB1aS5Db21wb25lbnRfRm9ybXVsYUhhbmRsZXIuZmllbGRWYWx1ZShzZW5kZXIsIHBhcmFtcy5udW1iZXIpXG4gICAgICAgIGlmIEBudW1iZXIubGVuZ3RoID09IDAgYW5kIG51bWJlciA9PSAwIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBAbnVtYmVyLmxlbmd0aCA8IEBkaWdpdHNcbiAgICAgICAgICAgIEBudW1iZXIgKz0gbnVtYmVyLnRvU3RyaW5nKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG51bWJlciA9IEBudW1iZXIucmVwbGFjZUF0KEBudW1iZXIubGVuZ3RoLTEsIG51bWJlci50b1N0cmluZygpKVxuICAgICAgICBAc2V0TnVtYmVyKEBudW1iZXIpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBBbiBhY3Rpb24tbWV0aG9kIHRvIGNsZWFyIHRoZSBudW1iZXIgYXQgdGhlIGN1cnJlbnQgY3Vyc29yIHBvc2l0aW9uLlxuICAgICpcbiAgICAqIEBtZXRob2QgYWN0aW9uX3JlbW92ZU51bWJlclxuICAgICogQHBhcmFtIHtncy5PYmplY3RfQmFzZX0gc2VuZGVyIFRoZSBzZW5kZXIgb2YgdGhlIGFjdGlvbi5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcGFyYW1zPW51bGxdIFRoZSBwYXJhbXMtb2JqZWN0LiBDYW4gYmUgPGI+bnVsbDwvYj4uXG4gICAgIyMjICAgICAgIFxuICAgIGFjdGlvbl9yZW1vdmVOdW1iZXI6IChzZW5kZXIsIHBhcmFtcykgLT5cbiAgICAgICAgaWYgQG51bWJlci5sZW5ndGggPiAwXG4gICAgICAgICAgICBAbnVtYmVyID0gQG51bWJlci5zdWJzdHJpbmcoMCwgQG51bWJlci5sZW5ndGgtMSlcbiAgICAgICAgICAgIFxuICAgICAgICBAc2V0TnVtYmVyKEBudW1iZXIpICAgXG4gICAgICAgIEBzZXROdW1iZXIoQG51bWJlcilcbiAgICBcbiAgICAjIyMqXG4gICAgKiBQdXRzIHRoZSBzcGVjaWZpZWQgbnVtYmVyIGludG8gdGhlIFVJIGxhYmVsLW9iamVjdHMgdG8gbWFrZSBpdCB2aXNpYmxlXG4gICAgKiBvbiBzY3JlZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXROdW1iZXJcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBudW1iZXIgVGhlIG51bWJlciB0byBzZXQuXG4gICAgIyMjICAgICBcbiAgICBzZXROdW1iZXI6IChudW1iZXIpIC0+XG4gICAgICAgIHRleHQgPSBudW1iZXIubGZpbGwoXCIwXCIsIEBkaWdpdHMpXG4gICAgICAgIGZvciBjLCBpIGluIHRleHRcbiAgICAgICAgICAgIEBvYmplY3QuY29udHJvbHNbaV0uY29udHJvbHNbMV0udGV4dCA9IGNcbiAgICAgICAgICAgICMgRklYTUU6IERpcmVjdCB1cGRhdGUgY2FsbCBzaG91bGRuJ3QgYmUgbmVjZXNzYXJ5LiBTZWUgVGV4dElucHV0LlxuICAgICAgICAgICAgQG9iamVjdC5jb250cm9sc1tpXS5jb250cm9sc1sxXS51cGRhdGUoKVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuZ3MuQ29tcG9uZW50X051bWJlcklucHV0ID0gQ29tcG9uZW50X051bWJlcklucHV0Il19
//# sourceURL=Component_NumberInput_173.js