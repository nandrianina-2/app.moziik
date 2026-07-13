import { Schema, models, model, Types } from "mongoose";

export type NotificationType =
  | "new_song"      // un artiste suivi publie un son
  | "new_follower"  // nouvel abonné
  | "comment"       // commentaire sur un son de l'utilisateur
  | "event"         // nouvel évènement d'un artiste suivi
  | "payment"       // confirmation / échec de paiement
  | "system";       // annonce de la plateforme

export interface INotification {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string; // ex: /son/:id, /evenements/:id
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: {
    type: String,
    enum: ["new_song", "new_follower", "comment", "event", "payment", "system"],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default models.Notification || model<INotification>("Notification", NotificationSchema);
