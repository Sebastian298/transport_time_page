import {httpService} from '../services/http_request.js';

document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('loginButton').addEventListener('click',async ()=>{
        const buttonText = document.getElementById("buttonText");
        const buttonSpinner = document.getElementById("buttonSpinner");
        buttonText.textContent = "Creando...";
        buttonSpinner.classList.remove("d-none");
        document.getElementById("loginButton").disabled = true;
        await registerUserAsync();
        buttonText.textContent = "Registrarse";
        buttonSpinner.classList.add("d-none");
        document.getElementById("loginButton").disabled = false;

        document.getElementById('input-matricula').value = '';
        document.getElementById('input-password').value = '';
    })
})


const registerUserAsync = async () =>{
    const matricula = document.getElementById('input-matricula').value;
    const password = document.getElementById('input-password').value;

    if (matricula === '' || password === '') {
        Swal.fire({
            title: "Error",
            text: 'Se deben llenar todos los campos',
            icon: "error",
            confirmButtonText: "Ok",
        });
        return;
    }
    const url = 'https://localhost:7048/Transport/CreateUser';
    const data = {
        matricula: matricula,
        password: password
    }
    const response = await httpService.post(url, data);
    const { statusCode, content, innerException } = response;
    if (statusCode === 200) {
        Swal.fire({
            title: "Usuario registrado",
            text: 'Usuario registrado con éxito',
            icon: "success",
            confirmButtonText: "Ok",
        });
    } else {
        Swal.fire({
            title: "Error",
            text: 'Error al registrar usuario',
            icon: "error",
            confirmButtonText: "Ok",
        });
    }
}