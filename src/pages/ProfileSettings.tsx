
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfileSettings = () => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    preferred_currency: 'USD',
    dark_mode: false,
    profile_image: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          username: data.username || '',
          preferred_currency: data.preferred_currency || 'USD',
          dark_mode: data.dark_mode || false,
          profile_image: data.profile_image || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          preferred_currency: profile.preferred_currency,
          dark_mode: profile.dark_mode,
          profile_image: profile.profile_image,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_image">Profile Image URL</Label>
              <Input
                id="profile_image"
                value={profile.profile_image}
                onChange={(e) => setProfile({ ...profile, profile_image: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </p>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Preferred Currency</Label>
              <Select 
                value={profile.preferred_currency} 
                onValueChange={(value) => setProfile({ ...profile, preferred_currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="KHR">KHR - Cambodian Riel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button onClick={updateProfile} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
