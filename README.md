# 🇬🇧 App Inglés - Panel de Administración Web

Este repositorio contiene la versión web (panel de administración) de la aplicación educativa **App Inglés**. El proyecto ha sido diseñado para gestionar de manera fluida y centralizada el contenido de aprendizaje, permitiendo a los profesores y administradores configurar cursos, unidades, lecciones y ejercicios interactivos.

---

## 🎯 ¿Por qué este proyecto?

El propósito fundamental de este desarrollo es realizar la **conversión y migración de la aplicación móvil original** (desarrollada en React Native / Expo) a una **plataforma web optimizada utilizando Next.js**.

### Objetivos Clave:
* **Administración Centralizada**: Proveer una interfaz limpia y eficiente para la creación y edición de cursos, unidades y lecciones.
* **Gestión de Ejercicios Interactivos**: Configurar y validar los 11 tipos diferentes de ejercicios interactivos (tales como *Type Answer, Complete Word, Vocabulary, Write a Word, Say the Word, Image Gallery, Match the Names, Video Session, Speaking, Reading Quiz* y *Story Telling*).
* **Consistencia e Integridad de Datos**: Garantizar la integridad en operaciones críticas de base de datos, como el reordenamiento de lecciones dentro de unidades de forma atómica.

---

## 🛠️ Tecnologías y Stack Tecnológico

El proyecto está construido sobre un stack moderno, priorizando la velocidad de carga, la modularidad del código y la interactividad del usuario:

* **Next.js (App Router - React 18)**: Framework principal para el renderizado del lado del cliente (CSR) y servidor (SSR), con enrutamiento dinámico optimizado.
* **Supabase**: Backend-as-a-Service (BaaS) utilizado para:
  * **Autenticación**: Acceso seguro a través de correo electrónico y contraseña.
  * **Base de Datos PostgreSQL**: Almacenamiento relacional rápido y robusto.
  * **RPC (Remote Procedure Calls)**: Funciones en base de datos escritas en PL/pgSQL para realizar tareas complejas a nivel transaccional (ej: el sistema de ordenamiento atómico de lecciones).
* **Zustand**: Biblioteca de gestión de estado global ligera y escalable para almacenar los estados de los ejercicios y la autenticación del usuario.
* **React Query (@tanstack/react-query)**: Para la sincronización, actualización y almacenamiento en caché eficiente del estado del servidor.
* **TailwindCSS & PostCSS**: Framework de CSS utilitario para maquetar interfaces premium, responsivas y consistentes.
* **Lucide React**: Biblioteca de iconos vectoriales modernos y limpios.
* **TypeScript**: Tipado estricto en todo el proyecto para asegurar robustez, autocompletado y minimizar errores en tiempo de ejecución.

---

## 📁 Arquitectura del Proyecto

El código sigue una **Arquitectura Basada en Características (Feature-Based Architecture - FBA)** para asegurar la escalabilidad:

* `src/app/`: Capa de entrega (rutas físicas del App Router de Next.js).
* `src/features/`: Módulos encapsulados de negocio (e.g., `courses/`, `units/`, `classes/`, `exercises/`), conteniendo sus propios componentes, hooks de React Query, servicios de API y archivos de tipos.
* `src/components/ui/`: Componentes atómicos de UI transversales y reutilizables.
* `src/lib/`: Configuraciones de clientes globales compartidos (como el cliente de Supabase).

---

## 🚀 Configuración y Guía de Inicio

### Requisitos Previos
* Node.js (versión 18 o superior recomendada)
* npm o yarn

### Pasos para Ejecutar Localmente

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno**:
   Copia el archivo `.env.local.example` a `.env.local` en la raíz del proyecto y completa tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_KEY=tu_supabase_anon_key
   ```

3. **Iniciar Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---
