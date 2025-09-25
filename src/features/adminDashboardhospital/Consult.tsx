import React, { useState, useEffect } from "react";

interface TimeSlot {
  id: number;
  time_slot: string;
  professionals?: number;
  rooms?: number;
  patients_per_slot: number;
  type: "consultation" | "exam";
}

const Consult: React.FC = () => {
  const user = localStorage.getItem("moyo-user");
  const hospitalId =
    (user && JSON.parse(user).hospital_id) ||
    localStorage.getItem("moyo-hospital-id") ||
    3;

  const [consultationSlots, setConsultationSlots] = useState<TimeSlot[]>([]);
  const [examSlots, setExamSlots] = useState<TimeSlot[]>([]);
  const [newConsultation, setNewConsultation] = useState({
    time_slot: "",
    professionals: 1,
    patients_per_slot: 1,
    weekday: "Segunda",
  });
  const [newExam, setNewExam] = useState({
    time_slot: "",
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
    if (!newConsultation.time_slot) return;
    try {
      const res = await fetch(`https://moyo-backend.vercel.app/hospitais/${hospitalId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "consultation",
          time_slot: newConsultation.time_slot,
          professionals: newConsultation.professionals,
          patients_per_slot: newConsultation.patients_per_slot,
          weekday: newConsultation.weekday,
        }),
      });
      const data = await res.json();
      setConsultationSlots((prev) => [...prev, data]);
      setNewConsultation({ time_slot: "", professionals: 1, patients_per_slot: 1, weekday: "Segunda" });
    } catch (err) {
      console.error("Erro ao adicionar consulta:", err);
    }
  };

  // 🔹 Adicionar horário de exame
  const handleAddExam = async () => {
    if (!newExam.time_slot) return;
    try {
      const res = await fetch(`https://moyo-backend.vercel.app/hospitais/${hospitalId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "exam",
          time_slot: newExam.time_slot,
          rooms: newExam.rooms,
          patients_per_slot: newExam.patients_per_slot,
          weekday: newExam.weekday,
        }),
      });
      const data = await res.json();
      setExamSlots((prev) => [...prev, data]);
      setNewExam({ time_slot: "", rooms: 1, patients_per_slot: 1, weekday: "Segunda" });
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
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Definir Horários de Consulta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <select
                value={newConsultation.time_slot}
                onChange={e => setNewConsultation({ ...newConsultation, time_slot: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Selecione o horário</option>
                <option value="08:00 - 09:00">08:00 - 09:00</option>
                <option value="09:00 - 10:00">09:00 - 10:00</option>
                <option value="10:00 - 11:00">10:00 - 11:00</option>
                <option value="11:00 - 12:00">11:00 - 12:00</option>
                <option value="12:00 - 13:00">12:00 - 13:00</option>
                <option value="13:00 - 14:00">13:00 - 14:00</option>
                <option value="14:00 - 15:00">14:00 - 15:00</option>
                <option value="15:00 - 16:00">15:00 - 16:00</option>
                <option value="16:00 - 17:00">16:00 - 17:00</option>
                <option value="17:00 - 18:00">17:00 - 18:00</option>
              </select>
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
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Definir Horários de Exame
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <select
                value={newExam.time_slot}
                onChange={e => setNewExam({ ...newExam, time_slot: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Selecione o horário</option>
                <option value="08:00 - 09:00">08:00 - 09:00</option>
                <option value="09:00 - 10:00">09:00 - 10:00</option>
                <option value="10:00 - 11:00">10:00 - 11:00</option>
                <option value="11:00 - 12:00">11:00 - 12:00</option>
                <option value="12:00 - 13:00">12:00 - 13:00</option>
                <option value="13:00 - 14:00">13:00 - 14:00</option>
                <option value="14:00 - 15:00">14:00 - 15:00</option>
                <option value="15:00 - 16:00">15:00 - 16:00</option>
                <option value="16:00 - 17:00">16:00 - 17:00</option>
                <option value="17:00 - 18:00">17:00 - 18:00</option>
              </select>
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
