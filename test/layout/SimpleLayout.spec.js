
import { OBJECT_TYPE } from 'global/globals';
import { SimpleLayout } from 'layout/SimpleLayout';

describe("Checks the SimpleLayout object", function() {
	
	var obj = new SimpleLayout(document.body);

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT);
		expect(obj.cell.type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
	});
});