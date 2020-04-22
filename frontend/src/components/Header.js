import React from 'react';
import {NavLink} from 'react-router-dom';
class Header extends React.Component {
    render() {
        return (
            <div>
                <ul>
                    <li>
                        <NavLink exact activeClassName="active" to="/WebScrapingAPI/">Website Home</NavLink>
                    </li>
                    <li>
                        <NavLink exact activeClassName="active" to="/WebScrapingAPI/records">Player Records</NavLink>
                    </li>
                    <li>
                        <NavLink exact activeClassName="active" to="/WebScrapingAPI/search">Players Search</NavLink>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Header;