import React, { useState } from 'react';
import styles from './PromptInput.module.scss';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  onSubmit, 
  placeholder = "Describe the course you want to create...",
  disabled = false 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || disabled) return;

    setIsLoading(true);
    try {
      await onSubmit(prompt.trim());
      setPrompt('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.promptInput}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputContainer}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={styles.textarea}
            rows={4}
          />
          <div className={styles.inputFooter}>
            <span className={styles.hint}>
              Press Ctrl+Enter to submit
            </span>
            <button
              type="submit"
              disabled={!prompt.trim() || disabled || isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <span className={styles.spinner}>⏳</span>
              ) : (
                '🚀 Create Course'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;
