var SceneManager,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SceneManager = (function(superClass) {
  extend(SceneManager, superClass);


  /**
  * Manages the scenes of the game.
  *
  * @module gs
  * @class SceneManager
  * @memberof gs
  * @constructor
   */

  function SceneManager() {
    SceneManager.__super__.constructor.apply(this, arguments);

    /**
    * The current scene.
    * @property scene
    * @type gs.Object_Base
     */
    this.scene = null;

    /**
    * An array of previous scenes. Used to jump back to last scene from a menu for example.
    * @property previousScenes
    * @type gs.Object_Base
     */
    this.previousScenes = [];

    /**
    * The next scene. If set, this scene will become the current scene after next update.
    * @property nextScene
    * @type gs.Object_Base
     */
    this.nextScene = null;

    /**
    * The transition-data like the graphic, vague, etc. used for a transition from one scene to another.
    * @property transitionData
    * @type Object
     */
    this.transitionData = {
      graphic: null,
      duration: 20,
      vague: 30
    };
    this.input = true;

    /**
    * Called if a scene-change has been done.
    * @property callback
    * @type Function
     */
    this.callback = null;
    this.paused = false;
  }

  SceneManager.prototype.initialize = function() {};


  /**
  * Switches from the current scene to the specified one.
  *
  * @method switchTo
  * @param {gs.Object_Base} scene - The new scene.
  * @param {boolean} savePrevious - Indicates if the current scene should be pushed to previous-scene stack instead
  * of getting disposed. It is possible to switch back to that scene then using gs.SceneManager.returnToPrevious method.
  * @param {Function} callback - Called after the scene has been changed.
   */

  SceneManager.prototype.switchTo = function(scene, savePrevious, callback) {
    this.callback = callback;
    if (savePrevious) {
      this.previousScenes.push(this.scene);
    } else if (this.previousScenes.length === 0) {
      gs.Audio.reset();
    }
    if (this.scene != null) {
      this.removeObject(this.scene);
    }
    this.nextScene = scene;
    return Graphics.freeze();
  };


  /**
  * Clears the stack of previous-scenes and disposes all previous-scenes. After that it is not
  * possible to go back to a previous scene using gs.SceneManager.returnToPrevious().
  *
  * @method clear
   */

  SceneManager.prototype.clear = function() {
    var i, len, ref, scene;
    ref = this.previousScenes;
    for (i = 0, len = ref.length; i < len; i++) {
      scene = ref[i];
      scene.dispose();
    }
    return this.previousScenes = [];
  };


  /**
  * Returns to the previous scene if that scene was saved before.
  *
  * @method returnToPrevious
  * @param {Function} callback - Called after the scene has been changed.
   */

  SceneManager.prototype.returnToPrevious = function(callback) {
    var scene;
    this.callback = callback;
    if (this.previousScenes.length > 0) {
      scene = this.previousScenes.pop();
      if (this.scene != null) {
        this.removeObject(this.scene);
      }
      if (scene != null) {
        this.nextScene = scene;
        return Graphics.freeze();
      }
    }
  };


  /**
  * Updates the current scene and the scene-handling. Needs to be called once
  * per frame.
  *
  * @method update
   */

  SceneManager.prototype.update = function() {
    var ref;
    if (this.nextScene !== this.scene) {
      Input.clear();
      if (this.scene != null) {
        if (this.previousScenes.indexOf(this.scene) === -1) {
          this.scene.dispose();
        } else {
          this.scene.behavior.show(false);
        }
      }
      this.scene = this.nextScene;
      if (typeof this.callback === "function") {
        this.callback();
      }
      if (this.scene) {
        this.addObject(this.scene);
        this.scene.loading = true;
        this.scene.loadingData = true;
        this.scene.loadingResources = true;
        if ((this.scene != null) && !this.scene.initialized) {
          this.scene.behavior.initialize();
          this.scene.behavior.prepareLoadingScreen();
          this.isFadeOut = true;
        } else if ((ref = this.scene) != null ? ref.initialized : void 0) {
          this.scene.behavior.show(true);
          this.scene.update();
          Graphics.update();
        }
        Graphics.update();
        this.scene.behavior.transition();
      } else {
        Graphics.freeze();
        Graphics.update();
        Graphics.transition(30);
        this.isFadeOut = true;
      }
    }
    if (this.isFadeOut && Graphics.frozen) {
      Graphics.update();
      return Input.update();
    } else {
      if (this.isFadeOut) {
        AudioManager.stopAllSounds();
        this.isFadeOut = false;
        if (this.scene) {
          Graphics.freeze();
        } else {
          gs.Application.exit();
        }
      }
      DataManager.update();
      ResourceManager.update();
      if (RecordManager.initialized) {
        AudioManager.update();
      }
      if (Graphics.frozen) {
        Input.update();
      }
      return SceneManager.__super__.update.call(this);
    }
  };

  return SceneManager;

})(gs.ObjectManager);

