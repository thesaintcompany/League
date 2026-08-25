"use client";

import React from "react";

export function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
      className="btn btn-primary bg-primary text-white hover:bg-slate-800 text-xs font-label font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
    >
      <span className="material-symbols-outlined text-[18px]">print</span>
      Descarcă / Imprimă Raport PDF
    </button>
  );
}
