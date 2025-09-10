import React from "react";

interface AdminHospitalProfile {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminHospitalProfile: React.FC<AdminHospitalProfile> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-5 border-b">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <i className="fas fa-hospital mr-2 text-blue-500"></i> Admin Hospital
        </h1>
      </div>
      <nav className="p-4">
        <ul>
          <li className="mb-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left p-2 rounded-md flex items-center ${
                activeTab === "dashboard" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
            >
              <i className="fas fa-tachometer-alt mr-2"></i> Dashboard
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => setActiveTab("profissionais")}
              className={`w-full text-left p-2 rounded-md flex items-center ${
                activeTab === "profissionais" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
            >
              <i className="fas fa-user-md mr-2"></i> Profissionais
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => setActiveTab("especialidades")}
              className={`w-full text-left p-2 rounded-md flex items-center ${
                activeTab === "especialidades" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
            >
              <i className="fas fa-stethoscope mr-2"></i> Especialidades
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => setActiveTab("hospitais")}
              className={`w-full text-left p-2 rounded-md flex items-center ${
                activeTab === "hospitais" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
            >
              <i className="fas fa-hospital mr-2"></i> Hospitais
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => setActiveTab("usuarios")}
              className={`w-full text-left p-2 rounded-md flex items-center ${
                activeTab === "usuarios" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
            >
              <i className="fas fa-users mr-2"></i> Usuários
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => setActiveTab("estatisticas")}
              className={`w-full text-left p-2 rounded-md flex items-center ${
                activeTab === "estatisticas" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
            >
              <i className="fas fa-chart-bar mr-2"></i> Estatísticas
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => setActiveTab("financeiro")}
              className={`w-full text-left p-2 rounded-md flex items-center ${
                activeTab === "financeiro" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
            >
              <i className="fas fa-dollar-sign mr-2"></i> Financeiro
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full text-left p-2 rounded-md flex items-center ${
                activeTab === "settings" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-indigo-100"
              }`}
            >
              <i className="fas fa-cog mr-2"></i> Configurações
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminHospitalProfile;