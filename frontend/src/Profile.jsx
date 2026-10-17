import { useNavigate } from "react-router-dom";
import "./Profile.css";
import profilePhoto from "./assets/profile.jpg";
function Profile() {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const activeTicket = loggedInUser
    ? JSON.parse(localStorage.getItem(`activeTicket_${loggedInUser.id}`))
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
  return (
    <main className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          <img src={profilePhoto} alt="Profile" />
        </div>
        <h1>My Profile</h1>
        {activeTicket && (
          <div className="active-ticket-profile">
            <h2>Active Ticket</h2>
            <p>
              <strong>Service:</strong>
              {activeTicket.serviceName}
            </p>
            <p>
              <strong>Ticket Number:</strong>#{activeTicket.ticketNumber}
            </p>
            <p>
              <strong>People Ahead:</strong>
              {activeTicket.waiting}
            </p>
            <p>
              <strong>Estimated Wait:</strong>
              {activeTicket.time} minutes
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
            <span>{loggedInUser.role === "staff" ? "Staff" : "Customer"}</span>
          </p>
        </div>
        <button onClick={() => navigate("/services")}>Back to Services</button>
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
