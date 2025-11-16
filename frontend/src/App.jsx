import React from "react";
import RatesPage from "./pages/RatesPage";

export default function App(){
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "black" }}>
      <h1 style={{ marginBottom: 20, color: "white" }}>Yet Another Forex — Rates</h1>
      <RatesPage />
    </div>
  );
}
