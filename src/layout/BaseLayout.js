
import { isNode , OBJECT_TYPE, SKIN, DEBUG } from 'global/globals';
import { dhtmlxObject } from 'global/dhtmlxObject';
import { LayoutCell } from 'LayoutCell';

/**
  * Base class for all layout objects, see:
  * https://docs.dhtmlx.com/layout__index.html
  */
export class BaseLayout extends dhtmlxObject {
	
	/**
	 * Creates the BaseLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {string} pattern - dhtmlx layout pattern, see: http://docs.dhtmlx.com/layout__patterns.html
	 */
	constructor (container, pattern) {
		if (DEBUG) {
			console.log('BaseLayout constructor');
		}
		var impl = null;
		if (isNode(container)) {
			
			impl = new dhtmlXLayoutObject({
				// id or object for parent container
				parent: container,    	
				// layout's pattern			
				pattern: pattern,
				// layout's skin
				skin: SKIN
			});
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL) {			
			impl = container.impl.attachLayout(pattern);
		}
		super(OBJECT_TYPE.LAYOUT, container, impl);	
		this.initCells();
	}
	
	/**  Internal method called by the constructor */
	initCells() {
		// Needed inside the forEachItem
		var cells = this.childs;	
		this.impl.forEachItem(function (cellImpl) {
			var cell = new LayoutCell(this, cellImpl);
			cells.push(cell);
		});
	}
}