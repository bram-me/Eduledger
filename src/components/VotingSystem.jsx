import React, { useState } from "react";
import { Client, TransferTransaction, Hbar } from "@hashgraph/sdk";

const VotingSystem = () => {
  const [vote, setVote] = useState("");
  const [votingStatus, setVotingStatus] = useState("");

  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  const castVote = async () => {
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    try {
      const transaction = await new TransferTransaction()
        .addHbarTransfer(accountId, new Hbar(-1)) // Deduct fee for casting vote
        .addHbarTransfer("0.0.123456", new Hbar(1)) // Transfer vote fee
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      setVotingStatus(`Vote cast successfully! Status: ${receipt.status.toString()}`);
    } catch (error) {
      console.error("Error casting vote:", error);
      setVotingStatus("Vote casting failed!");
    }
  };

  return (
    <div className="voting-system">
      <h2>Voting System</h2>
      <label>
        Cast your vote:
        <select value={vote} onChange={(e) => setVote(e.target.value)}>
          <option value="">Select Option</option>
          <option value="optionA">Option A</option>
          <option value="optionB">Option B</option>
        </select>
      </label>
      <button onClick={castVote}>Submit Vote</button>
      {votingStatus && <p>{votingStatus}</p>}
    </div>
  );
};

export default VotingSystem;
