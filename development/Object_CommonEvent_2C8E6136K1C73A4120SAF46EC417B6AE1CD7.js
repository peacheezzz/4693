var Object_CommonEvent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Object_CommonEvent = (function(superClass) {
  extend(Object_CommonEvent, superClass);

  Object_CommonEvent.objectCodecBlackList = ["record", "commands", "parent"];


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Object_CommonEvent.prototype.onDataBundleRestore = function(data, context) {
    var ref;
    if (this.rid != null) {
      this.record = RecordManager.commonEvents[this.rid];
      if ((ref = this.interpreter) != null) {
        ref.object = this;
      }
      return this.commands = this.record.commands;
    }
  };


  /**
  * A common-event object handles a single common event defined in the
  * database. Common events can run parallel to the actual scene content
  * or can be just called from a scene to execute a common piece of logic.
  *
  * @module gs
  * @class Object_CommonEvent
  * @extends gs.Object_Base
  * @memberof gs
  * @constructor
   */

  function Object_CommonEvent(data) {
    Object_CommonEvent.__super__.constructor.call(this);

    /**
    * The common event database record.
    * @property record
    * @type Object
     */
    this.record = null;

    /**
    * The behavior component to add common-event specific behavior to the object.
    * @property behavior
    * @type gs.Component_CommonEventBehavior
     */
    this.behavior = new gs.Component_CommonEventBehavior();

    /**
    * An event-emitter to emit events.
    * @property events
    * @type gs.Component_EventEmitter
     */
    this.events = new gs.Component_EventEmitter();

    /**
    * An interpreter to execute the commands of the common event.
    * @property interpreter
    * @type gs.Component_CommandInterpreter
     */
    this.interpreter = null;
    this.events.object = this;
    if (data) {
      this.restore(data);
    } else {
      this.addComponent(this.behavior);
    }
  }


  /**
  * Serializes the common-event into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Object_CommonEvent.prototype.toDataBundle = function() {
    var ref;
    this.commands = this.record.commands;
    return {
      behavior: this.behavior.toDataBundle(),
      interpreter: (ref = this.interpreter) != null ? ref.toDataBundle() : void 0,
      recordId: this.record.index
    };
  };


  /**
  * Restores the common-event from a data-bundle
  *
  * @method restore
  * @param {Object} bundle- The data-bundle.
   */

  Object_CommonEvent.prototype.restore = function(data) {
    if (this.behavior != null) {
      this.removeComponent(this.behavior);
    }
    this.behavior = new gs.Component_CommonEventBehavior();
    this.addComponent(this.behavior);
    this.record = RecordManager.commonEvents[data.recordId];
    this.behavior.restore(data.behavior);
    if (data.interpreter && this.interpreter) {
      this.interpreter.restore(data.interpreter);
      this.interpreter.context.set(this.record.id, this.record);
      return this.commands = this.record.commands;
    }
  };

  return Object_CommonEvent;

})(gs.Object_Base);

