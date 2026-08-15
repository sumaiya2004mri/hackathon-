import {
  Activity,
  ArrowRight,
  Brain,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Clock,
} from "lucide-react";
import type { View } from "../types";

export function Landing({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-blue-50" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700">
              <ShieldCheck className="h-4 w-4" />
              AI-Assisted Triage · Informational Only
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-blue-900 sm:text-5xl md:text-6xl">
              Assess your symptoms.
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
                Find care, fast.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Emergency AI helps you understand how urgent your symptoms might
              be and guides you to nearby healthcare facilities — so you can
              make informed decisions about seeking care.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => onNavigate("assessment")}
                className="btn-primary w-full sm:w-auto"
              >
                Start Assessment
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => onNavigate("hospitals")}
                className="btn-secondary w-full sm:w-auto"
              >
                <MapPin className="h-5 w-5" />
                Find Hospitals
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Takes less than 2 minutes · No sign-up required
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-blue-900 sm:text-3xl">
          How It Works
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
          Three simple steps to get clarity on your symptoms and next steps.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Stethoscope,
              title: "Describe Symptoms",
              desc: "Enter your age, symptoms, severity, and optional vitals like temperature and heart rate.",
            },
            {
              icon: Brain,
              title: "Get Urgency Estimate",
              desc: "Our system evaluates your inputs and provides an urgency level — LOW, MODERATE, or HIGH.",
            },
            {
              icon: MapPin,
              title: "Find Nearby Care",
              desc: "See a list of nearby hospitals and healthcare facilities with directions.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="card group p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold text-slate-300">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-blue-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: HeartPulse,
                title: "Vitals-Aware",
                desc: "Factor in temperature, heart rate, and oxygen saturation.",
              },
              {
                icon: Clock,
                title: "Fast & Simple",
                desc: "Get results in seconds — no waiting rooms, no appointments.",
              },
              {
                icon: ShieldCheck,
                title: "Safe Guidance",
                desc: "Clear action steps, not diagnoses or prescriptions.",
              },
              {
                icon: MapPin,
                title: "Local Facilities",
                desc: "Find nearby hospitals and clinics when you need them.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-start gap-3 rounded-2xl p-5 transition-colors hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="font-bold text-blue-900">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-blue-700 px-6 py-12 text-center text-white shadow-xl sm:px-12">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/10" />
          <div className="relative">
            <Activity className="mx-auto h-10 w-10" />
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              Ready to check your symptoms?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-teal-50">
              Get a quick urgency estimate and safe next-step guidance. It only
              takes a couple of minutes.
            </p>
            <button
              onClick={() => onNavigate("assessment")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-bold text-teal-700 shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              Start Assessment
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
