var InterpreterContext;

InterpreterContext = (function() {
  InterpreterContext.objectCodecBlackList = ["owner"];


  /**
  * Describes an interpreter-context which holds information about
  * the interpreter's owner and also unique ID used for accessing correct
  * local variables.
  *
  * @module gs
  * @class InterpreterContext
  * @memberof gs
  * @param {number|string} id - A unique ID
  * @param {Object} owner - The owner of the interpreter
   */

  function InterpreterContext(id, owner) {

    /**
    * A unique numeric or textual ID used for accessing correct local variables.
    * @property id
    * @type number|string
     */
    this.id = id;

    /**
    * The owner of the interpreter (e.g. current scene, etc.).
    * @property owner
    * @type Object
     */
    this.owner = owner;
    this.callId = 0;
  }


  /**
  * Sets the context's data.
  * @param {number|string} id - A unique ID
  * @param {Object} owner - The owner of the interpreter
  * @method set
   */

  InterpreterContext.prototype.set = function(id, owner) {
    this.id = id;
    return this.owner = owner;
  };

  return InterpreterContext;

})();

gs.InterpreterContext = InterpreterContext;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07RUFDRixrQkFBQyxDQUFBLG9CQUFELEdBQXdCLENBQUMsT0FBRDs7O0FBRXhCOzs7Ozs7Ozs7Ozs7RUFXYSw0QkFBQyxFQUFELEVBQUssS0FBTDs7QUFDVDs7Ozs7SUFLQSxJQUFDLENBQUEsRUFBRCxHQUFNOztBQUVOOzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFFVCxJQUFDLENBQUEsTUFBRCxHQUFVO0VBZkQ7OztBQWlCYjs7Ozs7OzsrQkFNQSxHQUFBLEdBQUssU0FBQyxFQUFELEVBQUssS0FBTDtJQUNELElBQUMsQ0FBQSxFQUFELEdBQU07V0FDTixJQUFDLENBQUEsS0FBRCxHQUFTO0VBRlI7Ozs7OztBQUlULEVBQUUsQ0FBQyxrQkFBSCxHQUF3QiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogSW50ZXJwcmV0ZXJDb250ZXh0XG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBJbnRlcnByZXRlckNvbnRleHRcbiAgICBAb2JqZWN0Q29kZWNCbGFja0xpc3QgPSBbXCJvd25lclwiXVxuICAgIFxuICAgICMjIypcbiAgICAqIERlc2NyaWJlcyBhbiBpbnRlcnByZXRlci1jb250ZXh0IHdoaWNoIGhvbGRzIGluZm9ybWF0aW9uIGFib3V0XG4gICAgKiB0aGUgaW50ZXJwcmV0ZXIncyBvd25lciBhbmQgYWxzbyB1bmlxdWUgSUQgdXNlZCBmb3IgYWNjZXNzaW5nIGNvcnJlY3RcbiAgICAqIGxvY2FsIHZhcmlhYmxlcy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgSW50ZXJwcmV0ZXJDb250ZXh0XG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gaWQgLSBBIHVuaXF1ZSBJRFxuICAgICogQHBhcmFtIHtPYmplY3R9IG93bmVyIC0gVGhlIG93bmVyIG9mIHRoZSBpbnRlcnByZXRlclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoaWQsIG93bmVyKSAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogQSB1bmlxdWUgbnVtZXJpYyBvciB0ZXh0dWFsIElEIHVzZWQgZm9yIGFjY2Vzc2luZyBjb3JyZWN0IGxvY2FsIHZhcmlhYmxlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgaWRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJ8c3RyaW5nXG4gICAgICAgICMjI1xuICAgICAgICBAaWQgPSBpZFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb3duZXIgb2YgdGhlIGludGVycHJldGVyIChlLmcuIGN1cnJlbnQgc2NlbmUsIGV0Yy4pLlxuICAgICAgICAqIEBwcm9wZXJ0eSBvd25lclxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQG93bmVyID0gb3duZXJcbiAgICBcbiAgICAgICAgQGNhbGxJZCA9IDBcblxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIGNvbnRleHQncyBkYXRhLlxuICAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfSBpZCAtIEEgdW5pcXVlIElEXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb3duZXIgLSBUaGUgb3duZXIgb2YgdGhlIGludGVycHJldGVyXG4gICAgKiBAbWV0aG9kIHNldFxuICAgICMjI1xuICAgIHNldDogKGlkLCBvd25lcikgLT5cbiAgICAgICAgQGlkID0gaWRcbiAgICAgICAgQG93bmVyID0gb3duZXJcblxuZ3MuSW50ZXJwcmV0ZXJDb250ZXh0ID0gSW50ZXJwcmV0ZXJDb250ZXh0Il19
//# sourceURL=InterpreterContext_59.js