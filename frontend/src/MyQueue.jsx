import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyQueue.css";
import API_URL from "./api";

function MyQueue() {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser")
    );
    useEffect(() => {
        if (!loggedInUser) return;
        fetch(
            `${API_URL}/api/auth/history/${loggedInUser.id}`
        )
        .then((response) => response.json())
        .then((data) => {
            setHistory(data);
        })
        .catch((error) => {
            console.error(error);
        });
    }, []);
    return (
        <main className="my-queue-page">
            <h1>My Queue</h1>
            <p className="history-count">
                {history.length} queue record{history.length !== 1 ? "s" : ""}
            </p>
            {history.length === 0 ? (
                <p>No queue history yet.</p>
            ) : (
                <div className="queue-history">
                {history.map((item, index) => (
                    <div  className="history-card" key={index}>
                        <h2>{item.serviceName}</h2>
                        <p><strong>Ticket Number:</strong>{" "}
                            {item.ticketNumber ?? "_"}
                        </p>
                        <p><strong>Status:</strong>{" "}
                        <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span></p>
                        <p>
                            <strong>Date:</strong>{" "}
                            {new Date(item.date).toLocaleDateString()}
                        </p>
                    </div>
                ))}
                </div>
            )}
            <button onClick={() => navigate("/services")}>
                Back to Services
            </button>
        </main>
    );
}
export default MyQueue;