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

		if (pmcData.IsRandomizer) {
			Randomizer.Class.giveRandomGun(sessionID);
		}

		return ret;
	}

	sv.profileCreator.createProfile = createProfile;

	require("./random_profile.js");
}

loadRandomizer();