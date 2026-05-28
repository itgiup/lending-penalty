import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  Space,
  Statistic,
  Divider,
  Table,
  Alert,
  InputNumber,
  Tooltip
} from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { calculateLoanStatus, predictFutureDebt } from '../utils/calculations';
import ResultsDisplay from './ResultsDisplay';
import './LoanCalculator.css';

const LoanCalculator = () => {
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

  return (
    <div className="loan-calculator">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          title="🏦 Máy Tính Lãi/Phạt Cho Vay"
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
                  label="💰 Số Tiền Vay"
                  name="principal"
                  rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                >
                  <InputNumber
                    formatter={(value) =>
                      `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\₫\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="📅 Ngày Vay"
                  name="startDate"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Tooltip title="Lãi suất hàng năm">
                  <Form.Item
                    label="📈 Lãi Suất (/năm)"
                    name="interestRate"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.1}
                      addonAfter="%"
                    />
                  </Form.Item>
                </Tooltip>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="⏰ Kỳ Hạn"
                  name="termMonths"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={1}
                    max={360}
                    step={1}
                    addonAfter="tháng"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Tooltip title="Phạt được tính nếu chậm trả sau kỳ hạn">
                  <Form.Item
                    label="⚠️ Phạt Suất (/năm)"
                    name="penaltyRate"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.1}
                      addonAfter="%"
                    />
                  </Form.Item>
                </Tooltip>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="✅ Đã Thanh Toán"
                  name="paidAmount"
                >
                  <InputNumber
                    min={0}
                    formatter={(value) =>
                      `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\₫\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
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
                🔍 Tính Toán
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
