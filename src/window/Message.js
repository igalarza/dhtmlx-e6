

export class Message {

	static alert (title, text, modal = false) {

		if (modal) {
			dhtmlx.alert({
			    title: title,
			    type: 'alert',
			    text: text
			});
		} else {
			dhtmlx.message({
			    title: title,
			    type: 'alert',
			    text: text
			});
		}
		
	}

	static warning (title, text, modal = false) {
		if (modal) {
			dhtmlx.alert({
			    title: title,
			    type: 'alert-warning',
			    text: text
			});
		} else {
			dhtmlx.message({
			    title: title,
			    type: 'alert-warning',
			    text: text
			});
		}
	}

	static error (title, text, modal = false) {
		if (modal) {
			dhtmlx.alert({
			    title: title,
			    type: 'alert-error',
			    text: text
			});
		} else {
			dhtmlx.message({
			    title: title,
			    type: 'alert-error',
			    text: text
			});
		}
	}
}