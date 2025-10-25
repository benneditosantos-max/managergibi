import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  DollarSign
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

const DashboardCharts = () => {
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

  return (
    <div className="space-y-8" data-testid="dashboard-charts">
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
  );
};

export default DashboardCharts;