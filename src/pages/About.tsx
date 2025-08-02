import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Brain, Target, Users, Shield, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Trust & Reliability",
      description: "We provide only verified, evidence-based medical information from trusted sources."
    },
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Every interaction is designed with empathy and understanding for your health concerns."
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Making quality medical information accessible to everyone, regardless of location or background."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to the highest standards of accuracy and quality in health information."
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      description: "15+ years in internal medicine and health informatics"
    },
    {
      name: "Dr. Michael Chen",
      role: "AI Research Director",
      description: "Expert in machine learning applications in healthcare"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Clinical Advisor",
      description: "Specialist in emergency medicine and patient care"
    },
    {
      name: "Dr. David Kim",
      role: "Data Science Lead",
      description: "PhD in Biomedical Informatics and AI ethics"
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Heart className="h-16 w-16 text-primary" />
              <Brain className="h-8 w-8 text-accent-foreground absolute -top-2 -right-2" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About MediHelp AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionizing healthcare accessibility through artificial intelligence, 
            one question at a time.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At MediHelp AI, we believe that everyone deserves access to accurate, 
                reliable medical information. Our mission is to bridge the gap between 
                complex medical knowledge and everyday health questions using cutting-edge 
                artificial intelligence.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We're not here to replace healthcare professionals – we're here to 
                empower you with information that helps you make better health decisions 
                and communicate more effectively with your healthcare providers.
              </p>
              <div className="flex items-center space-x-4">
                <Target className="h-8 w-8 text-primary" />
                <span className="text-lg font-semibold text-foreground">
                  Empowering informed health decisions worldwide
                </span>
              </div>
            </div>
            <div className="bg-gradient-hero p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-foreground mb-4">Key Principles</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Evidence-based information only</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Clear, understandable language</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Privacy and confidentiality</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Continuous learning and improvement</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do at MediHelp AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center border-border shadow-card-soft">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Our Expert Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Medical professionals and AI experts working together to serve you better
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center border-border shadow-card-soft">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Disclaimer Section */}
        <section className="bg-secondary/50 p-8 rounded-lg">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Important Disclaimer</h3>
            <p className="text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              MediHelp AI provides general health information for educational purposes only. 
              This information is not intended to be a substitute for professional medical advice, 
              diagnosis, or treatment. Always seek the advice of your physician or other qualified 
              health provider with any questions you may have regarding a medical condition. 
              Never disregard professional medical advice or delay in seeking it because of 
              something you have read on this platform.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;