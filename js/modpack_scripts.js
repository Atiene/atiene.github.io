const detailProperties = [['gameVersion', 'Версия игры'], ['size', 'Размер'], ['date', 'Дата выпуска']];

const Modpacks = {
	Search: {
		source: modpackList,
		cache: {},
		get elem() {
			delete this.elem;
			return this.elem = $('#SearchInput')[0];
		},
		get bgElem() {
			delete this.bgElem;
			return this.bgElem = $('.search-bg')[0];
		},
		get fuse() {
			delete this.fuse;
			return this.fuse = new Fuse(Array.from(this.source), {
				shouldSort: true,
				threshold: 0.6,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				minMatchCharLength: 1,
				keys: [ '1.name' ]
			})
		},
		find(q) {
			if (!q) return this.source;
			if (q == this.cache.q) {
				console.info('Used search cache.');
				return this.cache.results;
			} else {
				this.cache.q = q;
				return this.cache.results = new Map(
					this.fuse.search(q)
				);
			}
		},
		get value() {
			return this.elem.value;
		},
		set value(value) {
			this.elem.value = value;
			this.update();
		},
		updateValue() {
			let elem, value;
			(elem = this.elem).setAttribute('value', value = elem.value);
			return value;
		},
		update() {
			requestAnimationFrame(
				() => ((document.body.id == 'list') ? this.submit : this.updateValue).bind(this)()
			);
		},
		submit() {
			if (document.body.id != 'list') {
				requestAnimationFrame(this.submit.bind(this));
				location.hash = '';
			} else {
				clearTimeout(this.timeout);
				this.timeout = setTimeout((() => {
					Modpacks.draw(this.find(this.updateValue()));
				}), 200);
			}
		},
		clear() {
			this.value = '';
		}
	},
	get listElement() {
		delete this.listElement;
		return this.listElement = $('#ModpackList')[0];
	},
	sort(modpackList = modpackList, sortBy) {
		return new Map(
			Array.from(modpackList).sort(
				(a, b) => (a[1][sortBy] < b[1][sortBy]) ? -1 : 1
			)
		);
	},
	draw(modpacks = modpackList, allModpacks = window.modpackList) {
		let modpackParent = this.listElement;
		modpackParent.classList[modpacks.size ? 'remove' : 'add']('empty');

		let toBeDelayed = new Set();
		allModpacks.forEach((modpack, id) => {
			if (modpack.elem === undefined) createModpackElem(modpack);
			updateModpackVisibility(modpack, modpacks.has(id));
		});

		let order = 0, delay = 0;
		modpacks.forEach(modpack => {
			modpack.elem.style.setProperty('--order', order++);
			if (toBeDelayed.has(modpack)) {
				modpack.elem.style.setProperty('--delay', delay++);
			}
		});

		return true;

		function createModpackElem(modpack) {
			if (modpack.elem) return;
			let elem = modpack.elem = Element.create('div', modpackParent, 'modpack page-block shadow dynamic hide invisible');
			modpack.shown = false;
			let imageWrap     = Element.create('a', elem, { class: 'modpack-image-wrap shadow lighten dynamic', href: '#' + modpack.id });
			let image         = Element.create('img', imageWrap, { class: 'modpack-image', src: processLink(modpack.img, true) });
			let nameContainer = Element.create('div', elem, 'container');
			let title         = Element.create('div', nameContainer, { class: 'modpack-title', text: modpack.name });
			title.addEventListener('dblclick', () => selectText(title));
			if (modpack.details && modpack.details.gameVersion) {
				Element.create('div', nameContainer, { class: 'modpack-version', text: modpack.details.gameVersion });
			}
			Element.create('div', elem, { class: 'divider-1' });
			let date;
			if ((date = modpack.date) instanceof Date) {
				let dateContainer = Element.create('div', elem, 'container');
				let dateConfig = {
					short: { day: 'numeric', month: 'short', year: 'numeric' },
					long:  { day: 'numeric', month: 'long',  year: 'numeric' }
				}
				Element.create('div', dateContainer, {
					class: 'dateText dateAbsolute',
					text: date.toLocaleDateString([], dateConfig.short),
					title: `${ date.toLocaleDateString([], dateConfig.long)} | ${ date.toLocaleTimeString() }`
				});
			}
		}
		function updateModpackVisibility(modpack, shouldBeShown) {
			var cl = modpack.elem.classList;
			if (modpack.shown != shouldBeShown) {
				if (shouldBeShown) {
					cl.remove('hide');
					modpack.shown = true;
					toBeDelayed.add(modpack);
					requestAnimationFrame(() => requestAnimationFrame(() => {
						if (modpack.shown) cl.remove('invisible');
					}));
				} else {
					cl.add('invisible');
					cl.add('hide');
					modpack.shown = false;
				}
			}
		}
	}
}

