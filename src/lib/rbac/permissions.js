export const PERMISSIONS = {
  QUOTATION: {
    CREATE: "quotation.create",
    VIEW: "quotation.view",
    EDIT: "quotation.edit",
    DELETE: "quotation.delete",
    APPROVE: "quotation.approve",
    SEND: "quotation.send",
    CONVERT_SO: "quotation.convert_so",
    VIEW_ALL: "quotation.view_all", // view quotes not owned by user/team
  },
  SALES_ORDER: {
    CREATE: "salesorder.create",
    VIEW: "salesorder.view",
    EDIT: "salesorder.edit",
    DELETE: "salesorder.delete",
    APPROVE: "salesorder.approve",
    SEND: "salesorder.send",
    VIEW_ALL: "salesorder.view_all",
  },
  INVOICE: {
    CREATE: "invoice.create",
    VIEW: "invoice.view",
    EDIT: "invoice.edit",
    DELETE: "invoice.delete",
    APPROVE: "invoice.approve",
    SEND: "invoice.send",
    VIEW_ALL: "invoice.view_all",
  },
  CUSTOMER: {
    CREATE: "customer.create",
    VIEW: "customer.view",
    EDIT: "customer.edit",
    DELETE: "customer.delete",
  },
  USER: {
    CREATE: "user.create",
    VIEW: "user.view",
    EDIT: "user.edit",
    DELETE: "user.delete",
  },
  PRODUCT: {
    CREATE: "product.create",
    VIEW: "product.view",
    EDIT: "product.edit",
    DELETE: "product.delete",
  },
  PRICE_DATA: {
    VIEW: "pricedata.view",
    MANAGE: "pricedata.manage",
  },
  CUSTOM_QUOTE: {
    CREATE: "customquote.create",
    VIEW: "customquote.view",
    EDIT: "customquote.edit",
    DELETE: "customquote.delete",
  },
  SYSTEM: {
    MANAGE_SETTINGS: "settings.manage",
    VIEW_REPORTS: "reports.view",
    VIEW_ANALYTICS: "analytics.view",
  },
  ROLE: {
    MANAGE: "role.manage"
  },
  VISIT: {
    CREATE: "visit.create",
    VIEW: "visit.view",
    EDIT: "visit.edit",
    DELETE: "visit.delete",
  }
};

// Default roles and their typical permissions (for seeding or reference)
export const DEFAULT_ROLES = {
  ADMIN: {
    name: "Admin",
    permissions: Object.values(PERMISSIONS).flatMap(module => Object.values(module))
  },
  MANAGER: {
    name: "Manager",
    permissions: [
      PERMISSIONS.QUOTATION.CREATE, PERMISSIONS.QUOTATION.VIEW, PERMISSIONS.QUOTATION.EDIT, PERMISSIONS.QUOTATION.DELETE, PERMISSIONS.QUOTATION.APPROVE, PERMISSIONS.QUOTATION.SEND, PERMISSIONS.QUOTATION.CONVERT_SO,
      PERMISSIONS.SALES_ORDER.CREATE, PERMISSIONS.SALES_ORDER.VIEW, PERMISSIONS.SALES_ORDER.EDIT, PERMISSIONS.SALES_ORDER.DELETE, PERMISSIONS.SALES_ORDER.APPROVE, PERMISSIONS.SALES_ORDER.SEND,
      PERMISSIONS.INVOICE.CREATE, PERMISSIONS.INVOICE.VIEW, PERMISSIONS.INVOICE.EDIT, PERMISSIONS.INVOICE.DELETE, PERMISSIONS.INVOICE.APPROVE, PERMISSIONS.INVOICE.SEND,
      PERMISSIONS.CUSTOMER.CREATE, PERMISSIONS.CUSTOMER.VIEW, PERMISSIONS.CUSTOMER.EDIT,
      PERMISSIONS.PRODUCT.VIEW,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.PRICE_DATA.VIEW, PERMISSIONS.PRICE_DATA.MANAGE,
      PERMISSIONS.CUSTOM_QUOTE.CREATE, PERMISSIONS.CUSTOM_QUOTE.VIEW, PERMISSIONS.CUSTOM_QUOTE.EDIT, PERMISSIONS.CUSTOM_QUOTE.DELETE,
      PERMISSIONS.VISIT.CREATE, PERMISSIONS.VISIT.VIEW, PERMISSIONS.VISIT.EDIT, PERMISSIONS.VISIT.DELETE
    ]
  },
  EXECUTIVE: {
    name: "Executive",
    permissions: [
      PERMISSIONS.QUOTATION.CREATE, PERMISSIONS.QUOTATION.VIEW, PERMISSIONS.QUOTATION.EDIT, PERMISSIONS.QUOTATION.SEND,
      PERMISSIONS.SALES_ORDER.CREATE, PERMISSIONS.SALES_ORDER.VIEW, PERMISSIONS.SALES_ORDER.EDIT, PERMISSIONS.SALES_ORDER.SEND,
      PERMISSIONS.INVOICE.CREATE, PERMISSIONS.INVOICE.VIEW, PERMISSIONS.INVOICE.EDIT, PERMISSIONS.INVOICE.SEND,
      PERMISSIONS.CUSTOMER.VIEW, PERMISSIONS.CUSTOMER.CREATE,
      PERMISSIONS.PRODUCT.VIEW,
      PERMISSIONS.PRICE_DATA.VIEW,
      PERMISSIONS.CUSTOM_QUOTE.CREATE, PERMISSIONS.CUSTOM_QUOTE.VIEW, PERMISSIONS.CUSTOM_QUOTE.EDIT,
      PERMISSIONS.VISIT.CREATE, PERMISSIONS.VISIT.VIEW, PERMISSIONS.VISIT.EDIT
    ]
  },
  VIEWER: {
    name: "Viewer",
    permissions: [
      PERMISSIONS.QUOTATION.VIEW,
      PERMISSIONS.SALES_ORDER.VIEW,
      PERMISSIONS.INVOICE.VIEW,
      PERMISSIONS.CUSTOMER.VIEW,
      PERMISSIONS.PRODUCT.VIEW,
      PERMISSIONS.PRICE_DATA.VIEW,
      PERMISSIONS.CUSTOM_QUOTE.VIEW,
      PERMISSIONS.VISIT.VIEW
    ]
  }
};

export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions) return false;
  // Admin wildcard or exact match
  return userPermissions.includes("*") || userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions, requiredPermissionsArray) => {
  if (!userPermissions) return false;
  if (userPermissions.includes("*")) return true;
  return requiredPermissionsArray.some(p => userPermissions.includes(p));
};
