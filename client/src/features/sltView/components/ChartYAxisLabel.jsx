export function ChartYAxisLabel({ label }) {
  return (
    <div className="absolute font-semibold -left-12 top-[40%] -translate-y-1/2 -rotate-90 text-md font-medium text-muted-foreground">
      {label}
    </div>
  );
}
