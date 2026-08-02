type FacebookLoginStatus = "connected" | "not_authorized" | "unknown";

type FacebookLoginStatusResponse = {
  status: FacebookLoginStatus;
};

type FacebookSdk = {
  getLoginStatus: (
    callback: (response: FacebookLoginStatusResponse) => void,
  ) => void;
  logout: (callback?: () => void) => void;
};

function getFacebookSdk(): FacebookSdk | null {
  if (typeof window === "undefined") {
    return null;
  }

  const facebookSdk = (window as Window & { FB?: FacebookSdk }).FB;
  return facebookSdk ?? null;
}

/**
 * Clears the Facebook JS SDK client session when present.
 * Does not touch the app JWT or any saved integration.
 */
export async function logoutFacebookSdkSession(): Promise<void> {
  const facebookSdk = getFacebookSdk();

  if (facebookSdk == null) {
    return;
  }

  await new Promise<void>((resolve) => {
    try {
      facebookSdk.getLoginStatus((response) => {
        if (response.status === "connected") {
          facebookSdk.logout(() => resolve());
          return;
        }

        resolve();
      });
    } catch {
      resolve();
    }
  });
}
