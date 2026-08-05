import type { TelemetryReading } from "@orbital/contracts";

const apiUrl = process.env.ORBITAL_API_URL ?? "http://localhost:3333/api/v1";
const assetId = process.env.GATEWAY_ASSET_ID ?? "press-01";
const intervalMs = Number(process.env.GATEWAY_INTERVAL_MS ?? 2000);

let tick = 0;

function simulate(): TelemetryReading {
  tick += 1;
  const stressCycle = tick % 30 > 22;

  return {
    assetId,
    timestamp: new Date().toISOString(),
    source: "simulator",
    temperatureC: Number((stressCycle ? 73 + Math.random() * 12 : 31 + Math.random() * 8).toFixed(2)),
    vibrationMmS: Number((stressCycle ? 9 + Math.random() * 4 : 1.5 + Math.random() * 2).toFixed(2)),
    currentA: Number((stressCycle ? 31 + Math.random() * 8 : 12 + Math.random() * 5).toFixed(2)),
    productionCount: tick
  };
}

async function publish() {
  const reading = simulate();

  try {
    const response = await fetch(`${apiUrl}/telemetry`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(reading)
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const health = await response.json();
    console.log(JSON.stringify({ event: "telemetry.published", health }));
  } catch (error) {
    console.error(JSON.stringify({
      event: "telemetry.failed",
      message: error instanceof Error ? error.message : String(error)
    }));
  }
}

console.log(`Orbital Gateway simulating ${assetId} every ${intervalMs}ms`);
void publish();
setInterval(() => void publish(), intervalMs);
