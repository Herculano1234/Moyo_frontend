import React, { useState } from "react";
import SidebarAdmin from "./SidebarAdmin";
import DashboardAdmin from "./DashboardAdmin";
import HospitalAdmin from "./HospitalAdmin";
import UsuarioAdmin from "./UsuarioAdmin";
import EstatisticaAdmin from "./EstatisticaAdmin";
import FinanceiroAdmin from "./FinanceiroAdmin";
import ConfigAdmin from "./ConfigAdmin";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardAdmin />;
      case "hospitais":
        return <HospitalAdmin />;
      case "usuarios":
        return <UsuarioAdmin />;
      case "estatisticas":
        return <EstatisticaAdmin />;
      case "financeiro":
        return <FinanceiroAdmin />;
      case "settings":
        return <ConfigAdmin />;
      default:
        return <DashboardAdmin />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAdmin activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 overflow-y-auto">
        {renderTab()}
      </main>
    </div>
  );
};

export default AdminDashboard;