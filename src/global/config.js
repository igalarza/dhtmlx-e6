

/** Enables console.log comments */
export const DEBUG = true;

/** dhtmlx skin applied to all objects */
export const SKIN = 'dhx_web';

/** All the dhtmlx object types */
export const OBJECT_TYPE = {
	LAYOUT : 'layout',
	LAYOUT_CELL : 'layoutCell',
	TOOLBAR : 'toolbar', 
	MENU : 'menu', 
	GRID : 'grid', 
	TREE : 'tree', 
	WINDOW : 'window',
	WINDOW_MANAGER : 'windowManager',
    TABBAR : 'tabbar',
    TAB : 'tab'
};

/**
 * Checks if the parameter is a DOM node or DOM id (string).
 * @param {mixed} o - Dom Node or any other variable.
 * @return {boolean} true if the parameter is a DOM Node.
 */   
export function isNode (o) {
	return (
		typeof Node === "string" ||
		typeof Node === "object" ? o instanceof Node : 
		typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
	);
}

