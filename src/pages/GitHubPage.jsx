import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const USERNAME = "BILL-CHEPTOYEK";
const CHART_COLORS = ["#171717", "#404040", "#737373", "#a3a3a3", "#d4d4d4", "#e5e5e5"];

export default function GitHubPage() {
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [profileRes, reposRes] = await Promise.all([
          axios.get(`https://api.github.com/users/${USERNAME}`),
          axios.get(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`),
        ]);
        if (cancelled) return;
        setProfile(profileRes.data);
        setRepos(reposRes.data.filter((repo) => !repo.fork));
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const languageCounts = repos.reduce((acc, repo) => {
    if (!repo.language) return acc;
    acc[repo.language] = (acc[repo.language] || 0) + 1;
    return acc;
  }, {});
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/home"
          className="text-xs tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          ← Home
        </Link>

        <h1 className="mt-8 text-4xl md:text-5xl font-normal font-heathergreen text-neutral-900">
          GitHub
        </h1>
        <p className="mt-3 text-neutral-500">A live look at what I'm building.</p>

        {status === "loading" && (
          <p className="mt-14 text-sm text-neutral-400">Loading GitHub data…</p>
        )}
        {status === "error" && (
          <p className="mt-14 text-sm text-red-500">
            Couldn't reach GitHub right now. Try again shortly.
          </p>
        )}

        {status === "ready" && profile && (
          <>
            <div className="mt-14 flex items-center gap-5">
              <img
                src={profile.avatar_url}
                alt={profile.name || profile.login}
                className="w-16 h-16 rounded-full border border-neutral-200"
              />
              <div>
                <p className="text-lg font-medium text-neutral-900">{profile.name || profile.login}</p>
                {profile.bio && <p className="text-sm text-neutral-500">{profile.bio}</p>}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center border-y border-neutral-200 py-6">
              <Stat label="Repos" value={profile.public_repos} />
              <Stat label="Followers" value={profile.followers} />
              <Stat label="Following" value={profile.following} />
            </div>

            <div className="mt-14">
              <img
                src={`https://ghchart.rshah.org/171717/${USERNAME}`}
                alt="GitHub contribution graph"
                className="w-full rounded-lg border border-neutral-200"
                loading="lazy"
              />
              <p className="mt-2 text-[11px] tracking-[0.15em] uppercase text-neutral-300">
                Contribution activity
              </p>
            </div>

            {topLanguages.length > 0 && (
              <div className="mt-14 grid sm:grid-cols-2 gap-8 items-center">
                <div className="max-w-[220px] mx-auto">
                  <Doughnut
                    data={{
                      labels: topLanguages.map(([lang]) => lang),
                      datasets: [
                        {
                          data: topLanguages.map(([, count]) => count),
                          backgroundColor: CHART_COLORS,
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{ plugins: { legend: { display: false } } }}
                  />
                </div>
                <ul className="space-y-2">
                  {topLanguages.map(([lang, count], i) => (
                    <li key={lang} className="flex items-center gap-3 text-sm text-neutral-600">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: CHART_COLORS[i] }}
                      />
                      {lang}
                      <span className="ml-auto text-neutral-400 tabular-nums">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-14">
              <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-6">
                Recent repositories
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {topRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block border border-neutral-200 rounded-xl p-5 hover:border-neutral-400 transition-colors"
                  >
                    <p className="font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                      {repo.name}
                    </p>
                    {repo.description && (
                      <p className="mt-1.5 text-sm text-neutral-500 line-clamp-2">{repo.description}</p>
                    )}
                    <p className="mt-3 text-xs text-neutral-400 flex items-center gap-3">
                      {repo.language && <span>{repo.language}</span>}
                      <span>★ {repo.stargazers_count}</span>
                    </p>
                  </a>
                ))}
              </div>
            </div>

            <a
              href={`https://github.com/${USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-14 inline-block text-sm font-medium text-neutral-900 border-b border-neutral-900 hover:text-neutral-500 hover:border-neutral-300 transition-colors"
            >
              View full profile ↗
            </a>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-2xl font-heathergreen text-neutral-900">{value}</p>
      <p className="mt-1 text-[11px] tracking-[0.15em] uppercase text-neutral-400">{label}</p>
    </div>
  );
}
