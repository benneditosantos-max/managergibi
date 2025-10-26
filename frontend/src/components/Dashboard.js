import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import DashboardCharts from './DashboardCharts';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle,
  BarChart3,
  LineChart,
  CalendarDays
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allJobs, setAllJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, jobsResponse] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/jobs`)
      ]);
      
      setStats(statsResponse.data);
      setAllJobs(jobsResponse.data);
      
      // Get recent jobs (last 10)
      const sortedJobs = jobsResponse.data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      setRecentJobs(sortedJobs);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para filtrar jobs por data selecionada
  const getJobsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allJobs.filter(job => {
      const jobDate = new Date(job.date).toISOString().split('T')[0];
      return jobDate === dateStr;
    });
  };

  // Função para verificar se uma data tem jobs
  const hasJobsOnDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allJobs.some(job => {
      const jobDate = new Date(job.date).toISOString().split('T')[0];
      return jobDate === dateStr;
    });
  };

  // Jobs da data selecionada
  const selectedDateJobs = getJobsForDate(selectedDate);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-96 rounded-xl"></div>
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen" data-testid="dashboard">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your cleaning business today
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="kpi-cards">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Today's Jobs</p>
                  <p className="text-3xl font-bold text-blue-900" data-testid="jobs-today">
                    {stats.total_jobs_today}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.total_jobs_week} this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-900" data-testid="total-revenue">
                    {formatCurrency(stats.total_revenue)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    All time earnings
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Net Profit</p>
                  <p className="text-3xl font-bold text-purple-900" data-testid="net-profit">
                    {formatCurrency(stats.net_profit)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    After all costs
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Active Team</p>
                  <p className="text-3xl font-bold text-orange-900" data-testid="active-helpers">
                    {stats.active_helpers}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {stats.total_clients} clients
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toggle Charts Button */}
      <div className="flex justify-center mb-8">
        <Button
          onClick={() => setShowCharts(!showCharts)}
          className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg"
          data-testid="toggle-charts-button"
        >
          {showCharts ? (
            <>
              <Calendar className="w-5 h-5 mr-2" />
              View Recent Jobs
            </>
          ) : (
            <>
              <BarChart3 className="w-5 h-5 mr-2" />
              View Growth Charts
            </>
          )}
        </Button>
      </div>

      {showCharts ? (
        <DashboardCharts />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar & Jobs */}
          <div className="lg:col-span-2">
            <Card data-testid="calendar-jobs">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold text-gray-900">Schedule Calendar</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {selectedDateJobs.length} jobs on {selectedDate.toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border-0"
                      modifiers={{
                        hasJobs: (date) => hasJobsOnDate(date)
                      }}
                      modifiersStyles={{
                        hasJobs: {
                          backgroundColor: '#A084CA',
                          color: 'white',
                          borderRadius: '50%'
                        }
                      }}
                      data-testid="dashboard-calendar"
                    />
                    <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-gray-600">Has Jobs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Jobs for Selected Date */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Jobs for {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </h4>
                    
                    {selectedDateJobs.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No jobs scheduled</p>
                        <p className="text-sm text-gray-400">Select a different date or add a new job</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedDateJobs.map((job) => (
                          <div 
                            key={job.id} 
                            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            data-testid={`calendar-job-${job.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h5 className="font-medium text-gray-900">{job.client_name}</h5>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                    {job.status.replace('_', ' ')}
                                  </span>
                                </div>
                                
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDate(job.date)} • {job.duration_hours}h</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{job.address}</span>
                                  </div>
                                </div>
                                
                                {job.helper_name && (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">
                                        {job.helper_name.charAt(0)}
                                      </span>
                                    </div>
                                    <span className="text-sm text-gray-600">{job.helper_name}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-right ml-4">
                                <p className="font-semibold text-gray-900">
                                  {formatCurrency(job.price_charged)}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {job.job_type.replace('_', ' ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card data-testid="quick-actions">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                className="w-full p-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                data-testid="new-job-button"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule New Job</span>
              </button>
              
              {user.role === 'admin' && (
                <>
                  <button 
                    className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                    data-testid="add-client-button"
                  >
                    <Users className="w-4 h-4" />
                    <span>Add Client</span>
                  </button>
                  
                  <button 
                    className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                    data-testid="view-reports-button"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>View Reports</span>
                  </button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card data-testid="notifications">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Job Starting Soon
                    </p>
                    <p className="text-xs text-blue-600">
                      Office cleaning at 123 Main St starts in 1 hour
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Job Completed
                    </p>
                    <p className="text-xs text-green-600">
                      Deep cleaning at Johnson residence finished
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <button className="text-sm text-primary hover:text-primary/80">
                    View all notifications
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Summary */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200" data-testid="profit-summary">
            <CardHeader>
              <h3 className="text-lg font-semibold text-indigo-900">This Month</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-600">Revenue</span>
                  <span className="font-semibold text-indigo-900">
                    {formatCurrency(stats?.total_revenue || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-600">Costs</span>
                  <span className="font-semibold text-indigo-900">
                    {formatCurrency(stats?.total_costs || 0)}
                  </span>
                </div>
                <hr className="border-indigo-200" />
                <div className="flex justify-between items-center">
                  <span className="font-medium text-indigo-700">Net Profit</span>
                  <span className="font-bold text-lg text-indigo-900">
                    {formatCurrency(stats?.net_profit || 0)}
                  </span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats?.total_revenue ? Math.min((stats.net_profit / stats.total_revenue) * 100, 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-indigo-600 text-center">
                  {stats?.total_revenue ? 
                    `${((stats.net_profit / stats.total_revenue) * 100).toFixed(1)}% profit margin` :
                    'No data available'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;