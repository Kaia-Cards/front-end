import React from 'react';

interface MaintenanceModeProps {
  isActive: boolean;
  translations: any;
}

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ isActive, translations }) => {
  if (!isActive) return null;

  return (
    <div className="maintenance-mode">
      <div className="maintenance-content">
        <div className="maintenance-icon">🔧</div>
        <h2>System Maintenance</h2>
        <p>We're currently performing system maintenance to improve your experience.</p>
        <p>Please check back in a few minutes.</p>
        <div className="maintenance-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
};