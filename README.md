# OPTY - Plataforma de Busca Inteligente de Produtos

**Projeto Integrador IV - PUC Campinas - Equipe 1**

## 📋 Visão Geral do Projeto

OPTY é uma plataforma web full-stack de busca inteligente de produtos que integra múltiplos serviços para proporcionar uma experiência completa de comparação de preços e atendimento em tempo real. O sistema utiliza inteligência artificial para normalizar consultas de busca e oferece suporte ao cliente através de chat bidirecional.

### Principais Funcionalidades

- 🔍 **Busca Inteligente de Produtos**: Web scraping com normalização de queries usando OpenAI
- 👤 **Sistema de Autenticação**: Registro, login, etc
- 💬 **Chat em Tempo Real**: Comunicação WebSocket entre clientes e supervisores
- 📊 **Dashboard Personalizado**: Visualização de resultados e histórico de buscas
- 👥 **Sistema de Perfis**: Usuários comuns e supervisores com diferentes permissões

---

## 🏗️ Arquitetura do Sistema

### Arquitetura Geral
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                          FRONTEND (React)                           │
│                                                                     │
└────────┬────────────────────────────────────────────────┬───────────┘
         │                                                │
         │ HTTP/REST                                      │ WebSocket
         │                                                │
         ▼                                                ▼
┌─────────────────────┐                    ┌──────────────────────────┐
│   PYTHON API        │                    │   SERVIDOR JAVA          │
│   (FastAPI)         │                    │   (Spring Boot)          │
│                     │                    │                          │
│                     │                    │                          │
│ • Autenticação      │                    │ • WebSocket Endpoints    │
│ • Busca Produtos    │                    │ • Gerenciamento Sessões  │
│ • Perfis Usuários   │                    │ • Roteamento Mensagens   │
│ • Web Scraping      │                    │ • Persistência Chat      │
└──────┬──────────────┘                    └────────┬─────────────────┘
       │                                            │
       │                                            │
       ▼                                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          MONGODB (:27017)                            │
│                                                                      │
│  Collections:                                                        │
│  • users          - Perfis e dados dos usuários                      │
│  • messages       - Histórico de mensagens do chat                   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      SERVIÇOS EXTERNOS                               │
│                                                                      │
│  • Supabase Auth  - Autenticação e gerenciamento de tokens           │
│  • OpenAI API     - Normalização inteligente de queries              │
│  • Mercado Livre  - Fonte de dados de produtos (web scraping)        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    CLIENTE JAVA TRADICIONAL                          │
│                    (Socket TCP Tradicional)                          │
│                                                                      │
│  Cliente de linha de comando para comunicação via socket             │
│  tradicional (não-WebSocket) com o servidor Java                     │
└──────────────────────────────────────────────────────────────────────┘
```

### Arquitetura do servidor Java

```
  ┌──────────────────────────────────────────────────────────────┐
  │         Servidor Java (Spring Boot)                          │
  │                                                              │
  │  ┌─────────────────────────┐   ┌─────────────────────────┐   │
  │  │ WebSocket Server        │   │ Socket Tradicional      │   │
  │  │ Endpoint: /ws/client    │   │ ServerSocket tradicional│   │
  │  │ Endpoint: /ws/supervisor│   │                         │   │
  │  └─────────────────────────┘   └─────────────────────────┘   │
  │              │                            │                  │
  │              └────────────┬───────────────┘                  │
  │                           ▼                                  │
  │              ┌─────────────────────────┐                     │
  │              │   SessionManager        │  ← UNIFICADOR       │
  │              │   (Camada de Abstração) │                     │
  │              └─────────────────────────┘                     │
  │                           │                                  │
  │              ┌────────────┴────────────┐                     │
  │              ▼                         ▼                     │
  │       MessageRouter          SupervisorQueueService          │
  └──────────────────────────────────────────────────────────────┘
