"use strict";

// economy related stuff; currently just sell & buy price modifications

let locale = require("./fastlocale.js")
let ragcat = require("./ragfair_category.js")

let initialized = false;

let lkup = {};


function fillDict(dict, cat, mult, levels) {
	let id = ragcat.nameToID(cat);
	if (!id) {
		return;
	}

	let lv = ragcat.getCatLevel(id);

	let itemDict = ragcat.getItemsCategoryDict(id);

	for (let id in itemDict) {

		if (lv && levels[id] && levels[id] > lv) {
			// this already fell under a category deeper than the current one
			continue;
		}

		dict[id] = mult;
		levels[id] = lv
	}
}

var letterReg = /[A-Za-z0-9]/;

function initialize() {
	if (initialized) { return; }
	initialized = true;

	let lkupLevels = {};

	// create lookup dicts of [itemID] = priceMult

	lkup.buy = {}
	lkup.sell = {}

	for (let cat in Randomizer.config.sellMults) {
		if (cat == "default" || !cat.match(letterReg) ) { continue;}
		let mult = Randomizer.config.sellMults[cat];

		fillDict(lkup.sell, cat, mult, lkupLevels)
	}

	lkupLevels = {};

	for (let cat in Randomizer.config.buyMults) {
		if (cat == "default"  || !cat.match(letterReg)) { continue; }
		let mult = Randomizer.config.buyMults[cat];

		fillDict(lkup.buy, cat, mult, lkupLevels)
	}

}

function getBuyPriceMult(itemID) {
	initialize();

	let mult = Randomizer.config.buyMults.default || 1;
	let pred = lkup.buy[itemID] || mult;

	return pred;
}

function getSellPriceMult(itemID) {
	initialize();

	let mult = Randomizer.config.sellMults.default || 1;
	let pred = lkup.sell[itemID] || mult;

	return pred;
}

module.exports.getBuyPriceMult = getBuyPriceMult;
module.exports.getSellPriceMult = getSellPriceMult;

global.rand_economy = module.exports;