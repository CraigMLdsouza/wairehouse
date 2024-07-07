import React, { useState, useEffect, useRef } from 'react';
import { db } from './FirebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import './App.css';
import Workbench from './Workbench';
import Votes from './Votes';

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

const App = () => {
  const [categoryToolsMap, setCategoryToolsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const sentinelRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [workbenchName, setWorkbenchName] = useState('');
  const [workbenches, setWorkbenches] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const newCategoryToolsMap = {};
        const toolsCollectionRef = collection(db, 'tools');
        const toolsSnapshot = await getDocs(toolsCollectionRef);

        for (const categoryDoc of toolsSnapshot.docs) {
          const categoryName = categoryDoc.id;
          const urlsCollectionRef = collection(categoryDoc.ref, 'urls');
          const urlsSnapshot = await getDocs(urlsCollectionRef);

          const categoryTools = [];

          urlsSnapshot.forEach((urlDoc) => {
            const urlData = urlDoc.data();
            categoryTools.push({
              id: urlDoc.id,
              url: urlData.url,
              votes: urlData.votes || 0,
              category: categoryName
            });
          });

          newCategoryToolsMap[categoryName] = categoryTools.sort((a, b) => b.votes - a.votes);
        }

        setCategoryToolsMap(newCategoryToolsMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tools:', error);
        setLoading(false);
      }
    };

    fetchTools();
  }, [page]);

  useEffect(() => {
    const fetchUserWorkbenches = async () => {
      try {
        if (!currentUser) return;

        const userRef = doc(collection(db, 'users'), currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const existingWorkbenches = userData.workbenches || {};
          const workbenchNames = Object.keys(existingWorkbenches);
          setWorkbenches(workbenchNames);
        }
      } catch (error) {
        console.error('Error fetching user workbenches:', error);
      }
    };

    fetchUserWorkbenches();
  }, [currentUser]);

  const getHostname = (url) => {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname.charAt(0).toUpperCase() + hostname.slice(1);
  };

  const addToWorkbench = async (tool) => {
    try {
      if (!currentUser) {
        console.error('User not authenticated.');
        return;
      }
  
      const userRef = doc(collection(db, 'users'), currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        console.error('User document not found.');
        return;
      }
  
      const existingWorkbenches = userDoc.data().workbenches || {};
      const existingWorkbenchNames = Object.keys(existingWorkbenches);
  
      let selectedWorkbenchName = workbenchName;
  
      if (!selectedWorkbenchName) {
        selectedWorkbenchName = prompt('Enter a name for your workbench:');
        if (!selectedWorkbenchName) {
          console.error('Workbench name is required.');
          return;
        }
      }
  
      if (!existingWorkbenchNames.includes(selectedWorkbenchName)) {
        existingWorkbenches[selectedWorkbenchName] = [];
        setWorkbenches([...workbenches, selectedWorkbenchName]);
      }
  
      const workbenchTools = existingWorkbenches[selectedWorkbenchName];
      const toolAlreadyInWorkbench = workbenchTools.some((item) => item.id === tool.id);
      if (toolAlreadyInWorkbench) {
        console.error('Tool already exists in the selected workbench.');
        return;
      }
  
      existingWorkbenches[selectedWorkbenchName].push(tool);
  
      await setDoc(userRef, { workbenches: existingWorkbenches }, { merge: true });
  
      console.log('Tool added to workbench:', tool.id);
    } catch (error) {
      console.error('Error adding tool to workbench:', error);
    }
  };

  const handleToolClick = (url) => {
    window.open(url, '_blank');
  };

  const handleIntersect = (entries) => {
    if (entries[0].isIntersecting && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, { threshold: 1 });
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [sentinelRef.current, loading]);

  const filteredTools = Object.entries(categoryToolsMap)
    .reduce((filtered, [category, tools]) => {
      const filteredCategoryTools = tools.filter((tool) => {
        const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
        const matchesSearch = tool.url.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      if (filteredCategoryTools.length > 0) {
        filtered.push({ category, tools: filteredCategoryTools });
      }
      return filtered;
    }, []);

  return (
    <div className="app">
      <h1>Wairehouse.ai</h1>
      <Workbench currentUser={currentUser} />
      <div className="filters">
        <input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value || '')}
        >
          <option value="">All Categories</option>
          {Object.keys(categoryColors).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="tool-list">
        {filteredTools.map(({ category, tools }) => (
          <div key={category}>
            <h2 style={{ backgroundColor: categoryColors[category] }}>{category}</h2>
            {tools.map((tool) => (
              <div key={tool.id} className="super-tool-block">
                <div className="tool-block" onClick={() => handleToolClick(tool.url)}>
                  <span>{getHostname(tool.url)}</span>
                  <span className="category-tag" style={{ backgroundColor: categoryColors[category] }}>
                    {tool.category}
                  </span>
                </div>
                <div className="button-container">
                  <select
                    value={workbenchName}
                    onChange={(e) => setWorkbenchName(e.target.value)}
                  >
                    <option value="">Create/Select</option>
                    {workbenches.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <button className="add-button" onClick={() => addToWorkbench(tool)}>
                    Add to Workbench
                  </button>
                  <Votes toolId={tool.id} categoryId={category} />
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={sentinelRef}></div>
        {loading && <div className="loading">Loading more tools...</div>}
      </div>
      <p className="coming-soon">More models coming soon...</p>
    </div>
  );
};

export default App;
