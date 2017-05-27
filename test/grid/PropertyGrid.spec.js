
import { OBJECT_TYPE } from 'global/config';
import { PropertyGrid } from 'grid/PropertyGrid';
import { SimpleLayout } from 'layout/SimpleLayout';
import { ActionManager } from 'actions/ActionManager';

xdescribe("Checks the BaseGrid object", function() {
	
	it("checking if the object is defined", function() {
		let obj = new BaseGrid();
		spyOn(obj, 'initDhtmlxPropertyGrid').and.callThrough();
		obj.init('name', document.body);
		expect(obj).toBeDefined();
		expect(obj.initDhtmlxPropertyGrid).toHaveBeenCalledTimes(1);
		obj.destroy();
	});
});