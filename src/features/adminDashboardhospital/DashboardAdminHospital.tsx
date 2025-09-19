import React, { useState } from "react";
import ProfissionaisAdmin from "./ProfissionaisAdmin";
import ExamesAdmin from "./ExamesAdmin";
import Financas from "./Especialidades";
import Consult from "./Consult";
import Definicoes from "./Definicoes";
import Relatorio from "./Relatorio";

// Componentes para o dashboard
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardAdminHospital: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dados mockados para demonstração
  const examesData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Exames Realizados',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const consultasHoje = 24;
  const medicosAtivos = 18;
  const totalPacientes = 342;
  const nomeDono = "Dr. Carlos Silva";
  const fotoDono = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";

  const renderContent = () => {
    switch (activeTab) {
      case "profissionais":
        return <ProfissionaisAdmin />;
      case "exames":
        return <ExamesAdmin />;
      case "financas":
        return <Financas />;
      case "consult":
        return <Consult />;
      case "definicoes":
        return <Definicoes />;
      case "relatorio":
        return <Relatorio />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Visão Geral do Hospital</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-md flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Consultas Hoje</p>
                  <p className="text-xl font-bold">{consultasHoje}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-md flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Médicos Ativos</p>
                  <p className="text-xl font-bold">{medicosAtivos}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-md flex items-center">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total de Pacientes</p>
                  <p className="text-xl font-bold">{totalPacientes}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-md flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <img src={fotoDono} alt="Diretor" className="h-10 w-10 rounded-full object-cover" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Diretor do Hospital</p>
                  <p className="text-sm font-bold">{nomeDono}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <h2 className="text-lg font-semibold mb-4">Exames Realizados (Últimos 6 Meses)</h2>
                <Bar 
                  data={examesData} 
                  options={{ 
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }} 
                />
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-md">
                <h2 className="text-lg font-semibold mb-4">Distribuição de Especialidades</h2>
                <Doughnut 
                  data={{
                    labels: ['Cardiologia', 'Pediatria', 'Ortopedia', 'Dermatologia', 'Outros'],
                    datasets: [
                      {
                        label: 'Médicos por Especialidade',
                        data: [5, 3, 4, 2, 4],
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.2)',
                          'rgba(54, 162, 235, 0.2)',
                          'rgba(255, 206, 86, 0.2)',
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(153, 102, 255, 0.2)',
                        ],
                        borderColor: [
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-blue-50">
      {/* Sidebar */}
      <div className="w-64 bg-blue-100 text-blue-900 flex flex-col shadow-lg">
         <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
            <div className="flex items-center mb-8 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3 shadow-lg">
                <i className="fas fa-heartbeat text-2xl text-[#DC2626] pulsing"></i>
              </div>
              <span className="text-3xl font-extrabold">Moyo</span>
            </div>
      </div>
        <div className="p-4 text-xl font-bold border-b border-blue-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Admin Hospital
        </div>
        <nav className="flex-1 py-4">
          <button
            className={`w-full py-3 px-4 text-left flex items-center ${activeTab === "dashboard" ? "bg-blue-200 text-blue-800 font-medium" : "hover:bg-blue-50"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
          <button
            className={`w-full py-3 px-4 text-left flex items-center ${activeTab === "profissionais" ? "bg-blue-200 text-blue-800 font-medium" : "hover:bg-blue-50"}`}
            onClick={() => setActiveTab("profissionais")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Profissionais
          </button>
          <button
            className={`w-full py-3 px-4 text-left flex items-center ${activeTab === "exames" ? "bg-blue-200 text-blue-800 font-medium" : "hover:bg-blue-50"}`}
            onClick={() => setActiveTab("exames")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exames
          </button>
          <button
            className={`w-full py-3 px-4 text-left flex items-center ${activeTab === "financas" ? "bg-blue-200 text-blue-800 font-medium" : "hover:bg-blue-50"}`}
            onClick={() => setActiveTab("financas")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Especialidades
          </button>
          <button
            className={`w-full py-3 px-4 text-left flex items-center ${activeTab === "consult" ? "bg-blue-200 text-blue-800 font-medium" : "hover:bg-blue-50"}`}
            onClick={() => setActiveTab("consult")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Horario
          </button>
          <button
            className={`w-full py-3 px-4 text-left flex items-center ${activeTab === "definicoes" ? "bg-blue-200 text-blue-800 font-medium" : "hover:bg-blue-50"}`}
            onClick={() => setActiveTab("definicoes")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Definições
          </button>
          
        </nav>
        
        <div className="p-4 border-t border-blue-200 flex items-center">
          <img src={fotoDono} alt="Usuário" className="h-10 w-10 rounded-full object-cover mr-3" />
          <div>
            <p className="font-medium">{nomeDono}</p>
            <p className="text-sm text-blue-600">Administrador</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};

export default DashboardAdminHospital;