import Axios from './caller.service'

let addVehicle = (vehicle) => {
    return Axios.post('/api/vehicles', vehicle)
}

let getAllVehicles = () => {
    return Axios.get('/api/vehicles')
}

let getOneVehicle = (id) => {
    return Axios.get(`/api/vehicles/${id}`)
}

let updateVehicle = (id) => {
    return Axios.put(`/api/vehicles/${id}`)
}

let deleteVehicle = (id) => {
    return Axios.delete(`/api/vehicles/${id}`)
}

export const vehicleService = {
    addVehicle, getAllVehicles, getOneVehicle, updateVehicle, deleteVehicle
}

