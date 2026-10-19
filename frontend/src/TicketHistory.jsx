import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./TicketHistory.css";
import API_URL from "./api";

function TicketHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;

  // Replace this with your app's actual user ID
  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "null",
  );
  const userId = loggedInUser?.id;
  const filteredHistory = history.filter((ticket) => {
    const matchesStatus = filter === "All" || ticket.status === filter;

    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      String(ticket.ticketNumber).includes(search) ||
      ticket.serviceName.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });
  const totalPages = Math.ceil(filteredHistory.length / ticketsPerPage);

  const startIndex = (currentPage - 1) * ticketsPerPage;

  const paginatedHistory = filteredHistory.slice(
    startIndex,
    startIndex + ticketsPerPage,
  );
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        setError("Please log in to view your ticket history.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://${API_URL}/api/services/history/${userId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch ticket history.");
        }

        const data = await response.json();
        setHistory(data.history || []);
        setError("");
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    const socket = io("http://localhost:5000");
    socket.on("ticketHistoryUpdated", () => {
      fetchHistory();
    });

    fetchHistory();

    const intervalId = setInterval(fetchHistory, 5000);

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [userId]);

  if (loading) return <p>Loading ticket history...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="ticket-history-page">
      <h1>My Ticket History</h1>
      <div className="history-stats">
        <div className="stat-card total-stat">
          <p>Total Tickets</p>
          <h2>{history.length}</h2>
        </div>

        <div className="stat-card served-stat">
          <p>Served</p>
          <h2>
            {history.filter((ticket) => ticket.status === "Served").length}
          </h2>
        </div>

        <div className="stat-card waiting-stat">
          <p>Waiting</p>
          <h2>
            {history.filter((ticket) => ticket.status === "Waiting").length}
          </h2>
        </div>

        <div className="stat-card cancelled-stat">
          <p>Cancelled</p>
          <h2>
            {history.filter((ticket) => ticket.status === "Cancelled").length}
          </h2>
        </div>
      </div>
      <p className="history-subtitle">
        View your previous and current service tickets.
      </p>
      <div className="history-search">
        <input
          type="text"
          placeholder="Search by ticket number or service..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        {searchTerm && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
          >
            Clear
          </button>
        )}
      </div>
      <div className="history-filters">
        {["All", "Served", "Waiting", "Cancelled"].map((status) => (
          <button
            key={status}
            className={`history-filter ${filter === status ? "active" : ""}`}
            onClick={() => {
              setFilter(status);
              setCurrentPage(1);
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {history.length === 0 ? (
        <p>No ticket history found.</p>
      ) : filteredHistory.length === 0 ? (
        <p className="no-history-results">
          No tickets match your search or selected filter.
        </p>
      ) : (
        <div className="history-list">
          {paginatedHistory.map((ticket) => (
            <div className="history-card" key={ticket._id}>
              <h3>{ticket.serviceName}</h3>
              <p>Ticket Number: #{ticket.ticketNumber}</p>
              <p>
                Joined:{" "}
                {ticket.joinedAt
                  ? new Date(ticket.joinedAt).toLocaleString()
                  : "Not available"}
              </p>
              <p>
                Status:{" "}
                <span
                  className={`history-status ${ticket.status.toLowerCase()}`}
                >
                  {ticket.status}
                </span>
              </p>
              {ticket.completedAt && (
                <p>
                  Completed: {new Date(ticket.completedAt).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="history-pagination">
          <button
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default TicketHistory;
