export default function LoadingSpinner({ size = "md" }) {
  const sizeClasses = {
    sm: "h-6 w-6 border-t font-semibold",
    md: "h-12 w-12 border-t-2",
    lg: "h-16 w-16 border-t-4"
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} border-b-2 border-orange-500`}></div>
    </div>
  );
}