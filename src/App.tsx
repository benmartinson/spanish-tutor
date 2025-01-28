import { useState, useEffect } from 'react'
import './App.css';
import { getChatResponse, ChatMessage } from './services/deepseek';

interface Message {
  id?: number;
  text: string;
  isBot: boolean;
  created_at?: string;
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []); // Empty dependency array means this runs once when component mounts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const chatHistory: ChatMessage[] = messages.map(msg => ({
      role: msg.isBot ? 'assistant' : 'user',
      content: msg.text
    }));

    try {
      const response = await getChatResponse([...chatHistory, { role: 'user', content: input }]);
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: 'Lo siento, hubo un error. (Sorry, there was an error.)', isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <header className="header">
          <h1>Spanish Tutor</h1>
          <p>Practice Spanish conversations</p>
        </header>

        <div className="chat-container">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.isBot ? 'bot' : 'user'}`}
            >
              <div className="message-content">
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="input-form"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message in English..."
            className="input-field"
            disabled={isLoading}
          />
          <button 
            type="submit"
            className="send-button"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </main>
    </div>
  )
}

export default App