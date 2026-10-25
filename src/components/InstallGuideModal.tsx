import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ShieldAlert,
  FolderOpen,
  Settings,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

interface InstallGuideModalProps {
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showTroubleshooting, setShowTroubleshooting] = useState<boolean>(false);

  const steps = [
    {
      step: 1,
      title: '1. Download APK to Android Storage',
      desc: 'Tap "Download APK" on any verified FireChat release. Your browser will prompt you to save the .apk file into your device\'s /Download/ directory.',
      icon: Smartphone,
      detail: 'If your browser asks "File might be harmful", tap "Download anyway". This is a standard Android notice for all applications downloaded outside the Google Play Store.',
    },
    {
      step: 2,
      title: '2. Allow "Install Unknown Apps"',
      desc: 'Modern Android (Android 8.0 through Android 14+) requires per-app permission before an installer can launch.',
      icon: Settings,
      detail: 'When you tap the downloaded file, Android may display: "For your security, your phone is currently not allowed to install unknown apps from this source." Tap "Settings", then toggle ON "Allow from this source".',
    },
    {
      step: 3,
      title: '3. Launch Official Package Installer',
      desc: 'Android\'s native Package Installer dialog will appear showing the application name, icon, and requested permissions.',
      icon: FolderOpen,
      detail: 'Tap "Install". Android never installs APK files silently; the system requires explicit user confirmation before proceeding with bytecode verification and sandbox allocation.',
    },
    {
      step: 4,
      title: '4. Android Play Protect Scan',
      desc: 'Google Play Protect or your device manufacturer\'s security suite may review the binary.',
      icon: ShieldAlert,
      detail: 'If a "Unrecognized app" dialog appears, tap "More details" -> "Install anyway". You can cross-reference the published SHA-256 checksum to guarantee the binary hasn\'t been altered.',
    },
    {
      step: 5,
      title: '5. Open & Grant Off-Grid Permissions',
      desc: 'Once installed, tap "Open". FireChat will request local Bluetooth and Wi-Fi Direct permissions.',
      icon: CheckCircle2,
      detail: 'These permissions allow peer-to-peer mesh networking without an active internet connection. Grant permissions as prompted.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0e1422] border border-white/10 shadow-2xl p-6 sm:p-7 text-slate-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
            <Smartphone className="w-4 h-4" />
            <span>Official Android Installation Flow</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            How to Install APK Files on Android
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Follow Google Android&apos;s standard package installation procedure for sideloading official releases.
          </p>
        </div>

        {/* Security Advisory Warning */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 mb-6 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Security Notice: </span>
            Never install unknown APKs from untrusted sources. Always verify that the SHA-256 hash displayed in FireChat matches your downloaded file before granting installation privileges.
          </div>
        </div>

        {/* Step Selector / Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-6 overflow-x-auto">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate ${
                activeStep === s.step
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Step {s.step}
            </button>
          ))}
        </div>

        {/* Active Step Content */}
        {(() => {
          const current = steps[activeStep - 1];
          const Icon = current.icon;
          return (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{current.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{current.desc}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.04] text-xs text-slate-300 leading-relaxed">
                {current.detail}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04] text-xs">
                <button
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Previous Step
                </button>

                {activeStep < steps.length ? (
                  <button
                    onClick={() => setActiveStep((p) => Math.min(steps.length, p + 1))}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 text-xs font-bold cursor-pointer"
                  >
                    <span>Next: Step {activeStep + 1}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready to install!</span>
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        {/* Troubleshooting Accordion */}
        <div className="border-t border-white/[0.08] pt-4">
          <button
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white cursor-pointer py-1"
          >
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-orange-400" />
              <span>Troubleshooting: Common Installation Errors</span>
            </div>
            <span className="text-xs text-slate-400">
              {showTroubleshooting ? 'Hide' : 'Show details'}
            </span>
          </button>

          {showTroubleshooting && (
            <div className="mt-3 space-y-2.5 text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                <div className="font-bold text-slate-200">Error: &quot;App not installed&quot;</div>
                <div className="mt-1 text-slate-400 leading-relaxed">
                  Usually occurs if an older version with a conflicting signature is already installed. Uninstall the previous version first, or ensure device storage has at least 150 MB free.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                <div className="font-bold text-slate-200">Error: &quot;There was a problem parsing the package&quot;</div>
                <div className="mt-1 text-slate-400 leading-relaxed">
                  The APK file was either partially downloaded due to network interruption, or your Android OS version is below the app&apos;s minimum SDK (e.g. Android 8.0+). Delete the file and re-download.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                <div className="font-bold text-slate-200">Google Play Protect Blocked</div>
                <div className="mt-1 text-slate-400 leading-relaxed">
                  Because FireChat is distributed directly as an APK outside Google Play, Play Protect may prompt an advisory. Tap &quot;More details&quot; &rarr; &quot;Install anyway&quot; to proceed.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Done Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
