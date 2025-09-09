import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// WebSocket para atualização em tempo real
const WS_URL = 'ws://localhost:3001'; // ajuste para sua URL real
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '@fortawesome/fontawesome-free/css/all.min.css';

const DashboardAdmin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHospitalTab, setActiveHospitalTab] = useState("list");
  const [activeUserTab, setActiveUserTab] = useState("patients");
  const [searchTerm, setSearchTerm] = useState("");
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [hospitalForm, setHospitalForm] = useState({
    nome: '', endereco: '', cidade: '', provincia: '', latitude: '', longitude: '', areas_trabalho: '', exames_disponiveis: '', telefone: '', email: '', site: ''
  });
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [errorHosp, setErrorHosp] = useState<string|null>(null);
  const [editHospital, setEditHospital] = useState<any|null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<any|null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState<any[]>([]);
  const [mapSearchLoading, setMapSearchLoading] = useState(false);
  const [mapPickerCenter, setMapPickerCenter] = useState([-8.8383, 13.2344]);
  // Buscar endereço no mapa (Nominatim)
  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearch) return;
    setMapSearchLoading(true);
    setMapSearchResults([]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch)}`);
      const data = await res.json();
      setMapSearchResults(data);
      if (data.length > 0) {
        setMapPickerCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch {
      setMapSearchResults([]);
    }
    setMapSearchLoading(false);
  };
  // Função para abrir modal de edição
  const openEditHospital = (hospital: any) => {
    setEditHospital(hospital);
    setHospitalForm({
      nome: hospital.nome || '', endereco: hospital.endereco || '', cidade: hospital.cidade || '', provincia: hospital.provincia || '', latitude: hospital.latitude || '', longitude: hospital.longitude || '', areas_trabalho: hospital.areas_trabalho || '', exames_disponiveis: hospital.exames_disponiveis || '', telefone: hospital.telefone || '', email: hospital.email || '', site: hospital.site || ''
    });
    setShowHospitalModal(true);
  };

  // Função para salvar edição
  const handleEditHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHosp(null);
    try {
      const res = await axios.put(`/hospitais/${editHospital.id}`, hospitalForm);
      setHospitals(hospitals.map(h => h.id === editHospital.id ? res.data : h));
      setShowHospitalModal(false);
      setEditHospital(null);
      setHospitalForm({ nome: '', endereco: '', cidade: '', provincia: '', latitude: '', longitude: '', areas_trabalho: '', exames_disponiveis: '', telefone: '', email: '', site: '' });
    } catch (err: any) {
      setErrorHosp(err?.response?.data?.error || 'Erro ao editar hospital');
    }
  };

  // Função para abrir modal de remoção
  const openDeleteHospital = (hospital: any) => {
    setHospitalToDelete(hospital);
    setShowDeleteModal(true);
  };

  // Função para remover hospital
  const handleDeleteHospital = async () => {
    if (!hospitalToDelete) return;
    try {
      await axios.delete(`/hospitais/${hospitalToDelete.id}`);
      setHospitals(hospitals.filter(h => h.id !== hospitalToDelete.id));
      setShowDeleteModal(false);
      setHospitalToDelete(null);
    } catch (err) {
      setErrorHosp('Erro ao remover hospital');
    }
  };

  // Componente para selecionar localização no mapa
  function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
      click(e) {
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    });
    return null;
  }

  // Ícone customizado para o marker
  const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  });

  // Buscar hospitais do backend (simples, só para demo)
  // WebSocket para hospitais
  const ws = useRef<WebSocket | null>(null);
  useEffect(() => {
    setLoadingHospitals(true);
    // Fetch inicial
    axios.get('/hospitais').then(res => setHospitals(res.data)).catch(() => setHospitals([])).finally(() => setLoadingHospitals(false));
    // WebSocket
    ws.current = new window.WebSocket(WS_URL + '/hospitais');
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) setHospitals(data);
      } catch {}
    };
    return () => { ws.current?.close(); };
  }, []);

  const handleHospitalInput = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setHospitalForm({ ...hospitalForm, [e.target.name]: e.target.value });
  };

  const handleHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHosp(null);
    // Corrigir latitude/longitude: string vazia vira null, valor inválido bloqueia
    let lat: number|null = hospitalForm.latitude && !isNaN(Number(hospitalForm.latitude)) ? Number(hospitalForm.latitude) : null;
    let lng: number|null = hospitalForm.longitude && !isNaN(Number(hospitalForm.longitude)) ? Number(hospitalForm.longitude) : null;
    if ((lat !== null && (lat < -90 || lat > 90)) || (lng !== null && (lng < -180 || lng > 180))) {
      setErrorHosp('Latitude deve estar entre -90 e 90 e longitude entre -180 e 180.');
      return;
    }
    const payload = { ...hospitalForm, latitude: lat, longitude: lng };
    try {
      const res = await axios.post('/hospitais', payload);
      setHospitals([res.data, ...hospitals]);
      setShowHospitalModal(false);
      setHospitalForm({ nome: '', endereco: '', cidade: '', provincia: '', latitude: '', longitude: '', areas_trabalho: '', exames_disponiveis: '', telefone: '', email: '', site: '' });
    } catch (err: any) {
      setErrorHosp(err?.response?.data?.error || 'Erro ao cadastrar hospital');
    }
  };
  
  const users = [
    { id: "JS", name: "João Silva", cpf: "123.456.789-00", email: "joao@exemplo.com", lastAccess: "14/08/2025", status: "Ativo", type: "Paciente" },
    { id: "MO", name: "Maria Oliveira", cpf: "987.654.321-00", email: "maria@exemplo.com", lastAccess: "13/08/2025", status: "Pendente", type: "Paciente" },
    { id: "PC", name: "Pedro Costa", cpf: "456.789.123-00", email: "pedro@exemplo.com", lastAccess: "10/08/2025", status: "Inativo", type: "Paciente" },
    { id: "AM", name: "Ana Mendes", cpf: "789.123.456-00", email: "ana@exemplo.com", lastAccess: "15/08/2025", status: "Ativo", type: "Médico" },
    { id: "LS", name: "Luiz Souza", cpf: "321.654.987-00", email: "luiz@exemplo.com", lastAccess: "12/08/2025", status: "Ativo", type: "Enfermeiro" },
    { id: "CA", name: "Carla Andrade", cpf: "654.321.987-00", email: "carla@exemplo.com", lastAccess: "11/08/2025", status: "Ativo", type: "Administrador" }
  ];
  
  // Estatísticas dinâmicas do dashboard
  const totalHospitais = hospitals.length;
  // Hospitais em manutenção (status = 'manutenção' ou similar)
  const hospitaisManutencao = hospitals.filter(h => (h.status || '').toLowerCase().includes('manutenção')).length;
  // Novos hospitais nos últimos 30 dias (campo criado_em)
  const novosHospitais = hospitals.filter(h => {
    if (!h.criado_em) return false;
    const criado = new Date(h.criado_em);
    const agora = new Date();
    const diff = (agora.getTime() - criado.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  }).length;
  // Leitos disponíveis (campo capacidade/capacity)
  const leitosDisponiveis = hospitals.reduce((acc, h) => acc + (Number(h.capacidade || h.capacity || 0)), 0);
  // Crescimento percentual de hospitais (últimos 30 dias vs total)
  const crescimentoHospitais = totalHospitais > 0 ? Math.round((novosHospitais / totalHospitais) * 100) : 0;
  // Variação de hospitais em manutenção (exemplo: diferença entre agora e 30 dias atrás)
  // Para simplificação, vamos mostrar apenas o número atual
  // Variação de leitos disponíveis (exemplo: diferença entre agora e semana passada)
  // Para simplificação, vamos mostrar apenas o número atual

  const stats = [
    {
      title: "Total de Hospitais",
      value: totalHospitais.toString(),
      trend: novosHospitais > 0 ? "up" : "down",
      trendValue: novosHospitais > 0 ? `${novosHospitais} novo(s) este mês` : "0 novos",
      pulse: true
    },
    {
      title: "Leitos Disponíveis",
      value: leitosDisponiveis.toLocaleString(),
      trend: "flat",
      trendValue: "",
    },
    {
      title: "Hospitais em Manutenção",
      value: hospitaisManutencao.toString(),
      trend: "flat",
      trendValue: "",
    },
    {
      title: "Novos Hospitais (30d)",
      value: novosHospitais.toString(),
      trend: crescimentoHospitais > 0 ? "up" : "flat",
      trendValue: crescimentoHospitais > 0 ? `${crescimentoHospitais}% crescimento` : "",
    }
  ];
  
  // Filtrar hospitais baseado no termo de busca
  const filteredHospitals = hospitals.filter(hospital => 
    (hospital.nome || hospital.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (hospital.endereco || hospital.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filtrar usuários baseado no tipo selecionado
  const filteredUsers = users.filter(user => 
    activeUserTab === "patients" ? user.type === "Paciente" :
    activeUserTab === "professionals" ? ["Médico", "Enfermeiro"].includes(user.type) :
    activeUserTab === "admins" ? user.type === "Administrador" : true
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
          <i className="fas fa-sync-alt mr-2"></i> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow ${
              stat.pulse ? 'animate-pulse' : ''
            }`}
          >
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
            <div className={`flex items-center mt-3 ${
              stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              <i className={`fas ${stat.trend === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
              <span className="text-sm font-medium">{stat.trendValue}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Atividade Recente</h2>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex flex-col items-center justify-center text-blue-800">
            <i className="fas fa-chart-bar text-5xl mb-4"></i>
            <p className="text-xl font-bold">Visitas por Dia da Semana</p>
            <div className="w-full max-w-xs mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Segunda</span>
                <div className="w-3/4 h-4 bg-blue-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-sm font-bold">75%</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Terça</span>
                <div className="w-3/4 h-4 bg-blue-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-bold">85%</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Quarta</span>
                <div className="w-3/4 h-4 bg-blue-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-sm font-bold">60%</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Quinta</span>
                <div className="w-3/4 h-4 bg-blue-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <span className="text-sm font-bold">90%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sexta</span>
                <div className="w-3/4 h-4 bg-blue-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <span className="text-sm font-bold">70%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribuição de Pacientes</h2>
          <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center text-green-800">
            <div className="text-center">
              <i className="fas fa-pie-chart text-5xl mb-4"></i>
              <p className="text-xl font-bold">Distribuição por Especialidade</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span>Cardiologia (25%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span>Pediatria (20%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                  <span>Ortopedia (18%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span>Oncologia (15%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span>Neurologia (12%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
                  <span>Outros (10%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button className="px-6 py-4 font-medium text-blue-600 border-b-2 border-blue-600">
            Alertas Recentes
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensagem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">15/08/2025</td>
                <td className="px-6 py-4">Atualização do sistema agendada para amanhã</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Média
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-500 hover:text-blue-700 mr-3">
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">14/08/2025</td>
                <td className="px-6 py-4">Novo hospital cadastrado: Hospital Santa Luzia</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Baixa
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-500 hover:text-blue-700 mr-3">
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">13/08/2025</td>
                <td className="px-6 py-4">Servidor de banco de dados apresentando alta carga</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Alta
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-500 hover:text-blue-700 mr-3">
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <i className="fas fa-cog"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;

