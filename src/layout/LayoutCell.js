
import { DEBUG, OBJECT_TYPE } from 'global/globals';
import { dhtmlxObject } from 'global/dhtmlxObject';

/**
  * Base class for all layout objects, see:
  * https://docs.dhtmlx.com/layout__index.html
  */
export class LayoutCell extends dhtmlxObject {
	
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
		
		super(OBJECT_TYPE.LAYOUT_CELL, container, impl);
		
		// Header is hidden by default
		impl.hideHeader();
		
		impl.setText('');
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
}