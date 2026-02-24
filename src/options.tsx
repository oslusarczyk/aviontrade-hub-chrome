import { useStorage } from "@plasmohq/storage/hook";
import { useState, useEffect } from "react";
import "./style.css"

interface Settings {
    sendAlert: boolean;
    pricePercentage: number;
    autoClickList: boolean;
    listKey: string;
}

const defaultSettings: Settings = {
    sendAlert: false,
    pricePercentage: 20,
    autoClickList: false,
    listKey: "l"
};

function Index() {
    const [settings, setSettings] = useStorage<Settings>("settings", defaultSettings);

    const [pricePercentage, setPricePercentage] = useState<string>(
        settings?.pricePercentage?.toString() || "20"
    );
    const [listKey, setListKey] = useState<string>(
        settings?.listKey || "l"
    );

    useEffect(() => {
        if (settings) {
            setPricePercentage(settings.pricePercentage?.toString() || "20");
            setListKey(settings.listKey || "l");
        }
    }, [settings]);

    const updateSettings = (updates: Partial<Settings>) => {
        const newSettings = { ...(settings || defaultSettings), ...updates };
        setSettings(newSettings);
    };

    const handlePricePercentageChange = (value: string) => {
        setPricePercentage(value);
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
            updateSettings({ pricePercentage: numValue });
        }
    };

    const handleListKeyChange = (value: string) => {
        setListKey(value);
        updateSettings({ listKey: value.toLowerCase() });
    };

    return (
        <div className="w-full min-h-screen flex flex-col bg-neutral-900 text-white overflow-hidden">
            <div className="p-4 border-b border-neutral-700/50 flex-shrink-0">
                <h1 className="text-2xl font-semibold text-neutral-200">Settings</h1>
                <p className="text-sm text-neutral-400 mt-1">Manage your extension preferences</p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-4">
                    {/* Send Alerts Setting */}
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
                                    checked={settings?.sendAlert ?? false}
                                    onChange={(e) => updateSettings({ sendAlert: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>
                    <div className="bg-neutral-700/30 rounded-lg border border-emerald-500/50 hover:border-emerald-500/70 transition-colors p-4">
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-200 mb-1">
                                Price Percentage
                            </h3>
                            <p className="text-xs text-neutral-400 mb-3">
                                Percentage added to price (0% to 50%)
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="1"
                                    value={pricePercentage}
                                    onChange={(e) => handlePricePercentageChange(e.target.value)}
                                    className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                                />
                                <span className="text-sm text-neutral-400">%</span>
                                {settings?.pricePercentage !== undefined && (
                                    <span className="text-xs text-neutral-500">
                                        Current: {settings.pricePercentage}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-700/30 rounded-lg border border-emerald-500/50 hover:border-emerald-500/70 transition-colors p-4">
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-200 mb-1">
                                List Key
                            </h3>
                            <p className="text-xs text-neutral-400 mb-3">
                                Keyboard key to automatically set values
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    maxLength={1}
                                    value={listKey}
                                    onChange={(e) => handleListKeyChange(e.target.value)}
                                    className="w-20 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-neutral-200 text-center uppercase focus:outline-none focus:border-emerald-500/50"
                                    placeholder="l"
                                />
                                <span className="text-xs text-neutral-500">
                                    Press "{settings?.listKey || "l"}" to list
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Auto Click List Setting */}
                    <div className="bg-neutral-700/30 rounded-lg border border-emerald-500/50 hover:border-emerald-500/70 transition-colors p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-neutral-200 mb-1">
                                    Auto click
                                </h3>
                                <p className="text-xs text-neutral-400">
                                    Automatically click the list button after setting values
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-4">
                                <input
                                    type="checkbox"
                                    checked={settings?.autoClickList ?? false}
                                    onChange={(e) => updateSettings({ autoClickList: e.target.checked })}
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