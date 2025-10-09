import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UsersRound, 
  FileBarChart, 
  Sparkles, 
  LogOut,
  Settings,
  Bell
} from 'lucide-react';

const Sidebar = ({ user }) => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      roles: ['admin', 'helper']
    },
    {
      name: 'Schedule',
      icon: Calendar,
      path: '/schedule',
      roles: ['admin', 'helper']
    },
    {
      name: 'Clients',
      icon: Users,
      path: '/clients',
      roles: ['admin']
    },
    {
      name: 'Helpers',
      icon: UsersRound,
      path: '/helpers',
      roles: ['admin']
    },
    {
      name: 'Reports',
      icon: FileBarChart,
      path: '/reports',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full" data-testid="sidebar">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Gabi Cleaning</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || 'Unknown User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <div className="relative">
            <Bell className="w-4 h-4 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" data-testid="sidebar-nav">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.name.toLowerCase()}`}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          data-testid="settings-button"
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
        
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          data-testid="logout-button"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
        
        <div className="pt-2 text-center">
          <p className="text-xs text-gray-400">
            Gabi Cleaning v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;