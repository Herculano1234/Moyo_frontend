import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import apiHost from '../../config/apiHost';
axios.defaults.baseURL = `https://${apiHost}`;

// ...existing code...

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícone padrão do Leaflet para o Marker
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Dummy LocationPicker (replace with your own if needed)
const LocationPicker = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => null;

interface Hospital {
  id: number;
  nome?: string;
  name?: string;
  endereco?: string;
  address?: string;
  cidade?: string;
  provincia?: string;
  capacidade?: number;
  capacity?: number;
  areas_trabalho?: string;
  specialties?: string;
  responsavel?: string;
  manager?: string;
  status?: string;
  latitude?: string;
  longitude?: string;
  criado_em?: string;
  exames_disponiveis?: string | string[];
  telefone?: string;
  email?: string;
  site?: string;
  tipo_unidade?: string;
  categoria?: string;
  nivel?: string;
  data_fundacao?: string;
  redes_sociais?: string;
  diretor?: string;
  cargo_diretor?: string;
  nif?: string;
  horario?: string;
  num_medicos?: string | number;
  num_enfermeiros?: string | number;
  capacidade_internamento?: string;
  urgencia?: string;
  salas_cirurgia?: string;
  especialidades?: string | string[];
  laboratorio?: string;
  farmacia?: string;
  banco_sangue?: string;
  servicos_imagem?: string;
  ambulancia?: string;
  seguradoras?: string;
  acessibilidade?: string;
  estacionamento?: string;
}

type HospitalFormType = {
  nome: string;
  endereco: string;
  cidade: string;
  provincia: string;
  latitude: string;
  longitude: string;
  areas_trabalho: string;
  exames_disponiveis: string[];
  telefone: string;
  email: string;
  site: string;
  tipo_unidade?: string;
  categoria?: string;
  nivel?: string;
  data_fundacao?: string;
  redes_sociais?: string;
  diretor?: string;
  cargo_diretor?: string;
  nif?: string;
  horario?: string;
  capacidade?: string;
  num_medicos?: string;
  num_enfermeiros?: string;
  capacidade_internamento?: string;
  urgencia?: string;
  salas_cirurgia?: string;
  especialidades?: string[];
  laboratorio?: string;
  farmacia?: string;
  banco_sangue?: string;
  servicos_imagem?: string;
  ambulancia?: string;
  seguradoras?: string;
  acessibilidade?: string;
  estacionamento?: string;
};

const initialForm: HospitalFormType = {
  nome: '', endereco: '', cidade: '', provincia: '', latitude: '', longitude: '',
  areas_trabalho: '', exames_disponiveis: [], telefone: '', email: '', site: '',
  tipo_unidade: '', categoria: '', nivel: '', data_fundacao: '', redes_sociais: '',
  diretor: '', cargo_diretor: '', nif: '', horario: '', capacidade: '', num_medicos: '', num_enfermeiros: '', capacidade_internamento: '', urgencia: '', salas_cirurgia: '', especialidades: [], laboratorio: '', farmacia: '', banco_sangue: '', servicos_imagem: '', ambulancia: '', seguradoras: '', acessibilidade: '', estacionamento: ''
};

