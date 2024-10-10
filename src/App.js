import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Components/LandingPage';
import ClientAuth from './Components/ClientAuth';
import ServiceProviderAuth from './Components/ServiceProviderAuth';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/client-auth" element={<ClientAuth />} />
          <Route path="/provider-auth" element={<ServiceProviderAuth />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
