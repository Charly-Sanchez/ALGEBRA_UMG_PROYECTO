import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Calculator } from 'lucide-react';
import type { Matrix, Vector, Solution } from '../types/matrix';
import { FractionDisplay } from './FractionDisplay';
import { Fraction } from '../utils/fraction';

interface SolutionVerificationProps {
  originalMatrix: Matrix;
  originalConstants: Vector;
  solution: Solution;
  animationSpeed?: number;
  autoStart?: boolean;
}

export const SolutionVerification: React.FC<SolutionVerificationProps> = ({
  originalMatrix,
  originalConstants,
  solution,
  animationSpeed = 1000,
  autoStart = true
}) => {
  const [currentEquation, setCurrentEquation] = useState(-1);
  const [verificationResults, setVerificationResults] = useState<{
    equation: number;
    leftSide: number;
    rightSide: number;
    isCorrect: boolean;
    leftSideFraction?: Fraction;
    rightSideFraction?: Fraction;
  }[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const showFractions = true;

  const startVerification = () => {
    if (!solution.isUnique || solution.variables.length === 0) return;
    
    setIsVerifying(true);
    setCurrentEquation(-1);
    setVerificationResults([]);
    
    // Iniciar la animación después de un pequeño delay
    setTimeout(() => {
      setCurrentEquation(0);
    }, 500);
  };

  useEffect(() => {
    if (autoStart && solution.isUnique && solution.variables.length > 0) {
      startVerification();
    }
  }, [autoStart, solution]);

  useEffect(() => {
    if (currentEquation >= 0 && currentEquation < originalMatrix.length && isVerifying) {
      const timer = setTimeout(() => {
        // Calcular el lado izquierdo de la ecuación
        let leftSide = 0;
        let leftSideFraction = new Fraction(0, 1);
        
        for (let j = 0; j < originalMatrix[currentEquation].length; j++) {
          const coeff = originalMatrix[currentEquation][j];
          const variable = solution.variables[j];
          leftSide += coeff * variable;
          
          if (solution.fractionVariables) {
            const coeffFraction = Fraction.fromDecimal(coeff);
            const variableFraction = solution.fractionVariables[j];
            leftSideFraction = leftSideFraction.add(coeffFraction.multiply(variableFraction));
          }
        }
        
        const rightSide = originalConstants[currentEquation];
        const rightSideFraction = Fraction.fromDecimal(rightSide);
        const tolerance = 1e-10;
        const isCorrect = Math.abs(leftSide - rightSide) < tolerance;
        
        const newResult = {
          equation: currentEquation,
          leftSide,
          rightSide,
          isCorrect,
          leftSideFraction: solution.fractionVariables ? leftSideFraction : undefined,
          rightSideFraction: solution.fractionVariables ? rightSideFraction : undefined
        };
        
        setVerificationResults(prev => [...prev, newResult]);
        
        // Continuar con la siguiente ecuación
        if (currentEquation < originalMatrix.length - 1) {
          setCurrentEquation(currentEquation + 1);
        } else {
          setIsVerifying(false);
        }
      }, animationSpeed);
      
      return () => clearTimeout(timer);
    }
  }, [currentEquation, originalMatrix, originalConstants, solution, animationSpeed, isVerifying]);

  const formatNumber = (num: number): string => {
    const fraction = Fraction.fromDecimal(num);
    return fraction.toString();
  };

  const renderEquation = (equationIndex: number, result?: any) => {
    return (
      <motion.div
        key={equationIndex}
        className="verification-equation"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="equation-left-side">
          {originalMatrix[equationIndex].map((coeff, j) => (
            <span key={j} className="equation-term">
              {j > 0 && (coeff >= 0 ? ' + ' : ' ')}
              {j === 0 && coeff < 0 && '-'}
              {showFractions && solution.fractionVariables ? (
                <span className="coefficient-fraction">
                  <FractionDisplay fraction={Fraction.fromDecimal(Math.abs(coeff))} />
                </span>
              ) : (
                <span className="coefficient">{Math.abs(coeff) === 1 ? (coeff < 0 ? '-' : '') : formatNumber(Math.abs(coeff))}</span>
              )}
              <span className="variable">x<sub>{j + 1}</sub></span>
              {result && (
                <span className="substitution">
                  {' × '}
                  {showFractions && solution.fractionVariables ? (
                    <FractionDisplay fraction={solution.fractionVariables[j]} />
                  ) : (
                    <span className="value">({formatNumber(solution.variables[j])})</span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>
        
        <span className="equation-equals"> = </span>
        
        <div className="equation-right-side">
          {showFractions ? (
            <FractionDisplay fraction={Fraction.fromDecimal(originalConstants[equationIndex])} />
          ) : (
            <span>{formatNumber(originalConstants[equationIndex])}</span>
          )}
        </div>
        
        {result && (
          <motion.div
            className="equation-result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="calculation-result">
              <span className="result-label">Resultado:</span>
              {showFractions && result.leftSideFraction ? (
                <FractionDisplay fraction={result.leftSideFraction} />
              ) : (
                <span className="result-value">{formatNumber(result.leftSide)}</span>
              )}
              <span className="result-comparison">
                {result.isCorrect ? ' = ' : ' ≠ '}
              </span>
              {showFractions && result.rightSideFraction ? (
                <FractionDisplay fraction={result.rightSideFraction} />
              ) : (
                <span className="result-value">{formatNumber(result.rightSide)}</span>
              )}
              {result.isCorrect ? (
                <CheckCircle className="verification-icon correct" />
              ) : (
                <XCircle className="verification-icon incorrect" />
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (!solution.isUnique || solution.variables.length === 0) {
    return null;
  }

  const allCorrect = verificationResults.length > 0 && verificationResults.every(r => r.isCorrect);

  return (
    <motion.div
      className="solution-verification"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="verification-header">
        <h3 className="verification-title">
          <Calculator className="verification-title-icon" />
          Verificación de la Solución
        </h3>
        
        <div className="verification-controls">
          <button
            className="verification-restart"
            onClick={startVerification}
            disabled={isVerifying}
          >
            {isVerifying ? 'Verificando...' : 'Verificar Nuevamente'}
          </button>
        </div>
      </div>

      <div className="verification-description">
        <p>Substituyendo los valores encontrados en las ecuaciones originales:</p>
      </div>

      <div className="verification-equations">
        {originalMatrix.map((_, index) => {
          const result = verificationResults.find(r => r.equation === index);
          const isCurrentlyVerifying = currentEquation === index && isVerifying;
          
          if (index <= Math.max(currentEquation, verificationResults.length - 1)) {
            return (
              <div key={index} className={`equation-container ${isCurrentlyVerifying ? 'verifying' : ''}`}>
                <div className="equation-number">Ecuación {index + 1}:</div>
                {renderEquation(index, result)}
              </div>
            );
          }
          return null;
        })}
      </div>

      <AnimatePresence>
        {verificationResults.length === originalMatrix.length && (
          <motion.div
            className={`verification-summary ${allCorrect ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {allCorrect ? (
              <div className="success-message">
                <CheckCircle className="summary-icon" />
                <div>
                  <h4>✅ Verificación Exitosa</h4>
                  <p>Todas las ecuaciones se satisfacen correctamente. La solución es válida.</p>
                </div>
              </div>
            ) : (
              <div className="error-message">
                <XCircle className="summary-icon" />
                <div>
                  <h4>❌ Error en la Verificación</h4>
                  <p>Algunas ecuaciones no se satisfacen. Revisa los cálculos.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};