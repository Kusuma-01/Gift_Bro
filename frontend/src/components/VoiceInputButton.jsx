import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

export default function VoiceInputButton({ onVoiceStart, onVoiceUpdate, onVoiceEnd, disabled = false, language = 'en-US' }) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'transcribing'
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Voice input is not supported in this browser. You can type your description instead.");
      return;
    }

    try {
      if (onVoiceStart) onVoiceStart();

      const recognition = new SpeechRecognition();
      recognition.continuous = true; // allow continuous speech while button is active
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        setStatus('listening');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript && transcript.trim()) {
          setStatus('transcribing');
          if (onVoiceUpdate) {
            onVoiceUpdate(transcript.trim());
          }
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        setStatus('idle');
        console.warn('Speech recognition error:', event.error);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError("Microphone permission was denied. Please allow microphone access or type your description instead.");
        } else if (event.error === 'no-speech') {
          setError("No speech detected. Please try speaking again or type your description.");
        } else {
          setError("Voice input experienced an error. Please type your description instead.");
        }

        if (onVoiceEnd) onVoiceEnd();
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatus('idle');
        if (onVoiceEnd) onVoiceEnd();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setStatus('idle');
      console.warn('Failed to start speech recognition:', err);
      setError("Unable to access microphone. Please type your description instead.");
      if (onVoiceEnd) onVoiceEnd();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore if already stopped
      }
    }
    setIsListening(false);
    setStatus('idle');
    if (onVoiceEnd) onVoiceEnd();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
          isListening
            ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-200 animate-pulse'
            : !isSupported
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-orange-50/80 text-brand-700 border-orange-200 hover:bg-orange-100 hover:border-brand-300 shadow-xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={
          !isSupported
            ? 'Voice input is not supported in this browser'
            : isListening
            ? 'Click to stop listening'
            : 'Click to dictate description with your voice'
        }
      >
        {isListening ? (
          <>
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <MicOff className="w-3.5 h-3.5 text-rose-600" />
            <span>[ 🎙 Listening... Stop ]</span>
          </>
        ) : (
          <>
            <Mic className={`w-3.5 h-3.5 ${isSupported ? 'text-brand-600' : 'text-slate-400'}`} />
            <span>{isSupported ? '🎤 Dictate (Voice Input)' : 'Voice Input (Unsupported)'}</span>
          </>
        )}
      </button>

      {/* Accessible Error / Warning Notice */}
      {error && (
        <div className="mt-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5 animate-in fade-in duration-200 max-w-md">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-amber-600 hover:text-amber-900 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