gs.Object_CommonEvent = Object_CommonEvent;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsa0JBQUE7RUFBQTs7O0FBQU07OztFQUNGLGtCQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxRQUFELEVBQVcsVUFBWCxFQUF1QixRQUF2Qjs7O0FBRXhCOzs7Ozs7Ozs7K0JBUUEsbUJBQUEsR0FBcUIsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNqQixRQUFBO0lBQUEsSUFBRyxnQkFBSDtNQUNJLElBQUMsQ0FBQSxNQUFELEdBQVUsYUFBYSxDQUFDLFlBQWEsQ0FBQSxJQUFDLENBQUEsR0FBRDs7V0FDekIsQ0FBRSxNQUFkLEdBQXVCOzthQUN2QixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FIeEI7O0VBRGlCOzs7QUFPckI7Ozs7Ozs7Ozs7OztFQVdhLDRCQUFDLElBQUQ7SUFDVCxrREFBQTs7QUFFQTs7Ozs7SUFLQSxJQUFDLENBQUEsTUFBRCxHQUFVOztBQUVWOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsRUFBRSxDQUFDLDZCQUFILENBQUE7O0FBRWhCOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxFQUFFLENBQUMsc0JBQUgsQ0FBQTs7QUFFZDs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBRWYsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCO0lBRWpCLElBQUcsSUFBSDtNQUNJLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxFQURKO0tBQUEsTUFBQTtNQUdJLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLFFBQWYsRUFISjs7RUFqQ1M7OztBQXNDYjs7Ozs7OzsrQkFNQSxZQUFBLEdBQWMsU0FBQTtBQUNWLFFBQUE7SUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUM7QUFDcEIsV0FBTztNQUNILFFBQUEsRUFBVSxJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBQSxDQURQO01BRUgsV0FBQSx3Q0FBeUIsQ0FBRSxZQUFkLENBQUEsVUFGVjtNQUdILFFBQUEsRUFBVSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBSGY7O0VBRkc7OztBQVFkOzs7Ozs7OytCQU1BLE9BQUEsR0FBUyxTQUFDLElBQUQ7SUFDTCxJQUFHLHFCQUFIO01BQ0ksSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBQyxDQUFBLFFBQWxCLEVBREo7O0lBR0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxFQUFFLENBQUMsNkJBQUgsQ0FBQTtJQUNoQixJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxRQUFmO0lBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxhQUFhLENBQUMsWUFBYSxDQUFBLElBQUksQ0FBQyxRQUFMO0lBRXJDLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixJQUFJLENBQUMsUUFBdkI7SUFDQSxJQUFHLElBQUksQ0FBQyxXQUFMLElBQXFCLElBQUMsQ0FBQSxXQUF6QjtNQUNJLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFxQixJQUFJLENBQUMsV0FBMUI7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFyQixDQUF5QixJQUFDLENBQUEsTUFBTSxDQUFDLEVBQWpDLEVBQXFDLElBQUMsQ0FBQSxNQUF0QzthQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUh4Qjs7RUFUSzs7OztHQXZGb0IsRUFBRSxDQUFDOztBQXlHcEMsRUFBRSxDQUFDLGtCQUFILEdBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBPYmplY3RfQ29tbW9uRXZlbnRcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE9iamVjdF9Db21tb25FdmVudCBleHRlbmRzIGdzLk9iamVjdF9CYXNlXG4gICAgQG9iamVjdENvZGVjQmxhY2tMaXN0ID0gW1wicmVjb3JkXCIsIFwiY29tbWFuZHNcIiwgXCJwYXJlbnRcIl1cbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgaWYgQHJpZD9cbiAgICAgICAgICAgIEByZWNvcmQgPSBSZWNvcmRNYW5hZ2VyLmNvbW1vbkV2ZW50c1tAcmlkXVxuICAgICAgICAgICAgQGludGVycHJldGVyPy5vYmplY3QgPSB0aGlzXG4gICAgICAgICAgICBAY29tbWFuZHMgPSBAcmVjb3JkLmNvbW1hbmRzXG5cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQSBjb21tb24tZXZlbnQgb2JqZWN0IGhhbmRsZXMgYSBzaW5nbGUgY29tbW9uIGV2ZW50IGRlZmluZWQgaW4gdGhlXG4gICAgKiBkYXRhYmFzZS4gQ29tbW9uIGV2ZW50cyBjYW4gcnVuIHBhcmFsbGVsIHRvIHRoZSBhY3R1YWwgc2NlbmUgY29udGVudFxuICAgICogb3IgY2FuIGJlIGp1c3QgY2FsbGVkIGZyb20gYSBzY2VuZSB0byBleGVjdXRlIGEgY29tbW9uIHBpZWNlIG9mIGxvZ2ljLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBPYmplY3RfQ29tbW9uRXZlbnRcbiAgICAqIEBleHRlbmRzIGdzLk9iamVjdF9CYXNlXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjb21tb24gZXZlbnQgZGF0YWJhc2UgcmVjb3JkLlxuICAgICAgICAqIEBwcm9wZXJ0eSByZWNvcmRcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEByZWNvcmQgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGJlaGF2aW9yIGNvbXBvbmVudCB0byBhZGQgY29tbW9uLWV2ZW50IHNwZWNpZmljIGJlaGF2aW9yIHRvIHRoZSBvYmplY3QuXG4gICAgICAgICogQHByb3BlcnR5IGJlaGF2aW9yXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X0NvbW1vbkV2ZW50QmVoYXZpb3JcbiAgICAgICAgIyMjXG4gICAgICAgIEBiZWhhdmlvciA9IG5ldyBncy5Db21wb25lbnRfQ29tbW9uRXZlbnRCZWhhdmlvcigpXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQW4gZXZlbnQtZW1pdHRlciB0byBlbWl0IGV2ZW50cy5cbiAgICAgICAgKiBAcHJvcGVydHkgZXZlbnRzXG4gICAgICAgICogQHR5cGUgZ3MuQ29tcG9uZW50X0V2ZW50RW1pdHRlclxuICAgICAgICAjIyNcbiAgICAgICAgQGV2ZW50cyA9IG5ldyBncy5Db21wb25lbnRfRXZlbnRFbWl0dGVyKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbiBpbnRlcnByZXRlciB0byBleGVjdXRlIHRoZSBjb21tYW5kcyBvZiB0aGUgY29tbW9uIGV2ZW50LlxuICAgICAgICAqIEBwcm9wZXJ0eSBpbnRlcnByZXRlclxuICAgICAgICAqIEB0eXBlIGdzLkNvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBpbnRlcnByZXRlciA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIEBldmVudHMub2JqZWN0ID0gdGhpc1xuICAgICAgICBcbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgQHJlc3RvcmUoZGF0YSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGFkZENvbXBvbmVudChAYmVoYXZpb3IpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNlcmlhbGl6ZXMgdGhlIGNvbW1vbi1ldmVudCBpbnRvIGEgZGF0YS1idW5kbGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB0b0RhdGFCdW5kbGVcbiAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjIyAgXG4gICAgdG9EYXRhQnVuZGxlOiAtPlxuICAgICAgICBAY29tbWFuZHMgPSBAcmVjb3JkLmNvbW1hbmRzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBiZWhhdmlvcjogQGJlaGF2aW9yLnRvRGF0YUJ1bmRsZSgpLFxuICAgICAgICAgICAgaW50ZXJwcmV0ZXI6IEBpbnRlcnByZXRlcj8udG9EYXRhQnVuZGxlKCksXG4gICAgICAgICAgICByZWNvcmRJZDogQHJlY29yZC5pbmRleFxuICAgICAgICB9XG4gICAgICAgXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgdGhlIGNvbW1vbi1ldmVudCBmcm9tIGEgZGF0YS1idW5kbGVcbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBidW5kbGUtIFRoZSBkYXRhLWJ1bmRsZS5cbiAgICAjIyMgICAgIFxuICAgIHJlc3RvcmU6IChkYXRhKSAtPlxuICAgICAgICBpZiBAYmVoYXZpb3I/XG4gICAgICAgICAgICBAcmVtb3ZlQ29tcG9uZW50KEBiZWhhdmlvcilcbiAgICAgICAgICAgIFxuICAgICAgICBAYmVoYXZpb3IgPSBuZXcgZ3MuQ29tcG9uZW50X0NvbW1vbkV2ZW50QmVoYXZpb3IoKVxuICAgICAgICBAYWRkQ29tcG9uZW50KEBiZWhhdmlvcilcbiAgICAgICAgQHJlY29yZCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzW2RhdGEucmVjb3JkSWRdXG4gICAgICAgIFxuICAgICAgICBAYmVoYXZpb3IucmVzdG9yZShkYXRhLmJlaGF2aW9yKVxuICAgICAgICBpZiBkYXRhLmludGVycHJldGVyIGFuZCBAaW50ZXJwcmV0ZXJcbiAgICAgICAgICAgIEBpbnRlcnByZXRlci5yZXN0b3JlKGRhdGEuaW50ZXJwcmV0ZXIpXG4gICAgICAgICAgICBAaW50ZXJwcmV0ZXIuY29udGV4dC5zZXQoQHJlY29yZC5pZCwgQHJlY29yZClcbiAgICAgICAgICAgIEBjb21tYW5kcyA9IEByZWNvcmQuY29tbWFuZHNcbiAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG5ncy5PYmplY3RfQ29tbW9uRXZlbnQgPSBPYmplY3RfQ29tbW9uRXZlbnQiXX0=
//# sourceURL=Object_CommonEvent_159.js