# Guía de Estructura y Reglas para Agentes (AGENTS.md)

Este documento define la arquitectura y las buenas prácticas que deben seguir todos los desarrolladores y agentes de inteligencia artificial al trabajar en este proyecto.

---

## 🏗️ Arquitectura Basada en Características (Feature-Based Architecture - FBA)

Para facilitar la escalabilidad, modularidad y mantenibilidad del proyecto en Next.js, implementamos **FBA (Feature-Based Architecture)**. Todo el código de negocio se organiza en torno a "características" de negocio, evitando directorios técnicos globales de gran tamaño.

### 📁 Estructura del Directorio `src/`

```
src/
├── app/                      # Capa de Entrega: Rutas físicas de Next.js (App Router)
│   ├── (admin)/              # Rutas agrupadas del panel administrativo
│   │   ├── dashboard/        # Ruta /dashboard
│   │   └── courses/          # Rutas /courses y anidadas
│   ├── layout.tsx            # Layout raíz
│   └── page.tsx              # Pantalla de Login (Ruta raíz /)
│
├── features/                 # Módulos de Características de Negocio (Features)
│   ├── courses/              # Feature de Cursos / Clases del Profesor
│   │   ├── components/       # Componentes exclusivos de esta característica
│   │   ├── hooks/            # React Query queries o mutations de la feature
│   │   ├── services/         # Llamadas API, base de datos o lógica de negocio
│   │   ├── courses.types.ts  # Interfaces y tipos específicos del módulo
│   │   └── index.ts          # API pública de exportación de la feature
│   │
│   ├── units/                # Feature de Unidades didácticas
│   ├── classes/              # Feature de Lecciones del aula
│   └── exercises/            # Feature de configuración de Ejercicios interactivos
│
├── components/               # Componentes Compartidos Globales
│   ├── navigation/           # Barras laterales y menús transversales (AdminNav.tsx)
│   └── ui/                   # Componentes UI atómicos reutilizables (Button.tsx, FormInput.tsx)
│
├── lib/                      # Configuraciones y clientes compartidos (supabase.ts)
├── services/                 # Servicios globales transversales (auth.service.ts)
├── store/                    # Manejo de estado global en cliente (Zustand: useAuthStore.ts)
└── types/                    # Tipos de datos globales del proyecto
```

---

## 🎯 Reglas Clave de Desarrollo

### 1. Encapsulación y Módulos Autónomos

* Todo archivo (componente, hook, tipo o constante) que sea exclusivo de una feature **debe vivir dentro de la carpeta de esa feature** en `src/features/[featureName]/`.
* Si un componente o lógica comienza a ser requerido por **dos o más features independientes**, debe ser promovido al directorio global correspondiente (ej: `src/components/ui/` o `src/store/`).

### 2. Capa de Rutas Limpia (`src/app/`)

* Los archivos dentro de `src/app/` deben actuar únicamente como contenedores o "páginas de enlace".
* Deben importar el componente principal de la feature desde `src/features/` y renderizarlo pasándole los parámetros dinámicos necesarios (como `courseId`, `unitId`, etc.) recuperados de los parámetros de ruta de Next.js.
* **No debe escribirse lógica pesada de formularios o maquetación compleja dentro de `src/app/page.tsx` o subcarpetas**. La lógica pertenece a la feature correspondiente.

### 3. Importaciones Absolutas

* Siempre utiliza alias de importación absolutos definidos en el tsconfig para mayor legibilidad:
  * Componentes UI: `import Button from "@/components/ui/Button"`
  * Características: `import CoursesPage from "@/features/courses/CoursesPage"`
  * Servicios: `import { getSession } from "@/services/auth.service"`

### 4. Consistencia Visual (Claro / Oscuro)

* Respeta el nuevo **Tema Claro Premium** definido en [.cursorrules] en la raiz del proyecto.
* Utiliza el fondo crema `#fffcf2` (`bg-[#fffcf2]`) y tarjetas blancas con bordes finos.
* Usa siempre el componente unificado `Button` para todas las acciones de botón del sistema.

### 5. Edicion de archivos

Para ahorrar tokens debemos de realizar edicion de archivos optimizada:

* agregando
* borrando
* editando

solo las lineas necesarias en los archivos
