
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useDriver } from "../contexts/DriverContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Car, Phone, Star, Clock, MapPin, IndianRupee } from "lucide-react";

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const { driver, rideRequests, acceptRideRequest, rejectRideRequest, toggleAvailability, fetchRideRequests } = useDriver();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!driver) {
      navigate("/driver-registration");
    }
  }, [user, driver, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRideRequests();
    }, 10000); // Poll every 10 seconds for new requests

    return () => clearInterval(interval);
  }, [fetchRideRequests]);
  
  if (!user || !driver) {
    return null;
  }

  const formatDateTime = (date: string, time: string) => {
    return `${new Date(date).toLocaleDateString()} at ${time}`;
  };
  
  return (
    <div className="taxi-container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
        <Button
          onClick={toggleAvailability}
          variant={driver.isAvailable ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          <div className={`w-2 h-2 rounded-full ${driver.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
          {driver.isAvailable ? 'Go Offline' : 'Go Online'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driver.rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Based on {driver.totalRides} rides
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driver.totalRides}</div>
            <p className="text-xs text-muted-foreground">
              Completed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className={`w-2 h-2 rounded-full ${driver.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {driver.isAvailable ? 'Online' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              {driver.isAvailable ? 'Available for rides' : 'Not accepting rides'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="requests">
            Ride Requests {rideRequests.length > 0 && <Badge variant="destructive" className="ml-2">{rideRequests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          {rideRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No ride requests at the moment</p>
              {!driver.isAvailable && (
                <p className="text-sm text-muted-foreground">Go online to receive ride requests</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {rideRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-amber-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {request.booking?.pickup} → {request.booking?.dropoff}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDateTime(request.booking?.date || '', request.booking?.time || '')}
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-4 w-4" />
                            ₹{request.booking?.priceInr.toFixed(2)}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{request.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => acceptRideRequest(request.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => rejectRideRequest(request.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Driver Profile</CardTitle>
              <CardDescription>Your driver information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{driver.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{driver.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">License Number</Label>
                  <p className="text-sm text-muted-foreground">{driver.licenseNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Vehicle</Label>
                  <p className="text-sm text-muted-foreground">
                    {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">License Plate</Label>
                  <p className="text-sm text-muted-foreground">{driver.vehicleLicensePlate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
