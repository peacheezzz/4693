var Component_TextBehavior,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Component_TextBehavior = (function(superClass) {
  extend(Component_TextBehavior, superClass);

  Component_TextBehavior.memoryUsage = 0;


  /**
  * Called if this object instance is restored from a data-bundle. It can be used
  * re-assign event-handler, anonymous functions, etc.
  * 
  * @method onDataBundleRestore.
  * @param Object data - The data-bundle
  * @param gs.ObjectCodecContext context - The codec-context.
   */

  Component_TextBehavior.prototype.onDataBundleRestore = function(data, context) {
    var ref, ref1, size;
    if (this.renderedLines) {
      size = this.object.textRenderer.measureFormattedLines(this.renderedLines, (ref = this.object.wordWrap) != null ? ref : true);
      this.refreshWithSize(size);
      this.refreshBitmap();
      return this.object.textRenderer.drawFormattedLines(this.padding.left, this.padding.top, this.padding.right, this.padding.bottom, this.renderedLines, (ref1 = this.object.wordWrap) != null ? ref1 : true);
    } else {
      return this.refresh(true);
    }
  };


  /**
  * 
  *
  * @module gs
  * @class Component_TextBehavior
  * @extends gs.Component
  * @memberof gs
  * @constructor
   */

  function Component_TextBehavior() {
    Component_TextBehavior.__super__.constructor.call(this);

    /**
    * The current text displayed.
    * @property text
    * @type string
    * @protected
     */
    this.text = "";
    this.renderedLines = null;

    /**
    * The space around the text.
    * @property padding
    * @type string
    * @protected
     */
    this.padding = new ui.Space(6, 0, 6, 0);

    /**
    * The font used for text-rendering.
    * @property font
    * @type string
    * @protected
     */
    this.font = new Font(gs.Fonts.TEXT);

    /**
    * Standard Format String which can be used if the text represents a number value.
    * Example: If the text is "3" and format is "%0d3" then 003 is the displayed text.
    * @property format
    * @type string
    * @protected
     */
    this.format = null;
  }


  /**
  * Disposes the component and bitmap.
  *
  * @method dispose
   */

  Component_TextBehavior.prototype.dispose = function() {
    if (this.object.bitmap != null) {
      this.object.bitmap.dispose();
      return this.object.bitmap = null;
    }
  };


  /**
  * Redraws the texts on game object's bitmap.
  *
  * @method redraw
   */

  Component_TextBehavior.prototype.redraw = function() {
    var ref, text;
    if (this.text != null) {
      this.object.bitmap.clear();
      this.object.bitmap.font = this.object.font;
      text = lcs(this.text);
      if (this.format != null) {
        text = sprintf(this.format, text);
      }
      if (this.object.formatting) {
        return this.renderedLines = this.object.textRenderer.drawFormattedText(this.padding.left, this.padding.top, this.padding.right, this.padding.bottom, text, (ref = this.object.wordWrap) != null ? ref : true);
      } else {
        return this.object.textRenderer.drawText(this.padding.left, this.padding.top, this.padding.right, this.padding.bottom, text);
      }
    }
  };


  /**
  * Updates the game object's <b>dstRect</b> so that the text fits in. That only works
  * if the game object's <b>sizeToFit</b> property is set.
  *
  * @method refreshSize
   */

  Component_TextBehavior.prototype.refreshSize = function() {
    var ref, size, text;
    if (this.object.text == null) {
      return;
    }
    this.text = this.object.text;
    text = lcs(this.object.text).toString();
    if (this.format != null) {
      text = sprintf(this.format, text);
    }
    if (this.object.sizeToFit) {
      this.object.font = this.object.font || this.font;
      if (this.object.formatting) {
        size = this.object.textRenderer.measureFormattedText(text, (ref = this.object.wordWrap) != null ? ref : true);
      } else {
        size = this.object.textRenderer.measureText(text);
      }
      return this.refreshWithSize(size);
    }
  };


  /**
  * Updates the game object's <b>dstRect</b> with the specified text size.
  *
  * @param {gs.Size} size - The text size to resize the game object for.
  * @method refreshWithSize
   */

  Component_TextBehavior.prototype.refreshWithSize = function(size) {
    if (!(this.object.sizeToFit.horizontal != null) || this.object.sizeToFit.horizontal) {
      this.object.dstRect.width = size.width + this.padding.right + this.padding.left;
    }
    if (!(this.object.sizeToFit.vertical != null) || this.object.sizeToFit.vertical) {
      return this.object.dstRect.height = size.height + this.padding.bottom + this.padding.top;
    }
  };


  /**
  * Recreates and clears the game object's bitmap if necessary.
  *
  * @method refreshBitmap
   */

  Component_TextBehavior.prototype.refreshBitmap = function() {
    var height, ref, ref1, ref2, width;
    width = ((ref = this.object.bitmap) != null ? ref.width : void 0) || 0;
    height = ((ref1 = this.object.bitmap) != null ? ref1.height : void 0) || 0;
    if (!this.object.bitmap || width !== this.object.dstRect.width || height !== this.object.dstRect.height) {
      if ((ref2 = this.object.bitmap) != null) {
        ref2.dispose();
      }
      this.object.bitmap = new Bitmap(this.object.dstRect.width, this.object.dstRect.height);
    } else {
      this.object.bitmap.clear();
    }
    return this.object.bitmap.font = this.object.font;
  };


  /**
  * Refreshes the texts on game object's bitmap. If the text or font has not been
  * changed, no refresh will happen.
  *
  * @method refresh
  * @param {boolean} force - If set to <b>true</b> it will force redrawing the text even if the
  * text and font has not been changed.
   */

  Component_TextBehavior.prototype.refresh = function(force) {
    var fontChange;
    fontChange = !this.font.compare(this.object.font);
    if ((this.object.text == null) || (!force && this.object.text === this.text && !fontChange)) {
      return;
    }
    if (fontChange) {
      this.font.set(this.object.font);
    }
    this.refreshSize();
    this.refreshBitmap();
    this.srcRect = new Rect(0, 0, this.object.dstRect.width, this.object.dstRect.height);
    this.object.srcRect = this.srcRect;
    return this.redraw();
  };


  /**
  * Action to append a specified text.
  *
  * @method addText
  * @param {Object} sender - The sender of the action.
  * @param {Object} params - The action's parameters.
   */

  Component_TextBehavior.prototype.addText = function(sender, params) {
    return this.object.text += ui.Component_FormulaHandler.fieldValue(sender, params.text);
  };


  /**
  * Updates the component. Checks if the game object's bitmap needs a refresh
  * and maybe disposes the bitmap if the game object's is out of the
  * screen and memory usage is too high.
  *
  * @method update
   */

  Component_TextBehavior.prototype.update = function() {
    var ref, visible;
    Component_TextBehavior.__super__.update.apply(this, arguments);
    visible = this.object.visual.visible;
    if (!this.object.bitmap || this.object.bitmap.width !== this.object.dstRect.width || this.object.bitmap.height !== this.object.dstRect.height || ((ref = lcs(this.object.text)) != null ? ref.toString() : void 0) !== lcs(this.text)) {
      return this.refresh();
    }
  };

  return Component_TextBehavior;

})(gs.Component);

