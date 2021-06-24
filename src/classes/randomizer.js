"use strict";

// making this a class was a mistake but oh well

let fastlocale = global.rand_fastlocale;
let ragcat = global.rand_ragcat;

let com = Randomizer.serverFunctions;
let sv = Randomizer.overrideServers;

// handler for all things randomizer
class Controller {
	constructor() {

	}

	// these were lifted from helpfuncs.js

	findItemById(items, id) {
	    for (let item of items) {
	        if (item._id === id) {
	            return item;
	        }
	    }

	    return false;
	}

	isItemInStash(pmcData, item) {
		let container = item;

		while ("parentId" in container) {
			if (container.parentId === pmcData.Inventory.stash && container.slotId === "hideout") {
				return true;
			}

			container = this.findItemById(pmcData.Inventory.items, container.parentId);

			if (!container) {
				break;
			}
		}

		return false;
	}

	addMoney(pmcData, amount, ssid) {
		let currency = "5449016a4bdc2d6f028b456f"; // we only deal in RUB
		let calcAmount = amount;

		let output = com.item_getOutput(); // ugh output is mandatory

		// `sv.money` DOESNT WORK WTF???
		PaymentController.getMoney(pmcData, calcAmount, {
			"tid": "ragfair"
		}, output, ssid);

	}
	// delete fuckin everything
	deleteEverything(pmcData, ssid) {
		let toDelete = [];

		let stashID = pmcData.Inventory.stash;
		let eqID = pmcData.Inventory.equipment;
		let questRaidItems = pmcData.Inventory.questRaidItems;
		let questStashItems = pmcData.Inventory.questStashItems;

		for (let item of pmcData.Inventory.items) {
			let id = item._id

			if (id !== stashID &&
				id !== eqID &&
				id !== questRaidItems &&
				id !== questStashItems && item.slotId !== "Pockets")
				{ // yeet all items that won't break the fuckin inventory
					toDelete.push(item._id);
				}


			// also yeet pocket insides

			if (item.slotId === "Pockets") {
				for (let pocket of pmcData.Inventory.items) {
					if (pocket.parentId === item._id) {
						toDelete.push(pocket._id);
					}
				}
			}
		}


		for (let item of toDelete) {
			sv.inventory.removeItemFromProfile(pmcData, item);
		}

		pmcData.Inventory.fastPanel = {};

		pmcData.Inventory.items.push({ // gah
				"_id": "5df7b9abef12bf7a252437c2",
				"_tpl": "5449016a4bdc2d6f028b456f",
				"parentId": "5df7b9abef12bf7a2524385f",
				"slotId": "hideout",
				"location": {
					"x": 0,
					"y": 0,
					"r": 0,
					"isSearched": true
				},
				"upd": {
					"StackObjectsCount": 1
				}
			});
		return pmcData;
	}

	itemIsInSecureContainer(pmcData, iid) {
		let item = pmcData.Inventory.items.find(i => i._id === iid); // holy shit this should be quite slow
		//helpfunc_f.helpFunctions.findInventoryItemById(pmcData, iid)

	    while ("parentId" in item) {
	    	if (item.slotId === "SecuredContainer") {
	            return true;
	        }

	        item = pmcData.Inventory.items.find(i => i._id === item.parentId);
	        //helpfunc_f.helpFunctions.findInventoryItemById(pmcData, item.parentId);

	        if (!item) {
	            return false;
	        }
	    }
	}

	noAutoSell = [
		"Medical treatment",
		"Gear",
		"Provisions",
		"Keys",

		"Melee weapons",
		"Containers & cases"
	];

	// second argument is the array of items to sell
	sellEverything(pmcData, profile, ssid) {
		let money = 0;
		let profileData = 0

		for (let item of profile.Inventory.items) {
			let id = item._id
			let foundInRaid = true;

			if (pmcData.tookInRaid) { // ?? not really supposed to happen
				foundInRaid = pmcData.tookInRaid[id] ? false : true
			}

			let price = sv.handbook.getTemplatePrice(item._tpl);
			let amt = ("upd" in item && "StackObjectsCount" in item.upd) ? item.upd.StackObjectsCount : 1;
			// don't sell garbage like pockets and don't sell stuff you took in a raid
			if (price === 1 || !foundInRaid) {
				continue;
			}

			if (this.itemIsInSecureContainer(profile, item._id)) {
				console.log(fastlocale.itemToName(item._tpl) + " is in secure container; not selling");
				continue;
			}

			let cat = ragcat.getCategory(item._tpl);
			let subcat = ragcat.getSubCategory(item._tpl);

			if (this.noAutoSell.includes(cat) || this.noAutoSell.includes(subcat)) {
				//console.log("not selling " + item._tpl + " " + fastlocale.itemToName(item._tpl) + " : " + cat + "");
				continue;
			}

			let mult = rand_economy.getSellPriceMult(item._tpl);

			console.log( "Price for x" + amt + " " +
				fastlocale.itemToName(item._tpl) + " : " + price * mult * amt +
				" (x" + mult + " for " + cat + ", " + subcat + ")" );

			item.DeleteMe = true; // DELETE DOESNT WORK HELP ME

			money += price * mult * amt;
		}

		money = Math.floor(money);
		console.log("Adding " + money + "RUB\n");
		this.addMoney(pmcData, money, ssid);
	}

