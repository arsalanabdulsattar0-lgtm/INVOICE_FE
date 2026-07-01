import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { useTheme } from '../../context/ThemeContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const { brand } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your Antigravity Assistant. How can I help you with your invoices today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // ── Listen for AI command detail events ──
  useEffect(() => {
    const handler = (e: any) => {
      const q = e.detail?.query;
      if (q) {
        setIsOpen(true);
        setInput(q);
        // Trigger send after opening
        setTimeout(() => {
          handleSend();
        }, 0);
      }
    };
    window.addEventListener('ai-command-detail', handler as EventListener);
    return () => {
      window.removeEventListener('ai-command-detail', handler as EventListener);
    };
  }, []);


  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getMockResponse(input),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getMockResponse = (query: string) => {
    const q = query.toLowerCase();
    if (q.includes('invoice')) return 'You can create and manage invoices in the Invoices section. Use the V4 editor for the best experience!';
    if (q.includes('tax')) return 'Tax rates can be adjusted in the Financial Matrix section at the bottom of the invoice editor.';
    if (q.includes('currency')) return 'We support multiple currencies including USD, EUR, and PKR. You can see the symbol update in the totals section.';
    return "That's a great question! I'm here to help you navigate the Antigravity Invoice system. Is there anything specific about the layout or features you'd like to know?";
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Header */}
            <div className="p-4 text-white flex items-center justify-between" style={{ backgroundColor: brand.primary }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Antigravity AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-white/70 font-medium">Online & Ready</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost" size="xs" icon={X}
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-white border-none cursor-pointer"
              />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-700 rounded-tl-none'
                    }`}
                    style={msg.sender === 'user' ? { backgroundColor: brand.primary } : {}}
                  >
                    {msg.text}
                    <div
                      className={`text-[9px] mt-1 opacity-50 ${
                        msg.sender === 'user' ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none transition-all"
                  style={{
                    borderColor: inputFocus ? brand.primary : '#E2E8F0',
                    boxShadow: inputFocus ? `0 0 0 2px ${brand.primary}22` : undefined
                  }}
                  onFocus={() => setInputFocus(true)}
                  onBlur={() => setInputFocus(false)}
                />
                <Button
                  variant="primary" size="xs" icon={Send}
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 p-2 cursor-pointer"
                  style={{ backgroundColor: brand.primary }}
                />
              </div>
              <p className="text-[9px] text-center text-slate-400 mt-2 font-medium">
                Powered by Generix Global
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button - only visible when closed */}
      {!isOpen && (
        <Button
          variant="primary"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-2xl p-0 shadow-xl cursor-pointer"
          style={{ 
            backgroundColor: brand.primary,
            boxShadow: `0 10px 25px -5px ${brand.primary}66`
          }}
        >
          <div className="relative flex items-center justify-center w-full h-full">
            <MessageSquare className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2" style={{ borderColor: brand.primary }} />
          </div>
        </Button>
      )}
    </div>
  );
};

export default AIAssistant;
