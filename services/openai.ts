import OpenAI from 'openai';
import Constants from 'expo-constants';

const OPENAI_API_KEY = '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';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

interface FeedbackQuestion {
  question: string;
  options: string[];
}

interface FeedbackResponse {
  question: string;
  answer: string;
}

export async function generateFeedbackQuestions(postContent: string): Promise<FeedbackQuestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é um assistente criativo que gera perguntas de feedback usando memes brasileiros populares.
          Analise o seguinte post e gere 3 perguntas diferentes e específicas: "${postContent}"
          
          Regras:
          - Use memes brasileiros muito conhecidos (ex: "É o bicho", "Vai dar namoro", "Tá saindo da jaula o monstro")
          - Cada pergunta deve abordar um aspecto diferente do post (ex: UI/UX, funcionalidade, código, design, etc)
          - As perguntas devem ser relevantes ao contexto do post
          - Use linguagem informal e divertida
          - As opções devem ser claras e usar memes também
          - Mantenha as perguntas curtas e objetivas
          
          Exemplo de formato:
          {
            "questions": [
              {
                "question": "É o bicho ou é o bicho? (sobre a interface)",
                "options": ["É o bicho!", "Nem é o bicho", "Mais ou menos bicho"]
              },
              {
                "question": "Vai dar namoro? (sobre a funcionalidade)",
                "options": ["Vai dar namoro!", "Nem fodendo", "Tô na dúvida"]
              },
              {
                "question": "Tá saindo da jaula o monstro? (sobre o código)",
                "options": ["Tá saindo!", "Nem de longe", "Quase lá"]
              }
            ]
          }`
        }
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Resposta vazia da IA');
    
    return JSON.parse(content).questions;
  } catch (error) {
    console.error('Erro ao gerar perguntas:', error);
    throw new Error('Erro ao gerar perguntas de feedback');
  }
}

export async function generateFeedbackAnalysis(responses: FeedbackResponse[], maxLength: number = 350): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é um analista profissional que gera feedback construtivo em primeira pessoa.
          Analise as seguintes respostas e gere um feedback personalizado:
          ${JSON.stringify(responses, null, 2)}
          
          Regras:
          - O feedback DEVE ter EXATAMENTE ${maxLength} caracteres
          - Use SEMPRE primeira pessoa (eu, meu, minha)
          - Comece com "Eu" ou "Gostei" ou "Adorei" ou similar
          - Seja direto e objetivo
          - Use linguagem profissional mas amigável
          - Foque nos pontos principais das respostas
          - Evite repetições
          - Mantenha um tom construtivo e motivador
          - Personalize o feedback baseado nas respostas específicas
          - Inclua sugestões de melhoria quando relevante
          - IMPORTANTE: Ajuste o texto para ter exatamente ${maxLength} caracteres, sem cortar palavras no meio
          
          Exemplos de início:
          - "Eu adorei a forma como você..."
          - "Gostei muito da sua abordagem..."
          - "Adorei ver como você..."
          - "Eu fiquei impressionado com..."
          - "Me surpreendeu positivamente..."`
        }
      ],
    });

    const feedback = response.choices[0]?.message?.content || 'Não foi possível gerar o feedback.';
    
    // Se o feedback for maior que o tamanho máximo, ajusta para o tamanho exato
    if (feedback.length > maxLength) {
      // Encontra o último espaço antes do limite
      const lastSpace = feedback.substring(0, maxLength).lastIndexOf(' ');
      return feedback.substring(0, lastSpace);
    }
    
    // Se for menor, adiciona espaços até atingir o tamanho exato
    if (feedback.length < maxLength) {
      return feedback + ' '.repeat(maxLength - feedback.length);
    }
    
    return feedback;
  } catch (error) {
    console.error('Erro ao gerar análise:', error);
    throw new Error('Erro ao gerar análise de feedback');
  }
}

export async function sendMessageToAI(message: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um assistente prestativo e amigável."
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    return response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
  } catch (error) {
    console.error('Erro ao chamar API do OpenAI:', error);
    throw new Error('Erro ao comunicar com a IA');
  }
} 