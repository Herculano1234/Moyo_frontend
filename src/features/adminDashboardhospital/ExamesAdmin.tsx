import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Registrar componentes do ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Doctor {
  id: number;
  nome: string;
  especialidade: string;
}

interface Exam {
  id: number;
  name: string;
  available: boolean;
  doneCount?: number;
  profissional_id?: number;
  paciente_id?: number;
  data_hora?: string;
  status?: string;
}

const ExamesAdmin: React.FC = () => {
  const [addExamLoading, setAddExamLoading] = useState(false);
  const [addExamMessage, setAddExamMessage] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  // Buscar nome/unidade do hospital do admin logado
  const adminRaw = localStorage.getItem("moyo-user");
  let unidadeHospital = "";
  if (adminRaw) {
    try {
      const adminUser = JSON.parse(adminRaw);
      unidadeHospital = adminUser.unidade || adminUser.hospital || adminUser.unidade_hospitalar || "";
    } catch {}
  }

  // Buscar exames e médicos do banco de dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar exames do catálogo do hospital
        const examsResponse = await fetch(`https://moyo-backend.vercel.app/exames-catalogo?unidade=${encodeURIComponent(unidadeHospital)}`);
        const examsDataRaw = await examsResponse.json();
        // Buscar médicos filtrando por unidade/hospital
        const doctorsResponse = await fetch(`https://moyo-backend.vercel.app/profissionais?unidade=${encodeURIComponent(unidadeHospital)}`);
        const doctorsDataRaw = await doctorsResponse.json();

        setExams(examsDataRaw.map((e: any) => ({
          id: e.id,
          name: e.tipo,
          available: e.disponivel ?? true,
          doneCount: 0,
          profissional_id: undefined,
          paciente_id: undefined,
          data_hora: undefined,
          status: undefined
        })));
        setDoctors(doctorsDataRaw.map((d: any) => ({
          id: d.id,
          nome: d.nome,
          especialidade: d.especialidade
        })));
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [unidadeHospital]);
  
  const [newExamName, setNewExamName] = useState("");
  const [chartData, setChartData] = useState<any>(null);

  // Calcular totais
  const totalExams = exams.length;
  const availableExams = exams.filter(exam => exam.available).length;
  const unavailableExams = exams.filter(exam => !exam.available).length;

  // Preparar dados do gráfico
  useEffect(() => {
    const labels = exams.map(exam => exam.name);
    const data = exams.map(exam => exam.doneCount || 0);
    
    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Número de Exames Realizados',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });
  }, [exams]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Exames Realizados',
      },
    },
  };

  // Adicionar novo exame
  const handleAddExam = async () => {
    if (newExamName.trim() === "") return;
    setAddExamLoading(true);
    setAddExamMessage("");
    try {
      const response = await fetch(`https://moyo-backend.vercel.app/exames-catalogo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: newExamName,
          disponivel: true,
          unidade: unidadeHospital
        })
      });
      if (response.ok) {
        const newExam = await response.json();
        setExams([...exams, {
          id: newExam.id,
          name: newExam.tipo,
          available: newExam.disponivel ?? true,
          doneCount: 0,
          profissional_id: undefined,
          paciente_id: undefined,
          data_hora: undefined,
          status: undefined
        }]);
        setNewExamName("");
        setAddExamMessage("Exame adicionado com sucesso!");
      } else {
        setAddExamMessage("Erro ao adicionar exame.");
      }
    } catch (error) {
      setAddExamMessage("Erro ao adicionar exame.");
      console.error('Erro ao adicionar exame:', error);
    }
    setAddExamLoading(false);
  };

  // Alternar disponibilidade do exame
  const toggleAvailability = async (id: number) => {
    try {
      const exam = exams.find(e => e.id === id);
      const response = await fetch(`https://moyo-backend.vercel.app/exames/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disponivel: !exam?.available
        })
      });
      if (response.ok) {
        setExams(exams.map(exam => 
          exam.id === id ? { ...exam, available: !exam.available } : exam
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
    }
  };

  // Atribuir exame a um médico
  const assignExamToDoctor = async (examId: number, doctorId: number) => {
    try {
      const response = await fetch(`https://moyo-backend.vercel.app/exames/${examId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profissional_id: doctorId
        })
      });
      if (response.ok) {
        setExams(exams.map(exam => 
          exam.id === examId ? { ...exam, profissional_id: doctorId } : exam
        ));
      }
    } catch (error) {
      console.error('Erro ao atribuir exame:', error);
    }
  };

  // Excluir exame
  const deleteExam = async (id: number) => {
    try {
      const response = await fetch(`https://moyo-backend.vercel.app/exames/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setExams(exams.filter(exam => exam.id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir exame:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Gerenciamento de Exames</h1>
      
      {/*------------- Cards de Estatísticas ------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total de Exames</h3>
          <p className="text-3xl font-bold text-blue-600">{totalExams}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Exames Disponíveis</h3>
          <p className="text-3xl font-bold text-green-600">{availableExams}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Exames Indisponíveis</h3>
          <p className="text-3xl font-bold text-red-600">{unavailableExams}</p>
        </div>
      </div>
      
      {/* Formulário para adicionar exame */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Adicionar Novo Exame</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newExamName}
            onChange={(e) => setNewExamName(e.target.value)}
            placeholder="Nome do exame"
            className="flex-grow p-2 border border-gray-300 rounded"
            disabled={addExamLoading}
          />
          <button
            onClick={handleAddExam}
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ${addExamLoading || newExamName.trim() === "" ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={addExamLoading || newExamName.trim() === ""}
          >
            {addExamLoading ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
        {addExamMessage && (
          <div className={`mt-3 text-sm font-semibold ${addExamMessage.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>{addExamMessage}</div>
        )}
      </div>
      
      {/* Gráfico de exames realizados */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Exames Realizados</h2>
        <div className="h-64">
          {chartData ? (
            <Chart type='bar' data={chartData} options={chartOptions} />
          ) : (
            <p>Carregando gráfico...</p>
          )}
        </div>
      </div>
      
      {/* Lista de exames */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Lista de Exames</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Realizações</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico Responsável</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      exam.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {exam.available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.doneCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={exam.profissional_id || ''}
                      onChange={(e) => assignExamToDoctor(exam.id, Number(e.target.value))}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Selecione um médico</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.nome} - {doctor.especialidade}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleAvailability(exam.id)}
                      className={`mr-2 ${
                        exam.available 
                          ? 'text-yellow-600 hover:text-yellow-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {exam.available ? 'Tornar Indisponível' : 'Tornar Disponível'}
                    </button>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
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

export default ExamesAdmin;