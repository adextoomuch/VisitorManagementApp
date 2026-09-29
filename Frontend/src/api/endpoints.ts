
export const endpoints = {

    auth: {
        register: "/auth/register",
        login: "/auth/login",
        me: "/auth/me",
    },
    visitor: {
        getVisitors: "/visitors",
        createVisitor: "/visitors",
        approveVisitor: (id: string) => `/visitors/approve/${id}`,
        rejectVisitor: (id: string) => `/visitors/reject/${id}`,
        checkVisitor: "/visitors/checkUser",
        visitorReport: "/visitors/report",
        scanCheckIn: "/visitors/scan-checkin",
        scanCheckOut: "/visitors/scan-checkout",
    },
} as const;