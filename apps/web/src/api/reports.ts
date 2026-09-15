const API_URL = import.meta.env.VITE_API_URL;

export function getBoletimUrl(studentId: number) {
  return `${API_URL}/reports/boletim/${studentId}`;
}

export function getFinanceiroUrl() {
  return `${API_URL}/reports/financeiro`;
}
