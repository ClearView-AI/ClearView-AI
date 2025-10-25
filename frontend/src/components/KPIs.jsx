import { Package, AlertTriangle, Shield, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '../lib/utils';

const iconMap = {
  package: Package,
  alert: AlertTriangle,
  shield: Shield,
  dollar: DollarSign,
};

export function KPIs({ data }) {
  const kpis = data || [
    {
      label: 'Total Software Assets',
      value: 1247,
      change: 12.5,
      icon: 'package',
    },
    {
      label: 'Critical Vulnerabilities',
      value: 23,
      change: -8.3,
      icon: 'alert',
    },
    {
      label: 'Compliance Rate',
      value: 94.2,
      change: 2.1,
      icon: 'shield',
      suffix: '%',
    },
    {
      label: 'Monthly Spend',
      value: 47832,
      change: 5.7,
      icon: 'dollar',
      format: 'currency',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}

function KPICard({ label, value, change, icon, suffix, format }) {
  const Icon = iconMap[icon] || Package;
  const isPositive = change > 0;
  const isNegative = change < 0;

  const formattedValue = format === 'currency' 
    ? formatCurrency(value)
    : formatNumber(value) + (suffix || '');

  return (
    <div className="card p-6 hover:bg-card-hover transition-colors duration-200">
      <div className="flex items-start justify-between mb-5">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <div className="w-11 h-11 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center ring-1 ring-white/10 shadow-sm">
          <Icon className="w-5 h-5 text-white/70" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-3xl font-bold text-white tracking-tight">{formattedValue}</div>
        
        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            {isPositive && <TrendingUp className="w-4 h-4 text-success" />}
            {isNegative && <TrendingDown className="w-4 h-4 text-danger" />}
            <span
              className={`text-sm font-semibold ${
                isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-gray-400'
              }`}
            >
              {formatPercentage(change)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

