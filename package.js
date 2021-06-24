global.Randomizer = {};
Randomizer.modPath = __dirname;

Randomizer.overrideServers = {
	// i'm fucking tired of senko renaming shit every 5 seconds
	"db": 				DatabaseServer,
	"trader":			TraderController,
	"inraid":			InraidController,
	"ragfair":			RagfairController,
	"trade": 			TradeController,
	"help": 			ItemHelper,
	"profileCreator":	ProfileController,
	"inventory":		InventoryController,
	"handbook":			HandbookController,
	"routes":			HttpRouter.onStaticRoute,
	"presets":			PresetController,
	"money":			PaymentController,
}

Randomizer.serverFunctions = {
	"item_getOutput": 		ItemEventRouter.getOutput,
	"getPmcProfile": 		ProfileController.getPmcProfile,
	"recurLoad": 			DatabaseImporter.loadRecursive,
	"httpBody": 			HttpResponse.getBody,
}

/*Randomizer.overrideRoute = function(route, newFunc) {
	// gonna puke :x
	Randomizer.overrideServers.routes[route]["aki"] = newFunc;
}*/

//require("./src/randomizer_load.js");
require("./src/main/init.js");