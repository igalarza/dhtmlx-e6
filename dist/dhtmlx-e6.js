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
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL ||
			container.type === OBJECT_TYPE.ACCORDION_CELL) {
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

	addListSeparator (parent, toolbarItem) {
                this.impl.addListOption(parent, toolbarItem.name, (this.childs.length), 'separator');

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvZ2xvYmFsL2NvbmZpZy5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvYWN0aW9ucy9BY3Rpb24uanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL21lbnUvTWVudUl0ZW0uanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL3RyZWUvVHJlZUl0ZW0uanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL2FjdGlvbnMvQWN0aW9uTWFuYWdlci5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvZ2xvYmFsL1V0aWwuanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL2dsb2JhbC9CYXNlT2JqZWN0LmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9sYXlvdXQvTGF5b3V0Q2VsbC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvbGF5b3V0L0Jhc2VMYXlvdXQuanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL2xheW91dC9TaW1wbGVMYXlvdXQuanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL2xheW91dC9Ud29Db2x1bW5zTGF5b3V0LmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9sYXlvdXQvUGFnZUxheW91dC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvbGF5b3V0L1dpbmRvd0xheW91dC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvbWVudS9NZW51LmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9tZW51L0NvbnRleHRNZW51LmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy90cmVlL0Jhc2VUcmVlLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy90YWJiYXIvVGFiYmFyLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy90YWJiYXIvVGFiLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9hY2NvcmRpb24vQWNjb3JkaW9uLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9hY2NvcmRpb24vQWNjb3JkaW9uQ2VsbC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvdG9vbGJhci9Ub29sYmFyLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9ncmlkL0Jhc2VHcmlkLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9ncmlkL1Byb3BlcnR5R3JpZC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvZm9ybS9Gb3JtLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy92YXVsdC9WYXVsdC5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvd2luZG93L1dpbmRvdy5qcyIsIi9ob21lL2lnYWxhcnphL0RldmVsL2RodG1seC1lNi9zcmMvd2luZG93L1dpbmRvd01hbmFnZXIuanMiLCIvaG9tZS9pZ2FsYXJ6YS9EZXZlbC9kaHRtbHgtZTYvc3JjL3dpbmRvdy9NZXNzYWdlLmpzIiwiL2hvbWUvaWdhbGFyemEvRGV2ZWwvZGh0bWx4LWU2L3NyYy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuY29uc3QgYmFzZVBhdGggPSAnLyc7XG5jb25zdCBkZWZhdWx0SWNvbnNQYXRoID0gYmFzZVBhdGggKyAndmVuZG9yL2ltZ3MvJztcbmNvbnN0IGRlZmF1bHRJbWFnZXNQYXRoID0gYmFzZVBhdGggKyAndmVuZG9yL2ltZ3MvJztcblxubGV0IGNvbmZpZyA9IHtcblx0LyoqIEVuYWJsZXMgY29uc29sZS5sb2cgY29tbWVudHMgKi9cblx0REVCVUc6IHRydWUsXG5cdC8qKiBkaHRtbHggc2tpbiBhcHBsaWVkIHRvIGFsbCBvYmplY3RzICovXG5cdFNLSU46ICdkaHhfd2ViJyxcblx0XG5cdEJBU0VfUEFUSDogYmFzZVBhdGgsXG5cdC8qKiBVc2VkIGJ5IEdyaWQsIEFjY29yZGlvbiwgTWVudSwgR3JpZCwgVHJlZSBhbmQgVHJlZUdyaWQgICovXG5cdERFRkFVTFRfSUNPTlNfUEFUSDogZGVmYXVsdEljb25zUGF0aCxcblx0REVGQVVMVF9JTUFHRVNfUEFUSDogZGVmYXVsdEltYWdlc1BhdGgsXG5cdFxuXHRUT09MQkFSX0lDT05TX1BBVEg6IGRlZmF1bHRJY29uc1BhdGggKyAnZGh4dG9vbGJhcl93ZWIvJyxcblx0R1JJRF9JQ09OU19QQVRIOiBkZWZhdWx0SWNvbnNQYXRoICsgJ2RoeGdyaWRfd2ViLycsXG5cdFRSRUVfSUNPTlNfUEFUSDogZGVmYXVsdEljb25zUGF0aCArICdkaHh0cmVlX3dlYi8nLFxuXHRNRU5VX0lDT05TX1BBVEg6IGRlZmF1bHRJY29uc1BhdGggKyAnZGh4bWVudV93ZWIvJ1xufTtcblxuZXhwb3J0IGxldCBERUJVRyA9IGNvbmZpZy5ERUJVRztcbmV4cG9ydCBsZXQgU0tJTiA9IGNvbmZpZy5TS0lOO1xuZXhwb3J0IGxldCBUT09MQkFSX0lDT05TX1BBVEggPSBjb25maWcuVE9PTEJBUl9JQ09OU19QQVRIO1xuZXhwb3J0IGxldCBHUklEX0lDT05TX1BBVEggPSBjb25maWcuR1JJRF9JQ09OU19QQVRIO1xuZXhwb3J0IGxldCBUUkVFX0lDT05TX1BBVEggPSBjb25maWcuVFJFRV9JQ09OU19QQVRIO1xuZXhwb3J0IGxldCBNRU5VX0lDT05TX1BBVEggPSBjb25maWcuTUVOVV9JQ09OU19QQVRIO1xuZXhwb3J0IGxldCBUQUJCQVJfSUNPTlNfUEFUSCA9IGNvbmZpZy5UQUJCQVJfSUNPTlNfUEFUSDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpIHtcblx0cmV0dXJuIGNvbmZpZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENvbmZpZyhjZmcpIHtcblx0Y29uZmlnID0gY2ZnO1xufVxuXG4vKiogQWxsIHRoZSBkaHRtbHggb2JqZWN0IHR5cGVzICovXG5leHBvcnQgY29uc3QgT0JKRUNUX1RZUEUgPSB7XG4gICAgTEFZT1VUIDogJ2xheW91dCcsXG4gICAgTEFZT1VUX0NFTEwgOiAnbGF5b3V0Q2VsbCcsXG4gICAgVE9PTEJBUiA6ICd0b29sYmFyJyxcbiAgICBGT1JNIDogJ2Zvcm0nLCBcbiAgICBNRU5VIDogJ21lbnUnLCBcbiAgICBHUklEIDogJ2dyaWQnLCBcbiAgICBUUkVFIDogJ3RyZWUnLCBcbiAgICBXSU5ET1cgOiAnd2luZG93JyxcbiAgICBXSU5ET1dfTUFOQUdFUiA6ICd3aW5kb3dNYW5hZ2VyJyxcbiAgICBUQUJCQVIgOiAndGFiYmFyJyxcbiAgICBUQUIgOiAndGFiJyxcbiAgICBBQ0NPUkRJT04gOiAnYWNjb3JkaW9uJyxcbiAgICBBQ0NPUkRJT05fQ0VMTCA6ICdhY2NvcmRpb25DZWxsJyBcbn07IiwiXG5leHBvcnQgY2xhc3MgQWN0aW9uIHtcblx0XHRcblx0Y29uc3RydWN0b3IgKG5hbWUsIGltcGwpIHtcblxuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xuXHRcdHRoaXMuX2ltcGwgPSBpbXBsO1x0XHRcblx0fVxuXHRcblx0Z2V0IG5hbWUgKCkgeyByZXR1cm4gdGhpcy5fbmFtZTsgfVxuXHRnZXQgaW1wbCAoKSB7IHJldHVybiB0aGlzLl9pbXBsOyB9XHRcbn0iLCJcbi8qKlxuICogSXRlbXMgaW5zaWRlIHRoZSBtZW51XG4gKi9cbmV4cG9ydCBjbGFzcyBNZW51SXRlbSB7XG5cdFxuXHRjb25zdHJ1Y3RvciAocGFyZW50TmFtZSwgbmFtZSwgYWN0aW9uLCBjYXB0aW9uLCBpY29uID0gbnVsbCwgaWNvbkRpc2FibGVkID0gbnVsbCkge1xuXHRcdFxuXHRcdHRoaXMuX3BhcmVudE5hbWUgPSBwYXJlbnROYW1lO1xuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xuXHRcdHRoaXMuX2FjdGlvbiA9IGFjdGlvbjtcblx0XHR0aGlzLl9jYXB0aW9uID0gY2FwdGlvbjtcblx0XHR0aGlzLl9pY29uID0gaWNvbjtcblx0XHR0aGlzLl9pY29uRGlzYWJsZWQgPSBpY29uRGlzYWJsZWQ7XG5cdH1cblx0XG5cdGdldCBwYXJlbnROYW1lICgpIHsgcmV0dXJuIHRoaXMuX3BhcmVudE5hbWU7IH1cblx0Z2V0IG5hbWUgKCkgeyByZXR1cm4gdGhpcy5fbmFtZTsgfVxuXHRnZXQgYWN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2FjdGlvbjsgfVxuXHRnZXQgY2FwdGlvbiAoKSB7IHJldHVybiB0aGlzLl9jYXB0aW9uOyB9XG5cdGdldCBpY29uICgpIHsgcmV0dXJuIHRoaXMuX2ljb247IH1cblx0Z2V0IGljb25EaXNhYmxlZCAoKSB7IHJldHVybiB0aGlzLl9pY29uRGlzYWJsZWQ7IH1cbn0iLCJcblxuZXhwb3J0IGNsYXNzIFRyZWVJdGVtIHtcblxuXHRjb25zdHJ1Y3RvcihwYXJlbnRJZCwgaWQsIHRleHQsIGFjdGlvbiA9IG51bGwpIHtcblxuXHRcdHRoaXMuX3BhcmVudElkID0gcGFyZW50SWQ7XG5cdFx0dGhpcy5faWQgPSBpZDtcblx0XHR0aGlzLl90ZXh0ID0gdGV4dDtcblx0XHR0aGlzLl9hY3Rpb24gPSBhY3Rpb247XG5cdH1cblxuXHRnZXQgcGFyZW50SWQgKCkge1xuXHRcdHJldHVybiB0aGlzLl9wYXJlbnRJZDtcblx0fVxuXG5cdGdldCBpZCAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lkO1xuXHR9XG5cblx0Z2V0IHRleHQgKCkge1xuXHRcdHJldHVybiB0aGlzLl90ZXh0O1xuXHR9XG5cblx0Z2V0IGFjdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2FjdGlvbjtcblx0fVxufSIsIlxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnYWN0aW9ucy9BY3Rpb24nO1xuaW1wb3J0IHsgTWVudUl0ZW0gfSBmcm9tICdtZW51L01lbnVJdGVtJztcbmltcG9ydCB7IFRyZWVJdGVtIH0gZnJvbSAndHJlZS9UcmVlSXRlbSc7XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25NYW5hZ2VyIHtcblx0XG5cdGNvbnN0cnVjdG9yIChjb250ZXh0LCBwYXJlbnQgPSBudWxsKSB7XG5cdFx0dGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG5cdFx0dGhpcy5fYWN0aW9ucyA9IFtdO1xuXHRcdHRoaXMuX3BhcmVudCA9IHBhcmVudDtcblx0XHR0aGlzLl9jaGlsZHMgPSBbXTtcblx0XHRcblx0XHRpZiAocGFyZW50ICE9PSBudWxsKSB7XG5cdFx0XHRwYXJlbnQuY2hpbGRzLnB1c2godGhpcyk7XG5cdFx0fVxuXHR9XG5cdFxuXHRydW4gKGFjdGlvbiwgcGFyYW1zLCBjb250ZXh0KSB7XG5cdFx0cmV0dXJuIHRoaXMuX2FjdGlvbnNbYWN0aW9uXShwYXJhbXMsIGNvbnRleHQpO1xuXHR9XG5cdFxuXHRjcmVhdGVNZW51SXRlbSAocGFyZW50TmFtZSwgYWN0aW9uTmFtZSwgY2FwdGlvbiwgaWNvbiwgaWNvbkRpc2FibGVkKSB7XHRcdFxuXHRcdHZhciBhY3Rpb24gPSB0aGlzLmFjdGlvbnNbYWN0aW9uTmFtZV07XG5cdFx0cmV0dXJuIG5ldyBNZW51SXRlbShwYXJlbnROYW1lLCBhY3Rpb25OYW1lLCBhY3Rpb24sIGNhcHRpb24sIGljb24sIGljb25EaXNhYmxlZCk7XG5cdH1cblxuXHRjcmVhdGVUcmVlSXRlbSAocGFyZW50TmFtZSwgYWN0aW9uTmFtZSwgY2FwdGlvbikge1x0XHRcblx0XHR2YXIgYWN0aW9uID0gdGhpcy5hY3Rpb25zW2FjdGlvbk5hbWVdO1xuXHRcdHJldHVybiBuZXcgVHJlZUl0ZW0ocGFyZW50TmFtZSwgYWN0aW9uTmFtZSwgY2FwdGlvbiwgYWN0aW9uKTtcblx0fVxuXG5cdGFkZEFjdGlvbk9iaiAoYWN0aW9uKSB7XG5cdFx0dGhpcy5fYWN0aW9uc1thY3Rpb24ubmFtZV0gPSBhY3Rpb24uaW1wbDtcblx0fVxuXG5cdGFkZEFjdGlvbiAobmFtZSwgaW1wbCkge1xuXHRcdHRoaXMuX2FjdGlvbnNbbmFtZV0gPSBpbXBsO1xuXHR9XG5cdFxuXHRnZXQgY2hpbGRzICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fY2hpbGRzO1xuXHR9XG5cdFxuXHRnZXQgY29udGV4dCAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRleHQ7XG5cdH1cblx0XG5cdGdldCBwYXJlbnQgKCkge1xuXHRcdHJldHVybiB0aGlzLl9wYXJlbnQ7XG5cdH1cblx0XG5cdGdldCBhY3Rpb25zICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fYWN0aW9ucztcblx0fVxufVxuIiwiXG5cblxuZXhwb3J0IGNsYXNzIFV0aWwge1xuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBwYXJhbWV0ZXIgaXMgYSBET00gbm9kZSBvciBET00gaWQgKHN0cmluZykuXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IG8gLSBEb20gTm9kZSBvciBhbnkgb3RoZXIgdmFyaWFibGUuXG5cdCAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHBhcmFtZXRlciBpcyBhIERPTSBOb2RlLlxuXHQgKi8gICBcblx0c3RhdGljIGlzTm9kZSAobykge1xuXHRcdHJldHVybiAoXG5cdFx0XHR0eXBlb2YgTm9kZSA9PT0gXCJzdHJpbmdcIiB8fFxuXHRcdFx0dHlwZW9mIE5vZGUgPT09IFwib2JqZWN0XCIgPyBvIGluc3RhbmNlb2YgTm9kZSA6IFxuXHRcdFx0dHlwZW9mIG8gPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG8ubm9kZVR5cGUgPT09IFwibnVtYmVyXCIgJiYgdHlwZW9mIG8ubm9kZU5hbWU9PT1cInN0cmluZ1wiXG5cdFx0KTtcblx0fVxufSIsIlxuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XG5cbi8qKlxuICAqIFBhcmVudCBjbGFzcyBvZiBhbGwgdGhlIG9iamVjdHMgaW4gdGhlIGxpYnJhcnksIGl0IGhvbGRzIHNvbWUgY29tbW9uIHZhcmlhYmxlcy5cbiAgKi9cdCBcbmV4cG9ydCBjbGFzcyBCYXNlT2JqZWN0IHtcblx0XG5cdC8qKlxuXHQgKiBDYWxsZWQgYnkgY2hpbGQgb2JqZWN0cy5cblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gT2JqZWN0IG5hbWUsIHVzZWZ1bCBmb3Igc2VhcmNoaW5nIGNoaWxkIG9iamVjdHMuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVHlwZSBvZiBjb21wb25lbnQ6IGxheW91dCwgd2luZG93LCBncmlkLCBldGMuXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IGNvbnRhaW5lciAtIE9iamVjdCBvciBkb20gaWQgb2YgdGhlIHBhcmVudCBlbGVtZW50LlxuXHQgKiBAcGFyYW0ge29iamVjdH0gaW1wbCAtIGRodG1seCBvYmplY3QsIG11c3QgYmUgY3JlYXRlZCBieSBjaGlsZCBjbGFzcy5cblx0ICovXG4gICAgY29uc3RydWN0b3IgKG5hbWUsIHR5cGUsIGNvbnRhaW5lciwgaW1wbCkge1xuXHRcdC8vIEl0IGNhbiBiZSBjYWxsZWQgd2l0aG91dCBhcmd1bWVudHMsIGZvciB0ZXN0aW5nIGludGVncmF0aW9uIHJlYXNvbnMuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcblx0XHRcdHRoaXMuaW5pdChuYW1lLCB0eXBlLCBjb250YWluZXIsIGltcGwpO1xuXHRcdH1cdFx0XG4gICAgfVxuXHRcblx0aW5pdCAobmFtZSwgdHlwZSwgY29udGFpbmVyLCBpbXBsKSB7XHRcdFx0XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcblx0XHRcdC8vIENsZWFuIHVwIGJlZm9yZSBhc3NpZ25hdGlvbnNcblx0XHRcdHRoaXMuZGVzdHJveSgpO1xuXHRcdFx0Ly8gSW5pdCBwcm9wZXJ0aWVzXG5cdFx0XHR0aGlzLl9uYW1lID0gbmFtZTtcblx0XHRcdHRoaXMuX3R5cGUgPSB0eXBlO1xuXHRcdFx0dGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuXHRcdFx0dGhpcy5faW1wbCA9IGltcGw7XG5cdFx0XHR0aGlzLl9jaGlsZHMgPSBbXTtcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRhaW5lciAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICFVdGlsLmlzTm9kZShjb250YWluZXIpICYmXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcyBpbnN0YW5jZW9mIEFycmF5KSB7XG5cdFx0XHRcdC8vIEFkZHMgdGhpcyB0byBwYXJlbnQgYXMgYSBjaGlsZFxuXHRcdFx0XHRjb250YWluZXIuY2hpbGRzLnB1c2godGhpcyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignQmFzZU9iamVjdCBpbml0IG1ldGhvZCByZXF1aXJlcyA0IHBhcmFtZXRlcnMnKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKiBEZXN0cm95cyB0aGUgb2JqZWN0IGFuZCBhbGwgdGhpcyBjaGlsZHMuICovXG5cdGRlc3Ryb3kgKCkge1xuXHRcdC8vIEZpcnN0LCB0aGUgY2hpbGRzXG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9jaGlsZHMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHR3aGlsZSAodGhpcy5fY2hpbGRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dmFyIGNoaWxkID0gdGhpcy5fY2hpbGRzLnBvcCgpO1xuXHRcdFx0XHRpZiAodHlwZW9mIGNoaWxkID09PSAnb2JqZWN0JyBcblx0XHRcdFx0XHQmJiB0eXBlb2YgY2hpbGQuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y2hpbGQuZGVzdHJveSgpO1xuXHRcdFx0XHR9XHRcdFx0XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZpbmcgZnJvbSBjb250YWluZXJcblx0XHRpZiAodHlwZW9mIHRoaXMuX2NvbnRhaW5lciAhPT0gJ3VuZGVmaW5lZCdcblx0XHRcdCYmIHR5cGVvZiB0aGlzLl9jb250YWluZXIuY2hpbGRzICE9PSAndW5kZWZpbmVkJykge1xuXG5cdFx0XHR0aGlzLl9jb250YWluZXIuY2hpbGRzID0gdGhpcy5fY29udGFpbmVyLmNoaWxkcy5maWx0ZXIoKGVsZW0pID0+IGVsZW0gIT09IHRoaXMpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBGaW5hbGx5LCB0aGUgb2JqZWN0XG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9pbXBsICE9PSAndW5kZWZpbmVkJyAmJlxuXHRcdFx0dHlwZW9mIHRoaXMuX2ltcGwudW5sb2FkID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAoREVCVUcpIHtcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy50eXBlICsnOiBDYWxsIHRvIHVubG9hZCgpIGluIGRlc3Ryb3kgbWV0aG9kLicpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5faW1wbC51bmxvYWQoKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKiBGaW5kcyBhIGNoaWxkIG9iamVjdCBieSBuYW1lICovXG5cdGZpbmQgKG5hbWUpIHtcblx0XHRpZiAodGhpcy5uYW1lID09PSBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLl9jaGlsZHMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdGZvciAobGV0IGk9MDsgaTx0aGlzLl9jaGlsZHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgY2hpbGQgPSB0aGlzLl9jaGlsZHNbaV07XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBjaGlsZCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGNoaWxkLmZpbmQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdHZhciByZXN1bHQgPSBjaGlsZC5maW5kKG5hbWUpO1xuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdFxuXHQvKiogRmluZHMgYSBwYXJlbnQgb2JqZWN0IGJ5IG5hbWUgKi9cblx0ZmluZFBhcmVudCAobmFtZSkge1xuXHRcdGlmICh0aGlzLm5hbWUgPT09IG5hbWUpIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIHRoaXMuX2NvbnRhaW5lciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuX2NvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnQgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwYXJlbnQuZmluZFBhcmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBwYXJlbnQuZmluZFBhcmVudChuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdFxuXHQvKiogQWRkcyBhbiBldmVudCB0byB0aGUgb2JqZWN0LCB3aXRoIGFuIEFjdGlvbk1hbmFnZXIgb2JqZWN0IGFzIGEgY29sbGVjdGlvbiBvZiBhY3Rpb25zLiAqL1xuXHRhdHRhY2hBY3Rpb25NYW5hZ2VyIChldmVudE5hbWUsIGFjdGlvbk1hbmFnZXIpIHtcblx0XHRyZXR1cm4gdGhpcy5pbXBsLmF0dGFjaEV2ZW50KGV2ZW50TmFtZSwgZnVuY3Rpb24gKGlkKSB7XG5cdFx0XHQvLyBDaGVja2luZyBpZiB0aGUgYWN0aW9uTWFuYWdlciBoYXMgdGhlIGFjdGlvbiB3aXRoIHRoZSByaWdodCBpZFxuXHRcdFx0aWYgKHR5cGVvZiBhY3Rpb25NYW5hZ2VyLmFjdGlvbnNbaWRdID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdC8vIFRoZSBjb250ZXh0IGluIHRoZSBhY3Rpb25NYW5hZ2VyIGlzIHNlbnQgdG8gdGhlIGFjdGlvblxuXHRcdFx0XHRyZXR1cm4gYWN0aW9uTWFuYWdlci5hY3Rpb25zW2lkXShhcmd1bWVudHMsIGFjdGlvbk1hbmFnZXIuY29udGV4dCk7XG5cdFx0XHQvLyBUT0RPIFNvbHZlIGl0IHJlY3Vyc2l2ZWx5LCByaWdodCBub3cgb25seSBnb2VzIHVwIG9uZSBsZXZlbFxuXHRcdFx0fSBlbHNlIGlmIChhY3Rpb25NYW5hZ2VyLnBhcmVudCAhPT0gbnVsbCAmJiB0eXBlb2YgYWN0aW9uTWFuYWdlci5wYXJlbnQuYWN0aW9uc1tpZF0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIGFjdGlvbk1hbmFnZXIucGFyZW50LmFjdGlvbnNbaWRdKGFyZ3VtZW50cywgYWN0aW9uTWFuYWdlci5wYXJlbnQuY29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0XG5cdC8qKiBBZGRzIGFuIGV2ZW50IHRvIHRoZSBvYmplY3QsIHdpdGggYSBmdW5jdGlvbiBwYXJhbWV0ZXIgYXMgYW4gYWN0aW9uLiAqL1xuXHRhdHRhY2hBY3Rpb24gKGV2ZW50TmFtZSwgYWN0aW9uLCBjb250ZXh0KSB7XG5cdFx0cmV0dXJuIHRoaXMuaW1wbC5hdHRhY2hFdmVudChldmVudE5hbWUsIGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vIE1ha2luZyBzdXJlIHRoZSBhY3Rpb24gcGFyYW0gaXMgcmVhbGx5IGFuIG9iamVjdFxuXHRcdFx0aWYgKHR5cGVvZiBhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0Ly8gVGhlIGNvbnRleHQgaW4gdGhlIGFjdGlvbk1hbmFnZXIgaXMgc2VudCB0byB0aGUgYWN0aW9uXG5cdFx0XHRcdHJldHVybiBhY3Rpb24oYXJndW1lbnRzLCBjb250ZXh0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRcblx0Z2V0IG5hbWUgKCkge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5fbmFtZSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybiB0aGlzLl9uYW1lO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3RoaXMuX25hbWUgaXMgdW5kZWZpbmVkOiBpbml0IG1ldGhvZCBoYXMgbm90IGJlZW4gY2FsbGVkJyk7XG5cdFx0fVxuXHR9XG5cdFxuICAgICAgICAvKipcbiAgICAgICAgKiBUeXBlIG9mIGNvbXBvbmVudDogbGF5b3V0LCB3aW5kb3csIGdyaWQsIGV0Yy4gXG4gICAgICAgICovXG5cdGdldCB0eXBlICgpIHtcblx0XHRpZiAodHlwZW9mIHRoaXMuX3R5cGUgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fdHlwZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCd0aGlzLl90eXBlIGlzIHVuZGVmaW5lZDogaW5pdCBtZXRob2QgaGFzIG5vdCBiZWVuIGNhbGxlZCcpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG4gICAgICAgICogVXN1YWxseSBpcyBvdGhlciBkaHRtbHgtZTYgb2JqZWN0LCB0aGUgcm9vdCBjb250YWluZXIgc2hvdWxkIGJlIGluc2lkZSBkb2N1bWVudC5ib2R5XG4gICAgICAgICovXG5cdGdldCBjb250YWluZXIgKCkgeyBcblx0XHRpZiAodHlwZW9mIHRoaXMuX2NvbnRhaW5lciAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybiB0aGlzLl9jb250YWluZXI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcigndGhpcy5fY29udGFpbmVyIGlzIHVuZGVmaW5lZDogaW5pdCBtZXRob2QgaGFzIG5vdCBiZWVuIGNhbGxlZCcpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG4gICAgICAgICogZGh0bWx4IG9iamVjdCwgbXVzdCBiZSBjcmVhdGVkIGJ5IGNoaWxkIGNsYXNzIGJlZm9yZSBjYWxsaW5nIHN1cGVyIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgICAgKi9cblx0Z2V0IGltcGwgKCkge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5faW1wbCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybiB0aGlzLl9pbXBsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3RoaXMuX2ltcGwgaXMgdW5kZWZpbmVkOiBpbml0IG1ldGhvZCBoYXMgbm90IGJlZW4gY2FsbGVkJyk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogQ2hpbGQgb2JqZWN0cywgY291bGQgYmUgYW55IG90aGVyIGRodG1seE9iamVjdFxuXHQgKi9cblx0Z2V0IGNoaWxkcyAoKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9jaGlsZHMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY2hpbGRzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3RoaXMuX2NoaWxkcyBpcyB1bmRlZmluZWQ6IGluaXQgbWV0aG9kIGhhcyBub3QgYmVlbiBjYWxsZWQnKTtcblx0XHR9XG5cdH1cblx0XG5cdHNldCBjaGlsZHMgKGNoaWxkcykge1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRzID0gY2hpbGRzO1xuICAgICAgICB9XG59XG4iLCJcbmltcG9ydCB7IERFQlVHLCBPQkpFQ1RfVFlQRSB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcblxuLyoqXG4gICogQmFzZSBjbGFzcyBmb3IgYWxsIGxheW91dCBvYmplY3RzLCBzZWU6XG4gICogaHR0cHM6Ly9kb2NzLmRodG1seC5jb20vbGF5b3V0X19pbmRleC5odG1sXG4gICovXG5leHBvcnQgY2xhc3MgTGF5b3V0Q2VsbCBleHRlbmRzIEJhc2VPYmplY3Qge1xuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIExheW91dENlbGwgb2JqZWN0LCBjYWxsZWQgZnJvbSBCYXNlTGF5b3V0IGNsYXNzXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge21peGVkfSBjb250YWluZXIgLSBPYmplY3Qgb3IgZG9tIGlkIG9mIHRoZSBwYXJlbnQgZWxlbWVudC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IGltcGwgLSBkaHRtbHggb2JqZWN0LCBjcmVhdGVkIGluIHRoZSBCYXNlTGF5b3V0IGNsYXNzLlxuXHQgKi9cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgaW1wbCkge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ0xheW91dENlbGwgY29uc3RydWN0b3InKTtcblx0XHR9XG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgaW1wbCk7XG5cdFx0fVxuXHR9XG5cdFxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGltcGwpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0c3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTCwgY29udGFpbmVyLCBpbXBsKTtcblx0XHRcdFxuXHRcdFx0Ly8gSGVhZGVyIGlzIGhpZGRlbiBieSBkZWZhdWx0XG5cdFx0XHR0aGlzLmhlYWRlciA9IG51bGw7XG5cdFx0XHRcblx0XHRcdHRoaXMuaW1wbC5maXhTaXplKGZhbHNlLCBmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignTGF5b3V0Q2VsbCBpbml0IG1ldGhvZCByZXF1aXJlcyAzIHBhcmFtZXRlcnMnKTtcblx0XHR9XG5cdH1cblx0XG5cdGdldCBoZWlnaHQgKCkge1xuXHRcdHJldHVybiB0aGlzLmltcGwuZ2V0SGVpZ2h0KCk7XG5cdH1cblx0XG5cdHNldCBoZWlnaHQgKGhlaWdodCkge1xuXHRcdHRoaXMuaW1wbC5zZXRIZWlnaHQoaGVpZ2h0KTtcblx0fVxuXHRcblx0Z2V0IHdpZHRoICgpIHtcblx0XHRyZXR1cm4gdGhpcy5pbXBsLmdldFdpZHRoKCk7XG5cdH1cblx0XG5cdHNldCB3aWR0aCAod2lkdGgpIHtcblx0XHR0aGlzLmltcGwuc2V0V2lkdGgod2lkdGgpO1xuXHR9XG5cdFxuXHRzZXQgaHRtbCAoaHRtbCkge1xuXHRcdHRoaXMuaW1wbC5hdHRhY2hIVE1MU3RyaW5nKGh0bWwpO1xuXHR9XG5cdFxuXHRnZXQgaGVhZGVyICgpIHtcblx0XHRyZXR1cm4gdGhpcy5pbXBsLmdldFRleHQoKTtcblx0fVxuXHRcblx0c2V0IGhlYWRlciAodGV4dCkge1xuXHRcdGlmICh0ZXh0ID09IG51bGwpIHtcblx0XHRcdHRoaXMuaW1wbC5zZXRUZXh0KCcnKTtcblx0XHRcdHRoaXMuaW1wbC5oaWRlSGVhZGVyKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaW1wbC5zZXRUZXh0KHRleHQpO1xuXHRcdFx0dGhpcy5pbXBsLnNob3dIZWFkZXIoKTtcblx0XHR9XHRcdFxuXHR9XG59IiwiXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuaW1wb3J0IHsgTGF5b3V0Q2VsbCB9IGZyb20gJ0xheW91dENlbGwnO1xuXG4vKipcbiAgKiBCYXNlIGNsYXNzIGZvciBhbGwgbGF5b3V0IG9iamVjdHMsIHNlZTpcbiAgKiBodHRwczovL2RvY3MuZGh0bWx4LmNvbS9sYXlvdXRfX2luZGV4Lmh0bWxcbiAgKi9cbmV4cG9ydCBjbGFzcyBCYXNlTGF5b3V0IGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cdFxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgQmFzZUxheW91dCBvYmplY3QuIENhbiBiZSBjYWxsZWQgd2l0aG91dCBhcmd1bWVudHMsIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHttaXhlZH0gY29udGFpbmVyIC0gT2JqZWN0IG9yIGRvbSBpZCBvZiB0aGUgcGFyZW50IGVsZW1lbnQuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuIC0gZGh0bWx4IGxheW91dCBwYXR0ZXJuLCBzZWU6IGh0dHA6Ly9kb2NzLmRodG1seC5jb20vbGF5b3V0X19wYXR0ZXJucy5odG1sXG5cdCAqL1xuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBwYXR0ZXJuKSB7XG5cdFx0aWYgKERFQlVHKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnQmFzZUxheW91dCBjb25zdHJ1Y3RvcicpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2Rcblx0XHRzdXBlcigpO1xuXHRcdFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG5cdFx0XHR0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBwYXR0ZXJuKTtcblx0XHR9XG5cdH1cblx0XG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lciwgcGF0dGVybikge1xuXHRcdFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG5cdFx0XG5cdFx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXG5cdFx0XHR2YXIgaW1wbCA9IHRoaXMuaW5pdERodG1seExheW91dChjb250YWluZXIsIHBhdHRlcm4pO1xuXHRcdFx0XG5cdFx0XHQvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXG5cdFx0XHRzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLkxBWU9VVCwgY29udGFpbmVyLCBpbXBsKTtcblx0XHRcdFxuXHRcdFx0Ly8gSW5pdHMgdGhlIExheW91dENlbGwgb2JqZWN0c1xuXHRcdFx0dGhpcy5pbml0Q2VsbHMoKTtcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRhaW5lciBpbnN0YW5jZW9mIExheW91dENlbGwpIHtcblx0XHRcdFx0dmFyIGNvbnRhaW5lckxheW91dCA9IGNvbnRhaW5lci5jb250YWluZXI7XG5cdFx0XHRcdGNvbnRhaW5lckxheW91dC5hdHRhY2hBY3Rpb24oXCJvblJlc2l6ZUZpbmlzaFwiLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGltcGwuc2V0U2l6ZXMoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdCYXNlTGF5b3V0IGluaXQgbWV0aG9kIHJlcXVpcmVzIDMgcGFyYW1ldGVycycpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqICBcblx0ICogSW50ZXJuYWwgbWV0aG9kIGNhbGxlZCBieSB0aGUgY29uc3RydWN0b3IsIGl0IGNyZWF0ZXMgdGhlIExheW91dENlbGwgXG5cdCAqIG9iamVjdHMgYW5kIGFkZHMgdGhlbSB0byB0aGUgdGhpcy5jaGlsZHMgYXJyYXlcblx0ICovXG5cdGluaXRDZWxscyAoKSB7XG5cdFx0Ly8gTmVlZGVkIGluc2lkZSB0aGUgZm9yRWFjaEl0ZW1cblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIGkgPSAxO1xuXHRcdHRoaXMuX2ltcGwuZm9yRWFjaEl0ZW0oZnVuY3Rpb24gKGNlbGxJbXBsKSB7XG5cdFx0XHQvLyBoZXJlIHRoaXMgcG9pbnQgdG8gdGhlIGRodG1sWExheW91dE9iamVjdCBvYmplY3QuXG5cdFx0XHR2YXIgY2VsbE5hbWUgPSBzZWxmLm5hbWUgKyAnX2NlbGwnICsgKGkrKyk7XG5cdFx0XHR2YXIgY2VsbCA9IG5ldyBMYXlvdXRDZWxsKGNlbGxOYW1lLCBzZWxmLCBjZWxsSW1wbCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKiogQ3JlYXRlcyB0aGUgZGh0bWxYTGF5b3V0T2JqZWN0IGluc2lkZSBpdHMgY29udGFpbmVyLiAqL1xuXHRpbml0RGh0bWx4TGF5b3V0IChjb250YWluZXIsIHBhdHRlcm4pIHtcblx0XHR2YXIgaW1wbCA9IG51bGw7XG5cdFx0aWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcblx0XHRcdFxuXHRcdFx0aW1wbCA9IG5ldyBkaHRtbFhMYXlvdXRPYmplY3Qoe1xuXHRcdFx0XHQvLyBpZCBvciBvYmplY3QgZm9yIHBhcmVudCBjb250YWluZXJcblx0XHRcdFx0cGFyZW50OiBjb250YWluZXIsICAgIFx0XG5cdFx0XHRcdC8vIGxheW91dCdzIHBhdHRlcm5cdFx0XHRcblx0XHRcdFx0cGF0dGVybjogcGF0dGVybixcblx0XHRcdFx0Ly8gbGF5b3V0J3Mgc2tpblxuXHRcdFx0XHRza2luOiBTS0lOXG5cdFx0XHR9KTtcblx0XHRcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UQUJcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5XSU5ET1dcblx0XHRcdFx0XHRcdHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5BQ0NPUkRJT05fQ0VMTCkge1xuXHRcdFx0aW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaExheW91dChwYXR0ZXJuKTtcblx0XHR9XG5cdFx0cmV0dXJuIGltcGw7XG5cdH1cbn1cblxuIiwiXG5pbXBvcnQgeyBCYXNlTGF5b3V0IH0gZnJvbSAnbGF5b3V0L0Jhc2VMYXlvdXQnO1xuXG4vKiogTGF5b3V0IHdpdGggb25seSBvbmUgY2VsbCAqL1xuZXhwb3J0IGNsYXNzIFNpbXBsZUxheW91dCBleHRlbmRzIEJhc2VMYXlvdXQge1xuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIFNpbXBsZUxheW91dCBvYmplY3Rcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IGNvbnRhaW5lciAtIE9iamVjdCBvciBkb20gaWQgb2YgdGhlIHBhcmVudCBlbGVtZW50LlxuXHQgKi9cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lcikge1xuXHRcdHN1cGVyKG5hbWUsIGNvbnRhaW5lciwgJzFDJyk7XG5cdH1cblx0XG5cdC8qKiBUaGUgb25seSBMYXlvdXRDZWxsIG9iamVjdCBpbiB0aGUgbGF5b3V0ICovXG5cdGdldCBjZWxsICgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGlsZHNbMF07XG5cdH1cbn0iLCJcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBCYXNlTGF5b3V0IH0gZnJvbSAnbGF5b3V0L0Jhc2VMYXlvdXQnO1xuXG4vKipcbiAgKiBMYXlvdXQgd2l0aCB0d28gY29sdW1uczogbGVmdCBhbmQgcmlnaHRcbiAgKi9cbmV4cG9ydCBjbGFzcyBUd29Db2x1bW5zTGF5b3V0IGV4dGVuZHMgQmFzZUxheW91dCB7XG5cdFxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgVHdvQ29sdW1uc0xheW91dCBvYmplY3Rcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IGNvbnRhaW5lciAtIE9iamVjdCBvciBkb20gaWQgb2YgdGhlIHBhcmVudCBlbGVtZW50LlxuXHQgKi9cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lcikge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ1R3b0NvbHVtbnNMYXlvdXQgY29uc3RydWN0b3InKTtcblx0XHR9XG5cdFx0c3VwZXIobmFtZSwgY29udGFpbmVyLCAnMlUnKTtcblx0fVxuXHRcblx0LyoqIExlZnQgTGF5b3V0Q2VsbCAqL1xuXHRnZXQgbGVmdCAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRzWzBdO1xuXHR9XG5cdFxuXHQvKiogUmlnaHQgTGF5b3V0Q2VsbCAqL1xuXHRnZXQgcmlnaHQgKCkge1xuXHRcdHJldHVybiB0aGlzLmNoaWxkc1sxXTtcblx0fVxufSIsIlxuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IEJhc2VMYXlvdXQgfSBmcm9tICdsYXlvdXQvQmFzZUxheW91dCc7XG5cbi8qKiBMYXlvdXQgd2l0aCBwYWdlLWxpa2Ugc3RydWN0dXJlOiBoZWFkZXIsIGJvZHkgYW5kIGZvb3RlciAqL1xuZXhwb3J0IGNsYXNzIFBhZ2VMYXlvdXQgZXh0ZW5kcyBCYXNlTGF5b3V0IHtcblx0XG5cdC8qKlxuXHQgKiBDcmVhdGVzIHRoZSBTaW1wbGVMYXlvdXQgb2JqZWN0XG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge21peGVkfSBjb250YWluZXIgLSBPYmplY3Qgb3IgZG9tIGlkIG9mIHRoZSBwYXJlbnQgZWxlbWVudC5cblx0ICogQHBhcmFtIHtpbnR9IGhlYWRlckhlaWdodCAtIEZpeGVkIGhlYWRlciBoZWlnaHQgaW4gcGl4ZWxzLlxuXHQgKiBAcGFyYW0ge2ludH0gZm9vdGVySGVpZ2h0IC0gRml4ZWQgZm9vdGVyIGhlaWdodCBpbiBwaXhlbHMuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBoZWFkZXJIZWlnaHQsIGZvb3RlckhlaWdodCkge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ1R3b0NvbHVtbnNMYXlvdXQgY29uc3RydWN0b3InKTtcblx0XHR9XG5cdFx0XG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gNCkge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgaGVhZGVySGVpZ2h0LCBmb290ZXJIZWlnaHQpO1xuXHRcdH1cdFxuXHR9XG5cdFxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGhlYWRlckhlaWdodCwgZm9vdGVySGVpZ2h0KSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcblx0XHRcdHN1cGVyLmluaXQobmFtZSwgY29udGFpbmVyLCAnM0UnKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5oZWFkZXIuaGVpZ2h0ID0gaGVhZGVySGVpZ2h0O1xuXHRcdFx0dGhpcy5oZWFkZXIuaW1wbC5maXhTaXplKGZhbHNlLCB0cnVlKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5mb290ZXIuaGVpZ2h0ID0gZm9vdGVySGVpZ2h0O1xuXHRcdFx0dGhpcy5mb290ZXIuaW1wbC5maXhTaXplKGZhbHNlLCB0cnVlKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5pbXBsLnNldEF1dG9TaXplKFwiYTtiO2NcIiwgXCJiXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1BhZ2VMYXlvdXQgaW5pdCBtZXRob2QgcmVxdWlyZXMgNCBwYXJhbWV0ZXJzJyk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiogVGhlIG9ubHkgTGF5b3V0Q2VsbCBvYmplY3QgaW4gdGhlIGxheW91dCAqL1xuXHRnZXQgaGVhZGVyICgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGlsZHNbMF07XG5cdH1cblx0XG5cdGdldCBib2R5ICgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGlsZHNbMV07XHRcblx0fVxuXHRcblx0Z2V0IGZvb3RlciAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRzWzJdO1x0XG5cdH1cbn0iLCJcbmltcG9ydCB7IEJhc2VMYXlvdXQgfSBmcm9tICdsYXlvdXQvQmFzZUxheW91dCc7XG5cblxuZXhwb3J0IGNsYXNzIFdpbmRvd0xheW91dCBleHRlbmRzIEJhc2VMYXlvdXQge1xuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIFdpbmRvd0xheW91dCBvYmplY3Rcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IGNvbnRhaW5lciAtIE9iamVjdCBvciBkb20gaWQgb2YgdGhlIHBhcmVudCBlbGVtZW50LlxuXHQgKi9cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lcikge1xuXHRcdHN1cGVyKG5hbWUsIGNvbnRhaW5lciwgJzJFJyk7XG5cdH1cblxuXHRnZXQgYm9keSAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRzWzBdO1xuXHR9XG5cdFxuXHRnZXQgZm9vdGVyICgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGlsZHNbMV07XG5cdH1cbn0iLCJcbmltcG9ydCB7IE9CSkVDVF9UWVBFLCBERUJVRywgU0tJTiwgTUVOVV9JQ09OU19QQVRIIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnZ2xvYmFsL1V0aWwnO1xuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJ2FjdGlvbnMvQWN0aW9uJztcbmltcG9ydCB7IE1lbnVJdGVtIH0gZnJvbSAnbWVudS9NZW51SXRlbSc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgTWVudSBvYmplY3RzLCBzZWU6XG4gKiBodHRwOi8vZG9jcy5kaHRtbHguY29tL21lbnVfX2luZGV4Lmh0bWxcbiAqL1xuZXhwb3J0IGNsYXNzIE1lbnUgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblx0XG5cdC8qKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHttaXhlZH0gY29udGFpbmVyIC0gT2JqZWN0IG9yIGRvbSBpZCBvZiB0aGUgcGFyZW50IGVsZW1lbnQuXG5cdCAqIEBwYXJhbSB7YWN0aW9uTWFuYWdlcn0gQWN0aW9uTWFuYWdlciAtIENvbnRhaW5zIHRoZSBhY3Rpb25zIHRoZSBtZW51IHdpbGwgZXhlY3V0ZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpIHtcblx0XHRpZiAoREVCVUcpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdNZW51IGNvbnN0cnVjdG9yJyk7XG5cdFx0fVxuXG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcik7XG5cdFx0fVx0XG5cdH1cblxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpIHtcblxuXHRcdC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3Rcblx0XHR2YXIgaW1wbCA9IHRoaXMuaW5pdERodG1seE1lbnUoY29udGFpbmVyKTtcblx0XHRpbXBsLnNldEljb25zUGF0aChNRU5VX0lDT05TX1BBVEgpO1xuXG5cdFx0Ly8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxuXHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuTUVOVSwgY29udGFpbmVyLCBpbXBsKTtcblx0XHRcblx0XHQvLyBFbmFibGUgb25DbGljayBldmVudCBcblx0XHR0aGlzLmF0dGFjaEFjdGlvbk1hbmFnZXIoXCJvbkNsaWNrXCIsIGFjdGlvbk1hbmFnZXIpO1xuXHR9XG5cdFxuXHQvKipcblx0ICogQWRkcyBhIHRleHQgY29udGFpbmVyICh3aXRoIG5vIGFjdGlvbikgdG8gdGhlIG1lbnUuXG5cdCAqIEBwYXJhbSB7bWl4ZWR9IGNvbnRhaW5lciAtIE9iamVjdCBvciBkb20gaWQgb2YgdGhlIHBhcmVudCBlbGVtZW50LlxuXHQgKiBAcGFyYW0ge25hbWV9IHN0cmluZyAtIFRoZSBuYW1lIHRoYXQgaWRlbnRpZmllcyB0aGUgTWVudUl0ZW0uXG5cdCAqIEBwYXJhbSB7Y2FwdGlvbn0gc3RyaW5nIC0gVGhlIHZpc2libGUgdGV4dCBvZiB0aGUgY29udGFpbmVyLlxuXHQgKiBAcGFyYW0ge3BhcmVudE5hbWV9IHN0cmluZyAtIFRoZSBuYW1lIG9mIHRoZSBwYXJlbnQgTWVudUl0ZW0gKGRlZmF1bHQgbnVsbCkuXG5cdCAqIHJldHVybnMge01lbnV9IFRoZSBtZW51IG9iamVjdCBpdHNlbGYsIHRvIGNoYWluIGl0ZW0gY3JlYXRpb24uXG5cdCAqL1xuXHRhZGRUZXh0Q29udGFpbmVyIChuYW1lLCBjYXB0aW9uLCBwYXJlbnROYW1lID0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IG1lbnVJdGVtID0gbmV3IE1lbnVJdGVtKHBhcmVudE5hbWUsIG5hbWUsIG51bGwsIGNhcHRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTWVudUl0ZW0obWVudUl0ZW0pO1xuXHR9XG5cdFxuXHQvKipcblx0ICogQWRkcyBhIE1lbnVJdGVtICh3aXRoIGFjdGlvbikgdG8gdGhlIG1lbnUgY29udGFpbmVyIFxuXHQgKiBAcGFyYW0ge01lbnVJdGVtfSBtZW51SXRlbSAtIFRoZSBNZW51SXRlbSBvYmplY3QsIHVzdWFsbHkgY3JlYXRlZCBpbiB0aGUgQWN0aW9uTWFuYWdlclxuXHQgKiByZXR1cm5zIHtNZW51fSBUaGUgbWVudSBvYmplY3QgaXRzZWxmLCB0byBjaGFpbiBpdGVtIGNyZWF0aW9uXG5cdCAqL1xuXHRhZGRNZW51SXRlbSAobWVudUl0ZW0pIHtcblx0XHRpZiAodHlwZW9mIG1lbnVJdGVtLnBhcmVudE5hbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbnVJdGVtLnBhcmVudE5hbWUgPSBudWxsO1xuXHRcdH0gXG4gICAgICAgICAgICAgICAgdGhpcy5pbXBsLmFkZE5ld0NoaWxkKG1lbnVJdGVtLnBhcmVudE5hbWUsICh0aGlzLl9jaGlsZHMubGVuZ3RoKSwgbWVudUl0ZW0ubmFtZSwgbWVudUl0ZW0uY2FwdGlvbiwgZmFsc2UsIG1lbnVJdGVtLmljb24sIG1lbnVJdGVtLmljb25EaXNhYmxlZCk7XHRcdFxuXHRcdHRoaXMuX2NoaWxkcy5wdXNoKG1lbnVJdGVtKTtcblx0XHQvLyBjdXJyeWZpbmchXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKiogQ3JlYXRlcyB0aGUgZGh0bWxYTWVudU9iamVjdCBpbnNpZGUgaXRzIGNvbnRhaW5lci4gKi9cblx0aW5pdERodG1seE1lbnUoY29udGFpbmVyKSB7XG5cdFx0dmFyIGltcGwgPSBudWxsO1xuICAgICAgICAvLyBjb250YWluZXIgY2FuIGJlIG51bGxcblx0XHRpZiAoY29udGFpbmVyID09IG51bGwgfHwgVXRpbC5pc05vZGUoY29udGFpbmVyKSkge1xuXHRcdFx0aW1wbCA9IG5ldyBkaHRtbFhNZW51T2JqZWN0KGNvbnRhaW5lciwgU0tJTik7XG5cdFx0XHRcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTCAgXG5cdFx0XHR8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUXG5cdFx0XHR8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuV0lORE9XKSB7XG5cdFx0XHRcblx0XHRcdGltcGwgPSBjb250YWluZXIuaW1wbC5hdHRhY2hNZW51KCk7XG5cdFx0XHRpbXBsLnNldFNraW4oU0tJTik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignaW5pdERodG1seE1lbnU6IGNvbnRhaW5lciBpcyBub3QgdmFsaWQuJyk7XG5cdFx0fVxuXHRcdHJldHVybiBpbXBsO1xuXHR9XG5cdFxuXHRzZXQgY2hpbGRzIChtZW51SXRlbXMpIHtcblx0XHQvLyBDbGVhbiBhcnJheSBmaXJzdFxuXHRcdHRoaXMuX2NoaWxkcyA9IFtdO1xuXHRcdFxuXHRcdC8vIFBvcHVsYXRlIGFycmF5XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtZW51SXRlbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMuYWRkTWVudUl0ZW0obWVudUl0ZW1zW2ldKTtcblx0XHR9XG5cdH1cbn0iLCJcbmltcG9ydCB7IE9CSkVDVF9UWVBFLCBERUJVRywgU0tJTiB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgTWVudSB9IGZyb20gJ21lbnUvTWVudSc7XG5cbmV4cG9ydCBjbGFzcyBDb250ZXh0TWVudSBleHRlbmRzIE1lbnUge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcikge1xuICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb250ZXh0TWVudSBjb25zdHJ1Y3RvcicpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaW5pdCAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKSB7XG4gICAgICAgIFxuICAgICAgICAvLyBNZW51IGluaXQgbWV0aG9kLCBjb250YWluZXIgbXVzdCBiZSBudWxsXG4gICAgICAgIHN1cGVyLmluaXQobmFtZSwgbnVsbCwgYWN0aW9uTWFuYWdlcik7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgIGNvbnRhaW5lci5jaGlsZHMucHVzaCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW1wbC5yZW5kZXJBc0NvbnRleHRNZW51KCk7XG4gICAgICAgIFxuICAgICAgICBpZiAodHlwZW9mIGNvbnRhaW5lciA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgIHRoaXMuaW1wbC5pc0NvbnRleHRab25lKGNvbnRhaW5lci5pbXBsKSkge1xuICAgICAgICAgICAgdGhpcy5pbXBsLmFkZENvbnRleHRab25lKGNvbnRhaW5lci5pbXBsKTsgICAgXG4gICAgICAgIFxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5HUklEICBcbiAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UUkVFKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnRhaW5lci5pbXBsLmVuYWJsZUNvbnRleHRNZW51KHRoaXMuaW1wbCk7XG4gICAgICAgIH1cbiAgICB9XG59IiwiXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcsIFRSRUVfSUNPTlNfUEFUSCB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XG5cbi8qKlxuICAqIEJhc2UgY2xhc3MgZm9yIGFsbCBUcmVlVmlldyBvYmplY3RzLCBzZWU6XG4gICogaHR0cDovL2RvY3MuZGh0bWx4LmNvbS90cmVldmlld19faW5kZXguaHRtbFxuICAqL1xuZXhwb3J0IGNsYXNzIEJhc2VUcmVlIGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cblx0Y29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcblx0XHRpZiAoREVCVUcpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdCYXNlVHJlZSBjb25zdHJ1Y3RvcicpO1xuXHRcdH1cblxuXHRcdC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxuXHRcdHN1cGVyKCk7XG5cdFx0XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcik7XG5cdFx0fVxuXHR9XG5cblx0aW5pdCAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyID0gbnVsbCkge1xuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xuXG5cdFx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXG5cdFx0XHR2YXIgaW1wbCA9IHRoaXMuaW5pdERodG1seFRyZWUoY29udGFpbmVyKTtcblx0XHRcdGltcGwuc2V0U2tpbihTS0lOKTtcblx0XHRcdGltcGwuc2V0SWNvbnNQYXRoKFRSRUVfSUNPTlNfUEFUSCk7XG5cblx0XHRcdC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2Rcblx0XHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuVFJFRSwgY29udGFpbmVyLCBpbXBsKTtcblx0XHRcdFxuXHRcdFx0Ly8gRW5hYmxlIG9uU2VsZWN0IGV2ZW50IFxuXHRcdFx0aWYgKGFjdGlvbk1hbmFnZXIgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLmF0dGFjaEFjdGlvbk1hbmFnZXIoXCJvblNlbGVjdFwiLCBhY3Rpb25NYW5hZ2VyKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Jhc2VUcmVlIGluaXQgbWV0aG9kIHJlcXVpcmVzIDIgcGFyYW1ldGVycycpO1xuXHRcdH1cblx0fVxuXG5cdGFkZEl0ZW0gKHRyZWVJdGVtKSB7XG5cblx0XHR0aGlzLmltcGwuYWRkSXRlbSh0cmVlSXRlbS5pZCwgdHJlZUl0ZW0udGV4dCwgdHJlZUl0ZW0ucGFyZW50SWQpO1xuXHRcdHRoaXMuX2NoaWxkc1t0cmVlSXRlbS5pZF0gPSB0cmVlSXRlbS5hY3Rpb247XG5cdH1cblx0XG5cdGxvYWQgKHVybCwgdHlwZSA9ICdqc29uJykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLmltcGwubG9hZCh1cmwsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XG5cdFx0XHRcdH0sIHR5cGUpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRyZWplY3QoZSk7XG5cdFx0XHR9XG5cdFx0fSk7XHRcdFxuXHR9XG5cblx0aW5pdERodG1seFRyZWUgKGNvbnRhaW5lcikge1xuXG5cdFx0dmFyIGltcGwgPSBudWxsO1xuXHRcdGlmIChVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XG5cdFx0XHQvLyBjYWxsIHRvIGRodG1seCBvYmplY3QgY29uc3RydWN0b3IgXG5cdFx0XHRpbXBsID0gbmV3IGRodG1sWFRyZWVPYmplY3QoY29udGFpbmVyLCBcIjEwMCVcIiwgXCIxMDAlXCIsIDApO1xuXHRcdFxuXHRcdH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVF9DRUxMIHx8XG5cdFx0XHRjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuQUNDT1JESU9OX0NFTEwpIHtcblx0XHRcdGltcGwgPSBjb250YWluZXIuaW1wbC5hdHRhY2hUcmVlKCk7XG5cdFx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdpbml0RGh0bWx4VHJlZTogY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcblx0XHR9XG5cdFx0cmV0dXJuIGltcGw7XG5cdH1cbn1cbiIsIlxuXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuXG5leHBvcnQgY2xhc3MgVGFiYmFyIGV4dGVuZHMgQmFzZU9iamVjdCB7XG4gICAgXG4gICAgY29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lcikge1xuICAgICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUYWJiYXIgY29uc3RydWN0b3InKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgdGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaW5pdCAobmFtZSwgY29udGFpbmVyKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3QgKHNlZSBmdW5jdGlvbiBiZWxvdylcbiAgICAgICAgICAgIHZhciBpbXBsID0gdGhpcy5pbml0RGh0bWx4VGFiYmFyKGNvbnRhaW5lcik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2RcbiAgICAgICAgICAgIHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuVEFCQkFSLCBjb250YWluZXIsIGltcGwpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RhYmJhciBpbml0IG1ldGhvZCByZXF1aXJlcyAyIHBhcmFtZXRlcnMnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpbml0RGh0bWx4VGFiYmFyIChjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGltcGwgPSBudWxsO1xuICAgICAgICBpZiAoVXRpbC5pc05vZGUoY29udGFpbmVyKSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbXBsID0gbmV3IGRodG1sWFRhYkJhcih7XG4gICAgICAgICAgICAgICAgcGFyZW50OiBjb250YWluZXIsXG4gICAgICAgICAgICAgICAgc2tpbjogU0tJTlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIGlmIChjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUX0NFTExcbiAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5BQ0NPUkRJT05fQ0VMTFxuICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLldJTkRPV1xuICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLlRBQikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbXBsID0gY29udGFpbmVyLmltcGwuYXR0YWNoVGFiYmFyKCk7XG4gICAgICAgICAgICBpbXBsLnNldFNraW4oU0tJTik7XG4gICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdpbml0RGh0bWx4VGFiYmFyOiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xuXHRcdH1cbiAgICAgICAgcmV0dXJuIGltcGw7XG4gICAgfVxufSIsIlxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIFNLSU4sIERFQlVHIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuXG5leHBvcnQgY2xhc3MgVGFiIGV4dGVuZHMgQmFzZU9iamVjdCB7XG4gICAgXG4gICAgY29uc3RydWN0b3IgKG5hbWUsIGNvbnRhaW5lciwgaWQsIHRleHQsIHBvc2l0aW9uID0gbnVsbCwgYWN0aXZlID0gZmFsc2UsIGNsb3NlID0gZmFsc2UpIHtcbiAgICAgICAgXG4gICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RhYiBjb25zdHJ1Y3RvcicpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIGlkLCB0ZXh0LCBwb3NpdGlvbiwgYWN0aXZlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgaW5pdCAobmFtZSwgY29udGFpbmVyLCBpZCwgdGV4dCwgcG9zaXRpb24gPSBudWxsLCBhY3RpdmUgPSBmYWxzZSwgY2xvc2UgPSBmYWxzZSkge1xuICAgICAgICBcbiAgICAgICAgLy8gVE9ETyBjaGVjayB0aGF0IGNvbnRhaW5lciBtdXN0IGJlIGEgVGFiYmFyIG9iamVjdFxuICAgICAgICBjb250YWluZXIuaW1wbC5hZGRUYWIoaWQsIHRleHQsIG51bGwsIHBvc2l0aW9uLCBhY3RpdmUsIGNsb3NlKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBpbXBsID0gY29udGFpbmVyLmltcGwudGFicyhpZCk7XG4gICAgICAgIFxuICAgICAgICAgLy8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxuICAgICAgICBzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLlRBQiwgY29udGFpbmVyLCBpbXBsKTtcbiAgICB9XG59XG4iLCJcblxuaW1wb3J0IHsgT0JKRUNUX1RZUEUsIFNLSU4sIERFQlVHIH0gZnJvbSAnZ2xvYmFsL2NvbmZpZyc7XG5pbXBvcnQgeyBVdGlsIH0gZnJvbSAnZ2xvYmFsL1V0aWwnO1xuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcblxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbiBleHRlbmRzIEJhc2VPYmplY3Qge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIpIHtcbiAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQWNjb3JkaW9uIGNvbnN0cnVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFdlIHdpbGwgaW5pdCB0aGUgQmFzZU9iamVjdCBwcm9wZXJ0aWVzIGluIHRoZSBpbml0IG1ldGhvZFxuICAgICAgICBzdXBlcigpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGluaXQgKG5hbWUsIGNvbnRhaW5lcikge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0IChzZWUgZnVuY3Rpb24gYmVsb3cpXG4gICAgICAgICAgICB2YXIgaW1wbCA9IHRoaXMuaW5pdERodG1seEFjY29yZGlvbihjb250YWluZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXG4gICAgICAgICAgICBzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLlRBQkJBUiwgY29udGFpbmVyLCBpbXBsKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYWJiYXIgaW5pdCBtZXRob2QgcmVxdWlyZXMgMiBwYXJhbWV0ZXJzJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaW5pdERodG1seEFjY29yZGlvbiAoY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBpbXBsID0gbnVsbDtcbiAgICAgICAgaWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW1wbCA9IG5ldyBkaHRtbFhBY2NvcmRpb24oe1xuICAgICAgICAgICAgICAgIHBhcmVudDogY29udGFpbmVyLFxuICAgICAgICAgICAgICAgIHNraW46IFNLSU5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVF9DRUxMXG4gICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkFDQ09SRElPTl9DRUxMXG4gICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLlRBQlxuICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5XSU5ET1cpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaEFjY29yZGlvbigpO1xuICAgICAgICAgICAgaW1wbC5zZXRTa2luKFNLSU4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbml0RGh0bWx4QWNjb3JkaW9uOiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbXBsO1xuICAgIH1cbn0iLCJcbmltcG9ydCB7IE9CSkVDVF9UWVBFLCBTS0lOLCBERUJVRyB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgQmFzZU9iamVjdCB9IGZyb20gJ2dsb2JhbC9CYXNlT2JqZWN0JztcblxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbkNlbGwgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcbiAgICBcbiAgICBjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBpZCwgdGV4dCwgb3BlbiA9IGZhbHNlLCBoZWlnaHQgPSBudWxsLCBpY29uID0gbnVsbCkge1xuICAgICAgICBcbiAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQWNjb3JkaW9uQ2VsbCBjb25zdHJ1Y3RvcicpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2RcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIGlkLCB0ZXh0LCBvcGVuLCBoZWlnaHQsIGljb24pO1xuICAgICAgICB9XG4gICAgfSAgICBcbiAgICBcbiAgICBpbml0IChuYW1lLCBjb250YWluZXIsIGlkLCB0ZXh0LCBvcGVuID0gZmFsc2UsIGhlaWdodCA9IG51bGwsIGljb24gPSBudWxsKSB7XG4gICAgICAgIFxuICAgICAgICAvLyBUT0RPIGNoZWNrIHRoYXQgY29udGFpbmVyIG11c3QgYmUgYSBBY2NvcmRpb24gb2JqZWN0XG4gICAgICAgIGNvbnRhaW5lci5pbXBsLmFkZEl0ZW0oaWQsIHRleHQsIG9wZW4sIGhlaWdodCwgaWNvbik7XG4gICAgICAgIFxuICAgICAgICB2YXIgaW1wbCA9IGNvbnRhaW5lci5pbXBsLmNlbGxzKGlkKTtcbiAgICAgICAgXG4gICAgICAgICAvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXG4gICAgICAgIHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuQUNDT1JESU9OX0NFTEwsIGNvbnRhaW5lciwgaW1wbCk7XG4gICAgfVxufVxuIiwiXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgREVCVUcsIFNLSU4sIFRPT0xCQVJfSUNPTlNfUEFUSCB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XG5cbmV4cG9ydCBjbGFzcyBUb29sYmFyIGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cdFxuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKSB7XG5cdFx0aWYgKERFQlVHKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnVG9vbGJhciBjb25zdHJ1Y3RvcicpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2Rcblx0XHRzdXBlcigpO1xuXHRcdFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG5cdFx0XHR0aGlzLmluaXQobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyKTtcblx0XHR9XG5cdH1cblx0XG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcikge1xuXHRcdC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3QgKHNlZSBmdW5jdGlvbiBiZWxvdylcblx0XHR2YXIgaW1wbCA9IGluaXREaHRtbHhUb29sYmFyKGNvbnRhaW5lcik7XG5cdFx0aW1wbC5zZXRJY29uc1BhdGgoVE9PTEJBUl9JQ09OU19QQVRIKTtcblx0XHRcblx0XHQvLyBCYXNlT2JqZWN0IGNvbnN0cnVjdG9yXG5cdFx0c3VwZXIuaW5pdChuYW1lLCBPQkpFQ1RfVFlQRS5UT09MQkFSLCBjb250YWluZXIsIGltcGwpO1xuXHRcdFxuXHRcdHRoaXMuYXR0YWNoQWN0aW9uTWFuYWdlcihcIm9uQ2xpY2tcIiwgYWN0aW9uTWFuYWdlcik7XG5cdFx0dGhpcy5hdHRhY2hBY3Rpb25NYW5hZ2VyKFwib25TdGF0ZUNoYW5nZVwiLCBhY3Rpb25NYW5hZ2VyKTtcblx0fVxuXHRcblx0YWRkVG9vbGJhckJ1dHRvbiAodG9vbGJhckl0ZW0pIHtcblx0XHR0aGlzLmltcGwuYWRkQnV0dG9uKHRvb2xiYXJJdGVtLm5hbWUsICh0aGlzLmNoaWxkcy5sZW5ndGgpLCB0b29sYmFySXRlbS5jYXB0aW9uLCB0b29sYmFySXRlbS5pY29uLCB0b29sYmFySXRlbS5pY29uRGlzYWJsZWQpO1xuXHRcdHRoaXMuY2hpbGRzLnB1c2godG9vbGJhckl0ZW0uYWN0aW9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFRvb2x0aXAodG9vbGJhckl0ZW0ubmFtZSwgdG9vbGJhckl0ZW0udG9vbHRpcCk7XG5cdFx0XG5cdFx0Ly8gY3VycnlmaW5nIVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdFxuXHRhZGRUb29sYmFyQnV0dG9uVHdvU3RhdGUgKHRvb2xiYXJJdGVtKSB7XG5cdFx0dGhpcy5pbXBsLmFkZEJ1dHRvblR3b1N0YXRlKHRvb2xiYXJJdGVtLm5hbWUsICh0aGlzLmNoaWxkcy5sZW5ndGgpLCB0b29sYmFySXRlbS5jYXB0aW9uLCB0b29sYmFySXRlbS5pY29uLCB0b29sYmFySXRlbS5pY29uRGlzYWJsZWQpO1xuXHRcdHRoaXMuY2hpbGRzLnB1c2godG9vbGJhckl0ZW0uYWN0aW9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFRvb2x0aXAodG9vbGJhckl0ZW0ubmFtZSwgdG9vbGJhckl0ZW0udG9vbHRpcCk7XG5cdFx0XG5cdFx0Ly8gY3VycnlmaW5nIVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdFxuXHRhZGRUb29sYmFyQnV0dG9uU2VsZWN0ICh0b29sYmFySXRlbSkge1xuXHRcdHRoaXMuaW1wbC5hZGRCdXR0b25TZWxlY3QodG9vbGJhckl0ZW0ubmFtZSwgKHRoaXMuY2hpbGRzLmxlbmd0aCksIHRvb2xiYXJJdGVtLmNhcHRpb24sIFtdLCB0b29sYmFySXRlbS5pY29uLCB0b29sYmFySXRlbS5pY29uRGlzYWJsZWQpO1xuXHRcdHRoaXMuY2hpbGRzLnB1c2godG9vbGJhckl0ZW0uYWN0aW9uKTtcbiAgICAgICAgdGhpcy5hZGRUb29sdGlwKHRvb2xiYXJJdGVtLm5hbWUsIHRvb2xiYXJJdGVtLnRvb2x0aXApO1xuXHRcdFxuXHRcdC8vIGN1cnJ5ZmluZyFcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRcblx0YWRkVG9vbGJhckxpc3RPcHRpb24gKHBhcmVudCwgdG9vbGJhckl0ZW0pIHtcblx0XHR0aGlzLmltcGwuYWRkTGlzdE9wdGlvbihwYXJlbnQsIHRvb2xiYXJJdGVtLm5hbWUsICh0aGlzLmNoaWxkcy5sZW5ndGgpLCAnYnV0dG9uJywgdG9vbGJhckl0ZW0uY2FwdGlvbiwgdG9vbGJhckl0ZW0uaWNvbik7XG5cdFx0dGhpcy5jaGlsZHMucHVzaCh0b29sYmFySXRlbS5hY3Rpb24pO1xuICAgICAgICB0aGlzLmFkZFRvb2x0aXAodG9vbGJhckl0ZW0ubmFtZSwgdG9vbGJhckl0ZW0udG9vbHRpcCk7XG5cdFx0XG5cdFx0Ly8gY3VycnlmaW5nIVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdFxuXHRhZGRTZXBhcmF0b3IgKHRvb2xiYXJJdGVtKSB7XG5cdFx0dGhpcy5pbXBsLmFkZFNlcGFyYXRvcih0b29sYmFySXRlbS5uYW1lLCAodGhpcy5jaGlsZHMubGVuZ3RoKSk7XG5cdFx0XG5cdFx0Ly8gY3VycnlmaW5nIVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0YWRkTGlzdFNlcGFyYXRvciAocGFyZW50LCB0b29sYmFySXRlbSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1wbC5hZGRMaXN0T3B0aW9uKHBhcmVudCwgdG9vbGJhckl0ZW0ubmFtZSwgKHRoaXMuY2hpbGRzLmxlbmd0aCksICdzZXBhcmF0b3InKTtcblxuICAgICAgICAgICAgICAgIC8vIGN1cnJ5ZmluZyFcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG5cdFxuXHRhZGRUZXh0ICh0b29sYmFySXRlbSkge1xuXHRcdHRoaXMuaW1wbC5hZGRUZXh0KHRvb2xiYXJJdGVtLm5hbWUsICh0aGlzLmNoaWxkcy5sZW5ndGgpLCB0b29sYmFySXRlbS5jYXB0aW9uKTtcblx0XHRcblx0XHQvLyBjdXJyeWZpbmchXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0XG5cdGFkZElucHV0ICh0b29sYmFySXRlbSwgd2lkdGgpIHtcblx0XHR0aGlzLmltcGwuYWRkSW5wdXQodG9vbGJhckl0ZW0ubmFtZSwgKHRoaXMuY2hpbGRzLmxlbmd0aCksIHRvb2xiYXJJdGVtLmNhcHRpb24sIHdpZHRoKTtcblx0XHRcblx0XHQvLyBjdXJyeWZpbmchXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0XG5cdGFkZFRvb2x0aXAgKG5hbWUsIHRleHQpIHtcblx0XHRpZiAodHlwZW9mIHRleHQgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHR0aGlzLmltcGwuc2V0SXRlbVRvb2xUaXAobmFtZSwgdGV4dCk7XG5cdFx0fVxuICAgIH1cbn1cblxuLyoqIENyZWF0ZXMgdGhlIGRodG1sWFRvb2xiYXJPYmplY3QgaW5zaWRlIGl0cyBjb250YWluZXIuICovXG5mdW5jdGlvbiBpbml0RGh0bWx4VG9vbGJhciAoY29udGFpbmVyKSB7XG5cdHZhciBpbXBsID0gbnVsbDtcblx0aWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcblx0XHRpbXBsID0gbmV3IGRodG1sWFRvb2xiYXJPYmplY3QoY29udGFpbmVyLCBTS0lOKTtcblx0XHRcblx0fSBlbHNlIGlmIChjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUX0NFTExcbiAgICAgICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuQUNDT1JESU9OX0NFTExcblx0XHR8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuTEFZT1VUXG5cdFx0fHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLldJTkRPV1xuICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UQUIpIHtcblx0XHRcblx0XHRpbXBsID0gY29udGFpbmVyLmltcGwuYXR0YWNoVG9vbGJhcigpO1xuXHRcdGltcGwuc2V0U2tpbihTS0lOKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ2luaXREaHRtbHhUb29sYmFyOiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xuXHR9XG5cdHJldHVybiBpbXBsO1xufVxuIiwiXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcsIEdSSURfSUNPTlNfUEFUSCB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XG5cbmV4cG9ydCBjbGFzcyBCYXNlR3JpZCBleHRlbmRzIEJhc2VPYmplY3Qge1xuXG5cdGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIgPSBudWxsKSB7XG5cdFx0aWYgKERFQlVHKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnQmFzZUdyaWQgY29uc3RydWN0b3InKTtcblx0XHR9XG5cblx0XHQvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2Rcblx0XHRzdXBlcigpO1xuXHRcdFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcblx0XHRcdHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpO1xuXHRcdH1cblx0fVxuXG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlciA9IG51bGwpIHtcblxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcblxuXHRcdFx0Ly8gQ3JlYXRlcyB0aGUgZGh0bWx4IG9iamVjdCAoc2VlIGZ1bmN0aW9uIGJlbG93KVxuXHRcdFx0dmFyIGltcGwgPSB0aGlzLmluaXREaHRtbHhHcmlkKGNvbnRhaW5lcik7XG5cdFx0XHRpbXBsLnNldFNraW4oU0tJTik7XG5cdFx0XHRpbXBsLnNldEljb25zUGF0aChHUklEX0lDT05TX1BBVEgpO1xuXG5cdFx0XHQvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXG5cdFx0XHRzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLkdSSUQsIGNvbnRhaW5lciwgaW1wbCk7XG5cdFx0XHRcblx0XHRcdC8vIEVuYWJsZSBvblNlbGVjdCBldmVudCBcblx0XHRcdGlmIChhY3Rpb25NYW5hZ2VyICE9IG51bGwpIHtcblx0XHRcdFx0dGhpcy5hdHRhY2hBY3Rpb25NYW5hZ2VyKFwib25TZWxlY3RcIiwgYWN0aW9uTWFuYWdlcik7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdCYXNlR3JpZCBpbml0IG1ldGhvZCByZXF1aXJlcyAyIHBhcmFtZXRlcnMnKTtcblx0XHR9XG5cdH1cblx0XG5cdGxvYWQgKHVybCwgdHlwZSA9ICdqc29uJykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLmltcGwubG9hZCh1cmwsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XG5cdFx0XHRcdH0sIHR5cGUpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRyZWplY3QoZSk7XG5cdFx0XHR9XG5cdFx0fSk7XHRcdFxuXHR9XG5cblx0aW5pdERodG1seEdyaWQgKGNvbnRhaW5lcikge1xuXG5cdFx0dmFyIGltcGwgPSBudWxsO1xuXHRcdGlmIChVdGlsLmlzTm9kZShjb250YWluZXIpKSB7XG5cdFx0XHRcblx0XHRcdGltcGwgPSBuZXcgZGh0bWxYR3JpZE9iamVjdChjb250YWluZXIpO1xuXHRcdFxuXHRcdH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVF9DRUxMXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuQUNDT1JESU9OX0NFTExcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5UQUJcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5XSU5ET1cpIHtcdFx0XG5cdFx0XHRpbXBsID0gY29udGFpbmVyLmltcGwuYXR0YWNoR3JpZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2luaXREaHRtbHhUb29sYmFyOiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xuXHRcdH1cblx0XHRyZXR1cm4gaW1wbDtcblx0fVxufVxuIiwiXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgU0tJTiwgREVCVUcsIEdSSURfSUNPTlNfUEFUSCB9IGZyb20gJ2dsb2JhbC9jb25maWcnO1xuaW1wb3J0IHsgVXRpbCB9IGZyb20gJ2dsb2JhbC9VdGlsJztcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XG5cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eUdyaWQgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblx0XG5cdGNvbnN0cnVjdG9yIChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIgPSBudWxsKSB7XG5cdFx0aWYgKERFQlVHKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnQmFzZUdyaWQgY29uc3RydWN0b3InKTtcblx0XHR9XG5cblx0XHQvLyBXZSB3aWxsIGluaXQgdGhlIEJhc2VPYmplY3QgcHJvcGVydGllcyBpbiB0aGUgaW5pdCBtZXRob2Rcblx0XHRzdXBlcigpO1xuXHRcdFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcblx0XHRcdHRoaXMuaW5pdChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIpO1xuXHRcdH1cblx0fVxuXHRcblx0aW5pdCAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyID0gbnVsbCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcblxuXHRcdFx0Ly8gQ3JlYXRlcyB0aGUgZGh0bWx4IG9iamVjdCAoc2VlIGZ1bmN0aW9uIGJlbG93KVxuXHRcdFx0dmFyIGltcGwgPSB0aGlzLmluaXREaHRtbHhQcm9wZXJ0eUdyaWQoY29udGFpbmVyKTtcblx0XHRcdGltcGwuc2V0U2tpbihTS0lOKTtcblx0XHRcdGltcGwuc2V0SWNvbnNQYXRoKEdSSURfSUNPTlNfUEFUSCk7XG5cblx0XHRcdC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2Rcblx0XHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuR1JJRCwgY29udGFpbmVyLCBpbXBsKTtcblx0XHRcdFxuXHRcdFx0Ly8gRW5hYmxlIG9uU2VsZWN0IGV2ZW50IFxuXHRcdFx0aWYgKGFjdGlvbk1hbmFnZXIgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLmF0dGFjaEFjdGlvbk1hbmFnZXIoXCJvblNlbGVjdFwiLCBhY3Rpb25NYW5hZ2VyKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5R3JpZCBpbml0IG1ldGhvZCByZXF1aXJlcyAyIHBhcmFtZXRlcnMnKTtcblx0XHR9XG5cdH1cblx0XG5cdGluaXREaHRtbHhQcm9wZXJ0eUdyaWQgKGNvbnRhaW5lcikge1xuXHRcdFxuXHRcdHZhciBpbXBsID0gbnVsbDtcblx0XHRpZiAoVXRpbC5pc05vZGUoY29udGFpbmVyKSkge1xuXHRcdFx0XG5cdFx0XHRpbXBsID0gbmV3IGRodG1sWFByb3BlcnR5R3JpZChjb250YWluZXIpO1xuXHRcdFxuXHRcdH0gZWxzZSBpZiAoY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkxBWU9VVF9DRUxMIHx8XG5cdFx0XHRjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuV0lORE9XIHx8XG5cdFx0XHRjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuVEFCKSB7XG5cdFx0XHRcdFxuXHRcdFx0aW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaFByb3BlcnR5R3JpZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2luaXREaHRtbHhUb29sYmFyOiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xuXHRcdH1cblx0XHRyZXR1cm4gaW1wbDtcblx0fVxufVxuIiwiXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgREVCVUcsIFNLSU4gfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuXG5leHBvcnQgY2xhc3MgRm9ybSBleHRlbmRzIEJhc2VPYmplY3Qge1xuXHRcdFxuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBhY3Rpb25NYW5hZ2VyID0gbnVsbCkge1xuXHRcdGlmIChERUJVRykge1xuXHRcdFx0Y29uc29sZS5sb2coJ0Zvcm0gY29uc3RydWN0b3InKTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgYWN0aW9uTWFuYWdlcik7XG5cdFx0fVxuXHR9XG5cdFxuXHRpbml0IChuYW1lLCBjb250YWluZXIsIGFjdGlvbk1hbmFnZXIgPSBudWxsKSB7XG5cblx0XHQvLyBDcmVhdGVzIHRoZSBkaHRtbHggb2JqZWN0XG5cdFx0dmFyIGltcGwgPSB0aGlzLmluaXREaHRtbHhGb3JtKGNvbnRhaW5lcik7XG5cdFx0aW1wbC5zZXRTa2luKFNLSU4pO1xuXG5cdFx0Ly8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxuXHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuRk9STSwgY29udGFpbmVyLCBpbXBsKTtcblx0fVxuXHRcblx0aW5pdERodG1seEZvcm0gKGNvbnRhaW5lcikge1xuXHRcdHZhciBpbXBsID0gbnVsbDtcblx0XHRpZiAoVXRpbC5pc05vZGUoY29udGFpbmVyKSkge1xuXHRcdFx0aW1wbCA9IG5ldyBkaHRtbFhGb3JtKGNvbnRhaW5lciwgbnVsbCk7XG5cdFx0XHRcblx0XHR9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTFxuICAgICAgICAgICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuQUNDT1JESU9OX0NFTExcbiAgICAgICAgICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLldJTkRPV1xuICAgICAgICAgICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuVEFCKSB7XG5cdFx0XHRcblx0XHRcdGltcGwgPSBjb250YWluZXIuaW1wbC5hdHRhY2hGb3JtKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignaW5pdERodG1seEZvcm06IGNvbnRhaW5lciBpcyBub3QgdmFsaWQuJyk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBpbXBsO1xuXHR9XG59IiwiXG5pbXBvcnQgeyBPQkpFQ1RfVFlQRSwgREVCVUcsIFNLSU4gfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IFV0aWwgfSBmcm9tICdnbG9iYWwvVXRpbCc7XG5pbXBvcnQgeyBCYXNlT2JqZWN0IH0gZnJvbSAnZ2xvYmFsL0Jhc2VPYmplY3QnO1xuXG5leHBvcnQgY2xhc3MgVmF1bHQgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblxuICBjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCBvcHRpb25zLCBhY3Rpb25NYW5hZ2VyID0gbnVsbCkge1xuXHRpZiAoREVCVUcpIHtcblx0XHRjb25zb2xlLmxvZygnVmF1bHQgY29uc3RydWN0b3InKTtcblx0fVxuXHRcblx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdHN1cGVyKCk7XG5cdFxuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSB7XG5cdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgb3B0aW9ucywgYWN0aW9uTWFuYWdlcik7XG5cdH1cbiAgfVxuICBcbiAgaW5pdCAobmFtZSwgY29udGFpbmVyLCBvcHRpb25zLCBhY3Rpb25NYW5hZ2VyID0gbnVsbCkge1xuXG4gICAgICAgIC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3RcbiAgICAgICAgdmFyIGltcGwgPSB0aGlzLmluaXREaHRtbHhWYXVsdChjb250YWluZXIsIG9wdGlvbnMpO1xuICAgICAgICBpbXBsLnNldFNraW4oU0tJTik7XG5cbiAgICAgICAgLy8gQmFzZU9iamVjdCBpbml0IG1ldGhvZFxuICAgICAgICBzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLlZBVUxULCBjb250YWluZXIsIGltcGwpO1xuICB9XG4gICAgXG4gIGluaXREaHRtbHhWYXVsdCAoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBpbXBsID0gbnVsbDtcbiAgICAgICAgaWYgKFV0aWwuaXNOb2RlKGNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICAgICBpbXBsID0gbmV3IGRodG1sWFZhdWx0T2JqZWN0KG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRhaW5lci50eXBlID09PSBPQkpFQ1RfVFlQRS5MQVlPVVRfQ0VMTFxuICAgICAgICAgICAgfHwgY29udGFpbmVyLnR5cGUgPT09IE9CSkVDVF9UWVBFLkFDQ09SRElPTl9DRUxMXG4gICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuV0lORE9XXG4gICAgICAgICAgICB8fCBjb250YWluZXIudHlwZSA9PT0gT0JKRUNUX1RZUEUuVEFCKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW1wbCA9IGNvbnRhaW5lci5pbXBsLmF0dGFjaFZhdWx0KG9wdGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW5pdERodG1seFZhdWx0OiBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaW1wbDtcbiAgfVxufVxuIiwiXG5pbXBvcnQgeyBERUJVRywgT0JKRUNUX1RZUEUgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XG5pbXBvcnQgeyB3aW5kb3dNYW5hZ2VyIH0gZnJvbSAnd2luZG93L1dpbmRvd01hbmFnZXInO1xuXG4vKipcbiAgKiBcbiAgKi9cdCBcbmV4cG9ydCBjbGFzcyBXaW5kb3cgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblxuXHRjb25zdHJ1Y3RvciAobmFtZSwgY29udGFpbmVyLCB3aWR0aCwgaGVpZ2h0KSB7XG5cdFx0aWYgKERFQlVHKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnV2luZG93IGNvbnN0cnVjdG9yJyk7XG5cdFx0fVxuXG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gNCkge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUsIGNvbnRhaW5lciwgd2lkdGgsIGhlaWdodCk7XG5cdFx0fVxuXHR9XG5cblx0aW5pdCAobmFtZSwgY29udGFpbmVyLCB3aWR0aCwgaGVpZ2h0KSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1wbCA9IHdpbmRvd01hbmFnZXIuY3JlYXRlKG5hbWUsIHdpZHRoLCBoZWlnaHQpO1xuXG5cdFx0XHQvLyBCYXNlT2JqZWN0IGluaXQgbWV0aG9kXG5cdFx0XHRzdXBlci5pbml0KG5hbWUsIE9CSkVDVF9UWVBFLldJTkRPVywgY29udGFpbmVyLCBpbXBsKTtcblxuXHRcdFx0Ly8gQ2VudGVyZWQgYnkgZGVmYXVsdFxuXHRcdFx0aW1wbC5jZW50ZXJPblNjcmVlbigpO1xuXG5cdFx0XHQvLyBNb2RhbCBieSBkZWZhdWx0XG5cdFx0XHRpbXBsLnNldE1vZGFsKHRydWUpO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignV2luZG93IGluaXQgbWV0aG9kIHJlcXVpcmVzIDMgcGFyYW1ldGVycycpO1xuXHRcdH1cblx0fVxufSIsIlxuXG5pbXBvcnQgeyBTS0lOLCBERUJVRywgT0JKRUNUX1RZUEUgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcbmltcG9ydCB7IEJhc2VPYmplY3QgfSBmcm9tICdnbG9iYWwvQmFzZU9iamVjdCc7XG5pbXBvcnQgeyBXaW5kb3cgfSBmcm9tICd3aW5kb3cvV2luZG93JztcblxuXG5jbGFzcyBXaW5kb3dNYW5hZ2VyIGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cblx0Y29uc3RydWN0b3IgKG5hbWUpIHtcblx0XHRpZiAoREVCVUcpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdXaW5kb3dNYW5hZ2VyIGNvbnN0cnVjdG9yJyk7XG5cdFx0fVxuXG5cdFx0Ly8gV2Ugd2lsbCBpbml0IHRoZSBCYXNlT2JqZWN0IHByb3BlcnRpZXMgaW4gdGhlIGluaXQgbWV0aG9kXG5cdFx0c3VwZXIoKTtcblx0XHRcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0dGhpcy5pbml0KG5hbWUpO1xuXHRcdH1cblx0fVxuXG5cdGluaXQgKG5hbWUsIGNvbnRhaW5lcikge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG5cblx0XHRcdC8vIENyZWF0ZXMgdGhlIGRodG1seCBvYmplY3QgKHNlZSBmdW5jdGlvbiBiZWxvdylcblx0XHRcdHZhciBpbXBsID0gbmV3IGRodG1sWFdpbmRvd3MoU0tJTik7XG5cblx0XHRcdC8vIEJhc2VPYmplY3QgaW5pdCBtZXRob2Rcblx0XHRcdHN1cGVyLmluaXQobmFtZSwgT0JKRUNUX1RZUEUuV0lORE9XX01BTkFHRVIsIG51bGwsIGltcGwpO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignV2luZG93TWFuYWdlciBpbml0IG1ldGhvZCByZXF1aXJlcyAxIHBhcmFtZXRlcicpO1xuXHRcdH1cblx0fVxuXG5cdGNyZWF0ZSAobmFtZSwgd2lkdGgsIGhlaWdodCkge1xuXHRcdC8vIFRoZSB3aW5kb3cgZ2V0cyBjZW50ZXJlZCBpbnNpZGUgdGhlIFdpbmRvdyBvYmplY3Rcblx0XHR2YXIgY29vcmRYID0gMCA7IFxuXHRcdHZhciBjb29yZFkgPSAwIDsgXG5cdFx0cmV0dXJuIHRoaXMuaW1wbC5jcmVhdGVXaW5kb3cobmFtZSwgY29vcmRYLCBjb29yZFksIHdpZHRoLCBoZWlnaHQpO1xuXHR9XG59XG5cbi8vIEZvciBub3csIG9ubHkgb25lIFdpbmRvd01hbmFnZXIgd2lsbCBkb1xubGV0IHdpbmRvd01hbmFnZXIgPSBuZXcgV2luZG93TWFuYWdlcignd2luZG93TWFuYWdlcicpO1xuXG5leHBvcnQgeyB3aW5kb3dNYW5hZ2VyIH0gO1xuIiwiXG5cbmV4cG9ydCBjbGFzcyBNZXNzYWdlIHtcblxuXHRzdGF0aWMgYWxlcnQgKHRpdGxlLCB0ZXh0LCBtb2RhbCA9IGZhbHNlKSB7XG5cdFx0bGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRpZiAobW9kYWwpIHtcblx0XHRcdFx0ZGh0bWx4Lm1lc3NhZ2Uoe1xuXHRcdFx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdFx0XHR0eXBlOiAnYWxlcnQnLFxuXHRcdFx0XHRcdHRleHQ6IHRleHQsXG5cdFx0XHRcdFx0Y2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkaHRtbHgubWVzc2FnZSh7XG5cdFx0XHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0XHRcdHRleHQ6IHRleHRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH1cblx0XHR9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdH1cblxuXHRzdGF0aWMgd2FybmluZyAodGl0bGUsIHRleHQsIG1vZGFsID0gZmFsc2UpIHtcblx0XHRsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGlmIChtb2RhbCkge1xuXHRcdFx0XHRkaHRtbHgubWVzc2FnZSh7XG5cdFx0XHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0XHRcdHR5cGU6ICdhbGVydC13YXJuaW5nJyxcblx0XHRcdFx0XHR0ZXh0OiB0ZXh0LFxuXHRcdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZGh0bWx4Lm1lc3NhZ2Uoe1xuXHRcdFx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdFx0XHR0ZXh0OiB0ZXh0XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuXHR9XG5cblx0c3RhdGljIGVycm9yICh0aXRsZSwgdGV4dCwgbW9kYWwgPSBmYWxzZSkge1xuXHRcdGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0aWYgKG1vZGFsKSB7XG5cdFx0XHRcdGRodG1seC5tZXNzYWdlKHtcblx0XHRcdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRcdFx0dHlwZTogJ2FsZXJ0LWVycm9yJyxcblx0XHRcdFx0XHR0ZXh0OiB0ZXh0LFxuXHRcdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZGh0bWx4Lm1lc3NhZ2Uoe1xuXHRcdFx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdFx0XHR0eXBlOiAnZXJyb3InLFxuXHRcdFx0XHRcdHRleHQ6IHRleHRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH1cblx0XHR9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdH1cblxuXHRzdGF0aWMgY29uZmlybSAodGl0bGUsIHRleHQsIG9rLCBjYW5jZWwpIHtcblx0XHRsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGRodG1seC5jb25maXJtKHtcblx0XHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0XHR0ZXh0OiB0ZXh0LFxuXHRcdFx0XHRvazogb2ssXG5cdFx0XHRcdGNhbmNlbDogY2FuY2VsLFxuXHRcdFx0XHRjYWxsYmFjazogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRpZiAocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmVqZWN0KCk7ICAgIFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHByb21pc2U7XG5cdH1cbn1cbiIsIlxuLy8gSGVyZSB3ZSBpbXBvcnQgYWxsIFwicHVibGljXCIgY2xhc3NlcyB0byBleHBvc2UgdGhlbVxuaW1wb3J0IHsgZ2V0Q29uZmlnLCBzZXRDb25maWcgfSBmcm9tICdnbG9iYWwvY29uZmlnJztcblxuaW1wb3J0IHsgQWN0aW9uTWFuYWdlciB9IGZyb20gJ2FjdGlvbnMvQWN0aW9uTWFuYWdlcic7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICdhY3Rpb25zL0FjdGlvbic7XG5cbmltcG9ydCB7IEJhc2VMYXlvdXQgfSBmcm9tICdsYXlvdXQvQmFzZUxheW91dCc7IFxuaW1wb3J0IHsgU2ltcGxlTGF5b3V0IH0gZnJvbSAnbGF5b3V0L1NpbXBsZUxheW91dCc7XG5pbXBvcnQgeyBUd29Db2x1bW5zTGF5b3V0IH0gZnJvbSAnbGF5b3V0L1R3b0NvbHVtbnNMYXlvdXQnO1xuaW1wb3J0IHsgUGFnZUxheW91dCB9IGZyb20gJ2xheW91dC9QYWdlTGF5b3V0JztcbmltcG9ydCB7IFdpbmRvd0xheW91dCB9IGZyb20gJ2xheW91dC9XaW5kb3dMYXlvdXQnO1xuXG5pbXBvcnQgeyBNZW51IH0gZnJvbSAnbWVudS9NZW51JztcbmltcG9ydCB7IENvbnRleHRNZW51IH0gZnJvbSAnbWVudS9Db250ZXh0TWVudSc7XG5pbXBvcnQgeyBNZW51SXRlbSB9IGZyb20gJ21lbnUvTWVudUl0ZW0nO1xuXG5pbXBvcnQgeyBCYXNlVHJlZSB9IGZyb20gJ3RyZWUvQmFzZVRyZWUnO1xuaW1wb3J0IHsgVHJlZUl0ZW0gfSBmcm9tICd0cmVlL1RyZWVJdGVtJztcblxuaW1wb3J0IHsgVGFiYmFyIH0gZnJvbSAndGFiYmFyL1RhYmJhcic7XG5pbXBvcnQgeyBUYWIgfSBmcm9tICd0YWJiYXIvVGFiJztcblxuaW1wb3J0IHsgQWNjb3JkaW9uIH0gZnJvbSAnYWNjb3JkaW9uL0FjY29yZGlvbic7XG5pbXBvcnQgeyBBY2NvcmRpb25DZWxsIH0gZnJvbSAnYWNjb3JkaW9uL0FjY29yZGlvbkNlbGwnO1xuXG5pbXBvcnQgeyBUb29sYmFyIH0gZnJvbSAndG9vbGJhci9Ub29sYmFyJztcblxuaW1wb3J0IHsgQmFzZUdyaWQgfSBmcm9tICdncmlkL0Jhc2VHcmlkJztcbmltcG9ydCB7IFByb3BlcnR5R3JpZCB9IGZyb20gJ2dyaWQvUHJvcGVydHlHcmlkJztcblxuaW1wb3J0IHsgRm9ybSB9IGZyb20gJ2Zvcm0vRm9ybSc7XG5pbXBvcnQgeyBWYXVsdCB9IGZyb20gJ3ZhdWx0L1ZhdWx0JztcblxuaW1wb3J0IHsgd2luZG93TWFuYWdlciB9IGZyb20gJ3dpbmRvdy9XaW5kb3dNYW5hZ2VyJztcbmltcG9ydCB7IFdpbmRvdyB9IGZyb20gJ3dpbmRvdy9XaW5kb3cnO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gJ3dpbmRvdy9NZXNzYWdlJztcblxuZXhwb3J0IHtcblx0Ly8gQ29uZmlnIGZ1bmN0aW9uc1xuXHRnZXRDb25maWcsIFxuXHRzZXRDb25maWcsXG4gICAgICAgIFxuICAgIHdpbmRvd01hbmFnZXIsXG4gICAgV2luZG93LFxuXHRNZXNzYWdlLFxuXHRcblx0Ly8gQWN0aW9uIG1hbmFnZW1lbnRcblx0QWN0aW9uTWFuYWdlciwgXG5cdEFjdGlvbiwgXG5cblx0Ly8gTGF5b3V0c1xuXHRCYXNlTGF5b3V0LFxuXHRTaW1wbGVMYXlvdXQsIFxuXHRUd29Db2x1bW5zTGF5b3V0LCBcblx0UGFnZUxheW91dCxcbiAgICAgICAgV2luZG93TGF5b3V0LFxuICAgICAgICBcbiAgICAgICAgQWNjb3JkaW9uLFxuICAgICAgICBBY2NvcmRpb25DZWxsLFxuXG5cdC8vIFRyZWUgbGF5b3V0c1xuXHRCYXNlVHJlZSxcblx0VHJlZUl0ZW0sXG5cbiAgICAvLyBNZW51c1xuXHRNZW51LFxuICAgIENvbnRleHRNZW51LFxuXHRNZW51SXRlbSxcblx0XG5cdC8vIFRhYmJhclxuXHRUYWJiYXIsXG5cdFRhYixcblx0XG5cdC8vIEdyaWRcblx0QmFzZUdyaWQsXG5cdFByb3BlcnR5R3JpZCxcblxuICAgIC8vIE90aGVyXG4gICAgVG9vbGJhcixcblx0Rm9ybSxcbiAgICAgICAgVmF1bHRcbn07XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDO0FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxHQUFHLGNBQWMsQ0FB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