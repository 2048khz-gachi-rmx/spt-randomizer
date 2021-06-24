"use strict";

let com = Randomizer.serverFunctions;
let sv = Randomizer.overrideServers;

let templates = sv.db.tables.templates;

let profiles = com.recurLoad(Randomizer.modPath + "/db/profile/Randomizer/");
//templates.profiles["Randomizer"] = common_f.json.deserialize(common_f.vfs.readFile(file));

templates.profiles["Randomizer"] = profiles.characters.Randomizer;