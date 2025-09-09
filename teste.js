import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ... (restante das constantes e interfaces permanecem iguais) ...

// Componente ConsultaCard com props tipadas
interface ConsultaCardProps {
  consulta: Consulta;
  onCancel: (id: string) => void;
  loading: boolean;
}

const ConsultaCard = ({ consulta, onCancel, loading }: ConsultaCardProps) => {
  // ... (implementação do componente permanece igual) ...
};

// Componente principal
export default function ConsultasPaciente() {
  // Estados com tipagem corrigida
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [unidadesFiltradas, setUnidadesFiltradas] = useState<HospitalUnit[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string | null>(null);
  
  // ... (restante dos estados) ...

  // Função com parâmetro tipado
  const handleContinuarEtapa = (etapa: number) => {
    setEtapaAgendamento(etapa);
  };

  // ... (restante do código permanece igual) ...
}