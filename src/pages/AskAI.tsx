import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Send, AlertTriangle, Shield, Clock, MessageSquare, Mic, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AskAI = () => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [listening, setListening] = useState(false);
  const [wasVoiceInput, setWasVoiceInput] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isInCall, setIsInCall] = useState(false); // New: call mode state
  const { toast } = useToast();

  // ElevenLabs API Configuration
  const ELEVENLABS_API_KEY = "YOUR_ELEVENLABS_API_KEY"; // Replace with your actual API key
  const VOICE_ID = "YOUR_VOICE_ID"; // Replace with your trained voice ID

  // Web Speech API for speech-to-text with auto-submit
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support the Web Speech API.",
        variant: "destructive",
      });
      return;
    }

    if (!isInCall) {
      // Start call mode
      setIsInCall(true);
      setShowAnswer(false);
      setAnswer("");
      setAudioUrl(null);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // Stop after one utterance
    recognition.onstart = () => setListening(true);
    recognition.onerror = (event: any) => {
      setListening(false);
      toast({
        title: "Speech Recognition Error",
        description: event.error || "Could not recognize speech.",
        variant: "destructive",
      });
    };
    recognition.onend = () => {
      setListening(false);
      // Auto-restart listening in call mode
      if (isInCall && !isLoading) {
        setTimeout(() => {
          if (isInCall) {
            handleVoiceInput();
          }
        }, 1000);
      }
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setWasVoiceInput(true);
      setListening(false);
      
      // Auto-submit the question
      if (transcript.trim()) {
        handleSubmitAutomatically(transcript);
      }
    };
    recognition.start();
  };

  // Auto-submit function for call mode
  const handleSubmitAutomatically = async (questionText: string) => {
    if (!questionText.trim()) return;

    setIsLoading(true);
    setShowAnswer(true);
    setAnswer("");

    try {
      // Call your FastAPI endpoint
      const response = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: questionText }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch answer");
      }

      const data = await response.json();
      setAnswer(data.answer || "No answer found");
      setQuestion(""); // clear input

      // If question was asked by voice, generate audio using ElevenLabs
      if (wasVoiceInput && data.answer) {
        try {
          const audioBlob = await generateAudio(data.answer);
          playAudio(audioBlob);
        } catch (ttsErr) {
          toast({
            title: "Voice Output Error",
            description: "Could not generate voice reply. Please check your ElevenLabs API key.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      setAnswer("Sorry, something went wrong. Please try again.");
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setWasVoiceInput(false);
    }
  };

  // End call function
  const endCall = () => {
    setIsInCall(false);
    setListening(false);
    setShowAnswer(false);
    setAnswer("");
    setAudioUrl(null);
    setQuestion("");
  };

  // Generate audio using ElevenLabs API
  const generateAudio = async (text: string) => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      console.error('ElevenLabs API error:', error);
      throw error;
    }
  };

  // Play audio from ElevenLabs
  const playAudio = (audioBlob: Blob) => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    const audio = new Audio(url);
    audio.play();
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    setShowAnswer(true);
    setAnswer("");
    setAudioUrl(null);

    try {
      // Call your FastAPI endpoint
      const response = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch answer");
      }

      const data = await response.json();
      setAnswer(data.answer || "No answer found");
      setQuestion(""); // clear input

      // If question was asked by voice, generate audio using ElevenLabs
      if (wasVoiceInput && data.answer) {
        try {
          const audioBlob = await generateAudio(data.answer);
          playAudio(audioBlob);
        } catch (ttsErr) {
          toast({
            title: "Voice Output Error",
            description: "Could not generate voice reply. Please check your ElevenLabs API key.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      setAnswer("Sorry, something went wrong. Please try again.");
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setWasVoiceInput(false); // reset for next question
    }
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
              {isInCall && (
                <div className="flex items-center space-x-2 ml-auto">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-500 font-medium">LIVE CALL</span>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {isInCall 
                ? "You're in a call with the AI. Speak naturally or click the mic to restart."
                : "Ask any health-related question and get evidence-based information."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isInCall ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-foreground mb-2">
                    Your Medical Question
                  </label>
                  <div className="relative flex">
                    <Textarea
                      id="question"
                      placeholder="Type your health question here... (e.g., 'What are the symptoms of diabetes?')"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="min-h-[120px] resize-none pr-12"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${listening ? 'bg-red-100' : 'bg-muted'} hover:bg-accent focus:outline-none`}
                      aria-label={listening ? "Stop voice input" : "Start voice input"}
                      disabled={isLoading}
                    >
                      <Mic className={`h-6 w-6 ${listening ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                      {listening && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                      )}
                    </button>
                  </div>
                  {listening && (
                    <div className="text-xs text-red-500 mt-1 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span>Listening... (speak now)</span>
                    </div>
                  )}
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
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={handleVoiceInput}
                      className={`p-4 rounded-full transition-all ${listening ? 'bg-red-500 scale-110' : 'bg-primary hover:bg-primary/90'} text-white shadow-lg`}
                      disabled={isLoading}
                    >
                      <Mic className="h-8 w-8" />
                    </button>
                  </div>
                  <p className="text-muted-foreground">
                    {listening 
                      ? "Listening... Speak your question now"
                      : isLoading 
                        ? "Processing your question..."
                        : "Click the mic to ask a question"
                    }
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button 
                    onClick={endCall}
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                  >
                    End Call
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Answer Display Box */}
        {showAnswer && (
          <Card className="mb-8 shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-primary" />
                <span>AI Response</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-3 p-4">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {answer}
                  </p>
                  {audioUrl && (
                    <audio src={audioUrl} autoPlay controls className="mt-2 w-full" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
