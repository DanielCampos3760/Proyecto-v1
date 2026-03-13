# 🧠 Abraham OS - Cloud AI Optimizer

**Abraham OS** es una plataforma de optimización de sistemas basada en la nube que utiliza Inteligencia Artificial (Google Gemini) para analizar el hardware real del usuario y ofrecer estrategias personalizadas de rendimiento.

Este proyecto está diseñado para estudiantes y entusiastas que buscan entender mejor su hardware y aplicar optimizaciones precisas mediante un entorno web moderno.

## 🚀 Características Principales

* **Detección de Hardware Real:** Mediante un script de PowerShell, el sistema extrae detalles específicos de CPU, GPU y RAM.
* [cite_start]**Cerebro de IA (Gemini 1.5 Flash):** Análisis avanzado de componentes para sugerir configuraciones de software y mejoras de rendimiento[cite: 2].
* [cite_start]**Persistencia en la Nube:** Registro de usuarios y guardado de perfiles de optimización en **MongoDB Atlas**[cite: 2].
* [cite_start]**Arquitectura Desacoplada:** Backend robusto en Flask (Python) y Frontend reactivo en HTML/JS moderno[cite: 2].
* [cite_start]**Acceso Público:** Desplegado en **Render**, accesible desde cualquier lugar[cite: 2].

## 🛠️ Tecnologías Utilizadas

* [cite_start]**Backend:** Python 3, Flask, Gunicorn, Flask-CORS, PyMongo[cite: 2].
* **Frontend:** HTML5, CSS3 (Variables modernas), JavaScript (ES6+), Marked.js (para renderizado Markdown).
* [cite_start]**Base de Datos:** MongoDB Atlas (NoSQL)[cite: 2].
* [cite_start]**IA:** Google Gemini API[cite: 1, 2].
* **Scripting:** PowerShell Core.
* [cite_start]**Infraestructura:** Render (Web Service & Static Site)[cite: 2, 3].

## 📋 Requisitos Previos

1.  **Sistema Operativo:** Windows (para ejecutar el script de extracción de hardware).
2.  [cite_start]**Cuenta en MongoDB Atlas:** Para obtener tu cadena de conexión `MONGO_URI`[cite: 1].
3.  [cite_start]**Google AI Studio:** Para obtener tu `GEMINI_API_KEY`[cite: 1].

## 📖 Modo de Uso

### 1. Preparación del Sistema
Antes de usar la plataforma, debes obtener la información de tu PC:
1. Descarga el archivo `get_system_info.ps1`.
2. Ejecútalo en tu terminal (PowerShell). Esto generará un archivo llamado `system_context.json` en la misma carpeta.

### 2. Registro e Inicio de Sesión
1. Entra a la URL de la aplicación: `https://tu-app-web.onrender.com`.
2. [cite_start]Crea una cuenta nueva o inicia sesión[cite: 2].

### 3. Sincronización de Hardware
1. Ve a la pestaña **🖥️ Hardware**.
2. Haz clic en **📂 Subir system_context.json**.
3. Selecciona el archivo generado previamente. Tus datos ahora están en la nube.

### 4. Consulta con la IA
1. Ve a la pestaña **🧠 IA**.
2. Escribe una consulta como: *"¿Cómo puedo optimizar mi RAM para gaming?"* o *"Dame una configuración de streaming para mi GPU"*.
3. [cite_start]Abraham analizará tu hardware guardado y te dará una respuesta técnica detallada[cite: 2].

## 🛠️ Instalación Local (Desarrollo)

Si deseas ejecutar este proyecto localmente:

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/tu-usuario/abraham-os.git](https://github.com/tu-usuario/abraham-os.git)
