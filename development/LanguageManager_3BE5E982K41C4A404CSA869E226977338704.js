var LanguageManager;

LanguageManager = (function() {

  /**
  * Manages the different languages of the game.  
  *
  * @module gs
  * @class LanguageManager
  * @memberof gs
  * @constructor
   */
  function LanguageManager() {

    /**
    * The default language profile.
    * @property defaultProfile
    * @type gs.LanguageProfile
     */
    this.defaultProfile = null;

    /**
    * The current language profile.
    * @property profile
    * @type gs.LanguageProfile
     */
    this.profile = null;

    /**
    * The current strings bundle.
    * @property bundle
    * @type gs.LanguageStringsBundle
     */
    this.bundle = null;

    /**
    * The default strings bundle.
    * @property defaultBundle
    * @type gs.LanguageStringsBundle
     */
    this.defaultBundle = null;
  }


  /**
  * Initializes the language system by loading the necessary language profiles
  * and strings bundles.
  *
  * @method initialize
   */

  LanguageManager.prototype.initialize = function() {
    var document, documents, i, len, ref;
    this.languages = [];
    DataManager.getDocumentByType("custom_strings_bundle");
    documents = DataManager.getDocumentsByType("language_profile");
    for (i = 0, len = documents.length; i < len; i++) {
      document = documents[i];
      this.languages.push({
        name: document.items.name,
        code: document.items.code,
        uid: document.uid,
        icon: document.items.icon,
        bundleUid: document.items.bundleUid,
        wordWrap: (ref = document.items.wordWrap) != null ? ref : "spaceBased"
      });
      if (document.uid === "07DDA0716161F104") {
        this.language = this.languages[this.languages.length - 1];
        this.defaultLanguage = this.language;
      }
    }
    this.selectLanguage(this.language);
    if (this.language.uid !== this.defaultLanguage.uid) {
      return this.defaultProfile = DataManager.getDocument(this.defaultLanguage.uid);
    } else {
      return this.defaultProfile = this.profile;
    }
  };


  /**
  * Loads the necessary strings bundles for the current language. 
  *
  * @method loadBundles
   */

  LanguageManager.prototype.loadBundles = function() {
    var customStrings;
    customStrings = DataManager.getDocumentByType("custom_strings_bundle");
    if (this.language.uid !== this.defaultLanguage.uid) {
      this.bundle = DataManager.getDocument(this.language.bundleUid);
    }
    this.defaultBundle = {
      items: {
        localizableStrings: {}
      }
    };
    Object.mixin(this.defaultBundle.items.localizableStrings, customStrings.items.localizableStrings);
    return this.language.uid !== this.defaultLanguage.uid;
  };


  /**
  * Sets the specified language as current language.
  *
  * @method selectLanguage
  * @param {Object} language - The language to set.
   */

  LanguageManager.prototype.selectLanguage = function(language) {
    this.language = language;
    return this.profile = DataManager.getDocument(this.language.uid);
  };


  /**
  * Gets the string for the specified id. If the string doesn't exist for current
  * language, its taken from the default language.
  *
  * @method string
  * @param {String} id - The ID of the string to get.
  * @return {String} The string for the specified ID. If the string could not be found the result
  * is an empty string.
   */

  LanguageManager.prototype.string = function(id) {
    var result;
    result = null;
    if ((this.bundle != null) && (this.bundle.items != null)) {
      result = this.bundle.items.localizableStrings[id];
      if ((result != null ? result.t : void 0) != null) {
        result = result.t;
      }
    }
    if ((result == null) || result.length === 0) {
      result = this.stringFromDefault(id);
    }
    return result;
  };


  /**
  * Gets the string for the specified id in default language.
  *
  * @method stringFromDefault
  * @param {String} id - The ID of the string to get.
  * @return {String} The string for the specified ID. If the string could not be found the result
  * is an empty string.
   */

  LanguageManager.prototype.stringFromDefault = function(id) {
    var ref, result;
    result = null;
    if ((this.defaultBundle != null) && (this.defaultBundle.items != null)) {
      result = (ref = this.defaultBundle.items.localizableStrings[id]) != null ? ref.t : void 0;
    }
    return result;
  };

  return LanguageManager;

})();

window.LanguageManager = new LanguageManager();

gs.LanguageManager = LanguageManager;

window.lcsi = function(id) {
  if (id != null) {
    return window.LanguageManager.string(id) || "";
  } else {
    return "";
  }
};

