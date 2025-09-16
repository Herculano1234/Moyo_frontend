import apiHost from '../../config/apiHost';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDJARbQHXV9eGtl1ftJkeoEk-t04ZNGmK4",
  authDomain: "moyo-63267.firebaseapp.com",
  projectId: "moyo-63267",
  storageBucket: "moyo-63267.firebasestorage.app",
  messagingSenderId: "475390838922",
  appId: "1:475390838922:web:90b4044ecd8124c15bc573"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const idiomas = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "kimbundo", label: "Kimbundo" },
  { code: "umbundo", label: "Umbundo" },
  { code: "tchoque", label: "Tchoque" },
];

// Componente para as partículas animadas
const FloatingParticles = () => {
  return (
    <>
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="absolute bottom-0 opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 20 + 5}px`,
            height: `${Math.random() * 20 + 5}px`,
            borderRadius: '50%',
            backgroundColor: i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#2563EB' : '#7E22CE',
            animation: `floatUp ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      {[...Array(5)].map((_, i) => (
        <div 
          key={`heart-${i}`}
          className="absolute bottom-0 text-[#7E22CE] opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 20 + 15}px`,
            animation: `floatUp ${Math.random() * 15 + 15}s linear infinite`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        >
          <i className="fas fa-heart" />
        </div>
      ))}
    </>
  );
};

