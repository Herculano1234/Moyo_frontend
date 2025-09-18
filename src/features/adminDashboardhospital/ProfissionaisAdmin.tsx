import React, { useState } from "react";

interface Professional {
  id: number;
  name: string;
  specialty: string;
  status: "active" | "pending";
  email: string;
  phone: string;
  completedAppointments: number;
  scheduledAppointments: number;
  rating: number;
  reviews: Review[];
}

interface Review {
  id: number;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

const ProfissionaisAdmin: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const unidadeHospitalar = "Hospital Central"; // Exemplo: defina o nome ou id real da unidade do admin logado
  const apiHost = "https://moyo-backend.vercel.app";

  React.useEffect(() => {
    async function fetchProfessionals() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${apiHost}/profissionais?unidade=${encodeURIComponent(unidadeHospitalar)}`);
        if (!response.ok) {
          setError("Erro ao buscar profissionais.");
          setProfessionals([]);
          setLoading(false);
          return;
        }
        const data = await response.json();
        setProfessionals(data);
      } catch {
        setError("Erro de conexão com o servidor.");
        setProfessionals([]);
      }
      setLoading(false);
    }
    fetchProfessionals();
  }, [unidadeHospitalar]);

  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfessional, setNewProfessional] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: ""
  });

  const handleAddProfessional = () => {
    if (newProfessional.name && newProfessional.specialty && newProfessional.email) {
      const newProf: Professional = {
        id: professionals.length + 1,
        name: newProfessional.name,
        specialty: newProfessional.specialty,
        status: "pending",
        email: newProfessional.email,
        phone: newProfessional.phone,
        completedAppointments: 0,
        scheduledAppointments: 0,
        rating: 0,
        reviews: []
      };
      
      setProfessionals([...professionals, newProf]);
      setNewProfessional({ name: "", specialty: "", email: "", phone: "" });
      setShowAddForm(false);
    }
  };

  const handleAcceptProfessional = (id: number) => {
    // Aprovar profissional via backend
    fetch(`/profissionais/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "aprovado" })
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao aprovar profissional.");
        return res.json();
      })
      .then(() => {
        setProfessionals(professionals.map(prof =>
          prof.id === id ? { ...prof, status: "active" } : prof
        ));
      })
      .catch(() => {
        setError("Erro ao aprovar profissional.");
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProfessional({ ...newProfessional, [name]: value });
  };

  return (
    <div className="p-6">
      {loading && (
        <div className="text-center py-8 text-blue-600 font-semibold">Carregando profissionais...</div>
      )}
      {error && (
        <div className="text-center py-4 text-red-500 font-semibold">{error}</div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Gerenciamento de Profissionais</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          onClick={() => setShowAddForm(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Adicionar Profissional
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Adicionar Novo Profissional</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={newProfessional.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Especialidade</label>
                <input
                  type="text"
                  name="specialty"
                  value={newProfessional.specialty}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newProfessional.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="text"
                  name="phone"
                  value={newProfessional.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleAddProfessional}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Lista de Profissionais</h2>
            <div className="space-y-3">
              {professionals.map(professional => (
                <div
                  key={professional.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedProfessional?.id === professional.id
                      ? "bg-blue-100 border-l-4 border-blue-600"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedProfessional(professional)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{professional.name}</h3>
                      <p className="text-sm text-gray-600">{professional.specialty}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        professional.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {professional.status === "active" ? "Ativo" : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Cadastros Pendentes</h2>
            {professionals.filter(p => p.status === "pending").length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum cadastro pendente</p>
            ) : (
              <div className="space-y-3">
                {professionals
                  .filter(p => p.status === "pending")
                  .map(professional => (
                    <div key={professional.id} className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{professional.name}</h3>
                          <p className="text-sm text-gray-600">{professional.specialty}</p>
                        </div>
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                          onClick={() => handleAcceptProfessional(professional.id)}
                        >
                          Aceitar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedProfessional ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">{selectedProfessional.name}</h2>
                  <p className="text-gray-600">{selectedProfessional.specialty}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedProfessional.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedProfessional.status === "active" ? "Ativo" : "Pendente"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Informações de Contato</h3>
                  <p className="text-gray-600">Email: {selectedProfessional.email}</p>
                  <p className="text-gray-600">Telefone: {selectedProfessional.phone}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Estatísticas</h3>
                  <p className="text-gray-600">Consultas realizadas: {selectedProfessional.completedAppointments}</p>
                  <p className="text-gray-600">Consultas agendadas: {selectedProfessional.scheduledAppointments}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-gray-600 mr-2">Avaliação:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 ${
                            i < Math.floor(selectedProfessional.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-gray-600">
                        ({selectedProfessional.rating.toFixed(1)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Avaliações dos Pacientes</h3>
                {selectedProfessional.reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma avaliação ainda</p>
                ) : (
                  <div className="space-y-4">
                    {selectedProfessional.reviews.map(review => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{review.patientName}</h4>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 ${
                                i < review.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="mt-4">Selecione um profissional para ver os detalhes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfissionaisAdmin;
