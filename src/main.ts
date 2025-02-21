import './style.css'

import {BrowserOAuthClient} from '@atproto/oauth-client-browser'
import {Agent} from '@atproto/api';

// Manually construct a Client ID for local development.
const CLIENT_ID = 
  // Special loopback behavior is only trigged for localhost.
  'http://localhost' +  
  // Include any scopes necessary for your application.
  // atproto and transition:generic cover the bacics.
  '?scope=atproto%20transition:generic' +
  // Include the redirect URI to bring users back to your applicaion.
  '&redirect_uri=' + window.origin;

const oauthClient = await BrowserOAuthClient.load({
  clientId: CLIENT_ID,
  handleResolver: 'https://bsky.social/',
});

async function initBluesky() {
  // Initialize the OAuth client.
  //
  // This will check if the user is already signed in and if so,
  // return a session.
  const result = await oauthClient.init();

  if (result) {
    // The user is signed in, show the logout button.
    showLogout();

    if ('state' in result) {
      console.log('The user was just redirected back from the authorization page');
    }
  
    console.log(`The user is currently signed in as ${result.session.did}`);
  } else {
    console.log('The user is not signed in.');
  }
  
  const session = result?.session;

  if (!session) {
    // The user is not signed in, show the login form.
    showLogin();
    return;
  }

  // The user is signed in.
  infoBox.innerText = `You are signed in as ${session.did}`;

  const agent = new Agent(session);
  showProfile(agent);
}

async function showProfile(agent: Agent) {
  const profile = await agent.getProfile({ actor: agent.did! });
  infoBox.innerHTML = `
    You are signed in as ${profile.data.displayName}.
    <br>
    <img width="50" src="${profile.data.avatar}" alt="Profile picture">
    `;
  console.log(profile.data);
}

// Start to login a user.
async function login() {
  const handle = (<HTMLInputElement>document.getElementById('handle')!).value;

  // Build the URL to the authorization page.
  const url = await oauthClient.authorize(handle);
  
  // Redirect the user to the authorization page.
  window.open(url, '_self', 'noopener');
}


const loginForm = document.getElementById('loginForm')!;
const loginBtn = document.getElementById('login')!;
const logoutBtn = document.getElementById('logout')!;
const infoBox = document.getElementById('info')!;

logoutBtn.addEventListener('click', async () => {
  await oauthClient.init()?.then((a) => a?.session.signOut());
  loginForm.style.display = '';
  logoutBtn.style.display = 'none';
  document.getElementById('info')!.innerText = '';
});

loginBtn!.addEventListener('click', login);

document.addEventListener('DOMContentLoaded', initBluesky);

function showLogout() {
  document.getElementById('logout')!.style.display = '';
}

function showLogin() {
  loginForm.style.display = '';
}

