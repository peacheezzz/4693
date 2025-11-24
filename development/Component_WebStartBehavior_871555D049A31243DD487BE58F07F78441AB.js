var Component_WebStartBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_WebStartBehavior = (function(superClass) {
  extend(Component_WebStartBehavior, superClass);


  /**
  * The web-start scene is used if the game has been loaded via mobile webbrowser. That web-start
  * scene lets the player tap on the screen to start the actual game which is necessary to make
  * audio-playback working because of browser-security.
  *
  * @module gs
  * @class Component_WebStartBehavior 
  * @extends gs.Component_LayoutSceneBehavior
  * @memberof gs
   */

  function Component_WebStartBehavior() {
    Component_WebStartBehavior.__super__.constructor.apply(this, arguments);
  }


  /**
  * Initializes the web-start scene. It just creates a full-screen
  * DIV layer with a touch event-handler to play a sound if tapped and then switch
  * to the language-menu / intro-scene to start the actual game.
  *
  * @method initialize
   */

  Component_WebStartBehavior.prototype.initialize = function() {
    Component_WebStartBehavior.__super__.initialize.apply(this, arguments);
    window.music = new Audio();
    window.music.src = gs.Application.getPlatformSpecificAudioFilePath("Audio/Sounds/choice_confirm_01");
    this.sound = ResourceManager.getAudioBuffer("Audio/Sounds/choice_confirm_01");
    this.button = jQuery("<div></div>");
    this.button.css("position", "absolute");
    this.button.css("left", "0px");
    this.button.css("top", "0px");
    this.button.width(Graphics.width);
    this.button.height(Graphics.height);
    this.button.css("background-color", "transparent");
    this.button.css("z-order", 999999);
    this.button.click((function(_this) {
      return function(e) {
        _this.sound.play();
        window.music.play();
        _this.button.remove();
        _this.button = null;
        return setTimeout(function() {
          return SceneManager.switchTo(new gs.Object_Layout("languageMenuLayout"));
        }, 450);
      };
    })(this));
    this.button[0].addEventListener("touchstart", (function(_this) {
      return function(e) {
        _this.sound.play();
        window.music.play();
        _this.button.remove();
        _this.button = null;
        SceneManager.switchTo(new gs.Object_Layout("languageMenuLayout"));
        return setTimeout(function() {
          window.music.pause();
          window.music = null;
          return SceneManager.switchTo(new gs.Object_Layout("languageMenuLayout"));
        }, 450);
      };
    })(this));
    return jQuery(document.body).append(this.button);
  };


  /**
  * Prepares all visual game objects for the scene.
  *
  * @method prepareVisual
   */

  Component_WebStartBehavior.prototype.prepareVisual = function() {
    return Component_WebStartBehavior.__super__.prepareVisual.apply(this, arguments);
  };


  /**
  * Prepares all data for the scene and loads the necessary graphic and audio resources.
  *
  * @method prepareData
   */

  Component_WebStartBehavior.prototype.prepareData = function() {
    return Component_WebStartBehavior.__super__.prepareData.apply(this, arguments);
  };


  /**
  * Update the scene's content. Here you can implement any kind of additional logic
  * you want.
  *
  * @method updateContent
   */

  Component_WebStartBehavior.prototype.updateContent = function() {
    return Component_WebStartBehavior.__super__.updateContent.apply(this, arguments);
  };

  return Component_WebStartBehavior;

})(gs.Component_LayoutSceneBehavior);

