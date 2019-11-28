const axios = require('axios');
const cheerio = require('cheerio');
const tabletojson = require('tabletojson');
const MongoClient = require('mongodb').MongoClient;
var parser = require('fast-xml-parser');
var he = require('he');

const mongoDBURL = "mongodb://localhost:27017/cricketDB";
const baseURL = "http://www.espncricinfo.com/ci/content/player/";
const liveURL = "http://static.cricinfo.com/rss/livescores.xml";

let playerProfilesArray = [];
let playerBattingArray = [];
let playerBowlingArray = [];
let liveMatchesArray = [];
let playersArray = [];

const search_text = "dhoni";

let getPlayersData = async function() {
    for(let number=28081; number<28300; number++) {
        try {
            let response = await axios.get(baseURL+number+'.html');
            if(response.status === 200) {
                let json = {player_id: number};
                let $ = cheerio.load(response.data);
                let info = $('.ciPlayerinformationtxt');
                let numBasicInfo = $(info).get().length;

                for(let index = 0; index < numBasicInfo; index++) {
                    let label = $(info).get(index).children[0].children[0].data.trim();
                    if (label === 'Full name') {
                        json.full_name = $(info).get(index).children[1].next.children[0].data.trim();
                    }
                }

                let tablesAsJson = tabletojson.convert(response.data);

                if(typeof tablesAsJson[0] !== 'undefined') {
                    for(let k=0; k<2; k++) {
                        for(let j=0; j<tablesAsJson[k].length; j++) {
                            if(tablesAsJson[k][j]['0'].trim() === 'Tests' || tablesAsJson[k][j]['0'].trim() === 'ODIs' || tablesAsJson[k][j]['0'].trim() === 'T20Is') {
                                let testkey = tablesAsJson[k][j]['0'] in json;
                                if(!testkey) {
                                    json[tablesAsJson[k][j]['0']] = {};
                                }
                                for (let key in tablesAsJson[k][j]) {
                                    if(key === 'Mat' || key === 'Runs' || key === 'Wkts') {
                                        let testkey = key in json[tablesAsJson[k][j]['0']];
                                        if(!testkey) {
                                            if(tablesAsJson[k][j][key] === "-") {
                                                tablesAsJson[k][j][key] = tablesAsJson[k][j][key].replace("-","0");
                                            }
                                            json[tablesAsJson[k][j]['0']][key] = tablesAsJson[k][j][key];
                                        }                             
                                    }
                                }
                            }
                        }
                    }
                }
                if(json.hasOwnProperty("Tests") && json.hasOwnProperty("ODIs") || json.hasOwnProperty("T20Is")) {
                    console.log("Scraped "+json.full_name+" profile");
                    const client = await MongoClient.connect(mongoDBURL, { useNewUrlParser: true,  useUnifiedTopology: true }).catch(err => { console.log(err); });
                    if(!client) {
                        return;
                    }
                    try {
                        const db = client.db();
                        const playerCollection = db.collection('players');
                        let isPresent = true;
                        let insertPlayer = function(callback) {
                            playerCollection.find({player_id: json.player_id}).toArray(function(err, result) {
                                if(!err) {
                                    if(result.length > 0 ){
                                        console.log("Player with name: "+json.full_name+" already exists in the database");
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

                        insertPlayer(function(isPresent) {
                            MongoClient.connect(mongoDBURL, { useNewUrlParser: true,  useUnifiedTopology: true }, (err, client) => {
                                if(!err) {
                                    const db = client.db();
                                    const playerCollection = db.collection('players');
                                    if(!isPresent) {
                                        playerCollection.insertOne(json, function(err, result) {
                                            if(!err) {
                                                console.log("Inserted "+json.full_name+" profile into the database.");
                                            } else {
                                                console.log(err);
                                            }
                                        });
                                    }
                                }
                                client.close();
                            });
                        });
                    } catch(error) {
                        console.error(error.message);
                        process.exit(1);
                    } finally {
                        client.close();
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

getPlayersData().then(async function() {     
    console.log("Scraping and Database insertion is complete!");
});