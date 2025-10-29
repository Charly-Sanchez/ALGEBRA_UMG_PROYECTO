# 🧮 Calculadora de Álgebra Lineal - Determinantes y Sistemas de Ecuaciones

Una calculadora web interactiva y didáctica para calcular determinantes y resolver sistemas de ecuaciones lineales usando métodos algebraicos avanzados con visualización paso a paso.

## 📋 ¿De qué trata este proyecto?

Esta aplicación web permite calcular determinantes de matrices y resolver sistemas de ecuaciones lineales de forma visual e interactiva, mostrando cada paso del proceso con animaciones detalladas y explicaciones claras.

### ✨ Características principales:

- **🎯 Dos Modos de Operación:**
  - **Cálculo de Determinantes**: Matrices de 2×2 hasta 6×6
  - **Resolución de Sistemas de Ecuaciones**: Sistemas lineales Ax = b

- **📐 Métodos Implementados:**
  - **Gauss-Jordan**: 
    - Para determinantes con eliminación optimizada
    - Para sistemas de ecuaciones con eliminación completa
  - **Expansión de LaPlace**: 
    - Desarrollo por cofactores con selección automática de fila/columna óptima
    - Visualización de matrices menores con tachado de filas/columnas
    - Fórmula de expansión con valores calculados

- **🎬 Visualización Didáctica:**
  - Paso a paso con animaciones suaves
  - Control de velocidad de reproducción (0.5x a 2x)
  - Visualización de elementos pivote y operaciones
  - Matrices menores mostradas con exclusiones visuales
  - Desarrollo completo de cálculos en LaPlace

- **🔢 Precisión Matemática:**
  - Cálculos con fracciones exactas (clase Fraction)
  - Sin errores de redondeo de punto flotante
  - Conversión automática a decimales cuando sea necesario
  - Simplificación automática de fracciones

- **🎨 Interfaz Moderna:**
  - Diseño dark theme con acentos dorados
  - Responsive para desktop y móvil
  - Inputs sin flechas spinner para mejor UX
  - Inputs vacíos por defecto (no muestra ceros)

- **🧠 Características Educativas:**
  - **LaPlace optimizado**: Selecciona automáticamente la fila/columna con más ceros
  - **Visualización de matrices menores**: Muestra qué elementos se excluyen
  - **Fórmula de expansión completa**: Con valores calculados en lugar de notación simbólica
  - **Desarrollo paso a paso del cálculo**: Muestra cada multiplicación y suma
  - **Detección de casos especiales**: Sin solución o infinitas soluciones

## 🚀 Cómo descargar e instalar

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos de instalación:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Charly-Sanchez/ALGEBRA_UMG_PROYECTO.git
   cd ALGEBRA_UMG_PROYECTO
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   - La aplicación estará disponible en: `http://localhost:5173` (o el puerto que muestre la terminal)

### Comandos disponibles:

```bash
# Modo desarrollo con hot reload
npm run dev

# Compilar para producción
npm run build

# Vista previa de la versión de producción
npm run preview

# Verificar errores de linting
npm run lint
```

## 📖 Guía de Uso

### Modo: Cálculo de Determinantes

1. **Selecciona "Determinante"** en el header superior
2. **Elige el método**: Gauss-Jordan o LaPlace
3. **Selecciona el tamaño** de la matriz (2×2 a 6×6)
4. **Ingresa los valores** de la matriz (o usa "Ejemplo Aleatorio")
5. **Click en "Calcular Determinante"**
6. **Observa los pasos** con la animación o navega manualmente
7. **Revisa el resultado** con la fórmula de expansión (en LaPlace)

**Características especiales de LaPlace:**
- Selección automática de la fila/columna con más ceros para optimizar el cálculo
- Visualización de matrices menores con elementos tachados en rojo
- Fórmula de expansión mostrando valores calculados: `det = (3) × (-22) - (0) × (14) + (2) × (47)`
- Desarrollo paso a paso del cálculo completo

### Modo: Sistema de Ecuaciones

