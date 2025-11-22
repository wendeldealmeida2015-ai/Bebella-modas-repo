import express from "express";
import dotenv from "dotenv";
import mercadopago from "mercadopago";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Configure Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

app.get("/", (req, res) => res.send("Bebella Modas - Backend Mercado Pago OK"));

// Create payment preference (Checkout Pro)
app.post("/create_payment", async (req, res) => {
  try {
    const { items, delivery, payment_method } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items required" });
    }

    const preference = {
      items: items.map(it => ({
        title: it.title,
        quantity: it.quantity,
        currency_id: "BRL",
        unit_price: Number(it.unit_price)
      })),
      external_reference: (new Date()).getTime().toString(),
      back_urls: {
        success: process.env.MP_BACKURL_SUCCESS || "https://www.mercadopago.com.br",
        failure: process.env.MP_BACKURL_FAILURE || "https://www.mercadopago.com.br",
        pending: process.env.MP_BACKURL_PENDING || "https://www.mercadopago.com.br"
      },
      notification_url: `${process.env.BACKEND_URL}/mp_webhook`,
      metadata: {
        delivery: delivery || "Retirada na loja",
        payment_method_requested: payment_method || "any"
      }
    };

    const mpResponse = await mercadopago.preferences.create(preference);
    return res.json({
      init_point: mpResponse.body.init_point,
      sandbox_init_point: mpResponse.body.sandbox_init_point,
      preference_id: mpResponse.body.id
    });

  } catch (err) {
    console.error("create_payment error:", err);
    return res.status(500).json({ error: "Falha ao criar preferência" });
  }
});

// Webhook for Mercado Pago notifications
app.post("/mp_webhook", async (req, res) => {
  try {
    const topic = req.query.topic || req.body.topic || req.query.type;
    const id = req.query.id || req.body.id || req.body.data?.id;

    console.log("MP webhook received:", { topic, id, body: req.body });

    if (!id) {
      return res.status(400).send("no id");
    }

    const mpPayment = await mercadopago.payment.findById(id);
    const payment = mpPayment.body || mpPayment;

    console.log("Payment status:", payment.status, "payment:", payment);

    if (payment.status === "approved") {
      console.log("Pagamento aprovado para order:", payment.external_reference);
    }

    return res.status(200).send("ok");
  } catch (err) {
    console.error("mp_webhook error:", err);
    return res.status(500).send("error");
  }
});

app.get("/payment/:id", async (req, res) => {
  try {
    const mpPayment = await mercadopago.payment.findById(req.params.id);
    return res.json(mpPayment.body || mpPayment);
  } catch (err) {
    return res.status(500).json({ error: "erro" });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
