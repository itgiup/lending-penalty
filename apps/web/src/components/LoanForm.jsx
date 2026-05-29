import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Card, Row, Col, Alert } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { loansAPI } from '../api/client';

const LoanForm = ({ loan, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!loan;

  useEffect(() => {
    if (loan) {
      form.setFieldsValue({
        borrower_name: loan.borrower_name,
        borrower_phone: loan.borrower_phone,
        borrower_address: loan.borrower_address,
        principal: loan.principal,
        interest_rate: loan.interest_rate,
        penalty_rate: loan.penalty_rate,
        start_date: dayjs(loan.start_date),
        term_months: loan.term_months,
        notes: loan.notes
      });
    }
  }, [loan, form]);

  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const data = {
        borrower_name: values.borrower_name,
        borrower_phone: values.borrower_phone,
        borrower_address: values.borrower_address,
        principal: values.principal,
        interest_rate: values.interest_rate,
        penalty_rate: values.penalty_rate,
        start_date: values.start_date.toISOString(),
        term_months: values.term_months,
        notes: values.notes
      };

      if (isEdit) {
        await loansAPI.update(loan.id, data);
      } else {
        await loansAPI.create(data);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        title={isEdit ? '✏️ Chỉnh Sửa Khoản Nợ' : '➕ Thêm Khoản Nợ Mới'}
      >
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="borrower_name"
                label="Tên người vay"
                rules={[{ required: true, message: 'Vui lòng nhập tên người vay!' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="borrower_phone"
                label="Số điện thoại"
                rules={[
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="0123456789" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="borrower_address"
            label="Địa chỉ"
          >
            <Input.TextArea rows={2} placeholder="Địa chỉ người vay (tùy chọn)" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="principal"
                label="Số tiền gốc (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="1000000"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="interest_rate"
                label="Lãi suất (%/năm)"
                rules={[{ required: true, message: 'Vui lòng nhập lãi suất!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="20"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="penalty_rate"
                label="Phạt suất (%/năm)"
                rules={[{ required: true, message: 'Vui lòng nhập phạt suất!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="40"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="term_months"
                label="Kỳ hạn (tháng)"
                rules={[{ required: true, message: 'Vui lòng nhập kỳ hạn!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={360}
                  placeholder="12"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Ghi chú thêm về khoản nợ (tùy chọn)" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                {isEdit ? 'Cập Nhật' : 'Tạo Khoản Nợ'}
              </Button>
              <Button onClick={onCancel}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </motion.div>
  );
};

export default LoanForm;