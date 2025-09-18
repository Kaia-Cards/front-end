interface WalletConnectProps {
  onWalletChange: (wallet: any) => void;
  translations: any;
}

export const WalletConnect = ({ onWalletChange, translations }: WalletConnectProps) => {
  return (
    <div className="wallet-connect">
      <button className="wallet-btn">
        💳 Connect Wallet
      </button>
    </div>
  );
};