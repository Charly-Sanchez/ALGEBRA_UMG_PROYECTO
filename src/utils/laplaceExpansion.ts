import type { Matrix, Vector, CalculationStep, Solution } from '../types/matrix';
import { MatrixMath } from './matrixMath';

export class LaplaceExpansion {
  
  /**
   * Calcula el determinante usando expansión de LaPlace
   */
  static calculateDeterminant(matrix: Matrix): {
    steps: CalculationStep[];
    determinant: number;
    expansionFormula?: string;
  } {
    const steps: CalculationStep[] = [];
    let stepCounter = 1;

    steps.push({
      id: stepCounter++,
      title: 'Matriz Original',
      description: 'Calculamos el determinante usando expansión por cofactores (Método de LaPlace)',
      matrix: MatrixMath.cloneMatrix(matrix),
      operation: 'det(A) usando LaPlace'
    });

    // Encontrar la mejor fila/columna para expandir
    const optimal = this.findOptimalExpansionRowOrColumn(matrix);
    
    steps.push({
      id: stepCounter++,
      title: 'Selección de Fila/Columna Óptima',
      description: `Expandiremos por la ${optimal.type === 'row' ? 'fila' : 'columna'} ${optimal.index + 1} porque contiene ${optimal.zeroCount} cero(s), lo que simplifica el cálculo`,
      matrix: MatrixMath.cloneMatrix(matrix),
      operation: `Usar ${optimal.type === 'row' ? 'fila' : 'columna'} ${optimal.index + 1} (${optimal.zeroCount} ceros)`
    });

    const result = optimal.type === 'row' 
      ? this.expandByRow(matrix, optimal.index, steps, stepCounter, 1)
      : this.expandByColumn(matrix, optimal.index, steps, stepCounter, 1);
    
    // Construir la fórmula de expansión con los valores calculados de los menores
    const expansionFormula = this.buildExpansionFormulaWithValues(matrix, optimal.index, optimal.type);
    
    return {
      steps,
      determinant: result.determinant,
      expansionFormula
    };
  }

