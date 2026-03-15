import type { TVAGrids } from '@/features/accounting/types';
import { formatPrice } from '@/lib/formatters';
import { Text, View } from 'react-native';

interface GridRowProps {
  code: string;
  label: string;
  amount: number;
  highlight?: boolean;
  isCredit?: boolean;
}

function GridRow({ code, label, amount, highlight = false, isCredit = false }: GridRowProps) {
  const amountColor = isCredit
    ? 'text-green-400'
    : highlight
      ? 'text-blue-400'
      : 'text-text-primary';
  return (
    <View
      className={`flex-row items-center justify-between py-3 border-b border-border ${highlight ? 'bg-blue-950/30 -mx-4 px-4' : ''}`}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-lg bg-surface-2 items-center justify-center">
          <Text className="text-blue-400 text-xs font-bold">{code}</Text>
        </View>
        <Text className="text-text-secondary text-sm flex-1">{label}</Text>
      </View>
      <Text className={`text-base font-semibold ${amountColor}`}>{formatPrice(amount)}</Text>
    </View>
  );
}

interface TVASummaryProps {
  grids: TVAGrids;
}

export function TVASummary({ grids }: TVASummaryProps) {
  const isCredit = grids.grille71 < 0;

  return (
    <View className="bg-surface rounded-xl px-4 pt-2 pb-2 mb-4">
      <Text className="text-text-primary text-base font-semibold pt-3 pb-1">
        Grilles TVA du trimestre
      </Text>

      <GridRow code="03" label="Base imposable des ventes (HT)" amount={grids.grille03} />
      <GridRow code="54" label="TVA collectée sur ventes" amount={grids.grille54} />
      <GridRow code="59" label="TVA déductible (achats + frais)" amount={grids.grille59} />
      <GridRow
        code="71"
        label={isCredit ? 'Crédit TVA' : 'Solde TVA à payer'}
        amount={Math.abs(grids.grille71)}
        highlight
        isCredit={isCredit}
      />
    </View>
  );
}
