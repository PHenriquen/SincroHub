"use client";

import { useEffect, useState } from "react";
import type { AssetHealth, Incident } from "@orbital/contracts";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api/v1";

const initial: AssetHealth = {
  assetId: "press-01",
  score: 86,
  status: "healthy",
  evaluatedAt: new Date().toISOString(),
  reading: {
    assetId: "press-01",
    timestamp: new Date().toISOString(),
    source: "simulator",
    temperatureC: 34.2,
    vibrationMmS: 2.1,
    currentA: 14.8,
    productionCount: 1248
  }
};

export default function CommandCenter() {
  const [health, setHealth] = useState<AssetHealth>(initial);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [assetResponse, incidentResponse] = await Promise.all([
          fetch(`${apiUrl}/assets/press-01/latest`, { cache: "no-store" }),
          fetch(`${apiUrl}/incidents`, { cache: "no-store" })
        ]);

        if (assetResponse.ok) setHealth(await assetResponse.json());
        if (incidentResponse.ok) setIncidents(await incidentResponse.json());
        setConnected(assetResponse.ok);
      } catch {
        setConnected(false);
      }
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), 2000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main>
      <header>
        <div className="brand">
          <span className="mark"><i /><i /><i /></span>
          <div><strong>ORBITAL</strong><span>COMMAND</span></div>
        </div>
        <div className={connected ? "connection online" : "connection"}>
          <b /> {connected ? "CORE ONLINE" : "DEMO MODE"}
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">OPERATIONAL OVERVIEW</p>
          <h1>Everything in orbit.<br />One place in command.</h1>
          <p className="subtitle">Telemetria, incidentes e automações reunidos em uma única visão operacional.</p>
        </div>
        <div className="orbit" aria-label="Orbital Command core">
          <div className="ring ringOne" />
          <div className="ring ringTwo" />
          <div className="core">{health.score}<small>HEALTH</small></div>
          <span className="satellite s1" />
          <span className="satellite s2" />
          <span className="satellite s3" />
        </div>
      </section>

      <section className="grid">
        <article className="wide">
          <div className="cardTitle"><span>ASSET / PRESS-01</span><em className={health.status}>{health.status}</em></div>
          <div className="metrics">
            <Metric label="TEMPERATURA" value={health.reading.temperatureC} unit="°C" />
            <Metric label="VIBRAÇÃO" value={health.reading.vibrationMmS} unit="mm/s" />
            <Metric label="CORRENTE" value={health.reading.currentA} unit="A" />
            <Metric label="PRODUÇÃO" value={health.reading.productionCount ?? 0} unit="un." />
          </div>
        </article>

        <article>
          <div className="cardTitle"><span>INCIDENTS</span><em>{incidents.length}</em></div>
          {incidents.length === 0 ? (
            <div className="empty"><b>NO ACTIVE INCIDENTS</b><span>Todos os sistemas estão dentro dos limites.</span></div>
          ) : incidents.slice(0, 3).map((incident) => (
            <div className="incident" key={incident.id}>
              <b>{incident.title}</b>
              <span>Health {incident.healthScore} · {incident.status}</span>
            </div>
          ))}
        </article>

        <article>
          <div className="cardTitle"><span>MISSION LOG</span><em>LIVE</em></div>
          <ul className="log">
            <li><time>NOW</time> Telemetry evaluated for {health.assetId}</li>
            <li><time>CORE</time> Health model synchronized</li>
            <li><time>SYS</time> Gateway source: {health.reading.source}</li>
          </ul>
        </article>
      </section>
    </main>
  );
}

function Metric({ label, value, unit }: { label: string; value: number; unit: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{unit}</small></div>;
}
