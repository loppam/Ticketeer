import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Navigation from "./components/shared/Navigation";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import PaymentCallback from "./pages/PaymentCallback";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import PropTypes from "prop-types";
import "./App.css";
import Home from "./pages/Home";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? <Navigate to="/dashboard" /> : children;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/create"
          element={
            <PrivateRoute>
              <CreateEvent />
            </PrivateRoute>
          }
        />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/events/:eventId/register" element={<EventDetails />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route
          path="/registration/:registrationId/success"
          element={<RegistrationSuccess />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
