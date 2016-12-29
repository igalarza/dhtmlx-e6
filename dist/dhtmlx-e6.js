/** Enables console.log comments */
const DEBUG = true;

/** All the dhtmlx object types */
const OBJECT_TYPE = {
	LAYOUT : 'layout',
	LAYOUT_CELL : 'layoutCell',
	TOOLBAR : 'toolbar', 
	MENU : 'menu', 
	GRID : 'grid', 
	TREE : 'tree', 
	WINDOW : 'window'
};

// Returns true if it is a DOM node    
function isNode (o) {
	return (
		typeof Node === "object" ? o instanceof Node : 
		typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
	);
}

/**
  * Parent object of all the wrappers, it holds some common variables.
  */	 
class dhtmlxObject {
	
	/**
	 * Called by child objects.
	 * @constructor
	 * @param {string} type - Type of component: layout, window, grid, etc.
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {object} impl - dhtmlx object, must be created by child class.
	 */
    constructor (type, container, impl) {
		this._type = type;
        this._container = container;
        this._impl = impl;
		this._childs = [];
    }
	
	/**
	 * Adds a reference to a child object (e. g. adds a menu to a layout)
	 * @param {dhtmlxObject} child - The child object that will be attached to this object
	 */
    addChild (child) {
        this._childs.push(child);
    }
	
   /**
     * Type of component: layout, window, grid, etc. 
     */
	get type () {
		return this._type;
	}
	
	/**
     * Usually is other dhtmlxObject, the root layout should be inside document.body
     */
	get container () { 
		return this._container;
	}
	
	/**
     * dhtmlx object, must be created by child class before calling super in the constructor.
     */
	get impl () {
		return this._impl;
	}
	
	/**
	 * Child objects, they must be added manually with the addChild function
	 */
	get childs () {
		return this._childs;
	}
}

class LayoutCell extends dhtmlxObject {
	
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

/**
  * Base class for all layout objects, see:
  * https://docs.dhtmlx.com/layout__index.html
  */
class BaseLayout extends dhtmlxObject {
	
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

/** Layout with only one cell */
class SimpleLayout extends BaseLayout {
	
	/**
	 * Creates the SimpleLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 */
	constructor (container) {
		super(container, '1C');
	}
	
	/** The only LayoutCell object in the layout */
	get cell () {
		return this.cells[0];
	}
}

/**
  * Layout with two columns: left and right
  */
class TwoColumnsLayout extends BaseLayout {
	
	/**
	 * Creates the TwoColumnsLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 */
	constructor (container) {
		super(container, '2U');
	}
	
	/** Left LayoutCell */
	get left () {
		return this._cells[0];
	}
	
	/** Right LayoutCell */
	get right () {
		return this._cells[1];
	}
}

/** Layout with page-like structure: header, body and footer */
class PageLayout extends BaseLayout {
	
	/**
	 * Creates the SimpleLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {int} headerHeight - Fixed header height in pixels.
	 * @param {int} footerHeight - Fixed footer height in pixels.
	 */
	constructor (container, headerHeight, footerHeight) {
		super(container, '3E');
		
		this.header.height = headerHeight;
		this.header.impl.fixSize(false, true);
		
		this.footer.height = footerHeight;
		this.footer.impl.fixSize(false, true);
	}
	
	/** The only LayoutCell object in the layout */
	get header () {
		return this.cells[0];
	}
	
	get body () {
		return this.cells[1];	
	}
	
	get footer () {
		return this.cells[2];	
	}
}

// Here we import all "public" classes to expose them

export { SimpleLayout, TwoColumnsLayout, PageLayout };
