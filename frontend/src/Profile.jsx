import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import defaultPhoto from "./assets/profile.jpg";

function Profile() {
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "null"
  );

  if (!loggedInUser) {
    return (
      <main className="profile-page">
        <div className="profile-card">
          <h1>Please Login</h1>
          <p>Please login to view your profile.</p>
          <button onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <ProfileContent
      key={loggedInUser.email.trim().toLowerCase()}
      loggedInUser={loggedInUser}
      navigate={navigate}
    />
  );
}

function ProfileContent({ loggedInUser, navigate }) {
  const photoKey = `profilePhoto_${loggedInUser.email
    .trim()
    .toLowerCase()}`;

  const [profilePhoto, setProfilePhoto] = useState(
    () => localStorage.getItem(photoKey) || defaultPhoto
  );

  const activeTicket = JSON.parse(
    localStorage.getItem(`activeTicket_${loggedInUser.id}`) || "null"
  );

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("Please select an image smaller than 1 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imageData = reader.result;

        localStorage.setItem(photoKey, imageData);
        setProfilePhoto(imageData);
      } catch (error) {
        alert("Unable to save photo. Please choose a smaller image.");
        console.error(error);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login", { replace: true });
  };

  return (
    <main className="profile-page">
      <div className="profile-card">

        <div className="profile-avatar">
          <img src={profilePhoto} alt="Profile" />
        </div>

        <label className="change-photo-button">
          Change Profile Photo
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            hidden
          />
        </label>

        <h1>My Profile</h1>

        {activeTicket && (
          <div className="active-ticket-profile">
            <h2>Active Ticket</h2>

            <p>
              <strong>Service:</strong> {activeTicket.serviceName}
            </p>

            <p>
              <strong>Ticket Number:</strong> #{activeTicket.ticketNumber}
            </p>

            <p>
              <strong>People Ahead:</strong> {activeTicket.waiting}
            </p>

            <p>
              <strong>Estimated Wait:</strong> {activeTicket.time} minutes
            </p>
          </div>
        )}

        <div className="profile-info">
          <p>
            <strong>Email:</strong>
            <span>{loggedInUser.email}</span>
          </p>

          <p>
            <strong>Account Type:</strong>
            <span>
              {loggedInUser.role === "staff" ? "Staff" : "Customer"}
            </span>
          </p>
        </div>

        <button onClick={() => navigate("/services")}>
          Back to Services
        </button>

        <button onClick={handleLogout}>
          Logout
        </button>

      </div>
    </main>
  );
}

export default Profile;