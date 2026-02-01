
import React, { useState, useEffect } from 'react';
import { generateCartoonPrompts, validateApiKey } from './services/aiService';
import { Tone, Complexity, FocusPreset, GeneratedProject, Scene, ApiStatus, Provider } from './types';
import { PRESET_TEMPLATES } from './constants';

const MODELS = {
  [Provider.Gemini]: ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash-image'],
  [Provider.OpenAI]: ['gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
  [Provider.DeepSeek]: ['deepseek-v1', 'deepseek-v2']
};

const App: React.FC = () => {
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState<Provider>(Provider.Gemini);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[Provider.Gemini][0]);
  const [isValidated, setIsValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [sceneCount, setSceneCount] = useState(80);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProject, setCurrentProject] = useState<GeneratedProject | null>(null);
  const [history, setHistory] = useState<GeneratedProject[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');

  useEffect(() => {
    const saved = localStorage.getItem('promptForge_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
    // Default to environment key if available
    if (process.env.API_KEY) {
      setApiKey(process.env.API_KEY);
      setIsValidated(true);
      setApiStatus('connected');
    }
  }, []);

  const handleValidate = async () => {
    if (!apiKey) {
      setApiStatus('failed');
      setIsValidated(false);
      return;
    }
    setIsValidating(true);
    setApiStatus('idle');
    try {
      const valid = await validateApiKey(provider, apiKey);
      setIsValidated(valid);
      setApiStatus(valid ? 'connected' : 'failed');
    } catch (e) {
      setIsValidated(false);
      setApiStatus('failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerate = async () => {
    if (!title) return alert("Please enter a title");
    if (!isValidated) return alert("Please validate your API key first");

    setIsGenerating(true);
    try {
      const scenes = await generateCartoonPrompts(
        provider, apiKey, selectedModel, title, Tone.Funny, Complexity.Intermediate, FocusPreset.VillageLife, sceneCount
      );
      const newProj = { id: Date.now().toString(), title, timestamp: Date.now(), tone: Tone.Funny, complexity: Complexity.Intermediate, focus: FocusPreset.VillageLife, sceneCount, scenes };
      setCurrentProject(newProj);
      const updatedHistory = [newProj, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('promptForge_history', JSON.stringify(updatedHistory));
    } catch (error) {
      alert("Generation failed: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10 flex items-center justify-center">
      <div className="app-frame w-full max-w-[1400px] parchment-bg rounded-3xl overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-white/40 border-b border-[#d1d5c7] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="https://img.icons8.com/color/48/000000/leaf.png" alt="logo" className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-black text-[#2d3a2b] tracking-tight">PromptForge</h1>
              <p className="text-sm font-bold text-[#5e7159]">Bangladeshi 2D Cartoon Generator</p>
            </div>
          </div>
          <div className="flex gap-8 text-sm font-bold text-[#4a5a44] uppercase tracking-widest">
            <button className="hover:text-green-700">History</button>
            <button className="hover:text-green-700 flex items-center gap-1">
              <span className="w-4 h-4 border-2 border-current rounded-sm"></span> Templates
            </button>
            <button className="hover:text-green-700">Analytics</button>
            <button className="hover:text-green-700 flex items-center gap-1">
              <span className="text-lg">⚙</span> Settings
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-8 p-8">
          
          {/* Main Area */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {/* Top Config Row */}
            <div className="bg-white/30 rounded-2xl p-6 border border-[#d1d5c7] shadow-sm">
              <div className="flex gap-4 mb-6">
                <input 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Monsoon Day Adventures in the Village"
                  className="flex-1 h-14 px-6 rounded-lg border border-[#d1d5c7] bg-white text-lg font-medium focus:ring-2 focus:ring-green-600 outline-none"
                />
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !isValidated}
                  className={`h-14 px-8 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold rounded-lg shadow-lg transition uppercase tracking-widest ${(!isValidated || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isGenerating ? 'Generating...' : 'Generate Prompts'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <div className="flex items-center gap-6 mb-4">
                    <span className="text-sm font-black text-[#4a5a44] uppercase tracking-widest">API Platform:</span>
                    <div className="flex gap-4">
                      {Object.values(Provider).map(p => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[#5e7159]">
                          <input 
                            type="radio" 
                            name="provider" 
                            checked={provider === p}
                            onChange={() => {
                              setProvider(p);
                              setIsValidated(false);
                              setSelectedModel(MODELS[p][0]);
                            }}
                            className="w-4 h-4 accent-green-700"
                          />
                          {p}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-[#5e7159] uppercase tracking-widest mb-1 ml-1">API Key</label>
                      <input 
                        type="password"
                        value={apiKey}
                        onChange={e => {
                          setApiKey(e.target.value);
                          setIsValidated(false);
                        }}
                        placeholder="apikey-API_KEY_HERE"
                        className="w-full h-10 px-4 glass-input text-sm font-mono focus:bg-white outline-none transition"
                      />
                    </div>
                    <div className="flex flex-col justify-end relative">
                      <button 
                        onClick={handleValidate}
                        disabled={isValidating}
                        className={`h-10 px-4 rounded-md font-bold text-xs flex items-center gap-2 border transition ${isValidated ? 'bg-[#2e7d32] border-[#1b5e20] text-white' : 'bg-[#e0e4d9] border-[#d1d5c7] text-[#5e7159]'} ${isValidating ? 'opacity-70 cursor-wait' : ''}`}
                      >
                        {isValidating ? (
                          <>
                            <svg className="animate-spin h-3 w-3 text-current" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Validating...
                          </>
                        ) : isValidated ? '✅ Key Validated' : 'Validate Key'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end pb-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-black text-[#4a5a44] uppercase tracking-widest">Model</label>
                    <span className="text-xl font-black text-green-800">{sceneCount}</span>
                  </div>
                  <input 
                    type="range"
                    min="10" max="100" step="10"
                    value={sceneCount}
                    onChange={e => setSceneCount(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#d1d5c7] rounded-lg appearance-none cursor-pointer accent-green-800"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-[#8a9a84] mt-1">
                    <span>10</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="flex-1 bg-white/40 rounded-2xl border border-[#d1d5c7] flex flex-col overflow-hidden shadow-inner">
              <div className="px-8 py-4 bg-[#f3f7f2] border-b border-[#d1d5c7]">
                <h2 className="text-lg font-black text-[#2d3a2b] flex items-center gap-2">
                  <span className="text-green-700">Generated Prompts:</span> {currentProject?.title || 'No project selected'}
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-white/20">
                {isGenerating && (
                  <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <div className="w-12 h-12 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
                    <p className="mt-4 font-black text-green-800 uppercase tracking-widest text-xs">Forging Scenes...</p>
                  </div>
                )}
                
                {currentProject ? currentProject.scenes.map((s, idx) => (
                  <div key={idx} className="border-b border-black/5 pb-6">
                    <h3 className="text-lg font-black text-[#2d3a2b] mb-3">Scene {s.number}</h3>
                    <div className="text-sm text-[#4a5a44] leading-relaxed space-y-2">
                      <p>{s.characters}. {s.setup}</p>
                      <p><span className="font-black uppercase text-[10px] tracking-widest mr-2 opacity-60">Camera:</span> {s.movement}</p>
                      <p><span className="font-black uppercase text-[10px] tracking-widest mr-2 opacity-60">Background:</span> {s.background}</p>
                      <p><span className="font-black uppercase text-[10px] tracking-widest mr-2 opacity-60">Lighting:</span> {s.lighting}</p>
                      <p className="font-black text-[#2d3a2b]">{s.styleLock}</p>
                    </div>
                  </div>
                )) : !isGenerating && (
                  <div className="h-full flex flex-col items-center justify-center text-[#8a9a84]/50 italic text-center px-10">
                    <p>Enter an animation title above and ensure your API key is validated to begin forging Masterprompts.</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#f3f7f2] border-t border-[#d1d5c7] flex gap-4 overflow-x-auto">
                <button className="h-10 px-6 bg-[#263238] hover:bg-black text-white font-bold rounded flex items-center gap-2 text-xs transition uppercase whitespace-nowrap">
                  📄 Copy All
                </button>
                <div className="relative group">
                  <button className="h-10 px-6 bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32] font-bold rounded flex items-center gap-2 text-xs transition uppercase whitespace-nowrap">
                    📥 Download <span className="text-[10px]">▼</span>
                  </button>
                </div>
                <button className="h-10 px-6 bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32] font-bold rounded flex items-center gap-2 text-xs transition uppercase whitespace-nowrap">
                  📊 Export to Sheets <span className="text-[10px]">▼</span>
                </button>
                <button className="h-10 px-6 bg-[#fff8e1] border border-[#ffe082] text-[#f57f17] font-bold rounded flex items-center gap-2 text-xs transition uppercase whitespace-nowrap">
                  💾 Save to Library
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* API Platform Box */}
            <div className="bg-white/40 p-6 rounded-2xl border border-[#d1d5c7] shadow-sm">
              <h3 className="text-sm font-black text-[#2d3a2b] uppercase tracking-widest mb-4">API Platform</h3>
              <div className="flex bg-[#e0e4d9] rounded-lg p-1 mb-4">
                {Object.values(Provider).map(p => (
                  <button 
                    key={p} 
                    onClick={() => { setProvider(p); setIsValidated(false); setApiStatus('idle'); }}
                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-md transition ${provider === p ? 'bg-white text-green-800 shadow-sm' : 'text-[#8a9a84] hover:text-[#5e7159]'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input 
                type="password"
                value={apiKey}
                onChange={e => {
                  setApiKey(e.target.value);
                  setIsValidated(false);
                  setApiStatus('idle');
                }}
                placeholder="Enter API key"
                className="w-full h-10 px-4 glass-input text-xs mb-4"
              />
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#8a9a84] uppercase tracking-widest block">Model Selection</label>
                <select 
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="w-full h-10 px-4 glass-input text-xs font-bold text-[#4a5a44] outline-none"
                >
                  {MODELS[provider].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className={`p-3 rounded-lg flex items-center justify-between border transition-colors ${isValidated ? 'bg-[#e8f5e9] border-[#a5d6a7]' : apiStatus === 'failed' ? 'bg-red-50 border-red-200' : isValidating ? 'bg-blue-50 border-blue-200' : 'bg-[#fafafa] border-[#e0e0e0]'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isValidated ? 'bg-[#2e7d32]' : apiStatus === 'failed' ? 'bg-red-500' : isValidating ? 'bg-blue-500' : 'bg-[#9e9e9e]'}`}></span>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isValidated ? 'text-[#2e7d32]' : apiStatus === 'failed' ? 'text-red-700' : isValidating ? 'text-blue-700' : 'text-[#757575]'}`}>
                      {isValidating ? `${provider} Validating...` : isValidated ? `${provider} Connected & Ready` : apiStatus === 'failed' ? `${provider} Check Fail: Retry` : `${provider} Disconnected`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Presets Box */}
            <div className="bg-white/40 p-6 rounded-2xl border border-[#d1d5c7] shadow-sm flex-1">
              <h3 className="text-sm font-black text-[#2d3a2b] uppercase tracking-widest mb-4">Preset Templates</h3>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_TEMPLATES.map(tmpl => (
                  <button key={tmpl.id} className="group relative rounded-lg overflow-hidden aspect-video border-2 border-transparent hover:border-green-600 transition">
                    <img src={tmpl.image} alt={tmpl.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute inset-0 bg-black/30 flex items-end p-2">
                      <span className="text-white text-[9px] font-black uppercase tracking-widest bg-green-900/80 px-2 py-0.5 rounded">{tmpl.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Quick Actions */}
            <div className="flex bg-white/40 rounded-xl border border-[#d1d5c7] p-2">
              <button className="flex-1 py-2 text-[10px] font-black text-[#5e7159] uppercase border-r border-[#d1d5c7] flex items-center justify-center gap-1">
                <span>📁</span> History
              </button>
              <button className="flex-1 py-2 text-[10px] font-black text-[#5e7159] uppercase border-r border-[#d1d5c7] flex items-center justify-center gap-1">
                <span>🗂</span> Templates
              </button>
              <button className="flex-1 py-2 text-[10px] font-black text-[#5e7159] uppercase flex items-center justify-center gap-1">
                <span>⚙</span> Settings <span className="text-lg">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
