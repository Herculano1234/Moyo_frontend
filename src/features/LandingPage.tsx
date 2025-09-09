import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { motion, AnimatePresence } from "framer-motion";

const carouselImages = [
  "https://angolafieldgroup.com/wp-content/uploads/2008/04/maria-pia-hospital1.jpg?w=768",
  "https://www.makaangola.org/wp-content/uploads/2021/08/hospital-geral-luanda-860x280.jpg",
  "https://rna.ao/rna.ao/wp-content/uploads/2022/03/5839350E-A2A6-4BB9-B001-0E1AB7331FC5.jpeg"
];

// Componentes reutilizáveis
const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
  <motion.div 
    className="card bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-lg flex flex-col items-center h-full"
    whileHover={{ 
      y: -10,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }}
    transition={{ duration: 0.3 }}
  >
    <div className="card-icon text-4xl mb-4">{icon}</div>
    <h3 className="card-title text-xl font-semibold mb-3 text-gray-800 dark:text-white">{title}</h3>
    <p className="card-description text-gray-600 dark:text-gray-300 text-center">{description}</p>
  </motion.div>
);

const Carousel = ({ images, currentIndex, setCurrentIndex }: { 
  images: string[], 
  currentIndex: number, 
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>> 
}) => (
  <div className="relative w-full max-w-2xl h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
    <AnimatePresence mode="wait">
      <motion.img
        key={currentIndex}
        src={images[currentIndex]}
        alt="Healthcare"
        className="absolute top-0 left-0 w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      />
    </AnimatePresence>
    
    {/* Indicadores */}
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
      {images.map((_, idx) => (
        <button 
          key={idx}
          onClick={() => setCurrentIndex(idx)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            currentIndex === idx 
              ? "bg-moyo-primary w-6" 
              : "bg-white/50"
          }`}
          aria-label={`Ir para imagem ${idx + 1}`}
        />
      ))}
    </div>
    
    {/* Botões de navegação */}
    <button 
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm rounded-full p-2 hover:bg-white/50 transition-all z-20"
      onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
      aria-label="Imagem anterior"
    >
      <i className="fas fa-chevron-left text-gray-800"></i>
    </button>
    <button 
      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm rounded-full p-2 hover:bg-white/50 transition-all z-20"
      onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
      aria-label="Próxima imagem"
    >
      <i className="fas fa-chevron-right text-gray-800"></i>
    </button>
  </div>
);

export default function LandingPage() {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [dark, setDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const carouselInterval = useRef<number | null>(null);

  useEffect(() => {
    carouselInterval.current = window.setInterval(() => {
      setCarouselIdx((idx) => (idx + 1) % carouselImages.length);
    }, 5000);
    return () => {
      if (carouselInterval.current) window.clearInterval(carouselInterval.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Animação de scroll para links
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth"
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="overflow-y-auto min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col overflow-x-hidden">
      {/* Header moderno */}
      <motion.header 
        className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div 
          className="flex items-center gap-2 text-2xl font-bold text-moyo-primary"
          whileHover={{ scale: 1.05 }}
        >
          <i className="fas fa-heartbeat text-red-500 text-3xl"></i>
          <span>Moyo</span>
        </motion.div>
        
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 items-center">
          {["home", "services", "about", "features", "contact"].map((item) => (
            <motion.button
              key={item}
              onClick={() => handleScrollTo(item)}
              className="text-gray-700 dark:text-gray-200 hover:text-moyo-primary font-medium px-1 py-2 relative group"
              whileHover={{ y: -2 }}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-moyo-primary transition-all duration-300 group-hover:w-full"></span>
            </motion.button>
          ))}
        </nav>
        
        <div className="hidden md:flex gap-3">
          <Link to="/login">
            <motion.div
              className="px-5 py-2 rounded-lg border-2 border-moyo-primary text-moyo-primary bg-transparent font-medium shadow-sm"
              whileHover={{ 
                backgroundColor: "#3B82F6",
                color: "#FFF",
                scale: 1.05
              }}
              whileTap={{ scale: 0.95 }}
            >
              Entrar
            </motion.div>
          </Link>
          <Link to="/signup">
            <motion.div
              className="px-5 py-2 rounded-lg bg-moyo-primary text-white font-medium shadow"
              whileHover={{ 
                backgroundColor: "#2563EB",
                scale: 1.05
              }}
              whileTap={{ scale: 0.95 }}
            >
              Cadastrar-se
            </motion.div>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <motion.button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg focus:outline-none"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Abrir menu"
          whileTap={{ scale: 0.9 }}
        >
          <div className="relative w-6 h-6">
            <span className={`absolute block w-full h-0.5 bg-moyo-primary transition-all duration-300 ${mobileMenuOpen ? 'top-1/2 transform -rotate-45 -translate-y-1/2' : 'top-1/4'}`}></span>
            <span className={`absolute top-1/2 block w-full h-0.5 bg-moyo-primary transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`absolute block w-full h-0.5 bg-moyo-primary transition-all duration-300 ${mobileMenuOpen ? 'top-1/2 transform rotate-45 -translate-y-1/2' : 'top-3/4'}`}></span>
          </div>
        </motion.button>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              className="absolute top-0 right-0 h-full w-4/5 bg-white dark:bg-gray-800 shadow-lg"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-end mb-8">
                  <button 
                    className="text-gray-500 dark:text-gray-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                
                <nav className="flex flex-col gap-6">
                  {["home", "services", "about", "features", "contact"].map((item) => (
                    <motion.button
                      key={item}
                      onClick={() => handleScrollTo(item)}
                      className="text-left text-lg font-medium text-gray-700 dark:text-gray-200 py-2 border-b border-gray-100 dark:border-gray-700"
                      whileHover={{ x: 10 }}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </motion.button>
                  ))}
                </nav>
                
                <div className="mt-auto pt-10 space-y-4">
                  <Link to="/login" className="block">
                    <motion.div
                      className="w-full py-3 text-center rounded-lg border-2 border-moyo-primary text-moyo-primary font-medium"
                      whileHover={{ backgroundColor: "#3B82F6", color: "#FFF" }}
                    >
                      Entrar
                    </motion.div>
                  </Link>
                  <Link to="/signup" className="block">
                    <motion.div
                      className="w-full py-3 text-center rounded-lg bg-moyo-primary text-white font-medium"
                      whileHover={{ backgroundColor: "#2563EB" }}
                    >
                      Cadastrar-se
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="overflow-y-auto">
      {/* Hero Section com gradiente animado */}
      <section 
        id="home"
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0) 50%, rgba(99, 102, 241, 0.05) 100%)`
        }}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-10">
          <motion.div 
            className="flex-1 flex flex-col items-start gap-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1 
              className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 dark:text-white leading-tight"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Acesse a saúde com <span className="text-moyo-primary">inteligência</span>.
              <br />
              <span className="text-xl xs:text-2xl md:text-3xl font-normal text-gray-600 dark:text-gray-300 mt-4 block">
                Onde você estiver, quando precisar.
              </span>
            </motion.h1>
            
            <motion.div 
              className="flex flex-col xs:flex-row gap-4 mb-6 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/login" className="w-full xs:w-auto">
                <motion.div
                  className="flex items-center justify-center gap-3 bg-moyo-primary text-white px-5 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all w-full font-semibold"
                  whileHover={{ 
                    y: -3,
                    backgroundColor: "#2563EB"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <i className="fas fa-user-injured"></i>
                  Sou Paciente
                </motion.div>
              </Link>
              <Link to="/login" className="w-full xs:w-auto">
                <motion.div
                  className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-5 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all w-full font-semibold"
                  whileHover={{ 
                    y: -3,
                    backgroundColor: "#4F46E5"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <i className="fas fa-user-md"></i>
                  Sou Profissional
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: "fas fa-brain", text: "Triagem com IA" },
                { icon: "fas fa-calendar-check", text: "Agendamentos rápidos" },
                { icon: "fas fa-heartbeat", text: "Monitoramento pós-consulta" }
              ].map((feature, idx) => (
                <motion.span
                  key={idx}
                  className="feature-bubble bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full flex items-center gap-2 text-gray-700 dark:text-gray-200 text-sm font-medium shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <i className={feature.icon}></i>
                  {feature.text}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="flex-1 w-full mt-12 md:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Carousel 
              images={carouselImages} 
              currentIndex={carouselIdx} 
              setCurrentIndex={setCarouselIdx} 
            />
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-3 text-moyo-primary">Acesso Rápido</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Serviços integrados para uma experiência completa em saúde
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <FeatureCard 
                icon="🩺"
                title="Atendimento Online"
                description="Faça sua triagem e agende consultas de forma rápida e segura com nossos profissionais qualificados."
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <FeatureCard 
                icon="👨‍⚕️"
                title="Área Médica"
                description="Acesse fichas de pacientes, histórico médico e controle de atendimentos em um só lugar."
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <FeatureCard 
                icon="⏱️"
                title="Tempo de Espera"
                description="Consulte tempos reais de espera nas unidades de saúde e planeje sua visita com antecedência."
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-10 items-center">
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-moyo-primary">Tecnologia e Humanização na Gestão da Saúde</h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-8">
              O Moyo integra soluções digitais avançadas com uma abordagem centrada no ser humano, transformando a experiência em saúde para pacientes e profissionais. Nossa plataforma conecta tecnologia e cuidado para oferecer um atendimento mais eficiente e humano.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { value: "40%", label: "Redução no tempo de espera" },
                { value: "80%", label: "Triagem mais precisa com IA" },
                { value: "95%", label: "Satisfação do paciente" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="stat bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex flex-col items-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="stat-value text-3xl font-bold text-moyo-primary mb-2">{stat.value}</div>
                  <div className="stat-label text-gray-600 dark:text-gray-300 text-center">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="flex-1 w-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-moyo-primary/10 rounded-2xl transform rotate-3"></div>
              <Carousel 
                images={carouselImages} 
                currentIndex={carouselIdx} 
                setCurrentIndex={setCarouselIdx} 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-3 text-moyo-primary">Funcionalidades Integradas</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Tecnologia avançada para uma gestão de saúde completa e eficiente
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🤖", title: "Triagem com IA", description: "Classificação automática de prioridades com inteligência artificial para atendimento mais eficiente." },
              { icon: "📅", title: "Agendamento Inteligente", description: "Sistema de marcação otimizado conforme disponibilidade de profissionais e recursos." },
              { icon: "📊", title: "Painel Médico", description: "Dashboard completo para acompanhamento de pacientes e gestão de atendimentos." },
              { icon: "📋", title: "Prontuário Digital", description: "Registros médicos integrados e acessíveis de forma segura em qualquer dispositivo." },
              { icon: "📱", title: "Acompanhamento Remoto", description: "Monitoramento pós-consulta via dispositivos móveis para melhor acompanhamento." },
              { icon: "🎓", title: "Educação e Prevenção", description: "Conteúdos personalizados para promoção da saúde e prevenção de doenças." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (idx % 3) * 0.2 }}
              >
                <div className="h-full">
                  <FeatureCard 
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer moderno */}
      <footer id="contact" className="pt-16 pb-10 bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <motion.div 
                className="text-2xl font-bold text-moyo-primary mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
              >
                Moyo
              </motion.div>
              <p className="mb-6 max-w-xs">
                Soluções inovadoras para a saúde digital, conectando tecnologia e cuidado humano para transformar a experiência em saúde.
              </p>
              <div className="flex gap-3">
                {["linkedin-in", "youtube", "instagram", "twitter"].map((social, idx) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white text-lg hover:bg-moyo-primary transition-all"
                    whileHover={{ y: -3 }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <i className={`fab fa-${social}`}></i>
                  </motion.a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Links Rápidos</h3>
              <ul className="space-y-3">
                {["Termos de uso", "Política de privacidade", "Suporte", "FAQ", "Blog"].map((link, idx) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <a href="#" className="hover:text-moyo-primary transition-colors">{link}</a>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Contato</h3>
              <ul className="space-y-3">
                {[
                  { icon: "envelope", text: "contato@moyo.com.br" },
                  { icon: "phone", text: "(+244) 929 754 355" },
                  { icon: "map-marker-alt", text: "Luanda - LDA, Angola" },
                  { icon: "clock", text: "Atendimento: Seg-Sex, 8h-18h" }
                ].map((item, idx) => (
                  <motion.li 
                    key={item.text}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <i className={`fas fa-${item.icon} mt-1 text-moyo-primary`}></i>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Baixe nosso app</h3>
              <div className="flex flex-col gap-4">
                {["google-play", "apple"].map((platform, idx) => (
                  <motion.a
                    key={platform}
                    href="#"
                    className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg hover:bg-moyo-primary transition-all group"
                    whileHover={{ y: -3 }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: idx * 0.2 }}
                  >
                    <i className={`fab fa-${platform} text-2xl ${platform === 'apple' ? 'text-white' : 'text-green-400'} group-hover:text-white`}></i>
                    <div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-200">Disponível no</div>
                      <div className="font-semibold text-white">
                        {platform === 'google-play' ? 'Google Play' : 'App Store'}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center text-gray-500 pt-6 border-t border-slate-700">
            &copy; {new Date().getFullYear()} Moyo. Todos os direitos reservados.
          </div>
        </div>
        
        {/* Botão de tema flutuante */}
        <motion.button
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-moyo-primary text-white flex items-center justify-center shadow-lg z-50"
          onClick={() => setDark((d) => !d)}
          aria-label="Alternar tema"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className={`fas ${dark ? "fa-sun" : "fa-moon"}`}></i>
        </motion.button>
      </footer>
      </div>
    </div>
  );
}