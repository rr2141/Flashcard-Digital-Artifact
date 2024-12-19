import React from 'react';
import {
  Disclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';

//Ref https://tailwindui.com/components/application-ui/navigation/navbars

//Navigation Bar
const navigation = [
  { name: 'Create', href: '/create', current: false },
  { name: 'Flashcards', href: '/my-flashcards', current: false },
  { name: 'Collections', href: '/collection', current: false },
  { name: 'Admin Dashboard', href: '/admin-dashboard', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navigation({ username = 'User', onLogout, isAdmin }) {
  const navigate = useNavigate();

  const handleAdminClick = (e) => {
    if (!isAdmin) {
      e.preventDefault();
      alert('You are not authorised to access the Admin Dashboard!');
    } else {
      navigate('/admin-dashboard');
    }
  };

  return (
    <Disclosure as="nav" className="bg-purple-100">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo and Navigation Links */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <span className="text-purple-800 text-lg font-bold ml-2">TestVar</span>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={item.name === 'Admin Dashboard' ? handleAdminClick : null}
                    className={classNames(
                      item.current
                        ? 'bg-purple-300 text-purple-900'
                        : 'text-purple-700 hover:bg-purple-200 hover:text-purple-900',
                      'rounded-md px-3 py-2 text-sm font-medium',
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="relative flex rounded-full bg-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 px-4 py-2">
                  <span className="sr-only">Open user menu</span>
                  {username}
                </MenuButton>
              </div>
              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                <MenuItem>
                  <Link
                    to='/settings'
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-100"
                  >
                    Settings
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={onLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-purple-100"
                  >
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={item.href}
              onClick={item.name === 'Admin Dashboard' ? handleAdminClick : null}
              className={classNames(
                item.current
                  ? 'bg-purple-300 text-purple-900'
                  : 'text-purple-700 hover:bg-purple-200 hover:text-purple-900',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}