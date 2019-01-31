const axios = require('axios');
const cheerio = require('cheerio');
const tabletojson = require('tabletojson');
const MongoClient = require('mongodb').MongoClient;

let playerProfilesArray = [];
let playerBattingArray = [];
let playerBowlingArray = [];

let resultPlayerId;

let getPlayersData = async function(playerProfilesArray, playerBattingArray, playerBowlingArray) {
    for(let number=28081; number<28085; number++) {
        try {
            let response = await axios.get('http://www.espncricinfo.com/ci/content/player/'+number+'.html');
            if(response.status === 200) {
                
                let json = {playerId: number};
                
                let $ = cheerio.load(response.data);

                let info = $('.ciPlayerinformationtxt');

                let numBasicInfo = $(info).get().length;

                for(let index = 0; index < numBasicInfo; index++) {
                    let label = $(info).get(index).children[0].children[0].data.trim();
                    if (label === 'Full name') {
                        json.fullName = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Born') {
                        json.dob = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Current age') {
                        json.age = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Major teams') {
                        let teamsChildren = $(info).get(index).children;
                        let teams = "";
                        for (let i = 0; i <= teamsChildren.length; i++) {
                            if(i % 2 === 1 && i !== teamsChildren.length) {
                                teams = teams + teamsChildren[i].next.children[0].data.trim() + " ";
                            }
                        } 
                        json.teams = teams.trim();
                    } else if (label === 'Nickname') {
                        let nicknamesChildren = $(info).get(index).children;
                        let nicknames = "";
                        for (let i = 0; i <= nicknamesChildren.length; i++) {
                            if(i % 2 === 1 && i !== nicknamesChildren.length) {
                                nicknames = nicknames + nicknamesChildren[i].next.children[0].data.trim() + " ";
                            }
                        }
                        json.nicknames = nicknames.trim(); 
                    } else if (label === 'Playing role') {
                        json.role = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Batting style') {
                        json.batting = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Bowling style') {
                        json.bowling = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Height') {
                        json.playerHeight = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Education') {
                        json.education = $(info).get(index).children[1].next.children[0].data.trim();
                    } else {
                        continue;
                    }
                }

                playerProfilesArray.push(json);

                tabletojson.convertUrl('http://www.espncricinfo.com/ci/content/player/'+number+'.html', function(tablesAsJson) {
                    if(typeof tablesAsJson[0] !== 'undefined') {
                        for(let k=0; k<tablesAsJson[0].length; k++) {
                            if(tablesAsJson[0][k]['0'] === 'Tests' || 'ODIs' || 'T20Is' || 'First-class' || 'List A' || 'T20') {
                                tablesAsJson[0][k].playerId = number;
                                playerBattingArray.push(tablesAsJson[0][k]);
                            }
                        }
                        for(let k=0; k<tablesAsJson[1].length; k++) {
                            if(tablesAsJson[1][k]['0'] === 'Tests' || 'ODIs' || 'T20Is' || 'First-class' || 'List A' || 'T20') {
                                tablesAsJson[1][k].playerId = number;
                                playerBowlingArray.push(tablesAsJson[1][k]);
                            }
                        }
                    }
                });
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

getPlayersData(playerProfilesArray, playerBattingArray, playerBowlingArray)
    .then(function() {
        MongoClient.connect("mongodb://localhost:27017/cricDB", { useNewUrlParser: true }, (err, client) => {
            if(!err) {
                const db = client.db();
                const profilesCollection = db.collection('playerProfiles');
                const battingCollection = db.collection('playerBattingInfo');
                const bowlingCollection = db.collection('playerBowlingInfo');

                // profilesCollection.insertMany(playerProfilesArray, function(err, result) {
                //     if(!err) {
                //         console.log(result.insertedCount);
                //     } else {
                //         console.log(err);
                //     }
                // });

                // battingCollection.insertMany(playerBattingArray, function(err, result) {
                //     if(!err) {
                //         console.log(result.insertedCount);
                //     } else {
                //         console.log(err);
                //     }
                // });

                // bowlingCollection.insertMany(playerBowlingArray, function(err, result) {
                //     if(!err) {
                //         console.log(result.insertedCount);
                //     } else {
                //         console.log(err);
                //     }
                // });

                let getPlayer = function(callback) {
                    profilesCollection.createIndex( { fullName: "text", teams: "text" } );
                    profilesCollection.find({$text: { $search: "punjab"}}).toArray(function(err, result) {
                        callback(result[0].playerId);
                    });
                }

                getPlayer(function(resultId) {
                    MongoClient.connect("mongodb://localhost:27017/cricDB", { useNewUrlParser: true }, (err, client) => {
                        if(!err) {
                            const db = client.db();
                            const batCollection = db.collection('playerBattingInfo');
                            batCollection.find({playerId: resultId}).toArray(function(err, result) {
                                if(!err) {
                                    console.log(result);
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                        client.close();
                    });
                });
            }
            client.close();
        });
        
    });