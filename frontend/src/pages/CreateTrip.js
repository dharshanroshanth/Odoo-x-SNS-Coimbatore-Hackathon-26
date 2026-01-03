import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '@/utils/api';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
    cover_photo: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trip = await createTrip(formData);
      toast.success('Trip created successfully!');
      navigate(`/trips/${trip.id}`);
    } catch (error) {
      toast.error('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="create-trip-page">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a New Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Trip Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Summer Europe Adventure"
                  required
                  data-testid="trip-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    data-testid="trip-start-date-input"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    data-testid="trip-end-date-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your trip..."
                  rows={4}
                  data-testid="trip-description-textarea"
                />
              </div>

              <div>
                <Label htmlFor="cover_photo">Cover Photo URL (Optional)</Label>
                <Input
                  id="cover_photo"
                  name="cover_photo"
                  value={formData.cover_photo}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  data-testid="trip-cover-photo-input"
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading} className="flex-1" data-testid="create-trip-submit-btn">
                  {loading ? 'Creating...' : 'Create Trip'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} data-testid="cancel-create-trip-btn">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTrip;
