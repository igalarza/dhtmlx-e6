
import { OBJECT_TYPE } from 'global/config';
import { BaseLayout } from 'layout/BaseLayout';

describe("the BaseLayout object", function() {
	
	let obj = null;
	
	beforeEach(function() {
		obj = new BaseLayout();
		spyOn(obj, 'initCells').and.callThrough();	
		obj.init('name', document.body, '1C');
	});
	
	afterEach(function() {
		obj.destroy();
	});

	it("checks if the object is defined", function() {
		expect(obj).toBeDefined();
		expect(obj.initCells).toHaveBeenCalledTimes(1);
	});
	
	it("checks if the object has its properties", function() {
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT);
		expect(obj.childs).toBeDefined();
		expect(obj.childs.length).toEqual(1);
		expect(obj.childs[0].type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
		expect(obj.childs[0].impl).toBeDefined();
	});
	
	it("checks that the attachEvent method is called", function() {
		
		spyOn(obj.impl, 'attachEvent').and.callThrough();
		
		let otherLayout = new BaseLayout('name', obj.childs[0], '1C');
		
		expect(obj.impl.attachEvent).toHaveBeenCalledTimes(1);
	});
});