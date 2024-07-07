import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
// import { firebaseConfig } from './firebaseConfig';

const FirebaseTest = () => {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const db = getFirestore();
        const toolsCollectionRef = collection(db, 'tools');
        const toolsSnapshot = await getDocs(toolsCollectionRef);

        const allTools = [];

        toolsSnapshot.forEach((categoryDoc) => {
          const categoryName = categoryDoc.id;
          const urlsCollectionRef = collection(categoryDoc.ref, 'urls');

          // Use getDocs to fetch the URLs snapshot
          getDocs(urlsCollectionRef).then((urlsSnapshot) => {
            const categoryTools = [];

            urlsSnapshot.forEach((urlDoc) => {
              const urlData = urlDoc.data();
              categoryTools.push({
                id: urlDoc.id,
                url: urlData.url
              });
            });

            allTools.push({
              category: categoryName,
              tools: categoryTools
            });

            // Update state after processing all data
            setTools(allTools);
          });
        });
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };

    fetchTools();
  }, []);

  return (
    <div>
      <h2>AI Tools Directory</h2>
      {tools.map((category) => (
        <div key={category.category}>
          <h3>{category.category}</h3>
          <ul>
            {category.tools.map((tool) => (
              <li key={tool.id}>
                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                  {tool.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default FirebaseTest;
