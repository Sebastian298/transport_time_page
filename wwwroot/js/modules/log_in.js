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
  document.getElementById("imgStudent").addEventListener("click", () => {
    document.getElementById("profile-container").style.display = "none";
    const container = document.getElementById("student-container");
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

    document.getElementById("loginButton").addEventListener("click", async () => {
      const buttonText = document.getElementById("buttonTextStudent");
      const buttonSpinner = document.getElementById("buttonSpinnerStudent");

      try {
        // Mostrar el spinner y deshabilitar el botón
        buttonText.textContent = "Iniciando sesión...";
        buttonSpinner.classList.remove("d-none");
        document.getElementById("loginButton").disabled = true;

        // Llamar a la función asíncrona
        await validateLogIn();
      } catch (error) {
        console.error(error);
        Swal.fire({
            title: "Error!",
            text: "Ocurrió un error inesperado",
            icon: "error",
            confirmButtonText: "Ok",
        });
      } finally {
        // Ocultar el spinner y habilitar el botón nuevamente
        buttonText.textContent = "Iniciar Sesión";
        buttonSpinner.classList.add("d-none");
        document.getElementById("loginButton").disabled = false;
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
  const url = "https://sebastianrios-001-site1.mtempurl.com/Transport/GetUnnasignedTrucks";
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
  const url = "https://sebastianrios-001-site1.mtempurl.com/Transport/GetUnnasignedRoutes";
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
  const url = "https://sebastianrios-001-site1.mtempurl.com/Transport/AssignRouteToTruck";
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

const validateLogIn = async () => {
  const url = "https://sebastianrios-001-site1.mtempurl.com/Transport/GetLogInUsers";

  const matricula = document.getElementById("input-matricula").value;
  const password = document.getElementById("input-password").value;

  if (matricula === "" || password === "") {
    Swal.fire({
      title: "Error!",
      text: "Debe ingresar su matricula y contraseña",
      icon: "error",
      confirmButtonText: "Ok",
    });
    return;
  }

  const data = {
    matricula,
    password
  };
  const response = await httpService.post(url, data);
  const { statusCode, content, innerException } = response;
  if(content){
    setLocalStorage("session", content);
    window.location.href = "/index.html"; 
  }else{
    Swal.fire({
      title: "Error!",
      text: 'Verifique sus credenciales',
      icon: "error",
      confirmButtonText: "Ok",
    });
  }
}