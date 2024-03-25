/**
 * All js functions related to authentication,
 * such as login/register/logout/see profile/forgot password
 */

const getProfile = async () => {
  try {
    // call api to get user profile
    const response = await fetch(PROFILE_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('jwtToken')
      }
    });
    const data = await response.json();
    if (response.status === 200) {
      return data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

const handleProfileClick = async () => {
  // get the user's profile data
  const data = await getProfile();

  // if user is not logged in, hide logout and change password buttons, add text gray
  if (!data) {
    const logoutButton = document.getElementById('profile-button-logout');
    logoutButton.style.display = 'none';
    const changePasswordButton = document.getElementById('profile-button-change-password');
    changePasswordButton.style.display = 'none';

    const loginButton = document.getElementById('profile-button-login');
    loginButton.style.display = 'block';
    const registerButton = document.getElementById('profile-button-register');
    registerButton.style.display = 'block';

    const profileIdSpan = document.getElementById('modal-profile-id');
    profileIdSpan.innerText = 'Not logged in';
    profileIdSpan.classList.add('text-gray');
    const profileUsernameSpan = document.getElementById('modal-profile-username');
    profileUsernameSpan.innerText = 'Not logged in';
    profileUsernameSpan.classList.add('text-gray');
  }

  // if logged in, display id and username, hide login and register buttons
  else {
    const profileIdSpan = document.getElementById('modal-profile-id');
    profileIdSpan.innerText = data.id;
    profileIdSpan.classList.remove('text-gray');
    const profileUsernameSpan = document.getElementById('modal-profile-username');
    profileUsernameSpan.innerText = data.username;
    profileUsernameSpan.classList.remove('text-gray');

    const loginButton = document.getElementById('profile-button-login');
    loginButton.style.display = 'none';
    const registerButton = document.getElementById('profile-button-register');
    registerButton.style.display = 'none';

    const changePasswordButton = document.getElementById('profile-button-change-password');
    changePasswordButton.style.display = 'block';
    const logoutButton = document.getElementById('profile-button-logout');
    logoutButton.style.display = 'block';
  }

  // open profile modal
  const profileModal = document.getElementById('modal-profile');
  profileModal.style.visibility = 'visible';
}

const closeProfileModal = () => {
  const profileModal = document.getElementById('modal-profile');
  profileModal.style.visibility = 'hidden';
}

const handleLogin = async (targetPage) => {
  try {
    // get the input values (username and password)
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const data = { username, password };
    
    // call api to login with the given data
    const response = await fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();

    // if successful, save the token to local storage and redirect to tasks page
    if (response.status === 200) {
      localStorage.setItem('jwtToken', responseData.token);
      handlePageChange(targetPage);
    } else {

      // if unsuccessful, display the error message
      const error = await responseData['error']
      const errorDiv = document.getElementById('login-error');
      errorDiv.innerText = `Error: ${error}`;
    }
  } catch (error) {
    window.alert('Something went wrong. Please try again.');
  }
}

const handleRegister = async (targetPage) => {
  try {
    // get the input values (username, email, and password)
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirmation = document.getElementById('register-password-confirm').value;
    const data = { username, password };

    // validate password and password confirmation match
    if (password !== passwordConfirmation) {
      const errorDiv = document.getElementById('register-error');
      errorDiv.innerText = 'Error: passwords do not match';
      return;
    }

    // call api to register with the given data
    const response = await fetch(REGISTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();

    // if successful, redirect to login page, else display the error message
    if (response.status === 201) {
      handlePageChange('login', targetPage);
      window.alert('Registration successful. Please log in.');
    } else {
      const error = await responseData['error']
      const errorDiv = document.getElementById('register-error');
      errorDiv.innerText = `Error: ${error}`;
    }
  }
  catch (error) {
    window.alert('Something went wrong. Please try again.');
  }
}

const handleLogout = () => {
  // close profile modal if open
  closeProfileModal();

  // remove the token from local storage and redirect to login page
  localStorage.removeItem('jwtToken');
  handlePageChange('login');
}

const handleLoginRedirect = () => {
  closeProfileModal();
  handlePageChange('login');
}

const handleRegisterRedirect = () => {
  closeProfileModal();
  handlePageChange('register');
}

const openChangePasswordModal = () => {
  // close profile modal, open change password modal
  closeProfileModal();
  const changePasswordModal = document.getElementById('modal-change-password');
  changePasswordModal.style.visibility = 'visible';
}

const closeChangePasswordModal = () => {
  const changePasswordModal = document.getElementById('modal-change-password');
  changePasswordModal.style.visibility = 'hidden';
}

const changePassword = async () => {
  // get the input values
  const currentPassword = document.getElementById('change-password-current').value;
  const newPassword = document.getElementById('change-password-new').value;
  const newPasswordConfirm = document.getElementById('change-password-confirm').value;
  const data = { current_password: currentPassword, new_password: newPassword };

  // validate new password and new password confirmation match
  if (newPassword !== newPasswordConfirm) {
    const errorDiv = document.getElementById('change-password-error');
    errorDiv.innerText = 'Error: new passwords do not match';
    return;
  }

  // call api to change password with the given data
  try {
    const response = await fetch(PROFILE_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('jwtToken')
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();

    // if successful, close change password modal, else display the error message
    if (response.status === 200) {
      closeChangePasswordModal();
    } else {
      const error = await responseData['error']
      const errorDiv = document.getElementById('change-password-error');
      errorDiv.innerText = `Error: ${error}`;
    }
  } catch (error) {
    window.alert('Something went wrong. Please try again.');
  }
}

const handleLogoClick = () => {
  // open source code (GitHub) in a new tab
  const GITHUB_LINK = 'https://github.com/michac789/TaskMaster';
  window.open(GITHUB_LINK, '_blank');
}