1. **Selecciona "Sistema de Ecuaciones"** en el header
2. El método se fija automáticamente en **Gauss-Jordan**
3. **Selecciona el tamaño** del sistema (número de ecuaciones/incógnitas)
4. **Ingresa la matriz de coeficientes** (A)
5. **Ingresa el vector de términos independientes** (b)
6. **Click en "Resolver Sistema"**
7. **Observa la eliminación gaussiana** paso a paso
8. **Obtén la solución** con valores exactos en fracciones y aproximaciones decimales

**El sistema detecta:**
- ✅ Solución única: Muestra x₁, x₂, x₃... con valores exactos
- ❌ Sin solución: Sistema inconsistente
- ⚠️ Infinitas soluciones: Ecuaciones dependientes

## 🎓 Uso educativo

Este proyecto está diseñado para estudiantes y profesores de álgebra lineal que deseen:

### Para Determinantes (LaPlace):
- 🔍 Visualizar cómo se selecciona la fila/columna óptima (con más ceros)
- 📊 Entender el concepto de matrices menores y cofactores
- 🧮 Ver la fórmula de expansión completa con valores reales
- ✏️ Seguir el desarrollo matemático paso a paso
- 💡 Comprender por qué ciertos desarrollos son más eficientes

### Para Sistemas de Ecuaciones (Gauss-Jordan):
- 👀 Observar el proceso de eliminación gaussiana
- 🔄 Entender el pivoteo parcial y su importancia
- ➕ Seguir cada operación elemental de fila
- 📐 Ver la transformación a forma escalonada reducida
- ✅ Verificar la solución con fracciones exactas

### Ventajas Pedagógicas:
- **Animaciones controlables**: Pausa, adelanta o retrocede en cualquier momento
- **Velocidad ajustable**: Desde 0.5× hasta 2× para adaptarse a tu ritmo
- **Fracciones exactas**: Sin errores de redondeo para resultados precisos
- **Explicaciones detalladas**: Cada paso incluye descripción de la operación
- **Casos especiales**: Aprende a identificar sistemas sin solución o con infinitas soluciones

## 🛠️ Tecnologías utilizadas

### Frontend
- **React 18** con TypeScript - Framework principal
- **Vite** - Build tool y dev server rápido
- **Framer Motion** - Librería de animaciones fluidas
- **Lucide React** - Iconografía moderna

### Matemáticas
- **Clase Fraction** - Aritmética exacta con fracciones
- **MatrixMath** - Operaciones matriciales optimizadas
- **LaplaceExpansion** - Algoritmo recursivo con optimización
- **GaussJordan** - Eliminación con pivoteo parcial

### Estilos
- **CSS Variables** - Sistema de temas personalizables
- **Flexbox & Grid** - Layouts responsivos
- **CSS Animations** - Transiciones suaves

### Estructura del Proyecto
```
src/
├── components/          # Componentes React
│   ├── MatrixInput.tsx        # Input de matrices
│   ├── StepsVisualizer.tsx    # Visualización de pasos
│   ├── AnimationControls.tsx  # Controles de animación
│   └── FractionDisplay.tsx    # Display de fracciones
├── utils/              # Lógica matemática
│   ├── fraction.ts            # Clase Fraction
│   ├── matrixMath.ts          # Operaciones matriciales
│   ├── laplaceExpansion.ts    # Algoritmo LaPlace (decimal)
│   ├── laplaceExpansionFractions.ts  # LaPlace (fracciones)
│   ├── gaussJordanDeterminant.ts     # Gauss-Jordan para det
│   └── gaussJordanFractions.ts       # Gauss-Jordan para sistemas
├── types/              # Definiciones TypeScript
│   └── matrix.ts       # Tipos e interfaces
└── App.tsx             # Componente principal
```

## 🌟 Características Técnicas Destacadas

### Optimizaciones de LaPlace
- **Selección inteligente**: Detecta automáticamente la fila/columna con más ceros
- **Recursión eficiente**: Reduce complejidad usando cofactores cero
- **Caché de menores**: Evita recalcular matrices menores

