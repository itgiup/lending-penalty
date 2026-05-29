import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { motion } from 'framer-motion';
import { DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { loansAPI, paymentsAPI } from '../api/client';

const { Title } = Typography;

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    totalPrincipal: 0,
    totalDebt: 0,
    totalPaid: 0,
    overdueLoans: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all loans
      const loansRes = await loansAPI.getAll();
      const loans = loansRes.data || [];

      // Calculate statistics
      let totalPrincipal = 0;
      let totalDebt = 0;
      let totalPaid = 0;
      let activeCount = 0;
      let overdueCount = 0;

      for (const loan of loans) {
        totalPrincipal += loan.principal;

        // Get payments for this loan
        const paymentsRes = await paymentsAPI.getByLoanId(loan.id);
        const payments = paymentsRes.data || [];
        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        totalPaid += paidAmount;

        // Calculate current debt
        const calcRes = await loansAPI.calculate({
          principal: loan.principal,
          interestRate: loan.interest_rate,
          penaltyRate: loan.penalty_rate,
          startDate: loan.start_date,
          termMonths: loan.term_months,
          paidAmount: paidAmount
        });

        totalDebt += calcRes.data.remainingDebt;

        if (loan.status === 'active') activeCount++;
        if (calcRes.data.isOverdue) overdueCount++;
      }

      setStats({
        totalLoans: loans.length,
        activeLoans: activeCount,
        totalPrincipal,
        totalDebt,
        totalPaid,
        overdueLoans: overdueCount
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Statistic
              title={<Title level={5} style={{ margin: 0 }}>💰 Tổng Khoản Nợ</Title>}
              value={stats.totalLoans}
              suffix="khoản"
              loading={loading}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Statistic
              title={<Title level={5} style={{ margin: 0 }}>📊 Đang Hoạt Động</Title>}
              value={stats.activeLoans}
              suffix="khoản"
              loading={loading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Statistic
              title={<Title level={5} style={{ margin: 0 }}>⚠️ Quá Hạn</Title>}
              value={stats.overdueLoans}
              suffix="khoản"
              loading={loading}
              valueStyle={{ color: stats.overdueLoans > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Statistic
              title={<Title level={5} style={{ margin: 0 }}>💵 Tổng Dư Nợ</Title>}
              value={stats.totalDebt}
              formatter={(value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              loading={loading}
              valueStyle={{ color: '#cf1322', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Statistic
              title={<Title level={5} style={{ margin: 0 }}>📈 Tổng Gốc Đã Cho Vay</Title>}
              value={stats.totalPrincipal}
              formatter={(value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              prefix={<DollarOutlined />}
              loading={loading}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Statistic
              title={<Title level={5} style={{ margin: 0 }}>✅ Tổng Đã Thu Hồi</Title>}
              value={stats.totalPaid}
              formatter={(value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              prefix={<CheckCircleOutlined />}
              loading={loading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default DashboardStats;