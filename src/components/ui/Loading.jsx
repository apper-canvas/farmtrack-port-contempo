import { cn } from "@/utils/cn";

const Loading = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "space-y-4",
    card: "space-y-6 p-6",
    list: "space-y-3",
    table: "space-y-2"
  };

  if (variant === "card") {
    return (
      <div className={cn("animate-pulse", variants[variant], className)} {...props}>
        <div className="h-4 bg-gray-200 rounded w-3/4 shimmer"></div>
        <div className="h-8 bg-gray-200 rounded shimmer"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded shimmer"></div>
          <div className="h-4 bg-gray-200 rounded shimmer"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2 shimmer"></div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("animate-pulse", variants[variant], className)} {...props}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-gray-200 rounded-full shimmer"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 shimmer"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 shimmer"></div>
            </div>
            <div className="w-20 h-6 bg-gray-200 rounded shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("animate-pulse", variants[variant], className)} {...props}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b">
            <div className="h-4 bg-gray-200 rounded w-1/4 shimmer"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6 shimmer"></div>
            <div className="h-4 bg-gray-200 rounded w-1/8 shimmer"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5 shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse", variants[variant], className)} {...props}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 shimmer"></div>
            <div className="h-8 bg-gray-200 rounded mb-4 shimmer"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded shimmer"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 shimmer"></div>
            </div>
            <div className="mt-4 flex justify-between">
              <div className="h-6 bg-gray-200 rounded w-20 shimmer"></div>
              <div className="h-6 bg-gray-200 rounded w-16 shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;