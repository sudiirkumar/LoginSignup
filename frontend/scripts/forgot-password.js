// forgot-password.js
let username;

const passwordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordMatchError = document.getElementById('password-match-error');

const digitLabel = document.getElementById('digit');
const lowercaseLabel = document.getElementById('lowercase');
const uppercaseLabel = document.getElementById('uppercase');
const specialLabel = document.getElementById('special');
const lengthLabel = document.getElementById('length');
const passwordCriteria = document.getElementById('password-criteria');

document.getElementById('verifyButton').addEventListener('click', async function() {
    const emailOrUsername = document.getElementById('emailOrUsername').value;
    const securityQuestion = document.getElementById('securityQuestion').value;
    const securityAnswer = document.getElementById('securityAnswer').value;

    try {
        const response = await fetch('http://127.0.0.1:5000/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username_or_email: emailOrUsername,
                security_question: securityQuestion,
                security_answer: securityAnswer
            })
        });
        
        const result = await response.json();
        username = result.username;
        if (response.ok) {
            document.getElementById('verification-section').style.display = 'none'; // Hide verification fields
            document.getElementById('new-password-section').style.display = 'block'; // Show new password fields
            document.getElementById('userNameLabel').innerText = `Welcome, ${username}!`; // Display user name
        } else {
            // alert('Incorrect credentials!');
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Incorrect credentials!',
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
});

passwordInput.addEventListener('input', function() {
    const value = passwordInput.value;
    passwordCriteria.style.display = 'block';
    lengthLabel.style.color = value.length>=8?"green":"grey";
    digitLabel.style.color = /\d/.test(value)?"green":"grey";
    lowercaseLabel.style.color = /[a-z]/.test(value)?"green":"grey";
    uppercaseLabel.style.color = /[A-Z]/.test(value)?"green":"grey";
    specialLabel.style.color = /[!@#$%^&*(),.?":{}|<>]/.test(value)?"green":"grey";
});

confirmPasswordInput.addEventListener('input', function() {
    passwordCriteria.style.display = 'none';
    if (passwordInput.value !== confirmPasswordInput.value) {
        passwordMatchError.style.display = 'block';
    } else {
        passwordMatchError.style.display = 'none';
    }
});

document.getElementById('forgot-password-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    var validPassword = (/[0-9a-zA-Z!@#$%^&*(),.?":{}|<>]/.test(newPassword)) && (newPassword.length>=8);
    // Validate the new password
    if(!validPassword){
        // alert("Password criteria does not match");
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Password criteria does not match',
        })
        return;
    }
    if (newPassword && confirmPassword) {
        if (newPassword === confirmPassword) {
            try {
                const response = await fetch('http://127.0.0.1:5000/reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        password: newPassword,
                        username: username
                    })
                });
                
                if (response.ok) {
                    // alert('Password has been changed successfully!'); 
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Password has been changed successfully!',
                    })
                    setTimeout(function(){
                        window.location.href = 'login.html';  // Redirect to dashboard
                    }, 3000);
                } else {
                    // alert('Error occurred while trying to reset password.');
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Error occurred while trying to reset password.',
                    })
                }
            } catch (error) {
                console.error('Error:', error);
                // alert('An error occurred while trying to reset password.');
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'An error occurred while trying to reset password.',
                })
            }
        } else {
            // alert('New passwords do not match. Please try again.');
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'New passwords do not match. Please try again.',
            })
        }
    } else {
        // alert('Please fill in all fields correctly.');
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill in all fields correctly.',
        })
    }
});