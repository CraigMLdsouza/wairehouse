import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './FirebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Import Login specific CSS

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in successfully:', user.uid);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className='login-bg'>
    <div className="login-container">
      <h2>Login</h2>
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
      <button onClick={handleLogin}>Login</button>
      {error && <p className="login-error">{error}</p>}
      <div className="login-signup-link">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
    </div>
  );
};

export default Login;