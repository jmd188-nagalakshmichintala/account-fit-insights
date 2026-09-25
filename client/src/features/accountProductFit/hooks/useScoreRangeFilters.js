import { useState, useCallback, useMemo } from "react";

/**
 * Owns the advanced-filters range/toggle state (compliance/safety/fleet-size
 * ranges, top100/prospect/existing toggles, trend selects) and derives the
 * `scoreRanges` API params from it.
 */
export function useScoreRangeFilters(onChange) {
  const [complianceAssetRange, setComplianceAssetRangeState] = useState([
    0, 10,
  ]);
  const [complianceDriverRange, setComplianceDriverRangeState] = useState([
    0, 10,
  ]);
  const [safetyRange, setSafetyRangeState] = useState([0, 10]);
  const [fleetSizeRange, setFleetSizeRangeState] = useState([0, 10000]);
  // The real upper bound, synced once `useMaxFleetSize` resolves (see
  // `setFleetSizeMax` below). Kept separate from the hardcoded 10000 default
  // above so that sync — which isn't a user-applied filter — doesn't get
  // mistaken for one by the `fleetSizeRange[1] < fleetSizeMax` check below.
  const [fleetSizeMax, setFleetSizeMaxState] = useState(10000);
  const [top100Only, setTop100OnlyState] = useState(null);
  const [prospectAccountsOnly, setProspectAccountsOnlyState] = useState(null);
  const [existingAccountsOnly, setExistingAccountsOnlyState] = useState(null);
  const [complianceAssetTrend, setComplianceAssetTrendState] = useState(null);
  const [complianceDriverTrend, setComplianceDriverTrendState] = useState(null);
  const [safetyTrend, setSafetyTrendState] = useState(null);

  const scoreRanges = useMemo(() => {
    const ranges = {};
    if (complianceAssetRange[0] !== 0 || complianceAssetRange[1] !== 10) {
      ranges.complianceAssetMin = complianceAssetRange[0];
      ranges.complianceAssetMax = complianceAssetRange[1];
    }
    if (complianceDriverRange[0] !== 0 || complianceDriverRange[1] !== 10) {
      ranges.complianceDriverMin = complianceDriverRange[0];
      ranges.complianceDriverMax = complianceDriverRange[1];
    }
    if (safetyRange[0] !== 0 || safetyRange[1] !== 10) {
      ranges.safetyMin = safetyRange[0];
      ranges.safetyMax = safetyRange[1];
    }
    if (fleetSizeRange[0] > 0 || fleetSizeRange[1] < fleetSizeMax) {
      ranges.fleetSizeMin = fleetSizeRange[0];
      ranges.fleetSizeMax = fleetSizeRange[1];
    }
    if (top100Only === true) {
      ranges.isTop100Only = "true";
    }
    if (prospectAccountsOnly === true) {
      ranges.isProspectAccountOnly = "true";
    }
    if (existingAccountsOnly === true) {
      ranges.isExistingAccountOnly = "true";
    }
    if (complianceAssetTrend)
      ranges.complianceAssetTrend = complianceAssetTrend;
    if (complianceDriverTrend)
      ranges.complianceDriverTrend = complianceDriverTrend;
    if (safetyTrend) ranges.safetyTrend = safetyTrend;
    return ranges;
  }, [
    complianceAssetRange,
    complianceDriverRange,
    safetyRange,
    fleetSizeRange,
    fleetSizeMax,
    top100Only,
    prospectAccountsOnly,
    existingAccountsOnly,
    complianceAssetTrend,
    complianceDriverTrend,
    safetyTrend,
  ]);

  const setComplianceAssetRange = useCallback(
    (value) => {
      setComplianceAssetRangeState(value);
      onChange();
    },
    [onChange],
  );

  const setComplianceDriverRange = useCallback(
    (value) => {
      setComplianceDriverRangeState(value);
      onChange();
    },
    [onChange],
  );

  const setSafetyRange = useCallback(
    (value) => {
      setSafetyRangeState(value);
      onChange();
    },
    [onChange],
  );

  const setFleetSizeRange = useCallback(
    (value) => {
      setFleetSizeRangeState(value);
      onChange();
    },
    [onChange],
  );

  // Syncs the slider's known upper bound once `useMaxFleetSize` resolves.
  // Unlike `setFleetSizeRange`, this isn't a user-applied filter — it must
  // not call `onChange()` (which would reset pagination) and must move
  // `fleetSizeMax` in lockstep with `fleetSizeRange` so the "is a filter
  // active" check above doesn't fire for it.
  const setFleetSizeMax = useCallback((max) => {
    setFleetSizeMaxState(max);
    setFleetSizeRangeState((prev) => (prev[1] === max ? prev : [0, max]));
  }, []);

  const setTop100Only = useCallback(
    (value) => {
      setTop100OnlyState(value);
      onChange();
    },
    [onChange],
  );

  const setProspectAccountsOnly = useCallback(
    (value) => {
      setProspectAccountsOnlyState(value);
      if (value) setExistingAccountsOnlyState(null);
      onChange();
    },
    [onChange],
  );

  const setExistingAccountsOnly = useCallback(
    (value) => {
      setExistingAccountsOnlyState(value);
      if (value) setProspectAccountsOnlyState(null);
      onChange();
    },
    [onChange],
  );

  const setComplianceAssetTrend = useCallback(
    (value) => {
      setComplianceAssetTrendState(value || null);
      onChange();
    },
    [onChange],
  );

  const setComplianceDriverTrend = useCallback(
    (value) => {
      setComplianceDriverTrendState(value || null);
      onChange();
    },
    [onChange],
  );

  const setSafetyTrend = useCallback(
    (value) => {
      setSafetyTrendState(value || null);
      onChange();
    },
    [onChange],
  );

  const handleClearAll = useCallback((maxFleetSize = 10000) => {
    setComplianceAssetRangeState([0, 10]);
    setComplianceDriverRangeState([0, 10]);
    setSafetyRangeState([0, 10]);
    setFleetSizeRangeState([0, maxFleetSize]);
    setFleetSizeMaxState(maxFleetSize);
    setTop100OnlyState(null);
    setProspectAccountsOnlyState(null);
    setExistingAccountsOnlyState(null);
    setComplianceAssetTrendState(null);
    setComplianceDriverTrendState(null);
    setSafetyTrendState(null);
  }, []);

  return useMemo(
    () => ({
      complianceAssetRange,
      setComplianceAssetRange,
      complianceDriverRange,
      setComplianceDriverRange,
      safetyRange,
      setSafetyRange,
      fleetSizeRange,
      setFleetSizeRange,
      fleetSizeMax,
      setFleetSizeMax,
      top100Only,
      setTop100Only,
      prospectAccountsOnly,
      setProspectAccountsOnly,
      existingAccountsOnly,
      setExistingAccountsOnly,
      complianceAssetTrend,
      setComplianceAssetTrend,
      complianceDriverTrend,
      setComplianceDriverTrend,
      safetyTrend,
      setSafetyTrend,
      scoreRanges,
      handleClearAll,
    }),
    [
      complianceAssetRange,
      setComplianceAssetRange,
      complianceDriverRange,
      setComplianceDriverRange,
      safetyRange,
      setSafetyRange,
      fleetSizeRange,
      setFleetSizeRange,
      fleetSizeMax,
      setFleetSizeMax,
      top100Only,
      setTop100Only,
      prospectAccountsOnly,
      setProspectAccountsOnly,
      existingAccountsOnly,
      setExistingAccountsOnly,
      complianceAssetTrend,
      setComplianceAssetTrend,
      complianceDriverTrend,
      setComplianceDriverTrend,
      safetyTrend,
      setSafetyTrend,
      scoreRanges,
      handleClearAll,
    ],
  );
}
