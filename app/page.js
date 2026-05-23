'use client'
import { useState, useEffect, useCallback } from 'react'

const SPORTS_PRESET = [
  { key: 'soccer_brazil_campeonato', label: 'Brasileirão' },
  { key: 'soccer_brazil_serie_b', label: 'Série B' },
  { key: 'soccer_epl', label: 'Premier League' },
  { key: 'soccer_spain_la_liga', label: 'La Liga' },
  { key: 'soccer_uefa_champs_league', label: 'Champions' },
  { key: 'soccer_usa_mls', label: 'MLS' },
  { key: 'soccer_brazil_copa_do_brasil', label: 'Copa do Brasil' },
  { key: 'soccer_conmebol_copa_libertadores', label: 'Libertadores' },
]

export default function Home() {
  const [sport, setSport] = useState('soccer_brazil_campeonato')
  const [games, setGames] = useState([])
  const [selGame, setSelGame] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortCol, setSortCol] = useState('away')
  const [stake, setStake] = useState(100)
  const [remaining, setRemaining] = useState(null)
  const [lastUpdate, setLastUpdate] = useState('')

  const loadGames = useCallback(async (s) => {
    setLoading(true)
    setError('')
    setSelGame(null)
    try {
      const res = await fetch(`/api/odds?sport=${s}`)
      const json = await res.json()
      if (json.error) { setError(json.error); setGames([]); return }
      setGames(json.data || [])
      if (json.remaining) setRemaining(json.remaining)
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    } catch (e) {
      setError('Erro ao buscar dados: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadGames(sport) }, [sport, loadGames])

  const getBest = (game) => {
    const best = { home: { odd: 0, book: '' }, draw: { odd: 0, book: '' }, away: { odd: 0, book: '' } }
    if (!game?.bookmakers) return best
    game.bookmakers.forEach(b => {
      const m = b.markets?.find(x => x.key === 'h2h')
      if (!m) return
      const h = m.outcomes.find(o => o.name === game.home_team)
      const d = m.outcomes.find(o => o.name === 'Draw')
      const a = m.outcomes.find(o => o.name === game.away_team)
      if (h?.price > best.home.odd) best.home = { odd: h.price, book: b.title }
      if (d?.price > best.draw.odd) best.draw = { odd: d.price, book: b.title }
      if (a?.price > best.away.odd) best.away = { odd: a.price, book: b.title }
    })
    return best
  }

  const getRows = (game) => {
    if (!game?.bookmakers) return []
    return game.bookmakers.map(b => {
      const m = b.markets?.find(x => x.key === 'h2h')
      if (!m) return null
      const h = m.outcomes.find(o => o.name === game.home_team)
      const d = m.outcomes.find(o => o.name === 'Draw')
      const a = m.outcomes.find(o => o.name === game.away_team)
      return { book: b.title, home: h?.price || null, draw: d?.price || null, away: a?.price || null }
    }).filter(Boolean)
  }

  const best = selGame ? getBest(selGame) : { home: { odd: 0, book: '' }, draw: { odd: 0, book: '' }, away: { odd: 0, book: '' } }
  const rows = selGame ? getRows(selGame) : []
  const sortedRows = [...rows].sort((a, b) => (b[sortCol] || 0) - (a[sortCol] || 0))

  const getRank = (book, col) => [...rows].sort((a, b) => (b[col] || 0) - (a[col] || 0)).map(r => r.book).indexOf(book)

  const inv = (best.home.odd ? 1 / best.home.odd : 0) + (best.draw.odd ? 1 / best.draw.odd : 0) + (best.away.odd ? 1 / best.away.odd : 0)
  const margin = inv ? (inv - 1) * 100 : 0
  const isSure = margin < 0
  const retorno = inv ? stake / inv : 0
  const lucro = retorno - stake

  const stakeH = inv && best.home.odd ? (stake * (1 / best.home.odd)) / inv : 0
  const stakeD = inv && best.draw.odd ? (stake * (1 / best.draw.odd)) / inv : 0
  const stakeA = inv && best.away.odd ? (stake * (1 / best.away.odd)) / inv : 0

  const s = styles

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        {/* Topbar */}
        <div style={s.topbar}>
          <span style={s.topbarIcon}>📊</span>
          <span style={s.topbarTitle}>Odds Engine Pro</span>
          {remaining && <span style={s.topbarSub}>{remaining} req restantes hoje</span>}
          {lastUpdate && <span style={s.topbarSub}>· {lastUpdate}</span>}
        </div>

        {/* Sport tabs */}
        <div style={s.tabRow}>
          {SPORTS_PRESET.map(sp => (
            <button key={sp.key} onClick={() => setSport(sp.key)}
              style={{ ...s.tab, ...(sport === sp.key ? s.tabOn : {}) }}>
              {sp.label}
            </button>
          ))}
          <button onClick={() => loadGames(sport)} style={s.refreshBtn}>↻ Atualizar</button>
        </div>

        {/* Error */}
        {error && <div style={s.errBox}>{error}</div>}

        {/* Games list */}
        <div style={s.sectionLabel}>Jogos disponíveis</div>
        <div style={s.gamesList}>
          {loading && <div style={s.loading}>Buscando jogos...</div>}
          {!loading && games.length === 0 && !error && <div style={s.loading}>Nenhum jogo encontrado para este esporte.</div>}
          {!loading && games.map((g, i) => {
            const dt = new Date(g.commence_time)
            const dateStr = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            const isSel = selGame?.id === g.id
            return (
              <div key={g.id} onClick={() => setSelGame(g)}
                style={{ ...s.gameCard, ...(isSel ? s.gameCardSel : {}) }}>
                <div style={s.gameTeams}>{g.home_team} <span style={{ color: '#2a3a55' }}>×</span> {g.away_team}</div>
                <div style={s.gameMeta}>{dateStr}<span style={s.gameBadge}>{g.bookmakers?.length || 0} casas</span></div>
              </div>
            )
          })}
        </div>

        {/* Match detail */}
        {selGame && (
          <>
            {/* Match header */}
            <div style={s.matchCard}>
              <div style={s.matchLeague}>{selGame.sport_title || 'Futebol'}</div>
              <div style={s.matchRow}>
                <div style={s.teamBlock}>
                  <div style={s.teamName}>{selGame.home_team}</div>
                </div>
                <div style={s.vsBlock}>
                  <div style={s.vsX}>×</div>
                  <div style={{ ...s.marginBadge, ...(isSure ? s.marginPos : s.marginNeg) }}>
                    {margin.toFixed(2)}%
                  </div>
                  <div style={s.marginLabel}>margem</div>
                </div>
                <div style={s.teamBlock}>
                  <div style={s.teamName}>{selGame.away_team}</div>
                </div>
              </div>
            </div>

            {/* Dutching calculator */}
            <div style={s.dutchCard}>
              <div style={s.dutchHd}>🧮 Calculadora Dutching <span style={{ color: '#2a3a55', fontWeight: 400 }}>— melhores odds disponíveis</span></div>
              <div style={s.dutchCols}>
                {[
                  { lbl: 'Casa (1)', book: best.home.book, odd: best.home.odd, sk: stakeH },
                  { lbl: 'Empate (X)', book: best.draw.book, odd: best.draw.odd, sk: stakeD },
                  { lbl: 'Fora (2)', book: best.away.book, odd: best.away.odd, sk: stakeA },
                ].map(col => (
                  <div key={col.lbl} style={s.dutchCol}>
                    <div style={s.dColLbl}>{col.lbl}</div>
                    <div style={s.dColBook}>{col.book}</div>
                    <div style={s.dColOdd}>{col.odd ? col.odd.toFixed(2) : '-'}</div>
                    <div style={s.dColStake}><span style={{ color: '#2a3a55', fontSize: 10, marginRight: 3 }}>STAKE</span>R$ {col.sk.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div style={s.dutchFoot}>
                <div style={s.stakeRow}>
                  <span style={s.stakeLbl}>Stake Total: R$</span>
                  <input type="number" value={stake} min={1} onChange={e => setStake(Number(e.target.value))}
                    style={s.stakeInp} />
                </div>
                <div style={s.dStats}>
                  <div style={s.dStat}><div style={s.dStatL}>Retorno</div><div style={s.dStatV}>R$ {retorno.toFixed(2)}</div></div>
                  <div style={s.dStat}><div style={s.dStatL}>Lucro</div><div style={{ ...s.dStatV, color: lucro >= 0 ? '#4abe80' : '#e87070' }}>R$ {lucro.toFixed(2)}</div></div>
                  <div style={s.dStat}><div style={s.dStatL}>Margem</div>
                    <div style={{ ...s.marginPill, ...(isSure ? s.marginPos : s.marginNeg) }}>{margin.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Odds table */}
            <div style={s.tblCard}>
              <div style={s.tblHd}>Odds por casa <span style={{ color: '#1a2840' }}>— clique no cabeçalho para ordenar</span></div>
              <table style={s.tbl}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: '34%', textAlign: 'left' }}>Casa</th>
                    {[
                      { col: 'home', label: `${selGame.home_team.split(' ')[0]} (1)` },
                      { col: 'draw', label: 'Empate (X)' },
                      { col: 'away', label: `${selGame.away_team.split(' ')[0]} (2)` },
                    ].map(({ col, label }) => (
                      <th key={col} onClick={() => setSortCol(col)}
                        style={{ ...s.th, width: '22%', textAlign: 'center', cursor: 'pointer' }}>
                        {label} {sortCol === col ? '↓' : '↕'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map(row => (
                    <tr key={row.book} style={s.tr}>
                      <td style={{ ...s.td, color: '#7888a4', fontSize: 13 }}>↗ {row.book}</td>
                      {['home', 'draw', 'away'].map(col => {
                        const rank = getRank(row.book, col)
                        const val = row[col]
                        return (
                          <td key={col} style={{ ...s.td, textAlign: 'center' }}>
                            {val ? (
                              <span style={{
                                ...s.oddVal,
                                ...(rank === 0 ? s.oddBest : rank === 1 ? s.oddSec : {})
                              }}>{val.toFixed(2)}</span>
                            ) : '-'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { background: '#0a0d14', minHeight: '100vh', padding: '20px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' },
  wrap: { maxWidth: 860, margin: '0 auto', background: '#10131c', borderRadius: 14, overflow: 'hidden', color: '#e2e8f0' },
  topbar: { background: '#0d1018', borderBottom: '1px solid #1a2235', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 },
  topbarIcon: { fontSize: 16 },
  topbarTitle: { fontSize: 15, fontWeight: 600, color: '#e2e8f0' },
  topbarSub: { fontSize: 11, color: '#3d5070', marginLeft: 'auto' },
  tabRow: { display: 'flex', gap: 6, padding: '10px 14px 8px', flexWrap: 'wrap', borderBottom: '1px solid #1a2235' },
  tab: { padding: '5px 13px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid #1e2840', background: 'transparent', color: '#4a6080' },
  tabOn: { background: '#1b3260', color: '#6fa0f5', borderColor: '#1b3260' },
  refreshBtn: { marginLeft: 'auto', padding: '5px 13px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid #1e2840', background: 'transparent', color: '#4a6080' },
  errBox: { background: '#2d1515', border: '1px solid #5a2020', color: '#e87070', borderRadius: 8, padding: '9px 14px', margin: '8px 14px', fontSize: 12 },
  sectionLabel: { fontSize: 10, color: '#2a3a55', textTransform: 'uppercase', letterSpacing: '.08em', padding: '10px 16px 5px' },
  gamesList: { padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto', marginBottom: 4 },
  loading: { textAlign: 'center', padding: '28px', color: '#2a3a55', fontSize: 13 },
  gameCard: { background: '#161c2e', border: '1px solid #1e2840', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' },
  gameCardSel: { borderColor: '#2255cc', background: '#111928' },
  gameTeams: { fontSize: 13, fontWeight: 500, color: '#d4ddf0' },
  gameMeta: { fontSize: 11, color: '#2a3a55', marginTop: 3 },
  gameBadge: { display: 'inline-block', background: '#111e38', color: '#4a7ad4', fontSize: 10, padding: '1px 7px', borderRadius: 8, marginLeft: 8 },
  matchCard: { margin: '12px 14px 0', background: '#161c2e', border: '1px solid #1e2840', borderRadius: 10, padding: 16 },
  matchLeague: { fontSize: 10, color: '#2a3a55', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 },
  matchRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  teamBlock: { textAlign: 'center', flex: 1 },
  teamName: { fontSize: 15, fontWeight: 600, color: '#e2e8f0' },
  vsBlock: { textAlign: 'center', flex: '0 0 80px' },
  vsX: { fontSize: 20, color: '#1e2840', fontWeight: 400 },
  marginBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginTop: 4 },
  marginLabel: { fontSize: 9, color: '#2a3a55', marginTop: 2 },
  marginNeg: { background: '#4a1010', color: '#e87070' },
  marginPos: { background: '#0c3020', color: '#50d090' },
  dutchCard: { margin: '10px 14px 0', background: '#161c2e', border: '1px solid #1e2840', borderRadius: 10, padding: 14 },
  dutchHd: { fontSize: 12, color: '#7888a4', fontWeight: 500, marginBottom: 11 },
  dutchCols: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 },
  dutchCol: { background: '#0d1018', border: '1px solid #1a2235', borderRadius: 8, padding: '10px 12px' },
  dColLbl: { fontSize: 10, color: '#2a3a55', textTransform: 'uppercase', letterSpacing: '.06em' },
  dColBook: { fontSize: 11, color: '#2255cc', margin: '3px 0 5px' },
  dColOdd: { fontSize: 26, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 },
  dColStake: { fontSize: 13, color: '#4abe80', marginTop: 5 },
  dutchFoot: { display: 'flex', alignItems: 'center', marginTop: 12, gap: 16, flexWrap: 'wrap' },
  stakeRow: { display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' },
  stakeLbl: { fontSize: 13, color: '#5a6880' },
  stakeInp: { background: '#0d1018', border: '1px solid #1e2840', borderRadius: 7, padding: '5px 9px', color: '#e2e8f0', fontSize: 16, fontWeight: 600, width: 90, outline: 'none', textAlign: 'center' },
  dStats: { display: 'flex', gap: 18 },
  dStat: { textAlign: 'right' },
  dStatL: { fontSize: 10, color: '#2a3a55', textTransform: 'uppercase' },
  dStatV: { fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginTop: 1 },
  marginPill: { display: 'inline-block', padding: '2px 10px', borderRadius: 10, fontSize: 13, fontWeight: 600 },
  tblCard: { margin: '10px 14px 16px', background: '#161c2e', border: '1px solid #1e2840', borderRadius: 10, overflow: 'hidden' },
  tblHd: { background: '#0d1018', padding: '8px 14px', fontSize: 11, color: '#3d5070', borderBottom: '1px solid #1a2235' },
  tbl: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
  th: { background: '#0d1018', color: '#2a3a55', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', padding: '9px 12px', borderBottom: '1px solid #1a2235' },
  tr: {},
  td: { padding: '9px 12px', borderBottom: '1px solid #131928', fontSize: 13 },
  oddVal: { display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 15, fontWeight: 600, color: '#d0daf0' },
  oddBest: { background: '#0c3020', color: '#4abe80' },
  oddSec: { color: '#e8a840' },
}
