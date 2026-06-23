import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Building2, LayoutDashboard, ArrowRight, CheckCircle2, TrendingUp, Shield, Zap, BarChart3, Download, Star } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
});

const LandingPage = () => (
  <div className="space-y-16 py-4">

    {/* Hero */}
    <section className="text-center max-w-3xl mx-auto pt-8">
      <motion.div {...fadeUp(0)}>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          HR Management Platform
        </span>
      </motion.div>

      <motion.h1 {...fadeUp(0.08)} className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] text-foreground mb-5">
        Navigate smart,<br />
        <span className="text-green-500">Work Faster.</span>
      </motion.h1>

      <motion.p {...fadeUp(0.16)} className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
        Stop juggling spreadsheets. One platform to track headcount, manage departments, and pull reports — without the chaos.
      </motion.p>

      <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-3 justify-center mb-10">
        <Link to="/dashboard" className="btn-primary h-11 px-7 text-sm rounded-xl">
          Open Dashboard <ArrowRight size={15} />
        </Link>
        <Link to="/register" className="btn-secondary h-11 px-7 text-sm rounded-xl">
          Get started free
        </Link>
      </motion.div>

      <motion.div {...fadeUp(0.32)} className="flex flex-wrap justify-center gap-8">
        {[['500+', 'Teams using it'], ['99.9%', 'Uptime'], ['< 2min', 'To export']].map(([val, label]) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-black text-foreground">{val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>
    </section>

    {/* Feature chips */}
    <motion.section {...fadeUp(0.1)} className="flex flex-wrap justify-center gap-2">
      {['UX-first design', 'Fully responsive', 'Auto Layout ready', 'Export-ready data', 'Real-time sync', 'Secure routes'].map(label => (
        <div key={label} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-border text-sm font-medium text-foreground shadow-sm hover:border-green-300 hover:text-green-700 transition-colors">
          <CheckCircle2 size={12} className="text-green-500" /> {label}
        </div>
      ))}
    </motion.section>

    {/* Quick links */}
    <section className="space-y-5">
      <motion.div {...fadeUp(0)} className="text-center">
        <h2 className="text-2xl font-black text-foreground">Everything in one place</h2>
        <p className="text-muted-foreground text-sm mt-1.5">Jump straight to what you need.</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: LayoutDashboard, title: 'Dashboard', desc: 'Headcount trends, charts, and KPIs at a glance.', path: '/dashboard', bg: 'bg-green-50', border: 'border-green-200', icon_bg: 'bg-green-500', text: 'text-green-700' },
          { icon: Users, title: 'Employees', desc: 'Filter, search, edit, and export your full directory.', path: '/employees', bg: 'bg-blue-50', border: 'border-blue-200', icon_bg: 'bg-blue-500', text: 'text-blue-700' },
          { icon: Building2, title: 'Departments', desc: 'Organize teams and track structure instantly.', path: '/departments', bg: 'bg-violet-50', border: 'border-violet-200', icon_bg: 'bg-violet-500', text: 'text-violet-700' },
        ].map((card, i) => (
          <motion.div key={card.title} {...fadeUp(i * 0.08)} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <Link to={card.path} className={`block card p-5 ${card.bg} border ${card.border} hover:shadow-card-hover transition-all group`}>
              <div className={`w-10 h-10 rounded-xl ${card.icon_bg} flex items-center justify-center mb-4`}>
                <card.icon size={18} className="text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{card.desc}</p>
              <div className={`flex items-center gap-1 text-sm font-semibold ${card.text}`}>
                Open <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="space-y-5">
      <motion.div {...fadeUp(0)}>
        <h2 className="text-2xl font-black text-foreground">Less admin. More clarity.</h2>
        <p className="text-muted-foreground text-sm mt-1.5">Everything your HR team needs, nothing it doesn't.</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Zap, title: 'Built for speed', desc: 'Launch updates in minutes with quick actions and role-aware routing.', color: 'text-amber-500', bg: 'bg-amber-50' },
          { icon: Shield, title: 'Secure by default', desc: 'Protected routes and auth flows keep sensitive data safe.', color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: TrendingUp, title: 'Always in sync', desc: 'Charts, filters, and exports run off the same clean data set.', color: 'text-green-500', bg: 'bg-green-50' },
          { icon: BarChart3, title: 'Insights-first', desc: 'KPIs, mixes, and cohort trends visible without extra tools.', color: 'text-violet-500', bg: 'bg-violet-50' },
          { icon: Download, title: 'Export-ready', desc: 'Filter your roster any way, then export a clean CSV in one click.', color: 'text-rose-500', bg: 'bg-rose-50' },
          { icon: Users, title: 'Team-friendly', desc: 'Designed for HR leads, managers, and ops teams alike.', color: 'text-cyan-500', bg: 'bg-cyan-50' },
        ].map((f, i) => (
          <motion.div key={f.title} {...fadeUp(i * 0.06)} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <div className="card p-5 h-full hover:shadow-card-hover transition-shadow">
              <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center mb-3`}>
                <f.icon size={16} className={f.color} />
              </div>
              <h3 className="font-bold text-sm text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Testimonials */}
    <section className="space-y-5">
      <motion.div {...fadeUp(0)}>
        <h2 className="text-2xl font-black text-foreground">People actually like using it.</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { quote: "I used to spend Friday afternoons building headcount reports in Excel. Now I just filter and export. Takes 30 seconds.", name: 'Mia R.', role: 'HR Lead · Atlas HR', color: 'bg-green-500' },
          { quote: "The dashboard answered a question my VP asked in a board meeting — while we were still in the meeting.", name: 'Daniel T.', role: 'Engineering Manager · Cobalt', color: 'bg-blue-500', featured: true },
          { quote: "Onboarding a new department used to take a week of back-and-forth. Now it's a 5-minute job.", name: 'Priya S.', role: 'VP Operations · HelioCo', color: 'bg-violet-500' },
        ].map((t, i) => (
          <motion.div key={t.name} {...fadeUp(i * 0.08)}>
            <div className={`card p-5 h-full flex flex-col justify-between ${t.featured ? 'border-green-300 bg-green-50/50' : ''}`}>
              <div>
                <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={12} className="fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.quote}"</p>
              </div>
              <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-border">
                <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white`}>{t.name[0]}</div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <motion.section {...fadeUp(0)} className="pb-4">
      <div className="relative overflow-hidden rounded-2xl p-10 text-center"
        style={{ background: 'linear-gradient(135deg, #0f2d1e 0%, #1a4731 50%, #0d2318 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-green-500/15 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/60 text-xs font-semibold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Free to get started
          </span>
          <h2 className="text-4xl font-black text-white mb-3">See it live today.</h2>
          <p className="text-white/40 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Jump into the dashboard, filter your team, and pull a report — all in under 5 minutes.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/login" className="inline-flex items-center justify-center h-11 px-8 rounded-xl font-bold bg-white text-green-800 text-sm hover:bg-white/92 transition-colors shadow-green">
              Sign in
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center h-11 px-8 rounded-xl font-bold text-sm text-white border border-white/20 hover:bg-white/10 transition-colors">
              Create account
            </Link>
          </div>
          <p className="text-white/20 text-xs mt-5">No credit card. No setup fee. Just sign up.</p>
        </div>
      </div>
    </motion.section>
  </div>
);

export default LandingPage;
