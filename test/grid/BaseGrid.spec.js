
import { OBJECT_TYPE } from 'global/config';
import { BaseGrid } from 'grid/BaseGrid';

describe("Checks the BaseGrid object", function() {
	
	var obj = null;
	
	beforeAll(function() {
		obj = new BaseGrid();
		spyOn(obj, 'initDhtmlxGrid').and.callThrough();	
		obj.init(document.body);
	});
	
	afterAll(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
		expect(obj.initDhtmlxGrid).toHaveBeenCalledTimes(1);
	});
});