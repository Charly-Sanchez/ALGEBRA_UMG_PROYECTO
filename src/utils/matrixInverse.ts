import type { Matrix, CalculationStep, InverseResult } from '../types/matrix';
import { Fraction, FractionMatrix } from './fraction';
import { LaplaceExpansion } from './laplaceExpansion';

export class MatrixInverse {
  /**
   * Calcula la matriz inversa usando el método de LaPlace (determinante + matriz adjunta)
   * A^(-1) = (1/det(A)) * adj(A)
   */
  static calculateInverse(matrix: Matrix): {
    steps: CalculationStep[];
    result: InverseResult;
  } {
    const n = matrix.length;
    
    if (n !== matrix[0].length) {
      throw new Error('La matriz debe ser cuadrada para calcular su inversa');
    }

    const steps: CalculationStep[] = [];
    let stepId = 1;

    // Paso 1: Mostrar matriz original y explicar procedimiento
    steps.push({
      id: stepId++,
      title: 'Matriz Original y Procedimiento',
      description: `Para calcular A⁻¹ usando el método de LaPlace seguiremos estos pasos:
      
      1️⃣ **Calcular determinante**: Verificar que det(A) ≠ 0
      2️⃣ **Matriz de cofactores**: Para cada elemento aᵢⱼ calcular Cᵢⱼ = (-1)^(i+j) × Mᵢⱼ
      3️⃣ **Matriz adjunta**: adj(A) = transpose(matriz de cofactores)  
      4️⃣ **Matriz inversa**: A⁻¹ = (1/det(A)) × adj(A)
      
      📝 **Regla de signos**: Si (i+j) es par → positivo (+), si es impar → negativo (-)`,
      matrix: matrix.map(row => [...row]),
      operation: 'Procedimiento LaPlace'
    });

    // Paso 2: Calcular determinante
    const determinantResult = LaplaceExpansion.calculateDeterminant(matrix);
    const determinant = determinantResult.determinant;
    const fractionDeterminant = Fraction.fromDecimal(determinant);

    steps.push({
      id: stepId++,
      title: 'Cálculo del Determinante',
      description: `Para que la matriz tenga inversa, su determinante debe ser diferente de cero. det(A) = ${determinant}`,
      matrix: matrix.map(row => [...row]),
      operation: `det(A) = ${determinant}`,
      fractionMatrix: matrix.map(row => row.map(val => Fraction.fromDecimal(val)))
    });

    // Verificar si la matriz es invertible
    if (Math.abs(determinant) < 1e-10) {
      const result: InverseResult = {
        inverseMatrix: [],
        determinant,
        fractionDeterminant,
        isInvertible: false,
        adjugateMatrix: [],
        fractionAdjugateMatrix: []
      };

      steps.push({
        id: stepId++,
        title: 'Matriz No Invertible',
        description: 'La matriz no tiene inversa porque su determinante es cero (matriz singular).',
        matrix: matrix.map(row => [...row]),
        operation: 'Error: det(A) = 0'
      });

      return { steps, result };
    }

    // Paso 3: Calcular matriz de cofactores paso a paso
    const { cofactorMatrix, cofactorSteps } = this.calculateCofactorMatrixDetailed(matrix, stepId);
    
    // Agregar todos los pasos de cofactores
    steps.push(...cofactorSteps);
    stepId += cofactorSteps.length;

    const fractionCofactorMatrix = cofactorMatrix.map(row => 
      row.map(val => Fraction.fromDecimal(val))
    );

    steps.push({
      id: stepId++,
      title: 'Matriz de Cofactores Completa',
      description: 'Resultado final de todos los cofactores calculados:',
      matrix: cofactorMatrix,
      fractionMatrix: fractionCofactorMatrix,
      operation: 'Matriz C = [Cᵢⱼ]'
    });

    // Paso 4: Calcular matriz adjunta (transpuesta de cofactores)
    const adjugateMatrix = this.transposeMatrix(cofactorMatrix);
    const fractionAdjugateMatrix = adjugateMatrix.map(row => 
      row.map(val => Fraction.fromDecimal(val))
    );

    steps.push({
      id: stepId++,
      title: 'Matriz Adjunta',
      description: 'La matriz adjunta es la transpuesta de la matriz de cofactores: adj(A) = C^T',
      matrix: adjugateMatrix,
      fractionMatrix: fractionAdjugateMatrix,
      operation: 'adj(A) = C^T'
    });

    // Paso 5: Calcular matriz inversa
    const inverseMatrix = adjugateMatrix.map(row => 
      row.map(val => val / determinant)
    );
    const fractionInverseMatrix = fractionAdjugateMatrix.map(row => 
      row.map(fraction => fraction.divide(fractionDeterminant))
    );

    steps.push({
      id: stepId++,
      title: 'Matriz Inversa',
      description: `La matriz inversa se calcula como: A^(-1) = (1/det(A)) × adj(A) = (1/${determinant}) × adj(A)`,
      matrix: inverseMatrix,
      fractionMatrix: fractionInverseMatrix,
      operation: 'A^(-1) = (1/det(A)) × adj(A)'
    });

    // Paso 6: Verificación (opcional)
    const verificationMatrix = this.multiplyMatrices(matrix, inverseMatrix);
    const isIdentity = this.isIdentityMatrix(verificationMatrix);

    steps.push({
      id: stepId++,
      title: 'Verificación',
      description: `Verificamos que A × A^(-1) = I (matriz identidad). ${isIdentity ? '✅ Correcto' : '❌ Error en el cálculo'}`,
      matrix: verificationMatrix,
      operation: 'A × A^(-1) = I'
    });

    const result: InverseResult = {
      inverseMatrix,
      fractionInverseMatrix,
      determinant,
      fractionDeterminant,
      isInvertible: true,
      adjugateMatrix,
      fractionAdjugateMatrix
    };

    return { steps, result };
  }

