import pandas as pd

# Step 1: Load the CSV
df = pd.read_csv("MedQuAD.csv")  # replace with your dataset name
print("Dataset Loaded Successfully!")
print(df.head())

# Step 2: Preprocess the data
text_chunks = []
for _, row in df.iterrows():
    text = f"Question: {row['Questions']}\nSymptoms: {row['Symbtoms']}\nSource: {row['Source']}\nAnswer: {row['Answers']}"
    text_chunks.append(text)

print(f"Total text chunks created: {len(text_chunks)}")
print("Sample chunk:\n", text_chunks[0])
