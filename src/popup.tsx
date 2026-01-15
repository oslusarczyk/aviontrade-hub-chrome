import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useAuth, // Import this hook
} from "@clerk/chrome-extension";
import { Storage } from "@plasmohq/storage";
import { useEffect } from "react";

const storage = new Storage();
const PUBLISHABLE_KEY =
  process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_PLACEHOLDER";
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST;
const POPUP_URL = chrome.runtime.getURL("popup.html"); // Clean URL

// 1. Restore this helper component
function TokenSync() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        try {
          // Fetch the JWT from Clerk
          const token = await getToken();
          if (token) {
            // Save it to Chrome Storage so background.ts can use it
            await storage.set("apiToken", token);
            console.log("Token synced to storage:", token);
          }
        } catch (err) {
          console.error("Failed to sync token", err);
        }
      } else {
        // Clear token on logout
        await storage.remove("apiToken");
      }
    };
    syncToken();
  }, [getToken, isSignedIn]);

  return null; // This component renders nothing visible
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
          {/* 2. Add the component here so it runs when logged in */}
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
