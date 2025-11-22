import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// Rota de teste
app.get("/", (req, res) => res.send("Backend Bebella Modas - OK"));

// Criar pagamento
app.post("/create_payment", async (req, res) => {
  try {
    const { items, delivery, payment_method } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items required" });
    }

    const preference = {
      items: items.map((it) => ({
        title: it.title,
        quantity: it.quantity,
        currency_id: "BRL",
        unit_price: Number(it.unit_price)
      })),
      back_urls: {
        success: process.env.MP_BACKURL_SUCCESS,
        failure: process.env.MP_BACKURL_FAILURE,
        pending: process.env.MP_BACKURL_PENDING
      },
      notification_url: `${process.env.BACKEND_URL}/mp_webhook`,
      metadata: {
        delivery,
        payment_method_requested: payment_method || "any"
      }
    };

    const pref = new Preference(client);
    const mpResponse = await pref.create({ body: preference });

    return res.json({
      init_point: mpResponse.init_point,
      sandbox_init_point: mpResponse.sandbox_init_point,
      preference_id: mpResponse.id
    });

  } catch (err) {
    console.error("create_payment error:", err);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

// Webhook
app.post("/mp_webhook", async (req, res) => {
  try {
    const topic = req.query.topic || req.body.topic || req.body.type;
    const id =
      req.query.id ||
      req.body.id ||
      req.body.data?.id;

    if (!id) return res.status(400).send("no id");

    const pay = new Payment(client);
    const mpPayment = await pay.get({ id });

    console.log("Pagamento:", mpPayment.status);

    return res.sendStatus(200);

  } catch (err) {
    console.error("webhook error:", err);
    return res.sendStatus(500);
  }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
