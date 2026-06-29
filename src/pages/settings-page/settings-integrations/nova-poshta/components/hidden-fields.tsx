import { Form, Input } from "antd";

export function HiddenFields() {
  return (
    <>
      <Form.Item name="sender_city_name" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="sender_settlement_ref" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="warehouse_name" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="sender_street_name" hidden>
        <Input />
      </Form.Item>
    </>
  );
}
