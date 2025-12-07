import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-background text-foreground border-b border-border sticky top-0 z-20">
      <Link to="/dashboard" className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-sl-primary-accent flex items-center justify-center rounded-lg font-bold text-xl text-sl-background">
          S
        </div>
        {/* <span className="text-2xl font-bold text-primary-foreground">Solo Leveling</span> */}
      </Link>
      <Button variant="ghost" size="icon" className="text-text-secondary hover:text-primary-accent">
        <Menu className="h-6 w-6" />
      </Button>
    </header>
  );
};

export default Header;