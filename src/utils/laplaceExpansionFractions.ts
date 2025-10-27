import type { Matrix, Vector, CalculationStep, Solution } from '../types/matrix';
import { Fraction, FractionMatrixUtils } from './fraction';
import type { FractionMatrix } from './fraction';

export class LaplaceExpansionFractions {
  
  /**
   * Calcula el determinante usando expansión de LaPlace con fracciones
   */
  static calculateDeterminant(matrix: Matrix): {
    steps: CalculationStep[];
    determinant: number;
    fractionDeterminant: Fraction;
    expansionFormula?: string;
  } {
    const steps: CalculationStep[] = [];
    let stepCounter = 1;
    
    const fractionMatrix = FractionMatrixUtils.fromNumberMatrix(matrix);

    steps.push({
      id: stepCounter++,
      title: 'Matriz Original',
      description: 'Calculamos el determinante usando expansión por cofactores (Método de LaPlace) con fracciones exactas',
      matrix: FractionMatrixUtils.toNumberMatrix(fractionMatrix),
      fractionMatrix: FractionMatrixUtils.cloneMatrix(fractionMatrix),
      operation: 'det(A) usando LaPlace'
    });

    // Encontrar la mejor fila/columna para expandir
    const optimal = this.findOptimalExpansionRowOrColumn(fractionMatrix);
    
    steps.push({
      id: stepCounter++,
      title: 'Selección de Fila/Columna Óptima',
      description: `Expandiremos por la ${optimal.type === 'row' ? 'fila' : 'columna'} ${optimal.index + 1} porque contiene ${optimal.zeroCount} cero(s), lo que simplifica el cálculo`,
      matrix: FractionMatrixUtils.toNumberMatrix(fractionMatrix),
      fractionMatrix: FractionMatrixUtils.cloneMatrix(fractionMatrix),
      operation: `Usar ${optimal.type === 'row' ? 'fila' : 'columna'} ${optimal.index + 1} (${optimal.zeroCount} ceros)`
    });

    const result = optimal.type === 'row' 
      ? this.expandByRow(fractionMatrix, optimal.index, steps, stepCounter, 1)
      : this.expandByColumn(fractionMatrix, optimal.index, steps, stepCounter, 1);
    
    // Construir la fórmula de expansión con los valores calculados de los menores
    const expansionFormula = this.buildExpansionFormulaWithValues(fractionMatrix, optimal.index, optimal.type);
    
    return {
      steps,
      determinant: result.determinant.toDecimal(),
      fractionDeterminant: result.determinant,
      expansionFormula
    };
  }

