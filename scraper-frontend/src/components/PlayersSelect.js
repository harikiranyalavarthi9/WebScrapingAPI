import React from 'react';
import axios from 'axios';
import TableData from './TableData';
import BarChartData from './BarChartData';
import { Select, Button } from 'antd';

const { Option } = Select;
const typeofMatchData = ['Tests', 'ODIs', 'T20Is'];
const typeofPlayerData = ['Batsman', 'Bowler'];
const statisticsData = {
    Batsman: ['Runs', 'Average', 'High Score', '50s', '100s', '4s', '6s'],
    Bowler: ['Wkts', 'Average', 'Economy', '5w']
};

class PlayersSelect extends React.Component {
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
            statisticsType: this.state.statisticsType
        }

        axios.get('/api/players', { params })
            .then((response) => {
                this.setState({
                    ...this.state,
                    resultData: response.data.map((result, index) => ({
                        key: index + 1,
                        name: result.full_name,
                        [params.statisticsType.toLowerCase()]: result[params.matchType][params.statisticsType]
                    })),
                    columnData: [
                        {
                            title: 'Name',
                            dataIndex: 'name',
                            key: 'name'
                        },
                        {
                            title: params.statisticsType,
                            dataIndex: params.statisticsType.toLowerCase(),
                            key: params.statisticsType.toLowerCase()
                        }
                    ]
                });
            })
            .catch((error) => {
                console.log(error);
            });

    }

    componentDidUpdate() {
        console.log(this.state.resultData);   
    }

    render() {
        return (
            <>  
                <h1>Records Search</h1>
                <div>
                    <Select
                        defaultValue={typeofMatchData[0]}
                        style={{ width: 120 }}
                        onChange={this.handleMatchChange}
                    >
                        {typeofMatchData.map(match => (
                            <Select.Option key={match}>{match}</Select.Option>
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
                        style={{ width: 120 }}
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
                        <TableData ColumnData={this.state.columnData} ResultData={this.state.resultData} />
                        <br />
                        <h1>Bar Chart Representation</h1>
                        <BarChartData ResultData={this.state.resultData} />  
                    </div> 
                : null}

            </>
        );
    }
}

export default PlayersSelect;