const axios = require('axios');
const cheerio = require('cheerio');
const tabletojson = require('tabletojson');
const MongoClient = require('mongodb').MongoClient;

const MONGODB_URL = "mongodb://localhost:27017/cricketDB";
const baseURL = "http://www.espncricinfo.com/ci/content/player/";

let getPlayersData = async function () {
    for (let number = 56007; number < 56008; number++) {
        try {
            let response = await axios.get(baseURL + number + '.html');
            if (response.status === 200) {
                let json = { player_id: number };
                let $ = cheerio.load(response.data);

                json.player_name = $('.ciPlayernametxt h1').text().trim();
                json.national_team = $('.PlayersSearchLink b').text().trim();

                let info = $('.ciPlayerinformationtxt');
                let playerInformationLength = $(info).get().length;

                for (let index = 0; index < playerInformationLength; index++) {
                    let label = $(info).get(index).children[0].children[0].data.trim();
                    if (label === 'Full name') {
                        json.full_name = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Born') {
                        json.date_of_birth = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Current age') {
                        json.current_age = $(info).get(index).children[1].next.children[0].data.trim();
                    } else if (label === 'Major teams') {
                        let teamsChildren = $(info).get(index).children;
                        let teams = [];
                        for (let a=0; a<=teamsChildren.length; a++) {
                            if(a%2 === 1 && a !== teamsChildren.length) {
                                teams.push(teamsChildren[a].next.children[0].data.trim());
                            }
                        } 
                        json.major_teams = teams;
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

                let tablesAsJson = tabletojson.convert(response.data);

                if (typeof tablesAsJson[0] !== 'undefined') {
                    for (let k = 0; k < 2; k++) {
                        for (let j = 0; j < tablesAsJson[k].length; j++) {
                            if (tablesAsJson[k][j]['0'].trim() === 'Tests' || tablesAsJson[k][j]['0'].trim() === 'ODIs' || tablesAsJson[k][j]['0'].trim() === 'T20Is') {
                                let testkey = tablesAsJson[k][j]['0'] in json;
                                if (!testkey) {
                                    json[tablesAsJson[k][j]['0']] = {};
                                }
                                for (let key in tablesAsJson[k][j]) {
                                    let checkkey = key in json[tablesAsJson[k][j]['0']];
                                    if (!checkkey) {
                                        if(key !== 'Inns' && key !== 'Balls' && key !== '0' && key !== 'BF' && key !== '10' && key !== 'BBM' && key !== '4w') {  
                                            if (tablesAsJson[k][j][key] === "-") {
                                                tablesAsJson[k][j][key] = tablesAsJson[k][j][key].replace("-", 0);
                                            }
                                            if(key === 'Ave' || key === 'SR' || key === 'Econ') {
                                                json[tablesAsJson[k][j]['0']][key] = parseFloat(tablesAsJson[k][j][key]);
                                            } else if(key === 'Runs' || key === '100' || key === '50' || key === 'Mat' || key === '4s' || key === '6s' || key === 'NO' || key === 'Wkts' || key === '5w' || key === 'Ct' || key === 'St') {
                                                json[tablesAsJson[k][j]['0']][key] = parseInt(tablesAsJson[k][j][key]);
                                            } else {
                                                json[tablesAsJson[k][j]['0']][key] = tablesAsJson[k][j][key];
                                            }
                                        }
                                    } else {
                                        if(key !== 'Mat' && key !== 'Runs') {
                                            if (tablesAsJson[k][j][key] === "-") {
                                                tablesAsJson[k][j][key] = tablesAsJson[k][j][key].replace("-", 0);
                                            }
                                            if(key === 'Ave' || key === 'SR') {
                                                json[tablesAsJson[k][j]['0']]["Bowl_"+key] = parseFloat(tablesAsJson[k][j][key]);
                                            } else {
                                                json[tablesAsJson[k][j]['0']]["Bowl_"+key] = tablesAsJson[k][j][key];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (json.hasOwnProperty("Tests") && json.hasOwnProperty("ODIs") || json.hasOwnProperty("T20Is")) {
                    console.log("Scraped " + json.full_name + "'s profile");
                    const client = await MongoClient.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).catch(err => { console.log(err); });
                    if (!client) {
                        return;
                    }
                    try {
                        const db = client.db();
                        const playerCollection = db.collection('players');
                        let isPresent = true;
                        let insertPlayer = function (callback) {
                            playerCollection.find({ player_id: json.player_id }).toArray(function (err, result) {
                                if (!err) {
                                    if (result.length > 0) {
                                        console.log("Player with name: " + json.full_name + " already exists in the database");
                                    } else {
                                        isPresent = false;
                                        callback(isPresent);
                                    }
                                }
                                else {
                                    console.log(err);
                                }
                            });
                        }

                        insertPlayer(function (isPresent) {
                            MongoClient.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                                if (!err) {
                                    const db = client.db();
                                    const playerCollection = db.collection('players');
                                    if (!isPresent) {
                                        playerCollection.insertOne(json, function (err, result) {
                                            if (!err) {
                                                console.log("Inserted " + json.full_name + "'s profile into the database.");
                                            } else {
                                                console.log(err);
                                            }
                                        });
                                    }
                                }
                                client.close();
                            });
                        });
                    } catch (error) {
                        console.error(error.message);
                        process.exit(1);
                    } finally {
                        client.close();
                    }
                }
            }
        }
        catch (error) {
            if (error.status === 404) {
                console.log("The requested resource doesn\'t exist.");
            } else if (error.status === 401) {
                console.log("Unauthorized");
            } else if (error.status === 400) {
                console.log("Bad request, often due to missing a required parameter.");
            }
        }
    }
}

getPlayersData().then(function () {
    console.log("Scraping and Database insertion is complete!");
});