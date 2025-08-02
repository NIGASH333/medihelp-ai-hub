import pandas as pd
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load data
df = pd.read_csv("medquad.csv")

# Combine text into chunks
text_chunks = []
for _, row in df.iterrows():
    text = f"Question: {row['Questions']}\nSymptoms: {row['Symbtoms']}\nSource: {row['Source']}\nAnswer: {row['Answers']}"
    text_chunks.append(text)

# Load model & generate embeddings
model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(text_chunks, show_progress_bar=True)

# Convert to numpy float32 (required by FAISS)
embeddings = np.array(embeddings).astype("float32")

# Create FAISS index
index = faiss.IndexFlatL2(embeddings.shape[1])  # L2 = cosine distance
index.add(embeddings)

# Save FAISS index & text_chunks
faiss.write_index(index, "faiss_index.bin")
with open("text_chunks.pkl", "wb") as f:
    pickle.dump(text_chunks, f)

print(f"Saved FAISS index with {index.ntotal} vectors.")
