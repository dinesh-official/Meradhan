"use client";
// navbarConfig.ts
import {
    BarChart,
    Briefcase,
    ClipboardList,
    FileText,
    HelpCircle,
    PieChart,
    Shield,
    ShoppingCart,
    Trash2,
    Users
} from 'lucide-react';
import React from "react";
import { FaMoneyBill } from 'react-icons/fa';
import { ModuleName, Permission } from './role.constants';

/**
 * Define the structure of nested navigation items (up to 4 levels)
 */
export interface NavItem {
    label: string;
    path?: string;
    icon?: React.ComponentType<{ className: string, size?: number }>;
    module?: ModuleName;
    children?: NavItem[]; // nested submenus
    allowOnly?: Permission[],
    section?: boolean
}

/**
 * NAV_ITEMS with 4-level nesting
 */
export const NAV_ITEMS: NavItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: PieChart,
        module: 'dashboard',
        allowOnly: ["view:dashboard"]
    },

    {
        label: 'Leads',
        icon: Users,
        allowOnly: ['create:leads', "edit:leads", "view:leads", "delete:leads"],
        children: [
            {
                label: 'All Leads',
                path: '/dashboard/leads',
                module: 'leads',
                allowOnly: ['view:leads']
            },
            {
                label: 'New Lead',
                path: '/dashboard/leads/create',
                module: 'leads',
                allowOnly: ['create:leads', 'edit:leads', 'delete:leads']
            },
        ]
    },

    {
        label: 'Customers',
        icon: FileText,
        allowOnly: ['view:customer', 'create:customer'],
        children: [
            {
                label: 'Customers List',
                path: '/dashboard/customers',
                module: 'customer',
                allowOnly: ['view:customer']
            },
            {
                label: 'Create Customer',
                path: '/dashboard/customers/create',
                module: 'customer',
                allowOnly: ['create:customer']
            },

        ]
    },

    {
        label: 'RFQ Management',
        icon: ClipboardList,
        module: 'rfq',
        allowOnly: ['view:rfq', 'edit:rfq', 'create:rfq'],
        children: [
            {
                label: 'Overview',
                path: '/dashboard/rfqs/overview',
                module: 'rfq',
                allowOnly: ['view:rfq'],
            },
            {
                label: 'NSE RFQs',
                allowOnly: ['view:rfq', 'edit:rfq'],
                children: [
                    {
                        label: 'Manage RFQs',
                        path: '/dashboard/rfqs/nse',
                        module: 'rfq',
                        allowOnly: ['edit:rfq'],
                    },
                    {
                        label: 'Manage Deals',
                        path: '/dashboard/rfqs/nse/deals',
                        module: 'rfq',
                        allowOnly: ['edit:rfq'],
                    },
                    {
                        label: 'Settle Orders',
                        path: '/dashboard/rfqs/nse/settle-orders',
                        module: 'rfq',
                        allowOnly: ['edit:rfq'],
                    },
                    {
                        label: 'Participants',
                        path: '/dashboard/rfqs/nse/participants',
                        module: 'rfq',
                        allowOnly: ['view:rfq'],
                    },
                    // {
                    //     label: 'Add Participant',
                    //     path: '/dashboard/rfqs/nse/participants/create',
                    //     module: 'rfq',
                    //     allowOnly: ['create:rfq'],
                    // },
                ]
            }
        ]
    },

    {
        label: 'Sales',
        icon: ShoppingCart,
        path: "#",
        module: 'sales',
        allowOnly: ['view:sales']
    },

    {
        label: 'Support Tickets',
        icon: HelpCircle,
        allowOnly: ['view:support', 'edit:support', 'create:support'],
        children: [
            {
                label: 'Manage Tickets',
                path: '#',
                module: 'support',
                allowOnly: ['view:support', 'edit:support', 'create:support']
            },
            {
                label: 'New Ticket',
                path: '#',
                module: 'support',
                allowOnly: ['create:support']
            },
        ]
    },
    {
        label: 'Bonds',
        path: '/dashboard/bonds',
        icon: FaMoneyBill,
        module: 'bonds',
        allowOnly: ["view:bonds"]
    },
    {
        label: 'Reports',
        icon: BarChart,
        path: "#",
        module: 'reports',
        allowOnly: ['view:reports']
    },

    {
        label: "Administration",
        section: true,
        allowOnly: ['view:user', 'create:user', 'edit:user', 'view:bin', 'view:webanalytics', 'view:webauditlogs']
    },

    {
        label: 'User Management',
        icon: Briefcase,
        allowOnly: ['view:user', 'create:user', 'edit:user'],
        children: [
            {
                label: 'All Users',
                path: '/dashboard/user-management',
                module: 'user',
                allowOnly: ['view:user']
            },
            {
                label: 'Suspended Users',
                path: '/dashboard/user-management/suspended',
                module: 'user',
                allowOnly: ['edit:user']
            }
        ]
    },

    {
        label: 'Audit Logs',
        icon: Shield,
        allowOnly: ['view:webauditlogs', 'view:crmauditlogs'],
        children: [
            {
                label: 'CRM Logs',
                module: 'crmauditlogs',
                allowOnly: ['view:crmauditlogs'],
                children: [
                    {
                        label: 'Activity Logs',
                        path: '/dashboard/audit-logs/crm/activity',
                        module: 'crmauditlogs',
                        allowOnly: ['view:crmauditlogs'],
                    },
                    {
                        label: 'Authentication Logs',
                        path: '/dashboard/audit-logs/crm/authentication',
                        module: 'crmauditlogs',
                        allowOnly: ['view:crmauditlogs'],
                    },
                    // {
                    //     label: 'Session Analytics',
                    //     path: '#',
                    //     module: 'crmauditlogs',
                    //     allowOnly: ['view:crmauditlogs'],
                    // }
                ]
            },
            {
                label: 'Website Logs',
                module: 'webauditlogs',
                allowOnly: ['view:webauditlogs'],
                children: [
                    {
                        label: 'Activity Logs',
                        path: '/dashboard/audit-logs/web/activity',
                        module: 'webauditlogs',
                        allowOnly: ['view:webauditlogs'],
                    },
                    {
                        label: 'Session Logs',
                        path: '/dashboard/audit-logs/web/authentication',
                        module: 'webauditlogs',
                        allowOnly: ['view:webauditlogs'],
                    }
                ]
            },
        ]
    },
    // {
    //     label: 'Website Analytics',
    //     path: '#',
    //     icon: Earth,
    //     module: 'bin',
    //     allowOnly: ['view:webanalytics']
    // },
    {
        label: 'Recycle Bin',
        path: '/dashboard/bin',
        icon: Trash2,
        module: 'bin',
        allowOnly: ['create:bin', 'view:bin', 'edit:bin', 'delete:bin']
    },
];
