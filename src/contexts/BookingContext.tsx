
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
        .select("*")
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
          createdAt: item.created_at,
          ...(item.driver_name && {
            driver: {
              name: item.driver_name,
              phone: item.driver_phone || '',
              rating: 4.8, // Default rating
              vehicle: {
                make: item.vehicle_make || '',
                model: item.vehicle_model || '',
                color: item.vehicle_color || '',
                licensePlate: item.vehicle_license_plate || '',
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
      // Insert into Supabase
      const { data, error } = await supabase
        .from("Bookings")
        .insert({
          user_id: user.id,
          pickup_location: bookingData.pickup,
          dropoff_location: bookingData.dropoff,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
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
        createdAt: data.created_at
      };

      setBookings(prev => [...prev, newBooking]);
      return newBooking;
    } catch (error: any) {
      console.error("Error in createBooking:", error);
      throw error;
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
    try {
      // Pick a random driver from our mock data
      const driver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
      
      // Convert bookingId to number for the database operation
      const numericBookingId = parseInt(bookingId, 10);
      
      // Update in Supabase
      const { error } = await supabase
        .from("Bookings")
        .update({
          status: "confirmed",
          driver_name: driver.name,
          driver_phone: driver.phone,
          vehicle_make: driver.vehicle.make,
          vehicle_model: driver.vehicle.model,
          vehicle_color: driver.vehicle.color,
          vehicle_license_plate: driver.vehicle.licensePlate
        })
        .eq("id", numericBookingId);

      if (error) {
        console.error("Error assigning driver:", error);
        return;
      }

      toast.success("A driver has been assigned to your booking!");
      
      // Update local state
      setBookings(prev => prev.map(booking => {
        if (String(booking.id) === bookingId) {
          return {
            ...booking,
            status: "confirmed" as const,
            driver
          };
        }
        return booking;
      }));
    } catch (error) {
      console.error("Error in assignDriver:", error);
    }
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
