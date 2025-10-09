import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles, Shield, Users } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const { login, API } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'helper',
    phone: '',
    hourly_rate: '',
    availability: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: formData.role,
            phone: formData.phone || null,
            hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
            availability: formData.availability || null
          };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      login(response.data.user, response.data.access_token);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (error) {
      console.error('Auth error:', error);
      const message = error.response?.data?.detail || (isLogin ? 'Login failed' : 'Registration failed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'helper',
      phone: '',
      hourly_rate: '',
      availability: ''
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gabi Cleaning Manager
          </h1>
          <p className="text-gray-600">
            Smart Scheduling & Profit Tracking
          </p>
        </div>

        {/* Login/Register Card */}
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center pb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isLogin ? 'Sign in to your account' : 'Join the cleaning management system'}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required={!isLogin}
                      data-testid="name-input"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      data-testid="role-select"
                      className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="helper">Helper/Employee</option>
                      <option value="admin">Admin</option>
                      <option value="client">Client</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
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

                  {formData.role === 'helper' && (
                    <>
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
                          placeholder="Mon-Fri 8AM-5PM"
                          data-testid="availability-input"
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                  data-testid="email-input"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  data-testid="password-input"
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-medium"
                data-testid="auth-submit-button"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="ghost"
                onClick={toggleMode}
                className="text-primary hover:text-primary/80 font-medium"
                data-testid="toggle-auth-mode"
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </Button>
            </div>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Demo Accounts
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Admin:</strong> admin@gabi.com / admin123</p>
                <p><strong>Helper:</strong> helper@gabi.com / helper123</p>
                <p><strong>Client:</strong> client@gabi.com / client123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
            <div className="flex flex-col items-center">
              <Sparkles className="w-6 h-6 text-primary mb-1" />
              <span>Smart Scheduling</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-6 h-6 text-primary mb-1" />
              <span>Profit Tracking</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-6 h-6 text-primary mb-1" />
              <span>Team Management</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;