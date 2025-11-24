var Component_SceneBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_SceneBehavior = (function(superClass) {
  extend(Component_SceneBehavior, superClass);


  /**
  * The base class of all scene-behavior components. A scene-behavior component
  * define the logic of a single game scene.
  *
  * @module gs
  * @class Component_SceneBehavior
  * @extends gs.Component_Container
  * @memberof gs
   */

  function Component_SceneBehavior() {
    Component_SceneBehavior.__super__.constructor.call(this);
    this.loadingScreenVisible = false;
  }


  /**
  * Initializes the scene.
  *
  * @method initialize
  * @abstract
   */

  Component_SceneBehavior.prototype.initialize = function() {};


  /**
  * Disposes the scene.
  *
  * @method dispose
   */

  Component_SceneBehavior.prototype.dispose = function() {
    var ref;
    if (!GameManager.inLivePreview) {
      ResourceManager.dispose();
    }
    return (ref = this.object.events) != null ? ref.emit("dispose", this.object) : void 0;
  };


  /**
  * Called if the preparation and transition
  * is done and the is ready to start.
  *
  * @method start
   */

  Component_SceneBehavior.prototype.start = function() {};


  /**
  * Prepares all visual game object for the scene.
  *
  * @method prepareVisual
  * @abstract
   */

  Component_SceneBehavior.prototype.prepareVisual = function() {};


  /**
  * Prepares all data for the scene and loads the necessary graphic and audio resources.
  *
  * @method prepareData
  * @abstract
   */

  Component_SceneBehavior.prototype.prepareData = function() {};


  /**
  * Prepares for a screen-transition.
  *
  * @method prepareTransition
  * @param {Object} transitionData - Object containing additional data for the transition
  * like graphic, duration and vague.
   */

  Component_SceneBehavior.prototype.prepareTransition = function(transitionData) {
    var ref;
    if ((transitionData != null ? (ref = transitionData.graphic) != null ? ref.name.length : void 0 : void 0) > 0) {
      return ResourceManager.getBitmap(ResourceManager.getPath(transitionData.graphic));
    }
  };


  /**
  * Executes a screen-transition.
  *
  * @method transition
  * @param {Object} transitionData - Object containing additional data for the transition
  * like graphic, duration and vague.
   */

  Component_SceneBehavior.prototype.transition = function(transitionData) {
    var ref;
    if ($PARAMS.preview) {
      return Graphics.transition(0);
    } else {
      transitionData = transitionData || SceneManager.transitionData;
      if ((transitionData != null ? (ref = transitionData.graphic) != null ? ref.name.length : void 0 : void 0) > 0) {
        return Graphics.transition(transitionData.duration, ResourceManager.getBitmap("Graphics/Masks/" + transitionData.graphic.name), transitionData.vague || 30);
      } else {
        return Graphics.transition(transitionData.duration);
      }
    }
  };


  /**
  * Update the scene's content.
  *
  * @method updateContent
  * @abstract
   */

  Component_SceneBehavior.prototype.updateContent = function() {};


  /**
  * Sets up the loading screen.
  *
  * @method prepareLoadingScreen
   */

  Component_SceneBehavior.prototype.prepareLoadingScreen = function() {
    var bitmap;
    this.loadingBackgroundSprite = new gs.Sprite();
    if (gs.Platform.isWeb && !GameManager.inLivePreview) {
      bitmap = new gs.Bitmap(300, 100);
      bitmap.font.name = "Times New Roman";
      bitmap.drawText(0, 0, 300, 100, "NOW LOADING", 1, 1);
      this.loadingBackgroundSprite.x = (Graphics.width - bitmap.width) / 2;
      this.loadingBackgroundSprite.y = (Graphics.height - bitmap.height) / 2;
      this.loadingBackgroundSprite.bitmap = bitmap;
      return this.loadingBackgroundSprite.srcRect = new gs.Rect(0, 0, bitmap.width, bitmap.height);
    }
  };


  /**
  * Disposes the loading screen.
  *
  * @method clearLoadingScreen
   */

  Component_SceneBehavior.prototype.clearLoadingScreen = function() {
    if (this.loadingBackgroundSprite) {
      if (gs.Platform.isWeb && !GameManager.inLivePreview) {
        this.loadingBackgroundSprite.bitmap.dispose();
      }
      this.loadingBackgroundSprite.dispose();
      return this.loadingBackgroundSprite = null;
    }
  };


  /**
  * Called once per frame while a scene is loading. Can be used to display
  * loading-message/animation.
  *
  * @method loading
   */

  Component_SceneBehavior.prototype.loading = function() {
    if (this.loadingBackgroundSprite2 == null) {
      this.loadingBackgroundSprite2 = {};

      /*
      bitmap = new gs.Bitmap(300, 100)
      bitmap.drawText(0, 0, 300, 100, "NOW LOADING", 1, 1)
      @loadingBackgroundSprite = new gs.Sprite()
      @loadingBackgroundSprite.x = (Graphics.width - bitmap.width) / 2
      @loadingBackgroundSprite.y = (Graphics.height - bitmap.height) / 2
      @loadingBackgroundSprite.bitmap = bitmap
      @loadingBackgroundSprite.srcRect = new gs.Rect(0, 0, bitmap.width, bitmap.height)
       */
      if (Graphics.frozen) {
        return this.transition({
          duration: 0
        });
      }
    }
  };


  /**
  * Update the scene.
  *
  * @method update
   */

  Component_SceneBehavior.prototype.update = function() {
    Component_SceneBehavior.__super__.update.call(this);
    if (DataManager.documentsLoaded) {
      if (this.object.loadingData && !this.object.initialized) {
        this.prepareData();
      }
      this.object.loadingData = !DataManager.documentsLoaded;
    }
    if (!this.object.loadingData && ResourceManager.resourcesLoaded) {
      if (this.object.loadingResources && !this.object.initialized) {
        if (!this.loadingScreenVisible) {
          this.prepareVisual();
        }
        this.object.initialized = true;
      }
      this.object.loadingResources = false;
    }
    if (ResourceManager.resourcesLoaded && DataManager.documentsLoaded) {
      this.object.loading = false;
      if (Graphics.frozen && this.object.preparing) {
        return Graphics.update();
      } else {
        if (this.loadingScreenVisible) {
          if (this.object.loaded) {
            this.loadingScreenVisible = false;
            this.object.loaded = true;
            return this.updateContent();
          } else {
            if (!Graphics.frozen) {
              Graphics.freeze();
            }
            this.clearLoadingScreen();
            this.object.loaded = true;
            this.object.setup();
            this.prepareVisual();
            this.loadingScreenVisible = false;
            Graphics.update();
            return Input.update();
          }
        } else {
          this.clearLoadingScreen();
          if (this.object.preparing) {
            this.object.preparing = false;
            this.start();
          }
          Graphics.update();
          if (!Graphics.frozen) {
            this.updateContent();
          }
          return Input.update();
        }
      }
    } else {
      this.loadingScreenVisible = true;
      Graphics.update();
      Input.update();
      return this.loading();
    }
  };

  return Component_SceneBehavior;

})(gs.Component_Container);

