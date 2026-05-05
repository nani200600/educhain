import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

const CONFIG = {
  valid:    { icon: CheckCircle,   text: "Valid",    classes: "text-green-400 border-green-700/50 bg-green-900/20" },
  revoked:  { icon: XCircle,       text: "Revoked",  classes: "text-red-400 border-red-700/50 bg-red-900/20" },
  pending:  { icon: Clock,         text: "Pending",  classes: "text-yellow-400 border-yellow-700/50 bg-yellow-900/20" },
  warning:  { icon: AlertTriangle, text: "Warning",  classes: "text-orange-400 border-orange-700/50 bg-orange-900/20" },
};

export default function StatusBadge({ status = "valid", label, size = "sm" }) {
  const c = CONFIG[status] || CONFIG.valid;
  const Icon = c.icon;
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium ${textSize} ${c.classes}`}>
      <Icon className={iconSize} />
      {label || c.text}
    </span>
  );
}
