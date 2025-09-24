// Função para buscar hospitais do backend
async function getHospitaisAPI(): Promise<HospitalUnit[]> {
  try {
    const resp = await fetch(`https://moyo-backend.vercel.app/hospitais`);
    if (!resp.ok) throw new Error('Erro ao buscar hospitais');
    return await resp.json();
  } catch {
    return [];
  }
}
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// Descrições das especialidades médicas
const descricoesEspecialidades = {
  "Cardiologia": "Especialidade médica que trata do coração e do sistema circulatório. Cuida de problemas como hipertensão, insuficiência cardíaca, arritmias e infarto.",
  "Pediatria": "Especialidade médica dedicada à saúde de crianças e adolescentes. Aborda desde cuidados neonatais até doenças infantais e acompanhamento do desenvolvimento.",
  "Clínica Geral": "Atendimento médico geral para diagnóstico e tratamento de diversas condições de saúde. É a porta de entrada para o sistema de saúde.",
  "Ortopedia": "Especialidade médica que trata de problemas relacionados aos ossos, músculos, ligamentos e articulações. Cuida de fraturas, luxações e doenças como artrite.",
  "Dermatologia": "Especialidade médica que trata da pele, cabelos e unhas. Diagnostica e trata doenças como acne, psoríase, dermatites e câncer de pele.",
  "Oftalmologia": "Especialidade médica que trata dos olhos e problemas de visão. Realiza exames de acuidade visual e trata doenças como catarata, glaucoma e retinopatias.",
  "Ginecologia": "Especialidade médica que trata da saúde da mulher, especialmente do sistema reprodutivo. Realiza exames preventivos e acompanhamento ginecológico.",
  "Neurologia": "Especialidade médica que trata do sistema nervoso (cérebro, medula, nervos e músculos). Diagnostica e trata doenças como epilepsia, AVC e Alzheimer.",
  "Endocrinologia": "Especialidade médica que trata de problemas hormonais e metabólicos. Cuida de diabetes, distúrbios da tireoide, obesidade e osteoporose.",
  "Cirurgia": "Especialidade médica que realiza procedimentos operatórios. Pode ser geral ou especializada em áreas como vascular, plástica ou do aparelho digestivo.",
  "Neonatologia": "Subespecialidade da pediatria que cuida de recém-nascidos, especialmente prematuros ou com problemas de saúde nos primeiros dias de vida.",
  "Cardiologia Infantil": "Subespecialidade que trata de problemas cardíacos em crianças, incluindo cardiopatias congênitas e adquiridas."
};


// Ícones personalizados
const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149060.png',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// Interfaces
// Nova interface Consulta alinhada ao backend
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

interface HospitalUnit {
  id: string;
  nome: string;
  lat: number;
  lng: number;
  especialidades: string[] | string;
  areas: string[];
  endereco: string;
  distancia?: number;
  datasDisponiveis: string[];
}

// Função para garantir array de especialidades
function parseEspecialidades(especialidades: string[] | string): string[] {
  if (Array.isArray(especialidades)) return especialidades;
  if (typeof especialidades === 'string') {
    return especialidades.split(',').map(e => e.trim()).filter(e => e.length > 0);
  }
  return [];
}


// Perguntas de triagem
const perguntasTriagem = [
  { 
    id: "1", 
    texto: "Descreva seus sintomas principais (incluindo quando começaram e como evoluíram)", 
    tipo: "textarea",
    categoria: "Sintomas Atuais"
  },
  {
    id: "2",
    texto: "Qual a intensidade dos seus sintomas?",
    tipo: "select",
    opcoes: ["Leve (não interfere nas atividades)", "Moderada (dificulta atividades)", "Intensa (impossibilita atividades)", "Insuportável"],
    categoria: "Sintomas Atuais",
    peso: [1, 2, 3, 4]
  },
  {
    id: "3",
    texto: "Você tem alguma condição médica pré-existente?",
    tipo: "select",
    opcoes: ["Não", "Hipertensão", "Diabetes", "Problemas cardíacos", "Doença respiratória", "Outra"],
    categoria: "Histórico Médico",
    peso: [0, 1, 1, 2, 2, 1]
  },
  {
    id: "4",
    texto: "Você faz uso de algum medicamento regularmente? Se sim, quais?",
    tipo: "textarea",
    categoria: "Histórico Médico"
  },
  {
    id: "5",
    texto: "Você já foi hospitalizado nos últimos 3 meses?",
    tipo: "select",
    opcoes: ["Não", "Sim, por doença", "Sim, por cirurgia", "Sim, por acidente"],
    categoria: "Fatores de Risco",
    peso: [0, 2, 1, 2]
  },
  {
    id: "6",
    texto: "Você possui algum dos seguintes sintomas? (marque todos que se aplicam)",
    tipo: "multiselect",
    opcoes: ["Febre acima de 38°C", "Dificuldade para respirar", "Dor no peito", "Sangramento intenso", "Tontura ou desmaio", "Vômitos persistentes", "Nenhum destes"],
    categoria: "Sintomas de Alerta",
    peso: [3, 4, 4, 3, 2, 2, 0]
  },
  {
    id: "7",
    texto: "Descreva como os sintomas estão afetando sua rotina diária",
    tipo: "textarea",
    categoria: "Impacto na Vida"
  },
  {
    id: "8",
    texto: "Há algo mais que gostaria de informar ao profissional de saúde?",
    tipo: "textarea",
    categoria: "Informações Adicionais"
  }
];

