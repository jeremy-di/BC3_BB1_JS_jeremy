import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './Dashboard.css';
const baseURI = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
  const [clientCount, setClientCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientCount = async () => {
      try {
        const response = await fetch(baseURI + 'api/clients/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setClientCount(data.count);
        } else {
          alert('Erreur lors de la récupération du nombre de clients');
          navigate('/')
        }
      } catch (error) {
        alert('Erreur réseau');
        navigate('/')
      }
    };

    fetchClientCount();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tableau de bord administrateur</h1>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Clients inscrits</h3>
          <div className="stat-value">{clientCount}</div>
          <div className="stat-description">Nombre total de clients enregistrés</div>
        </div>
        
        <div className="stat-card">
          <h3>Activité récente</h3>
          <div className="stat-value">24h</div>
          <div className="stat-description">Dernière connexion</div>
        </div>
        
        <div className="stat-card">
          <h3>État du système</h3>
          <div className="stat-value">Actif</div>
          <div className="stat-description">Tous les services fonctionnent normalement</div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <button className="action-button" disabled>Gérer les clients</button>
        <button className="action-button" disabled>Gérer les Véhicules</button>
        <button className="action-button" disabled>Rapports</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
