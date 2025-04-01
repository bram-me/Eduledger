import React, { useState } from "react";
import { Client, TransferTransaction, Hbar } from "@hashgraph/sdk";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import "./VotingSystem.css"; // Assuming you have a CSS file for styling

const VotingSystem = () => {
  const [position, setPosition] = useState("");  // For the selected position
  const [student, setStudent] = useState("");  // For the selected student
  const [showConfirmation, setShowConfirmation] = useState(false);  // For the confirmation modal
  const [selectedVote, setSelectedVote] = useState({ position: "", student: "" });  // To store the selected vote
  const [loading, setLoading] = useState(false); // For loading state while voting
  const [votingStatus, setVotingStatus] = useState("");  // For displaying voting status
  const [votesCount, setVotesCount] = useState({});  // Track the number of votes per candidate

  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  // Example candidates for each position (You can replace with actual data)
  const positions = {
    "Class President": ["Alice Johnson", "John Doe", "Sarah Lee"],
    "Treasurer": ["Michael Smith", "David Wilson", "Linda Green"],
    "Secretary": ["Emily Brown", "Daniel Clark", "Sophia Adams"]
  };

  const castVote = async () => {
    setLoading(true);
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    try {
      const transaction = await new TransferTransaction()
        .addHbarTransfer(accountId, new Hbar(-1)) // Deduct fee for casting vote
        .addHbarTransfer("0.0.123456", new Hbar(1)) // Transfer vote fee
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      setVotingStatus(`Vote cast successfully! Status: ${receipt.status.toString()}`);

      // Update votes count after a successful vote
      setVotesCount((prevVotes) => ({
        ...prevVotes,
        [selectedVote.position]: {
          ...prevVotes[selectedVote.position],
          [selectedVote.student]: (prevVotes[selectedVote.position]?.[selectedVote.student] || 0) + 1,
        }
      }));

      setSelectedVote({ position: "", student: "" }); // Reset after voting
      setPosition(""); // Reset position
      setStudent(""); // Reset student
    } catch (error) {
      console.error("Error casting vote:", error);
      setVotingStatus("Vote casting failed!");
    }

    setLoading(false);
    setShowConfirmation(false); // Close the confirmation modal
  };

  const handlePositionSelection = (selectedPosition) => {
    setPosition(selectedPosition);
    setShowConfirmation(false); // Close any existing confirmation modal
    setStudent(""); // Reset student selection
  };

  const handleStudentSelection = (selectedStudent) => {
    setStudent(selectedStudent);
    setSelectedVote({ position, student: selectedStudent });
    setShowConfirmation(true); // Show the confirmation modal
  };

  const handleConfirmVote = () => {
    castVote(); // Confirm and cast the vote
  };

  const handleCancelVote = () => {
    setShowConfirmation(false); // Close the confirmation modal
  };

  const resetVotes = () => {
    setVotesCount({});
    alert("Votes have been reset!");
  };

  const addCandidate = (position, newCandidate) => {
    positions[position].push(newCandidate);
    alert(`New candidate ${newCandidate} added to ${position}`);
  };

  return (
    <div className="voting-system">
      <h2>Voting System</h2>

      {/* Position Selection */}
      <div>
        <label>
          Select Position:
          <select value={position} onChange={(e) => handlePositionSelection(e.target.value)}>
            <option value="">Select Position</option>
            {Object.keys(positions).map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* If a position is selected, show candidates for that position */}
      {position && (
        <div>
          <h3>Select Candidate for {position}</h3>
          {positions[position].map((candidate, index) => (
            <button
              key={index}
              className="candidate-btn"
              onClick={() => handleStudentSelection(candidate)}
            >
              {candidate}
            </button>
          ))}
        </div>
      )}

      {/* Admin Features */}
      <div className="admin-features">
        <button className="reset-votes-btn" onClick={resetVotes}>
          Reset All Votes
        </button>
        <button className="add-candidate-btn" onClick={() => addCandidate(position, prompt("Enter new candidate name"))}>
          Add New Candidate
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirm Your Vote</h3>
            <p>
              You are voting for <strong>{selectedVote.student}</strong> as <strong>{selectedVote.position}</strong>
            </p>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={handleConfirmVote} disabled={loading}>
                {loading ? <FaSpinner className="spinner" /> : <FaCheck />} Confirm Vote
              </button>
              <button className="btn-cancel" onClick={handleCancelVote}>
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display voting status */}
      {votingStatus && <p>{votingStatus}</p>}

      {/* Display Vote Count */}
      <div className="vote-counts">
        <h3>Vote Counts</h3>
        {Object.keys(votesCount).map((pos) => (
          <div key={pos}>
            <h4>{pos}</h4>
            {Object.entries(votesCount[pos]).map(([candidate, count]) => (
              <p key={candidate}>{candidate}: {count} vote(s)</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotingSystem;
