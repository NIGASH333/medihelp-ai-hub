import os
import faiss
import pickle
import numpy as np
import asyncio
import sys
import re
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import requests

# Fix for Windows asyncio issue
if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Load environment variables
load_dotenv()
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

# Load FAISS index
index = faiss.read_index("faiss_index.bin")

# Load text chunks
with open("text_chunks.pkl", "rb") as f:
    text_chunks = pickle.load(f)

# Load embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class QueryRequest(BaseModel):
    question: str

def clean_response(response):
    """Remove formatting markers and clean the response"""
    # Remove asterisks, brackets with numbers, and other formatting markers
    cleaned = re.sub(r'\*{2,}', '', response)  # Remove multiple asterisks
    cleaned = re.sub(r'\[[0-9]+\]', '', cleaned)  # Remove [1], [2], etc.
    cleaned = re.sub(r'\[[^\]]*\]', '', cleaned)  # Remove any remaining brackets
    cleaned = re.sub(r'\([^)]*\)', '', cleaned)   # Remove parentheses content
    cleaned = re.sub(r'#+', '', cleaned)          # Remove markdown headers
    cleaned = re.sub(r'\n+', ' ', cleaned)        # Replace multiple newlines with space
    cleaned = re.sub(r'\s+', ' ', cleaned)        # Replace multiple spaces with single space
    cleaned = cleaned.strip()                      # Remove leading/trailing whitespace
    return cleaned

def query_faiss(question):
    """Retrieve relevant documents from FAISS index"""
    query_vector = embedding_model.encode([question])
    D, I = index.search(np.array(query_vector).astype("float32"), k=3)
    
    # Filter results to ensure they are medical-related
    results = []
    for i, distance in zip(I[0], D[0]):
        if i < len(text_chunks):
            chunk = text_chunks[i]
            # Check if the chunk contains medical keywords
            medical_terms = ["question", "symptoms", "source", "answer", "medical", "disease", "treatment"]
            if any(term in chunk.lower() for term in medical_terms):
                results.append(chunk)
    
    return results

def ask_perplexity(context, question):
    """Send context and question to Perplexity API (Sonar-Pro)"""
    url = "https://api.perplexity.ai/chat/completions"

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }

    # Improved prompt to get cleaner responses
    prompt = f"""Based ONLY on the following medical information from the dataset, provide a clear and direct answer to the question. If the information is not available in the provided context, say "I don't have information about this in my medical dataset."

Medical Context:
{context}

Question: {question}

Instructions: 
- Answer ONLY based on the provided medical context
- If the question is not medical or not covered in the context, say "I don't have information about this in my medical dataset"
- Provide a direct, factual answer in 1-2 sentences
- Do not use formatting markers like ***, [1], or brackets
- Write in plain text without special formatting
- Be concise and clear
- Do not include any citations or references
- Do not use external knowledge"""

    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "system", "content": "You are a medical assistant trained on a specific medical dataset. Only answer questions based on the provided medical context. If the question is not medical or not covered in the context, respond with 'I don't have information about this in my medical dataset.'"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 250,
        "temperature": 0.3  # Lower temperature for more consistent responses
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        raw_response = response.json()['choices'][0]['message']['content']
        # Clean the response
        cleaned_response = clean_response(raw_response)
        return cleaned_response
    else:
        return f"Error from Perplexity API: {response.text}"