gs.Component_SceneBehavior = Component_SceneBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsdUJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7OztFQVNhLGlDQUFBO0lBQ1QsdURBQUE7SUFFQSxJQUFDLENBQUEsb0JBQUQsR0FBd0I7RUFIZjs7O0FBS2I7Ozs7Ozs7b0NBTUEsVUFBQSxHQUFZLFNBQUEsR0FBQTs7O0FBRVo7Ozs7OztvQ0FLQSxPQUFBLEdBQVMsU0FBQTtBQUNMLFFBQUE7SUFBQSxJQUFHLENBQUksV0FBVyxDQUFDLGFBQW5CO01BQ0ksZUFBZSxDQUFDLE9BQWhCLENBQUEsRUFESjs7bURBRWMsQ0FBRSxJQUFoQixDQUFxQixTQUFyQixFQUFnQyxJQUFDLENBQUEsTUFBakM7RUFISzs7O0FBTVQ7Ozs7Ozs7b0NBTUEsS0FBQSxHQUFPLFNBQUEsR0FBQTs7O0FBRVA7Ozs7Ozs7b0NBTUEsYUFBQSxHQUFlLFNBQUEsR0FBQTs7O0FBRWY7Ozs7Ozs7b0NBTUEsV0FBQSxHQUFhLFNBQUEsR0FBQTs7O0FBRWI7Ozs7Ozs7O29DQU9BLGlCQUFBLEdBQW1CLFNBQUMsY0FBRDtBQUNmLFFBQUE7SUFBQSwwRUFBMEIsQ0FBRSxJQUFJLENBQUMseUJBQTlCLEdBQXVDLENBQTFDO2FBQ0ksZUFBZSxDQUFDLFNBQWhCLENBQTBCLGVBQWUsQ0FBQyxPQUFoQixDQUF3QixjQUFjLENBQUMsT0FBdkMsQ0FBMUIsRUFESjs7RUFEZTs7O0FBSW5COzs7Ozs7OztvQ0FPQSxVQUFBLEdBQVksU0FBQyxjQUFEO0FBQ1IsUUFBQTtJQUFBLElBQUcsT0FBTyxDQUFDLE9BQVg7YUFDSSxRQUFRLENBQUMsVUFBVCxDQUFvQixDQUFwQixFQURKO0tBQUEsTUFBQTtNQUdJLGNBQUEsR0FBaUIsY0FBQSxJQUFrQixZQUFZLENBQUM7TUFDaEQsMEVBQTBCLENBQUUsSUFBSSxDQUFDLHlCQUE5QixHQUF1QyxDQUExQztlQUNJLFFBQVEsQ0FBQyxVQUFU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VCxDQUFBO1VBQ0EsSUFBb0IsQ0FBQyxRQUFRLENBQUMsTUFBOUI7WUFBQSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBQUE7O2lCQUNBLEtBQUssQ0FBQyxNQUFOLENBQUEsRUFyQko7U0FISjtPQUhKO0tBQUEsTUFBQTtNQStCSSxJQUFDLENBQUEsb0JBQUQsR0FBd0I7TUFDeEIsUUFBUSxDQUFDLE1BQVQsQ0FBQTtNQUNBLEtBQUssQ0FBQyxNQUFOLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBLEVBbENKOztFQWRJOzs7O0dBckowQixFQUFFLENBQUM7O0FBME16QyxFQUFFLENBQUMsdUJBQUgsR0FBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9TY2VuZUJlaGF2aW9yXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21wb25lbnRfU2NlbmVCZWhhdmlvciBleHRlbmRzIGdzLkNvbXBvbmVudF9Db250YWluZXJcbiAgICAjIyMqXG4gICAgKiBUaGUgYmFzZSBjbGFzcyBvZiBhbGwgc2NlbmUtYmVoYXZpb3IgY29tcG9uZW50cy4gQSBzY2VuZS1iZWhhdmlvciBjb21wb25lbnRcbiAgICAqIGRlZmluZSB0aGUgbG9naWMgb2YgYSBzaW5nbGUgZ2FtZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X1NjZW5lQmVoYXZpb3JcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudF9Db250YWluZXJcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICAgICAgQGxvYWRpbmdTY3JlZW5WaXNpYmxlID0gbm9cblxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAqIEBhYnN0cmFjdFxuICAgICMjI1xuICAgIGluaXRpYWxpemU6IC0+XG5cbiAgICAjIyMqXG4gICAgKiBEaXNwb3NlcyB0aGUgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBkaXNwb3NlXG4gICAgIyMjXG4gICAgZGlzcG9zZTogLT5cbiAgICAgICAgaWYgbm90IEdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXdcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5kaXNwb3NlKClcbiAgICAgICAgQG9iamVjdC5ldmVudHM/LmVtaXQoXCJkaXNwb3NlXCIsIEBvYmplY3QpXG5cblxuICAgICMjIypcbiAgICAqIENhbGxlZCBpZiB0aGUgcHJlcGFyYXRpb24gYW5kIHRyYW5zaXRpb25cbiAgICAqIGlzIGRvbmUgYW5kIHRoZSBpcyByZWFkeSB0byBzdGFydC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0YXJ0XG4gICAgIyMjXG4gICAgc3RhcnQ6IC0+XG5cbiAgICAjIyMqXG4gICAgKiBQcmVwYXJlcyBhbGwgdmlzdWFsIGdhbWUgb2JqZWN0IGZvciB0aGUgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBwcmVwYXJlVmlzdWFsXG4gICAgKiBAYWJzdHJhY3RcbiAgICAjIyNcbiAgICBwcmVwYXJlVmlzdWFsOiAtPlxuXG4gICAgIyMjKlxuICAgICogUHJlcGFyZXMgYWxsIGRhdGEgZm9yIHRoZSBzY2VuZSBhbmQgbG9hZHMgdGhlIG5lY2Vzc2FyeSBncmFwaGljIGFuZCBhdWRpbyByZXNvdXJjZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBwcmVwYXJlRGF0YVxuICAgICogQGFic3RyYWN0XG4gICAgIyMjXG4gICAgcHJlcGFyZURhdGE6IC0+XG5cbiAgICAjIyMqXG4gICAgKiBQcmVwYXJlcyBmb3IgYSBzY3JlZW4tdHJhbnNpdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXBhcmVUcmFuc2l0aW9uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdHJhbnNpdGlvbkRhdGEgLSBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIGRhdGEgZm9yIHRoZSB0cmFuc2l0aW9uXG4gICAgKiBsaWtlIGdyYXBoaWMsIGR1cmF0aW9uIGFuZCB2YWd1ZS5cbiAgICAjIyNcbiAgICBwcmVwYXJlVHJhbnNpdGlvbjogKHRyYW5zaXRpb25EYXRhKSAtPlxuICAgICAgICBpZiB0cmFuc2l0aW9uRGF0YT8uZ3JhcGhpYz8ubmFtZS5sZW5ndGggPiAwXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKHRyYW5zaXRpb25EYXRhLmdyYXBoaWMpKVxuXG4gICAgIyMjKlxuICAgICogRXhlY3V0ZXMgYSBzY3JlZW4tdHJhbnNpdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRyYW5zaXRpb25cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB0cmFuc2l0aW9uRGF0YSAtIE9iamVjdCBjb250YWluaW5nIGFkZGl0aW9uYWwgZGF0YSBmb3IgdGhlIHRyYW5zaXRpb25cbiAgICAqIGxpa2UgZ3JhcGhpYywgZHVyYXRpb24gYW5kIHZhZ3VlLlxuICAgICMjI1xuICAgIHRyYW5zaXRpb246ICh0cmFuc2l0aW9uRGF0YSkgLT5cbiAgICAgICAgaWYgJFBBUkFNUy5wcmV2aWV3XG4gICAgICAgICAgICBHcmFwaGljcy50cmFuc2l0aW9uKDApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyYW5zaXRpb25EYXRhID0gdHJhbnNpdGlvbkRhdGEgfHwgU2NlbmVNYW5hZ2VyLnRyYW5zaXRpb25EYXRhXG4gICAgICAgICAgICBpZiB0cmFuc2l0aW9uRGF0YT8uZ3JhcGhpYz8ubmFtZS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgR3JhcGhpY3MudHJhbnNpdGlvbih0cmFuc2l0aW9uRGF0YS5kdXJhdGlvbiwgUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChcIkdyYXBoaWNzL01hc2tzLyN7dHJhbnNpdGlvbkRhdGEuZ3JhcGhpYy5uYW1lfVwiKSwgdHJhbnNpdGlvbkRhdGEudmFndWUgfHwgMzApXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgR3JhcGhpY3MudHJhbnNpdGlvbih0cmFuc2l0aW9uRGF0YS5kdXJhdGlvbilcblxuICAgICMjIypcbiAgICAqIFVwZGF0ZSB0aGUgc2NlbmUncyBjb250ZW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29udGVudFxuICAgICogQGFic3RyYWN0XG4gICAgIyMjXG4gICAgdXBkYXRlQ29udGVudDogLT5cblxuICAgICMjIypcbiAgICAqIFNldHMgdXAgdGhlIGxvYWRpbmcgc2NyZWVuLlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZUxvYWRpbmdTY3JlZW5cbiAgICAjIyNcbiAgICBwcmVwYXJlTG9hZGluZ1NjcmVlbjogLT5cbiAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlID0gbmV3IGdzLlNwcml0ZSgpXG5cbiAgICAgICAgaWYgZ3MuUGxhdGZvcm0uaXNXZWIgYW5kICFHYW1lTWFuYWdlci5pbkxpdmVQcmV2aWV3XG4gICAgICAgICAgICBiaXRtYXAgPSBuZXcgZ3MuQml0bWFwKDMwMCwgMTAwKVxuICAgICAgICAgICAgYml0bWFwLmZvbnQubmFtZSA9IFwiVGltZXMgTmV3IFJvbWFuXCJcbiAgICAgICAgICAgIGJpdG1hcC5kcmF3VGV4dCgwLCAwLCAzMDAsIDEwMCwgXCJOT1cgTE9BRElOR1wiLCAxLCAxKVxuICAgICAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlLnggPSAoR3JhcGhpY3Mud2lkdGggLSBiaXRtYXAud2lkdGgpIC8gMlxuICAgICAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlLnkgPSAoR3JhcGhpY3MuaGVpZ2h0IC0gYml0bWFwLmhlaWdodCkgLyAyXG4gICAgICAgICAgICBAbG9hZGluZ0JhY2tncm91bmRTcHJpdGUuYml0bWFwID0gYml0bWFwXG4gICAgICAgICAgICBAbG9hZGluZ0JhY2tncm91bmRTcHJpdGUuc3JjUmVjdCA9IG5ldyBncy5SZWN0KDAsIDAsIGJpdG1hcC53aWR0aCwgYml0bWFwLmhlaWdodClcblxuICAgICMjIypcbiAgICAqIERpc3Bvc2VzIHRoZSBsb2FkaW5nIHNjcmVlbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyTG9hZGluZ1NjcmVlblxuICAgICMjI1xuICAgIGNsZWFyTG9hZGluZ1NjcmVlbjogLT5cbiAgICAgICAgaWYgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlXG4gICAgICAgICAgICBpZiBncy5QbGF0Zm9ybS5pc1dlYiBhbmQgIUdhbWVNYW5hZ2VyLmluTGl2ZVByZXZpZXdcbiAgICAgICAgICAgICAgICBAbG9hZGluZ0JhY2tncm91bmRTcHJpdGUuYml0bWFwLmRpc3Bvc2UoKVxuICAgICAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlLmRpc3Bvc2UoKVxuICAgICAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlID0gbnVsbFxuXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIG9uY2UgcGVyIGZyYW1lIHdoaWxlIGEgc2NlbmUgaXMgbG9hZGluZy4gQ2FuIGJlIHVzZWQgdG8gZGlzcGxheVxuICAgICogbG9hZGluZy1tZXNzYWdlL2FuaW1hdGlvbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRpbmdcbiAgICAjIyNcbiAgICBsb2FkaW5nOiAtPlxuICAgICAgICBpZiBub3QgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlMj9cbiAgICAgICAgICAgIEBsb2FkaW5nQmFja2dyb3VuZFNwcml0ZTIgPSB7fVxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBiaXRtYXAgPSBuZXcgZ3MuQml0bWFwKDMwMCwgMTAwKVxuICAgICAgICAgICAgYml0bWFwLmRyYXdUZXh0KDAsIDAsIDMwMCwgMTAwLCBcIk5PVyBMT0FESU5HXCIsIDEsIDEpXG4gICAgICAgICAgICBAbG9hZGluZ0JhY2tncm91bmRTcHJpdGUgPSBuZXcgZ3MuU3ByaXRlKClcbiAgICAgICAgICAgIEBsb2FkaW5nQmFja2dyb3VuZFNwcml0ZS54ID0gKEdyYXBoaWNzLndpZHRoIC0gYml0bWFwLndpZHRoKSAvIDJcbiAgICAgICAgICAgIEBsb2FkaW5nQmFja2dyb3VuZFNwcml0ZS55ID0gKEdyYXBoaWNzLmhlaWdodCAtIGJpdG1hcC5oZWlnaHQpIC8gMlxuICAgICAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlLmJpdG1hcCA9IGJpdG1hcFxuICAgICAgICAgICAgQGxvYWRpbmdCYWNrZ3JvdW5kU3ByaXRlLnNyY1JlY3QgPSBuZXcgZ3MuUmVjdCgwLCAwLCBiaXRtYXAud2lkdGgsIGJpdG1hcC5oZWlnaHQpXG4gICAgICAgICAgICAjIyNcblxuICAgICAgICAgICAgaWYgR3JhcGhpY3MuZnJvemVuIHRoZW4gQHRyYW5zaXRpb24oeyBkdXJhdGlvbjogMCB9KVxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlIHRoZSBzY2VuZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICMjI1xuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIGlmIERhdGFNYW5hZ2VyLmRvY3VtZW50c0xvYWRlZFxuICAgICAgICAgICAgaWYgQG9iamVjdC5sb2FkaW5nRGF0YSBhbmQgbm90IEBvYmplY3QuaW5pdGlhbGl6ZWQgdGhlbiBAcHJlcGFyZURhdGEoKVxuICAgICAgICAgICAgQG9iamVjdC5sb2FkaW5nRGF0YSA9ICFEYXRhTWFuYWdlci5kb2N1bWVudHNMb2FkZWRcblxuICAgICAgICBpZiBub3QgQG9iamVjdC5sb2FkaW5nRGF0YSBhbmQgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc0xvYWRlZFxuICAgICAgICAgICAgaWYgQG9iamVjdC5sb2FkaW5nUmVzb3VyY2VzIGFuZCBub3QgQG9iamVjdC5pbml0aWFsaXplZFxuICAgICAgICAgICAgICAgIGlmIG5vdCBAbG9hZGluZ1NjcmVlblZpc2libGVcbiAgICAgICAgICAgICAgICAgICAgQHByZXBhcmVWaXN1YWwoKVxuICAgICAgICAgICAgICAgIEBvYmplY3QuaW5pdGlhbGl6ZWQgPSB5ZXNcbiAgICAgICAgICAgIEBvYmplY3QubG9hZGluZ1Jlc291cmNlcyA9IGZhbHNlXG5cbiAgICAgICAgaWYgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc0xvYWRlZCBhbmQgRGF0YU1hbmFnZXIuZG9jdW1lbnRzTG9hZGVkXG4gICAgICAgICAgICBAb2JqZWN0LmxvYWRpbmcgPSBmYWxzZVxuXG4gICAgICAgICAgICBpZiBHcmFwaGljcy5mcm96ZW4gYW5kIEBvYmplY3QucHJlcGFyaW5nXG4gICAgICAgICAgICAgICAgR3JhcGhpY3MudXBkYXRlKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBAbG9hZGluZ1NjcmVlblZpc2libGVcbiAgICAgICAgICAgICAgICAgICAgaWYgQG9iamVjdC5sb2FkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIEBsb2FkaW5nU2NyZWVuVmlzaWJsZSA9IG5vXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmxvYWRlZCA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUNvbnRlbnQoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgR3JhcGhpY3MuZnJvemVuIHRoZW4gR3JhcGhpY3MuZnJlZXplKClcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjbGVhckxvYWRpbmdTY3JlZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5sb2FkZWQgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3Quc2V0dXAoKVxuICAgICAgICAgICAgICAgICAgICAgICAgQHByZXBhcmVWaXN1YWwoKVxuICAgICAgICAgICAgICAgICAgICAgICAgQGxvYWRpbmdTY3JlZW5WaXNpYmxlID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgIEdyYXBoaWNzLnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBJbnB1dC51cGRhdGUoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGNsZWFyTG9hZGluZ1NjcmVlbigpXG4gICAgICAgICAgICAgICAgICAgIGlmIEBvYmplY3QucHJlcGFyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LnByZXBhcmluZyA9IG5vXG4gICAgICAgICAgICAgICAgICAgICAgICBAc3RhcnQoKVxuICAgICAgICAgICAgICAgICAgICBHcmFwaGljcy51cGRhdGUoKVxuICAgICAgICAgICAgICAgICAgICBAdXBkYXRlQ29udGVudCgpIGlmICFHcmFwaGljcy5mcm96ZW5cbiAgICAgICAgICAgICAgICAgICAgSW5wdXQudXBkYXRlKClcblxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBsb2FkaW5nU2NyZWVuVmlzaWJsZSA9IHllc1xuICAgICAgICAgICAgR3JhcGhpY3MudXBkYXRlKClcbiAgICAgICAgICAgIElucHV0LnVwZGF0ZSgpXG4gICAgICAgICAgICBAbG9hZGluZygpXG5cblxuXG5cbmdzLkNvbXBvbmVudF9TY2VuZUJlaGF2aW9yID0gQ29tcG9uZW50X1NjZW5lQmVoYXZpb3IiXX0=
//# sourceURL=Component_SceneBehavior_13.js