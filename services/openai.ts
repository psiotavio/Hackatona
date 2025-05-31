import OpenAI from 'openai';

// TODO: Mover para variáveis de ambiente
const OPENAI_API_KEY = 'sua-chave-api-aqui';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

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