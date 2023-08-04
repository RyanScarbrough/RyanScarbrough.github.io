import { serializeError } from 'serialize-error';

import fetch from "node-fetch";

import { deserialize, serialize } from "bson";
import WebSocket from "ws";

import { MongoClient } from "mongodb"

///////////////////////
console.log("Fetching world/item id's...")

let worldIds;
let itemIds;

try {

	worldIds = await fetch('https://xivapi.com/World')
		.then((response) => response.json())
		.then((data) => {
			let idealWorldArray = [];

			data.Results.forEach((world) => {
				idealWorldArray[world.ID] = world.Name;
			})

			return idealWorldArray;
		});

	itemIds = await fetch('https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/items.json')
		.then((response) => response.json());

} catch(error) {
		logError("Error retrieving id's.", error);
}

///////////////////////
console.log("Connecting to mongodb...");

const mongoClient = new MongoClient('mongodb://localhost:27017');
const dbName = 'test';

try {
	await mongoClient.connect();
} catch(error) {
	logError("Error connecting to mongodb.", error);
}

const mongoDB = mongoClient.db(dbName)

console.log("Connected!");

///////////////////////
console.log("Connecting to Universalis...")

const addr = "wss://universalis.app/api/ws";

let startTime;
let numberOfCalls;

let collectionExistedCount;
let collectionExistedCache = {};

connectToUniversalis();

