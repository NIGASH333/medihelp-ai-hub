import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Brain, 
  Search, 
  BookOpen, 
  Heart, 
  Stethoscope, 
  FileText, 
  AlertCircle,
  Clock,
  Shield,
  Users
} from "lucide-react";

const Services = () => {
  const mainServices = [
    {
      icon: Search,
      title: "Symptom Analysis",
      description: "Get detailed explanations about symptoms, their possible causes, and when to seek medical attention.",
      features: ["Comprehensive symptom database", "Risk assessment", "When to see a doctor guidance"],
      popular: true
    },
    {
      icon: BookOpen,
      title: "Disease Information",
      description: "Access comprehensive information about medical conditions, treatments, and management strategies.",
      features: ["Evidence-based content", "Treatment options", "Prevention strategies"],
      popular: false
    },
    {
      icon: Heart,
      title: "Health Tips & Wellness",
      description: "Personalized health recommendations and lifestyle tips for better overall wellness.",
      features: ["Preventive care advice", "Lifestyle recommendations", "Wellness tracking"],
      popular: false
    },
    {
      icon: Brain,
      title: "AI Medical Consultation",
      description: "Interactive AI-powered consultations to answer your specific health questions instantly.",
      features: ["24/7 availability", "Instant responses", "Follow-up questions"],
      popular: true
    }
  ];

  const additionalServices = [
    {
      icon: Stethoscope,
      title: "Specialist Referrals",
      description: "Get guidance on which medical specialists to consult for specific conditions."
    },
    {
      icon: FileText,
      title: "Medical Record Insights",
      description: "Help understanding medical test results and reports in simple language."
    },
    {
      icon: AlertCircle,
      title: "Emergency Guidance",
      description: "Quick assessment of when to seek immediate medical attention."
    },
    {
      icon: Clock,
      title: "Medication Reminders",
      description: "Information about medications, their effects, and interaction warnings."
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Reliable Information",
      description: "All content is verified by medical professionals and based on current research."
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description: "Get medical information whenever you need it, day or night."
    },
    {
      icon: Users,
      title: "Privacy Protected",
      description: "Your health questions and information are kept completely confidential."
    },
    {
      icon: Brain,
      title: "AI-Powered",
      description: "Advanced artificial intelligence provides personalized and accurate responses."
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Our Medical AI Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive health information and AI-powered medical assistance 
            to support your healthcare decisions.
          </p>
        </div>

        {/* Main Services */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Core Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mainServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className={`relative border-border shadow-card-soft hover:shadow-medical transition-shadow ${service.popular ? 'ring-2 ring-primary/20' : ''}`}>
                  {service.popular && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full">
                      <Link to="/ask-ai">Try This Service</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Additional Services */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Additional Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="text-center border-border shadow-card-soft hover:shadow-medical transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20 bg-secondary/50 p-12 rounded-lg">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Why Choose Our Services?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Ask Your Question</h3>
              <p className="text-muted-foreground">
                Simply type or speak your health-related question in natural language.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our advanced AI processes your question and searches through medical databases.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Get Answers</h3>
              <p className="text-muted-foreground">
                Receive accurate, easy-to-understand information with recommendations.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-primary p-12 rounded-lg">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience the power of AI-driven medical information. Get started with your first question today.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
            <Link to="/ask-ai">Start Using MediHelp AI</Link>
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Services;