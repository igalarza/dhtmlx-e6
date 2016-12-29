
import { isNode , OBJECT_TYPE } from 'globals';
import { dhtmlxObject } from 'dhtmlxObject';
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
	 * @param {string} pattern - dhtmlx object, must be created by child class.
	 */
	constructor (container, pattern) {
		var impl = null;
		if (typeof container === 'string' || isNode(container)) {
			
			impl = new dhtmlXLayoutObject({
				// id or object for parent container
				parent: container,    	
				// layout's pattern			
				pattern: pattern          	
			});
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL) {			
			impl = container.impl.attachLayout(pattern);
		}
		super(OBJECT_TYPE.LAYOUT, container, impl);
		this._cells = [];	
		this.initCells();
	}
	
	/**  Internal method called by the constructor */
	initCells() {
		// Needed inside the forEachItem
		var cells = this._cells;	
		this.impl.forEachItem(function (cellImpl) {
			var cell = new LayoutCell(this, cellImpl);
			cells.push(cell);
		});
	}
	
	destroy () {
		this.impl.unload();
	}
	
	/**
	 * Array of layout cells (regions inside the layout)
	 */
	get cells () {
		return this._cells;
	}
}