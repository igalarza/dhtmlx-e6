
import { OBJECT_TYPE, DEBUG, SKIN, TOOLBAR_ICONS_PATH } from 'global/config';
import { Util } from 'global/Util';
import { BaseObject } from 'global/BaseObject';

export class Toolbar extends BaseObject {
	
	constructor (name, container, actionManager) {
		if (DEBUG) {
			console.log('Toolbar constructor');
		}
		// Creates the dhtmlx object (see function below)
		var impl = initDhtmlxToolbar(container);
		impl.setIconsPath(TOOLBAR_ICONS_PATH);
		
		// BaseObject constructor
		super(name, OBJECT_TYPE.TOOLBAR, container, impl);
		
		this.attachActionManager("onClick", actionManager);
	}
	
	addToolbarButton (toolbarItem) {
		this.impl.addButton(toolbarItem.name, (this.childs.length), toolbarItem.caption, toolbarItem.icon, toolbarItem.iconDisabled);
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
