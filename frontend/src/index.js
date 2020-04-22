import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const routing = (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

ReactDOM.render(routing, document.getElementById('root'));
serviceWorker.unregister();
