const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const MONGODB_URL = 'mongodb://localhost:27017/cricketDB';
const DB_NAME = 'cricketDB';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let database, playerCollection;

app.get("/api/players", (req, res) => {

    let matchType = req.query.matchType;
    let statisticsType = req.query.statisticsType;

    let descendingQuery = matchType + "." + statisticsType;
    let matchQuery = matchType + ".Mat";

    const sortObject = {
        [descendingQuery] : -1
    }

    const existObject = {
        [matchType]: { $exists: true }
      }
      
    const matchObject = {
        [matchQuery]: { $gte: 10 }
    }
      
    const andConditionObject = {
        '$and': [existObject, matchObject]
    }

    playerCollection.find(andConditionObject).limit(10).sort(sortObject).toArray((error, result) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.send(result);
    });
});

app.get("/api/players/:id", (req, res) => {
    playerCollection.find({ player_id: parseInt(req.params.id) }).toArray(function (err, result) {
        if (err) {
            return res.status(500).send(error);
        }
        console.log(result);
        res.send(result);
    });
});

app.listen(5000, () => {
    console.log("Connected to server!");
    MongoClient.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if (error) {
            throw error;
        }
        database = client.db(DB_NAME);
        playerCollection = database.collection("players");
        console.log("Connected to " + DB_NAME + "!");
    });
});