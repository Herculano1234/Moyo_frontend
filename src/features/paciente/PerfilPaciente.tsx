import apiHost from '../../config/apiHost';
import React, { useState } from "react";

export default function PerfilPaciente({ paciente, setPaciente }: { paciente: any, setPaciente: (p: any) => void }) {
  const [edit, setEdit] = useState(false);
  const [email, setEmail] = useState(paciente?.email || "");
  const [telefone, setTelefone] = useState(paciente?.telefone || "");
  const [endereco, setEndereco] = useState(paciente?.endereco || "");
  const [fotoPerfil, setFotoPerfil] = useState(paciente?.foto_perfil || "");

  async function handleSave() {
    try {
  const response = await fetch(`https://${apiHost}/pacientes/${paciente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, telefone, endereco, foto_perfil: fotoPerfil })
      });
      if (!response.ok) throw new Error("Erro ao atualizar perfil");
      const updated = await response.json();
      setPaciente(updated);
      localStorage.setItem("moyo-user", JSON.stringify(updated));
      setEdit(false);
    } catch {
      alert("Erro ao salvar perfil");
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col min-h-full p-4">
      <h2 className="text-2xl font-bold text-moyo-primary mb-4 flex items-center gap-2">
        <i className="fas fa-user"></i> Perfil
      </h2>
      <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-moyo-primary flex flex-col mb-4">
          <div className="flex items-center mb-2">
            {paciente?.foto_perfil ? (
              <img src={paciente.foto_perfil} alt="Foto de perfil" className="w-16 h-16 rounded-full object-cover mr-3 border-2 border-moyo-primary" />
            ) : (
              <i className="fas fa-user text-moyo-primary text-2xl mr-3"></i>
            )}
            <h2 className="text-lg font-bold text-moyo-dark">Dados do Paciente</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="font-semibold">Nome:</span> {paciente?.nome}</div>
            <div><span className="font-semibold">Data de Nascimento:</span> {paciente?.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString() : "-"}</div>
            <div><span className="font-semibold">BI:</span> {paciente?.bi || "-"}</div>
            <div><span className="font-semibold">Sexo:</span> {paciente?.sexo || "-"}</div>
            <div><span className="font-semibold">Email:</span> {paciente?.email}</div>
            <div><span className="font-semibold">Telefone:</span> {paciente?.telefone || "-"}</div>
            <div><span className="font-semibold">Morada:</span> {paciente?.endereco || paciente?.morada || "-"}</div>
          </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="bg-white rounded-xl shadow p-6 mb-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Dados Pessoais</h3>
          <div className="flex items-center mb-4">
            {fotoPerfil ? (
              <img src={fotoPerfil} alt="Foto de perfil" className="w-16 h-16 rounded-full object-cover border-2 border-moyo-primary mr-4" />
            ) : (
              <i className="fas fa-user text-moyo-primary text-2xl mr-4"></i>
            )}
            {edit && (
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFotoPerfil(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">E-mail</label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2"
                value={email}
                onChange={e => setEmail(e.target.value)}
                readOnly={!edit}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Telefone</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                readOnly={!edit}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {!edit ? (
              <button className="px-4 py-2 bg-moyo-primary text-white rounded-lg font-semibold" onClick={() => setEdit(true)}>Editar</button>
            ) : (
              <button className="px-4 py-2 bg-moyo-primary text-white rounded-lg font-semibold" onClick={handleSave}>Salvar</button>
            )}
            {edit && (
              <button className="px-4 py-2 bg-gray-300 rounded-lg font-semibold" onClick={() => setEdit(false)}>Cancelar</button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Endereço</h3>
          {edit ? (
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
            />
          ) : (
            <div className="text-moyo-gray">{endereco}</div>
          )}
        </div>
        {/* Card extra para ocupar o grid */}
        <div className="bg-transparent shadow-none p-6 w-full"></div>
      </div>
    </div>
  );
}
