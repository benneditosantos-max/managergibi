import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  LineChart
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  AreaChart,
  BarChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const { user, API } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);

  // Mock data para gráficos de crescimento
  const revenueGrowthData = [
    { month: 'Jan', revenue: 3500, jobs: 15, costs: 2100 },
    { month: 'Feb', revenue: 4200, jobs: 18, costs: 2400 },
    { month: 'Mar', revenue: 3800, jobs: 16, costs: 2200 },
    { month: 'Apr', revenue: 5100, jobs: 22, costs: 2800 },
    { month: 'May', revenue: 4800, jobs: 20, costs: 2600 },
    { month: 'Jun', revenue: 6200, jobs: 26, costs: 3200 },
    { month: 'Jul', revenue: 5900, jobs: 24, costs: 3000 },
    { month: 'Aug', revenue: 7500, jobs: 30, costs: 3600 },
    { month: 'Sep', revenue: 8200, jobs: 32, costs: 3800 },
    { month: 'Oct', revenue: 9100, jobs: 36, costs: 4000 },
  ];

  const jobTypeData = [
    { name: 'Regular Cleaning', value: 45, color: '#A084CA' },
    { name: 'Deep Cleaning', value: 25, color: '#D6C7E1' },
    { name: 'Office Cleaning', value: 20, color: '#8B5CF6' },
    { name: 'Airbnb', value: 10, color: '#C084FC' },
  ];

  const helperPerformanceData = [
    { name: 'Maria Santos', jobs: 28, rating: 4.9, earnings: 2100 },
    { name: 'John Smith', jobs: 22, rating: 4.7, earnings: 1650 },
    { name: 'Ana Silva', jobs: 20, rating: 4.8, earnings: 1500 },
    { name: 'Carlos Lima', jobs: 18, rating: 4.6, earnings: 1350 },
  ];

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

      {showCharts ?
        <div className="space-y-8">
          {/* Revenue Growth Chart */}
          <Card data-testid="revenue-growth-chart">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">📈 Revenue & Jobs Growth</h3>
                <div className="text-sm text-gray-500">Last 10 months</div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueGrowthData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A084CA" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#A084CA" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #A084CA',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? `$${value.toLocaleString()}` : 
                      name === 'jobs' ? `${value} jobs` : 
                      `$${value.toLocaleString()}`,
                      name === 'revenue' ? 'Revenue' :
                      name === 'jobs' ? 'Jobs Completed' : 'Costs'
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#A084CA" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="jobs" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    name="Jobs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Types Distribution */}
            <Card data-testid="job-types-chart">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">🧹 Service Distribution</h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={jobTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {jobTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, 'Percentage']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #A084CA',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Helper Performance */}
            <Card data-testid="helper-performance-chart">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">👥 Team Performance</h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={helperPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #A084CA',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [
                        name === 'earnings' ? `$${value}` : 
                        name === 'rating' ? `${value}⭐` : `${value} jobs`,
                        name === 'earnings' ? 'Earnings' :
                        name === 'rating' ? 'Rating' : 'Jobs Completed'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="jobs" fill="#A084CA" name="Jobs" />
                    <Bar dataKey="earnings" fill="#D6C7E1" name="Earnings ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Profit Margin Trend */}
          <Card data-testid="profit-trend-chart">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">💰 Profit Margin Analysis</h3>
                <div className="text-sm text-gray-500">Revenue vs Costs</div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={revenueGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #A084CA',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [
                      `$${value.toLocaleString()}`,
                      name === 'revenue' ? 'Revenue' : 'Costs'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Revenue"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="costs" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Costs"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700 font-medium">Average Profit Margin:</span>
                  <span className="text-green-800 font-bold text-lg">
                    {Math.round(
                      (revenueGrowthData.reduce((acc, curr) => acc + ((curr.revenue - curr.costs) / curr.revenue * 100), 0) / revenueGrowthData.length)
                    )}%
                  </span>
                </div>
                <p className="text-green-600 text-xs mt-1">
                  📈 Consistent growth trajectory with healthy profit margins
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Growth Insights */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200" data-testid="growth-insights">
            <CardHeader>
              <h3 className="text-xl font-semibold text-indigo-900">🚀 Growth Insights & Recommendations</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Revenue Growth</h4>
                  <p className="text-2xl font-bold text-green-600 mb-1">+160%</p>
                  <p className="text-sm text-gray-600">Since January</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Client Growth</h4>
                  <p className="text-2xl font-bold text-blue-600 mb-1">+140%</p>
                  <p className="text-sm text-gray-600">New clients added</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg">
                  <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Profit Margin</h4>
                  <p className="text-2xl font-bold text-purple-600 mb-1">56.8%</p>
                  <p className="text-sm text-gray-600">Average margin</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">📋 Strategic Recommendations</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Expand Team:</strong> Consider hiring 2 more helpers to meet growing demand</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">💡</span>
                    <span><strong>Premium Services:</strong> Deep cleaning shows highest margin - promote more</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-500 mt-1">🎯</span>
                    <span><strong>Subcontracting:</strong> Scale through partnerships during peak seasons</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      :
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Jobs */}
          <div className="lg:col-span-2">
            <Card data-testid="recent-jobs">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Recent Jobs</h3>
                  <span className="text-sm text-gray-500">{recentJobs.length} jobs</span>
                </div>
              </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No jobs scheduled yet</p>
                  <p className="text-sm text-gray-400">Create your first cleaning job to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      data-testid={`job-${job.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Clock className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{job.client_name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{job.address}</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {formatDate(job.date)} • {job.duration_hours}h • {job.job_type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(job.price_charged)}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
      )}
    </div>
  );
};

export default Dashboard;