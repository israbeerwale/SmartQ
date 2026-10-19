import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ServiceDetails.css";
import API_URL from "../api";
function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
 const loggedInUser = JSON.parse(
  localStorage.getItem("loggedInUser")
);

const activeTicketKey = loggedInUser
  ? `activeTicket_${loggedInUser.id}`
  : null;

const activeTicket = activeTicketKey
  ? localStorage.getItem(activeTicketKey)
  : null;
  useEffect(() =>{
    fetch(`http://${API_URL}/api/services/${id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("SERVICE DATA:",data);
      setService(data);
      setLoading(false);
    })
    .catch((error) => {
      console.log("Error fetching service:",error);
      setLoading(false);
    });
  }, [id]);
 
  const joinQueueHandler = async() => {
   
    if (!loggedInUser) {
      navigate("/login");
      return;
    }
    console.log("Active Ticket:", activeTicket);
    console.log("Logged-in user:", loggedInUser);
    console.log("Active ticket key:", activeTicketKey);
    if(activeTicket) {
      alert("You already have an active ticket.");
      return;
    }
    try{
       setJoined(true);
       const response = await fetch(
        `http://${API_URL}/api/services/${id}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: loggedInUser.id,
          }),
        }
       );
       const data = await response.json();
       console.log("Join Data:", data);
       if(!response.ok){
        throw new Error(data.message || "Failed to join queue");
       }
      
     
const newTicket = {
  serviceId: data._id,
  serviceName: data.name,
  waiting: data.waiting,
  initialWaiting: data.waiting,
  time: data.estimatedTime,
  ticketNumber: data.ticketNumber,
  status: "Waiting",
};

console.log("New ticket saved:", newTicket);

localStorage.setItem(
  `activeTicket_${loggedInUser.id}`,
  JSON.stringify(newTicket)
);

navigate("/ticket", {
  replace: true,
  state: newTicket,
});
    }catch(error) {
      console.error("Error joining queue:",error);
      setJoined(false);
    }
  };
  if(loading){
    return <h2>Loading service...</h2>;
  }

  if(!service){
    return <h2>Service not found</h2>;
  }
  return (
    <main className="service-details">
      <h1>{service.name}</h1>
      <p>{service.description}</p>
      <div className="queue-info">
        <h2>Current Queue</h2>
        <p>
          People waiting:<strong>{service.waiting}</strong>
        </p>
        <p>
          Estimated waiting time:{" "}<strong>{service.estimatedTime} minutes</strong>
        </p>
        <button onClick={joinQueueHandler} disabled={joined}>
          {joined ? "Joining..." : "Join Queue"}
        </button>
      </div>
    </main>
  );
}
export default ServiceDetails;
