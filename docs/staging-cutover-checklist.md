# Staging Cutover Checklist

Each item below is validated on staging (via the ALB URL from `terraform output
alb_dns_name`) before being considered "moved to AWS." Work top to bottom —
each item only depends on the ones above it being done.

## Phase 1 — Foundations (infra already stood up by this plan)
- [ ] Confirm `php artisan migrate` ran cleanly against Aurora (Task 8 pipeline)
- [ ] Confirm sessions persist across requests (login, refresh, still logged in) — proves Redis session driver works
- [ ] Upload a file via the file-manager module, confirm it lands in the
      `femi9-staging-uploads` S3 bucket (`aws s3 ls s3://femi9-staging-uploads --profile billing-staging`)

## Phase 2 — Core billing flows
- [ ] Party creation (company portal) — confirm auto-generated mobile-number
      password flow still works against Aurora
- [ ] Party portal login — confirm `partyAuth` session works via Redis
- [ ] Invoice creation + PDF generation — confirm the job runs via the Redis
      queue driver (`QUEUE_CONNECTION=redis`) instead of synchronously
- [ ] Party list/overview pages — spot-check the resizable columns and
      two-pane overview still render correctly served from the container build

## Phase 3 — Comms (needs SES/SNS added to Terraform — not yet in this plan)
- [ ] Wire real SES sending, confirm invoice email delivery (currently
      `MAIL_MAILER=log` on staging until this is added)
- [ ] Wire SNS/Pinpoint, confirm OTP SMS delivery for password reset

## Phase 4 — Everything else
- [ ] Chat module — flag as needing the API Gateway WebSocket work from the
      architecture doc; not covered by this plan
- [ ] Super-admin subscriptions/packages pages — smoke test against Aurora
- [ ] Reports module — spot check any heavy report query's latency on
      `db.serverless` at the 0.5–2 ACU range; raise `max_capacity` in
      `aurora.tf` if a report times out

## Rollback
If any phase breaks staging, `aws ecs update-service --cluster
femi9-staging-cluster --service femi9-staging-app --task-definition
<previous-task-def-arn> --force-new-deployment` rolls the service back to the
last-known-good image without touching Terraform state.
