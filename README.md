# 🏋️ Musculação no Campus
 
Aplicativo mobile-first de acompanhamento de treinos com gamificação, desenvolvido para estudantes universitários que treinam na academia do campus.
 
---
 
## ✨ Funcionalidades
 
- **Login e Cadastro**: autenticação simples com e-mail e senha
- **Onboarding personalizado**: define objetivo, nível e dias de treino
- **Dashboard**: visão geral de XP, streak, conquistas e treino do dia
- **Treino do dia**: registra pesos e séries com timer de descanso automático
- **Sistema de XP e níveis**: ganhe experiência a cada treino concluído
- **Conquistas (badges)**: mais de 20 conquistas desbloqueáveis, incluindo algumas bem divertidas
- **Histórico de treinos**: calendário dos últimos 3 meses
- **Sequências (streaks)**: acompanhe sua consistência
 
---
 
## 🛠️ Tecnologias
 
| Camada | Tecnologia |
|---|---|
| Framework | React + TypeScript |
| Build | Vite |
| Estilização | Tailwind CSS |
| Animações | Framer Motion |
| Roteamento | React Router DOM |
| Ícones | Lucide React |
| Estado/Storage | localStorage (temporário — backend em desenvolvimento) |
 
---
 
## 🚀 Como rodar localmente
 
```bash
# Clone o repositório
git clone https://github.com/Yasmim-Mendes1/musculacao-no-campus.git
cd musculacao-no-campus
 
# Instale as dependências
npm install
 
# Inicie o servidor de desenvolvimento
npm run dev
```
 
Acesse `http://localhost:5173` no navegador.
 
---
 
## 🌿 Branches
 
| Branch | Descrição |
|---|---|
| `main` | Produção estável |
| `develop` | Desenvolvimento ativo |
| `feature/*` | Novas funcionalidades |
| `fix/*` | Correções de bugs |
 
**Fluxo:** `feature/*` → `develop` → `main`
 
---
 
## 📁 Estrutura do projeto
 
```
src/
├── assets/          # Imagens e ícones estáticos
├── components/      # Componentes reutilizáveis (ui/)
├── lib/
│   ├── store.ts     # Lógica de dados, XP, conquistas, treinos
│   └── badgeIcons.ts # Mapeamento de ícones das conquistas
└── pages/
    ├── Login.tsx
    ├── Onboarding.tsx
    ├── Dashboard.tsx
    ├── Workout.tsx
    ├── Progress.tsx
    ├── Streak.tsx
    ├── Badges.tsx
    ├── Levels.tsx
    ├── WorkoutsList.tsx
    └── Settings.tsx
```
 
---
 
## 🔧 Backend (em desenvolvimento)
 
O frontend atualmente usa `localStorage` para persistência. O backend será desenvolvido futuramente.
 
---
 
## 📋 Roadmap
 
### Frontend
- [x] Login e cadastro com validação
- [x] Onboarding de perfil
- [x] Dashboard com XP, streak e conquistas
- [x] Página de treino com séries, pesos e timer
- [x] Sistema de conquistas (badges)
- [x] Histórico de treinos com calendário
 
### Backend
- [ ] Setup da API
- [ ] Autenticação real (JWT)
- [ ] Banco de dados (usuários, treinos, logs)
- [ ] Migrar localStorage → API
- [ ] Geração dinâmica de treinos
- [ ] Sincronização entre dispositivos
