const svgNS = 'http://www.w3.org/2000/svg';
const root = window.document.documentElement;
const svgIsSupported = (!!window.document.createElementNS && !!root.setAttributeNS);
const svgElemTypes = ['svg', 'path', 'circle'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
Element.remove = (elem) => {
	elem.parentNode.removeChild(elem);
}
Array.getRandomItem = (array) => {
	return array[parseInt(Math.random() * array.length)];
}
Array.prototype.contains = function(v) {
	return this.indexOf(v) != -1;
}
Element.prototype.$ = Element.prototype.querySelectorAll;
const $ = document.querySelectorAll.bind(document);
String.prototype.isEmpty = function() {
	return (this.length === 0 || !this.trim());
}
String.prototype.capFirstLetter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
const Scripts = {
	add(src) {
		return new Promise((resolve, reject) => {
			let status = this.added[src] && this.added[src].status;
			if (status === 'loaded') {
				return resolve(...this.added[src].v);
			} else if (status !== 'loading') {
				var elem = Element.create('script', document.head, { src: src, async: true });
				this.added[src] = {};
				this.added[src].status = 'loading';
			}
			elem.addEventListener('load', (...e) => {
				this.added[src].status = 'loaded';
				resolve(...this.added[src].v = e);
			});
			elem.addEventListener('error', (...e) => {
				this.added[src].status = 'failed';
				reject(...this.added[src].v = e);
			});
		});
	},
	added: {}
}
function getQueries(s) {
	s = s || window.location.search;
	var a = s.substr(1).split('&'),
		b = {};
	if (a) a.forEach(function(i) {
		var p = i.split('=', 2);
		if (p.length == 1) b[p[0]] = '';
		else b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
	});
	return b;
}
Element.create = (type, parent, attributes, id) => {
	type = type.toLowerCase();
	var isSvg = svgIsSupported && svgElemTypes.contains(type),
	elem = isSvg ? document.createElementNS(svgNS, type) : document.createElement(type);
	if (parent) parent.appendChild(elem);
	if (typeof attributes === 'object') {
		Element.edit(elem, attributes)
	} else if (attributes) {
		attributes.split(' ').forEach(c => elem.classList.add(c));
	}
	if (id) elem.id = id;
	return elem;
}
Element.edit = (elem, attributes) => {
	var type = elem.tagName.toLowerCase(),
	isSvg = svgIsSupported && svgElemTypes.contains(type);
	Object.entries(attributes).forEach(([k, v]) => {
		var prop = k.toLowerCase();
		if (['innerhtml', 'outerhtml', 'id', 'checked', 'src'].contains(prop)) {
			elem[prop] = v;
		} else if (prop == 'class') {
			v.split(' ').forEach(c => elem.classList.add(c));
		} else if (prop == 'text') {
			elem.insertAdjacentHTML('beforeend', v);
		} else if (prop == 'style') {
			Object.entries(v).forEach(([property, value]) => {
				elem.style[property] = value;
			});
		} else {
			isSvg ? elem.setAttributeNS(null, k, v) : elem.setAttribute(k, v);
		}
	});
	return elem;
}
function emptyElem(elem) {
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild);
	}
	return elem;
}
function removeHash() {
	var scrollV, scrollH, loc = window.location;
	if (loc.hash !== '') {
		scrollV = scrollY; // Prevent scrolling by storing the page's current scroll offset
		scrollH = scrollX;
		loc.hash = '';
		scrollTo(scrollH, scrollV); // Restore the scroll offset, should be flicker free
	}
	if ('replaceState' in history) {
		history.replaceState('', document.title, loc.pathname + loc.search);
	}
}
function processLink(link, https) {
	if (!link) return undefined;
	if (link.href) link = link.href;
	if (link.constructor === Array) link = link.join('');
	if (https) link = link.replace(/^http:\/\//i, 'https://');
	return (typeof link === 'string') ? link : false;
}

function digitClock(ms) {
	if (ms < 0) return '-' + digitClock(-ms);
	var arr     = []
	  , sec     = parseInt(ms / 1e3)
	  , hours   = parseInt(sec / 3600)
	  , minutes = parseInt((sec % 3600) / 60)
	  , seconds = sec % 60;
	if (hours) arr.push(hours);
	arr.push((minutes < 10 ? '0' : '') + minutes);
	arr.push((seconds < 10 ? '0' : '') + seconds);
	return arr.join(`:`);
}
function getCurrentMonth() {
	return new Date().getMonth();
}
function selectText(elem) {
	if (document.selection) {
		var range = document.body.createTextRange();
		range.moveToElementText(elem);
		range.select();
	} else if (window.getSelection) {
		var range = document.createRange();
		range.selectNodeContents(elem);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
	}
}
class UserPreference {
	constructor(object) {
		this.values = object.values;
		this.name = object.name;
	}
	toggle() {
		let newValue = this.values[this.values.indexOf(this.value) + 1];
		return this.value = (newValue !== undefined) ? newValue : this.values[0];
	}
	set value(value) {
		if (this.value !== value) {
			localStorage[this.name] = value;
		}
		this.update();
		return value;
	}
	get value() {
		let v = localStorage[this.name];
		return (v !== undefined) ? v : this.values[0];
	}
	get callbacks() {
		Object.defineProperty(this, 'callbacks', { value: [], writable: false, configurable: true });
		return this.callbacks;
	}
	update() {
		this.callbacks.forEach(fn => fn(this.value));
	}
	addEventListener(type, callback) {
		this.callbacks.push(callback);
	}
}
const userPreferences = (() => {
	let object = {};
	Object.entries({
		Theme: {
			values: ['light', 'dark']
		},
		ListViewStyle: {
			values: ['grid', 'list']
		}
	}).forEach(([k, v]) => {
		v.name = k;
		object[k] = new UserPreference(v);
	});
	return object;
})();
window.addEventListener('storage', e => {
	userPreferences[e.key].update();
});
class XHR {
	constructor(src) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', src);
			xhr.onload = () => resolve(xhr.responseText);
			xhr.onerror = () => reject(xhr.statusText);
			xhr.send();
		});
	}
}
const Images = {
	setVectorSource(...args) {
		const fn = (elem, id) => {
			let img = this.svg[id];
			if (elem && id && img && img.inline) {
				if (img.inline.wide) elem.classList.add('wide');
				elem.setAttribute('data-image-id', id);
				elem.setAttributeNS(null, 'viewBox', img.inline.svg.viewbox);
				Element.create('path', elem, { d: img.inline.path.d });
			}
		}
		if (this.svg) {
			fn(...args);
		} else {
			new XHR(`/json/images.json`)
			.then((data) => {
				this.svg = JSON.parse(data);
				fn(...args);
			});
		}
	}
}
class Popup {
	constructor() {
		this.close();
		let popupBody   = Element.create('div', document.body, { class: 'popup-body', id: 'popup' });
		let popupBg     = Element.create('div', popupBody, 'grayout');
		let popupWrap   = Element.create('div', popupBody, 'popup-wrap');
		let popup       = Element.create('div', popupWrap, 'popup page-block shadow-5');
		let popupInner  = Element.create('div', popup, 'popup-inner');
		let closeButton = Element.create('div', popup, 'close-wrap');
		let closeIcon   = Element.create('div', closeButton, 'close');
		[ popupBg, closeButton ].forEach(
			target => target.addEventListener('click', () => Element.remove(popupBody))
		);
		return popupInner;
	}
	close() {
		$('popup' + this.id).forEach(elem => Element.remove(elem));
	}
}
const Menu = {
	open() {
		this.element.classList.remove('off', 'hide');
		this.closeButton.focus();
	},
	close() {
		this.element.classList.add('hide');
	},
	get element() {
		const addLink = (object) => {
			let menuItem = Element.create('a', menuItems, { class: 'menu-item', href: object.href });
			if (object.newtab) {
				menuItem.target = '_blank'
			} else {
				menuItem.addEventListener('click', this.close.bind(this));
			}
			let itemVisual = Element.create('div', menuItem, 'menu-item-visual');
			Images.setVectorSource(Element.create('svg', itemVisual), object.img);
			Element.create('div', menuItem, { class: 'menu-item-text', text: object.text });
			return menuItem;
		}
		const addToggle = (object) => {
			let events = object.e || {};
			let value = object.value;
			let menuItem = Element.create('div', menuItems, 'menu-item');
			let itemVisual = Element.create('a', menuItem, { class: 'menu-item-visual', tabindex: 0, href: 'javascript:' });
			let checkbox = Element.create('switch', itemVisual, { on: object.on });
			let userPref = userPreferences[object.userPref];
			if (userPref) {
				if (value) {
					const updateCheckboxValue = () => checkbox.setAttribute('on', (userPref.value === value));
					if (object.on === undefined) updateCheckboxValue();
					userPref.addEventListener('change', updateCheckboxValue);
				}
				if (!events.change) events.change = userPref.toggle.bind(userPref);
			}
			Object.entries(events).forEach(([eventName, fn]) => {
				if (eventName === 'change') {
					itemVisual.addEventListener('click', fn)
				} else {
					checkbox.addEventListener(eventName, fn);
				}
			});
			Element.create('div', menuItem, { class: 'menu-item-text', text: object.text });
			return checkbox;
		}
		let menuBody = Element.create('div', document.body, 'menu-body');
		let menuBg = Element.create('div', menuBody, 'grayout');
		let menu = Element.create('div', menuBody, 'menu shadow-5');
		menu.addEventListener('transitionend', () => {
			if (menuBody.classList.contains('hide')) menuBody.classList.add('off');
		});
		let menuHeader = Element.create('div', menu, 'menu-header');
		this.closeButton = closeButton = Element.create('a', menuHeader, { class: 'menu-close-btn', href: 'javascript:' });
		Images.setVectorSource(Element.create('svg', closeButton), 'close');
		[menuBg, closeButton].forEach(target => target.addEventListener('click', this.close.bind(this)));
		Element.create('div', menu, 'divider-2');
		let menuItems = Element.create('div', menu, 'menu-items');
		addToggle({ text: 'Темная тема', id: 'themeToggle', userPref: 'Theme', value: 'dark' });
		addToggle({ text: 'Отображение списком', id: 'menuListViewStyleToggle', userPref: 'ListViewStyle', value: 'list' });
		
		delete this.element;
		return this.element = menuBody;
	}
}

document.addEventListener('keydown', e => {
	if (e.key === 'Escape') {
		let elements = $('.popup-body');
		if (elements.length !== 0) {
			elements.forEach(elem => Element.remove(elem));
		} else {
			Menu.close();
		}
	}
});
userPreferences.Theme.addEventListener('change', value => {
	let cl = document.documentElement.classList;
	((value === 'dark') ? cl.add : cl.remove).bind(cl)('dark-theme');
});
document.addEventListener('DOMContentLoaded', () => {
	$('.header-menu-btn').forEach(target => {
		['click', 'space'].forEach(e => {
			target.addEventListener(e, Menu.open.bind(Menu));
		});
	});

	Object.entries(userPreferences).forEach(
		([name, pref]) => pref.update()
	);

	if ([11, 0, 1].contains(new Date().getMonth())) {
		Scripts.add('/js/LetItSnow.js');
	}
}, { once: true });