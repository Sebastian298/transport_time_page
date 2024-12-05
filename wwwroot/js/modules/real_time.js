import { httpService } from "../services/http_request.js";
import { setLocalStorage, getLocalStorage, removeLocalStorage } from "../helpers/local_storage.js";

const map = L.map("map-container").setView(
  [27.447980575501855, -99.5116616693201],
  12
);

// Estilo del mapa base con tema claro
L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  attribution:
    '© OpenStreetMap contributors | <a href="https://www.openstreetmap.org/copyright">Términos</a>',
  maxZoom: 19,
}).addTo(map);

const routeSettings = {
  routeId: "",
  truckId: "",
  currentIndex: 0, // Índice actual del recorrido
};

let activeRoute = null; // Ruta activa para evitar conflictos de animación
let currentMarker = null; // Marcador actual
let routeLayer = null; // Capa actual de la ruta

document.addEventListener("DOMContentLoaded", async () => {
  const user = getLocalStorage("session");
  if (user) {
    const { matricula } = user;
    document.getElementById("userNameIcon").innerHTML = matricula;
  } else {
    document.getElementById("userProfile").style.display = "none";
  }

  document.getElementById("logout-btn").addEventListener("click", () => {
    removeLocalStorage("session");
    window.location.href = "/";
  });
  await getAssignedRoutesAsync();
  $(`#route-select`).on("change", async function () {
    const routeIdValue = $(this).val();
    const route = await getDetaillRouteAsync(routeIdValue);

    // Detener la animación de la ruta activa
    activeRoute = null;

    const { truckName, initialLocation, routeId, truckId } = route;
    routeSettings.routeId = routeId;
    routeSettings.truckId = truckId;

    changeTruckName(truckName);

    const { summary, points } = await getRouteCoordinatesToFinish(initialLocation);
    const formattedSummary = formatTimeResponse(summary);

    // Actualizar la información del viaje
    setDivTravelInfo(formattedSummary);

    // Dibujar la ruta en el mapa
    drawRoute(points);

    // Iniciar la animación del camión por segmentos
    animateTruckSegments(routeId, points);
  });
});

const getAssignedRoutesAsync = async () => {
  const url = "https://localhost:7048/Transport/GetAssignedRoutes";
  const response = await httpService.get(url);
  const { content } = response;
  $(`#route-select`).select2({
    data: content || [],
    width: "100%",
  });
};

const getDetaillRouteAsync = async (routeId) => {
  const url = `https://localhost:7048/Transport/GetDetailRouteByRouteId?routeId=${routeId}`;
  const response = await httpService.get(url);
  const { content } = response;
  return content;
};

const getRouteCoordinatesToFinish = async (initialCoordinates = "") => {
  const url = `https://localhost:7048/Transport/GetInfoForCurrentRoute?originCoordinates=${initialCoordinates}`;
  const response = await httpService.get(url);
  const { content } = response;
  return content;
};

const changeTruckName = (truckName) => {
  document.getElementById("truckName").innerText = `Nombre Unidad: ${truckName}`;
};

const formatTimeResponse = ({
  lengthInMeters,
  travelTimeInSeconds,
  departureTime,
  arrivalTime,
}) => {
  return {
    lengthInKilometers: (lengthInMeters / 1000).toFixed(2) + " km",
    travelTime: new Date(travelTimeInSeconds * 1000)
      .toISOString()
      .substr(11, 8), // Formato HH:MM:SS
    departureTimeFormatted: new Date(departureTime).toLocaleString("es-MX", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Mexico_City",
    }),
    arrivalTimeFormatted: new Date(arrivalTime).toLocaleString("es-MX", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Mexico_City",
    }),
  };
};

const setDivTravelInfo = ({
  lengthInKilometers,
  travelTime,
  departureTimeFormatted,
  arrivalTimeFormatted,
  isRouteCompleted = false, // Nuevo parámetro para identificar si la ruta está completa
}) => {
  const div = document.getElementById("travelGeneralInfo");

  // Mensaje adicional si el camión ha llegado al destino
  const completionBadge = isRouteCompleted
    ? `
      <div class="alert alert-success mt-3" role="alert">
        <strong>Camión llegó al destino.</strong>
        Mantenga el orden al momento de ingresar al transporte para evitar un accidente.
      </div>
    `
    : "";

  // Actualizar contenido del div
  div.innerHTML = `
       <label for="" class="form-label">Última Actualización GPS: ${departureTimeFormatted}</label>
       <br>
       <label for="" class="form-label">Hora de llegada estimada: ${arrivalTimeFormatted}</label>
       <br>
       <label for="" class="form-label">Kilómetros: ${lengthInKilometers}</label>
       <br>
       <label for="" class="form-label">Minutos de camino: ${travelTime}</label>
       ${completionBadge} <!-- Insertar el badge si la ruta está completa -->
    `;
};


