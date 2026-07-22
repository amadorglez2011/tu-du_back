import Subscription from "../models/Subscription.js";
import webpush from "../utils/webpush.js";

// Guarda (o actualiza) la suscripción push de este dispositivo/navegador
export async function subscribe(req, res) {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: "Suscripción inválida." });
    }

    await Subscription.findOneAndUpdate(
      { endpoint },
      { user: req.userId, endpoint, keys },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ message: "Suscripción guardada." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en el servidor, BROTHER." });
  }
}

// Elimina la suscripción de este dispositivo (por ejemplo, al desactivar notificaciones)
export async function unsubscribe(req, res) {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ message: "Falta el endpoint." });
    }
    await Subscription.deleteOne({ endpoint, user: req.userId });
    return res.json({ message: "Suscripción eliminada." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en el servidor, BROTHER." });
  }
}

// Envía una notificación de prueba a todos los dispositivos suscritos del usuario actual
export async function sendTestNotification(req, res) {
  try {
    const subs = await Subscription.find({ user: req.userId });

    if (subs.length === 0) {
      return res.status(404).json({ message: "No tienes dispositivos suscritos." });
    }

    const payload = JSON.stringify({
      title: "Cero Miedo 👋",
      body: "Así se ven tus notificaciones. ¡Todo listo!",
      url: "/dashboard",
    });

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        )
      )
    );

    // Si alguna suscripción ya expiró (410/404), la borramos para no reintentar en vano
    await Promise.all(
      results.map(async (r, i) => {
        if (r.status === "rejected" && (r.reason?.statusCode === 410 || r.reason?.statusCode === 404)) {
          await Subscription.deleteOne({ _id: subs[i]._id });
        }
      })
    );

    return res.json({ message: "Notificación de prueba enviada." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en el servidor, BROTHER." });
  }
}

// Función reutilizable para mandar notificaciones a un usuario desde cualquier
// parte del backend (por ejemplo, recordatorios de tareas más adelante).
export async function sendNotificationToUser(userId, { title, body, url = "/dashboard" }) {
  const subs = await Subscription.find({ user: userId });
  const payload = JSON.stringify({ title, body, url });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
    )
  );

  await Promise.all(
    results.map(async (r, i) => {
      if (r.status === "rejected" && (r.reason?.statusCode === 410 || r.reason?.statusCode === 404)) {
        await Subscription.deleteOne({ _id: subs[i]._id });
      }
    })
  );
}
