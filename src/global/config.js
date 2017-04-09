
export let DEBUG = config.DEBUG;
export let SKIN = config.SKIN;
export let TOOLBAR_ICONS_PATH = config.TOOLBAR_ICONS_PATH;
export let GRID_ICONS_PATH = config.GRID_ICONS_PATH;
export let TREE_ICONS_PATH = config.TREE_ICONS_PATH;
export let MENU_ICONS_PATH = config.MENU_ICONS_PATH;
export let TABBAR_ICONS_PATH = config.TABBAR_ICONS_PATH;

let config = {
	/** Enables console.log comments */
	DEBUG: false,
	/** dhtmlx skin applied to all objects */
	SKIN: 'dhx_web',
	
	BASE_PATH: '/',
	/** Used by Grid, Accordion, Menu, Grid, Tree and TreeGrid  */
	DEFAULT_ICONS_PATH: config.BASE_PATH + 'vendor/imgs/',
	DEFAULT_IMAGES_PATH: config.BASE_PATH + 'vendor/imgs/',
	
	TOOLBAR_ICONS_PATH: config.DEFAULT_ICONS_PATH + 'dhxtoolbar_web/',
	GRID_ICONS_PATH: config.DEFAULT_ICONS_PATH + 'dhxgrid_web/',
	TREE_ICONS_PATH: config.DEFAULT_ICONS_PATH + 'dhxtree_web/',
	MENU_ICONS_PATH: config.DEFAULT_ICONS_PATH + 'dhxmenu_web/',
	TABBAR_ICONS_PATH: config.DEFAULT_ICONS_PATH + 'dhxtabbar_web/'
};

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