"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Note = {
  id: string;
  event_day: string;
  notes: string | null;
  photo_urls: string[] | null;
  created_at: string;
};

const EVENT_DAYS = [
  { label: "Day 1 · 9 March 2026", value: "2026-03-09" },
  { label: "Day 2 · 10 March 2026", value: "2026-03-10" },
  { label: "Day 3 · 11 March 2026", value: "2026-03-11" },
];

const PREVIEW_NOTES: Note[] = [
  {
    id: "preview-1",
    event_day: "2026-03-09",
    notes: "The rights-based approaches session surfaced strong demand for a shared learning platform. OSF will follow up with MENA Rights Group on joint programming opportunities in the Mediterranean region.",
    photo_urls: [],
    created_at: "2026-03-09T14:32:00.000Z",
  },
  {
    id: "preview-2",
    event_day: "2026-03-09",
    notes: "Digital Rights breakout: participants want a working group to share tools for operating in restricted digital environments. Interested orgs: Digital Frontiers, Access Now, EFF.",
    photo_urls: [],
    created_at: "2026-03-09T16:50:00.000Z",
  },
];

function dayLabel(value: string) {
  return EVENT_DAYS.find((day) => day.value === value)?.label.split(" · ")[0] ?? value;
}

function noteTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AddNotePage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [eventDay, setEventDay] = useState(EVENT_DAYS[0].value);
  const [noteText, setNoteText] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("documentation_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setNotes(data?.length ? data : PREVIEW_NOTES);
        setIsLoading(false);
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);



    if (!noteText.trim() && !photos?.length) {
      setError("Add a note or at least one photo before saving.");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.set("event_day", eventDay);
    formData.set("notes", noteText.trim());
    if (photos) Array.from(photos).forEach((photo) => formData.append("photos", photo));

    try {
      const response = await fetch("/api/documentation", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not save the note.");
        setIsSaving(false);
        return;
      }
      setNotes((current) => [data, ...current.filter((note) => !note.id.startsWith("preview-"))]);
      setNoteText("");
      setPhotos(null);
      setShowForm(false);
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const gallery = notes.flatMap((note) => note.photo_urls ?? []);

  return (
    <div className="mx-auto w-full max-w-[704px] px-[15px] pb-28 pt-[28px] lg:max-w-[396px] lg:px-0 lg:py-8">
      <Link href="/programme" className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#74819e] hover:text-[#193562]">
        <span aria-hidden>←</span> Programme
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-[20px] font-bold leading-none text-[#101b31]">Session Notes</h1>
        <button type="button" onClick={() => setShowForm((open) => !open)} className="rounded-[9px] bg-[#193562] px-3 py-2 text-[10px] font-semibold text-white shadow-[0_5px_12px_rgba(25,53,98,0.22)] hover:bg-[#10284e]">
          {showForm ? "Close" : "+ Add Note"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 rounded-[18px] bg-white p-4 shadow-[0_4px_16px_rgba(28,46,90,0.08)]">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#74819e]">Event day</label>
          <select value={eventDay} onChange={(event) => setEventDay(event.target.value)} className="mt-2 h-10 w-full rounded-[10px] bg-[#edf1f7] px-3 text-[11px] text-[#101b31] outline-none">
            {EVENT_DAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
          </select>
          <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#74819e]">Note</label>
          <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} rows={5} placeholder="What stood out today?" className="mt-2 w-full resize-y rounded-[10px] bg-[#edf1f7] px-3 py-3 text-[12px] leading-relaxed text-[#101b31] outline-none placeholder:text-[#8793ad]" />
          <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#74819e]">Photos</label>
          <input type="file" accept="image/*" multiple onChange={(event) => setPhotos(event.target.files)} className="mt-2 block w-full text-[11px] text-[#74819e]" />
          {error && <p role="alert" className="mt-3 rounded-[9px] bg-[#fff0f0] px-3 py-2 text-[11px] text-[#b42318]">{error}</p>}
          <button type="submit" disabled={isSaving} className="mt-4 w-full rounded-[10px] bg-[#193562] py-2.5 text-[11px] font-semibold text-white disabled:opacity-60">{isSaving ? "Saving…" : "Save Note"}</button>
        </form>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#74819e]">Session Notes</h2>
          <span className="text-[9px] text-[#8793ad]">{notes.length} notes</span>
        </div>
        {isLoading ? <div className="h-24 animate-pulse rounded-[18px] bg-[#e9edf4]" /> : <div className="space-y-2.5">
          {notes.map((note, index) => (
            <article key={note.id} className="rounded-[18px] bg-white p-3 shadow-[0_3px_12px_rgba(28,46,90,0.08)]">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#193562] text-[7px] font-bold text-white">{initials(["Maria Schmidt", "James Odhiambo", "Awa Diallo", "Prof. Amara Diallo"][index % 4])}</span>
                  <div><p className="text-[9px] font-semibold text-[#101b31]">{["Maria Schmidt", "James Odhiambo", "Awa Diallo", "Prof. Amara Diallo"][index % 4]}</p><p className="text-[7px] text-[#8793ad]">OAK Foundation</p></div>
                </div>
                <span className="rounded-full bg-[#edf1f7] px-2 py-1 text-[8px] text-[#8793ad]">{dayLabel(note.event_day)} · {noteTime(note.created_at)}</span>
              </div>
              <p className="text-[10px] leading-[1.45] text-[#26344d]">{note.notes}</p>
            </article>
          ))}
        </div>}
      </section>
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#74819e]">Photo Gallery</h2>
          <span className="text-[9px] text-[#8793ad]">{gallery.length} photos</span>
        </div>
        {gallery.length ? <div className="grid grid-cols-2 gap-2">{gallery.map((url) => <img key={url} src={url} alt="Event documentation" className="aspect-[1.35] w-full rounded-[9px] object-cover" />)}</div> : <div className="rounded-[14px] border border-dashed border-[#cbd4e2] bg-white px-4 py-6 text-center text-[10px] text-[#8793ad]">Photos you upload will appear here.</div>}
      </section>
    </div>
  );
}
