var Component_TextRenderer, RendererTextLine, RendererToken,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

RendererTextLine = (function() {

  /**
  * Stores a text line.
  *
  * @module gs.RendererTextLine
  * @class RendererTextLine
  * @memberof gs.RendererTextLine
  * @constructor
   */
  function RendererTextLine() {

    /*
    * The width of the line in pixels.
    * @property width
    * @type number
    * @protected
     */
    this.width = 0;

    /*
    * The height of the line in pixels.
    * @property width
    * @type number
    * @protected
     */
    this.height = 0;

    /*
    * The descent of the line in pixels.
    * @property descent
    * @type number
    * @protected
     */
    this.descent = 0;

    /*
    * The content of the line as token objects.
    * @property content
    * @type Object[]
    * @protected
     */
    this.content = [];
  }

  return RendererTextLine;

})();

gs.RendererTextLine = RendererTextLine;

RendererToken = (function() {

  /**
  * Stores a token.
  *
  * @module gs
  * @class RendererToken
  * @memberof gs
  * @constructor
   */
  function RendererToken(code, value, font) {

    /*
    * The value of the token. That value depends on the token type. For text-tokens, it stores
    * the actual text.
    * @property content
    * @type string
     */
    this.value = value;

    /*
    * The code describes what kind of token it is. For example, if the code is "Y" it means it is a
    * style-token. If the code is <b>null</b>, it means it is a text-token.
    * @property code
    * @type string
     */
    this.code = code;

    /*
    * The format stores the font-style properties of the token like if it is italic, bold, etc. It can be <b>null</b>.
    * @property format
    * @type Object
     */
    this.format = null;

    /*
    * A plain object to store custom data within the token.
    * @property customData
    * @type Object
     */
    this.customData = {};
    if (font != null) {
      this.takeFormat(font);
    }
  }


  /**
  * Takes the style from the specified font and stores it into the format-property. The token will
  * will be rendered with that style then.
  *
  * @method takeFormat
  * @param {gs.Font} font - The font to take the style from.
   */

  RendererToken.prototype.takeFormat = function(font) {
    return this.format = font.toDataBundle();
  };


  /**
  * Applies the format-style of the token on the specified font. The font will have the style from
  * then token then.
  *
  * @method applyFormat
  * @param {gs.Font} font - The font to apply the format-style on.
   */

  RendererToken.prototype.applyFormat = function(font) {
    return font.set(this.format);
  };

  return RendererToken;

})();

gs.RendererToken = RendererToken;

Component_TextRenderer = (function(superClass) {
  extend(Component_TextRenderer, superClass);


  /**
  * A text-renderer component allow to draw plain or formatted text on a
  * game object's bitmap. For formatted text, different text-codes can be
  * used to add formatting or define a placeholder.<br><br>
  *
  * A text-code uses the following syntax:<br><br>
  *
  * {code:value} <- Single Value<br />
  * {code:value1,value2,...} <- Multiple Values<br><br>
  *
  * Example:<br><br>
  *
  * "This is {Y:I}a Text{Y:N}" <- "a Text" will be italic here.<br>
  * "The value is {GN:1}" <- "{GN:1}" will be replaced for the value of the global number variable 0001.<br><br>
  *
  * For a list of all available text-codes with examples, just take a look into the offical help-file.
  *
  * @module gs
  * @class Component_TextRenderer
  * @extends gs.Component
  * @memberof gs
  * @constructor
   */

  function Component_TextRenderer() {
    Component_TextRenderer.__super__.constructor.apply(this, arguments);

    /**
    * @property currentX
    * @type number
    * @protected
     */
    this.currentX = 0;

    /**
    * @property currentY
    * @type number
    * @protected
     */
    this.currentY = 0;

    /**
    * @property currentLineHeight
    * @type number
    * @protected
     */
    this.currentLineHeight = 0;

    /**
    * @property font
    * @type gs.Font
    * @protected
     */
    this.font = new Font("Times New Roman", 22);

    /**
    * @property spaceSize
    * @type number
    * @protected
     */
    this.spaceSize = 0;

    /**
    * @property fontSize
    * @type number
    * @protected
     */
    this.fontSize = 0;

    /**
    * The left and right padding per line.
    * @property padding
    * @type number
     */
    this.padding = 0;

    /**
    * The spacing between text lines in pixels.
    * @property lineSpacing
    * @type number
     */
    this.lineSpacing = 0;
  }


  /**
  * Creates the token-object for a list-placeholder. A list-placeholder
  * allows to insert a value from a list-variable.
  *
  * @method createListToken
  * @param {Array} list - The list.
  * @param {Array} values - The values of the list-placeholder text-code.
  * @return {string} The token-object.
   */

  Component_TextRenderer.prototype.createListToken = function(list, values) {
    var index;
    index = 0;
    if (values[1] != null) {
      values = values[1].split(":");
      index = values[0];
      if (values[0] === "G") {
        index = GameManager.variableStore.numbers[parseInt(values[1]) - 1];
      } else if (values[0] === "P") {
        index = GameManager.variableStore.persistentNumbers[parseInt(values[1]) - 1];
      } else if (values[0] === "L") {
        index = GameManager.variableStore.numberValueOf({
          scope: 0,
          index: parseInt(values[1]) - 1
        });
      }
    }
    return "" + list[index];
  };


  /**
  * Parses and returns the variable identifier which is an array containing
  * the optional domain name and the variable index as: [domain, index].
  *
  * @method parseVariableIdentifier
  * @param {string} identifier - The variable identifier e.g. com.degica.vnm.default.1 or com.degica.vnm.default.VarName
  * @param {string} type - The variable type to parse: number, string, boolean or list
  * @param {string} type - The scope of the variable to parse: 0 = local, 1 = global, 2 = persistent.
  * @return {Array} An array containing two values as: [domain, index]. If the identifier doesn't contain a domain-string, the domain will be 0 (default).
   */

  Component_TextRenderer.prototype.parseVariableIdentifier = function(identifier, type, scope) {
    var index, result;
    result = [0, identifier];
    if (isNaN(identifier)) {
      index = identifier.lastIndexOf(".");
      if (index !== -1) {
        result[0] = identifier.substring(0, index);
        result[1] = identifier.substring(index + 1);
        if (isNaN(result[1])) {
          result[1] = GameManager.variableStore.indexOfVariable(result[1], type, scope, result[0]) + 1;
        } else {
          result[1] = parseInt(result[1]);
        }
      } else {
        result[1] = GameManager.variableStore.indexOfVariable(result[1], type, scope, result[0]) + 1;
      }
    } else {
      result[1] = parseInt(result[1]);
    }
    return result;
  };

  Component_TextRenderer.prototype.replacePlaceholderTokens = function(text) {
    var result;
    result = text;
    result = text.replace(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm, (function(_this) {
      return function(m, code, value) {
        var token;
        token = _this.createToken(code, value);
        if (typeof token === "string") {
          return token;
        } else {
          return m;
        }
      };
    })(this));
    return result;
  };


  /**
  * Creates a token-object for a specified text-code.
  *
  * @method createToken
  * @param {string} code - The code/type of the text-code.
  * @param {string} value - The value of the text-code.
  * @return {Object} The token-object.
   */

  Component_TextRenderer.prototype.createToken = function(code, value) {
    var format, last, listIdentifier, macro, pair, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, tokenObject, values;
    tokenObject = null;
    value = isNaN(value) ? value : parseInt(value);
    switch (code) {
      case "SZ":
        tokenObject = new gs.RendererToken(code, value);
        this.font.size = tokenObject.value || this.fontSize;
        this.spaceSize = this.font.measureTextPlain(" ");
        break;
      case "Y":
        tokenObject = {
          code: code,
          value: value
        };
        switch (value) {
          case "U":
            this.font.underline = true;
            break;
          case "S":
            this.font.strikeThrough = true;
            break;
          case "I":
            this.font.italic = true;
            break;
          case "B":
            this.font.bold = true;
            break;
          case "C":
            this.font.smallCaps = true;
            break;
          case "NU":
            this.font.underline = false;
            break;
          case "NS":
            this.font.strikeThrough = false;
            break;
          case "NI":
            this.font.italic = false;
            break;
          case "NB":
            this.font.bold = false;
            break;
          case "NC":
            this.font.smallCaps = false;
            break;
          case "N":
            this.font.underline = false;
            this.font.strikeThrough = false;
            this.font.italic = false;
            this.font.bold = false;
            this.font.smallCaps = false;
        }
        this.spaceSize = this.font.measureTextPlain(" ");
        break;
      case "C":
        tokenObject = new gs.RendererToken(code, value);
        if (isNaN(value)) {
          this.font.color = gs.Color.fromHex(value);
        } else if (value <= 0) {
          this.font.color = Font.defaultColor;
        } else {
          this.font.color = gs.Color.fromObject(RecordManager.system.colors[value - 1] || Font.defaultColor);
        }
        break;
      case "GN":
        values = isNaN(value) ? value.split(",") : [value];
        if (values[1]) {
          format = values[1];
          values = this.parseVariableIdentifier(values[0], "number", 1);
          tokenObject = sprintf("%" + format + "d", GameManager.variableStore.numbersByDomain[values[0] || 0][values[1] - 1] || 0);
        } else {
          values = this.parseVariableIdentifier(values[0], "number", 1);
          tokenObject = (GameManager.variableStore.numbersByDomain[values[0] || 0][values[1] - 1] || 0).toString();
        }
        break;
      case "GT":
        values = this.parseVariableIdentifier(value, "string", 1);
        tokenObject = GameManager.variableStore.stringsByDomain[values[0] || 0][values[1] - 1] || "";
        tokenObject = tokenObject.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
        if (tokenObject.length > 1) {
          last = tokenObject[tokenObject.length - 1];
          if (!((last != null ? last.length : void 0) > 0)) {
            tokenObject.pop();
          }
        } else {
          tokenObject = (ref = tokenObject[0]) != null ? ref : "";
        }
        break;
      case "GS":
        values = this.parseVariableIdentifier(value, "boolean", 1);
        tokenObject = (GameManager.variableStore.booleansByDomain[values[0] || 0][values[1] - 1] || false).toString();
        break;
      case "GL":
        values = value.split(",");
        listIdentifier = this.parseVariableIdentifier(values[0], "list", 1);
        tokenObject = this.createListToken(GameManager.variableStore.listsByDomain[listIdentifier[0]][listIdentifier[1] - 1] || [], values);
        break;
      case "PN":
        values = isNaN(value) ? value.split(",") : [value];
        if (values[1]) {
          format = values[1];
          values = this.parseVariableIdentifier(values[0], "number", 2);
          tokenObject = sprintf("%" + format + "d", ((ref1 = GameManager.variableStore.persistentNumbers[values[0]]) != null ? ref1[values[1] - 1] : void 0) || 0);
        } else {
          values = this.parseVariableIdentifier(values[0], "number", 2);
          tokenObject = (((ref2 = GameManager.variableStore.persistentNumbersByDomain[values[0] || 0]) != null ? ref2[values[1] - 1] : void 0) || 0).toString();
        }
        break;
      case "PT":
        values = this.parseVariableIdentifier(value, "string", 2);
        tokenObject = ((ref3 = GameManager.variableStore.persistentStringsByDomain[values[0]]) != null ? ref3[values[1] - 1] : void 0) || "";
        tokenObject = tokenObject.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
        if (tokenObject.length > 1) {
          last = tokenObject[tokenObject.length - 1];
          if (!((last != null ? last.length : void 0) > 0)) {
            tokenObject.pop();
          }
        } else {
          tokenObject = (ref4 = tokenObject[0]) != null ? ref4 : "";
        }
        break;
      case "PS":
        values = this.parseVariableIdentifier(value, "boolean", 2);
        tokenObject = (((ref5 = GameManager.variableStore.persistentBooleansByDomain[values[0]]) != null ? ref5[values[1] - 1] : void 0) || false).toString();
        break;
      case "PL":
        values = value.split(",");
        listIdentifier = this.parseVariableIdentifier(values[0], "list", 2);
        tokenObject = this.createListToken(((ref6 = GameManager.variableStore.persistentListsByDomain[listIdentifier[0]]) != null ? ref6[listIdentifier[1] - 1] : void 0) || [], values);
        break;
      case "LN":
        values = isNaN(value) ? value.split(",") : [value];
        if (values[1]) {
          format = values[1];
          values = this.parseVariableIdentifier(values[0], "number", 0);
          tokenObject = sprintf("%" + format + "d", GameManager.variableStore.numberValueOf({
            scope: 0,
            index: values[1] - 1
          }) || 0);
        } else {
          values = this.parseVariableIdentifier(values[0], "number", 0);
          tokenObject = (GameManager.variableStore.numberValueOf({
            scope: 0,
            index: values[1] - 1
          }) || 0).toString();
        }
        break;
      case "LT":
        values = this.parseVariableIdentifier(value, "string", 0);
        tokenObject = (GameManager.variableStore.stringValueOf({
          scope: 0,
          index: values[1] - 1
        }) || "").toString();
        tokenObject = tokenObject.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
        if (tokenObject.length > 1) {
          last = tokenObject[tokenObject.length - 1];
          if (!((last != null ? last.length : void 0) > 0)) {
            tokenObject.pop();
          }
        } else {
          tokenObject = (ref7 = tokenObject[0]) != null ? ref7 : "";
        }
        break;
      case "LS":
        values = this.parseVariableIdentifier(value, "boolean", 0);
        tokenObject = (GameManager.variableStore.booleanValueOf({
          scope: 0,
          index: values[1] - 1
        }) || false).toString();
        break;
      case "LL":
        values = value.split(",");
        listIdentifier = this.parseVariableIdentifier(values[0], "list", 0);
        tokenObject = this.createListToken(GameManager.variableStore.listObjectOf({
          scope: 0,
          index: listIdentifier[1] - 1
        }) || [], values);
        break;
      case "N":
        tokenObject = (RecordManager.characters[value] != null ? lcs(RecordManager.characters[value].name) : "");
        break;
      case "RT":
        pair = value.split("/");
        tokenObject = {
          code: code,
          rtStyleId: (ref8 = pair[2]) != null ? ref8 : 0,
          rb: pair[0],
          rt: pair[1],
          rbSize: {
            width: 0,
            height: 0
          },
          rtSize: {
            width: 0,
            height: 0
          }
        };
        break;
      case "M":
        macro = RecordManager.system.textMacros.first(function(m) {
          return m.name === value;
        });
        if (macro) {
          if (macro.type === 0) {
            tokenObject = macro.content.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
            tokenObject.pop();
          } else if (macro.type === 1) {
            if (!macro.contentFunc) {
              macro.contentFunc = eval("(function(object, value){ " + macro.content + " })");
            }
            tokenObject = macro.contentFunc(this.object, value);
            tokenObject = tokenObject.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
            if (tokenObject.length > 1) {
              tokenObject.pop();
            }
          } else {
            if (!macro.contentFunc) {
              macro.contentFunc = eval("(function(object){ " + macro.content + " })");
            }
            tokenObject = new gs.RendererToken("X", macro.contentFunc);
          }
        } else {
          tokenObject = "";
        }
        break;
      default:
        tokenObject = new gs.RendererToken(code, value);
    }
    return tokenObject;
  };


  /**
  * <p>Gets the correct font for the specified ruby-text token.</p>
  *
  * @param {Object} token - A ruby-text token.
  * @return {gs.Font} The font for the ruby-text which is shown above the original text.
  * @method getRubyTextFont
   */

  Component_TextRenderer.prototype.getRubyTextFont = function(token) {
    var font, ref, style;
    style = null;
    font = null;
    if (token.rtStyleId) {
      style = ui.UIManager.styles["rubyText-" + token.rtStyleId];
    }
    if (!style) {
      style = ui.UIManager.styles["rubyText"];
    }
    font = (ref = style != null ? style.font : void 0) != null ? ref : this.font;
    font.size = font.size || this.font.size / 2;
    return font;
  };


  /**
  * <p>Measures a control-token. If a token produces a visual result like displaying an icon then it must return the size taken by
  * the visual result. If the token has no visual result, <b>null</b> must be returned. This method is called for every token when the message is initialized.</p>
  *
  * @param {Object} token - A control-token.
  * @return {gs.Size} The size of the area taken by the visual result of the token or <b>null</b> if the token has no visual result.
  * @method measureControlToken
  * @protected
   */

  Component_TextRenderer.prototype.measureControlToken = function(token) {
    var animation, font, fs, imageBitmap, size;
    size = null;
    switch (token.code) {
      case "A":
        animation = RecordManager.animations[Math.max(token.value - 1, 0)];
        if ((animation != null ? animation.graphic.name : void 0) != null) {
          imageBitmap = ResourceManager.getBitmap(ResourceManager.getPath(animation.graphic));
          if (imageBitmap != null) {
            size = {
              width: Math.round(imageBitmap.width / animation.framesX),
              height: Math.round(imageBitmap.height / animation.framesY)
            };
          }
        }
        break;
      case "RT":
        font = this.getRubyTextFont(token);
        fs = font.size;
        font.size = font.size || this.font.size / 2;
        token.rbSize = this.font.measureTextPlain(token.rb);
        token.rtSize = font.measureTextPlain(token.rt);
        font.size = fs;
        size = {
          width: Math.max(token.rbSize.width, token.rtSize.width),
          height: token.rbSize.height + token.rtSize.height
        };
    }
    return size;
  };


  /**
  * <p>Draws the visual result of a token, like an icon for example, to the specified bitmap. This method is called for every token while the text is rendered.</p>
  *
  * @param {Object} token - A control-token.
  * @param {gs.Bitmap} bitmap - The bitmap used for the current text-line. Can be used to draw something on it like an icon, etc.
  * @param {number} offset - An x-offset for the draw-routine.
  * @method drawControlToken
  * @protected
   */

  Component_TextRenderer.prototype.drawControlToken = function(token, bitmap, offset) {
    var animation, font, fs, imageBitmap, rect, ref, ref1, style;
    switch (token.code) {
      case "A":
        animation = RecordManager.animations[Math.max(token.value - 1, 0)];
        if ((animation != null ? animation.graphic.name : void 0) != null) {
          imageBitmap = ResourceManager.getBitmap(ResourceManager.getPath(animation.graphic));
          if (imageBitmap != null) {
            rect = new gs.Rect(0, 0, Math.round(imageBitmap.width / animation.framesX), Math.round(imageBitmap.height / animation.framesY));
            return bitmap.blt(offset, this.currentY, imageBitmap, rect);
          }
        }
        break;
      case "RT":
        style = null;
        if (token.rtStyleId) {
          style = ui.UIManager.styles["rubyText-" + token.rtStyleId];
        }
        if (!style) {
          style = ui.UIManager.styles["rubyText"];
        }
        font = (ref = style != null ? style.font : void 0) != null ? ref : this.object.font;
        fs = font.size;
        font.size = font.size || this.object.font.size / 2;
        if (style && !((ref1 = style.descriptor.font) != null ? ref1.color : void 0)) {
          font.color.set(this.object.font.color);
        }
        bitmap.font = font;
        bitmap.drawText(offset, bitmap.font.descent, Math.max(token.rbSize.width, token.rtSize.width), bitmap.height, token.rt, 1, 0);
        bitmap.font = this.object.font;
        font.size = fs;
        return bitmap.drawText(offset, token.rtSize.height, Math.max(token.rbSize.width, token.rtSize.width), bitmap.height, token.rb, 1, 0);
    }
  };


  /**
  * Splits up the specified token using a japanese word-wrap technique.
  *
  * @method wordWrapJapanese
  * @param {Object} token - The token to split up.
  * @param {gs.RendererTextLine} line - The current line.
  * @param {number} width - The width of the current line.
  * @param {number} height - The height of the current line.
  * @param {gs.RendererTextLine[]} - An array of lines. If the token is split up into multiple lines, all new
  * lines are added to this result array.
  * @return {gs.RendererTextLine} The current line, that may be the same as the <b>line</b> parameters but if new lines
  * are created it has to be the last new created line.
   */

  Component_TextRenderer.prototype.wordWrapJapanese = function(token, line, width, height, result) {
    var ch, depth, depthLevel, descent, endOfLine, i, j, lastCharacterIndex, moved, noSplit, size, startOfLine;
    startOfLine = '—…‥〳〴〵。.・、:;, ?!‼⁇⁈⁉‐゠–〜)]｝〕〉》」』】〙〗〟’"｠»ヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻';
    endOfLine = '([｛〔〈《「『【〘〖〝‘"｟«';
    noSplit = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789０１２３４５６７８９—…‥〳〴〵';
    descent = this.font.descent;
    size = this.font.measureTextPlain(token);
    depth = 8;
    depthLevel = 0;
    i = 0;
    j = 0;
    lastCharacterIndex = 0;
    if (size.width > this.object.dstRect.width - this.spaceSize.width * 3 - this.padding * 2) {
      while (i < token.length) {
        ch = token[i];
        size = this.font.measureTextPlain(ch);
        width += size.width;
        moved = false;
        if (width > this.object.dstRect.width - this.padding * 2) {
          depthLevel = 0;
          j = i;
          while (true) {
            moved = false;
            while (j > 0 && startOfLine.indexOf(token[j]) !== -1) {
              j--;
              moved = true;
            }
            while (j > 0 && endOfLine.indexOf(token[j - 1]) !== -1) {
              j--;
              moved = true;
            }
            while (j > 0 && noSplit.indexOf(token[j - 1]) !== -1) {
              j--;
              moved = true;
            }
            if (j === 0 && moved) {
              break;
            } else {
              i = j;
            }
            depthLevel++;
            if (depthLevel >= depth || !moved) {
              break;
            }
          }
          line.content.push(new gs.RendererToken(null, token.substring(lastCharacterIndex, i), this.font));
          lastCharacterIndex = i;
          line.height = Math.max(height, this.font.lineHeight);
          line.width = width - size.width;
          line.descent = descent;
          descent = this.font.descent;
          height = size.height;
          result.push(line);
          line = new gs.RendererTextLine();
          width = width - (width - size.width);
        }
        i++;
      }
    } else {
      line.content.push(new gs.RendererToken(null, token, this.font));
      line.height = Math.max(height, this.font.lineHeight);
      line.width = width + size.width;
      line.descent = descent;
    }
    height = Math.max(height, this.font.lineHeight);
    if (lastCharacterIndex !== i) {
      line.content.push(new gs.RendererToken(null, token.substring(lastCharacterIndex, i), this.font));
      line.width = width;
      line.height = Math.max(height, line.height);
      line.descent = descent;
    }
    return line;
  };


  /**
  * Does not word-wrapping at all. It just adds the text token to the line as is.
  *
  * @method wordWrapNone
  * @param {Object} token - The token to split up.
  * @param {gs.RendererTextLine} line - The current line.
  * @param {number} width - The width of the current line.
  * @param {number} height - The height of the current line.
  * @param {gs.RendererTextLine[]} - An array of lines. If the token is split up into multiple lines, all new
  * lines are added to this result array.
  * @return {gs.RendererTextLine} The current line, that may be the same as the <b>line</b> parameters but if new lines
  * are created it has to be the last new created line.
   */

  Component_TextRenderer.prototype.wordWrapNone = function(token, line, width, height, result) {
    var size;
    size = this.font.measureTextPlain(token);
    height = Math.max(size.height, height || this.font.lineHeight);
    if (token.length > 0) {
      width += size.width;
      line.width = width;
      line.height = Math.max(height, line.height);
      line.descent = this.font.descent;
      line.content.push(new gs.RendererToken(null, token));
    }
    return line;
  };


  /**
  * Splits up the specified token using a space-based word-wrap technique.
  *
  * @method wordWrapSpaceBased
  * @param {Object} token - The token to split up.
  * @param {gs.RendererTextLine} line - The current line.
  * @param {number} width - The width of the current line.
  * @param {number} height - The height of the current line.
  * @param {gs.RendererTextLine[]} - An array of lines. If the token is split up into multiple lines, all new
  * lines are added to this result array.
  * @return {gs.RendererTextLine} The current line, that may be the same as the <b>line</b> parameters but if new lines
  * are created it has to be the last new created line.
   */

  Component_TextRenderer.prototype.wordWrapSpaceBased = function(token, line, width, height, result) {
    var currentWords, descent, i, k, len, size, word, words;
    currentWords = [];
    words = token.split(" ");
    descent = this.font.descent;
    this.spaceSize = this.font.measureTextPlain(" ");
    for (i = k = 0, len = words.length; k < len; i = ++k) {
      word = words[i];
      size = this.font.measureTextPlain(word);
      width += size.width + this.spaceSize.width;
      if (width > this.object.dstRect.width - this.padding * 2) {
        token = new gs.RendererToken(null, currentWords.join(" "));
        token.takeFormat(this.font);
        line.content.push(token);
        line.height = Math.max(height, line.height);
        line.width = width - size.width;
        line.descent = Math.max(line.descent, descent);
        descent = Math.max(descent, this.font.descent);
        height = size.height;
        result.push(line);
        line = new gs.RendererTextLine();
        currentWords = [word];
        width = width - (width - size.width);
      } else {
        currentWords.push(word);
      }
      height = Math.max(height, this.font.lineHeight);
    }
    if (currentWords.length > 0) {
      token = new gs.RendererToken(null, currentWords.join(" "));
      token.takeFormat(this.font);
      line.content.push(token);
      line.width = width;
      line.height = Math.max(height, line.height);
      line.descent = Math.max(descent, line.descent);
    }
    return line;
  };


  /**
  * Splits up the specified token using a word-wrap technique. The kind of word-wrap technique
  * depends on the selected language. You can overwrite this method in derived classes to implement your
  * own custom word-wrap techniques.
  *
  * @method executeWordWrap
  * @param {Object} token - The token to split up.
  * @param {gs.RendererTextLine} line - The current line.
  * @param {number} width - The width of the current line.
  * @param {number} height - The height of the current line.
  * @param {gs.RendererTextLine[]} - An array of lines. If the token is split up into multiple lines, all new
  * lines are added to this result array.
  * @return {gs.RendererTextLine} The current line, that may be the same as the <b>line</b> parameters but if new lines
  * are created it has to be the last new created line.
   */

  Component_TextRenderer.prototype.executeWordWrap = function(token, line, width, height, result, wordWrap) {
    if (wordWrap) {
      switch (LanguageManager.language.wordWrap) {
        case "spaceBased":
          return this.wordWrapSpaceBased(token, line, width, height, result);
        case "japanese":
          return this.wordWrapJapanese(token, line, width, height, result);
      }
    } else {
      return this.wordWrapNone(token, line, width, height, result);
    }
  };


  /**
  * Creates an a of line-objects. Each line-object is a list of token-objects.
  * A token-object can be just a string or an object containing more information
  * about how to process the token at runtime.
  *
  * A line-object also contains additional information like the width and height
  * of the line(in pixels).
  *
  * If the wordWrap param is set, line-breaks are automatically created if a line
  * doesn't fit into the width of the game object's bitmap.
  *
  * @method calculateLines
  * @param {string} message - A message creating the line-objects for.
  * @param {boolean} wordWrap - If wordWrap is set to true, line-breaks are automatically created.
  * @param {number} [firstLineWidth=0] - The current width of the first line.
  * @return {Array} An array of line-objects.
   */

  Component_TextRenderer.prototype.calculateLines = function(message, wordWrap, firstLineWidth) {
    var bold, currentWords, descent, height, italic, line, result, size, smallCaps, strikeThrough, t, token, tokenObject, tokens, underline, width;
    result = [];
    line = new gs.RendererTextLine();
    width = firstLineWidth || 0;
    height = 0;
    descent = this.font.descent;
    currentWords = [];
    size = null;
    this.spaceSize = this.font.measureChar(" ");
    this.fontSize = this.font.size;
    tokens = message.split(/\{([A-z]+):([^\{\}]+)\}|(\n)/gm);
    token = null;
    t = 0;
    underline = this.font.underline;
    strikeThrough = this.font.strikeThrough;
    italic = this.font.italic;
    bold = this.font.bold;
    smallCaps = this.font.smallCaps;
    while (t < tokens.length) {
      token = tokens[t];
      if (t % 4 !== 0) {
        if (token != null) {
          tokenObject = this.createToken(token, tokens[t + 1]);
          if (tokenObject.push != null) {
            Array.prototype.splice.apply(tokens, [t + 3, 0].concat(tokenObject));
          } else if (tokenObject.code == null) {
            tokens[t + 3] = tokenObject + tokens[t + 3];
          } else {
            size = this.measureControlToken(tokenObject);
            if (size) {
              width += size.width;
              height = Math.max(height, size.height);
            }
            line.content.push(tokenObject);
          }
        } else {
          line.height = height || this.font.lineHeight;
          line.width = width;
          line.descent = descent;
          result.push(line);
          line = new gs.RendererTextLine();
          line.content.push(new gs.RendererToken(null, "\n", this.font));
          width = 0;
          height = 0;
          descent = this.font.descent;
        }
        t += 2;
      } else if (token.length > 0) {
        line = this.executeWordWrap(token, line, width, height, result, wordWrap);
        width = line.width;
        height = line.height;
        descent = line.descent;
      }
      t++;
    }
    if (line.content.length > 0 || result.length === 0) {
      line.height = height;
      line.width = width;
      line.descent = descent;
      result.push(line);
    }
    this.font.size = this.fontSize;
    this.font.underline = underline;
    this.font.strikeThrough = strikeThrough;
    this.font.italic = italic;
    this.font.bold = bold;
    this.font.smallCaps = smallCaps;
    return result;
  };


  /**
  * Measures the dimensions of formatted lines in pixels. The result is not
  * pixel-perfect.
  *
  * @method measureFormattedLines
  * @param {gs.RendererTextLine[]} lines - An array of text lines to measure.
  * @param {boolean} wordWrap - If wordWrap is set to true, automatically created line-breaks will be calculated.
  * @result {Object} An object containing the width and height of the text.
   */

  Component_TextRenderer.prototype.measureFormattedLines = function(lines, wordWrap) {
    var k, len, line, size;
    size = {
      width: 0,
      height: 0
    };
    for (k = 0, len = lines.length; k < len; k++) {
      line = lines[k];
      size.width = Math.max(line.width + 2, size.width);
      size.height += line.height + this.lineSpacing;
    }
    size.height -= this.lineSpacing;
    return size;
  };


  /**
  * Measures the dimensions of a formatted text in pixels. The result is not
  * pixel-perfect.
  *
  * @method measureFormattedText
  * @param {string} text - The text to measure.
  * @param {boolean} wordWrap - If wordWrap is set to true, automatically created line-breaks will be calculated.
  * @result {Object} An object containing the width and height of the text.
   */

  Component_TextRenderer.prototype.measureFormattedText = function(text, wordWrap) {
    var lines, size;
    this.font.set(this.object.font);
    size = null;
    lines = this.calculateLines(text, wordWrap);
    size = this.measureFormattedLines(lines, wordWrap);
    return size;
  };


  /**
  * Measures the dimensions of a plain text in pixels. Formatting and
  * word-wrapping are not supported.
  *
  * @method measureText
  * @param {string} text - The text to measure.
  * @result {Object} An object containing the width and height of the text.
   */

  Component_TextRenderer.prototype.measureText = function(text) {
    var k, len, line, lineSize, lines, size;
    size = {
      width: 0,
      height: 0
    };
    lines = text.toString().split("\n");
    for (k = 0, len = lines.length; k < len; k++) {
      line = lines[k];
      lineSize = this.object.font.measureText(text);
      size.width = Math.max(size.width, lineSize.width);
      size.height += this.object.font.lineHeight + this.lineSpacing;
    }
    size.height -= this.lineSpacing;
    return size;
  };


  /**
  * Searches for a token in a list of tokens and returns the first match.
  *
  * @method findToken
  * @param {number} startIndex - The index in the list of tokens where the search will start.
  * @param {string} code - The code of the token to search for.
  * @param {number} direction - The search direction, can be forward(1) or backward(-1).
  * @param {Object[]} tokens - The list of tokens to search.
  * @result {Object} The first token which matches the specified code or <b>null</b> if the token cannot be found.
   */

  Component_TextRenderer.prototype.findToken = function(startIndex, code, direction, tokens) {
    var i, t, token;
    token = null;
    i = startIndex;
    if (direction === -1) {
      while (i >= 0) {
        t = tokens[i];
        if (t.code === code) {
          token = t;
          break;
        }
        i--;
      }
    }
    return token;
  };


  /**
  * Searches for a specific kind of tokens between a start and an end token.
  *
  * @method findTokensBetween
  * @param {number} startIndex - The index where the search will start.
  * @param {number} endIndex - The index where the search will end.
  * @param {string} code - The code of the token-type to search for.
  * @param {Object[]} tokens - The list of tokens to search.
  * @result {Object[]} List of tokens matching the specified code. Its an empty list if no tokens were found.
   */

  Component_TextRenderer.prototype.findTokensBetween = function(startIndex, endIndex, code, tokens) {
    var e, result, s, token;
    result = [];
    s = startIndex;
    e = endIndex;
    while (s < e) {
      token = tokens[s];
      if (token.code == code) {
        result.push(token);
      }
      s++;
    }
    return result;
  };


  /**
  * Processes a control-token. A control-token is a token which influences
  * the text-rendering like changing the fonts color, size or style.
  *
  * Changes will be automatically applied to the game object's font.
  *
  * @method processControlToken
  * @param {Object} token - A control-token.
  * @return {Object} An object which can contain additional info needed for processing.
   */

  Component_TextRenderer.prototype.processControlToken = function(token) {
    var result;
    result = null;
    switch (token.code) {
      case "SZ":
        this.object.font.size = token.value || this.fontSize;
        break;
      case "C":
        if (isNaN(token.value)) {
          this.object.font.color = gs.Color.fromHex(token.value);
        } else if (token.value <= 0) {
          this.object.font.color = Font.defaultColor;
        } else {
          this.object.font.color = RecordManager.system.colors[token.value - 1] || Font.defaultColor;
        }
        break;
      case "Y":
        switch (token.value) {
          case "U":
            this.object.font.underline = true;
            break;
          case "S":
            this.object.font.strikeThrough = true;
            break;
          case "I":
            this.object.font.italic = true;
            break;
          case "B":
            this.object.font.bold = true;
            break;
          case "C":
            this.object.font.smallCaps = true;
            break;
          case "NU":
            this.object.font.underline = false;
            break;
          case "NS":
            this.object.font.strikeThrough = false;
            break;
          case "NI":
            this.object.font.underline = false;
            break;
          case "NB":
            this.object.font.bold = false;
            break;
          case "NC":
            this.object.font.smallCaps = false;
            break;
          case "N":
            this.object.font.underline = false;
            this.object.font.strikeThrough = false;
            this.object.font.italic = false;
            this.object.font.bold = false;
            this.object.font.smallCaps = false;
        }
    }
    return result;
  };


  /**
  * Draws a plain text. Formatting and word-wrapping are not supported.
  *
  * @method drawText
  * @param {number} x - The x-coordinate of the text's position.
  * @param {number} y - The y-coordinate of the text's position.
  * @param {number} width - Deprecated. Can be null.
  * @param {number} height - Deprecated. Can be null.
  * @param {string} text - The text to draw.
   */

  Component_TextRenderer.prototype.drawText = function(pl, pt, pr, pb, text) {
    var font, height, i, k, len, line, lines, size;
    lines = text.toString().split("\n");
    font = this.object.font;
    height = font.lineHeight;
    for (i = k = 0, len = lines.length; k < len; i = ++k) {
      line = lines[i];
      size = font.measureText(line);
      this.object.bitmap.drawText(pl, i * height + pt, size.width + pr + pl, height + pt + pb, line, 0, 0);
    }
    return null;
  };


  /**
  * Draws an array of formatted text lines.
  * If the wordWrap param is set, line-breaks are automatically created if a line
  * doesn't fit into the width of the game object's bitmap.
  *
  * @method drawFormattedLines
  * @param {number} pl - The left-padding of the text's position.
  * @param {number} pt - The top-padding of the text's position.
  * @param {number} pr - The right-padding of the text's position.
  * @param {number} pb - The bottom-padding of the text's position.
  * @param {gs.RendererTextLine[]} lines - An array of lines to draw.
  * @param {boolean} wordWrap - If wordWrap is set to true, line-breaks are automatically created.
   */

  Component_TextRenderer.prototype.drawFormattedLines = function(pl, pt, pr, pb, lines, wordWrap) {
    var font, height, k, l, len, len1, line, ref, size, token;
    this.currentX = pl;
    this.currentY = pt;
    this.currentLineHeight = 0;
    for (k = 0, len = lines.length; k < len; k++) {
      line = lines[k];
      ref = line.content;
      for (l = 0, len1 = ref.length; l < len1; l++) {
        token = ref[l];
        if (token.code != null) {
          this.processControlToken(token);
          size = this.measureControlToken(token);
          if (size) {
            this.drawControlToken(token, this.object.bitmap, this.currentX);
            this.currentX += size.width;
          }
        } else if (token.value.length > 0) {
          font = this.object.font;
          height = line.height;
          if (token.value !== "\n") {
            size = font.measureTextPlain(token.value);
            this.object.bitmap.drawText(this.currentX, this.currentY + height - size.height + font.descent - line.descent, size.width + pl + pr, height + pt + pb, token.value, 0, 0);
            this.currentX += size.width;
          }
          this.currentLineHeight = Math.max(this.currentLineHeight, height);
        }
      }
      this.currentY += (this.currentLineHeight || this.object.font.lineHeight) + this.lineSpacing;
      this.currentX = pl;
      this.currentLineHeight = 0;
    }
    return null;
  };


  /**
  * Draws a formatted text.
  * If the wordWrap param is set, line-breaks are automatically created if a line
  * doesn't fit into the width of the game object's bitmap.
  *
  * @method drawFormattedText
  * @param {number} x - The x-coordinate of the text's position.
  * @param {number} y - The y-coordinate of the text's position.
  * @param {number} width - Deprecated. Can be null.
  * @param {number} height - Deprecated. Can be null.
  * @param {string} text - The text to draw.
  * @param {boolean} wordWrap - If wordWrap is set to true, line-breaks are automatically created.
  * @return {gs.RendererTextLine[]} The drawn text lines.
   */

  Component_TextRenderer.prototype.drawFormattedText = function(pl, pt, pr, pb, text, wordWrap) {
    var lines;
    lines = this.calculateLines(text.toString(), wordWrap);
    this.drawFormattedLines(pl, pt, pr, pb, lines, wordWrap);
    return lines;
  };

  return Component_TextRenderer;

})(gs.Component);

