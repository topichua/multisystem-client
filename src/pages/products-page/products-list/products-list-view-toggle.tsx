import { ListIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { Flex, Segmented } from 'antd';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { useProductsStore } from '@/features/products/model/use-products-store';
import type { ProductsListViewMode } from '@/features/products/model/products-list-view-storage';

export const ProductsListViewToggle = observer(() => {
  const { t } = useTranslation();
  const productsStore = useProductsStore();

  return (
    <Segmented<ProductsListViewMode>
      value={productsStore.listViewMode}
      aria-label={t('products.listView.toggleAria')}
      onChange={(value) => productsStore.setListViewMode(value)}
      size="large"
      options={[
        {
          value: 'list',
          label: (
            <Flex align="center" justify="center" style={{ width: '100%' }}>
              <ListIcon size={22} />
            </Flex>
          ),
        },
        {
          value: 'grid',
          label: (
            <Flex align="center" justify="center" style={{ width: '100%' }}>
              <SquaresFourIcon size={22} />
            </Flex>
          ),
        },
      ]}
      styles={{
        item: { display: 'flex', justifyContent: 'center' },
        label: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' },
      }}
      style={{ display: 'flex' }}
    />
  );
});
