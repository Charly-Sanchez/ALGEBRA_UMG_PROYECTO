import type { Matrix, Vector, CalculationStep, Solution } from '../types/matrix';
import { Fraction, FractionMatrixUtils } from './fraction';
import type { FractionMatrix } from './fraction';

export class GaussianEliminationFractions {
  
  /**
   * Resuelve un sistema de ecuaciones lineales usando eliminación gaussiana con fracciones
   */
  static solve(coefficientMatrix: Matrix, constantVector: Vector): {
    steps: CalculationStep[];
    solution: Solution;
  } {
    const steps: CalculationStep[] = [];
    const n = coefficientMatrix.length;
    
    // Convertir a fracciones
    let fractionMatrix = FractionMatrixUtils.fromNumberMatrix(coefficientMatrix);
    let fractionConstants = FractionMatrixUtils.fromNumberVector(constantVector);
    
    // Crear matriz aumentada
    let augmentedMatrix = FractionMatrixUtils.createAugmentedMatrix(fractionMatrix, fractionConstants);
    
    steps.push({
      id: 1,
      title: 'Matriz Aumentada Inicial',
      description: 'Sistema de ecuaciones representado como matriz aumentada [A|b] con fracciones exactas',
      matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix),
      fractionMatrix: FractionMatrixUtils.cloneMatrix(augmentedMatrix),
      operation: 'Configuración inicial'
    });

    // Fase de eliminación hacia adelante
    let stepCounter = 2;
    
    for (let i = 0; i < n - 1; i++) {
      // Buscar el mejor pivote
      const pivotRow = FractionMatrixUtils.findPivot(augmentedMatrix, i, i);
      
      if (augmentedMatrix[pivotRow][i].isZero()) {
        continue;
      }
      
      // Intercambiar filas si es necesario
      if (pivotRow !== i) {
        augmentedMatrix = FractionMatrixUtils.swapRows(augmentedMatrix, i, pivotRow);
        
        steps.push({
          id: stepCounter++,
          title: `Intercambio de Filas`,
          description: `Intercambiamos la fila ${i + 1} con la fila ${pivotRow + 1} para obtener el mejor pivote`,
          matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix),
          fractionMatrix: FractionMatrixUtils.cloneMatrix(augmentedMatrix),
          operation: `R${i + 1} ↔ R${pivotRow + 1}`,
          rowIndex: i,
          pivotFraction: augmentedMatrix[i][i].clone()
        });
      }
      
