

import { OBJECT_TYPE, SKIN, DEBUG, TABBAR_ICONS_PATH } from 'global/config';
import { Util } from 'global/Util';
import { BaseObject } from 'global/BaseObject';

export class Tabbar extends BaseObject {
    
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
			impl.setIconsPath(TABBAR_ICONS_PATH);
            
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