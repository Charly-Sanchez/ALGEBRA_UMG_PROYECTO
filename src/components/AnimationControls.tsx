import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnimationControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentStep: number;
  totalSteps: number;
  disabled?: boolean;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onReset,
  speed,
  onSpeedChange,
  currentStep,
  totalSteps,
  disabled = false
}) => {
  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' },
    { value: 3, label: '3x' }
  ];

  return (
    <motion.div
      className="animation-controls"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="controls-header">
        <h3 className="controls-title">🎬 Control de Animación</h3>
        <div className="step-counter">
          Paso {currentStep} de {totalSteps}
        </div>
      </div>
      
      <div className="controls-main">
        <div className="playback-controls">
          <button
            className="control-btn"
            onClick={onReset}
            disabled={disabled || currentStep === 1}
            title="Reiniciar"
          >
            <RotateCcw size={18} />
          </button>
          
          <button
            className="control-btn"
            onClick={onPrevious}
            disabled={disabled || currentStep === 1}
            title="Paso anterior"
          >
            <SkipBack size={18} />
          </button>
          
          <button
            className={`control-btn play-pause ${isPlaying ? 'playing' : 'paused'}`}
            onClick={isPlaying ? onPause : onPlay}
            disabled={disabled || currentStep >= totalSteps}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button
            className="control-btn"
            onClick={onNext}
            disabled={disabled || currentStep >= totalSteps}
            title="Siguiente paso"
          >
            <SkipForward size={18} />
          </button>
        </div>
        
        <div className="speed-controls">
          <span className="speed-label">Velocidad:</span>
          <div className="speed-buttons">
            {speedOptions.map(option => (
              <button
                key={option.value}
                className={`speed-btn ${speed === option.value ? 'active' : ''}`}
                onClick={() => onSpeedChange(option.value)}
                disabled={disabled}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="progress-bar">
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="progress-text">
          {Math.round((currentStep / totalSteps) * 100)}% completado
        </div>
      </div>
    </motion.div>
  );
};