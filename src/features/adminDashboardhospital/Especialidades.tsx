import React, { useState, useEffect } from "react";

interface Specialty {
  id: number;
  name: string;
  status: "active" | "maintenance" | "new";
  createdAt: string;
  unidade?: string;
}

const Especialidades: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [newSpecialtyName, setNewSpecialtyName] = useState("");
  const [loading, setLoading] = useState(false);
  const unidadeHospital = localStorage.getItem("hospital") || "";

  const handleAddSpecialty = async () => {
    if (newSpecialtyName.trim() === "") return;
    setLoading(true);
    try {
      const response = await fetch("https://moyo-backend.vercel.app/especialidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSpecialtyName,
          status: "new",
          unidade: unidadeHospital
        })
      });
      if (!response.ok) throw new Error("Erro ao cadastrar especialidade");
      const nova = await response.json();
      setSpecialties([...specialties, nova]);
      setNewSpecialtyName("");
    } catch (err) {
      alert("Erro ao cadastrar especialidade");
    } finally {
      setLoading(false);
    }
  };

  const changeSpecialtyStatus = async (id: number, status: "active" | "maintenance" | "new") => {
    setLoading(true);
    try {
      const response = await fetch(`https://moyo-backend.vercel.app/especialidades/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Erro ao atualizar status");
      const updated = await response.json();
      setSpecialties(specialties.map(specialty => specialty.id === id ? { ...specialty, status: updated.status } : specialty));
    } catch (err) {
      alert("Erro ao atualizar status da especialidade");
    } finally {
      setLoading(false);
    }
  };

  const deleteSpecialty = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://moyo-backend.vercel.app/especialidades/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Erro ao excluir especialidade");
      setSpecialties(specialties.filter(specialty => specialty.id !== id));
    } catch (err) {
      alert("Erro ao excluir especialidade");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!unidadeHospital) {
      setSpecialties([]);
      return;
    }
    const fetchEspecialidades = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://moyo-backend.vercel.app/especialidades?unidade=${encodeURIComponent(unidadeHospital)}`);
        if (!response.ok) throw new Error("Erro ao buscar especialidades");
        const data = await response.json();
        setSpecialties(data);
      } catch (err) {
        setSpecialties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEspecialidades();
  }, [unidadeHospital]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Gerenciamento de Especialidades Hospitalares</h1>
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total de Especialidades</h3>
          <p className="text-3xl font-bold text-blue-600">{specialties.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Em Funcionamento</h3>
          <p className="text-3xl font-bold text-green-600">{specialties.filter(s => s.status === "active").length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Em Manutenção</h3>
          <p className="text-3xl font-bold text-yellow-600">{specialties.filter(s => s.status === "maintenance").length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Novas Especialidades</h3>
          <p className="text-3xl font-bold text-purple-600">{specialties.filter(s => s.status === "new").length}</p>
        </div>
      </div>
      {/* Formulário para adicionar especialidade */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Adicionar Nova Especialidade</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSpecialtyName}
            onChange={(e) => setNewSpecialtyName(e.target.value)}
            placeholder="Nome da especialidade"
            className="flex-grow p-2 border border-gray-300 rounded"
            disabled={loading}
          />
          <button
            onClick={handleAddSpecialty}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </div>
      {/* Lista de especialidades */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Lista de Especialidades</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : specialties.length === 0 ? (
          <p>Nenhuma especialidade cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {specialties.map((specialty) => (
                  <tr key={specialty.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{specialty.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        specialty.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : specialty.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {specialty.status === 'active' 
                          ? 'Em Funcionamento' 
                          : specialty.status === 'maintenance'
                          ? 'Em Manutenção'
                          : 'Nova'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(specialty.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => changeSpecialtyStatus(specialty.id, "active")}
                          className="text-green-600 hover:text-green-900"
                          disabled={loading}
                        >
                          Ativar
                        </button>
                        <button
                          onClick={() => changeSpecialtyStatus(specialty.id, "maintenance")}
                          className="text-yellow-600 hover:text-yellow-900"
                          disabled={loading}
                        >
                          Manutenção
                        </button>
                        <button
                          onClick={() => deleteSpecialty(specialty.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Especialidades;