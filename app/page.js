'use client'
import { useState, useEffect, useCallback } from 'react'

const SPORTS_PRESET = [
  { key: 'football', label: 'Brasileirão' },
  { key: 'football', label: 'Série B' },
  { key: 'football', label: 'Premier League' },
  { key: 'football', label: 'La Liga' },
  { key: 'football', label: 'Champions' },
  { key: 'football', label: 'MLS' },
  { key: 'football', label: 'Copa do Brasil' },
  { key: 'football', label: 'Libertadores' },
]

export default function Home() {
  const [sport, setSport] = useState('football')
  const [games, setGames] = useState([])
  const [selGame, setSelGame] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState('')

  const loadGames = useCallback(async (s) => {
    setLoading(true)
    setError('')
    setSelGame(null)

    try {
      const res = await fetch(`/api/odds?sport=${s}`)
      const json = await res.json()

      if (json.error) {
        setError(json.error)
        setGames([])
        return
      }

      setGames(json.data || [])
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    } catch (e) {
      setError('Erro ao buscar dados: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGames(sport)
  }, [sport, loadGames])

  const s = styles

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        {/* Topbar */}
        <div style={s.topbar}>
          <span style={s.topbarIcon}>📊</span>
          <span style={s.topbarTitle}>Odds Engine Pro</span>

          {lastUpdate && (
            <span style={s.topbarSub}>
              Atualizado às {lastUpdate}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          {SPORTS_PRESET.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => setSport(sp.key)}
              style={{
                ...s.tab,
                ...(sport === sp.key ? s.tabOn : {})
              }}
            >
              {sp.label}
            </button>
          ))}

          <button
            onClick={() => loadGames(sport)}
            style={s.refreshBtn}
          >
            ↻ Atualizar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={s.errBox}>
            {error}
          </div>
        )}

        {/* Games */}
        <div style={s.sectionLabel}>
          Jogos disponíveis
        </div>

        <div style={s.gamesList}>
          {loading && (
            <div style={s.loading}>
              Buscando jogos...
            </div>
          )}

          {!loading && games.length === 0 && !error && (
            <div style={s.loading}>
              Nenhum jogo encontrado.
            </div>
          )}

          {!loading && games.map((g) => {
            const dt = new Date(g.commence_time)

            const dateStr =
              dt.toLocaleDateString('pt-BR') +
              ' ' +
              dt.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })

            const isSel = selGame?.id === g.id

            return (
              <div
                key={g.id}
                onClick={() => setSelGame(g)}
                style={{
                  ...s.gameCard,
                  ...(isSel ? s.gameCardSel : {})
                }}
              >
                <div style={s.gameTeams}>
                  {g.home_team}
                  <span style={{ color: '#2a3a55' }}>
                    {' '}×{' '}
                  </span>
                  {g.away_team}
                </div>

                <div style={s.gameMeta}>
                  {dateStr}
                </div>
              </div>
            )
          })}
        </div>

        {/* Match Detail */}
        {selGame && (
          <div style={s.matchCard}>
            <div style={s.matchLeague}>
              {selGame.league || 'Football'}
            </div>

            <div style={s.matchRow}>
              <div style={s.teamBlock}>
                <div style={s.teamName}>
                  {selGame.home_team}
                </div>
              </div>

              <div style={s.vsBlock}>
                <div style={s.vsX}>×</div>
              </div>

              <div style={s.teamBlock}>
                <div style={s.teamName}>
                  {selGame.away_team}
                </div>
              </div>
            </div>

            {selGame.scores && (
              <div style={{
                textAlign: 'center',
                marginTop: 14,
                color: '#7d8ea9'
              }}>
                Placar:
                {' '}
                {selGame.scores.home ?? 0}
                {' - '}
                {selGame.scores.away ?? 0}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    background: '#0a0d14',
    minHeight: '100vh',
    padding: '20px 16px',
    fontFamily: 'system-ui, sans-serif'
  },

  wrap: {
    maxWidth: 860,
    margin: '0 auto',
    background: '#10131c',
    borderRadius: 14,
    overflow: 'hidden',
    color: '#e2e8f0'
  },

  topbar: {
    background: '#0d1018',
    borderBottom: '1px solid #1a2235',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },

  topbarIcon: {
    fontSize: 16
  },

  topbarTitle: {
    fontSize: 15,
    fontWeight: 600
  },

  topbarSub: {
    fontSize: 11,
    color: '#3d5070',
    marginLeft: 'auto'
  },

  tabRow: {
    display: 'flex',
    gap: 6,
    padding: '10px 14px 8px',
    flexWrap: 'wrap',
    borderBottom: '1px solid #1a2235'
  },

  tab: {
    padding: '5px 13px',
    borderRadius: 20,
    fontSize: 12,
    cursor: 'pointer',
    border: '1px solid #1e2840',
    background: 'transparent',
    color: '#4a6080'
  },

  tabOn: {
    background: '#1b3260',
    color: '#6fa0f5',
    borderColor: '#1b3260'
  },

  refreshBtn: {
    marginLeft: 'auto',
    padding: '5px 13px',
    borderRadius: 20,
    border: '1px solid #1e2840',
    background: 'transparent',
    color: '#4a6080',
    cursor: 'pointer'
  },

  errBox: {
    background: '#2d1515',
    border: '1px solid #5a2020',
    color: '#e87070',
    borderRadius: 8,
    padding: '9px 14px',
    margin: '8px 14px',
    fontSize: 12
  },

  sectionLabel: {
    fontSize: 10,
    color: '#2a3a55',
    textTransform: 'uppercase',
    letterSpacing: '.08em',
    padding: '10px 16px 5px'
  },

  gamesList: {
    padding: '0 14px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    maxHeight: 500,
    overflowY: 'auto'
  },

  loading: {
    textAlign: 'center',
    padding: '28px',
    color: '#2a3a55'
  },

  gameCard: {
    background: '#161c2e',
    border: '1px solid #1e2840',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'pointer'
  },

  gameCardSel: {
    borderColor: '#2255cc',
    background: '#111928'
  },

  gameTeams: {
    fontSize: 13,
    fontWeight: 500,
    color: '#d4ddf0'
  },

  gameMeta: {
    fontSize: 11,
    color: '#2a3a55',
    marginTop: 3
  },

  matchCard: {
    margin: '12px 14px 14px',
    background: '#161c2e',
    border: '1px solid #1e2840',
    borderRadius: 10,
    padding: 16
  },

  matchLeague: {
    fontSize: 10,
    color: '#2a3a55',
    textTransform: 'uppercase',
    marginBottom: 10
  },

  matchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  teamBlock: {
    textAlign: 'center',
    flex: 1
  },

  teamName: {
    fontSize: 15,
    fontWeight: 600
  },

  vsBlock: {
    flex: '0 0 80px',
    textAlign: 'center'
  },

  vsX: {
    fontSize: 22,
    color: '#1e2840'
  }
}
