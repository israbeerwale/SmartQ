import { useEffect, useState } from "react";
import "./Staff.css";

function Staff() {
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [services, setServices] = useState([]);

  // Fetch services and automatically refresh every 5 seconds
  useEffect(() => {
    const loadServices = () => {
      fetch("http://localhost:5000/api/services", {
        cache: "no-store",
      })
        .then((response) => response.json())
        .then((data) => {
          //console.log("STAFF DATA:", data);
          setServices(data);
        })
        .catch((error) => {
          console.error("Error fetching services:", error);
        });
    };

    // First load
    const firstLoad = setTimeout(() => {
      loadServices();
    }, 0);

    // Auto refresh every 5 seconds
    const interval = setInterval(() => {
      loadServices();
    }, 5000);

    return () => {
      clearTimeout(firstLoad);
      clearInterval(interval);
    };
  }, []);

  const serveNextCustomer = async () => {
    if (!serviceId) {
      setMessage("Please select a service");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/services/${serviceId}/serve`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Customer served successfully!");

      // Fetch latest numbers immediately after serving
      const servicesResponse = await fetch(
        "http://localhost:5000/api/services"
      );

      const updatedServices = await servicesResponse.json();

      setServices(updatedServices);
    } catch (error) {
      console.error("Error serving customer:", error);
      setMessage("Failed to serve customer");
    }
  };

  const selectedService = services.find(
    (service) => service._id === serviceId
  );

  return (
    <main className="staff-page">
      <div className="staff-container">
        <h1>Staff Dashboard</h1>
        <div className="staff-summary">
  <p>
    Total Services
    <strong>{services.length}</strong>
  </p>

  <p>
    Total People Waiting
    <strong>
      {services.reduce(
        (total, service) => total + (Number(service.waiting) || 0),
        0
      )}
    </strong>
  </p>

  <p>
    Active Queues
    <strong>
      {services.filter(
        (service) => (Number(service.waiting) || 0) > 0
      ).length}
    </strong>
  </p>
</div>

        <div className="staff-card">
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            <option value="">Select a service</option>

            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>

          {selectedService && (
            <div className="queue-count">
              <p>
                People waiting:{" "}
                {selectedService.waiting}
              </p>

              <p>
                Estimated wait:{" "}
                {selectedService.estimatedTime} minutes
              </p>
              <p>
                Now Serving: #
                {selectedService.currentTicketNumber ?? 0}
              </p>
              <p>
                Next Ticket: #{selectedService.queue && selectedService.queue.length > 0 ?
                selectedService.queue[0].ticketNumber
                  : "---"}
              </p>
              <p>
                Status:{" "}
                <strong className={
                  selectedService.waiting === 0 ? "queue Empty" : "queue-active"

                }>
                {selectedService.waiting === 0 ? "Queue Empty": "Customers Waiting"}
                </strong>
              </p>
            </div>
          )}

          <button
            className="serve-button"
            onClick={serveNextCustomer}
            disabled={selectedService?.waiting === 0}
          >
            {selectedService?.waiting === 0 ? "No Customers Waiting": `Serve Next Customer (#${

              (selectedService?.currentTicketNumber ?? 0) + 1
            })`}
           
          </button>
          <button 
          className="refresh-button"
          onClick={async () => {
            setRefreshing(true);
            try{
              const response = await fetch(
                "http://localhost:5000/api/services"
                ,
                {
                  cache: "no-store",
                }
              );
              const data = await response.json();
              setServices(data);
            }catch(error){
              console.error("Error refreshing queue:", error);
            }finally {
              setRefreshing(false);
            }
            }}
            >
            {refreshing ? "Refreshing...." : "Refresh Queue"}
        
          </button>

          <p className="staff-message">
            {message}
          </p>
        </div>
      </div>
    </main>
  );
}

export default Staff;