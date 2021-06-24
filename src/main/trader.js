"use strict";

// yeet the default callback so we can initialize the trader class and then
// override the sell function in it for x0.1 prices

let com = Randomizer.serverFunctions;
let sv = Randomizer.overrideServers;
let trader = sv.trader;

function detourTrader() {
	var realSellFunc = trader.getPurchasesData;

	// detour the traders so that they pay less for every item sold

	trader.getPurchasesData = function(traderID, sessionID) {
		let out = realSellFunc.call(this, traderID, sessionID);

		let pmcData = com.getPmcProfile(sessionID);
		if (!pmcData.IsRandomizer) { return out; }

		let iidToTemplate = {}

		for (let itm of pmcData.Inventory.items) {
			// AAAAAAAAA
			iidToTemplate[itm._id] = itm._tpl;
		}

		for (let itemID in out) {
			let tplID = iidToTemplate[itemID];
			let mult = rand_economy.getSellPriceMult(tplID);

			let itemData = out[itemID][0][0] // idk why [0][0] is there

			itemData.count *= mult;
			itemData.count = Math.round(itemData.count)
			if (itemData.count === 0) {
				delete out[itemID]
			};
		}

		return out
	}

	var realAssortFunc = trader.getAssort;

	// getAssort takes ssID, tID but getPurchasesData takes tID, ssID
	// real good consistency there bruv

	// im not modifying the template barters themselves because fence does the stinky poop otherwise
	// i _could_ hardcode raising the price via this function for fence only but
	// it feels even more hacky than this

	trader.getAssort = function(sessionID, traderID) {
		let out = realAssortFunc.call(this, sessionID, traderID);

		let pmcData = com.getPmcProfile(sessionID);
		if (!pmcData.IsRandomizer) { return out; }

		console.log(traderID);
		let bs = out.barter_scheme;

		if (traderID === "579dc571d53a0658a154fbec") {
			// fence's assortment isn't copied unlike regular traders
			// instead of dealing with this shit i'll just disable fence for randomizer'd players
			// use the flea market, fuck you
			return {};
		}

		//console.log(out);

		// id is barter ID, not item ID
		let barter2item = {}

		for (let item of out.items) {
			// the trader data structure sucks wtf
			barter2item[item._id] = item._tpl;
		}

		//console.log(out.items)

		for (let id in bs) {
			let data = bs[id][0][0];

			if (data._tpl == "5449016a4bdc2d6f028b456f" || // rub, dollar or euro
				data._tpl == "569668774bdc2da2298b4568" ||
				data._tpl == "5696686a4bdc2da3298b456a") {

				//console.log("getAssort: " + id, barter2item[id]);

				let mult = rand_economy.getBuyPriceMult(barter2item[id]);

				data.count = Math.round(data.count * mult);
			}
		}

		return out
	}

}


detourTrader();