  /**
   * Expande por una fila específica
   */
  private static expandByRow(
    matrix: Matrix,
    row: number,
    steps: CalculationStep[],
    stepCounter: number,
    level: number
  ): { determinant: number; nextStepId: number } {
    const n = matrix.length;
    
    if (n === 1) {
      steps.push({
        id: stepCounter++,
        title: `Matriz 1×1 (Nivel ${level})`,
        description: `det = ${MatrixMath.formatNumber(matrix[0][0], 4)}`,
        matrix: MatrixMath.cloneMatrix(matrix),
        operation: `det = ${MatrixMath.formatNumber(matrix[0][0], 4)}`
      });
      return { determinant: matrix[0][0], nextStepId: stepCounter };
    }

    if (n === 2) {
      const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      steps.push({
        id: stepCounter++,
        title: `Determinante 2×2 (Nivel ${level})`,
        description: `det = (${MatrixMath.formatNumber(matrix[0][0], 4)})(${MatrixMath.formatNumber(matrix[1][1], 4)}) - (${MatrixMath.formatNumber(matrix[0][1], 4)})(${MatrixMath.formatNumber(matrix[1][0], 4)}) = ${MatrixMath.formatNumber(det, 4)}`,
        matrix: MatrixMath.cloneMatrix(matrix),
        operation: `det = ${MatrixMath.formatNumber(det, 4)}`
      });
      return { determinant: det, nextStepId: stepCounter };
    }

    // Mostrar fórmula de expansión
    const expansionFormula = this.buildExpansionFormula(matrix, row, 'row');
    steps.push({
      id: stepCounter++,
      title: `Fórmula de Expansión por Fila ${row + 1} (Nivel ${level})`,
      description: `${expansionFormula}`,
      matrix: MatrixMath.cloneMatrix(matrix),
      operation: `Expansión por fila ${row + 1}`
    });

    let determinant = 0;
    let currentStepId = stepCounter;

    for (let j = 0; j < n; j++) {
      if (Math.abs(matrix[row][j]) < 1e-10) {
        // Si el elemento es cero, saltamos este término
        steps.push({
          id: currentStepId++,
          title: `Término (${row + 1},${j + 1}) = 0 (Omitido)`,
          description: `Como a${row + 1}${j + 1} = 0, este término no contribuye al determinante. No es necesario calcular la menor M${row + 1}${j + 1}.`,
          matrix: MatrixMath.cloneMatrix(matrix),
          operation: `Término omitido: 0 × M${row + 1}${j + 1} = 0`
        });
        continue;
      }

      // Obtener la menor
      const minor = MatrixMath.getMinor(matrix, row, j);
      const sign = Math.pow(-1, row + j);
      
      // Mostrar la matriz original con la fila y columna tachadas visualmente
      steps.push({
        id: currentStepId++,
        title: `Cálculo de Menor M${row + 1}${j + 1}`,
        description: `Para obtener M${row + 1}${j + 1}, eliminamos la fila ${row + 1} y columna ${j + 1} de la matriz original.`,
        matrix: MatrixMath.cloneMatrix(matrix),
        operation: `Eliminar fila ${row + 1}, columna ${j + 1}`,
        excludedRow: row,
        excludedCol: j
      });

      steps.push({
        id: currentStepId++,
        title: `Menor M${row + 1}${j + 1} Resultante`,
        description: `Esta es la matriz menor obtenida:`,
        matrix: MatrixMath.cloneMatrix(minor),
        operation: `M${row + 1}${j + 1}`
      });

      // Calcular el determinante de la menor recursivamente
      const minorResult = this.expandByRow(minor, this.findOptimalExpansionRowOrColumn(minor).index, steps, currentStepId, level + 1);
      currentStepId = minorResult.nextStepId;
      
      const cofactor = sign * minorResult.determinant;
      const contribution = matrix[row][j] * cofactor;
      determinant += contribution;

      steps.push({
        id: currentStepId++,
        title: `Cofactor C${row + 1}${j + 1}`,
        description: `C${row + 1}${j + 1} = (-1)^(${row + 1}+${j + 1}) × det(M${row + 1}${j + 1}) = (-1)^${row + j + 2} × ${MatrixMath.formatNumber(minorResult.determinant, 4)} = ${MatrixMath.formatNumber(cofactor, 4)}`,
        matrix: MatrixMath.cloneMatrix(matrix),
        operation: `C${row + 1}${j + 1} = ${MatrixMath.formatNumber(cofactor, 4)}`
      });

      steps.push({
        id: currentStepId++,
        title: `Contribución: a${row + 1}${j + 1} × C${row + 1}${j + 1}`,
        description: `(${MatrixMath.formatNumber(matrix[row][j], 4)}) × (${MatrixMath.formatNumber(cofactor, 4)}) = ${MatrixMath.formatNumber(contribution, 4)}`,
        matrix: MatrixMath.cloneMatrix(matrix),
        operation: `${contribution >= 0 ? '+' : ''}${MatrixMath.formatNumber(contribution, 4)}`
      });
    }

    steps.push({
      id: currentStepId++,
      title: `Determinante (Nivel ${level})`,
      description: `Suma de todos los términos de la expansión por fila ${row + 1}`,
      matrix: MatrixMath.cloneMatrix(matrix),
      operation: `det = ${MatrixMath.formatNumber(determinant, 4)}`
    });

    return { determinant, nextStepId: currentStepId };
  }

