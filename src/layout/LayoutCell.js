
import { DEBUG, OBJECT_TYPE } from 'globals';
import { dhtmlxObject } from 'dhtmlxObject';

export class LayoutCell extends dhtmlxObject {
	
	constructor (container, impl) {
		if (DEBUG) {
			console.log('LayoutCell constructor.');
		}
		
		super(OBJECT_TYPE.LAYOUT_CELL, container, impl);
		
		// Header is hidden by default
		impl.hideHeader();
		
		impl.setText('');
	}
	
	load (url, async, data) {
		this.impl.attachURL(url, async, data);
	}
	
	get height () {
		return this.impl.getHeight();
	}
	
	set height (height) {
		this.impl.setHeight(height);
	}
	
	set html (html) {
		this.impl.attachHTMLString(html);
	}
}