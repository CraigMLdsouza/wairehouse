import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './FirebaseConfig';
import './Workbench.css';

const categoryColors = {
  'AI email writer': '#3498db',
  'AI image generator': '#2ecc71',
  'AI presentation maker': '#e74c3c',
  'AI chatbot creator': '#9b59b6',
  'AI video editor': '#f39c12',
  'AI language translator': '#1abc9c',
  'AI data analyst': '#34495e',
  'AI music composer': '#d35400',
  'AI code generator': '#27ae60'
};

const Workbench = ({ currentUser }) => {
  const [activeWorkbench, setActiveWorkbench] = useState('');
  const [workbenches, setWorkbenches] = useState([]);
  const [toolsInWorkbench, setToolsInWorkbench] = useState([]);

  useEffect(() => {
    const fetchUserWorkbenches = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setWorkbenches(Object.keys(userData.workbenches || {}));
        }
      } catch (error) {
        console.error('Error fetching user workbenches:', error);
      }
    };

    fetchUserWorkbenches();
  }, [currentUser]);

  useEffect(() => {
    const fetchToolsInWorkbench = async () => {
      if (!currentUser || !activeWorkbench) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const workbenchesData = userData.workbenches || {};
          const selectedWorkbench = workbenchesData[activeWorkbench] || [];

          // Update state with the fetched tools
          setToolsInWorkbench(selectedWorkbench);
        }
      } catch (error) {
        console.error('Error fetching tools in workbench:', error);
      }
    };

    fetchToolsInWorkbench();
  }, [currentUser, activeWorkbench]);

  const removeFromWorkbench = async (toolId) => {
    if (!currentUser || !activeWorkbench) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const workbenchesData = userData.workbenches || {};
        const updatedWorkbench = workbenchesData[activeWorkbench].filter((tool) => tool.id !== toolId);

        // Update Firestore document with the modified workbench array
        await updateDoc(userDocRef, { workbenches: { ...workbenchesData, [activeWorkbench]: updatedWorkbench } });

        // Update local state to reflect the removal
        setToolsInWorkbench(updatedWorkbench);
      }
    } catch (error) {
      console.error('Error removing tool from workbench:', error);
    }
  };

  const handleWorkbenchChange = (event) => {
    setActiveWorkbench(event.target.value);
  };

  const deleteWorkbench = async () => {
    if (!currentUser || !activeWorkbench) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { workbenches: { [activeWorkbench]: [] } });
      setToolsInWorkbench([]); // Clear tools when workbench is deleted
      setWorkbenches((prevWorkbenches) => prevWorkbenches.filter((wb) => wb !== activeWorkbench));
      setActiveWorkbench('');
    } catch (error) {
      console.error('Error deleting workbench:', error);
    }
  };

  return (
    <div className="container">
      <h2>My Workbenches</h2>
      <div className="dropdown">
        <select value={activeWorkbench} onChange={handleWorkbenchChange}>
          <option value="">Select Workbench</option>
          {workbenches.map((workbenchName) => (
            <option key={workbenchName} value={workbenchName}>
              {workbenchName}
            </option>
          ))}
        </select>
        {activeWorkbench && (
          <button className="delete-button" onClick={deleteWorkbench}>
            Delete Workbench
          </button>
        )}
      </div>
      {activeWorkbench && (
        <div className="tool-container">
          {toolsInWorkbench.map((tool) => (
            <div key={tool.id} className="card" onClick={() => window.open(tool.url, '_blank')}>
              <div className="card-header">
                <span className="card-name">{formatUrl(tool.url)}</span>
                <span className="card-category" style={{ backgroundColor: categoryColors[tool.category] }}>
                  {tool.category}
                </span>
              </div>
              <button className="remove-button" onClick={(e) => { e.stopPropagation(); removeFromWorkbench(tool.id); }}>
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to format the URL
const formatUrl = (url) => {
  const hostname = new URL(url).hostname;
  const domain = hostname.replace('www.', '').split('.')[0].toUpperCase();
  return domain;
};

export default Workbench;
