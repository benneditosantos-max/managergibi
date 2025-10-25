import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  Settings
} from 'lucide-react';
import axios from 'axios';

const Notifications = () => {
  const { user, API } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${API}/notifications/${notificationId}/mark-read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_reminder':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'job_assigned':
        return <Calendar className="w-5 h-5 text-green-500" />;
      case 'payment_due':
        return <DollarSign className="w-5 h-5 text-orange-500" />;
      case 'job_complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'route_updated':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'report_ready':
        return <TrendingUp className="w-5 h-5 text-indigo-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'job_reminder':
        return 'border-blue-200 bg-blue-50';
      case 'job_assigned':
        return 'border-green-200 bg-green-50';
      case 'payment_due':
        return 'border-orange-200 bg-orange-50';
      case 'job_complete':
        return 'border-green-200 bg-green-50';
      case 'route_updated':
        return 'border-purple-200 bg-purple-50';
      case 'report_ready':
        return 'border-indigo-200 bg-indigo-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-8 bg-gray-50 min-h-screen" data-testid="notifications-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your cleaning business activities
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && (
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
              {unreadCount} unread
            </span>
          )}
          
          <Button variant="outline" data-testid="settings-button">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Channels (Mocked) */}
      <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">📱 Notification Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <Bell className="w-6 h-6 text-indigo-500" />
              <div>
                <p className="font-medium text-gray-900">In-App Notifications</p>
                <p className="text-sm text-gray-600">✅ Active</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <Mail className="w-6 h-6 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Email Alerts</p>
                <p className="text-sm text-gray-600">🔧 Mocked</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-600">🔧 Mocked</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'read', label: 'Read', count: notifications.length - unreadCount }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            data-testid={`filter-${tab.key}`}
          >
            {tab.label} {tab.count > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                filter === tab.key ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4" data-testid="notifications-list">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-20 rounded-lg"></div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? "You're all caught up! Check back later for updates."
                  : filter === 'read'
                  ? "No notifications have been read yet."
                  : "Notifications about your business will appear here."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification, index) => (
            <Card 
              key={notification.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                !notification.read ? 'ring-2 ring-primary/20' : ''
              } ${getNotificationColor(notification.type)}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
              data-testid={`notification-${index}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-lg font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`mt-1 ${
                          !notification.read ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        {!notification.read && (
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(notification.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Notification Actions */}
                    <div className="flex items-center space-x-3 mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.type === 'job_reminder' ? 'bg-blue-100 text-blue-700' :
                        notification.type === 'payment_due' ? 'bg-orange-100 text-orange-700' :
                        notification.type === 'job_complete' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {notification.type.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Smartphone className="w-3 h-3" />
                        <span>In-App</span>
                      </div>
                      
                      {notification.type === 'job_reminder' && (
                        <Button size="sm" variant="outline" className="text-xs">
                          View Job
                        </Button>
                      )}
                      
                      {notification.type === 'payment_due' && (
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                          Process Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Notifications</h3>
            <p className="text-3xl font-bold text-blue-600">{notifications.length}</p>
            <p className="text-sm text-gray-600 mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Response Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              {notifications.length > 0 ? Math.round(((notifications.length - unreadCount) / notifications.length) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Read notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Avg Response Time</h3>
            <p className="text-3xl font-bold text-orange-600">2.5h</p>
            <p className="text-sm text-gray-600 mt-1">To read notifications</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;