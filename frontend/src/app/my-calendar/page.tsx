import { redirect } from "next/navigation";

export default function MyCalendarRedirect() {
  redirect("/account/events");
}
