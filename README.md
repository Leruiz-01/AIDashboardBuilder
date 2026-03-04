# AI Dashboard Builder: Análisis al Instante 🚀

Bienvenido al "Creador de Dashboards con IA", una aplicación web innovadora que le permite a cualquier usuario convertirse en un analista de datos avanzado en segundos, sin necesidad de herramientas BI complejas.

## Visión del Proyecto
Innumerables profesionales tienen datos valiosos atrapados en hojas de cálculo, pero carecen del tiempo o la experiencia para explorarlos. Esta herramienta cierra esa brecha: simplemente sube un archivo `.csv` o `.xlsx`, y nuestra inteligencia artificial analizará los patrones, generará *insights* descriptivos, y sugerirá los mejores gráficos para visualizar la información, permitiéndote construir un dashboard interactivo al instante.

---

## 🏗️ Arquitectura y Decisiones Técnicas

El proyecto se diseñó utilizando una arquitectura Full-Stack moderna para garantizar velocidad, modularidad y una excelente Experiencia de Usuario (UX).

### 1. Frontend: React + Next.js (TypeScript)
- **Framework:** Next.js (App Router) fue elegido por su velocidad, su robusto ecosistema de React, y facilidad de integración.
- **Styling UI:** Tailwind CSS junto a **shadcn/ui** proveen componentes hermosos, accesibles y minimalistas sin inflar el tamaño final del *bundle*.
- **Gráficos Dinámicos:** **Recharts** fue integrado por su naturaleza declarativa en React, haciendo que la transición de "JSON a Gráfico Interactivo" sea fluida.
- **Estructura SPA:** Todo ocurre en una sola página (Single-Page Application). El paso del estado iterativo (Subida -> Carga Analítica -> Selección de Gráficos -> Visualización del Dashboard) se maneja en el cliente para evitar recargas frustrantes.

### 2. Backend: Python + FastAPI
- **Framework:** **FastAPI** fue seleccionado debido a su alto rendimiento, validación automática de datos vía Pydantic, y su soporte nativo para programación asíncrona, vital al esperar respuestas de la IA.
- **Procesamiento de Datos:** **Pandas** es el núcleo analítico. Lee los CSV/Excel, extrae el esquema (tipos de datos de columnas), genera los resúmenes estadísticos iniciales (`df.describe()`), y agrega los datos (groupby, sumatorias) en base a lo que el frontend necesita renderizar en el dashboard, evitando saturar la red enviando gigabytes de datos sin procesar al cliente.
- **Core de Inteligencia Artificial:** Integración oficial de **Google GenAI** (`gemini-2.5-flash`).

---

## 🧠 Estrategia de Prompt Engineering y la IA

El éxito diferencial de la aplicación reside en el *Prompt Engineering* diseñado y ubicado en `backend/services/llm_service.py`. 

Para evitar alucinaciones y forzar respuestas estrictamente funcionales, el prompt se diseñó bajo estos parámetros:
1. **Rol de Experto:** Se le instruye actuar como un Analista de Datos senior.
2. **Inyección de Perfilación de Datos:** En lugar de enviarle todo el archivo (lo cual quemaría tokens y lentificaría el sistema), se le inyecta solo el *alma* del dataset: Nombres de las columnas, tipos de datos pre-clasificados en grupos (numéricas, categóricas, texto), resumen estadístico y solo las 3 primeras filas de muestra.
3. **Restricción JSON Estricta:** Se le obliga a responder **estrictamente** con un Array de JSON siguiendo una interfaz rígida donde provee parámetros técnicos (xAxis, yAxis perfectamente emparejados con las columnas reales) y metadatos reflexivos (Título atrayente, el Insight explicativo sobre el negocio, un KPI destacado y la tendencia).
4. **Resiliencia al Parseo:** Se incluyó un mecanismo en el controlador (`api.py`) utilizando expresiones regulares (`re.sub`) para sanitizar y remover bloques de código *markdown* no deseados inyectados por la IA en algunos LLMs antes de decodificar el JSON.

---

## ⚙️ Configuración y Ejecución Local

Sigue estos pasos para arrancar el entorno en tu máquina local.

### Prerrequisitos
- Python 3.10+
- Node.js 18+ y npm
- Una API Key de Google Gemini [Obtener aquí](https://aistudio.google.com/)

### 1. Configurar el Backend (Python)
1. Abre una terminal y navega al directorio del backend:
   ```bash
   cd AIDashboardBuilder/backend
   ```
2. Crea un entorno virtual y actívalo:
   ```bash
   python -m venv venv
   # En Windows:
   .\venv\Scripts\activate
   # En Mac/Linux:
   source venv/bin/activate
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Configura tus variables de entorno. Crea un archivo `.env` en el directorio `backend/` e incluye tu API Key de Gemini:
   ```env
   GOOGLE_API_KEY=tu_clave_secreta_aqui
   ```
5. Inicia el servidor de FastAPI:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

### 2. Configurar el Frontend (Next.js)
1. Abre otra terminal paralela y dirígete a la raíz del proyecto web:
   ```bash
   cd AIDashboardBuilder
   ```
2. Instala los paquetes de React:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Crea un archivo `.env.local` en la raíz por si deseas mapear la URL de la API (opcional, por defecto es localhost):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Arranca el entorno de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para interactuar con la plataforma!

---

*¡Sube tu archivo y mira cómo la Inteligencia Artificial convierte tus datos crudos en historias visuales en un instante!* 📈
