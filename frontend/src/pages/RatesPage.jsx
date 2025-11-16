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
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Exchange Rates</h1>
          <p className="text-sm text-gray-500">Rates as of <span className="font-medium">{date || "—"}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" onChange={onDateChange}
             className="border rounded px-3 py-2"/>
          <button onClick={() => fetchRates()} className="bg-sky-600 text-white px-4 py-2 rounded">Latest</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-pulse">Loading...</div>
        </div>
      ) : null}

      <div ref={listRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rates.slice(0, visibleCount).map(r => (
          <div key={r.currency} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500">Currency</div>
                <div className="text-lg font-bold">{r.currency}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Rate</div>
                <div className="text-xl font-semibold">{Number(r.rate).toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">{r.name}</div>
          </div>
        ))}
      </div>

      {visibleCount < rates.length && (
        <div className="text-center mt-6">
          <button onClick={() => setVisibleCount(v => Math.min(rates.length, v + PAGE_SIZE))}
            className="px-4 py-2 border rounded">Load more</button>
        </div>
      )}

      {rates.length === 0 && !loading && <div className="text-center text-gray-500 py-8">No rates found.</div>}
    </div>
  );
}
