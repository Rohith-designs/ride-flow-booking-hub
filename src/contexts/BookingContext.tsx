
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define the shape of our booking object
export interface Booking {
  id: string;
  userId: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  priceInr?: number;
  assignedDriverId?: string;
  driver?: {
    name: string;
    phone: string;
    rating: number;
    vehicle: {
      make: string;
      model: string;
      color: string;
      licensePlate: string;
    };
  };
  createdAt: string;
}

// Define the shape of our booking context
interface BookingContextType {
  bookings: Booking[];
  createBooking: (bookingData: Omit<Booking, "id" | "userId" | "status" | "createdAt">) => Promise<Booking>;
  getBookingById: (id: string) => Booking | undefined;
  getCurrentBookings: () => Booking[];
  getPastBookings: () => Booking[];
  assignDriver: (bookingId: string) => void;
}

// Create the booking context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Mock driver data for demonstration
const MOCK_DRIVERS = [
  {
    name: "Michael Smith",
    phone: "+1 (555) 123-4567",
    rating: 4.8,
    vehicle: {
      make: "Toyota",
      model: "Camry",
      color: "Silver",
      licensePlate: "ABC 1234"
    }
  },
  {
    name: "Sarah Johnson",
    phone: "+1 (555) 987-6543",
    rating: 4.9,
    vehicle: {
      make: "Honda",
      model: "Accord",
      color: "Black",
      licensePlate: "XYZ 7890"
    }
  }
];

interface BookingProviderProps {
  children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user } = useAuth();

  // Fetch bookings when user changes
  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setBookings([]);
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("Bookings")
        .select(`
          *,
          drivers(
            name,
            phone,
            rating,
            vehicle_make,
            vehicle_model,
            vehicle_color,
            vehicle_license_plate
          )
        `)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching bookings:", error);
        return;
      }

      if (data) {
        // Transform the data to match our Booking interface
        const transformedBookings = data.map(item => ({
          id: String(item.id),
          userId: item.user_id,
          pickup: item.pickup_location || '',
          dropoff: item.dropoff_location || '',
          date: item.booking_date || '',
          time: item.booking_time || '',
          status: (item.status || 'pending') as "pending" | "confirmed" | "completed" | "cancelled",
          priceInr: item.price_inr ? parseFloat(item.price_inr) : undefined,
          assignedDriverId: item.assigned_driver_id || undefined,
          createdAt: item.created_at,
          ...(item.drivers && {
            driver: {
              name: item.drivers.name,
              phone: item.drivers.phone || '',
              rating: parseFloat(item.drivers.rating) || 4.8,
              vehicle: {
                make: item.drivers.vehicle_make || '',
                model: item.drivers.vehicle_model || '',
                color: item.drivers.vehicle_color || '',
                licensePlate: item.drivers.vehicle_license_plate || '',
              }
            }
          })
        }));
        
        setBookings(transformedBookings);
      }
    } catch (error) {
      console.error("Error in fetchBookings:", error);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, "id" | "userId" | "status" | "createdAt">): Promise<Booking> => {
    if (!user) {
      throw new Error("User must be logged in to create a booking");
    }
    
    try {
      // Calculate price using the database function
      const { data: priceData, error: priceError } = await supabase
        .rpc('calculate_ride_price', {
          pickup_location: bookingData.pickup,
          dropoff_location: bookingData.dropoff
        });

      if (priceError) {
        console.error("Error calculating price:", priceError);
      }

      const calculatedPrice = priceData || 100; // Fallback price

      // Insert into Supabase
      const { data, error } = await supabase
        .from("Bookings")
        .insert({
          user_id: user.id,
          pickup_location: bookingData.pickup,
          dropoff_location: bookingData.dropoff,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
          price_inr: calculatedPrice,
          status: "pending"
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating booking:", error);
        throw new Error(error.message || "Failed to create booking");
      }

      if (!data) {
        throw new Error("No data returned from booking creation");
      }

      // Transform to our Booking format
      const newBooking: Booking = {
        id: String(data.id),
        userId: data.user_id,
        pickup: data.pickup_location || '',
        dropoff: data.dropoff_location || '',
        date: data.booking_date || '',
        time: data.booking_time || '',
        status: (data.status || 'pending') as "pending" | "confirmed" | "completed" | "cancelled",
        priceInr: parseFloat(String(data.price_inr)) || calculatedPrice,
        createdAt: data.created_at
      };

      setBookings(prev => [...prev, newBooking]);

      // Start the driver assignment process
      setTimeout(() => {
        assignDriverToBooking(data.id); // Use the original number ID here
      }, 2000);

      return newBooking;
    } catch (error: any) {
      console.error("Error in createBooking:", error);
      throw error;
    }
  };

  const assignDriverToBooking = async (bookingId: number) => {
    try {
      // Get available drivers
      const { data: drivers, error: driversError } = await supabase
        .from("drivers")
        .select("id")
        .eq("is_available", true)
        .limit(3);

      if (driversError || !drivers || drivers.length === 0) {
        console.log("No available drivers found");
        return;
      }

      // Create ride requests for available drivers
      const rideRequests = drivers.map(driver => ({
        booking_id: bookingId,
        driver_id: driver.id,
        status: 'pending'
      }));

      const { error: requestError } = await supabase
        .from("ride_requests")
        .insert(rideRequests);

      if (requestError) {
        console.error("Error creating ride requests:", requestError);
        return;
      }

      toast.success("Looking for available drivers...");
    } catch (error) {
      console.error("Error in assignDriverToBooking:", error);
    }
  };

  const getBookingById = (id: string) => {
    return bookings.find(b => String(b.id) === id);
  };

  const getCurrentBookings = () => {
    if (!user) return [];
    return bookings.filter(b => 
      b.userId === user.id && 
      (b.status === "pending" || b.status === "confirmed")
    );
  };

  const getPastBookings = () => {
    if (!user) return [];
    return bookings.filter(b => 
      b.userId === user.id && 
      (b.status === "completed" || b.status === "cancelled")
    );
  };

  const assignDriver = async (bookingId: string) => {
    // This is now handled automatically through the ride_requests system
    // Keeping for backward compatibility
    console.log("assignDriver called for booking:", bookingId);
  };

  return (
    <BookingContext.Provider value={{ 
      bookings, 
      createBooking, 
      getBookingById, 
      getCurrentBookings, 
      getPastBookings,
      assignDriver
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
