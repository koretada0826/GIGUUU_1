
var breakPoint_sp = 768;

var actionPcEveryTime = new ActionDevice();
var actionSpEveryTime = new ActionDevice();
var actionPcEveryOnceTime = new ActionDevice();
var actionSpEveryOnceTime = new ActionDevice();
var actionPcOnlyOnceTime = new ActionDevice();
var actionSpOnlyOnceTime = new ActionDevice();

actionSpOnlyOnceTime.init = function () {
	window.addEventListener('load', function () { setTimeout(doScroll, 100); }, false);
	setTimeout(doScroll, 100);
}

$(function () {
	setting();
});

function setting() {
	var _flgPc = false;
	var _flgSp = false;

	var _flgPcOnce = false;
	var _flgSpOnce = false;

	deviceSet();

	var _now = $('body').attr('data-device');

	if (_now == 'pc') {
		actionPcEveryTime.actionAll();
		actionPcEveryOnceTime.actionAll();
		actionPcOnlyOnceTime.actionAll();
		_flgPcOnce = true;
		_flgPc = true;
	}
	else if (_now == 'sp') {
		actionSpEveryTime.actionAll();
		actionSpEveryOnceTime.actionAll();
		actionSpOnlyOnceTime.actionAll();
		_flgSpOnce = true;
		_flgSp = true;
	}

	$(window).on('orientationchange resize', function () {
		deviceSet();
		_now = $('body').attr('data-device');

		if (_now == 'pc') {
			actionPcEveryTime.actionAll();
		}
		else if (_now == 'sp') {
			actionSpEveryTime.actionAll();
		}

		//1回のみ処理
		if (!_flgPcOnce && !_flgPc && _now == 'pc') {
			actionPcOnlyOnceTime.actionAll();
			_flgPcOnce = true;
		}
		else if (!_flgSpOnce && !_flgSp && _now == 'sp') {
			actionSpOnlyOnceTime.actionAll();
			_flgSpOnce = true;
		}

		//リサイズ1回のみ処理
		if (!_flgPc && _now == 'pc') {
			actionPcEveryOnceTime.actionAll();
			_flgPc = true;
			_flgSp = false;
		}
		else if (!_flgSp && _now == 'sp') {
			actionSpEveryOnceTime.actionAll();
			_flgSp = true;
			_flgPc = false;
		}
	});
}

function ActionSingle(prop) {
	var _now = $('body').attr('data-device');
	if (_now == 'pc') {
		if (actionPcEveryTime[prop] != undefined) actionPcEveryTime[prop]();
		if (actionPcEveryOnceTime[prop] != undefined) actionPcEveryOnceTime[prop]();
		if (actionPcOnlyOnceTime[prop] != undefined) actionPcOnlyOnceTime[prop]();
	}
	else if (_now == 'sp') {
		if (actionSpEveryTime[prop] != undefined) actionSpEveryTime[prop]();
		if (actionSpEveryOnceTime[prop] != undefined) actionSpEveryOnceTime[prop]();
		if (actionSpOnlyOnceTime[prop] != undefined) actionSpOnlyOnceTime[prop]();
	}
}

function ActionDevice() {
	this.actionAll = function () {
		for (var prop in this) {
			if (prop == 'actionAll') continue;
			this[prop]();
		}
	}
}

function doScroll() {
	if (window.pageYOffset === 0) { window.scrollTo(0, 1); }
}

function deviceSet() {
	var _w = viewport();
	var $body = $('body');
	var agent;


	if (getDevice()['Mobile'][0]) $body.attr('data-agent', 'sp');
	else if (getDevice()['Tablet']) $body.attr('data-agent', 'tab');
	else if (getDevice()['PC']) $body.attr('data-agent', 'pc');

	if (_w > breakPoint_sp) $body.attr('data-device', 'pc');
	else $body.attr('data-device', 'sp');
}

function viewport() {
	return window.innerWidth;
}

function getDevice() {
	return (function (u) {
		var mobile = {
			0: (u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
				|| u.indexOf("iphone") != -1
				|| u.indexOf("ipod") != -1
				|| (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
				|| (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
				|| u.indexOf("blackberry") != -1,
			iPhone: (u.indexOf("iphone") != -1),
			Android: (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
		};
		var tablet = (u.indexOf("windows") != -1 && u.indexOf("touch") != -1)
			|| u.indexOf("ipad") != -1
			|| (u.indexOf("android") != -1 && u.indexOf("mobile") == -1)
			|| (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1)
			|| u.indexOf("kindle") != -1
			|| u.indexOf("silk") != -1
			|| u.indexOf("playbook") != -1;
		var pc = !mobile[0] && !tablet;
		return {
			Mobile: mobile,
			Tablet: tablet,
			PC: pc
		};
	})(window.navigator.userAgent.toLowerCase());
}


function getNowDevice() {
	return $('body').attr('data-device');
}