const HospitalAdmin: React.FC = () => {
  // ...existing code...
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  // Hospitais do backend
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [editHospital, setEditHospital] = useState<Hospital | null>(null);
  const [hospitalForm, setHospitalForm] = useState<HospitalFormType>(initialForm);
  const [errorHosp, setErrorHosp] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [mapSearchLoading, setMapSearchLoading] = useState(false);
  const [mapSearchResults, setMapSearchResults] = useState<any[]>([]);
  const [mapPickerCenter, setMapPickerCenter] = useState<[number, number]>([-8.839, 13.289]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);
  const [activeHospitalTab, setActiveHospitalTab] = useState<'list' | 'map' | 'indicators'>('list');

  // Filtered hospitals
  const filteredHospitals = hospitals.filter(h => {
    const term = searchTerm.toLowerCase();
    return (
      (h.nome || h.name || '').toLowerCase().includes(term) ||
      (h.endereco || h.address || '').toLowerCase().includes(term) ||
      (h.responsavel || h.manager || '').toLowerCase().includes(term)
    );
  });

  // Buscar hospitais do backend
  useEffect(() => {
    setLoadingHospitals(true);
    // Fetch inicial
    axios.get('/hospitais').then(res => setHospitals(res.data)).catch(() => setHospitals([])).finally(() => setLoadingHospitals(false));
  }, []);

  // Handlers
  const handleHospitalInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, multiple, options } = e.target as HTMLInputElement & HTMLSelectElement;
    if (type === 'select-multiple') {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setHospitalForm({ ...hospitalForm, [name]: selected });
    } else {
      setHospitalForm({ ...hospitalForm, [name]: value });
    }
  };
  const handleHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHosp(null);
    try {
      const res = await axios.post('/hospitais', hospitalForm);
      setHospitals([res.data, ...hospitals]);
      setShowHospitalModal(false);
      setHospitalForm(initialForm);
    } catch (err: any) {
      setErrorHosp(err?.response?.data?.error || 'Erro ao cadastrar hospital');
    }
  };
  const handleEditHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHosp(null);
    if (!editHospital) return;
    try {
      const res = await axios.put(`/hospitais/${editHospital.id}`, hospitalForm);
      setHospitals(hospitals.map(h => h.id === editHospital.id ? res.data : h));
      setShowHospitalModal(false);
      setEditHospital(null);
      setHospitalForm(initialForm);
    } catch (err: any) {
      setErrorHosp(err?.response?.data?.error || 'Erro ao editar hospital');
    }
  };
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
  const openEditHospital = (hospital: Hospital) => {
    setEditHospital(hospital);
    setHospitalForm({
      nome: hospital.nome || hospital.name || '',
      endereco: hospital.endereco || hospital.address || '',
      cidade: '', provincia: '', latitude: hospital.latitude || '', longitude: hospital.longitude || '',
      areas_trabalho: hospital.areas_trabalho || hospital.specialties || '',
      exames_disponiveis: Array.isArray(hospital.exames_disponiveis) ? hospital.exames_disponiveis : (hospital.exames_disponiveis ? String(hospital.exames_disponiveis).split(',').map(s => s.trim()) : []),
      telefone: hospital.telefone || '',
      email: hospital.email || '',
      site: hospital.site || '',
      tipo_unidade: hospital.tipo_unidade || '',
      categoria: hospital.categoria || '',
      nivel: hospital.nivel || '',
      data_fundacao: hospital.data_fundacao || '',
      redes_sociais: hospital.redes_sociais || '',
      diretor: hospital.diretor || '',
      cargo_diretor: hospital.cargo_diretor || '',
      nif: hospital.nif || '',
      horario: hospital.horario || '',
      capacidade: hospital.capacidade ? String(hospital.capacidade) : '',
      num_medicos: hospital.num_medicos ? String(hospital.num_medicos) : '',
      num_enfermeiros: hospital.num_enfermeiros ? String(hospital.num_enfermeiros) : '',
      capacidade_internamento: hospital.capacidade_internamento || '',
      urgencia: hospital.urgencia || '',
      salas_cirurgia: hospital.salas_cirurgia || '',
      especialidades: Array.isArray(hospital.especialidades) ? hospital.especialidades : (hospital.especialidades ? String(hospital.especialidades).split(',').map(s => s.trim()) : []),
      laboratorio: hospital.laboratorio || '',
      farmacia: hospital.farmacia || '',
      banco_sangue: hospital.banco_sangue || '',
      servicos_imagem: hospital.servicos_imagem || '',
      ambulancia: hospital.ambulancia || '',
      seguradoras: hospital.seguradoras,
      acessibilidade: hospital.acessibilidade || '',
      estacionamento: hospital.estacionamento || ''
    });
    setShowHospitalModal(true);
  };
  const openDeleteHospital = (hospital: Hospital) => {
    setHospitalToDelete(hospital);
    setShowDeleteModal(true);
  };
  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMapSearchLoading(true);
    // Dummy search
    setTimeout(() => {
      setMapSearchResults([
        { lat: '-8.839', lon: '13.289', display_name: 'Luanda, Angola' }
      ]);
      setMapSearchLoading(false);
    }, 1000);
  };

  React.useEffect(() => {
    if (showHospitalModal && !editHospital) {
      setHospitalForm({ ...initialForm });
    }
  }, [showHospitalModal, editHospital]);

  return (
    <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Gestão de Hospitais</h1>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center" onClick={() => { setShowHospitalModal(true); setEditHospital(null); }}>
                    <i className="fas fa-plus mr-2"></i> Adicionar Hospital
                  </button>

                  {/* Modal de cadastro de hospital */}
                  {showHospitalModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fadeIn">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-0 overflow-hidden relative animate-slideUp flex flex-col h-[90vh] md:h-[90vh]">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl transition-colors z-10" onClick={() => setShowHospitalModal(false)}>
                          <i className="fas fa-times"></i>
                        </button>
                        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white flex items-center gap-4 min-h-[80px]">
                          <i className="fas fa-hospital-alt text-3xl"></i>
                          <div>
                            <h2 className="text-2xl font-bold">{editHospital ? 'Editar' : 'Cadastrar'} Unidade de Saúde</h2>
                            <p className="text-sm opacity-80">Preencha todos os campos obrigatórios para registrar a unidade.</p>
                          </div>
                        </div>
                        <form onSubmit={editHospital ? handleEditHospitalSubmit : handleHospitalSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white animate-fadeIn min-w-0">
                          {/* 1. Identificação */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-700 font-semibold mb-1">Nome da Unidade *</label>
                              <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400" name="nome" placeholder="Nome" value={hospitalForm.nome} onChange={handleHospitalInput} required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Tipo de Unidade</label>
                                <select className="w-full border p-2 rounded" name="tipo_unidade" value={hospitalForm.tipo_unidade} onChange={handleHospitalInput}>
                                  <option value="">Selecione</option>
                                  <option>Hospital Geral</option>
                                  <option>Clínica</option>
                                  <option>Posto de Saúde</option>
                                  <option>Centro de Diagnóstico</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Categoria</label>
                                <select className="w-full border p-2 rounded" name="categoria" value={hospitalForm.categoria || ''} onChange={handleHospitalInput}>
                                  <option value="">Selecione</option>
                                  <option>Público</option>
                                  <option>Privado</option>
                                  <option>Militar</option>
                                  <option>Universitário</option>
                                  <option>ONG</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Nível/Capacidade</label>
                                <select className="w-full border p-2 rounded" name="nivel" value={hospitalForm.nivel || ''} onChange={handleHospitalInput}>
                                  <option value="">Selecione</option>
                                  <option>Primário</option>
                                  <option>Secundário</option>
                                  <option>Terciário</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Data de Fundação</label>
                                <input type="date" className="w-full border p-2 rounded" name="data_fundacao" value={hospitalForm.data_fundacao || ''} onChange={handleHospitalInput} />
                              </div>
                            </div>
                          </div>
                          {/* 2. Localização */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-700 font-semibold mb-1">Endereço</label>
                              <input className="w-full border p-2 rounded" name="endereco" placeholder="Rua, bairro, nº" value={hospitalForm.endereco} onChange={handleHospitalInput} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Cidade</label>
                                <input className="w-full border p-2 rounded" name="cidade" value={hospitalForm.cidade} onChange={handleHospitalInput} />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Província</label>
                                <input className="w-full border p-2 rounded" name="provincia" value={hospitalForm.provincia} onChange={handleHospitalInput} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Latitude</label>
                                <input className="w-full border p-2 rounded" name="latitude" value={hospitalForm.latitude} onChange={handleHospitalInput} />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Longitude</label>
                                <input className="w-full border p-2 rounded" name="longitude" value={hospitalForm.longitude} onChange={handleHospitalInput} />
                              </div>
                            </div>
                            <button type="button" className="w-full bg-blue-100 text-blue-700 rounded p-2 font-semibold hover:bg-blue-200 transition" onClick={() => setShowMapPicker(true)}>
                              <i className="fas fa-map-marker-alt mr-2"></i>Selecionar no Mapa
                            </button>
                          </div>
                          {/* 3. Contatos */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-700 font-semibold mb-1">Telefone</label>
                              <input className="w-full border p-2 rounded" name="telefone" value={hospitalForm.telefone} onChange={handleHospitalInput} />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-semibold mb-1">Email</label>
                              <input className="w-full border p-2 rounded" name="email" value={hospitalForm.email} onChange={handleHospitalInput} />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-semibold mb-1">Site Oficial</label>
                              <input className="w-full border p-2 rounded" name="site" value={hospitalForm.site} onChange={handleHospitalInput} />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-semibold mb-1">Redes Sociais</label>
                              <input className="w-full border p-2 rounded" name="redes_sociais" placeholder="Facebook, Instagram, LinkedIn..." value={hospitalForm.redes_sociais || ''} onChange={handleHospitalInput} />
                            </div>
                          </div>
                          {/* 4. Administração */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-700 font-semibold mb-1">Diretor/Responsável</label>
                              <input className="w-full border p-2 rounded" name="diretor" placeholder="Nome do Diretor" value={hospitalForm.diretor || ''} onChange={handleHospitalInput} />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-semibold mb-1">Cargo</label>
                              <input className="w-full border p-2 rounded" name="cargo_diretor" placeholder="Cargo do Diretor" value={hospitalForm.cargo_diretor || ''} onChange={handleHospitalInput} />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-semibold mb-1">NIF / Registro Legal</label>
                              <input className="w-full border p-2 rounded" name="nif" value={hospitalForm.nif} onChange={handleHospitalInput} />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-semibold mb-1">Horário de Funcionamento</label>
                              <input className="w-full border p-2 rounded" name="horario" placeholder="Ex: Seg-Sex 08:00-18:00" value={hospitalForm.horario || ''} onChange={handleHospitalInput} />
                            </div>
                          </div>
                          {/* 5. Estrutura e Capacidade */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Número de Leitos</label>
                                <input type="number" className="w-full border p-2 rounded" name="capacidade" value={hospitalForm.capacidade} onChange={handleHospitalInput} />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Nº de Médicos</label>
                                <input type="number" className="w-full border p-2 rounded" name="num_medicos" value={hospitalForm.num_medicos} onChange={handleHospitalInput} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Nº de Enfermeiros</label>
                                <input type="number" className="w-full border p-2 rounded" name="num_enfermeiros" value={hospitalForm.num_enfermeiros} onChange={handleHospitalInput} />
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Capacidade de Internamento</label>
                                <input className="w-full border p-2 rounded" name="capacidade_internamento" placeholder="Sim/Não + nº" value={hospitalForm.capacidade_internamento || ''} onChange={handleHospitalInput} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Serviço de Urgência/Emergência</label>
                                <select className="w-full border p-2 rounded" name="urgencia" value={hospitalForm.urgencia} onChange={handleHospitalInput}>
                                  <option value="">Selecione</option>
                                  <option>Sim</option>
                                  <option>Não</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Salas de Cirurgia</label>
                                <input className="w-full border p-2 rounded" name="salas_cirurgia" placeholder="Sim/Não + quantidade" value={hospitalForm.salas_cirurgia} onChange={handleHospitalInput} />
                              </div>
                            </div>
                          </div>
                          {/* 6. Serviços e Áreas de Trabalho */}
                          <div className="space-y-4">
                           <div>
  <label className="block text-gray-700 font-semibold mb-2">
    Especialidades Médicas
  </label>
  <div className="grid grid-cols-2 gap-2">
    {[
      "Cardiologia",
      "Pediatria",
      "Ortopedia",
      "Neurologia",
      "Oncologia",
      "Ginecologia",
      "Oftalmologia",
      "Dermatologia",
      "Clínica Geral",
      "Outros",
    ].map((especialidade) => (
      <label key={especialidade} className="flex items-center space-x-2">
        <input
          type="checkbox"
          value={especialidade}
          checked={Array.isArray(hospitalForm.especialidades) && hospitalForm.especialidades.includes(especialidade)}
          onChange={(e) => {
            setHospitalForm((prev) => {
              const atual = Array.isArray(prev.especialidades) ? prev.especialidades : [];
              if (e.target.checked) {
                return { ...prev, especialidades: [...atual, especialidade] };
              } else {
                return { ...prev, especialidades: atual.filter((esp) => esp !== especialidade) };
              }
            });
          }}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <span>{especialidade}</span>
      </label>
    ))}
  </div>
  <span className="text-xs text-gray-400">
    Selecione quantas especialidades forem necessárias
  </span>
</div>

                            <div>
                              <label className="block text-gray-700 font-semibold mb-2">
                                Exames Disponíveis
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  "Raio-X",
                                  "Hemograma",
                                  "Ultrassom",
                                  "Tomografia",
                                  "Ressonância Magnética",
                                  "ECG",
                                  "Endoscopia",
                                  "Colonoscopia",
                                  "Outros",
                                ].map((exame) => (
                                  <label key={exame} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      value={exame}
                                      checked={hospitalForm.exames_disponiveis.includes(exame)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setHospitalForm((prev) => ({
                                            ...prev,
                                            exames_disponiveis: [...prev.exames_disponiveis, exame],
                                          }));
                                        } else {
                                          setHospitalForm((prev) => ({
                                            ...prev,
                                            exames_disponiveis: prev.exames_disponiveis.filter((ex) => ex !== exame),
                                          }));
                                        }
                                      }}
                                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <span>{exame}</span>
                                  </label>
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">Selecione quantos exames forem necessários</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Laboratório Próprio</label>
                                <select className="w-full border p-2 rounded" name="laboratorio" value={hospitalForm.laboratorio || ''} onChange={handleHospitalInput}>
                                  <option value="">Selecione</option>
                                  <option>Sim</option>
                                  <option>Não</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Farmácia Interna</label>
                                <select className="w-full border p-2 rounded" name="farmacia" value={hospitalForm.farmacia || ''} onChange={handleHospitalInput}>
                                  <option value="">Selecione</option>
                                  <option>Sim</option>
                                  <option>Não</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Banco de Sangue</label>
                                <select className="w-full border p-2 rounded" name="banco_sangue" value={hospitalForm.banco_sangue} onChange={handleHospitalInput}>
                                  <option value="">Selecione</option>
                                  <option>Sim</option>
                                  <option>Não</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Serviços de Imagem</label>
                                <input className="w-full border p-2 rounded" name="servicos_imagem" placeholder="Raio-X, Ecografia, TAC, RMN..." value={hospitalForm.servicos_imagem || ''} onChange={handleHospitalInput} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Serviço de Ambulância</label>
                                <select className="w-full border p-2 rounded" name="ambulancia" value={hospitalForm.ambulancia} onChange={handleHospitalInput}>
                                  <option value="">Selecione</option>
                                  <option>Sim</option>
                                  <option>Não</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Parceria com Seguradoras</label>
                                <input className="w-full border p-2 rounded" name="seguradoras" placeholder="Ex: ENSA, Fidelidade..." value={hospitalForm.seguradoras} onChange={handleHospitalInput} />
                              </div>
                            </div>
                          </div>
                          {/* 7. Acessibilidade e Infraestrutura Extra */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Acessibilidade para Deficientes</label>
                                <select className="w-full border p-2 rounded" name="acessibilidade" value={hospitalForm.acessibilidade} onChange={handleHospitalInput}>
                                  <option value="">Selecione</option>
                                  <option>Sim</option>
                                  <option>Não</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-gray-700 font-semibold mb-1">Estacionamento</label>
                                <input className="w-full border p-2 rounded" name="estacionamento" placeholder="Sim/Não, nº de vagas" value={hospitalForm.estacionamento} onChange={handleHospitalInput} />
                              </div>
                            </div>
                          </div>
                          {errorHosp && <div className="text-red-500 text-sm col-span-2">{errorHosp}</div>}
                          <button type="submit" className="col-span-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform mt-4">{editHospital ? 'Salvar Alterações' : 'Cadastrar'}</button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Modal de seleção de localização no mapa */}
                  {showMapPicker && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative animate-fadeIn">
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowMapPicker(false)}>
                          <i className="fas fa-times"></i>
                        </button>
                        <h2 className="text-xl font-bold mb-2">Selecione a localização no mapa</h2>
                        <form onSubmit={handleMapSearch} className="flex gap-2 mb-2">
                          <input className="flex-1 border p-2 rounded" placeholder="Buscar endereço, bairro, cidade..." value={mapSearch} onChange={e => setMapSearch(e.target.value)} />
                          <button type="submit" className="bg-blue-500 text-white px-3 rounded">Buscar</button>
                        </form>
                        {mapSearchLoading && <div className="text-blue-600 text-sm mb-2">Buscando...</div>}
                        {mapSearchResults.length > 0 && (
                          <div className="mb-2 max-h-32 overflow-y-auto border rounded">
                            {mapSearchResults.map((r, i) => (
                              <div key={i} className="p-2 hover:bg-blue-100 cursor-pointer text-sm" onClick={() => {
                                setHospitalForm({ ...hospitalForm, latitude: r.lat, longitude: r.lon });
                                setMapPickerCenter([parseFloat(r.lat), parseFloat(r.lon)]);
                                setMapSearchResults([]);
                              }}>
                                {r.display_name}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="h-96 w-full">
                          <MapContainer
                            center={
                              hospitalForm.latitude && hospitalForm.longitude && !isNaN(Number(hospitalForm.latitude)) && !isNaN(Number(hospitalForm.longitude))
                                ? [Number(hospitalForm.latitude), Number(hospitalForm.longitude)] as [number, number]
                                : mapPickerCenter as [number, number]
                            }
                            zoom={hospitalForm.latitude && hospitalForm.longitude ? 15 : 6}
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {hospitalForm.latitude && hospitalForm.longitude && !isNaN(Number(hospitalForm.latitude)) && !isNaN(Number(hospitalForm.longitude)) && (
                              <Marker position={[Number(hospitalForm.latitude), Number(hospitalForm.longitude)] as [number, number]} icon={markerIcon} />
                            )}
                            <LocationPicker onSelect={(lat, lng) => {
                              setHospitalForm({ ...hospitalForm, latitude: lat.toString(), longitude: lng.toString() });
                              setMapPickerCenter([lat, lng]);
                              setMapSearchResults([]);
                            }} />
                          </MapContainer>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">Busque um endereço ou clique no mapa para definir latitude e longitude.</div>
                      </div>
                    </div>
                  )}
                  <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center">
                    <i className="fas fa-print mr-2"></i> Imprimir
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
                    <i className="fas fa-download mr-2"></i> Exportar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Indicadores dinâmicos do BD */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow animate-pulse">
                  <h3 className="text-gray-500 text-sm font-medium">Total de Hospitais</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{hospitals.length || 0}</p>
                  <div className="flex items-center mt-3 text-green-500">
                    <i className="fas fa-arrow-up mr-1"></i>
                    <span className="text-sm font-medium">{hospitals.length || 0}</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                  <h3 className="text-gray-500 text-sm font-medium">Leitos Disponíveis</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{hospitals.length > 0 ? hospitals.reduce((acc, h) => acc + (Number(h.capacidade || h.capacity || 0)), 0) : 0}</p>
                  <div className="flex items-center mt-3 text-red-500">
                    <i className="fas fa-arrow-down mr-1"></i>
                    <span className="text-sm font-medium">{hospitals.length > 0 ? hospitals.reduce((acc, h) => acc + (Number(h.capacidade || h.capacity || 0)), 0) : 0}</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                  <h3 className="text-gray-500 text-sm font-medium">Hospitais em Manutenção</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{hospitals.length > 0 ? hospitals.filter(h => (h.status || '').toLowerCase().includes('manutenção')).length : 0}</p>
                  <div className="flex items-center mt-3 text-red-500">
                    <i className="fas fa-arrow-down mr-1"></i>
                    <span className="text-sm font-medium">{hospitals.length > 0 ? hospitals.filter(h => (h.status || '').toLowerCase().includes('manutenção')).length : 0}</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                  <h3 className="text-gray-500 text-sm font-medium">Novos Hospitais (30d)</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{
                    hospitals.length > 0 ? hospitals.filter(h => {
                      if (!h.criado_em) return false;
                      const criado = new Date(h.criado_em);
                      const agora = new Date();
                      const diff = (agora.getTime() - criado.getTime()) / (1000 * 60 * 60 * 24);
                      return diff <= 30;
                    }).length : 0
                  }</p>
                  <div className="flex items-center mt-3 text-green-500">
                    <i className="fas fa-arrow-up mr-1"></i>
                    <span className="text-sm font-medium">{hospitals.length > 0 ? hospitals.filter(h => {
                      if (!h.criado_em) return false;
                      const criado = new Date(h.criado_em);
                      const agora = new Date();
                      const diff = (agora.getTime() - criado.getTime()) / (1000 * 60 * 60 * 24);
                      return diff <= 30;
                    }).length : 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex border-b">
                  <button 
                    className={`px-6 py-4 font-medium ${
                      activeHospitalTab === 'list' 
                        ? "text-blue-600 border-b-2 border-blue-600" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveHospitalTab('list')}
                  >
                    Lista de Hospitais
                  </button>
                  <button 
                    className={`px-6 py-4 font-medium ${
                      activeHospitalTab === 'map' 
                        ? "text-blue-600 border-b-2 border-blue-600" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveHospitalTab('map')}
                  >
                    Mapa de Localização
                  </button>
                  <button 
                    className={`px-6 py-4 font-medium ${
                      activeHospitalTab === 'indicators' 
                        ? "text-blue-600 border-b-2 border-blue-600" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveHospitalTab('indicators')}
                  >
                    Indicadores
                  </button>
                </div>
                
                <div className="p-6">
                  {activeHospitalTab === 'list' && (
                    <div className="animate-fadeIn">
                      <div className="mb-6">
                        <div className="relative">
                          <input 
                            type="text" 
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                            placeholder="Buscar hospitais por nome, endereço ou responsável..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <i className="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidade</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidades</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredHospitals.map((hospital) => (
                              <tr key={hospital.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedHospital(hospital)}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{hospital.nome || hospital.name}</td>
                                <td className="px-6 py-4">{hospital.endereco || hospital.address}</td>
                                <td className="px-6 py-4">{hospital.capacidade || hospital.capacity || '-'} leitos</td>
                                <td className="px-6 py-4">{hospital.areas_trabalho || hospital.specialties}</td>
                                <td className="px-6 py-4">{hospital.responsavel || hospital.manager || '-'}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    (hospital.status === 'ativo' || hospital.status === 'Ativo') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {(hospital.status === 'ativo' || hospital.status === 'Ativo') ? 'Ativo' : 'Em manutenção'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                  <div className="flex space-x-2">
                                    <button className="text-blue-500 hover:text-blue-700" title="Editar" onClick={() => openEditHospital(hospital)}>
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="text-red-500 hover:text-red-700" title="Remover" onClick={() => openDeleteHospital(hospital)}>
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                  {/* Modal de detalhes do hospital */}
                  {selectedHospital && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-slideUp">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl transition-colors z-10" onClick={() => setSelectedHospital(null)}>
                          <i className="fas fa-times"></i>
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-blue-700">Detalhes do Hospital</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <strong>Nome:</strong> {selectedHospital.nome || selectedHospital.name}<br/>
                            <strong>Endereço:</strong> {selectedHospital.endereco || selectedHospital.address}<br/>
                            <strong>Cidade:</strong> {selectedHospital.cidade}<br/>
                            <strong>Província:</strong> {selectedHospital.provincia}<br/>
                            <strong>Latitude:</strong> {selectedHospital.latitude}<br/>
                            <strong>Longitude:</strong> {selectedHospital.longitude}<br/>
                            <strong>Capacidade:</strong> {selectedHospital.capacidade || selectedHospital.capacity}<br/>
                            <strong>Especialidades:</strong> {selectedHospital.especialidades}<br/>
                            <strong>Áreas de Trabalho:</strong> {selectedHospital.areas_trabalho || selectedHospital.specialties}<br/>
                            <strong>Exames Disponíveis:</strong> {selectedHospital.exames_disponiveis}<br/>
                          </div>
                          <div>
                            <strong>Telefone:</strong> {selectedHospital.telefone}<br/>
                            <strong>Email:</strong> {selectedHospital.email}<br/>
                            <strong>Site:</strong> {selectedHospital.site}<br/>
                            <strong>Tipo de Unidade:</strong> {selectedHospital.tipo_unidade}<br/>
                            <strong>Categoria:</strong> {selectedHospital.categoria}<br/>
                            <strong>Nível:</strong> {selectedHospital.nivel}<br/>
                            <strong>Data Fundação:</strong> {selectedHospital.data_fundacao}<br/>
                            <strong>Diretor:</strong> {selectedHospital.diretor}<br/>
                            <strong>Cargo Diretor:</strong> {selectedHospital.cargo_diretor}<br/>
                            <strong>NIF:</strong> {selectedHospital.nif}<br/>
                            <strong>Horário:</strong> {selectedHospital.horario}<br/>
                            <strong>Status:</strong> {selectedHospital.status}<br/>
                          </div>
                        </div>
                        <div className="mt-4">
                          <strong>Laboratório:</strong> {selectedHospital.laboratorio}<br/>
                          <strong>Farmácia:</strong> {selectedHospital.farmacia}<br/>
                          <strong>Banco de Sangue:</strong> {selectedHospital.banco_sangue}<br/>
                          <strong>Serviços de Imagem:</strong> {selectedHospital.servicos_imagem}<br/>
                          <strong>Ambulância:</strong> {selectedHospital.ambulancia}<br/>
                          <strong>Seguradoras:</strong> {selectedHospital.seguradoras}<br/>
                          <strong>Acessibilidade:</strong> {selectedHospital.acessibilidade}<br/>
                          <strong>Estacionamento:</strong> {selectedHospital.estacionamento}<br/>
                        </div>
                      </div>
                    </div>
                  )}
                                </td>
                              </tr>
                            ))}
                  {/* Modal de confirmação de remoção */}
                  {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative animate-fadeIn">
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowDeleteModal(false)}>
                          <i className="fas fa-times"></i>
                        </button>
                        <h2 className="text-xl font-bold mb-4">Remover hospital</h2>
                        <p className="mb-6">Tem certeza que deseja remover <span className="font-semibold">{hospitalToDelete?.nome || hospitalToDelete?.name}</span>?</p>
                        <div className="flex gap-4">
                          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleDeleteHospital}>Remover</button>
                          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                        </div>
                      </div>
                    </div>
                  )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {activeHospitalTab === 'map' && (
                    <div className="animate-fadeIn">
                      <div className="h-96 bg-gradient-to-br from-red-50 to-blue-100 rounded-lg flex flex-col items-center justify-center text-blue-800 relative">
                        <p className="text-1xl font-bold mb-2">Mapa de Hospitais</p>
                        {/* Exibe o mapa real se houver hospitais com latitude/longitude */}
                        {hospitals.some(h => h.latitude && h.longitude) ? (
                          <div className="w-full h-80 mt-4">
                            <MapContainer
                              center={[-11.2027, 17.8739]} // Centro de Angola
                              zoom={6}
                              style={{ height: '100%', width: '100%' }}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              {hospitals.filter(h => h.latitude && h.longitude).map(h => (
                                <Marker key={h.id} position={[Number(h.latitude), Number(h.longitude)] as [number, number]} icon={markerIcon}>
                                  <Popup>
                                    <div className="text-sm">
                                      <div className="font-bold text-base mb-1">{h.nome || h.name}</div>
                                      <div><b>Endereço:</b> {h.endereco || h.address}</div>
                                      <div><b>Capacidade:</b> {h.capacidade || h.capacity || '-'} leitos</div>
                                      <div><b>Áreas:</b> {h.areas_trabalho || h.specialties || '-'}</div>
                                      <div><b>Exames:</b> {h.exames_disponiveis || '-'}</div>
                                      <div><b>Especialidade:</b> {h.specialties || '-'}</div>
                                      <div><b>Status:</b> {h.status || '-'}</div>
                                      <div><b>Responsável:</b> {h.responsavel || h.manager || '-'}</div>
                                      <div><b>Telefone:</b> {h.telefone || '-'}</div>
                                      <div><b>Email:</b> {h.email || '-'}</div>
                                    </div>
                                  </Popup>
                                </Marker>
                              ))}
                            </MapContainer>
                          </div>
                        ) : (
                          <div className="text-gray-500 mt-4">Nenhum hospital com localização cadastrada.</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {activeHospitalTab === 'indicators' && (
                    <div className="animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                          <h2 className="text-xl font-semibold text-gray-700 mb-4">Ocupação Hospitalar</h2>
                          <div className="space-y-4">
                            {hospitals.slice(0, 4).map((hospital) => (
                              <div key={hospital.id}>
                                <div className="flex justify-between mb-1">
                                  <span>{hospital.name}</span>
                                  <span className="font-medium">85%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${Math.min(85 + hospital.id * 2, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                          <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribuição por Especialidade</h2>
                          <div className="space-y-4">
                            {[
                              { name: "Cardiologia", value: 25 },
                              { name: "Oncologia", value: 18 },
                              { name: "Pediatria", value: 15 },
                              { name: "Ortopedia", value: 12 },
                              { name: "Neurologia", value: 10 },
                              { name: "Outros", value: 20 }
                            ].map((specialty, index) => (
                              <div key={index}>
                                <div className="flex justify-between mb-1">
                                  <span>{specialty.name}</span>
                                  <span className="font-medium">{specialty.value}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="h-2.5 rounded-full" 
                                    style={{ 
                                      width: `${specialty.value}%`,
                                      backgroundColor: index === 0 ? '#3b82f6' : 
                                        index === 1 ? '#10b981' : 
                                        index === 2 ? '#8b5cf6' : 
                                        index === 3 ? '#f59e0b' : 
                                        index === 4 ? '#ef4444' : '#6b7280'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
  );
};

export default HospitalAdmin;
