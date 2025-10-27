import type { Matrix, CalculationStep } from '../types/matrix';
import { Fraction, FractionMatrixUtils } from './fraction';

export class GaussJordanDeterminant {
  /**
   * Calcula el determinante usando eliminación de Gauss-Jordan optimizada
   */
  static calculateDeterminant(matrix: Matrix): {
    steps: CalculationStep[];
    determinant: Fraction;
  } {
    const steps: CalculationStep[] = [];
    let stepId = 1;
    
    const n = matrix.length;
    const fractionMatrix = FractionMatrixUtils.fromNumberMatrix(matrix);
    let determinant = new Fraction(1, 1);
    let swapCount = 0;

    steps.push({
      id: stepId++,
      title: 'Matriz Original',
      description: 'Calculamos el determinante usando eliminación gaussiana optimizada.',
      matrix,
      operation: 'det(A) = ?',
    });

    // Copia de trabajo
    const workMatrix = fractionMatrix.map(row => row.map(f => f.clone()));

    // Eliminación hacia adelante (optimizada)
    for (let i = 0; i < n; i++) {
      // Buscar el pivote (elemento no cero más grande)
      let pivotRow = i;
      for (let k = i + 1; k < n; k++) {
        if (workMatrix[k][i].abs().toDecimal() > workMatrix[pivotRow][i].abs().toDecimal()) {
          pivotRow = k;
        }
      }

      // Si el pivote es cero, el determinante es cero
      if (workMatrix[pivotRow][i].isZero()) {
        steps.push({
          id: stepId++,
          title: 'Determinante Cero',
          description: `La columna ${i + 1} tiene ceros en todas las posiciones restantes. El determinante es 0.`,
          matrix: workMatrix.map(r => r.map(f => f.toDecimal())),
          operation: 'det(A) = 0',
        });
        return {
          steps,
          determinant: new Fraction(0, 1),
        };
      }

      // Intercambiar filas si es necesario
      if (pivotRow !== i) {
        [workMatrix[i], workMatrix[pivotRow]] = [workMatrix[pivotRow], workMatrix[i]];
        swapCount++;
        
        steps.push({
          id: stepId++,
          title: `Intercambio de Filas R${i + 1} ↔ R${pivotRow + 1}`,
          description: `Intercambiamos las filas ${i + 1} y ${pivotRow + 1} para obtener un mejor pivote.`,
          matrix: workMatrix.map(r => r.map(f => f.toDecimal())),
          operation: `Intercambio de filas (cambia signo del determinante)`,
        });
      }

      // El pivote actual
      const pivot = workMatrix[i][i];
      determinant = determinant.multiply(pivot);

      // Eliminar elementos debajo del pivote
      let hasElimination = false;
      for (let k = i + 1; k < n; k++) {
        if (!workMatrix[k][i].isZero()) {
          hasElimination = true;
          const factor = workMatrix[k][i].divide(pivot);
          
          // Realizar eliminación
          for (let j = i; j < n; j++) {
            workMatrix[k][j] = workMatrix[k][j].subtract(factor.multiply(workMatrix[i][j]));
          }
        }
      }

      if (hasElimination) {
        steps.push({
          id: stepId++,
          title: `Eliminación Columna ${i + 1}`,
          description: `Eliminamos los elementos debajo del pivote a${i + 1},${i + 1} = ${pivot.toString()}.`,
          matrix: workMatrix.map(r => r.map(f => f.toDecimal())),
          operation: `Eliminación gaussiana`,
        });
      }
    }

    // Ajustar signo por intercambios
    if (swapCount % 2 !== 0) {
      determinant = determinant.multiply(new Fraction(-1, 1));
    }

    // Resultado final
    steps.push({
      id: stepId++,
      title: 'Determinante Final',
      description: `El determinante es el producto de los elementos de la diagonal principal${swapCount > 0 ? ` (con ajuste de signo por ${swapCount} intercambio${swapCount > 1 ? 's' : ''})` : ''}.`,
      matrix: workMatrix.map(r => r.map(f => f.toDecimal())),
      operation: `det(A) = ${determinant.toString()}`,
    });

    return {
      steps,
      determinant,
    };
  }
}