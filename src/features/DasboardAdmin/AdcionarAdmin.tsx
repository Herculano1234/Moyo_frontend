import React, { useState } from "react";
import axios from "axios";
const AdcionarAdmin: React.FC = () => {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    foto_url: "",
    data_nascimento: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await axios.post("/administradores_hospital", form);
      setSuccess(true);
      setForm({
        nome: "",
        email: "",
        telefone: "",
        foto_url: "",
        data_nascimento: "",
        senha: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao adicionar administrador.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Adicionar Administrador Hospitalar</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={form.nome}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="telefone"
          placeholder="Telefone"
          value={form.telefone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="foto_url"
          placeholder="URL da Foto"
          value={form.foto_url}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          name="data_nascimento"
          placeholder="Data de Nascimento"
          value={form.data_nascimento}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-bold"
          disabled={loading}
        >
          {loading ? "Adicionando..." : "Adicionar"}
        </button>
        {success && <p className="text-green-600 mt-2">Administrador adicionado com sucesso!</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default AdcionarAdmin;