gs.Component_TextBehavior = Component_TextBehavior;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUEsc0JBQUE7RUFBQTs7O0FBQU07OztFQUNGLHNCQUFDLENBQUEsV0FBRCxHQUFjOzs7QUFFZDs7Ozs7Ozs7O21DQVFBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDakIsUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLGFBQUo7TUFDSSxJQUFBLEdBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFZLENBQUMscUJBQXJCLENBQTJDLElBQUMsQ0FBQSxhQUE1QywrQ0FBOEUsSUFBOUU7TUFDUCxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFqQjtNQUNBLElBQUMsQ0FBQSxhQUFELENBQUE7YUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVksQ0FBQyxrQkFBckIsQ0FBd0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFqRCxFQUF1RCxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQWhFLEVBQXFFLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBOUUsRUFBcUYsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUE5RixFQUFzRyxJQUFDLENBQUEsYUFBdkcsaURBQXlJLElBQXpJLEVBSko7S0FBQSxNQUFBO2FBTUksSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBTko7O0VBRGlCOzs7QUFTckI7Ozs7Ozs7Ozs7RUFTYSxnQ0FBQTtJQUNULHNEQUFBOztBQUVBOzs7Ozs7SUFNQSxJQUFDLENBQUEsSUFBRCxHQUFRO0lBRVIsSUFBQyxDQUFBLGFBQUQsR0FBaUI7O0FBRWpCOzs7Ozs7SUFNQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFlLENBQWYsRUFBa0IsQ0FBbEI7O0FBRWY7Ozs7OztJQU1BLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxJQUFBLENBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxJ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LE9BQU8sQ0FBQyxNQUE3RyxnREFBd0ksQ0FBRSxRQUFuQixDQUFBLFdBQUEsS0FBaUMsR0FBQSxDQUFJLElBQUMsQ0FBQSxJQUFMLENBQTVKO2FBQ0ksSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQURKOztFQUpJOzs7O0dBeEx5QixFQUFFLENBQUM7O0FBK0x4QyxFQUFFLENBQUMsc0JBQUgsR0FBNEIiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IENvbXBvbmVudF9UZXh0QmVoYXZpb3JcbiNcbiMgICAkJENPUFlSSUdIVCQkXG4jXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbXBvbmVudF9UZXh0QmVoYXZpb3IgZXh0ZW5kcyBncy5Db21wb25lbnRcbiAgICBAbWVtb3J5VXNhZ2U6IDBcbiAgICBcbiAgICAjIyMqXG4gICAgKiBDYWxsZWQgaWYgdGhpcyBvYmplY3QgaW5zdGFuY2UgaXMgcmVzdG9yZWQgZnJvbSBhIGRhdGEtYnVuZGxlLiBJdCBjYW4gYmUgdXNlZFxuICAgICogcmUtYXNzaWduIGV2ZW50LWhhbmRsZXIsIGFub255bW91cyBmdW5jdGlvbnMsIGV0Yy5cbiAgICAqIFxuICAgICogQG1ldGhvZCBvbkRhdGFCdW5kbGVSZXN0b3JlLlxuICAgICogQHBhcmFtIE9iamVjdCBkYXRhIC0gVGhlIGRhdGEtYnVuZGxlXG4gICAgKiBAcGFyYW0gZ3MuT2JqZWN0Q29kZWNDb250ZXh0IGNvbnRleHQgLSBUaGUgY29kZWMtY29udGV4dC5cbiAgICAjIyNcbiAgICBvbkRhdGFCdW5kbGVSZXN0b3JlOiAoZGF0YSwgY29udGV4dCkgLT5cbiAgICAgICAgaWYgQHJlbmRlcmVkTGluZXNcbiAgICAgICAgICAgIHNpemUgPSBAb2JqZWN0LnRleHRSZW5kZXJlci5tZWFzdXJlRm9ybWF0dGVkTGluZXMoQHJlbmRlcmVkTGluZXMsIEBvYmplY3Qud29yZFdyYXAgPyB5ZXMpXG4gICAgICAgICAgICBAcmVmcmVzaFdpdGhTaXplKHNpemUpXG4gICAgICAgICAgICBAcmVmcmVzaEJpdG1hcCgpXG4gICAgICAgICAgICBAb2JqZWN0LnRleHRSZW5kZXJlci5kcmF3Rm9ybWF0dGVkTGluZXMoQHBhZGRpbmcubGVmdCwgQHBhZGRpbmcudG9wLCBAcGFkZGluZy5yaWdodCwgQHBhZGRpbmcuYm90dG9tLCBAcmVuZGVyZWRMaW5lcywgQG9iamVjdC53b3JkV3JhcCA/IHllcylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHJlZnJlc2godHJ1ZSlcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogXG4gICAgKlxuICAgICogQG1vZHVsZSBnc1xuICAgICogQGNsYXNzIENvbXBvbmVudF9UZXh0QmVoYXZpb3JcbiAgICAqIEBleHRlbmRzIGdzLkNvbXBvbmVudFxuICAgICogQG1lbWJlcm9mIGdzXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAjIyNcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgICMjIypcbiAgICAgICAgKiBUaGUgY3VycmVudCB0ZXh0IGRpc3BsYXllZC5cbiAgICAgICAgKiBAcHJvcGVydHkgdGV4dFxuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEB0ZXh0ID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgQHJlbmRlcmVkTGluZXMgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogVGhlIHNwYWNlIGFyb3VuZCB0aGUgdGV4dC5cbiAgICAgICAgKiBAcHJvcGVydHkgcGFkZGluZ1xuICAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjXG4gICAgICAgIEBwYWRkaW5nID0gbmV3IHVpLlNwYWNlKDYsIDAsIDYsIDApO1xuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFRoZSBmb250IHVzZWQgZm9yIHRleHQtcmVuZGVyaW5nLlxuICAgICAgICAqIEBwcm9wZXJ0eSBmb250XG4gICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGZvbnQgPSBuZXcgRm9udChncy5Gb250cy5URVhUKVxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIFN0YW5kYXJkIEZvcm1hdCBTdHJpbmcgd2hpY2ggY2FuIGJlIHVzZWQgaWYgdGhlIHRleHQgcmVwcmVzZW50cyBhIG51bWJlciB2YWx1ZS5cbiAgICAgICAgKiBFeGFtcGxlOiBJZiB0aGUgdGV4dCBpcyBcIjNcIiBhbmQgZm9ybWF0IGlzIFwiJTBkM1wiIHRoZW4gMDAzIGlzIHRoZSBkaXNwbGF5ZWQgdGV4dC5cbiAgICAgICAgKiBAcHJvcGVydHkgZm9ybWF0XG4gICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyNcbiAgICAgICAgQGZvcm1hdCA9IG51bGxcbiAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgdGhlIGNvbXBvbmVudCBhbmQgYml0bWFwLlxuICAgICpcbiAgICAqIEBtZXRob2QgZGlzcG9zZVxuICAgICMjI1xuICAgIGRpc3Bvc2U6IC0+XG4gICAgICAgIGlmIEBvYmplY3QuYml0bWFwP1xuICAgICAgICAgICAgQG9iamVjdC5iaXRtYXAuZGlzcG9zZSgpXG4gICAgICAgICAgICBAb2JqZWN0LmJpdG1hcCA9IG51bGxcbiAgICBcbiAgICAjIyMqXG4gICAgKiBSZWRyYXdzIHRoZSB0ZXh0cyBvbiBnYW1lIG9iamVjdCdzIGJpdG1hcC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlZHJhd1xuICAgICMjI1xuICAgIHJlZHJhdzogLT5cbiAgICAgICAgaWYgQHRleHQ/XG4gICAgICAgICAgICBAb2JqZWN0LmJpdG1hcC5jbGVhcigpXG4gICAgICAgICAgICBAb2JqZWN0LmJpdG1hcC5mb250ID0gQG9iamVjdC5mb250XG4gICAgICAgICAgICB0ZXh0ID0gbGNzKEB0ZXh0KVxuICAgICAgICAgICAgaWYgQGZvcm1hdD9cbiAgICAgICAgICAgICAgICB0ZXh0ID0gc3ByaW50ZihAZm9ybWF0LCB0ZXh0KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQG9iamVjdC5mb3JtYXR0aW5nXG4gICAgICAgICAgICAgICAgQHJlbmRlcmVkTGluZXMgPSBAb2JqZWN0LnRleHRSZW5kZXJlci5kcmF3Rm9ybWF0dGVkVGV4dChAcGFkZGluZy5sZWZ0LCBAcGFkZGluZy50b3AsIEBwYWRkaW5nLnJpZ2h0LCBAcGFkZGluZy5ib3R0b20sIHRleHQsIEBvYmplY3Qud29yZFdyYXAgPyB5ZXMpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG9iamVjdC50ZXh0UmVuZGVyZXIuZHJhd1RleHQoQHBhZGRpbmcubGVmdCwgQHBhZGRpbmcudG9wLCBAcGFkZGluZy5yaWdodCwgQHBhZGRpbmcuYm90dG9tLCB0ZXh0KVxuXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgZ2FtZSBvYmplY3QncyA8Yj5kc3RSZWN0PC9iPiBzbyB0aGF0IHRoZSB0ZXh0IGZpdHMgaW4uIFRoYXQgb25seSB3b3Jrc1xuICAgICogaWYgdGhlIGdhbWUgb2JqZWN0J3MgPGI+c2l6ZVRvRml0PC9iPiBwcm9wZXJ0eSBpcyBzZXQuXG4gICAgKlxuICAgICogQG1ldGhvZCByZWZyZXNoU2l6ZVxuICAgICMjI1xuICAgIHJlZnJlc2hTaXplOiAtPlxuICAgICAgICBpZiBub3QgQG9iamVjdC50ZXh0PyAgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEB0ZXh0ID0gQG9iamVjdC50ZXh0XG4gICAgICAgIHRleHQgPSBsY3MoQG9iamVjdC50ZXh0KS50b1N0cmluZygpXG4gICAgICAgIFxuICAgICAgICBpZiBAZm9ybWF0P1xuICAgICAgICAgICAgdGV4dCA9IHNwcmludGYoQGZvcm1hdCwgdGV4dClcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAb2JqZWN0LnNpemVUb0ZpdFxuICAgICAgICAgICAgQG9iamVjdC5mb250ID0gQG9iamVjdC5mb250IHx8IEBmb250XG4gICAgICAgICAgICBpZiBAb2JqZWN0LmZvcm1hdHRpbmdcbiAgICAgICAgICAgICAgICBzaXplID0gQG9iamVjdC50ZXh0UmVuZGVyZXIubWVhc3VyZUZvcm1hdHRlZFRleHQodGV4dCwgQG9iamVjdC53b3JkV3JhcCA/IHllcylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzaXplID0gQG9iamVjdC50ZXh0UmVuZGVyZXIubWVhc3VyZVRleHQodGV4dClcbiAgICAgICAgICAgIEByZWZyZXNoV2l0aFNpemUoc2l6ZSlcbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIHRoZSBnYW1lIG9iamVjdCdzIDxiPmRzdFJlY3Q8L2I+IHdpdGggdGhlIHNwZWNpZmllZCB0ZXh0IHNpemUuXG4gICAgKlxuICAgICogQHBhcmFtIHtncy5TaXplfSBzaXplIC0gVGhlIHRleHQgc2l6ZSB0byByZXNpemUgdGhlIGdhbWUgb2JqZWN0IGZvci5cbiAgICAqIEBtZXRob2QgcmVmcmVzaFdpdGhTaXplXG4gICAgIyMjXG4gICAgcmVmcmVzaFdpdGhTaXplOiAoc2l6ZSkgLT5cbiAgICAgICAgaWYgIShAb2JqZWN0LnNpemVUb0ZpdC5ob3Jpem9udGFsPykgb3IgQG9iamVjdC5zaXplVG9GaXQuaG9yaXpvbnRhbFxuICAgICAgICAgICAgICAgIEBvYmplY3QuZHN0UmVjdC53aWR0aCA9IHNpemUud2lkdGggKyBAcGFkZGluZy5yaWdodCArIEBwYWRkaW5nLmxlZnRcbiAgICAgICAgaWYgIShAb2JqZWN0LnNpemVUb0ZpdC52ZXJ0aWNhbD8pIG9yIEBvYmplY3Quc2l6ZVRvRml0LnZlcnRpY2FsXG4gICAgICAgICAgICBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKyBAcGFkZGluZy5ib3R0b20gKyBAcGFkZGluZy50b3BcbiAgICAgXG4gICAgIyMjKlxuICAgICogUmVjcmVhdGVzIGFuZCBjbGVhcnMgdGhlIGdhbWUgb2JqZWN0J3MgYml0bWFwIGlmIG5lY2Vzc2FyeS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlZnJlc2hCaXRtYXBcbiAgICAjIyNcbiAgICByZWZyZXNoQml0bWFwOiAtPlxuICAgICAgICB3aWR0aCA9IEBvYmplY3QuYml0bWFwPy53aWR0aCB8fCAwXG4gICAgICAgIGhlaWdodCA9IEBvYmplY3QuYml0bWFwPy5oZWlnaHQgfHwgMFxuICAgICAgICBcbiAgICAgICAgaWYoIUBvYmplY3QuYml0bWFwIG9yIHdpZHRoICE9IEBvYmplY3QuZHN0UmVjdC53aWR0aCBvciBoZWlnaHQgIT0gQG9iamVjdC5kc3RSZWN0LmhlaWdodClcbiAgICAgICAgICAgIEBvYmplY3QuYml0bWFwPy5kaXNwb3NlKClcbiAgICAgICAgICAgIEBvYmplY3QuYml0bWFwID0gbmV3IEJpdG1hcChAb2JqZWN0LmRzdFJlY3Qud2lkdGggLCBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAb2JqZWN0LmJpdG1hcC5jbGVhcigpXG4gICAgICAgICAgICBcbiAgICAgICAgQG9iamVjdC5iaXRtYXAuZm9udCA9IEBvYmplY3QuZm9udFxuICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogUmVmcmVzaGVzIHRoZSB0ZXh0cyBvbiBnYW1lIG9iamVjdCdzIGJpdG1hcC4gSWYgdGhlIHRleHQgb3IgZm9udCBoYXMgbm90IGJlZW5cbiAgICAqIGNoYW5nZWQsIG5vIHJlZnJlc2ggd2lsbCBoYXBwZW4uXG4gICAgKlxuICAgICogQG1ldGhvZCByZWZyZXNoXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlIC0gSWYgc2V0IHRvIDxiPnRydWU8L2I+IGl0IHdpbGwgZm9yY2UgcmVkcmF3aW5nIHRoZSB0ZXh0IGV2ZW4gaWYgdGhlXG4gICAgKiB0ZXh0IGFuZCBmb250IGhhcyBub3QgYmVlbiBjaGFuZ2VkLlxuICAgICMjIyAgICAgICAgICAgIFxuICAgIHJlZnJlc2g6IChmb3JjZSkgLT5cbiAgICAgICAgZm9udENoYW5nZSA9ICFAZm9udC5jb21wYXJlKEBvYmplY3QuZm9udClcbiAgICAgICAgaWYgIUBvYmplY3QudGV4dD8gb3IgKCFmb3JjZSBhbmQgQG9iamVjdC50ZXh0ID09IEB0ZXh0IGFuZCAhZm9udENoYW5nZSkgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIEBmb250LnNldChAb2JqZWN0LmZvbnQpIGlmIGZvbnRDaGFuZ2VcbiAgICAgICAgQHJlZnJlc2hTaXplKClcbiAgICAgICAgQHJlZnJlc2hCaXRtYXAoKVxuICAgICAgICBcbiAgICAgICAgQHNyY1JlY3QgPSBuZXcgUmVjdCgwLCAwLCBAb2JqZWN0LmRzdFJlY3Qud2lkdGggLCBAb2JqZWN0LmRzdFJlY3QuaGVpZ2h0KVxuICAgICAgICBAb2JqZWN0LnNyY1JlY3QgPSBAc3JjUmVjdFxuICAgICAgICBAcmVkcmF3KClcbiAgICBcbiAgICAjIyMqXG4gICAgKiBBY3Rpb24gdG8gYXBwZW5kIGEgc3BlY2lmaWVkIHRleHQuXG4gICAgKlxuICAgICogQG1ldGhvZCBhZGRUZXh0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gc2VuZGVyIC0gVGhlIHNlbmRlciBvZiB0aGUgYWN0aW9uLlxuICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIFRoZSBhY3Rpb24ncyBwYXJhbWV0ZXJzLlxuICAgICMjIyAgXG4gICAgYWRkVGV4dDogKHNlbmRlciwgcGFyYW1zKSAtPlxuICAgICAgICBAb2JqZWN0LnRleHQgKz0gdWkuQ29tcG9uZW50X0Zvcm11bGFIYW5kbGVyLmZpZWxkVmFsdWUoc2VuZGVyLCBwYXJhbXMudGV4dClcbiAgICAgXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgY29tcG9uZW50LiBDaGVja3MgaWYgdGhlIGdhbWUgb2JqZWN0J3MgYml0bWFwIG5lZWRzIGEgcmVmcmVzaFxuICAgICogYW5kIG1heWJlIGRpc3Bvc2VzIHRoZSBiaXRtYXAgaWYgdGhlIGdhbWUgb2JqZWN0J3MgaXMgb3V0IG9mIHRoZVxuICAgICogc2NyZWVuIGFuZCBtZW1vcnkgdXNhZ2UgaXMgdG9vIGhpZ2guXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgICAgIFxuICAgIHVwZGF0ZTogLT5cbiAgICAgICAgc3VwZXJcbiAgICAgICAgdmlzaWJsZSA9IEBvYmplY3QudmlzdWFsLnZpc2libGVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAoIUBvYmplY3QuYml0bWFwIG9yIEBvYmplY3QuYml0bWFwLndpZHRoICE9IEBvYmplY3QuZHN0UmVjdC53aWR0aCBvciBAb2JqZWN0LmJpdG1hcC5oZWlnaHQgIT0gQG9iamVjdC5kc3RSZWN0LmhlaWdodCBvciBsY3MoQG9iamVjdC50ZXh0KT8udG9TdHJpbmcoKSAhPSBsY3MoQHRleHQpKVxuICAgICAgICAgICAgQHJlZnJlc2goKVxuICAgIFxuZ3MuQ29tcG9uZW50X1RleHRCZWhhdmlvciA9IENvbXBvbmVudF9UZXh0QmVoYXZpb3IiXX0=
//# sourceURL=Component_TextBehavior_7.js