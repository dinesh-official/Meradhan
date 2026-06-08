import { NAV_ITEMS, NavItem } from '../constants/navlinks.constants';
import type { Role } from '../constants/role.constants';

function hasActionAccess(
  sessionPermissions: string[],
  actionKeys: string[],
  role: Role,
  isImpersonating: boolean,
): boolean {
  if (role === "SUPER_ADMIN" && !isImpersonating) return true;
  if (!actionKeys.length) return true;
  if (!sessionPermissions.length) return false;
  return actionKeys.some((key) => sessionPermissions.includes(key));
}

function generateNavItemsByPermissions(
  navItems: NavItem[],
  userRole: Role,
  sessionPermissions: string[],
  isImpersonating: boolean,
): NavItem[] {
  const hasAccess = (item: NavItem): boolean => {
    if (item.roles && !item.roles.includes(userRole)) {
      return false;
    }
    if (!item.actionKeys?.length) return true;
    return hasActionAccess(
      sessionPermissions,
      item.actionKeys,
      userRole,
      isImpersonating,
    );
  };

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .map((item) => {
        let filteredChildren: NavItem[] | undefined;

        if (item.children) {
          filteredChildren = filterNavItems(item.children);
        }

        if (
          hasAccess(item) ||
          (filteredChildren && filteredChildren.length > 0)
        ) {
          return {
            ...item,
            children: filteredChildren,
          } as NavItem;
        }

        return null;
      })
      .filter((item): item is NavItem => item !== null);
  };

  return filterNavItems(navItems);
}

/** Filter nav items using session permissions from the database. */
export function generateNavItemsByRole(
  role: Role,
  sessionPermissions: string[] = [],
  isImpersonating = false,
): NavItem[] {
  return generateNavItemsByPermissions(
    NAV_ITEMS,
    role,
    sessionPermissions,
    isImpersonating,
  );
}
