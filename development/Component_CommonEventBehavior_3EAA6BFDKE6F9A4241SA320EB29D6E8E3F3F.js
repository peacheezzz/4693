var Component_CommonEventBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_CommonEventBehavior = (function(superClass) {
  extend(Component_CommonEventBehavior, superClass);


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  *
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_CommonEventBehavior.prototype.onDataBundleRestore = function(data, context) {
    var ref;
    if (this.object.rid != null) {
      this.object.record = RecordManager.commonEvents[this.object.rid];
      if ((ref = this.object.interpreter) != null) {
        ref.object = this;
      }
      this.object.commands = this.object.record.commands;
    }
    return this.setupEventHandlers();
  };


  /**
  * A component which allows a game object to execute common-events.
  *
  * @module gs
  * @class Component_CommonEventBehavior
  * @extends gs.Component
  * @memberof gs
   */

  function Component_CommonEventBehavior() {
    Component_CommonEventBehavior.__super__.constructor.call(this);

    /**
    * @property readyToStart
    * @type boolean
    * @private
     */
    this.readyToStart = false;

    /**
    * @property initialized
    * @type boolean
    * @private
     */
    this.initialized = false;
    this.callDepth = 0;
    this.callIdStack = [];
    this.nextCallId = 0;
  }


  /**
  * Serializes the component into a data-bundle.
  *
  * @method toDataBundle
  * @return {Object} The data-bundle.
   */

  Component_CommonEventBehavior.prototype.toDataBundle = function() {
    return {
      initialized: this.initialized,
      readyToStart: this.readyToStart
    };
  };


  /**
  * Restores the component from a data-bundle
  *
  * @method restore
  * @param {Object} bundle- The data-bundle.
   */

  Component_CommonEventBehavior.prototype.restore = function(data) {
    this.setup();
    this.readyToStart = data.readyToStart;
    return this.initialized = data.initialized;
  };


  /**
  * Adds event-handlers for mouse/touch events
  *
  * @method setupEventHandlers
   */

  Component_CommonEventBehavior.prototype.setupEventHandlers = function() {
    if (!this.object.interpreter) {
      return;
    }
    if (this.object.record.startCondition === 1) {
      return this.object.interpreter.onFinish = (function(_this) {
        return function() {
          var ref;
          if (!_this.object.record.parallel) {
            return (ref = _this.object.events) != null ? ref.emit("finish", _this) : void 0;
          }
        };
      })(this);
    } else {
      if (this.object.record.parallel) {
        return this.object.interpreter.onFinish = (function(_this) {
          return function(sender) {
            _this.object.removeComponent(sender);
            if (!_this.object.record.singleInstance) {
              _this.callIdStack.push(sender.context.callId);
              return _this.callDepth--;
            }
          };
        })(this);
      } else {
        return this.object.interpreter.onFinish = (function(_this) {
          return function(sender) {
            _this.callIdStack.push(sender.context.callId);
            _this.callDepth--;
            return _this.object.events.emit("finish", _this);
          };
        })(this);
      }
    }
  };


  /**
  * Initializes the common-event.
  *
  * @method setup
   */

  Component_CommonEventBehavior.prototype.setup = function() {
    GameManager.variableStore.setupLocalVariables(this.object.record);
    this.object.record.parameters = this.object.record.parameters != null ? this.object.record.parameters : [];
    this.object.record.startCondition = this.object.record.startCondition != null ? this.object.record.startCondition : 0;
    this.object.record.parallel = this.object.record.parallel != null ? this.object.record.parallel : false;
    this.object.record.conditionSwitch = this.object.record.conditionSwitch != null ? this.object.record.conditionSwitch : null;
    this.object.record.conditionEnabled = this.object.record.conditionEnabled;
    if (this.object.record.startCondition === 1) {
      this.object.interpreter = new gs.Component_CommandInterpreter();
      this.object.interpreter.onFinish = (function(_this) {
        return function() {
          var ref;
          if (!_this.object.record.parallel) {
            return (ref = _this.object.events) != null ? ref.emit("finish", _this) : void 0;
          } else {
            return _this.restart();
          }
        };
      })(this);
      this.object.interpreter.context.set(this.object.record.index, this.object.record);
      this.object.addComponent(this.object.interpreter);
    }
    return this.initialized = true;
  };


  /**
  * Starts the common-event interpreter with the specified parameters.
  *
  * @method start
  * @param {Object} parameters The common-event's parameters which can be configured in database.
   */

  Component_CommonEventBehavior.prototype.start = function(parameters) {
    var ref, ref1;
    this.startParameters = parameters;
    if ((this.object.interpreter != null) && !this.object.interpreter.isRunning) {
      this.object.commands = this.object.record.commands;
      this.readyToStart = true;
      if ((ref = this.object.events) != null) {
        ref.emit("start", this);
      }
    }
    if (this.object.record.startCondition === 0 && this.object.record.parallel) {
      return (ref1 = this.object.events) != null ? ref1.emit("finish", this) : void 0;
    }
  };


  /**
  * Initializes variable-store with the start-up parameters configured for the
  * common-event in Database.
  *
  * @method setupParameters
   */

  Component_CommonEventBehavior.prototype.setupParameters = function(parameters, parentContext) {
    var i, j, parameter, ref, results, value;
    if ((parameters != null) && (parameters.values != null)) {
      results = [];
      for (i = j = 0, ref = parameters.values.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        value = parameters.values[i];
        parameter = this.object.record.parameters[i];
        if ((parameter != null) && (value != null)) {
          GameManager.variableStore.setupTempVariables(parentContext);
          switch (parameter.type) {
            case 1:
              value = GameManager.variableStore.numberValueOf(value);
              GameManager.variableStore.setupTempVariables(this.object.interpreter.context);
              results.push(GameManager.variableStore.setNumberValueTo(parameter.numberVariable, value));
              break;
            case 2:
              value = GameManager.variableStore.booleanValueOf(value);
              GameManager.variableStore.setupTempVariables(this.object.interpreter.context);
              results.push(GameManager.variableStore.setBooleanValueTo(parameter.booleanVariable, value));
              break;
            case 3:
              value = GameManager.variableStore.stringValueOf(lcs(value));
              GameManager.variableStore.setupTempVariables(this.object.interpreter.context);
              results.push(GameManager.variableStore.setStringValueTo(parameter.stringVariable, value));
              break;
            case 4:
              value = GameManager.variableStore.listObjectOf(value);
              GameManager.variableStore.setupTempVariables(this.object.interpreter.context);
              results.push(GameManager.variableStore.setListObjectTo(parameter.listVariable, value));
              break;
            default:
              results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

  Component_CommonEventBehavior.prototype.generateCallId = function() {
    if (this.callIdStack.length > 0) {
      return this.callIdStack.pop();
    } else {
      return this.nextCallId++;
    }
  };


  /**
  * Calls the common-event with the specified parameters.
  *
  * @method call
  * @param {Object} parameters The common-event's parameters which can be configured in database.
   */

  Component_CommonEventBehavior.prototype.call = function(parameters, settings, parentContext) {
    var callId, interpreter;
    if (!this.object.record.singleInstance) {
      callId = this.generateCallId();
      interpreter = new gs.Component_CommandInterpreter();
      interpreter.context.set(this.object.record.index + "_" + callId, this.object.record);
      interpreter.context.callId = callId;
      GameManager.variableStore.clearTempVariables(interpreter.context);
      this.object.commands = this.object.record.commands;
      this.callDepth++;
    } else {
      interpreter = this.object.interpreter || new gs.Component_CommandInterpreter();
      interpreter.context.set(this.object.record.index, this.object.record);
      this.object.commands = this.object.record.commands;
    }
    interpreter.repeat = false;
    interpreter.object = this.object;
    if (settings) {
      interpreter.settings = settings;
    }
    this.object.interpreter = interpreter;
    GameManager.variableStore.setupTempVariables(interpreter.context);
    this.setupParameters(parameters, parentContext);
    if (this.object.record.parallel) {
      interpreter.onFinish = (function(_this) {
        return function(sender) {
          _this.object.removeComponent(sender);
          if (!_this.object.record.singleInstance) {
            _this.callIdStack.push(sender.context.callId);
            return _this.callDepth--;
          }
        };
      })(this);
      interpreter.start();
      this.object.addComponent(interpreter);
      return null;
    } else {
      interpreter.onFinish = (function(_this) {
        return function(sender) {
          _this.callIdStack.push(sender.context.callId);
          _this.callDepth--;
          return _this.object.events.emit("finish", _this);
        };
      })(this);
      return interpreter;
    }
  };


  /**
  * Stops the common-event interpreter.
  *
  * @method stop
   */

  Component_CommonEventBehavior.prototype.stop = function() {
    var ref;
    if (this.object.interpreter != null) {
      this.object.interpreter.stop();
      return (ref = this.object.events) != null ? ref.emit("finish", this) : void 0;
    }
  };


  /**
  * Resumes a paused common-event interpreter.
  *
  * @method resume
   */

  Component_CommonEventBehavior.prototype.resume = function() {
    var ref, ref1;
    if (this.object.interpreter != null) {
      this.object.interpreter.resume();
      if ((ref = this.object.events) != null) {
        ref.emit("start", this);
      }
      return (ref1 = this.object.events) != null ? ref1.emit("resume", this) : void 0;
    }
  };


  /**
  * Restarts the common event. If the common event has a condition then the restart
  * will only happen if that condition is true.
  *
  * @method restart
   */

  Component_CommonEventBehavior.prototype.restart = function() {
    if (this.object.record.conditionEnabled) {
      if (GameManager.variableStore.booleanValueOf(this.object.record.conditionSwitch)) {
        return this.start();
      }
    } else {
      return this.start();
    }
  };


  /**
  * Restarts the common event if it is parallel and the conditions are met.
  *
  * @method restartIfNecessary
   */

  Component_CommonEventBehavior.prototype.restartIfNecessary = function() {
    if ((this.object.interpreter != null) && this.object.record.startCondition === 1 && !this.object.interpreter.isRunning) {
      return this.restart();
    }
  };


  /**
  * Updates the common-event interpreter.
  *
  * @method update
   */

  Component_CommonEventBehavior.prototype.update = function() {
    if (!this.initialized) {
      this.setup();
    }
    if ((this.object.interpreter != null) && this.readyToStart) {
      this.readyToStart = false;
      this.setupParameters(this.startParameters);
      this.object.interpreter.start();
    }
    return this.restartIfNecessary();
  };


  /**
  * Not implemented yet.
  *
  * @method erase
   */

  Component_CommonEventBehavior.prototype.erase = function() {};

  return Component_CommonEventBehavior;

})(gs.Component);

gs.Component_CommonEventBehavior = Component_CommonEventBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsNkJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OzBDQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDakIsUUFBQTtJQUFBLElBQUcsdUJBQUg7TUFDSSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsYUFBYSxDQUFDLFlBQWEsQ0FBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVI7O1dBQ3pCLENBQUUsTUFBckIsR0FBOEI7O01BQzlCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUh0Qzs7V0FJQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtFQUxpQjs7O0FBT3JCOzs7Ozs7Ozs7RUFRYSx1Q0FBQTtJQUNULDZEQUFBOztBQUVBOzs7OztJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCOztBQUVoQjs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBRWYsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQUNiLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFDZixJQUFDLENBQUEsVUFBRCxHQUFjO0VBbkJMOzs7QUFxQmI7Ozs7Ozs7MENBTUEsWUFBQSxHQUFjLFNBQUE7QUFDVixXQUFPO01BQ0gsV0FBQSxFQUFhLElBQUMsQ0FBQSxXQURYO01BRUgsWUFBQSxFQUFjLElBQUMsQ0FBQSxZQUZaOztFQURHOzs7QUFNZDs7Ozs7OzswQ0FNQSxPQUFBLEdBQVMsU0FBQyxJQUFEO0lBQ0wsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUksQ0FBQztXQUNyQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUksQ0FBQztFQUhmOzs7QUFLVDs7Ozs7OzBDQUtBLGtCQUFBLEdBQW9CLFNBQUE7SUFDaEIsSUFBRyxDQUFDLElBQUMsQ0FB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QUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFmLEtBQWlDLENBQTFELElBQWdFLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBM0Y7YUFDSSxJQUFDLENBQUEsT0FBRCxDQUFBLEVBREo7O0VBRGdCOzs7QUFJcEI7Ozs7OzswQ0FLQSxNQUFBLEdBQVEsU0FBQTtJQUNKLElBQUcsQ0FBSSxJQUFDLENBQUEsV0FBUjtNQUNJLElBQUMsQ0FBQSxLQUFELENBQUEsRUFESjs7SUFHQSxJQUFHLGlDQUFBLElBQXlCLElBQUMsQ0FBQSxZQUE3QjtNQUNJLElBQUMsQ0FBQSxZQUFELEdBQWdCO01BQ2hCLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQUMsQ0FBQSxlQUFsQjtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQXBCLENBQUEsRUFISjs7V0FLQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtFQVRJOzs7QUFXUjs7Ozs7OzBDQUtBLEtBQUEsR0FBTyxTQUFBLEdBQUE7Ozs7R0EvUmlDLEVBQUUsQ0FBQzs7QUFpUy9DLEVBQUUsQ0FBQyw2QkFBSCxHQUFtQyIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X0NvbW1vbkV2ZW50QmVoYXZpb3JcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9Db21tb25FdmVudEJlaGF2aW9yIGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgaWYgQG9iamVjdC5yaWQ/XG4gICAgICAgICAgICBAb2JqZWN0LnJlY29yZCA9IFJlY29yZE1hbmFnZXIuY29tbW9uRXZlbnRzW0BvYmplY3QucmlkXVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlcj8ub2JqZWN0ID0gdGhpc1xuICAgICAgICAgICAgQG9iamVjdC5jb21tYW5kcyA9IEBvYmplY3QucmVjb3JkLmNvbW1hbmRzXG4gICAgICAgIEBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuXG4gICAgIyMjKlxuICAgICogQSBjb21wb25lbnQgd2hpY2ggYWxsb3dzIGEgZ2FtZSBvYmplY3QgdG8gZXhlY3V0ZSBjb21tb24tZXZlbnRzLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBDb21wb25lbnRfQ29tbW9uRXZlbnRCZWhhdmlvclxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgcmVhZHlUb1N0YXJ0XG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAcmVhZHlUb1N0YXJ0ID0gbm9cblxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGluaXRpYWxpemVkXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICMjI1xuICAgICAgICBAaW5pdGlhbGl6ZWQgPSBub1xuXG4gICAgICAgIEBjYWxsRGVwdGggPSAwXG4gICAgICAgIEBjYWxsSWRTdGFjayA9IFtdXG4gICAgICAgIEBuZXh0Q2FsbElkID0gMFxuXG4gICAgIyMjKlxuICAgICogU2VyaWFsaXplcyB0aGUgY29tcG9uZW50IGludG8gYSBkYXRhLWJ1bmRsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRvRGF0YUJ1bmRsZVxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgZGF0YS1idW5kbGUuXG4gICAgIyMjXG4gICAgdG9EYXRhQnVuZGxlOiAtPlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5pdGlhbGl6ZWQ6IEBpbml0aWFsaXplZCxcbiAgICAgICAgICAgIHJlYWR5VG9TdGFydDogQHJlYWR5VG9TdGFydFxuICAgICAgICB9XG5cbiAgICAjIyMqXG4gICAgKiBSZXN0b3JlcyB0aGUgY29tcG9uZW50IGZyb20gYSBkYXRhLWJ1bmRsZVxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdG9yZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGJ1bmRsZS0gVGhlIGRhdGEtYnVuZGxlLlxuICAgICMjI1xuICAgIHJlc3RvcmU6IChkYXRhKSAtPlxuICAgICAgICBAc2V0dXAoKVxuICAgICAgICBAcmVhZHlUb1N0YXJ0ID0gZGF0YS5yZWFkeVRvU3RhcnRcbiAgICAgICAgQGluaXRpYWxpemVkID0gZGF0YS5pbml0aWFsaXplZFxuXG4gICAgIyMjKlxuICAgICogQWRkcyBldmVudC1oYW5kbGVycyBmb3IgbW91c2UvdG91Y2ggZXZlbnRzXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cEV2ZW50SGFuZGxlcnNcbiAgICAjIyNcbiAgICBzZXR1cEV2ZW50SGFuZGxlcnM6IC0+XG4gICAgICAgIGlmICFAb2JqZWN0LmludGVycHJldGVyIHRoZW4gcmV0dXJuXG5cbiAgICAgICAgaWYgQG9iamVjdC5yZWNvcmQuc3RhcnRDb25kaXRpb24gPT0gMVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5vbkZpbmlzaCA9ID0+XG4gICAgICAgICAgICAgICAgaWYgbm90IEBvYmplY3QucmVjb3JkLnBhcmFsbGVsXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwiZmluaXNoXCIsIHRoaXMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIEBvYmplY3QucmVjb3JkLnBhcmFsbGVsXG4gICAgICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5vbkZpbmlzaCA9IChzZW5kZXIpID0+IFxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LnJlbW92ZUNvbXBvbmVudChzZW5kZXIpXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBAb2JqZWN0LnJlY29yZC5zaW5nbGVJbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgQGNhbGxJZFN0YWNrLnB1c2goc2VuZGVyLmNvbnRleHQuY2FsbElkKVxuICAgICAgICAgICAgICAgICAgICAgICAgQGNhbGxEZXB0aC0tXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5vbkZpbmlzaCA9IChzZW5kZXIpID0+XG4gICAgICAgICAgICAgICAgICAgIEBjYWxsSWRTdGFjay5wdXNoKHNlbmRlci5jb250ZXh0LmNhbGxJZClcbiAgICAgICAgICAgICAgICAgICAgQGNhbGxEZXB0aC0tXG4gICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzLmVtaXQoXCJmaW5pc2hcIiwgdGhpcylcblxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSBjb21tb24tZXZlbnQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFxuICAgICMjI1xuICAgIHNldHVwOiAtPlxuICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwTG9jYWxWYXJpYWJsZXMoQG9iamVjdC5yZWNvcmQpXG5cbiAgICAgICAgQG9iamVjdC5yZWNvcmQucGFyYW1ldGVycyA9IGlmIEBvYmplY3QucmVjb3JkLnBhcmFtZXRlcnM/IHRoZW4gQG9iamVjdC5yZWNvcmQucGFyYW1ldGVycyBlbHNlIFtdXG4gICAgICAgIEBvYmplY3QucmVjb3JkLnN0YXJ0Q29uZGl0aW9uID0gaWYgQG9iamVjdC5yZWNvcmQuc3RhcnRDb25kaXRpb24/IHRoZW4gQG9iamVjdC5yZWNvcmQuc3RhcnRDb25kaXRpb24gZWxzZSAwXG4gICAgICAgIEBvYmplY3QucmVjb3JkLnBhcmFsbGVsID0gaWYgQG9iamVjdC5yZWNvcmQucGFyYWxsZWw/IHRoZW4gQG9iamVjdC5yZWNvcmQucGFyYWxsZWwgZWxzZSBub1xuICAgICAgICBAb2JqZWN0LnJlY29yZC5jb25kaXRpb25Td2l0Y2ggPSBpZiBAb2JqZWN0LnJlY29yZC5jb25kaXRpb25Td2l0Y2g/IHRoZW4gQG9iamVjdC5yZWNvcmQuY29uZGl0aW9uU3dpdGNoIGVsc2UgbnVsbFxuICAgICAgICBAb2JqZWN0LnJlY29yZC5jb25kaXRpb25FbmFibGVkID0gQG9iamVjdC5yZWNvcmQuY29uZGl0aW9uRW5hYmxlZFxuXG4gICAgICAgIGlmIEBvYmplY3QucmVjb3JkLnN0YXJ0Q29uZGl0aW9uID09IDFcbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIgPSBuZXcgZ3MuQ29tcG9uZW50X0NvbW1hbmRJbnRlcnByZXRlcigpXG4gICAgICAgICAgICBAb2JqZWN0LmludGVycHJldGVyLm9uRmluaXNoID0gPT5cbiAgICAgICAgICAgICAgICBpZiBub3QgQG9iamVjdC5yZWNvcmQucGFyYWxsZWxcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJmaW5pc2hcIiwgdGhpcylcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEByZXN0YXJ0KClcblxuXG4gICAgICAgICAgICBAb2JqZWN0LmludGVycHJldGVyLmNvbnRleHQuc2V0KEBvYmplY3QucmVjb3JkLmluZGV4LCBAb2JqZWN0LnJlY29yZClcbiAgICAgICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KEBvYmplY3QuaW50ZXJwcmV0ZXIpXG5cbiAgICAgICAgQGluaXRpYWxpemVkID0geWVzXG5cbiAgICAjIyMqXG4gICAgKiBTdGFydHMgdGhlIGNvbW1vbi1ldmVudCBpbnRlcnByZXRlciB3aXRoIHRoZSBzcGVjaWZpZWQgcGFyYW1ldGVycy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0YXJ0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1ldGVycyBUaGUgY29tbW9uLWV2ZW50J3MgcGFyYW1ldGVycyB3aGljaCBjYW4gYmUgY29uZmlndXJlZCBpbiBkYXRhYmFzZS5cbiAgICAjIyNcbiAgICBzdGFydDogKHBhcmFtZXRlcnMpIC0+XG4gICAgICAgIEBzdGFydFBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJzXG5cbiAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlcj8gYW5kIG5vdCBAb2JqZWN0LmludGVycHJldGVyLmlzUnVubmluZ1xuICAgICAgICAgICAgQG9iamVjdC5jb21tYW5kcyA9IEBvYmplY3QucmVjb3JkLmNvbW1hbmRzXG4gICAgICAgICAgICBAcmVhZHlUb1N0YXJ0ID0geWVzXG4gICAgICAgICAgICBAb2JqZWN0LmV2ZW50cz8uZW1pdChcInN0YXJ0XCIsIHRoaXMpXG5cbiAgICAgICAgaWYgQG9iamVjdC5yZWNvcmQuc3RhcnRDb25kaXRpb24gPT0gMCBhbmQgQG9iamVjdC5yZWNvcmQucGFyYWxsZWxcbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwiZmluaXNoXCIsIHRoaXMpXG5cbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB2YXJpYWJsZS1zdG9yZSB3aXRoIHRoZSBzdGFydC11cCBwYXJhbWV0ZXJzIGNvbmZpZ3VyZWQgZm9yIHRoZVxuICAgICogY29tbW9uLWV2ZW50IGluIERhdGFiYXNlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBQYXJhbWV0ZXJzXG4gICAgIyMjXG4gICAgc2V0dXBQYXJhbWV0ZXJzOiAocGFyYW1ldGVycywgcGFyZW50Q29udGV4dCkgLT5cbiAgICAgICAgaWYgcGFyYW1ldGVycz8gYW5kIHBhcmFtZXRlcnMudmFsdWVzP1xuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5wYXJhbWV0ZXJzLnZhbHVlcy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJhbWV0ZXJzLnZhbHVlc1tpXVxuICAgICAgICAgICAgICAgIHBhcmFtZXRlciA9IEBvYmplY3QucmVjb3JkLnBhcmFtZXRlcnNbaV1cbiAgICAgICAgICAgICAgICBpZiBwYXJhbWV0ZXI/IGFuZCB2YWx1ZT9cbiAgICAgICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXR1cFRlbXBWYXJpYWJsZXMocGFyZW50Q29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIHBhcmFtZXRlci50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDEgIyBOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubnVtYmVyVmFsdWVPZih2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAb2JqZWN0LmludGVycHJldGVyLmNvbnRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXROdW1iZXJWYWx1ZVRvKHBhcmFtZXRlci5udW1iZXJWYXJpYWJsZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDIgIyBCb29sZWFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmJvb2xlYW5WYWx1ZU9mKHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXBUZW1wVmFyaWFibGVzKEBvYmplY3QuaW50ZXJwcmV0ZXIuY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldEJvb2xlYW5WYWx1ZVRvKHBhcmFtZXRlci5ib29sZWFuVmFyaWFibGUsIHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAzICMgU3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnN0cmluZ1ZhbHVlT2YobGNzKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAb2JqZWN0LmludGVycHJldGVyLmNvbnRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXRTdHJpbmdWYWx1ZVRvKHBhcmFtZXRlci5zdHJpbmdWYXJpYWJsZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuIDQgIyBMaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmxpc3RPYmplY3RPZih2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnNldHVwVGVtcFZhcmlhYmxlcyhAb2JqZWN0LmludGVycHJldGVyLmNvbnRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zZXRMaXN0T2JqZWN0VG8ocGFyYW1ldGVyLmxpc3RWYXJpYWJsZSwgdmFsdWUpXG5cbiAgICBcbiAgICBnZW5lcmF0ZUNhbGxJZDogKCkgLT5cbiAgICAgICAgaWYgQGNhbGxJZFN0YWNrLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIHJldHVybiBAY2FsbElkU3RhY2sucG9wKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEBuZXh0Q2FsbElkKytcbiAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxscyB0aGUgY29tbW9uLWV2ZW50IHdpdGggdGhlIHNwZWNpZmllZCBwYXJhbWV0ZXJzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2FsbFxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtZXRlcnMgVGhlIGNvbW1vbi1ldmVudCdzIHBhcmFtZXRlcnMgd2hpY2ggY2FuIGJlIGNvbmZpZ3VyZWQgaW4gZGF0YWJhc2UuXG4gICAgIyMjXG4gICAgY2FsbDogKHBhcmFtZXRlcnMsIHNldHRpbmdzLCBwYXJlbnRDb250ZXh0KSAtPlxuICAgICAgICBpZiBub3QgQG9iamVjdC5yZWNvcmQuc2luZ2xlSW5zdGFuY2VcbiAgICAgICAgICAgIGNhbGxJZCA9IEBnZW5lcmF0ZUNhbGxJZCgpXG4gICAgICAgICAgICBpbnRlcnByZXRlciA9IG5ldyBncy5Db21wb25lbnRfQ29tbWFuZEludGVycHJldGVyKClcbiAgICAgICAgICAgIGludGVycHJldGVyLmNvbnRleHQuc2V0KEBvYmplY3QucmVjb3JkLmluZGV4ICsgXCJfXCIgKyBjYWxsSWQsIEBvYmplY3QucmVjb3JkKVxuICAgICAgICAgICAgaW50ZXJwcmV0ZXIuY29udGV4dC5jYWxsSWQgPSBjYWxsSWRcbiAgICAgICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuY2xlYXJUZW1wVmFyaWFibGVzKGludGVycHJldGVyLmNvbnRleHQpXG4gICAgICAgICAgICBAb2JqZWN0LmNvbW1hbmRzID0gQG9iamVjdC5yZWNvcmQuY29tbWFuZHNcbiAgICAgICAgICAgIEBjYWxsRGVwdGgrK1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpbnRlcnByZXRlciA9IEBvYmplY3QuaW50ZXJwcmV0ZXIgfHwgbmV3IGdzLkNvbXBvbmVudF9Db21tYW5kSW50ZXJwcmV0ZXIoKVxuICAgICAgICAgICAgaW50ZXJwcmV0ZXIuY29udGV4dC5zZXQoQG9iamVjdC5yZWNvcmQuaW5kZXgsIEBvYmplY3QucmVjb3JkKVxuICAgICAgICAgICAgQG9iamVjdC5jb21tYW5kcyA9IEBvYmplY3QucmVjb3JkLmNvbW1hbmRzXG5cbiAgICAgICAgaW50ZXJwcmV0ZXIucmVwZWF0ID0gbm9cbiAgICAgICAgaW50ZXJwcmV0ZXIub2JqZWN0ID0gQG9iamVjdFxuICAgICAgICBpbnRlcnByZXRlci5zZXR0aW5ncyA9IHNldHRpbmdzIGlmIHNldHRpbmdzXG4gICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIgPSBpbnRlcnByZXRlclxuXG4gICAgICAgIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc2V0dXBUZW1wVmFyaWFibGVzKGludGVycHJldGVyLmNvbnRleHQpXG4gICAgICAgIEBzZXR1cFBhcmFtZXRlcnMocGFyYW1ldGVycywgcGFyZW50Q29udGV4dClcblxuICAgICAgICBpZiBAb2JqZWN0LnJlY29yZC5wYXJhbGxlbFxuICAgICAgICAgICAgaW50ZXJwcmV0ZXIub25GaW5pc2ggPSAoc2VuZGVyKSA9PlxuICAgICAgICAgICAgICAgIEBvYmplY3QucmVtb3ZlQ29tcG9uZW50KHNlbmRlcilcbiAgICAgICAgICAgICAgICBpZiBub3QgQG9iamVjdC5yZWNvcmQuc2luZ2xlSW5zdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgQGNhbGxJZFN0YWNrLnB1c2goc2VuZGVyLmNvbnRleHQuY2FsbElkKVxuICAgICAgICAgICAgICAgICAgICBAY2FsbERlcHRoLS1cbiAgICAgICAgICAgIGludGVycHJldGVyLnN0YXJ0KClcbiAgICAgICAgICAgIEBvYmplY3QuYWRkQ29tcG9uZW50KGludGVycHJldGVyKVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpbnRlcnByZXRlci5vbkZpbmlzaCA9IChzZW5kZXIpID0+XG4gICAgICAgICAgICAgICAgQGNhbGxJZFN0YWNrLnB1c2goc2VuZGVyLmNvbnRleHQuY2FsbElkKVxuICAgICAgICAgICAgICAgIEBjYWxsRGVwdGgtLVxuICAgICAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzLmVtaXQoXCJmaW5pc2hcIiwgdGhpcylcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnByZXRlclxuXG4gICAgIyMjKlxuICAgICogU3RvcHMgdGhlIGNvbW1vbi1ldmVudCBpbnRlcnByZXRlci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0b3BcbiAgICAjIyNcbiAgICBzdG9wOiAtPlxuICAgICAgICBpZiBAb2JqZWN0LmludGVycHJldGVyP1xuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5zdG9wKClcbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwiZmluaXNoXCIsIHRoaXMpXG5cbiAgICAjIyMqXG4gICAgKiBSZXN1bWVzIGEgcGF1c2VkIGNvbW1vbi1ldmVudCBpbnRlcnByZXRlci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3VtZVxuICAgICMjI1xuICAgIHJlc3VtZTogLT5cbiAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlcj9cbiAgICAgICAgICAgIEBvYmplY3QuaW50ZXJwcmV0ZXIucmVzdW1lKClcbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwic3RhcnRcIiwgdGhpcylcbiAgICAgICAgICAgIEBvYmplY3QuZXZlbnRzPy5lbWl0KFwicmVzdW1lXCIsIHRoaXMpXG5cblxuICAgICMjIypcbiAgICAqIFJlc3RhcnRzIHRoZSBjb21tb24gZXZlbnQuIElmIHRoZSBjb21tb24gZXZlbnQgaGFzIGEgY29uZGl0aW9uIHRoZW4gdGhlIHJlc3RhcnRcbiAgICAqIHdpbGwgb25seSBoYXBwZW4gaWYgdGhhdCBjb25kaXRpb24gaXMgdHJ1ZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RhcnRcbiAgICAjIyNcbiAgICByZXN0YXJ0OiAtPlxuICAgICAgICAgICAgaWYgQG9iamVjdC5yZWNvcmQuY29uZGl0aW9uRW5hYmxlZFxuICAgICAgICAgICAgICAgIGlmIEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuYm9vbGVhblZhbHVlT2YoQG9iamVjdC5yZWNvcmQuY29uZGl0aW9uU3dpdGNoKVxuICAgICAgICAgICAgICAgICAgICBAc3RhcnQoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBzdGFydCgpXG5cbiAgICAjIyMqXG4gICAgKiBSZXN0YXJ0cyB0aGUgY29tbW9uIGV2ZW50IGlmIGl0IGlzIHBhcmFsbGVsIGFuZCB0aGUgY29uZGl0aW9ucyBhcmUgbWV0LlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVzdGFydElmTmVjZXNzYXJ5XG4gICAgIyMjXG4gICAgcmVzdGFydElmTmVjZXNzYXJ5OiAtPlxuICAgICAgICBpZiBAb2JqZWN0LmludGVycHJldGVyPyBhbmQgQG9iamVjdC5yZWNvcmQuc3RhcnRDb25kaXRpb24gPT0gMSBhbmQgbm90IEBvYmplY3QuaW50ZXJwcmV0ZXIuaXNSdW5uaW5nXG4gICAgICAgICAgICBAcmVzdGFydCgpXG5cbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBjb21tb24tZXZlbnQgaW50ZXJwcmV0ZXIuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyNcbiAgICB1cGRhdGU6IC0+XG4gICAgICAgIGlmIG5vdCBAaW5pdGlhbGl6ZWRcbiAgICAgICAgICAgIEBzZXR1cCgpXG5cbiAgICAgICAgaWYgQG9iamVjdC5pbnRlcnByZXRlcj8gYW5kIEByZWFkeVRvU3RhcnRcbiAgICAgICAgICAgIEByZWFkeVRvU3RhcnQgPSBub1xuICAgICAgICAgICAgQHNldHVwUGFyYW1ldGVycyhAc3RhcnRQYXJhbWV0ZXJzKVxuICAgICAgICAgICAgQG9iamVjdC5pbnRlcnByZXRlci5zdGFydCgpXG5cbiAgICAgICAgQHJlc3RhcnRJZk5lY2Vzc2FyeSgpXG5cbiAgICAjIyMqXG4gICAgKiBOb3QgaW1wbGVtZW50ZWQgeWV0LlxuICAgICpcbiAgICAqIEBtZXRob2QgZXJhc2VcbiAgICAjIyNcbiAgICBlcmFzZTogLT5cblxuZ3MuQ29tcG9uZW50X0NvbW1vbkV2ZW50QmVoYXZpb3IgPSBDb21wb25lbnRfQ29tbW9uRXZlbnRCZWhhdmlvciJdfQ==
//# sourceURL=Component_CommonEventBehavior_168.js