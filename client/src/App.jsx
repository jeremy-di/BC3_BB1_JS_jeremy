import HomePage from './components/HomePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/Dashboard';
import './App.css';
import Vehicles from './components/Vehicles';
import OneVehicle from './components/OneVehicle';
import NewVehicle from './components/NewVehicle';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<OneVehicle />} />
          <Route path="/vehicles/new" element={<NewVehicle />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;