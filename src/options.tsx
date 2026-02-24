import { useStorage } from "@plasmohq/storage/hook";
import "./style.css"

function Index() {
    const [sendAlert, setSendAlert] = useStorage("sendAlert", false);

    return (
        <div className="w-full min-h-screen flex flex-col bg-neutral-900 text-white overflow-hidden">
            <div className="p-4 border-b border-neutral-700/50 flex-shrink-0">
                <h1 className="text-2xl font-semibold text-neutral-200">Settings</h1>
                <p className="text-sm text-neutral-400 mt-1">Manage your extension preferences</p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="bg-neutral-700/30 rounded-lg border border-emerald-500/50 hover:border-emerald-500/70 transition-colors p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-neutral-200 mb-1">
                                    Send alerts
                                </h3>
                                <p className="text-xs text-neutral-400">
                                    Enable alerts for important notifications
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-4">
                                <input
                                    type="checkbox"
                                    checked={sendAlert}
                                    onChange={() => setSendAlert(!sendAlert)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Index;