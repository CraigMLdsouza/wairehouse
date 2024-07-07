import React, { useState, useEffect } from 'react';
import { db } from './FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import './Votes.css';

const Votes = ({ toolId, categoryId }) => {
  const [votes, setVotes] = useState(0);
  const [currentVote, setCurrentVote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const toolRef = doc(db, 'tools', categoryId, 'urls', toolId);
        const toolDoc = await getDoc(toolRef);
        if (toolDoc.exists()) {
          const toolData = toolDoc.data();
          setVotes(toolData.votes || 0);
          setCurrentVote(toolData.userVotes?.[getAuth().currentUser?.uid] || null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching votes:', error);
        setLoading(false);
      }
    };

    fetchVotes();
  }, [toolId, categoryId]);

  const handleVote = async (vote) => {
    if (loading) return;

    try {
      const userId = getAuth().currentUser?.uid;
      if (!userId) {
        console.error('User not authenticated.');
        return;
      }

      const toolRef = doc(db, 'tools', categoryId, 'urls', toolId);
      const toolDoc = await getDoc(toolRef);

      if (toolDoc.exists()) {
        const toolData = toolDoc.data();
        const currentVotes = toolData.votes || 0;
        const userVotes = toolData.userVotes || {};
        const previousVote = userVotes[userId] || null;

        if (previousVote === vote) {
          return;
        }

        let newVotes = currentVotes;
        if (vote === 'upvote') {
          newVotes += previousVote === 'downvote' ? 2 : 1;
        } else if (vote === 'downvote') {
          newVotes -= previousVote === 'upvote' ? 2 : 1;
        }

        userVotes[userId] = vote;
        await updateDoc(toolRef, { votes: newVotes, userVotes });
        setVotes(newVotes);
        setCurrentVote(vote);
      }
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  return (
    <div className="votes">
      <button
        className={`upvote ${currentVote === 'upvote' ? 'active' : ''}`}
        onClick={() => handleVote('upvote')}
      >
        ▲
      </button>
      <span>{votes}</span>
      <button
        className={`downvote ${currentVote === 'downvote' ? 'active' : ''}`}
        onClick={() => handleVote('downvote')}
      >
        ▼
      </button>
    </div>
  );
};

export default Votes;
