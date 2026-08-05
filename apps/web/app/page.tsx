"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AssetHealth, CommandCenterSnapshot, Incident, IncidentStatus } from "@orbital/contracts";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api/v1";
const demoHealth: AssetHealth = {
  assetId: "press-01", score: 86, status: "healthy", evaluatedAt: new Date().toISOString(),
  reading: { assetId: "press-01", timestamp: new Date().toISOString(), source: "simulator", temperatureC: 34.2, vibrationMmS: 2.1, currentA: 14.8, productionCount: 1248 }
};
const demo: CommandCenterSnapshot = {
  assets: [{ id: "press-01", name: "Hydraulic Press 01", kind: "machine", location: "Assembly / Line A", status: "online", health: demoHealth }],
  incidents: [], automations: [], generatedAt: new Date().toISOString()
};

export default function CommandCenter() {
  const [snapshot, setSnapshot] = useState(demo);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState<string>();

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/command-center`, { cache: "no-store" });
      if (!response.ok) throw new Error("Core unavailable");
      setSnapshot(await response.json());
      setConnected(true);
    } catch { setConnected(false); }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 2000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const primary = snapshot.assets[0]?.health ?? demoHealth;
  const active = snapshot.incidents.filter((incident) => incident.status !== "resolved");
  const operational = useMemo(() => Math.max(0, 100 - active.length * 4), [active.length]);

  async function transition(incident: Incident, status: Exclude<IncidentStatus, "open">) {
    setBusy(incident.id);
    try {
      const response = await fetch(`${apiUrl}/incidents/${incident.id}`, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, actor: "Operations Lead", assignee: "Operations Lead" })
      });
      if (response.ok) await refresh();
    } finally { setBusy(undefined); }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <Brand compact />
        <nav aria-label="Main navigation">
          <NavIcon active label="Command" glyph="⌁" />
          <NavIcon label="Assets" glyph="◇" />
          <NavIcon label="Incidents" glyph="!" badge={active.length} />
          <NavIcon label="Automations" glyph="↯" />
          <NavIcon label="Integrations" glyph="⌘" />
        </nav>
        <div className="sidebarFoot"><span>OC</span></div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <Brand />
          <div className="topActions">
            <div className={connected ? "coreStatus online" : "coreStatus"}><i />{connected ? "CORE ONLINE" : "SIMULATION MODE"}</div>
            <button className="iconButton" aria-label="Notifications">⌁</button>
            <div className="avatar">PN</div>
          </div>
        </header>

        <section className="welcome">
          <div><p className="eyebrow">MISSION CONTROL / OVERVIEW</p><h1>Good evening, Pedro.</h1><p>All operational signals, incidents and responses in one orbit.</p></div>
          <time>{new Date(snapshot.generatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</time>
        </section>

        <section className="kpis">
          <Kpi label="OPERATIONAL HEALTH" value={`${operational}%`} trend="Stable across all systems" tone="cyan" />
          <Kpi label="ACTIVE INCIDENTS" value={String(active.length).padStart(2, "0")} trend={active.length ? "Response required" : "No action required"} tone={active.length ? "red" : "green"} />
          <Kpi label="ASSETS ONLINE" value={`${snapshot.assets.filter((asset) => asset.status === "online").length}/${snapshot.assets.length}`} trend="Gateways synchronized" tone="blue" />
          <Kpi label="AUTOMATIONS" value={String(snapshot.automations.length).padStart(2, "0")} trend="Successful executions" tone="violet" />
        </section>

        <section className="commandGrid">
          <article className="healthPanel panel">
            <PanelTitle title="ASSET HEALTH" meta={`${primary.assetId.toUpperCase()} / LIVE`} />
            <div className="healthBody">
              <div className={`orbitalGauge ${primary.status}`}>
                <span className="orbitLine one" /><span className="orbitLine two" /><span className="orbitDot d1" /><span className="orbitDot d2" />
                <div className="gaugeCore"><strong>{primary.score}</strong><small>HEALTH INDEX</small></div>
              </div>
              <div className="sensorList">
                <Sensor label="Temperature" value={primary.reading.temperatureC} unit="°C" progress={primary.reading.temperatureC} />
                <Sensor label="Vibration" value={primary.reading.vibrationMmS} unit="mm/s" progress={primary.reading.vibrationMmS * 8} />
                <Sensor label="Current" value={primary.reading.currentA} unit="A" progress={primary.reading.currentA * 2.5} />
                <Sensor label="Production" value={primary.reading.productionCount ?? 0} unit="units" progress={76} />
              </div>
            </div>
          </article>

          <article className="incidentPanel panel">
            <PanelTitle title="INCIDENT QUEUE" meta={`${active.length} ACTIVE`} />
            {active.length === 0 ? <div className="emptyState"><span>✓</span><strong>ORBIT STABLE</strong><p>No active incidents. The command core is monitoring every signal.</p></div> :
              active.slice(0, 3).map((incident) => <IncidentRow key={incident.id} incident={incident} busy={busy === incident.id} onTransition={transition} />)}
          </article>

          <article className="activityPanel panel">
            <PanelTitle title="MISSION LOG" meta="LIVE FEED" />
            <div className="activity">
              <Log tone="cyan" label="Telemetry evaluated" detail={`${primary.assetId} · health ${primary.score}`} time="NOW" />
              {snapshot.automations.slice(0, 2).map((item) => <Log key={item.id} tone="violet" label="Automation executed" detail={item.rule} time="AUTO" />)}
              <Log tone="blue" label="Gateway synchronized" detail={`Source · ${primary.reading.source}`} time="CORE" />
            </div>
          </article>

          <article className="integrationPanel panel">
            <PanelTitle title="CONNECTED SYSTEMS" meta="3 SOURCES" />
            <div className="integrations"><System name="Sensor Gateway" code="GW" active /><System name="Webhooks" code="WH" active /><System name="Team Channels" code="TC" /></div>
          </article>
        </section>
      </div>
    </main>
  );
}

function Brand({ compact = false }: { compact?: boolean }) { return <div className={compact ? "brand compact" : "brand"}><span className="logoMark"><i /><i /><i /><b /></span>{!compact && <div><strong>ORBITAL</strong><span>COMMAND</span></div>}</div>; }
function NavIcon({ label, glyph, active, badge }: { label: string; glyph: string; active?: boolean; badge?: number }) { return <button title={label} className={active ? "navIcon active" : "navIcon"}><span>{glyph}</span>{badge ? <b>{badge}</b> : null}</button>; }
function Kpi({ label, value, trend, tone }: { label: string; value: string; trend: string; tone: string }) { return <article className={`kpi ${tone}`}><span>{label}</span><strong>{value}</strong><small><i />{trend}</small></article>; }
function PanelTitle({ title, meta }: { title: string; meta: string }) { return <div className="panelTitle"><strong>{title}</strong><span>{meta}</span></div>; }
function Sensor({ label, value, unit, progress }: { label: string; value: number; unit: string; progress: number }) { return <div className="sensor"><div><span>{label}</span><b>{value} <small>{unit}</small></b></div><i><b style={{ width: `${Math.min(100, progress)}%` }} /></i></div>; }
function IncidentRow({ incident, busy, onTransition }: { incident: Incident; busy: boolean; onTransition: (i: Incident, s: "acknowledged" | "resolved") => void }) { const next = incident.status === "open" ? "acknowledged" : "resolved"; return <div className="incidentRow"><i /><div><strong>{incident.title}</strong><span>{incident.assetId} · health {incident.healthScore} · {incident.status}</span></div><button disabled={busy} onClick={() => onTransition(incident, next)}>{busy ? "…" : next === "acknowledged" ? "ASSUME" : "RESOLVE"}</button></div>; }
function Log({ tone, label, detail, time }: { tone: string; label: string; detail: string; time: string }) { return <div className="logEntry"><i className={tone} /><div><strong>{label}</strong><span>{detail}</span></div><time>{time}</time></div>; }
function System({ name, code, active = false }: { name: string; code: string; active?: boolean }) { return <div className="system"><b>{code}</b><span>{name}<small>{active ? "SYNCHRONIZED" : "READY TO CONNECT"}</small></span><i className={active ? "active" : ""} /></div>; }
