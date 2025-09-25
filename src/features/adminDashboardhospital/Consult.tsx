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

  // 🔹 Carregar horários do backend
  useEffect(() => {
    const fetchSchedules = async () => {
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
      setConsultationSlots((prev) => [...prev, data]);
      setNewConsultation({ startHour: "08", startMinute: "00", endHour: "09", endMinute: "00", professionals: 1, patients_per_slot: 1, weekday: "Segunda" });
    } catch (err) {
      console.error("Erro ao adicionar consulta:", err);
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
      setExamSlots((prev) => [...prev, data]);
      setNewExam({ startHour: "08", startMinute: "00", endHour: "09", endMinute: "00", rooms: 1, patients_per_slot: 1, weekday: "Segunda" });
    } catch (err) {
      console.error("Erro ao adicionar exame:", err);
    }
  };

  // 🔹 Remover horário
  const removeSlot = async (id: number, type: "consultation" | "exam") => {
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
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">
        Gerenciamento de Consultas e Exames 
      </h1>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "consultations"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("consultations")}
        >
          Consultas
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "exams"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("exams")}
        >
          Exames
        </button>
      </div>

      {/* Consultas */}
      {activeTab === "consultations" && (
        <div>
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            {errorConsult && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{errorConsult}</div>
            )}
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Definir Horários de Consulta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <select
                value={newConsultation.weekday}
                onChange={e => setNewConsultation({ ...newConsultation, weekday: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Segunda">Segunda</option>
                <option value="Terça">Terça</option>
                <option value="Quarta">Quarta</option>
                <option value="Quinta">Quinta</option>
                <option value="Sexta">Sexta</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
              <div className="flex gap-1">
                <select value={newConsultation.startHour} onChange={e => setNewConsultation({ ...newConsultation, startHour: e.target.value })} className="p-2 border rounded">
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>{i.toString().padStart(2, "0")}</option>
                  ))}
                </select>
                :
                <select value={newConsultation.startMinute} onChange={e => setNewConsultation({ ...newConsultation, startMinute: e.target.value })} className="p-2 border rounded">
                  {["00", "15", "30", "45"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <span className="px-1">até</span>
                <select value={newConsultation.endHour} onChange={e => setNewConsultation({ ...newConsultation, endHour: e.target.value })} className="p-2 border rounded">
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>{i.toString().padStart(2, "0")}</option>
                  ))}
                </select>
                :
                <select value={newConsultation.endMinute} onChange={e => setNewConsultation({ ...newConsultation, endMinute: e.target.value })} className="p-2 border rounded">
                  {["00", "15", "30", "45"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                min="1"
                value={newConsultation.professionals}
                onChange={(e) =>
                  setNewConsultation({
                    ...newConsultation,
                    professionals: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                min="1"
                value={newConsultation.patients_per_slot}
                onChange={(e) =>
                  setNewConsultation({
                    ...newConsultation,
                    patients_per_slot: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <button
              onClick={handleAddConsultation}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Adicionar Horário
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Horários de Consulta Disponíveis
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Horário</th>
                  <th className="px-6 py-3">Profissionais</th>
                  <th className="px-6 py-3">Pacientes/Horário</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {consultationSlots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="px-6 py-4">{slot.time_slot}</td>
                    <td className="px-6 py-4">{slot.professionals}</td>
                    <td className="px-6 py-4">{slot.patients_per_slot}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => removeSlot(slot.id, "consultation")}
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
      )}

      {/* Exames */}
      {activeTab === "exams" && (
        <div>
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            {errorExam && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{errorExam}</div>
            )}
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Definir Horários de Exame
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <select
                value={newExam.weekday}
                onChange={e => setNewExam({ ...newExam, weekday: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Segunda">Segunda</option>
                <option value="Terça">Terça</option>
                <option value="Quarta">Quarta</option>
                <option value="Quinta">Quinta</option>
                <option value="Sexta">Sexta</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
              <div className="flex gap-1">
                <select value={newExam.startHour} onChange={e => setNewExam({ ...newExam, startHour: e.target.value })} className="p-2 border rounded">
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>{i.toString().padStart(2, "0")}</option>
                  ))}
                </select>
                :
                <select value={newExam.startMinute} onChange={e => setNewExam({ ...newExam, startMinute: e.target.value })} className="p-2 border rounded">
                  {["00", "15", "30", "45"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <span className="px-1">até</span>
                <select value={newExam.endHour} onChange={e => setNewExam({ ...newExam, endHour: e.target.value })} className="p-2 border rounded">
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>{i.toString().padStart(2, "0")}</option>
                  ))}
                </select>
                :
                <select value={newExam.endMinute} onChange={e => setNewExam({ ...newExam, endMinute: e.target.value })} className="p-2 border rounded">
                  {["00", "15", "30", "45"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                min="1"
                value={newExam.rooms}
                onChange={(e) =>
                  setNewExam({ ...newExam, rooms: parseInt(e.target.value) })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                min="1"
                value={newExam.patients_per_slot}
                onChange={(e) =>
                  setNewExam({
                    ...newExam,
                    patients_per_slot: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <button
              onClick={handleAddExam}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Adicionar Horário
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Horários de Exame Disponíveis
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Horário</th>
                  <th className="px-6 py-3">Salas</th>
                  <th className="px-6 py-3">Pacientes/Horário</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {examSlots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="px-6 py-4">{slot.time_slot}</td>
                    <td className="px-6 py-4">{slot.rooms}</td>
                    <td className="px-6 py-4">{slot.patients_per_slot}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => removeSlot(slot.id, "exam")}
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
      )}
    </div>
  );
};

export default Consult;
