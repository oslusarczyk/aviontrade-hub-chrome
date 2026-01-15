import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useAuth,
} from "@clerk/chrome-extension";
import { Storage } from "@plasmohq/storage";
import { useEffect } from "react";

const storage = new Storage();
const PUBLISHABLE_KEY =
  process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_PLACEHOLDER";

function TokenSync() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        try {
          // Get a JWT token (you might need a template name if configured in Clerk)
          const token = await getToken();
          if (token) {
            await storage.set("apiToken", token);
            console.log("Token synced to storage");
          }
        } catch (err) {
          console.error("Failed to sync token", err);
        }
      } else {
        await storage.remove("apiToken");
      }
    };
    syncToken();
  }, [getToken, isSignedIn]);

  return null;
}

function Index() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <div style={{ width: 400, padding: 16, fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 20, marginBottom: 16 }}>AvionTrade Hub</h1>
        <SignedIn>
          <TokenSync />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span>Account connected</span>
            <UserButton />
          </div>
          <div
            style={{
              padding: 12,
              background: "#f0fdf4",
              borderRadius: 8,
              color: "#166534",
            }}
          >
            Status: <strong>Active</strong>
          </div>
        </SignedIn>
        <SignedOut>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p>Please sign in to start tracking trades.</p>
            <SignIn />
          </div>
        </SignedOut>
      </div>
    </ClerkProvider>
  );
}

export default Index;
