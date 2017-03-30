
import { BaseObject } from 'global/BaseObject';

describe("Checks the BaseObject object", function() {
	
	var obj = null;
	
	beforeAll(function() {
		obj = new BaseObject();
		spyOn(obj, 'destroy').and.callThrough();	
		obj.init('objName', 'typeName', 'container', 'impl');
	});

	it("checking if the object is defined", function() {
		expect(obj instanceof BaseObject).toBe(true);
		expect(obj).toBeDefined();
		// destroy is called once in the init method
		expect(obj.destroy).toHaveBeenCalledTimes(1);
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.type).toEqual('typeName');
		expect(obj.container).toEqual('container');
		expect(obj.impl).toEqual('impl');
	});
	
	it("checking if the init method without parameters throws an error", function() {
		
		// init without parameters throws an error
		expect(obj.init).toThrowError();
		
		// init with parameters must be inside an anonymous function to work properly
		expect(function() {
			// init must have 3 parameters
            obj.init('one', 'two');
        }).toThrowError();	
	});
	
	it("checking if the search works", function() {
		var child1 = new BaseObject('child1', 'typeName', obj, 'impl');
		var child2 = new BaseObject('child2', 'typeName', obj, 'impl');
		
		var child2_1 = new BaseObject('child2_1', 'typeName', child2, 'impl');
		var child2_2 = new BaseObject('child2_2', 'typeName', child2, 'impl');
		var child2_2_1 = new BaseObject('child2_2_1', 'typeName', child2_2, 'impl');
		
		expect(child1.name).toEqual(obj.find('child1').name);
		expect(child2.name).toEqual(obj.find('child2').name);
		expect(child2_1.name).toEqual(obj.find('child2_1').name);
		expect(child2_2.name).toEqual(obj.find('child2_2').name);
		expect(child2_2_1.name).toEqual(obj.find('child2_2_1').name);
	});
});