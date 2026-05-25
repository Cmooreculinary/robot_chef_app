import React from "react";
import { Link } from "react-router-dom";

export const WELCOME_HERO_IMG =
  "https://customer-assets." + "emergentagent.com" + "/job_captain-culinary/artifacts/6ehkjbxr_Chris_moore_I_need_5_images_of_this_half_robot_afting_like_he_was_talking_exp_a94f2ae5-a14a-42ce-90da-041eba5d89e9.png";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 cck-anim-float">
            <img
              src={WELCOME_HERO_IMG}
              alt="Captain Culinary"
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)]"
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Captain Culinary
          </h1>
          <p className="text-slate-400 text-lg max-w-sm mx-auto">
            Your kid-friendly cooking and kitchen companion. Learn culinary foundations, complete family challenges, and build your food dream!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <Link
            to="/lessons"
            className="block w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-emerald-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            Start Cooking Academy
          </Link>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/missions/global"
              className="py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl border border-slate-700/50 transition-all text-center text-sm"
            >
              🌐 Global Missions
            </Link>
            <Link
              to="/missions/family"
              className="py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl border border-slate-700/50 transition-all text-center text-sm"
            >
              🏠 Family Prompts
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 pt-8">
          Captain Culinary Kids Prototype v1.0 • Local Engine Configured
        </div>
      </div>
    </div>
  );
}