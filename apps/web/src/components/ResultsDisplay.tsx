import { FC } from 'react';
import { Card, Row, Col, Statistic, Divider, Table, Alert, Tag, Progress, TableProps } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import './ResultsDisplay.css';

interface PenaltyLoanItem {
  period: number;
  base: number;
  penalty: number;
  total: number;
}

interface LoanResult {
  principal: number;
  interest: number;
  penalty: number;
  totalDebt: number;
  paidAmount: number;
  remainingDebt: number;
  dueDate: Date;
  isOverdue: boolean;
  penaltyLoans: PenaltyLoanItem[];
  details: {
    interestRate: number;
    penaltyRate: number;
    termMonths: number;
    startDate: string | Date;
  };
}

interface ResultsDisplayProps {
  loan: LoanResult;
}

const formatCurrency = (value: number, currency: string): string => {
  return `${currency} ${Math.round(value).toLocaleString('vi-VN')}`;
};

const ResultsDisplay: FC<ResultsDisplayProps> = ({ loan }) => {
  const { t } = useTranslation();

  const {
    principal,
    interest,
    penalty,
    totalDebt,
    paidAmount,
    remainingDebt,
    dueDate,
    isOverdue,
    penaltyLoans,
    details
  } = loan;

  const currency = t('common.currency');

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

  const penaltyColumns: TableProps<PenaltyLoanItem>['columns'] = [
    {
      title: t('results.period'),
      dataIndex: 'period',
      key: 'period',
      width: 60,
      render: (text: number) => <strong>{text}</strong>
    },
    {
      title: t('results.base'),
      dataIndex: 'base',
      key: 'base',
      render: (value: number) => formatCurrency(value, currency)
    },
    {
      title: t('results.penaltyAmount'),
      dataIndex: 'penalty',
      key: 'penalty',
      render: (value: number) => <span style={{ color: '#ff4d4f' }}>{formatCurrency(value, currency)}</span>
    },
    {
      title: t('results.totalAmount'),
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => <strong>{formatCurrency(value, currency)}</strong>
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
            title={`⚠️ ${t('results.overdue')}`}
            description={`${t('results.dueDate')}: ${dayjs(dueDate).format('DD/MM/YYYY')}`}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card
          title={t('results.summary')}
          className="summary-card"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={t('results.principal')}
                value={principal}
                formatter={(value: number) => formatCurrency(value, currency)}
                styles={{
                  content: { color: '#1890ff' }
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={t('results.interest')}
                value={interest}
                formatter={(value: number) => formatCurrency(value, currency)}
                styles={{
                  content: { color: '#faad14' }
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={isOverdue ? t('results.penalty') : '⚫ ' + t('results.penalty')}
                value={penalty}
                formatter={(value: number) => formatCurrency(value, currency)}
                styles={{
                  content: { color: penalty > 0 ? '#ff4d4f' : '#95de64' }
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={t('results.totalDebt')}
                value={totalDebt}
                formatter={(value: number) => formatCurrency(value, currency)}
                styles={{
                  content: { color: '#f5222d', fontSize: '24px' }
                }}
              />
            </Col>
          </Row>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
        <Card
          title={t('results.paymentProgress')}
          className="payment-card"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title={t('results.paidAmount')}
                value={paidAmount}
                formatter={(value: number) => formatCurrency(value, currency)}
                styles={{
                  content: { color: '#52c41a' }
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title={t('results.remainingDebt')}
                value={remainingDebt}
                formatter={(value: number) => formatCurrency(value, currency)}
                styles={{
                  content: { color: remainingDebt > 0 ? '#ff4d4f' : '#52c41a' }
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title={t('results.paymentProgress')}
                value={progressPercent}
                suffix="%"
                styles={{
                  content: { color: progressPercent === 100 ? '#52c41a' : '#faad14' }
                }}
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
          title={t('results.termInfo')}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('results.loanDate')}:</strong> {dayjs(details.startDate).format('DD/MM/YYYY')}
              </div>
              <div>
                <strong>⏳ {t('calculator.termMonths')}:</strong> {details.termMonths} {t('calculator.termMonths')}
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>{t('results.dueDate')}:</strong> {dayjs(dueDate).format('DD/MM/YYYY')}
                {isOverdue ? (
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    {t('results.overdue')}
                  </Tag>
                ) : (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    {t('results.notOverdue')}
                  </Tag>
                )}
              </div>
              <div>
                <strong>📊 {t('calculator.interestRate')}:</strong> {(details.interestRate * 100).toFixed(1)}%/năm
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {penaltyLoans.length > 0 && (
        <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
          <Card
            title={`${t('results.penaltyHistory')} (${penaltyLoans.length} kỳ)`}
          >
            <Alert
              title={t('results.penaltyHistory')}
              description="Các kỳ phạt đã được tính và được cộng vào nợ"
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
          title={t('results.details')}
          className="details-card"
        >
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <p>
              <strong>{t('results.details')}:</strong> {t('app.subtitle')}
            </p>
            <p>
              <strong>{t('common.success')}:</strong>
              <br />
              - {t('results.principal')}: {formatCurrency(principal, currency)}
              <br />
              - {t('calculator.interestRate')}: {(details.interestRate * 100).toFixed(2)}%/năm
              <br />
              - {t('calculator.penaltyRate')}: {(details.penaltyRate * 100).toFixed(2)}%/năm
              <br />- {t('calculator.termMonths')}: {details.termMonths} {t('calculator.termMonths')} ({t('results.loanDate')} {dayjs(details.startDate).format('DD/MM/YYYY')})
            </p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ResultsDisplay;