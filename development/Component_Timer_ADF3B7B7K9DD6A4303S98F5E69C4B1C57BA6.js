var Component_Timer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_Timer = (function(superClass) {
  extend(Component_Timer, superClass);


  /**
  * A component which adds timing-features to a game object. A timer-component
  * can be used as a regular timer or as a stop-watch.
  *
  * @module gs
  * @class Component_Timer
  * @extends gs.Component
  * @memberof gs
   */

  function Component_Timer() {
    Component_Timer.__super__.constructor.call(this);

    /**
    * Indicates if the timer is running. 
    *
    * @property isRunning
    * @type boolean
    * @readOnly
     */
    this.isRunning = false;

    /**
    * @property frameCount
    * @type number
    * @private
     */
    this.frameCount = 0;
  }


  /**
  * Starts the timer. 
  *
  * @method start
   */

  Component_Timer.prototype.start = function() {
    this.isRunning = true;
    if (this.object.stopWatch) {
      return this.frameCount = 0;
    } else {
      return this.frameCount = this.minutes * 60 * 60 + this.seconds * 60;
    }
  };


  /**
  * Stops the timer. 
  *
  * @method stop
   */

  Component_Timer.prototype.stop = function() {
    return this.isRunning = false;
  };


  /**
  * Resumes the timer. 
  *
  * @method resume
   */

  Component_Timer.prototype.resume = function() {
    return this.isRunning = true;
  };


  /**
  * Pauses the timer. 
  *
  * @method pause
   */

  Component_Timer.prototype.pause = function() {
    return this.isRunning = false;
  };


  /**
  * Updates the timer.
  *
  * @method update
   */

  Component_Timer.prototype.update = function() {
    if (this.object.stopWatch) {
      return this.updateStopWatch();
    } else {
      return this.updateTimer();
    }
  };


  /**
  * Updates the regular timer behavior
  *
  * @method updateTimer
   */

  Component_Timer.prototype.updateTimer = function() {
    var ref, seconds;
    if (this.isRunning && this.frameCount === 0) {
      this.isRunning = false;
      if ((ref = this.object.events) != null) {
        ref.emit("finish", this);
      }
    }
    if (!this.isRunning) {
      return;
    }
    seconds = Math.round(this.frameCount / 60);
    this.seconds = seconds % 60;
    this.minutes = Math.floor(seconds / 60);
    return this.frameCount--;
  };


  /**
  * Updates the stop-watch behavior
  *
  * @method updateStopWatch
   */

  Component_Timer.prototype.updateStopWatch = function() {
    var seconds;
    if (!this.isRunning) {
      return;
    }
    seconds = Math.round(this.frameCount / 60);
    this.seconds = seconds % 60;
    this.minutes = Math.floor(seconds / 60);
    return this.frameCount++;
  };

  return Component_Timer;

})(gs.Component);

