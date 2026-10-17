import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginRedirect from "./LoginRedirect";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Ticket from "./pages/Ticket";
import Profile from "./Profile";
import MyQueue from "./MyQueue";
import RegisterRedirect from "./RegisterRedirect";
import Staff from "./Staff";
import TicketHistory from "./TicketHistory";

import "./App.css";
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-queue" element={<MyQueue />} />
        <Route path="/ticket-history" element={<TicketHistory />} />
        <Route
          path="/ticket"
          element={(() => {
            const loggedInUser = JSON.parse(
              localStorage.getItem("loggedInUser"),
            );

            const activeTicket = loggedInUser
              ? localStorage.getItem(`activeTicket_${loggedInUser.id}`)
              : null;

            return loggedInUser && activeTicket ? (
              <Ticket />
            ) : loggedInUser ? (
              <Ticket />
            ) : (
              <Navigate to="/login" replace />
            );
          })()}
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <Staff />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegisterRedirect />} />
        <Route path="/login" element={<LoginRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
