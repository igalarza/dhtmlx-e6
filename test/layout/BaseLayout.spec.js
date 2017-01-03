
import { OBJECT_TYPE } from 'global/config';
import { BaseLayout } from 'layout/BaseLayout';

describe("Checks the BaseLayout object", function() {
	
	var obj = null;
	
	beforeAll(function() {
		obj = new BaseLayout();
		spyOn(obj, 'initCells').and.callThrough();	
		obj.init(document.body, '1C');
	});
	
	afterAll(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
		expect(obj.initCells).toHaveBeenCalledTimes(1);
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT);
		expect(obj.childs).toBeDefined();
		expect(obj.childs.length).toEqual(1);
		expect(obj.childs[0].type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
		expect(obj.childs[0].impl).toBeDefined();
	});
});