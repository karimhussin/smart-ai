import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeBase, TranscriptionEntry } from '../types';
import { SYSTEM_PROMPT_VOICE_TEMPLATE } from '../constants';
import { GoogleGenAI } from '@google/genai';

interface VoiceInterfaceProps {
  kb: KnowledgeBase;
  onExit: () => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ kb, onExit }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptionEntry[]>([]);
  const [currentUserText, setCurrentUserText] = useState('');
  const [error, setError] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ar-SA';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setCurrentUserText(text);
        addToTranscript('user', text);
        setIsListening(false);
        handleUserMessage(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError('حدث خطأ في التعرف على الصوت');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const addToTranscript = (role: 'user' | 'assistant', text: string) => {
    setTranscript(prev => [...prev, {
      role,
      text,
      timestamp: new Date()
    }]);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('متصفحك لا يدعم التعرف على الصوت');
      return;
    }

    setError('');
    setCurrentUserText('');
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleUserMessage = async (message: string) => {
    setIsProcessing(true);
    setError('');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as any).GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('API Key غير موجود. يرجى إضافة GEMINI_API_KEY في ملف .env.local');
      }

      const genAI = new GoogleGenAI({ apiKey });

      const systemPrompt = SYSTEM_PROMPT_VOICE_TEMPLATE(kb);
      const fullPrompt = `${systemPrompt}\n\nالمستخدم: ${message}\n\nالرد:`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: fullPrompt,
      });
      const responseText = response.text;

      addToTranscript('assistant', responseText);
      speak(responseText);
    } catch (err: any) {
      console.error('Error processing message:', err);
      setError(err.message || 'حدث خطأ في معالجة الرسالة');
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) {
      console.warn('Speech synthesis not supported');
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find Arabic voice
    const voices = synthRef.current.getVoices();
    const arabicVoice = voices.find(voice => voice.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const clearTranscript = () => {
    setTranscript([]);
    setCurrentUserText('');
    setError('');
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">الواجهة الصوتية</h2>
              <p className="text-purple-100 text-sm">تحدث مع المساعد الذكي</p>
            </div>
            <button
              onClick={onExit}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold transition-all"
            >
              خروج
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm text-right">{error}</p>
          </div>
        )}

        {/* Transcript */}
        <div className="p-6 min-h-[400px] max-h-[500px] overflow-y-auto bg-gray-50">
          {transcript.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">ابدأ المحادثة</h3>
                <p className="text-gray-500 text-sm">اضغط على زر الميكروفون للبدء</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                      entry.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900 border-2 border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed text-right">{entry.text}</p>
                    <p
                      className={`text-xs mt-1 text-right ${
                        entry.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                      }`}
                    >
                      {entry.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex justify-center items-center gap-4">
            {/* Microphone Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Stop Speaking Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-all shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Clear Transcript */}
            {transcript.length > 0 && (
              <button
                onClick={clearTranscript}
                disabled={isListening || isProcessing || isSpeaking}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                مسح المحادثة
              </button>
            )}
          </div>

          {/* Status */}
          <div className="text-center mt-4">
            {isListening && (
              <p className="text-indigo-600 font-bold animate-pulse">🎤 جاري الاستماع...</p>
            )}
            {isProcessing && (
              <p className="text-purple-600 font-bold animate-pulse">⚡ جاري المعالجة...</p>
            )}
            {isSpeaking && (
              <p className="text-orange-600 font-bold animate-pulse">🔊 جاري التحدث...</p>
            )}
            {!isListening && !isProcessing && !isSpeaking && (
              <p className="text-gray-400 text-sm">اضغط على الميكروفون للتحدث</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
