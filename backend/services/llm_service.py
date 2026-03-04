import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the Gemini client
# Note: Ensure GOOGLE_API_KEY is set in your environment or .env file
client = genai.Client()

def generate_chart_suggestions(data_summary: dict) -> str:
    """
    Sends the data summary to Gemini and asks for chart suggestions in a strict JSON format.
    """
    
    model_name = "gemini-1.5-flash"
    
    prompt = f"""
    You are an expert Data Analyst. I have a dataset with the following profile:
    
    Columns: {data_summary.get('columns')}
    Schema (Data Types): {data_summary.get('schema')}
    Summary Statistics: {data_summary.get('summary')}
    Sample Data (First 3 rows): {data_summary.get('sample_data')}
    
    Task:
    Analyze this dataset profile and suggest 3 to 5 highly relevant and interesting visualizations 
    that showcase the most important patterns, trends, or relationships in the data.
    
    Return the response strictly as a JSON array of objects. Do not include any markdown formatting like ```json.
    
    Each object in the JSON array must follow this exact structure:
    {{
      "id": "a-unique-string-identifier-for-this-chart",
      "title": "A short, descriptive title for the chart (e.g., 'Sales by Region')",
      "insight": "A brief, 1-2 sentence analysis or finding based on the data profile.",
      "chartType": "bar" | "line" | "pie" | "area",
      "metric": "A key highlight number or string (e.g., '$1M', '34%', 'High')",
      "trend": "up" | "down" | "neutral",
      "parameters": {{
         "xAxis": "The exact name of the column to use for the X-Axis or category",
         "yAxis": "The exact name of the column to use for the Y-Axis or value"
      }}
    }}
    
    Rules for parameters:
    - 'chartType' MUST be one of: "bar", "line", "pie", or "area".
    - 'xAxis' and 'yAxis' MUST exactly match the names of the columns provided.
    - If it's a 'pie' chart, 'xAxis' is the category label and 'yAxis' is the numerical value.
    """
    
    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    return response.text
