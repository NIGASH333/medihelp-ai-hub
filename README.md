# Medical AI Bot - RAG-based Medical Assistant

A sophisticated medical question-answering system that uses Retrieval-Augmented Generation (RAG) to provide accurate medical information based on a comprehensive medical dataset.

## 🏥 Project Overview

This medical AI bot leverages advanced natural language processing and vector search capabilities to answer medical questions accurately and safely. The system combines:

- **FAISS Vector Database**: For efficient similarity search across medical knowledge
- **Sentence Transformers**: For generating semantic embeddings
- **Perplexity AI API**: For generating contextual medical responses
- **FastAPI**: For providing a RESTful API interface

## 📁 Project Structure

```
AI_BOT-MED_Demo_original/
├── medquad.csv              # Medical dataset (22MB)
├── text_chunks.pkl          # Preprocessed text chunks (22MB)
├── faiss_index.bin          # FAISS vector index (24MB)
├── query_rag.py             # Main API server (10KB)
├── Genrate_embdings.py      # Embedding generation script
├── pre_process.py           # Data preprocessing script
└── readme.md               # This file
```

## 🚀 Features

- **Medical Question Classification**: Automatically identifies if a question is medical-related
- **Semantic Search**: Uses FAISS for efficient retrieval of relevant medical information
- **Context-Aware Responses**: Generates responses based on retrieved medical context
- **Safety Filters**: Ensures responses are based only on the provided medical dataset
- **RESTful API**: Easy-to-use HTTP endpoints for integration
- **CORS Support**: Cross-origin resource sharing enabled for web applications

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.8 or higher
- pip package manager

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI_BOT-MED_Demo_original
```

### 2. Install Dependencies

```bash
pip install fastapi uvicorn faiss-cpu sentence-transformers pandas numpy requests python-dotenv
```

### 3. Environment Setup

Create a `.env` file in the project root:

```env
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

**Note**: You'll need a Perplexity AI API key. Sign up at [Perplexity AI](https://www.perplexity.ai/) to get your API key.

### 4. Data Processing (First Time Setup)

If you're setting up the project for the first time, you'll need to generate the embeddings:

```bash
python Genrate_embdings.py
```

This will create:
- `faiss_index.bin`: Vector database for similarity search
- `text_chunks.pkl`: Preprocessed text chunks

## 🌐 Web Interface

### Live Demo

