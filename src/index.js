import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
<Auth0Provider
    domain={process.env.Auth_Domain}
    clientId={process.env.Auth_Client_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <App />
</Auth0Provider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals();