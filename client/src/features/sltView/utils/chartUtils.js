function calculateNiceInterval(rawMax, gridLineCount) {
  const rawInterval = rawMax / gridLineCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
  const normalized = rawInterval / magnitude;

  let niceNormalized;
  if (normalized <= 1) {
    niceNormalized = 1;
  } else if (normalized <= 2) {
    niceNormalized = 2;
  } else if (normalized <= 2.5) {
    niceNormalized = 2.5;
  } else if (normalized <= 5) {
    niceNormalized = 5;
  } else {
    niceNormalized = 10;
  }

  return niceNormalized * magnitude;
}

export function calculateNiceYAxisMax(rawMax, gridLineCount = 7) {
  const paddedMax = rawMax * 1.1;
  const interval = calculateNiceInterval(paddedMax, gridLineCount);
  return interval * gridLineCount;
}

export function transformChartData(data, isArrMode) {
  if (!data || data.length === 0) return [];

  return data.map((rep) => {
    if (isArrMode) {
      return {
        initials: rep.initials,
        ownerName: rep.ownerName,
        ownerEmail: rep.ownerEmail, // needed by the bar click-through to call the drilldown API
        high: rep.highArr || 0,
        mid: rep.midArr || 0,
        low: rep.lowArr || 0,
        highScores: rep.highArrScores || {},
        midScores: rep.midArrScores || {},
        lowScores: rep.lowArrScores || {},
        total: (rep.highArr || 0) + (rep.midArr || 0) + (rep.lowArr || 0),
      };
    }

    return {
      initials: rep.initials,
      ownerName: rep.ownerName,
      ownerEmail: rep.ownerEmail,
      high: rep.high || 0,
      mid: rep.mid || 0,
      low: rep.low || 0,
      highScores: rep.highScores || {},
      midScores: rep.midScores || {},
      lowScores: rep.lowScores || {},
      total: (rep.high || 0) + (rep.mid || 0) + (rep.low || 0),
    };
  });
}

export function calculateMaxValue(chartData, isArrMode) {
  const max = Math.max(...chartData.map((d) => d.total), 1);
  const minValue = isArrMode ? 10000 : 10;
  const rawMax = Math.max(max, minValue);
  return calculateNiceYAxisMax(rawMax);
}

export function formatChartValue(value, isArrMode) {
  if (!isArrMode) return Math.round(value);

  if (value >= 1000000) {
    const millions = value / 1000000;
    return millions % 1 === 0 ? `$${millions}M` : `$${millions.toFixed(1)}M`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return thousands % 1 === 0 ? `$${thousands}K` : `$${thousands.toFixed(1)}K`;
  }
  return `$${Math.round(value)}`;
}
