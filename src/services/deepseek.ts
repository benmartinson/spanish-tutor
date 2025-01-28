
import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const systemPrompt = `You are a Spanish language tutor. Always respond in both Spanish and English.
Keep responses concise and focused on teaching Spanish effectively.`;

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      },
      {
        headers: {
          'Authorization': `Bearer sk-da7d63da87954d4689393ce4622900f5`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return 'Lo siento, hubo un error. (Sorry, there was an error.)';
  }
}
