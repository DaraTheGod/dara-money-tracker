
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
            <Avatar className="h-16 w-16 mb-3">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg text-foreground">
              {user?.user_metadata?.full_name || user?.email}
            </h3>
            <p className="text-sm text-muted-foreground">
              {user?.email}
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
            className="w-full flex items-center justify-center space-x-2"
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
