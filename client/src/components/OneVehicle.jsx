import React, { useEffect, useState } from 'react';
import { vehicleService } from '../../_services/vehicle.service';
import { useParams } from 'react-router';
import './vehicles.css'
import Header from './Header';
import { Link } from 'react-router-dom';

const OneVehicle = () => {

    const { id } = useParams()
    const [ vehicle, setVehicle ] = useState([])
    const [ loaded, setLoaded ] = useState(false)
    const [ err, seTErr ] = useState(false)

    useEffect(() => {
        vehicleService.getOneVehicle(id)
            .then(res => {
                console.log(res.data)
                setVehicle(res.data)
                setLoaded(true)
            })
            .catch(error => {
                seTErr(error)
                setLoaded(true)
            })
    }, [])

    if (!loaded) {
        return(
            <h1>Chargement...</h1>
        )
    }
    else if (err) {
        return(
            <p>{err}</p>
        )
    }
    else {
        return (
        <>
          <Header />
        <div className="home-container">
          <header className="header">
            <h1>Véhicule Client</h1>
            <p>Fiche du véhicule numéro {vehicle.id}</p>
          </header>
          <div className='vehicle-container'>
            <section className="vehicle">
                <p>MARQUE : <span>{vehicle.marque}</span></p>
                <p>MODELE : <span>{vehicle.modele}</span></p>
                <p>ANNÉE : <span>{vehicle.annee}</span></p>
                <p>INFORMATIONS CLIENT :</p>
                <p>NOM : <span>{vehicle.client_lastname}</span></p>
                <p>PRENOM : <span>{vehicle.client_firstname}</span></p>
                <p>EMAIL : <span>{vehicle.client_email}</span></p>
                
            </section>
          </div>
          <Link to="/vehicles">
            <button>Mise à jour</button>
          </Link>
          <Link to="/vehicles">
            <button>Supprimer</button>
          </Link>
          <Link to="/vehicles">
            <button>Retour</button>
          </Link>
        </div>
        </>
      );
    }
};

export default OneVehicle;