### Precisión Matemática
- **Fracciones exactas**: Clase `Fraction` con GCD y simplificación automática
- **Sin pérdida de precisión**: Todas las operaciones en fracciones
- **Conversión controlada**: A decimales solo cuando el usuario lo necesita

### Experiencia de Usuario
- **Responsive design**: Funciona en móviles, tablets y desktop
- **Inputs intuitivos**: Sin spinner arrows, placeholder vacíos
- **Animaciones performantes**: 60 FPS con hardware acceleration
- **Estados claros**: Loading, error, success bien diferenciados

## 📝 Ejemplos de Uso

### Ejemplo 1: Determinante 3×3 por LaPlace
```
Matriz:
[ 5  -2   4 ]
[ 6   7  -3 ]
[ 3   0   2 ]

Resultado: det = 28
Fórmula: det = (3) × (-22) - (0) × (14) + (2) × (47)
Desarrollo: det = -66 + 0 + 94 = 28
```

### Ejemplo 2: Sistema 3×3 por Gauss-Jordan
```
Sistema:
2x₁ + 3x₂ - x₃ = 5
4x₁ - x₂ + 2x₃ = 6
-2x₁ + 2x₂ + 3x₃ = 4

Solución:
x₁ = 1
x₂ = 1
x₃ = 2
```

---

## 🤝 Contribuciones

¿Quieres mejorar el proyecto? ¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Ideas para Contribuir:
- 🌐 Agregar más idiomas (internacionalización)
- 📊 Exportar resultados a PDF o LaTeX
- 🎯 Más métodos numéricos (LU, QR, SVD)
- 🎨 Más temas de colores
- 📱 Mejorar la experiencia móvil
- 🧪 Agregar más tests unitarios

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Carlos Sánchez** - *Desarrollo inicial* - [Charly-Sanchez](https://github.com/Charly-Sanchez)

## 🙏 Agradecimientos

- Profesores y estudiantes de Álgebra Lineal de la UMG
- Comunidad de React y TypeScript
- Todos los que contribuyeron con feedback y sugerencias

---

💡 **Tip:** Comienza con matrices pequeñas (2×2 o 3×3) para familiarizarte con la interfaz antes de probar sistemas más grandes.

## 📚 Documentación

El proyecto incluye documentación completa y profesional:

### 📖 [Manual de Usuario](docs/manual-usuario.html)
Guía completa para usuarios finales que incluye:
- Funcionalidades principales de la aplicación
- Guía paso a paso para cada modo de cálculo
- Ejemplos prácticos resueltos
- Preguntas frecuentes (FAQ)
- Consejos de uso y mejores prácticas

### 🔧 [Documentación Técnica](docs/documentacion-tecnica.html)
Documentación para desarrolladores y colaboradores:
- Arquitectura del sistema y principios de diseño
- Documentación completa de componentes React
- API reference de todas las utilidades matemáticas
- Algoritmos implementados con complejidad computacional
- Guía de instalación y configuración de desarrollo
- Estructura del proyecto y convenciones de código

### � Acceso a la Documentación

Para ver la documentación, simplemente abre los archivos HTML en tu navegador:

```bash
# Manual de Usuario
open docs/manual-usuario.html

# Documentación Técnica
open docs/documentacion-tecnica.html
```

O desde el directorio del proyecto:
- **Manual de Usuario**: `./docs/manual-usuario.html`
- **Documentación Técnica**: `./docs/documentacion-tecnica.html`

La documentación incluye:
- ✨ Diseño profesional y responsive
- 🔍 Búsqueda integrada (solo en docs técnicas)
- 📋 Tabla de contenidos flotante
- 💻 Resaltado de sintaxis para código
- 📱 Navegación adaptable para móviles
- 🎨 Temas visuales consistentes con la aplicación

�📚 **Recursos Educativos:** Este proyecto es ideal para complementar cursos de Álgebra Lineal y Métodos Numéricos.

⭐ **Si te gusta el proyecto, dale una estrella en GitHub!**

---

**Universidad Mariano Gálvez de Guatemala - Facultad de Ingeniería en Sistemas**
*Álgebra Lineal - Ciclo II 2025*
