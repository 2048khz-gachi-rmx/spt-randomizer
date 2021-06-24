"use strict";

let com = Randomizer.serverFunctions;
let sv = Randomizer.overrideServers;
let realGetOffers = sv.ragfair.getOffers;

// awfulness; we need to make purchasing more expensive only for the randomized players
// so we can't modify the prices of the offers themselves (or they'll get more expensive
// for everyone, repeatedly, on each refresh)

// so we reply with more expensive copies of the offers for the visuals and
// multiply the prices on the actually-buying stage

// UPD: actually looks like emu just trusts the client's reply on the price lmfao
// so it'll take what the client told it to take, not what the offer costs
// trust the client y'all

// reply with more expensive copies

sv.ragfair.getOffers = function(ssid, req) {
	let out = realGetOffers.call(this, ssid, req);

	let pmcData = com.getPmcProfile(ssid);
	if (!pmcData.IsRandomizer) {return out;}

	let realOut = {} // holds copies of the offers from the ragfair
	Object.assign(realOut, out);
	realOut.offers = []

	for (let offer of out.offers) {
		let newOffer = {};

		// make a new offer and push all data from the original offer
		Object.assign(newOffer, offer);
		newOffer.requirements = [];

		let itemID = offer.items[0]._tpl;
		let mult = rand_economy.getBuyPriceMult(itemID);

	    if (mult != 0) {
	    	realOut.offers.push(newOffer);

	    	// then make it look more expensive
	    	for (let req of offer.requirements) {
	    		let cpy = {}
	    		Object.assign(cpy, req)
	        	newOffer.requirements.push(cpy)
	        	cpy.count *= mult; // i hate this
	    	}
	    }
	}

	return realOut
}


//let realConfirmRagfair = sv.trade.confirmRagfairTrading;
//
//// make the purchase more expensive but only for the randomized people
//function confirmRagfairTrading(pmcData, body, sessionID)
//{
//
//	if (!pmcData.IsRandomizer) {
//		return realConfirmRagfair(pmcData, body, sessionID);
//	}
//
//	console.log("randomizer buying somethinggg");
//    let output = ItemEventRouter.getOutput();
//
//    for (let offer of body.offers)
//    {
//        let data = RagfairServer.getOffer(offer.id);
// 		let mult = rand_economy.getBuyPriceMult(data.root);
//
//        pmcData = ProfileController.getPmcProfile(sessionID);
//        body = {
//            "Action": "TradingConfirm",
//            "type": "buy_from_trader",
//            "tid": (data.user.memberType !== 4) ? "ragfair" : data.user.id,
//            "item_id": data.root,
//            "count": offer.count,
//            "scheme_id": 0,
//            "scheme_items": offer.items
//        };
//
//        if (data.user.memberType !== 4)
//        {
//            // emutarkov removes items without checking whether you have enough money in the first place
//    		// veri nice
//            RagfairServer.removeOfferStack(data._id, offer.count);
//        }
//
//        /*for (let itmDat of body.scheme_items) {
//        	let item = pmcData.Inventory.items.find(i => i._id === itmDat.id);
//
//        	if (item) {
//        		if (sv.money.isMoneyTpl(item._tpl)) {
//        			itmDat.count *= mult;
//        		}
//        	}
//        }*/
//
//        output = TradeController.confirmTrading(pmcData, body, sessionID, false, data.items[0].upd);
//    }
//
//    return output;
//}
//
//sv.trade.confirmRagfairTrading = confirmRagfairTrading;