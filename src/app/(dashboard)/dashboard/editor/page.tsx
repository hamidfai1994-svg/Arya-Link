'use client';

import React, { useState } from 'react';
import { ProfileEditor } from '@/components/profile-builder/ProfileEditor/ProfileEditor';
import { LivePreview } from '@/components/profile-builder/LivePreview/LivePreview';
import { Smartphone, X } from 'lucide-react';

export default function ProfileBuilderPage() {
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-950 overflow-hidden relative">
      {/* Left Column: Profile Controls & Form Editor (Full width on mobile, split on desktop) */}
      <div className="w-full lg:w-1/2 xl:w-7/12 h-full overflow-hidden border-b lg:border-b-0 lg:border-l border-slate-800">
        <ProfileEditor />
      </div>

      {/* Right Column: Real-time Live Phone Simulator (Hidden on mobile, split on desktop) */}
      <div className="w-full lg:w-1/2 xl:w-5/12 h-full overflow-hidden hidden lg:block">
        <LivePreview />
      </div>

      {/* Mobile Floating Action Button (FAB) for preview */}
      <button
        type="button"
        onClick={() => setIsMobilePreviewOpen(true)}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-2xl shadow-cyan-500/50 flex items-center gap-2 border border-white/20 active:scale-95 transition-all hover:brightness-110"
        title="مشاهده پیش‌نمایش کارت"
      >
        <Smartphone className="w-4 h-4" />
        <span>پیش‌نمایش کارت</span>
      </button>

      {/* Mobile Fullscreen Live Preview Modal */}
      {isMobilePreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col lg:hidden animate-in fade-in duration-200"
          dir="rtl"
        >
          {/* Mobile Preview Header */}
          <div className="p-3 px-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>پیش‌نمایش کارت هوشمند</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobilePreviewOpen(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>بستن</span>
            </button>
          </div>

          {/* Simulator Content Area */}
          <div className="flex-1 overflow-y-auto py-2 flex items-center justify-center">
            <div className="scale-[0.82] sm:scale-100 origin-center">
              <LivePreview />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
