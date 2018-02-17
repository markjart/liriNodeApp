//setting up and and configuring required node.js modules
require("dotenv").config();
var dataKeys = require("./keys.js");
var fs = require("fs");
var request = require("request");
var Twitter = require("twitter");
var client = new Twitter(dataKeys.twitter);
var Spotify = require("node-spotify-api");
var spotify = new Spotify(dataKeys.spotify);
var results;
var doingItResults;
var didItFirst;
var didItSecond;
var didItThird;
var didItFourth;

//FUNCTIONS START ===========================================================

//SpotZilla takes inputs in the form:
//node liri.js spotify <any song title> for the top 10 results related to that title,
//or <LEAVE BLANK> for the top 10 search result on "The Sign" - #6-ish should be from Ace of Base.
//NOTE: I changed the commands (spotify-this-song is now just "spotify" - no quotes) because I, and my LIRI, hate dashes.
function SpotZilla(songName) {
	songName = process.argv[3];	
	var spotArgv = process.argv;	
	if(!songName){
		songName = "The+Sign";
	}
	else {
		var songName = "";
	}
	for (var i = 3; i < spotArgv.length; i++) {
		if (i > 3 && i < spotArgv.length) {
			songName = songName + "+" + spotArgv[i];
		}
		else {
			songName += spotArgv[i];
		}
	}
			//console.log("songName: " + songName);
			//console.log("spotArgv: " + spotArgv);
	spotify.search({ type: "track", query: songName }, function(err, data) {
		if(!err){
			var songInfo = data.tracks.items;
			for (var i = 0; i < 10; i++) {
				var tick = i + 1;
					results =
						"\n#" + tick + " Spotify Search result" +
						" =====================\n\n" +				
						"Artist: " +
						songInfo[i].artists[0].name +
						"\nSong: " + 
						songInfo[i].name +
						"\nAlbum: " + 
						songInfo[i].album.name +
						"\nPreview Url: " + 
						songInfo[i].preview_url;
					console.log(results);
			}
		}
	});
};

//movieZilla takes inputs in the form:
//node liri.js movie <any movie name> or <leave blank for movie stats from "Mr. Nobody">
//NOTE: I changed the commands ("movie-this" is now just "movie" - no quotes) because I, and my LIRI, hate dashes.
function movieZilla(movieName) {
	movieName = process.argv[3];
	if(!movieName){
		movieName = "Mr+Nobody";
	}
	else {
		var movieName = "";
	}
	var movieArgv = process.argv;
	for (var i = 3; i < movieArgv.length; i++) {
		if (i > 3 && i < movieArgv.length) {
			movieName = movieName + "+" + movieArgv[i];
		}
		else {
			movieName += movieArgv[i];
		}
	}	
	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=full&tomatoes=true&apikey=trilogy";
	request(queryUrl, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var jsonData = JSON.parse(body);
			results = 
				"\n===============================================================================" + 
				"\nMovie Title: " + jsonData.Title +
				"\nStaring: " + jsonData.Actors + 
				"\nRelease Year: " + jsonData.Year + 
				"\nimdb Rating: " + jsonData.imdbRating + 
				"\n =============================================================================" +
				"\nFilmed in: " + jsonData.Country + 
				"\nLanguage: " + jsonData.Language + 
				"\nMovie Plot ===================================================================\n" +
				jsonData.Plot + 
				"\n==============================================================================" +
				"\nRotten Tomatoes Score: " + jsonData.Ratings[1].Value + 
				"\nRotten Tomatoes URL: " + jsonData.tomatoURL + 
				"\n===============================================================================";
			console.log(results);
			//updateLog(data);
		}
	});
}

