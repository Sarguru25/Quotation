
```
quotation
├─ README.md
├─ eslint.config.mjs
├─ jsconfig.json
├─ middleware.js
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ TF_logo.png
│  └─ TF_logo2.png
└─ src
   ├─ app
   │  ├─ (auth)
   │  │  ├─ login
   │  │  │  └─ page.js
   │  │  └─ register
   │  │     └─ page.js
   │  ├─ api
   │  │  ├─ accessory-prices
   │  │  │  ├─ [id]
   │  │  │  │  └─ route.js
   │  │  │  ├─ route.js
   │  │  │  └─ seed
   │  │  │     └─ route.js
   │  │  ├─ actuator-prices
   │  │  │  ├─ [id]
   │  │  │  │  └─ route.js
   │  │  │  ├─ route.js
   │  │  │  └─ seed
   │  │  │     └─ route.js
   │  │  ├─ actuator-prices-sa
   │  │  │  ├─ [id]
   │  │  │  │  └─ route.js
   │  │  │  ├─ route.js
   │  │  │  └─ seed
   │  │  │     └─ route.js
   │  │  ├─ auth
   │  │  │  ├─ [...nextauth]
   │  │  │  │  └─ route.js
   │  │  │  └─ register
   │  │  │     └─ route.js
   │  │  ├─ customers
   │  │  │  └─ [id]
   │  │  │     └─ analytics
   │  │  │        └─ route.js
   │  │  ├─ invoices
   │  │  │  ├─ [id]
   │  │  │  │  ├─ email
   │  │  │  │  │  └─ route.js
   │  │  │  │  ├─ payment
   │  │  │  │  │  └─ route.js
   │  │  │  │  ├─ pdf
   │  │  │  │  │  └─ route.js
   │  │  │  │  └─ route.js
   │  │  │  ├─ convert
   │  │  │  │  └─ route.js
   │  │  │  ├─ route.js
   │  │  │  └─ sync
   │  │  │     └─ route.js
   │  │  ├─ public-quotations
   │  │  │  └─ [token]
   │  │  │     ├─ action
   │  │  │     │  └─ route.js
   │  │  │     ├─ pdf
   │  │  │     │  └─ route.js
   │  │  │     └─ route.js
   │  │  ├─ quotations
   │  │  │  ├─ [id]
   │  │  │  │  ├─ route.js
   │  │  │  │  └─ sync
   │  │  │  │     └─ route.js
   │  │  │  └─ route.js
   │  │  ├─ roles
   │  │  │  ├─ [id]
   │  │  │  │  └─ route.js
   │  │  │  └─ route.js
   │  │  ├─ sales-orders
   │  │  │  ├─ [id]
   │  │  │  │  ├─ email
   │  │  │  │  │  └─ route.js
   │  │  │  │  ├─ pdf
   │  │  │  │  │  └─ route.js
   │  │  │  │  ├─ route.js
   │  │  │  │  └─ status
   │  │  │  │     └─ route.js
   │  │  │  ├─ convert
   │  │  │  │  └─ route.js
   │  │  │  ├─ route.js
   │  │  │  └─ sync
   │  │  │     └─ route.js
   │  │  ├─ salesperson
   │  │  │  └─ [id]
   │  │  │     └─ stats
   │  │  │        └─ route.js
   │  │  ├─ sync
   │  │  │  ├─ customers
   │  │  │  │  └─ route.js
   │  │  │  ├─ invoices
   │  │  │  │  └─ route.js
   │  │  │  ├─ items
   │  │  │  │  └─ route.js
   │  │  │  ├─ quotations
   │  │  │  │  └─ route.js
   │  │  │  ├─ sales-orders
   │  │  │  │  └─ route.js
   │  │  │  └─ taxes
   │  │  │     └─ route.js
   │  │  ├─ test_dump
   │  │  │  └─ route.js
   │  │  ├─ users
   │  │  │  ├─ [id]
   │  │  │  │  └─ route.js
   │  │  │  └─ route.js
   │  │  ├─ visits
   │  │  │  ├─ [id]
   │  │  │  │  └─ route.js
   │  │  │  └─ route.js
   │  │  ├─ zoho
   │  │  │  ├─ callback
   │  │  │  │  └─ route.js
   │  │  │  ├─ customers
   │  │  │  │  ├─ [id]
   │  │  │  │  │  └─ route.js
   │  │  │  │  └─ route.js
   │  │  │  ├─ invoices
   │  │  │  │  ├─ [id]
   │  │  │  │  │  └─ route.js
   │  │  │  │  └─ create
   │  │  │  │     └─ route.js
   │  │  │  ├─ items
   │  │  │  │  ├─ [id]
   │  │  │  │  │  └─ route.js
   │  │  │  │  ├─ create
   │  │  │  │  │  └─ route.js
   │  │  │  │  └─ route.js
   │  │  │  ├─ login
   │  │  │  │  └─ route.js
   │  │  │  ├─ quotations
   │  │  │  │  └─ [id]
   │  │  │  │     ├─ convert-so
   │  │  │  │     │  └─ route.js
   │  │  │  │     ├─ mark-accepted
   │  │  │  │     │  └─ route.js
   │  │  │  │     ├─ mark-sent
   │  │  │  │     │  └─ route.js
   │  │  │  │     ├─ pdf
   │  │  │  │     │  └─ route.js
   │  │  │  │     ├─ send-email
   │  │  │  │     │  └─ route.js
   │  │  │  │     └─ share
   │  │  │  │        └─ route.js
   │  │  │  ├─ quotes
   │  │  │  │  ├─ [id]
   │  │  │  │  │  └─ route.js
   │  │  │  │  ├─ create
   │  │  │  │  │  └─ route.js
   │  │  │  │  └─ route.js
   │  │  │  ├─ sales-orders
   │  │  │  │  ├─ [id]
   │  │  │  │  │  └─ route.js
   │  │  │  │  └─ create
   │  │  │  │     └─ route.js
   │  │  │  ├─ sync
   │  │  │  │  └─ [id]
   │  │  │  │     └─ route.js
   │  │  │  └─ taxes
   │  │  │     └─ route.js
   │  │  ├─ zreqm-prices
   │  │  │  ├─ [id]
   │  │  │  │  └─ route.js
   │  │  │  ├─ route.js
   │  │  │  └─ seed
   │  │  │     └─ route.js
   │  │  └─ zreqt-prices
   │  │     ├─ [id]
   │  │     │  └─ route.js
   │  │     ├─ route.js
   │  │     └─ seed
   │  │        └─ route.js
   │  ├─ components
   │  │  ├─ ErrorMessage.js
   │  │  ├─ Loading.js
   │  │  └─ Sidebar.js
   │  ├─ dashboard
   │  │  ├─ custom
   │  │  │  ├─ QuotationProducts.jsx
   │  │  │  ├─ accessories.jsx
   │  │  │  ├─ electric_actuator.jsx
   │  │  │  ├─ page.jsx
   │  │  │  └─ pneumatic_actuators.jsx
   │  │  ├─ customers
   │  │  │  ├─ [id]
   │  │  │  │  ├─ CustomerView.jsx
   │  │  │  │  ├─ PrintButton.jsx
   │  │  │  │  ├─ edit
   │  │  │  │  │  └─ page.jsx
   │  │  │  │  └─ page.jsx
   │  │  │  ├─ new
   │  │  │  │  └─ page.jsx
   │  │  │  └─ page.jsx
   │  │  ├─ invoices
   │  │  │  ├─ [id]
   │  │  │  │  ├─ edit
   │  │  │  │  │  └─ page.jsx
   │  │  │  │  └─ page.jsx
   │  │  │  ├─ create
   │  │  │  │  └─ page.jsx
   │  │  │  └─ page.jsx
   │  │  ├─ items
   │  │  │  └─ page.jsx
   │  │  ├─ layout.jsx
   │  │  ├─ page.jsx
   │  │  ├─ priceData
   │  │  │  ├─ AccessoriesTab.jsx
   │  │  │  ├─ PneumaticTab.jsx
   │  │  │  ├─ ZreqmTab.jsx
   │  │  │  ├─ ZreqtTab.jsx
   │  │  │  └─ page.jsx
   │  │  ├─ quotations
   │  │  │  ├─ [id]
   │  │  │  │  ├─ ActivityTimeline.jsx
   │  │  │  │  ├─ QuotationActionBar.jsx
   │  │  │  │  ├─ SendEmailModal.jsx
   │  │  │  │  ├─ ShareLinkModal.jsx
   │  │  │  │  └─ page.jsx
   │  │  │  └─ page.jsx
   │  │  ├─ roles
   │  │  │  └─ page.jsx
   │  │  ├─ sales-orders
   │  │  │  ├─ [id]
   │  │  │  │  ├─ edit
   │  │  │  │  │  └─ page.jsx
   │  │  │  │  └─ page.jsx
   │  │  │  ├─ create
   │  │  │  │  └─ page.jsx
   │  │  │  └─ page.jsx
   │  │  ├─ sync
   │  │  │  └─ page.jsx
   │  │  ├─ unauthorized
   │  │  │  └─ page.jsx
   │  │  ├─ users
   │  │  │  └─ page.jsx
   │  │  └─ visits
   │  │     ├─ [id]
   │  │     │  ├─ edit
   │  │     │  │  └─ page.jsx
   │  │     │  └─ page.js
   │  │     ├─ new
   │  │     │  └─ page.jsx
   │  │     └─ page.jsx
   │  ├─ globals.css
   │  ├─ layout.jsx
   │  ├─ page.jsx
   │  ├─ providers.jsx
   │  └─ view
   │     └─ [token]
   │        └─ page.jsx
   ├─ components
   │  └─ common
   │     └─ DataTable.jsx
   ├─ lib
   │  ├─ actuatorEngine.js
   │  ├─ authOptions.js
   │  ├─ db-queries
   │  │  ├─ getCustomers.js
   │  │  ├─ getInvoiceById.js
   │  │  ├─ getInvoices.js
   │  │  ├─ getItems.js
   │  │  ├─ getQuotations.js
   │  │  ├─ getSalesOrderById.js
   │  │  ├─ getSalesOrders.js
   │  │  └─ getTaxes.js
   │  ├─ db.js
   │  ├─ rbac
   │  │  ├─ auth.js
   │  │  └─ permissions.js
   │  ├─ zoho
   │  │  ├─ auth.js
   │  │  ├─ client.js
   │  │  ├─ config.js
   │  │  ├─ customers.js
   │  │  ├─ invoices.js
   │  │  ├─ items.js
   │  │  ├─ quotations.js
   │  │  ├─ salesOrders.js
   │  │  └─ taxes.js
   │  ├─ zoho-sync
   │  │  ├─ syncCustomers.js
   │  │  ├─ syncInvoices.js
   │  │  ├─ syncItems.js
   │  │  ├─ syncQuotations.js
   │  │  ├─ syncSalesOrders.js
   │  │  └─ syncTaxes.js
   │  └─ zoho.js
   └─ models
      ├─ AccessoryPrice.js
      ├─ ActivityLog.js
      ├─ ActuatorPrice.js
      ├─ ActuatorPriceSA.js
      ├─ Customer.js
      ├─ Invoice.js
      ├─ Item.js
      ├─ PublicQuotationLink.js
      ├─ Quotation.js
      ├─ Role.js
      ├─ SalesOrder.js
      ├─ SyncLog.js
      ├─ Tax.js
      ├─ User.js
      ├─ Visit.js
      ├─ ZreqmPrice.js
      └─ ZreqtPrice.js

```