gs.Component_Timer = Component_Timer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsZUFBQTtFQUFBOzs7QUFBTTs7OztBQUNGOzs7Ozs7Ozs7O0VBU2EseUJBQUE7SUFDVCwrQ0FBQTs7QUFFQTs7Ozs7OztJQU9BLElBQUMsQ0FBQSxTQUFELEdBQWE7O0FBRWI7Ozs7O0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYztFQWpCTDs7O0FBbUJiOzs7Ozs7NEJBS0EsS0FBQSxHQUFPLFNBQUE7SUFDSCxJQUFDLENBQUEsU0FBRCxHQUFhO0lBRWIsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVg7YUFDSSxJQUFDLENBQUEsVUFBRCxHQUFjLEVBRGxCO0tBQUEsTUFBQTthQUdJLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFYLEdBQWdCLEVBQWhCLEdBQXFCLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FIbEQ7O0VBSEc7OztBQVFQOzs7Ozs7NEJBS0EsSUFBQSxHQUFNLFNBQUE7V0FBRyxJQUFDLENBQUEsU0FBRCxHQUFhO0VBQWhCOzs7QUFFTjs7Ozs7OzRCQUtBLE1BQUEsR0FBUSxTQUFBO1dBQUcsSUFBQyxDQUFBLFNBQUQsR0FBYTtFQUFoQjs7O0FBRVI7Ozs7Ozs0QkFLQSxLQUFBLEdBQU8sU0FBQTtXQUFHLElBQUMsQ0FBQSxTQUFELEdBQWE7RUFBaEI7OztBQUVQOzs7Ozs7NEJBS0EsTUFBQSxHQUFRLFNBQUE7SUFDSixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBWDthQUNJLElBQUMsQ0FBQSxlQUFELENBQUEsRUFESjtLQUFBLE1BQUE7YUFHSSxJQUFDLENBQUEsV0FBRCxDQUFBLEVBSEo7O0VBREk7OztBQU1SOzs7Ozs7NEJBS0EsV0FBQSxHQUFhLFNBQUE7QUFDVCxRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsU0FBRCxJQUFlLElBQUMsQ0FBQSxVQUFELEtBQWUsQ0FBakM7TUFDSSxJQUFDLENBQUEsU0FBRCxHQUFhOztXQUNDLENBQUUsSUFBaEIsQ0FBcUIsUUFBckIsRUFBK0IsSUFBL0I7T0FGSjs7SUFHQSxJQUFHLENBQUksSUFBQyxDQUFBLFNBQVI7QUFBdUIsYUFBdkI7O0lBRUEsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQUF6QjtJQUVWLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBQSxHQUFVO0lBQ3JCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFBLEdBQVUsRUFBckI7V0FFWCxJQUFDLENBQUEsVUFBRDtFQVhTOzs7QUFhYjs7Ozs7OzRCQUtBLGVBQUEsR0FBaUIsU0FBQTtBQUNiLFFBQUE7SUFBQSxJQUFHLENBQUksSUFBQyxDQUFBLFNBQVI7QUFBdUIsYUFBdkI7O0lBRUEsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQUF6QjtJQUVWLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBQSxHQUFVO0lBQ3JCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFBLEdBQVUsRUFBckI7V0FFWCxJQUFDLENBQUEsVUFBRDtFQVJhOzs7O0dBakdTLEVBQUUsQ0FBQzs7QUErR2pDLEVBQUUsQ0FBQyxlQUFILEdBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfVGltZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9UaW1lciBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICMjIypcbiAgICAqIEEgY29tcG9uZW50IHdoaWNoIGFkZHMgdGltaW5nLWZlYXR1cmVzIHRvIGEgZ2FtZSBvYmplY3QuIEEgdGltZXItY29tcG9uZW50XG4gICAgKiBjYW4gYmUgdXNlZCBhcyBhIHJlZ3VsYXIgdGltZXIgb3IgYXMgYSBzdG9wLXdhdGNoLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfVGltZXJcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgdGhlIHRpbWVyIGlzIHJ1bm5pbmcuIFxuICAgICAgICAqXG4gICAgICAgICogQHByb3BlcnR5IGlzUnVubmluZ1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBpc1J1bm5pbmcgPSBub1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBmcmFtZUNvdW50XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgIyMjXG4gICAgICAgIEBmcmFtZUNvdW50ID0gMFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTdGFydHMgdGhlIHRpbWVyLiBcbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0YXJ0XG4gICAgIyMjXG4gICAgc3RhcnQ6IC0+IFxuICAgICAgICBAaXNSdW5uaW5nID0geWVzXG4gICAgICAgIFxuICAgICAgICBpZiBAb2JqZWN0LnN0b3BXYXRjaFxuICAgICAgICAgICAgQGZyYW1lQ291bnQgPSAwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBmcmFtZUNvdW50ID0gQG1pbnV0ZXMgKiA2MCAqIDYwICsgQHNlY29uZHMgKiA2MFxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTdG9wcyB0aGUgdGltZXIuIFxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RvcFxuICAgICMjIyAgIFxuICAgIHN0b3A6IC0+IEBpc1J1bm5pbmcgPSBub1xuICAgIFxuICAgICMjIypcbiAgICAqIFJlc3VtZXMgdGhlIHRpbWVyLiBcbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3VtZVxuICAgICMjI1xuICAgIHJlc3VtZTogLT4gQGlzUnVubmluZyA9IHllc1xuICAgIFxuICAgICMjIypcbiAgICAqIFBhdXNlcyB0aGUgdGltZXIuIFxuICAgICpcbiAgICAqIEBtZXRob2QgcGF1c2VcbiAgICAjIyNcbiAgICBwYXVzZTogLT4gQGlzUnVubmluZyA9IG5vXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgdGhlIHRpbWVyLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBpZiBAb2JqZWN0LnN0b3BXYXRjaFxuICAgICAgICAgICAgQHVwZGF0ZVN0b3BXYXRjaCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB1cGRhdGVUaW1lcigpXG4gICAgICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSByZWd1bGFyIHRpbWVyIGJlaGF2aW9yXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVUaW1lclxuICAgICMjI1xuICAgIHVwZGF0ZVRpbWVyOiAtPlxuICAgICAgICBpZiBAaXNSdW5uaW5nIGFuZCBAZnJhbWVDb3VudCA9PSAwXG4gICAgICAgICAgICBAaXNSdW5uaW5nID0gbm9cbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwiZmluaXNoXCIsIHRoaXMpXG4gICAgICAgIGlmIG5vdCBAaXNSdW5uaW5nIHRoZW4gcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBzZWNvbmRzID0gTWF0aC5yb3VuZChAZnJhbWVDb3VudCAvIDYwKVxuICAgICAgICBcbiAgICAgICAgQHNlY29uZHMgPSBzZWNvbmRzICUgNjBcbiAgICAgICAgQG1pbnV0ZXMgPSBNYXRoLmZsb29yKHNlY29uZHMgLyA2MClcbiAgICAgICAgXG4gICAgICAgIEBmcmFtZUNvdW50LS1cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgc3RvcC13YXRjaCBiZWhhdmlvclxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlU3RvcFdhdGNoXG4gICAgIyMjXG4gICAgdXBkYXRlU3RvcFdhdGNoOiAtPlxuICAgICAgICBpZiBub3QgQGlzUnVubmluZyB0aGVuIHJldHVyblxuICAgICAgICBcbiAgICAgICAgc2Vjb25kcyA9IE1hdGgucm91bmQoQGZyYW1lQ291bnQgLyA2MClcbiAgICAgICAgXG4gICAgICAgIEBzZWNvbmRzID0gc2Vjb25kcyAlIDYwXG4gICAgICAgIEBtaW51dGVzID0gTWF0aC5mbG9vcihzZWNvbmRzIC8gNjApXG4gICAgICAgIFxuICAgICAgICBAZnJhbWVDb3VudCsrXG4gICAgICAgIFxuICAgICAgICAgICAgXG5cbiAgICAgICAgXG4gXG5ncy5Db21wb25lbnRfVGltZXIgPSBDb21wb25lbnRfVGltZXIiXX0=
//# sourceURL=Component_Timer_172.js