window.SceneManager = new SceneManager();

gs.SceneManager = window.SceneManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsWUFBQTtFQUFBOzs7QUFBTTs7OztBQUNGOzs7Ozs7Ozs7RUFRYSxzQkFBQTtJQUNULCtDQUFBLFNBQUE7O0FBRUE7Ozs7O0lBS0EsSUFBQyxDQUFBLEtBQUQsR0FBUzs7QUFFVDs7Ozs7SUFLQSxJQUFDLENBQUEsY0FBRCxHQUFrQjs7QUFFbEI7Ozs7O0lBS0EsSUFBQyxDQUFBLFNBQUQsR0FBYTs7QUFFYjs7Ozs7SUFLQSxJQUFDLENBQUEsY0FBRCxHQUFrQjtNQUFFLE9BQUEsRUFBUyxJQUFYO01BQWlCLFFBQUEsRUFBVSxFQUEzQjtNQUErQixLQUFBLEVBQU8sRUFBdEM7O0lBRWxCLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBQ1Q7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUVaLElBQUMsQ0FBQSxNQUFELEdBQVU7RUF2Q0Q7O3lCQTBDYixVQUFBLEdBQVksU0FBQSxHQUFBOzs7QUFFWjs7Ozs7Ozs7Ozt5QkFTQSxRQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsWUFBUixFQUFzQixRQUF0QjtJQUNOLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFDWixJQUFHLFlBQUg7TUFDSSxJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQUMsQ0FBQSxLQUF0QixFQURKO0tBQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsS0FBMEIsQ0FBN0I7TUFDRCxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQVQsQ0FBQSxFQURDOztJQUdMLElBQUcsa0JBQUg7TUFDSSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxLQUFmLEVBREo7O0lBR0EsSUFBQyxDQUFBLFNBQUQsR0FBYTtXQUViLFFBQVEsQ0FBQyxNQUFULENBQUE7RUFaTTs7O0FBY1Y7Ozs7Ozs7eUJBTUEsS0FBQSxHQUFPLFNBQUE7QUFDSCxRQUFBO0FBQUE7QUFB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ZUFBZSxDQUFDLE1BQWhCLENBQUE7TUFFQSxJQUFHLGFBQWEsQ0FBQyxXQUFqQjtRQUNJLFlBQVksQ0FBQyxNQUFiLENBQUEsRUFESjs7TUFHQSxJQUFHLFFBQVEsQ0FBQyxNQUFaO1FBQ0ksS0FBSyxDQUFDLE1BQU4sQ0FBQSxFQURKOzthQUdBLHVDQUFBLEVBckJKOztFQXJDSTs7OztHQWhIZSxFQUFFLENBQUM7O0FBOEs5QixNQUFNLENBQUMsWUFBUCxHQUEwQixJQUFBLFlBQUEsQ0FBQTs7QUFDMUIsRUFBRSxDQUFDLFlBQUgsR0FBa0IsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBTY2VuZU1hbmFnZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFNjZW5lTWFuYWdlciBleHRlbmRzIGdzLk9iamVjdE1hbmFnZXJcbiAgICAjIyMqXG4gICAgKiBNYW5hZ2VzIHRoZSBzY2VuZXMgb2YgdGhlIGdhbWUuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIFNjZW5lTWFuYWdlclxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCBzY2VuZS5cbiAgICAgICAgKiBAcHJvcGVydHkgc2NlbmVcbiAgICAgICAgKiBAdHlwZSBncy5PYmplY3RfQmFzZVxuICAgICAgICAjIyMgXG4gICAgICAgIEBzY2VuZSA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBBbiBhcnJheSBvZiBwcmV2aW91cyBzY2VuZXMuIFVzZWQgdG8ganVtcCBiYWNrIHRvIGxhc3Qgc2NlbmUgZnJvbSBhIG1lbnUgZm9yIGV4YW1wbGUuXG4gICAgICAgICogQHByb3BlcnR5IHByZXZpb3VzU2NlbmVzXG4gICAgICAgICogQHR5cGUgZ3MuT2JqZWN0X0Jhc2VcbiAgICAgICAgIyMjIFxuICAgICAgICBAcHJldmlvdXNTY2VuZXMgPSBbXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBuZXh0IHNjZW5lLiBJZiBzZXQsIHRoaXMgc2NlbmUgd2lsbCBiZWNvbWUgdGhlIGN1cnJlbnQgc2NlbmUgYWZ0ZXIgbmV4dCB1cGRhdGUuXG4gICAgICAgICogQHByb3BlcnR5IG5leHRTY2VuZVxuICAgICAgICAqIEB0eXBlIGdzLk9iamVjdF9CYXNlXG4gICAgICAgICMjIyBcbiAgICAgICAgQG5leHRTY2VuZSA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgdHJhbnNpdGlvbi1kYXRhIGxpa2UgdGhlIGdyYXBoaWMsIHZhZ3VlLCBldGMuIHVzZWQgZm9yIGEgdHJhbnNpdGlvbiBmcm9tIG9uZSBzY2VuZSB0byBhbm90aGVyLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0cmFuc2l0aW9uRGF0YVxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyMgXG4gICAgICAgIEB0cmFuc2l0aW9uRGF0YSA9IHsgZ3JhcGhpYzogbnVsbCwgZHVyYXRpb246IDIwLCB2YWd1ZTogMzAgfVxuICAgICAgICBcbiAgICAgICAgQGlucHV0ID0geWVzXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDYWxsZWQgaWYgYSBzY2VuZS1jaGFuZ2UgaGFzIGJlZW4gZG9uZS5cbiAgICAgICAgKiBAcHJvcGVydHkgY2FsbGJhY2tcbiAgICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICAjIyMgXG4gICAgICAgIEBjYWxsYmFjayA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIEBwYXVzZWQgPSBub1xuICAgICAgICBcbiAgICBcbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogU3dpdGNoZXMgZnJvbSB0aGUgY3VycmVudCBzY2VuZSB0byB0aGUgc3BlY2lmaWVkIG9uZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN3aXRjaFRvXG4gICAgKiBAcGFyYW0ge2dzLk9iamVjdF9CYXNlfSBzY2VuZSAtIFRoZSBuZXcgc2NlbmUuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNhdmVQcmV2aW91cyAtIEluZGljYXRlcyBpZiB0aGUgY3VycmVudCBzY2VuZSBzaG91bGQgYmUgcHVzaGVkIHRvIHByZXZpb3VzLXNjZW5lIHN0YWNrIGluc3RlYWRcbiAgICAqIG9mIGdldHRpbmcgZGlzcG9zZWQuIEl0IGlzIHBvc3NpYmxlIHRvIHN3aXRjaCBiYWNrIHRvIHRoYXQgc2NlbmUgdGhlbiB1c2luZyBncy5TY2VuZU1hbmFnZXIucmV0dXJuVG9QcmV2aW91cyBtZXRob2QuXG4gICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxlZCBhZnRlciB0aGUgc2NlbmUgaGFzIGJlZW4gY2hhbmdlZC5cbiAgICAjIyNcbiAgICBzd2l0Y2hUbzogKHNjZW5lLCBzYXZlUHJldmlvdXMsIGNhbGxiYWNrKSAtPlxuICAgICAgICBAY2FsbGJhY2sgPSBjYWxsYmFja1xuICAgICAgICBpZiBzYXZlUHJldmlvdXNcbiAgICAgICAgICAgIEBwcmV2aW91c1NjZW5lcy5wdXNoKEBzY2VuZSlcbiAgICAgICAgZWxzZSBpZiBAcHJldmlvdXNTY2VuZXMubGVuZ3RoID09IDBcbiAgICAgICAgICAgIGdzLkF1ZGlvLnJlc2V0KClcbiAgICBcbiAgICAgICAgaWYgQHNjZW5lP1xuICAgICAgICAgICAgQHJlbW92ZU9iamVjdChAc2NlbmUpXG4gICAgICAgICAgICBcbiAgICAgICAgQG5leHRTY2VuZSA9IHNjZW5lXG4gICAgICAgIFxuICAgICAgICBHcmFwaGljcy5mcmVlemUoKVxuICAgIFxuICAgICMjIypcbiAgICAqIENsZWFycyB0aGUgc3RhY2sgb2YgcHJldmlvdXMtc2NlbmVzIGFuZCBkaXNwb3NlcyBhbGwgcHJldmlvdXMtc2NlbmVzLiBBZnRlciB0aGF0IGl0IGlzIG5vdFxuICAgICogcG9zc2libGUgdG8gZ28gYmFjayB0byBhIHByZXZpb3VzIHNjZW5lIHVzaW5nIGdzLlNjZW5lTWFuYWdlci5yZXR1cm5Ub1ByZXZpb3VzKCkuXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhclxuICAgICMjIyAgICBcbiAgICBjbGVhcjogLT5cbiAgICAgICAgZm9yIHNjZW5lIGluIEBwcmV2aW91c1NjZW5lc1xuICAgICAgICAgIHNjZW5lLmRpc3Bvc2UoKVxuICAgICAgICBAcHJldmlvdXNTY2VuZXMgPSBbXVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBSZXR1cm5zIHRvIHRoZSBwcmV2aW91cyBzY2VuZSBpZiB0aGF0IHNjZW5lIHdhcyBzYXZlZCBiZWZvcmUuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXR1cm5Ub1ByZXZpb3VzXG4gICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxlZCBhZnRlciB0aGUgc2NlbmUgaGFzIGJlZW4gY2hhbmdlZC5cbiAgICAjIyMgICAgXG4gICAgcmV0dXJuVG9QcmV2aW91czogKGNhbGxiYWNrKSAtPlxuICAgICAgICBAY2FsbGJhY2sgPSBjYWxsYmFja1xuICAgICAgICBpZiBAcHJldmlvdXNTY2VuZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgc2NlbmUgPSBAcHJldmlvdXNTY2VuZXMucG9wKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQHNjZW5lP1xuICAgICAgICAgICAgICAgIEByZW1vdmVPYmplY3QoQHNjZW5lKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc2NlbmU/XG4gICAgICAgICAgICAgICAgQG5leHRTY2VuZSA9IHNjZW5lXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgR3JhcGhpY3MuZnJlZXplKClcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgY3VycmVudCBzY2VuZSBhbmQgdGhlIHNjZW5lLWhhbmRsaW5nLiBOZWVkcyB0byBiZSBjYWxsZWQgb25jZVxuICAgICogcGVyIGZyYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgIyMjICAgXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBpZiBAbmV4dFNjZW5lICE9IEBzY2VuZVxuICAgICAgICAgICAgSW5wdXQuY2xlYXIoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAc2NlbmU/XG4gICAgICAgICAgICAgICAgaWYgQHByZXZpb3VzU2NlbmVzLmluZGV4T2YoQHNjZW5lKSA9PSAtMVxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuZGlzcG9zZSgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuYmVoYXZpb3Iuc2hvdyhubylcbiAgICAgICAgICAgICAgICAgICAgI0BzY2VuZS51cGRhdGUoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAc2NlbmUgPSBAbmV4dFNjZW5lXG4gICAgICAgICAgICBAY2FsbGJhY2s/KClcbiAgIFxuICAgICAgICAgICAgaWYgQHNjZW5lXG4gICAgICAgICAgICAgICAgQGFkZE9iamVjdChAc2NlbmUpXG4gICAgICAgICAgICAgICAgQHNjZW5lLmxvYWRpbmcgPSB0cnVlXG4gICAgICAgICAgICAgICAgQHNjZW5lLmxvYWRpbmdEYXRhID0gdHJ1ZVxuICAgICAgICAgICAgICAgIEBzY2VuZS5sb2FkaW5nUmVzb3VyY2VzID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBAc2NlbmU/IGFuZCBub3QgQHNjZW5lLmluaXRpYWxpemVkXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5iZWhhdmlvci5pbml0aWFsaXplKClcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLmJlaGF2aW9yLnByZXBhcmVMb2FkaW5nU2NyZWVuKClcbiAgICAgICAgICAgICAgICAgICAgQGlzRmFkZU91dCA9IHllc1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgQHNjZW5lPy5pbml0aWFsaXplZFxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuYmVoYXZpb3Iuc2hvdyh5ZXMpXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS51cGRhdGUoKVxuICAgICAgICAgICAgICAgICAgICBHcmFwaGljcy51cGRhdGUoKVxuICAgICAgICAgICAgICAgIEdyYXBoaWNzLnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgQHNjZW5lLmJlaGF2aW9yLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEdyYXBoaWNzLmZyZWV6ZSgpXG4gICAgICAgICAgICAgICAgR3JhcGhpY3MudXBkYXRlKClcbiAgICAgICAgICAgICAgICBHcmFwaGljcy50cmFuc2l0aW9uKDMwKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGlzRmFkZU91dCA9IHllc1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIEBpc0ZhZGVPdXQgYW5kIEdyYXBoaWNzLmZyb3plblxuICAgICAgICAgICAgR3JhcGhpY3MudXBkYXRlKClcbiAgICAgICAgICAgIElucHV0LnVwZGF0ZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIEBpc0ZhZGVPdXRcbiAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIuc3RvcEFsbFNvdW5kcygpXG4gICAgICAgICAgICAgICAgQGlzRmFkZU91dCA9IG5vXG4gICAgICAgICAgICAgICAgaWYgQHNjZW5lXG4gICAgICAgICAgICAgICAgICAgIEdyYXBoaWNzLmZyZWV6ZSgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBncy5BcHBsaWNhdGlvbi5leGl0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBEYXRhTWFuYWdlci51cGRhdGUoKVxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnVwZGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIFJlY29yZE1hbmFnZXIuaW5pdGlhbGl6ZWRcbiAgICAgICAgICAgICAgICBBdWRpb01hbmFnZXIudXBkYXRlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEdyYXBoaWNzLmZyb3plblxuICAgICAgICAgICAgICAgIElucHV0LnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzdXBlcigpXG4gICAgICAgICBcbiAgICAgICAgICAgIFxuXG53aW5kb3cuU2NlbmVNYW5hZ2VyID0gbmV3IFNjZW5lTWFuYWdlcigpXG5ncy5TY2VuZU1hbmFnZXIgPSB3aW5kb3cuU2NlbmVNYW5hZ2VyIl19
//# sourceURL=SceneManager_34.js