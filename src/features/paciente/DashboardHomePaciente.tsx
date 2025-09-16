import React, { useEffect, useState } from "react";

// Interface alinhada ao backend
interface Consulta {
  id: number;
  paciente_id: number;
  profissional_id: number | null;
  data_hora: string;
  status: string;
  prioridade?: string | null;
  local?: string | null;
  created_at: string;
}

function diasParaConsulta(data_hora: string) {
  const hoje = new Date();
  const data = new Date(data_hora);
  const diff = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function DashboardHomePaciente() {
  const [paciente, setPaciente] = useState<any>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("moyo-user");
    if (!user) {
      setError("Usuário não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }
    const pacienteData = JSON.parse(user);
    setPaciente(pacienteData);
    // Buscar consultas do paciente
    fetch(`http://localhost:4000/pacientes/${pacienteData.id}/consultas`)
      .then(async (res) => {
        if (!res.ok) return setConsultas([]);
        const data = await res.json();
        setConsultas(data);
      })
      .catch(() => setConsultas([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Separar pendentes e histórico
  const pendentes = consultas.filter(c => c.status === 'pendente').sort((a, b) => a.data_hora.localeCompare(b.data_hora));
  const historico = consultas.filter(c => c.status !== 'pendente').sort((a, b) => b.data_hora.localeCompare(a.data_hora));
  const proxima = pendentes.length > 0 ? pendentes[0] : null;

  return (
    <div className="flex-1 w-full flex flex-col min-h-full p-4">
      <div className="mb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Próxima Consulta */}
          <div className="card bg-white rounded-2xl shadow p-6 border-l-4 border-moyo-primary flex flex-col">
            <div className="flex items-center mb-4"><i className="fas fa-calendar-alt text-moyo-primary text-2xl mr-3"></i><h2 className="text-lg font-bold text-moyo-dark">Próxima Consulta</h2></div>
            <div className="flex-1 flex flex-col justify-center items-center">
              {proxima ? (
                <>
                  <i className="fas fa-calendar-check text-4xl text-moyo-primary mb-2"></i>
                  <p className="text-moyo-dark mb-1">{new Date(proxima.data_hora).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-moyo-gray text-sm">Local: {proxima.local || 'Não informado'}</p>
                  <p className="text-moyo-gray text-sm">Prioridade: {proxima.prioridade || 'Não definida'}</p>
                  <p className="text-moyo-gray text-sm font-semibold mt-2">
                    {diasParaConsulta(proxima.data_hora) > 1 && `Faltam ${diasParaConsulta(proxima.data_hora)} dias`}
                    {diasParaConsulta(proxima.data_hora) === 1 && 'É amanhã!'}
                    {diasParaConsulta(proxima.data_hora) === 0 && 'É hoje!'}
                    {diasParaConsulta(proxima.data_hora) < 0 && 'Consulta atrasada'}
                  </p>
                </>
              ) : (
                <>
                  <i className="fas fa-calendar-times text-4xl text-moyo-gray mb-2 opacity-30"></i>
                  <p className="text-moyo-gray mb-1">Nenhuma consulta agendada</p>
                  <p className="text-moyo-gray text-sm">Agende uma nova consulta para começar</p>
                </>
              )}
            </div>
          </div>
          {/* Histórico de Consultas */}
          <div className="card bg-white rounded-2xl shadow p-6 border-l-4 border-moyo-accent flex flex-col">
            <div className="flex items-center mb-4"><i className="fas fa-history text-moyo-accent text-2xl mr-3"></i><h2 className="text-lg font-bold text-moyo-dark">Histórico de Consultas</h2></div>
            <div className="flex-1 flex flex-col justify-center items-center">
              {historico.length > 0 ? (
                <ul className="w-full">
                  {historico.map((c, idx) => (
                    <li key={c.id} className="mb-2 text-moyo-gray text-sm">
                      {new Date(c.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} - {c.status.charAt(0).toUpperCase() + c.status.slice(1)} - {c.local || 'Local não informado'}
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <i className="fas fa-clock text-4xl text-moyo-gray mb-2 opacity-30"></i>
                  <p className="text-moyo-gray mb-1">Nenhum histórico disponível</p>
                  <p className="text-moyo-gray text-sm">Seu histórico de consultas estará disponível aqui</p>
                </>
              )}
            </div>
          </div>
          {/* Lembretes e Alertas */}
          <div className="card bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-400 flex flex-col">
            <div className="flex items-center mb-4"><i className="fas fa-bell text-yellow-400 text-2xl mr-3"></i><h2 className="text-lg font-bold text-moyo-dark">Lembretes e Alertas</h2></div>
            <ul className="space-y-4">
              {pendentes.length > 0 ? pendentes.map((c) => (
                <li key={c.id} className="flex items-start">
                  <i className="fas fa-info-circle text-yellow-400 mt-1 mr-3"></i>
                  <div>
                    <h4 className="font-semibold mb-1">Consulta marcada para {new Date(c.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</h4>
                    <p className="text-moyo-gray text-sm">{diasParaConsulta(c.data_hora) > 1 && `Faltam ${diasParaConsulta(c.data_hora)} dias`}
                    {diasParaConsulta(c.data_hora) === 1 && 'É amanhã!'}
                    {diasParaConsulta(c.data_hora) === 0 && 'É hoje!'}
                    {diasParaConsulta(c.data_hora) < 0 && 'Consulta atrasada'}</p>
                  </div>
                </li>
              )) : (
                <li className="flex items-start"><i className="fas fa-info-circle text-yellow-400 mt-1 mr-3"></i><div><h4 className="font-semibold mb-1">Você receberá lembretes de consultas e exames aqui</h4><p className="text-moyo-gray text-sm">Configure suas preferências de notificação</p></div></li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {/* Recomendações Médicas */}
      <div className="recommendations bg-white rounded-2xl shadow ">
        <div className="flex items-center mb-4"><i className="fas fa-stethoscope text-moyo-accent text-2xl mr-3"></i><h2 className="text-lg font-bold text-moyo-dark">Recomendações Médicas</h2></div>
        <ul className="divide-y divide-gray-200">
          <li className="flex items-center py-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-moyo-accent text-xl mr-4"><i className="fas fa-pills"></i></div>
            <div><h4 className="font-semibold mb-1">Losartana 50mg</h4><p className="text-moyo-gray text-sm">Tomar 1 comprimido pela manhã, todos os dias</p></div>
          </li>
          <li className="flex items-center py-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-moyo-accent text-xl mr-4"><i className="fas fa-pills"></i></div>
            <div><h4 className="font-semibold mb-1">Atorvastatina 20mg</h4><p className="text-moyo-gray text-sm">Tomar 1 comprimido à noite, após o jantar</p></div>
          </li>
          <li className="flex items-center py-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-moyo-accent text-xl mr-4"><i className="fas fa-heartbeat"></i></div>
            <div><h4 className="font-semibold mb-1">Controle de Pressão</h4><p className="text-moyo-gray text-sm">Medir a pressão arterial 2 vezes por semana</p></div>
          </li>
          <li className="flex items-center py-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-moyo-accent text-xl mr-4"><i className="fas fa-walking"></i></div>
            <div><h4 className="font-semibold mb-1">Atividade Física</h4><p className="text-moyo-gray text-sm">Caminhada de 30 minutos, 5 dias por semana</p></div>
          </li>
        </ul>
      </div>
    </div>
  );
}
