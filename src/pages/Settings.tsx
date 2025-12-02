import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Sparkles, 
  Monitor, 
  Download, 
  Trash2, 
  LogOut,
  Moon,
  Eye
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import CanvasParticles from '@/components/CanvasParticles';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export default function Settings() {
  const { settings, updateSettings, user, logout, transactions } = useAppStore();

  const handleExportData = () => {
    const data = {
      user,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget-tracker-data.json';
    a.click();
    toast.success('Data exported successfully');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      logout();
      toast.success('Account deleted');
    }
  };

  return (
    <div className="min-h-screen relative">
      <CanvasParticles enabled={settings.particlesEnabled} particleCount={20} />
      <Navbar />
      
      <main className="pt-20 pb-8 px-4">
        <PageTransition>
          <div className="container mx-auto max-w-3xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and preferences
              </p>
            </div>

            <div className="space-y-6">
              {/* Account */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-neon-cyan/10">
                        <User className="w-5 h-5 text-neon-cyan" />
                      </div>
                      <div>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Your account information</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Appearance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-neon-pink/10">
                        <Sparkles className="w-5 h-5 text-neon-pink" />
                      </div>
                      <div>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize how the app looks</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">₹ Particle Effect</p>
                          <p className="text-sm text-muted-foreground">
                            Animated rupee symbols falling in background
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.particlesEnabled}
                        onCheckedChange={(checked) => {
                          updateSettings({ particlesEnabled: checked });
                          toast.success(checked ? 'Particles enabled' : 'Particles disabled');
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Reduce Motion</p>
                          <p className="text-sm text-muted-foreground">
                            Minimize animations for better accessibility
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.reduceMotion}
                        onCheckedChange={(checked) => {
                          updateSettings({ reduceMotion: checked });
                          toast.success(checked ? 'Motion reduced' : 'Motion enabled');
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Data */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-neon-green/10">
                        <Download className="w-5 h-5 text-neon-green" />
                      </div>
                      <div>
                        <CardTitle>Data & Privacy</CardTitle>
                        <CardDescription>Manage your data</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">Export Data</p>
                        <p className="text-sm text-muted-foreground">
                          Download all your data as JSON
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleExportData}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div>
                        <p className="font-medium text-destructive">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sign Out */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </motion.div>
            </div>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
