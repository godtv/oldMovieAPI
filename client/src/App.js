import React from 'react';
import './App.css';

const App = () => {
  return(
      <div className="login-container">

          <form>
              <label htmlFor="login">Login</label>
              <input type="text" placeholder="Login" name="login"/>
              <label>Password</label>
              <input type="password" />

          </form>
      </div>

  );
};
export default App;
