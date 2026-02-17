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

import "./style.css"

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
    <div className="w-[400px] h-[300px] flex flex-col bg-neutral-900 text-white overflow-hidden">
      <div className="p-2 border-b border-neutral-700/50 flex-shrink-0">
        <SignedOut>
          <p className="m-0 text-sm text-neutral-400">Log in to continue</p>
          <SignIn routing="virtual" />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <div
        className={`flex-1 p-2 ${players && players.length > 3 ? "overflow-y-auto" : "overflow-visible"}`}
      >
        <SignedIn>
          {players && players.length > 0 ? (
            players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 mb-1.5 bg-neutral-700/30 rounded-lg border border-emerald-500/50 hover:border-emerald-500/70 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-neutral-200 truncate">
                      {player.name || "Unknown"}
                    </span>
                    {player.rating && (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500/30 shrink-0">
                        {player.rating}
                      </span>
                    )}
                    {player.position && (
                      <span className="px-1.5 py-0.5 bg-neutral-600/50 text-neutral-300 text-xs font-medium rounded border border-neutral-600/50 shrink-0">
                        {player.position}
                      </span>
                    )}
                  </div>
                  {player.price && (
                    <div className="text-xs text-neutral-400">{player.price}</div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlayer(player.id);
                  }}
                  className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white border-none cursor-pointer text-base leading-none flex items-center justify-center rounded transition-colors ml-3 flex-shrink-0"
                  title="Delete player"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="py-10 px-5 text-center text-neutral-400">
              No players found
            </div>
          )}
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