gs.Component_WebStartBehavior = Component_WebStartBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsMEJBQUE7RUFBQTs7O0FBQU07Ozs7QUFDRjs7Ozs7Ozs7Ozs7RUFVYSxvQ0FBQTtJQUNULDZEQUFBLFNBQUE7RUFEUzs7O0FBR2I7Ozs7Ozs7O3VDQU9BLFVBQUEsR0FBWSxTQUFBO0lBQ1IsNERBQUEsU0FBQTtJQUNBLE1BQU0sQ0FBQyxLQUFQLEdBQW1CLElBQUEsS0FBQSxDQUFBO0lBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBYixHQUFtQixFQUFFLENBQUMsV0FBVyxDQUFDLGdDQUFmLENBQWdELGdDQUFoRDtJQUNuQixJQUFDLENBQUEsS0FBRCxHQUFTLGVBQWUsQ0FBQyxjQUFoQixDQUErQixnQ0FBL0I7SUFDVCxJQUFDLENBQUEsTUFBRCxHQUFVLE1BQUEsQ0FBTyxhQUFQO0lBQ1YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksVUFBWixFQUF3QixVQUF4QjtJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQVosRUFBb0IsS0FBcEI7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxLQUFaLEVBQW1CLEtBQW5CO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsUUFBUSxDQUFDLEtBQXZCO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsUUFBUSxDQUFDLE1BQXhCO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksa0JBQVosRUFBZ0MsYUFBaEM7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCLE1BQXZCO0lBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7UUFDVixLQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtRQUNBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBYixDQUFBO1FBQ0EsS0FBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQUE7UUFDQSxLQUFDLENBQUEsTUFBRCxHQUFVO2VBQ1YsVUFBQSxDQUFXLFNBQUE7aUJBQ1AsWUFBWSxDQUFDLFFBQWIsQ0FBMEIsSUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixvQkFBakIsQ0FBMUI7UUFETyxDQUFYLEVBR0EsR0FIQTtNQUxVO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkO0lBVUEsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxnQkFBWCxDQUE0QixZQUE1QixFQUEwQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtRQUN0QyxLQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtRQUNBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBYixDQUFBO1FBRUEsS0FBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQUE7UUFDQSxLQUFDLENBQUEsTUFBRCxHQUFVO1FBQ1YsWUFBWSxDQUFDLFFBQWIsQ0FBMEIsSUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixvQkFBakIsQ0FBMUI7ZUFDQSxVQUFBLENBQVcsU0FBQTtVQUNQLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixDQUFBO1VBQ0EsTUFBTSxDQUFDLEtBQVAsR0FBZTtpQkFDZixZQUFZLENBQUMsUUFBYixDQUEwQixJQUFBLEVBQUUsQ0FBQyxhQUFILENBQWlCLG9CQUFqQixDQUExQjtRQUhPLENBQVgsRUFLQSxHQUxBO01BUHNDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQztXQWVBLE1BQUEsQ0FBTyxRQUFRLENBQUMsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUE2QixJQUFDLENBQUEsTUFBOUI7RUF0Q1E7OztBQXdDWjs7Ozs7O3VDQUtBLGFBQUEsR0FBZSxTQUFBO1dBQ1gsK0RBQUEsU0FBQTtFQURXOzs7QUFHZjs7Ozs7O3VDQUtBLFdBQUEsR0FBYSxTQUFBO1dBQ1QsNkRBQUEsU0FBQTtFQURTOzs7QUFHYjs7Ozs7Ozt1Q0FNQSxhQUFBLEdBQWUsU0FBQTtXQUNYLCtEQUFBLFNBQUE7RUFEVzs7OztHQW5Gc0IsRUFBRSxDQUFDOztBQXNGNUMsRUFBRSxDQUFDLDBCQUFILEdBQWdDIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBDb21wb25lbnRfV2ViU3RhcnRCZWhhdmlvclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tcG9uZW50X1dlYlN0YXJ0QmVoYXZpb3IgZXh0ZW5kcyBncy5Db21wb25lbnRfTGF5b3V0U2NlbmVCZWhhdmlvclxuICAgICMjIypcbiAgICAqIFRoZSB3ZWItc3RhcnQgc2NlbmUgaXMgdXNlZCBpZiB0aGUgZ2FtZSBoYXMgYmVlbiBsb2FkZWQgdmlhIG1vYmlsZSB3ZWJicm93c2VyLiBUaGF0IHdlYi1zdGFydFxuICAgICogc2NlbmUgbGV0cyB0aGUgcGxheWVyIHRhcCBvbiB0aGUgc2NyZWVuIHRvIHN0YXJ0IHRoZSBhY3R1YWwgZ2FtZSB3aGljaCBpcyBuZWNlc3NhcnkgdG8gbWFrZVxuICAgICogYXVkaW8tcGxheWJhY2sgd29ya2luZyBiZWNhdXNlIG9mIGJyb3dzZXItc2VjdXJpdHkuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9XZWJTdGFydEJlaGF2aW9yIFxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50X0xheW91dFNjZW5lQmVoYXZpb3JcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlclxuICAgIFxuICAgICMjIypcbiAgICAqIEluaXRpYWxpemVzIHRoZSB3ZWItc3RhcnQgc2NlbmUuIEl0IGp1c3QgY3JlYXRlcyBhIGZ1bGwtc2NyZWVuXG4gICAgKiBESVYgbGF5ZXIgd2l0aCBhIHRvdWNoIGV2ZW50LWhhbmRsZXIgdG8gcGxheSBhIHNvdW5kIGlmIHRhcHBlZCBhbmQgdGhlbiBzd2l0Y2hcbiAgICAqIHRvIHRoZSBsYW5ndWFnZS1tZW51IC8gaW50cm8tc2NlbmUgdG8gc3RhcnQgdGhlIGFjdHVhbCBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgaW5pdGlhbGl6ZVxuICAgICMjIyBcbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICB3aW5kb3cubXVzaWMgPSBuZXcgQXVkaW8oKVxuICAgICAgICB3aW5kb3cubXVzaWMuc3JjID0gZ3MuQXBwbGljYXRpb24uZ2V0UGxhdGZvcm1TcGVjaWZpY0F1ZGlvRmlsZVBhdGgoXCJBdWRpby9Tb3VuZHMvY2hvaWNlX2NvbmZpcm1fMDFcIilcbiAgICAgICAgQHNvdW5kID0gUmVzb3VyY2VNYW5hZ2VyLmdldEF1ZGlvQnVmZmVyKFwiQXVkaW8vU291bmRzL2Nob2ljZV9jb25maXJtXzAxXCIpXG4gICAgICAgIEBidXR0b24gPSBqUXVlcnkoXCI8ZGl2PjwvZGl2PlwiKVxuICAgICAgICBAYnV0dG9uLmNzcyhcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIilcbiAgICAgICAgQGJ1dHRvbi5jc3MoXCJsZWZ0XCIsIFwiMHB4XCIpXG4gICAgICAgIEBidXR0b24uY3NzKFwidG9wXCIsIFwiMHB4XCIpXG4gICAgICAgIEBidXR0b24ud2lkdGgoR3JhcGhpY3Mud2lkdGgpXG4gICAgICAgIEBidXR0b24uaGVpZ2h0KEdyYXBoaWNzLmhlaWdodClcbiAgICAgICAgQGJ1dHRvbi5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIFwidHJhbnNwYXJlbnRcIilcbiAgICAgICAgQGJ1dHRvbi5jc3MoXCJ6LW9yZGVyXCIsIDk5OTk5OSlcbiAgICAgICAgQGJ1dHRvbi5jbGljayAoZSkgPT5cbiAgICAgICAgICAgIEBzb3VuZC5wbGF5KCkgICAgXG4gICAgICAgICAgICB3aW5kb3cubXVzaWMucGxheSgpXG4gICAgICAgICAgICBAYnV0dG9uLnJlbW92ZSgpXG4gICAgICAgICAgICBAYnV0dG9uID0gbnVsbFxuICAgICAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXcgZ3MuT2JqZWN0X0xheW91dChcImxhbmd1YWdlTWVudUxheW91dFwiKSlcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgIDQ1MFxuICAgICAgICAgICAgXG4gICAgICAgIEBidXR0b25bMF0uYWRkRXZlbnRMaXN0ZW5lciBcInRvdWNoc3RhcnRcIiwgKGUpID0+XG4gICAgICAgICAgICBAc291bmQucGxheSgpICAgIFxuICAgICAgICAgICAgd2luZG93Lm11c2ljLnBsYXkoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAYnV0dG9uLnJlbW92ZSgpXG4gICAgICAgICAgICBAYnV0dG9uID0gbnVsbFxuICAgICAgICAgICAgU2NlbmVNYW5hZ2VyLnN3aXRjaFRvKG5ldyBncy5PYmplY3RfTGF5b3V0KFwibGFuZ3VhZ2VNZW51TGF5b3V0XCIpKVxuICAgICAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgICAgIHdpbmRvdy5tdXNpYy5wYXVzZSgpXG4gICAgICAgICAgICAgICAgd2luZG93Lm11c2ljID0gbnVsbFxuICAgICAgICAgICAgICAgIFNjZW5lTWFuYWdlci5zd2l0Y2hUbyhuZXcgZ3MuT2JqZWN0X0xheW91dChcImxhbmd1YWdlTWVudUxheW91dFwiKSlcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgIDQ1MFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBqUXVlcnkoZG9jdW1lbnQuYm9keSkuYXBwZW5kKEBidXR0b24pXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFByZXBhcmVzIGFsbCB2aXN1YWwgZ2FtZSBvYmplY3RzIGZvciB0aGUgc2NlbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBwcmVwYXJlVmlzdWFsXG4gICAgIyMjIFxuICAgIHByZXBhcmVWaXN1YWw6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgICBcbiAgICAjIyMqXG4gICAgKiBQcmVwYXJlcyBhbGwgZGF0YSBmb3IgdGhlIHNjZW5lIGFuZCBsb2FkcyB0aGUgbmVjZXNzYXJ5IGdyYXBoaWMgYW5kIGF1ZGlvIHJlc291cmNlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHByZXBhcmVEYXRhXG4gICAgIyMjICAgXG4gICAgcHJlcGFyZURhdGE6IC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZSB0aGUgc2NlbmUncyBjb250ZW50LiBIZXJlIHlvdSBjYW4gaW1wbGVtZW50IGFueSBraW5kIG9mIGFkZGl0aW9uYWwgbG9naWNcbiAgICAqIHlvdSB3YW50LlxuICAgICpcbiAgICAqIEBtZXRob2QgdXBkYXRlQ29udGVudFxuICAgICMjIyBcbiAgICB1cGRhdGVDb250ZW50OiAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBcbmdzLkNvbXBvbmVudF9XZWJTdGFydEJlaGF2aW9yID0gQ29tcG9uZW50X1dlYlN0YXJ0QmVoYXZpb3IiXX0=
//# sourceURL=Component_WebStartBehavior_58.js