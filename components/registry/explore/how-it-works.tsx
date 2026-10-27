import Link from "next/link";
import { installCommand } from "@/content/components";
import { interactionHref } from "@/content/interactions";
import { CommandLine } from "../ui/copy-button";

const STEPS = [
  {
    title: "Find it by what it does",
    body: "Interactions are filed by purpose (selection, reveal, contextual actions) rather than by look, and every card is the real component, scaled down.",
  },
  {
    title: "Try it, then tune it",
    body: "Each page has the working interaction, the props worth changing, and a usage snippet that follows your changes.",
  },
  {
    title: "Own the source",
    body: "The shadcn CLI copies the component and its helpers into your project. Nothing to import from a package, nothing hidden.",
  },
];

/** The three steps, ending in a real install command for a real component. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="scroll-mt-16 border-t border-seam px-5 py-12 sm:px-8"
    >
      <h2 id="how-title" className="text-lg font-medium tracking-[-0.01em]">
        How it works
      </h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="flex flex-col gap-2 rounded-2xl border border-seam bg-deck p-5"
          >
            <span className="font-mono text-xs text-violet">0{i + 1}</span>
            <h3 className="text-[15px] font-medium">{s.title}</h3>
            <p className="text-sm leading-relaxed text-mist">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex max-w-2xl flex-col gap-2">
        <p className="text-sm text-mist">
          For example, the{" "}
          <Link
            href={interactionHref("physical-knob")}
            className="text-snow underline decoration-seam-2 underline-offset-4 hover:decoration-snow"
          >
            Physical Knob
          </Link>
          :
        </p>
        <CommandLine command={installCommand("physical-knob")} />
      </div>
    </section>
  );
}
