import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User, Mail, Save } from 'lucide-react';
import FileUpload from '@/components/ui/file-upload';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    profile_image: ''
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

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfileData({
          username: data.username || '',
          profile_image: data.profile_image || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = async (file: File) => {
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;

    try {
      setLoading(true);

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      setProfileData(prev => ({
        ...prev,
        profile_image: avatarUrl
      }));

      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileRemove = () => {
    setProfileData(prev => ({
      ...prev,
      profile_image: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            username: profileData.username,
            profile_image: profileData.profile_image,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-foreground/70">Manage your account information</p>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage 
                src={profileData.profile_image} 
                alt="Profile" 
                className="object-cover"
              />
              <AvatarFallback className="bg-card text-card-foreground text-lg sm:text-xl">
                {profileData.username ? profileData.username.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            
            {profileData.username && (
              <div className="text-center">
                <p className="text-card-foreground font-medium text-sm sm:text-base">{profileData.username}</p>
                <p className="text-foreground/70 text-xs sm:text-sm">{user?.email}</p>
              </div>
            )}
            
            <div className="w-full max-w-md">
              <Label htmlFor="avatar" className="text-foreground/70 mb-2 block">
                Profile Image
              </Label>
              <FileUpload 
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                currentFile={profileData.profile_image}
                accept="image/*"
                maxSize={5}
              />
              <p className="text-xs text-foreground/70 mt-1">
                Upload a profile image (JPG, PNG, etc.)
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-foreground/70">Username</Label>
              <Input
                id="username"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground/70">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-foreground/70" />
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-input border-border text-foreground/70 pl-10"
                />
              </div>
              <p className="text-xs text-foreground/70 mt-1">
                Email cannot be changed from this page
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-income hover:bg-income/90 text-card-foreground"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;