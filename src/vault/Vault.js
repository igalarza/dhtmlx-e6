
import { OBJECT_TYPE, DEBUG, SKIN } from 'global/config';
import { Util } from 'global/Util';
import { BaseObject } from 'global/BaseObject';

export class Vault extends BaseObject {

  constructor (name, container, options, actionManager = null) {
	if (DEBUG) {
		console.log('Vault constructor');
	}
	
	// We will init the BaseObject properties in the init method
	super();
	
	if (arguments.length >= 3) {
		this.init(name, container, options, actionManager);
	}
  }
  
  init (name, container, options, actionManager = null) {

        // Creates the dhtmlx object
        var impl = this.initDhtmlxVault(container, options);
        impl.setSkin(SKIN);

        // BaseObject init method
        super.init(name, OBJECT_TYPE.VAULT, container, impl);
  }
    
  initDhtmlxVault (container, options) {
        var impl = null;
        if (Util.isNode(container)) {
                impl = new dhtmlXVaultObject(options);
                
        } else if (container.type === OBJECT_TYPE.LAYOUT_CELL
            || container.type === OBJECT_TYPE.ACCORDION_CELL
            || container.type === OBJECT_TYPE.WINDOW
            || container.type === OBJECT_TYPE.TAB) {
                
                impl = container.impl.attachVault(options);
        } else {
                throw new Error('initDhtmlxVault: container is not valid.');
        }
        
        return impl;
  }
}