  /**
   * Expande por una fila específica
   */
  private static expandByRow(
    matrix: FractionMatrix,
    row: number,
    steps: CalculationStep[],
    stepCounter: number,
    level: number
  ): { determinant: Fraction; nextStepId: number } {
    const n = matrix.length;
    
    if (n === 1) {
      steps.push({
        id: stepCounter++,
        title: `Matriz 1×1 (Nivel ${level})`,
        description: `det = ${matrix[0][0].toString()}`,
        matrix: FractionMatrixUtils.toNumberMatrix(matrix),
        fractionMatrix: FractionMatrixUtils.cloneMatrix(matrix),
        operation: `det = ${matrix[0][0].toString()}`
      });
      return { determinant: matrix[0][0].clone(), nextStepId: stepCounter };
    }

    if (n === 2) {
      const term1 = matrix[0][0].multiply(matrix[1][1]);
      const term2 = matrix[0][1].multiply(matrix[1][0]);
      const det = term1.subtract(term2);
      
      steps.push({
        id: stepCounter++,
        title: `Determinante 2×2 (Nivel ${level})`,
        description: `det = (${matrix[0][0].toString()})(${matrix[1][1].toString()}) - (${matrix[0][1].toString()})(${matrix[1][0].toString()}) = ${det.toString()}`,
        matrix: FractionMatrixUtils.toNumberMatrix(matrix),
        fractionMatrix: FractionMatrixUtils.cloneMatrix(matrix),
        operation: `det = ${det.toString()}`
      });
      return { determinant: det, nextStepId: stepCounter };
    }

    // Expansión por la primera fila
    steps.push({
      id: stepCounter++,
      title: `Expansión por Fila ${row + 1} (Nivel ${level})`,
      description: `Expandimos por la fila ${row + 1}: det(A) = Σ(aᵢⱼ × Cᵢⱼ) donde Cᵢⱼ es el cofactor`,
      matrix: FractionMatrixUtils.toNumberMatrix(matrix),
      fractionMatrix: FractionMatrixUtils.cloneMatrix(matrix),
      operation: `Expansión por fila ${row + 1}`
    });

    let determinant = new Fraction(0, 1);
    let currentStepId = stepCounter;

    for (let j = 0; j < n; j++) {
      if (matrix[row][j].isZero()) {
        steps.push({
          id: currentStepId++,
          title: `Término (${row + 1},${j + 1}) = 0`,
          description: `a${row + 1}${j + 1} = 0, por lo que este término no contribuye al determinante`,
          matrix: FractionMatrixUtils.toNumberMatrix(matrix),
          fractionMatrix: FractionMatrixUtils.cloneMatrix(matrix),
          operation: `Término omitido (elemento = 0)`
        });
        continue;
      }

      // Obtener la menor
      const minor = this.getMinorFraction(matrix, row, j);
      const sign = new Fraction(Math.pow(-1, row + j), 1);
      
      steps.push({
        id: currentStepId++,
        title: `Menor M${row + 1}${j + 1} (Nivel ${level})`,
        description: `Menor obtenida eliminando fila ${row + 1} y columna ${j + 1}`,
        matrix: FractionMatrixUtils.toNumberMatrix(minor),
        fractionMatrix: FractionMatrixUtils.cloneMatrix(minor),
        operation: `Menor M${row + 1}${j + 1}`
      });

      // Calcular el determinante de la menor recursivamente
      const minorResult = this.expandByRow(minor, 0, steps, currentStepId, level + 1);
      currentStepId = minorResult.nextStepId;
      
      const cofactor = sign.multiply(minorResult.determinant);
      const contribution = matrix[row][j].multiply(cofactor);
      determinant = determinant.add(contribution);

      steps.push({
        id: currentStepId++,
        title: `Cofactor C${row + 1}${j + 1} (Nivel ${level})`,
        description: `C${row + 1}${j + 1} = (-1)^${row + j} × det(M${row + 1}${j + 1}) = ${sign.toString()} × ${minorResult.determinant.toString()} = ${cofactor.toString()}`,
        matrix: FractionMatrixUtils.toNumberMatrix(matrix),
        fractionMatrix: FractionMatrixUtils.cloneMatrix(matrix),
        operation: `C${row + 1}${j + 1} = ${cofactor.toString()}`
      });

      steps.push({
        id: currentStepId++,
        title: `Contribución del Término (${row + 1},${j + 1})`,
        description: `Término: a${row + 1}${j + 1} × C${row + 1}${j + 1} = ${matrix[row][j].toString()} × ${cofactor.toString()} = ${contribution.toString()}`,
        matrix: FractionMatrixUtils.toNumberMatrix(matrix),
        fractionMatrix: FractionMatrixUtils.cloneMatrix(matrix),
        operation: `+${contribution.toString()}`
      });
    }

    steps.push({
      id: currentStepId++,
      title: `Determinante Final (Nivel ${level})`,
      description: `Suma de todos los términos de la expansión`,
      matrix: FractionMatrixUtils.toNumberMatrix(matrix),
      fractionMatrix: FractionMatrixUtils.cloneMatrix(matrix),
      operation: `det = ${determinant.toString()}`
    });

    return { determinant, nextStepId: currentStepId };
  }

  /**
   * Obtiene la menor de un elemento (versión con fracciones)
   */
  private static getMinorFraction(matrix: FractionMatrix, excludeRow: number, excludeCol: number): FractionMatrix {
    return matrix
      .filter((_, rowIndex) => rowIndex !== excludeRow)
      .map(row => row.filter((_, colIndex) => colIndex !== excludeCol));
  }

  /**
   * Encuentra la mejor fila o columna para expandir
   */
  private static findOptimalExpansionRowOrColumn(matrix: FractionMatrix): { type: 'row' | 'column'; index: number; zeroCount: number } {
    const n = matrix.length;
    let maxZeros = -1;
    let bestType: 'row' | 'column' = 'row';
    let bestIndex = 0;

    // Revisar filas
    for (let i = 0; i < n; i++) {
      let zeros = 0;
      for (let j = 0; j < n; j++) {
        if (matrix[i][j].isZero()) zeros++;
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
        if (matrix[i][j].isZero()) zeros++;
      }
      if (zeros > maxZeros) {
        maxZeros = zeros;
        bestType = 'column';
        bestIndex = j;
      }
    }

    return { type: bestType, index: bestIndex, zeroCount: maxZeros };
  }

