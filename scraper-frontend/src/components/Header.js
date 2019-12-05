import React from 'react';
import {NavLink} from 'react-router-dom';
class Header extends React.Component {
    render() {
        return (
            <div>
                <ul>
                    <li>
                        <NavLink exact activeClassName="active" to="/">Website Home</NavLink>
                    </li>
                    <li>
                        <NavLink exact activeClassName="active" to="/records">Player Records</NavLink>
                    </li>
                    <li>
                        <NavLink exact activeClassName="active" to="/search">Players Search</NavLink>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Header;