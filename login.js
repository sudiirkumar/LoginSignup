document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const savedLoginPrompt = document.getElementById('saved-login-prompt');
    const useSavedAccountButton = document.getElementById('use-saved-account');
    const useOtherAccountButton = document.getElementById('use-other-account');

    // Check if login details are stored in local storage and prompt the user
    function checkSavedLogin() {
        const storedUsername = localStorage.getItem('authPanelUsername');
        const storedPassword = localStorage.getItem('authPanelPassword');

        if (storedUsername && storedPassword) {
            savedLoginPrompt.style.display = 'block';
            loginForm.style.display = 'none';
        }
    }

    // Function to handle login
    async function login() {
        const usernameOrEmail = usernameInput.value;
        const password = passwordInput.value;

    
    try {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username_or_email: usernameOrEmail,
                password: password
            })
        });
        
        const result = await response.json();
        const name = result.name;
        if (response.ok) {
            // console.log(`Response is: ${(result.name)}`);
            // alert(`Welcome back, ${name}!`);
            Swal.fire({
                icon: 'success',
                title: 'Welcome back!',
                text: `Welcome back, ${name}!`,
            })
            //wait for 2 seconds
            setTimeout(function(){
                window.location.href = 'dashboard.html';  // Redirect to dashboard
            }, 3000);
        } else {
            // alert('Invalid username or password. Please try again.');
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Invalid username or password. Please try again.',
            })
        }
    } catch (error) {
        console.error('Error:', error);
        // alert('An error occurred while trying to log in.');
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'An error occurred while trying to log in.',
        })
    }
}

    // Event listener for form submission
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;

        // Store login details in local storage if "Remember Me" is checked
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('authPanelUsername', username);
            localStorage.setItem('authPanelPassword', password);
        } else {
            // Clear stored login details if "Remember Me" is not checked
            localStorage.removeItem('authPanelUsername');
            localStorage.removeItem('authPanelPassword');
        }

        // Proceed with login logic
        login();
    });

    // Handle using saved account
    useSavedAccountButton.addEventListener('click', function() {
        const storedUsername = localStorage.getItem('authPanelUsername');
        const storedPassword = localStorage.getItem('authPanelPassword');

        if (storedUsername && storedPassword) {
            usernameInput.value = storedUsername;
            passwordInput.value = storedPassword;
            login();
        } else {
            // alert('No saved login details found.');
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No saved login details found.',
            })
            
        }
    });

    // Handle using another account
    useOtherAccountButton.addEventListener('click', function() {
        localStorage.removeItem('authPanelUsername');
        localStorage.removeItem('authPanelPassword');
        savedLoginPrompt.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Check if there are stored login details on page load
    checkSavedLogin();
});