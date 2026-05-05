export default function PageHeader({ icon, title, subtitle, badge }) {
  return (
    <div className="text-center mb-12">
      {icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl mb-5">
          {icon}
        </div>
      )}
      {badge && (
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 text-blue-300 text-xs px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          {badge}
        </div>
      )}
      <h1 className="text-4xl font-bold text-white mb-3">{title}</h1>
      {subtitle && <p className="text-gray-400 max-w-md mx-auto leading-relaxed">{subtitle}</p>}
    </div>
  );
}
