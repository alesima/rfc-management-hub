import React, { useState } from "react";
import { router } from "@inertiajs/react";
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

  const handleVote = (type) => {
    router.post(
      route("rfcs.vote", rfcId),
      {
        type,
      },
      {
        onSuccess: ({ props }) => {
          setUpvotes(props.upvotes);
          setDownvotes(props.downvotes);
          setUserVote(type === userVote ? null : type);
        },
      }
    );
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
