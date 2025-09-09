import React, { useEffect, useState } from "react";

interface Paciente {
  id: number;
  nome: string;
}
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Consulta {
  id: number;
  paciente_id: number;
  profissional_id: number;
  data_hora: string;
  status: string;
  prioridade?: string;
  local?: string;
}

const data = [
  { name: "Jan", pacientes: 400, urgencias: 24 },
  { name: "Fev", pacientes: 300, urgencias: 13 },
  { name: "Mar", pacientes: 250, urgencias: 16 },
  { name: "Abr", pacientes: 278, urgencias: 22 },
  { name: "Mai", pacientes: 189, urgencias: 18 },
  { name: "Jun", pacientes: 239, urgencias: 20 },
];

export default function Dashboard() {
  const [profissional, setProfissional] = useState<any>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("moyo-user");
    if (!user) {
      setErro("Usuário não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }
    const profissionalData = JSON.parse(user);
    setProfissional(profissionalData);
    // Buscar consultas do profissional
    fetch(`http://localhost:4000/profissionais/${profissionalData.id}/consultas`)
      .then(async (res) => {
        if (!res.ok) return setConsultas([]);
        const data = await res.json();
        setConsultas(data);
      })
      .catch(() => setConsultas([]))
      .finally(() => setLoading(false));
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);
  const consultasHoje = consultas.filter(c => c.data_hora && c.data_hora.startsWith(hoje));
  const pendentes = consultas.filter(c => c.status === "agendada");

  // Busca por nome do paciente
  const consultasFiltradas = busca.trim()
    ? consultasHoje.filter(c => {
        const nome = typeof c.paciente_id === "string" ? c.paciente_id : String(c.paciente_id);
        return nome.toLowerCase().includes(busca.toLowerCase());
      })
    : consultasHoje;

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (erro) return <div className="p-8 text-center text-red-500">{erro}</div>;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-moyo-primary mb-2">Dashboard Profissional</h1>
      <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-moyo-primary flex flex-col mb-4">
        <div className="flex items-center mb-2">
          {profissional?.foto_perfil ? (
            <img src={profissional.foto_perfil} alt="Foto de perfil" className="w-16 h-16 rounded-full object-cover mr-3 border-2 border-moyo-primary" />
          ) : (
            <i className="fas fa-user-md text-moyo-primary text-2xl mr-3"></i>
          )}
          <h2 className="text-lg font-bold text-moyo-dark">Dados do Profissional</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span className="font-semibold">Nome:</span> {profissional?.nome}</div>
          <div><span className="font-semibold">Especialidade:</span> {profissional?.especialidade}</div>
          <div><span className="font-semibold">Cargo:</span> {profissional?.cargo}</div>
          <div><span className="font-semibold">BI:</span> {profissional?.bi}</div>
          <div><span className="font-semibold">Sexo:</span> {profissional?.sexo}</div>
          <div><span className="font-semibold">Email:</span> {profissional?.email}</div>
          <div><span className="font-semibold">Telefone:</span> {profissional?.telefone}</div>
          <div><span className="font-semibold">Unidade:</span> {profissional?.unidade}</div>
          <div><span className="font-semibold">Município:</span> {profissional?.municipio}</div>
          <div><span className="font-semibold">Conselho:</span> {profissional?.conselho}</div>
          <div><span className="font-semibold">Registro Profissional:</span> {profissional?.registro_profissional}</div>
        </div>
      </div>
      {/* Consultas do Profissional */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-moyo-primary">Consultas Agendadas de Hoje</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="border rounded-lg px-3 py-2 w-full max-w-xs"
            placeholder="Buscar por nome do paciente"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-moyo-primary text-white">
                <th className="px-4 py-2">Horário</th>
                <th className="px-4 py-2">Paciente</th>
                <th className="px-4 py-2">Prioridade</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Local</th>
              </tr>
            </thead>
            <tbody>
              {consultasFiltradas.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-moyo-gray">Nenhuma consulta encontrada.</td></tr>
              ) : (
                consultasFiltradas.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{c.data_hora?.slice(11, 16)}</td>
                    <td className="px-4 py-2">{typeof c.paciente_id === "string" ? c.paciente_id : String(c.paciente_id)}</td>
                    <td className="px-4 py-2">{c.prioridade || '-'}</td>
                    <td className="px-4 py-2">{c.status}</td>
                    <td className="px-4 py-2">{c.local || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
