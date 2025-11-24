
/**
* An enumeration of game storage locations.
*
* @module gs
* @class GameStorageLocations
* @memberof gs
* @constructor
* @static
* @final
 */
var GameStorage, GameStorageLocations;

GameStorageLocations = (function() {
  function GameStorageLocations() {}

  GameStorageLocations.initialize = function() {

    /**
    * Stores game data in working directory which is next to the executable file in most cases.
    * @property WORKING_DIRECTORY
    * @type number
    * @static
    * @final
     */
    this.WORKING_DIRECTORY = 0;

    /**
    * Stores game data in local app-data directory depending on the operating system.
    * @property APP_DATA_DIRECTORY
    * @type number
    * @static
    * @final
     */
    this.APP_DATA_DIRECTORY = 1;

    /**
    * Stores game data in internal storage.
    * @property INTERNAL_STORAGE
    * @type number
    * @static
    * @final
     */
    return this.INTERNAL_STORAGE = 2;
  };

  return GameStorageLocations;

})();

GameStorageLocations.initialize();

gs.GameStorageLocations = GameStorageLocations;

GameStorage = (function() {

  /**
  * The GameStorage helps to store different kind of game data permanentely like
  * a save-game or the game settings. The way how the data is stored depends on
  * the platform. For example: If the game runs in a web-browser the data is stored
  * the internal local storage of the web-browser but if the game runs locally the
  * data is stored on disk.
  *
  * All object are stored as JSON so it is imported that the object to store can
  * be serialized to JSON and doesn't contain any circular references. Except for
  * the methods gs.GameStorage.setData and gs.GameStorage.getData since that methods
  * dealing with a regular string.
  *
  * @module gs
  * @class GameStorage
  * @memberof gs
  * @constructor
  * @static
   */
  function GameStorage() {}


  /**
  * Clears the game storage. All data will be lost.
  *
  * @method clear
  * @static
   */

  GameStorage.prototype.clear = function() {
    return localStorage.clear();
  };


  /**
  * The path where the data is stored. The result depends on the platform.
  * For example: For a web-game the result is an empty string but for a local
  * running game the result is the file-path to the configured storage-directory of the game.
  *
  * @method clear
  * @static
   */

  GameStorage.prototype.storagePath = function() {
    if ($PARAMS.isOffline && !$PARAMS.platform.isSteamOS && (window.nw != null)) {
      switch (RecordManager.system.gameDataPath) {
        case gs.GameStorageLocations.APP_DATA_DIRECTORY:
          return nw.App.dataPath;
        case gs.GameStorageLocations.WORKING_DIRECTORY:
          return "./";
        case gs.GameStorageLocations.INTERNAL_STORAGE:
          return "";
        default:
          return "./";
      }
    } else {
      return "";
    }
  };


  /**
  * Checks if data already exists for the specified id/key.
  *
  * @method exists
  * @return {boolean} If <b>true</b> then there is already existing data for the id/key. Otherwise <b>false</b>
  * @static
   */

  GameStorage.prototype.exists = function(id) {
    if ($PARAMS.isOffline && !$PARAMS.platform.isSteamOS && (window.nw != null)) {
      return require("fs").existsSync(this.storagePath() + "/" + id + ".vndata");
    } else {
      return localStorage.getItem($PARAMS.uid + "_" + id) !== null;
    }
  };


  /**
  * Deletes the data stored under the specified id/key.
  *
  * @method remove
  * @return {string} id - The id/key where the data should be deleted.
  * @static
   */

  GameStorage.prototype.remove = function(id) {
    if ($PARAMS.isOffline && !$PARAMS.platform.isSteamOS && (window.nw != null)) {
      if (require("fs").existsSync(this.storagePath() + "/" + id + ".vndata")) {
        return require("fs").unlinkSync(this.storagePath() + "/" + id + ".vndata");
      }
    } else {
      return localStorage.removeItem($PARAMS.uid + "_" + id);
    }
  };


  /**
  * Stores a string under the specified id/key.
  *
  * @method setData
  * @param {string} id - The id/key where the data should be stored.
  * @param {string} data - The string to store.
  * @static
   */

  GameStorage.prototype.setData = function(id, data) {
    if ($PARAMS.isOffline && !$PARAMS.platform.isSteamOS && (window.nw != null)) {
      return require("fs").writeFileSync(this.storagePath() + "/" + id + ".vndata", data);
    } else {
      return localStorage.setItem($PARAMS.uid + "_" + id, data);
    }
  };


  /**
  * Gets a stored string for the specified id/key.
  *
  * @method setObject
  * @param {string} id - The id/key of the string/data to get.
  * @return {string} The string/data or <b>null</b> if no data exists for the specified id/key.
  * @static
   */

  GameStorage.prototype.getData = function(id) {
    if ($PARAMS.isOffline && !$PARAMS.platform.isSteamOS && (window.nw != null)) {
      return require("fs").readFileSync(this.storagePath() + "/" + id + ".vndata", "utf8");
    } else {
      return localStorage.getItem($PARAMS.uid + "_" + id);
    }
  };


  /**
  * Stores an object under the specified id/key. The object will be serialized to
  * JSON so its important that the object doesn't contain any circular references.
  *
  * @method setObject
  * @param {string} id - The id/key where the object should be stored.
  * @param {Object} object - The object to store.
  * @static
   */

  GameStorage.prototype.setObject = function(id, object) {
    if ($PARAMS.isOffline && !$PARAMS.platform.isSteamOS && (window.nw != null)) {
      return require("fs").writeFileSync(this.storagePath() + "/" + id + ".vndata", JSON.stringify(object));
    } else {
      return localStorage.setItem($PARAMS.uid + "_" + id, JSON.stringify(object));
    }
  };


  /**
  * Gets a stored object for the specified id/key.
  *
  * @method setObject
  * @param {string} id - The id/key of the object to get.
  * @return {Object} The object or <b>null</b> if no object exists for the specified id/key.
  * @static
   */

  GameStorage.prototype.getObject = function(id) {
    var item, result;
    if ($PARAMS.isOffline && !$PARAMS.platform.isSteamOS && (window.nw != null)) {
      if (require("fs").existsSync(this.storagePath() + "/" + id + ".vndata")) {
        item = require("fs").readFileSync(this.storagePath() + "/" + id + ".vndata", "utf8");
      }
    } else {
      item = localStorage.getItem($PARAMS.uid + "_" + id);
    }
    result = null;
    if (item != null) {
      result = JSON.parse(item);
    }
    return result;
  };

  return GameStorage;

})();

