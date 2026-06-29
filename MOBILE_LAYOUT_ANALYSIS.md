# Mobile layout analysis

Документ оновлено після staged mobile-pass. Старі блоки, які вже закриті в staged змінах, прибрані з активного backlog. Поточний mobile напрямок не стискає desktop sidebar: на телефоні використовується `MobileAppHeader`, drawer-навігація, mobile hub/index routes і окремі full-screen list/detail pages.

## Що вже закрито staged змінами

- Global shell: старий `MobileDock` прибрано, додано `MobileAppHeader`, `MobileAppNavigationDrawer`, `mobileNavSections`, theme control у drawer/sider і mobile home quick actions.
- Основні routes доступні з mobile без desktop sidebar: `/products`, `/orders`, `/clients`, `/team`, `/settings`, `/analytics`, `/instagram`, `/conversations`.
- Для `/products`, `/orders`, `/clients`, `/team`, `/settings` додані mobile hub/index routes замість mobile inline-menu з `SettingsShell`.
- `/products/list`: mobile card list, search/sort/filter toolbar, compact pagination, bottom filter drawer.
- `/products/list/add` і `/products/list/product/:productId`: mobile one-column form, visible back action, mobile variants cards, full-height Instagram AI drawer.
- `/products/categories` і `/products/characteristics`: route-driven mobile list/detail screens з back action, search/create header і mobile rows/cards.
- `/orders/list`: mobile order cards, mobile search/filter toolbar, bottom filter drawer.
- `/orders/:orderId`: mobile full-screen detail wrapper, compact header, full-width status select, one-column content cards.
- `/orders/statuses`: route-driven mobile statuses list/detail, touch reorder list, back action, sticky save.
- `/clients/clients`: mobile client cards and mobile-friendly client create/edit modal.
- `/team/members`: mobile member cards and extracted mobile route.
- `/team/roles`: mobile roles list/detail editor, permissions mobile layout, sticky save/delete.
- `/settings/groups`, `/settings/templates`, `/settings/user`, `/settings/system`, `/settings/integrations`: mobile hub plus route-driven mobile list/detail/pages.
- `/login` і `/invitation`: staged CSS already switches key layout heights to `100dvh`.

## Що залишилось

### `/conversations`

Стан:

- Staged зміни не зачіпають `src/pages/conversation` або `src/components/layout/conversations-shell`.
- Mobile header все ще має shortcut drawer із `Conversation`, але це не route-first chat UX.
- Через відсутність тестових chat даних зараз немає чим повноцінно перевірити список, thread і client info.

Що ще треба зробити або перевірити:

- `/conversations` на mobile має показувати список чатів, а не пустий thread.
- `/conversations/:conversationId` має показувати тільки thread.
- У thread header потрібна явна back/list дія до `/conversations` або відкриття списку.
- Групи чатів краще винести у filter chips або drawer section у списку.
- Composer і messages scroll треба перевірити на 360px: padding має бути компактним, без конфлікту з safe area і mobile header.
- Client info drawer на mobile краще зробити full-screen або bottom sheet з логічними секціями client/orders/links.

Файли для наступного проходу:

- `src/pages/conversation/conversations-page.tsx`
- `src/pages/conversation/conversation-details/conversation-details.tsx`
- `src/pages/conversation/conversation-details/conversation-details.styled.tsx`
- `src/components/layout/conversations-shell/conversations-shell.styled.tsx`

### `/instagram`

Стан:

- Staged зміни не зачіпають `src/pages/instagram-page`.
- `InstagramPageShell` все ще напряму використовує `SettingsShell`, тому `SettingsShell` поки не можна зробити desktop-only без окремого Instagram mobile pass.
- Для `/products`, `/orders`, `/clients`, `/team`, `/settings` `SettingsShell` уже перестав бути mobile-рішенням: parent routes віддають mobile route screens через route-first flow.
- Без integration/feed/post даних зараз важко коректно оцінити реальний mobile стан.

Що ще треба зробити або перевірити:

- Account/integration selector на mobile має бути dropdown або horizontal account switcher, не desktop sidebar.
- Media filters краще зробити horizontal scroll chips, щоб вони не займали пів екрана.
- Feed/list має лишатися одною колонкою з великим media preview.
- `InstagramProfileHeader` має переносити stats у другий ряд на вузьких екранах.
- Після міграції Instagram прибрати залежність mobile layout від `SettingsShell`: або винести Instagram у власний mobile shell, або route-first screens як в інших розділах.
- Після цього зробити `SettingsShell` desktop-only і прибрати з нього mobile media rules, які зараз лишаються як тимчасовий fallback для Instagram.

Файли для наступного проходу:

- `src/pages/instagram-page/instagram-page.tsx`
- `src/pages/instagram-page/components/instagram-page-shell/*`
- `src/pages/instagram-page/components/shared/instagram-page-shell.tsx`
- `src/components/settings/settings-shell/settings-shell.styled.tsx`
- `src/pages/instagram-page/components/profile/*`
- `src/pages/instagram-page/components/media/*`

### `/instagram/:postId`

Стан:

- Staged зміни не зачіпають post detail.
- Перевірку краще робити після появи post/comments/linked-products даних.

Що ще треба зробити або перевірити:

- Comments краще відкривати bottom sheet або full-screen drawer, а не тримати нижче всього content.
- `commentsOpen` на mobile не має автоматично забирати сторінку.
- `InstagramPostSummary` має переходити з row у column.
- Media preview не має мати fixed width `300px`; краще `width: min(100%, 360px)` або full-width card з aspect-ratio.
- Linked products table на mobile краще замінити product cards або compact rows.

Файли для наступного проходу:

- `src/pages/instagram-page/instagram-post-page.tsx`
- `src/pages/instagram-page/components/post-detail/instagram-post-detail-content.styled.tsx`
- `src/pages/instagram-page/components/post-detail/*`

### `/analytics`

Стан:

- Page still under construction.
- Staged mobile shell робить route доступним, але analytics content ще фактично нема що оцінювати.

Що ще треба зробити або перевірити:

- Empty/under-construction state має бути compact і коректно centered на 360px.
- Коли з'являться charts, використовувати vertical cards без wide table assumptions.
- Charts і loading/error states перевірити на 360x800, 390x844, 430x932, 768x1024.

Файли для наступного проходу:

- `src/pages/analytics-page/*`

## Пріоритет наступного проходу

1. `/conversations` і `/conversations/:conversationId`: route-first mobile list/thread, back/list action, composer safe area, client info drawer.
2. `/instagram` і `/instagram/:postId`: прибрати mobile залежність від `SettingsShell`, додати mobile account selector, filter chips, comments bottom sheet, full-width media preview.
3. Mobile modal QA for create/invite flows listed above.
4. Після Instagram pass зробити `SettingsShell` desktop-only і видалити його mobile media fallback.
5. `/analytics`: compact empty state now, chart layout rules later.
6. Manual viewport QA: 360x800, 390x844, 430x932, 768x1024.

## Acceptance checklist залишку

- На `/conversations` mobile користувач може вибрати чат без прихованої desktop колонки.
- На `/conversations/:conversationId` є back/list action, composer не перекривається safe area, client info usable на 360px.
- `/instagram` usable без desktop sidebar, filters не займають надмірну висоту.
- `/instagram/:postId` має mobile-friendly media, comments і linked products.
- Усі залишені modals/drawers usable на 360px.
- `/analytics` empty/loading/error state виглядає коректно на mobile.
- Перевірені viewport sizes: 360x800, 390x844, 430x932, 768x1024.
