import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables explicitly from the backend directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# Initialize the Groq client
# Note: Ensure GROQ_API_KEY is set in your environment or .env file
api_key = os.environ.get("GROQ_API_KEY")

client = Groq(api_key=api_key)

def generate_chart_suggestions(data_summary: dict) -> str:
    """
    Sends the data summary to Groq (Llama 3) and asks for chart suggestions in a strict JSON format.
    """
    
    model_name = "llama-3.3-70b-versatile"
    
    sys_prompt = """
    You are an expert Data Analyst. You must return your response strictly as a JSON object containing a single key "insights" mapping to an array of objects. DONT USE MARKDOWN FORMATTING OR BACKTICKS.
    
    Each object in the JSON array must follow this exact structure:
    {
      "id": "a-unique-string-identifier-for-this-chart",
      "title": "A short, descriptive title for the chart (e.g., 'Sales by Region')",
      "insight": "A brief, 1-2 sentence analysis or finding based on the data profile.",
      "chartType": "bar" | "line" | "pie" | "area",
      "metric": "A key highlight number or string (e.g., '$1M', '34%', 'High')",
      "trend": "up" | "down" | "neutral",
      "parameters": {
         "xAxis": "The exact name of the column to use for the X-Axis or category",
         "yAxis": "The exact name of the column to use for the Y-Axis or value",
         "aggregation": "sum" | "mean" | "count"
      }
    }
    
    Rules for parameters:
    - 'chartType' MUST be one of: "bar", "line", "pie", or "area".
    - 'xAxis' and 'yAxis' MUST exactly match the names of the columns provided.
    - If it's a 'pie' chart, 'xAxis' is the category label and 'yAxis' is the numerical value.
    - STRICT MATH RULE: Never attempt to "sum" or "mean" string/text columns or unique IDs. Only suggest valid mathematical aggregations for the specific data type.
    - STRICT VALIDATION RULE: If the dataset appears to be a pure text corpus, a log file, or has absolutely no business intelligence/analytical value, immediately return {"insights": []}.
    - DIVERSITY RULE: You MUST use at least 2 different chart types across your suggestions. Consider: "pie" for categorical distributions (e.g., room types, categories), "line" or "area" for trends over sequential/time data, "bar" for comparisons across groups.
    - UNIQUENESS RULE: No two insights may have the same combination of xAxis + yAxis + aggregation. Each suggestion must reveal a DIFFERENT aspect of the data.
    - SMART CHART SELECTION: Use "pie" when showing proportions of a whole (e.g., count of items by category). Use "bar" for comparing values across groups. Use "line" or "area" for data that has a natural ordering or sequence.
    """
    
    user_prompt = f"""
    I have a dataset with the following profile:
    
    Columns: {data_summary.get('columns')}
    Schema (Data Types): {data_summary.get('schema')}
    Summary Statistics: {data_summary.get('summary')}
    Sample Data (First 3 rows): {data_summary.get('sample_data')}
    
    Task:
    Analyze this dataset profile and suggest 3 to 5 highly relevant and interesting visualizations 
    that showcase the most important patterns, trends, or relationships in the data. Return the JSON object.
    """
    
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.4
    )
    
    return response.choices[0].message.content
