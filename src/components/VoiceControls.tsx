
import React from 'react';
import { Send, Mic, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface VoiceControlsProps {
  settings: {
    speed: number;
    pitch: number;
    volume: number;
  };
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: (asWhisper?: boolean) => void;
  isConverting: boolean;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  settings,
  inputText,
  onInputChange,
  onSendMessage,
  isConverting
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(false);
    }
  };

  return (
    <Card className="m-4 p-4 bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
      {/* Voice Settings Preview */}
      <div className="mb-3 p-2 bg-slate-50 rounded-lg">
        <div className="text-xs text-slate-600 mb-1">Whisper Settings</div>
        <div className="flex space-x-4 text-xs">
          <span className="text-slate-500">
            Speed: <span className="font-medium">{Math.round(settings.speed * 100)}%</span>
          </span>
          <span className="text-slate-500">
            Pitch: <span className="font-medium">{Math.round(settings.pitch * 100)}%</span>
          </span>
          <span className="text-slate-500">
            Volume: <span className="font-medium">{Math.round(settings.volume * 100)}%</span>
          </span>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isConverting}
            className="border-slate-300 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
        
        {/* Send Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={() => onSendMessage(false)}
            disabled={!inputText.trim() || isConverting}
            variant="outline"
            size="sm"
            className="px-3 border-slate-300 hover:bg-slate-50"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => onSendMessage(true)}
            disabled={!inputText.trim() || isConverting}
            className="px-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {isConverting ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-2 text-xs text-slate-500 text-center">
        <MessageSquare className="inline h-3 w-3 mr-1" />
        Send as text or 
        <Mic className="inline h-3 w-3 mx-1" />
        convert to whisper
      </div>
    </Card>
  );
};

export default VoiceControls;