  /**
   * Expande por una columna específica
   */
  private static expandByColumn(
    matrix: FractionMatrix,
    col: number,
    steps: CalculationStep[],
    stepCounter: number,
    level: number
  ): { determinant: Fraction; nextStepId: number } {
    const n = matrix.length;
    
    if (n === 1) {
      return { determinant: matrix[0][0].clone(), nextStepId: stepCounter };
    }

    if (n === 2) {
      const term1 = matrix[0][0].multiply(matrix[1][1]);
      const term2 = matrix[0][1].multiply(matrix[1][0]);
      return { determinant: term1.subtract(term2), nextStepId: stepCounter };
    }

    let determinant = new Fraction(0, 1);
    let currentStepId = stepCounter;

    for (let i = 0; i < n; i++) {
      if (matrix[i][col].isZero()) continue;

      const minor = this.getMinorFraction(matrix, i, col);
      const sign = new Fraction(Math.pow(-1, i + col), 1);
      
      const minorResult = this.expandByColumn(minor, this.findOptimalExpansionRowOrColumn(minor).index, steps, currentStepId, level + 1);
      currentStepId = minorResult.nextStepId;
      
      const cofactor = sign.multiply(minorResult.determinant);
      const contribution = matrix[i][col].multiply(cofactor);
      determinant = determinant.add(contribution);
    }

    return { determinant, nextStepId: currentStepId };
  }

  /**
   * Construye la fórmula de expansión con los valores calculados de los menores
   */
  private static buildExpansionFormulaWithValues(matrix: FractionMatrix, index: number, type: 'row' | 'column'): string {
    const n = matrix.length;
    const terms: string[] = [];

    if (type === 'row') {
      for (let j = 0; j < n; j++) {
        const value = matrix[index][j];
        const minor = this.getMinorFraction(matrix, index, j);
        const minorDet = this.calculateSimpleDeterminant(minor);
        const signValue = Math.pow(-1, index + j);
        const sign = signValue > 0 ? '+' : '-';
        const displaySign = j === 0 ? (sign === '-' ? '-' : '') : ` ${sign} `;
        
        terms.push(`${displaySign}(${Math.abs(value.toDecimal())}) × (${minorDet.toString()})`);
      }
    } else {
      for (let i = 0; i < n; i++) {
        const value = matrix[i][index];
        const minor = this.getMinorFraction(matrix, i, index);
        const minorDet = this.calculateSimpleDeterminant(minor);
        const signValue = Math.pow(-1, i + index);
        const sign = signValue > 0 ? '+' : '-';
        const displaySign = i === 0 ? (sign === '-' ? '-' : '') : ` ${sign} `;
        
        terms.push(`${displaySign}(${Math.abs(value.toDecimal())}) × (${minorDet.toString()})`);
      }
    }

    return `det = ${terms.join('')}`;
  }

  /**
   * Calcula el determinante de forma simple sin generar pasos (para uso interno)
   */
  private static calculateSimpleDeterminant(matrix: FractionMatrix): Fraction {
    const n = matrix.length;

    if (n === 1) {
      return matrix[0][0].clone();
    }

    if (n === 2) {
      const term1 = matrix[0][0].multiply(matrix[1][1]);
      const term2 = matrix[0][1].multiply(matrix[1][0]);
      return term1.subtract(term2);
    }

    // Encontrar la mejor fila/columna para expandir
    const optimal = this.findOptimalExpansionRowOrColumn(matrix);
    let determinant = new Fraction(0, 1);

    if (optimal.type === 'row') {
      const row = optimal.index;
      for (let j = 0; j < n; j++) {
        if (matrix[row][j].isZero()) continue;
        const minor = this.getMinorFraction(matrix, row, j);
        const sign = new Fraction(Math.pow(-1, row + j), 1);
        const minorDet = this.calculateSimpleDeterminant(minor);
        determinant = determinant.add(sign.multiply(matrix[row][j]).multiply(minorDet));
      }
    } else {
      const col = optimal.index;
      for (let i = 0; i < n; i++) {
        if (matrix[i][col].isZero()) continue;
        const minor = this.getMinorFraction(matrix, i, col);
        const sign = new Fraction(Math.pow(-1, i + col), 1);
        const minorDet = this.calculateSimpleDeterminant(minor);
        determinant = determinant.add(sign.multiply(matrix[i][col]).multiply(minorDet));
      }
    }

    return determinant;
  }

