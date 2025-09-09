import React from "react";

export default function Notificacoes() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-moyo-primary mb-4">Notificações</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <p className="text-gray-700 dark:text-gray-200">Nenhuma notificação no momento.</p>
      </div>
      {/* Alertas */}
      <div className="card bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-400 flex flex-col">
        <div className="flex items-center mb-4"><i className="fas fa-bell text-yellow-400 text-2xl mr-3"></i><h2 className="text-lg font-bold text-moyo-dark">Alertas</h2></div>
        <ul className="space-y-4">
          <li className="flex items-start"><i className="fas fa-info-circle text-yellow-400 mt-1 mr-3"></i><div><h4 className="font-semibold mb-1">Você receberá alertas de consultas e exames aqui</h4><p className="text-moyo-gray text-sm">Configure suas preferências de notificação</p></div></li>
          <li className="flex items-start"><i className="fas fa-exclamation-triangle text-yellow-400 mt-1 mr-3"></i><div><h4 className="font-semibold mb-1">Fique atento às notificações importantes do hospital</h4><p className="text-moyo-gray text-sm">Verifique regularmente esta seção</p></div></li>
        </ul>
      </div>
    </div>
  );
}
