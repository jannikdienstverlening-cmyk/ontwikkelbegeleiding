export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.redirect(302, '/');
  }

  // Honeypot spam check
  if (req.body?.website) {
    return res.redirect(302, '/bedankt');
  }

  const naam     = String(req.body?.naam     || '').trim().slice(0, 120);
  const telefoon = String(req.body?.telefoon || '').trim().slice(0, 30);
  const email    = String(req.body?.email    || '').trim().slice(0, 180);
  const leeftijd = String(req.body?.leeftijd || '').trim().slice(0, 30);
  const pgb      = String(req.body?.pgb      || '').trim().slice(0, 40);
  const bericht  = String(req.body?.bericht  || '').trim().slice(0, 1500);
  const bron     = req.headers['referer'] || '';

  if (!naam || !telefoon || !bericht) {
    return res.redirect(302, '/contact?fout=1#formulier');
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Ontwikkel Begeleiding <onboarding@resend.dev>',
      to: 'jannikklumpenaar@gmail.com',
      subject: `Nieuw bericht via Ontwikkel Begeleiding: ${naam}`,
      html: `
        <h2 style="color:#2E6645;">Nieuw bericht via ontwikkelbegeleiding.nl</h2>
        <table style="border-collapse:collapse;width:100%;max-width:560px;">
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;width:140px;">Naam</td><td style="padding:8px 12px;">${naam}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">Telefoon</td><td style="padding:8px 12px;">${telefoon}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">E-mail</td><td style="padding:8px 12px;">${email || '-'}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">Leeftijd kind</td><td style="padding:8px 12px;">${leeftijd || '-'}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">PGB-situatie</td><td style="padding:8px 12px;">${pgb || '-'}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;vertical-align:top;">Bericht</td><td style="padding:8px 12px;">${bericht.replace(/\n/g, '<br>')}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">Bron</td><td style="padding:8px 12px;color:#888;font-size:12px;">${bron || '-'}</td></tr>
        </table>
        <p style="margin-top:24px;color:#888;font-size:12px;">Verstuurd via ontwikkelbegeleiding.nl</p>
      `,
    }),
  }).catch(err => console.error('Resend fout:', err));

  return res.redirect(302, '/bedankt');
}
