import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const path = window.location.pathname;

  if (path === "/register") return <Register />;
  if (path === "/dashboard") return <Dashboard />;

  return <Login />;
}

export default App;
