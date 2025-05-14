
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingsProps {
  settings: {
    alertVolume: number;
    detectionSensitivity: string;
  };
  onSettingsChange: (newSettings: any) => void;
}

const SettingsDialog: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
  const handleVolumeChange = (value: number[]) => {
    onSettingsChange({ ...settings, alertVolume: value[0] });
  };

  const handleSensitivityChange = (value: string) => {
    onSettingsChange({ ...settings, detectionSensitivity: value });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>System Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Alert Sound Volume ({settings.alertVolume}%)</Label>
            <Slider 
              value={[settings.alertVolume]} 
              onValueChange={handleVolumeChange}
              max={100} 
              step={1} 
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Detection Sensitivity</Label>
            <Select value={settings.detectionSensitivity} onValueChange={handleSensitivityChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sensitivity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {settings.detectionSensitivity === 'High' && 'High sensitivity may increase false positives.'}
              {settings.detectionSensitivity === 'Medium' && 'Balanced detection for most environments.'}
              {settings.detectionSensitivity === 'Low' && 'Fewer alerts but may miss smaller movements.'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
