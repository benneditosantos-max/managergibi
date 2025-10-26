import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UsersRound, DollarSign, Clock, Star, Search, Phone, Plus } from 'lucide-react';
import axios from 'axios';

const Helpers = () => {
  const { API } = useContext(AuthContext);
  const [helpers, setHelpers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    hourly_rate: '',
    availability: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [helpersResponse, jobsResponse] = await Promise.all([
        axios.get(`${API}/helpers`),
        axios.get(`${API}/jobs`)
      ]);
      
      setHelpers(helpersResponse.data);
      setJobs(jobsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'helper',
        phone: formData.phone || null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        availability: formData.availability || null
      };

      await axios.post(`${API}/auth/register`, payload);
      toast.success('Helper added successfully!');
      
      resetForm();
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding helper:', error);
      toast.error(error.response?.data?.detail || 'Failed to add helper');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      hourly_rate: '',
      availability: ''
    });
  };

  const getHelperStats = (helperId) => {
    const helperJobs = jobs.filter(job => job.helper_id === helperId);
    const completedJobs = helperJobs.filter(job => job.status === 'completed');
    
    const totalEarnings = completedJobs.reduce((sum, job) => 
      sum + (job.helper_payment || 0), 0
    );
    
    const totalHours = completedJobs.reduce((sum, job) => 
      sum + (job.actual_duration || job.duration_hours || 0), 0
    );

    return {
      totalJobs: helperJobs.length,
      completedJobs: completedJobs.length,
      totalEarnings,
      totalHours,
      completionRate: helperJobs.length > 0 ? (completedJobs.length / helperJobs.length) * 100 : 0
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const filteredHelpers = helpers.filter(helper =>
    helper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (helper.phone && helper.phone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen" data-testid="helpers-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Helper Management</h1>
          <p className="text-gray-600 mt-1">
            Track your team's performance and manage helper assignments
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => resetForm()}
              className="bg-primary hover:bg-primary/90"
              data-testid="add-helper-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Helper
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Helper</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="helper-form">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    data-testid="name-input"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    data-testid="email-input"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    data-testid="password-input"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    data-testid="phone-input"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    name="hourly_rate"
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    placeholder="25.00"
                    data-testid="hourly-rate-input"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    name="availability"
                    type="text"
                    value={formData.availability}
                    onChange={handleInputChange}
                    placeholder="Mon-Fri, 9AM-5PM"
                    data-testid="availability-input"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  data-testid="save-helper-button"
                >
                  Add Helper
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Helpers</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="total-helpers">
                  {helpers.length}
                </p>
              </div>
              <UsersRound className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active This Month</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="active-helpers">
                  {helpers.filter(helper => {
                    const helperJobs = jobs.filter(job => 
                      job.helper_id === helper.id && 
                      new Date(job.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    );
                    return helperJobs.length > 0;
                  }).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payouts</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="total-payouts">
                  {formatCurrency(
                    jobs.reduce((sum, job) => sum + (job.helper_payment || 0), 0)
                  )}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="avg-completion-rate">
                  {helpers.length > 0 ? 
                    Math.round(
                      helpers.reduce((sum, helper) => 
                        sum + getHelperStats(helper.id).completionRate, 0
                      ) / helpers.length
                    ) : 0
                  }%
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Helpers List */}
      <div className="space-y-4" data-testid="helpers-list">
        {filteredHelpers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <UsersRound className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No helpers found' : 'No helpers yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Add helpers through the registration system'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHelpers.map((helper) => {
              const stats = getHelperStats(helper.id);
              
              return (
                <Card 
                  key={helper.id} 
                  className="hover:shadow-lg transition-shadow"
                  data-testid={`helper-card-${helper.id}`}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {helper.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {helper.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {helper.hourly_rate ? `$${helper.hourly_rate}/hr` : 'No rate set'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`w-3 h-3 rounded-full ${
                          stats.completionRate >= 90 ? 'bg-green-500' :
                          stats.completionRate >= 70 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {helper.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{helper.phone}</span>
                        </div>
                      )}
                      
                      {helper.availability && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{helper.availability}</span>
                        </div>
                      )}
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600">Jobs Completed</p>
                        <p className="text-lg font-bold text-blue-900">
                          {stats.completedJobs}/{stats.totalJobs}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Total Earnings</p>
                        <p className="text-lg font-bold text-green-900">
                          {formatCurrency(stats.totalEarnings)}
                        </p>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completion Rate:</span>
                        <span className="font-medium">
                          {Math.round(stats.completionRate)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Hours:</span>
                        <span className="font-medium">
                          {Math.round(stats.totalHours)}h
                        </span>
                      </div>
                      
                      {stats.totalHours > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Hourly:</span>
                          <span className="font-medium">
                            {formatCurrency(stats.totalEarnings / stats.totalHours)}/hr
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Performance Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Performance</span>
                        <span className="text-xs font-medium">
                          {Math.round(stats.completionRate)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            stats.completionRate >= 90 ? 'bg-green-500' :
                            stats.completionRate >= 70 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Member since {new Date(helper.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Helpers;