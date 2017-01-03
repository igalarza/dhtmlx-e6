
import { DEBUG, OBJECT_TYPE } from 'global/config';
import { BaseObject } from 'global/BaseObject';

/**
  * Base class for all layout objects, see:
  * https://docs.dhtmlx.com/layout__index.html
  */
export class LayoutCell extends BaseObject {
	
	/**
	 * Creates the LayoutCell object, called from BaseLayout class
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {string} impl - dhtmlx object, created in the BaseLayout class.
	 */
	constructor (container, impl) {
		if (DEBUG) {
			console.log('LayoutCell constructor');
		}
		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 2) {
			this.init(container, impl);
		}
	}
	
	init (container, impl) {
		if (arguments.length === 2) {
			super.init(OBJECT_TYPE.LAYOUT_CELL, container, impl);
			
			// Header is hidden by default
			this.header = null;
		} else {
			throw new Error('LayoutCell init method requires two parameters');
		}
	}
	
	get height () {
		return this.impl.getHeight();
	}
	
	set height (height) {
		this.impl.setHeight(height);
	}
	
	get width () {
		return this.impl.getWidth();
	}
	
	set width (width) {
		this.impl.setWidth(width);
	}
	
	set html (html) {
		this.impl.attachHTMLString(html);
	}
	
	get header () {
		return this.impl.getText();
	}
	
	set header (text) {
		if (text == null) {
			this.impl.setText('');
			this.impl.hideHeader();
		} else {
			this.impl.setText(text);
			this.impl.showHeader();
		}		
	}
}