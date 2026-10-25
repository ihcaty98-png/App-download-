import React from 'react';
import { Send, Music2, ExternalLink, Radio, Sparkles } from 'lucide-react';

interface CeoChannelsBannerProps {
  compact?: boolean;
}

export const CeoChannelsBanner: React.FC<CeoChannelsBannerProps> = ({ compact = false }) => {
  const tgLink = 'https://t.me/+_aoEtf998dM1MjZl';
  const tiktokLink = 'https://www.tiktok.com/@firechat_app';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={tgLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#40B3E8] border border-[#229ED9]/30 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>TG Channel</span>
        </a>

        <a
          href={tiktokLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 transition-all cursor-pointer"
        >
          <Music2 className="w-3.5 h-3.5 text-rose-400" />
          <span>TikTok</span>
        </a>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-[#131b2e] via-[#161f36] to-[#1c1626] border border-orange-500/25 p-5 sm:p-6 mb-8 shadow-xl shadow-orange-500/5 overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1.5">
            <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>Official Community &amp; Direct CEO Broadcasts</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            CEO Join Channel
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Connect directly with the CEO and core engineering team. Get instant notifications for new beta APK builds, mesh network field reports, and security updates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          {/* Telegram Channel Button */}
          <a
            href={tgLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white text-xs font-bold shadow-lg shadow-[#229ED9]/25 hover:shadow-[#229ED9]/40 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <div className="text-left">
              <div className="leading-none">📢 Join TG Channel</div>
              <div className="text-[10px] opacity-80 font-normal mt-0.5">Telegram Broadcast</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-1" />
          </a>

          {/* TikTok Channel Button */}
          <a
            href={tiktokLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold border border-white/15 hover:border-white/30 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            <Music2 className="w-4 h-4 text-[#ff0050]" />
            <div className="text-left">
              <div className="leading-none">🎵 Join TikTok</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">@firechat_app</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};
