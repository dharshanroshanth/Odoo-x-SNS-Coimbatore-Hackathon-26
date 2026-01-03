import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getTrips, searchCities } from '@/utils/api';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentTrips, setRecentTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [trips, cities] = await Promise.all([
        getTrips(),
        searchCities()
      ]);
      setRecentTrips(trips.slice(0, 3));
      setPopularCities(cities.slice(0, 6));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="dashboard-welcome">
            Welcome back, {user?.first_name}! 🌍
          </h1>
          <p className="text-gray-600 mt-2">Ready to plan your next adventure?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/create-trip')} data-testid="create-trip-card">
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <PlusCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Plan New Trip</h3>
                <p className="text-sm text-gray-600">Start a new adventure</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-trips')} data-testid="my-trips-card">
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="bg-green-100 p-3 rounded-full">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">My Trips</h3>
                <p className="text-sm text-gray-600">{recentTrips.length} active trips</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/community')} data-testid="community-card">
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Community</h3>
                <p className="text-sm text-gray-600">Share experiences</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trips */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Trips</h2>
            <Button variant="outline" onClick={() => navigate('/my-trips')} data-testid="view-all-trips-btn">
              View All
            </Button>
          </div>
          {recentTrips.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No trips yet. Start planning your first adventure!</p>
                <Button onClick={() => navigate('/create-trip')} data-testid="start-planning-btn">
                  Start Planning
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentTrips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)} data-testid={`trip-card-${trip.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{trip.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {trip.start_date} to {trip.end_date}
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trip.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Popular Destinations */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCities.map((city) => (
              <Card key={city.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/cities/${city.id}`)} data-testid={`city-card-${city.id}`}>
                <CardContent className="p-4">
                  <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-2 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">{city.name}</h3>
                  <p className="text-xs text-gray-600">{city.country}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
