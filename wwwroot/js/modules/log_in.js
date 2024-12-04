import { getLocalStorage, setLocalStorage } from "../helpers/local_storage.js";
import { httpService } from "../services/http_request.js";

document.addEventListener("DOMContentLoaded", async () => {
  validateAccessToPage();
  await Promise.all([getUnnasignedTrucks(), getUnnasignedRoutes()]);
  document.getElementById("imgDriver").addEventListener("click", () => {
    document.getElementById("profile-container").style.display = "none";
    const container = document.getElementById("driver-container");
    container.classList.toggle("hidden");
  });
  document
    .getElementById("assignRouteButton")
    .addEventListener("click", async () => {
      const buttonText = document.getElementById("buttonText");
      const buttonSpinner = document.getElementById("buttonSpinner");

      try {
        // Mostrar el spinner y deshabilitar el botón
        buttonText.textContent = "Asignando...";
        buttonSpinner.classList.remove("d-none");
        document.getElementById("assignRouteButton").disabled = true;

        // Llamar a la función asíncrona
        await assignRouteToTruck();
      } catch (error) {
        console.error(error);
        Swal.fire({
            title: "Error!",
            text: "Ocurrió un error inesperado",
            icon: "error",
            confirmButtonText: "Ok",
        });
      } finally {

        //limpiar los select2
        $("#truck-select").empty();
        $("#route-select").empty();

        await Promise.all([getUnnasignedTrucks(), getUnnasignedRoutes()]);
        // Ocultar el spinner y habilitar el botón nuevamente
        buttonText.textContent = "Asignar Ruta";
        buttonSpinner.classList.add("d-none");
        document.getElementById("assignRouteButton").disabled = false;
      }
    });
});

const validateAccessToPage = () => {
  const isThereASession = getLocalStorage("session");
  if (isThereASession) {
    window.location.href = "/index.html";
  }
};

const getUnnasignedTrucks = async () => {
  const url = "https://localhost:7048/Transport/GetUnnasignedTrucks";
  const response = await httpService.get(url);
  const { statusCode, content, innerException } = response;
  if (statusCode === 200) {
    $(`#truck-select`).select2({
      data: content || [],
      width: "100%",
    });
  } else console.error(innerException);
};

const getUnnasignedRoutes = async () => {
  const url = "https://localhost:7048/Transport/GetUnnasignedRoutes";
  const response = await httpService.get(url);
  const { statusCode, content, innerException } = response;
  if (statusCode === 200) {
    $(`#route-select`).select2({
      data: content || [],
      width: "100%",
    });
  } else console.error(innerException);
};

const assignRouteToTruck = async () => {
  const busId = document.getElementById("truck-select").value;
  const ruteId = document.getElementById("route-select").value;

  if (busId === "" || ruteId === "") {
    Swal.fire({
      title: "Error!",
      text: "Debe escoger una ruta y una unidad",
      icon: "error",
      confirmButtonText: "Ok",
    });
    return;
  }
  const url = "https://localhost:7048/Transport/AssignRouteToTruck";
  const data = {
    busId,
    ruteId,
  };
  const response = await httpService.post(url, data);
  const { statusCode, content, innerException } = response;
  if (statusCode === 200) {
    Swal.fire({
      title: "Success!",
      text: 'Ruta asignada correctamente',
      icon: "success",
      confirmButtonText: "Ok!",
    });
  } else {
    Swal.fire({
      title: "Error inesperado!",
      text: innerException,
      icon: "error",
      confirmButtonText: "Ok",
    });
  }
};
