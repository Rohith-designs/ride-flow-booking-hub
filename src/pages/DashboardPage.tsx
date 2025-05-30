
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBooking } from "../contexts/BookingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { IndianRupee } from "lucide-react";
import RatingComponent from "../components/RatingComponent";

export default function DashboardPage() {
  const { user } = useAuth();
  const { getCurrentBookings, getPastBookings } = useBooking();
  const [showRatingFor, setShowRatingFor] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  const currentBookings = getCurrentBookings();
  const pastBookings = getPastBookings();
  
  if (!user) {
    return null;
  }
  
  const formatDateTime = (date: string, time: string) => {
    return `${new Date(date).toLocaleDateString()} at ${time}`;
  };
  
  return (
    <div className="taxi-container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="current">Current Bookings</TabsTrigger>
          <TabsTrigger value="past">Past Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          {currentBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You don't have any current bookings</p>
              <Button onClick={() => navigate("/")} className="btn-accent">
                Book a Ride
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {currentBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className={`h-2 ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {booking.pickup} → {booking.dropoff}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{formatDateTime(booking.date, booking.time)}</span>
                          {booking.priceInr && (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <IndianRupee className="h-3 w-3" />
                              ₹{booking.priceInr.toFixed(2)}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                        {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {booking.driver ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h3 className="font-medium mb-2">Driver Information</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-muted-foreground">Name:</div>
                              <div>{booking.driver.name}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Contact:</div>
                              <div>{booking.driver.phone}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Rating:</div>
                              <div>{booking.driver.rating} ★</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-muted rounded-lg">
                          <h3 className="font-medium mb-2">Vehicle Information</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-muted-foreground">Make & Model:</div>
                              <div>{booking.driver.vehicle.make} {booking.driver.vehicle.model}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Color:</div>
                              <div>{booking.driver.vehicle.color}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">License Plate:</div>
                              <div>{booking.driver.vehicle.licensePlate}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-2">Looking for available drivers...</p>
                        <p className="text-xs text-muted-foreground">You'll be notified once a driver accepts</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You don't have any past bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {booking.pickup} → {booking.dropoff}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span>{formatDateTime(booking.date, booking.time)}</span>
                            {booking.priceInr && (
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                <IndianRupee className="h-3 w-3" />
                                ₹{booking.priceInr.toFixed(2)}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </div>
                      </div>
                    </CardHeader>
                    {booking.status === 'completed' && (
                      <CardContent>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRatingFor(showRatingFor === booking.id ? null : booking.id)}
                        >
                          {showRatingFor === booking.id ? 'Hide Rating' : 'Rate This Ride'}
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                  
                  {showRatingFor === booking.id && booking.status === 'completed' && (
                    <RatingComponent
                      bookingId={parseInt(booking.id)}
                      driverId={booking.assignedDriverId}
                      onRatingSubmitted={() => setShowRatingFor(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
