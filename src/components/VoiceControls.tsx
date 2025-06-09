
import React, { useState } from 'react';
import { Send, Mic, MessageSquare, Mic2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import VoiceRecorder from './VoiceRecorder';

interface VoiceControlsProps {
  settings: {
    speed: number;
    pitch: number;
    volume: number;
  };
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: (asWhisper?: boolean) => void;
  onSendVoiceMessage: (audioBlob: Blob, volume: number) => void;
  isConverting: boolean;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  settings,
  inputText,
  onInputChange,
  onSendMessage,
  onSendVoiceMessage,
  isConverting
}) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(false);
    }
  };

  const handleSendRecording = (audioBlob: Blob, volume: number) => {
    onSendVoiceMessage(audioBlob, volume);
    setShowVoiceRecorder(false);
  };

  if (showVoiceRecorder) {
    return (
      <div className="p-4">
        <VoiceRecorder
          onSendRecording={handleSendRecording}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      </div>
    );
  }

  return (
    <Card className="m-4 p-4 bg-card/90 backdrop-blur-sm border-border shadow-lg">
      {/* Voice Settings Preview */}
      <div className="mb-3 p-2 bg-muted rounded-lg">
        <div className="text-xs text-muted-foreground mb-1">Whisper Settings</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-muted-foreground">
            Speed: <span className="font-medium text-foreground">{Math.round(settings.speed * 100)}%</span>
          </span>
          <span className="text-muted-foreground">
            Pitch: <span className="font-medium text-foreground">{Math.round(settings.pitch * 100)}%</span>
          </span>
          <span className="text-muted-foreground">
            Volume: <span className="font-medium text-foreground">{Math.round(settings.volume * 100)}%</span>
          </span>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isConverting}
            className="border-border focus:border-primary focus:ring-primary"
          />
        </div>
        
        {/* Send Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={() => onSendMessage(false)}
            disabled={!inputText.trim() || isConverting}
            variant="outline"
            size="sm"
            className="px-3 border-border hover:bg-muted"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => onSendMessage(true)}
            disabled={!inputText.trim() || isConverting}
            size="sm"
            className="px-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {isConverting ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          <Button
            onClick={() => setShowVoiceRecorder(true)}
            variant="outline"
            size="sm"
            className="px-3 border-border hover:bg-muted"
          >
            <Mic2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-2 text-xs text-muted-foreground text-center flex flex-wrap justify-center gap-2">
        <span className="flex items-center">
          <MessageSquare className="inline h-3 w-3 mr-1" />
          Text
        </span>
        <span className="flex items-center">
          <Mic className="inline h-3 w-3 mr-1" />
          Text-to-voice
        </span>
        <span className="flex items-center">
          <Mic2 className="inline h-3 w-3 mr-1" />
          Voice record
        </span>
      </div>
    </Card>
  );
};

export default VoiceControls;
