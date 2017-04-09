
let config = {
	/** Enables console.log comments */
	DEBUG: false,
	/** dhtmlx skin applied to all objects */
	SKIN: 'dhx_web',
	/** Used by Grid, Accordion, Menu, Grid, Tree and TreeGrid  */
	DEFAULT_ICONS_PATH: '',
	DEFAULT_IMAGES_PATH: ''
};

export let DEBUG = config.DEBUG;
export let SKIN = config.SKIN;

export function getConfig() {
	return config;
}

export function setConfig(cfg) {
	config = cfg;
}

/** All the dhtmlx object types */
export const OBJECT_TYPE = {
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