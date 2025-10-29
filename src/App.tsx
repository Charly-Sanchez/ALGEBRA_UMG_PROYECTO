import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Shuffle, RotateCcw, Play, BookOpen } from 'lucide-react';
import './App.css';

import { MatrixInput } from './components/MatrixInput';
import { StepsVisualizer } from './components/StepsVisualizer';

import type { Matrix, Vector, CalculationStep, CalculationMethod, Solution, InverseResult } from './types/matrix';
import { LaplaceExpansion } from './utils/laplaceExpansion';
import { GaussJordanDeterminant } from './utils/gaussJordanDeterminant';
import { GaussJordanFractions } from './utils/gaussJordanFractions';
import { MatrixInverse } from './utils/matrixInverse';
import { Fraction } from './utils/fraction';

type CalculationMode = 'determinant' | 'system' | 'inverse';

function App() {
  const [size, setSize] = useState<number>(3);
  const [matrix, setMatrix] = useState<Matrix>(
    Array.from({ length: 3 }, () => Array(3).fill(0))
  );
  const [constants, setConstants] = useState<Vector>(Array(3).fill(0));
  const [method, setMethod] = useState<CalculationMethod>('laplace');
  const [mode, setMode] = useState<CalculationMode>('determinant');
  const [steps, setSteps] = useState<CalculationStep[]>([]);
  const [determinant, setDeterminant] = useState<Fraction | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [inverseResult, setInverseResult] = useState<InverseResult | null>(null);
  const [expansionFormula, setExpansionFormula] = useState<string | undefined>(undefined);
  const [isCalculating, setIsCalculating] = useState(false);

  // Actualizar matriz cuando cambia el tamaño
  const handleSizeChange = useCallback((newSize: number) => {
    if (newSize < 2 || newSize > 6) return;
    
    setSize(newSize);
    
    // Redimensionar matriz
    const newMatrix: Matrix = Array.from({ length: newSize }, (_, i) =>
      Array.from({ length: newSize }, (_, j) =>
        matrix[i]?.[j] || 0
      )
    );
    setMatrix(newMatrix);
    
    // Redimensionar vector de constantes
    const newConstants: Vector = Array.from({ length: newSize }, (_, i) =>
      constants[i] || 0
    );
    setConstants(newConstants);
    
    // Limpiar resultados
    setSteps([]);
    setDeterminant(null);
    setSolution(null);
    setInverseResult(null);
    setExpansionFormula(undefined);
  }, [matrix, constants]);

  // Actualizar elemento de la matriz
  const handleMatrixChange = useCallback((row: number, col: number, value: number) => {
    setMatrix(prev => {
      const newMatrix = prev.map(r => [...r]);
      newMatrix[row][col] = value;
      return newMatrix;
    });
  }, []);

  // Generar matriz de ejemplo aleatoria
  const generateRandomMatrix = useCallback(() => {
    const newMatrix: Matrix = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.floor(Math.random() * 10) - 5)
    );
    const newConstants: Vector = Array.from({ length: size }, () => 
      Math.floor(Math.random() * 20) - 10
    );
    
    setMatrix(newMatrix);
    setConstants(newConstants);
    setSteps([]);
    setDeterminant(null);
    setSolution(null);
    setInverseResult(null);
    setExpansionFormula(undefined);
  }, [size]);

  // Limpiar matriz
  const clearMatrix = useCallback(() => {
    setMatrix(Array.from({ length: size }, () => Array(size).fill(0)));
    setConstants(Array(size).fill(0));
    setSteps([]);
    setDeterminant(null);
    setSolution(null);
    setInverseResult(null);
    setExpansionFormula(undefined);
  }, [size]);

  // Calcular determinante o resolver sistema
  const calculate = useCallback(async () => {
    setIsCalculating(true);
    
    // Pequeña demora para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      if (mode === 'determinant') {
        // Modo: Calcular determinante
        let result: { steps: CalculationStep[]; determinant: Fraction };
        
        if (method === 'laplace') {
          // Usar el algoritmo de Laplace optimizado
          const laplaceResult = LaplaceExpansion.calculateDeterminant(matrix);
          setSteps(laplaceResult.steps);
          setDeterminant(new Fraction(laplaceResult.determinant));
          setExpansionFormula(laplaceResult.expansionFormula);
          setSolution(null);
          setInverseResult(null);
        } else {
          // Para Gauss-Jordan, crear el método optimizado para determinantes
          result = GaussJordanDeterminant.calculateDeterminant(matrix);
          setSteps(result.steps);
          setDeterminant(result.determinant);
          setExpansionFormula(undefined);
          setSolution(null);
          setInverseResult(null);
        }
      } else if (mode === 'system') {
        // Modo: Resolver sistema de ecuaciones
        if (method === 'gauss-jordan') {
          const result = GaussJordanFractions.solve(matrix, constants);
          setSteps(result.steps);
          setSolution(result.solution);
          setDeterminant(null);
          setInverseResult(null);
          setExpansionFormula(undefined);
        } else {
          // Para LaPlace, mostrar mensaje de que solo Gauss-Jordan soporta sistemas
          setSteps([{
            id: 1,
            title: 'Información',
            description: 'Para resolver sistemas de ecuaciones, usa el método de Gauss-Jordan.',
            matrix: matrix,
            operation: 'Info'
          }]);
          setDeterminant(null);
          setSolution(null);
          setInverseResult(null);
        }
      } else {
        // Modo: Calcular matriz inversa
        const result = MatrixInverse.calculateInverse(matrix);
        setSteps(result.steps);
        setInverseResult(result.result);
        setDeterminant(null);
        setSolution(null);
        setExpansionFormula(undefined);
      }
    } catch (error) {
      console.error('Error al calcular:', error);
      // Manejar error
      const errorMessage = mode === 'determinant' 
        ? 'calcular el determinante' 
        : mode === 'system' 
        ? 'resolver el sistema' 
        : 'calcular la matriz inversa';
      
      setSteps([{
        id: 1,
        title: 'Error',
        description: `Ocurrió un error al ${errorMessage}. Verifica que los datos sean válidos.`,
        matrix: matrix,
        operation: 'Error'
      }]);
      setDeterminant(null);
      setSolution(null);
      setInverseResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [mode, method, matrix, constants]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo-title">
            <Calculator className="logo-icon" />
            <h1 className="title">Calculadora de Álgebra Lineal</h1>
            
            <div className="documentation-buttons">
              <a 
                href="docs/manual-usuario.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="doc-button user-manual"
                title="Manual de Usuario"
              >
                📖 Manual de Usuario
              </a>
              <a 
                href="docs/documentacion-tecnica.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="doc-button tech-docs"
                title="Documentación Técnica"
              >
                🔧 Docs Técnicas
              </a>
            </div>
          </div>
          
          <div className="header-controls">
            {/* Selector de modo: Determinante, Sistema de Ecuaciones o Matriz Inversa */}
            <nav className="nav-buttons">
              <button
                className={`nav-button ${mode === 'determinant' ? 'active' : ''}`}
                onClick={() => setMode('determinant')}
              >
                Determinante
              </button>
              <button
                className={`nav-button ${mode === 'system' ? 'active' : ''}`}
                onClick={() => {
                  setMode('system');
                  setMethod('gauss-jordan'); // Gauss-Jordan por defecto para sistemas
                }}
              >
                Sistema de Ecuaciones
              </button>
              <button
                className={`nav-button ${mode === 'inverse' ? 'active' : ''}`}
                onClick={() => {
                  setMode('inverse');
                  setMethod('laplace'); // LaPlace por defecto para matriz inversa
                }}
              >
                Matriz Inversa
              </button>
            </nav>
            
            {/* Selector de método */}
            <nav className="nav-buttons">
              <button
                className={`nav-button ${method === 'gauss-jordan' ? 'active' : ''}`}
                onClick={() => setMethod('gauss-jordan')}
                disabled={mode === 'system'} // En modo sistema, solo Gauss-Jordan
              >
                Gauss-Jordan
              </button>
              <button
                className={`nav-button ${method === 'laplace' ? 'active' : ''}`}
                onClick={() => setMethod('laplace')}
                disabled={mode === 'system'} // En modo sistema, solo Gauss-Jordan
              >
                {mode === 'inverse' ? 'LaPlace (Adjunta)' : 'LaPlace'}
              </button>
            </nav>
            

          </div>
        </div>
      </header>

      <main className="main-content">
        <motion.div
          className="calculator-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="calculator-header">
            <h2 className="calculator-title">
              {mode === 'determinant'
                ? (method === 'gauss-jordan'
                    ? 'Cálculo de Determinante por Gauss-Jordan'
                    : 'Cálculo de Determinante por Expansión de LaPlace')
                : mode === 'system'
                ? 'Resolución de Sistema de Ecuaciones por Gauss-Jordan'
                : 'Cálculo de Matriz Inversa por LaPlace'}
            </h2>
            <p className="calculator-subtitle">
              {mode === 'determinant'
                ? (method === 'gauss-jordan'
                    ? 'Calcula el determinante usando eliminación gaussiana optimizada'
                    : 'Usa expansión por cofactores, seleccionando automáticamente la fila/columna con más ceros')
                : mode === 'system'
                ? 'Resuelve el sistema de ecuaciones Ax = b usando el método de Gauss-Jordan con eliminación hacia adelante y atrás'
                : 'Calcula la matriz inversa A⁻¹ = (1/det(A)) × adj(A) usando determinante y matriz adjunta'}
            </p>
          </div>

          <div className="size-selector">
            <label htmlFor="matrix-size">Tamaño de la matriz:</label>
            <input
              id="matrix-size"
              type="number"
              min="2"
              max="6"
              value={size}
              onChange={(e) => handleSizeChange(parseInt(e.target.value))}
              className="size-input"
            />
            <span>×</span>
            <span>{size}</span>
          </div>

          <MatrixInput
            size={size}
            matrix={matrix}
            onMatrixChange={handleMatrixChange}
          />

          {/* Vector de constantes (solo para sistemas de ecuaciones) */}
          {mode === 'system' && (
            <div className="constants-vector">
              <h3 className="constants-title">Vector de Términos Independientes (b)</h3>
              <div className="constants-input">
                {constants.map((value, i) => (
                  <div key={i} className="constant-cell">
                    <label htmlFor={`constant-${i}`}>b<sub>{i + 1}</sub></label>
                    <input
                      id={`constant-${i}`}
                      type="number"
                      value={value === 0 ? '' : value}
                      onChange={(e) => {
                        const newValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setConstants(prev => {
                          const newConstants = [...prev];
                          newConstants[i] = newValue;
                          return newConstants;
                        });
                      }}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button
              className="primary-button"
              onClick={calculate}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <RotateCcw size={20} />
                  </motion.div>
                  Calculando...
                </>
              ) : (
                <>
                  <Play size={20} />
                  {mode === 'determinant' 
                    ? 'Calcular Determinante' 
                    : mode === 'system' 
                    ? 'Resolver Sistema' 
                    : 'Calcular Matriz Inversa'}
                </>
              )}
            </button>
            
            <div className="example-info">
              <p>💡 Ejemplo: matriz [5,-2,4; 6,7,-3; 3,0,2] → det = 28</p>
            </div>
            
            <button
              className="secondary-button"
              onClick={generateRandomMatrix}
              disabled={isCalculating}
            >
              <Shuffle size={20} />
              Ejemplo Aleatorio
            </button>
            
            <button
              className="secondary-button"
              onClick={clearMatrix}
              disabled={isCalculating}
            >
              <RotateCcw size={20} />
              Limpiar
            </button>
          </div>
        </motion.div>

        {steps.length > 0 && (
          <StepsVisualizer
            steps={steps}
            determinant={determinant}
            solution={solution}
            inverseResult={inverseResult}
            method={method}
            mode={mode}
            showFractions={true}
            originalMatrix={matrix}
            originalConstants={constants}
            expansionFormula={expansionFormula}
          />
        )}

        {/* Información adicional */}
        <motion.div
          className="info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="info-header">
            <BookOpen className="info-icon" />
            <h3>Métodos Implementados</h3>
          </div>
          
          <div className="methods-info">
            <div className="method-card">
              <h4>Eliminación Gaussiana</h4>
              <p>
                Transforma la matriz aumentada en forma escalonada mediante operaciones elementales
                de fila, luego usa sustitución hacia atrás para encontrar la solución.
              </p>
              <ul>
                <li>✅ Eficiente para sistemas grandes</li>
                <li>✅ Muestra paso a paso las operaciones</li>
                <li>✅ Detecta sistemas sin solución o con infinitas soluciones</li>
              </ul>
            </div>
            
            <div className="method-card">
              <h4>Expansión de LaPlace / Regla de Cramer</h4>
              <p>
                Calcula el determinante usando expansión por cofactores y aplica la regla de Cramer
                para sistemas con solución única.
              </p>
              <ul>
                <li>✅ Basado en propiedades de determinantes</li>
                <li>✅ Ideal para entender conceptos teóricos</li>
                <li>⚠️ Menos eficiente para matrices grandes</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
