# 📱 Feedin

**Feedin** é um aplicativo mobile que torna o processo de feedback entre colegas de empresa ou time mais simples, divertido e recompensador.

## 🚀 Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Um dispositivo móvel com o aplicativo Expo Go instalado (disponível na [App Store](https://apps.apple.com/app/apple-store/id982107779) ou [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Passos para instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/feedin.git
cd feedin
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Adicione suas credenciais do Firebase e OpenAI:
```
FIREBASE_API_KEY=sua_chave_api
FIREBASE_AUTH_DOMAIN=seu_dominio
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_STORAGE_BUCKET=seu_bucket
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id
OPENAI_API_KEY=sua_chave_api_openai
```

4. Inicie o aplicativo:
```bash
npm start
# ou
yarn start
```

5. Escaneie o QR Code que aparecerá no terminal com:
- iOS: Câmera do iPhone
- Android: App Expo Go

### BrainStorm & Idéia

Iniciamos um processo de **brainstorming em grupo**, onde levantamos ideias, soluções e funcionalidades possíveis. Durante esse momento criativo, mapeamos as seguintes dores:

- Falta de **engajamento** nas ferramentas formais de feedback;
- Dificuldade dos colaboradores em **dar e receber feedbacks** de forma natural;
- Pouca valorização de conquistas e tarefas do dia a dia;
- Ausência de **incentivos e reconhecimento constante** entre os colegas.

A partir disso, nasceu a ideia do **Feedin**: um app mobile moderno e gamificado que estimula o feedback espontâneo entre colegas por meio de uma rede social interna, recompensas por participação e uma IA que auxilia na construção de mensagens mais descontraídas e humanas.

![image](https://github.com/user-attachments/assets/b6f06850-3c85-484a-881b-236db5677e59)
(Foto do quadro que usamos para mapear o fluxo do app)

## 📲 Como funciona

### 👥 Acesso à rede
- O perfil **empresa (admin)** é o responsável por aprovar as solicitações dos colaboradores que desejam ingressar na rede da empresa.
- Após aprovação, o colaborador passa a interagir com os colegas por meio de postagens e feedbacks.

### 🧵 Tipos de postagens
- **Feedback Direto**: o usuário escreve um feedback público para um colega específico.
- **Post de Tarefa/Realização**: o usuário compartilha algo que fez, buscando receber feedbacks construtivos.

### 🎁 Recompensas e Pontos
- Os usuários acumulam pontos ao:
  - Criar postagens (feedbacks ou realizações)
  - Comentar com feedbacks nos posts de colegas
- Os pontos podem ser trocados por recompensas que a empresa disponibiliza em uma **loja interna** do app.

### 🤖 IA para apoio no feedback
- Ao escrever um feedback, o usuário pode contar com o auxílio de uma **Inteligência Artificial**, que ajuda a tornar o texto mais leve, amigável e eficaz.
- Utilizada para fazer esse auxilio de forma totalmente descontraída.  

## ⚙️ Tecnologias Utilizadas

O Feedin é desenvolvido com uma stack moderna, que visa simplicidade, escalabilidade e boa experiência para o usuário final.

### 🧠 Frontend Mobile

- **[React Native](https://reactnative.dev/)** com **[Expo](https://expo.dev/)**  
  Interface mobile nativa com desempenho e experiência fluida.
  
- **TypeScript (TSX)**  
  Tipagem estática para maior segurança, legibilidade e manutenção do código.

- **StyleSheet API / Styled Components**  
  Estilização flexível e componentizada.

### 🔥 Backend e Banco de Dados

- **[Firebase](https://firebase.google.com/)**  
  Plataforma completa usada para:
  - **Autenticação de usuários**
  - **Firestore** como banco de dados em tempo real
  - **Storage** para upload de arquivos e imagens
  - **Cloud Functions** como backend (API) para lógica de negócio e integrações

### 🤖 Inteligência Artificial

- **[OpenAI API](https://platform.openai.com/docs)**  
  Utilizada para auxiliar os usuários na criação de feedbacks mais descontraídos, claros e empáticos.  
  A IA analisa o conteúdo e sugere melhorias mantendo o tom humano e construtivo.
