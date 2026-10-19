import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Services.css";
import API_URL from "../api";
const serviceIcons = {
  "Hair Salon": "✂️",
  "General Consultation": "🩺",
  "Bank Services": "🏦",
  "Student Help Desk": "🎓",
};
const serviceDetails = {
  "Hair Salon": {
    icon: "✂️",
    description: "Haircuts, styling and salon services.",
  },
  "General Consultation": {
    icon: "🩺",
    description: "Consult a doctor without waiting in a physical line.",
  },
  "Bank Services": {
    icon: "🏦",
    description: "Get banking assistance and manage service requests.",
  },
  "Student Help Desk": {
    icon: "🎓",
    description: "Get help with student queries and administrative services.",
  },
};
function Services() {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const [activeTicket, setActiveTicket] = useState(null);

  useEffect(() => {
    const loadActiveTicket = async () => {
  if (!loggedInUser?.id) {
    setActiveTicket(null);
    return;
  }

  const key = `activeTicket_${loggedInUser.id}`;

  // Show the saved ticket immediately
  const saved = localStorage.getItem(key);

  if (saved) {
    try {
      const ticket = JSON.parse(saved);

      if (
        ticket?.serviceId &&
        ticket?.ticketNumber &&
        ticket.status !== "Served" &&
        ticket.status !== "Cancelled"
      ) {
        setActiveTicket(ticket);
      }
    } catch (error) {
      console.error("Invalid saved ticket:", error);
    }
  }

  // Then sync with the backend
  try {
    const response = await fetch(
      `${API_URL}/api/services/active-ticket/${loggedInUser.id}`
    );

    if (!response.ok) {
      return;
    }

    const historyTicket = await response.json();

    const ticket = {
      serviceId: historyTicket.serviceId,
      serviceName: historyTicket.serviceName,
      ticketNumber: historyTicket.ticketNumber,
      status: historyTicket.status,
      waiting: 0,
      initialWaiting: 0,
      time: 0,
    };

    localStorage.setItem(key, JSON.stringify(ticket));
    setActiveTicket(ticket);
  } catch (error) {
    console.error("Error loading active ticket:", error);
  }
};

    loadActiveTicket();

    window.addEventListener("focus", loadActiveTicket);
    window.addEventListener("activeTicketUpdated", loadActiveTicket);

    return () => {
      window.removeEventListener("focus", loadActiveTicket);
      window.removeEventListener("activeTicketUpdated", loadActiveTicket);
    };
  }, [loggedInUser?.id]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(" ");
  const [searchTerm, setSearchTerm] = useState("");
  const fetchServices = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/services`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load services. Please try again.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the server.");
      }

      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the server. Check that your backend is running."
          : err.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);
  if (loading) {
    return (
      <main className="services-page">
        <div className="services-loading">
          <div className="loading-spinner"></div>
          <h2>Loading services...</h2>
          <p>Please wait while we fetch available services.</p>
        </div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="services-page">
        <div className="services-error">
          <div className="services-error-icon">!</div>
          <h2>Couldn't load services</h2>
          <p>{error}</p>

          <button className="retry-button" onClick={fetchServices}>
            Try Again ↻
          </button>
        </div>
      </main>
    );
  }
  const filteredServices = services.filter((service) => {
    const query = searchTerm.trim().toLowerCase();

    return (
      service.name?.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query)
    );
  });
  return (
    <main className="services-page">
    
      {activeTicket && (
        <button
          className="active-ticket-button"
         onClick={() => {
  const key = `activeTicket_${loggedInUser.id}`;
  const savedTicket = localStorage.getItem(key);

  if (!savedTicket) {
    alert("Ticket not found. Please try again.");
    return;
  }

  try {
    const ticket = JSON.parse(savedTicket);

    if (!ticket.serviceId || !ticket.ticketNumber) {
      alert("Ticket information is incomplete.");
      return;
    }

    navigate("/ticket", {
      state: ticket,
    });
  } catch (error) {
    console.error("Error opening ticket:", error);
    alert("Unable to open ticket.");
  }
}}
        >
          View My Ticket
        </button>
      )}
      <h1>Available Services</h1>
      <p className="section-description">
        Choose a service and join its queue digitally.
      </p>
      <p className="section-count">
        {services.length} {services.length === 1 ? "service" : "services"}{" "}
        available
      </p>
      <div className="service-search">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search services"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {searchTerm.trim() && (
        <p className="search-results-count">
          {filteredServices.length}{" "}
          {filteredServices.length === 1 ? "service" : "services"} found
        </p>
      )}
      {filteredServices.length === 0 ? (
        <div className="empty-services">
          <div className="empty-services-icon">🔍</div>

          <h2>
            {searchTerm.trim()
              ? "No Matching Services Found"
              : "No Services Available"}
          </h2>

          <p>
            {searchTerm.trim()
              ? `No services match "${searchTerm}". Try another search.`
              : "Please check back later. New services may be added soon."}
          </p>

          {searchTerm.trim() && (
            <button className="retry-button" onClick={() => setSearchTerm("")}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="service-grid">
          {filteredServices.map((service) => (
            <div className="service-card" key={service._id}>
              <div className="service-card-heading">
                <div className="service-icon">
                  {serviceDetails[service.name]?.icon || "✦"}
                </div>

                <div>
                  <h2>{service.name}</h2>
                  <span
                    className={`service-label ${
                      Number(service.waiting) > 0
                        ? "queue-busy"
                        : "queue-available"
                    }`}
                  >
                    {Number(service.waiting) > 0
                      ? "● PEOPLE WAITING"
                      : "● NO WAITING"}
                  </span>
                </div>
              </div>

              <p className="service-description">
                {service.description ||
                  serviceDetails[service.name]?.description ||
                  "Join the digital queue for this service."}
              </p>

              <div className="service-stats">
                <div className="service-stat">
                  <span>People waiting</span>
                  <strong>{service.waiting ?? 0}</strong>
                </div>

                <div className="service-stat">
                  <span>Estimated wait</span>
                  <strong>
                    {Math.max(0, Number(service.waiting) || 0) * 3} min
                  </strong>
                </div>
              </div>

              <Link
                to={`/services/${service._id}`}
                className="view-queue-button"
              >
                View Queue <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Services;
