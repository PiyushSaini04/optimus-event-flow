import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, Award, Code, Rocket, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-bg.jpg";

const Home = () => {
  const [typedText, setTypedText] = useState("");
  const fullText = "Optimus Technical Club";
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Code,
      title: "Technical Workshops",
      description: "Hands-on learning experiences with cutting-edge technologies",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Collaborative Projects",
      description: "Build amazing projects with like-minded tech enthusiasts",
      color: "text-success"
    },
    {
      icon: Rocket,
      title: "Innovation Hub",
      description: "Transform your ideas into reality with our startup ecosystem",
      color: "text-warning"
    },
    {
      icon: Award,
      title: "Competitions",
      description: "Participate in hackathons and coding challenges",
      color: "text-danger"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Members", icon: Users },
    { number: "50+", label: "Events Organized", icon: Calendar },
    { number: "25+", label: "Projects Launched", icon: Rocket },
    { number: "15+", label: "Awards Won", icon: Award }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(13, 17, 23, 0.7), rgba(13, 17, 23, 0.7)), url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="space-y-6 fade-up">
            <h1 className="text-5xl md:text-7xl font-bold">
              Welcome to{" "}
              <span className="text-primary text-glow typewriter block mt-2">
                {typedText}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed fade-in-delay">
              Discover, participate, and organize cutting-edge technical events. 
              Join the premier university tech club community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 fade-in-delay">
              <Button asChild className="btn-hero text-lg px-8 py-4">
                <Link to="/events">
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="btn-outline-hero text-lg px-8 py-4">
                <Link to="/join">Join Our Community</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/3 right-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse delay-1000" />
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What We <span className="text-primary text-glow">Do</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're dedicated to fostering innovation, creativity, and technical excellence 
              through hands-on experiences and collaborative learning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="card-hover fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mb-4 mx-auto">
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-up">
            <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-primary text-glow">Innovate</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of students who are already building the future. 
              Your next breakthrough starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-hero text-lg px-8 py-4">
                <Link to="/join">
                  Join Optimus Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="btn-outline-hero text-lg px-8 py-4">
                <Link to="/events">Browse Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;