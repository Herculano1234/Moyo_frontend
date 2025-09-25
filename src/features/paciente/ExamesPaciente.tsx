// Componente FormularioAgendamento adaptado do ConsultasPaciente.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
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
  // Buscar exames_disponiveis de todas as unidades (hospitais)
  const examesDisponiveis = useMemo(() => {
    // Cada unidade pode ter exames_disponiveis como string (CSV) ou array
    const todas = unidadesHospitalares.flatMap((u: HospitalUnit) => {
      if (Array.isArray(u.exames_disponiveis)) {
        return u.exames_disponiveis;
      }
      if (typeof u.exames_disponiveis === 'string') {
        return u.exames_disponiveis.split(',').map(e => e.trim()).filter(e => e);
      }
      return [];
    });
    return Array.from(new Set(todas));
  }, [unidadesHospitalares]);
  // Filtrar unidades que oferecem o exame selecionado
  const unidadesComExame = useMemo(() => {
    if (!especialidade) return [];
    return unidadesHospitalares.filter((unidade: HospitalUnit) => {
      if (Array.isArray(unidade.exames_disponiveis)) {
        return unidade.exames_disponiveis.map(e => e.toLowerCase()).includes(especialidade.toLowerCase());
      }
      if (typeof unidade.exames_disponiveis === 'string') {
        return unidade.exames_disponiveis.split(',').map(e => e.trim().toLowerCase()).includes(especialidade.toLowerCase());
      }
      return false;
    });
  }, [especialidade, unidadesHospitalares]);
  const unidadesComDistancia = useMemo(() => {
    if (!userLocation) return unidadesComExame;
    return unidadesComExame.map((unidade: HospitalUnit) => ({
      ...unidade,
      distancia: calcularDistancia(
        userLocation[0],
        userLocation[1],
        unidade.lat,
        unidade.lng
      )
    })).sort((a: HospitalUnit, b: HospitalUnit) => (a.distancia || Infinity) - (b.distancia || Infinity));
  }, [unidadesComExame, userLocation]);
  // Buscar horários disponíveis da unidade selecionada
  const datasDisponiveis = useMemo(() => {
    if (!unidadeSelecionada) return [];
    const unidade = unidadesHospitalares.find((u: HospitalUnit) => u.id === unidadeSelecionada);
    // Se unidade tiver datasDisponiveis, retorna
    if (unidade && Array.isArray(unidade.datasDisponiveis)) {
      return unidade.datasDisponiveis;
    }
    // Se unidade tiver horarios_atendimento_exames, retorna os horários
    if (unidade && unidade.horarios_atendimento_exames && Array.isArray(unidade.horarios_atendimento_exames)) {
      // Supondo que seja um array de strings ou objetos com campo horario
      return unidade.horarios_atendimento_exames.map(h => typeof h === 'string' ? h : h.horario);
    }
    return [];
  }, [unidadeSelecionada, unidadesHospitalares]);
  return (
    <div className="space-y-6">
      {etapa === 1 && (
        <div className="space-y-4 animate-fadein">
          <h4 className="font-bold text-lg text-gray-700">Selecione o exame</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {examesDisponiveis.slice(0, 12).map((exame: string) => (
              <button
                key={exame}
                type="button"
                className={`w-full px-3 py-2 rounded-lg font-medium text-sm shadow transition-all duration-300 flex items-center justify-center
                  ${especialidade === exame 
                    ? 'bg-moyo-primary text-white scale-105' 
                    : 'bg-white hover:bg-moyo-primary/10 text-gray-700 border border-gray-200'}`}
                onClick={() => setEspecialidade(exame)}
              >
                {exame}
              </button>
            ))}
          </div>
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
              Alterar exame
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
                  {parseEspecialidades(unidade.especialidades).slice(0, 3).map(esp => (
                    <span key={esp} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
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
// (removed duplicate import)
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface HospitalUnit {
  id: string;
  nome: string;
  lat: number;
  lng: number;
  endereco: string;
  especialidades: string;
  datasDisponiveis?: string[];
  distancia?: number;
  exames_disponiveis?: string[] | string;
  horarios_atendimento_exames?: Array<string | { horario: string }>;
}

interface Exame {
  id: number;
  status: string;
  data_hora: string;
  prioridade?: string;
  local?: string;
  profissional_id?: string;
}

function parseEspecialidades(especialidades: string): string[] {
  if (!especialidades) return [];
  return especialidades.split(',').map(e => e.trim());
}

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat)/2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon))/2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

async function getHospitaisAPI() {
  try {
    const resp = await fetch(`https://moyo-backend.vercel.app/hospitais`);
    if (!resp.ok) throw new Error('Erro ao buscar hospitais');
    return await resp.json();
  } catch {
    return [];
  }
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ExameCard({ exame, onCancel, loading }: { exame: Exame, onCancel: (id: number) => void, loading: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`border rounded-xl p-4 transition-all duration-300 ${expanded ? 'bg-white shadow-lg' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-moyo-primary">{exame.status.charAt(0).toUpperCase() + exame.status.slice(1)}</div>
          <div className="text-sm text-gray-600 mt-1">
            {new Date(exame.data_hora).toLocaleString('pt-BR', {
              weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
          <div className="text-sm font-medium mt-1">{exame.local || 'Local não informado'}</div>
          <div className="text-sm mt-1">Prioridade: {exame.prioridade || 'Não definida'}</div>
          <div className="text-sm mt-1">Profissional: {exame.profissional_id ? exame.profissional_id : 'A ser definido'}</div>
        </div>
        <div className="flex items-center gap-2">
          {exame.status === "pendente" && (
            <button
              onClick={() => onCancel(exame.id)}
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
              exame.status === "pendente" 
                ? "bg-yellow-100 text-yellow-800" 
                : exame.status === "concluida"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            }`}>
              {exame.status.charAt(0).toUpperCase() + exame.status.slice(1)}
            </span>
            {exame.prioridade && (
              <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Prioridade: {exame.prioridade}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MapaHospital({ mapCenter, mapZoom, userLocation, unidadesFiltradas, onSelectUnidade, unidadeSelecionada }: {
  mapCenter: [number, number];
  mapZoom: number;
  userLocation?: [number, number];
  unidadesFiltradas: HospitalUnit[];
  onSelectUnidade: (id: string) => void;
  unidadeSelecionada?: string;
}) {
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
          <Marker position={userLocation} icon={hospitalIcon}>
            <Popup className="font-bold">Sua localização</Popup>
          </Marker>
        )}
        {unidadesFiltradas.filter(
          (unidade) =>
            typeof unidade.lat === 'number' &&
            typeof unidade.lng === 'number' &&
            !isNaN(unidade.lat) &&
            !isNaN(unidade.lng)
        ).map((unidade) => (
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
                  <span className="font-medium">Exames disponíveis:</span> 
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseEspecialidades(unidade.especialidades).slice(0, 3).map((esp) => (
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
}

export default function ExamesPaciente() {
  // Handler for agendamento form submission
  const handleSubmitAgendamento = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    if (!especialidade || !data || !unidadeSelecionada) {
      setErro("Preencha todos os campos.");
      return;
    }
    // Aqui você pode adicionar lógica de agendamento de exame
    setAgendado(true);
    setTimeout(() => setAgendado(false), 3000);
    setEspecialidade("");
    setData("");
    setUnidadeSelecionada(null);
    setEtapaAgendamento(1);
  };
  const [especialidade, setEspecialidade] = useState("");
  const [data, setData] = useState("");
  const [agendado, setAgendado] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [exames, setExames] = useState<Exame[]>([]);
  const [filtroData, setFiltroData] = useState<string>("");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [unidadesFiltradas, setUnidadesFiltradas] = useState<HospitalUnit[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-8.8383, 13.2344]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [unidadesHospitalares, setUnidadesHospitalares] = useState<HospitalUnit[]>([]);
  const [etapaAgendamento, setEtapaAgendamento] = useState<number>(1);

  useEffect(() => {
    obterLocalizacaoUsuario();
    getHospitaisAPI().then(setUnidadesHospitalares);
    // TODO: buscar exames do paciente
  }, []);

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

  useEffect(() => {
    if (userLocation) {
      const unidadesComDistancia = unidadesHospitalares.map((unidade) => ({
        ...unidade,
        distancia: calcularDistancia(
          userLocation[0],
          userLocation[1],
          unidade.lat,
          unidade.lng
        )
      })).sort((a, b) => (a.distancia || Infinity) - (b.distancia || Infinity));
      setUnidadesFiltradas(unidadesComDistancia);
    } else {
      setUnidadesFiltradas(unidadesHospitalares);
    }
  }, [userLocation, unidadesHospitalares]);

  useEffect(() => {
    if (unidadeSelecionada) {
      const unidade = unidadesHospitalares.find((u) => u.id === unidadeSelecionada);
      if (unidade) {
        setMapCenter([unidade.lat, unidade.lng]);
        setMapZoom(16);
      }
    }
  }, [unidadeSelecionada, unidadesHospitalares]);

  const unidadeSelecionadaObj = unidadesHospitalares.find((u) => u.id === unidadeSelecionada) || null;

  const handleCancelarExame = (id: number) => {
    setLoading(true);
    setTimeout(() => {
      const novas = exames.map(e =>
        e.id === id ? { ...e, status: "cancelada" } : e
      );
      setExames(novas);
      setLoading(false);
    }, 1000);
  };

  const filtrarExames = (exames: Exame[], filtroData: string, filtroPrioridade: string) => {
    return exames.filter(e =>
      (!filtroData || e.data_hora.startsWith(filtroData)) &&
      (!filtroPrioridade || (e.prioridade || '').toLowerCase().includes(filtroPrioridade.toLowerCase()))
    );
  };

  const pendentes = filtrarExames(exames.filter(e => e.status === 'pendente'), filtroData, filtroPrioridade);
  const historico = filtrarExames(exames.filter(e => e.status !== 'pendente'), filtroData, filtroPrioridade);

  return (
    <div className="min-h-full w-full overflow-y-auto flex-col bg-gradient-to-br from-moyo-primary/10 to-moyo-secondary/10 animate-fadein">
      <header className="w-full py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between bg-moyo-primary text-white shadow-lg animate-slidein">
        <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Exames
        </h2>
        <span className="text-base md:text-lg font-semibold mt-2 md:mt-0 animate-fadein">
          Agendamento de Exames
        </span>
      </header>

      {/* Formulário de agendamento e mapa lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-8 pb-8">
        {/* Coluna 1: Formulário de agendamento */}
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-popin">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-moyo-primary">Agendar Novo Exame</h3>
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
          <form onSubmit={handleSubmitAgendamento}>
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
              onVoltar={() => setEtapaAgendamento(prev => Math.max(1, prev - 1))}
              onContinuar={(etapa: number) => setEtapaAgendamento(etapa)}
              onSubmit={handleSubmitAgendamento}
              loading={loading}
              erro={erro}
              userLocation={userLocation ?? undefined}
            />
          </form>
        </div>
        {/* Coluna 2: Mapa */}
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-popin">
          <h3 className="text-xl font-bold text-moyo-primary mb-6">Localização das Unidades</h3>
          <MapaHospital
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            userLocation={userLocation ?? undefined}
            unidadesFiltradas={unidadesFiltradas}
            onSelectUnidade={setUnidadeSelecionada}
            unidadeSelecionada={unidadeSelecionada || undefined}
          />
          {unidadeSelecionadaObj && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fadein">
              <div className="font-bold text-blue-800">{unidadeSelecionadaObj.nome}</div>
              <div className="text-sm text-blue-700 mt-1">{unidadeSelecionadaObj.endereco}</div>
              <div className="mt-3">
                <div className="font-medium text-blue-800">Exames disponíveis:</div>
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

      <div className="px-4 md:px-8 pb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-popin">
          <h3 className="text-xl font-bold text-moyo-primary mb-6">Exames Pendentes</h3>
          {pendentes.length === 0 ? (
            <div className="text-center py-12 text-gray-500 animate-fadein">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Nenhum exame pendente
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadein">
              {pendentes.map(exame => (
                <ExameCard 
                  key={exame.id} 
                  exame={exame} 
                  onCancel={handleCancelarExame}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 md:px-8 pb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-popin">
          <h3 className="text-xl font-bold text-moyo-primary mb-6">Histórico de Exames</h3>
          {historico.length === 0 ? (
            <div className="text-center py-12 text-gray-500 animate-fadein">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Nenhum histórico de exames
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 animate-fadein">
              {historico.map(exame => (
                <ExameCard 
                  key={exame.id} 
                  exame={exame} 
                  onCancel={handleCancelarExame}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {agendado && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl flex items-center animate-fadein z-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Exame agendado com sucesso!</span>
        </div>
      )}
    </div>
  );
}

// ...existing code...