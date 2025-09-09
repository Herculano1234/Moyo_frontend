# Moyo - Sistema Web de Gestão Hospitalar

Este projeto é o frontend web (painel hospitalar/profissional) do sistema Moyo, feito em React, TypeScript, TailwindCSS e Recharts.

## Scripts

- `npm install` — instala dependências
- `npm run dev` — inicia o servidor de desenvolvimento
- `npm run build` — build de produção

## Estrutura

- Dashboard com exemplo de gráfico e cards (ver `/src/features/dashboard`)
- Sidebar de navegação e tema claro/escuro
- Estrutura pronta para adicionar novos módulos (pacientes, triagem, etc)

## Tecnologias

- React + Vite
- TypeScript
- TailwindCSS (com dark mode)
- Zustand (gerenciamento de estado)
- Recharts (gráficos)


## Tudo sobre o Projecto
    🏥 Moyo – Sistema de Gestão Hospitalar
Plataforma Web + Mobile com Experiência Personalizada para Médicos e Pacientes

Moyo é uma solução digital inteligente e multiplataforma (web e mobile) projetada para melhorar o acesso, organização e acompanhamento dos serviços de saúde. A plataforma se adapta às necessidades de dois perfis principais: pacientes e profissionais de saúde.

⚠️ Nota importante: As interfaces e funcionalidades da aplicação são diferentes para médicos e pacientes, com fluxos, permissões e experiências adaptadas às funções de cada um.
Pacientes têm acesso a funcionalidades como agendamento, lembretes de medicação e acompanhamento de sintomas, enquanto médicos usam painéis clínicos e ferramentas de gestão hospitalar.

🧩 Estrutura Modular da Plataforma
✅ Módulo 1 – Atendimento (Paciente ↔ App Mobile/Web)
👤 Interface do Paciente
Interface simples, intuitiva e centrada na experiência do usuário comum.

Cadastro e login com dados médicos.

Triagem inteligente com IA (leve, moderado, grave).

Agendamento de consultas com base na gravidade.

Localização de unidades de saúde via GPS.

Acesso via mobile app (Android/iOS) ou web app com a mesma conta.

✅ Benefícios
Acesso facilitado à saúde sem precisar ir diretamente ao hospital.

Evita filas, deslocamentos desnecessários e permite atendimento mais ágil.

🏥 Módulo 2 – Gestão Intra-Hospitalar (Profissionais de Saúde – Interface Web)
👨‍⚕️ Interface do Médico / Profissional de Saúde
Layout especializado para uso profissional em clínicas e hospitais.

Check-in digital do paciente via QR Code.

Tela de triagem com histórico clínico e sintomas.

Ficha médica digital completa com registro de atendimentos.

Painel de gestão com fila de espera e indicadores de prioridade.

Acesso exclusivo via navegador (web app otimizado para desktop e tablets).

✅ Benefícios
Aumenta a precisão clínica.

Organiza o atendimento com base em dados em tempo real.

Reduz retrabalho e melhora a tomada de decisão médica.

💬 Módulo 3 – Relacionamento com o Paciente (Acompanhamento + Prevenção)
📱 Funcionalidades para o Paciente:
Notificações automáticas para lembretes de medicação e consultas.

Chat com a equipe de enfermagem para dúvidas simples.

Relatório de evolução de sintomas enviado ao sistema.

Teleconsultas para acompanhamento remoto.

📚 Educação em Saúde:
Dicas de saúde personalizadas com base no perfil clínico.

Conteúdo sobre primeiros socorros.

Campanhas de vacinação e exames preventivos com alertas e localizações.

✅ Benefícios:
Acompanhamento contínuo e direto.

Redução de reinternações e agravamentos evitáveis.

Criação de uma cultura de autocuidado no paciente.

🛠️ Tecnologias Utilizadas
Camada	Tecnologias
Frontend Mobile/Web (Paciente)	React Native + Expo (compilado para Web, Android e iOS)
Frontend Web (Profissionais de Saúde)	React.js + TailwindCSS
Backend/API REST	Node.js + Express
Microserviço de IA (triagem)	Python + FastAPI
Banco de Dados	PostgreSQL (dados estruturados) + MongoDB (histórico clínico flexível)
Autenticação	Firebase Auth + JWT
Notificações Push	Firebase Cloud Messaging
Geolocalização	Google Maps API

🌐 Plataforma Conectada
A aplicação foi projetada para ser acessada via mobile e navegador, com autenticação segura e sincronização em tempo real.

A experiência de uso é adaptada para cada perfil:

Paciente: Interface amigável, focada no cuidado pessoal.

Médico/Profissional: Interface profissional, com foco na triagem, prontuário e gestão clínica.

📌 Conclusão
O Moyo é mais que um sistema hospitalar — é uma plataforma de saúde digital com foco em acessibilidade, gestão inteligente e cuidado contínuo.
Com experiência personalizada para cada tipo de usuário, garante usabilidade, eficiência e impacto real no ecossistema de saúde.


