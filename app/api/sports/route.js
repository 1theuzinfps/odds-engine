export async function GET() {
  return Response.json({
    data: [
      { key: 'football', title: 'Football', group: 'Soccer' }
    ]
  })
}
