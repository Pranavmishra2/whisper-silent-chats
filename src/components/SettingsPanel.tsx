
import React from 'react';
import { X, Volume2, Gauge, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface SettingsPanelProps {
  settings: {
    speed: number;
    pitch: number;
    volume: number;
  };
  onSettingsChange: (settings: { speed: number; pitch: number; volume: number }) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose
}) => {
  const updateSetting = (key: keyof typeof settings, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card className="m-4 p-4 bg-white border-slate-200 shadow-lg animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Whisper Settings</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="mb-4" />

      {/* Speed Control */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2">
          <Gauge className="h-4 w-4 text-blue-500" />
          <Label className="font-medium">Speech Speed</Label>
        </div>
        <div className="px-3">
          <Slider
            value={[settings.speed]}
            onValueChange={(value) => updateSetting('speed', value[0])}
            max={1.5}
            min={0.3}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Slow</span>
            <span>{Math.round(settings.speed * 100)}%</span>
            <span>Fast</span>
          </div>
        </div>
      </div>

      {/* Pitch Control */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2">
          <Music className="h-4 w-4 text-purple-500" />
          <Label className="font-medium">Voice Pitch</Label>
        </div>
        <div className="px-3">
          <Slider
            value={[settings.pitch]}
            onValueChange={(value) => updateSetting('pitch', value[0])}
            max={1.2}
            min={0.5}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Low</span>
            <span>{Math.round(settings.pitch * 100)}%</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-green-500" />
          <Label className="font-medium">Whisper Volume</Label>
        </div>
        <div className="px-3">
          <Slider
            value={[settings.volume]}
            onValueChange={(value) => updateSetting('volume', value[0])}
            max={0.8}
            min={0.1}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Quiet</span>
            <span>{Math.round(settings.volume * 100)}%</span>
            <span>Audible</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Lower volume and pitch settings create more natural whisper effects
          perfect for quiet environments.
        </p>
      </div>
    </Card>
  );
};

export default SettingsPanel;
