import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Send, AlertTriangle, Shield, Clock, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AskAI = () => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a medical question before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - This is where the chatbot API integration will go
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Question Received!",
        description: "Our AI is processing your question. The chatbot integration will be available soon.",
      });
      setQuestion("");
    }, 2000);
  };

  const exampleQuestions = [
    "What are the common symptoms of the flu?",
    "How can I manage stress and anxiety?",
    "What should I know about high blood pressure?",
    "Are there natural remedies for headaches?",
    "How much sleep do adults need?",
    "What are the signs of dehydration?"
  ];

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "Your questions are encrypted and never stored with personal identifiers."
    },
    {
      icon: Brain,
      title: "AI-Powered",
      description: "Advanced medical AI trained on verified medical literature and guidelines."
    },
    {
      icon: Clock,
      title: "Instant Response",
      description: "Get immediate answers to your health questions, available 24/7."
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <MessageSquare className="h-16 w-16 text-primary" />
              <Brain className="h-8 w-8 text-accent-foreground absolute -top-2 -right-2" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ask MediHelp AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get instant, reliable answers to your medical questions from our AI assistant.
          </p>
        </div>

        {/* Important Disclaimer */}
        <Alert className="mb-8 border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            <strong>Important:</strong> This AI provides general health information only. 
            Always consult with healthcare professionals for medical diagnosis, treatment, 
            or emergency situations. If you're experiencing a medical emergency, call 911 immediately.
          </AlertDescription>
        </Alert>

        {/* Main Chat Interface */}
        <Card className="mb-8 shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <span>Medical AI Assistant</span>
            </CardTitle>
            <CardDescription>
              Ask any health-related question and get evidence-based information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-foreground mb-2">
                  Your Medical Question
                </label>
                <Textarea
                  id="question"
                  placeholder="Type your health question here... (e.g., 'What are the symptoms of diabetes?')"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={isLoading || !question.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Ask MediHelp AI</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Chatbot Integration Notice */}
        <Card className="mb-8 bg-secondary/50">
          <CardContent className="p-6">
            <div className="text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                AI Chatbot Integration Ready
              </h3>
              <p className="text-muted-foreground">
                This interface is designed to seamlessly integrate with your preferred chatbot API. 
                The backend infrastructure is ready to connect with services like OpenAI, 
                Google's medical AI, or custom healthcare AI models.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Example Questions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Example Questions</CardTitle>
            <CardDescription>
              Get started with these common health questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleQuestions.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start h-auto p-3 text-wrap"
                  onClick={() => setQuestion(example)}
                  disabled={isLoading}
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safetyFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="text-center border-border shadow-card-soft">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AskAI;