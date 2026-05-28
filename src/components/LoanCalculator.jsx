import { useState } from 'react';
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  Space,
  InputNumber,
  Tooltip,
  Select,
  Switch
} from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { calculateLoanStatus } from '../utils/calculations';
import ResultsDisplay from './ResultsDisplay';
import './LoanCalculator.css';

const { Option } = Select;

const LoanCalculator = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [form] = Form.useForm();
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      const loan = {
        principal: values.principal,
        interestRate: values.interestRate / 100,
        penaltyRate: values.penaltyRate / 100,
        startDate: values.startDate.toDate(),
        termMonths: values.termMonths,
        paidAmount: values.paidAmount || 0
      };

      const result = calculateLoanStatus(loan);
      setLoanData(result);
      setLoading(false);
    }, 500);
  };

  const changeLanguage = (lang) => {
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
          >
            <Option value="vi">🇻🇳 Tiếng Việt</Option>
            <Option value="en">🇬🇧 English</Option>
            <Option value="zh">🇨🇳 中文</Option>
            <Option value="ru">🇷🇺 Русский</Option>
          </Select>

          <Space>
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
          bordered={false}
          className="calculator-card"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              principal: 1000000,
              interestRate: 20,
              penaltyRate: 40,
              startDate: dayjs('2022-01-01'),
              termMonths: 12,
              paidAmount: 0
            }}
          >
            <Row gutter={16}>
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
                <Tooltip title={t('calculator.interestRate')}>
                  <Form.Item
                    label={t('calculator.interestRate')}
                    name="interestRate"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.1}
                      addonAfter="%"
                      changeOnWheel
                    />
                  </Form.Item>
                </Tooltip>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={t('calculator.termMonths')}
                  name="termMonths"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={1}
                    max={360}
                    step={1}
                    addonAfter={t('calculator.termMonths')}
                    changeOnWheel
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Tooltip title={t('calculator.penaltyRate')}>
                  <Form.Item
                    label={t('calculator.penaltyRate')}
                    name="penaltyRate"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.1}
                      addonAfter="%"
                      changeOnWheel
                    />
                  </Form.Item>
                </Tooltip>
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