"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Download, Linkedin, Mail, MapPin, Phone, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { atouts, experiences, formation, languages, profile, skills, tools } from "@/lib/cv-data";
import type { ZoneId } from "./types";

export function FloatingPanel({ zone, onClose }: { zone: ZoneId | null; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (zone) panelRef.current?.focus();
  }, [zone]);

  return (
    <AnimatePresence>
      {zone && (
        <motion.div
          key={zone}
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.985 }}
          transition={{ duration: 0.3, ease: [0.2, 0.72, 0.18, 1] }}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          data-floating-panel
          tabIndex={-1}
          onKeyDownCapture={(event) => {
            if (event.key === "Escape" || event.key === "Esc") {
              event.stopPropagation();
              onClose();
            }
          }}
          className="beach-panel fixed left-1/2 top-1/2 z-[70] max-h-[76vh] w-[min(92vw,580px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-5 text-paper outline-none md:left-auto md:right-7 md:w-[min(42vw,620px)] md:-translate-x-0 md:p-6"
        >
          <div className="beach-panel-rule" />
          <button onClick={onClose} className="beach-close" aria-label="Fermer la fenêtre">
            <X className="h-4 w-4" />
          </button>
          <div className="beach-content">
            <ZoneContent zone={zone} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ZoneContent({ zone }: { zone: ZoneId }) {
  if (zone === "intro") return <IntroContent />;
  if (zone === "about") return <AboutContent />;
  if (zone === "cursus") return <CursusContent />;
  if (zone === "skills") return <SkillsContent />;
  if (zone === "experiences") return <ExperiencesContent />;
  if (zone === "project") return <ProjectContent />;
  return <ContactContent />;
}

function IntroContent() {
  return (
    <div>
      <p className="font-hand text-lg text-brass">Bienvenue</p>
      <h2 className="mt-1 font-display text-3xl text-paper md:text-4xl">Le Quai des Écritures</h2>
      <p className="mt-4 text-sm leading-relaxed text-paper/85 md:text-base">
        Ce portfolio se parcourt comme une promenade. Chaque lieu du quai révèle une section du
        parcours : profil, formation, compétences, expériences, projet professionnel et contact.
      </p>
      <p className="mt-4 text-sm text-white/70">
        Défilez pour avancer. Les halos dorés sont les points interactifs.
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-widest text-brass">
        <ChevronRight className="h-4 w-4" />
        Étape 1 sur 7
      </div>
    </div>
  );
}

function AboutContent() {
  return (
    <div>
      <p className="font-hand text-lg text-brass">Le bar-kiosque</p>
      <h2 className="mt-1 font-display text-3xl text-paper">À propos</h2>
      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="font-display text-2xl text-paper">{profile.name}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-white/60">{profile.title}</p>
          <div className="mt-4 space-y-2 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-brass" />
              {profile.location}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-brass" />
              {profile.phone}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-brass" />
              {profile.email}
            </div>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-paper/85 md:text-base">{profile.about}</p>
      </div>
    </div>
  );
}

function CursusContent() {
  return (
    <div>
      <p className="font-hand text-lg text-brass">Les escaliers</p>
      <h2 className="mt-1 font-display text-3xl text-paper">Cursus & formation</h2>
      <ol className="coastal-timeline mt-5">
        {formation.map((item, index) => (
          <li key={item.period} className="coastal-timeline-step">
            <span className="coastal-timeline-marker">{String(index + 1).padStart(2, "0")}</span>
            <div className="coastal-timeline-copy">
              <p className="font-mono-cv text-[11px] uppercase tracking-widest text-brass">
                {item.period}
              </p>
              <p className="mt-1 font-display text-xl text-paper">{item.title}</p>
              <p className="text-sm text-white/75">
                {item.detail} — <em>{item.school}</em>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SkillsContent() {
  return (
    <div>
      <p className="font-hand text-lg text-brass">Le terrain</p>
      <h2 className="mt-1 font-display text-3xl text-paper">Compétences</h2>
      <div className="coastal-chip-grid mt-5">
        {skills.map((skill) => (
          <div key={skill.key} className="coastal-chip">
            <p className="font-mono-cv text-[10px] uppercase tracking-widest text-brass">
              {skill.key}
            </p>
            <p className="mt-0.5 text-sm text-paper">{skill.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[11px] uppercase tracking-widest text-brass">Outils</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tools.map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/80"
          >
            {tool}
          </span>
        ))}
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-widest text-brass">Atouts</p>
      <ul className="mt-2 grid gap-1 text-sm text-white/85 md:grid-cols-2">
        {atouts.map((asset) => (
          <li key={asset} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass" />
            {asset}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExperiencesContent() {
  return (
    <div>
      <p className="font-hand text-lg text-brass">Le ponton</p>
      <h2 className="mt-1 font-display text-3xl text-paper">Expériences professionnelles</h2>
      <div className="mt-5 space-y-4">
        {experiences.map((experience, index) => (
          <article key={experience.company} className="coastal-entry">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono-cv text-[11px] uppercase tracking-widest text-brass">
                {experience.date} · Borne {String(index + 1).padStart(2, "0")}
              </p>
              <p className="text-[11px] uppercase tracking-widest text-white/50">
                {experience.location}
              </p>
            </div>
            <p className="mt-1 font-display text-xl text-paper">{experience.company}</p>
            <p className="text-sm italic text-brass/90">{experience.role}</p>
            <ul className="mt-2 space-y-1 text-sm text-white/80">
              {experience.points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProjectContent() {
  const projectBadges = [
    "Disponibilité : à partir de septembre 2026",
    "Rythme : 3 jours entreprise semaine A / 2 jours entreprise semaine B",
    "Contrat recherché : alternance en comptabilité, audit ou finance",
    "Objectif long terme : devenir expert financier",
  ];

  return (
    <div>
      <p className="font-hand text-lg text-brass">Cap sur l'horizon</p>
      <h2 className="mt-1 font-display text-3xl text-paper">Projet professionnel</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-paper/85 md:text-base">
        <p>
          Mon objectif est de rejoindre une structure formatrice en cabinet comptable, audit ou
          direction financière afin de progresser vers des missions de révision, de contrôle et
          d’analyse financière.
        </p>
        <p>
          Je recherche une alternance dans le monde de la comptabilité ou de la finance, au sein
          d’une structure capable de me faire monter en compétences et de me propulser vers
          l’expertise financière.
        </p>
        <p>À long terme, mon ambition est de devenir expert financier à la fin de mes études.</p>
      </div>
      <div className="coastal-fact-grid mt-5">
        {projectBadges.map((item) => (
          <div key={item} className="coastal-fact">
            <span />
            <p className="text-sm text-paper/90">{item}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-widest text-brass">Langues</p>
      <ul className="mt-2 space-y-1 text-sm text-white/85">
        {languages.map((language) => (
          <li key={language.name}>
            <span className="text-paper">{language.name}</span>{" "}
            <span className="text-white/60">— {language.level}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactContent() {
  return (
    <div>
      <p className="font-hand text-lg text-brass">Carte de visite</p>
      <h2 className="mt-1 font-display text-3xl text-paper">Me contacter</h2>
      <p className="coastal-note mt-4 text-sm leading-relaxed text-paper/85">
        Disponible à partir de septembre 2026 pour une alternance en comptabilité, audit ou finance.
      </p>
      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1fr]">
        <div className="coastal-contact-card">
          <p className="font-display text-xl text-paper">{profile.name}</p>
          <p className="text-xs text-white/60">{profile.title}</p>
          <div className="mt-4 space-y-2 text-sm">
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 text-paper/90 transition hover:text-brass"
            >
              <Mail className="h-4 w-4 text-brass" /> {profile.email}
            </a>
            <a
              href={`tel:${profile.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-paper/90 transition hover:text-brass"
            >
              <Phone className="h-4 w-4 text-brass" /> {profile.phone}
            </a>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <a href={profile.cvUrl} download>
              <Button className="w-full bg-brass text-ink hover:bg-brass/85">
                <Download className="mr-2 h-4 w-4" /> Télécharger le CV
              </Button>
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="w-full border-brass/40 bg-transparent text-paper hover:bg-brass/10"
              >
                <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
              </Button>
            </a>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}

function ContactForm() {
  const [sending, setSending] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", message: "" });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    const subject = encodeURIComponent(
      `Contact portfolio — ${values.name || "candidat alternance"}`,
    );
    const body = encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      toast.success("Votre client mail s'ouvre. Merci !");
      setSending(false);
    }, 400);
  };

  return (
    <form onSubmit={submit} className="coastal-contact-card">
      <p className="font-hand text-lg text-brass">Message</p>
      <div className="mt-3 space-y-2">
        <Input
          required
          maxLength={100}
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          placeholder="Votre nom"
          className="border-white/15 bg-white/5 text-paper placeholder:text-white/40"
        />
        <Input
          required
          type="email"
          maxLength={200}
          value={values.email}
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          placeholder="votre@email.fr"
          className="border-white/15 bg-white/5 text-paper placeholder:text-white/40"
        />
        <Textarea
          required
          rows={4}
          maxLength={1500}
          value={values.message}
          onChange={(event) => setValues({ ...values, message: event.target.value })}
          placeholder="Proposition d'alternance, question, échange..."
          className="border-white/15 bg-white/5 text-paper placeholder:text-white/40"
        />
        <Button
          type="submit"
          disabled={sending}
          className="w-full bg-brass text-ink hover:bg-brass/85"
        >
          <Send className="mr-2 h-4 w-4" /> {sending ? "Envoi..." : "Envoyer"}
        </Button>
      </div>
    </form>
  );
}
