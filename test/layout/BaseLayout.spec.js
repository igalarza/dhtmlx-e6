
import { OBJECT_TYPE } from 'globals';
import { BaseLayout } from 'layout/BaseLayout';

describe("Checks the BaseLayout object", function() {
	
	var obj = new BaseLayout(document.body, '1C');

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT);
		expect(obj.cells).toBeDefined();
		expect(obj.cells[0].type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
		expect(obj.cells[0].impl).toBeDefined();
	});
});