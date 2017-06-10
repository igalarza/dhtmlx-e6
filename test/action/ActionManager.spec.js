
import { SimpleLayout } from 'layout/SimpleLayout';
import { ActionManager } from 'actions/ActionManager';
import { Action } from 'actions/Action';

describe("the ActionManager object", function() {

	let obj = null;
	let layout = null;
	
	let testAction = function() {
		console.log("test action");
	};

	let testAction2 = function() {
		console.log("test action 2");
	};
	
	beforeEach(function() {
		layout = new SimpleLayout('name', document.body);
		obj = new ActionManager(layout.cell);
	});
	
	afterEach(function() {
		layout.destroy();
	});

	it("checks if the object is defined", function() {
		expect(obj).toBeDefined();
		expect(obj.context).toBeDefined();
	});

	it("checks if the object has its properties", function() {
		obj.addAction('test', testAction);
		obj.addActionObj(new Action('test2', testAction2));

		expect(obj.actions['test']).toBe(testAction);
		expect(obj.actions['test2']).toBe(testAction2);
	});
	
	it("checks the parent and child properties", function() {
		var otherActionManager = new ActionManager(layout.cell, obj);
		expect(otherActionManager.parent).toBeDefined();
		expect(obj.childs.length).toBe(1);
	});
	
	it("checks the run method", function() {
		let container = {
			action: testAction,
			action2: testAction2
		};
		
		spyOn(container, 'action').and.callThrough();
		spyOn(container, 'action2').and.callThrough();
		
		obj.addAction('test', container.action);
		obj.addAction('test2', container.action2);
		
		obj.run('test', null, obj.context);
		
		expect(container.action).toHaveBeenCalled();
		expect(container.action2).not.toHaveBeenCalled();
	});

});