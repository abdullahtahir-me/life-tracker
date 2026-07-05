import { createClient } from "@/utils/supabase/server";
import { FinanceTransaction } from "@/lib/types/database";
import { unstable_noStore as noStore } from "next/cache";

export async function getFinanceData() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { activeTransactions: [], settledTransactions: [], stats: { lent: 0, borrowed: 0, net: 0 }, debts: [] };

  // 1. Fetch ALL transactions (both settled and unsettled)
  const { data: allTransactions, error } = await supabase
    .from('finances')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching finances:", error.message);
    return { activeTransactions: [], settledTransactions: [], stats: { lent: 0, borrowed: 0, net: 0 }, debts: [] };
  }

  const txs = allTransactions as FinanceTransaction[];

  // 2. Separate them into two arrays
  const activeTransactions = txs.filter(tx => !tx.is_settled);
  const settledTransactions = txs.filter(tx => tx.is_settled).slice(0, 10); // Only keep the 10 most recent settled ones for the UI

  // 3. Calculate Stats ONLY using the ACTIVE transactions
  let lent = 0;
  let borrowed = 0;
  const debtMap: Record<string, number> = {};

  activeTransactions.forEach(tx => {
    const amount = Number(tx.amount);
    if (!debtMap[tx.entity_name]) debtMap[tx.entity_name] = 0;

    if (tx.transaction_type === 'lent') {
      lent += amount;
      debtMap[tx.entity_name] += amount;
    } else {
      borrowed += amount;
      debtMap[tx.entity_name] -= amount;
    }
  });

  const debts = Object.keys(debtMap)
    .map(name => ({ name, amount: debtMap[name], initials: name.substring(0, 2).toUpperCase() }))
    .filter(d => d.amount !== 0);

  return {
    activeTransactions,
    settledTransactions, // We now return the history!
    stats: { lent, borrowed, net: lent - borrowed },
    debts
  };
}