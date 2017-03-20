

function loadAssets () {
    appendCSS('base/test/main.css');
    appendCSS('base/vendor/dhtmlx.css');
}

function appendCSS (path) {
	var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = path;
    link.media = 'all';
    head.appendChild(link);
}

export { loadAssets } ;