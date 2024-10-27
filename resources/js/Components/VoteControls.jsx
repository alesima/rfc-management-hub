import React, { useState } from "react";
import axios from "axios";
import VoteButton from "./VoteButton";
import PopupAlert from "./PopupAlert";

const VoteControls = ({
  rfcId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserVote = null,
  isAuthenticated = false,
}) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [showAlert, setShowAlert] = useState(false);

  const handleVote = async (type) => {
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios.post(route("rfcs.vote", rfcId), { type });
      const { upvotes, downvotes } = response.data;
      setUpvotes(upvotes);
      setDownvotes(downvotes);
      setUserVote(type === userVote ? null : type);
    } catch (error) {
      console.error("Failed to submit vote:", error);
    }
  };

  return (
    <div className="flex items-center space-x-4 mt-4">
      <VoteButton
        type="upvote"
        count={upvotes}
        onVote={() => handleVote("upvote")}
        isSelected={userVote === "upvote"}
      />
      <VoteButton
        type="downvote"
        count={downvotes}
        onVote={() => handleVote("downvote")}
        isSelected={userVote === "downvote"}
      />

      {showAlert && (
        <PopupAlert
          message={"You must be logged in to vote"}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default VoteControls;
