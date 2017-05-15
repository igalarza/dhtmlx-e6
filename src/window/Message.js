

export class Message {

	static alert (title, text, modal = false) {
		let promise = new Promise((resolve, reject) => {
			if (modal) {
				dhtmlx.message({
					title: title,
					type: 'alert',
					text: text,
					callback: function() {
						resolve();
					}
				});
			} else {
				dhtmlx.message({
					title: title,
					text: text
				});
				resolve();
			}
		});
        return promise;
	}

	static warning (title, text, modal = false) {
		let promise = new Promise((resolve, reject) => {
			if (modal) {
				dhtmlx.message({
					title: title,
					type: 'alert-warning',
					text: text,
					callback: function() {
						resolve();
					}
				});
			} else {
				dhtmlx.message({
					title: title,
					text: text
				});
				resolve();
			}
		});
        return promise;
	}

	static error (title, text, modal = false) {
		let promise = new Promise((resolve, reject) => {
			if (modal) {
				dhtmlx.message({
					title: title,
					type: 'alert-error',
					text: text,
					callback: function() {
						resolve();
					}
				});
			} else {
				dhtmlx.message({
					title: title,
					type: 'error',
					text: text
				});
				resolve();
			}
		});
        return promise;
	}

	static confirm (title, text, ok, cancel) {
		let promise = new Promise((resolve, reject) => {
			dhtmlx.confirm({
				title: title,
				text: text,
				ok: ok,
				cancel: cancel,
				callback: function(response) {
					if (response) {
						resolve();
					} else {
						reject();    
					}
				}
			});
		});
		return promise;
	}
}
