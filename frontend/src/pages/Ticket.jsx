import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./Ticket.css";
import { io } from "socket.io-client";
import API_URL from "../api";

function Ticket() {
  const location = useLocation();
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const activeTicketKey = loggedInUser
    ? `activeTicket_${loggedInUser.id}`
    : null;
 const savedTicket = activeTicketKey
  ? JSON.parse(localStorage.getItem(activeTicketKey))
  : null;

const completedTicketKey = loggedInUser
  ? `completedTicket_${loggedInUser.id}`
  : null;

const savedCompletedTicket = completedTicketKey
  ? JSON.parse(localStorage.getItem(completedTicketKey))
  : null;

const ticket = location.state?.ticketNumber ? location.state : savedTicket || savedCompletedTicket;

const isCompleted =
  !savedTicket &&
  !location.state &&
  savedCompletedTicket?.status === "Served";
  const { serviceId, serviceName, waiting, time, ticketNumber } =
  ticket || {};
  const [currentWaiting, setCurrentWaiting] = useState(waiting);
  const [currentTime, setCurrentTime] = useState(time);
  const [initialWaiting] = useState(ticket?.initialWaiting ?? waiting ?? 0);
  const [currentServing, setCurrentServing] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [turnNotification, setTurnNotification] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(
    typeof Notification !== "undefined"
      ? Notification.permission
      : "unsupported",
  );
  const [lastUpdated, setLastUpdated] = useState(null);
  const browserAlertShown = useRef(false);

  const notificationAudio = useRef(null);

  useEffect(() => {
    if (
      currentWaiting !== 1 ||
      !turnNotification ||
      !soundEnabled ||
      browserAlertShown.current
    ) {
      if (currentWaiting !== 1) {
        browserAlertShown.current = false;
      }
      return;
    }

    const audio = notificationAudio.current;
    if (!audio) {
      console.error("Audio is not initialized. Click Enable Sound first.");
      return;
    }

    audio.pause();
    audio.currentTime = 0;

    audio
      .play()
      .then(() => {
        browserAlertShown.current = true;
        console.log("Automatic queue sound played");
      })
      .catch((error) => {
        console.error("Automatic sound failed:", error);
      });
  }, [currentWaiting, turnNotification, soundEnabled]);
  useEffect(() => {
    if (!serviceId) return;
    const socket = io(`${API_URL}`);
    socket.on("queueUpdated", (updatedService) => {
      if (String(updatedService._id) === String(serviceId)) {
        setLastUpdated(new Date());
        const myQueueIndex = updatedService.queue
          ? updatedService.queue.findIndex(
              (customer) => customer.ticketNumber === ticketNumber,
            )
          : -1;
        if (myQueueIndex === -1) {
          setTurnNotification(false);
          setLastUpdated(new Date());
          if ((updatedService.currentTicketNumber || 0) >= ticketNumber) {
            const completedTicket = {
              ...ticket,
              status: "Served",
            };

            localStorage.setItem(
              `completedTicket_${loggedInUser.id}`,
              JSON.stringify(completedTicket),
            );

            localStorage.removeItem(activeTicketKey);
          }
          return;
        }
        const peopleAhead = myQueueIndex;

        setCurrentServing(updatedService.currentTicketNumber || 0);
        setCurrentWaiting(peopleAhead);
        setCurrentTime(peopleAhead * 3);
        if (
          myQueueIndex >= 0 &&
          peopleAhead <= 1 &&
          (updatedService.currentTicketNumber || 0) < ticketNumber
        ) {
          setTurnNotification(true);
        } else {
          setTurnNotification(false);
        }
      }
    });
    const updateQueue = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/services/${serviceId}`,
        );
        const data = await response.json();
        setLastUpdated(new Date());
        setCurrentServing(data.currentTicketNumber || 0);
        //console.log("CURRENT SERVING:",data.currentTicketNumber);
        //console.log("MY TICKET:",ticketNumber);

        const myQueueIndex = data.queue
          ? data.queue.findIndex(
              (customer) => customer.ticketNumber === ticketNumber,
            )
          : -1;
        if (myQueueIndex === -1) {
          setTurnNotification(false);
          setLastUpdated(new Date());
          if ((data.currentTicketNumber || 0) >= ticketNumber) {
            const completedTicket = {
              ...ticket,
              status: "Served",
            };

            localStorage.setItem(
              `completedTicket_${loggedInUser.id}`,
              JSON.stringify(completedTicket),
            );

            localStorage.removeItem(activeTicketKey);
          }
          return;
        }
        const peopleAhead = myQueueIndex;

        setCurrentWaiting(peopleAhead);
        setCurrentTime(peopleAhead * 3);
        if (
          peopleAhead === 1 &&
          myQueueIndex >= 0 &&
          (data.currentTicketNumber || 0) < ticketNumber
        ) {
          setTurnNotification(true);
        } else if (
          peopleAhead === 0 &&
          myQueueIndex >= 0 &&
          (data.currentTicketNumber || 0) < ticketNumber
        ) {
          setTurnNotification(true);
        } else {
          setTurnNotification(false);
        }
        if (data.currentTicketNumber >= ticketNumber) {
          localStorage.removeItem(activeTicketKey);
        } else {
          const updatedTicket = {
            ...ticket,
            waiting: peopleAhead,
            time: peopleAhead * 3,
          };
          localStorage.setItem(activeTicketKey, JSON.stringify(updatedTicket));
        }
      } catch (error) {
        console.error("Error updating queue:", error);
      }
    };

    updateQueue();
    const interval = setInterval(updateQueue, 5000);
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [serviceId]);
useEffect(() => {
  if (
    ticketNumber &&
    currentServing >= ticketNumber &&
    activeTicketKey
  ) {
    const completedTicket = {
      ...ticket,
      status: "Served",
    };

    localStorage.setItem(
      `completedTicket_${loggedInUser.id}`,
      JSON.stringify(completedTicket)
    );

    localStorage.removeItem(activeTicketKey);
  }
}, [currentServing, ticketNumber]);

  if (!serviceName) {
    return (
      <main className="ticket-page">
        <div className="empty-ticket-card">
          <div className="empty-ticket-icon">🎟️</div>

          <h2>No Active Ticket</h2>

          <p>You don't have an active queue ticket right now.</p>

          <button onClick={() => navigate("/services")}>Browse Services</button>
        </div>
      </main>
    );
  }

  return (
    <main className="ticket-page">
      <div className="ticket-card">
        <p className="ticket-label">SMARTQ TICKET</p>
        <button
          type="button"
          onClick={async () => {
            const audio = new Audio("/notification.mp3");
            audio.volume = 1;
            notificationAudio.current = audio;

            try {
              await audio.play();
              setSoundEnabled(true);
              console.log("Sound test successful");
            } catch (error) {
              console.error("Sound test failed:", error);
            }
          }}
        >
          Enable Sound
        </button>
        {turnNotification && (
          <div className="turn-notification">
            <span>🔔</span>
            <div>
              <strong>
                {currentWaiting === 1 ? "you're next!" : "It's your turn!"}
              </strong>
              <p>
                {currentWaiting === 1
                  ? "Only one person is ahead of you. Please get ready."
                  : "Please proceed for your service."}
              </p>
            </div>
          </div>
        )}
        <h1>{serviceName}</h1>
        <h2>Your Ticket Number: #{ticketNumber}</h2>
        <div className="ticket-number">
          <span>Your Ticket Number</span>
          <strong>#{ticketNumber}</strong>
        </div>
        <div className="ticket-number now-serving-card">
          <span>Now Serving</span>
          <strong>#{currentServing || "--"}</strong>
        </div>
        <div className="ticket-number">
          <span>People Ahead</span>
          <strong>{currentWaiting}</strong>
        </div>
        <div className="queue-progress">
          <div className="queue-progress-label">
            <span>Queue Progress</span>
            <strong>
              {initialWaiting === 0
                ? "100%"
                : `${Math.round(
                    Math.max(
                      0,
                      Math.min(
                        100,
                        ((initialWaiting - currentWaiting) / initialWaiting) *
                          100,
                      ),
                    ),
                  )}%`}
            </strong>
          </div>

          <div className="queue-progress-track">
            <div
              className="queue-progress-fill"
              style={{
                width: `${
                  initialWaiting === 0
                    ? 100
                    : Math.max(
                        0,
                        Math.min(
                          100,
                          ((initialWaiting - currentWaiting) / initialWaiting) *
                            100,
                        ),
                      )
                }%`,
              }}
            />
          </div>
        </div>
        <div className="queue-summary">
          <strong>
            {currentWaiting >= 3
              ? "You're in the queue"
              : currentWaiting === 2
                ? "You're getting closer!"
                : currentWaiting === 1
                  ? "You're next!"
                  : "It's your turn!"}
          </strong>

          <p>
            {currentWaiting >= 3
              ? `${currentWaiting} people are ahead of you.`
              : currentWaiting === 2
                ? "Only 2 people are ahead of you."
                : currentWaiting === 1
                  ? "Only 1 person is ahead of you. Get ready!"
                  : "Please proceed for your service."}
          </p>
        </div>
        <div className="ticket-info">
          <div>
            <span>Estimated Wait</span>
            <strong>{currentTime} minutes</strong>
          </div>
          <div>
            <span>Status</span>
            <strong
              className={
                currentServing >= ticketNumber
                  ? "served-status"
                  : currentWaiting === 0
                    ? "your-turn-status"
                    : "waiting-status"
              }
            >
              {isCompleted || currentServing >= ticketNumber
                ? "Served"
                : currentWaiting === 0
                  ? "Your Turn"
                  : "Waiting"}
            </strong>
          </div>
        </div>
        <div className="ticket-message">
  {isCompleted || currentServing >= ticketNumber
    ? "✅ Your service has been completed!"
    : currentWaiting === 0
      ? "🎉 It's your turn! Please proceed to the counter."
      : currentWaiting === 1
        ? "🔔 You're next! Please get ready."
        : `You're in the queue. ${currentWaiting} people are ahead of you. We'll keep you updated.`}
</div>

          
        <div className="last-updated">
          {lastUpdated
            ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
            : "Updating queue information..."}
        </div>
        {!isCompleted && currentServing < ticketNumber && (
          <button
            className="cancel-button"
            onClick={async () => {
              const confirmed = window.confirm(
                "Are you sure you want to cancel your queue?",
              );
              if (!confirmed) {
                return;
              }
              try {
                const response = await fetch(
                  `${API_URL}/api/services/${serviceId}/cancel`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      userId: loggedInUser.id,
                    }),
                  },
                );
                if (!response.ok) {
                  throw new Error("Failed to cancel queue");
                }
                localStorage.removeItem(activeTicketKey);
                navigate("/services");
              } catch (error) {
                console.error("Error cancelling queue:", error);
              }
            }}
          >
            Cancel Queue
          </button>
        )}
        <button className="back-button" onClick={() => navigate("/services")}>
          Back to Services
        </button>
      </div>
    </main>
  );
}
export default Ticket;
