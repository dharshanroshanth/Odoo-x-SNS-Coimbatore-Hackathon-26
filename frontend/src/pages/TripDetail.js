import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrip, getStops, getTripActivities, getTripBudget, createStop, deleteStop, addTripActivity, deleteTripActivity, searchCities, getCityActivities } from '@/utils/api';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const TripDetail = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [activities, setActivities] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  
  // Form states
  const [newStop, setNewStop] = useState({
    city_id: '',
    start_date: '',
    end_date: '',
    order: 0
  });
  
  const [newActivity, setNewActivity] = useState({
    stop_id: '',
    activity_template_id: '',
    date: '',
    time: '',
    custom_cost: ''
  });

  useEffect(() => {
    loadTripData();
    loadCities();
  }, [tripId]);

  const loadTripData = async () => {
    try {
      const [tripData, stopsData, activitiesData, budgetData] = await Promise.all([
        getTrip(tripId),
        getStops(tripId),
        getTripActivities(tripId),
        getTripBudget(tripId)
      ]);
      setTrip(tripData);
      setStops(stopsData);
      setActivities(activitiesData);
      setBudget(budgetData);
    } catch (error) {
      toast.error('Failed to load trip data');
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const citiesData = await searchCities();
      setCities(citiesData);
    } catch (error) {
      toast.error('Failed to load cities');
    }
  };

  const loadCityActivities = async (cityId) => {
    try {
      const activitiesData = await getCityActivities(cityId);
      setAvailableActivities(activitiesData);
    } catch (error) {
      toast.error('Failed to load activities');
    }
  };

  const handleAddStop = async () => {
    try {
      const stopData = {
        ...newStop,
        trip_id: tripId,
        order: stops.length + 1
      };
      await createStop(stopData);
      toast.success('Stop added successfully');
      setAddStopOpen(false);
      setNewStop({ city_id: '', start_date: '', end_date: '', order: 0 });
      loadTripData();
    } catch (error) {
      toast.error('Failed to add stop');
    }
  };

  const handleDeleteStop = async (stopId) => {
    try {
      await deleteStop(stopId);
      toast.success('Stop removed successfully');
      loadTripData();
    } catch (error) {
      toast.error('Failed to remove stop');
    }
  };

  const handleAddActivity = async () => {
    try {
      await addTripActivity(newActivity);
      toast.success('Activity added successfully');
      setAddActivityOpen(false);
      setNewActivity({ stop_id: '', activity_template_id: '', date: '', time: '', custom_cost: '' });
      loadTripData();
    } catch (error) {
      toast.error('Failed to add activity');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteTripActivity(activityId);
      toast.success('Activity removed successfully');
      loadTripData();
    } catch (error) {
      toast.error('Failed to remove activity');
    }
  };

  const openActivityDialog = (stop) => {
    setSelectedStop(stop);
    setNewActivity({ ...newActivity, stop_id: stop.id });
    loadCityActivities(stop.city_id);
    setAddActivityOpen(true);
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
    <div className="min-h-screen bg-gray-50" data-testid="trip-detail-page">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" data-testid="trip-title">{trip?.name}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {trip?.start_date} to {trip?.end_date}
            </div>
            <Badge>{trip?.status}</Badge>
          </div>
          {trip?.description && (
            <p className="text-gray-600 mt-2">{trip.description}</p>
          )}
        </div>

        {/* Budget Summary */}
        {budget && (
          <Card className="mb-6" data-testid="budget-summary">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Budget Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold" data-testid="total-budget">${budget.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transport</p>
                  <p className="text-lg font-semibold">${budget.breakdown.transport.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Accommodation</p>
                  <p className="text-lg font-semibold">${budget.breakdown.accommodation.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Food</p>
                  <p className="text-lg font-semibold">${budget.breakdown.food.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activities</p>
                  <p className="text-lg font-semibold">${budget.breakdown.activities.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Other</p>
                  <p className="text-lg font-semibold">${budget.breakdown.other.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="itinerary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="itinerary" data-testid="itinerary-tab">Itinerary</TabsTrigger>
            <TabsTrigger value="stops" data-testid="stops-tab">Stops ({stops.length})</TabsTrigger>
          </TabsList>

          {/* Itinerary View */}
          <TabsContent value="itinerary" className="space-y-4">
            {stops.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No stops added yet. Start building your itinerary!</p>
                  <Dialog open={addStopOpen} onOpenChange={setAddStopOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="add-first-stop-btn">Add First Stop</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Stop</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>City</Label>
                          <Select value={newStop.city_id} onValueChange={(value) => setNewStop({...newStop, city_id: value})}>
                            <SelectTrigger data-testid="select-city-trigger">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map(city => (
                                <SelectItem key={city.id} value={city.id}>{city.name}, {city.country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input type="date" value={newStop.start_date} onChange={(e) => setNewStop({...newStop, start_date: e.target.value})} data-testid="stop-start-date-input" />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input type="date" value={newStop.end_date} onChange={(e) => setNewStop({...newStop, end_date: e.target.value})} data-testid="stop-end-date-input" />
                          </div>
                        </div>
                        <Button onClick={handleAddStop} className="w-full" data-testid="save-stop-btn">Add Stop</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Day-by-Day Itinerary</h2>
                  <Dialog open={addStopOpen} onOpenChange={setAddStopOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="add-stop-btn">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stop
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Stop</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>City</Label>
                          <Select value={newStop.city_id} onValueChange={(value) => setNewStop({...newStop, city_id: value})}>
                            <SelectTrigger data-testid="select-city-trigger">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map(city => (
                                <SelectItem key={city.id} value={city.id}>{city.name}, {city.country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input type="date" value={newStop.start_date} onChange={(e) => setNewStop({...newStop, start_date: e.target.value})} data-testid="stop-start-date-input" />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input type="date" value={newStop.end_date} onChange={(e) => setNewStop({...newStop, end_date: e.target.value})} data-testid="stop-end-date-input" />
                          </div>
                        </div>
                        <Button onClick={handleAddStop} className="w-full" data-testid="save-stop-btn">Add Stop</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-6">
                  {stops.map((stop, idx) => {
                    const stopActivities = activities.filter(a => a.stop_id === stop.id);
                    return (
                      <Card key={stop.id} data-testid={`stop-card-${stop.id}`}>
                        <CardHeader>
                          <CardTitle className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <span>Stop {idx + 1}: {stop.city_name}, {stop.country}</span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {stop.start_date} to {stop.end_date}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={() => openActivityDialog(stop)} data-testid={`add-activity-${stop.id}-btn`}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Activity
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteStop(stop.id)} data-testid={`delete-stop-${stop.id}-btn`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {stopActivities.length === 0 ? (
                            <p className="text-gray-600 text-sm">No activities planned yet</p>
                          ) : (
                            <div className="space-y-2">
                              {stopActivities.map(activity => (
                                <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg" data-testid={`activity-${activity.id}`}>
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{activity.activity_name}</h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
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
                                  <Button size="sm" variant="ghost" onClick={() => handleDeleteActivity(activity.id)} data-testid={`delete-activity-${activity.id}-btn`}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          {/* Stops List View */}
          <TabsContent value="stops" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                {stops.length === 0 ? (
                  <p className="text-gray-600 text-center">No stops added</p>
                ) : (
                  <div className="space-y-4">
                    {stops.map((stop, idx) => (
                      <div key={stop.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">Stop {idx + 1}: {stop.city_name}, {stop.country}</h3>
                          <p className="text-sm text-gray-600">{stop.start_date} to {stop.end_date}</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteStop(stop.id)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={addActivityOpen} onOpenChange={setAddActivityOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Activity to {selectedStop?.city_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Activity</Label>
              <Select value={newActivity.activity_template_id} onValueChange={(value) => setNewActivity({...newActivity, activity_template_id: value})}>
                <SelectTrigger data-testid="select-activity-trigger">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {availableActivities.map(activity => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.name} - ${activity.estimated_cost} ({activity.duration}h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={newActivity.date} onChange={(e) => setNewActivity({...newActivity, date: e.target.value})} data-testid="activity-date-input" />
              </div>
              <div>
                <Label>Time (Optional)</Label>
                <Input type="time" value={newActivity.time} onChange={(e) => setNewActivity({...newActivity, time: e.target.value})} data-testid="activity-time-input" />
              </div>
            </div>
            <div>
              <Label>Custom Cost (Optional)</Label>
              <Input type="number" step="0.01" value={newActivity.custom_cost} onChange={(e) => setNewActivity({...newActivity, custom_cost: e.target.value})} placeholder="Leave empty to use default" data-testid="activity-custom-cost-input" />
            </div>
            <Button onClick={handleAddActivity} className="w-full" data-testid="save-activity-btn">Add Activity</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripDetail;
