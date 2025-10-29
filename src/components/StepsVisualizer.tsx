import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Calculator, ArrowRight } from 'lucide-react';
import type { CalculationStep, Solution, Matrix, Vector, InverseResult } from '../types/matrix';
import { MatrixMath } from '../utils/matrixMath';
import { MatrixFractionDisplay } from './FractionDisplay';
import { AnimationControls } from './AnimationControls';
import { SolutionVerification } from './SolutionVerification';
import { Fraction } from '../utils/fraction';

interface StepsVisualizerProps {
  steps: CalculationStep[];
  determinant: any;
  solution?: Solution | null;
  inverseResult?: InverseResult | null;
  method: 'gauss-jordan' | 'laplace';
  mode?: 'determinant' | 'system' | 'inverse';
  showFractions?: boolean;
  className?: string;
  originalMatrix?: number[][];
  originalConstants?: Vector;
  expansionFormula?: string;
}

export const StepsVisualizer: React.FC<StepsVisualizerProps> = ({
  steps,
  determinant,
  solution,
  inverseResult,
  method,
  mode = 'determinant',
  showFractions = true,
  className = '',
  originalMatrix = [],
  originalConstants = [],
  expansionFormula
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1]));
  const [showAllSteps, setShowAllSteps] = useState(false);
  
  // Estados para animación
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const intervalRef = useRef<number | null>(null);

  // Lógica de animación
  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      intervalRef.current = window.setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setExpandedSteps(new Set([currentStep + 1]));
      }, (2000 / animationSpeed)); // Base: 2 segundos por paso
      
      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, animationSpeed]);

  // Controles de animación
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      setExpandedSteps(new Set([currentStep + 1]));
    }
  };
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setExpandedSteps(new Set([currentStep - 1]));
    }
  };
  const handleReset = () => {
    setCurrentStep(1);
    setIsPlaying(false);
    setExpandedSteps(new Set([1]));
  };

  const toggleStep = (stepId: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const toggleAllSteps = () => {
    if (showAllSteps) {
      setExpandedSteps(new Set([1]));
    } else {
      setExpandedSteps(new Set(steps.map(step => step.id)));
    }
    setShowAllSteps(!showAllSteps);
  };

  const getMethodTitle = () => {
    switch (method) {
      case 'gauss-jordan':
        return 'Método de Gauss-Jordan';
      case 'laplace':
        if (mode === 'inverse') {
          return 'Cálculo de Matriz Inversa por LaPlace';
        }
        return 'Expansión de LaPlace / Regla de Cramer';
      default:
        return 'Resolución Paso a Paso';
    }
  };

  if (!steps.length) {
    return null;
  }

  return (
    <motion.div
      className={`steps-visualizer ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="steps-header">
        <div className="steps-title-section">
          <Calculator className="steps-icon" />
          <h2 className="steps-title">{getMethodTitle()}</h2>
        </div>
        
        <button
          className="toggle-all-button"
          onClick={toggleAllSteps}
          title={showAllSteps ? 'Contraer todos los pasos' : 'Expandir todos los pasos'}
        >
          {showAllSteps ? 'Contraer Todo' : 'Expandir Todo'}
          {showAllSteps ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {steps.length > 1 && (
        <AnimationControls
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onReset={handleReset}
          speed={animationSpeed}
          onSpeedChange={setAnimationSpeed}
          currentStep={currentStep}
          totalSteps={steps.length}
        />
      )}

      <div className="steps-container">
        <AnimatePresence>
          {steps.filter((_, index) => index < currentStep).map((step, index) => {
            const isExpanded = expandedSteps.has(step.id);
            const isFirstStep = index === 0;
            const isLastStep = index === steps.length - 1;
            
            return (
              <motion.div
                key={step.id}
                className={`step-item ${isFirstStep ? 'first-step' : ''} ${isLastStep ? 'last-step' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div 
                  className="step-header"
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="step-header-left">
                    <div className="step-number">
                      {step.id}
                    </div>
                    <div className="step-title-container">
                      <h3 className="step-title">{step.title}</h3>
                      {step.operation && (
                        <span className="step-operation">{step.operation}</span>
                      )}
                    </div>
                  </div>
                  
                  <button className="expand-button">
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="step-content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="step-description">{step.description}</p>
                      
                      <div className="step-matrix-container">
                        {showFractions && step.fractionMatrix ? (
                          <div className="matrix-display">
                            <MatrixFractionDisplay 
                              matrix={step.fractionMatrix}
                              pivotElement={step.pivotFraction}
                              pivotRow={step.rowIndex}
                              pivotCol={step.rowIndex}
                              excludedRow={step.excludedRow}
                              excludedCol={step.excludedCol}
                            />
                          </div>
                        ) : (
                          <div className="matrix-display">
                            <MatrixDisplay 
                              matrix={step.matrix}
                              pivotElement={step.pivotElement}
                              pivotRow={step.rowIndex}
                              excludedRow={step.excludedRow}
                              excludedCol={step.excludedCol}
                            />
                          </div>
                        )}
                      </div>

                      {index < steps.length - 1 && (
                        <div className="step-arrow">
                          <ArrowRight className="arrow-icon" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {determinant !== null && mode === 'determinant' && (
        <DeterminantDisplay 
          determinant={determinant} 
          method={method} 
          originalMatrix={originalMatrix}
          expansionFormula={expansionFormula}
        />
      )}

      {solution && mode === 'system' && (
        <>
          <SolutionDisplay solution={solution} />
          
          {/* Sección de Comprobación para Gauss-Jordan */}
          {method === 'gauss-jordan' && solution.isUnique && originalMatrix.length > 0 && originalConstants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <SolutionVerification
                originalMatrix={originalMatrix}
                originalConstants={originalConstants}
                solution={solution}
                animationSpeed={1500}
                autoStart={true}
              />
            </motion.div>
          )}
        </>
      )}

      {inverseResult && mode === 'inverse' && (
        <InverseResultDisplay 
          inverseResult={inverseResult} 
          originalMatrix={originalMatrix}
        />
      )}
    </motion.div>
  );
};

const MatrixDisplay: React.FC<{
  matrix: number[][];
  pivotElement?: number;
  pivotRow?: number;
  excludedRow?: number;
  excludedCol?: number;
}> = ({ matrix, pivotElement, pivotRow, excludedRow, excludedCol }) => {
  const maxCols = Math.max(...matrix.map(row => row.length));
  const hasExclusions = excludedRow !== undefined || excludedCol !== undefined;
  
  return (
    <div className="matrix-display-grid">
      <div className="matrix-bracket left-bracket">[</div>
      <div 
        className="matrix-values"
        style={{ 
          gridTemplateColumns: `repeat(${maxCols}, 1fr)`,
          gap: '0.5rem'
        }}
      >
        {matrix.map((row, i) =>
          Array.from({ length: maxCols }, (_, j) => {
            const value = row[j];
            const isPivot = pivotRow === i && value === pivotElement;
            const isAugmentedColumn = j === maxCols - 1 && maxCols > matrix.length;
            const isExcludedRow = excludedRow !== undefined && i === excludedRow;
            const isExcludedCol = excludedCol !== undefined && j === excludedCol;
            const isExcluded = isExcludedRow || isExcludedCol;
            
            return (
              <span
                key={`${i}-${j}`}
                className={`matrix-value ${isPivot ? 'pivot-element' : ''} ${isAugmentedColumn ? 'augmented-column' : ''} ${isExcluded ? 'excluded-element' : ''}`}
                style={isExcluded ? { 
                  textDecoration: 'line-through',
                  opacity: 0.4,
                  color: '#ef4444'
                } : {}}
              >
                {value !== undefined ? MatrixMath.formatNumber(value, 3) : ''}
              </span>
            );
          })
        )}
      </div>
      <div className="matrix-bracket right-bracket">]</div>
      {hasExclusions && (
        <div className="exclusion-note">
          🚫 Se eliminan: 
          {excludedRow !== undefined && ` Fila ${excludedRow + 1}`}
          {excludedRow !== undefined && excludedCol !== undefined && ' y'}
          {excludedCol !== undefined && ` Columna ${excludedCol + 1}`}
          {' para calcular el menor M₍' + (excludedRow !== undefined ? excludedRow + 1 : '') + ',' +  (excludedCol !== undefined ? excludedCol + 1 : '') + '₎'}
        </div>
      )}
    </div>
  );
};

/**
 * Calcula los pasos de la expansión para mostrar el desarrollo
 */
const calculateExpansionSteps = (formula: string, finalResult: any): string => {
  // Extraer los términos de la fórmula: "det = (3) × (-22) - (0) × (14) + (2) × (47)"
  const formulaPart = formula.replace('det = ', '');
  
  // Separar por términos considerando los signos
  const terms: string[] = [];
  let currentTerm = '';
  let depth = 0;
  
  for (let i = 0; i < formulaPart.length; i++) {
    const char = formulaPart[i];
    
    if (char === '(') depth++;
    if (char === ')') depth--;
    
    if (depth === 0 && i > 0 && (char === '+' || char === '-') && formulaPart[i - 1] === ' ') {
      if (currentTerm.trim() !== '') {
        terms.push(currentTerm.trim());
      }
      currentTerm = '';
      continue;
    }
    
    currentTerm += char;
  }
  
  if (currentTerm.trim() !== '') {
    terms.push(currentTerm.trim());
  }
  
  // Calcular cada término
  const calculations: string[] = [];
  const results: number[] = [];
  const signs: string[] = [];
  
  // Extraer signos
  let tempFormula = formulaPart;
  for (let i = 0; i < tempFormula.length; i++) {
    if (tempFormula[i] === '+' || (tempFormula[i] === '-' && i > 0 && tempFormula[i-1] === ' ')) {
      signs.push(tempFormula[i]);
    }
  }
  
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    // Extraer los números: (3) × (-22)
    const matches = term.match(/\((-?\d+\.?\d*)\)\s*×\s*\((-?\d+\.?\d*)\)/);
    if (matches && matches.length >= 3) {
      const num1 = parseFloat(matches[1]);
      const num2 = parseFloat(matches[2]);
      const result = num1 * num2;
      const sign = i === 0 ? '' : (signs[i - 1] === '-' ? '-' : '+');
      const adjustedResult = sign === '-' ? -Math.abs(result) : result;
      
      results.push(adjustedResult);
      calculations.push(`${num1} × (${num2})`);
    }
  }
  
  // Construir las líneas del desarrollo
  const lines: string[] = [];
  
  // Línea 1: Reemplazar multiplicaciones con resultados
  let line1 = 'det = ';
  for (let i = 0; i < calculations.length; i++) {
    const sign = i === 0 ? '' : (results[i] >= 0 ? ' + ' : ' - ');
    const absResult = Math.abs(results[i]);
    line1 += `${sign}${absResult}`;
  }
  lines.push(line1);
  
  // Línea 2: Suma de los resultados
  const sum = results.reduce((a, b) => a + b, 0);
  const line2 = `det = ${results.map((r, i) => {
    if (i === 0) return r;
    return r >= 0 ? ` + ${r}` : ` - ${Math.abs(r)}`;
  }).join('')}`;
  lines.push(line2);
  
  // Línea 3: Resultado final
  const finalValue = finalResult ? (finalResult.toString ? finalResult.toString() : finalResult) : sum;
  lines.push(`det = ${finalValue}`);
  
  return lines.join('\n');
};

const DeterminantDisplay: React.FC<{
  determinant: any;
  method: 'gauss-jordan' | 'laplace';
  originalMatrix?: number[][];
  expansionFormula?: string;
}> = ({ determinant, method, originalMatrix = [], expansionFormula }) => {
  return (
    <motion.div
      className="determinant-display"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="determinant-header">
        <h3 className="determinant-title">
          🎯 Determinante Calculado
        </h3>
        
        <div className="determinant-result">
          <span className="determinant-label">det(A) = </span>
          <span className={`determinant-value ${determinant && determinant.equals && determinant.equals(0) ? 'zero-det' : 'nonzero-det'}`}>
            {determinant ? (determinant.toString ? determinant.toString() : determinant) : '0'}
          </span>
        </div>

        {expansionFormula && (
          <>
            <div className="expansion-formula">
              <span className="formula-label">Expansión: </span>
              <span className="formula-content">{expansionFormula}</span>
            </div>
            
            <div className="expansion-calculation">
              <span className="formula-label">Cálculo: </span>
              <span className="formula-content">{calculateExpansionSteps(expansionFormula, determinant)}</span>
            </div>
          </>
        )}
        
        <div className="method-info">
          <span className="method-label">Método: </span>
          <span className="method-name">
            {method === 'laplace' ? 'Expansión de Laplace' : 'Eliminación de Gauss-Jordan'}
          </span>
        </div>
      </div>

      {originalMatrix.length > 0 && (
        <div className="matrix-summary">
          <h4 className="matrix-summary-title">Matriz Original ({originalMatrix.length}×{originalMatrix[0]?.length || 0}):</h4>
          <div className="matrix-summary-content">
            <MatrixDisplay matrix={originalMatrix} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Componente para mostrar la solución del sistema de ecuaciones
const SolutionDisplay: React.FC<{ solution: Solution }> = ({ solution }) => {
  if (solution.hasNoSolution) {
    return (
      <motion.div
        className="solution-display error"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="solution-header">
          <Calculator size={28} />
          <h3>Sistema Sin Solución</h3>
        </div>
        <p className="solution-message">
          El sistema de ecuaciones no tiene solución. Las ecuaciones son inconsistentes.
        </p>
      </motion.div>
    );
  }

  if (solution.hasInfiniteSolutions) {
    return (
      <motion.div
        className="solution-display warning"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="solution-header">
          <Calculator size={28} />
          <h3>Infinitas Soluciones</h3>
        </div>
        <p className="solution-message">
          El sistema tiene infinitas soluciones. Las ecuaciones son dependientes.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="solution-display"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="solution-header">
        <Calculator size={28} />
        <h3>Solución del Sistema</h3>
      </div>
      
      <div className="solution-variables">
        {solution.fractionVariables && solution.fractionVariables.length > 0 ? (
          solution.fractionVariables.map((fraction, i) => (
            <div key={i} className="variable-item">
              <span className="variable-name">x<sub>{i + 1}</sub></span>
              <span className="equals">=</span>
              <span className="variable-value">
                {fraction.toString()}
              </span>
            </div>
          ))
        ) : (
          solution.variables.map((value, i) => {
            const fraction = Fraction.fromDecimal(value);
            return (
              <div key={i} className="variable-item">
                <span className="variable-name">x<sub>{i + 1}</sub></span>
                <span className="equals">=</span>
                <span className="variable-value">{fraction.toString()}</span>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

// Componente para mostrar la verificación de multiplicación paso a paso (versión simplificada)
const MatrixMultiplicationVerification: React.FC<{
  originalMatrix: Matrix;
  inverseMatrix: Matrix;
  fractionInverseMatrix?: any[];
}> = ({ originalMatrix, inverseMatrix, fractionInverseMatrix }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const n = originalMatrix.length;
  
  // Calcular matriz resultado
  const resultMatrix: Matrix = [];
  for (let i = 0; i < n; i++) {
    resultMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += originalMatrix[i][k] * inverseMatrix[k][j];
      }
      resultMatrix[i][j] = sum;
    }
  }
  
  const totalSteps = n * n;
  const currentRow = currentStep >= 0 ? Math.floor(currentStep / n) : -1;
  const currentCol = currentStep >= 0 ? currentStep % n : -1;
  
  const isIdentity = resultMatrix.every((row, i) => 
    row.every((val, j) => {
      const expected = i === j ? 1 : 0;
      return Math.abs(val - expected) < 1e-10;
    })
  );

  const startVerification = () => setCurrentStep(0);
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const reset = () => setCurrentStep(-1);

  return (
    <div className="verification-section">
      <h4 className="verification-title">🔍 Verificación: A × A⁻¹ = I</h4>
      <p className="verification-description">
        Para verificar que A⁻¹ es correcta, multiplicamos A × A⁻¹ y debe dar la matriz identidad I:
      </p>
      
      {/* Controles */}
      <div className="verification-controls">
        <button 
          className="step-button primary"
          onClick={startVerification}
          disabled={currentStep >= 0}
        >
          ▶️ Iniciar Verificación
        </button>
        <button 
          className="step-button"
          onClick={prevStep}
          disabled={currentStep <= 0}
        >
          ⬅️ Anterior
        </button>
        <button 
          className="step-button"
          onClick={nextStep}
          disabled={currentStep >= totalSteps - 1}
        >
          ➡️ Siguiente
        </button>
        <button 
          className="step-button"
          onClick={reset}
        >
          🔄 Reiniciar
        </button>
      </div>

      {/* Vista de matrices con elementos destacados */}
      <div className="matrix-verification-display">
        <div className="matrix-container">
          <div className="matrix-label">A</div>
          <div className="matrix-with-highlight">
            {originalMatrix.map((row, i) => (
              <div key={i} className="matrix-row">
                {row.map((val, j) => (
                  <div 
                    key={j} 
                    className={`matrix-cell ${
                      currentStep >= 0 && i === currentRow ? 'highlighted-row' : ''
                    }`}
                  >
                    {Fraction.fromDecimal(val).toString()}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="multiplication-symbol">×</div>

        <div className="matrix-container">
          <div className="matrix-label">A⁻¹</div>
          <div className="matrix-with-highlight">
            {(fractionInverseMatrix || inverseMatrix).map((row: any, i: number) => (
              <div key={i} className="matrix-row">
                {(Array.isArray(row) ? row : inverseMatrix[i]).map((val: any, j: number) => (
                  <div 
                    key={j} 
                    className={`matrix-cell ${
                      currentStep >= 0 && j === currentCol ? 'highlighted-col' : ''
                    }`}
                  >
                    {fractionInverseMatrix 
                      ? (val && val.toString ? val.toString() : val)
                      : Fraction.fromDecimal(inverseMatrix[i][j]).toString()
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="multiplication-symbol">=</div>

        <div className="matrix-container">
          <div className="matrix-label">Resultado</div>
          <div className="matrix-with-highlight">
            {resultMatrix.map((row, i) => (
              <div key={i} className="matrix-row">
                {row.map((val, j) => {
                  const isCurrentElement = currentStep >= 0 && i === currentRow && j === currentCol;
                  const isCalculated = currentStep >= 0 && (i * n + j) <= currentStep;
                  const isIdentityCorrect = (i === j && Math.abs(val - 1) < 1e-10) || (i !== j && Math.abs(val) < 1e-10);
                  
                  return (
                    <div 
                      key={j} 
                      className={`matrix-cell ${
                        isCurrentElement ? 'current-element' : 
                        isCalculated ? (isIdentityCorrect ? 'correct-element' : 'incorrect-element') : 
                        'pending-element'
                      }`}
                    >
                      {isCalculated ? Fraction.fromDecimal(val).toString() : '?'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explicación del paso actual */}
      {currentStep >= 0 && (
        <motion.div 
          className="step-explanation"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="step-info">
            <h5>Elemento [{currentRow + 1}, {currentCol + 1}] = Fila {currentRow + 1} × Columna {currentCol + 1}</h5>
          </div>
          
          <div className="multiplication-sequence">
            {/* Línea de operaciones */}
            <div className="operations-line">
              {originalMatrix[currentRow].map((aVal, k) => {
                const bVal = fractionInverseMatrix 
                  ? fractionInverseMatrix[k][currentCol]
                  : inverseMatrix[k][currentCol];
                
                return (
                  <span key={k} className="operation-term">
                    <span className="value-a">{Fraction.fromDecimal(aVal).toString()}</span>
                    <span className="multiply-symbol">×</span>
                    <span className="value-b">
                      {fractionInverseMatrix 
                        ? (bVal?.toString() || Fraction.fromDecimal(inverseMatrix[k][currentCol]).toString())
                        : Fraction.fromDecimal(bVal).toString()
                      }
                    </span>
                    {k < originalMatrix[currentRow].length - 1 && <span className="addition-symbol">+</span>}
                  </span>
                );
              })}
            </div>
            
            {/* Línea de resultados de cada multiplicación */}
            <div className="results-line">
              {originalMatrix[currentRow].map((aVal, k) => {
                const bVal = fractionInverseMatrix 
                  ? fractionInverseMatrix[k][currentCol]
                  : inverseMatrix[k][currentCol];
                
                // Corrección: multiplicar fracciones correctamente
                let product;
                if (fractionInverseMatrix && bVal && typeof bVal === 'object' && bVal.multiply) {
                  // Si bVal es un objeto Fraction
                  const aFraction = Fraction.fromDecimal(aVal);
                  product = aFraction.multiply(bVal);
                } else {
                  // Convertir ambos a fracciones y multiplicar
                  const aFraction = Fraction.fromDecimal(aVal);
                  let bFraction;
                  
                  if (fractionInverseMatrix) {
                    // Parsear la fracción del string (ej: "5/11" o "-1/11")
                    const bStr = bVal?.toString() || '0';
                    if (bStr.includes('/')) {
                      const [num, den] = bStr.split('/');
                      bFraction = new Fraction(parseInt(num), parseInt(den));
                    } else {
                      bFraction = new Fraction(parseInt(bStr), 1);
                    }
                  } else {
                    bFraction = Fraction.fromDecimal(bVal);
                  }
                  
                  product = aFraction.multiply(bFraction);
                }
                
                return (
                  <span key={k} className="result-term">
                    <span className="multiplication-result">
                      {product.toString()}
                    </span>
                    {k < originalMatrix[currentRow].length - 1 && <span className="plus-result">+</span>}
                  </span>
                );
              })}
            </div>
          </div>
          
          <div className="final-calculation">
            <div className="equals-line">
              <span className="equals-symbol">=</span>
              <span className="final-result">{Fraction.fromDecimal(resultMatrix[currentRow][currentCol]).toString()}</span>
            </div>
            
            <div className="verification-status">
              {((currentRow === currentCol && Math.abs(resultMatrix[currentRow][currentCol] - 1) < 1e-10) || 
                (currentRow !== currentCol && Math.abs(resultMatrix[currentRow][currentCol]) < 1e-10)) ? (
                <span className="status-correct">✅ Correcto</span>
              ) : (
                <span className="status-incorrect">❌ Incorrecto</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Resultado final */}
      {currentStep >= totalSteps - 1 && (
        <motion.div 
          className="final-result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isIdentity ? (
            <div className="verification-success">
              🎉 <strong>¡Verificación Exitosa!</strong><br/>
              A × A⁻¹ = I (matriz identidad)
            </div>
          ) : (
            <div className="verification-error">
              ❌ <strong>Error en la verificación</strong><br/>
              A × A⁻¹ ≠ I (no es matriz identidad)
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Componente para mostrar el resultado de la matriz inversa
const InverseResultDisplay: React.FC<{
  inverseResult: InverseResult;
  originalMatrix?: number[][];
}> = ({ inverseResult, originalMatrix = [] }) => {
  if (!inverseResult.isInvertible) {
    return (
      <motion.div
        className="inverse-result-display error"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="inverse-header">
          <Calculator size={28} />
          <h3>Matriz No Invertible</h3>
        </div>
        <p className="inverse-message">
          La matriz no tiene inversa porque su determinante es cero (matriz singular).
        </p>
        <div className="determinant-info">
          <span className="determinant-label">det(A) = </span>
          <span className="determinant-value zero-det">0</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="inverse-result-display"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="inverse-header">
        <Calculator size={28} />
        <h3>Matriz Inversa Calculada</h3>
      </div>
      
      <div className="inverse-info">
        <div className="determinant-info">
          <span className="determinant-label">det(A) = </span>
          <span className={`determinant-value ${Math.abs(inverseResult.determinant) < 1e-10 ? 'zero-det' : 'nonzero-det'}`}>
            {inverseResult.fractionDeterminant ? 
              inverseResult.fractionDeterminant.toString() : 
              inverseResult.determinant.toString()}
          </span>
        </div>
        
        <div className="inverse-formula">
          <span className="formula-label">Fórmula: </span>
          <span className="formula-content">A⁻¹ = (1/det(A)) × adj(A)</span>
        </div>
      </div>

      <div className="matrix-results">
        <div className="matrix-result-section">
          <h4 className="matrix-section-title">Matriz Inversa A⁻¹:</h4>
          <div className="matrix-display-container">
            {inverseResult.fractionInverseMatrix ? (
              <MatrixFractionDisplay matrix={inverseResult.fractionInverseMatrix} />
            ) : (
              <MatrixDisplay matrix={inverseResult.inverseMatrix} />
            )}
          </div>
        </div>
        
        <div className="matrix-result-section">
          <h4 className="matrix-section-title">Matriz Adjunta adj(A):</h4>
          <div className="matrix-display-container">
            {inverseResult.fractionAdjugateMatrix ? (
              <MatrixFractionDisplay matrix={inverseResult.fractionAdjugateMatrix} />
            ) : (
              <MatrixDisplay matrix={inverseResult.adjugateMatrix} />
            )}
          </div>
        </div>
      </div>

      {originalMatrix.length > 0 && (
        <>
          <div className="matrix-summary">
            <h4 className="matrix-summary-title">Matriz Original A ({originalMatrix.length}×{originalMatrix[0]?.length || 0}):</h4>
            <div className="matrix-summary-content">
              <MatrixDisplay matrix={originalMatrix} />
            </div>
          </div>
          
          <MatrixMultiplicationVerification 
            originalMatrix={originalMatrix}
            inverseMatrix={inverseResult.inverseMatrix}
            fractionInverseMatrix={inverseResult.fractionInverseMatrix}
          />
        </>
      )}
    </motion.div>
  );
};

// Componente auxiliar para el icón de ChevronUp (ya que no está en lucide-react por defecto)
const ChevronUp: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18,15 12,9 6,15"></polyline>
  </svg>
);