function connectToUniversalis() {
	console.log("Opening web socket to Universalis...")

	let ws = new WebSocket(addr);

	let finishedUpdatingMongoDBItems = false;

	ws.on("open", async () => { 
		console.log("Web socket connection to Universalis opened.");

		try {
			ws.send(serialize({ event: "subscribe", channel: "listings/add{world=78}" })); // Behemoth
			ws.send(serialize({ event: "subscribe", channel: "listings/add{world=93}" })); // Excalibur
			ws.send(serialize({ event: "subscribe", channel: "listings/add{world=53}" })); // Exodus
			ws.send(serialize({ event: "subscribe", channel: "listings/add{world=35}" })); // Famfrit
			ws.send(serialize({ event: "subscribe", channel: "listings/add{world=95}" })); // Hyperion
			ws.send(serialize({ event: "subscribe", channel: "listings/add{world=55}" })); // Lamia
			ws.send(serialize({ event: "subscribe", channel: "listings/add{world=64}" })); // Leviathan
			ws.send(serialize({ event: "subscribe", channel: "listings/add{world=77}" })); // Ultros

			ws.send(serialize({ event: "subscribe", channel: "sales/add{world=78}" })); // Behemoth
			ws.send(serialize({ event: "subscribe", channel: "sales/add{world=93}" })); // Excalibur
			ws.send(serialize({ event: "subscribe", channel: "sales/add{world=53}" })); // Exodus
			ws.send(serialize({ event: "subscribe", channel: "sales/add{world=35}" })); // Famfrit
			ws.send(serialize({ event: "subscribe", channel: "sales/add{world=95}" })); // Hyperion
			ws.send(serialize({ event: "subscribe", channel: "sales/add{world=55}" })); // Lamia
			ws.send(serialize({ event: "subscribe", channel: "sales/add{world=64}" })); // Leviathan
			ws.send(serialize({ event: "subscribe", channel: "sales/add{world=77}" })); // Ultros
		} catch(error) {
			logError("Error sending subscribes.", error);
		}

		resetStats();

		await updateMongoDBItems();

		resetStats();

		finishedUpdatingMongoDBItems = true;
	});

	ws.on("error", (event) => {
		logError("WebSocket onerror: " + event.message);
		ws.close();
	})

	ws.on("close", async (event) => {
		console.log('\x1b[31m%s\x1b[0m', "Connection to Universalis closed, event code " + event.code + ".");
		console.log("Reason: " + event.reason);
		console.log("wasClean: " + event.wasClean);

		logError("Connection to Universalis closed, event code " + event.code + ". \nReason: " + event.reason + "\nwasClean: " + event.wasClean);

		console.log("Checking FFXIV server status...")

		let currentStatus = await fetch(`http://frontier.ffxiv.com/worldStatus/current_status.json`)
										.then((response) => response.json());

		while(currentStatus.Famfrit !== 1) {
			console.log(new Date().toLocaleString().replace(',',''));
			console.log('\x1b[31m%s\x1b[0m', `FFXIV game is down, (status ${currentStatus.Famfrit}), checking to see if it's back up in 5 seconds...`);

			await new Promise(resolve => setTimeout(resolve, 5000));

			currentStatus = await fetch(`http://frontier.ffxiv.com/worldStatus/current_status.json`)
										.then((response) => response.json());
		}

		console.log('\x1b[32m%s\x1b[0m', "FFXIV game server is running, attempting web socket reconnect!");

		setTimeout(() => connectToUniversalis(), 10000);
	});

	const currentlyCreatingCollectionFor = {}

	ws.on("message", async data => {
		const message = deserialize(data);

		let itemID = message.item;
	    const itemName = itemIds[itemID].en;
	    itemID = itemID.toString();

	    const worldID = message.world;
		const worldName = worldIds[worldID];

		if(message.event === 'listings/add' && finishedUpdatingMongoDBItems) {
			console.log("New message from Universalis: '" + message.event + "' item: " + itemID);
			numberOfCalls.inbound.listingCalls++;

			if(await doesCollectionExist(itemID)) {
				collectionExistedCount++;

				console.log('\x1b[35m%s\x1b[0m', "Collection exists: (" + itemID + "): " + itemName);
			} else if(!currentlyCreatingCollectionFor[itemID]) {
				try {
					currentlyCreatingCollectionFor[itemID] = true;

					const jsonResponse = await getSalesHistoryFromUniversalis(itemID);

					if(jsonResponse.entries.length > 0) {

						const entriesWithIds = jsonResponse.entries.map(entry => ({ _id: salesEntryStringify(entry), ...entry }));

						insertSalesEntriesIntoMongoDB(itemID, entriesWithIds, true)
							.then(didSucceed => { if(!didSucceed) currentlyCreatingCollectionFor[itemID] = false })

					} else {
						currentlyCreatingCollectionFor[itemID] = false;
					    console.log('\x1b[31m%s\x1b[0m', itemID + " had 0 entries from fetched history API.");
					    logError(itemID + " had 0 entries from fetched history API.")
					}

				} catch(error) {
					currentlyCreatingCollectionFor[itemID] = false;
					logError("Error fetching item " + itemID + " history from Universalis API.", error);

				}
			} else {
				console.log('\x1b[34m%s\x1b[0m', "Already currently creating collection: " + itemID);
			}

		} else if(message.event === 'sales/add') {
			console.log("New message from Universalis: '" + message.event + "' item: " + itemID);
			numberOfCalls.inbound.salesCalls++;

			if(await doesCollectionExist(itemID)) {
				// add worldID and worldName to each sales entry from 'sales/add' message, as by default it is null
				for(let i = 0; i < message.sales.length; i++) {
					message.sales[i].worldID = worldID;
					message.sales[i].worldName = worldName;
				}

				const entriesWithIds = message.sales.map(entry => ({ _id: salesEntryStringify(entry), ...entry }));

				insertSalesEntriesIntoMongoDB(itemID, entriesWithIds, false, "sales/add")

			} else {
				// Sometimes sales messages for an item come right before its listing message.
				// Rather than complicating things by creating its sales history here and adding to it,
				// The listing message will just create its sales history database for the next time a sale comes in.

				// console.log('\x1b[31m%s\x1b[0m', "Could not update sales data for item #" + itemID + ", database doesn't exist.");
			}
		}

	  //   fetch('https://universalis.app/api/v2/Primal/' + message.item)
			// .then((response) => response.json())
			// .then((data2) => {

		 //    console.log("");
		 //    console.log("New listed items calculation!");
		 //    console.log("World [" + message.world + "] : " + worldName);
		 //    console.log("Item [" + message.item + "] : " + itemName);

		 //    let hqListings = [];
		 //    let nqListings = [];

		 //    message.listings.forEach(listingItem => {
		 //    	if(listingItem.hq === true) {
		 //    		hqListings.push(listingItem);
		 //    	} else {
		 //    		nqListings.push(listingItem);
		 //    	}
		 //    })

		 //    if(hqListings.length > 0) {
			//     const cheapestHQListing = hqListings[0];
			//     var cheapestHQListingPrice = hqListings[0].pricePerUnit * 1.05;
			//     var cheapestHQListingQuantity = hqListings[0].quantity;

			//     console.log("Cheapest HQ Listing:");
			//     console.log("Buying price: " + cheapestHQListingPrice + " x " + cheapestHQListingQuantity);
			//     console.log(cheapestHQListing);
		 //    }

		 //    if(nqListings.length > 0) {
			//     const cheapestNQListing = nqListings[0];
			//     var cheapestNQListingPrice = nqListings[0].pricePerUnit * 1.05;
			//     var cheapestNQListingQuantity = nqListings[0].quantity;

			//     console.log("Cheapest NQ Listing:");
			//     console.log("Buying price: " + cheapestNQListingPrice + " x " + cheapestNQListingQuantity);
			//     console.log(cheapestNQListing);
		 //    }

			// 	console.log("Market board sales data:");
			// 	console.log("Average HQ Price: " + data2.averagePriceHQ);
			// 	console.log("Average NQ Price: " + data2.averagePriceNQ);
			// 	console.log(" ---- ");

			//     if(hqListings.length > 0) {
			//     	const profit = data2.averagePriceHQ * cheapestHQListingQuantity - cheapestHQListingPrice * cheapestHQListingQuantity;

			//     	printProfit(profit);
			//     }
			//     if(nqListings.length > 0) {
			//     	const profit = data2.averagePriceNQ * cheapestNQListingQuantity - cheapestNQListingPrice * cheapestNQListingQuantity;

			//     	printProfit(profit);
			//     }
			// })
	});
}

