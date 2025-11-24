var Formula, Space, Style, UIManager;

Formula = (function() {

  /**
  * Encapsulates a UI formula. A formula can be used in UI layouts to define
  * property-bindings or to implement a specific behavior.
  *
  * @module ui
  * @class Formula
  * @memberof ui
  * @constructor
  * @param {Function} f - The formula-function. Defines the logic of the formula.
  * @param {Object} data - An optional data-object which can be accessed inside the formula-function.
  * @param {string} event - An optional event-name to define when the formula should be executed.
   */
  function Formula(f, data, event) {

    /**
    * Indicates if its the first time the formula is called.
    * @property onInitialize
    * @type boolean
     */
    var i, j, l, ref, ref1;
    this.onInitialize = true;

    /**
    * The formula-function.
    * @property exec_
    * @type Function
     */
    this.exec_ = f;

    /**
    * An optional data-object which can bes accessed inside the formula-function.
    * @property data
    * @type Object
     */
    this.data = data;

    /**
    * An optional event-name to define when the formula should be executed.
    * @property event
    * @type string
     */
    this.event = event;

    /**
    * An array of custom number-data which can be used for different purposes. The first element
    * is also used in onChange method to store the old value and check against the new one to detect a change.
    * @property numbers
    * @type number[]
     */
    this.numbers = new Array(10);
    for (i = j = 0, ref = this.numbers.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      this.numbers[i] = 0;
    }

    /**
    * An array of custom string-data which can be used for different purposes. The first element
    * is also used in onTextChange method to store the old value and check against the new one to detect a change.
    * @property strings
    * @type string[]
     */
    this.strings = new Array(10);
    for (i = l = 0, ref1 = this.strings.length; 0 <= ref1 ? l <= ref1 : l >= ref1; i = 0 <= ref1 ? ++l : --l) {
      this.strings[i] = "";
    }
  }


  /**
  * The formula-function. Its a wrapper-function before the first-time call was made.
  * @method exec
   */

  Formula.prototype.exec = function() {
    var r;
    this.exec = this.exec_;
    r = this.exec_.apply(this, arguments);
    this.onInitialize = false;
    return r;
  };


  /**
  * Checks if the specified number-value has changed since the last check. It uses
  * the first entry of the numbers-array to store the value and check against the new one.
  *
  * @method onChange
  * @param {number} numberValue - Number value to check.
   */

  Formula.prototype.onChange = function(numberValue) {
    var result;
    result = this.numbers[0] !== numberValue;
    this.numbers[0] = numberValue;
    return result;
  };


  /**
  * Checks if the specified text-value has changed since the last check. It uses
  * the first entry of the strings-array to store the value and check against the new one.
  *
  * @method onTextChange
  * @param {string} textValue - Text value to check.
   */

  Formula.prototype.onTextChange = function(textValue) {
    var result;
    result = this.strings[0] !== textValue;
    this.strings[0] = textValue;
    return result;
  };

  return Formula;

})();

ui.Formula = Formula;

Space = (function() {

  /**
  * Describes a space inside or around something like a margin or padding.
  *
  * @module ui
  * @class Space
  * @memberof ui
  * @constructor
  * @param {number} left - Space at the left in pixels.
  * @param {number} top - Space at the top in pixels.
  * @param {number} right - Space at the right in pixels.
  * @param {number} bottom - Space at the bottom in pixels.
   */
  function Space(left, top, right, bottom) {

    /**
    * Space at the left in pixels.
    * @property left
    * @type number
     */
    this.left = left;

    /**
    * Space at the top in pixels.
    * @property top
    * @type number
     */
    this.top = top;

    /**
    * Space at the right in pixels.
    * @property right
    * @type number
     */
    this.right = right;

    /**
    * Space at the bottom in pixels.
    * @property bottom
    * @type number
     */
    this.bottom = bottom;
  }


  /**
  * Sets the coordinates of the space by copying them from a specified space.
  *
  * @method setFromObject
  * @param {Object} space - A space to copy.
   */

  Space.prototype.setFromObject = function(space) {
    this.left = space.left;
    this.top = space.top;
    this.right = space.right;
    return this.bottom = space.bottom;
  };


  /**
  * Sets the coordinates of the space.
  *
  * @method set
  * @param {number} left - Space at the left in pixels.
  * @param {number} top - Space at the top in pixels.
  * @param {number} right - Space at the right in pixels.
  * @param {number} bottom - Space at the bottom in pixels.
   */

  Space.prototype.set = function(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    return this.bottom = bottom;
  };


  /**
  * Creates a new space object from an array of coordinates.
  *
  * @method fromArray
  * @static
  * @param {number[]} array - An array of coordinates (left, top right, bottom).
   */

  Space.fromArray = function(array) {
    return new ui.Space(array[0], array[1], array[2], array[3]);
  };

  return Space;

})();

ui.Space = Space;

