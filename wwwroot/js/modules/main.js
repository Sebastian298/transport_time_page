import {getLocalStorage,removeLocalStorage} from '../helpers/local_storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const user = getLocalStorage('session');
    if (user) {
        document.getElementById('logInAccess').style.display = 'none';
        const {matricula} = user;
        document.getElementById('userNameIcon').innerHTML = matricula;
    }else{
        document.getElementById('userProfile').style.display = 'none';
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        removeLocalStorage('session');
        window.location.href = '/';
    });
});