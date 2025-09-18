import React, { useState, useEffect } from "react";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar componentes do ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Exam {
  id: number;
  name: string;
  available: boolean;
  doneCount?: number;
}

const ExamesAdmin: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([
    { id: 1, name: "Hemograma Completo", available: true, doneCount: 45 },
    { id: 2, name: "Glicemia em Jejum", available: true, doneCount: 32 },
    { id: 3, name: "Colesterol Total", available: true, doneCount: 28 },
    { id: 4, name: "TSH", available: false, doneCount: 15 },
    { id: 5, name: "Eletrocardiograma", available: true, doneCount: 20 },
    { id: 6, name: "Ultrassom Abdominal", available: false, doneCount: 18 },
  ]);
  
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
  const handleAddExam = () => {
    if (newExamName.trim() === "") return;
    
    const newExam: Exam = {
      id: exams.length > 0 ? Math.max(...exams.map(e => e.id)) + 1 : 1,
      name: newExamName,
      available: true,
      doneCount: 0
    };
    
    setExams([...exams, newExam]);
    setNewExamName("");
  };

  // Alternar disponibilidade do exame
  const toggleAvailability = (id: number) => {
    setExams(exams.map(exam => 
      exam.id === id ? { ...exam, available: !exam.available } : exam
    ));
  };

  // Excluir exame
  const deleteExam = (id: number) => {
    setExams(exams.filter(exam => exam.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Gerenciamento de Exames</h1>
      
      {/* Cards de Estatísticas */}
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
          />
          <button
            onClick={handleAddExam}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>
      
      {/* Gráfico de exames realizados */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Exames Realizados</h2>
        <div className="h-64">
          {chartData ? (
            <Bar data={chartData} options={chartOptions} />
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