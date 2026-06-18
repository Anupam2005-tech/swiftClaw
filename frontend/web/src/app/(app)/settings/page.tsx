import { redirect } from "next/navigation";

export default function SettingsBasePage() {
  redirect("/settings/api-keys");
}
