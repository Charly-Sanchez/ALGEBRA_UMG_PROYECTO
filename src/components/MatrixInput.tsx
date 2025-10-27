import React from 'react';
import { motion } from 'framer-motion';
import type { Matrix } from '../types/matrix';

interface MatrixInputProps {
  size: number;
  matrix: Matrix;
  onMatrixChange: (row: number, col: number, value: number) => void;
  className?: string;
}

export const MatrixInput: React.FC<MatrixInputProps> = ({
  size,
  matrix,
  onMatrixChange,
  className = ''
}) => {
  const handleMatrixChange = (row: number, col: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? 0 : parseFloat(event.target.value);
    onMatrixChange(row, col, isNaN(value) ? 0 : value);
  };

  return (
    <motion.div
      className={`matrix-input ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="matrix-container">
        <div className="matrix-section">
          <h3 className="matrix-label">Matriz A ({size}×{size})</h3>
          <div 
            className="matrix-grid matrix-brackets"
            style={{ 
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              maxWidth: `${size * 90}px`
            }}
          >
            {Array.from({ length: size }, (_, i) =>
              Array.from({ length: size }, (_, j) => (
                <motion.input
                  key={`matrix-${i}-${j}`}
                  type="number"
                  step="0.01"
                  className="matrix-cell"
                  value={matrix[i]?.[j] === 0 ? '' : matrix[i]?.[j]}
                  onChange={(e) => handleMatrixChange(i, j, e)}
                  placeholder="0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: (i * size + j) * 0.02 
                  }}
                  whileFocus={{ 
                    scale: 1.05, 
                    boxShadow: 'var(--shadow-glow)' 
                  }}
                />
              ))
            ).flat()}
          </div>
          
          {/* Etiquetas de posición */}
          <div className="position-labels" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
            {Array.from({ length: size }, (_, j) => (
              <span key={`col-${j}`} className="position-label">
                a<sub>•,{j + 1}</sub>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Vista previa de la matriz */}
      <motion.div 
        className="matrix-preview"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h4 className="preview-title">Matriz para calcular determinante:</h4>
        <div className="matrix-display">
          <div className="matrix-bracket left-bracket">[</div>
          <div 
            className="matrix-values" 
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
            {Array.from({ length: size }, (_, i) =>
              Array.from({ length: size }, (_, j) => (
                <span key={`preview-${i}-${j}`} className="matrix-value">
                  {matrix[i]?.[j] || 0}
                </span>
              ))
            ).flat()}
          </div>
          <div className="matrix-bracket right-bracket">]</div>
        </div>
        <div className="determinant-notation">
          det(A) = |A| = ?
        </div>
      </motion.div>
    </motion.div>
  );
};

// Estilos CSS adicionales que se agregarán al App.css
export const matrixInputStyles = `
.matrix-input {
  width: 100%;
}

.matrix-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.matrix-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.equals-section {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-primary);
  margin: 0 0.5rem;
}

.equals-symbol {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.constants-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr;
}

.variable-labels {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.variable-label {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.equations-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.preview-title {
  text-align: center;
  margin-bottom: 0.75rem;
  color: var(--accent-primary);
  font-size: 1rem;
}

.equations-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.equation {
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
}

.equation-term {
  color: var(--text-primary);
}

.equation-equals {
  color: var(--accent-primary);
  font-weight: bold;
  margin: 0 0.5rem;
}

.equation-constant {
  color: var(--accent-gold);
  font-weight: 600;
}

@media (max-width: 768px) {
  .matrix-container {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .equals-section {
    transform: rotate(90deg);
    margin: 0.5rem 0;
  }
  
  .equation {
    font-size: 0.85rem;
  }
}
`;