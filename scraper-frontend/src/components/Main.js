import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Home from './Home';
import Records from './Records';
import SearchPlayerProfile from './SearchPlayerProfile';
import NotFound from './NotFound';
class Main extends React.Component {
    render() {
        return (
        <div>
            <Switch>
                <Route exact path="/WebScrapingAPI/" component={Home} />
                <Route path = "/WebScrapingAPI/records" component={Records} />
                <Route path = "/WebScrapingAPI/search" component={SearchPlayerProfile} />
                <Route component={NotFound} />
            </Switch>
        </div>
        )
    }
}

export default Main;