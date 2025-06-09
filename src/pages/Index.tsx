
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Play, Pause, Settings, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import MessageBubble from '@/components/MessageBubble';
import VoiceControls from '@/components/VoiceControls';
import SettingsPanel from '@/components/SettingsPanel';

interface Message {
  id: string;
  text: string;
  type: 'text' | 'whisper';
  sender: 'user' | 'other';
  timestamp: Date;
  audioUrl?: string;
  isPlaying?: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey there! This is a whisper message.',
      type: 'whisper',
      sender: 'other',
      timestamp: new Date(Date.now() - 300000),
      audioUrl: 'sample'
    },
    {
      id: '2',
      text: 'That sounds perfect for quiet spaces!',
      type: 'text',
      sender: 'user',
      timestamp: new Date(Date.now() - 120000)
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [whisperSettings, setWhisperSettings] = useState({
    speed: 0.8,
    pitch: 0.7,
    volume: 0.3
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (asWhisper = false) => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      type: asWhisper ? 'whisper' : 'text',
      sender: 'user',
      timestamp: new Date()
    };

    if (asWhisper) {
      setIsConverting(true);
      // Simulate TTS conversion
      setTimeout(() => {
        newMessage.audioUrl = 'generated-whisper-' + Date.now();
        setMessages(prev => [...prev, newMessage]);
        setIsConverting(false);
      }, 1500);
    } else {
      setMessages(prev => [...prev, newMessage]);
    }

    setInputText('');
  };

  const handlePlayWhisper = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isPlaying: !msg.isPlaying }
          : { ...msg, isPlaying: false }
      )
    );

    // Simulate audio playback
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isPlaying: false } : msg
        )
      );
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Volume2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">SilentVoice</h1>
            <p className="text-sm text-slate-500">Whisper conversations</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-slate-600 hover:text-slate-800"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          settings={whisperSettings}
          onSettingsChange={setWhisperSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onPlayWhisper={handlePlayWhisper}
          />
        ))}
        {isConverting && (
          <div className="flex justify-end">
            <Card className="max-w-xs p-3 bg-blue-500 text-white">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="text-sm">Converting to whisper...</span>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Controls */}
      <VoiceControls
        settings={whisperSettings}
        inputText={inputText}
        onInputChange={setInputText}
        onSendMessage={handleSendMessage}
        isConverting={isConverting}
      />
    </div>
  );
};

export default Index;
