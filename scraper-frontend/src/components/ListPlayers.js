import React from 'react';
import { List, Avatar } from 'antd';

class ListPlayers extends React.Component {
    render() {
        return (
            <List
                itemLayout="horizontal"
                dataSource={this.props.PlayerData}
                renderItem={item => (
                <List.Item style={{ width: 250 }}>
                    <List.Item.Meta
                    avatar={<Avatar src="http://www.espncricinfo.com/inline/content/image/1099644.html" />}
                    title={<a href={item.espncricinfo_url} target={"_blank"}>{item.player_name}</a>}
                    description={item.national_team}
                    />
                </List.Item>
                )}
            />
        )
    }
}
export default ListPlayers;