export function normalizeLabsCover(value: string): string {
  return value.trim().replace(/^\/?public\/uploads\//, '/uploads/').replace(/^uploads\//, '/uploads/');
}
