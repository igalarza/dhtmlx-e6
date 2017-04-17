
import { BaseObject } from 'global/BaseObject';

describe("Checks the BaseObject object", function() {
	
	var obj = null;
	
	beforeAll(function() {
		obj = new BaseObject();
		spyOn(obj, 'destroy').and.callThrough();
		obj.init('objName', 'typeName', 'container', {});
		
		// We need a attachEvent mock function in the impl object
		let attachEventStub = function(name, action) {
			console.log('attachEventStub has been called!');
			// Event is called!
			action('id');
		};
		obj.impl.attachEvent = attachEventStub;
		spyOn(obj.impl, "attachEvent").and.callThrough();
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
		expect(obj.impl).toEqual(jasmine.any(Object));
	});
	
	it("checking the attachAction method", function() {
		let eventFunction = function() {
			console.log('eventFunction has been called!');
		};				
		obj.attachAction('test', eventFunction, this);		
		expect(obj.impl.attachEvent).toHaveBeenCalled();
	});
	
	it("checking the attachActionManager method", function() {
		let actionManager = {};
		actionManager.actions = [];
		actionManager.context = this;
		actionManager.actions['id'] = function() {
			console.log('action with id has been called!');
		};
		obj.attachActionManager('test', actionManager);
		expect(obj.impl.attachEvent).toHaveBeenCalled();
	});
	
	it("checking exceptions", function() {
		let obj2 = new BaseObject();
		// If init method is not called, getters will raise exception.
		expect(function () {obj2.name}).toThrowError(Error);
		expect(function () {obj2.type}).toThrowError(Error);
		expect(function () {obj2.container}).toThrowError(Error);
		expect(function () {obj2.impl}).toThrowError(Error);
		expect(function () {obj2.childs}).toThrowError(Error);
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