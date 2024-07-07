import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import { setDoc, doc } from 'firebase/firestore';
import './SignUp.css'; // Import SignUp specific CSS

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userData = {
        email: user.email,
        uid: user.uid,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User registered successfully:', user.uid);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="signup-bg">
    <div className="signup-container">
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={handleSignUp}>Sign Up</button>
      {error && <p className="signup-error">{error}</p>}
    </div>
    </div>
  );
};

export default SignUp;