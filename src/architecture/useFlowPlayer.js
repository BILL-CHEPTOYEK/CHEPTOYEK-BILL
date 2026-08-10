import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FLOWS, stepEndpoints } from "./model.js";

/** How long a packet takes to cross a wire, and how long it rests afterwards. */
export const TRAVEL_MS = 950;
const DWELL_MIN_MS = 1400;
const DWELL_PER_CHAR_MS = 13;
const DWELL_MAX_MS = 5200;

/** Longer narration gets longer on screen — autoplay should be readable. */
function dwellFor(step) {
  const estimate = DWELL_MIN_MS + (step?.text?.length ?? 0) * DWELL_PER_CHAR_MS;
  return Math.min(DWELL_MAX_MS, estimate);
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const onChange = (event) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Drives flow playback.
 *
 * Deliberately holds only discrete state — which flow, which step, playing or
 * not. The packet's position between steps is animated by the renderer against
 * its own clock, so nothing here updates at frame rate and the diagram
 * re-renders once per step rather than sixty times a second.
 */
export function useFlowPlayer({ initialFlowId = null, initialStep = null, autoplay = true } = {}) {
  // A deep link that names a step wants that step, not a replay from the top,
  // so arriving with one starts paused.
  const [flowId, setFlowId] = useState(() =>
    FLOWS.some((flow) => flow.id === initialFlowId) ? initialFlowId : null
  );
  const [stepIndex, setStepIndex] = useState(() => {
    const flow = FLOWS.find((candidate) => candidate.id === initialFlowId);
    if (!flow || initialStep === null) return 0;
    return Math.max(0, Math.min(flow.steps.length - 1, initialStep));
  });
  const [playing, setPlaying] = useState(
    () => autoplay && Boolean(flowId) && initialStep === null
  );
  const timer = useRef(null);

  const flow = useMemo(() => FLOWS.find((f) => f.id === flowId) ?? null, [flowId]);
  // Stable identity: `?? []` would otherwise hand out a fresh array each render
  // and invalidate every memo downstream of it.
  const steps = useMemo(() => flow?.steps ?? [], [flow]);
  const step = steps[stepIndex] ?? null;
  const lastIndex = steps.length - 1;

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  // Autoplay: one timeout per step rather than a running interval, so a manual
  // step or a pause always lands on a clean boundary.
  useEffect(() => {
    clearTimer();
    if (!playing || !step) return;

    timer.current = setTimeout(() => {
      if (stepIndex < lastIndex) setStepIndex((i) => i + 1);
      else setPlaying(false);
    }, TRAVEL_MS + dwellFor(step));

    return clearTimer;
  }, [playing, stepIndex, lastIndex, step]);

  useEffect(() => clearTimer, []);

  const selectFlow = useCallback((id) => {
    setFlowId((current) => {
      const next = current === id ? null : id;
      setStepIndex(0);
      setPlaying(next !== null);
      return next;
    });
  }, []);

  const goTo = useCallback((index) => {
    setStepIndex(index);
    setPlaying(false);
  }, []);

  const next = useCallback(() => {
    setPlaying(false);
    setStepIndex((i) => Math.min(lastIndex, i + 1));
  }, [lastIndex]);

  const prev = useCallback(() => {
    setPlaying(false);
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const toggle = useCallback(() => {
    if (!flow) return;
    // Pressing play on a finished flow restarts it rather than doing nothing.
    setPlaying((wasPlaying) => {
      if (!wasPlaying && stepIndex === lastIndex) setStepIndex(0);
      return !wasPlaying;
    });
  }, [flow, stepIndex, lastIndex]);

  const exit = useCallback(() => {
    setFlowId(null);
    setStepIndex(0);
    setPlaying(false);
  }, []);

  /** Nodes the flow has reached so far — everything else dims. */
  const visited = useMemo(() => {
    const set = new Set();
    steps.slice(0, stepIndex + 1).forEach((s) => {
      const { from, to } = stepEndpoints(s);
      set.add(from);
      set.add(to);
    });
    return set;
  }, [steps, stepIndex]);

  /** Edges already traversed, drawn as "lit" behind the current one. */
  const traversed = useMemo(
    () => new Set(steps.slice(0, stepIndex + 1).map((s) => s.edge)),
    [steps, stepIndex]
  );

  const arrivedAt = step ? stepEndpoints(step).to : null;

  return {
    flow,
    flowId,
    steps,
    step,
    stepIndex,
    lastIndex,
    playing,
    visited,
    traversed,
    arrivedAt,
    // Restarts the renderer's animation clock whenever the step changes.
    stepKey: `${flowId}:${stepIndex}`,
    selectFlow,
    goTo,
    next,
    prev,
    toggle,
    exit,
  };
}
