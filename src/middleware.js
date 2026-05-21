import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const userPermissions = token?.permissions || [];
    const isAdmin = token?.role === "Admin" || userPermissions.includes("*");

    if (isAdmin) return NextResponse.next();

    // Route specific protections
    const routeChecks = [
      { prefix: "/dashboard/users", requiredPerm: "user.view" },
      { prefix: "/dashboard/roles", requiredPerm: "role.manage" },
      { prefix: "/dashboard/quotations", requiredPerm: "quotation.view" },
      { prefix: "/dashboard/customers", requiredPerm: "customer.view" },
      { prefix: "/dashboard/actuators", requiredPerm: "product.view" },
      { prefix: "/dashboard/items", requiredPerm: "product.view" },
      { prefix: "/dashboard/custom", requiredPerm: "product.view" },
    ];

    for (const check of routeChecks) {
      if (path.startsWith(check.prefix)) {
        if (!userPermissions.includes(check.requiredPerm)) {
          return NextResponse.redirect(new URL("/dashboard/unauthorized", req.url));
        }
      }
    }

    // Default: allow access if logged in
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
