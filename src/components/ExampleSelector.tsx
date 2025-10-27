import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, Check } from 'lucide-react';
import { EXAMPLE_SYSTEMS, getRandomExample, type ExampleSystem } from '../data/examples';

interface ExampleSelectorProps {
  currentSize: number;
  onExampleSelect: (example: ExampleSystem) => void;
  className?: string;
}

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({
  currentSize,
  onExampleSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'size-specific'>('size-specific');

  const availableExamples = EXAMPLE_SYSTEMS.filter(example => 
    selectedCategory === 'all' || example.size === currentSize
  );

  const handleExampleSelect = (example: ExampleSystem) => {
    onExampleSelect(example);
    setIsOpen(false);
  };

  const handleRandomExample = () => {
    const example = getRandomExample(currentSize);
    onExampleSelect(example);
    setIsOpen(false);
  };

  const getSolutionTypeIcon = (type: ExampleSystem['solutionType']) => {
    switch (type) {
      case 'unique':
        return '✅';
      case 'infinite':
        return '∞';
      case 'none':
        return '❌';
      default:
        return '❓';
    }
  };

  const getSolutionTypeText = (type: ExampleSystem['solutionType']) => {
    switch (type) {
      case 'unique':
        return 'Solución única';
      case 'infinite':
        return 'Infinitas soluciones';
      case 'none':
        return 'Sin solución';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className={`example-selector ${className}`}>
      <motion.button
        className="example-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <BookOpen size={20} />
        <span>Cargar Ejemplo</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="example-selector-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="dropdown-header">
              <h4>Ejemplos Disponibles</h4>
              
              <div className="category-selector">
                <button
                  className={`category-button ${selectedCategory === 'size-specific' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('size-specific')}
                >
                  Solo {currentSize}×{currentSize}
                </button>
                <button
                  className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Todos los tamaños
                </button>
              </div>
            </div>

            <div className="examples-list">
              {availableExamples.map((example) => (
                <motion.button
                  key={example.id}
                  className="example-item"
                  onClick={() => handleExampleSelect(example)}
                  whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="example-info">
                    <div className="example-header">
                      <span className="example-name">{example.name}</span>
                      <span className="example-size">{example.size}×{example.size}</span>
                    </div>
                    <p className="example-description">{example.description}</p>
                    <div className="example-meta">
                      <span className="solution-type">
                        {getSolutionTypeIcon(example.solutionType)} {getSolutionTypeText(example.solutionType)}
                      </span>
                      {example.expectedSolution && (
                        <span className="expected-solution">
                          Solución: [{example.expectedSolution.map(x => x.toFixed(1)).join(', ')}]
                        </span>
                      )}
                    </div>
                  </div>
                  <Check className="select-icon" />
                </motion.button>
              ))}

              <motion.button
                className="example-item random-example"
                onClick={handleRandomExample}
                whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="example-info">
                  <div className="example-header">
                    <span className="example-name">🎲 Ejemplo Aleatorio</span>
                    <span className="example-size">{currentSize}×{currentSize}</span>
                  </div>
                  <p className="example-description">
                    Genera un sistema aleatorio de {currentSize}×{currentSize}
                  </p>
                </div>
                <Check className="select-icon" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para cerrar el dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dropdown-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};