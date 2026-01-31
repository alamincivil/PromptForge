
import React, { useState, useEffect, useCallback } from 'react';
import { generateCartoonPrompts } from './services/geminiService';
import { Tone, Complexity, FocusPreset, GeneratedProject, Scene, ApiStatus } from './types';
import { PRESET_TEMPLATES } from './constants';

const App: React.FC = () => {
  // Form State
  const [title, setTitle] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.Funny);
  const [complexity, setComplexity] = useState<Complexity>(Complexity.Intermediate);
  const [focus, setFocus] = useState<FocusPreset>(FocusPreset.VillageLife);
  const [sceneCount, setSceneCount] = useState(20);

  // App State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProject, setCurrentProject] = useState<GeneratedProject | null>(null);
  const [history, setHistory] = useState<GeneratedProject[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('promptForge_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
    if (process.env.API_KEY) {
      setApiStatus('connected');
    } else {
      setApiStatus('failed');
    }
  }, []);

  const handleGenerate = async () => {
    if (!title) {
      alert("Please enter a video title");
      return;
    }

    setIsGenerating(true);
    setApiStatus('connected');
    
    try {
      const scenes = await generateCartoonPrompts(title, tone, complexity, focus, sceneCount);
      
      const newProject: GeneratedProject = {
        id: Date.now().toString(),
        title,
        timestamp: Date.now(),
        tone,
        complexity,
        focus,
        sceneCount,
        scenes
      };

      setCurrentProject(newProject);
      const updatedHistory = [newProject, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('promptForge_history', JSON.stringify(updatedHistory));
      
    } catch (error) {
      setApiStatus('failed');
      alert("AI Generation failed. This could be due to API limits or key issues.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!currentProject) return;
    const text = currentProject.scenes.map(s => 
      `Scene ${s.number} [${s.styleLock}]\n` +
      `Characters: ${s.characters}\n` +
      `Setup: ${s.setup}\n` +
      `Movement: ${s.movement}\n` +
      `Background: ${s.background}\n` +
      `Lighting: ${s.lighting}\n` +
      `Mood: ${s.mood}\n` +
      `Final Check: ${s.finalCheck}`
    ).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    alert("Copied all Masterprompts to clipboard!");
  };

  const handleDownload = () => {
    if (!currentProject) return;
    const text = currentProject.scenes.map(s => 
      `Scene ${s.number}\nCharacters: ${s.characters}\nSetup: ${s.setup}\nCamera: ${s.movement}\nBackground: ${s.background}\nLighting: ${s.lighting}\nMood: ${s.mood}\nFinal Check: ${s.finalCheck}`
    ).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title.replace(/\s+/g, '_')}_Masterprompts.txt`;
    a.click();
  };

  const handleTemplateSelect = (p: FocusPreset) => {
    setFocus(p);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
            PF
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">PromptForge Pro</h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Masterprompt AI Engine Enabled</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase border border-blue-100">
            Powered by Gemini 3 Pro
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Inputs */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Master Project Setup</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Animation Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Journey to the Sundarbans"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tone</label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={Tone.Funny}>Funny</option>
                    <option value={Tone.Emotional}>Emotional</option>
                    <option value={Tone.Adventure}>Adventure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Complexity</label>
                  <select 
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value as Complexity)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={Complexity.Simple}>Simple</option>
                    <option value={Complexity.Intermediate}>Intermediate</option>
                    <option value={Complexity.Advanced}>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cultural Focus</label>
                <select 
                  value={focus}
                  onChange={(e) => setFocus(e.target.value as FocusPreset)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                >
                  {Object.values(FocusPreset).map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-700">Scene Count</label>
                  <span className="text-sm font-bold text-orange-600">{sceneCount}</span>
                </div>
                <input 
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={sceneCount}
                  onChange={(e) => setSceneCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-4 mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? 'PROCESSING MASTERPROMPT...' : 'FORGE MASTERPROMPTS'}
              </button>
            </div>
          </section>

          {/* Preset Templates */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Preset Templates</h2>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_TEMPLATES.map((tmpl) => (
                <button 
                  key={tmpl.id}
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className={`group relative rounded-xl overflow-hidden aspect-video border-2 transition ${focus === tmpl.id ? 'border-orange-500 ring-2 ring-orange-100' : 'border-transparent'}`}
                >
                  <img src={tmpl.image} alt={tmpl.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">{tmpl.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Center Panel: Output */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-280px)] min-h-[600px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                  {currentProject ? currentProject.title : 'Masterprompt Output'}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {currentProject ? `Generated with Advanced reasoning - ${currentProject.scenes.length} Masterprompts` : 'Awaiting initialization...'}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} disabled={!currentProject} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-bold hover:bg-slate-50 transition disabled:opacity-50">Copy</button>
                <button onClick={handleDownload} disabled={!currentProject} className="px-3 py-1.5 bg-slate-800 text-white rounded-md text-xs font-bold hover:bg-slate-900 transition disabled:opacity-50">Export</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
              {!currentProject && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"></path></svg>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-40">Ready to Generate</p>
                </div>
              )}

              {isGenerating && (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-black text-orange-600 tracking-tighter uppercase">Analyzing Cultural Context...</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Synthesizing Scene Logic & Style Locks</p>
                </div>
              )}

              {currentProject && currentProject.scenes.map((scene) => (
                <div key={scene.number} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1 bg-orange-500 h-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black">{scene.number}</span>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Masterprompt Scene</h3>
                    </div>
                    <span className="text-[10px] font-black text-orange-500 uppercase px-2 py-1 bg-orange-50 rounded border border-orange-100 tracking-widest">
                      2D Style Locked
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> Characters & Attire
                        </h4>
                        <p className="text-slate-800 font-medium leading-relaxed">{scene.characters}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> Choreography & Blocking
                        </h4>
                        <p className="text-slate-800 leading-relaxed font-semibold italic">"{scene.setup}"</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Movement</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{scene.movement}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Background</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{scene.background}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Aesthetic Meta</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-500">Lighting:</span>
                            <span className="text-slate-700 font-black">{scene.lighting}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-500">Mood:</span>
                            <span className="text-slate-700 font-black">{scene.mood}</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <h4 className="text-[10px] font-black text-green-600 uppercase mb-2 tracking-widest">Validation Check</h4>
                        <p className="text-[11px] text-green-800 leading-tight font-medium bg-green-50 p-2 rounded border border-green-100">
                          {scene.finalCheck}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex gap-3">
               <button onClick={handleCopy} disabled={!currentProject} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase hover:bg-white hover:shadow-md transition disabled:opacity-50">Copy All</button>
               <button onClick={handleDownload} disabled={!currentProject} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-black transition shadow-lg disabled:opacity-50">Export PDF/TXT</button>
            </div>
          </section>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col max-h-[400px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Master History</h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">No projects forged yet</p>
              ) : (
                history.map((h) => (
                  <button key={h.id} onClick={() => setCurrentProject(h)} className="w-full text-left p-3 rounded-xl border border-slate-100 hover:bg-orange-50 transition group">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-slate-800 truncate">{h.title}</span>
                      <span className="text-[9px] font-bold text-slate-400">{new Date(h.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <span className="px-1 py-0.5 bg-slate-100 text-[8px] font-black rounded uppercase">{h.focus}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">AI Engine Status</h2>
            <div className={`p-4 rounded-xl flex items-center gap-4 border ${apiStatus === 'connected' ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${apiStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
              <div>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Gemini 3 Pro</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Latency: Optimal | Context: 2M+</p>
              </div>
            </div>
          </section>

          <div className="bg-gradient-to-br from-orange-600 to-red-600 p-6 rounded-2xl shadow-xl text-white">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Pro Tip</h3>
            <p className="text-xs font-medium leading-relaxed">For complex action scenes, select <span className="underline font-bold">Adventure</span> tone and <span className="underline font-bold">Advanced</span> complexity to trigger dynamic blocking prompts.</p>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <p>© 2025 PromptForge AI v2.0</p>
        <p>Expert 2D Storyboard Toolkit</p>
      </footer>
    </div>
  );
};

export default App;
