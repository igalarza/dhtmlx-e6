

export class Message {

	static alert (title, text, modal = false) {

		if (modal) {
			dhtmlx.message({
			    title: title,
			    type: 'alert',
			    text: text
			});
		} else {
			dhtmlx.alert({
			    title: title,
			    type: 'alert',
			    text: text
			});
		}
		
	}

	static warning (title, text, modal = false) {
		if (modal) {
			dhtmlx.message({
			    title: title,
			    type: 'alert-warning',
			    text: text
			});
		} else {
			dhtmlx.alert({
			    title: title,
			    type: 'alert-warning',
			    text: text
			});
		}
	}

	static error (title, text, modal = false) {
		if (modal) {
			dhtmlx.message({
			    title: title,
			    type: 'alert-error',
			    text: text
			});
		} else {
			dhtmlx.alert({
			    title: title,
			    type: 'alert-error',
			    text: text
			});
		}
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
