

/** Enables console.log comments */
export const DEBUG = true;

/** All the dhtmlx object types */
export const OBJECT_TYPE = {
	LAYOUT : 'layout',
	LAYOUT_CELL : 'layoutCell',
	TOOLBAR : 'toolbar', 
	MENU : 'menu', 
	GRID : 'grid', 
	TREE : 'tree', 
	WINDOW : 'window'
};

// Returns true if it is a DOM node    
export function isNode (o) {
	return (
		typeof Node === "object" ? o instanceof Node : 
		typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
	);
}