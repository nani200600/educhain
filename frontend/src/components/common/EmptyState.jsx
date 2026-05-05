export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl mb-5 text-gray-600">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6 leading-relaxed">{description}</p>}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
