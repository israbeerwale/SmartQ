import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        return <Navigate to="/login" replace />;
    }
    if(loggedInUser.role !== "staff")
    {
        return <Navigate to="/services" replace />
    }
    return children;
}
export default ProtectedRoute;