/**
 * Clase para representar y manipular fracciones
 */
export class Fraction {
  public numerator: number;
  public denominator: number;

  constructor(numerator: number, denominator: number = 1) {
    if (denominator === 0) {
      throw new Error("El denominador no puede ser cero");
    }
    
    // Simplificar la fracción y manejar signos
    const gcd = this.gcd(Math.abs(numerator), Math.abs(denominator));
    this.numerator = numerator / gcd;
    this.denominator = denominator / gcd;
    
    // Asegurar que el denominador sea positivo
    if (this.denominator < 0) {
      this.numerator = -this.numerator;
      this.denominator = -this.denominator;
    }
  }

  /**
   * Calcula el máximo común divisor
   */
  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  /**
   * Convierte un decimal a fracción
   */
  static fromDecimal(decimal: number, maxDenominator: number = 10000): Fraction {
    if (decimal === 0) return new Fraction(0, 1);
    
    const sign = decimal < 0 ? -1 : 1;
    decimal = Math.abs(decimal);
    
    // Si es un entero
    if (Number.isInteger(decimal)) {
      return new Fraction(sign * decimal, 1);
    }
    
    // Método de fracciones continuas para mayor precisión
    let h1 = 1, h2 = 0;
    let k1 = 0, k2 = 1;
    let x = decimal;
    
    do {
      const a = Math.floor(x);
      const aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      
      const aux2 = k1;
      k1 = a * k1 + k2;
      k2 = aux2;
      
      if (k1 > maxDenominator) break;
      
      x = 1 / (x - a);
    } while (Math.abs(decimal - h1 / k1) > 1e-10 && x !== Infinity);
    
    return new Fraction(sign * h1, k1);
  }

  /**
   * Suma dos fracciones
   */
  add(other: Fraction): Fraction {
    const newNum = this.numerator * other.denominator + other.numerator * this.denominator;
    const newDen = this.denominator * other.denominator;
    return new Fraction(newNum, newDen);
  }

  /**
   * Resta dos fracciones
   */
  subtract(other: Fraction): Fraction {
    const newNum = this.numerator * other.denominator - other.numerator * this.denominator;
    const newDen = this.denominator * other.denominator;
    return new Fraction(newNum, newDen);
  }

  /**
   * Multiplica dos fracciones
   */
  multiply(other: Fraction): Fraction {
    return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator);
  }

  /**
   * Divide dos fracciones
   */
  divide(other: Fraction): Fraction {
    if (other.numerator === 0) {
      throw new Error("No se puede dividir por cero");
    }
    return new Fraction(this.numerator * other.denominator, this.denominator * other.numerator);
  }

  /**
   * Convierte la fracción a decimal
   */
  toDecimal(): number {
    return this.numerator / this.denominator;
  }

  /**
   * Verifica si es un entero
   */
  isInteger(): boolean {
    return this.denominator === 1;
  }

  /**
   * Verifica si es cero
   */
  isZero(): boolean {
    return this.numerator === 0;
  }

  /**
   * Obtiene el valor absoluto
   */
  abs(): Fraction {
    return new Fraction(Math.abs(this.numerator), this.denominator);
  }

  /**
   * Negación de la fracción
   */
  negate(): Fraction {
    return new Fraction(-this.numerator, this.denominator);
  }

  /**
   * Compara si dos fracciones son iguales
   */
  equals(other: Fraction): boolean {
    return this.numerator === other.numerator && this.denominator === other.denominator;
  }

  /**
   * Compara si esta fracción es menor que otra
   */
  lessThan(other: Fraction): boolean {
    return this.numerator * other.denominator < other.numerator * this.denominator;
  }

  /**
   * Representación como string
   */
  toString(): string {
    if (this.denominator === 1) {
      return this.numerator.toString();
    }
    return `${this.numerator}/${this.denominator}`;
  }

  /**
   * Representación HTML para mostrar como fracción visual
   */
  toHTML(): string {
    if (this.denominator === 1) {
      return this.numerator.toString();
    }
    
    const sign = this.numerator < 0 ? '-' : '';
    const absNum = Math.abs(this.numerator);
    
    return `${sign}<span class="fraction"><span class="numerator">${absNum}</span><span class="denominator">${this.denominator}</span></span>`;
  }

  /**
   * Representación LaTeX
   */
  toLatex(): string {
    if (this.denominator === 1) {
      return this.numerator.toString();
    }
    
    const sign = this.numerator < 0 ? '-' : '';
    const absNum = Math.abs(this.numerator);
    
    return `${sign}\\frac{${absNum}}{${this.denominator}}`;
  }

  /**
   * Crea una copia de la fracción
   */
  clone(): Fraction {
    return new Fraction(this.numerator, this.denominator);
  }
}

