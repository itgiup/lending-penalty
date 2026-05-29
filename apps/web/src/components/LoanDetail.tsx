import { useState, useEffect, FC } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space, Tag, Typography, Divider, Progress, message, TableProps } from 'antd';
import { motion } from 'framer-motion';
import { ArrowLeftOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { Loan, Payment, CalculationResult } from '@lending-penalty/shared';
import { loansAPI, paymentsAPI } from '../api/client';
import { exportPaymentsToExcel } from '../utils/export';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

interface LoanDetailProps {
  loanId: string;
  onBack: () => void;
  onAddPayment: (loanId: string) => void;
}

interface PenaltyLoan {
  period: number;
  base: number;
  penalty: number;
  total: number;
}

const LoanDetail: FC<LoanDetailProps> = ({ loanId, onBack, onAddPayment }) => {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, [loanId]);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Fetch loan details
      const loanRes = await loansAPI.getById(loanId);
      setLoan(loanRes.data);

      // Fetch payments
      const paymentsRes = await paymentsAPI.getByLoanId(loanId);
      setPayments(paymentsRes.data || []);

      // Calculate loan status
      const totalPaid = (paymentsRes.data || []).reduce((sum: number, p: Payment) => sum + p.amount, 0);
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

  const paymentColumns: TableProps<Payment>['columns'] = [
    {
      title: 'Ngày thanh toán',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (date: string | Dayjs) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes?: string) => notes || '-'
    }
  ];

  const handleExportPayments = async (): Promise<void> => {
    try {
      await exportPaymentsToExcel(loanId, loan.borrower_name, paymentsAPI);
      message.success('Xuất file thành công!');
    } catch (error: any) {
      message.error('Xuất file thất bại: ' + error.message);
    }
  };

  const totalPaid = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
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
      <Card>
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
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportPayments}
                disabled={payments.length === 0}
              >
                Xuất Lịch Sử Thanh Toán
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Borrower Info */}
      <Card title="👤 Thông Tin Người Vay">
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
          <Card>
            <Statistic
              title="💰 Gốc"
              value={calculation.principal}
              formatter={(value: number) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              styles={{
                content: { color: '#1890ff' }
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="📈 Lãi"
              value={calculation.interest}
              formatter={(value: number) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              styles={{
                content: { color: '#faad14' }
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="⚠️ Phạt"
              value={calculation.penalty}
              formatter={(value: number) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              styles={{
                content: { color: calculation.penalty > 0 ? '#ff4d4f' : '#52c41a' }
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="💵 Tổng Nợ"
              value={calculation.totalDebt}
              formatter={(value: number) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              styles={{
                content: { color: '#cf1322', fontSize: '24px' }
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Progress */}
      <Card title="📊 Tiến Độ Thanh Toán">
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Đã Thanh Toán"
              value={totalPaid}
              formatter={(value: number) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              styles={{
                content: { color: '#52c41a' }
              }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Còn Lại"
              value={calculation.remainingDebt}
              formatter={(value: number) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)}
              styles={{
                content: { color: '#ff4d4f' }
              }}
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
          format={(percent: number | undefined) => `${percent}%`}
        />
      </Card>

      {/* Loan Details */}
      <Card title="📋 Chi Tiết Khoản Nợ">
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
        <Card title="⚠️ Lịch Sử Phạt">
          <Table
            dataSource={calculation.penaltyLoans as PenaltyLoan[]}
            rowKey="period"
            pagination={false}
            columns={[
              {
                title: 'Kỳ',
                dataIndex: 'period',
                key: 'period',
                render: (p: number) => `Kỳ ${p}`
              },
              {
                title: 'Gốc tính phạt',
                dataIndex: 'base',
                key: 'base',
                render: (v: number) => new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(v)
              },
              {
                title: 'Tiền phạt',
                dataIndex: 'penalty',
                key: 'penalty',
                render: (v: number) => new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(v)
              },
              {
                title: 'Tổng sau kỳ',
                dataIndex: 'total',
                key: 'total',
                render: (v: number) => new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(v)
              }
            ]}
          />
        </Card>
      )}

      {/* Payment History */}
      <Card title="💳 Lịch Sử Thanh Toán">
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