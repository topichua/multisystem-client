import { Form, Input } from "antd";

type HiddenFieldsProps = {
  includeSenderFields?: boolean;
};

export function HiddenFields({
  includeSenderFields = false,
}: HiddenFieldsProps) {
  return (
    <>
      {includeSenderFields ? (
        <>
          <Form.Item name="sender_ref" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="sender_name" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="sender_phone" hidden>
            <Input />
          </Form.Item>
        </>
      ) : null}
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
