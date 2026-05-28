import React from 'react';
import { Card, Row, Col, Statistic, Divider, Table, Alert, Tag, Progress } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import './ResultsDisplay.css';

const formatCurrency = (value) => {
  return `₫ ${Math.round(value).toLocaleString('vi-VN')}`;
};

const ResultsDisplay = ({ loan }) => {
  const {
    principal,
    interest,
    penalty,
    totalDebt,
    paidAmount,
    remainingDebt,
    dueDate,
    currentDate,
    isOverdue,
    penaltyLoans,
    details
  } = loan;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  const penaltyColumns = [
    {
      title: 'Kỳ',
      dataIndex: 'period',
      key: 'period',
      width: 60,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Gốc/Nợ',
      dataIndex: 'base',
      key: 'base',
      render: (value) => formatCurrency(value)
    },
    {
      title: 'Tiền Phạt',
      dataIndex: 'penalty',
      key: 'penalty',
      render: (value) => <span style={{ color: '#ff4d4f' }}>{formatCurrency(value)}</span>
    },
    {
      title: 'Tổng Cộng',
      dataIndex: 'total',
      key: 'total',
      render: (value) => <strong>{formatCurrency(value)}</strong>
    }
  ];

  const progressPercent = paidAmount > 0 ? Math.min((paidAmount / totalDebt) * 100, 100) : 0;

  return (
    <motion.div
      className="results-display"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isOverdue && (
        <motion.div variants={itemVariants}>
          <Alert
            message="⚠️ QUÁ HẠN TRẢ NỢ"
            description={`Hạn thanh toán: ${dayjs(dueDate).format('DD/MM/YYYY')}`}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card
          title="📊 Tóm Tắt Khoản Vay"
          bordered={false}
          className="summary-card"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="💵 Gốc Vay"
                value={principal}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="📈 Lãi Tích Lũy"
                value={interest}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={isOverdue ? '🔴 Tiền Phạt' : '⚫ Tiền Phạt'}
                value={penalty}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: penalty > 0 ? '#ff4d4f' : '#95de64' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="💰 Tổng Nợ"
                value={totalDebt}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: '#f5222d', fontSize: '24px' }}
              />
            </Col>
          </Row>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
        <Card
          title="💳 Tình Hình Thanh Toán"
          bordered={false}
          className="payment-card"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="✅ Đã Thanh Toán"
                value={paidAmount}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="❌ Còn Nợ"
                value={remainingDebt}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: remainingDebt > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="📉 Tỷ Lệ Thanh Toán"
                value={progressPercent}
                suffix="%"
                valueStyle={{ color: progressPercent === 100 ? '#52c41a' : '#faad14' }}
              />
            </Col>
          </Row>
          <Divider />
          <Progress
            percent={progressPercent}
            strokeColor={progressPercent === 100 ? '#52c41a' : progressPercent > 50 ? '#faad14' : '#ff4d4f'}
          />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
        <Card
          title="📅 Thông Tin Kỳ Hạn"
          bordered={false}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>📍 Ngày Vay:</strong> {dayjs(details.startDate).format('DD/MM/YYYY')}
              </div>
              <div>
                <strong>⏳ Kỳ Hạn:</strong> {details.termMonths} tháng
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>📌 Hạn Chót:</strong> {dayjs(dueDate).format('DD/MM/YYYY')}
                {isOverdue ? (
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    Quá hạn
                  </Tag>
                ) : (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    Chưa đến hạn
                  </Tag>
                )}
              </div>
              <div>
                <strong>📊 Lãi suất:</strong> {(details.interestRate * 100).toFixed(1)}%/năm
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {penaltyLoans.length > 0 && (
        <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
          <Card
            title={`🔴 Lịch Sử Phạt (${penaltyLoans.length} kỳ)`}
            bordered={false}
          >
            <Alert
              message="Các kỳ phạt đã được tính và được cộng vào nợ"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={penaltyColumns}
              dataSource={penaltyLoans.map((item, index) => ({
                ...item,
                key: index
              }))}
              pagination={false}
              size="small"
            />
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
        <Card
          title="🎯 Chi Tiết Tính Toán"
          bordered={false}
          className="details-card"
        >
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <p>
              <strong>Công thức:</strong> Nợ = Gốc × (1 + suất_lãi)^n + Phạt
            </p>
            <p>
              <strong>Trong đó:</strong>
              <br />
              - Gốc: ₫ {Math.round(principal).toLocaleString('vi-VN')}
              <br />
              - Lãi suất: {(details.interestRate * 100).toFixed(2)}%/năm
              <br />
              - Phạt suất: {(details.penaltyRate * 100).toFixed(2)}%/năm
              <br />- Thời gian: {details.termMonths} tháng (từ {dayjs(details.startDate).format('DD/MM/YYYY')})
            </p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ResultsDisplay;
