import React, { useState } from "react";
import axios from "axios";
import VoteButton from "./VoteButton";

const VoteControls = ({
  rfcId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserVote = null,
}) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote);

  const handleVote = async (type) => {
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
    </div>
  );
};

export default VoteControls;