  /**
   * Resuelve un sistema usando la Regla de Cramer (que usa determinantes) con fracciones
   */
  static solveByCramersRule(coefficientMatrix: Matrix, constantVector: Vector): {
    steps: CalculationStep[];
    solution: Solution;
  } {
    const steps: CalculationStep[] = [];
    const n = coefficientMatrix.length;
    let stepCounter = 1;

    const fractionMatrix = FractionMatrixUtils.fromNumberMatrix(coefficientMatrix);
    const fractionConstants = FractionMatrixUtils.fromNumberVector(constantVector);

    steps.push({
      id: stepCounter++,
      title: 'Sistema de Ecuaciones',
      description: 'Resolveremos usando la Regla de Cramer con fracciones exactas, que requiere calcular determinantes',
      matrix: FractionMatrixUtils.toNumberMatrix(FractionMatrixUtils.createAugmentedMatrix(fractionMatrix, fractionConstants)),
      fractionMatrix: FractionMatrixUtils.createAugmentedMatrix(fractionMatrix, fractionConstants),
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

    const mainDeterminant = mainDetResult.fractionDeterminant;

    // Verificar si el sistema tiene solución única
    if (mainDeterminant.isZero()) {
      steps.push({
        id: stepCounter,
        title: 'Sistema Singular',
        description: 'El determinante principal es 0, por lo que el sistema no tiene solución única o no tiene solución',
        matrix: FractionMatrixUtils.toNumberMatrix(fractionMatrix),
        fractionMatrix: FractionMatrixUtils.cloneMatrix(fractionMatrix),
        operation: 'det(A) = 0 → Sistema singular'
      });

      return {
        steps,
        solution: {
          variables: [],
          determinant: mainDeterminant.toDecimal(),
          fractionDeterminant: mainDeterminant,
          isUnique: false,
          hasInfiniteSolutions: true,
          hasNoSolution: false
        }
      };
    }

    // Calcular determinantes para cada variable
    const variables: Fraction[] = [];

    for (let i = 0; i < n; i++) {
      // Crear matriz reemplazando la columna i con el vector de constantes
      const modifiedMatrix = fractionMatrix.map((row, rowIndex) => 
        row.map((val, colIndex) => 
          colIndex === i ? fractionConstants[rowIndex] : val.clone()
        )
      );

      steps.push({
        id: stepCounter++,
        title: `Matriz para x${i + 1}`,
        description: `Reemplazamos la columna ${i + 1} de la matriz original con el vector de constantes`,
        matrix: FractionMatrixUtils.toNumberMatrix(modifiedMatrix),
        fractionMatrix: FractionMatrixUtils.cloneMatrix(modifiedMatrix),
        operation: `Matriz A${i + 1}`
      });

      const varDetResult = this.calculateDeterminant(FractionMatrixUtils.toNumberMatrix(modifiedMatrix));
      steps.push(...varDetResult.steps.map(step => ({
        ...step,
        id: stepCounter++,
        title: `Det A${i + 1} - ${step.title}`,
        description: `Para x${i + 1}: ${step.description}`
      })));

      const variableDeterminant = varDetResult.fractionDeterminant;
      const variableValue = variableDeterminant.divide(mainDeterminant);
      variables[i] = variableValue;

      steps.push({
        id: stepCounter++,
        title: `Cálculo de x${i + 1}`,
        description: `x${i + 1} = det(A${i + 1}) / det(A) = ${variableDeterminant.toString()} / ${mainDeterminant.toString()} = ${variableValue.toString()}`,
        matrix: FractionMatrixUtils.toNumberMatrix(modifiedMatrix),
        fractionMatrix: FractionMatrixUtils.cloneMatrix(modifiedMatrix),
        operation: `x${i + 1} = ${variableValue.toString()}`
      });
    }

    steps.push({
      id: stepCounter,
      title: 'Solución Completa',
      description: 'Todas las variables han sido calculadas usando la Regla de Cramer con fracciones exactas',
      matrix: FractionMatrixUtils.toNumberMatrix(FractionMatrixUtils.createAugmentedMatrix(fractionMatrix, fractionConstants)),
      fractionMatrix: FractionMatrixUtils.createAugmentedMatrix(fractionMatrix, fractionConstants),
      operation: `Solución: [${variables.map(v => v.toString()).join(', ')}]`
    });

    return {
      steps,
      solution: {
        variables: variables.map(f => f.toDecimal()),
        fractionVariables: variables,
        determinant: mainDeterminant.toDecimal(),
        fractionDeterminant: mainDeterminant,
        isUnique: true,
        hasInfiniteSolutions: false,
        hasNoSolution: false
      }
    };
  }
}