document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = {
      username: username,
      password: password
    };

    console.log(loginData);

    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify(loginData) // Send the login data as JSON
        });

        if (response.ok) {
            // Handle successful login (you can redirect or display a success message)
            const responseData = await response.json();
            
            // Assuming the token is returned as a part of the response data
            const token = responseData.token;  // Modify this based on your response structure
            if (token) {
                // Save the token in localStorage
                localStorage.setItem('token', token);
            }

            alert('Login successful!');
            window.location.href = "/home.html";
        } else {
            // Handle errors (invalid credentials or other issues)
            const errorData = await response.json();
            alert('Login failed: ' + errorData.message);
        }
    } catch (error) {
        // Handle network errors or other issues
        alert('Error: ' + error.message);
    }
});
