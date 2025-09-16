import React, { useEffect, useState } from "react";

interface Paciente {
  id: number;
  nome: string;
  email: string;
  data_nascimento?: string;
  sexo?: string;
  telefone?: string;
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function fetchPacientes() {
      setLoading(true);
      setErro("");
      try {
        const resp = await fetch("http://localhost:4000/pacientes");
        const data = await resp.json();
        setPacientes(data);
      } catch (e) {
        setErro("Erro ao buscar pacientes");
      } finally {
        setLoading(false);
      }
    }
    fetchPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-2 text-moyo-primary dark:text-moyo-primary">Pacientes</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border rounded-lg px-3 py-2 w-full max-w-xs"
          placeholder="Buscar por nome ou email"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>
      {loading && <div className="text-moyo-primary">Carregando...</div>}
      {erro && <div className="text-red-500">{erro}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-moyo-primary text-white">
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Nascimento</th>
              <th className="px-4 py-2">Sexo</th>
              <th className="px-4 py-2">Telefone</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-moyo-gray">Nenhum paciente encontrado.</td></tr>
            ) : (
              pacientesFiltrados.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold">{p.nome}</td>
                  <td className="px-4 py-2">{p.email}</td>
                  <td className="px-4 py-2">{p.data_nascimento || '-'}</td>
                  <td className="px-4 py-2">{p.sexo || '-'}</td>
                  <td className="px-4 py-2">{p.telefone || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
