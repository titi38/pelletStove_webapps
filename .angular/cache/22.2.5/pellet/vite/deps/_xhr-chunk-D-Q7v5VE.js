import { Ac as InjectionToken, Fl as ɵɵinject, Fn as Injectable, Kl as _defineProperty, Wi as setClassMetadata, dr as Service, fl as inject, jl as ɵɵdefineInjectable, so as ɵɵdefineService, vc as DOCUMENT } from "./core-CFIOHzdM.js";
// node_modules/@angular/common/fesm2022/_platform_location-chunk.mjs
/**
* @license Angular v22.2.4
* (c) 2010-2026 Google LLC. https://angular.dev/
* License: MIT
*/
var _PlatformLocation;
var _BrowserPlatformLocation;
var _DOM = null;
function getDOM() {
	return _DOM;
}
function setRootDomAdapter(adapter) {
	var _DOM2;
	(_DOM2 = _DOM) !== null && _DOM2 !== void 0 || (_DOM = adapter);
}
var DomAdapter = class {};
var PlatformLocation = class {
	historyGo(relativePosition) {
		throw new Error(ngDevMode ? "Not implemented" : "");
	}
};
_PlatformLocation = PlatformLocation;
_defineProperty(PlatformLocation, "ɵfac", function PlatformLocation_Factory(__ngFactoryType__) {
	return new (__ngFactoryType__ || _PlatformLocation)();
});
_defineProperty(PlatformLocation, "ɵprov", /*@__PURE__*/ ɵɵdefineInjectable({
	token: _PlatformLocation,
	factory: () => {
		return (() => {
			return inject(BrowserPlatformLocation);
		})();
	},
	providedIn: "platform"
}));
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PlatformLocation, [{
		type: Injectable,
		args: [{
			providedIn: "platform",
			useFactory: () => inject(BrowserPlatformLocation)
		}]
	}], null, null);
})();
var LOCATION_INITIALIZED = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "Location Initialized" : "");
var BrowserPlatformLocation = class extends PlatformLocation {
	constructor() {
		super();
		_defineProperty(this, "_location", void 0);
		_defineProperty(this, "_history", void 0);
		_defineProperty(this, "_doc", inject(DOCUMENT));
		this._location = window.location;
		this._history = window.history;
	}
	getBaseHrefFromDOM() {
		return getDOM().getBaseHref(this._doc);
	}
	onPopState(fn) {
		const window = getDOM().getGlobalEventTarget(this._doc, "window");
		window.addEventListener("popstate", fn, false);
		return () => window.removeEventListener("popstate", fn);
	}
	onHashChange(fn) {
		const window = getDOM().getGlobalEventTarget(this._doc, "window");
		window.addEventListener("hashchange", fn, false);
		return () => window.removeEventListener("hashchange", fn);
	}
	get href() {
		return this._location.href;
	}
	get protocol() {
		return this._location.protocol;
	}
	get hostname() {
		return this._location.hostname;
	}
	get port() {
		return this._location.port;
	}
	get pathname() {
		return this._location.pathname;
	}
	get search() {
		return this._location.search;
	}
	get hash() {
		return this._location.hash;
	}
	set pathname(newPath) {
		this._location.pathname = newPath;
	}
	pushState(state, title, url) {
		this._history.pushState(state, title, url);
	}
	replaceState(state, title, url) {
		this._history.replaceState(state, title, url);
	}
	forward() {
		this._history.forward();
	}
	back() {
		this._history.back();
	}
	historyGo(relativePosition = 0) {
		this._history.go(relativePosition);
	}
	getState() {
		return this._history.state;
	}
};
_BrowserPlatformLocation = BrowserPlatformLocation;
_defineProperty(BrowserPlatformLocation, "ɵfac", function BrowserPlatformLocation_Factory(__ngFactoryType__) {
	return new (__ngFactoryType__ || _BrowserPlatformLocation)();
});
_defineProperty(BrowserPlatformLocation, "ɵprov", /*@__PURE__*/ ɵɵdefineInjectable({
	token: _BrowserPlatformLocation,
	factory: () => {
		return (() => {
			return new _BrowserPlatformLocation();
		})();
	},
	providedIn: "platform"
}));
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrowserPlatformLocation, [{
		type: Injectable,
		args: [{
			providedIn: "platform",
			useFactory: () => new BrowserPlatformLocation()
		}]
	}], () => [], null);
})();
// node_modules/@angular/common/fesm2022/_xhr-chunk.mjs
/**
* @license Angular v22.2.4
* (c) 2010-2026 Google LLC. https://angular.dev/
* License: MIT
*/
var _BrowserXhr;
var _XhrFactory;
function parseCookieValue(cookieStr, name) {
	name = encodeURIComponent(name);
	for (const cookie of cookieStr.split(";")) {
		const eqIndex = cookie.indexOf("=");
		const [cookieName, cookieValue] = eqIndex == -1 ? [cookie, ""] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
		if (cookieName.trim() !== name) continue;
		let value = cookieValue;
		try {
			value = decodeURIComponent(cookieValue);
		} catch (_unused) {}
		if (value.length > 1 && value[0] === "\"" && value[value.length - 1] === "\"") value = value.slice(1, -1);
		return value;
	}
	return null;
}
var BrowserXhr = class {
	build() {
		return new XMLHttpRequest();
	}
};
_BrowserXhr = BrowserXhr;
_defineProperty(BrowserXhr, "ɵfac", function BrowserXhr_Factory(__ngFactoryType__) {
	return new (__ngFactoryType__ || _BrowserXhr)();
});
_defineProperty(BrowserXhr, "ɵprov", /*@__PURE__*/ ɵɵdefineService({
	token: _BrowserXhr,
	factory: _BrowserXhr.ɵfac
}));
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrowserXhr, [{ type: Service }], null, null);
})();
var XhrFactory = class {};
_XhrFactory = XhrFactory;
_defineProperty(XhrFactory, "ɵfac", function XhrFactory_Factory(__ngFactoryType__) {
	return new (__ngFactoryType__ || _XhrFactory)();
});
_defineProperty(XhrFactory, "ɵprov", /*@__PURE__*/ ɵɵdefineInjectable({
	token: _XhrFactory,
	factory: function XhrFactory_Factory(__ngFactoryType__) {
		let __ngConditionalFactory__ = null;
		if (__ngFactoryType__) __ngConditionalFactory__ = new (__ngFactoryType__ || _XhrFactory)();
		else __ngConditionalFactory__ = ɵɵinject(BrowserXhr);
		return __ngConditionalFactory__;
	},
	providedIn: "root"
}));
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(XhrFactory, [{
		type: Injectable,
		args: [{
			providedIn: "root",
			useExisting: BrowserXhr
		}]
	}], null, null);
})();
export { LOCATION_INITIALIZED as a, setRootDomAdapter as c, DomAdapter as i, parseCookieValue as n, PlatformLocation as o, BrowserPlatformLocation as r, getDOM as s, XhrFactory as t };
