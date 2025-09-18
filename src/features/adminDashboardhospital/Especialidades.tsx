import React, { useState } from "react";

interface Especialidade {
  id: number;
  nome: string;
  descricao: string;
}

const Especialidades: React.FC = () => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([
    { id: 1, nome: "Cardiologia", descricao: "Especialidade médica que trata doenças do coração." },
    { id: 2, nome: "Pediatria", descricao: "Especialidade médica que cuida da saúde de crianças." },
    { id: 3, nome: "Dermatologia", descricao: "Especialidade médica que trata doenças da pele." },
  ]);

  const [novaEspecialidade, setNovaEspecialidade] = useState({ nome: "", descricao: "" });

  const handleAddEspecialidade = () => {
    if (novaEspecialidade.nome && novaEspecialidade.descricao) {
      const nova = {
        id: especialidades.length + 1,
        nome: novaEspecialidade.nome,
        descricao: novaEspecialidade.descricao,
      };
      setEspecialidades([...especialidades, nova]);
      setNovaEspecialidade({ nome: "", descricao: "" });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Especialidades</h1>

      {/* Adicionar Especialidade */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Adicionar Nova Especialidade</h2>
        <input
          type="text"
          placeholder="Nome da Especialidade"
          value={novaEspecialidade.nome}
          onChange={(e) => setNovaEspecialidade({ ...novaEspecialidade, nome: e.target.value })}
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          placeholder="Descrição da Especialidade"
          value={novaEspecialidade.descricao}
          onChange={(e) => setNovaEspecialidade({ ...novaEspecialidade, descricao: e.target.value })}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleAddEspecialidade}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Adicionar Especialidade
        </button>
      </div>

      {/* Listar Especialidades */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Lista de Especialidades</h2>
        <ul>
          {especialidades.map((especialidade) => (
            <li key={especialidade.id} className="border p-4 rounded mb-2">
              <h3 className="text-xl font-bold">{especialidade.nome}</h3>
              <p>{especialidade.descricao}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Especialidades;