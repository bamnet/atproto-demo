import './style.css'

import {BrowserOAuthClient} from '@atproto/oauth-client-browser'

const oauthClient = await OAuthClientFactory();

// OAuthClientFactory is a returns an OAuthClient
// depending on the environment your application is running in.
//
// You could hardcode this information and use comments to swap between
// the two, but this is a more flexible way to handle it.
async function OAuthClientFactory() {
  // In development, return a client that uses the local server.
  if (import.meta.env.MODE === 'development') {
    return new BrowserOAuthClient({
      handleResolver: 'https://bsky.social',
      // If the current origin is an address like 127.0.0.1
      // we can trigger a special loopback flow.
      clientMetadata: undefined,
    });
  }
  
  // In production, return a client that actually
  // exposes client_metadata.json
  return await BrowserOAuthClient.load({
    clientId: '<YOUR PRODUCTION URL HERE>',
    handleResolver: 'https://bsky.social/',
  });
}

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

