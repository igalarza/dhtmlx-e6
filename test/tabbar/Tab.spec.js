
import { OBJECT_TYPE } from 'global/config';
import { Tabbar } from 'tabbar/Tabbar';
import { Tab } from 'tabbar/Tab';

xdescribe("Checks the Tab object", function() {
	
        var parentObj = null;
	var obj = null;
	
	beforeAll(function() {
		parentObj = new Tabbar();
		parentObj.init(document.body);
                
                obj = new Tab(parentObj, 'id', 'Label');
	});
	
	afterAll(function() {
            parentObj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
		// expect(obj.impl).toBeDefined();
                expect(obj.type).toEqual(OBJECT_TYPE.TAB);
	});
});