```


### Fluxo de Dados

1. **Autenticação**: Frontend → Python API → Supabase Auth → MongoDB (perfil)
2. **Busca de Produtos**: Frontend → Python API → OpenAI (normalização) → Mercado Livre (scraping) → Frontend
3. **Chat em Tempo Real**: Frontend ↔ Java Socket Server (WebSocket) ↔ MongoDB (persistência)
4. **Cliente Tradicional**: Java Client ↔ Java Socket Server (TCP Socket) ↔ MongoDB

---

## 👥 Integrantes do Time

**Eduardo Kairalla**
**Marcelo Oliveira**
**Mateus Merg**
**Matheus Ribeiro Marafon**
**Victor Palma**

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI reutilizáveis
- **React Router** - Roteamento client-side
- **Axios** - Cliente HTTP
- **React Query** - Gerenciamento de estado servidor
- **Supabase Client** - SDK de autenticação

### Backend - Python API
- **FastAPI** - Framework web moderno e rápido
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI
- **Poetry** - Gerenciador de dependências
- **Supabase** - Autenticação e autorização
- **PyMongo** - Driver MongoDB para Python
- **BeautifulSoup4** - Web scraping
- **OpenAI** - Normalização de queries com IA
- **HTTPX** - Cliente HTTP assíncrono

### Backend - Java Server
- **Spring Boot 3.2.1** - Framework Java
- **Spring WebSocket** - Suporte WebSocket
- **Spring Data MongoDB** - Integração MongoDB
- **Spring Boot Actuator** - Monitoramento e métricas
- **Jackson** - Processamento JSON
- **Lombok** - Redução de boilerplate
- **Maven** - Gerenciador de dependências
- **Java 17** - Linguagem de programação

### Backend - Java Client
- **Java 17** - Linguagem de programação
- **Java Socket** - Comunicação TCP tradicional
- **Java Serialization** - Serialização de objetos
- **Threads** - Gerenciamento manual de threads

### Banco de Dados
- **MongoDB 8** - Banco de dados NoSQL
  - Collection `users`: Perfis de usuários
  - Collection `messages`: Histórico de mensagens de chat

### DevOps e Deploy
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

### Serviços Externos
- **Supabase** - Autenticação e gerenciamento de usuários
- **OpenAI API** - GPT-4-mini para normalização de queries
- **Mercado Livre** - Fonte de dados de produtos

---

## 📡 Endpoints da API

### Python API (FastAPI)

#### Autenticação
| Método | Endpoint | Descrição
|--------|----------|-----------
| `POST` | `/api/auth/register` | Registrar novo usuário
| `POST` | `/api/auth/login` | Login com email/senha
| `GET` | `/api/auth/oauth/{provider}` | Iniciar fluxo OAuth
| `POST` | `/api/auth/profile` | Criar perfil MongoDB (OAuth)
| `GET` | `/api/auth/me` | Obter perfil do usuário atual
| `PUT` | `/api/auth/me` | Atualizar perfil
| `DELETE` | `/api/auth/me` | Deletar conta (soft delete)
| `GET` | `/api/auth/users` | Listar todos usuários
| `POST` | `/api/auth/forgot-password` | Solicitar reset de senha

#### Busca de Produtos
| Método | Endpoint | Descrição
|--------|----------|-----------
| `GET` | `/api/search/mercadolivre?query={termo}` | Buscar produtos no Mercado Livre

#### Sistema
| Método | Endpoint | Descrição
|--------|----------|-----------
| `GET` | `/health` | Health check da API
| `GET` | `/docs` | Documentação Swagger interativa

### Java Socket Server

#### WebSocket Endpoints
| Tipo | Endpoint | Descrição |
|------|----------|-----------|
| `WebSocket` | `ws://localhost:8080/ws/client` | Conexão para clientes |
| `WebSocket` | `ws://localhost:8080/ws/supervisor` | Conexão para supervisores |

#### REST Endpoints
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/sessions/available` | Listar sessões disponíveis |
| `GET` | `/actuator/health` | Health check do servidor |

---

## 📊 Modelos de Dados

### MongoDB - Collection: `users`

```javascript
{
  "_id": ObjectId,
  "supabase_id": String,        // ID do usuário no Supabase Auth
  "email": String,              // Email único
  "name": String,               // Nome completo
  "phone": String,              // Telefone (opcional)
  "birthday": String,           // Data de nascimento (opcional)
  "avatar_url": String,         // URL do avatar (opcional)
  "role": String,               // "user" ou "supervisor"
  "is_active": Boolean,         // Status da conta
  "created_at": ISODate,        // Data de criação
  "updated_at": ISODate         // Última atualização
}
```

### MongoDB - Collection: `messages`

```javascript
{
  "_id": ObjectId,
  "channelType": String,        // Tipo do canal (ex: "chat")
  "sessionId": String,          // ID da sessão de chat
  "from": String,               // "CLIENT" ou "SUPERVISOR"
  "type": String,               // "CONNECT", "MESSAGE", "DISCONNECT", "ERROR"
  "payload": Object,            // Conteúdo da mensagem
  "timestamp": ISODate          // Data/hora da mensagem
}
```

### Modelo: Message (WebSocket)

```json
{
  "sessionId": "uuid-da-sessao",
  "from": "CLIENT | SUPERVISOR",
  "type": "CONNECT | MESSAGE | DISCONNECT | ERROR",
  "payload": {
    "text": "Conteúdo da mensagem",
    // ... outros campos conforme o tipo
  },
  "timestamp": "2025-11-29T12:00:00Z"
}
```

### Modelo: Session

```java
{
  "sessionId": String,
  "clientConnectionId": String,
  "supervisorConnectionId": String,
  "createdAt": Instant,
  "lastActivityAt": Instant,
  "isPaired": Boolean
}
```

### Modelo: MercadoLivreProduct

```json
{
  "title": "Nome do produto",
  "price": "R$ 99,90",
  "link": "https://mercadolivre.com.br/...",
  "image": "https://...",
  "source": "Mercado Livre"
}
```

### Modelo: Token (JWT)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

## 🚀 Instruções para Executar

### Pré-requisitos

- **Node.js** 18+ e npm/yarn/pnpm
- **Python** 3.9+
- **Poetry** (Python package manager)
- **Java** 17+
- **Maven** 3.6+
- **Docker** e **Docker Compose** (para deploy)
- **Git**

### 1. Clonar o Repositório

```bash
git clone git@github.com:marsheuss/opty-Project-PI-IV-Turma_1.git
cd opty-Project-PI-IV-Turma_1
```

### 2. Configurar Variáveis de Ambiente

Cada componente possui um arquivo `.env.example`. Copie e configure:

#### Python API
```bash
cd python-api
cp .env.example .env
# Edite o .env com suas credenciais do Supabase, MongoDB, OpenAI, etc.
```

#### Frontend
```bash
cd front-end
cp .env.example .env
# Configure as URLs das APIs e WebSocket
```

#### Deploy (Docker Compose)
```bash
cd deploy
cp .env.example .env
# Configure as variáveis de ambiente para os containers
```

### 3. Executar os Serviços

#### Opção A: Desenvolvimento Local

**1. Iniciar MongoDB**
```bash
cd deploy
docker compose up mongo -d
```

**2. Iniciar Python API**
```bash
cd python-api
poetry install
poetry run scripts/dev
# API disponível em http://localhost:8000
# Documentação em http://localhost:8000/docs
```

**3. Iniciar Java Socket Server**
```bash
cd java-server
mvn clean install
mvn spring-boot:run
# WebSocket disponível em ws://localhost:8080/ws/client
# Health check em http://localhost:8080/actuator/health
```

**4. Iniciar Frontend**
```bash
cd front-end
npm install
npm run dev
# Aplicação disponível em http://localhost:5000
```

**5. (Opcional) Executar Java Client**
```bash
cd java-client
./scripts/run.sh
# ou especificar host/porta:
./scripts/run.sh localhost 3000
```

#### Opção B: Deploy com Docker Compose

```bash
cd deploy

