import Image from "next/image";
import Link from "next/link";

const events = [
  {
    id: 1,
    title: "Solaris Music Festival 2024",
    location: "Central Park, NYC",
    date: "AUG 15",
    tag: "MUSIC",
    tagColor: "bg-purple-500",
    price: "$89.00",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80",
  },
  {
    id: 2,
    title: "Knicks vs. Lakers: Season Opener",
    location: "Madison Square Garden",
    date: "AUG 12",
    tag: "SPORTS",
    tagColor: "bg-green-500",
    price: "$145.00",
    image: "https://images.unsplash.com/photo-1504450758481-7338bbe75c8e?w=600&q=80",
  },
  {
    id: 3,
    title: "Midnight Jazz: Summer Series",
    location: "Blue Note Jazz Club",
    date: "AUG 18",
    tag: "MUSIC",
    tagColor: "bg-purple-500",
    price: "$45.00",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80",
  },
  {
    id: 4,
    title: "Phantom of the Opera: 2024 Tour",
    location: "Broadway, Theater",
    date: "SEP 05",
    tag: "THEATER",
    tagColor: "bg-orange-500",
    price: "$120.00",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80",
  },
];

export default function UpcomingEvents() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Upcoming Events</h2>
          <p className="mt-1 text-sm text-zinc-500">Discover the hottest events in your city</p>
        </div>
        <Link
          href="/events"
          className="flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          View All
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="group overflow-hidden rounded-2xl border border-white/5 bg-card-bg transition-all duration-300 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Date Badge */}
              <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 backdrop-blur-sm">
                <span className="text-xs font-bold text-white">{event.date}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Tag */}
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white ${event.tagColor}`}>
                {event.tag}
              </span>

              {/* Title */}
              <h3 className="mt-2 text-sm font-semibold text-white line-clamp-2">
                {event.title}
              </h3>

              {/* Location */}
              <div className="mt-1.5 flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span className="text-xs text-zinc-500">{event.location}</span>
              </div>

              {/* Price + CTA */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-white">{event.price}</span>
                <Link
                  href="#"
                  className="rounded-full border border-accent/50 px-3 py-1 text-xs font-semibold text-accent transition-all hover:bg-accent hover:text-white"
                >
                  Get Tickets
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
