import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import defaultPhoto from "./assets/profile.jpg";

function Profile() {
const navigate = useNavigate();
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

const [profilePhoto, setProfilePhoto] = useState(() => {
if (!loggedInUser) return defaultPhoto;
return (
localStorage.getItem("profilePhoto_${loggedInUser.id}") ||
defaultPhoto
);
});

const activeTicket = loggedInUser
? JSON.parse(
localStorage.getItem("activeTicket_${loggedInUser.id}")
)
: null;

if (!loggedInUser) {
return (
<main className="profile-page">
<div className="profile-card">
<h1>Please Login</h1>
<p>Please login to view your profile.</p>
<button onClick={() => navigate("/login")}>Login</button>
</div>
</main>
);
}

const handlePhotoChange = (event) => {
const file = event.target.files?.[0];
if (!file) return;

if (!file.type.startsWith("image/")) {
  alert("Please select an image file.");
  return;
}

if (file.size > 1024 * 1024) {
  alert("Please select an image smaller than 1 MB.");
  return;
}

const reader = new FileReader();

reader.onload = () => {
  const imageData = reader.result;
  localStorage.setItem(
    `profilePhoto_${loggedInUser.id}`,
    imageData
  );
  setProfilePhoto(imageData);
};

reader.readAsDataURL(file);

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
        <p><strong>Service:</strong> {activeTicket.serviceName}</p>
        <p><strong>Ticket Number:</strong> #{activeTicket.ticketNumber}</p>
        <p><strong>People Ahead:</strong> {activeTicket.waiting}</p>
        <p><strong>Estimated Wait:</strong> {activeTicket.time} minutes</p>
      </div>
    )}

    <div className="profile-info">
      <p>
        <strong>Email:</strong>
        <span>{loggedInUser.email}</span>
      </p>
      <p>
        <strong>Account Type:</strong>
        <span>{loggedInUser.role === "staff" ? "Staff" : "Customer"}</span>
      </p>
    </div>

    <button onClick={() => navigate("/services")}>
      Back to Services
    </button>

    <button
      onClick={() => {
        localStorage.removeItem("loggedInUser");
        navigate("/login");
      }}
    >
      Logout
    </button>
  </div>
</main>

);
}

export default Profile;