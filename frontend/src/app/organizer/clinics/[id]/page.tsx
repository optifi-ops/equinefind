import { redirect } from "next/navigation";

export default function ClinicManageRedirect({ params }: { params: { id: string } }) {
  redirect(`/account/clinics/${params.id}`);
}
