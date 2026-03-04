import pandas as pd
import json

data = {
    'Rank': [1, 2, 3],
    'City': ['Tokyo', 'Delhi', 'Shanghai'],
    'Country': ['Japan', 'India', 'China'],
    'Population': [37115000, 35500000, 31050000],
    'Area': [8231, 2344, 4333]
}
df = pd.DataFrame(data)

llm_text = '''[
  {
    "id": "city-population",
    "title": "Top Cities by Population",
    "chartType": "bar",
    "parameters": {
      "xAxis": "City",
      "yAxis": "Population",
      "aggregation": "sum"
    }
  },
  {
    "id": "country-count",
    "title": "Countries with Most Cities",
    "chartType": "bar",
    "parameters": {
      "xAxis": "Country",
      "yAxis": "City",
      "aggregation": "count"
    }
  }
]'''

try:
    suggestions = json.loads(llm_text)
    for insight in suggestions:
        params = insight.get('parameters', {})
        x_col = str(params.get('xAxis', '')).strip()
        y_col = str(params.get('yAxis', '')).strip()
        aggr = params.get('aggregation', 'sum')
        limit = params.get('limit', 20)
        
        chart_data = []
        if x_col and y_col:
            for col in df.columns:
                if col.lower() == x_col.lower(): x_col = col
                if col.lower() == y_col.lower(): y_col = col

            if x_col in df.columns and y_col in df.columns:
                plot_df = df.dropna(subset=[x_col, y_col]).copy()
                if aggr in ['sum', 'mean']:
                    plot_df[y_col] = pd.to_numeric(plot_df[y_col], errors='coerce')
                    plot_df = plot_df.dropna(subset=[y_col])
                
                if not plot_df.empty:
                    if aggr == 'sum':
                        grouped = plot_df.groupby(x_col)[y_col].sum().reset_index()
                    elif aggr == 'mean':
                        grouped = plot_df.groupby(x_col)[y_col].mean().reset_index()
                    elif aggr == 'count':
                        # DEBUG: What happens if there's an attempt to sort by a non-numeric series?
                        grouped = plot_df.groupby(x_col)[y_col].count().reset_index()
                    else:
                        grouped = plot_df.groupby(x_col)[y_col].sum().reset_index()
                    
                    grouped = grouped.sort_values(by=y_col, ascending=False).head(limit)
                    
                    for _, row in grouped.iterrows():
                        chart_data.append({
                            'name': str(row[x_col]),
                            'value': row[y_col]
                        })
        insight['data'] = chart_data
        print(f"Processed {insight['id']} successfully.")
except Exception as e:
    print('CRASH!', str(e))