  /**
   * Expande por una columna específica
   */
  private static expandByColumn(
    matrix: Matrix,
    col: number,
    steps: CalculationStep[],
    stepCounter: number,
    level: number
  ): { determinant: number; nextStepId: number } {
    const n = matrix.length;
    
    if (n === 1) {
      steps.push({
        id: stepCounter++,
        title: `Matriz 1×1 (Nivel ${level})`,
        description: `det = ${MatrixMath.formatNumber(matrix[0][0], 4)}`,
        matrix: MatrixMath.cloneMatrix(matrix),
        operation: `det = ${MatrixMath.formatNumber(matrix[0][0], 4)}`
      });
      return { determinant: matrix[0][0], nextStepId: stepCounter };
    }

    if (n === 2) {
      const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      steps.push({
        id: stepCounter++,
        title: `Determinante 2×2 (Nivel ${level})`,
        description: `det = (${MatrixMath.formatNumber(matrix[0][0], 4)})(${MatrixMath.formatNumber(matrix[1][1], 4)}) - (${MatrixMath.formatNumber(matrix[0][1], 4)})(${MatrixMath.formatNumber(matrix[1][0], 4)}) = ${MatrixMath.formatNumber(det, 4)}`,
        matrix: MatrixMath.cloneMatrix(matrix),
        operation: `det = ${MatrixMath.formatNumber(det, 4)}`
      });
      return { determinant: det, nextStepId: stepCounter };
    }

    // Mostrar fórmula de expansión
    const expansionFormula = this.buildExpansionFormula(matrix, col, 'column');
    steps.push({
      id: stepCounter++,
      title: `Fórmula de Expansión por Columna ${col + 1} (Nivel ${level})`,
      description: `${expansionFormula}`,
      matrix: MatrixMath.cloneMatrix(matrix),
      operation: `Expansión por columna ${col + 1}`
    });

    let determinant = 0;
    let currentStepId = stepCounter;

    for (let i = 0; i < n; i++) {
      if (Math.abs(matrix[i][col]) < 1e-10) {
        steps.push({
          id: currentStepId++,
          title: `Término (${i + 1},${col + 1}) = 0 (Omitido)`,
          description: `Como a${i + 1}${col + 1} = 0, este término no contribuye al determinante. No es necesario calcular la menor M${i + 1}${col + 1}.`,
          matrix: MatrixMath.cloneMatrix(matrix),
          operation: `Término omitido: 0 × M${i + 1}${col + 1} = 0`
        });
        continue;
      }

      const minor = MatrixMath.getMinor(matrix, i, col);
      const sign = Math.pow(-1, i + col);
      
      steps.push({
        id: currentStepId++,
        title: `Cálculo de Menor M${i + 1}${col + 1}`,
        description: `Para obtener M${i + 1}${col + 1}, eliminamos la fila ${i + 1} y columna ${col + 1} de la matriz original.`,
        matrix: MatrixMath.cloneMatrix(matrix),
        operation: `Eliminar fila ${i + 1}, columna ${col + 1}`,
        excludedRow: i,
        excludedCol: col
      });

      steps.push({
        id: currentStepId++,
        title: `Menor M${i + 1}${col + 1} Resultante`,
        description: `Esta es la matriz menor obtenida:`,
        matrix: MatrixMath.cloneMatrix(minor),
        operation: `M${i + 1}${col + 1}`
      });

      const minorResult = this.expandByColumn(minor, this.findOptimalExpansionRowOrColumn(minor).index, steps, currentStepId, level + 1);
      currentStepId = minorResult.nextStepId;
      
      const cofactor = sign * minorResult.determinant;
      const contribution = matrix[i][col] * cofactor;
      determinant += contribution;

      steps.push({
        id: currentStepId++,
        title: `Cofactor C${i + 1}${col + 1}`,
        description: `C${i + 1}${col + 1} = (-1)^(${i + 1}+${col + 1}) × det(M${i + 1}${col + 1}) = (-1)^${i + col + 2} × ${MatrixMath.formatNumber(minorResult.determinant, 4)} = ${MatrixMath.formatNumber(cofactor, 4)}`,
        matrix: MatrixMath.cloneMatrix(matrix),
        operation: `C${i + 1}${col + 1} = ${MatrixMath.formatNumber(cofactor, 4)}`
      });

      steps.push({
        id: currentStepId++,
        title: `Contribución: a${i + 1}${col + 1} × C${i + 1}${col + 1}`,
        description: `(${MatrixMath.formatNumber(matrix[i][col], 4)}) × (${MatrixMath.formatNumber(cofactor, 4)}) = ${MatrixMath.formatNumber(contribution, 4)}`,
        matrix: MatrixMath.cloneMatrix(matrix),
        operation: `${contribution >= 0 ? '+' : ''}${MatrixMath.formatNumber(contribution, 4)}`
      });
    }

    steps.push({
      id: currentStepId++,
      title: `Determinante (Nivel ${level})`,
      description: `Suma de todos los términos de la expansión por columna ${col + 1}`,
      matrix: MatrixMath.cloneMatrix(matrix),
      operation: `det = ${MatrixMath.formatNumber(determinant, 4)}`
    });

    return { determinant, nextStepId: currentStepId };
  }

