import { httpService } from '../services/http_request.js'
const map = L.map('map-container').setView([27.447980575501855, -99.5116616693201], 12);

    // Estilo del mapa base con tema claro
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | <a href="https://www.openstreetmap.org/copyright">Términos</a>',
      maxZoom: 19,
    }).addTo(map);
document.addEventListener('DOMContentLoaded',async ()=>{
    
    const routes = await getRoutesAsync()
    const {content} = routes
    createItemsInList(content)
    loadPointInMap(content)
})


const getRoutesAsync = async () =>{
    const url = 'https://localhost:7048/Transport/GetRoutesWithCoordinates'
    const response = await httpService.get(url)
    return response
}

const createItemsInList = (routes) =>{
    const list = document.getElementById('route-list')
    let html = `<h5 class="text-center">Listado de Rutas</h5>`
    routes.forEach(route => {
        html+=`
           <div class="route-item" id=${route.id}>${route.name}</div>
        `
    });
    list.innerHTML = html
}

const loadPointInMap = (routes) =>{
    const customIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png', // Ícono ejemplo, reemplaza si tienes uno propio
        iconSize: [40, 40], // Tamaño del ícono
        iconAnchor: [20, 40], // Punto del ícono
        popupAnchor: [0, -40], // Punto del popup
    });
    const bounds = L.latLngBounds([]); // Crear límites dinámicos para ajustar el mapa

    routes.forEach(route => {
      const [lat, lng] = route.locationReference.split(',').map(Number);

      // Crear marcador con ícono personalizado
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Vincular un popup al marcador
      marker.bindPopup(`
        <div>
          <h5>Parada: ${route.name}</h5>
        </div>
      `);

      // Extender los límites para incluir este marcador
      bounds.extend([lat, lng]);
    });

    // Ajustar el mapa para mostrar todos los marcadores
    map.fitBounds(bounds);
}