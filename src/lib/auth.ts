// Google Identity Services wrapper
// Loads via <script src="https://accounts.google.com/gsi/client"> in index.html

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // unique Google user ID — used as shuffle seed
  credential: string; // the id_token JWT
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: { theme?: string; size?: string; width?: number; text?: string }
          ) => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

function decodeJwt(token: string): Record<string, string> {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}

export function initGoogleSignIn(
  clientId: string,
  onSuccess: (user: GoogleUser) => void
): void {
  const google = window.google;
  if (!google) {
    console.error('Google Identity Services not loaded');
    return;
  }

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      const payload = decodeJwt(response.credential);
      onSuccess({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
        credential: response.credential,
      });
    },
  });
}

export function renderGoogleButton(element: HTMLElement): void {
  const google = window.google;
  if (!google) return;

  // Re-initialize is safe — GIS handles deduplication
  google.accounts.id.renderButton(element, {
    theme: 'outline',
    size: 'large',
    width: 300,
    text: 'signin_with',
  });
}

export function signOut(email: string): void {
  window.google?.accounts.id.revoke(email, () => {});
}