  /**
   * Construye la fórmula de expansión mostrando qué términos son cero
   */
  private static buildExpansionFormula(matrix: Matrix, index: number, type: 'row' | 'column'): string {
    const n = matrix.length;
    const terms: string[] = [];

    if (type === 'row') {
      for (let j = 0; j < n; j++) {
        const value = matrix[index][j];
        const signValue = Math.pow(-1, index + j);
        const sign = signValue > 0 ? '+' : '-';
        
        if (Math.abs(value) < 1e-10) {
          const displaySign = j === 0 ? '' : ` ${sign} `;
          terms.push(`${displaySign}(0) × M${index + 1}${j + 1}`);
        } else {
          const displaySign = j === 0 ? (sign === '-' ? '-' : '') : ` ${sign} `;
          terms.push(`${displaySign}(${MatrixMath.formatNumber(Math.abs(value), 4)}) × M${index + 1}${j + 1}`);
        }
      }
    } else {
      for (let i = 0; i < n; i++) {
        const value = matrix[i][index];
        const signValue = Math.pow(-1, i + index);
        const sign = signValue > 0 ? '+' : '-';
        
        if (Math.abs(value) < 1e-10) {
          const displaySign = i === 0 ? '' : ` ${sign} `;
          terms.push(`${displaySign}(0) × M${i + 1}${index + 1}`);
        } else {
          const displaySign = i === 0 ? (sign === '-' ? '-' : '') : ` ${sign} `;
          terms.push(`${displaySign}(${MatrixMath.formatNumber(Math.abs(value), 4)}) × M${i + 1}${index + 1}`);
        }
      }
    }

    return `det = ${terms.join('')}`;
  }

  /**
   * Construye la fórmula de expansión con los valores calculados de los menores
   */
  private static buildExpansionFormulaWithValues(matrix: Matrix, index: number, type: 'row' | 'column'): string {
    const n = matrix.length;
    const terms: string[] = [];

    if (type === 'row') {
      for (let j = 0; j < n; j++) {
        const value = matrix[index][j];
        const minor = MatrixMath.getMinor(matrix, index, j);
        const minorDet = this.calculateSimpleDeterminant(minor);
        const signValue = Math.pow(-1, index + j);
        const sign = signValue > 0 ? '+' : '-';
        const displaySign = j === 0 ? (sign === '-' ? '-' : '') : ` ${sign} `;
        
        terms.push(`${displaySign}(${MatrixMath.formatNumber(Math.abs(value), 4)}) × (${MatrixMath.formatNumber(minorDet, 4)})`);
      }
    } else {
      for (let i = 0; i < n; i++) {
        const value = matrix[i][index];
        const minor = MatrixMath.getMinor(matrix, i, index);
        const minorDet = this.calculateSimpleDeterminant(minor);
        const signValue = Math.pow(-1, i + index);
        const sign = signValue > 0 ? '+' : '-';
        const displaySign = i === 0 ? (sign === '-' ? '-' : '') : ` ${sign} `;
        
        terms.push(`${displaySign}(${MatrixMath.formatNumber(Math.abs(value), 4)}) × (${MatrixMath.formatNumber(minorDet, 4)})`);
      }
    }

    return `det = ${terms.join('')}`;
  }

