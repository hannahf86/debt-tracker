import { FREE_ADVICE } from "@/lib/templates";

/** Free debt advice links — shown wherever someone is working up to getting in touch. */
export default function AdviceLinks({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-sage-500 leading-relaxed ${className}`}>
      Want to talk it through first? Free, confidential debt advice is available
      from{" "}
      {FREE_ADVICE.map((adviser, i) => (
        <span key={adviser.name}>
          {i > 0 && (i === FREE_ADVICE.length - 1 ? " and " : ", ")}
          <a
            href={adviser.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand hover:underline"
          >
            {adviser.name}
          </a>
        </span>
      ))}
      .
    </p>
  );
}
