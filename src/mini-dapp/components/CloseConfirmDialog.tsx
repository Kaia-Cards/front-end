interface CloseConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const CloseConfirmDialog = ({ onConfirm, onCancel }: CloseConfirmDialogProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Close App?</h3>
        <p>Are you sure you want to close the app?</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-cancel">Cancel</button>
          <button onClick={onConfirm} className="btn-confirm">Close</button>
        </div>
      </div>
    </div>
  );
};