import { SearchBar } from "@/components/SearchBar";
import { DisciplineChips } from "@/components/DisciplineChips";
import { HomepageEvents } from "@/components/HomepageEvents";
import { HomeEventTypeToggle } from "@/components/HomeEventTypeToggle";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-border py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="font-display text-4xl text-charcoal leading-tight">
            Every horse show,<br />in one place.
          </h1>
          <p className="text-lg text-slate max-w-xl mx-auto">
            Search recognized competitions and schooling shows for eventing, dressage, show jumping, and hunters near you.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Discipline quick-filter */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-6 space-y-3">
          <h2 className="font-display text-2xl text-charcoal">Browse by discipline</h2>
          <DisciplineChips />
        </div>

        {/* Event type toggle */}
        <HomeEventTypeToggle />

        {/* Near-you events */}
        <HomepageEvents />
      </section>
    </div>
  );
}
