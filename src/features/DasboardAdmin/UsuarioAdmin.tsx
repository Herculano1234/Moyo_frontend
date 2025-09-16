import React, { useState, useEffect } from "react";
import axios from "axios";

// Configurar baseURL do axios para backend local
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = 'http://moyo-backend.vercel.app';
}

interface Usuario {
  id: number;
  nome_admi: string;
  data_nascimento: string;
  senha: string;
  telefone: string;
  email: string;
  foto_perfil: string;
}

interface AdminFormData {
  nome_admi: string;
  data_nascimento: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  email: string;
  foto_perfil: File | null;
}

const initialForm: AdminFormData = {
  nome_admi: "",
  data_nascimento: "",
  senha: "",
  confirmarSenha: "",
  telefone: "",
  email: "",
  foto_perfil: null
};

const UsuarioAdmin: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<AdminFormData>(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);

  // Buscar usuários do backend
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/administradores_hospital");
      setUsuarios(response.data);
    } catch (err) {
      setError("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, foto_perfil: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não coincidem");
      setFormLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('nome', form.nome_admi);
    formData.append('data_nascimento', form.data_nascimento);
    formData.append('telefone', form.telefone);
    formData.append('email', form.email);
    formData.append('senha', form.senha);
    // O backend espera 'foto_url', não 'foto_perfil'
    if (form.foto_perfil) {
      formData.append('foto_url', form.foto_perfil);
    }

    try {
      if (editMode && currentUsuario) {
        await axios.put(`/administradores_hospital/${currentUsuario.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post("/administradores_hospital", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setSuccess(true);
      setForm(initialForm);
      fetchUsuarios(); // Recarregar a lista
      
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setEditMode(false);
        setCurrentUsuario(null);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao processar a solicitação.");
    }
    setFormLoading(false);
  };

  const handleEdit = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setForm({
      nome_admi: usuario.nome_admi,
      data_nascimento: usuario.data_nascimento,
      senha: "",
      confirmarSenha: "",
      telefone: usuario.telefone,
      email: usuario.email,
      foto_perfil: null
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!usuarioToDelete) return;
    
    try {
      await axios.delete(`/administradores_hospital/${usuarioToDelete.id}`);
      setShowDeleteModal(false);
      setUsuarioToDelete(null);
      fetchUsuarios(); // Recarregar a lista
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao excluir usuário.");
    }
  };

  const openDeleteModal = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentUsuario(null);
    setForm(initialForm);
    setError("");
  };

  // Filtrar usuários com base no termo de busca
  const filteredUsuarios = usuarios.filter(usuario =>
    (usuario.nome_admi?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (usuario.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Gestão de Usuários</h1>
        <div className="flex flex-wrap gap-3">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus mr-2"></i> Novo Usuário
          </button>
          
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center">
            <i className="fas fa-print mr-2"></i> Imprimir
          </button>
          
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
            <i className="fas fa-download mr-2"></i> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Total de Usuários</h3>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{usuarios.length}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Usuários Ativos</h3>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
            {usuarios.length} {/* Ajuste conforme necessário */}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Novos (30 dias)</h3>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
            {usuarios.length} {/* Ajuste conforme necessário */}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="relative mb-4">
            <input 
              type="text" 
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
              placeholder="Buscar usuários por nome ou email..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Nascimento</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <i className="fas fa-spinner fa-spin text-blue-500 mr-2"></i>
                    Carregando...
                  </td>
                </tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={usuario.foto_perfil || "https://via.placeholder.com/40"} 
                            alt={usuario.nome_admi}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{usuario.nome_admi}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.telefone || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.data_nascimento ? new Date(usuario.data_nascimento).toLocaleDateString('pt-BR') : "-"}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.nome_hospital}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => handleEdit(usuario)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => openDeleteModal(usuario)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de adicionar/editar usuário */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-0 overflow-hidden relative animate-slideUp flex flex-col h-[90vh] md:h-auto">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl transition-colors z-10" 
              onClick={closeModal}
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white flex items-center gap-4 min-h-[80px]">
              <i className="fas fa-user-md text-3xl"></i>
              <div>
                <h2 className="text-2xl font-bold">
                  {editMode ? 'Editar Administrador' : 'Adicionar Administrador Hospitalar'}
                </h2>
                <p className="text-sm opacity-80">
                  {editMode ? 'Atualize os dados do administrador' : 'Preencha todos os campos obrigatórios para registrar o administrador.'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white animate-fadeIn">
              {/* Coluna 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    name="nome_admi"
                    placeholder="Nome completo"
                    value={form.nome_admi}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                
                {/* Campo removido: Número do Bilhete */}
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Telefone *</label>
                  <input
                    type="text"
                    name="telefone"
                    placeholder="Telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Data de Nascimento *</label>
                  <input
                    type="date"
                    name="data_nascimento"
                    value={form.data_nascimento}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
              </div>
              
              {/* Coluna 2 */}
              <div className="space-y-4">
                {/* Campo removido: Nome do Hospital */}
                
                {/* Campo removido: Localização do Hospital */}
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Foto de Perfil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                
                {!editMode && (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Senha *</label>
                      <input
                        type="password"
                        name="senha"
                        placeholder="Senha"
                        value={form.senha}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                        required={!editMode}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Confirmar Senha *</label>
                      <input
                        type="password"
                        name="confirmarSenha"
                        placeholder="Confirmar senha"
                        value={form.confirmarSenha}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                        required={!editMode}
                      />
                    </div>
                  </>
                )}
              </div>
              
              {/* Mensagens de erro/sucesso */}
              {error && (
                <div className="col-span-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="col-span-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  {editMode ? 'Administrador atualizado com sucesso!' : 'Administrador adicionado com sucesso!'}
                </div>
              )}
              
              {/* Botão de submit */}
              <div className="col-span-2 flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {editMode ? 'Salvando...' : 'Adicionando...'}
                    </>
                  ) : (
                    editMode ? 'Salvar Alterações' : 'Adicionar Administrador'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && usuarioToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl" 
              onClick={() => setShowDeleteModal(false)}
            >
              <i className="fas fa-times"></i>
            </button>
            
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o usuário <strong>{usuarioToDelete.nome_admi}</strong>? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={handleDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuarioAdmin;