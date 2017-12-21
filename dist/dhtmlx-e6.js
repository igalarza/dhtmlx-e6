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
		return this.impl.attachEvent(eventName, function (id) {
			// Checking if the actionManager has the action with the right id
			if (typeof actionManager.actions[id] === 'function') {
				// The context in the actionManager is sent to the action
				return actionManager.actions[id](arguments, actionManager.context);
			// TODO Solve it recursively, right now only goes up one level
			} else if (actionManager.parent !== null && typeof actionManager.parent.actions[id] === 'function') {
				return actionManager.parent.actions[id](arguments, actionManager.parent.context);
			}
		});
	}
	
	/** Adds an event to the object, with a function parameter as an action. */
	attachAction (eventName, action, context) {
		return this.impl.attachEvent(eventName, function () {
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
                        || container.type === OBJECT_TYPE.WINDOW
						|| container.type === OBJECT_TYPE.ACCORDION_CELL) {
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
	
	load (url, type = 'json') {
		return new Promise((resolve, reject) => {
			try {
				this.impl.load(url, function(response) {
					resolve(response);
				}, type);
			} catch (e) {
				reject(e);
			}
		});		
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
		this.attachActionManager("onStateChange", actionManager);
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
	
	load (url, type = 'json') {
		return new Promise((resolve, reject) => {
			try {
				this.impl.load(url, function(response) {
					resolve(response);
				}, type);
			} catch (e) {
				reject(e);
			}
		});		
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvZ2xvYmFsL2NvbmZpZy5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvYWN0aW9ucy9BY3Rpb24uanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL21lbnUvTWVudUl0ZW0uanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL3RyZWUvVHJlZUl0ZW0uanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL2FjdGlvbnMvQWN0aW9uTWFuYWdlci5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvZ2xvYmFsL1V0aWwuanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL2dsb2JhbC9CYXNlT2JqZWN0LmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9sYXlvdXQvTGF5b3V0Q2VsbC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvbGF5b3V0L0Jhc2VMYXlvdXQuanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL2xheW91dC9TaW1wbGVMYXlvdXQuanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL2xheW91dC9Ud29Db2x1bW5zTGF5b3V0LmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9sYXlvdXQvUGFnZUxheW91dC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvbGF5b3V0L1dpbmRvd0xheW91dC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvbWVudS9NZW51LmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9tZW51L0NvbnRleHRNZW51LmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy90cmVlL0Jhc2VUcmVlLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy90YWJiYXIvVGFiYmFyLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy90YWJiYXIvVGFiLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9hY2NvcmRpb24vQWNjb3JkaW9uLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9hY2NvcmRpb24vQWNjb3JkaW9uQ2VsbC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvdG9vbGJhci9Ub29sYmFyLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9ncmlkL0Jhc2VHcmlkLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9ncmlkL1Byb3BlcnR5R3JpZC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvZm9ybS9Gb3JtLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy92YXVsdC9WYXVsdC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvd2luZG93L1dpbmRvdy5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvd2luZG93L1dpbmRvd01hbmFnZXIuanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL3dpbmRvdy9NZXNzYWdlLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuY29uc3QgYmFzZVBhdGggPSAnLyc7XG5jb25zdCBkZWZhdWx0SWNvbnNQYXRoID0gYmFzZVBhdGggKyAndmVuZG9yL2ltZ3MvJztcbmNvbnN0IGRlZmF1bHRJbWFnZXNQYXRoID0gYmFzZVBhdGggKyAndmVuZG9yL2ltZ3MvJztcblxubGV0IGNvbmZpZyA9IHtcblx0LyoqIEVuYWJsZXMgY29uc29sZS5sb2cgY29tbWVudHMgKi9cblx0REVCVUc6IHRydWUsXG5cdC8qKiBkaHRtbHggc2tpbiBhcHBsaWVkIHRvIGFsbCBvYmplY3RzICovXG5cdFNLSU46ICdkaHhfd2ViJyxcblx0XG5cdEJBU0VfUEFUSDogYmFzZVBhdGgsXG5cdC8qKiBVc2VkIGJ5IEdyaWQsIEFjY29yZGlvbiwgTWVudSwgR3JpZCwgVHJlZSBhbmQgVHJlZUdyaWQgICovXG5cdERFRkFVTFRfSUNPTlNfUEFUSDogZGVmYXVsdEljb25zUGF0aCxcblx0REVGQVVMVF9JTUFHRVNfUEFUSDogZGVmYXVsdEltYWdlc1BhdGgsXG5cdFxuXHRUT09MQkFSX0lDT05TX1BBVEg6IGRlZmF1bHRJY29uc1BhdGggKyAnZGh4dG9vbGJhcl93ZWIvJyxcblx0R1JJRF9JQ09OU19QQVRIOiBkZWZhdWx0SWNvbnNQYXRoICsgJ2RoeGdyaWRfd2ViLycsXG5cdFRSRUVfSUNPTlNfUEFUSDogZGVmYXVsdEljb25zUGF0aCArICdkaHh0cmVlX3dlYi8nLFxuXHRNRU5VX0lDT05TX1BBVEg6IGRlZmF1bHRJY29uc1BhdGggKyAnZGh4bWVudV93ZWIvJ1xufTtcblxuZXhwb3J0IGxldCBERUJVRyA9IGNvbmZpZy5ERUJVRztcbmV4cG9ydCBsZXQgU0tJTiA9IGNvbmZpZy5TS0lOO1xuZXhwb3J0IGxldCBUT09MQkFSX0lDT05TX1BBVEggPSBjb25maWcuVE9PTEJBUl9JQ09OU19QQVRIO1xuZXhwb3J0IGxldCBHUklEX0lDT05TX1BBVEggPSBjb25maWcuR1JJRF9JQ09OU19QQVRIO1xuZXhwb3J0IGxldCBUUkVFX0lDT05TX1BBVEggPSBjb25maWcuVFJFRV9JQ09OU19QQVRIO1xuZXhwb3J0IGxldCBNRU5VX0lDT05TX1BBVEggPSBjb25maWcuTUVOVV9JQ09OU19QQVRIO1xuZXhwb3J0IGxldCBUQUJCQVJfSUNPTlNfUEFUSCA9IGNvbmZpZy5UQUJCQVJfSUNPTlNfUEFUSDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpIHtcblx0cmV0dXJuIGNvbmZpZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENvbmZpZyhjZmcpIHtcblx0Y29uZmlnID0gY2ZnO1xufVxuXG4vKiogQWxsIHRoZSBkaHRtbHggb2JqZWN0IHR5cGVzICovXG5leHBvcnQgY29uc3QgT0JKRUNUX1RZUEUgPSB7XG4gICAgTEFZT1VUIDogJ2xheW91dCcsXG4gICAgTEFZT1VUX0NFTEwgOiAnbGF5b3V0Q2VsbCcsXG4gICAgVE9PTEJBUiA6ICd0b29sYmFyJyxcbiAgICBGT1JNIDogJ2Zvcm0nLCBcbiAgICBNRU5VIDogJ21lbnUnLCBcbiAgICBHUklEIDogJ2dyaWQnLCBcbiAgICBUUkVFIDogJ3RyZWUnLCBcbiAgICBXSU5ET1cgOiAnd2luZG93JyxcbiAgICBXSU5ET1dfTUFOQUdFUiA6ICd3aW5kb3dNYW5hZ2VyJyxcbiAgICBUQUJCQVIgOiAndGFiYmFyJyxcbiAgICBUQUIgOiAndGFiJyxcbiAgICBBQ0NPUkRJT04gOiAnYWNjb3JkaW9uJyxcbiAgICBBQ0NPUkRJT05fQ0VMTCA6ICdhY2NvcmRpb25DZWxsJyBcbn07IiwiXG5leHBvcnQgY2xhc3MgQWN0aW9uIHtcblx0XHRcblx0Y29uc3RydWN0b3IgKG5hbWUsIGltcGwpIHtcblxuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xuXHRcdHRoaXMuX2ltcGwgPSBpbXBsO1x0XHRcblx0fVxuXHRcblx0Z2V0IG5hbWUgKCkgeyByZXR1cm4gdGhpcy5fbmFtZTsgfVxuXHRnZXQgaW1wbCAoKSB7IHJldHVybiB0aGlzLl9pbXBsOyB9XHRcbn0iLCJcbi8qKlxuICogSXRlbXMgaW5zaWRlIHRoZSBtZW51XG4gKi9cbmV4cG9ydCBjbGFzcyBNZW51SXRlbSB7XG5cdFxuXHRjb25zdHJ1Y3RvciAocGFyZW50TmFtZSwgbmFtZSwgYWN0aW9uLCBjYXB0aW9uLCBpY29uID0gbnVsbCwgaWNvbkRpc2FibGVkID0gbnVsbCkge1xuXHRcdFxuXHRcdHRoaXMuX3BhcmVudE5hbWUgPSBwYXJlbnROYW1lO1xuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xuXHRcdHRoaXMuX2FjdGlvbiA9IGFjdGlvbjtcblx0XHR0aGlzLl9jYXB0aW9uID0gY2FwdGlvbjtcblx0XHR0aGlzLl9pY29uID0gaWNvbjtcblx0XHR0aGlzLl9pY29uRGlzYWJsZWQgPSBpY29uRGlzYWJsZWQ7XG5cdH1cblx0XG5cdGdldCBwYXJlbnROYW1lICgpIHsgcmV0dXJuIHRoaXMuX3BhcmVudE5hbWU7IH1cblx0Z2V0IG5hbWUgKCkgeyByZXR1cm4gdGhpcy5fbmFtZTsgfVxuXHRnZXQgYWN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2FjdGlvbjsgfVxuXHRnZXQgY2FwdGlvbiAoKSB7IHJldHVybiB0aGlzLl9jYXB0aW9uOyB9XG5cdGdldCBpY29uICgpIHsgcmV0dXJuIHRoaXMuX2ljb247IH1cblx0Z2V0IGljb25EaXNhYmxlZCAoKSB7IHJldHVybiB0aGlzLl9pY29uRGlzYWJsZWQ7IH1cbn0iLCJcblxuZXhwb3J0IGNsYXNzIFRyZWVJdGVtIHtcblxuXHRjb25zdHJ1Y3RvcihwYXJlbnRJZCwgaWQsIHRleHQsIGFjdGlvbiA9IG51bGwpIHtcblxuXHRcdHRoaXMuX3BhcmVudElkID0gcGFyZW50SWQ7XG5cdFx0dGhpcy5faWQgPSBpZDtcblx0XHR0aGlzLl90ZXh0ID0gdGV4dDtcblx0XHR0aGlzLl9hY3Rpb24gPSBhY3Rpb247XG5cdH1cblxuXHRnZXQgcGFyZW50SWQgKCkge1xuXHRcdHJldHVybiB0aGlzLl9wYXJlbnRJZDtcblx0fVxuXG5cdGdldCBpZCAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lkO1xuXHR9XG5cblx0Z2V0IHRleHQgKCkge1xuXHRcdHJldHVybiB0aGlzLl90ZXh0O1xuXHR9XG5cblx0Z2V0IGFjdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2FjdGlvbjtcblx0fVxufSIsIlxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnYWN0aW9ucy9BY3Rpb24nO1xuaW1wb3J0IHsgTWVudUl0ZW0gfSBmcm9tICdtZW51L01lbnVJdGVtJztcbmltcG9ydCB7IFRyZWVJdGVtIH0gZnJvbSAndHJlZS9UcmVlSXRlbSc7XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25NYW5hZ2VyIHtcblx0XG5cdGNvbnN0cnVjdG9yIChjb250ZXh0LCBwYXJlbnQgPSBudWxsKSB7XG5cdFx0dGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG5cdFx0dGhpcy5fYWN0aW9ucyA9IFtdO1xuXHRcdHRoaXMuX3BhcmVudCA9IHBhcmVudDtcblx0XHR0aGlzLl9jaGlsZHMgPSBbXTtcblx0XHRcblx0XHRpZiAocGFyZW50ICE9PSBudWxsKSB7XG5cdFx0XHRwYXJlbnQuY2hpbGRzLnB1c2godGhpcyk7XG5cdFx0fVxuXHR9XG5cdFxuXHRydW4gKGFjdGlvbiwgcGFyYW1zLCBjb250ZXh0KSB7XG5cdFx0cmV0dXJuIHRoaXMuX2FjdGlvbnNbYWN0aW9uXShwYXJhbXMsIGNvbnRleHQpO1xuXHR9XG5cdFxuXHRjcmVhdGVNZW51SXRlbSAocGFyZW50TmFtZSwgYWN0aW9uTmFtZSwgY2FwdGlvbiwgaWNvbiwgaWNvbkRpc2FibGVkKSB7XHRcdFxuXHRcdHZhciBhY3Rpb24gPSB0aGlzLmFjdGlvbnNbYWN0aW9uTmFtZV07XG5cdFx0cmV0dXJuIG5ldyBNZW51SXRlbShwYXJlbnROYW1lLCBhY3Rpb25OYW1lLCBhY3Rpb24sIGNhcHRpb24sIGljb24sIGljb25EaXNhYmxlZCk7XG5cdH1cblxuXHRjcmVhdGVUcmVlSXRlbSAocGFyZW50TmFtZSwgYWN0aW9uTmFtZSwgY2FwdGlvbikge1x0XHRcblx0XHR2YXIgYWN0aW9uID0gdGhpcy5hY3Rpb25zW2FjdGlvbk5hbWVdO1xuXHRcdHJldHVybiBuZXcgVHJlZUl0ZW0ocGFyZW50TmFtZSwgYWN0aW9uTmFtZSwgY2FwdGlvbiwgYWN0aW9uKTtcblx0fVxuXG5cdGFkZEFjdGlvbk9iaiAoYWN0aW9uKSB7XG5cdFx0dGhpcy5fYWN0aW9uc1thY3Rpb24ubmFtZV0gPSBhY3Rpb24uaW1wbDtcblx0fVxuXG5cdGFkZEFjdGlvbiAobmFtZSwgaW1wbCkge1xuXHRcdHRoaXMuX2FjdGlvbnNbbmFtZV0gPSBpbXBsO1xuXHR9XG5cdFxuXHRnZXQgY2hpbGRzICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fY2hpbGRzO1xuXHR9XG5cdFxuXHRnZXQgY29udGV4dCAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRleHQ7XG5cdH1cblx0XG5cdGdldCBwYXJlbnQgKCkge1xuXHRcdHJldHVybiB0aGlzLl9wYXJlbnQ7XG5cdH1cblx0XG5cdGdldCBhY3Rpb25zICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fYWN0aW9ucztcblx0fVxufVxuIiwiXG5cblxuZXhwb3J0IGNsYXNzIFV0aWwge1xuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBwYXJhbWV0ZXIgaXMgYSBET00gbm9kZSBvciBET00gaWQgKHN0cmluZykuXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IG8gLSBEb20gTm9kZSBvciBhbnkgb3RoZXIgdmFyaWFibGUuXG5cdCAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHBhcmFtZXRlciBpcyBhIERPTSBOb2RlLlxuXHQgKi8gICBcblx0c3RhdGljIGlzTm9kZSAobykge1xuXHRcdHJldHVybiAoXG5cdFx0XHR0eXBlb2YgTm9kZSA9PT0gXCJzdHJpbmdcIiB8fFxuXHRcdFx0dHlwZW9mIE5vZGUgPT09IFwib2JqZWN0XCIgPyBvIGluc3RhbmNlb2YgTm9kZSA6IFxuXHRcdFx0dHlwZW9mIG8gPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG8ubm9kZVR5cGUgPT09IFwibnVtYmVyXCIgJiYgdHlwZW9mIG8ubm9kZU5hbWU9PT1cInN0cmluZ1wiXG5cdFx0KTtcblx0fVxufSIsIlxuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XG5cbi8qKlxuICAqIFBhcmVudCBjbGFzcyBvZiBhbGwgdGhlIG9iamVjdHMgaW4gdGhlIGxpYnJhcnksIGl0IGhvbGRzIHNvbWUgY29tbW9uIHZhcmlhYmxlcy5cbiAgKi9cdCBcbmV4cG9ydCBjbGFzcyBCYXNlT2JqZWN0IHtcblx0XG5cdC8qKlxuXHQgKiBDYWxsZWQgYnkgY2hpbGQgb2JqZWN0cy5cblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gT2JqZWN0IG5hbWUsIHVzZWZ1bCBmb3Igc2VhcmNoaW5nIGNoaWxkIG9iamVjdHMuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVHlwZSBvZiBjb21wb25lbnQ6IGxheW91dCwgd2luZG93LCBncmlkLCBldGMuXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IGNvbnRhaW5lciAtIE9iamVjdCBvciBkb20gaWQgb2YgdGhlIHBhcmVudCBlbGVtZW50LlxuXHQgKiBAcGFyYW0ge29iamVjdH0gaW1wbCAtIGRodG1seCBvYmplY3QsIG11c3QgYmUgY3JlYXRlZCBieSBjaGlsZCBjbGFzcy5cblx0ICovXG4gICAgY29uc3RydWN0b3IgKG5hbWUsIHR5cGUsIGNvbnRhaW5lciwgaW1wbCkge1xuXHRcdC8vIEl0IGNhbiBiZSBjYWxsZWQgd2l0aG91dCBhcmd1bWVudHMsIGZvciB0ZXN0aW5nIGludGVncmF0aW9uIHJlYXNvbnMuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcblx0XHRcdHRoaXMuaW5pdChuYW1lLCB0eXBlLCBjb250YWluZXIsIGltcGwpO1xuXHRcdH1cdFx0XG4gICAgfVxuXHRcblx0aW5pdCAobmFtZSwgdHlwZSwgY29udGFpbmVyLCBpbXBsKSB7XHRcdFx0XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcblx0XHRcdC8vIENsZWFuIHVwIGJlZm9yZSBhc3NpZ25hdGlvbnNcblx0XHRcdHRoaXMuZGVzdHJveSgpO1xuXHRcdFx0Ly8gSW5pdCBwcm9wZXJ0aWVzXG5cdFx0XHR0aGlzLl9uYW1lID0gbmFtZTtcblx0XHRcdHRoaXMuX3R5cGUgPSB0eXBlO1xuXHRcdFx0dGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuXHRcdFx0dGhpcy5faW1wbCA9IGltcGw7XG5cdFx0XHR0aGlzLl9jaGlsZHMgPSBbXTtcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRhaW5lciAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICFVdGlsLmlzTm9kZShjb250YWluZXIpICYmXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcyBpbnN0YW5jZW9mIEFycmF5KSB7XG5cdFx0XHRcdC8vIEFkZHMgdGhpcyB0byBwYXJlbnQgYXMgYSBjaGlsZFxuXHRcdFx0XHRjb250YWluZXIuY2hpbGRzLnB1c2godGhpcyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignQmFzZU9iamVjdCBpbml0IG1ldGhvZCByZXF1aXJlcyA0IHBhcmFtZXRlcnMnKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKiBEZXN0cm95cyB0aGUgb2JqZWN0IGFuZCBhbGwgdGhpcyBjaGlsZHMuICovXG5cdGRlc3Ryb3kgKCkge1xuXHRcdC8vIEZpcnN0LCB0aGUgY2hpbGRzXG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9jaGlsZHMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHR3aGlsZSAodGhpcy5fY2hpbGRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dmFyIGNoaWxkID0gdGhpcy5fY2hpbGRzLnBvcCgpO1xuXHRcdFx0XHRpZiAodHlwZW9mIGNoaWxkID09PSAnb2JqZWN0JyBcblx0XHRcdFx0XHQmJiB0eXBlb2YgY2hpbGQuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y2hpbGQuZGVzdHJveSgpO1xuXHRcdFx0XHR9XHRcdFx0XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZpbmcgZnJvbSBjb250YWluZXJcblx0XHRpZiAodHlwZW9mIHRoaXMuX2NvbnRhaW5lciAhPT0gJ3VuZGVmaW5lZCdcblx0XHRcdCYmIHR5cGVvZiB0aGlzLl9jb250YWluZXIuY2hpbGRzICE9PSAndW5kZWZpbmVkJykge1xuXG5cdFx0XHR0aGlzLl9jb250YWluZXIuY2hpbGRzID0gdGhpcy5fY29udGFpbmVyLmNoaWxkcy5maWx0ZXIoKGVsZW0pID0+IGVsZW0gIT09IHRoaXMpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBGaW5hbGx5LCB0aGUgb2JqZWN0XG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9pbXBsICE9PSAndW5kZWZpbmVkJyAmJlxuXHRcdFx0dHlwZW9mIHRoaXMuX2ltcGwudW5sb2FkID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAoREVCVUcpIHtcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy50eXBlICsnOiBDYWxsIHRvIHVubG9hZCgpIGluIGRlc3Ryb3kgbWV0aG9kLicpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5faW1wbC51bmxvYWQoKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKiBGaW5kcyBhIGNoaWxkIG9iamVjdCBieSBuYW1lICovXG5cdGZpbmQgKG5hbWUpIHtcblx0XHRpZiAodGhpcy5uYW1lID09PSBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLl9jaGlsZHMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdGZvciAobGV0IGk9MDsgaTx0aGlzLl9jaGlsZHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgY2hpbGQgPSB0aGlzLl9jaGlsZHNbaV07XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBjaGlsZCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGNoaWxkLmZpbmQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdHZhciByZXN1bHQgPSBjaGlsZC5maW5kKG5hbWUpO1xuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdFxuXHQvKiogRmluZHMgYSBwYXJlbnQgb2JqZWN0IGJ5IG5hbWUgKi9cblx0ZmluZFBhcmVudCAobmFtZSkge1xuXHRcdGlmICh0aGlzLm5hbWUgPT09IG5hbWUpIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIHRoaXMuX2NvbnRhaW5lciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuX2NvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnQgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwYXJlbnQuZmluZFBhcmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBwYXJlbnQuZmluZFBhcmVudChuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdFxuXHQvKiogQWRkcyBhbiBldmVudCB0byB0aGUgb2JqZWN0LCB3aXRoIGFuIEFjdGlvbk1hbmFnZXIgb2JqZWN0IGFzIGEgY29sbGVjdGlvbiBvZiBhY3Rpb25zLiAqL1xuXHRhdHRhY2hBY3Rpb25NYW5hZ2VyIChldmVudE5hbWUsIGFjdGlvbk1hbmFnZXIpIHtcblx0XHRyZXR1cm4gdGhpcy5pbXBsLmF0dGFjaEV2ZW50KGV2ZW50TmFtZSwgZnVuY3Rpb24gKGlkKSB7XG5cdFx0XHQvLyBDaGVja2luZyBpZiB0aGUgYWN0aW9uTWFuYWdlciBoYXMgdGhlIGFjdGlvbiB3aXRoIHRoZSByaWdodCBpZFxuXHRcdFx0aWYgKHR5cGVvZiBhY3Rpb25NYW5hZ2VyLmFjdGlvbnNbaWRdID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdC8vIFRoZSBjb250ZXh0IGluIHRoZSBhY3Rpb25NYW5hZ2VyIGlzIHNlbnQgdG8gdGhlIGFjdGlvblxuXHRcdFx0XHRyZXR1cm4gYWN0aW9uTWFuYWdlci5hY3Rpb25zW2lkXShhcmd1bWVudHMsIGFjdGlvbk1hbmFnZXIuY29udGV4dCk7XG5cdFx0XHQvLyBUT0RPIFNvbHZlIGl0IHJlY3Vyc2l2ZWx5LCByaWdodCBub3cgb25seSBnb2VzIHVwIG9uZSBsZXZlbFxuXHRcdFx0fSBlbHNlIGlmIChhY3Rpb25NYW5hZ2VyLnBhcmVudCAhPT0gbnVsbCAmJiB0eXBlb2YgYWN0aW9uTWFuYWdlci5wYXJlbnQuYWN0aW9uc1tpZF0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIGFjdGlvbk1hbmFnZXIucGFyZW50LmFjdGlvbnNbaWRdKGFyZ3VtZW50cywgYWN0aW9uTWFuYWdlci5wYXJlbnQuY29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0XG5cdC8qKiBBZGRzIGFuIGV2ZW50IHRvIHRoZSBvYmplY3QsIHdpdGggYSBmdW5jdGlvbiBwYXJhbWV0ZXIgYXMgYW4gYWN0aW9uLiAqL1xuXHRhdHRhY2hBY3Rpb24gKGV2ZW50TmFtZSwgYWN0aW9uLCBjb250ZXh0KSB7XG5cdFx0cmV0dXJuIHRoaXMuaW1wbC5hdHRhY2hFdmVudChldmVudE5hbWUsIGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vIE1ha2luZyBzdXJlIHRoZSBhY3Rpb24gcGFyYW0gaXMgcmVhbGx5IGFuIG9iamVjdFxuXHRcdFx0aWYgKHR5cGVvZiBhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0Ly8gVGhlIGNvbnRleHQgaW4gdGhlIGFjdGlvbk1hbmFnZXIgaXMgc2VudCB0byB0aGUgYWN0aW9uXG5cdFx0XHRcdHJldHVybiBhY3Rpb24oYXJndW1lbnRzLCBjb250ZXh0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRcblx0Z2V0IG5hbWUgKCkge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5fbmFtZSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybiB0aGlzLl9uYW1lO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3RoaXMuX25hbWUgaXMgdW5kZWZpbmVkOiBpbml0IG1ldGhvZCBoYXMgbm90IGJlZW4gY2FsbGVkJyk7XG5cdFx0fVxuXHR9XG5cdFxuICAgICAgICAvKipcbiAgICAgICAgKiBUeXBlIG9mIGNvbXBvbmVudDogbGF5b3V0LCB3aW5kb3csIGdyaWQsIGV0Yy4gXG4gICAgICAgICovXG5cdGdldCB0eXBlICgpIHtcblx0XHRpZiAodHlwZW9mIHRoaXMuX3R5cGUgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fdHlwZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCd0aGlzLl90eXBlIGlzIHVuZGVmaW5lZDogaW5pdCBtZXRob2QgaGFzIG5vdCBiZWVuIGNhbGxlZCcpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG4gICAgICAgICogVXN1YWxseSBpcyBvdGhlciBkaHRtbHgtZTYgb2JqZWN0LCB0aGUgcm9vdCBjb250YWluZXIgc2hvdWxkIGJlIGluc2lkZSBkb2N1bWVudC5ib2R5XG4gICAgICAgICovXG5cdGdldCBjb250YWluZXIgKCkgeyBcblx0XHRpZiAodHlwZW9mIHRoaXMuX2NvbnRhaW5lciAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybiB0aGlzLl9jb250YWluZXI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcigndGhpcy5fY29udGFpbmVyIGlzIHVuZGVmaW5lZDogaW5pdCBtZXRob2QgaGFzIG5vdCBiZWVuIGNhbGxlZCcpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG4gICAgICAgICogZGh0bWx4IG9iamVjdCwgbXVzdCBiZSBjcmVhdGVkIGJ5IGNoaWxkIGNsYXNzIGJlZm9yZSBjYWxsaW5nIHN1cGVyIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgICAgKi9cblx0Z2V0IGltcGwgKCkge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5faW1wbCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybiB0aGlzLl9pbXBsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3RoaXMuX2ltcGwgaXMgdW5kZWZpbmVkOiBpbml0IG1ldGhvZCBoYXMgbm90IGJlZW4gY2FsbGVkJyk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogQ2hpbGQgb2JqZWN0cywgY291bGQgYmUgYW55IG90aGVyIGRodG1seE9iamVjdFxuXHQgKi9cblx0Z2V0IGNoaWxkcyAoKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9jaGlsZHMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY2hpbGRzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3RoaXMuX2NoaWxkcyBpcyB1bmRlZmluZWQ6IGluaXQgbWV0aG9kIGhhcyBub3QgYmVlbiBjYWxsZWQnKTtcblx0XHR9XG5cdH1cblx0XG5cdHNldCBjaGlsZHMgKGNoaWxkcykge1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRzID0gY2hpbGRzO1xuICAgICAgICB9XG59XG4iLCJcbmltcG9ydCB7IERFQlVHLCBPQkpFQ1RfVFlQRSB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcblxuLyoqXG4gICogQmFzZSBjbGFzcyBmb3IgYWxsIGxheW91dCBvYmplY3RzLCBzZWU6XG4gICogaHR0cHM6Ly9kb2NzLmRodG1seC5jb20vbGF5b3V0X19pbmRleC5odG1sXG4gICovXG5leHBvcnQgY2xhc3MgTGF5b3V0Q2VsbCBleHRlbmRzIEJhc2VPYmplY3Qge1xuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIExheW91dENlbGwgb2JqZWN0LCBjYWxsZWQgZnJvbSBCYXNlTGF5b3V0IGNsYXNzXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge21peGVkfSBjb250YWluZXIgLSBPYmplY3Qgb3IgZG9tIGlkIG9mIHRoZSBwYXJlbnQgZWxlbWVudC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IGltcGwgLSBkaHRtbHggb2JqZWN0LCBjcmVhdGVkIGluIHRoZSBCYXNlTGF5b3V0IGNsYXNzLlxuXHQgKi9cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgaW1wbCkge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ0xheW91dENlbGwgY29uc3RydWN0b3InKTtcblx0XHR9XG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgaW1wbCk7XG5cdFx0fVxuXHR9XG5cdFxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGltcGwpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0c3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTCwgY29udGFpbmVyLCBpbXBsKTtcblx0XHRcdFxuXHRcdFx0Ly8gSGVhZGVyIGlzIGhpZGRlbiBieSBkZWZhdWx0XG5cdFx0XHR0aGlzLmhlYWRlciA9IG51bGw7XG5cdFx0XHRcblx0XHRcdHRoaXMuaW1wbC5maXhTaXplKGZhbHNlLCBmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignTGF5b3V0Q2VsbCBpbml0IG1ldGhvZCByZXF1aXJlcyAzIHBhcmFtZXRlcnMnKTtcblx0XHR9XG5cdH1cblx0XG5cdGdldCBoZWlnaHQgKCkge1xuXHRcdHJldHVybiB0aGlzLmltcGwuZ2V0SGVpZ2h0KCk7XG5cdH1cblx0XG5cdHNldCBoZWlnaHQgKGhlaWdodCkge1xuXHRcdHRoaXMuaW1wbC5zZXRIZWlnaHQoaGVpZ2h0KTtcblx0fVxuXHRcblx0Z2V0IHdpZHRoICgpIHtcblx0XHRyZXR1cm4gdGhpcy5pbXBsLmdldFdpZHRoKCk7XG5cdH1cblx0XG5cdHNldCB3aWR0aCAod2lkdGgpIHtcblx0XHR0aGlzLmltcGwuc2V0V2lkdGgod2lkdGgpO1xuXHR9XG5cdFxuXHRzZXQgaHRtbCAoaHRtbCkge1xuXHRcdHRoaXMuaW1wbC5hdHRhY2hIVE1MU3RyaW5nKGh0bWwpO1xuXHR9XG5cdFxuXHRnZXQgaGVhZGVyICgpIHtcblx0XHRyZXR1cm4gdGhpcy5pbXBsLmdldFRleHQoKTtcblx0fVxuXHRcblx0c2V0IGhlYWRlciAodGV4dCkge1xuXHRcdGlmICh0ZXh0ID09IG51bGwpIHtcblx0XHRcdHRoaXMuaW1wbC5zZXRUZXh0KCcnKTtcblx0XHRcdHRoaXMuaW1wbC5oaWRlSGVhZGVyKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaW1wbC5zZXRUZXh0KHRleHQpO1xuXHRcdFx0dGhpcy5pbXBsLnNob3dIZWFkZXIoKTtcblx0XHR9XHRcdFxuXHR9XG59IiwiXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuaW1wb3J0IHsgTGF5b3V0Q2VsbCB9IGZyb20gJ0xheW91dENlbGwnO1xuXG4vKipcbiAgKiBCYXNlIGNsYXNzIGZvciBhbGwgbGF5b3V0IG9iamVjdHMsIHNlZTpcbiAgKiBodHRwczovL2RvY3MuZGh0bWx4LmNvbS9sYXlvdXRfX2luZGV4Lmh0bWxcbiAgKi9cbmV4cG9ydCBjbGFzcyBCYXNlTGF5b3V0IGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cdFxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgQmFzZUxheW91dCBvYmplY3QuIENhbiBiZSBjYWxsZWQgd2l0aG91dCBhcmd1bWVudHMsIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHttaXhlZH0gY29udGFpbmVyIC0gT2JqZWN0IG9yIGRvbSBpZCBvZiB0aGUgcGFyZW50IGVsZW1lbnQuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuIC0gZGh0bWx4IGxheW91dCBwYXR0ZXJuLCBzZWU6IGh0dHA6Ly9kb2NzLmRodG1seC5jb20vbGF5b3V0X19wYXR0ZXJucy5odG1sXG5cdCAqL1xuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBwYXR0ZXJuKSB7XG5cdFx0aWYgKERFQlVHKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnQmFzZUxheW91dCBjb25zdHJ1Y3RvcicpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2Rcblx0XHRzdXBlcigpO1xuXHRcdFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG5cdFx0XHR0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBwYXR0ZXJuKTtcblx0XHR9XG5cdH1cblx0XG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lciwgcGF0dGVybikge1xuXHRcdFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG5cdFx0XG5cdFx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXG5cdFx0XHR2YXIgaW1wbCA9IHRoaXMuaW5pdERodG1seExheW91dChjb250YWluZXIsIHBhdHRlcm4pO1xuXHRcdFx0XG5cdFx0XHQvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXG5cdFx0XHRzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLkxBWU9VVCwgY29udGFpbmVyLCBpbXBsKTtcblx0XHRcdFxuXHRcdFx0Ly8gSW5pdHMgdGhlIExheW91dENlbGwgb2JqZWN0c1xuXHRcdFx0dGhpcy5pbml0Q2VsbHMoKTtcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRhaW5lciBpbnN0YW5jZW9mIExheW91dENlbGwpIHtcblx0XHRcdFx0dmFyIGNvbnRhaW5lckxheW91dCA9IGNvbnRhaW5lci5jb250YWluZXI7XG5cdFx0XHRcdGNvbnRhaW5lckxheW91dC5hdHRhY2hBY3Rpb24oXCJvblJlc2l6ZUZpbmlzaFwiLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGltcGwuc2V0U2l6ZXMoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdCYXNlTGF5b3V0IGluaXQgbWV0aG9kIHJlcXVpcmVzIDMgcGFyYW1ldGVycycpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqICBcblx0ICogSW50ZXJuYWwgbWV0aG9kIGNhbGxlZCBieSB0aGUgY29uc3RydWN0b3IsIGl0IGNyZWF0ZXMgdGhlIExheW91dENlbGwgXG5cdCAqIG9iamVjdHMgYW5kIGFkZHMgdGhlbSB0byB0aGUgdGhpcy5jaGlsZHMgYXJyYXlcblx0ICovXG5cdGluaXRDZWxscyAoKSB7XG5cdFx0Ly8gTmVlZGVkIGluc2lkZSB0aGUgZm9yRWFjaEl0ZW1cblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIGkgPSAxO1xuXHRcdHRoaXMuX2ltcGwuZm9yRWFjaEl0ZW0oZnVuY3Rpb24gKGNlbGxJbXBsKSB7XG5cdFx0XHQvLyBoZXJlIHRoaXMgcG9pbnQgdG8gdGhlIGRodG1sWExheW91dE9iamVjdCBvYmplY3QuXG5cdFx0XHR2YXIgY2VsbE5hbWUgPSBzZWxmLm5hbWUgKyAnX2NlbGwnICsgKGkrKyk7XG5cdFx0XHR2YXIgY2VsbCA9IG5ldyBMYXlvdXRDZWxsKGNlbGxOYW1lLCBzZWxmLCBjZWxsSW1wbCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKiogQ3JlYXRlcyB0aGUgZGh0bWxYTGF5b3V0T2JqZWN0IGluc2lkZSBpdHMgY29udGFpbmVyLiAqL1xuXHRpbml0RGh0bWx4TGF5b3V0IChjb250YWluZXIsIHBhdHRlcm4pIHtcblx0XHR2YXIgaW1wbCA9IG51bGw7XG5cdFx0aWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcblx0XHRcdFxuXHRcdFx0aW1wbCA9IG5ldyBkaHRtbFhMYXlvdXRPYmplY3Qoe1xuXHRcdFx0XHQvLyBpZCBvciBvYmplY3QgZm9yIHBhcmVudCBjb250YWluZXJcblx0XHRcdFx0cGFyZW50OiBjb250YWluZXIsICAgIFx0XG5cdFx0XHRcdC8vIGxheW91dCdzIHBhdHRlcm5cdFx0XHRcblx0XHRcdFx0cGF0dGVybjogcGF0dGVybixcblx0XHRcdFx0Ly8gbGF5b3V0J3Mgc2tpblxuXHRcdFx0XHRza2luOiBTS0lOXG5cdFx0XHR9KTtcblx0XHRcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UQUJcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5XSU5ET1dcblx0XHRcdFx0XHRcdHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5BQ0NPUkRJT05fQ0VMTCkge1xuXHRcdFx0aW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaExheW91dChwYXR0ZXJuKTtcblx0XHR9XG5cdFx0cmV0dXJuIGltcGw7XG5cdH1cbn1cblxuIiwiXG5pbXBvcnQgeyBCYXNlTGF5b3V0IH0gZnJvbSAnbGF5b3V0L0Jhc2VMYXlvdXQnO1xuXG4vKiogTGF5b3V0IHdpdGggb25seSBvbmUgY2VsbCAqL1xuZXhwb3J0IGNsYXNzIFNpbXBsZUxheW91dCBleHRlbmRzIEJhc2VMYXlvdXQge1xuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIFNpbXBsZUxheW91dCBvYmplY3Rcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IGNvbnRhaW5lciAtIE9iamVjdCBvciBkb20gaWQgb2YgdGhlIHBhcmVudCBlbGVtZW50LlxuXHQgKi9cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lcikge1xuXHRcdHN1cGVyKG5hbWUsIGNvbnRhaW5lciwgJzFDJyk7XG5cdH1cblx0XG5cdC8qKiBUaGUgb25seSBMYXlvdXRDZWxsIG9iamVjdCBpbiB0aGUgbGF5b3V0ICovXG5cdGdldCBjZWxsICgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGlsZHNbMF07XG5cdH1cbn0iLCJcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBCYXNlTGF5b3V0IH0gZnJvbSAnbGF5b3V0L0Jhc2VMYXlvdXQnO1xuXG4vKipcbiAgKiBMYXlvdXQgd2l0aCB0d28gY29sdW1uczogbGVmdCBhbmQgcmlnaHRcbiAgKi9cbmV4cG9ydCBjbGFzcyBUd29Db2x1bW5zTGF5b3V0IGV4dGVuZHMgQmFzZUxheW91dCB7XG5cdFxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgVHdvQ29sdW1uc0xheW91dCBvYmplY3Rcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IGNvbnRhaW5lciAtIE9iamVjdCBvciBkb20gaWQgb2YgdGhlIHBhcmVudCBlbGVtZW50LlxuXHQgKi9cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lcikge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ1R3b0NvbHVtbnNMYXlvdXQgY29uc3RydWN0b3InKTtcblx0XHR9XG5cdFx0c3VwZXIobmFtZSwgY29udGFpbmVyLCAnMlUnKTtcblx0fVxuXHRcblx0LyoqIExlZnQgTGF5b3V0Q2VsbCAqL1xuXHRnZXQgbGVmdCAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRzWzBdO1xuXHR9XG5cdFxuXHQvKiogUmlnaHQgTGF5b3V0Q2VsbCAqL1xuXHRnZXQgcmlnaHQgKCkge1xuXHRcdHJldHVybiB0aGlzLmNoaWxkc1sxXTtcblx0fVxufSIsIlxuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IEJhc2VMYXlvdXQgfSBmcm9tICdsYXlvdXQvQmFzZUxheW91dCc7XG5cbi8qKiBMYXlvdXQgd2l0aCBwYWdlLWxpa2Ugc3RydWN0dXJlOiBoZWFkZXIsIGJvZHkgYW5kIGZvb3RlciAqL1xuZXhwb3J0IGNsYXNzIFBhZ2VMYXlvdXQgZXh0ZW5kcyBCYXNlTGF5b3V0IHtcblx0XG5cdC8qKlxuXHQgKiBDcmVhdGVzIHRoZSBTaW1wbGVMYXlvdXQgb2JqZWN0XG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge21peGVkfSBjb250YWluZXIgLSBPYmplY3Qgb3IgZG9tIGlkIG9mIHRoZSBwYXJlbnQgZWxlbWVudC5cblx0ICogQHBhcmFtIHtpbnR9IGhlYWRlckhlaWdodCAtIEZpeGVkIGhlYWRlciBoZWlnaHQgaW4gcGl4ZWxzLlxuXHQgKiBAcGFyYW0ge2ludH0gZm9vdGVySGVpZ2h0IC0gRml4ZWQgZm9vdGVyIGhlaWdodCBpbiBwaXhlbHMuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBoZWFkZXJIZWlnaHQsIGZvb3RlckhlaWdodCkge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ1R3b0NvbHVtbnNMYXlvdXQgY29uc3RydWN0b3InKTtcblx0XHR9XG5cdFx0XG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gNCkge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgaGVhZGVySGVpZ2h0LCBmb290ZXJIZWlnaHQpO1xuXHRcdH1cdFxuXHR9XG5cdFxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGhlYWRlckhlaWdodCwgZm9vdGVySGVpZ2h0KSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcblx0XHRcdHN1cGVyLmluaXQobmFtZSwgY29udGFpbmVyLCAnM0UnKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5oZWFkZXIuaGVpZ2h0ID0gaGVhZGVySGVpZ2h0O1xuXHRcdFx0dGhpcy5oZWFkZXIuaW1wbC5maXhTaXplKGZhbHNlLCB0cnVlKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5mb290ZXIuaGVpZ2h0ID0gZm9vdGVySGVpZ2h0O1xuXHRcdFx0dGhpcy5mb290ZXIuaW1wbC5maXhTaXplKGZhbHNlLCB0cnVlKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5pbXBsLnNldEF1dG9TaXplKFwiYTtiO2NcIiwgXCJiXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1BhZ2VMYXlvdXQgaW5pdCBtZXRob2QgcmVxdWlyZXMgNCBwYXJhbWV0ZXJzJyk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiogVGhlIG9ubHkgTGF5b3V0Q2VsbCBvYmplY3QgaW4gdGhlIGxheW91dCAqL1xuXHRnZXQgaGVhZGVyICgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGlsZHNbMF07XG5cdH1cblx0XG5cdGdldCBib2R5ICgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGlsZHNbMV07XHRcblx0fVxuXHRcblx0Z2V0IGZvb3RlciAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRzWzJdO1x0XG5cdH1cbn0iLCJcbmltcG9ydCB7IEJhc2VMYXlvdXQgfSBmcm9tICdsYXlvdXQvQmFzZUxheW91dCc7XG5cblxuZXhwb3J0IGNsYXNzIFdpbmRvd0xheW91dCBleHRlbmRzIEJhc2VMYXlvdXQge1xuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIFdpbmRvd0xheW91dCBvYmplY3Rcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IGNvbnRhaW5lciAtIE9iamVjdCBvciBkb20gaWQgb2YgdGhlIHBhcmVudCBlbGVtZW50LlxuXHQgKi9cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lcikge1xuXHRcdHN1cGVyKG5hbWUsIGNvbnRhaW5lciwgJzJFJyk7XG5cdH1cblxuXHRnZXQgYm9keSAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRzWzBdO1xuXHR9XG5cdFxuXHRnZXQgZm9vdGVyICgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGlsZHNbMV07XG5cdH1cbn0iLCJcbmltcG9ydCB7IE9CSkVDVF9UWVBFLCBERUJVRywgU0tJTiwgTUVOVV9JQ09OU19QQVRIIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnZ2xvYmFsL1V0aWwnO1xuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJ2FjdGlvbnMvQWN0aW9uJztcbmltcG9ydCB7IE1lbnVJdGVtIH0gZnJvbSAnbWVudS9NZW51SXRlbSc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgTWVudSBvYmplY3RzLCBzZWU6XG4gKiBodHRwOi8vZG9jcy5kaHRtbHguY29tL21lbnVfX2luZGV4Lmh0bWxcbiAqL1xuZXhwb3J0IGNsYXNzIE1lbnUgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblx0XG5cdC8qKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHttaXhlZH0gY29udGFpbmVyIC0gT2JqZWN0IG9yIGRvbSBpZCBvZiB0aGUgcGFyZW50IGVsZW1lbnQuXG5cdCAqIEBwYXJhbSB7YWN0aW9uTWFuYWdlcn0gQWN0aW9uTWFuYWdlciAtIENvbnRhaW5zIHRoZSBhY3Rpb25zIHRoZSBtZW51IHdpbGwgZXhlY3V0ZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpIHtcblx0XHRpZiAoREVCVUcpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdNZW51IGNvbnN0cnVjdG9yJyk7XG5cdFx0fVxuXG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcik7XG5cdFx0fVx0XG5cdH1cblxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpIHtcblxuXHRcdC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3Rcblx0XHR2YXIgaW1wbCA9IHRoaXMuaW5pdERodG1seE1lbnUoY29udGFpbmVyKTtcblx0XHRpbXBsLnNldEljb25zUGF0aChNRU5VX0lDT05TX1BBVEgpO1xuXG5cdFx0Ly8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxuXHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuTUVOVSwgY29udGFpbmVyLCBpbXBsKTtcblx0XHRcblx0XHQvLyBFbmFibGUgb25DbGljayBldmVudCBcblx0XHR0aGlzLmF0dGFjaEFjdGlvbk1hbmFnZXIoXCJvbkNsaWNrXCIsIGFjdGlvbk1hbmFnZXIpO1xuXHR9XG5cdFxuXHQvKipcblx0ICogQWRkcyBhIHRleHQgY29udGFpbmVyICh3aXRoIG5vIGFjdGlvbikgdG8gdGhlIG1lbnUuXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IGNvbnRhaW5lciAtIE9iamVjdCBvciBkb20gaWQgb2YgdGhlIHBhcmVudCBlbGVtZW50LlxuXHQgKiBAcGFyYW0ge25hbWV9IHN0cmluZyAtIFRoZSBuYW1lIHRoYXQgaWRlbnRpZmllcyB0aGUgTWVudUl0ZW0uXG5cdCAqIEBwYXJhbSB7Y2FwdGlvbn0gc3RyaW5nIC0gVGhlIHZpc2libGUgdGV4dCBvZiB0aGUgY29udGFpbmVyLlxuXHQgKiBAcGFyYW0ge3BhcmVudE5hbWV9IHN0cmluZyAtIFRoZSBuYW1lIG9mIHRoZSBwYXJlbnQgTWVudUl0ZW0gKGRlZmF1bHQgbnVsbCkuXG5cdCAqIHJldHVybnMge01lbnV9IFRoZSBtZW51IG9iamVjdCBpdHNlbGYsIHRvIGNoYWluIGl0ZW0gY3JlYXRpb24uXG5cdCAqL1xuXHRhZGRUZXh0Q29udGFpbmVyIChuYW1lLCBjYXB0aW9uLCBwYXJlbnROYW1lID0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IG1lbnVJdGVtID0gbmV3IE1lbnVJdGVtKHBhcmVudE5hbWUsIG5hbWUsIG51bGwsIGNhcHRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTWVudUl0ZW0obWVudUl0ZW0pO1xuXHR9XG5cdFxuXHQvKipcblx0ICogQWRkcyBhIE1lbnVJdGVtICh3aXRoIGFjdGlvbikgdG8gdGhlIG1lbnUgY29udGFpbmVyIFxuXHQgKiBAcGFyYW0ge01lbnVJdGVtfSBtZW51SXRlbSAtIFRoZSBNZW51SXRlbSBvYmplY3QsIHVzdWFsbHkgY3JlYXRlZCBpbiB0aGUgQWN0aW9uTWFuYWdlclxuXHQgKiByZXR1cm5zIHtNZW51fSBUaGUgbWVudSBvYmplY3QgaXRzZWxmLCB0byBjaGFpbiBpdGVtIGNyZWF0aW9uXG5cdCAqL1xuXHRhZGRNZW51SXRlbSAobWVudUl0ZW0pIHtcblx0XHRpZiAodHlwZW9mIG1lbnVJdGVtLnBhcmVudE5hbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbnVJdGVtLnBhcmVudE5hbWUgPSBudWxsO1xuXHRcdH0gXG4gICAgICAgICAgICAgICAgdGhpcy5pbXBsLmFkZE5ld0NoaWxkKG1lbnVJdGVtLnBhcmVudE5hbWUsICh0aGlzLl9jaGlsZHMubGVuZ3RoKSwgbWVudUl0ZW0ubmFtZSwgbWVudUl0ZW0uY2FwdGlvbiwgZmFsc2UsIG1lbnVJdGVtLmljb24sIG1lbnVJdGVtLmljb25EaXNhYmxlZCk7XHRcdFxuXHRcdHRoaXMuX2NoaWxkcy5wdXNoKG1lbnVJdGVtKTtcblx0XHQvLyBjdXJyeWZpbmchXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKiogQ3JlYXRlcyB0aGUgZGh0bWxYTWVudU9iamVjdCBpbnNpZGUgaXRzIGNvbnRhaW5lci4gKi9cblx0aW5pdERodG1seE1lbnUoY29udGFpbmVyKSB7XG5cdFx0dmFyIGltcGwgPSBudWxsO1xuICAgICAgICAvLyBjb250YWluZXIgY2FuIGJlIG51bGxcblx0XHRpZiAoY29udGFpbmVyID09IG51bGwgfHwgVXRpbC5pc05vZGUoY29udGFpbmVyKSkge1xuXHRcdFx0aW1wbCA9IG5ldyBkaHRtbFhNZW51T2JqZWN0KGNvbnRhaW5lciwgU0tJTik7XG5cdFx0XHRcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTCAgXG5cdFx0XHR8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUXG5cdFx0XHR8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuV0lORE9XKSB7XG5cdFx0XHRcblx0XHRcdGltcGwgPSBjb250YWluZXIuaW1wbC5hdHRhY2hNZW51KCk7XG5cdFx0XHRpbXBsLnNldFNraW4oU0tJTik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignaW5pdERodG1seE1lbnU6IGNvbnRhaW5lciBpcyBub3QgdmFsaWQuJyk7XG5cdFx0fVxuXHRcdHJldHVybiBpbXBsO1xuXHR9XG5cdFxuXHRzZXQgY2hpbGRzIChtZW51SXRlbXMpIHtcblx0XHQvLyBDbGVhbiBhcnJheSBmaXJzdFxuXHRcdHRoaXMuX2NoaWxkcyA9IFtdO1xuXHRcdFxuXHRcdC8vIFBvcHVsYXRlIGFycmF5XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtZW51SXRlbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMuYWRkTWVudUl0ZW0obWVudUl0ZW1zW2ldKTtcblx0XHR9XG5cdH1cbn0iLCJcbmltcG9ydCB7IE9CSkVDVF9UWVBFLCBERUJVRywgU0tJTiB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgTWVudSB9IGZyb20gJ21lbnUvTWVudSc7XG5cbmV4cG9ydCBjbGFzcyBDb250ZXh0TWVudSBleHRlbmRzIE1lbnUge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcikge1xuICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb250ZXh0TWVudSBjb25zdHJ1Y3RvcicpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaW5pdCAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKSB7XG4gICAgICAgIFxuICAgICAgICAvLyBNZW51IGluaXQgbWV0aG9kLCBjb250YWluZXIgbXVzdCBiZSBudWxsXG4gICAgICAgIHN1cGVyLmluaXQobmFtZSwgbnVsbCwgYWN0aW9uTWFuYWdlcik7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgIGNvbnRhaW5lci5jaGlsZHMucHVzaCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW1wbC5yZW5kZXJBc0NvbnRleHRNZW51KCk7XG4gICAgICAgIFxuICAgICAgICBpZiAodHlwZW9mIGNvbnRhaW5lciA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgIHRoaXMuaW1wbC5pc0NvbnRleHRab25lKGNvbnRhaW5lci5pbXBsKSkge1xuICAgICAgICAgICAgdGhpcy5pbXBsLmFkZENvbnRleHRab25lKGNvbnRhaW5lci5pbXBsKTsgICAgXG4gICAgICAgIFxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5HUklEICBcbiAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UUkVFKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnRhaW5lci5pbXBsLmVuYWJsZUNvbnRleHRNZW51KHRoaXMuaW1wbCk7XG4gICAgICAgIH1cbiAgICB9XG59IiwiXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcsIFRSRUVfSUNPTlNfUEFUSCB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XG5cbi8qKlxuICAqIEJhc2UgY2xhc3MgZm9yIGFsbCBUcmVlVmlldyBvYmplY3RzLCBzZWU6XG4gICogaHR0cDovL2RvY3MuZGh0bWx4LmNvbS90cmVldmlld19faW5kZXguaHRtbFxuICAqL1xuZXhwb3J0IGNsYXNzIEJhc2VUcmVlIGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcblx0XHRpZiAoREVCVUcpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdCYXNlVHJlZSBjb25zdHJ1Y3RvcicpO1xuXHRcdH1cblxuXHRcdC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxuXHRcdHN1cGVyKCk7XG5cdFx0XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcik7XG5cdFx0fVxuXHR9XG5cblx0aW5pdCAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyID0gbnVsbCkge1xuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xuXG5cdFx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXG5cdFx0XHR2YXIgaW1wbCA9IHRoaXMuaW5pdERodG1seFRyZWUoY29udGFpbmVyKTtcblx0XHRcdGltcGwuc2V0U2tpbihTS0lOKTtcblx0XHRcdGltcGwuc2V0SWNvbnNQYXRoKFRSRUVfSUNPTlNfUEFUSCk7XG5cblx0XHRcdC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2Rcblx0XHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuVFJFRSwgY29udGFpbmVyLCBpbXBsKTtcblx0XHRcdFxuXHRcdFx0Ly8gRW5hYmxlIG9uU2VsZWN0IGV2ZW50IFxuXHRcdFx0aWYgKGFjdGlvbk1hbmFnZXIgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLmF0dGFjaEFjdGlvbk1hbmFnZXIoXCJvblNlbGVjdFwiLCBhY3Rpb25NYW5hZ2VyKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Jhc2VUcmVlIGluaXQgbWV0aG9kIHJlcXVpcmVzIDIgcGFyYW1ldGVycycpO1xuXHRcdH1cblx0fVxuXG5cdGFkZEl0ZW0gKHRyZWVJdGVtKSB7XG5cblx0XHR0aGlzLmltcGwuYWRkSXRlbSh0cmVlSXRlbS5pZCwgdHJlZUl0ZW0udGV4dCwgdHJlZUl0ZW0ucGFyZW50SWQpO1xuXHRcdHRoaXMuX2NoaWxkc1t0cmVlSXRlbS5pZF0gPSB0cmVlSXRlbS5hY3Rpb247XG5cdH1cblx0XG5cdGxvYWQgKHVybCwgdHlwZSA9ICdqc29uJykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLmltcGwubG9hZCh1cmwsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XG5cdFx0XHRcdH0sIHR5cGUpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRyZWplY3QoZSk7XG5cdFx0XHR9XG5cdFx0fSk7XHRcdFxuXHR9XG5cblx0aW5pdERodG1seFRyZWUgKGNvbnRhaW5lcikge1xuXG5cdFx0dmFyIGltcGwgPSBudWxsO1xuXHRcdGlmIChVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XG5cdFx0XHQvLyBjYWxsIHRvIGRodG1seCBvYmplY3QgY29uc3RydWN0b3IgXG5cdFx0XHRpbXBsID0gbmV3IGRodG1sWFRyZWVPYmplY3QoY29udGFpbmVyLCBcIjEwMCVcIiwgXCIxMDAlXCIsIDApO1xuXHRcdFxuXHRcdH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVF9DRUxMKSB7XG5cdFx0XHRpbXBsID0gY29udGFpbmVyLmltcGwuYXR0YWNoVHJlZSgpO1xuXHRcdFx0XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignaW5pdERodG1seFRyZWU6IGNvbnRhaW5lciBpcyBub3QgdmFsaWQuJyk7XG5cdFx0fVxuXHRcdHJldHVybiBpbXBsO1xuXHR9XG59XG4iLCJcblxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIFNLSU4sIERFQlVHIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnZ2xvYmFsL1V0aWwnO1xuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcblxuZXhwb3J0IGNsYXNzIFRhYmJhciBleHRlbmRzIEJhc2VPYmplY3Qge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIpIHtcbiAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVGFiYmFyIGNvbnN0cnVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxuICAgICAgICBzdXBlcigpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGluaXQgKG5hbWUsIGNvbnRhaW5lcikge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXG4gICAgICAgICAgICB2YXIgaW1wbCA9IHRoaXMuaW5pdERodG1seFRhYmJhcihjb250YWluZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXG4gICAgICAgICAgICBzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLlRBQkJBUiwgY29udGFpbmVyLCBpbXBsKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYWJiYXIgaW5pdCBtZXRob2QgcmVxdWlyZXMgMiBwYXJhbWV0ZXJzJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaW5pdERodG1seFRhYmJhciAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBpbXBsID0gbnVsbDtcbiAgICAgICAgaWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW1wbCA9IG5ldyBkaHRtbFhUYWJCYXIoe1xuICAgICAgICAgICAgICAgIHBhcmVudDogY29udGFpbmVyLFxuICAgICAgICAgICAgICAgIHNraW46IFNLSU5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVF9DRUxMXG4gICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuQUNDT1JESU9OX0NFTExcbiAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5XSU5ET1dcbiAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UQUIpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaFRhYmJhcigpO1xuICAgICAgICAgICAgaW1wbC5zZXRTa2luKFNLSU4pO1xuICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignaW5pdERodG1seFRhYmJhcjogY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcblx0XHR9XG4gICAgICAgIHJldHVybiBpbXBsO1xuICAgIH1cbn0iLCJcbmltcG9ydCB7IE9CSkVDVF9UWVBFLCBTS0lOLCBERUJVRyB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcblxuZXhwb3J0IGNsYXNzIFRhYiBleHRlbmRzIEJhc2VPYmplY3Qge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIGlkLCB0ZXh0LCBwb3NpdGlvbiA9IG51bGwsIGFjdGl2ZSA9IGZhbHNlLCBjbG9zZSA9IGZhbHNlKSB7XG4gICAgICAgIFxuICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUYWIgY29uc3RydWN0b3InKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgICAgICB0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBpZCwgdGV4dCwgcG9zaXRpb24sIGFjdGl2ZSwgY2xvc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGluaXQgKG5hbWUsIGNvbnRhaW5lciwgaWQsIHRleHQsIHBvc2l0aW9uID0gbnVsbCwgYWN0aXZlID0gZmFsc2UsIGNsb3NlID0gZmFsc2UpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgdGhhdCBjb250YWluZXIgbXVzdCBiZSBhIFRhYmJhciBvYmplY3RcbiAgICAgICAgY29udGFpbmVyLmltcGwuYWRkVGFiKGlkLCB0ZXh0LCBudWxsLCBwb3NpdGlvbiwgYWN0aXZlLCBjbG9zZSk7XG4gICAgICAgIFxuICAgICAgICB2YXIgaW1wbCA9IGNvbnRhaW5lci5pbXBsLnRhYnMoaWQpO1xuICAgICAgICBcbiAgICAgICAgIC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2RcbiAgICAgICAgc3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5UQUIsIGNvbnRhaW5lciwgaW1wbCk7XG4gICAgfVxufVxuIiwiXG5cbmltcG9ydCB7IE9CSkVDVF9UWVBFLCBTS0lOLCBERUJVRyB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XG5cbmV4cG9ydCBjbGFzcyBBY2NvcmRpb24gZXh0ZW5kcyBCYXNlT2JqZWN0IHtcbiAgICBcbiAgICBjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyKSB7XG4gICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FjY29yZGlvbiBjb25zdHJ1Y3RvcicpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzLmluaXQobmFtZSwgY29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpbml0IChuYW1lLCBjb250YWluZXIpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ3JlYXRlcyB0aGUgZGh0bWx4IG9iamVjdCAoc2VlIGZ1bmN0aW9uIGJlbG93KVxuICAgICAgICAgICAgdmFyIGltcGwgPSB0aGlzLmluaXREaHRtbHhBY2NvcmRpb24oY29udGFpbmVyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxuICAgICAgICAgICAgc3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5UQUJCQVIsIGNvbnRhaW5lciwgaW1wbCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGFiYmFyIGluaXQgbWV0aG9kIHJlcXVpcmVzIDIgcGFyYW1ldGVycycpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGluaXREaHRtbHhBY2NvcmRpb24gKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgaW1wbCA9IG51bGw7XG4gICAgICAgIGlmIChVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGltcGwgPSBuZXcgZGh0bWxYQWNjb3JkaW9uKHtcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGNvbnRhaW5lcixcbiAgICAgICAgICAgICAgICBza2luOiBTS0lOXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTFxuICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5BQ0NPUkRJT05fQ0VMTFxuICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UQUJcbiAgICAgICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuV0lORE9XKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGltcGwgPSBjb250YWluZXIuaW1wbC5hdHRhY2hBY2NvcmRpb24oKTtcbiAgICAgICAgICAgIGltcGwuc2V0U2tpbihTS0lOKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW5pdERodG1seEFjY29yZGlvbjogY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW1wbDtcbiAgICB9XG59IiwiXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XG5cbmV4cG9ydCBjbGFzcyBBY2NvcmRpb25DZWxsIGV4dGVuZHMgQmFzZU9iamVjdCB7XG4gICAgXG4gICAgY29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgaWQsIHRleHQsIG9wZW4gPSBmYWxzZSwgaGVpZ2h0ID0gbnVsbCwgaWNvbiA9IG51bGwpIHtcbiAgICAgICAgXG4gICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FjY29yZGlvbkNlbGwgY29uc3RydWN0b3InKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgICAgICB0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBpZCwgdGV4dCwgb3BlbiwgaGVpZ2h0LCBpY29uKTtcbiAgICAgICAgfVxuICAgIH0gICAgXG4gICAgXG4gICAgaW5pdCAobmFtZSwgY29udGFpbmVyLCBpZCwgdGV4dCwgb3BlbiA9IGZhbHNlLCBoZWlnaHQgPSBudWxsLCBpY29uID0gbnVsbCkge1xuICAgICAgICBcbiAgICAgICAgLy8gVE9ETyBjaGVjayB0aGF0IGNvbnRhaW5lciBtdXN0IGJlIGEgQWNjb3JkaW9uIG9iamVjdFxuICAgICAgICBjb250YWluZXIuaW1wbC5hZGRJdGVtKGlkLCB0ZXh0LCBvcGVuLCBoZWlnaHQsIGljb24pO1xuICAgICAgICBcbiAgICAgICAgdmFyIGltcGwgPSBjb250YWluZXIuaW1wbC5jZWxscyhpZCk7XG4gICAgICAgIFxuICAgICAgICAgLy8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxuICAgICAgICBzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLkFDQ09SRElPTl9DRUxMLCBjb250YWluZXIsIGltcGwpO1xuICAgIH1cbn1cbiIsIlxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIERFQlVHLCBTS0lOLCBUT09MQkFSX0lDT05TX1BBVEggfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuXG5leHBvcnQgY2xhc3MgVG9vbGJhciBleHRlbmRzIEJhc2VPYmplY3Qge1xuXHRcblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcikge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ1Rvb2xiYXIgY29uc3RydWN0b3InKTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcik7XG5cdFx0fVxuXHR9XG5cdFxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpIHtcblx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXG5cdFx0dmFyIGltcGwgPSBpbml0RGh0bWx4VG9vbGJhcihjb250YWluZXIpO1xuXHRcdGltcGwuc2V0SWNvbnNQYXRoKFRPT0xCQVJfSUNPTlNfUEFUSCk7XG5cdFx0XG5cdFx0Ly8gQmFzZU9iamVjdCBjb25zdHJ1Y3RvclxuXHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuVE9PTEJBUiwgY29udGFpbmVyLCBpbXBsKTtcblx0XHRcblx0XHR0aGlzLmF0dGFjaEFjdGlvbk1hbmFnZXIoXCJvbkNsaWNrXCIsIGFjdGlvbk1hbmFnZXIpO1xuXHRcdHRoaXMuYXR0YWNoQWN0aW9uTWFuYWdlcihcIm9uU3RhdGVDaGFuZ2VcIiwgYWN0aW9uTWFuYWdlcik7XG5cdH1cblx0XG5cdGFkZFRvb2xiYXJCdXR0b24gKHRvb2xiYXJJdGVtKSB7XG5cdFx0dGhpcy5pbXBsLmFkZEJ1dHRvbih0b29sYmFySXRlbS5uYW1lLCAodGhpcy5jaGlsZHMubGVuZ3RoKSwgdG9vbGJhckl0ZW0uY2FwdGlvbiwgdG9vbGJhckl0ZW0uaWNvbiwgdG9vbGJhckl0ZW0uaWNvbkRpc2FibGVkKTtcblx0XHR0aGlzLmNoaWxkcy5wdXNoKHRvb2xiYXJJdGVtLmFjdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRUb29sdGlwKHRvb2xiYXJJdGVtLm5hbWUsIHRvb2xiYXJJdGVtLnRvb2x0aXApO1xuXHRcdFxuXHRcdC8vIGN1cnJ5ZmluZyFcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRcblx0YWRkVG9vbGJhckJ1dHRvblR3b1N0YXRlICh0b29sYmFySXRlbSkge1xuXHRcdHRoaXMuaW1wbC5hZGRCdXR0b25Ud29TdGF0ZSh0b29sYmFySXRlbS5uYW1lLCAodGhpcy5jaGlsZHMubGVuZ3RoKSwgdG9vbGJhckl0ZW0uY2FwdGlvbiwgdG9vbGJhckl0ZW0uaWNvbiwgdG9vbGJhckl0ZW0uaWNvbkRpc2FibGVkKTtcblx0XHR0aGlzLmNoaWxkcy5wdXNoKHRvb2xiYXJJdGVtLmFjdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRUb29sdGlwKHRvb2xiYXJJdGVtLm5hbWUsIHRvb2xiYXJJdGVtLnRvb2x0aXApO1xuXHRcdFxuXHRcdC8vIGN1cnJ5ZmluZyFcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRcblx0YWRkVG9vbGJhckJ1dHRvblNlbGVjdCAodG9vbGJhckl0ZW0pIHtcblx0XHR0aGlzLmltcGwuYWRkQnV0dG9uU2VsZWN0KHRvb2xiYXJJdGVtLm5hbWUsICh0aGlzLmNoaWxkcy5sZW5ndGgpLCB0b29sYmFySXRlbS5jYXB0aW9uLCBbXSwgdG9vbGJhckl0ZW0uaWNvbiwgdG9vbGJhckl0ZW0uaWNvbkRpc2FibGVkKTtcblx0XHR0aGlzLmNoaWxkcy5wdXNoKHRvb2xiYXJJdGVtLmFjdGlvbik7XG4gICAgICAgIHRoaXMuYWRkVG9vbHRpcCh0b29sYmFySXRlbS5uYW1lLCB0b29sYmFySXRlbS50b29sdGlwKTtcblx0XHRcblx0XHQvLyBjdXJyeWZpbmchXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0XG5cdGFkZFRvb2xiYXJMaXN0T3B0aW9uIChwYXJlbnQsIHRvb2xiYXJJdGVtKSB7XG5cdFx0dGhpcy5pbXBsLmFkZExpc3RPcHRpb24ocGFyZW50LCB0b29sYmFySXRlbS5uYW1lLCAodGhpcy5jaGlsZHMubGVuZ3RoKSwgJ2J1dHRvbicsIHRvb2xiYXJJdGVtLmNhcHRpb24sIHRvb2xiYXJJdGVtLmljb24pO1xuXHRcdHRoaXMuY2hpbGRzLnB1c2godG9vbGJhckl0ZW0uYWN0aW9uKTtcbiAgICAgICAgdGhpcy5hZGRUb29sdGlwKHRvb2xiYXJJdGVtLm5hbWUsIHRvb2xiYXJJdGVtLnRvb2x0aXApO1xuXHRcdFxuXHRcdC8vIGN1cnJ5ZmluZyFcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRcblx0YWRkU2VwYXJhdG9yICh0b29sYmFySXRlbSkge1xuXHRcdHRoaXMuaW1wbC5hZGRTZXBhcmF0b3IodG9vbGJhckl0ZW0ubmFtZSwgKHRoaXMuY2hpbGRzLmxlbmd0aCkpO1xuXHRcdFxuXHRcdC8vIGN1cnJ5ZmluZyFcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRcblx0YWRkVGV4dCAodG9vbGJhckl0ZW0pIHtcblx0XHR0aGlzLmltcGwuYWRkVGV4dCh0b29sYmFySXRlbS5uYW1lLCAodGhpcy5jaGlsZHMubGVuZ3RoKSwgdG9vbGJhckl0ZW0uY2FwdGlvbik7XG5cdFx0XG5cdFx0Ly8gY3VycnlmaW5nIVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdFxuXHRhZGRJbnB1dCAodG9vbGJhckl0ZW0sIHdpZHRoKSB7XG5cdFx0dGhpcy5pbXBsLmFkZElucHV0KHRvb2xiYXJJdGVtLm5hbWUsICh0aGlzLmNoaWxkcy5sZW5ndGgpLCB0b29sYmFySXRlbS5jYXB0aW9uLCB3aWR0aCk7XG5cdFx0XG5cdFx0Ly8gY3VycnlmaW5nIVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdFxuXHRhZGRUb29sdGlwIChuYW1lLCB0ZXh0KSB7XG5cdFx0aWYgKHR5cGVvZiB0ZXh0ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0dGhpcy5pbXBsLnNldEl0ZW1Ub29sVGlwKG5hbWUsIHRleHQpO1xuXHRcdH1cbiAgICB9XG59XG5cbi8qKiBDcmVhdGVzIHRoZSBkaHRtbFhUb29sYmFyT2JqZWN0IGluc2lkZSBpdHMgY29udGFpbmVyLiAqL1xuZnVuY3Rpb24gaW5pdERodG1seFRvb2xiYXIgKGNvbnRhaW5lcikge1xuXHR2YXIgaW1wbCA9IG51bGw7XG5cdGlmIChVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XG5cdFx0aW1wbCA9IG5ldyBkaHRtbFhUb29sYmFyT2JqZWN0KGNvbnRhaW5lciwgU0tJTik7XG5cdFx0XG5cdH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVF9DRUxMXG4gICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkFDQ09SRElPTl9DRUxMXG5cdFx0fHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVFxuXHRcdHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5XSU5ET1dcbiAgICAgICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuVEFCKSB7XG5cdFx0XG5cdFx0aW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaFRvb2xiYXIoKTtcblx0XHRpbXBsLnNldFNraW4oU0tJTik7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdpbml0RGh0bWx4VG9vbGJhcjogY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcblx0fVxuXHRyZXR1cm4gaW1wbDtcbn1cbiIsIlxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIFNLSU4sIERFQlVHLCBHUklEX0lDT05TX1BBVEggfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuXG5leHBvcnQgY2xhc3MgQmFzZUdyaWQgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblxuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyID0gbnVsbCkge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ0Jhc2VHcmlkIGNvbnN0cnVjdG9yJyk7XG5cdFx0fVxuXG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XG5cdFx0XHR0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKTtcblx0XHR9XG5cdH1cblxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIgPSBudWxsKSB7XG5cblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XG5cblx0XHRcdC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3QgKHNlZSBmdW5jdGlvbiBiZWxvdylcblx0XHRcdHZhciBpbXBsID0gdGhpcy5pbml0RGh0bWx4R3JpZChjb250YWluZXIpO1xuXHRcdFx0aW1wbC5zZXRTa2luKFNLSU4pO1xuXHRcdFx0aW1wbC5zZXRJY29uc1BhdGgoR1JJRF9JQ09OU19QQVRIKTtcblxuXHRcdFx0Ly8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxuXHRcdFx0c3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5HUklELCBjb250YWluZXIsIGltcGwpO1xuXHRcdFx0XG5cdFx0XHQvLyBFbmFibGUgb25TZWxlY3QgZXZlbnQgXG5cdFx0XHRpZiAoYWN0aW9uTWFuYWdlciAhPSBudWxsKSB7XG5cdFx0XHRcdHRoaXMuYXR0YWNoQWN0aW9uTWFuYWdlcihcIm9uU2VsZWN0XCIsIGFjdGlvbk1hbmFnZXIpO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignQmFzZUdyaWQgaW5pdCBtZXRob2QgcmVxdWlyZXMgMiBwYXJhbWV0ZXJzJyk7XG5cdFx0fVxuXHR9XG5cdFxuXHRsb2FkICh1cmwsIHR5cGUgPSAnanNvbicpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGhpcy5pbXBsLmxvYWQodXJsLCBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2UpO1xuXHRcdFx0XHR9LCB0eXBlKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0cmVqZWN0KGUpO1xuXHRcdFx0fVxuXHRcdH0pO1x0XHRcblx0fVxuXG5cdGluaXREaHRtbHhHcmlkIChjb250YWluZXIpIHtcblxuXHRcdHZhciBpbXBsID0gbnVsbDtcblx0XHRpZiAoVXRpbC5pc05vZGUoY29udGFpbmVyKSkge1xuXHRcdFx0XG5cdFx0XHRpbXBsID0gbmV3IGRodG1sWEdyaWRPYmplY3QoY29udGFpbmVyKTtcblx0XHRcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkFDQ09SRElPTl9DRUxMXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuVEFCXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuV0lORE9XKSB7XHRcdFxuXHRcdFx0aW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaEdyaWQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdpbml0RGh0bWx4VG9vbGJhcjogY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcblx0XHR9XG5cdFx0cmV0dXJuIGltcGw7XG5cdH1cbn1cbiIsIlxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIFNLSU4sIERFQlVHLCBHUklEX0lDT05TX1BBVEggfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuXG5leHBvcnQgY2xhc3MgUHJvcGVydHlHcmlkIGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cdFxuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyID0gbnVsbCkge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ0Jhc2VHcmlkIGNvbnN0cnVjdG9yJyk7XG5cdFx0fVxuXG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XG5cdFx0XHR0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKTtcblx0XHR9XG5cdH1cblx0XG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XG5cblx0XHRcdC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3QgKHNlZSBmdW5jdGlvbiBiZWxvdylcblx0XHRcdHZhciBpbXBsID0gdGhpcy5pbml0RGh0bWx4UHJvcGVydHlHcmlkKGNvbnRhaW5lcik7XG5cdFx0XHRpbXBsLnNldFNraW4oU0tJTik7XG5cdFx0XHRpbXBsLnNldEljb25zUGF0aChHUklEX0lDT05TX1BBVEgpO1xuXG5cdFx0XHQvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXG5cdFx0XHRzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLkdSSUQsIGNvbnRhaW5lciwgaW1wbCk7XG5cdFx0XHRcblx0XHRcdC8vIEVuYWJsZSBvblNlbGVjdCBldmVudCBcblx0XHRcdGlmIChhY3Rpb25NYW5hZ2VyICE9IG51bGwpIHtcblx0XHRcdFx0dGhpcy5hdHRhY2hBY3Rpb25NYW5hZ2VyKFwib25TZWxlY3RcIiwgYWN0aW9uTWFuYWdlcik7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdQcm9wZXJ0eUdyaWQgaW5pdCBtZXRob2QgcmVxdWlyZXMgMiBwYXJhbWV0ZXJzJyk7XG5cdFx0fVxuXHR9XG5cdFxuXHRpbml0RGh0bWx4UHJvcGVydHlHcmlkIChjb250YWluZXIpIHtcblx0XHRcblx0XHR2YXIgaW1wbCA9IG51bGw7XG5cdFx0aWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcblx0XHRcdFxuXHRcdFx0aW1wbCA9IG5ldyBkaHRtbFhQcm9wZXJ0eUdyaWQoY29udGFpbmVyKTtcblx0XHRcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTCB8fFxuXHRcdFx0Y29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLldJTkRPVyB8fFxuXHRcdFx0Y29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLlRBQikge1xuXHRcdFx0XHRcblx0XHRcdGltcGwgPSBjb250YWluZXIuaW1wbC5hdHRhY2hQcm9wZXJ0eUdyaWQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdpbml0RGh0bWx4VG9vbGJhcjogY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcblx0XHR9XG5cdFx0cmV0dXJuIGltcGw7XG5cdH1cbn1cbiIsIlxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIERFQlVHLCBTS0lOIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnZ2xvYmFsL1V0aWwnO1xuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcblxuZXhwb3J0IGNsYXNzIEZvcm0gZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblx0XHRcblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcblx0XHRpZiAoREVCVUcpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdGb3JtIGNvbnN0cnVjdG9yJyk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxuXHRcdHN1cGVyKCk7XG5cdFx0XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcblx0XHRcdHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpO1xuXHRcdH1cblx0fVxuXHRcblx0aW5pdCAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyID0gbnVsbCkge1xuXG5cdFx0Ly8gQ3JlYXRlcyB0aGUgZGh0bWx4IG9iamVjdFxuXHRcdHZhciBpbXBsID0gdGhpcy5pbml0RGh0bWx4Rm9ybShjb250YWluZXIpO1xuXHRcdGltcGwuc2V0U2tpbihTS0lOKTtcblxuXHRcdC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2Rcblx0XHRzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLkZPUk0sIGNvbnRhaW5lciwgaW1wbCk7XG5cdH1cblx0XG5cdGluaXREaHRtbHhGb3JtIChjb250YWluZXIpIHtcblx0XHR2YXIgaW1wbCA9IG51bGw7XG5cdFx0aWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcblx0XHRcdGltcGwgPSBuZXcgZGh0bWxYRm9ybShjb250YWluZXIsIG51bGwpO1xuXHRcdFx0XG5cdFx0fSBlbHNlIGlmIChjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUX0NFTExcbiAgICAgICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkFDQ09SRElPTl9DRUxMXG4gICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5XSU5ET1dcbiAgICAgICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLlRBQikge1xuXHRcdFx0XG5cdFx0XHRpbXBsID0gY29udGFpbmVyLmltcGwuYXR0YWNoRm9ybSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2luaXREaHRtbHhGb3JtOiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gaW1wbDtcblx0fVxufSIsIlxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIERFQlVHLCBTS0lOIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnZ2xvYmFsL1V0aWwnO1xuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcblxuZXhwb3J0IGNsYXNzIFZhdWx0IGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cbiAgY29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgb3B0aW9ucywgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcblx0aWYgKERFQlVHKSB7XG5cdFx0Y29uc29sZS5sb2coJ1ZhdWx0IGNvbnN0cnVjdG9yJyk7XG5cdH1cblx0XG5cdC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxuXHRzdXBlcigpO1xuXHRcblx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykge1xuXHRcdHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIG9wdGlvbnMsIGFjdGlvbk1hbmFnZXIpO1xuXHR9XG4gIH1cbiAgXG4gIGluaXQgKG5hbWUsIGNvbnRhaW5lciwgb3B0aW9ucywgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcblxuICAgICAgICAvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0XG4gICAgICAgIHZhciBpbXBsID0gdGhpcy5pbml0RGh0bWx4VmF1bHQoY29udGFpbmVyLCBvcHRpb25zKTtcbiAgICAgICAgaW1wbC5zZXRTa2luKFNLSU4pO1xuXG4gICAgICAgIC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2RcbiAgICAgICAgc3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5WQVVMVCwgY29udGFpbmVyLCBpbXBsKTtcbiAgfVxuICAgIFxuICBpbml0RGh0bWx4VmF1bHQgKGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgICAgICB2YXIgaW1wbCA9IG51bGw7XG4gICAgICAgIGlmIChVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XG4gICAgICAgICAgICAgICAgaW1wbCA9IG5ldyBkaHRtbFhWYXVsdE9iamVjdChvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIGlmIChjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUX0NFTExcbiAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5BQ0NPUkRJT05fQ0VMTFxuICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLldJTkRPV1xuICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLlRBQikge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGltcGwgPSBjb250YWluZXIuaW1wbC5hdHRhY2hWYXVsdChvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2luaXREaHRtbHhWYXVsdDogY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGltcGw7XG4gIH1cbn1cbiIsIlxuaW1wb3J0IHsgREVCVUcsIE9CSkVDVF9UWVBFIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuaW1wb3J0IHsgd2luZG93TWFuYWdlciB9IGZyb20gJ3dpbmRvdy9XaW5kb3dNYW5hZ2VyJztcblxuLyoqXG4gICogXG4gICovXHQgXG5leHBvcnQgY2xhc3MgV2luZG93IGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgd2lkdGgsIGhlaWdodCkge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ1dpbmRvdyBjb25zdHJ1Y3RvcicpO1xuXHRcdH1cblxuXHRcdC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxuXHRcdHN1cGVyKCk7XG5cdFx0XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcblx0XHRcdHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIHdpZHRoLCBoZWlnaHQpO1xuXHRcdH1cblx0fVxuXG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lciwgd2lkdGgsIGhlaWdodCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltcGwgPSB3aW5kb3dNYW5hZ2VyLmNyZWF0ZShuYW1lLCB3aWR0aCwgaGVpZ2h0KTtcblxuXHRcdFx0Ly8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxuXHRcdFx0c3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5XSU5ET1csIGNvbnRhaW5lciwgaW1wbCk7XG5cblx0XHRcdC8vIENlbnRlcmVkIGJ5IGRlZmF1bHRcblx0XHRcdGltcGwuY2VudGVyT25TY3JlZW4oKTtcblxuXHRcdFx0Ly8gTW9kYWwgYnkgZGVmYXVsdFxuXHRcdFx0aW1wbC5zZXRNb2RhbCh0cnVlKTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1dpbmRvdyBpbml0IG1ldGhvZCByZXF1aXJlcyAzIHBhcmFtZXRlcnMnKTtcblx0XHR9XG5cdH1cbn0iLCJcblxuaW1wb3J0IHsgU0tJTiwgREVCVUcsIE9CSkVDVF9UWVBFIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuaW1wb3J0IHsgV2luZG93IH0gZnJvbSAnd2luZG93L1dpbmRvdyc7XG5cblxuY2xhc3MgV2luZG93TWFuYWdlciBleHRlbmRzIEJhc2VPYmplY3Qge1xuXG5cdGNvbnN0cnVjdG9yIChuYW1lKSB7XG5cdFx0aWYgKERFQlVHKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnV2luZG93TWFuYWdlciBjb25zdHJ1Y3RvcicpO1xuXHRcdH1cblxuXHRcdC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxuXHRcdHN1cGVyKCk7XG5cdFx0XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHRoaXMuaW5pdChuYW1lKTtcblx0XHR9XG5cdH1cblxuXHRpbml0IChuYW1lLCBjb250YWluZXIpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXG5cdFx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXG5cdFx0XHR2YXIgaW1wbCA9IG5ldyBkaHRtbFhXaW5kb3dzKFNLSU4pO1xuXG5cdFx0XHQvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXG5cdFx0XHRzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLldJTkRPV19NQU5BR0VSLCBudWxsLCBpbXBsKTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1dpbmRvd01hbmFnZXIgaW5pdCBtZXRob2QgcmVxdWlyZXMgMSBwYXJhbWV0ZXInKTtcblx0XHR9XG5cdH1cblxuXHRjcmVhdGUgKG5hbWUsIHdpZHRoLCBoZWlnaHQpIHtcblx0XHQvLyBUaGUgd2luZG93IGdldHMgY2VudGVyZWQgaW5zaWRlIHRoZSBXaW5kb3cgb2JqZWN0XG5cdFx0dmFyIGNvb3JkWCA9IDAgOyBcblx0XHR2YXIgY29vcmRZID0gMCA7IFxuXHRcdHJldHVybiB0aGlzLmltcGwuY3JlYXRlV2luZG93KG5hbWUsIGNvb3JkWCwgY29vcmRZLCB3aWR0aCwgaGVpZ2h0KTtcblx0fVxufVxuXG4vLyBGb3Igbm93LCBvbmx5IG9uZSBXaW5kb3dNYW5hZ2VyIHdpbGwgZG9cbmxldCB3aW5kb3dNYW5hZ2VyID0gbmV3IFdpbmRvd01hbmFnZXIoJ3dpbmRvd01hbmFnZXInKTtcblxuZXhwb3J0IHsgd2luZG93TWFuYWdlciB9IDtcbiIsIlxuXG5leHBvcnQgY2xhc3MgTWVzc2FnZSB7XG5cblx0c3RhdGljIGFsZXJ0ICh0aXRsZSwgdGV4dCwgbW9kYWwgPSBmYWxzZSkge1xuXHRcdGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0aWYgKG1vZGFsKSB7XG5cdFx0XHRcdGRodG1seC5tZXNzYWdlKHtcblx0XHRcdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRcdFx0dHlwZTogJ2FsZXJ0Jyxcblx0XHRcdFx0XHR0ZXh0OiB0ZXh0LFxuXHRcdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZGh0bWx4Lm1lc3NhZ2Uoe1xuXHRcdFx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdFx0XHR0ZXh0OiB0ZXh0XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuXHR9XG5cblx0c3RhdGljIHdhcm5pbmcgKHRpdGxlLCB0ZXh0LCBtb2RhbCA9IGZhbHNlKSB7XG5cdFx0bGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRpZiAobW9kYWwpIHtcblx0XHRcdFx0ZGh0bWx4Lm1lc3NhZ2Uoe1xuXHRcdFx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdFx0XHR0eXBlOiAnYWxlcnQtd2FybmluZycsXG5cdFx0XHRcdFx0dGV4dDogdGV4dCxcblx0XHRcdFx0XHRjYWxsYmFjazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRodG1seC5tZXNzYWdlKHtcblx0XHRcdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRcdFx0dGV4dDogdGV4dFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcblx0fVxuXG5cdHN0YXRpYyBlcnJvciAodGl0bGUsIHRleHQsIG1vZGFsID0gZmFsc2UpIHtcblx0XHRsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGlmIChtb2RhbCkge1xuXHRcdFx0XHRkaHRtbHgubWVzc2FnZSh7XG5cdFx0XHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0XHRcdHR5cGU6ICdhbGVydC1lcnJvcicsXG5cdFx0XHRcdFx0dGV4dDogdGV4dCxcblx0XHRcdFx0XHRjYWxsYmFjazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRodG1seC5tZXNzYWdlKHtcblx0XHRcdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRcdFx0dHlwZTogJ2Vycm9yJyxcblx0XHRcdFx0XHR0ZXh0OiB0ZXh0XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuXHR9XG5cblx0c3RhdGljIGNvbmZpcm0gKHRpdGxlLCB0ZXh0LCBvaywgY2FuY2VsKSB7XG5cdFx0bGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRkaHRtbHguY29uZmlybSh7XG5cdFx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdFx0dGV4dDogdGV4dCxcblx0XHRcdFx0b2s6IG9rLFxuXHRcdFx0XHRjYW5jZWw6IGNhbmNlbCxcblx0XHRcdFx0Y2FsbGJhY2s6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0aWYgKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlamVjdCgpOyAgICBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHJldHVybiBwcm9taXNlO1xuXHR9XG59XG4iLCJcbi8vIEhlcmUgd2UgaW1wb3J0IGFsbCBcInB1YmxpY1wiIGNsYXNzZXMgdG8gZXhwb3NlIHRoZW1cbmltcG9ydCB7IGdldENvbmZpZywgc2V0Q29uZmlnIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5cbmltcG9ydCB7IEFjdGlvbk1hbmFnZXIgfSBmcm9tICdhY3Rpb25zL0FjdGlvbk1hbmFnZXInO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnYWN0aW9ucy9BY3Rpb24nO1xuXG5pbXBvcnQgeyBCYXNlTGF5b3V0IH0gZnJvbSAnbGF5b3V0L0Jhc2VMYXlvdXQnOyBcbmltcG9ydCB7IFNpbXBsZUxheW91dCB9IGZyb20gJ2xheW91dC9TaW1wbGVMYXlvdXQnO1xuaW1wb3J0IHsgVHdvQ29sdW1uc0xheW91dCB9IGZyb20gJ2xheW91dC9Ud29Db2x1bW5zTGF5b3V0JztcbmltcG9ydCB7IFBhZ2VMYXlvdXQgfSBmcm9tICdsYXlvdXQvUGFnZUxheW91dCc7XG5pbXBvcnQgeyBXaW5kb3dMYXlvdXQgfSBmcm9tICdsYXlvdXQvV2luZG93TGF5b3V0JztcblxuaW1wb3J0IHsgTWVudSB9IGZyb20gJ21lbnUvTWVudSc7XG5pbXBvcnQgeyBDb250ZXh0TWVudSB9IGZyb20gJ21lbnUvQ29udGV4dE1lbnUnO1xuaW1wb3J0IHsgTWVudUl0ZW0gfSBmcm9tICdtZW51L01lbnVJdGVtJztcblxuaW1wb3J0IHsgQmFzZVRyZWUgfSBmcm9tICd0cmVlL0Jhc2VUcmVlJztcbmltcG9ydCB7IFRyZWVJdGVtIH0gZnJvbSAndHJlZS9UcmVlSXRlbSc7XG5cbmltcG9ydCB7IFRhYmJhciB9IGZyb20gJ3RhYmJhci9UYWJiYXInO1xuaW1wb3J0IHsgVGFiIH0gZnJvbSAndGFiYmFyL1RhYic7XG5cbmltcG9ydCB7IEFjY29yZGlvbiB9IGZyb20gJ2FjY29yZGlvbi9BY2NvcmRpb24nO1xuaW1wb3J0IHsgQWNjb3JkaW9uQ2VsbCB9IGZyb20gJ2FjY29yZGlvbi9BY2NvcmRpb25DZWxsJztcblxuaW1wb3J0IHsgVG9vbGJhciB9IGZyb20gJ3Rvb2xiYXIvVG9vbGJhcic7XG5cbmltcG9ydCB7IEJhc2VHcmlkIH0gZnJvbSAnZ3JpZC9CYXNlR3JpZCc7XG5pbXBvcnQgeyBQcm9wZXJ0eUdyaWQgfSBmcm9tICdncmlkL1Byb3BlcnR5R3JpZCc7XG5cbmltcG9ydCB7IEZvcm0gfSBmcm9tICdmb3JtL0Zvcm0nO1xuaW1wb3J0IHsgVmF1bHQgfSBmcm9tICd2YXVsdC9WYXVsdCc7XG5cbmltcG9ydCB7IHdpbmRvd01hbmFnZXIgfSBmcm9tICd3aW5kb3cvV2luZG93TWFuYWdlcic7XG5pbXBvcnQgeyBXaW5kb3cgfSBmcm9tICd3aW5kb3cvV2luZG93JztcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tICd3aW5kb3cvTWVzc2FnZSc7XG5cbmV4cG9ydCB7XG5cdC8vIENvbmZpZyBmdW5jdGlvbnNcblx0Z2V0Q29uZmlnLCBcblx0c2V0Q29uZmlnLFxuICAgICAgICBcbiAgICB3aW5kb3dNYW5hZ2VyLFxuICAgIFdpbmRvdyxcblx0TWVzc2FnZSxcblx0XG5cdC8vIEFjdGlvbiBtYW5hZ2VtZW50XG5cdEFjdGlvbk1hbmFnZXIsIFxuXHRBY3Rpb24sIFxuXG5cdC8vIExheW91dHNcblx0QmFzZUxheW91dCxcblx0U2ltcGxlTGF5b3V0LCBcblx0VHdvQ29sdW1uc0xheW91dCwgXG5cdFBhZ2VMYXlvdXQsXG4gICAgICAgIFdpbmRvd0xheW91dCxcbiAgICAgICAgXG4gICAgICAgIEFjY29yZGlvbixcbiAgICAgICAgQWNjb3JkaW9uQ2VsbCxcblxuXHQvLyBUcmVlIGxheW91dHNcblx0QmFzZVRyZWUsXG5cdFRyZWVJdGVtLFxuXG4gICAgLy8gTWVudXNcblx0TWVudSxcbiAgICBDb250ZXh0TWVudSxcblx0TWVudUl0ZW0sXG5cdFxuXHQvLyBUYWJiYXJcblx0VGFiYmFyLFxuXHRUYWIsXG5cdFxuXHQvLyBHcmlkXG5cdEJhc2VHcmlkLFxuXHRQcm9wZXJ0eUdyaWQsXG5cbiAgICAvLyBPdGhlclxuICAgIFRvb2xiYXIsXG5cdEZvcm0sXG4gICAgICAgIFZhdWx0XG59O1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztBQUNyQixNQUFNLGdCQUFnQixHQUFHLFFBQVEsR0FBRyxjQUFjLENBQUM7QUFDbkQsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLEdBQUcsY0FBYyxDQUFDOztBQUVwRCxJQUFJLE1BQU0sR0FBRzs7Q0FFWixLQUFLLEVBQUUsSUFBSTs7Q0FFWCxJQUFJLEVBQUUsU0FBUzs7Q0FFZixTQUFTLEVBQUUsUUFBUTs7Q0FFbkIsa0JBQWtCLEVBQUUsZ0JBQWdCO0NBQ3BDLG1CQUFtQixFQUFFLGlCQUFpQjs7Q0FFdEMsa0JBQWtCLEVBQUUsZ0JBQWdCLEdBQUcsaUJBQWlCO0NBQ3hELGVBQWUsRUFBRSxnQkFBZ0IsR0FBRyxjQUFjO0NBQ2xELGVBQWUsRUFBRSxnQkFBZ0IsR0FBRyxj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