from langchain_google_genai import GoogleGenerativeAI
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_groq import ChatGroq
from fastapi import FastAPI
import os

app=FastAPI()


os.environ["GOOGLE_API_KEY"]= os.getenv("GOOGLE_API_KEY")
# os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")
# os.environ["NVIDIA_API_KEY"] = os.getenv("NVIDIA_API_KEY")


google_llm=GoogleGenerativeAI(model="gemini-2.5-flash",temperature=0.5)
res=google_llm.invoke("Hello, how are you?")
print(res)  