window.GameStorage = new GameStorage();

gs.GameStorage = window.GameStorage;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFPQTs7Ozs7Ozs7OztBQUFBLElBQUE7O0FBVU07OztFQUNGLG9CQUFDLENBQUEsVUFBRCxHQUFhLFNBQUE7O0FBQ1Q7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7O0FBRXJCOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCOztBQUN0Qjs7Ozs7OztXQU9BLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtFQXpCWDs7Ozs7O0FBMkJqQixvQkFBb0IsQ0FBQyxVQUFyQixDQUFBOztBQUNBLEVBQUUsQ0FBQyxvQkFBSCxHQUEwQjs7QUFFcEI7O0FBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWtCYSxxQkFBQSxHQUFBOzs7QUFFYjs7Ozs7Ozt3QkFNQSxLQUFBLEdBQU8sU0FBQTtXQUNILFlBQVksQ0FBQyxLQUFiLENBQUE7RUFERzs7O0FBR1A7Ozs7Ozs7Ozt3QkFRQSxXQUFBLEdBQWEsU0FBQTtJQUNULElBQUcsT0FBTyxDQUFDLFNBQVIsSUFBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQXhDLElBQXNELG1CQUF6RDtBQUNJLGNBQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQyxZQUE1QjtBQUFBLGFBQ1MsRUFBRSxDQUFDLG9CQUFvQixDQUFDLGtCQURqQztBQUVRLGlCQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFGdEIsYUFHUyxFQUFFLENBQUMsb0JBQW9CLENBQUMsaUJBSGpDO0FBSVEsaUJBQU87QUFKZixhQUtTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFMakM7QUFNUSxpQkFBTztBQU5mO0FBUVEsaUJBQU87QUFSZixPQURKO0tBQUEsTUFBQTtBQVdJLGFBQU8sR0FYWDs7RUFEUzs7O0FBY2I7Ozs7Ozs7O3dCQU9BLE1BQUEsR0FBUSxTQUFDLEVBQUQ7SUFDSixJQUFHLE9BQU8sQ0FBQyxTQUFSLElBQXNCLENBQUMsT0FBTyxDQUFD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Q0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQXhDLElBQXNELG1CQUF6RDtNQUNJLElBQUcsT0FBQSxDQUFRLElBQVIsQ0FBYSxDQUFDLFVBQWQsQ0FBeUIsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLEdBQWlCLEdBQWpCLEdBQXVCLEVBQXZCLEdBQTRCLFNBQXJELENBQUg7UUFDSSxJQUFBLEdBQU8sT0FBQSxDQUFRLElBQVIsQ0FBYSxDQUFDLFlBQWQsQ0FBMkIsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLEdBQWlCLEdBQWpCLEdBQXVCLEVBQXZCLEdBQTRCLFNBQXZELEVBQWtFLE1BQWxFLEVBRFg7T0FESjtLQUFBLE1BQUE7TUFJSSxJQUFBLEdBQU8sWUFBWSxDQUFDLE9BQWIsQ0FBcUIsT0FBTyxDQUFDLEdBQVIsR0FBYyxHQUFkLEdBQW9CLEVBQXpDLEVBSlg7O0lBS0EsTUFBQSxHQUFTO0lBRVQsSUFBRyxZQUFIO01BQ0ksTUFBQSxHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxFQURiOztBQUdBLFdBQU87RUFYRDs7Ozs7O0FBZ0JkLE1BQU0sQ0FBQyxXQUFQLEdBQXlCLElBQUEsV0FBQSxDQUFBOztBQUN6QixFQUFFLENBQUMsV0FBSCxHQUFpQixNQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IEdhbWVTdG9yYWdlXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyMqXG4qIEFuIGVudW1lcmF0aW9uIG9mIGdhbWUgc3RvcmFnZSBsb2NhdGlvbnMuXG4qXG4qIEBtb2R1bGUgZ3NcbiogQGNsYXNzIEdhbWVTdG9yYWdlTG9jYXRpb25zXG4qIEBtZW1iZXJvZiBnc1xuKiBAY29uc3RydWN0b3JcbiogQHN0YXRpY1xuKiBAZmluYWxcbiMjIyAgXG5jbGFzcyBHYW1lU3RvcmFnZUxvY2F0aW9uc1xuICAgIEBpbml0aWFsaXplOiAtPlxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGdhbWUgZGF0YSBpbiB3b3JraW5nIGRpcmVjdG9yeSB3aGljaCBpcyBuZXh0IHRvIHRoZSBleGVjdXRhYmxlIGZpbGUgaW4gbW9zdCBjYXNlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgV09SS0lOR19ESVJFQ1RPUllcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAc3RhdGljXG4gICAgICAgICogQGZpbmFsXG4gICAgICAgICMjI1xuICAgICAgICBAV09SS0lOR19ESVJFQ1RPUlkgPSAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGdhbWUgZGF0YSBpbiBsb2NhbCBhcHAtZGF0YSBkaXJlY3RvcnkgZGVwZW5kaW5nIG9uIHRoZSBvcGVyYXRpbmcgc3lzdGVtLlxuICAgICAgICAqIEBwcm9wZXJ0eSBBUFBfREFUQV9ESVJFQ1RPUllcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAc3RhdGljXG4gICAgICAgICogQGZpbmFsXG4gICAgICAgICMjI1xuICAgICAgICBAQVBQX0RBVEFfRElSRUNUT1JZID0gMVxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGdhbWUgZGF0YSBpbiBpbnRlcm5hbCBzdG9yYWdlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBJTlRFUk5BTF9TVE9SQUdFXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHN0YXRpY1xuICAgICAgICAqIEBmaW5hbFxuICAgICAgICAjIyNcbiAgICAgICAgQElOVEVSTkFMX1NUT1JBR0UgPSAyXG4gICAgICAgIFxuR2FtZVN0b3JhZ2VMb2NhdGlvbnMuaW5pdGlhbGl6ZSgpXG5ncy5HYW1lU3RvcmFnZUxvY2F0aW9ucyA9IEdhbWVTdG9yYWdlTG9jYXRpb25zXG4gICAgXG5jbGFzcyBHYW1lU3RvcmFnZVxuICAgICMjIypcbiAgICAqIFRoZSBHYW1lU3RvcmFnZSBoZWxwcyB0byBzdG9yZSBkaWZmZXJlbnQga2luZCBvZiBnYW1lIGRhdGEgcGVybWFuZW50ZWx5IGxpa2VcbiAgICAqIGEgc2F2ZS1nYW1lIG9yIHRoZSBnYW1lIHNldHRpbmdzLiBUaGUgd2F5IGhvdyB0aGUgZGF0YSBpcyBzdG9yZWQgZGVwZW5kcyBvblxuICAgICogdGhlIHBsYXRmb3JtLiBGb3IgZXhhbXBsZTogSWYgdGhlIGdhbWUgcnVucyBpbiBhIHdlYi1icm93c2VyIHRoZSBkYXRhIGlzIHN0b3JlZFxuICAgICogdGhlIGludGVybmFsIGxvY2FsIHN0b3JhZ2Ugb2YgdGhlIHdlYi1icm93c2VyIGJ1dCBpZiB0aGUgZ2FtZSBydW5zIGxvY2FsbHkgdGhlXG4gICAgKiBkYXRhIGlzIHN0b3JlZCBvbiBkaXNrLlxuICAgICpcbiAgICAqIEFsbCBvYmplY3QgYXJlIHN0b3JlZCBhcyBKU09OIHNvIGl0IGlzIGltcG9ydGVkIHRoYXQgdGhlIG9iamVjdCB0byBzdG9yZSBjYW5cbiAgICAqIGJlIHNlcmlhbGl6ZWQgdG8gSlNPTiBhbmQgZG9lc24ndCBjb250YWluIGFueSBjaXJjdWxhciByZWZlcmVuY2VzLiBFeGNlcHQgZm9yXG4gICAgKiB0aGUgbWV0aG9kcyBncy5HYW1lU3RvcmFnZS5zZXREYXRhIGFuZCBncy5HYW1lU3RvcmFnZS5nZXREYXRhIHNpbmNlIHRoYXQgbWV0aG9kc1xuICAgICogZGVhbGluZyB3aXRoIGEgcmVndWxhciBzdHJpbmcuXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIEdhbWVTdG9yYWdlXG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICogQHN0YXRpY1xuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgIFxuICAgICMjIypcbiAgICAqIENsZWFycyB0aGUgZ2FtZSBzdG9yYWdlLiBBbGwgZGF0YSB3aWxsIGJlIGxvc3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhclxuICAgICogQHN0YXRpY1xuICAgICMjIyBcbiAgICBjbGVhcjogLT5cbiAgICAgICAgbG9jYWxTdG9yYWdlLmNsZWFyKClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBUaGUgcGF0aCB3aGVyZSB0aGUgZGF0YSBpcyBzdG9yZWQuIFRoZSByZXN1bHQgZGVwZW5kcyBvbiB0aGUgcGxhdGZvcm0uXG4gICAgKiBGb3IgZXhhbXBsZTogRm9yIGEgd2ViLWdhbWUgdGhlIHJlc3VsdCBpcyBhbiBlbXB0eSBzdHJpbmcgYnV0IGZvciBhIGxvY2FsXG4gICAgKiBydW5uaW5nIGdhbWUgdGhlIHJlc3VsdCBpcyB0aGUgZmlsZS1wYXRoIHRvIHRoZSBjb25maWd1cmVkIHN0b3JhZ2UtZGlyZWN0b3J5IG9mIHRoZSBnYW1lLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAqIEBzdGF0aWNcbiAgICAjIyMgICAgIFxuICAgIHN0b3JhZ2VQYXRoOiAtPiBcbiAgICAgICAgaWYgJFBBUkFNUy5pc09mZmxpbmUgYW5kICEkUEFSQU1TLnBsYXRmb3JtLmlzU3RlYW1PUyBhbmQgd2luZG93Lm53P1xuICAgICAgICAgICAgc3dpdGNoIFJlY29yZE1hbmFnZXIuc3lzdGVtLmdhbWVEYXRhUGF0aFxuICAgICAgICAgICAgICAgIHdoZW4gZ3MuR2FtZVN0b3JhZ2VMb2NhdGlvbnMuQVBQX0RBVEFfRElSRUNUT1JZXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudy5BcHAuZGF0YVBhdGhcbiAgICAgICAgICAgICAgICB3aGVuIGdzLkdhbWVTdG9yYWdlTG9jYXRpb25zLldPUktJTkdfRElSRUNUT1JZXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIi4vXCJcbiAgICAgICAgICAgICAgICB3aGVuIGdzLkdhbWVTdG9yYWdlTG9jYXRpb25zLklOVEVSTkFMX1NUT1JBR0VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIi4vXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIFwiXCJcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDaGVja3MgaWYgZGF0YSBhbHJlYWR5IGV4aXN0cyBmb3IgdGhlIHNwZWNpZmllZCBpZC9rZXkuXG4gICAgKlxuICAgICogQG1ldGhvZCBleGlzdHNcbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IElmIDxiPnRydWU8L2I+IHRoZW4gdGhlcmUgaXMgYWxyZWFkeSBleGlzdGluZyBkYXRhIGZvciB0aGUgaWQva2V5LiBPdGhlcndpc2UgPGI+ZmFsc2U8L2I+XG4gICAgKiBAc3RhdGljXG4gICAgIyMjICAgICAgICAgXG4gICAgZXhpc3RzOiAoaWQpIC0+XG4gICAgICAgIGlmICRQQVJBTVMuaXNPZmZsaW5lIGFuZCAhJFBBUkFNUy5wbGF0Zm9ybS5pc1N0ZWFtT1MgYW5kIHdpbmRvdy5udz9cbiAgICAgICAgICAgIHJldHVybiByZXF1aXJlKFwiZnNcIikuZXhpc3RzU3luYyhAc3RvcmFnZVBhdGgoKSArIFwiL1wiICsgaWQgKyBcIi52bmRhdGFcIilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCRQQVJBTVMudWlkICsgXCJfXCIgKyBpZCkgIT0gbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIERlbGV0ZXMgdGhlIGRhdGEgc3RvcmVkIHVuZGVyIHRoZSBzcGVjaWZpZWQgaWQva2V5LlxuICAgICpcbiAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IGlkIC0gVGhlIGlkL2tleSB3aGVyZSB0aGUgZGF0YSBzaG91bGQgYmUgZGVsZXRlZC5cbiAgICAqIEBzdGF0aWNcbiAgICAjIyMgXG4gICAgcmVtb3ZlOiAoaWQpIC0+XG4gICAgICAgIGlmICRQQVJBTVMuaXNPZmZsaW5lIGFuZCAhJFBBUkFNUy5wbGF0Zm9ybS5pc1N0ZWFtT1MgYW5kIHdpbmRvdy5udz9cbiAgICAgICAgICAgIGlmIHJlcXVpcmUoXCJmc1wiKS5leGlzdHNTeW5jKEBzdG9yYWdlUGF0aCgpICsgXCIvXCIgKyBpZCArIFwiLnZuZGF0YVwiKVxuICAgICAgICAgICAgICAgIHJlcXVpcmUoXCJmc1wiKS51bmxpbmtTeW5jKEBzdG9yYWdlUGF0aCgpICsgXCIvXCIgKyBpZCArIFwiLnZuZGF0YVwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgkUEFSQU1TLnVpZCArIFwiX1wiICsgaWQpXG4gICAgXG4gICAgIyMjKlxuICAgICogU3RvcmVzIGEgc3RyaW5nIHVuZGVyIHRoZSBzcGVjaWZpZWQgaWQva2V5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0RGF0YVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVGhlIGlkL2tleSB3aGVyZSB0aGUgZGF0YSBzaG91bGQgYmUgc3RvcmVkLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBUaGUgc3RyaW5nIHRvIHN0b3JlLlxuICAgICogQHN0YXRpY1xuICAgICMjIyBcbiAgICBzZXREYXRhOiAoaWQsIGRhdGEpIC0+XG4gICAgICAgIGlmICRQQVJBTVMuaXNPZmZsaW5lIGFuZCAhJFBBUkFNUy5wbGF0Zm9ybS5pc1N0ZWFtT1MgYW5kIHdpbmRvdy5udz9cbiAgICAgICAgICAgIHJlcXVpcmUoXCJmc1wiKS53cml0ZUZpbGVTeW5jKEBzdG9yYWdlUGF0aCgpICsgXCIvXCIgKyBpZCArIFwiLnZuZGF0YVwiLCBkYXRhKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgkUEFSQU1TLnVpZCArIFwiX1wiICsgaWQsIGRhdGEpXG4gICAgIFxuICAgICMjIypcbiAgICAqIEdldHMgYSBzdG9yZWQgc3RyaW5nIGZvciB0aGUgc3BlY2lmaWVkIGlkL2tleS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldE9iamVjdFxuICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVGhlIGlkL2tleSBvZiB0aGUgc3RyaW5nL2RhdGEgdG8gZ2V0LlxuICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5nL2RhdGEgb3IgPGI+bnVsbDwvYj4gaWYgbm8gZGF0YSBleGlzdHMgZm9yIHRoZSBzcGVjaWZpZWQgaWQva2V5LlxuICAgICogQHN0YXRpY1xuICAgICMjIyAgICBcbiAgICBnZXREYXRhOiAoaWQpIC0+IFxuICAgICAgICBpZiAkUEFSQU1TLmlzT2ZmbGluZSBhbmQgISRQQVJBTVMucGxhdGZvcm0uaXNTdGVhbU9TIGFuZCB3aW5kb3cubnc/XG4gICAgICAgICAgICByZXF1aXJlKFwiZnNcIikucmVhZEZpbGVTeW5jKEBzdG9yYWdlUGF0aCgpICsgXCIvXCIgKyBpZCArIFwiLnZuZGF0YVwiLCBcInV0ZjhcIilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJFBBUkFNUy51aWQgKyBcIl9cIiArIGlkKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBTdG9yZXMgYW4gb2JqZWN0IHVuZGVyIHRoZSBzcGVjaWZpZWQgaWQva2V5LiBUaGUgb2JqZWN0IHdpbGwgYmUgc2VyaWFsaXplZCB0b1xuICAgICogSlNPTiBzbyBpdHMgaW1wb3J0YW50IHRoYXQgdGhlIG9iamVjdCBkb2Vzbid0IGNvbnRhaW4gYW55IGNpcmN1bGFyIHJlZmVyZW5jZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRPYmplY3RcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFRoZSBpZC9rZXkgd2hlcmUgdGhlIG9iamVjdCBzaG91bGQgYmUgc3RvcmVkLlxuICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAtIFRoZSBvYmplY3QgdG8gc3RvcmUuXG4gICAgKiBAc3RhdGljXG4gICAgIyMjICAgIFxuICAgIHNldE9iamVjdDooaWQsIG9iamVjdCkgLT5cbiAgICAgICAgaWYgJFBBUkFNUy5pc09mZmxpbmUgYW5kICEkUEFSQU1TLnBsYXRmb3JtLmlzU3RlYW1PUyBhbmQgd2luZG93Lm53P1xuICAgICAgICAgICAgcmVxdWlyZShcImZzXCIpLndyaXRlRmlsZVN5bmMoQHN0b3JhZ2VQYXRoKCkgKyBcIi9cIiArIGlkICsgXCIudm5kYXRhXCIsIEpTT04uc3RyaW5naWZ5KG9iamVjdCkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCRQQVJBTVMudWlkICsgXCJfXCIgKyBpZCwgSlNPTi5zdHJpbmdpZnkob2JqZWN0KSlcbiAgICAgXG4gICAgIyMjKlxuICAgICogR2V0cyBhIHN0b3JlZCBvYmplY3QgZm9yIHRoZSBzcGVjaWZpZWQgaWQva2V5LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0T2JqZWN0XG4gICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBUaGUgaWQva2V5IG9mIHRoZSBvYmplY3QgdG8gZ2V0LlxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgb2JqZWN0IG9yIDxiPm51bGw8L2I+IGlmIG5vIG9iamVjdCBleGlzdHMgZm9yIHRoZSBzcGVjaWZpZWQgaWQva2V5LlxuICAgICogQHN0YXRpY1xuICAgICMjIyAgICBcbiAgICBnZXRPYmplY3Q6KGlkKSAtPlxuICAgICAgICBpZiAkUEFSQU1TLmlzT2ZmbGluZSBhbmQgISRQQVJBTVMucGxhdGZvcm0uaXNTdGVhbU9TIGFuZCB3aW5kb3cubnc/XG4gICAgICAgICAgICBpZiByZXF1aXJlKFwiZnNcIikuZXhpc3RzU3luYyhAc3RvcmFnZVBhdGgoKSArIFwiL1wiICsgaWQgKyBcIi52bmRhdGFcIilcbiAgICAgICAgICAgICAgICBpdGVtID0gcmVxdWlyZShcImZzXCIpLnJlYWRGaWxlU3luYyhAc3RvcmFnZVBhdGgoKSArIFwiL1wiICsgaWQgKyBcIi52bmRhdGFcIiwgXCJ1dGY4XCIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGl0ZW0gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgkUEFSQU1TLnVpZCArIFwiX1wiICsgaWQpXG4gICAgICAgIHJlc3VsdCA9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmIGl0ZW0/XG4gICAgICAgICAgICByZXN1bHQgPSBKU09OLnBhcnNlKGl0ZW0pXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICBcbiAgICBcbiAgICAgICAgXG4gICAgICAgIFxud2luZG93LkdhbWVTdG9yYWdlID0gbmV3IEdhbWVTdG9yYWdlKClcbmdzLkdhbWVTdG9yYWdlID0gd2luZG93LkdhbWVTdG9yYWdlIl19
//# sourceURL=GameStorage_37.js