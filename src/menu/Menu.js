
import { isNode , OBJECT_TYPE , DEBUG } from 'global/globals';
import { dhtmlxObject } from 'global/dhtmlxObject';
import { Action } from 'actions/Action';

/**
 * Base class for Menu objects, see:
 * http://docs.dhtmlx.com/menu__index.html
 */
export class Menu extends dhtmlxObject {
	
	constructor (container, actions = null) {
		
		var impl = null;
		if (isNode(container)) {
			impl = new dhtmlXMenuObject(container, skin);
			
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL  
			|| container.type === OBJECT_TYPE.LAYOUT
			|| container.type === OBJECT_TYPE.WINDOW) {
			
			impl = container.impl.attachMenu();
		}
		
		super(OBJECT_TYPE.MENU, container, impl);
		
		if (actions != null) {
			this.loadActions(actions);
		}
	}
	
	set actions (actions) {
		var i = 1;
		for (action of actions) {
			if (DEBUG) {
				console.log(action);
			}
			if (action.parentName === '') {
				this.impl.addNewSibling(null, action.name, action.caption, action.icon, action.iconDisabled);
			} else {
				this.impl.addNewChild(action.parentName, i++, action.name, action.caption, action.icon, action.iconDisabled);
			}
		}
	}
	
	loadUrl (url, callback) {
		this.impl.loadStruct(url, callback);
	}
	
	loadString (data, callback) {
		this.impl.loadStruct(data, callback);
	}
}