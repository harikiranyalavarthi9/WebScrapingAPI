import React from 'react';
import axios from 'axios';
import ListPlayers from '../components/ListPlayers';
import '../App.css';
import { Input } from 'antd';
const { Search } = Input;
class SearchPlayerProfile extends React.Component {
	state = {
		searchquery: '',
		playerData: []
	}

	getPlayerInfo = () => {
		const params = {
            searchQuery: this.state.searchquery
		}
		
		axios.get('/api/players', { params })
		.then((response) => {
			this.setState({
				...this.state,
				playerData: response.data
			})
		})
		.catch((error) => {
			console.log(error);
		});
	}

	handleSearchChange = value => {
		this.setState({
			searchquery: value.trim()
		}, () => {
			if(this.state.searchquery && this.state.searchquery.length > 1) {
				this.getPlayerInfo();
			}
		})
	}

	render() {
		return (
			<div style={{textAlign: "center" }}>
				<Search style={{ width: 400 }} allowClear={true} placeholder="input search text" onSearch={this.handleSearchChange} enterButton />
				{this.state.playerData.length !== 0 ?
					<div style={{display: 'flex', justifyContent: 'center', padding: '50px'}}>
						<ListPlayers PlayerData = {this.state.playerData} />
					</div>
				: null}
			</div>
		);
	}
}


export default SearchPlayerProfile;