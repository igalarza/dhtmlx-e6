
const basePath = '/';
const defaultIconsPath = basePath + 'vendor/imgs/';
const defaultImagesPath = basePath + 'vendor/imgs/';

let config = {
	/** Enables console.log comments */
	DEBUG: false,
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

export let DEBUG = config.DEBUG;
export let SKIN = config.SKIN;
export let TOOLBAR_ICONS_PATH = config.TOOLBAR_ICONS_PATH;
export let GRID_ICONS_PATH = config.GRID_ICONS_PATH;
export let TREE_ICONS_PATH = config.TREE_ICONS_PATH;
export let MENU_ICONS_PATH = config.MENU_ICONS_PATH;
export let TABBAR_ICONS_PATH = config.TABBAR_ICONS_PATH;

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
    TAB : 'tab',
    ACCORDION : 'accordion',
    ACCORDION_CELL : 'accordionCell' 
};