///////////////////////
async function updateMongoDBItems() {
	const collectionArray = await mongoDB.listCollections().toArray();
	const itemHistoryCollectionArray = collectionArray.filter(document => /^\d+$/.test(document.name))

	console.log('\x1b[34m%s\x1b[0m', "Updating mongoDB items...")

	let didPrintPercent = {}
	for (let i = 0; i < itemHistoryCollectionArray.length; i++) {
		updateMongoDBItemSalesEntries(itemHistoryCollectionArray[i].name);

		const percentThrough = Math.round((i / itemHistoryCollectionArray.length).toFixed(2) * 100)
		if(!didPrintPercent[percentThrough]) {
			console.log('\x1b[34m%s\x1b[0m', percentThrough + "% through!");
			didPrintPercent[percentThrough] = true;
		}

		await new Promise(resolve => setTimeout(resolve, 100));
	}

	await new Promise(resolve => setTimeout(resolve, 10000));

	console.log('\x1b[34m%s\x1b[0m', "Finished!")
}

///////////////////////
async function updateMongoDBItemSalesEntries(itemID) {
	const { entries: salesEntriesFromUniversalis } = await getSalesHistoryFromUniversalis(itemID);

	const salesEntriesFromMongoDB = await getSalesHistoryFromMongoDB(itemID);

	const salesEntriesToUpdate = getSalesEntryDifferences(salesEntriesFromUniversalis, salesEntriesFromMongoDB);
	const toUpdateCount = salesEntriesToUpdate.length;

	console.log(`${itemID}: new sales entries to update - ${toUpdateCount}`)

	if(toUpdateCount) {
		const entriesWithIds = salesEntriesToUpdate.map(entry => ({ _id: salesEntryStringify(entry), ...entry }));

		const didSucceed = await insertSalesEntriesIntoMongoDB(itemID, entriesWithIds, false, "updateMongoDBItemSalesEntries")

		if(!didSucceed) console.log('\x1b[31m%s\x1b[0m', "FAIL: " + itemID);
	}
}

