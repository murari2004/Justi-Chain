import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; // keep for now
import CitizenDashboard from "./pages/CitizenDashboard";
import RegisterCase from "./pages/RegisterCase";
import PoliceDashboard from "./pages/PoliceDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import JudgeAccess from "./pages/JudgeAccess";
import JudgeDashboard from "./pages/JudgeDashboard";
import Courtroom from "./pages/Courtroom";

function App() {
  const path = window.location.pathname;

  // 🔓 Public pages
  if (path === "/") return <Login />;
  if (path === "/register") return <Register />;

  // 👤 Citizen flow
  if (path === "/citizen") return <CitizenDashboard />;
  if (path === "/register-case") return <RegisterCase />;

  // 👮 Police
  if (path === "/police") return <PoliceDashboard />;

  // ⚖️ Lawyer
  if (path === "/lawyer") return <LawyerDashboard />;

  // 👨‍⚖️ Judge / Admin
  if (path === "/judge-access") return <JudgeAccess />;
  if (path === "/judge") return <JudgeDashboard />;

  // 🏛️ Courtroom (dynamic)
  if (path.startsWith("/courtroom/")) return <Courtroom />;

  // 🗂 Legacy / generic dashboard
  if (path === "/dashboard") return <Dashboard />;

  // 🔁 Fallback
  return <Login />;
}

export default App;