const drawRoute = (points) => {
  const latLngs = points.map((coord) => [coord.latitude, coord.longitude]);

  if (routeLayer) {
    map.removeLayer(routeLayer); // Limpiar capa previa
  }

  routeLayer = L.polyline(latLngs, {
    color: "blue",
    weight: 5,
    opacity: 0.8,
  }).addTo(map);

  // Ajustar el mapa para que coincida con la nueva línea
  map.fitBounds(routeLayer.getBounds());
};

const addCustomMarker = (lat, lng, iconUrl) => {
  const customIcon = L.icon({
    iconUrl: iconUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  // Agregar marcador
  return L.marker([lat, lng], { icon: customIcon }).addTo(map);
};

const updateMarker = (point) => {
  if (currentMarker) {
    map.removeLayer(currentMarker);
  }

  currentMarker = addCustomMarker(
    point.latitude,
    point.longitude,
    "https://i.pinimg.com/564x/dc/37/90/dc379018a3b39a4b04d477934be01758.jpg"
  );
};

const animateTruckSegments = async (routeId, points) => {
    activeRoute = routeId;
  
    let currentSegment = getSegmentProgress(routeId);
  
    if (currentSegment >= points.length - 1) {
      currentSegment = points.length - 2;
    }
  
    drawRoute(points);
    updateMarker(points[currentSegment]);
  
    for (let i = currentSegment; i < points.length - 1; i++) {
      if (routeId !== activeRoute) {
        saveSegmentProgress(routeId, i);
        return;
      }
  
      const start = points[i];
      const next = points[i + 1];
  
      await animateMarkerMovement(start, next);
  
      const { summary, points: updatedPoints } = await getRouteCoordinatesToFinish(
        `${next.latitude},${next.longitude}`
      );
  
      const formattedSummary = formatTimeResponse(summary);
      setDivTravelInfo(formattedSummary);
  
      points = updatedPoints;
      drawRoute(points);
  
      saveSegmentProgress(routeId, i + 1);
      await new Promise((resolve) => setTimeout(resolve, 3000));

    }
  
    // Ruta completada
    console.log("Camión llegó al destino");
  
    // Mostrar mensaje de llegada en el resumen
    setDivTravelInfo({
      lengthInKilometers: "0 km",
      travelTime: "00:00:00",
      departureTimeFormatted: "N/A",
      arrivalTimeFormatted: "N/A",
      isRouteCompleted: true, // Activar el mensaje de llegada
    });
  
    // Eliminar la ruta de la API y del localStorage
    await handleRouteCompletion(routeId, routeSettings.truckId);
    $('#route-select').select2('destroy');
    await getAssignedRoutesAsync();
};

const animateMarkerMovement = async (start, end) => {
  const steps = 20;
  const latStep = (end.latitude - start.latitude) / steps;
  const lngStep = (end.longitude - start.longitude) / steps;

  for (let i = 1; i <= steps; i++) {
    const lat = start.latitude + latStep * i;
    const lng = start.longitude + lngStep * i;

    updateMarker({ latitude: lat, longitude: lng });
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

const saveSegmentProgress = (routeId, segmentIndex) => {
  const progress = getLocalStorage("segmentProgress") || {};
  progress[routeId] = segmentIndex;
  setLocalStorage("segmentProgress", progress);
};

const getSegmentProgress = (routeId) => {
  const progress = getLocalStorage("segmentProgress") || {};
  return progress[routeId] || 0;
};




// Función para manejar la finalización de la ruta
const handleRouteCompletion = async (routeId, truckId) => {
    try {
      // Llamar a la API para eliminar la ruta
      const response = await removeRouteWithTruckAsync(routeId, truckId);
  
      if (response && response.statusCode === 200) {
        console.log("Ruta eliminada exitosamente del servidor");
      } else {
        console.error("Error al eliminar la ruta del servidor", response);
      }
    } catch (error) {
      console.error("Error al intentar eliminar la ruta", error);
    }
  
    // Eliminar la información de la ruta del localStorage
    removeRouteProgress(routeId);
  };

// Función para eliminar la entrada del localStorage
const removeRouteProgress = (routeId) => {
    const progress = getLocalStorage("segmentProgress") || {};
    delete progress[routeId];
    setLocalStorage("segmentProgress", progress);
  };

const removeRouteWithTruckAsync = async (routeId, truckId) => {
    const url = `https://localhost:7048/Transport/RemoveTruckFromRoute?busId=${truckId}&routeId=${routeId}`;
    const response = await httpService.delete(url);
    return response;
}