def classify_medical_question(question):
    """Ask Perplexity to classify if the question is medical-related"""
    url = "https://api.perplexity.ai/chat/completions"

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }

    classification_prompt = f"""Classify if the following question is medical-related or not.

Question: {question}

Instructions:
- Answer ONLY "YES" if the question is about medical topics, diseases, symptoms, treatments, health, or medical conditions
- Answer ONLY "NO" if the question is about non-medical topics like technology, entertainment, personal information, weather, etc.
- Be strict - only medical questions should be classified as YES
- Examples of medical: diseases, symptoms, treatments, medications, medical procedures, health conditions
- Examples of non-medical: personal info, technology, entertainment, weather, sports, shopping, etc.

Answer (YES/NO):"""

    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "system", "content": "You are a medical question classifier. Answer only YES or NO based on whether the question is medical-related."},
            {"role": "user", "content": classification_prompt}
        ],
        "max_tokens": 10,
        "temperature": 0.1
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            result = response.json()['choices'][0]['message']['content'].strip().upper()
            return result == "YES"
        else:
            # If API fails, fall back to keyword-based classification
            return fallback_medical_classification(question)
    except:
        # If any error, fall back to keyword-based classification
        return fallback_medical_classification(question)

def fallback_medical_classification(question):
    """Fallback method using keyword-based classification"""
    medical_keywords = [
        "medical", "disease", "symptom", "treatment", "diagnosis", "condition",
        "arthritis", "diabetes", "cancer", "heart", "lung", "brain", "liver", "kidney",
        "pain", "fever", "cough", "headache", "nausea", "vomiting", "dizziness",
        "blood", "pressure", "cholesterol", "infection", "virus", "bacteria",
        "medicine", "drug", "pill", "injection", "surgery", "operation",
        "doctor", "physician", "nurse", "hospital", "clinic", "patient",
        "health", "illness", "sick", "healthy", "unhealthy", "chronic",
        "acute", "severe", "mild", "moderate", "cure", "heal", "recover",
        "prevent", "risk", "cause", "effect", "complication", "side effect",
        "syndrome", "disorder", "disability", "abnormality", "malformation"
    ]
    
    non_medical_keywords = [
        "name", "age", "birthday", "address", "phone", "email", "job", "work",
        "hobby", "favorite", "color", "food", "movie", "music", "book",
        "weather", "time", "date", "location", "place", "city", "country",
        "family", "friend", "pet", "car", "house", "school", "university",
        "cyber", "security", "computer", "technology", "software", "hardware",
        "internet", "network", "programming", "coding", "hacking", "virus",
        "malware", "firewall", "encryption", "password", "data", "information"
    ]
    
    is_medical = any(keyword in question for keyword in medical_keywords)
    is_non_medical = any(keyword in question for keyword in non_medical_keywords)
    
    return is_medical and not is_non_medical

@app.post("/query")
async def query_endpoint(req: QueryRequest):
    question = req.question.lower()

    # First, check if the question is asking about capabilities
    capability_questions = [
        "what types of questions can you answer",
        "what can you answer",
        "what questions can you answer",
        "what do you know",
        "what are you trained on",
        "what topics can you help with",
        "what kind of questions do you answer",
        "what are your capabilities",
        "what can you do",
        "help",
        "what should i ask you"
    ]
    
    if any(cap_question in question for cap_question in capability_questions):
        return {"answer": "I am a medical assistant trained on a comprehensive medical dataset. I can answer questions about diseases, symptoms, treatments, diagnoses, medical conditions, syndromes, medications, procedures, and medical statistics. Please ask me any medical-related question!"}

    # Use Perplexity to classify if the question is medical-related
    is_medical = classify_medical_question(question)
    
    if not is_medical:
        return {"answer": "I am trained only for answering medical-related questions. Please ask about diseases, symptoms, treatments, or medical conditions."}

    # If classified as medical, check FAISS for relevant results
    results = query_faiss(question)

    # If no relevant medical data found in FAISS, reject the question
    if not results:
        return {"answer": "I am trained only for answering medical-related questions. Please ask about diseases, symptoms, treatments, or medical conditions."}

    # If we found relevant medical data, process the question
    # Combine context for Perplexity
    context = "\n".join(results)

    # Ask Perplexity
    answer = ask_perplexity(context, question)
    return {"answer": answer}

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("query_rag:app", host="0.0.0.0", port=8000, reload=True)

