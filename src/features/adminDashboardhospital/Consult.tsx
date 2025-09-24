import React, { useState, useEffect } from "react";

const apiHost = "https://moyo-backend.vercel.app";

interface HorarioConsulta {
  id: number;
  horario: string;
}

const Consult: React.FC = () => {
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [hospitalNomeExibido, setHospitalNomeExibido] = useState("");
  const [horarios, setHorarios] = useState<HorarioConsulta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [novoHorario, setNovoHorario] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Buscar hospital pelo nome
  const buscarHospitalPorNome = async () => {
    setError("");
    setMensagem("");
    setLoading(true);
    setHospitalId("");
    setHorarios([]);
    setHospitalNomeExibido("");
    try {
      const res = await fetch(`${apiHost}/hospitais`);
      if (!res.ok) throw new Error("Erro ao buscar hospitais");
      const hospitais = await res.json();
      const hospital = hospitais.find((h: any) =>
        h.nome && h.nome.toLowerCase().includes(hospitalName.trim().toLowerCase())
      );
      if (!hospital) throw new Error("Hospital não encontrado");
      setHospitalId(hospital.id.toString());
      setHospitalNomeExibido(hospital.nome);
      // Carregar horários
      const arr = Array.isArray(hospital.horarios_atendimento_consultas)
        ? hospital.horarios_atendimento_consultas
        : [];
      setHorarios(arr.map((h: any, idx: number) =>
        typeof h === "string"
          ? { id: idx + 1, horario: h }
          : { id: h.id ?? idx + 1, horario: h.horario ?? String(h) }
      ));
    } catch (err: any) {
      setError(err.message || "Erro ao buscar hospital");
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo horário
  const handleAddHorario = async () => {
    setMensagem("");
    setError("");
    if (!novoHorario.trim()) {
      setMensagem("Preencha o horário");
      return;
    }
    if (!hospitalId) {
      setError("Busque e selecione um hospital primeiro");
      return;
    }
    setLoading(true);
    try {
      // Busca hospital atual
      const res = await fetch(`${apiHost}/hospitais/${hospitalId}`);
      if (!res.ok) throw new Error("Hospital não encontrado");
      const hospital = await res.json();
      const arr = Array.isArray(hospital.horarios_atendimento_consultas)
        ? hospital.horarios_atendimento_consultas
        : [];
      // Adiciona novo horário
      const novosHorarios = [...arr, { id: Date.now(), horario: novoHorario }];
      // Atualiza hospital
      const patchRes = await fetch(`${apiHost}/hospitais/${hospitalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ horarios_atendimento_consultas: novosHorarios }),
      });
      if (!patchRes.ok) throw new Error("Erro ao salvar horário");
      setHorarios(novosHorarios);
      setNovoHorario("");
      setShowAddForm(false);
      setMensagem("Horário adicionado com sucesso!");
    } catch (err: any) {
      
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Remover horário
  const handleRemoveHorario = async (id: number) => {
    setMensagem("");
    setError("");
    setLoading(true);
    try {
      const novosHorarios = horarios.filter(h => h.id !== id);
      const patchRes = await fetch(`${apiHost}/hospitais/${hospitalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ horarios_atendimento_consultas: novosHorarios }),
      });
      if (!patchRes.ok) throw new Error("Erro ao remover horário");
      setHorarios(novosHorarios);
      setMensagem("Horário removido com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Busca
  const horariosFiltrados = horarios.filter(h =>
    h.horario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Gerenciamento de Horários de Consulta</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Nome do Hospital"
          value={hospitalName}
          onChange={e => setHospitalName(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={buscarHospitalPorNome}
          disabled={!hospitalName.trim()}
        >
          Buscar
        </button>
        <input
          type="text"
          placeholder="Buscar horário..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64"
          disabled={!hospitalId}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => setShowAddForm(true)}
          disabled={!hospitalId}
        >
          Adicionar Horário
        </button>
      </div>

      {hospitalNomeExibido && (
        <div className="mb-2 text-center text-blue-800 font-semibold">Hospital selecionado: {hospitalNomeExibido}</div>
      )}

      {loading && (
        <div className="text-center py-8 text-blue-600 font-semibold">Carregando horários...</div>
      )}
      {error && (
        <div className="text-center py-4 text-red-500 font-semibold">{error}</div>
      )}
      {mensagem && (
        <div className="text-center py-4 text-green-600 font-semibold">{mensagem}</div>
      )}

      {/* Modal de adicionar */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Adicionar Novo Horário</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Horário</label>
                <input
                  type="text"
                  value={novoHorario}
                  onChange={e => setNovoHorario(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Ex: 08:00 - 09:00"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleAddHorario}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-4 mt-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Horários de Consulta</h2>
        {horariosFiltrados.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum horário cadastrado</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {horariosFiltrados.map(horario => (
              <div key={horario.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <span className="font-medium">{horario.horario}</span>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                  onClick={() => handleRemoveHorario(horario.id)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Consult;