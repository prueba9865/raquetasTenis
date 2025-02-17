document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Evitar el comportamiento por defecto de enviar el formulario

    const email = document.getElementById('email').value;
    const contrasena = document.getElementById('contrasena').value;

    // Enviar los datos al backend
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, contrasena })
    })
    .then(response => response.json())
    .then(data => {
        // Verifica que el mensaje de éxito está presente
        if (data.message === "Login exitoso") {
            // Si es exitoso, redirigir a la página de crear raqueta
            console.log('Login exitoso, token guardado en la cookie');
            window.location.href = '/raquetas'; // Redirigir al index
        } else {
            alert('Login fallido: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Hubo un error al iniciar sesión');
    });
});