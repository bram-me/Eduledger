import React, { useRef } from "react";
import ReactToPdf from "react-to-pdf";

const Receipt = () => {
    const pdfRef = useRef();

    return (
        <div>
            <h2>Transaction Receipt</h2>
            <div ref={pdfRef} style={{ padding: 20, border: "1px solid black" }}>
                <p>Transaction ID: 123456789</p>
                <p>Amount: 50 HBAR</p>
                <p>Status: Successful</p>
            </div>
            <ReactToPdf targetRef={pdfRef} filename="receipt.pdf">
                {({ toPdf }) => <button onClick={toPdf}>Download Receipt</button>}
            </ReactToPdf>
        </div>
    );
};

export default Receipt;
