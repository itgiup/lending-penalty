import { useState, FC } from 'react';
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  Space,
  InputNumber,
  Select,
  Switch,
  Typography,
} from 'antd';
import { motion } from 'framer-motion';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { calculateLoanStatus, LoanCalculationInput } from '../utils/calculations';
import ResultsDisplay from './ResultsDisplay';
import { UserOutlined, DashboardOutlined } from '@ant-design/icons';
import './LoanCalculator.css';

const { Text } = Typography;

interface CalculatorFormValues {
  principal: number;
  interestRate: number;
  penaltyRate: number;
  startDate: Dayjs;
  termMonths: number;
  paidAmount?: number;
}

const LoanCalculator: FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [form] = Form.useForm();
  const [loanData, setLoanData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = (values: any): void => {
    setLoading(true);
    setTimeout(() => {
      // Convert term to months based on selected unit
      let termInMonths = values.termValue;

      switch (values.termUnit) {
        case 'days':
          termInMonths = values.termValue / 30; // Approximate 30 days per month
          break;
        case 'weeks':
          termInMonths = values.termValue / 4.33; // Approximate 4.33 weeks per month
          break;
        case 'months':
          termInMonths = values.termValue;
          break;
        case 'quarters':
          termInMonths = values.termValue * 3; // 3 months per quarter
          break;
        case 'years':
          termInMonths = values.termValue * 12; // 12 months per year
          break;
        default:
          termInMonths = values.termValue;
      }

      const loan: LoanCalculationInput = {
        principal: values.principal,
        interestRate: values.interestRate / 100,
        penaltyRate: values.penaltyRate / 100,
        startDate: values.startDate.toDate(),
        termMonths: termInMonths,
        paidAmount: values.paidAmount || 0
      };

      const result = calculateLoanStatus(loan);
      setLoanData(result);
      setLoading(false);
    }, 500);
  };

  const changeLanguage = (lang: string): void => {
    i18n.changeLanguage(lang);
    dayjs.locale(lang);
  };

  return (
    <div className="loan-calculator">
      {/* Header với Language Switcher và Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="app-header"
      >
        <div className="header-controls">
          <Select
            value={i18n.language}
            onChange={changeLanguage}
            style={{ width: 140 }}
            size="large"
            options={[
              { value: 'vi', label: '🇻🇳 Tiếng Việt' },
              { value: 'en', label: '🇬🇧 English' },
              { value: 'zh', label: '🇨🇳 中文' },
              { value: 'ru', label: '🇷🇺 Русский' }
            ]}
          />

          <Space>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button type="primary" icon={<DashboardOutlined />} size="large">
                  {user?.name || 'Dashboard'}
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button icon={<UserOutlined />} size="large">
                  Đăng Nhập
                </Button>
              </Link>
            )}

            <Switch
              checked={theme === 'dark'}
              onChange={toggleTheme}
              checkedChildren="🌙 Dark"
              unCheckedChildren="☀️ Light"
            />
          </Space>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          title={t('calculator.title')}
          className="calculator-card"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              principal: 1000000,
              interestRate: 0,
              penaltyRate: 40,
              startDate: dayjs('2022-01-01'),
              termValue: 12,
              termUnit: 'months',
              paidAmount: 0
            }}
          >
            <Row gutter={[32, 32]} style={{ textAlign: 'start' }}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={t('calculator.principal')}
                  name="principal"
                  rules={[{ required: true, message: t('common.error') }]}
                >
                  <InputNumber
                    formatter={(value) =>
                      `${t('common.currency')} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/[₫$¥₽]\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
                    changeOnWheel
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={t('calculator.loanDate')}
                  name="startDate"
                  rules={[{ required: true, message: t('common.error') }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={t('calculator.interestRate')}
                  name="interestRate"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    step={0.1}
                    changeOnWheel
                    suffix="%"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={t('calculator.penaltyRate')}
                  name="penaltyRate"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    step={0.1}
                    changeOnWheel
                    suffix="%"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={t('calculator.term')}
                  name="termValue"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={1}
                    max={360}
                    step={1}
                    changeOnWheel
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={t('calculator.termUnit')}
                  name="termUnit"
                >
                  <Select
                    options={[
                      { value: 'days', label: t('calculator.days') },
                      { value: 'weeks', label: t('calculator.weeks') },
                      { value: 'months', label: t('calculator.months') },
                      { value: 'quarters', label: t('calculator.quarters') },
                      { value: 'years', label: t('calculator.years') },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={t('calculator.paidAmount')}
                  name="paidAmount"
                >
                  <InputNumber
                    min={0}
                    formatter={(value) =>
                      `${t('common.currency')} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/[₫$¥₽]\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
                    changeOnWheel
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ width: '100%' }}
              >
                {t('calculator.calculate')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>

      {loanData && <ResultsDisplay loan={loanData} />}
    </div>
  );
};

export default LoanCalculator;