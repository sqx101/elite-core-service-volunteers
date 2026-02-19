import { useState, useEffect } from 'react';
import { loadSignups, saveSignups } from './firebase';

function downloadIcs(title, start, end, location, description) {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [view, setView] = useState('signup');
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [signups, setSignups] = useState({ thursday: [], sunday: [] });
  const [submittedDays, setSubmittedDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminCode, setAdminCode] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [copied, setCopied] = useState(false);

  const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE;
  const MAX_VOLUNTEERS = 15;

  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadSignups();
        if (data) {
          setSignups({
            thursday: data.thursday || [],
            sunday: data.sunday || [],
          });
        }
      } catch (e) {
        console.log('Starting fresh');
      }
      setLoading(false);
    };
    init();
  }, []);

  const persistSignups = async (newSignups) => {
    try {
      await saveSignups(newSignups);
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  const toggleDay = (day) => {
    if (signups[day].length >= MAX_VOLUNTEERS) return;
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0) return;
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    const timestamp = new Date().toISOString();
    const newSignups = { ...signups };

    selectedDays.forEach(day => {
      if (newSignups[day].length < MAX_VOLUNTEERS) {
        newSignups[day] = [...newSignups[day], {
          name: name.trim(),
          signedUpAt: timestamp,
          id: Date.now() + Math.random()
        }];
      }
    });

    setSignups(newSignups);
    await persistSignups(newSignups);
    setSubmittedDays(selectedDays);
    setView('confirmed');
  };

  const handleAdminAccess = () => {
    if (adminCode === ADMIN_CODE) {
      setView('admin');
      setShowAdminInput(false);
      setAdminCode('');
    }
  };

  const removeVolunteer = async (day, id) => {
    const newSignups = {
      ...signups,
      [day]: signups[day].filter(v => v.id !== id)
    };
    setSignups(newSignups);
    await persistSignups(newSignups);
  };

  const clearAllSignups = async () => {
    if (confirm('Clear ALL signups? This cannot be undone.')) {
      const empty = { thursday: [], sunday: [] };
      setSignups(empty);
      await persistSignups(empty);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  // ============ ADMIN VIEW ============
  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">📋 Admin Dashboard</h1>
                <p className="text-gray-600">Elite Core Cup Volunteers</p>
              </div>
              <button onClick={() => setView('signup')} className="text-fuchsia-600 hover:text-fuchsia-800 font-medium">
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-fuchsia-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-fuchsia-600">{signups.thursday.length}/{MAX_VOLUNTEERS}</div>
                <div className="text-sm text-gray-600">Thu, Feb 26</div>
              </div>
              <div className="bg-violet-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-violet-600">{signups.sunday.length}/{MAX_VOLUNTEERS}</div>
                <div className="text-sm text-gray-600">Sun, Mar 1</div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-fuchsia-500 rounded-full"></span>
                Thursday, Feb 26 • 5-9 PM • SETUP
              </h2>
              {signups.thursday.length === 0 ? (
                <p className="text-gray-400 text-sm italic ml-5">No signups yet</p>
              ) : (
                <div className="space-y-2 ml-5">
                  {signups.thursday.map((v, i) => (
                    <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-800">{i + 1}. {v.name}</span>
                      <button onClick={() => removeVolunteer('thursday', v.id)} className="text-red-500 hover:text-red-700 text-sm">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-violet-500 rounded-full"></span>
                Sunday, Mar 1 • 6-9 PM • TAKEDOWN
              </h2>
              {signups.sunday.length === 0 ? (
                <p className="text-gray-400 text-sm italic ml-5">No signups yet</p>
              ) : (
                <div className="space-y-2 ml-5">
                  {signups.sunday.map((v, i) => (
                    <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-800">{i + 1}. {v.name}</span>
                      <button onClick={() => removeVolunteer('sunday', v.id)} className="text-red-500 hover:text-red-700 text-sm">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={clearAllSignups} className="w-full py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50">
              Clear All Signups
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ CONFIRMED VIEW ============
  if (view === 'confirmed') {
    const location = 'Elite Core Gymnastics, 999 W Main St, West Dundee, IL 60118';
    const encodedLocation = encodeURIComponent(location);

    const thursdayCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Elite Core Cup - SETUP Volunteer')}&dates=20260226T170000/20260226T210000&location=${encodedLocation}&details=${encodeURIComponent('Volunteer setup for Elite Core Cup Mardi Gras 2026\n\nBring your school community service form\nFood & beverages provided!')}`;

    const sundayCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Elite Core Cup - TAKEDOWN Volunteer')}&dates=20260301T180000/20260301T210000&location=${encodedLocation}&details=${encodeURIComponent('Volunteer takedown for Elite Core Cup Mardi Gras 2026\n\nBring your school community service form\nFood & beverages provided!')}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 via-purple-900 to-violet-900 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You're Signed Up!</h2>
          <p className="text-gray-600 mb-4">
            Thanks, <span className="font-semibold">{name.split(' ')[0]}</span>! See you at the <span className="font-semibold text-fuchsia-600">Elite Core Cup</span>!
          </p>
          <div className="space-y-3 mb-6">
            {submittedDays.includes('thursday') && (
              <div className="bg-fuchsia-50 rounded-lg p-3">
                <p className="text-fuchsia-700 font-medium mb-2">📅 Thursday, Feb 26 • 5-9 PM • SETUP</p>
                <div className="flex gap-2">
                  <a
                    href={thursdayCalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm bg-fuchsia-600 text-white px-3 py-1.5 rounded-full hover:bg-fuchsia-700"
                  >
                    📆 Google Cal
                  </a>
                  <button
                    onClick={() => downloadIcs('Elite Core Cup - SETUP Volunteer', '20260226T170000', '20260226T210000', 'Elite Core Gymnastics, 999 W Main St, West Dundee, IL 60118', 'Volunteer setup for Elite Core Cup Mardi Gras 2026. Bring your school community service form. Food & beverages provided!')}
                    className="inline-flex items-center gap-1 text-sm bg-fuchsia-100 text-fuchsia-700 px-3 py-1.5 rounded-full hover:bg-fuchsia-200"
                  >
                    📅 iCal
                  </button>
                </div>
              </div>
            )}
            {submittedDays.includes('sunday') && (
              <div className="bg-violet-50 rounded-lg p-3">
                <p className="text-violet-700 font-medium mb-2">📅 Sunday, Mar 1 • 6-9 PM • TAKEDOWN</p>
                <div className="flex gap-2">
                  <a
                    href={sundayCalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm bg-violet-600 text-white px-3 py-1.5 rounded-full hover:bg-violet-700"
                  >
                    📆 Google Cal
                  </a>
                  <button
                    onClick={() => downloadIcs('Elite Core Cup - TAKEDOWN Volunteer', '20260301T180000', '20260301T210000', 'Elite Core Gymnastics, 999 W Main St, West Dundee, IL 60118', 'Volunteer takedown for Elite Core Cup Mardi Gras 2026. Bring your school community service form. Food & beverages provided!')}
                    className="inline-flex items-center gap-1 text-sm bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full hover:bg-violet-200"
                  >
                    📅 iCal
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-left mb-4">
            <p className="font-semibold text-gray-700 mb-1">📍 Location</p>
            <p className="text-gray-600 text-sm">Elite Core Gymnastics</p>
            <p className="text-gray-600 text-sm">999 W Main St, West Dundee, IL</p>
            <a
              href="https://maps.apple.com/?daddr=999+W+Main+St,+West+Dundee,+IL+60118"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-fuchsia-600 hover:text-fuchsia-800 mt-2"
            >
              🗺️ Directions
            </a>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 text-left">
            <p className="font-semibold text-amber-800 mb-2">📋 Don't forget:</p>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Bring your school's community service form</li>
              <li>• Wear comfortable clothes, you may break a sweat</li>
              <li>• Bring work gloves if you have them</li>
            </ul>
            <p className="text-sm text-amber-700 mt-2">🍕 Food & beverages provided!</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex-1 py-2.5 rounded-lg border-2 border-fuchsia-200 text-fuchsia-600 font-medium hover:bg-fuchsia-50 transition-colors text-sm"
            >
              {copied ? '✓ Link Copied!' : '🔗 Share with Friends'}
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent('Elite Core Cup Volunteer Reminder')}&body=${encodeURIComponent(
                `Hi ${name.split(' ')[0]}!\n\nYou signed up to volunteer for the Elite Core Cup Mardi Gras 2026:\n\n${
                  submittedDays.includes('thursday') ? '📅 Thursday, Feb 26 • 5-9 PM • SETUP\n' : ''
                }${
                  submittedDays.includes('sunday') ? '📅 Sunday, Mar 1 • 6-9 PM • TAKEDOWN\n' : ''
                }\n📍 Elite Core Gymnastics, 999 W Main St, West Dundee, IL 60118\n\nDon\'t forget to bring your school\'s community service form!\nFood & beverages provided.`
              )}`}
              className="flex-1 py-2.5 rounded-lg border-2 border-violet-200 text-violet-600 font-medium hover:bg-violet-50 transition-colors text-sm text-center"
            >
              ✉️ Email Reminder
            </a>
          </div>

          <button onClick={() => { setView('signup'); setName(''); setSelectedDays([]); setCopied(false); }}
            className="mt-4 text-fuchsia-600 hover:text-fuchsia-800 font-medium">
            ← Sign up another person
          </button>
        </div>
      </div>
    );
  }

  // ============ SIGNUP VIEW ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-5 pt-4">
          <img
            src="/logo.png"
            alt="Mardi Gras Elite Core Cup 2026"
            className="w-40 h-40 mx-auto mb-2 object-contain rounded-full"
          />
          <p className="text-fuchsia-200 text-lg">Volunteer Sign Up</p>
        </div>

        {/* Location */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 border border-white/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-white font-semibold">Elite Core Gymnastics</p>
              <p className="text-fuchsia-200 text-sm">999 W Main St, West Dundee, IL</p>
            </div>
          </div>
        </div>

        {/* Perks */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 border border-white/20">
          <p className="text-sm font-semibold text-white mb-2">What You'll Get:</p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-amber-400/20 text-amber-200 text-xs font-medium px-3 py-1.5 rounded-full">📋 Service Hours</span>
            <span className="bg-red-400/20 text-red-200 text-xs font-medium px-3 py-1.5 rounded-full">🍕 Food</span>
            <span className="bg-blue-400/20 text-blue-200 text-xs font-medium px-3 py-1.5 rounded-full">🥤 Drinks</span>
          </div>
          <p className="text-white/50 text-xs mt-2">* Bring your school's service hour form</p>
          <p className="text-white/50 text-xs">* Bring work gloves if you have them</p>
        </div>

        {/* Day Selection */}
        <div className="space-y-3 mb-4">
          {/* Thursday */}
          <button
            onClick={() => toggleDay('thursday')}
            disabled={signups.thursday.length >= MAX_VOLUNTEERS && !selectedDays.includes('thursday')}
            className={`w-full rounded-xl p-4 border-2 transition-all text-left ${
              selectedDays.includes('thursday')
                ? 'border-fuchsia-400 bg-fuchsia-500/30'
                : signups.thursday.length >= MAX_VOLUNTEERS
                ? 'border-gray-600 bg-gray-800/50 opacity-50'
                : 'border-white/20 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedDays.includes('thursday') ? 'border-fuchsia-400 bg-fuchsia-400' : 'border-white/40'
                  }`}>
                    {selectedDays.includes('thursday') && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-white font-semibold">Thursday, Feb 26</span>
                </div>
                <p className="text-fuchsia-200 text-sm ml-7">5:00 PM - 9:00 PM • SETUP</p>
                <p className="text-fuchsia-300/60 text-xs ml-7 mt-0.5">Moving mats, equipment & decorations</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${signups.thursday.length >= MAX_VOLUNTEERS ? 'text-red-400' : 'text-green-400'}`}>
                  {signups.thursday.length}/{MAX_VOLUNTEERS}
                </div>
                <div className="text-xs text-fuchsia-200">spots</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-fuchsia-400 rounded-full transition-all duration-500"
                style={{ width: `${(signups.thursday.length / MAX_VOLUNTEERS) * 100}%` }}
              />
            </div>
          </button>

          {/* Sunday */}
          <button
            onClick={() => toggleDay('sunday')}
            disabled={signups.sunday.length >= MAX_VOLUNTEERS && !selectedDays.includes('sunday')}
            className={`w-full rounded-xl p-4 border-2 transition-all text-left ${
              selectedDays.includes('sunday')
                ? 'border-violet-400 bg-violet-500/30'
                : signups.sunday.length >= MAX_VOLUNTEERS
                ? 'border-gray-600 bg-gray-800/50 opacity-50'
                : 'border-white/20 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedDays.includes('sunday') ? 'border-violet-400 bg-violet-400' : 'border-white/40'
                  }`}>
                    {selectedDays.includes('sunday') && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-white font-semibold">Sunday, Mar 1</span>
                </div>
                <p className="text-violet-200 text-sm ml-7">6:00 PM - 9:00 PM • TAKEDOWN</p>
                <p className="text-violet-300/60 text-xs ml-7 mt-0.5">Breaking down equipment & cleanup</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${signups.sunday.length >= MAX_VOLUNTEERS ? 'text-red-400' : 'text-green-400'}`}>
                  {signups.sunday.length}/{MAX_VOLUNTEERS}
                </div>
                <div className="text-xs text-violet-200">spots</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-400 rounded-full transition-all duration-500"
                style={{ width: `${(signups.sunday.length / MAX_VOLUNTEERS) * 100}%` }}
              />
            </div>
          </button>
        </div>

        {/* Name Input */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setNameError(false); }}
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 rounded-lg bg-gray-50 border text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${
              nameError
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
                : 'border-gray-200 focus:border-fuchsia-400 focus:ring-fuchsia-400/50'
            }`}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {nameError && (
            <p className="text-red-500 text-sm mt-1">Please enter your name to sign up</p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={selectedDays.length === 0}
          className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all ${
            selectedDays.length > 0
              ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 active:scale-[0.98]'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {selectedDays.length === 0
            ? 'Select a Day Above'
            : selectedDays.length === 2
            ? 'Sign Up for Both Days'
            : 'Sign Up to Volunteer ⚡'}
        </button>

        {/* Helper text */}
        <p className="text-center text-white/40 text-xs mt-3">
          Tap a date to select • You can volunteer both days
        </p>

        {/* Footer */}
        <div className="text-center mt-4 pb-4">
          {!showAdminInput ? (
            <button onClick={() => setShowAdminInput(true)} className="text-white/30 text-sm hover:text-white/50">
              Admin Access
            </button>
          ) : (
            <div className="flex gap-2 justify-center">
              <input
                type="password"
                value={adminCode}
                onChange={e => setAdminCode(e.target.value)}
                placeholder="Admin code"
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm w-36 focus:outline-none"
                onKeyDown={e => e.key === 'Enter' && handleAdminAccess()}
              />
              <button onClick={handleAdminAccess} className="text-white/60 hover:text-white text-sm">→</button>
              <button onClick={() => { setShowAdminInput(false); setAdminCode(''); }} className="text-white/40 hover:text-white text-sm">✕</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
