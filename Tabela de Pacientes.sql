-- Tabela de Pacientes
CREATE TABLE pacientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  data_nascimento DATE,
  sexo VARCHAR(10),
  telefone VARCHAR(20),
  endereco TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Profissionais
CREATE TABLE profissionais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  especialidade VARCHAR(100),
  conselho VARCHAR(50),
  registro_profissional VARCHAR(50),
  telefone VARCHAR(20),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Consultas
CREATE TABLE consultas (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id),
  profissional_id INTEGER REFERENCES profissionais(id),
  data_hora TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'agendada',
  prioridade VARCHAR(10),
  local VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Triagem (relacionada à consulta)
CREATE TABLE triagens (
  id SERIAL PRIMARY KEY,
  consulta_id INTEGER REFERENCES consultas(id),
  respostas JSONB,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Exames
CREATE TABLE exames (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id),
  tipo VARCHAR(100),
  data DATE,
  status VARCHAR(20) DEFAULT 'pendente',
  resultado TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Medicações
CREATE TABLE medicacoes (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id),
  nome VARCHAR(100),
  dosagem VARCHAR(100),
  status VARCHAR(20) DEFAULT 'atual',
  data_inicio DATE,
  data_fim DATE
);

-- Tabela de Atendimentos (prontuário)
CREATE TABLE atendimentos (
  id SERIAL PRIMARY KEY,
  consulta_id INTEGER REFERENCES consultas(id),
  profissional_id INTEGER REFERENCES profissionais(id),
  data_hora TIMESTAMP NOT NULL,
  resumo TEXT,
  prescricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);