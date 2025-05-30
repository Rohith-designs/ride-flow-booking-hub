export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Bookings: {
        Row: {
          assigned_driver_id: string | null
          booking_date: string | null
          booking_time: string | null
          created_at: string
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          dropoff_location: string | null
          id: number
          pickup_location: string | null
          price_inr: number | null
          status: string | null
          user_id: string | null
          vehicle_color: string | null
          vehicle_license_plate: string | null
          vehicle_make: string | null
          vehicle_model: string | null
        }
        Insert: {
          assigned_driver_id?: string | null
          booking_date?: string | null
          booking_time?: string | null
          created_at?: string
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          dropoff_location?: string | null
          id?: number
          pickup_location?: string | null
          price_inr?: number | null
          status?: string | null
          user_id?: string | null
          vehicle_color?: string | null
          vehicle_license_plate?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
        }
        Update: {
          assigned_driver_id?: string | null
          booking_date?: string | null
          booking_time?: string | null
          created_at?: string
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          dropoff_location?: string | null
          id?: number
          pickup_location?: string | null
          price_inr?: number | null
          status?: string | null
          user_id?: string | null
          vehicle_color?: string | null
          vehicle_license_plate?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Bookings_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string | null
          id: string
          is_available: boolean | null
          license_number: string
          name: string
          phone: string
          rating: number | null
          total_rides: number | null
          user_id: string | null
          vehicle_color: string
          vehicle_license_plate: string
          vehicle_make: string
          vehicle_model: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          license_number: string
          name: string
          phone: string
          rating?: number | null
          total_rides?: number | null
          user_id?: string | null
          vehicle_color: string
          vehicle_license_plate: string
          vehicle_make: string
          vehicle_model: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          license_number?: string
          name?: string
          phone?: string
          rating?: number | null
          total_rides?: number | null
          user_id?: string | null
          vehicle_color?: string
          vehicle_license_plate?: string
          vehicle_make?: string
          vehicle_model?: string
        }
        Relationships: []
      }
      ride_ratings: {
        Row: {
          booking_id: number | null
          comment: string | null
          created_at: string | null
          driver_id: string | null
          id: string
          rating: number | null
          user_id: string | null
        }
        Insert: {
          booking_id?: number | null
          comment?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          booking_id?: number | null
          comment?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "Bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_requests: {
        Row: {
          booking_id: number | null
          driver_id: string | null
          id: string
          requested_at: string | null
          responded_at: string | null
          status: string | null
        }
        Insert: {
          booking_id?: number | null
          driver_id?: string | null
          id?: string
          requested_at?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          booking_id?: number | null
          driver_id?: string | null
          id?: string
          requested_at?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "Bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: number
          password_hash: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: number
          password_hash?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: number
          password_hash?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_ride_price: {
        Args: { pickup_location: string; dropoff_location: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
