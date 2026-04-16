import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendMessage } from '../../services/geminiService.js';
import { startListening, speak, stopSpeaking, isSpeechSupported, isTTSSupported } from '../../services/voiceService.js';
import './ChatPanel.css';

const QUICK_QUERIES = [
  { label: '🚪 Best Gate to Enter?', query: 'Which gate should I enter from?' },
  { label: '🍕 Nearest Food Stall?', query: 'What is the nearest food stall and what do they serve?' },
  { label: '🚻 Nearest Washroom?', query: 'Where is the nearest washroom?' },
  { label: '📊 Least Crowded Area?', query: 'Which area is least crowded right now?' },
  { label: '🚗 Parking Info?', query: 'Where can I park my vehicle?' },
  { label: '🚇 How to Reach?', query: 'How do I reach the stadium by metro or bus?' },
];

export default function ChatPanel({ crowdData, userData }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'model',
      content: '👋 **Welcome to StadiumAI Companion!**\n\nI\'m your AI guide for **Narendra Modi Stadium, Ahmedabad** — the world\'s largest cricket stadium!\n\nI can help you with:\n- 🚪 Gate entry & navigation\n- 🎫 Finding your seat\n- 🍕 Food stalls & menus\n- 🚻 Washroom locations\n- 📊 Real-time crowd updates\n- 🆘 Emergency assistance\n\nAsk me anything or tap a quick query below! 🏏',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatHistory = messages.slice(1).map(m => ({
    role: m.role,
    content: m.content,
  }));

  const sendMsg = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(text.trim(), chatHistory, crowdData, userData);
      const aiMsg = {
        id: Date.now() + 1,
        role: 'model',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      if (autoSpeak) {
        speak(response, voiceLang);
        setIsSpeakingTTS(true);
        const interval = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsSpeakingTTS(false);
            clearInterval(interval);
          }
        }, 300);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'model',
        content: '⚠️ Something went wrong. Please try again.',
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, chatHistory, crowdData, autoSpeak, voiceLang]);

  const handleSubmit = e => {
    e.preventDefault();
    sendMsg(input);
  };

  const handleVoiceInput = async () => {
    if (!isSpeechSupported) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }
    setIsListening(true);
    try {
      const transcript = await startListening(voiceLang);
      setInput(transcript);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Voice error:', err);
    } finally {
      setIsListening(false);
    }
  };

  const toggleSpeak = lastAIMsg => {
    if (isSpeakingTTS) {
      stopSpeaking();
      setIsSpeakingTTS(false);
    } else if (lastAIMsg) {
      speak(lastAIMsg.content, voiceLang);
      setIsSpeakingTTS(true);
    }
  };

  const lastAIMsg = [...messages].reverse().find(m => m.role === 'model');

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="ai-avatar">
            <span>🏏</span>
          </div>
          <div>
            <h2>StadiumAI</h2>
            <span className="status-dot">● Live</span>
          </div>
        </div>
        <div className="chat-header-controls">
          <select
            className="lang-select"
            value={voiceLang}
            onChange={e => setVoiceLang(e.target.value)}
            title="Voice Language"
          >
            <option value="en-US">🇬🇧 English</option>
            <option value="hi-IN">🇮🇳 Hindi</option>
          </select>
          {isTTSSupported && (
            <button
              className={`icon-btn ${autoSpeak ? 'active' : ''}`}
              onClick={() => setAutoSpeak(v => !v)}
              title={autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF'}
            >
              {autoSpeak ? '🔊' : '🔇'}
            </button>
          )}
          {isTTSSupported && lastAIMsg && (
            <button
              className={`icon-btn ${isSpeakingTTS ? 'active pulse' : ''}`}
              onClick={() => toggleSpeak(lastAIMsg)}
              title={isSpeakingTTS ? 'Stop speaking' : 'Speak last response'}
            >
              {isSpeakingTTS ? '⏹' : '▶️'}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}>
            {msg.role === 'model' && (
              <div className="msg-avatar">🤖</div>
            )}
            <div className={`message-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              <span className="msg-time">
                {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {msg.role === 'user' && <div className="msg-avatar user-avatar">👤</div>}
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper ai">
            <div className="msg-avatar">🤖</div>
            <div className="message-bubble ai loading-bubble">
              <span className="spinner"></span>
              Analyzing crowd data...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Queries */}
      <div className="quick-queries">
        <button
          className="quick-btn exit-btn"
          onClick={() => sendMsg('Best Exit Now')}
          disabled={isLoading}
        >
          🏃‍♂️ Best Exit Now
        </button>
        {QUICK_QUERIES.map((q, i) => (
          <button
            key={i}
            className="quick-btn"
            onClick={() => sendMsg(q.query)}
            disabled={isLoading}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form className="chat-input-area" onSubmit={handleSubmit}>
        {isListening && (
          <div className="listening-banner">
            <span className="mic-pulse">🎙</span> Listening… speak now
          </div>
        )}
        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Ask about gates, food, washrooms, crowd…"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading || isListening}
          />
          {isSpeechSupported && (
            <button
              type="button"
              className={`icon-btn mic-btn ${isListening ? 'active pulse' : ''}`}
              onClick={handleVoiceInput}
              disabled={isLoading}
              title="Voice input"
            >
              {isListening ? '⏹' : '🎙'}
            </button>
          )}
          <button
            type="submit"
            className="send-btn"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '⟳' : '➤'}
          </button>
        </div>
      </form>
    </div>
  );
}
