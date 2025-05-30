
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDriver } from "../contexts/DriverContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function DriverRegistrationPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleColor: "",
    vehicleLicensePlate: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { registerDriver } = useDriver();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await registerDriver(formData);
      navigate("/driver-dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to register as driver");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Driver Registration</CardTitle>
          <CardDescription>
            Register to become a driver and start earning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                placeholder="Enter your license number"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleMake">Vehicle Make</Label>
                <Input
                  id="vehicleMake"
                  name="vehicleMake"
                  placeholder="e.g., Toyota"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Vehicle Model</Label>
                <Input
                  id="vehicleModel"
                  name="vehicleModel"
                  placeholder="e.g., Camry"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleColor">Vehicle Color</Label>
                <Input
                  id="vehicleColor"
                  name="vehicleColor"
                  placeholder="e.g., White"
                  value={formData.vehicleColor}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehicleLicensePlate">License Plate</Label>
                <Input
                  id="vehicleLicensePlate"
                  name="vehicleLicensePlate"
                  placeholder="e.g., ABC 1234"
                  value={formData.vehicleLicensePlate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-accent"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register as Driver"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
