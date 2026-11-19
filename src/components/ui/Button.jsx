export default function Button({ className = "", ...props }) {
  return (
    <button
      className={`h-11 w-full cursor-pointer rounded-lg bg-accent px-4 font-semibold text-on-accent transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${className}`}
      {...props}
    />
  );
}
