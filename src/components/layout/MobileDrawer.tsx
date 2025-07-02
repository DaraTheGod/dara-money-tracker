import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Home, DollarSign, TrendingUp, User, LogOut } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileDrawer = ({ isOpen, onClose }: MobileDrawerProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    username: '',
    profile_image: '',
  });
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false); // No user, stop loading
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, profile_image')
        .eq('id', user?.id)
        .single();

      console.log('Fetched profile data:', data, 'Error:', error);

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }

      setProfileData({
        username: data?.username || '',
        profile_image: data?.profile_image || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Expenses', path: '/expenses', icon: DollarSign },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 md:hidden animate-slide-in-bottom shadow-2xl">
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-6">
            {loading ? (
              <div className="h-24 w-24 sm:h-16 sm:w-16 bg-gray-200 rounded-full animate-pulse" />
            ) : (
              <Avatar className="h-24 w-24 sm:h-16 sm:w-16 border-4 border-primary mb-2">
                <AvatarImage
                  src={profileData.profile_image}
                  alt="Profile"
                  className="object-cover"
                  onError={() => {
                    console.error('Failed to load profile image:', profileData.profile_image);
                    toast({
                      title: 'Error',
                      description: 'Failed to load profile image',
                      variant: 'destructive',
                    });
                  }}
                />
                <AvatarFallback className="bg-card text-card-foreground text-lg sm:text-xl">
                  {profileData.username ? profileData.username.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            <h2 className="font-semibold text-2xl text-foreground mb-2">
              {loading ? 'Loading...' : profileData.username || 'Guest'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user?.email || 'No email'}
            </p>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2 mb-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Sign Out Button */}
          <Button
            variant="outline"
            onClick={signOut}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;