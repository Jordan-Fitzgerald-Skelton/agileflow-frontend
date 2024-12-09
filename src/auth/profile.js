import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated && (
      <div className="profile-container">
        <img
          src={user.picture}
          alt={user.name}
          className="w-12 h-12" // Tailwind classes for size and rounding
        />
    </div>
    )
  );
};

export default Profile;