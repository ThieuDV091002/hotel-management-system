import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Role } from "../context/Role";

import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; allowedRoles?: Role[] }[];
  allowedRoles?: Role[];
};

const navItems: NavItem[] = [
  {
    icon: <PageIcon />,
    name: "Home",
    path: "/",
    allowedRoles: [Role.ADMIN, Role.RECEPTIONIST, Role.HOUSEKEEPING, Role.MAINTENANCE, Role.SECURITY, Role.WAITER, Role.CHEF, Role.POS_SERVICE],
  },
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
    allowedRoles: [Role.ADMIN],
  },
  {
    icon: <TableIcon />,
    name: "Account Management",
    subItems: [
      { name: "Staff Table", path: "/employee-table", allowedRoles: [Role.ADMIN] },
      { name: "Customer Table", path: "/customer-table", allowedRoles: [Role.ADMIN] },
    ],
    allowedRoles: [Role.ADMIN],
  },
  {
    icon: <PageIcon />,
    name: "Loyalty Level",
    path: "/loyalty-level",
    allowedRoles: [Role.ADMIN],
  },
  {
    icon: <PageIcon />,
    name: "Room Management",
    path: "/room-table",
    allowedRoles: [Role.ADMIN, Role.RECEPTIONIST, Role.HOUSEKEEPING, Role.MAINTENANCE],
  },
  {
    icon: <TableIcon />,
    name: "Amenity Management",
    subItems: [
      { name: "Amenity", path: "/amenity", allowedRoles: [Role.ADMIN] },
      { name: "Amenity History", path: "/amenity-history", allowedRoles: [Role.ADMIN, Role.HOUSEKEEPING, Role.MAINTENANCE] },
    ],
    allowedRoles: [Role.ADMIN, Role.HOUSEKEEPING, Role.MAINTENANCE],
  },
  {
    icon: <TableIcon />,
    name: "Booking Management",
    subItems: [
      { name: "Booking", path: "/booking", allowedRoles: [Role.ADMIN, Role.RECEPTIONIST] },
      { name: "Guests", path: "/guest", allowedRoles: [Role.ADMIN, Role.RECEPTIONIST] },
    ],
    allowedRoles: [Role.ADMIN, Role.RECEPTIONIST],
  },
  {
    icon: <TableIcon />,
    name: "Customer Requests",
    subItems: [
      { name: "Housekeeping Request", path: "/hp-request", allowedRoles: [Role.ADMIN, Role.HOUSEKEEPING] },
      { name: "Service Request", path: "/service-request", allowedRoles: [Role.ADMIN, Role.POS_SERVICE] },
    ],
    allowedRoles: [Role.ADMIN, Role.HOUSEKEEPING, Role.POS_SERVICE],
  },
  {
    icon: <PageIcon />,
    name: "Bill Management",
    path: "/folio",
    allowedRoles: [Role.ADMIN, Role.RECEPTIONIST],
  },
  {
    icon: <PageIcon />,
    name: "Asset Management",
    path: "/asset",
    allowedRoles: [Role.ADMIN],
  },
  {
    icon: <PageIcon />,
    name: "Service Management",
    path: "/services",
    allowedRoles: [Role.ADMIN],
  },
  {
    icon: <TableIcon />,
    name: "Inventory Management",
    subItems: [
      { name: "Suppliers", path: "/supplier", allowedRoles: [Role.ADMIN] },
      { name: "Inventory", path: "/inventory", allowedRoles: [Role.ADMIN] },
      { name: "Inventory Receipt", path: "/inventory-receipt", allowedRoles: [Role.ADMIN] },
    ],
    allowedRoles: [Role.ADMIN],
  },
  {
    icon: <TableIcon />,
    name: "Expense Management",
    subItems: [
      { name: "Salary", path: "/salary", allowedRoles: [Role.ADMIN] },
      { name: "Operating Expense", path: "/op-expense", allowedRoles: [Role.ADMIN] },
    ],
    allowedRoles: [Role.ADMIN],
  },
  {
    icon: <PageIcon />,
    name: "Audit Report",
    path: "/audit-report",
    allowedRoles: [Role.ADMIN],
  },
  {
    icon: <PageIcon />,
    name: "Feedback",
    path: "/feedback",
    allowedRoles: [Role.ADMIN],
  },
  {
    icon: <TableIcon />,
    name: "Housekeeping Schedule",
    subItems: [
      { name: "Housekeeping Schedule", path: "/housekeeping-schedule", allowedRoles: [Role.ADMIN] },
      { name: "My task", path: "/my-hp-schedule", allowedRoles: [Role.HOUSEKEEPING] },
    ],
    allowedRoles: [Role.ADMIN, Role.HOUSEKEEPING],
  },
  {
    icon: <TableIcon />,
    name: "Maintenance Schedule",
    subItems: [
      { name: "Maintenance Schedule", path: "/maintenance-schedule", allowedRoles: [Role.ADMIN] },
      { name: "My task", path: "/my-mt-schedule", allowedRoles: [Role.MAINTENANCE] },
    ],
    allowedRoles: [Role.ADMIN, Role.MAINTENANCE],
  },
  {
    icon: <TableIcon />,
    name: "Work Schedule",
    subItems: [
      { name: "Work Schedule", path: "/work-schedule", allowedRoles: [Role.ADMIN] },
      { name: "My schedule", path: "/my-schedule", allowedRoles: [Role.RECEPTIONIST, Role.HOUSEKEEPING, Role.MAINTENANCE, Role.SECURITY, Role.WAITER, Role.CHEF, Role.POS_SERVICE] },
    ],
    allowedRoles: [Role.ADMIN, Role.RECEPTIONIST, Role.HOUSEKEEPING, Role.MAINTENANCE, Role.SECURITY, Role.WAITER, Role.CHEF, Role.POS_SERVICE],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    if (!user || !user.role) {
      return (
        <div className="text-gray-500 p-4">
          Please log in to view the menu.
        </div>
      );
    }

    const filteredItems = items.filter((nav) =>
      nav.allowedRoles ? nav.allowedRoles.includes(user?.role) : true
    );

    return (
      <ul className="flex flex-col gap-4">
        {filteredItems.map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              nav.subItems.some((subItem) =>
                subItem.allowedRoles ? subItem.allowedRoles.includes(user?.role) : true
              ) && (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
                </button>
              )
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems
                    .filter((subItem) =>
                      subItem.allowedRoles ? subItem.allowedRoles.includes(user?.role) : true
                    )
                    .map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden invert"
                src="/images/product/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/product/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/product/logo.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;