///////////////////////
async function getSalesHistoryFromUniversalis(itemID, options = {}) {
	const entriesToReturn = options.entriesToReturn || 999999;
	const statsWithinMillis = options.statsWithinMillis;
	const entriesWithinSeconds = options.entriesWithinSeconds;

	const statsWithinUrlPart = statsWithinMillis ? `&statsWithin=${statsWithinMillis}` : ``;
	const entriesWithinUrlPart = entriesWithinSeconds ? `&entriesWithin=${entriesWithinSeconds}` : ``;

	if(numberOfCalls) numberOfCalls.outbound.apiCalls++;

	const jsonResponse = await fetch(`https://universalis.app/api/v2/history/Primal/${itemID}?entriesToReturn=${entriesToReturn}`
								+ statsWithinUrlPart + entriesWithinUrlPart)
						.then((response) => response.json())
						.catch(error => logError("Error from Universalis history fetch for " + itemID + " (too fast?): ", error));

	if(!jsonResponse) return getSalesHistoryFromUniversalis(itemID, options);

	return jsonResponse;
}

///////////////////////
async function getSalesHistoryFromMongoDB(itemID) {
	const collection = mongoDB.collection(itemID.toString());

	const itemSalesArray = await collection.find({}).toArray();

	return itemSalesArray;
}

///////////////////////
const resetTimeInMinutes = 60;
const printFrequencyInSeconds = 10;

let printCount = 0;

setInterval(calculateStats, 1000);

function calculateStats() {
	const millisecondsSinceStart = Date.now() - startTime;
	const secondsSinceStart = millisecondsSinceStart / 1000;

	const printFrequenciesOccured = Math.trunc(secondsSinceStart / printFrequencyInSeconds);

	// when printing frequency has passed
	if(printFrequenciesOccured > printCount) {
		const totalInboundCalls = numberOfCalls.inbound.listingCalls + numberOfCalls.inbound.salesCalls;
		const totalInboundCallsPerSecond = (totalInboundCalls / secondsSinceStart).toFixed(2);

		const listingCallsPerSecond = (numberOfCalls.inbound.listingCalls / secondsSinceStart).toFixed(2);
		const salesCallsPerSecond = (numberOfCalls.inbound.salesCalls / secondsSinceStart).toFixed(2);

		const outboundCallsPerSecond = (numberOfCalls.outbound.apiCalls / secondsSinceStart).toFixed(2);

		const percentCollectionsExisted = (collectionExistedCount / numberOfCalls.inbound.listingCalls).toFixed(2) * 100;

		console.log('\x1b[33m%s\x1b[0m', "Percent collections existed: " + percentCollectionsExisted + "%");
		console.log('\x1b[33m%s\x1b[0m', "Total Universalis API calls per second: " + outboundCallsPerSecond);
		console.log('\x1b[33m%s\x1b[0m', "Total inbound calls per second: " + totalInboundCallsPerSecond);
		console.log('\x1b[33m%s\x1b[0m', "Listing calls per second: " + listingCallsPerSecond);
		console.log('\x1b[33m%s\x1b[0m', "Sales calls per second: " + salesCallsPerSecond);
		console.log("total API calls: " + numberOfCalls.outbound.apiCalls)
		console.log("");

		printCount++;
	}

	// when to save and reset stats
	if(secondsSinceStart > resetTimeInMinutes * 60) {
		console.log('\x1b[33m%s\x1b[0m', "\n" + resetTimeInMinutes + " minutes has passed, saving & resetting stats.");

		const totalInboundCalls = numberOfCalls.inbound.listingCalls + numberOfCalls.inbound.salesCalls;
		const totalInboundCallsPerSecond = (totalInboundCalls / secondsSinceStart).toFixed(2);

		const listingCallsPerSecond = (numberOfCalls.inbound.listingCalls / secondsSinceStart).toFixed(2);
		const salesCallsPerSecond = (numberOfCalls.inbound.salesCalls / secondsSinceStart).toFixed(2);

		const outboundCallsPerSecond = (numberOfCalls.outbound.apiCalls / secondsSinceStart).toFixed(2);

		const percentCollectionsExisted = (collectionExistedCount / numberOfCalls.inbound.listingCalls).toFixed(2) * 100;

		const endTime = Date.now();

		const currentStats = {
			startTime: startTime,
		    endTime: endTime,
		    percentCollectionsExisted: percentCollectionsExisted,
		    outboundCallsPerSecond: outboundCallsPerSecond,
		    totalInboundCallsPerSecond: totalInboundCallsPerSecond,
		    listingCallsPerSecond: listingCallsPerSecond,
		    salesCallsPerSecond: salesCallsPerSecond,
		    totalInboundCalls: totalInboundCalls,
		    listingCalls: numberOfCalls.inbound.listingCalls,
		    salesCalls: numberOfCalls.inbound.salesCalls
		}

		const statsCollection = mongoDB.collection("stats");

		statsCollection.insertOne(currentStats)
			.then(value => {
		        console.log('\x1b[33m%s\x1b[0m', "Stats saved.");
		    })
		    .catch(error => {
				logError("Error saving stats.", error)
		    })

		printCount = 0;

		resetStats();
	}

}

