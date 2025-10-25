import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Route, 
  Clock, 
  Fuel, 
  Navigation,
  Calendar,
  Zap,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const Routes = () => {
  const { API } = useContext(AuthContext);
  const [routes, setRoutes] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHelpers();
    if (selectedDate) {
      optimizeRoutes();
    }
  }, [selectedDate]);

  const fetchHelpers = async () => {
    try {
      const response = await axios.get(`${API}/helpers`);
      setHelpers(response.data);
    } catch (error) {
      console.error('Error fetching helpers:', error);
    }
  };

  const optimizeRoutes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/routes/optimize/${selectedDate}`);
      setRoutes(response.data);
    } catch (error) {
      console.error('Error optimizing routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHelperName = (helperId) => {
    const helper = helpers.find(h => h.id === helperId);
    return helper ? helper.name : 'Unknown Helper';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const totalStats = routes.reduce((acc, route) => {
    acc.totalDistance += route.total_distance_miles;
    acc.totalTime += route.total_travel_time_minutes;
    acc.totalFuelCost += route.fuel_cost;
    acc.totalJobs += route.jobs.length;
    return acc;
  }, { totalDistance: 0, totalTime: 0, totalFuelCost: 0, totalJobs: 0 });

  return (
    <div className="p-8 bg-gray-50 min-h-screen" data-testid="routes-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Route Optimization</h1>
          <p className="text-gray-600 mt-1">
            Smart route planning to minimize travel time and maximize efficiency
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
            data-testid="date-picker"
          />
          <Button 
            onClick={optimizeRoutes}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
            data-testid="optimize-button"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Optimize Routes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-blue-900" data-testid="total-jobs">
                  {totalStats.totalJobs}
                </p>
                <p className="text-xs text-blue-600">
                  {routes.length} routes
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
                <p className="text-green-600 text-sm font-medium">Total Distance</p>
                <p className="text-3xl font-bold text-green-900" data-testid="total-distance">
                  {Math.round(totalStats.totalDistance)}
                </p>
                <p className="text-xs text-green-600">miles</p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Travel Time</p>
                <p className="text-3xl font-bold text-orange-900" data-testid="total-time">
                  {Math.round(totalStats.totalTime / 60)}h
                </p>
                <p className="text-xs text-orange-600">
                  {totalStats.totalTime % 60}m
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Fuel Cost</p>
                <p className="text-3xl font-bold text-red-900" data-testid="total-fuel-cost">
                  {formatCurrency(totalStats.totalFuelCost)}
                </p>
                <p className="text-xs text-red-600">estimated</p>
              </div>
              <Fuel className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mock Route Map */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Route Visualization</h3>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 text-center">
            <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Route Map</h3>
            <p className="text-gray-600 mb-4">
              Visual route optimization with real-time traffic and distance calculations
            </p>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Starting Point</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Client Location</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>End Point</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              🗺️ <strong>Mocked Feature:</strong> Google Maps integration for real-time routing
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Routes List */}
      <div className="space-y-6" data-testid="routes-list">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-32 rounded-lg"></div>
            ))}
          </div>
        ) : routes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No routes for this date</h3>
              <p className="text-gray-500">
                Select a different date or add jobs to see optimized routes
              </p>
            </CardContent>
          </Card>
        ) : (
          routes.map((route, index) => (
            <Card key={route.id || index} className="hover:shadow-lg transition-shadow" data-testid={`route-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Route className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Route #{index + 1}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getHelperName(route.helper_id)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {route.optimized && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Optimized
                      </span>
                    )}
                  </div>
                </div>

                {/* Route Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-sm text-blue-600">Jobs</p>
                    <p className="text-lg font-bold text-blue-900">{route.jobs.length}</p>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-sm text-green-600">Distance</p>
                    <p className="text-lg font-bold text-green-900">
                      {Math.round(route.total_distance_miles)}mi
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-sm text-orange-600">Travel Time</p>
                    <p className="text-lg font-bold text-orange-900">
                      {formatTime(route.total_travel_time_minutes)}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <Fuel className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="text-sm text-red-600">Fuel Cost</p>
                    <p className="text-lg font-bold text-red-900">
                      {formatCurrency(route.fuel_cost)}
                    </p>
                  </div>
                </div>

                {/* Route Efficiency */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Route Efficiency</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">95%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Optimized for minimum travel time and fuel consumption
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-4">
                  <Button variant="outline" size="sm" data-testid={`view-route-${index}`}>
                    <Navigation className="w-4 h-4 mr-2" />
                    View Route
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    data-testid={`start-route-${index}`}
                  >
                    <Route className="w-4 h-4 mr-2" />
                    Start Route
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Efficiency Tips */}
      <Card className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <h3 className="text-lg font-semibold text-indigo-900">💡 Route Optimization Tips</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Clock className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <h4 className="font-medium text-indigo-900 mb-1">Time Efficiency</h4>
              <p className="text-sm text-indigo-600">
                Group nearby jobs together to minimize travel time
              </p>
            </div>
            
            <div className="text-center">
              <Fuel className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <h4 className="font-medium text-indigo-900 mb-1">Fuel Savings</h4>
              <p className="text-sm text-indigo-600">
                Optimize routes to reduce fuel costs by up to 30%
              </p>
            </div>
            
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <h4 className="font-medium text-indigo-900 mb-1">Productivity</h4>
              <p className="text-sm text-indigo-600">
                Complete more jobs per day with smart routing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Routes;