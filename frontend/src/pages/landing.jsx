import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShieldCheck, Lock, Users, BarChart3, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 selection:bg-indigo-500/30">
      {/* --- Upgrade 1: Technical Grid Background --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500 opacity-20 blur-[120px]"></div>
      </div>

      <main className="container mx-auto px-6 py-12 relative z-10 min-h-screen flex flex-col justify-center">
        <section className="grid gap-16 lg:grid-cols-2 items-center">
          
          {/* --- Left Column: Enhanced Typography & Motion --- */}
          <div className="space-y-8 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-shadow cursor-default"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              OMS v2.0 Live
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="block"
              >
                Orchestrate your
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="block"
              >
                entire organization
              </motion.span>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="h-[1.2em] flex items-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                <Typewriter text={["with precision.", "with security.", "without chaos."]} />
              </motion.div>
            </h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-600 leading-relaxed max-w-lg"
            >
              Stop juggling legacy spreadsheets. Centralize your employees, access controls, and analytics in one 
              <span className="font-semibold text-slate-900"> military-grade</span> encrypted dashboard.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <button className="group relative px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </span>
              </button>
              <button className="px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all duration-300">
                Live Demo
              </button>
            </motion.div>
          </div>

          {/* --- Right Column: Upgrade 2 - 3D Tilt Dashboard --- */}
          <div className="relative perspective-1000">
             <TiltCard />
          </div>

        </section>
      </main>
    </div>
  );
}

/* --- Sub-Components --- */

// 1. Better Typewriter using Framer Motion logic (smoother)
function Typewriter({ text }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timeout2 = setTimeout(() => setBlink((prev) => !prev), 500);
    return () => clearTimeout(timeout2);
  }, [blink]);

  useEffect(() => {
    if (subIndex === text[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 2000); // Wait before deleting
      return;
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % text.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 50 : subIndex === text[index].length ? 1000 : 100, parseInt(Math.random() * 50)));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, text]);

  return (
    <span className="inline-flex">
      {text[index].substring(0, subIndex)}
      <motion.span 
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="w-[3px] h-[1em] bg-indigo-600 ml-1 self-center"
      />
    </span>
  );
}

// 2. The 3D Tilt Logic
function TiltCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [5, -5]); // Inverted for natural feel
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group w-full max-w-lg mx-auto"
    >
        {/* Floating Badge */}
        <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 z-30 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
        >
            <div className="bg-green-100 p-2 rounded-full text-green-600">
                <ShieldCheck size={20} />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Status</p>
                <p className="text-sm font-bold text-slate-800">System Secure</p>
            </div>
        </motion.div>

        {/* Main Glass Card */}
        <div className="relative bg-white/60 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-200">
            {/* Upgrade 3: Scanning Line Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent h-[50%] w-full -translate-y-full animate-scan pointer-events-none z-10" />

            <div className="p-6 md:p-8 space-y-6">
                {/* Fake Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <div className="h-2.5 w-24 bg-slate-200 rounded mb-1.5"></div>
                            <div className="h-2 w-16 bg-slate-100 rounded"></div>
                        </div>
                    </div>
                    <Lock size={16} className="text-slate-300" />
                </div>

                {/* Secure Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <SecureMetric label="Total Active" color="bg-blue-500" delay={0} />
                    <SecureMetric label="Efficiency" color="bg-purple-500" delay={0.2} />
                    <SecureMetric label="Security Level" color="bg-emerald-500" delay={0.4} />
                    <SecureMetric label="Data Nodes" color="bg-orange-500" delay={0.6} />
                </div>

                {/* Skeleton List */}
                <div className="space-y-4 pt-4 border-t border-slate-100/50">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between group/item">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <Users size={14} />
                                </div>
                                <div className="space-y-1">
                                    <div className="h-2 w-24 bg-slate-200 rounded group-hover/item:bg-indigo-100 transition-colors"></div>
                                    <div className="h-1.5 w-16 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                            <div className="h-2 w-8 bg-slate-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Login Overlay (Glass on Glass) */}
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/5 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-500">
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                    <Lock size={14} /> Access Dashboard
                </button>
            </div>
        </div>

        {/* Decorative Blob behind card */}
        <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl -z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </motion.div>
  );
}

function SecureMetric({ color, delay }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.5 }}
            className="p-3 rounded-2xl bg-slate-50 border border-slate-100"
        >
            <div className="flex justify-between items-start mb-2">
                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                <div className="h-1.5 w-8 bg-slate-200 rounded"></div>
            </div>
            <div className="h-5 w-14 bg-slate-200 rounded mb-1"></div>
        </motion.div>
    )
}