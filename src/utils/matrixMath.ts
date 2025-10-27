import type { Matrix, Vector } from '../types/matrix';

export class MatrixMath {
  
  /**
   * Crea una matriz identidad del tamaño especificado
   */
  static createIdentityMatrix(size: number): Matrix {
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
    );
  }

  /**
   * Crea una copia profunda de una matriz
   */
  static cloneMatrix(matrix: Matrix): Matrix {
    return matrix.map(row => [...row]);
  }

  /**
   * Crea una copia de un vector
   */
  static cloneVector(vector: Vector): Vector {
    return [...vector];
  }

  /**
   * Intercambia dos filas en una matriz
   */
  static swapRows(matrix: Matrix, row1: number, row2: number): Matrix {
    const result = this.cloneMatrix(matrix);
    [result[row1], result[row2]] = [result[row2], result[row1]];
    return result;
  }

  /**
   * Intercambia dos elementos en un vector
   */
  static swapVectorElements(vector: Vector, index1: number, index2: number): Vector {
    const result = this.cloneVector(vector);
    [result[index1], result[index2]] = [result[index2], result[index1]];
    return result;
  }

  /**
   * Multiplica una fila por un escalar
   */
  static multiplyRow(matrix: Matrix, rowIndex: number, scalar: number): Matrix {
    const result = this.cloneMatrix(matrix);
    result[rowIndex] = result[rowIndex].map(val => val * scalar);
    return result;
  }

  /**
   * Multiplica un elemento del vector por un escalar
   */
  static multiplyVectorElement(vector: Vector, index: number, scalar: number): Vector {
    const result = this.cloneVector(vector);
    result[index] *= scalar;
    return result;
  }

  /**
   * Suma a una fila el múltiplo de otra fila
   */
  static addRowMultiple(
    matrix: Matrix,
    targetRow: number,
    sourceRow: number,
    multiplier: number
  ): Matrix {
    const result = this.cloneMatrix(matrix);
    for (let j = 0; j < matrix[0].length; j++) {
      result[targetRow][j] += result[sourceRow][j] * multiplier;
    }
    return result;
  }

  /**
   * Suma a un elemento del vector el múltiplo de otro elemento
   */
  static addVectorElementMultiple(
    vector: Vector,
    targetIndex: number,
    sourceIndex: number,
    multiplier: number
  ): Vector {
    const result = this.cloneVector(vector);
    result[targetIndex] += result[sourceIndex] * multiplier;
    return result;
  }

  /**
   * Encuentra el pivote en una columna (elemento con mayor valor absoluto)
   */
  static findPivot(matrix: Matrix, startRow: number, col: number): number {
    let maxRow = startRow;
    let maxValue = Math.abs(matrix[startRow][col]);
    
    for (let i = startRow + 1; i < matrix.length; i++) {
      const value = Math.abs(matrix[i][col]);
      if (value > maxValue) {
        maxValue = value;
        maxRow = i;
      }
    }
    
    return maxRow;
  }

  /**
   * Calcula el determinante de una matriz usando expansión por cofactores
   */
  static calculateDeterminant(matrix: Matrix): number {
    const n = matrix.length;
    
    if (n === 1) {
      return matrix[0][0];
    }
    
    if (n === 2) {
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    
    let determinant = 0;
    
    for (let j = 0; j < n; j++) {
      const cofactor = this.getCofactor(matrix, 0, j);
      determinant += matrix[0][j] * cofactor;
    }
    
    return determinant;
  }

  /**
   * Obtiene el cofactor de un elemento en la matriz
   */
  static getCofactor(matrix: Matrix, row: number, col: number): number {
    const minor = this.getMinor(matrix, row, col);
    const sign = Math.pow(-1, row + col);
    return sign * this.calculateDeterminant(minor);
  }

  /**
   * Obtiene la menor de un elemento (matriz sin la fila y columna especificadas)
   */
  static getMinor(matrix: Matrix, excludeRow: number, excludeCol: number): Matrix {
    return matrix
      .filter((_, rowIndex) => rowIndex !== excludeRow)
      .map(row => row.filter((_, colIndex) => colIndex !== excludeCol));
  }

  /**
   * Formatea una matriz para mostrar en la interfaz
   */
  static formatMatrix(matrix: Matrix, precision: number = 4): string {
    return matrix
      .map(row => 
        '[' + row.map(val => this.formatNumber(val, precision)).join(', ') + ']'
      )
      .join('\n');
  }

  /**
   * Formatea un número con la precisión especificada
   */
  static formatNumber(num: number, precision: number = 4): string {
    if (Math.abs(num) < 1e-10) return '0';
    return Number(num.toFixed(precision)).toString();
  }

  /**
   * Verifica si una matriz es singular (determinante = 0)
   */
  static isSingular(matrix: Matrix): boolean {
    const det = this.calculateDeterminant(matrix);
    return Math.abs(det) < 1e-10;
  }

  /**
   * Verifica si un sistema tiene solución única
   */
  static hasUniqueSolution(coefficientMatrix: Matrix, augmentedMatrix: Matrix): boolean {
    const coeffRank = this.getRank(coefficientMatrix);
    const augRank = this.getRank(augmentedMatrix);
    
    return coeffRank === augRank && coeffRank === coefficientMatrix.length;
  }

  /**
   * Calcula el rango de una matriz
   */
  static getRank(matrix: Matrix): number {
    const temp = this.cloneMatrix(matrix);
    const rows = temp.length;
    const cols = temp[0].length;
    
    let rank = 0;
    
    for (let col = 0, row = 0; col < cols && row < rows; col++) {
      // Encontrar pivote
      let pivotRow = row;
      for (let i = row + 1; i < rows; i++) {
        if (Math.abs(temp[i][col]) > Math.abs(temp[pivotRow][col])) {
          pivotRow = i;
        }
      }
      
      if (Math.abs(temp[pivotRow][col]) < 1e-10) {
        continue; // Columna de ceros
      }
      
      // Intercambiar filas
      if (pivotRow !== row) {
        [temp[row], temp[pivotRow]] = [temp[pivotRow], temp[row]];
      }
      
      // Eliminar columna
      for (let i = row + 1; i < rows; i++) {
        const factor = temp[i][col] / temp[row][col];
        for (let j = col; j < cols; j++) {
          temp[i][j] -= factor * temp[row][j];
        }
      }
      
      rank++;
      row++;
    }
    
    return rank;
  }

  /**
   * Crea una matriz aumentada combinando la matriz de coeficientes y el vector de constantes
   */
  static createAugmentedMatrix(coefficientMatrix: Matrix, constantVector: Vector): Matrix {
    return coefficientMatrix.map((row, i) => [...row, constantVector[i]]);
  }
}