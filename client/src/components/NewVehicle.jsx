import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleService } from "../../_services/vehicle.service";
import Axios from "../../_services/caller.service"

const initialForm = {
  marque: "",
  modele: "",
  annee: "",
  client_id: "",
};


const NewVehicle = () => {
    const navigate = useNavigate();

    const [marque, setMarque] = useState("");
    const [modele, setModele] = useState("");
    const [annee, setAnnee] = useState("");
    const [clientId, setClientId] = useState("");
    const [clients, setClients] = useState([]);
    const [csrfToken, setCsrfToken] = useState("");

    useEffect(() => {
    const fetchData = async () => {
        try {
        const csrfRes = await Axios.get("/api/csrf");
        setCsrfToken(csrfRes.data.token);

        const clientsRes = await Axios.get("/api/clients");
        setClients(clientsRes.data);
        } catch (err) {
        console.log(err);
        }
    };
    fetchData();
    }, []);

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = { marque, modele, annee, client_id: clientId, token: csrfToken };
        await vehicleService.addVehicle(payload);
        navigate("/vehicles");
    } catch (err) {
        console.log(err);
    }
    };

    return (
    <div>
        <h1 className="text-4xl text-center mt-5">Ajouter un véhicule</h1>
        <div className="border border-black rounded w-1/2 m-auto mt-5 p-5">
        <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>
            <div className="mb-5">
            <label htmlFor="marque" className="block mb-2 text-sm font-medium text-gray-900">
                Marque
            </label>
            <input
                type="text"
                id="marque"
                name="marque"
                onChange={(e) => setMarque(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
            />
            </div>
            <div className="mb-5">
            <label htmlFor="modele" className="block mb-2 text-sm font-medium text-gray-900">
                Modèle
            </label>
            <input
                type="text"
                id="modele"
                name="modele"
                onChange={(e) => setModele(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
            />
            </div>
            <div className="mb-5">
            <label htmlFor="annee" className="block mb-2 text-sm font-medium text-gray-900">
                Année
            </label>
            <input
                type="text"
                id="annee"
                name="annee"
                onChange={(e) => setAnnee(e.target.value)}
                placeholder="2020"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
            />
            </div>
            <div className="mb-5">
            <label htmlFor="client_id" className="block mb-2 text-sm font-medium text-gray-900">
                Client
            </label>
            <select
                id="client_id"
                name="client_id"
                onChange={(e) => setClientId(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
            >
                <option value="">— Sélectionner un client —</option>
                {clients.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.firstname} {c.lastname} ({c.email})
                </option>
                ))}
            </select>
            </div>
            <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
            >
            Valider
            </button>
        </form>
        </div>
    </div>
    );
};

export default NewVehicle;