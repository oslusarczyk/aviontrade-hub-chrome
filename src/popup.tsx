import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useAuth,
} from "@clerk/chrome-extension";
import { useEffect } from "react";

const PUBLISHABLE_KEY =
  process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_PLACEHOLDER";
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST;
const POPUP_URL = chrome.runtime.getURL("popup.html");

 function TokenSync() {
  const { getToken, isSignedIn } = useAuth();
  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            await chrome.storage.local.set({ apiToken: token });
          }
        } catch (err) {
          console.error("Failed to sync token", err);
        }
      } else {
        await chrome.storage.local.remove("apiToken");
      }
    };
    syncToken();
  }, [isSignedIn]);

  return null;
}

function Index() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl={POPUP_URL}
      signInFallbackRedirectUrl={POPUP_URL}
      signUpFallbackRedirectUrl={POPUP_URL}
      syncHost={SYNC_HOST}
    >
      <div
        style={{
          width: 400,
          padding: 16,
          fontFamily: "sans-serif",
          height: 600,
        }}
      >
        <SignedIn>
          <TokenSync />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <p>Loginnnn!</p>
          <SignIn routing="virtual" />
        </SignedOut>
      </div>
    </ClerkProvider>
  );
}

export default Index;
