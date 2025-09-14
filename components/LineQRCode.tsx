import React, { useState } from 'react';

interface LineQRCodeProps {
  liffId: string;
}

export const LineQRCode: React.FC<LineQRCodeProps> = ({ liffId }) => {
  const [showQR, setShowQR] = useState(false);
  const liffUrl = `https://liff.line.me/${liffId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(liffUrl);
    alert('LIFF URL copied to clipboard!');
  };

  return (
    <div className="line-qr-container">
      <button
        className="line-qr-toggle"
        onClick={() => setShowQR(!showQR)}
      >
        {showQR ? 'Hide QR Code' : 'Show QR Code'}
      </button>

      {showQR && (
        <div className="line-qr-content">
          <div className="qr-placeholder">
            <div className="qr-instructions">
              <h4>To use in LINE app:</h4>
              <ol>
                <li>Open LINE app on your phone</li>
                <li>Scan this QR code or click the link below</li>
                <li>Add the LIFF app to your LINE</li>
              </ol>
            </div>
            <div className="qr-code-area">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(liffUrl)}`}
                alt="LINE LIFF QR Code"
                className="qr-code-image"
              />
            </div>
            <div className="qr-url">
              <input
                type="text"
                value={liffUrl}
                readOnly
                className="liff-url-input"
              />
              <button onClick={copyToClipboard} className="copy-url-btn">
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};