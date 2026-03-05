# AI Dashboard Builder: Análisis al Instante 🚀

Bienvenido al **Creador de Dashboards con IA**, una aplicación web full-stack que transforma cualquier hoja de cálculo en un dashboard interactivo impulsado por Inteligencia Artificial — en segundos, sin instalar software de BI.

**🌐 Live Demo:** [https://ai-dashboard-builder-i628.vercel.app](https://ai-dashboard-builder-i628.vercel.app)

---

## 🏗️ Arquitectura y Decisiones Técnicas

### Frontend: React + Next.js (TypeScript)
| Tecnología | Razón |
|---|---|
| **Next.js** (App Router) | Velocidad, ecosistema robusto de React, despliegue instantáneo en Vercel. |
| **Tailwind CSS + shadcn/ui** | Componentes hermosos, accesibles y minimalistas sin inflar el bundle. |
| **Recharts** | Su naturaleza declarativa en React permite que la transición de "JSON → Gráfico Interactivo" sea fluida. Soporta Bar, Line, Pie y Area charts. |
| **SPA (Single-Page App)** | El flujo Subida → Carga → Selección → Dashboard ocurre sin recargas. |

### Backend: Python + FastAPI
| Tecnología | Razón |
|---|---|
| **FastAPI** | Alto rendimiento, validación automática vía Pydantic, soporte nativo para async (esperando respuestas de IA). |
| **Pandas** | Núcleo analítico. Lee CSV/XLSX, extrae esquema de columnas, genera resúmenes estadísticos (`df.describe()`), y agrega los datos vía `groupby()`. |
| **Groq SDK (Llama 3.3 70B)** | Motor de IA ultrarrápido y gratuito. Genera sugerencias de gráficos estrictamente como JSON estructurado. |

### Despliegue
| Servicio | Plataforma |
|---|---|
| Frontend | Vercel |
| Backend API | Render.com |

---

## 🧠 Estrategia de Prompt Engineering

El éxito de la aplicación reside en el diseño del prompt (`backend/services/llm_service.py`):

1. **Rol de Experto:** Se instruye al modelo como un Analista de Datos senior.
2. **Data Profiling Injection:** En lugar de enviar todo el archivo (lo que quemaría tokens), se inyecta solo la esencia: nombres de columnas, tipos de dato, resumen estadístico y 3 filas de muestra.
3. **Restricción JSON con `response_format`:** Se usa `response_format={"type": "json_object"}` nativo de Groq para forzar que el LLM devuelva siempre un JSON válido, incluyendo `aggregation` (sum/mean/count) en cada parámetro.
4. **System vs User Prompt Split:** Se separa el contrato de formato (system prompt) del contexto de datos (user prompt) para máxima consistencia.
5. **Reglas Matemáticas Estrictas:** Se prohíbe explícitamente sumar/promediar columnas de texto o IDs únicos, garantizando que solo se sugieran gráficos analíticamente válidos.
6. **Resiliencia al Parseo:** En `api.py` se incluye sanitización con regex para eliminar bloques markdown, y un `try/except` por insight individual para que un gráfico fallido no arruine los demás.

---

## ⚙️ Configuración y Ejecución Local

### Prerrequisitos
- Python 3.10+
- Node.js 18+ y npm
- Una API Key de Groq (gratuita) → [console.groq.com](https://console.groq.com/)

### 1. Backend (Python)
```bash
cd AIDashboardBuilder/backend

# Crear entorno virtual
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
# Crear archivo .env en backend/ con:
# GROQ_API_KEY=tu_clave_de_groq_aqui

# Iniciar el servidor
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend (Next.js)
```bash
cd AIDashboardBuilder

# Instalar paquetes
npm install --legacy-peer-deps

# (Opcional) Crear .env.local con:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Iniciar desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Proyecto

```
AIDashboardBuilder/
├── app/
│   └── page.tsx                  # Página principal (SPA state machine)
├── components/dashboard/
│   ├── hero-section.tsx          # Hero con branding
│   ├── file-upload.tsx           # Drag-and-drop de archivos
│   ├── analysis-loading.tsx      # Estado de carga animado
│   ├── analysis-card.tsx         # Tarjetas de insight con mini-gráficos
│   ├── analysis-results.tsx      # Grid de tarjetas de análisis
│   └── dashboard-preview.tsx     # Dashboard interactivo con Recharts
├── backend/
│   ├── main.py                   # FastAPI app + CORS middleware
│   ├── routers/
│   │   └── api.py                # Endpoints: /upload y /chart-data
│   └── services/
│       ├── data_service.py       # Procesamiento Pandas (schema + summary)
│       └── llm_service.py        # Integración Groq (Llama 3.3)
└── README.md
```

---

## ✅ Cumplimiento de Requisitos

| Requisito | Estado |
|---|---|
| UI limpia, moderna e intuitiva (React SPA) | ✅ |
| Drag-and-drop que acepta `.xlsx` y `.csv` | ✅ |
| Estado de carga atractivo ("AI está analizando...") | ✅ |
| Tarjetas de Análisis con título, insight y botón "Add to Dashboard" | ✅ |
| Dashboard grid flexible con Recharts (Bar, Line, Pie, Area) | ✅ |
| Backend FastAPI con Pandas para procesar archivos | ✅ |
| Extracción de esquema con `df.describe()` y `df.dtypes` | ✅ |
| Prompt Engineering para LLM que devuelve JSON estructurado | ✅ |
| Respuesta JSON con: title, chartType, parameters, insight | ✅ |
| Segundo endpoint `/chart-data` para datos agregados | ✅ |
| Despliegue público (Vercel + Render) | ✅ |
| Exportación de Dashboard (JSON) | ✅ Bonus |
| Modal expandido interactivo al clickear un widget | ✅ Bonus |
| Validación de datasets inválidos (< 2 columnas, sin numéricos) | ✅ Bonus |

---

*¡Sube tu archivo y mira cómo la Inteligencia Artificial convierte tus datos crudos en historias visuales en un instante!* 📈
