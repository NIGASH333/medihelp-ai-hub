import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Send, AlertTriangle, Shield, Clock, MessageSquare, Mic, Volume2, Mail, X, AlertCircle } from "lucide-react";
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
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{title: string, message: string, type: 'backend' | 'voice' | 'network'} | null>(null);
  const [speechRecognitionInstance, setSpeechRecognitionInstance] = useState<any>(null);
  const [audioLevel, setAudioLevel] = useState(0);
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
    recognition.onstart = () => {
      setListening(true);
      // Simulate audio level changes when listening
      const audioInterval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      
      // Store interval for cleanup
      (window as any).audioInterval = audioInterval;
    };
    recognition.onerror = (event: any) => {
      setListening(false);
      setSpeechRecognitionInstance(null);
      toast({
        title: "Speech Recognition Error",
        description: event.error || "Could not recognize speech.",
        variant: "destructive",
      });
    };
    recognition.onend = () => {
      setListening(false);
      setSpeechRecognitionInstance(null);
      setAudioLevel(0);
      
      // Clear audio interval
      if ((window as any).audioInterval) {
        clearInterval((window as any).audioInterval);
        (window as any).audioInterval = null;
      }
      
      // Auto-restart listening in call mode only if still in call
      if (isInCall && !isLoading) {
        setTimeout(() => {
          if (isInCall && !speechRecognitionInstance) {
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
    
    // Store the recognition instance
    setSpeechRecognitionInstance(recognition);
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
          console.error('ElevenLabs API error:', ttsErr);
          let errorMessage = "Could not generate voice reply.";
          
          // Check if it's an API limit error
          if (ttsErr instanceof Error && ttsErr.message.includes('429')) {
            errorMessage = "API key has reached its limit. You cannot access voice features at this time.";
          } else if (ttsErr instanceof Error && ttsErr.message.includes('401')) {
            errorMessage = "Invalid API key. Please check your ElevenLabs API key.";
          } else if (ttsErr instanceof Error && ttsErr.message.includes('403')) {
            errorMessage = "API key has reached its limit. You cannot access voice features at this time.";
          }
          
          toast({
            title: "Voice Output Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('API error:', error);
      let errorMessage = "Something went wrong. Please try again.";
      let errorTitle = "Error";
      let errorType: 'backend' | 'voice' | 'network' = 'network';
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Developer of the site had problems paying API costs, so the backend server is shutdown. If you want to provide the cost, contact this email: nigashnigash0845@gmail.com";
          errorTitle = "Backend Server Down";
          errorType = 'backend';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = "Network error. Please check your internet connection.";
          errorTitle = "Network Error";
          errorType = 'network';
        } else if (error.message.includes('timeout')) {
          errorMessage = "Request timed out. Please try again.";
          errorTitle = "Request Timeout";
          errorType = 'network';
        }
      }
      
      setAnswer("Sorry, something went wrong. Please try again.");
      showError(errorTitle, errorMessage, errorType);
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
    
    // Stop any running speech recognition
    if (speechRecognitionInstance) {
      speechRecognitionInstance.stop();
      setSpeechRecognitionInstance(null);
    }
    
    // Clear audio interval
    if ((window as any).audioInterval) {
      clearInterval((window as any).audioInterval);
      (window as any).audioInterval = null;
    }
    setAudioLevel(0);
  };

  // Show error dialog
  const showError = (title: string, message: string, type: 'backend' | 'voice' | 'network') => {
    setErrorDetails({ title, message, type });
    setShowErrorDialog(true);
  };

  // Copy email to clipboard
  const copyEmail = () => {
    navigator.clipboard.writeText('nigashnigash0845@gmail.com');
    toast({
      title: "Email Copied!",
      description: "Email address copied to clipboard",
    });
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
          console.error('ElevenLabs API error:', ttsErr);
          let errorMessage = "Could not generate voice reply.";
          let errorTitle = "Voice Output Error";
          
          // Check if it's an API limit error
          if (ttsErr instanceof Error && ttsErr.message.includes('429')) {
            errorMessage = "API key has reached its limit. You cannot access voice features at this time.";
            errorTitle = "API Limit Reached";
          } else if (ttsErr instanceof Error && ttsErr.message.includes('401')) {
            errorMessage = "Invalid API key. Please check your ElevenLabs API key.";
            errorTitle = "Invalid API Key";
          } else if (ttsErr instanceof Error && ttsErr.message.includes('403')) {
            errorMessage = "API key has reached its limit. You cannot access voice features at this time.";
            errorTitle = "API Limit Reached";
          }
          
          showError(errorTitle, errorMessage, 'voice');
        }
      }
    } catch (error) {
      console.error('API error:', error);
      let errorMessage = "Something went wrong. Please try again.";
      let errorTitle = "Error";
      let errorType: 'backend' | 'voice' | 'network' = 'network';
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Developer of the site had problems paying API costs, so the backend server is shutdown. If you want to provide the cost, contact this email: nigashnigash0845@gmail.com";
          errorTitle = "Backend Server Down";
          errorType = 'backend';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = "Network error. Please check your internet connection.";
          errorTitle = "Network Error";
          errorType = 'network';
        } else if (error.message.includes('timeout')) {
          errorMessage = "Request timed out. Please try again.";
          errorTitle = "Request Timeout";
          errorType = 'network';
        }
      }
      
      setAnswer("Sorry, something went wrong. Please try again.");
      showError(errorTitle, errorMessage, errorType);
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
                      className={`absolute right-3 top-3 p-3 rounded-full transition-all duration-300 ${
                        listening 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30' 
                          : 'bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10'
                      } hover:scale-110 focus:outline-none border border-white/20 backdrop-blur-sm`}
                      aria-label={listening ? "Stop voice input" : "Start voice input"}
                      disabled={isLoading}
                    >
                      <Mic className={`h-5 w-5 ${listening ? 'text-white animate-pulse' : 'text-primary'}`} />
                      {listening && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
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
              <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
                {/* Perplexity-style background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50"></div>
                
                {/* Central content */}
                <div className="relative z-10 text-center space-y-12">
                  {/* Animated dot formation that responds to voice */}
                  <div className="relative w-96 h-96 mx-auto mb-8">
                    {/* Generate multiple dots in a circular pattern */}
                    {Array.from({ length: 50 }).map((_, i) => {
                      const angle = (i / 50) * 2 * Math.PI;
                      const radius = 120 + Math.random() * 40;
                      const x = Math.cos(angle) * radius + 192; // 192 = 384/2 (center)
                      const y = Math.sin(angle) * radius + 192;
                      const size = 2 + Math.random() * 4;
                      
                      return (
                        <div
                          key={i}
                          className="absolute rounded-full bg-amber-600/60 animate-pulse"
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            width: `${size}px`,
                            height: `${size}px`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                          }}
                        />
                      );
                    })}
                    

                  </div>
                  
                  {/* Voice control buttons */}
                  <div className="flex justify-center space-x-6">
                    {/* Cancel button (X) */}
                    <button
                      onClick={endCall}
                      className="p-4 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white/90 transition-all duration-200 shadow-lg hover:scale-105"
                    >
                      <X className="h-6 w-6 text-gray-600" />
                    </button>
                    
                    {/* Microphone button */}
                    <button
                      onClick={handleVoiceInput}
                      className={`p-6 rounded-full transition-all duration-300 ${
                        listening 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-110 shadow-2xl shadow-blue-500/50' 
                          : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white/90 hover:scale-105'
                      } shadow-lg`}
                      disabled={isLoading}
                    >
                      <Mic className={`h-8 w-8 ${listening ? 'text-white animate-pulse' : 'text-gray-600'}`} />
                      
                      {/* Recording indicator */}
                      {listening && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping">
                          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  </div>
                  
                  {/* Status text */}
                  <div className="space-y-2">
                    <p className={`text-lg font-medium transition-colors ${
                      listening ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {listening 
                        ? "Listening..."
                        : isLoading 
                          ? "Processing..."
                          : "Voice Mode Active"
                      }
                    </p>
                    
                    {listening && (
                      <p className="text-sm text-gray-500">
                        Speak your question now
                      </p>
                    )}
                  </div>
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

      {/* Interactive Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              {errorDetails?.type === 'backend' && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              {errorDetails?.type === 'voice' && (
                <Volume2 className="h-5 w-5 text-orange-500" />
              )}
              {errorDetails?.type === 'network' && (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <DialogTitle className="text-lg font-semibold">
                {errorDetails?.title}
              </DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {errorDetails?.message}
            </p>
            
            {errorDetails?.type === 'backend' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Contact Developer</span>
                </div>
                <p className="text-xs text-blue-700">
                  If you'd like to help support this service, you can contact the developer to contribute to API costs.
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyEmail}
                    className="text-xs"
                  >
                    Copy Email
                  </Button>
                  <span className="text-xs text-blue-600 font-mono">
                    nigashnigash0845@gmail.com
                  </span>
                </div>
              </div>
            )}
            
            {errorDetails?.type === 'voice' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-xs text-orange-700">
                  Voice features are temporarily unavailable due to API limits. Text responses are still available.
                </p>
              </div>
            )}
            
            {errorDetails?.type === 'network' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-700">
                  Please check your internet connection and try again.
                </p>
              </div>
            )}
          </DialogDescription>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowErrorDialog(false)}
              size="sm"
            >
              Close
            </Button>
            {errorDetails?.type === 'backend' && (
              <Button
                onClick={() => {
                  window.open('mailto:nigashnigash0845@gmail.com?subject=MediHelp AI Support', '_blank');
                  setShowErrorDialog(false);
                }}
                size="sm"
              >
                Send Email
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AskAI;
