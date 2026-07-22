import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:soporte@cero-miedo.app", // puedes cambiar este correo por el tuyo
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default webpush;
