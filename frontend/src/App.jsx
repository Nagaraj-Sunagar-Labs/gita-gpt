import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { askGita } from './api';
import ChatMessage from './components/ChatMessage';
import { motion } from 'framer-motion';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Namaste. I am Gita GPT. How may I assist you on your journey today? Share your thoughts, and we shall find guidance in the eternal song.",
      quotes: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message immediately
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const data = await askGita(userMessage);

      const botMessage = {
        role: 'assistant',
        content: data.guidance,
        quotes: data.quotes || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError("The connection to the wisdom source is momentarily clouded. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden">

      {/* Header */}
      <header className="py-6 backdrop-blur-sm sticky top-0 z-20 flex justify-center items-center border-b border-amber-200/40 bg-white/30 shadow-sm">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-cinzel spiritual-title font-bold text-center tracking-wider dropshadow-sm">
            Gita GPT
          </h1>
          <div className="flex items-center gap-2 mt-2 opacity-90">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-600"></div>
            <p className="text-amber-900 text-xs tracking-[0.3em] uppercase font-medium">Eternal Wisdom</p>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-600"></div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto w-full px-4 pb-32 pt-4 scroll-smooth">
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 p-4 text-amber-700/80 animate-pulse justify-center py-8">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 blur-lg opacity-30 animate-ping"></div>
                <Sparkles className="animate-spin-slow text-amber-600 relative z-10" size={24} />
              </div>
              <span className="font-cinzel tracking-widest text-sm font-medium">Contemplating...</span>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel text-red-700 p-4 rounded-lg flex items-center gap-3 max-w-2xl mx-auto my-4 border-red-500/30 bg-red-50/80"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-orange-50/90 via-orange-50/80 to-transparent pb-8 pt-12">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          {/* Glowing Aura */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-1000"></div>

          <div className="relative flex items-center gap-4 glass-panel rounded-xl p-2 pr-3 transition-all bg-white/70">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Arjuna's questions..."
              className="flex-1 bg-transparent border-none outline-none text-amber-950 placeholder-amber-900/40 px-4 py-3 text-lg font-light tracking-wide"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>

          <div className="text-center mt-3 opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-xs text-amber-900/70 font-cinzel font-medium">AI generated guidance based on Bhagavad Gita</span>
          </div>
        </form>
      </footer>
    </div>
  );
}

export default App;
