import { useState, useEffect } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
};

const PRESET_GRADIENTS = [
  { name: "Purple Dream", value: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" },
  { name: "Ocean Blue", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Lavender", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { name: "Peach", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { name: "Dark Purple", value: "linear-gradient(135deg, #434343 0%, #000000 100%)" },
  { name: "Pink Rose", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }
];

export const SettingsModal = ({
  isOpen,
  onClose,
  backgroundColor,
  onBackgroundColorChange
}: Props) => {
  const workDuration = usePomodoroStore((s) => s.workDuration);
  const shortBreakDuration = usePomodoroStore((s) => s.shortBreakDuration);
  const longBreakDuration = usePomodoroStore((s) => s.longBreakDuration);
  const setDurations = usePomodoroStore((s) => s.setDurations);

  const [customColor, setCustomColor] = useState(backgroundColor);
  const [pomodoroMinutes, setPomodoroMinutes] = useState<string | number>(Math.floor(workDuration / 60));
  const [shortBreakMinutes, setShortBreakMinutes] = useState<string | number>(Math.floor(shortBreakDuration / 60));
  const [longBreakMinutes, setLongBreakMinutes] = useState<string | number>(Math.floor(longBreakDuration / 60));

  useEffect(() => {
    setCustomColor(backgroundColor);
  }, [backgroundColor]);

  useEffect(() => {
    if (isOpen) {
      setPomodoroMinutes(Math.floor(workDuration / 60));
      setShortBreakMinutes(Math.floor(shortBreakDuration / 60));
      setLongBreakMinutes(Math.floor(longBreakDuration / 60));
    }
  }, [workDuration, shortBreakDuration, longBreakDuration, isOpen]);

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    onBackgroundColorChange(color);
  };

  const handleDurationChange = () => {
    const pomodoro = typeof pomodoroMinutes === 'number' ? pomodoroMinutes : parseInt(String(pomodoroMinutes), 10) || 25;
    const shortBreak = typeof shortBreakMinutes === 'number' ? shortBreakMinutes : parseInt(String(shortBreakMinutes), 10) || 5;
    const longBreak = typeof longBreakMinutes === 'number' ? longBreakMinutes : parseInt(String(longBreakMinutes), 10) || 15;
    setDurations(pomodoro, shortBreak, longBreak);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-black/30 backdrop-blur-md p-8 shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Timer Durations Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Timer Settings</h3>
            
            <div className="space-y-4">
              {/* Pomodoro Duration */}
              <div>
                <label className="block text-sm text-white/70 mb-2">Pomodoro (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={pomodoroMinutes}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === "") {
                      setPomodoroMinutes("");
                      return;
                    }
                    const value = parseInt(inputValue, 10);
                    if (!isNaN(value)) {
                      const clampedValue = Math.max(1, Math.min(60, value));
                      setPomodoroMinutes(clampedValue);
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (isNaN(value) || value < 1) {
                      setPomodoroMinutes(25);
                    } else {
                      setPomodoroMinutes(value);
                    }
                    handleDurationChange();
                  }}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-white placeholder-white/50 outline-none focus:border-white/40"
                />
              </div>

              {/* Short Break Duration */}
              <div>
                <label className="block text-sm text-white/70 mb-2">Short Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={shortBreakMinutes}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === "") {
                      setShortBreakMinutes("");
                      return;
                    }
                    const value = parseInt(inputValue, 10);
                    if (!isNaN(value)) {
                      const clampedValue = Math.max(1, Math.min(60, value));
                      setShortBreakMinutes(clampedValue);
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (isNaN(value) || value < 1) {
                      setShortBreakMinutes(5);
                    } else {
                      setShortBreakMinutes(value);
                    }
                    handleDurationChange();
                  }}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-white placeholder-white/50 outline-none focus:border-white/40"
                />
              </div>

              {/* Long Break Duration */}
              <div>
                <label className="block text-sm text-white/70 mb-2">Long Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={longBreakMinutes}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === "") {
                      setLongBreakMinutes("");
                      return;
                    }
                    const value = parseInt(inputValue, 10);
                    if (!isNaN(value)) {
                      const clampedValue = Math.max(1, Math.min(60, value));
                      setLongBreakMinutes(clampedValue);
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (isNaN(value) || value < 1) {
                      setLongBreakMinutes(15);
                    } else {
                      setLongBreakMinutes(value);
                    }
                    handleDurationChange();
                  }}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-white placeholder-white/50 outline-none focus:border-white/40"
                />
              </div>
            </div>
          </div>

          {/* Background Gradient Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Background Gradient</h3>
            
            {/* Preset Gradients */}
            <div className="mb-4">
              <p className="text-sm text-white/70 mb-3">Preset Gradients</p>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_GRADIENTS.map((gradient) => (
                  <button
                    key={gradient.value}
                    onClick={() => handleColorChange(gradient.value)}
                    className={`h-16 w-full rounded-lg transition-all overflow-hidden relative ${
                      customColor === gradient.value
                        ? "ring-2 ring-white ring-offset-2 ring-offset-black/30 scale-105"
                        : "hover:scale-105"
                    }`}
                    style={{ background: gradient.value }}
                    title={gradient.name}
                    aria-label={`Select ${gradient.name} gradient`}
                  >
                    <span className="absolute bottom-2 left-2 text-xs text-white font-medium drop-shadow-lg">
                      {gradient.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Gradient Input */}
            <div>
              <p className="text-sm text-white/70 mb-3">Custom Gradient</p>
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomColor(value);
                  if (value.startsWith("linear-gradient") || value.startsWith("#")) {
                    handleColorChange(value);
                  }
                }}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-white placeholder-white/50 outline-none focus:border-white/40 text-sm"
                placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
              <p className="text-xs text-white/50 mt-2">
                Enter a CSS gradient or hex color
              </p>
            </div>

            {/* Preview */}
            <div className="mt-4 rounded-lg bg-white/10 p-4 border border-white/20">
              <p className="text-sm text-white/70 mb-2">Preview</p>
              <div
                className="h-20 w-full rounded-lg border-2 border-white/20"
                style={{ background: customColor }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

