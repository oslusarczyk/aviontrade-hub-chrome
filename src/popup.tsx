import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useAuth,
} from "@clerk/chrome-extension";
import { useEffect } from "react";
import { useStorage } from "@plasmohq/storage/hook"
const PUBLISHABLE_KEY =
  process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_PLACEHOLDER";
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST;
const POPUP_URL = chrome.runtime.getURL("popup.html");



function PopupContent() {
  const { isSignedIn } = useAuth();

  const [players, setPlayers] = useStorage("players");

  function deletePlayer(id: number) {
    const newPlayers = players.filter((player: any) => player.id !== id);
    setPlayers(newPlayers);
  }

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "SYNC_TOKEN" });
  }, [isSignedIn]);

  return (
    // <div className="bg-gray-900 text-blue">
    //   <h1 className="text-2xl font-bold">AvionTrade Hssub</h1>
    // </div>
    <div
      style={{
        width: 400,
        height: 600,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "oklch(20.5% 0 0)",
        color: "#fff",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div style={{ padding: "8px 10px" }}>
        <SignedOut>
          <p style={{ margin: 0 }}>Log in to continue</p>
          <SignIn routing="virtual" />
        </SignedOut>
        <SignedIn>
          <UserButton />
          <div
            style={{
              flex: 1,
              padding: "8px",
            }}
          >
            {players && players.length > 0 ? (
              players.map((player) => (
                <div
                  key={player.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                    fontSize: "20px",
                    marginBottom: "6px",
                    backgroundColor: "oklch(37.1% 0 0) opacity(0.1)",
                    borderRadius: "4px",
                    border: "1px solid #00ff00",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span>{player.name}</span>
                      <span style={{ fontSize: "11px", backgroundColor: "oklch(72.3% 0.219 149.579) opacity(0.2)", borderRadius: "4px", padding: "4px 6px" }}>
                        {player.rating}
                      </span>
                      <span style={{ fontSize: "11px", backgroundColor: "oklch(43.9% 0 0) opacity(0.4)", borderRadius: "4px", padding: "4px 6px" }}>
                        {player.position}
                      </span>
                    </div>
                    {player.price && <div style={{ fontSize: "12px", color: "#aaa" }}>{player.price}</div>}
                  </div>
                  <button
                    onClick={(e) => {
                      deletePlayer(player.id);
                    }}
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "#ff0000",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      lineHeight: "1",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#aaa" }}>
                No players found
              </div>
            )}
          </div>
        </SignedIn>
      </div>


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