//tweetZilla takes inputs in the form:
//node liri.js tweets <twitterUserName> or <@twitterUserName> or <LEAVE BLANK> for tweets from @markjart.
//NOTE: I changed the commands (my-tweets is now just "tweets" - no quotes) because I, and my LIRI, hate dashes.
function tweetZilla(twitterUsername){
	twitterUsername = process.argv[3];
		if(!twitterUsername){
			twitterUsername = "markjart";
		}
	var params = {screen_name: twitterUsername, count: 20};
	
	client.get("statuses/user_timeline", params, function(error, tweets, response) {
		if (!error) {
			for(var i = 0; i < tweets.length; i++) {
				var tick = i + 1;
				results = 
					"\nTweet #" 
					+ tick + 
					" ===================================\n\n" 
					+ tweets[i].text + 
					"\n\n  Tweeted on: " 
					+ tweets[i].created_at +
					"\n  By: @" 
					+ tweets[i].user.screen_name;
				console.log(results);
			}
		}
	});
};


/*doingIt takes inputs in the form: node liri.js doItToIt, which will output the command and song name, but I haven't been able to get it to work fully yet.  It reads the random.txt file and converts the song name for use by spotify, but I haven't managed to figure it out just yet because I kept going back and forth between a couple of different ways of doing it.  I also ran into issues with how I built a couple of the above functions, and I will need to re-factor them to get them to work with this function.
NOTE: I changed the commands (my-tweets is now just "tweets" - no quotes) because I, and my LIRI, hate dashes.*/
function doingIt() {
	fs.readFile("random.txt", "utf8", function(error, readIt){
		if (!error) {
			doingItResults = readIt.split(",");
			didItFirst = doingItResults[0].trim();
			didItSecond = doingItResults[1].trim();
			
			console.log("Cmd: " + didItFirst);
			console.log("songTake 1: " + didItSecond);
	
			didItThird = didItSecond.replace(/ /gi, "+");
			//console.log("songTake 2: " + didItThird);
			didItFourth = didItThird.replace(/\"/gi, "");
			console.log("songTake 3: " + didItFourth);
	
			//SpotZilla(didItFourth);
			
			//SpotZilla(doingItResults[0].trim(), doingItResults[1].trim());
		//console.log("4. " + doingItResults[0].trim());
		//console.log("5. " + doingItResults[1].trim());
		}
		else {
			console.log("Error occurred" + error);
		}

	});
};

/*
function doingIt() {

	// Read the file containing the command
	fs.readFile("random.txt", "utf8", function (error, data) {
		if (error) {
			console.log("ERROR: Reading random.txt -- " + error);
			return;
		} else {
			// Split out the command name and the parameter name
			var cmdString = data.split(",");
			var command = cmdString[0].trim();
			var functionData = cmdString[1].trim();

			switch(command) {
				case "tweets":
					tweetZilla(functionData);
					break;
				case "spotify":
					SpotZilla(functionData);
					break;
				case "movie":
					movieZilla(functionData);
					break;
			}
		}
	});
}
*/

//pick and runThis functions set things up for command line inputs and switch the function to run accordingly.
//You can run node liri.js with no additional commands to load the list of accepted commands.
function pick(caseData, functionData) {
	switch (caseData) {
		case "tweets":
			tweetZilla(functionData);
			break;
		case "spotify":
			SpotZilla(functionData);
			break;
		case "movie":
			movieZilla(functionData);
			break;
		case "doItToIt":
			doingIt(functionData);
			break;
		default:
			console.log(
				"\n====================================================================" +
				"\nEither something went wrong..." +
				"\n or this is your first day with the new hands..." +
				"\n  Either way - Use these commands after typing: node liri.js ..." +
				"\n    1. tweets twitterUserName or @twitterUserName or leave blank" +
				"\n    2. spotify name of song or leave blank" +
				"\n    3. movie name of movie or leave blank" +
				"\n    4. doItToIt (Currently unfinished - partially working.)" +
				"\n\n=========== EXAMPLE: node liri.js spotify What About Us ============" +
				"\n====================================================================");
	}
}

function runThis(caseData, functionData) {
  pick(caseData, functionData);
};

//run this on load of js file
runThis(process.argv[2], process.argv[3]);