/**
 * Matriz de fracciones
 */
export type FractionMatrix = Fraction[][];
export type FractionVector = Fraction[];

/**
 * Utilidades para trabajar con matrices de fracciones
 */
export class FractionMatrixUtils {
  
  /**
   * Convierte una matriz de números a matriz de fracciones
   */
  static fromNumberMatrix(matrix: number[][]): FractionMatrix {
    return matrix.map(row => 
      row.map(num => Fraction.fromDecimal(num))
    );
  }

  /**
   * Convierte un vector de números a vector de fracciones
   */
  static fromNumberVector(vector: number[]): FractionVector {
    return vector.map(num => Fraction.fromDecimal(num));
  }

  /**
   * Convierte una matriz de fracciones a matriz de números
   */
  static toNumberMatrix(matrix: FractionMatrix): number[][] {
    return matrix.map(row => 
      row.map(fraction => fraction.toDecimal())
    );
  }

  /**
   * Convierte un vector de fracciones a vector de números
   */
  static toNumberVector(vector: FractionVector): number[] {
    return vector.map(fraction => fraction.toDecimal());
  }

  /**
   * Formatea una matriz de fracciones para visualización
   */
  static formatMatrix(matrix: FractionMatrix): string {
    return matrix
      .map(row => 
        '[' + row.map(fraction => fraction.toString()).join(', ') + ']'
      )
      .join('\n');
  }

  /**
   * Crea una matriz de fracciones aumentada
   */
  static createAugmentedMatrix(coeffMatrix: FractionMatrix, constants: FractionVector): FractionMatrix {
    return coeffMatrix.map((row, i) => [...row, constants[i]]);
  }

  /**
   * Intercambia dos filas en una matriz de fracciones
   */
  static swapRows(matrix: FractionMatrix, row1: number, row2: number): FractionMatrix {
    const result = matrix.map(row => row.map(f => f.clone()));
    [result[row1], result[row2]] = [result[row2], result[row1]];
    return result;
  }

  /**
   * Multiplica una fila por una fracción
   */
  static multiplyRow(matrix: FractionMatrix, rowIndex: number, multiplier: Fraction): FractionMatrix {
    const result = matrix.map(row => row.map(f => f.clone()));
    result[rowIndex] = result[rowIndex].map(f => f.multiply(multiplier));
    return result;
  }

  /**
   * Suma a una fila el múltiplo de otra fila
   */
  static addRowMultiple(
    matrix: FractionMatrix,
    targetRow: number,
    sourceRow: number,
    multiplier: Fraction
  ): FractionMatrix {
    const result = matrix.map(row => row.map(f => f.clone()));
    
    for (let j = 0; j < matrix[0].length; j++) {
      const product = result[sourceRow][j].multiply(multiplier);
      result[targetRow][j] = result[targetRow][j].add(product);
    }
    
    return result;
  }

  /**
   * Encuentra el mejor pivote en una columna
   */
  static findPivot(matrix: FractionMatrix, startRow: number, col: number): number {
    let maxRow = startRow;
    let maxValue = matrix[startRow][col].abs();
    
    for (let i = startRow + 1; i < matrix.length; i++) {
      const value = matrix[i][col].abs();
      if (!value.isZero() && (maxValue.isZero() || value.toDecimal() > maxValue.toDecimal())) {
        maxValue = value;
        maxRow = i;
      }
    }
    
    return maxRow;
  }

  /**
   * Verifica si una matriz es singular (todas las fracciones en la diagonal son cero)
   */
  static isSingular(matrix: FractionMatrix): boolean {
    for (let i = 0; i < matrix.length; i++) {
      if (matrix[i][i].isZero()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Crea una matriz identidad de fracciones
   */
  static createIdentityMatrix(size: number): FractionMatrix {
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => 
        new Fraction(i === j ? 1 : 0, 1)
      )
    );
  }

  /**
   * Clona una matriz de fracciones
   */
  static cloneMatrix(matrix: FractionMatrix): FractionMatrix {
    return matrix.map(row => row.map(f => f.clone()));
  }

  /**
   * Clona un vector de fracciones
   */
  static cloneVector(vector: FractionVector): FractionVector {
    return vector.map(f => f.clone());
  }
}