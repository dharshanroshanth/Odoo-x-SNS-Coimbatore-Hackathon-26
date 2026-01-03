import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicTrip } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign, Clock, Plane, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const PublicTrip = () => {
  const { publicUrl } = useParams();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicTrip();
  }, [publicUrl]);

  const loadPublicTrip = async () => {
    try {
      const data = await getPublicTrip(publicUrl);
      setTripData(data);
    } catch (error) {
      toast.error('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Trip Not Found</h2>
            <p className="text-gray-600">This trip may have been removed or made private.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { trip, stops, activities } = tripData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" data-testid="public-trip-page">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">GlobeTrotter</span>
            </div>
            <Button onClick={handleShare} data-testid="share-trip-btn">
              <Share2 className="h-4 w-4 mr-2" />
              Share Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2" data-testid="public-trip-title">{trip.name}</CardTitle>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {trip.start_date} to {trip.end_date}
                  </div>
                  <Badge>{trip.status}</Badge>
                </div>
              </div>
            </div>
            {trip.description && (
              <p className="text-gray-700 mt-4">{trip.description}</p>
            )}
          </CardHeader>
        </Card>

        {/* Itinerary */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Itinerary</h2>
          {stops.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600">No stops planned yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {stops.map((stop, idx) => {
                const stopActivities = activities.filter(a => a.stop_id === stop.id);
                return (
                  <Card key={stop.id}>
                    <CardHeader>
                      <CardTitle>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          <span>Stop {idx + 1}: {stop.city_name}, {stop.country}</span>
                        </div>
                        <div className="text-sm text-gray-600 font-normal mt-1">
                          {stop.start_date} to {stop.end_date}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stopActivities.length === 0 ? (
                        <p className="text-gray-600 text-sm">No activities planned</p>
                      ) : (
                        <div className="space-y-2">
                          {stopActivities.map(activity => (
                            <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold">{activity.activity_name}</h4>
                              {activity.activity_description && (
                                <p className="text-sm text-gray-600 mt-1">{activity.activity_description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {activity.date}
                                </span>
                                {activity.time && (
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {activity.time}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  ${activity.cost}
                                </span>
                                <Badge variant="outline">{activity.category}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="text-center py-8">
            <Plane className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Plan Your Own Adventure</h3>
            <p className="text-gray-600 mb-4">Create amazing trip itineraries like this one!</p>
            <Button onClick={() => window.location.href = '/register'}>
              Join GlobeTrotter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicTrip;
