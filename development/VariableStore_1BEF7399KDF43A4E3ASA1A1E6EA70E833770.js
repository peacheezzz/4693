var VariableStore;

VariableStore = (function() {
  VariableStore.objectCodecBlackList = ["persistentNumbers", "persistentStrings", "persistentBooleans", "persistentLists"];


  /**
  * <p>A storage for different kind of game variables. The following scopes
  * for variables exist:</p>
  *
  * - Local Variables -> Only valid for the current scene.
  * - Global Variables -> Valid for the whole game but bound to a single save-game.
  * - Persistent Variables -> Valid for the whole game indepentent from the save-games.
  *
  * <p>The following data-types exist:</p>
  * - Strings -> Variables storing text data.
  * - Numbers -> Variables storing integer number values.
  * - Booleans -> Variables storing boolean values. (Called "Switches" for easier understanding)
  * - Lists -> Variables storing multiple other variables. Lists can also contain Lists.
  * <p>
  * Local variables are stored by scene UID. For each scene UID a list of local variables is stored.</p>
  *
  * <p>Global and persistent variables are stored and a specific domain. A domain is just a unique name such
  * as <i>com.example.game</i> for example. The default domain is an empty string. Domains are useful to avoid
  * overlapping of variable numbers when sharing content with other users. </p>
  *
  * @module gs
  * @class VariableStore
  * @memberof gs
  * @constructor
   */

  function VariableStore() {

    /**
    * Current local variable context
    * @property context
    * @type Object
     */
    this.context = null;

    /**
    * Current domain for global and persistent variables. Each domain has its own
    * variables. Please use <b>changeDomain</b> method to change the domain.
    * @property domain
    * @type Object
    * @readOnly
     */
    this.domain = "";

    /**
    * List of available domains for global and persistent variables.
    * @property domains
    * @type string[]
     */
    this.domains = [""];

    /**
    * The global number variables of the current domain.
    * @property numbers
    * @type number[]
     */
    this.numbers = null;

    /**
    * The global boolean variables of the current domain.
    * @property booleans
    * @type boolean[]
     */
    this.booleans = null;

    /**
    * The global string variables of the current domain.
    * @property strings
    * @type string[]
     */
    this.strings = null;

    /**
    * The global list variables of the current domain.
    * @property lists
    * @type Object[][]
     */
    this.lists = null;

    /**
    * The storage of all global variables by domain.
    * @property globalVariablesByDomain
    * @type Object[][]
     */
    this.globalVariablesByDomain = {};

    /**
    * The storage of all persistent variables by domain.
    * @property persistentVariablesByDomain
    * @type Object[][]
     */
    this.persistentVariablesByDomain = {};

    /**
    * The persistent number variables of the current domain.
    * @property persistentNumbers
    * @type number[]
     */
    this.persistentNumbers = [];

    /**
    * The persistent string variables of the current domain.
    * @property persistentStrings
    * @type string[]
     */
    this.persistentStrings = [];

    /**
    * The persistent boolean variables of the current domain.
    * @property persistentBooleans
    * @type boolean[]
     */
    this.persistentBooleans = [];

    /**
    * The persistent list variables of the current domain.
    * @property persistentLists
    * @type Object[][]
     */
    this.persistentLists = [];

    /**
    * The local number variables.
    * @property localNumbers
    * @type Object
     */
    this.localNumbers = {};

    /**
    * The local string variables.
    * @property localStrings
    * @type Object
     */
    this.localStrings = {};

    /**
    * The local boolean variables.
    * @property localBooleans
    * @type Object
     */
    this.localBooleans = {};

    /**
    * The local list variables.
    * @property localLists
    * @type Object
     */
    this.localLists = {};

    /**
    * @property tempNumbers
    * @type number[]
     */
    this.tempNumbers = null;

    /**
    * @property tempStrings
    * @type string[]
     */
    this.tempStrings = null;

    /**
    * @property localBooleans
    * @type number[]
     */
    this.tempBooleans = null;

    /**
    * @property localLists
    * @type Object[][]
     */
    this.tempLists = null;
  }


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  *
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  VariableStore.prototype.onDataBundleRestore = function(data, context) {
    var domain, domains, i, j, len;
    domains = DataManager.getDocumentsByType("global_variables").select(function(d) {
      return d.items.domain;
    });
    for (i = j = 0, len = domains.length; j < len; i = ++j) {
      domain = domains[i];
      this.numbersByDomain[domain] = this.numbersByDomain[i];
      this.stringsByDomain[domain] = this.stringsByDomain[i];
      this.booleansByDomain[domain] = this.booleansByDomain[i];
      this.listsByDomain[domain] = this.listsByDomain[i];
    }
    return null;
  };

  VariableStore.prototype.setupGlobalDomains = function() {
    var domain, i, j, len, ref;
    this.numbersByDomain = [];
    this.stringsByDomain = [];
    this.booleansByDomain = [];
    this.listsByDomain = [];
    ref = this.domains;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      domain = ref[i];
      this.numbersByDomain[i] = new Array(1000);
      this.numbersByDomain[domain] = this.numbersByDomain[i];
      this.stringsByDomain[i] = new Array(1000);
      this.stringsByDomain[domain] = this.stringsByDomain[i];
      this.booleansByDomain[i] = new Array(1000);
      this.booleansByDomain[domain] = this.booleansByDomain[i];
      this.listsByDomain[i] = new Array(1000);
      this.listsByDomain[domain] = this.listsByDomain[i];
    }
    this.numbers = this.numbersByDomain[0];
    this.strings = this.stringsByDomain[0];
    this.booleans = this.booleansByDomain[0];
    return this.lists = this.listsByDomain[0];
  };

  VariableStore.prototype.setupPersistentDomains = function(domains) {
    var domain, i, j, len, ref;
    this.persistentNumbersByDomain = {};
    this.persistentStringsByDomain = {};
    this.persistentBooleansByDomain = {};
    this.persistentListsByDomain = {};
    ref = this.domains;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      domain = ref[i];
      this.persistentNumbersByDomain[i] = new Array(10);
      this.persistentNumbersByDomain[domain] = this.persistentNumbers[i];
      this.persistentStringsByDomain[i] = new Array(10);
      this.persistentStringsByDomain[domain] = this.persistentStrings[i];
      this.persistentBooleansByDomain[i] = new Array(10);
      this.persistentBooleansByDomain[domain] = this.persistentBooleans[i];
      this.persistentListsByDomain[i] = new Array(10);
      this.persistentListsByDomain[domain] = this.persistentLists[i];
    }
    this.persistentNumbers = this.persistentNumbersByDomain[0];
    this.persistentStrings = this.persistentStringsByDomain[0];
    this.persistentBooleans = this.persistentBooleansByDomain[0];
    return this.persistentLists = this.persistentListsByDomain[0];
  };

  VariableStore.prototype.setupDomains = function(domains) {
    this.domains = domains;
    this.setupGlobalDomains();
    return this.setupPersistentDomains();
  };


  /**
  * Restores the variable store from a serialized store.
   */

  VariableStore.prototype.restore = function(store) {
    var ignore, k, results;
    ignore = ["domains"];
    results = [];
    for (k in store) {
      if (!k.startsWith("persistent") && ignore.indexOf(k) === -1) {
        results.push(this[k] = store[k]);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Changes the current domain.
  *
  * @deprecated
  * @method changeDomain
  * @param {string} domain - The domain to change to.
   */

  VariableStore.prototype.changeDomain = function(domain) {
    var globalVariables, persistentVariables;
    this.domain = domain;
    globalVariables = this.globalVariablesByDomain[domain];
    persistentVariables = this.persistentVariablesByDomain[domain];
    if (!globalVariables) {
      globalVariables = this.globalVariablesByDomain[domain] = {
        numbers: new Array(500),
        strings: new Array(500),
        booleans: new Array(500),
        lists: new Array(500)
      };
    }
    if (!persistentVariables) {
      persistentVariables = this.persistentVariablesByDomain[domain] = {
        numbers: new Array(500),
        strings: new Array(500),
        booleans: new Array(500),
        lists: new Array(500)
      };
    }
    this.numbers = globalVariables.numbers;
    this.strings = globalVariables.strings;
    this.booleans = globalVariables.booleans;
    this.lists = globalVariables.lists;
    this.persistentNumbers = persistentVariables.numbers;
    this.persistentBooleans = persistentVariables.booleans;
    this.persistentStrings = persistentVariables.strings;
    return this.persistentLists = persistentVariables.lists;
  };


  /**
  * Clears all global variables
  *
  * @method clearGlobalVariables
   */

  VariableStore.prototype.clearAllGlobalVariables = function() {
    var globalVariables;
    this.setupGlobalDomains();
    return;
    globalVariables = this.globalVariablesByDomain[this.domain];
    this.numbersByDomain = new Array(1000);
    globalVariables.booleans = new Array(1000);
    globalVariables.strings = new Array(1000);
    this.numbers = globalVariables.numbers;
    this.strings = globalVariables.strings;
    return this.booleans = globalVariables.booleans;
  };


  /**
  * Clears all local variables for all contexts/scenes/common-events.
  *
  * @method clearAllLocalVariables
   */

  VariableStore.prototype.clearAllLocalVariables = function() {
    this.localNumbers = {};
    this.localStrings = {};
    this.localBooleans = {};
    return this.localLists = {};
  };


  /**
  * Clears specified variables.
  *
  * @method clearVariables
  * @param {number[]} numbers - The number variables to clear.
  * @param {string[]} strings - The string variables to clear.
  * @param {boolean[]} booleans - The boolean variables to clear.
  * @param {Array[]} lists - The list variables to clear.
  * @param {number} type - Determines what kind of variables should be cleared.
  * <ul>
  * <li>0 = All</li>
  * <li>1 = Switches / Booleans</li>
  * <li>2 = Numbers</li>
  * <li>3 = Texts</li>
  * <li>4 = Lists</li>
  * </ul>
  * @param {Object} range - The variable id-range to clear. If <b>null</b> all specified variables are cleared.
   */

  VariableStore.prototype.clearVariables = function(numbers, strings, booleans, lists, type, range) {
    switch (type) {
      case 0:
        if (numbers != null) {
          numbers.fill(0, range.start, range.end);
        }
        if (strings != null) {
          strings.fill("", range.start, range.end);
        }
        if (booleans != null) {
          booleans.fill(false, range.start, range.end);
        }
        return lists != null ? lists.fill([], range.start, range.end) : void 0;
      case 1:
        return booleans != null ? booleans.fill(false, range.start, range.end) : void 0;
      case 2:
        return numbers != null ? numbers.fill(0, range.start, range.end) : void 0;
      case 3:
        return strings != null ? strings.fill("", range.start, range.end) : void 0;
      case 4:
        return lists != null ? lists.fill([], range.start, range.end) : void 0;
    }
  };


  /**
  * Clears all local variables for a specified context. If the context is not specified, all
  * local variables for all contexts/scenes/common-events are cleared.
  *
  * @method clearLocalVariables
  * @param {Object} context - The context to clear the local variables for. If <b>null</b>, all
  * @param {number} type - Determines what kind of variables should be cleared.
  * <ul>
  * <li>0 = All</li>
  * <li>1 = Switches / Booleans</li>
  * <li>2 = Numbers</li>
  * <li>3 = Texts</li>
  * <li>4 = Lists</li>
  * </ul>
  * @param {Object} range - The variable id-range to clear. If <b>null</b> all variables are cleared.
   */

  VariableStore.prototype.clearLocalVariables = function(context, type, range) {
    var id, ids, j, len, results;
    if (context != null) {
      ids = [context.id];
    } else {
      ids = Object.keys(this.localNumbers);
    }
    if (range != null) {
      range = {
        start: range.start,
        end: range.end + 1
      };
    } else {
      range = {
        start: 0,
        end: null
      };
    }
    results = [];
    for (j = 0, len = ids.length; j < len; j++) {
      id = ids[j];
      results.push(this.clearVariables(this.localNumbers[id], this.localStrings[id], this.localBooleans[id], this.localLists[id], type, range));
    }
    return results;
  };


  /**
  * Clears global variables.
  *
  * @method clearGlobalVariables
  * @param {number} type - Determines what kind of variables should be cleared.
  * <ul>
  * <li>0 = All</li>
  * <li>1 = Switches / Booleans</li>
  * <li>2 = Numbers</li>
  * <li>3 = Texts</li>
  * <li>4 = Lists</li>
  * </ul>
  * @param {Object} range - The variable id-range to clear. If <b>null</b> all variables are cleared.
   */

  VariableStore.prototype.clearGlobalVariables = function(type, range) {
    if (range != null) {
      range = {
        start: range.start,
        end: range.end + 1
      };
    } else {
      range = {
        start: 0,
        end: null
      };
    }
    return this.clearVariables(this.numbers, this.strings, this.booleans, this.lists, type, range);
  };


  /**
  * Clears persistent variables.
  *
  * @method clearPersistentVariables
  * @param {number} type - Determines what kind of variables should be cleared.
  * <ul>
  * <li>0 = All</li>
  * <li>1 = Switches / Booleans</li>
  * <li>2 = Numbers</li>
  * <li>3 = Texts</li>
  * <li>4 = Lists</li>
  * </ul>
  * @param {Object} range - The variable id-range to clear. If <b>null</b> all variables are cleared.
   */

  VariableStore.prototype.clearPersistentVariables = function(type, range) {
    if (range != null) {
      range = {
        start: range.start,
        end: range.end + 1
      };
    } else {
      range = {
        start: 0,
        end: null
      };
    }
    return this.clearVariables(this.persistentNumbers, this.persistentstrings, this.persistentBooleans, this.persistentLists, type, range);
  };


  /**
  * Initializes the variables. Should be called whenever the context changes. (Like after a scene change)
  *
  * @method setup
  * @param {Object} context - The context(current scene) needed for local variables. Needs have at least an id-property.
   */

  VariableStore.prototype.setup = function(context) {
    this.setupLocalVariables(context);
    return this.setupTempVariables(context);
  };


  /**
  * Initializes the local variables for the specified context. Should be called on first time use.
  *
  * @method setupLocalVariables
  * @param {Object} context - The context(current scene). Needs have at least an id-property.
   */

  VariableStore.prototype.setupLocalVariables = function(context) {
    this.setupVariables(context, "localNumbers", 0);
    this.setupVariables(context, "localStrings", "");
    this.setupVariables(context, "localBooleans", false);
    return this.setupVariables(context, "localLists", []);
  };


  /**
  * Initializes the specified kind of variables.
  *
  * @method setupVariables
  * @param {Object} context - The context(current scene). Needs have at least an id-property.
  * @param {string} property - The kind of variables (property-name).
  * @param {Object} defaultValue - The default value for each variable.
   */

  VariableStore.prototype.setupVariables = function(context, property, defaultValue) {
    if (this[property][context.id] == null) {
      return this[property][context.id] = [];
    }
  };


  /**
  * Initializes the current temp variables for the specified context. Should be called whenever the context changed.
  *
  * @method setupTempVariables
  * @param {Object} context - The context(current scene). Needs have at least an id-property.
   */

  VariableStore.prototype.setupTempVariables = function(context) {
    this.context = context;
    if (!this.localNumbers[context.id]) {
      this.setupLocalVariables(context);
    }
    this.tempNumbers = this.localNumbers[context.id];
    this.tempStrings = this.localStrings[context.id];
    this.tempBooleans = this.localBooleans[context.id];
    return this.tempLists = this.localLists[context.id];
  };

  VariableStore.prototype.clearTempVariables = function(context) {
    this.context = context;
    if (!this.localNumbers[context.id]) {
      this.setupLocalVariables(context);
    }
    this.localNumbers[context.id] = [];
    this.localStrings[context.id] = [];
    this.localBooleans[context.id] = [];
    return this.localLists[context.id] = [];
  };


  /**
  * Gets the index for the variable with the specified name. If a variable with that
  * name cannot be found, the index will be 0.
  *
  * @method indexOfTempVariable
  * @param {string} name - The name of the variable to get the index for.
  * @param {string} type - The type name: number, string, boolean or list.
  * @param {number} scope - The variable scope: 0 = local, 1 = global, 2 = persistent.
  * @param {string} domain - The variable domain to search in. If not specified, the default domain will be used.
   */

  VariableStore.prototype.indexOfVariable = function(name, type, scope, domain) {
    var result;
    result = 0;
    switch (scope) {
      case 0:
        result = this.indexOfTempVariable(name, type);
        break;
      case 1:
        result = this.indexOfGlobalVariable(name, type, domain);
        break;
      case 2:
        result = this.indexOfPersistentVariable(name, type, domain);
    }
    return result;
  };


  /**
  * Gets the index for the local variable with the specified name. If a variable with that
  * name cannot be found, the index will be 0.
  *
  * @method indexOfTempVariable
  * @param {string} name - The name of the variable to get the index for.
  * @param {string} type - The type name: number, string, boolean or list.
   */

  VariableStore.prototype.indexOfTempVariable = function(name, type) {
    var ref, result, variable;
    result = 0;
    if ((ref = this.context) != null ? ref.owner : void 0) {
      if (this.context.owner.sceneDocument) {
        variable = this.context.owner.sceneDocument.items[type + "Variables"].first(function(v) {
          return v.name === name;
        });
        if (variable != null) {
          result = variable.index;
        }
      } else if (this.context.owner[type + "Variables"]) {
        variable = this.context.owner[type + "Variables"].first(function(v) {
          return v.name === name;
        });
        if (variable != null) {
          result = variable.index;
        } else {
          console.warn("Variable referenced by name not found: " + name(+"(local, " + type + ")"));
        }
      }
    }
    return result;
  };


  /**
  * Gets the index for the global variable with the specified name. If a variable with that
  * name cannot be found, the index will be 0.
  *
  * @method indexOfTempVariable
  * @param {string} name - The name of the variable to get the index for.
  * @param {string} type - The type name: number, string, boolean or list.
  * @param {string} domain - The variable domain to search in. If not specified, the default domain will be used.
   */

  VariableStore.prototype.indexOfGlobalVariable = function(name, type, domain) {
    var result, variable, variables, variablesDocument;
    result = 0;
    variables = DataManager.getDocumentsByType("global_variables");
    variablesDocument = variables.first(function(v) {
      return v.items.domain === domain;
    });
    if (variablesDocument == null) {
      variablesDocument = variables[0];
    }
    if (variablesDocument) {
      variable = variablesDocument.items[type + "s"].first(function(v) {
        return v.name === name;
      });
      if (variable) {
        result = variable.index;
      } else {
        console.warn("Variable referenced by name not found: " + name + " (persistent, " + type + ")");
      }
    }
    return result;
  };


  /**
  * Gets the index for the persistent variable with the specified name. If a variable with that
  * name cannot be found, the index will be 0.
  *
  * @method indexOfTempVariable
  * @param {string} name - The name of the variable to get the index for.
  * @param {string} type - The type name: number, string, boolean or list.
  * @param {string} domain - The variable domain to search in. If not specified, the default domain will be used.
   */

  VariableStore.prototype.indexOfPersistentVariable = function(name, type, domain) {
    var result, variable, variables, variablesDocument;
    result = 0;
    variables = DataManager.getDocumentsByType("persistent_variables");
    variablesDocument = variables.first(function(v) {
      return v.items.domain === domain;
    });
    if (variablesDocument == null) {
      variablesDocument = variables[0];
    }
    if (variablesDocument) {
      variable = variablesDocument.items[type + "s"].first(function(v) {
        return v.name === name;
      });
      if (variable != null) {
        result = variable.index;
      } else {
        console.warn("Variable referenced by name not found: " + name + " (persistent, " + type + ")");
      }
    }
    return result;
  };


  /**
  * Sets the value of the number variable at the specified index.
  *
  * @method setNumberValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} type - The variable's index.
  * @param {number} value - The value to set.
   */

  VariableStore.prototype.setNumberValueAtIndex = function(scope, index, value, domain) {
    if (scope === 2) {
      return this.persistentNumbersByDomain[domain][index] = value;
    } else if (scope === 1) {
      return this.numbersByDomain[domain || 0][index] = value;
    } else {
      return this.tempNumbers[index] = value;
    }
  };


  /**
  * Sets the value of a specified number variable.
  *
  * @method setNumberValueAtIndex
  * @param {number} variable - The variable to set.
  * @param {number} value - The value to set.
   */

  VariableStore.prototype.setNumberValueTo = function(variable, value) {
    if (variable.scope === 2) {
      return this.persistentNumbersByDomain[variable.domain || 0][variable.index] = value;
    } else if (variable.scope === 1) {
      return this.numbersByDomain[variable.domain || 0][variable.index] = value;
    } else {
      return this.tempNumbers[variable.index] = value;
    }
  };


  /**
  * Sets the value of a specified list variable.
  *
  * @method setListObjectTo
  * @param {Object} variable - The variable to set.
  * @param {Object} value - The value to set.
   */

  VariableStore.prototype.setListObjectTo = function(variable, value) {
    if (variable.scope === 2) {
      return this.persistentListsByDomain[variable.domain || 0][variable.index] = value;
    } else if (variable.scope === 1) {
      return this.listsByDomain[variable.domain || 0][variable.index] = value;
    } else {
      return this.tempLists[variable.index] = value;
    }
  };


  /**
  * Sets the value of a specified boolean variable.
  *
  * @method setBooleanValueTo
  * @param {Object} variable - The variable to set.
  * @param {boolean} value - The value to set.
   */

  VariableStore.prototype.setBooleanValueTo = function(variable, value) {
    if (variable.scope === 2) {
      return this.persistentBooleansByDomain[variable.domain][variable.index] = value;
    } else if (variable.scope === 1) {
      return this.booleansByDomain[variable.domain][variable.index] = value;
    } else {
      return this.tempBooleans[variable.index] = value;
    }
  };


  /**
  * Sets the value of the boolean variable at the specified index.
  *
  * @method setBooleanValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @param {boolean} value - The value to set.
   */

  VariableStore.prototype.setBooleanValueAtIndex = function(scope, index, value, domain) {
    if (scope === 2) {
      return this.persistentBooleansByDomain[domain][index] = value;
    } else if (scope === 1) {
      return this.booleansByDomain[domain][index] = value;
    } else {
      return this.tempBooleans[index] = value;
    }
  };


  /**
  * Sets the value of a specified string variable.
  *
  * @method setStringValueTo
  * @param {Object} variable - The variable to set.
  * @param {string} value - The value to set.
   */

  VariableStore.prototype.setStringValueTo = function(variable, value) {
    if (variable.scope === 2) {
      return this.persistentStringsByDomain[variable.domain][variable.index] = value;
    } else if (variable.scope === 1) {
      return this.stringsByDomain[variable.domain][variable.index] = value;
    } else {
      return this.tempStrings[variable.index] = value;
    }
  };


  /**
  * Sets the value of the string variable at the specified index.
  *
  * @method setStringValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @param {string} value - The value to set.
   */

  VariableStore.prototype.setStringValueAtIndex = function(scope, index, value, domain) {
    if (scope === 2) {
      return this.persistentStringsByDomain[domain][index] = value;
    } else if (scope === 1) {
      return this.stringsByDomain[domain][index] = value;
    } else {
      return this.tempStrings[index] = value;
    }
  };


  /**
  * Gets the value of a specified list variable.
  *
  * @method listObjectOf
  * @param {Object} object - The list-variable/object to get the value from.
  * @return {Object} The list-object.
   */

  VariableStore.prototype.listObjectOf = function(object) {
    var result;
    result = 0;
    if ((object != null) && (object.index != null)) {
      if (object.scope === 2) {
        result = this.persistentListsByDomain[object.domain][object.index];
      } else if (object.scope === 1) {
        result = this.listsByDomain[object.domain][object.index];
      } else {
        result = this.tempLists[object.index];
      }
    } else {
      result = object;
    }
    return result || [];
  };


  /**
  * Gets the value of a number variable at the specified index.
  *
  * @method numberValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @return {Object} The number value of the variable.
   */

  VariableStore.prototype.numberValueAtIndex = function(scope, index, domain) {
    var result;
    result = 0;
    if (scope === 2) {
      result = this.persistentNumbersByDomain[domain][index];
    } else if (scope === 1) {
      result = this.numbersByDomain[domain][index];
    } else {
      result = this.tempNumbers[index];
    }
    return result || 0;
  };


  /**
  * Gets the value of a specified number variable.
  *
  * @method numberValueOf
  * @param {Object} object - The variable to get the value from.
  * @return {Object} The number value of the variable.
   */

  VariableStore.prototype.numberValueOf = function(object) {
    var result;
    result = 0;
    if ((object != null) && (object.index != null)) {
      if (object.scope === 2) {
        result = this.persistentNumbersByDomain[object.domain][object.index];
      } else if (object.scope === 1) {
        result = this.numbersByDomain[object.domain][object.index];
      } else {
        result = this.tempNumbers[object.index];
      }
    } else {
      result = object;
    }
    return result || 0;
  };


  /**
  * Gets the value of a specified string variable.
  *
  * @method stringValueOf
  * @param {Object} object - The variable to get the value from.
  * @return {string} The string value of the variable.
   */

  VariableStore.prototype.stringValueOf = function(object) {
    var result;
    result = "";
    if ((object != null) && (object.index != null)) {
      if (object.scope === 2) {
        result = this.persistentStringsByDomain[object.domain][object.index];
      } else if (object.scope === 1) {
        result = this.stringsByDomain[object.domain][object.index];
      } else {
        result = this.tempStrings[object.index];
      }
    } else {
      result = object;
    }
    return result || "";
  };


  /**
  * Gets the value of a string variable at the specified index.
  *
  * @method stringValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @return {string} The string value of the variable.
   */

  VariableStore.prototype.stringValueAtIndex = function(scope, index, domain) {
    var result;
    result = "";
    if (scope === 2) {
      result = this.persistentStringsByDomain[domain][index];
    } else if (scope === 1) {
      result = this.stringsByDomain[domain][index];
    } else {
      result = this.tempStrings[index];
    }
    return result || "";
  };


  /**
  * Gets the value of a specified boolean variable.
  *
  * @method booleanValueOf
  * @param {Object} object - The variable to get the value from.
  * @return {Object} The boolean value of the variable.
   */

  VariableStore.prototype.booleanValueOf = function(object) {
    var result;
    result = false;
    if ((object != null) && (object.index != null)) {
      if (object.scope === 2) {
        result = this.persistentBooleansByDomain[object.domain][object.index] || false;
      } else if (object.scope === 1) {
        result = this.booleansByDomain[object.domain][object.index] || false;
      } else {
        result = this.tempBooleans[object.index] || false;
      }
    } else {
      result = object ? true : false;
    }
    return result;
  };


  /**
  * Gets the value of a boolean variable at the specified index.
  *
  * @method booleanValueAtIndex
  * @param {number} scope - The variable scope.
  * @param {number} index - The variable's index.
  * @return {boolean} The boolean value of the variable.
   */

  VariableStore.prototype.booleanValueAtIndex = function(scope, index, domain) {
    var result;
    result = false;
    if (scope === 2) {
      result = this.persistenBooleansByDomain[domain][index] || false;
    } else if (scope === 1) {
      result = this.booleansByDomain[domain][index] || false;
    } else {
      result = this.tempBooleans[index] || false;
    }
    return result;
  };

  return VariableStore;

})();

gs.VariableStore = VariableStore;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07RUFDRixhQUFDLENBQUEsb0JBQUQsR0FBd0IsQ0FBQyxtQkFBRCxFQUFzQixtQkFBdEIsRUFBMkMsb0JBQTNDLEVBQWlFLGlCQUFqRTs7O0FBRXhCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXlCYSx1QkFBQTs7QUFDVDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUVYOzs7Ozs7O0lBT0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFFVjs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUMsRUFBRDs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUNYOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7O0FBQ1o7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFDWDs7Ozs7SUFLQSxJQUFDLENBQUEsS0FBRCxHQUFTOztBQUVUOzs7OztJQUtBLElBQUMsQ0FBQSx1QkFBRCxHQUEyQjs7QUFFM0I7Ozs7O0lBS0EsSUFBQyxDQUFBLDJCQUFELEdBQStCOztBQUUvQjs7Ozs7SUFLQSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7O0FBQ3JCOzs7OztJQUtBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjs7QUFDckI7Ozs7O0lBS0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCOztBQUN0Qjs7Ozs7SUFLQSxJQUFDLENBQUEsZUFBRCxHQUFtQjs7QUFDbkI7Ozs7O0lBS0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7O0FBQ2hCOzs7OztJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCOztBQUNoQjs7Ozs7SUFLQSxJQUFDLENBQUEsYUFBRCxHQUFpQjs7QUFDakI7Ozs7O0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYzs7QUFDZDs7OztJQUlBLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBQ2Y7Ozs7SUFJQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUNmOzs7O0lBSUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7O0FBQ2hCOzs7O0lBSUEsSUFBQyxDQUFBLFNBQUQsR0FBYTtFQWxJSjs7O0FBb0liOzs7Ozs7Ozs7MEJBUUEsbUJBQUEsR0FBcUIsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNqQixRQUFBO0lBQUEsT0FBQSxHQUFVLFdBQVcsQ0FBQyxrQkFBWixDQUErQixrQkFBL0IsQ0FBa0QsQ0FBQyxNQUFuRCxDQUEwRCxTQUFDLENBQUQ7YUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQWYsQ0FBMUQ7QUFFVixTQUFBLGlEQUFBOztNQUNJLElBQUMsQ0FBQSxlQUFnQixDQUFBLE1BQUEsQ0FBakIsR0FBMkIsSUFBQyxDQUFBLGVBQWdCLENBQUEsQ0FBQTtNQUM1QyxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFBLENBQWpCLEdBQTJCLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUE7TUFDNUMsSUFBQyxDQUFBLGdCQUFpQixDQUFBLE1BQUEsQ0FBbEIsR0FBNEIsSUFBQyxDQUFBLGdCQUFpQixDQUFBLENBQUE7TUFDOUMsSUFBQyxDQUFBLGFBQWMsQ0FBQSxNQUFBLENBQWYsR0FBeUIsSUFBQyxDQUFBLGFBQWMsQ0FBQSxDQUFBO0FBSjVDO0FBTUEsV0FBTztFQVRVOzswQkFXckIsa0JBQUEsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFDbkIsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFDbkIsSUFBQyxDQUFBLGdCQUFELEdBQW9CO0lBQ3BCLElBQUMsQ0FBQSxhQUFELEdBQWlCO0FBRWpCO0FBQUEsU0FBQSw2Q0FBQTs7TUFDSSxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxDQUFBLENBQWpCLEdBQTBCLElBQUEsS0FBQSxDQUFNLElBQU47TUFDMUIsSUFBQyxDQUFBLGVBQWdCLENBQUEsTUFBQSxDQUFqQixHQUEyQixJQUFDLENBQUEsZUFBZ0IsQ0FBQSxDQUFBO01BQzVDLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUEsQ0FBakIsR0FBMEIsSUFBQSxLQUFBLENBQU0sSUFBTjtNQUMxQixJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFBLENBQWpCLEdBQTJCLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUE7TUFDNUMsSUFBQyxDQUFBLGdCQUFpQixDQUFBLENBQUEsQ0FBbEIsR0FBMkIsSUFBQSxLQUFBLENBQU0sSUFBTjtNQUMzQixJQUFDLENBQUEsZ0JBQWlCLENBQUEsTUFBQSxDQUFsQixHQUE0QixJQUFDLENBQUEsZ0JBQWlCLENBQUEsQ0FBQTtNQUM5QyxJQUFDLENBQUEsYUFBYyxDQUFBLENBQUEsQ0FBZixHQUF3QixJQUFBLEtBQUEsQ0FBTSxJQUFOO01BQ3hCLElBQUMsQ0FBQSxhQUFjLENBQUEsTUFBQSxDQUFmLEdBQXlCLElBQUMsQ0FBQSxhQUFjLENBQUEsQ0FBQTtBQVI1QztJQVVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLGVBQWdCLENBQUEsQ0FBQTtJQUM1QixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUE7SUFDNUIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsZ0JBQWlCLENBQUEsQ0FBQTtXQUM5QixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxhQUFjLENBQUEsQ0FBQTtFQW5CUjs7MEJBcUJwQixzQkFBQSxHQUF3QixTQUFDLE9BQUQ7QUFDcEIsUUFBQTtJQUFBLElBQUMsQ0FBQSx5QkFBRCxHQUE2QjtJQUM3QixJQUFDLENBQUEseUJBQUQsR0FBNkI7SUFDN0IsSUFBQyxDQUFBLDBCQUFELEdBQThCO0lBQzlCLElBQUMsQ0FBQSx1QkFBRCxHQUEyQjtBQUUzQjtBQUFBLFNBQUEsNkNBQUE7O01BQ0ksSUFBQyxDQUFBLHlCQUEwQixDQUFBLENBQUEsQ0FBM0IsR0FBb0MsSUFBQSxLQUFBLENBQU0sRUFBTjtNQUNwQyxJQUFDLENBQUEseUJBQTBCLENBQUEsTUFBQSxDQUEzQixHQUFxQyxJQUFDLENBQUEsaUJBQWtCLENBQUEsQ0FBQTtNQUN4RCxJQUFDLENBQUEseUJBQTBCLENBQUEsQ0FBQSxDQUEzQixHQUFvQyxJQUFBLEtBQUEsQ0FBTSxFQUFOO01BQ3BDLElBQUMsQ0FBQSx5QkFBMEIsQ0FBQSxNQUFBLENBQTNCLEdBQXFDLElBQUMsQ0FBQSxpQkFBa0IsQ0FBQSxDQUFBO01BQ3hELElBQUMsQ0FBQSwwQkFBMkIsQ0FBQSxDQUFBLENBQTVCLEdBQXFDLElBQUEsS0FBQSxDQUFNLEVBQU47TUFDckMsSUFBQyxDQUFBLDBCQUEyQixDQUFBLE1BQUEsQ0FBNUIsR0FBc0MsSUFBQyxDQUFBLGtCQUFtQixDQUFBLENBQUE7TUFDMUQsSUFBQyxDQUFBLHVCQUF3QixDQUFBLENBQUEsQ0FBekIsR0FBa0MsSUFBQSxLQUFBLENBQU0sRUFBTjtNQUNsQyxJQUFDLENBQUEsdUJBQXdCLENBQUEsTUFBQSxDQUF6QixHQUFtQyxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxDQUFBO0FBUnhEO0lBVUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUMsQ0FBQSx5QkFBMEIsQ0FBQSxDQUFBO0lBQ2hELElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQUFDLENBQUEseUJBQTBCLENBQUEsQ0FBQTtJQUNoRCxJQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFBQyxDQUFBLDBCQUEyQixDQUFBLENBQUE7V0FDbEQsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLHVCQUF3QixDQUFBLENBQUE7RUFuQnhCOzswQkFxQnhCLFlBQUEsR0FBYyxTQUFDLE9BQUQ7SUFDVixJQUFDLENBQUEsT0FBRCxHQUFXO0lBQ1gsSUFBQyxDQUFBLGtCQUFELENBQUE7V0FDQSxJQUFDLENBQUEsc0JBQUQsQ0FBQTtFQUhVOzs7QUFNZDs7OzswQkFHQSxPQUFBLEdBQVMsU0FBQyxLQUFEO0FBQ0wsUUFBQTtJQUFBLE1BQUEsR0FBUyxDQUFDLFNBQUQ7QUFDVDtTQUFBLFVBQUE7TUFDSSxJQUFHLENBQUMsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxZQUFiLENBQUQsSUFBZ0MsTUFBTSxDQUFDLE9BQVAsQ0FBZSxDQUFmLENBQUEsS0FBcUIsQ0FBQyxDQUF6RDtxQkFDSSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsS0FBTSxDQUFBLENBQUEsR0FEcEI7T0FBQSxNQUFBOzZCQUFBOztBQURKOztFQUZLOzs7QUFNVDs7Ozs7Ozs7MEJBT0EsWUFBQSxHQUFjLFNBQUMsTUFBRDtBQUNWLFFBQUE7SUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsZUFBQSxHQUFrQixJQUFDLENBQUEsdUJBQXdCLENBQUEsTUFBQTtJQUMzQyxtQkFBQSxHQUFzQixJQUFDLENBQUEsMkJBQTRCLENBQUEsTUFBQTtJQUVuRCxJQUFHLENBQUMsZUFBSjtNQUNJLGVBQUEsR0FBa0IsSUFBQyxDQUFBLHVCQUF3QixDQUFBLE1BQUEsQ0FBekIsR0FBbUM7UUFBRSxPQUFBLEVBQWEsSUFBQSxLQUFBLENBQU0sR0FBTixDQUFmO1FBQTJCLE9BQUEsRUFBYSxJQUFBLEtBQUEsQ0FBTSxHQUFOLENBQXhDO1FBQW9ELFFBQUEsRUFBYyxJQUFBLEtBQUEsQ0FBTSxHQUFOLENBQWxFO1FBQThFLEtBQUEsRUFBVyxJQUFBLEtBQUEsQ0FBTSxHQUFOLENBQXpGO1FBRHpEOztJQUVBLElBQUcsQ0FBQyxtQkFBSjtNQUNJLG1CQUFBLEdBQXNCLElBQUMsQ0FBQSwyQkFBNEIsQ0FBQSxNQUFBLENBQTdCLEdBQXVDO1FBQUUsT0FBQSxFQUFhLElBQUEsS0FBQSxDQUFNLEdBQU4sQ0FBZjtRQUEyQixPQUFBLEVBQWEsSUFBQSxLQUFBLENBQU0sR0FBTixDQUF4QztRQUFvRCxRQUFBLEVBQWMsSUFBQSxLQUFBLENBQU0sR0FBTixDQUFsRTtRQUE4RSxLQUFBLEVBQVcsSUFBQSxLQUFBLENBQU0sR0FBTixDQUF6RjtRQURqRTs7SUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXLGVBQWUsQ0FBQztJQUMzQixJQUFDLENBQUEsT0FBRCxHQUFXLGVBQWUsQ0FBQztJQUMzQixJQUFDLENBQUEsUUFBRCxHQUFZLGVBQWUsQ0FBQztJQUM1QixJQUFDLENBQUEsS0FBRCxHQUFTLGVBQWUsQ0FBQztJQUN6QixJQUFDLENBQUEsaUJBQUQsR0FBcUIsbUJBQW1CLENBQUM7SUFDekMsSUFBQyxDQUFBLGtCQUFELEdBQXNCLG1CQUFtQixDQUFDO0lBQzFDLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixtQkFBbUIsQ0FBQztXQUN6QyxJQUFDLENBQUEsZUFBRCxHQUFtQixtQkFBbUIsQ0FBQztFQWpCN0I7OztBQW1CZDs7Ozs7OzBCQUtBLHVCQUFBLEdBQXlCLFNBQUE7QUFDckIsUUFBQTtJQUFBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO0FBQ0E7SUFFQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSx1QkFBd0IsQ0FBQSxJQUFDLENBQUEsTUFBRDtJQUMzQyxJQUFDLENBQUEsZUFBRCxHQUF1QixJQUFBLEtBQUEsQ0FBTSxJQUFOO0lBQ3ZCLGVBQWUsQ0FBQyxRQUFoQixHQUErQixJQUFBLEtBQUEsQ0FBTSxJQUFOO0lBQy9CLGVBQWUsQ0FBQyxPQUFoQixHQUE4QixJQUFBLEtBQUEsQ0FBTSxJQUFOO0lBRTlCLElBQUMsQ0FBQSxPQUFELEdBQVcsZUFBZSxDQUFDO0lBQzNCLElBQUMsQ0FBQSxPQUFELEdBQVcsZUFBZSxDQUFDO1dBQzNCLElBQUMsQ0FBQSxRQUFELEdBQVksZUFBZSxDQUFDO0VBWFA7OztBQWF6Qjs7Ozs7OzBCQUtBLHNCQUFBLEdBQXdCLFNBQUE7SUFDcEIsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7SUFDaEIsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7SUFDaEIsSUFBQyxDQUFBLGFBQUQsR0FBaUI7V0FDakIsSUFBQyxDQUFBLFVBQUQsR0FBYztFQUpNOzs7QUFNeEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBa0JBLGNBQUEsR0FBZ0IsU0FBQyxPQUFELEVBQVUsT0FBVixFQUFtQixRQUFuQixFQUE2QixLQUE3QixFQUFvQyxJQUFwQyxFQUEwQyxLQUExQztBQUNaLFlBQU8sSUFBUDtBQUFBLFdBQ1MsQ0FEVDs7VUFFUSxPQUFPLENBQUUsSUFBVCxDQUFjLENBQWQsRUFBaUIsS0FBSyxDQUFDLEtBQXZCLEVBQThCLEtBQUssQ0FBQyxHQUFwQzs7O1VBQ0EsT0FBTyxDQUFFLElBQVQsQ0FBYyxFQUFkLEVBQWtCLEtBQUssQ0FBQyxLQUF4QixFQUErQixLQUFLLENBQUMsR0FBckM7OztVQUNBLFFBQVEsQ0FBRSxJQUFWLENBQWUsS0FBZixFQUFzQixLQUFLLENBQUMsS0FBNUIsRUFBbUMsS0FBSyxDQUFDLEdBQXpDOzsrQkFDQSxLQUFLLENBQUUsSUFBUCxDQUFZLEVBQVosRUFBZ0IsS0FBSyxDQUFDLEtBQXRCLEVBQTZCLEtBQUssQ0FBQyxHQUFuQztBQUxSLFdBTVMsQ0FOVDtrQ0FPUSxRQUFRLENBQUUsSUFBVixDQUFlLEtBQWYsRUFBc0IsS0FBSyxDQUFDLEtBQTVCLEVBQW1DLEtBQUssQ0FBQyxHQUF6QztBQVBSLFdBUVMsQ0FSVDtpQ0FTUSxPQUFPLENBQUUsSUFBVCxDQUFjLENBQWQsRUFBaUIsS0FBSyxDQUFDLEtBQXZCLEVBQThCLEtBQUssQ0FBQyxHQUFwQztBQVRSLFdBVVMsQ0FWVDtpQ0FXUSxPQUFPLENBQUUsSUFBVCxDQUFjLEVBQWQsRUFBa0IsS0FBSyxDQUFDLEtBQXhCLEVBQStCLEtBQUssQ0FBQyxHQUFyQztBQVhSLFdBWVMsQ0FaVDsrQkFhUSxLQUFLLENBQUUsSUFBUCxDQUFZLEVBQVosRUFBZ0IsS0FBSyxDQUFDLEtBQXRCLEVBQTZCLEtBQUssQ0FBQyxHQUFuQztBQWJSO0VBRFk7OztBQWdCaEI7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQWdCQSxtQkFBQSxHQUFxQixTQUFDLE9BQUQsRUFBVSxJQUFWLEVBQWdCLEtBQWhCO0FBQ2pCLFFBQUE7SUFBQSxJQUFHLGVBQUg7TUFDSSxHQUFBLEdBQU0sQ0FBQyxPQUFPLENBQUMsRUFBVCxFQURWO0tBQUEsTUFBQTtNQUdJLEdBQUEsR0FBTSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxZQUFiLEVBSFY7O0lBS0EsSUFBRyxhQUFIO01BQ0ksS0FBQSxHQUFRO1FBQUEsS0FBQSxFQUFPLEtBQUssQ0FBQyxLQUFiO1FBQW9CLEdBQUEsRUFBSyxLQUFLLENBQUMsR0FBTixHQUFZLENBQXJDO1FBRFo7S0FBQSxNQUFBO01BR0ksS0FBQSxHQUFRO1FBQUEsS0FBQSxFQUFPLENBQVA7UUFBVSxHQUFBLEVBQUssSUFBZjtRQUhaOztBQUtBO1NBQUEscUNBQUE7O21CQUNJLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQUMsQ0FBQSxZQUFhLENBQUEsRUFBQSxDQUE5QixFQUFtQyxJQUFDLENBQUEsWUFBYSxDQUFBLEVBQUEsQ0FBakQsRUFBc0QsSUFBQyxDQUFBLGFBQWMsQ0FBQSxFQUFBLENBQXJFLEVBQTBFLElBQUMsQ0FBQSxVQUFXLENBQUEsRUFBQSxDQUF0RixFQUEyRixJQUEzRixFQUFpRyxLQUFqRztBQURKOztFQVhpQjs7O0FBY3JCOzs7Ozs7Ozs7Ozs7Ozs7MEJBY0Esb0JBQUEsR0FBc0IsU0FBQyxJQUFELEVBQU8sS0FBUDtJQUNsQixJQUFHLGFBQUg7TUFDSSxLQUFBLEdBQVE7UUFBQSxLQUFBLEVBQU8sS0FBSyxDQUFDLEtBQWI7UUFBb0IsR0FBQSxFQUFLLEtBQUssQ0FBQyxHQUFOLEdBQVksQ0FBckM7UUFEWjtLQUFBLE1BQUE7TUFHSSxLQUFBLEdBQVE7UUFBQSxLQUFBLEVBQU8sQ0FBUDtRQUFVLEdBQUEsRUFBSyxJQUFmO1FBSFo7O1dBS0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLE9BQWpCLEVBQTBCLElBQUMsQ0FBQSxPQUEzQixFQUFvQyxJQUFDLENBQUEsUUFBckMsRUFBK0MsSUFBQyxDQUFBLEtBQWhELEVBQXVELElBQXZELEVBQTZELEtBQTdEO0VBTmtCOzs7QUFRdEI7Ozs7Ozs7Ozs7Ozs7OzswQkFjQSx3QkFBQSxHQUEwQixTQUFDLElBQUQsRUFBTyxLQUFQO0lBQ3RCLElBQUcsYUFBSDtNQUNJLEtBQUEsR0FBUTtRQUFBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FBYjtRQUFvQixHQUFBLEVBQUssS0FBSyxDQUFDLEdBQU4sR0FBWSxDQUFyQztRQURaO0tBQUEsTUFBQTtNQUdJLEtBQUEsR0FBUTtRQUFBLEtBQUEsRUFBTyxDQUFQO1FBQVUsR0FBQSxFQUFLLElBQWY7UUFIWjs7V0FLQSxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFDLENBQUEsaUJBQWpCLEVBQW9DLElBQUMsQ0FBQSxpQkFBckMsRUFBd0QsSUFBQyxDQUFBLGtCQUF6RCxFQUE2RSxJQUFDLENBQUEsZUFBOUUsRUFBK0YsSUFBL0YsRUFBcUcsS0FBckc7RUFOc0I7OztBQVExQjs7Ozs7OzswQkFNQSxLQUFBLEdBQU8sU0FBQyxPQUFEO0lBQ0gsSUFBQyxDQUFBLG1CQUFELENBQXFCLE9BQXJCO1dBQ0EsSUFBQyxDQUFBLGtCQUFELENBQW9CLE9BQXBCO0VBRkc7OztBQUtQOzs7Ozs7OzBCQU1BLG1CQUFBLEdBQXFCLFNBQUMsT0FBRDtJQUNqQixJQUFDLENBQUEsY0FBRCxDQUFnQixPQUFoQixFQUF5QixjQUF6QixFQUF5QyxDQUF6QztJQUNBLElBQUMsQ0FBQSxjQUFELENBQWdCLE9BQWhCLEVBQXlCLGNBQXpCLEVBQXlDLEVBQXpDO0lBQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsT0FBaEIsRUFBeUIsZUFBekIsRUFBMEMsS0FBMUM7V0FDQSxJQUFDLENBQUEsY0FBRCxDQUFnQixPQUFoQixFQUF5QixZQUF6QixFQUF1QyxFQUF2QztFQUppQjs7O0FBTXJCOzs7Ozs7Ozs7MEJBUUEsY0FBQSxHQUFnQixTQUFDLE9BQUQsRUFBVSxRQUFWLEVBQW9CLFlBQXBCO0lBQ1osSUFBTyxrQ0FBUDthQUNJLElBQUssQ0FBQSxRQUFBLENBQVUsQ0FBQSxPQUFPLENBQUMsRUFBUixDQUFmLEdBQTZCLEdBRGpDOztFQURZOzs7QUFLaEI7Ozs7Ozs7MEJBTUEsa0JBQUEsR0FBb0IsU0FBQyxPQUFEO0lBQ2hCLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFDWCxJQUFHLENBQUMsSUFBQyxDQUFBLFlBQWEsQ0FBQSxPQUFPLENBQUMsRUFBUixDQUFsQjtNQUNJLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixPQUFyQixFQURKOztJQUdBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLFlBQWEsQ0FBQSxPQUFPLENBQUMsRUFBUjtJQUM3QixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxZQUFhLENBQUEsT0FBTyxDQUFDLEVBQVI7SUFDN0IsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLGFBQWMsQ0FBQSxPQUFPLENBQUMsRUFBUjtXQUMvQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxVQUFXLENBQUEsT0FBTyxDQUFDLEVBQVI7RUFSVDs7MEJBVXBCLGtCQUFBLEdBQW9CLFNBQUMsT0FBRDtJQUNoQixJQUFDLENBQUEsT0FBRCxHQUFXO0lBQ1gsSUFBRyxDQUFDLElBQUMsQ0FBQSxZQUFhLENBQUEsT0FBTyxDQUFDLEVBQVIsQ0FBbEI7TUFDSSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsT0FBckIsRUFESjs7SUFHQSxJQUFDLENBQUEsWUFBYSxDQUFBLE9BQU8sQ0FBQyxFQUFSLENBQWQsR0FBNEI7SUFDNUIsSUFBQyxDQUFBLFlBQWEsQ0FBQSxPQUFPLENBQUMsRUFBUixDQUFkLEdBQTRCO0lBQzVCLElBQUMsQ0FBQSxhQUFjLENBQUEsT0FBTyxDQUFDLEVBQVIsQ0FBZixHQUE2QjtXQUM3QixJQUFDLENBQUEsVUFBVyxDQUFBLE9BQU8sQ0FBQyxFQUFSLENBQVosR0FBMEI7RUFSVjs7O0FBVXBCOzs7Ozs7Ozs7OzswQkFVQSxlQUFBLEdBQWlCLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxLQUFiLEVBQW9CLE1BQXBCO0FBQ2IsUUFBQTtJQUFBLE1BQUEsR0FBUztBQUVULFlBQU8sS0FBUDtBQUFBLFdBQ1MsQ0FEVDtRQUVRLE1BQUEsR0FBUyxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsSUFBckIsRUFBMkIsSUFBM0I7QUFEUjtBQURULFdBR1MsQ0FIVDtRQUlRLE1BQUEsR0FBUyxJQUFDLENBQUEscUJBQUQsQ0FBdUIsSUFBdkIsRUFBNkIsSUFBN0IsRUFBbUMsTUFBbkM7QUFEUjtBQUhULFdBS1MsQ0FMVDtRQU1RLE1BQUEsR0FBUyxJQUFDLENBQUEseUJBQUQsQ0FBMkIsSUFBM0IsRUFBaUMsSUFBakMsRUFBdUMsTUFBdkM7QUFOakI7QUFRQSxXQUFPO0VBWE07OztBQWFqQjs7Ozs7Ozs7OzBCQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLElBQVA7QUFDakIsUUFBQTtJQUFBLE1BQUEsR0FBUztJQUVULHNDQUFXLENBQUUsY0FBYjtNQUNJLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBbEI7UUFDSSxRQUFBLEdBQVcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQU0sQ0FBQSxJQUFBLEdBQU8sV0FBUCxDQUFtQixDQUFDLEtBQXZELENBQTZELFNBQUMsQ0FBRDtpQkFBTyxDQUFDLENBQUMsSUFBRixLQUFVO1FBQWpCLENBQTdEO1FBQ1gsSUFBMkIsZ0JBQTNCO1VBQUEsTUFBQSxHQUFTLFFBQVEsQ0FBQyxNQUFsQjtTQUZKO09BQUEsTUFHSyxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBTSxDQUFBLElBQUEsR0FBTyxXQUFQLENBQWxCO1FBQ0QsUUFBQSxHQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBTSxDQUFBLElBQUEsR0FBTyxXQUFQLENBQW1CLENBQUMsS0FBbkMsQ0FBeUMsU0FBQyxDQUFEO2lCQUFPLENBQUMsQ0FBQyxJQUFGLEtBQVU7UUFBakIsQ0FBekM7UUFFWCxJQUFHLGdCQUFIO1VBQ0ksTUFBQSxHQUFTLFFBQVEsQ0FBQyxNQUR0QjtTQUFBLE1BQUE7VUFHSSxPQUFPLENBQUMsSUFBUixDQUFhLHlDQUFBLEdBQTRDLElBQUEsQ0FBSyxDQUFDLFVBQUQsR0FBWSxJQUFaLEdBQWlCLEdBQXRCLENBQXpELEVBSEo7U0FIQztPQUpUOztBQVlBLFdBQU87RUFmVTs7O0FBaUJyQjs7Ozs7Ozs7OzswQkFTQSxxQkFBQSxHQUF1QixTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsTUFBYjtBQUNuQixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsU0FBQSxHQUFZLFdBQVcsQ0FBQyxrQkFBWixDQUErQixrQkFBL0I7SUFDWixpQkFBQSxHQUFvQixTQUFTLENBQUMsS0FBVixDQUFnQixTQUFDLENBQUQ7YUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQVIsS0FBa0I7SUFBekIsQ0FBaEI7O01BQ3BCLG9CQUFxQixTQUFVLENBQUEsQ0FBQTs7SUFFL0IsSUFBRyxpQkFBSDtNQUNJLFFBQUEsR0FBVyxpQkFBaUIsQ0FBQyxLQUFNLENBQUEsSUFBQSxHQUFPLEdBQVAsQ0FBVyxDQUFDLEtBQXBDLENBQTBDLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxJQUFGLEtBQVU7TUFBakIsQ0FBMUM7TUFDWCxJQUFHLFFBQUg7UUFDSSxNQUFBLEdBQVMsUUFBUSxDQUFDLE1BRHRCO09BQUEsTUFBQTtRQUdJLE9BQU8sQ0FBQyxJQUFSLENBQWEseUNBQUEsR0FBMEMsSUFBMUMsR0FBK0MsZ0JBQS9DLEdBQStELElBQS9ELEdBQW9FLEdBQWpGLEVBSEo7T0FGSjs7QUFPQSxXQUFPO0VBYlk7OztBQWV2Qjs7Ozs7Ozs7OzswQkFTQSx5QkFBQSxHQUEyQixTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsTUFBYjtBQUN2QixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsU0FBQSxHQUFZLFdBQVcsQ0FBQyxrQkFBWixDQUErQixzQkFBL0I7SUFDWixpQkFBQSxHQUFvQixTQUFTLENBQUMsS0FBVixDQUFnQixTQUFDLENBQUQ7YUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQVIsS0FBa0I7SUFBekIsQ0FBaEI7O01BQ3BCLG9CQUFxQixTQUFVLENBQUEsQ0FBQTs7SUFFL0IsSUFBRyxpQkFBSDtNQUNJLFFBQUEsR0FBVyxpQkFBaUIsQ0FBQyxLQUFNLENBQUEsSUFBQSxHQUFPLEdBQVAsQ0FBVyxDQUFDLEtBQXBDLENBQTBDLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxJQUFGLEtBQVU7TUFBakIsQ0FBMUM7TUFDWCxJQUFHLGdCQUFIO1FBQ0ksTUFBQSxHQUFTLFFBQVEsQ0FBQyxNQUR0QjtPQUFBLE1BQUE7UUFHSSxPQUFPLENBQUMsSUFBUixDQUFhLHlDQUFBLEdBQTBDLElBQTFDLEdBQStDLGdCQUEvQyxHQUErRCxJQUEvRCxHQUFvRSxHQUFqRixFQUhKO09BRko7O0FBT0EsV0FBTztFQWJnQjs7O0FBZTNCOzs7Ozs7Ozs7MEJBUUEscUJBQUEsR0FBdUIsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsTUFBdEI7SUFDbkIsSUFBRyxLQUFBLEtBQVMsQ0FBWjthQUNJLElBQUMsQ0FBQSx5QkFBMEIsQ0FBQSxNQUFBLENBQVEsQ0FBQSxLQUFBLENBQW5DLEdBQTRDLE1BRGhEO0tBQUEsTUFFSyxJQUFHLEtBQUEsS0FBUyxDQUFaO2FBQ0QsSUFBQyxDQUFBLGVBQWdCLENBQUEsTUFBQSxJQUFRLENBQVIsQ0FBVyxDQUFBLEtBQUEsQ0FBNUIsR0FBcUMsTUFEcEM7S0FBQSxNQUFBO2FBR0QsSUFBQyxDQUFBLFdBQVksQ0FBQSxLQUFBLENBQWIsR0FBc0IsTUFIckI7O0VBSGM7OztBQVF2Qjs7Ozs7Ozs7MEJBT0EsZ0JBQUEsR0FBa0IsU0FBQyxRQUFELEVBQVcsS0FBWDtJQUNkLElBQUcsUUFBUSxDQUFDLEtBQVQsS0FBa0IsQ0FBckI7YUFDSSxJQUFDLENBQUEseUJBQTBCLENBQUEsUUFBUSxDQUFDLE1BQVQsSUFBaUIsQ0FBakIsQ0FBb0IsQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUEvQyxHQUFpRSxNQURyRTtLQUFBLE1BRUssSUFBRyxRQUFRLENBQUMsS0FBVCxLQUFrQixDQUFyQjthQUNELElBQUMsQ0FBQSxlQUFnQixDQUFBLFFBQVEsQ0FBQyxNQUFULElBQWlCLENBQWpCLENBQW9CLENBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBckMsR0FBdUQsTUFEdEQ7S0FBQSxNQUFBO2FBR0QsSUFBQyxDQUFBLFdBQVksQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUFiLEdBQStCLE1BSDlCOztFQUhTOzs7QUFRbEI7Ozs7Ozs7OzBCQU9BLGVBQUEsR0FBaUIsU0FBQyxRQUFELEVBQVcsS0FBWDtJQUNiLElBQUcsUUFBUSxDQUFDLEtBQVQsS0FBa0IsQ0FBckI7YUFDSSxJQUFDLENBQUEsdUJBQXdCLENBQUEsUUFBUSxDQUFDLE1BQVQsSUFBaUIsQ0FBakIsQ0FBb0IsQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUE3QyxHQUErRCxNQURuRTtLQUFBLE1BRUssSUFBRyxRQUFRLENBQUMsS0FBVCxLQUFrQixDQUFyQjthQUNELElBQUMsQ0FBQSxhQUFjLENBQUEsUUFBUSxDQUFDLE1BQVQsSUFBaUIsQ0FBakIsQ0FBb0IsQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUFuQyxHQUFxRCxNQURwRDtLQUFBLE1BQUE7YUFHRCxJQUFDLENBQUEsU0FBVSxDQUFBLFFBQVEsQ0FBQyxLQUFULENBQVgsR0FBNkIsTUFINUI7O0VBSFE7OztBQVNqQjs7Ozs7Ozs7MEJBT0EsaUJBQUEsR0FBbUIsU0FBQyxRQUFELEVBQVcsS0FBWDtJQUNmLElBQUcsUUFBUSxDQUFDLEtBQVQsS0FBa0IsQ0FBckI7YUFDSSxJQUFDLENBQUEsMEJBQTJCLENBQUEsUUFBUSxDQUFDLE1BQVQsQ0FBaUIsQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUE3QyxHQUErRCxNQURuRTtLQUFBLE1BRUssSUFBRyxRQUFRLENBQUMsS0FBVCxLQUFrQixDQUFyQjthQUNELElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxRQUFRLENBQUMsTUFBVCxDQUFpQixDQUFBLFFBQVEsQ0FBQyxLQUFULENBQW5DLEdBQXFELE1BRHBEO0tBQUEsTUFBQTthQUdELElBQUMsQ0FBQSxZQUFhLENBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBZCxHQUFnQyxNQUgvQjs7RUFIVTs7O0FBUW5COzs7Ozs7Ozs7MEJBUUEsc0JBQUEsR0FBd0IsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsTUFBdEI7SUFDcEIsSUFBRyxLQUFBLEtBQVMsQ0FBWjthQUNJLElBQUMsQ0FBQSwwQkFBMkIsQ0FBQSxNQUFBLENBQVEsQ0FBQSxLQUFBLENBQXBDLEdBQTZDLE1BRGpEO0tBQUEsTUFFSyxJQUFHLEtBQUEsS0FBUyxDQUFaO2FBQ0QsSUFBQyxDQUFBLGdCQUFpQixDQUFBLE1BQUEsQ0FBUSxDQUFBLEtBQUEsQ0FBMUIsR0FBbUMsTUFEbEM7S0FBQSxNQUFBO2FBR0QsSUFBQyxDQUFBLFlBQWEsQ0FBQSxLQUFBLENBQWQsR0FBdUIsTUFIdEI7O0VBSGU7OztBQVF4Qjs7Ozs7Ozs7MEJBT0EsZ0JBQUEsR0FBa0IsU0FBQyxRQUFELEVBQVcsS0FBWDtJQUNkLElBQUcsUUFBUSxDQUFDLEtBQVQsS0FBa0IsQ0FBckI7YUFDSSxJQUFDLENBQUEseUJBQTBCLENBQUEsUUFBUSxDQUFDLE1BQVQsQ0FBaUIsQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUE1QyxHQUE4RCxNQURsRTtLQUFBLE1BRUssSUFBRyxRQUFRLENBQUMsS0FBVCxLQUFrQixDQUFyQjthQUNELElBQUMsQ0FBQSxlQUFnQixDQUFBLFFBQVEsQ0FBQyxNQUFULENBQWlCLENBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBbEMsR0FBb0QsTUFEbkQ7S0FBQSxNQUFBO2FBR0QsSUFBQyxDQUFBLFdBQVksQ0FBQSxRQUFRLENBQUMsS0FBVCxDQUFiLEdBQStCLE1BSDlCOztFQUhTOzs7QUFRbEI7Ozs7Ozs7OzswQkFRQSxxQkFBQSxHQUF1QixTQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixNQUF0QjtJQUNuQixJQUFHLEtBQUEsS0FBUyxDQUFaO2FBQ0ksSUFBQyxDQUFBLHlCQUEwQixDQUFBLE1BQUEsQ0FBUSxDQUFBLEtBQUEsQ0FBbkMsR0FBNEMsTUFEaEQ7S0FBQSxNQUVLLElBQUcsS0FBQSxLQUFTLENBQVo7YUFDRCxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFBLENBQVEsQ0FBQSxLQUFBLENBQXpCLEdBQWtDLE1BRGpDO0tBQUEsTUFBQTthQUdELElBQUMsQ0FBQSxXQUFZLENBQUEsS0FBQSxDQUFiLEdBQXNCLE1BSHJCOztFQUhjOzs7QUFRdkI7Ozs7Ozs7OzBCQU9BLFlBQUEsR0FBYyxTQUFDLE1BQUQ7QUFDVixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsSUFBRyxnQkFBQSxJQUFZLHNCQUFmO01BQ0ksSUFBRyxNQUFNLENBQUMsS0FBUCxLQUFnQixDQUFuQjtRQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEsdUJBQXdCLENBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBZSxDQUFBLE1BQU0sQ0FBQyxLQUFQLEVBRHJEO09BQUEsTUFFSyxJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLENBQW5CO1FBQ0QsTUFBQSxHQUFTLElBQUMsQ0FBQSxhQUFjLENBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBZSxDQUFBLE1BQU0sQ0FBQyxLQUFQLEVBRHRDO09BQUEsTUFBQTtRQUdELE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBVSxDQUFBLE1BQU0sQ0FBQyxLQUFQLEVBSG5CO09BSFQ7S0FBQSxNQUFBO01BUUksTUFBQSxHQUFTLE9BUmI7O0FBVUEsV0FBTyxNQUFBLElBQVU7RUFaUDs7O0FBY2Q7Ozs7Ozs7OzswQkFRQSxrQkFBQSxHQUFvQixTQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsTUFBZjtBQUNoQixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBRVQsSUFBRyxLQUFBLEtBQVMsQ0FBWjtNQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEseUJBQTBCLENBQUEsTUFBQSxDQUFRLENBQUEsS0FBQSxFQURoRDtLQUFBLE1BRUssSUFBRyxLQUFBLEtBQVMsQ0FBWjtNQUNELE1BQUEsR0FBUyxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFBLENBQVEsQ0FBQSxLQUFBLEVBRGpDO0tBQUEsTUFBQTtNQUdELE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBWSxDQUFBLEtBQUEsRUFIckI7O0FBS0wsV0FBTyxNQUFBLElBQVU7RUFWRDs7O0FBWXBCOzs7Ozs7OzswQkFPQSxhQUFBLEdBQWUsU0FBQyxNQUFEO0FBQ1gsUUFBQTtJQUFBLE1BQUEsR0FBUztJQUNULElBQUcsZ0JBQUEsSUFBWSxzQkFBZjtNQUNJLElBQUcsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsQ0FBbkI7UUFDSSxNQUFBLEdBQVMsSUFBQyxDQUFBLHlCQUEwQixDQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWUsQ0FBQSxNQUFNLENBQUMsS0FBUCxFQUR2RDtPQUFBLE1BRUssSUFBRyxNQUFNLENBQUMsS0FBUCxLQUFnQixDQUFuQjtRQUNELE1BQUEsR0FBUyxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFNLENBQUMsTUFBUCxDQUFlLENBQUEsTUFBTSxDQUFDLEtBQVAsRUFEeEM7T0FBQSxNQUFBO1FBR0QsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFZLENBQUEsTUFBTSxDQUFDLEtBQVAsRUFIckI7T0FIVDtLQUFBLE1BQUE7TUFTSSxNQUFBLEdBQVMsT0FUYjs7QUFXQSxXQUFPLE1BQUEsSUFBVTtFQWJOOzs7QUFlZjs7Ozs7Ozs7MEJBT0EsYUFBQSxHQUFlLFNBQUMsTUFBRDtBQUNYLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxJQUFHLGdCQUFBLElBQVksc0JBQWY7TUFDSSxJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLENBQW5CO1FBQ0ksTUFBQSxHQUFTLElBQUMsQ0FBQSx5QkFBMEIsQ0FBQSxNQUFNLENBQUMsTUFBUCxDQUFlLENBQUEsTUFBTSxDQUFDLEtBQVAsRUFEdkQ7T0FBQSxNQUVLLElBQUcsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsQ0FBbkI7UUFDRCxNQUFBLEdBQVMsSUFBQyxDQUFBLGVBQWdCLENBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBZSxDQUFBLE1BQU0sQ0FBQyxLQUFQLEVBRHhDO09BQUEsTUFBQTtRQUdELE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBWSxDQUFBLE1BQU0sQ0FBQyxLQUFQLEVBSHJCO09BSFQ7S0FBQSxNQUFBO01BUUksTUFBQSxHQUFTLE9BUmI7O0FBVUEsV0FBTyxNQUFBLElBQVU7RUFaTjs7O0FBY2Y7Ozs7Ozs7OzswQkFRQSxrQkFBQSxHQUFvQixTQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsTUFBZjtBQUNoQixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBRVQsSUFBRyxLQUFBLEtBQVMsQ0FBWjtNQUNJLE1BQUEsR0FBUyxJQUFDLENBQUEseUJBQTBCLENBQUEsTUFBQSxDQUFRLENBQUEsS0FBQSxFQURoRDtLQUFBLE1BRUssSUFBRyxLQUFBLEtBQVMsQ0FBWjtNQUNELE1BQUEsR0FBUyxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxNQUFBLENBQVEsQ0FBQSxLQUFBLEVBRGpDO0tBQUEsTUFBQTtNQUdELE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBWSxDQUFBLEtBQUEsRUFIckI7O0FBS0wsV0FBTyxNQUFBLElBQVU7RUFWRDs7O0FBWXBCOzs7Ozs7OzswQkFPQSxjQUFBLEdBQWdCLFNBQUMsTUFBRDtBQUNaLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxJQUFHLGdCQUFBLElBQVksc0JBQWY7TUFDSSxJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLENBQW5CO1FBQ0ksTUFBQSxHQUFTLElBQUMsQ0FBQSwwQkFBMkIsQ0FBQSxNQUFNLENBQUMsTUFBUCxDQUFlLENBQUEsTUFBTSxDQUFDLEtBQVAsQ0FBM0MsSUFBNEQsTUFEekU7T0FBQSxNQUVLLElBQUcsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsQ0FBbkI7UUFDRCxNQUFBLEdBQVMsSUFBQyxDQUFBLGdCQUFpQixDQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWUsQ0FBQSxNQUFNLENBQUMsS0FBUCxDQUFqQyxJQUFrRCxNQUQxRDtPQUFBLE1BQUE7UUFHRCxNQUFBLEdBQVMsSUFBQyxDQUFBLFlBQWEsQ0FBQSxNQUFNLENBQUMsS0FBUCxDQUFkLElBQStCLE1BSHZDO09BSFQ7S0FBQSxNQUFBO01BU0ksTUFBQSxHQUFZLE1BQUgsR0FBZSxJQUFmLEdBQXlCLE1BVHRDOztBQVdBLFdBQU87RUFiSzs7O0FBZWhCOzs7Ozs7Ozs7MEJBUUEsbUJBQUEsR0FBcUIsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLE1BQWY7QUFDakIsUUFBQTtJQUFBLE1BQUEsR0FBUztJQUVULElBQUcsS0FBQSxLQUFTLENBQVo7TUFDSSxNQUFBLEdBQVMsSUFBQyxDQUFBLHlCQUEwQixDQUFBLE1BQUEsQ0FBUSxDQUFBLEtBQUEsQ0FBbkMsSUFBNkMsTUFEMUQ7S0FBQSxNQUVLLElBQUcsS0FBQSxLQUFTLENBQVo7TUFDRCxNQUFBLEdBQVMsSUFBQyxDQUFBLGdCQUFpQixDQUFBLE1BQUEsQ0FBUSxDQUFBLEtBQUEsQ0FBMUIsSUFBb0MsTUFENUM7S0FBQSxNQUFBO01BR0QsTUFBQSxHQUFTLElBQUMsQ0FBQSxZQUFhLENBQUEsS0FBQSxDQUFkLElBQXdCLE1BSGhDOztBQUtMLFdBQU87RUFWVTs7Ozs7O0FBWXpCLEVBQUUsQ0FBQyxhQUFILEdBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBWYXJpYWJsZVN0b3JlXG4jXG4jICAgJCRDT1BZUklHSFQkJFxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBWYXJpYWJsZVN0b3JlXG4gICAgQG9iamVjdENvZGVjQmxhY2tMaXN0ID0gW1wicGVyc2lzdGVudE51bWJlcnNcIiwgXCJwZXJzaXN0ZW50U3RyaW5nc1wiLCBcInBlcnNpc3RlbnRCb29sZWFuc1wiLCBcInBlcnNpc3RlbnRMaXN0c1wiXVxuXG4gICAgIyMjKlxuICAgICogPHA+QSBzdG9yYWdlIGZvciBkaWZmZXJlbnQga2luZCBvZiBnYW1lIHZhcmlhYmxlcy4gVGhlIGZvbGxvd2luZyBzY29wZXNcbiAgICAqIGZvciB2YXJpYWJsZXMgZXhpc3Q6PC9wPlxuICAgICpcbiAgICAqIC0gTG9jYWwgVmFyaWFibGVzIC0+IE9ubHkgdmFsaWQgZm9yIHRoZSBjdXJyZW50IHNjZW5lLlxuICAgICogLSBHbG9iYWwgVmFyaWFibGVzIC0+IFZhbGlkIGZvciB0aGUgd2hvbGUgZ2FtZSBidXQgYm91bmQgdG8gYSBzaW5nbGUgc2F2ZS1nYW1lLlxuICAgICogLSBQZXJzaXN0ZW50IFZhcmlhYmxlcyAtPiBWYWxpZCBmb3IgdGhlIHdob2xlIGdhbWUgaW5kZXBlbnRlbnQgZnJvbSB0aGUgc2F2ZS1nYW1lcy5cbiAgICAqXG4gICAgKiA8cD5UaGUgZm9sbG93aW5nIGRhdGEtdHlwZXMgZXhpc3Q6PC9wPlxuICAgICogLSBTdHJpbmdzIC0+IFZhcmlhYmxlcyBzdG9yaW5nIHRleHQgZGF0YS5cbiAgICAqIC0gTnVtYmVycyAtPiBWYXJpYWJsZXMgc3RvcmluZyBpbnRlZ2VyIG51bWJlciB2YWx1ZXMuXG4gICAgKiAtIEJvb2xlYW5zIC0+IFZhcmlhYmxlcyBzdG9yaW5nIGJvb2xlYW4gdmFsdWVzLiAoQ2FsbGVkIFwiU3dpdGNoZXNcIiBmb3IgZWFzaWVyIHVuZGVyc3RhbmRpbmcpXG4gICAgKiAtIExpc3RzIC0+IFZhcmlhYmxlcyBzdG9yaW5nIG11bHRpcGxlIG90aGVyIHZhcmlhYmxlcy4gTGlzdHMgY2FuIGFsc28gY29udGFpbiBMaXN0cy5cbiAgICAqIDxwPlxuICAgICogTG9jYWwgdmFyaWFibGVzIGFyZSBzdG9yZWQgYnkgc2NlbmUgVUlELiBGb3IgZWFjaCBzY2VuZSBVSUQgYSBsaXN0IG9mIGxvY2FsIHZhcmlhYmxlcyBpcyBzdG9yZWQuPC9wPlxuICAgICpcbiAgICAqIDxwPkdsb2JhbCBhbmQgcGVyc2lzdGVudCB2YXJpYWJsZXMgYXJlIHN0b3JlZCBhbmQgYSBzcGVjaWZpYyBkb21haW4uIEEgZG9tYWluIGlzIGp1c3QgYSB1bmlxdWUgbmFtZSBzdWNoXG4gICAgKiBhcyA8aT5jb20uZXhhbXBsZS5nYW1lPC9pPiBmb3IgZXhhbXBsZS4gVGhlIGRlZmF1bHQgZG9tYWluIGlzIGFuIGVtcHR5IHN0cmluZy4gRG9tYWlucyBhcmUgdXNlZnVsIHRvIGF2b2lkXG4gICAgKiBvdmVybGFwcGluZyBvZiB2YXJpYWJsZSBudW1iZXJzIHdoZW4gc2hhcmluZyBjb250ZW50IHdpdGggb3RoZXIgdXNlcnMuIDwvcD5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgVmFyaWFibGVTdG9yZVxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEN1cnJlbnQgbG9jYWwgdmFyaWFibGUgY29udGV4dFxuICAgICAgICAqIEBwcm9wZXJ0eSBjb250ZXh0XG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAY29udGV4dCA9IG51bGxcblxuICAgICAgICAjIyMqXG4gICAgICAgICogQ3VycmVudCBkb21haW4gZm9yIGdsb2JhbCBhbmQgcGVyc2lzdGVudCB2YXJpYWJsZXMuIEVhY2ggZG9tYWluIGhhcyBpdHMgb3duXG4gICAgICAgICogdmFyaWFibGVzLiBQbGVhc2UgdXNlIDxiPmNoYW5nZURvbWFpbjwvYj4gbWV0aG9kIHRvIGNoYW5nZSB0aGUgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBkb21haW5cbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAcmVhZE9ubHlcbiAgICAgICAgIyMjXG4gICAgICAgIEBkb21haW4gPSBcIlwiXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIExpc3Qgb2YgYXZhaWxhYmxlIGRvbWFpbnMgZm9yIGdsb2JhbCBhbmQgcGVyc2lzdGVudCB2YXJpYWJsZXMuXG4gICAgICAgICogQHByb3BlcnR5IGRvbWFpbnNcbiAgICAgICAgKiBAdHlwZSBzdHJpbmdbXVxuICAgICAgICAjIyNcbiAgICAgICAgQGRvbWFpbnMgPSBbXCJcIl1cblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdsb2JhbCBudW1iZXIgdmFyaWFibGVzIG9mIHRoZSBjdXJyZW50IGRvbWFpbi5cbiAgICAgICAgKiBAcHJvcGVydHkgbnVtYmVyc1xuICAgICAgICAqIEB0eXBlIG51bWJlcltdXG4gICAgICAgICMjI1xuICAgICAgICBAbnVtYmVycyA9IG51bGxcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBnbG9iYWwgYm9vbGVhbiB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBib29sZWFuc1xuICAgICAgICAqIEB0eXBlIGJvb2xlYW5bXVxuICAgICAgICAjIyNcbiAgICAgICAgQGJvb2xlYW5zID0gbnVsbFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGdsb2JhbCBzdHJpbmcgdmFyaWFibGVzIG9mIHRoZSBjdXJyZW50IGRvbWFpbi5cbiAgICAgICAgKiBAcHJvcGVydHkgc3RyaW5nc1xuICAgICAgICAqIEB0eXBlIHN0cmluZ1tdXG4gICAgICAgICMjI1xuICAgICAgICBAc3RyaW5ncyA9IG51bGxcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBnbG9iYWwgbGlzdCB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsaXN0c1xuICAgICAgICAqIEB0eXBlIE9iamVjdFtdW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBsaXN0cyA9IG51bGxcblxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHN0b3JhZ2Ugb2YgYWxsIGdsb2JhbCB2YXJpYWJsZXMgYnkgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBnbG9iYWxWYXJpYWJsZXNCeURvbWFpblxuICAgICAgICAqIEB0eXBlIE9iamVjdFtdW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBnbG9iYWxWYXJpYWJsZXNCeURvbWFpbiA9IHt9XG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBzdG9yYWdlIG9mIGFsbCBwZXJzaXN0ZW50IHZhcmlhYmxlcyBieSBkb21haW4uXG4gICAgICAgICogQHByb3BlcnR5IHBlcnNpc3RlbnRWYXJpYWJsZXNCeURvbWFpblxuICAgICAgICAqIEB0eXBlIE9iamVjdFtdW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBwZXJzaXN0ZW50VmFyaWFibGVzQnlEb21haW4gPSB7fVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgcGVyc2lzdGVudCBudW1iZXIgdmFyaWFibGVzIG9mIHRoZSBjdXJyZW50IGRvbWFpbi5cbiAgICAgICAgKiBAcHJvcGVydHkgcGVyc2lzdGVudE51bWJlcnNcbiAgICAgICAgKiBAdHlwZSBudW1iZXJbXVxuICAgICAgICAjIyNcbiAgICAgICAgQHBlcnNpc3RlbnROdW1iZXJzID0gW11cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBwZXJzaXN0ZW50IHN0cmluZyB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBwZXJzaXN0ZW50U3RyaW5nc1xuICAgICAgICAqIEB0eXBlIHN0cmluZ1tdXG4gICAgICAgICMjI1xuICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3MgPSBbXVxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHBlcnNpc3RlbnQgYm9vbGVhbiB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBwZXJzaXN0ZW50Qm9vbGVhbnNcbiAgICAgICAgKiBAdHlwZSBib29sZWFuW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBwZXJzaXN0ZW50Qm9vbGVhbnMgPSBbXVxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHBlcnNpc3RlbnQgbGlzdCB2YXJpYWJsZXMgb2YgdGhlIGN1cnJlbnQgZG9tYWluLlxuICAgICAgICAqIEBwcm9wZXJ0eSBwZXJzaXN0ZW50TGlzdHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVtdXG4gICAgICAgICMjI1xuICAgICAgICBAcGVyc2lzdGVudExpc3RzID0gW11cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBsb2NhbCBudW1iZXIgdmFyaWFibGVzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsb2NhbE51bWJlcnNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBsb2NhbE51bWJlcnMgPSB7fVxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxvY2FsIHN0cmluZyB2YXJpYWJsZXMuXG4gICAgICAgICogQHByb3BlcnR5IGxvY2FsU3RyaW5nc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGxvY2FsU3RyaW5ncyA9IHt9XG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbG9jYWwgYm9vbGVhbiB2YXJpYWJsZXMuXG4gICAgICAgICogQHByb3BlcnR5IGxvY2FsQm9vbGVhbnNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBsb2NhbEJvb2xlYW5zID0ge31cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBsb2NhbCBsaXN0IHZhcmlhYmxlcy5cbiAgICAgICAgKiBAcHJvcGVydHkgbG9jYWxMaXN0c1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQGxvY2FsTGlzdHMgPSB7fVxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IHRlbXBOdW1iZXJzXG4gICAgICAgICogQHR5cGUgbnVtYmVyW11cbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZW1wTnVtYmVycyA9IG51bGxcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSB0ZW1wU3RyaW5nc1xuICAgICAgICAqIEB0eXBlIHN0cmluZ1tdXG4gICAgICAgICMjI1xuICAgICAgICBAdGVtcFN0cmluZ3MgPSBudWxsXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgbG9jYWxCb29sZWFuc1xuICAgICAgICAqIEB0eXBlIG51bWJlcltdXG4gICAgICAgICMjI1xuICAgICAgICBAdGVtcEJvb2xlYW5zID0gbnVsbFxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGxvY2FsTGlzdHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RbXVtdXG4gICAgICAgICMjI1xuICAgICAgICBAdGVtcExpc3RzID0gbnVsbFxuXG4gICAgIyMjKlxuICAgICogQ2FsbGVkIGlmIHRoaXMgb2JqZWN0IGluc3RhbmNlIGlzIHJlc3RvcmVkIGZyb20gYSBkYXRhLWJ1bmRsZS4gSXQgY2FuIGJlIHVzZWRcbiAgICAqIHJlLWFzc2lnbiBldmVudC1oYW5kbGVyLCBhbm9ueW1vdXMgZnVuY3Rpb25zLCBldGMuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgZG9tYWlucyA9IERhdGFNYW5hZ2VyLmdldERvY3VtZW50c0J5VHlwZShcImdsb2JhbF92YXJpYWJsZXNcIikuc2VsZWN0IChkKSAtPiBkLml0ZW1zLmRvbWFpblxuXG4gICAgICAgIGZvciBkb21haW4sIGkgaW4gZG9tYWluc1xuICAgICAgICAgICAgQG51bWJlcnNCeURvbWFpbltkb21haW5dID0gQG51bWJlcnNCeURvbWFpbltpXVxuICAgICAgICAgICAgQHN0cmluZ3NCeURvbWFpbltkb21haW5dID0gQHN0cmluZ3NCeURvbWFpbltpXVxuICAgICAgICAgICAgQGJvb2xlYW5zQnlEb21haW5bZG9tYWluXSA9IEBib29sZWFuc0J5RG9tYWluW2ldXG4gICAgICAgICAgICBAbGlzdHNCeURvbWFpbltkb21haW5dID0gQGxpc3RzQnlEb21haW5baV1cblxuICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgc2V0dXBHbG9iYWxEb21haW5zOiAoKSAtPlxuICAgICAgICBAbnVtYmVyc0J5RG9tYWluID0gW11cbiAgICAgICAgQHN0cmluZ3NCeURvbWFpbiA9IFtdXG4gICAgICAgIEBib29sZWFuc0J5RG9tYWluID0gW11cbiAgICAgICAgQGxpc3RzQnlEb21haW4gPSBbXVxuXG4gICAgICAgIGZvciBkb21haW4sIGkgaW4gQGRvbWFpbnNcbiAgICAgICAgICAgIEBudW1iZXJzQnlEb21haW5baV0gPSBuZXcgQXJyYXkoMTAwMClcbiAgICAgICAgICAgIEBudW1iZXJzQnlEb21haW5bZG9tYWluXSA9IEBudW1iZXJzQnlEb21haW5baV1cbiAgICAgICAgICAgIEBzdHJpbmdzQnlEb21haW5baV0gPSBuZXcgQXJyYXkoMTAwMClcbiAgICAgICAgICAgIEBzdHJpbmdzQnlEb21haW5bZG9tYWluXSA9IEBzdHJpbmdzQnlEb21haW5baV1cbiAgICAgICAgICAgIEBib29sZWFuc0J5RG9tYWluW2ldID0gbmV3IEFycmF5KDEwMDApXG4gICAgICAgICAgICBAYm9vbGVhbnNCeURvbWFpbltkb21haW5dID0gQGJvb2xlYW5zQnlEb21haW5baV1cbiAgICAgICAgICAgIEBsaXN0c0J5RG9tYWluW2ldID0gbmV3IEFycmF5KDEwMDApXG4gICAgICAgICAgICBAbGlzdHNCeURvbWFpbltkb21haW5dID0gQGxpc3RzQnlEb21haW5baV1cblxuICAgICAgICBAbnVtYmVycyA9IEBudW1iZXJzQnlEb21haW5bMF1cbiAgICAgICAgQHN0cmluZ3MgPSBAc3RyaW5nc0J5RG9tYWluWzBdXG4gICAgICAgIEBib29sZWFucyA9IEBib29sZWFuc0J5RG9tYWluWzBdXG4gICAgICAgIEBsaXN0cyA9IEBsaXN0c0J5RG9tYWluWzBdXG5cbiAgICBzZXR1cFBlcnNpc3RlbnREb21haW5zOiAoZG9tYWlucykgLT5cbiAgICAgICAgQHBlcnNpc3RlbnROdW1iZXJzQnlEb21haW4gPSB7fVxuICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3NCeURvbWFpbiA9IHt9XG4gICAgICAgIEBwZXJzaXN0ZW50Qm9vbGVhbnNCeURvbWFpbiA9IHt9XG4gICAgICAgIEBwZXJzaXN0ZW50TGlzdHNCeURvbWFpbiA9IHt9XG5cbiAgICAgICAgZm9yIGRvbWFpbiwgaSBpbiBAZG9tYWluc1xuICAgICAgICAgICAgQHBlcnNpc3RlbnROdW1iZXJzQnlEb21haW5baV0gPSBuZXcgQXJyYXkoMTApXG4gICAgICAgICAgICBAcGVyc2lzdGVudE51bWJlcnNCeURvbWFpbltkb21haW5dID0gQHBlcnNpc3RlbnROdW1iZXJzW2ldXG4gICAgICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3NCeURvbWFpbltpXSA9IG5ldyBBcnJheSgxMClcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50U3RyaW5nc0J5RG9tYWluW2RvbWFpbl0gPSBAcGVyc2lzdGVudFN0cmluZ3NbaV1cbiAgICAgICAgICAgIEBwZXJzaXN0ZW50Qm9vbGVhbnNCeURvbWFpbltpXSA9IG5ldyBBcnJheSgxMClcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50Qm9vbGVhbnNCeURvbWFpbltkb21haW5dID0gQHBlcnNpc3RlbnRCb29sZWFuc1tpXVxuICAgICAgICAgICAgQHBlcnNpc3RlbnRMaXN0c0J5RG9tYWluW2ldID0gbmV3IEFycmF5KDEwKVxuICAgICAgICAgICAgQHBlcnNpc3RlbnRMaXN0c0J5RG9tYWluW2RvbWFpbl0gPSBAcGVyc2lzdGVudExpc3RzW2ldXG5cbiAgICAgICAgQHBlcnNpc3RlbnROdW1iZXJzID0gQHBlcnNpc3RlbnROdW1iZXJzQnlEb21haW5bMF1cbiAgICAgICAgQHBlcnNpc3RlbnRTdHJpbmdzID0gQHBlcnNpc3RlbnRTdHJpbmdzQnlEb21haW5bMF1cbiAgICAgICAgQHBlcnNpc3RlbnRCb29sZWFucyA9IEBwZXJzaXN0ZW50Qm9vbGVhbnNCeURvbWFpblswXVxuICAgICAgICBAcGVyc2lzdGVudExpc3RzID0gQHBlcnNpc3RlbnRMaXN0c0J5RG9tYWluWzBdXG5cbiAgICBzZXR1cERvbWFpbnM6IChkb21haW5zKSAtPlxuICAgICAgICBAZG9tYWlucyA9IGRvbWFpbnNcbiAgICAgICAgQHNldHVwR2xvYmFsRG9tYWlucygpXG4gICAgICAgIEBzZXR1cFBlcnNpc3RlbnREb21haW5zKClcblxuXG4gICAgIyMjKlxuICAgICogUmVzdG9yZXMgdGhlIHZhcmlhYmxlIHN0b3JlIGZyb20gYSBzZXJpYWxpemVkIHN0b3JlLlxuICAgICMjI1xuICAgIHJlc3RvcmU6IChzdG9yZSkgLT5cbiAgICAgICAgaWdub3JlID0gW1wiZG9tYWluc1wiXVxuICAgICAgICBmb3IgayBvZiBzdG9yZVxuICAgICAgICAgICAgaWYgIWsuc3RhcnRzV2l0aChcInBlcnNpc3RlbnRcIikgYW5kIGlnbm9yZS5pbmRleE9mKGspID09IC0xXG4gICAgICAgICAgICAgICAgdGhpc1trXSA9IHN0b3JlW2tdO1xuXG4gICAgIyMjKlxuICAgICogQ2hhbmdlcyB0aGUgY3VycmVudCBkb21haW4uXG4gICAgKlxuICAgICogQGRlcHJlY2F0ZWRcbiAgICAqIEBtZXRob2QgY2hhbmdlRG9tYWluXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gZG9tYWluIC0gVGhlIGRvbWFpbiB0byBjaGFuZ2UgdG8uXG4gICAgIyMjXG4gICAgY2hhbmdlRG9tYWluOiAoZG9tYWluKSAtPlxuICAgICAgICBAZG9tYWluID0gZG9tYWluXG4gICAgICAgIGdsb2JhbFZhcmlhYmxlcyA9IEBnbG9iYWxWYXJpYWJsZXNCeURvbWFpbltkb21haW5dXG4gICAgICAgIHBlcnNpc3RlbnRWYXJpYWJsZXMgPSBAcGVyc2lzdGVudFZhcmlhYmxlc0J5RG9tYWluW2RvbWFpbl1cblxuICAgICAgICBpZiAhZ2xvYmFsVmFyaWFibGVzXG4gICAgICAgICAgICBnbG9iYWxWYXJpYWJsZXMgPSBAZ2xvYmFsVmFyaWFibGVzQnlEb21haW5bZG9tYWluXSA9IHsgbnVtYmVyczogbmV3IEFycmF5KDUwMCksIHN0cmluZ3M6IG5ldyBBcnJheSg1MDApLCBib29sZWFuczogbmV3IEFycmF5KDUwMCksIGxpc3RzOiBuZXcgQXJyYXkoNTAwKSB9XG4gICAgICAgIGlmICFwZXJzaXN0ZW50VmFyaWFibGVzXG4gICAgICAgICAgICBwZXJzaXN0ZW50VmFyaWFibGVzID0gQHBlcnNpc3RlbnRWYXJpYWJsZXNCeURvbWFpbltkb21haW5dID0geyBudW1iZXJzOiBuZXcgQXJyYXkoNTAwKSwgc3RyaW5nczogbmV3IEFycmF5KDUwMCksIGJvb2xlYW5zOiBuZXcgQXJyYXkoNTAwKSwgbGlzdHM6IG5ldyBBcnJheSg1MDApIH1cblxuICAgICAgICBAbnVtYmVycyA9IGdsb2JhbFZhcmlhYmxlcy5udW1iZXJzXG4gICAgICAgIEBzdHJpbmdzID0gZ2xvYmFsVmFyaWFibGVzLnN0cmluZ3NcbiAgICAgICAgQGJvb2xlYW5zID0gZ2xvYmFsVmFyaWFibGVzLmJvb2xlYW5zXG4gICAgICAgIEBsaXN0cyA9IGdsb2JhbFZhcmlhYmxlcy5saXN0c1xuICAgICAgICBAcGVyc2lzdGVudE51bWJlcnMgPSBwZXJzaXN0ZW50VmFyaWFibGVzLm51bWJlcnNcbiAgICAgICAgQHBlcnNpc3RlbnRCb29sZWFucyA9IHBlcnNpc3RlbnRWYXJpYWJsZXMuYm9vbGVhbnNcbiAgICAgICAgQHBlcnNpc3RlbnRTdHJpbmdzID0gcGVyc2lzdGVudFZhcmlhYmxlcy5zdHJpbmdzXG4gICAgICAgIEBwZXJzaXN0ZW50TGlzdHMgPSBwZXJzaXN0ZW50VmFyaWFibGVzLmxpc3RzXG5cbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgYWxsIGdsb2JhbCB2YXJpYWJsZXNcbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyR2xvYmFsVmFyaWFibGVzXG4gICAgIyMjXG4gICAgY2xlYXJBbGxHbG9iYWxWYXJpYWJsZXM6IC0+XG4gICAgICAgIEBzZXR1cEdsb2JhbERvbWFpbnMoKVxuICAgICAgICByZXR1cm5cblxuICAgICAgICBnbG9iYWxWYXJpYWJsZXMgPSBAZ2xvYmFsVmFyaWFibGVzQnlEb21haW5bQGRvbWFpbl1cbiAgICAgICAgQG51bWJlcnNCeURvbWFpbiA9IG5ldyBBcnJheSgxMDAwKVxuICAgICAgICBnbG9iYWxWYXJpYWJsZXMuYm9vbGVhbnMgPSBuZXcgQXJyYXkoMTAwMClcbiAgICAgICAgZ2xvYmFsVmFyaWFibGVzLnN0cmluZ3MgPSBuZXcgQXJyYXkoMTAwMClcblxuICAgICAgICBAbnVtYmVycyA9IGdsb2JhbFZhcmlhYmxlcy5udW1iZXJzXG4gICAgICAgIEBzdHJpbmdzID0gZ2xvYmFsVmFyaWFibGVzLnN0cmluZ3NcbiAgICAgICAgQGJvb2xlYW5zID0gZ2xvYmFsVmFyaWFibGVzLmJvb2xlYW5zXG5cbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgYWxsIGxvY2FsIHZhcmlhYmxlcyBmb3IgYWxsIGNvbnRleHRzL3NjZW5lcy9jb21tb24tZXZlbnRzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJBbGxMb2NhbFZhcmlhYmxlc1xuICAgICMjI1xuICAgIGNsZWFyQWxsTG9jYWxWYXJpYWJsZXM6IC0+XG4gICAgICAgIEBsb2NhbE51bWJlcnMgPSB7fVxuICAgICAgICBAbG9jYWxTdHJpbmdzID0ge31cbiAgICAgICAgQGxvY2FsQm9vbGVhbnMgPSB7fVxuICAgICAgICBAbG9jYWxMaXN0cyA9IHt9XG5cbiAgICAjIyMqXG4gICAgKiBDbGVhcnMgc3BlY2lmaWVkIHZhcmlhYmxlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNsZWFyVmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge251bWJlcltdfSBudW1iZXJzIC0gVGhlIG51bWJlciB2YXJpYWJsZXMgdG8gY2xlYXIuXG4gICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzdHJpbmdzIC0gVGhlIHN0cmluZyB2YXJpYWJsZXMgdG8gY2xlYXIuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW5bXX0gYm9vbGVhbnMgLSBUaGUgYm9vbGVhbiB2YXJpYWJsZXMgdG8gY2xlYXIuXG4gICAgKiBAcGFyYW0ge0FycmF5W119IGxpc3RzIC0gVGhlIGxpc3QgdmFyaWFibGVzIHRvIGNsZWFyLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHR5cGUgLSBEZXRlcm1pbmVzIHdoYXQga2luZCBvZiB2YXJpYWJsZXMgc2hvdWxkIGJlIGNsZWFyZWQuXG4gICAgKiA8dWw+XG4gICAgKiA8bGk+MCA9IEFsbDwvbGk+XG4gICAgKiA8bGk+MSA9IFN3aXRjaGVzIC8gQm9vbGVhbnM8L2xpPlxuICAgICogPGxpPjIgPSBOdW1iZXJzPC9saT5cbiAgICAqIDxsaT4zID0gVGV4dHM8L2xpPlxuICAgICogPGxpPjQgPSBMaXN0czwvbGk+XG4gICAgKiA8L3VsPlxuICAgICogQHBhcmFtIHtPYmplY3R9IHJhbmdlIC0gVGhlIHZhcmlhYmxlIGlkLXJhbmdlIHRvIGNsZWFyLiBJZiA8Yj5udWxsPC9iPiBhbGwgc3BlY2lmaWVkIHZhcmlhYmxlcyBhcmUgY2xlYXJlZC5cbiAgICAjIyNcbiAgICBjbGVhclZhcmlhYmxlczogKG51bWJlcnMsIHN0cmluZ3MsIGJvb2xlYW5zLCBsaXN0cywgdHlwZSwgcmFuZ2UpIC0+XG4gICAgICAgIHN3aXRjaCB0eXBlXG4gICAgICAgICAgICB3aGVuIDAgIyBBbGxcbiAgICAgICAgICAgICAgICBudW1iZXJzPy5maWxsKDAsIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICAgICAgc3RyaW5ncz8uZmlsbChcIlwiLCByYW5nZS5zdGFydCwgcmFuZ2UuZW5kKVxuICAgICAgICAgICAgICAgIGJvb2xlYW5zPy5maWxsKGZhbHNlLCByYW5nZS5zdGFydCwgcmFuZ2UuZW5kKVxuICAgICAgICAgICAgICAgIGxpc3RzPy5maWxsKFtdLCByYW5nZS5zdGFydCwgcmFuZ2UuZW5kKVxuICAgICAgICAgICAgd2hlbiAxICMgU3dpdGNoXG4gICAgICAgICAgICAgICAgYm9vbGVhbnM/LmZpbGwoZmFsc2UsIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICB3aGVuIDIgIyBOdW1iZXJcbiAgICAgICAgICAgICAgICBudW1iZXJzPy5maWxsKDAsIHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpXG4gICAgICAgICAgICB3aGVuIDMgIyBUZXh0XG4gICAgICAgICAgICAgICAgc3RyaW5ncz8uZmlsbChcIlwiLCByYW5nZS5zdGFydCwgcmFuZ2UuZW5kKVxuICAgICAgICAgICAgd2hlbiA0ICMgTGlzdFxuICAgICAgICAgICAgICAgIGxpc3RzPy5maWxsKFtdLCByYW5nZS5zdGFydCwgcmFuZ2UuZW5kKVxuXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIGFsbCBsb2NhbCB2YXJpYWJsZXMgZm9yIGEgc3BlY2lmaWVkIGNvbnRleHQuIElmIHRoZSBjb250ZXh0IGlzIG5vdCBzcGVjaWZpZWQsIGFsbFxuICAgICogbG9jYWwgdmFyaWFibGVzIGZvciBhbGwgY29udGV4dHMvc2NlbmVzL2NvbW1vbi1ldmVudHMgYXJlIGNsZWFyZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBjbGVhckxvY2FsVmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFRoZSBjb250ZXh0IHRvIGNsZWFyIHRoZSBsb2NhbCB2YXJpYWJsZXMgZm9yLiBJZiA8Yj5udWxsPC9iPiwgYWxsXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdHlwZSAtIERldGVybWluZXMgd2hhdCBraW5kIG9mIHZhcmlhYmxlcyBzaG91bGQgYmUgY2xlYXJlZC5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT4wID0gQWxsPC9saT5cbiAgICAqIDxsaT4xID0gU3dpdGNoZXMgLyBCb29sZWFuczwvbGk+XG4gICAgKiA8bGk+MiA9IE51bWJlcnM8L2xpPlxuICAgICogPGxpPjMgPSBUZXh0czwvbGk+XG4gICAgKiA8bGk+NCA9IExpc3RzPC9saT5cbiAgICAqIDwvdWw+XG4gICAgKiBAcGFyYW0ge09iamVjdH0gcmFuZ2UgLSBUaGUgdmFyaWFibGUgaWQtcmFuZ2UgdG8gY2xlYXIuIElmIDxiPm51bGw8L2I+IGFsbCB2YXJpYWJsZXMgYXJlIGNsZWFyZWQuXG4gICAgIyMjXG4gICAgY2xlYXJMb2NhbFZhcmlhYmxlczogKGNvbnRleHQsIHR5cGUsIHJhbmdlKSAtPlxuICAgICAgICBpZiBjb250ZXh0P1xuICAgICAgICAgICAgaWRzID0gW2NvbnRleHQuaWRdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlkcyA9IE9iamVjdC5rZXlzKEBsb2NhbE51bWJlcnMpXG5cbiAgICAgICAgaWYgcmFuZ2U/XG4gICAgICAgICAgICByYW5nZSA9IHN0YXJ0OiByYW5nZS5zdGFydCwgZW5kOiByYW5nZS5lbmQgKyAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmdlID0gc3RhcnQ6IDAsIGVuZDogbnVsbFxuXG4gICAgICAgIGZvciBpZCBpbiBpZHNcbiAgICAgICAgICAgIEBjbGVhclZhcmlhYmxlcyhAbG9jYWxOdW1iZXJzW2lkXSwgQGxvY2FsU3RyaW5nc1tpZF0sIEBsb2NhbEJvb2xlYW5zW2lkXSwgQGxvY2FsTGlzdHNbaWRdLCB0eXBlLCByYW5nZSlcblxuICAgICMjIypcbiAgICAqIENsZWFycyBnbG9iYWwgdmFyaWFibGVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJHbG9iYWxWYXJpYWJsZXNcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB0eXBlIC0gRGV0ZXJtaW5lcyB3aGF0IGtpbmQgb2YgdmFyaWFibGVzIHNob3VsZCBiZSBjbGVhcmVkLlxuICAgICogPHVsPlxuICAgICogPGxpPjAgPSBBbGw8L2xpPlxuICAgICogPGxpPjEgPSBTd2l0Y2hlcyAvIEJvb2xlYW5zPC9saT5cbiAgICAqIDxsaT4yID0gTnVtYmVyczwvbGk+XG4gICAgKiA8bGk+MyA9IFRleHRzPC9saT5cbiAgICAqIDxsaT40ID0gTGlzdHM8L2xpPlxuICAgICogPC91bD5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSByYW5nZSAtIFRoZSB2YXJpYWJsZSBpZC1yYW5nZSB0byBjbGVhci4gSWYgPGI+bnVsbDwvYj4gYWxsIHZhcmlhYmxlcyBhcmUgY2xlYXJlZC5cbiAgICAjIyNcbiAgICBjbGVhckdsb2JhbFZhcmlhYmxlczogKHR5cGUsIHJhbmdlKSAtPlxuICAgICAgICBpZiByYW5nZT9cbiAgICAgICAgICAgIHJhbmdlID0gc3RhcnQ6IHJhbmdlLnN0YXJ0LCBlbmQ6IHJhbmdlLmVuZCArIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFuZ2UgPSBzdGFydDogMCwgZW5kOiBudWxsXG5cbiAgICAgICAgQGNsZWFyVmFyaWFibGVzKEBudW1iZXJzLCBAc3RyaW5ncywgQGJvb2xlYW5zLCBAbGlzdHMsIHR5cGUsIHJhbmdlKVxuXG4gICAgIyMjKlxuICAgICogQ2xlYXJzIHBlcnNpc3RlbnQgdmFyaWFibGVzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2xlYXJQZXJzaXN0ZW50VmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdHlwZSAtIERldGVybWluZXMgd2hhdCBraW5kIG9mIHZhcmlhYmxlcyBzaG91bGQgYmUgY2xlYXJlZC5cbiAgICAqIDx1bD5cbiAgICAqIDxsaT4wID0gQWxsPC9saT5cbiAgICAqIDxsaT4xID0gU3dpdGNoZXMgLyBCb29sZWFuczwvbGk+XG4gICAgKiA8bGk+MiA9IE51bWJlcnM8L2xpPlxuICAgICogPGxpPjMgPSBUZXh0czwvbGk+XG4gICAgKiA8bGk+NCA9IExpc3RzPC9saT5cbiAgICAqIDwvdWw+XG4gICAgKiBAcGFyYW0ge09iamVjdH0gcmFuZ2UgLSBUaGUgdmFyaWFibGUgaWQtcmFuZ2UgdG8gY2xlYXIuIElmIDxiPm51bGw8L2I+IGFsbCB2YXJpYWJsZXMgYXJlIGNsZWFyZWQuXG4gICAgIyMjXG4gICAgY2xlYXJQZXJzaXN0ZW50VmFyaWFibGVzOiAodHlwZSwgcmFuZ2UpIC0+XG4gICAgICAgIGlmIHJhbmdlP1xuICAgICAgICAgICAgcmFuZ2UgPSBzdGFydDogcmFuZ2Uuc3RhcnQsIGVuZDogcmFuZ2UuZW5kICsgMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5nZSA9IHN0YXJ0OiAwLCBlbmQ6IG51bGxcblxuICAgICAgICBAY2xlYXJWYXJpYWJsZXMoQHBlcnNpc3RlbnROdW1iZXJzLCBAcGVyc2lzdGVudHN0cmluZ3MsIEBwZXJzaXN0ZW50Qm9vbGVhbnMsIEBwZXJzaXN0ZW50TGlzdHMsIHR5cGUsIHJhbmdlKVxuXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIHZhcmlhYmxlcy4gU2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciB0aGUgY29udGV4dCBjaGFuZ2VzLiAoTGlrZSBhZnRlciBhIHNjZW5lIGNoYW5nZSlcbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFRoZSBjb250ZXh0KGN1cnJlbnQgc2NlbmUpIG5lZWRlZCBmb3IgbG9jYWwgdmFyaWFibGVzLiBOZWVkcyBoYXZlIGF0IGxlYXN0IGFuIGlkLXByb3BlcnR5LlxuICAgICMjI1xuICAgIHNldHVwOiAoY29udGV4dCkgLT5cbiAgICAgICAgQHNldHVwTG9jYWxWYXJpYWJsZXMoY29udGV4dClcbiAgICAgICAgQHNldHVwVGVtcFZhcmlhYmxlcyhjb250ZXh0KVxuXG5cbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgbG9jYWwgdmFyaWFibGVzIGZvciB0aGUgc3BlY2lmaWVkIGNvbnRleHQuIFNob3VsZCBiZSBjYWxsZWQgb24gZmlyc3QgdGltZSB1c2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cExvY2FsVmFyaWFibGVzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIFRoZSBjb250ZXh0KGN1cnJlbnQgc2NlbmUpLiBOZWVkcyBoYXZlIGF0IGxlYXN0IGFuIGlkLXByb3BlcnR5LlxuICAgICMjI1xuICAgIHNldHVwTG9jYWxWYXJpYWJsZXM6IChjb250ZXh0KSAtPlxuICAgICAgICBAc2V0dXBWYXJpYWJsZXMoY29udGV4dCwgXCJsb2NhbE51bWJlcnNcIiwgMClcbiAgICAgICAgQHNldHVwVmFyaWFibGVzKGNvbnRleHQsIFwibG9jYWxTdHJpbmdzXCIsIFwiXCIpXG4gICAgICAgIEBzZXR1cFZhcmlhYmxlcyhjb250ZXh0LCBcImxvY2FsQm9vbGVhbnNcIiwgbm8pXG4gICAgICAgIEBzZXR1cFZhcmlhYmxlcyhjb250ZXh0LCBcImxvY2FsTGlzdHNcIiwgW10pXG5cbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgc3BlY2lmaWVkIGtpbmQgb2YgdmFyaWFibGVzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBWYXJpYWJsZXNcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gVGhlIGNvbnRleHQoY3VycmVudCBzY2VuZSkuIE5lZWRzIGhhdmUgYXQgbGVhc3QgYW4gaWQtcHJvcGVydHkuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgLSBUaGUga2luZCBvZiB2YXJpYWJsZXMgKHByb3BlcnR5LW5hbWUpLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRWYWx1ZSAtIFRoZSBkZWZhdWx0IHZhbHVlIGZvciBlYWNoIHZhcmlhYmxlLlxuICAgICMjI1xuICAgIHNldHVwVmFyaWFibGVzOiAoY29udGV4dCwgcHJvcGVydHksIGRlZmF1bHRWYWx1ZSkgLT5cbiAgICAgICAgaWYgbm90IHRoaXNbcHJvcGVydHldW2NvbnRleHQuaWRdP1xuICAgICAgICAgICAgdGhpc1twcm9wZXJ0eV1bY29udGV4dC5pZF0gPSBbXVxuXG5cbiAgICAjIyMqXG4gICAgKiBJbml0aWFsaXplcyB0aGUgY3VycmVudCB0ZW1wIHZhcmlhYmxlcyBmb3IgdGhlIHNwZWNpZmllZCBjb250ZXh0LiBTaG91bGQgYmUgY2FsbGVkIHdoZW5ldmVyIHRoZSBjb250ZXh0IGNoYW5nZWQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXR1cFRlbXBWYXJpYWJsZXNcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gVGhlIGNvbnRleHQoY3VycmVudCBzY2VuZSkuIE5lZWRzIGhhdmUgYXQgbGVhc3QgYW4gaWQtcHJvcGVydHkuXG4gICAgIyMjXG4gICAgc2V0dXBUZW1wVmFyaWFibGVzOiAoY29udGV4dCkgLT5cbiAgICAgICAgQGNvbnRleHQgPSBjb250ZXh0XG4gICAgICAgIGlmICFAbG9jYWxOdW1iZXJzW2NvbnRleHQuaWRdXG4gICAgICAgICAgICBAc2V0dXBMb2NhbFZhcmlhYmxlcyhjb250ZXh0KVxuXG4gICAgICAgIEB0ZW1wTnVtYmVycyA9IEBsb2NhbE51bWJlcnNbY29udGV4dC5pZF1cbiAgICAgICAgQHRlbXBTdHJpbmdzID0gQGxvY2FsU3RyaW5nc1tjb250ZXh0LmlkXVxuICAgICAgICBAdGVtcEJvb2xlYW5zID0gQGxvY2FsQm9vbGVhbnNbY29udGV4dC5pZF1cbiAgICAgICAgQHRlbXBMaXN0cyA9IEBsb2NhbExpc3RzW2NvbnRleHQuaWRdXG5cbiAgICBjbGVhclRlbXBWYXJpYWJsZXM6IChjb250ZXh0KSAtPlxuICAgICAgICBAY29udGV4dCA9IGNvbnRleHRcbiAgICAgICAgaWYgIUBsb2NhbE51bWJlcnNbY29udGV4dC5pZF1cbiAgICAgICAgICAgIEBzZXR1cExvY2FsVmFyaWFibGVzKGNvbnRleHQpXG5cbiAgICAgICAgQGxvY2FsTnVtYmVyc1tjb250ZXh0LmlkXSA9IFtdXG4gICAgICAgIEBsb2NhbFN0cmluZ3NbY29udGV4dC5pZF0gPSBbXVxuICAgICAgICBAbG9jYWxCb29sZWFuc1tjb250ZXh0LmlkXSA9IFtdXG4gICAgICAgIEBsb2NhbExpc3RzW2NvbnRleHQuaWRdID0gW11cblxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGluZGV4IGZvciB0aGUgdmFyaWFibGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUuIElmIGEgdmFyaWFibGUgd2l0aCB0aGF0XG4gICAgKiBuYW1lIGNhbm5vdCBiZSBmb3VuZCwgdGhlIGluZGV4IHdpbGwgYmUgMC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluZGV4T2ZUZW1wVmFyaWFibGVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgaW5kZXggZm9yLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgdHlwZSBuYW1lOiBudW1iZXIsIHN0cmluZywgYm9vbGVhbiBvciBsaXN0LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlIHNjb3BlOiAwID0gbG9jYWwsIDEgPSBnbG9iYWwsIDIgPSBwZXJzaXN0ZW50LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpbiAtIFRoZSB2YXJpYWJsZSBkb21haW4gdG8gc2VhcmNoIGluLiBJZiBub3Qgc3BlY2lmaWVkLCB0aGUgZGVmYXVsdCBkb21haW4gd2lsbCBiZSB1c2VkLlxuICAgICMjI1xuICAgIGluZGV4T2ZWYXJpYWJsZTogKG5hbWUsIHR5cGUsIHNjb3BlLCBkb21haW4pIC0+XG4gICAgICAgIHJlc3VsdCA9IDBcblxuICAgICAgICBzd2l0Y2ggc2NvcGVcbiAgICAgICAgICAgIHdoZW4gMCAjIExvY2FsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQGluZGV4T2ZUZW1wVmFyaWFibGUobmFtZSwgdHlwZSlcbiAgICAgICAgICAgIHdoZW4gMSAjIEdsb2JhbFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBpbmRleE9mR2xvYmFsVmFyaWFibGUobmFtZSwgdHlwZSwgZG9tYWluKVxuICAgICAgICAgICAgd2hlbiAyICMgUGVyc2lzdGVudFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBpbmRleE9mUGVyc2lzdGVudFZhcmlhYmxlKG5hbWUsIHR5cGUsIGRvbWFpbilcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSBpbmRleCBmb3IgdGhlIGxvY2FsIHZhcmlhYmxlIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lLiBJZiBhIHZhcmlhYmxlIHdpdGggdGhhdFxuICAgICogbmFtZSBjYW5ub3QgYmUgZm91bmQsIHRoZSBpbmRleCB3aWxsIGJlIDAuXG4gICAgKlxuICAgICogQG1ldGhvZCBpbmRleE9mVGVtcFZhcmlhYmxlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB2YXJpYWJsZSB0byBnZXQgdGhlIGluZGV4IGZvci5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIHR5cGUgbmFtZTogbnVtYmVyLCBzdHJpbmcsIGJvb2xlYW4gb3IgbGlzdC5cbiAgICAjIyNcbiAgICBpbmRleE9mVGVtcFZhcmlhYmxlOiAobmFtZSwgdHlwZSkgLT5cbiAgICAgICAgcmVzdWx0ID0gMFxuXG4gICAgICAgIGlmIEBjb250ZXh0Py5vd25lclxuICAgICAgICAgICAgaWYgQGNvbnRleHQub3duZXIuc2NlbmVEb2N1bWVudFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlID0gQGNvbnRleHQub3duZXIuc2NlbmVEb2N1bWVudC5pdGVtc1t0eXBlICsgXCJWYXJpYWJsZXNcIl0uZmlyc3QgKHYpIC0+IHYubmFtZSA9PSBuYW1lXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFyaWFibGUuaW5kZXggaWYgdmFyaWFibGU/XG4gICAgICAgICAgICBlbHNlIGlmIEBjb250ZXh0Lm93bmVyW3R5cGUgKyBcIlZhcmlhYmxlc1wiXVxuICAgICAgICAgICAgICAgIHZhcmlhYmxlID0gQGNvbnRleHQub3duZXJbdHlwZSArIFwiVmFyaWFibGVzXCJdLmZpcnN0ICh2KSAtPiB2Lm5hbWUgPT0gbmFtZVxuXG4gICAgICAgICAgICAgICAgaWYgdmFyaWFibGU/XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZhcmlhYmxlLmluZGV4XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJWYXJpYWJsZSByZWZlcmVuY2VkIGJ5IG5hbWUgbm90IGZvdW5kOiBcIiArIG5hbWUgK1wiKGxvY2FsLCBcIit0eXBlK1wiKVwiKVxuXG4gICAgICAgIHJldHVybiByZXN1bHRcblxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIGluZGV4IGZvciB0aGUgZ2xvYmFsIHZhcmlhYmxlIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lLiBJZiBhIHZhcmlhYmxlIHdpdGggdGhhdFxuICAgICogbmFtZSBjYW5ub3QgYmUgZm91bmQsIHRoZSBpbmRleCB3aWxsIGJlIDAuXG4gICAgKlxuICAgICogQG1ldGhvZCBpbmRleE9mVGVtcFZhcmlhYmxlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB2YXJpYWJsZSB0byBnZXQgdGhlIGluZGV4IGZvci5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIHR5cGUgbmFtZTogbnVtYmVyLCBzdHJpbmcsIGJvb2xlYW4gb3IgbGlzdC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW4gLSBUaGUgdmFyaWFibGUgZG9tYWluIHRvIHNlYXJjaCBpbi4gSWYgbm90IHNwZWNpZmllZCwgdGhlIGRlZmF1bHQgZG9tYWluIHdpbGwgYmUgdXNlZC5cbiAgICAjIyNcbiAgICBpbmRleE9mR2xvYmFsVmFyaWFibGU6IChuYW1lLCB0eXBlLCBkb21haW4pIC0+XG4gICAgICAgIHJlc3VsdCA9IDBcbiAgICAgICAgdmFyaWFibGVzID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRzQnlUeXBlKFwiZ2xvYmFsX3ZhcmlhYmxlc1wiKVxuICAgICAgICB2YXJpYWJsZXNEb2N1bWVudCA9IHZhcmlhYmxlcy5maXJzdCAodikgLT4gdi5pdGVtcy5kb21haW4gPT0gZG9tYWluXG4gICAgICAgIHZhcmlhYmxlc0RvY3VtZW50ID89IHZhcmlhYmxlc1swXVxuXG4gICAgICAgIGlmIHZhcmlhYmxlc0RvY3VtZW50XG4gICAgICAgICAgICB2YXJpYWJsZSA9IHZhcmlhYmxlc0RvY3VtZW50Lml0ZW1zW3R5cGUgKyBcInNcIl0uZmlyc3QgKHYpIC0+IHYubmFtZSA9PSBuYW1lXG4gICAgICAgICAgICBpZiB2YXJpYWJsZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZhcmlhYmxlLmluZGV4XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVmFyaWFibGUgcmVmZXJlbmNlZCBieSBuYW1lIG5vdCBmb3VuZDogI3tuYW1lfSAocGVyc2lzdGVudCwgI3t0eXBlfSlcIilcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSBpbmRleCBmb3IgdGhlIHBlcnNpc3RlbnQgdmFyaWFibGUgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUuIElmIGEgdmFyaWFibGUgd2l0aCB0aGF0XG4gICAgKiBuYW1lIGNhbm5vdCBiZSBmb3VuZCwgdGhlIGluZGV4IHdpbGwgYmUgMC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGluZGV4T2ZUZW1wVmFyaWFibGVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgaW5kZXggZm9yLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgdHlwZSBuYW1lOiBudW1iZXIsIHN0cmluZywgYm9vbGVhbiBvciBsaXN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpbiAtIFRoZSB2YXJpYWJsZSBkb21haW4gdG8gc2VhcmNoIGluLiBJZiBub3Qgc3BlY2lmaWVkLCB0aGUgZGVmYXVsdCBkb21haW4gd2lsbCBiZSB1c2VkLlxuICAgICMjI1xuICAgIGluZGV4T2ZQZXJzaXN0ZW50VmFyaWFibGU6IChuYW1lLCB0eXBlLCBkb21haW4pIC0+XG4gICAgICAgIHJlc3VsdCA9IDBcbiAgICAgICAgdmFyaWFibGVzID0gRGF0YU1hbmFnZXIuZ2V0RG9jdW1lbnRzQnlUeXBlKFwicGVyc2lzdGVudF92YXJpYWJsZXNcIilcbiAgICAgICAgdmFyaWFibGVzRG9jdW1lbnQgPSB2YXJpYWJsZXMuZmlyc3QgKHYpIC0+IHYuaXRlbXMuZG9tYWluID09IGRvbWFpblxuICAgICAgICB2YXJpYWJsZXNEb2N1bWVudCA/PSB2YXJpYWJsZXNbMF1cblxuICAgICAgICBpZiB2YXJpYWJsZXNEb2N1bWVudFxuICAgICAgICAgICAgdmFyaWFibGUgPSB2YXJpYWJsZXNEb2N1bWVudC5pdGVtc1t0eXBlICsgXCJzXCJdLmZpcnN0ICh2KSAtPiB2Lm5hbWUgPT0gbmFtZVxuICAgICAgICAgICAgaWYgdmFyaWFibGU/XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFyaWFibGUuaW5kZXhcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJWYXJpYWJsZSByZWZlcmVuY2VkIGJ5IG5hbWUgbm90IGZvdW5kOiAje25hbWV9IChwZXJzaXN0ZW50LCAje3R5cGV9KVwiKVxuXG4gICAgICAgIHJldHVybiByZXN1bHRcblxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoZSBudW1iZXIgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldE51bWJlclZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHR5cGUgLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgIyMjXG4gICAgc2V0TnVtYmVyVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKSAtPlxuICAgICAgICBpZiBzY29wZSA9PSAyXG4gICAgICAgICAgICBAcGVyc2lzdGVudE51bWJlcnNCeURvbWFpbltkb21haW5dW2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2UgaWYgc2NvcGUgPT0gMVxuICAgICAgICAgICAgQG51bWJlcnNCeURvbWFpbltkb21haW58fDBdW2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wTnVtYmVyc1tpbmRleF0gPSB2YWx1ZVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpZWQgbnVtYmVyIHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0TnVtYmVyVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFyaWFibGUgLSBUaGUgdmFyaWFibGUgdG8gc2V0LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldC5cbiAgICAjIyNcbiAgICBzZXROdW1iZXJWYWx1ZVRvOiAodmFyaWFibGUsIHZhbHVlKSAtPlxuICAgICAgICBpZiB2YXJpYWJsZS5zY29wZSA9PSAyXG4gICAgICAgICAgICBAcGVyc2lzdGVudE51bWJlcnNCeURvbWFpblt2YXJpYWJsZS5kb21haW58fDBdW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2UgaWYgdmFyaWFibGUuc2NvcGUgPT0gMVxuICAgICAgICAgICAgQG51bWJlcnNCeURvbWFpblt2YXJpYWJsZS5kb21haW58fDBdW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wTnVtYmVyc1t2YXJpYWJsZS5pbmRleF0gPSB2YWx1ZVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpZWQgbGlzdCB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldExpc3RPYmplY3RUb1xuICAgICogQHBhcmFtIHtPYmplY3R9IHZhcmlhYmxlIC0gVGhlIHZhcmlhYmxlIHRvIHNldC5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgIyMjXG4gICAgc2V0TGlzdE9iamVjdFRvOiAodmFyaWFibGUsIHZhbHVlKSAtPlxuICAgICAgICBpZiB2YXJpYWJsZS5zY29wZSA9PSAyXG4gICAgICAgICAgICBAcGVyc2lzdGVudExpc3RzQnlEb21haW5bdmFyaWFibGUuZG9tYWlufHwwXVt2YXJpYWJsZS5pbmRleF0gPSB2YWx1ZVxuICAgICAgICBlbHNlIGlmIHZhcmlhYmxlLnNjb3BlID09IDFcbiAgICAgICAgICAgIEBsaXN0c0J5RG9tYWluW3ZhcmlhYmxlLmRvbWFpbnx8MF1bdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRlbXBMaXN0c1t2YXJpYWJsZS5pbmRleF0gPSB2YWx1ZVxuXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBib29sZWFuIHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0Qm9vbGVhblZhbHVlVG9cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YXJpYWJsZSAtIFRoZSB2YXJpYWJsZSB0byBzZXQuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldC5cbiAgICAjIyNcbiAgICBzZXRCb29sZWFuVmFsdWVUbzogKHZhcmlhYmxlLCB2YWx1ZSkgLT5cbiAgICAgICAgaWYgdmFyaWFibGUuc2NvcGUgPT0gMlxuICAgICAgICAgICAgQHBlcnNpc3RlbnRCb29sZWFuc0J5RG9tYWluW3ZhcmlhYmxlLmRvbWFpbl1bdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcbiAgICAgICAgZWxzZSBpZiB2YXJpYWJsZS5zY29wZSA9PSAxXG4gICAgICAgICAgICBAYm9vbGVhbnNCeURvbWFpblt2YXJpYWJsZS5kb21haW5dW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wQm9vbGVhbnNbdmFyaWFibGUuaW5kZXhdID0gdmFsdWVcblxuICAgICMjIypcbiAgICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoZSBib29sZWFuIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRCb29sZWFuVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgLSBUaGUgdmFsdWUgdG8gc2V0LlxuICAgICMjI1xuICAgIHNldEJvb2xlYW5WYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIHZhbHVlLCBkb21haW4pIC0+XG4gICAgICAgIGlmIHNjb3BlID09IDJcbiAgICAgICAgICAgIEBwZXJzaXN0ZW50Qm9vbGVhbnNCeURvbWFpbltkb21haW5dW2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2UgaWYgc2NvcGUgPT0gMVxuICAgICAgICAgICAgQGJvb2xlYW5zQnlEb21haW5bZG9tYWluXVtpbmRleF0gPSB2YWx1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdGVtcEJvb2xlYW5zW2luZGV4XSA9IHZhbHVlXG5cbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBzdHJpbmcgdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRTdHJpbmdWYWx1ZVRvXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdmFyaWFibGUgLSBUaGUgdmFyaWFibGUgdG8gc2V0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldC5cbiAgICAjIyNcbiAgICBzZXRTdHJpbmdWYWx1ZVRvOiAodmFyaWFibGUsIHZhbHVlKSAtPlxuICAgICAgICBpZiB2YXJpYWJsZS5zY29wZSA9PSAyXG4gICAgICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3NCeURvbWFpblt2YXJpYWJsZS5kb21haW5dW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2UgaWYgdmFyaWFibGUuc2NvcGUgPT0gMVxuICAgICAgICAgICAgQHN0cmluZ3NCeURvbWFpblt2YXJpYWJsZS5kb21haW5dW3ZhcmlhYmxlLmluZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wU3RyaW5nc1t2YXJpYWJsZS5pbmRleF0gPSB2YWx1ZVxuXG4gICAgIyMjKlxuICAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhlIHN0cmluZyB2YXJpYWJsZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0U3RyaW5nVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgIyMjXG4gICAgc2V0U3RyaW5nVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCB2YWx1ZSwgZG9tYWluKSAtPlxuICAgICAgICBpZiBzY29wZSA9PSAyXG4gICAgICAgICAgICBAcGVyc2lzdGVudFN0cmluZ3NCeURvbWFpbltkb21haW5dW2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2UgaWYgc2NvcGUgPT0gMVxuICAgICAgICAgICAgQHN0cmluZ3NCeURvbWFpbltkb21haW5dW2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0ZW1wU3RyaW5nc1tpbmRleF0gPSB2YWx1ZVxuXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBzcGVjaWZpZWQgbGlzdCB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGxpc3RPYmplY3RPZlxuICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAtIFRoZSBsaXN0LXZhcmlhYmxlL29iamVjdCB0byBnZXQgdGhlIHZhbHVlIGZyb20uXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBsaXN0LW9iamVjdC5cbiAgICAjIyNcbiAgICBsaXN0T2JqZWN0T2Y6IChvYmplY3QpIC0+XG4gICAgICAgIHJlc3VsdCA9IDBcbiAgICAgICAgaWYgb2JqZWN0PyBhbmQgb2JqZWN0LmluZGV4P1xuICAgICAgICAgICAgaWYgb2JqZWN0LnNjb3BlID09IDJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGVyc2lzdGVudExpc3RzQnlEb21haW5bb2JqZWN0LmRvbWFpbl1bb2JqZWN0LmluZGV4XVxuICAgICAgICAgICAgZWxzZSBpZiBvYmplY3Quc2NvcGUgPT0gMVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBsaXN0c0J5RG9tYWluW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAdGVtcExpc3RzW29iamVjdC5pbmRleF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0ID0gb2JqZWN0XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCBbXVxuXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBudW1iZXIgdmFyaWFibGUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG51bWJlclZhbHVlQXRJbmRleFxuICAgICogQHBhcmFtIHtudW1iZXJ9IHNjb3BlIC0gVGhlIHZhcmlhYmxlIHNjb3BlLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gVGhlIHZhcmlhYmxlJ3MgaW5kZXguXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBudW1iZXIgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgICMjI1xuICAgIG51bWJlclZhbHVlQXRJbmRleDogKHNjb3BlLCBpbmRleCwgZG9tYWluKSAtPlxuICAgICAgICByZXN1bHQgPSAwXG5cbiAgICAgICAgaWYgc2NvcGUgPT0gMlxuICAgICAgICAgICAgcmVzdWx0ID0gQHBlcnNpc3RlbnROdW1iZXJzQnlEb21haW5bZG9tYWluXVtpbmRleF1cbiAgICAgICAgZWxzZSBpZiBzY29wZSA9PSAxXG4gICAgICAgICAgICByZXN1bHQgPSBAbnVtYmVyc0J5RG9tYWluW2RvbWFpbl1baW5kZXhdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlc3VsdCA9IEB0ZW1wTnVtYmVyc1tpbmRleF1cblxuICAgICAgICByZXR1cm4gcmVzdWx0IHx8IDBcblxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWVkIG51bWJlciB2YXJpYWJsZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIG51bWJlclZhbHVlT2ZcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBUaGUgdmFyaWFibGUgdG8gZ2V0IHRoZSB2YWx1ZSBmcm9tLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgbnVtYmVyIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyNcbiAgICBudW1iZXJWYWx1ZU9mOiAob2JqZWN0KSAtPlxuICAgICAgICByZXN1bHQgPSAwXG4gICAgICAgIGlmIG9iamVjdD8gYW5kIG9iamVjdC5pbmRleD9cbiAgICAgICAgICAgIGlmIG9iamVjdC5zY29wZSA9PSAyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBlcnNpc3RlbnROdW1iZXJzQnlEb21haW5bb2JqZWN0LmRvbWFpbl1bb2JqZWN0LmluZGV4XVxuICAgICAgICAgICAgZWxzZSBpZiBvYmplY3Quc2NvcGUgPT0gMVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBudW1iZXJzQnlEb21haW5bb2JqZWN0LmRvbWFpbl1bb2JqZWN0LmluZGV4XVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEB0ZW1wTnVtYmVyc1tvYmplY3QuaW5kZXhdXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0ID0gb2JqZWN0XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCAwXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBzdHJpbmcgdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdHJpbmdWYWx1ZU9mXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IC0gVGhlIHZhcmlhYmxlIHRvIGdldCB0aGUgdmFsdWUgZnJvbS5cbiAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0cmluZyB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjXG4gICAgc3RyaW5nVmFsdWVPZjogKG9iamVjdCkgLT5cbiAgICAgICAgcmVzdWx0ID0gXCJcIlxuICAgICAgICBpZiBvYmplY3Q/IGFuZCBvYmplY3QuaW5kZXg/XG4gICAgICAgICAgICBpZiBvYmplY3Quc2NvcGUgPT0gMlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBwZXJzaXN0ZW50U3RyaW5nc0J5RG9tYWluW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF1cbiAgICAgICAgICAgIGVsc2UgaWYgb2JqZWN0LnNjb3BlID09IDFcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAc3RyaW5nc0J5RG9tYWluW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAdGVtcFN0cmluZ3Nbb2JqZWN0LmluZGV4XVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXN1bHQgPSBvYmplY3RcblxuICAgICAgICByZXR1cm4gcmVzdWx0IHx8IFwiXCJcblxuICAgICMjIypcbiAgICAqIEdldHMgdGhlIHZhbHVlIG9mIGEgc3RyaW5nIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBzdHJpbmdWYWx1ZUF0SW5kZXhcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY29wZSAtIFRoZSB2YXJpYWJsZSBzY29wZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFRoZSB2YXJpYWJsZSdzIGluZGV4LlxuICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5nIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyNcbiAgICBzdHJpbmdWYWx1ZUF0SW5kZXg6IChzY29wZSwgaW5kZXgsIGRvbWFpbikgLT5cbiAgICAgICAgcmVzdWx0ID0gXCJcIlxuXG4gICAgICAgIGlmIHNjb3BlID09IDJcbiAgICAgICAgICAgIHJlc3VsdCA9IEBwZXJzaXN0ZW50U3RyaW5nc0J5RG9tYWluW2RvbWFpbl1baW5kZXhdXG4gICAgICAgIGVsc2UgaWYgc2NvcGUgPT0gMVxuICAgICAgICAgICAgcmVzdWx0ID0gQHN0cmluZ3NCeURvbWFpbltkb21haW5dW2luZGV4XVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXN1bHQgPSBAdGVtcFN0cmluZ3NbaW5kZXhdXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCBcIlwiXG5cbiAgICAjIyMqXG4gICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBib29sZWFuIHZhcmlhYmxlLlxuICAgICpcbiAgICAqIEBtZXRob2QgYm9vbGVhblZhbHVlT2ZcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBUaGUgdmFyaWFibGUgdG8gZ2V0IHRoZSB2YWx1ZSBmcm9tLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgYm9vbGVhbiB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgIyMjXG4gICAgYm9vbGVhblZhbHVlT2Y6IChvYmplY3QpIC0+XG4gICAgICAgIHJlc3VsdCA9IG5vXG4gICAgICAgIGlmIG9iamVjdD8gYW5kIG9iamVjdC5pbmRleD9cbiAgICAgICAgICAgIGlmIG9iamVjdC5zY29wZSA9PSAyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBlcnNpc3RlbnRCb29sZWFuc0J5RG9tYWluW29iamVjdC5kb21haW5dW29iamVjdC5pbmRleF0gfHwgbm9cbiAgICAgICAgICAgIGVsc2UgaWYgb2JqZWN0LnNjb3BlID09IDFcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAYm9vbGVhbnNCeURvbWFpbltvYmplY3QuZG9tYWluXVtvYmplY3QuaW5kZXhdIHx8IG5vXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHRlbXBCb29sZWFuc1tvYmplY3QuaW5kZXhdIHx8IG5vXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0ID0gaWYgb2JqZWN0IHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuXG4gICAgIyMjKlxuICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBib29sZWFuIHZhcmlhYmxlIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgKlxuICAgICogQG1ldGhvZCBib29sZWFuVmFsdWVBdEluZGV4XG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2NvcGUgLSBUaGUgdmFyaWFibGUgc2NvcGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgdmFyaWFibGUncyBpbmRleC5cbiAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSBib29sZWFuIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICAjIyNcbiAgICBib29sZWFuVmFsdWVBdEluZGV4OiAoc2NvcGUsIGluZGV4LCBkb21haW4pIC0+XG4gICAgICAgIHJlc3VsdCA9IG5vXG5cbiAgICAgICAgaWYgc2NvcGUgPT0gMlxuICAgICAgICAgICAgcmVzdWx0ID0gQHBlcnNpc3RlbkJvb2xlYW5zQnlEb21haW5bZG9tYWluXVtpbmRleF0gfHwgbm9cbiAgICAgICAgZWxzZSBpZiBzY29wZSA9PSAxXG4gICAgICAgICAgICByZXN1bHQgPSBAYm9vbGVhbnNCeURvbWFpbltkb21haW5dW2luZGV4XSB8fCBub1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXN1bHQgPSBAdGVtcEJvb2xlYW5zW2luZGV4XSB8fCBub1xuXG4gICAgICAgIHJldHVybiByZXN1bHRcblxuZ3MuVmFyaWFibGVTdG9yZSA9IFZhcmlhYmxlU3RvcmUiXX0=
//# sourceURL=VariableStore_84.js