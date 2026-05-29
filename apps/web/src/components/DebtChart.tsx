import { useState, useEffect, FC } from 'react';
import { Card, Typography, Spin, Empty } from 'antd';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { loansAPI, paymentsAPI } from '../api/client';

const { Title, Text } = Typography;

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f'];

const DebtChart: FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async (): Promise<void> => {
    try {
      setLoading(true);

      const loansRes = await loansAPI.getAll();
      const loans = loansRes.data || [];

      let totalPrincipal = 0;
      let totalInterest = 0;
      let totalPenalty = 0;
      let totalPaid = 0;

      for (const loan of loans) {
        totalPrincipal += loan.principal;

        const paymentsRes = await paymentsAPI.getByLoanId(loan.id);
        const payments = paymentsRes.data || [];
        const paidAmount = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        totalPaid += paidAmount;

        const calcRes = await loansAPI.calculate({
          principal: loan.principal,
          interestRate: loan.interest_rate,
          penaltyRate: loan.penalty_rate,
          startDate: loan.start_date,
          termMonths: loan.term_months,
          paidAmount: paidAmount
        });

        totalInterest += calcRes.data.interest;
        totalPenalty += calcRes.data.penalty;
      }

      const data: ChartData[] = [
        { name: 'Gốc', value: totalPrincipal, color: COLORS[0] },
        { name: 'Lãi', value: totalInterest, color: COLORS[1] },
        { name: 'Phạt', value: totalPenalty, color: COLORS[2] },
        { name: 'Đã trả', value: totalPaid, color: COLORS[3] }
      ];

      setChartData(data);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Spin size="large" description="Đang tải biểu đồ..." />
      </div>
    );
  }

  if (chartData.every(d => d.value === 0)) {
    return (
      <Empty description="Chưa có dữ liệu để hiển thị biểu đồ" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card title="📊 Biểu Đồ Phân Bổ Nợ">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ marginTop: '24px' }}>
          <Title level={5}>Chi tiết:</Title>
          {chartData.map((item, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: item.color }}>{item.name}:</Text>{' '}
              <Text>{new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(item.value)}</Text>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default DebtChart;