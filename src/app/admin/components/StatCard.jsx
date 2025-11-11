"use client";

export default function StatCard({ title, value, icon: Icon, trend, color = "orange" }) {
  const colorClasses = {
    orange: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    green: "bg-green-500/10 border-green-500/30 text-green-400",
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-orange-500/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend > 0 ? "text-green-400" : "text-red-400"}`}>
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <h3 className="text-gray-400 text-xs mb-1">{title}</h3>
      <p className="text-white text-xl font-bold">{value}</p>
    </div>
  );
}
