

import { OBJECT_TYPE, SKIN, DEBUG } from 'global/config';
import { Util } from 'global/Util';
import { BaseObject } from 'global/BaseObject';

export class Accordion extends BaseObject {
    
    constructor (name, container) {
        if (DEBUG) {
            console.log('Accordion constructor');
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
            var impl = this.initDhtmlxAccordion(container);
            
            // BaseObject init method
            super.init(name, OBJECT_TYPE.TABBAR, container, impl);
            
        } else {
            throw new Error('Tabbar init method requires 2 parameters');
        }
    }
    
    initDhtmlxAccordion (container) {
        var impl = null;
        if (Util.isNode(container)) {
            
            impl = new dhtmlXAccordion({
                parent: container,
                skin: SKIN
            });
            
        } else if (container.type === OBJECT_TYPE.LAYOUT_CELL
                || container.type === OBJECT_TYPE.ACCORDION_CELL
                || container.type === OBJECT_TYPE.TAB
                || container.type === OBJECT_TYPE.WINDOW) {
            
            impl = container.impl.attachAccordion();
            impl.setSkin(SKIN);
        } else {
            throw new Error('initDhtmlxAccordion: container is not valid.');
        }
        return impl;
    }
}