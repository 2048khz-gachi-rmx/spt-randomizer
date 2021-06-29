const fs = require("fs");

let mod_cfg = {};
let randomizerConfig = {}


// if the JSON was messed up then don't overwrite the config with default values
let messedUpJSON = false;
let configPath = Randomizer.modPath + "/config.json";

try {
	// trying due to possible permissions issues n shit
	if (fs.existsSync(configPath)) {
		try {
			// trying due to possible invalid JSON
			let data = fs.readFileSync(configPath);
			mod_cfg = JSON.parse(data);
		} catch (e) {
			messedUpJSON = true;
			console.log("config.json didn't contain a valid JSON string");
			console.log(e);
		}
	}

} catch (e) {
	console.log("Exception while reading the randomizer config JSON: " + e);
}



// default configs; if you want to change the actual configs
// then you should check out `user/configs/randomizer.json`

let configKeys = {
	"keepSecureLoot": true,
	"initialMoneyCost": 1.5, // the price of the gun times this is given as money in the beginning

	"buyMults": {
		"!": "The key is the english name for a (sub)category.",
		"!!": "If it isn't found, `default` will be used instead.",
		"!!!": "Same applies for sellMults.",
		"___": "___",
		"default": 1.5,
		"Weapons": 5,
		"Weapon parts & mods": 1.5,
		"Magazines": 1,
		"Ammo": 0.5,
		"Tactical rigs": 0.75,		// most of your initial money will go to ammo and mags
        "Backpacks": 0.5,			// you'll need to pick lots of loot if you want to progress
        "Secured containers": 1,
		"Medical treatment": 0.4, // stims are fun
	},

	"sellMults": {
		"Weapons": 0.5,
		"Weapon parts & mods": 0.5,
		"Magazines": 1,
		"Ammo": 1,
		"default": 0.25,
	}
}

// storedCfg will be checked for potentially missing config keys
// defaultCfg is what it will be checking against
// if any of the configs are missing, default values from defaultCfg will be used

// output will be written into curcfg, return is whether any of the keys _were_ missing

function checkMissing(curCfg, defaultCfg, storedCfg) {
	let modded = false;

	for (let cfgName in defaultCfg) {
		let defaultValue = defaultCfg[cfgName];
		let storedValue = storedCfg && storedCfg[cfgName];

		if (!storedValue) {
			// missing config; use default value
			curCfg[cfgName] = defaultValue;
			modded = true; // store that a change occured and we need to save
		} else {

			// config was in the file
			if (defaultValue.constructor == Object) { // i dont like js
				// the value is a dictionary itself; check it for missing recursively
				curCfg[cfgName] = curCfg[cfgName] || {};
				modded = checkMissing(curCfg[cfgName], defaultValue, storedValue) || modded;
			} else {
				curCfg[cfgName] = storedValue;
			}

		}
	}

	return modded;
}

let modded = checkMissing(randomizerConfig, configKeys, mod_cfg);

if (modded && !messedUpJSON) {
	try {
		fs.writeFileSync(configPath, JSON.stringify(randomizerConfig, null, 4), () => {});
	} catch {
		console.log("Failed to write config file?? @ " + configPath);
	}
}

global.Randomizer.config = randomizerConfig;