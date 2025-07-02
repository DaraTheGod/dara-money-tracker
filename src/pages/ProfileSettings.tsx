
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
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSizeMB = 5;
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "Error",
        description: `File size exceeds ${maxSizeMB}MB limit.`,
        variant: "destructive",
      });
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`; // Unique filename

    try {
      setLoading(true);
      console.log('Uploading file:', fileName, 'Type:', file.type, 'Size:', file.size);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload response:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to retrieve public URL');
      }

      const avatarUrl = urlData.publicUrl;
      console.log('Public URL:', avatarUrl);

      // Update profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            username: profileData.username,
            profile_image: avatarUrl,
          },
        ]);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      // Update local state
      setProfileData((prev) => ({
        ...prev,
        profile_image: avatarUrl,
      }));

      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.error('Error in handleFileSelect:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileRemove = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Update profile in Supabase to clear profile_image
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ profile_image: null }) // or use '' if your schema prefers an empty string
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error(`Failed to remove profile image: ${profileError.message}`);
      }

      // Optional: Delete the image file from storage
      const currentImage = profileData.profile_image;
      if (currentImage) {
        const fileName = currentImage.split('/').pop(); // Extract filename from URL
        if (fileName) {
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([fileName]);

          if (deleteError) {
            console.error('Storage delete error:', deleteError);
            // Log error but don't fail the operation, as the profile update is the priority
          }
        }
      }

      // Update local state
      setProfileData((prev) => ({
        ...prev,
        profile_image: '',
      }));

      toast({
        title: "Success",
        description: "Profile image removed successfully",
      });
    } catch (error) {
      console.error('Error removing profile image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove profile image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary">
              <AvatarImage 
                src={profileData.profile_image} 
                alt="Profile" 
                className="object-cover"
              />
              <AvatarFallback className="bg-card text-card-foreground text-lg sm:text-2xl">
                {profileData.username ? profileData.username.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            
            {profileData.username && (
              <div className="text-center">
                <p className="text-card-foreground font-medium text-base sm:text-lg mb-2">{profileData.username}</p>
                <p className="text-foreground/70 text-sm sm:text-base">{user?.email}</p>
              </div>
            )}
            
            <div className="w-full max-w-xs sm:max-w-sm">
              <Label htmlFor="avatar" className="text-foreground/70 mb-2 block text-sm sm:text-base">
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

            {/* <div>
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
            </div> */}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
