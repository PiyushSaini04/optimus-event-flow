import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Clock,
  Download,
  ArrowLeft,
  Share,
  Upload,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import * as XLSX from 'xlsx';
import ShareAccessModal from '@/components/events/ShareAccessModal';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  user_id: string | null;
  ticket_code: string;
  profiles?: {
    organisation?: string;
  };
}

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    name: string;
    email: string;
    checked_in_at?: string;
  };
}

const CheckInDashboard = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked-in' | 'pending'>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  const qrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const SCAN_COOLDOWN_MS = 2000;

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setAccessToken(token);
      checkTokenAccess(token);
    } else if (user && eventId) {
      checkUserAccess();
    }
  }, [user, eventId, searchParams]);

  useEffect(() => {
    if (hasAccess && eventId) {
      fetchEventDetails();
      fetchRegistrations();
      setupScanner();
    }

    return () => {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear().catch(console.error);
      }
    };
  }, [hasAccess, eventId]);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchQuery, statusFilter]);

  const checkTokenAccess = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('event_dashboard_access')
        .select('event_id, expires_at')
        .eq('access_token', token)
        .eq('event_id', eventId)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid Access",
          description: "The access token is invalid or expired.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Check if token is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: "Access Expired",
          description: "This access link has expired.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setHasAccess(true);
    } catch (error) {
      console.error('Error checking token access:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkUserAccess = async () => {
    if (!user || !eventId) return;

    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, title, created_by')
        .eq('id', eventId)
        .single();

      if (eventError) {
        toast({
          title: "Event not found",
          description: "The event you're trying to access doesn't exist.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      const isEventCreator = eventData.created_by === user.id;
      const isAdmin = userRole === 'admin' || userRole === 'organiser';

      if (!isEventCreator && !isAdmin) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this dashboard.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setHasAccess(true);
    } catch (error) {
      console.error('Error checking user access:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_date, location, organizer_name')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          name,
          email,
          phone,
          checked_in,
          checked_in_at,
          created_at,
          user_id,
          ticket_code,
          profiles(organisation)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Failed to load registrations.",
        variant: "destructive",
      });
    }
  };

  const filterRegistrations = () => {
    let filtered = [...registrations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reg =>
        reg.name.toLowerCase().includes(query) ||
        reg.email.toLowerCase().includes(query) ||
        reg.phone?.toLowerCase().includes(query)
      );
    }

    if (statusFilter === 'checked-in') {
      filtered = filtered.filter(reg => reg.checked_in);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(reg => !reg.checked_in);
    }

    setFilteredRegistrations(filtered);
  };

  const setupScanner = () => {
    if (qrCodeScannerRef.current) {
      qrCodeScannerRef.current.clear().catch(console.error);
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    qrCodeScannerRef.current = new Html5QrcodeScanner(
      "qr-code-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        disableFlip: false,
        aspectRatio: 1.0,
        facingMode: isMobile ? "environment" : "user", // Back camera on mobile
        supportedScanTypes: [0, 1] // QR and barcode
      },
      false
    );

    qrCodeScannerRef.current.render(onScanSuccess, onScanError);
    setScanning(true);
  };

  const onScanSuccess = async (decodedText: string) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < SCAN_COOLDOWN_MS) {
      return;
    }
    lastScanTimeRef.current = now;

    try {
      let ticketData: any;
      
      try {
        ticketData = JSON.parse(decodedText);
      } catch {
        setScanResult({
          success: false,
          message: "Invalid QR code format",
        });
        return;
      }

      // Verify ticket data structure
      if (!ticketData.user_id || !ticketData.event_id) {
        setScanResult({
          success: false,
          message: "Invalid ticket data",
        });
        return;
      }

      // Verify event ID matches
      if (ticketData.event_id !== eventId) {
        setScanResult({
          success: false,
          message: "Ticket is for a different event",
        });
        return;
      }

      // Call check-in function
      const { data, error } = await supabase.rpc('check_in_attendee', {
        p_event_id: eventId,
        p_user_id: ticketData.user_id,
        p_scanned_by: user?.id || null
      });

      if (error) throw error;

      setScanResult(data);

      if (data.success) {
        // Refresh registrations
        fetchRegistrations();
        toast({
          title: "✅ Check-in successful",
          description: `${data.data.name} has been checked in.`,
        });
      } else {
        toast({
          title: data.message.includes('already') ? "⚠️ Already checked in" : "❌ Invalid ticket",
          description: data.message,
          variant: data.message.includes('already') ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      setScanResult({
        success: false,
        message: "Error processing ticket",
      });
      toast({
        title: "Error",
        description: "Failed to process ticket scan.",
        variant: "destructive",
      });
    }
  };

  const onScanError = (errorMessage: string) => {
    console.debug('QR scan error:', errorMessage);
  };

  const downloadRegistrationsExcel = () => {
    try {
      const exportData = filteredRegistrations.map(reg => ({
        Name: reg.name,
        Email: reg.email,
        Phone: reg.phone || 'N/A',
        Organisation: reg.profiles?.organisation || 'N/A',
        'Registration Date': new Date(reg.created_at).toLocaleDateString(),
        'Check-in Status': reg.checked_in ? 'Checked In' : 'Pending',
        'Check-in Time': reg.checked_in_at 
          ? new Date(reg.checked_in_at).toLocaleString()
          : 'N/A',
        'Ticket Code': reg.ticket_code
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Event Registrations');
      XLSX.writeFile(workbook, `${event?.title?.replace(/[^a-z0-9]/gi, '_') || 'event'}_checkin_dashboard.xlsx`);

      toast({
        title: "Download complete",
        description: "Registration data exported successfully.",
      });
    } catch (error) {
      console.error('Error downloading registrations:', error);
      toast({
        title: "Download failed",
        description: "Failed to export registration data.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (registration: Registration) => {
    if (registration.checked_in) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Checked In
        </Badge>
      );
    }
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen pt-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this dashboard.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const checkedInCount = registrations.filter(r => r.checked_in).length;
  const totalRegistrations = registrations.length;

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Check-in Dashboard</h1>
              <p className="text-muted-foreground">{event?.title}</p>
            </div>
          </div>
          
          {!accessToken && (
            <Button
              onClick={() => setShowShareModal(true)}
              variant="outline"
            >
              <Share className="h-4 w-4 mr-2" />
              Share Access
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Registered</p>
                  <p className="text-2xl font-bold">{totalRegistrations}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Checked In</p>
                  <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in Rate</p>
                  <p className="text-2xl font-bold text-primary">
                    {totalRegistrations > 0 
                      ? Math.round((checkedInCount / totalRegistrations) * 100)
                      : 0}%
                  </p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scanner Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scanner */}
              <div>
                <div id="qr-code-reader" className="w-full max-w-md mx-auto"></div>
                
                {/* Upload option for desktop */}
                <div className="hidden md:block mt-4">
                  <Label htmlFor="qr-upload" className="cursor-pointer">
                    <Button asChild variant="outline" className="w-full">
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload QR Code Image
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="qr-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && qrCodeScannerRef.current) {
                        // Html5QrcodeScanner doesn't support file upload directly
                        // You would need to implement this separately
                        toast({
                          title: "Feature coming soon",
                          description: "Image upload scanning will be available soon.",
                        });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Scan Result */}
              <div>
                {scanResult && (
                  <Alert className={`${scanResult.success ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
                    <div className="flex items-center gap-3">
                      {scanResult.success ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${scanResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                          {scanResult.message}
                        </p>
                        {scanResult.data && (
                          <div className="mt-2 space-y-1 text-sm">
                            <p><strong>Name:</strong> {scanResult.data.name}</p>
                            <p><strong>Email:</strong> {scanResult.data.email}</p>
                            {scanResult.data.checked_in_at && (
                              <p><strong>Checked in at:</strong> {new Date(scanResult.data.checked_in_at).toLocaleString()}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Alert>
                )}
                
                {!scanResult && (
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Point the camera at a QR code to scan</p>
                    <p className="text-sm mt-2">Make sure the QR code is well-lit and clearly visible</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Event Registrations</CardTitle>
            <Button onClick={downloadRegistrationsExcel}>
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All ({totalRegistrations})
                </Button>
                <Button
                  variant={statusFilter === 'checked-in' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('checked-in')}
                >
                  Checked In ({checkedInCount})
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending ({totalRegistrations - checkedInCount})
                </Button>
              </div>
            </div>

            {/* Registrations List */}
            <div className="space-y-3">
              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'No registrations match your filters.' 
                      : 'No registrations found for this event.'}
                  </p>
                </div>
              ) : (
                filteredRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{registration.name}</h4>
                        {getStatusBadge(registration)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {registration.email}
                        </div>
                        {registration.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {registration.phone}
                          </div>
                        )}
                        {registration.profiles?.organisation && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {registration.profiles.organisation}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Registered: {new Date(registration.created_at).toLocaleDateString()}</p>
                      {registration.checked_in_at && (
                        <p>Checked in: {new Date(registration.checked_in_at).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Share Access Modal */}
        <ShareAccessModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          eventId={eventId!}
          eventTitle={event?.title || ''}
        />
      </div>
    </div>
  );
};

export default CheckInDashboard;