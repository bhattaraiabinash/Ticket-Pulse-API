import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Ticket, Sparkles, Bot, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../../services/api';
import { Event } from '../../types';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionButtons?: { label: string; action: () => void }[];
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem('ticketpulse_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: '1',
        sender: 'bot',
        text: 'Namaste & Welcome to TicketPulse! 🎟️ How can I assist you with events or seat bookings today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem('ticketpulse_chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // TODO: Replace rule-based responses with Claude API or OpenAI when API key available
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      let botResponse = '';
      let actionButtons: { label: string; action: () => void }[] | undefined = undefined;

      const lower = query.toLowerCase();

      if (lower.includes('event') || lower.includes('available') || lower.includes('show') || lower.includes('concert')) {
        try {
          const events: Event[] = await eventsApi.getEvents();
          if (events && events.length > 0) {
            botResponse = `Here are the currently available top events on TicketPulse:\n\n` +
              events.map((e, idx) => `${idx + 1}. **${e.title}** (${e.available_tickets} seats left)`).join('\n');
            actionButtons = [
              { label: 'Browse All Events 🎟️', action: () => { setIsOpen(false); navigate('/events'); } },
            ];
          } else {
            botResponse = 'Currently no events are listed. Check back soon!';
          }
        } catch (e) {
          botResponse = 'I could not fetch live events at the moment. Please visit our Events page directly!';
          actionButtons = [
            { label: 'Go to Events Page', action: () => { setIsOpen(false); navigate('/events'); } },
          ];
        }
      } else if (lower.includes('how to book') || lower.includes('book') || lower.includes('step')) {
        botResponse = `Booking on TicketPulse is super easy:\n1️⃣ Select an event from our list.\n2️⃣ Choose your desired seats (A1, A2...) on the interactive seat grid.\n3️⃣ Complete payment within 10 minutes to lock your seats!\n4️⃣ Get instant QR ticket delivered to your email.`;
        actionButtons = [
          { label: 'Explore Events Now', action: () => { setIsOpen(false); navigate('/events'); } },
        ];
      } else if (lower.includes('pay') || lower.includes('time') || lower.includes('hold') || lower.includes('limit')) {
        botResponse = `⏱️ **10-Minute Lock Guarantee**: Once you reserve your seats, PostgreSQL row locks guarantee nobody else can take them for **10 minutes**. Complete confirmation before the timer expires!`;
      } else if (lower.includes('cancel') || lower.includes('refund')) {
        botResponse = `ℹ️ Ticket cancellations depend on the organizer's policy. Generally, tickets confirmed can be managed or transferred via your Dashboard up to 24 hours before event start.`;
      } else if (lower.includes('ticket') || lower.includes('email') || lower.includes('pdf') || lower.includes('qr')) {
        botResponse = `📧 Immediately upon confirmation, our Celery async worker generates a PDF ticket with a secure verification QR code and dispatches it straight to your email.`;
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        botResponse = `Hello there! 👋 I am the TicketPulse AI Assistant. Ask me about upcoming events, seat availability, or how our 10-minute instant booking works!`;
      } else {
        botResponse = `I am trained to help you with event ticketing, seat selection, pricing, and booking policies on TicketPulse. Try asking "What events are available?" or "How do I book?"`;
        actionButtons = [
          { label: 'What events are available?', action: () => handleSendMessage('What events are available?') },
          { label: 'How long do I have to pay?', action: () => handleSendMessage('How long do I have to pay?') },
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButtons,
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const quickChips = [
    'What events are available?',
    'How do I book?',
    'How long do I have to pay?',
    'How do I get my ticket?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-4 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] rounded-3xl glass-card border border-indigo-500/20 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-600"></span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm leading-tight flex items-center gap-1.5">
                    TicketPulse AI <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  </h3>
                  <p className="text-[11px] text-indigo-100 opacity-90">Real-time Ticketing Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                        : 'bg-surface border border-border text-foreground rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    {msg.actionButtons && (
                      <div className="mt-2.5 flex flex-col gap-1.5 pt-1 border-t border-border/40">
                        {msg.actionButtons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={btn.action}
                            className="text-left px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold transition-colors flex items-center justify-between"
                          >
                            <span>{btn.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                    <span
                      className={`text-[9px] block mt-1 ${
                        msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-muted-foreground'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-border p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="px-3 py-1.5 overflow-x-auto flex gap-1.5 border-t border-border/40 bg-surface/40 no-scrollbar">
              {quickChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(chip)}
                  className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-surface border border-border/80 text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/40 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-border bg-surface/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask TicketPulse..."
                  className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-colors shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-4 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center focus:outline-none"
      >
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-indigo-500 opacity-75 animate-ping group-hover:opacity-100"></span>
        )}
        <div className="relative flex items-center justify-center">
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </div>
      </motion.button>
    </div>
  );
};
