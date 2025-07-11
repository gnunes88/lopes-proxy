import { jwtVerify } from 'jose';          // npm i jose

export default async (req, res) => {
  // ── 0. Bypass p/ Softr Studio (sem usuário logado)
  const token = req.headers['x-softr-user-jwt'] as string | undefined;
  if (!token) return res.status(200).json({ ok: true, listings: [] });

  // ── 1. Extrai companyId do JWT
  const { payload } = await jwtVerify(token, new TextEncoder().encode(''));
  const companyId = payload.companyId || payload.companyid;

  // ── 2. Chama seu backend interno
  const url = `https://apis.lopes.com.br/lead-broker/v1/advertiser/${companyId}`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.INTERNAL_TOKEN}` }
  });

  // ── 3. Devolve resultado
  res.status(r.status).send(await r.text());
};