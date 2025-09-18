interface LineQRCodeProps {
  liffId: string;
}

export const LineQRCode = ({ liffId }: LineQRCodeProps) => {
  return (
    <div className="qr-code">
      <p>Scan to open in LINE</p>
      <div className="qr-placeholder">📱</div>
    </div>
  );
};