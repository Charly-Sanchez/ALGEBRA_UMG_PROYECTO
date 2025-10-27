import type { Matrix, Vector, CalculationStep, Solution } from '../types/matrix';
import { MatrixMath } from './matrixMath';

export class GaussianElimination {
  
  /**
   * Resuelve un sistema de ecuaciones lineales usando eliminación gaussiana
   */
  static solve(coefficientMatrix: Matrix, constantVector: Vector): {
    steps: CalculationStep[];
    solution: Solution;
  } {
    const steps: CalculationStep[] = [];
    const n = coefficientMatrix.length;
    
    // Crear matriz aumentada
    let augmentedMatrix = MatrixMath.createAugmentedMatrix(coefficientMatrix, constantVector);
    let currentConstants = MatrixMath.cloneVector(constantVector);
    
    steps.push({
      id: 1,
      title: 'Matriz Aumentada Inicial',
      description: 'Sistema de ecuaciones representado como matriz aumentada [A|b]',
      matrix: MatrixMath.cloneMatrix(augmentedMatrix),
      operation: 'Configuración inicial'
    });

    // Fase de eliminación hacia adelante
    let stepCounter = 2;
    
    for (let i = 0; i < n - 1; i++) {
      // Buscar el mejor pivote (pivoteo parcial)
      const pivotRow = MatrixMath.findPivot(augmentedMatrix, i, i);
      
      if (Math.abs(augmentedMatrix[pivotRow][i]) < 1e-10) {
        // El sistema puede no tener solución única
        continue;
      }
      
      // Intercambiar filas si es necesario
      if (pivotRow !== i) {
        augmentedMatrix = MatrixMath.swapRows(augmentedMatrix, i, pivotRow);
        currentConstants = MatrixMath.swapVectorElements(currentConstants, i, pivotRow);
        
        steps.push({
          id: stepCounter++,
          title: `Intercambio de Filas`,
          description: `Intercambiamos la fila ${i + 1} con la fila ${pivotRow + 1} para obtener el mejor pivote`,
          matrix: MatrixMath.cloneMatrix(augmentedMatrix),
          operation: `R${i + 1} ↔ R${pivotRow + 1}`,
          rowIndex: i,
          pivotElement: augmentedMatrix[i][i]
        });
      }
      
      // Eliminar elementos debajo del pivote
      for (let j = i + 1; j < n; j++) {
        const factor = -augmentedMatrix[j][i] / augmentedMatrix[i][i];
        
        if (Math.abs(factor) > 1e-10) {
          // Aplicar operación de fila
          for (let k = 0; k < n + 1; k++) {
            augmentedMatrix[j][k] += factor * augmentedMatrix[i][k];
          }
          
          steps.push({
            id: stepCounter++,
            title: `Eliminación Gaussiana - Paso ${i + 1}.${j - i}`,
            description: `Eliminamos el elemento en la posición (${j + 1}, ${i + 1}) usando R${j + 1} = R${j + 1} + (${MatrixMath.formatNumber(factor, 4)}) × R${i + 1}`,
            matrix: MatrixMath.cloneMatrix(augmentedMatrix),
            operation: `R${j + 1} = R${j + 1} + (${MatrixMath.formatNumber(factor, 4)}) × R${i + 1}`,
            rowIndex: j,
            pivotElement: augmentedMatrix[i][i]
          });
        }
      }
    }

    // Verificar si el sistema tiene solución
    const solution = this.backSubstitution(augmentedMatrix, steps, stepCounter);
    
    return { steps, solution };
  }

  /**
   * Realiza la sustitución hacia atrás para encontrar la solución
   */
  private static backSubstitution(
    augmentedMatrix: Matrix,
    steps: CalculationStep[],
    stepCounter: number
  ): Solution {
    const n = augmentedMatrix.length;
    const variables: number[] = new Array(n).fill(0);
    
    // Verificar inconsistencias
    for (let i = 0; i < n; i++) {
      let allZeros = true;
      for (let j = 0; j < n; j++) {
        if (Math.abs(augmentedMatrix[i][j]) > 1e-10) {
          allZeros = false;
          break;
        }
      }
      
      if (allZeros && Math.abs(augmentedMatrix[i][n]) > 1e-10) {
        steps.push({
          id: stepCounter,
          title: 'Sistema Inconsistente',
          description: `La fila ${i + 1} tiene la forma [0 0 ... 0 | b] donde b ≠ 0, por lo que el sistema no tiene solución`,
          matrix: MatrixMath.cloneMatrix(augmentedMatrix),
          operation: 'Sistema sin solución'
        });
        
        return {
          variables: [],
          isUnique: false,
          hasInfiniteSolutions: false,
          hasNoSolution: true
        };
      }
    }

    // Verificar si hay variables libres
    let rank = 0;
    for (let i = 0; i < n; i++) {
      let hasNonZero = false;
      for (let j = 0; j < n; j++) {
        if (Math.abs(augmentedMatrix[i][j]) > 1e-10) {
          hasNonZero = true;
          break;
        }
      }
      if (hasNonZero) rank++;
    }

    if (rank < n) {
      steps.push({
        id: stepCounter,
        title: 'Sistema con Infinitas Soluciones',
        description: `El rango de la matriz es ${rank} < ${n}, por lo que el sistema tiene infinitas soluciones`,
        matrix: MatrixMath.cloneMatrix(augmentedMatrix),
        operation: 'Infinitas soluciones'
      });
      
      return {
        variables: [],
        isUnique: false,
        hasInfiniteSolutions: true,
        hasNoSolution: false
      };
    }

    // Sustitución hacia atrás
    steps.push({
      id: stepCounter++,
      title: 'Sustitución Hacia Atrás',
      description: 'Comenzamos resolviendo desde la última ecuación hacia la primera',
      matrix: MatrixMath.cloneMatrix(augmentedMatrix),
      operation: 'Inicio de sustitución hacia atrás'
    });

    for (let i = n - 1; i >= 0; i--) {
      let sum = augmentedMatrix[i][n]; // Término independiente
      
      // Restar los términos ya conocidos
      for (let j = i + 1; j < n; j++) {
        sum -= augmentedMatrix[i][j] * variables[j];
      }
      
      // Calcular la variable
      variables[i] = sum / augmentedMatrix[i][i];
      
      steps.push({
        id: stepCounter++,
        title: `Cálculo de x${i + 1}`,
        description: `x${i + 1} = (${MatrixMath.formatNumber(augmentedMatrix[i][n], 4)}${this.formatSubtractionTerms(augmentedMatrix[i], variables, i)}) / ${MatrixMath.formatNumber(augmentedMatrix[i][i], 4)} = ${MatrixMath.formatNumber(variables[i], 4)}`,
        matrix: MatrixMath.cloneMatrix(augmentedMatrix),
        operation: `x${i + 1} = ${MatrixMath.formatNumber(variables[i], 4)}`
      });
    }

    return {
      variables,
      isUnique: true,
      hasInfiniteSolutions: false,
      hasNoSolution: false
    };
  }

