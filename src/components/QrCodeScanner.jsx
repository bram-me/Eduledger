import React, { useState } from "react";
import QrScanner from "react-qr-scanner";

const QrCodeScanner = ({ onScan }) => {
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    if (data) {
      onScan(data);
    }
  };

  const handleError = (err) => {
    setError(err);
  };

  return (
    <div>
      <QrScanner
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "100%" }}
      />
      {error && <p>{error.message}</p>}
    </div>
  );
};

export default QrCodeScanner;
