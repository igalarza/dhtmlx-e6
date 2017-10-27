const basePath = '/';
const defaultIconsPath = basePath + 'vendor/imgs/';
const defaultImagesPath = basePath + 'vendor/imgs/';

let config = {
	/** Enables console.log comments */
	DEBUG: true,
	/** dhtmlx skin applied to all objects */
	SKIN: 'dhx_web',
	
	BASE_PATH: basePath,
	/** Used by Grid, Accordion, Menu, Grid, Tree and TreeGrid  */
	DEFAULT_ICONS_PATH: defaultIconsPath,
	DEFAULT_IMAGES_PATH: defaultImagesPath,
	
	TOOLBAR_ICONS_PATH: defaultIconsPath + 'dhxtoolbar_web/',
	GRID_ICONS_PATH: defaultIconsPath + 'dhxgrid_web/',
	TREE_ICONS_PATH: defaultIconsPath + 'dhxtree_web/',
	MENU_ICONS_PATH: defaultIconsPath + 'dhxmenu_web/'
};

let DEBUG = config.DEBUG;
let SKIN = config.SKIN;
let TOOLBAR_ICONS_PATH = config.TOOLBAR_ICONS_PATH;
let GRID_ICONS_PATH = config.GRID_ICONS_PATH;
let TREE_ICONS_PATH = config.TREE_ICONS_PATH;
let MENU_ICONS_PATH = config.MENU_ICONS_PATH;


function getConfig() {
	return config;
}

function setConfig(cfg) {
	config = cfg;
}

/** All the dhtmlx object types */
const OBJECT_TYPE = {
    LAYOUT : 'layout',
    LAYOUT_CELL : 'layoutCell',
    TOOLBAR : 'toolbar',
    FORM : 'form', 
    MENU : 'menu', 
    GRID : 'grid', 
    TREE : 'tree', 
    WINDOW : 'window',
    WINDOW_MANAGER : 'windowManager',
    TABBAR : 'tabbar',
    TAB : 'tab',
    ACCORDION : 'accordion',
    ACCORDION_CELL : 'accordionCell' 
};

class Action {
		
	constructor (name, impl) {

		this._name = name;
		this._impl = impl;		
	}
	
	get name () { return this._name; }
	get impl () { return this._impl; }	
}

/**
 * Items inside the menu
 */
class MenuItem {
	
	constructor (parentName, name, action, caption, icon = null, iconDisabled = null) {
		
		this._parentName = parentName;
		this._name = name;
		this._action = action;
		this._caption = caption;
		this._icon = icon;
		this._iconDisabled = iconDisabled;
	}
	
	get parentName () { return this._parentName; }
	get name () { return this._name; }
	get action () { return this._action; }
	get caption () { return this._caption; }
	get icon () { return this._icon; }
	get iconDisabled () { return this._iconDisabled; }
}

class TreeItem {

	constructor(parentId, id, text, action = null) {

		this._parentId = parentId;
		this._id = id;
		this._text = text;
		this._action = action;
	}

	get parentId () {
		return this._parentId;
	}

	get id () {
		return this._id;
	}

	get text () {
		return this._text;
	}

	get action () {
		return this._action;
	}
}

class ActionManager {
	
	constructor (context, parent = null) {
		this._context = context;
		this._actions = [];
		this._parent = parent;
		this._childs = [];
		
		if (parent !== null) {
			parent.childs.push(this);
		}
	}
	
	run (action, params, context) {
		return this._actions[action](params, context);
	}
	
	createMenuItem (parentName, actionName, caption, icon, iconDisabled) {		
		var action = this.actions[actionName];
		return new MenuItem(parentName, actionName, action, caption, icon, iconDisabled);
	}

	createTreeItem (parentName, actionName, caption) {		
		var action = this.actions[actionName];
		return new TreeItem(parentName, actionName, caption, action);
	}

	addActionObj (action) {
		this._actions[action.name] = action.impl;
	}

	addAction (name, impl) {
		this._actions[name] = impl;
	}
	
	get childs () {
		return this._childs;
	}
	
	get context () {
		return this._context;
	}
	
	get parent () {
		return this._parent;
	}
	
	get actions () {
		return this._actions;
	}
}

class Util {
	/**
	 * Checks if the parameter is a DOM node or DOM id (string).
	 * @param {mixed} o - Dom Node or any other variable.
	 * @return {boolean} true if the parameter is a DOM Node.
	 */   
	static isNode (o) {
		return (
			typeof Node === "string" ||
			typeof Node === "object" ? o instanceof Node : 
			typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
		);
	}
}

/**
  * Parent class of all the objects in the library, it holds some common variables.
  */	 
class BaseObject {
	
	/**
	 * Called by child objects.
	 * @constructor
	 * @param {string} name - Object name, useful for searching child objects.
	 * @param {string} type - Type of component: layout, window, grid, etc.
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {object} impl - dhtmlx object, must be created by child class.
	 */
    constructor (name, type, container, impl) {
		// It can be called without arguments, for testing integration reasons.
		if (arguments.length === 4) {
			this.init(name, type, container, impl);
		}		
    }
	
	init (name, type, container, impl) {			
		if (arguments.length === 4) {
			// Clean up before assignations
			this.destroy();
			// Init properties
			this._name = name;
			this._type = type;
			this._container = container;
			this._impl = impl;
			this._childs = [];
			
			if (container !== null &&
                !Util.isNode(container) &&
                container.childs instanceof Array) {
				// Adds this to parent as a child
				container.childs.push(this);
			}
		} else {
			throw new Error('BaseObject init method requires 4 parameters');
		}
	}
	
	/** Destroys the object and all this childs. */
	destroy () {
		// First, the childs
		if (typeof this._childs !== 'undefined') {
			while (this._childs.length > 0) {
				var child = this._childs.pop();
				if (typeof child === 'object' 
					&& typeof child.destroy === 'function') {
						
					child.destroy();
				}			
			}
		}

		// Removing from container
		if (typeof this._container !== 'undefined'
			&& typeof this._container.childs !== 'undefined') {

			this._container.childs = this._container.childs.filter((elem) => elem !== this);
		}
		
		// Finally, the object
		if (typeof this._impl !== 'undefined' &&
			typeof this._impl.unload === 'function') {
			if (DEBUG) {
				console.log(this.type +': Call to unload() in destroy method.');
			}
			this._impl.unload();
		}
	}
	
	/** Finds a child object by name */
	find (name) {
		if (this.name === name) {
			return this;
		} else {
			if (typeof this._childs !== 'undefined') {
				for (let i=0; i<this._childs.length; i++) {
					var child = this._childs[i];
					if (typeof child === 'object' && typeof child.find === 'function') {
						var result = child.find(name);
						if (result != null) {
							return result;
						}
					}
				}
			}
		}
		return null;
	}
	
	/** Finds a parent object by name */
	findParent (name) {
		if (this.name === name) {
			return this;
		} else {
			if (typeof this._container !== 'undefined') {
                                var parent = this._container;
                                if (typeof parent === 'object' && typeof parent.findParent === 'function') {
                                        var result = parent.findParent(name);
                                        if (result != null) {
                                                return result;
                                        }
                                }
			}
		}
		return null;
	}
	
	/** Adds an event to the object, with an ActionManager object as a collection of actions. */
	attachActionManager (eventName, actionManager) {
		this.impl.attachEvent(eventName, function (id) {
			// Checking if the actionManager has the action with the right id
			if (typeof actionManager.actions[id] === 'function') {
				// The context in the actionManager is sent to the action
				return actionManager.actions[id](arguments, actionManager.context);
			}
		});
	}
	
	/** Adds an event to the object, with a function parameter as an action. */
	attachAction (eventName, action, context) {
		this.impl.attachEvent(eventName, function () {
			// Making sure the action param is really an object
			if (typeof action === 'function') {
				// The context in the actionManager is sent to the action
				return action(arguments, context);
			}
		});
	}
	
	get name () {
		if (typeof this._name !== 'undefined') {
			return this._name;
		} else {
			throw new Error('this._name is undefined: init method has not been called');
		}
	}
	
        /**
        * Type of component: layout, window, grid, etc. 
        */
	get type () {
		if (typeof this._type !== 'undefined') {
			return this._type;
		} else {
			throw new Error('this._type is undefined: init method has not been called');
		}
	}
	
	/**
        * Usually is other dhtmlx-e6 object, the root container should be inside document.body
        */
	get container () { 
		if (typeof this._container !== 'undefined') {
			return this._container;
		} else {
			throw new Error('this._container is undefined: init method has not been called');
		}
	}
	
	/**
        * dhtmlx object, must be created by child class before calling super in the constructor.
        */
	get impl () {
		if (typeof this._impl !== 'undefined') {
			return this._impl;
		} else {
			throw new Error('this._impl is undefined: init method has not been called');
		}
	}
	
	/**
	 * Child objects, could be any other dhtmlxObject
	 */
	get childs () {
		if (typeof this._childs !== 'undefined') {
			return this._childs;
		} else {
			throw new Error('this._childs is undefined: init method has not been called');
		}
	}
	
	set childs (childs) {
            this._childs = childs;
        }
}

/**
  * Base class for all layout objects, see:
  * https://docs.dhtmlx.com/layout__index.html
  */
class LayoutCell extends BaseObject {
	
