// Maps region rows from the API to dropdown option format.
export function mapRegionOptions(rows = []) {
  return rows.map((row) => ({
    id: row.region,
    label: row.region,
  }));
}
