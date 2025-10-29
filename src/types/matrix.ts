import type { Fraction, FractionMatrix } from '../utils/fraction';

export type Matrix = number[][];
export type Vector = number[];

export interface CalculationStep {
  id: number;
  title: string;
  description: string;
  matrix: Matrix;
  fractionMatrix?: FractionMatrix;
  operation?: string;
  rowIndex?: number;
  pivotElement?: number;
  pivotFraction?: Fraction;
  excludedRow?: number;
  excludedCol?: number;
}

export interface Solution {
  variables: number[];
  fractionVariables?: Fraction[];
  determinant?: number;
  fractionDeterminant?: Fraction;
  isUnique: boolean;
  hasInfiniteSolutions: boolean;
  hasNoSolution: boolean;
}

export interface InverseResult {
  inverseMatrix: Matrix;
  fractionInverseMatrix?: FractionMatrix;
  determinant: number;
  fractionDeterminant?: Fraction;
  isInvertible: boolean;
  adjugateMatrix: Matrix;
  fractionAdjugateMatrix?: FractionMatrix;
}

export type CalculationMethod = 'laplace' | 'gauss-jordan';

export interface CalculatorState {
  size: number;
  coefficientMatrix: Matrix;
  constantVector: Vector;
  method: CalculationMethod;
  steps: CalculationStep[];
  solution: Solution | null;
  isCalculating: boolean;
}

export interface MatrixOperations {
  gaussianElimination: (matrix: Matrix, constants: Vector) => {
    steps: CalculationStep[];
    solution: Solution;
  };
  
  laplaceExpansion: (matrix: Matrix) => {
    steps: CalculationStep[];
    determinant: number;
  };
  
  solveByCramersRule: (matrix: Matrix, constants: Vector) => {
    steps: CalculationStep[];
    solution: Solution;
  };
}