	/**
	 * Creates the LayoutCell object, called from BaseLayout class
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {string} impl - dhtmlx object, created in the BaseLayout class.
	 */
	constructor (name, container, impl) {
		if (DEBUG) {
			console.log('LayoutCell constructor');
		}
		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 3) {
			this.init(name, container, impl);
		}
	}
	
	init (name, container, impl) {
		if (arguments.length === 3) {
			super.init(name, OBJECT_TYPE.LAYOUT_CELL, container, impl);
			
			// Header is hidden by default
			this.header = null;
			
			this.impl.fixSize(false, false);
		} else {
			throw new Error('LayoutCell init method requires 3 parameters');
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

/**
  * Base class for all layout objects, see:
  * https://docs.dhtmlx.com/layout__index.html
  */
class BaseLayout extends BaseObject {
	
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

/** Layout with only one cell */
class SimpleLayout extends BaseLayout {
	
	/**
	 * Creates the SimpleLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 */
	constructor (name, container) {
		super(name, container, '1C');
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
	constructor (name, container) {
		if (DEBUG) {
			console.log('TwoColumnsLayout constructor');
		}
		super(name, container, '2U');
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
	constructor (name, container, headerHeight, footerHeight) {
		if (DEBUG) {
			console.log('TwoColumnsLayout constructor');
		}
		
		super();
		
		if (arguments.length === 4) {
			this.init(name, container, headerHeight, footerHeight);
		}	
	}
	
	init (name, container, headerHeight, footerHeight) {
		if (arguments.length === 4) {
			super.init(name, container, '3E');
			
			this.header.height = headerHeight;
			this.header.impl.fixSize(false, true);
			
			this.footer.height = footerHeight;
			this.footer.impl.fixSize(false, true);
			
			this.impl.setAutoSize("a;b;c", "b");
		} else {
			throw new Error('PageLayout init method requires 4 parameters');
		}
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

class WindowLayout extends BaseLayout {
	
	/**
	 * Creates the WindowLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 */
	constructor (name, container) {
		super(name, container, '2E');
	}

	get body () {
		return this.childs[0];
	}
	
	get footer () {
		return this.childs[1];
	}
}

/**
 * Base class for Menu objects, see:
 * http://docs.dhtmlx.com/menu__index.html
 */
class Menu extends BaseObject {
	
	/**
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {actionManager} ActionManager - Contains the actions the menu will execute.
	 */
	constructor (name, container, actionManager) {
		if (DEBUG) {
			console.log('Menu constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 3) {
			this.init(name, container, actionManager);
		}	
	}

	init (name, container, actionManager) {

		// Creates the dhtmlx object
		var impl = this.initDhtmlxMenu(container);
		impl.setIconsPath(MENU_ICONS_PATH);

		// BaseObject init method
		super.init(name, OBJECT_TYPE.MENU, container, impl);
		
		// Enable onClick event 
		this.attachActionManager("onClick", actionManager);
	}
	
	/**
	 * Adds a text container (with no action) to the menu.
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {name} string - The name that identifies the MenuItem.
	 * @param {caption} string - The visible text of the container.
	 * @param {parentName} string - The name of the parent MenuItem (default null).
	 * returns {Menu} The menu object itself, to chain item creation.
	 */
	addTextContainer (name, caption, parentName = null) {
            let menuItem = new MenuItem(parentName, name, null, caption);
            return this.addMenuItem(menuItem);
	}
	
	/**
	 * Adds a MenuItem (with action) to the menu container 
	 * @param {MenuItem} menuItem - The MenuItem object, usually created in the ActionManager
	 * returns {Menu} The menu object itself, to chain item creation
	 */
	addMenuItem (menuItem) {
		if (typeof menuItem.parentName === 'undefined') {
                    menuItem.parentName = null;
		} 
                this.impl.addNewChild(menuItem.parentName, (this._childs.length), menuItem.name, menuItem.caption, false, menuItem.icon, menuItem.iconDisabled);		
		this._childs.push(menuItem);
		// curryfing!
		return this;
	}

	/** Creates the dhtmlXMenuObject inside its container. */
	initDhtmlxMenu(container) {
		var impl = null;
        // container can be null
		if (container == null || Util.isNode(container)) {
			impl = new dhtmlXMenuObject(container, SKIN);
			
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL  
			|| container.type === OBJECT_TYPE.LAYOUT
			|| container.type === OBJECT_TYPE.WINDOW) {
			
			impl = container.impl.attachMenu();
			impl.setSkin(SKIN);
		} else {
			throw new Error('initDhtmlxMenu: container is not valid.');
		}
		return impl;
	}
	
	set childs (menuItems) {
		// Clean array first
		this._childs = [];
		
		// Populate array
		for (var i = 0; i < menuItems.length; i++) {
			this.addMenuItem(menuItems[i]);
		}
	}
}

class ContextMenu extends Menu {
    
    constructor(name, container, actionManager) {
        if (DEBUG) {
            console.log('ContextMenu constructor');
        }
        
        // We will init the BaseObject properties in the init method
        super();
        
        if (arguments.length === 3) {
                this.init(name, container, actionManager);
        }
    }
    
    init (name, container, actionManager) {
        
        // Menu init method, container must be null
        super.init(name, null, actionManager);
        
        this._container = container;
        container.childs.push(this);
        
        this.impl.renderAsContextMenu();
        
        if (typeof container === 'object' &&
            this.impl.isContextZone(container.impl)) {
            this.impl.addContextZone(container.impl);    
        
        } else if (container.type === OBJECT_TYPE.GRID  
            || container.type === OBJECT_TYPE.TREE) {
            
            container.impl.enableContextMenu(this.impl);
        }
    }
}

/**
  * Base class for all TreeView objects, see:
  * http://docs.dhtmlx.com/treeview__index.html
  */
class BaseTree extends BaseObject {

	constructor (name, container, actionManager = null) {
		if (DEBUG) {
			console.log('BaseTree constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length >= 2) {
			this.init(name, container, actionManager);
		}
	}

	init (name, container, actionManager = null) {

		if (arguments.length >= 2) {

			// Creates the dhtmlx object (see function below)
			var impl = this.initDhtmlxTree(container);
			impl.setSkin(SKIN);
			impl.setIconsPath(TREE_ICONS_PATH);

			// BaseObject init method
			super.init(name, OBJECT_TYPE.TREE, container, impl);
			
			// Enable onSelect event 
			if (actionManager != null) {
				this.attachActionManager("onSelect", actionManager);
			}

		} else {
			throw new Error('BaseTree init method requires 2 parameters');
		}
	}

	addItem (treeItem) {

		this.impl.addItem(treeItem.id, treeItem.text, treeItem.parentId);
		this._childs[treeItem.id] = treeItem.action;
	}

	initDhtmlxTree (container) {

		var impl = null;
		if (Util.isNode(container)) {
			// call to dhtmlx object constructor 
			impl = new dhtmlXTreeObject(container, "100%", "100%", 0);
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL) {
			impl = container.impl.attachTree();
			
		} else {
			throw new Error('initDhtmlxTree: container is not valid.');
		}
		return impl;
	}
}

class Tabbar extends BaseObject {
    
    constructor (name, container) {
        if (DEBUG) {
            console.log('Tabbar constructor');
        }
        
        // We will init the BaseObject properties in the init method
        super();
        
        if (arguments.length === 2) {
            this.init(name, container);
        }
    }
    
    init (name, container) {
        if (arguments.length === 2) {
            
            // Creates the dhtmlx object (see function below)
            var impl = this.initDhtmlxTabbar(container);
            
            // BaseObject init method
            super.init(name, OBJECT_TYPE.TABBAR, container, impl);
            
        } else {
            throw new Error('Tabbar init method requires 2 parameters');
        }
    }
    
    initDhtmlxTabbar (container) {
        var impl = null;
        if (Util.isNode(container)) {
            
            impl = new dhtmlXTabBar({
                parent: container,
                skin: SKIN
            });
            
        } else if (container.type === OBJECT_TYPE.LAYOUT_CELL
            || container.type === OBJECT_TYPE.ACCORDION_CELL
            || container.type === OBJECT_TYPE.WINDOW
            || container.type === OBJECT_TYPE.TAB) {
            
            impl = container.impl.attachTabbar();
            impl.setSkin(SKIN);
        
        } else {
			throw new Error('initDhtmlxTabbar: container is not valid.');
		}
        return impl;
    }
}

class Tab extends BaseObject {
    
    constructor (name, container, id, text, position = null, active = false, close = false) {
        
        if (DEBUG) {
            console.log('Tab constructor');
        }
        
        // We will init the BaseObject properties in the init method
        super();
        
        if (arguments.length >= 4) {
            this.init(name, container, id, text, position, active, close);
        }
    }
    
    
    init (name, container, id, text, position = null, active = false, close = false) {
        
        // TODO check that container must be a Tabbar object
        container.impl.addTab(id, text, null, position, active, close);
        
        var impl = container.impl.tabs(id);
        
         // BaseObject init method
        super.init(name, OBJECT_TYPE.TAB, container, impl);
    }
}

class Accordion extends BaseObject {
    
    constructor (name, container) {
        if (DEBUG) {
            console.log('Accordion constructor');
        }
        
        // We will init the BaseObject properties in the init method
        super();
        
        if (arguments.length === 2) {
            this.init(name, container);
        }
    }
    
    init (name, container) {
        if (arguments.length === 2) {
            
            // Creates the dhtmlx object (see function below)
            var impl = this.initDhtmlxAccordion(container);
            
            // BaseObject init method
            super.init(name, OBJECT_TYPE.TABBAR, container, impl);
            
        } else {
            throw new Error('Tabbar init method requires 2 parameters');
        }
    }
    
    initDhtmlxAccordion (container) {
        var impl = null;
        if (Util.isNode(container)) {
            
            impl = new dhtmlXAccordion({
                parent: container,
                skin: SKIN
            });
            
        } else if (container.type === OBJECT_TYPE.LAYOUT_CELL
                || container.type === OBJECT_TYPE.ACCORDION_CELL
                || container.type === OBJECT_TYPE.TAB
                || container.type === OBJECT_TYPE.WINDOW) {
            
            impl = container.impl.attachAccordion();
            impl.setSkin(SKIN);
        } else {
            throw new Error('initDhtmlxAccordion: container is not valid.');
        }
        return impl;
    }
}

class AccordionCell extends BaseObject {
    
    constructor (name, container, id, text, open = false, height = null, icon = null) {
        
        if (DEBUG) {
            console.log('AccordionCell constructor');
        }
        
        // We will init the BaseObject properties in the init method
        super();
        
        if (arguments.length >= 4) {
            this.init(name, container, id, text, open, height, icon);
        }
    }    
    
    init (name, container, id, text, open = false, height = null, icon = null) {
        
        // TODO check that container must be a Accordion object
        container.impl.addItem(id, text, open, height, icon);
        
        var impl = container.impl.cells(id);
        
         // BaseObject init method
        super.init(name, OBJECT_TYPE.ACCORDION_CELL, container, impl);
    }
}

class Toolbar extends BaseObject {
	
	constructor (name, container, actionManager) {
		if (DEBUG) {
			console.log('Toolbar constructor');
		}
		
		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 3) {
			this.init(name, container, actionManager);
		}
	}
	
	init (name, container, actionManager) {
		// Creates the dhtmlx object (see function below)
		var impl = initDhtmlxToolbar(container);
		impl.setIconsPath(TOOLBAR_ICONS_PATH);
		
		// BaseObject constructor
		super.init(name, OBJECT_TYPE.TOOLBAR, container, impl);
		
		this.attachActionManager("onClick", actionManager);
	}
	
	addToolbarButton (toolbarItem) {
		this.impl.addButton(toolbarItem.name, (this.childs.length), toolbarItem.caption, toolbarItem.icon, toolbarItem.iconDisabled);
		this.childs.push(toolbarItem.action);
                this.addTooltip(toolbarItem.name, toolbarItem.tooltip);
		
		// curryfing!
		return this;
	}
	
	addToolbarButtonTwoState (toolbarItem) {
		this.impl.addButtonTwoState(toolbarItem.name, (this.childs.length), toolbarItem.caption, toolbarItem.icon, toolbarItem.iconDisabled);
		this.childs.push(toolbarItem.action);
                this.addTooltip(toolbarItem.name, toolbarItem.tooltip);
		
		// curryfing!
		return this;
	}
	
	addToolbarButtonSelect (toolbarItem) {
		this.impl.addButtonSelect(toolbarItem.name, (this.childs.length), toolbarItem.caption, [], toolbarItem.icon, toolbarItem.iconDisabled);
		this.childs.push(toolbarItem.action);
        this.addTooltip(toolbarItem.name, toolbarItem.tooltip);
		
		// curryfing!
		return this;
	}
	
	addToolbarListOption (parent, toolbarItem) {
		this.impl.addListOption(parent, toolbarItem.name, (this.childs.length), 'button', toolbarItem.caption, toolbarItem.icon);
		this.childs.push(toolbarItem.action);
        this.addTooltip(toolbarItem.name, toolbarItem.tooltip);
		
		// curryfing!
		return this;
	}
	
	addSeparator (toolbarItem) {
		this.impl.addSeparator(toolbarItem.name, (this.childs.length));
		
		// curryfing!
		return this;
	}
	
	addText (toolbarItem) {
		this.impl.addText(toolbarItem.name, (this.childs.length), toolbarItem.caption);
		
		// curryfing!
		return this;
	}
	
	addInput (toolbarItem, width) {
		this.impl.addInput(toolbarItem.name, (this.childs.length), toolbarItem.caption, width);
		
		// curryfing!
		return this;
	}
	
	addTooltip (name, text) {
		if (typeof text !== 'undefined') {
			this.impl.setItemToolTip(name, text);
		}
    }
}

/** Creates the dhtmlXToolbarObject inside its container. */
function initDhtmlxToolbar (container) {
	var impl = null;
	if (Util.isNode(container)) {
		impl = new dhtmlXToolbarObject(container, SKIN);
		
	} else if (container.type === OBJECT_TYPE.LAYOUT_CELL
                || container.type === OBJECT_TYPE.ACCORDION_CELL
		|| container.type === OBJECT_TYPE.LAYOUT
		|| container.type === OBJECT_TYPE.WINDOW
                || container.type === OBJECT_TYPE.TAB) {
		
		impl = container.impl.attachToolbar();
		impl.setSkin(SKIN);
	} else {
		throw new Error('initDhtmlxToolbar: container is not valid.');
	}
	return impl;
}

class BaseGrid extends BaseObject {

	constructor (name, container, actionManager = null) {
		if (DEBUG) {
			console.log('BaseGrid constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length >= 2) {
			this.init(name, container, actionManager);
		}
	}

	init (name, container, actionManager = null) {

		if (arguments.length >= 2) {

			// Creates the dhtmlx object (see function below)
			var impl = this.initDhtmlxGrid(container);
			impl.setSkin(SKIN);
			impl.setIconsPath(GRID_ICONS_PATH);

			// BaseObject init method
			super.init(name, OBJECT_TYPE.GRID, container, impl);
			
			// Enable onSelect event 
			if (actionManager != null) {
				this.attachActionManager("onSelect", actionManager);
			}

		} else {
			throw new Error('BaseGrid init method requires 2 parameters');
		}
	}

	initDhtmlxGrid (container) {

		var impl = null;
		if (Util.isNode(container)) {
			
			impl = new dhtmlXGridObject(container);
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL
                        || container.type === OBJECT_TYPE.ACCORDION_CELL
                        || container.type === OBJECT_TYPE.TAB
                        || container.type === OBJECT_TYPE.WINDOW) {		
			impl = container.impl.attachGrid();
		} else {
			throw new Error('initDhtmlxToolbar: container is not valid.');
		}
		return impl;
	}
}

class PropertyGrid extends BaseObject {
	
	constructor (name, container, actionManager = null) {
		if (DEBUG) {
			console.log('BaseGrid constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length >= 2) {
			this.init(name, container, actionManager);
		}
	}
	
	init (name, container, actionManager = null) {
		if (arguments.length >= 2) {

			// Creates the dhtmlx object (see function below)
			var impl = this.initDhtmlxPropertyGrid(container);
			impl.setSkin(SKIN);
			impl.setIconsPath(GRID_ICONS_PATH);

			// BaseObject init method
			super.init(name, OBJECT_TYPE.GRID, container, impl);
			
			// Enable onSelect event 
			if (actionManager != null) {
				this.attachActionManager("onSelect", actionManager);
			}

		} else {
			throw new Error('PropertyGrid init method requires 2 parameters');
		}
	}
	
	initDhtmlxPropertyGrid (container) {
		
		var impl = null;
		if (Util.isNode(container)) {
			
			impl = new dhtmlXPropertyGrid(container);
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL ||
			container.type === OBJECT_TYPE.WINDOW ||
			container.type === OBJECT_TYPE.TAB) {
				
			impl = container.impl.attachPropertyGrid();
		} else {
			throw new Error('initDhtmlxToolbar: container is not valid.');
		}
		return impl;
	}
}

class Form extends BaseObject {
		
	constructor (name, container, actionManager = null) {
		if (DEBUG) {
			console.log('Form constructor');
		}
		
		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 3) {
			this.init(name, container, actionManager);
		}
	}
	
	init (name, container, actionManager = null) {

		// Creates the dhtmlx object
		var impl = this.initDhtmlxForm(container);
		impl.setSkin(SKIN);

		// BaseObject init method
		super.init(name, OBJECT_TYPE.FORM, container, impl);
	}
	
	initDhtmlxForm (container) {
		var impl = null;
		if (Util.isNode(container)) {
			impl = new dhtmlXForm(container, null);
			
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL
                    || container.type === OBJECT_TYPE.ACCORDION_CELL
                    || container.type === OBJECT_TYPE.WINDOW
                    || container.type === OBJECT_TYPE.TAB) {
			
			impl = container.impl.attachForm();
		} else {
			throw new Error('initDhtmlxForm: container is not valid.');
		}
		
		return impl;
	}
}

class Vault extends BaseObject {

  constructor (name, container, options, actionManager = null) {
	if (DEBUG) {
		console.log('Vault constructor');
	}
	
	// We will init the BaseObject properties in the init method
	super();
	
	if (arguments.length >= 3) {
		this.init(name, container, options, actionManager);
	}
  }
  
  init (name, container, options, actionManager = null) {

        // Creates the dhtmlx object
        var impl = this.initDhtmlxVault(container, options);
        impl.setSkin(SKIN);

        // BaseObject init method
        super.init(name, OBJECT_TYPE.VAULT, container, impl);
  }
    
  initDhtmlxVault (container, options) {
        var impl = null;
        if (Util.isNode(container)) {
                impl = new dhtmlXVaultObject(options);
                
        } else if (container.type === OBJECT_TYPE.LAYOUT_CELL
            || container.type === OBJECT_TYPE.ACCORDION_CELL
            || container.type === OBJECT_TYPE.WINDOW
            || container.type === OBJECT_TYPE.TAB) {
                
                impl = container.impl.attachVault(options);
        } else {
                throw new Error('initDhtmlxVault: container is not valid.');
        }
        
        return impl;
  }
}

/**
  * 
  */	 
class Window extends BaseObject {

	constructor (name, container, width, height) {
		if (DEBUG) {
			console.log('Window constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 4) {
			this.init(name, container, width, height);
		}
	}

	init (name, container, width, height) {
		if (arguments.length === 4) {
                    
                        let impl = windowManager.create(name, width, height);

			// BaseObject init method
			super.init(name, OBJECT_TYPE.WINDOW, container, impl);

			// Centered by default
			impl.centerOnScreen();

			// Modal by default
			impl.setModal(true);

		} else {
			throw new Error('Window init method requires 3 parameters');
		}
	}
}

class WindowManager extends BaseObject {

	constructor (name) {
		if (DEBUG) {
			console.log('WindowManager constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 1) {
			this.init(name);
		}
	}

	init (name, container) {
		if (arguments.length === 1) {

			// Creates the dhtmlx object (see function below)
			var impl = new dhtmlXWindows(SKIN);

			// BaseObject init method
			super.init(name, OBJECT_TYPE.WINDOW_MANAGER, null, impl);

		} else {
			throw new Error('WindowManager init method requires 1 parameter');
		}
	}

	create (name, width, height) {
		// The window gets centered inside the Window object
		var coordX = 0; 
		var coordY = 0; 
		return this.impl.createWindow(name, coordX, coordY, width, height);
	}
}

// For now, only one WindowManager will do
let windowManager = new WindowManager('windowManager');

class Message {

	static alert (title, text, modal = false) {
		let promise = new Promise((resolve, reject) => {
			if (modal) {
				dhtmlx.message({
					title: title,
					type: 'alert',
					text: text,
					callback: function() {
						resolve();
					}
				});
			} else {
				dhtmlx.message({
					title: title,
					text: text
				});
				resolve();
			}
		});
        return promise;
	}

	static warning (title, text, modal = false) {
		let promise = new Promise((resolve, reject) => {
			if (modal) {
				dhtmlx.message({
					title: title,
					type: 'alert-warning',
					text: text,
					callback: function() {
						resolve();
					}
				});
			} else {
				dhtmlx.message({
					title: title,
					text: text
				});
				resolve();
			}
		});
        return promise;
	}

	static error (title, text, modal = false) {
		let promise = new Promise((resolve, reject) => {
			if (modal) {
				dhtmlx.message({
					title: title,
					type: 'alert-error',
					text: text,
					callback: function() {
						resolve();
					}
				});
			} else {
				dhtmlx.message({
					title: title,
					type: 'error',
					text: text
				});
				resolve();
			}
		});
        return promise;
	}

	static confirm (title, text, ok, cancel) {
		let promise = new Promise((resolve, reject) => {
			dhtmlx.confirm({
				title: title,
				text: text,
				ok: ok,
				cancel: cancel,
				callback: function(response) {
					if (response) {
						resolve();
					} else {
						reject();    
					}
				}
			});
		});
		return promise;
	}
}

// Here we import all "public" classes to expose them

export { getConfig, setConfig, windowManager, Window, Message, ActionManager, Action, BaseLayout, SimpleLayout, TwoColumnsLayout, PageLayout, WindowLayout, Accordion, AccordionCell, BaseTree, TreeItem, Menu, ContextMenu, MenuItem, Tabbar, Tab, BaseGrid, PropertyGrid, Toolbar, Form, Vault };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1VzZXJzL25hZGV5L0RldmVsL2RodG1seC1lNi9zcmMvZ2xvYmFsL2NvbmZpZy5qcyIsIkM6L1VzZXJzL25hZGV5L0RldmVsL2RodG1seC1lNi9zcmMvYWN0aW9ucy9BY3Rpb24uanMiLCJDOi9Vc2Vycy9uYWRleS9EZXZlbC9kaHRtbHgtZTYvc3JjL21lbnUvTWVudUl0ZW0uanMiLCJDOi9Vc2Vycy9uYWRleS9EZXZlbC9kaHRtbHgtZTYvc3JjL3RyZWUvVHJlZUl0ZW0uanMiLCJDOi9Vc2Vycy9uYWRleS9EZXZlbC9kaHRtbHgtZTYvc3JjL2FjdGlvbnMvQWN0aW9uTWFuYWdlci5qcyIsIkM6L1VzZXJzL25hZGV5L0RldmVsL2RodG1seC1lNi9zcmMvZ2xvYmFsL1V0aWwuanMiLCJDOi9Vc2Vycy9uYWRleS9EZXZlbC9kaHRtbHgtZTYvc3JjL2dsb2JhbC9CYXNlT2JqZWN0LmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy9sYXlvdXQvTGF5b3V0Q2VsbC5qcyIsIkM6L1VzZXJzL25hZGV5L0RldmVsL2RodG1seC1lNi9zcmMvbGF5b3V0L0Jhc2VMYXlvdXQuanMiLCJDOi9Vc2Vycy9uYWRleS9EZXZlbC9kaHRtbHgtZTYvc3JjL2xheW91dC9TaW1wbGVMYXlvdXQuanMiLCJDOi9Vc2Vycy9uYWRleS9EZXZlbC9kaHRtbHgtZTYvc3JjL2xheW91dC9Ud29Db2x1bW5zTGF5b3V0LmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy9sYXlvdXQvUGFnZUxheW91dC5qcyIsIkM6L1VzZXJzL25hZGV5L0RldmVsL2RodG1seC1lNi9zcmMvbGF5b3V0L1dpbmRvd0xheW91dC5qcyIsIkM6L1VzZXJzL25hZGV5L0RldmVsL2RodG1seC1lNi9zcmMvbWVudS9NZW51LmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy9tZW51L0NvbnRleHRNZW51LmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy90cmVlL0Jhc2VUcmVlLmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy90YWJiYXIvVGFiYmFyLmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy90YWJiYXIvVGFiLmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy9hY2NvcmRpb24vQWNjb3JkaW9uLmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy9hY2NvcmRpb24vQWNjb3JkaW9uQ2VsbC5qcyIsIkM6L1VzZXJzL25hZGV5L0RldmVsL2RodG1seC1lNi9zcmMvdG9vbGJhci9Ub29sYmFyLmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy9ncmlkL0Jhc2VHcmlkLmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy9ncmlkL1Byb3BlcnR5R3JpZC5qcyIsIkM6L1VzZXJzL25hZGV5L0RldmVsL2RodG1seC1lNi9zcmMvZm9ybS9Gb3JtLmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy92YXVsdC9WYXVsdC5qcyIsIkM6L1VzZXJzL25hZGV5L0RldmVsL2RodG1seC1lNi9zcmMvd2luZG93L1dpbmRvdy5qcyIsIkM6L1VzZXJzL25hZGV5L0RldmVsL2RodG1seC1lNi9zcmMvd2luZG93L1dpbmRvd01hbmFnZXIuanMiLCJDOi9Vc2Vycy9uYWRleS9EZXZlbC9kaHRtbHgtZTYvc3JjL3dpbmRvdy9NZXNzYWdlLmpzIiwiQzovVXNlcnMvbmFkZXkvRGV2ZWwvZGh0bWx4LWU2L3NyYy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxyXG5jb25zdCBiYXNlUGF0aCA9ICcvJztcclxuY29uc3QgZGVmYXVsdEljb25zUGF0aCA9IGJhc2VQYXRoICsgJ3ZlbmRvci9pbWdzLyc7XHJcbmNvbnN0IGRlZmF1bHRJbWFnZXNQYXRoID0gYmFzZVBhdGggKyAndmVuZG9yL2ltZ3MvJztcclxuXHJcbmxldCBjb25maWcgPSB7XHJcblx0LyoqIEVuYWJsZXMgY29uc29sZS5sb2cgY29tbWVudHMgKi9cclxuXHRERUJVRzogdHJ1ZSxcclxuXHQvKiogZGh0bWx4IHNraW4gYXBwbGllZCB0byBhbGwgb2JqZWN0cyAqL1xyXG5cdFNLSU46ICdkaHhfd2ViJyxcclxuXHRcclxuXHRCQVNFX1BBVEg6IGJhc2VQYXRoLFxyXG5cdC8qKiBVc2VkIGJ5IEdyaWQsIEFjY29yZGlvbiwgTWVudSwgR3JpZCwgVHJlZSBhbmQgVHJlZUdyaWQgICovXHJcblx0REVGQVVMVF9JQ09OU19QQVRIOiBkZWZhdWx0SWNvbnNQYXRoLFxyXG5cdERFRkFVTFRfSU1BR0VTX1BBVEg6IGRlZmF1bHRJbWFnZXNQYXRoLFxyXG5cdFxyXG5cdFRPT0xCQVJfSUNPTlNfUEFUSDogZGVmYXVsdEljb25zUGF0aCArICdkaHh0b29sYmFyX3dlYi8nLFxyXG5cdEdSSURfSUNPTlNfUEFUSDogZGVmYXVsdEljb25zUGF0aCArICdkaHhncmlkX3dlYi8nLFxyXG5cdFRSRUVfSUNPTlNfUEFUSDogZGVmYXVsdEljb25zUGF0aCArICdkaHh0cmVlX3dlYi8nLFxyXG5cdE1FTlVfSUNPTlNfUEFUSDogZGVmYXVsdEljb25zUGF0aCArICdkaHhtZW51X3dlYi8nXHJcbn07XHJcblxyXG5leHBvcnQgbGV0IERFQlVHID0gY29uZmlnLkRFQlVHO1xyXG5leHBvcnQgbGV0IFNLSU4gPSBjb25maWcuU0tJTjtcclxuZXhwb3J0IGxldCBUT09MQkFSX0lDT05TX1BBVEggPSBjb25maWcuVE9PTEJBUl9JQ09OU19QQVRIO1xyXG5leHBvcnQgbGV0IEdSSURfSUNPTlNfUEFUSCA9IGNvbmZpZy5HUklEX0lDT05TX1BBVEg7XHJcbmV4cG9ydCBsZXQgVFJFRV9JQ09OU19QQVRIID0gY29uZmlnLlRSRUVfSUNPTlNfUEFUSDtcclxuZXhwb3J0IGxldCBNRU5VX0lDT05TX1BBVEggPSBjb25maWcuTUVOVV9JQ09OU19QQVRIO1xyXG5leHBvcnQgbGV0IFRBQkJBUl9JQ09OU19QQVRIID0gY29uZmlnLlRBQkJBUl9JQ09OU19QQVRIO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpIHtcclxuXHRyZXR1cm4gY29uZmlnO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29uZmlnKGNmZykge1xyXG5cdGNvbmZpZyA9IGNmZztcclxufVxyXG5cclxuLyoqIEFsbCB0aGUgZGh0bWx4IG9iamVjdCB0eXBlcyAqL1xyXG5leHBvcnQgY29uc3QgT0JKRUNUX1RZUEUgPSB7XHJcbiAgICBMQVlPVVQgOiAnbGF5b3V0JyxcclxuICAgIExBWU9VVF9DRUxMIDogJ2xheW91dENlbGwnLFxyXG4gICAgVE9PTEJBUiA6ICd0b29sYmFyJyxcclxuICAgIEZPUk0gOiAnZm9ybScsIFxyXG4gICAgTUVOVSA6ICdtZW51JywgXHJcbiAgICBHUklEIDogJ2dyaWQnLCBcclxuICAgIFRSRUUgOiAndHJlZScsIFxyXG4gICAgV0lORE9XIDogJ3dpbmRvdycsXHJcbiAgICBXSU5ET1dfTUFOQUdFUiA6ICd3aW5kb3dNYW5hZ2VyJyxcclxuICAgIFRBQkJBUiA6ICd0YWJiYXInLFxyXG4gICAgVEFCIDogJ3RhYicsXHJcbiAgICBBQ0NPUkRJT04gOiAnYWNjb3JkaW9uJyxcclxuICAgIEFDQ09SRElPTl9DRUxMIDogJ2FjY29yZGlvbkNlbGwnIFxyXG59OyIsIlxyXG5leHBvcnQgY2xhc3MgQWN0aW9uIHtcclxuXHRcdFxyXG5cdGNvbnN0cnVjdG9yIChuYW1lLCBpbXBsKSB7XHJcblxyXG5cdFx0dGhpcy5fbmFtZSA9IG5hbWU7XHJcblx0XHR0aGlzLl9pbXBsID0gaW1wbDtcdFx0XHJcblx0fVxyXG5cdFxyXG5cdGdldCBuYW1lICgpIHsgcmV0dXJuIHRoaXMuX25hbWU7IH1cclxuXHRnZXQgaW1wbCAoKSB7IHJldHVybiB0aGlzLl9pbXBsOyB9XHRcclxufSIsIlxyXG4vKipcclxuICogSXRlbXMgaW5zaWRlIHRoZSBtZW51XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTWVudUl0ZW0ge1xyXG5cdFxyXG5cdGNvbnN0cnVjdG9yIChwYXJlbnROYW1lLCBuYW1lLCBhY3Rpb24sIGNhcHRpb24sIGljb24gPSBudWxsLCBpY29uRGlzYWJsZWQgPSBudWxsKSB7XHJcblx0XHRcclxuXHRcdHRoaXMuX3BhcmVudE5hbWUgPSBwYXJlbnROYW1lO1xyXG5cdFx0dGhpcy5fbmFtZSA9IG5hbWU7XHJcblx0XHR0aGlzLl9hY3Rpb24gPSBhY3Rpb247XHJcblx0XHR0aGlzLl9jYXB0aW9uID0gY2FwdGlvbjtcclxuXHRcdHRoaXMuX2ljb24gPSBpY29uO1xyXG5cdFx0dGhpcy5faWNvbkRpc2FibGVkID0gaWNvbkRpc2FibGVkO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgcGFyZW50TmFtZSAoKSB7IHJldHVybiB0aGlzLl9wYXJlbnROYW1lOyB9XHJcblx0Z2V0IG5hbWUgKCkgeyByZXR1cm4gdGhpcy5fbmFtZTsgfVxyXG5cdGdldCBhY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5fYWN0aW9uOyB9XHJcblx0Z2V0IGNhcHRpb24gKCkgeyByZXR1cm4gdGhpcy5fY2FwdGlvbjsgfVxyXG5cdGdldCBpY29uICgpIHsgcmV0dXJuIHRoaXMuX2ljb247IH1cclxuXHRnZXQgaWNvbkRpc2FibGVkICgpIHsgcmV0dXJuIHRoaXMuX2ljb25EaXNhYmxlZDsgfVxyXG59IiwiXHJcblxyXG5leHBvcnQgY2xhc3MgVHJlZUl0ZW0ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihwYXJlbnRJZCwgaWQsIHRleHQsIGFjdGlvbiA9IG51bGwpIHtcclxuXHJcblx0XHR0aGlzLl9wYXJlbnRJZCA9IHBhcmVudElkO1xyXG5cdFx0dGhpcy5faWQgPSBpZDtcclxuXHRcdHRoaXMuX3RleHQgPSB0ZXh0O1xyXG5cdFx0dGhpcy5fYWN0aW9uID0gYWN0aW9uO1xyXG5cdH1cclxuXHJcblx0Z2V0IHBhcmVudElkICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJlbnRJZDtcclxuXHR9XHJcblxyXG5cdGdldCBpZCAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5faWQ7XHJcblx0fVxyXG5cclxuXHRnZXQgdGV4dCAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdGV4dDtcclxuXHR9XHJcblxyXG5cdGdldCBhY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2FjdGlvbjtcclxuXHR9XHJcbn0iLCJcclxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnYWN0aW9ucy9BY3Rpb24nO1xyXG5pbXBvcnQgeyBNZW51SXRlbSB9IGZyb20gJ21lbnUvTWVudUl0ZW0nO1xyXG5pbXBvcnQgeyBUcmVlSXRlbSB9IGZyb20gJ3RyZWUvVHJlZUl0ZW0nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFjdGlvbk1hbmFnZXIge1xyXG5cdFxyXG5cdGNvbnN0cnVjdG9yIChjb250ZXh0LCBwYXJlbnQgPSBudWxsKSB7XHJcblx0XHR0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcclxuXHRcdHRoaXMuX2FjdGlvbnMgPSBbXTtcclxuXHRcdHRoaXMuX3BhcmVudCA9IHBhcmVudDtcclxuXHRcdHRoaXMuX2NoaWxkcyA9IFtdO1xyXG5cdFx0XHJcblx0XHRpZiAocGFyZW50ICE9PSBudWxsKSB7XHJcblx0XHRcdHBhcmVudC5jaGlsZHMucHVzaCh0aGlzKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cnVuIChhY3Rpb24sIHBhcmFtcywgY29udGV4dCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2FjdGlvbnNbYWN0aW9uXShwYXJhbXMsIGNvbnRleHQpO1xyXG5cdH1cclxuXHRcclxuXHRjcmVhdGVNZW51SXRlbSAocGFyZW50TmFtZSwgYWN0aW9uTmFtZSwgY2FwdGlvbiwgaWNvbiwgaWNvbkRpc2FibGVkKSB7XHRcdFxyXG5cdFx0dmFyIGFjdGlvbiA9IHRoaXMuYWN0aW9uc1thY3Rpb25OYW1lXTtcclxuXHRcdHJldHVybiBuZXcgTWVudUl0ZW0ocGFyZW50TmFtZSwgYWN0aW9uTmFtZSwgYWN0aW9uLCBjYXB0aW9uLCBpY29uLCBpY29uRGlzYWJsZWQpO1xyXG5cdH1cclxuXHJcblx0Y3JlYXRlVHJlZUl0ZW0gKHBhcmVudE5hbWUsIGFjdGlvbk5hbWUsIGNhcHRpb24pIHtcdFx0XHJcblx0XHR2YXIgYWN0aW9uID0gdGhpcy5hY3Rpb25zW2FjdGlvbk5hbWVdO1xyXG5cdFx0cmV0dXJuIG5ldyBUcmVlSXRlbShwYXJlbnROYW1lLCBhY3Rpb25OYW1lLCBjYXB0aW9uLCBhY3Rpb24pO1xyXG5cdH1cclxuXHJcblx0YWRkQWN0aW9uT2JqIChhY3Rpb24pIHtcclxuXHRcdHRoaXMuX2FjdGlvbnNbYWN0aW9uLm5hbWVdID0gYWN0aW9uLmltcGw7XHJcblx0fVxyXG5cclxuXHRhZGRBY3Rpb24gKG5hbWUsIGltcGwpIHtcclxuXHRcdHRoaXMuX2FjdGlvbnNbbmFtZV0gPSBpbXBsO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgY2hpbGRzICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9jaGlsZHM7XHJcblx0fVxyXG5cdFxyXG5cdGdldCBjb250ZXh0ICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9jb250ZXh0O1xyXG5cdH1cclxuXHRcclxuXHRnZXQgcGFyZW50ICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJlbnQ7XHJcblx0fVxyXG5cdFxyXG5cdGdldCBhY3Rpb25zICgpIHtcclxuXHRcdHJldHVybiB0aGlzLl9hY3Rpb25zO1xyXG5cdH1cclxufVxyXG4iLCJcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVXRpbCB7XHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGlmIHRoZSBwYXJhbWV0ZXIgaXMgYSBET00gbm9kZSBvciBET00gaWQgKHN0cmluZykuXHJcblx0ICogQHBhcmFtIHttaXhlZH0gbyAtIERvbSBOb2RlIG9yIGFueSBvdGhlciB2YXJpYWJsZS5cclxuXHQgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBwYXJhbWV0ZXIgaXMgYSBET00gTm9kZS5cclxuXHQgKi8gICBcclxuXHRzdGF0aWMgaXNOb2RlIChvKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHR0eXBlb2YgTm9kZSA9PT0gXCJzdHJpbmdcIiB8fFxyXG5cdFx0XHR0eXBlb2YgTm9kZSA9PT0gXCJvYmplY3RcIiA/IG8gaW5zdGFuY2VvZiBOb2RlIDogXHJcblx0XHRcdHR5cGVvZiBvID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBvLm5vZGVUeXBlID09PSBcIm51bWJlclwiICYmIHR5cGVvZiBvLm5vZGVOYW1lPT09XCJzdHJpbmdcIlxyXG5cdFx0KTtcclxuXHR9XHJcbn0iLCJcclxuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcclxuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcclxuXHJcbi8qKlxyXG4gICogUGFyZW50IGNsYXNzIG9mIGFsbCB0aGUgb2JqZWN0cyBpbiB0aGUgbGlicmFyeSwgaXQgaG9sZHMgc29tZSBjb21tb24gdmFyaWFibGVzLlxyXG4gICovXHQgXHJcbmV4cG9ydCBjbGFzcyBCYXNlT2JqZWN0IHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBDYWxsZWQgYnkgY2hpbGQgb2JqZWN0cy5cclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE9iamVjdCBuYW1lLCB1c2VmdWwgZm9yIHNlYXJjaGluZyBjaGlsZCBvYmplY3RzLlxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVHlwZSBvZiBjb21wb25lbnQ6IGxheW91dCwgd2luZG93LCBncmlkLCBldGMuXHJcblx0ICogQHBhcmFtIHttaXhlZH0gY29udGFpbmVyIC0gT2JqZWN0IG9yIGRvbSBpZCBvZiB0aGUgcGFyZW50IGVsZW1lbnQuXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGltcGwgLSBkaHRtbHggb2JqZWN0LCBtdXN0IGJlIGNyZWF0ZWQgYnkgY2hpbGQgY2xhc3MuXHJcblx0ICovXHJcbiAgICBjb25zdHJ1Y3RvciAobmFtZSwgdHlwZSwgY29udGFpbmVyLCBpbXBsKSB7XHJcblx0XHQvLyBJdCBjYW4gYmUgY2FsbGVkIHdpdGhvdXQgYXJndW1lbnRzLCBmb3IgdGVzdGluZyBpbnRlZ3JhdGlvbiByZWFzb25zLlxyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcclxuXHRcdFx0dGhpcy5pbml0KG5hbWUsIHR5cGUsIGNvbnRhaW5lciwgaW1wbCk7XHJcblx0XHR9XHRcdFxyXG4gICAgfVxyXG5cdFxyXG5cdGluaXQgKG5hbWUsIHR5cGUsIGNvbnRhaW5lciwgaW1wbCkge1x0XHRcdFxyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcclxuXHRcdFx0Ly8gQ2xlYW4gdXAgYmVmb3JlIGFzc2lnbmF0aW9uc1xyXG5cdFx0XHR0aGlzLmRlc3Ryb3koKTtcclxuXHRcdFx0Ly8gSW5pdCBwcm9wZXJ0aWVzXHJcblx0XHRcdHRoaXMuX25hbWUgPSBuYW1lO1xyXG5cdFx0XHR0aGlzLl90eXBlID0gdHlwZTtcclxuXHRcdFx0dGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xyXG5cdFx0XHR0aGlzLl9pbXBsID0gaW1wbDtcclxuXHRcdFx0dGhpcy5fY2hpbGRzID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoY29udGFpbmVyICE9PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAhVXRpbC5pc05vZGUoY29udGFpbmVyKSAmJlxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcblx0XHRcdFx0Ly8gQWRkcyB0aGlzIHRvIHBhcmVudCBhcyBhIGNoaWxkXHJcblx0XHRcdFx0Y29udGFpbmVyLmNoaWxkcy5wdXNoKHRoaXMpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Jhc2VPYmplY3QgaW5pdCBtZXRob2QgcmVxdWlyZXMgNCBwYXJhbWV0ZXJzJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKiBEZXN0cm95cyB0aGUgb2JqZWN0IGFuZCBhbGwgdGhpcyBjaGlsZHMuICovXHJcblx0ZGVzdHJveSAoKSB7XHJcblx0XHQvLyBGaXJzdCwgdGhlIGNoaWxkc1xyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9jaGlsZHMgIT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdHdoaWxlICh0aGlzLl9jaGlsZHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdHZhciBjaGlsZCA9IHRoaXMuX2NoaWxkcy5wb3AoKTtcclxuXHRcdFx0XHRpZiAodHlwZW9mIGNoaWxkID09PSAnb2JqZWN0JyBcclxuXHRcdFx0XHRcdCYmIHR5cGVvZiBjaGlsZC5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Y2hpbGQuZGVzdHJveSgpO1xyXG5cdFx0XHRcdH1cdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFJlbW92aW5nIGZyb20gY29udGFpbmVyXHJcblx0XHRpZiAodHlwZW9mIHRoaXMuX2NvbnRhaW5lciAhPT0gJ3VuZGVmaW5lZCdcclxuXHRcdFx0JiYgdHlwZW9mIHRoaXMuX2NvbnRhaW5lci5jaGlsZHMgIT09ICd1bmRlZmluZWQnKSB7XHJcblxyXG5cdFx0XHR0aGlzLl9jb250YWluZXIuY2hpbGRzID0gdGhpcy5fY29udGFpbmVyLmNoaWxkcy5maWx0ZXIoKGVsZW0pID0+IGVsZW0gIT09IHRoaXMpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBGaW5hbGx5LCB0aGUgb2JqZWN0XHJcblx0XHRpZiAodHlwZW9mIHRoaXMuX2ltcGwgIT09ICd1bmRlZmluZWQnICYmXHJcblx0XHRcdHR5cGVvZiB0aGlzLl9pbXBsLnVubG9hZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRpZiAoREVCVUcpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLnR5cGUgKyc6IENhbGwgdG8gdW5sb2FkKCkgaW4gZGVzdHJveSBtZXRob2QuJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5faW1wbC51bmxvYWQoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0LyoqIEZpbmRzIGEgY2hpbGQgb2JqZWN0IGJ5IG5hbWUgKi9cclxuXHRmaW5kIChuYW1lKSB7XHJcblx0XHRpZiAodGhpcy5uYW1lID09PSBuYW1lKSB7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLl9jaGlsZHMgIT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0Zm9yIChsZXQgaT0wOyBpPHRoaXMuX2NoaWxkcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0dmFyIGNoaWxkID0gdGhpcy5fY2hpbGRzW2ldO1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBjaGlsZCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGNoaWxkLmZpbmQgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRcdFx0dmFyIHJlc3VsdCA9IGNoaWxkLmZpbmQobmFtZSk7XHJcblx0XHRcdFx0XHRcdGlmIChyZXN1bHQgIT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHRcclxuXHQvKiogRmluZHMgYSBwYXJlbnQgb2JqZWN0IGJ5IG5hbWUgKi9cclxuXHRmaW5kUGFyZW50IChuYW1lKSB7XHJcblx0XHRpZiAodGhpcy5uYW1lID09PSBuYW1lKSB7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLl9jb250YWluZXIgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuX2NvbnRhaW5lcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmVudCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBhcmVudC5maW5kUGFyZW50ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gcGFyZW50LmZpbmRQYXJlbnQobmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHRcclxuXHQvKiogQWRkcyBhbiBldmVudCB0byB0aGUgb2JqZWN0LCB3aXRoIGFuIEFjdGlvbk1hbmFnZXIgb2JqZWN0IGFzIGEgY29sbGVjdGlvbiBvZiBhY3Rpb25zLiAqL1xyXG5cdGF0dGFjaEFjdGlvbk1hbmFnZXIgKGV2ZW50TmFtZSwgYWN0aW9uTWFuYWdlcikge1xyXG5cdFx0dGhpcy5pbXBsLmF0dGFjaEV2ZW50KGV2ZW50TmFtZSwgZnVuY3Rpb24gKGlkKSB7XHJcblx0XHRcdC8vIENoZWNraW5nIGlmIHRoZSBhY3Rpb25NYW5hZ2VyIGhhcyB0aGUgYWN0aW9uIHdpdGggdGhlIHJpZ2h0IGlkXHJcblx0XHRcdGlmICh0eXBlb2YgYWN0aW9uTWFuYWdlci5hY3Rpb25zW2lkXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdC8vIFRoZSBjb250ZXh0IGluIHRoZSBhY3Rpb25NYW5hZ2VyIGlzIHNlbnQgdG8gdGhlIGFjdGlvblxyXG5cdFx0XHRcdHJldHVybiBhY3Rpb25NYW5hZ2VyLmFjdGlvbnNbaWRdKGFyZ3VtZW50cywgYWN0aW9uTWFuYWdlci5jb250ZXh0KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKiBBZGRzIGFuIGV2ZW50IHRvIHRoZSBvYmplY3QsIHdpdGggYSBmdW5jdGlvbiBwYXJhbWV0ZXIgYXMgYW4gYWN0aW9uLiAqL1xyXG5cdGF0dGFjaEFjdGlvbiAoZXZlbnROYW1lLCBhY3Rpb24sIGNvbnRleHQpIHtcclxuXHRcdHRoaXMuaW1wbC5hdHRhY2hFdmVudChldmVudE5hbWUsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Ly8gTWFraW5nIHN1cmUgdGhlIGFjdGlvbiBwYXJhbSBpcyByZWFsbHkgYW4gb2JqZWN0XHJcblx0XHRcdGlmICh0eXBlb2YgYWN0aW9uID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdFx0Ly8gVGhlIGNvbnRleHQgaW4gdGhlIGFjdGlvbk1hbmFnZXIgaXMgc2VudCB0byB0aGUgYWN0aW9uXHJcblx0XHRcdFx0cmV0dXJuIGFjdGlvbihhcmd1bWVudHMsIGNvbnRleHQpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0Z2V0IG5hbWUgKCkge1xyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9uYW1lICE9PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fbmFtZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcigndGhpcy5fbmFtZSBpcyB1bmRlZmluZWQ6IGluaXQgbWV0aG9kIGhhcyBub3QgYmVlbiBjYWxsZWQnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBUeXBlIG9mIGNvbXBvbmVudDogbGF5b3V0LCB3aW5kb3csIGdyaWQsIGV0Yy4gXHJcbiAgICAgICAgKi9cclxuXHRnZXQgdHlwZSAoKSB7XHJcblx0XHRpZiAodHlwZW9mIHRoaXMuX3R5cGUgIT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl90eXBlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCd0aGlzLl90eXBlIGlzIHVuZGVmaW5lZDogaW5pdCBtZXRob2QgaGFzIG5vdCBiZWVuIGNhbGxlZCcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuICAgICAgICAqIFVzdWFsbHkgaXMgb3RoZXIgZGh0bWx4LWU2IG9iamVjdCwgdGhlIHJvb3QgY29udGFpbmVyIHNob3VsZCBiZSBpbnNpZGUgZG9jdW1lbnQuYm9keVxyXG4gICAgICAgICovXHJcblx0Z2V0IGNvbnRhaW5lciAoKSB7IFxyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9jb250YWluZXIgIT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9jb250YWluZXI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3RoaXMuX2NvbnRhaW5lciBpcyB1bmRlZmluZWQ6IGluaXQgbWV0aG9kIGhhcyBub3QgYmVlbiBjYWxsZWQnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0LyoqXHJcbiAgICAgICAgKiBkaHRtbHggb2JqZWN0LCBtdXN0IGJlIGNyZWF0ZWQgYnkgY2hpbGQgY2xhc3MgYmVmb3JlIGNhbGxpbmcgc3VwZXIgaW4gdGhlIGNvbnN0cnVjdG9yLlxyXG4gICAgICAgICovXHJcblx0Z2V0IGltcGwgKCkge1xyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9pbXBsICE9PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5faW1wbDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcigndGhpcy5faW1wbCBpcyB1bmRlZmluZWQ6IGluaXQgbWV0aG9kIGhhcyBub3QgYmVlbiBjYWxsZWQnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ2hpbGQgb2JqZWN0cywgY291bGQgYmUgYW55IG90aGVyIGRodG1seE9iamVjdFxyXG5cdCAqL1xyXG5cdGdldCBjaGlsZHMgKCkge1xyXG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9jaGlsZHMgIT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9jaGlsZHM7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3RoaXMuX2NoaWxkcyBpcyB1bmRlZmluZWQ6IGluaXQgbWV0aG9kIGhhcyBub3QgYmVlbiBjYWxsZWQnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0c2V0IGNoaWxkcyAoY2hpbGRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcyA9IGNoaWxkcztcclxuICAgICAgICB9XHJcbn1cclxuIiwiXHJcbmltcG9ydCB7IERFQlVHLCBPQkpFQ1RfVFlQRSB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xyXG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xyXG5cclxuLyoqXHJcbiAgKiBCYXNlIGNsYXNzIGZvciBhbGwgbGF5b3V0IG9iamVjdHMsIHNlZTpcclxuICAqIGh0dHBzOi8vZG9jcy5kaHRtbHguY29tL2xheW91dF9faW5kZXguaHRtbFxyXG4gICovXHJcbmV4cG9ydCBjbGFzcyBMYXlvdXRDZWxsIGV4dGVuZHMgQmFzZU9iamVjdCB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyB0aGUgTGF5b3V0Q2VsbCBvYmplY3QsIGNhbGxlZCBmcm9tIEJhc2VMYXlvdXQgY2xhc3NcclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge21peGVkfSBjb250YWluZXIgLSBPYmplY3Qgb3IgZG9tIGlkIG9mIHRoZSBwYXJlbnQgZWxlbWVudC5cclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaW1wbCAtIGRodG1seCBvYmplY3QsIGNyZWF0ZWQgaW4gdGhlIEJhc2VMYXlvdXQgY2xhc3MuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgaW1wbCkge1xyXG5cdFx0aWYgKERFQlVHKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdMYXlvdXRDZWxsIGNvbnN0cnVjdG9yJyk7XHJcblx0XHR9XHJcblx0XHQvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XHJcblx0XHRcdHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIGltcGwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGltcGwpIHtcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XHJcblx0XHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuTEFZT1VUX0NFTEwsIGNvbnRhaW5lciwgaW1wbCk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBIZWFkZXIgaXMgaGlkZGVuIGJ5IGRlZmF1bHRcclxuXHRcdFx0dGhpcy5oZWFkZXIgPSBudWxsO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5pbXBsLmZpeFNpemUoZmFsc2UsIGZhbHNlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignTGF5b3V0Q2VsbCBpbml0IG1ldGhvZCByZXF1aXJlcyAzIHBhcmFtZXRlcnMnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Z2V0IGhlaWdodCAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5pbXBsLmdldEhlaWdodCgpO1xyXG5cdH1cclxuXHRcclxuXHRzZXQgaGVpZ2h0IChoZWlnaHQpIHtcclxuXHRcdHRoaXMuaW1wbC5zZXRIZWlnaHQoaGVpZ2h0KTtcclxuXHR9XHJcblx0XHJcblx0Z2V0IHdpZHRoICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmltcGwuZ2V0V2lkdGgoKTtcclxuXHR9XHJcblx0XHJcblx0c2V0IHdpZHRoICh3aWR0aCkge1xyXG5cdFx0dGhpcy5pbXBsLnNldFdpZHRoKHdpZHRoKTtcclxuXHR9XHJcblx0XHJcblx0c2V0IGh0bWwgKGh0bWwpIHtcclxuXHRcdHRoaXMuaW1wbC5hdHRhY2hIVE1MU3RyaW5nKGh0bWwpO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgaGVhZGVyICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmltcGwuZ2V0VGV4dCgpO1xyXG5cdH1cclxuXHRcclxuXHRzZXQgaGVhZGVyICh0ZXh0KSB7XHJcblx0XHRpZiAodGV4dCA9PSBudWxsKSB7XHJcblx0XHRcdHRoaXMuaW1wbC5zZXRUZXh0KCcnKTtcclxuXHRcdFx0dGhpcy5pbXBsLmhpZGVIZWFkZXIoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuaW1wbC5zZXRUZXh0KHRleHQpO1xyXG5cdFx0XHR0aGlzLmltcGwuc2hvd0hlYWRlcigpO1xyXG5cdFx0fVx0XHRcclxuXHR9XHJcbn0iLCJcclxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIFNLSU4sIERFQlVHIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XHJcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XHJcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XHJcbmltcG9ydCB7IExheW91dENlbGwgfSBmcm9tICdMYXlvdXRDZWxsJztcclxuXHJcbi8qKlxyXG4gICogQmFzZSBjbGFzcyBmb3IgYWxsIGxheW91dCBvYmplY3RzLCBzZWU6XHJcbiAgKiBodHRwczovL2RvY3MuZGh0bWx4LmNvbS9sYXlvdXRfX2luZGV4Lmh0bWxcclxuICAqL1xyXG5leHBvcnQgY2xhc3MgQmFzZUxheW91dCBleHRlbmRzIEJhc2VPYmplY3Qge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgdGhlIEJhc2VMYXlvdXQgb2JqZWN0LiBDYW4gYmUgY2FsbGVkIHdpdGhvdXQgYXJndW1lbnRzLCBmb3IgdGVzdGluZyBwdXJwb3Nlcy5cclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge21peGVkfSBjb250YWluZXIgLSBPYmplY3Qgb3IgZG9tIGlkIG9mIHRoZSBwYXJlbnQgZWxlbWVudC5cclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVybiAtIGRodG1seCBsYXlvdXQgcGF0dGVybiwgc2VlOiBodHRwOi8vZG9jcy5kaHRtbHguY29tL2xheW91dF9fcGF0dGVybnMuaHRtbFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIHBhdHRlcm4pIHtcclxuXHRcdGlmIChERUJVRykge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnQmFzZUxheW91dCBjb25zdHJ1Y3RvcicpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XHJcblx0XHRcdHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIHBhdHRlcm4pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIHBhdHRlcm4pIHtcclxuXHRcdFxyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcclxuXHRcdFxyXG5cdFx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXHJcblx0XHRcdHZhciBpbXBsID0gdGhpcy5pbml0RGh0bWx4TGF5b3V0KGNvbnRhaW5lciwgcGF0dGVybik7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXHJcblx0XHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuTEFZT1VULCBjb250YWluZXIsIGltcGwpO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gSW5pdHMgdGhlIExheW91dENlbGwgb2JqZWN0c1xyXG5cdFx0XHR0aGlzLmluaXRDZWxscygpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKGNvbnRhaW5lciBpbnN0YW5jZW9mIExheW91dENlbGwpIHtcclxuXHRcdFx0XHR2YXIgY29udGFpbmVyTGF5b3V0ID0gY29udGFpbmVyLmNvbnRhaW5lcjtcclxuXHRcdFx0XHRjb250YWluZXJMYXlvdXQuYXR0YWNoQWN0aW9uKFwib25SZXNpemVGaW5pc2hcIiwgZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdGltcGwuc2V0U2l6ZXMoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignQmFzZUxheW91dCBpbml0IG1ldGhvZCByZXF1aXJlcyAzIHBhcmFtZXRlcnMnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0LyoqICBcclxuXHQgKiBJbnRlcm5hbCBtZXRob2QgY2FsbGVkIGJ5IHRoZSBjb25zdHJ1Y3RvciwgaXQgY3JlYXRlcyB0aGUgTGF5b3V0Q2VsbCBcclxuXHQgKiBvYmplY3RzIGFuZCBhZGRzIHRoZW0gdG8gdGhlIHRoaXMuY2hpbGRzIGFycmF5XHJcblx0ICovXHJcblx0aW5pdENlbGxzICgpIHtcclxuXHRcdC8vIE5lZWRlZCBpbnNpZGUgdGhlIGZvckVhY2hJdGVtXHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgaSA9IDE7XHJcblx0XHR0aGlzLl9pbXBsLmZvckVhY2hJdGVtKGZ1bmN0aW9uIChjZWxsSW1wbCkge1xyXG5cdFx0XHQvLyBoZXJlIHRoaXMgcG9pbnQgdG8gdGhlIGRodG1sWExheW91dE9iamVjdCBvYmplY3QuXHJcblx0XHRcdHZhciBjZWxsTmFtZSA9IHNlbGYubmFtZSArICdfY2VsbCcgKyAoaSsrKTtcclxuXHRcdFx0dmFyIGNlbGwgPSBuZXcgTGF5b3V0Q2VsbChjZWxsTmFtZSwgc2VsZiwgY2VsbEltcGwpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKiogQ3JlYXRlcyB0aGUgZGh0bWxYTGF5b3V0T2JqZWN0IGluc2lkZSBpdHMgY29udGFpbmVyLiAqL1xyXG5cdGluaXREaHRtbHhMYXlvdXQgKGNvbnRhaW5lciwgcGF0dGVybikge1xyXG5cdFx0dmFyIGltcGwgPSBudWxsO1xyXG5cdFx0aWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcclxuXHRcdFx0XHJcblx0XHRcdGltcGwgPSBuZXcgZGh0bWxYTGF5b3V0T2JqZWN0KHtcclxuXHRcdFx0XHQvLyBpZCBvciBvYmplY3QgZm9yIHBhcmVudCBjb250YWluZXJcclxuXHRcdFx0XHRwYXJlbnQ6IGNvbnRhaW5lciwgICAgXHRcclxuXHRcdFx0XHQvLyBsYXlvdXQncyBwYXR0ZXJuXHRcdFx0XHJcblx0XHRcdFx0cGF0dGVybjogcGF0dGVybixcclxuXHRcdFx0XHQvLyBsYXlvdXQncyBza2luXHJcblx0XHRcdFx0c2tpbjogU0tJTlxyXG5cdFx0XHR9KTtcclxuXHRcdFxyXG5cdFx0fSBlbHNlIGlmIChjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUX0NFTEwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UQUJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLldJTkRPVykge1x0XHRcdFxyXG5cdFx0XHRpbXBsID0gY29udGFpbmVyLmltcGwuYXR0YWNoTGF5b3V0KHBhdHRlcm4pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGltcGw7XHJcblx0fVxyXG59XHJcblxyXG4iLCJcclxuaW1wb3J0IHsgQmFzZUxheW91dCB9IGZyb20gJ2xheW91dC9CYXNlTGF5b3V0JztcclxuXHJcbi8qKiBMYXlvdXQgd2l0aCBvbmx5IG9uZSBjZWxsICovXHJcbmV4cG9ydCBjbGFzcyBTaW1wbGVMYXlvdXQgZXh0ZW5kcyBCYXNlTGF5b3V0IHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIHRoZSBTaW1wbGVMYXlvdXQgb2JqZWN0XHJcblx0ICogQGNvbnN0cnVjdG9yXHJcblx0ICogQHBhcmFtIHttaXhlZH0gY29udGFpbmVyIC0gT2JqZWN0IG9yIGRvbSBpZCBvZiB0aGUgcGFyZW50IGVsZW1lbnQuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lcikge1xyXG5cdFx0c3VwZXIobmFtZSwgY29udGFpbmVyLCAnMUMnKTtcclxuXHR9XHJcblx0XHJcblx0LyoqIFRoZSBvbmx5IExheW91dENlbGwgb2JqZWN0IGluIHRoZSBsYXlvdXQgKi9cclxuXHRnZXQgY2VsbCAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jaGlsZHNbMF07XHJcblx0fVxyXG59IiwiXHJcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XHJcbmltcG9ydCB7IEJhc2VMYXlvdXQgfSBmcm9tICdsYXlvdXQvQmFzZUxheW91dCc7XHJcblxyXG4vKipcclxuICAqIExheW91dCB3aXRoIHR3byBjb2x1bW5zOiBsZWZ0IGFuZCByaWdodFxyXG4gICovXHJcbmV4cG9ydCBjbGFzcyBUd29Db2x1bW5zTGF5b3V0IGV4dGVuZHMgQmFzZUxheW91dCB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyB0aGUgVHdvQ29sdW1uc0xheW91dCBvYmplY3RcclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge21peGVkfSBjb250YWluZXIgLSBPYmplY3Qgb3IgZG9tIGlkIG9mIHRoZSBwYXJlbnQgZWxlbWVudC5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyKSB7XHJcblx0XHRpZiAoREVCVUcpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ1R3b0NvbHVtbnNMYXlvdXQgY29uc3RydWN0b3InKTtcclxuXHRcdH1cclxuXHRcdHN1cGVyKG5hbWUsIGNvbnRhaW5lciwgJzJVJyk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKiBMZWZ0IExheW91dENlbGwgKi9cclxuXHRnZXQgbGVmdCAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5jaGlsZHNbMF07XHJcblx0fVxyXG5cdFxyXG5cdC8qKiBSaWdodCBMYXlvdXRDZWxsICovXHJcblx0Z2V0IHJpZ2h0ICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmNoaWxkc1sxXTtcclxuXHR9XHJcbn0iLCJcclxuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcclxuaW1wb3J0IHsgQmFzZUxheW91dCB9IGZyb20gJ2xheW91dC9CYXNlTGF5b3V0JztcclxuXHJcbi8qKiBMYXlvdXQgd2l0aCBwYWdlLWxpa2Ugc3RydWN0dXJlOiBoZWFkZXIsIGJvZHkgYW5kIGZvb3RlciAqL1xyXG5leHBvcnQgY2xhc3MgUGFnZUxheW91dCBleHRlbmRzIEJhc2VMYXlvdXQge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgdGhlIFNpbXBsZUxheW91dCBvYmplY3RcclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge21peGVkfSBjb250YWluZXIgLSBPYmplY3Qgb3IgZG9tIGlkIG9mIHRoZSBwYXJlbnQgZWxlbWVudC5cclxuXHQgKiBAcGFyYW0ge2ludH0gaGVhZGVySGVpZ2h0IC0gRml4ZWQgaGVhZGVyIGhlaWdodCBpbiBwaXhlbHMuXHJcblx0ICogQHBhcmFtIHtpbnR9IGZvb3RlckhlaWdodCAtIEZpeGVkIGZvb3RlciBoZWlnaHQgaW4gcGl4ZWxzLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIGhlYWRlckhlaWdodCwgZm9vdGVySGVpZ2h0KSB7XHJcblx0XHRpZiAoREVCVUcpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ1R3b0NvbHVtbnNMYXlvdXQgY29uc3RydWN0b3InKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0c3VwZXIoKTtcclxuXHRcdFxyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcclxuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgaGVhZGVySGVpZ2h0LCBmb290ZXJIZWlnaHQpO1xyXG5cdFx0fVx0XHJcblx0fVxyXG5cdFxyXG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lciwgaGVhZGVySGVpZ2h0LCBmb290ZXJIZWlnaHQpIHtcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSA0KSB7XHJcblx0XHRcdHN1cGVyLmluaXQobmFtZSwgY29udGFpbmVyLCAnM0UnKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuaGVhZGVyLmhlaWdodCA9IGhlYWRlckhlaWdodDtcclxuXHRcdFx0dGhpcy5oZWFkZXIuaW1wbC5maXhTaXplKGZhbHNlLCB0cnVlKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZm9vdGVyLmhlaWdodCA9IGZvb3RlckhlaWdodDtcclxuXHRcdFx0dGhpcy5mb290ZXIuaW1wbC5maXhTaXplKGZhbHNlLCB0cnVlKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuaW1wbC5zZXRBdXRvU2l6ZShcImE7YjtjXCIsIFwiYlwiKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignUGFnZUxheW91dCBpbml0IG1ldGhvZCByZXF1aXJlcyA0IHBhcmFtZXRlcnMnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0LyoqIFRoZSBvbmx5IExheW91dENlbGwgb2JqZWN0IGluIHRoZSBsYXlvdXQgKi9cclxuXHRnZXQgaGVhZGVyICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmNoaWxkc1swXTtcclxuXHR9XHJcblx0XHJcblx0Z2V0IGJvZHkgKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRzWzFdO1x0XHJcblx0fVxyXG5cdFxyXG5cdGdldCBmb290ZXIgKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRzWzJdO1x0XHJcblx0fVxyXG59IiwiXHJcbmltcG9ydCB7IEJhc2VMYXlvdXQgfSBmcm9tICdsYXlvdXQvQmFzZUxheW91dCc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFdpbmRvd0xheW91dCBleHRlbmRzIEJhc2VMYXlvdXQge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgdGhlIFdpbmRvd0xheW91dCBvYmplY3RcclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge21peGVkfSBjb250YWluZXIgLSBPYmplY3Qgb3IgZG9tIGlkIG9mIHRoZSBwYXJlbnQgZWxlbWVudC5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyKSB7XHJcblx0XHRzdXBlcihuYW1lLCBjb250YWluZXIsICcyRScpO1xyXG5cdH1cclxuXHJcblx0Z2V0IGJvZHkgKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRzWzBdO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgZm9vdGVyICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmNoaWxkc1sxXTtcclxuXHR9XHJcbn0iLCJcclxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIERFQlVHLCBTS0lOLCBNRU5VX0lDT05TX1BBVEggfSBmcm9tICdnbG9iYWwvY29uZmlnJztcclxuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcclxuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcclxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnYWN0aW9ucy9BY3Rpb24nO1xyXG5pbXBvcnQgeyBNZW51SXRlbSB9IGZyb20gJ21lbnUvTWVudUl0ZW0nO1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgY2xhc3MgZm9yIE1lbnUgb2JqZWN0cywgc2VlOlxyXG4gKiBodHRwOi8vZG9jcy5kaHRtbHguY29tL21lbnVfX2luZGV4Lmh0bWxcclxuICovXHJcbmV4cG9ydCBjbGFzcyBNZW51IGV4dGVuZHMgQmFzZU9iamVjdCB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQGNvbnN0cnVjdG9yXHJcblx0ICogQHBhcmFtIHttaXhlZH0gY29udGFpbmVyIC0gT2JqZWN0IG9yIGRvbSBpZCBvZiB0aGUgcGFyZW50IGVsZW1lbnQuXHJcblx0ICogQHBhcmFtIHthY3Rpb25NYW5hZ2VyfSBBY3Rpb25NYW5hZ2VyIC0gQ29udGFpbnMgdGhlIGFjdGlvbnMgdGhlIG1lbnUgd2lsbCBleGVjdXRlLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpIHtcclxuXHRcdGlmIChERUJVRykge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnTWVudSBjb25zdHJ1Y3RvcicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxyXG5cdFx0c3VwZXIoKTtcclxuXHRcdFxyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcclxuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcik7XHJcblx0XHR9XHRcclxuXHR9XHJcblxyXG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcikge1xyXG5cclxuXHRcdC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3RcclxuXHRcdHZhciBpbXBsID0gdGhpcy5pbml0RGh0bWx4TWVudShjb250YWluZXIpO1xyXG5cdFx0aW1wbC5zZXRJY29uc1BhdGgoTUVOVV9JQ09OU19QQVRIKTtcclxuXHJcblx0XHQvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXHJcblx0XHRzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLk1FTlUsIGNvbnRhaW5lciwgaW1wbCk7XHJcblx0XHRcclxuXHRcdC8vIEVuYWJsZSBvbkNsaWNrIGV2ZW50IFxyXG5cdFx0dGhpcy5hdHRhY2hBY3Rpb25NYW5hZ2VyKFwib25DbGlja1wiLCBhY3Rpb25NYW5hZ2VyKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQWRkcyBhIHRleHQgY29udGFpbmVyICh3aXRoIG5vIGFjdGlvbikgdG8gdGhlIG1lbnUuXHJcblx0ICogQHBhcmFtIHttaXhlZH0gY29udGFpbmVyIC0gT2JqZWN0IG9yIGRvbSBpZCBvZiB0aGUgcGFyZW50IGVsZW1lbnQuXHJcblx0ICogQHBhcmFtIHtuYW1lfSBzdHJpbmcgLSBUaGUgbmFtZSB0aGF0IGlkZW50aWZpZXMgdGhlIE1lbnVJdGVtLlxyXG5cdCAqIEBwYXJhbSB7Y2FwdGlvbn0gc3RyaW5nIC0gVGhlIHZpc2libGUgdGV4dCBvZiB0aGUgY29udGFpbmVyLlxyXG5cdCAqIEBwYXJhbSB7cGFyZW50TmFtZX0gc3RyaW5nIC0gVGhlIG5hbWUgb2YgdGhlIHBhcmVudCBNZW51SXRlbSAoZGVmYXVsdCBudWxsKS5cclxuXHQgKiByZXR1cm5zIHtNZW51fSBUaGUgbWVudSBvYmplY3QgaXRzZWxmLCB0byBjaGFpbiBpdGVtIGNyZWF0aW9uLlxyXG5cdCAqL1xyXG5cdGFkZFRleHRDb250YWluZXIgKG5hbWUsIGNhcHRpb24sIHBhcmVudE5hbWUgPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCBtZW51SXRlbSA9IG5ldyBNZW51SXRlbShwYXJlbnROYW1lLCBuYW1lLCBudWxsLCBjYXB0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTWVudUl0ZW0obWVudUl0ZW0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBZGRzIGEgTWVudUl0ZW0gKHdpdGggYWN0aW9uKSB0byB0aGUgbWVudSBjb250YWluZXIgXHJcblx0ICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW0gLSBUaGUgTWVudUl0ZW0gb2JqZWN0LCB1c3VhbGx5IGNyZWF0ZWQgaW4gdGhlIEFjdGlvbk1hbmFnZXJcclxuXHQgKiByZXR1cm5zIHtNZW51fSBUaGUgbWVudSBvYmplY3QgaXRzZWxmLCB0byBjaGFpbiBpdGVtIGNyZWF0aW9uXHJcblx0ICovXHJcblx0YWRkTWVudUl0ZW0gKG1lbnVJdGVtKSB7XHJcblx0XHRpZiAodHlwZW9mIG1lbnVJdGVtLnBhcmVudE5hbWUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVudUl0ZW0ucGFyZW50TmFtZSA9IG51bGw7XHJcblx0XHR9IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbXBsLmFkZE5ld0NoaWxkKG1lbnVJdGVtLnBhcmVudE5hbWUsICh0aGlzLl9jaGlsZHMubGVuZ3RoKSwgbWVudUl0ZW0ubmFtZSwgbWVudUl0ZW0uY2FwdGlvbiwgZmFsc2UsIG1lbnVJdGVtLmljb24sIG1lbnVJdGVtLmljb25EaXNhYmxlZCk7XHRcdFxyXG5cdFx0dGhpcy5fY2hpbGRzLnB1c2gobWVudUl0ZW0pO1xyXG5cdFx0Ly8gY3VycnlmaW5nIVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKiogQ3JlYXRlcyB0aGUgZGh0bWxYTWVudU9iamVjdCBpbnNpZGUgaXRzIGNvbnRhaW5lci4gKi9cclxuXHRpbml0RGh0bWx4TWVudShjb250YWluZXIpIHtcclxuXHRcdHZhciBpbXBsID0gbnVsbDtcclxuICAgICAgICAvLyBjb250YWluZXIgY2FuIGJlIG51bGxcclxuXHRcdGlmIChjb250YWluZXIgPT0gbnVsbCB8fCBVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XHJcblx0XHRcdGltcGwgPSBuZXcgZGh0bWxYTWVudU9iamVjdChjb250YWluZXIsIFNLSU4pO1xyXG5cdFx0XHRcclxuXHRcdH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVF9DRUxMICBcclxuXHRcdFx0fHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVFxyXG5cdFx0XHR8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuV0lORE9XKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpbXBsID0gY29udGFpbmVyLmltcGwuYXR0YWNoTWVudSgpO1xyXG5cdFx0XHRpbXBsLnNldFNraW4oU0tJTik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2luaXREaHRtbHhNZW51OiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGltcGw7XHJcblx0fVxyXG5cdFxyXG5cdHNldCBjaGlsZHMgKG1lbnVJdGVtcykge1xyXG5cdFx0Ly8gQ2xlYW4gYXJyYXkgZmlyc3RcclxuXHRcdHRoaXMuX2NoaWxkcyA9IFtdO1xyXG5cdFx0XHJcblx0XHQvLyBQb3B1bGF0ZSBhcnJheVxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtZW51SXRlbXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0dGhpcy5hZGRNZW51SXRlbShtZW51SXRlbXNbaV0pO1xyXG5cdFx0fVxyXG5cdH1cclxufSIsIlxyXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgREVCVUcsIFNLSU4gfSBmcm9tICdnbG9iYWwvY29uZmlnJztcclxuaW1wb3J0IHsgTWVudSB9IGZyb20gJ21lbnUvTWVudSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29udGV4dE1lbnUgZXh0ZW5kcyBNZW51IHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKSB7XHJcbiAgICAgICAgaWYgKERFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb250ZXh0TWVudSBjb25zdHJ1Y3RvcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGluaXQgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcikge1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE1lbnUgaW5pdCBtZXRob2QsIGNvbnRhaW5lciBtdXN0IGJlIG51bGxcclxuICAgICAgICBzdXBlci5pbml0KG5hbWUsIG51bGwsIGFjdGlvbk1hbmFnZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuICAgICAgICBjb250YWluZXIuY2hpbGRzLnB1c2godGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbXBsLnJlbmRlckFzQ29udGV4dE1lbnUoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRhaW5lciA9PT0gJ29iamVjdCcgJiZcclxuICAgICAgICAgICAgdGhpcy5pbXBsLmlzQ29udGV4dFpvbmUoY29udGFpbmVyLmltcGwpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW1wbC5hZGRDb250ZXh0Wm9uZShjb250YWluZXIuaW1wbCk7ICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkdSSUQgIFxyXG4gICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuVFJFRSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29udGFpbmVyLmltcGwuZW5hYmxlQ29udGV4dE1lbnUodGhpcy5pbXBsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJcclxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIFNLSU4sIERFQlVHLCBUUkVFX0lDT05TX1BBVEggfSBmcm9tICdnbG9iYWwvY29uZmlnJztcclxuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcclxuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcclxuXHJcbi8qKlxyXG4gICogQmFzZSBjbGFzcyBmb3IgYWxsIFRyZWVWaWV3IG9iamVjdHMsIHNlZTpcclxuICAqIGh0dHA6Ly9kb2NzLmRodG1seC5jb20vdHJlZXZpZXdfX2luZGV4Lmh0bWxcclxuICAqL1xyXG5leHBvcnQgY2xhc3MgQmFzZVRyZWUgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcclxuXHJcblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcclxuXHRcdGlmIChERUJVRykge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnQmFzZVRyZWUgY29uc3RydWN0b3InKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcclxuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIgPSBudWxsKSB7XHJcblxyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xyXG5cclxuXHRcdFx0Ly8gQ3JlYXRlcyB0aGUgZGh0bWx4IG9iamVjdCAoc2VlIGZ1bmN0aW9uIGJlbG93KVxyXG5cdFx0XHR2YXIgaW1wbCA9IHRoaXMuaW5pdERodG1seFRyZWUoY29udGFpbmVyKTtcclxuXHRcdFx0aW1wbC5zZXRTa2luKFNLSU4pO1xyXG5cdFx0XHRpbXBsLnNldEljb25zUGF0aChUUkVFX0lDT05TX1BBVEgpO1xyXG5cclxuXHRcdFx0Ly8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxyXG5cdFx0XHRzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLlRSRUUsIGNvbnRhaW5lciwgaW1wbCk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBFbmFibGUgb25TZWxlY3QgZXZlbnQgXHJcblx0XHRcdGlmIChhY3Rpb25NYW5hZ2VyICE9IG51bGwpIHtcclxuXHRcdFx0XHR0aGlzLmF0dGFjaEFjdGlvbk1hbmFnZXIoXCJvblNlbGVjdFwiLCBhY3Rpb25NYW5hZ2VyKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignQmFzZVRyZWUgaW5pdCBtZXRob2QgcmVxdWlyZXMgMiBwYXJhbWV0ZXJzJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhZGRJdGVtICh0cmVlSXRlbSkge1xyXG5cclxuXHRcdHRoaXMuaW1wbC5hZGRJdGVtKHRyZWVJdGVtLmlkLCB0cmVlSXRlbS50ZXh0LCB0cmVlSXRlbS5wYXJlbnRJZCk7XHJcblx0XHR0aGlzLl9jaGlsZHNbdHJlZUl0ZW0uaWRdID0gdHJlZUl0ZW0uYWN0aW9uO1xyXG5cdH1cclxuXHJcblx0aW5pdERodG1seFRyZWUgKGNvbnRhaW5lcikge1xyXG5cclxuXHRcdHZhciBpbXBsID0gbnVsbDtcclxuXHRcdGlmIChVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XHJcblx0XHRcdC8vIGNhbGwgdG8gZGh0bWx4IG9iamVjdCBjb25zdHJ1Y3RvciBcclxuXHRcdFx0aW1wbCA9IG5ldyBkaHRtbFhUcmVlT2JqZWN0KGNvbnRhaW5lciwgXCIxMDAlXCIsIFwiMTAwJVwiLCAwKTtcclxuXHRcdFxyXG5cdFx0fSBlbHNlIGlmIChjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUX0NFTEwpIHtcclxuXHRcdFx0aW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaFRyZWUoKTtcclxuXHRcdFx0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2luaXREaHRtbHhUcmVlOiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGltcGw7XHJcblx0fVxyXG59XHJcbiIsIlxyXG5cclxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIFNLSU4sIERFQlVHIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XHJcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XHJcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XHJcblxyXG5leHBvcnQgY2xhc3MgVGFiYmFyIGV4dGVuZHMgQmFzZU9iamVjdCB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIpIHtcclxuICAgICAgICBpZiAoREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RhYmJhciBjb25zdHJ1Y3RvcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaW5pdCAobmFtZSwgY29udGFpbmVyKSB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3QgKHNlZSBmdW5jdGlvbiBiZWxvdylcclxuICAgICAgICAgICAgdmFyIGltcGwgPSB0aGlzLmluaXREaHRtbHhUYWJiYXIoY29udGFpbmVyKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2RcclxuICAgICAgICAgICAgc3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5UQUJCQVIsIGNvbnRhaW5lciwgaW1wbCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGFiYmFyIGluaXQgbWV0aG9kIHJlcXVpcmVzIDIgcGFyYW1ldGVycycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaW5pdERodG1seFRhYmJhciAoY29udGFpbmVyKSB7XHJcbiAgICAgICAgdmFyIGltcGwgPSBudWxsO1xyXG4gICAgICAgIGlmIChVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpbXBsID0gbmV3IGRodG1sWFRhYkJhcih7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGNvbnRhaW5lcixcclxuICAgICAgICAgICAgICAgIHNraW46IFNLSU5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVF9DRUxMXHJcbiAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5BQ0NPUkRJT05fQ0VMTFxyXG4gICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuV0lORE9XXHJcbiAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UQUIpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGltcGwgPSBjb250YWluZXIuaW1wbC5hdHRhY2hUYWJiYXIoKTtcclxuICAgICAgICAgICAgaW1wbC5zZXRTa2luKFNLSU4pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignaW5pdERodG1seFRhYmJhcjogY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcclxuXHRcdH1cclxuICAgICAgICByZXR1cm4gaW1wbDtcclxuICAgIH1cclxufSIsIlxyXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcclxuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcclxuXHJcbmV4cG9ydCBjbGFzcyBUYWIgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgaWQsIHRleHQsIHBvc2l0aW9uID0gbnVsbCwgYWN0aXZlID0gZmFsc2UsIGNsb3NlID0gZmFsc2UpIHtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RhYiBjb25zdHJ1Y3RvcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgaWQsIHRleHQsIHBvc2l0aW9uLCBhY3RpdmUsIGNsb3NlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgaW5pdCAobmFtZSwgY29udGFpbmVyLCBpZCwgdGV4dCwgcG9zaXRpb24gPSBudWxsLCBhY3RpdmUgPSBmYWxzZSwgY2xvc2UgPSBmYWxzZSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgdGhhdCBjb250YWluZXIgbXVzdCBiZSBhIFRhYmJhciBvYmplY3RcclxuICAgICAgICBjb250YWluZXIuaW1wbC5hZGRUYWIoaWQsIHRleHQsIG51bGwsIHBvc2l0aW9uLCBhY3RpdmUsIGNsb3NlKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgaW1wbCA9IGNvbnRhaW5lci5pbXBsLnRhYnMoaWQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXHJcbiAgICAgICAgc3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5UQUIsIGNvbnRhaW5lciwgaW1wbCk7XHJcbiAgICB9XHJcbn1cclxuIiwiXHJcblxyXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcclxuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcclxuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcclxuXHJcbmV4cG9ydCBjbGFzcyBBY2NvcmRpb24gZXh0ZW5kcyBCYXNlT2JqZWN0IHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lcikge1xyXG4gICAgICAgIGlmIChERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQWNjb3JkaW9uIGNvbnN0cnVjdG9yJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpbml0IChuYW1lLCBjb250YWluZXIpIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQ3JlYXRlcyB0aGUgZGh0bWx4IG9iamVjdCAoc2VlIGZ1bmN0aW9uIGJlbG93KVxyXG4gICAgICAgICAgICB2YXIgaW1wbCA9IHRoaXMuaW5pdERodG1seEFjY29yZGlvbihjb250YWluZXIpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxyXG4gICAgICAgICAgICBzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLlRBQkJBUiwgY29udGFpbmVyLCBpbXBsKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYWJiYXIgaW5pdCBtZXRob2QgcmVxdWlyZXMgMiBwYXJhbWV0ZXJzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpbml0RGh0bWx4QWNjb3JkaW9uIChjb250YWluZXIpIHtcclxuICAgICAgICB2YXIgaW1wbCA9IG51bGw7XHJcbiAgICAgICAgaWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGltcGwgPSBuZXcgZGh0bWxYQWNjb3JkaW9uKHtcclxuICAgICAgICAgICAgICAgIHBhcmVudDogY29udGFpbmVyLFxyXG4gICAgICAgICAgICAgICAgc2tpbjogU0tJTlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIGlmIChjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUX0NFTExcclxuICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5BQ0NPUkRJT05fQ0VMTFxyXG4gICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLlRBQlxyXG4gICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLldJTkRPVykge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaEFjY29yZGlvbigpO1xyXG4gICAgICAgICAgICBpbXBsLnNldFNraW4oU0tJTik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbml0RGh0bWx4QWNjb3JkaW9uOiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW1wbDtcclxuICAgIH1cclxufSIsIlxyXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcclxuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcclxuXHJcbmV4cG9ydCBjbGFzcyBBY2NvcmRpb25DZWxsIGV4dGVuZHMgQmFzZU9iamVjdCB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIGlkLCB0ZXh0LCBvcGVuID0gZmFsc2UsIGhlaWdodCA9IG51bGwsIGljb24gPSBudWxsKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKERFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBY2NvcmRpb25DZWxsIGNvbnN0cnVjdG9yJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBpZCwgdGV4dCwgb3BlbiwgaGVpZ2h0LCBpY29uKTtcclxuICAgICAgICB9XHJcbiAgICB9ICAgIFxyXG4gICAgXHJcbiAgICBpbml0IChuYW1lLCBjb250YWluZXIsIGlkLCB0ZXh0LCBvcGVuID0gZmFsc2UsIGhlaWdodCA9IG51bGwsIGljb24gPSBudWxsKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayB0aGF0IGNvbnRhaW5lciBtdXN0IGJlIGEgQWNjb3JkaW9uIG9iamVjdFxyXG4gICAgICAgIGNvbnRhaW5lci5pbXBsLmFkZEl0ZW0oaWQsIHRleHQsIG9wZW4sIGhlaWdodCwgaWNvbik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGltcGwgPSBjb250YWluZXIuaW1wbC5jZWxscyhpZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgIC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2RcclxuICAgICAgICBzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLkFDQ09SRElPTl9DRUxMLCBjb250YWluZXIsIGltcGwpO1xyXG4gICAgfVxyXG59XHJcbiIsIlxyXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgREVCVUcsIFNLSU4sIFRPT0xCQVJfSUNPTlNfUEFUSCB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xyXG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnZ2xvYmFsL1V0aWwnO1xyXG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRvb2xiYXIgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcclxuXHRcclxuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKSB7XHJcblx0XHRpZiAoREVCVUcpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ1Rvb2xiYXIgY29uc3RydWN0b3InKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXHJcblx0XHRzdXBlcigpO1xyXG5cdFx0XHJcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xyXG5cdFx0XHR0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aW5pdCAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKSB7XHJcblx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXHJcblx0XHR2YXIgaW1wbCA9IGluaXREaHRtbHhUb29sYmFyKGNvbnRhaW5lcik7XHJcblx0XHRpbXBsLnNldEljb25zUGF0aChUT09MQkFSX0lDT05TX1BBVEgpO1xyXG5cdFx0XHJcblx0XHQvLyBCYXNlT2JqZWN0IGNvbnN0cnVjdG9yXHJcblx0XHRzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLlRPT0xCQVIsIGNvbnRhaW5lciwgaW1wbCk7XHJcblx0XHRcclxuXHRcdHRoaXMuYXR0YWNoQWN0aW9uTWFuYWdlcihcIm9uQ2xpY2tcIiwgYWN0aW9uTWFuYWdlcik7XHJcblx0fVxyXG5cdFxyXG5cdGFkZFRvb2xiYXJCdXR0b24gKHRvb2xiYXJJdGVtKSB7XHJcblx0XHR0aGlzLmltcGwuYWRkQnV0dG9uKHRvb2xiYXJJdGVtLm5hbWUsICh0aGlzLmNoaWxkcy5sZW5ndGgpLCB0b29sYmFySXRlbS5jYXB0aW9uLCB0b29sYmFySXRlbS5pY29uLCB0b29sYmFySXRlbS5pY29uRGlzYWJsZWQpO1xyXG5cdFx0dGhpcy5jaGlsZHMucHVzaCh0b29sYmFySXRlbS5hY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRUb29sdGlwKHRvb2xiYXJJdGVtLm5hbWUsIHRvb2xiYXJJdGVtLnRvb2x0aXApO1xyXG5cdFx0XHJcblx0XHQvLyBjdXJyeWZpbmchXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblx0XHJcblx0YWRkVG9vbGJhckJ1dHRvblR3b1N0YXRlICh0b29sYmFySXRlbSkge1xyXG5cdFx0dGhpcy5pbXBsLmFkZEJ1dHRvblR3b1N0YXRlKHRvb2xiYXJJdGVtLm5hbWUsICh0aGlzLmNoaWxkcy5sZW5ndGgpLCB0b29sYmFySXRlbS5jYXB0aW9uLCB0b29sYmFySXRlbS5pY29uLCB0b29sYmFySXRlbS5pY29uRGlzYWJsZWQpO1xyXG5cdFx0dGhpcy5jaGlsZHMucHVzaCh0b29sYmFySXRlbS5hY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRUb29sdGlwKHRvb2xiYXJJdGVtLm5hbWUsIHRvb2xiYXJJdGVtLnRvb2x0aXApO1xyXG5cdFx0XHJcblx0XHQvLyBjdXJyeWZpbmchXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblx0XHJcblx0YWRkVG9vbGJhckJ1dHRvblNlbGVjdCAodG9vbGJhckl0ZW0pIHtcclxuXHRcdHRoaXMuaW1wbC5hZGRCdXR0b25TZWxlY3QodG9vbGJhckl0ZW0ubmFtZSwgKHRoaXMuY2hpbGRzLmxlbmd0aCksIHRvb2xiYXJJdGVtLmNhcHRpb24sIFtdLCB0b29sYmFySXRlbS5pY29uLCB0b29sYmFySXRlbS5pY29uRGlzYWJsZWQpO1xyXG5cdFx0dGhpcy5jaGlsZHMucHVzaCh0b29sYmFySXRlbS5hY3Rpb24pO1xyXG4gICAgICAgIHRoaXMuYWRkVG9vbHRpcCh0b29sYmFySXRlbS5uYW1lLCB0b29sYmFySXRlbS50b29sdGlwKTtcclxuXHRcdFxyXG5cdFx0Ly8gY3VycnlmaW5nIVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cdFxyXG5cdGFkZFRvb2xiYXJMaXN0T3B0aW9uIChwYXJlbnQsIHRvb2xiYXJJdGVtKSB7XHJcblx0XHR0aGlzLmltcGwuYWRkTGlzdE9wdGlvbihwYXJlbnQsIHRvb2xiYXJJdGVtLm5hbWUsICh0aGlzLmNoaWxkcy5sZW5ndGgpLCAnYnV0dG9uJywgdG9vbGJhckl0ZW0uY2FwdGlvbiwgdG9vbGJhckl0ZW0uaWNvbik7XHJcblx0XHR0aGlzLmNoaWxkcy5wdXNoKHRvb2xiYXJJdGVtLmFjdGlvbik7XHJcbiAgICAgICAgdGhpcy5hZGRUb29sdGlwKHRvb2xiYXJJdGVtLm5hbWUsIHRvb2xiYXJJdGVtLnRvb2x0aXApO1xyXG5cdFx0XHJcblx0XHQvLyBjdXJyeWZpbmchXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblx0XHJcblx0YWRkU2VwYXJhdG9yICh0b29sYmFySXRlbSkge1xyXG5cdFx0dGhpcy5pbXBsLmFkZFNlcGFyYXRvcih0b29sYmFySXRlbS5uYW1lLCAodGhpcy5jaGlsZHMubGVuZ3RoKSk7XHJcblx0XHRcclxuXHRcdC8vIGN1cnJ5ZmluZyFcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHRcclxuXHRhZGRUZXh0ICh0b29sYmFySXRlbSkge1xyXG5cdFx0dGhpcy5pbXBsLmFkZFRleHQodG9vbGJhckl0ZW0ubmFtZSwgKHRoaXMuY2hpbGRzLmxlbmd0aCksIHRvb2xiYXJJdGVtLmNhcHRpb24pO1xyXG5cdFx0XHJcblx0XHQvLyBjdXJyeWZpbmchXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblx0XHJcblx0YWRkSW5wdXQgKHRvb2xiYXJJdGVtLCB3aWR0aCkge1xyXG5cdFx0dGhpcy5pbXBsLmFkZElucHV0KHRvb2xiYXJJdGVtLm5hbWUsICh0aGlzLmNoaWxkcy5sZW5ndGgpLCB0b29sYmFySXRlbS5jYXB0aW9uLCB3aWR0aCk7XHJcblx0XHRcclxuXHRcdC8vIGN1cnJ5ZmluZyFcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHRcclxuXHRhZGRUb29sdGlwIChuYW1lLCB0ZXh0KSB7XHJcblx0XHRpZiAodHlwZW9mIHRleHQgIT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdHRoaXMuaW1wbC5zZXRJdGVtVG9vbFRpcChuYW1lLCB0ZXh0KTtcclxuXHRcdH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqIENyZWF0ZXMgdGhlIGRodG1sWFRvb2xiYXJPYmplY3QgaW5zaWRlIGl0cyBjb250YWluZXIuICovXHJcbmZ1bmN0aW9uIGluaXREaHRtbHhUb29sYmFyIChjb250YWluZXIpIHtcclxuXHR2YXIgaW1wbCA9IG51bGw7XHJcblx0aWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcclxuXHRcdGltcGwgPSBuZXcgZGh0bWxYVG9vbGJhck9iamVjdChjb250YWluZXIsIFNLSU4pO1xyXG5cdFx0XHJcblx0fSBlbHNlIGlmIChjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUX0NFTExcclxuICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5BQ0NPUkRJT05fQ0VMTFxyXG5cdFx0fHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVFxyXG5cdFx0fHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLldJTkRPV1xyXG4gICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLlRBQikge1xyXG5cdFx0XHJcblx0XHRpbXBsID0gY29udGFpbmVyLmltcGwuYXR0YWNoVG9vbGJhcigpO1xyXG5cdFx0aW1wbC5zZXRTa2luKFNLSU4pO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ2luaXREaHRtbHhUb29sYmFyOiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xyXG5cdH1cclxuXHRyZXR1cm4gaW1wbDtcclxufVxyXG4iLCJcclxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIFNLSU4sIERFQlVHLCBHUklEX0lDT05TX1BBVEggfSBmcm9tICdnbG9iYWwvY29uZmlnJztcclxuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcclxuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcclxuXHJcbmV4cG9ydCBjbGFzcyBCYXNlR3JpZCBleHRlbmRzIEJhc2VPYmplY3Qge1xyXG5cclxuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyID0gbnVsbCkge1xyXG5cdFx0aWYgKERFQlVHKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdCYXNlR3JpZCBjb25zdHJ1Y3RvcicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxyXG5cdFx0c3VwZXIoKTtcclxuXHRcdFxyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xyXG5cdFx0XHR0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcclxuXHJcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XHJcblxyXG5cdFx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXHJcblx0XHRcdHZhciBpbXBsID0gdGhpcy5pbml0RGh0bWx4R3JpZChjb250YWluZXIpO1xyXG5cdFx0XHRpbXBsLnNldFNraW4oU0tJTik7XHJcblx0XHRcdGltcGwuc2V0SWNvbnNQYXRoKEdSSURfSUNPTlNfUEFUSCk7XHJcblxyXG5cdFx0XHQvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXHJcblx0XHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuR1JJRCwgY29udGFpbmVyLCBpbXBsKTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIEVuYWJsZSBvblNlbGVjdCBldmVudCBcclxuXHRcdFx0aWYgKGFjdGlvbk1hbmFnZXIgIT0gbnVsbCkge1xyXG5cdFx0XHRcdHRoaXMuYXR0YWNoQWN0aW9uTWFuYWdlcihcIm9uU2VsZWN0XCIsIGFjdGlvbk1hbmFnZXIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdCYXNlR3JpZCBpbml0IG1ldGhvZCByZXF1aXJlcyAyIHBhcmFtZXRlcnMnKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGluaXREaHRtbHhHcmlkIChjb250YWluZXIpIHtcclxuXHJcblx0XHR2YXIgaW1wbCA9IG51bGw7XHJcblx0XHRpZiAoVXRpbC5pc05vZGUoY29udGFpbmVyKSkge1xyXG5cdFx0XHRcclxuXHRcdFx0aW1wbCA9IG5ldyBkaHRtbFhHcmlkT2JqZWN0KGNvbnRhaW5lcik7XHJcblx0XHRcclxuXHRcdH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVF9DRUxMXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5BQ0NPUkRJT05fQ0VMTFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuVEFCXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5XSU5ET1cpIHtcdFx0XHJcblx0XHRcdGltcGwgPSBjb250YWluZXIuaW1wbC5hdHRhY2hHcmlkKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2luaXREaHRtbHhUb29sYmFyOiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGltcGw7XHJcblx0fVxyXG59XHJcbiIsIlxyXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcsIEdSSURfSUNPTlNfUEFUSCB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xyXG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnZ2xvYmFsL1V0aWwnO1xyXG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFByb3BlcnR5R3JpZCBleHRlbmRzIEJhc2VPYmplY3Qge1xyXG5cdFxyXG5cdGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIgPSBudWxsKSB7XHJcblx0XHRpZiAoREVCVUcpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ0Jhc2VHcmlkIGNvbnN0cnVjdG9yJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXHJcblx0XHRzdXBlcigpO1xyXG5cdFx0XHJcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XHJcblx0XHRcdHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIgPSBudWxsKSB7XHJcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XHJcblxyXG5cdFx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXHJcblx0XHRcdHZhciBpbXBsID0gdGhpcy5pbml0RGh0bWx4UHJvcGVydHlHcmlkKGNvbnRhaW5lcik7XHJcblx0XHRcdGltcGwuc2V0U2tpbihTS0lOKTtcclxuXHRcdFx0aW1wbC5zZXRJY29uc1BhdGgoR1JJRF9JQ09OU19QQVRIKTtcclxuXHJcblx0XHRcdC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2RcclxuXHRcdFx0c3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5HUklELCBjb250YWluZXIsIGltcGwpO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gRW5hYmxlIG9uU2VsZWN0IGV2ZW50IFxyXG5cdFx0XHRpZiAoYWN0aW9uTWFuYWdlciAhPSBudWxsKSB7XHJcblx0XHRcdFx0dGhpcy5hdHRhY2hBY3Rpb25NYW5hZ2VyKFwib25TZWxlY3RcIiwgYWN0aW9uTWFuYWdlcik7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5R3JpZCBpbml0IG1ldGhvZCByZXF1aXJlcyAyIHBhcmFtZXRlcnMnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0aW5pdERodG1seFByb3BlcnR5R3JpZCAoY29udGFpbmVyKSB7XHJcblx0XHRcclxuXHRcdHZhciBpbXBsID0gbnVsbDtcclxuXHRcdGlmIChVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpbXBsID0gbmV3IGRodG1sWFByb3BlcnR5R3JpZChjb250YWluZXIpO1xyXG5cdFx0XHJcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTCB8fFxyXG5cdFx0XHRjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuV0lORE9XIHx8XHJcblx0XHRcdGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UQUIpIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0aW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaFByb3BlcnR5R3JpZCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdpbml0RGh0bWx4VG9vbGJhcjogY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBpbXBsO1xyXG5cdH1cclxufVxyXG4iLCJcclxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIERFQlVHLCBTS0lOIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XHJcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XHJcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XHJcblxyXG5leHBvcnQgY2xhc3MgRm9ybSBleHRlbmRzIEJhc2VPYmplY3Qge1xyXG5cdFx0XHJcblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcclxuXHRcdGlmIChERUJVRykge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnRm9ybSBjb25zdHJ1Y3RvcicpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XHJcblx0XHRcdHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIgPSBudWxsKSB7XHJcblxyXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgZGh0bWx4IG9iamVjdFxyXG5cdFx0dmFyIGltcGwgPSB0aGlzLmluaXREaHRtbHhGb3JtKGNvbnRhaW5lcik7XHJcblx0XHRpbXBsLnNldFNraW4oU0tJTik7XHJcblxyXG5cdFx0Ly8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxyXG5cdFx0c3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5GT1JNLCBjb250YWluZXIsIGltcGwpO1xyXG5cdH1cclxuXHRcclxuXHRpbml0RGh0bWx4Rm9ybSAoY29udGFpbmVyKSB7XHJcblx0XHR2YXIgaW1wbCA9IG51bGw7XHJcblx0XHRpZiAoVXRpbC5pc05vZGUoY29udGFpbmVyKSkge1xyXG5cdFx0XHRpbXBsID0gbmV3IGRodG1sWEZvcm0oY29udGFpbmVyLCBudWxsKTtcclxuXHRcdFx0XHJcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTFxyXG4gICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5BQ0NPUkRJT05fQ0VMTFxyXG4gICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5XSU5ET1dcclxuICAgICAgICAgICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuVEFCKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpbXBsID0gY29udGFpbmVyLmltcGwuYXR0YWNoRm9ybSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdpbml0RGh0bWx4Rm9ybTogY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIGltcGw7XHJcblx0fVxyXG59IiwiXHJcbmltcG9ydCB7IE9CSkVDVF9UWVBFLCBERUJVRywgU0tJTiB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xyXG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnZ2xvYmFsL1V0aWwnO1xyXG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZhdWx0IGV4dGVuZHMgQmFzZU9iamVjdCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIG9wdGlvbnMsIGFjdGlvbk1hbmFnZXIgPSBudWxsKSB7XHJcblx0aWYgKERFQlVHKSB7XHJcblx0XHRjb25zb2xlLmxvZygnVmF1bHQgY29uc3RydWN0b3InKTtcclxuXHR9XHJcblx0XHJcblx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXHJcblx0c3VwZXIoKTtcclxuXHRcclxuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSB7XHJcblx0XHR0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBvcHRpb25zLCBhY3Rpb25NYW5hZ2VyKTtcclxuXHR9XHJcbiAgfVxyXG4gIFxyXG4gIGluaXQgKG5hbWUsIGNvbnRhaW5lciwgb3B0aW9ucywgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlcyB0aGUgZGh0bWx4IG9iamVjdFxyXG4gICAgICAgIHZhciBpbXBsID0gdGhpcy5pbml0RGh0bWx4VmF1bHQoY29udGFpbmVyLCBvcHRpb25zKTtcclxuICAgICAgICBpbXBsLnNldFNraW4oU0tJTik7XHJcblxyXG4gICAgICAgIC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2RcclxuICAgICAgICBzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLlZBVUxULCBjb250YWluZXIsIGltcGwpO1xyXG4gIH1cclxuICAgIFxyXG4gIGluaXREaHRtbHhWYXVsdCAoY29udGFpbmVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIGltcGwgPSBudWxsO1xyXG4gICAgICAgIGlmIChVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBpbXBsID0gbmV3IGRodG1sWFZhdWx0T2JqZWN0KG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIGlmIChjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUX0NFTExcclxuICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkFDQ09SRElPTl9DRUxMXHJcbiAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5XSU5ET1dcclxuICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLlRBQikge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpbXBsID0gY29udGFpbmVyLmltcGwuYXR0YWNoVmF1bHQob3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW5pdERodG1seFZhdWx0OiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gaW1wbDtcclxuICB9XHJcbn1cclxuIiwiXHJcbmltcG9ydCB7IERFQlVHLCBPQkpFQ1RfVFlQRSB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xyXG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xyXG5pbXBvcnQgeyB3aW5kb3dNYW5hZ2VyIH0gZnJvbSAnd2luZG93L1dpbmRvd01hbmFnZXInO1xyXG5cclxuLyoqXHJcbiAgKiBcclxuICAqL1x0IFxyXG5leHBvcnQgY2xhc3MgV2luZG93IGV4dGVuZHMgQmFzZU9iamVjdCB7XHJcblxyXG5cdGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIHdpZHRoLCBoZWlnaHQpIHtcclxuXHRcdGlmIChERUJVRykge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnV2luZG93IGNvbnN0cnVjdG9yJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXHJcblx0XHRzdXBlcigpO1xyXG5cdFx0XHJcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gNCkge1xyXG5cdFx0XHR0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCB3aWR0aCwgaGVpZ2h0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lciwgd2lkdGgsIGhlaWdodCkge1xyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltcGwgPSB3aW5kb3dNYW5hZ2VyLmNyZWF0ZShuYW1lLCB3aWR0aCwgaGVpZ2h0KTtcclxuXHJcblx0XHRcdC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2RcclxuXHRcdFx0c3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5XSU5ET1csIGNvbnRhaW5lciwgaW1wbCk7XHJcblxyXG5cdFx0XHQvLyBDZW50ZXJlZCBieSBkZWZhdWx0XHJcblx0XHRcdGltcGwuY2VudGVyT25TY3JlZW4oKTtcclxuXHJcblx0XHRcdC8vIE1vZGFsIGJ5IGRlZmF1bHRcclxuXHRcdFx0aW1wbC5zZXRNb2RhbCh0cnVlKTtcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1dpbmRvdyBpbml0IG1ldGhvZCByZXF1aXJlcyAzIHBhcmFtZXRlcnMnKTtcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJcclxuXHJcbmltcG9ydCB7IFNLSU4sIERFQlVHLCBPQkpFQ1RfVFlQRSB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xyXG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xyXG5pbXBvcnQgeyBXaW5kb3cgfSBmcm9tICd3aW5kb3cvV2luZG93JztcclxuXHJcblxyXG5jbGFzcyBXaW5kb3dNYW5hZ2VyIGV4dGVuZHMgQmFzZU9iamVjdCB7XHJcblxyXG5cdGNvbnN0cnVjdG9yIChuYW1lKSB7XHJcblx0XHRpZiAoREVCVUcpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ1dpbmRvd01hbmFnZXIgY29uc3RydWN0b3InKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XHJcblx0XHRcdHRoaXMuaW5pdChuYW1lKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lcikge1xyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcclxuXHJcblx0XHRcdC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3QgKHNlZSBmdW5jdGlvbiBiZWxvdylcclxuXHRcdFx0dmFyIGltcGwgPSBuZXcgZGh0bWxYV2luZG93cyhTS0lOKTtcclxuXHJcblx0XHRcdC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2RcclxuXHRcdFx0c3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5XSU5ET1dfTUFOQUdFUiwgbnVsbCwgaW1wbCk7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdXaW5kb3dNYW5hZ2VyIGluaXQgbWV0aG9kIHJlcXVpcmVzIDEgcGFyYW1ldGVyJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRjcmVhdGUgKG5hbWUsIHdpZHRoLCBoZWlnaHQpIHtcclxuXHRcdC8vIFRoZSB3aW5kb3cgZ2V0cyBjZW50ZXJlZCBpbnNpZGUgdGhlIFdpbmRvdyBvYmplY3RcclxuXHRcdHZhciBjb29yZFggPSAwIDsgXHJcblx0XHR2YXIgY29vcmRZID0gMCA7IFxyXG5cdFx0cmV0dXJuIHRoaXMuaW1wbC5jcmVhdGVXaW5kb3cobmFtZSwgY29vcmRYLCBjb29yZFksIHdpZHRoLCBoZWlnaHQpO1xyXG5cdH1cclxufVxyXG5cclxuLy8gRm9yIG5vdywgb25seSBvbmUgV2luZG93TWFuYWdlciB3aWxsIGRvXHJcbmxldCB3aW5kb3dNYW5hZ2VyID0gbmV3IFdpbmRvd01hbmFnZXIoJ3dpbmRvd01hbmFnZXInKTtcclxuXHJcbmV4cG9ydCB7IHdpbmRvd01hbmFnZXIgfSA7XHJcbiIsIlxyXG5cclxuZXhwb3J0IGNsYXNzIE1lc3NhZ2Uge1xyXG5cclxuXHRzdGF0aWMgYWxlcnQgKHRpdGxlLCB0ZXh0LCBtb2RhbCA9IGZhbHNlKSB7XHJcblx0XHRsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHRcdFx0aWYgKG1vZGFsKSB7XHJcblx0XHRcdFx0ZGh0bWx4Lm1lc3NhZ2Uoe1xyXG5cdFx0XHRcdFx0dGl0bGU6IHRpdGxlLFxyXG5cdFx0XHRcdFx0dHlwZTogJ2FsZXJ0JyxcclxuXHRcdFx0XHRcdHRleHQ6IHRleHQsXHJcblx0XHRcdFx0XHRjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRkaHRtbHgubWVzc2FnZSh7XHJcblx0XHRcdFx0XHR0aXRsZTogdGl0bGUsXHJcblx0XHRcdFx0XHR0ZXh0OiB0ZXh0XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyB3YXJuaW5nICh0aXRsZSwgdGV4dCwgbW9kYWwgPSBmYWxzZSkge1xyXG5cdFx0bGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblx0XHRcdGlmIChtb2RhbCkge1xyXG5cdFx0XHRcdGRodG1seC5tZXNzYWdlKHtcclxuXHRcdFx0XHRcdHRpdGxlOiB0aXRsZSxcclxuXHRcdFx0XHRcdHR5cGU6ICdhbGVydC13YXJuaW5nJyxcclxuXHRcdFx0XHRcdHRleHQ6IHRleHQsXHJcblx0XHRcdFx0XHRjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRkaHRtbHgubWVzc2FnZSh7XHJcblx0XHRcdFx0XHR0aXRsZTogdGl0bGUsXHJcblx0XHRcdFx0XHR0ZXh0OiB0ZXh0XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBlcnJvciAodGl0bGUsIHRleHQsIG1vZGFsID0gZmFsc2UpIHtcclxuXHRcdGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cdFx0XHRpZiAobW9kYWwpIHtcclxuXHRcdFx0XHRkaHRtbHgubWVzc2FnZSh7XHJcblx0XHRcdFx0XHR0aXRsZTogdGl0bGUsXHJcblx0XHRcdFx0XHR0eXBlOiAnYWxlcnQtZXJyb3InLFxyXG5cdFx0XHRcdFx0dGV4dDogdGV4dCxcclxuXHRcdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGRodG1seC5tZXNzYWdlKHtcclxuXHRcdFx0XHRcdHRpdGxlOiB0aXRsZSxcclxuXHRcdFx0XHRcdHR5cGU6ICdlcnJvcicsXHJcblx0XHRcdFx0XHR0ZXh0OiB0ZXh0XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBjb25maXJtICh0aXRsZSwgdGV4dCwgb2ssIGNhbmNlbCkge1xyXG5cdFx0bGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblx0XHRcdGRodG1seC5jb25maXJtKHtcclxuXHRcdFx0XHR0aXRsZTogdGl0bGUsXHJcblx0XHRcdFx0dGV4dDogdGV4dCxcclxuXHRcdFx0XHRvazogb2ssXHJcblx0XHRcdFx0Y2FuY2VsOiBjYW5jZWwsXHJcblx0XHRcdFx0Y2FsbGJhY2s6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdFx0XHRpZiAocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0cmVqZWN0KCk7ICAgIFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBwcm9taXNlO1xyXG5cdH1cclxufVxyXG4iLCJcclxuLy8gSGVyZSB3ZSBpbXBvcnQgYWxsIFwicHVibGljXCIgY2xhc3NlcyB0byBleHBvc2UgdGhlbVxyXG5pbXBvcnQgeyBnZXRDb25maWcsIHNldENvbmZpZyB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xyXG5cclxuaW1wb3J0IHsgQWN0aW9uTWFuYWdlciB9IGZyb20gJ2FjdGlvbnMvQWN0aW9uTWFuYWdlcic7XHJcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJ2FjdGlvbnMvQWN0aW9uJztcclxuXHJcbmltcG9ydCB7IEJhc2VMYXlvdXQgfSBmcm9tICdsYXlvdXQvQmFzZUxheW91dCc7IFxyXG5pbXBvcnQgeyBTaW1wbGVMYXlvdXQgfSBmcm9tICdsYXlvdXQvU2ltcGxlTGF5b3V0JztcclxuaW1wb3J0IHsgVHdvQ29sdW1uc0xheW91dCB9IGZyb20gJ2xheW91dC9Ud29Db2x1bW5zTGF5b3V0JztcclxuaW1wb3J0IHsgUGFnZUxheW91dCB9IGZyb20gJ2xheW91dC9QYWdlTGF5b3V0JztcclxuaW1wb3J0IHsgV2luZG93TGF5b3V0IH0gZnJvbSAnbGF5b3V0L1dpbmRvd0xheW91dCc7XHJcblxyXG5pbXBvcnQgeyBNZW51IH0gZnJvbSAnbWVudS9NZW51JztcclxuaW1wb3J0IHsgQ29udGV4dE1lbnUgfSBmcm9tICdtZW51L0NvbnRleHRNZW51JztcclxuaW1wb3J0IHsgTWVudUl0ZW0gfSBmcm9tICdtZW51L01lbnVJdGVtJztcclxuXHJcbmltcG9ydCB7IEJhc2VUcmVlIH0gZnJvbSAndHJlZS9CYXNlVHJlZSc7XHJcbmltcG9ydCB7IFRyZWVJdGVtIH0gZnJvbSAndHJlZS9UcmVlSXRlbSc7XHJcblxyXG5pbXBvcnQgeyBUYWJiYXIgfSBmcm9tICd0YWJiYXIvVGFiYmFyJztcclxuaW1wb3J0IHsgVGFiIH0gZnJvbSAndGFiYmFyL1RhYic7XHJcblxyXG5pbXBvcnQgeyBBY2NvcmRpb24gfSBmcm9tICdhY2NvcmRpb24vQWNjb3JkaW9uJztcclxuaW1wb3J0IHsgQWNjb3JkaW9uQ2VsbCB9IGZyb20gJ2FjY29yZGlvbi9BY2NvcmRpb25DZWxsJztcclxuXHJcbmltcG9ydCB7IFRvb2xiYXIgfSBmcm9tICd0b29sYmFyL1Rvb2xiYXInO1xyXG5cclxuaW1wb3J0IHsgQmFzZUdyaWQgfSBmcm9tICdncmlkL0Jhc2VHcmlkJztcclxuaW1wb3J0IHsgUHJvcGVydHlHcmlkIH0gZnJvbSAnZ3JpZC9Qcm9wZXJ0eUdyaWQnO1xyXG5cclxuaW1wb3J0IHsgRm9ybSB9IGZyb20gJ2Zvcm0vRm9ybSc7XHJcbmltcG9ydCB7IFZhdWx0IH0gZnJvbSAndmF1bHQvVmF1bHQnO1xyXG5cclxuaW1wb3J0IHsgd2luZG93TWFuYWdlciB9IGZyb20gJ3dpbmRvdy9XaW5kb3dNYW5hZ2VyJztcclxuaW1wb3J0IHsgV2luZG93IH0gZnJvbSAnd2luZG93L1dpbmRvdyc7XHJcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tICd3aW5kb3cvTWVzc2FnZSc7XHJcblxyXG5leHBvcnQge1xyXG5cdC8vIENvbmZpZyBmdW5jdGlvbnNcclxuXHRnZXRDb25maWcsIFxyXG5cdHNldENvbmZpZyxcclxuICAgICAgICBcclxuICAgIHdpbmRvd01hbmFnZXIsXHJcbiAgICBXaW5kb3csXHJcblx0TWVzc2FnZSxcclxuXHRcclxuXHQvLyBBY3Rpb24gbWFuYWdlbWVudFxyXG5cdEFjdGlvbk1hbmFnZXIsIFxyXG5cdEFjdGlvbiwgXHJcblxyXG5cdC8vIExheW91dHNcclxuXHRCYXNlTGF5b3V0LFxyXG5cdFNpbXBsZUxheW91dCwgXHJcblx0VHdvQ29sdW1uc0xheW91dCwgXHJcblx0UGFnZUxheW91dCxcclxuICAgICAgICBXaW5kb3dMYXlvdXQsXHJcbiAgICAgICAgXHJcbiAgICAgICAgQWNjb3JkaW9uLFxyXG4gICAgICAgIEFjY29yZGlvbkNlbGwsXHJcblxyXG5cdC8vIFRyZWUgbGF5b3V0c1xyXG5cdEJhc2VUcmVlLFxyXG5cdFRyZWVJdGVtLFxyXG5cclxuICAgIC8vIE1lbnVzXHJcblx0TWVudSxcclxuICAgIENvbnRleHRNZW51LFxyXG5cdE1lbnVJdGVtLFxyXG5cdFxyXG5cdC8vIFRhYmJhclxyXG5cdFRhYmJhcixcclxuXHRUYWIsXHJcblx0XHJcblx0Ly8gR3JpZFxyXG5cdEJhc2VHcmlkLFxyXG5cdFByb3BlcnR5R3JpZCxcclxuXHJcbiAgICAvLyBPdGhlclxyXG4gICAgVG9vbGJhcixcclxuXHRGb3JtLFxyXG4gICAgICAgIFZhdWx0XHJcbn07XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUM7QUFDckIsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLEdBQUcsY0FBYyxDQUFDO0FBQ25ELE1BQU0saUJBQWlCLEdBQUcsUUFBUSxHQUFHLGNBQWMsQ0FBQzs7QUFFcEQsSUFBSSxNQUFNLEdBQUc7O0NBRVosS0FBSyxFQUFFLElBQUk7O0NBRVgsSUFBSSxFQUFFLFNBQVM7O0NBRWYsU0FBUyxFQUFFLFFBQVE7O0NBRW5CLGtCQUFrQixFQUFFLGdCQUFnQjtDQUNwQyxtQkFBbUIsRUFBRSxpQkFBaUI7O0NBRXRDLGtCQUFrQixFQUFFLGdCQUFnQixHQUFHLGlCQUFpQjtDQUN4RCxlQUFlLEVBQUUsZ0JBQWdCLEdBQUcsY0FBYztDQUNsRCxlQUFlLEVBQUUsZ0JBQWdCLEdBQUcsY0FBYztDQUNsRCxlQUFlLEVBQUUsZ0JBQWdCLEdBQUcsY0FBYztDQUNsRCxDQUFDOztBQUVGLEFBQU8sSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNoQyxBQUFPLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDOUIsQUFBTyxJQUFJLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztBQUMxRCxBQUFPLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUM7QUFDcEQsQUFBTyxJQUFJLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO0FBQ3BELEFBQU8sSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQztBQUNwRCxBQUF3RDs7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