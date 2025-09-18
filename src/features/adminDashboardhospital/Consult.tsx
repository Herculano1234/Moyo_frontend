import React, { useState, useEffect } from "react";

interface TimeSlot {
  id: number;
  time: string;
  professionals?: number;
  rooms?: number;
  patientsPerSlot: number;
  type: 'consultation' | 'exam';
}

const Consult: React.FC = () => {
  const [consultationSlots, setConsultationSlots] = useState<TimeSlot[]>([
    { id: 1, time: "08:00 - 09:00", professionals: 3, patientsPerSlot: 15, type: 'consultation' },
    { id: 2, time: "09:00 - 10:00", professionals: 4, patientsPerSlot: 20, type: 'consultation' },
    { id: 3, time: "10:00 - 11:00", professionals: 2, patientsPerSlot: 10, type: 'consultation' },
  ]);
  
  const [examSlots, setExamSlots] = useState<TimeSlot[]>([
    { id: 4, time: "08:00 - 09:00", rooms: 2, patientsPerSlot: 8, type: 'exam' },
    { id: 5, time: "10:00 - 11:00", rooms: 3, patientsPerSlot: 12, type: 'exam' },
    { id: 6, time: "14:00 - 15:00", rooms: 1, patientsPerSlot: 4, type: 'exam' },
  ]);
  
  const [newConsultation, setNewConsultation] = useState({
    time: "",
    professionals: 1,
    patientsPerSlot: 1
  });
  
  const [newExam, setNewExam] = useState({
    time: "",
    rooms: 1,
    patientsPerSlot: 1
  });
  
  const [activeTab, setActiveTab] = useState<'consultations' | 'exams'>('consultations');

  // Adicionar novo horário de consulta
  const handleAddConsultation = () => {
    if (!newConsultation.time) return;
    
    const newSlot: TimeSlot = {
      id: Math.max(...consultationSlots.map(s => s.id), 0) + 1,
      time: newConsultation.time,
      professionals: newConsultation.professionals,
      patientsPerSlot: newConsultation.patientsPerSlot,
      type: 'consultation'
    };
    
    setConsultationSlots([...consultationSlots, newSlot]);
    setNewConsultation({ time: "", professionals: 1, patientsPerSlot: 1 });
  };

  // Adicionar novo horário de exame
  const handleAddExam = () => {
    if (!newExam.time) return;
    
    const newSlot: TimeSlot = {
      id: Math.max(...examSlots.map(s => s.id), 0) + 1,
      time: newExam.time,
      rooms: newExam.rooms,
      patientsPerSlot: newExam.patientsPerSlot,
      type: 'exam'
    };
    
    setExamSlots([...examSlots, newSlot]);
    setNewExam({ time: "", rooms: 1, patientsPerSlot: 1 });
  };

  // Remover horário
  const removeSlot = (id: number, type: 'consultation' | 'exam') => {
    if (type === 'consultation') {
      setConsultationSlots(consultationSlots.filter(slot => slot.id !== id));
    } else {
      setExamSlots(examSlots.filter(slot => slot.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Gerenciamento de Consultas e Exames</h1>
      
      {/* Abas para alternar entre consultas e exames */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'consultations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('consultations')}
        >
          Consultas
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'exams' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('exams')}
        >
          Exames
        </button>
      </div>
      
      {/* Conteúdo da aba de Consultas */}
      {activeTab === 'consultations' && (
        <div>
          {/* Formulário para adicionar horários de consulta */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Definir Horários de Consulta</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                <input
                  type="text"
                  value={newConsultation.time}
                  onChange={(e) => setNewConsultation({...newConsultation, time: e.target.value})}
                  placeholder="Ex: 08:00 - 09:00"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº de Profissionais</label>
                <input
                  type="number"
                  min="1"
                  value={newConsultation.professionals}
                  onChange={(e) => setNewConsultation({...newConsultation, professionals: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pacientes por Horário</label>
                <input
                  type="number"
                  min="1"
                  value={newConsultation.patientsPerSlot}
                  onChange={(e) => setNewConsultation({...newConsultation, patientsPerSlot: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <button
              onClick={handleAddConsultation}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Adicionar Horário
            </button>
          </div>
          
          {/* Visualização dos horários de consulta */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Horários de Consulta Disponíveis</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissionais</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pacientes/Horário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultationSlots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{slot.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slot.professionals}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slot.patientsPerSlot}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => removeSlot(slot.id, 'consultation')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Conteúdo da aba de Exames */}
      {activeTab === 'exams' && (
        <div>
          {/* Formulário para adicionar horários de exame */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Definir Horários de Exame</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                <input
                  type="text"
                  value={newExam.time}
                  onChange={(e) => setNewExam({...newExam, time: e.target.value})}
                  placeholder="Ex: 08:00 - 09:00"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº de Salas</label>
                <input
                  type="number"
                  min="1"
                  value={newExam.rooms}
                  onChange={(e) => setNewExam({...newExam, rooms: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pacientes por Horário</label>
                <input
                  type="number"
                  min="1"
                  value={newExam.patientsPerSlot}
                  onChange={(e) => setNewExam({...newExam, patientsPerSlot: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <button
              onClick={handleAddExam}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Adicionar Horário
            </button>
          </div>
          
          {/* Visualização dos horários de exame */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Horários de Exame Disponíveis</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pacientes/Horário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examSlots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{slot.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slot.rooms}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slot.patientsPerSlot}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => removeSlot(slot.id, 'exam')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consult;