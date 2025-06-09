
import React from 'react';
import { Play, Pause, Volume2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  type: 'text' | 'whisper';
  sender: 'user' | 'other';
  timestamp: Date;
  audioUrl?: string;
  isPlaying?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onPlayWhisper: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onPlayWhisper }) => {
  const isUser = message.sender === 'user';
  const isWhisper = message.type === 'whisper';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <Card
          className={`p-3 ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-white text-slate-800 border-slate-200'
          } ${isWhisper ? 'shadow-md' : 'shadow-sm'} transition-all duration-200`}
        >
          {/* Whisper Header */}
          {isWhisper && (
            <div className={`flex items-center space-x-2 mb-2 pb-2 border-b ${
              isUser ? 'border-blue-400' : 'border-slate-200'
            }`}>
              <Volume2 className="h-3 w-3 opacity-70" />
              <span className="text-xs font-medium opacity-70">Whisper Message</span>
            </div>
          )}

          {/* Message Text */}
          <p className="text-sm leading-relaxed mb-2">{message.text}</p>

          {/* Whisper Controls */}
          {isWhisper && (
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPlayWhisper(message.id)}
                className={`h-8 px-2 ${
                  isUser
                    ? 'text-white hover:bg-blue-400'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {message.isPlaying ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    <span className="text-xs">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    <span className="text-xs">Play</span>
                  </>
                )}
              </Button>
              
              {message.isPlaying && (
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 ${
                          isUser ? 'bg-blue-200' : 'bg-slate-400'
                        } rounded-full animate-pulse`}
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className={`flex items-center justify-end mt-2 ${
            isUser ? 'text-blue-100' : 'text-slate-400'
          }`}>
            <Clock className="h-3 w-3 mr-1" />
            <span className="text-xs">{formatTime(message.timestamp)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MessageBubble;
