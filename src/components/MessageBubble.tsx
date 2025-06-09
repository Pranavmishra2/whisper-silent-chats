
import React from 'react';
import { Play, Pause, Volume2, Clock, Mic2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  type: 'text' | 'whisper' | 'voice';
  sender: 'user' | 'other';
  timestamp: Date;
  audioUrl?: string;
  isPlaying?: boolean;
  volume?: number;
}

interface MessageBubbleProps {
  message: Message;
  onPlayWhisper: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onPlayWhisper }) => {
  const isUser = message.sender === 'user';
  const isWhisper = message.type === 'whisper';
  const isVoice = message.type === 'voice';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <Card
          className={`p-3 ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700'
              : 'bg-card text-card-foreground border-border'
          } ${(isWhisper || isVoice) ? 'shadow-md' : 'shadow-sm'} transition-all duration-200`}
        >
          {/* Message Type Header */}
          {(isWhisper || isVoice) && (
            <div className={`flex items-center space-x-2 mb-2 pb-2 border-b ${
              isUser ? 'border-blue-400' : 'border-border'
            }`}>
              {isWhisper ? (
                <Volume2 className="h-3 w-3 opacity-70" />
              ) : (
                <Mic2 className="h-3 w-3 opacity-70" />
              )}
              <span className="text-xs font-medium opacity-70">
                {isWhisper ? 'Whisper Message' : 'Voice Message'}
              </span>
              {isVoice && message.volume && (
                <span className="text-xs opacity-60">
                  Vol: {Math.round(message.volume * 100)}%
                </span>
              )}
            </div>
          )}

          {/* Message Text */}
          <p className="text-sm leading-relaxed mb-2 break-words">{message.text}</p>

          {/* Audio Controls */}
          {(isWhisper || isVoice) && (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPlayWhisper(message.id)}
                className={`h-8 px-2 text-xs ${
                  isUser
                    ? 'text-white hover:bg-blue-400 dark:hover:bg-blue-500'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {message.isPlaying ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    <span>Play</span>
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
                          isUser ? 'bg-blue-200 dark:bg-blue-300' : 'bg-muted-foreground'
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
          <div className={`flex items-center justify-end mt-2 text-xs ${
            isUser ? 'text-blue-100 dark:text-blue-200' : 'text-muted-foreground'
          }`}>
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatTime(message.timestamp)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MessageBubble;
