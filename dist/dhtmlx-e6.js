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
    TAB : 'tab'
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
		this._actions[action](params, context);
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
            
        } else if (container.type === OBJECT_TYPE.LAYOUT_CELL) {
            
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
			|| container.type === OBJECT_TYPE.WINDOW
			|| container.type === OBJECT_TYPE.TAB) {
			
			impl = container.impl.attachForm();			
		} else {
			throw new Error('initDhtmlxForm: container is not valid.');
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

export { getConfig, setConfig, windowManager, Window, Message, ActionManager, Action, BaseLayout, SimpleLayout, TwoColumnsLayout, PageLayout, WindowLayout, BaseTree, TreeItem, Menu, ContextMenu, MenuItem, Tabbar, Tab, BaseGrid, PropertyGrid, Toolbar, Form };
