import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/landing", { replace: true });
  };

  return (
    <aside className="w-64 bg-gray-900 p-6 flex flex-col border-r border-gray-800">
      <h2 className="text-2xl font-bold mb-8">☕ CoinBrew</h2>

      <nav className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-left px-2 py-1 rounded hover:bg-gray-800 transition"
        >
          📈 Dashboard
        </button>

        <button
          onClick={() => navigate("/portfolio")}
          className="text-left px-2 py-1 rounded hover:bg-gray-800 transition"
        >
          💼 Portfolio
        </button>

        <button
          onClick={() => navigate("/settings")}
          className="text-left px-2 py-1 rounded hover:bg-gray-800 transition"
        >
          ⚙️ Settings
        </button>
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full px-2 py-1 rounded bg-red-600 hover:bg-red-700 transition"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
