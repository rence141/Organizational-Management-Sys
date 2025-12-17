import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Terminal, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../lib/auth';

const HEADLINE_WORDS = ["Mission Control", "Secure Ops", "Cyber Defense", "Global Relay"];

export default function Landing() {
  const navigate = useNavigate();
  const [token] = useState(getToken());

  // --- Typewriter State for Headline ---
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  // --- Typewriter State for Terminal ---
  const [typedCommand, setTypedCommand] = useState('');
  const fullCommand = 'init_session --user=admin --secure';
  const [showLogs, setShowLogs] = useState(false);

  // 1. Headline Typewriter Logic
  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % HEADLINE_WORDS.length;
      const fullText = HEADLINE_WORDS[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      // Speed Adjustments
      setTypingSpeed(isDeleting ? 50 : 150);

      if (!isDeleting && text === fullText) {
        // Finished typing word, pause before deleting
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        // Finished deleting, move to next word
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500); // Pause before typing new word
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum]);

  // 2. Terminal Typing Logic
  useEffect(() => {
    if (typedCommand.length < fullCommand.length) {
      const timeout = setTimeout(() => {
        setTypedCommand(fullCommand.slice(0, typedCommand.length + 1));
      }, 50); 
      return () => clearTimeout(timeout);
    } else {
      const timer = setTimeout(() => setShowLogs(true), 600);
      return () => clearTimeout(timer);
    }
  }, [typedCommand]);

  const handleAccessTerminal = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleRequestClearance = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/sign-up');
    }
  };

  const handleAdminAccess = () => {
    navigate('/admin/login');
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30">
      
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>
      </div>

      <main className="container mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* --- Left Column: Copy --- */}
          <div className="space-y-8 max-w-2xl">
            
            {/* Status Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider"
            >
              <ShieldCheck size={14} />
              System Operational
            </motion.div>

            {/* Headline with Typewriter */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight h-[140px] md:h-auto"
            >
              Secure Access for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {text}
              </span>
              <span className="animate-blink text-indigo-500 inline-block ml-1">|</span>
            </motion.h1>

            {/* Subhead */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg"
            >
              Initialize your session to access the central command dashboard. 
              Manage organizations, monitor threats, and deploy resources.
            </motion.p>

            {/* Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={handleAccessTerminal}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-200"
              >
                <Lock size={18} />
                {token ? 'Go to Dashboard' : 'Access Terminal'}
              </button>
              <button
                onClick={handleRequestClearance}
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                {token ? 'Go to Dashboard' : 'Request Clearance'}
              </button>
            </motion.div>
            
            {/* Trust Strip */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center gap-6 text-slate-400 text-sm font-medium"
            >
              <span className="flex items-center gap-2"><Globe size={16}/> Global Relay</span>
              <span className="flex items-center gap-2"><Terminal size={16}/> API Ready</span>
              <span className="flex items-center gap-2"><ShieldCheck size={16}/> SOC2 Compliant</span>
            </motion.div>
          </div>

          {/* --- Right Column: Visual (Mock Terminal) --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative hidden lg:block"
          >
            {/* Decorative Elements */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 dark:opacity-50"></div>
            
            {/* The Card */}
            <div className="relative bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-800">
              
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="ml-4 text-xs font-mono text-slate-500 flex items-center gap-2">
                  <Lock size={10} /> secure-shell — -zsh — 80x24
                </div>
              </div>

              {/* Window Content */}
              <div className="p-6 font-mono text-sm text-slate-300 space-y-4 min-h-[350px]">
                
                {/* --- Terminal Typing Command --- */}
                <div>
                  <span className="text-green-400">➜</span> <span className="text-blue-400">~</span> <span className="text-yellow-100">{typedCommand}</span>
                  <span className="animate-pulse inline-block w-2 h-4 bg-slate-500 align-middle ml-1"></span>
                </div>
                
                {/* --- Animated Logs --- */}
                {showLogs && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="space-y-1 text-slate-400"
                  >
                    <p>[INFO] Establishing encrypted connection...</p>
                    <motion.p 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    >
                        [INFO] Verifying handshake... <span className="text-green-400">OK</span>
                    </motion.p>
                    <motion.p 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    >
                        [INFO] Loading organization modules...
                    </motion.p>
                  </motion.div>
                )}

                {/* --- Animated Stats --- */}
                {showLogs && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="p-4 bg-slate-950/50 rounded border border-slate-800 mt-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-slate-500 uppercase">Status</div>
                        <div className="text-emerald-400 font-bold">ONLINE</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase">Latency</div>
                        <div className="text-indigo-400 font-bold">24ms</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase">Uptime</div>
                        <div className="text-slate-200">99.99%</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase">Nodes</div>
                        <div className="text-slate-200">1,240</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showLogs && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 1.5 }}
                        className="animate-pulse"
                    >
                        <span className="text-green-400">➜</span> <span className="text-blue-400">~</span> <span className="inline-block w-2 h-4 bg-slate-500 align-middle ml-1"></span>
                    </motion.div>
                )}
              </div>

            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}