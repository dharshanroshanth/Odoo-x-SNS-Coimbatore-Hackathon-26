import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plane, User, LogOut, LayoutDashboard, MapPin } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">GlobeTrotter</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2" data-testid="nav-dashboard-btn">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link to="/my-trips">
              <Button variant="ghost" className="flex items-center space-x-2" data-testid="nav-mytrips-btn">
                <MapPin className="h-5 w-5" />
                <span>My Trips</span>
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" className="flex items-center space-x-2" data-testid="nav-profile-btn">
                <User className="h-5 w-5" />
                <span>{user?.first_name}</span>
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="flex items-center space-x-2" data-testid="nav-logout-btn">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
