import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QrCodeScanner = ({ onScan }) => {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      (err) => {
        setError(err);
      }
    );

    return () => {
      scanner.clear();
    };
  }, [onScan]);

  return (
    <div>
      <div id="qr-reader" ref={scannerRef} style={{ width: "100%" }}></div>
      {error && <p style={{ color: "red" }}>{error.message}</p>}
    </div>
  );
};

export default QrCodeScanner;
