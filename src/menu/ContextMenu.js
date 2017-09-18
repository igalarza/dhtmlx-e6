
import { OBJECT_TYPE, DEBUG, SKIN } from 'global/config';
import { Menu } from 'menu/Menu';

export class ContextMenu extends Menu {
    
    constructor(name, container, actionManager) {
        if (DEBUG) {
            console.log('ContextMenu constructor');
        }
        
        // We will init the BaseObject properties in the init method
        super();
        
        if (arguments.length === 3) {
                this.init(name, container, actionManager);
        }
    }
    
    init (name, container, actionManager) {
        
        // Menu init method, container must be null
        super.init(name, null, actionManager);
        
        this._container = container;
        container.childs.push(this);
        
        this.impl.renderAsContextMenu();
        
        if (typeof container === 'object' &&
            this.impl.isContextZone(container.impl)) {
            this.impl.addContextZone(container.impl);    
        
        } else if (container.type === OBJECT_TYPE.GRID  
            || container.type === OBJECT_TYPE.TREE) {
            
            container.impl.enableContextMenu(this.impl);
        }
    }
}