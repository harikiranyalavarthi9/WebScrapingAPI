import React from 'react';
import axios from 'axios';
import '../App.css';
import TableRepresentation from './TableRepresentation';
import BarChartRepresentation from './BarChartRepresentation';
import { Select, Button } from 'antd';

const { Option } = Select;
const typeofMatchData = ['Tests', 'ODIs', 'T20Is'];
const typeofPlayerData = ['Batsman', 'Bowler', 'Fielder'];
const statisticsData = {
    Batsman: ['Most Runs', 'Highest Scores', 'Best Batting Average', 'Best Batting Strike Rate', 'Most Hundreds', 'Most Fifties', 'Most Fours', 'Most Sixes', 'Most Not Outs'],
    Bowler: ['Most Wickets', 'Best Bowling Average', 'Best Bowling', 'Most 5 Wickets Haul', 'Best Economy', 'Best Bowling Strike Rate'],
    Fielder: ['Catches', 'Stumpings']
};

const mappingObject = {
    'Most Runs': 'Runs',
    'Highest Scores': 'HS',
    'Best Batting Average': 'Ave',
    'Best Batting Strike Rate': 'SR',
    'Most Hundreds': '100s',
    'Most Fifties': '50s',
    'Most Fours': '4s',
    'Most Sixes': '6s',
    'Most Not Outs': 'NO',
    'Most Wickets': 'Wkts',
    'Best Bowling Average': 'Bowl_Ave',
    'Best Bowling': 'BBI',
    'Most 5 Wickets Haul': '5w',
    'Best Economy': 'Econ',
    'Best Bowling Strike Rate': 'Bowl_SR',
    'Catches': 'Ct',
    'Stumpings': 'St'
};

class Records extends React.Component {
    state = {
        matchType: typeofMatchData[0],
        playerType: typeofPlayerData[0],
        statisticsType: statisticsData[typeofPlayerData[0]][0],
        resultData: [],
        columnData: []
    };

    handleMatchChange = value => {
        this.setState({
            ...this.state,
            matchType: value
        });
    };

    handlePlayerChange = value => {
        this.setState({
            ...this.state,
            playerType: value,
            statisticsType: statisticsData[value][0]
        });
    };

    handleStatisticChange = value => {
        this.setState({
            ...this.state,
            statisticsType: value
        });
    };

    handleSubmit = event => {

        const params = {
            matchType: this.state.matchType,
            statisticsType: mappingObject[this.state.statisticsType]
        }

        function getKeyByValue(object, value) {
            return Object.keys(object).find(key => object[key] === value);
        }
          
        axios.get('/api/players', { params })
            .then((response) => {
                let newResponseData = response.data.filter(result => result[params.matchType][params.statisticsType] !== 0 && result[params.matchType][params.statisticsType] !== "0");
                if(params.statisticsType === 'HS') {
                    var sort = function (prop, arr) {
                        prop = prop.split('.');
                        var len = prop.length;
                        
                        arr.sort(function (a, b) {
                            var i = 0;
                            while( i < len ) {
                                a = a[prop[i]];
                                b = b[prop[i]];
                                i++;
                            }
                            if (a > b) {
                                return -1;
                            } else if (a < b) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        return arr;
                    };
                    
                    let starObject = {};
                    
                    for(let i=0; i<newResponseData.length; i++) {
                        starObject[newResponseData[i].player_id] = newResponseData[i][params.matchType][params.statisticsType].includes("*", newResponseData[i][params.matchType][params.statisticsType].length-1);
                        newResponseData[i][params.matchType][params.statisticsType] = parseInt(newResponseData[i][params.matchType][params.statisticsType].replace("*", ""));
                    } 
                    sort(`${params.matchType}.${params.statisticsType}`, newResponseData);
                    for(let j=0; j<newResponseData.length; j++) {
                        if(starObject[newResponseData[j].player_id]) {
                            newResponseData[j][params.matchType][params.statisticsType] = newResponseData[j][params.matchType][params.statisticsType]+"*";
                        } 
                    }
                }
                this.setState({
                    ...this.state,
                    resultData: newResponseData.map((result, index) => ({
                        key: index + 1,
                        name: <a href={result.espncricinfo_url} target={"_blank"}>{result.player_name}</a>,
                        matches: result[params.matchType]['Mat'],
                        [getKeyByValue(mappingObject, params.statisticsType)]: result[params.matchType][params.statisticsType]
                    })),
                    columnData: [
                        {
                            title: this.state.playerType,
                            dataIndex: 'name',
                            key: 'name'
                        },
                        {
                            title: 'Matches',
                            dataIndex: 'matches',
                            key: 'matches'
                        },
                        {
                            title: getKeyByValue(mappingObject, params.statisticsType),
                            dataIndex: getKeyByValue(mappingObject, params.statisticsType),
                            key: getKeyByValue(mappingObject, params.statisticsType)
                        }
                    ]
                });
                // console.log(getKeyByValue(mappingObject, params.statisticsType));
            })
            .catch((error) => {
                console.log(error);
            });
    }

    componentDidUpdate() {
        // console.log(this.state.resultData);   
    }

    render() {
        return (
            <div className="App">  
                <h1>Records Search</h1>
                <div>
                    <Select
                        defaultValue={typeofMatchData[0]}
                        style={{ width: 120 }}
                        onChange={this.handleMatchChange}
                    >
                        {typeofMatchData.map(match => (
                            <Option key={match}>{match}</Option>
                        ))}
                    </Select>
                    <Select
                        defaultValue={typeofPlayerData[0]}
                        style={{ width: 120 }}
                        onChange={this.handlePlayerChange}
                    >
                        {typeofPlayerData.map(player => (
                            <Option key={player}>{player}</Option>
                        ))}
                    </Select>
                    <Select
                        style={{ width: 200 }}
                        value={this.state.statisticsType}
                        onChange={this.handleStatisticChange}
                    >
                        {statisticsData[this.state.playerType].map(statistic => (
                            <Option key={statistic}>{statistic}</Option>
                        ))}
                    </Select>
                    <Button type="primary" onClick={this.handleSubmit}>Search</Button>
                </div>
                {this.state.resultData.length !== 0 ? 
                    <div>
                        <h1>Table Representation</h1>
                        <TableRepresentation ColumnData={this.state.columnData} ResultData={this.state.resultData} />
                        <br />
                        <h1>Bar Chart Representation</h1>
                        <BarChartRepresentation ResultData={this.state.resultData} />  
                    </div> 
                : null}

            </div>
        );
    }
}

export default Records;