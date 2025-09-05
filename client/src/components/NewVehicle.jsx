import React, { useEffect, useState } from "react";
import { vehicleService } from "../../_services/vehicle.service";
import Axios from "../../_services/caller.service"

const initialForm = {
  marque: "",
  modele: "",
  annee: "",
  client_id: "",
};


const NewVehicle = () => {
const [form, setForm] = useState(initialForm);
  const [clients, setClients] = useState([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  // Charger CSRF + liste clients (admin uniquement)
  useEffect(() => {
    const load = async () => {
      try {
        const [csrfRes, clientsRes] = await Promise.all([
          Axios.get("/api/csrf"),
          Axios.get("/api/clients"), // nécessite cookie JWT admin
        ]);
        setCsrfToken(csrfRes.data.token);
        setClients(clientsRes.data || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data || "Impossible de charger le CSRF ou la liste des clients."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;

    // petite normalisation de l'année (nombre)
    if (name === "annee") {
      const onlyDigits = value.replace(/[^\d]/g, "");
      setForm((f) => ({ ...f, [name]: onlyDigits }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const validate = () => {
    if (!form.marque.trim() || !form.modele.trim()) {
      return "Marque et Modèle sont requis.";
    }
    const year = Number(form.annee);
    if (!Number.isInteger(year) || year < 1886 || year > 2100) {
      return "Année invalide (1886–2100).";
    }
    if (!form.client_id) {
      return "Veuillez sélectionner un client.";
    }
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDone(null);

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSubmitting(true);
    try {
      await vehicleService.addVehicle({
        marque: form.marque.trim(),
        modele: form.modele.trim(),
        annee: Number(form.annee),
        client_id: Number(form.client_id),
        token: csrfToken, // ⚠️ requis par ton middleware verifyCSRFToken
      });
      setDone("Véhicule créé avec succès ✅");
      setForm(initialForm); // reset
      // Recharger un nouveau CSRF (optionnel mais sain pour rotations)
      const csrfRes = await Axios.get("/api/csrf");
      setCsrfToken(csrfRes.data.token);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Erreur lors de la création du véhicule.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Chargement…</p>;
  if (error && !submitting && !done) {
    // Affiche l'erreur initiale de chargement si besoin
  }

  return (
    <div style={{ padding: "1rem", maxWidth: 640 }}>
      <h2>Créer un véhicule</h2>

      {error && (
        <p style={{ color: "red", marginTop: 8 }}>❌ {String(error)}</p>
      )}
      {done && (
        <p style={{ color: "green", marginTop: 8 }}>{done}</p>
      )}

      <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
        <div>
          <label htmlFor="marque">Marque</label>
          <input
            id="marque"
            name="marque"
            type="text"
            value={form.marque}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="modele">Modèle</label>
          <input
            id="modele"
            name="modele"
            type="text"
            value={form.modele}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="annee">Année</label>
          <input
            id="annee"
            name="annee"
            type="text"
            inputMode="numeric"
            value={form.annee}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label htmlFor="client_id">Client</label>
          <select
            id="client_id"
            name="client_id"
            value={form.client_id}
            onChange={onChange}
            required
          >
            <option value="">— Sélectionner un client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstname} {c.lastname} — {c.email}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Création…" : "Créer le véhicule"}
        </button>
      </form>
    </div>
  );
};

export default NewVehicle;