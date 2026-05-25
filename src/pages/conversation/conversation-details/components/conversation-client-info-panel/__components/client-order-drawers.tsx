import { getApiErrorMessage } from '@/api/get-api-error-message';
import type { Client } from '@/features/clients/model/client.types';
import type { OrderDraftLine, OrderFormValues } from '@/features/orders/model/order.types';
import { useOrdersStore } from '@/features/orders/model/use-orders-store';
import type { CatalogVariant } from '@/features/products/model/product.types';
import { observer } from 'mobx-react-lite';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  message,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogVariantSearchItem } from './catalog-variant-search-item';
import { OrderProductLine } from './order-product-line';
import { ProductCard } from './product-card';

const { Text } = Typography;

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;

type ClientOrderDrawerProps = {
  onClose: () => void;
  onOpen: boolean;
  linkedClient: Client;
  conversationId: number;
  clientPic?: string;
  onOrderCreated?: () => void;
};

type VariantSelectOptionData = {
  variant: CatalogVariant;
};

const sectionTitle = (step: number, title: string) => (
  <Space>
    <Badge color="purple" count={step} />
    <Text strong>{title}</Text>
  </Space>
);

const recommendedProducts = [
  {
    id: '1',
    title: 'White Hoodie',
    imageUrl: 'https://cdn.pixabay.com/photo/2020/10/05/10/51/cat-5628953_1280.jpg',
    size: 'L',
    color: 'White',
    price: 1250,
    stockCount: 8,
  },
  {
    id: '2',
    title: 'Black Hoodie',
    imageUrl: 'https://i.pinimg.com/236x/c6/2e/47/c62e47ccce4e8e568c9c7e381032bde9.jpg',
    size: 'M',
    color: 'Black',
    price: 1390,
    stockCount: 4,
  },
  {
    id: '3',
    title: 'Grey Hoodie',
    imageUrl:
      'https://plus.unsplash.com/premium_photo-1673967831980-1d377baaded2?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2F0c3xlbnwwfHwwfHx8MA%3D%3D',
    size: 'XL',
    color: 'Grey',
    price: 1190,
    stockCount: 12,
  },
];

