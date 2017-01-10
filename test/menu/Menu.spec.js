
import { SimpleLayout } from 'layout/SimpleLayout';
import { ActionManager } from 'actions/ActionManager';
import { Action } from 'actions/Action';
import { Menu } from 'menu/Menu';

describe("Checks the Menu object", function() {

	var obj = null;
	var actionManager = null;
	
	beforeAll(function() {
		var layout = new SimpleLayout(document.body);
		
		var testAction = function() {
			console.log("test action");
		};

		var testAction2 = function() {
			console.log("test action 2");
		};

		actionManager = new ActionManager(document.body);
		actionManager.addAction('test', testAction);
		actionManager.addActionObj(new Action('test2', testAction2));

		obj = new Menu();
		obj.init(layout.cell, actionManager);
	});
	
	afterAll(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});

	it("checking if the object has its properties", function() {
		

		obj.addMenuItem(actionManager.createMenuItem('test', null, 'Menu item'));
		obj.addTextContainer('text', 'TextContainer');
		obj.addMenuItem(actionManager.createMenuItem('test2', 'text', 'Menu item'));

	});

});