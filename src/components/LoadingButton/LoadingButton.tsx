import type { ReactNode } from 'react';
import './LoadingButton.css';

interface LoadingButtonProps {
  children: ReactNode;
  loading: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function LoadingButton({ 
  children, 
  loading, 
  className = '', 
  onClick, 
  type = 'button',
  disabled 
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      className={`loading-btn ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="loading-spinner" />}
      {children}
    </button>
  );
}