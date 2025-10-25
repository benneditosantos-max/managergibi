import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Building2, 
  Plus, 
  Phone, 
  Mail, 
  Percent, 
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Star
} from 'lucide-react';
import axios from 'axios';

const Subcontractors = () => {
  const { API } = useContext(AuthContext);
  const [subcontractors, setSubcontractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    commission_rate: '',
    specialties: ''
  });

  useEffect(() => {
    fetchSubcontractors();
  }, []);

  const fetchSubcontractors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/subcontractors`);
      setSubcontractors(response.data);
    } catch (error) {
      console.error('Error fetching subcontractors:', error);
      toast.error('Failed to load subcontractors');
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
        name: formData.name,
        company_name: formData.company_name || null,
        phone: formData.phone || null,
        email: formData.email || null,
        commission_rate: parseFloat(formData.commission_rate),
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : null
      };

      await axios.post(`${API}/subcontractors`, payload);
      toast.success('Subcontractor added successfully');
      
      resetForm();
      setIsDialogOpen(false);
      fetchSubcontractors();
    } catch (error) {
      console.error('Error creating subcontractor:', error);
      toast.error(error.response?.data?.detail || 'Failed to add subcontractor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company_name: '',
      phone: '',
      email: '',
      commission_rate: '',
      specialties: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const filteredSubcontractors = subcontractors.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.company_name && sub.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <div className="p-8 bg-gray-50 min-h-screen" data-testid="subcontractors-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subcontractor Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your partner cleaning services and commission structure
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => resetForm()}
              className="bg-primary hover:bg-primary/90"
              data-testid="add-subcontractor-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subcontractor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Subcontractor</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="subcontractor-form">
              <div>
                <Label htmlFor="name">Contact Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  required
                  data-testid="name-input"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Clean Pro Services"
                  data-testid="company-input"
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
                  placeholder="(555) 123-4567"
                  data-testid="phone-input"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@cleanpro.com"
                  data-testid="email-input"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="commission_rate">Commission Rate (%) *</Label>
                <Input
                  id="commission_rate"
                  name="commission_rate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.commission_rate}
                  onChange={handleInputChange}
                  placeholder="20.0"
                  required
                  data-testid="commission-input"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="specialties">Specialties</Label>
                <Input
                  id="specialties"
                  name="specialties"
                  type="text"
                  value={formData.specialties}
                  onChange={handleInputChange}
                  placeholder="Deep cleaning, Commercial, Move-out (comma separated)"
                  data-testid="specialties-input"
                  className="mt-1"
                />
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
                  data-testid="save-subcontractor-button"
                >
                  Add Subcontractor
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
            placeholder="Search by name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="total-subcontractors">
                  {subcontractors.length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="active-subcontractors">
                  {subcontractors.filter(s => s.active).length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="subcontractor-revenue">
                  {formatCurrency(subcontractors.reduce((sum, s) => sum + (s.total_revenue || 0), 0))}
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
                <p className="text-sm text-gray-600">Avg Commission</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="avg-commission">
                  {subcontractors.length > 0 ? 
                    Math.round(subcontractors.reduce((sum, s) => sum + s.commission_rate, 0) / subcontractors.length) : 0
                  }%
                </p>
              </div>
              <Percent className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subcontractors List */}
      <div className="space-y-4" data-testid="subcontractors-list">
        {filteredSubcontractors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No subcontractors found' : 'No subcontractors yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Add your first subcontractor partner to expand your services'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubcontractors.map((subcontractor) => (
              <Card 
                key={subcontractor.id} 
                className="hover:shadow-lg transition-shadow"
                data-testid={`subcontractor-card-${subcontractor.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {subcontractor.name}
                        </h3>
                        {subcontractor.company_name && (
                          <p className="text-sm text-gray-500">
                            {subcontractor.company_name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">
                        {subcontractor.commission_rate}%
                      </span>
                      <p className="text-xs text-gray-500">Commission</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {subcontractor.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{subcontractor.phone}</span>
                      </div>
                    )}
                    
                    {subcontractor.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{subcontractor.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Specialties */}
                  {subcontractor.specialties && subcontractor.specialties.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-1">
                        {subcontractor.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Jobs</p>
                      <p className="text-lg font-bold text-blue-900">
                        {subcontractor.total_jobs || 0}
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Revenue</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(subcontractor.total_revenue || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        subcontractor.active ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm text-gray-600">
                        {subcontractor.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Partner since {new Date(subcontractor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subcontractors;