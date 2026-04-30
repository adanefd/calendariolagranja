import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const IOS_CLIENT_ID = '1061514040546-si13poio637c6f67j76lka0uqjhchr9h.apps.googleusercontent.com';

// Google OAuth endpoints
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

// The redirect URI for iOS is the REVERSED client ID — Google allows this automatically
// for iOS-type credentials. No need to register it in Google Cloud Console.
const REVERSED_CLIENT_ID = 'com.googleusercontent.apps.1061514040546-si13poio637c6f67j76lka0uqjhchr9h';

export const useGoogleAuth = () => {
  const redirectUri = `${REVERSED_CLIENT_ID}:/oauthredirect`;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: IOS_CLIENT_ID,
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false,
    },
    discovery
  );

  return { request, response, promptAsync, redirectUri };
};

export async function createGoogleCalendarEvent(accessToken: string, eventData: {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
}) {
  const event = {
    summary: eventData.title,
    description: eventData.description,
    start: {
      date: eventData.date,
      timeZone: 'UTC',
    },
    end: {
      date: eventData.date,
      timeZone: 'UTC',
    },
  };

  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    const data = await response.json();
    if (data.id) {
      return data.id;
    }
    console.error('Google Calendar Error:', data);
    return null;
  } catch (error) {
    console.error('Fetch Error:', error);
    return null;
  }
}
