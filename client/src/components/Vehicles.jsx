import React, { useEffect, useState } from 'react';
import Header from './Header';
import './vehicles.css'
import { vehicleService } from '../../_services/vehicle.service';

const Vehicles = () => {

    const [ vehicles, setVehicles ] = useState([])
    const [ loaded, setLoaded ] = useState(false)
    const [ err, seTErr ] = useState(false)

    useEffect(() => {
        vehicleService.getAllVehicles()
            .then(res => {
                console.log(res.data)
                setVehicles(res.data)
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
            <h1>Véhicules Client</h1>
            <p>Liste des véhicules</p>
          </header>
          <div className='vehicles-container'>
            {vehicles.map(vehicle => (
            <a href={`/vehicles/${vehicle.id}`}>
            <section className="vehicles">
                <h2>{vehicle.marque} {vehicle.modele}</h2>
                <p>Client : {vehicle.client_lastname} {vehicle.client_firstname}</p>
            </section>
            </a>
            ))}
          </div>
          
        </div>
        </>
      );
    }

};

export default Vehicles;