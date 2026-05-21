"use client";

import React, { useState } from "react";
import PneumaticTab from "./PneumaticTab";
import ZreqmTab from "./ZreqmTab";
import ZreqtTab from "./ZreqtTab";
import AccessoriesTab from "./AccessoriesTab";

export default function MasterPriceDataPage() {
  const [activeTab, setActiveTab] = useState("Pneumatic");

  const tabs = ["Pneumatic", "ZREQM", "ZREQT", "Accessories"];

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Master Price Data</h1>
        <p className="text-sm text-gray-500 mt-1">Manage pricing and configurations for all product categories</p>
      </div>

      <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-xl w-max mb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-black/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "Pneumatic" && <PneumaticTab />}
        {activeTab === "ZREQM" && <ZreqmTab />}
        {activeTab === "ZREQT" && <ZreqtTab />}
        {activeTab === "Accessories" && <AccessoriesTab />}
      </div>
    </div>
  );
}