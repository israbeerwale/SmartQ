import { Navigate } from "react-router-dom";
import Register from "./pages/Register";
function RegisterRedirect() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        return <Navigate to="/services" replace />;
    }
    return <Register />;
}
export default RegisterRedirect;