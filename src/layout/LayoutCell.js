
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
		
		// next line throws: Uncaught TypeError: Cannot read property 'style' of undefined
		// at window.dhtmlXLayoutCell.dhtmlXLayoutCell.hideArrow
		// impl.hideArrow();
	}
}