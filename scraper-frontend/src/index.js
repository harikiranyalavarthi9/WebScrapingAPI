import React from 'react';
import ReactDOM from 'react-dom';
import { Route, NavLink, Switch, BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import Records from './components/Records';
import SearchPlayerProfile from './components/SearchPlayerProfile';
import NotFound from './components/NotFound';
import * as serviceWorker from './serviceWorker';

const routing = (
    <Router>
        <div>
            <ul>
                <li>
                    <NavLink exact activeClassName="active" to="/">Home</NavLink>
                </li>
                <li>
                    <NavLink exact activeClassName="active" to="/records">Records</NavLink>
                </li>
                <li>
                    <NavLink exact activeClassName="active" to="/search">Search</NavLink>
                </li>
            </ul>
            <Switch>
                <Route exact path="/" component={App} />
                <Route path = "/records" component={Records} />
                <Route path = "/search" component={SearchPlayerProfile} />
                <Route component={NotFound} />
            </Switch>
        </div>
    </Router>
);

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
