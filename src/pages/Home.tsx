

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Calendar,
  Users,
  CreditCard,
  Star,
  ArrowRight,
  CheckCircle2,
  Ticket,
  Globe,
  ChevronLeft,
  ChevronRight,
  Play,
  TrendingUp,
  Shield,
} from "lucide-react";

interface ValueProp {
  icon: React.ComponentType<{ className?: string; }>;
  title: string;
  desc: string;
  features: string[];
  color: string;
  image: string;
}
// Define TypeScript interfaces for type safety
interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  cta: string;
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

interface Stat {
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ValueProp {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  gradient: string;
}

interface FAQ {
  q: string;
  a: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const heroSlides: HeroSlide[] = [
    {
      title: "OPTIMUS Events",
      subtitle: "Discover. Book. Organize. Pay.",
      description: "All in one seamless platform built for modern events.",
      cta: "Get Started"
    },
    {
      title: "Host Like a Pro",
      subtitle: "Organize. Manage. Succeed.",
      description: "Create unforgettable events with our comprehensive management tools.",
      cta: "Start Hosting"
    },
    {
      title: "Connect Globally",
      subtitle: "Network. Learn. Grow.",
      description: "Join millions discovering amazing events worldwide.",
      cta: "Explore Events"
    }
  ];

  const testimonials: Testimonial[] = [
    { name: "Rahul S.", role: "Music Enthusiast", text: "Booking my concert tickets was a breeze with OPTIMUS! The interface is incredibly smooth." },
    { name: "Ananya M.", role: "Event Organizer", text: "Helped me organize my college fest without stress. The management tools are phenomenal." },
    { name: "Karan P.", role: "Business Owner", text: "Finally, an all-in-one event platform that works. Revenue tracking is amazing!" },
    { name: "Priya K.", role: "Conference Attendee", text: "Found the perfect networking event. The recommendation engine is spot-on." }
  ];

  const stats: Stat[] = [
    { number: "50K+", label: "Events Hosted", icon: Calendar },
    { number: "2M+", label: "Happy Users", icon: Users },
    { number: "98%", label: "Success Rate", icon: TrendingUp },
    { number: "24/7", label: "Support", icon: Shield }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => {
      clearInterval(slideInterval);
      clearInterval(testimonialInterval);
    };
  }, [heroSlides.length, testimonials.length]);

