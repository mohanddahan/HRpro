
import React, { useState, useRef, useEffect } from 'react';
import { askHRAssistant } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'أهلاً بك! أنا مساعد HR الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنني كتابة وصف وظيفي، أو صياغة بريد إلكتروني، أو تقديم نصائح إدارية.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const aiResponse = await askHRAssistant(userMsg);
    setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] lg:h-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] lg:max-w-[80%] p-3 lg:p-4 rounded-2xl shadow-sm text-xs lg:text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 lg:p-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="اسأل المساعد الذكي..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 text-white p-2 rounded-xl w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isLoading ? '...' : '✈️'}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center truncate">
          يعمل بواسطة Gemini AI - يرجى مراجعة المخرجات.
        </p>
      </form>
    </div>
  );
};
