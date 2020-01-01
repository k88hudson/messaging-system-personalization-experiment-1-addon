# Messaging System Personalization Experiment 1 Add-on

## What the add-on does

On a 60 minute schedule, the add-on fetches the latest ml model from remote settings, evaluates features and computes scores for each CFR message in the experiment.

The scores are persisted via preferences, which affects how often and which messages from the messaging system are displayed.

The evaluated features are sent via telemetry to a model training job so that the model gets improved over time.

## Seeing the add-on in action

See [TESTPLAN.md](./docs/TESTPLAN.md) for more details on how to get the add-on installed and tested.

## Data Collected / Telemetry Pings

See [TELEMETRY.md](./docs/TELEMETRY.md) for more details on what pings are sent by this add-on.

## Improving this add-on

See [DEV.md](./docs/DEV.md) for more details on how to work with this add-on as a developer.

## References

- [Experimenter](https://experimenter.services.mozilla.com/experiments/messaging-system-personalization-experiment-1-accounts/)
- [Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1594422)
