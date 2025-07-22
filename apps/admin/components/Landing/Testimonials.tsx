"use client";

const testimonials = [
  {
    name: "Ishaan Verma",
    username: "@ishaan",
    body: "This platform completely changed the way we hire. The AI interviewer is brilliant!",
    img: "https://avatar.vercel.sh/ishaan",
  },
  {
    name: "Ananya Rao",
    username: "@ananya",
    body: "Incredibly intuitive! Scheduling and reviewing interviews became 10x faster.",
    img: "https://avatar.vercel.sh/ananya",
  },
  {
    name: "Samar Singh",
    username: "@samar",
    body: "Great platform. The real-time transcription and scoring is top notch.",
    img: "https://avatar.vercel.sh/samar",
  },
  {
    name: "Meera Kapoor",
    username: "@meera",
    body: "Loved the automation. It reduced our manual screening effort by 80%.",
    img: "https://avatar.vercel.sh/meera",
  },
  {
    name: "Arjun Mehta",
    username: "@arjun",
    body: "The UI is sleek and the AI interview felt like a real human evaluator!",
    img: "https://avatar.vercel.sh/arjun",
  },
  {
    name: "Sneha Das",
    username: "@sneha",
    body: "This platform is now an essential tool in our hiring process!",
    img: "https://avatar.vercel.sh/sneha",
  },
];

const TestimonialCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-white shadow-sm backdrop-blur-md hover:bg-white/10 transition duration-300">
      <div className="flex items-center gap-4">
        <img
          src={img}
          alt={name}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h4 className="text-base font-semibold">{name}</h4>
          <p className="text-sm text-white/60">{username}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-white/90 italic">“{body}”</p>
    </div>
  );
};

export default function Testimonials() {
  return (
    <section className="w-full bg-gradient-to-br from-black via-gray-950 to-green-950 py-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">What Our Users Say</h2>
        <p className="text-muted-foreground mb-10 text-sm md:text-base">
          Trusted by hiring teams across companies and startups
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.username} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
