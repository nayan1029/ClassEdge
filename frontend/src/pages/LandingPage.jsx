import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, BrainCircuit, CheckSquare, CalendarDays,
  FileText, Bot, User, ArrowRight, Zap,
} from 'lucide-react'

const FEATURES = [
  { icon: FileText,    color: 'bg-teal-600',    title: 'AI Summarizer',      desc: 'Paste any content and get a crisp, structured summary in seconds.' },
  { icon: BrainCircuit,color: 'bg-purple-600',  title: 'Quiz Generator',     desc: 'Auto-generate MCQs on any topic at easy / medium / hard levels.' },
  { icon: BookOpen,    color: 'bg-blue-600',    title: 'Smart Notes',        desc: 'Rich note-taking with full search and coloured card organisation.' },
  { icon: CheckSquare, color: 'bg-emerald-600', title: 'Task Manager',       desc: 'Track deadlines and get colour-coded urgency alerts automatically.' },
  { icon: CalendarDays,color: 'bg-amber-600',   title: 'Timetable',          desc: 'Build a weekly study schedule and visualise your focus time.' },
  { icon: Bot,         color: 'bg-red-800',     title: 'AI Assistant',       desc: 'Chat with a study companion that knows your subject material.' },
  { icon: User,        color: 'bg-pink-600',    title: 'Student Profile',    desc: 'Analytics on your learning streak, quiz score trends, and more.' },
]

const FLASH_QAS = [
  { q: 'What is a Binary Tree?', a: 'A hierarchical structure where every node has at most 2 children (left and right).' },
  { q: 'What does HTTP stand for?', a: 'HyperText Transfer Protocol – the foundation of data communication on the Web.' },
  { q: 'What is time complexity O(1)?', a: 'Constant time – the algorithm takes the same time regardless of input size.' },
]

function MiniFlashCard({ q, a }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div
      className="relative h-36 cursor-pointer select-none"
      style={{ perspective: '800px' }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div
          className="absolute inset-0 bg-teal-700 rounded-2xl flex flex-col items-center justify-center px-4 text-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-white font-semibold text-sm leading-snug">{q}</p>
          <span className="mt-2 text-teal-200 text-xs">tap to reveal</span>
        </div>
        <div
          className="absolute inset-0 bg-white border-2 border-teal-200 rounded-2xl flex flex-col items-center justify-center px-4 text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-black text-sm leading-relaxed">{a}</p>
          <span className="mt-2 text-gray-400 text-xs">tap to flip back</span>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-teal-50">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full mb-5">
            <Zap size={12} /> AI-Powered Learning Platform
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-teal-900 leading-tight mb-5">
            ClassEdge<br />
            <span className="text-red-800">Smarter</span> Learning
          </h1>
          <p className="text-gray-700 text-lg mb-8 max-w-md">
            Your all-in-one school workspace for classes, learning materials, assignments, communication, and study tools.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-900 hover:bg-red-800 text-white font-semibold shadow-lg shadow-red-900/20 transition-all hover:shadow-red-900/40"
            >
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl border-2 border-teal-800 text-teal-900 font-semibold hover:bg-teal-100 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Sample Flash Cards */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide">Try a Flash Card ↓</p>
          {FLASH_QAS.map((item) => (
            <MiniFlashCard key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white border-t border-teal-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-black text-center mb-2">Everything you need to excel</h2>
          <p className="text-gray-500 text-center mb-10">8 powerful features built for serious students</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="bg-teal-50 border border-teal-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-black mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 text-center bg-teal-900">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to level up?</h2>
        <p className="text-teal-200 mb-7">Join thousands of students already using ClassEdge.</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3 bg-red-800 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors"
        >
          Create Free Account <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  )
}
