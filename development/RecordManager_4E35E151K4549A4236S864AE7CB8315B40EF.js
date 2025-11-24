var RecordManager;

RecordManager = (function() {

  /**
  * Manages the game's database and gives access to all data-records.
  *
  * @module gs
  * @class RecordManager
  * @memberof gs
  * @constructor
   */
  function RecordManager() {

    /**
    * Stores all data-record documents
    * @property documents
    * @type gs.Document[]
     */
    this.documents = null;

    /**
    * Stores all data-record documents by category > id.
    * @property collectionDocuments
    * @type gs.Document[][]
     */
    this.collectionDocuments = [];

    /**
    * Localizable strings of all data-record documents.
    * @property localizableStrings
    * @type Object
     */
    this.localizableStrings = {};

    /**
    * Indicates if all data-records are already translated.
    * @property translated
    * @type boolean
     */
    this.translated = false;

    /**
    * Indicates if all data-records are loaded and initialized.
    * @property initialized
    * @type boolean
     */
    this.initialized = false;
  }


  /**
  * Loads all data-record documents.
  *
  * @method load
   */

  RecordManager.prototype.load = function() {
    return this.documents = DataManager.getDocumentsByType("data_record");
  };


  /**
  * Initializes RecordManager and all loaded data-record documents for use. Needs to be
  * called before RecordManager can be used.
  *
  * @method initialize
   */

  RecordManager.prototype.initialize = function() {
    var color, document, i, iconSets, j, k, l, len, len1, len2, objectPosition, ref, ref1, ref2, ref3;
    iconSets = [];
    ref = this.documents;
    for (j = 0, len = ref.length; j < len; j++) {
      document = ref[j];
      if (this[document.items.category] == null) {
        this[document.items.category] = [];
        this[document.items.category + "Collection"] = [];
        this[document.items.category + "Array"] = [];
        this.collectionDocuments.push(this[document.items.category + "Collection"]);
      }
      if (document.items.id != null) {
        this[document.items.category][document.items.id] = document.items.data;
        this[document.items.category].push(document.items.data);
        this[document.items.category + "Collection"][document.items.id] = document;
        this[document.items.category + "Collection"].push(document);
        this[document.items.category + "Array"].push(document.items.data);
        if ((ref1 = document.items.data) != null) {
          ref1.index = document.items.id;
        }
      }
      if ((document.items.data != null) && (document.items.data.icon != null)) {
        if (iconSets.indexOf(document.items.data.icon.name) === -1) {
          iconSets.push(document.items.data.icon.name);
        }
      }
      if (document.items.localizableStrings != null) {
        Object.mixin(this.localizableStrings, document.items.localizableStrings);
      }
    }
    this.system = this.system[0];
    this.system.iconSets = iconSets;
    if (this.system.colors) {
      ref2 = this.system.colors;
      for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
        color = ref2[i];
        this.system.colors[i] = new Color(color);
      }
    }
    ref3 = this.system.objectPositions;
    for (l = 0, len2 = ref3.length; l < len2; l++) {
      objectPosition = ref3[l];
      if (!objectPosition) {
        continue;
      }
      objectPosition.func = eval("(function(object, params){" + objectPosition.script + "})");
    }
    return this.initialized = true;
  };


  /**
  * Translates all localizable fields for each data-record.
  *
  * @method translate
   */

  RecordManager.prototype.translate = function() {
    var document, j, len, ref, results;
    if (!this.translated) {
      this.translated = true;
      ref = this.documents;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        document = ref[j];
        if ((document.items.data.name != null) && (document.items.data.name.lcId != null)) {
          document.items.data.name = lcs(document.items.data.name);
        }
        if ((document.items.data.description != null) && (document.items.data.description.lcId != null)) {
          document.items.data.description = lcs(document.items.data.description);
        }
        if ((document.items.data.removeMessage != null) && (document.items.data.removeMessage.lcId != null)) {
          document.items.data.removeMessage = lcs(document.items.data.removeMessage);
        }
        if ((document.items.data.usingMessage != null) && (document.items.data.usingMessage.lcId != null)) {
          results.push(document.items.data.usingMessage = lcs(document.items.data.usingMessage));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

  return RecordManager;

})();

window.RecordManager = new RecordManager();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7O0VBUWEsdUJBQUE7O0FBQ1Q7Ozs7O0lBS0EsSUFBQyxDQUFBLFNBQUQsR0FBYTs7QUFFYjs7Ozs7SUFLQSxJQUFDLENBQUEsbUJBQUQsR0FBdUI7O0FBRXZCOzs7OztJQUtBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQjs7QUFFdEI7Ozs7O0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYzs7QUFFZDs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlO0VBbENOOzs7QUFvQ2I7Ozs7OzswQkFLQSxJQUFBLEdBQU0sU0FBQTtXQUNGLElBQUMsQ0FBQSxTQUFELEdBQWEsV0FBVyxDQUFDLGtCQUFaLENBQStCLGFBQS9CO0VBRFg7OztBQUdOOzs7Ozs7OzBCQU1BLFVBQUEsR0FBWSxTQUFBO0FBQ1IsUUFBQTtJQUFBLFFBQUEsR0FBVztBQUNYO0FBQUEsU0FBQSxxQ0FBQTs7TUFDSSxJQUFPLHFDQUFQO1FBQ0ksSUFBSyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBZixDQUFMLEdBQWdDO1FBQ2hDLElBQUssQ0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQWYsR0FBMEIsWUFBMUIsQ0FBTCxHQUErQztRQUMvQyxJQUFLLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFmLEdBQTBCLE9BQTFCLENBQUwsR0FBMEM7UUFDMUMsSUFBQyxDQUFBLG1CQUFtQixDQUFDLElBQXJCLENBQTBCLElBQUssQ0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQWYsR0FBMEIsWUFBMUIsQ0FBL0IsRUFKSjs7TUFLQSxJQUFHLHlCQUFIO1FBQ0ksSUFBSyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBZixDQUF5QixDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBZixDQUE5QixHQUFtRCxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ2xFLElBQUssQ0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQWYsQ0FBd0IsQ0FBQyxJQUE5QixDQUFtQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQWxEO1FBQ0EsSUFBSyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBZixHQUEwQixZQUExQixDQUF3QyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBZixDQUE3QyxHQUFrRTtRQUNsRSxJQUFLLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFmLEdBQTBCLFlBQTFCLENBQXVDLENBQUMsSUFBN0MsQ0FBa0QsUUFBbEQ7UUFDQSxJQUFLLENBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFmLEdBQTBCLE9BQTFCLENBQWtDLENBQUMsSUFBeEMsQ0FBNkMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUE1RDs7Y0FDbUIsQ0FBRSxLQUFyQixHQUE2QixRQUFRLENBQUMsS0FBSyxDQUFDO1NBTmhEOztNQU9BLElBQUcsNkJBQUEsSUFBeUIsa0NBQTVCO1FBQ0ksSUFBRyxRQUFRLENBQUMsT0FBVCxDQUFpQixRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBMUMsQ0FBQSxLQUFtRCxDQUFDLENBQXZEO1VBQ0ksUUFBUSxDQUFDLElBQVQsQ0FBYyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBdkMsRUFESjtTQURKOztNQUlBLElBQUcseUNBQUg7UUFDSSxNQUFNLENBQUMsS0FBUCxDQUFhLElBQUMsQ0FBQSxrQkFBZCxFQUFrQyxRQUFRLENBQUMsS0FBSyxDQUFDLGtCQUFqRCxFQURKOztBQWpCSjtJQW9CQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQTtJQUNsQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsR0FBbUI7SUFFbkIsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVg7QUFDSTtBQUFBLFdBQUEsZ0RBQUE7O1FBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFmLEdBQXdCLElBQUEsS0FBQSxDQUFNLEtBQU47QUFENUIsT0FESjs7QUFJQTtBQUFBLFNBQUEsd0NBQUE7O01BQ0ksSUFBRyxDQUFDLGNBQUo7QUFBd0IsaUJBQXhCOztNQUNBLGNBQWMsQ0FBQyxJQUFmLEdBQXNCLElBQUEsQ0FBSyw0QkFBQSxHQUErQixjQUFjLENBQUMsTUFBOUMsR0FBdUQsSUFBNUQ7QUFGMUI7V0FJQSxJQUFDLENBQUEsV0FBRCxHQUFlO0VBakNQOzs7QUFtQ1o7Ozs7OzswQkFLQSxTQUFBLEdBQVcsU0FBQTtBQUNQLFFBQUE7SUFBQSxJQUFHLENBQUksSUFBQyxDQUFBLFVBQVI7TUFDSSxJQUFDLENBQUEsVUFBRCxHQUFjO0FBQ2Q7QUFBQTtXQUFBLHFDQUFBOztRQUNJLElBQUcsa0NBQUEsSUFBOEIsdUNBQWpDO1VBQ0ksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBcEIsR0FBMkIsR0FBQSxDQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQXhCLEVBRC9COztRQUVBLElBQUcseUNBQUEsSUFBcUMsOENBQXhDO1VBQ0ksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBcEIsR0FBa0MsR0FBQSxDQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQXhCLEVBRHRDOztRQUVBLElBQUcsMkNBQUEsSUFBdUMsZ0RBQTFDO1VBQ0ksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBcEIsR0FBb0MsR0FBQSxDQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQXhCLEVBRHhDOztRQUVBLElBQUcsMENBQUEsSUFBc0MsK0NBQXpDO3VCQUNJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQXBCLEdBQW1DLEdBQUEsQ0FBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUF4QixHQUR2QztTQUFBLE1BQUE7K0JBQUE7O0FBUEo7cUJBRko7O0VBRE87Ozs7OztBQWNmLE1BQU0sQ0FBQyxhQUFQLEdBQTJCLElBQUEsYUFBQSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBSZWNvcmRNYW5hZ2VyXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBSZWNvcmRNYW5hZ2VyXG4gICAgIyMjKlxuICAgICogTWFuYWdlcyB0aGUgZ2FtZSdzIGRhdGFiYXNlIGFuZCBnaXZlcyBhY2Nlc3MgdG8gYWxsIGRhdGEtcmVjb3Jkcy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgUmVjb3JkTWFuYWdlclxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBhbGwgZGF0YS1yZWNvcmQgZG9jdW1lbnRzXG4gICAgICAgICogQHByb3BlcnR5IGRvY3VtZW50c1xuICAgICAgICAqIEB0eXBlIGdzLkRvY3VtZW50W11cbiAgICAgICAgIyMjIFxuICAgICAgICBAZG9jdW1lbnRzID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBhbGwgZGF0YS1yZWNvcmQgZG9jdW1lbnRzIGJ5IGNhdGVnb3J5ID4gaWQuXG4gICAgICAgICogQHByb3BlcnR5IGNvbGxlY3Rpb25Eb2N1bWVudHNcbiAgICAgICAgKiBAdHlwZSBncy5Eb2N1bWVudFtdW11cbiAgICAgICAgIyMjIFxuICAgICAgICBAY29sbGVjdGlvbkRvY3VtZW50cyA9IFtdXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogTG9jYWxpemFibGUgc3RyaW5ncyBvZiBhbGwgZGF0YS1yZWNvcmQgZG9jdW1lbnRzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsb2NhbGl6YWJsZVN0cmluZ3NcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjIFxuICAgICAgICBAbG9jYWxpemFibGVTdHJpbmdzID0ge31cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgYWxsIGRhdGEtcmVjb3JkcyBhcmUgYWxyZWFkeSB0cmFuc2xhdGVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0cmFuc2xhdGVkXG4gICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAjIyMgXG4gICAgICAgIEB0cmFuc2xhdGVkID0gbm9cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgYWxsIGRhdGEtcmVjb3JkcyBhcmUgbG9hZGVkIGFuZCBpbml0aWFsaXplZC5cbiAgICAgICAgKiBAcHJvcGVydHkgaW5pdGlhbGl6ZWRcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjIyBcbiAgICAgICAgQGluaXRpYWxpemVkID0gbm9cbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogTG9hZHMgYWxsIGRhdGEtcmVjb3JkIGRvY3VtZW50cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxvYWRcbiAgICAjIyMgIFxuICAgIGxvYWQ6IC0+XG4gICAgICAgIEBkb2N1bWVudHMgPSBEYXRhTWFuYWdlci5nZXREb2N1bWVudHNCeVR5cGUoXCJkYXRhX3JlY29yZFwiKVxuXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgUmVjb3JkTWFuYWdlciBhbmQgYWxsIGxvYWRlZCBkYXRhLXJlY29yZCBkb2N1bWVudHMgZm9yIHVzZS4gTmVlZHMgdG8gYmVcbiAgICAqIGNhbGxlZCBiZWZvcmUgUmVjb3JkTWFuYWdlciBjYW4gYmUgdXNlZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluaXRpYWxpemVcbiAgICAjIyMgIFxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIGljb25TZXRzID0gW11cbiAgICAgICAgZm9yIGRvY3VtZW50IGluIEBkb2N1bWVudHNcbiAgICAgICAgICAgIGlmIG5vdCB0aGlzW2RvY3VtZW50Lml0ZW1zLmNhdGVnb3J5XT9cbiAgICAgICAgICAgICAgICB0aGlzW2RvY3VtZW50Lml0ZW1zLmNhdGVnb3J5XSA9IFtdXG4gICAgICAgICAgICAgICAgdGhpc1tkb2N1bWVudC5pdGVtcy5jYXRlZ29yeSArIFwiQ29sbGVjdGlvblwiXSA9IFtdXG4gICAgICAgICAgICAgICAgdGhpc1tkb2N1bWVudC5pdGVtcy5jYXRlZ29yeSArIFwiQXJyYXlcIl0gPSBbXVxuICAgICAgICAgICAgICAgIEBjb2xsZWN0aW9uRG9jdW1lbnRzLnB1c2godGhpc1tkb2N1bWVudC5pdGVtcy5jYXRlZ29yeSArIFwiQ29sbGVjdGlvblwiXSlcbiAgICAgICAgICAgIGlmIGRvY3VtZW50Lml0ZW1zLmlkP1xuICAgICAgICAgICAgICAgIHRoaXNbZG9jdW1lbnQuaXRlbXMuY2F0ZWdvcnldW2RvY3VtZW50Lml0ZW1zLmlkXSA9IGRvY3VtZW50Lml0ZW1zLmRhdGFcbiAgICAgICAgICAgICAgICB0aGlzW2RvY3VtZW50Lml0ZW1zLmNhdGVnb3J5XS5wdXNoKGRvY3VtZW50Lml0ZW1zLmRhdGEpXG4gICAgICAgICAgICAgICAgdGhpc1tkb2N1bWVudC5pdGVtcy5jYXRlZ29yeSArIFwiQ29sbGVjdGlvblwiXVtkb2N1bWVudC5pdGVtcy5pZF0gPSBkb2N1bWVudFxuICAgICAgICAgICAgICAgIHRoaXNbZG9jdW1lbnQuaXRlbXMuY2F0ZWdvcnkgKyBcIkNvbGxlY3Rpb25cIl0ucHVzaChkb2N1bWVudClcbiAgICAgICAgICAgICAgICB0aGlzW2RvY3VtZW50Lml0ZW1zLmNhdGVnb3J5ICsgXCJBcnJheVwiXS5wdXNoKGRvY3VtZW50Lml0ZW1zLmRhdGEpXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaXRlbXMuZGF0YT8uaW5kZXggPSBkb2N1bWVudC5pdGVtcy5pZFxuICAgICAgICAgICAgaWYgZG9jdW1lbnQuaXRlbXMuZGF0YT8gYW5kIGRvY3VtZW50Lml0ZW1zLmRhdGEuaWNvbj9cbiAgICAgICAgICAgICAgICBpZiBpY29uU2V0cy5pbmRleE9mKGRvY3VtZW50Lml0ZW1zLmRhdGEuaWNvbi5uYW1lKSA9PSAtMVxuICAgICAgICAgICAgICAgICAgICBpY29uU2V0cy5wdXNoKGRvY3VtZW50Lml0ZW1zLmRhdGEuaWNvbi5uYW1lKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGRvY3VtZW50Lml0ZW1zLmxvY2FsaXphYmxlU3RyaW5ncz9cbiAgICAgICAgICAgICAgICBPYmplY3QubWl4aW4oQGxvY2FsaXphYmxlU3RyaW5ncywgZG9jdW1lbnQuaXRlbXMubG9jYWxpemFibGVTdHJpbmdzKVxuICAgICAgICAgICAgXG4gICAgICAgIEBzeXN0ZW0gPSBAc3lzdGVtWzBdXG4gICAgICAgIEBzeXN0ZW0uaWNvblNldHMgPSBpY29uU2V0c1xuICAgICAgICBcbiAgICAgICAgaWYgQHN5c3RlbS5jb2xvcnNcbiAgICAgICAgICAgIGZvciBjb2xvciwgaSBpbiBAc3lzdGVtLmNvbG9yc1xuICAgICAgICAgICAgICAgIEBzeXN0ZW0uY29sb3JzW2ldID0gbmV3IENvbG9yKGNvbG9yKVxuICAgICAgICBcbiAgICAgICAgZm9yIG9iamVjdFBvc2l0aW9uIGluIEBzeXN0ZW0ub2JqZWN0UG9zaXRpb25zXG4gICAgICAgICAgICBpZiAhb2JqZWN0UG9zaXRpb24gdGhlbiBjb250aW51ZVxuICAgICAgICAgICAgb2JqZWN0UG9zaXRpb24uZnVuYyA9IGV2YWwoXCIoZnVuY3Rpb24ob2JqZWN0LCBwYXJhbXMpe1wiICsgb2JqZWN0UG9zaXRpb24uc2NyaXB0ICsgXCJ9KVwiKVxuICAgICAgICAgICAgXG4gICAgICAgIEBpbml0aWFsaXplZCA9IHllc1xuICAgIFxuICAgICMjIypcbiAgICAqIFRyYW5zbGF0ZXMgYWxsIGxvY2FsaXphYmxlIGZpZWxkcyBmb3IgZWFjaCBkYXRhLXJlY29yZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRyYW5zbGF0ZVxuICAgICMjIyAgICAgIFxuICAgIHRyYW5zbGF0ZTogLT5cbiAgICAgICAgaWYgbm90IEB0cmFuc2xhdGVkXG4gICAgICAgICAgICBAdHJhbnNsYXRlZCA9IHllc1xuICAgICAgICAgICAgZm9yIGRvY3VtZW50IGluIEBkb2N1bWVudHNcbiAgICAgICAgICAgICAgICBpZiBkb2N1bWVudC5pdGVtcy5kYXRhLm5hbWU/IGFuZCBkb2N1bWVudC5pdGVtcy5kYXRhLm5hbWUubGNJZD9cbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuaXRlbXMuZGF0YS5uYW1lID0gbGNzKGRvY3VtZW50Lml0ZW1zLmRhdGEubmFtZSlcbiAgICAgICAgICAgICAgICBpZiBkb2N1bWVudC5pdGVtcy5kYXRhLmRlc2NyaXB0aW9uPyBhbmQgZG9jdW1lbnQuaXRlbXMuZGF0YS5kZXNjcmlwdGlvbi5sY0lkP1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5pdGVtcy5kYXRhLmRlc2NyaXB0aW9uID0gbGNzKGRvY3VtZW50Lml0ZW1zLmRhdGEuZGVzY3JpcHRpb24pXG4gICAgICAgICAgICAgICAgaWYgZG9jdW1lbnQuaXRlbXMuZGF0YS5yZW1vdmVNZXNzYWdlPyBhbmQgZG9jdW1lbnQuaXRlbXMuZGF0YS5yZW1vdmVNZXNzYWdlLmxjSWQ/XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50Lml0ZW1zLmRhdGEucmVtb3ZlTWVzc2FnZSA9IGxjcyhkb2N1bWVudC5pdGVtcy5kYXRhLnJlbW92ZU1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgaWYgZG9jdW1lbnQuaXRlbXMuZGF0YS51c2luZ01lc3NhZ2U/IGFuZCBkb2N1bWVudC5pdGVtcy5kYXRhLnVzaW5nTWVzc2FnZS5sY0lkP1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5pdGVtcy5kYXRhLnVzaW5nTWVzc2FnZSA9IGxjcyhkb2N1bWVudC5pdGVtcy5kYXRhLnVzaW5nTWVzc2FnZSlcbiAgICAgIFxuXG53aW5kb3cuUmVjb3JkTWFuYWdlciA9IG5ldyBSZWNvcmRNYW5hZ2VyKCkiXX0=
//# sourceURL=RecordManager_96.js