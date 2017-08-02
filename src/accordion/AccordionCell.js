
import { OBJECT_TYPE, SKIN, DEBUG } from 'global/config';
import { BaseObject } from 'global/BaseObject';

export class AccordionCell extends BaseObject {
    
    constructor (name, container, id, text, open = false, height = null, icon = null) {
        
        if (DEBUG) {
            console.log('AccordionCell constructor');
        }
        
        // We will init the BaseObject properties in the init method
        super();
        
        if (arguments.length >= 4) {
            this.init(name, container, id, text, open, height, icon);
        }
    }    
    
    init (name, container, id, text, open = false, height = null, icon = null) {
        
        // TODO check that container must be a Accordion object
        container.impl.addItem(id, text, open, height, icon);
        
        var impl = container.impl.cells(id);
        
         // BaseObject init method
        super.init(name, OBJECT_TYPE.ACCORDION_CELL, container, impl);
    }
}
