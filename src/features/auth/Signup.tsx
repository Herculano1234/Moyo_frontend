import apiHost from '../../config/apiHost';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Signup() {
  const [fotoPerfil, setFotoPerfil] = useState<string>("");
  const [perfil, setPerfil] = useState<string>("paciente");
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [bi, setBi] = useState("");
  const [morada, setMorada] = useState("");
  const [sexo, setSexo] = useState("");
  const [email, setEmail] = useState("");
  const [contacto, setContacto] = useState("");
  const [responsavel, setResponsavel] = useState("");
  // Profissional
  const [unidade, setUnidade] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [area, setArea] = useState("");
  const [cargo, setCargo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isMenor, setIsMenor] = useState(false);
  const [error, setError] = useState("");
  const [codigoVerificacao, setCodigoVerificacao] = useState<string>("");
  const [emailEnviado, setEmailEnviado] = useState(false);
  const navigate = useNavigate();


  // Função para calcular idade a partir da data de nascimento
  function calcularIdade(data: string) {
    const hoje = new Date();
    const nascimento = new Date(data);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!perfil) return setError("Selecione o perfil para cadastro.");
    if (!nome || !dataNascimento || !bi || !morada || !sexo || !email || !contacto || !senha || !confirmarSenha) return setError("Preencha todos os campos obrigatórios.");
    if (senha !== confirmarSenha) return setError("As senhas não coincidem.");
    if (perfil === "paciente" && isMenor && !responsavel) return setError("Informe o contacto do responsável.");
    if (perfil === "profissional" && (!unidade || !municipio || !area || !cargo)) return setError("Preencha todos os campos do profissional.");

    // Validação da data de nascimento do profissional
    if (perfil === "profissional") {
      const idadeProfissional = calcularIdade(dataNascimento);
      if (isNaN(idadeProfissional) || idadeProfissional < 18) {
        return setError("Profissional deve ter pelo menos 18 anos.");
      }
    }

    try {
      let url = `https://${apiHost}/pacientes`;
      let body: any = {
        nome,
        email,
        senha,
        data_nascimento: dataNascimento,
        sexo,
        telefone: contacto,
        endereco: morada,
        foto_perfil: fotoPerfil,
      };
      if (perfil === "profissional") {
        url = `https://${apiHost}/profissionais`;
        body = {
          nome,
          data_nascimento: dataNascimento,
          bi,
          sexo,
          morada,
          email,
          telefone: contacto,
          unidade,
          municipio,
          especialidade: area,
          cargo,
          conselho: "", // Adapte se necessário
          registro_profissional: bi,
          senha,
          foto_perfil: fotoPerfil,
        };
      }
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return setError(errorData.error || "Erro ao cadastrar.");
      }

      // Gerar código de verificação
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      setCodigoVerificacao(codigo);
      setEmailEnviado(true);

      // Chamar API real para envio do código por e-mail
      try {
        const envioResponse = await fetch(`https://${apiHost}/enviar-codigo-verificacao`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, codigo })
        });
        if (!envioResponse.ok) {
          const envioError = await envioResponse.json();
          setError(envioError.error || "Erro ao enviar código de verificação por e-mail.");
          return;
        }
      } catch (err) {
        setError("Erro ao conectar ao serviço de envio de e-mail.");
        return;
      }

      // Não navegar para login até verificação
    } catch (err) {
      setError("Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 via-green-50 to-green-100 min-h-screen flex flex-col items-center py-6 px-2">
      <div className="container max-w-4xl w-full">
        {/* Header */}
        <header className="flex justify-between items-center py-6 w-full">
          <a href="/" className="flex items-center gap-2 text-3xl font-extrabold text-moyo-primary no-underline">
            <i className="fas fa-heartbeat text-4xl"></i>
            Moyo Saúde
          </a>
          <a href="/" className="flex items-center gap-2 text-moyo-primary font-medium hover:text-moyo-secondary transition-all">
            <i className="fas fa-arrow-left"></i> Voltar à página inicial
          </a>
        </header>

        {/* Main Content */}
        <main className="flex justify-center w-full my-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-moyo-primary to-moyo-accent text-white px-8 py-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Criar Conta</h1>
              <p className="text-lg opacity-90">Preencha os campos abaixo para se cadastrar</p>
            </div>
            <div className="px-8 py-10 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <button type="button" className={`user-type-btn px-6 py-3 border-2 rounded-full font-semibold transition-all flex items-center gap-2 ${perfil === "paciente" ? "bg-moyo-primary text-white border-moyo-primary" : "bg-transparent text-moyo-primary border-moyo-primary"}`} onClick={() => setPerfil("paciente")}> <i className="fas fa-user-injured"></i> Sou Paciente</button>
                <button type="button" className={`user-type-btn px-6 py-3 border-2 rounded-full font-semibold transition-all flex items-center gap-2 ${perfil === "profissional" ? "bg-moyo-primary text-white border-moyo-primary" : "bg-transparent text-moyo-primary border-moyo-primary"}`} onClick={() => setPerfil("profissional")}> <i className="fas fa-user-md"></i> Sou Profissional</button>
              </div>
              {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Foto de Perfil */}
                <div className="form-group md:col-span-2">
                  <label className="font-medium mb-1 block">Foto de Perfil</label>
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
                  {fotoPerfil && (
                    <img src={fotoPerfil} alt="Pré-visualização" className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-moyo-primary" />
                  )}
                </div>
                {/* Dados comuns */}
                <div className="form-group">
                  <label className="font-medium mb-1 block">Nome Completo <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <i className="fas fa-user input-icon absolute left-3 top-3 text-moyo-gray"></i>
                    <input type="text" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={nome} onChange={e => setNome(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="font-medium mb-1 block">Data de Nascimento <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <i className="fas fa-calendar-alt input-icon absolute left-3 top-3 text-moyo-gray"></i>
                    <input type="date" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="font-medium mb-1 block">Nº Bilhete de Identidade <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <i className="fas fa-id-card input-icon absolute left-3 top-3 text-moyo-gray"></i>
                    <input type="text" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={bi} onChange={e => setBi(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="font-medium mb-1 block">Sexo <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <i className="fas fa-venus-mars input-icon absolute left-3 top-3 text-moyo-gray"></i>
                    <select className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={sexo} onChange={e => setSexo(e.target.value)} required>
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="font-medium mb-1 block">Morada <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <i className="fas fa-map-marker-alt input-icon absolute left-3 top-3 text-moyo-gray"></i>
                    <input type="text" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={morada} onChange={e => setMorada(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="font-medium mb-1 block">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <i className="fas fa-envelope input-icon absolute left-3 top-3 text-moyo-gray"></i>
                    <input type="email" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="font-medium mb-1 block">Contacto <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <i className="fas fa-phone input-icon absolute left-3 top-3 text-moyo-gray"></i>
                    <input type="tel" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={contacto} onChange={e => setContacto(e.target.value)} required />
                  </div>
                </div>
                {/* Paciente: Menor de idade */}
                {perfil === "paciente" && (
                  <div className="form-group md:col-span-2 flex flex-col gap-2">
                    <label className="flex items-center gap-2 font-medium">
                      <input type="checkbox" checked={isMenor} onChange={e => setIsMenor(e.target.checked)} /> Menor de idade
                    </label>
                    {isMenor && (
                      <div className="bg-blue-50 p-4 rounded-lg mt-2">
                        <label className="font-medium mb-1 block">Contacto do Responsável <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <i className="fas fa-user-shield input-icon absolute left-3 top-3 text-moyo-gray"></i>
                          <input type="tel" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={responsavel} onChange={e => setResponsavel(e.target.value)} required={isMenor} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Profissional Fields */}
                {perfil === "profissional" && (
                  <>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Unidade Hospitalar <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <i className="fas fa-hospital input-icon absolute left-3 top-3 text-moyo-gray"></i>
                        <input type="text" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={unidade} onChange={e => setUnidade(e.target.value)} required={perfil === "profissional"} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Município da Unidade <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <i className="fas fa-city input-icon absolute left-3 top-3 text-moyo-gray"></i>
                        <input type="text" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={municipio} onChange={e => setMunicipio(e.target.value)} required={perfil === "profissional"} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Área do Profissional <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <i className="fas fa-stethoscope input-icon absolute left-3 top-3 text-moyo-gray"></i>
                        <select className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={area} onChange={e => setArea(e.target.value)} required={perfil === "profissional"}>
                          <option value="">Selecione</option>
                          <option value="Cardiologia">Cardiologia</option>
                          <option value="Pediatria">Pediatria</option>
                          <option value="Neurologia">Neurologia</option>
                          <option value="Ortopedia">Ortopedia</option>
                          <option value="Clínica Geral">Clínica Geral</option>
                          <option value="Outra">Outra</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Cargo <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <i className="fas fa-user-tie input-icon absolute left-3 top-3 text-moyo-gray"></i>
                        <select className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={cargo} onChange={e => setCargo(e.target.value)} required={perfil === "profissional"}>
                          <option value="">Selecione</option>
                          <option value="Médico">Médico</option>
                          <option value="Enfermeiro">Enfermeiro</option>
                          <option value="Técnico de Saúde">Técnico de Saúde</option>
                          <option value="Administrativo">Administrativo</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
                {/* Senha */}
                <div className="form-group">
                  <label className="font-medium mb-1 block">Senha <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <i className="fas fa-lock input-icon absolute left-3 top-3 text-moyo-gray"></i>
                    <input type="password" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={senha} onChange={e => setSenha(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="font-medium mb-1 block">Confirmar Senha <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <i className="fas fa-lock input-icon absolute left-3 top-3 text-moyo-gray"></i>
                    <input type="password" className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="btn-submit w-full py-4 bg-moyo-primary text-white rounded-lg font-bold text-lg mt-4 hover:bg-moyo-secondary transition">Criar Conta</button>
                </div>
                <div className="md:col-span-2 text-center mt-4">
                  <span className="text-gray-600 dark:text-gray-300">Já possui conta?</span>{" "}
                  <a href="/login" className="text-moyo-primary hover:underline font-semibold inline-flex items-center gap-1"><i className="fas fa-sign-in-alt"></i> Entrar</a>
                </div>
              </form>
            </div>
          </div>
        </main>
        {/* Footer */}
        <footer className="w-full text-center py-8 text-moyo-dark text-sm mt-8">
          &copy; {new Date().getFullYear()} Moyo Saúde. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}