  /**
   * Calcula el determinante de forma simple sin generar pasos (para uso interno)
   */
  private static calculateSimpleDeterminant(matrix: Matrix): number {
    const n = matrix.length;

    if (n === 1) {
      return matrix[0][0];
    }

    if (n === 2) {
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    // Encontrar la mejor fila/columna para expandir
    const optimal = this.findOptimalExpansionRowOrColumn(matrix);
    let determinant = 0;

    if (optimal.type === 'row') {
      const row = optimal.index;
      for (let j = 0; j < n; j++) {
        if (Math.abs(matrix[row][j]) < 1e-10) continue;
        const minor = MatrixMath.getMinor(matrix, row, j);
        const sign = Math.pow(-1, row + j);
        determinant += sign * matrix[row][j] * this.calculateSimpleDeterminant(minor);
      }
    } else {
      const col = optimal.index;
      for (let i = 0; i < n; i++) {
        if (Math.abs(matrix[i][col]) < 1e-10) continue;
        const minor = MatrixMath.getMinor(matrix, i, col);
        const sign = Math.pow(-1, i + col);
        determinant += sign * matrix[i][col] * this.calculateSimpleDeterminant(minor);
      }
    }

    return determinant;
  }

  /**
   * Resuelve un sistema usando la Regla de Cramer (que usa determinantes)
   */
  static solveByCramersRule(coefficientMatrix: Matrix, constantVector: Vector): {
    steps: CalculationStep[];
    solution: Solution;
  } {
    const steps: CalculationStep[] = [];
    const n = coefficientMatrix.length;
    let stepCounter = 1;

    steps.push({
      id: stepCounter++,
      title: 'Sistema de Ecuaciones',
      description: 'Resolveremos usando la Regla de Cramer, que requiere calcular determinantes',
      matrix: MatrixMath.createAugmentedMatrix(coefficientMatrix, constantVector),
      operation: 'Regla de Cramer'
    });

    // Calcular determinante principal
    const mainDetResult = this.calculateDeterminant(coefficientMatrix);
    steps.push(...mainDetResult.steps.map(step => ({
      ...step,
      id: stepCounter++,
      title: `Det Principal - ${step.title}`,
      description: `Determinante de la matriz de coeficientes: ${step.description}`
    })));

    const mainDeterminant = mainDetResult.determinant;

    // Verificar si el sistema tiene solución única
    if (Math.abs(mainDeterminant) < 1e-10) {
      steps.push({
        id: stepCounter,
        title: 'Sistema Singular',
        description: 'El determinante principal es 0, por lo que el sistema no tiene solución única o no tiene solución',
        matrix: MatrixMath.cloneMatrix(coefficientMatrix),
        operation: 'det(A) = 0 → Sistema singular'
      });

      return {
        steps,
        solution: {
          variables: [],
          determinant: mainDeterminant,
          isUnique: false,
          hasInfiniteSolutions: true,
          hasNoSolution: false
        }
      };
    }

    // Calcular determinantes para cada variable
    const variables: number[] = [];

    for (let i = 0; i < n; i++) {
      // Crear matriz reemplazando la columna i con el vector de constantes
      const modifiedMatrix = coefficientMatrix.map((row, rowIndex) => 
        row.map((val, colIndex) => 
          colIndex === i ? constantVector[rowIndex] : val
        )
      );

      steps.push({
        id: stepCounter++,
        title: `Matriz para x${i + 1}`,
        description: `Reemplazamos la columna ${i + 1} de la matriz original con el vector de constantes`,
        matrix: MatrixMath.cloneMatrix(modifiedMatrix),
        operation: `Matriz A${i + 1}`
      });

      const varDetResult = this.calculateDeterminant(modifiedMatrix);
      steps.push(...varDetResult.steps.map(step => ({
        ...step,
        id: stepCounter++,
        title: `Det A${i + 1} - ${step.title}`,
        description: `Para x${i + 1}: ${step.description}`
      })));

      const variableDeterminant = varDetResult.determinant;
      const variableValue = variableDeterminant / mainDeterminant;
      variables[i] = variableValue;

      steps.push({
        id: stepCounter++,
        title: `Cálculo de x${i + 1}`,
        description: `x${i + 1} = det(A${i + 1}) / det(A) = ${MatrixMath.formatNumber(variableDeterminant, 4)} / ${MatrixMath.formatNumber(mainDeterminant, 4)} = ${MatrixMath.formatNumber(variableValue, 4)}`,
        matrix: MatrixMath.cloneMatrix(modifiedMatrix),
        operation: `x${i + 1} = ${MatrixMath.formatNumber(variableValue, 4)}`
      });
    }

    steps.push({
      id: stepCounter,
      title: 'Solución Completa',
      description: 'Todas las variables han sido calculadas usando la Regla de Cramer',
      matrix: MatrixMath.createAugmentedMatrix(coefficientMatrix, constantVector),
      operation: `Solución: [${variables.map(v => MatrixMath.formatNumber(v, 4)).join(', ')}]`
    });

    return {
      steps,
      solution: {
        variables,
        determinant: mainDeterminant,
        isUnique: true,
        hasInfiniteSolutions: false,
        hasNoSolution: false
      }
    };
  }

  /**
   * Optimiza la selección de fila/columna para la expansión
   */
  static findOptimalExpansionRowOrColumn(matrix: Matrix): {
    type: 'row' | 'column';
    index: number;
    zeroCount: number;
  } {
    const n = matrix.length;
    let bestType: 'row' | 'column' = 'row';
    let bestIndex = 0;
    let maxZeros = 0;

    // Revisar filas
    for (let i = 0; i < n; i++) {
      let zeros = 0;
      for (let j = 0; j < n; j++) {
        if (Math.abs(matrix[i][j]) < 1e-10) zeros++;
      }
      if (zeros > maxZeros) {
        maxZeros = zeros;
        bestType = 'row';
        bestIndex = i;
      }
    }

    // Revisar columnas
    for (let j = 0; j < n; j++) {
      let zeros = 0;
      for (let i = 0; i < n; i++) {
        if (Math.abs(matrix[i][j]) < 1e-10) zeros++;
      }
      if (zeros > maxZeros) {
        maxZeros = zeros;
        bestType = 'column';
        bestIndex = j;
      }
    }

    return { type: bestType, index: bestIndex, zeroCount: maxZeros };
  }
}