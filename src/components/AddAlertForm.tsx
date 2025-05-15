// AddAlertForm: Form for simulating a detection event (admin only)
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addDetection } from "@/services/detectionService";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";

// Props for AddAlertForm (optional callback after alert is added)
interface AddAlertFormProps {
  onAlertAdded?: () => void;
}

// Main form component
const AddAlertForm: React.FC<AddAlertFormProps> = ({ onAlertAdded }) => {
  // Form state
  const [location, setLocation] = useState("Perimeter A");
  const [action, setAction] = useState("No action");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAdmin } = useAuth();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDetection({
        location,
        time: new Date().toISOString(),
        action_taken: action,
      });
      // Call the callback if provided
      if (onAlertAdded) {
        onAlertAdded();
      }
      // Reset action (optional)
      setAction("No action");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not admin, show message instead of form
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Simulate Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-center text-muted-foreground">
            <div>
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Only administrators can simulate detection alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render the form for admins
  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulate Detection</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location selection */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={location} onValueChange={setLocation} disabled={isSubmitting}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Perimeter A">Perimeter A</SelectItem>
                <SelectItem value="Perimeter B">Perimeter B</SelectItem>
                <SelectItem value="Perimeter C">Perimeter C</SelectItem>
                <SelectItem value="Perimeter D">Perimeter D</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Action selection */}
          <div className="space-y-2">
            <Label htmlFor="action">Action Taken</Label>
            <Select value={action} onValueChange={setAction} disabled={isSubmitting}>
              <SelectTrigger id="action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No action">No action</SelectItem>
                <SelectItem value="Laser deployed">Laser deployed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Simulate Detection"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddAlertForm;
