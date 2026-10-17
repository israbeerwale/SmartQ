import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
function Navbar(){
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(JSON.parse(localStorage.getItem("loggedInUser")));
    return(
        <nav className="navbar">
            <h2 className="logo">SmartQ</h2>
            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/services">Services</Link>
                <button onClick={() => navigate("/my-queue")}>
                    My Queue
                </button>
                {loggedInUser && (
                    <button onClick={() => navigate("/ticket-history")}>
                        Ticket History
                    </button>
                )}
                {loggedInUser && (
                    <button onClick={() => navigate("/profile")}>
                        Profile
                    </button>
                )}
            
                {loggedInUser && (
                    <span className="user-email">
                        {loggedInUser.email}
                    </span>
                )}
                {loggedInUser?.role === "staff" && (
                    <button onClick={() => navigate("/staff")}> 
                        Staff Dashboard
                    </button>
                )}
                {loggedInUser ? (
                <button onClick={() => {
                    localStorage.removeItem("loggedInUser");
                    setLoggedInUser(null);
                    navigate("/login");
                }}>Logout</button>
            ) : (
                <button onClick={() => navigate("/login")}>
                    Login
                </button>
            )}
            </div>
        </nav>
    );
}
export default Navbar;