
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleLicensePlate: string;
  rating: number;
  totalRides: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface RideRequest {
  id: string;
  bookingId: number;
  driverId: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  requestedAt: string;
  respondedAt?: string;
  booking?: {
    pickup: string;
    dropoff: string;
    date: string;
    time: string;
    priceInr: number;
    userId: string;
  };
}

interface DriverContextType {
  driver: Driver | null;
  rideRequests: RideRequest[];
  registerDriver: (driverData: Omit<Driver, "id" | "userId" | "rating" | "totalRides" | "isAvailable" | "createdAt">) => Promise<void>;
  acceptRideRequest: (requestId: string) => Promise<void>;
  rejectRideRequest: (requestId: string) => Promise<void>;
  completeRide: (bookingId: number) => Promise<void>;
  toggleAvailability: () => Promise<void>;
  fetchRideRequests: () => Promise<void>;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

interface DriverProviderProps {
  children: ReactNode;
}

export function DriverProvider({ children }: DriverProviderProps) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDriverProfile();
      fetchRideRequests();
    } else {
      setDriver(null);
      setRideRequests([]);
    }
  }, [user]);

  const fetchDriverProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching driver profile:", error);
        return;
      }

      if (data) {
        setDriver({
          id: data.id,
          userId: data.user_id,
          name: data.name,
          phone: data.phone,
          licenseNumber: data.license_number,
          vehicleMake: data.vehicle_make,
          vehicleModel: data.vehicle_model,
          vehicleColor: data.vehicle_color,
          vehicleLicensePlate: data.vehicle_license_plate,
          rating: parseFloat(data.rating) || 4.5,
          totalRides: data.total_rides || 0,
          isAvailable: data.is_available || true,
          createdAt: data.created_at
        });
      }
    } catch (error) {
      console.error("Error in fetchDriverProfile:", error);
    }
  };

  const fetchRideRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("ride_requests")
        .select(`
          *,
          Bookings!inner(
            pickup_location,
            dropoff_location,
            booking_date,
            booking_time,
            price_inr,
            user_id
          )
        `)
        .eq("drivers.user_id", user.id)
        .eq("status", "pending")
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Error fetching ride requests:", error);
        return;
      }

      if (data) {
        const transformedRequests = data.map(item => ({
          id: item.id,
          bookingId: item.booking_id,
          driverId: item.driver_id,
          status: item.status as "pending" | "accepted" | "rejected" | "expired",
          requestedAt: item.requested_at,
          respondedAt: item.responded_at,
          booking: {
            pickup: item.Bookings.pickup_location || '',
            dropoff: item.Bookings.dropoff_location || '',
            date: item.Bookings.booking_date || '',
            time: item.Bookings.booking_time || '',
            priceInr: parseFloat(item.Bookings.price_inr) || 0,
            userId: item.Bookings.user_id
          }
        }));
        
        setRideRequests(transformedRequests);
      }
    } catch (error) {
      console.error("Error in fetchRideRequests:", error);
    }
  };

  const registerDriver = async (driverData: Omit<Driver, "id" | "userId" | "rating" | "totalRides" | "isAvailable" | "createdAt">) => {
    if (!user) {
      throw new Error("User must be logged in to register as driver");
    }

    try {
      const { data, error } = await supabase
        .from("drivers")
        .insert({
          user_id: user.id,
          name: driverData.name,
          phone: driverData.phone,
          license_number: driverData.licenseNumber,
          vehicle_make: driverData.vehicleMake,
          vehicle_model: driverData.vehicleModel,
          vehicle_color: driverData.vehicleColor,
          vehicle_license_plate: driverData.vehicleLicensePlate
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Failed to register driver");
      }

      if (data) {
        setDriver({
          id: data.id,
          userId: data.user_id,
          name: data.name,
          phone: data.phone,
          licenseNumber: data.license_number,
          vehicleMake: data.vehicle_make,
          vehicleModel: data.vehicle_model,
          vehicleColor: data.vehicle_color,
          vehicleLicensePlate: data.vehicle_license_plate,
          rating: parseFloat(data.rating) || 4.5,
          totalRides: data.total_rides || 0,
          isAvailable: data.is_available || true,
          createdAt: data.created_at
        });
        
        toast.success("Driver registration successful!");
      }
    } catch (error: any) {
      console.error("Error in registerDriver:", error);
      throw error;
    }
  };

  const acceptRideRequest = async (requestId: string) => {
    try {
      const request = rideRequests.find(r => r.id === requestId);
      if (!request) return;

      // Update ride request status
      const { error: requestError } = await supabase
        .from("ride_requests")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (requestError) {
        throw new Error(requestError.message);
      }

      // Update booking with driver assignment
      const { error: bookingError } = await supabase
        .from("Bookings")
        .update({
          status: "confirmed",
          assigned_driver_id: driver?.id
        })
        .eq("id", request.bookingId);

      if (bookingError) {
        throw new Error(bookingError.message);
      }

      // Reject all other pending requests for this booking
      await supabase
        .from("ride_requests")
        .update({ status: "expired" })
        .eq("booking_id", request.bookingId)
        .neq("id", requestId);

      toast.success("Ride request accepted!");
      fetchRideRequests();
    } catch (error: any) {
      console.error("Error accepting ride:", error);
      toast.error("Failed to accept ride request");
    }
  };

  const rejectRideRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("ride_requests")
        .update({
          status: "rejected",
          responded_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Ride request rejected");
      fetchRideRequests();
    } catch (error: any) {
      console.error("Error rejecting ride:", error);
      toast.error("Failed to reject ride request");
    }
  };

  const completeRide = async (bookingId: number) => {
    try {
      const { error } = await supabase
        .from("Bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);

      if (error) {
        throw new Error(error.message);
      }

      // Update driver's total rides
      if (driver) {
        await supabase
          .from("drivers")
          .update({ total_rides: driver.totalRides + 1 })
          .eq("id", driver.id);
      }

      toast.success("Ride completed successfully!");
    } catch (error: any) {
      console.error("Error completing ride:", error);
      toast.error("Failed to complete ride");
    }
  };

  const toggleAvailability = async () => {
    if (!driver) return;

    try {
      const newAvailability = !driver.isAvailable;
      
      const { error } = await supabase
        .from("drivers")
        .update({ is_available: newAvailability })
        .eq("id", driver.id);

      if (error) {
        throw new Error(error.message);
      }

      setDriver({ ...driver, isAvailable: newAvailability });
      toast.success(`You are now ${newAvailability ? 'available' : 'unavailable'} for rides`);
    } catch (error: any) {
      console.error("Error toggling availability:", error);
      toast.error("Failed to update availability");
    }
  };

  return (
    <DriverContext.Provider value={{
      driver,
      rideRequests,
      registerDriver,
      acceptRideRequest,
      rejectRideRequest,
      completeRide,
      toggleAvailability,
      fetchRideRequests
    }}>
      {children}
    </DriverContext.Provider>
  );
}

export function useDriver() {
  const context = useContext(DriverContext);
  if (context === undefined) {
    throw new Error("useDriver must be used within a DriverProvider");
  }
  return context;
}
