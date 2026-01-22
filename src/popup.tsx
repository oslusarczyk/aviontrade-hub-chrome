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

function PopupContent() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "SYNC_TOKEN" });
  }, [isSignedIn]);

  return (
    <div
      style={{
        width: 400,
        padding: 16,
        fontFamily: "sans-serif",
        height: 200,
      }}
    >
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <p>Log in to continue</p>
        <SignIn routing="virtual" />
      </SignedOut>
    </div>
  );
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
      <PopupContent />
    </ClerkProvider>
  );
}

export default Index;