Experience the medical AI assistant with a modern web interface at: **[MediHelp AI Hub](https://medhelpai.netlify.app/)**

The web application provides a voice-enabled, user-friendly interface for interacting with the medical AI system.

### Web Features

- **🎙️ Voice-First Experience**: Natural voice conversations with AI
- **💬 Dual Input Modes**: Voice and text input options
- **🎯 Medical AI Assistant**: Reliable health information and guidance
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🔒 Safety Features**: Built-in disclaimers and privacy protection

### Web Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Shadcn/ui + Tailwind CSS
- **Voice Recognition**: Web Speech API
- **Voice Synthesis**: ElevenLabs API
- **Build Tool**: Vite

## 🚀 Usage

### Web Application

1. **Visit the Live Site**: Go to [https://medhelpai.netlify.app/](https://medhelpai.netlify.app/)
2. **Choose Input Mode**: 
   - **Voice Mode**: Click the microphone for natural voice conversations
   - **Text Mode**: Type your questions manually
3. **Ask Medical Questions**: Get instant AI-powered responses
4. **Follow-up Questions**: Continue the conversation naturally

### Backend API Server

#### Starting the Server

```bash
python query_rag.py
```

The server will start on `http://localhost:8000`

#### API Endpoints

##### POST `/query`

Send medical questions to get AI-powered responses.

**Request Body:**
```json
{
    "question": "What are the symptoms of diabetes?"
}
```

**Response:**
```json
{
    "answer": "Diabetes symptoms include increased thirst, frequent urination, extreme hunger, unexplained weight loss, fatigue, and blurred vision."
}
```

#### Example Usage with curl

```bash
curl -X POST "http://localhost:8000/query" \
     -H "Content-Type: application/json" \
     -d '{"question": "What causes high blood pressure?"}'
```

## 🔧 Technical Details

### Architecture

1. **Question Classification**: Uses Perplexity AI to determine if a question is medical-related
2. **Vector Search**: Converts questions to embeddings and searches FAISS index
3. **Context Retrieval**: Retrieves relevant medical information from the dataset
4. **Response Generation**: Uses Perplexity AI with retrieved context to generate accurate responses

### Key Components

- **`query_rag.py`**: Main FastAPI application with all endpoints and logic
- **`Genrate_embdings.py`**: Script to create embeddings and FAISS index
- **`pre_process.py`**: Data preprocessing utilities
- **FAISS Index**: Efficient similarity search for medical knowledge
- **Sentence Transformers**: `all-MiniLM-L6-v2` model for embeddings

## 🖥️ Web Application Development

### Prerequisites for Web Development

- Node.js (v16 or higher)
- npm or yarn
- ElevenLabs API key
- Your trained voice ID from ElevenLabs

### Web App Setup

1. **Clone the web repository** (separate from this backend repo)
   ```bash
   git clone <web-repo-url>
   cd medihelp-ai-hub-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Keys**
   
   Open `src/pages/AskAI.tsx` and update these constants:
   ```javascript
   const ELEVENLABS_API_KEY = "your-elevenlabs-api-key-here";
   const VOICE_ID = "your-trained-voice-id-here";
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### ElevenLabs Setup for Voice Features

1. **Get API Key**: Sign up at [ElevenLabs](https://elevenlabs.io)
2. **Train Your Voice**: Upload voice samples to create your custom voice
3. **Get Voice ID**: Copy your trained voice ID from the dashboard
4. **Update Code**: Replace the placeholder values in `AskAI.tsx`

### Web App Features

- **Call Mode**: Click the mic to start a natural conversation
- **Auto-Submit**: Speak your question, no need to press buttons
- **Continuous Listening**: AI automatically listens for follow-up questions
- **Voice Response**: AI replies in your custom-trained voice via ElevenLabs
- **Smart Detection**: Automatically detects input method and responds accordingly

### Safety Features

- **Medical Classification**: Only answers medical-related questions
- **Context-Based Responses**: Responses are based only on the provided medical dataset
- **Fallback Classification**: Keyword-based classification if API fails
- **Response Cleaning**: Removes formatting artifacts for clean output

## 📊 Dataset

The system uses the **MedQuAD** dataset, which contains:
- Medical questions and answers
- Symptom descriptions
- Source information
- Comprehensive medical knowledge

## 🔍 Supported Question Types

The bot can answer questions about:
- Diseases and conditions
- Symptoms and signs
- Treatments and medications
- Medical procedures
- Diagnosis information
- Medical statistics
- Health conditions

## ⚠️ Important Notes

1. **Medical Disclaimer**: This is a demonstration system and should not be used for actual medical diagnosis or treatment decisions.
2. **API Dependencies**: Requires an active Perplexity AI API key
3. **Dataset Limitations**: Responses are limited to the information available in the MedQuAD dataset
4. **Not Medical Advice**: Always consult healthcare professionals for medical concerns

## 🐛 Troubleshooting

### Common Issues

1. **FAISS Index Not Found**: Run `python Genrate_embdings.py` to generate the index
2. **API Key Error**: Ensure your `.env` file contains the correct Perplexity API key
3. **Port Already in Use**: Change the port in `query_rag.py` or kill the existing process

### Performance Tips

- The FAISS index is loaded into memory for fast retrieval
- Consider using GPU acceleration for embedding generation on large datasets
- Monitor API rate limits for Perplexity AI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🏗️ Complete System Architecture

### Backend (This Repository)
- **FastAPI Server**: RESTful API endpoints
- **FAISS Vector Database**: Medical knowledge search
- **Perplexity AI Integration**: Response generation
- **Medical Classification**: Question filtering

### Frontend (Web Application)
- **React + TypeScript**: Modern web interface
- **Voice Integration**: ElevenLabs voice synthesis
- **Web Speech API**: Voice recognition
- **Responsive Design**: Mobile and desktop support

### Deployment
- **Backend**: Deployed on your preferred hosting service
- **Frontend**: Live at [https://medhelpai.netlify.app/](https://medhelpai.netlify.app/)
- **API Communication**: Frontend connects to backend via HTTP requests

## 📄 License

This project is for educational and demonstration purposes. Please ensure compliance with all applicable laws and regulations when using medical data.

## 📞 Support

For questions or issues, please open an issue in the repository or contact the development team.

## 🙏 Acknowledgments

- [ElevenLabs](https://elevenlabs.io) for voice synthesis
- [Shadcn/ui](https://ui.shadcn.com) for UI components
- [Lucide](https://lucide.dev) for icons
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Perplexity AI](https://www.perplexity.ai/) for AI response generation

---

**Disclaimer**: This medical AI bot is for educational purposes only and should not be used for actual medical diagnosis or treatment decisions. Always consult qualified healthcare professionals for medical advice.
