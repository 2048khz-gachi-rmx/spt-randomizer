"use strict";

let com = Randomizer.serverFunctions;
let sv = Randomizer.overrideServers;


function loadRandomizer() {
	require("./config.js");
	require("../libs");

	require("../classes/randomizer.js"); // load randomizer.Class

	require("./offraid.js");
	require("./trader.js");
	require("./ragfair.js");

	let preCreateProfile = sv.profileCreator.createProfile;

	//router.staticRoutes["/client/game/profile/create"] // don't break other mods

	function createProfile(info, sessionID) {

		let ret = preCreateProfile(info, sessionID)

		// first profile creations grant a random gun and money (as if you died)
		let pmcData = com.getPmcProfile(sessionID);

		console.log("Profile created; pmc data:", pmcData);
		console.log("Is randomizer? " + pmcData.IsRandomizer)

		if (pmcData.IsRandomizer) {
			Randomizer.Class.giveRandomGun(sessionID);
		}

		return ret;
	}

	//Randomizer.overrideRoute("/client/game/profile/create", createProfile);
	sv.profileCreator.createProfile = createProfile;

	require("./random_profile.js");



	// testing area //
	//console.log(DatabaseServer.tables.globals.ItemPresets);

	/*let ragcat = rand_ragcat
	let weps = ragcat.getItemsCategory("5b5f78dc86f77409407a7f8e"); // 'weapons' category
	let pool = []

	for (let wepCat in weps) {
		pool.push(...weps[wepCat]);
	}

	let rand = Math.floor(Math.random() * Math.floor(pool.length));
	let wepID = pool[rand];

	// now we have a random gun's ID; find the cheapest offer on the flea market
	// with a functional gun and grab it

	let itName = rand_fastlocale.itemToName(wepID);
	console.log("giving " + itName + ", " + wepID);

	sv.presets.initialize(); // have to do this unfortunately
	let preset = sv.presets.getStandardPreset(wepID);
	console.log(preset);
	// we can't just use the preset's IDs or we risk conflicts (i think)
	// so we copy the array then replace the IDs

	let items = [];
	for (let item of preset._items) {
		let copy = {};
		Object.assign(copy, item);
		items.push(copy);
	}

	sv.help.replaceIDs(null, items);*/

}

loadRandomizer();