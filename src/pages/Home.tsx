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
  Calendar,
  Award,
  Code,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-bg.jpg";

const Home = () => {
  const [typedText, setTypedText] = useState("");
  const fullText = "OPTIMUS Technical Club";

  // Typing animation for hero
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 120);
    return () => clearInterval(timer);
  }, []);

  // ✅ Stats section
  const stats = [
    { number: "500+", label: "Active Members", icon: Users },
    { number: "50+", label: "Events Organized", icon: Calendar },
    { number: "25+", label: "Projects Launched", icon: Rocket },
    { number: "15+", label: "Awards Won", icon: Award },
  ];

  // ✅ Features section
  const features = [
    {
      icon: Code,
      title: "Technical Workshops",
      description: "Hands-on learning with cutting-edge technologies",
      color: "text-primary",
    },
    {
      icon: Users,
      title: "Collaborative Projects",
      description: "Build amazing projects with like-minded enthusiasts",
      color: "text-green-500",
    },
    {
      icon: Rocket,
      title: "Innovation Hub",
      description: "Turn your ideas into reality with our ecosystem",
      color: "text-yellow-500",
    },
    {
      icon: Award,
      title: "Competitions",
      description: "Participate and shine in national and global events",
      color: "text-purple-500",
    },
  ];

  // ✅ Mission / Vision / Values section
  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We encourage creative thinking and out-of-the-box solutions.",
      color: "text-yellow-500",
    },
    {
      icon: Users2,
      title: "Collaboration",
      description: "Teamwork is at the heart of everything we do.",
      color: "text-green-500",
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description: "We build with responsibility for a better future.",
      color: "text-teal-500",
    },
    {
      icon: Globe,
      title: "Impact",
      description: "Creating solutions that make a difference in society.",
      color: "text-blue-500",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-white"
        >
          <h1 className="text-5xl md:text-7xl font-bold">{typedText}</h1>
          <p className="mt-4 text-xl md:text-2xl">
            Empowering Students to Innovate, Build, and Lead
          </p>
          <Link to="/events">
            <Button className="mt-6 px-6 py-3 text-lg rounded-2xl flex items-center gap-2">
              Explore Events <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
            >
              <stat.icon className="mx-auto mb-3 w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">{stat.number}</h3>
              <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="p-6 text-center rounded-2xl shadow-lg">
                  <feature.icon
                    className={`mx-auto mb-4 w-10 h-10 ${feature.color}`}
                  />
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
              >
                <value.icon className={`mx-auto mb-3 w-10 h-10 ${value.color}`} />
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Gallery</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.img
              src="https://picsum.photos/600/400?1"
              alt="Event 1"
              className="rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05 }}
            />
            <motion.img
              src="https://picsum.photos/600/400?2"
              alt="Event 2"
              className="rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05 }}
            />
            <motion.img
              src="https://picsum.photos/600/400?3"
              alt="Event 3"
              className="rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05 }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