  /**
   * Calcula la matriz de cofactores con pasos detallados
   */
  private static calculateCofactorMatrixDetailed(matrix: Matrix, startStepId: number): {
    cofactorMatrix: Matrix;
    cofactorSteps: CalculationStep[];
  } {
    const n = matrix.length;
    const cofactorMatrix: Matrix = [];
    const cofactorSteps: CalculationStep[] = [];
    let stepId = startStepId;

    // Primero explicar el proceso
    cofactorSteps.push({
      id: stepId++,
      title: 'Cálculo de Cofactores',
      description: `Calcularemos cada cofactor Cᵢⱼ = (-1)^(i+j) × Mᵢⱼ donde:
      • i = número de fila (empezando desde 0)
      • j = número de columna (empezando desde 0)  
      • Mᵢⱼ = determinante del menor (matriz sin fila i y columna j)
      • Si (i+j) es par → signo positivo (+)
      • Si (i+j) es impar → signo negativo (-)`,
      matrix: matrix.map(row => [...row]),
      operation: 'Regla de Cofactores'
    });

    for (let i = 0; i < n; i++) {
      cofactorMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        // Calcular el menor M_ij
        const minor = this.calculateMinor(matrix, i, j);
        const minorDet = LaplaceExpansion.calculateDeterminant(minor).determinant;
        
        // Calcular el signo
        const signExponent = i + j;
        const sign = Math.pow(-1, signExponent);
        const signText = signExponent % 2 === 0 ? '+' : '-';
        
        // Calcular el cofactor
        const cofactor = sign * minorDet;
        cofactorMatrix[i][j] = cofactor;

        // Crear paso para este cofactor
        cofactorSteps.push({
          id: stepId++,
          title: `Cofactor C₍${i+1},${j+1}₎`,
          description: `C₍${i+1},${j+1}₎ = (-1)^(${i+1}+${j+1}) × M₍${i+1},${j+1}₎ = (-1)^${signExponent+2} × det(menor)
          
          📍 **Posición**: fila ${i+1}, columna ${j+1}
          🔢 **Exponente**: (${i+1}+${j+1}) = ${signExponent+2} 
          ⚡ **Signo**: ${signExponent+2} es ${(signExponent+2) % 2 === 0 ? 'par' : 'impar'} → ${signText}
          🎯 **Menor**: M₍${i+1},${j+1}₎ = ${minorDet} (determinante de la matriz sin fila ${i+1} y columna ${j+1})
          ✅ **Cofactor**: ${signText}${Math.abs(minorDet)} = ${cofactor}`,
          matrix: matrix.map(row => [...row]),
          operation: `C₍${i+1},${j+1}₎ = ${cofactor}`,
          excludedRow: i,
          excludedCol: j
        });
      }
    }

    return { cofactorMatrix, cofactorSteps };
  }

  /**
   * Calcula la matriz de cofactores (método simple)
   */
  private static calculateCofactorMatrix(matrix: Matrix): Matrix {
    const n = matrix.length;
    const cofactorMatrix: Matrix = [];

    for (let i = 0; i < n; i++) {
      cofactorMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        // Calcular el menor M_ij
        const minor = this.calculateMinor(matrix, i, j);
        // Calcular el cofactor C_ij = (-1)^(i+j) * M_ij
        const sign = Math.pow(-1, i + j);
        const cofactor = sign * LaplaceExpansion.calculateDeterminant(minor).determinant;
        cofactorMatrix[i][j] = cofactor;
      }
    }

    return cofactorMatrix;
  }

  /**
   * Calcula el menor de una matriz eliminando la fila i y columna j
   */
  private static calculateMinor(matrix: Matrix, excludeRow: number, excludeCol: number): Matrix {
    const n = matrix.length;
    const minor: Matrix = [];

    for (let i = 0; i < n; i++) {
      if (i === excludeRow) continue;
      
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        if (j === excludeCol) continue;
        row.push(matrix[i][j]);
      }
      minor.push(row);
    }

    return minor;
  }

  /**
   * Transpone una matriz
   */
  private static transposeMatrix(matrix: Matrix): Matrix {
    const n = matrix.length;
    const transposed: Matrix = [];

    for (let i = 0; i < n; i++) {
      transposed[i] = [];
      for (let j = 0; j < n; j++) {
        transposed[i][j] = matrix[j][i];
      }
    }

    return transposed;
  }

  /**
   * Multiplica dos matrices
   */
  private static multiplyMatrices(a: Matrix, b: Matrix): Matrix {
    const n = a.length;
    const result: Matrix = [];

    for (let i = 0; i < n; i++) {
      result[i] = [];
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }

    return result;
  }

  /**
   * Verifica si una matriz es la identidad (con tolerancia para errores de punto flotante)
   */
  private static isIdentityMatrix(matrix: Matrix, tolerance: number = 1e-10): boolean {
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const expected = i === j ? 1 : 0;
        if (Math.abs(matrix[i][j] - expected) > tolerance) {
          return false;
        }
      }
    }

    return true;
  }
}