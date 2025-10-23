import { useState, useRef } from 'react';
import { X, Upload, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from './UserAvatar';
import { useChatStore } from '@/lib/store';
import { ThemeToggle } from './ThemeToggle';

interface ProfileSettingsProps {
  onClose: () => void;
  onUpdateProfile: (data: { displayName?: string; username?: string }) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onSignOut: () => void;
}

export function ProfileSettings({ onClose, onUpdateProfile, onUploadAvatar, onSignOut }: ProfileSettingsProps) {
  const currentUser = useChatStore((state) => state.currentUser);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdateProfile({ displayName, username });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        await onUploadAvatar(file);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="settings-panel">
      <Card className="w-full max-w-md border-card-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Customize your profile and preferences</CardDescription>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-settings" className="hover-elevate active-elevate-2">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <UserAvatar
              userId={currentUser.id}
              username={currentUser.username}
              avatarUrl={currentUser.avatarUrl}
              size="lg"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              data-testid="input-avatar-file"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              data-testid="button-upload-avatar"
              className="hover-elevate active-elevate-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? 'Uploading...' : 'Upload Avatar'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                data-testid="input-display-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={currentUser.email} disabled className="bg-muted" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">Toggle dark/light mode</p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
              data-testid="button-save-profile"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="destructive"
              onClick={onSignOut}
              data-testid="button-sign-out"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
