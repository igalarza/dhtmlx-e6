
import { SimpleLayout } from 'layout/SimpleLayout';
import { ActionManager } from 'actions/ActionManager';
import { Action } from 'actions/Action';

describe("Checks the ActionManager object", function() {

	let obj = null;
	let layout = null;
	
	beforeAll(function() {
		layout = new SimpleLayout('name', document.body);
		obj = new ActionManager(layout.cell);
	});
	
	afterAll(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
		expect(obj.context).toBeDefined();
	});

	it("checking if the object has its properties", function() {
		
		var testAction = function() {
			console.log("test action");
		};

		var testAction2 = function() {
			console.log("test action 2");
		};

		obj.addAction('test', testAction);
		obj.addActionObj(new Action('test2', testAction2));

		expect(obj.actions['test']).toBe(testAction);
		expect(obj.actions['test2']).toBe(testAction2);

		var menuItem = obj.createMenuItem('test', null, 'Menu item');
	});
	
	it("checking parent and child properties", function() {
		var otherActionManager = new ActionManager(layout.cell, obj);
		expect(otherActionManager.parent).toBeDefined();
		expect(obj.childs.length).toBe(1);
	});

});