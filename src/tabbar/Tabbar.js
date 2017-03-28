

import { isNode , OBJECT_TYPE, SKIN, DEBUG } from 'global/config';
import { BaseObject } from 'global/BaseObject';

export class Tabbar extends BaseObject {
    
    constructor (container) {
        if (DEBUG) {
            console.log('Tabbar constructor');
        }
        
        // We will init the BaseObject properties in the init method
        super();
        
        if (arguments.length === 1) {
            this.init(container);
        }
    }
    
    init (container) {
        if (arguments.length === 1) {
            
            // Creates the dhtmlx object (see function below)
            var impl = this.initDhtmlxTabbar(container);
            
            // BaseObject init method
            super.init(OBJECT_TYPE.TABBAR, container, impl);
            
        } else {
            throw new Error('Tabbar init method requires one parameter');
        }
    }
    
    initDhtmlxTabbar (container) {
        var impl = null;
        if (isNode(container)) {
            
            impl = new dhtmlXTabBar({
                parent: container,
                skin: SKIN
            });
            
        } else if (container.type === OBJECT_TYPE.LAYOUT_CELL) {
            
            impl = container.impl.attachTabbar();
        }
    }
}
