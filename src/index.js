import React from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { SocketProvider } from "./context/SocketContext";
import "./index.css";
import App from "./App";

const root = createRoot(document.getElementById('root'));

//this allows for both Auth and the SocketContext to be used
root.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH_DOMAIN}
    clientId={process.env.REACT_APP_AUTH_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <SocketProvider>
      <App />
    </SocketProvider>
  </Auth0Provider>
);
