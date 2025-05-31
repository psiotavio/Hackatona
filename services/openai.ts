import OpenAI from 'openai';

// TODO: Mover para variáveis de ambiente
const OPENAI_API_KEY = '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';

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