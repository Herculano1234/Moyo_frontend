import React from "react";
import { HiHome, HiUserGroup, HiBuildingOffice2, HiChartBar, HiCurrencyDollar, HiCog } from "react-icons/hi2";

const adminNavItems = [
  { key: "dashboard", label: "Dashboard", icon: <HiHome className="w-5 h-5" /> },
  { key: "hospitais", label: "Hospitais", icon: <HiBuildingOffice2 className="w-5 h-5" /> },
  { key: "usuarios", label: "Usuários", icon: <HiUserGroup className="w-5 h-5" /> },
  { key: "estatisticas", label: "Estatísticas", icon: <HiChartBar className="w-5 h-5" /> },
  { key: "financeiro", label: "Financeiro", icon: <HiCurrencyDollar className="w-5 h-5" /> },
  { key: "settings", label: "Configurações", icon: <HiCog className="w-5 h-5" /> },
];

interface SidebarAdminProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-xl flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
        <div className="flex items-center mb-8 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3 shadow-lg">
                <i className="fas fa-heartbeat text-2xl text-[#DC2626] pulsing"></i>
              </div>
              <span className="text-3xl font-extrabold">Moyo</span>
            </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {adminNavItems.map((item) => (
          <button
            key={item.key}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 text-left
              ${activeTab === item.key ? 'bg-moyo-primary/10 font-semibold text-moyo-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-moyo-primary/10 hover:text-moyo-primary'}`}
            onClick={() => setActiveTab(item.key)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
          <div>
            <p className="text-sm font-medium">Administrador</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">admin@moyo.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
