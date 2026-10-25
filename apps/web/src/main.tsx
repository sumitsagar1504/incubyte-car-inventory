import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from './auth';
import {SavedCarsProvider} from './saved';
import App from './App';
import './style.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><AuthProvider><SavedCarsProvider><App/></SavedCarsProvider></AuthProvider></BrowserRouter></React.StrictMode>);
