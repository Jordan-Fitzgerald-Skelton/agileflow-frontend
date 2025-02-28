import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { SocketProvider } from './context/SocketContext'; // Import the Socket Context
import './index.css';
import App from './App';

const root = createRoot(document.getElementById('root'));

root.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH_DOMAIN}
    clientId={process.env.REACT_APP_AUTH_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    {/*Wrapping the App in SocketProvider to manage WebSocket connections*/}
    <SocketProvider>
      <App />
    </SocketProvider>
  </Auth0Provider>
);