Style = (function() {

  /**
  * A UI style can applied to a UI object to modify it properties like color, image, etc. to give a certain "style" to it.
  *
  * @module ui
  * @class Style
  * @memberof ui
  * @constructor
  * @param {Object} descriptor - A style-descriptor to initialize the style from.
  * @param {number} id - A unique numeric ID to access the style through UIManager.stylesById collection.
  * @param {number} selector - A selector ID which controls under which conditions the styles will be applied.
   */
  function Style(descriptor, id, selector) {

    /**
    * ID number to quickly access this style and link to this style.
    * @property id
    * @type number
     */
    this.id = id;

    /**
    * Style-ID of target object. This style will only be applied on UI objects with that style ID which are
    * children of UI objects where this style is applied.
    * @property target
    * @type number
     */
    this.target = -1;

    /**
    * Selector-ID which controls under which conditions the style becomes active.
    * @property selector
    * @type number
     */
    this.selector = selector;

    /**
    * The font used for the text-display.
    * @default null
    * @property font
    * @type gs.Font
     */
    this.font = null;

    /**
    * The UI object's image used for visual presentation.
    * @property image
    * @type string
     */
    this.image = null;

    /**
    * The UI object's animations used for visual presentation.
    * @default null
    * @property animations
    * @type Object[]
     */
    this.animations = null;

    /**
    * The UI object's color.
    * @property color
    * @type gs.Color
     */
    this.color = null;

    /**
    * The UI object's tone.
    * @property tone
    * @type gs.Tone
     */
    this.tone = null;

    /**
    * The UI object's anchor-point. For example: An anchor-point with 0,0 places the object with its top-left corner
    * at its position but with an 0.5, 0.5 anchor-point the object is placed with its center. An anchor-point of 1,1
    * places the object with its lower-right corner.
    * @property anchor
    * @type gs.Point
     */
    this.anchor = null;

    /**
    * The UI object's zoom-setting for x and y axis.
    * @default new gs.Point(1.0, 1.0)
    * @property zoom
    * @type gs.Point
     */
    this.zoom = null;

    /**
    * The UI object's margin. The margin defines an extra space around the UI object. 
    * The default is { left: 0, top: 0, right: 0, bottom: 0 }.
    * @property margin
    * @type Object
     */
    this.margin = null;

    /**
    * The UI object's padding. The default is { left: 0, top: 0, right: 0, bottom: 0 }.
    * @property padding
    * @type Object
     */
    this.padding = null;

    /**
    * The UI object's mask for masking-effects.
    * @property mask
    * @type gs.Mask
     */
    this.mask = null;

    /**
    * The UI object's alignment.
    * @property alignment
    * @type ui.Alignment
     */
    this.alignment = -1;

    /**
    * The UI object's opacity to control transparency. For example: 0 = Transparent, 255 = Opaque, 128 = Semi-Transparent.
    * @property opacity
    * @type number
     */
    this.opacity = -1;

    /**
    * The object's clip-rect for visual presentation.
    * @default null
    * @property clipRect
    * @type gs.Rect
    * @protected
     */
    this.clipRect = null;

    /**
    * The corner-size of the frame.
    * @property frameCornerSize
    * @type number
     */
    this.frameCornerSize = -1;

    /**
    * The thickness of the frame.
    * @property frameThickness
    * @type number
     */
    this.frameThickness = -1;

    /**
    * The looping of the image.
    * @property looping
    * @type ui.Orientation
     */
    this.looping = null;

    /**
    * The object's z-index controls rendering-order/image-overlapping. An object with a smaller z-index is rendered
    * before an object with a larger index. For example: To make sure a game object is always on top of the screen, it
    * should have the largest z-index of all game objects.
    * @property zIndex
    * @type number
     */
    this.zIndex = -1;

    /**
    * The object's alignment on x-axis. Needs to be supported by layout.
    * @property alignmentX
    * @type number
     */
    this.alignmentX = -1;

    /**
    * The object's alignment on y-axis. Needs to be supported by layout.
    * @property alignmentY
    * @type number
     */
    this.alignmentY = -1;

    /**
    * The object's resize behavior.
    * @property resizable
    * @type boolean
     */
    this.resizable = null;

    /**
    * The original style descriptor.
    * @property descriptor
    * @type Object
     */
    this.descriptor = descriptor;
    if (descriptor) {
      this.setFromDescriptor(descriptor);
    }
  }


  /**
  * Initializes the style from a style-descriptor.
  *
  * @method setFromDescriptor
  * @param {Object} descriptor - The style-descriptor.
   */

  Style.prototype.setFromDescriptor = function(descriptor) {
    this.descriptor = descriptor;
    this.image = descriptor.image;
    if (descriptor.color) {
      this.color = gs.Color.fromArray(descriptor.color);
    }
    if (descriptor.tone) {
      this.tone = gs.Tone.fromArray(descriptor.tone);
    }
    if (descriptor.anchor) {
      this.anchor = new gs.Point(descriptor.anchor[0], descriptor.anchor[1]);
    }
    if (descriptor.zoom) {
      this.zoom = new gs.Point(descriptor.zoom[0], descriptor.zoom[1]);
    }
    if (descriptor.font) {
      this.setupFont(descriptor);
    }
    if (descriptor.clipRect) {
      this.clipRect = gs.Rect.fromArray(descriptor.clipRect);
    }
    if (descriptor.opacity >= 0) {
      this.opacity = descriptor.opacity;
    }
    if (descriptor.alignment >= 0) {
      this.alignment = descriptor.alignment;
    }
    if (descriptor.margin) {
      this.margin = ui.Space.fromArray(descriptor.margin);
    }
    if (descriptor.padding) {
      this.padding = ui.Space.fromArray(descriptor.padding);
    }
    this.animations = descriptor.animations;
    if (descriptor.frameCornerSize) {
      this.frameCornerSize = descriptor.frameCornerSize;
    }
    if (descriptor.frameThickness) {
      this.frameThickness = descriptor.frameThickness;
    }
    if (descriptor.frame) {
      this.frame = descriptor.frame;
    }
    if (descriptor.looping) {
      this.looping = descriptor.looping;
    }
    if (descriptor.resizable != null) {
      this.resizable = descriptor.resizable;
    }
    if (descriptor.zIndex) {
      this.zIndex = descriptor.zIndex;
    }
    if (descriptor.alignmentX) {
      this.alignmentX = ui.UIManager.alignments[descriptor.alignmentX];
    }
    if (descriptor.alignmentY) {
      return this.alignmentY = ui.UIManager.alignments[descriptor.alignmentY];
    }
  };

  Style.prototype.set = function(style) {
    this.image = style.image;
    this.color.setFromObject(style.color);
    this.tone.setFromObject(style.tone);
    this.anchor.set(style.anchor.x, style.anchor.y);
    this.zoom.set(style.zoom.x, style.zoom.y);
    if (style.font) {
      if (!this.font) {
        this.font = new gs.Font(style.font.name, style.font.size);
      }
      this.font.set(style.font);
    }
    if (style.clipRect) {
      if (!this.clipRect) {
        this.clipRect = new gs.Rect();
      }
      this.clipRect.setFromObject(style.clipRect);
    }
    this.opacity = style.opacitz;
    this.alignment = style.alignment;
    this.margin.setFromObject(style.margin);
    return this.padding.setFromObject(style.padding);
  };


  /**
  * Initializes font-data from a style-descriptor.
  *
  * @method setupFont
  * @param {Object} descriptor - The style-descriptor.
  * @protected
   */

  Style.prototype.setupFont = function(descriptor) {
    var ref, ref1, ref10, ref11, ref12, ref13, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
    if (descriptor.font) {
      if (!this.font) {
        this.font = new Font(descriptor.font.name, (ref = descriptor.font.size) != null ? ref : 0);
      } else {
        this.font.name = descriptor.font.name;
        this.font.size = (ref1 = descriptor.font.size) != null ? ref1 : 0;
      }
      this.font.bold = (ref2 = descriptor.font.bold) != null ? ref2 : this.font.bold;
      this.font.italic = (ref3 = descriptor.font.italic) != null ? ref3 : this.font.italic;
      this.font.smallCaps = (ref4 = descriptor.font.smallCaps) != null ? ref4 : this.font.smallCaps;
      this.font.underline = (ref5 = descriptor.font.underline) != null ? ref5 : this.font.underline;
      this.font.strikeThrough = (ref6 = descriptor.font.strikeThrough) != null ? ref6 : this.font.strikeThrough;
      if (descriptor.font.color != null) {
        this.font.color.setFromArray(descriptor.font.color);
      }
      if (descriptor.font.border != null) {
        this.font.border = (ref7 = descriptor.font.border) != null ? ref7 : false;
        this.font.borderSize = (ref8 = descriptor.font.borderSize) != null ? ref8 : 4;
        this.font.borderColor.set(0, 0, 0, 255);
      }
      if (descriptor.font.shadow != null) {
        this.font.shadow = (ref9 = descriptor.font.shadow) != null ? ref9 : false;
        this.font.shadowOffsetX = (ref10 = descriptor.font.shadowOffsetX) != null ? ref10 : 2;
        this.font.shadowOffsetY = (ref11 = descriptor.font.shadowOffsetY) != null ? ref11 : 2;
        this.font.shadowColor.setFromArray(descriptor.font.shadowColor);
      }
      if (descriptor.font.outline != null) {
        this.font.border = (ref12 = descriptor.font.outline) != null ? ref12 : false;
        this.font.borderSize = (ref13 = descriptor.font.outline.size) != null ? ref13 : 4;
        if (descriptor.font.outline.color != null) {
          return this.font.borderColor.setFromArray(descriptor.font.outline.color);
        } else {
          return this.font.borderColor.set(0, 0, 0, 255);
        }
      }
    }
  };


  /**
  * Applies the style to a UI object.
  *
  * @method apply
  * @param {ui.Object_UIElement} object - The UI object where the style should be applied to.
   */

  Style.prototype.apply = function(object) {
    var ref, ref1;
    if (!object.activeStyles.contains(this)) {
      object.activeStyles.push(this);
      if (this.font) {
        if ((ref = object.font) != null) {
          ref.set(this.font);
        }
      }
      if (this.color) {
        object.color.set(this.color);
      }
      if (this.tone) {
        if ((ref1 = object.tone) != null) {
          ref1.set(this.tone);
        }
      }
      if (this.image) {
        object.image = this.image;
      }
      if (this.anchor) {
        object.anchor.set(this.anchor.x, this.anchor.y);
      }
      if (this.zoom) {
        object.zoom.set(this.zoom.x, this.zoom.y);
      }
      if (this.padding) {
        object.padding.setFromObject(this.padding);
      }
      if (this.margin) {
        object.margin.setFromObject(this.margin);
      }
      if (this.opacity >= 0) {
        object.opacity = this.opacity;
      }
      if (this.alignment >= 0) {
        object.alignment = this.alignment;
      }
      if (this.frameThickness >= 0) {
        object.frameThickness = this.frameThickness;
      }
      if (this.frameCornerSize >= 0) {
        object.frameCornerSize = this.frameCornerSize;
      }
      if (this.mask) {
        object.mask.set(this.mask);
      }
      if (this.zIndex >= 0) {
        object.zIndex = this.zIndex;
      }
      if (this.alignmentX >= 0) {
        object.alignmentX = this.alignmentX;
      }
      if (this.alignmentY >= 0) {
        object.alignmentY = this.alignmentY;
      }
      if (this.resizable != null) {
        object.resizable = this.resizable;
      }
      this.applyLooping(object);
      return this.applyAnimations(object);
    }
  };


  /**
  * Applies the looping-data of the style to a UI object.
  *
  * @method applyLooping
  * @param {ui.Object_UIElement} object - The UI object where the looping-data should be applied to.
  * @protected
   */

  Style.prototype.applyLooping = function(object) {
    if (this.looping) {
      if (!object.visual.looping) {
        object.visual.dispose();
        object.removeComponent(object.visual);
        object.visual = new gs.Component_TilingSprite();
        object.addComponent(object.visual);
      }
      object.visual.looping.vertical = this.looping.vertical;
      return object.visual.looping.horizontal = this.looping.horizontal;
    }
  };


  /**
  * Applies the animation-data of the style to a UI object. This automatically adds an animation-handler
  * component(ui.Component_AnimationHandler) with the id "animationHandler" to the UI object if not already exists.
  *
  * @method applyAnimations
  * @param {ui.Object_UIElement} object - The UI object where the animation-data should be applied to.
  * @protected
   */

  Style.prototype.applyAnimations = function(object) {
    if (this.animations) {
      object.animations = Object.deepCopy(this.animations);
      if (!object.findComponentById("animationHandler")) {
        object.animationExecutor = new ui.Component_AnimationExecutor();
        object.addComponent(new ui.Component_AnimationHandler(), "animationHandler");
        return object.addComponent(object.animationExecutor, "animationExecutor");
      }
    }
  };


  /**
  * Reverts the changes from a UI object made by this style. However, this resets all styleable properties
  * were set by this style. So it is necessary to apply all other styles again, but that is already handles in
  * ui.Component_UIBehavior.
  *
  * @method revert
  * @param {ui.Object_UIElement} object - The UI object where the style should be reverted.
   */

  Style.prototype.revert = function(object) {
    var activeStyles, i1, j, j1, k1, l, l1, m1, n, o, p, q, ref, ref1, s, t, u, w, x, y, z;
    activeStyles = object.activeStyles;
    if (object.activeStyles.contains(this)) {
      object.activeStyles.remove(this);
      if (this.font) {
        object.font.set(gs.Fonts.TEXT);
        for (j = activeStyles.length - 1; j >= 0; j += -1) {
          s = activeStyles[j];
          if (s.font) {
            object.font.set(s.font);
            break;
          }
        }
      }
      if (this.color) {
        object.color.set(Color.WHITE);
        for (l = activeStyles.length - 1; l >= 0; l += -1) {
          s = activeStyles[l];
          if (s.color) {
            object.color.set(s.color);
            break;
          }
        }
      }
      if (this.tone) {
        if ((ref = object.tone) != null) {
          ref.set(0, 0, 0, 0);
        }
        for (n = activeStyles.length - 1; n >= 0; n += -1) {
          s = activeStyles[n];
          if (s.tone) {
            if ((ref1 = object.tone) != null) {
              ref1.set(s.tone);
            }
            break;
          }
        }
      }
      if (this.image) {
        object.image = null;
        for (o = activeStyles.length - 1; o >= 0; o += -1) {
          s = activeStyles[o];
          if (s.image) {
            object.image = s.image;
            break;
          }
        }
      }
      if (this.anchor) {
        object.anchor.set(0, 0);
        for (p = activeStyles.length - 1; p >= 0; p += -1) {
          s = activeStyles[p];
          if (s.anchor) {
            object.anchor.setFromObject(s.anchor);
            break;
          }
        }
      }
      if (this.zoom) {
        object.zoom.set(1.0, 1.0);
        for (q = activeStyles.length - 1; q >= 0; q += -1) {
          s = activeStyles[q];
          if (s.zoom) {
            object.zoom.setFromObject(s.zoom);
            break;
          }
        }
      }
      if (this.padding) {
        object.padding.set(0, 0, 0, 0);
        for (t = activeStyles.length - 1; t >= 0; t += -1) {
          s = activeStyles[t];
          if (s.padding) {
            object.padding.setFromObject(s.padding);
            break;
          }
        }
      }
      if (this.margin) {
        object.margin.set(0, 0, 0, 0);
        for (u = activeStyles.length - 1; u >= 0; u += -1) {
          s = activeStyles[u];
          if (s.margin) {
            object.margin.setFromObject(s.margin);
            break;
          }
        }
      }
      if (this.opacity >= 0) {
        object.opacity = 255;
        for (w = activeStyles.length - 1; w >= 0; w += -1) {
          s = activeStyles[w];
          if (s.opacity >= 0) {
            object.opacity = s.opacity;
            break;
          }
        }
      }
      if (this.alignment >= 0) {
        object.alignment = 0;
        for (x = activeStyles.length - 1; x >= 0; x += -1) {
          s = activeStyles[x];
          if (s.alignment >= 0) {
            object.alignment = s.alignment;
            break;
          }
        }
      }
      if (this.frameCornerSize >= 0) {
        object.frameCornerSize = 16;
        for (y = activeStyles.length - 1; y >= 0; y += -1) {
          s = activeStyles[y];
          if (s.frameCornerSize >= 0) {
            object.frameCornerSize = s.frameCornerSize;
            break;
          }
        }
      }
      if (this.frameThickness >= 0) {
        object.frameThickness = 16;
        for (z = activeStyles.length - 1; z >= 0; z += -1) {
          s = activeStyles[z];
          if (s.frameThickness >= 0) {
            object.frameThickness = s.frameThickness;
            break;
          }
        }
      }
      if (this.mask) {
        object.mask.set(null);
        for (i1 = activeStyles.length - 1; i1 >= 0; i1 += -1) {
          s = activeStyles[i1];
          if (s.mask) {
            object.mask.set(s.font);
            break;
          }
        }
      }
      if (this.zIndex >= 0) {
        object.zIndex = 0;
        for (j1 = activeStyles.length - 1; j1 >= 0; j1 += -1) {
          s = activeStyles[j1];
          if (s.zIndex >= 0) {
            object.zIndex = s.zIndex;
            break;
          }
        }
      }
      if (this.alignmentX >= 0) {
        object.alignmentX = 0;
        for (k1 = activeStyles.length - 1; k1 >= 0; k1 += -1) {
          s = activeStyles[k1];
          if (s.alignmentX >= 0) {
            object.alignmentX = s.alignmentX;
            break;
          }
        }
      }
      if (this.alignmentY >= 0) {
        object.alignmentY = 0;
        for (l1 = activeStyles.length - 1; l1 >= 0; l1 += -1) {
          s = activeStyles[l1];
          if (s.alignmentY >= 0) {
            object.alignmentY = s.alignmentY;
            break;
          }
        }
      }
      if (this.resizable != null) {
        object.resizable = false;
        for (m1 = activeStyles.length - 1; m1 >= 0; m1 += -1) {
          s = activeStyles[m1];
          if (s.resizable != null) {
            object.resizable = s.resizable;
            break;
          }
        }
      }
      this.revertAnimations(object);
      return this.revertLooping(object);
    }
  };


  /**
  * Reverts the animation-data changes applied to a UI object by this style.
  *
  * @method revertAnimations
  * @param {ui.Object_UIElement} object - The UI object where the animation-data changes should be reverted.
   */

  Style.prototype.revertAnimations = function(object) {
    var activeStyles, j, results, s;
    activeStyles = object.activeStyles;
    if (this.animations) {
      object.animations = null;
      results = [];
      for (j = activeStyles.length - 1; j >= 0; j += -1) {
        s = activeStyles[j];
        if (s.animations) {
          object.animations = Object.deepCopy(s.animations);
          if (!object.findComponentById("animationHandler")) {
            results.push(object.addComponent(new ui.Component_AnimationHandler(), "animationHandler"));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };


  /**
  * Reverts the looping-data changes applied to a UI object by this style.
  *
  * @method revertLooping
  * @param {ui.Object_UIElement} object - The UI object where the looping-data changes should be reverted.
   */

  Style.prototype.revertLooping = function(object) {
    var activeStyles, j, results, s;
    activeStyles = object.activeStyles;
    if (this.looping) {
      object.visual.looping.vertical = false;
      object.visual.looping.horizontal = false;
      results = [];
      for (j = activeStyles.length - 1; j >= 0; j += -1) {
        s = activeStyles[j];
        if (s.looping) {
          if (!object.visual.looping) {
            object.visual.dispose();
            object.removeComponent(object.visual);
            object.visual = new gs.Component_TilingSprite();
            object.addComponent(object.visual);
          }
          object.visual.looping.vertical = s.looping.vertical;
          results.push(object.visual.looping.horizontal = s.looping.horizontal);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

  return Style;

})();

ui.Style = Style;

UIManager = (function() {

  /**
  * Handles the creation of In Game UI elements. For more information about
  * In-Game UI see help file.
  *
  * @module ui
  * @class UIManager
  * @memberof ui
  * @constructor
   */
  function UIManager() {

    /**
    * Stores all registered UI layouts by name/id.
    * @property layouts
    * @type Object
     */
    this.layouts = {};

    /**
    * Stores all registered UI styles by name/id.
    * @property styles
    * @type Object
     */
    this.styles = {};

    /**
    * Stores all UI styles by number id.
    * @property stylesById
    * @type ui.Style[]
     */
    this.stylesById = new Array();

    /**
    * Stores all UI styles by style-name.
    * @property stylesByName
    * @type Object
     */
    this.stylesByName = {};

    /**
    * Stores all registered custom UI types/templates by name/id.
    * @property customTypes
    * @type Object
     */
    this.customTypes = {};

    /**
    * Stores all registered UI controllers by name/id.
    * @property customTypes
    * @type Object
     */
    this.controllers = {};

    /**
    * Stores all registered UI data sources by name/id.
    * @property customTypes
    * @type Object
     */
    this.dataSources = {};

    /**
    * Mapping to table to map alignment names to number values.
    * @property alignments
    * @type Object
    * @protected
     */
    this.alignments = {
      "left": 0,
      "top": 0,
      "center": 1,
      "bottom": 2,
      "right": 2,
      "0": 0,
      "1": 1,
      "2": 2
    };

    /**
    * Mapping to table to map blend-mode names to number values.
    * @property blendModes
    * @type Object
    * @protected
     */
    this.blendModes = {
      "normal": 0,
      "add": 1,
      "sub": 2
    };

    /**
    * Mapping to table to map selector names to number values.
    * @property selectors
    * @type Object
     */
    this.selectors = {
      normal: 0,
      hover: 1,
      selected: 2,
      enabled: 3,
      focused: 4
    };
    this.defaultPlaceholderParams = {};
  }


  /**
  * Sets up UI Manager, optimizes styles, etc.
  *
  * @method setup
   */

  UIManager.prototype.setup = function() {
    return this.setupStyles();
  };


  /**
  * Sets up the UI styles by wrapping them into ui.Style objects and optimizing the access.
  *
  * @method setupStyles
  * @protected
   */

  UIManager.prototype.setupStyles = function() {
    var id, k, ref, selector, selectorMap, subs;
    id = 0;
    selectorMap = this.selectors;
    for (k in this.styles) {
      subs = k.split(" ");
      selector = subs[0].split(":");
      if (selectorMap[selector[1]]) {
        this.stylesById[id] = new ui.Style(this.styles[k], id, selectorMap[selector[1]]);
      } else {
        this.stylesById[id] = new ui.Style(this.styles[k], id, 0);
      }
      if (!this.stylesByName[selector[0]]) {
        this.stylesByName[selector[0]] = [];
      }
      this.stylesByName[selector[0]].push(this.stylesById[id]);
      this.styles[k] = this.stylesById[id];
      id++;
    }
    for (k in this.styles) {
      subs = k.split(" ");
      if (subs.length > 1) {
        this.stylesByName[subs[1]].push(this.styles[k]);
        this.styles[k].target = (ref = this.styles[k.split(":")[0]]) != null ? ref.id : void 0;
      }
    }
    return null;
  };


  /**
  * Executes all placeholder formulas in the specified descriptor. The descriptor will be changed
  * and placeholder formulas are replaced with their evaluated result value.
  *
  * @method executePlaceholderFormulas
  * @param {Object} descriptor - The descriptor.
  * @param {Object} params - Object containing the placeholder params.
  * @protected
   */

  UIManager.prototype.executePlaceholderFormulas = function(descriptor, id, params) {
    var c, i, j, k, keys, l, len, len1, v;
    if (descriptor == null) {
      return;
    }
    keys = Object.keys(descriptor);
    for (j = 0, len = keys.length; j < len; j++) {
      k = keys[j];
      v = descriptor[k];
      if (v != null) {
        if (v instanceof Array) {
          for (c = l = 0, len1 = v.length; l < len1; c = ++l) {
            i = v[c];
            if (i != null) {
              if (typeof i === "object") {
                this.executePlaceholderFormulas(i, id, params);
              } else if (c !== "exec" && typeof i === "function") {
                window.p = params || this.defaultPlaceholderParams;
                window.d = descriptor;
                v[c] = i();
              }
            }
          }
        } else if (typeof v === "object") {
          this.executePlaceholderFormulas(v, id, params);
        } else if (k !== "exec_" && typeof v === "function") {
          window.p = params || this.defaultPlaceholderParams;
          window.d = descriptor;
          descriptor[k] = v();
        }
      }
    }
    return null;
  };


  /**
  * Creates a calculation for a specified expression.
  *
  * @method createCalcFunction
  * @param {String} expression - The expression to create a calculation function for.
  * @return {Function} The calculation function.
  * @protected
   */

  UIManager.prototype.createCalcFunction = function(expression) {
    expression = expression.replace(/([0-9]+)%/gm, "($1 / 100 * v)");
    return eval("(function(v){ return " + expression + "})");
  };


  /**
  * Creates an object from the specified object type. The type has the format
  * <namespace>.<typename> like vn.Component_Hotspot.
  *
  * @method createObject
  * @param {String} type - The type name.
  * @return {Object} The created object.
  * @protected
   */

  UIManager.prototype.createObject = function(type) {
    var subs;
    subs = type.split(".");
    return new window[subs[0]][subs[1]]();
  };


  /**
  * Creates an UI object from a specified UI descriptor.
  *
  * @method createFromDescriptor
  * @param {Object} descriptor - The UI object descriptor.
  * @param {gs.Object_UIElement} parent - The UI parent object. (A layout for example).
  * @return {gs.Object_UIElement} The created UI object.
   */

  UIManager.prototype.createFromDescriptor = function(descriptor, parent) {
    var control, k;
    control = null;
    for (k in this.controllers) {
      if (this.controllers[k].type != null) {
        this.controllers[k] = this.createObject(this.controllers[k].type);
      }
    }
    return this._createFromDescriptor(descriptor, parent);
  };


  /**
  * Creates an image button UI object.
  *
  * @method createImageButton
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createImageButton = function(descriptor) {
    var control;
    control = new ui.Object_Hotspot(descriptor.image, descriptor.imageHandling);
    control.behavior.sound = descriptor.sound;
    control.behavior.sounds = descriptor.sounds;
    control.image = descriptor.image;
    control.images = descriptor.images;
    if (descriptor.imageFolder != null) {
      control.imageFolder = descriptor.imageFolder;
    }
    if (descriptor.looping != null) {
      control.visual.dispose();
      control.removeComponent(control.visual);
      control.visual = new gs.Component_TilingSprite();
      control.addComponent(control.visual);
      control.visual.looping.vertical = descriptor.looping.vertical;
      control.visual.looping.horizontal = descriptor.looping.horizontal;
    }
    if (descriptor.color != null) {
      control.color = Color.fromArray(descriptor.color);
    }
    return control;
  };


  /**
  * Creates an image UI object.
  *
  * @method createImage
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createImage = function(descriptor) {
    var control;
    control = new ui.Object_Image(descriptor.image, descriptor.imageHandling, descriptor.imageFolder);
    if (descriptor.imageFolder != null) {
      control.imageFolder = descriptor.imageFolder;
    }
    if (descriptor.looping != null) {
      control.visual.dispose();
      control.removeComponent(control.visual);
      control.visual = new gs.Component_TilingSprite();
      control.addComponent(control.visual);
      control.visual.looping.vertical = descriptor.looping.vertical;
      control.visual.looping.horizontal = descriptor.looping.horizontal;
    }
    if (descriptor.color != null) {
      control.color = Color.fromArray(descriptor.color);
    }
    return control;
  };


  /**
  * Creates an image map UI object.
  *
  * @method createImageMap
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createImageMap = function(descriptor) {
    var control;
    control = new ui.Object_ImageMap();
    control.hotspots = (descriptor.hotspots || []).select(function(h) {
      return {
        x: h.rect[0],
        y: h.rect[1],
        size: {
          width: h.rect[2],
          height: h.rect[3]
        },
        data: {
          action: 3,
          actions: h.actions
        }
      };
    });
    control.images = descriptor.images;
    control.insertComponent(new ui.Component_ActionHandler(), 1, "actionHandler");
    control.target = SceneManager.scene.behavior;
    control.visual.variableContext = new gs.InterpreterContext(SceneManager.scene.layoutName, SceneManager.scene);
    return control;
  };


  /**
  * Creates a video UI object.
  *
  * @method createVideo
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createVideo = function(descriptor) {
    var control, ref;
    control = new ui.Object_Video();
    control.video = descriptor.video;
    control.loop = (ref = descriptor.loop) != null ? ref : true;
    return control;
  };


  /**
  * Creates a panel UI object.
  *
  * @method createPanel
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createPanel = function(descriptor) {
    var control, ref;
    control = new ui.Object_Panel();
    control.modal = (ref = descriptor.modal) != null ? ref : false;
    if (descriptor.color != null) {
      control.color = Color.fromArray(descriptor.color);
    }
    return control;
  };


  /**
  * Creates a frame UI object.
  *
  * @method createFrame
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createFrame = function(descriptor) {
    var control;
    control = new ui.Object_Frame(descriptor.frameSkin);
    control.frameThickness = descriptor.frameThickness || 16;
    control.frameCornerSize = descriptor.frameCornerSize || 16;
    control.image = descriptor.image;
    control.images = descriptor.images;
    return control;
  };


  /**
  * Creates a three-part image UI object.
  *
  * @method createThreePartImage
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createThreePartImage = function(descriptor) {
    var control;
    control = new ui.Object_ThreePartImage(descriptor.frameSkin);
    control.firstPartSize = descriptor.firstPartSize || 16;
    control.middlePartSize = descriptor.middlePartSize || 1;
    control.lastPartSize = descriptor.lastPartSize || 16;
    control.image = descriptor.image;
    control.images = descriptor.images;
    return control;
  };


  /**
  * Creates a text UI object.
  *
  * @method createText
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createText = function(descriptor) {
    var control, ref;
    control = new ui.Object_Text();
    control.text = lcs(descriptor.text);
    control.sizeToFit = descriptor.sizeToFit;
    control.formatting = descriptor.formatting;
    control.wordWrap = (ref = descriptor.wordWrap) != null ? ref : false;
    control.behavior.format = descriptor.format;
    if (descriptor.textPadding) {
      control.behavior.padding = ui.Space.fromArray(descriptor.textPadding);
    }
    if (descriptor.resolvePlaceholders != null) {
      control.resolvePlaceholders = descriptor.resolvePlaceholders;
    }
    if (descriptor.color != null) {
      control.color = Color.fromArray(descriptor.color);
    }
    return control;
  };


  /**
  * Creates a free-layout UI object.
  *
  * @method createFreeLayout
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createFreeLayout = function(descriptor) {
    var control;
    if (descriptor.frame != null) {
      control = new ui.Object_FreeLayout(descriptor.frame[0] || 0, descriptor.frame[1] || 0, descriptor.frame[2] || 1, descriptor.frame[3] || 1);
    } else {
      control = new ui.Object_FreeLayout(0, 0, 1, 1);
    }
    control.sizeToFit = descriptor.sizeToFit;
    return control;
  };


  /**
  * Creates a stack-layout UI object.
  *
  * @method createStackLayout
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createStackLayout = function(descriptor) {
    var control;
    if (descriptor.frame != null) {
      control = new ui.Object_StackLayout(descriptor.frame[0] || 0, descriptor.frame[1] || 0, descriptor.frame[2] || 1, descriptor.frame[3] || 1, descriptor.orientation);
    } else {
      control = new ui.Object_StackLayout(0, 0, 1, 1, descriptor.orientation);
    }
    control.sizeToFit = descriptor.sizeToFit;
    return control;
  };


  /**
  * Creates a spread-layout UI object.
  *
  * @method createSpreadLayout
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createSpreadLayout = function(descriptor) {
    var control;
    if (descriptor.frame != null) {
      control = new ui.Object_SpreadLayout(descriptor.frame[0] || 0, descriptor.frame[1] || 0, descriptor.frame[2] || 1, descriptor.frame[3] || 1, descriptor.orientation);
    } else {
      control = new ui.Object_SpreadLayout(0, 0, 1, 1, descriptor.orientation);
    }
    return control;
  };


  /**
  * Creates a grid-layout UI object.
  *
  * @method createGridLayout
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createGridLayout = function(descriptor) {
    var control;
    if (descriptor.frame != null) {
      control = new ui.Object_GridLayout(descriptor.frame[0], descriptor.frame[1], descriptor.frame[2], descriptor.frame[3], descriptor.rows, descriptor.columns, descriptor.template);
    } else {
      control = new ui.Object_GridLayout(0, 0, 1, 1, descriptor.rows, descriptor.columns, descriptor.template);
    }
    control.cellSpacing = descriptor.cellSpacing || [0, 0, 0, 0];
    control.sizeToFit = descriptor.sizeToFit;
    return control;
  };


  /**
  * Creates a message UI object.
  *
  * @method createMessage
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createMessage = function(descriptor) {
    var control;
    control = new ui.Object_Message();
    return control;
  };


  /**
  * Creates a data-grid UI object.
  *
  * @method createDataGrid
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created image button UI object.
   */

  UIManager.prototype.createDataGrid = function(descriptor) {
    var control;
    control = new ui.Object_DataGrid(descriptor);
    return control;
  };


  /**
  * Creates an UI object depending on the object-type of the specified UI descriptor.
  *
  * @method createControl
  * @param {Object} descriptor - The UI object descriptor.
  * @return {gs.Object_UIElement} The created UI object.
  * @protected
   */

  UIManager.prototype.createControl = function(descriptor) {
    var control;
    control = null;
    switch (descriptor.type) {
      case "ui.ImageButton":
        control = this.createImageButton(descriptor);
        break;
      case "ui.Image":
        control = this.createImage(descriptor);
        break;
      case "ui.ImageMap":
        control = this.createImageMap(descriptor);
        break;
      case "ui.Video":
        control = this.createVideo(descriptor);
        break;
      case "ui.Panel":
        control = this.createPanel(descriptor);
        break;
      case "ui.Frame":
        control = this.createFrame(descriptor);
        break;
      case "ui.ThreePartImage":
        control = this.createThreePartImage(descriptor);
        break;
      case "ui.Text":
        control = this.createText(descriptor);
        break;
      case "ui.Message":
        control = this.createMessage(descriptor);
        break;
      case "ui.DataGrid":
        control = this.createDataGrid(descriptor);
        break;
      case "ui.FreeLayout":
        control = this.createFreeLayout(descriptor);
        break;
      case "ui.StackLayout":
        control = this.createStackLayout(descriptor);
        break;
      case "ui.SpreadLayout":
        control = this.createSpreadLayout(descriptor);
        break;
      case "ui.GridLayout":
        control = this.createGridLayout(descriptor);
    }
    return control;
  };

  UIManager.prototype.createLayoutRect = function(frame, control) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
    if (!control.layoutRect) {
      control.layoutRect = new ui.LayoutRect();
    }
    control.layoutRect.set(0, 0, 0, 0);
    if (frame != null) {
      if (((ref = frame[0]) != null ? ref.length : void 0) != null) {
        control.layoutRect.x = this.createCalcFunction(frame[0]);
        control.dstRect.x = 0;
      } else {
        control.dstRect.x = (ref1 = descriptor.frame[0]) != null ? ref1 : control.dstRect.x;
      }
      if (((ref2 = frame[1]) != null ? ref2.length : void 0) != null) {
        control.layoutRect.y = this.createCalcFunction(frame[1]);
        control.dstRect.y = 0;
      } else {
        control.dstRect.y = (ref3 = frame[1]) != null ? ref3 : control.dstRect.y;
      }
      if (((ref4 = frame[2]) != null ? ref4.length : void 0) != null) {
        control.layoutRect.width = this.createCalcFunction(frame[2]);
        control.dstRect.width = 1;
      } else {
        control.dstRect.width = (ref5 = frame[2]) != null ? ref5 : control.dstRect.width;
      }
      if (((ref6 = frame[3]) != null ? ref6.length : void 0) != null) {
        control.layoutRect.height = this.createCalcFunction(frame[3]);
        return control.dstRect.height = 1;
      } else {
        return control.dstRect.height = (ref7 = frame[3]) != null ? ref7 : control.dstRect.height;
      }
    }
  };


  /**
  * Adds the styles defined in an array of style-names to the specified control.
  *
  * @method addControlStyles
  * @param {Object} control - The control to add the styles to.
  * @param {string[]} styles - Array of style-names to add.
   */

  UIManager.prototype.addControlStyles = function(control, styles) {
    var j, len, results, style, styleName;
    results = [];
    for (j = 0, len = styles.length; j < len; j++) {
      styleName = styles[j];
      if (this.stylesByName[styleName] != null) {
        results.push((function() {
          var l, len1, ref, results1;
          ref = this.stylesByName[styleName];
          results1 = [];
          for (l = 0, len1 = ref.length; l < len1; l++) {
            style = ref[l];
            control.styles.push(style);
            if (style.target === -1 && style.selector === 0) {
              results1.push(style.apply(control));
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Creates an UI object from a specified UI descriptor. This method is called
  * recursively for all child-descriptors.
  *
  * @method createControlFromDescriptor
  * @param {Object} descriptor - The UI object descriptor.
  * @param {gs.Object_UIElement} parent - The UI parent object. (A layout for example).
  * @param {number} index - The index.
  * @return {gs.Object_UIElement} The created UI object.
  * @protected
   */

  UIManager.prototype.createControlFromDescriptor = function(descriptor, parent, index) {
    var action, actions, bindings, c, child, childControl, component, control, controls, customFields, data, formulas, i, isNumber, item, j, l, len, len1, len2, len3, m, n, o, p, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref23, ref24, ref25, ref26, ref27, ref3, ref4, ref5, ref6, ref7, ref8, ref9, style, target, type, typeName, valid;
    control = null;
    if (descriptor.style != null) {
      descriptor.styles = [descriptor.style];
      delete descriptor.style;
    }
    descriptor = Object.deepCopy(descriptor);
    this.executePlaceholderFormulas(descriptor, descriptor.id, descriptor.params);
    control = this.createControl(descriptor);
    if (control == null) {
      type = Object.deepCopy(this.customTypes[descriptor.type]);
      this.executePlaceholderFormulas(type, descriptor.id, descriptor.params);
      typeName = type.type;
      customFields = type.customFields;
      bindings = type.bindings;
      formulas = type.formulas;
      actions = type.actions;
      if (type.style != null) {
        type.styles = [type.style];
        type.style = null;
      }
      Object.mixin(type, descriptor);
      if (customFields != null) {
        Object.mixin(type.customFields, customFields);
      }
      if ((bindings != null) && bindings !== type.bindings) {
        type.bindings = type.bindings.concat(bindings);
      }
      if ((formulas != null) && formulas !== type.formulas) {
        type.formulas = type.formulas.concat(formulas);
      }
      if ((actions != null) && actions !== type.actions) {
        type.actions = actions.concat(type.actions);
      }
      type.type = typeName;
      return this.createControlFromDescriptor(type, parent);
    } else if (parent != null) {
      parent.addObject(control);
      control.index = index;
    } else {
      gs.ObjectManager.current.addObject(control);
    }
    control.ui = new ui.Component_UIBehavior();
    control.addComponent(control.ui);
    control.params = descriptor.params;
    if (descriptor.updateBehavior === "continuous") {
      control.updateBehavior = ui.UpdateBehavior.CONTINUOUS;
    }
    if (descriptor.inheritProperties) {
      control.inheritProperties = true;
    }
    if (descriptor.font != null) {
      control.font = new Font(descriptor.font.name, descriptor.font.size);
      control.font.bold = (ref = descriptor.font.bold) != null ? ref : control.font.bold;
      control.font.italic = (ref1 = descriptor.font.italic) != null ? ref1 : control.font.italic;
      control.font.smallCaps = (ref2 = descriptor.font.smallCaps) != null ? ref2 : control.font.smallCaps;
      control.font.underline = (ref3 = descriptor.font.underline) != null ? ref3 : control.font.underline;
      control.font.strikeThrough = (ref4 = descriptor.font.strikeThrough) != null ? ref4 : control.font.strikeThrough;
      if (descriptor.font.color != null) {
        control.font.color = Color.fromArray(descriptor.font.color);
      }
      if (descriptor.font.border != null) {
        control.font.border = (ref5 = descriptor.font.border) != null ? ref5 : false;
        control.font.borderSize = (ref6 = descriptor.font.borderSize) != null ? ref6 : 4;
        control.font.borderColor = new Color(0, 0, 0);
      }
      if (descriptor.font.outline != null) {
        control.font.border = (ref7 = descriptor.font.outline) != null ? ref7 : false;
        control.font.borderSize = (ref8 = descriptor.font.outline.size) != null ? ref8 : 4;
        if (descriptor.font.outline.color != null) {
          control.font.borderColor = Color.fromArray(descriptor.font.outline.color);
        } else {
          control.font.borderColor = new Color(0, 0, 0);
        }
      }
    }
    if (descriptor.components != null) {
      ref9 = descriptor.components;
      for (j = 0, len = ref9.length; j < len; j++) {
        c = ref9[j];
        m = c.module || "gs";
        component = new window[m][c.type](c.params);
        control.addComponent(component, c.id);
        control[c.id] = component;
      }
    }
    control.focusable = (ref10 = descriptor.focusable) != null ? ref10 : control.focusable;
    if (descriptor.nextKeyObject) {
      control.ui.nextKeyObjectId = descriptor.nextKeyObject;
    }
    if (descriptor.initialFocus) {
      control.ui.focus();
    }
    actions = Object.deepCopy(descriptor.action != null ? [descriptor.action] : descriptor.actions);
    if (actions != null) {
      for (l = 0, len1 = actions.length; l < len1; l++) {
        action = actions[l];
        if (action != null) {
          action.event = (ref11 = action.event) != null ? ref11 : "onAccept";
          if (action.target == null) {
            target = this.controllers != null ? this.controllers[descriptor.target] : controller;
            action.target = target || SceneManager.scene.behavior;
          }
        }
      }
      control.actions = actions;
      if (!control.findComponentById("actionHandler")) {
        control.insertComponent(new ui.Component_ActionHandler(), 1, "actionHandler");
      }
    }
    if (descriptor.id != null) {
      control.id = descriptor.id;
      gs.ObjectManager.current.setObjectById(control, control.id);
    }
    control.descriptor = descriptor;
    control.layoutRect = new Rect();
    control.layoutRect.set(0, 0, 0, 0);
    if (descriptor.frame != null) {
      if (((ref12 = descriptor.frame[0]) != null ? ref12.length : void 0) != null) {
        control.layoutRect.x = this.createCalcFunction(descriptor.frame[0]);
        control.dstRect.x = 0;
      } else {
        control.dstRect.x = (ref13 = descriptor.frame[0]) != null ? ref13 : control.dstRect.x;
      }
      if (((ref14 = descriptor.frame[1]) != null ? ref14.length : void 0) != null) {
        control.layoutRect.y = this.createCalcFunction(descriptor.frame[1]);
        control.dstRect.y = 0;
      } else {
        control.dstRect.y = (ref15 = descriptor.frame[1]) != null ? ref15 : control.dstRect.y;
      }
      if (((ref16 = descriptor.frame[2]) != null ? ref16.length : void 0) != null) {
        control.layoutRect.width = this.createCalcFunction(descriptor.frame[2]);
        control.dstRect.width = 1;
      } else {
        control.dstRect.width = (ref17 = descriptor.frame[2]) != null ? ref17 : control.dstRect.width;
      }
      if (((ref18 = descriptor.frame[3]) != null ? ref18.length : void 0) != null) {
        control.layoutRect.height = this.createCalcFunction(descriptor.frame[3]);
        control.dstRect.height = 1;
      } else {
        control.dstRect.height = (ref19 = descriptor.frame[3]) != null ? ref19 : control.dstRect.height;
      }
    }
    if (descriptor.sizeToParent != null) {
      control.sizeToParent = descriptor.sizeToParent;
    }
    if (descriptor.blendMode != null) {
      control.blendMode = this.blendModes[descriptor.blendMode];
    }
    if (descriptor.anchor != null) {
      control.anchor.set(descriptor.anchor[0], descriptor.anchor[1]);
    }
    control.opacity = (ref20 = descriptor.opacity) != null ? ref20 : 255;
    if (descriptor.minimumSize != null) {
      control.minimumSize = {
        width: descriptor.minimumSize[0],
        height: descriptor.minimumSize[1]
      };
    }
    if (descriptor.resizable != null) {
      control.resizable = descriptor.resizable;
    }
    if (descriptor.scrollable != null) {
      control.scrollable = descriptor.scrollable;
    }
    if (descriptor.fixedSize != null) {
      control.fixedSize = descriptor.fixedSize;
    }
    if (descriptor.draggable != null) {
      control.draggable = descriptor.draggable;
      control.draggable.step = 0;
      if (control.draggable.rect != null) {
        control.draggable.rect = Rect.fromArray(control.draggable.rect);
      }
      control.addComponent(new ui.Component_Draggable());
    }
    if (descriptor.bindings != null) {
      control.bindings = descriptor.bindings;
      control.insertComponent(new ui.Component_BindingHandler(), 0);
    }
    if (descriptor.formulas != null) {
      control.formulas = descriptor.formulas;
      control.insertComponent(new ui.Component_FormulaHandler(), 0);
    }
    control.dataField = descriptor.dataField;
    control.enabled = (ref21 = descriptor.enabled) != null ? ref21 : true;
    if (descriptor.selectable != null) {
      control.selectable = descriptor.selectable;
    }
    if (descriptor.group != null) {
      control.group = descriptor.group;
      gs.ObjectManager.current.addToGroup(control, control.group);
    }
    if (descriptor.customFields != null) {
      control.customFields = Object.deepCopy(descriptor.customFields);
    }
    if (descriptor.margin != null) {
      control.margin.left = descriptor.margin[0];
      control.margin.top = descriptor.margin[1];
      control.margin.right = descriptor.margin[2];
      control.margin.bottom = descriptor.margin[3];
    }
    if (descriptor.padding != null) {
      control.padding.left = descriptor.padding[0];
      control.padding.top = descriptor.padding[1];
      control.padding.right = descriptor.padding[2];
      control.padding.bottom = descriptor.padding[3];
    }
    if (descriptor.alignment != null) {
      control.alignment = this.alignments[descriptor.alignment];
    }
    control.alignmentY = this.alignments[descriptor.alignmentY || 0];
    control.alignmentX = this.alignments[descriptor.alignmentX || 0];
    control.zIndex = descriptor.zIndex || 0;
    control.order = descriptor.order || 0;
    control.chainOrder = ((ref22 = descriptor.chainOrder) != null ? ref22 : descriptor.zOrder) + ((parent != null ? parent.chainOrder : void 0) || 0);
    if (descriptor.zoom != null) {
      control.zoom = {
        x: descriptor.zoom[0] / 100,
        y: descriptor.zoom[1] / 100
      };
    }
    if (descriptor.visible != null) {
      control.visible = descriptor.visible;
    }
    if (descriptor.clipRect) {
      control.clipRect = new Rect(control.dstRect.x, control.dstRect.y, control.dstRect.width, control.dstRect.height);
    }
    if (descriptor.styles != null) {
      this.addControlStyles(control, descriptor.styles);
    }
    if (descriptor.template != null) {
      control.behavior.managementMode = ui.LayoutManagementMode.fromString(descriptor.managementMode);
      data = ui.Component_FormulaHandler.fieldValue(control, control.dataField);
      isNumber = typeof data === "number";
      if (data != null) {
        for (i = n = 0, ref23 = (ref24 = data.length) != null ? ref24 : data; 0 <= ref23 ? n < ref23 : n > ref23; i = 0 <= ref23 ? ++n : --n) {
          if ((data[i] != null) || isNumber) {
            valid = true;
            if ((descriptor.dataFilter != null) && !isNumber) {
              valid = ui.Component_Handler.checkCondition(data[i], descriptor.dataFilter);
            }
            if (valid || isNumber) {
              child = this.createControlFromDescriptor(descriptor.template, control, i);
              if ((ref25 = data[i]) != null ? ref25.dstRect : void 0) {
                child.dstRect = ui.UIElementRectangle.fromRect(child, data[i].dstRect);
              }
              if ((child.clipRect == null) && (control.clipRect != null)) {
                child.clipRect = control.clipRect;
              }
              control.addObject(child);
              child.index = i;
              child.order = ((ref26 = data.length) != null ? ref26 : data) - i;
              control.controls.push(child);
            }
          }
        }
      }
    }
    if (descriptor.controls && descriptor.controls.exec) {
      controls = ui.Component_FormulaHandler.fieldValue(descriptor, descriptor.controls);
    } else {
      controls = descriptor.controls;
    }
    if (controls != null) {
      for (i = o = 0, len2 = controls.length; o < len2; i = ++o) {
        item = controls[i];
        childControl = this._createFromDescriptor(item, control, i);
        if ((childControl.clipRect == null) && (control.clipRect != null)) {
          childControl.clipRect = control.clipRect;
        }
        childControl.index = i;
        childControl.origin.x = control.origin.x + control.dstRect.x;
        childControl.origin.y = control.origin.y + control.dstRect.y;
        control.addObject(childControl);
        control.controls.push(childControl);
      }
    }
    if (control.styles && control.parentsByStyle) {
      parent = control.parent;
      while (parent) {
        if (parent.styles) {
          ref27 = parent.styles;
          for (p = 0, len3 = ref27.length; p < len3; p++) {
            style = ref27[p];
            if (!control.parentsByStyle[style.id]) {
              control.parentsByStyle[style.id] = [];
            }
            control.parentsByStyle[style.id].push(parent);
          }
        }
        parent = parent.parent;
      }
    }
    if (descriptor.animations != null) {
      control.animations = Object.deepCopy(descriptor.animations);
      control.animationExecutor = new ui.Component_AnimationExecutor();
      control.addComponent(control.animationExecutor);
      control.addComponent(new ui.Component_AnimationHandler());
    }
    control.ui.updateStyle();
    control.setup();
    return control;
  };


  /**
  * Creates an UI object from a specified UI descriptor.
  *
  * @method _createFromDescriptor
  * @param {Object} descriptor - The UI object descriptor.
  * @param {gs.Object_UIElement} parent - The UI parent object. (A layout for example).
  * @return {gs.Object_UIElement} The created UI object.
  * @protected
   */

  UIManager.prototype._createFromDescriptor = function(descriptor, parent, index) {
    var control, controller;
    control = this.createControlFromDescriptor(descriptor, parent, index);
    if (descriptor.controller != null) {
      controller = this.controllers[descriptor.controller];
      control.controller = controller;
      control.addComponent(controller);
    }
    return control;
  };

  UIManager.prototype.createLayoutFromDescriptor = function(descriptor, parent, index) {
    return this._createFromDescriptor(descriptor, parent, index);
  };

  return UIManager;

})();

Graphics.width = $PARAMS.resolution.width;

Graphics.height = $PARAMS.resolution.height;

ui.UiFactory = new UIManager();

ui.UIManager = ui.UiFactory;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7Ozs7OztFQVlhLGlCQUFDLENBQUQsRUFBSSxJQUFKLEVBQVUsS0FBVjs7QUFDVDs7Ozs7QUFBQSxRQUFBO0lBS0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7O0FBRWhCOzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBRVQ7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBUTs7QUFFUjs7Ozs7SUFLQSxJQUFDLENBQUEsS0FBRCxHQUFTOztBQUVUOzs7Ozs7SUFNQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsS0FBQSxDQUFNLEVBQU47QUFDZixTQUF5Qiw4RkFBekI7TUFBQSxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBVCxHQUFjO0FBQWQ7O0FBRUE7Ozs7OztJQU1BLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxLQUFBLENBQU0sRUFBTjtBQUNmLFNBQTBCLG1HQUExQjtNQUFBLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFULEdBQWM7QUFBZDtFQTdDUzs7O0FBZ0RiOzs7OztvQkFJQSxJQUFBLEdBQU0sU0FBQTtBQUNILFFBQUE7SUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQTtJQUNULENBQUEsR0FBSSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBYSxJQUFiLEVBQW1CLFNBQW5CO0lBQ0osSUFBQyxDQUFBLFlBQUQsR0FBZ0I7QUFFaEIsV0FBTztFQUxKOzs7QUFPTjs7Ozs7Ozs7b0JBT0EsUUFBQSxHQUFVLFNBQUMsV0FBRDtBQUNOLFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVQsS0FBZTtJQUN4QixJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBVCxHQUFjO0FBRWQsV0FBTztFQUpEOzs7QUFNVjs7Ozs7Ozs7b0JBT0EsWUFBQSxHQUFjLFNBQUMsU0FBRDtBQUNWLFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVQsS0FBZTtJQUN4QixJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBVCxHQUFjO0FBRWQsV0FBTztFQUpHOzs7Ozs7QUFNbEIsRUFBRSxDQUFDLE9BQUgsR0FBYTs7QUFFUDs7QUFDRjs7Ozs7Ozs7Ozs7O0VBWWEsZUFBQyxJQUFELEVBQU8sR0FBUCxFQUFZLEtBQVosRUFBbUIsTUFBbkI7O0FBQ1Q7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBUTs7QUFFUjs7Ozs7SUFLQSxJQUFDLENBQUEsR0FBRCxHQUFPOztBQUVQOzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBRVQ7Ozs7O0lBS0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtFQTNCRDs7O0FBNkJiOzs7Ozs7O2tCQU1BLGFBQUEsR0FBZSxTQUFDLEtBQUQ7SUFDWCxJQUFDLENBQUEsSUFBRCxHQUFRLEtBQUssQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU8sS0FBSyxDQUFDO0lBQ2IsSUFBQyxDQUFBLEtBQUQsR0FBUyxLQUFLLENBQUM7V0FDZixJQUFDLENBQUEsTUFBRCxHQUFVLEtBQUssQ0FBQztFQUpMOzs7QUFNZjs7Ozs7Ozs7OztrQkFTQSxHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sR0FBUCxFQUFZLEtBQVosRUFBbUIsTUFBbkI7SUFDRCxJQUFDLENBQUEsSUFBRCxHQUFRO0lBQ1IsSUFBQyxDQUFBLEdBQUQsR0FBTztJQUNQLElBQUMsQ0FBQSxLQUFELEdBQVM7V0FDVCxJQUFDLENBQUEsTUFBRCxHQUFVO0VBSlQ7OztBQU1MOzs7Ozs7OztFQU9BLEtBQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxLQUFEO1dBQWUsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQWYsRUFBbUIsS0FBTSxDQUFBLENBQUEsQ0FBekIsRUFBNkIsS0FBTSxDQUFBLENBQUEsQ0FBbkMsRUFBdUMsS0FBTSxDQUFBLENBQUEsQ0FBN0M7RUFBZjs7Ozs7O0FBRWhCLEVBQUUsQ0FBQyxLQUFILEdBQVc7O0FBRUw7O0FBQ0Y7Ozs7Ozs7Ozs7O0VBV2EsZUFBQyxVQUFELEVBQWEsRUFBYixFQUFpQixRQUFqQjs7QUFDVDs7Ozs7SUFLQSxJQUFDLENBQUEsRUFBRCxHQUFNOztBQUVOOzs7Ozs7SUFNQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUM7O0FBRVg7Ozs7O0lBS0EsSUFBQyxDQUFBLFFBQUQsR0FBWTs7QUFFWjs7Ozs7O0lBTUEsSUFBQyxDQUFBLElBQUQsR0FBUTs7QUFFUjs7Ozs7SUFLQSxJQUFDLENBQUEsS0FBRCxHQUFTOztBQUVUOzs7Ozs7SUFNQSxJQUFDLENBQUEsVUFBRCxHQUFjOztBQUVkOzs7OztJQUtBLElBQUMsQ0FBQSxLQUFELEdBQVM7O0FBRVQ7Ozs7O0lBS0EsSUFBQyxDQUFBLElBQUQsR0FBUTs7QUFFUjs7Ozs7OztJQU9BLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7OztJQU1BLElBQUMsQ0FBQSxJQUFELEdBQVE7O0FBRVI7Ozs7OztJQU1BLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7O0lBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVzs7QUFFWDs7Ozs7SUFLQSxJQUFDLENBQUEsSUFBRCxHQUFROztBQUVSOzs7OztJQUtBLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQzs7QUFFZDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUM7O0FBRVo7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsUUFBRCxHQUFZOztBQUVaOzs7OztJQUtBLElBQUMsQ0FBQSxlQUFELEdBQW1CLENBQUM7O0FBRXBCOzs7OztJQUtBLElBQUMsQ0FBQSxjQUFELEdBQWtCLENBQUM7O0FBRW5COzs7OztJQUtBLElBQUMsQ0FBQSxPQUFELEdBQVc7O0FBRVg7Ozs7Ozs7SUFPQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUM7O0FBRVg7Ozs7O0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFDOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQzs7QUFFZjs7Ozs7SUFLQSxJQUFDLENBQUEsU0FBRCxHQUFhOztBQUViOzs7OztJQUtBLElBQUMsQ0FBQSxVQUFELEdBQWM7SUFFZCxJQUFHLFVBQUg7TUFDSSxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsVUFBbkIsRUFESjs7RUFwTFM7OztBQXVMYjs7Ozs7OztrQkFNQSxpQkFBQSxHQUFtQixTQUFDLFVBQUQ7SUFDZixJQUFDLENBQUEsVUFBRCxHQUFjO0lBQ2QsSUFBQyxDQUFBLEtBQUQsR0FBUyxVQUFVLENBQUM7SUFDcEIsSUFBaUQsVUFBVSxDQUFDLEtBQTVEO01BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVQsQ0FBbUIsVUFBVSxDQUFDLEtBQTlCLEVBQVQ7O0lBQ0EsSUFBOEMsVUFBVSxDQUFDLElBQXpEO01BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVIsQ0FBa0IsVUFBVSxDQUFDLElBQTdCLEVBQVI7O0lBQ0EsSUFBc0UsVUFBVSxDQUFDLE1BQWpGO01BQUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsVUFBVSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTNCLEVBQStCLFVBQVUsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFqRCxFQUFkOztJQUNBLElBQWdFLFVBQVUsQ0FBQyxJQUEzRTtNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLFVBQVUsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUF6QixFQUE2QixVQUFVLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBN0MsRUFBWjs7SUFFQSxJQUFHLFVBQVUsQ0FBQyxJQUFkO01BQ0ksSUFBQyxDQUFBLFNBQUQsQ0FBVyxVQUFYLEVBREo7O0lBR0EsSUFBRyxVQUFVLENBQUMsUUFBZDtNQUNJLElBQUMsQ0FBQSxRQUFELEdBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFSLENBQWtCLFVBQVUsQ0FBQyxRQUE3QixFQURoQjs7SUFHQSxJQUFpQyxVQUFVLENBQUMsT0FBWCxJQUFzQixDQUF2RDtNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsVUFBVSxDQUFDLFFBQXRCOztJQUNBLElBQXFDLFVBQVUsQ0FBQyxTQUFYLElBQXdCLENBQTdEO01BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxVQUFVLENBQUMsVUFBeEI7O0lBQ0EsSUFBbUQsVUFBVSxDQUFDLE1BQTlEO01BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVQsQ0FBbUIsVUFBVSxDQUFDLE1BQTlCLEVBQVY7O0lBQ0EsSUFBcUQsVUFBVSxDQUFDLE9BQWhFO01BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVQsQ0FBbUIsVUFBVSxDQUFDLE9BQTlCLEVBQVg7O0lBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxVQUFVLENBQUM7SUFDekIsSUFBaUQsVUFBVSxDQUFDLGVBQTVEO01BQUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsVUFBVSxDQUFDLGdCQUE5Qjs7SUFDQSxJQUErQyxVQUFVLENBQUMsY0FBMUQ7TUFBQSxJQUFDLENBQUEsY0FBRCxHQUFrQixVQUFVLENBQUMsZUFBN0I7O0lBQ0EsSUFBNkIsVUFBVSxDQUFDLEtBQXhDO01BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxVQUFVLENBQUMsTUFBcEI7O0lBQ0EsSUFBaUMsVUFBVSxDQUFDLE9BQTVDO01BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxVQUFVLENBQUMsUUFBdEI7O0lBQ0EsSUFBcUMsNEJBQXJDO01BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxVQUFVLENBQUMsVUFBeEI7O0lBQ0EsSUFBK0IsVUFBVSxDQUFDLE1BQTFDO01BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxVQUFVLENBQUMsT0FBckI7O0lBQ0EsSUFBZ0UsVUFBVSxDQUFDLFVBQTNFO01BQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQUFFLENBQUMsU0FBUyxDQUFDLFVBQVcsQ0FBQSxVQUFVLENBQUMsVUFBWCxFQUF0Qzs7SUFDQSxJQUFnRSxVQUFVLENBQUMsVUFBM0U7YUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVyxDQUFBLFVBQVUsQ0FBQyxVQUFYLEVBQXRDOztFQTFCZTs7a0JBNEJuQixHQUFBLEdBQUssU0FBQyxLQUFEO0lBQ0QsSUFBQyxDQUFBLEtBQUQsR0FBUyxLQUFLLENBQUM7SUFDZixJQUFDLENBQUEsS0FBSyxDQUFDLGFBQVAsQ0FBcUIsS0FBSyxDQUFDLEtBQTNCO0lBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUFOLENBQW9CLEtBQUssQ0FBQyxJQUExQjtJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBekIsRUFBNEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUF6QztJQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBckIsRUFBd0IsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFuQztJQUVBLElBQUcsS0FBSyxDQUFDLElBQVQ7TUFDSSxJQUFHLENBQUMsSUFBQyxDQUFBLElBQUw7UUFBZSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQW5CLEVBQXlCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBcEMsRUFBM0I7O01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsS0FBSyxDQUFDLElBQWhCLEVBRko7O0lBSUEsSUFBRyxLQUFLLENBQUMsUUFBVDtNQUNJLElBQUcsQ0FBQyxJQUFDLENBQUEsUUFBTDtRQUFtQixJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEVBQUUsQ0FBQyxJQUFILENBQUEsRUFBbkM7O01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLENBQXdCLEtBQUssQ0FBQyxRQUE5QixFQUZKOztJQUlBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FBSyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FBSyxDQUFDO0lBQ25CLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFzQixLQUFLLENBQUMsTUFBNUI7V0FDQSxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBdUIsS0FBSyxDQUFDLE9BQTdCO0VBbEJDOzs7QUFvQkw7Ozs7Ozs7O2tCQU9BLFNBQUEsR0FBVyxTQUFDLFVBQUQ7QUFDUCxRQUFBO0lBQUEsSUFBRyxVQUFVLENBQUMsSUFBZDtNQUNJLElBQUcsQ0FBQyxJQUFDLENBQUEsSUFBTDtRQUNJLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxJQUFBLENBQUssVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFyQiwrQ0FBa0QsQ0FBbEQsRUFEaEI7T0FBQSxNQUFBO1FBR0ksSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLEdBQWEsVUFBVSxDQUFDLElBQUksQ0FBQztRQUM3QixJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sa0RBQW9DLEVBSnhDOztNQU1BLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixrREFBb0MsSUFBQyxDQUFBLElBQUksQ0FBQztNQUMxQyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sb0RBQXdDLElBQUMsQ0FBQSxJQUFJLENBQUM7TUFDOUMsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLHVEQUE4QyxJQUFDLENBQUEsSUFBSSxDQUFDO01BQ3BELElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTix1REFBOEMsSUFBQyxDQUFBLElBQUksQ0FBQztNQUNwRCxJQUFDLENBQUEsSUFBSSxDQUFDLGFBQU4sMkRBQXNELElBQUMsQ0FBQSxJQUFJLENBQUM7TUFFNUQsSUFBRyw2QkFBSDtRQUNJLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVosQ0FBeUIsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUF6QyxFQURKOztNQUdBLElBQUcsOEJBQUg7UUFDSSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sb0RBQXdDO1FBQ3hDLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBTix3REFBZ0Q7UUFDaEQsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBbEIsQ0FBc0IsQ0FBdEIsRUFBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFBK0IsR0FBL0IsRUFISjs7TUFLQSxJQUFHLDhCQUFIO1FBQ0ksSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLG9EQUF3QztRQUN4QyxJQUFDLENBQUEsSUFBSSxDQUFDLGFBQU4sNkRBQXNEO1FBQ3RELElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBTiw2REFBc0Q7UUFDdEQsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBbEIsQ0FBK0IsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUEvQyxFQUpKOztNQU1BLElBQUcsK0JBQUg7UUFDSSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sdURBQXlDO1FBQ3pDLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBTiw0REFBa0Q7UUFFbEQsSUFBRyxxQ0FBSDtpQkFDSSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFsQixDQUErQixVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUF2RCxFQURKO1NBQUEsTUFBQTtpQkFHSSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFsQixDQUFzQixDQUF0QixFQUF5QixDQUF6QixFQUE0QixDQUE1QixFQUErQixHQUEvQixFQUhKO1NBSko7T0EzQko7O0VBRE87OztBQXFDWDs7Ozs7OztrQkFNQSxLQUFBLEdBQU8sU0FBQyxNQUFEO0FBQ0gsUUFBQTtJQUFBLElBQUcsQ0FBSSxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQXBCLENBQTZCLElBQTdCLENBQVA7TUFDSSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQXBCLENBQXlCLElBQXpCO01BQ0EsSUFBRyxJQUFDLENBQUEsSUFBSjs7YUFBeUIsQ0FBRSxHQUFiLENBQWlCLElBQUMsQ0FBQSxJQUFsQjtTQUFkOztNQUNBLElBQUcsSUFBQyxDQUFBLEtBQUo7UUFBZSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLEtBQWxCLEVBQWY7O01BQ0EsSUFBRyxJQUFDLENBQUEsSUFBSjs7Y0FBeUIsQ0FBRSxHQUFiLENBQWlCLElBQUMsQ0FBQSxJQUFsQjtTQUFkOztNQUNBLElBQUcsSUFBQyxDQUFBLEtBQUo7UUFBZSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUMsQ0FBQSxNQUEvQjs7TUFDQSxJQUFHLElBQUMsQ0FBQSxNQUFKO1FBQWdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLENBQTFCLEVBQTZCLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBckMsRUFBaEI7O01BQ0EsSUFBRyxJQUFDLENBQUEsSUFBSjtRQUFjLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBWixDQUFnQixJQUFDLENBQUEsSUFBSSxDQUFDLENBQXRCLEVBQXlCLElBQUMsQ0FBQSxJQUFJLENBQUMsQ0FBL0IsRUFBZDs7TUFDQSxJQUFHLElBQUMsQ0FBQSxPQUFKO1FBQWlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBZixDQUE2QixJQUFDLENBQUEsT0FBOUIsRUFBakI7O01BQ0EsSUFBRyxJQUFDLENBQUEsTUFBSjtRQUFnQixNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWQsQ0FBNEIsSUFBQyxDQUFBLE1BQTdCLEVBQWhCOztNQUNBLElBQUcsSUFBQyxDQUFBLE9BQUQsSUFBWSxDQUFmO1FBQXNCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUMsQ0FBQSxRQUF4Qzs7TUFDQSxJQUFHLElBQUMsQ0FBQSxTQUFELElBQWMsQ0FBakI7UUFBd0IsTUFBTSxDQUFDLFNBQVAsR0FBbUIsSUFBQyxDQUFBLFVBQTVDOztNQUNBLElBQUcsSUFBQyxDQUFBLGNBQUQsSUFBbUIsQ0FBdEI7UUFBNkIsTUFBTSxDQUFDLGNBQVAsR0FBd0IsSUFBQyxDQUFBLGVBQXREOztNQUNBLElBQUcsSUFBQyxDQUFBLGVBQUQsSUFBb0IsQ0FBdkI7UUFBOEIsTUFBTSxDQUFDLGVBQVAsR0FBeUIsSUFBQyxDQUFBLGdCQUF4RDs7TUFDQSxJQUFHLElBQUMsQ0FBQSxJQUFKO1FBQWMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFaLENBQWdCLElBQUMsQ0FBQSxJQUFqQixFQUFkOztNQUNBLElBQUcsSUFBQyxDQUFBLE1BQUQsSUFBVyxDQUFkO1FBQXFCLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLElBQUMsQ0FBQSxPQUF0Qzs7TUFDQSxJQUFHLElBQUMsQ0FBQSxVQUFELElBQWUsQ0FBbEI7UUFBeUIsTUFBTSxDQUFDLFVBQVAsR0FBb0IsSUFBQyxDQUFBLFdBQTlDOztNQUNBLElBQUcsSUFBQyxDQUFBLFVBQUQsSUFBZSxDQUFsQjtRQUF5QixNQUFNLENBQUMsVUFBUCxHQUFvQixJQUFDLENBQUEsV0FBOUM7O01BQ0EsSUFBRyxzQkFBSDtRQUFvQixNQUFNLENBQUMsU0FBUCxHQUFtQixJQUFDLENBQUEsVUFBeEM7O01BRUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkO2FBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBakIsRUFyQko7O0VBREc7OztBQXdCUDs7Ozs7Ozs7a0JBT0EsWUFBQSxHQUFjLFNBQUMsTUFBRDtJQUNWLElBQUcsSUFBQyxDQUFBLE9BQUo7TUFDSSxJQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFsQjtRQUNJLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBZCxDQUFBO1FBQ0EsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsTUFBTSxDQUFDLE1BQTlCO1FBQ0EsTUFBTSxDQUFDLE1BQVAsR0FBb0IsSUFBQSxFQUFFLENBQUMsc0JBQUgsQ0FBQTtRQUNwQixNQUFNLENBQUMsWUFBUCxDQUFvQixNQUFNLENBQUMsTUFBM0IsRUFKSjs7TUFNQSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUF0QixHQUFpQyxJQUFDLENBQUEsT0FBTyxDQUFDO2FBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQXRCLEdBQW1DLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FSaEQ7O0VBRFU7OztBQVdkOzs7Ozs7Ozs7a0JBUUEsZUFBQSxHQUFpQixTQUFDLE1BQUQ7SUFDYixJQUFHLElBQUMsQ0FBQSxVQUFKO01BQ0ksTUFBTSxDQUFDLFVBQVAsR0FBb0IsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsSUFBQyxDQUFBLFVBQWpCO01BQ3BCLElBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsa0JBQXpCLENBQUo7UUFDSSxNQUFNLENBQUMsaUJBQVAsR0FBK0IsSUFBQSxFQUFFLENBQUMsMkJBQUgsQ0FBQTtRQUMvQixNQUFNLENBQUMsWUFBUCxDQUF3QixJQUFBLEVBQUUsQ0FBQywwQkFBSCxDQUFBLENBQXhCLEVBQXlELGtCQUF6RDtlQUNBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLE1BQU0sQ0FBQyxpQkFBM0IsRUFBOEMsbUJBQTlDLEVBSEo7T0FGSjs7RUFEYTs7O0FBU2pCOzs7Ozs7Ozs7a0JBUUEsTUFBQSxHQUFRLFNBQUMsTUFBRDtBQUNKLFFBQUE7SUFBQSxZQUFBLEdBQWUsTUFBTSxDQUFDO0lBQ3RCLElBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFwQixDQUE2QixJQUE3QixDQUFIO01BQ0ksTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFwQixDQUEyQixJQUEzQjtNQUVBLElBQUcsSUFBQyxDQUFBLElBQUo7UUFBYyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQVosQ0FBZ0IsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUF6QjtBQUE4QyxhQUFBLDRDQUFBOztVQUFDLElBQUcsQ0FBQyxDQUFDLElBQUw7WUFBZSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQVosQ0FBZ0IsQ0FBQyxDQUFDLElBQWxCO0FBQXlCLGtCQUF4Qzs7QUFBRCxTQUE1RDs7TUFDQSxJQUFHLElBQUMsQ0FBQSxLQUFKO1FBQWUsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFiLENBQWlCLEtBQUssQ0FBQyxLQUF2QjtBQUE2QyxhQUFBLDRDQUFBOztVQUFDLElBQUcsQ0FBQyxDQUFDLEtBQUw7WUFBZ0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFiLENBQWlCLENBQUMsQ0FBQyxLQUFuQjtBQUEyQixrQkFBM0M7O0FBQUQsU0FBNUQ7O01BQ0EsSUFBRyxJQUFDLENBQUEsSUFBSjs7YUFBeUIsQ0FBRSxHQUFiLENBQWlCLENBQWpCLEVBQW9CLENBQXBCLEVBQXVCLENBQXZCLEVBQTBCLENBQTFCOztBQUE4QyxhQUFBLDRDQUFBOztVQUFDLElBQUcsQ0FBQyxDQUFDLElBQUw7O2tCQUEwQixDQUFFLEdBQWIsQ0FBaUIsQ0FBQyxDQUFDLElBQW5COztBQUEwQixrQkFBekM7O0FBQUQsU0FBNUQ7O01BQ0EsSUFBRyxJQUFDLENBQUEsS0FBSjtRQUFlLE1BQU0sQ0FBQyxLQUFQLEdBQWU7QUFBOEIsYUFBQSw0Q0FBQTs7VUFBQyxJQUFHLENBQUMsQ0FBQyxLQUFMO1lBQWdCLE1BQU0sQ0FBQyxLQUFQLEdBQWUsQ0FBQyxDQUFDO0FBQU8sa0JBQXhDOztBQUFELFNBQTVEOztNQUNBLElBQUcsSUFBQyxDQUFBLE1BQUo7UUFBZ0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFkLENBQWtCLENBQWxCLEVBQXFCLENBQXJCO0FBQTRDLGFBQUEsNENBQUE7O1VBQUMsSUFBRyxDQUFDLENBQUMsTUFBTDtZQUFpQixNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWQsQ0FBNEIsQ0FBQyxDQUFDLE1BQTlCO0FBQXVDLGtCQUF4RDs7QUFBRCxTQUE1RDs7TUFDQSxJQUFHLElBQUMsQ0FBQSxJQUFKO1FBQWMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFaLENBQWdCLEdBQWhCLEVBQXFCLEdBQXJCO0FBQThDLGFBQUEsNENBQUE7O1VBQUMsSUFBRyxDQUFDLENBQUMsSUFBTDtZQUFlLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBWixDQUEwQixDQUFDLENBQUMsSUFBNUI7QUFBbUMsa0JBQWxEOztBQUFELFNBQTVEOztNQUNBLElBQUcsSUFBQyxDQUFBLE9BQUo7UUFBaUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFmLENBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCO0FBQTJDLGFBQUEsNENBQUE7O1VBQUMsSUFBRyxDQUFDLENBQUMsT0FBTDtZQUFrQixNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWYsQ0FBNkIsQ0FBQyxDQUFDLE9BQS9CO0FBQXlDLGtCQUEzRDs7QUFBRCxTQUE1RDs7TUFDQSxJQUFHLElBQUMsQ0FBQSxNQUFKO1FBQWdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBZCxDQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixDQUF4QixFQUEyQixDQUEzQjtBQUE0QyxhQUFBLDRDQUFBOztVQUFDLElBQUcsQ0FBQyxDQUFDLE1BQUw7WUFBaUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFkLENBQTRCLENBQUMsQ0FBQyxNQUE5QjtBQUF1QyxrQkFBeEQ7O0FBQUQsU0FBNUQ7O01BQ0EsSUFBRyxJQUFDLENBQUEsT0FBRCxJQUFZLENBQWY7UUFBc0IsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBcUIsYUFBQSw0Q0FBQTs7VUFBQyxJQUFHLENBQUMsQ0FBQyxPQUFGLElBQWEsQ0FBaEI7WUFBdUIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsQ0FBQyxDQUFDO0FBQVMsa0JBQW5EOztBQUFELFNBQTVEOztNQUNBLElBQUcsSUFBQyxDQUFBLFNBQUQsSUFBYyxDQUFqQjtRQUF3QixNQUFNLENBQUMsU0FBUCxHQUFtQjtBQUFpQixhQUFBLDRDQUFBOztVQUFDLElBQUcsQ0FBQyxDQUFDLFNBQUYsSUFBZSxDQUFsQjtZQUF5QixNQUFNLENBQUMsU0FBUCxHQUFtQixDQUFDLENBQUM7QUFBVyxrQkFBekQ7O0FBQUQsU0FBNUQ7O01BQ0EsSUFBRyxJQUFDLENBQUEsZUFBRCxJQUFvQixDQUF2QjtRQUE4QixNQUFNLENBQUMsZUFBUCxHQUF5QjtBQUFLLGFBQUEsNENBQUE7O1VBQUMsSUFBRyxDQUFDLENBQUMsZUFBRixJQUFxQixDQUF4QjtZQUErQixNQUFNLENBQUMsZUFBUCxHQUF5QixDQUFDLENBQUM7QUFBaUIsa0JBQTNFOztBQUFELFNBQTVEOztNQUNBLElBQUcsSUFBQyxDQUFBLGNBQUQsSUFBbUIsQ0FBdEI7UUFBNkIsTUFBTSxDQUFDLGNBQVAsR0FBd0I7QUFBTyxhQUFBLDRDQUFBOztVQUFDLElBQUcsQ0FBQyxDQUFDLGNBQUYsSUFBb0IsQ0FBdkI7WUFBOEIsTUFBTSxDQUFDLGNBQVAsR0FBd0IsQ0FBQyxDQUFDO0FBQWdCLGtCQUF4RTs7QUFBRCxTQUE1RDs7TUFDQSxJQUFHLElBQUMsQ0FBQSxJQUFKO1FBQWMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFaLENBQWdCLElBQWhCO0FBQThDLGFBQUEsK0NBQUE7O1VBQUMsSUFBRyxDQUFDLENBQUMsSUFBTDtZQUFlLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBWixDQUFnQixDQUFDLENBQUMsSUFBbEI7QUFBeUIsa0JBQXhDOztBQUFELFNBQTVEOztNQUNBLElBQUcsSUFBQyxDQUFBLE1BQUQsSUFBVyxDQUFkO1FBQXFCLE1BQU0sQ0FBQyxNQUFQLEdBQWdCO0FBQXVCLGFBQUEsK0NBQUE7O1VBQUMsSUFBRyxDQUFDLENBQUMsTUFBRixJQUFZLENBQWY7WUFBc0IsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBQyxDQUFDO0FBQVEsa0JBQWhEOztBQUFELFNBQTVEOztNQUNBLElBQUcsSUFBQyxDQUFBLFVBQUQsSUFBZSxDQUFsQjtRQUF5QixNQUFNLENBQUMsVUFBUCxHQUFvQjtBQUFlLGFBQUEsK0NBQUE7O1VBQUMsSUFBRyxDQUFDLENBQUMsVUFBRixJQUFnQixDQUFuQjtZQUEwQixNQUFNLENBQUMsVUFBUCxHQUFvQixDQUFDLENBQUM7QUFBWSxrQkFBNUQ7O0FBQUQsU0FBNUQ7O01BQ0EsSUFBRyxJQUFDLENBQUEsVUFBRCxJQUFlLENBQWxCO1FBQXlCLE1BQU0sQ0FBQyxVQUFQLEdBQW9CO0FBQWUsYUFBQSwrQ0FBQTs7VUFBQyxJQUFHLENBQUMsQ0FBQyxVQUFGLElBQWdCLENBQW5CO1lBQTBCLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLENBQUMsQ0FBQztBQUFZLGtCQUE1RDs7QUFBRCxTQUE1RDs7TUFDQSxJQUFHLHNCQUFIO1FBQW9CLE1BQU0sQ0FBQyxTQUFQLEdBQW1CO0FBQXFCLGFBQUEsK0NBQUE7O1VBQUMsSUFBRyxtQkFBSDtZQUFxQixNQUFNLENBQUMsU0FBUCxHQUFtQixDQUFDLENBQUM7QUFBVyxrQkFBckQ7O0FBQUQsU0FBNUQ7O01BRUEsSUFBQyxDQUFBLGdCQUFELENBQWtCLE1BQWxCO2FBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmLEVBdEJKOztFQUZJOzs7QUEwQlI7Ozs7Ozs7a0JBTUEsZ0JBQUEsR0FBa0IsU0FBQyxNQUFEO0FBQ2QsUUFBQTtJQUFBLFlBQUEsR0FBZSxNQUFNLENBQUM7SUFDdEIsSUFBRyxJQUFDLENBQUEsVUFBSjtNQUNJLE1BQU0sQ0FBQyxVQUFQLEdBQW9CO0FBQ3BCO1dBQUEsNENBQUE7O1FBQ0ksSUFBRyxDQUFDLENBQUMsVUFBTDtVQUNJLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLE1BQU0sQ0FBQyxRQUFQLENBQWdCLENBQUMsQ0FBQyxVQUFsQjtVQUNwQixJQUFHLENBQUMsTUFBTSxDQUFDLGlCQUFQLENBQXlCLGtCQUF6QixDQUFKO3lCQUNJLE1BQU0sQ0FBQyxZQUFQLENBQXdCLElBQUEsRUFBRSxDQUFDLDBCQUFILENBQUEsQ0FBeEIsRUFBeUQsa0JBQXpELEdBREo7V0FBQSxNQUFBO2lDQUFBO1dBRko7U0FBQSxNQUFBOytCQUFBOztBQURKO3FCQUZKOztFQUZjOzs7QUFVbEI7Ozs7Ozs7a0JBTUEsYUFBQSxHQUFlLFNBQUMsTUFBRDtBQUNYLFFBQUE7SUFBQSxZQUFBLEdBQWUsTUFBTSxDQUFDO0lBQ3RCLElBQUcsSUFBQyxDQUFBLE9BQUo7TUFDSSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUF0QixHQUFpQztNQUNqQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUF0QixHQUFtQztBQUNuQztXQUFBLDRDQUFBOztRQUNJLElBQUcsQ0FBQyxDQUFDLE9BQUw7VUFDSSxJQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFsQjtZQUNJLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBZCxDQUFBO1lBQ0EsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsTUFBTSxDQUFDLE1BQTlCO1lBQ0EsTUFBTSxDQUFDLE1BQVAsR0FBb0IsSUFBQSxFQUFFLENBQUMsc0JBQUgsQ0FBQTtZQUNwQixNQUFNLENBQUMsWUFBUCxDQUFvQixNQUFNLENBQUMsTUFBM0IsRUFKSjs7VUFNQSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUF0QixHQUFpQyxDQUFDLENBQUMsT0FBTyxDQUFDO3VCQUMzQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUF0QixHQUFtQyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBUmpEO1NBQUEsTUFBQTsrQkFBQTs7QUFESjtxQkFISjs7RUFGVzs7Ozs7O0FBZ0JuQixFQUFFLENBQUMsS0FBSCxHQUFXOztBQUVMOztBQUNGOzs7Ozs7Ozs7RUFTYSxtQkFBQTs7QUFDVDs7Ozs7SUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXOztBQUVYOzs7OztJQUtBLElBQUMsQ0FBQSxNQUFELEdBQVU7O0FBRVY7Ozs7O0lBS0EsSUFBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSxLQUFBLENBQUE7O0FBRWxCOzs7OztJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCOztBQUVoQjs7Ozs7SUFLQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7OztJQUtBLElBQUMsQ0FBQSxXQUFELEdBQWU7O0FBRWY7Ozs7O0lBS0EsSUFBQyxDQUFBLFdBQUQsR0FBZTs7QUFFZjs7Ozs7O0lBTUEsSUFBQyxDQUFBLFVBQUQsR0FBYztNQUFFLE1BQUEsRUFBUSxDQUFWO01BQWEsS0FBQSxFQUFPLENBQXBCO01BQXVCLFFBQUEsRUFBVSxDQUFqQztNQUFvQyxRQUFBLEVBQVUsQ0FBOUM7TUFBaUQsT0FBQSxFQUFTLENBQTFEO01BQTZELEdBQUEsRUFBSyxDQUFsRTtNQUFxRSxHQUFBLEVBQUssQ0FBMUU7TUFBNkUsR0FBQSxFQUFLLENBQWxGOzs7QUFFZDs7Ozs7O0lBTUEsSUFBQyxDQUFBLFVBQUQsR0FBYztNQUFFLFFBQUEsRUFBVSxDQUFaO01BQWUsS0FBQSxFQUFPLENBQXRCO01BQXlCLEtBQUEsRUFBTyxDQUFoQzs7O0FBRWQ7Ozs7O0lBS0EsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUFFLE1BQUEsRUFBUSxDQUFWO01BQWEsS0FBQSxFQUFPLENBQXBCO01BQXVCLFFBQUEsRUFBVSxDQUFqQztNQUFvQyxPQUFBLEVBQVMsQ0FBN0M7TUFBZ0QsT0FBQSxFQUFTLENBQXpEOztJQUNiLElBQUMsQ0FBQSx3QkFBRCxHQUE0QjtFQXhFbkI7OztBQTBFYjs7Ozs7O3NCQUtBLEtBQUEsR0FBTyxTQUFBO1dBQ0gsSUFBQyxDQUFBLFdBQUQsQ0FBQTtFQURHOzs7QUFHUDs7Ozs7OztzQkFNQSxXQUFBLEdBQWEsU0FBQTtBQUNULFFBQUE7SUFBQSxFQUFBLEdBQUs7SUFDTCxXQUFBLEdBQWMsSUFBQyxDQUFBO0FBQ2YsU0FBQSxnQkFBQTtNQUNJLElBQUEsR0FBTyxDQUFDLENBQUMsS0FBRixDQUFRLEdBQVI7TUFDUCxRQUFBLEdBQVcsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQVIsQ0FBYyxHQUFkO01BRVgsSUFBRyxXQUFZLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBVCxDQUFmO1FBQ0ksSUFBQyxDQUFBLFVBQVcsQ0FBQSxFQUFBLENBQVosR0FBc0IsSUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFqQixFQUFxQixFQUFyQixFQUF5QixXQUFZLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBVCxDQUFyQyxFQUQxQjtPQUFBLE1BQUE7UUFHSSxJQUFDLENBQUEsVUFBVyxDQUFBLEVBQUEsQ0FBWixHQUFzQixJQUFBLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQWpCLEVBQXFCLEVBQXJCLEVBQXlCLENBQXpCLEVBSDFCOztNQUtBLElBQUcsQ0FBQyxJQUFDLENBQUEsWUFBYSxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQVQsQ0FBbEI7UUFDSSxJQUFDLENBQUEsWUFBYSxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQVQsQ0FBZCxHQUE2QixHQURqQzs7TUFHQSxJQUFDLENBQUEsWUFBYSxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQVQsQ0FBWSxDQUFDLElBQTNCLENBQWdDLElBQUMsQ0FBQSxVQUFXLENBQUEsRUFBQSxDQUE1QztNQUNBLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFSLEdBQWEsSUFBQyxDQUFBLFVBQVcsQ0FBQSxFQUFBO01BRXpCLEVBQUE7QUFmSjtBQWlCQSxTQUFBLGdCQUFBO01BQ0ksSUFBQSxHQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsR0FBUjtNQUNQLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFqQjtRQUNJLElBQUMsQ0FBQSxZQUFhLENBQUEsSUFBSyxDQUFBLENBQUEsQ0FBTCxDQUFRLENBQUMsSUFBdkIsQ0FBNEIsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQXBDO1FBQ0EsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFYLHFEQUE0QyxDQUFFLFlBRmxEOztBQUZKO0FBUUEsV0FBTztFQTVCRTs7O0FBOEJiOzs7Ozs7Ozs7O3NCQVNBLDBCQUFBLEdBQTRCLFNBQUMsVUFBRCxFQUFhLEVBQWIsRUFBaUIsTUFBakI7QUFDeEIsUUFBQTtJQUFBLElBQWMsa0JBQWQ7QUFBQSxhQUFBOztJQUNBLElBQUEsR0FBTyxNQUFNLENBQUMsSUFBUCxDQUFZLFVBQVo7QUFFUCxTQUFBLHNDQUFBOztNQUNJLENBQUEsR0FBSSxVQUFXLENBQUEsQ0FBQTtNQUNmLElBQUcsU0FBSDtRQUNJLElBQUcsQ0FBQSxZQUFhLEtBQWhCO0FBQ0ksZUFBQSw2Q0FBQTs7WUFDSSxJQUFHLFNBQUg7Y0FDSSxJQUFHLE9BQU8sQ0FBUCxLQUFZLFFBQWY7Z0JBQ0ksSUFBQyxDQUFBLDBCQUFELENBQTRCLENBQTVCLEVBQStCLEVBQS9CLEVBQW1DLE1BQW5DLEVBREo7ZUFBQSxNQUVLLElBQUcsQ0FBQSxLQUFLLE1BQUwsSUFBZ0IsT0FBTyxDQUFQLEtBQVksVUFBL0I7Z0JBQ0QsTUFBTSxDQUFDLENBQVAsR0FBVyxNQUFBLElBQVcsSUFBQyxDQUFBO2dCQUN2QixNQUFNLENBQUMsQ0FBUCxHQUFXO2dCQUNYLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxDQUFBLENBQUEsRUFITjtlQUhUOztBQURKLFdBREo7U0FBQSxNQVNLLElBQUcsT0FBTyxDQUFQLEtBQVksUUFBZjtVQUNELElBQUMsQ0FBQSwwQkFBRCxDQUE0QixDQUE1QixFQUErQixFQUEvQixFQUFtQyxNQUFuQyxFQURDO1NBQUEsTUFFQSxJQUFHLENBQUEsS0FBSyxPQUFMLElBQWlCLE9BQU8sQ0FBUCxLQUFZLFVBQWhDO1VBQ0QsTUFBTSxDQUFDLENBQVAsR0FBVyxNQUFBLElBQVUsSUFBQyxDQUFBO1VBQ3RCLE1BQU0sQ0FBQyxDQUFQLEdBQVc7VUFDWCxVQUFXLENBQUEsQ0FBQSxDQUFYLEdBQWdCLENBQUEsQ0FBQSxFQUhmO1NBWlQ7O0FBRko7QUFrQkEsV0FBTztFQXRCaUI7OztBQXdCNUI7Ozs7Ozs7OztzQkFRQSxrQkFBQSxHQUFvQixTQUFDLFVBQUQ7SUFDaEIsVUFBQSxHQUFhLFVBQVUsQ0FBQyxPQUFYLENBQW1CLGFBQW5CLEVBQWtDLGdCQUFsQztBQUNiLFdBQU8sSUFBQSxDQUFLLHVCQUFBLEdBQTBCLFVBQTFCLEdBQXVDLElBQTVDO0VBRlM7OztBQUlwQjs7Ozs7Ozs7OztzQkFTQSxZQUFBLEdBQWMsU0FBQyxJQUFEO0FBQ1YsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVg7QUFDUCxXQUFXLElBQUEsTUFBTyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUwsQ0FBUyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUwsQ0FBaEIsQ0FBQTtFQUZEOzs7QUFJZDs7Ozs7Ozs7O3NCQVFBLG9CQUFBLEdBQXNCLFNBQUMsVUFBRCxFQUFhLE1BQWI7QUFDbEIsUUFBQTtJQUFBLE9BQUEsR0FBVTtBQUVWLFNBQUEscUJBQUE7TUFDSSxJQUFHLGdDQUFIO1FBQ0ksSUFBQyxDQUFBLFdBQVksQ0FBQSxDQUFBLENBQWIsR0FBa0IsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsV0FBWSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQTlCLEVBRHRCOztBQURKO1dBSUEsSUFBQyxDQUFBLHFCQUFELENBQXVCLFVBQXZCLEVBQW1DLE1BQW5DO0VBUGtCOzs7QUFVdEI7Ozs7Ozs7O3NCQU9BLGlCQUFBLEdBQW1CLFNBQUMsVUFBRDtBQUNmLFFBQUE7SUFBQSxPQUFBLEdBQWMsSUFBQSxFQUFFLENBQUMsY0FBSCxDQUFrQixVQUFVLENBQUMsS0FBN0IsRUFBb0MsVUFBVSxDQUFDLGFBQS9DO0lBRWQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFqQixHQUF5QixVQUFVLENBQUM7SUFDcEMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFqQixHQUEwQixVQUFVLENBQUM7SUFDckMsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsVUFBVSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLFVBQVUsQ0FBQztJQUM1QixJQUFHLDhCQUFIO01BQ0ksT0FBTyxDQUFDLFdBQVIsR0FBc0IsVUFBVSxDQUFDLFlBRHJDOztJQUdBLElBQUcsMEJBQUg7TUFDSSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQWYsQ0FBQTtNQUNBLE9BQU8sQ0FBQyxlQUFSLENBQXdCLE9BQU8sQ0FBQyxNQUFoQztNQUNBLE9BQU8sQ0FBQyxNQUFSLEdBQXFCLElBQUEsRUFBRSxDQUFDLHNCQUFILENBQUE7TUFDckIsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsT0FBTyxDQUFDLE1BQTdCO01BRUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBdkIsR0FBa0MsVUFBVSxDQUFDLE9BQU8sQ0FBQztNQUNyRCxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUF2QixHQUFvQyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBUDNEOztJQVFBLElBQUcsd0JBQUg7TUFDSSxPQUFPLENBQUMsS0FBUixHQUFnQixLQUFLLENBQUMsU0FBTixDQUFnQixVQUFVLENBQUMsS0FBM0IsRUFEcEI7O0FBR0EsV0FBTztFQXJCUTs7O0FBdUJuQjs7Ozs7Ozs7c0JBT0EsV0FBQSxHQUFhLFNBQUMsVUFBRDtBQUNULFFBQUE7SUFBQSxPQUFBLEdBQWMsSUFBQSxFQUFFLENBQUMsWUFBSCxDQUFnQixVQUFVLENBQUMsS0FBM0IsRUFBa0MsVUFBVSxDQUFDLGFBQTdDLEVBQTRELFVBQVUsQ0FBQyxXQUF2RTtJQUVkLElBQUcsOEJBQUg7TUFDSSxPQUFPLENBQUMsV0FBUixHQUFzQixVQUFVLENBQUMsWUFEckM7O0lBR0EsSUFBRywwQkFBSDtNQUNJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBZixDQUFBO01BQ0EsT0FBTyxDQUFDLGVBQVIsQ0FBd0IsT0FBTyxDQUFDLE1BQWhDO01BQ0EsT0FBTyxDQUFDLE1BQVIsR0FBcUIsSUFBQSxFQUFFLENBQUMsc0JBQUgsQ0FBQTtNQUNyQixPQUFPLENBQUMsWUFBUixDQUFxQixPQUFPLENBQUMsTUFBN0I7TUFFQSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUF2QixHQUFrQyxVQUFVLENBQUMsT0FBTyxDQUFDO01BQ3JELE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQXZCLEdBQW9DLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FQM0Q7O0lBUUEsSUFBRyx3QkFBSDtNQUNJLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLEtBQUssQ0FBQyxTQUFOLENBQWdCLFVBQVUsQ0FBQyxLQUEzQixFQURwQjs7QUFHQSxXQUFPO0VBakJFOzs7QUFtQmI7Ozs7Ozs7O3NCQU9BLGNBQUEsR0FBZ0IsU0FBQyxVQUFEO0FBQ1osUUFBQTtJQUFBLE9BQUEsR0FBYyxJQUFBLEVBQUUsQ0FBQyxlQUFILENBQUE7SUFDZCxPQUFPLENBQUMsUUFBUixHQUFtQixDQUFDLFVBQVUsQ0FBQyxRQUFYLElBQXFCLEVBQXRCLENBQXlCLENBQUMsTUFBMUIsQ0FBaUMsU0FBQyxDQUFEO2FBQ2hEO1FBQUUsQ0FBQSxFQUFHLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFaO1FBQWdCLENBQUEsRUFBRyxDQUFDLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBMUI7UUFBOEIsSUFBQSxFQUFNO1VBQUUsS0FBQSxFQUFPLENBQUMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFoQjtVQUFvQixNQUFBLEVBQVEsQ0FBQyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQW5DO1NBQXBDO1FBQTZFLElBQUEsRUFBTTtVQUFFLE1BQUEsRUFBUSxDQUFWO1VBQWEsT0FBQSxFQUFTLENBQUMsQ0FBQyxPQUF4QjtTQUFuRjs7SUFEZ0QsQ0FBakM7SUFFbkIsT0FBTyxDQUFDLE1BQVIsR0FBaUIsVUFBVSxDQUFDO0lBQzVCLE9BQU8sQ0FBQyxlQUFSLENBQTRCLElBQUEsRUFBRSxDQUFDLHVCQUFILENBQUEsQ0FBNUIsRUFBMEQsQ0FBMUQsRUFBNkQsZUFBN0Q7SUFDQSxPQUFPLENBQUMsTUFBUixHQUFpQixZQUFZLENBQUMsS0FBSyxDQUFDO0lBQ3BDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZixHQUFxQyxJQUFBLEVBQUUsQ0FBQyxrQkFBSCxDQUFzQixZQUFZLENBQUMsS0FBSyxDQUFDLFVBQXpDLEVBQXFELFlBQVksQ0FBQyxLQUFsRTtBQUVyQyxXQUFPO0VBVEs7OztBQVdoQjs7Ozs7Ozs7c0JBT0EsV0FBQSxHQUFhLFNBQUMsVUFBRDtBQUNULFFBQUE7SUFBQSxPQUFBLEdBQWMsSUFBQSxFQUFFLENBQUMsWUFBSCxDQUFBO0lBQ2QsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsVUFBVSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxJQUFSLDJDQUFpQztBQUVqQyxXQUFPO0VBTEU7OztBQVFiOzs7Ozs7OztzQkFPQSxXQUFBLEdBQWEsU0FBQyxVQUFEO0FBQ1QsUUFBQTtJQUFBLE9BQUEsR0FBYyxJQUFBLEVBQUUsQ0FBQyxZQUFILENBQUE7SUFDZCxPQUFPLENBQUMsS0FBUiw0Q0FBbUM7SUFDbkMsSUFBRyx3QkFBSDtNQUNJLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLEtBQUssQ0FBQyxTQUFOLENBQWdCLFVBQVUsQ0FBQyxLQUEzQixFQURwQjs7QUFHQSxXQUFPO0VBTkU7OztBQVFiOzs7Ozs7OztzQkFPQSxXQUFBLEdBQWEsU0FBQyxVQUFEO0FBQ1QsUUFBQTtJQUFBLE9BQUEsR0FBYyxJQUFBLEVBQUUsQ0FBQyxZQUFILENBQWdCLFVBQVUsQ0FBQyxTQUEzQjtJQUNkLE9BQU8sQ0FBQyxjQUFSLEdBQXlCLFVBQVUsQ0FBQyxjQUFYLElBQTZCO0lBQ3RELE9BQU8sQ0FBQyxlQUFSLEdBQTBCLFVBQVUsQ0FBQyxlQUFYLElBQThCO0lBQ3hELE9BQU8sQ0FBQyxLQUFSLEdBQWdCLFVBQVUsQ0FBQztJQUMzQixPQUFPLENBQUMsTUFBUixHQUFpQixVQUFVLENBQUM7QUFFNUIsV0FBTztFQVBFOzs7QUFTYjs7Ozs7Ozs7c0JBT0Esb0JBQUEsR0FBc0IsU0FBQyxVQUFEO0FBQ2xCLFFBQUE7SUFBQSxPQUFBLEdBQWMsSUFBQSxFQUFFLENBQUMscUJBQUgsQ0FBeUIsVUFBVSxDQUFDLFNBQXBDO0lBQ2QsT0FBTyxDQUFDLGFBQVIsR0FBd0IsVUFBVSxDQUFDLGFBQVgsSUFBNEI7SUFDcEQsT0FBTyxDQUFDLGNBQVIsR0FBeUIsVUFBVSxDQUFDLGNBQVgsSUFBNkI7SUFDdEQsT0FBTyxDQUFDLFlBQVIsR0FBdUIsVUFBVSxDQUFDLFlBQVgsSUFBMkI7SUFDbEQsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsVUFBVSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLFVBQVUsQ0FBQztBQUU1QixXQUFPO0VBUlc7OztBQVV0Qjs7Ozs7Ozs7c0JBT0EsVUFBQSxHQUFZLFNBQUMsVUFBRDtBQUNSLFFBQUE7SUFBQSxPQUFBLEdBQWMsSUFBQSxFQUFFLENBQUMsV0FBSCxDQUFBO0lBQ2QsT0FBTyxDQUFDLElBQVIsR0FBZSxHQUFBLENBQUksVUFBVSxDQUFDLElBQWY7SUFDZixPQUFPLENBQUMsU0FBUixHQUFvQixVQUFVLENBQUM7SUFDL0IsT0FBTyxDQUFDLFVBQVIsR0FBcUIsVUFBVSxDQUFDO0lBQ2hDLE9BQU8sQ0FBQyxRQUFSLCtDQUF5QztJQUN6QyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQWpCLEdBQTBCLFVBQVUsQ0FBQztJQUNyQyxJQUFHLFVBQVUsQ0FBQyxXQUFkO01BQ0ksT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFqQixHQUEyQixFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVQsQ0FBbUIsVUFBVSxDQUFDLFdBQTlCLEVBRC9COztJQUVBLElBQUcsc0NBQUg7TUFDSSxPQUFPLENBQUMsbUJBQVIsR0FBOEIsVUFBVSxDQUFDLG9CQUQ3Qzs7SUFFQSxJQUFHLHdCQUFIO01BQ0ksT0FBTyxDQUFDLEtBQVIsR0FBZ0IsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsVUFBVSxDQUFDLEtBQTNCLEVBRHBCOztBQUdBLFdBQU87RUFkQzs7O0FBZ0JaOzs7Ozs7OztzQkFPQSxnQkFBQSxHQUFrQixTQUFDLFVBQUQ7QUFDZCxRQUFBO0lBQUEsSUFBRyx3QkFBSDtNQUNJLE9BQUEsR0FBYyxJQUFBLEVBQUUsQ0FBQyxpQkFBSCxDQUFxQixVQUFVLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBakIsSUFBdUIsQ0FBNUMsRUFBK0MsVUFBVSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWpCLElBQXVCLENBQXRFLEVBQXlFLFVBQVUsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFqQixJQUF1QixDQUFoRyxFQUFtRyxVQUFVLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBakIsSUFBdUIsQ0FBMUgsRUFEbEI7S0FBQSxNQUFBO01BR0ksT0FBQSxHQUFjLElBQUEsRUFBRSxDQUFDLGlCQUFILENBQXFCLENBQXJCLEVBQXdCLENBQXhCLEVBQTJCLENBQTNCLEVBQThCLENBQTlCLEVBSGxCOztJQUlBLE9BQU8sQ0FBQyxTQUFSLEdBQW9CLFVBQVUsQ0FBQztBQUUvQixXQUFPO0VBUE87OztBQVNsQjs7Ozs7Ozs7c0JBT0EsaUJBQUEsR0FBbUIsU0FBQyxVQUFEO0FBQ2YsUUFBQTtJQUFBLElBQUcsd0JBQUg7TUFDSSxPQUFBLEdBQWMsSUFBQSxFQUFFLENBQUMsa0JBQUgsQ0FBc0IsVUFBVSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWpCLElBQXVCLENBQTdDLEVBQWdELFVBQVUsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFqQixJQUF1QixDQUF2RSxFQUEwRSxVQUFVLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBakIsSUFBdUIsQ0FBakcsRUFBb0csVUFBVSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWpCLElBQXVCLENBQTNILEVBQThILFVBQVUsQ0FBQyxXQUF6SSxFQURsQjtLQUFBLE1BQUE7TUFHSSxPQUFBLEdBQWMsSUFBQSxFQUFFLENBQUMsa0JBQUgsQ0FBc0IsQ0FBdEIsRUFBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFBK0IsQ0FBL0IsRUFBa0MsVUFBVSxDQUFDLFdBQTdDLEVBSGxCOztJQUlBLE9BQU8sQ0FBQyxTQUFSLEdBQW9CLFVBQVUsQ0FBQztBQUUvQixXQUFPO0VBUFE7OztBQVNuQjs7Ozs7Ozs7c0JBT0Esa0JBQUEsR0FBb0IsU0FBQyxVQUFEO0FBQ2hCLFFBQUE7SUFBQSxJQUFHLHdCQUFIO01BQ0ksT0FBQSxHQUFjLElBQUEsRUFBRSxDQUFDLG1CQUFILENBQXVCLFVBQVUsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFqQixJQUF1QixDQUE5QyxFQUFpRCxVQUFVLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBakIsSUFBdUIsQ0FBeEUsRUFBMkUsVUFBVSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWpCLElBQXVCLENBQWxHLEVBQXFHLFVBQVUsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFqQixJQUF1QixDQUE1SCxFQUErSCxVQUFVLENBQUMsV0FBMUksRUFEbEI7S0FBQSxNQUFBO01BR0ksT0FBQSxHQUFjLElBQUEsRUFBRSxDQUFDLG1CQUFILENBQXVCLENBQXZCLEVBQTBCLENBQTFCLEVBQTZCLENBQTdCLEVBQWdDLENBQWhDLEVBQW1DLFVBQVUsQ0FBQyxXQUE5QyxFQUhsQjs7QUFLQSxXQUFPO0VBTlM7OztBQVFwQjs7Ozs7Ozs7c0JBT0EsZ0JBQUEsR0FBa0IsU0FBQyxVQUFEO0FBQ2QsUUFBQTtJQUFBLElBQUcsd0JBQUg7TUFDSSxPQUFBLEdBQWMsSUFBQSxFQUFFLENBQUMsaUJBQUgsQ0FBcUIsVUFBVSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXRDLEVBQTBDLFVBQVUsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUEzRCxFQUErRCxVQUFVLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBaEYsRUFBb0YsVUFBVSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXJHLEVBQXlHLFVBQVUsQ0FBQyxJQUFwSCxFQUEwSCxVQUFVLENBQUMsT0FBckksRUFBOEksVUFBVSxDQUFDLFFBQXpKLEVBRGxCO0tBQUEsTUFBQTtNQUdJLE9BQUEsR0FBYyxJQUFBLEVBQUUsQ0FBQyxpQkFBSCxDQUFxQixDQUFyQixFQUF3QixDQUF4QixFQUEyQixDQUEzQixFQUE4QixDQUE5QixFQUFpQyxVQUFVLENBQUMsSUFBNUMsRUFBa0QsVUFBVSxDQUFDLE9BQTdELEVBQXNFLFVBQVUsQ0FBQyxRQUFqRixFQUhsQjs7SUFJQSxPQUFPLENBQUMsV0FBUixHQUFzQixVQUFVLENBQUMsV0FBWCxJQUEwQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVY7SUFDaEQsT0FBTyxDQUFDLFNBQVIsR0FBb0IsVUFBVSxDQUFDO0FBRS9CLFdBQU87RUFSTzs7O0FBVWxCOzs7Ozs7OztzQkFPQSxhQUFBLEdBQWUsU0FBQyxVQUFEO0FBQ1gsUUFBQTtJQUFBLE9BQUEsR0FBYyxJQUFBLEVBQUUsQ0FBQyxjQUFILENBQUE7QUFFZCxXQUFPO0VBSEk7OztBQUtmOzs7Ozs7OztzQkFPQSxjQUFBLEdBQWdCLFNBQUMsVUFBRDtBQUNaLFFBQUE7SUFBQSxPQUFBLEdBQWMsSUFBQSxFQUFFLENBQUMsZUFBSCxDQUFtQixVQUFuQjtBQUVkLFdBQU87RUFISzs7O0FBS2hCOzs7Ozs7Ozs7c0JBUUEsYUFBQSxHQUFlLFNBQUMsVUFBRDtBQUNYLFFBQUE7SUFBQSxPQUFBLEdBQVU7QUFFVixZQUFPLFVBQVUsQ0FBQyxJQUFsQjtBQUFBLFdBQ1MsZ0JBRFQ7UUFFUSxPQUFBLEdBQVUsSUFBQyxDQUFBLGlCQUFELENBQW1CLFVBQW5CO0FBRFQ7QUFEVCxXQUdTLFVBSFQ7UUFJUSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQUQsQ0FBYSxVQUFiO0FBRFQ7QUFIVCxXQUtTLGFBTFQ7UUFNUSxPQUFBLEdBQVUsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsVUFBaEI7QUFEVDtBQUxULFdBT1MsVUFQVDtRQVFRLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBRCxDQUFhLFVBQWI7QUFEVDtBQVBULFdBU1MsVUFUVDtRQVVRLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBRCxDQUFhLFVBQWI7QUFEVDtBQVRULFdBV1MsVUFYVDtRQVlRLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBRCxDQUFhLFVBQWI7QUFEVDtBQVhULFdBYVMsbUJBYlQ7UUFjUSxPQUFBLEdBQVUsSUFBQyxDQUFBLG9CQUFELENBQXNCLFVBQXRCO0FBRFQ7QUFiVCxXQWVTLFNBZlQ7UUFnQlEsT0FBQSxHQUFVLElBQUMsQ0FBQSxVQUFELENBQVksVUFBWjtBQURUO0FBZlQsV0FpQlMsWUFqQlQ7UUFrQlEsT0FBQSxHQUFVLElBQUMsQ0FBQSxhQUFELENBQWUsVUFBZjtBQURUO0FBakJULFdBbUJTLGFBbkJUO1FBb0JRLE9BQUEsR0FBVSxJQUFDLENBQUEsY0FBRCxDQUFnQixVQUFoQjtBQURUO0FBbkJULFdBcUJTLGVBckJUO1FBc0JRLE9BQUEsR0FBVSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsVUFBbEI7QUFEVDtBQXJCVCxXQXVCUyxnQkF2QlQ7UUF3QlEsT0FBQSxHQUFVLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixVQUFuQjtBQURUO0FBdkJULFdBeUJTLGlCQXpCVDtRQTBCUSxPQUFBLEdBQVUsSUFBQyxDQUFBLGtCQUFELENBQW9CLFVBQXBCO0FBRFQ7QUF6QlQsV0EyQlMsZUEzQlQ7UUE0QlEsT0FBQSxHQUFVLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixVQUFsQjtBQTVCbEI7QUE4QkEsV0FBTztFQWpDSTs7c0JBb0NmLGdCQUFBLEdBQWtCLFNBQUMsS0FBRCxFQUFRLE9BQVI7QUFDZCxRQUFBO0lBQUEsSUFBRyxDQUFDLE9BQU8sQ0FBQyxVQUFaO01BQ0ksT0FBTyxDQUFDLFVBQVIsR0FBeUIsSUFBQSxFQUFFLENBQUMsVUFBSCxDQUFBLEVBRDdCOztJQUVBLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBbkIsQ0FBdUIsQ0FBdkIsRUFBMEIsQ0FBMUIsRUFBNkIsQ0FBN0IsRUFBZ0MsQ0FBaEM7SUFFQSxJQUFHLGFBQUg7TUFDSSxJQUFHLHdEQUFIO1FBQ0ksT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFuQixHQUF1QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsS0FBTSxDQUFBLENBQUEsQ0FBMUI7UUFDdkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFoQixHQUFvQixFQUZ4QjtPQUFBLE1BQUE7UUFJSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQWhCLGlEQUEyQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBSi9EOztNQU1BLElBQUcsMERBQUg7UUFDSSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQW5CLEdBQXVCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixLQUFNLENBQUEsQ0FBQSxDQUExQjtRQUN2QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQWhCLEdBQW9CLEVBRnhCO09BQUEsTUFBQTtRQUlJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBaEIsc0NBQWdDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFKcEQ7O01BTUEsSUFBRywwREFBSDtRQUNJLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBbkIsR0FBMkIsSUFBQyxDQUFBLGtCQUFELENBQW9CLEtBQU0sQ0FBQSxDQUFBLENBQTFCO1FBQzNCLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBaEIsR0FBd0IsRUFGNUI7T0FBQSxNQUFBO1FBSUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFoQixzQ0FBb0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUp4RDs7TUFNQSxJQUFHLDBEQUFIO1FBQ0ksT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFuQixHQUE0QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsS0FBTSxDQUFBLENBQUEsQ0FBMUI7ZUFDNUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFoQixHQUF5QixFQUY3QjtPQUFBLE1BQUE7ZUFJSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQWhCLHNDQUFxQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BSnpEO09BbkJKOztFQUxjOzs7QUErQmxCOzs7Ozs7OztzQkFPQSxnQkFBQSxHQUFrQixTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2QsUUFBQTtBQUFBO1NBQUEsd0NBQUE7O01BQ0ksSUFBRyxvQ0FBSDs7O0FBQ0k7QUFBQTtlQUFBLHVDQUFBOztZQUNJLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBZixDQUFvQixLQUFwQjtZQUNBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBQyxDQUFqQixJQUF1QixLQUFLLENBQUMsUUFBTixLQUFrQixDQUE1Qzs0QkFDSSxLQUFLLENBQUMsS0FBTixDQUFZLE9BQVosR0FESjthQUFBLE1BQUE7b0NBQUE7O0FBRko7O3VCQURKO09BQUEsTUFBQTs2QkFBQTs7QUFESjs7RUFEYzs7O0FBT2xCOzs7Ozs7Ozs7Ozs7c0JBV0EsMkJBQUEsR0FBNkIsU0FBQyxVQUFELEVBQWEsTUFBYixFQUFxQixLQUFyQjtBQUN6QixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBRVYsSUFBRyx3QkFBSDtNQUNJLFVBQVUsQ0FBQyxNQUFYLEdBQW9CLENBQUMsVUFBVSxDQUFDLEtBQVo7TUFDcEIsT0FBTyxVQUFVLENBQUMsTUFGdEI7O0lBSUEsVUFBQSxHQUFhLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFVBQWhCO0lBQ2IsSUFBQyxDQUFBLDBCQUFELENBQTRCLFVBQTVCLEVBQXdDLFVBQVUsQ0FBQyxFQUFuRCxFQUF1RCxVQUFVLENBQUMsTUFBbEU7SUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGFBQUQsQ0FBZSxVQUFmO0lBRVYsSUFBTyxlQUFQO01BQ0ksSUFBQSxHQUFPLE1BQU0sQ0FBQyxRQUFQLENBQWdCLElBQUMsQ0FBQSxXQUFZLENBQUEsVUFBVSxDQUFDLElBQVgsQ0FBN0I7TUFFUCxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsSUFBNUIsRUFBa0MsVUFBVSxDQUFDLEVBQTdDLEVBQWlELFVBQVUsQ0FBQyxNQUE1RDtNQUVBLFFBQUEsR0FBVyxJQUFJLENBQUM7TUFDaEIsWUFBQSxHQUFlLElBQUksQ0FBQztNQUNwQixRQUFBLEdBQVcsSUFBSSxDQUFDO01BQ2hCLFFBQUEsR0FBVyxJQUFJLENBQUM7TUFDaEIsT0FBQSxHQUFVLElBQUksQ0FBQztNQUNmLElBQUcsa0JBQUg7UUFDSSxJQUFJLENBQUMsTUFBTCxHQUFjLENBQUMsSUFBSSxDQUFDLEtBQU47UUFDZCxJQUFJLENBQUMsS0FBTCxHQUFhLEtBRmpCOztNQUlBLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBYixFQUFtQixVQUFuQjtNQUNBLElBQUcsb0JBQUg7UUFBc0IsTUFBTSxDQUFDLEtBQVAsQ0FBYSxJQUFJLENBQUMsWUFBbEIsRUFBZ0MsWUFBaEMsRUFBdEI7O01BQ0EsSUFBRyxrQkFBQSxJQUFjLFFBQUEsS0FBWSxJQUFJLENBQUMsUUFBbEM7UUFBZ0QsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFkLENBQXFCLFFBQXJCLEVBQWhFOztNQUNBLElBQUcsa0JBQUEsSUFBYyxRQUFBLEtBQVksSUFBSSxDQUFDLFFBQWxDO1FBQWdELElBQUksQ0FBQyxRQUFMLEdBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBZCxDQUFxQixRQUFyQixFQUFoRTs7TUFDQSxJQUFHLGlCQUFBLElBQWEsT0FBQSxLQUFXLElBQUksQ0FBQyxPQUFoQztRQUE2QyxJQUFJLENBQUMsT0FBTCxHQUFlLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBSSxDQUFDLE9BQXBCLEVBQTVEOztNQUNBLElBQUksQ0FBQyxJQUFMLEdBQVk7QUFFWixhQUFPLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixJQUE3QixFQUFtQyxNQUFuQyxFQXJCWDtLQUFBLE1Bc0JLLElBQUcsY0FBSDtNQUNELE1BQU0sQ0FBQyxTQUFQLENBQWlCLE9BQWpCO01BQ0EsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsTUFGZjtLQUFBLE1BQUE7TUFJRCxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxTQUF6QixDQUFtQyxPQUFuQyxFQUpDOztJQU1MLE9BQU8sQ0FBQyxFQUFSLEdBQWlCLElBQUEsRUFBRSxDQUFDLG9CQUFILENBQUE7SUFDakIsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsT0FBTyxDQUFDLEVBQTdCO0lBSUEsT0FBTyxDQUFDLE1BQVIsR0FBaUIsVUFBVSxDQUFDO0lBRTVCLElBQUcsVUFBVSxDQUFDLGNBQVgsS0FBNkIsWUFBaEM7TUFDSSxPQUFPLENBQUMsY0FBUixHQUF5QixFQUFFLENBQUMsY0FBYyxDQUFDLFdBRC9DOztJQUdBLElBQUcsVUFBVSxDQUFDLGlCQUFkO01BQ0ksT0FBTyxDQUFDLGlCQUFSLEdBQTRCLEtBRGhDOztJQUdBLElBQUcsdUJBQUg7TUFDSSxPQUFPLENBQUMsSUFBUixHQUFtQixJQUFBLElBQUEsQ0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQXJCLEVBQTJCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBM0M7TUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFiLGdEQUEyQyxPQUFPLENBQUMsSUFBSSxDQUFDO01BQ3hELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBYixvREFBK0MsT0FBTyxDQUFDLElBQUksQ0FBQztNQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQWIsdURBQXFELE9BQU8sQ0FBQyxJQUFJLENBQUM7TUFDbEUsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFiLHVEQUFxRCxPQUFPLENBQUMsSUFBSSxDQUFDO01BQ2xFLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYiwyREFBNkQsT0FBTyxDQUFDLElBQUksQ0FBQztNQUUxRSxJQUFHLDZCQUFIO1FBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFiLEdBQXFCLEtBQUssQ0FBQyxTQUFOLENBQWdCLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBaEMsRUFEekI7O01BRUEsSUFBRyw4QkFBSDtRQUNJLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBYixvREFBK0M7UUFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFiLHdEQUF1RDtRQUd2RCxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQWIsR0FBK0IsSUFBQSxLQUFBLENBQU0sQ0FBTixFQUFTLENBQVQsRUFBWSxDQUFaLEVBTG5DOztNQU9BLElBQUcsK0JBQUg7UUFDSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQWIscURBQWdEO1FBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBYiwwREFBeUQ7UUFFekQsSUFBRyxxQ0FBSDtVQUNJLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBYixHQUEyQixLQUFLLENBQUMsU0FBTixDQUFnQixVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUF4QyxFQUQvQjtTQUFBLE1BQUE7VUFHSSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQWIsR0FBK0IsSUFBQSxLQUFBLENBQU0sQ0FBTixFQUFTLENBQVQsRUFBWSxDQUFaLEVBSG5DO1NBSko7T0FqQko7O0lBMEJBLElBQUcsNkJBQUg7QUFDSTtBQUFBLFdBQUEsc0NBQUE7O1FBQ0ksQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFGLElBQVk7UUFDaEIsU0FBQSxHQUFnQixJQUFBLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFDLENBQUMsSUFBRixDQUFWLENBQWtCLENBQUMsQ0FBQyxNQUFwQjtRQUNoQixPQUFPLENBQUMsWUFBUixDQUFxQixTQUFyQixFQUFnQyxDQUFDLENBQUMsRUFBbEM7UUFDQSxPQUFRLENBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBUixHQUFnQjtBQUpwQixPQURKOztJQVFBLE9BQU8sQ0FBQyxTQUFSLG9EQUEyQyxPQUFPLENBQUM7SUFDbkQsSUFBRyxVQUFVLENBQUMsYUFBZDtNQUNJLE9BQU8sQ0FBQyxFQUFFLENBQUMsZUFBWCxHQUE2QixVQUFVLENBQUMsY0FENUM7O0lBR0EsSUFBRyxVQUFVLENBQUMsWUFBZDtNQUNJLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBWCxDQUFBLEVBREo7O0lBR0EsT0FBQSxHQUFVLE1BQU0sQ0FBQyxRQUFQLENBQW1CLHlCQUFILEdBQTJCLENBQUMsVUFBVSxDQUFDLE1BQVosQ0FBM0IsR0FBb0QsVUFBVSxDQUFDLE9BQS9FO0lBQ1YsSUFBRyxlQUFIO0FBQ0ksV0FBQSwyQ0FBQTs7UUFDSSxJQUFHLGNBQUg7VUFDSSxNQUFNLENBQUMsS0FBUCw0Q0FBOEI7VUFDOUIsSUFBTyxxQkFBUDtZQUNJLE1BQUEsR0FBWSx3QkFBSCxHQUFzQixJQUFDLENBQUEsV0FBWSxDQUFBLFVBQVUsQ0FBQyxNQUFYLENBQW5DLEdBQTJEO1lBQ3BFLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLE1BQUEsSUFBVSxZQUFZLENBQUMsS0FBSyxDQUFDLFNBRmpEO1dBRko7O0FBREo7TUFPQSxPQUFPLENBQUMsT0FBUixHQUFrQjtNQUVsQixJQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFSLENBQTBCLGVBQTFCLENBQUo7UUFDSSxPQUFPLENBQUMsZUFBUixDQUE0QixJQUFBLEVBQUUsQ0FBQyx1QkFBSCxDQUFBLENBQTVCLEVBQTBELENBQTFELEVBQTZELGVBQTdELEVBREo7T0FWSjs7SUFhQSxJQUFHLHFCQUFIO01BQ0ksT0FBTyxDQUFDLEVBQVIsR0FBYSxVQUFVLENBQUM7TUFDeEIsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsYUFBekIsQ0FBdUMsT0FBdkMsRUFBZ0QsT0FBTyxDQUFDLEVBQXhELEVBRko7O0lBSUEsT0FBTyxDQUFDLFVBQVIsR0FBcUI7SUFDckIsT0FBTyxDQUFDLFVBQVIsR0FBeUIsSUFBQSxJQUFBLENBQUE7SUFDekIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFuQixDQUF1QixDQUF2QixFQUEwQixDQUExQixFQUE2QixDQUE3QixFQUFnQyxDQUFoQztJQUNBLElBQUcsd0JBQUg7TUFDSSxJQUFHLHVFQUFIO1FBQ0ksT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFuQixHQUF1QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsVUFBVSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXJDO1FBQ3ZCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBaEIsR0FBb0IsRUFGeEI7T0FBQSxNQUFBO1FBSUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFoQixtREFBMkMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUovRDs7TUFNQSxJQUFHLHVFQUFIO1FBQ0ksT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFuQixHQUF1QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsVUFBVSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXJDO1FBQ3ZCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBaEIsR0FBb0IsRUFGeEI7T0FBQSxNQUFBO1FBSUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFoQixtREFBMkMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUovRDs7TUFNQSxJQUFHLHVFQUFIO1FBQ0ksT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFuQixHQUEyQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsVUFBVSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXJDO1FBQzNCLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBaEIsR0FBd0IsRUFGNUI7T0FBQSxNQUFBO1FBSUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFoQixtREFBK0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUpuRTs7TUFNQSxJQUFHLHVFQUFIO1FBQ0ksT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFuQixHQUE0QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsVUFBVSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXJDO1FBQzVCLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBaEIsR0FBeUIsRUFGN0I7T0FBQSxNQUFBO1FBSUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFoQixtREFBZ0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUpwRTtPQW5CSjs7SUF5QkEsSUFBRywrQkFBSDtNQUNJLE9BQU8sQ0FBQyxZQUFSLEdBQXVCLFVBQVUsQ0FBQyxhQUR0Qzs7SUFHQSxJQUFHLDRCQUFIO01BQ0ksT0FBTyxDQUFDLFNBQVIsR0FBb0IsSUFBQyxDQUFBLFVBQVcsQ0FBQSxVQUFVLENBQUMsU0FBWCxFQURwQzs7SUFHQSxJQUFHLHlCQUFIO01BQ0ksT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFmLENBQW1CLFVBQVUsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFyQyxFQUF5QyxVQUFVLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBM0QsRUFESjs7SUFJQSxPQUFPLENBQUMsT0FBUixrREFBdUM7SUFDdkMsSUFBRyw4QkFBSDtNQUNJLE9BQU8sQ0FBQyxXQUFSLEdBQXNCO1FBQUUsS0FBQSxFQUFPLFVBQVUsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFoQztRQUFvQyxNQUFBLEVBQVEsVUFBVSxDQUFDLFdBQVksQ0FBQSxDQUFBLENBQW5FO1FBRDFCOztJQUdBLElBQUcsNEJBQUg7TUFBOEIsT0FBTyxDQUFDLFNBQVIsR0FBb0IsVUFBVSxDQUFDLFVBQTdEOztJQUNBLElBQUcsNkJBQUg7TUFBK0IsT0FBTyxDQUFDLFVBQVIsR0FBcUIsVUFBVSxDQUFDLFdBQS9EOztJQUNBLElBQUcsNEJBQUg7TUFBOEIsT0FBTyxDQUFDLFNBQVIsR0FBb0IsVUFBVSxDQUFDLFVBQTdEOztJQUNBLElBQUcsNEJBQUg7TUFDSSxPQUFPLENBQUMsU0FBUixHQUFvQixVQUFVLENBQUM7TUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFsQixHQUF5QjtNQUN6QixJQUFHLDhCQUFIO1FBQ0ksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFsQixHQUF5QixJQUFJLENBQUMsU0FBTCxDQUFlLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBakMsRUFEN0I7O01BRUEsT0FBTyxDQUFDLFlBQVIsQ0FBeUIsSUFBQSxFQUFFLENBQUMsbUJBQUgsQ0FBQSxDQUF6QixFQUxKOztJQU9BLElBQUcsMkJBQUg7TUFDSSxPQUFPLENBQUMsUUFBUixHQUFtQixVQUFVLENBQUM7TUFDOUIsT0FBTyxDQUFDLGVBQVIsQ0FBNEIsSUFBQSxFQUFFLENBQUMsd0JBQUgsQ0FBQSxDQUE1QixFQUEyRCxDQUEzRCxFQUZKOztJQUlBLElBQUcsMkJBQUg7TUFDSSxPQUFPLENBQUMsUUFBUixHQUFtQixVQUFVLENBQUM7TUFDOUIsT0FBTyxDQUFDLGVBQVIsQ0FBNEIsSUFBQSxFQUFFLENBQUMsd0JBQUgsQ0FBQSxDQUE1QixFQUEyRCxDQUEzRCxFQUZKOztJQUlBLE9BQU8sQ0FBQyxTQUFSLEdBQW9CLFVBQVUsQ0FBQztJQUMvQixPQUFPLENBQUMsT0FBUixrREFBdUM7SUFDdkMsSUFBRyw2QkFBSDtNQUErQixPQUFPLENBQUMsVUFBUixHQUFxQixVQUFVLENBQUMsV0FBL0Q7O0lBQ0EsSUFBRyx3QkFBSDtNQUNJLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLFVBQVUsQ0FBQztNQUMzQixFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUF6QixDQUFvQyxPQUFwQyxFQUE2QyxPQUFPLENBQUMsS0FBckQsRUFGSjs7SUFJQSxJQUFHLCtCQUFIO01BQ0ksT0FBTyxDQUFDLFlBQVIsR0FBdUIsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsVUFBVSxDQUFDLFlBQTNCLEVBRDNCOztJQUdBLElBQUcseUJBQUg7TUFDSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQWYsR0FBc0IsVUFBVSxDQUFDLE1BQU8sQ0FBQSxDQUFBO01BQ3hDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBZixHQUFxQixVQUFVLENBQUMsTUFBTyxDQUFBLENBQUE7TUFDdkMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLEdBQXVCLFVBQVUsQ0FBQyxNQUFPLENBQUEsQ0FBQTtNQUN6QyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQWYsR0FBd0IsVUFBVSxDQUFDLE1BQU8sQ0FBQSxDQUFBLEVBSjlDOztJQU1BLElBQUcsMEJBQUg7TUFDSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQWhCLEdBQXVCLFVBQVUsQ0FBQyxPQUFRLENBQUEsQ0FBQTtNQUMxQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQWhCLEdBQXNCLFVBQVUsQ0FBQyxPQUFRLENBQUEsQ0FBQTtNQUN6QyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQWhCLEdBQXdCLFVBQVUsQ0FBQyxPQUFRLENBQUEsQ0FBQTtNQUMzQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQWhCLEdBQXlCLFVBQVUsQ0FBQyxPQUFRLENBQUEsQ0FBQSxFQUpoRDs7SUFNQSxJQUFHLDRCQUFIO01BQ0ksT0FBTyxDQUFDLFNBQVIsR0FBb0IsSUFBQyxDQUFBLFVBQVcsQ0FBQSxVQUFVLENBQUMsU0FBWCxFQURwQzs7SUFHQSxPQUFPLENBQUMsVUFBUixHQUFxQixJQUFDLENBQUEsVUFBVyxDQUFBLFVBQVUsQ0FBQyxVQUFYLElBQXlCLENBQXpCO0lBQ2pDLE9BQU8sQ0FBQyxVQUFSLEdBQXFCLElBQUMsQ0FBQSxVQUFXLENBQUEsVUFBVSxDQUFDLFVBQVgsSUFBeUIsQ0FBekI7SUFDakMsT0FBTyxDQUFDLE1BQVIsR0FBaUIsVUFBVSxDQUFDLE1BQVgsSUFBcUI7SUFDdEMsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsVUFBVSxDQUFDLEtBQVgsSUFBb0I7SUFDcEMsT0FBTyxDQUFDLFVBQVIsR0FBcUIsbURBQXlCLFVBQVUsQ0FBQyxNQUFwQyxDQUFBLEdBQThDLG1CQUFDLE1BQU0sQ0FBRSxvQkFBUixJQUFzQixDQUF2QjtJQUNuRSxJQUFHLHVCQUFIO01BQ0ksT0FBTyxDQUFDLElBQVIsR0FBZTtRQUFBLENBQUEsRUFBRyxVQUFVLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBaEIsR0FBcUIsR0FBeEI7UUFBNkIsQ0FBQSxFQUFHLFVBQVUsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFoQixHQUFxQixHQUFyRDtRQURuQjs7SUFNQSxJQUFHLDBCQUFIO01BQ0ksT0FBTyxDQUFDLE9BQVIsR0FBa0IsVUFBVSxDQUFDLFFBRGpDOztJQUVBLElBQUcsVUFBVSxDQUFDLFFBQWQ7TUFDSSxPQUFPLENBQUMsUUFBUixHQUF1QixJQUFBLElBQUEsQ0FBSyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQXJCLEVBQXdCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBeEMsRUFBMkMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUEzRCxFQUFrRSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQWxGLEVBRDNCOztJQUdBLElBQUcseUJBQUg7TUFDSSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBbEIsRUFBMkIsVUFBVSxDQUFDLE1BQXRDLEVBREo7O0lBSUEsSUFBRywyQkFBSDtNQUNJLE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBakIsR0FBa0MsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFVBQXhCLENBQW1DLFVBQVUsQ0FBQyxjQUE5QztNQUNsQyxJQUFBLEdBQU8sRUFBRSxDQUFDLHdCQUF3QixDQUFDLFVBQTVCLENBQXVDLE9BQXZDLEVBQWdELE9BQU8sQ0FBQyxTQUF4RDtNQUNQLFFBQUEsR0FBVyxPQUFPLElBQVAsS0FBZTtNQUMxQixJQUFHLFlBQUg7QUFDSSxhQUFTLCtIQUFUO1VBQ0ksSUFBRyxpQkFBQSxJQUFZLFFBQWY7WUFDSSxLQUFBLEdBQVE7WUFDUixJQUFHLCtCQUFBLElBQTJCLENBQUksUUFBbEM7Y0FDSSxLQUFBLEdBQVEsRUFBRSxDQUFDLGlCQUFpQixDQUFDLGNBQXJCLENBQW9DLElBQUssQ0FBQSxDQUFBLENBQXpDLEVBQTZDLFVBQVUsQ0FBQyxVQUF4RCxFQURaOztZQUVBLElBQUcsS0FBQSxJQUFTLFFBQVo7Y0FDSSxLQUFBLEdBQVEsSUFBQyxDQUFBLDJCQUFELENBQTZCLFVBQVUsQ0FBQyxRQUF4QyxFQUFrRCxPQUFsRCxFQUEyRCxDQUEzRDtjQUdSLHFDQUFVLENBQUUsZ0JBQVo7Z0JBQ0ksS0FBSyxDQUFDLE9BQU4sR0FBZ0IsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFFBQXRCLENBQStCLEtBQS9CLEVBQXNDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUE5QyxFQURwQjs7Y0FFQSxJQUFHLENBQUssc0JBQUwsQ0FBQSxJQUEwQiwwQkFBN0I7Z0JBQ0ksS0FBSyxDQUFDLFFBQU4sR0FBaUIsT0FBTyxDQUFDLFNBRDdCOztjQUdBLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEtBQWxCO2NBQ0EsS0FBSyxDQUFDLEtBQU4sR0FBYztjQUNkLEtBQUssQ0FBQyxLQUFOLEdBQWMseUNBQWUsSUFBZixDQUFBLEdBQXVCO2NBQ3JDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBakIsQ0FBc0IsS0FBdEIsRUFaSjthQUpKOztBQURKLFNBREo7T0FKSjs7SUF5QkEsSUFBRyxVQUFVLENBQUMsUUFBWCxJQUF3QixVQUFVLENBQUMsUUFBUSxDQUFDLElBQS9DO01BQ0ksUUFBQSxHQUFXLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxVQUE1QixDQUF1QyxVQUF2QyxFQUFtRCxVQUFVLENBQUMsUUFBOUQsRUFEZjtLQUFBLE1BQUE7TUFHSSxRQUFBLEdBQVcsVUFBVSxDQUFDLFNBSDFCOztJQUtBLElBQUcsZ0JBQUg7QUFDSSxXQUFBLG9EQUFBOztRQUNJLFlBQUEsR0FBZSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0IsRUFBc0MsQ0FBdEM7UUFDZixJQUFHLENBQUssNkJBQUwsQ0FBQSxJQUFpQywwQkFBcEM7VUFDSSxZQUFZLENBQUMsUUFBYixHQUF3QixPQUFPLENBQUMsU0FEcEM7O1FBRUEsWUFBWSxDQUFDLEtBQWIsR0FBcUI7UUFDckIsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFwQixHQUF3QixPQUFPLENBQUMsTUFBTSxDQUFDLENBQWYsR0FBbUIsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUMzRCxZQUFZLENBQUMsTUFBTSxDQUFDLENBQXBCLEdBQXdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBZixHQUFtQixPQUFPLENBQUMsT0FBTyxDQUFDO1FBRTNELE9BQU8sQ0FBQyxTQUFSLENBQWtCLFlBQWxCO1FBQ0EsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFqQixDQUFzQixZQUF0QjtBQVRKLE9BREo7O0lBWUEsSUFBRyxPQUFPLENBQUMsTUFBUixJQUFtQixPQUFPLENBQUMsY0FBOUI7TUFHSSxNQUFBLEdBQVMsT0FBTyxDQUFDO0FBQ2pCLGFBQU0sTUFBTjtRQUNJLElBQUcsTUFBTSxDQUFDLE1BQVY7QUFDSTtBQUFBLGVBQUEseUNBQUE7O1lBQ0ksSUFBRyxDQUFDLE9BQU8sQ0FBQyxjQUFlLENBQUEsS0FBSyxDQUFDLEVBQU4sQ0FBM0I7Y0FDSSxPQUFPLENBQUMsY0FBZSxDQUFBLEtBQUssQ0FBQyxFQUFOLENBQXZCLEdBQW1DLEdBRHZDOztZQUVBLE9BQU8sQ0FBQyxjQUFlLENBQUEsS0FBSyxDQUFDLEVBQU4sQ0FBUyxDQUFDLElBQWpDLENBQXNDLE1BQXRDO0FBSEosV0FESjs7UUFlQSxNQUFBLEdBQVMsTUFBTSxDQUFDO01BaEJwQixDQUpKOztJQXNCQSxJQUFHLDZCQUFIO01BQ0ksT0FBTyxDQUFDLFVBQVIsR0FBcUIsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsVUFBVSxDQUFDLFVBQTNCO01BQ3JCLE9BQU8sQ0FBQyxpQkFBUixHQUFnQyxJQUFBLEVBQUUsQ0FBQywyQkFBSCxDQUFBO01BQ2hDLE9BQU8sQ0FBQyxZQUFSLENBQXFCLE9BQU8sQ0FBQyxpQkFBN0I7TUFDQSxPQUFPLENBQUMsWUFBUixDQUF5QixJQUFBLEVBQUUsQ0FBQywwQkFBSCxDQUFBLENBQXpCLEVBSko7O0lBTUEsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFYLENBQUE7SUFDQSxPQUFPLENBQUMsS0FBUixDQUFBO0FBRUEsV0FBTztFQWxTa0I7OztBQW9TN0I7Ozs7Ozs7Ozs7c0JBU0EscUJBQUEsR0FBdUIsU0FBQyxVQUFELEVBQWEsTUFBYixFQUFxQixLQUFyQjtBQUNuQixRQUFBO0lBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixVQUE3QixFQUF5QyxNQUF6QyxFQUFpRCxLQUFqRDtJQUVWLElBQUcsNkJBQUg7TUFDSSxVQUFBLEdBQWEsSUFBQyxDQUFBLFdBQVksQ0FBQSxVQUFVLENBQUMsVUFBWDtNQUMxQixPQUFPLENBQUMsVUFBUixHQUFxQjtNQUNyQixPQUFPLENBQUMsWUFBUixDQUFxQixVQUFyQixFQUhKOztBQUtBLFdBQU87RUFSWTs7c0JBVXZCLDBCQUFBLEdBQTRCLFNBQUMsVUFBRCxFQUFhLE1BQWIsRUFBcUIsS0FBckI7V0FDeEIsSUFBQyxDQUFBLHFCQUFELENBQXVCLFVBQXZCLEVBQW1DLE1BQW5DLEVBQTJDLEtBQTNDO0VBRHdCOzs7Ozs7QUFLaEMsUUFBUSxDQUFDLEtBQVQsR0FBaUIsT0FBTyxDQUFDLFVBQVUsQ0FBQzs7QUFDcEMsUUFBUSxDQUFDLE1BQVQsR0FBa0IsT0FBTyxDQUFDLFVBQVUsQ0FBQzs7QUFDckMsRUFBRSxDQUFDLFNBQUgsR0FBbUIsSUFBQSxTQUFBLENBQUE7O0FBQ25CLEVBQUUsQ0FBQyxTQUFILEdBQWUsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jICAgU2NyaXB0OiBVSU1hbmFnZXJcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY2xhc3MgRm9ybXVsYVxuICAgICMjIypcbiAgICAqIEVuY2Fwc3VsYXRlcyBhIFVJIGZvcm11bGEuIEEgZm9ybXVsYSBjYW4gYmUgdXNlZCBpbiBVSSBsYXlvdXRzIHRvIGRlZmluZVxuICAgICogcHJvcGVydHktYmluZGluZ3Mgb3IgdG8gaW1wbGVtZW50IGEgc3BlY2lmaWMgYmVoYXZpb3IuXG4gICAgKlxuICAgICogQG1vZHVsZSB1aVxuICAgICogQGNsYXNzIEZvcm11bGFcbiAgICAqIEBtZW1iZXJvZiB1aVxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmIC0gVGhlIGZvcm11bGEtZnVuY3Rpb24uIERlZmluZXMgdGhlIGxvZ2ljIG9mIHRoZSBmb3JtdWxhLlxuICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBBbiBvcHRpb25hbCBkYXRhLW9iamVjdCB3aGljaCBjYW4gYmUgYWNjZXNzZWQgaW5zaWRlIHRoZSBmb3JtdWxhLWZ1bmN0aW9uLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gQW4gb3B0aW9uYWwgZXZlbnQtbmFtZSB0byBkZWZpbmUgd2hlbiB0aGUgZm9ybXVsYSBzaG91bGQgYmUgZXhlY3V0ZWQuXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChmLCBkYXRhLCBldmVudCkgLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIEluZGljYXRlcyBpZiBpdHMgdGhlIGZpcnN0IHRpbWUgdGhlIGZvcm11bGEgaXMgY2FsbGVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBvbkluaXRpYWxpemVcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAb25Jbml0aWFsaXplID0geWVzXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGZvcm11bGEtZnVuY3Rpb24uXG4gICAgICAgICogQHByb3BlcnR5IGV4ZWNfXG4gICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAgIyMjXG4gICAgICAgIEBleGVjXyA9IGZcbiAgICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQW4gb3B0aW9uYWwgZGF0YS1vYmplY3Qgd2hpY2ggY2FuIGJlcyBhY2Nlc3NlZCBpbnNpZGUgdGhlIGZvcm11bGEtZnVuY3Rpb24uXG4gICAgICAgICogQHByb3BlcnR5IGRhdGFcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjICAgXG4gICAgICAgIEBkYXRhID0gZGF0YVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIG9wdGlvbmFsIGV2ZW50LW5hbWUgdG8gZGVmaW5lIHdoZW4gdGhlIGZvcm11bGEgc2hvdWxkIGJlIGV4ZWN1dGVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBldmVudFxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAjIyMgXG4gICAgICAgIEBldmVudCA9IGV2ZW50XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQW4gYXJyYXkgb2YgY3VzdG9tIG51bWJlci1kYXRhIHdoaWNoIGNhbiBiZSB1c2VkIGZvciBkaWZmZXJlbnQgcHVycG9zZXMuIFRoZSBmaXJzdCBlbGVtZW50XG4gICAgICAgICogaXMgYWxzbyB1c2VkIGluIG9uQ2hhbmdlIG1ldGhvZCB0byBzdG9yZSB0aGUgb2xkIHZhbHVlIGFuZCBjaGVjayBhZ2FpbnN0IHRoZSBuZXcgb25lIHRvIGRldGVjdCBhIGNoYW5nZS5cbiAgICAgICAgKiBAcHJvcGVydHkgbnVtYmVyc1xuICAgICAgICAqIEB0eXBlIG51bWJlcltdXG4gICAgICAgICMjIyBcbiAgICAgICAgQG51bWJlcnMgPSBuZXcgQXJyYXkoMTApXG4gICAgICAgIEBudW1iZXJzW2ldID0gMCBmb3IgaSBpbiBbMC4uQG51bWJlcnMubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEFuIGFycmF5IG9mIGN1c3RvbSBzdHJpbmctZGF0YSB3aGljaCBjYW4gYmUgdXNlZCBmb3IgZGlmZmVyZW50IHB1cnBvc2VzLiBUaGUgZmlyc3QgZWxlbWVudFxuICAgICAgICAqIGlzIGFsc28gdXNlZCBpbiBvblRleHRDaGFuZ2UgbWV0aG9kIHRvIHN0b3JlIHRoZSBvbGQgdmFsdWUgYW5kIGNoZWNrIGFnYWluc3QgdGhlIG5ldyBvbmUgdG8gZGV0ZWN0IGEgY2hhbmdlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzdHJpbmdzXG4gICAgICAgICogQHR5cGUgc3RyaW5nW11cbiAgICAgICAgIyMjXG4gICAgICAgIEBzdHJpbmdzID0gbmV3IEFycmF5KDEwKVxuICAgICAgICBAc3RyaW5nc1tpXSA9IFwiXCIgZm9yIGkgaW4gWzAuLkBzdHJpbmdzLmxlbmd0aF1cbiAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogVGhlIGZvcm11bGEtZnVuY3Rpb24uIEl0cyBhIHdyYXBwZXItZnVuY3Rpb24gYmVmb3JlIHRoZSBmaXJzdC10aW1lIGNhbGwgd2FzIG1hZGUuXG4gICAgKiBAbWV0aG9kIGV4ZWNcbiAgICAjIyNcbiAgICBleGVjOiAtPlxuICAgICAgIEBleGVjID0gQGV4ZWNfXG4gICAgICAgciA9IEBleGVjXy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICAgQG9uSW5pdGlhbGl6ZSA9IG5vXG4gICAgICAgXG4gICAgICAgcmV0dXJuIHJcbiAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGVja3MgaWYgdGhlIHNwZWNpZmllZCBudW1iZXItdmFsdWUgaGFzIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgY2hlY2suIEl0IHVzZXNcbiAgICAqIHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgbnVtYmVycy1hcnJheSB0byBzdG9yZSB0aGUgdmFsdWUgYW5kIGNoZWNrIGFnYWluc3QgdGhlIG5ldyBvbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBvbkNoYW5nZVxuICAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlclZhbHVlIC0gTnVtYmVyIHZhbHVlIHRvIGNoZWNrLlxuICAgICMjIyAgICBcbiAgICBvbkNoYW5nZTogKG51bWJlclZhbHVlKSAtPlxuICAgICAgICByZXN1bHQgPSBAbnVtYmVyc1swXSAhPSBudW1iZXJWYWx1ZVxuICAgICAgICBAbnVtYmVyc1swXSA9IG51bWJlclZhbHVlXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgIFxuICAgICMjIypcbiAgICAqIENoZWNrcyBpZiB0aGUgc3BlY2lmaWVkIHRleHQtdmFsdWUgaGFzIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgY2hlY2suIEl0IHVzZXNcbiAgICAqIHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgc3RyaW5ncy1hcnJheSB0byBzdG9yZSB0aGUgdmFsdWUgYW5kIGNoZWNrIGFnYWluc3QgdGhlIG5ldyBvbmUuXG4gICAgKlxuICAgICogQG1ldGhvZCBvblRleHRDaGFuZ2VcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0VmFsdWUgLSBUZXh0IHZhbHVlIHRvIGNoZWNrLlxuICAgICMjIyAgICAgXG4gICAgb25UZXh0Q2hhbmdlOiAodGV4dFZhbHVlKSAtPlxuICAgICAgICByZXN1bHQgPSBAc3RyaW5nc1swXSAhPSB0ZXh0VmFsdWVcbiAgICAgICAgQHN0cmluZ3NbMF0gPSB0ZXh0VmFsdWVcbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgXG51aS5Gb3JtdWxhID0gRm9ybXVsYVxuXG5jbGFzcyBTcGFjZVxuICAgICMjIypcbiAgICAqIERlc2NyaWJlcyBhIHNwYWNlIGluc2lkZSBvciBhcm91bmQgc29tZXRoaW5nIGxpa2UgYSBtYXJnaW4gb3IgcGFkZGluZy5cbiAgICAqXG4gICAgKiBAbW9kdWxlIHVpXG4gICAgKiBAY2xhc3MgU3BhY2VcbiAgICAqIEBtZW1iZXJvZiB1aVxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgKiBAcGFyYW0ge251bWJlcn0gbGVmdCAtIFNwYWNlIGF0IHRoZSBsZWZ0IGluIHBpeGVscy5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgLSBTcGFjZSBhdCB0aGUgdG9wIGluIHBpeGVscy5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCAtIFNwYWNlIGF0IHRoZSByaWdodCBpbiBwaXhlbHMuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYm90dG9tIC0gU3BhY2UgYXQgdGhlIGJvdHRvbSBpbiBwaXhlbHMuXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChsZWZ0LCB0b3AsIHJpZ2h0LCBib3R0b20pIC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBTcGFjZSBhdCB0aGUgbGVmdCBpbiBwaXhlbHMuXG4gICAgICAgICogQHByb3BlcnR5IGxlZnRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBsZWZ0ID0gbGVmdFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFNwYWNlIGF0IHRoZSB0b3AgaW4gcGl4ZWxzLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0b3BcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEB0b3AgPSB0b3BcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTcGFjZSBhdCB0aGUgcmlnaHQgaW4gcGl4ZWxzLlxuICAgICAgICAqIEBwcm9wZXJ0eSByaWdodFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHJpZ2h0ID0gcmlnaHRcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTcGFjZSBhdCB0aGUgYm90dG9tIGluIHBpeGVscy5cbiAgICAgICAgKiBAcHJvcGVydHkgYm90dG9tXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAYm90dG9tID0gYm90dG9tXG4gICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSBjb29yZGluYXRlcyBvZiB0aGUgc3BhY2UgYnkgY29weWluZyB0aGVtIGZyb20gYSBzcGVjaWZpZWQgc3BhY2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRGcm9tT2JqZWN0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gc3BhY2UgLSBBIHNwYWNlIHRvIGNvcHkuXG4gICAgIyMjICAgXG4gICAgc2V0RnJvbU9iamVjdDogKHNwYWNlKSAtPlxuICAgICAgICBAbGVmdCA9IHNwYWNlLmxlZnRcbiAgICAgICAgQHRvcCA9IHNwYWNlLnRvcFxuICAgICAgICBAcmlnaHQgPSBzcGFjZS5yaWdodFxuICAgICAgICBAYm90dG9tID0gc3BhY2UuYm90dG9tXG4gICAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHRoZSBjb29yZGluYXRlcyBvZiB0aGUgc3BhY2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBzZXRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IC0gU3BhY2UgYXQgdGhlIGxlZnQgaW4gcGl4ZWxzLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCAtIFNwYWNlIGF0IHRoZSB0b3AgaW4gcGl4ZWxzLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IC0gU3BhY2UgYXQgdGhlIHJpZ2h0IGluIHBpeGVscy5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gLSBTcGFjZSBhdCB0aGUgYm90dG9tIGluIHBpeGVscy5cbiAgICAjIyMgICAgXG4gICAgc2V0OiAobGVmdCwgdG9wLCByaWdodCwgYm90dG9tKSAtPlxuICAgICAgICBAbGVmdCA9IGxlZnRcbiAgICAgICAgQHRvcCA9IHRvcFxuICAgICAgICBAcmlnaHQgPSByaWdodFxuICAgICAgICBAYm90dG9tID0gYm90dG9tXG4gICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhIG5ldyBzcGFjZSBvYmplY3QgZnJvbSBhbiBhcnJheSBvZiBjb29yZGluYXRlcy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGZyb21BcnJheVxuICAgICogQHN0YXRpY1xuICAgICogQHBhcmFtIHtudW1iZXJbXX0gYXJyYXkgLSBBbiBhcnJheSBvZiBjb29yZGluYXRlcyAobGVmdCwgdG9wIHJpZ2h0LCBib3R0b20pLlxuICAgICMjIyAgICBcbiAgICBAZnJvbUFycmF5OiAoYXJyYXkpIC0+IG5ldyB1aS5TcGFjZShhcnJheVswXSwgYXJyYXlbMV0sIGFycmF5WzJdLCBhcnJheVszXSlcbiAgICAgICAgXG51aS5TcGFjZSA9IFNwYWNlXG5cbmNsYXNzIFN0eWxlXG4gICAgIyMjKlxuICAgICogQSBVSSBzdHlsZSBjYW4gYXBwbGllZCB0byBhIFVJIG9iamVjdCB0byBtb2RpZnkgaXQgcHJvcGVydGllcyBsaWtlIGNvbG9yLCBpbWFnZSwgZXRjLiB0byBnaXZlIGEgY2VydGFpbiBcInN0eWxlXCIgdG8gaXQuXG4gICAgKlxuICAgICogQG1vZHVsZSB1aVxuICAgICogQGNsYXNzIFN0eWxlXG4gICAgKiBAbWVtYmVyb2YgdWlcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICogQHBhcmFtIHtPYmplY3R9IGRlc2NyaXB0b3IgLSBBIHN0eWxlLWRlc2NyaXB0b3IgdG8gaW5pdGlhbGl6ZSB0aGUgc3R5bGUgZnJvbS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpZCAtIEEgdW5pcXVlIG51bWVyaWMgSUQgdG8gYWNjZXNzIHRoZSBzdHlsZSB0aHJvdWdoIFVJTWFuYWdlci5zdHlsZXNCeUlkIGNvbGxlY3Rpb24uXG4gICAgKiBAcGFyYW0ge251bWJlcn0gc2VsZWN0b3IgLSBBIHNlbGVjdG9yIElEIHdoaWNoIGNvbnRyb2xzIHVuZGVyIHdoaWNoIGNvbmRpdGlvbnMgdGhlIHN0eWxlcyB3aWxsIGJlIGFwcGxpZWQuXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IChkZXNjcmlwdG9yLCBpZCwgc2VsZWN0b3IpIC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBJRCBudW1iZXIgdG8gcXVpY2tseSBhY2Nlc3MgdGhpcyBzdHlsZSBhbmQgbGluayB0byB0aGlzIHN0eWxlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQGlkID0gaWRcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdHlsZS1JRCBvZiB0YXJnZXQgb2JqZWN0LiBUaGlzIHN0eWxlIHdpbGwgb25seSBiZSBhcHBsaWVkIG9uIFVJIG9iamVjdHMgd2l0aCB0aGF0IHN0eWxlIElEIHdoaWNoIGFyZVxuICAgICAgICAqIGNoaWxkcmVuIG9mIFVJIG9iamVjdHMgd2hlcmUgdGhpcyBzdHlsZSBpcyBhcHBsaWVkLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0YXJnZXRcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEB0YXJnZXQgPSAtMVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFNlbGVjdG9yLUlEIHdoaWNoIGNvbnRyb2xzIHVuZGVyIHdoaWNoIGNvbmRpdGlvbnMgdGhlIHN0eWxlIGJlY29tZXMgYWN0aXZlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzZWxlY3RvclxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQHNlbGVjdG9yID0gc2VsZWN0b3JcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgZm9udCB1c2VkIGZvciB0aGUgdGV4dC1kaXNwbGF5LlxuICAgICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgICAgKiBAcHJvcGVydHkgZm9udFxuICAgICAgICAqIEB0eXBlIGdzLkZvbnRcbiAgICAgICAgIyMjXG4gICAgICAgIEBmb250ID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBVSSBvYmplY3QncyBpbWFnZSB1c2VkIGZvciB2aXN1YWwgcHJlc2VudGF0aW9uLlxuICAgICAgICAqIEBwcm9wZXJ0eSBpbWFnZVxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAjIyNcbiAgICAgICAgQGltYWdlID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBVSSBvYmplY3QncyBhbmltYXRpb25zIHVzZWQgZm9yIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAgICAqIEBwcm9wZXJ0eSBhbmltYXRpb25zXG4gICAgICAgICogQHR5cGUgT2JqZWN0W11cbiAgICAgICAgIyMjXG4gICAgICAgIEBhbmltYXRpb25zID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBVSSBvYmplY3QncyBjb2xvci5cbiAgICAgICAgKiBAcHJvcGVydHkgY29sb3JcbiAgICAgICAgKiBAdHlwZSBncy5Db2xvclxuICAgICAgICAjIyNcbiAgICAgICAgQGNvbG9yID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBVSSBvYmplY3QncyB0b25lLlxuICAgICAgICAqIEBwcm9wZXJ0eSB0b25lXG4gICAgICAgICogQHR5cGUgZ3MuVG9uZVxuICAgICAgICAjIyNcbiAgICAgICAgQHRvbmUgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIGFuY2hvci1wb2ludC4gRm9yIGV4YW1wbGU6IEFuIGFuY2hvci1wb2ludCB3aXRoIDAsMCBwbGFjZXMgdGhlIG9iamVjdCB3aXRoIGl0cyB0b3AtbGVmdCBjb3JuZXJcbiAgICAgICAgKiBhdCBpdHMgcG9zaXRpb24gYnV0IHdpdGggYW4gMC41LCAwLjUgYW5jaG9yLXBvaW50IHRoZSBvYmplY3QgaXMgcGxhY2VkIHdpdGggaXRzIGNlbnRlci4gQW4gYW5jaG9yLXBvaW50IG9mIDEsMVxuICAgICAgICAqIHBsYWNlcyB0aGUgb2JqZWN0IHdpdGggaXRzIGxvd2VyLXJpZ2h0IGNvcm5lci5cbiAgICAgICAgKiBAcHJvcGVydHkgYW5jaG9yXG4gICAgICAgICogQHR5cGUgZ3MuUG9pbnRcbiAgICAgICAgIyMjXG4gICAgICAgIEBhbmNob3IgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIHpvb20tc2V0dGluZyBmb3IgeCBhbmQgeSBheGlzLlxuICAgICAgICAqIEBkZWZhdWx0IG5ldyBncy5Qb2ludCgxLjAsIDEuMClcbiAgICAgICAgKiBAcHJvcGVydHkgem9vbVxuICAgICAgICAqIEB0eXBlIGdzLlBvaW50XG4gICAgICAgICMjI1xuICAgICAgICBAem9vbSA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgVUkgb2JqZWN0J3MgbWFyZ2luLiBUaGUgbWFyZ2luIGRlZmluZXMgYW4gZXh0cmEgc3BhY2UgYXJvdW5kIHRoZSBVSSBvYmplY3QuIFxuICAgICAgICAqIFRoZSBkZWZhdWx0IGlzIHsgbGVmdDogMCwgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwIH0uXG4gICAgICAgICogQHByb3BlcnR5IG1hcmdpblxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQG1hcmdpbiA9IG51bGxcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgVUkgb2JqZWN0J3MgcGFkZGluZy4gVGhlIGRlZmF1bHQgaXMgeyBsZWZ0OiAwLCB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAgfS5cbiAgICAgICAgKiBAcHJvcGVydHkgcGFkZGluZ1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQHBhZGRpbmcgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIG1hc2sgZm9yIG1hc2tpbmctZWZmZWN0cy5cbiAgICAgICAgKiBAcHJvcGVydHkgbWFza1xuICAgICAgICAqIEB0eXBlIGdzLk1hc2tcbiAgICAgICAgIyMjXG4gICAgICAgIEBtYXNrID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBVSSBvYmplY3QncyBhbGlnbm1lbnQuXG4gICAgICAgICogQHByb3BlcnR5IGFsaWdubWVudFxuICAgICAgICAqIEB0eXBlIHVpLkFsaWdubWVudFxuICAgICAgICAjIyNcbiAgICAgICAgQGFsaWdubWVudCA9IC0xXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIFVJIG9iamVjdCdzIG9wYWNpdHkgdG8gY29udHJvbCB0cmFuc3BhcmVuY3kuIEZvciBleGFtcGxlOiAwID0gVHJhbnNwYXJlbnQsIDI1NSA9IE9wYXF1ZSwgMTI4ID0gU2VtaS1UcmFuc3BhcmVudC5cbiAgICAgICAgKiBAcHJvcGVydHkgb3BhY2l0eVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAjIyNcbiAgICAgICAgQG9wYWNpdHkgPSAtMVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBjbGlwLXJlY3QgZm9yIHZpc3VhbCBwcmVzZW50YXRpb24uXG4gICAgICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAgICAqIEBwcm9wZXJ0eSBjbGlwUmVjdFxuICAgICAgICAqIEB0eXBlIGdzLlJlY3RcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAY2xpcFJlY3QgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGNvcm5lci1zaXplIG9mIHRoZSBmcmFtZS5cbiAgICAgICAgKiBAcHJvcGVydHkgZnJhbWVDb3JuZXJTaXplXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAZnJhbWVDb3JuZXJTaXplID0gLTFcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgdGhpY2tuZXNzIG9mIHRoZSBmcmFtZS5cbiAgICAgICAgKiBAcHJvcGVydHkgZnJhbWVUaGlja25lc3NcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBmcmFtZVRoaWNrbmVzcyA9IC0xXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIGxvb3Bpbmcgb2YgdGhlIGltYWdlLlxuICAgICAgICAqIEBwcm9wZXJ0eSBsb29waW5nXG4gICAgICAgICogQHR5cGUgdWkuT3JpZW50YXRpb25cbiAgICAgICAgIyMjXG4gICAgICAgIEBsb29waW5nID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyB6LWluZGV4IGNvbnRyb2xzIHJlbmRlcmluZy1vcmRlci9pbWFnZS1vdmVybGFwcGluZy4gQW4gb2JqZWN0IHdpdGggYSBzbWFsbGVyIHotaW5kZXggaXMgcmVuZGVyZWRcbiAgICAgICAgKiBiZWZvcmUgYW4gb2JqZWN0IHdpdGggYSBsYXJnZXIgaW5kZXguIEZvciBleGFtcGxlOiBUbyBtYWtlIHN1cmUgYSBnYW1lIG9iamVjdCBpcyBhbHdheXMgb24gdG9wIG9mIHRoZSBzY3JlZW4sIGl0XG4gICAgICAgICogc2hvdWxkIGhhdmUgdGhlIGxhcmdlc3Qgei1pbmRleCBvZiBhbGwgZ2FtZSBvYmplY3RzLlxuICAgICAgICAqIEBwcm9wZXJ0eSB6SW5kZXhcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEB6SW5kZXggPSAtMVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvYmplY3QncyBhbGlnbm1lbnQgb24geC1heGlzLiBOZWVkcyB0byBiZSBzdXBwb3J0ZWQgYnkgbGF5b3V0LlxuICAgICAgICAqIEBwcm9wZXJ0eSBhbGlnbm1lbnRYXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICMjI1xuICAgICAgICBAYWxpZ25tZW50WCA9IC0xXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIG9iamVjdCdzIGFsaWdubWVudCBvbiB5LWF4aXMuIE5lZWRzIHRvIGJlIHN1cHBvcnRlZCBieSBsYXlvdXQuXG4gICAgICAgICogQHByb3BlcnR5IGFsaWdubWVudFlcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgIyMjXG4gICAgICAgIEBhbGlnbm1lbnRZID0gLTFcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgb2JqZWN0J3MgcmVzaXplIGJlaGF2aW9yLlxuICAgICAgICAqIEBwcm9wZXJ0eSByZXNpemFibGVcbiAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICMjI1xuICAgICAgICBAcmVzaXphYmxlID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBvcmlnaW5hbCBzdHlsZSBkZXNjcmlwdG9yLlxuICAgICAgICAqIEBwcm9wZXJ0eSBkZXNjcmlwdG9yXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAZGVzY3JpcHRvciA9IGRlc2NyaXB0b3JcbiAgICAgICAgXG4gICAgICAgIGlmIGRlc2NyaXB0b3JcbiAgICAgICAgICAgIEBzZXRGcm9tRGVzY3JpcHRvcihkZXNjcmlwdG9yKVxuXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgdGhlIHN0eWxlIGZyb20gYSBzdHlsZS1kZXNjcmlwdG9yLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0RnJvbURlc2NyaXB0b3JcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yIC0gVGhlIHN0eWxlLWRlc2NyaXB0b3IuXG4gICAgIyMjIFxuICAgIHNldEZyb21EZXNjcmlwdG9yOiAoZGVzY3JpcHRvcikgLT5cbiAgICAgICAgQGRlc2NyaXB0b3IgPSBkZXNjcmlwdG9yXG4gICAgICAgIEBpbWFnZSA9IGRlc2NyaXB0b3IuaW1hZ2VcbiAgICAgICAgQGNvbG9yID0gZ3MuQ29sb3IuZnJvbUFycmF5KGRlc2NyaXB0b3IuY29sb3IpIGlmIGRlc2NyaXB0b3IuY29sb3JcbiAgICAgICAgQHRvbmUgPSBncy5Ub25lLmZyb21BcnJheShkZXNjcmlwdG9yLnRvbmUpIGlmIGRlc2NyaXB0b3IudG9uZVxuICAgICAgICBAYW5jaG9yID0gbmV3IGdzLlBvaW50KGRlc2NyaXB0b3IuYW5jaG9yWzBdLCBkZXNjcmlwdG9yLmFuY2hvclsxXSkgaWYgZGVzY3JpcHRvci5hbmNob3JcbiAgICAgICAgQHpvb20gPSBuZXcgZ3MuUG9pbnQoZGVzY3JpcHRvci56b29tWzBdLCBkZXNjcmlwdG9yLnpvb21bMV0pIGlmIGRlc2NyaXB0b3Iuem9vbVxuICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5mb250XG4gICAgICAgICAgICBAc2V0dXBGb250KGRlc2NyaXB0b3IpXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5jbGlwUmVjdFxuICAgICAgICAgICAgQGNsaXBSZWN0ID0gZ3MuUmVjdC5mcm9tQXJyYXkoZGVzY3JpcHRvci5jbGlwUmVjdClcbiAgICAgICAgICAgIFxuICAgICAgICBAb3BhY2l0eSA9IGRlc2NyaXB0b3Iub3BhY2l0eSBpZiBkZXNjcmlwdG9yLm9wYWNpdHkgPj0gMFxuICAgICAgICBAYWxpZ25tZW50ID0gZGVzY3JpcHRvci5hbGlnbm1lbnQgaWYgZGVzY3JpcHRvci5hbGlnbm1lbnQgPj0gMFxuICAgICAgICBAbWFyZ2luID0gdWkuU3BhY2UuZnJvbUFycmF5KGRlc2NyaXB0b3IubWFyZ2luKSBpZiBkZXNjcmlwdG9yLm1hcmdpblxuICAgICAgICBAcGFkZGluZyA9IHVpLlNwYWNlLmZyb21BcnJheShkZXNjcmlwdG9yLnBhZGRpbmcpIGlmIGRlc2NyaXB0b3IucGFkZGluZ1xuICAgICAgICBAYW5pbWF0aW9ucyA9IGRlc2NyaXB0b3IuYW5pbWF0aW9uc1xuICAgICAgICBAZnJhbWVDb3JuZXJTaXplID0gZGVzY3JpcHRvci5mcmFtZUNvcm5lclNpemUgaWYgZGVzY3JpcHRvci5mcmFtZUNvcm5lclNpemVcbiAgICAgICAgQGZyYW1lVGhpY2tuZXNzID0gZGVzY3JpcHRvci5mcmFtZVRoaWNrbmVzcyBpZiBkZXNjcmlwdG9yLmZyYW1lVGhpY2tuZXNzXG4gICAgICAgIEBmcmFtZSA9IGRlc2NyaXB0b3IuZnJhbWUgaWYgZGVzY3JpcHRvci5mcmFtZVxuICAgICAgICBAbG9vcGluZyA9IGRlc2NyaXB0b3IubG9vcGluZyBpZiBkZXNjcmlwdG9yLmxvb3BpbmdcbiAgICAgICAgQHJlc2l6YWJsZSA9IGRlc2NyaXB0b3IucmVzaXphYmxlIGlmIGRlc2NyaXB0b3IucmVzaXphYmxlP1xuICAgICAgICBAekluZGV4ID0gZGVzY3JpcHRvci56SW5kZXggaWYgZGVzY3JpcHRvci56SW5kZXhcbiAgICAgICAgQGFsaWdubWVudFggPSB1aS5VSU1hbmFnZXIuYWxpZ25tZW50c1tkZXNjcmlwdG9yLmFsaWdubWVudFhdIGlmIGRlc2NyaXB0b3IuYWxpZ25tZW50WFxuICAgICAgICBAYWxpZ25tZW50WSA9IHVpLlVJTWFuYWdlci5hbGlnbm1lbnRzW2Rlc2NyaXB0b3IuYWxpZ25tZW50WV0gaWYgZGVzY3JpcHRvci5hbGlnbm1lbnRZXG4gICAgICAgIFxuICAgIHNldDogKHN0eWxlKSAtPlxuICAgICAgICBAaW1hZ2UgPSBzdHlsZS5pbWFnZVxuICAgICAgICBAY29sb3Iuc2V0RnJvbU9iamVjdChzdHlsZS5jb2xvcilcbiAgICAgICAgQHRvbmUuc2V0RnJvbU9iamVjdChzdHlsZS50b25lKVxuICAgICAgICBAYW5jaG9yLnNldChzdHlsZS5hbmNob3IueCwgc3R5bGUuYW5jaG9yLnkpXG4gICAgICAgIEB6b29tLnNldChzdHlsZS56b29tLngsIHN0eWxlLnpvb20ueSlcbiAgICAgICAgXG4gICAgICAgIGlmIHN0eWxlLmZvbnRcbiAgICAgICAgICAgIGlmICFAZm9udCB0aGVuIEBmb250ID0gbmV3IGdzLkZvbnQoc3R5bGUuZm9udC5uYW1lLCBzdHlsZS5mb250LnNpemUpXG4gICAgICAgICAgICBAZm9udC5zZXQoc3R5bGUuZm9udClcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBzdHlsZS5jbGlwUmVjdFxuICAgICAgICAgICAgaWYgIUBjbGlwUmVjdCB0aGVuIEBjbGlwUmVjdCA9IG5ldyBncy5SZWN0KClcbiAgICAgICAgICAgIEBjbGlwUmVjdC5zZXRGcm9tT2JqZWN0KHN0eWxlLmNsaXBSZWN0KVxuICAgICAgICAgICAgXG4gICAgICAgIEBvcGFjaXR5ID0gc3R5bGUub3BhY2l0elxuICAgICAgICBAYWxpZ25tZW50ID0gc3R5bGUuYWxpZ25tZW50XG4gICAgICAgIEBtYXJnaW4uc2V0RnJvbU9iamVjdChzdHlsZS5tYXJnaW4pXG4gICAgICAgIEBwYWRkaW5nLnNldEZyb21PYmplY3Qoc3R5bGUucGFkZGluZylcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogSW5pdGlhbGl6ZXMgZm9udC1kYXRhIGZyb20gYSBzdHlsZS1kZXNjcmlwdG9yLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBGb250XG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBzdHlsZS1kZXNjcmlwdG9yLlxuICAgICogQHByb3RlY3RlZFxuICAgICMjIyBcbiAgICBzZXR1cEZvbnQ6IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICBpZiBkZXNjcmlwdG9yLmZvbnRcbiAgICAgICAgICAgIGlmICFAZm9udFxuICAgICAgICAgICAgICAgIEBmb250ID0gbmV3IEZvbnQoZGVzY3JpcHRvci5mb250Lm5hbWUsIGRlc2NyaXB0b3IuZm9udC5zaXplID8gMClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAZm9udC5uYW1lID0gZGVzY3JpcHRvci5mb250Lm5hbWVcbiAgICAgICAgICAgICAgICBAZm9udC5zaXplID0gZGVzY3JpcHRvci5mb250LnNpemUgPyAwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAZm9udC5ib2xkID0gZGVzY3JpcHRvci5mb250LmJvbGQgPyBAZm9udC5ib2xkXG4gICAgICAgICAgICBAZm9udC5pdGFsaWMgPSBkZXNjcmlwdG9yLmZvbnQuaXRhbGljID8gQGZvbnQuaXRhbGljXG4gICAgICAgICAgICBAZm9udC5zbWFsbENhcHMgPSBkZXNjcmlwdG9yLmZvbnQuc21hbGxDYXBzID8gQGZvbnQuc21hbGxDYXBzXG4gICAgICAgICAgICBAZm9udC51bmRlcmxpbmUgPSBkZXNjcmlwdG9yLmZvbnQudW5kZXJsaW5lID8gQGZvbnQudW5kZXJsaW5lXG4gICAgICAgICAgICBAZm9udC5zdHJpa2VUaHJvdWdoID0gZGVzY3JpcHRvci5mb250LnN0cmlrZVRocm91Z2ggPyBAZm9udC5zdHJpa2VUaHJvdWdoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGRlc2NyaXB0b3IuZm9udC5jb2xvcj9cbiAgICAgICAgICAgICAgICBAZm9udC5jb2xvci5zZXRGcm9tQXJyYXkoZGVzY3JpcHRvci5mb250LmNvbG9yKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBkZXNjcmlwdG9yLmZvbnQuYm9yZGVyP1xuICAgICAgICAgICAgICAgIEBmb250LmJvcmRlciA9IGRlc2NyaXB0b3IuZm9udC5ib3JkZXIgPyBub1xuICAgICAgICAgICAgICAgIEBmb250LmJvcmRlclNpemUgPSBkZXNjcmlwdG9yLmZvbnQuYm9yZGVyU2l6ZSA/IDRcbiAgICAgICAgICAgICAgICBAZm9udC5ib3JkZXJDb2xvci5zZXQoMCwgMCwgMCwgMjU1KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBkZXNjcmlwdG9yLmZvbnQuc2hhZG93P1xuICAgICAgICAgICAgICAgIEBmb250LnNoYWRvdyA9IGRlc2NyaXB0b3IuZm9udC5zaGFkb3cgPyBub1xuICAgICAgICAgICAgICAgIEBmb250LnNoYWRvd09mZnNldFggPSBkZXNjcmlwdG9yLmZvbnQuc2hhZG93T2Zmc2V0WCA/IDJcbiAgICAgICAgICAgICAgICBAZm9udC5zaGFkb3dPZmZzZXRZID0gZGVzY3JpcHRvci5mb250LnNoYWRvd09mZnNldFkgPyAyXG4gICAgICAgICAgICAgICAgQGZvbnQuc2hhZG93Q29sb3Iuc2V0RnJvbUFycmF5KGRlc2NyaXB0b3IuZm9udC5zaGFkb3dDb2xvcilcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZGVzY3JpcHRvci5mb250Lm91dGxpbmU/XG4gICAgICAgICAgICAgICAgQGZvbnQuYm9yZGVyID0gZGVzY3JpcHRvci5mb250Lm91dGxpbmUgPyBub1xuICAgICAgICAgICAgICAgIEBmb250LmJvcmRlclNpemUgPSBkZXNjcmlwdG9yLmZvbnQub3V0bGluZS5zaXplID8gNFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGRlc2NyaXB0b3IuZm9udC5vdXRsaW5lLmNvbG9yP1xuICAgICAgICAgICAgICAgICAgICBAZm9udC5ib3JkZXJDb2xvci5zZXRGcm9tQXJyYXkoZGVzY3JpcHRvci5mb250Lm91dGxpbmUuY29sb3IpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAZm9udC5ib3JkZXJDb2xvci5zZXQoMCwgMCwgMCwgMjU1KVxuICAgIFxuICAgICMjIypcbiAgICAqIEFwcGxpZXMgdGhlIHN0eWxlIHRvIGEgVUkgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgYXBwbHlcbiAgICAqIEBwYXJhbSB7dWkuT2JqZWN0X1VJRWxlbWVudH0gb2JqZWN0IC0gVGhlIFVJIG9iamVjdCB3aGVyZSB0aGUgc3R5bGUgc2hvdWxkIGJlIGFwcGxpZWQgdG8uXG4gICAgIyMjICAgICAgICAgICAgICAgIFxuICAgIGFwcGx5OiAob2JqZWN0KSAtPlxuICAgICAgICBpZiBub3Qgb2JqZWN0LmFjdGl2ZVN0eWxlcy5jb250YWlucyh0aGlzKVxuICAgICAgICAgICAgb2JqZWN0LmFjdGl2ZVN0eWxlcy5wdXNoKHRoaXMpXG4gICAgICAgICAgICBpZiBAZm9udCB0aGVuIG9iamVjdC5mb250Py5zZXQoQGZvbnQpXG4gICAgICAgICAgICBpZiBAY29sb3IgdGhlbiBvYmplY3QuY29sb3Iuc2V0KEBjb2xvcilcbiAgICAgICAgICAgIGlmIEB0b25lIHRoZW4gb2JqZWN0LnRvbmU/LnNldChAdG9uZSlcbiAgICAgICAgICAgIGlmIEBpbWFnZSB0aGVuIG9iamVjdC5pbWFnZSA9IEBpbWFnZVxuICAgICAgICAgICAgaWYgQGFuY2hvciB0aGVuIG9iamVjdC5hbmNob3Iuc2V0KEBhbmNob3IueCwgQGFuY2hvci55KVxuICAgICAgICAgICAgaWYgQHpvb20gdGhlbiBvYmplY3Quem9vbS5zZXQoQHpvb20ueCwgQHpvb20ueSlcbiAgICAgICAgICAgIGlmIEBwYWRkaW5nIHRoZW4gb2JqZWN0LnBhZGRpbmcuc2V0RnJvbU9iamVjdChAcGFkZGluZylcbiAgICAgICAgICAgIGlmIEBtYXJnaW4gdGhlbiBvYmplY3QubWFyZ2luLnNldEZyb21PYmplY3QoQG1hcmdpbilcbiAgICAgICAgICAgIGlmIEBvcGFjaXR5ID49IDAgdGhlbiBvYmplY3Qub3BhY2l0eSA9IEBvcGFjaXR5XG4gICAgICAgICAgICBpZiBAYWxpZ25tZW50ID49IDAgdGhlbiBvYmplY3QuYWxpZ25tZW50ID0gQGFsaWdubWVudFxuICAgICAgICAgICAgaWYgQGZyYW1lVGhpY2tuZXNzID49IDAgdGhlbiBvYmplY3QuZnJhbWVUaGlja25lc3MgPSBAZnJhbWVUaGlja25lc3NcbiAgICAgICAgICAgIGlmIEBmcmFtZUNvcm5lclNpemUgPj0gMCB0aGVuIG9iamVjdC5mcmFtZUNvcm5lclNpemUgPSBAZnJhbWVDb3JuZXJTaXplXG4gICAgICAgICAgICBpZiBAbWFzayB0aGVuIG9iamVjdC5tYXNrLnNldChAbWFzaylcbiAgICAgICAgICAgIGlmIEB6SW5kZXggPj0gMCB0aGVuIG9iamVjdC56SW5kZXggPSBAekluZGV4XG4gICAgICAgICAgICBpZiBAYWxpZ25tZW50WCA+PSAwIHRoZW4gb2JqZWN0LmFsaWdubWVudFggPSBAYWxpZ25tZW50WFxuICAgICAgICAgICAgaWYgQGFsaWdubWVudFkgPj0gMCB0aGVuIG9iamVjdC5hbGlnbm1lbnRZID0gQGFsaWdubWVudFlcbiAgICAgICAgICAgIGlmIEByZXNpemFibGU/IHRoZW4gb2JqZWN0LnJlc2l6YWJsZSA9IEByZXNpemFibGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGFwcGx5TG9vcGluZyhvYmplY3QpXG4gICAgICAgICAgICBAYXBwbHlBbmltYXRpb25zKG9iamVjdClcbiAgICAgXG4gICAgIyMjKlxuICAgICogQXBwbGllcyB0aGUgbG9vcGluZy1kYXRhIG9mIHRoZSBzdHlsZSB0byBhIFVJIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGFwcGx5TG9vcGluZ1xuICAgICogQHBhcmFtIHt1aS5PYmplY3RfVUlFbGVtZW50fSBvYmplY3QgLSBUaGUgVUkgb2JqZWN0IHdoZXJlIHRoZSBsb29waW5nLWRhdGEgc2hvdWxkIGJlIGFwcGxpZWQgdG8uXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICBcbiAgICBhcHBseUxvb3Bpbmc6IChvYmplY3QpIC0+XG4gICAgICAgIGlmIEBsb29waW5nXG4gICAgICAgICAgICBpZiAhb2JqZWN0LnZpc3VhbC5sb29waW5nXG4gICAgICAgICAgICAgICAgb2JqZWN0LnZpc3VhbC5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICBvYmplY3QucmVtb3ZlQ29tcG9uZW50KG9iamVjdC52aXN1YWwpXG4gICAgICAgICAgICAgICAgb2JqZWN0LnZpc3VhbCA9IG5ldyBncy5Db21wb25lbnRfVGlsaW5nU3ByaXRlKClcbiAgICAgICAgICAgICAgICBvYmplY3QuYWRkQ29tcG9uZW50KG9iamVjdC52aXN1YWwpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iamVjdC52aXN1YWwubG9vcGluZy52ZXJ0aWNhbCA9IEBsb29waW5nLnZlcnRpY2FsXG4gICAgICAgICAgICBvYmplY3QudmlzdWFsLmxvb3BpbmcuaG9yaXpvbnRhbCA9IEBsb29waW5nLmhvcml6b250YWxcbiAgICAgXG4gICAgIyMjKlxuICAgICogQXBwbGllcyB0aGUgYW5pbWF0aW9uLWRhdGEgb2YgdGhlIHN0eWxlIHRvIGEgVUkgb2JqZWN0LiBUaGlzIGF1dG9tYXRpY2FsbHkgYWRkcyBhbiBhbmltYXRpb24taGFuZGxlclxuICAgICogY29tcG9uZW50KHVpLkNvbXBvbmVudF9BbmltYXRpb25IYW5kbGVyKSB3aXRoIHRoZSBpZCBcImFuaW1hdGlvbkhhbmRsZXJcIiB0byB0aGUgVUkgb2JqZWN0IGlmIG5vdCBhbHJlYWR5IGV4aXN0cy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGFwcGx5QW5pbWF0aW9uc1xuICAgICogQHBhcmFtIHt1aS5PYmplY3RfVUlFbGVtZW50fSBvYmplY3QgLSBUaGUgVUkgb2JqZWN0IHdoZXJlIHRoZSBhbmltYXRpb24tZGF0YSBzaG91bGQgYmUgYXBwbGllZCB0by5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgIFxuICAgIGFwcGx5QW5pbWF0aW9uczogKG9iamVjdCkgLT5cbiAgICAgICAgaWYgQGFuaW1hdGlvbnNcbiAgICAgICAgICAgIG9iamVjdC5hbmltYXRpb25zID0gT2JqZWN0LmRlZXBDb3B5KEBhbmltYXRpb25zKVxuICAgICAgICAgICAgaWYgIW9iamVjdC5maW5kQ29tcG9uZW50QnlJZChcImFuaW1hdGlvbkhhbmRsZXJcIilcbiAgICAgICAgICAgICAgICBvYmplY3QuYW5pbWF0aW9uRXhlY3V0b3IgPSBuZXcgdWkuQ29tcG9uZW50X0FuaW1hdGlvbkV4ZWN1dG9yKClcbiAgICAgICAgICAgICAgICBvYmplY3QuYWRkQ29tcG9uZW50KG5ldyB1aS5Db21wb25lbnRfQW5pbWF0aW9uSGFuZGxlcigpLCBcImFuaW1hdGlvbkhhbmRsZXJcIilcbiAgICAgICAgICAgICAgICBvYmplY3QuYWRkQ29tcG9uZW50KG9iamVjdC5hbmltYXRpb25FeGVjdXRvciwgXCJhbmltYXRpb25FeGVjdXRvclwiKVxuICAgICAgICAgICAgICAgIFxuICAgICAgXG4gICAgIyMjKlxuICAgICogUmV2ZXJ0cyB0aGUgY2hhbmdlcyBmcm9tIGEgVUkgb2JqZWN0IG1hZGUgYnkgdGhpcyBzdHlsZS4gSG93ZXZlciwgdGhpcyByZXNldHMgYWxsIHN0eWxlYWJsZSBwcm9wZXJ0aWVzXG4gICAgKiB3ZXJlIHNldCBieSB0aGlzIHN0eWxlLiBTbyBpdCBpcyBuZWNlc3NhcnkgdG8gYXBwbHkgYWxsIG90aGVyIHN0eWxlcyBhZ2FpbiwgYnV0IHRoYXQgaXMgYWxyZWFkeSBoYW5kbGVzIGluXG4gICAgKiB1aS5Db21wb25lbnRfVUlCZWhhdmlvci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJldmVydFxuICAgICogQHBhcmFtIHt1aS5PYmplY3RfVUlFbGVtZW50fSBvYmplY3QgLSBUaGUgVUkgb2JqZWN0IHdoZXJlIHRoZSBzdHlsZSBzaG91bGQgYmUgcmV2ZXJ0ZWQuXG4gICAgIyMjICAgICAgICAgICAgIFxuICAgIHJldmVydDogKG9iamVjdCkgLT5cbiAgICAgICAgYWN0aXZlU3R5bGVzID0gb2JqZWN0LmFjdGl2ZVN0eWxlc1xuICAgICAgICBpZiBvYmplY3QuYWN0aXZlU3R5bGVzLmNvbnRhaW5zKHRoaXMpXG4gICAgICAgICAgICBvYmplY3QuYWN0aXZlU3R5bGVzLnJlbW92ZSh0aGlzKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAZm9udCB0aGVuIG9iamVjdC5mb250LnNldChncy5Gb250cy5URVhUKTsgICAgICAgICAgICAgICAoaWYgcy5mb250IHRoZW4gb2JqZWN0LmZvbnQuc2V0KHMuZm9udCk7IGJyZWFrKSBmb3IgcyBpbiBhY3RpdmVTdHlsZXMgYnkgLTFcbiAgICAgICAgICAgIGlmIEBjb2xvciB0aGVuIG9iamVjdC5jb2xvci5zZXQoQ29sb3IuV0hJVEUpOyAgICAgICAgICAgICAgIChpZiBzLmNvbG9yIHRoZW4gb2JqZWN0LmNvbG9yLnNldChzLmNvbG9yKTsgYnJlYWspIGZvciBzIGluIGFjdGl2ZVN0eWxlcyBieSAtMVxuICAgICAgICAgICAgaWYgQHRvbmUgdGhlbiBvYmplY3QudG9uZT8uc2V0KDAsIDAsIDAsIDApOyAgICAgICAgICAgICAgICAgKGlmIHMudG9uZSB0aGVuIG9iamVjdC50b25lPy5zZXQocy50b25lKTsgYnJlYWspIGZvciBzIGluIGFjdGl2ZVN0eWxlcyBieSAtMVxuICAgICAgICAgICAgaWYgQGltYWdlIHRoZW4gb2JqZWN0LmltYWdlID0gbnVsbDsgICAgICAgICAgICAgICAgICAgICAgICAgKGlmIHMuaW1hZ2UgdGhlbiBvYmplY3QuaW1hZ2UgPSBzLmltYWdlOyBicmVhaykgZm9yIHMgaW4gYWN0aXZlU3R5bGVzIGJ5IC0xXG4gICAgICAgICAgICBpZiBAYW5jaG9yIHRoZW4gb2JqZWN0LmFuY2hvci5zZXQoMCwgMCk7ICAgICAgICAgICAgICAgICAgICAoaWYgcy5hbmNob3IgdGhlbiBvYmplY3QuYW5jaG9yLnNldEZyb21PYmplY3Qocy5hbmNob3IpOyBicmVhaykgZm9yIHMgaW4gYWN0aXZlU3R5bGVzIGJ5IC0xXG4gICAgICAgICAgICBpZiBAem9vbSB0aGVuIG9iamVjdC56b29tLnNldCgxLjAsIDEuMCk7ICAgICAgICAgICAgICAgICAgICAoaWYgcy56b29tIHRoZW4gb2JqZWN0Lnpvb20uc2V0RnJvbU9iamVjdChzLnpvb20pOyBicmVhaykgZm9yIHMgaW4gYWN0aXZlU3R5bGVzIGJ5IC0xXG4gICAgICAgICAgICBpZiBAcGFkZGluZyB0aGVuIG9iamVjdC5wYWRkaW5nLnNldCgwLCAwLCAwLCAwKTsgICAgICAgICAgICAoaWYgcy5wYWRkaW5nIHRoZW4gb2JqZWN0LnBhZGRpbmcuc2V0RnJvbU9iamVjdChzLnBhZGRpbmcpOyBicmVhaykgZm9yIHMgaW4gYWN0aXZlU3R5bGVzIGJ5IC0xXG4gICAgICAgICAgICBpZiBAbWFyZ2luIHRoZW4gb2JqZWN0Lm1hcmdpbi5zZXQoMCwgMCwgMCwgMCk7ICAgICAgICAgICAgICAoaWYgcy5tYXJnaW4gdGhlbiBvYmplY3QubWFyZ2luLnNldEZyb21PYmplY3Qocy5tYXJnaW4pOyBicmVhaykgZm9yIHMgaW4gYWN0aXZlU3R5bGVzIGJ5IC0xXG4gICAgICAgICAgICBpZiBAb3BhY2l0eSA+PSAwIHRoZW4gb2JqZWN0Lm9wYWNpdHkgPSAyNTU7ICAgICAgICAgICAgICAgICAoaWYgcy5vcGFjaXR5ID49IDAgdGhlbiBvYmplY3Qub3BhY2l0eSA9IHMub3BhY2l0eTsgYnJlYWspIGZvciBzIGluIGFjdGl2ZVN0eWxlcyBieSAtMVxuICAgICAgICAgICAgaWYgQGFsaWdubWVudCA+PSAwIHRoZW4gb2JqZWN0LmFsaWdubWVudCA9IDA7ICAgICAgICAgICAgICAgKGlmIHMuYWxpZ25tZW50ID49IDAgdGhlbiBvYmplY3QuYWxpZ25tZW50ID0gcy5hbGlnbm1lbnQ7IGJyZWFrKSBmb3IgcyBpbiBhY3RpdmVTdHlsZXMgYnkgLTFcbiAgICAgICAgICAgIGlmIEBmcmFtZUNvcm5lclNpemUgPj0gMCB0aGVuIG9iamVjdC5mcmFtZUNvcm5lclNpemUgPSAxNjsgIChpZiBzLmZyYW1lQ29ybmVyU2l6ZSA+PSAwIHRoZW4gb2JqZWN0LmZyYW1lQ29ybmVyU2l6ZSA9IHMuZnJhbWVDb3JuZXJTaXplOyBicmVhaykgZm9yIHMgaW4gYWN0aXZlU3R5bGVzIGJ5IC0xXG4gICAgICAgICAgICBpZiBAZnJhbWVUaGlja25lc3MgPj0gMCB0aGVuIG9iamVjdC5mcmFtZVRoaWNrbmVzcyA9IDE2OyAgICAoaWYgcy5mcmFtZVRoaWNrbmVzcyA+PSAwIHRoZW4gb2JqZWN0LmZyYW1lVGhpY2tuZXNzID0gcy5mcmFtZVRoaWNrbmVzczsgYnJlYWspIGZvciBzIGluIGFjdGl2ZVN0eWxlcyBieSAtMVxuICAgICAgICAgICAgaWYgQG1hc2sgdGhlbiBvYmplY3QubWFzay5zZXQobnVsbCk7ICAgICAgICAgICAgICAgICAgICAgICAgKGlmIHMubWFzayB0aGVuIG9iamVjdC5tYXNrLnNldChzLmZvbnQpOyBicmVhaykgZm9yIHMgaW4gYWN0aXZlU3R5bGVzIGJ5IC0xXG4gICAgICAgICAgICBpZiBAekluZGV4ID49IDAgdGhlbiBvYmplY3QuekluZGV4ID0gMDsgICAgICAgICAgICAgICAgICAgICAoaWYgcy56SW5kZXggPj0gMCB0aGVuIG9iamVjdC56SW5kZXggPSBzLnpJbmRleDsgYnJlYWspIGZvciBzIGluIGFjdGl2ZVN0eWxlcyBieSAtMVxuICAgICAgICAgICAgaWYgQGFsaWdubWVudFggPj0gMCB0aGVuIG9iamVjdC5hbGlnbm1lbnRYID0gMDsgICAgICAgICAgICAgKGlmIHMuYWxpZ25tZW50WCA+PSAwIHRoZW4gb2JqZWN0LmFsaWdubWVudFggPSBzLmFsaWdubWVudFg7IGJyZWFrKSBmb3IgcyBpbiBhY3RpdmVTdHlsZXMgYnkgLTFcbiAgICAgICAgICAgIGlmIEBhbGlnbm1lbnRZID49IDAgdGhlbiBvYmplY3QuYWxpZ25tZW50WSA9IDA7ICAgICAgICAgICAgIChpZiBzLmFsaWdubWVudFkgPj0gMCB0aGVuIG9iamVjdC5hbGlnbm1lbnRZID0gcy5hbGlnbm1lbnRZOyBicmVhaykgZm9yIHMgaW4gYWN0aXZlU3R5bGVzIGJ5IC0xXG4gICAgICAgICAgICBpZiBAcmVzaXphYmxlPyB0aGVuIG9iamVjdC5yZXNpemFibGUgPSBubzsgICAgICAgICAgICAgICAgICAoaWYgcy5yZXNpemFibGU/IHRoZW4gb2JqZWN0LnJlc2l6YWJsZSA9IHMucmVzaXphYmxlOyBicmVhaykgZm9yIHMgaW4gYWN0aXZlU3R5bGVzIGJ5IC0xXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEByZXZlcnRBbmltYXRpb25zKG9iamVjdClcbiAgICAgICAgICAgIEByZXZlcnRMb29waW5nKG9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogUmV2ZXJ0cyB0aGUgYW5pbWF0aW9uLWRhdGEgY2hhbmdlcyBhcHBsaWVkIHRvIGEgVUkgb2JqZWN0IGJ5IHRoaXMgc3R5bGUuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXZlcnRBbmltYXRpb25zXG4gICAgKiBAcGFyYW0ge3VpLk9iamVjdF9VSUVsZW1lbnR9IG9iamVjdCAtIFRoZSBVSSBvYmplY3Qgd2hlcmUgdGhlIGFuaW1hdGlvbi1kYXRhIGNoYW5nZXMgc2hvdWxkIGJlIHJldmVydGVkLlxuICAgICMjIyAgICAgICAgICAgICAgICAgXG4gICAgcmV2ZXJ0QW5pbWF0aW9uczogKG9iamVjdCkgLT5cbiAgICAgICAgYWN0aXZlU3R5bGVzID0gb2JqZWN0LmFjdGl2ZVN0eWxlc1xuICAgICAgICBpZiBAYW5pbWF0aW9uc1xuICAgICAgICAgICAgb2JqZWN0LmFuaW1hdGlvbnMgPSBudWxsOyAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIHMgaW4gYWN0aXZlU3R5bGVzIGJ5IC0xXG4gICAgICAgICAgICAgICAgaWYgcy5hbmltYXRpb25zXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5hbmltYXRpb25zID0gT2JqZWN0LmRlZXBDb3B5KHMuYW5pbWF0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgaWYgIW9iamVjdC5maW5kQ29tcG9uZW50QnlJZChcImFuaW1hdGlvbkhhbmRsZXJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5hZGRDb21wb25lbnQobmV3IHVpLkNvbXBvbmVudF9BbmltYXRpb25IYW5kbGVyKCksIFwiYW5pbWF0aW9uSGFuZGxlclwiKVxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBSZXZlcnRzIHRoZSBsb29waW5nLWRhdGEgY2hhbmdlcyBhcHBsaWVkIHRvIGEgVUkgb2JqZWN0IGJ5IHRoaXMgc3R5bGUuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXZlcnRMb29waW5nXG4gICAgKiBAcGFyYW0ge3VpLk9iamVjdF9VSUVsZW1lbnR9IG9iamVjdCAtIFRoZSBVSSBvYmplY3Qgd2hlcmUgdGhlIGxvb3BpbmctZGF0YSBjaGFuZ2VzIHNob3VsZCBiZSByZXZlcnRlZC5cbiAgICAjIyMgICAgICAgICAgICAgICAgIFxuICAgIHJldmVydExvb3Bpbmc6IChvYmplY3QpIC0+XG4gICAgICAgIGFjdGl2ZVN0eWxlcyA9IG9iamVjdC5hY3RpdmVTdHlsZXNcbiAgICAgICAgaWYgQGxvb3BpbmdcbiAgICAgICAgICAgIG9iamVjdC52aXN1YWwubG9vcGluZy52ZXJ0aWNhbCA9IG5vXG4gICAgICAgICAgICBvYmplY3QudmlzdWFsLmxvb3BpbmcuaG9yaXpvbnRhbCA9IG5vXG4gICAgICAgICAgICBmb3IgcyBpbiBhY3RpdmVTdHlsZXMgYnkgLTFcbiAgICAgICAgICAgICAgICBpZiBzLmxvb3BpbmdcbiAgICAgICAgICAgICAgICAgICAgaWYgIW9iamVjdC52aXN1YWwubG9vcGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnZpc3VhbC5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC5yZW1vdmVDb21wb25lbnQob2JqZWN0LnZpc3VhbClcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdC52aXN1YWwgPSBuZXcgZ3MuQ29tcG9uZW50X1RpbGluZ1Nwcml0ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuYWRkQ29tcG9uZW50KG9iamVjdC52aXN1YWwpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QudmlzdWFsLmxvb3BpbmcudmVydGljYWwgPSBzLmxvb3BpbmcudmVydGljYWxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnZpc3VhbC5sb29waW5nLmhvcml6b250YWwgPSBzLmxvb3BpbmcuaG9yaXpvbnRhbFxuICAgICAgICAgICAgXG51aS5TdHlsZSA9IFN0eWxlXG5cbmNsYXNzIFVJTWFuYWdlclxuICAgICMjIypcbiAgICAqIEhhbmRsZXMgdGhlIGNyZWF0aW9uIG9mIEluIEdhbWUgVUkgZWxlbWVudHMuIEZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0XG4gICAgKiBJbi1HYW1lIFVJIHNlZSBoZWxwIGZpbGUuXG4gICAgKlxuICAgICogQG1vZHVsZSB1aVxuICAgICogQGNsYXNzIFVJTWFuYWdlclxuICAgICogQG1lbWJlcm9mIHVpXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBhbGwgcmVnaXN0ZXJlZCBVSSBsYXlvdXRzIGJ5IG5hbWUvaWQuXG4gICAgICAgICogQHByb3BlcnR5IGxheW91dHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBsYXlvdXRzID0ge31cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgYWxsIHJlZ2lzdGVyZWQgVUkgc3R5bGVzIGJ5IG5hbWUvaWQuXG4gICAgICAgICogQHByb3BlcnR5IHN0eWxlc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQHN0eWxlcyA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGFsbCBVSSBzdHlsZXMgYnkgbnVtYmVyIGlkLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzdHlsZXNCeUlkXG4gICAgICAgICogQHR5cGUgdWkuU3R5bGVbXVxuICAgICAgICAjIyNcbiAgICAgICAgQHN0eWxlc0J5SWQgPSBuZXcgQXJyYXkoKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBhbGwgVUkgc3R5bGVzIGJ5IHN0eWxlLW5hbWUuXG4gICAgICAgICogQHByb3BlcnR5IHN0eWxlc0J5TmFtZVxuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQHN0eWxlc0J5TmFtZSA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGFsbCByZWdpc3RlcmVkIGN1c3RvbSBVSSB0eXBlcy90ZW1wbGF0ZXMgYnkgbmFtZS9pZC5cbiAgICAgICAgKiBAcHJvcGVydHkgY3VzdG9tVHlwZXNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXN0b21UeXBlcyA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGFsbCByZWdpc3RlcmVkIFVJIGNvbnRyb2xsZXJzIGJ5IG5hbWUvaWQuXG4gICAgICAgICogQHByb3BlcnR5IGN1c3RvbVR5cGVzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICMjI1xuICAgICAgICBAY29udHJvbGxlcnMgPSB7fVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0b3JlcyBhbGwgcmVnaXN0ZXJlZCBVSSBkYXRhIHNvdXJjZXMgYnkgbmFtZS9pZC5cbiAgICAgICAgKiBAcHJvcGVydHkgY3VzdG9tVHlwZXNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgIyMjXG4gICAgICAgIEBkYXRhU291cmNlcyA9IHt9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogTWFwcGluZyB0byB0YWJsZSB0byBtYXAgYWxpZ25tZW50IG5hbWVzIHRvIG51bWJlciB2YWx1ZXMuXG4gICAgICAgICogQHByb3BlcnR5IGFsaWdubWVudHNcbiAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjI1xuICAgICAgICBAYWxpZ25tZW50cyA9IHsgXCJsZWZ0XCI6IDAsIFwidG9wXCI6IDAsIFwiY2VudGVyXCI6IDEsIFwiYm90dG9tXCI6IDIsIFwicmlnaHRcIjogMiwgXCIwXCI6IDAsIFwiMVwiOiAxLCBcIjJcIjogMiB9XG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogTWFwcGluZyB0byB0YWJsZSB0byBtYXAgYmxlbmQtbW9kZSBuYW1lcyB0byBudW1iZXIgdmFsdWVzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBibGVuZE1vZGVzXG4gICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGJsZW5kTW9kZXMgPSB7IFwibm9ybWFsXCI6IDAsIFwiYWRkXCI6IDEsIFwic3ViXCI6IDIgfVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIE1hcHBpbmcgdG8gdGFibGUgdG8gbWFwIHNlbGVjdG9yIG5hbWVzIHRvIG51bWJlciB2YWx1ZXMuXG4gICAgICAgICogQHByb3BlcnR5IHNlbGVjdG9yc1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAjIyNcbiAgICAgICAgQHNlbGVjdG9ycyA9IHsgbm9ybWFsOiAwLCBob3ZlcjogMSwgc2VsZWN0ZWQ6IDIsIGVuYWJsZWQ6IDMsIGZvY3VzZWQ6IDQgfVxuICAgICAgICBAZGVmYXVsdFBsYWNlaG9sZGVyUGFyYW1zID0ge31cbiAgICBcbiAgICAjIyMqXG4gICAgKiBTZXRzIHVwIFVJIE1hbmFnZXIsIG9wdGltaXplcyBzdHlsZXMsIGV0Yy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHNldHVwXG4gICAgIyMjXG4gICAgc2V0dXA6IC0+XG4gICAgICAgIEBzZXR1cFN0eWxlcygpXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFNldHMgdXAgdGhlIFVJIHN0eWxlcyBieSB3cmFwcGluZyB0aGVtIGludG8gdWkuU3R5bGUgb2JqZWN0cyBhbmQgb3B0aW1pemluZyB0aGUgYWNjZXNzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc2V0dXBTdHlsZXNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyNcbiAgICBzZXR1cFN0eWxlczogLT5cbiAgICAgICAgaWQgPSAwXG4gICAgICAgIHNlbGVjdG9yTWFwID0gQHNlbGVjdG9yc1xuICAgICAgICBmb3IgayBvZiBAc3R5bGVzXG4gICAgICAgICAgICBzdWJzID0gay5zcGxpdChcIiBcIilcbiAgICAgICAgICAgIHNlbGVjdG9yID0gc3Vic1swXS5zcGxpdChcIjpcIilcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc2VsZWN0b3JNYXBbc2VsZWN0b3JbMV1dXG4gICAgICAgICAgICAgICAgQHN0eWxlc0J5SWRbaWRdID0gbmV3IHVpLlN0eWxlKEBzdHlsZXNba10sIGlkLCBzZWxlY3Rvck1hcFtzZWxlY3RvclsxXV0pXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHN0eWxlc0J5SWRbaWRdID0gbmV3IHVpLlN0eWxlKEBzdHlsZXNba10sIGlkLCAwKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAhQHN0eWxlc0J5TmFtZVtzZWxlY3RvclswXV1cbiAgICAgICAgICAgICAgICBAc3R5bGVzQnlOYW1lW3NlbGVjdG9yWzBdXSA9IFtdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAc3R5bGVzQnlOYW1lW3NlbGVjdG9yWzBdXS5wdXNoKEBzdHlsZXNCeUlkW2lkXSlcbiAgICAgICAgICAgIEBzdHlsZXNba10gPSBAc3R5bGVzQnlJZFtpZF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWQrK1xuICAgICAgICBcbiAgICAgICAgZm9yIGsgb2YgQHN0eWxlc1xuICAgICAgICAgICAgc3VicyA9IGsuc3BsaXQoXCIgXCIpXG4gICAgICAgICAgICBpZiBzdWJzLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBAc3R5bGVzQnlOYW1lW3N1YnNbMV1dLnB1c2goQHN0eWxlc1trXSlcbiAgICAgICAgICAgICAgICBAc3R5bGVzW2tdLnRhcmdldCA9IEBzdHlsZXNbay5zcGxpdChcIjpcIilbMF1dPy5pZFxuICAgICAgICAgICAgICAgICNAc3R5bGVzW3N1YnNbMV1dLnRhcmdldCA9IEBzdHlsZXNba10uaWRcbiAgICAgICAgICAgICAgICAjQHN0eWxlc1trXS50YXJnZXQgPSBAc3R5bGVzW3N1YnNbMV1dLmlkXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRXhlY3V0ZXMgYWxsIHBsYWNlaG9sZGVyIGZvcm11bGFzIGluIHRoZSBzcGVjaWZpZWQgZGVzY3JpcHRvci4gVGhlIGRlc2NyaXB0b3Igd2lsbCBiZSBjaGFuZ2VkXG4gICAgKiBhbmQgcGxhY2Vob2xkZXIgZm9ybXVsYXMgYXJlIHJlcGxhY2VkIHdpdGggdGhlaXIgZXZhbHVhdGVkIHJlc3VsdCB2YWx1ZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGV4ZWN1dGVQbGFjZWhvbGRlckZvcm11bGFzXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBkZXNjcmlwdG9yLlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIE9iamVjdCBjb250YWluaW5nIHRoZSBwbGFjZWhvbGRlciBwYXJhbXMuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgIFxuICAgIGV4ZWN1dGVQbGFjZWhvbGRlckZvcm11bGFzOiAoZGVzY3JpcHRvciwgaWQsIHBhcmFtcykgLT5cbiAgICAgICAgcmV0dXJuIGlmIG5vdCBkZXNjcmlwdG9yP1xuICAgICAgICBrZXlzID0gT2JqZWN0LmtleXMoZGVzY3JpcHRvcilcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgayBpbiBrZXlzXG4gICAgICAgICAgICB2ID0gZGVzY3JpcHRvcltrXVxuICAgICAgICAgICAgaWYgdj9cbiAgICAgICAgICAgICAgICBpZiB2IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgZm9yIGksIGMgaW4gdlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgaT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB0eXBlb2YgaSA9PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBleGVjdXRlUGxhY2Vob2xkZXJGb3JtdWxhcyhpLCBpZCwgcGFyYW1zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgYyAhPSBcImV4ZWNcIiBhbmQgdHlwZW9mIGkgPT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5wID0gcGFyYW1zIHx8ICBAZGVmYXVsdFBsYWNlaG9sZGVyUGFyYW1zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kID0gZGVzY3JpcHRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2W2NdID0gaSgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiB0eXBlb2YgdiA9PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgICAgICAgIEBleGVjdXRlUGxhY2Vob2xkZXJGb3JtdWxhcyh2LCBpZCwgcGFyYW1zKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgayAhPSBcImV4ZWNfXCIgYW5kIHR5cGVvZiB2ID09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucCA9IHBhcmFtcyB8fCBAZGVmYXVsdFBsYWNlaG9sZGVyUGFyYW1zXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kID0gZGVzY3JpcHRvclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yW2tdID0gdigpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAjIyMqXG4gICAgKiBDcmVhdGVzIGEgY2FsY3VsYXRpb24gZm9yIGEgc3BlY2lmaWVkIGV4cHJlc3Npb24uXG4gICAgKlxuICAgICogQG1ldGhvZCBjcmVhdGVDYWxjRnVuY3Rpb25cbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBleHByZXNzaW9uIC0gVGhlIGV4cHJlc3Npb24gdG8gY3JlYXRlIGEgY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yLlxuICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBjYWxjdWxhdGlvbiBmdW5jdGlvbi5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICAgICBcbiAgICBjcmVhdGVDYWxjRnVuY3Rpb246IChleHByZXNzaW9uKSAtPlxuICAgICAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi5yZXBsYWNlKC8oWzAtOV0rKSUvZ20sIFwiKCQxIC8gMTAwICogdilcIilcbiAgICAgICAgcmV0dXJuIGV2YWwoXCIoZnVuY3Rpb24odil7IHJldHVybiBcIiArIGV4cHJlc3Npb24gKyBcIn0pXCIpXG4gICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhbiBvYmplY3QgZnJvbSB0aGUgc3BlY2lmaWVkIG9iamVjdCB0eXBlLiBUaGUgdHlwZSBoYXMgdGhlIGZvcm1hdFxuICAgICogPG5hbWVzcGFjZT4uPHR5cGVuYW1lPiBsaWtlIHZuLkNvbXBvbmVudF9Ib3RzcG90LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlT2JqZWN0XG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSAtIFRoZSB0eXBlIG5hbWUuXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjcmVhdGVkIG9iamVjdC5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICAgXG4gICAgY3JlYXRlT2JqZWN0OiAodHlwZSkgLT5cbiAgICAgICAgc3VicyA9IHR5cGUuc3BsaXQoXCIuXCIpXG4gICAgICAgIHJldHVybiBuZXcgd2luZG93W3N1YnNbMF1dW3N1YnNbMV1dKClcbiAgICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgYW4gVUkgb2JqZWN0IGZyb20gYSBzcGVjaWZpZWQgVUkgZGVzY3JpcHRvci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZUZyb21EZXNjcmlwdG9yXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBVSSBvYmplY3QgZGVzY3JpcHRvci5cbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X1VJRWxlbWVudH0gcGFyZW50IC0gVGhlIFVJIHBhcmVudCBvYmplY3QuIChBIGxheW91dCBmb3IgZXhhbXBsZSkuXG4gICAgKiBAcmV0dXJuIHtncy5PYmplY3RfVUlFbGVtZW50fSBUaGUgY3JlYXRlZCBVSSBvYmplY3QuXG4gICAgIyMjICAgXG4gICAgY3JlYXRlRnJvbURlc2NyaXB0b3I6IChkZXNjcmlwdG9yLCBwYXJlbnQpIC0+XG4gICAgICAgIGNvbnRyb2wgPSBudWxsXG4gICAgICAgIFxuICAgICAgICBmb3IgayBvZiBAY29udHJvbGxlcnNcbiAgICAgICAgICAgIGlmIEBjb250cm9sbGVyc1trXS50eXBlP1xuICAgICAgICAgICAgICAgIEBjb250cm9sbGVyc1trXSA9IEBjcmVhdGVPYmplY3QoQGNvbnRyb2xsZXJzW2tdLnR5cGUpXG4gICAgICAgICAgICBcbiAgICAgICAgQF9jcmVhdGVGcm9tRGVzY3JpcHRvcihkZXNjcmlwdG9yLCBwYXJlbnQpXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhbiBpbWFnZSBidXR0b24gVUkgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlSW1hZ2VCdXR0b25cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yIC0gVGhlIFVJIG9iamVjdCBkZXNjcmlwdG9yLlxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X1VJRWxlbWVudH0gVGhlIGNyZWF0ZWQgaW1hZ2UgYnV0dG9uIFVJIG9iamVjdC5cbiAgICAjIyMgIFxuICAgIGNyZWF0ZUltYWdlQnV0dG9uOiAoZGVzY3JpcHRvcikgLT5cbiAgICAgICAgY29udHJvbCA9IG5ldyB1aS5PYmplY3RfSG90c3BvdChkZXNjcmlwdG9yLmltYWdlLCBkZXNjcmlwdG9yLmltYWdlSGFuZGxpbmcpIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBjb250cm9sLmJlaGF2aW9yLnNvdW5kID0gZGVzY3JpcHRvci5zb3VuZFxuICAgICAgICBjb250cm9sLmJlaGF2aW9yLnNvdW5kcyA9IGRlc2NyaXB0b3Iuc291bmRzXG4gICAgICAgIGNvbnRyb2wuaW1hZ2UgPSBkZXNjcmlwdG9yLmltYWdlXG4gICAgICAgIGNvbnRyb2wuaW1hZ2VzID0gZGVzY3JpcHRvci5pbWFnZXNcbiAgICAgICAgaWYgZGVzY3JpcHRvci5pbWFnZUZvbGRlcj9cbiAgICAgICAgICAgIGNvbnRyb2wuaW1hZ2VGb2xkZXIgPSBkZXNjcmlwdG9yLmltYWdlRm9sZGVyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5sb29waW5nP1xuICAgICAgICAgICAgY29udHJvbC52aXN1YWwuZGlzcG9zZSgpXG4gICAgICAgICAgICBjb250cm9sLnJlbW92ZUNvbXBvbmVudChjb250cm9sLnZpc3VhbClcbiAgICAgICAgICAgIGNvbnRyb2wudmlzdWFsID0gbmV3IGdzLkNvbXBvbmVudF9UaWxpbmdTcHJpdGUoKVxuICAgICAgICAgICAgY29udHJvbC5hZGRDb21wb25lbnQoY29udHJvbC52aXN1YWwpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnRyb2wudmlzdWFsLmxvb3BpbmcudmVydGljYWwgPSBkZXNjcmlwdG9yLmxvb3BpbmcudmVydGljYWxcbiAgICAgICAgICAgIGNvbnRyb2wudmlzdWFsLmxvb3BpbmcuaG9yaXpvbnRhbCA9IGRlc2NyaXB0b3IubG9vcGluZy5ob3Jpem9udGFsXG4gICAgICAgIGlmIGRlc2NyaXB0b3IuY29sb3I/XG4gICAgICAgICAgICBjb250cm9sLmNvbG9yID0gQ29sb3IuZnJvbUFycmF5KGRlc2NyaXB0b3IuY29sb3IpXG4gICAgXG4gICAgICAgIHJldHVybiBjb250cm9sXG4gICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhbiBpbWFnZSBVSSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBjcmVhdGVJbWFnZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGRlc2NyaXB0b3IgLSBUaGUgVUkgb2JqZWN0IGRlc2NyaXB0b3IuXG4gICAgKiBAcmV0dXJuIHtncy5PYmplY3RfVUlFbGVtZW50fSBUaGUgY3JlYXRlZCBpbWFnZSBidXR0b24gVUkgb2JqZWN0LlxuICAgICMjIyAgICAgXG4gICAgY3JlYXRlSW1hZ2U6IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICBjb250cm9sID0gbmV3IHVpLk9iamVjdF9JbWFnZShkZXNjcmlwdG9yLmltYWdlLCBkZXNjcmlwdG9yLmltYWdlSGFuZGxpbmcsIGRlc2NyaXB0b3IuaW1hZ2VGb2xkZXIpIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBkZXNjcmlwdG9yLmltYWdlRm9sZGVyP1xuICAgICAgICAgICAgY29udHJvbC5pbWFnZUZvbGRlciA9IGRlc2NyaXB0b3IuaW1hZ2VGb2xkZXJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBkZXNjcmlwdG9yLmxvb3Bpbmc/XG4gICAgICAgICAgICBjb250cm9sLnZpc3VhbC5kaXNwb3NlKClcbiAgICAgICAgICAgIGNvbnRyb2wucmVtb3ZlQ29tcG9uZW50KGNvbnRyb2wudmlzdWFsKVxuICAgICAgICAgICAgY29udHJvbC52aXN1YWwgPSBuZXcgZ3MuQ29tcG9uZW50X1RpbGluZ1Nwcml0ZSgpXG4gICAgICAgICAgICBjb250cm9sLmFkZENvbXBvbmVudChjb250cm9sLnZpc3VhbClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29udHJvbC52aXN1YWwubG9vcGluZy52ZXJ0aWNhbCA9IGRlc2NyaXB0b3IubG9vcGluZy52ZXJ0aWNhbFxuICAgICAgICAgICAgY29udHJvbC52aXN1YWwubG9vcGluZy5ob3Jpem9udGFsID0gZGVzY3JpcHRvci5sb29waW5nLmhvcml6b250YWxcbiAgICAgICAgaWYgZGVzY3JpcHRvci5jb2xvcj9cbiAgICAgICAgICAgIGNvbnRyb2wuY29sb3IgPSBDb2xvci5mcm9tQXJyYXkoZGVzY3JpcHRvci5jb2xvcilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBjb250cm9sXG4gICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhbiBpbWFnZSBtYXAgVUkgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlSW1hZ2VNYXBcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yIC0gVGhlIFVJIG9iamVjdCBkZXNjcmlwdG9yLlxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X1VJRWxlbWVudH0gVGhlIGNyZWF0ZWQgaW1hZ2UgYnV0dG9uIFVJIG9iamVjdC5cbiAgICAjIyMgICAgICAgIFxuICAgIGNyZWF0ZUltYWdlTWFwOiAoZGVzY3JpcHRvcikgLT5cbiAgICAgICAgY29udHJvbCA9IG5ldyB1aS5PYmplY3RfSW1hZ2VNYXAoKVxuICAgICAgICBjb250cm9sLmhvdHNwb3RzID0gKGRlc2NyaXB0b3IuaG90c3BvdHN8fFtdKS5zZWxlY3QgKGgpIC0+IFxuICAgICAgICAgICAgeyB4OiBoLnJlY3RbMF0sIHk6IGgucmVjdFsxXSwgc2l6ZTogeyB3aWR0aDogaC5yZWN0WzJdLCBoZWlnaHQ6IGgucmVjdFszXSB9LCBkYXRhOiB7IGFjdGlvbjogMywgYWN0aW9uczogaC5hY3Rpb25zIH0gfVxuICAgICAgICBjb250cm9sLmltYWdlcyA9IGRlc2NyaXB0b3IuaW1hZ2VzXG4gICAgICAgIGNvbnRyb2wuaW5zZXJ0Q29tcG9uZW50KG5ldyB1aS5Db21wb25lbnRfQWN0aW9uSGFuZGxlcigpLCAxLCBcImFjdGlvbkhhbmRsZXJcIilcbiAgICAgICAgY29udHJvbC50YXJnZXQgPSBTY2VuZU1hbmFnZXIuc2NlbmUuYmVoYXZpb3JcbiAgICAgICAgY29udHJvbC52aXN1YWwudmFyaWFibGVDb250ZXh0ID0gbmV3IGdzLkludGVycHJldGVyQ29udGV4dChTY2VuZU1hbmFnZXIuc2NlbmUubGF5b3V0TmFtZSwgU2NlbmVNYW5hZ2VyLnNjZW5lKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDcmVhdGVzIGEgdmlkZW8gVUkgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlVmlkZW9cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yIC0gVGhlIFVJIG9iamVjdCBkZXNjcmlwdG9yLlxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X1VJRWxlbWVudH0gVGhlIGNyZWF0ZWQgaW1hZ2UgYnV0dG9uIFVJIG9iamVjdC5cbiAgICAjIyMgICAgXG4gICAgY3JlYXRlVmlkZW86IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICBjb250cm9sID0gbmV3IHVpLk9iamVjdF9WaWRlbygpXG4gICAgICAgIGNvbnRyb2wudmlkZW8gPSBkZXNjcmlwdG9yLnZpZGVvXG4gICAgICAgIGNvbnRyb2wubG9vcCA9IGRlc2NyaXB0b3IubG9vcCA/IHllc1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xcbiAgICBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDcmVhdGVzIGEgcGFuZWwgVUkgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlUGFuZWxcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yIC0gVGhlIFVJIG9iamVjdCBkZXNjcmlwdG9yLlxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X1VJRWxlbWVudH0gVGhlIGNyZWF0ZWQgaW1hZ2UgYnV0dG9uIFVJIG9iamVjdC5cbiAgICAjIyMgICAgICAgXG4gICAgY3JlYXRlUGFuZWw6IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICBjb250cm9sID0gbmV3IHVpLk9iamVjdF9QYW5lbCgpXG4gICAgICAgIGNvbnRyb2wubW9kYWwgPSBkZXNjcmlwdG9yLm1vZGFsID8gbm9cbiAgICAgICAgaWYgZGVzY3JpcHRvci5jb2xvcj9cbiAgICAgICAgICAgIGNvbnRyb2wuY29sb3IgPSBDb2xvci5mcm9tQXJyYXkoZGVzY3JpcHRvci5jb2xvcilcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gY29udHJvbFxuICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgYSBmcmFtZSBVSSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBjcmVhdGVGcmFtZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGRlc2NyaXB0b3IgLSBUaGUgVUkgb2JqZWN0IGRlc2NyaXB0b3IuXG4gICAgKiBAcmV0dXJuIHtncy5PYmplY3RfVUlFbGVtZW50fSBUaGUgY3JlYXRlZCBpbWFnZSBidXR0b24gVUkgb2JqZWN0LlxuICAgICMjIyAgICAgICAgICAgXG4gICAgY3JlYXRlRnJhbWU6IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICBjb250cm9sID0gbmV3IHVpLk9iamVjdF9GcmFtZShkZXNjcmlwdG9yLmZyYW1lU2tpbilcbiAgICAgICAgY29udHJvbC5mcmFtZVRoaWNrbmVzcyA9IGRlc2NyaXB0b3IuZnJhbWVUaGlja25lc3MgfHwgMTZcbiAgICAgICAgY29udHJvbC5mcmFtZUNvcm5lclNpemUgPSBkZXNjcmlwdG9yLmZyYW1lQ29ybmVyU2l6ZSB8fCAxNlxuICAgICAgICBjb250cm9sLmltYWdlID0gZGVzY3JpcHRvci5pbWFnZVxuICAgICAgICBjb250cm9sLmltYWdlcyA9IGRlc2NyaXB0b3IuaW1hZ2VzXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY29udHJvbFxuICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgYSB0aHJlZS1wYXJ0IGltYWdlIFVJIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZVRocmVlUGFydEltYWdlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBVSSBvYmplY3QgZGVzY3JpcHRvci5cbiAgICAqIEByZXR1cm4ge2dzLk9iamVjdF9VSUVsZW1lbnR9IFRoZSBjcmVhdGVkIGltYWdlIGJ1dHRvbiBVSSBvYmplY3QuXG4gICAgIyMjICAgICBcbiAgICBjcmVhdGVUaHJlZVBhcnRJbWFnZTogKGRlc2NyaXB0b3IpIC0+XG4gICAgICAgIGNvbnRyb2wgPSBuZXcgdWkuT2JqZWN0X1RocmVlUGFydEltYWdlKGRlc2NyaXB0b3IuZnJhbWVTa2luKVxuICAgICAgICBjb250cm9sLmZpcnN0UGFydFNpemUgPSBkZXNjcmlwdG9yLmZpcnN0UGFydFNpemUgfHwgMTZcbiAgICAgICAgY29udHJvbC5taWRkbGVQYXJ0U2l6ZSA9IGRlc2NyaXB0b3IubWlkZGxlUGFydFNpemUgfHwgMVxuICAgICAgICBjb250cm9sLmxhc3RQYXJ0U2l6ZSA9IGRlc2NyaXB0b3IubGFzdFBhcnRTaXplIHx8IDE2XG4gICAgICAgIGNvbnRyb2wuaW1hZ2UgPSBkZXNjcmlwdG9yLmltYWdlXG4gICAgICAgIGNvbnRyb2wuaW1hZ2VzID0gZGVzY3JpcHRvci5pbWFnZXNcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb250cm9sXG4gICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgYSB0ZXh0IFVJIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZVRleHRcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yIC0gVGhlIFVJIG9iamVjdCBkZXNjcmlwdG9yLlxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X1VJRWxlbWVudH0gVGhlIGNyZWF0ZWQgaW1hZ2UgYnV0dG9uIFVJIG9iamVjdC5cbiAgICAjIyMgICAgIFxuICAgIGNyZWF0ZVRleHQ6IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICBjb250cm9sID0gbmV3IHVpLk9iamVjdF9UZXh0KClcbiAgICAgICAgY29udHJvbC50ZXh0ID0gbGNzKGRlc2NyaXB0b3IudGV4dClcbiAgICAgICAgY29udHJvbC5zaXplVG9GaXQgPSBkZXNjcmlwdG9yLnNpemVUb0ZpdFxuICAgICAgICBjb250cm9sLmZvcm1hdHRpbmcgPSBkZXNjcmlwdG9yLmZvcm1hdHRpbmdcbiAgICAgICAgY29udHJvbC53b3JkV3JhcCA9IGRlc2NyaXB0b3Iud29yZFdyYXAgPyBub1xuICAgICAgICBjb250cm9sLmJlaGF2aW9yLmZvcm1hdCA9IGRlc2NyaXB0b3IuZm9ybWF0XG4gICAgICAgIGlmIGRlc2NyaXB0b3IudGV4dFBhZGRpbmdcbiAgICAgICAgICAgIGNvbnRyb2wuYmVoYXZpb3IucGFkZGluZyA9IHVpLlNwYWNlLmZyb21BcnJheShkZXNjcmlwdG9yLnRleHRQYWRkaW5nKVxuICAgICAgICBpZiBkZXNjcmlwdG9yLnJlc29sdmVQbGFjZWhvbGRlcnM/XG4gICAgICAgICAgICBjb250cm9sLnJlc29sdmVQbGFjZWhvbGRlcnMgPSBkZXNjcmlwdG9yLnJlc29sdmVQbGFjZWhvbGRlcnNcbiAgICAgICAgaWYgZGVzY3JpcHRvci5jb2xvcj9cbiAgICAgICAgICAgIGNvbnRyb2wuY29sb3IgPSBDb2xvci5mcm9tQXJyYXkoZGVzY3JpcHRvci5jb2xvcilcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gY29udHJvbFxuICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgYSBmcmVlLWxheW91dCBVSSBvYmplY3QuXG4gICAgKlxuICAgICogQG1ldGhvZCBjcmVhdGVGcmVlTGF5b3V0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBVSSBvYmplY3QgZGVzY3JpcHRvci5cbiAgICAqIEByZXR1cm4ge2dzLk9iamVjdF9VSUVsZW1lbnR9IFRoZSBjcmVhdGVkIGltYWdlIGJ1dHRvbiBVSSBvYmplY3QuXG4gICAgIyMjIFxuICAgIGNyZWF0ZUZyZWVMYXlvdXQ6IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICBpZiBkZXNjcmlwdG9yLmZyYW1lP1xuICAgICAgICAgICAgY29udHJvbCA9IG5ldyB1aS5PYmplY3RfRnJlZUxheW91dChkZXNjcmlwdG9yLmZyYW1lWzBdIHx8IDAsIGRlc2NyaXB0b3IuZnJhbWVbMV0gfHwgMCwgZGVzY3JpcHRvci5mcmFtZVsyXSB8fCAxLCBkZXNjcmlwdG9yLmZyYW1lWzNdIHx8IDEpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnRyb2wgPSBuZXcgdWkuT2JqZWN0X0ZyZWVMYXlvdXQoMCwgMCwgMSwgMSlcbiAgICAgICAgY29udHJvbC5zaXplVG9GaXQgPSBkZXNjcmlwdG9yLnNpemVUb0ZpdFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDcmVhdGVzIGEgc3RhY2stbGF5b3V0IFVJIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZVN0YWNrTGF5b3V0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBVSSBvYmplY3QgZGVzY3JpcHRvci5cbiAgICAqIEByZXR1cm4ge2dzLk9iamVjdF9VSUVsZW1lbnR9IFRoZSBjcmVhdGVkIGltYWdlIGJ1dHRvbiBVSSBvYmplY3QuXG4gICAgIyMjICAgICBcbiAgICBjcmVhdGVTdGFja0xheW91dDogKGRlc2NyaXB0b3IpIC0+XG4gICAgICAgIGlmIGRlc2NyaXB0b3IuZnJhbWU/XG4gICAgICAgICAgICBjb250cm9sID0gbmV3IHVpLk9iamVjdF9TdGFja0xheW91dChkZXNjcmlwdG9yLmZyYW1lWzBdIHx8IDAsIGRlc2NyaXB0b3IuZnJhbWVbMV0gfHwgMCwgZGVzY3JpcHRvci5mcmFtZVsyXSB8fCAxLCBkZXNjcmlwdG9yLmZyYW1lWzNdIHx8IDEsIGRlc2NyaXB0b3Iub3JpZW50YXRpb24pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnRyb2wgPSBuZXcgdWkuT2JqZWN0X1N0YWNrTGF5b3V0KDAsIDAsIDEsIDEsIGRlc2NyaXB0b3Iub3JpZW50YXRpb24pXG4gICAgICAgIGNvbnRyb2wuc2l6ZVRvRml0ID0gZGVzY3JpcHRvci5zaXplVG9GaXRcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb250cm9sXG4gICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhIHNwcmVhZC1sYXlvdXQgVUkgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlU3ByZWFkTGF5b3V0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBVSSBvYmplY3QgZGVzY3JpcHRvci5cbiAgICAqIEByZXR1cm4ge2dzLk9iamVjdF9VSUVsZW1lbnR9IFRoZSBjcmVhdGVkIGltYWdlIGJ1dHRvbiBVSSBvYmplY3QuXG4gICAgIyMjICAgICBcbiAgICBjcmVhdGVTcHJlYWRMYXlvdXQ6IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICBpZiBkZXNjcmlwdG9yLmZyYW1lP1xuICAgICAgICAgICAgY29udHJvbCA9IG5ldyB1aS5PYmplY3RfU3ByZWFkTGF5b3V0KGRlc2NyaXB0b3IuZnJhbWVbMF0gfHwgMCwgZGVzY3JpcHRvci5mcmFtZVsxXSB8fCAwLCBkZXNjcmlwdG9yLmZyYW1lWzJdIHx8IDEsIGRlc2NyaXB0b3IuZnJhbWVbM10gfHwgMSwgZGVzY3JpcHRvci5vcmllbnRhdGlvbilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29udHJvbCA9IG5ldyB1aS5PYmplY3RfU3ByZWFkTGF5b3V0KDAsIDAsIDEsIDEsIGRlc2NyaXB0b3Iub3JpZW50YXRpb24pXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xcbiAgICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhIGdyaWQtbGF5b3V0IFVJIG9iamVjdC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGNyZWF0ZUdyaWRMYXlvdXRcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yIC0gVGhlIFVJIG9iamVjdCBkZXNjcmlwdG9yLlxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X1VJRWxlbWVudH0gVGhlIGNyZWF0ZWQgaW1hZ2UgYnV0dG9uIFVJIG9iamVjdC5cbiAgICAjIyMgICAgXG4gICAgY3JlYXRlR3JpZExheW91dDogKGRlc2NyaXB0b3IpIC0+XG4gICAgICAgIGlmIGRlc2NyaXB0b3IuZnJhbWU/XG4gICAgICAgICAgICBjb250cm9sID0gbmV3IHVpLk9iamVjdF9HcmlkTGF5b3V0KGRlc2NyaXB0b3IuZnJhbWVbMF0sIGRlc2NyaXB0b3IuZnJhbWVbMV0sIGRlc2NyaXB0b3IuZnJhbWVbMl0sIGRlc2NyaXB0b3IuZnJhbWVbM10sIGRlc2NyaXB0b3Iucm93cywgZGVzY3JpcHRvci5jb2x1bW5zLCBkZXNjcmlwdG9yLnRlbXBsYXRlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb250cm9sID0gbmV3IHVpLk9iamVjdF9HcmlkTGF5b3V0KDAsIDAsIDEsIDEsIGRlc2NyaXB0b3Iucm93cywgZGVzY3JpcHRvci5jb2x1bW5zLCBkZXNjcmlwdG9yLnRlbXBsYXRlKVxuICAgICAgICBjb250cm9sLmNlbGxTcGFjaW5nID0gZGVzY3JpcHRvci5jZWxsU3BhY2luZyB8fCBbMCwgMCwgMCwgMF1cbiAgICAgICAgY29udHJvbC5zaXplVG9GaXQgPSBkZXNjcmlwdG9yLnNpemVUb0ZpdFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xcbiAgICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhIG1lc3NhZ2UgVUkgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlTWVzc2FnZVxuICAgICogQHBhcmFtIHtPYmplY3R9IGRlc2NyaXB0b3IgLSBUaGUgVUkgb2JqZWN0IGRlc2NyaXB0b3IuXG4gICAgKiBAcmV0dXJuIHtncy5PYmplY3RfVUlFbGVtZW50fSBUaGUgY3JlYXRlZCBpbWFnZSBidXR0b24gVUkgb2JqZWN0LlxuICAgICMjIyAgICAgXG4gICAgY3JlYXRlTWVzc2FnZTogKGRlc2NyaXB0b3IpIC0+XG4gICAgICAgIGNvbnRyb2wgPSBuZXcgdWkuT2JqZWN0X01lc3NhZ2UoKSBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb250cm9sXG4gICAgIFxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgYSBkYXRhLWdyaWQgVUkgb2JqZWN0LlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlRGF0YUdyaWRcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yIC0gVGhlIFVJIG9iamVjdCBkZXNjcmlwdG9yLlxuICAgICogQHJldHVybiB7Z3MuT2JqZWN0X1VJRWxlbWVudH0gVGhlIGNyZWF0ZWQgaW1hZ2UgYnV0dG9uIFVJIG9iamVjdC5cbiAgICAjIyMgICAgXG4gICAgY3JlYXRlRGF0YUdyaWQ6IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICBjb250cm9sID0gbmV3IHVpLk9iamVjdF9EYXRhR3JpZChkZXNjcmlwdG9yKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogQ3JlYXRlcyBhbiBVSSBvYmplY3QgZGVwZW5kaW5nIG9uIHRoZSBvYmplY3QtdHlwZSBvZiB0aGUgc3BlY2lmaWVkIFVJIGRlc2NyaXB0b3IuXG4gICAgKlxuICAgICogQG1ldGhvZCBjcmVhdGVDb250cm9sXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBVSSBvYmplY3QgZGVzY3JpcHRvci5cbiAgICAqIEByZXR1cm4ge2dzLk9iamVjdF9VSUVsZW1lbnR9IFRoZSBjcmVhdGVkIFVJIG9iamVjdC5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgIFxuICAgIGNyZWF0ZUNvbnRyb2w6IChkZXNjcmlwdG9yKSAtPlxuICAgICAgICBjb250cm9sID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGRlc2NyaXB0b3IudHlwZVxuICAgICAgICAgICAgd2hlbiBcInVpLkltYWdlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjb250cm9sID0gQGNyZWF0ZUltYWdlQnV0dG9uKGRlc2NyaXB0b3IpXG4gICAgICAgICAgICB3aGVuIFwidWkuSW1hZ2VcIlxuICAgICAgICAgICAgICAgIGNvbnRyb2wgPSBAY3JlYXRlSW1hZ2UoZGVzY3JpcHRvcilcbiAgICAgICAgICAgIHdoZW4gXCJ1aS5JbWFnZU1hcFwiXG4gICAgICAgICAgICAgICAgY29udHJvbCA9IEBjcmVhdGVJbWFnZU1hcChkZXNjcmlwdG9yKVxuICAgICAgICAgICAgd2hlbiBcInVpLlZpZGVvXCJcbiAgICAgICAgICAgICAgICBjb250cm9sID0gQGNyZWF0ZVZpZGVvKGRlc2NyaXB0b3IpXG4gICAgICAgICAgICB3aGVuIFwidWkuUGFuZWxcIlxuICAgICAgICAgICAgICAgIGNvbnRyb2wgPSBAY3JlYXRlUGFuZWwoZGVzY3JpcHRvcilcbiAgICAgICAgICAgIHdoZW4gXCJ1aS5GcmFtZVwiXG4gICAgICAgICAgICAgICAgY29udHJvbCA9IEBjcmVhdGVGcmFtZShkZXNjcmlwdG9yKVxuICAgICAgICAgICAgd2hlbiBcInVpLlRocmVlUGFydEltYWdlXCJcbiAgICAgICAgICAgICAgICBjb250cm9sID0gQGNyZWF0ZVRocmVlUGFydEltYWdlKGRlc2NyaXB0b3IpXG4gICAgICAgICAgICB3aGVuIFwidWkuVGV4dFwiXG4gICAgICAgICAgICAgICAgY29udHJvbCA9IEBjcmVhdGVUZXh0KGRlc2NyaXB0b3IpXG4gICAgICAgICAgICB3aGVuIFwidWkuTWVzc2FnZVwiXG4gICAgICAgICAgICAgICAgY29udHJvbCA9IEBjcmVhdGVNZXNzYWdlKGRlc2NyaXB0b3IpXG4gICAgICAgICAgICB3aGVuIFwidWkuRGF0YUdyaWRcIlxuICAgICAgICAgICAgICAgIGNvbnRyb2wgPSBAY3JlYXRlRGF0YUdyaWQoZGVzY3JpcHRvcilcbiAgICAgICAgICAgIHdoZW4gXCJ1aS5GcmVlTGF5b3V0XCJcbiAgICAgICAgICAgICAgICBjb250cm9sID0gQGNyZWF0ZUZyZWVMYXlvdXQoZGVzY3JpcHRvcilcbiAgICAgICAgICAgIHdoZW4gXCJ1aS5TdGFja0xheW91dFwiXG4gICAgICAgICAgICAgICAgY29udHJvbCA9IEBjcmVhdGVTdGFja0xheW91dChkZXNjcmlwdG9yKVxuICAgICAgICAgICAgd2hlbiBcInVpLlNwcmVhZExheW91dFwiXG4gICAgICAgICAgICAgICAgY29udHJvbCA9IEBjcmVhdGVTcHJlYWRMYXlvdXQoZGVzY3JpcHRvcilcbiAgICAgICAgICAgIHdoZW4gXCJ1aS5HcmlkTGF5b3V0XCJcbiAgICAgICAgICAgICAgICBjb250cm9sID0gQGNyZWF0ZUdyaWRMYXlvdXQoZGVzY3JpcHRvcilcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xcbiAgICBcbiAgICBcbiAgICBjcmVhdGVMYXlvdXRSZWN0OiAoZnJhbWUsIGNvbnRyb2wpIC0+XG4gICAgICAgIGlmICFjb250cm9sLmxheW91dFJlY3RcbiAgICAgICAgICAgIGNvbnRyb2wubGF5b3V0UmVjdCA9IG5ldyB1aS5MYXlvdXRSZWN0KClcbiAgICAgICAgY29udHJvbC5sYXlvdXRSZWN0LnNldCgwLCAwLCAwLCAwKVxuICAgICAgICBcbiAgICAgICAgaWYgZnJhbWU/XG4gICAgICAgICAgICBpZiBmcmFtZVswXT8ubGVuZ3RoP1xuICAgICAgICAgICAgICAgIGNvbnRyb2wubGF5b3V0UmVjdC54ID0gQGNyZWF0ZUNhbGNGdW5jdGlvbihmcmFtZVswXSlcbiAgICAgICAgICAgICAgICBjb250cm9sLmRzdFJlY3QueCA9IDBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb250cm9sLmRzdFJlY3QueCA9IChkZXNjcmlwdG9yLmZyYW1lWzBdID8gY29udHJvbC5kc3RSZWN0LngpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBmcmFtZVsxXT8ubGVuZ3RoP1xuICAgICAgICAgICAgICAgIGNvbnRyb2wubGF5b3V0UmVjdC55ID0gQGNyZWF0ZUNhbGNGdW5jdGlvbihmcmFtZVsxXSlcbiAgICAgICAgICAgICAgICBjb250cm9sLmRzdFJlY3QueSA9IDBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb250cm9sLmRzdFJlY3QueSA9IChmcmFtZVsxXSA/IGNvbnRyb2wuZHN0UmVjdC55KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZnJhbWVbMl0/Lmxlbmd0aD9cbiAgICAgICAgICAgICAgICBjb250cm9sLmxheW91dFJlY3Qud2lkdGggPSBAY3JlYXRlQ2FsY0Z1bmN0aW9uKGZyYW1lWzJdKVxuICAgICAgICAgICAgICAgIGNvbnRyb2wuZHN0UmVjdC53aWR0aCA9IDFcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb250cm9sLmRzdFJlY3Qud2lkdGggPSAoZnJhbWVbMl0gPyBjb250cm9sLmRzdFJlY3Qud2lkdGgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBmcmFtZVszXT8ubGVuZ3RoP1xuICAgICAgICAgICAgICAgIGNvbnRyb2wubGF5b3V0UmVjdC5oZWlnaHQgPSBAY3JlYXRlQ2FsY0Z1bmN0aW9uKGZyYW1lWzNdKVxuICAgICAgICAgICAgICAgIGNvbnRyb2wuZHN0UmVjdC5oZWlnaHQgPSAxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29udHJvbC5kc3RSZWN0LmhlaWdodCA9IChmcmFtZVszXSA/IGNvbnRyb2wuZHN0UmVjdC5oZWlnaHQpXG4gICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIEFkZHMgdGhlIHN0eWxlcyBkZWZpbmVkIGluIGFuIGFycmF5IG9mIHN0eWxlLW5hbWVzIHRvIHRoZSBzcGVjaWZpZWQgY29udHJvbC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGFkZENvbnRyb2xTdHlsZXNcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250cm9sIC0gVGhlIGNvbnRyb2wgdG8gYWRkIHRoZSBzdHlsZXMgdG8uXG4gICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzdHlsZXMgLSBBcnJheSBvZiBzdHlsZS1uYW1lcyB0byBhZGQuXG4gICAgIyMjICAgICBcbiAgICBhZGRDb250cm9sU3R5bGVzOiAoY29udHJvbCwgc3R5bGVzKSAtPlxuICAgICAgICBmb3Igc3R5bGVOYW1lIGluIHN0eWxlc1xuICAgICAgICAgICAgaWYgQHN0eWxlc0J5TmFtZVtzdHlsZU5hbWVdP1xuICAgICAgICAgICAgICAgIGZvciBzdHlsZSBpbiBAc3R5bGVzQnlOYW1lW3N0eWxlTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgY29udHJvbC5zdHlsZXMucHVzaChzdHlsZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgc3R5bGUudGFyZ2V0ID09IC0xIGFuZCBzdHlsZS5zZWxlY3RvciA9PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZS5hcHBseShjb250cm9sKVxuICAgICMjIypcbiAgICAqIENyZWF0ZXMgYW4gVUkgb2JqZWN0IGZyb20gYSBzcGVjaWZpZWQgVUkgZGVzY3JpcHRvci4gVGhpcyBtZXRob2QgaXMgY2FsbGVkXG4gICAgKiByZWN1cnNpdmVseSBmb3IgYWxsIGNoaWxkLWRlc2NyaXB0b3JzLlxuICAgICpcbiAgICAqIEBtZXRob2QgY3JlYXRlQ29udHJvbEZyb21EZXNjcmlwdG9yXG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIFRoZSBVSSBvYmplY3QgZGVzY3JpcHRvci5cbiAgICAqIEBwYXJhbSB7Z3MuT2JqZWN0X1VJRWxlbWVudH0gcGFyZW50IC0gVGhlIFVJIHBhcmVudCBvYmplY3QuIChBIGxheW91dCBmb3IgZXhhbXBsZSkuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgaW5kZXguXG4gICAgKiBAcmV0dXJuIHtncy5PYmplY3RfVUlFbGVtZW50fSBUaGUgY3JlYXRlZCBVSSBvYmplY3QuXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgIyMjICAgICAgICBcbiAgICBjcmVhdGVDb250cm9sRnJvbURlc2NyaXB0b3I6IChkZXNjcmlwdG9yLCBwYXJlbnQsIGluZGV4KSAtPlxuICAgICAgICBjb250cm9sID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5zdHlsZT9cbiAgICAgICAgICAgIGRlc2NyaXB0b3Iuc3R5bGVzID0gW2Rlc2NyaXB0b3Iuc3R5bGVdXG4gICAgICAgICAgICBkZWxldGUgZGVzY3JpcHRvci5zdHlsZVxuICAgICAgICAgICAgXG4gICAgICAgIGRlc2NyaXB0b3IgPSBPYmplY3QuZGVlcENvcHkoZGVzY3JpcHRvcilcbiAgICAgICAgQGV4ZWN1dGVQbGFjZWhvbGRlckZvcm11bGFzKGRlc2NyaXB0b3IsIGRlc2NyaXB0b3IuaWQsIGRlc2NyaXB0b3IucGFyYW1zKVxuICAgICAgICAgICAgXG4gICAgICAgIGNvbnRyb2wgPSBAY3JlYXRlQ29udHJvbChkZXNjcmlwdG9yKVxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGNvbnRyb2w/XG4gICAgICAgICAgICB0eXBlID0gT2JqZWN0LmRlZXBDb3B5KEBjdXN0b21UeXBlc1tkZXNjcmlwdG9yLnR5cGVdKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAZXhlY3V0ZVBsYWNlaG9sZGVyRm9ybXVsYXModHlwZSwgZGVzY3JpcHRvci5pZCwgZGVzY3JpcHRvci5wYXJhbXMpXG4gICAgICAgXG4gICAgICAgICAgICB0eXBlTmFtZSA9IHR5cGUudHlwZVxuICAgICAgICAgICAgY3VzdG9tRmllbGRzID0gdHlwZS5jdXN0b21GaWVsZHNcbiAgICAgICAgICAgIGJpbmRpbmdzID0gdHlwZS5iaW5kaW5nc1xuICAgICAgICAgICAgZm9ybXVsYXMgPSB0eXBlLmZvcm11bGFzXG4gICAgICAgICAgICBhY3Rpb25zID0gdHlwZS5hY3Rpb25zXG4gICAgICAgICAgICBpZiB0eXBlLnN0eWxlP1xuICAgICAgICAgICAgICAgIHR5cGUuc3R5bGVzID0gW3R5cGUuc3R5bGVdXG4gICAgICAgICAgICAgICAgdHlwZS5zdHlsZSA9IG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIE9iamVjdC5taXhpbih0eXBlLCBkZXNjcmlwdG9yKVxuICAgICAgICAgICAgaWYgY3VzdG9tRmllbGRzPyB0aGVuIE9iamVjdC5taXhpbih0eXBlLmN1c3RvbUZpZWxkcywgY3VzdG9tRmllbGRzKVxuICAgICAgICAgICAgaWYgYmluZGluZ3M/IGFuZCBiaW5kaW5ncyAhPSB0eXBlLmJpbmRpbmdzIHRoZW4gdHlwZS5iaW5kaW5ncyA9IHR5cGUuYmluZGluZ3MuY29uY2F0KGJpbmRpbmdzKVxuICAgICAgICAgICAgaWYgZm9ybXVsYXM/IGFuZCBmb3JtdWxhcyAhPSB0eXBlLmZvcm11bGFzIHRoZW4gdHlwZS5mb3JtdWxhcyA9IHR5cGUuZm9ybXVsYXMuY29uY2F0KGZvcm11bGFzKVxuICAgICAgICAgICAgaWYgYWN0aW9ucz8gYW5kIGFjdGlvbnMgIT0gdHlwZS5hY3Rpb25zIHRoZW4gdHlwZS5hY3Rpb25zID0gYWN0aW9ucy5jb25jYXQodHlwZS5hY3Rpb25zKVxuICAgICAgICAgICAgdHlwZS50eXBlID0gdHlwZU5hbWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIEBjcmVhdGVDb250cm9sRnJvbURlc2NyaXB0b3IodHlwZSwgcGFyZW50KVxuICAgICAgICBlbHNlIGlmIHBhcmVudD9cbiAgICAgICAgICAgIHBhcmVudC5hZGRPYmplY3QoY29udHJvbClcbiAgICAgICAgICAgIGNvbnRyb2wuaW5kZXggPSBpbmRleFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQuYWRkT2JqZWN0KGNvbnRyb2wpXG4gICAgICAgICBcbiAgICAgICAgY29udHJvbC51aSA9IG5ldyB1aS5Db21wb25lbnRfVUlCZWhhdmlvcigpXG4gICAgICAgIGNvbnRyb2wuYWRkQ29tcG9uZW50KGNvbnRyb2wudWkpXG4gICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY29udHJvbC5wYXJhbXMgPSBkZXNjcmlwdG9yLnBhcmFtc1xuICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci51cGRhdGVCZWhhdmlvciA9PSBcImNvbnRpbnVvdXNcIlxuICAgICAgICAgICAgY29udHJvbC51cGRhdGVCZWhhdmlvciA9IHVpLlVwZGF0ZUJlaGF2aW9yLkNPTlRJTlVPVVNcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBkZXNjcmlwdG9yLmluaGVyaXRQcm9wZXJ0aWVzXG4gICAgICAgICAgICBjb250cm9sLmluaGVyaXRQcm9wZXJ0aWVzID0geWVzXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5mb250P1xuICAgICAgICAgICAgY29udHJvbC5mb250ID0gbmV3IEZvbnQoZGVzY3JpcHRvci5mb250Lm5hbWUsIGRlc2NyaXB0b3IuZm9udC5zaXplKVxuICAgICAgICAgICAgY29udHJvbC5mb250LmJvbGQgPSBkZXNjcmlwdG9yLmZvbnQuYm9sZCA/IGNvbnRyb2wuZm9udC5ib2xkXG4gICAgICAgICAgICBjb250cm9sLmZvbnQuaXRhbGljID0gZGVzY3JpcHRvci5mb250Lml0YWxpYyA/IGNvbnRyb2wuZm9udC5pdGFsaWNcbiAgICAgICAgICAgIGNvbnRyb2wuZm9udC5zbWFsbENhcHMgPSBkZXNjcmlwdG9yLmZvbnQuc21hbGxDYXBzID8gY29udHJvbC5mb250LnNtYWxsQ2Fwc1xuICAgICAgICAgICAgY29udHJvbC5mb250LnVuZGVybGluZSA9IGRlc2NyaXB0b3IuZm9udC51bmRlcmxpbmUgPyBjb250cm9sLmZvbnQudW5kZXJsaW5lXG4gICAgICAgICAgICBjb250cm9sLmZvbnQuc3RyaWtlVGhyb3VnaCA9IGRlc2NyaXB0b3IuZm9udC5zdHJpa2VUaHJvdWdoID8gY29udHJvbC5mb250LnN0cmlrZVRocm91Z2hcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZGVzY3JpcHRvci5mb250LmNvbG9yP1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZm9udC5jb2xvciA9IENvbG9yLmZyb21BcnJheShkZXNjcmlwdG9yLmZvbnQuY29sb3IpXG4gICAgICAgICAgICBpZiBkZXNjcmlwdG9yLmZvbnQuYm9yZGVyP1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZm9udC5ib3JkZXIgPSBkZXNjcmlwdG9yLmZvbnQuYm9yZGVyID8gbm9cbiAgICAgICAgICAgICAgICBjb250cm9sLmZvbnQuYm9yZGVyU2l6ZSA9IGRlc2NyaXB0b3IuZm9udC5ib3JkZXJTaXplID8gNFxuICAgICAgICAgICAgICAjaWYgZGVzY3JpcHRvci5mb250LmJvcmRlci5jb2xvclxuICAgICAgICAgICAgIyAgICAgICAgY29udHJvbC5mb250LmJvcmRlckNvbG9yID0gQ29sb3IuZnJvbUFycmF5KGRlc2NyaXB0b3IuZm9udC5ib3JkZXIuY29sb3IpXG4gICAgICAgICAgICAgICAgY29udHJvbC5mb250LmJvcmRlckNvbG9yID0gbmV3IENvbG9yKDAsIDAsIDApXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBkZXNjcmlwdG9yLmZvbnQub3V0bGluZT9cbiAgICAgICAgICAgICAgICBjb250cm9sLmZvbnQuYm9yZGVyID0gZGVzY3JpcHRvci5mb250Lm91dGxpbmUgPyBub1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZm9udC5ib3JkZXJTaXplID0gZGVzY3JpcHRvci5mb250Lm91dGxpbmUuc2l6ZSA/IDRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBkZXNjcmlwdG9yLmZvbnQub3V0bGluZS5jb2xvcj9cbiAgICAgICAgICAgICAgICAgICAgY29udHJvbC5mb250LmJvcmRlckNvbG9yID0gQ29sb3IuZnJvbUFycmF5KGRlc2NyaXB0b3IuZm9udC5vdXRsaW5lLmNvbG9yKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbC5mb250LmJvcmRlckNvbG9yID0gbmV3IENvbG9yKDAsIDAsIDApXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5jb21wb25lbnRzP1xuICAgICAgICAgICAgZm9yIGMgaW4gZGVzY3JpcHRvci5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgbSA9IGMubW9kdWxlIHx8IFwiZ3NcIlxuICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyB3aW5kb3dbbV1bYy50eXBlXShjLnBhcmFtcylcbiAgICAgICAgICAgICAgICBjb250cm9sLmFkZENvbXBvbmVudChjb21wb25lbnQsIGMuaWQpXG4gICAgICAgICAgICAgICAgY29udHJvbFtjLmlkXSA9IGNvbXBvbmVudFxuICAgICAgICAgICAgICAgICNjb21wb25lbnQuc2V0dXA/KClcbiAgICAgICAgIFxuICAgICAgICBjb250cm9sLmZvY3VzYWJsZSA9IGRlc2NyaXB0b3IuZm9jdXNhYmxlID8gY29udHJvbC5mb2N1c2FibGUgICAgICAgXG4gICAgICAgIGlmIGRlc2NyaXB0b3IubmV4dEtleU9iamVjdFxuICAgICAgICAgICAgY29udHJvbC51aS5uZXh0S2V5T2JqZWN0SWQgPSBkZXNjcmlwdG9yLm5leHRLZXlPYmplY3RcbiAgICAgICAgXG4gICAgICAgIGlmIGRlc2NyaXB0b3IuaW5pdGlhbEZvY3VzXG4gICAgICAgICAgICBjb250cm9sLnVpLmZvY3VzKClcbiAgICAgICAgICAgIFxuICAgICAgICBhY3Rpb25zID0gT2JqZWN0LmRlZXBDb3B5KGlmIGRlc2NyaXB0b3IuYWN0aW9uPyB0aGVuIFtkZXNjcmlwdG9yLmFjdGlvbl0gZWxzZSBkZXNjcmlwdG9yLmFjdGlvbnMpIFxuICAgICAgICBpZiBhY3Rpb25zP1xuICAgICAgICAgICAgZm9yIGFjdGlvbiBpbiBhY3Rpb25zXG4gICAgICAgICAgICAgICAgaWYgYWN0aW9uP1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb24uZXZlbnQgPSBhY3Rpb24uZXZlbnQgPyBcIm9uQWNjZXB0XCJcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGFjdGlvbi50YXJnZXQ/XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBpZiBAY29udHJvbGxlcnM/IHRoZW4gQGNvbnRyb2xsZXJzW2Rlc2NyaXB0b3IudGFyZ2V0XSBlbHNlIGNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbi50YXJnZXQgPSB0YXJnZXQgfHwgU2NlbmVNYW5hZ2VyLnNjZW5lLmJlaGF2aW9yXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnRyb2wuYWN0aW9ucyA9IGFjdGlvbnNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIWNvbnRyb2wuZmluZENvbXBvbmVudEJ5SWQoXCJhY3Rpb25IYW5kbGVyXCIpKVxuICAgICAgICAgICAgICAgIGNvbnRyb2wuaW5zZXJ0Q29tcG9uZW50KG5ldyB1aS5Db21wb25lbnRfQWN0aW9uSGFuZGxlcigpLCAxLCBcImFjdGlvbkhhbmRsZXJcIilcbiAgICAgICAgXG4gICAgICAgIGlmIGRlc2NyaXB0b3IuaWQ/XG4gICAgICAgICAgICBjb250cm9sLmlkID0gZGVzY3JpcHRvci5pZFxuICAgICAgICAgICAgZ3MuT2JqZWN0TWFuYWdlci5jdXJyZW50LnNldE9iamVjdEJ5SWQoY29udHJvbCwgY29udHJvbC5pZClcbiAgICAgICAgICAgIFxuICAgICAgICBjb250cm9sLmRlc2NyaXB0b3IgPSBkZXNjcmlwdG9yXG4gICAgICAgIGNvbnRyb2wubGF5b3V0UmVjdCA9IG5ldyBSZWN0KClcbiAgICAgICAgY29udHJvbC5sYXlvdXRSZWN0LnNldCgwLCAwLCAwLCAwKVxuICAgICAgICBpZiBkZXNjcmlwdG9yLmZyYW1lP1xuICAgICAgICAgICAgaWYgZGVzY3JpcHRvci5mcmFtZVswXT8ubGVuZ3RoP1xuICAgICAgICAgICAgICAgIGNvbnRyb2wubGF5b3V0UmVjdC54ID0gQGNyZWF0ZUNhbGNGdW5jdGlvbihkZXNjcmlwdG9yLmZyYW1lWzBdKVxuICAgICAgICAgICAgICAgIGNvbnRyb2wuZHN0UmVjdC54ID0gMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbnRyb2wuZHN0UmVjdC54ID0gKGRlc2NyaXB0b3IuZnJhbWVbMF0gPyBjb250cm9sLmRzdFJlY3QueClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGRlc2NyaXB0b3IuZnJhbWVbMV0/Lmxlbmd0aD9cbiAgICAgICAgICAgICAgICBjb250cm9sLmxheW91dFJlY3QueSA9IEBjcmVhdGVDYWxjRnVuY3Rpb24oZGVzY3JpcHRvci5mcmFtZVsxXSlcbiAgICAgICAgICAgICAgICBjb250cm9sLmRzdFJlY3QueSA9IDBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb250cm9sLmRzdFJlY3QueSA9IChkZXNjcmlwdG9yLmZyYW1lWzFdID8gY29udHJvbC5kc3RSZWN0LnkpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBkZXNjcmlwdG9yLmZyYW1lWzJdPy5sZW5ndGg/XG4gICAgICAgICAgICAgICAgY29udHJvbC5sYXlvdXRSZWN0LndpZHRoID0gQGNyZWF0ZUNhbGNGdW5jdGlvbihkZXNjcmlwdG9yLmZyYW1lWzJdKVxuICAgICAgICAgICAgICAgIGNvbnRyb2wuZHN0UmVjdC53aWR0aCA9IDFcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb250cm9sLmRzdFJlY3Qud2lkdGggPSAoZGVzY3JpcHRvci5mcmFtZVsyXSA/IGNvbnRyb2wuZHN0UmVjdC53aWR0aClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGRlc2NyaXB0b3IuZnJhbWVbM10/Lmxlbmd0aD9cbiAgICAgICAgICAgICAgICBjb250cm9sLmxheW91dFJlY3QuaGVpZ2h0ID0gQGNyZWF0ZUNhbGNGdW5jdGlvbihkZXNjcmlwdG9yLmZyYW1lWzNdKSAjcGFyc2VJbnQoZGVzY3JpcHRvci5mcmFtZVszXS5zcGxpdChcIiVcIilbMF0pXG4gICAgICAgICAgICAgICAgY29udHJvbC5kc3RSZWN0LmhlaWdodCA9IDFcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb250cm9sLmRzdFJlY3QuaGVpZ2h0ID0gKGRlc2NyaXB0b3IuZnJhbWVbM10gPyBjb250cm9sLmRzdFJlY3QuaGVpZ2h0KVxuICAgICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5zaXplVG9QYXJlbnQ/XG4gICAgICAgICAgICBjb250cm9sLnNpemVUb1BhcmVudCA9IGRlc2NyaXB0b3Iuc2l6ZVRvUGFyZW50XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5ibGVuZE1vZGU/XG4gICAgICAgICAgICBjb250cm9sLmJsZW5kTW9kZSA9IEBibGVuZE1vZGVzW2Rlc2NyaXB0b3IuYmxlbmRNb2RlXVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGRlc2NyaXB0b3IuYW5jaG9yP1xuICAgICAgICAgICAgY29udHJvbC5hbmNob3Iuc2V0KGRlc2NyaXB0b3IuYW5jaG9yWzBdLCBkZXNjcmlwdG9yLmFuY2hvclsxXSlcbiAgICAgICAgXG5cbiAgICAgICAgY29udHJvbC5vcGFjaXR5ID0gZGVzY3JpcHRvci5vcGFjaXR5ID8gMjU1ICAgIFxuICAgICAgICBpZiBkZXNjcmlwdG9yLm1pbmltdW1TaXplP1xuICAgICAgICAgICAgY29udHJvbC5taW5pbXVtU2l6ZSA9IHsgd2lkdGg6IGRlc2NyaXB0b3IubWluaW11bVNpemVbMF0sIGhlaWdodDogZGVzY3JpcHRvci5taW5pbXVtU2l6ZVsxXSB9XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5yZXNpemFibGU/IHRoZW4gY29udHJvbC5yZXNpemFibGUgPSBkZXNjcmlwdG9yLnJlc2l6YWJsZVxuICAgICAgICBpZiBkZXNjcmlwdG9yLnNjcm9sbGFibGU/IHRoZW4gY29udHJvbC5zY3JvbGxhYmxlID0gZGVzY3JpcHRvci5zY3JvbGxhYmxlIFxuICAgICAgICBpZiBkZXNjcmlwdG9yLmZpeGVkU2l6ZT8gdGhlbiBjb250cm9sLmZpeGVkU2l6ZSA9IGRlc2NyaXB0b3IuZml4ZWRTaXplXG4gICAgICAgIGlmIGRlc2NyaXB0b3IuZHJhZ2dhYmxlP1xuICAgICAgICAgICAgY29udHJvbC5kcmFnZ2FibGUgPSBkZXNjcmlwdG9yLmRyYWdnYWJsZVxuICAgICAgICAgICAgY29udHJvbC5kcmFnZ2FibGUuc3RlcCA9IDBcbiAgICAgICAgICAgIGlmIGNvbnRyb2wuZHJhZ2dhYmxlLnJlY3Q/XG4gICAgICAgICAgICAgICAgY29udHJvbC5kcmFnZ2FibGUucmVjdCA9IFJlY3QuZnJvbUFycmF5KGNvbnRyb2wuZHJhZ2dhYmxlLnJlY3QpXG4gICAgICAgICAgICBjb250cm9sLmFkZENvbXBvbmVudChuZXcgdWkuQ29tcG9uZW50X0RyYWdnYWJsZSgpKVxuICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5iaW5kaW5ncz9cbiAgICAgICAgICAgIGNvbnRyb2wuYmluZGluZ3MgPSBkZXNjcmlwdG9yLmJpbmRpbmdzXG4gICAgICAgICAgICBjb250cm9sLmluc2VydENvbXBvbmVudChuZXcgdWkuQ29tcG9uZW50X0JpbmRpbmdIYW5kbGVyKCksIDApXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5mb3JtdWxhcz9cbiAgICAgICAgICAgIGNvbnRyb2wuZm9ybXVsYXMgPSBkZXNjcmlwdG9yLmZvcm11bGFzXG4gICAgICAgICAgICBjb250cm9sLmluc2VydENvbXBvbmVudChuZXcgdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyKCksIDApXG4gICAgICAgICAgICBcbiAgICAgICAgY29udHJvbC5kYXRhRmllbGQgPSBkZXNjcmlwdG9yLmRhdGFGaWVsZFxuICAgICAgICBjb250cm9sLmVuYWJsZWQgPSBkZXNjcmlwdG9yLmVuYWJsZWQgPyB5ZXNcbiAgICAgICAgaWYgZGVzY3JpcHRvci5zZWxlY3RhYmxlPyB0aGVuIGNvbnRyb2wuc2VsZWN0YWJsZSA9IGRlc2NyaXB0b3Iuc2VsZWN0YWJsZVxuICAgICAgICBpZiBkZXNjcmlwdG9yLmdyb3VwPyBcbiAgICAgICAgICAgIGNvbnRyb2wuZ3JvdXAgPSBkZXNjcmlwdG9yLmdyb3VwXG4gICAgICAgICAgICBncy5PYmplY3RNYW5hZ2VyLmN1cnJlbnQuYWRkVG9Hcm91cChjb250cm9sLCBjb250cm9sLmdyb3VwKVxuICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5jdXN0b21GaWVsZHM/XG4gICAgICAgICAgICBjb250cm9sLmN1c3RvbUZpZWxkcyA9IE9iamVjdC5kZWVwQ29weShkZXNjcmlwdG9yLmN1c3RvbUZpZWxkcylcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBkZXNjcmlwdG9yLm1hcmdpbj9cbiAgICAgICAgICAgIGNvbnRyb2wubWFyZ2luLmxlZnQgPSBkZXNjcmlwdG9yLm1hcmdpblswXVxuICAgICAgICAgICAgY29udHJvbC5tYXJnaW4udG9wID0gZGVzY3JpcHRvci5tYXJnaW5bMV1cbiAgICAgICAgICAgIGNvbnRyb2wubWFyZ2luLnJpZ2h0ID0gZGVzY3JpcHRvci5tYXJnaW5bMl1cbiAgICAgICAgICAgIGNvbnRyb2wubWFyZ2luLmJvdHRvbSA9IGRlc2NyaXB0b3IubWFyZ2luWzNdXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5wYWRkaW5nP1xuICAgICAgICAgICAgY29udHJvbC5wYWRkaW5nLmxlZnQgPSBkZXNjcmlwdG9yLnBhZGRpbmdbMF1cbiAgICAgICAgICAgIGNvbnRyb2wucGFkZGluZy50b3AgPSBkZXNjcmlwdG9yLnBhZGRpbmdbMV1cbiAgICAgICAgICAgIGNvbnRyb2wucGFkZGluZy5yaWdodCA9IGRlc2NyaXB0b3IucGFkZGluZ1syXVxuICAgICAgICAgICAgY29udHJvbC5wYWRkaW5nLmJvdHRvbSA9IGRlc2NyaXB0b3IucGFkZGluZ1szXVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGRlc2NyaXB0b3IuYWxpZ25tZW50P1xuICAgICAgICAgICAgY29udHJvbC5hbGlnbm1lbnQgPSBAYWxpZ25tZW50c1tkZXNjcmlwdG9yLmFsaWdubWVudF1cbiAgICAgICAgICAgIFxuICAgICAgICBjb250cm9sLmFsaWdubWVudFkgPSBAYWxpZ25tZW50c1tkZXNjcmlwdG9yLmFsaWdubWVudFkgfHwgMF1cbiAgICAgICAgY29udHJvbC5hbGlnbm1lbnRYID0gQGFsaWdubWVudHNbZGVzY3JpcHRvci5hbGlnbm1lbnRYIHx8IDBdXG4gICAgICAgIGNvbnRyb2wuekluZGV4ID0gZGVzY3JpcHRvci56SW5kZXggfHwgMFxuICAgICAgICBjb250cm9sLm9yZGVyID0gZGVzY3JpcHRvci5vcmRlciB8fCAwXG4gICAgICAgIGNvbnRyb2wuY2hhaW5PcmRlciA9IChkZXNjcmlwdG9yLmNoYWluT3JkZXIgPyBkZXNjcmlwdG9yLnpPcmRlcikgKyAocGFyZW50Py5jaGFpbk9yZGVyIHx8IDApXG4gICAgICAgIGlmIGRlc2NyaXB0b3Iuem9vbT9cbiAgICAgICAgICAgIGNvbnRyb2wuem9vbSA9IHg6IGRlc2NyaXB0b3Iuem9vbVswXSAvIDEwMCwgeTogZGVzY3JpcHRvci56b29tWzFdIC8gMTAwXG4gICAgICAgICNjb250cm9sLmRhdGFGaWVsZHMgPSBkYXRhRmllbGRzXG4gICAgICAgICNjb250cm9sLmNvbnRyb2xsZXJzID0gQGNvbnRyb2xsZXJzXG4gICAgICAgICNjb250cm9sLmNvbnRyb2xsZXIgPSBjb250cm9sbGVyXG4gICAgICAgIFxuICAgICAgICBpZiBkZXNjcmlwdG9yLnZpc2libGU/XG4gICAgICAgICAgICBjb250cm9sLnZpc2libGUgPSBkZXNjcmlwdG9yLnZpc2libGVcbiAgICAgICAgaWYgZGVzY3JpcHRvci5jbGlwUmVjdFxuICAgICAgICAgICAgY29udHJvbC5jbGlwUmVjdCA9IG5ldyBSZWN0KGNvbnRyb2wuZHN0UmVjdC54LCBjb250cm9sLmRzdFJlY3QueSwgY29udHJvbC5kc3RSZWN0LndpZHRoLCBjb250cm9sLmRzdFJlY3QuaGVpZ2h0KVxuXG4gICAgICAgIGlmIGRlc2NyaXB0b3Iuc3R5bGVzP1xuICAgICAgICAgICAgQGFkZENvbnRyb2xTdHlsZXMoY29udHJvbCwgZGVzY3JpcHRvci5zdHlsZXMpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGRlc2NyaXB0b3IudGVtcGxhdGU/XG4gICAgICAgICAgICBjb250cm9sLmJlaGF2aW9yLm1hbmFnZW1lbnRNb2RlID0gdWkuTGF5b3V0TWFuYWdlbWVudE1vZGUuZnJvbVN0cmluZyhkZXNjcmlwdG9yLm1hbmFnZW1lbnRNb2RlKVxuICAgICAgICAgICAgZGF0YSA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKGNvbnRyb2wsIGNvbnRyb2wuZGF0YUZpZWxkKSAjY29udHJvbC5kYXRhRmllbGRzW2NvbnRyb2wuZGF0YUZpZWxkXVxuICAgICAgICAgICAgaXNOdW1iZXIgPSB0eXBlb2YgZGF0YSA9PSBcIm51bWJlclwiXG4gICAgICAgICAgICBpZiBkYXRhP1xuICAgICAgICAgICAgICAgIGZvciBpIGluIFswLi4uKGRhdGEubGVuZ3RoID8gZGF0YSldXG4gICAgICAgICAgICAgICAgICAgIGlmIGRhdGFbaV0/IG9yIGlzTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZCA9IHllc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZGVzY3JpcHRvci5kYXRhRmlsdGVyPyBhbmQgbm90IGlzTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB1aS5Db21wb25lbnRfSGFuZGxlci5jaGVja0NvbmRpdGlvbihkYXRhW2ldLCBkZXNjcmlwdG9yLmRhdGFGaWx0ZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWxpZCBvciBpc051bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkID0gQGNyZWF0ZUNvbnRyb2xGcm9tRGVzY3JpcHRvcihkZXNjcmlwdG9yLnRlbXBsYXRlLCBjb250cm9sLCBpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICNjaGlsZC5kYXRhRmllbGRzID0gY29udHJvbC5kYXRhRmllbGRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZGF0YVtpXT8uZHN0UmVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5kc3RSZWN0ID0gdWkuVUlFbGVtZW50UmVjdGFuZ2xlLmZyb21SZWN0KGNoaWxkLCBkYXRhW2ldLmRzdFJlY3QpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdCBjaGlsZC5jbGlwUmVjdD8pIGFuZCBjb250cm9sLmNsaXBSZWN0P1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5jbGlwUmVjdCA9IGNvbnRyb2wuY2xpcFJlY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjY2hpbGQucGFyZW50ID0gY29udHJvbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2wuYWRkT2JqZWN0KGNoaWxkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmluZGV4ID0gaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLm9yZGVyID0gKGRhdGEubGVuZ3RoID8gZGF0YSkgLSBpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbC5jb250cm9scy5wdXNoKGNoaWxkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5jb250cm9scyBhbmQgZGVzY3JpcHRvci5jb250cm9scy5leGVjXG4gICAgICAgICAgICBjb250cm9scyA9IHVpLkNvbXBvbmVudF9Gb3JtdWxhSGFuZGxlci5maWVsZFZhbHVlKGRlc2NyaXB0b3IsIGRlc2NyaXB0b3IuY29udHJvbHMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnRyb2xzID0gZGVzY3JpcHRvci5jb250cm9sc1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNvbnRyb2xzP1xuICAgICAgICAgICAgZm9yIGl0ZW0sIGkgaW4gY29udHJvbHNcbiAgICAgICAgICAgICAgICBjaGlsZENvbnRyb2wgPSBAX2NyZWF0ZUZyb21EZXNjcmlwdG9yKGl0ZW0sIGNvbnRyb2wsIGkpXG4gICAgICAgICAgICAgICAgaWYgKG5vdCBjaGlsZENvbnRyb2wuY2xpcFJlY3Q/KSBhbmQgY29udHJvbC5jbGlwUmVjdD9cbiAgICAgICAgICAgICAgICAgICAgY2hpbGRDb250cm9sLmNsaXBSZWN0ID0gY29udHJvbC5jbGlwUmVjdFxuICAgICAgICAgICAgICAgIGNoaWxkQ29udHJvbC5pbmRleCA9IGlcbiAgICAgICAgICAgICAgICBjaGlsZENvbnRyb2wub3JpZ2luLnggPSBjb250cm9sLm9yaWdpbi54ICsgY29udHJvbC5kc3RSZWN0LnhcbiAgICAgICAgICAgICAgICBjaGlsZENvbnRyb2wub3JpZ2luLnkgPSBjb250cm9sLm9yaWdpbi55ICsgY29udHJvbC5kc3RSZWN0LnlcbiAgICAgICAgICAgICAgICAjY2hpbGRDb250cm9sLnBhcmVudCA9IGNvbnRyb2xcbiAgICAgICAgICAgICAgICBjb250cm9sLmFkZE9iamVjdChjaGlsZENvbnRyb2wpXG4gICAgICAgICAgICAgICAgY29udHJvbC5jb250cm9scy5wdXNoKGNoaWxkQ29udHJvbClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY29udHJvbC5zdHlsZXMgYW5kIGNvbnRyb2wucGFyZW50c0J5U3R5bGVcbiAgICAgICAgICAgICNmb3Igc3R5bGUgaW4gY29udHJvbC5zdHlsZXNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcGFyZW50ID0gY29udHJvbC5wYXJlbnRcbiAgICAgICAgICAgIHdoaWxlIHBhcmVudFxuICAgICAgICAgICAgICAgIGlmIHBhcmVudC5zdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgZm9yIHN0eWxlIGluIHBhcmVudC5zdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICFjb250cm9sLnBhcmVudHNCeVN0eWxlW3N0eWxlLmlkXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2wucGFyZW50c0J5U3R5bGVbc3R5bGUuaWRdID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2wucGFyZW50c0J5U3R5bGVbc3R5bGUuaWRdLnB1c2gocGFyZW50KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICN3aGlsZSBwYXJlbnRcbiAgICAgICAgICAgICAgICAgICAgI2lmIHBhcmVudC5jb250cm9sc0J5U3R5bGVcbiAgICAgICAgICAgICAgICAgICAgIyAgICBpZighcGFyZW50LmNvbnRyb2xzQnlTdHlsZVtzdHlsZS5pZF0pXG4gICAgICAgICAgICAgICAgICAgICMgICAgICAgIHBhcmVudC5jb250cm9sc0J5U3R5bGVbc3R5bGUuaWRdID0gW11cbiAgICAgICAgICAgICAgICAgICAgIyAgICBwYXJlbnQuY29udHJvbHNCeVN0eWxlW3N0eWxlLmlkXS5wdXNoKGNvbnRyb2wpXG4gICAgICAgICAgICAgICAgICAjICBpZiBjb250cm9sLnBhcmVudHNCeVN0eWxlXG4gICAgICAgICAgICAgICAgICAjICAgICAgaWYgIWNvbnRyb2wucGFyZW50c0J5U3R5bGVbc3R5bGUuaWRdXG4gICAgICAgICAgICAgICAgICAjICAgICAgICAgIGNvbnRyb2wucGFyZW50c0J5U3R5bGVbc3R5bGUuaWRdID0gW11cbiAgICAgICAgICAgICAgICAgICMgICAgICBjb250cm9sLnBhcmVudHNCeVN0eWxlW3N0eWxlLmlkXS5wdXNoKHBhcmVudClcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5hbmltYXRpb25zP1xuICAgICAgICAgICAgY29udHJvbC5hbmltYXRpb25zID0gT2JqZWN0LmRlZXBDb3B5KGRlc2NyaXB0b3IuYW5pbWF0aW9ucylcbiAgICAgICAgICAgIGNvbnRyb2wuYW5pbWF0aW9uRXhlY3V0b3IgPSBuZXcgdWkuQ29tcG9uZW50X0FuaW1hdGlvbkV4ZWN1dG9yKClcbiAgICAgICAgICAgIGNvbnRyb2wuYWRkQ29tcG9uZW50KGNvbnRyb2wuYW5pbWF0aW9uRXhlY3V0b3IpXG4gICAgICAgICAgICBjb250cm9sLmFkZENvbXBvbmVudChuZXcgdWkuQ29tcG9uZW50X0FuaW1hdGlvbkhhbmRsZXIoKSlcbiAgICAgICAgIFxuICAgICAgICBjb250cm9sLnVpLnVwZGF0ZVN0eWxlKClcbiAgICAgICAgY29udHJvbC5zZXR1cCgpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY29udHJvbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBDcmVhdGVzIGFuIFVJIG9iamVjdCBmcm9tIGEgc3BlY2lmaWVkIFVJIGRlc2NyaXB0b3IuXG4gICAgKlxuICAgICogQG1ldGhvZCBfY3JlYXRlRnJvbURlc2NyaXB0b3JcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yIC0gVGhlIFVJIG9iamVjdCBkZXNjcmlwdG9yLlxuICAgICogQHBhcmFtIHtncy5PYmplY3RfVUlFbGVtZW50fSBwYXJlbnQgLSBUaGUgVUkgcGFyZW50IG9iamVjdC4gKEEgbGF5b3V0IGZvciBleGFtcGxlKS5cbiAgICAqIEByZXR1cm4ge2dzLk9iamVjdF9VSUVsZW1lbnR9IFRoZSBjcmVhdGVkIFVJIG9iamVjdC5cbiAgICAqIEBwcm90ZWN0ZWQgXG4gICAgIyMjICAgXG4gICAgX2NyZWF0ZUZyb21EZXNjcmlwdG9yOiAoZGVzY3JpcHRvciwgcGFyZW50LCBpbmRleCkgLT4gICAgIFxuICAgICAgICBjb250cm9sID0gQGNyZWF0ZUNvbnRyb2xGcm9tRGVzY3JpcHRvcihkZXNjcmlwdG9yLCBwYXJlbnQsIGluZGV4KVxuICAgICAgICBcbiAgICAgICAgaWYgZGVzY3JpcHRvci5jb250cm9sbGVyP1xuICAgICAgICAgICAgY29udHJvbGxlciA9IEBjb250cm9sbGVyc1tkZXNjcmlwdG9yLmNvbnRyb2xsZXJdXG4gICAgICAgICAgICBjb250cm9sLmNvbnRyb2xsZXIgPSBjb250cm9sbGVyXG4gICAgICAgICAgICBjb250cm9sLmFkZENvbXBvbmVudChjb250cm9sbGVyKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gY29udHJvbFxuICAgICAgICBcbiAgICBjcmVhdGVMYXlvdXRGcm9tRGVzY3JpcHRvcjogKGRlc2NyaXB0b3IsIHBhcmVudCwgaW5kZXgpIC0+XG4gICAgICAgIEBfY3JlYXRlRnJvbURlc2NyaXB0b3IoZGVzY3JpcHRvciwgcGFyZW50LCBpbmRleClcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuR3JhcGhpY3Mud2lkdGggPSAkUEFSQU1TLnJlc29sdXRpb24ud2lkdGhcbkdyYXBoaWNzLmhlaWdodCA9ICRQQVJBTVMucmVzb2x1dGlvbi5oZWlnaHRcbnVpLlVpRmFjdG9yeSA9IG5ldyBVSU1hbmFnZXIoKVxudWkuVUlNYW5hZ2VyID0gdWkuVWlGYWN0b3J5Il19
//# sourceURL=UIManager_107.js