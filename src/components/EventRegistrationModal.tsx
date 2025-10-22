import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: string;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventPrice?: number;
  customQuestions?: string[];
}

const EventRegistrationModal = ({ isOpen, onClose, eventId, eventTitle, eventPrice = 0, customQuestions = [] }: EventRegistrationModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    customAnswers: {} as Record<string, string>,
  });

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.user_metadata?.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user, isOpen]);

  // Remove handlePaytmPayment as it's no longer needed
  // const handlePaytmPayment = async () => {
  //   // ... existing code ...
  // };

  /**
   * Creates a registration record in the database
   * If payment details are provided, updates the existing registration with payment info
   */
  const createRegistration = async (
    razorpayPaymentDetails?: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
    orderId?: string
  ) => {
    try {
      // Check if user is already registered for this event
      if (user) {
        const { data: existingRegistration } = await supabase
          .from("event_registrations")
          .select("id")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .single();

        if (existingRegistration) {
          toast({
            title: "Already Registered",
            description: "You are already registered for this event.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }
      
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const qrCodeData = ticketNumber;

      // Prepare registration data
      const registrationData: any = {
        event_id: eventId,
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        custom_answers: formData.customAnswers,
        ticket_code: ticketNumber,
      };

      // Add payment details if this is a paid registration
      if (orderId) {
        registrationData.payment_order_id = orderId;
        registrationData.payment_status = 'pending';
        registrationData.payment_provider = 'razorpay';
      }

      const { data: registration, error } = await supabase
        .from("event_registrations")
        .insert(registrationData)
        .select()
        .single();

      if (error) throw error;

      // Generate digital ticket

      const { error: ticketError } = await supabase
        .from("digital_tickets")
        .insert({
          user_id: user?.id,
          event_id: eventId,
          registration_id: registration.id,
          ticket_number: ticketNumber,
          qr_code_data: qrCodeData,
        });

      if (ticketError) console.error("Error creating ticket:", ticketError);

      toast({
        title: "Registration Successful!",
        description: `You are successfully registered for ${eventTitle}! Your digital ticket has been generated.`,
      });

      onClose();
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        customAnswers: {} 
      });

      // Redirect to receipt page after successful payment and registration
      if (razorpayPaymentDetails) {
        const params = new URLSearchParams({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          amount: eventPrice.toString(),
          orderId: razorpayPaymentDetails.razorpay_order_id,
          paymentId: razorpayPaymentDetails.razorpay_payment_id,
          date: new Date().toISOString(),
        }).toString();
        navigate(`/receipt?${params}`);

        // Trigger email receipt
        await supabase.functions.invoke('send-email-receipt', {
          body: {
            to: formData.email,
            subject: `Receipt for ${eventTitle} Registration`,
            templateData: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              amount: eventPrice.toString(),
              orderId: razorpayPaymentDetails.razorpay_order_id,
              paymentId: razorpayPaymentDetails.razorpay_payment_id,
              date: new Date().toLocaleString(),
              eventTitle,
            },
          },
        });

      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Ensure loading is set to false even if registration fails
    }
  };

  /**
   * Handles form submission and payment processing
   * For paid events: Creates Razorpay order and opens payment modal
   * For free events: Directly creates registration
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (eventPrice > 0) {
        // Step 1: Create registration with pending payment status
        const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        // Step 2: Call backend to create Razorpay order
        console.log("Creating Razorpay order for amount:", eventPrice);
        const { data, error } = await supabase.functions.invoke('create-order', {
          body: { 
            amount: eventPrice * 100, // Convert to paise (smallest unit)
            receipt: ticketNumber
          },
        });

        if (error) {
          console.error("Error creating order:", error);
          throw error;
        }

        const { order_id, currency, amount } = data;
        console.log("Order created successfully:", order_id);

        // Step 3: First create the registration record with order_id
        await createRegistration(undefined, order_id);

        // Step 4: Configure Razorpay checkout options
        const options: RazorpayOptions = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "", // Public Razorpay Key ID from env
          amount: amount.toString(),
          currency: currency,
          name: "Event Registration",
          description: `Registration for ${eventTitle}`,
          order_id: order_id,
          // Handler called after successful payment
          handler: async (response: any) => {
            console.log("Payment successful, verifying...", response);
            try {
              setLoading(true);
              
              // Step 5: Verify payment signature on backend
              const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-payment', {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              });

              if (verificationError) {
                console.error("Verification error:", verificationError);
                throw verificationError;
              }

              // Step 6: Check verification result
              if (verificationData.verified) {
                console.log("Payment verified successfully");
                toast({
                  title: "Payment Successful!",
                  description: "Your payment has been verified and registration is complete.",
                });

                // Navigate to receipt page with payment details
                const params = new URLSearchParams({
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  amount: (amount / 100).toString(), // Convert back to rupees
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  date: new Date().toISOString(),
                }).toString();
                
                onClose();
                navigate(`/receipt?${params}`);

                // Send email receipt (async, don't wait for it)
                supabase.functions.invoke('send-email-receipt', {
                  body: {
                    to: formData.email,
                    subject: `Receipt for ${eventTitle} Registration`,
                    templateData: {
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone,
                      amount: (amount / 100).toString(),
                      orderId: response.razorpay_order_id,
                      paymentId: response.razorpay_payment_id,
                      date: new Date().toLocaleString(),
                      eventTitle,
                    },
                  },
                }).catch(err => console.error("Error sending receipt email:", err));

              } else {
                // Payment verification failed
                console.error("Payment verification failed");
                toast({
                  title: "Payment Verification Failed",
                  description: "There was an issue verifying your payment. Please contact support.",
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error("Error in payment handler:", error);
              toast({
                title: "Error",
                description: "An error occurred while processing your payment. Please contact support.",
                variant: "destructive",
              });
            } finally {
              setLoading(false);
            }
          },
          // Prefill user details in payment form
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          notes: {
            address: "Event Registration",
          },
          theme: {
            color: "#3399CC",
          },
        };

        // Step 7: Initialize and open Razorpay checkout
        const rzp1 = new window.Razorpay(options);
        
        // Handle payment failure
        rzp1.on('payment.failed', function (response: any) {
          console.error("Payment failed:", response.error);
          toast({
            title: "Payment Failed",
            description: response.error.description || "Payment could not be processed.",
            variant: "destructive",
          });
          setLoading(false);
        });
        
        // Open payment modal
        rzp1.open();
        setLoading(false); // Reset loading as payment modal is now open


      } else {
        await createRegistration();
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('customAnswers.')) {
      const questionKey = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customAnswers: {
          ...prev.customAnswers,
          [questionKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>
          {customQuestions.map((question, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`custom-${index}`}>{question} *</Label>
              <Textarea
                id={`custom-${index}`}
                value={formData.customAnswers[`question-${index}`] || ""}
                onChange={(e) => handleInputChange(`customAnswers.question-${index}`, e.target.value)}
                placeholder="Enter your answer"
                required
              />
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading 
                ? "Processing..." 
                : eventPrice > 0 
                  ? `Pay ₹${eventPrice} & Register` 
                  : "Register"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;