// api/listings.js  (CommonJS)

const MOCK_LISTINGS = [
    {
      id: "686c1c6a5b1db234c0c6113c",
      listingId: "ADV718972",
      companyId: "1",
      title: "Apartamento com 2 quartos à venda em Jardim Paraíso - SP",
      transactionType: "For Sale",
      propertyType: "Residential / Apartment",
      listPrice: 317991,
      bedrooms: 2,
      bathrooms: 1,
      garage: 1,
      city: "Jaguariúna",
      state: "SP",
      media:
        "https://betaimages.lopes.com.br/realestate/REO718972/6B8AC108A188E8374817336813BAE480.JPG",
      createdAt: "2025-07-07T19:13:45.909",
      updatedAt: "2025-07-10T17:56:27.435",
    },
  ];
  
  function decodeJwtPayload(jwt) {
    try {
      const base64 = jwt.split(".")[1];             // header.payload.signature
      const json = Buffer.from(base64, "base64url").toString("utf8");
      return JSON.parse(json);
    } catch (e) {
      return {};
    }
  }
  
  module.exports = async (req, res) => {
    // Habilita CORS para o Softr (opcional)
    res.setHeader("Access-Control-Allow-Origin", "*");
  
    const token = req.headers["x-softr-user-jwt"];
  
    /* ─────────────────────
       1) CHAMADA DO STUDIO
       ───────────────────── */
    if (!token) {
      // devolve mock → Softr cria o Schema automaticamente
      return res.status(200).json(MOCK_LISTINGS);
    }
  
    /* ─────────────────────
       2) CHAMADA REAL (APP)
       ───────────────────── */
    const payload = decodeJwtPayload(token);
    const companyId = payload.companyId || payload.company_id;
  
    if (!companyId) {
      return res.status(400).json({ error: "companyId não encontrado no JWT" });
    }
  
    const url = `https://apis.lopes.com.br/lead-broker/v1/advertiser/${companyId}`;
  
    const headers = {};
    if (process.env.INTERNAL_TOKEN) {
      headers.Authorization = `Bearer ${process.env.INTERNAL_TOKEN}`;
    }
  
    try {
      const backendRes = await fetch(url, { headers });
      const text = await backendRes.text();
      return res.status(backendRes.status).send(text);
    } catch (err) {
      console.error(err);
      return res
        .status(502)
        .json({ error: "proxy_error", detail: err.toString() });
    }
  };