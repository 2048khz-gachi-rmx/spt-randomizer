"use strict";

let fastlocale = global.rand_fastlocale;
let com = Randomizer.serverFunctions;
let sv = Randomizer.overrideServers;

let inraid = sv.inraid;

let realSaveProgress = inraid.saveProgress;
let fs = require("fs");

function saveProgress(offraidData, sessionID) {

    let pmcData = com.getPmcProfile(sessionID);

    if (!pmcData.IsRandomizer) {
        return realSaveProgress(offraidData, sessionID);
    }

    const isPlayerScav = offraidData.isPlayerScav;

    if (isPlayerScav) {
        return;
    }

    const isDead = (offraidData.exit !== "survived" && offraidData.exit !== "runner");

    pmcData.Info.Level = offraidData.profile.Info.Level;
    pmcData.Skills = offraidData.profile.Skills;
    pmcData.Stats = offraidData.profile.Stats;
    pmcData.Encyclopedia = offraidData.profile.Encyclopedia;
    pmcData.ConditionCounters = offraidData.profile.ConditionCounters;
    pmcData.Quests = offraidData.profile.Quests;

    // For some reason, offraidData seems to drop the latest insured items.
    // It makes more sense to use pmcData's insured items as the source of truth.
    offraidData.profile.InsuredItems = pmcData.InsuredItems;

    // add experience points
    pmcData.Info.Experience += pmcData.Stats.TotalSessionExperience;
    pmcData.Stats.TotalSessionExperience = 0;

    // level 69 cap to prevent visual bug occuring at level 70
    if (pmcData.Info.Experience > 13129881) {
        pmcData.Info.Experience = 13129881;
    }

    // sell off garbage and check in with items we didn't take into the raid
    // itemid rerolling happens there
    Randomizer.Class.postRaidRandomize(pmcData, offraidData, sessionID);

}

// Randomizer.overrideRoute("/raid/profile/save", saveProgress);

inraid.saveProgress = saveProgress; // just in case lol


let realAddPlayer = inraid.addPlayer;

inraid.addPlayer = function(ssid, info) {
    realAddPlayer.call(this, ssid, info);

    let pmcData = com.getPmcProfile(ssid);
    let eqID = pmcData.Inventory.equipment;

    let startingItems = sv.help.findAndReturnChildrenByItems(pmcData.Inventory.items, eqID)

    pmcData.tookInRaid = {};

    // mark every item we took into the raid
    for (let k in startingItems) {
        let id = startingItems[k]

        for (let k2 in pmcData.Inventory.items) {
            let itdata = pmcData.Inventory.items[k2]
            if (itdata._id === id) {
                pmcData.tookInRaid[id] = true
            }
        }
    }

}

let realRemovePlayer = inraid.removePlayer;

inraid.removePlayer = function(ssid) {
    realRemovePlayer.call(this, ssid);
    let pmcData = com.getPmcProfile(ssid);
    if (pmcData.IsRandomizer) { delete pmcData.tookInRaid; }
}


let ssid = `7922757a92d0df4ab7dd8310`;
let offraidData = fs.readFileSync("D:/json_test2.txt")

function a() {
    // let pmcData = profile_f.controller.getPmcProfile(ssid);
    // Randomizer.Class.giveRandomGun(ssid);
    // saveProgress(JSON.parse(offraidData), ssid);
}


setTimeout(a, 2000)
