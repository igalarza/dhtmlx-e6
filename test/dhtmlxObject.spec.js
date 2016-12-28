
import { dhtmlxObject } from 'dhtmlxObject';

describe("Checks the dhtmlxObject object", function() {
	
	var obj = new dhtmlxObject('typeName', 'container', 'impl');

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.type).toEqual('typeName');
		expect(obj.container).toEqual('container');
		expect(obj.impl).toEqual('impl');
	});
});