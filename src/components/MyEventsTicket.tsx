import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DigitalTicket from './DigitalTicket';
import { useToast } from '@/hooks/use-toast';

interface MyEventsTicketProps {
  eventId: string;
  userId: string;
  eventTitle: string;
}

const MyEventsTicket = ({ eventId, userId, eventTitle }: MyEventsTicketProps) => {
  const { toast } = useToast();
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('digital_tickets')
        .select(`
          *,
          registration:event_registrations(
            id,
            name,
            email,
            registration_number,
            event:events(
              title,
              start_date,
              location
            )
          )
        `)
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (ticketError) {
        if (ticketError.code === 'PGRST116') {
          toast({
            title: "No Ticket Found",
            description: "You don't have a ticket for this event yet.",
            variant: "destructive",
          });
          return;
        }
        throw ticketError;
      }

      setTicketData(ticketData);
      setShowTicket(true);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast({
        title: "Error",
        description: "Failed to load your ticket.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ticketData) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={fetchTicket}
        disabled={loading}
      >
        <Ticket className="h-4 w-4 mr-2" />
        {loading ? "Loading..." : "View Ticket"}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTicket(true)}
      >
        <Ticket className="h-4 w-4 mr-2" />
        View Ticket
      </Button>

      <Dialog open={showTicket} onOpenChange={setShowTicket}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Your Digital Ticket</DialogTitle>
          </DialogHeader>
          <DigitalTicket
            registration={ticketData.registration}
            ticket={ticketData}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyEventsTicket;