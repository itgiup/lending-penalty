import React, { useState, useEffect } from 'react';
import { Card, Typography, Empty, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { loansAPI, paymentsAPI } from '../api/client';

const { Title } = Typography;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

const DebtChart = () => {
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      const loansRes = await loansAPI.getAll();
      const loans = loansRes.data || [];

      if (loans.length === 0) {
        setLoading(false);
        return;
      }

      // Prepare bar chart data (top 10 loans by debt)
      const barData = [];
      for (const loan of loans.slice(0, 10)) {
        const paymentsRes = await paymentsAPI.getByLoanId(loan.id);
        const paidAmount = (paymentsRes.data || []).reduce((sum, p) => sum + p.amount, 0);
        
        const calcRes = await loansAPI.calculate({
          principal: loan.principal,
          interestRate: loan.interest_rate,
          penaltyRate: loan.penalty_rate,
          startDate: loan.start_date,
          termMonths: loan.term_months,
          paidAmount: paidAmount
        });

        barData.push({
          name: loan.borrower_name.substring(0, 15),
          principal: loan.principal,
          remaining: calcRes.data.remainingDebt,
          paid: paidAmount
        });
      }

      // Prepare pie chart data (by status)
      let activeCount = 0;
      let paidCount = 0;
      let overdueCount = 0;

      for (const loan of loans) {
        const paymentsRes = await paymentsAPI.getByLoanId(loan.id);
        const paidAmount = (paymentsRes.data || []).reduce((sum, p) => sum + p.amount, 0);
        
        const calcRes = await loansAPI.calculate({
          principal: loan.principal,
          interestRate: loan.interest_rate,
          penaltyRate: loan.penalty_rate,
          startDate: loan.start_date,
          termMonths: loan.term_months,
          paidAmount: paidAmount
        });

        if (calcRes.data.isOverdue) {
          overdueCount++;
        } else if (loan.status === 'paid') {
          paidCount++;
        } else {
          activeCount++;
        }
      }

      const pieChartData = [
        { name: 'Đang nợ', value: activeCount },
        { name: 'Đã trả', value: paidCount },
        { name: 'Quá hạn', value: overdueCount }
      ].filter(item => item.value > 0);

      setChartData(barData);
      setPieData(pieChartData);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card loading={true} />;
  }

  if (chartData.length === 0 && pieData.length === 0) {
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
      <Row gutter={[16, 16]}>
        {/* Pie Chart - Loan Status Distribution */}
        {pieData.length > 0 && (
          <Col xs={24} md={12}>
            <Card title="📊 Phân Bổ Trạng Thái Khoản Nợ" bordered={false} style={{ borderRadius: '12px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} khoản`, 'Số lượng']} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {/* Bar Chart - Top Loans by Debt */}
        {chartData.length > 0 && (
          <Col xs={24} md={12}>
            <Card title="💰 Top 10 Khoản Nợ Lớn Nhất" bordered={false} style={{ borderRadius: '12px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(value)}
                  />
                  <Legend />
                  <Bar dataKey="principal" fill="#1890ff" name="Gốc" />
                  <Bar dataKey="remaining" fill="#ff4d4f" name="Còn lại" />
                  <Bar dataKey="paid" fill="#52c41a" name="Đã trả" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}
      </Row>
    </motion.div>
  );
};

export default DebtChart;