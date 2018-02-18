//setting up and and configuring required node.js modules
require("dotenv").config();
var dataKeys = require("./keys.js");
var fs = require("fs");
var request = require("request");
var Twitter = require("twitter");
var client = new Twitter(dataKeys.twitter);
var Spotify = require("node-spotify-api");
var spotify = new Spotify(dataKeys.spotify);

//GLOBAL VARIABLES ===========================================================
var results;
var doingItResults;
var didItFirst;
var didItSecond;
var didItThird;
var didItFourth;
var caseData = process.argv[2];
var functionData = process.argv[3];
var procArgv;

//FUNCTIONS START ===========================================================

//spotZilla takes inputs in the form:
//node liri.js spotify <any song title> for the top 10 results related to that title,
//or <LEAVE BLANK> for the top 10 search result on "The Sign" from Ace of Base.
//NOTE: I changed the commands (spotify-this-song is now just "spotify" - no quotes) because I, and my LIRI, hate dashes.
function spotZilla(functionData) {
	procArgv = process.argv;
	if(!functionData){
		functionData = "The+Sign+Ace+of+Base";
	}
	else {
		for (var i = 4; i < procArgv.length; i++) {
			if (i > 3 && i < procArgv.length) {
				functionData = functionData + "+" + procArgv[i];	
			}
			else {
				functionData += procArgv[i];
			}
		}	
	}
	spotify.search({ type: "track", query: functionData }, function(err, data) {
		if(!err){
			var songInfo = data.tracks.items;
			updateLogCmd(caseData, functionData); //LOG command line data to log.txt file
			for (var i = 0; i < 10; i++) {
				var tick = i + 1;
					results = 
						"\nTop 10 Spotify result for: " + functionData + 
						" ============" +  
						"\n#" + tick + 
						":" + 
						"\nSong: " + songInfo[i].name +
						"\nArtist: " + songInfo[i].artists[0].name +
						"\nAlbum: " + songInfo[i].album.name +
						"\nPreview Url: " + songInfo[i].preview_url +
						"\n";
					console.log(results); //Display results on screen
					updateLogData(results); //LOG returned data to log.txt file
			}
		}
	});
};

//movieZilla takes inputs in the form:
//node liri.js movie <any movie name> or <leave blank for movie stats from "Mr. Nobody">
//NOTE: I changed the commands ("movie-this" is now just "movie" - no quotes) because I, and my LIRI, hate dashes.
function movieZilla(functionData) {
	procArgv = process.argv;
	if(!functionData){
		functionData = "Mr+Nobody";
	}
	else {
		for (var i = 4; i < procArgv.length; i++) {
			if (i > 3 && i < procArgv.length) {
				functionData = functionData + "+" + procArgv[i];
			}
			else {
				functionData += procArgv[i];
			}
		}	
	}		
	var queryUrl = "http://www.omdbapi.com/?t=" + functionData + "&y=&plot=full&tomatoes=true&apikey=trilogy";
	request(queryUrl, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var jsonData = JSON.parse(body);
			updateLogCmd(caseData, functionData); //LOG command line data to log.txt file
			results = 
				"\nOMDb API Results for: " + functionData + 
				" ====================" +  
				"\n Movie Title: " + jsonData.Title +
				"\n Staring: " + jsonData.Actors + 
				"\n imdb Rating: " + jsonData.imdbRating + 
				"\n Release Year: " + jsonData.Year + 
				"\n  -Filmed in: " + jsonData.Country + 
				"\n  -Language: " + jsonData.Language + 				
				"\nMovie Plot: ==================================================================\n" + jsonData.Plot + 
				"\nRotten Tomatoes: =============================================================" +
				"\n Score: " + jsonData.Ratings[1].Value + 
				"\n URL: " + jsonData.tomatoURL + 
				"\n===============================================================================" + 
				"\n";;
			console.log(results); //Display results on screen
			updateLogData(results); //LOG returned data to log.txt file
		}
	});
}

