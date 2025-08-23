<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, Award, Code, Rocket, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-bg.jpg";

const Home = () => {
  const [typedText, setTypedText] = useState("");
  const fullText = "Optimus Technical Club";
  
=======
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Trophy,
  Lightbulb,
  Users2,
  Rocket,
  Leaf,
  Globe,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  // typing animation for OPTIMUS
  const [typedText, setTypedText] = useState("");
  const fullText = "OPTIMUS";

>>>>>>> 0db5559 (Updated homepage with new sections and animations)
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
<<<<<<< HEAD
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
=======
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Pushing boundaries and creating new solutions",
    },
    {
      icon: Users2,
      title: "Teamwork",
      description: "Collaborating to achieve common goals",
    },
    {
      icon: Trophy,
      title: "Excellence",
      description: "Striving for the highest standards",
    },
    {
      icon: Leaf,
      title: "Growth Mindset",
      description: "Continuous learning and development",
    },
    {
      icon: Globe,
      title: "Community Impact",
      description: "Making a positive difference together",
    },
    {
      icon: Rocket,
      title: "Leadership",
      description: "Inspiring and guiding others to success",
    },
  ];

  // Gallery images
  const gallery = [
    "/gallery/img1.jpg",
    "/gallery/img2.jpg",
    "/gallery/img3.jpg",
    "/gallery/img4.jpg",
    "/gallery/img5.jpg",
  ];

  // Gallery state
  const [current, setCurrent] = useState(0);

  // Autoplay effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % gallery.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [gallery.length]);

  return (
    <div className="bg-[#0B0F19] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-28">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Welcome To{" "}
            <span className="block text-primary border-l-4 pl-2 mt-2">
              {typedText}
            </span>
          </h1>
          <p className="text-lg text-gray-400">
            A vibrant community empowering creativity, leadership, and
            collaboration to drive innovation and meaningful change.
          </p>
          <div className="flex gap-4 mt-6">
            <Button className="px-6 py-3 text-lg">LET'S CONNECT</Button>
            <Button variant="outline" className="px-6 py-3 text-lg">
              <Link to="/events">EXPLORE EVENTS</Link>
            </Button>
          </div>
        </motion.div>

        {/* Placeholder 3D Model / Image */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="mt-12 md:mt-0"
        >
          <img
            src="/assets/3d-shape.png"
            alt="3D Shape"
            className="w-80 md:w-[400px]"
          />
        </motion.div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 px-6 md:px-20">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          What We <span className="text-primary border-b-4 border-primary">Do</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-[#111827] border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl">◎ Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400 leading-relaxed">
                At Optimus, we're dedicated to creating a dynamic space where
                innovation thrives. Our mission is to empower students through
                hands-on learning, collaborative projects, and real-world
                challenges. We believe in nurturing talent and providing the
                tools needed to turn ideas into impactful solutions.
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-[#111827] border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl">◎ Our Vision</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400 leading-relaxed">
                We envision a future where every student has the opportunity to
                develop their technical skills and leadership abilities. Our goal
                is to build a community that not only learns together but also
                creates lasting impact through technology and innovation.
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 px-6 md:px-20 bg-[#0F172A]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[#111827] border border-primary/20 text-center hover:shadow-lg hover:shadow-primary/30 transition">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <value.icon className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Gall <span className="text-primary border-b-4 border-primary">|</span>
        </h2>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={gallery[current]}
              alt={`Gallery ${current + 1}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              className="w-full rounded-lg shadow-lg border border-gray-700 object-cover h-[400px]"
            />
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center mt-6 gap-3">
            {gallery.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full ${
                  current === idx ? "bg-primary" : "bg-gray-500"
                }`}
              />
            ))}
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
          </div>
        </div>
      </section>
    </div>
  );
};

<<<<<<< HEAD
export default Home;
=======
export default Home;
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