  /**
   * Formatea los términos de sustracción para la visualización
   */
  private static formatSubtractionTerms(
    row: number[],
    variables: number[],
    currentIndex: number
  ): string {
    let terms = '';
    
    for (let j = currentIndex + 1; j < variables.length; j++) {
      if (Math.abs(row[j]) > 1e-10) {
        const coefficient = MatrixMath.formatNumber(row[j], 4);
        const variable = MatrixMath.formatNumber(variables[j], 4);
        terms += ` - (${coefficient})(${variable})`;
      }
    }
    
    return terms;
  }

  /**
   * Calcula el determinante usando eliminación gaussiana
   */
  static calculateDeterminant(matrix: Matrix): {
    steps: CalculationStep[];
    determinant: number;
  } {
    const steps: CalculationStep[] = [];
    const n = matrix.length;
    let workingMatrix = MatrixMath.cloneMatrix(matrix);
    let swapCount = 0;
    let stepCounter = 1;

    steps.push({
      id: stepCounter++,
      title: 'Matriz Original',
      description: 'Calculamos el determinante usando eliminación gaussiana',
      matrix: MatrixMath.cloneMatrix(workingMatrix),
      operation: 'det(A) = ?'
    });

    // Eliminar hacia adelante
    for (let i = 0; i < n - 1; i++) {
      // Encontrar pivote
      const pivotRow = MatrixMath.findPivot(workingMatrix, i, i);
      
      if (Math.abs(workingMatrix[pivotRow][i]) < 1e-10) {
        steps.push({
          id: stepCounter,
          title: 'Determinante = 0',
          description: 'Encontramos una columna de ceros, por lo que det(A) = 0',
          matrix: MatrixMath.cloneMatrix(workingMatrix),
          operation: 'det(A) = 0'
        });
        
        return { steps, determinant: 0 };
      }

      // Intercambiar filas si es necesario
      if (pivotRow !== i) {
        workingMatrix = MatrixMath.swapRows(workingMatrix, i, pivotRow);
        swapCount++;
        
        steps.push({
          id: stepCounter++,
          title: `Intercambio de Filas`,
          description: `Intercambiamos R${i + 1} ↔ R${pivotRow + 1} (esto cambia el signo del determinante)`,
          matrix: MatrixMath.cloneMatrix(workingMatrix),
          operation: `R${i + 1} ↔ R${pivotRow + 1}`,
          rowIndex: i
        });
      }

      // Eliminar elementos debajo del pivote
      for (let j = i + 1; j < n; j++) {
        const factor = -workingMatrix[j][i] / workingMatrix[i][i];
        
        if (Math.abs(factor) > 1e-10) {
          workingMatrix = MatrixMath.addRowMultiple(workingMatrix, j, i, factor);
          
          steps.push({
            id: stepCounter++,
            title: `Eliminación - Fila ${j + 1}`,
            description: `R${j + 1} = R${j + 1} + (${MatrixMath.formatNumber(factor, 4)}) × R${i + 1}`,
            matrix: MatrixMath.cloneMatrix(workingMatrix),
            operation: `R${j + 1} = R${j + 1} + (${MatrixMath.formatNumber(factor, 4)}) × R${i + 1}`
          });
        }
      }
    }

    // Calcular determinante como producto de la diagonal
    let determinant = 1;
    for (let i = 0; i < n; i++) {
      determinant *= workingMatrix[i][i];
    }

    // Ajustar por intercambios de filas
    if (swapCount % 2 === 1) {
      determinant *= -1;
    }

    steps.push({
      id: stepCounter,
      title: 'Determinante Final',
      description: `det(A) = ${swapCount % 2 === 1 ? '(-1)^' + swapCount + ' × ' : ''}${workingMatrix.map((row, i) => MatrixMath.formatNumber(row[i], 4)).join(' × ')} = ${MatrixMath.formatNumber(determinant, 4)}`,
      matrix: MatrixMath.cloneMatrix(workingMatrix),
      operation: `det(A) = ${MatrixMath.formatNumber(determinant, 4)}`
    });

    return { steps, determinant };
  }
}