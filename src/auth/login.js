import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button className="border-b border-[#444] pb-2 text-white font-semibold text-5xl font-bold hover:bg-[#1C1C1C] rounded" onClick={() => loginWithRedirect()}>Log In</button>;
};

export default LoginButton;