import React from 'react';

const EstatisticaAdmin = () => (
  <div className="animate-fadeIn">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Estatísticas</h1>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Atendimentos Mensais</h3>
                    <p className="text-3xl font-bold text-blue-900">12,458</p>
                    <div className="flex items-center mt-3 text-green-500">
                      <i className="fas fa-arrow-up mr-1"></i>
                      <span className="text-sm font-medium">15% desde o mês passado</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Novos Pacientes</h3>
                    <p className="text-3xl font-bold text-green-900">1,248</p>
                    <div className="flex items-center mt-3 text-green-500">
                      <i className="fas fa-arrow-up mr-1"></i>
                      <span className="text-sm font-medium">8% desde o mês passado</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Taxa de Ocupação</h3>
                    <p className="text-3xl font-bold text-purple-900">85%</p>
                    <div className="flex items-center mt-3 text-red-500">
                      <i className="fas fa-arrow-down mr-1"></i>
                      <span className="text-sm font-medium">2% desde a semana passada</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Distribuição de Atendimentos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Cardiologia</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Pediatria</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Ortopedia</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-purple-600 h-3 rounded-full" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Oncologia</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
);

export default EstatisticaAdmin;
