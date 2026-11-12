// Calls the protected admin route on the server. Only super admins are allowed through.
export async function adminData(action: string, params: Record<string, any> = {}): Promise<any> {
  const res = await fetch('/api/admin/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  })
  let json: any = {}
  try { json = await res.json() } catch { json = {} }
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json
}