# Modo produção
docker compose up -d

# Modo desenvolvimento (com portas expostas)
docker compose -f docker-compose.yml -f docker-compose-dev.yml up -d

# Visualizar logs
docker compose logs -f

# Parar todos os serviços
docker compose down
```

---

## 🧪 Executar Testes

### Python API
```bash
cd python-api
poetry run scripts/test
```

### Java Server
```bash
cd java-server

# Todos os testes
./scripts/tests.sh

# Testes específicos
./scripts/tests.sh SessionTest
./scripts/tests.sh MessageTest
```

---

## 📖 Documentação Adicional

### Acessar Documentação da API (Swagger)

Com a Python API rodando, acesse:
```
http://localhost:8000/docs
```

### Estrutura de Diretórios do Projeto

```
opty-final-repo/
├── front-end/           # Aplicação React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Custom React Hooks
│   │   └── lib/         # Utilitários
│   ├── package.json
│   └── vite.config.ts
│
├── python-api/          # API REST FastAPI
│   ├── opty_api/
│   │   ├── routers/     # Endpoints
│   │   ├── services/    # Lógica de negócio
│   │   ├── schemas/     # Modelos Pydantic
│   │   └── utils/       # Utilitários
│   ├── pyproject.toml
│   └── poetry.lock
│
├── java-server/         # Servidor WebSocket Spring Boot
│   ├── src/main/java/com/opty/socket/
│   │   ├── config/      # Configurações
│   │   ├── controller/  # Controllers REST
│   │   ├── websocket/   # Handlers WebSocket
│   │   ├── service/     # Serviços
│   │   ├── model/       # Modelos de dados
│   │   └── dto/         # Data Transfer Objects
│   └── pom.xml
│
├── java-client/         # Cliente Java tradicional
│   ├── src/
│   │   ├── ClienteChat.java
│   │   ├── Parceiro.java
│   │   └── com/opty/socket/tradicional/comunicado/
│   └── scripts/
│
└── deploy/              # Orquestração Docker
    ├── docker-compose.yml
    ├── docker-compose-dev.yml
    └── infra/
```

---

## 🌐 URLs de Acesso (Desenvolvimento)

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | `http://localhost:5000` | Interface do usuário |
| Python API | `http://localhost:8000` | REST API |
| Python API Docs | `http://localhost:8000/docs` | Swagger UI |
| Java WebSocket (Client) | `ws://localhost:8080/ws/client` | WebSocket clientes |
| Java WebSocket (Supervisor) | `ws://localhost:8080/ws/supervisor` | WebSocket supervisores |
| Java Health Check | `http://localhost:8080/actuator/health` | Status do servidor |
| MongoDB | `localhost:27017` | Banco de dados |

---

## 📝 Notas Importantes

1. **OpenAI API**: É necessário uma chave válida da OpenAI para normalização de queries de busca
2. **Supabase**: Configure um projeto no Supabase e obtenha as credenciais necessárias
3. **MongoDB**: Em produção, use credenciais fortes e habilite autenticação
4. **CORS**: Configure corretamente as origens permitidas em produção
5. **WebSocket**: Certifique-se de que o servidor Java está rodando antes de conectar clientes
6. **Web Scraping**: O scraping do pode ser afetado por mudanças nos sites

---

**Desenvolvido com muito ☕ pela equipe OPTY - PUC Campinas 2025**