export default function Login() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [perfil, setPerfil] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    setIsMounted(true);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      setIsMounted(false);
    };
  }, []);

  // Login com Google
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem("moyo-auth", "true");
      localStorage.setItem("moyo-perfil", "paciente");
      localStorage.setItem("moyo-user", JSON.stringify({
        nome: user.displayName,
        email: user.email,
        foto: user.photoURL,
        uid: user.uid,
        google: true
      }));
      navigate("/paciente");
    } catch (err: any) {
      setError("Falha ao autenticar com o Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!perfil) {
      setError(t('loginSelecionePerfil') || "Selecione um perfil");
      return;
    }
    if (!password) {
      setError(t('loginPreenchaSenha') || "Preencha a senha");
      return;
    }
    setLoading(true);

    // Verificação especial para admin hospital
    if (
      (email.toLowerCase() === "crisfel@gmail.com" && password === "123")
    ) {
      setLoading(false);
      localStorage.setItem("moyo-auth", "true");
      localStorage.setItem("moyo-perfil", "adminhospital");
  navigate("/adminhospital");
      return;
    }

    // Verificar credenciais na tabela admimhospital
    try {
      const response = await fetch(`https://${apiHost}/admimhospital`);
      const admins = await response.json();
      const found = admins.find(
        (adm: any) =>
          adm.email?.toLowerCase() === email.toLowerCase() &&
          password &&
          adm.senha // senha está criptografada, precisa comparar com bcrypt
      );
      if (found) {
        // Se usar bcrypt, precisa de uma rota de login no backend que compare a senha
        // Aqui está um exemplo simples, mas o ideal é criar POST /login-admimhospital no backend
        localStorage.setItem("moyo-auth", "true");
        localStorage.setItem("moyo-perfil", "adminhospital");
        localStorage.setItem("moyo-user", JSON.stringify(found));
        setLoading(false);
  navigate("/adminhospital");
        return;
      }
    } catch (err) {
      // ignore erro, segue fluxo normal
    }
    
    // Admin login
    if (
      perfil === "profissional" &&
      email === "Moyo@moyo.com" &&
      password === "Moyo.Admin"
    ) {
      setTimeout(() => {
        localStorage.setItem("moyo-auth", "true");
        localStorage.setItem("moyo-perfil", "admin");
        setLoading(false);
        navigate("/admin");
      }, 1000);
      return;
    }
    
    // Login via API
    let url = "";
    if (perfil === "paciente") {
      url = `https://${apiHost}/login`;
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password })
      })
        .then(async (response) => {
          setLoading(false);
          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.error || "Credenciais inválidas. Verifique seu e-mail, senha e perfil.");
            return;
          }
          const data = await response.json();
          localStorage.setItem("moyo-auth", "true");
          localStorage.setItem("moyo-perfil", perfil);
          localStorage.setItem("moyo-user", JSON.stringify(data));
          navigate("/paciente");
        })
        .catch(() => {
          setLoading(false);
          setError("Erro ao conectar ao servidor.");
        });
    } else if (perfil === "profissional") {
      // 1. Verifica na tabela de profissionais
      let profResp = await fetch(`https://${apiHost}/login-profissional`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password })
      });
      if (profResp.ok) {
        const data = await profResp.json();
        localStorage.setItem("moyo-auth", "true");
        localStorage.setItem("moyo-perfil", "profissional");
        localStorage.setItem("moyo-user", JSON.stringify(data));
        setLoading(false);
        navigate("/dashboard");
        return;
      }
      // 2. Se não existir, verifica na tabela de admin_hospital
      let adminHospResp = await fetch(`https://${apiHost}/login-adminhospital`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password })
      });
      if (adminHospResp.ok) {
        const data = await adminHospResp.json();
        localStorage.setItem("moyo-auth", "true");
        localStorage.setItem("moyo-perfil", "adminhospital");
        localStorage.setItem("moyo-user", JSON.stringify(data));
        setLoading(false);
        // Redireciona para adminhospital e passa os dados do hospital
        navigate("/adminhospital");
        return;
      }
      // 3. Se não existir, verifica na tabela de admin_moyo
      let adminResp = await fetch(`https://${apiHost}/login-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password })
      });
      if (adminResp.ok) {
        const data = await adminResp.json();
        localStorage.setItem("moyo-auth", "true");
        localStorage.setItem("moyo-perfil", "admin");
        localStorage.setItem("moyo-user", JSON.stringify(data));
        setLoading(false);
        navigate("/admin");
        return;
      }
      setLoading(false);
      setError("Credenciais inválidas. Verifique seu e-mail, senha e perfil.");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-blue-50 to-white py-6 px-4 transition-all duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '-' : ''}${Math.random() * 50}px); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(30deg); }
          100% { transform: translateX(200%) rotate(30deg); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .floating { animation: float 3s ease-in-out infinite; }
        .pulsing { animation: pulse 2s ease-in-out infinite; }
        
        .login-container {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transition: all 0.3s ease;
          max-height: 90vh;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.85);
        }
        
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.85);
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, #DC2626 0%, #7E22CE 50%, #2563EB 100%);
        }
        
        .social-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .perfil-btn {
          transition: all 0.3s ease;
        }
        .perfil-btn:hover {
          transform: scale(1.03);
        }
        
        .input-field:focus {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }
        
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shine-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.1) 60%,
            rgba(255, 255, 255, 0.2)
          );
          transform: rotate(30deg);
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .shine-effect:hover::after {
          opacity: 1;
          animation: shine 1.5s ease-out;
        }
        
        @media (max-width: 1024px) {
          .login-container {
            flex-direction: column;
            max-width: 90vw;
            max-height: none;
          }
          .login-left, .login-right {
            width: 100%;
          }
          .login-left {
            padding: 2rem 1.5rem;
            background: linear-gradient(to right, #DC2626, #2563EB) !important;
          }
        }
        
        @media (max-width: 640px) {
          .perfil-btn {
            min-width: 100%;
          }
          .social-btn {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1rem;
          }
        }
      `}</style>

      {/* Seletor de idioma */}
      <div className="absolute top-4 right-4 z-50">
        <select
          className="border rounded-lg px-3 py-1.5 text-[#DC2626] font-semibold shadow focus:ring focus:ring-[#DC2626] transition-all duration-200 bg-white hover:bg-gray-50 cursor-pointer text-sm"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          {idiomas.map(idioma => (
            <option key={idioma.code} value={idioma.code}>{idioma.label}</option>
          ))}
        </select>
      </div>
      
      <div className="login-container flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl overflow-hidden transition-transform duration-300 glass-effect">
        
        {/* Lado esquerdo institucional */}
        {!isMobile && (<div className={`login-left flex-1 ${isMobile ? 'bg-gradient-to-r from-[#DC2626] to-[#2563EB]' : 'gradient-bg'} text-white p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden min-h-[300px]`}>
          {!isMobile && <FloatingParticles />}
          
          <div className="absolute w-52 h-52 bg-white/10 rounded-full -top-10 -left-10 z-0 floating" />
          <div className="absolute w-36 h-36 bg-white/10 rounded-full bottom-[-20px] right-16 z-0 floating" style={{ animationDelay: "1.5s" }} />
          
          <div className="relative z-10">
            <div className="flex items-center mb-8 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3 shadow-lg">
                <i className="fas fa-heartbeat text-2xl text-[#DC2626] pulsing"></i>
              </div>
              <span className="text-3xl font-extrabold">Moyo</span>
            </div>
            
            
              <>
                <h1 className="text-2xl md:text-3xl font-bold mb-6 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                  {t('loginBemVindo') || "Bem-vindo ao Moyo"}
                </h1>
                
                <p className="text-base md:text-lg mb-8 opacity-90 max-w-md animate-fadeIn" style={{ animationDelay: "0.4s" }}>
                  {t('loginMensagem') || "Sua plataforma de saúde completa e integrada"}
                </p>
                
                <div className="flex flex-col gap-4 mt-4 animate-fadeIn" style={{ animationDelay: "0.6s" }}>
                  <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                      <i className="fas fa-shield-alt"></i>
                    </div>
                    <span className="text-sm md:text-base">{t('loginSeguroCriptografia') || "Segurança com criptografia avançada"}</span>
                  </div>
                  <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1" style={{ transitionDelay: "0.1s" }}>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                      <i className="fas fa-bolt"></i>
                    </div>
                    <span className="text-sm md:text-base">{t('loginTriagemIA') || "Triagem inteligente com IA"}</span>
                  </div>
                  <div className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-1" style={{ transitionDelay: "0.2s" }}>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                      <i className="fas fa-mobile-alt"></i>
                    </div>
                    <span className="text-sm md:text-base">{t('loginAcessoDispositivo') || "Acesso em qualquer dispositivo"}</span>
                  </div>
                </div>
              </>
            
          </div>
        </div>
        )}

        {/* Lado direito: formulário */}
        <div className="login-right flex-1 p-8 lg:p-12 flex flex-col justify-center bg-transparent">
          {isMobile && (
            <div className="flex items-center justify-center mb-6 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#DC2626] to-[#2563EB] flex items-center justify-center mr-3 shadow-lg">
                <i className="fas fa-heartbeat text-2xl text-white pulsing"></i>
              </div>
              <span className="text-3xl font-extrabold text-[#2563EB]">Moyo</span>
            </div>
          )}
          
          <div className="flex justify-end mb-4">
            <a href="/" className="flex items-center gap-2 text-[#2563EB] font-medium hover:text-[#DC2626] transition-all duration-300 group text-sm">
              <i className="fas fa-arrow-left transition-transform duration-300 group-hover:-translate-x-1 text-xs"></i> 
              {t('voltarPaginaInicial') || "Voltar à página inicial"}
            </a>
          </div>
          
          <div className="text-center mb-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{t('loginAcesseConta') || "Acesse sua conta"}</h1>
            <p className="text-gray-600 text-sm">{t('loginInsiraCredenciais') || "Insira suas credenciais para continuar"}</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-center animate-shake border border-red-100 text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-6 flex flex-wrap gap-3 justify-center animate-fadeIn" style={{ animationDelay: "0.4s" }}>
            <button
              type="button"
              className={`perfil-btn px-4 py-3 rounded-xl font-semibold border-2 transition-all flex-1 min-w-[120px] flex items-center justify-center text-sm ${
                perfil === "paciente" 
                  ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md" 
                  : "bg-white text-[#2563EB] border-[#2563EB] hover:bg-[#2563EB] hover:text-white"
              }`}
              onClick={() => setPerfil("paciente")}
            >
              <i className="fas fa-user-injured mr-2 text-sm"></i> {t('loginPaciente') || "Paciente"}
            </button>
            
            <button
              type="button"
              className={`perfil-btn px-4 py-3 rounded-xl font-semibold border-2 transition-all flex-1 min-w-[120px] flex items-center justify-center text-sm ${
                perfil === "profissional" 
                  ? "bg-[#DC2626] text-white border-[#DC2626] shadow-md" 
                  : "bg-white text-[#DC2626] border-[#DC2626] hover:bg-[#DC2626] hover:text-white"
              }`}
              onClick={() => setPerfil("profissional")}
            >
              <i className="fas fa-user-md mr-2 text-sm"></i> {t('loginProfissional') || "Profissional"}
            </button>
          </div>
          
          <form className="login-form flex flex-col gap-5 animate-fadeIn" style={{ animationDelay: "0.6s" }} onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-envelope text-gray-400 text-sm"></i>
              </div>
              <input
                type="email"
                id="email"
                className="input-field w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-sm focus:border-[#2563EB] focus:ring-0 outline-none bg-white/70 transition-all duration-300"
                placeholder={t('loginEmail') || "E-mail"}
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            
            <div className="form-group relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-lock text-gray-400 text-sm"></i>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="input-field w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:border-[#2563EB] focus:ring-0 outline-none bg-white/70 transition-all duration-300"
                placeholder={t('loginSenha') || "Senha"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#2563EB] focus:outline-none transition-colors duration-300 text-sm"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600 gap-2">
              <div className="flex items-center gap-1.5">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="accent-[#DC2626] w-4 h-4 cursor-pointer rounded focus:ring-[#DC2626]" 
                />
                <label htmlFor="remember" className="cursor-pointer select-none">{t('loginLembrarMe') || "Lembrar-me"}</label>
              </div>
              <a href="#" className="text-[#2563EB] hover:text-[#7E22CE] hover:underline font-medium transition-colors duration-300 text-xs">
                {t('loginEsqueceuSenha') || "Esqueceu a senha?"}
              </a>
            </div>
            
            <button 
              type="submit" 
              className="login-button bg-gradient-to-r from-[#DC2626] to-[#2563EB] text-white py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2 shine-effect"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin text-sm"></i> 
                  {t('loginEntrar') || "Entrar"}...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt text-sm"></i> 
                  {t('loginEntrar') || "Entrar"}
                </>
              )}
            </button>
          </form>
          
          <div className="divider flex items-center my-6 text-gray-400 animate-fadeIn" style={{ animationDelay: "0.8s" }}>
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-xs">{t('loginOuEntrarCom') || "Ou entre com"}</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
          
          <div className="social-login flex justify-center gap-4 mb-6 animate-fadeIn" style={{ animationDelay: "1s" }}>
            <button
              type="button"
              className="social-btn w-12 h-12 rounded-xl flex items-center justify-center bg-white text-gray-700 text-base border border-gray-300 hover:bg-red-50 hover:text-red-600 transition-all duration-300 shadow-sm"
              onClick={handleGoogleLogin}
              disabled={loading}
              title="Entrar com Google"
            >
              <i className="fab fa-google"></i>
            </button>
            <button 
              className="social-btn w-12 h-12 rounded-xl flex items-center justify-center bg-white text-gray-700 text-base border border-gray-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 shadow-sm"
              title="Entrar com Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </button>
            <button 
              className="social-btn w-12 h-12 rounded-xl flex items-center justify-center bg-white text-gray-700 text-base border border-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300 shadow-sm"
              title="Entrar com Apple"
            >
              <i className="fab fa-apple"></i>
            </button>
          </div>
          
          <div className="signup-link text-center text-gray-600 text-sm animate-fadeIn" style={{ animationDelay: "1.2s" }}>
            {t('loginNaoTemConta') || "Não tem uma conta?"}{' '}
            <a href="/signup" className="text-[#7E22CE] font-semibold hover:text-[#2563EB] hover:underline transition-colors duration-300">
              {t('loginCadastrarAgora') || "Cadastre-se agora"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}