  // CSS styles as a string for dynamic injection
  const customStyles: string = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-50px); }
    }
    
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out forwards;
    }
    
    .animate-slide-in-left {
      animation: slideInLeft 0.6s ease-out forwards;
    }
    
    .animate-slide-in-right {
      animation: slideInRight 0.6s ease-out forwards;
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    .animate-gradient {
      background: linear-gradient(-45deg, #ffffff, #93c5fd, #dbeafe, #ffffff);
      background-size: 400% 400%;
      animation: gradientShift 3s ease infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .dark .animate-gradient {
      background: linear-gradient(-45deg, #ffffff, #93c5fd, #dbeafe, #ffffff);
      background-size: 400% 400%;
      animation: gradientShift 3s ease infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .animate-gradient-light {
      background: linear-gradient(-45deg, #1e40af, #3b82f6, #60a5fa, #1e40af);
      background-size: 400% 400%;
      animation: gradientShift 3s ease infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hover-lift {
      transition: all 0.3s ease;
    }
    
    .hover-lift:hover {
      transform: translateY(-8px) scale(1.02);
    }
    
    .glass-effect {
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .glow-effect {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    
    .glow-effect-light {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
    }
    
    .slide-transition {
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;

  useEffect(() => {
    const styleElement: HTMLStyleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white overflow-x-hidden">

      {/* ENHANCED HERO SECTION WITH CAROUSEL */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-50 dark:from-black dark:via-zinc-900 dark:to-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />

        {/* Floating particles effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-30 dark:opacity-20 animate-float"
              style={{
                left: `${(i % 5) * 20}%`, // Static positioning for consistent layout
                top: `${Math.floor(i / 5) * 25}%`, // Static positioning for consistent layout
                animationDelay: `${i * 0.1}s`, // Staggered animation for variety
                animationDuration: `${2 + i * 0.1}s` // Varied duration for natural effect
              }}
            />
          ))}
        </div>

        <div className="relative z-10 slide-transition max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 dark:animate-gradient">
            <span className="animate-gradient-light dark:animate-gradient">
              {heroSlides[currentSlide].title.split(' ')[0]}
            </span>{' '}
            <span className="text-blue-600 dark:text-blue-500">
              {heroSlides[currentSlide].title.split(' ')[1]}
            </span>
          </h1>

          <p className="text-lg sm:text-xl font-medium mb-4 text-blue-700 dark:text-blue-200 animate-fade-in">
            {heroSlides[currentSlide].subtitle}
          </p>

          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 text-gray-600 dark:text-gray-300 animate-fade-in">
            {heroSlides[currentSlide].description}
          </p>

        </div>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10 animate-fade-in-up mb-8">
          <Button
            size="lg"
            onClick={() => navigate('/create-event')}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 text-white hover-lift text-lg sm:text-xl font-bold glow-effect-light dark:glow-effect shadow-lg px-6 py-3"
          >
            Want to Host?
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/event-hub')}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:blue-500 hover-lift text-white text-lg sm:text-xl font-bold glow-effect-light dark:glow-effect shadow-lg px-6 py-3"
          >
            Want to Attend?
          </Button>
        </div>

        <div className="flex justify-center relative z-10 animate-fade-in-up">
          <Button
            size="lg"
            onClick={() => navigate('/join-us')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover-lift glow-effect-light dark:glow-effect shadow-lg px-6 py-3"
          >
            {heroSlides[currentSlide].cta} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-2 mt-8 relative z-10">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover-lift ${idx === currentSlide ? 'bg-blue-600 dark:bg-blue-500 scale-125 glow-effect-light dark:glow-effect' : 'bg-gray-400 dark:bg-gray-600 hover:bg-gray-500'}`}
            />
          ))}
        </div>
      </section>

      {/* VALUE PROPS WITH HOVER EFFECTS */}
      
      <section className="py-24 px-6 bg-white dark:bg-black">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent animate-fade-in">
          Everything You Need in One Place
        </h2>
        <div className="max-w-7xl mx-auto space-y-12">
          {([
            {
              icon: Globe,
              title: "Discover Events",
              desc: "Find trending events near you or worldwide with our advanced search filters.",
              features: ["Location-based search", "Category filtering", "Real-time updates", "Personalized recommendations"],
              color: "from-green-500 to-emerald-600",
              image: "https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg"
            },
            {
              icon: Ticket,
              title: "Book Tickets",
              desc: "Seamless ticket booking with instant confirmations and secure payment processing.",
              features: ["Instant confirmations", "QR code tickets", "Group bookings", "Mobile wallet integration"],
              color: "from-purple-500 to-violet-600",
              image: "https://images.pexels.com/photos/17527817/pexels-photo-17527817.jpeg"
            },
            {
              icon: Users,
              title: "Organize Events",
              desc: "Complete event management tools to handle attendees, schedules and vendors efficiently.",
              features: ["Attendee management", "Vendor coordination", "Schedule planning", "Analytics dashboard"],
              color: "from-orange-500 to-red-600",
              image: "https://images.pexels.com/photos/4050302/pexels-photo-4050302.jpeg"
            },
            {
              icon: CreditCard,
              title: "Secure Payments",
              desc: "Multiple payment options with bank-level security and instant transaction processing.",
              features: ["Multiple payment modes", "Fraud protection", "Instant refunds", "Transaction history"],
              color: "from-blue-500 to-cyan-600",
              image: "https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg"
            },
          ] as ValueProp[]).map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col md:flex-row ${idx % 2 === 0 ? 'md:justify-start' : 'md:justify-end'} animate-fade-in-up`}
              style={{ animationDelay: `${idx * 0.15}s` }}
              onMouseEnter={() => setHoveredCard(`value-${idx}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full md:w-4/5 lg:w-3/4 xl:w-4/5 overflow-hidden shadow-md shadow-gray-300 dark:shadow-gray-500 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-400/50 dark:hover:shadow-blue-500/50 hover:scale-105 hover:-translate-y-2 group">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative z-10 flex flex-col md:flex-row h-full min-h-[280px]">
                  <div className="w-full md:w-1/3 flex">
                    <img src={item.image} alt={item.title} className="w-full h-48 md:h-full object-cover flex-1" />
                  </div>
                  <div className="w-full md:w-2/3 p-8 flex flex-col">
                    <CardHeader className="flex-shrink-0">
                      <div className={`w-14 h-14 mx-auto md:mx-0 mb-4 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center transition-all duration-300 ${hoveredCard === `value-${idx}` ? 'scale-110 animate-float' : ''}`}>
                        <item.icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-bold text-center md:text-left text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center md:text-left flex-grow">
                      <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 mb-4">{item.desc}</p>
                      <ul className="space-y-2">
                        {item.features.map((feature, featureIdx) => (
                          <li key={featureIdx} className="flex items-center text-sm md:text-base text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} mr-3 flex-shrink-0`}></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES WITH STAGGER ANIMATION */}
      <section className="py-20 px-2 bg-gradient-to-b from-gray-100 to-white dark:from-zinc-950 dark:to-black">
        <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in text-gray-900 dark:text-white">
          Powerful Features
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {([
            { icon: Calendar, title: "Smart Scheduling", desc: "AI-powered event planning & reminders.", gradient: "from-blue-500 to-purple-600" },
            { icon: Users, title: "Networking", desc: "Connect with like-minded professionals.", gradient: "from-green-500 to-blue-600" },
            { icon: Star, title: "Ratings & Reviews", desc: "Get insights before you book.", gradient: "from-yellow-500 to-orange-600" },
            { icon: CreditCard, title: "One-Click Payments", desc: "Fast & secure checkout experience.", gradient: "from-purple-500 to-pink-600" },
            { icon: Globe, title: "Global Reach", desc: "Host & attend events anywhere.", gradient: "from-teal-500 to-green-600" },
            { icon: CheckCircle2, title: "Verified Hosts", desc: "Safe, reliable, and transparent.", gradient: "from-red-500 to-orange-600" },
          ] as Feature[]).map((item, idx) => (
            <div
              key={idx}
              className="group hover-lift animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
              onMouseEnter={() => setHoveredCard(`feature-${idx}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-2xl h-full relative overflow-hidden group-hover:border-blue-400 dark:group-hover:border-blue-500/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-400/20 dark:group-hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} p-3 mb-4 transition-all duration-300 ${hoveredCard === `feature-${idx}` ? 'scale-110 animate-float' : ''
                    }`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 text-2xl font-bold transition-colors duration-300">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">{item.desc}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* ENHANCED TESTIMONIALS CAROUSEL */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-zinc-950">
        <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in text-gray-900 dark:text-white">
          What People Say
        </h2>

        <div className="max-w-4xl mx-auto relative">
          <div className="text-center slide-transition">
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 mx-auto max-w-2xl relative overflow-hidden hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5" />
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonials[currentTestimonial].text}"</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-float">
                    <span className="text-white font-bold">
                      {testimonials[currentTestimonial].name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonials[currentTestimonial].name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-500">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Testimonial Navigation */}
          <div className="flex justify-center items-center mt-8 gap-4">
            <button
              onClick={() => setCurrentTestimonial((prev) => prev === 0 ? testimonials.length - 1 : prev - 1)}
              className="p-2 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-all duration-200 hover-lift hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-white" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`h-2 rounded-full transition-all duration-300 hover-lift ${idx === currentTestimonial ? 'bg-blue-600 dark:bg-blue-500 w-6 glow-effect-light dark:glow-effect' : 'bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 w-2'
                    }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="p-2 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-all duration-200 hover-lift hover:scale-110"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-white" />
            </button>
          </div>
        </div>
      </section>
      
      {/* ENHANCED FINAL CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-blue-800 to-blue-600 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to power your events with{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
              OPTIMUS
            </span>
            ?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of successful event organizers and attendees worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/join-us')}
              className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-zinc-900 hover-lift glow-effect-light dark:glow-effect shadow-lg font-semibold"
            >
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

          </div>
        </div>
      </section>

      {/* ENHANCED FAQ */}
      <section className="py-20 px-6 bg-white dark:bg-black max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="space-y-4">
          {([
            { q: "Is OPTIMUS free to use?", a: "Yes, discovering and browsing events is free. Organizers pay only for premium features." },
            { q: "How do I book tickets?", a: "Select your event, choose tickets, and pay securely in just one click." },
            { q: "Can I host my own events?", a: "Absolutely! Sign up as an organizer and start creating events instantly." },
            { q: "What payment methods do you accept?", a: "We accept all major credit cards, UPI, net banking, and digital wallets." },
            { q: "Is my data secure?", a: "Yes, we use enterprise-grade security and encryption to protect all user data." }
          ] as FAQ[]).map((item, idx) => (
            <div
              key={idx}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <AccordionItem value={`item-${idx}`} className="border border-gray-200 dark:border-zinc-800 rounded-lg px-6 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-300 hover-lift">
                <AccordionTrigger className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-300">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </section>

      
      
    </div>
  );
}
