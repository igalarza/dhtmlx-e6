
import { isNode , OBJECT_TYPE, SKIN, DEBUG } from 'global/config';
import { BaseObject } from 'global/BaseObject';
import { LayoutCell } from 'LayoutCell';

/**
  * Base class for all layout objects, see:
  * https://docs.dhtmlx.com/layout__index.html
  */
export class BaseLayout extends BaseObject {
	
	/**
	 * Creates the BaseLayout object. Can be called without arguments, for testing purposes.
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {string} pattern - dhtmlx layout pattern, see: http://docs.dhtmlx.com/layout__patterns.html
	 */
	constructor (container, pattern) {
		if (DEBUG) {
			console.log('BaseLayout constructor');
		}
		
		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 2) {
			this.init(container, pattern);
		}
	}
	
	init(container, pattern) {
		
		if (arguments.length === 2) {
		
			// Creates the dhtmlx object (see function below)
			var impl = initDhtmlxLayout(container, pattern);
			
			// BaseObject init method
			super.init(OBJECT_TYPE.LAYOUT, container, impl);
			
			// Inits the LayoutCell objects
			this.initCells();
			
			if (container instanceof LayoutCell) {
				var containerLayout = container.container;
				containerLayout.attachEvent("onResizeFinish", function(){
					impl.setSizes();
				});
			}
			
		} else {
			throw new Error('BaseLayout init method requires two parameters');
		}
	}
	
	/**  
	 * Internal method called by the constructor, it creates the LayoutCell 
	 * objects and adds them to the this.childs array
	 */
	initCells() {
		// Needed inside the forEachItem
		var cells = this.childs;	
		this._impl.forEachItem(function (cellImpl) {
			// here this point to the dhtmlXLayoutObject object.
			var cell = new LayoutCell(this, cellImpl);
			// adds the new cell to this._childs
			cells.push(cell);
		});
	}
}

/** Creates the dhtmlXLayoutObject inside its container. */
function initDhtmlxLayout (container, pattern) {
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
	return impl;
}