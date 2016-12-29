/** Enables console.log comments */
const DEBUG = true;

/** dhtmlx skin applied to all objects */
const SKIN = 'material';

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

/**
 * Checks if the parameter is a DOM node.
 * @param {mixed} o - Dom Node or any other variable.
 * @return {boolean} true if the parameter is a DOM Node.
 */   
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
	
	/** Destroys the object and all this childs. */
	destroy () {
		// First, the childs
		while (this.childs.lenght > 0) {
			var child = this.childs.pop();
			if (typeof child === 'object' 
				&& typeof child.destroy === 'function') {
					
				child.destroy();
			}			
		}
		
		// Finally, the object
		if (typeof this.impl.unload === 'function') {
			this.impl.unload();
		}
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
	 * Child objects, could be any other dhtmlxObject
	 */
	get childs () {
		return this._childs;
	}
}

/**
  * Base class for all layout objects, see:
  * https://docs.dhtmlx.com/layout__index.html
  */
class LayoutCell extends dhtmlxObject {
	
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

/**
  * Base class for all layout objects, see:
  * https://docs.dhtmlx.com/layout__index.html
  */
class BaseLayout extends dhtmlxObject {
	
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
		return this.childs[0];
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
		return this.childs[0];
	}
	
	/** Right LayoutCell */
	get right () {
		return this.childs[1];
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
		return this.childs[0];
	}
	
	get body () {
		return this.childs[1];	
	}
	
	get footer () {
		return this.childs[2];	
	}
}

/**
 * Base class for Menu objects, see:
 * http://docs.dhtmlx.com/menu__index.html
 */

// Here we import all "public" classes to expose them

export { SimpleLayout, TwoColumnsLayout, PageLayout };
