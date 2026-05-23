export async function GET() {
  const apiKey = process.env.ODDS_API_KEY

  if (!apiKey) {
    return Response.json({ error: 'API key não configurada no servidor.' }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`)
    if (!res.ok) {
      const err = await res.json()
      return Response.json({ error: err.message }, { status: res.status })
    }
    const data = await res.json()
    const soccer = data.filter(s => s.group === 'Soccer' && s.active)
    return Response.json({ data: soccer })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