window.lcs = function(value) {
  var ref;
  if ((value != null) && ((value.lcId != null) || (value.defaultText != null))) {
    return window.LanguageManager.string(value.lcId) || (value != null ? (ref = value.defaultText) != null ? ref.t : void 0 : void 0) || (value != null ? value.defaultText : void 0);
  } else {
    return value;
  }
};

window.lcsm = function(value) {
  return lcs(value);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7O0VBUWEseUJBQUE7O0FBQ1Q7Ozs7O0lBS0EsSUFBQyxDQUFBLGNBQUQsR0FBa0I7O0FBRWxCOzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtFQTNCUjs7O0FBNkJiOzs7Ozs7OzRCQU1BLFVBQUEsR0FBWSxTQUFBO0FBQ1IsUUFBQTtJQUFBLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDYixXQUFXLENBQUMsaUJBQVosQ0FBOEIsdUJBQTlCO0lBQ0EsU0FBQSxHQUFZLFdBQVcsQ0FBQyxrQkFBWixDQUErQixrQkFBL0I7QUFFWixTQUFBLDJDQUFBOztNQUNJLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQjtRQUFFLElBQUEsRUFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQXZCO1FBQTZCLElBQUEsRUFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQWxEO1FBQXdELEdBQUEsRUFBSyxRQUFRLENBQUMsR0FBdEU7UUFBMkUsSUFBQSxFQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBaEc7UUFBc0csU0FBQSxFQUFXLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBaEk7UUFBMkksUUFBQSxrREFBb0MsWUFBL0s7T0FBaEI7TUFDQSxJQUFHLFFBQVEsQ0FBQyxHQUFULEtBQWdCLGtCQUFuQjtRQUNJLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLFNBQVUsQ0FBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsR0FBa0IsQ0FBbEI7UUFDdkIsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLFNBRnhCOztBQUZKO0lBTUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFB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ZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogTGFuZ3VhZ2VNYW5hZ2VyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBMYW5ndWFnZU1hbmFnZXJcbiAgICAjIyMqXG4gICAgKiBNYW5hZ2VzIHRoZSBkaWZmZXJlbnQgbGFuZ3VhZ2VzIG9mIHRoZSBnYW1lLiAgXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIExhbmd1YWdlTWFuYWdlclxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBkZWZhdWx0IGxhbmd1YWdlIHByb2ZpbGUuXG4gICAgICAgICogQHByb3BlcnR5IGRlZmF1bHRQcm9maWxlXG4gICAgICAgICogQHR5cGUgZ3MuTGFuZ3VhZ2VQcm9maWxlXG4gICAgICAgICMjIyBcbiAgICAgICAgQGRlZmF1bHRQcm9maWxlID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBjdXJyZW50IGxhbmd1YWdlIHByb2ZpbGUuXG4gICAgICAgICogQHByb3BlcnR5IHByb2ZpbGVcbiAgICAgICAgKiBAdHlwZSBncy5MYW5ndWFnZVByb2ZpbGVcbiAgICAgICAgIyMjIFxuICAgICAgICBAcHJvZmlsZSA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCBzdHJpbmdzIGJ1bmRsZS5cbiAgICAgICAgKiBAcHJvcGVydHkgYnVuZGxlXG4gICAgICAgICogQHR5cGUgZ3MuTGFuZ3VhZ2VTdHJpbmdzQnVuZGxlXG4gICAgICAgICMjIyBcbiAgICAgICAgQGJ1bmRsZSA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZGVmYXVsdCBzdHJpbmdzIGJ1bmRsZS5cbiAgICAgICAgKiBAcHJvcGVydHkgZGVmYXVsdEJ1bmRsZVxuICAgICAgICAqIEB0eXBlIGdzLkxhbmd1YWdlU3RyaW5nc0J1bmRsZVxuICAgICAgICAjIyMgXG4gICAgICAgIEBkZWZhdWx0QnVuZGxlID0gbnVsbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgbGFuZ3VhZ2Ugc3lzdGVtIGJ5IGxvYWRpbmcgdGhlIG5lY2Vzc2FyeSBsYW5ndWFnZSBwcm9maWxlc1xuICAgICogYW5kIHN0cmluZ3MgYnVuZGxlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAjIyNcbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAbGFuZ3VhZ2VzID0gW11cbiAgICAgICAgRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRCeVR5cGUoXCJjdXN0b21fc3RyaW5nc19idW5kbGVcIilcbiAgICAgICAgZG9jdW1lbnRzID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRzQnlUeXBlKFwibGFuZ3VhZ2VfcHJvZmlsZVwiKVxuICAgICAgICBcbiAgICAgICAgZm9yIGRvY3VtZW50IGluIGRvY3VtZW50c1xuICAgICAgICAgICAgQGxhbmd1YWdlcy5wdXNoKHsgbmFtZTogZG9jdW1lbnQuaXRlbXMubmFtZSwgY29kZTogZG9jdW1lbnQuaXRlbXMuY29kZSwgdWlkOiBkb2N1bWVudC51aWQsIGljb246IGRvY3VtZW50Lml0ZW1zLmljb24sIGJ1bmRsZVVpZDogZG9jdW1lbnQuaXRlbXMuYnVuZGxlVWlkLCB3b3JkV3JhcDogZG9jdW1lbnQuaXRlbXMud29yZFdyYXAgPyBcInNwYWNlQmFzZWRcIiB9KVxuICAgICAgICAgICAgaWYgZG9jdW1lbnQudWlkID09IFwiMDdEREEwNzE2MTYxRjEwNFwiICMgRGVmYXVsdCBQcm9maWxlXG4gICAgICAgICAgICAgICAgQGxhbmd1YWdlID0gQGxhbmd1YWdlc1tAbGFuZ3VhZ2VzLmxlbmd0aC0xXVxuICAgICAgICAgICAgICAgIEBkZWZhdWx0TGFuZ3VhZ2UgPSBAbGFuZ3VhZ2VcbiAgICAgICAgICAgXG4gICAgICAgIEBzZWxlY3RMYW5ndWFnZShAbGFuZ3VhZ2UpICAgICBcbiAgICAgICAgaWYgQGxhbmd1YWdlLnVpZCAhPSBAZGVmYXVsdExhbmd1YWdlLnVpZFxuICAgICAgICAgICAgQGRlZmF1bHRQcm9maWxlID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoQGRlZmF1bHRMYW5ndWFnZS51aWQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkZWZhdWx0UHJvZmlsZSA9IEBwcm9maWxlXG4gICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgdGhlIG5lY2Vzc2FyeSBzdHJpbmdzIGJ1bmRsZXMgZm9yIHRoZSBjdXJyZW50IGxhbmd1YWdlLiBcbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRCdW5kbGVzXG4gICAgIyMjICAgICAgICBcbiAgICBsb2FkQnVuZGxlczogLT5cbiAgICAgICAgY3VzdG9tU3RyaW5ncyA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50QnlUeXBlKFwiY3VzdG9tX3N0cmluZ3NfYnVuZGxlXCIpXG4gICAgICAgIGlmIEBsYW5ndWFnZS51aWQgIT0gQGRlZmF1bHRMYW5ndWFnZS51aWRcbiAgICAgICAgICAgIEBidW5kbGUgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudChAbGFuZ3VhZ2UuYnVuZGxlVWlkKVxuXG4gICAgICAgICAgICAgIFxuICAgICAgICBAZGVmYXVsdEJ1bmRsZSA9IHsgaXRlbXM6IHsgbG9jYWxpemFibGVTdHJpbmdzOiB7fSB9IH1cbiAgICAgICAgXG4gICAgICAgIE9iamVjdC5taXhpbihAZGVmYXVsdEJ1bmRsZS5pdGVtcy5sb2NhbGl6YWJsZVN0cmluZ3MsIGN1c3RvbVN0cmluZ3MuaXRlbXMubG9jYWxpemFibGVTdHJpbmdzKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEBsYW5ndWFnZS51aWQgIT0gQGRlZmF1bHRMYW5ndWFnZS51aWRcbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSBzcGVjaWZpZWQgbGFuZ3VhZ2UgYXMgY3VycmVudCBsYW5ndWFnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNlbGVjdExhbmd1YWdlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gbGFuZ3VhZ2UgLSBUaGUgbGFuZ3VhZ2UgdG8gc2V0LlxuICAgICMjIyAgICAgIFxuICAgIHNlbGVjdExhbmd1YWdlOiAobGFuZ3VhZ2UpIC0+XG4gICAgICAgIEBsYW5ndWFnZSA9IGxhbmd1YWdlXG4gICAgICAgIEBwcm9maWxlID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnQoQGxhbmd1YWdlLnVpZClcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgc3RyaW5nIGZvciB0aGUgc3BlY2lmaWVkIGlkLiBJZiB0aGUgc3RyaW5nIGRvZXNuJ3QgZXhpc3QgZm9yIGN1cnJlbnRcbiAgICAqIGxhbmd1YWdlLCBpdHMgdGFrZW4gZnJvbSB0aGUgZGVmYXVsdCBsYW5ndWFnZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0cmluZ1xuICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIElEIG9mIHRoZSBzdHJpbmcgdG8gZ2V0LlxuICAgICogQHJldHVybiB7U3RyaW5nfSBUaGUgc3RyaW5nIGZvciB0aGUgc3BlY2lmaWVkIElELiBJZiB0aGUgc3RyaW5nIGNvdWxkIG5vdCBiZSBmb3VuZCB0aGUgcmVzdWx0XG4gICAgKiBpcyBhbiBlbXB0eSBzdHJpbmcuXG4gICAgIyMjICAgICBcbiAgICBzdHJpbmc6IChpZCkgLT4gXG4gICAgICAgIHJlc3VsdCA9IG51bGxcblxuICAgICAgICBpZiBAYnVuZGxlPyBhbmQgQGJ1bmRsZS5pdGVtcz9cbiAgICAgICAgICAgIHJlc3VsdCA9IEBidW5kbGUuaXRlbXMubG9jYWxpemFibGVTdHJpbmdzW2lkXVxuICAgICAgICAgICAgaWYgcmVzdWx0Py50P1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC50XG5cbiAgICAgICAgaWYgbm90IHJlc3VsdD8gb3IgcmVzdWx0Lmxlbmd0aCA9PSAwXG4gICAgICAgICAgICByZXN1bHQgPSBAc3RyaW5nRnJvbURlZmF1bHQoaWQpXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHN0cmluZyBmb3IgdGhlIHNwZWNpZmllZCBpZCBpbiBkZWZhdWx0IGxhbmd1YWdlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RyaW5nRnJvbURlZmF1bHRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBJRCBvZiB0aGUgc3RyaW5nIHRvIGdldC5cbiAgICAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHN0cmluZyBmb3IgdGhlIHNwZWNpZmllZCBJRC4gSWYgdGhlIHN0cmluZyBjb3VsZCBub3QgYmUgZm91bmQgdGhlIHJlc3VsdFxuICAgICogaXMgYW4gZW1wdHkgc3RyaW5nLlxuICAgICMjIyAgICAgIFxuICAgIHN0cmluZ0Zyb21EZWZhdWx0OiAoaWQpIC0+XG4gICAgICAgIHJlc3VsdCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIEBkZWZhdWx0QnVuZGxlPyBhbmQgQGRlZmF1bHRCdW5kbGUuaXRlbXM/XG4gICAgICAgICAgICByZXN1bHQgPSBAZGVmYXVsdEJ1bmRsZS5pdGVtcy5sb2NhbGl6YWJsZVN0cmluZ3NbaWRdPy50XG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuIFxud2luZG93Lkxhbmd1YWdlTWFuYWdlciA9IG5ldyBMYW5ndWFnZU1hbmFnZXIoKVxuZ3MuTGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyXG5cbndpbmRvdy5sY3NpID0gKGlkKSAtPiBpZiBpZD8gdGhlbiB3aW5kb3cuTGFuZ3VhZ2VNYW5hZ2VyLnN0cmluZyhpZCkgfHwgXCJcIiBlbHNlIFwiXCJcbndpbmRvdy5sY3MgPSAodmFsdWUpIC0+IHJldHVybiBpZiAodmFsdWU/IGFuZCAodmFsdWUubGNJZD8gb3IgdmFsdWUuZGVmYXVsdFRleHQ/KSkgdGhlbiB3aW5kb3cuTGFuZ3VhZ2VNYW5hZ2VyLnN0cmluZyh2YWx1ZS5sY0lkKSB8fCB2YWx1ZT8uZGVmYXVsdFRleHQ/LnQgfHwgdmFsdWU/LmRlZmF1bHRUZXh0IGVsc2UgdmFsdWVcbndpbmRvdy5sY3NtID0gKHZhbHVlKSAtPiByZXR1cm4gbGNzKHZhbHVlKSAjcmV0dXJuIGlmIHZhbHVlLmxjSWQ/IHRoZW4gd2luZG93Lkxhbmd1YWdlTWFuYWdlci5zdHJpbmdGcm9tQnVuZGxlKHZhbHVlLmxjSWQsIHdpbmRvdy5MYW5ndWFnZU1hbmFnZXIubWFwQnVuZGxlKSB8fCB2YWx1ZS5kZWZhdWx0VGV4dCBlbHNlIHZhbHVlXG4iXX0=
//# sourceURL=LanguageManager_55.js