function drawModpack(modpack) {
	if (!modpack) return false;
	var img = $('#ModpackImage')[0];
	img.src = (modpack.img) ? processLink(modpack.img, true) : '';
	var title = emptyElem($('#ModpackTitle')[0]);
	Element.edit(title, { text: modpack.name });
	title.addEventListener('dblclick', () => selectText(title));
	var dlLinks = emptyElem($('#ModpackDlLinks')[0]);
	if (modpack.download !== undefined) {
		Element.create('a', dlLinks, { class: 'btn dynamic wave', href: processLink(modpack.download), download: '', text: `Скачать`, title: `Скачать ${modpack.name}` });
	}
	const table = emptyElem($('#ModpackDetailsTable')[0]);
	const modListElement = emptyElem($('#ModpackModList')[0]);
	if (modpack.details) {
		detailProperties.forEach(([k, text]) => {
			let v;
			if (k === 'date') {
				var date  = modpack.date;
				if (!date instanceof Date) return;
				v = date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
			} else {
				if (!modpack.details.hasOwnProperty(k)) return;
				v = modpack.details[k];
				if (k === 'size') {
					v += ' МБ'
				}
			}
			Element.create('div', table, { class: 'modpack-details-table-name', text: text });
			Element.create('div', table, { class: 'modpack-details-table-value', text: v });
		});
		let packMods = new Map(modpack.details.mods);
		console.log(modpack.details.mods, packMods);
		if (packMods) {
			mods.forEach((mod, id) => {
				console.log(id, mod);
				if (packMods.has(mod)) {
					let elem;
					if (mod.url) {
						elem = Element.create('a', modListElement, { href: mod.url, title: `Перейти на страницу мода ${mod.name}` });
					} else {
						elem = Element.create('span', modListElement);
					}
					Element.edit(elem, { text: mod.name });
					let version = packMods.get(mod);
					if (version) {
						elem.setAttribute('version', version);
					}
				}
			});
		}
	}
	var embeds = $('#embeds')[0];
	if (modpack.links && (window.curEmbedModpack != modpack || embeds.innerHTML == '')) {
    emptyElem(embeds);
		window.curEmbedModpack = modpack;
		var ytId = modpack.links.youtube.id;
		if (modpack.links.youtube && ytId) {
			var ytEmbedWrap = Element.create('div', embeds, 'yt-embed-wrap embed-wrap');
			var ytEmbedWrap2 = Element.create('div', ytEmbedWrap, 'yt-embed-wrap2');
			var ytEmbed = Element.create('iframe', ytEmbedWrap2, { class: 'yt-embed embed shadow dynamic', src: `https://www.youtube.com/embed/${ytId}?autoplay=0&origin=${location.href || (location + '') || location.pathname}`, frameborder: 0, allowfullscreen: true });
			if (modpack.links.youtube.aspectRatio) {
				ytEmbedWrap2.style['padding-bottom'] = 100 / modpack.links.youtube.aspectRatio + '%'
			}
		}
		if (embeds.innerHTML != '') {
			var closeButton = Element.create('a', embeds, { class: 'close-wrap', href: 'javascript:' }, 'embeds-close');
			var closeButtonIcon = Element.create('div', closeButton, 'close', 'embeds-close-icon');
			closeButton.addEventListener('click', () => emptyElem(embeds));
		}
	}
	return true;
}
function drawPage(hash, search) {
	if (typeof hash === 'string' || hash instanceof String) {
		hash = hash || location.hash;
	} else {
		hash = location.hash;
	}
	hash = hash.replace('#','');
	// console.log('Drawing the page using hash: ' + hash);
	if (document.body.id == 'list') {
		window.listScroll = scrollY;
	}
	if (hash === '') {
		removeHash();
		if (document.body.id == 'list') return false;
		document.body.id = 'list';
		document.title = `Сборки Aceon'а`;
		if (search) {
			Modpacks.Search.value = search;
			var srch = Modpacks.Search.elem;
			if (srch && srch.scrollIntoView) srch.scrollIntoView(true);
		} else {
			Modpacks.draw(modpackList);
		}
		let prevScroll = window.listScroll || window.listScrollDefault;
		if (prevScroll) scrollTo(scrollX, prevScroll);
	} else if (modpackList.has(hash)) {
		var modpack = modpackList.get(hash);
		document.body.id = 'info';
		document.title = modpack.name;
		if (search) {
			Modpacks.Search.value = search;
		}
		drawModpack(modpack);
		var srch = Modpacks.Search.elem;
		if (srch && srch.scrollIntoView) srch.scrollIntoView(true);
	} else {
		removeHash();
	}
}
userPreferences.ListViewStyle.addEventListener('change', value => {
	let cl = $('#ModpackList')[0].classList;
	((value === 'list') ? cl.add : cl.remove).bind(cl)('list');
});
window.addEventListener('hashchange', () => drawPage());
document.addEventListener('DOMContentLoaded', () => {
	let s = Modpacks.Search;
	$('#SearchForm')[0].addEventListener('submit', s.submit.bind(s), { passive: true });
	$('.search-clear > .circle-button')[0].addEventListener('click', s.clear.bind(s), { passive: true });
	['change', 'keydown'].forEach(eventName => $('#SearchInput')[0].addEventListener(eventName, s.update.bind(s), { passive: true }));
	$('#SearchInput')[0].addEventListener('mousedown', e => {
		s.bgElem.style.setProperty('--click-x', ` ${ e.layerX }px`);
		s.bgElem.style.setProperty('--click-y', ` ${ e.layerY }px`);
	});
}, { once: true });
document.addEventListener('DOMContentLoaded', () => {
	$('#ModpackListViewToggle')[0].addEventListener('click', () => userPreferences.ListViewStyle.toggle());
	let qs = getQueries();
	drawPage(qs.modpack, qs.q);
}, { once: true });