function resetStats() {
	startTime = Date.now();
	numberOfCalls = { inbound: { listingCalls: 0, salesCalls: 0 }, outbound: { apiCalls: 0 } };
	collectionExistedCount = 0;
}

///////////////////////
async function insertSalesEntriesIntoMongoDB(itemID, salesEntries, isNewCollection, type = "") {
	const itemSalesCollection = mongoDB.collection(itemID);
	
	let entriesSavedAmount;
	let duplicatesAmount = 0;

	try {
		const document = await itemSalesCollection.insertMany(salesEntries, { ordered: false });

		entriesSavedAmount = document.insertedCount;
	} catch (error) {
		if(error.code?.toString() === '11000' && !error.writeConcernError) {
			entriesSavedAmount = error.result.nInserted;
			duplicatesAmount = error.writeErrors.length;
		} else {
			logError("Error inserting sales entries into " + isNewCollection ? "new" : "existing" + "  mongodb collection for " + itemID + ".", error)
		}
	}

	if(!entriesSavedAmount) {
		console.log('\x1b[34m%s\x1b[0m', "No entries saved for (" + itemID + ")!\nEntries: " + salesEntries.length + "\nDuplicates: " + duplicatesAmount);
		return false;
	}

	// updateItemStatsInMongoDB(itemID); // not need for yet

	if(isNewCollection) {
		console.log('\x1b[32m%s\x1b[0m', "Created item history for (" + itemID + "): " + itemIds[itemID].en + ". Entries created: #" + entriesSavedAmount);
	} else {
		console.log('\x1b[32m%s\x1b[0m', type + " updated item history for (" + itemID + "): " + itemIds[itemID].en + ". Entries updated: #" + entriesSavedAmount);
	}

	if(duplicatesAmount) {
		console.log('\x1b[34m%s\x1b[0m', "Duplicates found: " + duplicatesAmount);
	}

	return true;
}

