import React from "react";

export default function Consultas() {
  return (
    <div className="w-full">
      <div className="mb-8 border-b pb-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-moyo-primary dark:text-moyo-primary mb-1">Consultas</h1>
          <p className="text-gray-700 dark:text-gray-300">Gerencie e visualize suas consultas agendadas.</p>
        </div>
        <button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-all">
          <i className="fas fa-plus mr-2"></i> Nova Consulta
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Exemplo de card de consulta */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <i className="fas fa-calendar-check text-blue-600 text-xl"></i>
            <span className="font-semibold text-lg">Consulta com Dr. João</span>
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">Data: 28/06/2025</div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">Horário: 14:00</div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">Local: Unidade Central</div>
          <div className="flex gap-2 mt-4">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm transition-all">
              <i className="fas fa-video mr-1"></i> Teleconsulta
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 rounded text-sm transition-all">
              <i className="fas fa-info-circle mr-1"></i> Detalhes
            </button>
          </div>
        </div>
        {/* Outros cards de consulta podem ser renderizados dinamicamente aqui */}
      </div>
    </div>
  );
}
