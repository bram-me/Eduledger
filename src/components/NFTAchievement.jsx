import React, { useState } from "react";
import { Client, TokenCreateTransaction, TokenSupplyType, Hbar } from "@hashgraph/sdk";

const NFTAchievement = () => {
  const [nftId, setNftId] = useState("");
  const [loading, setLoading] = useState(false);

  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  const issueNFT = async () => {
    setLoading(true);
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    try {
      // Example: Create an NFT for student achievement
      const transaction = await new TokenCreateTransaction()
        .setTokenName("AchievementNFT")
        .setTokenSymbol("ANFT")
        .setTreasuryAccountId(accountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(1)
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      setNftId(receipt.tokenId.toString());
      alert(`NFT Issued! Token ID: ${nftId}`);
    } catch (error) {
      console.error("Error issuing NFT:", error);
      alert("Failed to issue NFT.");
    }
    setLoading(false);
  };

  return (
    <div className="nft-achievement">
      <h2>Issue NFT for Achievement</h2>
      <button onClick={issueNFT} disabled={loading}>Issue NFT</button>
      {loading && <p>Issuing NFT...</p>}
      {nftId && <p>NFT Issued with ID: {nftId}</p>}
    </div>
  );
};

export default NFTAchievement;