// Funções de armazenamento e integração com API
const apiHost = "moyo-backend.vercel.app";

async function getConsultasAPI(pacienteId: string): Promise<Consulta[]> {
  try {
    const resp = await fetch(`http://${apiHost}/pacientes/${pacienteId}/consultas`);
    if (!resp.ok) throw new Error('Erro ao buscar consultas');
    return await resp.json();
  } catch {
    return [];
  }
}

// Função para salvar consulta (status sempre 'pendente' ao criar)
async function saveConsultaAPI(pacienteId: number, consulta: Partial<Consulta>): Promise<Consulta|null> {
  try {
    const payload = {
      data_hora: consulta.data_hora, // já no formato ISO
      status: 'pendente', // sempre pendente ao criar
      prioridade: consulta.prioridade || null,
      local: consulta.local || null
    };
    const resp = await fetch(`http://${apiHost}/pacientes/${pacienteId}/consultas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error('Erro ao cadastrar consulta');
    return await resp.json();
  } catch {
    return null;
  }
}

// Função para calcular distância
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
}

// Função para calcular urgência
function calcularUrgencia(respostas: { [key: string]: string | string[] }): { nivel: string, cor: string } {
  let pontuacao = 0;
  
  // Calcular pontuação com base nas respostas
  perguntasTriagem.forEach(pergunta => {
    if (pergunta.peso && respostas[pergunta.id]) {
      if (pergunta.tipo === "select") {
        const resposta = respostas[pergunta.id] as string;
        const opcaoIndex = pergunta.opcoes.indexOf(resposta);
        if (opcaoIndex !== -1 && pergunta.peso[opcaoIndex] !== undefined) {
          pontuacao += pergunta.peso[opcaoIndex];
        }
      } else if (pergunta.tipo === "multiselect") {
        const respostasMulti = respostas[pergunta.id] as string[];
        respostasMulti.forEach(resp => {
          const opcaoIndex = pergunta.opcoes.indexOf(resp);
          if (opcaoIndex !== -1 && pergunta.peso[opcaoIndex] !== undefined) {
            pontuacao += pergunta.peso[opcaoIndex];
          }
        });
      }
    }
  });
  
  // Análise de texto nas respostas abertas
  if (respostas["1"]) {
    const sintomas = (respostas["1"] as string).toLowerCase();
    
    // Palavras-chave que aumentam a urgência
    const palavrasUrgentes = ["forte", "insuportável", "intensa", "grave", "sangue", "vômito", "desmaio", "tontura", "falta de ar", "dor no peito"];
    palavrasUrgentes.forEach(palavra => {
      if (sintomas.includes(palavra)) pontuacao += 2;
    });
  }
  
  if (respostas["4"]) {
    const medicamentos = (respostas["4"] as string).toLowerCase();
    if (medicamentos.includes("anticoagulante") || medicamentos.includes("insulina")) {
      pontuacao += 2;
    }
  }
  
  if (respostas["7"]) {
    const impacto = (respostas["7"] as string).toLowerCase();
    if (impacto.includes("não consigo trabalhar") || impacto.includes("não consigo levantar")) {
      pontuacao += 3;
    }
    else if (impacto.includes("dificuldade")) {
      pontuacao += 1;
    }
  }
  
  // Classificar com base na pontuação
  if (pontuacao >= 15) return { nivel: "Emergência", cor: "#dc2626" };
  if (pontuacao >= 10) return { nivel: "Alta", cor: "#ea580c" };
  if (pontuacao >= 5) return { nivel: "Média", cor: "#ca8a04" };
  return { nivel: "Baixa", cor: "#16a34a" };
}

// Componente MapaHospital
interface MapaHospitalProps {
  mapCenter: [number, number];
  mapZoom: number;
  userLocation?: [number, number];
  unidadesFiltradas: HospitalUnit[];
  onSelectUnidade: (id: string) => void;
  unidadeSelecionada?: string;
}
const MapaHospital: React.FC<MapaHospitalProps> = ({
  mapCenter,
  mapZoom,
  userLocation,
  unidadesFiltradas,
  onSelectUnidade,
  unidadeSelecionada
}) => {
  return (
    <div className="w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-lg transition-all duration-500">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup className="font-bold">Sua localização</Popup>
          </Marker>
        )}
  {unidadesFiltradas.map((unidade: HospitalUnit) => (
          <Marker 
            key={unidade.id} 
            position={[unidade.lat, unidade.lng]} 
            icon={hospitalIcon} 
            eventHandlers={{ 
              click: () => onSelectUnidade(unidade.id),
              mouseover: () => onSelectUnidade(unidade.id)
            }}
          >
            <Popup className="min-w-[250px]">
              <div className={`p-2 ${unidadeSelecionada === unidade.id ? 'bg-blue-50' : ''}`}>
                <b className="text-blue-600">{unidade.nome}</b><br />
                <div className="text-sm text-gray-600">{unidade.endereco}</div>
                <div className="mt-1">
                  <span className="font-medium">Especialidades:</span> 
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseEspecialidades(unidade.especialidades).slice(0, 3).map((esp: string) => (
                      <span key={esp} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {esp}
                      </span>
                    ))}
                    {parseEspecialidades(unidade.especialidades).length > 3 && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        +{parseEspecialidades(unidade.especialidades).length - 3}
                      </span>
                    )}
                  </div>
                </div>
                {unidade.distancia && (
                  <div className="mt-2 text-sm font-medium">
                    <i className="fas fa-location-dot text-blue-500 mr-1"></i>
                    {unidade.distancia.toFixed(1)} km
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Componente FormularioAgendamento
// Ajuste de tipos para props
interface FormularioAgendamentoProps {
  etapa: number;
  especialidade: string;
  setEspecialidade: (esp: string) => void;
  data: string;
  setData: (dt: string) => void;
  unidadeSelecionada: string | null;
  setUnidadeSelecionada: (id: string) => void;
  unidadesFiltradas: HospitalUnit[];
  unidadesHospitalares: HospitalUnit[];
  onVoltar: () => void;
  onContinuar: (etapa: number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  erro?: string;
  userLocation?: [number, number] | null;
}
const FormularioAgendamento: React.FC<FormularioAgendamentoProps> = ({
  etapa,
  especialidade,
  setEspecialidade,
  data,
  setData,
  unidadeSelecionada,
  setUnidadeSelecionada,
  unidadesFiltradas,
  unidadesHospitalares,
  onVoltar,
  onContinuar,
  onSubmit,
  loading,
  erro,
  userLocation
}) => {
  const [hoveredEspecialidade, setHoveredEspecialidade] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [showModalDescricao, setShowModalDescricao] = useState(false);
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<string | null>(null);
  
  const especialidadesDisponiveis = useMemo(() => {
    const todas = unidadesHospitalares.flatMap((u: HospitalUnit) => parseEspecialidades(u.especialidades));
    return Array.from(new Set(todas));
  }, [unidadesHospitalares]);

  const unidadesComEspecialidade = useMemo(() => {
    if (!especialidade) return [];
    return unidadesHospitalares.filter((unidade: HospitalUnit) =>
      parseEspecialidades(unidade.especialidades).some((esp: string) =>
        esp.toLowerCase().includes(especialidade.toLowerCase())
      )
    );
  }, [especialidade, unidadesHospitalares]);

  const unidadesComDistancia = useMemo(() => {
    if (!userLocation) return unidadesComEspecialidade;
    return unidadesComEspecialidade.map((unidade: HospitalUnit) => ({
      ...unidade,
      distancia: calcularDistancia(
        userLocation[0],
        userLocation[1],
        unidade.lat,
        unidade.lng
      )
    })).sort((a: HospitalUnit, b: HospitalUnit) => (a.distancia || Infinity) - (b.distancia || Infinity));
  }, [unidadesComEspecialidade, userLocation]);

  const datasDisponiveis = useMemo(() => {
    if (!unidadeSelecionada) return [];
    const unidade = unidadesHospitalares.find((u: HospitalUnit) => u.id === unidadeSelecionada);
    if (!unidade || !Array.isArray(unidade.datasDisponiveis)) return [];
    return unidade.datasDisponiveis;
  }, [unidadeSelecionada, unidadesHospitalares]);

  // Abrir modal de descrição em dispositivos móveis
  const handleOpenModal = (esp: string) => {
    setHoveredEspecialidade(esp);
    setShowModalDescricao(true);
  };

  // Para acessar descricoesEspecialidades de forma segura
  const getDescricaoEspecialidade = (esp: string | null | undefined): string => {
    if (!esp) return "Descrição não disponível.";
    return descricoesEspecialidades[esp as keyof typeof descricoesEspecialidades] ?? "Descrição não disponível.";
  };

  return (
    <div className="space-y-6">
      {etapa === 1 && (
        <div className="space-y-4 animate-fadein">
          <h4 className="font-bold text-lg text-gray-700">Selecione a especialidade</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {especialidadesDisponiveis.slice(0, 8).map((esp: string) => (
              <div 
                key={esp}
                className="relative"
                onMouseEnter={() => {
                  setHoveredEspecialidade(esp);
                  setShowDescription(true);
                }}
                onMouseLeave={() => setShowDescription(false)}
              >
                <button
                  type="button"
                  className={`w-full px-3 py-2 rounded-lg font-medium text-sm shadow transition-all duration-300 flex items-center justify-center
                    ${especialidade === esp 
                      ? 'bg-moyo-primary text-white scale-105' 
                      : 'bg-white hover:bg-moyo-primary/10 text-gray-700 border border-gray-200'}`}
                  onClick={() => setEspecialidade(esp)}
                  onTouchStart={() => handleOpenModal(esp)}
                >
                  {esp}
                </button>
                
                {/* Tooltip de descrição para desktop */}
                {hoveredEspecialidade === esp && showDescription && (
                  <div className="hidden md:block absolute z-10 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg animate-fadein"
                    style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '10px' }}>
                    <div className="text-sm text-gray-700 font-medium mb-1">{esp}</div>
                    <div className="text-xs text-gray-600">
                      {getDescricaoEspecialidade(esp)}
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 
                      border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Área fixa de descrição para mobile */}
          <div className="md:hidden mt-4 min-h-[80px] p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
            {hoveredEspecialidade ? (
              <>
                <div className="font-medium text-moyo-primary">{hoveredEspecialidade}</div>
                <div>{getDescricaoEspecialidade(hoveredEspecialidade)}</div>
              </>
            ) : (
              "Toque em uma especialidade para ver sua descrição"
            )}
          </div>
          
          {/* Modal de descrição para mobile */}
          {showModalDescricao && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 md:hidden">
              <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">{selectedEspecialidade}</h3>
                  <button onClick={() => setShowModalDescricao(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600">
                  {selectedEspecialidade ? getDescricaoEspecialidade(selectedEspecialidade) : "Descrição não disponível."}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      selectedEspecialidade && setEspecialidade(selectedEspecialidade);
                      setShowModalDescricao(false);
                    }}
                    className="w-full bg-moyo-primary text-white py-2 rounded-lg font-bold"
                  >
                    Selecionar esta especialidade
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={() => onContinuar(2)}
              className="bg-moyo-primary text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-moyo-secondary transition transform hover:scale-105 disabled:opacity-50"
              disabled={!especialidade}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {etapa === 2 && (
        <div className="space-y-6 animate-fadein">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg text-gray-700">Selecione uma unidade</h4>
            <button
              onClick={onVoltar}
              className="text-moyo-primary hover:underline text-sm"
            >
              Alterar especialidade
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1">
            {unidadesComDistancia.map((unidade: HospitalUnit) => (
              <div
                key={unidade.id}
                className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  unidadeSelecionada === unidade.id
                    ? 'border-moyo-primary ring-2 ring-moyo-primary/30 bg-moyo-primary/5'
                    : 'border-gray-200 hover:border-moyo-primary'
                }`}
                onClick={() => setUnidadeSelecionada(unidade.id)}
              >
                <div className="font-bold text-moyo-primary">{unidade.nome}</div>
                <div className="text-sm text-gray-600 mt-1">{unidade.endereco}</div>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {parseEspecialidades(unidade.especialidades).slice(0, 3).map((esp: string) => (
                    <span 
                      key={esp} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {esp}
                    </span>
                  ))}
                </div>
                
                {unidade.distancia && (
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-moyo-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {unidade.distancia.toFixed(1)} km
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              onClick={onVoltar}
              className="px-6 py-2 rounded-lg font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Voltar
            </button>
            <button
              onClick={() => onContinuar(3)}
              className="bg-moyo-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-moyo-secondary transition transform hover:scale-105 disabled:opacity-50"
              disabled={!unidadeSelecionada}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {etapa === 3 && (
        <div className="space-y-6 animate-fadein">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg text-gray-700">Selecione uma data</h4>
            <button
              onClick={onVoltar}
              className="text-moyo-primary hover:underline text-sm"
            >
              Alterar unidade
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {datasDisponiveis.length === 0 ? (
              <div className="col-span-4 text-center text-gray-500 py-8">
                No momento não tem nenhum horário disponível, por favor tente em uma outra unidade.
              </div>
            ) : (
              datasDisponiveis.map((dt: string) => (
                <button
                  key={dt}
                  type="button"
                  className={`px-4 py-3 rounded-xl font-bold shadow transition-all duration-300 flex flex-col items-center justify-center
                    ${data === dt 
                      ? 'bg-moyo-primary text-white scale-105' 
                      : 'bg-white hover:bg-moyo-primary/10 text-gray-700 border border-gray-200'}`}
                  onClick={() => setData(dt)}
                >
                  <span className="text-lg font-bold">
                    {new Date(dt).getDate()}
                  </span>
                  <span className="text-xs">
                    {new Date(dt).toLocaleDateString('pt-BR', { month: 'short' })}
                  </span>
                </button>
              ))
            )}
          </div>
          
          {erro && (
            <div className="text-red-500 bg-red-50 p-3 rounded-lg animate-shake">
              {erro}
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <button
              onClick={onVoltar}
              className="px-6 py-2 rounded-lg font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="bg-moyo-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-moyo-secondary transition transform hover:scale-105 disabled:opacity-50"
              disabled={!data || loading}
            >
              {loading ? 'Aguarde...' : 'Finalizar Agendamento'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente TriagemModal
interface TriagemModalProps {
  show: boolean;
  onClose: () => void;
  onComplete: (respostas: Record<string, string | string[]>, urgencia: { nivel: string, cor: string }) => void;
  unidadeNome: string;
  loading: boolean;
}
// @ts-ignore
type SpeechRecognitionType = typeof window.SpeechRecognition extends undefined ? typeof window.webkitSpeechRecognition : typeof window.SpeechRecognition;
const TriagemModal: React.FC<TriagemModalProps> = ({
  show,
  onClose,
  onComplete,
  unidadeNome,
  loading
}) => {
  const [respostas, setRespostas] = useState<Record<string, string | string[]>>({});
  const [etapaTriagem, setEtapaTriagem] = useState(0);
  const [urgencia, setUrgencia] = useState<{ nivel: string, cor: string } | null>(null);

  const handleChange = (id: string, valor: string | string[]) => {
    setRespostas(prev => ({ ...prev, [id]: valor }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nivelUrgencia = calcularUrgencia(respostas);
    setUrgencia(nivelUrgencia);
    onComplete(respostas, nivelUrgencia);
  };

  const progresso = ((etapaTriagem + 1) / perguntasTriagem.length) * 100;

  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadein p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-popin">
        <div className="bg-moyo-primary text-white p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Triagem Digital</h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-sm">
            <span className="font-medium">Unidade:</span> {unidadeNome}
          </div>
        </div>
        
        <div className="p-1 bg-gray-200">
          <div 
            className="h-2 bg-moyo-secondary transition-all duration-500 ease-out"
            style={{ width: `${progresso}%` }}
          ></div>
        </div>
        
        <form 
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6"
        >
          {etapaTriagem < perguntasTriagem.length ? (
            <div className="space-y-8 animate-fadein">
              <div>
                <h4 className="text-sm font-semibold text-moyo-primary mb-1">
                  {perguntasTriagem[etapaTriagem].categoria}
                </h4>
                <h3 className="text-xl font-bold text-gray-800">
                  {perguntasTriagem[etapaTriagem].texto}
                </h3>
              </div>
              
              {perguntasTriagem[etapaTriagem].tipo === "select" && (
                <div className="space-y-4">
                  {perguntasTriagem[etapaTriagem]?.opcoes?.map((opcao, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                        respostas[perguntasTriagem[etapaTriagem].id] === opcao
                          ? 'border-moyo-primary bg-moyo-primary/10 text-moyo-primary font-bold'
                          : 'border-gray-200 hover:border-moyo-primary'
                      }`}
                      onClick={() => handleChange(perguntasTriagem[etapaTriagem].id, opcao)}
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              )}
              
              {perguntasTriagem[etapaTriagem].tipo === "multiselect" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {perguntasTriagem[etapaTriagem]?.opcoes?.map((opcao, index) => {
                    const respostaAtual = respostas[perguntasTriagem[etapaTriagem].id];
                    const selecionado = Array.isArray(respostaAtual) && respostaAtual.includes(opcao);
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`p-3 rounded-lg border transition-all duration-300 flex items-center ${
                          selecionado
                            ? 'border-moyo-primary bg-moyo-primary/10 text-moyo-primary font-bold'
                            : 'border-gray-200 hover:border-moyo-primary'
                        }`}
                        onClick={() => {
                          const respostasAtuais = Array.isArray(respostaAtual) ? respostaAtual : [];
                          let novasRespostas = [...respostasAtuais];
                          
                          if (selecionado) {
                            novasRespostas = novasRespostas.filter(r => r !== opcao);
                          } else {
                            if (opcao === "Nenhum destes") {
                              novasRespostas = [opcao];
                            } else {
                              novasRespostas = novasRespostas.filter(r => r !== "Nenhum destes");
                              novasRespostas.push(opcao);
                            }
                          }
                          
                          handleChange(perguntasTriagem[etapaTriagem].id, novasRespostas);
                        }}
                      >
                        <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                          selecionado ? 'bg-moyo-primary border-moyo-primary' : 'border-gray-400'
                        }`}>
                          {selecionado && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {opcao}
                      </button>
                    );
                  })}
                </div>
              )}
              
              {perguntasTriagem[etapaTriagem].tipo === "textarea" && (
                <div className="relative">
                  <textarea
                    className="w-full border border-gray-200 rounded-xl p-4 focus:ring focus:ring-moyo-primary focus:border-moyo-primary min-h-[120px] pr-12"
                    value={respostas[perguntasTriagem[etapaTriagem].id] || ""}
                    onChange={e => handleChange(perguntasTriagem[etapaTriagem].id, e.target.value)}
                    placeholder="Por favor, descreva em detalhes..."
                  />
                  <button
                    type="button"
                    className="absolute top-3 right-3 text-moyo-primary hover:text-moyo-secondary bg-white rounded-full p-2 shadow focus:outline-none"
                    title="Usar microfone"
                    onClick={() => {
                      // @ts-ignore
                      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                      if (!SpeechRecognition) {
                        alert('Reconhecimento de voz não suportado neste navegador.');
                        return;
                      }
                      const recognition = new SpeechRecognition();
                      recognition.lang = 'pt-BR';
                      recognition.interimResults = false;
                      recognition.maxAlternatives = 1;
                      recognition.onresult = (event: any) => {
                        const texto = event.results[0][0].transcript;
                        const atual = respostas[perguntasTriagem[etapaTriagem].id] || "";
                        handleChange(perguntasTriagem[etapaTriagem].id, (atual ? atual + ' ' : '') + texto);
                      };
                      recognition.onerror = (event: any) => {
                        alert('Erro no reconhecimento de voz: ' + event.error);
                      };
                      recognition.start();
                    }}
                  >
                    <i className="fas fa-microphone text-lg"></i>
                  </button>
                </div>
              )}
              
              <div className="flex justify-between">
                {etapaTriagem > 0 && (
                  <button
                    type="button"
                    onClick={() => setEtapaTriagem(prev => prev - 1)}
                    className="px-6 py-3 rounded-lg font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Voltar
                  </button>
                )}
                
                <button
                  type={etapaTriagem === perguntasTriagem.length - 1 ? "submit" : "button"}
                  onClick={() => {
                    if (etapaTriagem < perguntasTriagem.length - 1) {
                      setEtapaTriagem(prev => prev + 1);
                    }
                  }}
                  className="bg-moyo-primary text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-moyo-secondary transition ml-auto"
                  disabled={loading}
                >
                  {etapaTriagem === perguntasTriagem.length - 1 ? 'Finalizar Triagem' : 'Próxima'}
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fadein">
              <div className="text-center py-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Resultado da Triagem</h3>
                
                <div className="max-w-md mx-auto mb-8">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Baixa</span>
                    <span className="text-sm text-gray-600">Emergência</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${urgencia ? 
                          (urgencia.nivel === "Baixa" ? 25 : 
                           urgencia.nivel === "Média" ? 50 : 
                           urgencia.nivel === "Alta" ? 75 : 100) : 0}%`, 
                        backgroundColor: urgencia?.cor || '#16a34a'
                      }}
                    ></div>
                  </div>
                  
                  <div className="mt-4">
                    <span className={`px-4 py-2 rounded-full font-bold ${
                      urgencia?.nivel === "Baixa" ? "bg-green-100 text-green-800" :
                      urgencia?.nivel === "Média" ? "bg-yellow-100 text-yellow-800" :
                      urgencia?.nivel === "Alta" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"
                    }`}>
                      Nível de Urgência: {urgencia?.nivel}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
                  <h4 className="font-bold text-lg mb-3">Recomendações:</h4>
                  
                  {urgencia?.nivel === "Baixa" && (
                    <p>
                      Seus sintomas sugerem uma condição de baixa urgência. Recomendamos que você mantenha 
                      sua consulta agendada. Enquanto isso, descanse e monitore seus sintomas. Se houver 
                      qualquer piora, retorne para reavaliação.
                    </p>
                  )}
                  
                  {urgencia?.nivel === "Média" && (
                    <p>
                      Seus sintomas indicam uma condição de média urgência. Recomendamos que você procure 
                      atendimento dentro das próximas 24-48 horas. Enquanto isso, evite atividades 
                      extenuantes e monitore seus sintomas. Se houver piora, procure atendimento imediatamente.
                    </p>
                  )}
                  
                  {urgencia?.nivel === "Alta" && (
                    <p>
                      Seus sintomas sugerem uma condição de alta urgência. Recomendamos que você procure 
                      atendimento médico nas próximas 6-12 horas. Não dirija sozinho e evite qualquer 
                      esforço físico. Se possível, peça para alguém acompanhá-lo ao serviço de saúde.
                    </p>
                  )}
                  
                  {urgencia?.nivel === "Emergência" && (
                    <p className="text-red-700 font-medium">
                      <span className="font-bold">ATENÇÃO:</span> Seus sintomas indicam uma possível emergência médica. 
                      Recomendamos que você procure atendimento IMEDIATAMENTE. Não espere pela consulta 
                      agendada. Dirija-se ao serviço de emergência mais próximo ou ligue para o 112.
                    </p>
                  )}
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-2">Resumo dos sintomas:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {perguntasTriagem.map(pergunta => {
                        const resposta = respostas[pergunta.id];
                        if (!resposta) return null;
                        
                        return (
                          <li key={pergunta.id}>
                            <span className="font-medium">{pergunta.texto}:</span>{" "}
                            {Array.isArray(resposta) ? resposta.join(", ") : resposta}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setEtapaTriagem(0)}
                    className="px-6 py-3 rounded-lg font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Revisar Respostas
                  </button>
                  <button
                    type="button"
                    className="bg-moyo-primary text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-moyo-secondary transition"
                    disabled={loading}
                    onClick={() => {
                      if (urgencia) {
                        onComplete(respostas, urgencia);
                      }
                      setRespostas({});
                      setEtapaTriagem(0);
                      setUrgencia(null);
                      onClose();
                    }}
                  >
                    {loading ? 'Finalizando...' : 'Confirmar Agendamento'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Componente ConsultaCard
interface ConsultaCardProps {
  consulta: Consulta;
  onCancel: (id: number) => void;
  loading: boolean;
}
const ConsultaCard: React.FC<ConsultaCardProps> = ({ consulta, onCancel, loading }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={`border rounded-xl p-4 transition-all duration-300 ${expanded ? 'bg-white shadow-lg' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-moyo-primary">{consulta.status.charAt(0).toUpperCase() + consulta.status.slice(1)}</div>
          <div className="text-sm text-gray-600 mt-1">
            {new Date(consulta.data_hora).toLocaleString('pt-BR', {
              weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
          <div className="text-sm font-medium mt-1">{consulta.local || 'Local não informado'}</div>
          <div className="text-sm mt-1">Prioridade: {consulta.prioridade || 'Não definida'}</div>
          <div className="text-sm mt-1">Profissional: {consulta.profissional_id ? consulta.profissional_id : 'A ser definido'}</div>
        </div>
        <div className="flex items-center gap-2">
          {consulta.status === "pendente" && (
            <button
              onClick={() => onCancel(consulta.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-moyo-primary hover:text-moyo-secondary"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-fadein">
          <div className="flex items-center mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              consulta.status === "pendente" 
                ? "bg-yellow-100 text-yellow-800" 
                : consulta.status === "concluida"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            }`}>
              {consulta.status.charAt(0).toUpperCase() + consulta.status.slice(1)}
            </span>
            {consulta.prioridade && (
              <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Prioridade: {consulta.prioridade}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal
export default function ConsultasPaciente() {
  // Estados
  const [especialidade, setEspecialidade] = useState("");
  const [data, setData] = useState("");
  const [showTriagem, setShowTriagem] = useState(false);
  const [agendado, setAgendado] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [filtroData, setFiltroData] = useState<string>("");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [unidadesFiltradas, setUnidadesFiltradas] = useState<HospitalUnit[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-8.8383, 13.2344]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [etapaAgendamento, setEtapaAgendamento] = useState<number>(1);
  const [unidadesHospitalares, setUnidadesHospitalares] = useState<HospitalUnit[]>([]);

  // Obter consultas e localização ao carregar
  useEffect(() => {
    const user = localStorage.getItem("moyo-user");
    let pacienteId = null;
    if (user) {
      try {
        const parsed = JSON.parse(user);
        pacienteId = parsed.id;
      } catch {}
    }
    if (pacienteId) {
      getConsultasAPI(pacienteId).then(setConsultas);
    }
    obterLocalizacaoUsuario();
    // Buscar hospitais do backend
    getHospitaisAPI().then(setUnidadesHospitalares);
  }, []);

  // Obter localização do usuário
  const obterLocalizacaoUsuario = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(14);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
        }
      );
    } else {
      console.log("Geolocalização não suportada pelo navegador");
    }
  }, []);

  // Atualizar unidades filtradas quando especialidade mudar
  useEffect(() => {
    if (especialidade && userLocation) {
      const unidadesComEspecialidade = unidadesHospitalares.filter((unidade: HospitalUnit) =>
        parseEspecialidades(unidade.especialidades).some((esp: string) =>
          esp.toLowerCase().includes(especialidade.toLowerCase())
        )
      );

      const unidadesComDistancia = unidadesComEspecialidade.map((unidade: HospitalUnit) => ({
        ...unidade,
        distancia: calcularDistancia(
          userLocation[0],
          userLocation[1],
          unidade.lat,
          unidade.lng
        )
      })).sort((a: HospitalUnit, b: HospitalUnit) => (a.distancia || Infinity) - (b.distancia || Infinity));

      setUnidadesFiltradas(unidadesComDistancia);
    } else {
      setUnidadesFiltradas([]);
    }
  }, [especialidade, userLocation, unidadesHospitalares]);

  // Atualizar mapa quando unidade for selecionada
  useEffect(() => {
    if (unidadeSelecionada) {
      const unidade = unidadesHospitalares.find((u: HospitalUnit) => u.id === unidadeSelecionada);
      if (unidade) {
        setMapCenter([unidade.lat, unidade.lng]);
        setMapZoom(16);
      }
    }
  }, [unidadeSelecionada, unidadesHospitalares]);

  // Definir unidadeSelecionadaObj corretamente antes do uso
  const unidadeSelecionadaObj = unidadesHospitalares.find((u: HospitalUnit) => u.id === unidadeSelecionada) || null;

  // Manipuladores de eventos
  const handleSubmitAgendamento = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    if (!especialidade || !data || !unidadeSelecionada) {
      setErro("Preencha todos os campos.");
      return;
    }
    setShowTriagem(true);
  };

  const handleSelecionarUnidade = (id: string) => {
    setUnidadeSelecionada(id);
  };

  // Função para filtrar consultas por data e prioridade
  const filtrarConsultas = (consultas: Consulta[], filtroData: string, filtroPrioridade: string) => {
    return consultas.filter(c =>
      (!filtroData || c.data_hora.startsWith(filtroData)) &&
      (!filtroPrioridade || (c.prioridade || '').toLowerCase().includes(filtroPrioridade.toLowerCase()))
    );
  };

  const handleTriagemCompleta = (
    respostas: { [key: string]: string | string[] },
    urgencia: { nivel: string; cor: string }
  ) => {
    setLoading(true);
    setTimeout(() => {
      const user = localStorage.getItem("moyo-user");
      if (!user) return;
      const pacienteData = JSON.parse(user);
      // Montar consulta
      const novaConsulta: Partial<Consulta> = {
        data_hora: data ? (data.length === 10 ? data + 'T08:00:00' : data) : new Date().toISOString(),
        status: 'agendada',
        prioridade: urgencia.nivel,
        local: unidadeSelecionada ? (unidadesHospitalares.find((u: HospitalUnit) => u.id === unidadeSelecionada)?.nome || null) : null
      };
      saveConsultaAPI(Number(pacienteData.id), novaConsulta).then((consultaSalva) => {
        if (consultaSalva) setConsultas([consultaSalva, ...consultas]);
        setAgendado(true);
        setEspecialidade("");
        setData("");
        setUnidadeSelecionada(null);
        setEtapaAgendamento(1);
        setShowTriagem(false);
        setLoading(false);
        setTimeout(() => setAgendado(false), 3000);
      });
    }, 1500);
  };

  const handleCancelarConsulta = (id: number) => {
    setLoading(true);
    setTimeout(() => {
      const novas = consultas.map(c =>
        c.id === id ? { ...c, status: "cancelada" } : c
      );
      setConsultas(novas);
      setLoading(false);
    }, 1000);
  };

  const handleVoltarEtapa = () => {
    setEtapaAgendamento(prev => Math.max(1, prev - 1));
  };

  const handleContinuarEtapa = (etapa: number) => {
    setEtapaAgendamento(etapa);
  };

  // Filtrar consultas
  const pendentes = filtrarConsultas(consultas.filter(c => c.status === 'pendente'), filtroData, filtroPrioridade);
  const historico = filtrarConsultas(consultas.filter(c => c.status !== 'pendente'), filtroData, filtroPrioridade);

  // Função para exibir perguntas e respostas coloridas
  function renderPerguntasRespostas(triagem: Record<string, string | string[]>) {
    if (!triagem) return null;
    return (
      <div className="space-y-2 mt-2">
        {Object.entries(triagem).map(([pid, resposta], idx) => {
          const pergunta = perguntasTriagem.find(p => p.id === pid);
          return (
            <div key={pid} className="flex flex-col">
              <span className="font-semibold text-moyo-primary bg-moyo-primary/10 px-2 py-1 rounded-t-md">
                {pergunta ? pergunta.texto : pid}
              </span>
              <span className="bg-moyo-secondary/10 text-moyo-secondary px-2 py-1 rounded-b-md border-b border-moyo-secondary/20">
                {Array.isArray(resposta) ? resposta.join(", ") : resposta}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-full w-full overflow-y-auto flex-col bg-gradient-to-br from-moyo-primary/10 to-moyo-secondary/10 animate-fadein">
      {/* Header */}
      <header className="w-full py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between bg-moyo-primary text-white shadow-lg animate-slidein">
        <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Consultas
        </h2>
        <span className="text-base md:text-lg font-semibold mt-2 md:mt-0 animate-fadein">
          Agendamento Inteligente
        </span>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6 px-4 md:px-8 pt-6 animate-fadein">
        
        <input 
          type="date" 
          className="border rounded-lg px-3 py-2 shadow focus:ring focus:ring-moyo-primary flex-grow min-w-[180px]"
          value={filtroData} 
          onChange={e => setFiltroData(e.target.value)} 
        />
        
        <select 
          className="border rounded-lg px-3 py-2 shadow focus:ring focus:ring-moyo-primary flex-grow min-w-[180px]"
          value={filtroPrioridade} 
          onChange={e => setFiltroPrioridade(e.target.value)}
        >
          <option value="">Todas as Prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
        
        <button 
          className="px-4 py-2 rounded bg-moyo-secondary text-white font-bold shadow hover:bg-moyo-primary transition flex items-center"
          onClick={() => { setFiltroData(""); setFiltroPrioridade(""); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Limpar
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-8 pb-8">
        {/* Painel Esquerdo (Agendamento) */}
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-popin">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-moyo-primary">Agendar Nova Consulta</h3>
            <div className="flex items-center">
              {[1, 2, 3].map(etapa => (
                <React.Fragment key={etapa}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    etapaAgendamento === etapa 
                      ? 'bg-moyo-primary text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {etapa}
                  </div>
                  {etapa < 3 && (
                    <div className={`w-8 h-1 mx-[-2px] ${
                      etapaAgendamento > etapa ? 'bg-moyo-primary' : 'bg-gray-200'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <FormularioAgendamento
            etapa={etapaAgendamento}
            especialidade={especialidade}
            setEspecialidade={setEspecialidade}
            data={data}
            setData={setData}
            unidadeSelecionada={unidadeSelecionada}
            setUnidadeSelecionada={setUnidadeSelecionada}
            unidadesFiltradas={unidadesFiltradas}
            unidadesHospitalares={unidadesHospitalares}
            onVoltar={handleVoltarEtapa}
            onContinuar={handleContinuarEtapa}
            onSubmit={handleSubmitAgendamento}
            loading={loading}
            erro={erro}
            userLocation={userLocation ?? undefined}
          />
        </div>

        {/* Painel Direito (Mapa) */}
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-popin">
          <h3 className="text-xl font-bold text-moyo-primary mb-6">Localização das Unidades</h3>
          <MapaHospital
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            userLocation={userLocation ?? undefined}
            unidadesFiltradas={unidadesFiltradas}
            onSelectUnidade={handleSelecionarUnidade}
            unidadeSelecionada={unidadeSelecionada || undefined}
          />
          
          {unidadeSelecionadaObj && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fadein">
              <div className="font-bold text-blue-800">{unidadeSelecionadaObj.nome}</div>
              <div className="text-sm text-blue-700 mt-1">{unidadeSelecionadaObj.endereco}</div>
              <div className="mt-3">
                <div className="font-medium text-blue-800">Especialidades disponíveis:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {unidadeSelecionadaObj && parseEspecialidades(unidadeSelecionadaObj.especialidades).map(esp => (
                    <span key={esp} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consultas Pendentes */}
      <div className="px-4 md:px-8 pb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-popin">
          <h3 className="text-xl font-bold text-moyo-primary mb-6">Consultas Pendentes</h3>
          
          {pendentes.length === 0 ? (
            <div className="text-center py-12 text-gray-500 animate-fadein">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Nenhuma consulta pendente
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadein">
              {pendentes.map(consulta => (
                <ConsultaCard 
                  key={consulta.id} 
                  consulta={consulta} 
                  onCancel={handleCancelarConsulta}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Histórico de Consultas */}
      <div className="px-4 md:px-8 pb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-popin">
          <h3 className="text-xl font-bold text-moyo-primary mb-6">Histórico de Consultas</h3>
          
          {historico.length === 0 ? (
            <div className="text-center py-12 text-gray-500 animate-fadein">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Nenhum histórico de consultas
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 animate-fadein">
              {historico.map(consulta => (
                <ConsultaCard 
                  key={consulta.id} 
                  consulta={consulta} 
                  onCancel={handleCancelarConsulta}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Triagem */}
      <TriagemModal
        show={showTriagem}
        onClose={() => setShowTriagem(false)}
        onComplete={handleTriagemCompleta}
        unidadeNome={unidadeSelecionadaObj?.nome || ""}
        loading={loading}
      />

      {/* Notificação de Agendamento */}
      {agendado && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl flex items-center animate-fadein z-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Consulta agendada com sucesso!</span>
        </div>
      )}
    </div>
  );
}