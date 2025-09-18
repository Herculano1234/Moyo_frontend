import React, { useState, useEffect } from "react";

interface Exame {
  id: number;
  nome: string;
  data_hora: string;
  status: string;
  disponivel: boolean;
  paciente_id?: number;
  hospital_id?: number;
  profissional_id?: number;
  resultado?: string;
  observacoes?: string;
}

export default function ExamesPaciente() {
  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [exames, setExames] = useState<Exame[]>([]);
  const [agendado, setAgendado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pacienteId = localStorage.getItem("moyo-user-id");
  const hospitalId = localStorage.getItem("moyo-hospital-id");

  // Buscar exames do banco de dados
  useEffect(() => {
    const fetchExames = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/exames/paciente/${pacienteId}`
        );
        if (!response.ok) throw new Error("Erro ao buscar exames");
        const data = await response.json();
        setExames(data);
      } catch (error) {
        console.error("Erro:", error);
        setError("Erro ao carregar exames");
      } finally {
        setLoading(false);
      }
    };

    if (pacienteId) {
      fetchExames();
    }
  }, [pacienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/exames`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: tipo,
          data_hora: new Date(data).toISOString(),
          status: "pendente",
          disponivel: true,
          paciente_id: pacienteId,
          hospital_id: hospitalId,
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar exame");

      const novoExame = await response.json();
      setExames([novoExame, ...exames]);
      setAgendado(true);
      setTipo("");
      setData("");
      setTimeout(() => setAgendado(false), 2000);
    } catch (error) {
      console.error("Erro:", error);
      setError("Erro ao solicitar exame");
    }
  };

  const handleCancelar = async (id: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/exames/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelado",
        }),
      });

      if (!response.ok) throw new Error("Erro ao cancelar exame");

      setExames(
        exames.map((exame) => (exame.id === id ? { ...exame, status: "cancelado" } : exame))
      );
    } catch (error) {
      console.error("Erro:", error);
      setError("Erro ao cancelar exame");
    }
  };

  if (!pacienteId) {
    return <div className="text-red-500">Erro: Usuário não identificado. Por favor, faça login novamente.</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moyo-primary"></div>
      </div>
    );
  }

  if (error) return <div className="text-red-500">{error}</div>;

  const pendentes = exames.filter((e) => e.status === "pendente");
  const historico = exames.filter((e) => e.status !== "pendente");

  return (
    <div className="flex-1 w-full flex flex-col min-h-full p-4 ">
      <h2 className="text-2xl font-bold text-moyo-primary mb-4 flex items-center gap-2">
        <i className="fas fa-vials"></i> Exames
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="bg-white rounded-xl shadow p-6 mb-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Solicitar Novo Exame</h3>
          {agendado ? (
            <div className="text-green-600 font-bold">
              Exame solicitado com sucesso!
            </div>
          ) : (
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block font-medium mb-1">Tipo de Exame</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  <option>Hemograma</option>
                  <option>Raio-X</option>
                  <option>Ultrassom</option>
                  <option>ECG</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Data</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-moyo-primary text-white px-6 py-2 rounded-lg font-bold mt-2 hover:bg-moyo-secondary transition"
                >
                  Solicitar
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Exames Pendentes</h3>
          {pendentes.length === 0 ? (
            <div className="text-moyo-gray">Nenhum exame pendente.</div>
          ) : (
            <ul className="space-y-3">
              {pendentes.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between bg-moyo-primary/5 rounded-lg px-3 py-2"
                >
                  <div>
                    <span className="font-semibold">{e.nome}</span>{" "}
                    <span className="text-sm text-moyo-gray">({new Date(e.data_hora).toLocaleString()})</span>
                  </div>
                  <button
                    onClick={() => handleCancelar(e.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Cancelar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Card extra para ocupar o grid */}
        <div className="bg-transparent shadow-none p-6 w-full"></div>
      </div>
      {/* Histórico de Exames */}
      <div className="bg-white rounded-xl shadow p-6 w-full mt-6">
        <h3 className="text-lg font-semibold mb-2">Histórico de Exames</h3>
        {historico.length === 0 ? (
          <div className="text-moyo-gray">Nenhum histórico disponível.</div>
        ) : (
          <ul className="space-y-3">
            {historico.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2"
              >
                <div>
                  <span className="font-semibold">{e.nome}</span>{" "}
                  <span className="text-sm text-moyo-gray">({new Date(e.data_hora).toLocaleString()})</span>
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded ${
                      e.status === "cancelado"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {e.status === "cancelado" ? "Cancelado" : "Concluído"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
