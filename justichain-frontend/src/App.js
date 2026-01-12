import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; // keep for now
import CitizenDashboard from "./pages/CitizenDashboard";
import RegisterCase from "./pages/RegisterCase";
import PoliceDashboard from "./pages/PoliceDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";


function App() {
  const path = window.location.pathname;

  // Public pages
  if (path === "/") return <Login />;
  if (path === "/register") return <Register />;

  // Citizen flow
  if (path === "/citizen") return <CitizenDashboard />;
  if (path === "/register-case") return <RegisterCase />;
  if (path === "/police") return <PoliceDashboard />;
  if (path === "/lawyer") return <LawyerDashboard />;

  // Legacy / generic dashboard (can remove later)
  if (path === "/dashboard") return <Dashboard />;


  // Fallback
  return <Login />;
}

export default App;
