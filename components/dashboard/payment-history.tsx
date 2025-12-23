'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface PaymentTransaction {
  id: string;
  orderId: string;
  scriptName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  paymentMethod: 'paypal';
  createdAt: string;
  updatedAt: string;
}

interface PaymentHistoryProps {
  className?: string;
}

export function PaymentHistory({ className }: PaymentHistoryProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchPaymentHistory();
    }
  }, [user?.id]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user licenses which contain payment information
      const response = await apiClient.getUserLicenses();
      
      // Transform licenses to payment transactions
      const paymentTransactions: PaymentTransaction[] = (response.data || response)
        .filter((license: any) => license.paymentId) // Only include licenses with payment info
        .map((license: any) => ({
          id: license.id,
          orderId: license.orderId || license.paymentId,
          scriptName: license.script?.name || 'Unknown Script',
          amount: license.script?.price || 0,
          status: license.isActive ? 'completed' : 'pending',
          paymentMethod: 'paypal' as const,
          createdAt: license.createdAt,
          updatedAt: license.updatedAt
        }));
      
      setTransactions(paymentTransactions);
    } catch (err: any) {
      console.error('Failed to fetch payment history:', err);
      setError(err.message || 'Failed to load payment history');
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <Card className={`bg-white/5 border-cyan-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center text-white">
            <CreditCard className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 rounded-full border-b-2 border-cyan-400 animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-white/5 border-cyan-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center text-white">
            <CreditCard className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <XCircle className="mx-auto mb-4 w-12 h-12 text-red-400" />
            <p className="mb-4 text-red-400">{error}</p>
            <Button onClick={fetchPaymentHistory} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/5 border-cyan-500/20 ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex gap-2 items-center text-white">
              <CreditCard className="w-5 h-5" />
              Payment History
            </CardTitle>
            <CardDescription className="text-gray-400">
              Track your script purchases and transactions
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">${totalSpent.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Total Spent</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-8 text-center">
            <CreditCard className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <p className="mb-4 text-gray-400">No payment history found</p>
            <Button onClick={() => window.location.href = '/scripts'} variant="outline" size="sm">
              Browse Scripts
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex gap-2 items-center mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Total Transactions</span>
                </div>
                <div className="text-xl font-bold text-white">{transactions.length}</div>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex gap-2 items-center mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Successful</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {transactions.filter(t => t.status === 'completed').length}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex gap-2 items-center mb-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">This Month</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {transactions.filter(t => {
                    const transactionDate = new Date(t.createdAt);
                    const now = new Date();
                    return transactionDate.getMonth() === now.getMonth() && 
                           transactionDate.getFullYear() === now.getFullYear();
                  }).length}
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-hidden rounded-lg border border-cyan-500/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-500/20 hover:bg-white/5">
                    <TableHead className="text-gray-300">Script</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Order ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-cyan-500/20 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        {transaction.scriptName}
                      </TableCell>
                      <TableCell className="font-semibold text-green-400">
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(transaction.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(transaction.status)}
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-400">
                        {transaction.orderId}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentHistory;