      // Eliminar elementos debajo del pivote
      for (let j = i + 1; j < n; j++) {
        if (!augmentedMatrix[j][i].isZero()) {
          // Calcular el factor como fracción: -a[j][i] / a[i][i]
          const factor = augmentedMatrix[j][i].negate().divide(augmentedMatrix[i][i]);
          
          // Aplicar operación de fila
          augmentedMatrix = FractionMatrixUtils.addRowMultiple(augmentedMatrix, j, i, factor);
          
          steps.push({
            id: stepCounter++,
            title: `Eliminación Gaussiana - Paso ${i + 1}.${j - i}`,
            description: `Eliminamos el elemento en la posición (${j + 1}, ${i + 1}) usando R${j + 1} = R${j + 1} + (${factor.toString()}) × R${i + 1}`,
            matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix),
            fractionMatrix: FractionMatrixUtils.cloneMatrix(augmentedMatrix),
            operation: `R${j + 1} = R${j + 1} + (${factor.toString()}) × R${i + 1}`,
            rowIndex: j,
            pivotFraction: augmentedMatrix[i][i].clone()
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
    augmentedMatrix: FractionMatrix,
    steps: CalculationStep[],
    stepCounter: number
  ): Solution {
    const n = augmentedMatrix.length;
    const variables: Fraction[] = new Array(n);
    
    // Verificar inconsistencias
    for (let i = 0; i < n; i++) {
      let allZeros = true;
      for (let j = 0; j < n; j++) {
        if (!augmentedMatrix[i][j].isZero()) {
          allZeros = false;
          break;
        }
      }
      
      if (allZeros && !augmentedMatrix[i][n].isZero()) {
        steps.push({
          id: stepCounter,
          title: 'Sistema Inconsistente',
          description: `La fila ${i + 1} tiene la forma [0 0 ... 0 | b] donde b ≠ 0, por lo que el sistema no tiene solución`,
          matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix),
          fractionMatrix: FractionMatrixUtils.cloneMatrix(augmentedMatrix),
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
        if (!augmentedMatrix[i][j].isZero()) {
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
        matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix),
        fractionMatrix: FractionMatrixUtils.cloneMatrix(augmentedMatrix),
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
      description: 'Comenzamos resolviendo desde la última ecuación hacia la primera usando fracciones exactas',
      matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix),
      fractionMatrix: FractionMatrixUtils.cloneMatrix(augmentedMatrix),
      operation: 'Inicio de sustitución hacia atrás'
    });

    for (let i = n - 1; i >= 0; i--) {
      let sum = augmentedMatrix[i][n].clone(); // Término independiente
      
      // Restar los términos ya conocidos
      for (let j = i + 1; j < n; j++) {
        const product = augmentedMatrix[i][j].multiply(variables[j]);
        sum = sum.subtract(product);
      }
      
      // Calcular la variable dividiendo por el coeficiente diagonal
      variables[i] = sum.divide(augmentedMatrix[i][i]);
      
      const terms = this.formatSubtractionTerms(augmentedMatrix[i], variables, i);
      
      steps.push({
        id: stepCounter++,
        title: `Cálculo de x${i + 1}`,
        description: `x${i + 1} = (${augmentedMatrix[i][n].toString()}${terms}) / ${augmentedMatrix[i][i].toString()} = ${variables[i].toString()}`,
        matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix),
        fractionMatrix: FractionMatrixUtils.cloneMatrix(augmentedMatrix),
        operation: `x${i + 1} = ${variables[i].toString()}`
      });
    }

    return {
      variables: variables.map(f => f.toDecimal()),
      fractionVariables: variables,
      isUnique: true,
      hasInfiniteSolutions: false,
      hasNoSolution: false
    };
  }

  /**
   * Formatea los términos de sustracción para la visualización con fracciones
   */
  private static formatSubtractionTerms(
    row: Fraction[],
    variables: Fraction[],
    currentIndex: number
  ): string {
    let terms = '';
    
    for (let j = currentIndex + 1; j < variables.length; j++) {
      if (!row[j].isZero() && variables[j]) {
        const coefficient = row[j].toString();
        const variable = variables[j].toString();
        terms += ` - (${coefficient})(${variable})`;
      }
    }
    
    return terms;
  }

  /**
   * Calcula el determinante usando eliminación gaussiana con fracciones
   */
  static calculateDeterminant(matrix: Matrix): {
    steps: CalculationStep[];
    determinant: number;
    fractionDeterminant: Fraction;
  } {
    const steps: CalculationStep[] = [];
    const n = matrix.length;
    let workingMatrix = FractionMatrixUtils.fromNumberMatrix(matrix);
    let swapCount = 0;
    let stepCounter = 1;

    steps.push({
      id: stepCounter++,
      title: 'Matriz Original',
      description: 'Calculamos el determinante usando eliminación gaussiana con fracciones exactas',
      matrix: FractionMatrixUtils.toNumberMatrix(workingMatrix),
      fractionMatrix: FractionMatrixUtils.cloneMatrix(workingMatrix),
      operation: 'det(A) = ?'
    });

    // Eliminar hacia adelante
    for (let i = 0; i < n - 1; i++) {
      // Encontrar pivote
      const pivotRow = FractionMatrixUtils.findPivot(workingMatrix, i, i);
      
      if (workingMatrix[pivotRow][i].isZero()) {
        steps.push({
          id: stepCounter,
          title: 'Determinante = 0',
          description: 'Encontramos una columna de ceros, por lo que det(A) = 0',
          matrix: FractionMatrixUtils.toNumberMatrix(workingMatrix),
          fractionMatrix: FractionMatrixUtils.cloneMatrix(workingMatrix),
          operation: 'det(A) = 0'
        });
        
        return { 
          steps, 
          determinant: 0, 
          fractionDeterminant: new Fraction(0, 1) 
        };
      }

      // Intercambiar filas si es necesario
      if (pivotRow !== i) {
        workingMatrix = FractionMatrixUtils.swapRows(workingMatrix, i, pivotRow);
        swapCount++;
        
        steps.push({
          id: stepCounter++,
          title: `Intercambio de Filas`,
          description: `Intercambiamos R${i + 1} ↔ R${pivotRow + 1} (esto cambia el signo del determinante)`,
          matrix: FractionMatrixUtils.toNumberMatrix(workingMatrix),
          fractionMatrix: FractionMatrixUtils.cloneMatrix(workingMatrix),
          operation: `R${i + 1} ↔ R${pivotRow + 1}`,
          rowIndex: i
        });
      }

      // Eliminar elementos debajo del pivote
      for (let j = i + 1; j < n; j++) {
        if (!workingMatrix[j][i].isZero()) {
          const factor = workingMatrix[j][i].negate().divide(workingMatrix[i][i]);
          workingMatrix = FractionMatrixUtils.addRowMultiple(workingMatrix, j, i, factor);
          
          steps.push({
            id: stepCounter++,
            title: `Eliminación - Fila ${j + 1}`,
            description: `R${j + 1} = R${j + 1} + (${factor.toString()}) × R${i + 1}`,
            matrix: FractionMatrixUtils.toNumberMatrix(workingMatrix),
            fractionMatrix: FractionMatrixUtils.cloneMatrix(workingMatrix),
            operation: `R${j + 1} = R${j + 1} + (${factor.toString()}) × R${i + 1}`
          });
        }
      }
    }

    // Calcular determinante como producto de la diagonal
    let determinant = new Fraction(1, 1);
    for (let i = 0; i < n; i++) {
      determinant = determinant.multiply(workingMatrix[i][i]);
    }

    // Ajustar por intercambios de filas
    if (swapCount % 2 === 1) {
      determinant = determinant.negate();
    }

    const diagonalElements = workingMatrix.map((row, i) => row[i].toString()).join(' × ');
    
    steps.push({
      id: stepCounter,
      title: 'Determinante Final',
      description: `det(A) = ${swapCount % 2 === 1 ? '(-1)^' + swapCount + ' × ' : ''}${diagonalElements} = ${determinant.toString()}`,
      matrix: FractionMatrixUtils.toNumberMatrix(workingMatrix),
      fractionMatrix: FractionMatrixUtils.cloneMatrix(workingMatrix),
      operation: `det(A) = ${determinant.toString()}`
    });

    return { 
      steps, 
      determinant: determinant.toDecimal(), 
      fractionDeterminant: determinant 
    };
  }
}