gs.Component_TextRenderer = Component_TextRenderer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLElBQUEsdURBQUE7RUFBQTs7O0FBQU07O0FBQ0Y7Ozs7Ozs7O0VBUWEsMEJBQUE7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBQ1Y7Ozs7OztJQU1BLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBQ1g7Ozs7OztJQU1BLElBQUMsQ0FBQSxPQUFELEdBQVc7RUE1QkY7Ozs7OztBQThCakIsRUFBRSxDQUFDLGdCQUFILEdBQXNCOztBQUVoQjs7QUFDRjs7Ozs7Ozs7RUFRYSx1QkFBQyxJQUFELEVBQU8sS0FBUCxFQUFjLElBQWQ7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxJQUFELEdBQVE7O0FBQ1I7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7QUFDVjs7Ozs7SUFLQSxJQUFDLENBQUEsVUFBRCxHQUFjO0lBRWQsSUFBcUIsWUFBckI7TUFBQSxJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBQTs7RUE1QlM7OztBQThCYjs7Ozs7Ozs7MEJBT0EsVUFBQSxHQUFZLFNBQUMsSUFBRDtXQUNSLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFlBQUwsQ0FBQTtFQURGOzs7QUFHWjs7Ozs7Ozs7MEJBT0EsV0FBQSxHQUFhLFNBQUMsSUFBRDtXQUNULElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLE1BQVY7RUFEUzs7Ozs7O0FBR2pCLEVBQUUsQ0FBQyxhQUFILEdBQW1COztBQUViOzs7O0FBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXVCYSxnQ0FBQTtJQUNULHlEQUFBLFNBQUE7O0FBRUE7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTs7QUFFWjs7Ozs7SUFLQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjs7QUFFckI7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLElBQUEsQ0FBSyxpQkFBTCxFQUF3QixFQUF4Qjs7QUFFWjs7Ozs7SUFLQSxJQUFDLENBQUEsU0FBRCxHQUFhOztBQUViOzs7OztJQUtBLElBQUMsQ0FBQSxRQUFELEdBQVk7O0FBRVo7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlO0VBekROOzs7QUEyRGI7Ozs7Ozs7Ozs7bUNBU0EsZUFBQSxHQUFpQixTQUFDLElBQUQsRUFBTyxNQUFQO0FBQ2IsUUFBQTtJQUFBLEtBQUEsR0FBUTtJQUNSLElBQUcsaUJBQUg7TUFDSSxNQUFBLEdBQVMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQVYsQ0FBZ0IsR0FBaEI7TUFDVCxLQUFBLEdBQVEsTUFBTyxDQUFBLENBQUE7TUFDZixJQUFHLE1BQU8sQ0FBQSxDQUFBLENBQVAsS0FBYSxHQUFoQjtRQUNJLEtBQUEsR0FBUSxXQUFXLENBQUMsYUFBYSxDQUFDLE9BQVEsQ0FBQSxRQUFBLENBQVMsTUFBTyxDQUFBLENBQUEsQ0FBaEIsQ0FBQSxHQUFvQixDQUFwQixFQUQ5QztPQUFBLE1BRUssSUFBRyxNQUFPLENBQUEsQ0FBQSxDQUFQLEtBQWEsR0FBaEI7UUFDRCxLQUFBLEdBQVEsV0FBVyxDQUFDLGFBQWEsQ0FBQyxpQkFBa0IsQ0FBQSxRQUFBLENBQVMsTUFBTyxDQUFBLENBQUEsQ0FBaEIsQ0FBQSxHQUFvQixDQUFwQixFQURuRDtPQUFBLE1BRUEsSUFBRyxNQUFPLENBQUEsQ0FBQSxDQUFQLEtBQWEsR0FBaEI7UUFDRCxLQUFBLEdBQVEsV0FBVyxDQUFDLGFBQWEsQ0FBQyxhQUExQixDQUF3QztVQUFFLEtBQUEsRUFBTyxDQUFUO1VBQVksS0FBQSxFQUFPLFFBQUEsQ0FBUyxNQUFPLENBQUEsQ0FBQSxDQUFoQixDQUFBLEdBQW9CLENBQXZDO1NBQXhDLEVBRFA7T0FQVDs7QUFVQSxXQUFPLEVBQUEsR0FBSyxJQUFLLENBQUEsS0FBQTtFQVpKOzs7QUFlakI7Ozs7Ozs7Ozs7O21DQVVBLHVCQUFBLEdBQXlCLFNBQUMsVUFBRCxFQUFhLElBQWIsRUFBbUIsS0FBbkI7QUFDckIsUUFBQTtJQUFBLE1BQUEsR0FBUyxDQUFDLENBQUQsRUFBSSxVQUFKO0lBRVQsSUFBRyxLQUFBLENBQU0sVUFBTixDQUFIO01BQ0ksS0FBQSxHQUFRLFVBQVUsQ0FBQyxXQUFYLENBQXVCLEdBQXZCO01BQ1IsSUFBRyxLQUFBLEtBQVMsQ0FBQyxDQUFiO1FBQ0ksTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLFVBQVUsQ0FBQyxTQUFYLENBQXFCLENBQXJCLEVBQXdCLEtBQXhCO1FBQ1osTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLFVBQVUsQ0FBQyxTQUFYLENBQXFCLEtBQUEsR0FBTSxDQUEzQjtRQUNaLElBQUcsS0FBQSxDQUFNLE1BQU8sQ0FBQSxDQUFBLENBQWIsQ0FBSDtVQUNJLE1BQU8sQ0FBQSxDQUFBLENBQVAsR0FBWSxXQUFXLENBQUMsYUFBYSxDQUFDLGVBQTFCLENBQTBDLE1BQU8sQ0FBQSxDQUFBLENBQWpELEVBQXFELElBQXJELEVBQTJELEtBQTNELEVBQWtFLE1BQU8sQ0FBQSxDQUFBLENBQXpFLENBQUEsR0FBK0UsRUFEL0Y7U0FBQSxNQUFBO1VBR0ksTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFZLFFBQUEsQ0FBUyxNQUFPLENBQUEsQ0FBQSxDQUFoQixFQUhoQjtTQUhKO09BQUEsTUFBQTtRQVFJLE1BQU8sQ0FBQSxDQUFBLENBQVAsR0FBWSxXQUFXLENBQUMsYUFBYSxDQUFDLGVBQTFCLENBQTBDLE1BQU8sQ0FBQSxDQUFBLENBQWpELEVBQXFELElBQXJELEVBQTJELEtBQTNELEVBQWtFLE1BQU8sQ0FBQSxDQUFBLENBQXpFLENBQUEsR0FBK0UsRUFSL0Y7T0FGSjtLQUFBLE1BQUE7TUFZSSxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVksUUFBQSxDQUFTLE1BQU8sQ0FBQSxDQUFBLENBQWhCLEVBWmhCOztBQWNBLFdBQU87RUFqQmM7O21DQW1CekIsd0JBQUEsR0FBMEIsU0FBQyxJQUFEO0FBQ3RCLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxnQ0FBYixFQUErQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFJLElBQUosRUFBVSxLQUFWO0FBQ3BELFlBQUE7UUFBQSxLQUFBLEdBQVEsS0FBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLEVBQW1CLEtBQW5CO1FBQ1IsSUFBRyxPQUFPLEtBQVAsS0FBaUIsUUFBcEI7QUFDSSxpQkFBTyxNQURYO1NBQUEsTUFBQTtBQUdJLGlCQUFPLEVBSFg7O01BRm9EO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQztBQU9ULFdBQU87RUFUZTs7O0FBVzFCOzs7Ozs7Ozs7bUNBUUEsV0FBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLEtBQVA7QUFDVCxRQUFBO0lBQUEsV0FBQSxHQUFjO0lBQ2QsS0FBQSxHQUFXLEtBQUEsQ0FBTSxLQUFOLENBQUgsR0FBcUIsS0FBckIsR0FBZ0MsUUFBQSxDQUFTLEtBQVQ7QUFDeEMsWUFBTyxJQUFQO0FBQUEsV0FDUyxJQURUO1FBRVEsV0FBQSxHQUFrQixJQUFBLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQWpCLEVBQXVCLEtBQXZCO1FBQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixHQUFhLFdBQVcsQ0FBQyxLQUFaLElBQXFCLElBQUMsQ0FBQTtRQUNuQyxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsR0FBdkI7QUFIWjtBQURULFdBS1MsR0FMVDtRQU1RLFdBQUEsR0FBYztVQUFFLElBQUEsRUFBTSxJQUFSO1VBQWMsS0FBQSxFQUFPLEtBQXJCOztBQUNkLGdCQUFPLEtBQVA7QUFBQSxlQUNTLEdBRFQ7WUFDa0IsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO0FBQTNCO0FBRFQsZUFFUyxHQUZUO1lBRWtCLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBTixHQUFzQjtBQUEvQjtBQUZULGVBR1MsR0FIVDtZQUdrQixJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZTtBQUF4QjtBQUhULGVBSVMsR0FKVDtZQUlrQixJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sR0FBYTtBQUF0QjtBQUpULGVBS1MsR0FMVDtZQUtrQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7QUFBM0I7QUFMVCxlQU1TLElBTlQ7WUFNbUIsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO0FBQTVCO0FBTlQsZUFPUyxJQVBUO1lBT21CLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBTixHQUFzQjtBQUFoQztBQVBULGVBUVMsSUFSVDtZQVFtQixJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZTtBQUF6QjtBQVJULGVBU1MsSUFUVDtZQVNtQixJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sR0FBYTtBQUF2QjtBQVRULGVBVVMsSUFWVDtZQVVtQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7QUFBNUI7QUFWVCxlQVdTLEdBWFQ7WUFZUSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7WUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUFOLEdBQXNCO1lBQ3RCLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlO1lBQ2YsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLEdBQWE7WUFDYixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7QUFoQjFCO1FBaUJBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixHQUF2QjtBQW5CWjtBQUxULFdBeUJTLEdBekJUO1FBMEJRLFdBQUEsR0FBa0IsSUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixJQUFqQixFQUF1QixLQUF2QjtRQUNsQixJQUFHLEtBQUEsQ0FBTSxLQUFOLENBQUg7VUFDSSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sR0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQVQsQ0FBaUIsS0FBakIsRUFEbEI7U0FBQSxNQUVLLElBQUcsS0FBQSxJQUFTLENBQVo7VUFDRCxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sR0FBYyxJQUFJLENBQUMsYUFEbEI7U0FBQSxNQUFBO1VBR0QsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLEdBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFULENBQW9CLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTyxDQUFBLEtBQUEsR0FBTSxDQUFOLENBQTVCLElBQXdDLElBQUksQ0FBQyxZQUFqRSxFQUhiOztBQUpKO0FBekJULFdBaUNTLElBakNUO1FBa0NRLE1BQUEsR0FBWSxLQUFBLENBQU0sS0FBTixDQUFILEdBQXFCLEtBQUssQ0FBQyxLQUFOLENBQVksR0FBWixDQUFyQixHQUEyQyxDQUFDLEtBQUQ7UUFDcEQsSUFBRyxNQUFPLENBQUEsQ0FBQSxDQUFWO1VBQ0ksTUFBQSxHQUFTLE1BQU8sQ0FBQSxDQUFBO1VBQ2hCLE1BQUEsR0FBUyxJQUFDLENBQUEsdUJBQUQsQ0FBeUIsTUFBTyxDQUFBLENBQUEsQ0FBaEMsRUFBb0MsUUFBcEMsRUFBOEMsQ0FBOUM7VUFDVCxXQUFBLEdBQWMsT0FBQSxDQUFRLEdBQUEsR0FBSSxNQUFKLEdBQVcsR0FBbkIsRUFBeUIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxlQUFnQixDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQVAsSUFBVyxDQUFYLENBQWMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVUsQ0FBVixDQUF4RCxJQUF3RSxDQUFqRyxFQUhsQjtTQUFBLE1BQUE7VUFLSSxNQUFBLEdBQVMsSUFBQyxDQUFBLHVCQUFELENBQXlCLE1BQU8sQ0FBQSxDQUFBLENBQWhDLEVBQW9DLFFBQXBDLEVBQThDLENBQTlDO1VBQ1QsV0FBQSxHQUFjLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxlQUFnQixDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQVAsSUFBVyxDQUFYLENBQWMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVUsQ0FBVixDQUF4RCxJQUF3RSxDQUF6RSxDQUEyRSxDQUFDLFFBQTVFLENBQUEsRUFObEI7O0FBRkM7QUFqQ1QsV0EwQ1MsSUExQ1Q7UUEyQ1EsTUFBQSxHQUFTLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixLQUF6QixFQUFnQyxRQUFoQyxFQUEwQyxDQUExQztRQUNULFdBQUEsR0FBZSxXQUFXLENBQUMsYUFBYSxDQUFDLGVBQWdCLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUCxJQUFXLENBQVgsQ0FBYyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQVAsR0FBVSxDQUFWLENBQXhELElBQXdFO1FBQ3ZGLFdBQUEsR0FBYyxXQUFXLENBQUMsS0FBWixDQUFrQixnQ0FBbEI7UUFDZCxJQUFHLFdBQVcsQ0FBQyxNQUFaLEdBQXFCLENBQXhCO1VBQ0ksSUFBQSxHQUFPLFdBQVksQ0FBQSxXQUFXLENBQUMsTUFBWixHQUFxQixDQUFyQjtVQUNuQixJQUFBLENBQUEsaUJBQXlCLElBQUksQ0FBRSxnQkFBTixHQUFlLENBQXhDLENBQUE7WUFBQSxXQUFXLENBQUMsR0FBWixDQUFBLEVBQUE7V0FGSjtTQUFBLE1BQUE7VUFJSSxXQUFBLDBDQUErQixHQUpuQzs7QUFKQztBQTFDVCxXQW1EUyxJQW5EVDtRQW9EUSxNQUFBLEdBQVMsSUFBQyxDQUFBLHVCQUFELENBQXlCLEtBQXpCLEVBQWdDLFNBQWhDLEVBQTJDLENBQTNDO1FBQ1QsV0FBQSxHQUFjLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxnQkFBaUIsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFQLElBQVcsQ0FBWCxDQUFjLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFVLENBQVYsQ0FBekQsSUFBeUUsS0FBMUUsQ0FBZ0YsQ0FBQyxRQUFqRixDQUFBO0FBRmI7QUFuRFQsV0FzRFMsSUF0RFQ7UUF1RFEsTUFBQSxHQUFTLEtBQUssQ0FBQyxLQUFOLENBQVksR0FBWjtRQUNULGNBQUEsR0FBaUIsSUFBQyxDQUFBLHVCQUFELENBQXlCLE1BQU8sQ0FBQSxDQUFBLENBQWhDLEVBQW9DLE1BQXBDLEVBQTRDLENBQTVDO1FBQ2pCLFdBQUEsR0FBYyxJQUFDLENBQUEsZUFBRCxDQUFpQixXQUFXLENBQUMsYUFBYSxDQUFDLGFBQWMsQ0FBQSxjQUFlLENBQUEsQ0FBQSxDQUFmLENBQW1CLENBQUEsY0FBZSxDQUFBLENBQUEsQ0FBZixHQUFrQixDQUFsQixDQUEzRCxJQUFtRixFQUFwRyxFQUF3RyxNQUF4RztBQUhiO0FBdERULFdBMERTLElBMURUO1FBMkRRLE1BQUEsR0FBWSxLQUFBLENBQU0sS0FBTixDQUFILEdBQXFCLEtBQUssQ0FBQyxLQUFOLENBQVksR0FBWixDQUFyQixHQUEyQyxDQUFDLEtBQUQ7UUFDcEQsSUFBRyxNQUFPLENBQUEsQ0FBQSxDQUFWO1VBQ0ksTUFBQSxHQUFTLE1BQU8sQ0FBQSxDQUFBO1VBQ2hCLE1BQUEsR0FBUyxJQUFDLENBQUEsdUJBQUQsQ0FBeUIsTUFBTyxDQUFBLENBQUEsQ0FBaEMsRUFBb0MsUUFBcEMsRUFBOEMsQ0FBOUM7VUFDVCxXQUFBLEdBQWMsT0FBQSxDQUFRLEdBQUEsR0FBSSxNQUFKLEdBQVcsR0FBbkIsaUZBQWlGLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFVLENBQVYsV0FBeEQsSUFBd0UsQ0FBakcsRUFIbEI7U0FBQSxNQUFBO1VBS0ksTUFBQSxHQUFTLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUFPLENBQUEsQ0FBQSxDQUFoQyxFQUFvQyxRQUFwQyxFQUE4QyxDQUE5QztVQUNULFdBQUEsR0FBYyw2RkFBb0UsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVUsQ0FBVixXQUFuRSxJQUFtRixDQUFwRixDQUFzRixDQUFDLFFBQXZGLENBQUEsRUFObEI7O0FBRkM7QUExRFQsV0FtRVMsSUFuRVQ7UUFvRVEsTUFBQSxHQUFTLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixLQUF6QixFQUFnQyxRQUFoQyxFQUEwQyxDQUExQztRQUNULFdBQUEsMEZBQStFLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFVLENBQVYsV0FBaEUsSUFBZ0Y7UUFDL0YsV0FBQSxHQUFjLFdBQVcsQ0FBQyxLQUFaLENBQWtCLGdDQUFsQjtRQUNkLElBQUcsV0FBVyxDQUFDLE1BQVosR0FBcUIsQ0FBeEI7VUFDSSxJQUFBLEdBQU8sV0FBWSxDQUFBLFdBQVcsQ0FBQyxNQUFaLEdBQXFCLENBQXJCO1VBQ25CLElBQUEsQ0FBQSxpQkFBeUIsSUFBSSxDQUFFLGdCQUFOLEdBQWUsQ0FBeEMsQ0FBQTtZQUFBLFdBQVcsQ0FBQyxHQUFaLENBQUEsRUFBQTtXQUZKO1NBQUEsTUFBQTtVQUlJLFdBQUEsNENBQStCLEdBSm5DOztBQUpDO0FBbkVULFdBNEVTLElBNUVUO1FBNkVRLE1BQUEsR0FBUyxJQUFDLENBQUEsdUJBQUQsQ0FBeUIsS0FBekIsRUFBZ0MsU0FBaEMsRUFBMkMsQ0FBM0M7UUFDVCxXQUFBLEdBQWMseUZBQWtFLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFVLENBQVYsV0FBakUsSUFBaUYsS0FBbEYsQ0FBd0YsQ0FBQyxRQUF6RixDQUFBO0FBRmI7QUE1RVQsV0ErRVMsSUEvRVQ7UUFnRlEsTUFBQSxHQUFTLEtBQUssQ0FBQyxLQUFOLENBQVksR0FBWjtRQUNULGNBQUEsR0FBaUIsSUFBQyxDQUFBLHVCQUFELENBQXlCLE1BQU8sQ0FBQSxDQUFBLENBQWhDLEVBQW9DLE1BQXBDLEVBQTRDLENBQTVDO1FBQ2pCLFdBQUEsR0FBYyxJQUFDLENBQUEsZUFBRCw4RkFBdUYsQ0FBQSxjQUFlLENBQUEsQ0FBQSxDQUFmLEdBQWtCLENBQWxCLFdBQXRFLElBQThGLEVBQS9HLEVBQW1ILE1BQW5IO0FBSGI7QUEvRVQsV0FtRlMsSUFuRlQ7UUFvRlEsTUFBQSxHQUFZLEtBQUEsQ0FBTSxLQUFOLENBQUgsR0FBcUIsS0FBSyxDQUFDLEtBQU4sQ0FBWSxHQUFaLENBQXJCLEdBQTJDLENBQUMsS0FBRDtRQUNwRCxJQUFHLE1BQU8sQ0FBQSxDQUFBLENBQVY7VUFDSSxNQUFBLEdBQVMsTUFBTyxDQUFBLENBQUE7VUFDaEIsTUFBQSxHQUFTLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUFPLENBQUEsQ0FBQSxDQUFoQyxFQUFvQyxRQUFwQyxFQUE4QyxDQUE5QztVQUNULFdBQUEsR0FBYyxPQUFBLENBQVEsR0FBQSxHQUFJLE1BQUosR0FBVyxHQUFuQixFQUF5QixXQUFXLENBQUMsYUFBYSxDQUFDLGFBQTFCLENBQXdDO1lBQUUsS0FBQSxFQUFPLENBQVQ7WUFBWSxLQUFBLEVBQU8sTUFBTyxDQUFBLENBQUEsQ0FBUCxHQUFVLENBQTdCO1dBQXhDLENBQUEsSUFBNEUsQ0FBckcsRUFIbEI7U0FBQSxNQUFBO1VBS0ksTUFBQSxHQUFTLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixNQUFPLENBQUEsQ0FBQSxDQUFoQyxFQUFvQyxRQUFwQyxFQUE4QyxDQUE5QztVQUNULFdBQUEsR0FBYyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsYUFBMUIsQ0FBd0M7WUFBRSxLQUFBLEVBQU8sQ0FBVDtZQUFZLEtBQUEsRUFBTyxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVUsQ0FBN0I7V0FBeEMsQ0FBQSxJQUE0RSxDQUE3RSxDQUErRSxDQUFDLFFBQWhGLENBQUEsRUFObEI7O0FBRkM7QUFuRlQsV0E0RlMsSUE1RlQ7UUE2RlEsTUFBQSxHQUFTLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixLQUF6QixFQUFnQyxRQUFoQyxFQUEwQyxDQUExQztRQUNULFdBQUEsR0FBYyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsYUFBMUIsQ0FBd0M7VUFBRSxLQUFBLEVBQU8sQ0FBVDtVQUFZLEtBQUEsRUFBTyxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVUsQ0FBN0I7U0FBeEMsQ0FBQSxJQUE0RSxFQUE3RSxDQUFnRixDQUFDLFFBQWpGLENBQUE7UUFDZCxXQUFBLEdBQWMsV0FBVyxDQUFDLEtBQVosQ0FBa0IsZ0NBQWxCO1FBQ2QsSUFBRyxXQUFXLENBQUMsTUFBWixHQUFxQixDQUF4QjtVQUNJLElBQUEsR0FBTyxXQUFZLENBQUEsV0FBVyxDQUFDLE1BQVosR0FBcUIsQ0FBckI7VUFDbkIsSUFBQSxDQUFBLGlCQUF5QixJQUFJLENBQUUsZ0JBQU4sR0FBZSxDQUF4QyxDQUFBO1lBQUEsV0FBVyxDQUFDLEdBQVosQ0FBQSxFQUFBO1dBRko7U0FBQSxNQUFBO1VBSUksV0FBQSw0Q0FBK0IsR0FKbkM7O0FBSkM7QUE1RlQsV0FxR1MsSUFyR1Q7UUFzR1EsTUFBQSxHQUFTLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixLQUF6QixFQUFnQyxTQUFoQyxFQUEyQyxDQUEzQztRQUNULFdBQUEsR0FBYyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsY0FBMUIsQ0FBeUM7VUFBRSxLQUFBLEVBQU8sQ0FBVDtVQUFZLEtBQUEsRUFBTyxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVUsQ0FBN0I7U0FBekMsQ0FBQSxJQUE2RSxLQUE5RSxDQUFvRixDQUFDLFFBQXJGLENBQUE7QUFGYjtBQXJHVCxXQXdHUyxJQXhHVDtRQXlHUSxNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQU4sQ0FBWSxHQUFaO1FBQ1QsY0FBQSxHQUFpQixJQUFDLENBQUEsdUJBQUQsQ0FBeUIsTUFBTyxDQUFBLENBQUEsQ0FBaEMsRUFBb0MsTUFBcEMsRUFBNEMsQ0FBNUM7UUFDakIsV0FBQSxHQUFjLElBQUMsQ0FBQSxlQUFELENBQWlCLFdBQVcsQ0FBQyxhQUFhLENBQUMsWUFBMUIsQ0FBdUM7VUFBRSxLQUFBLEVBQU8sQ0FBVDtVQUFZLEtBQUEsRUFBTyxjQUFlLENBQUEsQ0FBQSxDQUFmLEdBQWtCLENBQXJDO1NBQXZDLENBQUEsSUFBbUYsRUFBcEcsRUFBd0csTUFBeEc7QUFIYjtBQXhHVCxXQTRHUyxHQTVHVDtRQTZHUSxXQUFBLEdBQWMsQ0FBSSx1Q0FBSCxHQUF5QyxHQUFBLENBQUksYUFBYSxDQUFDLFVBQVcsQ0FBQSxLQUFBLENBQU0sQ0FBQyxJQUFwQyxDQUF6QyxHQUF3RixFQUF6RjtBQURiO0FBNUdULFdBOEdTLElBOUdUO1FBK0dRLElBQUEsR0FBTyxLQUFLLENBQUMsS0FBTixDQUFZLEdBQVo7UUFDUCxXQUFBLEdBQWM7VUFBRSxJQUFBLEVBQU0sSUFBUjtVQUFjLFNBQUEsb0NBQXFCLENBQW5DO1VBQXNDLEVBQUEsRUFBSSxJQUFLLENBQUEsQ0FBQSxDQUEvQztVQUFtRCxFQUFBLEVBQUksSUFBSyxDQUFBLENBQUEsQ0FBNUQ7VUFBZ0UsTUFBQSxFQUFRO1lBQUUsS0FBQSxFQUFPLENBQVQ7WUFBWSxNQUFBLEVBQVEsQ0FBcEI7V0FBeEU7VUFBaUcsTUFBQSxFQUFRO1lBQUUsS0FBQSxFQUFPLENBQVQ7WUFBWSxNQUFBLEVBQVEsQ0FBcEI7V0FBekc7O0FBRmI7QUE5R1QsV0FpSFMsR0FqSFQ7UUFrSFEsS0FBQSxHQUFRLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQWhDLENBQXNDLFNBQUMsQ0FBRDtpQkFBTyxDQUFDLENBQUMsSUFBRixLQUFVO1FBQWpCLENBQXRDO1FBQ1IsSUFBRyxLQUFIO1VBQ0ksSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLENBQWpCO1lBQ0ksV0FBQSxHQUFjLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBZCxDQUFvQixnQ0FBcEI7WUFDZCxXQUFXLENBQUMsR0FBWixDQUFBLEVBRko7V0FBQSxNQUdLLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxDQUFqQjtZQUNELElBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVjtjQUNJLEtBQUssQ0FBQyxXQUFOLEdBQW9CLElBQUEsQ0FBSyw0QkFBQSxHQUE2QixLQUFLLENBQUMsT0FBbkMsR0FBMkMsS0FBaEQsRUFEeEI7O1lBRUEsV0FBQSxHQUFjLEtBQUssQ0FBQyxXQUFOLENBQWtCLElBQUMsQ0FBQSxNQUFuQixFQUEyQixLQUEzQjtZQUNkLFdBQUEsR0FBYyxXQUFXLENBQUMsS0FBWixDQUFrQixnQ0FBbEI7WUFDZCxJQUFHLFdBQVcsQ0FBQyxNQUFaLEdBQXFCLENBQXhCO2NBQ0ksV0FBVyxDQUFDLEdBQVosQ0FBQSxFQURKO2FBTEM7V0FBQSxNQUFBO1lBUUQsSUFBRyxDQUFDLEtBQUssQ0FBQyxXQUFWO2NBQ0ksS0FBSyxDQUFDLFdBQU4sR0FBb0IsSUFBQSxDQUFLLHFCQUFBLEdBQXNCLEtBQUssQ0FBQyxPQUE1QixHQUFvQyxLQUF6QyxFQUR4Qjs7WUFFQSxXQUFBLEdBQWtCLElBQUEsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsR0FBakIsRUFBc0IsS0FBSyxDQUFDLFdBQTVCLEVBVmpCO1dBSlQ7U0FBQSxNQUFBO1VBZ0JJLFdBQUEsR0FBYyxHQWhCbEI7O0FBRkM7QUFqSFQ7UUFxSVEsV0FBQSxHQUFrQixJQUFBLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQWpCLEVBQXVCLEtBQXZCO0FBckkxQjtBQXVJQSxXQUFPO0VBMUlFOzs7QUE2SWI7Ozs7Ozs7O21DQU9BLGVBQUEsR0FBaUIsU0FBQyxLQUFEO0FBQ2IsUUFBQTtJQUFBLEtBQUEsR0FBUTtJQUNSLElBQUEsR0FBTztJQUVQLElBQUcsS0FBSyxDQUFDLFNBQVQ7TUFDSSxLQUFBLEdBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFPLENBQUEsV0FBQSxHQUFZLEtBQUssQ0FBQyxTQUFsQixFQURoQzs7SUFHQSxJQUFHLENBQUMsS0FBSjtNQUNJLEtBQUEsR0FBUSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU8sQ0FBQSxVQUFBLEVBRGhDOztJQUdBLElBQUEsK0RBQXFCLElBQUMsQ0FBQTtJQUN0QixJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxJQUFMLElBQWEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLEdBQWE7QUFFdEMsV0FBTztFQWJNOzs7QUFlakI7Ozs7Ozs7Ozs7bUNBU0EsbUJBQUEsR0FBcUIsU0FBQyxLQUFEO0FBQ2pCLFFBQUE7SUFBQSxJQUFBLEdBQU87QUFFUCxZQUFPLEtBQUssQ0FBQyxJQUFiO0FBQUEsV0FDUyxHQURUO1FBRVEsU0FBQSxHQUFZLGFBQWEsQ0FBQyxVQUFXLENBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFLLENBQUMsS0FBTixHQUFZLENBQXJCLEVBQXdCLENBQXhCLENBQUE7UUFDckMsSUFBRyw2REFBSDtVQUNJLFdBQUEsR0FBYyxlQUFlLENBQUMsU0FBaEIsQ0FBMEIsZUFBZSxDQUFDLE9BQWhCLENBQXdCLFNBQVMsQ0FBQyxPQUFsQyxDQUExQjtVQUNkLElBQUcsbUJBQUg7WUFDSSxJQUFBLEdBQU87Y0FBQSxLQUFBLEVBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFXLENBQUMsS0FBWixHQUFvQixTQUFTLENBQUMsT0FBekMsQ0FBUDtjQUEwRCxNQUFBLEVBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFXLENBQUMsTUFBWixHQUFxQixTQUFTLENBQUMsT0FBMUMsQ0FBbEU7Y0FEWDtXQUZKOztBQUZDO0FBRFQsV0FPUyxJQVBUO1FBUVEsSUFBQSxHQUFPLElBQUMsQ0FBQSxlQUFELENBQWlCLEtBQWpCO1FBQ1AsRUFBQSxHQUFLLElBQUksQ0FBQztRQUNWLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBSSxDQUFDLElBQUwsSUFBYSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sR0FBYTtRQUN0QyxLQUFLLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsS0FBSyxDQUFDLEVBQTdCO1FBQ2YsS0FBSyxDQUFDLE1BQU4sR0FBZSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsS0FBSyxDQUFDLEVBQTVCO1FBQ2YsSUFBSSxDQUFDLElBQUwsR0FBWTtRQUVaLElBQUEsR0FBTztVQUFBLEtBQUEsRUFBTyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBdEIsRUFBNkIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUExQyxDQUFQO1VBQXlELE1BQUEsRUFBUSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQWIsR0FBc0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFwRzs7QUFmZjtBQWlCQSxXQUFPO0VBcEJVOzs7QUFzQnJCOzs7Ozs7Ozs7O21DQVNBLGdCQUFBLEdBQWtCLFNBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsTUFBaEI7QUFDZCxRQUFBO0FBQUEsWUFBTyxLQUFLLENBQUMsSUFBYjtBQUFBLFdBQ1MsR0FEVDtRQUVRLFNBQUEsR0FBWSxhQUFhLENBQUMsVUFBVyxDQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBSyxDQUFDLEtBQU4sR0FBWSxDQUFyQixFQUF3QixDQUF4QixDQUFBO1FBQ3JDLElBQUcsNkRBQUg7VUFDSSxXQUFBLEdBQWMsZUFBZSxDQUFDLFNBQWhCLENBQTBCLGVBQWUsQ0FBQyxPQUFoQixDQUF3QixTQUFTLENBQUMsT0FBbEMsQ0FBMUI7VUFDZCxJQUFHLG1CQUFIO1lBQ0ksSUFBQSxHQUFXLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsV0FBVyxDQUFDLEtBQVosR0FBb0IsU0FBUyxDQUFDLE9BQXpDLENBQWQsRUFBaUUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFXLENBQUMsTUFBWixHQUFxQixTQUFTLENBQUMsT0FBMUMsQ0FBakU7bUJBQ1gsTUFBTSxDQUFDLEdBQVAsQ0FBVyxNQUFYLEVBQW1CLElBQUMsQ0FBQSxRQUFwQixFQUE4QixXQUE5QixFQUEyQyxJQUEzQyxFQUZKO1dBRko7O0FBRkM7QUFEVCxXQVFTLElBUlQ7UUFTUSxLQUFBLEdBQVE7UUFDUixJQUFHLEtBQUssQ0FBQyxTQUFUO1VBQ0ksS0FBQSxHQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTyxDQUFBLFdBQUEsR0FBWSxLQUFLLENBQUMsU0FBbEIsRUFEaEM7O1FBRUEsSUFBRyxDQUFDLEtBQUo7VUFDSSxLQUFBLEdBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFPLENBQUEsVUFBQSxFQURoQzs7UUFHQSxJQUFBLCtEQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDO1FBQzdCLEVBQUEsR0FBSyxJQUFJLENBQUM7UUFDVixJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxJQUFMLElBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBYixHQUFvQjtRQUU3QyxJQUFHLEtBQUEsSUFBVSwrQ0FBc0IsQ0FBRSxlQUFyQztVQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBWCxDQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQTVCLEVBREo7O1FBR0EsTUFBTSxDQUFDLElBQVAsR0FBYztRQUNkLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCLEVBQXdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBcEMsRUFBNkMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQXRCLEVBQTZCLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBMUMsQ0FBN0MsRUFBK0YsTUFBTSxDQUFDLE1BQXRHLEVBQThHLEtBQUssQ0FBQyxFQUFwSCxFQUF3SCxDQUF4SCxFQUEySCxDQUEzSDtRQUNBLE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBTCxHQUFZO2VBQ1osTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEIsRUFBd0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFyQyxFQUE2QyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBdEIsRUFBNkIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUExQyxDQUE3QyxFQUErRixNQUFNLENBQUMsTUFBdEcsRUFBOEcsS0FBSyxDQUFDLEVBQXBILEVBQXdILENBQXhILEVBQTJILENBQTNIO0FBMUJSO0VBRGM7OztBQThCbEI7Ozs7Ozs7Ozs7Ozs7O21DQWFBLGdCQUFBLEdBQWtCLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxLQUFkLEVBQXFCLE1BQXJCLEVBQTZCLE1BQTdCO0FBQ2QsUUFBQTtJQUFBLFdBQUEsR0FBYztJQUNkLFNBQUEsR0FBWTtJQUNaLE9BQUEsR0FBVTtJQUNWLE9BQUEsR0FBVSxJQUFDLENBQUEsSUFBSSxDQUFDO0lBQ2hCLElBQUEsR0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLEtBQXZCO0lBQ1AsS0FBQSxHQUFRO0lBQ1IsVUFBQSxHQUFhO0lBQ2IsQ0FBQSxHQUFJO0lBQ0osQ0FBQSxHQUFJO0lBQ0osa0JBQUEsR0FBcUI7SUFFckIsSUFBRyxJQUFJLENBQUMsS0FBTCxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWhCLEdBQXNCLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxHQUFpQixDQUF2QyxHQUF5QyxJQUFDLENBQUEsT0FBRCxHQUFTLENBQWxFO0FBQ0ksYUFBTSxDQUFBLEdBQUksS0FBSyxDQUFDLE1BQWhCO1FBQ0ksRUFBQSxHQUFLLEtBQU0sQ0FBQSxDQUFBO1FBQ1gsSUFBQSxHQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsRUFBdkI7UUFDUCxLQUFBLElBQVMsSUFBSSxDQUFDO1FBQ2QsS0FBQSxHQUFRO1FBQ1IsSUFBRyxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBaEIsR0FBd0IsSUFBQyxDQUFBLE9BQUQsR0FBUyxDQUE1QztVQUNJLFVBQUEsR0FBYTtVQUNiLENBQUEsR0FBSTtBQUVKLGlCQUFBLElBQUE7WUFDSSxLQUFBLEdBQVE7QUFFUixtQkFBTSxDQUFBLEdBQUksQ0FBSixJQUFVLFdBQVcsQ0FBQyxPQUFaLENBQW9CLEtBQU0sQ0FBQSxDQUFBLENBQTFCLENBQUEsS0FBaUMsQ0FBQyxDQUFsRDtjQUNJLENBQUE7Y0FDQSxLQUFBLEdBQVE7WUFGWjtBQUlBLG1CQUFNLENBQUEsR0FBSSxDQUFKLElBQVUsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsS0FBTSxDQUFBLENBQUEsR0FBRSxDQUFGLENBQXhCLENBQUEsS0FBaUMsQ0FBQyxDQUFsRDtjQUNJLENBQUE7Y0FDQSxLQUFBLEdBQVE7WUFGWjtBQUlBLG1CQUFNLENBQUEsR0FBSSxDQUFKLElBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsS0FBTSxDQUFBLENBQUEsR0FBRSxDQUFGLENBQXRCLENBQUEsS0FBK0IsQ0FBQyxDQUFoRDtjQUNJLENBQUE7Y0FDQSxLQUFBLEdBQVE7WUFGWjtZQUlBLElBQUcsQ0FBQSxLQUFLLENBQUwsSUFBVyxLQUFkO0FBQ0ksb0JBREo7YUFBQSxNQUFBO2NBR0ksQ0FBQSxHQUFJLEVBSFI7O1lBS0EsVUFBQTtZQUNBLElBQVMsVUFBQSxJQUFjLEtBQWQsSUFBdUIsQ0FBQyxLQUFqQztBQUFBLG9CQUFBOztVQXJCSjtVQXVCQSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQWIsQ0FBc0IsSUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixJQUFqQixFQUF1QixLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsQ0FBcEMsQ0FBdkIsRUFBK0QsSUFBQyxDQUFBLElBQWhFLENBQXRCO1VBQ0Esa0JBQUEsR0FBcUI7VUFDckIsSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUF2QjtVQUNkLElBQUksQ0FBQyxLQUFMLEdBQWEsS0FBQSxHQUFRLElBQUksQ0FBQztVQUMxQixJQUFJLENBQUMsT0FBTCxHQUFlO1VBQ2YsT0FBQSxHQUFVLElBQUMsQ0FBQSxJQUFJLENBQUM7VUFDaEIsTUFBQSxHQUFTLElBQUksQ0FBQztVQUNkLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjtVQUNBLElBQUEsR0FBVyxJQUFBLEVBQUUsQ0FBQyxnQkFBSCxDQUFBO1VBQ1gsS0FBQSxHQUFRLEtBQUEsR0FBUSxDQUFDLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBZCxFQXBDcEI7O1FBc0NBLENBQUE7TUEzQ0osQ0FESjtLQUFBLE1BQUE7TUE4Q0ksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFiLENBQXNCLElBQUEsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsSUFBakIsRUFBdUIsS0FBdkIsRUFBOEIsSUFBQyxDQUFBLElBQS9CLENBQXRCO01BQ0EsSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUF2QjtNQUNkLElBQUksQ0FBQyxLQUFMLEdBQWEsS0FBQSxHQUFRLElBQUksQ0FBQztNQUMxQixJQUFJLENBQUMsT0FBTCxHQUFlLFFBakRuQjs7SUFtREEsTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBVCxFQUFpQixJQUFDLENBQUEsSUFBSSxDQUFDLFVBQXZCO0lBRVQsSUFBRyxrQkFBQSxLQUFzQixDQUF6QjtNQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFzQixJQUFBLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQWpCLEVBQXVCLEtBQUssQ0FBQyxTQUFOLENBQWdCLGtCQUFoQixFQUFvQyxDQUFwQyxDQUF2QixFQUErRCxJQUFDLENBQUEsSUFBaEUsQ0FBdEI7TUFDQSxJQUFJLENBQUMsS0FBTCxHQUFhO01BQ2IsSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBSSxDQUFDLE1BQXRCO01BQ2QsSUFBSSxDQUFDLE9BQUwsR0FBZSxRQUpuQjs7QUFNQSxXQUFPO0VBdkVPOzs7QUEwRWxCOzs7Ozs7Ozs7Ozs7OzttQ0FhQSxZQUFBLEdBQWMsU0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLEtBQWQsRUFBcUIsTUFBckIsRUFBNkIsTUFBN0I7QUFDVixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsS0FBdkI7SUFDUCxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsTUFBZCxFQUFzQixNQUFBLElBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUF0QztJQUVULElBQUcsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFsQjtNQUNJLEtBQUEsSUFBUyxJQUFJLENBQUM7TUFDZCxJQUFJLENBQUMsS0FBTCxHQUFhO01BQ2IsSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBSSxDQUFDLE1BQXRCO01BQ2QsSUFBSSxDQUFDLE9BQUwsR0FBZSxJQUFDLENBQUEsSUFBSSxDQUFDO01BQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFzQixJQUFBLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQWpCLEVBQXVCLEtBQXZCLENBQXRCLEVBTEo7O0FBT0EsV0FBTztFQVhHOzs7QUFhZDs7Ozs7Ozs7Ozs7Ozs7bUNBYUEsa0JBQUEsR0FBb0IsU0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLEtBQWQsRUFBcUIsTUFBckIsRUFBNkIsTUFBN0I7QUFDaEIsUUFBQTtJQUFBLFlBQUEsR0FBZTtJQUNmLEtBQUEsR0FBUSxLQUFLLENBQUMsS0FBTixDQUFZLEdBQVo7SUFDUixPQUFBLEdBQVUsSUFBQyxDQUFBLElBQUksQ0FBQztJQUNoQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsR0FBdkI7QUFFYixTQUFBLCtDQUFBOztNQUNJLElBQUEsR0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLElBQXZCO01BQ1AsS0FBQSxJQUFTLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBQyxDQUFBLFNBQVMsQ0FBQztNQUVqQyxJQUFHLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFoQixHQUF3QixJQUFDLENBQUEsT0FBRCxHQUFTLENBQTVDO1FBQ0ksS0FBQSxHQUFZLElBQUEsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsSUFBakIsRUFBdUIsWUFBWSxDQUFDLElBQWIsQ0FBa0IsR0FBbEIsQ0FBdkI7UUFDWixLQUFLLENBQUMsVUFBTixDQUFpQixJQUFDLENBQUEsSUFBbEI7UUFDQSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQWIsQ0FBa0IsS0FBbEI7UUFDQSxJQUFJLENBQUMsTUFBTCxHQUFjLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBVCxFQUFpQixJQUFJLENBQUMsTUFBdEI7UUFDZCxJQUFJLENBQUMsS0FBTCxHQUFhLEtBQUEsR0FBUSxJQUFJLENBQUM7UUFDMUIsSUFBSSxDQUFDLE9BQUwsR0FBZSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxPQUFkLEVBQXVCLE9BQXZCO1FBQ2YsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxFQUFrQixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQXhCO1FBQ1YsTUFBQSxHQUFTLElBQUksQ0FBQztRQUNkLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjtRQUNBLElBQUEsR0FBVyxJQUFBLEVBQUUsQ0FBQyxnQkFBSCxDQUFBO1FBQ1gsWUFBQSxHQUFlLENBQUMsSUFBRDtRQUNmLEtBQUEsR0FBUSxLQUFBLEdBQVEsQ0FBQyxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBQWQsRUFacEI7T0FBQSxNQUFBO1FBY0ksWUFBWSxDQUFDLElBQWIsQ0FBa0IsSUFBbEIsRUFkSjs7TUFnQkEsTUFBQSxHQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBVCxFQUFpQixJQUFDLENBQUEsSUFBSSxDQUFDLFVBQXZCO0FBcEJiO0lBc0JBLElBQUcsWUFBWSxDQUFDLE1BQWIsR0FBc0IsQ0FBekI7TUFDSSxLQUFBLEdBQVksSUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixJQUFqQixFQUF1QixZQUFZLENBQUMsSUFBYixDQUFrQixHQUFsQixDQUF2QjtNQUNaLEtBQUssQ0FBQyxVQUFOLENBQWlCLElBQUMsQ0FBQSxJQUFsQjtNQUNBLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFrQixLQUFsQjtNQUNBLElBQUksQ0FBQyxLQUFMLEdBQWE7TUFDYixJQUFJLENBQUMsTUFBTCxHQUFjLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBVCxFQUFpQixJQUFJLENBQUMsTUFBdEI7TUFDZCxJQUFJLENBQUMsT0FBTCxHQUFlLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxFQUFrQixJQUFJLENBQUMsT0FBdkIsRUFObkI7O0FBUUEsV0FBTztFQXBDUzs7O0FBc0NwQjs7Ozs7Ozs7Ozs7Ozs7OzttQ0FlQSxlQUFBLEdBQWlCLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxLQUFkLEVBQXFCLE1BQXJCLEVBQTZCLE1BQTdCLEVBQXFDLFFBQXJDO0lBQ2IsSUFBRyxRQUFIO0FBQ0ksY0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDLFFBQWhDO0FBQUEsYUFDUyxZQURUO2lCQUVRLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixLQUFwQixFQUEyQixJQUEzQixFQUFpQyxLQUFqQyxFQUF3QyxNQUF4QyxFQUFnRCxNQUFoRDtBQUZSLGFBR1MsVUFIVDtpQkFJUSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsS0FBbEIsRUFBeUIsSUFBekIsRUFBK0IsS0FBL0IsRUFBc0MsTUFBdEMsRUFBOEMsTUFBOUM7QUFKUixPQURKO0tBQUEsTUFBQTthQU9JLElBQUMsQ0FBQSxZQUFELENBQWMsS0FBZCxFQUFxQixJQUFyQixFQUEyQixLQUEzQixFQUFrQyxNQUFsQyxFQUEwQyxNQUExQyxFQVBKOztFQURhOzs7QUFXakI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQ0FpQkEsY0FBQSxHQUFnQixTQUFDLE9BQUQsRUFBVSxRQUFWLEVBQW9CLGNBQXBCO0FBQ1osUUFBQTtJQUFBLE1BQUEsR0FBUztJQUNULElBQUEsR0FBVyxJQUFBLEVBQUUsQ0FBQyxnQkFBSCxDQUFBO0lBQ1gsS0FBQSxHQUFRLGNBQUEsSUFBa0I7SUFDMUIsTUFBQSxHQUFTO0lBQ1QsT0FBQSxHQUFVLElBQUMsQ0FBQSxJQUFJLENBQUM7SUFDaEIsWUFBQSxHQUFlO0lBQ2YsSUFBQSxHQUFPO0lBQ1AsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsR0FBbEI7SUFDYixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUM7SUFFbEIsTUFBQSxHQUFTLE9BQU8sQ0FBQyxLQUFSLENBQWMsZ0NBQWQ7SUFDVCxLQUFBLEdBQVE7SUFDUixDQUFBLEdBQUk7SUFFSixTQUFBLEdBQVksSUFBQyxDQUFBLElBQUksQ0FBQztJQUNsQixhQUFBLEdBQWdCLElBQUMsQ0FBQSxJQUFJLENBQUM7SUFDdEIsTUFBQSxHQUFTLElBQUMsQ0FBQSxJQUFJLENBQUM7SUFDZixJQUFBLEdBQU8sSUFBQyxDQUFBLElBQUksQ0FBQztJQUNiLFNBQUEsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDO0FBRWxCLFdBQU0sQ0FBQSxHQUFJLE1BQU0sQ0FBQyxNQUFqQjtNQUNJLEtBQUEsR0FBUSxNQUFPLENBQUEsQ0FBQTtNQUVmLElBQUcsQ0FBQSxHQUFJLENBQUosS0FBUyxDQUFaO1FBQ0ksSUFBRyxhQUFIO1VBQ0ksV0FBQSxHQUFjLElBQUMsQ0FBQSxXQUFELENBQWEsS0FBYixFQUFvQixNQUFPLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBM0I7VUFFZCxJQUFHLHdCQUFIO1lBQ0ksS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBdkIsQ0FBNkIsTUFBN0IsRUFBcUMsQ0FBQyxDQUFBLEdBQUUsQ0FBSCxFQUFNLENBQU4sQ0FBUSxDQUFDLE1BQVQsQ0FBZ0IsV0FBaEIsQ0FBckMsRUFESjtXQUFBLE1BRUssSUFBTyx3QkFBUDtZQUNELE1BQU8sQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUFQLEdBQWMsV0FBQSxHQUFjLE1BQU8sQ0FBQSxDQUFBLEdBQUUsQ0FBRixFQURsQztXQUFBLE1BQUE7WUFHRCxJQUFBLEdBQU8sSUFBQyxDQUFBLG1CQUFELENBQXFCLFdBQXJCO1lBQ1AsSUFBRyxJQUFIO2NBQ0ksS0FBQSxJQUFTLElBQUksQ0FBQztjQUNkLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBSSxDQUFDLE1BQXRCLEVBRmI7O1lBSUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFiLENBQWtCLFdBQWxCLEVBUkM7V0FMVDtTQUFBLE1BQUE7VUFlSSxJQUFJLENBQUMsTUFBTCxHQUFjLE1BQUEsSUFBVSxJQUFDLENBQUEsSUFBSSxDQUFDO1VBQzlCLElBQUksQ0FBQyxLQUFMLEdBQWE7VUFDYixJQUFJLENBQUMsT0FBTCxHQUFlO1VBQ2YsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaO1VBQ0EsSUFBQSxHQUFXLElBQUEsRUFBRSxDQUFDLGdCQUFILENBQUE7VUFDWCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQWIsQ0FBc0IsSUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixJQUFqQixFQUF1QixJQUF2QixFQUE2QixJQUFDLENBQUEsSUFBOUIsQ0FBdEI7VUFDQSxLQUFBLEdBQVE7VUFDUixNQUFBLEdBQVM7VUFDVCxPQUFBLEdBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxRQXZCcEI7O1FBd0JBLENBQUEsSUFBSyxFQXpCVDtPQUFBLE1BMEJLLElBQUcsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFsQjtRQUNELElBQUEsR0FBTyxJQUFDLENBQUEsZUFBRCxDQUFpQixLQUFqQixFQUF3QixJQUF4QixFQUE4QixLQUE5QixFQUFxQyxNQUFyQyxFQUE2QyxNQUE3QyxFQUFxRCxRQUFyRDtRQUNQLEtBQUEsR0FBUSxJQUFJLENBQUM7UUFDYixNQUFBLEdBQVMsSUFBSSxDQUFDO1FBQ2QsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUpkOztNQU1MLENBQUE7SUFuQ0o7SUFxQ0EsSUFBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQWIsR0FBc0IsQ0FBdEIsSUFBMkIsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBL0M7TUFDSSxJQUFJLENBQUMsTUFBTCxHQUFjO01BQ2QsSUFBSSxDQUFDLEtBQUwsR0FBYTtNQUNiLElBQUksQ0FBQyxPQUFMLEdBQWU7TUFDZixNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosRUFKSjs7SUFPQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sR0FBYSxJQUFDLENBQUE7SUFDZCxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7SUFDbEIsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUFOLEdBQXNCO0lBQ3RCLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlO0lBQ2YsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLEdBQWE7SUFDYixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7QUFFbEIsV0FBTztFQXhFSzs7O0FBMkVoQjs7Ozs7Ozs7OzttQ0FTQSxxQkFBQSxHQUF1QixTQUFDLEtBQUQsRUFBUSxRQUFSO0FBQ25CLFFBQUE7SUFBQSxJQUFBLEdBQU87TUFBQSxLQUFBLEVBQU8sQ0FBUDtNQUFVLE1BQUEsRUFBUSxDQUFsQjs7QUFFUCxTQUFBLHVDQUFBOztNQUNJLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsS0FBTCxHQUFXLENBQXBCLEVBQXVCLElBQUksQ0FBQyxLQUE1QjtNQUNiLElBQUksQ0FBQyxNQUFMLElBQWUsSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFDLENBQUE7QUFGbEM7SUFJQSxJQUFJLENBQUMsTUFBTCxJQUFlLElBQUMsQ0FBQTtBQUVoQixXQUFPO0VBVFk7OztBQVd2Qjs7Ozs7Ozs7OzttQ0FTQSxvQkFBQSxHQUFzQixTQUFDLElBQUQsRUFBTyxRQUFQO0FBQ2xCLFFBQUE7SUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQWxCO0lBRUEsSUFBQSxHQUFPO0lBQ1AsS0FBQSxHQUFRLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQWhCLEVBQXNCLFFBQXRCO0lBRVIsSUFBQSxHQUFPLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixLQUF2QixFQUE4QixRQUE5QjtBQUVQLFdBQU87RUFSVzs7O0FBVXRCOzs7Ozs7Ozs7bUNBUUEsV0FBQSxHQUFhLFNBQUMsSUFBRDtBQUNULFFBQUE7SUFBQSxJQUFBLEdBQU87TUFBQSxLQUFBLEVBQU8sQ0FBUDtNQUFVLE1BQUEsRUFBUSxDQUFsQjs7SUFDUCxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFlLENBQUMsS0FBaEIsQ0FBc0IsSUFBdEI7QUFFUixTQUFBLHVDQUFBOztNQUNJLFFBQUEsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFiLENBQXlCLElBQXpCO01BQ1gsSUFBSSxDQUFDLEtBQUwsR0FBYSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxLQUFkLEVBQXFCLFFBQVEsQ0FBQyxLQUE5QjtNQUNiLElBQUksQ0FBQyxNQUFMLElBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBYixHQUEwQixJQUFDLENBQUE7QUFIOUM7SUFLQSxJQUFJLENBQUMsTUFBTCxJQUFlLElBQUMsQ0FBQTtBQUVoQixXQUFPO0VBWEU7OztBQWFiOzs7Ozs7Ozs7OzttQ0FVQSxTQUFBLEdBQVcsU0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixTQUFuQixFQUE4QixNQUE5QjtBQUNQLFFBQUE7SUFBQSxLQUFBLEdBQVE7SUFDUixDQUFBLEdBQUk7SUFDSixJQUFHLFNBQUEsS0FBYSxDQUFDLENBQWpCO0FBQ0ksYUFBTSxDQUFBLElBQUssQ0FBWDtRQUNJLENBQUEsR0FBSSxNQUFPLENBQUEsQ0FBQTtRQUNYLElBQUcsQ0FBQyxDQUFDLElBQUYsS0FBVSxJQUFiO1VBQ0ksS0FBQSxHQUFRO0FBQ1IsZ0JBRko7O1FBR0EsQ0FBQTtNQUxKLENBREo7O0FBUUEsV0FBTztFQVhBOzs7QUFhWDs7Ozs7Ozs7Ozs7bUNBVUEsaUJBQUEsR0FBbUIsU0FBQyxVQUFELEVBQWEsUUFBYixFQUF1QixJQUF2QixFQUE2QixNQUE3QjtBQUNmLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxDQUFBLEdBQUk7SUFDSixDQUFBLEdBQUk7QUFFSixXQUFNLENBQUEsR0FBSSxDQUFWO01BQ0ksS0FBQSxHQUFRLE1BQU8sQ0FBQSxDQUFBO01BQ2YsSUFBRyxrQkFBSDtRQUNJLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWixFQURKOztNQUVBLENBQUE7SUFKSjtBQU1BLFdBQU87RUFYUTs7O0FBYW5COzs7Ozs7Ozs7OzttQ0FVQSxtQkFBQSxHQUFxQixTQUFDLEtBQUQ7QUFDakIsUUFBQTtJQUFBLE1BQUEsR0FBUztBQUVULFlBQU8sS0FBSyxDQUFDLElBQWI7QUFBQSxXQUNTLElBRFQ7UUFFUSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFiLEdBQW9CLEtBQUssQ0FBQyxLQUFOLElBQWUsSUFBQyxDQUFBO0FBRG5DO0FBRFQsV0FHUyxHQUhUO1FBSVEsSUFBRyxLQUFBLENBQU0sS0FBSyxDQUFDLEtBQVosQ0FBSDtVQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQWIsR0FBcUIsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFULENBQWlCLEtBQUssQ0FBQyxLQUF2QixFQUR6QjtTQUFBLE1BRUssSUFBRyxLQUFLLENBQUMsS0FBTixJQUFlLENBQWxCO1VBQ0QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixHQUFxQixJQUFJLENBQUMsYUFEekI7U0FBQSxNQUFBO1VBR0QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixHQUFxQixhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU8sQ0FBQSxLQUFLLENBQUMsS0FBTixHQUFZLENBQVosQ0FBNUIsSUFBOEMsSUFBSSxDQUFDLGFBSHZFOztBQUhKO0FBSFQsV0FVUyxHQVZUO0FBV1EsZ0JBQU8sS0FBSyxDQUFDLEtBQWI7QUFBQSxlQUNTLEdBRFQ7WUFDa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBYixHQUF5QjtBQUFsQztBQURULGVBRVMsR0FGVDtZQUVrQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFiLEdBQTZCO0FBQXRDO0FBRlQsZUFHUyxHQUhUO1lBR2tCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQWIsR0FBc0I7QUFBL0I7QUFIVCxlQUlTLEdBSlQ7WUFJa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBYixHQUFvQjtBQUE3QjtBQUpULGVBS1MsR0FMVDtZQUtrQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFiLEdBQXlCO0FBQWxDO0FBTFQsZUFNUyxJQU5UO1lBTW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQWIsR0FBeUI7QUFBbkM7QUFOVCxlQU9TLElBUFQ7WUFPbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYixHQUE2QjtBQUF2QztBQVBULGVBUVMsSUFSVDtZQVFtQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFiLEdBQXlCO0FBQW5DO0FBUlQsZUFTUyxJQVRUO1lBU21CLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQWIsR0FBb0I7QUFBOUI7QUFUVCxlQVVTLElBVlQ7WUFVbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBYixHQUF5QjtBQUFuQztBQVZULGVBV1MsR0FYVDtZQVlRLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQWIsR0FBeUI7WUFDekIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYixHQUE2QjtZQUM3QixJQUFDLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFiLEdBQXNCO1lBQ3RCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQWIsR0FBb0I7WUFDcEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBYixHQUF5QjtBQWhCakM7QUFYUjtBQTZCQSxXQUFPO0VBaENVOzs7QUFrQ3JCOzs7Ozs7Ozs7OzttQ0FVQSxRQUFBLEdBQVUsU0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLEVBQVQsRUFBYSxFQUFiLEVBQWlCLElBQWpCO0FBQ04sUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsUUFBTCxDQUFBLENBQWUsQ0FBQyxLQUFoQixDQUFzQixJQUF0QjtJQUNSLElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDO0lBQ2YsTUFBQSxHQUFTLElBQUksQ0FBQztBQUVkLFNBQUEsK0NBQUE7O01BQ0ksSUFBQSxHQUFPLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCO01BQ1AsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBZixDQUF3QixFQUF4QixFQUE0QixDQUFBLEdBQUksTUFBSixHQUFhLEVBQXpDLEVBQTZDLElBQUksQ0FBQyxLQUFMLEdBQWEsRUFBYixHQUFnQixFQUE3RCxFQUFpRSxNQUFBLEdBQU8sRUFBUCxHQUFVLEVBQTNFLEVBQStFLElBQS9FLEVBQXFGLENBQXJGLEVBQXdGLENBQXhGO0FBRko7QUFJQSxXQUFPO0VBVEQ7OztBQVdWOzs7Ozs7Ozs7Ozs7OzttQ0FhQSxrQkFBQSxHQUFvQixTQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWIsRUFBaUIsS0FBakIsRUFBd0IsUUFBeEI7QUFDaEIsUUFBQTtJQUFBLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFDWixJQUFDLENBQUEsUUFBRCxHQUFZO0lBQ1osSUFBQyxDQUFBLGlCQUFELEdBQXFCO0FBRXJCLFNBQUEsdUNBQUE7O0FBQ0k7QUFBQSxXQUFBLHVDQUFBOztRQUNJLElBQUcsa0JBQUg7VUFDSSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsS0FBckI7VUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLG1CQUFELENBQXFCLEtBQXJCO1VBQ1AsSUFBRyxJQUFIO1lBQ0ksSUFBQyxDQUFBLGdCQUFELENBQWtCLEtBQWxCLEVBQXlCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBakMsRUFBeUMsSUFBQyxDQUFBLFFBQTFDO1lBQ0EsSUFBQyxDQUFBLFFBQUQsSUFBYSxJQUFJLENBQUMsTUFGdEI7V0FISjtTQUFBLE1BTUssSUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQVosR0FBcUIsQ0FBeEI7VUFDRCxJQUFBLEdBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQztVQUNmLE1BQUEsR0FBUyxJQUFJLENBQUM7VUFDZCxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsSUFBbEI7WUFDSSxJQUFBLEdBQU8sSUFBSSxDQUFDLGdCQUFMLENBQXNCLEtBQUssQ0FBQyxLQUE1QjtZQUNQLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQWYsQ0FBd0IsSUFBQyxDQUFBLFFBQXpCLEVBQW1DLElBQUMsQ0FBQSxRQUFELEdBQVksTUFBWixHQUFxQixJQUFJLENBQUMsTUFBMUIsR0FBbUMsSUFBSSxDQUFDLE9BQXhDLEdBQWtELElBQUksQ0FBQyxPQUExRixFQUFtRyxJQUFJLENBQUMsS0FBTCxHQUFXLEVBQVgsR0FBYyxFQUFqSCxFQUFxSCxNQUFBLEdBQU8sRUFBUCxHQUFVLEVBQS9ILEVBQW1JLEtBQUssQ0FBQyxLQUF6SSxFQUFnSixDQUFoSixFQUFtSixDQUFuSjtZQUNBLElBQUMsQ0FBQSxRQUFELElBQWEsSUFBSSxDQUFDLE1BSHRCOztVQUlBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQUFJLENBQUMsR0FBTCxDQUFTLElBQUMsQ0FBQSxpQkFBVixFQUE2QixNQUE3QixFQVBwQjs7QUFQVDtNQWVBLElBQUMsQ0FBQSxRQUFELElBQWEsQ0FBQyxJQUFDLENBQUEsaUJBQUQsSUFBc0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBcEMsQ0FBQSxHQUFrRCxJQUFDLENBQUE7TUFDaEUsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtBQWxCekI7QUFvQkEsV0FBTztFQXpCUzs7O0FBMkJwQjs7Ozs7Ozs7Ozs7Ozs7O21DQWNBLGlCQUFBLEdBQW1CLFNBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULEVBQWEsRUFBYixFQUFpQixJQUFqQixFQUF1QixRQUF2QjtBQUNmLFFBQUE7SUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFoQixFQUFpQyxRQUFqQztJQUVSLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixFQUFwQixFQUF3QixFQUF4QixFQUE0QixFQUE1QixFQUFnQyxFQUFoQyxFQUFvQyxLQUFwQyxFQUEyQyxRQUEzQztBQUVBLFdBQU87RUFMUTs7OztHQS8zQmMsRUFBRSxDQUFDOztBQXM0QnhDLEVBQUUsQ0FBQyxzQkFBSCxHQUE0QiIsInNvdXJjZXNDb250ZW50IjpbIiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyAgIFNjcmlwdDogQ29tcG9uZW50X1RleHRSZW5kZXJlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jbGFzcyBSZW5kZXJlclRleHRMaW5lXG4gICAgIyMjKlxuICAgICogU3RvcmVzIGEgdGV4dCBsaW5lLlxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3MuUmVuZGVyZXJUZXh0TGluZVxuICAgICogQGNsYXNzIFJlbmRlcmVyVGV4dExpbmVcbiAgICAqIEBtZW1iZXJvZiBncy5SZW5kZXJlclRleHRMaW5lXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgIyMjXG4gICAgICAgICogVGhlIHdpZHRoIG9mIHRoZSBsaW5lIGluIHBpeGVscy5cbiAgICAgICAgKiBAcHJvcGVydHkgd2lkdGhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAd2lkdGggPSAwXG4gICAgICAgICMjI1xuICAgICAgICAqIFRoZSBoZWlnaHQgb2YgdGhlIGxpbmUgaW4gcGl4ZWxzLlxuICAgICAgICAqIEBwcm9wZXJ0eSB3aWR0aFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBoZWlnaHQgPSAwXG4gICAgICAgICMjI1xuICAgICAgICAqIFRoZSBkZXNjZW50IG9mIHRoZSBsaW5lIGluIHBpeGVscy5cbiAgICAgICAgKiBAcHJvcGVydHkgZGVzY2VudFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBkZXNjZW50ID0gMFxuICAgICAgICAjIyNcbiAgICAgICAgKiBUaGUgY29udGVudCBvZiB0aGUgbGluZSBhcyB0b2tlbiBvYmplY3RzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb250ZW50XG4gICAgICAgICogQHR5cGUgT2JqZWN0W11cbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAY29udGVudCA9IFtdXG5cbmdzLlJlbmRlcmVyVGV4dExpbmUgPSBSZW5kZXJlclRleHRMaW5lXG5cbmNsYXNzIFJlbmRlcmVyVG9rZW5cbiAgICAjIyMqXG4gICAgKiBTdG9yZXMgYSB0b2tlbi5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgUmVuZGVyZXJUb2tlblxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKGNvZGUsIHZhbHVlLCBmb250KSAtPlxuICAgICAgICAjIyNcbiAgICAgICAgKiBUaGUgdmFsdWUgb2YgdGhlIHRva2VuLiBUaGF0IHZhbHVlIGRlcGVuZHMgb24gdGhlIHRva2VuIHR5cGUuIEZvciB0ZXh0LXRva2VucywgaXQgc3RvcmVzXG4gICAgICAgICogdGhlIGFjdHVhbCB0ZXh0LlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb250ZW50XG4gICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICMjI1xuICAgICAgICBAdmFsdWUgPSB2YWx1ZVxuICAgICAgICAjIyNcbiAgICAgICAgKiBUaGUgY29kZSBkZXNjcmliZXMgd2hhdCBraW5kIG9mIHRva2VuIGl0IGlzLiBGb3IgZXhhbXBsZSwgaWYgdGhlIGNvZGUgaXMgXCJZXCIgaXQgbWVhbnMgaXQgaXMgYVxuICAgICAgICAqIHN0eWxlLXRva2VuLiBJZiB0aGUgY29kZSBpcyA8Yj5udWxsPC9iPiwgaXQgbWVhbnMgaXQgaXMgYSB0ZXh0LXRva2VuLlxuICAgICAgICAqIEBwcm9wZXJ0eSBjb2RlXG4gICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICMjI1xuICAgICAgICBAY29kZSA9IGNvZGVcbiAgICAgICAgIyMjXG4gICAgICAgICogVGhlIGZvcm1hdCBzdG9yZXMgdGhlIGZvbnQtc3R5bGUgcHJvcGVydGllcyBvZiB0aGUgdG9rZW4gbGlrZSBpZiBpdCBpcyBpdGFsaWMsIGJvbGQsIGV0Yy4gSXQgY2FuIGJlIDxiPm51bGw8L2I+LlxuICAgICAgICAqIEBwcm9wZXJ0eSBmb3JtYXRcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBmb3JtYXQgPSBudWxsXG4gICAgICAgICMjI1xuICAgICAgICAqIEEgcGxhaW4gb2JqZWN0IHRvIHN0b3JlIGN1c3RvbSBkYXRhIHdpdGhpbiB0aGUgdG9rZW4uXG4gICAgICAgICogQHByb3BlcnR5IGN1c3RvbURhdGFcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXN0b21EYXRhID0ge31cblxuICAgICAgICBAdGFrZUZvcm1hdChmb250KSBpZiBmb250P1xuXG4gICAgIyMjKlxuICAgICogVGFrZXMgdGhlIHN0eWxlIGZyb20gdGhlIHNwZWNpZmllZCBmb250IGFuZCBzdG9yZXMgaXQgaW50byB0aGUgZm9ybWF0LXByb3BlcnR5LiBUaGUgdG9rZW4gd2lsbFxuICAgICogd2lsbCBiZSByZW5kZXJlZCB3aXRoIHRoYXQgc3R5bGUgdGhlbi5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHRha2VGb3JtYXRcbiAgICAqIEBwYXJhbSB7Z3MuRm9udH0gZm9udCAtIFRoZSBmb250IHRvIHRha2UgdGhlIHN0eWxlIGZyb20uXG4gICAgIyMjXG4gICAgdGFrZUZvcm1hdDogKGZvbnQpIC0+XG4gICAgICAgIEBmb3JtYXQgPSBmb250LnRvRGF0YUJ1bmRsZSgpXG5cbiAgICAjIyMqXG4gICAgKiBBcHBsaWVzIHRoZSBmb3JtYXQtc3R5bGUgb2YgdGhlIHRva2VuIG9uIHRoZSBzcGVjaWZpZWQgZm9udC4gVGhlIGZvbnQgd2lsbCBoYXZlIHRoZSBzdHlsZSBmcm9tXG4gICAgKiB0aGVuIHRva2VuIHRoZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBhcHBseUZvcm1hdFxuICAgICogQHBhcmFtIHtncy5Gb250fSBmb250IC0gVGhlIGZvbnQgdG8gYXBwbHkgdGhlIGZvcm1hdC1zdHlsZSBvbi5cbiAgICAjIyNcbiAgICBhcHBseUZvcm1hdDogKGZvbnQpIC0+XG4gICAgICAgIGZvbnQuc2V0KEBmb3JtYXQpXG5cbmdzLlJlbmRlcmVyVG9rZW4gPSBSZW5kZXJlclRva2VuXG5cbmNsYXNzIENvbXBvbmVudF9UZXh0UmVuZGVyZXIgZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICAjIyMqXG4gICAgKiBBIHRleHQtcmVuZGVyZXIgY29tcG9uZW50IGFsbG93IHRvIGRyYXcgcGxhaW4gb3IgZm9ybWF0dGVkIHRleHQgb24gYVxuICAgICogZ2FtZSBvYmplY3QncyBiaXRtYXAuIEZvciBmb3JtYXR0ZWQgdGV4dCwgZGlmZmVyZW50IHRleHQtY29kZXMgY2FuIGJlXG4gICAgKiB1c2VkIHRvIGFkZCBmb3JtYXR0aW5nIG9yIGRlZmluZSBhIHBsYWNlaG9sZGVyLjxicj48YnI+XG4gICAgKlxuICAgICogQSB0ZXh0LWNvZGUgdXNlcyB0aGUgZm9sbG93aW5nIHN5bnRheDo8YnI+PGJyPlxuICAgICpcbiAgICAqIHtjb2RlOnZhbHVlfSA8LSBTaW5nbGUgVmFsdWU8YnIgLz5cbiAgICAqIHtjb2RlOnZhbHVlMSx2YWx1ZTIsLi4ufSA8LSBNdWx0aXBsZSBWYWx1ZXM8YnI+PGJyPlxuICAgICpcbiAgICAqIEV4YW1wbGU6PGJyPjxicj5cbiAgICAqXG4gICAgKiBcIlRoaXMgaXMge1k6SX1hIFRleHR7WTpOfVwiIDwtIFwiYSBUZXh0XCIgd2lsbCBiZSBpdGFsaWMgaGVyZS48YnI+XG4gICAgKiBcIlRoZSB2YWx1ZSBpcyB7R046MX1cIiA8LSBcIntHTjoxfVwiIHdpbGwgYmUgcmVwbGFjZWQgZm9yIHRoZSB2YWx1ZSBvZiB0aGUgZ2xvYmFsIG51bWJlciB2YXJpYWJsZSAwMDAxLjxicj48YnI+XG4gICAgKlxuICAgICogRm9yIGEgbGlzdCBvZiBhbGwgYXZhaWxhYmxlIHRleHQtY29kZXMgd2l0aCBleGFtcGxlcywganVzdCB0YWtlIGEgbG9vayBpbnRvIHRoZSBvZmZpY2FsIGhlbHAtZmlsZS5cbiAgICAqXG4gICAgKiBAbW9kdWxlIGdzXG4gICAgKiBAY2xhc3MgQ29tcG9uZW50X1RleHRSZW5kZXJlclxuICAgICogQGV4dGVuZHMgZ3MuQ29tcG9uZW50XG4gICAgKiBAbWVtYmVyb2YgZ3NcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlclxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgY3VycmVudFhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAY3VycmVudFggPSAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEBwcm9wZXJ0eSBjdXJyZW50WVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50WSA9IDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGN1cnJlbnRMaW5lSGVpZ2h0XG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGN1cnJlbnRMaW5lSGVpZ2h0ID0gMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgZm9udFxuICAgICAgICAqIEB0eXBlIGdzLkZvbnRcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAZm9udCA9IG5ldyBGb250KFwiVGltZXMgTmV3IFJvbWFuXCIsIDIyKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBAcHJvcGVydHkgc3BhY2VTaXplXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQHNwYWNlU2l6ZSA9IDBcblxuICAgICAgICAjIyMqXG4gICAgICAgICogQHByb3BlcnR5IGZvbnRTaXplXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGZvbnRTaXplID0gMFxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgbGVmdCBhbmQgcmlnaHQgcGFkZGluZyBwZXIgbGluZS5cbiAgICAgICAgKiBAcHJvcGVydHkgcGFkZGluZ1xuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHBhZGRpbmcgPSAwXG5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBzcGFjaW5nIGJldHdlZW4gdGV4dCBsaW5lcyBpbiBwaXhlbHMuXG4gICAgICAgICogQHByb3BlcnR5IGxpbmVTcGFjaW5nXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAbGluZVNwYWNpbmcgPSAwXG5cbiAgICAjIyMqXG4gICAgKiBDcmVhdGVzIHRoZSB0b2tlbi1vYmplY3QgZm9yIGEgbGlzdC1wbGFjZWhvbGRlci4gQSBsaXN0LXBsYWNlaG9sZGVyXG4gICAgKiBhbGxvd3MgdG8gaW5zZXJ0IGEgdmFsdWUgZnJvbSBhIGxpc3QtdmFyaWFibGUuXG4gICAgKlxuICAgICogQG1ldGhvZCBjcmVhdGVMaXN0VG9rZW5cbiAgICAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgLSBUaGUgbGlzdC5cbiAgICAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyAtIFRoZSB2YWx1ZXMgb2YgdGhlIGxpc3QtcGxhY2Vob2xkZXIgdGV4dC1jb2RlLlxuICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgdG9rZW4tb2JqZWN0LlxuICAgICMjI1xuICAgIGNyZWF0ZUxpc3RUb2tlbjogKGxpc3QsIHZhbHVlcykgLT5cbiAgICAgICAgaW5kZXggPSAwXG4gICAgICAgIGlmIHZhbHVlc1sxXT9cbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlc1sxXS5zcGxpdChcIjpcIilcbiAgICAgICAgICAgIGluZGV4ID0gdmFsdWVzWzBdXG4gICAgICAgICAgICBpZiB2YWx1ZXNbMF0gPT0gXCJHXCJcbiAgICAgICAgICAgICAgICBpbmRleCA9IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubnVtYmVyc1twYXJzZUludCh2YWx1ZXNbMV0pLTFdXG4gICAgICAgICAgICBlbHNlIGlmIHZhbHVlc1swXSA9PSBcIlBcIlxuICAgICAgICAgICAgICAgIGluZGV4ID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50TnVtYmVyc1twYXJzZUludCh2YWx1ZXNbMV0pLTFdXG4gICAgICAgICAgICBlbHNlIGlmIHZhbHVlc1swXSA9PSBcIkxcIlxuICAgICAgICAgICAgICAgIGluZGV4ID0gR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJWYWx1ZU9mKHsgc2NvcGU6IDAsIGluZGV4OiBwYXJzZUludCh2YWx1ZXNbMV0pLTF9KVxuXG4gICAgICAgIHJldHVybiBcIlwiICsgbGlzdFtpbmRleF1cblxuXG4gICAgIyMjKlxuICAgICogUGFyc2VzIGFuZCByZXR1cm5zIHRoZSB2YXJpYWJsZSBpZGVudGlmaWVyIHdoaWNoIGlzIGFuIGFycmF5IGNvbnRhaW5pbmdcbiAgICAqIHRoZSBvcHRpb25hbCBkb21haW4gbmFtZSBhbmQgdGhlIHZhcmlhYmxlIGluZGV4IGFzOiBbZG9tYWluLCBpbmRleF0uXG4gICAgKlxuICAgICogQG1ldGhvZCBwYXJzZVZhcmlhYmxlSWRlbnRpZmllclxuICAgICogQHBhcmFtIHtzdHJpbmd9IGlkZW50aWZpZXIgLSBUaGUgdmFyaWFibGUgaWRlbnRpZmllciBlLmcuIGNvbS5kZWdpY2Eudm5tLmRlZmF1bHQuMSBvciBjb20uZGVnaWNhLnZubS5kZWZhdWx0LlZhck5hbWVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIHZhcmlhYmxlIHR5cGUgdG8gcGFyc2U6IG51bWJlciwgc3RyaW5nLCBib29sZWFuIG9yIGxpc3RcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIHNjb3BlIG9mIHRoZSB2YXJpYWJsZSB0byBwYXJzZTogMCA9IGxvY2FsLCAxID0gZ2xvYmFsLCAyID0gcGVyc2lzdGVudC5cbiAgICAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBjb250YWluaW5nIHR3byB2YWx1ZXMgYXM6IFtkb21haW4sIGluZGV4XS4gSWYgdGhlIGlkZW50aWZpZXIgZG9lc24ndCBjb250YWluIGEgZG9tYWluLXN0cmluZywgdGhlIGRvbWFpbiB3aWxsIGJlIDAgKGRlZmF1bHQpLlxuICAgICMjI1xuICAgIHBhcnNlVmFyaWFibGVJZGVudGlmaWVyOiAoaWRlbnRpZmllciwgdHlwZSwgc2NvcGUpIC0+XG4gICAgICAgIHJlc3VsdCA9IFswLCBpZGVudGlmaWVyXVxuXG4gICAgICAgIGlmIGlzTmFOKGlkZW50aWZpZXIpXG4gICAgICAgICAgICBpbmRleCA9IGlkZW50aWZpZXIubGFzdEluZGV4T2YoXCIuXCIpXG4gICAgICAgICAgICBpZiBpbmRleCAhPSAtMVxuICAgICAgICAgICAgICAgIHJlc3VsdFswXSA9IGlkZW50aWZpZXIuc3Vic3RyaW5nKDAsIGluZGV4KVxuICAgICAgICAgICAgICAgIHJlc3VsdFsxXSA9IGlkZW50aWZpZXIuc3Vic3RyaW5nKGluZGV4KzEpXG4gICAgICAgICAgICAgICAgaWYgaXNOYU4ocmVzdWx0WzFdKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbMV0gPSBHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLmluZGV4T2ZWYXJpYWJsZShyZXN1bHRbMV0sIHR5cGUsIHNjb3BlLCByZXN1bHRbMF0pICsgMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0WzFdID0gcGFyc2VJbnQocmVzdWx0WzFdKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdFsxXSA9IEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuaW5kZXhPZlZhcmlhYmxlKHJlc3VsdFsxXSwgdHlwZSwgc2NvcGUsIHJlc3VsdFswXSkgKyAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHBhcnNlSW50KHJlc3VsdFsxXSlcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICByZXBsYWNlUGxhY2Vob2xkZXJUb2tlbnM6ICh0ZXh0KSAtPlxuICAgICAgICByZXN1bHQgPSB0ZXh0XG4gICAgICAgIHJlc3VsdCA9IHRleHQucmVwbGFjZSgvXFx7KFtBLXpdKyk6KFteXFx7XFx9XSspXFx9fChcXG4pL2dtLCAobSwgY29kZSwgdmFsdWUpID0+XG4gICAgICAgICAgICB0b2tlbiA9IEBjcmVhdGVUb2tlbihjb2RlLCB2YWx1ZSlcbiAgICAgICAgICAgIGlmIHR5cGVvZih0b2tlbikgPT0gXCJzdHJpbmdcIlxuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBtICAgICAgICBcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgYSB0b2tlbi1vYmplY3QgZm9yIGEgc3BlY2lmaWVkIHRleHQtY29kZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZVRva2VuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSAtIFRoZSBjb2RlL3R5cGUgb2YgdGhlIHRleHQtY29kZS5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgdGV4dC1jb2RlLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgdG9rZW4tb2JqZWN0LlxuICAgICMjI1xuICAgIGNyZWF0ZVRva2VuOiAoY29kZSwgdmFsdWUpIC0+XG4gICAgICAgIHRva2VuT2JqZWN0ID0gbnVsbFxuICAgICAgICB2YWx1ZSA9IGlmIGlzTmFOKHZhbHVlKSB0aGVuIHZhbHVlIGVsc2UgcGFyc2VJbnQodmFsdWUpXG4gICAgICAgIHN3aXRjaCBjb2RlXG4gICAgICAgICAgICB3aGVuIFwiU1pcIlxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gbmV3IGdzLlJlbmRlcmVyVG9rZW4oY29kZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgQGZvbnQuc2l6ZSA9IHRva2VuT2JqZWN0LnZhbHVlIHx8IEBmb250U2l6ZVxuICAgICAgICAgICAgICAgIEBzcGFjZVNpemUgPSBAZm9udC5tZWFzdXJlVGV4dFBsYWluKFwiIFwiKVxuICAgICAgICAgICAgd2hlbiBcIllcIlxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0geyBjb2RlOiBjb2RlLCB2YWx1ZTogdmFsdWUgfVxuICAgICAgICAgICAgICAgIHN3aXRjaCB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiVVwiIHRoZW4gQGZvbnQudW5kZXJsaW5lID0geWVzXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJTXCIgdGhlbiBAZm9udC5zdHJpa2VUaHJvdWdoID0geWVzXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJJXCIgdGhlbiBAZm9udC5pdGFsaWMgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIkJcIiB0aGVuIEBmb250LmJvbGQgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIkNcIiB0aGVuIEBmb250LnNtYWxsQ2FwcyA9IHllc1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiTlVcIiB0aGVuIEBmb250LnVuZGVybGluZSA9IG5vXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJOU1wiIHRoZW4gQGZvbnQuc3RyaWtlVGhyb3VnaCA9IG5vXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJOSVwiIHRoZW4gQGZvbnQuaXRhbGljID0gbm9cbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIk5CXCIgdGhlbiBAZm9udC5ib2xkID0gbm9cbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIk5DXCIgdGhlbiBAZm9udC5zbWFsbENhcHMgPSBub1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiTlwiXG4gICAgICAgICAgICAgICAgICAgICAgICBAZm9udC51bmRlcmxpbmUgPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgQGZvbnQuc3RyaWtlVGhyb3VnaCA9IG5vXG4gICAgICAgICAgICAgICAgICAgICAgICBAZm9udC5pdGFsaWMgPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgQGZvbnQuYm9sZCA9IG5vXG4gICAgICAgICAgICAgICAgICAgICAgICBAZm9udC5zbWFsbENhcHMgPSBub1xuICAgICAgICAgICAgICAgIEBzcGFjZVNpemUgPSBAZm9udC5tZWFzdXJlVGV4dFBsYWluKFwiIFwiKVxuICAgICAgICAgICAgd2hlbiBcIkNcIlxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gbmV3IGdzLlJlbmRlcmVyVG9rZW4oY29kZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgaWYgaXNOYU4odmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIEBmb250LmNvbG9yID0gZ3MuQ29sb3IuZnJvbUhleCh2YWx1ZSlcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHZhbHVlIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgQGZvbnQuY29sb3IgPSBGb250LmRlZmF1bHRDb2xvclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGZvbnQuY29sb3IgPSBncy5Db2xvci5mcm9tT2JqZWN0KFJlY29yZE1hbmFnZXIuc3lzdGVtLmNvbG9yc1t2YWx1ZS0xXSB8fCBGb250LmRlZmF1bHRDb2xvcilcbiAgICAgICAgICAgIHdoZW4gXCJHTlwiXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gaWYgaXNOYU4odmFsdWUpIHRoZW4gdmFsdWUuc3BsaXQoXCIsXCIpIGVsc2UgW3ZhbHVlXVxuICAgICAgICAgICAgICAgIGlmIHZhbHVlc1sxXVxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQgPSB2YWx1ZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJudW1iZXJcIiwgMSlcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSBzcHJpbnRmKFwiJVwiK2Zvcm1hdCtcImRcIiwgKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubnVtYmVyc0J5RG9tYWluW3ZhbHVlc1swXXx8MF1bdmFsdWVzWzFdLTFdIHx8IDApKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJudW1iZXJcIiwgMSlcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSAoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJzQnlEb21haW5bdmFsdWVzWzBdfHwwXVt2YWx1ZXNbMV0tMV0gfHwgMCkudG9TdHJpbmcoKVxuICAgICAgICAgICAgd2hlbiBcIkdUXCJcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBAcGFyc2VWYXJpYWJsZUlkZW50aWZpZXIodmFsdWUsIFwic3RyaW5nXCIsIDEpXG4gICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSAoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5zdHJpbmdzQnlEb21haW5bdmFsdWVzWzBdfHwwXVt2YWx1ZXNbMV0tMV0gfHwgXCJcIilcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHRva2VuT2JqZWN0LnNwbGl0KC9cXHsoW0Etel0rKTooW15cXHtcXH1dKylcXH18KFxcbikvZ20pXG4gICAgICAgICAgICAgICAgaWYgdG9rZW5PYmplY3QubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgICAgICBsYXN0ID0gdG9rZW5PYmplY3RbdG9rZW5PYmplY3QubGVuZ3RoIC0gMV1cbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QucG9wKCkgdW5sZXNzIGxhc3Q/Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gdG9rZW5PYmplY3RbMF0gPyBcIlwiXG4gICAgICAgICAgICB3aGVuIFwiR1NcIlxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IEBwYXJzZVZhcmlhYmxlSWRlbnRpZmllcih2YWx1ZSwgXCJib29sZWFuXCIsIDEpXG4gICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSAoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5ib29sZWFuc0J5RG9tYWluW3ZhbHVlc1swXXx8MF1bdmFsdWVzWzFdLTFdIHx8IGZhbHNlKS50b1N0cmluZygpXG4gICAgICAgICAgICB3aGVuIFwiR0xcIlxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlLnNwbGl0KFwiLFwiKVxuICAgICAgICAgICAgICAgIGxpc3RJZGVudGlmaWVyID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJsaXN0XCIsIDEpXG4gICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSBAY3JlYXRlTGlzdFRva2VuKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUubGlzdHNCeURvbWFpbltsaXN0SWRlbnRpZmllclswXV1bbGlzdElkZW50aWZpZXJbMV0tMV0gfHwgW10sIHZhbHVlcylcbiAgICAgICAgICAgIHdoZW4gXCJQTlwiXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gaWYgaXNOYU4odmFsdWUpIHRoZW4gdmFsdWUuc3BsaXQoXCIsXCIpIGVsc2UgW3ZhbHVlXVxuICAgICAgICAgICAgICAgIGlmIHZhbHVlc1sxXVxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQgPSB2YWx1ZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJudW1iZXJcIiwgMilcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSBzcHJpbnRmKFwiJVwiK2Zvcm1hdCtcImRcIiwgKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUucGVyc2lzdGVudE51bWJlcnNbdmFsdWVzWzBdXT9bdmFsdWVzWzFdLTFdIHx8IDApKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJudW1iZXJcIiwgMilcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSAoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5wZXJzaXN0ZW50TnVtYmVyc0J5RG9tYWluW3ZhbHVlc1swXXx8MF0/W3ZhbHVlc1sxXS0xXSB8fCAwKS50b1N0cmluZygpXG4gICAgICAgICAgICB3aGVuIFwiUFRcIlxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IEBwYXJzZVZhcmlhYmxlSWRlbnRpZmllcih2YWx1ZSwgXCJzdHJpbmdcIiwgMilcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IChHYW1lTWFuYWdlci52YXJpYWJsZVN0b3JlLnBlcnNpc3RlbnRTdHJpbmdzQnlEb21haW5bdmFsdWVzWzBdXT9bdmFsdWVzWzFdLTFdIHx8IFwiXCIpXG4gICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSB0b2tlbk9iamVjdC5zcGxpdCgvXFx7KFtBLXpdKyk6KFteXFx7XFx9XSspXFx9fChcXG4pL2dtKVxuICAgICAgICAgICAgICAgIGlmIHRva2VuT2JqZWN0Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA9IHRva2VuT2JqZWN0W3Rva2VuT2JqZWN0Lmxlbmd0aCAtIDFdXG4gICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0LnBvcCgpIHVubGVzcyBsYXN0Py5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHRva2VuT2JqZWN0WzBdID8gXCJcIlxuICAgICAgICAgICAgd2hlbiBcIlBTXCJcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBAcGFyc2VWYXJpYWJsZUlkZW50aWZpZXIodmFsdWUsIFwiYm9vbGVhblwiLCAyKVxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUucGVyc2lzdGVudEJvb2xlYW5zQnlEb21haW5bdmFsdWVzWzBdXT9bdmFsdWVzWzFdLTFdIHx8IGZhbHNlKS50b1N0cmluZygpXG4gICAgICAgICAgICB3aGVuIFwiUExcIlxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlLnNwbGl0KFwiLFwiKVxuICAgICAgICAgICAgICAgIGxpc3RJZGVudGlmaWVyID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJsaXN0XCIsIDIpXG4gICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSBAY3JlYXRlTGlzdFRva2VuKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUucGVyc2lzdGVudExpc3RzQnlEb21haW5bbGlzdElkZW50aWZpZXJbMF1dP1tsaXN0SWRlbnRpZmllclsxXS0xXSB8fCBbXSwgdmFsdWVzKVxuICAgICAgICAgICAgd2hlbiBcIkxOXCJcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBpZiBpc05hTih2YWx1ZSkgdGhlbiB2YWx1ZS5zcGxpdChcIixcIikgZWxzZSBbdmFsdWVdXG4gICAgICAgICAgICAgICAgaWYgdmFsdWVzWzFdXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCA9IHZhbHVlc1sxXVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgPSBAcGFyc2VWYXJpYWJsZUlkZW50aWZpZXIodmFsdWVzWzBdLCBcIm51bWJlclwiLCAwKVxuICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHNwcmludGYoXCIlXCIrZm9ybWF0K1wiZFwiLCAoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJWYWx1ZU9mKHsgc2NvcGU6IDAsIGluZGV4OiB2YWx1ZXNbMV0tMX0pIHx8IDApKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlc1swXSwgXCJudW1iZXJcIiwgMClcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSAoR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5udW1iZXJWYWx1ZU9mKHsgc2NvcGU6IDAsIGluZGV4OiB2YWx1ZXNbMV0tMX0pIHx8IDApLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHdoZW4gXCJMVFwiXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gQHBhcnNlVmFyaWFibGVJZGVudGlmaWVyKHZhbHVlLCBcInN0cmluZ1wiLCAwKVxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuc3RyaW5nVmFsdWVPZih7IHNjb3BlOiAwLCBpbmRleDogdmFsdWVzWzFdLTF9KSB8fCBcIlwiKS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSB0b2tlbk9iamVjdC5zcGxpdCgvXFx7KFtBLXpdKyk6KFteXFx7XFx9XSspXFx9fChcXG4pL2dtKVxuICAgICAgICAgICAgICAgIGlmIHRva2VuT2JqZWN0Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA9IHRva2VuT2JqZWN0W3Rva2VuT2JqZWN0Lmxlbmd0aCAtIDFdXG4gICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0LnBvcCgpIHVubGVzcyBsYXN0Py5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IHRva2VuT2JqZWN0WzBdID8gXCJcIlxuICAgICAgICAgICAgd2hlbiBcIkxTXCJcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBAcGFyc2VWYXJpYWJsZUlkZW50aWZpZXIodmFsdWUsIFwiYm9vbGVhblwiLCAwKVxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gKEdhbWVNYW5hZ2VyLnZhcmlhYmxlU3RvcmUuYm9vbGVhblZhbHVlT2YoeyBzY29wZTogMCwgaW5kZXg6IHZhbHVlc1sxXS0xfSkgfHwgZmFsc2UpLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHdoZW4gXCJMTFwiXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWUuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgbGlzdElkZW50aWZpZXIgPSBAcGFyc2VWYXJpYWJsZUlkZW50aWZpZXIodmFsdWVzWzBdLCBcImxpc3RcIiwgMClcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IEBjcmVhdGVMaXN0VG9rZW4oR2FtZU1hbmFnZXIudmFyaWFibGVTdG9yZS5saXN0T2JqZWN0T2YoeyBzY29wZTogMCwgaW5kZXg6IGxpc3RJZGVudGlmaWVyWzFdLTF9KSB8fCBbXSwgdmFsdWVzKVxuICAgICAgICAgICAgd2hlbiBcIk5cIlxuICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gKGlmIFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1t2YWx1ZV0/IHRoZW4gbGNzKFJlY29yZE1hbmFnZXIuY2hhcmFjdGVyc1t2YWx1ZV0ubmFtZSkgZWxzZSBcIlwiKVxuICAgICAgICAgICAgd2hlbiBcIlJUXCJcbiAgICAgICAgICAgICAgICBwYWlyID0gdmFsdWUuc3BsaXQoXCIvXCIpXG4gICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSB7IGNvZGU6IGNvZGUsIHJ0U3R5bGVJZDogcGFpclsyXSA/IDAsIHJiOiBwYWlyWzBdLCBydDogcGFpclsxXSwgcmJTaXplOiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfSwgcnRTaXplOiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfSB9XG4gICAgICAgICAgICB3aGVuIFwiTVwiXG4gICAgICAgICAgICAgICAgbWFjcm8gPSBSZWNvcmRNYW5hZ2VyLnN5c3RlbS50ZXh0TWFjcm9zLmZpcnN0IChtKSAtPiBtLm5hbWUgPT0gdmFsdWVcbiAgICAgICAgICAgICAgICBpZiBtYWNyb1xuICAgICAgICAgICAgICAgICAgICBpZiBtYWNyby50eXBlID09IDAgIyBUZXh0ICsgQ29kZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gbWFjcm8uY29udGVudC5zcGxpdCgvXFx7KFtBLXpdKyk6KFteXFx7XFx9XSspXFx9fChcXG4pL2dtKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QucG9wKClcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBtYWNyby50eXBlID09IDEgIyBQbGFjZWhvbGRlciBTY3JpcHQgTWFjcm9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICFtYWNyby5jb250ZW50RnVuY1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvLmNvbnRlbnRGdW5jID0gZXZhbChcIihmdW5jdGlvbihvYmplY3QsIHZhbHVlKXsgI3ttYWNyby5jb250ZW50fSB9KVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSBtYWNyby5jb250ZW50RnVuYyhAb2JqZWN0LCB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuT2JqZWN0ID0gdG9rZW5PYmplY3Quc3BsaXQoL1xceyhbQS16XSspOihbXlxce1xcfV0rKVxcfXwoXFxuKS9nbSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHRva2VuT2JqZWN0Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdC5wb3AoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlICMgU2NyaXB0IE1hY3JvXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAhbWFjcm8uY29udGVudEZ1bmNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWNyby5jb250ZW50RnVuYyA9IGV2YWwoXCIoZnVuY3Rpb24ob2JqZWN0KXsgI3ttYWNyby5jb250ZW50fSB9KVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5PYmplY3QgPSBuZXcgZ3MuUmVuZGVyZXJUb2tlbihcIlhcIiwgbWFjcm8uY29udGVudEZ1bmMpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IFwiXCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IG5ldyBncy5SZW5kZXJlclRva2VuKGNvZGUsIHZhbHVlKVxuXG4gICAgICAgIHJldHVybiB0b2tlbk9iamVjdFxuXG5cbiAgICAjIyMqXG4gICAgKiA8cD5HZXRzIHRoZSBjb3JyZWN0IGZvbnQgZm9yIHRoZSBzcGVjaWZpZWQgcnVieS10ZXh0IHRva2VuLjwvcD5cbiAgICAqXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdG9rZW4gLSBBIHJ1YnktdGV4dCB0b2tlbi5cbiAgICAqIEByZXR1cm4ge2dzLkZvbnR9IFRoZSBmb250IGZvciB0aGUgcnVieS10ZXh0IHdoaWNoIGlzIHNob3duIGFib3ZlIHRoZSBvcmlnaW5hbCB0ZXh0LlxuICAgICogQG1ldGhvZCBnZXRSdWJ5VGV4dEZvbnRcbiAgICAjIyNcbiAgICBnZXRSdWJ5VGV4dEZvbnQ6ICh0b2tlbikgLT5cbiAgICAgICAgc3R5bGUgPSBudWxsXG4gICAgICAgIGZvbnQgPSBudWxsXG5cbiAgICAgICAgaWYgdG9rZW4ucnRTdHlsZUlkXG4gICAgICAgICAgICBzdHlsZSA9IHVpLlVJTWFuYWdlci5zdHlsZXNbXCJydWJ5VGV4dC1cIit0b2tlbi5ydFN0eWxlSWRdXG5cbiAgICAgICAgaWYgIXN0eWxlXG4gICAgICAgICAgICBzdHlsZSA9IHVpLlVJTWFuYWdlci5zdHlsZXNbXCJydWJ5VGV4dFwiXVxuXG4gICAgICAgIGZvbnQgPSBzdHlsZT8uZm9udCA/IEBmb250XG4gICAgICAgIGZvbnQuc2l6ZSA9IGZvbnQuc2l6ZSB8fCBAZm9udC5zaXplIC8gMlxuXG4gICAgICAgIHJldHVybiBmb250XG5cbiAgICAjIyMqXG4gICAgKiA8cD5NZWFzdXJlcyBhIGNvbnRyb2wtdG9rZW4uIElmIGEgdG9rZW4gcHJvZHVjZXMgYSB2aXN1YWwgcmVzdWx0IGxpa2UgZGlzcGxheWluZyBhbiBpY29uIHRoZW4gaXQgbXVzdCByZXR1cm4gdGhlIHNpemUgdGFrZW4gYnlcbiAgICAqIHRoZSB2aXN1YWwgcmVzdWx0LiBJZiB0aGUgdG9rZW4gaGFzIG5vIHZpc3VhbCByZXN1bHQsIDxiPm51bGw8L2I+IG11c3QgYmUgcmV0dXJuZWQuIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmb3IgZXZlcnkgdG9rZW4gd2hlbiB0aGUgbWVzc2FnZSBpcyBpbml0aWFsaXplZC48L3A+XG4gICAgKlxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gQSBjb250cm9sLXRva2VuLlxuICAgICogQHJldHVybiB7Z3MuU2l6ZX0gVGhlIHNpemUgb2YgdGhlIGFyZWEgdGFrZW4gYnkgdGhlIHZpc3VhbCByZXN1bHQgb2YgdGhlIHRva2VuIG9yIDxiPm51bGw8L2I+IGlmIHRoZSB0b2tlbiBoYXMgbm8gdmlzdWFsIHJlc3VsdC5cbiAgICAqIEBtZXRob2QgbWVhc3VyZUNvbnRyb2xUb2tlblxuICAgICogQHByb3RlY3RlZFxuICAgICMjI1xuICAgIG1lYXN1cmVDb250cm9sVG9rZW46ICh0b2tlbikgLT4gIyBDYW4gYmUgaW1wbGVtZW50ZWQgYnkgZGVyaXZlZCBjbGFzc2VzXG4gICAgICAgIHNpemUgPSBudWxsXG5cbiAgICAgICAgc3dpdGNoIHRva2VuLmNvZGVcbiAgICAgICAgICAgIHdoZW4gXCJBXCIgIyBBbmltYXRpb25cbiAgICAgICAgICAgICAgICBhbmltYXRpb24gPSBSZWNvcmRNYW5hZ2VyLmFuaW1hdGlvbnNbTWF0aC5tYXgodG9rZW4udmFsdWUtMSwgMCldXG4gICAgICAgICAgICAgICAgaWYgYW5pbWF0aW9uPy5ncmFwaGljLm5hbWU/XG4gICAgICAgICAgICAgICAgICAgIGltYWdlQml0bWFwID0gUmVzb3VyY2VNYW5hZ2VyLmdldEJpdG1hcChSZXNvdXJjZU1hbmFnZXIuZ2V0UGF0aChhbmltYXRpb24uZ3JhcGhpYykpXG4gICAgICAgICAgICAgICAgICAgIGlmIGltYWdlQml0bWFwP1xuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IHdpZHRoOiBNYXRoLnJvdW5kKGltYWdlQml0bWFwLndpZHRoIC8gYW5pbWF0aW9uLmZyYW1lc1gpLCBoZWlnaHQ6IE1hdGgucm91bmQoaW1hZ2VCaXRtYXAuaGVpZ2h0IC8gYW5pbWF0aW9uLmZyYW1lc1kpXG4gICAgICAgICAgICB3aGVuIFwiUlRcIiAjIFJ1YnkgVGV4dFxuICAgICAgICAgICAgICAgIGZvbnQgPSBAZ2V0UnVieVRleHRGb250KHRva2VuKVxuICAgICAgICAgICAgICAgIGZzID0gZm9udC5zaXplXG4gICAgICAgICAgICAgICAgZm9udC5zaXplID0gZm9udC5zaXplIHx8IEBmb250LnNpemUgLyAyXG4gICAgICAgICAgICAgICAgdG9rZW4ucmJTaXplID0gQGZvbnQubWVhc3VyZVRleHRQbGFpbih0b2tlbi5yYilcbiAgICAgICAgICAgICAgICB0b2tlbi5ydFNpemUgPSBmb250Lm1lYXN1cmVUZXh0UGxhaW4odG9rZW4ucnQpXG4gICAgICAgICAgICAgICAgZm9udC5zaXplID0gZnNcblxuICAgICAgICAgICAgICAgIHNpemUgPSB3aWR0aDogTWF0aC5tYXgodG9rZW4ucmJTaXplLndpZHRoLCB0b2tlbi5ydFNpemUud2lkdGgpLCBoZWlnaHQ6IHRva2VuLnJiU2l6ZS5oZWlnaHQgKyB0b2tlbi5ydFNpemUuaGVpZ2h0XG5cbiAgICAgICAgcmV0dXJuIHNpemVcblxuICAgICMjIypcbiAgICAqIDxwPkRyYXdzIHRoZSB2aXN1YWwgcmVzdWx0IG9mIGEgdG9rZW4sIGxpa2UgYW4gaWNvbiBmb3IgZXhhbXBsZSwgdG8gdGhlIHNwZWNpZmllZCBiaXRtYXAuIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmb3IgZXZlcnkgdG9rZW4gd2hpbGUgdGhlIHRleHQgaXMgcmVuZGVyZWQuPC9wPlxuICAgICpcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b2tlbiAtIEEgY29udHJvbC10b2tlbi5cbiAgICAqIEBwYXJhbSB7Z3MuQml0bWFwfSBiaXRtYXAgLSBUaGUgYml0bWFwIHVzZWQgZm9yIHRoZSBjdXJyZW50IHRleHQtbGluZS4gQ2FuIGJlIHVzZWQgdG8gZHJhdyBzb21ldGhpbmcgb24gaXQgbGlrZSBhbiBpY29uLCBldGMuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gb2Zmc2V0IC0gQW4geC1vZmZzZXQgZm9yIHRoZSBkcmF3LXJvdXRpbmUuXG4gICAgKiBAbWV0aG9kIGRyYXdDb250cm9sVG9rZW5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBkcmF3Q29udHJvbFRva2VuOiAodG9rZW4sIGJpdG1hcCwgb2Zmc2V0KSAtPlxuICAgICAgICBzd2l0Y2ggdG9rZW4uY29kZVxuICAgICAgICAgICAgd2hlbiBcIkFcIiAjIEFuaW1hdGlvblxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IFJlY29yZE1hbmFnZXIuYW5pbWF0aW9uc1tNYXRoLm1heCh0b2tlbi52YWx1ZS0xLCAwKV1cbiAgICAgICAgICAgICAgICBpZiBhbmltYXRpb24/LmdyYXBoaWMubmFtZT9cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VCaXRtYXAgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0Qml0bWFwKFJlc291cmNlTWFuYWdlci5nZXRQYXRoKGFuaW1hdGlvbi5ncmFwaGljKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgaW1hZ2VCaXRtYXA/XG4gICAgICAgICAgICAgICAgICAgICAgICByZWN0ID0gbmV3IGdzLlJlY3QoMCwgMCwgTWF0aC5yb3VuZChpbWFnZUJpdG1hcC53aWR0aCAvIGFuaW1hdGlvbi5mcmFtZXNYKSwgTWF0aC5yb3VuZChpbWFnZUJpdG1hcC5oZWlnaHQgLyBhbmltYXRpb24uZnJhbWVzWSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBiaXRtYXAuYmx0KG9mZnNldCwgQGN1cnJlbnRZLCBpbWFnZUJpdG1hcCwgcmVjdClcbiAgICAgICAgICAgIHdoZW4gXCJSVFwiXG4gICAgICAgICAgICAgICAgc3R5bGUgPSBudWxsXG4gICAgICAgICAgICAgICAgaWYgdG9rZW4ucnRTdHlsZUlkXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlID0gdWkuVUlNYW5hZ2VyLnN0eWxlc1tcInJ1YnlUZXh0LVwiK3Rva2VuLnJ0U3R5bGVJZF1cbiAgICAgICAgICAgICAgICBpZiAhc3R5bGVcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUgPSB1aS5VSU1hbmFnZXIuc3R5bGVzW1wicnVieVRleHRcIl1cblxuICAgICAgICAgICAgICAgIGZvbnQgPSBzdHlsZT8uZm9udCA/IEBvYmplY3QuZm9udFxuICAgICAgICAgICAgICAgIGZzID0gZm9udC5zaXplXG4gICAgICAgICAgICAgICAgZm9udC5zaXplID0gZm9udC5zaXplIHx8IEBvYmplY3QuZm9udC5zaXplIC8gMlxuXG4gICAgICAgICAgICAgICAgaWYgc3R5bGUgYW5kICFzdHlsZS5kZXNjcmlwdG9yLmZvbnQ/LmNvbG9yXG4gICAgICAgICAgICAgICAgICAgIGZvbnQuY29sb3Iuc2V0KEBvYmplY3QuZm9udC5jb2xvcilcblxuICAgICAgICAgICAgICAgIGJpdG1hcC5mb250ID0gZm9udFxuICAgICAgICAgICAgICAgIGJpdG1hcC5kcmF3VGV4dChvZmZzZXQsIGJpdG1hcC5mb250LmRlc2NlbnQsIE1hdGgubWF4KHRva2VuLnJiU2l6ZS53aWR0aCwgdG9rZW4ucnRTaXplLndpZHRoKSwgYml0bWFwLmhlaWdodCwgdG9rZW4ucnQsIDEsIDApXG4gICAgICAgICAgICAgICAgYml0bWFwLmZvbnQgPSBAb2JqZWN0LmZvbnRcbiAgICAgICAgICAgICAgICBmb250LnNpemUgPSBmc1xuICAgICAgICAgICAgICAgIGJpdG1hcC5kcmF3VGV4dChvZmZzZXQsIHRva2VuLnJ0U2l6ZS5oZWlnaHQsIE1hdGgubWF4KHRva2VuLnJiU2l6ZS53aWR0aCwgdG9rZW4ucnRTaXplLndpZHRoKSwgYml0bWFwLmhlaWdodCwgdG9rZW4ucmIsIDEsIDApXG5cblxuICAgICMjIypcbiAgICAqIFNwbGl0cyB1cCB0aGUgc3BlY2lmaWVkIHRva2VuIHVzaW5nIGEgamFwYW5lc2Ugd29yZC13cmFwIHRlY2huaXF1ZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHdvcmRXcmFwSmFwYW5lc2VcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b2tlbiAtIFRoZSB0b2tlbiB0byBzcGxpdCB1cC5cbiAgICAqIEBwYXJhbSB7Z3MuUmVuZGVyZXJUZXh0TGluZX0gbGluZSAtIFRoZSBjdXJyZW50IGxpbmUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBUaGUgd2lkdGggb2YgdGhlIGN1cnJlbnQgbGluZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBUaGUgaGVpZ2h0IG9mIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgKiBAcGFyYW0ge2dzLlJlbmRlcmVyVGV4dExpbmVbXX0gLSBBbiBhcnJheSBvZiBsaW5lcy4gSWYgdGhlIHRva2VuIGlzIHNwbGl0IHVwIGludG8gbXVsdGlwbGUgbGluZXMsIGFsbCBuZXdcbiAgICAqIGxpbmVzIGFyZSBhZGRlZCB0byB0aGlzIHJlc3VsdCBhcnJheS5cbiAgICAqIEByZXR1cm4ge2dzLlJlbmRlcmVyVGV4dExpbmV9IFRoZSBjdXJyZW50IGxpbmUsIHRoYXQgbWF5IGJlIHRoZSBzYW1lIGFzIHRoZSA8Yj5saW5lPC9iPiBwYXJhbWV0ZXJzIGJ1dCBpZiBuZXcgbGluZXNcbiAgICAqIGFyZSBjcmVhdGVkIGl0IGhhcyB0byBiZSB0aGUgbGFzdCBuZXcgY3JlYXRlZCBsaW5lLlxuICAgICMjI1xuICAgIHdvcmRXcmFwSmFwYW5lc2U6ICh0b2tlbiwgbGluZSwgd2lkdGgsIGhlaWdodCwgcmVzdWx0KSAtPlxuICAgICAgICBzdGFydE9mTGluZSA9ICfigJTigKbigKXjgLPjgLTjgLXjgIIu44O744CBOjssID8h4oC84oGH4oGI4oGJ4oCQ44Kg4oCT44CcKV3vvZ3jgJXjgInjgIvjgI3jgI/jgJHjgJnjgJfjgJ/igJlcIu+9oMK744O944O+44O844Kh44Kj44Kl44Kn44Kp44OD44Oj44Ol44On44Ou44O144O244GB44GD44GF44GH44GJ44Gj44KD44KF44KH44KO44KV44KW44ew44ex44ey44ez44e044e144e244e344e444e544e644e744e844e944e+44e/44CF44C7J1xuICAgICAgICBlbmRPZkxpbmUgPSAnKFvvvZvjgJTjgIjjgIrjgIzjgI7jgJDjgJjjgJbjgJ3igJhcIu+9n8KrJ1xuICAgICAgICBub1NwbGl0ID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg577yQ77yR77yS77yT77yU77yV77yW77yX77yY77yZ4oCU4oCm4oCl44Cz44C044C1J1xuICAgICAgICBkZXNjZW50ID0gQGZvbnQuZGVzY2VudFxuICAgICAgICBzaXplID0gQGZvbnQubWVhc3VyZVRleHRQbGFpbih0b2tlbilcbiAgICAgICAgZGVwdGggPSA4XG4gICAgICAgIGRlcHRoTGV2ZWwgPSAwXG4gICAgICAgIGkgPSAwXG4gICAgICAgIGogPSAwXG4gICAgICAgIGxhc3RDaGFyYWN0ZXJJbmRleCA9IDBcblxuICAgICAgICBpZiBzaXplLndpZHRoID4gQG9iamVjdC5kc3RSZWN0LndpZHRoLUBzcGFjZVNpemUud2lkdGgqMy1AcGFkZGluZyoyXG4gICAgICAgICAgICB3aGlsZSBpIDwgdG9rZW4ubGVuZ3RoXG4gICAgICAgICAgICAgICAgY2ggPSB0b2tlbltpXVxuICAgICAgICAgICAgICAgIHNpemUgPSBAZm9udC5tZWFzdXJlVGV4dFBsYWluKGNoKVxuICAgICAgICAgICAgICAgIHdpZHRoICs9IHNpemUud2lkdGhcbiAgICAgICAgICAgICAgICBtb3ZlZCA9IG5vXG4gICAgICAgICAgICAgICAgaWYgd2lkdGggPiBAb2JqZWN0LmRzdFJlY3Qud2lkdGggLSBAcGFkZGluZyoyXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoTGV2ZWwgPSAwXG4gICAgICAgICAgICAgICAgICAgIGogPSBpXG5cbiAgICAgICAgICAgICAgICAgICAgbG9vcFxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSBub1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSBqID4gMCBhbmQgc3RhcnRPZkxpbmUuaW5kZXhPZih0b2tlbltqXSkgIT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqLS1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHllc1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSBqID4gMCBhbmQgZW5kT2ZMaW5lLmluZGV4T2YodG9rZW5bai0xXSkgIT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqLS1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHllc1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSBqID4gMCBhbmQgbm9TcGxpdC5pbmRleE9mKHRva2VuW2otMV0pICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgai0tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB5ZXNcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgaiA9PSAwIGFuZCBtb3ZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSA9IGpcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGhMZXZlbCsrXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhayBpZiBkZXB0aExldmVsID49IGRlcHRoIG9yICFtb3ZlZFxuXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY29udGVudC5wdXNoKG5ldyBncy5SZW5kZXJlclRva2VuKG51bGwsIHRva2VuLnN1YnN0cmluZyhsYXN0Q2hhcmFjdGVySW5kZXgsIGkpLCBAZm9udCkpXG4gICAgICAgICAgICAgICAgICAgIGxhc3RDaGFyYWN0ZXJJbmRleCA9IGlcbiAgICAgICAgICAgICAgICAgICAgbGluZS5oZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIEBmb250LmxpbmVIZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIGxpbmUud2lkdGggPSB3aWR0aCAtIHNpemUud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgbGluZS5kZXNjZW50ID0gZGVzY2VudFxuICAgICAgICAgICAgICAgICAgICBkZXNjZW50ID0gQGZvbnQuZGVzY2VudFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBzaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChsaW5lKVxuICAgICAgICAgICAgICAgICAgICBsaW5lID0gbmV3IGdzLlJlbmRlcmVyVGV4dExpbmUoKVxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHdpZHRoIC0gKHdpZHRoIC0gc2l6ZS53aWR0aClcblxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsaW5lLmNvbnRlbnQucHVzaChuZXcgZ3MuUmVuZGVyZXJUb2tlbihudWxsLCB0b2tlbiwgQGZvbnQpKVxuICAgICAgICAgICAgbGluZS5oZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIEBmb250LmxpbmVIZWlnaHQpXG4gICAgICAgICAgICBsaW5lLndpZHRoID0gd2lkdGggKyBzaXplLndpZHRoXG4gICAgICAgICAgICBsaW5lLmRlc2NlbnQgPSBkZXNjZW50XG5cbiAgICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBAZm9udC5saW5lSGVpZ2h0KVxuXG4gICAgICAgIGlmIGxhc3RDaGFyYWN0ZXJJbmRleCAhPSBpXG4gICAgICAgICAgICBsaW5lLmNvbnRlbnQucHVzaChuZXcgZ3MuUmVuZGVyZXJUb2tlbihudWxsLCB0b2tlbi5zdWJzdHJpbmcobGFzdENoYXJhY3RlckluZGV4LCBpKSwgQGZvbnQpKVxuICAgICAgICAgICAgbGluZS53aWR0aCA9IHdpZHRoXG4gICAgICAgICAgICBsaW5lLmhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgbGluZS5oZWlnaHQpXG4gICAgICAgICAgICBsaW5lLmRlc2NlbnQgPSBkZXNjZW50XG5cbiAgICAgICAgcmV0dXJuIGxpbmVcblxuXG4gICAgIyMjKlxuICAgICogRG9lcyBub3Qgd29yZC13cmFwcGluZyBhdCBhbGwuIEl0IGp1c3QgYWRkcyB0aGUgdGV4dCB0b2tlbiB0byB0aGUgbGluZSBhcyBpcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHdvcmRXcmFwTm9uZVxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gVGhlIHRva2VuIHRvIHNwbGl0IHVwLlxuICAgICogQHBhcmFtIHtncy5SZW5kZXJlclRleHRMaW5lfSBsaW5lIC0gVGhlIGN1cnJlbnQgbGluZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIFRoZSB3aWR0aCBvZiB0aGUgY3VycmVudCBsaW5lLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIFRoZSBoZWlnaHQgb2YgdGhlIGN1cnJlbnQgbGluZS5cbiAgICAqIEBwYXJhbSB7Z3MuUmVuZGVyZXJUZXh0TGluZVtdfSAtIEFuIGFycmF5IG9mIGxpbmVzLiBJZiB0aGUgdG9rZW4gaXMgc3BsaXQgdXAgaW50byBtdWx0aXBsZSBsaW5lcywgYWxsIG5ld1xuICAgICogbGluZXMgYXJlIGFkZGVkIHRvIHRoaXMgcmVzdWx0IGFycmF5LlxuICAgICogQHJldHVybiB7Z3MuUmVuZGVyZXJUZXh0TGluZX0gVGhlIGN1cnJlbnQgbGluZSwgdGhhdCBtYXkgYmUgdGhlIHNhbWUgYXMgdGhlIDxiPmxpbmU8L2I+IHBhcmFtZXRlcnMgYnV0IGlmIG5ldyBsaW5lc1xuICAgICogYXJlIGNyZWF0ZWQgaXQgaGFzIHRvIGJlIHRoZSBsYXN0IG5ldyBjcmVhdGVkIGxpbmUuXG4gICAgIyMjXG4gICAgd29yZFdyYXBOb25lOiAodG9rZW4sIGxpbmUsIHdpZHRoLCBoZWlnaHQsIHJlc3VsdCkgLT5cbiAgICAgICAgc2l6ZSA9IEBmb250Lm1lYXN1cmVUZXh0UGxhaW4odG9rZW4pXG4gICAgICAgIGhlaWdodCA9IE1hdGgubWF4KHNpemUuaGVpZ2h0LCBoZWlnaHQgfHwgQGZvbnQubGluZUhlaWdodClcblxuICAgICAgICBpZiB0b2tlbi5sZW5ndGggPiAwXG4gICAgICAgICAgICB3aWR0aCArPSBzaXplLndpZHRoXG4gICAgICAgICAgICBsaW5lLndpZHRoID0gd2lkdGhcbiAgICAgICAgICAgIGxpbmUuaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBsaW5lLmhlaWdodClcbiAgICAgICAgICAgIGxpbmUuZGVzY2VudCA9IEBmb250LmRlc2NlbnRcbiAgICAgICAgICAgIGxpbmUuY29udGVudC5wdXNoKG5ldyBncy5SZW5kZXJlclRva2VuKG51bGwsIHRva2VuKSlcblxuICAgICAgICByZXR1cm4gbGluZVxuXG4gICAgIyMjKlxuICAgICogU3BsaXRzIHVwIHRoZSBzcGVjaWZpZWQgdG9rZW4gdXNpbmcgYSBzcGFjZS1iYXNlZCB3b3JkLXdyYXAgdGVjaG5pcXVlLlxuICAgICpcbiAgICAqIEBtZXRob2Qgd29yZFdyYXBTcGFjZUJhc2VkXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdG9rZW4gLSBUaGUgdG9rZW4gdG8gc3BsaXQgdXAuXG4gICAgKiBAcGFyYW0ge2dzLlJlbmRlcmVyVGV4dExpbmV9IGxpbmUgLSBUaGUgY3VycmVudCBsaW5lLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gVGhlIHdpZHRoIG9mIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gVGhlIGhlaWdodCBvZiB0aGUgY3VycmVudCBsaW5lLlxuICAgICogQHBhcmFtIHtncy5SZW5kZXJlclRleHRMaW5lW119IC0gQW4gYXJyYXkgb2YgbGluZXMuIElmIHRoZSB0b2tlbiBpcyBzcGxpdCB1cCBpbnRvIG11bHRpcGxlIGxpbmVzLCBhbGwgbmV3XG4gICAgKiBsaW5lcyBhcmUgYWRkZWQgdG8gdGhpcyByZXN1bHQgYXJyYXkuXG4gICAgKiBAcmV0dXJuIHtncy5SZW5kZXJlclRleHRMaW5lfSBUaGUgY3VycmVudCBsaW5lLCB0aGF0IG1heSBiZSB0aGUgc2FtZSBhcyB0aGUgPGI+bGluZTwvYj4gcGFyYW1ldGVycyBidXQgaWYgbmV3IGxpbmVzXG4gICAgKiBhcmUgY3JlYXRlZCBpdCBoYXMgdG8gYmUgdGhlIGxhc3QgbmV3IGNyZWF0ZWQgbGluZS5cbiAgICAjIyNcbiAgICB3b3JkV3JhcFNwYWNlQmFzZWQ6ICh0b2tlbiwgbGluZSwgd2lkdGgsIGhlaWdodCwgcmVzdWx0KSAtPlxuICAgICAgICBjdXJyZW50V29yZHMgPSBbXVxuICAgICAgICB3b3JkcyA9IHRva2VuLnNwbGl0KFwiIFwiKVxuICAgICAgICBkZXNjZW50ID0gQGZvbnQuZGVzY2VudFxuICAgICAgICBAc3BhY2VTaXplID0gQGZvbnQubWVhc3VyZVRleHRQbGFpbihcIiBcIilcblxuICAgICAgICBmb3Igd29yZCwgaSBpbiB3b3Jkc1xuICAgICAgICAgICAgc2l6ZSA9IEBmb250Lm1lYXN1cmVUZXh0UGxhaW4od29yZClcbiAgICAgICAgICAgIHdpZHRoICs9IHNpemUud2lkdGggKyBAc3BhY2VTaXplLndpZHRoXG5cbiAgICAgICAgICAgIGlmIHdpZHRoID4gQG9iamVjdC5kc3RSZWN0LndpZHRoIC0gQHBhZGRpbmcqMlxuICAgICAgICAgICAgICAgIHRva2VuID0gbmV3IGdzLlJlbmRlcmVyVG9rZW4obnVsbCwgY3VycmVudFdvcmRzLmpvaW4oXCIgXCIpKVxuICAgICAgICAgICAgICAgIHRva2VuLnRha2VGb3JtYXQoQGZvbnQpXG4gICAgICAgICAgICAgICAgbGluZS5jb250ZW50LnB1c2godG9rZW4pXG4gICAgICAgICAgICAgICAgbGluZS5oZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIGxpbmUuaGVpZ2h0KVxuICAgICAgICAgICAgICAgIGxpbmUud2lkdGggPSB3aWR0aCAtIHNpemUud2lkdGhcbiAgICAgICAgICAgICAgICBsaW5lLmRlc2NlbnQgPSBNYXRoLm1heChsaW5lLmRlc2NlbnQsIGRlc2NlbnQpXG4gICAgICAgICAgICAgICAgZGVzY2VudCA9IE1hdGgubWF4KGRlc2NlbnQsIEBmb250LmRlc2NlbnQpXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChsaW5lKVxuICAgICAgICAgICAgICAgIGxpbmUgPSBuZXcgZ3MuUmVuZGVyZXJUZXh0TGluZSgpXG4gICAgICAgICAgICAgICAgY3VycmVudFdvcmRzID0gW3dvcmRdXG4gICAgICAgICAgICAgICAgd2lkdGggPSB3aWR0aCAtICh3aWR0aCAtIHNpemUud2lkdGgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY3VycmVudFdvcmRzLnB1c2god29yZClcblxuICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBAZm9udC5saW5lSGVpZ2h0KVxuXG4gICAgICAgIGlmIGN1cnJlbnRXb3Jkcy5sZW5ndGggPiAwXG4gICAgICAgICAgICB0b2tlbiA9IG5ldyBncy5SZW5kZXJlclRva2VuKG51bGwsIGN1cnJlbnRXb3Jkcy5qb2luKFwiIFwiKSlcbiAgICAgICAgICAgIHRva2VuLnRha2VGb3JtYXQoQGZvbnQpXG4gICAgICAgICAgICBsaW5lLmNvbnRlbnQucHVzaCh0b2tlbilcbiAgICAgICAgICAgIGxpbmUud2lkdGggPSB3aWR0aFxuICAgICAgICAgICAgbGluZS5oZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIGxpbmUuaGVpZ2h0KVxuICAgICAgICAgICAgbGluZS5kZXNjZW50ID0gTWF0aC5tYXgoZGVzY2VudCwgbGluZS5kZXNjZW50KVxuXG4gICAgICAgIHJldHVybiBsaW5lXG5cbiAgICAjIyMqXG4gICAgKiBTcGxpdHMgdXAgdGhlIHNwZWNpZmllZCB0b2tlbiB1c2luZyBhIHdvcmQtd3JhcCB0ZWNobmlxdWUuIFRoZSBraW5kIG9mIHdvcmQtd3JhcCB0ZWNobmlxdWVcbiAgICAqIGRlcGVuZHMgb24gdGhlIHNlbGVjdGVkIGxhbmd1YWdlLiBZb3UgY2FuIG92ZXJ3cml0ZSB0aGlzIG1ldGhvZCBpbiBkZXJpdmVkIGNsYXNzZXMgdG8gaW1wbGVtZW50IHlvdXJcbiAgICAqIG93biBjdXN0b20gd29yZC13cmFwIHRlY2huaXF1ZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBleGVjdXRlV29yZFdyYXBcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b2tlbiAtIFRoZSB0b2tlbiB0byBzcGxpdCB1cC5cbiAgICAqIEBwYXJhbSB7Z3MuUmVuZGVyZXJUZXh0TGluZX0gbGluZSAtIFRoZSBjdXJyZW50IGxpbmUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBUaGUgd2lkdGggb2YgdGhlIGN1cnJlbnQgbGluZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBUaGUgaGVpZ2h0IG9mIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgKiBAcGFyYW0ge2dzLlJlbmRlcmVyVGV4dExpbmVbXX0gLSBBbiBhcnJheSBvZiBsaW5lcy4gSWYgdGhlIHRva2VuIGlzIHNwbGl0IHVwIGludG8gbXVsdGlwbGUgbGluZXMsIGFsbCBuZXdcbiAgICAqIGxpbmVzIGFyZSBhZGRlZCB0byB0aGlzIHJlc3VsdCBhcnJheS5cbiAgICAqIEByZXR1cm4ge2dzLlJlbmRlcmVyVGV4dExpbmV9IFRoZSBjdXJyZW50IGxpbmUsIHRoYXQgbWF5IGJlIHRoZSBzYW1lIGFzIHRoZSA8Yj5saW5lPC9iPiBwYXJhbWV0ZXJzIGJ1dCBpZiBuZXcgbGluZXNcbiAgICAqIGFyZSBjcmVhdGVkIGl0IGhhcyB0byBiZSB0aGUgbGFzdCBuZXcgY3JlYXRlZCBsaW5lLlxuICAgICMjI1xuICAgIGV4ZWN1dGVXb3JkV3JhcDogKHRva2VuLCBsaW5lLCB3aWR0aCwgaGVpZ2h0LCByZXN1bHQsIHdvcmRXcmFwKSAtPlxuICAgICAgICBpZiB3b3JkV3JhcFxuICAgICAgICAgICAgc3dpdGNoIExhbmd1YWdlTWFuYWdlci5sYW5ndWFnZS53b3JkV3JhcFxuICAgICAgICAgICAgICAgIHdoZW4gXCJzcGFjZUJhc2VkXCJcbiAgICAgICAgICAgICAgICAgICAgQHdvcmRXcmFwU3BhY2VCYXNlZCh0b2tlbiwgbGluZSwgd2lkdGgsIGhlaWdodCwgcmVzdWx0KVxuICAgICAgICAgICAgICAgIHdoZW4gXCJqYXBhbmVzZVwiXG4gICAgICAgICAgICAgICAgICAgIEB3b3JkV3JhcEphcGFuZXNlKHRva2VuLCBsaW5lLCB3aWR0aCwgaGVpZ2h0LCByZXN1bHQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB3b3JkV3JhcE5vbmUodG9rZW4sIGxpbmUsIHdpZHRoLCBoZWlnaHQsIHJlc3VsdClcblxuXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhbiBhIG9mIGxpbmUtb2JqZWN0cy4gRWFjaCBsaW5lLW9iamVjdCBpcyBhIGxpc3Qgb2YgdG9rZW4tb2JqZWN0cy5cbiAgICAqIEEgdG9rZW4tb2JqZWN0IGNhbiBiZSBqdXN0IGEgc3RyaW5nIG9yIGFuIG9iamVjdCBjb250YWluaW5nIG1vcmUgaW5mb3JtYXRpb25cbiAgICAqIGFib3V0IGhvdyB0byBwcm9jZXNzIHRoZSB0b2tlbiBhdCBydW50aW1lLlxuICAgICpcbiAgICAqIEEgbGluZS1vYmplY3QgYWxzbyBjb250YWlucyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIGxpa2UgdGhlIHdpZHRoIGFuZCBoZWlnaHRcbiAgICAqIG9mIHRoZSBsaW5lKGluIHBpeGVscykuXG4gICAgKlxuICAgICogSWYgdGhlIHdvcmRXcmFwIHBhcmFtIGlzIHNldCwgbGluZS1icmVha3MgYXJlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBpZiBhIGxpbmVcbiAgICAqIGRvZXNuJ3QgZml0IGludG8gdGhlIHdpZHRoIG9mIHRoZSBnYW1lIG9iamVjdCdzIGJpdG1hcC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNhbGN1bGF0ZUxpbmVzXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEEgbWVzc2FnZSBjcmVhdGluZyB0aGUgbGluZS1vYmplY3RzIGZvci5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gd29yZFdyYXAgLSBJZiB3b3JkV3JhcCBpcyBzZXQgdG8gdHJ1ZSwgbGluZS1icmVha3MgYXJlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZmlyc3RMaW5lV2lkdGg9MF0gLSBUaGUgY3VycmVudCB3aWR0aCBvZiB0aGUgZmlyc3QgbGluZS5cbiAgICAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBvZiBsaW5lLW9iamVjdHMuXG4gICAgIyMjXG4gICAgY2FsY3VsYXRlTGluZXM6IChtZXNzYWdlLCB3b3JkV3JhcCwgZmlyc3RMaW5lV2lkdGgpIC0+XG4gICAgICAgIHJlc3VsdCA9IFtdXG4gICAgICAgIGxpbmUgPSBuZXcgZ3MuUmVuZGVyZXJUZXh0TGluZSgpXG4gICAgICAgIHdpZHRoID0gZmlyc3RMaW5lV2lkdGggfHwgMFxuICAgICAgICBoZWlnaHQgPSAwXG4gICAgICAgIGRlc2NlbnQgPSBAZm9udC5kZXNjZW50XG4gICAgICAgIGN1cnJlbnRXb3JkcyA9IFtdXG4gICAgICAgIHNpemUgPSBudWxsXG4gICAgICAgIEBzcGFjZVNpemUgPSBAZm9udC5tZWFzdXJlQ2hhcihcIiBcIilcbiAgICAgICAgQGZvbnRTaXplID0gQGZvbnQuc2l6ZVxuXG4gICAgICAgIHRva2VucyA9IG1lc3NhZ2Uuc3BsaXQoL1xceyhbQS16XSspOihbXlxce1xcfV0rKVxcfXwoXFxuKS9nbSlcbiAgICAgICAgdG9rZW4gPSBudWxsXG4gICAgICAgIHQgPSAwXG5cbiAgICAgICAgdW5kZXJsaW5lID0gQGZvbnQudW5kZXJsaW5lXG4gICAgICAgIHN0cmlrZVRocm91Z2ggPSBAZm9udC5zdHJpa2VUaHJvdWdoXG4gICAgICAgIGl0YWxpYyA9IEBmb250Lml0YWxpY1xuICAgICAgICBib2xkID0gQGZvbnQuYm9sZFxuICAgICAgICBzbWFsbENhcHMgPSBAZm9udC5zbWFsbENhcHNcblxuICAgICAgICB3aGlsZSB0IDwgdG9rZW5zLmxlbmd0aFxuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbnNbdF1cblxuICAgICAgICAgICAgaWYgdCAlIDQgIT0gMFxuICAgICAgICAgICAgICAgIGlmIHRva2VuP1xuICAgICAgICAgICAgICAgICAgICB0b2tlbk9iamVjdCA9IEBjcmVhdGVUb2tlbih0b2tlbiwgdG9rZW5zW3QrMV0pXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgdG9rZW5PYmplY3QucHVzaD9cbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkodG9rZW5zLCBbdCszLCAwXS5jb25jYXQodG9rZW5PYmplY3QpKVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIG5vdCB0b2tlbk9iamVjdC5jb2RlP1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zW3QrM10gPSB0b2tlbk9iamVjdCArIHRva2Vuc1t0KzNdXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemUgPSBAbWVhc3VyZUNvbnRyb2xUb2tlbih0b2tlbk9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHNpemVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCArPSBzaXplLndpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBzaXplLmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgICAgICNkZXNjZW50ID0gTWF0aC5tYXgoQGZvbnQuZGVzY2VudCwgZGVzY2VudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY29udGVudC5wdXNoKHRva2VuT2JqZWN0KVxuICAgICAgICAgICAgICAgIGVsc2UgIyBNdXN0IGJlIGEgbmV3LWxpbmVcbiAgICAgICAgICAgICAgICAgICAgbGluZS5oZWlnaHQgPSBoZWlnaHQgfHwgQGZvbnQubGluZUhlaWdodFxuICAgICAgICAgICAgICAgICAgICBsaW5lLndpZHRoID0gd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgbGluZS5kZXNjZW50ID0gZGVzY2VudFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChsaW5lKVxuICAgICAgICAgICAgICAgICAgICBsaW5lID0gbmV3IGdzLlJlbmRlcmVyVGV4dExpbmUoKVxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNvbnRlbnQucHVzaChuZXcgZ3MuUmVuZGVyZXJUb2tlbihudWxsLCBcIlxcblwiLCBAZm9udCkpXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gMFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSAwXG4gICAgICAgICAgICAgICAgICAgIGRlc2NlbnQgPSBAZm9udC5kZXNjZW50XG4gICAgICAgICAgICAgICAgdCArPSAyXG4gICAgICAgICAgICBlbHNlIGlmIHRva2VuLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICBsaW5lID0gQGV4ZWN1dGVXb3JkV3JhcCh0b2tlbiwgbGluZSwgd2lkdGgsIGhlaWdodCwgcmVzdWx0LCB3b3JkV3JhcClcbiAgICAgICAgICAgICAgICB3aWR0aCA9IGxpbmUud2lkdGhcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBsaW5lLmhlaWdodFxuICAgICAgICAgICAgICAgIGRlc2NlbnQgPSBsaW5lLmRlc2NlbnRcblxuICAgICAgICAgICAgdCsrXG5cbiAgICAgICAgaWYgbGluZS5jb250ZW50Lmxlbmd0aCA+IDAgb3IgcmVzdWx0Lmxlbmd0aCA9PSAwXG4gICAgICAgICAgICBsaW5lLmhlaWdodCA9IGhlaWdodFxuICAgICAgICAgICAgbGluZS53aWR0aCA9IHdpZHRoXG4gICAgICAgICAgICBsaW5lLmRlc2NlbnQgPSBkZXNjZW50XG4gICAgICAgICAgICByZXN1bHQucHVzaChsaW5lKVxuXG5cbiAgICAgICAgQGZvbnQuc2l6ZSA9IEBmb250U2l6ZVxuICAgICAgICBAZm9udC51bmRlcmxpbmUgPSB1bmRlcmxpbmVcbiAgICAgICAgQGZvbnQuc3RyaWtlVGhyb3VnaCA9IHN0cmlrZVRocm91Z2hcbiAgICAgICAgQGZvbnQuaXRhbGljID0gaXRhbGljXG4gICAgICAgIEBmb250LmJvbGQgPSBib2xkXG4gICAgICAgIEBmb250LnNtYWxsQ2FwcyA9IHNtYWxsQ2Fwc1xuXG4gICAgICAgIHJldHVybiByZXN1bHRcblxuXG4gICAgIyMjKlxuICAgICogTWVhc3VyZXMgdGhlIGRpbWVuc2lvbnMgb2YgZm9ybWF0dGVkIGxpbmVzIGluIHBpeGVscy4gVGhlIHJlc3VsdCBpcyBub3RcbiAgICAqIHBpeGVsLXBlcmZlY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBtZWFzdXJlRm9ybWF0dGVkTGluZXNcbiAgICAqIEBwYXJhbSB7Z3MuUmVuZGVyZXJUZXh0TGluZVtdfSBsaW5lcyAtIEFuIGFycmF5IG9mIHRleHQgbGluZXMgdG8gbWVhc3VyZS5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gd29yZFdyYXAgLSBJZiB3b3JkV3JhcCBpcyBzZXQgdG8gdHJ1ZSwgYXV0b21hdGljYWxseSBjcmVhdGVkIGxpbmUtYnJlYWtzIHdpbGwgYmUgY2FsY3VsYXRlZC5cbiAgICAqIEByZXN1bHQge09iamVjdH0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHRleHQuXG4gICAgIyMjXG4gICAgbWVhc3VyZUZvcm1hdHRlZExpbmVzOiAobGluZXMsIHdvcmRXcmFwKSAtPlxuICAgICAgICBzaXplID0gd2lkdGg6IDAsIGhlaWdodDogMFxuXG4gICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICBzaXplLndpZHRoID0gTWF0aC5tYXgobGluZS53aWR0aCsyLCBzaXplLndpZHRoKVxuICAgICAgICAgICAgc2l6ZS5oZWlnaHQgKz0gbGluZS5oZWlnaHQgKyBAbGluZVNwYWNpbmdcblxuICAgICAgICBzaXplLmhlaWdodCAtPSBAbGluZVNwYWNpbmdcblxuICAgICAgICByZXR1cm4gc2l6ZVxuXG4gICAgIyMjKlxuICAgICogTWVhc3VyZXMgdGhlIGRpbWVuc2lvbnMgb2YgYSBmb3JtYXR0ZWQgdGV4dCBpbiBwaXhlbHMuIFRoZSByZXN1bHQgaXMgbm90XG4gICAgKiBwaXhlbC1wZXJmZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVhc3VyZUZvcm1hdHRlZFRleHRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgdG8gbWVhc3VyZS5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gd29yZFdyYXAgLSBJZiB3b3JkV3JhcCBpcyBzZXQgdG8gdHJ1ZSwgYXV0b21hdGljYWxseSBjcmVhdGVkIGxpbmUtYnJlYWtzIHdpbGwgYmUgY2FsY3VsYXRlZC5cbiAgICAqIEByZXN1bHQge09iamVjdH0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHRleHQuXG4gICAgIyMjXG4gICAgbWVhc3VyZUZvcm1hdHRlZFRleHQ6ICh0ZXh0LCB3b3JkV3JhcCkgLT5cbiAgICAgICAgQGZvbnQuc2V0KEBvYmplY3QuZm9udClcblxuICAgICAgICBzaXplID0gbnVsbFxuICAgICAgICBsaW5lcyA9IEBjYWxjdWxhdGVMaW5lcyh0ZXh0LCB3b3JkV3JhcClcblxuICAgICAgICBzaXplID0gQG1lYXN1cmVGb3JtYXR0ZWRMaW5lcyhsaW5lcywgd29yZFdyYXApXG5cbiAgICAgICAgcmV0dXJuIHNpemVcblxuICAgICMjIypcbiAgICAqIE1lYXN1cmVzIHRoZSBkaW1lbnNpb25zIG9mIGEgcGxhaW4gdGV4dCBpbiBwaXhlbHMuIEZvcm1hdHRpbmcgYW5kXG4gICAgKiB3b3JkLXdyYXBwaW5nIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAgICpcbiAgICAqIEBtZXRob2QgbWVhc3VyZVRleHRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgdG8gbWVhc3VyZS5cbiAgICAqIEByZXN1bHQge09iamVjdH0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHRleHQuXG4gICAgIyMjXG4gICAgbWVhc3VyZVRleHQ6ICh0ZXh0KSAtPlxuICAgICAgICBzaXplID0gd2lkdGg6IDAsIGhlaWdodDogMFxuICAgICAgICBsaW5lcyA9IHRleHQudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKVxuXG4gICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICBsaW5lU2l6ZSA9IEBvYmplY3QuZm9udC5tZWFzdXJlVGV4dCh0ZXh0KVxuICAgICAgICAgICAgc2l6ZS53aWR0aCA9IE1hdGgubWF4KHNpemUud2lkdGgsIGxpbmVTaXplLndpZHRoKVxuICAgICAgICAgICAgc2l6ZS5oZWlnaHQgKz0gQG9iamVjdC5mb250LmxpbmVIZWlnaHQgKyBAbGluZVNwYWNpbmdcblxuICAgICAgICBzaXplLmhlaWdodCAtPSBAbGluZVNwYWNpbmdcblxuICAgICAgICByZXR1cm4gc2l6ZVxuXG4gICAgIyMjKlxuICAgICogU2VhcmNoZXMgZm9yIGEgdG9rZW4gaW4gYSBsaXN0IG9mIHRva2VucyBhbmQgcmV0dXJucyB0aGUgZmlyc3QgbWF0Y2guXG4gICAgKlxuICAgICogQG1ldGhvZCBmaW5kVG9rZW5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEluZGV4IC0gVGhlIGluZGV4IGluIHRoZSBsaXN0IG9mIHRva2VucyB3aGVyZSB0aGUgc2VhcmNoIHdpbGwgc3RhcnQuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSAtIFRoZSBjb2RlIG9mIHRoZSB0b2tlbiB0byBzZWFyY2ggZm9yLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGRpcmVjdGlvbiAtIFRoZSBzZWFyY2ggZGlyZWN0aW9uLCBjYW4gYmUgZm9yd2FyZCgxKSBvciBiYWNrd2FyZCgtMSkuXG4gICAgKiBAcGFyYW0ge09iamVjdFtdfSB0b2tlbnMgLSBUaGUgbGlzdCBvZiB0b2tlbnMgdG8gc2VhcmNoLlxuICAgICogQHJlc3VsdCB7T2JqZWN0fSBUaGUgZmlyc3QgdG9rZW4gd2hpY2ggbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIGNvZGUgb3IgPGI+bnVsbDwvYj4gaWYgdGhlIHRva2VuIGNhbm5vdCBiZSBmb3VuZC5cbiAgICAjIyNcbiAgICBmaW5kVG9rZW46IChzdGFydEluZGV4LCBjb2RlLCBkaXJlY3Rpb24sIHRva2VucykgLT5cbiAgICAgICAgdG9rZW4gPSBudWxsXG4gICAgICAgIGkgPSBzdGFydEluZGV4XG4gICAgICAgIGlmIGRpcmVjdGlvbiA9PSAtMVxuICAgICAgICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgICAgICAgICAgdCA9IHRva2Vuc1tpXVxuICAgICAgICAgICAgICAgIGlmIHQuY29kZSA9PSBjb2RlXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0gdFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGktLVxuXG4gICAgICAgIHJldHVybiB0b2tlblxuXG4gICAgIyMjKlxuICAgICogU2VhcmNoZXMgZm9yIGEgc3BlY2lmaWMga2luZCBvZiB0b2tlbnMgYmV0d2VlbiBhIHN0YXJ0IGFuZCBhbiBlbmQgdG9rZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCBmaW5kVG9rZW5zQmV0d2VlblxuICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0SW5kZXggLSBUaGUgaW5kZXggd2hlcmUgdGhlIHNlYXJjaCB3aWxsIHN0YXJ0LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZEluZGV4IC0gVGhlIGluZGV4IHdoZXJlIHRoZSBzZWFyY2ggd2lsbCBlbmQuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSAtIFRoZSBjb2RlIG9mIHRoZSB0b2tlbi10eXBlIHRvIHNlYXJjaCBmb3IuXG4gICAgKiBAcGFyYW0ge09iamVjdFtdfSB0b2tlbnMgLSBUaGUgbGlzdCBvZiB0b2tlbnMgdG8gc2VhcmNoLlxuICAgICogQHJlc3VsdCB7T2JqZWN0W119IExpc3Qgb2YgdG9rZW5zIG1hdGNoaW5nIHRoZSBzcGVjaWZpZWQgY29kZS4gSXRzIGFuIGVtcHR5IGxpc3QgaWYgbm8gdG9rZW5zIHdlcmUgZm91bmQuXG4gICAgIyMjXG4gICAgZmluZFRva2Vuc0JldHdlZW46IChzdGFydEluZGV4LCBlbmRJbmRleCwgY29kZSwgdG9rZW5zKSAtPlxuICAgICAgICByZXN1bHQgPSBbXVxuICAgICAgICBzID0gc3RhcnRJbmRleFxuICAgICAgICBlID0gZW5kSW5kZXhcblxuICAgICAgICB3aGlsZSBzIDwgZVxuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbnNbc11cbiAgICAgICAgICAgIGlmIGB0b2tlbi5jb2RlID09IGNvZGVgXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godG9rZW4pXG4gICAgICAgICAgICBzKytcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICAjIyMqXG4gICAgKiBQcm9jZXNzZXMgYSBjb250cm9sLXRva2VuLiBBIGNvbnRyb2wtdG9rZW4gaXMgYSB0b2tlbiB3aGljaCBpbmZsdWVuY2VzXG4gICAgKiB0aGUgdGV4dC1yZW5kZXJpbmcgbGlrZSBjaGFuZ2luZyB0aGUgZm9udHMgY29sb3IsIHNpemUgb3Igc3R5bGUuXG4gICAgKlxuICAgICogQ2hhbmdlcyB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgYXBwbGllZCB0byB0aGUgZ2FtZSBvYmplY3QncyBmb250LlxuICAgICpcbiAgICAqIEBtZXRob2QgcHJvY2Vzc0NvbnRyb2xUb2tlblxuICAgICogQHBhcmFtIHtPYmplY3R9IHRva2VuIC0gQSBjb250cm9sLXRva2VuLlxuICAgICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3Qgd2hpY2ggY2FuIGNvbnRhaW4gYWRkaXRpb25hbCBpbmZvIG5lZWRlZCBmb3IgcHJvY2Vzc2luZy5cbiAgICAjIyNcbiAgICBwcm9jZXNzQ29udHJvbFRva2VuOiAodG9rZW4pIC0+XG4gICAgICAgIHJlc3VsdCA9IG51bGxcblxuICAgICAgICBzd2l0Y2ggdG9rZW4uY29kZVxuICAgICAgICAgICAgd2hlbiBcIlNaXCJcbiAgICAgICAgICAgICAgICBAb2JqZWN0LmZvbnQuc2l6ZSA9IHRva2VuLnZhbHVlIHx8IEBmb250U2l6ZVxuICAgICAgICAgICAgd2hlbiBcIkNcIlxuICAgICAgICAgICAgICAgIGlmIGlzTmFOKHRva2VuLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmZvbnQuY29sb3IgPSBncy5Db2xvci5mcm9tSGV4KHRva2VuLnZhbHVlKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgdG9rZW4udmFsdWUgPD0gMFxuICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmZvbnQuY29sb3IgPSBGb250LmRlZmF1bHRDb2xvclxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5mb250LmNvbG9yID0gUmVjb3JkTWFuYWdlci5zeXN0ZW0uY29sb3JzW3Rva2VuLnZhbHVlLTFdIHx8IEZvbnQuZGVmYXVsdENvbG9yXG4gICAgICAgICAgICB3aGVuIFwiWVwiXG4gICAgICAgICAgICAgICAgc3dpdGNoIHRva2VuLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJVXCIgdGhlbiBAb2JqZWN0LmZvbnQudW5kZXJsaW5lID0geWVzXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJTXCIgdGhlbiBAb2JqZWN0LmZvbnQuc3RyaWtlVGhyb3VnaCA9IHllc1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiSVwiIHRoZW4gQG9iamVjdC5mb250Lml0YWxpYyA9IHllc1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiQlwiIHRoZW4gQG9iamVjdC5mb250LmJvbGQgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIkNcIiB0aGVuIEBvYmplY3QuZm9udC5zbWFsbENhcHMgPSB5ZXNcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIk5VXCIgdGhlbiBAb2JqZWN0LmZvbnQudW5kZXJsaW5lID0gbm9cbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIk5TXCIgdGhlbiBAb2JqZWN0LmZvbnQuc3RyaWtlVGhyb3VnaCA9IG5vXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJOSVwiIHRoZW4gQG9iamVjdC5mb250LnVuZGVybGluZSA9IG5vXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCJOQlwiIHRoZW4gQG9iamVjdC5mb250LmJvbGQgPSBub1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiTkNcIiB0aGVuIEBvYmplY3QuZm9udC5zbWFsbENhcHMgPSBub1xuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiTlwiXG4gICAgICAgICAgICAgICAgICAgICAgICBAb2JqZWN0LmZvbnQudW5kZXJsaW5lID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZm9udC5zdHJpa2VUaHJvdWdoID0gbm9cbiAgICAgICAgICAgICAgICAgICAgICAgIEBvYmplY3QuZm9udC5pdGFsaWMgPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5mb250LmJvbGQgPSBub1xuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5mb250LnNtYWxsQ2FwcyA9IG5vXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuXG4gICAgIyMjKlxuICAgICogRHJhd3MgYSBwbGFpbiB0ZXh0LiBGb3JtYXR0aW5nIGFuZCB3b3JkLXdyYXBwaW5nIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAgICpcbiAgICAqIEBtZXRob2QgZHJhd1RleHRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gVGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBUaGUgeS1jb29yZGluYXRlIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBEZXByZWNhdGVkLiBDYW4gYmUgbnVsbC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBEZXByZWNhdGVkLiBDYW4gYmUgbnVsbC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgdG8gZHJhdy5cbiAgICAjIyNcbiAgICBkcmF3VGV4dDogKHBsLCBwdCwgcHIsIHBiLCB0ZXh0KSAtPlxuICAgICAgICBsaW5lcyA9IHRleHQudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKVxuICAgICAgICBmb250ID0gQG9iamVjdC5mb250XG4gICAgICAgIGhlaWdodCA9IGZvbnQubGluZUhlaWdodFxuXG4gICAgICAgIGZvciBsaW5lLCBpIGluIGxpbmVzXG4gICAgICAgICAgICBzaXplID0gZm9udC5tZWFzdXJlVGV4dChsaW5lKVxuICAgICAgICAgICAgQG9iamVjdC5iaXRtYXAuZHJhd1RleHQocGwsIGkgKiBoZWlnaHQgKyBwdCwgc2l6ZS53aWR0aCArIHByK3BsLCBoZWlnaHQrcHQrcGIsIGxpbmUsIDAsIDApXG5cbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICMjIypcbiAgICAqIERyYXdzIGFuIGFycmF5IG9mIGZvcm1hdHRlZCB0ZXh0IGxpbmVzLlxuICAgICogSWYgdGhlIHdvcmRXcmFwIHBhcmFtIGlzIHNldCwgbGluZS1icmVha3MgYXJlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBpZiBhIGxpbmVcbiAgICAqIGRvZXNuJ3QgZml0IGludG8gdGhlIHdpZHRoIG9mIHRoZSBnYW1lIG9iamVjdCdzIGJpdG1hcC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRyYXdGb3JtYXR0ZWRMaW5lc1xuICAgICogQHBhcmFtIHtudW1iZXJ9IHBsIC0gVGhlIGxlZnQtcGFkZGluZyBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHB0IC0gVGhlIHRvcC1wYWRkaW5nIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcHIgLSBUaGUgcmlnaHQtcGFkZGluZyBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHBiIC0gVGhlIGJvdHRvbS1wYWRkaW5nIG9mIHRoZSB0ZXh0J3MgcG9zaXRpb24uXG4gICAgKiBAcGFyYW0ge2dzLlJlbmRlcmVyVGV4dExpbmVbXX0gbGluZXMgLSBBbiBhcnJheSBvZiBsaW5lcyB0byBkcmF3LlxuICAgICogQHBhcmFtIHtib29sZWFufSB3b3JkV3JhcCAtIElmIHdvcmRXcmFwIGlzIHNldCB0byB0cnVlLCBsaW5lLWJyZWFrcyBhcmUgYXV0b21hdGljYWxseSBjcmVhdGVkLlxuICAgICMjI1xuICAgIGRyYXdGb3JtYXR0ZWRMaW5lczogKHBsLCBwdCwgcHIsIHBiLCBsaW5lcywgd29yZFdyYXApIC0+XG4gICAgICAgIEBjdXJyZW50WCA9IHBsXG4gICAgICAgIEBjdXJyZW50WSA9IHB0XG4gICAgICAgIEBjdXJyZW50TGluZUhlaWdodCA9IDBcblxuICAgICAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICAgICAgZm9yIHRva2VuIGluIGxpbmUuY29udGVudFxuICAgICAgICAgICAgICAgIGlmIHRva2VuLmNvZGU/XG4gICAgICAgICAgICAgICAgICAgIEBwcm9jZXNzQ29udHJvbFRva2VuKHRva2VuKVxuICAgICAgICAgICAgICAgICAgICBzaXplID0gQG1lYXN1cmVDb250cm9sVG9rZW4odG9rZW4pXG4gICAgICAgICAgICAgICAgICAgIGlmIHNpemVcbiAgICAgICAgICAgICAgICAgICAgICAgIEBkcmF3Q29udHJvbFRva2VuKHRva2VuLCBAb2JqZWN0LmJpdG1hcCwgQGN1cnJlbnRYKVxuICAgICAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRYICs9IHNpemUud2lkdGhcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHRva2VuLnZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgZm9udCA9IEBvYmplY3QuZm9udFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBsaW5lLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICBpZiB0b2tlbi52YWx1ZSAhPSBcIlxcblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplID0gZm9udC5tZWFzdXJlVGV4dFBsYWluKHRva2VuLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgQG9iamVjdC5iaXRtYXAuZHJhd1RleHQoQGN1cnJlbnRYLCBAY3VycmVudFkgKyBoZWlnaHQgLSBzaXplLmhlaWdodCArIGZvbnQuZGVzY2VudCAtIGxpbmUuZGVzY2VudCwgc2l6ZS53aWR0aCtwbCtwciwgaGVpZ2h0K3B0K3BiLCB0b2tlbi52YWx1ZSwgMCwgMClcbiAgICAgICAgICAgICAgICAgICAgICAgIEBjdXJyZW50WCArPSBzaXplLndpZHRoXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50TGluZUhlaWdodCA9IE1hdGgubWF4KEBjdXJyZW50TGluZUhlaWdodCwgaGVpZ2h0KVxuICAgICAgICAgICAgQGN1cnJlbnRZICs9IChAY3VycmVudExpbmVIZWlnaHQgfHwgQG9iamVjdC5mb250LmxpbmVIZWlnaHQpICsgQGxpbmVTcGFjaW5nXG4gICAgICAgICAgICBAY3VycmVudFggPSBwbFxuICAgICAgICAgICAgQGN1cnJlbnRMaW5lSGVpZ2h0ID0gMFxuXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBEcmF3cyBhIGZvcm1hdHRlZCB0ZXh0LlxuICAgICogSWYgdGhlIHdvcmRXcmFwIHBhcmFtIGlzIHNldCwgbGluZS1icmVha3MgYXJlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBpZiBhIGxpbmVcbiAgICAqIGRvZXNuJ3QgZml0IGludG8gdGhlIHdpZHRoIG9mIHRoZSBnYW1lIG9iamVjdCdzIGJpdG1hcC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRyYXdGb3JtYXR0ZWRUZXh0XG4gICAgKiBAcGFyYW0ge251bWJlcn0geCAtIFRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIHRleHQncyBwb3NpdGlvbi5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gVGhlIHktY29vcmRpbmF0ZSBvZiB0aGUgdGV4dCdzIHBvc2l0aW9uLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gRGVwcmVjYXRlZC4gQ2FuIGJlIG51bGwuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gRGVwcmVjYXRlZC4gQ2FuIGJlIG51bGwuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSB0ZXh0IHRvIGRyYXcuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHdvcmRXcmFwIC0gSWYgd29yZFdyYXAgaXMgc2V0IHRvIHRydWUsIGxpbmUtYnJlYWtzIGFyZSBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQuXG4gICAgKiBAcmV0dXJuIHtncy5SZW5kZXJlclRleHRMaW5lW119IFRoZSBkcmF3biB0ZXh0IGxpbmVzLlxuICAgICMjI1xuICAgIGRyYXdGb3JtYXR0ZWRUZXh0OiAocGwsIHB0LCBwciwgcGIsIHRleHQsIHdvcmRXcmFwKSAtPlxuICAgICAgICBsaW5lcyA9IEBjYWxjdWxhdGVMaW5lcyh0ZXh0LnRvU3RyaW5nKCksIHdvcmRXcmFwKVxuXG4gICAgICAgIEBkcmF3Rm9ybWF0dGVkTGluZXMocGwsIHB0LCBwciwgcGIsIGxpbmVzLCB3b3JkV3JhcClcblxuICAgICAgICByZXR1cm4gbGluZXNcblxuZ3MuQ29tcG9uZW50X1RleHRSZW5kZXJlciA9IENvbXBvbmVudF9UZXh0UmVuZGVyZXIiXX0=
//# sourceURL=Component_TextRenderer_122.js