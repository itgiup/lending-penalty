import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space, Tag, Typography, Divider, Progress } from 'antd';
import { motion } from 'framer-motion';
import { ArrowLeftOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { loansAPI, paymentsAPI } from '../api/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const LoanDetail = ({ loanId, onBack, onAddPayment }) => {
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [loanId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch loan details
      const loanRes = await loansAPI.getById(loanId);
      setLoan(loanRes.data);

      // Fetch payments
      const paymentsRes = await paymentsAPI.getByLoanId(loanId);
      setPayments(paymentsRes.data || []);

      // Calculate loan status
      const totalPaid = (paymentsRes.data || []).reduce((sum, p) => sum + p.amount, 0);
      const calcRes = await loansAPI.calculate({
        principal: loanRes.data.principal,
        interestRate: loanRes.data.interest_rate,
        penaltyRate: loanRes.data.penalty_rate,
        startDate: loanRes.data.start_date,
        termMonths: loanRes.data.term_months,
        paidAmount: totalPaid
      });
      setCalculation(calcRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !loan || !calculation) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Text>Loading...</Text>
      </div>
    );
  }

  const paymentColumns = [
    {
      title: 'Ngày thanh toán',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || '-'
    }
  ];

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const paymentProgress = calculation.totalDebt > 0 
    ? Math.min(100, (totalPaid / calculation.totalDebt) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <Card bordered={false} style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Quay lại danh sách
            </Button>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => onAddPayment(loanId)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Ghi Nhận Thanh Toán
              </Button>
              <Button icon={<DownloadOutlined />}>Xuất Báo Cáo</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Borrower Info */}
      <Card title="👤 Thông Tin Người Vay" bordered={false} style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Tên:</Text> <Text>{loan.borrower_name}</Text>
          </Col>
          <Col span={8}>
            <Text strong>SĐT:</Text> <Text>{loan.borrower_phone || 'N/A'}</Text>
          </Col>
          <Col span={8}>
            <Text strong>Địa chỉ:</Text> <Text>{loan.borrower_address || 'N/A'}</Text>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Statistic
              title="💰 Gốc"
              value={calculation.principal}
              formatter={(value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Statistic
              title="📈 Lãi"
              value={calculation.interest}
              formatter={(value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Statistic
              title="⚠️ Phạt"
              value={calculation.penalty}
              formatter={(value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              valueStyle={{ color: calculation.penalty > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Statistic
              title="💵 Tổng Nợ"
              value={calculation.totalDebt}
              formatter={(value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              valueStyle={{ color: '#cf1322', fontSize: '24px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Progress */}
      <Card title="📊 Tiến Độ Thanh Toán" bordered={false} style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Đã Thanh Toán"
              value={totalPaid}
              formatter={(value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Còn Lại"
              value={calculation.remainingDebt}
              formatter={(value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>
        
        <Divider />
        
        <Progress
          percent={Number(paymentProgress.toFixed(2))}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          strokeWidth={20}
          format={(percent) => `${percent}%`}
        />
      </Card>

      {/* Loan Details */}
      <Card title="📋 Chi Tiết Khoản Nợ" bordered={false} style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Lãi suất:</Text> <Tag color="blue">{loan.interest_rate}%/năm</Tag>
          </Col>
          <Col span={8}>
            <Text strong>Phạt suất:</Text> <Tag color="red">{loan.penalty_rate}%/năm</Tag>
          </Col>
          <Col span={8}>
            <Text strong>Kỳ hạn:</Text> <Tag>{loan.term_months} tháng</Tag>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={8}>
            <Text strong>Ngày bắt đầu:</Text> <Text>{dayjs(loan.start_date).format('DD/MM/YYYY')}</Text>
          </Col>
          <Col span={8}>
            <Text strong>Hạn chót:</Text> <Text>{dayjs(calculation.dueDate).format('DD/MM/YYYY')}</Text>
          </Col>
          <Col span={8}>
            <Text strong>Trạng thái:</Text>{' '}
            <Tag color={calculation.isOverdue ? 'red' : 'green'}>
              {calculation.isOverdue ? 'Quá hạn' : 'Trong hạn'}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Penalty History */}
      {calculation.penaltyLoans && calculation.penaltyLoans.length > 0 && (
        <Card title="⚠️ Lịch Sử Phạt" bordered={false} style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Table
            dataSource={calculation.penaltyLoans}
            rowKey="period"
            pagination={false}
            columns={[
              {
                title: 'Kỳ',
                dataIndex: 'period',
                key: 'period',
                render: (p) => `Kỳ ${p}`
              },
              {
                title: 'Gốc tính phạt',
                dataIndex: 'base',
                key: 'base',
                render: (v) => new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(v)
              },
              {
                title: 'Tiền phạt',
                dataIndex: 'penalty',
                key: 'penalty',
                render: (v) => new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(v)
              },
              {
                title: 'Tổng sau kỳ',
                dataIndex: 'total',
                key: 'total',
                render: (v) => new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(v)
              }
            ]}
          />
        </Card>
      )}

      {/* Payment History */}
      <Card title="💳 Lịch Sử Thanh Toán" bordered={false} style={{ borderRadius: '12px' }}>
        {payments.length === 0 ? (
          <Text type="secondary">Chưa có thanh toán nào</Text>
        ) : (
          <Table
            dataSource={payments}
            rowKey="id"
            columns={paymentColumns}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default LoanDetail;