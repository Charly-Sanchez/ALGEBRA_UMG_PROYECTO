import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Calculator, ArrowRight } from 'lucide-react';
import type { CalculationStep, Solution } from '../types/matrix';
import { MatrixMath } from '../utils/matrixMath';
import { MatrixFractionDisplay } from './FractionDisplay';
import { AnimationControls } from './AnimationControls';

interface StepsVisualizerProps {
  steps: CalculationStep[];
  determinant: any;
  solution?: Solution | null;
  method: 'gauss-jordan' | 'laplace';
  mode?: 'determinant' | 'system';
  showFractions?: boolean;
  className?: string;
  originalMatrix?: number[][];
  expansionFormula?: string;
}

export const StepsVisualizer: React.FC<StepsVisualizerProps> = ({
  steps,
  determinant,
  solution,
  method,
  mode = 'determinant',
  showFractions = false,
  className = '',
  originalMatrix = [],
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
        <SolutionDisplay solution={solution} />
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
          ↓ Fila {excludedRow !== undefined ? excludedRow + 1 : ''} y Columna {excludedCol !== undefined ? excludedCol + 1 : ''} eliminadas
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
                {!fraction.isInteger() && (
                  <span className="variable-decimal"> ≈ {fraction.toDecimal().toFixed(4)}</span>
                )}
              </span>
            </div>
          ))
        ) : (
          solution.variables.map((value, i) => (
            <div key={i} className="variable-item">
              <span className="variable-name">x<sub>{i + 1}</sub></span>
              <span className="equals">=</span>
              <span className="variable-value">{value.toFixed(4)}</span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// Componente auxiliar para el icón de ChevronUp (ya que no está en lucide-react por defecto)
const ChevronUp: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18,15 12,9 6,15"></polyline>
  </svg>
);