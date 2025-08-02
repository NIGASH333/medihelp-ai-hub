import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Brain, Heart, Shield, Users, Clock, Award } from "lucide-react";
import medicalHero from "@/assets/medical-hero.jpg";

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Advanced artificial intelligence to provide accurate medical information and health guidance."
    },
    {
      icon: Shield,
      title: "Trusted Information",
      description: "Reliable medical data sourced from verified healthcare professionals and medical databases."
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Get instant access to medical information whenever you need it, day or night."
    },
    {
      icon: Users,
      title: "Expert Network",
      description: "Connected to a network of healthcare professionals and medical experts worldwide."
    }
  ];

  const stats = [
    { number: "100K+", label: "Users Helped" },
    { number: "50+", label: "Medical Specialties" },
    { number: "24/7", label: "Support Available" },
    { number: "99.9%", label: "Accuracy Rate" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Your Trusted
                <span className="text-primary"> AI Medical</span>
                <br />Assistant
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Get instant, reliable medical information powered by advanced AI. 
                Make informed health decisions with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-3">
                  <Link to="/ask-ai">Ask a Medical Question</Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="text-lg px-8 py-3">
                  <Link to="/services">Learn More</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                * Always consult healthcare professionals for medical diagnosis and treatment
              </p>
            </div>
            <div className="relative">
              <img 
                src={medicalHero} 
                alt="Medical AI Technology" 
                className="w-full h-auto rounded-lg shadow-medical"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose MediHelp AI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of medical information with our advanced AI technology 
              designed to provide accurate, reliable, and accessible healthcare guidance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center border-border shadow-card-soft hover:shadow-medical transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Heart className="h-16 w-16 text-white" />
              <Brain className="h-8 w-8 text-white/80 absolute -top-2 -right-2" />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Medical Answers?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands who trust MediHelp AI for reliable medical information. 
            Start your health journey with us today.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
            <Link to="/ask-ai">Ask Your First Question</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;