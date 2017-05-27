
import { OBJECT_TYPE } from 'global/config';
import { BaseGrid } from 'grid/BaseGrid';
import { SimpleLayout } from 'layout/SimpleLayout';
import { ActionManager } from 'actions/ActionManager';

describe("Checks the BaseGrid object", function() {
	
	it("checking if the object is defined", function() {
		let obj = new BaseGrid();
		spyOn(obj, 'initDhtmlxGrid').and.callThrough();	
		obj.init('name', document.body);
		expect(obj).toBeDefined();
		expect(obj.initDhtmlxGrid).toHaveBeenCalledTimes(1);
		obj.destroy();
	});
	
	it("checking if the object can be attached to a cell", function() {
		let layout = new SimpleLayout('layout', document.body);
		let actionManager = new ActionManager(layout);
		let obj = new BaseGrid('TestGrid', layout.cell, actionManager);
		expect(obj.impl).toBeDefined();
	});
});