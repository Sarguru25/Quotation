
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
│  └─ TF_logo.png
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
   │  │  ├─ users
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
   │  │  │  │     └─ send-email
   │  │  │  │        └─ route.js
   │  │  │  ├─ quotes
   │  │  │  │  ├─ [id]
   │  │  │  │  │  └─ route.js
   │  │  │  │  ├─ create
   │  │  │  │  │  └─ route.js
   │  │  │  │  └─ route.js
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
   │  │  │  │  ├─ PrintButton.jsx
   │  │  │  │  └─ page.jsx
   │  │  │  ├─ new
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
   │  │  │  │  └─ page.jsx
   │  │  │  └─ page.jsx
   │  │  ├─ roles
   │  │  │  └─ page.jsx
   │  │  ├─ unauthorized
   │  │  │  └─ page.jsx
   │  │  └─ users
   │  │     └─ page.jsx
   │  ├─ globals.css
   │  ├─ layout.jsx
   │  ├─ page.jsx
   │  └─ providers.jsx
   ├─ data
   │  ├─ ZRA_Adaptor.json
   │  ├─ ZRA_DA.json
   │  ├─ ZRA_Drawing_no.json
   │  ├─ ZRA_SA.json
   │  ├─ ZRA_other_details.json
   │  ├─ ZRB_Adaptor.json
   │  ├─ ZRB_DA.json
   │  ├─ ZRB_Drawing_no.json
   │  ├─ ZRB_SA.json
   │  ├─ ZRB_other_details.json
   │  ├─ ZRC_Adaptor.json
   │  ├─ ZRC_DA.json
   │  ├─ ZRC_Drawing_no.json
   │  ├─ ZRC_SA.json
   │  ├─ ZRC_other_details.json
   │  ├─ ZRD_Adaptor.json
   │  ├─ ZRD_DA.json
   │  ├─ ZRD_Drawing_no.json
   │  ├─ ZRD_SA.json
   │  ├─ ZRD_other_details.json
   │  ├─ ZREQM.json
   │  ├─ ZREQT.json
   │  └─ accessories.json
   ├─ lib
   │  ├─ actuatorEngine.js
   │  ├─ authOptions.js
   │  ├─ db.js
   │  ├─ rbac
   │  │  ├─ auth.js
   │  │  └─ permissions.js
   │  ├─ zoho
   │  │  ├─ auth.js
   │  │  ├─ client.js
   │  │  ├─ config.js
   │  │  ├─ customers.js
   │  │  ├─ items.js
   │  │  ├─ quotations.js
   │  │  ├─ salesOrders.js
   │  │  └─ taxes.js
   │  └─ zoho.js
   ├─ middleware.js
   └─ models
      ├─ AccessoryPrice.js
      ├─ ActivityLog.js
      ├─ ActuatorPrice.js
      ├─ ActuatorPriceSA.js
      ├─ Quotation.js
      ├─ Role.js
      ├─ User.js
      ├─ ZreqmPrice.js
      └─ ZreqtPrice.js

```