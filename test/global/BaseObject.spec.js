
import { BaseObject } from 'global/BaseObject';

describe("Checks the BaseObject object", function() {
	
	var obj = null;
	
	beforeAll(function() {
		obj = new BaseObject();
		spyOn(obj, 'destroy').and.callThrough();	
		obj.init('typeName', 'container', 'impl');
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
});