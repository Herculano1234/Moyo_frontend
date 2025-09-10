import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Registrar componentes do Chart.js
Chart.register(...registerables);

const DashboardHospitalar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const patientChartRef = useRef<HTMLCanvasElement>(null);
  const specialtyChartRef = useRef<HTMLCanvasElement>(null);
  const patientChartInstance = useRef<Chart | null>(null);
  const specialtyChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Dados para os gráficos
    const patientData = {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Pacientes Atendidos',
          data: [120, 145, 132, 158, 140, 95, 70],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: 'Consultas Marcadas',
          data: [85, 92, 78, 105, 98, 65, 45],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ]
    };
    
    const specialtyData = {
      labels: ['Cardiologia', 'Ortopedia', 'Pediatria', 'Dermatologia', 'Oftalmologia'],
      datasets: [{
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderWidth: 1
      }]
    };

    // Destruir gráficos existentes
    if (patientChartInstance.current) {
      patientChartInstance.current.destroy();
    }
    if (specialtyChartInstance.current) {
      specialtyChartInstance.current.destroy();
    }

    // Criar gráfico de pacientes
    if (patientChartRef.current) {
      const ctx = patientChartRef.current.getContext('2d');
      if (ctx) {
        patientChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: patientData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: false
              }
            }
          }
        });
      }
    }

    // Criar gráfico de especialidades
    if (specialtyChartRef.current) {
      const ctx = specialtyChartRef.current.getContext('2d');
      if (ctx) {
        specialtyChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: specialtyData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              }
            }
          }
        });
      }
    }

    // Cleanup function
    return () => {
      if (patientChartInstance.current) {
        patientChartInstance.current.destroy();
      }
      if (specialtyChartInstance.current) {
        specialtyChartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1><i className="fas fa-hospital"></i> <span>Admin Hospital</span></h1>
        </div>
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
        </div>
        <div className={`nav-item ${activeTab === 'profissionais' ? 'active' : ''}`} onClick={() => setActiveTab('profissionais')}>
          <i className="fas fa-user-md"></i> <span>Profissionais</span>
        </div>
        <div className={`nav-item ${activeTab === 'especialidades' ? 'active' : ''}`} onClick={() => setActiveTab('especialidades')}>
          <i className="fas fa-stethoscope"></i> <span>Especialidades</span>
        </div>
        <div className={`nav-item ${activeTab === 'hospitais' ? 'active' : ''}`} onClick={() => setActiveTab('hospitais')}>
          <i className="fas fa-hospital"></i> <span>Hospitais</span>
        </div>
        <div className={`nav-item ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
          <i className="fas fa-users"></i> <span>Usuários</span>
        </div>
        <div className={`nav-item ${activeTab === 'estatisticas' ? 'active' : ''}`} onClick={() => setActiveTab('estatisticas')}>
          <i className="fas fa-chart-bar"></i> <span>Estatísticas</span>
        </div>
        <div className={`nav-item ${activeTab === 'financeiro' ? 'active' : ''}`} onClick={() => setActiveTab('financeiro')}>
          <i className="fas fa-dollar-sign"></i> <span>Financeiro</span>
        </div>
        <div className={`nav-item ${activeTab === 'configuracoes' ? 'active' : ''}`} onClick={() => setActiveTab('configuracoes')}>
          <i className="fas fa-cog"></i> <span>Configurações</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h2>Dashboard</h2>
          <div className="user-info">
            <img src="https://xsgames.co/randomusers/avatar.php?g=male" alt="User" />
            <div>
              <div>Dr. Silva</div>
              <small>Administrador</small>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#e1f0ff', color: '#3b82f6'}}>
              <i className="fas fa-user-injured"></i>
            </div>
            <div className="stat-content">
              <h3>1,248</h3>
              <p>Pacientes Atendidos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#ffe6e6', color: '#ef4444'}}>
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-content">
              <h3>584</h3>
              <p>Consultas Marcadas</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#e6f4ea', color: '#10b981'}}>
              <i className="fas fa-procedures"></i>
            </div>
            <div className="stat-content">
              <h3>42</h3>
              <p>Cirurgias Hoje</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#fef3cd', color: '#f59e0b'}}>
              <i className="fas fa-user-md"></i>
            </div>
            <div className="stat-content">
              <h3>78</h3>
              <p>Médicos Ativos</p>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="charts-container">
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">Pacientes Atendidos vs Consultas Marcadas</div>
              <div className="chart-actions">
                <button>Semanal</button>
                <button>Mensal</button>
                <button>Anual</button>
              </div>
            </div>
            <div className="chart-container">
              <canvas ref={patientChartRef}></canvas>
            </div>
          </div>
          
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">Distribuição por Especialidade</div>
              <div className="chart-actions">
                <button>Ver Todos</button>
              </div>
            </div>
            <div className="chart-container">
              <canvas ref={specialtyChartRef}></canvas>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="activity-card">
          <div className="chart-header">
            <div className="chart-title">Atividade Recente</div>
            <div className="chart-actions">
              <button>Ver Tudo</button>
            </div>
          </div>
          
          <ul className="activity-list">
            <li className="activity-item">
              <div className="activity-icon" style={{backgroundColor: '#e1f0ff', color: '#3b82f6'}}>
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="activity-content">
                <h4>Novo Paciente Registrado</h4>
                <p>Maria Silva foi registrada no sistema</p>
              </div>
              <div className="activity-time">2 min ago</div>
            </li>
            
            <li className="activity-item">
              <div className="activity-icon" style={{backgroundColor: '#e6f4ea', color: '#10b981'}}>
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="activity-content">
                <h4>Consulta Marcada</h4>
                <p>Dr. Carlos marcou consulta com João Santos</p>
              </div>
              <div className="activity-time">15 min ago</div>
            </li>
            
            <li className="activity-item">
              <div className="activity-icon" style={{backgroundColor: '#ffe6e6', color: '#ef4444'}}>
                <i className="fas fa-flask"></i>
              </div>
              <div className="activity-content">
                <h4>Resultado de Exames</h4>
                <p>Resultados de exames de Ana Costa disponíveis</p>
              </div>
              <div className="activity-time">1 h ago</div>
            </li>
            
            <li className="activity-item">
              <div className="activity-icon" style={{backgroundColor: '#fef3cd', color: '#f59e0b'}}>
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="activity-content">
                <h4>Pagamento Recebido</h4>
                <p>Pagamento de R$ 250,00 recebido de Pedro Alves</p>
              </div>
              <div className="activity-time">3 h ago</div>
            </li>
          </ul>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          background-color: #f5f7f9;
          color: #333;
        }
        
        .app-container {
          display: flex;
          min-height: 100vh;
        }
        
        /* Sidebar Styles */
        .sidebar {
          width: 250px;
          background: linear-gradient(to bottom, #4f46e5, #6366f1);
          color: white;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }
        
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .sidebar-header h1 {
          font-size: 1.4rem;
          display: flex;
          align-items: center;
        }
        
        .sidebar-header i {
          margin-right: 10px;
          font-size: 1.6rem;
        }
        
        .nav-item {
          padding: 12px 20px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s;
          border-left: 4px solid transparent;
        }
        
        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .nav-item.active {
          background-color: rgba(255, 255, 255, 0.15);
          border-left: 4px solid white;
        }
        
        .nav-item i {
          margin-right: 10px;
          width: 20px;
          text-align: center;
        }
        
        /* Main Content Styles */
        .main-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .header h2 {
          font-size: 1.8rem;
          color: #2d3748;
          font-weight: 600;
        }
        
        .user-info {
          display: flex;
          align-items: center;
        }
        
        .user-info img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
          object-fit: cover;
        }
        
        /* Dashboard Cards */
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 1.5rem;
        }
        
        .stat-content h3 {
          font-size: 1.8rem;
          margin-bottom: 5px;
          color: #2d3748;
        }
        
        .stat-content p {
          color: #718096;
          font-size: 0.9rem;
        }
        
        /* Charts Container */
        .charts-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .chart-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .chart-title {
          font-size: 1.2rem;
          color: #2d3748;
          font-weight: 600;
        }
        
        .chart-actions {
          display: flex;
          gap: 10px;
        }
        
        .chart-actions button {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 0.8rem;
          cursor: pointer;
          color: #4a5568;
        }
        
        .chart-container {
          position: relative;
          height: 300px;
        }
        
        /* Recent Activity */
        .activity-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
        }
        
        .activity-list {
          list-style: none;
        }
        
        .activity-item {
          display: flex;
          padding: 15px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .activity-item:last-child {
          border-bottom: none;
        }
        
        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 1rem;
        }
        
        .activity-content {
          flex: 1;
        }
        
        .activity-content h4 {
          font-size: 1rem;
          margin-bottom: 5px;
          color: #2d3748;
        }
        
        .activity-content p {
          color: #718096;
          font-size: 0.85rem;
        }
        
        .activity-time {
          color: #a0aec0;
          font-size: 0.8rem;
        }
        
        /* Responsive */
        @media (max-width: 992px) {
          .charts-container {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            width: 70px;
          }
          
          .sidebar-header h1 span, .nav-item span {
            display: none;
          }
          
          .sidebar-header h1 {
            justify-content: center;
          }
          
          .nav-item {
            justify-content: center;
          }
          
          .nav-item i {
            margin-right: 0;
            font-size: 1.2rem;
          }
        }
        
        @media (max-width: 576px) {
          .stats-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardHospitalar;