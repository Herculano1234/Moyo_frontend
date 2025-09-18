import apiHost from '../../config/apiHost';
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
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function fetchConsultas() {
      setLoading(true);
      setErro("");
      try {
  const resp = await fetch(`${apiHost}/consultas`);
        const data = await resp.json();
        setConsultas(data);
      } catch (e) {
        setErro("Erro ao buscar consultas");
      } finally {
        setLoading(false);
      }
    }
    async function fetchPacientes() {
      try {
  const resp = await fetch(`${apiHost}/pacientes`);
        const data = await resp.json();
        setPacientes(data);
      } catch {}
    }
    fetchConsultas();
    fetchPacientes();
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);
  const consultasHoje = consultas.filter(c => c.data_hora && c.data_hora.startsWith(hoje));
  const pendentes = consultas.filter(c => c.status === "agendada");

  // Busca por nome do paciente
  const consultasHojeComNome = consultasHoje.map(c => ({
    ...c,
    paciente_nome: pacientes.find(p => p.id === c.paciente_id)?.nome || c.paciente_id
  }));
  const consultasFiltradas = busca.trim()
    ? consultasHojeComNome.filter(c =>
        typeof c.paciente_nome === "string" && c.paciente_nome.toLowerCase().includes(busca.toLowerCase())
      )
    : consultasHojeComNome;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-moyo-primary mb-2">Dashboard Profissional</h1>
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-3xl text-moyo-primary font-bold">{consultas.length}</span>
          <span className="text-moyo-gray mt-2">Consultas Totais</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-3xl text-moyo-accent font-bold">{consultasHoje.length}</span>
          <span className="text-moyo-gray mt-2">Consultas Hoje</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-3xl text-yellow-500 font-bold">{pendentes.length}</span>
          <span className="text-moyo-gray mt-2">Pendentes</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-3xl text-green-600 font-bold">-</span>
          <span className="text-moyo-gray mt-2">Fila de Espera</span>
        </div>
      </div>
      {/* Gráfico de atendimentos mensais */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Atendimentos Mensais</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="pacientes" stroke="#6366F1" strokeWidth={2} />
            <Line type="monotone" dataKey="urgencias" stroke="#F472B6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Lista de próximas consultas */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-moyo-primary">Próximas Consultas de Hoje</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="border rounded-lg px-3 py-2 w-full max-w-xs"
            placeholder="Buscar por nome do paciente"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        {loading && <div className="text-moyo-primary">Carregando...</div>}
        {erro && <div className="text-red-500">{erro}</div>}
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
                    <td className="px-4 py-2">{c.paciente_nome}</td>
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
