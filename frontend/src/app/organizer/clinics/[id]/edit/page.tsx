import { redirect } from "next/navigation";

export default function ClinicEditRedirect({ params }: { params: { id: string } }) {
  redirect(`/account/clinics/${params.id}/edit`);
}
