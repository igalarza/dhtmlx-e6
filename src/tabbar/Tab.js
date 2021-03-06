
import { OBJECT_TYPE, SKIN, DEBUG } from 'global/config';
import { BaseObject } from 'global/BaseObject';

export class Tab extends BaseObject {
    
    constructor (name, container, id, text, position = null, active = false, close = false) {
        
        if (DEBUG) {
            console.log('Tab constructor');
        }
        
        // We will init the BaseObject properties in the init method
        super();
        
        if (arguments.length >= 4) {
            this.init(name, container, id, text, position, active, close);
        }
    }
    
    
    init (name, container, id, text, position = null, active = false, close = false) {
        
        // TODO check that container must be a Tabbar object
        container.impl.addTab(id, text, null, position, active, close);
        
        var impl = container.impl.tabs(id);
        
         // BaseObject init method
        super.init(name, OBJECT_TYPE.TAB, container, impl);
    }
}