export const ClientOrderDrawer = observer(
  ({
    onClose,
    onOpen,
    linkedClient,
    conversationId,
    clientPic,
    onOrderCreated,
  }: ClientOrderDrawerProps) => {
    const { t } = useTranslation();
    const ordersStore = useOrdersStore();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm<OrderFormValues>();
    const [searchQuery, setSearchQuery] = useState('');
    const [productPickerKey, setProductPickerKey] = useState(0);
    const [orderLines, setOrderLines] = useState<OrderDraftLine[]>([]);

    const trimmedSearch = searchQuery.trim();

    useEffect(() => {
      if (trimmedSearch.length < MIN_SEARCH_LENGTH) {
        ordersStore.clearCatalogSearch();
        return;
      }

      const timer = window.setTimeout(() => {
        void ordersStore.searchCatalogVariants(trimmedSearch);
      }, SEARCH_DEBOUNCE_MS);

      return () => window.clearTimeout(timer);
    }, [trimmedSearch, ordersStore]);

    const orderTotals = useMemo(() => {
      const productCount = orderLines.reduce((sum, line) => sum + line.quantity, 0);
      const total = orderLines.reduce(
        (sum, line) => sum + line.quantity * line.variant.unitPrice,
        0,
      );
      const currency = orderLines[0]?.variant.product.currency?.toLowerCase() ?? 'uah';

      return { productCount, total, currency };
    }, [orderLines]);

    const variantSelectOptions = useMemo(
      () =>
        ordersStore.catalogSearchResults.map((variant) => ({
          value: variant.id,
          label: variant.label,
          variant,
        })),
      [ordersStore.catalogSearchResults],
    );

    const variantsById = useMemo(
      () => new Map(ordersStore.catalogSearchResults.map((variant) => [variant.id, variant])),
      [ordersStore.catalogSearchResults],
    );

    const addVariantToOrder = useCallback(
      (variant: CatalogVariant) => {
        setOrderLines((prev) => {
          const existing = prev.find((line) => line.variantId === variant.id);
          if (existing) {
            const maxQty = variant.quantity > 0 ? variant.quantity : Number.MAX_SAFE_INTEGER;
            const nextQuantity = Math.min(existing.quantity + 1, maxQty);
            return prev.map((line) =>
              line.variantId === variant.id ? { ...line, quantity: nextQuantity, variant } : line,
            );
          }

          return [...prev, { variantId: variant.id, quantity: 1, variant }];
        });
        setSearchQuery('');
        ordersStore.clearCatalogSearch();
        setProductPickerKey((key) => key + 1);
      },
      [ordersStore],
    );

    const updateLineQuantity = useCallback((variantId: number, quantity: number) => {
      setOrderLines((prev) =>
        prev.map((line) => (line.variantId === variantId ? { ...line, quantity } : line)),
      );
    }, []);

    const removeLine = useCallback((variantId: number) => {
      setOrderLines((prev) => prev.filter((line) => line.variantId !== variantId));
    }, []);

    const resetDrawerState = useCallback(() => {
      setSearchQuery('');
      ordersStore.clearCatalogSearch();
      setProductPickerKey(0);
      setOrderLines([]);
      form.resetFields();
    }, [form, ordersStore]);

    const handleDrawerClose = () => {
      resetDrawerState();
      onClose();
    };

    const handlePlaceOrder = useCallback(async () => {
      if (orderLines.length === 0) {
        return;
      }

      let formValues: OrderFormValues;
      try {
        formValues = await form.validateFields();
      } catch {
        return;
      }

      try {
        await ordersStore.createOrder({
          linkedClient,
          conversationId,
          orderLines,
          formValues,
        });
        messageApi.success(t('conversation.clientOrders.placeOrderSuccess'));
        resetDrawerState();
        onOrderCreated?.();
        onClose();
      } catch (error) {
        messageApi.error(
          getApiErrorMessage(error, t('conversation.clientOrders.placeOrderFailed')),
        );
      }
    }, [
      conversationId,
      form,
      linkedClient,
      messageApi,
      onClose,
      onOrderCreated,
      orderLines,
      ordersStore,
      resetDrawerState,
      t,
    ]);

    const handleVariantSelect = useCallback(
      (variantId: number) => {
        const variant = variantsById.get(variantId);
        if (variant) {
          addVariantToOrder(variant);
        }
      },
      [addVariantToOrder, variantsById],
    );

    const deliveryMethodOptions = useMemo(
      () => [
        { value: 'nova_poshta', label: t('conversation.clientOrders.drawer.deliveryNovaPoshta') },
      ],
      [t],
    );

    const billingMethodOptions = useMemo(
      () => [
        { value: 'cash', label: t('conversation.clientOrders.drawer.billingCash') },
        { value: 'card', label: t('conversation.clientOrders.drawer.billingCard') },
      ],
      [t],
    );

    if (!linkedClient) {
      return null;
    }

    return (
      <>
        {contextHolder}
        <Drawer
          title={t('conversation.clientOrders.drawerTitle')}
          closable={{ 'aria-label': t('conversation.clientOrders.closeDrawerAria') }}
          onClose={handleDrawerClose}
          open={onOpen}
          size={960}
          destroyOnHidden
          footer={
            <Flex gap={16} vertical>
              <Flex justify="space-between" align="center" gap={16}>
                <Statistic
                  title={t('conversation.clientOrders.drawer.footerAmountOfProducts')}
                  value={orderTotals.productCount}
                />
                <Statistic
                  title={t('conversation.clientOrders.drawer.footerTotal')}
                  value={orderTotals.total}
                  suffix={orderTotals.currency}
                  formatter={(value) => Number(value).toLocaleString('uk-UA')}
                />
              </Flex>
              <Flex gap={6} justify="flex-end">
                <Button onClick={handleDrawerClose}>
                  {t('conversation.clientOrders.drawer.cancel')}
                </Button>
                <Button
                  type="primary"
                  disabled={orderLines.length === 0}
                  loading={ordersStore.createLoading}
                  onClick={() => void handlePlaceOrder()}
                >
                  {t('conversation.clientOrders.drawer.placeOrder')}
                </Button>
              </Flex>
            </Flex>
          }
        >
          <Flex vertical gap={16}>
            <Card
              size="small"
              title={sectionTitle(1, t('conversation.clientOrders.drawer.sectionClient'))}
              styles={{
                root: {
                  borderColor: '#e2e1e1',
                },
                header: {
                  borderColor: '#e2e1e1',
                },
              }}
            >
              <Flex align="center" gap={16}>
                <Avatar size={48} src={clientPic}>
                  {linkedClient.firstName?.[0]}
                </Avatar>
                <Flex vertical>
                  <Text>
                    <Text type="secondary">{t('conversation.clientOrders.drawer.labelName')} </Text>
                    {linkedClient.firstName} {linkedClient.lastName}
                  </Text>
                  <Text>
                    <Text type="secondary">
                      {t('conversation.clientOrders.drawer.labelPhone')}{' '}
                    </Text>
                    {linkedClient.phone || '-'}
                  </Text>
                  <Text>
                    <Text type="secondary">
                      {t('conversation.clientOrders.drawer.labelDelivery')}{' '}
                    </Text>
                    {linkedClient.deliveryInfo || '-'}
                  </Text>
                </Flex>
              </Flex>
            </Card>

            <Card
              size="small"
              title={sectionTitle(2, t('conversation.clientOrders.drawer.sectionProducts'))}
              extra={
                <Tag color="processing">{t('conversation.clientOrders.drawer.tagRecommended')}</Tag>
              }
              styles={{
                root: {
                  borderColor: '#e2e1e1',
                },
                header: {
                  borderColor: '#e2e1e1',
                },
              }}
            >
              <Flex vertical gap={16}>
                <Alert
                  type="info"
                  showIcon={false}
                  title={
                    <Text strong italic>
                      {t('conversation.clientOrders.drawer.recommendedTitle')}
                    </Text>
                  }
                  description={
                    <Flex vertical gap={12}>
                      <Text>{t('conversation.clientOrders.drawer.recommendedDescription')}</Text>
                      <Flex justify="space-between" gap={8}>
                        {recommendedProducts.map((item) => (
                          <ProductCard
                            key={item.id}
                            title={item.title}
                            imageUrl={item.imageUrl}
                            size={item.size}
                            color={item.color}
                            price={item.price}
                            stockCount={item.stockCount}
                            checked={false}
                            onChange={(checked) => console.log(checked)}
                          />
                        ))}
                      </Flex>
                    </Flex>
                  }
                />

                <Divider plain>{t('conversation.clientOrders.drawer.addProductDivider')}</Divider>

                <Select
                  key={productPickerKey}
                  showSearch
                  allowClear
                  placeholder={t('conversation.clientOrders.drawer.productSearchPlaceholder')}
                  filterOption={false}
                  loading={ordersStore.catalogSearchLoading}
                  style={{ width: '100%' }}
                  listHeight={320}
                  options={variantSelectOptions}
                  onSearch={(value) => {
                    setSearchQuery(value);
                    if (value.trim().length < MIN_SEARCH_LENGTH) {
                      ordersStore.clearCatalogSearch();
                    }
                  }}
                  onSelect={handleVariantSelect}
                  notFoundContent={
                    ordersStore.catalogSearchLoading ? (
                      <Flex justify="center" style={{ padding: 12 }}>
                        <Spin size="small" />
                      </Flex>
                    ) : trimmedSearch.length < MIN_SEARCH_LENGTH ? (
                      <Text type="secondary">
                        {t('conversation.clientOrders.drawer.searchMinChars', {
                          count: MIN_SEARCH_LENGTH,
                        })}
                      </Text>
                    ) : (
                      t('conversation.clientOrders.drawer.searchNoResults')
                    )
                  }
                  optionRender={(option) => {
                    const data = option.data as VariantSelectOptionData | undefined;
                    if (!data?.variant) {
                      return option.label;
                    }

                    return <CatalogVariantSearchItem variant={data.variant} />;
                  }}
                />

                <Divider plain>
                  {t('conversation.clientOrders.drawer.addedProductsDivider')}
                </Divider>

                {orderLines.length > 0 ? (
                  <Flex vertical gap={12}>
                    {orderLines.map((line) => (
                      <OrderProductLine
                        key={line.variantId}
                        variant={line.variant}
                        quantity={line.quantity}
                        onQuantityChange={(quantity) =>
                          updateLineQuantity(line.variantId, quantity)
                        }
                        onRemove={() => removeLine(line.variantId)}
                      />
                    ))}
                  </Flex>
                ) : (
                  <Empty
                    description={t('conversation.clientOrders.drawer.addedProductsEmpty')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Flex>
            </Card>

            <Card
              size="small"
              title={sectionTitle(3, t('conversation.clientOrders.drawer.sectionOrderDetails'))}
              styles={{
                root: {
                  borderColor: '#e2e1e1',
                },
                header: {
                  borderColor: '#e2e1e1',
                },
              }}
            >
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={t('conversation.clientOrders.drawer.deliveryMethodLabel')}
                      name="deliveryMethod"
                    >
                      <Select
                        placeholder={t(
                          'conversation.clientOrders.drawer.deliveryMethodPlaceholder',
                        )}
                        options={deliveryMethodOptions}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={t('conversation.clientOrders.drawer.postAddressLabel')}
                      name="postAddress"
                    >
                      <Select
                        placeholder={t('conversation.clientOrders.drawer.postAddressPlaceholder')}
                        options={[
                          { value: 'jack', label: 'Jack' },
                          { value: 'lucy', label: 'Lucy' },
                          { value: 'Yiminghe', label: 'Yiminghe' },
                          { value: 'disabled', label: 'Disabled' },
                        ]}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={t('conversation.clientOrders.drawer.billingMethodLabel')}
                      name="billingMethod"
                    >
                      <Select
                        placeholder={t('conversation.clientOrders.drawer.billingMethodPlaceholder')}
                        options={billingMethodOptions}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={t('conversation.clientOrders.drawer.commentLabel')}
                      name="comment"
                    >
                      <Input
                        placeholder={t('conversation.clientOrders.drawer.commentPlaceholder')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Flex>
        </Drawer>
      </>
    );
  },
);
