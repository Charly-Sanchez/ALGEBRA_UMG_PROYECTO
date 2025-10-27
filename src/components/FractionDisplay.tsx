import React from 'react';
import { Fraction } from '../utils/fraction';

interface FractionDisplayProps {
  fraction: Fraction;
  className?: string;
  style?: React.CSSProperties;
}

export const FractionDisplay: React.FC<FractionDisplayProps> = ({
  fraction,
  className = '',
  style = {}
}) => {
  // Si es un entero, mostrar solo el número
  if (fraction.isInteger()) {
    return (
      <span className={`fraction-display integer ${className}`} style={style}>
        {fraction.numerator}
      </span>
    );
  }

  // Si es cero
  if (fraction.isZero()) {
    return (
      <span className={`fraction-display integer ${className}`} style={style}>
        0
      </span>
    );
  }

  const isNegative = fraction.numerator < 0;
  const absNumerator = Math.abs(fraction.numerator);

  return (
    <span className={`fraction-display ${className}`} style={style}>
      {isNegative && <span className="fraction-sign">−</span>}
      <span className="fraction-proper">
        <span className="fraction-numerator">{absNumerator}</span>
        <span className="fraction-line"></span>
        <span className="fraction-denominator">{fraction.denominator}</span>
      </span>
    </span>
  );
};

interface MatrixFractionDisplayProps {
  matrix: Fraction[][];
  pivotElement?: Fraction;
  pivotRow?: number;
  pivotCol?: number;
  excludedRow?: number;
  excludedCol?: number;
  className?: string;
}

export const MatrixFractionDisplay: React.FC<MatrixFractionDisplayProps> = ({
  matrix,
  pivotElement,
  pivotRow,
  pivotCol,
  excludedRow,
  excludedCol,
  className = ''
}) => {
  const maxCols = Math.max(...matrix.map(row => row.length));
  const isAugmented = matrix.length > 0 && matrix[0].length > matrix.length;
  const augmentedColIndex = isAugmented ? matrix.length : -1;
  const hasExclusions = excludedRow !== undefined || excludedCol !== undefined;
  
  return (
    <div className={`matrix-fraction-display ${className}`}>
      <div className="matrix-bracket left-bracket">[</div>
      <div 
        className="matrix-fraction-grid"
        style={{ 
          gridTemplateColumns: `repeat(${maxCols}, 1fr)`,
        }}
      >
        {matrix.map((row, i) =>
          row.map((fraction, j) => {
            const isPivot = pivotRow === i && pivotCol === j && 
                           pivotElement && fraction.equals(pivotElement);
            const isInAugmentedColumn = j === augmentedColIndex;
            const isLastColumn = j === maxCols - 1;
            const isExcludedRow = excludedRow !== undefined && i === excludedRow;
            const isExcludedCol = excludedCol !== undefined && j === excludedCol;
            const isExcluded = isExcludedRow || isExcludedCol;
            
            return (
              <div
                key={`${i}-${j}`}
                className={`
                  matrix-fraction-cell
                  ${isPivot ? 'pivot-element' : ''}
                  ${isInAugmentedColumn ? 'augmented-column' : ''}
                  ${isLastColumn && isAugmented ? 'last-augmented' : ''}
                  ${isExcluded ? 'excluded-element' : ''}
                `}
                style={isExcluded ? { 
                  textDecoration: 'line-through',
                  opacity: 0.4,
                  color: '#ef4444'
                } : {}}
              >
                <FractionDisplay fraction={fraction} />
              </div>
            );
          })
        )}
      </div>
      <div className="matrix-bracket right-bracket">]</div>
      {hasExclusions && (
        <div className="exclusion-note">
          ↓ Fila {excludedRow !== undefined ? excludedRow + 1 : ''} y Columna {excludedCol !== undefined ? excludedCol + 1 : ''} eliminadas
        </div>
      )}
      
      {/* Separador visual para la matriz aumentada */}
      {isAugmented && (
        <div 
          className="augmented-separator"
          style={{
            gridColumn: augmentedColIndex + 1,
            gridRow: `1 / ${matrix.length + 1}`
          }}
        />
      )}
    </div>
  );
};

interface VariableFractionDisplayProps {
  variables: Fraction[];
  className?: string;
}

export const VariableFractionDisplay: React.FC<VariableFractionDisplayProps> = ({
  variables,
  className = ''
}) => {
  return (
    <div className={`variable-fraction-container ${className}`}>
      <div className="variables-fraction-grid">
        {variables.map((variable, index) => (
          <div
            key={index}
            className="variable-fraction-result"
          >
            <span className="variable-name">x<sub>{index + 1}</sub></span>
            <span className="variable-equals">=</span>
            <div className="variable-fraction-value">
              <FractionDisplay fraction={variable} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para operaciones matemáticas con fracciones
interface FractionOperationProps {
  operation: string;
  leftOperand?: Fraction;
  rightOperand?: Fraction;
  result?: Fraction;
  className?: string;
}

export const FractionOperation: React.FC<FractionOperationProps> = ({
  operation,
  leftOperand,
  rightOperand,
  result,
  className = ''
}) => {
  return (
    <div className={`fraction-operation ${className}`}>
      <div className="operation-expression">
        {leftOperand && <FractionDisplay fraction={leftOperand} />}
        <span className="operation-symbol">{operation}</span>
        {rightOperand && <FractionDisplay fraction={rightOperand} />}
        {result && (
          <>
            <span className="equals-symbol">=</span>
            <FractionDisplay fraction={result} />
          </>
        )}
      </div>
    </div>
  );
};