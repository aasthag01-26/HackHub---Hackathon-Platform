import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Layout from "../components/Layout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type HackathonStatus = "" | "upcoming" | "ongoing" | "completed";
type HackathonTab = HackathonStatus | "bookmarked";
type HackathonMode = "" | "online" | "in_person" | "hybrid";
type DeadlineFilter = "" | "open" | "ending_soon" | "closed";

interface Prize {
  place: string;
  description: string;
}

interface TimelineItem {
  title: string;
  date: string;
  description: string;
}

interface Result {
  place: string;
  teamName: string;
  projectName: string;
  description: string;
}

interface Hackathon {
  _id: string;
  organizationName: string;
  organizationWebsite: string;
  title: string;
  description: string;
  domain: string;
  mode: HackathonMode;
  eligibility: string;
  rules: string[];
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  prizes: Prize[];
  timeline: TimelineItem[];
  stage: "registration" | "judging" | "completed";
  status: "upcoming" | "ongoing" | "completed";
  results: Result[];
  resultsPublished: boolean;
}

const dateLabel = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const modeLabel = (mode: Hackathon["mode"]) =>
  !mode
    ? "Mode not specified"
    : mode === "in_person"
    ? "In person"
    : mode[0].toUpperCase() + mode.slice(1);

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [mode, setMode] = useState<HackathonMode>("");
  const [deadline, setDeadline] = useState<DeadlineFilter>("");
  const [eligibility, setEligibility] = useState("");
  const [status, setStatus] = useState<HackathonTab>("");
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingBookmark, setSavingBookmark] = useState("");
  const [error, setError] = useState("");

  const loadBookmarks = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setBookmarksLoaded(true);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/hackathons/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const result = await response.json();
        if (response.status !== 401) {
          throw new Error(result.message || "Could not load bookmarks");
        }
        return;
      }
      const result = await response.json();
      setBookmarkedIds(
        new Set(result.hackathons.map((hackathon: Hackathon) => hackathon._id))
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load bookmarked hackathons"
      );
    } finally {
      setBookmarksLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    if (status === "bookmarked") return;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (domain.trim()) params.set("domain", domain.trim());
      if (mode) params.set("mode", mode);
      if (deadline) params.set("deadline", deadline);
      if (eligibility.trim()) params.set("eligibility", eligibility.trim());
      if (status) params.set("status", status);

      try {
        const response = await fetch(
          `${API_URL}/hackathons?${params.toString()}`
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Could not load hackathons");
        }
        setHackathons(result.hackathons);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load published hackathons"
        );
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, domain, mode, deadline, eligibility, status]);

  useEffect(() => {
    if (status !== "bookmarked" || !bookmarksLoaded) return;
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (domain.trim()) params.set("domain", domain.trim());
      if (mode) params.set("mode", mode);
      if (deadline) params.set("deadline", deadline);
      if (eligibility.trim()) params.set("eligibility", eligibility.trim());
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/hackathons/bookmarks?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Could not load bookmarks");
        }
        if (active) setHackathons(result.hackathons);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load bookmarked hackathons"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, domain, mode, deadline, eligibility, status, bookmarksLoaded]);

  const toggleBookmark = async (hackathonId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Sign in to bookmark hackathons.");
      return;
    }
    setSavingBookmark(hackathonId);
    setError("");
    const isBookmarked = bookmarkedIds.has(hackathonId);
    try {
      const response = await fetch(
        `${API_URL}/hackathons/${hackathonId}/bookmark`,
        {
          method: isBookmarked ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not update bookmark");
      }
      setBookmarkedIds((current) => {
        const updated = new Set(current);
        if (isBookmarked) updated.delete(hackathonId);
        else updated.add(hackathonId);
        return updated;
      });
      if (status === "bookmarked" && isBookmarked) {
        setHackathons((current) =>
          current.filter((hackathon) => hackathon._id !== hackathonId)
        );
      }
    } catch (bookmarkError) {
      setError(
        bookmarkError instanceof Error
          ? bookmarkError.message
          : "Could not update bookmark"
      );
    } finally {
      setSavingBookmark("");
    }
  };

  const statuses: Array<{ value: HackathonTab; label: string }> = [
    { value: "", label: "All" },
    { value: "upcoming", label: "Upcoming" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
    { value: "bookmarked", label: "Bookmarked" },
  ];

  return (
    <Layout>
      <Head>
        <title>Discover Hackathons - HackHub</title>
      </Head>
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-display-md font-display text-gradient-primary text-glow">
            Discover Hackathons
          </h1>
          <p className="mt-2 text-body-sm font-body text-zinc-400">
            Find published hackathons by domain, format, deadline, and
            eligibility.
          </p>
        </header>

        <section className="card space-y-4" aria-label="Hackathon filters">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label-enhanced" htmlFor="hackathon-search">
                Search
              </label>
              <input
                id="hackathon-search"
                className="input-enhanced mt-1 w-full"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, description, or organizer"
                maxLength={120}
              />
            </div>
            <div>
              <label className="label-enhanced" htmlFor="hackathon-domain">
                Domain
              </label>
              <input
                id="hackathon-domain"
                className="input-enhanced mt-1 w-full"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="e.g. AI, climate, fintech"
                maxLength={80}
              />
            </div>
            <div>
              <label className="label-enhanced" htmlFor="hackathon-mode">
                Mode
              </label>
              <select
                id="hackathon-mode"
                className="input-enhanced mt-1 w-full"
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value as HackathonMode)
                }
              >
                <option value="">Any mode</option>
                <option value="online">Online</option>
                <option value="in_person">In person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="label-enhanced" htmlFor="hackathon-deadline">
                Registration deadline
              </label>
              <select
                id="hackathon-deadline"
                className="input-enhanced mt-1 w-full"
                value={deadline}
                onChange={(event) =>
                  setDeadline(event.target.value as DeadlineFilter)
                }
              >
                <option value="">Any deadline</option>
                <option value="open">Still open</option>
                <option value="ending_soon">Within 7 days</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label
                className="label-enhanced"
                htmlFor="hackathon-eligibility"
              >
                Eligibility
              </label>
              <input
                id="hackathon-eligibility"
                className="input-enhanced mt-1 w-full"
                value={eligibility}
                onChange={(event) => setEligibility(event.target.value)}
                placeholder="e.g. Students, beginners"
                maxLength={160}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Hackathon status">
            {statuses.map((item) => (
              <button
                key={item.value || "all"}
                role="tab"
                aria-selected={status === item.value}
                className={`rounded-lg px-4 py-2 text-sm transition-all ${
                  status === item.value
                    ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white"
                    : "bg-slate-800/70 text-zinc-300 hover:bg-slate-700"
                }`}
                onClick={() =>
                  setStatus(item.value)
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="card border border-red-500/40 text-red-200" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="card text-zinc-400">Loading hackathons...</div>
        ) : hackathons.length === 0 ? (
          <div className="card text-zinc-400">
            No published hackathons match these filters.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {hackathons.map((hackathon) => (
              <article className="card space-y-4" key={hackathon._id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-cyan-300">
                      {hackathon.organizationWebsite ? (
                        <a
                          href={hackathon.organizationWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {hackathon.organizationName}
                        </a>
                      ) : (
                        hackathon.organizationName
                      )}
                    </p>
                    <h2 className="mt-1 text-heading-lg font-heading">
                      {hackathon.title}
                    </h2>
                  </div>
                  <button
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      bookmarkedIds.has(hackathon._id)
                        ? "border-cyan-400 text-cyan-200"
                        : "border-slate-600 text-zinc-300"
                    }`}
                    onClick={() => toggleBookmark(hackathon._id)}
                    disabled={savingBookmark === hackathon._id}
                    aria-pressed={bookmarkedIds.has(hackathon._id)}
                  >
                    {savingBookmark === hackathon._id
                      ? "Saving..."
                      : bookmarkedIds.has(hackathon._id)
                      ? "★ Saved"
                      : "☆ Save"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-200">
                    {hackathon.domain || "General"}
                  </span>
                  <span className="rounded-full bg-slate-700 px-3 py-1 text-zinc-200">
                    {modeLabel(hackathon.mode)}
                  </span>
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 capitalize text-cyan-200">
                    {hackathon.status}
                  </span>
                </div>

                <p className="line-clamp-3 text-body-sm text-zinc-300">
                  {hackathon.description}
                </p>
                <p className="text-sm text-zinc-400">
                  Registration deadline:{" "}
                  <span className="text-zinc-200">
                    {dateLabel(hackathon.registrationDeadline)}
                  </span>
                </p>

                <details className="border-t border-slate-600/60 pt-3">
                  <summary className="cursor-pointer font-semibold text-cyan-200">
                    View details, rules, prizes and timeline
                  </summary>
                  <div className="mt-4 space-y-4 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold">Eligibility:</span>{" "}
                        {hackathon.eligibility}
                      </p>
                      <p>
                        <span className="font-semibold">Schedule:</span>{" "}
                        {dateLabel(hackathon.startDate)} –{" "}
                        {dateLabel(hackathon.endDate)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Prizes</h3>
                      {hackathon.prizes.length ? (
                        <ul className="mt-1 space-y-1 text-zinc-300">
                          {hackathon.prizes.map((prize) => (
                            <li key={`${prize.place}-${prize.description}`}>
                              {prize.place}: {prize.description}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-zinc-400">No prizes listed.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">Rules</h3>
                      {hackathon.rules.length ? (
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-300">
                          {hackathon.rules.map((rule, index) => (
                            <li key={`${index}-${rule}`}>{rule}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-zinc-400">No rules listed.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">Timeline</h3>
                      {hackathon.timeline.length ? (
                        <ol className="mt-1 space-y-2 text-zinc-300">
                          {hackathon.timeline
                            .slice()
                            .sort(
                              (first, second) =>
                                new Date(first.date).getTime() -
                                new Date(second.date).getTime()
                            )
                            .map((item, index) => (
                              <li key={`${index}-${item.title}`}>
                                <span className="font-medium">
                                  {dateLabel(item.date)} · {item.title}
                                </span>
                                {item.description && (
                                  <p className="text-zinc-400">
                                    {item.description}
                                  </p>
                                )}
                              </li>
                            ))}
                        </ol>
                      ) : (
                        <p className="mt-1 text-zinc-400">
                          No additional timeline events listed.
                        </p>
                      )}
                    </div>
                    {hackathon.resultsPublished &&
                      hackathon.results.length > 0 && (
                        <div>
                          <h3 className="font-semibold">Results</h3>
                          <ul className="mt-1 space-y-1 text-zinc-300">
                            {hackathon.results.map((result) => (
                              <li
                                key={`${result.place}-${result.teamName}`}
                              >
                                {result.place}: {result.teamName}
                                {result.projectName &&
                                  ` · ${result.projectName}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </details>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
