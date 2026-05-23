export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport')
  const apiKey = process.env.ODDS_API_KEY

  if (!apiKey) {
    return Response.json(
      { error: 'API key não configurada no servidor.' },
      { status: 500 }
    )
  }

  if (!sport) {
    return Response.json(
      { error: 'Parâmetro sport é obrigatório.' },
      { status: 400 }
    )
  }

  try {
    const url = `https://api.odds-api.io/v3/events?sport=${sport}&apiKey=${apiKey}`

    const res = await fetch(url, {
      cache: 'no-store'
    })

    if (!res.ok) {
      const err = await res.json()
      return Response.json(
        { error: err.error || 'Erro na Odds API' },
        { status: res.status }
      )
    }

    const data = await res.json()

    // Converte formato da Odds-api.io para o formato esperado pelo app
    const formattedData = data.map(match => ({
      id: match.id,
      home_team: match.home,
      away_team: match.away,
      commence_time: match.date,
      bookmakers: [],
      league: match.league?.name || '',
      scores: match.scores || {}
    }))

    return Response.json({
      data: formattedData
    })
  } catch (e) {
    return Response.json(
      { error: 'Erro interno: ' + e.message },
      { status: 500 }
    )
  }
}
