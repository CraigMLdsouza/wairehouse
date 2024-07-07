import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Web from './Web';
// import FirebaseTest from './FirebaseTest';
import { AuthContextProvider } from './AuthContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthContextProvider>
      <Web />
  </AuthContextProvider>
);