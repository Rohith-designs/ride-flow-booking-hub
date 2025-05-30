
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";

interface RatingComponentProps {
  bookingId: number;
  driverId?: string;
  onRatingSubmitted?: () => void;
}

export default function RatingComponent({ bookingId, driverId, onRatingSubmitted }: RatingComponentProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();

  const handleSubmitRating = async () => {
    if (!user || !driverId || rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("ride_ratings")
        .insert({
          booking_id: bookingId,
          user_id: user.id,
          driver_id: driverId,
          rating,
          comment: comment.trim() || null
        });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Thank you for your rating!");
      setIsSubmitted(true);
      onRatingSubmitted?.();
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      if (error.message.includes('duplicate key')) {
        toast.error("You have already rated this ride");
        setIsSubmitted(true);
      } else {
        toast.error("Failed to submit rating");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-green-600 font-medium">Rating Submitted</div>
            <p className="text-sm text-green-600">Thank you for your feedback!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Rate Your Ride</CardTitle>
        <CardDescription>
          How was your experience with this ride? (Optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {rating === 0 && "Click to rate"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        <div>
          <Textarea
            placeholder="Leave a comment about your ride (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmitRating}
            disabled={rating === 0 || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onRatingSubmitted?.()}
            className="flex-1"
          >
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
