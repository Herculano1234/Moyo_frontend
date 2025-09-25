// Função para converter string "HH:MM" em minutos
function timeToMinutes(time: string) {
  const [h, m] = time.split(":");
  return parseInt(h) * 60 + parseInt(m);
}

// Função para verificar sobreposição de intervalos
function isOverlap(startA: string, endA: string, startB: string, endB: string) {
  const a1 = timeToMinutes(startA);
  const a2 = timeToMinutes(endA);
  const b1 = timeToMinutes(startB);
  const b2 = timeToMinutes(endB);
  return a1 < b2 && b1 < a2;
}

import React, { useState, useEffect } from "react";

interface TimeSlot {
  id: number;
  time_slot: string;
  professionals?: number;
  rooms?: number;
  patients_per_slot: number;
  type: "consultation" | "exam";
  weekday?: string;
}

const Consult: React.FC = () => {
  const user = localStorage.getItem("moyo-user");
  const hospitalId =
    (user && JSON.parse(user).hospital_id) ||
    localStorage.getItem("moyo-hospital-id") ||
    3;

  const [consultationSlots, setConsultationSlots] = useState<TimeSlot[]>([]);
  const [examSlots, setExamSlots] = useState<TimeSlot[]>([]);
  const [errorConsult, setErrorConsult] = useState("");
  const [errorExam, setErrorExam] = useState("");
  const [newConsultation, setNewConsultation] = useState({
    startHour: "08",
    startMinute: "00",
    endHour: "09",
    endMinute: "00",
    professionals: 1,
    patients_per_slot: 1,
    weekday: "Segunda",
  });
  const [newExam, setNewExam] = useState({
    startHour: "08",
    startMinute: "00",
    endHour: "09",
    endMinute: "00",
    rooms: 1,
    patients_per_slot: 1,
    weekday: "Segunda",
  });
  const [activeTab, setActiveTab] = useState<"consultations" | "exams">("consultations");
  const [loading, setLoading] = useState(false);

  // 🔹 Carregar horários do backend
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const resConsult = await fetch(
          `https://moyo-backend.vercel.app/hospitais/${hospitalId}/schedules?type=consultation`
        );
        const dataConsult = await resConsult.json();
        setConsultationSlots(Array.isArray(dataConsult) ? dataConsult : []);

        const resExam = await fetch(
          `https://moyo-backend.vercel.app/hospitais/${hospitalId}/schedules?type=exam`
        );
        const dataExam = await resExam.json();
        setExamSlots(Array.isArray(dataExam) ? dataExam : []);
      } catch (err) {
        console.error("Erro ao buscar horários:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [hospitalId]);

  // 🔹 Adicionar horário de consulta
  const handleAddConsultation = async () => {
    setErrorConsult("");
    const time_slot = `${newConsultation.startHour}:${newConsultation.startMinute} - ${newConsultation.endHour}:${newConsultation.endMinute}`;
    
    // Verifica se horário é válido
    const startMinutes = timeToMinutes(`${newConsultation.startHour}:${newConsultation.startMinute}`);
    const endMinutes = timeToMinutes(`${newConsultation.endHour}:${newConsultation.endMinute}`);
    if (endMinutes <= startMinutes) {
      setErrorConsult("O horário final deve ser maior que o inicial.");
      return;
    }
    
    // Verifica se já existe horário para o mesmo dia e horário
    const exists = consultationSlots.some(
      slot => slot.time_slot === time_slot && slot.weekday === newConsultation.weekday
    );
    if (exists) {
      setErrorConsult("Já existe um horário cadastrado para esse dia e horário.");
      return;
    }
    
    // Verifica sobreposição de horários para o mesmo dia
    const [newStart, newEnd] = time_slot.split(" - ");
    const overlap = consultationSlots.some(slot => {
      if (slot.weekday !== newConsultation.weekday) return false;
      if (!slot.time_slot) return false;
      const [slotStart, slotEnd] = slot.time_slot.split(" - ");
      return isOverlap(newStart, newEnd, slotStart, slotEnd);
    });
    if (overlap) {
      setErrorConsult("Dois horários não podem estar no mesmo tempo. Sobreposição detectada.");
      return;
    }
    
    try {
      const res = await fetch(`https://moyo-backend.vercel.app/hospitais/${hospitalId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "consultation",
          time_slot,
          professionals: newConsultation.professionals,
          patients_per_slot: newConsultation.patients_per_slot,
          weekday: newConsultation.weekday,
        }),
      });
      const data = await res.json();
      setConsultationSlots((prev) => [...prev, { ...data, weekday: newConsultation.weekday }]);
      setNewConsultation({
        startHour: "08",
        startMinute: "00",
        endHour: "09",
        endMinute: "00",
        professionals: 1,
        patients_per_slot: 1,
        weekday: "Segunda"
      });
    } catch (err) {
      console.error("Erro ao adicionar consulta:", err);
      setErrorConsult("Erro ao adicionar horário. Tente novamente.");
    }
  };

  // 🔹 Adicionar horário de exame
  const handleAddExam = async () => {
    setErrorExam("");
    const time_slot = `${newExam.startHour}:${newExam.startMinute} - ${newExam.endHour}:${newExam.endMinute}`;
    
    // Verifica se horário é válido
    const startMinutes = timeToMinutes(`${newExam.startHour}:${newExam.startMinute}`);
    const endMinutes = timeToMinutes(`${newExam.endHour}:${newExam.endMinute}`);
    if (endMinutes <= startMinutes) {
      setErrorExam("O horário final deve ser maior que o inicial.");
      return;
    }
    
    // Verifica se já existe horário para o mesmo dia e horário
    const exists = examSlots.some(
      slot => slot.time_slot === time_slot && slot.weekday === newExam.weekday
    );
    if (exists) {
      setErrorExam("Já existe um horário cadastrado para esse dia e horário.");
      return;
    }
    
    // Verifica sobreposição de horários para o mesmo dia
    const [newStart, newEnd] = time_slot.split(" - ");
    const overlap = examSlots.some(slot => {
      if (slot.weekday !== newExam.weekday) return false;
      if (!slot.time_slot) return false;
      const [slotStart, slotEnd] = slot.time_slot.split(" - ");
      return isOverlap(newStart, newEnd, slotStart, slotEnd);
    });
    if (overlap) {
      setErrorExam("Dois horários não podem estar no mesmo tempo. Sobreposição detectada.");
      return;
    }
    
    try {
      const res = await fetch(`https://moyo-backend.vercel.app/hospitais/${hospitalId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "exam",
          time_slot,
          rooms: newExam.rooms,
          patients_per_slot: newExam.patients_per_slot,
          weekday: newExam.weekday,
        }),
      });
      const data = await res.json();
      setExamSlots((prev) => [...prev, { ...data, weekday: newExam.weekday }]);
      setNewExam({
        startHour: "08",
        startMinute: "00",
        endHour: "09",
        endMinute: "00",
        rooms: 1,
        patients_per_slot: 1,
        weekday: "Segunda"
      });
    } catch (err) {
      console.error("Erro ao adicionar exame:", err);
      setErrorExam("Erro ao adicionar horário. Tente novamente.");
    }
  };

  // 🔹 Remover horário
  const removeSlot = async (id: number, type: "consultation" | "exam") => {
    if (!window.confirm("Tem certeza que deseja remover este horário?")) return;
    
    try {
      await fetch(`https://moyo-backend.vercel.app/hospitais/schedules/${id}`, {
        method: "DELETE",
      });
      if (type === "consultation") {
        setConsultationSlots((prev) => prev.filter((slot) => slot.id !== id));
      } else {
        setExamSlots((prev) => prev.filter((slot) => slot.id !== id));
      }
    } catch (err) {
      console.error("Erro ao remover horário:", err);
      alert("Erro ao remover horário. Tente novamente.");
    }
  };

  // Dias da semana
  const weekdays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  return (
  <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              className={`flex-1 py-4 font-medium text-lg transition-all duration-200 ${
                activeTab === "consultations"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("consultations")}
            >
              Consultas
            </button>
            <button
              className={`flex-1 py-4 font-medium text-lg transition-all duration-200 ${
                activeTab === "exams"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("exams")}
            >
              Exames
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Consultas */}
          {!loading && activeTab === "consultations" && (
            <div className="p-6">
              {/* Formulário de Adição */}
              <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
                <h2 className="text-xl font-semibold mb-4 text-blue-800">
                  Adicionar Novo Horário de Consulta
                </h2>
                
                {errorConsult && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                    {errorConsult}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Dia da Semana */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
                    <select
                      value={newConsultation.weekday}
                      onChange={e => setNewConsultation({ ...newConsultation, weekday: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      {weekdays.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  {/* Horário Inicial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário Inicial</label>
                    <div className="flex gap-1">
                      <select 
                        value={newConsultation.startHour} 
                        onChange={e => setNewConsultation({ ...newConsultation, startHour: e.target.value })} 
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {[...Array(24)].map((_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}h
                          </option>
                        ))}
                      </select>
                      <select 
                        value={newConsultation.startMinute} 
                        onChange={e => setNewConsultation({ ...newConsultation, startMinute: e.target.value })} 
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {["00", "15", "30", "45"].map(m => (
                          <option key={m} value={m}>{m}m</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Horário Final */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário Final</label>
                    <div className="flex gap-1">
                      <select 
                        value={newConsultation.endHour} 
                        onChange={e => setNewConsultation({ ...newConsultation, endHour: e.target.value })} 
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {[...Array(24)].map((_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}h
                          </option>
                        ))}
                      </select>
                      <select 
                        value={newConsultation.endMinute} 
                        onChange={e => setNewConsultation({ ...newConsultation, endMinute: e.target.value })} 
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {["00", "15", "30", "45"].map(m => (
                          <option key={m} value={m}>{m}m</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Profissionais e Pacientes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profissionais</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newConsultation.professionals}
                        onChange={(e) => setNewConsultation({ ...newConsultation, professionals: parseInt(e.target.value) || 1 })}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pacientes/Horário</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={newConsultation.patients_per_slot}
                        onChange={(e) => setNewConsultation({ ...newConsultation, patients_per_slot: parseInt(e.target.value) || 1 })}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddConsultation}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium w-full md:w-auto"
                >
                  Adicionar Horário
                </button>
              </div>

              {/* Lista de Horários */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Horários de Consulta Cadastrados
                  </h2>
                </div>
                
                {consultationSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum horário de consulta cadastrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Dia</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Horário</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Profissionais</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Pacientes</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {consultationSlots.map((slot) => (
                          <tr key={slot.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                {slot.weekday || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-mono text-sm">
                              {slot.time_slot?.replace(' - ', ' às ')}
                            </td>
                            <td className="px-4 py-2">{slot.professionals}</td>
                            <td className="px-4 py-2">{slot.patients_per_slot}</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => removeSlot(slot.id, "consultation")}
                                className="text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded hover:bg-red-50 text-sm"
                              >
                                Remover
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exames */}
          {!loading && activeTab === "exams" && (
            <div className="p-6">
              {/* Formulário de Adição */}
              <div className="bg-green-50 rounded-xl p-6 mb-8 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-800">
                  Adicionar Novo Horário de Exame
                </h2>
                
                {errorExam && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                    {errorExam}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Dia da Semana */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
                    <select
                      value={newExam.weekday}
                      onChange={e => setNewExam({ ...newExam, weekday: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    >
                      {weekdays.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  {/* Horário Inicial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário Inicial</label>
                    <div className="flex gap-1">
                      <select 
                        value={newExam.startHour} 
                        onChange={e => setNewExam({ ...newExam, startHour: e.target.value })} 
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      >
                        {[...Array(24)].map((_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}h
                          </option>
                        ))}
                      </select>
                      <select 
                        value={newExam.startMinute} 
                        onChange={e => setNewExam({ ...newExam, startMinute: e.target.value })} 
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      >
                        {["00", "15", "30", "45"].map(m => (
                          <option key={m} value={m}>{m}m</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Horário Final */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário Final</label>
                    <div className="flex gap-1">
                      <select 
                        value={newExam.endHour} 
                        onChange={e => setNewExam({ ...newExam, endHour: e.target.value })} 
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      >
                        {[...Array(24)].map((_, i) => (
                          <option key={i} value={i.toString().padStart(2, "0")}>
                            {i.toString().padStart(2, "0")}h
                          </option>
                        ))}
                      </select>
                      <select 
                        value={newExam.endMinute} 
                        onChange={e => setNewExam({ ...newExam, endMinute: e.target.value })} 
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      >
                        {["00", "15", "30", "45"].map(m => (
                          <option key={m} value={m}>{m}m</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Salas e Pacientes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salas</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newExam.rooms}
                        onChange={(e) => setNewExam({ ...newExam, rooms: parseInt(e.target.value) || 1 })}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pacientes/Horário</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={newExam.patients_per_slot}
                        onChange={(e) => setNewExam({ ...newExam, patients_per_slot: parseInt(e.target.value) || 1 })}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddExam}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors font-medium w-full md:w-auto"
                >
                  Adicionar Horário
                </button>
              </div>

              {/* Lista de Horários */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Horários de Exame Cadastrados
                  </h2>
                </div>
                
                {examSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum horário de exame cadastrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Dia</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Horário</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Salas</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Pacientes</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {examSlots.map((slot) => (
                          <tr key={slot.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                {slot.weekday || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-mono text-sm">
                              {slot.time_slot?.replace(' - ', ' às ')}
                            </td>
                            <td className="px-4 py-2">{slot.rooms}</td>
                            <td className="px-4 py-2">{slot.patients_per_slot}</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => removeSlot(slot.id, "exam")}
                                className="text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded hover:bg-red-50 text-sm"
                              >
                                Remover
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Consult;