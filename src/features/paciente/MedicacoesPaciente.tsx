import React, { useState, useEffect } from "react";

interface Medicacao {
  id: string;
  nome: string;
  dosagem: string;
  status: "atual" | "finalizada" | "removida";
}

function getMedicacoes(): Medicacao[] {
  try {
    return JSON.parse(localStorage.getItem("moyo-medicacoes") || "[]");
  } catch {
    return [];
  }
}

function saveMedicacoes(meds: Medicacao[]) {
  localStorage.setItem("moyo-medicacoes", JSON.stringify(meds));
}

export default function MedicacoesPaciente() {
  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([]);
  const [adicionada, setAdicionada] = useState(false);

  useEffect(() => {
    setMedicacoes(getMedicacoes());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: Medicacao = {
      id: Date.now().toString(),
      nome,
      dosagem,
      status: "atual",
    };
    const novas = [nova, ...medicacoes];
    setMedicacoes(novas);
    saveMedicacoes(novas);
    setAdicionada(true);
    setNome("");
    setDosagem("");
    setTimeout(() => setAdicionada(false), 2000);
  };

  const handleRemover = (id: string) => {
    const novas = medicacoes.map(m => m.id === id ? { ...m, status: "removida" as const } : m);
    setMedicacoes(novas);
    saveMedicacoes(novas);
  };

  const atuais = Array.isArray(medicacoes) ? medicacoes.filter(m => m.status === "atual") : [];
  const historico = Array.isArray(medicacoes) ? medicacoes.filter(m => m.status !== "atual") : [];

  return (
    <div className="flex-1 w-full flex flex-col min-h-full p-4">
      <h2 className="text-2xl font-bold text-moyo-primary mb-4 flex items-center gap-2">
        <i className="fas fa-pills"></i> Medicações
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="bg-white rounded-xl shadow p-6 mb-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Adicionar Medicação</h3>
          {adicionada ? (
            <div className="text-green-600 font-bold">Medicação adicionada!</div>
          ) : (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="block font-medium mb-1">Nome do Medicamento</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Dosagem</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" value={dosagem} onChange={e => setDosagem(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-moyo-primary text-white px-6 py-2 rounded-lg font-bold mt-2 hover:bg-moyo-secondary transition">Adicionar</button>
              </div>
            </form>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Medicações Atuais</h3>
          {atuais.length === 0 ? (
            <div className="text-moyo-gray">Nenhuma medicação cadastrada.</div>
          ) : (
            <ul className="space-y-3">
              {atuais.map(m => (
                <li key={m.id} className="flex items-center justify-between bg-moyo-primary/5 rounded-lg px-3 py-2">
                  <div>
                    <span className="font-semibold">{m.nome}</span> <span className="text-sm text-moyo-gray">{m.dosagem}</span>
                  </div>
                  <button onClick={() => handleRemover(m.id)} className="text-red-500 hover:underline text-sm">Remover</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Card extra para ocupar o grid */}
        <div className="bg-transparent shadow-none p-6 w-full"></div>
      </div>
      {/* Histórico de Medicações */}
      <div className="bg-white rounded-xl shadow p-6 w-full mt-6">
        <h3 className="text-lg font-semibold mb-2">Histórico de Medicações</h3>
        {historico.length === 0 ? (
          <div className="text-moyo-gray">Nenhum histórico disponível.</div>
        ) : (
          <ul className="space-y-3">
            {historico.map(m => (
              <li key={m.id} className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2">
                <div>
                  <span className="font-semibold">{m.nome}</span> <span className="text-sm text-moyo-gray">{m.dosagem}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${m.status === "removida" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {m.status === "removida" ? "Removida" : "Finalizada"}
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
