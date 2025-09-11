import React from 'react';
import { useLiff } from '../hooks/useLiff';

interface CloseConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  translations: any;
}

export const CloseConfirmDialog: React.FC<CloseConfirmDialogProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  translations 
}) => {
  const { closeWindow } = useLiff();

  const handleConfirm = () => {
    closeWindow();
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="close-confirm-overlay">
      <div className="close-confirm-dialog">
        <h3>Close Application</h3>
        <p>Are you sure you want to close KaiaCards?</p>
        <div className="close-confirm-buttons">
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleConfirm} className="confirm-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};