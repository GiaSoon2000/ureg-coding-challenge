// frontend/src/pages/RatesPage.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "../api";

const PAGE_SIZE = 12;

export default function RatesPage(){
  const [rates, setRates] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const listRef = useRef(null);

  const fetchRates = async (d) => {
    setLoading(true);
    try {
      const params = d ? { params: { date: d } } : {};
      const res = await API.get("/rates", params);
      setRates(res.data.rates || []);
      setDate(res.data.date || "");
      setVisibleCount(PAGE_SIZE);
    } catch (err) {
      console.error(err);
      alert("Error fetching rates. See console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // lazy-load on scroll
  useEffect(() => {
    const handler = () => {
      if (!listRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      // if near bottom
      if (scrollTop + clientHeight >= scrollHeight - 80) {
        setVisibleCount((v) => Math.min(rates.length, v + PAGE_SIZE));
      }
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [rates]);

  const onDateChange = (e) => {
    const v = e.target.value;
    if (!v) return;
    fetchRates(v);
  };

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="max-w-full px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-800">Exchange Rates</h1>
            <p className="text-sm text-gray-600 mt-1">Rates as of <span className="font-semibold text-gray-800">{date || "—"}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              onChange={onDateChange}
              className="border border-gray-400 rounded px-4 py-2 text-sm text-gray-800 bg-white"
              style={{colorScheme: 'light'}}
            />
            <button 
              onClick={() => fetchRates()} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium transition whitespace-nowrap"
            >
              Latest
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse text-gray-600">Loading rates...</div>
          </div>
        ) : null}

        <div ref={listRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {rates.slice(0, visibleCount).map(r => (
            <div key={r.currency} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Currency</div>
              <div className="text-3xl font-bold text-gray-800 mb-3">{r.currency}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Rate</div>
              <div className="text-2xl font-bold text-gray-800 mb-3">{Number(r.rate).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})}</div>
              <div className="text-xs text-gray-600">{r.name}</div>
            </div>
          ))}
        </div>

        {visibleCount < rates.length && (
          <div className="text-center mt-8">
            <button 
              onClick={() => setVisibleCount(v => Math.min(rates.length, v + PAGE_SIZE))}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Load more
            </button>
          </div>
        )}

        {rates.length === 0 && !loading && <div className="text-center text-gray-600 py-12 text-sm">No rates found.</div>}
      </div>
    </div>
  );
}
