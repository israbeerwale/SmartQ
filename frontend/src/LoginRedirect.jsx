import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
function LoginRedirect() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser){
        return <Navigate to="/services" replace />;
    }
    return <Login />;
}
export default LoginRedirect;