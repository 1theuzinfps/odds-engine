export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport')
  const apiKey = process.env.ODDS_API_KEY

  if (!apiKey) {
    return Response.json({ error: 'API key não configurada no servidor.' }, { status: 500 })
  }

  if (!sport) {
    return Response.json({ error: 'Parâmetro sport é obrigatório.' }, { status: 400 })
  }

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`
    const res = await fetch(url)

    if (!res.ok) {
      const err = await res.json()
      return Response.json({ error: err.message || 'Erro na The Odds API' }, { status: res.status })
    }

    const data = await res.json()

    const remaining = res.headers.get('x-requests-remaining')
    const used = res.headers.get('x-requests-used')

    return Response.json({ data, remaining, used })
  } catch (e) {
    return Response.json({ error: 'Erro interno: ' + e.message }, { status: 500 })
  }
}
