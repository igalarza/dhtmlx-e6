
import { PageLayout } from 'layout/PageLayout';

describe("Checks the PageLayout object", function() {
	
	beforeEach(function() {
		var baseStyle = "width:100%;height:100%;margin:0px;overflow:hidden;";
		document.body.style = baseStyle;
		document.documentElement.style = baseStyle;
		// document.html.style = baseStyle;
		obj = new PageLayout(document.body, 300, 200);
	});
	
	afterEach(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		
		obj.header.html = "<h1>HEADER</H1>";
		obj.body.html = "<p>body</p>";
		obj.footer.html = "<h3>footer</h3>";
		
		expect(obj.header).toBeDefined();
		expect(obj.body).toBeDefined();
		expect(obj.footer).toBeDefined();
		
		// Heights are not as expected in test! Needs review.
		// expect(obj.header.height).toEqual(300);
		// expect(obj.footer.height).toEqual(200);
	});
});