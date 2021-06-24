"use strict";

// economy related stuff; currently just sell & buy price modifications

let locale = require("./fastlocale.js")
let ragcat = require("./ragfair_category.js")

function getBuyPriceMult(itemID) {
	let mult = Randomizer.config.buyMults.default || 1;

	let cat = rand_ragcat.getCategory(itemID);
	let subcat = rand_ragcat.getSubCategory(itemID);

	if (Randomizer.config.buyMults[subcat]) {
		mult = Randomizer.config.buyMults[subcat];
	} else if (Randomizer.config.buyMults[cat]) {
		mult = Randomizer.config.buyMults[cat];
	}

	return mult;
}

function getSellPriceMult(itemID) {
	let mult = Randomizer.config.sellMults.default || 1;

	let cat = rand_ragcat.getCategory(itemID);
	let subcat = rand_ragcat.getSubCategory(itemID);

	if (Randomizer.config.sellMults[subcat]) {
		mult = Randomizer.config.sellMults[subcat];
	} else if (Randomizer.config.sellMults[cat]) {
		mult = Randomizer.config.sellMults[cat];
	}

	return mult;
}

module.exports.getBuyPriceMult = getBuyPriceMult;
module.exports.getSellPriceMult = getSellPriceMult;

global.rand_economy = module.exports;