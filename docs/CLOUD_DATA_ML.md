# Cloud, Data Engineering and ML

SincroHub is the portfolio project responsible for large-scale backend concerns: telemetry ingestion, asynchronous processing, observability, cloud infrastructure and analytical models.

## Data pipeline

The intended production flow is:

```text
Sensors / webhooks / simulators
        |
        v
Gateway -> API ingestion -> queue/stream -> workers -> operational storage
                                  |                |
                                  |                +-> rules/incidents
                                  |
                                  +-> window aggregation -> analytics/model -> anomaly event
                                                        |
                                                        +-> cold archive / historical analysis
```

`apps/api/src/data/window-aggregator.ts` implements the first executable aggregation primitive. It groups telemetry into deterministic time windows and produces averages/maxima consumed by analytics.

A future distributed implementation can preserve the same contract while replacing in-memory execution with Redis Streams, Kafka, SQS/Kinesis or another queue/stream platform.

## Trainable anomaly detection

`apps/api/src/analytics/anomaly-detector.ts` contains a small statistical model trained from a healthy baseline. It learns mean and standard deviation for temperature, vibration and current, then produces a weighted anomaly score.

This gives the project a transparent ML lifecycle:

```text
healthy telemetry -> fit baseline -> model snapshot -> inference -> anomaly score -> incident
```

The simple model is deliberate: it is explainable and easy to test. Later experiments may compare Isolation Forest, one-class models or time-series approaches without hiding the baseline behind a black box.

## AWS / Infrastructure as Code

`infra/terraform/` introduces a real Terraform-managed AWS foundation:

- ECR repositories for API and web containers;
- image scanning on push;
- encrypted S3 telemetry archive;
- public-access blocking;
- lifecycle transition for historical telemetry;
- CloudWatch log groups for API and workers.

The next cloud milestone is intentionally separate from the foundation commit:

1. VPC and private subnets;
2. ECS/Fargate services for API, web and workers;
3. RDS PostgreSQL;
4. ElastiCache/Redis or a managed queue;
5. load balancer and TLS;
6. GitHub Actions OIDC deployment without long-lived AWS keys;
7. OpenTelemetry export and alarms.

## Cost and safety

Terraform files describe infrastructure but do not deploy it automatically. Running `terraform apply` can create billable AWS resources. Cloud deployment should use a dedicated development account/budget and least-privilege IAM.

No credentials, access keys or production secrets belong in the repository.

## Portfolio coverage

This layer lets SincroHub demonstrate, in one coherent system:

- backend and APIs;
- streaming/data engineering;
- trainable analytics/ML;
- cloud infrastructure;
- containers and CI/CD;
- observability;
- security-conscious infrastructure design.