//tweetZilla takes inputs in the form:
//node liri.js tweets <twitterUserName> or <@twitterUserName> or <LEAVE BLANK> for tweets from @markjart.
//NOTE: I changed the commands (my-tweets is now just "tweets" - no quotes) because I, and my LIRI... ...are you seeing a theme?
function tweetZilla(functionData){
		if(!functionData){
			functionData = "markjart";
		}
	var params = {screen_name: functionData, count: 20};
	client.get("statuses/user_timeline", params, function(error, functionData, response) {
		if (!error) {
			for(var i = 0; i < functionData.length; i++) {
				var tick = i + 1;
				results = 
					"\nTweet #" + tick + 
					" By: @" + functionData[i].user.screen_name + " ==========\n\n" 
					+ functionData[i].text + "\n\n========== Tweeted on: " 
					+ functionData[i].created_at + 
					"\n";;
				console.log(results); //Display results on screen
				updateLogCmd("tweets", functionData[i].user.screen_name); //LOG command line data to log.txt file
				updateLogData(results); //LOG returned data to log.txt file
			}
		}
	});
};

/*doZilla takes inputs in the form: node liri.js doIt, which, in turn, will read the information in random.txt as <command,"title or userName"> which will call the appropriate function and pass the data provided (Examples: spotify,"I Want it That Way" || movie,"The Right Stuff" || tweets,"@pattonoswalt").  NOTE: I changed the commands (do-what-it-says is now "doIt" - no quotes) because ... you know the rest.*/
function doZilla() {
	fs.readFile("random.txt", "utf8", function(error, readIt){
		if (!error) {
			doingItResults = readIt.split(",");
			didItFirst = doingItResults[0].trim();
			didItSecond = doingItResults[1].trim();
			didItThird = didItSecond.replace(/ /gi, "+");
			didItFourth = didItThird.replace(/\"/gi, "");
			switch(didItFirst) {
				case "tweets":
					tweetZilla(didItFourth);
					break;
				case "spotify":
					spotZilla(didItFourth);
					break;
				case "movie":
					movieZilla(didItFourth);
					break;
				default:
					console.log("Oops, something went wrong. \nPlease try again. \nMaybe check the data structure in the file.")
			}
		}
		else {
			console.log("Error occurred" + error);
		}
	});
};

//Function for adding data to log.txt file.
function updateLogCmd(caseData, functionData) {
	fs.appendFile("log.txt", "\nUser Command: node liri.js " + caseData + " " + functionData, function(err) {
		if (err) {
		}
	});
	console.log("log.txt updated!");
};

function updateLogData(results) {
	fs.appendFile("log.txt", results, function(err) {
		if (err) {
			return console.log(err);
		}
	});			
};

//pick and runThis functions set things up for command line inputs and switch the function to run accordingly.
//You can run node liri.js with no additional commands to load the list of accepted commands.
function pick(caseData, functionData) {
	switch (caseData) {
		case "tweets":
			tweetZilla(functionData);
			break;
		case "spotify":
			spotZilla(functionData);
			break;
		case "movie":
			movieZilla(functionData);
			break;
		case "doIt":
			doZilla(functionData);
			break;
		default:
			console.log(
				"\n========================================================================================" +
				"\nEither something went wrong..." +
				"\n or this is your first day with the new hands..." +
				"\n  Either way - LIRI LOVES YOU!" +
				"\n   Use these commands (without the <>'s) after typing: node liri.js ..." +
				"\n    1. tweets <twitterUserName> or <@twitterUserName> or <leave blank>" +
				"\n    2. spotify <song title> or <song title band name> or <leave blank>" +
				"\n    3. movie <name of movie> or <leave blank>" +
				"\n    4. doIt (Call one of the above commands based on data in the file: 'random.txt'" +
				"\n         data structure for file: <command,'title or userName'>, include quotes.)" + 
				"\n========================================================================================");
	}
}

function runThis(caseData, functionData) {
	pick(caseData, functionData);
};

//FUNCTIONS END ===========================================================
//START LOADS =============================================================

runThis(process.argv[2], process.argv[3]);

//END LOADS ===============================================================
//===== END OF FILE =======================================================