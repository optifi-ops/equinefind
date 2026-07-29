import { redirect } from "next/navigation";

export default function NewClinicRedirect() {
  redirect("/account/clinics/new");
}
