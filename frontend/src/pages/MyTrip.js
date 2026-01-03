import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, deleteTrip } from '@/utils/api';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Trash2, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MyTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTrip(tripToDelete);
      toast.success('Trip deleted successfully');
      setTrips(trips.filter(t => t.id !== tripToDelete));
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const confirmDelete = (tripId) => {
    setTripToDelete(tripId);
    setDeleteDialogOpen(true);
  };

  const ongoingTrips = trips.filter(t => t.status === 'ongoing');
  const upcomingTrips = trips.filter(t => t.status === 'upcoming');
  const completedTrips = trips.filter(t => t.status === 'completed');

  const TripCard = ({ trip }) => (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`trip-card-${trip.id}`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{trip.name}</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            trip.status === 'ongoing' ? 'bg-green-100 text-green-800' :
            trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {trip.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {trip.start_date} to {trip.end_date}
          </div>
          {trip.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{trip.description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => navigate(`/trips/${trip.id}`)} data-testid={`view-trip-${trip.id}-btn`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/trips/${trip.id}/edit`)} data-testid={`edit-trip-${trip.id}-btn`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => confirmDelete(trip.id)} data-testid={`delete-trip-${trip.id}-btn`}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
    <div className="min-h-screen bg-gray-50" data-testid="my-trips-page">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Trips</h1>
          <Button onClick={() => navigate('/create-trip')} data-testid="create-new-trip-btn">
            <MapPin className="h-4 w-4 mr-2" />
            Create New Trip
          </Button>
        </div>

        <Tabs defaultValue="ongoing" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ongoing" data-testid="ongoing-tab">
              Ongoing ({ongoingTrips.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="upcoming-tab">
              Upcoming ({upcomingTrips.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="completed-tab">
              Completed ({completedTrips.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-4">
            {ongoingTrips.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600">No ongoing trips</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingTrips.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600">No upcoming trips</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTrips.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600">No completed trips</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this trip and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="confirm-delete-btn">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTrips;
