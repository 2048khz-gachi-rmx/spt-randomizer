"use strict";
// everything related to categorizing items as presented on the ragfair

let locale = require("./fastlocale.js")

let templates = Randomizer.overrideServers.db.tables.templates;

function tplLookup() {

    if (tplLookup.lookup === undefined) {
        const lookup = {
            items: {},
            categories: {byId: {}, byParent: {}, byName: {}}
        }

        for (let x of templates.handbook.Items) {
            lookup.items[x.Id] = x;
        }

        for (let x of templates.handbook.Categories) {
            lookup.categories.byId[x.Id] = x.ParentId ? x.ParentId : null;
            if (x.ParentId) { // root as no parent
                lookup.categories.byParent[x.ParentId] || (lookup.categories.byParent[x.ParentId] = []);
                lookup.categories.byParent[x.ParentId].push(x.Id);
            }

            let catname = locale.catToName(x.Id)
            if (!catname) {continue;}

            lookup.categories.byName[catname] = x.Id;
        }

        tplLookup.lookup = lookup;
    }

    return tplLookup.lookup;
}

function getCategory(id) {
	if (!id) { return; }

	let lkup = tplLookup()

	let catID = lkup.items[id]

	if (!catID) {
		// the regfair sells a lot of weird shit, like literally selling categories
		// we just bail and ignore those
		return;
	}

	catID = catID.ParentId

	// find the 'highest' category
	while (catID) {
		if (!lkup.categories.byId[catID]) {break;}
		catID = lkup.categories.byId[catID]
	}

	return locale.getLocale().handbook[catID]
}


function getSubCategory(id) {
	if (!id) { return; }

	let lkup = tplLookup()
	let parCatID = lkup.items[id]
	if (!parCatID) {
		return undefined
	}

	parCatID = parCatID.ParentId;

	return locale.getLocale().handbook[parCatID];
}

// gets ALL items that fall under this category or subcategory

// return is a dict of arrays, for example,
// for input `5b5f78dc86f77409407a7f8e` (which is cat 'Weapons'), the output will be:

//	{
//		"Assault rifles": ['itemID', 'itemID', ...],
//		"SMGs": ['itemID', 'itemID', ...],
//		...
//	}


function getItemsCategory(findCatID) {
	if (!findCatID) { return; }

	let lkup = tplLookup();
	let catMatch = {}; // if an item is within any of these categories, it'll be added to the output

	// first, find all subcategories of the provided category
	for (let catID in lkup.categories.byId) {

		if (catID === findCatID) {
			catMatch[catID] = true;
		}

		let nextCat = catID;

		findParentCat:
			while (nextCat) {
				nextCat = lkup.categories.byId[nextCat];
				if (nextCat === findCatID) {
					catMatch[catID] = true;
					break findParentCat;
				}
			}
	}

	let out = {};

	for (let itemID in lkup.items) {
		let item = lkup.items[itemID]
		let catID = item.ParentId
		// this item's category is a cat or a subcat we're looking for
		if (catMatch[ catID ]) {
			let catname = locale.catToName(catID)
			if (!out[catname]) {out[catname] = []}; // create an array in out if we have an item there
			out[catname].push(itemID)				// it's done here so we don't pollute it with empty arrays
		}											// (such as 'Grenade launchers' or 'Special weapons')
	}

	return out;
}

// same as above but returns just a dict where all items are keys
// great for when you need to know if an item falls within a certain category

/*
	{
		"itemID": true,
		"itemID": true,
		...
	}
*/

function getItemsCategoryDict(findCatID) {
	if (!findCatID) { return; }

	let lkup = tplLookup();
	let catMatch = {};

	// first, find all subcategories of the provided category yadda yadda yadda
	for (let catID in lkup.categories.byId) {

		if (catID === findCatID) {
			catMatch[catID] = true;
		}

		let nextCat = catID;

		findParentCat:
			while (nextCat) {
				nextCat = lkup.categories.byId[nextCat];
				if (nextCat === findCatID) {
					catMatch[catID] = true;
					break findParentCat;
				}
			}
	}

	let out = {};

	for (let itemID in lkup.items) {
		let item = lkup.items[itemID]
		let catID = item.ParentId
		// this item's category is a cat or a subcat we're looking for
		if (catMatch[ catID ]) {
			out[itemID] = true
		}
	}

	return out;
}

function getCatLevel(catID) {
	if (!catID) { return -1; }
	let lkup = tplLookup();
	let ret = 0;

	while (catID) {
		if (!lkup.categories.byId[catID]) {break;}
		catID = lkup.categories.byId[catID]
		ret++;
	}

	return ret;
}

function nameToID(name) {
	let lkup = tplLookup();
	return lkup.categories.byName[name]
}

module.exports.tplLookup = tplLookup;
module.exports.getCategory = getCategory;
module.exports.getSubCategory = getSubCategory;
module.exports.getItemsCategory = getItemsCategory;
module.exports.getItemsCategoryDict = getItemsCategoryDict;
module.exports.nameToID = nameToID;
module.exports.getCatLevel = getCatLevel;

global.rand_ragcat = module.exports