///////////////////////
// No need for last upload time yet...
function updateItemStatsInMongoDB(itemID) {
	const itemStatsCollection = mongoDB.collection(itemID + "-stats");

	const stats = {
		lastUploadTimeInMillisecondsSinceEpoch: Math.round(Date.now())
	}

	itemStatsCollection.replaceOne({}, stats, {upsert: true})
		.then(document => {
			if(document.upsertedId) {
				// console.log('\x1b[34m%s\x1b[0m', "Created stats document for " + itemID)
			} else {
				// console.log('\x1b[34m%s\x1b[0m', "Updated stats document for " + itemID)
			}
		})
		.catch(error => {
			logError("Error saving stats for item " + itemID + ".", error);
		})
}

///////////////////////
async function doesCollectionExist(collectionName) {
	if(collectionExistedCache[collectionName]) {
		console.log('\x1b[31m%s\x1b[0m', "Saved by cache!")
		return true;
	}

	let collectionArray = await mongoDB.listCollections().toArray();

	if(collectionArray.some(document => document.name === collectionName)) {
		collectionExistedCache[collectionName] = true;

		return true;
	} else {
		return false;
	}
}

///////////////////////
function getSalesEntryDifferences(universalisSalesEntries, mongoDBSalesEntries) {
	const mongoDBSalesEntriesStringified = {};
	mongoDBSalesEntries.forEach(entry => mongoDBSalesEntriesStringified[salesEntryStringify(entry)] = true);

	const salesEntriesOnlyInUniversalis = universalisSalesEntries.filter(entry => !mongoDBSalesEntriesStringified[salesEntryStringify(entry)])

	return salesEntriesOnlyInUniversalis;
}

///////////////////////
function logError(customMessage, error) {

	if(error === undefined) {
		error = {
			name: "",
			message: "",
			stack: ""
		}
	}

	if(error.name === undefined) {
		error.name = "undefined"
	}
	if(error.message === undefined) {
		error.message = "undefined"
	}
	if(error.stack === undefined) {
		error.stack = "undefined"
	}

	console.log('\x1b[31m%s\x1b[0m', "ERROR:")
	console.log('\x1b[31m%s\x1b[0m', customMessage)
	console.log('\x1b[31m%s\x1b[0m', "name: " + error.name)
	console.log('\x1b[31m%s\x1b[0m', "message: " + error.message)
	console.log('\x1b[31m%s\x1b[0m', "error: " + error)

	const errorLog = {
		time: Date.now(),
		customMessage: customMessage,
		...(serializeError(error))
	}

	const errorLogCollection = mongoDB.collection("errorlogs");

	errorLogCollection.insertOne(errorLog)
		.then(value => {
	        console.log('\x1b[33m%s\x1b[0m', "Error saved!");
	    })
	    .catch(error => {
			console.log('\x1b[31m%s\x1b[0m', "COULD NOT SAVE ERROR!!")
			console.log('\x1b[31m%s\x1b[0m', "COULD NOT SAVE ERROR!!")
			console.log('\x1b[31m%s\x1b[0m', "COULD NOT SAVE ERROR!!")
			console.log('\x1b[31m%s\x1b[0m', "COULD NOT SAVE ERROR!!")
			console.log('\x1b[31m%s\x1b[0m', "COULD NOT SAVE ERROR!!")
			console.log('\x1b[31m%s\x1b[0m', "----------------------")
			console.log('\x1b[31m%s\x1b[0m', error)
	    })

}

///////////////////////
function salesEntryStringify(salesEntry) {
	return salesEntry.worldID + "-" + salesEntry.timestamp + "-" + salesEntry.pricePerUnit + "-" + salesEntry.quantity;
}

///////////////////////
function printProfit(profit) {
	if(profit > 5000) {
		console.log('\x1b[34m%s\x1b[0m', "HQ Profit: " + profit)
	} else if (profit > 1000) {
		console.log('\x1b[32m%s\x1b[0m', "HQ Profit: " + profit)
	} else if (profit < 0) {
		console.log('\x1b[31m%s\x1b[0m', "HQ Profit: " + profit)
	} else {
		console.log('\x1b[33m%s\x1b[0m', "HQ Profit: " + profit)
	}
}