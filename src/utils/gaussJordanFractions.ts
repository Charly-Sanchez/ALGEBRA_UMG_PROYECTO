import type { Matrix, Vector, CalculationStep, Solution } from '../types/matrix';
import type { FractionMatrix } from './fraction';
import { Fraction, FractionMatrixUtils } from './fraction';

export class GaussJordanFractions {
  static solve(matrix: Matrix, constants: Vector): { steps: CalculationStep[]; solution: Solution } {
    const steps: CalculationStep[] = [];
    let stepId = 1;
    
    // Convertir a fracciones para cálculos exactos
    const fractionMatrix = FractionMatrixUtils.fromNumberMatrix(matrix);
    const fractionConstants = FractionMatrixUtils.fromNumberVector(constants);
    
    // Crear matriz aumentada
    const augmentedMatrix: FractionMatrix = fractionMatrix.map((row, i) => 
      [...row, fractionConstants[i]]
    );
    
    const n = matrix.length;
    const m = augmentedMatrix[0].length;
    
    // Paso inicial
    steps.push({
      id: stepId++,
      title: "Matriz Inicial",
      description: "Matriz aumentada inicial del sistema de ecuaciones (Método Gauss-Jordan)",
      matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix.map(row => row.slice(0, -1))),
      fractionMatrix: augmentedMatrix.map(row => row.slice(0, -1)),
      operation: "inicial"
    });

    // FASE 1: Eliminación hacia adelante (formar escalón)
    for (let i = 0; i < n; i++) {
      // Buscar el pivote más grande (pivoteo parcial)
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        const currentAbs = augmentedMatrix[k][i].abs().toDecimal();
        const maxAbs = augmentedMatrix[maxRow][i].abs().toDecimal();
        if (currentAbs > maxAbs) {
          maxRow = k;
        }
      }
      
      // Intercambiar filas si es necesario
      if (maxRow !== i) {
        [augmentedMatrix[i], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[i]];
        
        steps.push({
          id: stepId++,
          title: `Intercambio de Filas`,
          description: `Intercambiar fila ${i + 1} ↔ fila ${maxRow + 1} para obtener mejor pivote`,
          matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix.map(row => row.slice(0, -1))),
          fractionMatrix: augmentedMatrix.map(row => row.slice(0, -1)),
          operation: `R${i + 1} ↔ R${maxRow + 1}`,
          rowIndex: i,
          pivotElement: augmentedMatrix[i][i].toDecimal(),
          pivotFraction: augmentedMatrix[i][i]
        });
      }
      
      // Verificar si el pivote es cero
      if (augmentedMatrix[i][i].isZero()) {
        const noSolution: Solution = {
          isUnique: false,
          hasNoSolution: true,
          hasInfiniteSolutions: false,
          variables: [],
          fractionVariables: []
        };
        return { steps, solution: noSolution };
      }
      
      // Hacer que el elemento pivote sea 1
      const pivot = augmentedMatrix[i][i];
      if (!pivot.equals(new Fraction(1, 1))) {
        for (let j = 0; j < m; j++) {
          augmentedMatrix[i][j] = augmentedMatrix[i][j].divide(pivot);
        }
        
        steps.push({
          id: stepId++,
          title: `Normalizar Pivote`,
          description: `Dividir fila ${i + 1} por ${pivot.toString()} para hacer el pivote = 1`,
          matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix.map(row => row.slice(0, -1))),
          fractionMatrix: augmentedMatrix.map(row => row.slice(0, -1)),
          operation: `R${i + 1} = R${i + 1} ÷ (${pivot.toString()})`,
          rowIndex: i,
          pivotElement: 1,
          pivotFraction: new Fraction(1, 1)
        });
      }
      
      // Eliminar elementos debajo del pivote
      for (let k = i + 1; k < n; k++) {
        if (!augmentedMatrix[k][i].isZero()) {
          const factor = augmentedMatrix[k][i];
          
          for (let j = 0; j < m; j++) {
            augmentedMatrix[k][j] = augmentedMatrix[k][j].subtract(
              factor.multiply(augmentedMatrix[i][j])
            );
          }
          
          steps.push({
            id: stepId++,
            title: `Eliminación hacia Adelante`,
            description: `Eliminar elemento en posición (${k + 1}, ${i + 1}) usando fila ${i + 1}`,
            matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix.map(row => row.slice(0, -1))),
            fractionMatrix: augmentedMatrix.map(row => row.slice(0, -1)),
            operation: `R${k + 1} = R${k + 1} - (${factor.toString()}) × R${i + 1}`,
            rowIndex: k,
            pivotElement: augmentedMatrix[i][i].toDecimal(),
            pivotFraction: augmentedMatrix[i][i]
          });
        }
      }
    }

    // FASE 2: Eliminación hacia atrás (forma escalonada reducida)
    for (let i = n - 1; i >= 0; i--) {
      // Eliminar elementos encima del pivote
      for (let k = i - 1; k >= 0; k--) {
        if (!augmentedMatrix[k][i].isZero()) {
          const factor = augmentedMatrix[k][i];
          
          for (let j = 0; j < m; j++) {
            augmentedMatrix[k][j] = augmentedMatrix[k][j].subtract(
              factor.multiply(augmentedMatrix[i][j])
            );
          }
          
          steps.push({
            id: stepId++,
            title: `Eliminación hacia Atrás`,
            description: `Eliminar elemento en posición (${k + 1}, ${i + 1}) usando fila ${i + 1}`,
            matrix: FractionMatrixUtils.toNumberMatrix(augmentedMatrix.map(row => row.slice(0, -1))),
            fractionMatrix: augmentedMatrix.map(row => row.slice(0, -1)),
            operation: `R${k + 1} = R${k + 1} - (${factor.toString()}) × R${i + 1}`,
            rowIndex: k,
            pivotElement: augmentedMatrix[i][i].toDecimal(),
            pivotFraction: augmentedMatrix[i][i]
          });
        }
      }
    }

    // Extraer solución de la matriz identidad
    const fractionSolution: Fraction[] = [];
    for (let i = 0; i < n; i++) {
      fractionSolution.push(augmentedMatrix[i][m - 1]);
    }

    const solution: Solution = {
      isUnique: true,
      hasNoSolution: false,
      hasInfiniteSolutions: false,
      variables: FractionMatrixUtils.toNumberVector(fractionSolution),
      fractionVariables: fractionSolution,
      determinant: 1
    };

    return { steps, solution };
  }
}