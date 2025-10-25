import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileBarChart, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users,
  Download,
  Filter,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';

const Reports = () => {
  const { API } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, all

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, clientsResponse, helpersResponse] = await Promise.all([
        axios.get(`${API}/jobs`),
        axios.get(`${API}/clients`),
        axios.get(`${API}/helpers`)
      ]);
      
      setJobs(jobsResponse.data);
      setClients(clientsResponse.data);
      setHelpers(helpersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredJobs = () => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return jobs; // all time
    }

    return jobs.filter(job => new Date(job.date) >= startDate);
  };

  const calculateMetrics = () => {
    const filteredJobs = getFilteredJobs();
    const completedJobs = filteredJobs.filter(job => job.status === 'completed');
    
    const totalRevenue = filteredJobs.reduce((sum, job) => sum + job.price_charged, 0);
    const totalCosts = filteredJobs.reduce((sum, job) => 
      sum + (job.helper_payment || 0) + (job.operational_cost || 0) + (job.subcontract_cost || 0), 0
    );
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Job type breakdown
    const jobTypeStats = filteredJobs.reduce((acc, job) => {
      acc[job.job_type] = (acc[job.job_type] || 0) + 1;
      return acc;
    }, {});

    // Helper performance
    const helperStats = helpers.map(helper => {
      const helperJobs = filteredJobs.filter(job => job.helper_id === helper.id);
      const completedHelperJobs = helperJobs.filter(job => job.status === 'completed');
      
      return {
        ...helper,
        totalJobs: helperJobs.length,
        completedJobs: completedHelperJobs.length,
        totalEarnings: completedHelperJobs.reduce((sum, job) => sum + (job.helper_payment || 0), 0),
        completionRate: helperJobs.length > 0 ? (completedHelperJobs.length / helperJobs.length) * 100 : 0
      };
    }).sort((a, b) => b.totalEarnings - a.totalEarnings);

    // Top clients
    const clientStats = clients.map(client => {
      const clientJobs = filteredJobs.filter(job => job.client_id === client.id);
      const clientRevenue = clientJobs.reduce((sum, job) => sum + job.price_charged, 0);
      
      return {
        ...client,
        totalJobs: clientJobs.length,
        totalRevenue: clientRevenue
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

    return {
      totalJobs: filteredJobs.length,
      completedJobs: completedJobs.length,
      totalRevenue,
      totalCosts,
      netProfit,
      profitMargin,
      jobTypeStats,
      helperStats,
      clientStats,
      completionRate: filteredJobs.length > 0 ? (completedJobs.length / filteredJobs.length) * 100 : 0
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatJobType = (type) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div className="p-8 bg-gray-50 min-h-screen" data-testid="reports-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Reports</h1>
          <p className="text-gray-600 mt-1">
            Analyze your cleaning business performance and profitability
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Filter */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="time-range-select"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <Button 
            variant="outline" 
            onClick={handleExport}
            data-testid="export-button"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-blue-900" data-testid="total-jobs-metric">
                  {metrics.totalJobs}
                </p>
                <p className="text-xs text-blue-600">
                  {metrics.completedJobs} completed
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold text-green-900" data-testid="revenue-metric">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <p className="text-xs text-green-600">
                  Total earned
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Net Profit</p>
                <p className="text-3xl font-bold text-purple-900" data-testid="profit-metric">
                  {formatCurrency(metrics.netProfit)}
                </p>
                <p className="text-xs text-purple-600">
                  {Math.round(metrics.profitMargin)}% margin
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Costs</p>
                <p className="text-3xl font-bold text-orange-900" data-testid="costs-metric">
                  {formatCurrency(metrics.totalCosts)}
                </p>
                <p className="text-xs text-orange-600">
                  All expenses
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">Completion</p>
                <p className="text-3xl font-bold text-indigo-900" data-testid="completion-metric">
                  {Math.round(metrics.completionRate)}%
                </p>
                <p className="text-xs text-indigo-600">
                  Success rate
                </p>
              </div>
              <FileBarChart className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Job Types Breakdown */}
        <Card data-testid="job-types-chart">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Job Types Distribution</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.jobTypeStats).map(([type, count]) => {
                const percentage = metrics.totalJobs > 0 ? (count / metrics.totalJobs) * 100 : 0;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {formatJobType(type)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card data-testid="top-clients">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.clientStats.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No client data available</p>
              ) : (
                metrics.clientStats.map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">
                          {client.totalJobs} jobs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(client.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Helper Performance */}
      <Card data-testid="helper-performance">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Helper Performance</h3>
        </CardHeader>
        <CardContent>
          {metrics.helperStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No helper data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Helper</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Jobs</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Completion Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Earnings</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.helperStats.map((helper) => (
                    <tr key={helper.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {helper.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{helper.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {helper.completedJobs}/{helper.totalJobs}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                            <div 
                              className={`h-2 rounded-full ${
                                helper.completionRate >= 90 ? 'bg-green-500' :
                                helper.completionRate >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(helper.completionRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round(helper.completionRate)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {formatCurrency(helper.totalEarnings)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        ${helper.hourly_rate || 0}/hr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;