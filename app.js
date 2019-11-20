const axios = require('axios');
const cheerio = require('cheerio');
const tabletojson = require('tabletojson');
const MongoClient = require('mongodb').MongoClient;

const mongoDBURL = "mongodb://localhost:27017/espndb";

let playerProfilesArray = [];
let playerBattingArray = [];
let playerBowlingArray = [];

const search_text = "dhoni";

let getPlayersData = async function() {
    for(let number=28081; number<28082; number++) {
        try {
            let response = await axios.get('http://www.espncricinfo.com/ci/content/player/'+number+'.html');
            if(response.status === 200) {
                
                let json = {player_id: number};
                let $ = cheerio.load(response.data);
                let info = $('.ciPlayerinformationtxt');
                let numBasicInfo = $(info).get().length;

                for(let index = 0; index < numBasicInfo; index++) {
                    let label = $(info).get(index).children[0].children[0].data.trim();
                    if (label === 'Full name') {
                        json.full_name = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Born') {
                        json.date_of_birth = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Current age') {
                        json.current_age = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Major teams') {
                        let teamsChildren = $(info).get(index).children;
                        let teams = "";
                        for (let a=0; a<=teamsChildren.length; a++) {
                            if(a%2 === 1 && a !== teamsChildren.length) {
                                teams = teams + teamsChildren[a].next.children[0].data.trim() + " ";
                            }
                        } 
                        json.major_teams = teams.trim();
                    } else if (label === 'Nickname' || label === 'Also known as') {
                        let nicknamesChildren = $(info).get(index).children;
                        let nicknames = "";
                        for (let b=0; b<=nicknamesChildren.length; b++) {
                            if(b%2 === 1 && b !== nicknamesChildren.length) {
                                nicknames = nicknames + nicknamesChildren[b].next.children[0].data.trim() + " ";
                            }
                        }
                        json.nicknames = nicknames.trim(); 
                    } else if (label === 'Playing role') {
                        json.playing_role = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Batting style') {
                        json.batting_style = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Bowling style') {
                        json.bowling_style = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Height') {
                        json.playerHeight = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Education') {
                        json.education = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Fielding position') {
                        json.position = $(info).get(index).children[1].next.children[0].data.trim();
                    } else {
                        continue;
                    }
                }

                playerProfilesArray.push(json);

                const tablesAsJson = tabletojson.convert(response.data);
                if(typeof tablesAsJson[0] !== 'undefined') {
                    for(let j=0; j<tablesAsJson[0].length; j++) {
                        if(tablesAsJson[0][j]['0'] === 'Tests' || 'ODIs' || 'T20Is' || 'First-class' || 'List A' || 'T20s') {
                            tablesAsJson[0][j].player_id = number;
                            playerBattingArray.push(tablesAsJson[0][j]);
                        }
                    }
                    for(let k=0; k<tablesAsJson[1].length; k++) {
                        if(tablesAsJson[1][k]['0'] === 'Tests' || 'ODIs' || 'T20Is' || 'First-class' || 'List A' || 'T20s') {
                            tablesAsJson[1][k].player_id = number;
                            playerBowlingArray.push(tablesAsJson[1][k]);
                        }
                    }
                }
            }
        }   
        catch(error) {
            if(error.status === 404) {
                console.log("The requested resource doesn\'t exist.");
            } else if(error.status === 401) {
                console.log("Unauthorized");
            } else if(error.status === 400) {
                console.log("Bad request, often due to missing a required parameter.");
            }
        }
    }
}

getPlayersData().then(function() {
    MongoClient.connect(mongoDBURL, { useNewUrlParser: true }, (err, client) => {
        if(!err) {
            const db = client.db();
            const profilesCollection = db.collection('playerProfiles');
            const battingCollection = db.collection('playerBattingInfo');
            const bowlingCollection = db.collection('playerBowlingInfo');

            profilesCollection.insertMany(playerProfilesArray, function(err, result) {
                if(!err) {
                    console.log("Inserted "+result.insertedCount+" player profile.");
                } else {
                    console.log(err);
                }
            });

            battingCollection.insertMany(playerBattingArray, function(err, result) {
                if(!err) {
                    console.log("Inserted "+result.insertedCount+" batting records.");
                } else {
                    console.log(err);
                }
            });

            bowlingCollection.insertMany(playerBowlingArray, function(err, result) {
                if(!err) {
                    console.log("Inserted "+result.insertedCount+" bowling records.");
                } else {
                    console.log(err);
                }
            });

            let getPlayer = function(callback) {
                profilesCollection.createIndex( { full_name: "text", major_teams: "text" } );
                profilesCollection.find({$text: { $search: search_text}}).toArray(function(err, resultArray) {
                    if(resultArray.length != 0) {
                        console.log("Player found for search text "+search_text);
                        console.log(resultArray);
                        callback(resultArray);
                    } else {
                        console.log("No player found for search text "+search_text);
                    }
                });
            }

            getPlayer(function(resultArray) {
                MongoClient.connect(mongoDBURL, { useNewUrlParser: true }, (err, client) => {
                    if(!err) {
                        const db = client.db();
                        const batCollection = db.collection('playerBattingInfo');
                        for(let l=0; l<resultArray.length; l++) {
                            batCollection.find({player_id: resultArray[l].player_id}).toArray(function(err, result) {
                                if(!err) {
                                    console.log(result);
                                } else {
                                    console.log(err);
                                }
                            });
                        } 
                    }
                    client.close();
                });
            });
        }
        client.close();
    });         
});