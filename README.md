# 🧠 Abraham OS - Cloud AI Optimizer

**Abraham OS** es una plataforma de optimización de sistemas basada en la nube que utiliza Inteligencia Artificial (Google Gemini) para analizar el hardware real del usuario y ofrecer estrategias personalizadas de rendimiento.

Este proyecto está diseñado para estudiantes y entusiastas que buscan entender mejor su hardware y aplicar optimizaciones precisas mediante un entorno web moderno.

## 🚀 Características Principales

* **Detección de Hardware Real:** Mediante un script de PowerShell, el sistema extrae detalles específicos de CPU, GPU y RAM.
* **Cerebro de IA (Gemini 1.5 Flash):** Análisis avanzado de componentes para sugerir configuraciones de software y mejoras de rendimiento.
* **Persistencia en la Nube:** Registro de usuarios y guardado de perfiles de optimización en **MongoDB Atlas**.
* **Arquitectura Desacoplada:** Backend robusto en Flask (Python) y Frontend reactivo en HTML/JS moderno.
* **Acceso Público:** Desplegado en **Render**, accesible desde cualquier lugar.

## 🛠️ Tecnologías Utilizadas

* **Backend:** Python 3, Flask, Gunicorn, Flask-CORS, PyMongo.
* **Frontend:** HTML5, CSS3 (Variables modernas), JavaScript (ES6+), Marked.js.
* **Base de Datos:** MongoDB Atlas (NoSQL).
* **IA:** Google Gemini API.
* **Scripting:** PowerShell Core.
* **Infraestructura:** Render (Web Service & Static Site).

## 📋 Requisitos Previos

1.  **Sistema Operativo:** Windows (para ejecutar el script de extracción de hardware).
2.  **Cuenta en MongoDB Atlas:** Para obtener tu cadena de conexión `MONGO_URI`.
3.  **Google AI Studio:** Para obtener tu `GEMINI_API_KEY`.

## 📖 Modo de Uso

### 1. Preparación del Sistema
Antes de usar la plataforma, debes obtener la información de tu PC:
1.  Descarga el archivo `get_system_info.ps1`.
2.  Ejecútalo en tu terminal (PowerShell). Esto generará el archivo `system_context.json`.

### 2. Registro e Inicio de Sesión
1.  Entra a la URL de tu sitio estático en Render.
2.  Crea una cuenta nueva o inicia sesión.

### 3. Sincronización de Hardware
1.  Ve a la pestaña **🖥️ Hardware**.
2.  Haz clic en **📂 Subir system_context.json** y selecciona el archivo generado.

### 4. Consulta con la IA
1.  Ve a la pestaña **🧠 IA**.
2.  Escribe una consulta técnica y Abraham analizará tu hardware para responderte.
