const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    
    try {
        const res = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        
        if (!res.ok) {
            mensajeError.classList.remove("escondido");
            return;
        }
        
        const resJson = await res.json();
        if (resJson.redirect) {
            window.location.href = resJson.redirect;
        }
    } catch (error) {
        console.error('Error:', error);
        mensajeError.classList.remove("escondido");
    }
});
    