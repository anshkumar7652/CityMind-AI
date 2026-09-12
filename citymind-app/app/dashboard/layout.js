export const metadata = {
  title: "CityMind Console | Municipal Digital Twin & AI Governor",
  description: "Real-time municipal digital twin map, predictive risk engine, citizen portal, and AI Governor.",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-editorial-wrapper min-h-screen">
      {children}
    </div>
  );
}
