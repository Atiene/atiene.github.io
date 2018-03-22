class Mod {
	constructor(name, url) {
		this.name = name;
		if (url) this.url = url;
	}
}
const mods = new Map([
	['quark', new Mod(`Quark`)],
	['armorPlus', new Mod(`Armor Plus`)],
	['advSwords', new Mod('Advanced Swords')],
	['xaeroMap', new Mod(`Xaero’s Minimap`)],
	['jei', new Mod(`Just Enough Items`)],
	['torohealth', new Mod(`Torohealth`)],
	['quickLeaf', new Mod(`Quick Leaf Decay`)],
	['optifine', new Mod(`Optifine`)],
	['appleSkin', new Mod(`Apple Skin`, 'СЮДА МОЖНО ЗАПИХНУТЬ ССЫЛКУ НА МОД')],
	['waddles', new Mod(`Waddles`)],
	['armorHUDRev', new Mod(`Armors HUD Revived`)],
	['chunkAnim', new Mod(`Chunk Animator`)],
	['bttrTtlScr', new Mod(`Better Title Screen`)],
	['customBgs', new Mod(`Custom Backgrounds`)],
	['customMenu', new Mod(`Custom Main Menu`)],
	['shadowMC', new Mod('ShadowMC')],
	['timeHUD', new Mod('Time HUD')],
	['tails', new Mod('Tails')]
]);
class ModList {
	constructor(array) {
		array.forEach(([id, version], i) => {
			array[i][0] = mods.get(id);
		});
		return new Map(array);
	}
}
const modpackList = (() => {
	const Link = {
		youtube: id => `https://youtu.be/${id}`,
		googleDrive: id => `https://docs.google.com/uc?id=${id}&export=download`
	}
	const remix = (title, artist) => `${title} (${artist} Remix)`;
	const modpackList = new Map([
		['lumine1.2', {
			name: 'Lumine 1.2',
			img: '/img/cover_art/lumine1.2.jpg',
			links: {
				youtube: {
					id: '2OUVBkAXkRA',
					aspectRatio: 16 / 9
				}
			},
			download: `не ну те сложна на яндекс шоле кинуть`,
			details: {
				gameVersion: '1.12.2',
				size: 100, /* Размер в мегабайтах */
				mods: new ModList([
					['appleSkin', 'тут могла бы быть версия мода'],
					['armorPlus', 'и тут'],
					['armorHUDRev', 'ну ты понял'],
					['bttrTtlScr'],
					['chunkAnim'],
					['customBgs'],
					['quickLeaf'],
					['jei'],
					['optifine'],
					['quark'],
					['torohealth'],
					['waddles'],
					['xaeroMap']
				])
			},
			date: new Date(2018, 0, 6)
		}],
		['viture1.2', {
			name: 'Viture 1.2',
			img: '/img/cover_art/viture1.2.png',
			links: {
				youtube: {
					id: 'OryHJOt3UEU',
					aspectRatio: 16 / 9
				}
			},
			download: `те с кем сотрудничеш неодекватни`,
			details: {
				gameVersion: '1.10.2',
				size: 100, /* Размер в мегабайтах */
				mods: new ModList([
					['armorPlus'],
					['bttrTtlScr'],
					['chunkAnim'],
					['customBgs'],
					['quickLeaf'],
					['optifine'],
					['shadowMC'],
					['xaeroMap'],
					['customMenu'],
					['jei'],
					['timeHUD'],
					['quark'],
					['advSwords'],
					['tails']
				])
			},
			date: new Date(2018, 0, 6)
		}],
	]);

	modpackList.forEach((modpack, id) => {
		modpack.id = id;

		if (modpack.links.youtube && modpack.links.youtube.id) {
			modpack.links.youtube.href = Link.youtube(modpack.links.youtube.id);
		}
	});

	return modpackList;
})();

window.modpackList = modpackList;
