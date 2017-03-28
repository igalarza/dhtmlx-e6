
import { OBJECT_TYPE } from 'global/config';
import { Tabbar } from 'tabbar/Tabbar';

describe("Checks the Tabbar object", function() {
	
	var obj = null;
	
	beforeAll(function() {
		obj = new Tabbar();
		spyOn(obj, 'initDhtmlxTabbar').and.callThrough();	
		obj.init(document.body);
	});
	
	afterAll(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
		expect(obj.initDhtmlxTabbar).toHaveBeenCalledTimes(1);
                expect(obj.type).toEqual(OBJECT_TYPE.TABBAR);
	});
});
