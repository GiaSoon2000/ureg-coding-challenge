import React from "react";
import RatesPage from "./pages/RatesPage";

export default function App(){
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 style={{marginBottom:20}}>Yet Another Forex — Rates</h1>
      <RatesPage />
    </div>
  );
}
