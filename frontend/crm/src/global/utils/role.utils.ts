import { NAV_ITEMS, NavItem } from '../constants/navlinks.constants';
import { ROLE_PERMISSIONS, Role, Permission } from '../constants/role.constants';

const NOTIFICATION_ROLES: Role[] = ["SALES", "ADMIN", "SUPER_ADMIN"];

export function canAccessNotifications(role: Role): boolean {
  return NOTIFICATION_ROLES.includes(role);
}

// 7️⃣ Helper to check permission
export const hasPermission = (role: Role, permission: Permission): boolean => {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

export const hasOneOfPermission = (role: Role, permissions: Permission[]): boolean => {
  const allowed = ROLE_PERMISSIONS[role] ?? [];
  return permissions.some(p => allowed.includes(p));
};

/**
 * Filters navigation items based on user permissions
 */
function generateNavItemsByPermissions(
    navItems: NavItem[],
    userPermissions: Permission[],
    userRole: Role,
): NavItem[] {
    const hasAccess = (item: NavItem): boolean => {
        if (item.roles && !item.roles.includes(userRole)) {
            return false;
        }
        if (!item.allowOnly || item.allowOnly.length === 0) {
            return true;
        }
        return item.allowOnly.some(permission => userPermissions.includes(permission));
    };

    const filterNavItems = (items: NavItem[]): NavItem[] => {
        return items
            .map(item => {
                let filteredChildren: NavItem[] | undefined;

                if (item.children) {
                    filteredChildren = filterNavItems(item.children);
                }

                if (hasAccess(item) || (filteredChildren && filteredChildren.length > 0)) {
                    return {
                        ...item,
                        children: filteredChildren,
                    } as NavItem; // ✅ cast as NavItem
                }

                return null;
            })
            .filter((item): item is NavItem => item !== null); // type guard
    };

    return filterNavItems(navItems);
}

/**
 * Generate navigation items based on a role
 */
export function generateNavItemsByRole(role: Role): NavItem[] {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return generateNavItemsByPermissions(NAV_ITEMS, permissions, role);
}