	setInventory(pmcData, profile) {
		sv.inventory.removeItemFromProfile(pmcData, pmcData.Inventory.equipment);
		sv.inventory.removeItemFromProfile(pmcData, pmcData.Inventory.questRaidItems);
		sv.inventory.removeItemFromProfile(pmcData, pmcData.Inventory.questStashItems);

		for (let item of profile.Inventory.items) {
			if (item.DeleteMe) { //AAAAAAA THIS IS SO CANCER
				continue;
			}
			pmcData.Inventory.items.push(item);
		}

		pmcData.Inventory.fastPanel = profile.Inventory.fastPanel;

		return pmcData;
	}

	postRaidRandomize(pmcData, raidData, ssid) {
		const isDead = (raidData.exit !== "survived" && raidData.exit !== "runner");

		if (!isDead) {
			this.sellEverything(pmcData, raidData.profile, ssid); // sell off stuff like guns & junk, this will modify raidData.Inventory.Items
			// then reroll ID's (we need old ID's to check-in with took-in-raid item list)
			raidData.profile.Inventory.items = sv.help.replaceIDs(raidData.profile, raidData.profile.Inventory.items, raidData.profile.Inventory.fastPanel);
			// and then merge the remaining items with the stash inventory
			this.setInventory(pmcData, raidData.profile);
		} else {
			this.deleteEverything(pmcData, ssid); // F
			this.giveRandomGun(ssid);
		}

		delete pmcData.tookInRaid;
	}

	ignoreRandomWeapons = {
		"Melee weapons": true, 	// we'll be giving out a guaranteed melee manually	( WIP: not implemented )
		"Throwables": true, 	// we might hand out a grenade randomly				( WIP: not implemented )
	};

	giveRandomGun(ssid) {
		let pmcData = com.getPmcProfile(ssid);
		let weps = ragcat.getItemsCategory("5b5f78dc86f77409407a7f8e"); // 'weapons' category
		let pool = []

		for (let wepCat in weps) {
			if (this.ignoreRandomWeapons[wepCat]) {continue;}
			pool.push(...weps[wepCat]);
		}

		let rand = Math.floor(Math.random() * Math.floor(pool.length));
		let wepID = pool[rand];

		// now we have a random gun's ID; find the cheapest offer on the flea market
		// with a functional gun and grab it

		let itName = fastlocale.itemToName(wepID);

		let preset = sv.presets.getStandardPreset(wepID);

		if (!preset) {
			// first time no preset; try initializing them in the event they werent
			preset.initialize();
			preset = sv.presets.getStandardPreset(wepID);
		}

		while (!preset) {
			// no preset again; likely the gun just doesnt have any presets
			console.log("!!! no preset for weapon ID: " + wepID);

			rand = Math.floor(Math.random() * Math.floor(pool.length));
			wepID = pool[rand];
		}

		// we can't just use the preset's IDs or we risk conflicts (i think)
		// so we copy the array then replace the IDs

		let items = [];
		for (let item of preset._items) {
			let copy = {};
			Object.assign(copy, item);
			items.push(copy);
		}

		//sv.help.replaceIDs(null, items);

		let output = com.item_getOutput() // bweh

		let addInfo = {
            "items": [{
            	"item_id": preset._id,
            	"count": 1,
            }],
            "tid": "ragfair"
        };

		sv.inventory.addItem(pmcData, addInfo, output, ssid);

		let price = 0;
		for (let item of items) {
			let itPrice = sv.handbook.getTemplatePrice(item._tpl);
			price += itPrice;
			console.log(itPrice + "RUB for " + rand_fastlocale.itemToName(item._tpl));
		}

		let money = Math.floor(price * Randomizer.config.initialMoneyCost);
		console.log("adding initial money: " + money + "(" + price + ")");
		this.addMoney(pmcData, money, ssid);

	}
}

let randomizerInst = new Controller();

module.exports.Randomizer = randomizerInst
global.Randomizer.Class = randomizerInst