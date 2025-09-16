import React, { useState } from "react";

interface Specialty {
  id: number;
  name: string;
  status: "active" | "maintenance" | "new";
  createdAt: Date;
}

const Financas: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([
    { id: 1, name: "Cardiologia", status: "active", createdAt: new Date(2023, 5, 15) },
    { id: 2, name: "Ortopedia", status: "active", createdAt: new Date(2023, 8, 20) },
    { id: 3, name: "Pediatria", status: "maintenance", createdAt: new Date(2023, 2, 10) },
    { id: 4, name: "Neurologia", status: "active", createdAt: new Date(2024, 0, 5) },
    { id: 5, name: "Oftalmologia", status: "new", createdAt: new Date() },
    { id: 6, name: "Dermatologia", status: "new", createdAt: new Date() },
  ]);
  
  const [newSpecialtyName, setNewSpecialtyName] = useState("");

  // Calcular estatísticas
  const totalSpecialties = specialties.length;
  const activeSpecialties = specialties.filter(s => s.status === "active").length;
  const maintenanceSpecialties = specialties.filter(s => s.status === "maintenance").length;
  const newSpecialties = specialties.filter(s => s.status === "new").length;

  // Adicionar nova especialidade
  const handleAddSpecialty = () => {
    if (newSpecialtyName.trim() === "") return;
    
    const newSpecialty: Specialty = {
      id: specialties.length > 0 ? Math.max(...specialties.map(s => s.id)) + 1 : 1,
      name: newSpecialtyName,
      status: "new",
      createdAt: new Date()
    };
    
    setSpecialties([...specialties, newSpecialty]);
    setNewSpecialtyName("");
  };

  // Alterar status da especialidade
  const changeSpecialtyStatus = (id: number, status: "active" | "maintenance" | "new") => {
    setSpecialties(specialties.map(specialty => 
      specialty.id === id ? { ...specialty, status } : specialty
    ));
  };

  // Excluir especialidade
  const deleteSpecialty = (id: number) => {
    setSpecialties(specialties.filter(specialty => specialty.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Gerenciamento de Especialidades Hospitalares</h1>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total de Especialidades</h3>
          <p className="text-3xl font-bold text-blue-600">{totalSpecialties}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Em Funcionamento</h3>
          <p className="text-3xl font-bold text-green-600">{activeSpecialties}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Em Manutenção</h3>
          <p className="text-3xl font-bold text-yellow-600">{maintenanceSpecialties}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Novas Especialidades</h3>
          <p className="text-3xl font-bold text-purple-600">{newSpecialties}</p>
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
          />
          <button
            onClick={handleAddSpecialty}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>
      
      {/* Lista de especialidades */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Lista de Especialidades</h2>
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
                    {specialty.createdAt.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => changeSpecialtyStatus(specialty.id, "active")}
                        className="text-green-600 hover:text-green-900"
                      >
                        Ativar
                      </button>
                      <button
                        onClick={() => changeSpecialtyStatus(specialty.id, "maintenance")}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Manutenção
                      </button>
                      <button
                        onClick={() => deleteSpecialty(specialty.id)}
                        className="text-red-600 hover:text-red-900"
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
      </div>
    </div>
  );
};

export default Financas;