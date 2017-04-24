
import { OBJECT_TYPE, SKIN, DEBUG } from 'global/config';
import { Util } from 'global/Util';
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
	constructor (name, container, pattern) {
		if (DEBUG) {
			console.log('BaseLayout constructor');
		}
		
		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 3) {
			this.init(name, container, pattern);
		}
	}
	
	init (name, container, pattern) {
		
		if (arguments.length === 3) {
		
			// Creates the dhtmlx object (see function below)
			var impl = this.initDhtmlxLayout(container, pattern);
			
			// BaseObject init method
			super.init(name, OBJECT_TYPE.LAYOUT, container, impl);
			
			// Inits the LayoutCell objects
			this.initCells();
			
			if (container instanceof LayoutCell) {
				var containerLayout = container.container;
				containerLayout.attachAction("onResizeFinish", function(){
					impl.setSizes();
				});
			}
			
		} else {
			throw new Error('BaseLayout init method requires 3 parameters');
		}
	}
	
	/**  
	 * Internal method called by the constructor, it creates the LayoutCell 
	 * objects and adds them to the this.childs array
	 */
	initCells () {
		// Needed inside the forEachItem
		var self = this;
		var i = 1;
		this._impl.forEachItem(function (cellImpl) {
			// here this point to the dhtmlXLayoutObject object.
			var cellName = self.name + '_cell' + (i++);
			var cell = new LayoutCell(cellName, self, cellImpl);
		});
	}

	/** Creates the dhtmlXLayoutObject inside its container. */
	initDhtmlxLayout (container, pattern) {
		var impl = null;
		if (Util.isNode(container)) {
			
			impl = new dhtmlXLayoutObject({
				// id or object for parent container
				parent: container,    	
				// layout's pattern			
				pattern: pattern,
				// layout's skin
				skin: SKIN
			});
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL 
                        || container.type === OBJECT_TYPE.TAB
                        || container.type === OBJECT_TYPE.WINDOW) {			
			impl = container.impl.attachLayout(pattern);
		}
		return impl;
	}
}

