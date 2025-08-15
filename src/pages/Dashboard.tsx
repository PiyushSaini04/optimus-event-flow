import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Users, Calendar, TrendingUp, Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Mock data
  const organizationProfile = {
    name: "Optimus Tech Club",
    email: "contact@optimustech.edu",
    phone: "+91 98765 43210",
    logo: "/placeholder.svg",
    description: "Leading technical club fostering innovation and technology education",
    establishedYear: "2020"
  };

  const stats = [
    { label: "Total Events", value: "12", icon: Calendar, trend: "+3 this month" },
    { label: "Total Registrations", value: "847", icon: Users, trend: "+125 this month" },
    { label: "Upcoming Events", value: "4", icon: TrendingUp, trend: "Next 30 days" },
    { label: "Revenue", value: "₹45,600", icon: TrendingUp, trend: "+12% this month" },
  ];

  const myEvents = [
    {
      id: 1,
      title: "AI/ML Workshop 2024",
      date: "Sep 15, 2024",
      time: "10:00 AM",
      location: "Computer Lab 1",
      category: "Workshop",
      participants: 50,
      maxParticipants: 50,
      status: "Active",
      image: "/placeholder.svg",
      revenue: "₹0",
      registrations: 50
    },
    {
      id: 2,
      title: "Tech Talk: Future of Robotics",
      date: "Sep 28, 2024",
      time: "2:00 PM",
      location: "Main Auditorium",
      category: "Tech Talk",
      participants: 120,
      maxParticipants: 200,
      status: "Active",
      image: "/placeholder.svg",
      revenue: "₹0",
      registrations: 120
    },
    {
      id: 3,
      title: "Hackathon 2024: Code for Change",
      date: "Oct 15, 2024",
      time: "9:00 AM",
      location: "Innovation Center",
      category: "Hackathon",
      participants: 89,
      maxParticipants: 100,
      status: "Ended",
      image: "/placeholder.svg",
      revenue: "₹44,500",
      registrations: 89
    },
    {
      id: 4,
      title: "Cybersecurity Bootcamp",
      date: "Nov 5, 2024",
      time: "10:00 AM",
      location: "Security Lab",
      category: "Bootcamp",
      participants: 35,
      maxParticipants: 40,
      status: "Active",
      image: "/placeholder.svg",
      revenue: "₹52,500",
      registrations: 35
    }
  ];

  const notifications = [
    { id: 1, message: "New registration for AI/ML Workshop", time: "2 hours ago", type: "registration" },
    { id: 2, message: "Hackathon 2024 has ended successfully", time: "1 day ago", type: "event" },
    { id: 3, message: "Payment received for Cybersecurity Bootcamp", time: "2 days ago", type: "payment" },
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Workshop": "bg-primary/20 text-primary",
      "Tech Talk": "bg-success/20 text-success",
      "Hackathon": "bg-warning/20 text-warning",
      "Bootcamp": "bg-danger/20 text-danger"
    };
    return colors[category] || "bg-muted/20 text-muted-foreground";
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      "Active": "bg-success/20 text-success border-success/30",
      "Ended": "bg-muted/20 text-muted-foreground border-muted/30",
      "Draft": "bg-warning/20 text-warning border-warning/30"
    };
    return colors[status] || "bg-muted/20 text-muted-foreground border-muted/30";
  };

  const handleDeleteEvent = (eventId: number) => {
    toast({
      title: "Event Deleted",
      description: "The event has been successfully deleted.",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-glow">Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and track performance</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="btn-outline-hero">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              onClick={() => navigate('/create-event')}
              className="btn-hero"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Organization Profile */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage src={organizationProfile.logo} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">OT</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{organizationProfile.name}</h2>
                    <p className="text-muted-foreground mb-3">{organizationProfile.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>📧 {organizationProfile.email}</span>
                      <span>📞 {organizationProfile.phone}</span>
                      <span>📅 Est. {organizationProfile.establishedYear}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="btn-outline-hero">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="card-hover"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-primary">{stat.value}</p>
                        <p className="text-xs text-success">{stat.trend}</p>
                      </div>
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Events */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="card-modern">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    My Events ({myEvents.length})
                  </CardTitle>
                  <Button 
                    onClick={() => navigate('/create-event')}
                    className="btn-hero"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-background/50 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-24 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{event.title}</h3>
                            <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>📅 {event.date} at {event.time}</div>
                            <div>📍 {event.location}</div>
                            <div>👥 {event.participants}/{event.maxParticipants} participants</div>
                            <div>💰 Revenue: {event.revenue}</div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                                <Users className="h-4 w-4 mr-1" />
                                Registrations
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Event Registrations</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-primary">{selectedEvent?.registrations}</div>
                                  <div className="text-muted-foreground">Total Registrations</div>
                                </div>
                                <div className="bg-background/50 rounded-lg p-4">
                                  <p className="text-sm text-muted-foreground">
                                    Registration details and participant list would be displayed here.
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-danger/30 text-danger hover:bg-danger/10">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{event.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="bg-danger hover:bg-danger/90 text-white"
                                >
                                  Delete Event
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Notifications Panel */}
            <motion.div variants={itemVariants}>
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-background/50 rounded-lg p-3 border border-border/30"
                    >
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </motion.div>
                  ))}
                  
                  <Button variant="outline" className="w-full mt-4 btn-outline-hero">
                    View All Notifications
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;