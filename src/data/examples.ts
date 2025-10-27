import type { Matrix, Vector } from '../types/matrix';

/**
 * Ejemplos predefinidos de sistemas de ecuaciones para demostración
 */
export interface ExampleSystem {
  id: string;
  name: string;
  description: string;
  size: number;
  coefficientMatrix: Matrix;
  constantVector: Vector;
  expectedSolution?: Vector;
  solutionType: 'unique' | 'infinite' | 'none';
}

export const EXAMPLE_SYSTEMS: ExampleSystem[] = [
  {
    id: 'simple-2x2',
    name: 'Sistema 2×2 Simple',
    description: 'Un sistema básico 2×2 con solución única',
    size: 2,
    coefficientMatrix: [
      [2, 1],
      [1, 3]
    ],
    constantVector: [8, 13],
    expectedSolution: [1, 4],
    solutionType: 'unique'
  },
  {
    id: 'fractions-2x2',
    name: 'Sistema 2×2 con Fracciones',
    description: 'Sistema que produce soluciones fraccionarias exactas',
    size: 2,
    coefficientMatrix: [
      [3, 2],
      [1, 4]
    ],
    constantVector: [7, 9],
    expectedSolution: [1, 2], // x = 1, y = 2
    solutionType: 'unique'
  },
  {
    id: 'fractions-3x3',
    name: 'Sistema 3×3 con Fracciones',
    description: 'Sistema 3×3 que muestra fracciones en el proceso',
    size: 3,
    coefficientMatrix: [
      [1, 2, 1],
      [2, 1, 3],
      [3, 1, 2]
    ],
    constantVector: [6, 11, 13],
    expectedSolution: [1, 2, 1], // x₁=1, x₂=2, x₃=1
    solutionType: 'unique'
  },
  {
    id: 'classic-3x3',
    name: 'Sistema 3×3 Clásico',
    description: 'Un sistema 3×3 típico para practicar',
    size: 3,
    coefficientMatrix: [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2]
    ],
    constantVector: [8, -11, -3],
    expectedSolution: [2, 3, -1],
    solutionType: 'unique'
  },
  {
    id: 'diagonal-3x3',
    name: 'Matriz Diagonal 3×3',
    description: 'Sistema con matriz diagonal (fácil de resolver)',
    size: 3,
    coefficientMatrix: [
      [3, 0, 0],
      [0, 2, 0],
      [0, 0, -1]
    ],
    constantVector: [6, 8, 3],
    expectedSolution: [2, 4, -3],
    solutionType: 'unique'
  },
  {
    id: 'triangular-3x3',
    name: 'Matriz Triangular Superior',
    description: 'Sistema ya en forma triangular superior',
    size: 3,
    coefficientMatrix: [
      [1, 2, 3],
      [0, 1, 4],
      [0, 0, 1]
    ],
    constantVector: [6, 5, 1],
    expectedSolution: [1, 1, 1],
    solutionType: 'unique'
  },
  {
    id: 'singular-2x2',
    name: 'Sistema Singular 2×2',
    description: 'Sistema sin solución única (determinante = 0)',
    size: 2,
    coefficientMatrix: [
      [1, 2],
      [2, 4]
    ],
    constantVector: [3, 6],
    solutionType: 'infinite'
  },
  {
    id: 'inconsistent-2x2',
    name: 'Sistema Inconsistente',
    description: 'Sistema sin solución (inconsistente)',
    size: 2,
    coefficientMatrix: [
      [1, 2],
      [2, 4]
    ],
    constantVector: [3, 7],
    solutionType: 'none'
  },
  {
    id: 'large-4x4',
    name: 'Sistema 4×4',
    description: 'Sistema más grande para práctica avanzada',
    size: 4,
    coefficientMatrix: [
      [1, 2, 1, -1],
      [2, 1, -1, 1],
      [1, -1, 2, 1],
      [-1, 1, 1, 2]
    ],
    constantVector: [4, 2, 6, 3],
    expectedSolution: [1, 0, 2, -1],
    solutionType: 'unique'
  }
];

/**
 * Obtiene un ejemplo aleatorio del tamaño especificado
 */
export function getRandomExample(size?: number): ExampleSystem {
  const filteredExamples = size 
    ? EXAMPLE_SYSTEMS.filter(ex => ex.size === size)
    : EXAMPLE_SYSTEMS;
    
  if (filteredExamples.length === 0) {
    // Generar ejemplo aleatorio si no hay ejemplos del tamaño solicitado
    return generateRandomExample(size || 3);
  }
  
  const randomIndex = Math.floor(Math.random() * filteredExamples.length);
  return filteredExamples[randomIndex];
}

/**
 * Genera un ejemplo aleatorio del tamaño especificado
 */
export function generateRandomExample(size: number): ExampleSystem {
  const coefficientMatrix: Matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.floor(Math.random() * 10) - 5)
  );
  
  const constantVector: Vector = Array.from({ length: size }, () =>
    Math.floor(Math.random() * 20) - 10
  );
  
  return {
    id: `random-${size}x${size}`,
    name: `Sistema Aleatorio ${size}×${size}`,
    description: 'Sistema generado aleatoriamente',
    size,
    coefficientMatrix,
    constantVector,
    solutionType: 'unique' // Asumimos que es único hasta que se calcule
  };
}

/**
 * Genera un ejemplo con solución conocida
 */
export function generateExampleWithKnownSolution(size: number, solution: Vector): ExampleSystem {
  // Generar matriz de coeficientes aleatoria (evitar singularidad)
  let coefficientMatrix: Matrix;
  
  do {
    coefficientMatrix = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.floor(Math.random() * 6) - 3)
    );
  } while (isDiagonal(coefficientMatrix) || hasZeroRow(coefficientMatrix));
  
  // Calcular el vector de constantes: b = A * x
  const constantVector: Vector = coefficientMatrix.map(row =>
    row.reduce((sum, coeff, j) => sum + coeff * solution[j], 0)
  );
  
  return {
    id: `known-solution-${size}x${size}`,
    name: `Sistema con Solución Conocida ${size}×${size}`,
    description: `Sistema construido con solución conocida: [${solution.join(', ')}]`,
    size,
    coefficientMatrix,
    constantVector,
    expectedSolution: solution,
    solutionType: 'unique'
  };
}

/**
 * Verifica si una matriz es diagonal
 */
function isDiagonal(matrix: Matrix): boolean {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && matrix[i][j] !== 0) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Verifica si una matriz tiene alguna fila de ceros
 */
function hasZeroRow(matrix: Matrix): boolean {
  return matrix.some(row => row.every(val => val === 0));
}